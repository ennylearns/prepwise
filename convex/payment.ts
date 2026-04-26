import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "sk_test_xxx"

export const initializePayment = mutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
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
  handler: async (ctx, args) => {
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