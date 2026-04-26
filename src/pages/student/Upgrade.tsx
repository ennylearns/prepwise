import { useState } from 'react'
import { TopAppBar, Button } from '../../components'

interface User {
  id: string
  email: string
  role: string
}

interface UpgradeProps {
  user: User
}

export default function Upgrade(_props: UpgradeProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      alert('Payment successful! You now have premium access.')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar title="Go Premium" showBack />
      
      <main className="p-container-margin py-lg flex flex-col items-center max-w-5xl mx-auto">
        <section className="text-center w-full max-w-2xl mb-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container mb-md shadow-sm">
            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              workspace_premium
            </span>
          </div>
          <h1 className="font-display text-display mb-sm">Go Premium</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Unlock your full potential and ace your exams with unlimited tools and resources.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-lg w-full mb-xl">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg flex flex-col shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
            <div className="mb-md">
              <h2 className="font-h2 text-h2 text-on-surface">Free Plan</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Basic access to get started.</p>
            </div>
            <div className="font-display text-[40px] leading-tight font-bold text-on-surface mb-lg">
              ₦0<span className="font-body-md text-body-md text-on-surface-variant font-normal">/mo</span>
            </div>
            <div className="flex-grow flex flex-col gap-md">
              <div className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-outline mt-[2px] text-lg">check_circle</span>
                <span className="font-body-md text-body-md text-on-surface">1 lesson per day</span>
              </div>
              <div className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-outline mt-[2px] text-lg">check_circle</span>
                <span className="font-body-md text-body-md text-on-surface">20 questions limit</span>
              </div>
              <div className="flex items-start gap-sm opacity-50">
                <span className="material-symbols-outlined text-outline mt-[2px] text-lg">cancel</span>
                <span className="font-body-md text-body-md text-on-surface-variant">No Mock exams</span>
              </div>
              <div className="flex items-start gap-sm opacity-50">
                <span className="material-symbols-outlined text-outline mt-[2px] text-lg">cancel</span>
                <span className="font-body-md text-body-md text-on-surface-variant">Offline access</span>
              </div>
            </div>
            <div className="mt-lg pt-lg border-t border-surface-variant text-center">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Your current plan</span>
            </div>
          </div>

          <div className="bg-primary-fixed rounded-xl border-2 border-primary p-lg flex flex-col shadow-[0_8px_16px_rgba(0,0,0,0.08)] relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary rounded-full opacity-10 blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start mb-md relative z-10">
              <div>
                <h2 className="font-h2 text-h2 text-on-primary-fixed-variant">Premium Plan</h2>
                <p className="font-body-sm text-body-sm text-on-primary-fixed-variant mt-xs opacity-80">Everything you need to succeed.</p>
              </div>
              <span className="bg-secondary-container text-on-secondary-container font-label-caps text-label-caps px-sm py-xs rounded-full uppercase tracking-wider">
                Recommended
              </span>
            </div>
            <div className="font-display text-[40px] leading-tight font-bold text-on-primary-fixed-variant mb-lg relative z-10">
              ₦2,500<span className="font-body-md text-body-md font-normal opacity-80">/mo</span>
            </div>
            <div className="flex-grow flex flex-col gap-md relative z-10">
              <div className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-primary mt-[2px] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-body-md text-body-md text-on-primary-fixed-variant font-medium">Unlimited access</span>
              </div>
              <div className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-primary mt-[2px] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-body-md text-body-md text-on-primary-fixed-variant font-medium">Full Mock exams</span>
              </div>
              <div className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-primary mt-[2px] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-body-md text-body-md text-on-primary-fixed-variant font-medium">Offline access to materials</span>
              </div>
              <div className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-primary mt-[2px] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-body-md text-body-md text-on-primary-fixed-variant font-medium">Detailed Analytics</span>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full max-w-md flex flex-col items-center sticky bottom-md bg-surface/90 backdrop-blur-sm p-md rounded-xl shadow-[0_-8px_16px_rgba(0,0,0,0.05)] border border-outline-variant">
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <span className="material-symbols-outlined animate-spin">sync</span>
            ) : (
              <>
                Upgrade Now
                <span className="material-symbols-outlined">arrow_forward</span>
              </>
            )}
          </Button>
          <div className="flex items-center justify-center gap-xs mt-sm text-on-surface-variant opacity-80">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span className="font-body-sm text-body-sm">Secure Payment</span>
          </div>
        </section>
      </main>
    </div>
  )
}