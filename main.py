from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.responses import FileResponse
import urllib.parse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, database
import subprocess
import os
from datetime import datetime  # <--- 이 부분이 핵심입니다.

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
  return {"status": "ok", "message": "kwonhyukmin"}


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
    department=user.department,
    position=user.position,
    # permissions=user.permissions,  <-- 삭제됨
    is_active=False,  # 기본값: 승인 대기
    is_admin=False  # 기본값: 일반 유저
  )

  db.add(new_user)
  db.commit()
  db.refresh(new_user)

  return new_user

# main.py에 추가

# 유저 목록 조회
@app.get("/api/users")
def get_users(db: Session = Depends(database.get_db)):
    return db.query(models.User).all()

# 유저 상태 업데이트 (승인/관리자 권한)
@app.put("/api/users/{user_id}")
def update_user(user_id: int, update_data: dict, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    return {"message": "Update successful"}

# 유저 삭제
@app.delete("/api/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


# ----------------------------------------------------
# [추가] 사용자의 해석 이력 조회 API
# ----------------------------------------------------
@app.get("/api/analysis/history/{employee_id}")
def get_analysis_history(employee_id: str, db: Session = Depends(database.get_db)):
  # 최신순으로 정렬하여 이력 가져오기
  history = db.query(models.Analysis).filter(models.Analysis.employee_id == employee_id).order_by(
    models.Analysis.created_at.desc()).all()
  return history

@app.get("/api/download")
def download_file(filepath: str):
  # URL 인코딩된 파일 경로 디코딩
  decoded_path = urllib.parse.unquote(filepath)

  if not os.path.exists(decoded_path):
    raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다.")

  filename = os.path.basename(decoded_path)
  return FileResponse(path=decoded_path, filename=filename, media_type='application/octet-stream')


@app.post("/api/analysis/trussmodelbuilder")
async def run_truss_model_builder(
        node_file: UploadFile = File(...),
        member_file: UploadFile = File(...),
        employee_id: str = Form(...),
        db: Session = Depends(database.get_db)
):
  # 1. 경로 설정 (main.py 위치 기준 부모 폴더 계산)
  base_dir = os.path.dirname(os.path.abspath(__file__))
  parent_dir = os.path.dirname(base_dir)

  # 2. 사용자별 고유 작업 폴더 생성 (userConnection/사번_시간)
  timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
  unique_folder = f"{employee_id}_{timestamp}"
  work_dir = os.path.abspath(os.path.join(parent_dir, "userConnection", unique_folder))
  os.makedirs(work_dir, exist_ok=True)

  # 3. 파일 저장 절대 경로 설정
  node_path = os.path.join(work_dir, node_file.filename)
  member_path = os.path.join(work_dir, member_file.filename)

  # 4. 클라이언트가 보낸 CSV 파일 실제 저장
  try:
    with open(node_path, "wb") as buffer:
      buffer.write(await node_file.read())
    with open(member_path, "wb") as buffer:
      buffer.write(await member_file.read())
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"File save error: {str(e)}")

  # 5. EXE 프로그램 경로 및 데이터 구조화
  exe_dir = os.path.abspath(os.path.join(parent_dir, "InHouseProgram", "TrussModelBuilder"))
  exe_path = os.path.join(exe_dir, "TrussModelBuilder.exe")

  # JSON 컬럼에 넣을 데이터 딕셔너리
  input_data = {
    "node_csv": node_path,
    "member_csv": member_path
  }
  result_data = {}

  status_msg = "Success"
  engine_output = ""
  final_bdf_path = None

  # 6. 프로그램 실행 로직
  if not os.path.exists(exe_path):
    status_msg = "Failed"
    engine_output = f"Executable not found: {exe_path}"
  else:
    cmd_args = [exe_path, exe_dir, node_path, member_path]
    try:
      # 외부 EXE 실행 대기
      result = subprocess.run(cmd_args, capture_output=True, text=True, check=True)
      engine_output = result.stdout

      # ✅ [핵심 변경 포인트] 해석 종료 후 폴더를 스캔하여 확장자가 .bdf인 파일 찾기
      bdf_files = [f for f in os.listdir(work_dir) if f.endswith('.bdf')]

      if bdf_files:
        # 찾은 첫 번째 bdf 파일의 절대 경로를 추출
        final_bdf_path = os.path.join(work_dir, bdf_files[0])
        result_data = {"bdf": final_bdf_path}
      else:
        # EXE가 정상 종료되었으나 bdf 파일이 없는 경우 (해석 내부 실패)
        status_msg = "Failed"
        engine_output += "\n[Error] Engine execution finished, but no .bdf file was created."

    except subprocess.CalledProcessError as e:
      status_msg = "Failed"
      engine_output = e.stderr if e.stderr else e.stdout
    except Exception as e:
      status_msg = "Failed"
      engine_output = f"System Error: {str(e)}"

    # 7. DB 기록
    project_data = None
    try:
      new_analysis = models.Analysis(
        project_name=f"Truss_Job_{timestamp}",
        program_name="TrussModelBuilder",
        employee_id=employee_id,
        status=status_msg,
        input_info=input_data,
        result_info=result_data if status_msg == "Success" else None
      )
      db.add(new_analysis)
      db.commit()
      db.refresh(new_analysis)  # 생성된 ID와 시간 가져오기

      # 프론트엔드 모달에 띄워줄 데이터 구성
      project_data = {
        "id": new_analysis.id,
        "project_name": new_analysis.project_name,
        "program_name": new_analysis.program_name,
        "employee_id": new_analysis.employee_id,
        "status": new_analysis.status,
        "input_info": new_analysis.input_info,
        "result_info": new_analysis.result_info,
        "created_at": new_analysis.created_at.isoformat() if new_analysis.created_at else datetime.now().isoformat()
      }
    except Exception as db_e:
      print(f"DB 기록 오류: {str(db_e)}")

    # 8. 최종 응답 반환
    return {
      "status": status_msg,
      "engine_log": engine_output,
      "bdf_path": final_bdf_path if status_msg == "Success" else None,
      "project": project_data  # <--- 이 부분이 추가됨!
    }
