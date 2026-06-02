import type { NextConfig } from "next";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadRootEnv() {
  for (const envFile of [
    resolve(process.cwd(), ".env.local"),
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "../.env.local"),
    resolve(process.cwd(), "../.env"),
  ]) {
    if (!existsSync(envFile)) continue;

    for (const rawLine of readFileSync(envFile, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#") || !line.includes("=")) continue;

      const [key, ...valueParts] = line.split("=");
      if (key && process.env[key] === undefined) {
        process.env[key] = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
      }
    }
  }
}

loadRootEnv();

const backendUrl = (process.env.BACKEND_URL ?? "http://127.0.0.1:8000").replace(
  /\/$/,
  ""
);

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
