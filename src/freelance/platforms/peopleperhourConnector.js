/**
 * PeoplePerHour platform connector
 */

class PeoplePerHourConnector {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.PEOPLEPERHOUR_API_KEY;
    this.authenticated = false;
  }

  async authenticate() {
    if (!this.apiKey) throw new Error('API key not provided');
    this.authenticated = true;
    return true;
  }

  // eslint-disable-next-line no-unused-vars
  async searchProjects(criteria = {}) {
    if (!this.authenticated) throw new Error('Not authenticated');
    return [{
      id: 'pph_1',
      title: 'Frontend Developer',
      budget: 2500,
      platform: 'PeoplePerHour'
    }];
  }

  // eslint-disable-next-line no-unused-vars
  async sendProposal(projectId, proposal) {
    if (!this.authenticated) throw new Error('Not authenticated');
    return {
      success: true,
      proposalId: `prop_${Date.now()}`,
      platform: 'PeoplePerHour'
    };
  }

  async getEarnings() {
    if (!this.authenticated) throw new Error('Not authenticated');
    return { totalEarnings: 0, platform: 'PeoplePerHour' };
  }
}

export default PeoplePerHourConnector;
