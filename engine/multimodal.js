/**
 * ProxyGateLLM Multi-Modal Engine v1.0
 * Supports: Text, Image, Audio, Video, Code, Documents
 * Future-proof for 10+ years of AI evolution
 */

const PROXYGATELLM_BASE = process.env.PROXYGATELLM_URL || 'http://localhost:3333';

/**
 * Multi-Modal Content Types
 */
export const ContentTypes = {
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  CODE: 'code',
  DOCUMENT: 'document',
  TABLE: 'table',
  CHART: 'chart',
  JSON: 'json',
  MARKDOWN: 'markdown',
};

/**
 * Multi-Modal Content Block
 */
export class ContentBlock {
  constructor(type, content, metadata = {}) {
    this.type = type;
    this.content = content;
    this.metadata = metadata;
    this.timestamp = Date.now();
  }

  toJSON() {
    return {
      type: this.type,
      content: this.content,
      metadata: this.metadata,
      timestamp: this.timestamp,
    };
  }

  static text(content, metadata = {}) {
    return new ContentBlock(ContentTypes.TEXT, content, metadata);
  }

  static image(url, alt = '', metadata = {}) {
    return new ContentBlock(ContentTypes.IMAGE, url, { alt, ...metadata });
  }

  static audio(url, transcript = '', metadata = {}) {
    return new ContentBlock(ContentTypes.AUDIO, url, { transcript, ...metadata });
  }

  static video(url, thumbnail = '', metadata = {}) {
    return new ContentBlock(ContentTypes.VIDEO, url, { thumbnail, ...metadata });
  }

  static code(code, language = 'auto', metadata = {}) {
    return new ContentBlock(ContentTypes.CODE, code, { language, ...metadata });
  }

  static document(url, type = 'pdf', metadata = {}) {
    return new ContentBlock(ContentTypes.DOCUMENT, url, { docType: type, ...metadata });
  }

  static table(headers, rows, metadata = {}) {
    return new ContentBlock(ContentTypes.TABLE, { headers, rows }, metadata);
  }

  static chart(data, chartType = 'bar', metadata = {}) {
    return new ContentBlock(ContentTypes.CHART, data, { chartType, ...metadata });
  }

  static json(data, metadata = {}) {
    return new ContentBlock(ContentTypes.JSON, data, metadata);
  }

  static markdown(content, metadata = {}) {
    return new ContentBlock(ContentTypes.MARKDOWN, content, metadata);
  }
}

/**
 * Multi-Modal Message
 */
export class MultiModalMessage {
  constructor(role, blocks = []) {
    this.role = role;
    this.blocks = Array.isArray(blocks) ? blocks : [blocks];
    this.timestamp = Date.now();
  }

  addBlock(block) {
    this.blocks.push(block);
    return this;
  }

  text(content) {
    this.blocks.push(ContentBlock.text(content));
    return this;
  }

  image(url, alt = '') {
    this.blocks.push(ContentBlock.image(url, alt));
    return this;
  }

  audio(url, transcript = '') {
    this.blocks.push(ContentBlock.audio(url, transcript));
    return this;
  }

  video(url, thumbnail = '') {
    this.blocks.push(ContentBlock.video(url, thumbnail));
    return this;
  }

  code(code, language = 'auto') {
    this.blocks.push(ContentBlock.code(code, language));
    return this;
  }

  toOpenAI() {
    const content = this.blocks.map(block => {
      switch (block.type) {
        case ContentTypes.TEXT:
        case ContentTypes.MARKDOWN:
          return { type: 'text', text: block.content };

        case ContentTypes.IMAGE:
          if (block.content.startsWith('http')) {
            return {
              type: 'image_url',
              image_url: { url: block.content, detail: block.metadata.detail || 'auto' }
            };
          }
          return {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${block.content}`, detail: block.metadata.detail || 'auto' }
          };

        case ContentTypes.AUDIO:
          return {
            type: 'input_audio',
            input_audio: { data: block.content, format: block.metadata.format || 'wav' }
          };

        case ContentTypes.CODE:
          return { type: 'text', text: `\`\`\`${block.metadata.language}\n${block.content}\n\`\`\`` };

        case ContentTypes.TABLE:
          const { headers, rows } = block.content;
          const tableStr = [headers.join(' | '), headers.map(() => '---').join(' | '), ...rows.map(r => r.join(' | '))].join('\n');
          return { type: 'text', text: tableStr };

        case ContentTypes.JSON:
          return { type: 'text', text: JSON.stringify(block.content, null, 2) };

        default:
          return { type: 'text', text: String(block.content) };
      }
    });

    return { role: this.role, content };
  }

  toAnthropic() {
    const content = this.blocks.map(block => {
      switch (block.type) {
        case ContentTypes.TEXT:
        case ContentTypes.MARKDOWN:
          return { type: 'text', text: block.content };

        case ContentTypes.IMAGE:
          const mediaType = block.metadata.mediaType || 'image/jpeg';
          const source = block.content.startsWith('http')
            ? { type: 'url', url: block.content }
            : { type: 'base64', media_type: mediaType, data: block.content };
          return { type: 'image', source };

        case ContentTypes.CODE:
          return { type: 'text', text: `\`\`\`${block.metadata.language}\n${block.content}\n\`\`\`` };

        default:
          return { type: 'text', text: String(block.content) };
      }
    });

    return { role: this.role, content };
  }

  toJSON() {
    return {
      role: this.role,
      blocks: this.blocks.map(b => b.toJSON()),
      timestamp: this.timestamp,
    };
  }
}

/**
 * Multi-Modal LLM Client
 */
export class MultiModalClient {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || PROXYGATELLM_BASE;
    this.defaultModel = config.model || 'auto';
  }

  /**
   * Send multi-modal message
   */
  async chat(messages, options = {}) {
    const model = options.model || this.defaultModel;

    // Convert messages to OpenAI format
    const openaiMessages = messages.map(msg => {
      if (msg instanceof MultiModalMessage) {
        return msg.toOpenAI();
      }
      if (typeof msg === 'string') {
        return { role: 'user', content: msg };
      }
      return msg;
    });

    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: openaiMessages,
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * Analyze image with text
   */
  async analyzeImage(imageUrl, question = 'What do you see in this image?') {
    const msg = new MultiModalMessage('user')
      .text(question)
      .image(imageUrl);

    return this.chat([msg]);
  }

  /**
   * Transcribe audio (if model supports it)
   */
  async transcribeAudio(audioUrl) {
    const msg = new MultiModalMessage('user')
      .text('Transcribe this audio:')
      .audio(audioUrl);

    return this.chat([msg]);
  }

  /**
   * Generate code from description
   */
  async generateCode(description, language = 'javascript') {
    const msg = new MultiModalMessage('user')
      .text(`Generate ${language} code for: ${description}`);

    return this.chat([msg], { model: 'claude-opus-4-5-latest' });
  }

  /**
   * Review code
   */
  async reviewCode(code, language = 'auto') {
    const msg = new MultiModalMessage('user')
      .code(code, language)
      .text('Review this code for bugs, security issues, and improvements.');

    return this.chat([msg], { model: 'deepseek-chat' });
  }

  /**
   * Analyze document
   */
  async analyzeDocument(docUrl, question = 'Summarize this document.') {
    const msg = new MultiModalMessage('user')
      .text(question)
      .document(docUrl);

    return this.chat([msg]);
  }
}

export default MultiModalClient;