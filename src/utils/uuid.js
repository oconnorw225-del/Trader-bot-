/**
 * UUID Generation Utility
 * Provides UUID generation with fallback for older browsers
 */

/**
 * Generate a RFC4122 version 4 UUID
 * @returns {string} UUID string
 */
export const generateUUID = () => {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const randomValue = Math.random() * 16 | 0;
    const hexValue = char === 'x' ? randomValue : (randomValue & 0x3 | 0x8);
    return hexValue.toString(16);
  });
};

export default { generateUUID };
