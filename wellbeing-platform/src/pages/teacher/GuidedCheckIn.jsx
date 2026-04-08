import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, MessageSquareText } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLogTeacherAction, useTeacherStudent } from '@/hooks/useWellbeingData';
import { buildFollowUpRecommendation, buildTeacherCheckInPrompts } from '@/lib/wellbeingContent';
import { useTeacherAccess } from '@/lib/TeacherAccessContext';

function buildDefaultFollowUpDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

const outcomeOptions = [
  { value: 'student_receptive', label: 'Student was receptive' },
  { value: 'student_closed', label: 'Student was closed' },
  { value: 'referred_to_counsellor', label: 'Referred to counsellor' },
  { value: 'no_follow_up_needed', label: 'No follow-up needed' },
];

export default function GuidedCheckIn() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { teacher } = useTeacherAccess();
  const { data: student, isLoading } = useTeacherStudent(id, teacher);
  const logTeacherAction = useLogTeacherAction();
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('student_receptive');

  const isReminderMode = searchParams.get('mode') === 'monitor';
  const followUp = useMemo(() => (
    student ? buildFollowUpRecommendation(student) : { days: 14, title: 'Review again in 14 days' }
  ), [student]);
  const [followUpDate, setFollowUpDate] = useState(buildDefaultFollowUpDate(followUp.days));

  if (isLoading) {
    return <div className="py-10 text-sm text-muted-foreground">Loading teacher action flow…</div>;
  }

  if (!student) return null;

  const prompts = buildTeacherCheckInPrompts(student);

  const handleSave = async () => {
    const dueAt = isReminderMode || outcome !== 'no_follow_up_needed'
      ? new Date(`${followUpDate}T08:00:00`).toISOString()
      : null;

    await logTeacherAction.mutateAsync({
      studentId: student.id,
      actionType: isReminderMode ? 'monitor' : 'check_in',
      notes: notes || (isReminderMode ? `Reminder set for ${student.name}.` : 'Private check-in completed.'),
      outcome: isReminderMode ? 'pending' : outcome,
      completed: true,
      followUpDueAt: dueAt,
      teacherEmail: teacher?.teacher_identifier || student.assigned_teacher || 'wellbeing@school.edu',
      replaceFollowUp: true,
    });

    toast.success(
      isReminderMode
        ? `Reminder set — you'll be prompted to review ${student.name} on ${new Date(`${followUpDate}T08:00:00`).toLocaleDateString()}.`
        : 'Check-in log saved.',
    );
    navigate(`/teacher/student/${student.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/teacher/student/${student.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {isReminderMode ? 'Set 2-week monitor reminder' : 'Check in privately'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Suggested draft for teacher review
          </p>
        </div>
      </div>

      {!isReminderMode && (
        <Card className="border-border/60">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquareText className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Suggested check-in script</h2>
            </div>
            <div className="space-y-3">
              {prompts.map((prompt) => (
                <p key={prompt} className="rounded-2xl border border-border/60 bg-secondary/20 p-4 text-sm text-foreground leading-relaxed">
                  {prompt}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              {isReminderMode ? 'Monitor reminder' : 'Log the outcome'}
            </h2>
          </div>

          {!isReminderMode && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Outcome</label>
              <Select value={outcome} onValueChange={setOutcome}>
                <SelectTrigger className="w-full sm:w-72">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {outcomeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {isReminderMode ? 'Reminder date' : 'Review again on'}
            </label>
            <Input
              type="date"
              value={followUpDate}
              onChange={(event) => setFollowUpDate(event.target.value)}
              className="max-w-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Notes</label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={isReminderMode ? 'Optional reminder note' : 'Optional notes from the conversation'}
              className="min-h-[120px]"
            />
          </div>

          <Button onClick={handleSave} disabled={logTeacherAction.isPending} className="w-full">
            {isReminderMode ? 'Save reminder' : 'Save check-in log'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
