import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MessageSquare, ThumbsUp, ThumbsDown, Check, Copy, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useLogTeacherAction, useStudent } from '@/hooks/useWellbeingData';
import { checkInPrompts, doTips, dontTips, observeNextTips } from '@/lib/wellbeingContent';

export default function GuidedCheckIn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: student, isLoading } = useStudent(id);
  const logTeacherAction = useLogTeacherAction();
  const [completed, setCompleted] = useState(false);
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('pending');

  if (isLoading) {
    return <div className="max-w-2xl mx-auto py-10 text-sm text-muted-foreground">Loading student check-in guide…</div>;
  }

  if (!student) return null;

  const handleSave = async () => {
    await logTeacherAction.mutateAsync({
      studentId: student.id,
      actionType: 'check_in',
      notes,
      outcome,
      completed,
    });
    toast.success('Check-in logged successfully');
    navigate(`/teacher/student/${student.id}`);
  };

  const copyPrompt = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const observationCategory = student.key_factors[0]?.category || 'general';
  const observationTips = observeNextTips[observationCategory] || observeNextTips.general;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/teacher/student/${student.id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Guided Check-in</h1>
          <p className="text-sm text-muted-foreground">Conversation guide for {student.name}</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">Conversation Starters</h3>
          </div>
          <div className="space-y-2">
            {checkInPrompts.map((prompt) => (
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
            <Eye className="w-4 h-4 text-sky-600" />
            <h3 className="font-semibold text-sm text-sky-700">What to observe next</h3>
          </div>
          <p className="text-xs text-sky-700/80 mb-3">
            After this check-in, look for these behavioural signs in the coming days and weeks.
          </p>
          <div className="space-y-2">
            {observationTips.map((tip) => (
              <div key={tip} className="flex items-start gap-2 text-xs text-sky-700">
                <span className="shrink-0 mt-0.5">→</span>
                <span>{tip}</span>
              </div>
            ))}
            {observeNextTips.general.map((tip) => (
              <div key={`general-${tip}`} className="flex items-start gap-2 text-xs text-sky-700/70">
                <span className="shrink-0 mt-0.5">→</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-sm text-foreground mb-4">Log This Check-in</h3>

          <div className="flex items-center gap-3 mb-4">
            <Checkbox checked={completed} onCheckedChange={setCompleted} id="completed" />
            <label htmlFor="completed" className="text-sm text-foreground cursor-pointer">
              Check-in completed
            </label>
          </div>

          <div className="mb-4">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Notes</label>
            <Textarea
              placeholder="How did the conversation go? Any observations..."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="mb-5">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Outcome</label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending / Too early</SelectItem>
                <SelectItem value="improved">Improved</SelectItem>
                <SelectItem value="same">Same</SelectItem>
                <SelectItem value="worse">Worse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} disabled={logTeacherAction.isPending} className="w-full gap-2">
            {logTeacherAction.isPending ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Save Check-in Log
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
