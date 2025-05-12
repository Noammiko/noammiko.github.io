import type { Campaign } from "./types";

export function getCampaignParams(campaign: Campaign) {
  return {
    utm_source: campaign.source,
    utm_medium: campaign.medium,
    utm_campaign: campaign.campaign,
    utm_content: campaign.content,
    utm_term: campaign.term,
  };
}
