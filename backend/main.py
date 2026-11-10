from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import seed
from config import CORS_ORIGINS
from routers import alunos, auth, ia, lancamentos, turmas


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed.load_seed_data()
    yield


app = FastAPI(title="Inteligência contra evasão escolar", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(turmas.router)
app.include_router(alunos.router)
app.include_router(lancamentos.router)
app.include_router(ia.router)


@app.get("/", tags=["Status"])
def health_check():
    return {"status": "ok"}
