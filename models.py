from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from database import Base
from datetime import datetime

class UserDB(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True)

    password = Column(String)


class NoteDB(Base):

    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String)

    content = Column(String)

    category = Column(String)

    owner = Column(String, ForeignKey("users.username"))
    created_at = Column(String)
    pinned = Column(Boolean, default=False)
    

    

class APITestDB(Base):

    __tablename__ = "api_tests"

    id = Column(Integer, primary_key=True, index=True)

    url = Column(String)

    method = Column(String)

    status_code = Column(Integer)

    response_time = Column(String)

    result = Column(String)

    owner = Column(String)

    created_at = Column(String)

