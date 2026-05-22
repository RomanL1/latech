import { Theme } from '@radix-ui/themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import './main.css';
import { PageLayout } from './PageLayout';
import { CreateDocumentPage } from './pages/create/CreateDocumentPage';
import { DocumentPage } from './pages/document/DocumentPage';
import { LandingPage } from './pages/landing/LandingPage';
import { EditorProvider } from './shared/context/editor';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme appearance="dark">
      <QueryClientProvider client={queryClient}>
        <EditorProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<PageLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="create" element={<CreateDocumentPage />} />
                <Route path="document/:documentId" element={<DocumentPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </EditorProvider>
      </QueryClientProvider>
    </Theme>
  </StrictMode>,
);
