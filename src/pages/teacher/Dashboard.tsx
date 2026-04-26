import { Link } from 'react-router-dom'
import { TopAppBar, Card } from '../../components'

interface User {
  id: string
  email: string
  role: string
}

interface TeacherDashboardProps {
  user: User
}

const stats = {
  activeLessons: 24,
  totalStudents: 1492,
}

const lessons = [
  { id: 1, title: 'Advanced Trigonometry Strategies', subject: 'Mathematics', status: 'published' },
  { id: 2, title: 'Calculus Fundamentals', subject: 'Mathematics', status: 'draft' },
  { id: 3, title: 'Algebraic Equations', subject: 'Mathematics', status: 'published' },
  { id: 4, title: 'Geometry & Spatial Reasoning', subject: 'Mathematics', status: 'published' },
]

export default function TeacherDashboard({ user }: TeacherDashboardProps) {
  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar title="Instructor Dashboard" user={user} />
      
      <main className="p-container-margin py-lg space-y-lg">
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <h1 className="font-h1 text-h1">Dashboard</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Welcome back. Here's what's happening with your classes.</p>
          </div>
          <Link
            to="/teacher/lessons/create"
            className="bg-primary text-on-primary font-button text-button px-lg py-sm rounded-full hover:opacity-90 transition-colors flex items-center justify-center gap-xs shadow-[0_4px_12px_rgba(0,63,177,0.2)]"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Create Lesson
          </Link>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <Card className="flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-md opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-6xl">edit_note</span>
            </div>
            <div className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">Active Lessons</div>
            <div className="font-display text-display">{stats.activeLessons}</div>
            <div className="font-body-sm text-body-sm text-primary mt-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+3 this week</span>
            </div>
          </Card>
          <Card className="flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-md opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-6xl">groups</span>
            </div>
            <div className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">Total Students</div>
            <div className="font-display text-display">{stats.totalStudents.toLocaleString()}</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">horizontal_rule</span>
              <span>Steady engagement</span>
            </div>
          </Card>
        </section>

        <section>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-md border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-h2 text-h2">My Lessons</h2>
              <button className="text-primary font-button text-button hover:underline text-sm">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant font-label-caps text-label-caps text-on-surface-variant">
                    <th className="p-md font-semibold w-1/2">Lesson Title</th>
                    <th className="p-md font-semibold">Subject</th>
                    <th className="p-md font-semibold text-center">Status</th>
                    <th className="p-md font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface">
                  {lessons.map((lesson) => (
                    <tr key={lesson.id} className="border-b border-surface-variant hover:bg-surface-container-low transition-colors">
                      <td className="p-md font-medium">{lesson.title}</td>
                      <td className="p-md">
                        <span className="bg-primary-container/20 text-primary-container px-2 py-1 rounded text-[12px] font-bold">
                          {lesson.subject}
                        </span>
                      </td>
                      <td className="p-md text-center">
                        {lesson.status === 'published' ? (
                          <span className="inline-flex items-center gap-xs px-2 py-1 rounded-full bg-primary-container/30 text-on-primary-fixed-variant text-[12px] font-semibold">
                            <span className="w-2 h-2 rounded-full bg-primary" /> Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-xs px-2 py-1 rounded-full bg-surface-variant text-on-surface-variant text-[12px] font-semibold">
                            <span className="w-2 h-2 rounded-full bg-outline" /> Draft
                          </span>
                        )}
                      </td>
                      <td className="p-md text-right">
                        <button className="hover:text-primary transition-colors p-1">
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}