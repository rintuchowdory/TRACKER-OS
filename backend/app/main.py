from fastapi import FastAPI

app = FastAPI(title="TRACKER OS API")

@app.get("/health")
def health():
    return {"status": "ok"}
