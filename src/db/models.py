from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import declarative_base

Base = declarative_base()
class RawDocument(Base):
    __tablename__ = "raw_documents"
    id = Column(Integer, primary_key=True)
    source = Column(String)
    title = Column(String)
    body = Column(String)
    raw_url = Column(String, unique=True, nullable=True)   # add this line
    published_at = Column(TIMESTAMP)
    ingested_at = Column(TIMESTAMP, server_default=func.now())
    processed = Column(Boolean, default=False)
class RiskSignal(Base):
    __tablename__ = "risk_signals"
    id = Column(Integer, primary_key=True)
    raw_document_id = Column(Integer, ForeignKey("raw_documents.id"))
    company = Column(String)
    sentiment_score = Column(Float)
    event_type = Column(String)
    impact_score = Column(Float)
    created_at = Column(TIMESTAMP, server_default=func.now())