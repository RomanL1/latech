import { Theme } from '@radix-ui/themes';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import './main.css';
import { PageLayout } from './PageLayout';
import { CreateDocumentPage } from './pages/create/CreateDocumentPage';
import { DocumentPage } from './pages/document/DocumentPage';
import { LandingPage } from './pages/landing/LandingPage';
import LatexEditor from './shared/components/LatexEditor';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme appearance="dark" accentColor="red">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PageLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="create" element={<CreateDocumentPage />} />
            <Route path="document/:documentId" element={<DocumentPage />} />
            <Route path="editor" element={<LatexEditor />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Theme>
  </StrictMode>,
);
