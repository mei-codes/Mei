import pino from "pino";

export const logger = pino({
  level: process.env.ODIN_LOG_LEVEL ?? "info",
  base: { service: "odin-server" },
  timestamp: pino.stdTimeFunctions.isoTime,
});
