import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { TeacherAccessProvider, useTeacherAccess } from '@/lib/TeacherAccessContext';

import AppLayout from './components/layout/AppLayout';
import WeeklyCheckIn from './pages/student/WeeklyCheckIn';
import Feedback from './pages/student/Feedback';
import Dashboard from './pages/teacher/Dashboard';
import StudentsPage from './pages/teacher/StudentsPage';
import StudentDetail from './pages/teacher/StudentDetail';
import GuidedCheckIn from './pages/teacher/GuidedCheckIn';
import Escalation from './pages/teacher/Escalation';
import ParentContact from './pages/teacher/ParentContact';
import QuestionsDashboard from './pages/teacher/QuestionsDashboard';
import SystemLogic from './pages/SystemLogic';
import TeacherLogin from './pages/teacher/TeacherLogin';
import FollowUpQueue from './pages/teacher/FollowUpQueue';
import CounsellorQueue from './pages/teacher/CounsellorQueue';
import ParentCommunications from './pages/teacher/ParentCommunications';

const TeacherProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isTeacherAuthenticated } = useTeacherAccess();

  if (!isTeacherAuthenticated) {
    return <Navigate to="/teacher/login" replace state={{ from: location }} />;
  }

  return children;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/teacher/login" element={<TeacherLogin />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<WeeklyCheckIn />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route
          path="/teacher"
          element={(
            <TeacherProtectedRoute>
              <Dashboard />
            </TeacherProtectedRoute>
          )}
        />
        <Route
          path="/teacher/students"
          element={(
            <TeacherProtectedRoute>
              <StudentsPage />
            </TeacherProtectedRoute>
          )}
        />
        <Route
          path="/teacher/reminders"
          element={(
            <TeacherProtectedRoute>
              <FollowUpQueue />
            </TeacherProtectedRoute>
          )}
        />
        <Route
          path="/teacher/counsellor"
          element={(
            <TeacherProtectedRoute>
              <CounsellorQueue />
            </TeacherProtectedRoute>
          )}
        />
        <Route
          path="/teacher/communications"
          element={(
            <TeacherProtectedRoute>
              <ParentCommunications />
            </TeacherProtectedRoute>
          )}
        />
        <Route
          path="/teacher/questions"
          element={(
            <TeacherProtectedRoute>
              <QuestionsDashboard />
            </TeacherProtectedRoute>
          )}
        />
        <Route
          path="/teacher/student/:id"
          element={(
            <TeacherProtectedRoute>
              <StudentDetail />
            </TeacherProtectedRoute>
          )}
        />
        <Route
          path="/teacher/student/:id/checkin"
          element={(
            <TeacherProtectedRoute>
              <GuidedCheckIn />
            </TeacherProtectedRoute>
          )}
        />
        <Route
          path="/teacher/student/:id/escalate"
          element={(
            <TeacherProtectedRoute>
              <Escalation />
            </TeacherProtectedRoute>
          )}
        />
        <Route
          path="/teacher/student/:id/parents"
          element={(
            <TeacherProtectedRoute>
              <ParentContact />
            </TeacherProtectedRoute>
          )}
        />
        <Route path="/system-logic" element={<SystemLogic />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <TeacherAccessProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </TeacherAccessProvider>
    </AuthProvider>
  )
}

export default App
