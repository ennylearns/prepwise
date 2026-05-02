import { useState } from 'react'
import { useAction, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { TopAppBar, Button } from '../../components'

interface User {
  id: string
  email: string
  role: string
  name?: string
}

interface UpgradeProps {
  user: User
}

type Plan = 'monthly' | 'annual'

export default function Upgrade({ user }: UpgradeProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan>('monthly')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializeSubscriptionAction = useAction(api.payment.initializeSubscription)
  const subscription = useQuery(api.payment.getSubscription, { userId: user.id as Id<"users"> })
  
  const isPremium = subscription?.status === 'premium'
  const subscriptionPlan = subscription?.plan

  const plans = {
    monthly: {
      price: 1500,
      interval: '/mo',
      name: 'Premium Monthly',
    },
    annual: {
      price: 15000,
      interval: '/yr',
      name: 'Premium Annual',
    },
  }

  const handleUpgrade = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await initializeSubscriptionAction({
        userId: user.id as Id<"users">,
        email: user.email,
        plan: selectedPlan,
      })

      if (!result.success) {
        setError(result.error || 'Failed to initialize payment')
        setIsLoading(false)
        return
      }

      window.location.href = result.authorizationUrl!
    } catch (err: any) {
      setError(err.message || 'Failed to start payment')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar title="Go Premium" showBack />

      <main className="p-container-margin py-lg flex flex-col items-center max-w-5xl mx-auto">
        {isPremium && subscriptionPlan ? (
          <section className="w-full max-w-md text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-md">
              <span className="material-symbols-outlined text-[32px] text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <h1 className="font-display text-display mb-sm text-on-surface">You're a Premium Member!</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">
              Thank you for your subscription. You have full access to all premium features.
            </p>
            <div className="bg-surface-container rounded-xl p-lg mb-lg text-left">
              <div className="flex justify-between items-center py-md border-b border-outline-variant">
                <span className="font-body-md text-on-surface">Current Plan</span>
                <span className="font-body-md font-medium text-primary">
                  {subscriptionPlan === 'annual' ? 'Premium Annual' : 'Premium Monthly'}
                </span>
              </div>
              <div className="flex justify-between items-center py-md">
                <span className="font-body-md text-on-surface">Status</span>
                <span className="font-body-md font-medium text-green-600">Active</span>
              </div>
            </div>
            <a href="/dashboard" className="inline-flex items-center justify-center w-full py-md bg-primary text-on-primary rounded-lg font-body-md hover:opacity-90 transition-opacity">
              Go to Dashboard
              <span className="material-symbols-outlined ml-sm">arrow_forward</span>
            </a>
          </section>
        ) : (
          <>
          <section className="w-full max-w-md mb-lg">
          <div className="flex rounded-xl bg-surface-container p-xs gap-xs">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`flex-1 py-md px-md rounded-lg font-body-md text-body-md transition-all ${
                selectedPlan === 'monthly'
                  ? 'bg-surface text-on-surface shadow-sm'
                  : 'text-on-surface-variant'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedPlan('annual')}
              className={`flex-1 py-md px-md rounded-lg font-body-md text-body-md transition-all relative ${
                selectedPlan === 'annual'
                  ? 'bg-surface text-on-surface shadow-sm'
                  : 'text-on-surface-variant'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-xs py-xs rounded-full font-label-caps">
                Save ₦3K
              </span>
            </button>
          </div>
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
                <h2 className="font-h2 text-h2 text-on-primary-fixed-variant">
                  {selectedPlan === 'monthly' ? 'Premium Monthly' : 'Premium Annual'}
                </h2>
                <p className="font-body-sm text-body-sm text-on-primary-fixed-variant mt-xs opacity-80">
                  Everything you need to succeed.
                </p>
              </div>
            </div>
            <div className="font-display text-[40px] leading-tight font-bold text-on-primary-fixed-variant mb-lg relative z-10">
              ₦{selectedPlan === 'annual' ? '15,000' : '1,500'}
              <span className="font-body-md text-body-md font-normal opacity-80">
                {plans[selectedPlan].interval}
              </span>
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

        {error && (
          <div className="w-full max-w-md mb-md p-md bg-red-50 border border-red-200 rounded-lg">
            <p className="font-body-md text-red-600 text-center">{error}</p>
          </div>
        )}

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
                Upgrade Now - ₦{selectedPlan === 'annual' ? '15,000' : '1,500'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </>
            )}
          </Button>
          <div className="flex items-center justify-center gap-xs mt-sm text-on-surface-variant opacity-80">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span className="font-body-sm text-body-sm">Secure Payment via Paystack</span>
          </div>
        </section>
        </>
        )}
      </main>
    </div>
  )
}