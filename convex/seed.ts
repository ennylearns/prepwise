import { mutation } from "./_generated/server"
import { curriculumData } from "./curriculumData"

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if we already seeded
    const subjects = await ctx.db.query("subjects").collect()
    if (subjects.length > 0) {
      return { success: false, message: "Database already seeded" }
    }

    const subjectMap: Record<string, any> = {}

    // Seed Subjects
    for (const sub of curriculumData.subjects) {
      const id = await ctx.db.insert("subjects", { name: sub.name, order: sub.order })
      subjectMap[sub.name] = id
    }

    // Seed Lessons
    for (const lesson of curriculumData.lessons) {
      const subjectId = subjectMap[lesson.subjectName]
      if (subjectId) {
        await ctx.db.insert("lessons", {
          subjectId: subjectId,
          title: lesson.title,
          content: "",
          order: lesson.order,
          status: "draft",
          aiGeneratedContent: undefined,
          generatedAt: undefined,
          createdBy: "system",
          createdAt: Date.now(),
        })
      }
    }

    return { success: true, message: "Successfully seeded database from parsed syllabus" }
  }
})
