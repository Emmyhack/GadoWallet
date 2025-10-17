import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic'
  })],
  define: {
    global: 'globalThis',
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  // Performance optimizations
  build: {
    target: 'esnext',
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          solana: ['@solana/web3.js', '@solana/wallet-adapter-react', '@solana/wallet-adapter-wallets'],
          ui: ['react-hot-toast', 'lucide-react', '@headlessui/react']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: process.env.NODE_ENV === 'development'
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
    },
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'stream-browserify', 'crypto-browserify'],
  },
  server: {
    headers: {
      // Enhanced CSP for development - still allowing unsafe-eval for HMR
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data:;
        worker-src 'self' blob: data:;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' data: https://fonts.gstatic.com;
        img-src 'self' data: https: blob:;
        media-src 'self' data: blob:;
        connect-src 'self' 
          https://api.devnet.solana.com https://api.testnet.solana.com https://api.mainnet-beta.solana.com
          https://explorer.solana.com https://solscan.io https://solanabeach.io
          wss://api.devnet.solana.com wss://api.testnet.solana.com wss://api.mainnet-beta.solana.com
          https://gateway.sanctum.so https://tpg.sanctum.so;
        frame-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        upgrade-insecure-requests;
        block-all-mixed-content;
      `.replace(/\s+/g, ' ').trim()
    }
  }
})
