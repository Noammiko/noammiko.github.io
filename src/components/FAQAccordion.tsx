"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Minus } from "lucide-react";

export interface FAQItem {
  id: string;
  question: string;
  answer: string; // raw HTML from MDX compiledContent
}

interface FAQAccordionProps {
  faqs: FAQItem[];
}

function AccordionItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: FAQItem;
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
        <span
          className="font-['Cormorant_Garamond'] font-light text-xl md:text-2xl tracking-wide
                     text-[rgba(245,240,232,0.9)] group-hover:text-[#F5F0E8] transition-colors duration-200"
        >
          {faq.question}
        </span>
        <span
          className={`flex-shrink-0 mt-1 w-5 h-5 transition-colors duration-200
                      ${isOpen ? "text-[#C9A96E]" : "text-[rgba(201,169,110,0.5)] group-hover:text-[#C9A96E]"}`}
        >
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </button>

      {/* Animated body */}
      <div
        ref={bodyRef}
        style={{
          maxHeight: isOpen ? (bodyRef.current?.scrollHeight ?? 0) + "px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.42s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          className="pb-8 text-[rgba(245,240,232,0.6)] text-base leading-relaxed
                     font-['Josefin_Sans'] font-light tracking-wide faq-prose"
          dangerouslySetInnerHTML={{ __html: faq.answer }}
        />
      </div>
    </div>
  );
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="divide-y-0">
      {faqs.map((faq) => (
        <AccordionItem
          key={faq.id}
          faq={faq}
          isOpen={openId === faq.id}
          onToggle={() => toggle(faq.id)}
        />
      ))}
    </div>
  );
}
