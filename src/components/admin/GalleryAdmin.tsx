"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const inputCls =
  `w-full bg-[#111] border border-[rgba(255,255,255,0.1)] text-[#F5F0E8] px-3 py-2.5
   text-sm font-['Josefin_Sans'] focus:outline-none focus:border-[rgba(201,169,110,0.5)]
   placeholder:text-[rgba(245,240,232,0.2)]`;
const labelCls =
  `block text-[0.6rem] tracking-[0.25em] uppercase font-['Cinzel'] text-[rgba(201,169,110,0.7)] mb-1.5`;

type GalleryItem = {
  _id:             Id<"gallery">;
  _creationTime:   number;
  alt:             string;
  caption?:        string;
  imageUrl:        string;
  order:           number;
  active:          boolean;
};

/* ─── Image Upload Form ──────────────────────────────────────────── */
function UploadForm({ nextOrder, onDone }: { nextOrder: number; onDone: () => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generateUploadUrl  = useMutation((api as any).gallery.generateUploadUrl);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveUploadedImage  = useMutation((api as any).gallery.saveUploadedImage);

  const fileRef = useRef<HTMLInputElement>(null);
  const [alt,     setAlt]     = useState("");
  const [caption, setCaption] = useState("");
  const [active,  setActive]  = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [status,  setStatus]  = useState<"idle" | "uploading" | "saving" | "done" | "error">("idle");
  const [msg,     setMsg]     = useState("");

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) { setPreview(null); return; }
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { setMsg("Please select an image file."); return; }
    if (!alt.trim()) { setMsg("Alt text is required."); return; }

    setStatus("uploading"); setMsg("");
    try {
      const uploadUrl = await generateUploadUrl();

      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
      const { storageId } = await res.json();

      setStatus("saving");
      await saveUploadedImage({
        storageId,
        alt:     alt.trim(),
        caption: caption.trim() || undefined,
        order:   nextOrder,
        active,
      });
      setStatus("done");
      setMsg("Image uploaded!");
      setAlt(""); setCaption(""); setActive(true); setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      setTimeout(() => { setStatus("idle"); setMsg(""); onDone(); }, 1200);
    } catch (err: any) {
      setStatus("error");
      setMsg(err.message ?? "Upload failed");
    }
  };

  return (
    <form onSubmit={handleUpload}
      className="border border-[rgba(201,169,110,0.2)] bg-[#0d0d0d] p-6 space-y-5 mb-6">
      <h3 className="font-['Cormorant_Garamond'] font-light text-xl text-[#F5F0E8]">Upload Image</h3>

      {/* File picker + preview */}
      <div className="grid sm:grid-cols-2 gap-4 items-start">
        <div>
          <label className={labelCls}>Image File</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            required
            onChange={onFileChange}
            className={`${inputCls} file:mr-4 file:py-1.5 file:px-4 file:border-0
                        file:text-[0.6rem] file:tracking-widest file:uppercase file:font-['Josefin_Sans']
                        file:bg-[rgba(201,169,110,0.1)] file:text-[#C9A96E] file:cursor-pointer`}
          />
        </div>
        {preview && (
          <div className="aspect-video overflow-hidden bg-black">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Alt + Caption */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Alt Text <span className="text-red-400">*</span></label>
          <input required className={inputCls} placeholder="e.g. Recording booth"
            value={alt} onChange={(e) => setAlt(e.target.value)} />
          <p className="text-[0.5rem] text-[rgba(245,240,232,0.25)] font-['Josefin_Sans'] mt-1">
            Shown to screen readers and on broken image
          </p>
        </div>
        <div>
          <label className={labelCls}>Caption <span className="opacity-40">(optional)</span></label>
          <input className={inputCls} placeholder="e.g. Antelope Audio interface"
            value={caption} onChange={(e) => setCaption(e.target.value)} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" checked={active} className="accent-[#C9A96E] w-4 h-4"
          onChange={(e) => setActive(e.target.checked)} />
        <span className="text-sm text-[rgba(245,240,232,0.7)] font-['Josefin_Sans']">Show on site</span>
      </div>

      {msg && (
        <p className={`text-xs font-['Josefin_Sans'] ${status === "error" ? "text-red-400" : "text-emerald-400"}`}>
          {status === "uploading" ? "⏳ Uploading image…"
            : status === "saving" ? "⏳ Saving…"
            : msg}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit"
          disabled={status === "uploading" || status === "saving"}
          className="px-6 py-2.5 bg-[#8B1A1A] hover:bg-[#B22222] text-[#F5F0E8]
                     text-[0.65rem] tracking-[0.3em] uppercase font-['Josefin_Sans'] transition-colors disabled:opacity-40">
          {status === "uploading" ? "Uploading…" : status === "saving" ? "Saving…" : "Upload Image"}
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

/* ─── Edit Form ──────────────────────────────────────────────────── */
function EditForm({
  item,
  onSave,
  onCancel,
}: {
  item: GalleryItem;
  onSave: (data: Pick<GalleryItem, "alt" | "caption" | "imageUrl" | "order" | "active">) => void;
  onCancel: () => void;
}) {
  const [alt,      setAlt]      = useState(item.alt);
  const [caption,  setCaption]  = useState(item.caption ?? "");
  const [imageUrl, setImageUrl] = useState(item.imageUrl);
  const [order,    setOrder]    = useState(item.order);
  const [active,   setActive]   = useState(item.active);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ alt: alt.trim(), caption: caption.trim() || undefined, imageUrl, order, active });
      }}
      className="border border-[rgba(201,169,110,0.2)] bg-[#0d0d0d] p-6 space-y-5 mb-6"
    >
      <h3 className="font-['Cormorant_Garamond'] font-light text-xl text-[#F5F0E8]">Edit Image</h3>

      {/* Current image preview */}
      <div className="aspect-video max-w-xs overflow-hidden bg-black">
        <img src={imageUrl} alt={alt} className="w-full h-full object-cover" />
      </div>

      <div>
        <label className={labelCls}>Image URL</label>
        <input required className={inputCls} value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)} />
        <p className="text-[0.5rem] text-[rgba(245,240,232,0.25)] font-['Josefin_Sans'] mt-1">
          Convex Storage URL or public path (e.g. /galary/1.jpeg). To replace the image, delete this entry and upload a new one.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Alt Text <span className="text-red-400">*</span></label>
          <input required className={inputCls} value={alt} onChange={(e) => setAlt(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Caption <span className="opacity-40">(optional)</span></label>
          <input className={inputCls} value={caption} onChange={(e) => setCaption(e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 items-end">
        <div>
          <label className={labelCls}>Display Order</label>
          <input type="number" min="0" className={`${inputCls} w-32`} value={order}
            onChange={(e) => setOrder(parseInt(e.target.value) || 0)} />
        </div>
        <div className="flex items-center gap-3 pb-1">
          <input type="checkbox" checked={active} className="accent-[#C9A96E] w-4 h-4"
            onChange={(e) => setActive(e.target.checked)} />
          <span className="text-sm text-[rgba(245,240,232,0.7)] font-['Josefin_Sans']">Show on site</span>
        </div>
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
export default function GalleryAdmin() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items     = useQuery((api as any).gallery.listGallery) as GalleryItem[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update    = useMutation((api as any).gallery.updateGalleryItem);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const del       = useMutation((api as any).gallery.deleteGalleryItem);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const swapOrder = useMutation((api as any).gallery.swapOrder);

  const [showUpload, setShowUpload] = useState(false);
  const [editing,    setEditing]    = useState<GalleryItem | null>(null);
  const [deleting,   setDeleting]   = useState<Id<"gallery"> | null>(null);

  const nextOrder = items?.length ?? 0;

  const handleSave = async (data: Pick<GalleryItem, "alt" | "caption" | "imageUrl" | "order" | "active">) => {
    if (!editing) return;
    await update({ id: editing._id, ...data });
    setEditing(null);
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
      {/* Note */}
      <div className="border border-[rgba(255,193,7,0.15)] bg-[rgba(255,193,7,0.03)] p-4">
        <p className="text-[0.6rem] tracking-[0.2em] uppercase font-['Cinzel'] text-amber-400/70 mb-1">Note</p>
        <p className="text-[rgba(245,240,232,0.4)] text-xs font-['Josefin_Sans'] leading-relaxed">
          Gallery images are baked into the site at build time. Use the Deploy button below to publish changes.
          The 7 default photos are served from <code className="text-[rgba(201,169,110,0.6)]">/galary/</code> — new uploads go to Convex Storage.
        </p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-['Cormorant_Garamond'] font-light text-2xl text-[#F5F0E8]">
          Gallery
        </h2>
        <button
          onClick={() => { setShowUpload(true); setEditing(null); }}
          className="px-5 py-2.5 bg-[#8B1A1A] hover:bg-[#B22222] text-[#F5F0E8]
                     text-[0.6rem] tracking-[0.3em] uppercase transition-colors"
        >
          + Upload Image
        </button>
      </div>

      {showUpload && <UploadForm nextOrder={nextOrder} onDone={() => setShowUpload(false)} />}

      {editing && (
        <EditForm item={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      )}

      {deleting && (
        <div className="border border-red-800/40 bg-red-900/10 p-5">
          <p className="text-[rgba(245,240,232,0.8)] text-sm mb-4 font-['Josefin_Sans']">
            Delete this image? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => { del({ id: deleting }); setDeleting(null); }}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs tracking-widest uppercase">
              Delete
            </button>
            <button onClick={() => setDeleting(null)}
              className="px-4 py-2 border border-[rgba(255,255,255,0.1)] text-[rgba(245,240,232,0.5)] text-xs tracking-widest uppercase hover:text-white">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Image list */}
      {!items ? (
        <p className="text-[rgba(245,240,232,0.3)] text-sm">Loading…</p>
      ) : items.length === 0 ? (
        <div className="border border-[rgba(255,255,255,0.07)] p-12 text-center">
          <p className="text-[rgba(245,240,232,0.3)] text-sm">No gallery images yet. Upload one to get started.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {items.map((item, index) => (
            <div key={item._id}
              className="border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(255,255,255,0.02)] transition-colors flex items-center gap-3 px-4 py-3">

              {/* Reorder arrows */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button onClick={() => moveUp(index)} disabled={index === 0}
                  className="px-2 py-0.5 text-[0.6rem] text-[rgba(245,240,232,0.25)] hover:text-[#C9A96E] disabled:opacity-20 transition-colors leading-none"
                  title="Move up">▲</button>
                <button onClick={() => moveDown(index)} disabled={index === items.length - 1}
                  className="px-2 py-0.5 text-[0.6rem] text-[rgba(245,240,232,0.25)] hover:text-[#C9A96E] disabled:opacity-20 transition-colors leading-none"
                  title="Move down">▼</button>
              </div>

              {/* Order badge */}
              <span className="text-xs text-[rgba(245,240,232,0.25)] font-['Josefin_Sans'] w-5 text-right flex-shrink-0">
                {item.order + 1}
              </span>

              {/* Thumbnail */}
              <div className="w-16 h-12 flex-shrink-0 overflow-hidden bg-black">
                <img src={item.imageUrl} alt={item.alt} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-3 gap-2 items-center">
                <p className="text-sm text-[#F5F0E8] font-['Josefin_Sans'] truncate">{item.alt}</p>
                <p className="text-xs text-[rgba(245,240,232,0.4)] font-['Josefin_Sans'] truncate hidden sm:block">
                  {item.caption || <span className="opacity-40 italic">no caption</span>}
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
                  onClick={() => { setEditing(item); setShowUpload(false); }}
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
