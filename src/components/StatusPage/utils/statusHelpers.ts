/**
 * Pure helper functions for the StatusPage component.
 *
 * All functions are side-effect-free and independently testable.
 */

import env from '../../../config/environment';
import ServiceHealthStatus from '../../../shared/enums/ServiceHealthStatus';
import { isValueDefined } from '../../../utils/is';

import type { ServiceConfig, ServiceHealthResult } from '../types';

/** Maximum response time (ms) before a service is considered degraded. */
const DEGRADED_THRESHOLD_MS = 2000;

/** Health endpoint path appended to each service base URL. */
const HEALTH_ENDPOINT = '/health/ready';

/**
 * Service definitions for all backend services to health-check.
 * Base URLs are resolved from environment config at module load time.
 */
const SERVICE_CONFIGS: ServiceConfig[] = [
  { key: 'identity', nameKey: 'statusPage.services.identity', baseUrl: String(env.IDENTITY_API_URL) },
  { key: 'questioner', nameKey: 'statusPage.services.questioner', baseUrl: String(env.QUESTIONER_API_URL) },
  { key: 'onlineMenu', nameKey: 'statusPage.services.onlineMenu', baseUrl: String(env.API_URL) },
  { key: 'content', nameKey: 'statusPage.services.content', baseUrl: String(env.CONTENT_API_URL) },
  { key: 'notification', nameKey: 'statusPage.services.notification', baseUrl: String(env.NOTIFICATION_API_URL) },
  { key: 'payment', nameKey: 'statusPage.services.payment', baseUrl: String(env.PAYMENT_API_URL) },
];

/** Build the full health check URL for a service config. */
function buildHealthUrl(config: ServiceConfig): string {
  return `${config.baseUrl}${HEALTH_ENDPOINT}`;
}

/**
 * Determine the health status from an HTTP response status and response time.
 *
 * - 200 with fast response = Healthy
 * - 200 with slow response = Degraded
 * - Non-200 = Down
 * - null (fetch failed) = Down
 */
function determineStatus(httpStatus: number | null, responseTimeMs: number | null): ServiceHealthStatus {
  if (!isValueDefined(httpStatus)) return ServiceHealthStatus.Down;

  const HTTP_OK = 200;
  if (httpStatus !== HTTP_OK) return ServiceHealthStatus.Down;

  if (isValueDefined(responseTimeMs) && responseTimeMs > DEGRADED_THRESHOLD_MS)
    return ServiceHealthStatus.Degraded;

  return ServiceHealthStatus.Healthy;
}

/**
 * Derive the overall system status from individual service results.
 *
 * - All healthy = Healthy
 * - Any down = Down (major outage)
 * - Otherwise = Degraded
 */
function deriveOverallStatus(services: ServiceHealthResult[]): ServiceHealthStatus {
  if (services.length === 0) return ServiceHealthStatus.Unknown;

  const hasDown = services.some((s) => s.status === ServiceHealthStatus.Down);
  if (hasDown) return ServiceHealthStatus.Down;

  const hasDegraded = services.some((s) => s.status === ServiceHealthStatus.Degraded);
  if (hasDegraded) return ServiceHealthStatus.Degraded;

  return ServiceHealthStatus.Healthy;
}

/** Map a ServiceHealthStatus to the corresponding translation key. */
function statusToLabelKey(status: ServiceHealthStatus): string {
  switch (status) {
    case ServiceHealthStatus.Healthy:
      return 'statusPage.healthy';
    case ServiceHealthStatus.Degraded:
      return 'statusPage.degraded';
    case ServiceHealthStatus.Down:
      return 'statusPage.down';
    case ServiceHealthStatus.Unknown:
      return 'statusPage.unknown';
    default:
      return 'statusPage.unknown';
  }
}

/** Map overall status to the appropriate banner translation key. */
function overallStatusToMessageKey(status: ServiceHealthStatus): string {
  switch (status) {
    case ServiceHealthStatus.Healthy:
      return 'statusPage.allOperational';
    case ServiceHealthStatus.Degraded:
      return 'statusPage.someIssues';
    case ServiceHealthStatus.Down:
      return 'statusPage.majorOutage';
    case ServiceHealthStatus.Unknown:
      return 'statusPage.someIssues';
    default:
      return 'statusPage.someIssues';
  }
}

/** Semantic color bag passed by the component that owns useTheme(). */
interface StatusColorMap {
  success: string;
  warning: string;
  error: string;
  muted: string;
}

/** Map a ServiceHealthStatus to a resolved color string. */
function statusToColor(status: ServiceHealthStatus, colorMap: StatusColorMap): string {
  switch (status) {
    case ServiceHealthStatus.Healthy:
      return colorMap.success;
    case ServiceHealthStatus.Degraded:
      return colorMap.warning;
    case ServiceHealthStatus.Down:
      return colorMap.error;
    case ServiceHealthStatus.Unknown:
      return colorMap.muted;
    default:
      return colorMap.muted;
  }
}

export {
  SERVICE_CONFIGS,
  DEGRADED_THRESHOLD_MS,
  HEALTH_ENDPOINT,
  buildHealthUrl,
  determineStatus,
  deriveOverallStatus,
  statusToLabelKey,
  overallStatusToMessageKey,
  statusToColor,
};
