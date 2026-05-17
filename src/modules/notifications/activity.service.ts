import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { MessageEvent } from '@nestjs/common';
import { trace, context } from '@opentelemetry/api';

export interface ActivityEvent {
  type: 'KAFKA_PRODUCED' | 'KAFKA_CONSUMED' | 'DB_COMMIT' | 'TRACE_STARTED';
  label: string;
  timestamp: string;
  traceId?: string;
  metadata?: any;
}

@Injectable()
export class ActivityService {
  private readonly activity$ = new Subject<ActivityEvent>();

  emit(event: Omit<ActivityEvent, 'timestamp' | 'traceId'>) {
    const span = trace.getSpan(context.active());
    const traceId = span?.spanContext().traceId;

    const fullEvent: ActivityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      traceId,
    };
    this.activity$.next(fullEvent);
  }

  getStream(typeFilter?: string): Observable<MessageEvent> {
    return this.activity$.asObservable().pipe(
      filter((event) => !typeFilter || event.type === typeFilter),
      map((event) => ({ data: event })),
    );
  }
}
