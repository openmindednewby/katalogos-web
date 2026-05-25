/**
 * Type definitions for the StatusPage component and service health polling.
 */

import type ServiceHealthStatus from '../../shared/enums/ServiceHealthStatus';

/** Configuration for a single backend service to health-check. */
interface ServiceConfig {
  /** Unique key used for React keys and translation lookups. */
  key: string;
  /** Translation key suffix under `statusPage.services`. */
  nameKey: string;
  /** Base URL of the service (from environment config). */
  baseUrl: string;
}

/** Result of a single health check against one service. */
interface ServiceHealthResult {
  /** Service key matching ServiceConfig.key. */
  serviceKey: string;
  /** Resolved health status. */
  status: ServiceHealthStatus;
  /** Response time in milliseconds, or null if the check failed. */
  responseTimeMs: number | null;
  /** ISO timestamp of the last successful or failed check. */
  lastCheckedAt: string;
}

/** Aggregated health state across all services. */
interface OverallHealthState {
  /** Overall system status derived from individual service statuses. */
  status: ServiceHealthStatus;
  /** Individual service results. */
  services: ServiceHealthResult[];
  /** Whether a refresh is currently in progress. */
  isRefreshing: boolean;
}

export type { ServiceConfig, ServiceHealthResult, OverallHealthState };
