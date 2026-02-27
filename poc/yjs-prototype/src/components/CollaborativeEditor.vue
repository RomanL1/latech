<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import * as monaco from 'monaco-editor'
import { MonacoBinding } from 'y-monaco'

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

// Configure Monaco Environment for Vite
self.MonacoEnvironment = {
    getWorker() {
        return new editorWorker()
    },
}

// Register simple LaTeX syntax highlighting
monaco.languages.register({ id: 'latex' })
monaco.languages.setMonarchTokensProvider('latex', {
    tokenizer: {
        root: [
            [/\\%/, 'keyword'], // escaped percent
            [/%(?:.*)$/, 'comment'], // comment
            [/(\\[a-zA-Z@]+)/, 'keyword'], // macros
            [/\\[$&%#_{}~^]/, 'keyword'], // escaped characters
            [/\{|\}/, 'delimiter.curly'],
            [/\[|\]/, 'delimiter.square'],
            [/\$((?:\\.|[^$])*)\$/, 'string'], // inline math
            [/\$\$((?:\\.|[^$])*)\$\$/, 'string'], // display math
        ]
    }
})

const editorContainer = ref<HTMLElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor

// Generate a random color and name for the user
const userColors = [
    '#30bced',
    '#6eeb83',
    '#ffbc42',
    '#ecd444',
    '#ee6352',
    '#9ac2c9',
    '#8acb88',
    '#1be7ff',
]
const randomColor = userColors[Math.floor(Math.random() * userColors.length)]
const randomName = 'User ' + Math.floor(Math.random() * 1000)

let provider: WebsocketProvider | null = null
let binding: MonacoBinding | null = null
let doc: Y.Doc | null = null

onMounted(() => {
    if (!editorContainer.value) return

    // 1. Initialize Y.js Document
    doc = new Y.Doc()
    // "monaco" is the shared object name we'll also configure in the Go backend webhook
    const type = doc.getText('monaco')

    // 2. Initialize Monaco Editor
    editor = monaco.editor.create(editorContainer.value, {
        value: '', // Initial value handled by Yjs
        language: 'latex',
        theme: 'vs-dark',
        automaticLayout: true,
    })

    // Enforce uniform LF line breaks (best practice for LaTeX)
    const model = editor.getModel()
    if (model) {
        model.setEOL(monaco.editor.EndOfLineSequence.LF)
    }

    // 3. Connect to a WebSocket server
    // Connecting to our local dedicated y-websocket server
    const roomName = 'local-monaco-demo-room'
    provider = new WebsocketProvider('ws://$$IP$$:1234', roomName, doc)

    // 4. Provide awareness (cursor color and name)
    const awareness = provider.awareness
    awareness.setLocalStateField('user', {
        name: randomName,
        color: randomColor,
    })

    // 5. Bind Monaco Editor to Y.js
    binding = new MonacoBinding(type, editor.getModel()!, new Set([editor]), awareness)

    // 6. Dynamically inject styles for remote cursors using awareness data
    const updateAwarenessStyles = () => {
        let styleStr = ''
        awareness.getStates().forEach((state, clientId) => {
            if (state.user) {
                const color = state.user.color || 'orange'
                const name = state.user.name || 'Anonymous'
                // Add an alpha channel to the color for the selection background (55 hex = ~33% opacity)
                styleStr += `
.yRemoteSelection-${clientId} {
    background-color: ${color}55;
}
.yRemoteSelectionHead-${clientId} {
    position: absolute;
    border-left: ${color} solid 2px;
    border-top: ${color} solid 2px;
    border-bottom: ${color} solid 2px;
    height: 100%;
    box-sizing: border-box;
}
.yRemoteSelectionHead-${clientId}::after {
    position: absolute;
    content: ' ';
    border: 3px solid ${color};
    border-radius: 4px;
    left: -4px;
    top: -5px;
}
.yRemoteSelectionHead-${clientId}::before {
    content: '${name}';
    position: absolute;
    background-color: ${color};
    color: black;
    font-weight: bold;
    font-size: 11px;
    font-family: sans-serif;
    top: -18px;
    left: -2px;
    padding: 1px 4px;
    border-radius: 4px;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    pointer-events: none;
    z-index: 10;
}
.yRemoteSelectionHead-${clientId}:hover::before {
    opacity: 1;
}
`
            }
        })

        let styleTag = document.getElementById('y-monaco-awareness-styles')
        if (!styleTag) {
            styleTag = document.createElement('style')
            styleTag.id = 'y-monaco-awareness-styles'
            document.head.appendChild(styleTag)
        }
        styleTag.textContent = styleStr
    }

    awareness.on('change', updateAwarenessStyles)
    updateAwarenessStyles()
})

onBeforeUnmount(() => {
    binding?.destroy()
    provider?.destroy()
    editor?.dispose()
    doc?.destroy()
})
</script>

<template>
    <div class="editor-wrapper">
        <div class="header">
            <h2>Collaborative Editor</h2>
            <div class="status" :style="{ backgroundColor: randomColor }">
                Current User: {{ randomName }}
            </div>
        </div>
        <div ref="editorContainer" class="monaco-container"></div>
    </div>
</template>

<style scoped>
.editor-wrapper {
    display: flex;
    flex-direction: column;
    height: 80vh;
    width: 100%;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    overflow: hidden;
    margin-top: 2rem;
}

.header {
    padding: 10px 20px;
    background-color: var(--color-background-mute);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--color-border);
}

.header h2 {
    margin: 0;
    font-size: 1.2rem;
}

.status {
    padding: 4px 12px;
    border-radius: 12px;
    color: black;
    font-weight: bold;
    font-size: 0.9rem;
}

.monaco-container {
    flex-grow: 1;
    width: 100%;
    min-height: 500px;
}
</style>
