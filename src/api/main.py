from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, case
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

@app.get("/signals/by-company")
def signals_by_company():
    session = SessionLocal()
    results = session.query(
        RiskSignal.company,
        func.avg(RiskSignal.impact_score).label('avg_impact'),
        func.count(case((RiskSignal.impact_score > 7, 1))).label('high_impact_count')
    ).group_by(RiskSignal.company).all()
    session.close()
    return [
        {"company": r.company, "avg_impact": float(r.avg_impact), "high_impact_count": r.high_impact_count}
        for r in results
    ]

@app.get("/stress-test/run")
def trigger_stress_tests():
    return check_and_run_stress_tests()