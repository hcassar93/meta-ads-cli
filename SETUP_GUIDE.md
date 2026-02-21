# Meta Ads CLI - Quick Setup Guide

## What You Need

1. **Meta App** (from Facebook Developers)
2. **App ID and App Secret**
3. **Access to at least one Meta Ads account**

## Step-by-Step Setup

### 1. Create a Meta App

1. Go to https://developers.facebook.com/
2. Click **My Apps** → **Create App**
3. Choose **Business** type
4. Fill in app details and create

### 2. Configure Your App

1. In app dashboard, go to **Settings** → **Basic**
2. Copy your **App ID** and **App Secret**
3. Add **Product**: **Facebook Login**
4. Under **Facebook Login** → **Settings**:
   - Add Valid OAuth Redirect URI: `http://localhost:3000/oauth/callback`
   - Save changes

### 3. Enable Marketing API

1. In your app, go to **Add Products**
2. Click **Set Up** on **Marketing API**

### 4. Get Your Ad Account ID

1. Go to https://www.facebook.com/adsmanager
2. Your Ad Account ID is in the URL: `act_XXXXXXXXXX`
3. Copy this ID (including `act_` prefix)

## Installation & Usage

```bash
# Install globally
npm install -g meta-ads-cli

# Setup profile
meta-ads-cli setup

# Authenticate
meta-ads-cli auth

# List your ad accounts
meta-ads-cli accounts

# List campaigns
meta-ads-cli campaigns -a act_123456789

# Get campaign details with insights
meta-ads-cli campaign 120213377777777 --insights
```

## Multi-Profile Setup

```bash
# Create additional profiles
meta-ads-cli setup
# Enter unique profile name (e.g., "client1", "agency-account")

# List all profiles
meta-ads-cli profiles --list

# Switch between profiles
meta-ads-cli profiles --switch

# Or use specific profile for one command
meta-ads-cli campaigns -p client1 -a act_123456789
```

## Key Features

- ✅ OAuth 2.0 with long-lived tokens (~60 days)
- ✅ Multi-profile support
- ✅ Campaigns, ad sets, and ads management
- ✅ Performance insights and metrics
- ✅ Table and JSON output
- ✅ Secure credential storage

## Common Commands

```bash
# View configuration
meta-ads-cli config

# List ad accounts
meta-ads-cli accounts

# List campaigns for an account
meta-ads-cli campaigns -a act_123456789

# Get campaign with insights
meta-ads-cli campaign 120213377777777 --insights

# List ad sets in a campaign
meta-ads-cli adsets 120213377777777

# Output as JSON
meta-ads-cli campaigns -a act_123456789 --json

# Logout from profile
meta-ads-cli logout
```

## Troubleshooting

**"Not authenticated" error:**
```bash
meta-ads-cli auth
```

**"Ad Account ID required" error:**
- Use `-a act_123456789` flag
- Or set it in profile during setup

**Token expired:**
```bash
meta-ads-cli auth
```

**Port 3000 in use:**
- Close other apps using port 3000
- Or edit `src/auth/oauth.ts` to use different port

## Repository

https://github.com/hcassar93/meta-ads-cli

## Architecture

Built with TypeScript and modeled after google-ads-cli:
- `src/auth/` - OAuth 2.0 flow and setup
- `src/api/` - Meta Ads API wrapper
- `src/commands/` - CLI command implementations
- `src/utils/` - Configuration and helpers

Token storage: `~/.meta-ads-cli/config.json` (permissions: 0600)
