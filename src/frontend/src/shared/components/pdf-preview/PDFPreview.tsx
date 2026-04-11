import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { getPDFRenderedEventSource, getRenderedPDF, requestPDFRender } from '../../../features/pdf-preview/api';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFPreviewProps {
  pdocId: string;
}

const PDFPreview = ({ pdocId }: PDFPreviewProps) => {
  const docId = pdocId || '13d76659-ff26-4f18-add5-04186a84a2a7'; // Default docId for testing
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>();
  const [isRendering, setIsRendering] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleRenderPDF = async () => {
    if (!docId) return;
    
    // Close any prior existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setIsRendering(true);

    // 1. Frontend subscribes to @GetMapping( "/{docId}/stream-updates" )
    const eventSource = getPDFRenderedEventSource(docId);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('pdf-ready', async (event) => {
      // 3. when response from 1. comes it calles @GetMapping( "/{docId}/render" )
      try {
        const blob = await getRenderedPDF(docId);
        const url = URL.createObjectURL(blob);
        setPdfUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } catch (error) {
        console.error('Failed to load PDF preview:', error);
      } finally {
        setIsRendering(false);
        eventSource.close();
        eventSourceRef.current = null;
      }
    });

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      setIsRendering(false);
      eventSource.close();
      eventSourceRef.current = null;
    };

    try {
      // 2. Frontend sends request to @PostMapping( "/{docId}/render" )
      await requestPDFRender(docId);
    } catch (e) {
      console.error('Failed to request render', e);
      setIsRendering(false);
      eventSource.close();
      eventSourceRef.current = null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={handleRenderPDF} disabled={isRendering || !docId}>
          {isRendering ? 'Rendering...' : 'Render PDF'}
        </button>
      </div>
      <div style={{ flexGrow: 1, border: '1px solid #ccc', padding: '1rem', backgroundColor: '#f0f0f0' }}>
        {pdfUrl ? (
          <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
            {Array.from(new Array(numPages), (el, index) => (
              <Page 
                key={`page_${index + 1}`} 
                pageNumber={index + 1} 
                renderTextLayer={false}
                renderAnnotationLayer={false}
                style={{ marginBottom: '1rem' }}
              />
            ))}
          </Document>
        ) : (
          <div style={{ padding: '1rem', color: '#666' }}>No PDF rendered yet. Click "Render PDF" to generate.</div>
        )}
      </div>
    </div>
  );
};

export default PDFPreview;
