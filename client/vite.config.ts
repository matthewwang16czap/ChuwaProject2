import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, 
    proxy: {
      // Proxy API requests
      "/api": {
        target: "http://localhost:5000", // The backend server
        changeOrigin: true, // Needed for virtual hosted sites
        //rewrite: (path) => path.replace(/^\/api/, '') // Remove '/api' prefix
      },
      "/documents": {
        target: "http://localhost:5000", // The backend server
        changeOrigin: true, // Needed for virtual hosted sites
        //rewrite: (path) => path.replace(/^\/api/, '') // Remove '/api' prefix
      }
    },
  },
});
