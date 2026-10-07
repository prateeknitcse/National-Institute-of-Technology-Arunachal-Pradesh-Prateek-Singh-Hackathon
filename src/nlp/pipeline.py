import re
from src.db.connection import SessionLocal
from src.db.models import RawDocument, RiskSignal
from src.nlp.sentiment import score_sentiment
from src.nlp.classify import classify_event
from src.nlp.impact_rag import score_impact

TRACKED_COMPANIES = {
    "AAPL": ["apple", "aapl"],
    "MSFT": ["microsoft", "msft"],
    "GOOGL": ["google", "alphabet", "googl"],
    "AMZN": ["amazon", "amzn"],
    "TSLA": ["tesla", "tsla"],
    "JPM": ["jpmorgan", "jp morgan", "jpm"],
    "NVDA": ["nvidia", "nvda"],
    "META": ["meta", "facebook"],
    "V": ["visa"],
    "WMT": ["walmart", "wmt"],
}

def extract_company(title: str, body: str) -> str:
    text = f"{title} {body}".lower()
    for ticker, keywords in TRACKED_COMPANIES.items():
        for kw in keywords:
            if kw in text:
                return ticker
    return "UNKNOWN"

def run_pipeline(limit: int = 50):
    session = SessionLocal()
    unprocessed = session.query(RawDocument).filter_by(processed=False).limit(limit).all()

    if not unprocessed:
        print("No unprocessed documents found.")
        session.close()
        return

    processed_count = 0
    for doc in unprocessed:
        text = f"{doc.title} {doc.body}".strip()
        if not text:
            doc.processed = True
            continue

        company = extract_company(doc.title or "", doc.body or "")
        sentiment = score_sentiment(text)
        event_type = classify_event(text)
        impact = score_impact(text)

        signal = RiskSignal(
            raw_document_id=doc.id,
            company=company,
            sentiment_score=sentiment,
            event_type=event_type,
            impact_score=impact,
        )
        session.add(signal)
        doc.processed = True
        processed_count += 1

    session.commit()
    session.close()
    print(f"Processed {processed_count} documents into risk_signals")

if __name__ == "__main__":
    run_pipeline()