/**
 * Tests for freelance platform connectors
 */

import UpworkConnector from '../../src/freelance/platforms/upworkConnector.js';
import FiverrConnector from '../../src/freelance/platforms/fiverrConnector.js';
import FreelancerConnector from '../../src/freelance/platforms/freelancerConnector.js';

describe('Upwork Connector', () => {
  let connector;

  beforeEach(() => {
    connector = new UpworkConnector('test-id', 'test-secret');
  });

  test('should authenticate', async () => {
    const result = await connector.authenticate();
    expect(result).toBe(true);
    expect(connector.authenticated).toBe(true);
  });

  test('should search for jobs', async () => {
    await connector.authenticate();
    const jobs = await connector.searchJobs();

    expect(Array.isArray(jobs)).toBe(true);
    expect(jobs.length).toBeGreaterThan(0);
  });

  test('should submit proposal', async () => {
    await connector.authenticate();
    const result = await connector.submitProposal('job_1', {
      coverLetter: 'Test proposal'
    });

    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('proposalId');
  });

  test('should throw error when not authenticated', async () => {
    await expect(connector.searchJobs()).rejects.toThrow('Not authenticated');
  });
});

describe('Fiverr Connector', () => {
  let connector;

  beforeEach(() => {
    connector = new FiverrConnector('test-key');
  });

  test('should create gig', async () => {
    await connector.authenticate();
    const gig = await connector.createGig({
      title: 'Test Gig',
      description: 'Test description',
      price: 100
    });

    expect(gig).toHaveProperty('id');
    expect(gig.title).toBe('Test Gig');
    expect(gig.status).toBe('active');
  });

  test('should get gigs', async () => {
    await connector.authenticate();
    await connector.createGig({
      title: 'Gig 1',
      description: 'Desc',
      price: 100
    });

    const gigs = await connector.getGigs();
    expect(gigs.length).toBe(1);
  });
});

describe('Freelancer Connector', () => {
  let connector;

  beforeEach(() => {
    connector = new FreelancerConnector('test-token');
  });

  test('should search projects', async () => {
    await connector.authenticate();
    const projects = await connector.searchProjects();

    expect(Array.isArray(projects)).toBe(true);
  });

  test('should place bid', async () => {
    await connector.authenticate();
    const result = await connector.placeBid('project_1', {
      amount: 1000,
      proposal: 'Test bid'
    });

    expect(result).toHaveProperty('success', true);
  });
});
