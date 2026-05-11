"use client";

import { useState, useEffect } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SignOutButton } from "./layout";
import FreeTrialsAdmin  from "./approveUsers";
import DiscountsAdmin   from "./DiscountsAdmin";
import PortfolioAdmin   from "./PortfolioAdmin";
import ReviewsFAQAdmin  from "./ReviewsFAQAdmin";
import InquiriesAdmin   from "./InquiriesAdmin";
import MusicAdmin       from "./MusicAdmin";

type Page =
  | "discounts"
  | "portfolio"
  | "freeSlots"
  | "inquiries"
  | "reviewsFaqs"
  | "music";

/* ─── Sidebar nav items ──────────────────────────────────────────── */
const NAV: { id: Page; label: string; icon: string }[] = [
  { id: "discounts",   label: "Discounts & Bundles", icon: "🏷"  },
  { id: "portfolio",   label: "Portfolio",           icon: "🎵"  },
  { id: "freeSlots",   label: "Free Slots",          icon: "🎟"  },
  { id: "inquiries",   label: "Inquiries",           icon: "📩"  },
  { id: "reviewsFaqs", label: "Reviews & FAQs",      icon: "⭐"  },
  { id: "music",       label: "My Music",            icon: "🎤"  },
];

/* ─── Deploy bar ─────────────────────────────────────────────────── */
function DeployBar() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg]       = useState("");

  const triggerDeploy = useAction(api.deploy.triggerDeploy);

  /* True in `bun run dev`, false in production builds */
  const isDev = import.meta.env.DEV;

  const deploy = async () => {
    setStatus("loading"); setMsg("");
    try {
      await triggerDeploy();
      setStatus("success");
      setMsg("Deploy triggered! The site will update in ~2–3 minutes.");
    } catch (err: any) {
      setStatus("error");
      setMsg(err.message ?? "Unknown error");
    }
  };

  const previewDev = () => {
    /* Open / refresh the homepage so you can see live Convex changes */
    window.open("/", "_blank");
  };

  return (
    <div className="border-t border-[rgba(255,255,255,0.06)] mt-12 pt-6 space-y-3">

      {/* Dev-only preview bar */}
      {isDev && (
        <div className="flex items-center justify-between gap-4 border border-[rgba(255,193,7,0.12)] bg-[rgba(255,193,7,0.02)] px-4 py-3">
          <div>
            <p className="text-[0.55rem] tracking-[0.3em] uppercase font-['Cinzel'] text-amber-400/60 mb-0.5">
              Dev Preview
            </p>
            <p className="text-[0.6rem] text-[rgba(245,240,232,0.25)] font-['Josefin_Sans']">
              Reviews, FAQs, Bundles &amp; Portfolio update instantly — just open the site.
            </p>
          </div>
          <button
            onClick={previewDev}
            className="flex items-center gap-2 px-5 py-2.5 border border-amber-600/30 text-amber-400/70
                       hover:bg-amber-900/15 hover:border-amber-500/50
                       text-[0.6rem] tracking-[0.25em] uppercase font-['Josefin_Sans']
                       transition-all duration-200 flex-shrink-0"
          >
            🔍 Open Preview
          </button>
        </div>
      )}

      {/* Production deploy */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-[0.55rem] tracking-[0.3em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.4)] mb-0.5">
            Deploy to Production
          </p>
          {msg ? (
            <p className={`text-xs font-['Josefin_Sans'] ${status === "success" ? "text-emerald-400" : "text-red-400"}`}>
              {msg}
            </p>
          ) : (
            <p className="text-[0.6rem] text-[rgba(245,240,232,0.25)] font-['Josefin_Sans']">
              {isDev
                ? "Triggers a GitHub Actions rebuild of the live site."
                : "Triggers a full site rebuild so all changes go live."}
            </p>
          )}
        </div>
        <button
          onClick={deploy}
          disabled={status === "loading"}
          className="flex items-center gap-2 px-7 py-3 border border-[rgba(201,169,110,0.35)] text-[#C9A96E]
                     hover:bg-[rgba(201,169,110,0.08)] hover:border-[rgba(201,169,110,0.6)]
                     text-[0.65rem] tracking-[0.3em] uppercase font-['Josefin_Sans']
                     transition-all duration-200 disabled:opacity-40 flex-shrink-0"
        >
          {status === "loading" ? "🔄 Deploying…" : "🚀 Deploy to Site"}
        </button>
      </div>
    </div>
  );
}

