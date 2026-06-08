/**
 * ProxyGateLLM Agent Orchestration Runtime v1.0
 * Graph-based execution engine inspired by LangGraph
 * Supports: Sequential, Parallel, Conditional, Loop patterns
 */

/**
 * Node types for the execution graph
 */
export const NodeTypes = {
  LLM: 'llm',
  TOOL: 'tool',
  CONDITION: 'condition',
  PARALLEL: 'parallel',
  LOOP: 'loop',
  SUBGRAPH: 'subgraph',
  HUMAN: 'human',
  AGGREGATOR: 'aggregator',
};

/**
 * Graph Node
 */
export class Node {
  constructor(config) {
    this.id = config.id;
    this.type = config.type || NodeTypes.LLM;
    this.handler = config.handler;
    this.config = config.config || {};
    this.inputs = config.inputs || [];
    this.outputs = config.outputs || [];
  }
}

/**
 * Edge between nodes
 */
export class Edge {
  constructor(from, to, condition = null) {
    this.from = from;
    this.to = to;
    this.condition = condition;
  }
}

/**
 * Execution State
 */
export class State {
  constructor(initial = {}) {
    this.data = { ...initial };
    this.history = [];
    this.metadata = {
      startTime: Date.now(),
      nodeExecutions: [],
      tokenUsage: { input: 0, output: 0 },
      cost: 0,
    };
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    this.history.push({ key, value, timestamp: Date.now() });
    return this;
  }

  update(partial) {
    Object.assign(this.data, partial);
    return this;
  }

  snapshot() {
    return JSON.parse(JSON.stringify(this.data));
  }

  restore(snapshot) {
    this.data = { ...snapshot };
    return this;
  }
}

/**
 * Agent Graph — The Core Orchestration Engine
 */
export class AgentGraph {
  constructor(config = {}) {
    this.name = config.name || 'unnamed-graph';
    this.nodes = new Map();
    this.edges = [];
    this.entryNode = null;
    this.checkpointer = config.checkpointer || null;
    this.maxIterations = config.maxIterations || 100;
  }

  /**
   * Add a node to the graph
   */
  addNode(id, config) {
    const node = new Node({ id, ...config });
    this.nodes.set(id, node);
    return this;
  }

  /**
   * Add an edge between nodes
   */
  addEdge(from, to, condition = null) {
    this.edges.push(new Edge(from, to, condition));
    return this;
  }

  /**
   * Set entry point
   */
  setEntryPoint(nodeId) {
    this.entryNode = nodeId;
    return this;
  }

  /**
   * Set finish point
   */
  setFinishPoint(nodeId) {
    this.finishNode = nodeId;
    return this;
  }

  /**
   * Compile the graph (validate)
   */
  compile() {
    if (!this.entryNode) {
      throw new Error('Entry point not set');
    }

    // Validate all edges reference existing nodes
    for (const edge of this.edges) {
      if (!this.nodes.has(edge.from)) {
        throw new Error(`Edge references unknown node: ${edge.from}`);
      }
      if (!this.nodes.has(edge.to)) {
        throw new Error(`Edge references unknown node: ${edge.to}`);
      }
    }

    return {
      graph: this,
      invoke: (state) => this.invoke(state),
      stream: (state) => this.stream(state),
    };
  }

  /**
   * Invoke the graph
   */
  async invoke(initialState = {}) {
    const state = new State(initialState);
    let currentNode = this.entryNode;
    let iterations = 0;

    while (currentNode && iterations < this.maxIterations) {
      iterations++;

      const node = this.nodes.get(currentNode);
      if (!node) {
        throw new Error(`Node not found: ${currentNode}`);
      }

      // Execute node
      const start = Date.now();
      let output;

      try {
        output = await node.handler(state, node.config);
      } catch (error) {
        output = { error: error.message };
      }

      // Record execution
      state.metadata.nodeExecutions.push({
        nodeId: currentNode,
        type: node.type,
        duration: Date.now() - start,
        output: typeof output === 'string' ? output.substring(0, 100) : 'object',
      });

      // Update state with output
      if (typeof output === 'object' && output !== null) {
        state.update(output);
      } else {
        state.set('lastOutput', output);
      }

      // Find next node
      const edges = this.edges.filter(e => e.from === currentNode);
      let nextNode = null;

      for (const edge of edges) {
        if (!edge.condition || edge.condition(state)) {
          nextNode = edge.to;
          break;
        }
      }

      currentNode = nextNode;
    }

    if (iterations >= this.maxIterations) {
      console.warn(`Graph exceeded max iterations: ${this.maxIterations}`);
    }

    return state;
  }

