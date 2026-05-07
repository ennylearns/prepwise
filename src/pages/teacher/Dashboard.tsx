import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { TopAppBar, Card } from '../../components'

interface User {
  id: string
  email: string
  role: string
}

interface TeacherDashboardProps {
  user: User
  onLogout: () => void
}

type TabType = 'all' | 'draft' | 'ai_generated' | 'pending_review' | 'published'

export default function TeacherDashboard({ user, onLogout }: TeacherDashboardProps) {
  const lessons = useQuery(api.aiGeneration.getTeacherLessons, { teacherId: user.id as Id<"users"> })
  const [activeTab, setActiveTab] = useState<TabType>('draft')

  if (lessons === undefined) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const filteredLessons = activeTab === 'all' 
    ? lessons 
    : lessons.filter(l => l.status === activeTab)

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: lessons.length },
    { key: 'draft', label: 'Needs Generation', count: lessons.filter(l => l.status === 'draft').length },
    { key: 'ai_generated', label: 'Generated', count: lessons.filter(l => l.status === 'ai_generated').length },
    { key: 'pending_review', label: 'Needs Review', count: lessons.filter(l => l.status === 'pending_review').length },
    { key: 'published', label: 'Published', count: lessons.filter(l => l.status === 'published').length },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-xs px-2 py-1 rounded-full bg-surface-container text-on-surface-variant text-[12px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-surface-variant" /> Draft
          </span>
        )
      case 'ai_generated':
        return (
          <span className="inline-flex items-center gap-xs px-2 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[12px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-secondary" /> AI Generated
          </span>
        )
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-xs px-2 py-1 rounded-full bg-primary-container/30 text-on-primary-fixed-variant text-[12px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary" /> Needs Review
          </span>
        )
      case 'published':
        return (
          <span className="inline-flex items-center gap-xs px-2 py-1 rounded-full bg-green-100 text-green-700 text-[12px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Published
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-xs px-2 py-1 rounded-full bg-surface-container text-on-surface-variant text-[12px] font-semibold">
            {status}
          </span>
        )
    }
  }

  const getActionButton = (lesson: any) => {
    switch (lesson.status) {
      case 'draft':
        return (
          <Link
            to="/teacher/lessons/create"
            className="px-md py-sm rounded-full bg-primary text-on-primary font-button text-button hover:opacity-90 transition-colors flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            Generate
          </Link>
        )
      case 'ai_generated':
      case 'pending_review':
        return (
          <Link
            to={`/teacher/lessons/${lesson._id}/review`}
            className="px-md py-sm rounded-full bg-secondary text-on-secondary font-button text-button hover:opacity-90 transition-colors flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            Review
          </Link>
        )
      case 'published':
        return (
          <Link
            to={`/teacher/lessons/${lesson._id}/review`}
            className="px-md py-sm rounded-full border border-outline text-on-surface font-button text-button hover:bg-surface-container transition-colors flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            View
          </Link>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar title="Instructor Dashboard" user={user} onLogout={onLogout} />
      
      <main className="p-container-margin py-lg space-y-lg">
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <h1 className="font-h1 text-h1">Dashboard</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage your lesson content with AI assistance.</p>
          </div>
          <Link
            to="/teacher/lessons/create"
            className="bg-primary text-on-primary font-button text-button px-lg py-sm rounded-full hover:opacity-90 transition-colors flex items-center justify-center gap-xs shadow-[0_4px_12px_rgba(0,63,177,0.2)]"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Generate New Lesson
          </Link>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <Card className="flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-md opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-6xl">edit_note</span>
            </div>
            <div className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">Total Lessons</div>
            <div className="font-display text-display">{lessons.length}</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">folder</span>
              <span>Across all subjects</span>
            </div>
          </Card>
          <Card className="flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-md opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-6xl">auto_awesome</span>
            </div>
            <div className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">AI Generated</div>
            <div className="font-display text-display">
              {lessons.filter(l => l.status === 'ai_generated' || l.status === 'pending_review').length}
            </div>
            <div className="font-body-sm text-body-sm text-primary mt-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>Awaiting review</span>
            </div>
          </Card>
          <Card className="flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-md opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-6xl">check_circle</span>
            </div>
            <div className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">Published</div>
            <div className="font-display text-display">
              {lessons.filter(l => l.status === 'published').length}
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">school</span>
              <span>Available to students</span>
            </div>
          </Card>
        </section>

        <section>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-md border-b border-outline-variant">
              <h2 className="font-h2 text-h2 mb-md">My Lessons</h2>
              <div className="flex flex-wrap gap-sm">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-md py-sm rounded-lg font-body-sm text-body-sm transition-colors flex items-center gap-xs ${
                      activeTab === tab.key
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {tab.label}
                    <span className={`px-sm py-[2px] rounded-full text-xs font-semibold ${
                      activeTab === tab.key
                        ? 'bg-on-primary/20'
                        : 'bg-surface-container'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              {filteredLessons.length === 0 ? (
                <div className="p-lg text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-sm block">inbox</span>
                  <p>No lessons in this category</p>
                  {activeTab === 'draft' && (
                    <Link to="/teacher/lessons/create" className="text-primary hover:underline">
                      Generate your first lesson
                    </Link>
                  )}
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant font-label-caps text-label-caps text-on-surface-variant">
                      <th className="p-md font-semibold">Lesson Title</th>
                      <th className="p-md font-semibold">Subject</th>
                      <th className="p-md font-semibold">Status</th>
                      <th className="p-md font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-surface">
                    {filteredLessons.map((lesson) => (
                      <tr key={lesson._id} className="border-b border-surface-variant hover:bg-surface-container-low transition-colors">
                        <td className="p-md font-medium">
                          <div>{lesson.title}</div>
                          {lesson.generatedAt && (
                            <div className="text-xs text-on-surface-variant mt-xs">
                              Generated: {new Date(lesson.generatedAt).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="p-md">
                          <span className="bg-primary-container/20 text-primary-container px-2 py-1 rounded text-[12px] font-bold">
                            {lesson.subjectName || 'Unknown'}
                          </span>
                        </td>
                        <td className="p-md">
                          {getStatusBadge(lesson.status)}
                        </td>
                        <td className="p-md text-right">
                          {getActionButton(lesson)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
