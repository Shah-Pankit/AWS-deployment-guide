import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure that 'index.html' is expected at the project root by Vite's defaults.
  // If your public folder contains other assets, they will still be served.
  // The 'root' property explicitly sets the project's root directory.
  // By default, Vite uses the directory where vite.config.js is located as the root.
  // If index.html is directly in this directory, no special input config is needed.
  // If it's in a subfolder like 'public', you'd typically move it or configure build.rollupOptions.input.
  // Moving index.html to the root is the most straightforward solution for this error.
});
