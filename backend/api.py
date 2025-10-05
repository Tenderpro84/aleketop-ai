import os, io
import pandas as pd
from fastapi import FastAPI, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

EXCEL_PATH = os.getenv("OUTPUT", "тендеры.xlsx")

app = FastAPI(title="TenderAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/ping")
async def ping():
    return {"status": "ok", "message": "TenderAI backend is running ✅"}

@app.get("/api/tenders")
async def get_tenders(q: Optional[str] = Query(None)):
    if not os.path.exists(EXCEL_PATH):
        return Response(content="Файл не найден", status_code=404)
    df = pd.read_excel(EXCEL_PATH)
    if q:
        df = df[df.astype(str).apply(lambda x: x.str.contains(q, case=False, na=False)).any(axis=1)]
    output = io.StringIO()
    df.to_csv(output, index=False)
    return Response(content=output.getvalue(), media_type="text/csv")
