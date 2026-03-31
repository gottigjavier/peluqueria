from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import routers
from app.core.database import engine, Base
from app.models import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Salon Management API",
    description="API para gestión integral de servicios de estética",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routers.router, prefix="/api/v1", tags=["API"])


@app.get("/")
def root():
    return {"message": "Salon Management API", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
