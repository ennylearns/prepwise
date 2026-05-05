import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first()

    if (existingUser) {
      throw new Error("Email already in use")
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password,
      name: args.name,
      role: args.role,
      subscriptionStatus: "free",
      streak: 0,
      lastActivityDate: new Date().toISOString().split('T')[0],
      createdAt: Date.now(),
    })

    const user = await ctx.db.get(userId)
    return { success: true, user }
  },
})

export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first()

    if (!user || user.password !== args.password) {
      throw new Error("Invalid email or password")
    }

    return { success: true, user }
  },
})

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }
    return await ctx.db.get(args.userId)
  },
})

export const getLeaderboard = query({
  args: {},
  handler: async (_ctx) => {
    return []
  },
})