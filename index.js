import { config } from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from "express";
import { init } from "@heyputer/puter.js/src/init.cjs";
import { pickModel } from "./router.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '.env') });

const puter = init(process.env.PUTER_AUTH_TOKEN);
console.log("Puter initialized, auth:", !!process.env.PUTER_AUTH_TOKEN);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

function extractContent(content) {
  if (typeof content === "string") {
    return content;
  } else if (Array.isArray(content)) {
    return content.map(c => c.text || c).join("");
  }
  return "";
}

app.post("/v1/chat/completions", async (req, res) => {
  try {
    let { messages, model, stream } = req.body;
    
    if (!model || model === "auto" || model === "Auto") {
      model = pickModel(messages);
    }
    
    if (!messages || !Array.isArray(messages)) {
      messages = [{ role: "user", content: "" }];
    }
    
    const response = await puter.ai.chat(messages, {
      model: model,
      stream: false
    });
    
    const contentText = extractContent(response.message?.content);
    
    res.json({
      id: "chatcmpl-" + Date.now(),
      object: "chat.completion",
      created: Date.now(),
      model: model,
      choices: [{ 
        index: 0, 
        message: { role: "assistant", content: contentText }, 
        finish_reason: "stop" 
      }],
      usage: response.usage || {}
    });
    
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ 
      error: error.message,
      type: "internal_error"
    });
  }
});

app.post("/v1/messages", async (req, res) => {
  try {
    let { messages, model, max_tokens, stream, system, prompt } = req.body;
    
    if (!model || model === "auto" || model === "Auto") {
      model = "claude-opus-4-5-latest";
    }
    
    let allMessages = [];
    if (system) {
      allMessages.push({ role: "system", content: system });
    }
    if (messages && Array.isArray(messages)) {
      allMessages.push(...messages);
    } else if (prompt) {
      allMessages.push({ role: "user", content: prompt });
    }
    
    if (allMessages.length === 0) {
      allMessages.push({ role: "user", content: "" });
    }
    
    const response = await puter.ai.chat(allMessages, {
      model: model,
      stream: false,
      max_tokens: max_tokens || 4096
    });
    
    const contentText = extractContent(response.message?.content);
    
    const contentBlocks = contentText 
      ? [{ type: "text", text: contentText }]
      : [];

    res.json({
      id: response.message?.id || "msg_" + Date.now(),
      type: "message",
      role: "assistant",
      content: contentBlocks,
      model: model,
      stop_reason: response.message?.stop_reason || "end_turn",
      usage: response.usage || { input_tokens: 0, output_tokens: 0 }
    });
    
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ 
      error: error.message, 
      type: "error" 
    });
  }
});

app.post("/chat", async (req, res) => {
  try {
    let { messages, model, stream } = req.body;
    
    if (!model || model === "auto" || model === "Auto") {
      model = pickModel(messages);
    }
    
    if (!messages || !Array.isArray(messages)) {
      messages = [{ role: "user", content: "" }];
    }
    
    const response = await puter.ai.chat(messages, {
      model: model,
      stream: false
    });
    
    res.json(response);
    
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3333, () => {
  console.log("Puter proxy server running on http://localhost:3333");
  console.log("Available routes:");
  console.log("  POST /chat - Chat with AI (auto-routing)");
  console.log("  POST /v1/chat/completions - OpenAI-compatible API");
  console.log("  POST /v1/messages - Anthropic-compatible API");
});
