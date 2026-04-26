import { TopAppBar, Card, ProgressBar, BottomNavBar } from '../../components'

interface User {
  id: string
  email: string
  role: string
}

interface ProgressProps {
  user: User
}

const progress = {
  streak: 12,
  totalTopics: 45,
  averageScore: 78,
  weakAreas: [
    { subject: 'Chemistry', score: 45 },
    { subject: 'Physics', score: 62 },
    { subject: 'Mathematics', score: 75 },
    { subject: 'English', score: 88 },
  ],
  recentActivity: [
    { date: 'Today', lesson: 'Linear Equations', status: 'completed', score: 90 },
    { date: 'Yesterday', lesson: 'Quadratic Equations', status: 'completed', score: 80 },
    { date: '2 days ago', lesson: 'Word Problems', status: 'completed', score: 70 },
  ],
}

export default function Progress(_props: ProgressProps) {
  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar title="Progress" />
      
      <main className="p-container-margin py-lg space-y-lg pb-24">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <Card className="flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-secondary-container mb-sm text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_fire_department
            </span>
            <span className="font-display text-display text-on-surface">{progress.streak}</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant">Day Streak</span>
          </Card>
          <Card className="flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-primary mb-sm text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              task_alt
            </span>
            <span className="font-display text-display text-on-surface">{progress.totalTopics}</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant">Topics Completed</span>
          </Card>
          <Card className="flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-tertiary mb-sm text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              trending_up
            </span>
            <span className="font-display text-display text-on-surface">{progress.averageScore}%</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant">Average Score</span>
          </Card>
        </section>

        <section>
          <h2 className="font-h2 text-h2 text-on-surface mb-md">Subject Performance</h2>
          <div className="space-y-md">
            {progress.weakAreas.map((area) => (
              <Card key={area.subject} className="flex items-center justify-between">
                <span className="font-body-md text-body-md text-on-surface">{area.subject}</span>
                <div className="flex items-center gap-sm">
                  <ProgressBar value={area.score} color={area.score >= 70 ? 'bg-primary' : 'bg-error'} />
                  <span className="font-button text-button text-on-surface w-12 text-right">{area.score}%</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-h2 text-h2 text-on-surface mb-md">Recent Activity</h2>
          <Card className="divide-y divide-surface-variant">
            {progress.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-md">
                <div>
                  <p className="font-body-md text-body-md text-on-surface">{activity.lesson}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{activity.date}</p>
                </div>
                <div className="flex items-center gap-sm">
                  <span className="font-button text-button text-primary">{activity.score}%</span>
                  <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                </div>
              </div>
            ))}
          </Card>
        </section>
      </main>

      <BottomNavBar currentPath="/progress" />
    </div>
  )
}