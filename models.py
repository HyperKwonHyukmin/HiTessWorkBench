from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, Float
from sqlalchemy.sql import func
from .database import Base

class User(Base):
  __tablename__ = "users"
  id = Column(Integer, primary_key=True, index=True)
  employee_id = Column(String(50), unique=True, index=True)
  name = Column(String(50))
  company = Column(String(100))
  position = Column(String(50))
  is_active = Column(Boolean, default=False)
  is_admin = Column(Boolean, default=False)

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
