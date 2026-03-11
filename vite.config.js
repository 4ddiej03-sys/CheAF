import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      {
        name: "claude-proxy",
        configureServer(server) {
          server.middlewares.use("/api/claude", async (req, res) => {
            if (req.method !== "POST") {
              res.statusCode = 405;
              res.end("Method not allowed");
              return;
            }

            // Read API key from .env file directly
            let apiKey = "";
            try {
              const envPath = path.resolve(process.cwd(), ".env");
              const envContent = fs.readFileSync(envPath, "utf-8");
              const match = envContent.match(/VITE_ANTHROPIC_API_KEY=(.+)/);
              apiKey = match ? match[1].trim() : "";
            } catch {}

            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "No API key in .env file" }));
              return;
            }

            let body = "";
            req.on("data", chunk => { body += chunk; });
            req.on("end", async () => {
              try {
                const response = await fetch("https://api.anthropic.com/v1/messages", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                  },
                  body,
                });
                const data = await response.json();
                res.setHeader("Content-Type", "application/json");
                res.statusCode = response.status;
                res.end(JSON.stringify(data));
              } catch (err) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          });
        },
      },
    ],
  };
});
