import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const swipe = mutation({
  args: {
    swipedId: v.id("users"),
    action: v.union(v.literal("like"), v.literal("pass")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if already swiped
    const existingSwipe = await ctx.db
      .query("swipes")
      .withIndex("by_swiper_swiped", (q) =>
        q.eq("swiperId", userId).eq("swipedId", args.swipedId)
      )
      .first();

    if (existingSwipe) throw new Error("Already swiped on this user");

    // Create swipe
    await ctx.db.insert("swipes", {
      swiperId: userId,
      swipedId: args.swipedId,
      action: args.action,
      createdAt: Date.now(),
    });

    // If it's a like, check for mutual match
    if (args.action === "like") {
      const otherSwipe = await ctx.db
        .query("swipes")
        .withIndex("by_swiper_swiped", (q) =>
          q.eq("swiperId", args.swipedId).eq("swipedId", userId)
        )
        .first();

      if (otherSwipe && otherSwipe.action === "like") {
        // It's a match!
        await ctx.db.insert("matches", {
          user1Id: userId,
          user2Id: args.swipedId,
          createdAt: Date.now(),
        });
        return { matched: true };
      }
    }

    return { matched: false };
  },
});

export const getSwipeStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { likes: 0, passes: 0 };

    const swipes = await ctx.db
      .query("swipes")
      .withIndex("by_swiper", (q) => q.eq("swiperId", userId))
      .collect();

    return {
      likes: swipes.filter((s) => s.action === "like").length,
      passes: swipes.filter((s) => s.action === "pass").length,
    };
  },
});
