// providers/index.js
// Provider Registry — auto-discovers and registers all providers

import { PollinationsProvider } from './pollinations.js';
import { DuckDuckGoProvider } from './duckduckgo.js';
import { OpenRouterProvider } from './openrouter.js';
import { PuterProvider } from './puter.js';
import { GroqProvider } from './groq.js';
import { HuggingFaceProvider } from './huggingface.js';
import { G4FProvider } from './g4f.js';
import { BlackboxProvider } from './blackbox.js';
import { PhindProvider } from './phind.js';
import { GoogleAIProvider } from './google-ai.js';
import { CerebrasProvider } from './cerebras.js';
import { CloudflareProvider } from './cloudflare.js';
import { CohereProvider } from './cohere.js';
import { TogetherProvider } from './together.js';
import { SambaNovaProvider } from './sambanova.js';
import { ScalewayProvider } from './scaleway.js';
import { InferenceProvider } from './inference.js';

const providerClasses = [
  PuterProvider,
  PollinationsProvider,
  DuckDuckGoProvider,
  OpenRouterProvider,
  GroqProvider,
  HuggingFaceProvider,
  G4FProvider,
  BlackboxProvider,
  PhindProvider,
  GoogleAIProvider,
  CerebrasProvider,
  CloudflareProvider,
  CohereProvider,
  TogetherProvider,
  SambaNovaProvider,
  ScalewayProvider,
  InferenceProvider
];

class ProviderRegistry {
  constructor() {
    this.providers = new Map();
    this._initialized = false;
  }

  async init(config = {}) {
    for (const ProviderClass of providerClasses) {
      try {
        const instance = new ProviderClass(config);
        // Check if provider should be enabled
        const envDisabled = process.env[`DISABLE_${instance.name.toUpperCase()}`];
        if (envDisabled === 'true' || envDisabled === '1') {
          instance.enabled = false;
          console.log(`[PROVIDER] ${instance.displayName} disabled by env`);
        }
        this.providers.set(instance.name, instance);
        console.log(`[PROVIDER] ${instance.displayName} registered (${instance.models.length} models, priority ${instance.priority})`);
      } catch (err) {
        console.warn(`[PROVIDER] Failed to register ${ProviderClass.name}:`, err.message);
      }
    }
    this._initialized = true;
    return this;
  }

  getProvider(name) {
    return this.providers.get(name);
  }

  getEnabledProviders() {
    return [...this.providers.values()].filter(p => p.enabled);
  }

  getProvidersByPriority() {
    return this.getEnabledProviders().sort((a, b) => a.priority - b.priority);
  }

  getProvidersForModel(modelId) {
    return this.getEnabledProviders().filter(p => p.supportsModel(modelId));
  }

  getAllModels() {
    const models = [];
    const seen = new Set();
    for (const provider of this.getEnabledProviders()) {
      for (const model of provider.models) {
        const key = model.id;
        if (!seen.has(key)) {
          seen.add(key);
          models.push({
            ...model,
            providers: [provider.name],
            providerPriority: provider.priority
          });
        } else {
          const existing = models.find(m => m.id === key);
          if (existing) {
            existing.providers.push(provider.name);
            if (provider.priority < existing.providerPriority) {
              existing.providerPriority = provider.priority;
              existing.primaryProvider = provider.name;
            }
          }
        }
      }
    }
    return models;
  }

  getStats() {
    return {
      total: this.providers.size,
      enabled: this.getEnabledProviders().length,
      providers: [...this.providers.values()].map(p => p.getStats())
    };
  }
}

// Singleton
export const providerRegistry = new ProviderRegistry();
export default providerRegistry;
