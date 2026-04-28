import { ReactNode } from 'react'

interface BottomNavBarProps {
  currentPath: string
}

export function BottomNavBar({ currentPath }: BottomNavBarProps) {
  const navItems = [
    { path: '/dashboard', icon: 'home', label: 'Home' },
    { path: '/subjects', icon: 'menu_book', label: 'Practice' },
    { path: '/progress', icon: 'leaderboard', label: 'Progress' },
    { path: '/upgrade', icon: 'person', label: 'Profile' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-white border-t border-surface-variant shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <a
          key={item.path}
          href={item.path}
          className={`flex flex-col items-center justify-center px-3 py-1 font-lexend text-[12px] font-medium transition-all duration-200 active:scale-95 rounded-xl ${
            currentPath === item.path
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <span className={`material-symbols-outlined mb-xs ${item.icon === 'home' ? 'fill' : ''}`}>
            {item.icon}
          </span>
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  )
}

interface SidebarProps {
  currentPath: string
  role: string
  user?: { email: string } | null
  onLogout?: () => void
}

export function Sidebar({ currentPath, role, user, onLogout }: SidebarProps) {
  const studentNav = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/subjects', icon: 'menu_book', label: 'Practice' },
    { path: '/exam', icon: 'quiz', label: 'Mock Exams' },
    { path: '/progress', icon: 'analytics', label: 'Progress' },
  ]

  const teacherNav = [
    { path: '/teacher', icon: 'dashboard', label: 'Dashboard' },
    { path: '/teacher/lessons', icon: 'edit_note', label: 'Lessons' },
    { path: '/teacher/questions', icon: 'database', label: 'Questions' },
  ]

  const uploaderNav = [
    { path: '/uploader', icon: 'dashboard', label: 'Dashboard' },
    { path: '/uploader/questions', icon: 'upload_file', label: 'Upload' },
  ]

  const navItems = role === 'teacher' ? teacherNav : role === 'uploader' ? uploaderNav : studentNav

  return (
    <nav className="hidden lg:flex flex-col h-screen w-64 border-r border-surface-variant bg-white py-6 px-4 sticky top-0 shrink-0">
      <div className="flex items-center gap-sm mb-lg px-2">
        <span className="material-symbols-outlined text-primary text-3xl">school</span>
        <span className="font-h1 text-h1 text-primary">Prepwise</span>
      </div>
      <ul className="flex flex-col gap-sm">
        {navItems.map((item) => (
          <li key={item.path}>
            <a
              href={item.path}
              className={`flex items-center gap-md px-3 py-2 rounded-lg font-body-md transition-colors ${
                currentPath === item.path
                  ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-4 border-t border-surface-variant flex flex-col gap-sm">
        {user && (
          <div className="px-3 text-sm text-on-surface-variant truncate">
            {user.email}
          </div>
        )}
        {onLogout && (
          <button 
            onClick={onLogout}
            className="flex items-center gap-md px-3 py-2 rounded-lg font-body-md transition-colors text-error hover:bg-error-container hover:text-on-error-container w-full text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        )}
      </div>
    </nav>
  )
}

interface TopAppBarProps {
  title?: string
  showBack?: boolean
  user?: { email: string } | null
  onLogout?: () => void
}

export function TopAppBar({ title, showBack, user, onLogout }: TopAppBarProps) {
  return (
    <header className="sticky top-0 w-full flex justify-between items-center px-4 h-16 bg-slate-50/80 backdrop-blur-md z-50 border-b border-surface-variant">
      <div className="flex items-center gap-sm">
        {showBack && (
          <a href="javascript:history.back()" className="material-symbols-outlined text-on-surface hover:opacity-80">
            arrow_back
          </a>
        )}
        <span className="material-symbols-outlined text-primary text-2xl">school</span>
        <span className="font-h1 text-h1 text-primary">{title || 'Prepwise'}</span>
      </div>
      {user && (
        <div className="flex items-center gap-md">
          <button onClick={onLogout} className="font-button text-button text-primary hover:underline">
            Logout
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-container overflow-hidden border border-outline-variant">
            <span className="material-symbols-outlined text-primary flex items-center justify-center w-full h-full">
              person
            </span>
          </div>
        </div>
      )}
    </header>
  )
}

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-surface-container-lowest rounded-xl border border-outline-variant p-md shadow-[0_2px_4px_rgba(0,0,0,0.04)] ${className}`}>
      {children}
    </div>
  )
}

interface ProgressBarProps {
  value: number
  max?: number
  color?: string
}

export function ProgressBar({ value, max = 100, color = 'bg-primary' }: ProgressBarProps) {
  const percent = Math.min((value / max) * 100, 100)
  return (
    <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
    </div>
  )
}

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'outline'
  disabled?: boolean
  className?: string
}

export function Button({ children, onClick, type = 'button', variant = 'primary', disabled, className = '' }: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-on-primary hover:opacity-90',
    secondary: 'bg-surface-container text-on-surface hover:bg-surface-container-high',
    outline: 'border border-outline text-on-surface hover:bg-surface-container',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`h-12 px-lg rounded-full font-button text-button flex items-center justify-center gap-sm transition-all active:scale-95 disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

interface InputProps {
  label: string
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
}

export function Input({ label, type = 'text', placeholder, value, onChange, required }: InputProps) {
  return (
    <div className="space-y-xs">
      <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="block w-full h-12 px-md rounded-lg border border-outline bg-surface text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
      />
    </div>
  )
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-xl p-lg max-w-lg w-full mx-4 shadow-[0_8px_16px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center mb-md">
          <h2 className="font-h2 text-h2">{title}</h2>
          <button onClick={onClose} className="material-symbols-outlined text-on-surface hover:opacity-80">
            close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}