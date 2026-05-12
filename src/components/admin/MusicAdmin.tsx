"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const inputCls =
  `w-full bg-[#111] border border-[rgba(255,255,255,0.1)] text-[#F5F0E8] px-3 py-2.5
   text-sm font-['Josefin_Sans'] focus:outline-none focus:border-[rgba(201,169,110,0.5)]
   placeholder:text-[rgba(245,240,232,0.2)]`;
const labelCls =
  `block text-[0.6rem] tracking-[0.25em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.7)] mb-1.5`;

/* ─── Dynamic URL list ───────────────────────────────────────────── */
function UrlList({
  label,
  hint,
  values,
  onChange,
}: {
  label: string;
  hint: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const update = (i: number, val: string) => {
    const next = [...values];
    next[i] = val;
    onChange(next);
  };
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));
  const add    = () => onChange([...values, ""]);

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <p className="text-[0.55rem] text-[rgba(245,240,232,0.25)] font-['Josefin_Sans'] mb-2">{hint}</p>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={inputCls}
              placeholder="https://open.spotify.com/…"
              value={v}
              onChange={(e) => update(i, e.target.value)}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="px-3 border border-red-800/40 text-red-400 hover:bg-red-900/20 text-xs font-['Josefin_Sans'] transition-colors flex-shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 px-4 py-1.5 border border-[rgba(255,255,255,0.1)] text-[rgba(245,240,232,0.4)]
                   hover:border-[rgba(255,255,255,0.25)] hover:text-[#F5F0E8]
                   text-[0.6rem] tracking-widest uppercase font-['Josefin_Sans'] transition-all"
      >
        + Add URL
      </button>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────── */
export default function MusicAdmin() {
  const settings = useQuery(api.musicSettings.getSettings);
  const upsert   = useMutation(api.musicSettings.upsertSettings);

  const [form, setForm] = useState({
    featuredTitle:    "",
    featuredTrackUrl: "",
    promotingTracks:  [] as string[],
    discographyUrls:  [] as string[],
  });
  const [dirty,   setDirty]   = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  // Sync fetched settings into local form state (once loaded)
  useEffect(() => {
    if (settings && !dirty) {
      setForm({
        featuredTitle:    settings.featuredTitle,
        featuredTrackUrl: settings.featuredTrackUrl,
        promotingTracks:  settings.promotingTracks,
        discographyUrls:  settings.discographyUrls,
      });
    }
  }, [settings, dirty]);

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
      setDirty(true);
      setSaved(false);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await upsert(form);
    setSaving(false);
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!settings) {
    return <p className="text-[rgba(245,240,232,0.3)] text-sm">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="border border-[rgba(255,193,7,0.12)] bg-[rgba(255,193,7,0.02)] px-4 py-3">
        <p className="text-[0.6rem] tracking-[0.2em] uppercase font-['Cinzel'] text-amber-400/60 mb-0.5">Live Data</p>
        <p className="text-xs text-[rgba(245,240,232,0.4)] font-['Josefin_Sans']">
          Music page settings are live — changes apply immediately without a rebuild. Use full Spotify URLs (track or album).
        </p>
      </div>

      <h2 className="font-['Cormorant_Garamond'] font-light text-2xl text-[#F5F0E8]">
        My Music Page
      </h2>

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Featured single */}
        <div className="border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.01)] p-5 space-y-4">
          <p className="text-[0.6rem] tracking-[0.3em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.7)]">
            Featured Single
          </p>
          <div>
            <label className={labelCls}>Track Title (displayed above the embed)</label>
            <input
              required
              className={inputCls}
              placeholder="e.g. Live Inside My Mind"
              value={form.featuredTitle}
              onChange={set("featuredTitle")}
            />
          </div>
          <div>
            <label className={labelCls}>Spotify Track URL</label>
            <input
              required
              className={inputCls}
              placeholder="https://open.spotify.com/track/…"
              value={form.featuredTrackUrl}
              onChange={set("featuredTrackUrl")}
            />
          </div>
        </div>

        {/* Promoting tracks */}
        <div className="border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.01)] p-5">
          <p className="text-[0.6rem] tracking-[0.3em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.7)] mb-4">
            Promoting Tracks (shown in grid below featured)
          </p>
          <UrlList
            label="Track URLs"
            hint="Spotify track links — shown in a grid. Leave empty to hide this section."
            values={form.promotingTracks}
            onChange={(v) => { setForm((p) => ({ ...p, promotingTracks: v })); setDirty(true); setSaved(false); }}
          />
        </div>

        {/* Discography */}
        <div className="border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.01)] p-5">
          <p className="text-[0.6rem] tracking-[0.3em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.7)] mb-4">
            Discography (album / playlist embeds at the bottom)
          </p>
          <UrlList
            label="Album / Playlist URLs"
            hint="Spotify album or playlist links — displayed in a card grid."
            values={form.discographyUrls}
            onChange={(v) => { setForm((p) => ({ ...p, discographyUrls: v })); setDirty(true); setSaved(false); }}
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving || !dirty}
            className="px-8 py-3 bg-[#8B1A1A] hover:bg-[#B22222] disabled:opacity-40
                       text-[#F5F0E8] text-[0.65rem] tracking-[0.35em] uppercase font-['Josefin_Sans'] transition-colors"
          >
            {saving ? "Saving…" : "Save Settings"}
          </button>
          {saved && (
            <span className="text-emerald-400 text-xs font-['Josefin_Sans'] tracking-widest uppercase">
              ✓ Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
