import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from 'nest-keycloak-connect';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Gauge, Counter } from 'prom-client';
import { SkipThrottle } from '@nestjs/throttler';
import * as os from 'os';

@ApiTags('Observability')
@SkipThrottle()
@Controller({ path: 'observability', version: '1' })
export class ObservabilityController {
  private lastCpuUsage = process.cpuUsage();
  private lastCpuTimestamp = Date.now();
  private lastRequestsCount = 0;
  private lastRequestsTimestamp = Date.now();

  constructor(
    @InjectMetric('active_socket_connections')
    private readonly socketGauge: Gauge<string>,
    @InjectMetric('http_requests_total')
    private readonly httpRequestsCounter: Counter<string>,
  ) {}

  @Public()
  @Get('metrics-summary')
  @ApiOperation({
    summary: 'Get a summary of system metrics in JSON format for the dashboard',
  })
  async getMetricsSummary() {
    // 1. Calculate REAL CPU Usage %
    const currentCpuUsage = process.cpuUsage();
    const currentTimestamp = Date.now();
    const timeDeltaMs = currentTimestamp - this.lastCpuTimestamp;

    const userDelta = (currentCpuUsage.user - this.lastCpuUsage.user) / 1000; // ms
    const systemDelta =
      (currentCpuUsage.system - this.lastCpuUsage.system) / 1000; // ms
    const cpuPercent =
      timeDeltaMs > 0
        ? Math.min(
            100,
            Math.round(((userDelta + systemDelta) / timeDeltaMs) * 100),
          )
        : 0;

    this.lastCpuUsage = currentCpuUsage;
    this.lastCpuTimestamp = currentTimestamp;

    // 2. Calculate REAL Traffic (Requests per second)
    const requestsMetric = await this.httpRequestsCounter.get();
    const currentRequestsCount = requestsMetric.values.reduce(
      (sum, v) => sum + v.value,
      0,
    );
    const trafficDeltaMs = currentTimestamp - this.lastRequestsTimestamp;
    const rps =
      trafficDeltaMs > 0
        ? Math.round(
            ((currentRequestsCount - this.lastRequestsCount) / trafficDeltaMs) *
              1000,
          )
        : 0;

    this.lastRequestsCount = currentRequestsCount;
    this.lastRequestsTimestamp = currentTimestamp;

    // 3. Real Memory & Connections
    const memory = process.memoryUsage();
    const activeConnectionsMetric = await this.socketGauge.get();
    const activeConnections = activeConnectionsMetric.values[0]?.value || 0;

    return {
      cpu: {
        usage: cpuPercent,
        loadAvg: os.loadavg()[0],
      },
      memory: {
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
        rss: Math.round(memory.rss / 1024 / 1024),
      },
      network: {
        activeConnections,
        requestsPerSecond: rps,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
