import { query } from "./_generated/server"
import { v } from "convex/values"

export const signUp = query({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    return { success: true }
  },
})

export const signIn = query({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    return { success: true }
  },
})

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId)
  },
})

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    return []
  },
})