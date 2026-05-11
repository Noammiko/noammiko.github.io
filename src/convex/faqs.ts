import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* ─── Queries ───────────────────────────────────────────────────── */

/** All FAQs, ordered by display order */
export const listFaqs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("faqs")
      .collect()
      .then((rows) => rows.sort((a, b) => a.order - b.order));
  },
});

/** Only active FAQs — used on the public site */
export const listActiveFaqs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("faqs")
      .filter((q) => q.eq(q.field("active"), true))
      .collect()
      .then((rows) => rows.sort((a, b) => a.order - b.order));
  },
});

/* ─── Mutations ─────────────────────────────────────────────────── */

export const createFaq = mutation({
  args: {
    question: v.string(),
    answer:   v.string(),
    order:    v.number(),
    active:   v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("faqs", args);
  },
});

export const updateFaq = mutation({
  args: {
    id:       v.id("faqs"),
    question: v.optional(v.string()),
    answer:   v.optional(v.string()),
    order:    v.optional(v.number()),
    active:   v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const cleaned = Object.fromEntries(
      Object.entries(fields).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(id, cleaned);
  },
});

export const deleteFaq = mutation({
  args: { id: v.id("faqs") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

/**
 * Seeds the FAQ table with the site's default questions if it is empty.
 * Safe to call multiple times — it's a no-op when FAQs already exist.
 * Returns { seeded: true } when defaults were inserted, { seeded: false } otherwise.
 */
export const seedDefaultFaqs = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("faqs").collect();
    if (existing.length > 0) return { seeded: false };

    const defaults = [
      {
        question: "How do I book a session?",
        answer:
          "Booking is simple — scroll down to the **Book a Session** section on this page and pick your preferred date and time directly from the calendar.\n\nAlternatively, reach out by email or phone to discuss your project first.",
        order:  0,
        active: true,
      },
      {
        question: "How much does it cost?",
        answer:
          "We offer several options to suit different budgets:\n\n- **1 Song Bundle — $119.95** · 2 hours of studio time, 1 professional mix & master\n- **2 Songs Bundle — $199.95** · 4 hours of studio time, 2 professional mixes & masters\n- **Mix & Master Bundle — $74.95** · 1 professional mix and master\n\nIndividual rates: **$29.95/hr** studio time · **$59.95** per mix · **$29.95** per master.\n\nSee the full Prices & Bundles section for details.",
        order:  1,
        active: true,
      },
      {
        question: "How long until I get my mix back?",
        answer:
          "Our standard turnaround for mixes is **24–48 hours** from the end of your recording session.",
        order:  2,
        active: true,
      },
      {
        question: "Can I request changes to the mix?",
        answer:
          "**Absolutely.** Every package includes **unlimited mix and master revisions**. We work with you until you're 100% satisfied with the final result — that's our guarantee.",
        order:  3,
        active: true,
      },
      {
        question: "What equipment does the studio have?",
        answer:
          "We use professional-grade gear throughout:\n\n- **Antelope Audio Edge Solo** — models Neumann U47, U67, U87, AKG C12, Telefunken ELA M 251, Sony C800G, Shure SM7B and more\n- **Shure Beta 58A** and **SE V7 Chrome** microphones\n- **Antelope Audio Zen Q** audio interface\n- **Adam Audio** studio monitors\n- Professional acoustic treatment and dedicated vocal booth\n- Industry-standard DAWs and plugins\n\n**Available instruments:**\n- Fender Strat Guitar · Gretsch G5442TG Hollow Body · Ibanez BTB 5-String Bass\n- Ibanez SDGR 4-String Bass · MIDI keyboard · Classical nylon-string guitar\n\nHave specific gear questions? Just ask before booking.",
        order:  4,
        active: true,
      },
      {
        question: "Do you provide beats and instrumentals?",
        answer:
          "Yes — we offer both existing and custom-produced instrumentals:\n\n- **$49.95** for an existing beat\n- **$99.95** for a custom beat\n\nExclusive rights pricing is negotiable. Contact us to discuss your needs.",
        order:  5,
        active: true,
      },
    ];

    for (const faq of defaults) {
      await ctx.db.insert("faqs", faq);
    }

    return { seeded: true };
  },
});
