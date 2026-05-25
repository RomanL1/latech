import { LucideFileCodeCorner, LucidePlay } from 'lucide-react';
import styles from './EditorHeader.module.css';
import { Button, Separator, Spinner, Switch, Text } from '@radix-ui/themes';
import { useState, useEffect } from 'react';
import EditorControls from '../controls/EditorControls';
import type { Document } from '../../../../features/documents/document';
import {
  requestPDFRender,
  setAutoRender,
  COMPILE_FINISHED_MESSAGE_TYPE,
  DOCUMENT_TIMESTAMPS_MESSAGE_TYPE,
  AUTO_RENDER_SETTING_MESSAGE_TYPE,
  type PDFReadyMessageDto,
  type AutoRenderSettingDto,
  type ResilientEventSource,
} from '../../../../features/pdf-preview/api';
import CurrentEditors from './current-editors/CurrentEditors';
import { useAwareness } from '../../../../shared/components/latex-editor/EditorContext';
import { useKeyboardSaveContext } from '../../provider/KeyboardSaveContext';
import EditorNavigationButtons from './navigation-buttons/EditorNavigationButtons';

interface EditorHeaderProps {
  file: Document | undefined;
  pdfEventSource: ResilientEventSource | null;
}

const EditorHeader = ({ file, pdfEventSource }: EditorHeaderProps) => {
  const docId = file?.id;
  const [isCompiling, setIsCompiling] = useState(false);
  const [lastRenderedAt, setLastRenderedAt] = useState<string | null>(null);
  const [lastChangedAt, setLastChangedAt] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [autoRenderEnabled, setAutoRenderEnabled] = useState<boolean>(file?.autoRenderEnabled ?? true);
  const { awarenessUsers, currentAwarenessUser } = useAwareness();
  const { buttonRef } = useKeyboardSaveContext();

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!docId || !pdfEventSource) return;

    const onTimestamps = (event: MessageEvent) => {
      const data = JSON.parse(event.data as string) as { lastChange: string | null; lastCompile: string | null };
      setLastChangedAt(data.lastChange);
      setLastRenderedAt(data.lastCompile);
    };

    const onCompileFinished = (event: MessageEvent) => {
      const data = JSON.parse(event.data as string) as PDFReadyMessageDto;
      setIsCompiling(false);
      setLastChangedAt(data.lastChange);
      setLastRenderedAt(new Date(data.timestampUTC).toISOString());
    };

    const onAutoRenderSetting = (event: MessageEvent) => {
      const data = JSON.parse(event.data as string) as AutoRenderSettingDto;
      setAutoRenderEnabled(data.autoRenderEnabled);
    };

    pdfEventSource.addEventListener(DOCUMENT_TIMESTAMPS_MESSAGE_TYPE, onTimestamps);
    pdfEventSource.addEventListener(COMPILE_FINISHED_MESSAGE_TYPE, onCompileFinished);
    pdfEventSource.addEventListener(AUTO_RENDER_SETTING_MESSAGE_TYPE, onAutoRenderSetting);

    return () => {
      pdfEventSource.removeEventListener(DOCUMENT_TIMESTAMPS_MESSAGE_TYPE, onTimestamps);
      pdfEventSource.removeEventListener(COMPILE_FINISHED_MESSAGE_TYPE, onCompileFinished);
      pdfEventSource.removeEventListener(AUTO_RENDER_SETTING_MESSAGE_TYPE, onAutoRenderSetting);
    };
  }, [docId, pdfEventSource]);

  const handleOnCompileClick = async () => {
    if (!docId) return;
    setIsCompiling(true);
    try {
      await requestPDFRender(docId);
    } catch (e) {
      console.error('Failed to request render', e);
      setIsCompiling(false);
    }
  };

  const handleAutoRenderToggle = async (checked: boolean) => {
    if (!docId) return;
    setAutoRenderEnabled(checked);
    try {
      await setAutoRender(docId, checked);
    } catch (e) {
      console.error('Failed to update auto-render setting', e);
      setAutoRenderEnabled(!checked);
    }
  };

  const buttonText = isCompiling ? 'Compiling' : 'Compile PDF';

  const getTimeAgo = (dateString: string, currentTime: number) => {
    const diff = currentTime - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  function preventFocusLoss(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    event.preventDefault();
  }

  return (
    <div className={styles.container} onMouseDown={preventFocusLoss} role="toolbar">
      <LucideFileCodeCorner size={20} />
      <Text size="2">{file?.name}</Text>
      <Separator orientation="vertical" />
      <EditorNavigationButtons />
      <Separator orientation="vertical" />
      <EditorControls />
      <Separator orientation="vertical" />
      <CurrentEditors className={styles.currentEditors} editors={awarenessUsers} currentEditor={currentAwarenessUser} />
      <div style={{ marginRight: '12px', textAlign: 'right' }}>
        {lastChangedAt && now !== null && (
          <Text size="2" color="gray" as="div" style={{ lineHeight: 1.2 }}>
            Last save: {getTimeAgo(lastChangedAt, now)}
          </Text>
        )}
        {lastRenderedAt && now !== null && (
          <Text size="2" color="gray" as="div" style={{ lineHeight: 1.2 }}>
            Last render: {getTimeAgo(lastRenderedAt, now)}
          </Text>
        )}
      </div>
      <Separator orientation="vertical" />
      <Text as="label" size="2" style={{ display: 'flex', alignItems: 'center', gap: '6px', userSelect: 'none' }}>
        <Switch size="1" checked={autoRenderEnabled} onCheckedChange={handleAutoRenderToggle} />
        Auto-render
      </Text>
      <Separator orientation="vertical" />
      <Button ref={buttonRef} disabled={isCompiling} onClick={handleOnCompileClick} size="2">
        <Spinner loading={isCompiling} />
        {!isCompiling && <LucidePlay size="19" />}
        {buttonText}
      </Button>
    </div>
  );
};

export default EditorHeader;
