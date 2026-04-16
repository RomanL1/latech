import { useEffect, useState } from 'react';
import { getPDFRenderedEventSource, getRenderedPDF, requestPDFRender } from '../../../features/pdf-preview/api';
import { Flex, Button, Text, Box } from '@radix-ui/themes';
import { PDFViewer } from '@embedpdf/react-pdf-viewer';

interface PDFPreviewProps {
  pdocId: string;
}

const PDFPreview = ({ pdocId }: PDFPreviewProps) => {
  const docId = pdocId || '13d76659-ff26-4f18-add5-04186a84a2a7'; // Default docId for testing
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    if (!docId) return;

    const eventSource = getPDFRenderedEventSource(docId);

    eventSource.onopen = () => {
      console.log('EventSource opened');
    };

    eventSource.addEventListener('pdf-ready', async () => {
      try {
        console.log('PDF ready');
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
      }
    });

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
    };

    return () => {
      eventSource.close();
      console.log('Closing event source');
    };
  }, [docId]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleRenderPDF = async () => {
    if (!docId) return;

    setIsRendering(true);

    try {
      await requestPDFRender(docId);
    } catch (e) {
      console.error('Failed to request render', e);
      setIsRendering(false);
    }
  };

  return (
    <Flex direction="column" height="100%" gap="3">
      <Box>
        <Button onClick={handleRenderPDF} disabled={isRendering || !docId}>
          {isRendering ? 'Rendering...' : 'Render PDF'}
        </Button>
      </Box>
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
        {pdfUrl ? (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <PDFViewer
              style={{ width: '100%', height: '100%' }}
              key={pdfUrl}
              config={{
                src: pdfUrl,
                theme: { preference: 'system' },
                disabledCategories: [
                  'annotation',
                  'form',
                  'redaction',
                  'zoom',
                  'document',
                  'panel',
                  'insert',
                  'history',
                  'rotate',
                  'capture',
                ],
              }}
            />
          </div>
        ) : (
          <Flex direction="column" align="center" justify="center" height="100%" p="4">
            <Text color="gray" size="2">
              No PDF rendered yet. Click "Render PDF" to generate.
            </Text>
          </Flex>
        )}
      </Box>
    </Flex>
  );
};

export default PDFPreview;
