"use client";

/**
 * PortfolioLive
 *
 * Reads portfolio tracks live from Convex so admin Portfolio changes
 * appear on the site immediately without a rebuild.
 * Falls back to the static protfolio.json when Convex has no entries.
 */

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { withConvexProvider } from "@/lib/convex";
import { Table } from "@/components/musicPortfolio/table";
import { AudioComponent } from "@/components/musicPortfolio/audioComponent";
import type { Song } from "@/components/musicPortfolio/types";

interface Props {
  /** Static fallback from protfolio.json */
  fallback: Song[];
}

function PortfolioInner({ fallback }: Props) {
  const rows = useQuery(api.portfolio.listActivePortfolio);

  /* listActivePortfolio already filters + sorts; map to Song shape */
  const songs: Song[] =
    rows && rows.length > 0
      ? rows.map((r) => ({
          title:     r.title,
          client:    r.client,
          file:      r.file,
          work:      r.work,
          languages: r.languages,
          genres:    r.genres,
        }))
      : fallback;

  /* Key on length + first title so Table remounts when data changes */
  const key = songs.map((s) => s.title).join("|");

  return (
    <div className="music-portfolio-wrap grid max-h-[80vh] overflow-y-auto">
      <div className="overflow-x-auto overflow-y-visible">
        <Table key={key} songs={songs} />
      </div>

      <div
        className="row-start-2 col-start-1 h-42 ml-auto mr-2 w-full md:w-md
                   bg-red-950/30 backdrop-blur-sm rounded-lg"
      />
      <div className="sticky bottom-0 z-20 right-0 left-0 row-start-2 pb-4 col-start-1">
        <div className="ml-auto mr-2 w-full h-42 md:w-md">
          <AudioComponent />
        </div>
      </div>
    </div>
  );
}

export default withConvexProvider(PortfolioInner);
