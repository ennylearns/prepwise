import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const addPastQuestion = mutation({
  args: {
    subjectId: v.string(),
    year: v.number(),
    question: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.string(),
    explanation: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("pastQuestions", {
      subjectId: args.subjectId,
      year: args.year,
      question: args.question,
      options: args.options,
      correctAnswer: args.correctAnswer,
      explanation: args.explanation,
    })
    return id
  },
})

export const bulkUploadQuestions = mutation({
  args: {
    questions: v.array(v.object({
      subjectId: v.string(),
      year: v.number(),
      question: v.string(),
      options: v.array(v.string()),
      correctAnswer: v.string(),
      explanation: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    let inserted = 0
    for (const q of args.questions) {
      await ctx.db.insert("pastQuestions", {
        subjectId: q.subjectId,
        year: q.year,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })
      inserted++
    }
    return { success: true, count: inserted }
  },
})

export const getPastQuestions = query({
  args: {
    subjectId: v.optional(v.string()),
    year: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let results = await ctx.db.query("pastQuestions").collect()
    if (args.subjectId) {
      results = results.filter((q) => q.subjectId === args.subjectId)
    }
    if (args.year) {
      results = results.filter((q) => q.year === args.year)
    }
    return results
  },
})