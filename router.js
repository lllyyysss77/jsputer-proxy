export function pickModel(messages) {
  const text = messages.map(m => m.content || "").join(" ").toLowerCase();
  
  // If "auto" or empty, use intelligent default
  if (!text || text.trim() === "") {
    return "deepseek-chat";
  }
  
  // BUILDING (Code, Architecture, Implementation)
  if (
    text.includes("code") ||
    text.includes("implement") ||
    text.includes("function") ||
    text.includes("class") ||
    text.includes("api") ||
    text.includes("debug") ||
    text.includes("bug") ||
    text.includes("fix") ||
    text.includes("refactor") ||
    text.includes("sql") ||
    text.includes("database") ||
    text.includes("frontend") ||
    text.includes("backend") ||
    text.includes("deploy") ||
    text.includes("config") ||
    text.includes("docker") ||
    text.includes("kubernetes") ||
    text.includes("terraform") ||
    text.includes("write a") ||
    text.includes("create a") ||
    text.includes("build") ||
    text.includes("develop")
  ) {
    return "claude-opus-4-5-latest";  // Best for code, architecture, implementation
  }
  
  // PLANNING (Architecture, Design, Analysis)
  if (
    text.includes("plan") ||
    text.includes("design") ||
    text.includes("rencana") ||
    text.includes("rencanakan") ||
    text.includes("strategy") ||
    text.includes("analyze") ||
    text.includes("compare") ||
    text.includes("decision") ||
    text.includes("recommend") ||
    text.includes("struktur") ||
    text.includes("periksa") ||
    text.includes("overview") ||
    text.includes("roadmap") ||
    text.includes("alur") ||
    text.includes("diagram") ||
    text.includes("flow") ||
    text.includes("system design") ||
    text.includes("high level")
  ) {
    return "deepseek-chat";  // DeepSeek for planning and general tasks
  }
  
  // REASONING (Complex problem solving, math, logic)
  if (
    text.includes("reason") ||
    text.includes("solve") ||
    text.includes("explain") ||
    text.includes("how does") ||
    text.includes("why is") ||
    text.includes("what is") ||
    text.includes("step by step") ||
    text.includes("proof") ||
    text.includes("calculate") ||
    text.includes("derive") ||
    text.includes("think about")
  ) {
    return "gpt-4o";  // GPT-4o for complex reasoning
  }
  
  // FAST/GENERAL (Quick tasks, simple questions)
  if (
    text.includes("?") ||
    text.length < 100
  ) {
    return "gpt-4o-mini";  // Fast model for simple queries
  }
  
  // Default - balanced for most tasks
  return "deepseek-chat";
}
