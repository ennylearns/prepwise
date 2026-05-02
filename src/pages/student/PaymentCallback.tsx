import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAction } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { TopAppBar } from '../../components'

export default function PaymentCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your payment...')

  // Paystack uses 'trxref' parameter, but also accept 'reference'
  const reference = searchParams.get('trxref') || searchParams.get('reference')

  const verifyPaymentByReferenceAction = useAction(api.payment.verifyPaymentByReference)

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setStatus('error')
        setMessage('Invalid callback. Please try again.')
        return
      }

      try {
        const result = await verifyPaymentByReferenceAction({
          reference,
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
  }, [reference, verifyPaymentByReferenceAction, navigate])

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