import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PasswordProtection } from './PasswordProtection';

describe('PasswordProtection', () => {
  describe('Checkbox', () => {
    it('should be disabled by default', () => {
      render(<PasswordProtection onPasswordChange={() => {}} />);

      const checkbox = screen.getByTestId('passwordProtectionCheckbox');

      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Password change handler', () => {
    it('should be called with changes and accord for debouncing', async () => {
      const callback = vi.fn();
      render(<PasswordProtection onPasswordChange={callback} />);

      const checkbox = screen.getByTestId('passwordProtectionCheckbox');
      await userEvent.click(checkbox);
      const passwordField = screen.getByTestId('passwordField');
      await userEvent.type(passwordField, 'my secret password');

      // Account for debouncing
      await waitFor(() => {
        expect(callback).toHaveBeenCalledExactlyOnceWith('my secret password');
      });
    });

    it('should be called with null when the password is empty', async () => {
      const callback = vi.fn();
      render(<PasswordProtection onPasswordChange={callback} />);

      const checkbox = screen.getByTestId('passwordProtectionCheckbox');
      await userEvent.click(checkbox);
      const passwordField = screen.getByTestId('passwordField');
      await userEvent.type(passwordField, 'my secret password');
      await userEvent.clear(passwordField);

      // Account for debouncing
      await waitFor(() => {
        expect(callback).toHaveBeenCalledExactlyOnceWith(null);
      });
    });
  });

  describe('Password field', () => {
    it('should be hidden when password protection is disabled', () => {
      render(<PasswordProtection onPasswordChange={() => {}} />);

      const passwordField = screen.queryByTestId('passwordField');

      expect(passwordField).toBeNull();
    });

    it('should be visible when password protection is enabled', async () => {
      render(<PasswordProtection onPasswordChange={() => {}} />);

      const checkbox = screen.getByTestId('passwordProtectionCheckbox');
      await userEvent.click(checkbox);

      const passwordField = screen.getByTestId('passwordField');
      expect(passwordField).toBeInTheDocument();
    });
  });

  describe('Password field', () => {
    it('should hide password reveal button when password field is empty', async () => {
      render(<PasswordProtection onPasswordChange={() => {}} />);

      const checkbox = screen.getByTestId('passwordProtectionCheckbox');
      await userEvent.click(checkbox);

      const revealPasswordButton = screen.getByTestId('revealPasswordButton');
      expect(revealPasswordButton).not.toBeVisible();
    });

    it('should show password reveal button when password field is filled', async () => {
      render(<PasswordProtection onPasswordChange={() => {}} />);

      const checkbox = screen.getByTestId('passwordProtectionCheckbox');
      await userEvent.click(checkbox);

      const passwordField = screen.getByTestId('passwordField');
      await userEvent.type(passwordField, 'my secret password');

      const revealPasswordButton = screen.getByTestId('revealPasswordButton');
      expect(revealPasswordButton).toBeVisible();
    });

    it('should hide password by default', async () => {
      render(<PasswordProtection onPasswordChange={() => {}} />);

      const checkbox = screen.getByTestId('passwordProtectionCheckbox');
      await userEvent.click(checkbox);

      const passwordField = screen.getByTestId('passwordField');
      await userEvent.type(passwordField, 'my secret password');

      expect(passwordField).toHaveAttribute('type', 'password');
    });

    it('should show password when password reveal button is clicked', async () => {
      render(<PasswordProtection onPasswordChange={() => {}} />);

      const checkbox = screen.getByTestId('passwordProtectionCheckbox');
      await userEvent.click(checkbox);

      const passwordField = screen.getByTestId('passwordField');
      await userEvent.type(passwordField, 'my secret password');

      const revealPasswordButton = screen.getByTestId('revealPasswordButton');
      await userEvent.click(revealPasswordButton);

      expect(passwordField).toHaveAttribute('type', 'text');
    });

    it('should be invalid when the password is empty', async () => {
      render(<PasswordProtection onPasswordChange={() => {}} />);

      const checkbox = screen.getByTestId('passwordProtectionCheckbox');
      await userEvent.click(checkbox);

      const passwordField = screen.getByTestId<HTMLInputElement>('passwordField');

      waitFor(() => {
        expect(passwordField.checkValidity()).toBe(false);
      });
    });

    it('should be invalid when the password is not at least 8 characters long', async () => {
      render(<PasswordProtection onPasswordChange={() => {}} />);

      const checkbox = screen.getByTestId('passwordProtectionCheckbox');
      await userEvent.click(checkbox);

      const passwordField = screen.getByTestId<HTMLInputElement>('passwordField');
      await userEvent.type(passwordField, 'mypa$$');

      waitFor(() => {
        expect(passwordField.checkValidity()).toBe(false);
      });
    });

    it('should be invalid when the password does not contain special characters', async () => {
      render(<PasswordProtection onPasswordChange={() => {}} />);

      const checkbox = screen.getByTestId('passwordProtectionCheckbox');
      await userEvent.click(checkbox);

      const passwordField = screen.getByTestId<HTMLInputElement>('passwordField');
      await userEvent.type(passwordField, 'password');

      waitFor(() => {
        expect(passwordField.checkValidity()).toBe(false);
      });
    });

    it('should be valid when the password is at least 8 characters long and contains special characters', async () => {
      render(<PasswordProtection onPasswordChange={() => {}} />);

      const checkbox = screen.getByTestId('passwordProtectionCheckbox');
      await userEvent.click(checkbox);

      const passwordField = screen.getByTestId<HTMLInputElement>('passwordField');
      await userEvent.type(passwordField, 'pa$$word');

      waitFor(() => {
        expect(passwordField.checkValidity()).toBe(true);
      });
    });
  });
});
