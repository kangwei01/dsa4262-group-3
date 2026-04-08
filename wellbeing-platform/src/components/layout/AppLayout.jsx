import { Outlet, Link, useLocation } from 'react-router-dom';
import { Heart, LayoutDashboard, Users, ShieldCheck, BookOpen, CalendarClock, ClipboardList, Mail, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTeacherAccess } from '@/lib/TeacherAccessContext';

const teacherNav = [
  { label: 'Dashboard', path: '/teacher', icon: LayoutDashboard },
  { label: 'Students', path: '/teacher/students', icon: Users },
  { label: 'Reminders', path: '/teacher/reminders', icon: CalendarClock },
  { label: 'Counsellor', path: '/teacher/counsellor', icon: ClipboardList },
  { label: 'Parents', path: '/teacher/communications', icon: Mail },
];

const studentNav = [
  { label: 'Weekly Check-in', path: '/', icon: BookOpen },
];


export default function AppLayout() {
  const location = useLocation();
  const isTeacher = location.pathname.startsWith('/teacher');
  const nav = isTeacher ? teacherNav : studentNav;
  const { teacher, logout, isTeacherAuthenticated } = useTeacherAccess();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-16 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="font-semibold text-foreground text-sm tracking-tight">MindBridge</span>
              <span className="text-[10px] text-muted-foreground block -mt-0.5">Early Support System</span>
            </div>
          </Link>

          <nav className="flex items-center gap-1 flex-wrap justify-center">
            {nav.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {isTeacher && isTeacherAuthenticated && teacher && (
              <div className="hidden lg:flex items-center gap-2 mr-2 rounded-full bg-secondary px-3 py-1.5">
                <span className="text-xs font-medium text-foreground">{teacher.name}</span>
                <span className="text-[10px] text-muted-foreground">{teacher.teacher_identifier}</span>
              </div>
            )}
            <Link
              to="/"
              className={cn(
                "text-xs px-3 py-1.5 rounded-full font-medium transition-all",
                !isTeacher ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
              )}
            >
              Student
            </Link>
            <Link
              to="/teacher"
              className={cn(
                "text-xs px-3 py-1.5 rounded-full font-medium transition-all",
                isTeacher ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
              )}
            >
              Teacher
            </Link>
            {isTeacher && isTeacherAuthenticated && (
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium bg-secondary text-secondary-foreground hover:bg-muted transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>
      {isTeacher && (
        <div className="bg-primary/5 border-b border-primary/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-2 text-xs text-primary">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Student responses are confidential and for support purposes only.</span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        <Outlet />
      </main>
    </div>
  );
}
