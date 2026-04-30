import { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  getPDFRenderedEventSource,
  useGetRenderedPDF,
  COMPILE_FINISHED_MESSAGE_TYPE,
  getRenderHistory,
  type PDFReadyMessageDto,
  type RenderHistoryDto,
} from '../../../features/pdf-preview/api';
import { Flex, Text, Box, Tabs, ScrollArea, ThemeContext } from '@radix-ui/themes';
import { PDFViewer } from '@embedpdf/react-pdf-viewer';

interface PDFPreviewProps {
  docId: string;
}

const PDFPreview = ({ docId }: PDFPreviewProps) => {
  const [compileLog, setCompileLog] = useState<string | null>(null);
  const [latestSuccess, setLatestSuccess] = useState<boolean | null>(null);
  const [history, setHistory] = useState<RenderHistoryDto[]>([]);
  const [activeTab, setActiveTab] = useState('preview');

  useEffect(() => {
    let ignore = false;
    const loadHistory = async () => {
      try {
        const h = await getRenderHistory(docId);
        if (!ignore) {
          setHistory(h);
        }
      } catch (e) {
        console.error('Failed to fetch history', e);
      }
    };
    void loadHistory();
    return () => {
      ignore = true;
    };
  }, [docId]);

  const fetchHistory = useCallback(async () => {
    try {
      const h = await getRenderHistory(docId);
      setHistory(h);
    } catch (e) {
      console.error('Failed to fetch history', e);
    }
  }, [docId]);

  const { data: pdfBlob, isLoading: isPdfLoading, refetch } = useGetRenderedPDF(docId);
  const themeContext = useContext(ThemeContext);

  const pdfUrl = useMemo(() => {
    if (!pdfBlob) return null;
    return URL.createObjectURL(pdfBlob);
  }, [pdfBlob]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  useEffect(() => {
    const eventSource = getPDFRenderedEventSource(docId);

    eventSource.onopen = () => {
      console.log('EventSource opened');
    };

    eventSource.addEventListener(COMPILE_FINISHED_MESSAGE_TYPE, async (event: MessageEvent) => {
      //EventSource (Server-Sent Events) is a strictly text-based web protocol
      const data: PDFReadyMessageDto = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      console.log('Parsed data:', data);

      setCompileLog(data.logMessage || null);
      setLatestSuccess(data.success);
      void fetchHistory(); // refresh history

      if (!data.success) {
        console.error('Render unsuccessful:', data.logMessage);
        setActiveTab('history'); // switch to history tab to show error log
        return;
      }

      await refetch();
    });

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
    };

    return () => {
      eventSource.close();
    };
  }, [docId, refetch, fetchHistory]);

  return (
    <Flex direction="column" height="100%" gap="3">
      <Box
        style={{
          flexGrow: 1,
          minHeight: 0,
          position: 'relative',
          borderRadius: 'var(--radius-3)',
          overflow: 'hidden',
          border: '1px solid var(--gray-5)',
          backgroundColor: 'var(--gray-2)',
        }}
      >
        <Tabs.Root
          value={activeTab}
          onValueChange={setActiveTab}
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          <Box style={{ flexShrink: 0, backgroundColor: 'var(--color-panel)' }}>
            <Tabs.List>
              <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
              <Tabs.Trigger value="history">History / Logs</Tabs.Trigger>
            </Tabs.List>
          </Box>

          <Box
            style={{
              flexGrow: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              padding: 'var(--space-3)',
            }}
          >
            <Tabs.Content value="preview" style={{ flexGrow: 1, position: 'relative', height: '100%' }}>
              {pdfUrl ? (
                <div style={{ position: 'absolute', inset: 0 }}>
                  <PDFViewer
                    key={pdfUrl} // Force remount when URL changes
                    style={{ width: '100%', height: '100%' }}
                    config={{
                      src: pdfUrl,
                      theme: { preference: themeContext?.appearance === 'dark' ? 'dark' : 'light' },
                      disabledCategories: [
                        'annotation',
                        'form',
                        'redaction',
                        'document',
                        'panel',
                        'insert',
                        'history',
                        'rotate',
                        'capture',
                        // pan plugin causes issues with hihjacking keyboard events when in monaco editor. So it is disabled.
                        'pan',
                      ],
                    }}
                  />
                </div>
              ) : (
                <Flex direction="column" align="center" justify="center" height="100%" p="4">
                  <Text color="gray" size="2">
                    {isPdfLoading
                      ? 'Checking for existing PDF...'
                      : 'No PDF rendered yet. Click "Render PDF" to generate.'}
                  </Text>
                </Flex>
              )}
            </Tabs.Content>

            <Tabs.Content value="history" style={{ flexGrow: 1, position: 'relative', height: '100%' }}>
              <ScrollArea
                type="always"
                scrollbars="vertical"
                style={{ height: '100%', paddingRight: 'var(--space-3)' }}
              >
                <Flex direction="column" gap="4">
                  {compileLog && latestSuccess !== null && (
                    <Box
                      style={{
                        border: `1px solid var(--${latestSuccess ? 'grass' : 'ruby'}-7)`,
                        padding: 'var(--space-2)',
                        borderRadius: 'var(--radius-2)',
                      }}
                    >
                      <Text weight="bold" color={latestSuccess ? 'grass' : 'ruby'} mb="2">
                        Latest Result {latestSuccess ? '(Success)' : '(Failed)'}
                      </Text>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                        <code>{compileLog}</code>
                      </pre>
                    </Box>
                  )}
                  {history.map((h) => (
                    <Box key={h.id} p="3" style={{ backgroundColor: 'var(--gray-3)', borderRadius: 'var(--radius-2)' }}>
                      <Flex justify="between" mb="2">
                        <Text
                          weight="bold"
                          color={
                            h.status === 'SUCCESSFULLY_RENDERED'
                              ? 'grass'
                              : h.status === 'ERROR_WHILE_RENDERING'
                                ? 'ruby'
                                : undefined
                          }
                        >
                          Status:{' '}
                          {h.status === 'SUCCESSFULLY_RENDERED'
                            ? 'Successful'
                            : h.status === 'ERROR_WHILE_RENDERING'
                              ? 'Error'
                              : h.status}
                        </Text>
                        <Text size="1" color="gray">
                          {new Date(h.renderedAt).toLocaleString()}
                        </Text>
                      </Flex>
                      <pre
                        style={{
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          fontSize: '10px',
                          maxHeight: '150px',
                          overflowY: 'auto',
                          backgroundColor: 'var(--gray-4)',
                          padding: '8px',
                        }}
                      >
                        <code>{h.logMessage || 'No logs available.'}</code>
                      </pre>
                    </Box>
                  ))}
                  {history.length === 0 && !compileLog && (
                    <Text size="2" color="gray">
                      No history available.
                    </Text>
                  )}
                </Flex>
              </ScrollArea>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Box>
    </Flex>
  );
};

export default PDFPreview;
