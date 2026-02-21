import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import { getProfile } from '../utils/config.js';
import { createAPIClient } from '../api/meta-ads.js';

export async function listCampaigns(options: { accountId?: string; limit?: number; json?: boolean; profile?: string }) {
  const profile = getProfile(options.profile);
  
  if (!profile) {
    throw new Error('No profile found. Run \'meta-ads-cli setup\' first.');
  }

  const accountId = options.accountId || profile.adAccountId;
  
  if (!accountId) {
    throw new Error('Ad Account ID required. Provide --account-id or set it in your profile.');
  }

  const spinner = ora('Fetching campaigns...').start();

  try {
    const api = createAPIClient(profile);
    const campaigns = await api.getCampaigns(accountId, options.limit || 50);

    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(campaigns, null, 2));
      return;
    }

    if (campaigns.length === 0) {
      console.log(chalk.yellow('\nNo campaigns found.\n'));
      return;
    }

    const table = new Table({
      head: ['ID', 'Name', 'Status', 'Objective', 'Daily Budget', 'Start Time'].map(h => chalk.cyan(h)),
      style: { head: [], border: ['gray'] },
      colWidths: [18, 30, 12, 20, 15, 20],
    });

    campaigns.forEach((campaign: any) => {
      const status = campaign.status === 'ACTIVE' ? chalk.green('ACTIVE') : 
                     campaign.status === 'PAUSED' ? chalk.yellow('PAUSED') : 
                     chalk.gray(campaign.status);

      table.push([
        campaign.id,
        campaign.name.substring(0, 28) + (campaign.name.length > 28 ? '..' : ''),
        status,
        campaign.objective || '-',
        campaign.daily_budget ? `$${(parseInt(campaign.daily_budget) / 100).toFixed(2)}` : 
        campaign.lifetime_budget ? `$${(parseInt(campaign.lifetime_budget) / 100).toFixed(2)} (LT)` : '-',
        campaign.start_time ? new Date(campaign.start_time).toLocaleDateString() : '-',
      ]);
    });

    console.log('');
    console.log(table.toString());
    console.log(chalk.gray(`\nTotal: ${campaigns.length} campaign(s)\n`));

  } catch (error: any) {
    spinner.fail('Failed to fetch campaigns');
    throw error;
  }
}

export async function getCampaign(campaignId: string, options: { json?: boolean; insights?: boolean; profile?: string }) {
  const profile = getProfile(options.profile);
  
  if (!profile) {
    throw new Error('No profile found. Run \'meta-ads-cli setup\' first.');
  }

  const spinner = ora(`Fetching campaign ${campaignId}...`).start();

  try {
    const api = createAPIClient(profile);
    const campaign = await api.getCampaign(campaignId);

    if (options.insights) {
      spinner.text = 'Fetching insights...';
      const insights = await api.getCampaignInsights(campaignId);
      campaign.insights = insights;
    }

    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(campaign, null, 2));
      return;
    }

    console.log(chalk.bold.cyan(`\n📈 Campaign: ${campaign.name}\n`));
    console.log(chalk.gray('Details:'));
    console.log(`  ID:             ${campaign.id}`);
    console.log(`  Status:         ${campaign.status === 'ACTIVE' ? chalk.green('ACTIVE') : chalk.yellow(campaign.status)}`);
    console.log(`  Objective:      ${campaign.objective || '-'}`);
    console.log(`  Daily Budget:   ${campaign.daily_budget ? `$${(parseInt(campaign.daily_budget) / 100).toFixed(2)}` : '-'}`);
    console.log(`  Lifetime Budget: ${campaign.lifetime_budget ? `$${(parseInt(campaign.lifetime_budget) / 100).toFixed(2)}` : '-'}`);
    console.log(`  Start Time:     ${campaign.start_time ? new Date(campaign.start_time).toLocaleString() : '-'}`);
    console.log(`  Stop Time:      ${campaign.stop_time ? new Date(campaign.stop_time).toLocaleString() : 'Ongoing'}`);

    if (options.insights && campaign.insights) {
      console.log(chalk.bold.cyan('\nInsights (Last 30 days):'));
      console.log(`  Impressions:    ${parseInt(campaign.insights.impressions || 0).toLocaleString()}`);
      console.log(`  Clicks:         ${parseInt(campaign.insights.clicks || 0).toLocaleString()}`);
      console.log(`  Spend:          $${(parseFloat(campaign.insights.spend || 0)).toFixed(2)}`);
      console.log(`  CTR:            ${parseFloat(campaign.insights.ctr || 0).toFixed(2)}%`);
      console.log(`  CPC:            $${parseFloat(campaign.insights.cpc || 0).toFixed(2)}`);
      console.log(`  CPM:            $${parseFloat(campaign.insights.cpm || 0).toFixed(2)}`);
    }

    console.log('');

  } catch (error: any) {
    spinner.fail('Failed to fetch campaign');
    throw error;
  }
}

export async function listAdSets(options: { campaignId: string; limit?: number; json?: boolean; profile?: string }) {
  const profile = getProfile(options.profile);
  
  if (!profile) {
    throw new Error('No profile found. Run \'meta-ads-cli setup\' first.');
  }

  const spinner = ora('Fetching ad sets...').start();

  try {
    const api = createAPIClient(profile);
    const adSets = await api.getAdSets(options.campaignId, options.limit || 50);

    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(adSets, null, 2));
      return;
    }

    if (adSets.length === 0) {
      console.log(chalk.yellow('\nNo ad sets found.\n'));
      return;
    }

    const table = new Table({
      head: ['ID', 'Name', 'Status', 'Optimization Goal', 'Daily Budget'].map(h => chalk.cyan(h)),
      style: { head: [], border: ['gray'] },
      colWidths: [18, 35, 12, 25, 15],
    });

    adSets.forEach((adSet: any) => {
      const status = adSet.status === 'ACTIVE' ? chalk.green('ACTIVE') : 
                     adSet.status === 'PAUSED' ? chalk.yellow('PAUSED') : 
                     chalk.gray(adSet.status);

      table.push([
        adSet.id,
        adSet.name.substring(0, 33) + (adSet.name.length > 33 ? '..' : ''),
        status,
        adSet.optimization_goal || '-',
        adSet.daily_budget ? `$${(parseInt(adSet.daily_budget) / 100).toFixed(2)}` : '-',
      ]);
    });

    console.log('');
    console.log(table.toString());
    console.log(chalk.gray(`\nTotal: ${adSets.length} ad set(s)\n`));

  } catch (error: any) {
    spinner.fail('Failed to fetch ad sets');
    throw error;
  }
}
