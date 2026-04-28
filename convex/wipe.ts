import { mutation } from "./_generated/server"

export const wipeDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all lessons
    const lessons = await ctx.db.query("lessons").collect()
    for (const l of lessons) await ctx.db.delete(l._id)

    // Delete all subjects
    const subjects = await ctx.db.query("subjects").collect()
    for (const s of subjects) await ctx.db.delete(s._id)

    // Delete all lesson questions
    const questions = await ctx.db.query("lessonQuestions").collect()
    for (const q of questions) await ctx.db.delete(q._id)
    
    // Delete all progress
    const progress = await ctx.db.query("progress").collect()
    for (const p of progress) await ctx.db.delete(p._id)

    return { success: true, message: "Database wiped successfully!" }
  }
})
