/**
 * ProxyGateLLM Engine v1.0 — The Complete AI Orchestration Platform
 * 
 * The "Operating System for AI Agents"
 * - Multi-Modal: Text, Image, Audio, Video, Code
 * - Orchestration: Graph-based execution engine
 * - MCP Gateway: Aggregate all MCP servers
 * - A2A Protocol: Agent-to-Agent interoperability
 * - Tools: Universal tool abstraction
 * - Observability: Tracing and cost tracking
 * - Marketplace: Discover and share agents
 * 
 * Zero backend. Pure middleware. 10+ year relevance.
 */

// Import components for internal use
import { MultiModalClient } from './multimodal.js';
import { AgentGraph, Handlers } from './orchestration.js';
import { MCPGateway } from './mcp-gateway.js';
import { A2AServer } from './a2a-protocol.js';
import { ToolRegistry, BuiltinTools } from './tools.js';
import { Tracer } from './observability.js';
import { AgentMarketplace } from './marketplace.js';

// Re-export all engines for external use
export { ContentTypes, ContentBlock, MultiModalMessage, MultiModalClient } from './multimodal.js';
export { NodeTypes, Node, Edge, State, AgentGraph, Handlers } from './orchestration.js';
export { MCPRegistry, MCPGateway } from './mcp-gateway.js';
export { AgentCard, A2ATask, A2AMessage, A2AServer } from './a2a-protocol.js';
export { Tool, ToolRegistry, ToolResult, BuiltinTools } from './tools.js';
export { Span, Trace, Tracer } from './observability.js';
export { AgentPackage, AgentMarketplace, BuiltinPackages } from './marketplace.js';

/**
 * ProxyGateLLM Engine — Main Entry Point
 */
export class ProxyGateLLMEngine {
  constructor(config = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:3333',
      ...config,
    };

    // Initialize components
    this.multimodal = new MultiModalClient(this.config);
    this.tracer = new Tracer(this.config.tracing || {});
    this.tools = new ToolRegistry();
    this.marketplace = new AgentMarketplace(this.config.marketplace || {});

    // Register built-in tools
    Object.values(BuiltinTools).forEach(tool => this.tools.register(tool));

    // A2A and MCP are initialized on demand
    this.a2a = null;
    this.mcp = null;
  }

  /**
   * Initialize A2A server
   */
  initA2A(options = {}) {
    this.a2a = new A2AServer({
      baseUrl: this.config.baseUrl,
      ...options,
    });
    return this.a2a;
  }

  /**
   * Initialize MCP gateway
   */
  initMCP(servers = []) {
    this.mcp = new MCPGateway({
      baseUrl: this.config.baseUrl,
    });
    return this.mcp.initialize(servers);
  }

  /**
   * Create an agent graph
   */
  createGraph(name, options = {}) {
    return new AgentGraph({ name, ...options });
  }

  /**
   * Start a trace
   */
  startTrace(name, metadata = {}) {
    return this.tracer.startTrace(name, metadata);
  }

  /**
   * Chat with multi-modal support
   */
  async chat(messages, options = {}) {
    const trace = this.startTrace('chat', { model: options.model });
    const span = trace.startSpan({ name: 'chat', type: 'llm', attributes: options });

    try {
      const result = await this.multimodal.chat(messages, options);
      span.setAttribute('output_length', result.length);
      span.end('ok');
      return result;
    } catch (error) {
      span.end('error');
      span.addEvent('error', { message: error.message });
      throw error;
    } finally {
      this.tracer.endTrace(trace.id);
    }
  }

  /**
   * Get analytics
   */
  getAnalytics() {
    return {
      tracing: this.tracer.getAnalytics(),
      tools: this.tools.listCategories(),
      marketplace: {
        popular: this.marketplace.getPopular(5),
        categories: this.marketplace.listCategories(),
      },
    };
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      version: '1.0.0',
      name: 'ProxyGateLLM Engine',
      components: {
        multimodal: true,
        orchestration: true,
        mcp: !!this.mcp,
        a2a: !!this.a2a,
        tools: this.tools.tools.size,
        marketplace: this.marketplace.packages.size,
        tracing: this.tracer.traces.size,
      },
      baseUrl: this.config.baseUrl,
    };
  }
}

export default ProxyGateLLMEngine;