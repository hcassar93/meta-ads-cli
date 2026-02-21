import Conf from 'conf';
import { homedir } from 'os';
import { join } from 'path';
import { chmodSync } from 'fs';

export interface MetaAdsProfile {
  name: string;
  appId: string;
  appSecret: string;
  accessToken?: string;
  adAccountId?: string;
  tokenExpiry?: number;
  isActive?: boolean;
}

export interface MetaAdsConfig {
  profiles: Record<string, MetaAdsProfile>;
  activeProfile?: string;
}

const configPath = join(homedir(), '.meta-ads-cli');

const config = new Conf<MetaAdsConfig>({
  projectName: 'meta-ads-cli',
  cwd: configPath,
  defaults: {
    profiles: {},
  },
});

// Secure the config file
try {
  const configFilePath = join(configPath, 'config.json');
  chmodSync(configFilePath, 0o600);
} catch (error) {
  // File might not exist yet
}

export function getConfig(): MetaAdsConfig {
  return config.store;
}

export function setConfig(newConfig: Partial<MetaAdsConfig>): void {
  config.set(newConfig);
}

export function getProfile(profileName?: string): MetaAdsProfile | null {
  const cfg = getConfig();
  const name = profileName || cfg.activeProfile;
  
  if (!name) {
    return null;
  }
  
  return cfg.profiles[name] || null;
}

export function saveProfile(profile: MetaAdsProfile): void {
  const cfg = getConfig();
  cfg.profiles[profile.name] = profile;
  
  if (!cfg.activeProfile) {
    cfg.activeProfile = profile.name;
  }
  
  setConfig(cfg);
}

export function deleteProfile(profileName: string): void {
  const cfg = getConfig();
  delete cfg.profiles[profileName];
  
  if (cfg.activeProfile === profileName) {
    const remaining = Object.keys(cfg.profiles);
    cfg.activeProfile = remaining.length > 0 ? remaining[0] : undefined;
  }
  
  setConfig(cfg);
}

export function setActiveProfile(profileName: string): void {
  const cfg = getConfig();
  
  if (!cfg.profiles[profileName]) {
    throw new Error(`Profile "${profileName}" not found`);
  }
  
  cfg.activeProfile = profileName;
  setConfig(cfg);
}

export function listProfiles(): MetaAdsProfile[] {
  const cfg = getConfig();
  return Object.values(cfg.profiles);
}

export function getActiveProfile(): MetaAdsProfile | null {
  const cfg = getConfig();
  
  if (!cfg.activeProfile) {
    return null;
  }
  
  return cfg.profiles[cfg.activeProfile] || null;
}

export { config };
