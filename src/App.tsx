import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/student/Login'
import Register from './pages/student/Register'
import Dashboard from './pages/student/Dashboard'
import LessonTree from './pages/student/LessonTree'
import LessonView from './pages/student/LessonView'
import Quiz from './pages/student/Quiz'
import CBTExam from './pages/student/CBTExam'
import Progress from './pages/student/Progress'
import Upgrade from './pages/student/Upgrade'
import PaymentCallback from './pages/student/PaymentCallback'
import TeacherDashboard from './pages/teacher/Dashboard'
import CreateLesson from './pages/teacher/CreateLesson'
import UploaderDashboard from './pages/uploader/Dashboard'

function App() {
  const [user, setUser] = useState<{ id: string; email: string; role: string } | null>(null)

  const handleLogin = (userData: { id: string; email: string; role: string }) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/subjects" element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/subject/:subjectId/tree" element={user ? <LessonTree user={user} /> : <Navigate to="/login" />} />
        <Route path="/lesson/:lessonId" element={user ? <LessonView user={user} /> : <Navigate to="/login" />} />
        <Route path="/lesson/:lessonId/quiz" element={user ? <Quiz user={user} /> : <Navigate to="/login" />} />
        <Route path="/exam" element={user ? <CBTExam user={user} /> : <Navigate to="/login" />} />
        <Route path="/progress" element={user ? <Progress user={user} /> : <Navigate to="/login" />} />
        <Route path="/upgrade" element={user ? <Upgrade user={user} /> : <Navigate to="/login" />} />
        <Route path="/payment-callback" element={<PaymentCallback />} />
        
        <Route path="/teacher" element={user?.role === 'teacher' ? <TeacherDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/teacher/lessons/create" element={user?.role === 'teacher' ? <CreateLesson user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        
        <Route path="/uploader" element={user?.role === 'uploader' ? <UploaderDashboard user={user} /> : <Navigate to="/login" />} />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App