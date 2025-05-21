import { useEffect, useState } from 'react';
import { Temporal } from '@js-temporal/polyfill';

interface TimeRemainingProps {
  targetTime: Temporal.Instant;
  smallestUnit?: Temporal.SmallestUnit<Temporal.DateTimeUnit>;
  highestUnit?: Temporal.LargestUnit<Temporal.DateTimeUnit>;
}

const TimeRemaining: React.FC<TimeRemainingProps> = ({
  targetTime,
  smallestUnit = "seconds",
  highestUnit = "days",
}) => {
  const [remaining, setRemaining] = useState<Temporal.Duration | null>(null);

  const order: Temporal.LargestUnit<Temporal.DateTimeUnit>[] = [
    "seconds",
    "minutes",
    "hours",
    "days",
    "weeks",
    "months",
    "years",
  ] as const;

  useEffect(() => {
    function update() {
      const now = Temporal.Now.instant();
      const duration = now
        .until(targetTime)
        .round({ largestUnit: highestUnit, smallestUnit: smallestUnit });
      setRemaining(duration);
    }

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [targetTime, highestUnit, smallestUnit]);

  if (remaining == null) {
    return (
      <span>
        {targetTime.toLocaleString("en", {
          dateStyle: "long",
        })}
      </span>
    );
  }

  return (
    <div className="flex flex-row-reverse gap-4 justify-center units">
      {order
        .slice(
          order.indexOf(smallestUnit),
          order.indexOf(highestUnit) + 1
        )
        .map((unit, index, array) => (
          <div key={unit} className="flex flex-col unit-container relative">
            <p className="text-xl md:text-3xl">
              {remaining[unit].toString().padStart(2, "0")}
            </p>
            <span className="text-sm tracking-tight">{unit}</span>
          </div>
        ))}
      <style jsx>{`
        .unit-container:not(:first-child)::before {
          content: ':';
          font-size: 1.5rem;
          position: absolute;
          right: -1rem;
          top: 50%;
          transform: translateY(-80%);
          line-height: 1;
        }
        
        @media (min-width: 48rem) {
          .unit-container:not(:first-child)::before {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TimeRemaining;
