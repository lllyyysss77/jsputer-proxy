/**
 * Task Classification Engine
 * 
 * Analyses incoming messages to classify the task type, enabling
 * intelligent routing to the most appropriate LLM provider.
 * 
 * Classification types:
 *   code       – code generation, debugging, refactoring, implementation
 *   reasoning  – logical reasoning, explanations, step-by-step analysis
 *   infra      – infrastructure, deployment, system configuration
 *   multimodal – image/vision tasks, creative writing, design
 *   structured – JSON, YAML, schemas, tables, structured data
 *   general    – fallback for unclassified tasks
 */

// ── Keyword patterns with weights ───────────────────────────────────────
const TASK_PATTERNS = {
  code: {
    weight: 1.2,  // Boost – code tasks are the most common
    keywords: [
      'code', 'implement', 'debug', 'refactor', 'function', 'class', 'api',
      'sql', 'database', 'frontend', 'backend', 'deploy', 'docker', 'write a',
      'create a', 'build', 'develop', 'script', 'algorithm', 'compile', 'syntax',
      'variable', 'import', 'export', 'module', 'async', 'promise', 'callback',
      'typescript', 'javascript', 'python', 'rust', 'go', 'java', 'react',
      'component', 'hook', 'middleware', 'endpoint', 'route', 'query', 'mutation',
      'orm', 'schema', 'migration', 'test', 'unit test', 'integration test',
      'lint', 'format', 'parse', 'serialize', 'deserialize', 'regex',
      'git', 'commit', 'branch', 'merge', 'pull request', 'ci/cd',
      'package', 'dependency', 'npm', 'pip', 'cargo',
    ],
  },

  reasoning: {
    weight: 1.0,
    keywords: [
      'reason', 'solve', 'explain', 'how does', 'why is', 'what is',
      'step by step', 'proof', 'calculate', 'think about', 'analyze',
      'compare', 'derive', 'logic', 'mathematical', 'theorem', 'hypothesis',
      'deduction', 'inference', 'correlation', 'causation', 'paradox',
      'philosophical', 'ethical', 'implication', 'conclude', 'evaluate',
      'justify', 'argue', 'counterargument', 'premise', 'assumption',
      'abstract', 'conceptual', 'theoretical', 'framework',
    ],
  },

  infra: {
    weight: 1.1,
    keywords: [
      'system', 'infrastructure', 'config', 'server', 'kubernetes', 'terraform',
      'monitoring', 'scale', 'cloud', 'aws', 'gcp', 'azure', 'devops',
      'pipeline', 'container', 'orchestration', 'load balancer', 'nginx',
      'haproxy', 'dns', 'ssl', 'tls', 'certificate', 'firewall',
      'network', 'vpc', 'subnet', 'security group', 'iam', 'rbac',
      'helm', 'ansible', 'puppet', 'chef', 'vagrant', 'consul',
      'prometheus', 'grafana', 'datadog', 'elk', 'logging', 'alerting',
      'uptime', 'slo', 'sla', 'incident', 'post-mortem',
    ],
  },

  multimodal: {
    weight: 1.0,
    keywords: [
      'image', 'vision', 'draw', 'create visual', 'design', 'creative',
      'write story', 'poem', 'art', 'illustration', 'photo', 'screenshot',
      'diagram', 'mockup', 'wireframe', 'animation', 'video', 'audio',
      'music', 'compose', 'lyrics', 'narrative', 'fiction', 'character',
      'scene', 'visualize', 'render', 'graphic', 'canvas', 'svg',
      'chart', 'plot', 'infographic', 'brand', 'logo', 'icon',
    ],
  },

  structured: {
    weight: 1.0,
    keywords: [
      'json', 'yaml', 'config', 'schema', 'format', 'table', 'list',
      'organize', 'structure', 'xml', 'csv', 'tsv', 'markdown',
      'template', 'form', 'validate', 'parse json', 'serialize',
      'api spec', 'openapi', 'swagger', 'protobuf', 'graphql schema',
      'database schema', 'migration', 'seed', 'fixture',
      'catalog', 'inventory', 'taxonomy', 'hierarchy', 'tree',
      'matrix', 'grid', 'spreadsheet', 'worksheet',
    ],
  },
};

