"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const inputCls =
  `w-full bg-[#111] border border-[rgba(255,255,255,0.1)] text-[#F5F0E8] px-3 py-2.5
   text-sm font-['Josefin_Sans'] focus:outline-none focus:border-[rgba(201,169,110,0.5)]
   placeholder:text-[rgba(245,240,232,0.2)]`;
const labelCls =
  `block text-[0.6rem] tracking-[0.25em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.7)] mb-1.5`;

type FAQ = {
  _id: Id<"faqs">;
  _creationTime: number;
  question: string;
  answer: string;
  order: number;
  active: boolean;
};

/* ─── Form ───────────────────────────────────────────────────────── */
function FAQForm({
  initial,
  nextOrder,
  onSave,
  onCancel,
}: {
  initial?: Partial<FAQ>;
  nextOrder: number;
  onSave: (data: Omit<FAQ, "_id" | "_creationTime">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    question: initial?.question ?? "",
    answer:   initial?.answer   ?? "",
    order:    initial?.order    ?? nextOrder,
    active:   initial?.active   ?? true,
  });

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(form); }}
      className="border border-[rgba(201,169,110,0.2)] bg-[#0d0d0d] p-6 space-y-5 mb-6"
    >
      <h3 className="font-['Cormorant_Garamond'] font-light text-xl text-[#F5F0E8]">
        {initial?._id ? "Edit FAQ" : "Add FAQ"}
      </h3>

      <div>
        <label className={labelCls}>Question</label>
        <input
          required
          className={inputCls}
          placeholder="e.g. How do I book a session?"
          value={form.question}
          onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
        />
      </div>

      <div>
        <label className={labelCls}>Answer</label>
        <textarea
          required
          className={`${inputCls} resize-y`}
          rows={6}
          placeholder="The full answer. Supports basic markdown-style bold (**text**) and links."
          value={form.answer}
          onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Display Order</label>
          <input type="number" min="0" className={inputCls} value={form.order}
            onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))} />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.active} className="accent-[#C9A96E] w-4 h-4"
              onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />
            <span className="text-sm text-[rgba(245,240,232,0.7)] font-['Josefin_Sans']">Show on site</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit"
          className="px-6 py-2.5 bg-[#8B1A1A] hover:bg-[#B22222] text-[#F5F0E8]
                     text-[0.65rem] tracking-[0.3em] uppercase font-['Josefin_Sans'] transition-colors">
          {initial?._id ? "Save Changes" : "Add FAQ"}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-2.5 border border-[rgba(255,255,255,0.1)] text-[rgba(245,240,232,0.4)]
                     hover:text-[#F5F0E8] text-[0.65rem] tracking-[0.3em] uppercase font-['Josefin_Sans'] transition-all">
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ─── Main ───────────────────────────────────────────────────────── */
export default function FAQAdmin() {
  const faqs   = useQuery(api.faqs.listFaqs);
  const create = useMutation(api.faqs.createFaq);
  const update = useMutation(api.faqs.updateFaq);
  const del    = useMutation(api.faqs.deleteFaq);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<FAQ | null>(null);
  const [deleting, setDeleting] = useState<Id<"faqs"> | null>(null);
  const [expanded, setExpanded] = useState<Id<"faqs"> | null>(null);

  const nextOrder = faqs?.length ?? 0;

  const handleSave = async (data: Omit<FAQ, "_id" | "_creationTime">) => {
    if (editing) {
      await update({ id: editing._id, ...data });
      setEditing(null);
    } else {
      await create(data);
      setShowForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border border-[rgba(255,193,7,0.12)] bg-[rgba(255,193,7,0.02)] px-4 py-3">
        <p className="text-[0.6rem] tracking-[0.2em] uppercase font-['Cinzel'] text-amber-400/60 mb-0.5">Live Data</p>
        <p className="text-xs text-[rgba(245,240,232,0.4)] font-['Josefin_Sans']">
          FAQs are served live from Convex — changes appear on the site instantly without a rebuild.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-['Cormorant_Garamond'] font-light text-2xl text-[#F5F0E8]">
          FAQ Management
        </h2>
        <button
          onClick={() => { setShowForm(true); setEditing(null); }}
          className="px-5 py-2.5 bg-[#8B1A1A] hover:bg-[#B22222] text-[#F5F0E8]
                     text-[0.6rem] tracking-[0.3em] uppercase transition-colors"
        >
          + Add FAQ
        </button>
      </div>

      {(showForm || editing) && (
        <FAQForm
          initial={editing ?? undefined}
          nextOrder={nextOrder}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {deleting && (
        <div className="border border-red-800/40 bg-red-900/10 p-5">
          <p className="text-[rgba(245,240,232,0.8)] text-sm mb-4 font-['Josefin_Sans']">Delete this FAQ? This cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => { del({ id: deleting }); setDeleting(null); }}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs tracking-widest uppercase">Delete</button>
            <button onClick={() => setDeleting(null)}
              className="px-4 py-2 border border-[rgba(255,255,255,0.1)] text-[rgba(245,240,232,0.5)] text-xs tracking-widest uppercase hover:text-white">Cancel</button>
          </div>
        </div>
      )}

      {!faqs ? (
        <p className="text-[rgba(245,240,232,0.3)] text-sm">Loading…</p>
      ) : faqs.length === 0 ? (
        <div className="border border-[rgba(255,255,255,0.07)] p-12 text-center">
          <p className="text-[rgba(245,240,232,0.3)] text-sm">No FAQs yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {faqs.map((faq) => (
            <div key={faq._id} className="border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.01)]">
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                onClick={() => setExpanded(expanded === faq._id ? null : faq._id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[rgba(245,240,232,0.25)] text-xs font-['Josefin_Sans'] flex-shrink-0 w-5 text-right">{faq.order + 1}.</span>
                  <p className="text-sm text-[#F5F0E8] font-['Josefin_Sans'] truncate">{faq.question}</p>
                  {!faq.active && (
                    <span className="px-2 py-0.5 text-[0.55rem] tracking-widest uppercase border bg-zinc-800 text-zinc-400 border-zinc-700 flex-shrink-0">Hidden</span>
                  )}
                </div>
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); setEditing(faq as FAQ); setShowForm(false); }}
                    className="text-[0.6rem] tracking-widest uppercase text-[rgba(201,169,110,0.5)] hover:text-[#C9A96E] transition-colors">Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); setDeleting(faq._id); }}
                    className="text-[0.6rem] tracking-widest uppercase text-[rgba(245,76,76,0.4)] hover:text-red-400 transition-colors">Del</button>
                  <span className="text-[rgba(245,240,232,0.25)] text-xs">
                    {expanded === faq._id ? "▲" : "▼"}
                  </span>
                </div>
              </div>
              {expanded === faq._id && (
                <div className="border-t border-[rgba(255,255,255,0.05)] px-5 py-4">
                  <p className="text-sm text-[rgba(245,240,232,0.6)] font-['Josefin_Sans'] leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
