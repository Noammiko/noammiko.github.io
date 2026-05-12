"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/* ─── Shared style tokens ────────────────────────────────────────── */
const inputCls =
  `w-full bg-[#111] border border-[rgba(255,255,255,0.1)] text-[#F5F0E8] px-3 py-2.5
   text-sm font-['Josefin_Sans'] focus:outline-none focus:border-[rgba(201,169,110,0.5)]
   placeholder:text-[rgba(245,240,232,0.2)]`;
const labelCls =
  `block text-[0.6rem] tracking-[0.25em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.7)] mb-1.5`;

/* ─── Settings Panel ─────────────────────────────────────────────── */
function FreeSettingsPanel() {
  const settings    = useQuery(api.freeAccess.getSettings);
  const upsert      = useMutation(api.freeAccess.upsertSettings);
  const amountWeek  = useQuery(api.freeAccess.getAmountWeek, {});

  const [slots, setSlots] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  if (!settings) return null;

  const effectiveSlots = slots ?? settings.weeklySlots;

  const save = async () => {
    setSaving(true);
    await upsert({ enabled: settings.enabled, weeklySlots: effectiveSlots });
    setSlots(null);
    setSaving(false);
  };

  const toggleEnabled = async () => {
    await upsert({ enabled: !settings.enabled, weeklySlots: settings.weeklySlots });
  };

  const used = amountWeek ?? 0;
  const remaining = Math.max(0, settings.weeklySlots - used);

  return (
    <div className="border border-[rgba(201,169,110,0.2)] bg-[#0d0d0d] p-6 mb-8">
      <h3 className="font-['Cormorant_Garamond'] font-light text-xl text-[#F5F0E8] mb-5">
        Free Offer Settings
      </h3>

      <div className="grid sm:grid-cols-3 gap-6">
        {/* Toggle */}
        <div>
          <p className={labelCls}>Offer Status</p>
          <button
            onClick={toggleEnabled}
            className={`w-full px-4 py-2.5 text-[0.65rem] tracking-[0.25em] uppercase font-['Josefin_Sans'] transition-colors border ${
              settings.enabled
                ? "bg-emerald-900/30 border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/50"
                : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-[rgba(245,240,232,0.35)] hover:border-[rgba(255,255,255,0.25)]"
            }`}
          >
            {settings.enabled ? "● Enabled" : "○ Disabled"}
          </button>
        </div>

        {/* Weekly slots */}
        <div>
          <label className={labelCls}>Weekly Slots</label>
          <input
            type="number"
            min="1"
            max="20"
            value={effectiveSlots}
            onChange={(e) => setSlots(parseInt(e.target.value) || 1)}
            className={inputCls}
          />
        </div>

        {/* This-week usage */}
        <div>
          <p className={labelCls}>This Week</p>
          <div className="border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5">
            <span className="font-['Cormorant_Garamond'] text-2xl text-[#C9A96E]">{remaining}</span>
            <span className="text-xs text-[rgba(245,240,232,0.35)] font-['Josefin_Sans'] ml-2">
              / {settings.weeklySlots} remaining
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving || slots === null}
          className="px-5 py-2 bg-[#8B1A1A] hover:bg-[#B22222] text-[#F5F0E8]
                     text-[0.6rem] tracking-[0.3em] uppercase font-['Josefin_Sans'] transition-colors disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save Slots"}
        </button>
        {slots !== null && (
          <button
            onClick={() => setSlots(null)}
            className="px-5 py-2 border border-[rgba(255,255,255,0.1)] text-[rgba(245,240,232,0.4)]
                       hover:text-[#F5F0E8] text-[0.6rem] tracking-[0.3em] uppercase font-['Josefin_Sans'] transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Approval status badge ──────────────────────────────────────── */
function ApprovalBadge({ approved }: { approved: boolean | null }) {
  if (approved === true)
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[0.6rem] tracking-widest uppercase border bg-emerald-900/40 text-emerald-300 border-emerald-700/40">
        Approved
      </span>
    );
  if (approved === false)
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[0.6rem] tracking-widest uppercase border bg-red-900/40 text-red-300 border-red-700/40">
        Denied
      </span>
    );
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[0.6rem] tracking-widest uppercase border bg-amber-900/40 text-amber-300 border-amber-700/40">
      Pending
    </span>
  );
}

/* ─── Main Free Trials Panel ─────────────────────────────────────── */
export default function FreeTrialsAdmin() {
  const trials   = useQuery(api.freeAccess.getFreeTrials);
  const approve  = useMutation(api.freeAccess.approveFree);
  const deny     = useMutation(api.freeAccess.denyFree);

  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "denied">("pending");
  const [expanded, setExpanded] = useState<Id<"free"> | null>(null);

  const filtered = (trials ?? []).filter((t) => {
    if (filter === "pending")  return t.approved === null || t.approved === undefined;
    if (filter === "approved") return t.approved === true;
    if (filter === "denied")   return t.approved === false;
    return true;
  });

  const counts = {
    all:      (trials ?? []).length,
    pending:  (trials ?? []).filter((t) => t.approved === null || t.approved === undefined).length,
    approved: (trials ?? []).filter((t) => t.approved === true).length,
    denied:   (trials ?? []).filter((t) => t.approved === false).length,
  };

  const tabCls = (t: typeof filter) =>
    `px-4 py-2 text-[0.6rem] tracking-[0.25em] uppercase font-['Cinzel'] transition-colors ${
      filter === t
        ? "border-b-2 border-[#C9A96E] text-[#C9A96E]"
        : "text-[rgba(245,240,232,0.4)] hover:text-[rgba(245,240,232,0.7)]"
    }`;

  return (
    <div className="space-y-6">
      {/* Settings */}
      <FreeSettingsPanel />

      {/* Header + filter tabs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-['Cormorant_Garamond'] font-light text-2xl text-[#F5F0E8]">
            Free Trial Applications
          </h2>
        </div>

        <div className="border-b border-[rgba(255,255,255,0.06)] flex gap-1 mb-6">
          {(["pending", "all", "approved", "denied"] as const).map((f) => (
            <button key={f} className={tabCls(f)} onClick={() => setFilter(f)}>
              {f} <span className="text-[rgba(201,169,110,0.5)]">({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {!trials ? (
        <p className="text-[rgba(245,240,232,0.3)] text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="border border-[rgba(255,255,255,0.07)] p-12 text-center">
          <p className="text-[rgba(245,240,232,0.3)] text-sm">No {filter} applications.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((trial) => (
            <div
              key={trial._id}
              className="border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
            >
              {/* Row */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer"
                onClick={() => setExpanded(expanded === trial._id ? null : trial._id)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <ApprovalBadge approved={trial.approved} />
                  <div className="min-w-0">
                    <p className="text-sm text-[#F5F0E8] font-['Josefin_Sans'] truncate">
                      {trial.fullName}
                      {trial.artistName && (
                        <span className="text-[rgba(201,169,110,0.6)] ml-2 text-xs">
                          ({trial.artistName})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[rgba(245,240,232,0.35)] font-['Josefin_Sans'] mt-0.5">
                      {trial.email} · {trial.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                  <span className="text-xs text-[rgba(245,240,232,0.3)] font-['Josefin_Sans'] hidden sm:block">
                    {trial.recordingType}
                  </span>
                  {(trial.approved === null || trial.approved === undefined) && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); approve({ id: trial._id }); }}
                        className="px-3 py-1.5 bg-emerald-900/30 hover:bg-emerald-800/50 border border-emerald-700/40 text-emerald-400
                                   text-[0.55rem] tracking-widest uppercase font-['Josefin_Sans'] transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deny({ id: trial._id }); }}
                        className="px-3 py-1.5 bg-red-900/20 hover:bg-red-900/40 border border-red-800/40 text-red-400
                                   text-[0.55rem] tracking-widest uppercase font-['Josefin_Sans'] transition-colors"
                      >
                        Deny
                      </button>
                    </>
                  )}
                  <span className="text-[rgba(245,240,232,0.25)] text-xs ml-1">
                    {expanded === trial._id ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* Expanded details */}
              {expanded === trial._id && (
                <div className="border-t border-[rgba(255,255,255,0.05)] px-5 py-4 grid sm:grid-cols-2 gap-x-8 gap-y-3">
                  {[
                    ["Recording Type",  trial.recordingType + (trial.otherRecordingType ? ` — ${trial.otherRecordingType}` : "")],
                    ["Available Times", trial.availableTimes],
                    ["Referral Source", trial.referralSource ?? "—"],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-[0.55rem] tracking-[0.25em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.5)] mb-0.5">{label}</p>
                      <p className="text-sm text-[rgba(245,240,232,0.7)] font-['Josefin_Sans']">{val}</p>
                    </div>
                  ))}
                  {/* Re-approve / re-deny after decision */}
                  {trial.approved !== null && trial.approved !== undefined && (
                    <div className="sm:col-span-2 flex gap-3 pt-2">
                      <button
                        onClick={() => approve({ id: trial._id })}
                        disabled={trial.approved === true}
                        className="px-4 py-1.5 bg-emerald-900/30 hover:bg-emerald-800/50 border border-emerald-700/40 text-emerald-400
                                   text-[0.55rem] tracking-widest uppercase font-['Josefin_Sans'] transition-colors disabled:opacity-30"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => deny({ id: trial._id })}
                        disabled={trial.approved === false}
                        className="px-4 py-1.5 bg-red-900/20 hover:bg-red-900/40 border border-red-800/40 text-red-400
                                   text-[0.55rem] tracking-widest uppercase font-['Josefin_Sans'] transition-colors disabled:opacity-30"
                      >
                        Deny
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
