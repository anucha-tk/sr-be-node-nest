# Retrospective: Epic 7 - The Pulsing System (Enterprise Observability Showcase)

**Date:** 2026-05-17  
**Epic:** 7  
**Status:** Complete  

---

## 🎯 Successes

- **Full-stack Distributed Tracing:** Configured OpenTelemetry SDK globally to trace execution streams across HTTP, NestJS internals, Prisma (database), and Kafka queues, consolidating spans in Jaeger.
- **OTel Context Propagation:** Handled Kafka headers to propagate active Trace IDs and Span IDs across microservice boundaries, enabling unified trace visualizations in the Jaeger UI.
- **Collapsible System Pulse Sidebar:** Developed a responsive `SystemPulseSidebar` in React with Framer Motion transitions, providing live observability of system events.
- **Interactive Trace Linking:** Integrated distributed traces directly into the UI, giving users a clickable link to open deep-dive timelines inside Jaeger (port 16686).
- **JSON & Plain-text Metrics Engine:** Integrated `@willsoto/nestjs-prometheus` to expose both standard Prometheus metrics and a structured JSON summary endpoint for high-speed dashboards.
- **Beautiful Infrastructure Dashboard:** Created a high-density charts dashboard (`PrometheusDashboard.tsx`) using Recharts, visualising live CPU load, Heap Memory usage, Socket count, and transaction throughput (RPS).

---

## 💡 Lessons Learned

- **Entrypoint Hooking Order:** OpenTelemetry SDK initialization MUST be imported before any other module in `main.ts` (using `import './tracing'`) to intercept dynamic module imports and bind auto-instrumentation hooks correctly.
- **Context Extraction in Consumers:** Since Kafka is asynchronous, extracting tracing context from headers must happen explicitly within consumer event handlers to link child spans back to parent producers.
- **Chart Performance Optimization:** High-frequency real-time charts can cause significant React rendering overhead. Limiting historical data points (e.g. keeping the last 20 ticks) and throttling polling/WS rates maintains lightweight render trees.

---

## 🚀 Final Deliverables Checked

1. **Distributed Tracing:** Context propagation through Kafka verified and visualized in Jaeger.
2. **System Pulse Sidebar:** Live stream drawer displaying active traces and Kafka updates correctly.
3. **Prometheus Dashboard:** Real-time metrics charts rendering CPU, RAM, active sockets, and throughput.

---

_Facilitated by Antigravity and the BMad Team._
