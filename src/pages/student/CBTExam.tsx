import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TopAppBar } from '../../components'

interface User {
  id: string
  email: string
  role: string
}

interface CBTExamProps {
  user: User
}

const questions = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  subject: ['Physics', 'Chemistry', 'Mathematics', 'English'][i % 4],
  question: `Question ${i + 1}: Sample JAMB question for practice test. (This is a placeholder question ${i + 1})`,
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  correct: Math.floor(Math.random() * 4),
}))

export default function CBTExam(_props: CBTExamProps) {
  const [currentQ, setCurrentQ] = useState(12)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [flagged, setFlagged] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(2 * 60 * 60 + 45 * 60 + 22)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) return
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, isSubmitted])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleSelect = (optionIndex: number) => {
    setAnswers({ ...answers, [currentQ]: optionIndex })
  }

  const toggleFlag = () => {
    if (flagged.includes(currentQ)) {
      setFlagged(flagged.filter(f => f !== currentQ))
    } else {
      setFlagged([...flagged, currentQ])
    }
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
  }

  const calculateScore = () => {
    let correct = 0
    Object.entries(answers).forEach(([q, a]) => {
      if (questions[parseInt(q) - 1].correct === a) correct++
    })
    return ((correct / questions.length) * 100).toFixed(0)
  }

  const question = questions[currentQ - 1]

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-surface">
        <TopAppBar title="Exam Results" />
        
        <main className="p-container-margin py-lg flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-xl text-center shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
            <div className="w-24 h-24 rounded-full mx-auto mb-lg flex items-center justify-center bg-primary-container">
              <span className="material-symbols-outlined text-5xl text-primary">emoji_events</span>
            </div>
            
            <h1 className="font-display text-display mb-sm">Exam Complete!</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">
              You scored {calculateScore()}%
            </p>

            <Link
              to="/dashboard"
              className="w-full h-12 bg-primary text-on-primary font-button text-button rounded-full hover:opacity-90 transition-all flex items-center justify-center gap-sm"
            >
              Back to Dashboard
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 w-full flex justify-between items-center px-md h-16 bg-surface-container-lowest border-b border-surface-variant z-50">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary text-xl">school</span>
          <span className="font-display text-display text-primary tracking-tight">Prepwise</span>
        </div>
        <div className="flex items-center gap-xs bg-surface-container px-sm py-xs rounded-lg border border-outline-variant">
          <span className="material-symbols-outlined text-on-surface-variant text-base">timer</span>
          <span className="font-button text-button text-on-surface tabular-nums">{formatTime(timeLeft)}</span>
        </div>
        <button
          onClick={handleSubmit}
          className="bg-error-container text-on-error-container font-button text-button px-md py-sm rounded-lg flex items-center gap-xs hover:opacity-90"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span className="hidden md:inline">Submit Exam</span>
        </button>
      </header>

      <main className="container mx-auto p-container-margin py-lg grid grid-cols-1 lg:grid-cols-12 gap-lg max-w-7xl">
        <div className="lg:col-span-8 flex flex-col gap-md">
          <div className="flex justify-between items-center pb-sm border-b border-surface-variant">
            <div className="flex items-center gap-sm">
              <span className="bg-primary-container text-on-primary-container font-label-caps text-label-caps px-sm py-xs rounded-full">
                {question.subject}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Question {currentQ} of {questions.length}</span>
            </div>
            <button
              onClick={toggleFlag}
              className={`flex items-center gap-xs font-button text-button px-sm py-xs rounded-md transition-colors ${
                flagged.includes(currentQ) ? 'bg-secondary text-on-secondary' : 'text-secondary hover:bg-secondary-container'
              }`}
            >
              <span className="material-symbols-outlined">{flagged.includes(currentQ) ? 'flag' : 'outlined_flag'}</span>
              <span>Flag for Review</span>
            </button>
          </div>

          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-md md:p-lg shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
            <h2 className="font-h1 text-h1 text-on-surface mb-md">{question.question}</h2>
            
            <div className="flex flex-col gap-sm">
              {question.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-start gap-md p-md border-2 rounded-lg cursor-pointer transition-colors ${
                    answers[currentQ] === index
                      ? 'border-primary bg-primary-fixed shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                      : 'border-surface-variant hover:border-primary-fixed-dim hover:bg-surface-container-low'
                  }`}
                >
                  <input
                    type="radio"
                    name="question"
                    checked={answers[currentQ] === index}
                    onChange={() => handleSelect(index)}
                    className="mt-1 w-5 h-5 text-primary"
                  />
                  <span className={`font-button text-button ${answers[currentQ] === index ? 'text-primary' : 'text-on-surface-variant'} mr-sm`}>
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="font-body-lg text-body-lg text-on-surface">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-sm">
            <button
              onClick={() => setCurrentQ(Math.max(1, currentQ - 1))}
              disabled={currentQ === 1}
              className="flex items-center gap-xs px-lg py-sm border border-outline text-on-surface font-button text-button rounded-full hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined">chevron_left</span>
              Previous
            </button>
            <button
              onClick={() => setCurrentQ(Math.min(questions.length, currentQ + 1))}
              disabled={currentQ === questions.length}
              className="flex items-center gap-xs px-lg py-sm bg-primary text-on-primary font-button text-button rounded-full hover:opacity-90 transition-opacity shadow-[0_4px_12px_rgba(0,0,0,0.1)] disabled:opacity-50"
            >
              Next
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-md">
          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-md shadow-[0_2px_4px_rgba(0,0,0,0.04)] h-full flex flex-col">
            <h3 className="font-h2 text-h2 text-on-surface mb-sm">Question Navigation</h3>
            <div className="flex flex-wrap gap-sm mb-md pb-sm border-b border-surface-variant text-body-sm font-body-sm text-on-surface-variant">
              <div className="flex items-center gap-xs"><span className="w-3 h-3 rounded-full bg-surface-container border border-outline-variant" /> Unanswered</div>
              <div className="flex items-center gap-xs"><span className="w-3 h-3 rounded-full bg-primary" /> Answered</div>
              <div className="flex items-center gap-xs"><span className="w-3 h-3 rounded-full bg-secondary" /> Flagged</div>
            </div>

            <div className="flex gap-xs mb-md overflow-x-auto pb-xs">
              {['Physics', 'Chemistry', 'Mathematics', 'English'].map(s => (
                <button
                  key={s}
                  className="px-sm py-xs border border-outline-variant text-on-surface-variant hover:bg-surface-container font-label-caps text-label-caps rounded-full whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-xs overflow-y-auto pr-xs">
              {Array.from({ length: 40 }, (_, i) => {
                const qNum = i + 1
                const isAnswered = answers[qNum] !== undefined
                const isFlagged = flagged.includes(qNum)
                const isCurrent = currentQ === qNum

                let btnClass = 'bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                if (isFlagged) btnClass = 'bg-secondary text-on-secondary relative'
                else if (isAnswered) btnClass = 'bg-primary text-on-primary'
                else if (isCurrent) btnClass = 'bg-primary-fixed border-2 border-primary text-primary'

                return (
                  <button
                    key={qNum}
                    onClick={() => setCurrentQ(qNum)}
                    className={`w-10 h-10 rounded-lg font-button text-button flex items-center justify-center ${btnClass}`}
                  >
                    {qNum}
                    {isFlagged && <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full translate-x-1/3 -translate-y-1/3" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}