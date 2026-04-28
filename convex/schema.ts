import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    password: v.string(),
    role: v.string(),
    subscriptionStatus: v.string(),
    streak: v.number(),
    lastActivityDate: v.string(),
    createdAt: v.number(),
  }).index("email", ["email"]),

  subjects: defineTable({
    name: v.string(),
    order: v.number(),
  }),

  lessons: defineTable({
    subjectId: v.string(),
    title: v.string(),
    content: v.string(),
    order: v.number(),
    isPublished: v.boolean(),
    createdBy: v.string(),
    createdAt: v.number(),
  }).index("subjectId", ["subjectId"]),

  lessonQuestions: defineTable({
    lessonId: v.string(),
    question: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.string(),
    explanation: v.string(),
    order: v.number(),
  }).index("lessonId", ["lessonId"]),

  pastQuestions: defineTable({
    subjectId: v.string(),
    year: v.number(),
    question: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.string(),
    explanation: v.string(),
  }).index("subjectId", ["subjectId"])
    .index("year", ["year"]),

  progress: defineTable({
    userId: v.string(),
    lessonId: v.string(),
    status: v.string(),
    score: v.number(),
    completedAt: v.number(),
  }).index("userId", ["userId"])
    .index("lessonId", ["lessonId"]),

  examAttempts: defineTable({
    userId: v.string(),
    subjects: v.array(v.string()),
    score: v.number(),
    totalQuestions: v.number(),
    answers: v.string(),
    startedAt: v.number(),
    completedAt: v.number(),
  }).index("userId", ["userId"]),

  subscriptions: defineTable({
    userId: v.string(),
    status: v.string(),
    plan: v.string(),
    reference: v.string(),
    startDate: v.number(),
    endDate: v.number(),
  }).index("userId", ["userId"]),
})