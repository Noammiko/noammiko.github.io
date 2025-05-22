import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  free: defineTable({
    fullName: v.string(),
    artistName: v.optional(v.string()),
    email: v.string(),
    phone: v.string(),
    availableTimes: v.string(),
    recordingType: v.string(),
    otherRecordingType: v.optional(v.string()),
    referralSource: v.optional(v.string()),
    otherReferralSource: v.optional(v.string()),

    approved: v.union(v.boolean(), v.null())
  }),
});
