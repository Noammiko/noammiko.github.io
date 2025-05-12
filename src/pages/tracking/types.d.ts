interface Campaign {
  /** Example: feature launch, discount */
  campaign: string;
  /** Example: Google, Bing, Twitter, Facebook */
  source: string;
  /** Example: Social, Organic, Paid, Email */
  medium: string;
  /** Example: free goodies */
  term: string;
  /** Example: bottom link, second button */
  content: string;
}

declare const campaigns: {
  campaigns: {
    [key: string]: Campaign;
  };
};

export { Campaign, campaigns };
