import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: [
      "@codingame/monaco-vscode-api",
      "@codingame/monaco-vscode-latex-default-extension",
      "@codingame/monaco-vscode-editor-service-override",
      "@codingame/monaco-vscode-textmate-service-override",
      "@codingame/monaco-vscode-theme-service-override",
    ],
  },
})
