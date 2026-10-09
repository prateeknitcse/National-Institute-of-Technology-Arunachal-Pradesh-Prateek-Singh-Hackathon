SHOCK_LIBRARY = {
    "Geopolitical": {"equity": -0.10, "bond": -0.03, "loan": 0.0, "derivative": -0.05},
    "Macroeconomic": {"equity": -0.05, "bond": -0.08, "loan": -0.02, "derivative": -0.04},
    "Credit Event": {"equity": -0.03, "bond": -0.15, "loan": -0.10, "derivative": -0.06},
    "Merger/Acquisition": {"equity": 0.02, "bond": 0.0, "loan": 0.0, "derivative": 0.0},
    "Product Launch": {"equity": 0.03, "bond": 0.0, "loan": 0.0, "derivative": 0.0},
}

def get_shock(event_type: str) -> dict:
    return SHOCK_LIBRARY.get(event_type, {"equity": 0, "bond": 0, "loan": 0, "derivative": 0})