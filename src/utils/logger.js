module.exports = {
  info: (...args) => console.log("[INFO]", ...args),

  command: (...args) => console.log("[COMMAND]", ...args),

  warn: (...args) => console.warn("[WARN]", ...args),

  error: (...args) => console.error("[ERROR]", ...args),
};
