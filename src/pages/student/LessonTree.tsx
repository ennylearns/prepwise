import { useParams, Link } from 'react-router-dom'
import { BottomNavBar, TopAppBar, Card } from '../../components'

interface User {
  id: string
  email: string
  role: string
}

interface LessonTreeProps {
  user: User
}

const subjectData = {
  math: {
    name: 'Mathematics',
    section: 'Section 1: Algebra Basics',
    unit: 'Unit 1',
    completed: 2,
    total: 5,
  },
}

const topics = [
  { id: 1, title: 'Equations', status: 'completed' },
  { id: 2, title: 'Inequalities', status: 'completed' },
  { id: 3, title: 'Polynomials', status: 'active' },
  { id: 4, title: 'Factoring', status: 'locked' },
  { id: 5, title: 'Graphing', status: 'locked' },
]

export default function LessonTree(_props: LessonTreeProps) {
  const { subjectId } = useParams()
  const subject = subjectData[subjectId as keyof typeof subjectData] || subjectData.math

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar title={subject.name} />
      
      <main className="p-container-margin py-lg flex flex-col items-center relative overflow-hidden pb-24">
        <Card className="w-full text-center relative overflow-hidden mb-xl">
          <div className="absolute top-0 left-0 w-full h-2 bg-secondary-container" />
          <h1 className="font-h1 text-h1 mt-2">{subject.name}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">{subject.section}</p>
          <div className="flex justify-center items-center gap-4 mt-4">
            <div className="flex items-center gap-1 text-secondary-container font-label-caps text-label-caps">
              <span className="material-symbols-outlined text-[18px] fill">star</span>
              <span>{subject.completed}/{subject.total}</span>
            </div>
            <div className="flex items-center gap-1 text-primary font-label-caps text-label-caps">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              <span>{subject.unit}</span>
            </div>
          </div>
        </Card>

        <div className="relative w-full max-w-[400px] flex flex-col items-center py-8">
          <div className="absolute top-8 bottom-24 left-1/2 -translate-x-1/2 w-2 z-0">
            <div className="w-full h-[35%] bg-primary rounded-t-full relative z-10 shadow-[0_0_10px_rgba(0,63,177,0.3)]" />
            <div className="h-[65%] bg-surface-variant opacity-50" />
          </div>

          {topics.map((topic, index) => (
            <div
              key={topic.id}
              className={`relative z-10 flex flex-col items-center mb-16 ${
                index % 2 === 0 ? '-translate-x-12' : index % 2 === 1 ? 'translate-x-16' : ''
              }`}
            >
              {topic.status === 'completed' && (
                <Link
                  to={`/lesson/${topic.id}`}
                  className="w-[72px] h-[72px] rounded-full bg-primary flex items-center justify-center shadow-[0_8px_16px_rgba(0,63,177,0.2)] hover:scale-105 transition-transform active:scale-95 border-[4px] border-surface-bright ring-4 ring-primary-fixed relative"
                >
                  <span className="material-symbols-outlined text-white text-3xl fill">done</span>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center border-2 border-surface-bright shadow-sm">
                    <span className="material-symbols-outlined text-on-secondary-container text-[16px] fill">star</span>
                  </div>
                </Link>
              )}
              {topic.status === 'active' && (
                <Link
                  to={`/lesson/${topic.id}`}
                  className="relative flex flex-col items-center"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[72px] h-[72px] rounded-full bg-primary-fixed animate-ping opacity-75" />
                  <button className="w-[88px] h-[88px] rounded-full bg-white border-[6px] border-primary flex items-center justify-center shadow-[0_8px_24px_rgba(0,63,177,0.3)] hover:scale-105 transition-transform active:scale-95 relative bg-gradient-to-b from-white to-primary-fixed">
                    <span className="material-symbols-outlined text-primary text-4xl">functions</span>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-0.5 rounded text-xs font-bold text-primary border border-outline-variant whitespace-nowrap">
                      START
                    </div>
                  </button>
                  <span className="mt-4 font-h2 text-h2 text-primary">{topic.title}</span>
                </Link>
              )}
              {topic.status === 'locked' && (
                <div className="flex flex-col items-center">
                  <div className="w-[72px] h-[72px] rounded-full bg-surface-container-highest flex items-center justify-center border-[4px] border-surface-bright shadow-sm opacity-80 cursor-not-allowed">
                    <span className="material-symbols-outlined text-outline text-3xl">lock</span>
                  </div>
                  <span className="mt-3 font-button text-button text-outline opacity-80">{topic.title}</span>
                </div>
              )}
            </div>
          ))}

          <div className="relative z-10 flex flex-col items-center mt-4">
            <div className="w-24 h-24 rounded-2xl bg-surface-variant flex items-center justify-center shadow-md border-2 border-outline-variant relative overflow-hidden">
              <span className="material-symbols-outlined text-outline text-5xl">inventory_2</span>
            </div>
            <span className="mt-3 font-label-caps text-label-caps text-outline-variant">UNIT 1 EXAM</span>
          </div>
        </div>
      </main>

      <BottomNavBar currentPath="/subjects" />
    </div>
  )
}