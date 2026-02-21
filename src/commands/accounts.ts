import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import { getProfile } from '../utils/config.js';
import { createAPIClient } from '../api/meta-ads.js';

export async function listAccounts(options: { json?: boolean; profile?: string }) {
  const profile = getProfile(options.profile);
  
  if (!profile) {
    throw new Error('No profile found. Run \'meta-ads-cli setup\' first.');
  }

  const spinner = ora('Fetching ad accounts...').start();

  try {
    const api = createAPIClient(profile);
    const accounts = await api.getAdAccounts(100);

    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(accounts, null, 2));
      return;
    }

    if (accounts.length === 0) {
      console.log(chalk.yellow('\nNo ad accounts found.\n'));
      return;
    }

    const table = new Table({
      head: ['ID', 'Name', 'Status', 'Currency', 'Balance'].map(h => chalk.cyan(h)),
      style: { head: [], border: ['gray'] },
    });

    accounts.forEach((account: any) => {
      table.push([
        account.id,
        account.name,
        account.account_status === 1 ? chalk.green('Active') : chalk.red('Inactive'),
        account.currency,
        account.balance ? `$${(parseInt(account.balance) / 100).toFixed(2)}` : '-',
      ]);
    });

    console.log('');
    console.log(table.toString());
    console.log(chalk.gray(`\nTotal: ${accounts.length} ad account(s)\n`));

  } catch (error: any) {
    spinner.fail('Failed to fetch ad accounts');
    throw error;
  }
}

export async function getAccount(accountId: string, options: { json?: boolean; profile?: string }) {
  const profile = getProfile(options.profile);
  
  if (!profile) {
    throw new Error('No profile found. Run \'meta-ads-cli setup\' first.');
  }

  const spinner = ora(`Fetching account ${accountId}...`).start();

  try {
    const api = createAPIClient(profile);
    const account = await api.getAdAccount(accountId);

    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(account, null, 2));
      return;
    }

    console.log(chalk.bold.cyan(`\n📊 Account: ${account.name}\n`));
    console.log(chalk.gray('Details:'));
    console.log(`  ID:           ${account.id}`);
    console.log(`  Status:       ${account.account_status === 1 ? chalk.green('Active') : chalk.red('Inactive')}`);
    console.log(`  Currency:     ${account.currency}`);
    console.log(`  Timezone:     ${account.timezone_name}`);
    console.log(`  Balance:      ${account.balance ? `$${(parseInt(account.balance) / 100).toFixed(2)}` : '-'}`);
    console.log(`  Amount Spent: ${account.amount_spent ? `$${(parseInt(account.amount_spent) / 100).toFixed(2)}` : '-'}`);
    console.log(`  Spend Cap:    ${account.spend_cap ? `$${(parseInt(account.spend_cap) / 100).toFixed(2)}` : 'Unlimited'}\n`);

  } catch (error: any) {
    spinner.fail('Failed to fetch account');
    throw error;
  }
}
