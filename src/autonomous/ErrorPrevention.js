// ErrorPrevention.js

/**
 * Proactive Error Prevention System
 * A module that analyzes job listings to predict failures before applying.
 */

class ErrorPreventionSystem {
    constructor(jobListings) {
        this.jobListings = jobListings;
    }

    analyzeJobListings() {
        this.jobListings.forEach(job => {
            const riskFactors = this.identifyRiskFactors(job);
            if (riskFactors.length) {
                console.log(`Warning: Job listing ${job.title} has potential risks: ${riskFactors.join(', ')}`);
            } else {
                console.log(`Job listing ${job.title} seems safe to apply.`);
            }
        });
    }

    identifyRiskFactors(job) {
        const risks = [];
        // Example risk factors:
        if (job.remote === false && job.location === 'difficult') {
            risks.push('Difficult location for non-remote jobs');
        }
        if (job.salary < 50000) {
            risks.push('Low salary');
        }
        if (!job.benefits.includes('health insurance')) {
            risks.push('No health insurance benefits');
        }
        return risks;
    }
}

// Example Usage:
const jobListings = [
    { title: 'Software Engineer', remote: false, location: 'difficult', salary: 45000, benefits: [] },
    { title: 'Data Scientist', remote: true, location: 'easy', salary: 70000, benefits: ['health insurance'] }
];

const eps = new ErrorPreventionSystem(jobListings);
eps.analyzeJobListings();
