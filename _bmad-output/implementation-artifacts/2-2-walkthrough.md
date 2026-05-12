# Walkthrough: Idempotent Revenue Engine

This walkthrough covers the implementation of the core revenue calculation logic, ensuring every `invoice.paid` event is processed exactly once.

## 🏗️ Architecture & Database
The implementation introduces two new database models in `prisma/schema.prisma`:
- **ProcessedEvent**: Tracks unique `eventId` to prevent duplicate processing.
- **SupplierRevenue**: Manages supplier balances using `Decimal` for financial accuracy.

```prisma
model ProcessedEvent {
  id        String   @id
  createdAt DateTime @default(now())
}

model SupplierRevenue {
  supplierId String   @id
  balance    Decimal  @default(0) @db.Decimal(20, 2)
  updatedAt  DateTime @updatedAt
}
```

## ⚙️ Idempotent Processing Logic
The `RevenueService.processRevenue` method implements a "Record-then-Update" pattern within a single ACID transaction:
1.  **Idempotency Check**: Attempts to insert the `eventId` into the `ProcessedEvent` table. If it fails with a unique constraint violation (`P2002`), the transaction skips the update and returns safely.
2.  **Atomic Update**: Uses `upsert` with the `increment` atomic operator to update the supplier's balance. This ensures no race conditions even with multiple workers.

```typescript
await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
  try {
    await tx.processedEvent.create({ data: { id: dto.eventId } });
    await tx.supplierRevenue.upsert({
      where: { supplierId: dto.supplierId },
      update: { balance: { increment: dto.amount } },
      create: { supplierId: dto.supplierId, balance: dto.amount },
    });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return; // Idempotency hit
    }
    throw error;
  }
});
```

## 🧪 Verification
- **Unit Tests**: `revenue.service.spec.ts` covers successful processing and duplicate event handling.
- **Integration**: `RevenueController` is fully updated to call the service.
- **Quality Gates**: Passed full linting, TSC, and 80%+ coverage checks.

## 🏁 Results
- [x] Schema Migrated
- [x] Logic Implemented
- [x] Controller Integrated
- [x] Tests Passing
- [x] Lint & TSC Clean
