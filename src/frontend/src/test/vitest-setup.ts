import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
/// <reference types="vitest/browser" />

// Enables tests with `render` to work idempotently
afterEach(() => cleanup());
