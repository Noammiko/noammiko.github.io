import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  free: defineTable({
    name: v.string(),
    requested: v.number(), // time in utc
    approved: v.union(v.boolean(), v.null())
  }).index("by_time", ["requested"]),
});
