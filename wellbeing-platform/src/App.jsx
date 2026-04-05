import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from './components/layout/AppLayout';
import WeeklyCheckIn from './pages/student/WeeklyCheckIn';
import Feedback from './pages/student/Feedback';
import Dashboard from './pages/teacher/Dashboard';
import StudentsPage from './pages/teacher/StudentsPage';
import StudentDetail from './pages/teacher/StudentDetail';
import GuidedCheckIn from './pages/teacher/GuidedCheckIn';
import Escalation from './pages/teacher/Escalation';
import QuestionsDashboard from './pages/teacher/QuestionsDashboard';
import SystemLogic from './pages/SystemLogic';

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
      <Route element={<AppLayout />}>
        {/* Student routes */}
        <Route path="/" element={<WeeklyCheckIn />} />
        <Route path="/feedback" element={<Feedback />} />

        {/* Teacher routes */}
        <Route path="/teacher" element={<Dashboard />} />
        <Route path="/teacher/students" element={<StudentsPage />} />
        <Route path="/teacher/questions" element={<QuestionsDashboard />} />
        <Route path="/teacher/student/:id" element={<StudentDetail />} />
        <Route path="/teacher/student/:id/checkin" element={<GuidedCheckIn />} />
        <Route path="/teacher/student/:id/escalate" element={<Escalation />} />

        {/* System logic */}
        <Route path="/system-logic" element={<SystemLogic />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
