import CryptoJS from 'crypto-js';

/**
 * Encryption utility module for secure data handling
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || (process.env.NODE_ENV === 'test' ? 'test-key-for-testing-only' : null);

if (!ENCRYPTION_KEY && process.env.NODE_ENV !== 'test') {
  console.warn('Warning: ENCRYPTION_KEY not set. Encryption functions will fail in production.');
}

/**
 * Encrypt sensitive data
 * @param {string} data - Data to encrypt
 * @returns {string} Encrypted data
 */
export function encrypt(data) {
  if (!data) {
    throw new Error('Data is required for encryption');
  }
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
}

/**
 * Decrypt encrypted data
 * @param {string} encryptedData - Encrypted data to decrypt
 * @returns {any} Decrypted data
 */
export function decrypt(encryptedData) {
  if (!encryptedData) {
    throw new Error('Encrypted data is required for decryption');
  }
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

/**
 * Hash data using SHA256
 * @param {string} data - Data to hash
 * @returns {string} Hashed data
 */
export function hash(data) {
  if (!data) {
    throw new Error('Data is required for hashing');
  }
  return CryptoJS.SHA256(data).toString();
}

/**
 * Verify hashed data
 * @param {string} data - Original data
 * @param {string} hashedData - Hashed data to verify against
 * @returns {boolean} True if data matches hash
 */
export function verifyHash(data, hashedData) {
  return hash(data) === hashedData;
}

export default {
  encrypt,
  decrypt,
  hash,
  verifyHash
};
