// utils/provider-manager.js
// Provider Manager — Round-robin routing, failover, health checks

export class ProviderManager {
  constructor(registry) {
    this.registry = registry;
    this.roundRobinIndex = new Map(); // modelId -> index
    this.healthCheckInterval = null;
    this.healthCheckIntervalMs = parseInt(process.env.HEALTH_CHECK_INTERVAL_MS || '60000', 10);
  }

  async start() {
    // Initial health check
    await this.runHealthChecks();
    // Periodic health checks
    this.healthCheckInterval = setInterval(() => {
      this.runHealthChecks().catch(err => 
        console.error('[PROVIDER-MGR] Health check error:', err.message)
      );
    }, this.healthCheckIntervalMs);
    console.log(`[PROVIDER-MGR] Started with ${this.registry.getEnabledProviders().length} providers, health check every ${this.healthCheckIntervalMs}ms`);
  }

  stop() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  async runHealthChecks() {
    const providers = this.registry.getEnabledProviders();
    const results = await Promise.allSettled(
      providers.map(async (provider) => {
        try {
          const start = Date.now();
          await Promise.race([
            provider.checkHealth(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Health check timeout')), 10000)
            )
          ]);
          const latency = Date.now() - start;
          provider.healthStatus = 'healthy';
          provider.lastHealthCheck = new Date().toISOString();
          provider.recordRequest(latency, true);
          return { name: provider.name, status: 'healthy', latency };
        } catch (err) {
          provider.healthStatus = provider.healthStatus === 'healthy' ? 'degraded' : 'down';
          provider.lastHealthCheck = new Date().toISOString();
          provider.recordRequest(0, false);
          return { name: provider.name, status: provider.healthStatus, error: err.message };
        }
      })
    );
    
    const healthy = results.filter(r => r.status === 'fulfilled' && r.value.status === 'healthy').length;
    const total = results.length;
    console.log(`[PROVIDER-MGR] Health check: ${healthy}/${total} providers healthy`);
    return results;
  }

  // Main routing method — find best provider for a model
  async route(modelId, messages, options = {}) {
    const providers = this.registry.getProvidersForModel(modelId);
    
    if (providers.length === 0) {
      throw new Error(`No provider available for model: ${modelId}`);
    }

    // Sort: healthy first, then by priority, then by latency
    const sorted = providers
      .filter(p => p.healthStatus !== 'down')
      .sort((a, b) => {
        // Health status priority: healthy > degraded > unknown
        const healthOrder = { healthy: 0, unknown: 1, degraded: 2, down: 3 };
        const ha = healthOrder[a.healthStatus] ?? 2;
        const hb = healthOrder[b.healthStatus] ?? 2;
        if (ha !== hb) return ha - hb;
        // Then by provider priority
        if (a.priority !== b.priority) return a.priority - b.priority;
        // Then by average latency
        return a.avgLatency - b.avgLatency;
      });

    if (sorted.length === 0) {
      // All providers down — try round-robin on degraded ones
      const degraded = providers.filter(p => p.healthStatus === 'degraded');
      if (degraded.length > 0) {
        return this._roundRobin(modelId, degraded);
      }
      // Last resort — try any provider
      return providers[0];
    }

    // Use round-robin among equally-prioritized healthy providers
    const topPriority = sorted[0].priority;
    const topProviders = sorted.filter(p => p.priority === topPriority && p.healthStatus === 'healthy');
    
    if (topProviders.length > 1) {
      return this._roundRobin(modelId, topProviders);
    }
    
    return sorted[0];
  }

  _roundRobin(modelId, providers) {
    const key = modelId;
    const current = this.roundRobinIndex.get(key) || 0;
    const next = current % providers.length;
    this.roundRobinIndex.set(key, next + 1);
    return providers[next];
  }

  // Execute chat with automatic failover
  async chatWithFailover(modelId, messages, options = {}) {
    const providers = this.registry.getProvidersForModel(modelId);
    
    if (providers.length === 0) {
      throw new Error(`No provider available for model: ${modelId}`);
    }

    // Sort providers by reliability
    const sorted = [...providers]
      .filter(p => p.enabled)
      .sort((a, b) => {
        const healthOrder = { healthy: 0, unknown: 1, degraded: 2, down: 3 };
        return (healthOrder[a.healthStatus] ?? 2) - (healthOrder[b.healthStatus] ?? 2) 
               || a.priority - b.priority;
      });

    let lastError;
    for (const provider of sorted) {
      try {
        const start = Date.now();
        const result = await provider.chat(messages, { ...options, model: modelId });
        const latency = Date.now() - start;
        provider.recordRequest(latency, true);
        provider.healthStatus = 'healthy';
        return { result, provider: provider.name, latency };
      } catch (err) {
        const latency = Date.now() - start;
        provider.recordRequest(latency, false);
        if (provider.healthStatus === 'healthy') {
          provider.healthStatus = 'degraded';
        } else if (provider.healthStatus === 'degraded') {
          provider.healthStatus = 'down';
        }
        lastError = err;
        console.warn(`[PROVIDER-MGR] ${provider.name} failed for ${modelId}: ${err.message}, trying next...`);
      }
    }

    throw lastError || new Error(`All providers failed for model: ${modelId}`);
  }

  // Execute streaming chat with automatic failover
  async chatStreamWithFailover(modelId, messages, options = {}) {
    const providers = this.registry.getProvidersForModel(modelId);
    
    if (providers.length === 0) {
      throw new Error(`No provider available for model: ${modelId}`);
    }

    const sorted = [...providers]
      .filter(p => p.enabled && p.healthStatus !== 'down')
      .sort((a, b) => {
        const healthOrder = { healthy: 0, unknown: 1, degraded: 2, down: 3 };
        return (healthOrder[a.healthStatus] ?? 2) - (healthOrder[b.healthStatus] ?? 2)
               || a.priority - b.priority;
      });

    let lastError;
    for (const provider of sorted) {
      try {
        const stream = await provider.chatStream(messages, { ...options, model: modelId });
        return { stream, provider: provider.name };
      } catch (err) {
        lastError = err;
        console.warn(`[PROVIDER-MGR] ${provider.name} stream failed for ${modelId}: ${err.message}, trying next...`);
      }
    }

    throw lastError || new Error(`All providers failed for streaming model: ${modelId}`);
  }

  getStats() {
    return {
      roundRobinState: Object.fromEntries(this.roundRobinIndex),
      healthCheckIntervalMs: this.healthCheckIntervalMs,
      providers: this.registry.getStats()
    };
  }
}
