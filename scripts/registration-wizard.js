#!/usr/bin/env node

/**
 * Registration Wizard for AI Job Platforms
 * Interactive CLI to guide user through platform registration
 */

import { createInterface } from 'readline';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const ENV_FILE = join(PROJECT_ROOT, '.env');

// Platform configurations
const PLATFORMS = {
  toloka: {
    name: 'Toloka',
    signupUrl: 'https://toloka.ai/tolokers/',
    instructions: 'Sign up with email. After email verification, find API key in Settings > API.',
    envVar: 'TOLOKA_API_KEY'
  },
  remotasks: {
    name: 'Remotasks',
    signupUrl: 'https://www.remotasks.com/en/worker',
    instructions: 'Sign up with email. Complete training. API key in Account > Developer.',
    envVar: 'REMOTASKS_API_KEY'
  },
  rapidworkers: {
    name: 'RapidWorkers',
    signupUrl: 'https://rapidworkers.com/worker/register',
    instructions: 'Sign up with email. Verify email. API key in Settings > API Access.',
    envVar: 'RAPIDWORKERS_API_KEY'
  },
  scaleai: {
    name: 'Scale AI',
    signupUrl: 'https://scale.com/outlier',
    instructions: 'Sign up. Complete assessment. API key after approval (may take 1-2 days).',
    envVar: 'SCALEAI_API_KEY'
  },
  appen: {
    name: 'Appen',
    signupUrl: 'https://connect.appen.com/qrp/public/jobs',
    instructions: 'Sign up. Complete profile. Pass qualification test. API in Profile > API.',
    envVar: 'APPEN_API_KEY'
  },
  lionbridge: {
    name: 'Lionbridge',
    signupUrl: 'https://www.lionbridge.com/join-our-team/ai-training-jobs/',
    instructions: 'Apply online. Wait for approval email. API key in dashboard after approval.',
    envVar: 'LIONBRIDGE_API_KEY'
  },
  clickworker: {
    name: 'Clickworker',
    signupUrl: 'https://www.clickworker.com/en/clickworker',
    instructions: 'Sign up with email. Verify identity. API key in Account > API.',
    envVar: 'CLICKWORKER_API_KEY'
  },
  microworkers: {
    name: 'Microworkers',
    signupUrl: 'https://microworkers.com/signup.php',
    instructions: 'Sign up with email. Complete profile. API key in Settings.',
    envVar: 'MICROWORKERS_API_KEY'
  },
  dataloop: {
    name: 'Dataloop',
    signupUrl: 'https://dataloop.ai/annotators/',
    instructions: 'Apply as annotator. Complete training after approval. API in Settings.',
    envVar: 'DATALOOP_API_KEY'
  },
  labelbox: {
    name: 'Labelbox',
    signupUrl: 'https://labelbox.com/product/annotate',
    instructions: 'Contact for labeler account. API key provided after onboarding.',
    envVar: 'LABELBOX_API_KEY'
  },
  hive: {
    name: 'Hive',
    signupUrl: 'https://thehive.ai/labelers',
    instructions: 'Apply as labeler. Complete training. API key in Account Settings.',
    envVar: 'HIVE_API_KEY'
  },
  spare5: {
    name: 'Spare5',
    signupUrl: 'https://app.spare5.com/fives',
    instructions: 'Sign up with email. Complete training tasks. API in Profile > API Access.',
    envVar: 'SPARE5_API_KEY'
  }
};

class RegistrationWizard {
  constructor() {
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.config = {
      botEmail: '',
      botName: '',
      baseEmail: '',
      apiKeys: {}
    };
  }

  async start() {
    console.clear();
    this.printHeader();
    
    try {
      // Get user information
      await this.getUserInfo();
      
      // Register on platforms
      await this.registerPlatforms();
      
      // Save configuration
      await this.saveConfiguration();
      
      this.printSuccess();
    } catch (error) {
      console.error('\n❌ Error:', error.message);
    } finally {
      this.rl.close();
    }
  }

