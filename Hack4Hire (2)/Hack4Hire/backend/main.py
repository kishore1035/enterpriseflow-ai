from contextlib import asynccontextmanager

from fastapi import FastAPI

from .api.routes import router
from .db.session import init_db


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Employee Onboarding API", lifespan=lifespan)
app.include_router(router)
