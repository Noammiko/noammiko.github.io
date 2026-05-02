"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/* ─── Tiny helpers ──────────────────────────────────────────────── */
const fmtCAD = (n: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n);

const TODAY = new Date().toISOString().substring(0, 10);

/* ─── Types ─────────────────────────────────────────────────────── */
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
    <span
      className={`px-2.5 py-0.5 rounded-full text-[0.6rem] tracking-widest uppercase border font-['Josefin_Sans']
                  ${colours[status] ?? "bg-zinc-800 text-zinc-400 border-zinc-700"}`}
    >
      {status}
    </span>
  );
}

/* ─── Stats card ─────────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  sub,
  gold,
}: {
  label: string;
  value: string;
  sub?: string;
  gold?: boolean;
}) {
  return (
    <div
      className={`border p-6 ${
        gold
          ? "border-[rgba(201,169,110,0.35)] bg-[rgba(201,169,110,0.04)]"
          : "border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)]"
      }`}
    >
      <p className="text-[0.6rem] tracking-[0.3em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.7)] mb-2">
        {label}
      </p>
      <p className={`font-['Cormorant_Garamond'] font-light text-3xl ${gold ? "text-[#C9A96E]" : "text-[#F5F0E8]"}`}>
        {value}
      </p>
      {sub && (
        <p className="text-[rgba(245,240,232,0.35)] text-xs mt-1 font-['Josefin_Sans']">{sub}</p>
      )}
    </div>
  );
}

/* ─── Add / Edit sale form ───────────────────────────────────────── */
function SaleForm({
  initial,
  onSave,
  onCancel,
}: {
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

  const services = [
    "1 Song Bundle",
    "2 Songs Bundle",
    "Mix & Master Bundle",
    "Studio Time (hourly)",
    "Professional Mix",
    "Professional Master",
    "Existing Beat",
    "Custom Beat",
    "Other",
  ];

  const field = (key: keyof typeof form) => ({
    value: String(form[key]),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({
        ...p,
        [key]: key === "amount" ? parseFloat(e.target.value) || 0 : e.target.value,
      })),
  });

  const inputCls = `w-full bg-[#111] border border-[rgba(255,255,255,0.1)] text-[#F5F0E8] px-3 py-2.5
                   text-sm font-['Josefin_Sans'] focus:outline-none focus:border-[rgba(201,169,110,0.5)]
                   placeholder:text-[rgba(245,240,232,0.2)]`;
  const labelCls = `block text-[0.6rem] tracking-[0.25em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.7)] mb-1.5`;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="border border-[rgba(201,169,110,0.2)] bg-[#0d0d0d] p-6 space-y-5"
    >
      <h3 className="font-['Cormorant_Garamond'] font-light text-xl text-[#F5F0E8] mb-4">
        {initial ? "Edit Sale" : "New Sale"}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Client Name</label>
          <input required className={inputCls} placeholder="Artist / Client" {...field("clientName")} />
        </div>
        <div>
          <label className={labelCls}>Service</label>
          <select required className={inputCls} {...field("service")}>
            <option value="">Select a service…</option>
            {services.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Amount (CAD $)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            className={inputCls}
            placeholder="0.00"
            value={form.amount === 0 ? "" : form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <label className={labelCls}>Date</label>
          <input type="date" required className={inputCls} {...field("date")} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Status</label>
        <select className={inputCls} {...field("status")}>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Notes (optional)</label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={2}
          placeholder="Any notes…"
          {...field("notes")}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="px-6 py-2.5 bg-[#8B1A1A] hover:bg-[#B22222] text-[#F5F0E8]
                     text-[0.65rem] tracking-[0.3em] uppercase font-['Josefin_Sans'] transition-colors"
        >
          {initial ? "Save Changes" : "Add Sale"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-[rgba(255,255,255,0.1)] text-[rgba(245,240,232,0.5)]
                     hover:border-[rgba(255,255,255,0.25)] hover:text-[#F5F0E8]
                     text-[0.65rem] tracking-[0.3em] uppercase font-['Josefin_Sans'] transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ─── Deploy panel ───────────────────────────────────────────────── */
function DeployPanel() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const triggerDeploy = async (type: string) => {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/trigger-deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("success");
      setMessage(`Deploy triggered (${type}). Site will rebuild in ~2–3 minutes.`);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message ?? "Unknown error");
    }
  };

  const sections = [
    {
      id:    "portfolio",
      label: "Portfolio",
      desc:  "Updates the audio portfolio track list. Edit src/assets/protfolio.json then deploy.",
    },
    {
      id:    "music",
      label: "My Music",
      desc:  "Updates the My Music section. Edit src/assets/myMusic.json then deploy.",
    },
    {
      id:    "pricing",
      label: "Pricing",
      desc:  "Updates bundle prices & seasonal offer. Edit src/data/pricing.json then deploy.",
    },
    {
      id:    "full",
      label: "Full Rebuild",
      desc:  "Triggers a complete site rebuild — use if multiple things changed.",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="border border-[rgba(255,193,7,0.15)] bg-[rgba(255,193,7,0.03)] p-4 mb-6">
        <p className="text-[0.65rem] tracking-[0.2em] uppercase font-['Cinzel'] text-amber-400/70 mb-1">
          How it works
        </p>
        <p className="text-[rgba(245,240,232,0.45)] text-xs font-['Josefin_Sans'] leading-relaxed">
          Edit the JSON / MDX source files (portfolio, pricing, FAQ etc.) locally or via the file
          system, then click the corresponding Deploy button below. This triggers a GitHub Actions
          workflow that rebuilds and redeploys the static site. Sales data is always live and
          doesn't require a rebuild.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {sections.map((s) => (
          <div
            key={s.id}
            className="border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-5"
          >
            <p className="text-[0.6rem] tracking-[0.3em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.7)] mb-1">
              {s.label}
            </p>
            <p className="text-[rgba(245,240,232,0.4)] text-xs font-['Josefin_Sans'] mb-4 leading-relaxed">
              {s.desc}
            </p>
            <button
              onClick={() => triggerDeploy(s.id)}
              disabled={status === "loading"}
              className="px-4 py-2 border border-[rgba(201,169,110,0.3)] text-[#C9A96E]
                         hover:bg-[#C9A96E] hover:text-[#080808]
                         text-[0.6rem] tracking-[0.25em] uppercase font-['Josefin_Sans']
                         transition-all duration-200 disabled:opacity-40"
            >
              {status === "loading" ? "Deploying…" : `Deploy ${s.label}`}
            </button>
          </div>
        ))}
      </div>

      {message && (
        <div
          className={`mt-4 p-4 text-xs font-['Josefin_Sans'] border ${
            status === "success"
              ? "border-emerald-700/30 bg-emerald-900/20 text-emerald-300"
              : "border-red-700/30 bg-red-900/20 text-red-300"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}

/* ─── Main dashboard ─────────────────────────────────────────────── */
export function AdminDashboard() {
  const salesData  = useQuery(api.sales.listSales);
  const stats      = useQuery(api.sales.salesStats);
  const createSale = useMutation(api.sales.createSale);
  const updateSale = useMutation(api.sales.updateSale);
  const deleteSale = useMutation(api.sales.deleteSale);

  const [tab, setTab]         = useState<"sales" | "deploy">("sales");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Sale | null>(null);
  const [deleting, setDeleting] = useState<Id<"sales"> | null>(null);

  const handleSave = async (data: Omit<Sale, "_id" | "_creationTime">) => {
    if (editing) {
      await updateSale({ id: editing._id, ...data });
      setEditing(null);
    } else {
      await createSale(data);
    }
    setShowForm(false);
  };

  const handleDelete = async (id: Id<"sales">) => {
    await deleteSale({ id });
    setDeleting(null);
  };

  const tabCls = (t: typeof tab) =>
    `px-6 py-3 text-[0.65rem] tracking-[0.25em] uppercase font-['Cinzel'] transition-colors duration-200 ${
      tab === t
        ? "border-b-2 border-[#C9A96E] text-[#C9A96E]"
        : "text-[rgba(245,240,232,0.4)] hover:text-[rgba(245,240,232,0.7)]"
    }`;

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F0E8] font-['Josefin_Sans']">
      {/* Header */}
      <div className="border-b border-[rgba(201,169,110,0.15)] px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[0.6rem] tracking-[0.4em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.6)] mb-1">
              Admin
            </p>
            <h1 className="font-['Cormorant_Garamond'] font-light text-3xl text-[#F5F0E8]">
              Miko Recording Studio
            </h1>
          </div>
          <a
            href="/"
            className="text-[0.6rem] tracking-[0.25em] uppercase font-['Josefin_Sans']
                       text-[rgba(245,240,232,0.4)] hover:text-[#C9A96E] transition-colors"
          >
            ← Back to Site
          </a>
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="border-b border-[rgba(255,255,255,0.06)] px-8 py-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Revenue"
              value={fmtCAD(stats.totalRevenue)}
              sub={`${stats.completedCount} completed`}
              gold
            />
            <StatCard
              label="Pending"
              value={fmtCAD(stats.pendingRevenue)}
              sub={`${stats.pendingCount} sessions`}
            />
            <StatCard
              label="Total Sales"
              value={String(stats.total)}
              sub="all time"
            />
            <StatCard
              label="Refunded"
              value={String(stats.refundedCount)}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[rgba(255,255,255,0.06)] px-8">
        <div className="max-w-7xl mx-auto flex">
          <button className={tabCls("sales")}  onClick={() => setTab("sales")}>Sales</button>
          <button className={tabCls("deploy")} onClick={() => setTab("deploy")}>Deploy</button>
        </div>
      </div>

      {/* Tab content */}
      <div className="px-8 py-8">
        <div className="max-w-7xl mx-auto">

          {/* ── SALES TAB ──────────────────────────────────────── */}
          {tab === "sales" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Cormorant_Garamond'] font-light text-2xl text-[#F5F0E8]">
                  Sales
                </h2>
                <button
                  onClick={() => { setShowForm(true); setEditing(null); }}
                  className="px-5 py-2.5 bg-[#8B1A1A] hover:bg-[#B22222] text-[#F5F0E8]
                             text-[0.6rem] tracking-[0.3em] uppercase transition-colors"
                >
                  + Add Sale
                </button>
              </div>

              {/* Form */}
              {(showForm || editing) && (
                <div className="mb-8">
                  <SaleForm
                    initial={editing ?? undefined}
                    onSave={handleSave}
                    onCancel={() => { setShowForm(false); setEditing(null); }}
                  />
                </div>
              )}

              {/* Delete confirmation */}
              {deleting && (
                <div className="mb-6 border border-red-800/40 bg-red-900/10 p-5">
                  <p className="text-[rgba(245,240,232,0.8)] text-sm mb-4 font-['Josefin_Sans']">
                    Delete this sale record? This cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDelete(deleting)}
                      className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs tracking-widest uppercase transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleting(null)}
                      className="px-4 py-2 border border-[rgba(255,255,255,0.1)] text-[rgba(245,240,232,0.5)] text-xs tracking-widest uppercase hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Sales table */}
              {!salesData ? (
                <p className="text-[rgba(245,240,232,0.3)] text-sm">Loading sales…</p>
              ) : salesData.length === 0 ? (
                <div className="border border-[rgba(255,255,255,0.07)] p-12 text-center">
                  <p className="text-[rgba(245,240,232,0.3)] text-sm">No sales recorded yet.</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 text-[#C9A96E] text-xs tracking-widest uppercase hover:text-[#E8C98A] transition-colors"
                  >
                    Add your first sale →
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[rgba(201,169,110,0.15)]">
                        {["Date", "Client", "Service", "Amount", "Status", "Notes", ""].map((h) => (
                          <th
                            key={h}
                            className="pb-3 text-left text-[0.55rem] tracking-[0.3em] uppercase font-['Cinzel']
                                       text-[rgba(201,169,110,0.6)] pr-4 first:pl-0"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.map((sale) => (
                        <tr
                          key={sale._id}
                          className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)]"
                        >
                          <td className="py-4 pr-4 text-sm text-[rgba(245,240,232,0.5)]">{sale.date}</td>
                          <td className="py-4 pr-4 text-sm text-[#F5F0E8]">{sale.clientName}</td>
                          <td className="py-4 pr-4 text-sm text-[rgba(245,240,232,0.6)]">{sale.service}</td>
                          <td className="py-4 pr-4 font-['Cormorant_Garamond'] text-lg text-[#C9A96E]">
                            {fmtCAD(sale.amount)}
                          </td>
                          <td className="py-4 pr-4">
                            <StatusBadge status={sale.status} />
                          </td>
                          <td className="py-4 pr-4 text-xs text-[rgba(245,240,232,0.35)] max-w-[180px] truncate">
                            {sale.notes}
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex gap-3 justify-end">
                              <button
                                onClick={() => { setEditing(sale as Sale); setShowForm(false); }}
                                className="text-[0.6rem] tracking-widest uppercase text-[rgba(201,169,110,0.5)]
                                           hover:text-[#C9A96E] transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleting(sale._id)}
                                className="text-[0.6rem] tracking-widest uppercase text-[rgba(245,76,76,0.4)]
                                           hover:text-red-400 transition-colors"
                              >
                                Del
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── DEPLOY TAB ─────────────────────────────────────── */}
          {tab === "deploy" && (
            <div>
              <div className="mb-6">
                <h2 className="font-['Cormorant_Garamond'] font-light text-2xl text-[#F5F0E8] mb-1">
                  Deploy
                </h2>
                <p className="text-[rgba(245,240,232,0.35)] text-xs font-['Josefin_Sans'] tracking-wide">
                  Trigger a GitHub Actions rebuild for static content changes
                </p>
              </div>
              <DeployPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
