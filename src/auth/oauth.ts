import express from 'express';
import { Server } from 'http';
import open from 'open';
import chalk from 'chalk';
import { MetaAdsProfile } from '../utils/config.js';

const REDIRECT_URI = 'http://localhost:3000/oauth/callback';
const PORT = 3000;

export async function startOAuthFlow(profile: MetaAdsProfile): Promise<string> {
  return new Promise((resolve, reject) => {
    const app = express();
    let server: Server;

    // OAuth callback endpoint
    app.get('/oauth/callback', (req, res) => {
      const code = req.query.code as string;
      const error = req.query.error as string;

      if (error) {
        res.send(`
          <html>
            <body style="font-family: system-ui; padding: 40px; text-align: center;">
              <h1 style="color: #e53e3e;">Authentication Failed</h1>
              <p>${error}</p>
              <p>You can close this window.</p>
            </body>
          </html>
        `);
        server.close();
        reject(new Error(error));
        return;
      }

      if (!code) {
        res.send(`
          <html>
            <body style="font-family: system-ui; padding: 40px; text-align: center;">
              <h1 style="color: #e53e3e;">No Authorization Code</h1>
              <p>You can close this window.</p>
            </body>
          </html>
        `);
        server.close();
        reject(new Error('No authorization code received'));
        return;
      }

      res.send(`
        <html>
          <body style="font-family: system-ui; padding: 40px; text-align: center;">
            <h1 style="color: #48bb78;">✓ Authentication Successful!</h1>
            <p>You can close this window and return to the terminal.</p>
          </body>
        </html>
      `);

      server.close();
      resolve(code);
    });

    // Start server
    server = app.listen(PORT, () => {
      const authUrl = buildAuthUrl(profile.appId);
      
      console.log(chalk.cyan('\n🔐 Opening browser for Meta authentication...\n'));
      console.log(chalk.gray(`If browser doesn't open automatically, visit:\n${authUrl}\n`));

      // Open browser
      open(authUrl).catch(() => {
        console.log(chalk.yellow('Could not open browser automatically. Please visit the URL above.'));
      });
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        reject(new Error(`Port ${PORT} is already in use. Please close the application using it and try again.`));
      } else {
        reject(error);
      }
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error('OAuth flow timed out after 5 minutes'));
    }, 5 * 60 * 1000);
  });
}

function buildAuthUrl(appId: string): string {
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: REDIRECT_URI,
    scope: 'ads_management,ads_read,business_management',
    response_type: 'code',
  });

  return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
}

export async function exchangeCodeForToken(
  appId: string,
  appSecret: string,
  code: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: REDIRECT_URI,
    code: code,
  });

  const response = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?${params.toString()}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for token: ${error}`);
  }

  const data: any = await response.json();
  
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in || 5183944, // ~60 days default
  };
}

export async function getLongLivedToken(
  appId: string,
  appSecret: string,
  shortLivedToken: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortLivedToken,
  });

  const response = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?${params.toString()}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get long-lived token: ${error}`);
  }

  const data: any = await response.json();
  
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in || 5183944, // ~60 days
  };
}
