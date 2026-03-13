import * as Y from 'yjs'
import Quill from 'quill'
import { QuillBinding } from 'y-quill'
import { WebsocketProvider } from 'y-websocket'
import QuillCursors from 'quill-cursors'

Quill.register('modules/cursors', QuillCursors);

document.querySelector('#editor').innerHTML = `
  <h1>Collaborative Editor</h1>
  <p>Start editing to see some magic happen :)</p>
`

console.log('Hello world!')

/*
const quill = new Quill(document.querySelector('#editor'), {
  modules: {
    cursors: true,
    toolbar: [
      // adding some basic Quill content features
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      ['image', 'code-block']
    ],
    history: {
      // Local undo shouldn't undo changes
      // from remote users
      userOnly: true
    }
  },
  placeholder: 'Start collaborating...',
  theme: 'snow' // 'bubble' is also great
})

const doc = new Y.Doc()
const ytext = doc.getText('quill')
const binding = new QuillBinding(ytext, quill)


const wsProvider = new WebsocketProvider('ws://localhost:8080', 'my-roomname', doc)

wsProvider.on('status', event => {
  console.log(event.status) // logs "connected" or "disconnected"
})

*/