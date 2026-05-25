/** Health status of an individual backend service. */
const enum ServiceHealthStatus {
  Healthy = 'healthy',
  Degraded = 'degraded',
  Down = 'down',
  Unknown = 'unknown',
}

export default ServiceHealthStatus;
