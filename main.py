from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, database

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
  allow_origins=["*"],
  # allow_origins=origins,
  allow_credentials=True,
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
