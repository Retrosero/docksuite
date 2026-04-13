import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_ERP_PROXY_TARGET || "http://127.0.0.1:8000";
  const siteName = env.VITE_ERP_SITE_NAME || "frontend";

  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 4173,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          headers: {
            "X-Frappe-Site-Name": siteName
          }
        }
      }
    }
  };
});
