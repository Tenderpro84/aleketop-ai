import os
from fastapi import FastAPI

app = FastAPI()

@app.get("/api/ping")
def ping():
    return {"status": "ok", "message": "TenderAI backend is running ✅"}

@app.get("/api/parse")
def parse():
    categories = [c.strip() for c in os.getenv("PARSE_CATEGORIES", "").split(",") if c.strip()]
    return {
        "ok": True,
        "message": "Парсер готов к запуску 🚀",
        "categories": categories
    }