  /**
   * Stream execution (simulated)
   */
  async *stream(initialState = {}) {
    const state = new State(initialState);
    let currentNode = this.entryNode;
    let iterations = 0;

    while (currentNode && iterations < this.maxIterations) {
      iterations++;

      const node = this.nodes.get(currentNode);
      if (!node) break;

      yield { type: 'node_start', nodeId: currentNode, nodeType: node.type };

      const start = Date.now();
      let output;

      try {
        output = await node.handler(state, node.config);
      } catch (error) {
        output = { error: error.message };
      }

      state.metadata.nodeExecutions.push({
        nodeId: currentNode,
        type: node.type,
        duration: Date.now() - start,
      });

      if (typeof output === 'object' && output !== null) {
        state.update(output);
      } else {
        state.set('lastOutput', output);
      }

      yield { type: 'node_complete', nodeId: currentNode, output };

      // Find next node
      const edges = this.edges.filter(e => e.from === currentNode);
      let nextNode = null;

      for (const edge of edges) {
        if (!edge.condition || edge.condition(state)) {
          nextNode = edge.to;
          break;
        }
      }

      currentNode = nextNode;
    }

    yield { type: 'graph_complete', state: state.snapshot() };
  }
}

/**
 * Built-in Node Handlers
 */
export const Handlers = {
  /**
   * LLM Node — call a language model
   */
  llm: (config) => async (state, nodeConfig) => {
    const { baseUrl = 'http://localhost:3333' } = nodeConfig;
    const model = config.model || state.get('model') || 'auto';
    const messages = config.messages(state) || [{ role: 'user', content: state.get('input') || '' }];

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, max_tokens: config.maxTokens || 2048 }),
    });

    const data = await response.json();
    return { output: data.choices?.[0]?.message?.content || '' };
  },

  /**
   * Tool Node — execute a tool
   */
  tool: (toolFn) => async (state, nodeConfig) => {
    const input = state.get('toolInput') || state.get('input') || '';
    const result = await toolFn(input, state);
    return { toolResult: result };
  },

  /**
   * Condition Node — branch based on state
   */
  condition: (conditionFn) => async (state) => {
    const result = conditionFn(state);
    return { conditionResult: result };
  },

  /**
   * Parallel Node — run multiple nodes concurrently
   */
  parallel: (nodeHandlers) => async (state) => {
    const results = await Promise.all(
      nodeHandlers.map(handler => handler(state))
    );
    return { parallelResults: results };
  },

  /**
   * Human Node — pause for human input
   */
  human: (promptFn) => async (state) => {
    const prompt = typeof promptFn === 'function' ? promptFn(state) : promptFn;
    // In real implementation, this would pause and wait for human input
    return { humanInput: null, humanPrompt: prompt };
  },

  /**
   * Aggregator Node — combine multiple inputs
   */
  aggregator: (strategy = 'concat') => async (state) => {
    const inputs = state.get('parallelResults') || [];
    let result;

    switch (strategy) {
      case 'concat':
        result = inputs.map(i => i.output || i).join('\n\n');
        break;
      case 'merge':
        result = Object.assign({}, ...inputs.map(i => typeof i === 'object' ? i : { value: i }));
        break;
      case 'sum':
        result = inputs.reduce((sum, i) => sum + (typeof i === 'number' ? i : 0), 0);
        break;
      default:
        result = inputs;
    }

    return { aggregated: result };
  },
};

export default AgentGraph;