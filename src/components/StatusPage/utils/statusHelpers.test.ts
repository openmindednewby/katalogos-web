import {
  buildHealthUrl,
  DEGRADED_THRESHOLD_MS,
  deriveOverallStatus,
  determineStatus,
  HEALTH_ENDPOINT,
  overallStatusToMessageKey,
  statusToLabelKey,
} from './statusHelpers';
import ServiceHealthStatus from '../../../shared/enums/ServiceHealthStatus';

import type { ServiceHealthResult } from '../types';

describe('determineStatus', () => {
  it('returns Down when httpStatus is null (fetch failed)', () => {
    expect(determineStatus(null, null)).toBe(ServiceHealthStatus.Down);
  });

  it('returns Down for non-200 status codes', () => {
    expect(determineStatus(500, 100)).toBe(ServiceHealthStatus.Down);
    expect(determineStatus(503, 50)).toBe(ServiceHealthStatus.Down);
    expect(determineStatus(404, 200)).toBe(ServiceHealthStatus.Down);
  });

  it('returns Healthy for 200 with fast response', () => {
    expect(determineStatus(200, 100)).toBe(ServiceHealthStatus.Healthy);
    expect(determineStatus(200, 500)).toBe(ServiceHealthStatus.Healthy);
  });

  it('returns Degraded for 200 with slow response exceeding threshold', () => {
    expect(determineStatus(200, DEGRADED_THRESHOLD_MS + 1)).toBe(ServiceHealthStatus.Degraded);
  });

  it('returns Healthy when response time equals the threshold', () => {
    expect(determineStatus(200, DEGRADED_THRESHOLD_MS)).toBe(ServiceHealthStatus.Healthy);
  });

  it('returns Healthy for 200 with null response time', () => {
    expect(determineStatus(200, null)).toBe(ServiceHealthStatus.Healthy);
  });
});

describe('deriveOverallStatus', () => {
  function makeResult(status: ServiceHealthStatus): ServiceHealthResult {
    return {
      serviceKey: 'test',
      status,
      responseTimeMs: 100,
      lastCheckedAt: new Date().toISOString(),
    };
  }

  it('returns Unknown for empty array', () => {
    expect(deriveOverallStatus([])).toBe(ServiceHealthStatus.Unknown);
  });

  it('returns Healthy when all services are healthy', () => {
    const results = [makeResult(ServiceHealthStatus.Healthy), makeResult(ServiceHealthStatus.Healthy)];
    expect(deriveOverallStatus(results)).toBe(ServiceHealthStatus.Healthy);
  });

  it('returns Down when any service is down', () => {
    const results = [makeResult(ServiceHealthStatus.Healthy), makeResult(ServiceHealthStatus.Down)];
    expect(deriveOverallStatus(results)).toBe(ServiceHealthStatus.Down);
  });

  it('returns Degraded when some services are degraded but none are down', () => {
    const results = [makeResult(ServiceHealthStatus.Healthy), makeResult(ServiceHealthStatus.Degraded)];
    expect(deriveOverallStatus(results)).toBe(ServiceHealthStatus.Degraded);
  });

  it('returns Down when both degraded and down exist (down takes priority)', () => {
    const results = [makeResult(ServiceHealthStatus.Degraded), makeResult(ServiceHealthStatus.Down)];
    expect(deriveOverallStatus(results)).toBe(ServiceHealthStatus.Down);
  });
});

describe('statusToLabelKey', () => {
  it('maps Healthy to statusPage.healthy', () => {
    expect(statusToLabelKey(ServiceHealthStatus.Healthy)).toBe('statusPage.healthy');
  });

  it('maps Degraded to statusPage.degraded', () => {
    expect(statusToLabelKey(ServiceHealthStatus.Degraded)).toBe('statusPage.degraded');
  });

  it('maps Down to statusPage.down', () => {
    expect(statusToLabelKey(ServiceHealthStatus.Down)).toBe('statusPage.down');
  });

  it('maps Unknown to statusPage.unknown', () => {
    expect(statusToLabelKey(ServiceHealthStatus.Unknown)).toBe('statusPage.unknown');
  });
});

describe('overallStatusToMessageKey', () => {
  it('maps Healthy to allOperational', () => {
    expect(overallStatusToMessageKey(ServiceHealthStatus.Healthy)).toBe('statusPage.allOperational');
  });

  it('maps Degraded to someIssues', () => {
    expect(overallStatusToMessageKey(ServiceHealthStatus.Degraded)).toBe('statusPage.someIssues');
  });

  it('maps Down to majorOutage', () => {
    expect(overallStatusToMessageKey(ServiceHealthStatus.Down)).toBe('statusPage.majorOutage');
  });

  it('maps Unknown to someIssues (fallback)', () => {
    expect(overallStatusToMessageKey(ServiceHealthStatus.Unknown)).toBe('statusPage.someIssues');
  });
});

describe('buildHealthUrl', () => {
  it('appends the health endpoint to the base URL', () => {
    const config = { key: 'test', nameKey: 'test', baseUrl: 'http://localhost:5002' };
    expect(buildHealthUrl(config)).toBe(`http://localhost:5002${HEALTH_ENDPOINT}`);
  });
});
