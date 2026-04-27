import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { TopAppBar, Button } from '../../components'

interface User {
  id: string
  email: string
  role: string
}

interface CreateLessonProps {
  user: User
}

type QuestionType = {
  question: string
  options: string[]
  correct: string
  explanation: string
}

export default function CreateLesson({ user }: CreateLessonProps) {
  const navigate = useNavigate()
  const subjects = useQuery(api.teacher.getSubjects)
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const sections = useQuery(
    api.teacher.getSections,
    selectedSubjectId ? { subjectId: selectedSubjectId as Id<"subjects"> } : "skip"
  )
  const [selectedSectionId, setSelectedSectionId] = useState('')
  
  const allTopics = useQuery(api.teacher.getTopics)
  const filteredTopics = allTopics?.filter((t: any) => t.sectionId === selectedSectionId)

  const createLessonMutation = useMutation(api.teacher.createLesson)
  const addLessonQuestionsMutation = useMutation(api.teacher.addLessonQuestions)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [topicId, setTopicId] = useState('')
  const [questions, setQuestions] = useState<QuestionType[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correct: 'A', explanation: '' }])
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions]
    if (field === 'question') {
      updated[index].question = value
    } else if (field === 'options') {
      updated[index].options = value
    } else if (field === 'correct') {
      updated[index].correct = value
    } else if (field === 'explanation') {
      updated[index].explanation = value
    }
    setQuestions(updated)
  }

  const handleSubmit = async () => {
    if (!title || !content || !topicId) {
      alert('Please fill in title, content, and select a topic.')
      return
    }
    if (questions.length < 1) { // MVP: Require at least 1 question
      alert('Please add at least 1 question')
      return
    }
    
    setIsLoading(true)
    try {
      const newLessonId = await createLessonMutation({
        topicId: topicId as Id<"topics">,
        title,
        content,
        createdBy: user.id as Id<"users">
      })

      // Map local question state to the API format
      const formattedQuestions = questions.map((q) => {
        // Map "A", "B", "C", "D" to the actual option string
        const optionIndex = q.correct === 'A' ? 0 : q.correct === 'B' ? 1 : q.correct === 'C' ? 2 : 3
        const correctAnswerString = q.options[optionIndex]

        return {
          question: q.question,
          options: q.options,
          correctAnswer: correctAnswerString,
          explanation: q.explanation
        }
      })

      await addLessonQuestionsMutation({
        lessonId: newLessonId,
        questions: formattedQuestions
      })

      navigate('/teacher')
    } catch (err) {
      alert('Failed to create lesson: ' + err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar title="Create Lesson" showBack />
      
      <main className="p-container-margin py-lg space-y-lg max-w-3xl mx-auto pb-24">
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <h2 className="font-h2 text-h2 mb-lg">Lesson Details</h2>
          
          <div className="space-y-lg">
            <div className="space-y-xs">
              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase">Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value)
                  setSelectedSectionId('')
                  setTopicId('')
                }}
                className="w-full h-12 px-md rounded-lg border border-outline bg-surface text-on-surface font-body-md"
              >
                <option value="">Select Subject</option>
                {subjects?.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>

            {selectedSubjectId && (
              <div className="space-y-xs">
                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase">Section</label>
                <select
                  value={selectedSectionId}
                  onChange={(e) => {
                    setSelectedSectionId(e.target.value)
                    setTopicId('')
                  }}
                  className="w-full h-12 px-md rounded-lg border border-outline bg-surface text-on-surface font-body-md"
                >
                  <option value="">Select Section</option>
                  {sections?.map((sec: any) => (
                    <option key={sec._id} value={sec._id}>{sec.title}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedSectionId && (
              <div className="space-y-xs">
                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase">Topic</label>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  className="w-full h-12 px-md rounded-lg border border-outline bg-surface text-on-surface font-body-md"
                >
                  <option value="">Select Topic</option>
                  {filteredTopics?.map((t: any) => (
                    <option key={t._id} value={t._id}>{t.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-xs">
              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase">Lesson Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Introduction to Linear Equations"
                className="w-full h-12 px-md rounded-lg border border-outline bg-surface text-on-surface font-body-md"
              />
            </div>

            <div className="space-y-xs">
              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase">Lesson Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter lesson content here..."
                rows={10}
                className="w-full px-md py-md rounded-lg border border-outline bg-surface text-on-surface font-body-md resize-none"
              />
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-lg">
            <h2 className="font-h2 text-h2">Practice Questions</h2>
            <button
              onClick={addQuestion}
              className="text-primary font-button text-button flex items-center gap-xs"
            >
              <span className="material-symbols-outlined">add</span>
              Add Question
            </button>
          </div>
          
          <div className="space-y-lg">
            {questions.map((q, index) => (
              <div key={index} className="p-md border border-surface-variant rounded-lg">
                <div className="flex items-center justify-between mb-md">
                  <span className="font-button text-button text-primary">Question {index + 1}</span>
                  <button
                    onClick={() => setQuestions(questions.filter((_, i) => i !== index))}
                    className="text-error"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
                
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                  placeholder="Enter question text"
                  className="w-full h-12 px-md rounded-lg border border-outline bg-surface text-on-surface font-body-md mb-md"
                />
                
                <div className="grid grid-cols-2 gap-sm mb-md">
                  {['A', 'B', 'C', 'D'].map((opt, optIndex) => (
                    <div key={opt} className="flex items-center gap-sm">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        checked={q.correct === opt}
                        onChange={() => updateQuestion(index, 'correct', opt)}
                        className="text-primary"
                      />
                      <span className="font-button text-button">{opt}.</span>
                      <input
                        type="text"
                        value={q.options[optIndex]}
                        onChange={(e) => {
                          const newOptions = [...q.options]
                          newOptions[optIndex] = e.target.value
                          updateQuestion(index, 'options', newOptions)
                        }}
                        placeholder={`Option ${opt}`}
                        className="flex-1 h-10 px-md rounded-lg border border-outline bg-surface text-on-surface font-body-md"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="space-y-xs">
                  <label className="block font-label-caps text-label-caps text-on-surface-variant">Explanation</label>
                  <textarea
                    value={q.explanation}
                    onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                    placeholder="Explain the correct answer..."
                    rows={2}
                    className="w-full px-md py-sm rounded-lg border border-outline bg-surface text-on-surface font-body-md resize-none"
                  />
                </div>
              </div>
            ))}
            
            {questions.length === 0 && (
              <div className="text-center py-lg text-on-surface-variant">
                <p>No questions added yet. Click "Add Question" to get started.</p>
              </div>
            )}
          </div>
        </section>

        <div className="flex gap-md">
          <Link to="/teacher" className="flex-1">
            <Button variant="outline" className="w-full">Cancel</Button>
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : 'Save Lesson'}
          </Button>
        </div>
      </main>
    </div>
  )
}