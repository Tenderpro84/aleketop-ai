from fastapi import FastAPI
import os

app = FastAPI()

@app.get("/api/ping")
def ping():
    return {"status": "ok", "message": "TenderAI backend is running ✅"}

@app.get("/api/parse")
def parse():
    raw = os.getenv("PARSE_CATEGORIES", "")
    categories = [c.strip() for c in raw.split(",") if c.strip()]
    return {
        "ok": True,
        "message": "Парсер готов к запуску 🚀",
        "categories": categories
    }
