import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashBoardPage from './pages/DashboardPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import FeedsPage from './pages/FeedsPage'
import FeedItemsPage from './pages/FeedItemsPage'
import NavBar from './components/NavBar'
import { useAuth } from './hooks/useAuth'
import DiscoverPage from './pages/DiscoverPage'

export default function App() {
  const { status } = useAuth()

  return (
    <>
      {status === 'authenticated' && <NavBar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashBoardPage />
            </ProtectedRoute>
          } />
        <Route
          path="/feeds"
          element={
            <ProtectedRoute>
              <FeedsPage />
            </ProtectedRoute>
          } />
        <Route
          path="/discover"
          element={
            <ProtectedRoute>
              <DiscoverPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feeds/:id"
          element={
            <ProtectedRoute>
              <FeedItemsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}