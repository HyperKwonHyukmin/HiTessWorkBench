from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
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

class AnalysisLog(Base):
  __tablename__ = "analysis_logs"

  id = Column(Integer, primary_key=True, index=True)
  program_name = Column(String(100))  # 프로그램 이름 (예: Truss Analysis)
  employee_id = Column(String(50), index=True)  # 요청한 사용자 사번
  status = Column(String(50))  # 상태 (Success, Failed 등)
  node_file_name = Column(String(255))  # 업로드된 Node 파일명
  member_file_name = Column(String(255))  # 업로드된 Member 파일명
  created_at = Column(DateTime(timezone=True), server_default=func.now())  # 사용(요청) 시간
