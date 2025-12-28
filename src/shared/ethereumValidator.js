/**
 * Ethereum Address Validation Utility
 * Validates Ethereum wallet addresses
 */

/**
 * Validate Ethereum address format
 * @param {string} address - Ethereum address to validate
 * @returns {boolean} True if valid Ethereum address
 */
export const isValidEthereumAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Ethereum addresses must be 42 characters (0x + 40 hex characters)
  const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  
  return ethereumAddressRegex.test(address);
};

/**
 * Normalize Ethereum address to lowercase
 * @param {string} address - Ethereum address
 * @returns {string} Normalized address
 */
export const normalizeEthereumAddress = (address) => {
  if (!isValidEthereumAddress(address)) {
    throw new Error('Invalid Ethereum address');
  }
  
  return address.toLowerCase();
};

/**
 * Format Ethereum address for display
 * @param {string} address - Ethereum address
 * @param {number} prefixLength - Number of characters to show at start
 * @param {number} suffixLength - Number of characters to show at end
 * @returns {string} Formatted address (e.g., "0xd4eA...9a5")
 */
export const formatEthereumAddress = (address, prefixLength = 6, suffixLength = 4) => {
  if (!isValidEthereumAddress(address)) {
    return address;
  }
  
  const prefix = address.substring(0, prefixLength);
  const suffix = address.substring(address.length - suffixLength);
  
  return `${prefix}...${suffix}`;
};

/**
 * Validate and sanitize Ethereum address
 * @param {string} address - Ethereum address
 * @returns {object} Validation result
 */
export const validateEthereumAddress = (address) => {
  const isValid = isValidEthereumAddress(address);
  
  return {
    isValid,
    address: isValid ? normalizeEthereumAddress(address) : null,
    formatted: isValid ? formatEthereumAddress(address) : null,
    error: isValid ? null : 'Invalid Ethereum address format'
  };
};

export default {
  isValidEthereumAddress,
  normalizeEthereumAddress,
  formatEthereumAddress,
  validateEthereumAddress
};
