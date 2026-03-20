from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, Float
from sqlalchemy.sql import func
from .database import Base
from datetime import datetime

class User(Base):
  __tablename__ = "users"
  id = Column(Integer, primary_key=True, index=True)
  employee_id = Column(String(50), unique=True, index=True)
  name = Column(String(50))
  company = Column(String(100))
  department = Column(String(100), nullable=True)
  position = Column(String(50))
  is_active = Column(Boolean, default=False)
  is_admin = Column(Boolean, default=False)

  login_count = Column(Integer, default=0)  # 로그인 횟수 (기본값 0)
  last_login = Column(DateTime(timezone=True), nullable=True)  # 마지막 로그인 시간
  created_at = Column(DateTime(timezone=True), default=datetime.now)

class Analysis(Base):
  __tablename__ = "analysis"
  id = Column(Integer, primary_key=True, index=True)
  project_name = Column(String(200), nullable=True)  # [추가] 프로젝트/작업명
  program_name = Column(String(100))  # 해석 종류 (예: TrussModelBuilder)
  employee_id = Column(String(50), index=True)  # 요청자 사번
  status = Column(String(50))  # Success, Failed
  # 파일 메타데이터를 JSON으로 저장
  input_info = Column(JSON)  # 예: {"node": "경로...", "member": "경로..."}
  result_info = Column(JSON)  # 예: {"bdf": "경로...", "log": "경로..."}
  created_at = Column(DateTime(timezone=True), server_default=func.now())

# [기존 Analysis 클래스 아래에 다음 코드 추가]

class Notice(Base):
    __tablename__ = "notices"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50))  # Update, Notice 등
    title = Column(String(200))
    content = Column(String(2000))
    is_pinned = Column(Boolean, default=False)
    author_id = Column(String(50))
    created_at = Column(DateTime(timezone=True), default=datetime.now)


class UserGuide(Base):
    __tablename__ = "user_guides"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100))
    title = Column(String(200))
    content = Column(String(5000))
    author_id = Column(String(50))
    created_at = Column(DateTime(timezone=True), default=datetime.now)


class FeatureRequest(Base):
  __tablename__ = "feature_requests"
  id = Column(Integer, primary_key=True, index=True)
  title = Column(String(200))
  content = Column(String(2000))
  status = Column(String(50), default="Under Review")
  upvotes = Column(Integer, default=0)
  comments_count = Column(Integer, default=0)
  author_id = Column(String(50))
  author_name = Column(String(50))

  # [신규 추가] 관리자 피드백 댓글 컬럼
  admin_comment = Column(String(2000), nullable=True)

  created_at = Column(DateTime(timezone=True), default=datetime.now)
