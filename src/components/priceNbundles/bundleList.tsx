import { useEffect, useState } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import Bundle from './bundle';
import TimeRemaining from './timeRemaining';
import { getPricesAndBundles, getCurrentPricesAndBundles } from './sheetdb';
import type { Price, Deal } from './types';

interface Props {
  defaultCurrentPrice: Price;
  /** When provided (from a Convex-aware wrapper), overrides Google Sheets data */
  convexPrice?: Price | null;
}

const PricingComponent: React.FC<Props> = ({ defaultCurrentPrice, convexPrice }) => {
  const [googlePrice, setGooglePrice] = useState<Price>(defaultCurrentPrice);

  // Refresh from Google Sheets in the background (fallback only)
  useEffect(() => {
    if (convexPrice) return; // Skip if Convex data is available
    const fetchPrices = async () => {
      try {
        const data = await getPricesAndBundles();
        if (data != undefined && data.length > 0) {
          setGooglePrice(getCurrentPricesAndBundles(data));
        }
      } catch {
        // keep default
      }
    };
    fetchPrices();
  }, [convexPrice]);

  // Use Convex data when available, otherwise fall back to Google Sheets
  const currentPrice: Price = convexPrice ?? googlePrice;

  return (
    <>
      {currentPrice.sale && (
        <div className="uppercase text-center mb-6 md:mb-12 font-matchbox">
          <h2 className="text-xl md:text-4xl text-yellow-500 font-bold">
            {currentPrice.sale.name}
          </h2>
          <div className="text-lg md:text-2xl text-red-500">
            Sale ends
            <TimeRemaining targetTime={currentPrice.sale.end} />
          </div>
        </div>
      )}

      {/* Bundles Section */}
      <div className="grid md:grid-cols-2 md:gap-10 xl:gap-8 xl:grid-cols-3 gap-8 mb-16">
        {currentPrice.deals.map((deal, idx) => (
          <Bundle key={idx} deal={deal} glow={idx === 1} />
        ))}
      </div>
    </>
  );
};

export default PricingComponent;
export type { Props as PricingComponentProps };

/** Convert a Convex pricingConfig record to the Price shape the site uses. */
export function convexConfigToPrice(cfg: {
  saleActive:  boolean;
  saleName?:   string;
  saleEndDate?: string;
  bundles: {
    name:            string;
    subtitle:        string;
    price:           number;
    valuePrice?:     number;
    discountPercent?: number;
    includes:        string[];
    tag?:            string;
  }[];
}): Price {
  const deals: Deal[] = cfg.bundles.map((b) => ({
    name:        b.name,
    subtitle:    b.subtitle,
    price:       b.price,
    valuePrice:  b.valuePrice,
    discountTag: b.discountPercent != null ? String(b.discountPercent) : undefined,
    includes:    b.includes,
    tag:         b.tag || undefined,
  }));

  const sale =
    cfg.saleActive && cfg.saleName && cfg.saleEndDate
      ? {
          name:  cfg.saleName,
          start: Temporal.Instant.from("2020-01-01T00:00:00Z"),
          end:   Temporal.Instant.from(new Date(cfg.saleEndDate).toISOString()),
        }
      : undefined;

  return { saleId: "convex", groupId: "convex", deals, sale };
}
