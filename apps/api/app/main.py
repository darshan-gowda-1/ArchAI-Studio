"""
ArchAI Studio v3 - FastAPI Backend Application Entrypoint
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apps.api.app.config import settings
from apps.api.app.api.v1.router import api_v1_router

app = FastAPI(
    title="ArchAI Studio v3 API",
    version="3.0.0",
    description="Enterprise Architectural Design, Procedural Geometry, NSGA-II Genetic Optimization, and Open BIM Engine",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 aggregate router
app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "service": "ArchAI Studio v3 API",
        "status": "HEALTHY",
        "version": "3.0.0",
        "architecture": "Monorepo v3 Canonical Building Model",
        "engines": {
            "geometry": "Shapely + NumPy + trimesh",
            "optimizer": "NSGA-II Multi-Objective",
            "compliance": "NBC 2016 / IBC",
            "bim": "IFC4 + DXF + Speckle + APS",
            "ai": "OpenAI Structured Validator"
        }
    }


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "3.0.0"}
