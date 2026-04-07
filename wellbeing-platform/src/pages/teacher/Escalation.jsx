import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, AlertTriangle, Send, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import RiskBadge from '@/components/shared/RiskBadge';
import TrendIndicator from '@/components/shared/TrendIndicator';
import { useCreateCounsellorCase, useStudentCheckIns, useTeacherActions, useTeacherStudent } from '@/hooks/useWellbeingData';
import { getConsecutiveDistressWeeks } from '@/lib/rfModel';
import { buildParentMessage } from '@/lib/wellbeingContent';
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
  const [parentContact, setParentContact] = useState(false);
  const [confirmEscalation, setConfirmEscalation] = useState(false);
  const [parentMessage, setParentMessage] = useState('');
  const distressStreak = getConsecutiveDistressWeeks(student?.weekly_scores || []);
  const autoSummary = useMemo(() => {
    if (!student) return '';

    return `Student ${student.name} (${student.grade}, age ${student.age}) is being reviewed for counsellor escalation.\n\nSupport band: ${student.risk_level.toUpperCase()}\nRisk score: ${student.risk_score}/100\nTrend: ${student.trend}\nConfidence: ${student.confidence}%\nConsecutive monitored weeks: ${distressStreak}\n\nKey signals:\n${student.key_factors.map((factor) => `• ${factor.factor}: ${factor.direction} (${factor.severity} severity)`).join('\n')}\n\nWeekly score progression:\n${student.weekly_scores.map((week) => `${week.week}: ${week.score}`).join(' → ')}`;
  }, [distressStreak, student]);

  useEffect(() => {
    if (student && !parentMessage) {
      setParentMessage(buildParentMessage(student));
    }
  }, [parentMessage, student]);

  if (isLoading) {
    return <div className="max-w-3xl mx-auto py-10 text-sm text-muted-foreground">Loading escalation summary…</div>;
  }

  if (!student) return null;

  const handleRefer = async () => {
    await createCounsellorCase.mutateAsync({
      studentId: student.id,
      teacherEmail: teacher?.teacher_identifier || student.assigned_teacher || 'wellbeing@school.edu',
      additionalNotes,
      parentContact,
      parentMessage,
      createdByRole: teacher?.role || 'teacher',
    });

    toast.success('Escalation logged successfully');
    navigate(`/teacher/student/${student.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/teacher/student/${student.id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Escalate to Counsellor
          </h1>
          <p className="text-sm text-muted-foreground">Review summary, confirm escalation, and send the full support file.</p>
        </div>
      </div>

      <Card className="mb-6 border-destructive/20">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {student.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-foreground">{student.name}</p>
              <div className="flex items-center gap-2">
                <RiskBadge level={student.risk_level} />
                <TrendIndicator trend={student.trend} />
              </div>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Escalation summary</h4>
            <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">{autoSummary}</pre>
            <p className="text-[11px] text-muted-foreground mt-3">
              This handoff will include {checkIns.length} check-ins and {teacherActions.length} teacher actions in the counsellor file.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-5">
          <label className="text-sm font-medium text-foreground mb-2 block">Additional teacher notes</label>
          <Textarea
            placeholder="Add any context the counsellor should know..."
            value={additionalNotes}
            onChange={(event) => setAdditionalNotes(event.target.value)}
            className="min-h-[110px]"
          />
        </CardContent>
      </Card>

      <Card className="mb-6 border-amber-200 bg-amber-50/30">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <h3 className="font-semibold text-sm text-amber-700">Parent communication</h3>
          </div>
          <p className="text-xs text-amber-700/80 mb-3">
            Use a neutral, non-alarmist tone. This message stays editable before it is logged.
          </p>
          <div className="flex items-center gap-3 mb-3">
            <Checkbox checked={parentContact} onCheckedChange={setParentContact} id="parentContact" />
            <label htmlFor="parentContact" className="text-sm text-amber-700 cursor-pointer">
              Prepare parent communication as part of this escalation
            </label>
          </div>
          {parentContact && (
            <Textarea
              value={parentMessage}
              onChange={(event) => setParentMessage(event.target.value)}
              className="min-h-[160px] bg-white"
            />
          )}
        </CardContent>
      </Card>

      <Card className="mb-6 border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <Checkbox checked={confirmEscalation} onCheckedChange={setConfirmEscalation} id="confirmEscalation" />
            <label htmlFor="confirmEscalation" className="text-sm text-foreground cursor-pointer">
              I have reviewed the student summary and want to send this full support file to the counsellor.
            </label>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleRefer}
        disabled={createCounsellorCase.isPending || !confirmEscalation}
        className="w-full gap-2"
        variant="destructive"
      >
        {createCounsellorCase.isPending ? (
          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        Confirm escalation
      </Button>
    </div>
  );
}
