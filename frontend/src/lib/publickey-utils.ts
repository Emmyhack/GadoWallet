import { PublicKey } from '@solana/web3.js';

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
 * Program ID for the Gada program with safe initialization
 */
export const PROGRAM_ID = (() => {
  const programIdString = '8N4Mjyw7ThUFdkJ1LbrAnCzfxSpxknqCZhkGHDCcaMRE';
  const publicKey = safeCreatePublicKey(programIdString);
  if (!publicKey) {
    console.error('Failed to initialize PROGRAM_ID');
    // Return a default PublicKey as fallback
    return new PublicKey('11111111111111111111111111111112'); // System Program ID as fallback
  }
  return publicKey;
})();

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