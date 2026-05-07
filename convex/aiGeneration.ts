import { action, mutation, query, internalMutation, internalQuery, internalAction } from "./_generated/server"
import { internal } from "./_generated/api"
import { v } from "convex/values"
import { Doc } from "./_generated/dataModel"

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ""
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL || "https://prepwise.com"
const MODEL = "z-ai/glm-4.5-air:free"
const DAILY_LIMIT = 5
const MAX_RETRIES = 2

const LESSON_FORMAT_TEMPLATE = `# **Prepwise Lesson Document Template**

---

## **LESSON DETAILS**

* **Subject:** {subject}
* **Lesson Topic:** {lesson_title}
* **Teacher Name:** AI Assistant

---

## **1. LESSON OBJECTIVE**

State clearly what the student should be able to do after this lesson:

*
*

---

## **2. INTRODUCTION**

Explain the topic in simple terms:

*(Write 3–5 short paragraphs or bullet points)*

---

## **3. KEY CONCEPTS**

Break the topic into clear parts:

### Concept 1:

* Explanation:

### Concept 2:

* Explanation:

### Concept 3:

* Explanation:

---

## **4. WORKED EXAMPLES**

Provide at least **2 examples**

---

### Example 1

* **Question:**
* **Solution (step-by-step):**
  1.
  2.
  3.
* **Final Answer:**

---

### Example 2

* **Question:**
* **Solution (step-by-step):**
  1.
  2.
  3.
* **Final Answer:**

---

## **5. COMMON MISTAKES**

List mistakes students often make:

*
*
*

---

## **6. SUMMARY**

Write 3–5 key takeaways:

*
*
*

---

# **IMPORTANT RULES**

* Do NOT skip sections
* Do NOT give vague explanations
* Keep everything clear and structured
* Generate content suitable for Nigerian SS2/SS3 students preparing for JAMB 2025
`

async function callOpenRouterWithRetry(messages: any[], retries: number = 0): Promise<string> {
  const maxTokens = 4000

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": OPENROUTER_SITE_URL,
          "X-Title": "Prepwise",
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          max_tokens: maxTokens,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content
      }

      throw new Error("Invalid API response structure")
    } catch (error) {
      if (attempt === retries) {
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }

  throw new Error("Max retries exceeded")
}

export const generateLessonContent = action({
  args: {
    lessonId: v.id("lessons"),
    teacherId: v.id("users"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; content: string; remainingGenerations: number }> => {
    if (!OPENROUTER_API_KEY) {
      throw new Error("AI service not configured. Contact admin.")
    }

    const today = new Date().toISOString().split('T')[0]

    const dailyGen: Doc<"dailyGenerations"> | null = await ctx.runQuery(internal.aiGeneration.getDailyCount, {
      teacherId: args.teacherId,
      date: today,
    })

    if (dailyGen && dailyGen.count >= DAILY_LIMIT) {
      throw new Error(`Daily limit reached. You can generate ${DAILY_LIMIT} lessons per day. Try again tomorrow.`)
    }

    const lesson = await ctx.runQuery(internal.aiGeneration.getLesson, {
      lessonId: args.lessonId,
    })

    if (!lesson) {
      throw new Error("Lesson not found")
    }

    if (lesson.status !== "draft") {
      throw new Error("This lesson has already been processed")
    }

    const subject = await ctx.runQuery(internal.aiGeneration.getSubject, {
      subjectId: lesson.subjectId,
    })

    const systemMessage = {
      role: "system",
      content: `You are an expert JAMB content creator for Nigerian SS2/SS3 students preparing for JAMB 2025.
Generate comprehensive lesson content following this exact format:

${LESSON_FORMAT_TEMPLATE}

Important:
- Keep explanations simple and clear for students
- Use Nigerian context where appropriate
- Include practical examples relevant to JAMB exams
- Ensure all sections are complete and detailed
- Content should be at least 1000 words total`
    }

    const userMessage = {
      role: "user",
      content: `Generate lesson content for:
Subject: ${subject?.name || "Unknown"}
Lesson Topic: ${lesson.title}

Follow the format exactly. Make sure to fill in every section with helpful, accurate content.`
    }

    try {
      const generatedContent = await callOpenRouterWithRetry(
        [systemMessage, userMessage],
        MAX_RETRIES
      )

      await ctx.runMutation(internal.aiGeneration.saveGeneratedContent, {
        lessonId: args.lessonId,
        aiGeneratedContent: generatedContent,
        generatedAt: Date.now(),
        teacherId: args.teacherId,
        date: today,
      })

      return {
        success: true,
        content: generatedContent,
        remainingGenerations: DAILY_LIMIT - (dailyGen?.count || 0),
      }
    } catch (error: any) {
      throw new Error(`Generation failed: ${error.message}. Try again later.`)
    }
  },
})

export const getRemainingGenerations = query({
  args: { teacherId: v.id("users") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0]
    
    const dailyGen = await ctx.db
      .query("dailyGenerations")
      .withIndex("teacherId_date", (q) => 
        q.eq("teacherId", args.teacherId)
         .eq("date", today)
      )
      .first()

    const count = dailyGen?.count || 0
    const remaining = Math.max(0, DAILY_LIMIT - count)

    return {
      remaining,
      limit: DAILY_LIMIT,
      resetAt: today,
    }
  },
})

