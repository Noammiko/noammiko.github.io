import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* ─── Queries ───────────────────────────────────────────────────── */

/** All custom-quote inquiries, newest first */
export const listInquiries = query({
  args: {},
  handler: async (ctx) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    return await ctx.db.query("inquarys").order("desc").collect();
  },
});

/* ─── Mutations ─────────────────────────────────────────────────── */

/**
 * Update the admin review status on an inquiry.
 * status: "pending" | "contacted" | "quoted" | "closed"
 */
export const updateInquiryStatus = mutation({
  args: {
    id:           v.id("inquarys"),
    reviewStatus: v.string(),
  },
  handler: async (ctx, { id, reviewStatus }) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    await ctx.db.patch(id, {
      reviewStatus,
      reviewedAt: new Date().toISOString().substring(0, 10),
    });
  },
});
