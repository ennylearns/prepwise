import { mutation } from "./_generated/server"

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if we already seeded
    const subjects = await ctx.db.query("subjects").collect()
    if (subjects.length > 0) {
      return { success: false, message: "Database already seeded" }
    }

    // Seed Subjects
    const mathId = await ctx.db.insert("subjects", { name: "Mathematics", order: 1 })
    const engId = await ctx.db.insert("subjects", { name: "English", order: 2 })
    await ctx.db.insert("subjects", { name: "Physics", order: 3 })
    await ctx.db.insert("subjects", { name: "Chemistry", order: 4 })

    // Seed Sections for Math
    const algebraSectionId = await ctx.db.insert("sections", { subjectId: mathId, title: "Section 1: Algebra Basics", order: 1 })
    await ctx.db.insert("sections", { subjectId: mathId, title: "Section 2: Geometry", order: 2 })

    // Seed Topics for Algebra
    const equationsTopicId = await ctx.db.insert("topics", { sectionId: algebraSectionId, title: "Equations", order: 1 })
    const inequalitiesTopicId = await ctx.db.insert("topics", { sectionId: algebraSectionId, title: "Inequalities", order: 2 })
    await ctx.db.insert("topics", { sectionId: algebraSectionId, title: "Polynomials", order: 3 })
    await ctx.db.insert("topics", { sectionId: algebraSectionId, title: "Factoring", order: 4 })
    await ctx.db.insert("topics", { sectionId: algebraSectionId, title: "Graphing", order: 5 })

    // Seed Lessons
    const lesson1Id = await ctx.db.insert("lessons", {
      topicId: equationsTopicId,
      title: "Linear Equations",
      content: "This is a comprehensive lesson on linear equations. By the end of this lesson, you will be able to solve linear equations of the form ax + b = 0.",
      createdBy: "system",
      createdAt: Date.now(),
    })

    await ctx.db.insert("lessons", {
      topicId: inequalitiesTopicId,
      title: "Solving Inequalities",
      content: "This lesson covers linear inequalities and how to solve them.",
      createdBy: "system",
      createdAt: Date.now(),
    })

    // Seed Lesson Questions
    await ctx.db.insert("lessonQuestions", {
      lessonId: lesson1Id,
      question: "Solve for x: 2x + 4 = 10",
      options: ["x = 2", "x = 3", "x = 4", "x = 6"],
      correctAnswer: "x = 3",
      explanation: "Subtract 4 from both sides: 2x = 6. Divide by 2: x = 3.",
      order: 1
    })

    await ctx.db.insert("lessonQuestions", {
      lessonId: lesson1Id,
      question: "Solve for y: y/2 - 1 = 4",
      options: ["y = 5", "y = 6", "y = 8", "y = 10"],
      correctAnswer: "y = 10",
      explanation: "Add 1 to both sides: y/2 = 5. Multiply by 2: y = 10.",
      order: 2
    })

    // Seed Past Questions for Mock Exam
    await ctx.db.insert("pastQuestions", {
      subjectId: mathId,
      year: 2020,
      question: "If 3x - 2 = 10, what is the value of x?",
      options: ["3", "4", "5", "6"],
      correctAnswer: "4",
      explanation: "Add 2 to both sides: 3x = 12. Divide by 3: x = 4."
    })
    
    await ctx.db.insert("pastQuestions", {
      subjectId: engId,
      year: 2020,
      question: "Choose the option nearest in meaning to the italicized word: The manager's *supercilious* attitude annoyed everyone.",
      options: ["Arrogant", "Friendly", "Indifferent", "Strict"],
      correctAnswer: "Arrogant",
      explanation: "Supercilious means behaving or looking as though one thinks one is superior to others."
    })

    return { success: true, message: "Successfully seeded database" }
  }
})
