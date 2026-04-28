import { LucideFileCodeCorner, LucidePlay } from 'lucide-react';
import styles from './EditorHeader.module.css';
import { Button, Separator, Spinner, Text } from '@radix-ui/themes';
import { useState, useEffect, useCallback } from 'react';
import CurrentEditors from '../current-editors/CurrentEditors';
import { editors } from '../sampleData';
import EditorControls from '../controls/EditorControls';
import type { Document } from '../../../../features/documents/document';
import {
  requestPDFRender,
  getPDFRenderedEventSource,
  COMPILE_FINISHED_MESSAGE_TYPE,
} from '../../../../features/pdf-preview/api';
import { getDocumentTimestamps } from '../../../../features/documents/api';

interface EditorHeaderProps {
  file: Document | undefined;
}

const EditorHeader = ({ file }: EditorHeaderProps) => {
  const docId = file?.id;
  const [isCompiling, setIsCompiling] = useState(false);
  const [lastRenderedAt, setLastRenderedAt] = useState<string | null>(null);
  const [lastChangedAt, setLastChangedAt] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  const fetchTimestamps = useCallback(async () => {
    if (!docId) return;
    try {
      const timestamps = await getDocumentTimestamps(docId);
      setLastRenderedAt(timestamps.lastCompile);
      setLastChangedAt(timestamps.lastChange);
    } catch (e) {
      console.error('Failed to fetch timestamps', e);
    }
  }, [docId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
      void fetchTimestamps(); // Poll latest stats from backend too
    }, 60000); // update every 1 minute
    return () => clearInterval(interval);
  }, [fetchTimestamps]);

  useEffect(() => {
    const init = async () => {
      await fetchTimestamps();
    };
    void init();
  }, [fetchTimestamps]);

  useEffect(() => {
    if (!docId) return;

    const eventSource = getPDFRenderedEventSource(docId);

    eventSource.addEventListener(COMPILE_FINISHED_MESSAGE_TYPE, () => {
      setIsCompiling(false);
      void fetchTimestamps();
    });

    return () => {
      eventSource.close();
    };
  }, [docId, fetchTimestamps]);

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

  return (
    <div className={styles.container}>
      <LucideFileCodeCorner size={20} />
      <Text size="2">{file?.name}</Text>
      <Separator orientation="vertical" />
      <EditorControls />
      <Separator orientation="vertical" />
      <CurrentEditors editors={editors} className={styles.currentEditors} />
      <div style={{ marginLeft: 'auto', marginRight: '12px', textAlign: 'right' }}>
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
      <Button disabled={isCompiling} onClick={handleOnCompileClick} size="2">
        <Spinner loading={isCompiling} />
        {!isCompiling && <LucidePlay size="19" />}
        {buttonText}
      </Button>
    </div>
  );
};

export default EditorHeader;
