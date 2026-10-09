import json
import os
from src.stress_test.shocks import get_shock

PORTFOLIO_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "synthetic_portfolio.json")

def load_portfolio():
    with open(PORTFOLIO_PATH, "r") as f:
        return json.load(f)["assets"]

def portfolio_value(assets):
    return sum(a["value"] for a in assets)

def apply_stress(assets, event_type: str):
    shock = get_shock(event_type)
    stressed = []
    for a in assets:
        pct = shock.get(a["type"], 0)
        new_value = round(a["value"] * (1 + pct), 2)
        stressed.append({**a, "stressed_value": new_value, "shock_pct": pct})
    return stressed

def run_stress_test(event_type: str, impact_score: float):
    assets = load_portfolio()
    before_total = portfolio_value(assets)
    stressed = apply_stress(assets, event_type)
    after_total = sum(a["stressed_value"] for a in stressed)

    return {
        "event_type": event_type,
        "impact_score": impact_score,
        "before_total": before_total,
        "after_total": after_total,
        "loss": round(before_total - after_total, 2),
        "loss_pct": round((before_total - after_total) / before_total * 100, 2),
        "by_asset": stressed,
    }