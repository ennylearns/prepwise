import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAction } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { TopAppBar } from '../../components'

interface User {
  id: string
  email: string
  role: string
}

interface PaymentCallbackProps {
  user: User
}

export default function PaymentCallback({ user }: PaymentCallbackProps) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your payment...')

  const reference = searchParams.get('reference')
  const plan = searchParams.get('plan') as 'monthly' | 'annual' | null

  const verifyPaymentAction = useAction(api.payment.verifyPayment)

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference || !plan) {
        setStatus('error')
        setMessage('Invalid callback. Please try again.')
        return
      }

      try {
        const planType = plan === 'annual' ? 'annual' : 'monthly'
        const result = await verifyPaymentAction({
          userId: user.id as Id<"users">,
          reference,
          plan: planType,
        })

        if (result.success) {
          setStatus('success')
          setMessage('Payment successful! Welcome to Premium.')
          setTimeout(() => {
            navigate('/dashboard')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(result.error || 'Payment verification failed')
        }
      } catch (err) {
        setStatus('error')
        setMessage('An error occurred during verification')
      }
    }

    verifyPayment()
  }, [reference, plan, user.id, verifyPaymentAction, navigate])

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar title="Payment" />

      <main className="p-container-margin py-lg flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center max-w-md">
          {status === 'loading' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary-container mb-lg">
                <span className="material-symbols-outlined text-[40px] animate-spin text-on-secondary-container">
                  sync
                </span>
              </div>
              <h1 className="font-h1 text-h2 mb-md">Verifying Payment...</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Please wait while we confirm your payment.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-lg">
                <span className="material-symbols-outlined text-[40px] text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
              <h1 className="font-h1 text-h2 mb-md">Welcome to Premium!</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
                {message}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Redirecting to dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-lg">
                <span className="material-symbols-outlined text-[40px] text-red-600">
                  error
                </span>
              </div>
              <h1 className="font-h1 text-h2 mb-md">Payment Failed</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
                {message}
              </p>
              <button
                onClick={() => navigate('/upgrade')}
                className="px-lg py-md bg-primary text-on-primary rounded-lg font-body-md hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  )
}