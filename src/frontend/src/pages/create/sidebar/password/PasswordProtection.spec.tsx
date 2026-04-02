import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { useDocumentCreationForm } from '../../form';
import { PasswordProtection } from './PasswordProtection';

function ComponentUnderTest() {
  const form = useDocumentCreationForm();
  return (
    <FormProvider {...form}>
      <PasswordProtection />
    </FormProvider>
  );
}

describe('PasswordProtection', () => {
  describe('Checkbox', () => {
    it('should be disabled by default', () => {
      render(<ComponentUnderTest />);

      const checkbox = screen.getByTestId('passwordProtectionCheckbox');

      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Password field', () => {
    it('should be hidden when password protection is disabled', () => {
      render(<ComponentUnderTest />);

      const passwordField = screen.queryByTestId('passwordField');

      expect(passwordField).toBeNull();
    });

    it('should be visible when password protection is enabled', async () => {
      render(<ComponentUnderTest />);

      const checkbox = screen.getByTestId('passwordProtectionCheckbox');
      await userEvent.click(checkbox);

      const passwordField = screen.getByTestId('passwordField');
      expect(passwordField).toBeInTheDocument();
    });

    it('should hide password reveal button when password field is empty', async () => {
      render(<ComponentUnderTest />);

      const checkbox = screen.getByTestId('passwordProtectionCheckbox');
      await userEvent.click(checkbox);

      const revealPasswordButton = screen.getByTestId('revealPasswordButton');
      expect(revealPasswordButton).not.toBeVisible();
    });

    it('should show password reveal button when password field is filled', async () => {
      render(<ComponentUnderTest />);

      const checkbox = screen.getByTestId('passwordProtectionCheckbox');
      await userEvent.click(checkbox);

      const passwordField = screen.getByTestId('passwordField');
      await userEvent.type(passwordField, 'my secret password');

      const revealPasswordButton = screen.getByTestId('revealPasswordButton');
      expect(revealPasswordButton).toBeVisible();
    });

    it('should hide password by default', async () => {
      render(<ComponentUnderTest />);

      const checkbox = screen.getByTestId('passwordProtectionCheckbox');
      await userEvent.click(checkbox);

      const passwordField = screen.getByTestId('passwordField');
      await userEvent.type(passwordField, 'my secret password');

      expect(passwordField).toHaveAttribute('type', 'password');
    });

    it('should show password when password reveal button is clicked', async () => {
      render(<ComponentUnderTest />);

      const checkbox = screen.getByTestId('passwordProtectionCheckbox');
      await userEvent.click(checkbox);

      const passwordField = screen.getByTestId('passwordField');
      await userEvent.type(passwordField, 'my secret password');

      const revealPasswordButton = screen.getByTestId('revealPasswordButton');
      await userEvent.click(revealPasswordButton);

      expect(passwordField).toHaveAttribute('type', 'text');
    });

    it('should be invalid when the password is empty', async () => {
      render(<ComponentUnderTest />);

      const checkbox = screen.getByTestId('passwordProtectionCheckbox');
      await userEvent.click(checkbox);

      const passwordField = screen.getByTestId<HTMLInputElement>('passwordField');

      waitFor(() => {
        expect(passwordField.checkValidity()).toBe(false);
      });
    });
  });
});
