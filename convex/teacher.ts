import { query } from "./_generated/server"
import { v } from "convex/values"

export const getLessons = query({
  args: { createdBy: v.id("users") },
  handler: async (ctx, args) => {
    const allLessons = await ctx.db.query("lessons").collect()
    return allLessons.filter((l: any) => l.createdBy === args.createdBy)
  },
})

export const getAvailableLessons = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("subjectId", (q) => q.eq("subjectId", args.subjectId))
      .collect()
    return lessons
      .filter((l) => l.status === "draft" || l.status === "ai_generated")
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  },
})

export const getSubjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("subjects").collect()
  },
})
