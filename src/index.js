/**
 * Main entry point for NDAX Quantum Engine
 * Exports all modules for easy importing
 */

// Quantum Modules
export * as quantumStrategies from './quantum/quantumStrategies.js';
export { default as TradingEngine } from './quantum/tradingLogic.js';
export * as quantumMath from './quantum/quantumMath.js';
export * as feeCalculator from './quantum/feeCalculator.js';

// Freelance Platform Connectors
export { default as UpworkConnector } from './freelance/platforms/upworkConnector.js';
export { default as FiverrConnector } from './freelance/platforms/fiverrConnector.js';
export { default as FreelancerConnector } from './freelance/platforms/freelancerConnector.js';
export { default as ToptalConnector } from './freelance/platforms/toptalConnector.js';
export { default as GuruConnector } from './freelance/platforms/guruConnector.js';
export { default as PeoplePerHourConnector } from './freelance/platforms/peoplePerHourConnector.js';

// AI Modules
export { default as aiOrchestrator } from './freelance/ai/orchestrator.js';
export { default as modelManager } from './freelance/ai/modelManager.js';
export { default as plagiarismChecker } from './freelance/ai/plagiarismCheck.js';
export { default as feedbackLearning } from './freelance/ai/feedbackLearning.js';

// Freelance Management
export * as jobLogic from './freelance/jobLogic.js';
export { default as riskManager } from './freelance/riskManager.js';
export { default as paymentManager } from './freelance/paymentManager.js';

// Shared Utilities
export * as encryption from './shared/encryption.js';
export { default as analytics } from './shared/analytics.js';
export * as compliance from './shared/compliance.js';
export { default as crashRecovery } from './shared/crashRecovery.js';
export * as userSettings from './shared/userSettings.js';
export * as testHelpers from './shared/testHelpers.js';

// Version info
export const VERSION = '1.0.0';
export const NAME = 'NDAX Quantum Engine';
