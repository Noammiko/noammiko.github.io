import { useEffect, useState } from 'react';
import { Temporal } from '@js-temporal/polyfill';

interface TimeRemainingProps {
  targetTime: Temporal.Instant;
  smallestUnit?: Temporal.SmallestUnit<Temporal.DateTimeUnit>;
  highestUnit?: Temporal.LargestUnit<Temporal.DateTimeUnit>;
}

interface TimeUnitProps {
  value: number;
  unit: Temporal.LargestUnit<Temporal.DateTimeUnit>;
  showColon?: boolean;
}

const TimeUnit: React.FC<TimeUnitProps> = ({ value, unit, showColon = true }) => {
  return (
    <div className="relative flex flex-col items-center">
      {showColon && (
        <span className="absolute -left-5 top-0 text-2xl leading-7 select-text md:text-4xl">
          :
        </span>
      )}
      <div className="text-xl leading-7 select-text md:text-3xl">
        {value.toString().padStart(2, "0")}
      </div>
      <div className="unit text-sm tracking-tight" data-unit={unit}></div>
    </div>
  );
};

const TimeRemaining: React.FC<TimeRemainingProps> = ({
  targetTime,
  smallestUnit = "seconds",
  highestUnit = "days",
}) => {
  const [remaining, setRemaining] = useState<Temporal.Duration | null>(null);

  const order: Temporal.LargestUnit<Temporal.DateTimeUnit>[] = [
    "years",
    "months",
    "weeks",
    "days",
    "hours",
    "minutes",
    "seconds",
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

  const relevantUnits = order.slice(order.indexOf(highestUnit), order.indexOf(smallestUnit) + 1);

  return (
    <div className="flex justify-center items-center gap-8">
      {relevantUnits.map((unit, index) => (
        <TimeUnit
          key={unit}
          value={remaining[unit]}
          unit={unit}
          showColon={index !== 0}
        />
      ))}
      <style>{`
        .unit::after {
          content: attr(data-unit);
        }
      `}</style>
    </div>
  );
};

export default TimeRemaining;
