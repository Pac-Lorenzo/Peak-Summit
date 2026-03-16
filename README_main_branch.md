# Peak Summit Capital --- Portfolio Dashboard

A modern portfolio analytics dashboard built with React, TypeScript, and
Vite.\
Designed to visualize performance, risk metrics, and holdings for a
student-managed investment fund focused on technology and defense
equities.

🔗 Live Demo: \[Add Netlify URL Here\]

------------------------------------------------------------------------

## Overview

This project generates portfolio performance and risk analytics using
Python, then serves static JSON outputs to a responsive React frontend.

This branch represents the production-ready static deployment version of
the system.

There is no backend server in this branch --- all data is generated
offline and consumed as static assets.

------------------------------------------------------------------------

## Architecture (Static Version)

Python (data generation) ↓ Static JSON files (public/data) ↓ React +
Vite frontend ↓ Netlify hosting

The frontend fetches precomputed JSON files directly from the public
directory.

------------------------------------------------------------------------

## Data Pipeline

Portfolio analytics are generated using:

-   yfinance for historical price data
-   Pandas for portfolio construction
-   Batched downloads to reduce rate limits
-   Exponential backoff retry strategy
-   Local parquet caching for price history

To regenerate data:

``` bash
python scripts/build_data.py
```

This produces:

-   performance.1m.json
-   performance.3m.json
-   performance.1y.json
-   performance.max.json
-   metrics.json
-   holdings.json
-   positions.json

------------------------------------------------------------------------

## Metrics Computed

-   Total return
-   YTD return
-   Annualized volatility
-   Beta vs benchmark
-   Systematic risk
-   Unsystematic risk
-   Max drawdown
-   Current AUM
-   Profit (AUM − initial capital)

------------------------------------------------------------------------

## Tech Stack

Frontend: - React - TypeScript - Vite - TailwindCSS

Data Pipeline: - Python - Pandas - yfinance

------------------------------------------------------------------------

## Purpose

This branch is optimized for:

-   Fast static hosting
-   Simplicity
-   Reliability
-   Clean portfolio demonstration

For the full backend architecture with API and Redis caching, see the
`backend-redis` branch.
