/**
 * Task-Based Routing Engine
 * 
 * Routes incoming requests to the best LLM provider based on
 * task classification. Supports primary/fallback chains and
 * hybrid execution (multi-provider refinement).
 * 
 * ROUTING MAP:
 *   code       → qwen (primary),       zai (fallback)
 *   reasoning  → zai (primary),        puter/deepseek-reasoner (fallback)
 *   infra      → qwen + zai review (hybrid)
 *   multimodal → zai (primary),        puter/gpt-4o (fallback)
 *   structured → qwen (primary),       zai (fallback)
 *   general    → zai (primary),        puter/gpt-4o (fallback)
 */

import { classifyTask } from './classifier.js';
import { PuterProvider } from './providers/puter.js';
import { QwenProvider } from './providers/qwen.js';
import { ZaiProvider } from './providers/zai.js';

// ── Provider registry ───────────────────────────────────────────────────
const providers = {
  puter: PuterProvider,
  qwen: QwenProvider,
  zai: ZaiProvider,
};

// ── Routing configuration ───────────────────────────────────────────────
const ROUTING_MAP = {
  code: {
    primary: { provider: 'qwen', model: 'qwen-2.5-coder-32b-instruct' },
    fallback: { provider: 'zai', model: 'zai-default' },
  },
  reasoning: {
    primary: { provider: 'zai', model: 'zai-default' },
    fallback: { provider: 'puter', model: 'deepseek-reasoner' },
  },
  infra: {
    primary: { provider: 'qwen', model: 'qwen-2.5-coder-32b-instruct' },
    fallback: { provider: 'zai', model: 'zai-default' },
    hybrid: true,  // Enable hybrid mode: qwen generates → zai refines
  },
  multimodal: {
    primary: { provider: 'zai', model: 'zai-default' },
    fallback: { provider: 'puter', model: 'gpt-4o' },
  },
  structured: {
    primary: { provider: 'qwen', model: 'qwen-2.5-coder-32b-instruct' },
    fallback: { provider: 'zai', model: 'zai-default' },
  },
  general: {
    primary: { provider: 'zai', model: 'zai-default' },
    fallback: { provider: 'puter', model: 'gpt-4o' },
  },
};

/**
 * Determine the routing decision for a given messages array.
 * Does NOT execute the request – returns the routing plan only.
 * 
 * @param {Array} messages – OpenAI-style messages
 * @param {Object} [options] – { overrideModel, overrideProvider }
 * @returns {{ provider: string, model: string, fallback: Object, classification: Object, hybrid: boolean }}
 */
export function routeTask(messages, options = {}) {
  const classification = classifyTask(messages);

  // Allow explicit overrides
  if (options.overrideProvider && options.overrideModel) {
    return {
      provider: options.overrideProvider,
      model: options.overrideModel,
      fallback: null,
      classification,
      hybrid: false,
    };
  }

  const route = ROUTING_MAP[classification.type] || ROUTING_MAP.general;

  return {
    provider: route.primary.provider,
    model: route.primary.model,
    fallback: route.fallback || null,
    classification,
    hybrid: !!route.hybrid,
  };
}

/**
 * Execute a chat completion with automatic routing and fallback.
 * 
 * @param {Array} messages – OpenAI-style messages
 * @param {Object} [options] – { stream, temperature, max_tokens, overrideModel, overrideProvider }
 * @returns {Object} Normalised chat completion response
 */
export async function executeRouted(messages, options = {}) {
  const route = routeTask(messages, options);

  // Hybrid execution for infra tasks
  if (route.hybrid && !options.stream) {
    return executeHybrid('infra', messages, options);
  }

  // Standard primary → fallback chain
  return executeWithFallback(messages, route, options);
}

/**
 * Execute with fallback chain.
 * Tries the primary provider, falls back if it fails.
 */
async function executeWithFallback(messages, route, options) {
  const { provider: primaryName, model: primaryModel, fallback } = route;

  // Try primary
  try {
    const primaryProvider = providers[primaryName];
    if (!primaryProvider) {
      throw new Error(`Unknown provider: ${primaryName}`);
    }

    if (options.stream) {
      return primaryProvider.stream(messages, { ...options, model: primaryModel });
    }

    return await primaryProvider.chat(messages, { ...options, model: primaryModel });
  } catch (primaryError) {
    console.warn(
      `[Router] Primary provider ${primaryName}/${primaryModel} failed: ${primaryError.message}`
    );

    // Try fallback
    if (fallback) {
      try {
        const fallbackProvider = providers[fallback.provider];
        if (!fallbackProvider) {
          throw new Error(`Unknown fallback provider: ${fallback.provider}`);
        }

        console.log(`[Router] Falling back to ${fallback.provider}/${fallback.model}`);

        if (options.stream) {
          return fallbackProvider.stream(messages, { ...options, model: fallback.model });
        }

        return await fallbackProvider.chat(messages, { ...options, model: fallback.model });
      } catch (fallbackError) {
        console.error(
          `[Router] Fallback provider ${fallback.provider}/${fallback.model} also failed: ${fallbackError.message}`
        );
        throw new Error(
          `All providers failed. Primary: ${primaryError.message}. Fallback: ${fallbackError.message}`
        );
      }
    }

    // No fallback available
    throw primaryError;
  }
}

