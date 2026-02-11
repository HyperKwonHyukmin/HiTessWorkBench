from sqlalchemy import Column, Integer, String, JSON, Boolean  # Boolean 추가
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
