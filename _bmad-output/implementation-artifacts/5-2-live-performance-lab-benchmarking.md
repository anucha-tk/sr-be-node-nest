# Story 5.2: Live Performance Lab & Benchmarking

Status: done

## Story

As a User,
I want to see a live performance comparison between traditional DB queries and Elasticsearch on 1M+ records,
So that I can verify the speed advantages of the showcase.

## Acceptance Criteria

1. **Benchmark UI**: Split-screen/comparison layout that demonstrates the query speed on a high volume database.
2. **Live Stopwatch**: Live stopwatch/timer showing execution times in milliseconds matching `meta.executionTimeMs` from backend response.
3. **Speed Comparison**: Side-by-side or graphical representation displaying the speed differences (e.g. Average, Min, Max).

## Tasks / Subtasks

- [x] Create PerformanceLab.tsx in frontend components
- [x] Integrate AreaChart from Recharts showing latency trends for requests
- [x] Hook backend `/v1/analytics/summary` to retrieve and showcase real-time execution times
- [x] Add continuous stress testing simulation button ("Load Test") to compare successive API times
