import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getLessonTree = query({
  args: {},
  handler: async (ctx) => {
    const subjects = await ctx.db.query("subjects").collect()
    const sections = await ctx.db.query("sections").collect()
    const topics = await ctx.db.query("topics").collect()
    const lessons = await ctx.db.query("lessons").collect()
    return { subjects, sections, topics, lessons }
  },
})

export const getLesson = query({
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

export const getProgress = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("progress")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect()
    return progress
  },
})

export const submitLessonQuiz = mutation({
  args: {
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    answers: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query("lessonQuestions")
      .withIndex("lessonId", (q) => q.eq("lessonId", args.lessonId))
      .collect()
    let correct = 0
    questions.forEach((q, i) => {
      if (q.correctAnswer === args.answers[i]) correct++
    })
    const score = Math.round((correct / questions.length) * 100)
    const passed = score >= 70
    await ctx.db.insert("progress", {
      userId: args.userId,
      lessonId: args.lessonId,
      status: passed ? "completed" : "in_progress",
      score,
      completedAt: Date.now(),
    })
    return { score, passed, correct, total: questions.length }
  },
})

export const getMockExam = query({
  args: {
    subjectIds: v.array(v.string()),
    count: v.number(),
  },
  handler: async (ctx, args) => {
    let questions: any[] = []
    for (const subjectId of args.subjectIds) {
      const subjectQuestions = await ctx.db
        .query("pastQuestions")
        .withIndex("subjectId", (q) => q.eq("subjectId", subjectId))
        .collect()
      const shuffled = subjectQuestions.sort(() => Math.random() - 0.5)
      questions.push(...shuffled.slice(0, Math.floor(args.count / args.subjectIds.length)))
    }
    return questions.sort(() => Math.random() - 0.5).slice(0, args.count)
  },
})

export const submitMockExam = mutation({
  args: {
    userId: v.id("users"),
    subjectIds: v.array(v.string()),
    answers: v.array(v.string()),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("examAttempts", {
      userId: args.userId,
      subjects: args.subjectIds,
      score: args.score,
      totalQuestions: args.answers.length,
      answers: JSON.stringify(args.answers),
      startedAt: Date.now(),
      completedAt: Date.now(),
    })
    return { success: true }
  },
})