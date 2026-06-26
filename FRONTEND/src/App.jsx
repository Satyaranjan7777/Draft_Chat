import { lazy, Suspense, useEffect } from 'react'
import NavBar from './components/NavBar'
import { Route, Routes } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import { Loader } from 'lucide-react'
import {Toaster} from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute'

const HomePage = lazy(() => import('./pages/HomePage'))
const LandingPage = lazy(() => import('./pages/LandingPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SettingPage = lazy(() => import('./pages/SettingPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const FullPageLoader = ({ label = "Loading" }) => (
  <div className='flex h-screen items-center justify-center bg-base-200 text-base-content'>
    <div className='flex items-center gap-3 rounded-full bg-base-100 px-5 py-3 text-sm font-medium shadow-sm ring-1 ring-base-300'>
      <Loader className='h-5 w-5 animate-spin text-primary' />
      {label}
    </div>
  </div>
)

const App = () => {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <FullPageLoader label="Checking your session" />
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <NavBar />

      <Suspense fallback={<FullPageLoader />}>
        <Routes>
          {/* Public routes — accessible from any tab regardless of auth state */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/settings" element={<SettingPage />} />

          {/* Protected routes — each tab guards independently */}
          <Route path="/chat" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      <Toaster />
    </div>
  )
}

export default App
