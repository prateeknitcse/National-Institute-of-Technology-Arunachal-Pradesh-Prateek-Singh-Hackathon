from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.db.connection import SessionLocal
from src.db.models import RiskSignal
from src.stress_test.trigger import check_and_run_stress_tests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/signals/latest")
def latest_signals(company: str = None, limit: int = 20):
    session = SessionLocal()
    query = session.query(RiskSignal).order_by(RiskSignal.created_at.desc())
    if company:
        query = query.filter(RiskSignal.company == company)
    results = query.limit(limit).all()
    session.close()
    return [
        {"company": r.company, "sentiment": r.sentiment_score, "event_type": r.event_type, "impact": r.impact_score}
        for r in results
    ]

@app.get("/stress-test/run")
def trigger_stress_tests():
    return check_and_run_stress_tests()