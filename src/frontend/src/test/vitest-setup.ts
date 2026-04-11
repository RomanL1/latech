/// <reference types="vitest/browser" />
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

/// <reference types="vitest/browser" />
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Enables tests with `render` to work idempotently
afterEach(() => cleanup());

// Mock window.ENV for test environment
// @ts-expect-error Mocking window property before tests run
globalThis.window.ENV = {
  VITE_API_HOST: 'http://localhost:5001/api',
  VITE_WS_HOST: 'ws://localhost:3000/ws',
};
