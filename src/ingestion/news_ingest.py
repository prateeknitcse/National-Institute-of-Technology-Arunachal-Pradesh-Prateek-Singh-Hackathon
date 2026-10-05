import feedparser
from datetime import datetime
from src.db.connection import SessionLocal
from src.db.models import RawDocument

FEEDS = [
    "https://www.moneycontrol.com/rss/business.xml",
    "https://www.moneycontrol.com/rss/economy.xml",
    "http://feeds.reuters.com/reuters/businessNews",
]

def fetch_news():
    session = SessionLocal()
    new_count = 0

    for feed_url in FEEDS:
        feed = feedparser.parse(feed_url)
        for entry in feed.entries:
            title = getattr(entry, "title", "")
            summary = getattr(entry, "summary", "")
            link = getattr(entry, "link", "")

            exists = session.query(RawDocument).filter_by(raw_url=link).first() if link else None
            if exists:
                continue

            published = datetime.now()
            if hasattr(entry, "published_parsed") and entry.published_parsed:
                published = datetime(*entry.published_parsed[:6])

            doc = RawDocument(
                source="news",
                title=title,
                body=summary,
                published_at=published,
            )
            session.add(doc)
            new_count += 1

    session.commit()
    session.close()
    print(f"Inserted {new_count} new news documents")

if __name__ == "__main__":
    fetch_news()