import configManager from './configManager.js';

/**
 * Validates API configurations before use to prevent "unused variable" ESLint warnings
 */
function validateApiConfig() {
    const validationResults = {
        errors: [],
        warnings: [],
        info: [],
    };

    // Example credential checks
    const { ndaxApiKey, ndaxApiSecret, ndaxUserId } = configManager.getNDAXCredentials();
    if (!ndaxApiKey || !ndaxApiSecret || !ndaxUserId) {
        validationResults.errors.push({
            message: 'Missing NDAX Trading API credentials',
            severity: 'error',
            relatedFiles: ['configManager.js'],
        });
    } else {
        validationResults.info.push({
            message: 'NDAX credentials are configured properly.',
            severity: 'info',
        });
    }

    // Validate freelance platform API configurations
    const freelanceAPIs = ['Upwork', 'Fiverr', 'Freelancer', 'Toptal', 'Guru', 'PeoplePerHour'];
    freelanceAPIs.forEach(api => {
        const apiKey = configManager.getApiKey(api);
        if (!apiKey) {
            validationResults.warnings.push({
                message: `Missing API key for ${api}`,
                severity: 'warning',
                relatedFiles: ['configManager.js'],
            });
        }
    });

    // Validate blockchain and wallet configurations (dummy example)
    const walletConfig = configManager.getWalletConfig();
    if (!walletConfig) {
        validationResults.errors.push({
            message: 'Blockchain configuration is missing',
            severity: 'error',
            relatedFiles: ['configManager.js'],
        });
    }

    return validationResults;
}

/**
 * Determines if API clients should be created
 * @returns {boolean} - True if APIs should be initialized
 */
function shouldInitializeApi() {
    const validationResult = validateApiConfig();
    return validationResult.errors.length === 0;
}

/**
 * Returns detailed validation results with errors, warnings, and affected files
 * @returns {Object} - Validation results
 */
function getApiStatus() {
    return validateApiConfig();
}

export {
    validateApiConfig,
    shouldInitializeApi,
    getApiStatus,
};