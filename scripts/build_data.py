from __future__ import annotations

import hashlib
import argparse
import json
import math
import random
import time
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, List, Tuple, Optional

import pandas as pd
import yfinance as yf


ROOT = Path(__file__).resolve().parents[1]
PORTFOLIO_PATH = ROOT / "data" / "portfolio.json"
OUT_DIR = ROOT / "public" / "data"
CACHE_DIR = ROOT / "data" / "cache"

RANGES = {"1M": 31, "3M": 92, "1Y": 366, "MAX": None}

MAX_ATTEMPTS = 6
BASE_BACKOFF_SECONDS = 2.0
BATCH_SIZE = 7           # ✅ reduces Yahoo 429 risk
BATCH_PAUSE_SECONDS = (1.2, 2.8)  # ✅ random pause between batches


@dataclass
class Holding:
    ticker: str
    name: str
    weight: float


def iso_today_utc() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def load_portfolio() -> Tuple[str, str, str, float, List[Holding]]:
    cfg = json.loads(PORTFOLIO_PATH.read_text(encoding="utf-8"))
    portfolio_name = cfg["portfolioName"]
    inception = cfg["inceptionDate"]
    benchmark = cfg.get("benchmark", "SPY")
    initial_capital = float(cfg.get("initialCapital"))


    holdings = [
        Holding(h["ticker"], h.get("name", h["ticker"]), float(h["weight"]))
        for h in cfg["weights"]
    ]

    w_sum = sum(h.weight for h in holdings)
    if abs(w_sum - 1.0) > 1e-6:
        raise ValueError(f"Weights must sum to 1.0. Current sum={w_sum}")

    if any(h.weight < 0 for h in holdings):
        raise ValueError("Weights cannot be negative.")

    return portfolio_name, inception, benchmark, initial_capital, holdings


def _cache_key(tickers: List[str], start: str, salt: str = "") -> str:
    s = ",".join(sorted(tickers)) + "|" + start + "|" + salt
    return hashlib.md5(s.encode("utf-8")).hexdigest()


def _load_cached_adjclose(key: str) -> Optional[pd.DataFrame]:
    path = CACHE_DIR / f"adjclose_{key}.parquet"
    if not path.exists():
        return None
    try:
        df = pd.read_parquet(path)
        df.index = pd.to_datetime(df.index).date
        df.index = pd.Index(df.index, name="date")
        return df.sort_index()
    except Exception:
        return None


def _save_cached_adjclose(key: str, df: pd.DataFrame) -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    path = CACHE_DIR / f"adjclose_{key}.parquet"
    df.to_parquet(path)


def _download_batch_adjclose(tickers: List[str], start: str) -> pd.DataFrame:
    last_err: Optional[Exception] = None

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            df = yf.download(
                tickers=tickers,
                start=start,
                interval="1d",
                auto_adjust=False,
                progress=False,
                group_by="column",
                threads=False,
            )

            if df is None or df.empty:
                raise RuntimeError("Empty response (likely rate limited).")

            if isinstance(df.columns, pd.MultiIndex):
                if "Adj Close" not in df.columns.get_level_values(0):
                    raise RuntimeError("Adj Close not found in multiindex response.")
                adj = df["Adj Close"].copy()
            else:
                if "Adj Close" not in df.columns:
                    raise RuntimeError("Adj Close not found in response.")
                adj = df[["Adj Close"]].rename(columns={"Adj Close": tickers[0]})

            adj.index = pd.to_datetime(adj.index).date
            adj.index = pd.Index(adj.index, name="date")
            adj = adj.sort_index().ffill().dropna(how="all")

            if adj.empty:
                raise RuntimeError("Adj Close empty after cleaning.")

            return adj

        except Exception as e:
            last_err = e
            backoff = (BASE_BACKOFF_SECONDS ** attempt) + random.uniform(0, 1.5)
            backoff = min(backoff, 90.0)
            print(f"⚠️ Batch download failed (attempt {attempt}/{MAX_ATTEMPTS}): {e}")
            print(f"⏳ Backing off {backoff:.1f}s...")
            time.sleep(backoff)

    raise RuntimeError(f"Batch failed after retries. Last error: {last_err}")


