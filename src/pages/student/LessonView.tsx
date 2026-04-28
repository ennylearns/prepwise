import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { TopAppBar } from '../../components'

interface User {
  id: string
  email: string
  role: string
}

interface LessonViewProps {
  user: User
}

export default function LessonView(_props: LessonViewProps) {
  const { lessonId } = useParams()
  
  const data = useQuery(api.student.getLesson, { lessonId: lessonId as Id<"lessons"> })

  if (data === undefined) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!data || !data.lesson) {
    return <div className="min-h-screen flex items-center justify-center">Lesson not found</div>
  }

  const { lesson } = data

  const isComingSoon = !lesson.content || lesson.content.trim() === ''
  const hasQuestions = data.questions && data.questions.length > 0

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar title="Lesson" showBack />
      
      <main className="p-container-margin py-lg pb-24 space-y-lg max-w-2xl mx-auto">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <h1 className="font-h1 text-h1 text-on-surface mb-lg">{lesson.title}</h1>
          
          {isComingSoon ? (
            <div className="flex flex-col items-center justify-center py-xl text-center">
              <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-4xl text-on-secondary-container">construction</span>
              </div>
              <h2 className="font-h2 text-h2 text-on-surface mb-sm">Coming Soon</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
                Our teachers are currently preparing this lesson content. Check back later!
              </p>
            </div>
          ) : (
            <div className="prose prose-lg max-w-none whitespace-pre-wrap">
              <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
                {lesson.content}
              </p>
            </div>
          )}
        </div>

        {hasQuestions ? (
          <Link
            to={`/lesson/${lessonId}/quiz`}
            className="w-full h-12 bg-primary text-on-primary font-button text-button rounded-full hover:opacity-90 transition-all flex items-center justify-center gap-sm shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
          >
            Start Practice
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        ) : (
          <button
            disabled
            className="w-full h-12 bg-surface-variant text-on-surface-variant font-button text-button rounded-full flex items-center justify-center gap-sm cursor-not-allowed opacity-70"
          >
            Practice Questions Coming Soon
            <span className="material-symbols-outlined">pending</span>
          </button>
        )}
      </main>
    </div>
  )
}