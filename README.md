# Meta Ads CLI

A command-line interface for the Meta (Facebook) Ads API, enabling programmatic access to campaigns, ad sets, ads, and insights. Built with Node.js and TypeScript.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔐 **OAuth 2.0 Authentication** - Secure authentication with long-lived tokens
- 📊 **Campaign Management** - List and view campaigns, ad sets, and ads
- 📈 **Insights & Reporting** - Access performance metrics and campaign insights
- 👥 **Multi-Profile Support** - Manage multiple Meta Ads accounts
- 🎨 **Rich Output** - Table formatting and JSON export options
- 💾 **Secure Storage** - Encrypted credential storage with 0600 file permissions
- 🔄 **Multiple Ad Accounts** - Support for managing multiple ad accounts per profile

## Prerequisites

Before using this CLI, you need:

1. **Meta Developer Account** with an app created
2. **App ID and App Secret** from your Meta app
3. **Ad Account Access** - You must have access to at least one Meta Ads account

### Setup Guide

#### 1. Create a Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Choose **Business** as the app type
4. Fill in the app details and create the app

#### 2. Configure Your App

1. In your app dashboard, go to **Settings** > **Basic**
2. Copy your **App ID** and **App Secret**
3. Add **Product**: Select **Facebook Login**
4. Under **Facebook Login** > **Settings**:
   - Add **Valid OAuth Redirect URIs**: `http://localhost:3000/oauth/callback`
   - Save changes

#### 3. Get Access to Marketing API

1. In your app, go to **Add Products**
2. Click **Set Up** on **Marketing API**
3. Request **Standard Access** if needed (for production use)

#### 4. Get Your Ad Account ID

