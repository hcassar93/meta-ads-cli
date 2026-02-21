import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { MetaAdsProfile, saveProfile } from '../utils/config.js';
import { startOAuthFlow, exchangeCodeForToken, getLongLivedToken } from './oauth.js';

export async function setupProfile(): Promise<void> {
  console.log(chalk.bold.cyan('\n🚀 Meta Ads CLI Setup\n'));
  console.log(chalk.gray('Setting up a new profile for Meta Ads API access.\n'));

  // Prompt for profile details
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'profileName',
      message: 'Profile name:',
      default: 'default',
      validate: (input) => input.length > 0 || 'Profile name is required',
    },
    {
      type: 'input',
      name: 'appId',
      message: 'Meta App ID:',
      validate: (input) => input.length > 0 || 'App ID is required',
    },
    {
      type: 'password',
      name: 'appSecret',
      message: 'Meta App Secret:',
      validate: (input) => input.length > 0 || 'App Secret is required',
    },
    {
      type: 'input',
      name: 'adAccountId',
      message: 'Ad Account ID (optional, format: act_XXXXXXXXX):',
    },
  ]);

  // Create profile
  const profile: MetaAdsProfile = {
    name: answers.profileName,
    appId: answers.appId,
    appSecret: answers.appSecret,
    adAccountId: answers.adAccountId || undefined,
  };

  // Save profile
  saveProfile(profile);

  console.log(chalk.green(`\n✓ Profile "${profile.name}" saved successfully!\n`));
  console.log(chalk.cyan('Next step: Run authentication'));
  console.log(chalk.gray(`  meta-ads-cli auth -p ${profile.name}\n`));
}

export async function authenticateProfile(profileName?: string): Promise<void> {
  const { getProfile, saveProfile } = await import('../utils/config.js');
  
  const profile = getProfile(profileName);
  
  if (!profile) {
    throw new Error(profileName 
      ? `Profile "${profileName}" not found. Run 'meta-ads-cli setup' first.`
      : 'No profile configured. Run \'meta-ads-cli setup\' first.'
    );
  }

  console.log(chalk.bold.cyan(`\n🔐 Authenticating profile: ${profile.name}\n`));

  const spinner = ora('Waiting for authorization...').start();

  try {
    // Start OAuth flow
    const code = await startOAuthFlow(profile);
    
    spinner.text = 'Exchanging authorization code for access token...';
    
    // Exchange code for short-lived token
    const { accessToken: shortToken } = await exchangeCodeForToken(
      profile.appId,
      profile.appSecret,
      code
    );
    
    spinner.text = 'Getting long-lived access token...';
    
    // Exchange for long-lived token
    const { accessToken, expiresIn } = await getLongLivedToken(
      profile.appId,
      profile.appSecret,
      shortToken
    );
    
    // Save token
    profile.accessToken = accessToken;
    profile.tokenExpiry = Date.now() + (expiresIn * 1000);
    
    saveProfile(profile);
    
    spinner.succeed(chalk.green('Authentication successful!'));
    
    console.log(chalk.gray(`\nToken expires in ~${Math.round(expiresIn / 86400)} days`));
    console.log(chalk.cyan('\nYou can now use Meta Ads CLI commands!\n'));
    
  } catch (error) {
    spinner.fail('Authentication failed');
    throw error;
  }
}

export async function logoutProfile(profileName?: string): Promise<void> {
  const { getProfile, saveProfile } = await import('../utils/config.js');
  
  const profile = getProfile(profileName);
  
  if (!profile) {
    throw new Error(profileName 
      ? `Profile "${profileName}" not found.`
      : 'No active profile found.'
    );
  }

  // Clear tokens
  profile.accessToken = undefined;
  profile.tokenExpiry = undefined;
  
  saveProfile(profile);
  
  console.log(chalk.green(`\n✓ Logged out from profile "${profile.name}"\n`));
}
