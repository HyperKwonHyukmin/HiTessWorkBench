from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# 1. 로그인 요청 시 받을 데이터 (사번만 받음)
class LoginRequest(BaseModel):
  employee_id: str


# 2. 사용자 등록 요청 시 받을 데이터 (회원가입용)
class UserCreate(BaseModel):
  employee_id: str
  name: str
  company: str
  department: str
  position: str


# 3. 프론트엔드에게 응답으로 줄 데이터 (User 정보)
class UserResponse(BaseModel):
  id: int
  employee_id: str
  name: str
  company: str
  department: Optional[str] = None
  position: str
  is_active: bool = False  # 승인 여부 (로그인 시 체크)
  is_admin: bool = False  # 관리자 여부 (관리자 메뉴 표시용)
  login_count: int
  last_login: Optional[datetime] = None
  created_at: Optional[datetime] = None

  class Config:
    orm_mode = True  # SQLAlchemy 모델을 Pydantic으로 변환 허용

# [기존 UserResponse 아래에 추가]

# --- Notice 스키마 ---
class NoticeCreate(BaseModel):
    type: str
    title: str
    content: str
    is_pinned: bool
    author_id: str

class NoticeResponse(NoticeCreate):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

# --- Feature Request 스키마 ---
class FeatureRequestCreate(BaseModel):
    title: str
    content: str
    author_id: str
    author_name: str

class FeatureRequestResponse(FeatureRequestCreate):
    id: int
    status: str
    upvotes: int
    comments_count: int
    created_at: datetime
    class Config:
        orm_mode = True

class FeatureRequestComment(BaseModel):
  status: str
  admin_comment: str

# --- User Guide 스키마 ---
class UserGuideCreate(BaseModel):
    category: str
    title: str
    content: str
    author_id: str

class UserGuideResponse(UserGuideCreate):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

# --- Feature Request 스키마 ---
class FeatureRequestCreate(BaseModel):
    title: str
    content: str
    author_id: str
    author_name: str

class FeatureRequestResponse(FeatureRequestCreate):
    id: int
    status: str
    upvotes: int
    comments_count: int
    admin_comment: Optional[str] = None  # [추가]
    created_at: datetime
    class Config:
        orm_mode = True

# [추가] 관리자 댓글용 스키마
class FeatureRequestComment(BaseModel):
    status: str
    admin_comment: str
