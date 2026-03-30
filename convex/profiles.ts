import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return profile;
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    skillLevel: v.number(),
    bio: v.optional(v.string()),
    location: v.string(),
    playStyle: v.union(v.literal("aggressive"), v.literal("defensive"), v.literal("all-court")),
    availability: v.array(v.string()),
    lookingFor: v.union(v.literal("casual"), v.literal("competitive"), v.literal("practice"), v.literal("any")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if profile already exists
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) throw new Error("Profile already exists");

    return await ctx.db.insert("profiles", {
      userId,
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    name: v.optional(v.string()),
    skillLevel: v.optional(v.number()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    playStyle: v.optional(v.union(v.literal("aggressive"), v.literal("defensive"), v.literal("all-court"))),
    availability: v.optional(v.array(v.string())),
    lookingFor: v.optional(v.union(v.literal("casual"), v.literal("competitive"), v.literal("practice"), v.literal("any"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.skillLevel !== undefined) updates.skillLevel = args.skillLevel;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.location !== undefined) updates.location = args.location;
    if (args.playStyle !== undefined) updates.playStyle = args.playStyle;
    if (args.availability !== undefined) updates.availability = args.availability;
    if (args.lookingFor !== undefined) updates.lookingFor = args.lookingFor;

    await ctx.db.patch(profile._id, updates);
  },
});

// Get potential matches (players not yet swiped)
export const getPotentialMatches = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const myProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!myProfile) return [];

    // Get all profiles I've already swiped on
    const mySwipes = await ctx.db
      .query("swipes")
      .withIndex("by_swiper", (q) => q.eq("swiperId", userId))
      .collect();

    const swipedUserIds = new Set(mySwipes.map((s) => s.swipedId));

    // Get all profiles within skill range (±1.5 NTRP)
    const allProfiles = await ctx.db.query("profiles").collect();

    const potentialMatches = allProfiles.filter((profile) => {
      // Exclude self
      if (profile.userId === userId) return false;
      // Exclude already swiped
      if (swipedUserIds.has(profile.userId)) return false;
      // Skill level filter (±1.5 range)
      if (Math.abs(profile.skillLevel - myProfile.skillLevel) > 1.5) return false;
      return true;
    });

    return potentialMatches;
  },
});
