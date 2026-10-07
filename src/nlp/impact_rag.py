import json
import os
import chromadb
from sentence_transformers import SentenceTransformer

_chroma_client = None
_collection = None
_embedder = None

REFERENCE_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "reference_events.json")
CHROMA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "chroma_db")

def get_embedder():
    global _embedder
    if _embedder is None:
        _embedder = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedder

def get_collection():
    global _chroma_client, _collection
    if _collection is not None:
        return _collection

    _chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
    _collection = _chroma_client.get_or_create_collection("reference_events")

    if _collection.count() == 0:
        with open(REFERENCE_PATH, "r") as f:
            events = json.load(f)

        embedder = get_embedder()
        texts = [e["text"] for e in events]
        embeddings = embedder.encode(texts).tolist()

        _collection.add(
            ids=[str(i) for i in range(len(events))],
            embeddings=embeddings,
            documents=texts,
            metadatas=[{"event_type": e["event_type"], "impact_score": e["impact_score"]} for e in events],
        )
        print(f"Loaded {len(events)} reference events into ChromaDB")

    return _collection

def score_impact(text: str, n_results: int = 3) -> float:
    if not text or not text.strip():
        return 1.0

    collection = get_collection()
    embedder = get_embedder()
    query_embedding = embedder.encode([text]).tolist()

    results = collection.query(query_embeddings=query_embedding, n_results=n_results)
    scores = [m["impact_score"] for m in results["metadatas"][0]]

    if not scores:
        return 1.0

    # weight nearest match more heavily than farther ones
    weights = [3, 2, 1][:len(scores)]
    weighted_avg = sum(s * w for s, w in zip(scores, weights)) / sum(weights)
    return round(weighted_avg, 1)