import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    // Commerce reads these via process.env in the browser. Vite only exposes
    // import.meta.env unless we define the process.env keys here.
    define: {
      "process.env.VITE_CHAIN": JSON.stringify(env.VITE_CHAIN ?? ""),
      "process.env.VITE_CONTRACT_ADDRESS": JSON.stringify(env.VITE_CONTRACT_ADDRESS ?? ""),
      "process.env.VITE_PAYMENT_TOKEN": JSON.stringify(env.VITE_PAYMENT_TOKEN ?? ""),
    },
    server: {
      port: 5173,
      host: true,
      allowedHosts: true,
      proxy: {
        "/api": {
          target: "http://127.0.0.1:3001",
          changeOrigin: true,
          rewrite: (url) => url.replace(/^\/api/, ""),
        },
      },
    },
  };
});
