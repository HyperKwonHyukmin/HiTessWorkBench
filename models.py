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
  program_name = Column(String(100))
  employee_id = Column(String(50), index=True)
  status = Column(String(50))

  # 향후 다운로드를 위해 파일의 '절대 경로'를 저장합니다.
  node_file_path = Column(String(500))
  member_file_path = Column(String(500))
  result_bdf_path = Column(String(500))  # 결과 BDF 파일 주소

  created_at = Column(DateTime(timezone=True), server_default=func.now())