// ── Contextual modifiers ────────────────────────────────────────────────
// Patterns that override or boost classification based on structural signals
const STRUCTURAL_PATTERNS = [
  { regex: /```[\s\S]*?```/g, type: 'code', boost: 0.3 },         // Code blocks
  { regex: /\b(json|yaml|xml)\b\s*(object|array|file|format)/i, type: 'structured', boost: 0.3 },
  { regex: /\b(step\s*\d|first|second|third|finally)\b/gi, type: 'reasoning', boost: 0.2 },
  { regex: /\b(docker|k8s|kubectl)\b/gi, type: 'infra', boost: 0.3 },
  { regex: /\b(image|photo|picture|screenshot)\b/gi, type: 'multimodal', boost: 0.3 },
];

// ── Classifier ──────────────────────────────────────────────────────────
/**
 * Classify the task type from a messages array.
 * @param {Array} messages – OpenAI-style messages array
 * @returns {{ type: string, confidence: number, keywords: string[], scores: Object }}
 */
export function classifyTask(messages) {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return { type: 'general', confidence: 0, keywords: [], scores: {} };
  }

  // Concatenate all message content into a single string for analysis
  const fullText = messages
    .map(m => {
      if (typeof m.content === 'string') return m.content;
      if (Array.isArray(m.content)) return m.content.map(c => c.text || c).join(' ');
      return '';
    })
    .join(' ');

  const lowerText = fullText.toLowerCase();

  // ── Step 1: Keyword scoring ───────────────────────────────────────
  const scores = {};
  const matchedKeywords = {};

  for (const [type, pattern] of Object.entries(TASK_PATTERNS)) {
    let score = 0;
    const matched = [];

    for (const keyword of pattern.keywords) {
      // Use word-boundary-aware matching for short keywords
      const regex = keyword.length <= 3
        ? new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'gi')
        : new RegExp(escapeRegex(keyword), 'gi');

      const matches = lowerText.match(regex);
      if (matches) {
        score += matches.length;
        matched.push(keyword);
      }
    }

    scores[type] = score * pattern.weight;
    matchedKeywords[type] = matched;
  }

  // ── Step 2: Structural pattern boost ──────────────────────────────
  for (const { regex, type, boost } of STRUCTURAL_PATTERNS) {
    const matches = fullText.match(regex);
    if (matches) {
      scores[type] = (scores[type] || 0) + matches.length * boost * 10;
    }
  }

  // ── Step 3: Role-aware weighting ──────────────────────────────────
  // System messages and the last user message carry more weight
  const systemMessages = messages.filter(m => m.role === 'system');
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');

  if (systemMessages.length > 0) {
    const systemText = systemMessages.map(m => m.content || '').join(' ').toLowerCase();
    for (const [type, pattern] of Object.entries(TASK_PATTERNS)) {
      for (const keyword of pattern.keywords) {
        if (systemText.includes(keyword)) {
          scores[type] = (scores[type] || 0) + 0.5;
        }
      }
    }
  }

  if (lastUserMessage) {
    const userText = (typeof lastUserMessage.content === 'string'
      ? lastUserMessage.content
      : '').toLowerCase();

    // Strong signal: the latest user message is usually the most indicative
    for (const [type, pattern] of Object.entries(TASK_PATTERNS)) {
      for (const keyword of pattern.keywords) {
        if (userText.includes(keyword)) {
          scores[type] = (scores[type] || 0) + 0.3;
        }
      }
    }
  }

  // ── Step 4: Determine winner ──────────────────────────────────────
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  if (totalScore === 0) {
    return {
      type: 'general',
      confidence: 0,
      keywords: [],
      scores,
    };
  }

  // Find highest scoring type
  let bestType = 'general';
  let bestScore = 0;

  for (const [type, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestType = type;
    }
  }

  // Confidence = ratio of best score to total (0–1)
  const confidence = Math.min(bestScore / totalScore, 1.0);

  // If confidence is very low, default to general
  if (confidence < 0.15) {
    bestType = 'general';
  }

  return {
    type: bestType,
    confidence: Math.round(confidence * 100) / 100,
    keywords: matchedKeywords[bestType] || [],
    scores,
  };
}

// ── Utility ─────────────────────────────────────────────────────────────
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default classifyTask;
