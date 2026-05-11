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

/* ═══════════════════════════════════════════════════════════════════
   REVIEWS
══════════════════════════════════════════════════════════════════════ */
type Review = {
  _id: Id<"reviews">;
  _creationTime: number;
  name: string;
  text: string;
  rating: number;
  date: string;
  image?: string;
  imagegoogle?: string;
  url?: string;
  active: boolean;
  order: number;
};

function ReviewForm({
  initial,
  nextOrder,
  onSave,
  onCancel,
}: {
  initial?: Partial<Review>;
  nextOrder: number;
  onSave: (data: Omit<Review, "_id" | "_creationTime">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name:        initial?.name        ?? "",
    text:        initial?.text        ?? "",
    rating:      initial?.rating      ?? 5,
    date:        initial?.date        ?? new Date().getFullYear().toString(),
    image:       initial?.image       ?? "",
    imagegoogle: initial?.imagegoogle ?? "",
    url:         initial?.url         ?? "",
    active:      initial?.active      ?? true,
    order:       initial?.order       ?? nextOrder,
  });

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(form); }}
      className="border border-[rgba(201,169,110,0.2)] bg-[#0d0d0d] p-6 space-y-5 mb-6"
    >
      <h3 className="font-['Cormorant_Garamond'] font-light text-xl text-[#F5F0E8]">
        {initial?._id ? "Edit Review" : "Add Review"}
      </h3>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Reviewer Name</label>
          <input required className={inputCls} placeholder="e.g. Andy Gaiger" value={form.name} onChange={set("name")} />
        </div>
        <div>
          <label className={labelCls}>Date / Year</label>
          <input required className={inputCls} placeholder="e.g. 2024" value={form.date} onChange={set("date")} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Review Text</label>
        <textarea required className={`${inputCls} resize-none`} rows={4}
          placeholder="The review content…" value={form.text} onChange={set("text")} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Rating (1–5)</label>
          <input type="number" min="1" max="5" required className={inputCls} value={form.rating}
            onChange={(e) => setForm((p) => ({ ...p, rating: parseInt(e.target.value) || 5 }))} />
        </div>
        <div>
          <label className={labelCls}>Local Image Path (optional)</label>
          <input className={inputCls} placeholder="/reviewers/name.png" value={form.image} onChange={set("image")} />
        </div>
        <div>
          <label className={labelCls}>Google Image URL (optional)</label>
          <input className={inputCls} placeholder="https://lh3.googleusercontent.com/…" value={form.imagegoogle} onChange={set("imagegoogle")} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Google Review URL (optional)</label>
          <input className={inputCls} placeholder="https://maps.app.goo.gl/…" value={form.url} onChange={set("url")} />
        </div>
        <div>
          <label className={labelCls}>Display Order</label>
          <input type="number" min="0" className={inputCls} value={form.order}
            onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input id="review-active" type="checkbox" checked={form.active} className="accent-[#C9A96E] w-4 h-4"
          onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />
        <label htmlFor="review-active" className="text-sm text-[rgba(245,240,232,0.7)] font-['Josefin_Sans']">Show on site</label>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit"
          className="px-6 py-2.5 bg-[#8B1A1A] hover:bg-[#B22222] text-[#F5F0E8]
                     text-[0.65rem] tracking-[0.3em] uppercase font-['Josefin_Sans'] transition-colors">
          {initial?._id ? "Save Changes" : "Add Review"}
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

