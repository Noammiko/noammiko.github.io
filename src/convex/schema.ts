import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  free: defineTable({
    name: v.string(),
    requested: v.number(), // time in utc
    approved: v.boolean(),
  }).index("by_time", ["requested"]),
});
