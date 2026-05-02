import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  /* ── Existing tables ────────────────────────────────────────────── */

  /** Free trial / session booking submissions */
  free: defineTable({
    fullName:             v.string(),
    artistName:           v.optional(v.string()),
    email:                v.string(),
    phone:                v.string(),
    availableTimes:       v.string(),
    recordingType:        v.string(),
    otherRecordingType:   v.optional(v.string()),
    referralSource:       v.optional(v.string()),
    otherReferralSource:  v.optional(v.string()),
    approved:             v.union(v.boolean(), v.null()),
  }),

  /** Project inquiry submissions */
  inquarys: defineTable({
    fullName:          v.string(),
    artistName:        v.optional(v.string()),
    email:             v.string(),
    phone:             v.string(),
    projectType:       v.string(),
    otherProjectType:  v.optional(v.string()),
    services: v.object({
      vocalRecording:      v.boolean(),
      instrumentRecording: v.boolean(),
      drumKitRecording:    v.boolean(),
      mixing:              v.boolean(),
      mastering:           v.boolean(),
      production:          v.boolean(),
      other:               v.boolean(),
    }),
    otherService:     v.optional(v.string()),
    songCount:        v.number(),
    projectGoal:      v.optional(v.string()),
    completionDate:   v.string(),
    budget:           v.string(),
  }),

  /* ── New: Admin tables ──────────────────────────────────────────── */

  /**
   * Sales / revenue tracking
   * Admin creates entries manually; never exposed publicly.
   */
  sales: defineTable({
    /** Client display name */
    clientName:  v.string(),
    /** Service sold e.g. "1 Song Bundle", "Mix & Master", "Custom Beat" */
    service:     v.string(),
    /** Amount in dollars (USD or CAD) */
    amount:      v.number(),
    /** ISO date string e.g. "2026-05-01" */
    date:        v.string(),
    /** Optional notes visible only in the admin */
    notes:       v.optional(v.string()),
    /**
     * "completed" | "pending" | "refunded"
     */
    status:      v.string(),
  }),
});
