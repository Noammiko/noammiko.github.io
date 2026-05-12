"use client";

/**
 * FAQLive — reads FAQs from Convex so they update without a rebuild.
 * Uses the same accordion styling as FAQAccordion.tsx.
 * Answers are stored as plain text in Convex; basic formatting is applied:
 *   **bold**, *italic*, and line breaks are rendered.
 */

import { useState, useRef, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { withConvexProvider } from "@/lib/convex";

/* ─── Simple plain-text → HTML renderer ─────────────────────────── */
function renderAnswer(text: string): string {
  return text
    // Bold: **text**
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic: *text* (avoid matching **)
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    // Newlines → <br>
    .replace(/\n/g, "<br />");
}

/* ─── Single accordion item ──────────────────────────────────────── */
function AccordionItem({
  id,
  question,
  answer,
  isOpen,
  onToggle,
}: {
  id: string;
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border-b border-[rgba(201,169,110,0.15)] last:border-b-0">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-start justify-between py-7 text-left gap-6 group focus:outline-none"
      >
        <span className="font-['Cormorant_Garamond'] font-light text-xl md:text-2xl tracking-wide text-[rgba(245,240,232,0.9)] group-hover:text-[#F5F0E8] transition-colors duration-200">
          {question}
        </span>
        <span className={`flex-shrink-0 mt-1 w-5 h-5 transition-colors duration-200 ${isOpen ? "text-[#C9A96E]" : "text-[rgba(201,169,110,0.5)] group-hover:text-[#C9A96E]"}`}>
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </button>

      <div
        ref={bodyRef}
        style={{
          maxHeight: isOpen ? (bodyRef.current?.scrollHeight ?? 600) + "px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.42s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          className="pb-8 text-[rgba(245,240,232,0.6)] text-base leading-relaxed font-['Josefin_Sans'] font-light tracking-wide faq-prose"
          dangerouslySetInnerHTML={{ __html: renderAnswer(answer) }}
        />
      </div>
    </div>
  );
}

/* ─── Inner component ────────────────────────────────────────────── */
function FAQInner() {
  const faqs  = useQuery(api.faqs.listActiveFaqs);
  const [openId, setOpenId] = useState<string | null>(null);
  const didInit = useRef(false);

  // Open the first item once data arrives — only on first load
  useEffect(() => {
    if (faqs && faqs.length > 0 && !didInit.current) {
      didInit.current = true;
      setOpenId(faqs[0]._id);
    }
  }, [faqs]);

  if (!faqs) return null; // render nothing while loading (section shell is already visible)
  if (faqs.length === 0) return null;

  return (
    <div className="divide-y-0">
      {faqs.map((faq) => (
        <AccordionItem
          key={faq._id}
          id={faq._id}
          question={faq.question}
          answer={faq.answer}
          isOpen={openId === faq._id}
          onToggle={() => setOpenId((p) => (p === faq._id ? null : faq._id))}
        />
      ))}
    </div>
  );
}

export default withConvexProvider(FAQInner);
