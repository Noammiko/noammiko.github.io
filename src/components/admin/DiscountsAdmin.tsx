"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import pricingJson from "@/data/pricing.json";

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
type BaseBundle = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  tag?: string | null;
  includes: string[];
  order: number;
};

type BundleInSale = {
  enabled: boolean;
  salePrice: number;
  discountPercent: number | undefined;
};

/* ─── Include-list editor ────────────────────────────────────────── */
function IncludesList({
  includes,
  onChange,
}: {
  includes: string[];
  onChange: (v: string[]) => void;
}) {
  const update   = (i: number, val: string) => { const n = [...includes]; n[i] = val; onChange(n); };
  const remove   = (i: number) => onChange(includes.filter((_, idx) => idx !== i));
  const add      = () => onChange([...includes, ""]);
  const moveUp   = (i: number) => { if (i === 0) return; const n = [...includes]; [n[i-1], n[i]] = [n[i], n[i-1]]; onChange(n); };
  const moveDown = (i: number) => { if (i === includes.length - 1) return; const n = [...includes]; [n[i], n[i+1]] = [n[i+1], n[i]]; onChange(n); };

  return (
    <div className="space-y-2">
      {includes.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col gap-0.5">
            <button type="button" onClick={() => moveUp(i)}
              className="px-1.5 py-0.5 text-[0.55rem] text-[rgba(245,240,232,0.3)] hover:text-[#C9A96E] transition-colors leading-none">▲</button>
            <button type="button" onClick={() => moveDown(i)}
              className="px-1.5 py-0.5 text-[0.55rem] text-[rgba(245,240,232,0.3)] hover:text-[#C9A96E] transition-colors leading-none">▼</button>
          </div>
          <input className={inputCls} value={item} placeholder='e.g. **2** Hours of Studio Time'
            onChange={(e) => update(i, e.target.value)} />
          <button type="button" onClick={() => remove(i)}
            className="px-3 py-2 border border-red-800/40 text-red-400 hover:bg-red-900/20 text-xs transition-colors flex-shrink-0">✕</button>
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

/* ─── Base bundle card editor ────────────────────────────────────── */
function BaseBundleEditor({
  bundle,
  index,
  onChange,
  onDelete,
}: {
  bundle: BaseBundle;
  index: number;
  onChange: (updated: BaseBundle) => void;
  onDelete: () => void;
}) {
  const set = (key: keyof BaseBundle, val: unknown) =>
    onChange({ ...bundle, [key]: val });

  return (
    <div className="border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.01)] p-5 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[0.55rem] tracking-[0.3em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.4)]">
          Bundle {index + 1}
        </span>
        <button type="button" onClick={onDelete}
          className="text-[0.55rem] tracking-widest uppercase font-['Josefin_Sans'] text-red-400/50 hover:text-red-400 transition-colors">
          Remove
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Bundle Name</label>
          <input className={inputCls} value={bundle.name} placeholder="e.g. 1 Song Bundle"
            onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Badge / Tag (optional)</label>
          <input className={inputCls} value={bundle.tag ?? ""} placeholder="e.g. MOST POPULAR"
            onChange={(e) => set("tag", e.target.value || null)} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Subtitle</label>
        <input className={inputCls} value={bundle.subtitle} placeholder="e.g. Everything you need for a single release"
          onChange={(e) => set("subtitle", e.target.value)} />
      </div>

      <div className="max-w-xs">
        <label className={labelCls}>Base Price ($)</label>
        <input type="number" min="0" step="0.01" className={inputCls}
          value={bundle.price === 0 ? "" : bundle.price}
          onChange={(e) => set("price", parseFloat(e.target.value) || 0)} />
        <p className="text-[0.5rem] text-[rgba(245,240,232,0.2)] font-['Josefin_Sans'] mt-1">
          Shown when no sale is active
        </p>
      </div>

      <div>
        <label className={labelCls}>What's Included</label>
        <p className="text-[0.5rem] text-[rgba(245,240,232,0.25)] font-['Josefin_Sans'] mb-2">
          <code className="text-[#C9A96E]">**text**</code> bold ·{" "}
          <code className="text-red-400">__text__</code> underline ·{" "}
          <code className="text-zinc-400">*text*</code> italic
        </p>
        <IncludesList includes={bundle.includes} onChange={(v) => set("includes", v)} />
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────── */
export default function DiscountsAdmin() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convexConfig     = useQuery((api as any).pricingConfig.getPricingConfig);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upsert           = useMutation((api as any).pricingConfig.upsertPricingConfig);
  const updateBaseBundles = useAction(api.deploy.updateBaseBundles);

  /* ── Section 1: base bundles (seed from pricing.json) ─── */
  const [baseBundles, setBaseBundles] = useState<BaseBundle[]>(
    (pricingJson.bundles as BaseBundle[]).map((b) => ({
      id:       b.id,
      name:     b.name,
      subtitle: b.subtitle,
      price:    b.price,
      tag:      b.tag ?? null,
      includes: b.includes,
      order:    b.order,
    }))
  );
  const [baseDirty,  setBaseDirty]  = useState(false);
  const [baseSaving, setBaseSaving] = useState(false);
  const [baseSaved,  setBaseSaved]  = useState(false);
  const [baseError,  setBaseError]  = useState<string | null>(null);

  /* ── Section 2: sale config (from Convex) ──────────────── */
  const [saleActive,    setSaleActive]    = useState(false);
  const [saleName,      setSaleName]      = useState("Spring Sale");
  const [saleStartDate, setSaleStartDate] = useState("");
  const [saleEndDate,   setSaleEndDate]   = useState("");
  // per-bundle override state: Record<bundleId, BundleInSale>
  const [bundleSale, setBundleSale] = useState<Record<string, BundleInSale>>({});
  const [saleDirty,  setSaleDirty]  = useState(false);
  const [saleSaving, setSaleSaving] = useState(false);
  const [saleSaved,  setSaleSaved]  = useState(false);

  /* Seed sale state from Convex once loaded */
  useEffect(() => {
    if (!convexConfig || saleDirty) return;
    setSaleActive(convexConfig.saleActive ?? false);
    setSaleName(convexConfig.saleName ?? "Spring Sale");
    setSaleStartDate(convexConfig.saleStartDate ?? "");
    setSaleEndDate(convexConfig.saleEndDate ?? "");

    const init: Record<string, BundleInSale> = {};
    baseBundles.forEach((b) => {
      init[b.id] = { enabled: false, salePrice: Math.round(b.price * 0.8 * 100) / 100, discountPercent: 20 };
    });
    (convexConfig.saleBundles ?? []).forEach((sb: { bundleId: string; salePrice: number; discountPercent?: number }) => {
      if (init[sb.bundleId]) {
        init[sb.bundleId] = { enabled: true, salePrice: sb.salePrice, discountPercent: sb.discountPercent };
      }
    });
    setBundleSale(init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convexConfig]);

  /* ── Save base bundles ─────────────────────────────────── */
  const handleSaveBase = async () => {
    setBaseSaving(true);
    setBaseError(null);
    try {
      await updateBaseBundles({ bundles: baseBundles });
      setBaseDirty(false);
      setBaseSaved(true);
      setTimeout(() => setBaseSaved(false), 6000);
    } catch (err: unknown) {
      setBaseError(err instanceof Error ? err.message : String(err));
    }
    setBaseSaving(false);
  };

  const addBundle = () => {
    const id = `bundle-${Date.now()}`;
    setBaseBundles((prev) => [
      ...prev,
      { id, name: "New Bundle", subtitle: "", price: 0, tag: null, includes: [], order: prev.length },
    ]);
    setBaseDirty(true);
  };

  /* ── Save sale config ──────────────────────────────────── */
  const handleSaveSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaleSaving(true);
    const saleBundles = Object.entries(bundleSale)
      .filter(([, v]) => v.enabled)
      .map(([bundleId, v]) => ({
        bundleId,
        salePrice:       v.salePrice,
        discountPercent: v.discountPercent,
      }));
    await upsert({
      saleActive,
      saleName:      saleName  || undefined,
      saleStartDate: saleStartDate || undefined,
      saleEndDate:   saleEndDate   || undefined,
      saleBundles,
    });
    setSaleSaving(false);
    setSaleDirty(false);
    setSaleSaved(true);
    setTimeout(() => setSaleSaved(false), 3000);
  };

  const setBundleSaleField = (
    id: string,
    key: keyof BundleInSale,
    val: boolean | number | undefined
  ) => {
    setBundleSale((prev) => ({ ...prev, [id]: { ...prev[id], [key]: val } }));
    setSaleDirty(true);
  };

  /* ── Loading state ─────────────────────────────────────── */
  const saleLoading = convexConfig === undefined;

  /* ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-14">

      {/* ════ HEADER ════════════════════════════════════════════════ */}
      <div>
        <h2 className="font-['Cormorant_Garamond'] font-light text-2xl text-[#F5F0E8]">
          Discounts &amp; Bundles
        </h2>
        <p className="text-xs text-[rgba(245,240,232,0.35)] font-['Josefin_Sans'] mt-1">
          Manage your bundle offerings and configure time-limited sales.
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 1 — BUNDLE BASE PRICES
      ════════════════════════════════════════════════════════════ */}
      <div className="space-y-5">
        {/* Section header */}
        <div className="flex items-center gap-4">
          <p className={sectionTitle}>Bundles &amp; Base Prices</p>
          <span className="px-2 py-0.5 text-[0.5rem] tracking-widest uppercase font-['Josefin_Sans'] border border-amber-600/40 text-amber-500/70">
            Requires Redeploy
          </span>
        </div>

        {/* Info banner */}
        <div className="border border-[rgba(255,193,7,0.15)] bg-[rgba(255,193,7,0.03)] px-4 py-3 space-y-1">
          <p className="text-[0.6rem] tracking-[0.2em] uppercase font-['Cinzel'] text-amber-400/60">
            Baked into the site
          </p>
          <p className="text-xs text-[rgba(245,240,232,0.4)] font-['Josefin_Sans']">
            These are the prices shown when no sale is active. Saving commits{" "}
            <code className="text-amber-400/70">pricing.json</code> to the repo and triggers
            a rebuild — changes go live once the deploy finishes (~2 min).
          </p>
        </div>

        {/* Bundle editors */}
        <div className="space-y-4">
          {baseBundles.map((bundle, i) => (
            <BaseBundleEditor
              key={bundle.id}
              bundle={bundle}
              index={i}
              onChange={(updated) => {
                const next = [...baseBundles];
                next[i] = updated;
                setBaseBundles(next);
                setBaseDirty(true);
              }}
              onDelete={() => {
                setBaseBundles((prev) => prev.filter((_, idx) => idx !== i));
                setBaseDirty(true);
              }}
            />
          ))}
        </div>

        <button type="button" onClick={addBundle}
          className="px-4 py-2 border border-[rgba(255,255,255,0.1)] text-[rgba(245,240,232,0.4)]
                     hover:border-[rgba(255,255,255,0.25)] hover:text-[#F5F0E8]
                     text-[0.6rem] tracking-widest uppercase font-['Josefin_Sans'] transition-all">
          + Add Bundle
        </button>

        {/* Save row */}
        <div className="flex items-center gap-4 pt-1">
          <button
            type="button"
            onClick={handleSaveBase}
            disabled={baseSaving || !baseDirty}
            className="px-6 py-2.5 bg-amber-800/60 hover:bg-amber-700/70 disabled:opacity-40
                       text-[#F5F0E8] text-[0.65rem] tracking-[0.3em] uppercase font-['Josefin_Sans'] transition-colors border border-amber-600/30"
          >
            {baseSaving ? "Saving &amp; Deploying…" : "Save Base Prices + Deploy"}
          </button>
          {baseSaved && (
            <span className="text-amber-400 text-xs font-['Josefin_Sans'] tracking-widest uppercase">
              ✓ Committed — rebuild in progress
            </span>
          )}
          {baseError && (
            <span className="text-red-400 text-xs font-['Josefin_Sans']">{baseError}</span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[rgba(255,255,255,0.06)]" />

      {/* ════════════════════════════════════════════════════════════
          SECTION 2 — SALE CONFIGURATION
      ════════════════════════════════════════════════════════════ */}
      <form onSubmit={handleSaveSale} className="space-y-6">
        {/* Section header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className={sectionTitle}>Sale Configuration</p>
            <span className="px-2 py-0.5 text-[0.5rem] tracking-widest uppercase font-['Josefin_Sans'] border border-emerald-700/40 text-emerald-500/70">
              Live
            </span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {saleSaved && (
              <span className="text-emerald-400 text-xs font-['Josefin_Sans'] tracking-widest uppercase">
                ✓ Saved
              </span>
            )}
            <button
              type="submit"
              disabled={saleSaving || !saleDirty || saleLoading}
              className="px-6 py-2.5 bg-[#8B1A1A] hover:bg-[#B22222] disabled:opacity-40
                         text-[#F5F0E8] text-[0.65rem] tracking-[0.3em] uppercase font-['Josefin_Sans'] transition-colors"
            >
              {saleSaving ? "Saving…" : "Save Sale Config"}
            </button>
          </div>
        </div>

        {/* Live info banner */}
        <div className="border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)] px-4 py-3">
          <p className="text-xs text-[rgba(245,240,232,0.4)] font-['Josefin_Sans']">
            Changes save to Convex and appear on the pricing page immediately — no deploy needed.
          </p>
        </div>

        {saleLoading ? (
          <p className="text-[rgba(245,240,232,0.3)] text-sm font-['Josefin_Sans']">Loading…</p>
        ) : (
          <>
            {/* ── Sale on/off + name ────────────────────────── */}
            <div className="border border-[rgba(201,169,110,0.15)] bg-[#0d0d0d] p-5 space-y-5">
              <p className={sectionTitle}>Sale Banner</p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setSaleActive((p) => !p); setSaleDirty(true); }}
                  className={`px-5 py-2.5 text-[0.65rem] tracking-[0.25em] uppercase font-['Josefin_Sans'] border transition-colors ${
                    saleActive
                      ? "bg-emerald-900/30 border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/50"
                      : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.1)] text-[rgba(245,240,232,0.35)] hover:border-[rgba(255,255,255,0.25)]"
                  }`}
                >
                  {saleActive ? "● Sale Active" : "○ Sale Hidden"}
                </button>
                <p className="text-xs text-[rgba(245,240,232,0.35)] font-['Josefin_Sans']">
                  {saleActive
                    ? "Sale banner and discounted prices visible on the pricing page."
                    : "No sale banner will be shown; base prices are displayed."}
                </p>
              </div>

              <div>
                <label className={labelCls}>Sale Name</label>
                <input
                  className={inputCls}
                  placeholder="e.g. Spring Sale"
                  value={saleName}
                  onChange={(e) => { setSaleName(e.target.value); setSaleDirty(true); }}
                />
                <p className="text-[0.5rem] text-[rgba(245,240,232,0.2)] font-['Josefin_Sans'] mt-1">
                  Displayed as the headline above the bundle cards
                </p>
              </div>
            </div>

            {/* ── Sale dates ───────────────────────────────── */}
            <div className="border border-[rgba(255,255,255,0.06)] p-5 space-y-4">
              <p className={sectionTitle}>Sale Window</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Sale Start Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    className={inputCls}
                    value={saleStartDate}
                    onChange={(e) => { setSaleStartDate(e.target.value); setSaleDirty(true); }}
                  />
                  <p className="text-[0.5rem] text-[rgba(245,240,232,0.2)] font-['Josefin_Sans'] mt-1">
                    Sale prices activate at this moment (leave blank to start immediately)
                  </p>
                </div>
                <div>
                  <label className={labelCls}>Sale End Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    className={inputCls}
                    value={saleEndDate}
                    onChange={(e) => { setSaleEndDate(e.target.value); setSaleDirty(true); }}
                  />
                  <p className="text-[0.5rem] text-[rgba(245,240,232,0.2)] font-['Josefin_Sans'] mt-1">
                    Countdown timer on pricing page counts down to this moment
                  </p>
                </div>
              </div>
            </div>

            {/* ── Bundles in sale ──────────────────────────── */}
            <div className="space-y-3">
              <p className={sectionTitle}>Bundles in this Sale</p>
              <p className="text-xs text-[rgba(245,240,232,0.35)] font-['Josefin_Sans']">
                Toggle which bundles are discounted. Sale prices replace base prices when the sale is active.
              </p>

              <div className="space-y-3 mt-2">
                {baseBundles.map((base) => {
                  const state = bundleSale[base.id] ?? {
                    enabled: false,
                    salePrice: Math.round(base.price * 0.8 * 100) / 100,
                    discountPercent: 20,
                  };
                  return (
                    <div
                      key={base.id}
                      className={`border p-4 transition-colors ${
                        state.enabled
                          ? "border-[rgba(201,169,110,0.25)] bg-[rgba(201,169,110,0.03)]"
                          : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)]"
                      }`}
                    >
                      {/* Bundle row header */}
                      <div className="flex items-center gap-3 mb-3">
                        <button
                          type="button"
                          onClick={() => setBundleSaleField(base.id, "enabled", !state.enabled)}
                          className={`flex-shrink-0 w-5 h-5 border flex items-center justify-center transition-colors ${
                            state.enabled
                              ? "border-[#C9A96E] bg-[rgba(201,169,110,0.15)]"
                              : "border-[rgba(255,255,255,0.2)]"
                          }`}
                        >
                          {state.enabled && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <polyline points="1,4 3.5,6.5 9,1" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-['Josefin_Sans'] text-[#F5F0E8]">{base.name}</span>
                          {base.tag && (
                            <span className="ml-2 px-1.5 py-0.5 text-[0.5rem] tracking-widest border border-[rgba(201,169,110,0.3)] text-[#C9A96E] font-['Josefin_Sans']">
                              {base.tag}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-[rgba(245,240,232,0.3)] font-['Josefin_Sans'] flex-shrink-0">
                          Base: ${base.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Sale price fields — only visible when enabled */}
                      {state.enabled && (
                        <div className="grid sm:grid-cols-2 gap-4 ml-8">
                          <div>
                            <label className={labelCls}>Sale Price ($)</label>
                            <input
                              type="number" min="0" step="0.01" className={inputCls}
                              value={state.salePrice === 0 ? "" : state.salePrice}
                              onChange={(e) =>
                                setBundleSaleField(base.id, "salePrice", parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Discount % (optional)</label>
                            <input
                              type="number" min="0" max="99" className={inputCls}
                              placeholder="e.g. 25"
                              value={state.discountPercent ?? ""}
                              onChange={(e) =>
                                setBundleSaleField(
                                  base.id, "discountPercent",
                                  e.target.value ? parseInt(e.target.value) : undefined
                                )
                              }
                            />
                            <p className="text-[0.5rem] text-[rgba(245,240,232,0.2)] font-['Josefin_Sans'] mt-1">
                              Shown as a badge on the bundle card
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Save (bottom) ────────────────────────────── */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saleSaving || !saleDirty}
                className="px-8 py-3 bg-[#8B1A1A] hover:bg-[#B22222] disabled:opacity-40
                           text-[#F5F0E8] text-[0.65rem] tracking-[0.35em] uppercase font-['Josefin_Sans'] transition-colors"
              >
                {saleSaving ? "Saving…" : "Save Sale Config"}
              </button>
              {saleSaved && (
                <span className="text-emerald-400 text-xs font-['Josefin_Sans'] tracking-widest uppercase">
                  ✓ Changes saved
                </span>
              )}
            </div>
          </>
        )}
      </form>
    </div>
  );
}