/* ─── Page wrappers with DeployBar ──────────────────────────────── */
function WithDeploy({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      <DeployBar />
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────── */
export function AdminDashboard() {
  const [page, setPage]           = useState<Page>("discounts");
  const [sidebarOpen, setSidebar] = useState(false);

  /* Auto-seed reviews and FAQs on first load if tables are empty */
  // @ts-ignore
  const seedReviews = useMutation(api.reviews.seedDefaultReviews);
  // @ts-ignore
  const seedFaqs    = useMutation(api.faqs.seedDefaultFaqs);
  useEffect(() => {
    seedReviews();
    seedFaqs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* Pending counts for nav badges */
  const inquiries  = useQuery(api.inquiries.listInquiries);
  const freeTrials = useQuery(api.freeAccess.getFreeTrials);

  const pendingInquiries = (inquiries  ?? []).filter((i) => (i.reviewStatus ?? "pending") === "pending").length;
  const pendingFree      = (freeTrials ?? []).filter((t) => t.approved === null || t.approved === undefined).length;

  const badges: Partial<Record<Page, number>> = {
    inquiries: pendingInquiries || 0,
    freeSlots: pendingFree      || 0,
  };

  const navItemCls = (id: Page) =>
    `w-full flex items-center gap-3 px-4 py-3 text-left transition-colors font-['Josefin_Sans'] text-xs tracking-[0.15em] uppercase ${
      page === id
        ? "bg-[rgba(201,169,110,0.08)] text-[#C9A96E] border-r-2 border-[#C9A96E]"
        : "text-[rgba(245,240,232,0.45)] hover:text-[rgba(245,240,232,0.75)] hover:bg-[rgba(255,255,255,0.03)]"
    }`;

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F0E8] flex flex-col font-['Josefin_Sans']">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="border-b border-[rgba(201,169,110,0.15)] px-6 py-4 flex items-center justify-between flex-shrink-0 z-20 bg-[#080808]">
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-[rgba(245,240,232,0.4)] hover:text-[#F5F0E8] transition-colors"
            onClick={() => setSidebar((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div>
            <p className="text-[0.55rem] tracking-[0.4em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.6)]">Admin</p>
            <h1 className="font-['Cormorant_Garamond'] font-light text-xl text-[#F5F0E8] leading-none">
              Miko Recording Studio
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="text-[0.6rem] tracking-[0.25em] uppercase font-['Josefin_Sans'] text-[rgba(245,240,232,0.35)] hover:text-[#C9A96E] transition-colors hidden sm:block"
          >
            ← Site
          </a>
          <SignOutButton />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ─────────────────────────────────────── */}
        <>
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebar(false)} />
          )}

          <aside className={`
            fixed lg:static top-0 left-0 h-full z-40
            w-56 bg-[#0a0a0a] border-r border-[rgba(255,255,255,0.06)]
            flex flex-col flex-shrink-0 overflow-y-auto
            transition-transform duration-200
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}>
            <div className="lg:hidden flex justify-end p-4">
              <button onClick={() => setSidebar(false)} className="text-[rgba(245,240,232,0.4)] hover:text-[#F5F0E8]">✕</button>
            </div>

            <nav className="flex-1 py-2">
              {NAV.map(({ id, label, icon }) => (
                <button
                  key={id}
                  className={navItemCls(id)}
                  onClick={() => { setPage(id); setSidebar(false); }}
                >
                  <span className="text-base leading-none">{icon}</span>
                  <span className="flex-1">{label}</span>
                  {badges[id] ? (
                    <span className="bg-[#8B1A1A] text-[#F5F0E8] text-[0.55rem] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {badges[id]}
                    </span>
                  ) : null}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-[rgba(255,255,255,0.05)]">
              <p className="text-[0.5rem] tracking-[0.3em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.3)]">
                Miko Studio Admin
              </p>
            </div>
          </aside>
        </>

        {/* ── Main content ────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8">
            {page === "discounts"   && <WithDeploy><DiscountsAdmin /></WithDeploy>}
            {page === "portfolio"   && <WithDeploy><PortfolioAdmin /></WithDeploy>}
            {page === "freeSlots"   && <WithDeploy><FreeTrialsAdmin /></WithDeploy>}
            {page === "inquiries"   && <WithDeploy><InquiriesAdmin /></WithDeploy>}
            {page === "reviewsFaqs" && <WithDeploy><ReviewsFAQAdmin /></WithDeploy>}
            {page === "music"       && <WithDeploy><MusicAdmin /></WithDeploy>}
          </div>
        </main>
      </div>
    </div>
  );
}
