"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/* ─── Shared styles ──────────────────────────────────────────────── */
const inputCls =
  `w-full bg-[#111] border border-[rgba(255,255,255,0.1)] text-[#F5F0E8] px-3 py-2.5
   text-sm font-['Josefin_Sans'] focus:outline-none focus:border-[rgba(201,169,110,0.5)]
   placeholder:text-[rgba(245,240,232,0.2)]`;
const labelCls =
  `block text-[0.6rem] tracking-[0.25em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.7)] mb-1.5`;
const sectionTitle =
  `text-[0.6rem] tracking-[0.3em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.7)]`;

/* ─── Types ──────────────────────────────────────────────────────── */
type BundleConfig = {
  name: string;
  subtitle: string;
  price: number;
  valuePrice?: number;
  discountPercent?: number;
  includes: string[];
  tag?: string;
};

type PricingConfig = {
  saleActive: boolean;
  saleName?: string;
  saleEndDate?: string;
  bundles: BundleConfig[];
};

const DEFAULT_BUNDLES: BundleConfig[] = [
  {
    name: "1 Song Bundle",
    subtitle: "Everything you need for a single release",
    price: 149.95,
    valuePrice: 200,
    discountPercent: 25,
    includes: [
      "**2** Hours of Studio Time",
      "**1** Professional Mix",
      "**1** Professional Master",
      "__Unlimited__ Revisions",
      "*Satisfaction Guaranteed*",
    ],
    tag: "MOST POPULAR",
  },
  {
    name: "2 Songs Bundle",
    subtitle: "Perfect for an EP or Double Release",
    price: 259.95,
    valuePrice: 400,
    discountPercent: 35,
    includes: [
      "**4** Hours of Studio Time",
      "**2** Professional Mixes",
      "**2** Professional Masters",
      "__Unlimited__ Revisions",
      "*Satisfaction Guaranteed*",
    ],
    tag: "BEST VALUE",
  },
  {
    name: "Mix & Master Bundle",
    subtitle: "Already Recorded? We'll Make It Shine",
    price: 94.95,
    valuePrice: 120,
    discountPercent: 20,
    includes: [
      "**1** Professional Mix",
      "**1** Professional Master",
      "__Unlimited__ Revisions",
      "*Satisfaction Guaranteed*",
    ],
    tag: "",
  },
];

