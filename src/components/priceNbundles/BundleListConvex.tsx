/**
 * BundleListConvex
 *
 * Wraps PricingComponent in a ConvexProvider so it can fetch live
 * bundle / sale configuration that the admin edits in the Discounts section.
 * Falls back to Google Sheets data when no Convex config exists yet.
 *
 * NOTE: After adding src/convex/pricingConfig.ts, run `bunx convex dev`
 * (or `bunx convex deploy`) to regenerate the _generated API types.
 * Until then the @ts-ignore comment below suppresses the TS error.
 */
import { useQuery } from 'convex/react';
import { withConvexProvider } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import PricingComponent, { convexConfigToPrice } from './bundleList';
import type { PricingComponentProps } from './bundleList';
import type { Price } from './types';

/* Inner component — always rendered inside a ConvexProvider. */
function BundleListConnected({ defaultCurrentPrice }: PricingComponentProps) {
  // @ts-ignore — pricingConfig is added after `bunx convex dev` regenerates the API
  const raw = useQuery(api.pricingConfig.getPricingConfig);

  let convexPrice: Price | null = null;
  if (raw && Array.isArray(raw.bundles) && raw.bundles.length > 0) {
    try {
      convexPrice = convexConfigToPrice({ ...raw, bundles: raw.bundles! });
    } catch {
      // Malformed config — fall back to Google Sheets
    }
  }

  return (
    <PricingComponent
      defaultCurrentPrice={defaultCurrentPrice}
      convexPrice={convexPrice}
    />
  );
}

/** Public export: a ConvexProvider-wrapped pricing list. */
const BundleListConvex = withConvexProvider(BundleListConnected, "regular");
export default BundleListConvex;