/**
 * Execute a hybrid task – one provider generates, another refines.
 * Used for infra tasks: qwen generates the base answer, zai reviews & refines.
 * 
 * @param {string} taskType – Task type (e.g. 'infra')
 * @param {Array} messages – OpenAI-style messages
 * @param {Object} options – Additional options
 * @returns {Object} Refined chat completion response
 */
export async function executeHybrid(taskType, messages, options = {}) {
  const route = ROUTING_MAP[taskType] || ROUTING_MAP.general;
  const { provider: primaryName, model: primaryModel } = route.primary;
  const { provider: reviewName, model: reviewModel } = route.fallback || route.primary;

  console.log(`[Router] Hybrid execution: ${primaryName} generates → ${reviewName} reviews`);

  try {
    // Step 1: Primary provider generates the base response
    const primaryProvider = providers[primaryName];
    if (!primaryProvider) throw new Error(`Unknown primary provider: ${primaryName}`);

    const baseResponse = await primaryProvider.chat(messages, { ...options, model: primaryModel });
    const baseContent = baseResponse?.choices?.[0]?.message?.content || '';

    if (!baseContent) {
      return baseResponse; // Nothing to refine
    }

    // Step 2: Review provider refines the base response
    const reviewProvider = providers[reviewName];
    if (!reviewProvider || reviewName === primaryName) {
      // Same provider or no review provider – just return base
      return baseResponse;
    }

    const reviewMessages = [
      {
        role: 'system',
        content: `You are a senior reviewer. The following is a draft response generated for an infrastructure/system task. 
Review it for accuracy, completeness, and best practices. Improve it where needed. 
Return ONLY the improved response, without meta-commentary about your changes.`,
      },
      {
        role: 'user',
        content: baseContent,
      },
    ];

    const refinedResponse = await reviewProvider.chat(reviewMessages, {
      ...options,
      model: reviewModel,
    });

    // Merge metadata
    const refinedContent = refinedResponse?.choices?.[0]?.message?.content || baseContent;

    return {
      id: `hybrid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: `${primaryName}/${primaryModel}+${reviewName}/${reviewModel}`,
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content: refinedContent },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: (baseResponse?.usage?.prompt_tokens || 0) + (refinedResponse?.usage?.prompt_tokens || 0),
        completion_tokens: (baseResponse?.usage?.completion_tokens || 0) + (refinedResponse?.usage?.completion_tokens || 0),
        total_tokens: (baseResponse?.usage?.total_tokens || 0) + (refinedResponse?.usage?.total_tokens || 0),
      },
      provider: `${primaryName}+${reviewName}`,
      hybrid: true,
    };
  } catch (error) {
    console.error(`[Router] Hybrid execution failed: ${error.message}`);
    // Fallback to single-provider execution
    return executeWithFallback(messages, route, options);
  }
}

/**
 * Execute with streaming support – returns async generator
 */
export async function executeRoutedStream(messages, options = {}) {
  const route = routeTask(messages, options);
  // Streaming does not support hybrid mode; use primary only
  const { provider: primaryName, model: primaryModel, fallback } = route;

  try {
    const primaryProvider = providers[primaryName];
    if (!primaryProvider) throw new Error(`Unknown provider: ${primaryName}`);
    return primaryProvider.stream(messages, { ...options, model: primaryModel });
  } catch (primaryError) {
    console.warn(`[Router] Streaming primary ${primaryName} failed: ${primaryError.message}`);

    if (fallback) {
      try {
        const fallbackProvider = providers[fallback.provider];
        if (!fallbackProvider) throw new Error(`Unknown fallback provider: ${fallback.provider}`);
        return fallbackProvider.stream(messages, { ...options, model: fallback.model });
      } catch (fallbackError) {
        throw new Error(`Streaming failed on all providers. ${primaryError.message} / ${fallbackError.message}`);
      }
    }

    throw primaryError;
  }
}

/**
 * Get the full routing map (for /models and /status endpoints)
 */
export function getRoutingMap() {
  return ROUTING_MAP;
}

/**
 * Get all registered providers
 */
export function getProviders() {
  return providers;
}

export default {
  routeTask,
  executeRouted,
  executeRoutedStream,
  executeHybrid,
  getRoutingMap,
  getProviders,
};
