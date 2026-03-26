/// <reference types="vitest/browser" />
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Enables tests with `render` to work idempotently
afterEach(() => cleanup());
