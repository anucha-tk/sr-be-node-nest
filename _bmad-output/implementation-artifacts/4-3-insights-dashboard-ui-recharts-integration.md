# Story 4.3: Insights Dashboard UI (Recharts Integration)

Status: done

## Story

As a User,
I want to see a dashboard with interactive charts visualizing search insights,
So that I can quickly understand data trends and distributions.

## Acceptance Criteria

1. **Dashboard UI**: Displays a rich, premium insights dashboard with interactive charts.
2. **Recharts Charts**: Renders AreaChart, BarChart, and PieChart for invoice amounts, suppliers, status, and time-series trends.
3. **Responsive Glassmorphism**: Stunning UI matching the glassmorphism design language with smooth Framer Motion transitions.

## Tasks / Subtasks

- [x] Create InsightsDashboard.tsx in frontend components
- [x] Integrate Recharts charts showing trends, status distribution, and supplier stats
- [x] Connect backend `/api/v1/analytics/search-stats` to retrieve live data
