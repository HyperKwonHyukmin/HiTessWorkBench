from fastapi import FastAPI, Depends, HTTPException, status, FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, database
import subprocess, os, datetime

# DB 테이블 자동 생성 (테이블이 없을 때만 생성됨)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# CORS 설정
origins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],  # 모든 IP 허용
  allow_credentials=False,  # [중요] * 와 함께 쓸 때는 False여야 함 (JWT/세션 쿠키 안 쓸 경우)
  allow_methods=["*"],
  allow_headers=["*"],
)

# ==========================================
# [설정] 서버 버전 (클라이언트와 일치해야 함)
# ==========================================
SERVER_VERSION = "1.0.0"


# 1. 서버 버전 확인 API
@app.get("/api/version")
def check_version():
  return {"version": SERVER_VERSION}


# 2. 헬스 체크 API
@app.get("/")
def health_check():
  return {"status": "ok", "message": "HiTESS Server is running"}


# 3. 로그인 API
@app.post("/api/login", response_model=schemas.UserResponse)
def login(request: schemas.LoginRequest, db: Session = Depends(database.get_db)):
  user = db.query(models.User).filter(models.User.employee_id == request.employee_id).first()

  if not user:
    raise HTTPException(status_code=404, detail="User not found")

  if not user.is_active:
    raise HTTPException(status_code=403, detail="Approval Pending")

  return user


# 4. 회원가입 API (수정됨: permissions 제거)
@app.post("/api/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
  existing_user = db.query(models.User).filter(models.User.employee_id == user.employee_id).first()
  if existing_user:
    raise HTTPException(status_code=400, detail="Employee ID already registered")

  new_user = models.User(
    employee_id=user.employee_id,
    name=user.name,
    company=user.company,
    position=user.position,
    # permissions=user.permissions,  <-- 삭제됨
    is_active=False,  # 기본값: 승인 대기
    is_admin=False  # 기본값: 일반 유저
  )

  db.add(new_user)
  db.commit()
  db.refresh(new_user)

  return new_user


# ==========================================
# [신규 추가] 해석 실행 및 DB 기록 API
# ==========================================
@app.post("/api/analysis/trussmodelbuilder")
async def run_truss_model_builder(
        node_file: UploadFile = File(...),
        member_file: UploadFile = File(...),
        employee_id: str = Form(...),
        db: Session = Depends(database.get_db)
):
  # 1. 경로 설정 (main.py의 현재 폴더와 부모 폴더 계산)
  current_dir = os.path.dirname(os.path.abspath(__file__))
  parent_dir = os.path.dirname(current_dir)  # main.py의 부모 폴더

  # 2. 사용자별 고유 작업 폴더 생성 (userConnection 폴더 내부)
  # 폴더명 포맷: 사번_연월일_시분초 (예: A123456_20260305_143000)
  timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
  unique_folder_name = f"{employee_id}_{timestamp}"
  work_dir_abs = os.path.join(parent_dir, "userConnection", unique_folder_name)

  os.makedirs(work_dir_abs, exist_ok=True)

  # 파일이 저장될 절대 경로
  node_path_abs = os.path.join(work_dir_abs, node_file.filename)
  member_path_abs = os.path.join(work_dir_abs, member_file.filename)

  # 💡 [주의] EXE가 뱉어내는 실제 BDF 파일 이름으로 맞춰주세요. (예: result.bdf)
  resultBdfName = node_file.filename.split(".")[0] + ".bdf"
  result_bdf_path_abs = os.path.join(work_dir_abs, resultBdfName)

  # 3. 클라이언트가 보낸 CSV 파일 저장
  with open(node_path_abs, "wb") as f:
    f.write(await node_file.read())
  with open(member_path_abs, "wb") as f:
    f.write(await member_file.read())

  # 4. EXE 프로그램 경로 및 실행
  exe_dir_abs = os.path.join(parent_dir, "InHouseProgram", "TrussModelBuilder")
  exe_path_abs = os.path.join(exe_dir_abs, "TrussModelBuilder.exe")

  status_msg = "Success"
  engine_output = ""

  try:
    # 5. 요구하신 cmd 명령어 구조 조립
    # "TrussModelBuilder.exe(절대경로)" "exe가 존재하는 폴더위치" "Node.csv 절대위치" "Member.csv 절대위치"
    cmd_args = [
      exe_path_abs,  # 1. exe 절대경로
      exe_dir_abs,  # 2. exe가 존재하는 폴더위치
      node_path_abs,  # 3. Node.csv 절대위치
      member_path_abs  # 4. Member.csv 절대위치
    ]

    # 외부 프로그램 실행
    result = subprocess.run(
      cmd_args,
      capture_output=True,
      text=True,
      check=True
    )
    engine_output = result.stdout

  except subprocess.CalledProcessError as e:
    status_msg = "Failed"
    engine_output = e.stderr if e.stderr else e.stdout
  except Exception as e:
    status_msg = "Failed"
    engine_output = f"Execution Error: {str(e)}\n경로를 확인하세요: {exe_path_abs}"

  # 6. DB에 절대 경로 및 이력 저장
  new_log = models.AnalysisLog(
    program_name="TrussModelBuilder",
    employee_id=employee_id,
    status=status_msg,
    node_file_path=node_path_abs,
    member_file_path=member_path_abs,
    result_bdf_path=result_bdf_path_abs if status_msg == "Success" else None
  )
  db.add(new_log)
  db.commit()

  # 7. 클라이언트 응답 (향후 다운로드 시 이 bdf_path를 사용)
  return {
    "status": status_msg,
    "engine_log": engine_output,
    "bdf_path": result_bdf_path_abs if status_msg == "Success" else None
  }
