import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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

export default function CreateLesson(_props: CreateLessonProps) {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [subject, setSubject] = useState('')
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
    if (!title || !content || questions.length < 10) {
      alert('Please fill in all fields and add 10 questions')
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      navigate('/teacher')
    }, 1000)
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
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-12 px-md rounded-lg border border-outline bg-surface text-on-surface font-body-md"
              >
                <option value="">Select Subject</option>
                <option value="math">Mathematics</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="english">English</option>
              </select>
            </div>

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
            <h2 className="font-h2 text-h2">Practice Questions (10 required)</h2>
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