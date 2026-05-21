import { useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  useGetRenderedPDF,
  COMPILE_FINISHED_MESSAGE_TYPE,
  getRenderHistory,
  type PDFReadyMessageDto,
  type RenderHistoryDto,
  type ResilientEventSource,
} from '../../../features/pdf-preview/api';
import { Flex, Text, Box, Tabs, ScrollArea, ThemeContext, IconButton } from '@radix-ui/themes';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import workerUrl from './pdf-worker?worker&url';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

interface PDFPreviewProps {
  docId: string;
  pdfEventSource: ResilientEventSource | null;
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 3;
const SCALE_STEP = 0.15;

const VIEWER_CSS = `
  @keyframes pdfFadeIn {
    from { opacity: 0; filter: blur(6px); }
    to   { opacity: 1; filter: blur(0px); }
  }
  @keyframes pdfSlide {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes pdfSpin {
    to { transform: rotate(360deg); }
  }
  .pdf-canvas {
    scrollbar-width: thin;
    scrollbar-color: rgba(128,128,128,0.25) transparent;
  }
  .pdf-canvas::-webkit-scrollbar { width: 6px; }
  .pdf-canvas::-webkit-scrollbar-track { background: transparent; }
  .pdf-canvas::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.25); border-radius: 3px; }
  .pdf-page-card {
    animation: pdfFadeIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
    margin-bottom: 20px;
    border-radius: 1px;
    overflow: hidden;
    line-height: 0;
  }
  .pdf-page-card:last-child { margin-bottom: 0; }
  .pdf-hist-entry { animation: pdfSlide 0.2s ease both; }
  .pdf-toolbar { backdrop-filter: blur(16px) saturate(180%); -webkit-backdrop-filter: blur(16px) saturate(180%); }
  .pdf-spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(128,128,128,0.15);
    border-top-color: rgba(128,128,128,0.45);
    border-radius: 50%;
    animation: pdfSpin 0.7s linear infinite;
  }
`;

const PDFPreview = ({ docId, pdfEventSource }: PDFPreviewProps) => {
  const [compileLog, setCompileLog] = useState<string | null>(null);
  const [latestSuccess, setLatestSuccess] = useState<boolean | null>(null);
  const [history, setHistory] = useState<RenderHistoryDto[]>([]);
  const [activeTab, setActiveTab] = useState('preview');
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageEls = useRef<Map<number, HTMLDivElement>>(new Map());
  const pageVisibility = useRef<Map<number, number>>(new Map());

  const setPageRef = useCallback((pageNum: number) => (el: HTMLDivElement | null) => {
    if (el) pageEls.current.set(pageNum, el);
    else pageEls.current.delete(pageNum);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setScale(prev => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev - e.deltaY * 0.005)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root || numPages === 0) return;
    pageVisibility.current.clear();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const page = parseInt((e.target as HTMLElement).dataset.page ?? '0');
          if (page > 0) pageVisibility.current.set(page, e.intersectionRatio);
        });
        let bestPage = 1, maxRatio = -1;
        pageVisibility.current.forEach((ratio, page) => {
          if (ratio > maxRatio) { maxRatio = ratio; bestPage = page; }
        });
        if (maxRatio > 0) setCurrentPage(bestPage);
      },
      { root, threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    pageEls.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [numPages]);

  useEffect(() => {
    let ignore = false;
    const loadHistory = async () => {
      try {
        const h = await getRenderHistory(docId);
        if (!ignore) setHistory(h);
      } catch (e) {
        console.error('Failed to fetch history', e);
      }
    };
    void loadHistory();
    return () => { ignore = true; };
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
  const isDark = themeContext?.appearance === 'dark';

  const pdfUrl = useMemo(() => {
    if (!pdfBlob) return null;
    return URL.createObjectURL(pdfBlob);
  }, [pdfBlob]);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (!pdfEventSource) return;

    const onOpen = () => console.log('EventSource opened');

    const onCompileFinished = async (event: MessageEvent) => {
      const data: PDFReadyMessageDto = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      console.log('Parsed data:', data);

      setCompileLog(data.logMessage || null);
      setLatestSuccess(data.success);
      void fetchHistory();

      if (!data.success) {
        console.error('Render unsuccessful:', data.logMessage);
        setActiveTab('history');
        return;
      }

      await refetch();
      setActiveTab('preview');
    };

    const onError = (error: Event) => console.error('EventSource failed:', error);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfEventSource.addEventListener('open', onOpen as any);
    pdfEventSource.addEventListener(COMPILE_FINISHED_MESSAGE_TYPE, onCompileFinished);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfEventSource.addEventListener('error', onError as any);

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pdfEventSource.removeEventListener('open', onOpen as any);
      pdfEventSource.removeEventListener(COMPILE_FINISHED_MESSAGE_TYPE, onCompileFinished);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pdfEventSource.removeEventListener('error', onError as any);
    };
  }, [docId, refetch, fetchHistory, pdfEventSource]);

  const mono = "ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace";
  const tbBg = isDark ? 'rgba(30,30,38,0.92)' : 'rgba(252,252,255,0.92)';
  const tbBd = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const tbShadow = isDark ? '0 8px 32px rgba(0,0,0,0.55)' : '0 4px 20px rgba(0,0,0,0.1)';

  return (
    <Flex direction="column" height="100%" gap="3">
      <style>{VIEWER_CSS}</style>
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
              <Tabs.Trigger value="history">
                History / Logs
                {history.length > 0 && (
                  <span style={{
                    marginLeft: 6,
                    background: activeTab === 'history' ? 'var(--accent-9)' : 'var(--gray-5)',
                    color: activeTab === 'history' ? 'white' : 'var(--gray-10)',
                    borderRadius: 8, minWidth: 16, height: 16, padding: '0 4px',
                    fontSize: 9, fontWeight: 700, verticalAlign: 'middle',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    letterSpacing: 0,
                  }}>
                    {history.length}
                  </span>
                )}
              </Tabs.Trigger>
            </Tabs.List>
          </Box>

          <Box style={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Preview tab */}
            <Tabs.Content
              value="preview"
              style={{ flexGrow: 1, overflow: 'hidden', position: 'relative', height: '100%' }}
            >
              {pdfUrl ? (
                <>
                  {/* PDF scroll canvas — always light */}
                  <div
                    ref={scrollContainerRef}
                    className="pdf-canvas"
                    style={{
                      height: '100%',
                      overflow: 'auto',
                      backgroundColor: '#1a1a22',
                      padding: '28px 24px 80px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <Document
                      file={pdfUrl}
                      onLoadSuccess={({ numPages }) => { setNumPages(numPages); setCurrentPage(1); }}
                    >
                      {Array.from({ length: numPages }, (_, i) => (
                        <div
                          key={i + 1}
                          ref={setPageRef(i + 1)}
                          data-page={i + 1}
                          className="pdf-page-card"
                          style={{
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 8px 28px rgba(0,0,0,0.12)',
                            animationDelay: `${Math.min(i * 0.06, 0.35)}s`,
                          }}
                        >
                          <Page
                            pageNumber={i + 1}
                            scale={scale}
                            renderAnnotationLayer={false}
                            renderTextLayer={true}
                          />
                        </div>
                      ))}
                    </Document>
                  </div>

                  {/* Floating toolbar */}
                  <div
                    className="pdf-toolbar"
                    style={{
                      position: 'absolute',
                      bottom: 14,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: tbBg,
                      border: `1px solid ${tbBd}`,
                      borderRadius: 10,
                      padding: '3px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      boxShadow: tbShadow,
                      zIndex: 10,
                      userSelect: 'none',
                    }}
                  >
                    <Text size="1" color="gray" style={{ fontVariantNumeric: 'tabular-nums', minWidth: '5ch', textAlign: 'center' }}>
                      <strong style={{ color: 'var(--gray-12)' }}>{currentPage}</strong>
                      {' / '}
                      {numPages}
                    </Text>

                    <Box style={{ width: 1, height: 14, backgroundColor: 'var(--gray-5)' }} />

                    <IconButton
                      size="1"
                      variant="ghost"
                      onClick={() => setScale(s => Math.max(MIN_SCALE, +(s - SCALE_STEP).toFixed(2)))}
                      disabled={scale <= MIN_SCALE}
                      aria-label="Zoom out"
                    >
                      −
                    </IconButton>

                    <Text
                      size="1"
                      color="gray"
                      style={{
                        minWidth: '3.5ch',
                        textAlign: 'center',
                        fontVariantNumeric: 'tabular-nums',
                        cursor: 'pointer',
                      }}
                      onClick={() => setScale(1)}
                      title="Reset to 100%"
                    >
                      {Math.round(scale * 100)}%
                    </Text>

                    <IconButton
                      size="1"
                      variant="ghost"
                      onClick={() => setScale(s => Math.min(MAX_SCALE, +(s + SCALE_STEP).toFixed(2)))}
                      disabled={scale >= MAX_SCALE}
                      aria-label="Zoom in"
                    >
                      +
                    </IconButton>
                  </div>
                </>
              ) : (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  height="100%"
                  gap="3"
                  style={{ backgroundColor: '#1a1a22' }}
                >
                  {isPdfLoading ? (
                    <>
                      <div className="pdf-spinner" />
                      <Text size="1" color="gray" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        Loading
                      </Text>
                    </>
                  ) : (
                    <>
                      <svg width="38" height="46" viewBox="0 0 38 46" fill="none" style={{ opacity: 0.3 }}>
                        <path d="M4 0C1.79 0 0 1.79 0 4v38c0 2.21 1.79 4 4 4h30c2.21 0 4-1.79 4-4V13L25 0H4z" fill="rgba(0,0,0,0.35)" />
                        <path d="M25 0l13 13H25V0z" fill="rgba(0,0,0,0.15)" />
                        <rect x="8" y="22" width="22" height="2.5" rx="1.25" fill="rgba(0,0,0,0.3)" />
                        <rect x="8" y="28" width="16" height="2.5" rx="1.25" fill="rgba(0,0,0,0.3)" />
                        <rect x="8" y="34" width="19" height="2.5" rx="1.25" fill="rgba(0,0,0,0.3)" />
                      </svg>
                      <Text size="2" color="gray">
                        No PDF rendered yet. Click "Render PDF" to generate.
                      </Text>
                    </>
                  )}
                </Flex>
              )}
            </Tabs.Content>

            {/* History tab */}
            <Tabs.Content value="history" style={{ flexGrow: 1, position: 'relative', height: '100%' }}>
              <ScrollArea
                type="always"
                scrollbars="vertical"
                style={{ height: '100%', paddingRight: 'var(--space-3)' }}
              >
                <Flex direction="column" gap="3" p="3">

                  {compileLog && latestSuccess !== null && (
                    <Box
                      style={{
                        border: `1px solid var(--${latestSuccess ? 'grass' : 'ruby'}-7)`,
                        backgroundColor: `var(--${latestSuccess ? 'grass' : 'ruby'}-2)`,
                        borderRadius: 'var(--radius-2)',
                        padding: 'var(--space-2)',
                      }}
                    >
                      <Flex align="center" gap="2" mb="2">
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                          backgroundColor: `var(--${latestSuccess ? 'grass' : 'ruby'}-9)`,
                        }} />
                        <Text weight="bold" color={latestSuccess ? 'grass' : 'ruby'} size="1"
                          style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          Latest · {latestSuccess ? 'Success' : 'Failed'}
                        </Text>
                      </Flex>
                      <pre style={{
                        margin: 0, padding: '8px 10px', borderRadius: 4,
                        backgroundColor: `var(--${latestSuccess ? 'grass' : 'ruby'}-3)`,
                        fontFamily: mono, fontSize: 11, lineHeight: 1.6,
                        whiteSpace: 'pre-wrap', maxHeight: 160, overflow: 'auto',
                      }}>
                        <code>{compileLog}</code>
                      </pre>
                    </Box>
                  )}

                  {history.map((h, idx) => {
                    const ok = h.status === 'SUCCESSFULLY_RENDERED';
                    const err = h.status === 'ERROR_WHILE_RENDERING';
                    return (
                      <Box
                        key={h.id}
                        className="pdf-hist-entry"
                        p="3"
                        style={{
                          backgroundColor: 'var(--gray-3)',
                          borderRadius: 'var(--radius-2)',
                          borderLeft: `3px solid var(--${ok ? 'grass' : err ? 'ruby' : 'gray'}-9)`,
                          animationDelay: `${idx * 0.04}s`,
                        }}
                      >
                        <Flex justify="between" align="center" mb="2">
                          <Text
                            weight="bold"
                            size="1"
                            color={ok ? 'grass' : err ? 'ruby' : 'gray'}
                            style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}
                          >
                            {ok ? 'Success' : err ? 'Error' : h.status}
                          </Text>
                          <Text size="1" color="gray" style={{ fontVariantNumeric: 'tabular-nums', fontFamily: mono }}>
                            {new Date(h.renderedAt).toLocaleString()}
                          </Text>
                        </Flex>
                        <pre style={{
                          margin: 0, padding: '6px 8px', borderRadius: 3,
                          backgroundColor: 'var(--gray-4)',
                          fontFamily: mono, fontSize: 10, lineHeight: 1.55,
                          whiteSpace: 'pre-wrap', maxHeight: 120, overflowY: 'auto',
                        }}>
                          <code>{h.logMessage || 'No logs available.'}</code>
                        </pre>
                      </Box>
                    );
                  })}

                  {history.length === 0 && !compileLog && (
                    <Flex direction="column" align="center" justify="center" gap="2" py="6">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.3 }}>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                        <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <Text size="2" color="gray">No history available.</Text>
                    </Flex>
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
