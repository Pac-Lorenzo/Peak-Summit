import json
import os
from fastapi import FastAPI
import redis
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to Redis
r = redis.Redis(host="localhost", port=6379, decode_responses=True)

# Base path to your public data
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "public" / "data"

CACHE_TTL = 86400  # 24 hours


def load_json(filename: str):
    file_path = DATA_DIR / filename
    with open(file_path, "r") as f:
        return json.load(f)


@app.get("/metrics")
def get_metrics():
    cache_key = "metrics:latest"

    cached = r.get(cache_key)
    if cached:
        return json.loads(cached)

    data = load_json("metrics.json")
    r.setex(cache_key, CACHE_TTL, json.dumps(data))
    return data


@app.get("/performance/{range_key}")
def get_performance(range_key: str):
    cache_key = f"performance:{range_key}"

    cached = r.get(cache_key)
    if cached:
        return json.loads(cached)

    filename = f"performance.{range_key}.json"
    data = load_json(filename)
    r.setex(cache_key, CACHE_TTL, json.dumps(data))
    return data

@app.get("/holdings")
def get_holdings():
    cache_key = "holdings:latest"

    cached = r.get(cache_key)
    if cached:
        return json.loads(cached)

    data = load_json("holdings.json")
    r.setex(cache_key, CACHE_TTL, json.dumps(data))
    return data


@app.get("/positions")
def get_positions():
    cache_key = "positions:latest"

    cached = r.get(cache_key)
    if cached:
        return json.loads(cached)

    data = load_json("positions.json")
    r.setex(cache_key, CACHE_TTL, json.dumps(data))
    return data