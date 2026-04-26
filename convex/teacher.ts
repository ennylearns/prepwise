import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const createLesson = mutation({
  args: {
    topicId: v.id("topics"),
    title: v.string(),
    content: v.string(),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const lessonId = await ctx.db.insert("lessons", {
      topicId: args.topicId,
      title: args.title,
      content: args.content,
      createdBy: args.createdBy,
      createdAt: Date.now(),
    })
    return lessonId
  },
})

export const addLessonQuestions = mutation({
  args: {
    lessonId: v.id("lessons"),
    questions: v.array(v.object({
      question: v.string(),
      options: v.array(v.string()),
      correctAnswer: v.string(),
      explanation: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.questions.length; i++) {
      const q = args.questions[i]
      await ctx.db.insert("lessonQuestions", {
        lessonId: args.lessonId,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        order: i,
      })
    }
    return { success: true, count: args.questions.length }
  },
})

export const getLessons = query({
  args: { createdBy: v.id("users") },
  handler: async (ctx, args) => {
    const allLessons = await ctx.db.query("lessons").collect()
    return allLessons.filter((l: any) => l.createdBy === args.createdBy)
  },
})

export const getLessonById = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId)
    if (!lesson) return null
    const questions = await ctx.db
      .query("lessonQuestions")
      .withIndex("lessonId", (q) => q.eq("lessonId", args.lessonId))
      .collect()
    return { lesson, questions }
  },
})

export const updateLesson = mutation({
  args: {
    lessonId: v.id("lessons"),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.lessonId, {
      title: args.title,
      content: args.content,
    })
    return { success: true }
  },
})

export const getTeacherLessons = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("lessons").collect()
  },
})