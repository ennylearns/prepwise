const CONVEX_URL = import.meta.env.VITE_CONVEX_URL || "https://cautious-gull-92.convex.cloud"

async function convexAction(action: string, args: any = {}) {
  const response = await fetch(CONVEX_URL + "/" + action, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  })
  return response.json()
}

export const signIn = (email: string, password: string) => 
  convexAction("signIn", { email, password })

export const signUp = (email: string, password: string, name: string, role: string) => 
  convexAction("signUp", { email, password, name, role })

export const getUser = (userId: string) => 
  convexAction("getUser", { userId })

export const getLessonTree = () => 
  convexAction("getLessonTree", {})

export const getLesson = (lessonId: string) => 
  convexAction("getLesson", { lessonId })

export const getProgress = (userId: string) => 
  convexAction("getProgress", { userId })

export const submitLessonQuiz = (userId: string, lessonId: string, answers: string[]) => 
  convexAction("submitLessonQuiz", { userId, lessonId, answers })

export const getMockExam = (subjectIds: string[], count: number) => 
  convexAction("getMockExam", { subjectIds, count })

export const submitMockExam = (userId: string, subjectIds: string[], answers: string[], score: number) => 
  convexAction("submitMockExam", { userId, subjectIds, answers, score })

export const createLesson = (topicId: string, title: string, content: string, createdBy: string) => 
  convexAction("createLesson", { topicId, title, content, createdBy })

export const addLessonQuestions = (lessonId: string, questions: any[]) => 
  convexAction("addLessonQuestions", { lessonId, questions })

export const addPastQuestion = (subjectId: string, year: number, question: string, options: string[], correctAnswer: string, explanation: string) => 
  convexAction("addPastQuestion", { subjectId, year, question, options, correctAnswer, explanation })

export const initializePayment = (userId: string, email: string, plan: "monthly" | "annual") => 
  convexAction("initializePayment", { userId, email, plan })

export const verifyPayment = (userId: string, reference: string, plan: "monthly" | "annual") => 
  convexAction("verifyPayment", { userId, reference, plan })

export const getSubscription = (userId: string) => 
  convexAction("getSubscription", { userId })