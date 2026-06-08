/**
 * ProxyGateLLM Tool Abstraction Layer v1.0
 * Unified tool interface supporting multiple execution backends
 * The "Universal Tool Adapter" for any AI agent
 */

/**
 * Tool Result
 */
export class ToolResult {
  constructor(output, metadata = {}) {
    this.output = output;
    this.success = metadata.success !== false;
    this.duration = metadata.duration || 0;
    this.metadata = metadata;
    this.timestamp = Date.now();
  }

  static success(output, metadata = {}) {
    return new ToolResult(output, { ...metadata, success: true });
  }

  static error(message, metadata = {}) {
    return new ToolResult(null, { ...metadata, success: false, error: message });
  }

  toJSON() {
    return {
      output: this.output,
      success: this.success,
      duration: this.duration,
      metadata: this.metadata,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Base Tool Class
 */
export class Tool {
  constructor(config) {
    this.name = config.name;
    this.description = config.description;
    this.category = config.category || 'general';
    this.schema = config.schema || { type: 'object', properties: {} };
    this.handler = config.handler;
    this.permissions = config.permissions || [];
    this.cache = config.cache || null;
    this.timeout = config.timeout || 30000;
  }

  /**
   * Execute the tool
   */
  async execute(args, context = {}) {
    const start = Date.now();

    try {
      // Check permissions
      if (this.permissions.length > 0) {
        const hasPermission = this.permissions.every(p => context.permissions?.includes(p));
        if (!hasPermission) {
          return ToolResult.error(`Missing permissions: ${this.permissions.join(', ')}`);
        }
      }

      // Check cache
      if (this.cache) {
        const cached = await this.cache.get(this.name, args);
        if (cached) return cached;
      }

      // Execute with timeout
      const result = await Promise.race([
        this.handler(args, context),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Tool timeout')), this.timeout)
        ),
      ]);

      const toolResult = result instanceof ToolResult ? result : ToolResult.success(result);

      // Cache result
      if (this.cache && toolResult.success) {
        await this.cache.set(this.name, args, toolResult);
      }

      toolResult.duration = Date.now() - start;
      return toolResult;
    } catch (error) {
      return ToolResult.error(error.message, { duration: Date.now() - start });
    }
  }

  /**
   * Convert to OpenAI function calling format
   */
  toOpenAI() {
    return {
      type: 'function',
      function: {
        name: this.name,
        description: this.description,
        parameters: this.schema,
      },
    };
  }

  /**
   * Convert to MCP tool format
   */
  toMCP() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.schema,
    };
  }

  /**
   * Convert to A2A skill format
   */
  toA2A() {
    return {
      id: this.name,
      name: this.name,
      description: this.description,
      tags: [this.category],
      examples: [],
    };
  }
}

/**
 * Tool Registry — Central tool management
 */
export class ToolRegistry {
  constructor() {
    this.tools = new Map();
    this.categories = new Map();
  }

  /**
   * Register a tool
   */
  register(tool) {
    if (!(tool instanceof Tool)) {
      tool = new Tool(tool);
    }

    this.tools.set(tool.name, tool);

    // Index by category
    if (!this.categories.has(tool.category)) {
      this.categories.set(tool.category, []);
    }
    this.categories.get(tool.category).push(tool.name);

    return this;
  }

  /**
   * Get a tool
   */
  get(name) {
    return this.tools.get(name);
  }

  /**
   * Execute a tool
   */
  async execute(name, args, context = {}) {
    const tool = this.tools.get(name);
    if (!tool) {
      return ToolResult.error(`Tool not found: ${name}`);
    }
    return tool.execute(args, context);
  }

  /**
   * Get all tools as OpenAI functions
   */
  toOpenAI() {
    return Array.from(this.tools.values()).map(t => t.toOpenAI());
  }

  /**
   * Get all tools as MCP format
   */
  toMCP() {
    return Array.from(this.tools.values()).map(t => t.toMCP());
  }

  /**
   * Get all tools as A2A skills
   */
  toA2A() {
    return Array.from(this.tools.values()).map(t => t.toA2A());
  }

  /**
   * Search tools by query
   */
  search(query) {
    const q = query.toLowerCase();
    return Array.from(this.tools.values()).filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  }

  /**
   * List categories
   */
  listCategories() {
    return Array.from(this.categories.entries()).map(([name, tools]) => ({
      name,
      tools: tools.length,
    }));
  }
}

/**
 * Built-in Tools
 */
export const BuiltinTools = {
  /**
   * File operations
   */
  readFile: new Tool({
    name: 'read_file',
    description: 'Read content from a file',
    category: 'filesystem',
    schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path to read' },
      },
      required: ['path'],
    },
    handler: async (args) => {
      const fs = await import('fs/promises');
      return await fs.readFile(args.path, 'utf-8');
    },
  }),

  writeFile: new Tool({
    name: 'write_file',
    description: 'Write content to a file',
    category: 'filesystem',
    schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path to write' },
        content: { type: 'string', description: 'Content to write' },
      },
      required: ['path', 'content'],
    },
    handler: async (args) => {
      const fs = await import('fs/promises');
      const path = await import('path');
      await fs.mkdir(path.dirname(args.path), { recursive: true });
      await fs.writeFile(args.path, args.content, 'utf-8');
      return { success: true, path: args.path };
    },
  }),

  /**
   * Terminal operations
   */
  runCommand: new Tool({
    name: 'run_command',
    description: 'Execute a shell command',
    category: 'terminal',
    schema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Command to execute' },
        cwd: { type: 'string', description: 'Working directory' },
      },
      required: ['command'],
    },
    handler: async (args) => {
      const { execSync } = await import('child_process');
      return execSync(args.command, { cwd: args.cwd, encoding: 'utf-8', timeout: 30000 });
    },
  }),

  /**
   * Web operations
   */
  webSearch: new Tool({
    name: 'web_search',
    description: 'Search the web',
    category: 'web',
    schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
      },
      required: ['query'],
    },
    handler: async (args) => {
      const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(args.query)}`, {
        headers: { 'Accept': 'application/json' },
      });
      const data = await response.json();
      return data.web?.results?.slice(0, 5) || [];
    },
  }),

  /**
   * Git operations
   */
  gitStatus: new Tool({
    name: 'git_status',
    description: 'Get git repository status',
    category: 'git',
    schema: {
      type: 'object',
      properties: {
        cwd: { type: 'string', description: 'Repository path' },
      },
    },
    handler: async (args) => {
      const { execSync } = await import('child_process');
      return execSync('git status --short', { cwd: args.cwd, encoding: 'utf-8' });
    },
  }),

  /**
   * HTTP operations
   */
  httpRequest: new Tool({
    name: 'http_request',
    description: 'Make an HTTP request',
    category: 'web',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Request URL' },
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'], default: 'GET' },
        headers: { type: 'object', description: 'Request headers' },
        body: { type: 'string', description: 'Request body' },
      },
      required: ['url'],
    },
    handler: async (args) => {
      const response = await fetch(args.url, {
        method: args.method || 'GET',
        headers: args.headers || {},
        body: args.body,
      });
      return await response.json();
    },
  }),
};

export default ToolRegistry;