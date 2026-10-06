interface Env {
  I18N_RATE_LIMITER: RateLimit;
  PUBLIC_DATA_RATE_LIMITER?: RateLimit;
  DAILY_NEWS: DurableObjectNamespace;
}
