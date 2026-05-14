"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const inputCls =
  `w-full bg-[#111] border border-[rgba(255,255,255,0.1)] text-[#F5F0E8] px-3 py-2.5
   text-sm font-['Josefin_Sans'] focus:outline-none focus:border-[rgba(201,169,110,0.5)]
   placeholder:text-[rgba(245,240,232,0.2)]`;
const labelCls =
  `block text-[0.6rem] tracking-[0.25em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.7)] mb-1.5`;

const WORK_OPTIONS     = ["Recorded", "Produced", "Mixed & Mastered", "Written"];
const LANGUAGE_OPTIONS = ["English", "Romanian", "Punjabi", "French", "Spanish", "Other"];
const GENRE_OPTIONS    = ["RNB", "Pop", "Pop Rock", "Hip Hop", "Rap", "Afro Beats", "EDM", "Country", "Classical", "Other"];

type PortfolioItem = {
  _id: Id<"portfolio">;
  _creationTime: number;
  client: string;
  title: string;
  file: string;
  work: string[];
  languages: string[];
  genres: string[];
  order: number;
  active: boolean;
};

/* ─── Multi-select chip group ────────────────────────────────────── */
function ChipSelect({
  options,
  selected,
  onChange,
  allowCustom = false,
}: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  allowCustom?: boolean;
}) {
  const [newValue, setNewValue] = useState("");

  const allOptions = [...new Set([...options, ...selected])];

  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt]);

  const addCustom = () => {
    const trimmed = newValue.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setNewValue("");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mt-1">
        {allOptions.map((opt) => (
          <button key={opt} type="button" onClick={() => toggle(opt)}
            className={`px-3 py-1 text-[0.6rem] tracking-widest uppercase font-['Josefin_Sans'] border transition-colors ${
              selected.includes(opt)
                ? "border-[#C9A96E] bg-[rgba(201,169,110,0.12)] text-[#C9A96E]"
                : "border-[rgba(255,255,255,0.1)] text-[rgba(245,240,232,0.4)] hover:border-[rgba(255,255,255,0.25)]"
            }`}>
            {opt}
          </button>
        ))}
      </div>
      {allowCustom && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newValue}
            placeholder="Add custom…"
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
            className="bg-[#111] border border-[rgba(255,255,255,0.1)] text-[#F5F0E8] px-2 py-1
                       text-[0.6rem] font-['Josefin_Sans'] focus:outline-none focus:border-[rgba(201,169,110,0.4)]
                       placeholder:text-[rgba(245,240,232,0.2)] w-32"
          />
          <button type="button" onClick={addCustom}
            className="px-3 py-1 text-[0.6rem] tracking-widest uppercase font-['Josefin_Sans']
                       border border-[rgba(255,255,255,0.1)] text-[rgba(245,240,232,0.4)]
                       hover:border-[rgba(201,169,110,0.4)] hover:text-[#C9A96E] transition-colors">
            + Add
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Metadata fields (shared by upload + edit forms) ───────────── */
type MetaState = {
  client: string;
  title: string;
  work: string[];
  languages: string[];
  genres: string[];
  active: boolean;
};

function MetaFields({
  form,
  setForm,
}: {
  form: MetaState;
  setForm: React.Dispatch<React.SetStateAction<MetaState>>;
}) {
  return (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Client / Artist</label>
          <input required className={inputCls} placeholder="e.g. Josh" value={form.client}
            onChange={(e) => setForm((p) => ({ ...p, client: e.target.value }))} />
        </div>
        <div>
          <label className={labelCls}>Track Title</label>
          <input required className={inputCls} placeholder="e.g. Momento" value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className={labelCls}>Work Types</label>
          <ChipSelect options={WORK_OPTIONS} selected={form.work}
            onChange={(v) => setForm((p) => ({ ...p, work: v }))} />
        </div>
        <div>
          <label className={labelCls}>Languages</label>
          <ChipSelect options={LANGUAGE_OPTIONS} selected={form.languages}
            onChange={(v) => setForm((p) => ({ ...p, languages: v }))} allowCustom />
        </div>
      </div>
      <div>
        <label className={labelCls}>Genres</label>
        <ChipSelect options={GENRE_OPTIONS} selected={form.genres}
          onChange={(v) => setForm((p) => ({ ...p, genres: v }))} allowCustom />
      </div>
      <div className="flex items-center gap-3">
        <input type="checkbox" checked={form.active} className="accent-[#C9A96E] w-4 h-4"
          onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />
        <span className="text-sm text-[rgba(245,240,232,0.7)] font-['Josefin_Sans']">Show on site</span>
      </div>
    </>
  );
}

/* ─── MP3 Upload Form ────────────────────────────────────────────── */
function UploadForm({ nextOrder, onDone }: { nextOrder: number; onDone: () => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uploadToGitHub   = useAction((api as any).githubUpload.uploadToGitHub);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveTrackWithUrl = useMutation((api as any).portfolio.saveTrackWithUrl);

  const fileRef = useRef<HTMLInputElement>(null);
  const [meta, setMeta] = useState<MetaState>({
    client: "", title: "", work: [], languages: [], genres: [], active: true,
  });
  const [status, setStatus] = useState<"idle" | "uploading" | "saving" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { setMsg("Please select an MP3 file."); return; }
    if (!meta.client || !meta.title) { setMsg("Client and title are required."); return; }

    setStatus("uploading"); setMsg("");
    try {
      /* 1. Read file as base64 */
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      /* 2. Upload to GitHub via Convex action */
      const fileUrl = await uploadToGitHub({
        fileName:    file.name,
        fileContent,
        folder:      "portfolio",
      });

      /* 3. Save metadata + GitHub URL in Convex */
      setStatus("saving");
      await saveTrackWithUrl({ file: fileUrl, ...meta, order: nextOrder });
      setStatus("done");
      setMsg("Track uploaded successfully!");
      setMeta({ client: "", title: "", work: [], languages: [], genres: [], active: true });
      if (fileRef.current) fileRef.current.value = "";
      setTimeout(() => { setStatus("idle"); setMsg(""); onDone(); }, 1500);
    } catch (err: any) {
      setStatus("error");
      setMsg(err.message ?? "Upload failed");
    }
  };

  return (
    <form onSubmit={handleUpload}
      className="border border-[rgba(201,169,110,0.2)] bg-[#0d0d0d] p-6 space-y-5 mb-6">
      <h3 className="font-['Cormorant_Garamond'] font-light text-xl text-[#F5F0E8]">Upload New MP3</h3>

      {/* File picker */}
      <div>
        <label className={labelCls}>MP3 File</label>
        <input
          ref={fileRef}
          type="file"
          accept="audio/mpeg,audio/mp3,.mp3"
          required
          className={`${inputCls} file:mr-4 file:py-1.5 file:px-4 file:border-0
                      file:text-[0.6rem] file:tracking-widest file:uppercase file:font-['Josefin_Sans']
                      file:bg-[rgba(201,169,110,0.1)] file:text-[#C9A96E] file:cursor-pointer`}
        />
      </div>

      <MetaFields form={meta} setForm={setMeta} />

      {/* Status / error message */}
      {msg && (
        <p className={`text-xs font-['Josefin_Sans'] ${status === "error" ? "text-red-400" : "text-emerald-400"}`}>
          {status === "uploading" ? "⏳ Uploading file…"
            : status === "saving" ? "⏳ Saving metadata…"
            : msg}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit"
          disabled={status === "uploading" || status === "saving"}
          className="px-6 py-2.5 bg-[#8B1A1A] hover:bg-[#B22222] text-[#F5F0E8]
                     text-[0.65rem] tracking-[0.3em] uppercase font-['Josefin_Sans'] transition-colors disabled:opacity-40">
          {status === "uploading" ? "Uploading…"
            : status === "saving" ? "Saving…"
            : "Upload Track"}
        </button>
        <button type="button" onClick={onDone}
          className="px-6 py-2.5 border border-[rgba(255,255,255,0.1)] text-[rgba(245,240,232,0.4)]
                     hover:text-[#F5F0E8] text-[0.65rem] tracking-[0.3em] uppercase font-['Josefin_Sans'] transition-all">
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ─── Edit Form (for existing items) ────────────────────────────── */
function EditForm({
  item,
  onSave,
  onCancel,
}: {
  item: PortfolioItem;
  onSave: (data: Omit<PortfolioItem, "_id" | "_creationTime">) => void;
  onCancel: () => void;
}) {
  const [meta, setMeta] = useState<MetaState>({
    client:    item.client,
    title:     item.title,
    work:      item.work,
    languages: item.languages,
    genres:    item.genres,
    active:    item.active,
  });
  const [file, setFile]   = useState(item.file);
  const [order, setOrder] = useState(item.order);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave({ ...meta, file, order }); }}
      className="border border-[rgba(201,169,110,0.2)] bg-[#0d0d0d] p-6 space-y-5 mb-6"
    >
      <h3 className="font-['Cormorant_Garamond'] font-light text-xl text-[#F5F0E8]">Edit Track</h3>

      <div>
        <label className={labelCls}>Audio File URL / Path</label>
        <input required className={inputCls} placeholder="/portfolio/01. Josh.mp3" value={file}
          onChange={(e) => setFile(e.target.value)} />
        <p className="text-[0.55rem] text-[rgba(245,240,232,0.25)] font-['Josefin_Sans'] mt-1">
          Path relative to /public or a full GitHub raw URL
        </p>
      </div>

      <MetaFields form={meta} setForm={setMeta} />

      <div>
        <label className={labelCls}>Display Order</label>
        <input type="number" min="0" className={`${inputCls} w-32`} value={order}
          onChange={(e) => setOrder(parseInt(e.target.value) || 0)} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit"
          className="px-6 py-2.5 bg-[#8B1A1A] hover:bg-[#B22222] text-[#F5F0E8]
                     text-[0.65rem] tracking-[0.3em] uppercase font-['Josefin_Sans'] transition-colors">
          Save Changes
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
export default function PortfolioAdmin() {
  const items  = useQuery(api.portfolio.listPortfolio);
  const update = useMutation(api.portfolio.updatePortfolioItem);
  const del    = useMutation(api.portfolio.deletePortfolioItem);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const swapOrder = useMutation((api as any).portfolio.swapOrder);

  const [showUpload, setShowUpload] = useState(false);
  const [editing, setEditing]       = useState<PortfolioItem | null>(null);
  const [deleting, setDeleting]     = useState<Id<"portfolio"> | null>(null);

  const nextOrder = items?.length ?? 0;

  const handleSave = async (data: Omit<PortfolioItem, "_id" | "_creationTime">) => {
    if (editing) {
      await update({ id: editing._id, ...data });
      setEditing(null);
    }
  };

  const moveUp = async (index: number) => {
    if (!items || index === 0) return;
    await swapOrder({ idA: items[index]._id, idB: items[index - 1]._id });
  };

  const moveDown = async (index: number) => {
    if (!items || index === items.length - 1) return;
    await swapOrder({ idA: items[index]._id, idB: items[index + 1]._id });
  };

  return (
    <div className="space-y-6">
      {/* Rebuild note */}
      <div className="border border-[rgba(255,193,7,0.15)] bg-[rgba(255,193,7,0.03)] p-4">
        <p className="text-[0.6rem] tracking-[0.2em] uppercase font-['Cinzel'] text-amber-400/70 mb-1">
          Note
        </p>
        <p className="text-[rgba(245,240,232,0.4)] text-xs font-['Josefin_Sans'] leading-relaxed">
          Portfolio items are stored live in Convex. Audio files are hosted on GitHub — new uploads commit directly to the repo. The deploy button below rebuilds the static portfolio page so changes appear on the site.
        </p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-['Cormorant_Garamond'] font-light text-2xl text-[#F5F0E8]">
          Portfolio Tracks
        </h2>
        <button
          onClick={() => { setShowUpload(true); setEditing(null); }}
          className="px-5 py-2.5 bg-[#8B1A1A] hover:bg-[#B22222] text-[#F5F0E8]
                     text-[0.6rem] tracking-[0.3em] uppercase transition-colors"
        >
          + Upload MP3
        </button>
      </div>

      {/* Upload form */}
      {showUpload && (
        <UploadForm nextOrder={nextOrder} onDone={() => setShowUpload(false)} />
      )}

      {/* Edit form */}
      {editing && (
        <EditForm
          item={editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {/* Delete confirmation */}
      {deleting && (
        <div className="border border-red-800/40 bg-red-900/10 p-5">
          <p className="text-[rgba(245,240,232,0.8)] text-sm mb-4 font-['Josefin_Sans']">Delete this track? This cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => { del({ id: deleting }); setDeleting(null); }}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs tracking-widest uppercase">Delete</button>
            <button onClick={() => setDeleting(null)}
              className="px-4 py-2 border border-[rgba(255,255,255,0.1)] text-[rgba(245,240,232,0.5)] text-xs tracking-widest uppercase hover:text-white">Cancel</button>
          </div>
        </div>
      )}

      {/* Track list */}
      {!items ? (
        <p className="text-[rgba(245,240,232,0.3)] text-sm">Loading…</p>
      ) : items.length === 0 ? (
        <div className="border border-[rgba(255,255,255,0.07)] p-12 text-center">
          <p className="text-[rgba(245,240,232,0.3)] text-sm">No portfolio tracks yet. Upload an MP3 to get started.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {items.map((item, index) => (
            <div key={item._id}
              className="border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(255,255,255,0.02)] transition-colors flex items-center gap-3 px-4 py-3">

              {/* Reorder arrows */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="px-2 py-0.5 text-[0.6rem] text-[rgba(245,240,232,0.25)] hover:text-[#C9A96E] disabled:opacity-20 transition-colors leading-none"
                  title="Move up"
                >▲</button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === items.length - 1}
                  className="px-2 py-0.5 text-[0.6rem] text-[rgba(245,240,232,0.25)] hover:text-[#C9A96E] disabled:opacity-20 transition-colors leading-none"
                  title="Move down"
                >▼</button>
              </div>

              {/* Order badge */}
              <span className="text-xs text-[rgba(245,240,232,0.25)] font-['Josefin_Sans'] w-5 text-right flex-shrink-0">
                {index + 1}
              </span>

              {/* Info */}
              <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
                <p className="text-sm text-[#F5F0E8] font-['Josefin_Sans'] truncate">{item.client}</p>
                <p className="text-sm text-[rgba(245,240,232,0.6)] font-['Josefin_Sans'] truncate">{item.title}</p>
                <p className="text-xs text-[rgba(245,240,232,0.4)] font-['Josefin_Sans'] truncate hidden sm:block">
                  {item.work.join(", ")}
                </p>
                <div className="flex items-center gap-2 hidden sm:flex">
                  {item.active
                    ? <span className="px-2 py-0.5 text-[0.55rem] tracking-widest uppercase border bg-emerald-900/40 text-emerald-300 border-emerald-700/40">Visible</span>
                    : <span className="px-2 py-0.5 text-[0.55rem] tracking-widest uppercase border bg-zinc-800 text-zinc-400 border-zinc-700">Hidden</span>
                  }
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={() => { setEditing(item as PortfolioItem); setShowUpload(false); }}
                  className="text-[0.6rem] tracking-widest uppercase text-[rgba(201,169,110,0.5)] hover:text-[#C9A96E] transition-colors">
                  Edit
                </button>
                <button onClick={() => setDeleting(item._id)}
                  className="text-[0.6rem] tracking-widest uppercase text-[rgba(245,76,76,0.4)] hover:text-red-400 transition-colors">
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
