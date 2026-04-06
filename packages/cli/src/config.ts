import { readFile, writeFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join, dirname } from "node:path";

export interface CliConfig {
  baseUrl: string;
  apiKey?: string;
}

const DEFAULT_CONFIG: CliConfig = {
  baseUrl: "http://localhost:3030",
};

function configPath(): string {
  return join(homedir(), ".odinrc");
}

export async function loadConfig(): Promise<CliConfig> {
  const envUrl = process.env.ODIN_BASE_URL;
  const envKey = process.env.ODIN_API_KEY;

  let fromFile: Partial<CliConfig> = {};
  try {
    const text = await readFile(configPath(), "utf8");
    fromFile = JSON.parse(text);
  } catch {
    // missing or unreadable config file is fine — we fall back to defaults
  }

  return {
    baseUrl: envUrl ?? fromFile.baseUrl ?? DEFAULT_CONFIG.baseUrl,
    apiKey: envKey ?? fromFile.apiKey,
  };
}

export async function saveConfig(next: CliConfig): Promise<void> {
  const path = configPath();
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(next, null, 2) + "\n", "utf8");
}
