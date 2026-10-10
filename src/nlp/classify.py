from transformers import pipeline

_classify_pipe = None

LABEL_DESCRIPTIONS = {
    "Geopolitical": "geopolitical conflict, war, sanctions, or international tension",
    "Macroeconomic": "macroeconomic policy, interest rates, inflation, GDP, or central bank action",
    "Credit Event": "credit rating downgrade, default, bankruptcy, or debt distress",
    "Merger/Acquisition": "company merger, acquisition, or takeover",
    "Product Launch": "new product launch or product announcement",
    "Earnings/Financial Results": "company quarterly earnings, profit, revenue, or dividend results",
    "Corporate Action": "share buyback, bond issuance, stock split, or board approval",
}

LABELS = list(LABEL_DESCRIPTIONS.keys())
HYPOTHESIS_TEMPLATE = "This text is about {}."

def get_classify_pipe():
    global _classify_pipe
    if _classify_pipe is None:
        _classify_pipe = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    return _classify_pipe

def classify_event(text: str) -> str:
    if not text or not text.strip():
        return "Macroeconomic"
    pipe = get_classify_pipe()
    candidate_labels = list(LABEL_DESCRIPTIONS.values())
    result = pipe(text[:512], candidate_labels, hypothesis_template=HYPOTHESIS_TEMPLATE)
    top_description = result["labels"][0]
    # map back from description to the clean label name
    for label, desc in LABEL_DESCRIPTIONS.items():
        if desc == top_description:
            return label
    return "Macroeconomic"