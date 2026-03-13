import { initialize } from "@codingame/monaco-vscode-api"
import "@codingame/monaco-vscode-latex-default-extension"

let initPromise: Promise<void> | null = null

export function initVSCodeBridge() {
  if (!initPromise) {
    initPromise = initialize({})
  }
  return initPromise
}