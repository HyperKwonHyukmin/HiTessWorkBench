from pydantic import BaseModel
from typing import List, Optional


# 1. 로그인 요청 시 받을 데이터 (사번만 받음)
class LoginRequest(BaseModel):
  employee_id: str


# 2. 사용자 등록 요청 시 받을 데이터 (회원가입용)
class UserCreate(BaseModel):
  employee_id: str
  name: str
  company: str
  position: str


# 3. 프론트엔드에게 응답으로 줄 데이터 (User 정보)
class UserResponse(BaseModel):
  id: int
  employee_id: str
  name: str
  company: str
  position: str
  is_active: bool = False  # 승인 여부 (로그인 시 체크)
  is_admin: bool = False  # 관리자 여부 (관리자 메뉴 표시용)

  class Config:
    orm_mode = True  # SQLAlchemy 모델을 Pydantic으로 변환 허용