export const getLessonForReview = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId)
    if (!lesson) return null

    const subject = await ctx.db.query("subjects").collect()
    const subjectDoc = subject.find(s => s._id === lesson.subjectId)

    return {
      ...lesson,
      subjectName: subjectDoc?.name || "Unknown",
    }
  },
})

export const getTeacherLessons = query({
  args: { teacherId: v.id("users") },
  handler: async (ctx, args) => {
    const lessons = await ctx.db.query("lessons").collect()
    const subjects = await ctx.db.query("subjects").collect()
    
    const subjectMap: Map<string, string> = new Map(subjects.map(s => [s._id, s.name]))

    const filtered = lessons.filter(l => 
      l.createdBy === args.teacherId || l.createdBy === "system"
    )

    return filtered.map(l => ({
      ...l,
      subjectName: subjectMap.get(l.subjectId as string) || "Unknown",
    }))
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

export const saveAiContent = mutation({
  args: {
    lessonId: v.id("lessons"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.lessonId, {
      aiGeneratedContent: args.content,
      status: "pending_review",
    })
    return { success: true }
  },
})

export const approveAndPublish = mutation({
  args: {
    lessonId: v.id("lessons"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId)
    if (!lesson) {
      throw new Error("Lesson not found")
    }

    if (lesson.status !== "pending_review" && lesson.status !== "ai_generated") {
      throw new Error("Lesson must be in review or generated status to publish")
    }

    await ctx.db.patch(args.lessonId, {
      content: args.content,
      status: "published",
    })

    return { success: true }
  },
})

export const rejectAndRegenerate = mutation({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.lessonId, {
      status: "draft",
      aiGeneratedContent: undefined,
      generatedAt: undefined,
    })
    return { success: true }
  },
})

export const publishLesson = mutation({
  args: {
    lessonId: v.id("lessons"),
    content: v.string(),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.lessonId, {
      content: args.content,
      status: "published",
      createdBy: args.createdBy,
      createdAt: Date.now(),
    })
    return args.lessonId
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

export const getSubjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("subjects").collect()
  },
})

export const getDailyCount = internalQuery({
  args: { teacherId: v.id("users"), date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dailyGenerations")
      .withIndex("teacherId_date", (q) => 
        q.eq("teacherId", args.teacherId)
         .eq("date", args.date)
      )
      .first()
  },
})

export const saveGeneratedContent = internalMutation({
  args: {
    lessonId: v.id("lessons"),
    aiGeneratedContent: v.string(),
    generatedAt: v.number(),
    teacherId: v.id("users"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.lessonId, {
      aiGeneratedContent: args.aiGeneratedContent,
      generatedAt: args.generatedAt,
      status: "ai_generated",
    })

    const existing = await ctx.db
      .query("dailyGenerations")
      .withIndex("teacherId_date", (q) => 
        q.eq("teacherId", args.teacherId)
         .eq("date", args.date)
      )
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        count: existing.count + 1,
      })
    } else {
      await ctx.db.insert("dailyGenerations", {
        teacherId: args.teacherId,
        date: args.date,
        count: 1,
      })
    }
  },
})

export const getLesson = internalQuery({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.lessonId)
  },
})

export const getSubject = internalQuery({
  args: { subjectId: v.string() },
  handler: async (ctx, args) => {
    const subjects = await ctx.db.query("subjects").collect()
    return subjects.find(s => s._id === args.subjectId)
  },
})

export const getAllDailyCounts = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("dailyGenerations").collect()
  },
})

export const deleteDailyCount = internalMutation({
  args: { id: v.id("dailyGenerations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})

export const resetDailyCounts = internalAction({
  args: {},
  handler: async (_ctx) => {
    return { success: true }
  },
})
