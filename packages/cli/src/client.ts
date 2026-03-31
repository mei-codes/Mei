import { OdinClient } from "@odin/sdk";
import { loadConfig } from "./config.js";

export async function makeClient(): Promise<OdinClient> {
  const cfg = await loadConfig();
  return new OdinClient({
    baseUrl: cfg.baseUrl,
    apiKey: cfg.apiKey,
    userAgent: "odin-cli/0.0.1",
  });
}
