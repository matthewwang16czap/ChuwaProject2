import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 3001, 
    proxy: {
      // Proxy API requests
      "/api": {
        target: process.env.BACKEND_URL, // The backend server
        changeOrigin: true, // Needed for virtual hosted sites
        //rewrite: (path) => path.replace(/^\/api/, '') // Remove '/api' prefix
      },
    },
  },
});
