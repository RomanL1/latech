import { generateColor } from '@marko19907/string-to-color';
import { useMonaco } from '@monaco-editor/react';
import { KeyCode, KeyMod, editor as MonacoEditor, type IRange } from 'monaco-editor';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';
import { MonacoBinding } from 'y-monaco';
import * as awarenessProtocol from 'y-protocols/awareness';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { getDocument } from '../../../features/documents/api';
import {
  EditorContext,
  LatexListStructure,
  LatexMacro,
  type AwarenessUser,
  type AwarenessUserList,
  type EditorContextValue,
} from './EditorContext';

interface EditorProviderProps {
  children: ReactNode;
  roomId: string;
}

/** Determine whether or not a selected range is withing a list structure */
function isInsideListStructure(
  listStructure: LatexListStructure,
  model: MonacoEditor.ITextModel,
  selection: IRange,
): [true, IRange] | [false, null] {
  const selectionStartOffset = model.getOffsetAt({
    column: selection.startColumn,
    lineNumber: selection.startLineNumber,
  });

  const selectionEndOffset = model.getOffsetAt({
    column: selection.endColumn,
    lineNumber: selection.endLineNumber,
  });

  const selectionStartPosition = model.getPositionAt(selectionStartOffset);
  const selectionEndPosition = model.getPositionAt(selectionEndOffset);

  const beginMacro = listStructure.beginMacro;
  const endMacro = listStructure.endMacro;

  const beginMacroMatch = model.findPreviousMatch(beginMacro, selectionStartPosition, false, true, null, true);
  const endMacroMatch = model.findNextMatch(endMacro, selectionEndPosition, false, true, null, true);

  // No list structure macros found
  if (!beginMacroMatch || !endMacroMatch) {
    return [false, null];
  }

  const beginMacroStartOffset = model.getOffsetAt({
    column: beginMacroMatch.range.startColumn,
    lineNumber: beginMacroMatch.range.startLineNumber,
  });

  const endMacroEndOffset = model.getOffsetAt({
    column: endMacroMatch.range.endColumn,
    lineNumber: endMacroMatch.range.endLineNumber,
  });

  // `findPreviousMatch` and `findNextMatch` loop to the opposite side of
  // the model. To account for false-positives, check whether list structure macros
  // are on the correct side relative to the selected range.
  const isBeginMacroBeforeSelection = beginMacroStartOffset <= selectionStartOffset;
  const isEndMacroAfterSelection = endMacroEndOffset >= selectionEndOffset;

  const isWithinListStructure = isBeginMacroBeforeSelection && isEndMacroAfterSelection;

  if (!isWithinListStructure) {
    return [false, null];
  }

  const listStructureRange: IRange = {
    startColumn: beginMacroMatch.range.startColumn,
    startLineNumber: beginMacroMatch.range.startLineNumber,
    endColumn: endMacroMatch.range.endColumn,
    endLineNumber: endMacroMatch.range.endLineNumber,
  };

  return [true, listStructureRange];
}

/** Extract the contents of \item macros inside a range */
function extractListItemContents(listStructureContentRange: IRange, model: MonacoEditor.ITextModel): string[] {
  const content = model.getValueInRange(listStructureContentRange);
  const itemContentRegex = /(?<=\\item(?:\{|[^\S\r\n]+))([^\r\n}]*?)(?=\}|[^\S\r\n]*\\item|\r?\n)/g;

  const matches = [...content.matchAll(itemContentRegex)].map((match) => match[1]);
  return matches.map((line) => line.replace('\n', ''));
}

/** Extract whole line for all lines touched by a selection */
function extractSelectedLines(selection: IRange, model: MonacoEditor.ITextModel): string[] {
  const { startLineNumber, endLineNumber } = selection;
  const totalNumberOfLines = endLineNumber - startLineNumber + 1;

  const lineNumbersInRange = Array.from({ length: totalNumberOfLines }, (_, index) => startLineNumber + index);
  return lineNumbersInRange.map((lineNumber) => model.getLineContent(lineNumber).trim());
}

