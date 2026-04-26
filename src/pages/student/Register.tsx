import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }
    setIsLoading(true)
    
    setTimeout(() => {
      navigate('/login')
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-container-margin bg-surface">
      <main className="w-full max-w-md bg-surface-container-lowest rounded-xl p-xl space-y-xl">
        <header className="text-center space-y-sm flex flex-col items-center">
          <div className="h-16 w-16 bg-primary-container rounded-2xl flex items-center justify-center mb-sm text-primary">
            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              school
            </span>
          </div>
          <h1 className="font-display text-display text-primary tracking-tight">Prepwise</h1>
          <h2 className="font-h1 text-h1 text-on-surface">Create Account</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[280px] mx-auto">
            Start your journey to acing JAMB with structured preparation.
          </p>
        </header>

        <form className="space-y-lg" onSubmit={handleSubmit}>
          <div className="space-y-xs">
            <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </div>
              <input
                type="text"
                placeholder="John Doe"
                required
                className="block w-full h-12 pl-[44px] pr-md rounded-lg border border-outline bg-surface text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="space-y-xs">
            <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="block w-full h-12 pl-[44px] pr-md rounded-lg border border-outline bg-surface text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="space-y-xs">
            <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="block w-full h-12 pl-[44px] pr-md rounded-lg border border-outline bg-surface text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="space-y-xs">
            <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="block w-full h-12 pl-[44px] pr-md rounded-lg border border-outline bg-surface text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-primary text-on-primary font-button text-button rounded-full hover:opacity-90 transition-all flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.08)] active:scale-95 mt-lg disabled:opacity-50"
          >
            {isLoading ? (
              <span className="material-symbols-outlined animate-spin">sync</span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <footer className="text-center pt-md flex flex-col items-center space-y-md">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </footer>
      </main>
    </div>
  )
}