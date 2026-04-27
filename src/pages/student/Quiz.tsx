import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { TopAppBar } from '../../components'

interface User {
  id: string
  email: string
  role: string
}

interface QuizProps {
  user: User
}

export default function Quiz(_props: QuizProps) {
  const { lessonId } = useParams()
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [completed, setCompleted] = useState(false)
  const [submitResult, setSubmitResult] = useState<any>(null)

  const data = useQuery(api.student.getLesson, { lessonId: lessonId as Id<"lessons"> })
  const submitQuiz = useMutation(api.student.submitLessonQuiz)

  if (data === undefined) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }
  const questions = data?.questions || []
  if (questions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">No questions found.</div>
  }

  const question = questions[currentQ]
  const progress = ((currentQ + 1) / questions.length) * 100
  const correctAnswerIndex = question.options.indexOf(question.correctAnswer)

  const handleSelect = (index: number) => {
    setSelected(index)
  }

  const handleSubmit = () => {
    if (selected === null) return
    setShowAnswer(true)
    setAnswers([...answers, question.options[selected]])
    if (selected === correctAnswerIndex) {
      setScore(score + 1)
    }
  }

  const handleNext = async () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
      setSelected(null)
      setShowAnswer(false)
    } else {
      const result = await submitQuiz({
        userId: _props.user.id as Id<"users">,
        lessonId: lessonId as Id<"lessons">,
        answers
      })
      setSubmitResult(result)
      setCompleted(true)
    }
  }

  const finalScore = submitResult ? submitResult.score : ((score / questions.length) * 100).toFixed(0)
  const passed = submitResult ? submitResult.passed : parseInt(finalScore as string) >= 70

  if (completed) {
    return (
      <div className="min-h-screen bg-surface">
        <TopAppBar title="Quiz Results" />
        
        <main className="p-container-margin py-lg flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-xl text-center shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
            <div className={`w-24 h-24 rounded-full mx-auto mb-lg flex items-center justify-center ${passed ? 'bg-primary-container' : 'bg-error-container'}`}>
              <span className={`material-symbols-outlined text-5xl ${passed ? 'text-primary' : 'text-error'}`}>
                {passed ? 'emoji_events' : 'refresh'}
              </span>
            </div>
            
            <h1 className="font-display text-display mb-sm">{passed ? 'Congratulations!' : 'Keep Trying!'}</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">
              You scored {score} out of {questions.length} ({finalScore}%)
            </p>

            <div className="mb-lg">
              <div className="text-on-surface-variant mb-sm">Passing score: 70%</div>
              <div className="h-4 w-64 bg-surface-container-high rounded-full overflow-hidden">
                <div className={`h-full ${passed ? 'bg-primary' : 'bg-error'} rounded-full`} style={{ width: finalScore + '%' }} />
              </div>
            </div>

            <Link
              to={passed ? `/lesson/${lessonId}` : `/lesson/${lessonId}/quiz`}
              className="w-full h-12 bg-primary text-on-primary font-button text-button rounded-full hover:opacity-90 transition-all flex items-center justify-center gap-sm"
            >
              {passed ? 'Continue' : 'Try Again'}
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar title="Practice Quiz" showBack />
      
      <main className="p-container-margin py-lg pb-24 space-y-lg max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-md">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Question {currentQ + 1} of {questions.length}
          </span>
          <span className="font-button text-button text-primary">
            {score} correct
          </span>
        </div>

        <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: progress + '%' }} />
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <h2 className="font-h1 text-h1 text-on-surface mb-lg">{question.question}</h2>
          
          <div className="flex flex-col gap-sm">
            {question.options.map((option, index) => {
              let optionClass = 'border-surface-variant hover:border-primary-fixed-dim hover:bg-surface-container-low'
              if (showAnswer) {
                if (index === correctAnswerIndex) {
                  optionClass = 'border-primary bg-primary-fixed'
                } else if (index === selected) {
                  optionClass = 'border-error bg-error-container'
                }
              } else if (selected === index) {
                optionClass = 'border-primary bg-primary-fixed'
              }

              return (
                <label
                  key={index}
                  className={`flex items-start gap-md p-md border-2 rounded-lg cursor-pointer transition-colors ${optionClass} ${
                    showAnswer ? 'cursor-default' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="option"
                    checked={selected === index}
                    onChange={() => !showAnswer && handleSelect(index)}
                    disabled={showAnswer}
                    className="mt-1"
                  />
                  <span className="font-button text-button text-on-surface-variant mr-sm">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="font-body-lg text-body-lg text-on-surface">{option}</span>
                </label>
              )
            })}
          </div>

          {showAnswer && (
            <div className="mt-lg pt-lg border-t border-surface-variant">
              <div className="flex items-center gap-sm mb-sm">
                <span className={`material-symbols-outlined ${selected === correctAnswerIndex ? 'text-primary' : 'text-error'}`}>
                  {selected === correctAnswerIndex ? 'check_circle' : 'cancel'}
                </span>
                <span className={`font-button text-button ${selected === correctAnswerIndex ? 'text-primary' : 'text-error'}`}>
                  {selected === correctAnswerIndex ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {question.explanation}
              </p>
            </div>
          )}
        </div>

        {!showAnswer ? (
          <button
            onClick={handleSubmit}
            disabled={selected === null}
            className="w-full h-12 bg-primary text-on-primary font-button text-button rounded-full hover:opacity-90 transition-all flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] disabled:opacity-50"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full h-12 bg-primary text-on-primary font-button text-button rounded-full hover:opacity-90 transition-all flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
          >
            {currentQ < questions.length - 1 ? 'Next Question' : 'See Results'}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        )}
      </main>
    </div>
  )
}