function isImmediatelySurroundedByMacro(
  macro: LatexMacro,
  model: MonacoEditor.ITextModel,
  selection: IRange,
): [true, IRange] | [false, null] {
  const macroPrefix = macro.prefix;
  const macroSuffix = macro.suffix;

  // Determine bounds of surrounding macro
  const selectionStartOffset = model.getOffsetAt({
    lineNumber: selection.startLineNumber,
    column: selection.startColumn,
  });

  const selectionEndOffset = model.getOffsetAt({
    lineNumber: selection.endLineNumber,
    column: selection.endColumn,
  });

  const prefixStartOffset = selectionStartOffset - macroPrefix.length;
  const suffixEndOffset = selectionEndOffset + macroSuffix.length;

  // Immediate surroundings are out of bounds of model content => not surrounded
  if (prefixStartOffset < 0 || suffixEndOffset > model.getValueLength()) {
    return [false, null];
  }

  const prefixPosition = model.getPositionAt(prefixStartOffset);
  const prefixRange: IRange = {
    startLineNumber: prefixPosition.lineNumber,
    startColumn: prefixPosition.column,
    endLineNumber: selection.startLineNumber,
    endColumn: selection.startColumn,
  };

  const suffixPosition = model.getPositionAt(suffixEndOffset);
  const suffixRange: IRange = {
    startLineNumber: selection.endLineNumber,
    startColumn: selection.endColumn,
    endLineNumber: suffixPosition.lineNumber,
    endColumn: suffixPosition.column,
  };

  // Check whether surroundings match expected macro
  const prefixMatches = model.getValueInRange(prefixRange) === macroPrefix;
  const suffixMatches = model.getValueInRange(suffixRange) === macroSuffix;
  const isSurrounded = prefixMatches && suffixMatches;

  if (!isSurrounded) {
    return [false, null];
  }

  const surroundedMacroRange: IRange = {
    startLineNumber: prefixPosition.lineNumber,
    startColumn: prefixPosition.column,
    endLineNumber: suffixPosition.lineNumber,
    endColumn: suffixPosition.column,
  };

  return [true, surroundedMacroRange];
}

