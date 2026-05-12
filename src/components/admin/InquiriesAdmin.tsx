"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type ReviewStatus = "pending" | "contacted" | "quoted" | "closed";

const STATUS_STYLES: Record<ReviewStatus, string> = {
  pending:   "bg-amber-900/40 text-amber-300 border-amber-700/40",
  contacted: "bg-blue-900/40 text-blue-300 border-blue-700/40",
  quoted:    "bg-purple-900/40 text-purple-300 border-purple-700/40",
  closed:    "bg-zinc-800 text-zinc-400 border-zinc-700",
};

function StatusBadge({ status }: { status: string | undefined }) {
  const s = (status ?? "pending") as ReviewStatus;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[0.6rem] tracking-widest uppercase border font-['Josefin_Sans'] ${STATUS_STYLES[s] ?? STATUS_STYLES.pending}`}>
      {s}
    </span>
  );
}

export default function InquiriesAdmin() {
  const inquiries    = useQuery(api.inquiries.listInquiries);
  const updateStatus = useMutation(api.inquiries.updateInquiryStatus);

  const [filter, setFilter]   = useState<"all" | ReviewStatus>("all");
  const [expanded, setExpanded] = useState<Id<"inquarys"> | null>(null);

  const filtered = (inquiries ?? []).filter((i) => {
    if (filter === "all") return true;
    const s = i.reviewStatus ?? "pending";
    return s === filter;
  });

  const counts = {
    all:       (inquiries ?? []).length,
    pending:   (inquiries ?? []).filter((i) => (i.reviewStatus ?? "pending") === "pending").length,
    contacted: (inquiries ?? []).filter((i) => i.reviewStatus === "contacted").length,
    quoted:    (inquiries ?? []).filter((i) => i.reviewStatus === "quoted").length,
    closed:    (inquiries ?? []).filter((i) => i.reviewStatus === "closed").length,
  };

  const tabCls = (t: typeof filter) =>
    `px-4 py-2 text-[0.6rem] tracking-[0.25em] uppercase font-['Cinzel'] transition-colors ${
      filter === t
        ? "border-b-2 border-[#C9A96E] text-[#C9A96E]"
        : "text-[rgba(245,240,232,0.4)] hover:text-[rgba(245,240,232,0.7)]"
    }`;

  const servicesList = (services: Record<string, boolean>) =>
    Object.entries(services)
      .filter(([, v]) => v)
      .map(([k]) =>
        k.replace(/([A-Z])/g, " $1").trim()
          .replace(/^\w/, (c) => c.toUpperCase())
      )
      .join(", ");

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div>
        <h2 className="font-['Cormorant_Garamond'] font-light text-2xl text-[#F5F0E8] mb-4">
          Custom Quote Inquiries
        </h2>
        <div className="border-b border-[rgba(255,255,255,0.06)] flex gap-1 flex-wrap">
          {(["all", "pending", "contacted", "quoted", "closed"] as const).map((f) => (
            <button key={f} className={tabCls(f)} onClick={() => setFilter(f)}>
              {f} <span className="text-[rgba(201,169,110,0.5)]">({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {!inquiries ? (
        <p className="text-[rgba(245,240,232,0.3)] text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="border border-[rgba(255,255,255,0.07)] p-12 text-center">
          <p className="text-[rgba(245,240,232,0.3)] text-sm">No {filter === "all" ? "" : filter + " "}inquiries.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((inq) => (
            <div key={inq._id} className="border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
              {/* Row */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer"
                onClick={() => setExpanded(expanded === inq._id ? null : inq._id)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <StatusBadge status={inq.reviewStatus} />
                  <div className="min-w-0">
                    <p className="text-sm text-[#F5F0E8] font-['Josefin_Sans'] truncate">
                      {inq.fullName}
                      {inq.artistName && (
                        <span className="text-[rgba(201,169,110,0.6)] ml-2 text-xs">({inq.artistName})</span>
                      )}
                    </p>
                    <p className="text-xs text-[rgba(245,240,232,0.35)] font-['Josefin_Sans'] mt-0.5">
                      {inq.projectType} · {inq.songCount} song{inq.songCount !== 1 ? "s" : ""} · {inq.budget}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <span className="text-xs text-[rgba(245,240,232,0.3)] font-['Josefin_Sans'] hidden sm:block">
                    {inq.completionDate}
                  </span>
                  <span className="text-[rgba(245,240,232,0.25)] text-xs ml-1">
                    {expanded === inq._id ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* Expanded */}
              {expanded === inq._id && (
                <div className="border-t border-[rgba(255,255,255,0.05)] px-5 py-5 space-y-5">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                    {[
                      ["Email",            inq.email],
                      ["Phone",            inq.phone],
                      ["Project Type",     inq.projectType + (inq.otherProjectType ? ` — ${inq.otherProjectType}` : "")],
                      ["Services",         servicesList(inq.services)],
                      ["Song Count",       String(inq.songCount)],
                      ["Budget",           inq.budget],
                      ["Completion Date",  inq.completionDate],
                      ["Project Goal",     inq.projectGoal ?? "—"],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-[0.55rem] tracking-[0.25em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.5)] mb-0.5">{label}</p>
                        <p className="text-sm text-[rgba(245,240,232,0.7)] font-['Josefin_Sans']">{val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Status actions */}
                  <div>
                    <p className="text-[0.55rem] tracking-[0.25em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.5)] mb-2">Update Status</p>
                    <div className="flex gap-2 flex-wrap">
                      {(["pending", "contacted", "quoted", "closed"] as ReviewStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus({ id: inq._id, reviewStatus: s })}
                          disabled={(inq.reviewStatus ?? "pending") === s}
                          className={`px-4 py-1.5 text-[0.55rem] tracking-widest uppercase font-['Josefin_Sans'] border transition-colors disabled:opacity-30 ${STATUS_STYLES[s]}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    {inq.reviewedAt && (
                      <p className="text-[0.55rem] text-[rgba(245,240,232,0.25)] font-['Josefin_Sans'] mt-2">
                        Last updated: {inq.reviewedAt}
                      </p>
                    )}
                  </div>

                  {/* Quick-contact links */}
                  <div className="flex gap-4">
                    <a href={`mailto:${inq.email}?subject=Re: Your Studio Inquiry`}
                      className="text-[0.6rem] tracking-widest uppercase font-['Josefin_Sans'] text-[#C9A96E] hover:text-[#E8C98A] transition-colors">
                      Email →
                    </a>
                    <a href={`tel:${inq.phone}`}
                      className="text-[0.6rem] tracking-widest uppercase font-['Josefin_Sans'] text-[rgba(245,240,232,0.4)] hover:text-[#F5F0E8] transition-colors">
                      Call →
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
