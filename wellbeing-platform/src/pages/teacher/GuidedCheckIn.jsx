import { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CalendarClock, Check, Copy, MessageSquare, ThumbsDown, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { useLogTeacherAction, useTeacherStudent } from '@/hooks/useWellbeingData';
import {
  buildFollowUpRecommendation,
  buildTeacherCheckInPrompts,
  doTips,
  dontTips,
  observeNextTips,
} from '@/lib/wellbeingContent';
import { useTeacherAccess } from '@/lib/TeacherAccessContext';

function buildDefaultFollowUpDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export default function GuidedCheckIn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { teacher } = useTeacherAccess();
  const { data: student, isLoading } = useTeacherStudent(id, teacher);
  const logTeacherAction = useLogTeacherAction();
  const [completed, setCompleted] = useState(true);
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('pending');

  const followUp = useMemo(() => (
    student ? buildFollowUpRecommendation(student) : { days: 14, title: 'Review again in 14 days', reason: '' }
  ), [student]);
  const [followUpDate, setFollowUpDate] = useState(buildDefaultFollowUpDate(14));

  if (isLoading) {
    return <div className="max-w-3xl mx-auto py-10 text-sm text-muted-foreground">Loading student check-in guide…</div>;
  }

  if (!student) return null;

  const prompts = buildTeacherCheckInPrompts(student);
  const observationCategory = student.key_factors[0]?.category || 'general';
  const observationTips = observeNextTips[observationCategory] || observeNextTips.general;

  const handleSave = async () => {
    await logTeacherAction.mutateAsync({
      studentId: student.id,
      actionType: 'check_in',
      notes,
      outcome,
      completed,
      followUpDueAt: followUpDate ? new Date(`${followUpDate}T08:00:00`).toISOString() : null,
      teacherEmail: teacher?.teacher_identifier || student.assigned_teacher || 'wellbeing@school.edu',
    });
    toast.success('Check-in and follow-up plan saved');
    navigate(`/teacher/student/${student.id}`);
  };

  const copyPrompt = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/teacher/student/${student.id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Teacher Check-in Guide</h1>
          <p className="text-sm text-muted-foreground">Act → Record → Follow-up for {student.name}</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">Personalised conversation prompts</h3>
          </div>
          <div className="space-y-2">
            {prompts.map((prompt) => (
              <div key={prompt} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 group">
                <p className="text-sm text-foreground italic flex-1">"{prompt}"</p>
                <button onClick={() => copyPrompt(prompt)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <ThumbsUp className="w-4 h-4 text-emerald-600" />
              <h3 className="font-semibold text-sm text-emerald-700">Do</h3>
            </div>
            <ul className="space-y-2">
              {doTips.map((tip) => (
                <li key={tip} className="text-xs text-emerald-700 flex items-start gap-2">
                  <Check className="w-3 h-3 mt-0.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-rose-50/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <ThumbsDown className="w-4 h-4 text-rose-600" />
              <h3 className="font-semibold text-sm text-rose-700">Don't</h3>
            </div>
            <ul className="space-y-2">
              {dontTips.map((tip) => (
                <li key={tip} className="text-xs text-rose-700 flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">✕</span>
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 border-sky-200 bg-sky-50/30">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <CalendarClock className="w-4 h-4 text-sky-600" />
            <h3 className="font-semibold text-sm text-sky-700">What to look for next</h3>
          </div>
          <p className="text-xs text-sky-700/80 mb-3">{followUp.reason}</p>
          <div className="space-y-2">
            {observationTips.map((tip) => (
              <div key={tip} className="flex items-start gap-2 text-xs text-sky-700">
                <span className="shrink-0 mt-0.5">→</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-5">
          <h3 className="font-semibold text-sm text-foreground">Record this action</h3>

          <div className="flex items-center gap-3">
            <Checkbox checked={completed} onCheckedChange={setCompleted} id="completed" />
            <label htmlFor="completed" className="text-sm text-foreground cursor-pointer">
              Teacher check-in completed
            </label>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Outcome</label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Too early to tell</SelectItem>
                <SelectItem value="improved">Improved</SelectItem>
                <SelectItem value="same">About the same</SelectItem>
                <SelectItem value="worse">Worse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Check-in notes</label>
            <Textarea
              placeholder="What stood out in the conversation? What support was agreed?"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-[110px]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Follow-up reminder</label>
            <Input
              type="date"
              value={followUpDate}
              onChange={(event) => setFollowUpDate(event.target.value)}
              className="max-w-xs"
            />
            <p className="text-[11px] text-muted-foreground mt-2">{followUp.title}</p>
          </div>

          <Button onClick={handleSave} disabled={logTeacherAction.isPending} className="w-full gap-2">
            {logTeacherAction.isPending ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Save check-in and reminder
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
