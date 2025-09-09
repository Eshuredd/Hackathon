from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .db import Base, engine
from starlette.middleware.sessions import SessionMiddleware

from .routers import auth as auth_router
from .routers import groceries as grocery_router

app = FastAPI(title="Grocery Deal Scout Backend", version="0.1.0")



app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# session middleware for simple server-side cart storage
app.add_middleware(SessionMiddleware, secret_key="change-me-in-env")


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


app.include_router(auth_router.router, prefix="/auth", tags=["auth"])
app.include_router(grocery_router.router, prefix="/grocery", tags=["grocery"])


@app.get("/health")
async def health():
    return {"status": "ok", "env": settings.env}
