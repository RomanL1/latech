import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DocumentNameField } from './DocumentNameField';
import userEvent from '@testing-library/user-event';

describe('DocumentNameField', () => {
  describe('Document name change handler', () => {
    it('should be called with changes and accord for debouncing', async () => {
      const callback = vi.fn();
      render(<DocumentNameField onDocumentNameChange={callback} />);

      const documentNameField = screen.getByTestId('documentNameField');
      await userEvent.type(documentNameField, 'my cool document');

      await waitFor(() => {
        expect(callback).toHaveBeenCalledExactlyOnceWith('my cool document');
      });
    });
  });
});
