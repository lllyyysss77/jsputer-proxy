// config/providers.js
// Provider configuration — model mappings, aliases, and defaults

export const PROVIDER_CONFIG = {
  puter: {
    name: 'puter',
    displayName: 'Puter.js SDK',
    priority: 1,
    timeout: 60000,
    models: [
      { id: 'deepseek-chat', type: 'reasoning', description: 'DeepSeek Chat — general purpose, planning', maxTokens: 8192 },
      { id: 'gpt-5-chat', type: 'general', description: 'OpenAI GPT-5 Chat', maxTokens: 8192 },
      { id: 'gpt-4o', type: 'general', description: 'OpenAI GPT-4o — complex reasoning', maxTokens: 8192 },
      { id: 'gpt-4o-mini', type: 'fast', description: 'OpenAI GPT-4o Mini — quick tasks', maxTokens: 8192 },
      { id: 'gemini-2.0-flash', type: 'fast', description: 'Google Gemini 2.0 Flash', maxTokens: 8192 },
      { id: 'claude-opus-4-5-latest', type: 'code/analysis', description: 'Claude Opus 4.5 — best for code', maxTokens: 8192 },
      { id: 'claude-sonnet-4', type: 'balanced', description: 'Claude Sonnet 4 — code + analysis', maxTokens: 8192 },
      { id: 'claude-haiku-4-5', type: 'fast', description: 'Claude Haiku 4.5 — quick', maxTokens: 8192 },
      { id: 'grok-3', type: 'general', description: 'xAI Grok 3', maxTokens: 8192 },
      { id: 'grok-3-fast', type: 'fast', description: 'xAI Grok 3 Fast', maxTokens: 8192 },
      { id: 'grok-2-vision', type: 'vision', description: 'xAI Grok 2 Vision', maxTokens: 8192 },
      { id: 'mistral-large-2512', type: 'general', description: 'Mistral Large', maxTokens: 8192 },
      { id: 'codestral-2508', type: 'code', description: 'Codestral — code gen', maxTokens: 8192 },
      { id: 'qwen-2.5-coder-32b-instruct', type: 'code', description: 'Qwen 2.5 Coder 32B', maxTokens: 8192 }
    ]
  },
  pollinations: {
    name: 'pollinations',
    displayName: 'Pollinations AI',
    priority: 1,
    baseUrl: 'https://text.pollinations.ai',
    timeout: 30000,
    models: [
      { id: 'openai', type: 'general', description: 'GPT-4o Mini via Pollinations', aliases: ['gpt-4o-mini'], maxTokens: 4096 },
      { id: 'mistral', type: 'general', description: 'Mistral via Pollinations', aliases: ['mistral-large'], maxTokens: 4096 },
      { id: 'llama', type: 'general', description: 'Llama 3.1 via Pollinations', aliases: ['llama-3.1-70b'], maxTokens: 4096 },
      { id: 'deepseek-r1', type: 'reasoning', description: 'DeepSeek R1 via Pollinations', aliases: ['deepseek-reasoner'], maxTokens: 4096 },
      { id: 'qwen', type: 'general', description: 'Qwen 2.5 Coder via Pollinations', aliases: ['qwen-coder'], maxTokens: 4096 }
    ]
  },
  duckduckgo: {
    name: 'duckduckgo',
    displayName: 'DuckDuckGo AI Chat',
    priority: 1,
    baseUrl: 'https://duckduckgo.com',
    timeout: 30000,
    models: [
      { id: 'gpt-4o-mini', type: 'fast', description: 'GPT-4o Mini via DDG', maxTokens: 4096 },
      { id: 'claude-3-haiku', type: 'fast', description: 'Claude 3 Haiku via DDG', aliases: ['claude-haiku'], maxTokens: 4096 },
      { id: 'llama-3.1-70b', type: 'general', description: 'Llama 3.1 70B via DDG', aliases: ['llama'], maxTokens: 4096 },
      { id: 'mixtral-8x7b', type: 'general', description: 'Mixtral 8x7B via DDG', aliases: ['mixtral'], maxTokens: 4096 }
    ]
  },
  openrouter: {
    name: 'openrouter',
    displayName: 'OpenRouter Free',
    priority: 1,
    baseUrl: 'https://openrouter.ai/api/v1',
    timeout: 30000,
    models: []
    // Models will be auto-fetched from OpenRouter API
  },
  groq: {
    name: 'groq',
    displayName: 'Groq',
    priority: 2,
    baseUrl: 'https://api.groq.com/openai/v1',
    timeout: 30000,
    models: [
      { id: 'llama-3.3-70b-versatile', type: 'general', description: 'Llama 3.3 70B on Groq', maxTokens: 8192 },
      { id: 'llama-3.1-8b-instant', type: 'fast', description: 'Llama 3.1 8B Instant on Groq', maxTokens: 8192 },
      { id: 'mixtral-8x7b-32768', type: 'general', description: 'Mixtral 8x7B on Groq', maxTokens: 32768 },
      { id: 'gemma2-9b-it', type: 'fast', description: 'Gemma 2 9B on Groq', maxTokens: 8192 }
    ]
  },
  huggingface: {
    name: 'huggingface',
    displayName: 'HuggingFace Inference',
    priority: 2,
    baseUrl: 'https://api-inference.huggingface.co/models',
    timeout: 60000,
    models: [
      { id: 'meta-llama/Llama-3.1-70B-Instruct', type: 'general', description: 'Llama 3.1 70B on HF', maxTokens: 4096 },
      { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', type: 'general', description: 'Mixtral 8x7B on HF', maxTokens: 4096 },
      { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', type: 'code', description: 'Qwen 2.5 Coder on HF', maxTokens: 4096 }
    ]
  },
  g4f: {
    name: 'g4f',
    displayName: 'G4F/FreeGPT',
    priority: 2,
    timeout: 45000,
    models: [
      { id: 'gpt-4o', type: 'general', description: 'GPT-4o via G4F', aliases: ['gpt4o-g4f'], maxTokens: 4096 },
      { id: 'gpt-4o-mini', type: 'fast', description: 'GPT-4o Mini via G4F', maxTokens: 4096 },
      { id: 'claude-3-5-sonnet', type: 'balanced', description: 'Claude 3.5 Sonnet via G4F', maxTokens: 4096 }
    ]
  },
  blackbox: {
    name: 'blackbox',
    displayName: 'Blackbox AI',
    priority: 3,
    baseUrl: 'https://www.blackbox.ai',
    timeout: 30000,
    models: [
      { id: 'blackboxai', type: 'general', description: 'Blackbox AI', maxTokens: 4096 },
      { id: 'blackboxai-pro', type: 'general', description: 'Blackbox AI Pro', maxTokens: 4096 }
    ]
  },
  phind: {
    name: 'phind',
    displayName: 'Phind',
    priority: 3,
    baseUrl: 'https://www.phind.com',
    timeout: 30000,
    models: [
      { id: 'Phind-70B', type: 'code', description: 'Phind 70B — code specialist', aliases: ['phind-70b'], maxTokens: 4096 }
    ]
  },
  'google-ai': {
    name: 'google-ai',
    displayName: 'Google AI Studio',
    priority: 1,
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    timeout: 30000,
    models: [
      { id: 'gemini-2.0-flash', type: 'fast', description: 'Gemini 2.0 Flash — fast, capable', maxTokens: 1048576 },
      { id: 'gemini-2.5-flash-preview-05-20', type: 'fast', description: 'Gemini 2.5 Flash Preview — latest fast model', maxTokens: 1048576 },
      { id: 'gemini-2.5-pro-preview-05-06', type: 'general', description: 'Gemini 2.5 Pro Preview — most capable', maxTokens: 1048576 },
      { id: 'gemma-3-27b-it', type: 'general', description: 'Gemma 3 27B IT — open model', maxTokens: 8192 }
    ]
  },
  cerebras: {
    name: 'cerebras',
    displayName: 'Cerebras',
    priority: 2,
    baseUrl: 'https://api.cerebras.ai/v1',
    timeout: 15000,
    models: [
      { id: 'llama-4-scout-17b-16e-instruct', type: 'fast', description: 'Llama 4 Scout on Cerebras — ultra-fast', maxTokens: 8192 },
      { id: 'llama3.1-8b', type: 'fast', description: 'Llama 3.1 8B on Cerebras — fastest', maxTokens: 8192 },
      { id: 'llama3.1-70b', type: 'general', description: 'Llama 3.1 70B on Cerebras', maxTokens: 8192 }
    ]
  },
  cloudflare: {
    name: 'cloudflare',
    displayName: 'Cloudflare Workers AI',
    priority: 2,
    baseUrl: 'https://api.cloudflare.com/client/v4/accounts',
    timeout: 30000,
    models: [
      { id: '@cf/meta/llama-3.3-70b-instruct-fp8-fast', type: 'general', description: 'Llama 3.3 70B on Cloudflare', maxTokens: 8192 },
      { id: '@cf/qwen/qwen3-32b', type: 'general', description: 'Qwen 3 32B on Cloudflare', maxTokens: 8192 },
      { id: '@cf/google/gemma-3-27b-it', type: 'general', description: 'Gemma 3 27B on Cloudflare', maxTokens: 8192 },
      { id: '@cf/mistralai/mistral-small-3.1-24b-instruct', type: 'fast', description: 'Mistral Small 3.1 on Cloudflare', maxTokens: 8192 }
    ]
  },
  cohere: {
    name: 'cohere',
    displayName: 'Cohere',
    priority: 2,
    baseUrl: 'https://api.cohere.ai/v2',
    timeout: 30000,
    models: [
      { id: 'command-a-03-2025', type: 'general', description: 'Command A — most capable Cohere model', maxTokens: 16384 },
      { id: 'command-r-08-2024', type: 'general', description: 'Command R — balanced performance', maxTokens: 16384 },
      { id: 'command-r-plus-08-2024', type: 'general', description: 'Command R+ — enhanced reasoning', maxTokens: 16384 }
    ]
  }
};

// Model alias mapping — when user requests these, map to actual model IDs
export const MODEL_ALIASES = {
  'gpt4': 'gpt-4o',
  'gpt4o': 'gpt-4o',
  'gpt4-mini': 'gpt-4o-mini',
  'gpt4o-mini': 'gpt-4o-mini',
  'claude': 'claude-opus-4-5-latest',
  'claude-opus': 'claude-opus-4-5-latest',
  'claude-sonnet': 'claude-sonnet-4',
  'claude-haiku': 'claude-haiku-4-5',
  'deepseek': 'deepseek-chat',
  'deepseek-r1': 'deepseek-reasoner',
  'gemini': 'gemini-2.0-flash',
  'gemini-flash': 'gemini-2.0-flash',
  'grok': 'grok-3',
  'llama': 'llama-3.3-70b-versatile',
  'mixtral': 'mixtral-8x7b-32768',
  'qwen-coder': 'qwen-2.5-coder-32b-instruct',
  'codestral': 'codestral-2508',
  'mistral': 'mistral-large-2512',
  'qwen': 'Qwen/Qwen3-32B',
  'qwen3': 'Qwen/Qwen3-32B',
  'deepseek-v3': 'deepseek-v3',
  'deepseek-r1': 'deepseek-r1',
  'nemotron': 'nvidia/Nemotron-3-Super-120B-A12B',
  'gemma4': 'google/gemma-4-26b-it',
  'cogito': 'nvidia/Llama-3.3-Cogito-v1-70B',
  'together-llama': 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  'samba-deepseek': 'DeepSeek-V3.1-671B',
  'samba-minimax': 'MiniMax-M2.7'
};

export default PROVIDER_CONFIG;
