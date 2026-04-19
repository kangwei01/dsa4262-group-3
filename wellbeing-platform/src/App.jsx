import React from 'react';
import { Toaster } from "sonner"
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

const RESETTABLE_LOCAL_STORAGE_KEYS = [
  'mindbridge_local_student_profiles',
  'mindbridge_local_student_checkins',
  'mindbridge_local_teacher_actions',
  'mindbridge_local_counsellor_cases',
  'mindbridge_local_parent_communications',
  'mindbridge_student_identifier',
  'mindbridge_teacher_session',
  'wellbeing_app_app_id',
  'wellbeing_app_access_token',
  'wellbeing_app_functions_version',
  'wellbeing_app_app_base_url',
  'wellbeing_app_from_url',
  'token',
];

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unknown application error.',
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[AppErrorBoundary] App render failed:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    if (typeof window === 'undefined') return;
    RESETTABLE_LOCAL_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-8 shadow-sm space-y-4">
            <div>
              <h1 className="text-2xl font-semibold">The app hit an unexpected error</h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                This usually happens because of stale local demo data or a local setup mismatch. The app has been stopped safely instead of showing a blank page.
              </p>
            </div>
            <div className="rounded-2xl bg-secondary/30 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Error details</p>
              <p className="text-sm text-foreground mt-2 break-words">{this.state.errorMessage}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
              >
                Reload app
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-secondary/40"
              >
                Reset local demo data
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
    // In local/demo mode, non-auth errors fall through to render the app unauthenticated
    console.warn('[Demo mode] Auth error ignored, continuing without auth:', authError.type, authError.message);
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
    <AppErrorBoundary>
      <AuthProvider>
        <TeacherAccessProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <AuthenticatedApp />
            </Router>
            <Toaster richColors position="top-right" />
          </QueryClientProvider>
        </TeacherAccessProvider>
      </AuthProvider>
    </AppErrorBoundary>
  )
}

export default App
