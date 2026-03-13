import LatexEditor from "./Editor"
import { useEffect, useState } from "react"
import { initVSCodeBridge } from "./vscode-bridge"
import {whenReady} from "@codingame/monaco-vscode-latex-default-extension"

function App() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
  let cancelled = false

  async function init() {
    try {
      await initVSCodeBridge()
      console.log("VS Code bridge is ready")

      await whenReady()
      console.log("VS Code extensions are ready")

      if (!cancelled) {
        setIsReady(true)
      }
    } catch (err) {
      console.error("Initialization failed:", err)
    }
  }

  init()

  return () => {
    cancelled = true
  }
}, [])

  if (!isReady) {
    return <div>Loading...</div>
  }

  return <LatexEditor />
}

export default App