"use client";

import { Table } from "@/components/musicPortfolio/table";
import { AudioComponent } from "@/components/musicPortfolio/audioComponent";
import type { Song } from "@/components/musicPortfolio/types";

interface Props {
  songs: Song[];
}

/** Static portfolio display — data is baked in at build time, no live Convex query. */
export function PortfolioDisplay({ songs }: Props) {
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
