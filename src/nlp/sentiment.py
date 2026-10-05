from transformers import pipeline

_sentiment_pipe = None

def get_sentiment_pipe():
    global _sentiment_pipe
    if _sentiment_pipe is None:
        _sentiment_pipe = pipeline("sentiment-analysis", model="ProsusAI/finbert")
    return _sentiment_pipe

def score_sentiment(text: str) -> float:
    if not text or not text.strip():
        return 0.0
    pipe = get_sentiment_pipe()
    result = pipe(text[:512])[0]  # truncate to model's max input
    label = result["label"].lower()
    score = result["score"]

    if label == "positive":
        return round(score, 3)
    elif label == "negative":
        return round(-score, 3)
    else:
        return 0.0