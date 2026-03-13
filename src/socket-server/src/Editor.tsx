import Editor from "@monaco-editor/react"
import { useEffect, useRef, useState } from "react"
import { MonacoBinding } from "y-monaco"
import { WebsocketProvider } from "y-websocket"
import * as Y from "yjs"
import { editor as MonacoEditor, KeyMod, KeyCode, languages} from "monaco-editor"

function LatexEditor() {
  const [editor, setEditor] = useState<MonacoEditor.IStandaloneCodeEditor | null>(null)
  const isEditorMount = useRef(false);

  console.log("Language-Support: ", languages.getLanguages().map(l => l.id))

  useEffect(() => {
    if(!editor) return

    const model = editor.getModel() 
    if(!model) return

    console.log("Model Language: ", model.getLanguageId())

    if(isEditorMount.current) {
      console.log("Editor already mounted, skipping Yjs setup.")
      return
    }

    console.log("after:", model.getLanguageId()) // should be "latex"

    isEditorMount.current = true

    const ydoc = new Y.Doc()
    const ytext = ydoc.getText('monaco')

    const provider = new WebsocketProvider('ws://localhost:8080', 'monaco', ydoc)
    provider.on('status', (event) => {
      console.log("Status: " + event.status)
    })

    provider.awareness.setLocalStateField('user', {
      name: `User-${Math.floor(Math.random() * 1000)}`,
      color: '#ffb61e',
    })

    provider.awareness.on('change', () => {
      const states = provider.awareness.getStates()
      console.log("Awareness states: ", states)
    })

    provider.on("connection-error", (event) => {
      console.error("Connection error: ", event)
    })
    
    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyZ, () => {
      console.log("Undo command triggered")
      undoManager.undo()
    })

    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyY, () => {
      console.log("Redo command triggered")
      undoManager.redo()
    })

    const binding = new MonacoBinding(
      ytext,
      model,
      new Set([editor]),
      provider.awareness,
    )

    const undoManager = new Y.UndoManager(ytext, {
      trackedOrigins: new Set([binding]),
    })

    undoManager.on('stack-item-added', () => {
      console.log("Undo stack item added. Undo stack size: ", undoManager.undoStack.length)
    })

    return () => {
      provider.disconnect()
      ydoc.destroy()
      binding.destroy()
      provider.awareness.destroy()
      provider.destroy()
      undoManager.destroy()
    }
  }, [editor])

  const handleMount = (editor: MonacoEditor.IStandaloneCodeEditor) => {
    setEditor(editor)

    console.log("Editor mounted: ", editor)
  }

  return (
    <>
      <Editor path="file:///document.tex" height="50vh" defaultLanguage="latex" onMount={handleMount}/>;
    </>
  )
}

export default LatexEditor
