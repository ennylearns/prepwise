import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { TopAppBar, Button, Card } from '../../components'

interface User {
  id: string
  email: string
  role: string
}

interface LessonReviewProps {
  user: User
}

type SectionType = 'objective' | 'introduction' | 'concepts' | 'examples' | 'mistakes' | 'summary'

interface ParsedContent {
  objective: string
  introduction: string
  concepts: { name: string; explanation: string }[]
  examples: { question: string; solution: string; answer: string }[]
  mistakes: string[]
  summary: string[]
}

export default function LessonReview({ user }: LessonReviewProps) {
  const { lessonId } = useParams()
  const navigate = useNavigate()

  const lesson = useQuery(api.aiGeneration.getLessonForReview, {
    lessonId: lessonId as Id<"lessons">
  })

  const saveContent = useMutation(api.aiGeneration.saveAiContent)
  const publishLesson = useMutation(api.aiGeneration.approveAndPublish)
  const rejectAndRegenerate = useMutation(api.aiGeneration.rejectAndRegenerate)

  const [editedContent, setEditedContent] = useState('')
  const [showOriginal, setShowOriginal] = useState(false)
  const [activeSection, setActiveSection] = useState<SectionType>('objective')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (lesson?.aiGeneratedContent) {
      setEditedContent(lesson.aiGeneratedContent)
    }
  }, [lesson?.aiGeneratedContent])

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">sync</span>
          <p className="mt-md text-on-surface-variant">Loading lesson content...</p>
        </div>
      </div>
    )
  }

  const displayContent = showOriginal ? lesson.aiGeneratedContent : editedContent

  const parseContent = (content: string): ParsedContent | null => {
    try {
      const sections: ParsedContent = {
        objective: '',
        introduction: '',
        concepts: [],
        examples: [],
        mistakes: [],
        summary: [],
      }

      const lines = content.split('\n')
      let currentSection = 'objective'
      let currentConcept: { name: string; explanation: string } | null = null
      let currentExample: { question: string; solution: string; answer: string } | null = null
      let solutionLines: string[] = []
      let inSolution = false

      for (const line of lines) {
        const trimmed = line.trim()

        if (trimmed.includes('LESSON OBJECTIVE')) {
          currentSection = 'objective'
        } else if (trimmed.includes('INTRODUCTION')) {
          currentSection = 'introduction'
        } else if (trimmed.includes('KEY CONCEPTS')) {
          currentSection = 'concepts'
        } else if (trimmed.includes('WORKED EXAMPLES') || trimmed.includes('Example')) {
          if (currentExample) {
            currentExample.solution = solutionLines.join('\n')
            sections.examples.push(currentExample)
          }
          currentSection = 'examples'
          currentExample = { question: '', solution: '', answer: '' }
          solutionLines = []
          inSolution = false
        } else if (trimmed.includes('COMMON MISTAKES')) {
          currentSection = 'mistakes'
        } else if (trimmed.includes('SUMMARY')) {
          currentSection = 'summary'
        } else if (trimmed.startsWith('Concept')) {
          if (currentConcept) {
            sections.concepts.push(currentConcept)
          }
          currentConcept = { name: trimmed, explanation: '' }
        } else if (trimmed.startsWith('Question:') || trimmed.startsWith('* **Question:**')) {
          if (currentExample) {
            currentExample.solution = solutionLines.join('\n')
            sections.examples.push(currentExample)
          }
          currentExample = { 
            question: trimmed.replace('* **Question:**', '').replace('Question:', '').trim(), 
            solution: '', 
            answer: '' 
          }
          solutionLines = []
          inSolution = false
        } else if (trimmed.includes('Solution') || inSolution) {
          if (trimmed.includes('Solution')) {
            inSolution = true
          } else if (trimmed.match(/^\d+\./)) {
            solutionLines.push(trimmed)
          } else if (trimmed.startsWith('* **Final Answer:**') && currentExample) {
            currentExample.answer = trimmed.replace('* **Final Answer:**', '').trim()
          }
        } else if (trimmed.match(/^[•*-]/)) {
          if (currentSection === 'objective' || currentSection === 'introduction') {
            sections[currentSection] += (sections[currentSection] ? '\n' : '') + trimmed.replace(/^[•*-]\s*/, '')
          } else if (currentSection === 'mistakes') {
            sections.mistakes.push(trimmed.replace(/^[•*-]\s*/, ''))
          } else if (currentSection === 'summary') {
            sections.summary.push(trimmed.replace(/^[•*-]\s*/, ''))
          } else if (currentSection === 'concepts' && currentConcept) {
            currentConcept.explanation += (currentConcept.explanation ? '\n' : '') + trimmed.replace(/^[•*-]\s*/, '')
          }
        }
      }

      if (currentConcept) {
        sections.concepts.push(currentConcept)
      }
      if (currentExample) {
        currentExample.solution = solutionLines.join('\n')
        sections.examples.push(currentExample)
      }

      return sections
    } catch {
      return null
    }
  }

  const parsedContent = parseContent(displayContent || '')

  const handleSaveForReview = async () => {
    setIsSaving(true)
    setMessage('')
    try {
      await saveContent({
        lessonId: lessonId as Id<"lessons">,
        content: editedContent,
      })
      setMessage('Content saved! You can continue editing or submit for review.')
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      setMessage(err.message || 'Failed to save content')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    setIsSaving(true)
    setMessage('')
    try {
      await publishLesson({
        lessonId: lessonId as Id<"lessons">,
        content: editedContent,
      })
      setMessage('Lesson published successfully!')
      setTimeout(() => navigate('/teacher'), 2000)
    } catch (err: any) {
      setMessage(err.message || 'Failed to publish lesson')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRegenerate = async () => {
    if (!confirm('This will discard the current AI content. Are you sure you want to regenerate?')) {
      return
    }
    setIsSaving(true)
    setMessage('')
    try {
      await rejectAndRegenerate({
        lessonId: lessonId as Id<"lessons">,
      })
      navigate('/teacher')
    } catch (err: any) {
      setMessage(err.message || 'Failed to regenerate')
    } finally {
      setIsSaving(false)
    }
  }

  const sections: { key: SectionType; label: string; icon: string }[] = [
    { key: 'objective', label: 'Objective', icon: 'target' },
    { key: 'introduction', label: 'Introduction', icon: 'menu_book' },
    { key: 'concepts', label: 'Key Concepts', icon: 'lightbulb' },
    { key: 'examples', label: 'Examples', icon: 'calculate' },
    { key: 'mistakes', label: 'Common Mistakes', icon: 'warning' },
    { key: 'summary', label: 'Summary', icon: 'checklist' },
  ]

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar title="Review Lesson" showBack user={user} onLogout={() => navigate('/teacher')} />
      
      <main className="p-container-margin py-lg space-y-lg max-w-4xl mx-auto pb-24">
        <Card className="p-lg">
          <div className="flex items-start justify-between mb-md">
            <div>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                {lesson.subjectName}
              </span>
              <h1 className="font-h1 text-h1 text-on-surface mt-xs">{lesson.title}</h1>
              <span className={`inline-flex items-center gap-xs px-2 py-1 rounded-full text-xs font-semibold mt-sm ${
                lesson.status === 'ai_generated' ? 'bg-secondary-container text-on-secondary-container' :
                lesson.status === 'pending_review' ? 'bg-primary-container/30 text-on-primary-fixed-variant' :
                'bg-surface-container text-on-surface-variant'
              }`}>
                <span className="w-2 h-2 rounded-full bg-current" />
                {lesson.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-sm">
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className={`px-md py-sm rounded-lg border font-button text-button flex items-center gap-xs transition-colors ${
                  showOriginal 
                    ? 'bg-secondary-container text-on-secondary-container border-secondary-container' 
                    : 'border-outline text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showOriginal ? 'edit_note' : 'visibility'}
                </span>
                {showOriginal ? 'Editing' : 'View Original'}
              </button>
            </div>
          </div>

          <div className="text-sm text-on-surface-variant mt-sm">
            Generated: {lesson.generatedAt 
              ? new Date(lesson.generatedAt).toLocaleString() 
              : 'Not yet generated'}
          </div>
        </Card>

        {message && (
          <div className={`p-md rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            <span className="material-symbols-outlined text-[20px] mr-sm">
              {message.includes('success') ? 'check_circle' : 'error'}
            </span>
            {message}
          </div>
        )}

        <Card className="p-lg">
          <div className="flex flex-wrap gap-sm mb-md border-b border-surface-variant pb-md">
            {sections.map(section => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`px-md py-sm rounded-lg font-button text-button flex items-center gap-xs transition-colors ${
                  activeSection === section.key
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>

          {showOriginal ? (
            <div className="whitespace-pre-wrap font-body-md text-body-md text-on-surface leading-relaxed">
              {displayContent}
            </div>
          ) : (
            <div>
              {activeSection === 'objective' && (
                <div className="space-y-md">
                  <h3 className="font-h2 text-h2 text-on-surface">Lesson Objective</h3>
                  <textarea
                    value={parsedContent?.objective || ''}
                    onChange={(e) => {
                      const updated = parseContent(editedContent) || {} as ParsedContent
                      updated.objective = e.target.value
                      setEditedContent(buildContentFromSections(updated))
                    }}
                    rows={6}
                    className="w-full px-md py-sm rounded-lg border border-outline bg-surface text-on-surface font-body-md resize-y"
                    placeholder="What students should be able to do after this lesson..."
                  />
                </div>
              )}

              {activeSection === 'introduction' && (
                <div className="space-y-md">
                  <h3 className="font-h2 text-h2 text-on-surface">Introduction</h3>
                  <textarea
                    value={parsedContent?.introduction || ''}
                    onChange={(e) => {
                      const updated = parseContent(editedContent) || {} as ParsedContent
                      updated.introduction = e.target.value
                      setEditedContent(buildContentFromSections(updated))
                    }}
                    rows={8}
                    className="w-full px-md py-sm rounded-lg border border-outline bg-surface text-on-surface font-body-md resize-y"
                    placeholder="Explain the topic in simple terms..."
                  />
                </div>
              )}

              {activeSection === 'concepts' && (
                <div className="space-y-md">
                  <h3 className="font-h2 text-h2 text-on-surface">Key Concepts</h3>
                  {(parsedContent?.concepts || []).map((concept, index) => (
                    <div key={index} className="p-md border border-surface-variant rounded-lg">
                      <h4 className="font-button text-button text-primary mb-sm">{concept.name}</h4>
                      <textarea
                        value={concept.explanation}
                        rows={4}
                        className="w-full px-md py-sm rounded-lg border border-outline bg-surface text-on-surface font-body-md resize-y"
                        disabled
                      />
                    </div>
                  ))}
                  <p className="text-sm text-on-surface-variant">
                    Concepts are generated by AI. To modify them, edit the full content below.
                  </p>
                </div>
              )}

              {activeSection === 'examples' && (
                <div className="space-y-md">
                  <h3 className="font-h2 text-h2 text-on-surface">Worked Examples</h3>
                  {(parsedContent?.examples || []).map((example, index) => (
                    <div key={index} className="p-md border border-surface-variant rounded-lg">
                      <h4 className="font-button text-button text-primary mb-sm">Example {index + 1}</h4>
                      <div className="space-y-sm">
                        <div>
                          <span className="font-label-caps text-label-caps text-on-surface-variant">Question:</span>
                          <p className="mt-xs">{example.question}</p>
                        </div>
                        <div>
                          <span className="font-label-caps text-label-caps text-on-surface-variant">Solution:</span>
                          <pre className="mt-xs whitespace-pre-wrap">{example.solution}</pre>
                        </div>
                        <div className="font-semibold">
                          <span className="font-label-caps text-label-caps text-on-surface-variant">Answer: </span>
                          {example.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'mistakes' && (
                <div className="space-y-md">
                  <h3 className="font-h2 text-h2 text-on-surface">Common Mistakes</h3>
                  <div className="space-y-sm">
                    {(parsedContent?.mistakes || []).map((mistake, index) => (
                      <div key={index} className="flex items-start gap-sm p-md border border-surface-variant rounded-lg">
                        <span className="material-symbols-outlined text-error">warning</span>
                        <span>{mistake}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'summary' && (
                <div className="space-y-md">
                  <h3 className="font-h2 text-h2 text-on-surface">Summary</h3>
                  <div className="space-y-sm">
                    {(parsedContent?.summary || []).map((point, index) => (
                      <div key={index} className="flex items-start gap-sm p-md border border-surface-variant rounded-lg">
                        <span className="material-symbols-outlined text-primary fill">check_circle</span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-lg pt-lg border-t border-surface-variant">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                  Full Content (Raw)
                </label>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={20}
                  className="w-full px-md py-sm rounded-lg border border-outline bg-surface text-on-surface font-body-md resize-y font-mono text-sm mt-sm"
                  placeholder="Edit the full content here..."
                />
              </div>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-md">
          <div className="flex gap-md">
            <Button
              variant="outline"
              onClick={handleSaveForReview}
              disabled={isSaving}
              className="flex-1"
            >
              <span className="material-symbols-outlined">save</span>
              Save Progress
            </Button>
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={isSaving}
              className="flex-1"
            >
              <span className="material-symbols-outlined">refresh</span>
              Regenerate
            </Button>
          </div>
          <Button
            onClick={handlePublish}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              <span className="material-symbols-outlined animate-spin">sync</span>
            ) : (
              <>
                <span className="material-symbols-outlined">publish</span>
                Approve & Publish
              </>
            )}
          </Button>
        </div>

        <div className="text-center text-sm text-on-surface-variant">
          <p>Note: Questions should be added separately after publishing.</p>
          <Link to="/teacher" className="text-primary hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}

function buildContentFromSections(sections: ParsedContent): string {
  let content = `# **Prepwise Lesson Document Template**

---

## **LESSON DETAILS**

* **Subject:** Lesson
* **Lesson Topic:** Content
* **Teacher Name:** AI Assistant

---

## **1. LESSON OBJECTIVE**

${sections.objective || '* Objective here...'}

---

## **2. INTRODUCTION**

${sections.introduction || '* Introduction here...'}

---

## **3. KEY CONCEPTS**

${(sections.concepts || []).map(c => `### ${c.name}

* ${c.explanation}
`).join('\n')}

---

## **4. WORKED EXAMPLES**

${(sections.examples || []).map((e, i) => `### Example ${i + 1}

* **Question:** ${e.question}
* **Solution (step-by-step):**
  ${e.solution.split('\n').map((s: string) => `${s}`).join('\n  ')}
* **Final Answer:** ${e.answer}
`).join('\n')}

---

## **5. COMMON MISTAKES**

${(sections.mistakes || []).map(m => `* ${m}`).join('\n')}

---

## **6. SUMMARY**

${(sections.summary || []).map(s => `* ${s}`).join('\n')}

---

# **IMPORTANT RULES**

* Do NOT skip sections
* Do NOT give vague explanations
* Keep everything clear and structured`

  return content
}
