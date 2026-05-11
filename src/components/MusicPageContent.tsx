"use client";

/**
 * MusicPageContent — the live portion of the My Music page.
 * Reads from Convex so track / album URLs can be updated from the admin
 * without a site rebuild.
 */

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { withConvexProvider } from "@/lib/convex";

/* ─── Spotify embed (mirrors musicProvider/music.astro logic) ──── */
function SpotifyEmbed({ url }: { url: string }) {
  // Convert share URLs to embed URLs
  // e.g. https://open.spotify.com/track/xxx → https://open.spotify.com/embed/track/xxx
  const embedUrl = url
    .replace("open.spotify.com/track/", "open.spotify.com/embed/track/")
    .replace("open.spotify.com/album/", "open.spotify.com/embed/album/")
    .replace("open.spotify.com/playlist/", "open.spotify.com/embed/playlist/");

  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="152"
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      style={{ borderRadius: "12px" }}
    />
  );
}

function MusicInner() {
  const settings = useQuery(api.musicSettings.getSettings);

  if (!settings) return null;

  return (
    <>
      {/* Featured single */}
      <h2 className="text-center text-xl md:text-5xl text-shadow-lg text-shadow-red-600 uppercase">
        {settings.featuredTitle}
      </h2>
      <p className="text-center text-xl md:text-2xl mt-4 text-gray-200 text-shadow-md text-shadow-red-600 mb-6 uppercase">
        Out now
      </p>
      <SpotifyEmbed url={settings.featuredTrackUrl} />

      {/* Promoting tracks */}
      {settings.promotingTracks.length > 0 && (
        <div className="mt-10">
          <div className="grid xl:grid-cols-2 gap-4">
            {settings.promotingTracks.map((track, index) => (
              <div key={track}>
                <h2 className="text-xl font-bold mt-4 mb-2">Track {index + 1}</h2>
                <SpotifyEmbed url={track} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discography */}
      {settings.discographyUrls.length > 0 && (
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Discography</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {settings.discographyUrls.map((albumUrl) => (
              <SpotifyEmbed key={albumUrl} url={albumUrl} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default withConvexProvider(MusicInner);
