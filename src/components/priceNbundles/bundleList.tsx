import { useEffect, useState } from 'react';
import Bundle from './bundle';
import FreeTrial from './freeTrail';
import TimeRemaining from './timeRemaining';
import { getPricesAndBundles, getCurrentPricesAndBundles } from './sheetdb';
import type { Price } from './types';

interface Props {
  defaultCurrentPrice: Price;
}

const PricingComponent: React.FC<Props> = ({ defaultCurrentPrice }) => {
  const [currentPrice, setCurrentPrice] = useState<Price>(defaultCurrentPrice);

  useEffect(() => {
    const fetchPrices = async () => {
      const data = await getPricesAndBundles();
      if (data != undefined && data.length > 0) {
        setCurrentPrice(getCurrentPricesAndBundles(data));
      }
    };

    fetchPrices();
  }, []);

  return (
    <>
      {currentPrice.sale && (
        <div className="uppercase text-center mb-6 md:mb-12 font-matchbox">
          <h2 className="text-xl md:text-4xl text-yellow-500 font-bold">
            {currentPrice.sale.name}
          </h2>
          <p className="text-lg md:text-2xl text-red-500">
            Sale ends
            <TimeRemaining targetTime={currentPrice.sale.end} />
          </p>
        </div>
      )}

      {/* Bundles Section */}
      <div className="grid md:grid-cols-2 md:gap-10 xl:gap-8 xl:grid-cols-4 gap-8 mb-16">
        <FreeTrial max={5} />

        {currentPrice.deals.map((deal, idx) => (
          <Bundle key={idx} deal={deal} glow={idx === 1} />
        ))}
        {/* TODO: make buttons change the email default text */}
      </div>
    </>
  );
};

export default PricingComponent;