/* ─── Include-list editor ────────────────────────────────────────── */
function IncludesList({
  includes,
  onChange,
}: {
  includes: string[];
  onChange: (v: string[]) => void;
}) {
  const update = (i: number, val: string) => {
    const next = [...includes];
    next[i] = val;
    onChange(next);
  };
  const remove = (i: number) => onChange(includes.filter((_, idx) => idx !== i));
  const add    = () => onChange([...includes, ""]);
  const moveUp = (i: number) => {
    if (i === 0) return;
    const next = [...includes];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    onChange(next);
  };
  const moveDown = (i: number) => {
    if (i === includes.length - 1) return;
    const next = [...includes];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {includes.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col gap-0.5">
            <button type="button" onClick={() => moveUp(i)}
              className="px-1.5 py-0.5 text-[0.55rem] text-[rgba(245,240,232,0.3)] hover:text-[#C9A96E] transition-colors leading-none">
              ▲
            </button>
            <button type="button" onClick={() => moveDown(i)}
              className="px-1.5 py-0.5 text-[0.55rem] text-[rgba(245,240,232,0.3)] hover:text-[#C9A96E] transition-colors leading-none">
              ▼
            </button>
          </div>
          <input
            className={inputCls}
            value={item}
            placeholder='e.g. **2** Hours of Studio Time'
            onChange={(e) => update(i, e.target.value)}
          />
          <button type="button" onClick={() => remove(i)}
            className="px-3 py-2 border border-red-800/40 text-red-400 hover:bg-red-900/20 text-xs transition-colors flex-shrink-0">
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={add}
        className="px-4 py-1.5 border border-[rgba(255,255,255,0.1)] text-[rgba(245,240,232,0.4)]
                   hover:border-[rgba(255,255,255,0.25)] hover:text-[#F5F0E8]
                   text-[0.6rem] tracking-widest uppercase font-['Josefin_Sans'] transition-all mt-1">
        + Add Item
      </button>
    </div>
  );
}

/* ─── Single bundle card editor ──────────────────────────────────── */
function BundleEditor({
  bundle,
  index,
  onChange,
}: {
  bundle: BundleConfig;
  index: number;
  onChange: (updated: BundleConfig) => void;
}) {
  const set = (key: keyof BundleConfig, val: any) =>
    onChange({ ...bundle, [key]: val });

  return (
    <div className="border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.01)] p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <span className="text-[0.55rem] tracking-[0.3em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.4)]">
          Bundle {index + 1}
        </span>
        {bundle.tag && (
          <span className="px-2 py-0.5 text-[0.55rem] tracking-widest uppercase border border-[rgba(201,169,110,0.3)] text-[#C9A96E] font-['Josefin_Sans']">
            {bundle.tag}
          </span>
        )}
      </div>

      {/* Name + Badge */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Bundle Name</label>
          <input className={inputCls} value={bundle.name} placeholder="e.g. 1 Song Bundle"
            onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Badge / Tag (optional)</label>
          <input className={inputCls} value={bundle.tag ?? ""} placeholder='e.g. MOST POPULAR'
            onChange={(e) => set("tag", e.target.value || undefined)} />
          <p className="text-[0.5rem] text-[rgba(245,240,232,0.2)] font-['Josefin_Sans'] mt-1">
            Leave blank for no badge
          </p>
        </div>
      </div>

      {/* Subtitle */}
      <div>
        <label className={labelCls}>Subtitle</label>
        <input className={inputCls} value={bundle.subtitle} placeholder="e.g. Everything you need for a single release"
          onChange={(e) => set("subtitle", e.target.value)} />
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Sale Price ($)</label>
          <input type="number" min="0" step="0.01" className={inputCls}
            value={bundle.price === 0 ? "" : bundle.price}
            onChange={(e) => set("price", parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label className={labelCls}>Original Value ($)</label>
          <input type="number" min="0" step="0.01" className={inputCls}
            placeholder="Optional"
            value={bundle.valuePrice ?? ""}
            onChange={(e) => set("valuePrice", e.target.value ? parseFloat(e.target.value) : undefined)} />
        </div>
        <div>
          <label className={labelCls}>Discount %</label>
          <input type="number" min="0" max="99" className={inputCls}
            placeholder="Optional"
            value={bundle.discountPercent ?? ""}
            onChange={(e) => set("discountPercent", e.target.value ? parseInt(e.target.value) : undefined)} />
        </div>
      </div>

      {/* Includes */}
      <div>
        <label className={labelCls}>What's Included</label>
        <p className="text-[0.5rem] text-[rgba(245,240,232,0.25)] font-['Josefin_Sans'] mb-2">
          Use <code className="text-[#C9A96E]">**text**</code> for bold,{" "}
          <code className="text-red-400">__text__</code> for underline,{" "}
          <code className="text-zinc-400">*text*</code> for italic
        </p>
        <IncludesList
          includes={bundle.includes}
          onChange={(v) => set("includes", v)}
        />
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────── */
export default function DiscountsAdmin() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convexConfig = useQuery((api as any).pricingConfig.getPricingConfig);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upsert       = useMutation((api as any).pricingConfig.upsertPricingConfig);

  const [form, setForm] = useState<PricingConfig>({
    saleActive:  false,
    saleName:    "Spring Sale",
    saleEndDate: "",
    bundles:     DEFAULT_BUNDLES,
  });
  const [dirty,  setDirty]  = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  /* Seed local state from Convex once loaded */
  useEffect(() => {
    if (convexConfig && !dirty) {
      setForm({
        saleActive:  convexConfig.saleActive,
        saleName:    convexConfig.saleName  ?? "Spring Sale",
        saleEndDate: convexConfig.saleEndDate ?? "",
        bundles:     convexConfig.bundles.length > 0
          ? convexConfig.bundles
          : DEFAULT_BUNDLES,
      });
    }
    // If Convex has no record yet, keep the defaults so the form is pre-filled
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convexConfig]);

  const markDirty = () => { setDirty(true); setSaved(false); };

  const updateBundle = (i: number, updated: BundleConfig) => {
    const next = [...form.bundles];
    next[i] = updated;
    setForm((p) => ({ ...p, bundles: next }));
    markDirty();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const clean = {
      saleActive:  form.saleActive,
      saleName:    form.saleName  || undefined,
      saleEndDate: form.saleEndDate || undefined,
      bundles:     form.bundles.map((b) => ({
        ...b,
        valuePrice:      b.valuePrice      ?? undefined,
        discountPercent: b.discountPercent ?? undefined,
        tag:             b.tag             || undefined,
      })),
    };
    await upsert(clean);
    setSaving(false);
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (convexConfig === undefined) {
    return <p className="text-[rgba(245,240,232,0.3)] text-sm">Loading…</p>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-['Cormorant_Garamond'] font-light text-2xl text-[#F5F0E8]">
            Discounts &amp; Bundles
          </h2>
          <p className="text-xs text-[rgba(245,240,232,0.35)] font-['Josefin_Sans'] mt-1">
            Edit the bundle cards and sale banner shown on the pricing page.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {saved && (
            <span className="text-emerald-400 text-xs font-['Josefin_Sans'] tracking-widest uppercase">
              ✓ Saved
            </span>
          )}
          <button type="submit" disabled={saving || !dirty}
            className="px-6 py-2.5 bg-[#8B1A1A] hover:bg-[#B22222] disabled:opacity-40
                       text-[#F5F0E8] text-[0.65rem] tracking-[0.3em] uppercase font-['Josefin_Sans'] transition-colors">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* ── Live info banner ─────────────────────────────── */}
      <div className="border border-[rgba(255,193,7,0.12)] bg-[rgba(255,193,7,0.02)] px-4 py-3">
        <p className="text-[0.6rem] tracking-[0.2em] uppercase font-['Cinzel'] text-amber-400/60 mb-0.5">Live Data</p>
        <p className="text-xs text-[rgba(245,240,232,0.4)] font-['Josefin_Sans']">
          Changes save to Convex and appear on the site immediately — no deploy needed.
        </p>
      </div>

      {/* ── Sale Banner Settings ─────────────────────────── */}
      <div className="border border-[rgba(201,169,110,0.2)] bg-[#0d0d0d] p-5 space-y-5">
        <p className={sectionTitle}>Sale Banner</p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { setForm((p) => ({ ...p, saleActive: !p.saleActive })); markDirty(); }}
            className={`px-5 py-2.5 text-[0.65rem] tracking-[0.25em] uppercase font-['Josefin_Sans'] border transition-colors ${
              form.saleActive
                ? "bg-emerald-900/30 border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/50"
                : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.1)] text-[rgba(245,240,232,0.35)] hover:border-[rgba(255,255,255,0.25)]"
            }`}
          >
            {form.saleActive ? "● Sale Active" : "○ Sale Hidden"}
          </button>
          <p className="text-xs text-[rgba(245,240,232,0.35)] font-['Josefin_Sans']">
            {form.saleActive
              ? "The sale name and countdown timer are visible on the pricing page."
              : "No sale banner will be shown."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Sale Name</label>
            <input
              className={inputCls}
              placeholder="e.g. Spring Sale"
              value={form.saleName ?? ""}
              onChange={(e) => { setForm((p) => ({ ...p, saleName: e.target.value })); markDirty(); }}
            />
            <p className="text-[0.5rem] text-[rgba(245,240,232,0.2)] font-['Josefin_Sans'] mt-1">
              Displayed as the sale headline above the bundles
            </p>
          </div>
          <div>
            <label className={labelCls}>Countdown End Date &amp; Time</label>
            <input
              type="datetime-local"
              className={inputCls}
              value={form.saleEndDate ?? ""}
              onChange={(e) => { setForm((p) => ({ ...p, saleEndDate: e.target.value })); markDirty(); }}
            />
            <p className="text-[0.5rem] text-[rgba(245,240,232,0.2)] font-['Josefin_Sans'] mt-1">
              The timer on the pricing page counts down to this moment
            </p>
          </div>
        </div>
      </div>

      {/* ── Bundle Editors ───────────────────────────────── */}
      <div className="space-y-3">
        <p className={sectionTitle}>Bundle Cards</p>
        <p className="text-xs text-[rgba(245,240,232,0.35)] font-['Josefin_Sans']">
          Edit each bundle card exactly as it appears on the pricing page.
        </p>

        <div className="space-y-4 mt-3">
          {form.bundles.map((bundle, i) => (
            <BundleEditor
              key={i}
              bundle={bundle}
              index={i}
              onChange={(updated) => updateBundle(i, updated)}
            />
          ))}
        </div>
      </div>

      {/* ── Save (bottom) ───────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || !dirty}
          className="px-8 py-3 bg-[#8B1A1A] hover:bg-[#B22222] disabled:opacity-40
                     text-[#F5F0E8] text-[0.65rem] tracking-[0.35em] uppercase font-['Josefin_Sans'] transition-colors"
        >
          {saving ? "Saving…" : "Save All Changes"}
        </button>
        {saved && (
          <span className="text-emerald-400 text-xs font-['Josefin_Sans'] tracking-widest uppercase">
            ✓ Changes saved
          </span>
        )}
      </div>
    </form>
  );
}
