import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import RiskBadge from '@/components/shared/RiskBadge';
import TrendIndicator from '@/components/shared/TrendIndicator';
import { useCreateCounsellorCase, useStudentCheckIns, useTeacherActions, useTeacherStudent } from '@/hooks/useWellbeingData';
import { useTeacherAccess } from '@/lib/TeacherAccessContext';

export default function Escalation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { teacher } = useTeacherAccess();
  const { data: student, isLoading } = useTeacherStudent(id, teacher);
  const { data: checkIns = [] } = useStudentCheckIns(id);
  const { data: teacherActions = [] } = useTeacherActions(id);
  const createCounsellorCase = useCreateCounsellorCase();
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const latestCheckIn = checkIns[0] || null;
  const summary = useMemo(() => {
    if (!student) return null;
    return {
      name: student.name,
      age: student.age,
      supportBand: student.risk_level,
      confidence: student.confidence,
      currentScore: student.risk_score,
      trend: `${student.trend} across the last ${(student.weekly_scores || []).slice(-3).length || 0} recorded weeks`,
      studentNote: latestCheckIn?.free_text || 'No student note added this week.',
      previousActions: teacherActions.slice(0, 4),
    };
  }, [latestCheckIn?.free_text, student, teacherActions]);

  if (isLoading) {
    return <div className="py-10 text-sm text-muted-foreground">Loading escalation summary…</div>;
  }

  if (!student || !summary) return null;

  const handleEscalate = async () => {
    await createCounsellorCase.mutateAsync({
      studentId: student.id,
      teacherEmail: teacher?.teacher_identifier || student.assigned_teacher || 'wellbeing@school.edu',
      additionalNotes,
      parentContact: false,
      createdByRole: teacher?.role || 'teacher',
    });
    toast.success('Escalation confirmed.');
    navigate(`/teacher/student/${student.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/teacher/student/${student.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Escalate to counsellor</h1>
          <p className="text-sm text-muted-foreground">Review summary and confirm escalation</p>
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-lg font-semibold text-foreground">{summary.name}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-sm text-muted-foreground">Age {summary.age}</span>
                <RiskBadge level={student.risk_level} />
                <TrendIndicator trend={student.trend} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-secondary/20 p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Auto-generated student summary</p>
              <p className="text-sm text-foreground mt-2">Support band: {summary.supportBand}</p>
              <p className="text-sm text-foreground">Model confidence: {summary.confidence ? `${summary.confidence}%` : 'Unavailable'}</p>
              <p className="text-sm text-foreground">Current score: {summary.currentScore}</p>
              <p className="text-sm text-foreground">3-week trend summary: {summary.trend}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Student note</p>
              <p className="text-sm text-foreground mt-2 leading-relaxed">{summary.studentNote}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Previous teacher actions logged</p>
              <div className="mt-2 space-y-2">
                {summary.previousActions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No previous teacher actions recorded.</p>
                ) : (
                  summary.previousActions.map((action) => (
                    <div key={action.id || `${action.action_type}-${action.created_at || ''}`} className="rounded-xl border border-border/60 bg-card p-3">
                      <p className="text-sm font-medium text-foreground">{action.action_type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground mt-1">{action.created_at ? new Date(action.created_at).toLocaleString() : 'Saved action'}</p>
                      <p className="text-sm text-foreground mt-2">{action.notes || action.referral_summary || 'No notes recorded.'}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-6 space-y-4">
          <label className="text-sm font-medium text-foreground">Suggested draft for teacher review</label>
          <Textarea
            value={additionalNotes}
            onChange={(event) => setAdditionalNotes(event.target.value)}
            placeholder="Add any extra context the counsellor should know before you send this."
            className="min-h-[160px]"
          />
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/40">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                Review and confirm escalation
              </p>
              <div className="flex items-start gap-3">
                <Checkbox id="confirm-escalation" checked={confirmed} onCheckedChange={(value) => setConfirmed(Boolean(value))} className="mt-1" />
                <label htmlFor="confirm-escalation" className="text-sm text-foreground cursor-pointer">
                  Are you sure you want to escalate this student to the counsellor? This will share the above summary with the school counsellor.
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleEscalate}
        disabled={!confirmed || createCounsellorCase.isPending}
        className="w-full"
      >
        Review and confirm escalation
      </Button>
    </div>
  );
}
