import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { DocumentMetadata } from '../../../features/documents/document';
import { DocumentGrid } from './DocumentGrid';

describe('DocumentGrid', () => {
  it('should display documents in grid', () => {
    const documents: DocumentMetadata[] = [
      { documentId: '123', name: 'Bachelor Thesis', lastEdited: new Date() },
      { documentId: '456', name: 'Cover Letter', lastEdited: new Date() },
    ];

    render(
      <MemoryRouter>
        <DocumentGrid documents={documents} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('document-123')).toBeInTheDocument();
    expect(screen.getByTestId('document-456')).toBeInTheDocument();
  });

  it('should order documents by their lastEdit date descending', () => {
    const documents: DocumentMetadata[] = [
      { documentId: '2', name: 'Second', lastEdited: new Date(2020, 1, 2) },
      { documentId: '3', name: 'Third', lastEdited: new Date(2020, 1, 1) },
      { documentId: '1', name: 'First', lastEdited: new Date(2020, 1, 3) },
    ];

    render(
      <MemoryRouter>
        <DocumentGrid documents={documents} />
      </MemoryRouter>,
    );

    const items = screen.getAllByRole('listitem');
    const testIds = items.map((item) => item.getAttribute('data-testid'));
    expect(testIds).toEqual(['document-1', 'document-2', 'document-3']);
  });

  it('should navigate to the document creation page when create document is clicked', async () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<DocumentGrid documents={[]} />} />
          <Route path="/create" element={<div>Create page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByTestId('createDocumentButton'));
    expect(screen.getByText('Create page')).toBeInTheDocument();
  });

  it('should navigate to the document editor page when clicking a document', async () => {
    const documents: DocumentMetadata[] = [
      { documentId: '123', name: 'Bachelor Thesis', lastEdited: new Date() },
      { documentId: '456', name: 'Cover Letter', lastEdited: new Date() },
    ];

    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<DocumentGrid documents={documents} />} />
          <Route path="/document/123" element={<div>Document 123</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByTestId('document-123'));
    expect(screen.getByText('Document 123')).toBeInTheDocument();
  });
});