function ReviewsTab() {
  const reviews = useQuery(api.reviews.listReviews);
  const create  = useMutation(api.reviews.createReview);
  const update  = useMutation(api.reviews.updateReview);
  const del     = useMutation(api.reviews.deleteReview);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Review | null>(null);
  const [deleting, setDeleting] = useState<Id<"reviews"> | null>(null);

  const nextOrder = reviews?.length ?? 0;

  const handleSave = async (data: Omit<Review, "_id" | "_creationTime">) => {
    const clean = {
      ...data,
      image:       data.image       || undefined,
      imagegoogle: data.imagegoogle || undefined,
      url:         data.url         || undefined,
    };
    if (editing) {
      await update({ id: editing._id, ...clean });
      setEditing(null);
    } else {
      await create(clean);
      setShowForm(false);
    }
  };

  const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[rgba(245,240,232,0.5)] text-xs font-['Josefin_Sans']">
          Reviews are live — changes appear instantly without a deploy.
        </p>
        <button onClick={() => { setShowForm(true); setEditing(null); }}
          className="px-5 py-2.5 bg-[#8B1A1A] hover:bg-[#B22222] text-[#F5F0E8]
                     text-[0.6rem] tracking-[0.3em] uppercase transition-colors">
          + Add Review
        </button>
      </div>

      {(showForm || editing) && (
        <ReviewForm initial={editing ?? undefined} nextOrder={nextOrder}
          onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
      )}

      {deleting && (
        <div className="border border-red-800/40 bg-red-900/10 p-5">
          <p className="text-[rgba(245,240,232,0.8)] text-sm mb-4 font-['Josefin_Sans']">Delete this review? This cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => { del({ id: deleting }); setDeleting(null); }}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs tracking-widest uppercase">Delete</button>
            <button onClick={() => setDeleting(null)}
              className="px-4 py-2 border border-[rgba(255,255,255,0.1)] text-[rgba(245,240,232,0.5)] text-xs tracking-widest uppercase hover:text-white">Cancel</button>
          </div>
        </div>
      )}

      {!reviews ? (
        <p className="text-[rgba(245,240,232,0.3)] text-sm">Loading…</p>
      ) : reviews.length === 0 ? (
        <div className="border border-[rgba(255,255,255,0.07)] p-12 text-center">
          <p className="text-[rgba(245,240,232,0.3)] text-sm">No reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reviews.map((r) => (
            <div key={r._id}
              className="border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.01)] px-5 py-4 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <span className="text-sm text-[#F5F0E8] font-['Josefin_Sans']">{r.name}</span>
                  <span className="text-[#C9A96E] text-xs">{stars(r.rating)}</span>
                  <span className="text-xs text-[rgba(245,240,232,0.3)] font-['Josefin_Sans']">{r.date}</span>
                  {r.active
                    ? <span className="px-2 py-0.5 text-[0.55rem] tracking-widest uppercase border bg-emerald-900/40 text-emerald-300 border-emerald-700/40">Visible</span>
                    : <span className="px-2 py-0.5 text-[0.55rem] tracking-widest uppercase border bg-zinc-800 text-zinc-400 border-zinc-700">Hidden</span>
                  }
                </div>
                <p className="text-xs text-[rgba(245,240,232,0.5)] font-['Josefin_Sans'] leading-relaxed line-clamp-2">{r.text}</p>
              </div>
              <div className="flex gap-3 flex-shrink-0 mt-1">
                <button onClick={() => { setEditing(r as Review); setShowForm(false); }}
                  className="text-[0.6rem] tracking-widest uppercase text-[rgba(201,169,110,0.5)] hover:text-[#C9A96E] transition-colors">Edit</button>
                <button onClick={() => setDeleting(r._id)}
                  className="text-[0.6rem] tracking-widest uppercase text-[rgba(245,76,76,0.4)] hover:text-red-400 transition-colors">Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FAQs
══════════════════════════════════════════════════════════════════════ */
type FAQ = {
  _id: Id<"faqs">;
  _creationTime: number;
  question: string;
  answer: string;
  order: number;
  active: boolean;
};

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
        <input required className={inputCls} placeholder="e.g. How do I book a session?" value={form.question}
          onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))} />
      </div>

      <div>
        <label className={labelCls}>Answer</label>
        <textarea required className={`${inputCls} resize-y`} rows={6}
          placeholder="The full answer…" value={form.answer}
          onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))} />
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

function FAQsTab() {
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
      <div className="flex items-center justify-between">
        <p className="text-[rgba(245,240,232,0.5)] text-xs font-['Josefin_Sans']">
          FAQs are live — changes appear instantly without a deploy.
        </p>
        <button onClick={() => { setShowForm(true); setEditing(null); }}
          className="px-5 py-2.5 bg-[#8B1A1A] hover:bg-[#B22222] text-[#F5F0E8]
                     text-[0.6rem] tracking-[0.3em] uppercase transition-colors">
          + Add FAQ
        </button>
      </div>

      {(showForm || editing) && (
        <FAQForm initial={editing ?? undefined} nextOrder={nextOrder}
          onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
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
                  <span className="text-[rgba(245,240,232,0.25)] text-xs">{expanded === faq._id ? "▲" : "▼"}</span>
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

/* ═══════════════════════════════════════════════════════════════════
   Combined Page
══════════════════════════════════════════════════════════════════════ */
type Tab = "reviews" | "faqs";

export default function ReviewsFAQAdmin() {
  const [tab, setTab] = useState<Tab>("reviews");

  const tabCls = (t: Tab) =>
    `px-6 py-3 text-[0.6rem] tracking-[0.25em] uppercase font-['Cinzel'] transition-colors ${
      tab === t
        ? "border-b-2 border-[#C9A96E] text-[#C9A96E]"
        : "text-[rgba(245,240,232,0.4)] hover:text-[rgba(245,240,232,0.7)]"
    }`;

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <h2 className="font-['Cormorant_Garamond'] font-light text-2xl text-[#F5F0E8]">
        Reviews &amp; FAQs
      </h2>

      {/* Tab bar */}
      <div className="border-b border-[rgba(255,255,255,0.06)] flex">
        <button className={tabCls("reviews")} onClick={() => setTab("reviews")}>
          ⭐ Reviews
        </button>
        <button className={tabCls("faqs")} onClick={() => setTab("faqs")}>
          ❓ FAQs
        </button>
      </div>

      {/* Tab content */}
      {tab === "reviews" && <ReviewsTab />}
      {tab === "faqs"    && <FAQsTab />}
    </div>
  );
}
