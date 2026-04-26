import { Link } from 'react-router-dom'
import { BottomNavBar, TopAppBar, Card, ProgressBar } from '../../components'

interface User {
  id: string
  email: string
  role: string
}

interface DashboardProps {
  user: User
  onLogout: () => void
}

const subjects = [
  { id: 'math', name: 'Mathematics', icon: 'calculate', progress: 65, color: 'bg-blue-50 text-primary', tag: 'Core' },
  { id: 'english', name: 'English', icon: 'menu_book', progress: 80, color: 'bg-tertiary-fixed text-tertiary', tag: 'Core' },
  { id: 'physics', name: 'Physics', icon: 'science', progress: 40, color: 'bg-secondary-fixed text-secondary-container', tag: 'Science' },
  { id: 'chemistry', name: 'Chemistry', icon: 'experiment', progress: 25, color: 'bg-error-container text-error', tag: 'Science' },
]

const stats = {
  streak: 12,
  topicsDone: 45,
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar user={user} onLogout={onLogout} />
      
      <main className="p-container-margin md:p-lg space-y-xl pb-24">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="col-span-1 md:col-span-2 bg-primary text-on-primary rounded-xl p-lg relative overflow-hidden flex flex-col justify-center shadow-[0_8px_16px_rgba(0,0,0,0.08)]">
            <div className="relative z-10">
              <h1 className="font-display text-display mb-sm">Welcome back!</h1>
              <p className="font-body-lg text-body-lg opacity-90 max-w-md">You're making great progress. Ready to tackle today's topics?</p>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/20 to-transparent pointer-events-none" />
          </div>
          
          <div className="col-span-1 grid grid-cols-2 gap-sm">
            <Card className="flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-secondary-container mb-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
              <span className="font-h1 text-h1 text-on-surface">{stats.streak}</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant">DAY STREAK</span>
            </Card>
            <Card className="flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-primary mb-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                task_alt
              </span>
              <span className="font-h1 text-h1 text-on-surface">{stats.topicsDone}</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant">TOPICS DONE</span>
            </Card>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-end mb-md">
            <h2 className="font-h2 text-h2 text-on-surface">Your Subjects</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                to={`/subject/${subject.id}/tree`}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md shadow-[0_2px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] transition-all duration-200 group block"
              >
                <div className="flex justify-between items-start mb-md">
                  <div className={`h-12 w-12 rounded-lg ${subject.color} flex items-center justify-center`}>
                    <span className="material-symbols-outlined">{subject.icon}</span>
                  </div>
                  <span className="font-label-caps text-label-caps bg-surface-container text-on-surface-variant px-2 py-1 rounded">
                    {subject.tag}
                  </span>
                </div>
                <h3 className="font-h2 text-h2 text-on-surface mb-xs">{subject.name}</h3>
                <div>
                  <div className="flex justify-between font-label-caps text-label-caps mb-xs">
                    <span className="text-on-surface-variant">Progress</span>
                    <span className="text-primary font-bold">{subject.progress}%</span>
                  </div>
                  <ProgressBar value={subject.progress} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-h2 text-h2 text-on-surface mb-md">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <Link
              to="/exam"
              className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md shadow-[0_2px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] transition-all duration-200 flex items-center gap-md"
            >
              <div className="h-12 w-12 rounded-lg bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">quiz</span>
              </div>
              <div>
                <h3 className="font-h2 text-h2 text-on-surface">Take Mock Exam</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Practice with past JAMB questions</p>
              </div>
            </Link>
            <Link
              to="/upgrade"
              className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md shadow-[0_2px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] transition-all duration-200 flex items-center gap-md"
            >
              <div className="h-12 w-12 rounded-lg bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container">workspace_premium</span>
              </div>
              <div>
                <h3 className="font-h2 text-h2 text-on-surface">Upgrade to Premium</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Unlock unlimited access</p>
              </div>
            </Link>
          </div>
        </section>
      </main>

      <BottomNavBar currentPath="/dashboard" />
    </div>
  )
}