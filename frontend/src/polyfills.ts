import { Buffer } from 'buffer'
import process from 'process'

// Set up global polyfills for browser environment
declare global {
  interface Window {
    Buffer: typeof Buffer
    process: typeof process
    global: typeof globalThis
  }
}

// Polyfills for browser environment
if (typeof window !== 'undefined') {
  window.Buffer = Buffer
  window.process = process
  window.global = window.global || window
}

// Ensure global is available in all contexts
if (typeof global === 'undefined') {
  (globalThis as any).global = globalThis
}

// Make Buffer available globally for all modules
if (!(globalThis as any).Buffer) {
  (globalThis as any).Buffer = Buffer
}
if (!(globalThis as any).process) {
  (globalThis as any).process = process
}

export {}