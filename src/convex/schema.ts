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
    /** Admin review workflow */
    reviewStatus:     v.optional(v.string()),
    reviewedAt:       v.optional(v.string()),
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

  /** Promotional discounts shown on the pricing page */
  discounts: defineTable({
    name:            v.string(),
    description:     v.optional(v.string()),
    discountPercent: v.number(),
    /** ISO date string e.g. "2026-05-01" */
    validFrom:       v.optional(v.string()),
    /** ISO date string e.g. "2026-06-01" */
    validUntil:      v.optional(v.string()),
    active:          v.boolean(),
    badgeText:       v.optional(v.string()),
  }),

  /** Portfolio audio tracks */
  portfolio: defineTable({
    client:    v.string(),
    title:     v.string(),
    /** Path like /portfolio/01.mp3 */
    file:      v.string(),
    /** e.g. ["Mixed", "Mastered"] */
    work:      v.array(v.string()),
    languages: v.array(v.string()),
    genres:    v.array(v.string()),
    order:     v.number(),
    active:    v.boolean(),
  }),

  /** Client reviews / testimonials */
  reviews: defineTable({
    name:        v.string(),
    text:        v.string(),
    rating:      v.number(),
    date:        v.string(),
    image:       v.optional(v.string()),
    imagegoogle: v.optional(v.string()),
    url:         v.optional(v.string()),
    active:      v.boolean(),
    order:       v.number(),
  }),

  /** Frequently asked questions */
  faqs: defineTable({
    question: v.string(),
    answer:   v.string(),
    order:    v.number(),
    active:   v.boolean(),
  }),

  /** Singleton: free trial feature settings */
  freeSettings: defineTable({
    enabled:     v.boolean(),
    weeklySlots: v.number(),
  }),

  /** Singleton: music / Spotify settings */
  musicSettings: defineTable({
    featuredTitle:    v.string(),
    featuredTrackUrl: v.string(),
    promotingTracks:  v.array(v.string()),
    discographyUrls:  v.array(v.string()),
  }),

  /**
   * Singleton: pricing page configuration.
   * baseBundles/saleBundles are the active fields; legacy `bundles` kept for compat.
   */
  pricingConfig: defineTable({
    /** Whether the sale banner is active */
    saleActive:    v.boolean(),
    /** Sale headline e.g. "Spring Sale" */
    saleName:      v.optional(v.string()),
    /** ISO datetime when the sale starts */
    saleStartDate: v.optional(v.string()),
    /** ISO datetime the countdown timer counts toward */
    saleEndDate:   v.optional(v.string()),
    /**
     * Bundles included in the active sale.
     * Only present when admin has configured a sale.
     * Each entry references a base bundle by its id from pricing.json.
     */
    saleBundles: v.optional(v.array(v.object({
      bundleId:        v.string(),
      salePrice:       v.number(),
      discountPercent: v.optional(v.number()),
    }))),
    /** Legacy field — full bundle cards from old admin UI. No longer written; kept so old docs stay valid. */
    bundles: v.optional(v.array(v.object({
      name:            v.string(),
      subtitle:        v.string(),
      price:           v.number(),
      valuePrice:      v.optional(v.number()),
      discountPercent: v.optional(v.number()),
      includes:        v.array(v.string()),
      tag:             v.optional(v.string()),
    }))),
  }),
});
