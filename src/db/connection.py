import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from .models import Base

load_dotenv()
DB_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://riskengine:riskengine@localhost:5432/riskdb")

engine = create_engine(DB_URL)
SessionLocal = sessionmaker(bind=engine)

def init_db():
    Base.metadata.create_all(engine)