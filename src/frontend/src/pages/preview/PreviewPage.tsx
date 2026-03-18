import { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PreviewPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    async function renderPdf() {
      const loadingTask = pdfjsLib.getDocument('/docs/test.pdf');
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      const viewport = page.getViewport({ scale: 1.3 });
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport,
        background: 'rgb(255,255,255)',
      }).promise;
    }

    renderPdf();
  }, []);

  return (
    <div className="preview-page">
      <div className="preview-text">
        <h1>PDF-Testseite</h1>
        <p>
          Dies ist normaler HTML-Text auf der linken Seite. Hier kannst du einen Titel, eine Beschreibung,
          Schaltflächen, Notizen, Metadaten oder alles andere einfügen.
        </p>

        <p>
          Du kannst zum Beispiel <strong>HTML-Tags</strong>, Listen, Links und React-Komponenten verwenden.
        </p>

        <ul>
          <li>Beschreibender Text</li>
          <li>Informationen zum Dokument</li>
          <li>Aktionen oder Buttons</li>
        </ul>
      </div>

      <div className="pdf-preview-wrapper">
        <canvas ref={canvasRef} className="pdf-preview-canvas" />
      </div>
    </div>
  );
}
