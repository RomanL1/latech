import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DocumentMetadata } from '../../../features/documents/document';
import { DocumentGrid } from './DocumentGrid';

describe('DocumentGrid', () => {
  it('should display documents in grid', () => {
    const documents: DocumentMetadata[] = [
      { documentId: '123', name: 'Bachelor Thesis', lastEdited: new Date() },
      { documentId: '456', name: 'Cover Letter', lastEdited: new Date() },
    ];

    render(<DocumentGrid documents={documents} />);

    expect(screen.getByTestId('document-123')).toBeInTheDocument();
    expect(screen.getByTestId('document-456')).toBeInTheDocument();
  });

  it('should order documents by their lastEdit date descending', () => {
    const documents: DocumentMetadata[] = [
      { documentId: '2', name: 'Second', lastEdited: new Date(2020, 1, 2) },
      { documentId: '3', name: 'Third', lastEdited: new Date(2020, 1, 1) },
      { documentId: '1', name: 'First', lastEdited: new Date(2020, 1, 3) },
    ];

    render(<DocumentGrid documents={documents} />);

    const items = screen.getAllByRole('listitem');
    const testIds = items.map((item) => item.getAttribute('data-testid'));
    expect(testIds).toEqual(['document-1', 'document-2', 'document-3']);
  });
});