def download_prices_adjclose_batched(tickers: List[str], start: str, force_refresh: bool = False) -> pd.DataFrame:
    """
    Download tickers in batches, join columns, cache final result.
    """
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    key = _cache_key(tickers, start)

    print("DEBUG tickers:", tickers)
    print("DEBUG start:", start)
    print("DEBUG cache key:", key)

    cache_path = CACHE_DIR / f"adjclose_{key}.parquet"
    print("DEBUG cache path:", cache_path)
    print("DEBUG cache exists:", cache_path.exists())

    print("DEBUG cache dir listing (top 10):",
        sorted([p.name for p in CACHE_DIR.glob("adjclose_*.parquet")])[:10])


    cached = None if force_refresh else _load_cached_adjclose(key)
    if cached is not None and not cached.empty:
        print("✅ Using cached prices.")
        return cached

    frames: List[pd.DataFrame] = []

    # batch tickers
    for i in range(0, len(tickers), BATCH_SIZE):
        batch = tickers[i : i + BATCH_SIZE]
        print(f"📥 Downloading batch {i//BATCH_SIZE + 1} / {math.ceil(len(tickers)/BATCH_SIZE)}: {batch}")
        adj = _download_batch_adjclose(batch, start=start)
        frames.append(adj)

        # pause between batches
        if i + BATCH_SIZE < len(tickers):
            sleep_s = random.uniform(*BATCH_PAUSE_SECONDS)
            time.sleep(sleep_s)

    merged = pd.concat(frames, axis=1)

    # de-dup columns (just in case)
    merged = merged.loc[:, ~merged.columns.duplicated()].sort_index().ffill()

    # drop columns that are all NA (unsupported tickers)
    merged = merged.dropna(axis=1, how="all")
    if merged.empty:
        raise RuntimeError("All tickers failed / no usable price data.")

    _save_cached_adjclose(key, merged)
    print("✅ Download + cache complete.")
    return merged


def compute_index_from_returns(returns: pd.Series, base: float = 100.0) -> pd.Series:
    return (1.0 + returns.fillna(0.0)).cumprod() * base


def slice_last_days(df: pd.DataFrame, days: Optional[int]) -> pd.DataFrame:
    if days is None:
        return df
    cutoff = date.today() - timedelta(days=days)
    return df[df.index >= cutoff]


def to_points(df: pd.DataFrame) -> List[Dict]:
    out: List[Dict] = []
    for d, row in df.iterrows():
        out.append(
            {
                "date": d.isoformat() if hasattr(d, "isoformat") else str(d),
                "portfolio": round(float(row["portfolio"]), 4),
                "benchmark": round(float(row["benchmark"]), 4),
            }
        )
    return out


def annualized_vol(daily_returns: pd.Series) -> float:
    return float(daily_returns.std(ddof=0) * math.sqrt(252))


def sharpe_ratio(daily_returns: pd.Series, rf_annual: float = 0.0) -> float:
    rf_daily = (1.0 + rf_annual) ** (1.0 / 252.0) - 1.0
    excess = daily_returns - rf_daily
    vol = excess.std(ddof=0)
    if vol == 0 or math.isnan(vol):
        return 0.0
    return float((excess.mean() / vol) * math.sqrt(252))


def max_drawdown(index: pd.Series) -> float:
    roll_max = index.cummax()
    dd = index / roll_max - 1.0
    return float(dd.min())


