import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* ─── Queries ───────────────────────────────────────────────────── */

/** All sales, newest first */
export const listSales = query({
  args: {},
  handler: async (ctx) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    return await ctx.db
      .query("sales")
      .order("desc")
      .collect();
  },
});

/** Aggregate totals for the admin dashboard */
export const salesStats = query({
  args: {},
  handler: async (ctx) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    const all = await ctx.db.query("sales").collect();

    const completed = all.filter((s) => s.status === "completed");
    const pending   = all.filter((s) => s.status === "pending");
    const refunded  = all.filter((s) => s.status === "refunded");

    const totalRevenue   = completed.reduce((sum, s) => sum + s.amount, 0);
    const pendingRevenue = pending.reduce((sum, s) => sum + s.amount, 0);

    // Revenue by month (last 6 months)
    const now      = new Date();
    const byMonth: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      byMonth[key] = 0;
    }
    completed.forEach((s) => {
      const month = s.date.substring(0, 7);
      if (month in byMonth) byMonth[month] += s.amount;
    });

    return {
      total:          all.length,
      completedCount: completed.length,
      pendingCount:   pending.length,
      refundedCount:  refunded.length,
      totalRevenue,
      pendingRevenue,
      byMonth,
    };
  },
});

/* ─── Mutations ─────────────────────────────────────────────────── */

/** Create a new sale record */
export const createSale = mutation({
  args: {
    clientName: v.string(),
    service:    v.string(),
    amount:     v.number(),
    date:       v.string(),
    notes:      v.optional(v.string()),
    status:     v.string(),
  },
  handler: async (ctx, args) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    return await ctx.db.insert("sales", args);
  },
});

/** Update a sale's status or fields */
export const updateSale = mutation({
  args: {
    id:         v.id("sales"),
    clientName: v.optional(v.string()),
    service:    v.optional(v.string()),
    amount:     v.optional(v.number()),
    date:       v.optional(v.string()),
    notes:      v.optional(v.string()),
    status:     v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    const cleaned = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, cleaned);
  },
});

/** Delete a sale */
export const deleteSale = mutation({
  args: { id: v.id("sales") },
  handler: async (ctx, { id }) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    await ctx.db.delete(id);
  },
});
