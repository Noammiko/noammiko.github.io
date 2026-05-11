"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { SignOutButton } from "./layout";
import FreeTrialsAdmin  from "./approveUsers";
import DiscountsAdmin   from "./DiscountsAdmin";
import PortfolioAdmin   from "./PortfolioAdmin";
import ReviewsFAQAdmin  from "./ReviewsFAQAdmin";
import InquiriesAdmin   from "./InquiriesAdmin";
import MusicAdmin       from "./MusicAdmin";

/* ─── Helpers ────────────────────────────────────────────────────── */
const fmtCAD = (n: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n);
const TODAY = new Date().toISOString().substring(0, 10);

type Page =
  | "sales"
  | "discounts"
  | "portfolio"
  | "freeSlots"
  | "inquiries"
  | "reviewsFaqs"
  | "music";

/* ─── Sidebar nav items ──────────────────────────────────────────── */
const NAV: { id: Page; label: string; icon: string }[] = [
  { id: "sales",      label: "Sales",          icon: "💰" },
  { id: "discounts",  label: "Discounts",      icon: "🏷" },
  { id: "portfolio",  label: "Portfolio",      icon: "🎵" },
  { id: "freeSlots",  label: "Free Slots",     icon: "🎟" },
  { id: "inquiries",  label: "Inquiries",      icon: "📩" },
  { id: "reviewsFaqs",label: "Reviews & FAQs", icon: "⭐" },
  { id: "music",      label: "My Music",       icon: "🎤" },
];

/* ─── Deploy bar (shown at the bottom of every page) ─────────────── */
function DeployBar() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg]       = useState("");

  const deploy = async () => {
    setStatus("loading"); setMsg("");
    try {
      const res = await fetch("/api/trigger-deploy", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ type: "full" }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("success");
      setMsg("Deploy triggered! The site will update in ~2–3 minutes.");
    } catch (err: any) {
      setStatus("error");
      setMsg(err.message ?? "Unknown error");
    }
  };

  return (
    <div className="border-t border-[rgba(255,255,255,0.06)] mt-12 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <p className="text-[0.55rem] tracking-[0.3em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.4)] mb-0.5">
          Deploy Changes
        </p>
        {msg ? (
          <p className={`text-xs font-['Josefin_Sans'] ${status === "success" ? "text-emerald-400" : "text-red-400"}`}>
            {msg}
          </p>
        ) : (
          <p className="text-[0.6rem] text-[rgba(245,240,232,0.25)] font-['Josefin_Sans']">
            Triggers a full site rebuild so all changes go live.
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
  );
}

/* ─── Types ──────────────────────────────────────────────────────── */
type SaleStatus = "completed" | "pending" | "refunded";

interface Sale {
  _id: Id<"sales">;
  _creationTime: number;
  clientName: string;
  service: string;
  amount: number;
  date: string;
  notes?: string;
  status: string;
}

/* ─── Status badge ───────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const colours: Record<string, string> = {
    completed: "bg-emerald-900/40 text-emerald-300 border-emerald-700/40",
    pending:   "bg-amber-900/40   text-amber-300   border-amber-700/40",
    refunded:  "bg-red-900/40     text-red-300     border-red-700/40",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[0.6rem] tracking-widest uppercase border font-['Josefin_Sans'] ${colours[status] ?? "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
      {status}
    </span>
  );
}

/* ─── Stat card ──────────────────────────────────────────────────── */
function StatCard({ label, value, sub, gold }: { label: string; value: string; sub?: string; gold?: boolean }) {
  return (
    <div className={`border p-5 ${gold ? "border-[rgba(201,169,110,0.35)] bg-[rgba(201,169,110,0.04)]" : "border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)]"}`}>
      <p className="text-[0.6rem] tracking-[0.3em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.7)] mb-2">{label}</p>
      <p className={`font-['Cormorant_Garamond'] font-light text-3xl ${gold ? "text-[#C9A96E]" : "text-[#F5F0E8]"}`}>{value}</p>
      {sub && <p className="text-[rgba(245,240,232,0.35)] text-xs mt-1 font-['Josefin_Sans']">{sub}</p>}
    </div>
  );
}

