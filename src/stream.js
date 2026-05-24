/**
 * Streaming Engine
 * 
 * Server-Sent Events (SSE) streaming support for Express responses.
 * Pipes tokens from async generators as SSE events in OpenAI-compatible format.
 * 
 * SSE format:
 *   data: {"id":"...","object":"chat.completion.chunk","created":...,"model":"...","choices":[{"index":0,"delta":{"content":"token"},"finish_reason":null}]}
 *   data: [DONE]
 */

/**
 * Stream a response from an async generator to an Express response object.
 * 
 * @param {import('express').Response} res – Express response
 * @param {AsyncGenerator|AsyncIterable} asyncGenerator – Source of streaming chunks
 * @param {Object} [options] – { headers, onToken, onComplete, onError }
 */
export async function streamResponse(res, asyncGenerator, options = {}) {
  const {
    onToken,
    onComplete,
    onError,
  } = options;

  // ── Set SSE headers ───────────────────────────────────────────────
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',  // Disable nginx buffering
    'Access-Control-Allow-Origin': '*',
    ...options.headers,
  });

  res.flushHeaders();

  let tokenCount = 0;
  let fullContent = '';

  try {
    // Resolve the generator if it's a promise (e.g. from provider.stream())
    const generator = asyncGenerator instanceof Promise
      ? await asyncGenerator
      : asyncGenerator;

    // Ensure we have an async iterable
    if (!generator || typeof generator[Symbol.asyncIterator] !== 'function') {
      // Not iterable – send as single chunk
      const content = typeof generator === 'string' ? generator : JSON.stringify(generator);
      sendSSEChunk(res, {
        id: `stream-${Date.now()}`,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: 'unknown',
        choices: [{ index: 0, delta: { content }, finish_reason: null }],
      });
      sendSSEDone(res);
      return;
    }

    for await (const chunk of generator) {
      // Extract token content for callbacks
      const delta = chunk?.choices?.[0]?.delta;
      const token = delta?.content || '';
      const finishReason = chunk?.choices?.[0]?.finish_reason;

      if (token) {
        tokenCount++;
        fullContent += token;

        if (onToken) {
          onToken(token, tokenCount);
        }
      }

      // Send the chunk as SSE
      sendSSEChunk(res, chunk);

      // If finish_reason is set, we're done
      if (finishReason === 'stop') {
        break;
      }
    }

    // Send [DONE] marker
    sendSSEDone(res);

    if (onComplete) {
      onComplete(fullContent, tokenCount);
    }
  } catch (error) {
    console.error('[Stream] Error:', error.message);

    if (onError) {
      onError(error);
    }

    // Try to send error as SSE event
    try {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/event-stream' });
      }
      sendSSEChunk(res, {
        id: `stream-error-${Date.now()}`,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: 'unknown',
        choices: [{
          index: 0,
          delta: { content: `\n\n[Streaming Error: ${error.message}]` },
          finish_reason: 'stop',
        }],
      });
      sendSSEDone(res);
    } catch (sendError) {
      // Response already closed – nothing we can do
      console.error('[Stream] Failed to send error:', sendError.message);
    }
  } finally {
    // Ensure response is ended
    try {
      res.end();
    } catch {
      // Already ended
    }
  }
}

/**
 * Send a single SSE data chunk
 */
function sendSSEChunk(res, data) {
  if (res.writableEnded || res.destroyed) return;

  try {
    const json = typeof data === 'string' ? data : JSON.stringify(data);
    res.write(`data: ${json}\n\n`);
  } catch (error) {
    console.error('[Stream] Write error:', error.message);
  }
}

/**
 * Send the SSE [DONE] marker
 */
function sendSSEDone(res) {
  if (res.writableEnded || res.destroyed) return;

  try {
    res.write('data: [DONE]\n\n');
  } catch (error) {
    console.error('[Stream] Done write error:', error.message);
  }
}

/**
 * Create a mock async generator from a plain text string.
 * Useful for testing or wrapping non-streaming responses.
 * 
 * @param {string} text – Full text to stream
 * @param {Object} options – { model, chatId, chunkSize }
 * @returns {AsyncGenerator}
 */
export async function* createMockStream(text, options = {}) {
  const {
    model = 'mock',
    chatId = `mock-${Date.now()}`,
    chunkSize = 4,
  } = options;

  // Split text into chunks
  for (let i = 0; i < text.length; i += chunkSize) {
    const token = text.slice(i, i + chunkSize);
    yield {
      id: chatId,
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [{
        index: 0,
        delta: { content: token },
        finish_reason: null,
      }],
    };
  }

  // Final chunk
  yield {
    id: chatId,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{
      index: 0,
      delta: {},
      finish_reason: 'stop',
    }],
  };
}

/**
 * Convert a non-streaming response into a streaming async generator.
 * 
 * @param {Object} response – Normalised chat completion response
 * @param {Object} options – { model, chunkSize }
 * @returns {AsyncGenerator}
 */
export async function* responseToStream(response, options = {}) {
  const content = response?.choices?.[0]?.message?.content || '';
  const model = options.model || response?.model || 'unknown';
  const chatId = response?.id || `stream-${Date.now()}`;
  const chunkSize = options.chunkSize || 8;

  for (let i = 0; i < content.length; i += chunkSize) {
    yield {
      id: chatId,
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [{
        index: 0,
        delta: { content: content.slice(i, i + chunkSize) },
        finish_reason: null,
      }],
    };
  }

  yield {
    id: chatId,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
  };
}

export default {
  streamResponse,
  createMockStream,
  responseToStream,
};
