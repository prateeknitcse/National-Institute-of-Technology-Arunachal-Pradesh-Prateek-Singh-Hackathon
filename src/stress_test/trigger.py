from src.db.connection import SessionLocal
from src.db.models import RiskSignal
from src.stress_test.portfolio import run_stress_test

IMPACT_THRESHOLD = 7
RISK_EVENT_TYPES = ["Geopolitical", "Macroeconomic", "Credit Event"]


def check_and_run_stress_tests():
    session = SessionLocal()
    high_impact = session.query(RiskSignal).filter(
        RiskSignal.impact_score > IMPACT_THRESHOLD,
        RiskSignal.event_type.in_(RISK_EVENT_TYPES)
    ).all()
    session.close()

    results = []
    for signal in high_impact:
        result = run_stress_test(signal.event_type, signal.impact_score)
        results.append(result)
    return results


if __name__ == "__main__":
    results = check_and_run_stress_tests()
    for r in results:
        print(f"{r['event_type']}: loss of {r['loss']} ({r['loss_pct']}%)")