def _safe_write_json(path: Path, payload: Dict) -> None:
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def _all_outputs_exist() -> bool:
    expected = [
        "performance.1m.json",
        "performance.3m.json",
        "performance.1y.json",
        "performance.max.json",
        "metrics.json",
        "holdings.json",
        "positions.json",
    ]
    return all((OUT_DIR / f).exists() for f in expected)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    portfolio_name, inception, benchmark, initial_capital, holdings = load_portfolio()

    parser = argparse.ArgumentParser()
    parser.add_argument("--force-refresh", action="store_true")
    args = parser.parse_args()

   # remove CASH if you ever add it later
    equity_holdings = [h for h in holdings if h.ticker.upper() != "CASH"]
    tickers = sorted(set([h.ticker for h in equity_holdings] + [benchmark]))

    try:
        prices = download_prices_adjclose_batched(tickers=tickers, start=inception, force_refresh=args.force_refresh)
    except Exception as e:
        if _all_outputs_exist():
            print(f"⚠️ Download failed ({e}) but JSON outputs exist. Keeping last good data.")
            return
        raise

    # Returns
    rets = prices.pct_change().fillna(0.0)

    # Determine which portfolio tickers are actually present
    available = set(rets.columns)

    missing = [h.ticker for h in equity_holdings if h.ticker not in available]
    if missing:
        print("⚠️ Missing/unsupported tickers (dropping + renormalizing):", missing)

    # Build weights map for available tickers only
    w_map = {h.ticker: h.weight for h in equity_holdings if h.ticker in available}
    w_sum = sum(w_map.values())
    if w_sum <= 0:
        raise RuntimeError("No portfolio tickers available after filtering.")

    # Renormalize weights so portfolio remains fully invested in available tickers
    w_map = {t: w / w_sum for t, w in w_map.items()}

    # Prices for portfolio tickers only (available)
    port_prices = prices[list(w_map.keys())].copy().dropna(how="all")

    # Use first date where ALL portfolio tickers have prices
    first_date = port_prices.dropna(how="any").index[0]
    p0 = port_prices.loc[first_date]

    # Shares bought at inception (partial shares allowed)
    shares = {t: (initial_capital * w_map[t]) / float(p0[t]) for t in w_map.keys()}

    # Daily portfolio value series
    portfolio_value = pd.Series(0.0, index=prices.index)
    for t, sh in shares.items():
        portfolio_value = portfolio_value.add(prices[t] * sh, fill_value=0.0)

    # Only keep dates where we have a valid portfolio value
    portfolio_value = portfolio_value.dropna()

    # Benchmark value series aligned to portfolio dates
    bench_price = prices[benchmark].dropna()
    bench_price = bench_price[bench_price.index.isin(portfolio_value.index)]
    if bench_price.empty:
        raise RuntimeError("Benchmark series empty after aligning to portfolio dates.")

    # Build base-100 indices for charts/performance
    port_index = (portfolio_value / portfolio_value.iloc[0]) * 100.0
    bench_index = (bench_price / bench_price.iloc[0]) * 100.0

    combined = pd.DataFrame({"portfolio": port_index, "benchmark": bench_index}).dropna()
    if combined.empty:
        raise RuntimeError("Combined series empty.")

    # performance files
    for key, days in RANGES.items():
        sliced = slice_last_days(combined, days)
        _safe_write_json(
            OUT_DIR / f"performance.{key.lower()}.json",
            {"range": key, "points": to_points(sliced)},
        )

    # returns (for vol/sharpe) derived from the true portfolio value series
    port_ret = portfolio_value.pct_change().fillna(0.0)

    # metrics
    total_return_pct = (portfolio_value.iloc[-1] / portfolio_value.iloc[0] - 1.0) * 100.0

    today = date.today()
    ytd_start = date(today.year, 1, 1)
    ytd_vals = portfolio_value[portfolio_value.index >= ytd_start]
    if len(ytd_vals) >= 2:
        ytd_return_pct = (ytd_vals.iloc[-1] / ytd_vals.iloc[0] - 1.0) * 100.0
    else:
        ytd_return_pct = 0.0

    vol_pct = annualized_vol(port_ret) * 100.0
    sharpe = sharpe_ratio(port_ret, rf_annual=0.0)
    mdd_pct = max_drawdown(port_index) * 100.0

    aum_usd = float(portfolio_value.iloc[-1])
    profit_usd = aum_usd - initial_capital

    # current weights (drift) from latest prices * shares
    latest_date = portfolio_value.index[-1]
    latest_prices = prices.loc[latest_date, list(shares.keys())]
    pos_values = {t: float(latest_prices[t]) * float(shares[t]) for t in shares.keys()}
    aum_calc = sum(pos_values.values()) or 1.0
    current_weights = {t: v / aum_calc for t, v in pos_values.items()}

    valuation_date = latest_date  # last date we have a portfolio value
    
    # Inception “entry” prices (the date you actually used to buy)
    entry_date = first_date
    entry_prices = p0  # from your existing code: p0 = port_prices.loc[first_date]

    
       
    # -------- positions.json (truth source for shares) --------
    positions = []
    for t in sorted(shares.keys()):
        sh = float(shares[t])

        entry_price = float(p0.loc[t])
        current_price = float(latest_prices.loc[t])

        # “Truth” entry value based on shares * entry price (avoids weight/rounding drift)
        entry_value = sh * entry_price
        market_value = sh * current_price

        pnl = market_value - entry_value
        ret_pct = (market_value / entry_value - 1.0) * 100.0 if entry_value != 0 else 0.0

        positions.append({
            "ticker": t,
            "shares": round(sh, 8),
            "entryPrice": round(entry_price, 4),
            "currentPrice": round(current_price, 4),
            "entryValue": round(entry_value, 2),
            "marketValue": round(market_value, 2),
            "currentWeight": round(float(current_weights.get(t, 0.0)), 6),
            "pnlUsd": round(pnl, 2),
            "returnPct": round(ret_pct, 3),
        })

    positions_out = {
        "asOf": iso_today_utc(),
        "entryDateUsed": entry_date.isoformat() if hasattr(entry_date, "isoformat") else str(entry_date),
        "valuationDate": valuation_date.isoformat() if hasattr(valuation_date, "isoformat") else str(valuation_date),
        "initialCapitalUsd": round(float(initial_capital), 2),
        "aumUsd": round(float(aum_usd), 2),
        "positions": positions,
        "missingTickersDropped": missing,
        "weightsRenormalized": bool(missing),
    }
    _safe_write_json(OUT_DIR / "positions.json", positions_out)

    # -------- metrics.json --------
    metrics = {
        "portfolioName": portfolio_name,
        "benchmarkName": f"S&P 500 ({benchmark})" if benchmark.upper() == "SPY" else benchmark,
        "since": "Since inception",
        "asOf": iso_today_utc(),
        "totalReturnPct": round(float(total_return_pct), 3),
        "ytdReturnPct": round(float(ytd_return_pct), 3),
        "volatilityAnnualPct": round(float(vol_pct), 3),
        "sharpe": round(float(sharpe), 3),
        "maxDrawdownPct": round(float(mdd_pct), 3),
        "aumUsd": round(aum_usd, 2),
        "profitUsd": round(profit_usd, 2),
        "initialCapitalUsd": round(initial_capital, 2),
    }
    _safe_write_json(OUT_DIR / "metrics.json", metrics)

    # -------- holdings.json --------
    holdings_out = {
        "asOf": iso_today_utc(),
        "holdings": [
            {
                "ticker": h.ticker,
                "name": h.name,
                "weight": round(float(current_weights.get(h.ticker, 0.0)), 6),   # drifted
                "targetWeight": round(float(h.weight), 6),                      # original target
                "shares": round(float(shares.get(h.ticker, 0.0)), 8),
                "price": round(float(latest_prices[h.ticker]), 4),
                "marketValue": round(float(pos_values.get(h.ticker, 0.0)), 2),
            }
            for h in holdings
        ],
        "missingTickersDropped": missing,
        "weightsRenormalized": bool(missing),
    }
    _safe_write_json(OUT_DIR / "holdings.json", holdings_out)

   

    positions_out = {
        "asOf": iso_today_utc(),
        "entryDateUsed": entry_date.isoformat() if hasattr(entry_date, "isoformat") else str(entry_date),
        "valuationDate": latest_date.isoformat() if hasattr(latest_date, "isoformat") else str(latest_date),
        "initialCapitalUsd": round(float(initial_capital), 2),
        "aumUsd": round(float(aum_usd), 2),
        "positions": [
            {
                "ticker": t,
                "shares": round(float(shares[t]), 8),
                "entryPrice": round(float(entry_prices[t]), 4),
                "currentPrice": round(float(latest_prices[t]), 4),
                "entryValue": round(float(shares[t]) * float(entry_prices[t]), 2),
                "marketValue": round(float(pos_values[t]), 2),
                "currentWeight": round(float(current_weights[t]), 6),
                "pnlUsd": round(float(pos_values[t] - (shares[t] * float(entry_prices[t]))), 2),
                "returnPct": round(
                    (float(latest_prices[t]) / float(entry_prices[t]) - 1.0) * 100.0,
                    3,
                ),
            }
            for t in shares.keys()
        ],
        "missingTickersDropped": missing,
        "weightsRenormalized": bool(missing),
    }
    _safe_write_json(OUT_DIR / "positions.json", positions_out)


    print("✅ Wrote outputs to:", OUT_DIR)


if __name__ == "__main__":
    main()
