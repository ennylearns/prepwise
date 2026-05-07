import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getDashboardData = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) throw new Error("User not found")
      
    const subjects = await ctx.db.query("subjects").order("asc").collect()
    const progress = await ctx.db
      .query("progress")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect()
      
    const topicsDone = progress.filter(p => p.status === "completed").length
    
    // Map subjects to include calculated progress
    const enrichedSubjects = await Promise.all(subjects.map(async (sub) => {
      const subjectLessons = await ctx.db
        .query("lessons")
        .withIndex("subjectId", (q) => q.eq("subjectId", sub._id))
        .collect()
        
      const lessonIds = subjectLessons.map(l => l._id)
      const completedSubjectLessons = progress.filter(p => p.status === "completed" && lessonIds.includes(p.lessonId as any))
      
      const progressPercent = subjectLessons.length > 0 
        ? Math.floor((completedSubjectLessons.length / subjectLessons.length) * 100) 
        : 0

      return {
        _id: sub._id,
        name: sub.name,
        progress: progressPercent,
        icon: sub.name === "Mathematics" ? "calculate" : sub.name === "English" ? "menu_book" : "science",
        color: sub.name === "Mathematics" ? "bg-blue-50 text-primary" : sub.name === "English" ? "bg-tertiary-fixed text-tertiary" : "bg-secondary-fixed text-secondary-container",
        tag: sub.name === "Mathematics" || sub.name === "English" ? "Core" : "Science"
      }
    }))

    return {
      streak: user.streak || 0,
      topicsDone,
      subjects: enrichedSubjects
    }
  },
})

export const getLessonTree = query({
  args: { subjectId: v.id("subjects"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const subject = await ctx.db.get(args.subjectId)
    const lessons = await ctx.db.query("lessons").withIndex("subjectId", q => q.eq("subjectId", args.subjectId)).collect()
    const publishedLessons = lessons.filter(l => l.status === "published").sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const progress = await ctx.db.query("progress").withIndex("userId", q => q.eq("userId", args.userId)).collect()
    return { subject, lessons: publishedLessons, progress }
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

    if (passed) {
      const user = await ctx.db.get(args.userId)
      if (user) {
        const today = new Date().toISOString().split('T')[0]
        let newStreak = user.streak || 0
        
        if (user.lastActivityDate !== today) {
          if (user.lastActivityDate) {
            const lastActivityDateObj = new Date(user.lastActivityDate)
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            if (lastActivityDateObj.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
              newStreak += 1
            } else {
              newStreak = 1
            }
          } else {
            newStreak = 1
          }
          await ctx.db.patch(user._id, {
            lastActivityDate: today,
            streak: newStreak
          })
        }
      }
    }

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