export function runTestSuite(tests) {
  // Atomic test runner for strategies/jobs
  const results = [];
  for (const test of tests) {
    try {
      test.fn();
      results.push({ name: test.name, passed: true });
    } catch (error) {
      results.push({ name: test.name, passed: false, error: error.message });
    }
  }
  return results;
}
