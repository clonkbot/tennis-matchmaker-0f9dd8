import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Player profiles with skill level and preferences
  profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    skillLevel: v.number(), // 1.0 to 7.0 (NTRP rating)
    bio: v.optional(v.string()),
    location: v.string(),
    playStyle: v.union(v.literal("aggressive"), v.literal("defensive"), v.literal("all-court")),
    availability: v.array(v.string()), // ["weekday_morning", "weekday_evening", "weekend"]
    lookingFor: v.union(v.literal("casual"), v.literal("competitive"), v.literal("practice"), v.literal("any")),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_skill", ["skillLevel"])
    .index("by_location", ["location"]),

  // Swipe actions (like/pass)
  swipes: defineTable({
    swiperId: v.id("users"),
    swipedId: v.id("users"),
    action: v.union(v.literal("like"), v.literal("pass")),
    createdAt: v.number(),
  }).index("by_swiper", ["swiperId"])
    .index("by_swiper_swiped", ["swiperId", "swipedId"])
    .index("by_swiped", ["swipedId"]),

  // Matches (mutual likes)
  matches: defineTable({
    user1Id: v.id("users"),
    user2Id: v.id("users"),
    createdAt: v.number(),
    lastMessageAt: v.optional(v.number()),
  }).index("by_user1", ["user1Id"])
    .index("by_user2", ["user2Id"]),

  // Chat messages between matched players
  messages: defineTable({
    matchId: v.id("matches"),
    senderId: v.id("users"),
    text: v.string(),
    createdAt: v.number(),
  }).index("by_match", ["matchId"]),
});
