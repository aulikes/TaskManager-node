// src/metrics/metrics.ts
import { Registry, collectDefaultMetrics, Counter } from 'prom-client';

const register = new Registry();

// Recolectar métricas por defecto de Node.js (CPU, memoria, etc.)
collectDefaultMetrics({ register });

// Definir un contador personalizado para eventos procesados
export const eventCounter = new Counter({
  name: 'processed_events_total',
  help: 'Total number of processed events',
  labelNames: ['event_type'], // Ej: 'created', 'deleted', 'dlq'
});

export default register;
