from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import routers, auth
from app.core.database import engine, Base, SessionLocal
from app.models import models
from app.core.security import get_password_hash
from app.models.models import User


def seed_initial_users():
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.username == "admin").first():
            db.add(
                User(
                    username="admin",
                    hashed_password=get_password_hash("stegmann13"),
                    role="admin",
                )
            )
        if not db.query(User).filter(User.username == "user").first():
            db.add(
                User(
                    username="user",
                    hashed_password=get_password_hash("stegmann"),
                    role="user",
                )
            )
        if not db.query(User).filter(User.username == "guest").first():
            db.add(
                User(
                    username="guest",
                    hashed_password=get_password_hash("password"),
                    role="guest",
                )
            )
        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_initial_users()
    yield


app = FastAPI(
    title="Salon Management API",
    description="API para gestión integral de servicios de estética",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routers.router, prefix="/api/v1", tags=["API"])
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])


@app.get("/")
def root():
    return {"message": "Salon Management API", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
