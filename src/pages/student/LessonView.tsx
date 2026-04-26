import { useParams, Link } from 'react-router-dom'
import { TopAppBar } from '../../components'

interface User {
  id: string
  email: string
  role: string
}

interface LessonViewProps {
  user: User
}

const lessonContent = {
  title: 'Linear Equations',
  content: `
## Introduction to Linear Equations

A linear equation is an algebraic equation in which each term is either a constant or the product of a constant and a single variable. Linear equations can have one or more variables.

### Standard Form

The standard form of a linear equation in one variable is:

**ax + b = 0**

Where:
- a is the coefficient (a ≠ 0)
- b is the constant
- x is the variable

### Example

Solve: 2x + 5 = 15

**Step 1:** Subtract 5 from both sides
2x + 5 - 5 = 15 - 5
2x = 10

**Step 2:** Divide both sides by 2
x = 10/2
**x = 5**

### Key Points

1. Always perform the same operation on both sides
2. The solution is the value that makes the equation true
3. You can check by substituting back into the original equation
  `,
}

export default function LessonView(_props: LessonViewProps) {
  const { lessonId } = useParams()

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar title="Lesson" showBack />
      
      <main className="p-container-margin py-lg pb-24 space-y-lg max-w-2xl mx-auto">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
          <h1 className="font-h1 text-h1 text-on-surface mb-lg">{lessonContent.title}</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
              A linear equation is an algebraic equation in which each term is either a constant or the product of a constant and a single variable. Linear equations can have one or more variables.
            </p>
            
            <h2 className="font-h2 text-h2 text-on-surface mt-lg mb-md">Standard Form</h2>
            <p className="font-body-md text-body-md text-on-surface">
              The standard form of a linear equation in one variable is:
            </p>
            <div className="bg-surface-container p-md rounded-lg text-center my-md">
              <span className="font-display text-display text-primary">ax + b = 0</span>
            </div>
            
            <h2 className="font-h2 text-h2 text-on-surface mt-lg mb-md">Example</h2>
            <p className="font-body-md text-body-md text-on-surface">
              <strong>Solve:</strong> 2x + 5 = 15
            </p>
            <p className="font-body-md text-body-md text-on-surface mt-sm">
              <strong>Step 1:</strong> Subtract 5 from both sides<br/>
              2x = 10
            </p>
            <p className="font-body-md text-body-md text-on-surface mt-sm">
              <strong>Step 2:</strong> Divide both sides by 2<br/>
              <strong>x = 5</strong>
            </p>
          </div>
        </div>

        <Link
          to={`/lesson/${lessonId}/quiz`}
          className="w-full h-12 bg-primary text-on-primary font-button text-button rounded-full hover:opacity-90 transition-all flex items-center justify-center gap-sm shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
        >
          Start Practice
          <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
      </main>
    </div>
  )
}