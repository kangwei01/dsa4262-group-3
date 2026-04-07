import { Link } from 'react-router-dom';
import { CalendarClock, ChevronRight, Clock3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RiskBadge from '@/components/shared/RiskBadge';
import TrendIndicator from '@/components/shared/TrendIndicator';
import { useTeacherAccess } from '@/lib/TeacherAccessContext';
import { useFollowUpQueue } from '@/hooks/useWellbeingData';

export default function FollowUpQueue() {
  const { teacher } = useTeacherAccess();
  const { data: reminders = [], isLoading } = useFollowUpQueue(teacher);

  const overdue = reminders.filter((item) => item.overdue);
  const upcoming = reminders.filter((item) => !item.overdue);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Follow-up Queue</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Auto-reminders surface here once a teacher logs a follow-up date. Use this page to keep the support loop moving.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <Clock3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{overdue.length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Overdue follow-ups</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{upcoming.length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Upcoming follow-ups</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Teacher reminder queue</h2>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground py-6">Loading follow-up reminders…</p>
          ) : reminders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6">No follow-up reminders recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {reminders.map((item) => (
                <div key={`${item.student_id}-${item.due_at}`} className="rounded-2xl border border-border/60 bg-card p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">{item.student_name}</p>
                        <RiskBadge level={item.risk_level} />
                        <TrendIndicator trend={item.trend} />
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          item.overdue ? 'bg-rose-50 text-rose-700' : 'bg-sky-50 text-sky-700'
                        }`}>
                          {item.overdue ? 'Overdue' : 'Upcoming'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Due on {new Date(item.due_at).toLocaleDateString()} · Main signal: {item.main_signal}
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">{item.note}</p>
                    </div>
                    <Link to={`/teacher/student/${item.student_id}`}>
                      <Button size="sm" variant="outline" className="gap-1.5">
                        Review student
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
