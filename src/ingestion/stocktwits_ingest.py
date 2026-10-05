import requests
import time
from datetime import datetime
from src.db.connection import SessionLocal
from src.db.models import RawDocument

TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "JPM", "NVDA", "META", "V", "WMT"]
HEADERS = {"User-Agent": "risk-engine-script/1.0"}

def fetch_stocktwits(limit_per_ticker=30):
    session = SessionLocal()
    new_count = 0

    for ticker in TICKERS:
        url = f"https://api.stocktwits.com/api/2/streams/symbol/{ticker}.json"
        resp = requests.get(url, headers=HEADERS)

        if resp.status_code != 200:
            print(f"Failed to fetch {ticker}: status {resp.status_code}")
            time.sleep(1)
            continue

        data = resp.json()
        messages = data.get("messages", [])[:limit_per_ticker]

        for msg in messages:
            msg_id = msg.get("id")
            link = f"https://stocktwits.com/symbol/{ticker}/message/{msg_id}"

            exists = session.query(RawDocument).filter_by(raw_url=link).first()
            if exists:
                continue

            created = msg.get("created_at", "")
            try:
                published = datetime.strptime(created, "%Y-%m-%dT%H:%M:%SZ")
            except ValueError:
                published = datetime.now()

            doc = RawDocument(
                source="stocktwits",
                title=f"{ticker}: {msg.get('body', '')[:80]}",
                body=msg.get("body", ""),
                raw_url=link,
                published_at=published,
            )
            session.add(doc)
            new_count += 1

        time.sleep(1)  # be polite, avoid rate limiting

    session.commit()
    session.close()
    print(f"Inserted {new_count} new stocktwits documents")

if __name__ == "__main__":
    fetch_stocktwits()