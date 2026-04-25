import { useContext, useEffect, useMemo, useState } from 'react';
import {
  getPDFRenderedEventSource,
  PDF_READY_MESSAGE_TYPE,
  useGetRenderedPDF,
  useRequestPDFRender,
  type PDFReadyMessageDto,
} from '../../../features/pdf-preview/api';
import { Flex, Button, Text, Box, Spinner, ThemeContext } from '@radix-ui/themes';
import { PDFViewer } from '@embedpdf/react-pdf-viewer';
import { LucidePlay } from 'lucide-react';

interface PDFPreviewProps {
  docId: string;
}

const PDFPreview = ({ docId }: PDFPreviewProps) => {
  const [isRendering, setIsRendering] = useState(false);
  const { data: pdfBlob, isLoading: isPdfLoading, refetch } = useGetRenderedPDF(docId);
  const renderPDFMutation = useRequestPDFRender(docId);
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

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
    };

    const handler = async (event: MessageEvent) => {
      const data: PDFReadyMessageDto = JSON.parse(event.data);

      console.log('Received PDF ready message:', data);
      if (!data.success) {
        console.error('Render unsuccessful:', data.errorMessage);
        setIsRendering(false);
        return;
      }
      console.log('PDF ready message received, refetching PDF...');

      await refetch();
      setIsRendering(false);
    };

    eventSource.addEventListener(PDF_READY_MESSAGE_TYPE, handler);

    return () => {
      eventSource.close();
    };
  }, [docId, refetch, isRendering]);

  const handleRenderPDF = async () => {
    setIsRendering(true);
    await renderPDFMutation.mutateAsync({}).catch((error) => {
      console.error('Failed to request PDF render:', error);
      setIsRendering(false);
    });
  };

  const buttonText = isRendering ? 'Rendering' : 'Render PDF';
  const isLoading = isPdfLoading || isRendering;

  return (
    <Flex direction="column" height="100%" gap="3">
      <Box>
        <Button onClick={handleRenderPDF} disabled={isLoading}>
          <Spinner loading={isLoading} />
          {!isLoading && <LucidePlay size="19" />}
          {buttonText}
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
              {isPdfLoading ? 'Checking for existing PDF...' : 'No PDF rendered yet. Click "Render PDF" to generate.'}
            </Text>
          </Flex>
        )}
      </Box>
    </Flex>
  );
};

export default PDFPreview;
