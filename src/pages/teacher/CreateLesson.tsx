import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useAction } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { TopAppBar, Button, Card } from '../../components'

interface User {
  id: string
  email: string
  role: string
}

interface CreateLessonProps {
  user: User
  onLogout: () => void
}

export default function CreateLesson({ user, onLogout }: CreateLessonProps) {
  const navigate = useNavigate()
  const subjects = useQuery(api.aiGeneration.getSubjects)
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  
  const availableLessons = useQuery(
    api.aiGeneration.getAvailableLessons,
    selectedSubjectId ? { subjectId: selectedSubjectId as Id<"subjects"> } : "skip"
  )
  const [selectedLessonId, setSelectedLessonId] = useState('')

  const remaining = useQuery(api.aiGeneration.getRemainingGenerations, {
    teacherId: user.id as Id<"users">
  })

  const generateContent = useAction(api.aiGeneration.generateLessonContent)
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleGenerate = async () => {
    if (!selectedLessonId) {
      setError('Please select a lesson to generate content for.')
      return
    }
    
    if (!remaining || remaining.remaining <= 0) {
      setError('Daily generation limit reached. Try again tomorrow.')
      return
    }

    setIsGenerating(true)
    setError('')
    setSuccess('')

    try {
      const result = await generateContent({
        lessonId: selectedLessonId as Id<"lessons">,
        teacherId: user.id as Id<"users">,
      })

      if (result.success) {
        setSuccess(`Content generated successfully! ${result.remainingGenerations} generations remaining today.`)
        setTimeout(() => {
          navigate(`/teacher/lessons/${selectedLessonId}/review`)
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar title="Create Lesson" showBack user={user} onLogout={onLogout} />
      
      <main className="p-container-margin py-lg space-y-lg max-w-3xl mx-auto pb-24">
        <Card className="p-lg">
          <h2 className="font-h2 text-h2 mb-lg">AI-Powered Lesson Generation</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
            Select a subject and lesson topic. Our AI will generate comprehensive lesson content 
            for you to review and publish.
          </p>

          {remaining && (
            <div className="flex items-center gap-sm p-md bg-surface-container rounded-lg mb-lg">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              <span className="font-body-md text-body-md text-on-surface">
                <strong>{remaining.remaining}</strong> of {remaining.limit} generations remaining today
              </span>
            </div>
          )}
          
          <div className="space-y-lg">
            <div className="space-y-xs">
              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase">Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value)
                  setSelectedLessonId('')
                }}
                className="w-full h-12 px-md rounded-lg border border-outline bg-surface text-on-surface font-body-md"
              >
                <option value="">Select Subject</option>
                {subjects?.map((s: any) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>

            {selectedSubjectId && (
              <div className="space-y-xs">
                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase">Lesson Topic</label>
                <select
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className="w-full h-12 px-md rounded-lg border border-outline bg-surface text-on-surface font-body-md"
                >
                  <option value="">Select Lesson Topic</option>
                  {availableLessons?.map((lesson: any) => (
                    <option key={lesson._id} value={lesson._id}>{lesson.title}</option>
                  ))}
                </select>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                  {availableLessons?.length || 0} lessons available for this subject
                </p>
              </div>
            )}
          </div>
        </Card>

        {error && (
          <div className="p-md bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-sm">
            <span className="material-symbols-outlined text-[20px]">error</span>
            {error}
          </div>
        )}

        {success && (
          <div className="p-md bg-green-50 border border-green-200 rounded-lg text-sm text-green-600 flex items-center gap-sm">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            {success}
          </div>
        )}

        <div className="flex gap-md">
          <Link to="/teacher" className="flex-1">
            <Button variant="outline" className="w-full">
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Dashboard
            </Button>
          </Link>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedLessonId || !remaining || remaining.remaining <= 0}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                Generating...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">auto_awesome</span>
                Generate with AI
              </>
            )}
          </Button>
        </div>

        <Card className="p-lg">
          <h3 className="font-h2 text-h2 text-on-surface mb-md">How it works</h3>
          <div className="space-y-md">
            <div className="flex items-start gap-md">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                <span className="font-button text-button text-primary">1</span>
              </div>
              <div>
                <h4 className="font-button text-button text-on-surface">Select a Lesson</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Choose the subject and specific lesson topic you want to create content for.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-md">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                <span className="font-button text-button text-primary">2</span>
              </div>
              <div>
                <h4 className="font-button text-button text-on-surface">AI Generates Content</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Our AI creates comprehensive lesson content including objectives, examples, and common mistakes.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-md">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                <span className="font-button text-button text-primary">3</span>
              </div>
              <div>
                <h4 className="font-button text-button text-on-surface">Review & Publish</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Edit the generated content if needed, then approve and publish for students.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center text-sm text-on-surface-variant">
          <p>Daily limit: 5 lessons per day</p>
          <p>Resets at midnight</p>
        </div>
      </main>
    </div>
  )
}
