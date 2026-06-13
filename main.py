from fastapi import FastAPI, Depends, HTTPException
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field
from passlib.context import CryptContext
from database import engine
from database import Base
from models import UserDB, NoteDB, APITestDB
from database import SessionLocal
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

print("MAIN.PY LOADED 🔥")
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="login"
)

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)
def hash_password(password):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )
def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt
def verify_token(token: str):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM]
    )

    username = payload.get("sub")

    return username
Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {
        "message": "Smart API Assistant Running Successfully"
    }


@app.get("/health")
def health_check():
    return {
        "status": "API is healthy",
        "code": 200
    }
from pydantic import BaseModel


class User(BaseModel):
    username: str
    password: str
class Note(BaseModel):

    
    title: str

    content: str

    category: str

class APITest(BaseModel):

    url: str

    method: str

    status_code: int

    response_time: str

    result: str


@app.post("/create-user")
def create_user(user: User):
    return {
        "message": "User created successfully",
        "user": user
    }
@app.post("/register")
def register(user: User):

    db = SessionLocal()

    new_user = UserDB(
        username=user.username,
        password=hash_password(user.password)
    )

    db.add(new_user)

    db.commit()

    db.close()

    return {
        "message": "User registered successfully"
    }
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):

    db = SessionLocal()

    existing_user = db.query(UserDB).filter(
        UserDB.username == form_data.username
    ).first()

    if existing_user and verify_password(
        form_data.password,
        existing_user.password
    ):

        token = create_access_token(
            data={"sub": existing_user.username}
        )

        db.close()

        return {
            "access_token": token,
            "token_type": "bearer"
        }

    db.close()

    raise HTTPException(
        status_code=401,
        detail="Invalid username or password"
    )


# PASTE HERE
def verify_token(token: str):

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )


        return payload

    except Exception as e:

        print("JWT ERROR =", e)

        return {
            "error": str(e)
        }

@app.get("/profile")
def profile(token: str = Depends(oauth2_scheme)):

    user_data = verify_token(token)

    return {
        "message": "Protected Route Accessed",
        "user": user_data
    }
@app.post("/create-note")
@app.post("/create-note")
def create_note(
    note: Note,
    token: str = Depends(oauth2_scheme)
):

    user = verify_token(token)

    if "error" in user:
        return {
            "message": "Invalid token"
        }

    db = SessionLocal()

    new_note = NoteDB(
        title=note.title,

    content=note.content,

    category=note.category,

    owner=user["sub"],
    created_at=str(datetime.now()),
    pinned=False,
)
    db.add(new_note)
    db.commit()

    db.close()

    return {
        "message": "Note created successfully"
    }

@app.put("/update-note/{note_id}")
def update_note(
    note_id: int,
    note: Note,
    token: str = Depends(oauth2_scheme)
):

    user = verify_token(token)

    if "error" in user:
        return {
            "message": "Invalid token"
        }

    db = SessionLocal()

    existing_note = db.query(NoteDB).filter(
        NoteDB.id == note_id,
        NoteDB.owner == user["sub"]
    ).first()

    if not existing_note:

        db.close()

        return {
            "message": "Note not found"
        }

    existing_note.title = note.title
    existing_note.content = note.content

    db.commit()

    db.close()

    return {
        "message": "Note updated successfully"
    }
@app.delete("/delete-note/{note_id}")
def delete_note(
    note_id: int,
    token: str = Depends(oauth2_scheme)
):

    user = verify_token(token)

    if "error" in user:
        return {
            "message": "Invalid token"
        }

    db = SessionLocal()

    existing_note = db.query(NoteDB).filter(
        NoteDB.id == note_id,
        NoteDB.owner == user["sub"]
    ).first()

    if not existing_note:

        db.close()

        return {
            "message": "Note not found"
        }

    db.delete(existing_note)

    db.commit()

    db.close()

    return {
        "message": "Note deleted successfully"
    }
@app.get("/my-notes")
def get_my_notes(token: str = Depends(oauth2_scheme)):


    try:
        user = verify_token(token)

    except Exception as e:
        print("VERIFY TOKEN ERROR =", e)

        return {
            "error": str(e)
        }

    if "error" in user:
        return {
            "message": "Invalid token"
        }

    username = user["sub"]

    db = SessionLocal()

    notes = db.query(NoteDB).filter(
        NoteDB.owner == username
    ).all()

    db.close()

    return notes
class TestUser(BaseModel):
    name: str
    age: int


@app.post("/test-user")
def test_user(data: TestUser):

    if data.name.strip() == "":
        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty"
        )

    if "<script>" in data.name.lower():
        raise HTTPException(
            status_code=400,
            detail="XSS detected"
        )

    if "or 1=1" in data.name.lower():
        raise HTTPException(
            status_code=400,
            detail="SQL Injection detected"
        )

    return {
        "message": "User Valid"
    }

@app.put("/toggle-pin/{note_id}")
def toggle_pin(
    note_id: int,
    token: str = Depends(oauth2_scheme)
):

    user = verify_token(token)

    db = SessionLocal()

    note = db.query(NoteDB).filter(
        NoteDB.id == note_id,
        NoteDB.owner == user["sub"]
    ).first()

    if note:

        note.pinned = not note.pinned

        db.commit()

    db.close()

    return {
        "message": "Pin updated"
    }
@app.post("/save-api-test")
def save_api_test(
    api_test: APITest
):


    db = SessionLocal()

    new_test = APITestDB(
        url=api_test.url,
        method=api_test.method,
        status_code=api_test.status_code,
        response_time=api_test.response_time,
        result=api_test.result,
        owner="testuser",
        created_at=str(datetime.now())
    )

    db.add(new_test)

    db.commit()

    db.close()

    return {
        "message": "API Test Saved"
    }
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
