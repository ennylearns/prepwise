import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { TopAppBar, Card } from '../../components'

interface User {
  id: string
  email: string
  role: string
}

interface QuestionsProps {
  user: User
}

type QuestionType = {
  subjectId: string
  year: number
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

export default function Questions({ user }: QuestionsProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single')
  
  const subjects = useQuery(api.teacher.getSubjects)
  
  const addQuestionMutation = useMutation(api.uploader.addPastQuestion)
  const bulkUploadMutation = useMutation(api.uploader.bulkUploadQuestions)

  const [subjectId, setSubjectId] = useState('')
  const [year, setYear] = useState('')
  
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [explanation, setExplanation] = useState('')
  
  const [bulkInput, setBulkInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const availableYears = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2015, 2014, 2013, 2012, 2011, 2010]

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSaveSingle = async () => {
    if (!subjectId || !year || !question || options.some(o => !o) || !correctAnswer) {
      setMessage('Please fill all required fields')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      await addQuestionMutation({
        subjectId,
        year: parseInt(year),
        question,
        options,
        correctAnswer: options[correctAnswer.charCodeAt(0) - 65],
        explanation,
      })

      setMessage('Question saved successfully!')
      setQuestion('')
      setOptions(['', '', '', ''])
      setCorrectAnswer('')
      setExplanation('')
    } catch (err: any) {
      setMessage(err.message || 'Failed to save question')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveBulk = async () => {
    if (!subjectId || !year || !bulkInput) {
      setMessage('Please fill all required fields')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const lines = bulkInput.trim().split('\n')
      const questions: QuestionType[] = []

      for (const line of lines) {
        const parts = line.split('|').map(p => p.trim())
        if (parts.length >= 6) {
          questions.push({
            subjectId,
            year: parseInt(year),
            question: parts[0],
            options: [parts[1], parts[2], parts[3], parts[4]],
            correctAnswer: parts[5],
            explanation: parts[5] || '',
          })
        }
      }

      if (questions.length === 0) {
        setMessage('No valid questions found. Format: question|optionA|optionB|optionC|optionD|correctAnswer|explanation')
        return
      }

      await bulkUploadMutation({ questions })

      setMessage(`${questions.length} questions saved successfully!`)
      setBulkInput('')
    } catch (err: any) {
      setMessage(err.message || 'Failed to save questions')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar title="Question Upload" user={user} />
      
      <main className="p-container-margin py-lg max-w-4xl mx-auto">
        <div className="mb-lg">
          <h1 className="font-h1 text-h1 text-on-surface mb-xs">Question Upload Portal</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Add a single question manually or upload in bulk.
          </p>
        </div>

        <div className="flex border-b border-outline-variant mb-lg">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-md py-sm border-b-2 font-button text-button transition-colors ${
              activeTab === 'single'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Add Single
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-md py-sm border-b-2 font-button text-button transition-colors ${
              activeTab === 'bulk'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Bulk Upload
          </button>
        </div>

        <Card className="p-lg md:p-xl">
          <div className="flex flex-col gap-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg border-b border-surface-variant pb-lg">
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant">
                  SUBJECT CATEGORY
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="h-12 w-full rounded-lg border border-outline bg-surface text-on-surface px-md font-body-md"
                >
                  <option value="">Select Subject</option>
                  {subjects?.map((s: any) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant">
                  EXAMINATION YEAR
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="h-12 w-full rounded-lg border border-outline bg-surface text-on-surface px-md font-body-md"
                >
                  <option value="">Select Year</option>
                  {availableYears.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {activeTab === 'single' ? (
              <>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-caps text-label-caps text-on-surface-variant">
                    QUESTION TEXT
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter the full question text here..."
                    rows={4}
                    className="w-full rounded-lg border border-outline bg-surface text-on-surface px-md py-sm font-body-md resize-y"
                  />
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg">
                  <h3 className="font-h2 text-h2 text-on-surface mb-md">Answer Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    {['A', 'B', 'C', 'D'].map((opt, index) => (
                      <div key={opt} className="flex flex-col gap-xs relative">
                        <label className="font-label-caps text-label-caps text-on-surface-variant absolute -top-2 left-3 bg-surface-container-lowest px-1">
                          OPTION {opt}
                        </label>
                        <input
                          value={options[index]}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="h-12 w-full rounded-lg border border-outline bg-transparent text-on-surface px-md pt-2 font-body-md"
                          placeholder={`Option ${opt}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-lg border-t border-surface-variant pt-lg">
                  <div className="flex flex-col gap-xs w-full md:w-1/3">
                    <label className="font-label-caps text-label-caps text-on-surface-variant">
                      CORRECT ANSWER
                    </label>
                    <select
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      className="h-12 w-full rounded-lg border border-outline bg-surface text-on-surface px-md font-body-md"
                    >
                      <option value="">Select Correct Option</option>
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-caps text-label-caps text-on-surface-variant">
                      EXPLANATION (OPTIONAL)
                    </label>
                    <textarea
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      placeholder="Provide reasoning for the correct answer..."
                      rows={3}
                      className="w-full rounded-lg border border-outline bg-surface text-on-surface px-md py-sm font-body-md resize-y"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant">
                  BULK QUESTIONS (One per line)
                </label>
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="Format: question|optionA|optionB|optionC|optionD|correctAnswer|explanation&#10;Example: What is 2+2?|3|4|5|6|4|Correct answer is 4"
                  rows={10}
                  className="w-full rounded-lg border border-outline bg-surface text-on-surface px-md py-sm font-body-md resize-y font-mono text-sm"
                />
                <p className="font-body-sm text-on-surface-variant mt-xs">
                  Use | to separate fields. One question per line.
                </p>
              </div>
            )}

            {message && (
              <div className={`p-md rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {message}
              </div>
            )}

            <div className="flex justify-end items-center gap-md mt-sm border-t border-surface-variant pt-lg">
              <Link to="/uploader" className="h-12 px-xl rounded-full border border-outline text-on-surface font-button text-button hover:bg-surface-container flex items-center">
                Cancel
              </Link>
              <button
                onClick={activeTab === 'single' ? handleSaveSingle : handleSaveBulk}
                disabled={isLoading}
                className="h-12 px-xl rounded-full bg-primary text-on-primary font-button text-button hover:opacity-90 flex items-center gap-2"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">save</span>
                )}
                {activeTab === 'single' ? 'Save Question' : 'Save All Questions'}
              </button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}