/* ─── Sale form ──────────────────────────────────────────────────── */
function SaleForm({ initial, onSave, onCancel }: {
  initial?: Partial<Sale>;
  onSave: (data: Omit<Sale, "_id" | "_creationTime">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    clientName: initial?.clientName ?? "",
    service:    initial?.service    ?? "",
    amount:     initial?.amount     ?? 0,
    date:       initial?.date       ?? TODAY,
    notes:      initial?.notes      ?? "",
    status:     (initial?.status    ?? "completed") as SaleStatus,
  });

  const services = ["1 Song Bundle","2 Songs Bundle","Mix & Master Bundle","Studio Time (hourly)","Professional Mix","Professional Master","Existing Beat","Custom Beat","Other"];
  const iCls = `w-full bg-[#111] border border-[rgba(255,255,255,0.1)] text-[#F5F0E8] px-3 py-2.5 text-sm font-['Josefin_Sans'] focus:outline-none focus:border-[rgba(201,169,110,0.5)] placeholder:text-[rgba(245,240,232,0.2)]`;
  const lCls = `block text-[0.6rem] tracking-[0.25em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.7)] mb-1.5`;
  const field = (key: keyof typeof form) => ({
    value: String(form[key]),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: key === "amount" ? parseFloat(e.target.value) || 0 : e.target.value })),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="border border-[rgba(201,169,110,0.2)] bg-[#0d0d0d] p-6 space-y-5 mb-6">
      <h3 className="font-['Cormorant_Garamond'] font-light text-xl text-[#F5F0E8]">{initial?._id ? "Edit Sale" : "New Sale"}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={lCls}>Client Name</label><input required className={iCls} placeholder="Artist / Client" {...field("clientName")} /></div>
        <div>
          <label className={lCls}>Service</label>
          <select required className={iCls} {...field("service")}>
            <option value="">Select…</option>
            {services.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lCls}>Amount (CAD $)</label>
          <input type="number" min="0" step="0.01" required className={iCls} placeholder="0.00"
            value={form.amount === 0 ? "" : form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} />
        </div>
        <div><label className={lCls}>Date</label><input type="date" required className={iCls} {...field("date")} /></div>
      </div>
      <div>
        <label className={lCls}>Status</label>
        <select className={iCls} {...field("status")}>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>
      <div><label className={lCls}>Notes (optional)</label><textarea className={`${iCls} resize-none`} rows={2} placeholder="Any notes…" {...field("notes")} /></div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="px-6 py-2.5 bg-[#8B1A1A] hover:bg-[#B22222] text-[#F5F0E8] text-[0.65rem] tracking-[0.3em] uppercase font-['Josefin_Sans'] transition-colors">
          {initial?._id ? "Save Changes" : "Add Sale"}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-2.5 border border-[rgba(255,255,255,0.1)] text-[rgba(245,240,232,0.4)] hover:text-[#F5F0E8] text-[0.65rem] tracking-[0.3em] uppercase font-['Josefin_Sans'] transition-all">
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ─── Sales page ─────────────────────────────────────────────────── */
function SalesPage() {
  const salesData  = useQuery(api.sales.listSales);
  const stats      = useQuery(api.sales.salesStats);
  const createSale = useMutation(api.sales.createSale);
  const updateSale = useMutation(api.sales.updateSale);
  const deleteSale = useMutation(api.sales.deleteSale);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Sale | null>(null);
  const [deleting, setDeleting] = useState<Id<"sales"> | null>(null);

  const handleSave = async (data: Omit<Sale, "_id" | "_creationTime">) => {
    if (editing) { await updateSale({ id: editing._id, ...data }); setEditing(null); }
    else         { await createSale(data); setShowForm(false); }
  };

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Revenue" value={fmtCAD(stats.totalRevenue)} sub={`${stats.completedCount} completed`} gold />
          <StatCard label="Pending"       value={fmtCAD(stats.pendingRevenue)} sub={`${stats.pendingCount} sessions`} />
          <StatCard label="Total Sales"   value={String(stats.total)} sub="all time" />
          <StatCard label="Refunded"      value={String(stats.refundedCount)} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-['Cormorant_Garamond'] font-light text-2xl text-[#F5F0E8]">Sales</h2>
        <button onClick={() => { setShowForm(true); setEditing(null); }}
          className="px-5 py-2.5 bg-[#8B1A1A] hover:bg-[#B22222] text-[#F5F0E8] text-[0.6rem] tracking-[0.3em] uppercase transition-colors">
          + Add Sale
        </button>
      </div>

      {(showForm || editing) && (
        <SaleForm initial={editing ?? undefined} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
      )}

      {deleting && (
        <div className="border border-red-800/40 bg-red-900/10 p-5">
          <p className="text-[rgba(245,240,232,0.8)] text-sm mb-4 font-['Josefin_Sans']">Delete this sale record? This cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => { deleteSale({ id: deleting }); setDeleting(null); }} className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs tracking-widest uppercase">Delete</button>
            <button onClick={() => setDeleting(null)} className="px-4 py-2 border border-[rgba(255,255,255,0.1)] text-[rgba(245,240,232,0.5)] text-xs tracking-widest uppercase hover:text-white">Cancel</button>
          </div>
        </div>
      )}

      {!salesData ? (
        <p className="text-[rgba(245,240,232,0.3)] text-sm">Loading…</p>
      ) : salesData.length === 0 ? (
        <div className="border border-[rgba(255,255,255,0.07)] p-12 text-center">
          <p className="text-[rgba(245,240,232,0.3)] text-sm">No sales yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(201,169,110,0.15)]">
                {["Date","Client","Service","Amount","Status","Notes",""].map((h) => (
                  <th key={h} className="pb-3 text-left text-[0.55rem] tracking-[0.3em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.6)] pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {salesData.map((sale) => (
                <tr key={sale._id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)]">
                  <td className="py-4 pr-4 text-sm text-[rgba(245,240,232,0.5)]">{sale.date}</td>
                  <td className="py-4 pr-4 text-sm text-[#F5F0E8]">{sale.clientName}</td>
                  <td className="py-4 pr-4 text-sm text-[rgba(245,240,232,0.6)]">{sale.service}</td>
                  <td className="py-4 pr-4 font-['Cormorant_Garamond'] text-lg text-[#C9A96E]">{fmtCAD(sale.amount)}</td>
                  <td className="py-4 pr-4"><StatusBadge status={sale.status} /></td>
                  <td className="py-4 pr-4 text-xs text-[rgba(245,240,232,0.35)] max-w-[180px] truncate">{sale.notes}</td>
                  <td className="py-4 text-right">
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => { setEditing(sale as Sale); setShowForm(false); }} className="text-[0.6rem] tracking-widest uppercase text-[rgba(201,169,110,0.5)] hover:text-[#C9A96E] transition-colors">Edit</button>
                      <button onClick={() => setDeleting(sale._id)} className="text-[0.6rem] tracking-widest uppercase text-[rgba(245,76,76,0.4)] hover:text-red-400 transition-colors">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DeployBar />
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
  const [page, setPage]           = useState<Page>("sales");
  const [sidebarOpen, setSidebar] = useState(false);

  // Pending counts for badges
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
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
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
          <a href="/" className="text-[0.6rem] tracking-[0.25em] uppercase font-['Josefin_Sans'] text-[rgba(245,240,232,0.35)] hover:text-[#C9A96E] transition-colors hidden sm:block">
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
            {page === "sales"       && <SalesPage />}
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
