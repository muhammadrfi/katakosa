import '@testing-library/jest-dom';
import 'resize-observer-polyfill';

// You can add global setup code here

// Example: Mocking global objects
// global.fetch = vi.fn();

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    // do nothing
  }
  observe(target) {
    // do nothing
  }
  unobserve(target) {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
};