import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export interface CliConfig {
  baseUrl: string;
  apiKey?: string;
}

const DEFAULT_CONFIG: CliConfig = {
  baseUrl: "http://localhost:3030",
};

export async function loadConfig(): Promise<CliConfig> {
  let fromFile: Partial<CliConfig> = {};
  try {
    const text = await readFile(join(homedir(), ".odinrc"), "utf8");
    fromFile = JSON.parse(text);
  } catch {
    // missing or unreadable rc is fine
  }
  return {
    baseUrl: process.env.ODIN_BASE_URL ?? fromFile.baseUrl ?? DEFAULT_CONFIG.baseUrl,
    apiKey: process.env.ODIN_API_KEY ?? fromFile.apiKey,
  };
}
