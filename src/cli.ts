import { Command } from 'commander';
import chalk from 'chalk';
import { setupProfile, authenticateProfile, logoutProfile } from './auth/setup.js';
import { listAccounts, getAccount } from './commands/accounts.js';
import { listCampaigns, getCampaign, listAdSets } from './commands/campaigns.js';
import { listProfiles, setActiveProfile, getConfig } from './utils/config.js';
import inquirer from 'inquirer';

const program = new Command();

program
  .name('meta-ads-cli')
  .description('CLI for Meta (Facebook) Ads API')
  .version('1.0.0');

// Setup command
program
  .command('setup')
  .description('Configure a new profile with Meta Ads API credentials')
  .action(async () => {
    try {
      await setupProfile();
    } catch (error: any) {
      console.error(chalk.red(`\n✖ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// Auth command
program
  .command('auth')
  .description('Authenticate with Meta and obtain access token')
  .option('-p, --profile <name>', 'Profile to authenticate')
  .action(async (options) => {
    try {
      await authenticateProfile(options.profile);
    } catch (error: any) {
      console.error(chalk.red(`\n✖ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// Logout command
program
  .command('logout')
  .description('Clear stored credentials')
  .option('-p, --profile <name>', 'Profile to logout from')
  .action(async (options) => {
    try {
      await logoutProfile(options.profile);
    } catch (error: any) {
      console.error(chalk.red(`\n✖ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// Config command
program
  .command('config')
  .description('Display current configuration')
  .option('-p, --profile <name>', 'Profile to display')
  .action(async (options) => {
    try {
      const { getProfile } = await import('./utils/config.js');
      const profile = getProfile(options.profile);
      
      if (!profile) {
        console.log(chalk.yellow('\nNo profile found. Run \'meta-ads-cli setup\' first.\n'));
        return;
      }

      console.log(chalk.bold.cyan(`\n🔧 Configuration: ${profile.name}\n`));
      console.log(`App ID:           ${profile.appId}`);
      console.log(`App Secret:       ${'*'.repeat(profile.appSecret.length)}`);
      console.log(`Ad Account ID:    ${profile.adAccountId || 'Not set'}`);
      console.log(`Access Token:     ${profile.accessToken ? chalk.green('✓ Set') : chalk.red('✗ Not set')}`);
      
      if (profile.tokenExpiry) {
        const daysLeft = Math.round((profile.tokenExpiry - Date.now()) / (1000 * 60 * 60 * 24));
        console.log(`Token Expires:    ${daysLeft > 0 ? `in ${daysLeft} days` : chalk.red('Expired')}`);
      }
      
      console.log('');
    } catch (error: any) {
      console.error(chalk.red(`\n✖ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// Profiles command
program
  .command('profiles')
  .description('Manage profiles')
  .option('--list', 'List all profiles')
  .option('--switch', 'Switch active profile')
  .action(async (options) => {
    try {
      if (options.list) {
        const profiles = listProfiles();
        const config = getConfig();
        
        if (profiles.length === 0) {
          console.log(chalk.yellow('\nNo profiles found. Run \'meta-ads-cli setup\' first.\n'));
          return;
        }

        console.log(chalk.bold.cyan('\n📋 Profiles:\n'));
        profiles.forEach(p => {
          const active = p.name === config.activeProfile ? chalk.green(' (active)') : '';
          console.log(`  ${p.name}${active}`);
        });
        console.log('');
        
      } else if (options.switch) {
        const profiles = listProfiles();
        
        if (profiles.length === 0) {
          console.log(chalk.yellow('\nNo profiles found. Run \'meta-ads-cli setup\' first.\n'));
          return;
        }

        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'profile',
            message: 'Select profile to activate:',
            choices: profiles.map(p => p.name),
          },
        ]);

        setActiveProfile(answers.profile);
        console.log(chalk.green(`\n✓ Switched to profile "${answers.profile}"\n`));
        
      } else {
        console.log(chalk.yellow('\nPlease specify --list or --switch\n'));
      }
    } catch (error: any) {
      console.error(chalk.red(`\n✖ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// Accounts command
program
  .command('accounts')
  .description('List accessible ad accounts')
  .option('--json', 'Output as JSON')
  .option('-p, --profile <name>', 'Profile to use')
  .action(async (options) => {
    try {
      await listAccounts(options);
    } catch (error: any) {
      console.error(chalk.red(`\n✖ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// Account command
program
  .command('account <account-id>')
  .description('Get details of a specific ad account')
  .option('--json', 'Output as JSON')
  .option('-p, --profile <name>', 'Profile to use')
  .action(async (accountId, options) => {
    try {
      await getAccount(accountId, options);
    } catch (error: any) {
      console.error(chalk.red(`\n✖ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// Campaigns command
program
  .command('campaigns')
  .description('List campaigns for an ad account')
  .option('-a, --account-id <id>', 'Ad Account ID')
  .option('-l, --limit <number>', 'Maximum campaigns to return', '50')
  .option('--json', 'Output as JSON')
  .option('-p, --profile <name>', 'Profile to use')
  .action(async (options) => {
    try {
      await listCampaigns({
        ...options,
        limit: parseInt(options.limit),
      });
    } catch (error: any) {
      console.error(chalk.red(`\n✖ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// Campaign command
program
  .command('campaign <campaign-id>')
  .description('Get details of a specific campaign')
  .option('--insights', 'Include insights data')
  .option('--json', 'Output as JSON')
  .option('-p, --profile <name>', 'Profile to use')
  .action(async (campaignId, options) => {
    try {
      await getCampaign(campaignId, options);
    } catch (error: any) {
      console.error(chalk.red(`\n✖ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// Ad Sets command
program
  .command('adsets <campaign-id>')
  .description('List ad sets for a campaign')
  .option('-l, --limit <number>', 'Maximum ad sets to return', '50')
  .option('--json', 'Output as JSON')
  .option('-p, --profile <name>', 'Profile to use')
  .action(async (campaignId, options) => {
    try {
      await listAdSets({
        ...options,
        campaignId,
        limit: parseInt(options.limit),
      });
    } catch (error: any) {
      console.error(chalk.red(`\n✖ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

export { program };
