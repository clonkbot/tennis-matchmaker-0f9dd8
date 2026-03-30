import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get matches where user is either user1 or user2
    const matches1 = await ctx.db
      .query("matches")
      .withIndex("by_user1", (q) => q.eq("user1Id", userId))
      .collect();

    const matches2 = await ctx.db
      .query("matches")
      .withIndex("by_user2", (q) => q.eq("user2Id", userId))
      .collect();

    const allMatches = [...matches1, ...matches2];

    // Get profiles for each match
    const matchesWithProfiles = await Promise.all(
      allMatches.map(async (match) => {
        const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", otherUserId))
          .first();

        return {
          ...match,
          otherProfile: profile,
        };
      })
    );

    // Sort by most recent message or match date
    return matchesWithProfiles.sort((a, b) =>
      (b.lastMessageAt || b.createdAt) - (a.lastMessageAt || a.createdAt)
    );
  },
});

export const getMatch = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const match = await ctx.db.get(args.matchId);
    if (!match) return null;

    // Verify user is part of this match
    if (match.user1Id !== userId && match.user2Id !== userId) return null;

    const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
    const otherProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", otherUserId))
      .first();

    return {
      ...match,
      otherProfile,
    };
  },
});

export const unmatch = mutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found");

    // Verify user is part of this match
    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new Error("Not authorized");
    }

    // Delete all messages for this match
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    await ctx.db.delete(args.matchId);
  },
});
