# System Architecture: Idempotent Revenue Engine

This diagram illustrates the high-level architecture of the revenue ingestion system, showing the flow from external event generation to database persistence.

```mermaid
graph TD
    subgraph "External Systems"
        Producer[Kafka Producer: ERP/Invoice Service]
    end

    subgraph "Infrastructure"
        Kafka[Apache Kafka Broker]
    end

    subgraph "sr-be-node-nest (Revenue Module)"
        Consumer[Kafka Consumer]
        Controller[Revenue Controller]
        Service[Revenue Service]
    end

    subgraph "Database (PostgreSQL)"
        DB[(PostgreSQL)]
        PE[ProcessedEvent Table]
        SR[SupplierRevenue Table]
        AL[RevenueAuditLog Table]
    end

    Producer -->|invoice.paid| Kafka
    Kafka -->|message| Consumer
    Consumer --> Controller
    Controller --> Service
    Service -->|ACID Transaction| DB
    DB --- PE
    DB --- SR
    DB --- AL
```
