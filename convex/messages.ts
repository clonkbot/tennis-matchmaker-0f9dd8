import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Verify user is part of this match
    const match = await ctx.db.get(args.matchId);
    if (!match) return [];
    if (match.user1Id !== userId && match.user2Id !== userId) return [];

    return await ctx.db
      .query("messages")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .order("asc")
      .collect();
  },
});

export const send = mutation({
  args: {
    matchId: v.id("matches"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify user is part of this match
    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found");
    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new Error("Not authorized");
    }

    const now = Date.now();

    // Create message
    await ctx.db.insert("messages", {
      matchId: args.matchId,
      senderId: userId,
      text: args.text,
      createdAt: now,
    });

    // Update last message time on match
    await ctx.db.patch(args.matchId, { lastMessageAt: now });
  },
});
