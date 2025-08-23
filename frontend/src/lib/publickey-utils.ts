import { PublicKey } from '@solana/web3.js';
import { getProgramId } from './config';

/**
 * Safely creates a PublicKey instance with error handling
 * @param key - The public key string or buffer
 * @returns PublicKey instance or null if creation fails
 */
export function safeCreatePublicKey(key: string | Buffer | Uint8Array): PublicKey | null {
  try {
    return new PublicKey(key);
  } catch (error) {
    console.error('Failed to create PublicKey:', error, 'Input:', key);
    return null;
  }
}

/**
 * Validates if a string is a valid Solana public key
 * @param key - The key string to validate
 * @returns boolean indicating if the key is valid
 */
export function isValidPublicKey(key: string): boolean {
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Program ID for the Gada program
 */
export const PROGRAM_ID = getProgramId();

/**
 * Token Program ID with safe initialization
 */
export const TOKEN_PROGRAM_ID = (() => {
  const tokenProgramIdString = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
  const publicKey = safeCreatePublicKey(tokenProgramIdString);
  if (!publicKey) {
    console.error('Failed to initialize TOKEN_PROGRAM_ID');
    // Return a default PublicKey as fallback
    return new PublicKey('11111111111111111111111111111112');
  }
  return publicKey;
})();