1. Go to [Meta Ads Manager](https://www.facebook.com/adsmanager)
2. Your Ad Account ID is visible in the URL: `act_XXXXXXXXXX`
3. Copy this ID (including the `act_` prefix)

## Installation

### Option 1: Install from npm (Recommended)

```bash
npm install -g meta-ads-cli
```

### Option 2: Install from Source

```bash
git clone https://github.com/hcassar93/meta-ads-cli.git
cd meta-ads-cli
npm install
npm run build
npm link  # Install globally
```

### Verify Installation

```bash
meta-ads-cli --version
meta-ads-cli --help
```

## Quick Start

### 1. Initial Setup

Configure your credentials:

```bash
meta-ads-cli setup
```

You'll be prompted for:
- Profile name (e.g., "default", "client1", etc.)
- Meta App ID
- Meta App Secret
- Ad Account ID (optional, format: act_XXXXXXXXXX)

### 2. Authenticate

Run the OAuth flow to get access tokens:

```bash
meta-ads-cli auth
```

This will:
1. Open your browser for Meta authentication
2. Prompt you to authorize the application
3. Store long-lived access tokens securely (~60 days)

### 3. Start Using Commands

List your ad accounts:

```bash
meta-ads-cli accounts
```

List campaigns:

```bash
meta-ads-cli campaigns -a act_123456789
```

## Usage

### Authentication Commands

#### Setup
```bash
meta-ads-cli setup
```
Configure API credentials for a new profile.

#### Authenticate
```bash
meta-ads-cli auth [-p <profile>]
```
Authenticate and obtain access tokens.

#### Logout
```bash
meta-ads-cli logout [-p <profile>]
```
Clear stored credentials.

#### View Configuration
```bash
meta-ads-cli config [-p <profile>]
```
Display current configuration.

#### Manage Profiles
```bash
# List all profiles
meta-ads-cli profiles --list

# Switch active profile
meta-ads-cli profiles --switch
```

### Account Commands

#### List Ad Accounts
```bash
meta-ads-cli accounts [--json]
```

Shows all ad accounts you have access to.

#### Get Account Details
```bash
meta-ads-cli account <account-id> [--json]
```

Example:
```bash
meta-ads-cli account act_123456789
```

### Campaign Commands

#### List Campaigns
```bash
meta-ads-cli campaigns [-a <account-id>] [-l <limit>] [--json]
```

Options:
- `-a, --account-id <id>` - Ad Account ID (required if not set in profile)
- `-l, --limit <number>` - Maximum campaigns to return (default: 50)
- `--json` - Output as JSON

Example:
```bash
meta-ads-cli campaigns -a act_123456789 -l 10
```

#### View Campaign Details
```bash
meta-ads-cli campaign <campaign-id> [--insights] [--json]
```

Options:
- `--insights` - Include performance insights (last 30 days)

Example:
```bash
meta-ads-cli campaign 120213377777777 --insights
```

#### List Ad Sets
```bash
meta-ads-cli adsets <campaign-id> [-l <limit>] [--json]
```

Example:
```bash
meta-ads-cli adsets 120213377777777
```

## Configuration

### Configuration Location

Credentials are stored in:
```
~/.meta-ads-cli/config.json
```

File permissions are automatically set to `0600` (owner read/write only).

### Multi-Profile Support

Manage multiple Meta Ads accounts:

```bash
# Create additional profiles during setup
meta-ads-cli setup
# Enter a unique profile name when prompted

# List profiles
meta-ads-cli profiles --list

# Switch active profile
meta-ads-cli profiles --switch

# Use specific profile for a command
meta-ads-cli campaigns -p my-other-account -a act_123456789
```

## Output Formats

### Table Format (Default)

```bash
meta-ads-cli campaigns -a act_123456789

┌──────────────────┬────────────────────────────┬────────┬──────────────┬───────────────┬────────────┐
│ ID               │ Name                       │ Status │ Objective    │ Daily Budget  │ Start Time │
├──────────────────┼────────────────────────────┼────────┼──────────────┼───────────────┼────────────┤
│ 120213377777777  │ Summer Sale Campaign       │ ACTIVE │ CONVERSIONS  │ $50.00        │ 1/15/2024  │
└──────────────────┴────────────────────────────┴────────┴──────────────┴───────────────┴────────────┘
```

### JSON Format

```bash
meta-ads-cli campaigns -a act_123456789 --json
```

```json
[
  {
    "id": "120213377777777",
    "name": "Summer Sale Campaign",
    "status": "ACTIVE",
    "objective": "CONVERSIONS",
    "daily_budget": "5000",
    "start_time": "2024-01-15T08:00:00+0000"
  }
]
```

## Troubleshooting

### "Not authenticated" Error

Run the auth command:
```bash
meta-ads-cli auth
```

### "No profile found" Error

Create a profile first:
```bash
meta-ads-cli setup
```

### "Ad Account ID required" Error

Either:
- Provide `--account-id` flag: `meta-ads-cli campaigns -a act_123456789`
- Or set it during setup: `meta-ads-cli setup` and enter your Ad Account ID

### Token Expired Error

Tokens are long-lived (~60 days) but do expire. Re-authenticate:
```bash
meta-ads-cli auth
```

### Port 3000 Already in Use

The OAuth callback uses port 3000. Close conflicting applications or modify `src/auth/oauth.ts` to use a different port.

### "Invalid OAuth access token" Error

Your access token may be invalid or expired. Try:
1. Re-authenticating: `meta-ads-cli auth`
2. Creating a new profile: `meta-ads-cli setup`

## API Limits

- **Marketing API**: Rate-limited per app and user
- **Test Mode**: Limited to accounts you own or manage
- **Standard Access**: Required for production use with broader access

## Development

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev -- <command>

# Examples
npm run dev -- setup
npm run dev -- campaigns -a act_123456789
npm run dev -- campaign 120213377777777 --insights
```

### Project Structure

```
meta-ads-cli/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── cli.ts                # Commander setup
│   ├── auth/                 # Authentication logic
│   │   ├── oauth.ts
│   │   └── setup.ts
│   ├── api/
│   │   └── meta-ads.ts       # Meta Ads API wrapper
│   ├── commands/             # CLI command implementations
│   │   ├── accounts.ts
│   │   └── campaigns.ts
│   └── utils/                # Utilities
│       └── config.ts
├── dist/                     # Compiled JavaScript
├── package.json
└── tsconfig.json
```

## Resources

- [Meta Marketing API Documentation](https://developers.facebook.com/docs/marketing-apis)
- [Meta Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [OAuth Documentation](https://developers.facebook.com/docs/facebook-login/guides/access-tokens)
- [Meta Business SDK for Node.js](https://github.com/facebook/facebook-nodejs-business-sdk)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## Author

Hayden Cassar

---

**Note**: This tool requires proper Meta app setup and API access. It is designed for developers and marketers with technical knowledge of APIs.
