import { Link } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RiskBadge from '@/components/shared/RiskBadge';
import { useCompleteFollowUpReminder, useFollowUpQueue } from '@/hooks/useWellbeingData';
import { useTeacherAccess } from '@/lib/TeacherAccessContext';

export default function FollowUpQueue() {
  const { teacher } = useTeacherAccess();
  const { data: reminders = [], isLoading } = useFollowUpQueue(teacher);
  const completeReminder = useCompleteFollowUpReminder();

  const handleComplete = async (studentId) => {
    await completeReminder.mutateAsync({
      studentId,
      teacherEmail: teacher?.teacher_identifier || 'wellbeing@school.edu',
    });
    toast.success('Reminder marked complete.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reminders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          List of all active follow-up reminders across students.
        </p>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-5">
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-6">Loading reminders…</p>
          ) : reminders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6">No active reminders right now.</p>
          ) : (
            <div className="space-y-3">
              {reminders.map((item) => (
                <div key={`${item.student_id}-${item.due_at}`} className="rounded-2xl border border-border/60 bg-card p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link to={`/teacher/student/${item.student_id}`} className="text-sm font-semibold text-foreground hover:text-primary">
                          {item.student_name}
                        </Link>
                        <RiskBadge level={item.risk_level} />
                      </div>
                      <p className="text-sm text-foreground">{item.reminder_type}</p>
                      <p className="text-xs text-muted-foreground">
                        Due date: {new Date(item.due_at).toLocaleDateString()} · {item.main_signal}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleComplete(item.student_id)}
                      disabled={completeReminder.isPending}
                    >
                      <CalendarClock className="w-4 h-4" />
                      Mark complete
                    </Button>
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
