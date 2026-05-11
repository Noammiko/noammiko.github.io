import { Button } from "@/components/ui/button";
import FreeTrailDialog from "./forms/freebooking";
import { withConvexProvider } from "@/lib/convex";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/* ─── Inner card ─────────────────────────────────────────────────── */
interface FreeTrialProps {
  current: number;
  max: number;
}

const FreeTrial: React.FC<FreeTrialProps> = ({ current, max }) => {
  const progress = useMemo(
    () => Math.max(0, Math.min(1, current / max)),
    [current, max]
  );
  const remaining = Math.max(0, max - current);
  const full = progress >= 1;

  return (
    <div className="border-2 border-yellow-500/50 group hover:border-yellow-500/90 transition rounded-lg p-6 relative bg-gradient-to-b from-black to-gray-900">
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 group-hover:bg-yellow-500/90 text-black px-4 py-1 text-sm rounded font-bold">
        LIMITED OFFER
      </div>

      <h3 className="text-2xl font-bold text-center mb-4">
        First-Time Tryout Session
      </h3>
      <p className="text-3xl font-bold text-center text-green-400 mb-2">FREE</p>
      <p className="text-sm text-center mb-4">(for new clients only)</p>

      <div className="bg-yellow-500/10 rounded-lg p-3 mb-6">
        <p className="text-center font-semibold text-yellow-500 mb-2">
          {remaining}/{max} spots left this week
        </p>
        <div className="w-full bg-gray-800 rounded-full h-2.5 mb-1">
          <div
            className="bg-yellow-500 h-2.5 rounded-full"
            style={{ width: `${(progress * 100).toFixed(2)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>0</span>
          <span>{max}</span>
        </div>
      </div>

      <div className="italic text-gray-300 text-sm mb-6 border-l-2 border-yellow-500 pl-3">
        <p>Come check out the studio and experience what I do best.</p>
        <p className="mt-2">
          I'm confident you'll be back, because I'm the engineer your music needs!
        </p>
      </div>

      <h4 className="text-xl font-bold text-center mb-4 underline">INCLUDES</h4>

      <ul className="space-y-2 mb-8">
        {["30 min of studio time", "30-second clip of your song", "Basic Studio Mix"].map((item) => (
          <li key={item} className="flex items-start">
            <span className="text-yellow-500 mr-2">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <FreeTrailDialog>
        <Button
          className="w-full bg-yellow-500 text-black font-bold py-3 hover:bg-yellow-600 transition-colors"
          disabled={full}
        >
          {full ? "No Spots Left This Week" : "Secure Your Spot"}
        </Button>
      </FreeTrailDialog>
    </div>
  );
};

/* ─── Convex-connected export ────────────────────────────────────── */
export default withConvexProvider(function FreeTrialConnected() {
  const settings   = useQuery(api.freeAccess.getSettings);
  const amountWeek = useQuery(api.freeAccess.getAmountWeek, {});

  // Hide entirely when the offer is disabled
  if (settings === undefined || amountWeek === undefined) return null;
  if (!settings.enabled) return null;

  return <FreeTrial current={amountWeek} max={settings.weeklySlots} />;
});
