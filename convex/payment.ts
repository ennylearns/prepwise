import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const initializePayment = mutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
    amount: v.number(),
  },
  handler: async (_ctx, _args) => {
    return {
      success: true,
      authorizationUrl: "https://paystack.gg/test",
      reference: "test_ref_" + Date.now(),
    }
  },
})

export const verifyPayment = mutation({
  args: {
    reference: v.string(),
  },
  handler: async (_ctx, _args) => {
    return { success: true, plan: "premium" }
  },
})

export const checkUserSubscription = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) return { status: "free" }
    return { status: user.subscriptionStatus || "free" }
  },
})