export function EditorProvider({ children, roomId }: EditorProviderProps) {
  const [editor, setEditor] = useState<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const [yDoc, setYDoc] = useState<Y.Doc | null>(null);
  const [yProvider, setYProvider] = useState<WebsocketProvider | null>(null);
  const [yText, setYText] = useState<Y.Text | null>(null);
  const [awarenessUsers, setAwarenessUsers] = useState<AwarenessUserList>(new Map());
  const [currentAwarenessUser, setCurrentAwarenessUser] = useState<AwarenessUser | null>(null);
  const monaco = useMonaco();
  const undoManagerRef = useRef<Y.UndoManager | null>(null);
  const editorControlRef = useRef({ name: 'editor-control' });

  const undo = useMemo(() => {
    return () => {
      undoManagerRef.current?.undo();
    };
  }, [undoManagerRef]);

  const redo = useMemo(() => {
    return () => {
      undoManagerRef.current?.redo();
    };
  }, [undoManagerRef]);

  const toggleSurroundingMacro = useCallback(
    (macro: LatexMacro) => {
      if (!editor || !yDoc || !yText) return;

      const model = editor.getModel();
      const selection = editor.getSelection();
      if (!model || !selection) return;

      const position = selection.getPosition();
      const wordAtCursor = model.getWordAtPosition(position);
      const selectedText = model.getValueInRange(selection);

      // Case: User has selected text
      if (!selection.isEmpty()) {
        const [isSurroundedByMacro, surroundedMacroRange] = isImmediatelySurroundedByMacro(macro, model, selection);

        // Replace surrounded macro with selected text
        if (isSurroundedByMacro) {
          const surroundingMacroStartOffset = model.getOffsetAt({
            column: surroundedMacroRange.startColumn,
            lineNumber: surroundedMacroRange.startLineNumber,
          });

          const surroundingMacroEndOffset = model.getOffsetAt({
            column: surroundedMacroRange.endColumn,
            lineNumber: surroundedMacroRange.endLineNumber,
          });

          const surroundingMacroLength = surroundingMacroEndOffset - surroundingMacroStartOffset;
          yDoc.transact(() => {
            yText.delete(surroundingMacroStartOffset, surroundingMacroLength);
            yText.insert(surroundingMacroStartOffset, selectedText);
          }, editorControlRef.current);

          const cursorEndOffset = surroundingMacroStartOffset + selectedText.length;
          const cursorEndPosition = model.getPositionAt(cursorEndOffset);

          editor.setSelection({
            startColumn: surroundedMacroRange.startColumn,
            startLineNumber: surroundedMacroRange.startLineNumber,
            endColumn: cursorEndPosition.column,
            endLineNumber: cursorEndPosition.lineNumber,
          });
        }

        // Surround selected text with new macro
        else {
          const selectionStartPosition = selection.getStartPosition();
          const selectionStartOffset = model.getOffsetAt(selectionStartPosition);
          const selectionEndPosition = selection.getEndPosition();
          const selectionEndOffset = model.getOffsetAt(selectionEndPosition);

          const selectionLength = selectionEndOffset - selectionStartOffset;
          const surroundedSelection = macro.wrap(selectedText);

          yDoc.transact(() => {
            yText.delete(selectionStartOffset, selectionLength);
            yText.insert(selectionStartOffset, surroundedSelection);
          }, editorControlRef.current);

          const cursorStartOffset = selectionStartOffset + macro.prefix.length;
          const cursorStartPosition = model.getPositionAt(cursorStartOffset);
          const cursorEndOffset = selectionStartOffset + surroundedSelection.length - macro.suffix.length;
          const cursorEndPosition = model.getPositionAt(cursorEndOffset);

          editor.setSelection({
            startColumn: cursorStartPosition.column,
            startLineNumber: cursorStartPosition.lineNumber,
            endColumn: cursorEndPosition.column,
            endLineNumber: cursorEndPosition.lineNumber,
          });
        }
      }
      // Case: User has cursor on top of a word
      else if (wordAtCursor) {
        const wordRange: IRange = {
          startLineNumber: position.lineNumber,
          startColumn: wordAtCursor.startColumn,
          endLineNumber: position.lineNumber,
          endColumn: wordAtCursor.endColumn,
        };

        const [isSurroundedByMacro, surroundedMacroRange] = isImmediatelySurroundedByMacro(macro, model, wordRange);

        // Replace surrounding macro with word
        if (isSurroundedByMacro) {
          const surroundingMacroStartOffset = model.getOffsetAt({
            column: surroundedMacroRange.startColumn,
            lineNumber: surroundedMacroRange.startLineNumber,
          });

          const surroundingMacroEndOffset = model.getOffsetAt({
            column: surroundedMacroRange.endColumn,
            lineNumber: surroundedMacroRange.endLineNumber,
          });

          const surroundingMacroLength = surroundingMacroEndOffset - surroundingMacroStartOffset;

          yDoc.transact(() => {
            yText.delete(surroundingMacroStartOffset, surroundingMacroLength);
            yText.insert(surroundingMacroStartOffset, wordAtCursor.word);
          }, editorControlRef.current);

          const cursorOffset = surroundingMacroStartOffset + wordAtCursor.word.length;
          const cursorPosition = model.getPositionAt(cursorOffset);
          editor.setPosition(cursorPosition);
        }

        // Surround the word with new macro
        else {
          const wordStartOffset = model.getOffsetAt({
            column: wordAtCursor.startColumn,
            lineNumber: position.lineNumber,
          });

          const surroundedWord = macro.wrap(wordAtCursor.word);

          yDoc.transact(() => {
            yText.delete(wordStartOffset, wordAtCursor.word.length);
            yText.insert(wordStartOffset, surroundedWord);
          }, editorControlRef.current);

          const cursorOffset = wordStartOffset + surroundedWord.length - macro.suffix.length;
          const cursorPosition = model.getPositionAt(cursorOffset);
          editor.setPosition(cursorPosition);
        }
      }
      // Case: User has cursor in free space
      else {
        const [isSurroundedByMacro, surroundedMacroRange] = isImmediatelySurroundedByMacro(macro, model, selection);

        // Replace surrounded macro with empty text
        if (isSurroundedByMacro) {
          const surroundingMacroStartOffset = model.getOffsetAt({
            column: surroundedMacroRange.startColumn,
            lineNumber: surroundedMacroRange.startLineNumber,
          });

          const surroundingMacroEndOffset = model.getOffsetAt({
            column: surroundedMacroRange.endColumn,
            lineNumber: surroundedMacroRange.endLineNumber,
          });

          const surroundingMacroLength = surroundingMacroEndOffset - surroundingMacroStartOffset;

          yDoc.transact(() => {
            yText.delete(surroundingMacroStartOffset, surroundingMacroLength);
          }, editorControlRef.current);
        }
        // Insert empty macro at cursor position
        else {
          const positionOffset = model.getOffsetAt(position);
          const emptyMacro = macro.empty();
          yDoc.transact(() => {
            yText.insert(positionOffset, emptyMacro);
          }, editorControlRef.current);

          const cursorOffset = positionOffset + emptyMacro.length - macro.suffix.length;
          const cursorPosition = model.getPositionAt(cursorOffset);
          editor.setPosition(cursorPosition);
        }
      }
    },
    [editor, yDoc, yText],
  );

  const toggleListStructure = useCallback(
    (listStructure: LatexListStructure) => {
      if (!editor || !yDoc || !yText) return;

      const model = editor.getModel();
      const selection = editor.getSelection();
      if (!model || !selection) return;

      const [isWithinList, listStructureRange] = isInsideListStructure(listStructure, model, selection);

      // Replace list structure with just the item contents
      if (isWithinList) {
        const itemContents = extractListItemContents(listStructureRange, model);

        const listStructureStartOffset = model.getOffsetAt({
          column: listStructureRange.startColumn,
          lineNumber: listStructureRange.startLineNumber,
        });

        const listStructureEndOffset = model.getOffsetAt({
          column: listStructureRange.endColumn,
          lineNumber: listStructureRange.endLineNumber,
        });

        const listStructureLength = listStructureEndOffset - listStructureStartOffset;

        const indentation = ' '.repeat(listStructureRange.startColumn - 1);
        const itemsText = itemContents
          .map((item) => `${indentation}${item}`)
          .join('\n')
          .trimStart();

        yDoc.transact(() => {
          // Remove list structure
          yText.delete(listStructureStartOffset, listStructureLength);

          // Insert item contents as plain text
          yText.insert(listStructureStartOffset, itemsText);
        }, editorControlRef.current);
      }
      // Surround the selected lines with a list structure,
      // with each selected line as its own item
      else {
        const selectedLines = extractSelectedLines(selection, model);

        // Define positions where to insert list
        const startLineNumber = selection.startLineNumber;
        const startColumn = model.getLineFirstNonWhitespaceColumn(selection.startLineNumber) || selection.startColumn;

        // Define positions of previous to delete
        const deletionStartOffset = model.getOffsetAt({
          lineNumber: startLineNumber,
          column: startColumn,
        });
        const deletionEndOffset = model.getOffsetAt({
          lineNumber: selection.endLineNumber,
          column: model.getLineLastNonWhitespaceColumn(selection.endLineNumber) || selection.endColumn,
        });
        const deletionLength = deletionEndOffset - deletionStartOffset;

        const listStartOffset = model.getOffsetAt({
          lineNumber: startLineNumber,
          column: startColumn,
        });

        const listContent = listStructure.build(startColumn, selectedLines);
        const lines = listContent.split('\n');
        const listEndPosition = {
          lineNumber: startLineNumber + lines.length - 1,
          column: lines[lines.length - 1].length + 1,
        };

        const lastListItemLineNumber = listEndPosition.lineNumber - 1;

        yDoc.transact(() => {
          // Remove selected lines
          yText.delete(deletionStartOffset, deletionLength);

          // Insert list structure
          yText.insert(listStartOffset, listContent);
        }, editorControlRef.current);

        const cursorPosition = {
          lineNumber: lastListItemLineNumber,
          column: model.getLineMaxColumn(lastListItemLineNumber),
        };

        editor.setPosition(cursorPosition);
      }
    },
    [editor, yDoc, yText],
  );

  useEffect(() => {
    if (!monaco || !editor) return;

    const model = editor.getModel();
    if (!model) return;

    // Force LF line endings for Yjs synchronisation.
    model.setEOL(monaco.editor.EndOfLineSequence.LF);

    const doc = new Y.Doc();
    const text = doc.getText('latech');
    const provider = new WebsocketProvider(window.ENV.VITE_WS_HOST, roomId, doc);

    let isActive = true;

    Promise.resolve().then(() => {
      if (!isActive) return;
      setYDoc(doc);
      setYText(text);
      setYProvider(provider);
    });

    const binding = new MonacoBinding(text, model, new Set([editor]), provider.awareness);
    const undoManager = new Y.UndoManager(text, {
      trackedOrigins: new Set([binding, editorControlRef.current]),
    });

    // Expose undo manager to the outer scope for use in undo/redo functions
    undoManagerRef.current = undoManager;

    provider.on('sync', async (isSynced: boolean) => {
      if (!isSynced) return;
      const current = text.toString();
      if (current.length === 0) {
        const fresh = await getDocument(roomId);
        const freshText = fresh.content?.replace(/\r\n/g, '\n') ?? '';
        if (freshText) text.insert(0, freshText);
      } else if (current.includes('\r\n')) {
        doc.transact(() => {
          text.delete(0, current.length);
          text.insert(0, current.replace(/\r\n/g, '\n'));
        });
      }

      model.setEOL(monaco.editor.EndOfLineSequence.LF);
    });

    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyZ, () => {
      undoManager.undo();
    });

    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyY, () => {
      undoManager.redo();
    });

    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyC, () => {
      editor.trigger('keyboard', 'editor.action.clipboardCopyAction', null);
    });

    let name = sessionStorage.getItem('latech-username') || '';
    let color = sessionStorage.getItem('latech-usercolor') || '';

    if (
      name &&
      color &&
      Array.from(provider.awareness.getStates().values()).some((state) => state.user?.name === name)
    ) {
      name = '';
      color = '';
    }

    if (!name || !color) {
      const MAX_NAME_GENERATION_ATTEMPTS = 20;

      const usedNames = new Set(
        Array.from(provider.awareness.getStates().values())
          .map((state) => state.user?.name)
          .filter((stateName): stateName is string => Boolean(stateName)),
      );

      let generatedName = '';
      for (let attempt = 0; attempt < MAX_NAME_GENERATION_ATTEMPTS; attempt++) {
        const candidateName = uniqueNamesGenerator({
          dictionaries: [adjectives, animals],
          style: 'capital',
        });

        if (!usedNames.has(candidateName)) {
          generatedName = candidateName;
          break;
        }
      }

      if (!generatedName) {
        const fallbackBaseName = uniqueNamesGenerator({
          dictionaries: [adjectives, animals],
          style: 'capital',
        });
        const fallbackSuffix = Math.random().toString(36).slice(2, 8);
        generatedName = `${fallbackBaseName}${fallbackSuffix}`;
      }

      name = generatedName;
      color = generateColor(name);
      sessionStorage.setItem('latech-username', name);
      sessionStorage.setItem('latech-usercolor', color);
    }

    const handleWindowUnload = () => {
      awarenessProtocol.removeAwarenessStates(provider.awareness, [provider.doc.clientID], 'window unload');
    };

    window.addEventListener('beforeunload', handleWindowUnload);

    provider.awareness.setLocalStateField('user', {
      name,
      color,
    });

    return () => {
      isActive = false;
      binding.destroy();
      provider.awareness.destroy();
      provider.destroy();
      doc.destroy();
      undoManager.destroy();
      setYDoc(null);
      setYProvider(null);
      setYText(null);
      setAwarenessUsers(new Map());
      setCurrentAwarenessUser(null);
      window.removeEventListener('beforeunload', handleWindowUnload);
    };
  }, [editor, monaco, roomId]);

  useEffect(() => {
    if (!yProvider) return;

    function setUsers() {
      const users: AwarenessUserList = new Map(
        Array.from(yProvider!.awareness.getStates().entries()).map(([clientId, state]) => [
          clientId,
          {
            clientId,
            user: state.user,
          },
        ]),
      );

      setAwarenessUsers(users);
      setCurrentAwarenessUser(users.get(yProvider!.awareness.clientID) || null);
    }

    setUsers();

    yProvider.awareness.on('change', setUsers);

    return () => {
      yProvider.awareness.off('change', setUsers);
    };
  }, [yProvider]);

  const value = useMemo<EditorContextValue>(
    () => ({
      awarenessUsers,
      currentAwarenessUser,
      editor,
      isConnected: Boolean(yProvider),
      setEditor,
      yDoc,
      yProvider,
      yText,
      undo,
      redo,
      toggleSurroundingMacro,
      toggleListStructure,
    }),
    [
      awarenessUsers,
      currentAwarenessUser,
      editor,
      yDoc,
      yProvider,
      yText,
      undo,
      redo,
      toggleSurroundingMacro,
      toggleListStructure,
    ],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}
