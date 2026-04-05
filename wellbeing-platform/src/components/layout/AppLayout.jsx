import { Outlet, Link, useLocation } from 'react-router-dom';
import { Heart, LayoutDashboard, Users, ShieldCheck, BarChart3, BookOpen, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';

const teacherNav = [
  { label: 'Dashboard', path: '/teacher', icon: LayoutDashboard },
  { label: 'Students', path: '/teacher/students', icon: Users },
  { label: 'Questions', path: '/teacher/questions', icon: ListChecks },
  { label: 'System Logic', path: '/system-logic', icon: BarChart3 },
];

const studentNav = [
  { label: 'Weekly Check-in', path: '/', icon: BookOpen },
  { label: 'System Logic', path: '/system-logic', icon: BarChart3 },
];


export default function AppLayout() {
  const location = useLocation();
  const isTeacher = location.pathname.startsWith('/teacher');
  const nav = isTeacher ? teacherNav : studentNav;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="font-semibold text-foreground text-sm tracking-tight">MindBridge</span>
              <span className="text-[10px] text-muted-foreground block -mt-0.5">Early Support System</span>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
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

          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </header>

      {/* Privacy banner */}
      <div className="bg-primary/5 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-2 text-xs text-primary">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Your data is private and secure. Only your assigned teacher can view anonymized wellbeing trends.</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        <Outlet />
      </main>
    </div>
  );
}
