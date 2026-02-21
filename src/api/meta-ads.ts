import axios, { AxiosInstance } from 'axios';
import { MetaAdsProfile } from '../utils/config.js';

const API_VERSION = 'v21.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

export class MetaAdsAPI {
  private client: AxiosInstance;
  private profile: MetaAdsProfile;

  constructor(profile: MetaAdsProfile) {
    this.profile = profile;
    
    if (!profile.accessToken) {
      throw new Error('Not authenticated. Run \'meta-ads-cli auth\' first.');
    }

    this.client = axios.create({
      baseURL: BASE_URL,
      params: {
        access_token: profile.accessToken,
      },
    });
  }

  // Ad Accounts
  async getAdAccounts(limit: number = 50) {
    const response = await this.client.get('/me/adaccounts', {
      params: {
        fields: 'id,name,account_status,currency,timezone_name,balance',
        limit,
      },
    });
    return response.data.data;
  }

  async getAdAccount(accountId: string) {
    const response = await this.client.get(`/${accountId}`, {
      params: {
        fields: 'id,name,account_status,currency,timezone_name,balance,amount_spent,spend_cap',
      },
    });
    return response.data;
  }

  // Campaigns
  async getCampaigns(accountId: string, limit: number = 50) {
    const response = await this.client.get(`/${accountId}/campaigns`, {
      params: {
        fields: 'id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time,created_time,updated_time',
        limit,
      },
    });
    return response.data.data;
  }

  async getCampaign(campaignId: string) {
    const response = await this.client.get(`/${campaignId}`, {
      params: {
        fields: 'id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time,created_time,updated_time,bid_strategy,budget_remaining',
      },
    });
    return response.data;
  }

  async getCampaignInsights(campaignId: string, datePreset: string = 'last_30d') {
    const response = await this.client.get(`/${campaignId}/insights`, {
      params: {
        fields: 'impressions,clicks,spend,ctr,cpc,cpm,reach,frequency,actions,conversions',
        date_preset: datePreset,
      },
    });
    return response.data.data[0] || {};
  }

  // Ad Sets
  async getAdSets(campaignId: string, limit: number = 50) {
    const response = await this.client.get(`/${campaignId}/adsets`, {
      params: {
        fields: 'id,name,status,daily_budget,lifetime_budget,billing_event,optimization_goal,targeting,start_time,end_time',
        limit,
      },
    });
    return response.data.data;
  }

  async getAdSet(adSetId: string) {
    const response = await this.client.get(`/${adSetId}`, {
      params: {
        fields: 'id,name,status,daily_budget,lifetime_budget,billing_event,optimization_goal,bid_amount,targeting,start_time,end_time,created_time,updated_time',
      },
    });
    return response.data;
  }

  // Ads
  async getAds(adSetId: string, limit: number = 50) {
    const response = await this.client.get(`/${adSetId}/ads`, {
      params: {
        fields: 'id,name,status,creative,created_time,updated_time',
        limit,
      },
    });
    return response.data.data;
  }

  async getAd(adId: string) {
    const response = await this.client.get(`/${adId}`, {
      params: {
        fields: 'id,name,status,creative,effective_status,tracking_specs,created_time,updated_time',
      },
    });
    return response.data;
  }

  // Insights
  async getAccountInsights(accountId: string, datePreset: string = 'last_30d') {
    const response = await this.client.get(`/${accountId}/insights`, {
      params: {
        fields: 'impressions,clicks,spend,ctr,cpc,cpm,reach,frequency,actions,conversions,cost_per_action_type',
        date_preset: datePreset,
      },
    });
    return response.data.data[0] || {};
  }

  // Me
  async getMe() {
    const response = await this.client.get('/me', {
      params: {
        fields: 'id,name,email',
      },
    });
    return response.data;
  }

  // Debugging
  async debugToken() {
    const response = await this.client.get('/debug_token', {
      params: {
        input_token: this.profile.accessToken,
      },
    });
    return response.data.data;
  }
}

export function createAPIClient(profile: MetaAdsProfile): MetaAdsAPI {
  return new MetaAdsAPI(profile);
}
