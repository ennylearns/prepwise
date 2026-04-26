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

  sections: defineTable({
    subjectId: v.string(),
    title: v.string(),
    order: v.number(),
  }).index("subjectId", ["subjectId"]),

  topics: defineTable({
    sectionId: v.string(),
    title: v.string(),
    order: v.number(),
  }).index("sectionId", ["sectionId"]),

  lessons: defineTable({
    topicId: v.string(),
    title: v.string(),
    content: v.string(),
    createdBy: v.string(),
    createdAt: v.number(),
  }).index("topicId", ["topicId"]),

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