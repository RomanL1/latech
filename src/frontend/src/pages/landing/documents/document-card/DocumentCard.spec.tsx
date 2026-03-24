import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DocumentMetadata } from '../../../../features/documents/document';
import { DocumentCard } from './DocumentCard';

describe('DocumentCard', () => {
  it('should display document name', () => {
    const document: DocumentMetadata = {
      documentId: '123',
      name: 'My cool document',
      lastEdited: new Date(),
    };

    render(<DocumentCard document={document} />);

    expect(screen.getByTestId('documentTitle')).toHaveTextContent('My cool document');
  });

  describe('last edited date', () => {
    const referenceDate = new Date(2020, 3, 12);

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(referenceDate);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should display changes made exactly one second ago', () => {
      const document = getDocumentEditedInThePast(1, 'seconds');

      render(<DocumentCard document={document} />);

      expect(screen.getByTestId('lastEdited')).toHaveTextContent('Edited 1 second ago');
    });

    it('should display changes made a few seconds ago', () => {
      const document = getDocumentEditedInThePast(5, 'seconds');

      render(<DocumentCard document={document} />);

      expect(screen.getByTestId('lastEdited')).toHaveTextContent('Edited 5 seconds ago');
    });

    it('should display changes made exactly a minute ago', () => {
      const document = getDocumentEditedInThePast(1, 'minutes');

      render(<DocumentCard document={document} />);

      expect(screen.getByTestId('lastEdited')).toHaveTextContent('Edited 1 minute ago');
    });

    it('should display changes made a few minutes ago', () => {
      const document = getDocumentEditedInThePast(5, 'minutes');

      render(<DocumentCard document={document} />);

      expect(screen.getByTestId('lastEdited')).toHaveTextContent('Edited 5 minutes ago');
    });

    it('should display changes made exactly an hour ago', () => {
      const document = getDocumentEditedInThePast(1, 'hours');

      render(<DocumentCard document={document} />);

      expect(screen.getByTestId('lastEdited')).toHaveTextContent('Edited 1 hour ago');
    });

    it('should display changes made a few hours ago', () => {
      const document = getDocumentEditedInThePast(5, 'hours');

      render(<DocumentCard document={document} />);

      expect(screen.getByTestId('lastEdited')).toHaveTextContent('Edited 5 hours ago');
    });

    it('should display changes made exactly a day ago', () => {
      const document = getDocumentEditedInThePast(1, 'days');

      render(<DocumentCard document={document} />);

      expect(screen.getByTestId('lastEdited')).toHaveTextContent('Edited 1 day ago');
    });

    it('should display changes made a few days ago', () => {
      const document = getDocumentEditedInThePast(5, 'days');

      render(<DocumentCard document={document} />);

      expect(screen.getByTestId('lastEdited')).toHaveTextContent('Edited 5 days ago');
    });

    it('should display changes made exactly a month ago', () => {
      const document = getDocumentEditedInThePast(1, 'months');

      render(<DocumentCard document={document} />);

      expect(screen.getByTestId('lastEdited')).toHaveTextContent('Edited 1 month ago');
    });

    it('should display changes made a few months ago', () => {
      const document = getDocumentEditedInThePast(5, 'months');

      render(<DocumentCard document={document} />);

      expect(screen.getByTestId('lastEdited')).toHaveTextContent('Edited 5 months ago');
    });

    it('should display changes made exactly a year ago', () => {
      const document = getDocumentEditedInThePast(1, 'years');

      render(<DocumentCard document={document} />);

      expect(screen.getByTestId('lastEdited')).toHaveTextContent('Edited 1 year ago');
    });

    it('should display changes made a few years ago', () => {
      const document = getDocumentEditedInThePast(5, 'years');

      render(<DocumentCard document={document} />);

      expect(screen.getByTestId('lastEdited')).toHaveTextContent('Edited 5 years ago');
    });

    it('should display changes made just now', () => {
      const document = getDocumentEditedInThePast(0, 'seconds');

      render(<DocumentCard document={document} />);

      expect(screen.getByTestId('lastEdited')).toHaveTextContent('Edited just now');
    });
  });
});

type LastEditedDateUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years';
function getDocumentEditedInThePast(delta: number, unit: LastEditedDateUnit): DocumentMetadata {
  const lastEdited = new Date();

  switch (unit.toLowerCase()) {
    case 'seconds':
      lastEdited.setSeconds(lastEdited.getSeconds() - delta);
      break;
    case 'minutes':
      lastEdited.setMinutes(lastEdited.getMinutes() - delta);
      break;
    case 'hours':
      lastEdited.setHours(lastEdited.getHours() - delta);
      break;
    case 'days':
      lastEdited.setDate(lastEdited.getDate() - delta);
      break;
    case 'months':
      lastEdited.setMonth(lastEdited.getMonth() - delta);
      break;
    case 'years':
      lastEdited.setFullYear(lastEdited.getFullYear() - delta);
      break;
  }

  return {
    documentId: '123',
    name: 'My cool document',
    lastEdited: lastEdited,
  };
}