  printHeader() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║     🤖 NDAX Auto-Start Platform Registration Wizard 🤖      ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('This wizard will help you register on 12 AI job platforms.');
    console.log('Estimated time: 10-15 minutes');
    console.log('');
  }

  async getUserInfo() {
    console.log('📋 Step 1: Basic Information\n');
    
    this.config.botName = await this.question('Enter bot name (for identification): ');
    this.config.baseEmail = await this.question('Enter your base email (we&apos;ll use + addressing): ');
    
    // Validate email
    if (!this.config.baseEmail.includes('@')) {
      throw new Error('Invalid email address');
    }
    
    console.log(`\n✅ We&apos;ll use variations like: ${this.config.baseEmail.replace('@', '+toloka@')}`);
    console.log('');
  }

  async registerPlatforms() {
    console.log('📝 Step 2: Platform Registration\n');
    console.log('For each platform, we&apos;ll:');
    console.log('  1. Open the signup page in your browser');
    console.log('  2. You register and get your API key');
    console.log('  3. You paste the API key here\n');
    
    const shouldContinue = await this.question('Ready to start? (y/n): ');
    if (shouldContinue.toLowerCase() !== 'y') {
      throw new Error('Registration cancelled by user');
    }
    
    let registered = 0;
    
    for (const [id, platform] of Object.entries(PLATFORMS)) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`\n🌐 Platform ${Object.keys(this.config.apiKeys).length + 1}/12: ${platform.name}`);
      console.log(`\n📧 Suggested email: ${this.generateEmail(id)}`);
      console.log(`🔒 Suggested password: ${this.generatePassword()}`);
      console.log(`\n📝 Instructions:`);
      console.log(`   ${platform.instructions}`);
      console.log('');
      
      const action = await this.question('(o)pen signup, (s)kip, or (q)uit: ');
      
      if (action.toLowerCase() === 'q') {
        break;
      }
      
      if (action.toLowerCase() === 's') {
        console.log('⏭️  Skipped');
        continue;
      }
      
      if (action.toLowerCase() === 'o') {
        // Open browser
        await this.openBrowser(platform.signupUrl);
        console.log('✅ Browser opened. Complete registration and get your API key.\n');
        
        const apiKey = await this.question('Paste API key (or press Enter to skip): ');
        
        if (apiKey && apiKey.trim()) {
          this.config.apiKeys[platform.envVar] = apiKey.trim();
          registered++;
          console.log('✅ API key saved!');
        } else {
          console.log('⏭️  No API key entered, skipping...');
        }
      }
    }
    
    console.log(`\n✅ Registered on ${registered} platforms!`);
    
    if (registered < 3) {
      console.log('\n⚠️  Warning: You need at least 3 platforms for optimal results.');
      const continueAnyway = await this.question('Continue anyway? (y/n): ');
      if (continueAnyway.toLowerCase() !== 'y') {
        throw new Error('Insufficient platforms registered');
      }
    }
  }

  async saveConfiguration() {
    console.log('\n💾 Step 3: Saving Configuration\n');
    
    try {
      // Read existing .env file
      let envContent = '';
      try {
        envContent = await fs.readFile(ENV_FILE, 'utf8');
      } catch (error) {
        // .env doesn't exist, will create new one
        console.log('Creating new .env file...');
      }
      
      // Add bot configuration
      envContent = this.updateEnvVariable(envContent, 'BOT_NAME', this.config.botName);
      envContent = this.updateEnvVariable(envContent, 'BOT_EMAIL', this.config.baseEmail);
      
      // Add API keys
      for (const [key, value] of Object.entries(this.config.apiKeys)) {
        envContent = this.updateEnvVariable(envContent, key, value);
      }
      
      // Add default strategy if not set
      if (!envContent.includes('AUTOSTART_STRATEGY=')) {
        envContent += '\n# Auto-Start Configuration\n';
        envContent += 'AUTOSTART_STRATEGY=balanced\n';
        envContent += 'AUTOSTART_SCAN_INTERVAL=30000\n';
        envContent += 'AUTOSTART_MAX_CONCURRENT_JOBS=5\n';
        envContent += 'AUTOSTART_MIN_PAYMENT=0.01\n';
      }
      
      // Write .env file
      await fs.writeFile(ENV_FILE, envContent);
      
      console.log('✅ Configuration saved to .env');
    } catch (error) {
      console.error('Failed to save configuration:', error.message);
      console.log('\nManually add these to your .env file:');
      console.log(`BOT_NAME=${this.config.botName}`);
      console.log(`BOT_EMAIL=${this.config.baseEmail}`);
      for (const [key, value] of Object.entries(this.config.apiKeys)) {
        console.log(`${key}=${value}`);
      }
    }
  }

  updateEnvVariable(content, key, value) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    
    if (regex.test(content)) {
      return content.replace(regex, `${key}=${value}`);
    } else {
      return content + `\n${key}=${value}`;
    }
  }

  generateEmail(platformId) {
    const [local, domain] = this.config.baseEmail.split('@');
    return `${local}+${platformId}@${domain}`;
  }

  generatePassword() {
    // Generate a secure random password without bias
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const charsetLength = charset.length;
    let password = '';
    
    // Use rejection sampling to avoid modulo bias
    const maxValid = 256 - (256 % charsetLength);
    const bytes = crypto.randomBytes(32); // Get extra bytes for rejection sampling
    
    let bytesUsed = 0;
    while (password.length < 16 && bytesUsed < bytes.length) {
      const byte = bytes[bytesUsed++];
      // Only use bytes that fall within valid range to avoid bias
      if (byte < maxValid) {
        password += charset[byte % charsetLength];
      }
    }
    
    // If we didn't get enough characters (unlikely), recurse
    if (password.length < 16) {
      return this.generatePassword();
    }
    
    return password;
  }

  async openBrowser(url) {
    return new Promise((resolve) => {
      const command = process.platform === 'darwin' ? 'open' :
                     process.platform === 'win32' ? 'start' :
                     'xdg-open';
      
      exec(`${command} "${url}"`, (error) => {
        if (error) {
          console.log(`\n⚠️  Could not open browser automatically.`);
          console.log(`Please manually open: ${url}`);
        }
        resolve();
      });
    });
  }

  printSuccess() {
    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 Registration Complete!\n');
    console.log('Next steps:');
    console.log('  1. Run: npm start');
    console.log('  2. Open mobile app: http://localhost:3000/mobile');
    console.log('  3. Start the auto-start system');
    console.log('\n💡 Tip: You can register more platforms later by running:');
    console.log('     npm run register');
    console.log('\n' + '='.repeat(60) + '\n');
  }

  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }
}

// Run wizard
const wizard = new RegistrationWizard();
wizard.start().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
