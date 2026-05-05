import { Link } from 'react-router-dom'
import { TopAppBar, Card } from '../../components'

interface User {
  id: string
  email: string
  role: string
}

interface UploaderDashboardProps {
  user: User
}

const stats = {
  totalQuestions: 5420,
  lastUpload: 'Today',
  pending: 45,
}

const recentQuestions = [
  { id: 1, subject: 'Mathematics', year: 2024, question: 'Calculate the value of x...', status: 'approved' },
  { id: 2, subject: 'Physics', year: 2023, question: 'A projectile is fired with...', status: 'pending' },
  { id: 3, subject: 'Chemistry', year: 2024, question: 'The electronic configuration...', status: 'approved' },
]

export default function UploaderDashboard({ user }: UploaderDashboardProps) {
  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar title="Question Upload" user={user} />
      
      <main className="p-container-margin py-lg space-y-lg">
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <h1 className="font-h1 text-h1">Dashboard</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage JAMB past questions database.</p>
          </div>
          <Link
            to="/uploader/questions"
            className="bg-primary text-on-primary font-button text-button px-lg py-sm rounded-full hover:opacity-90 transition-colors flex items-center justify-center gap-xs shadow-[0_4px_12px_rgba(0,63,177,0.2)]"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add Question
          </Link>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <Card className="flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-md opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-6xl">quiz</span>
            </div>
            <div className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">Total Questions</div>
            <div className="font-display text-display">{stats.totalQuestions.toLocaleString()}</div>
            <div className="font-body-sm text-body-sm text-primary mt-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+120 this week</span>
            </div>
          </Card>
          <Card className="flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-md opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-6xl">cloud_upload</span>
            </div>
            <div className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">Last Upload</div>
            <div className="font-display text-display">{stats.lastUpload}</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>2 hours ago</span>
            </div>
          </Card>
          <Card className="flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-md opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-6xl">pending</span>
            </div>
            <div className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">Pending Review</div>
            <div className="font-display text-display">{stats.pending}</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">hourglass_empty</span>
              <span>Awaiting approval</span>
            </div>
          </Card>
        </section>

        <section>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-md border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-h2 text-h2">Recent Questions</h2>
              <button className="text-primary font-button text-button hover:underline text-sm">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant font-label-caps text-label-caps text-on-surface-variant">
                    <th className="p-md font-semibold">Subject</th>
                    <th className="p-md font-semibold">Year</th>
                    <th className="p-md font-semibold w-1/2">Question</th>
                    <th className="p-md font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface">
                  {recentQuestions.map((q) => (
                    <tr key={q.id} className="border-b border-surface-variant hover:bg-surface-container-low transition-colors">
                      <td className="p-md">
                        <span className="bg-primary-container/20 text-primary-container px-2 py-1 rounded text-[12px] font-bold">
                          {q.subject}
                        </span>
                      </td>
                      <td className="p-md">{q.year}</td>
                      <td className="p-md font-medium truncate max-w-xs">{q.question}</td>
                      <td className="p-md text-center">
                        {q.status === 'approved' ? (
                          <span className="inline-flex items-center gap-xs px-2 py-1 rounded-full bg-primary-container/30 text-on-primary-fixed-variant text-[12px] font-semibold">
                            <span className="w-2 h-2 rounded-full bg-primary" /> Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-xs px-2 py-1 rounded-full bg-secondary-container/30 text-on-secondary-container text-[12px] font-semibold">
                            <span className="w-2 h-2 rounded-full bg-secondary" /> Pending
                          </span>
                        )}
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