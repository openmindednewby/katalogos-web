# Distributed Tracing

> **Status**: TODO
> **Priority**: P2 - Required for Debugging at Scale
> **Estimated Scope**: Medium (All Backend Services + Infrastructure)
> **Estimated Effort**: 3-5 days

---

## 1. Problem

5 microservices communicate via HTTP and RabbitMQ. When a request fails or is slow, there's no way to trace it across service boundaries. Current debugging requires manually correlating logs across Loki by timestamp and correlation ID.

---

## 2. Solution

Integrate OpenTelemetry with Jaeger for distributed tracing.

### 2.1 Why OpenTelemetry + Jaeger

- **OpenTelemetry**: Vendor-neutral instrumentation (can switch backends later)
- **Jaeger**: Open-source, lightweight, integrates with existing Grafana stack
- **Already partially ready**: Services already use correlation IDs via `UseCorrelationIdMiddleware()`

---

## 3. Architecture

```
Services (OpenTelemetry SDK)
    │
    ▼ (OTLP/gRPC)
Jaeger Collector (Port 4317)
    │
    ▼
Jaeger Query (Port 16686) ◄── Grafana (Jaeger datasource)
    │
    ▼
Storage (Badger/Elasticsearch)
```

---

## 4. What Gets Traced

| Layer | Traces |
|-------|--------|
| HTTP Incoming | All API requests (method, path, status, duration) |
| HTTP Outgoing | Service-to-service calls |
| Database | EF Core queries (SQL, duration) |
| RabbitMQ | Message publish and consume |
| SignalR | Hub connection and method calls |
| Redis | Cache operations |

---

## 5. Implementation Steps

1. Add `OpenTelemetry.Extensions.Hosting` and related NuGet packages to all services
2. Add Jaeger to `infrastructure/observability/docker-compose.yml`
3. Configure OpenTelemetry in each service's Program.cs:
   ```csharp
   builder.Services.AddOpenTelemetry()
       .WithTracing(tracing => tracing
           .AddAspNetCoreInstrumentation()
           .AddHttpClientInstrumentation()
           .AddEntityFrameworkCoreInstrumentation()
           .AddSource("MassTransit")
           .AddOtlpExporter(o => o.Endpoint = new Uri("http://jaeger:4317")));
   ```
4. Add Jaeger datasource to Grafana provisioning
5. Add trace ID to structured log output (correlate logs with traces)
6. Add `jaeger` Tilt resource (manual trigger, like observability stack)

---

## 6. Verification

- [ ] Traces visible in Jaeger UI for all 5 services
- [ ] Cross-service traces show full request journey
- [ ] Database queries appear as child spans
- [ ] RabbitMQ publish/consume linked as spans
- [ ] Grafana can query Jaeger traces
- [ ] Trace ID appears in Loki log entries
