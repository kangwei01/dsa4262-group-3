import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, AlertTriangle, Send, ShieldCheck, UserCheck } from 'lucide-react';
import { demoStudents } from '@/lib/demoData';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import RiskBadge from '@/components/shared/RiskBadge';
import TrendIndicator from '@/components/shared/TrendIndicator';

export default function Escalation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const student = demoStudents.find(s => s.id === id);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [parentContact, setParentContact] = useState(false);
  const [sending, setSending] = useState(false);

  if (!student) return null;

  const autoSummary = `Student ${student.name} (${student.grade}, age ${student.age}) has been flagged for counsellor referral.\n\nRisk Level: ${student.risk_level.toUpperCase()}\nRisk Score: ${student.risk_score}/100\nTrend: ${student.trend}\nConfidence: ${student.confidence}%\n\nKey Contributing Factors:\n${student.key_factors.map(f => `• ${f.factor}: ${f.direction} (${f.severity} severity)`).join('\n')}\n\nWeekly Score Progression:\n${student.weekly_scores.map(w => `${w.week}: ${w.score}`).join(' → ')}`;

  const handleRefer = async () => {
    setSending(true);
    await base44.entities.TeacherAction.create({
      student_id: student.id,
      action_type: 'refer_counsellor',
      notes: additionalNotes,
      referral_summary: autoSummary,
      completed: false,
    });
    if (parentContact) {
      await base44.entities.TeacherAction.create({
        student_id: student.id,
        action_type: 'parent_contact',
        notes: 'Parent contact triggered alongside counsellor referral.',
        completed: false,
      });
    }
    toast.success('Referral submitted successfully');
    navigate(`/teacher/student/${student.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/teacher/student/${student.id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Escalation — Counsellor Referral
          </h1>
          <p className="text-sm text-muted-foreground">Review and submit referral for {student.name}</p>
        </div>
      </div>

      {/* Student summary */}
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

          {/* Auto-generated summary */}
          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Auto-Generated Summary</h4>
            <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">{autoSummary}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Additional notes */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <label className="text-sm font-medium text-foreground mb-2 block">Additional Teacher Notes</label>
          <Textarea
            placeholder="Add any context the counsellor should know..."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Parent contact */}
      <Card className="mb-6 border-amber-200 bg-amber-50/30">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <h3 className="font-semibold text-sm text-amber-700">Parent/Guardian Contact</h3>
          </div>
          <p className="text-xs text-amber-700/80 mb-3">
            Triggering parent contact is a sensitive action. Only enable this if the school's safeguarding policy recommends it for this case.
          </p>
          <div className="flex items-center gap-3">
            <Checkbox
              checked={parentContact}
              onCheckedChange={setParentContact}
              id="parentContact"
            />
            <label htmlFor="parentContact" className="text-sm text-amber-700 cursor-pointer">
              Also notify parent/guardian
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button onClick={handleRefer} disabled={sending} className="w-full gap-2" variant="destructive">
        {sending ? (
          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        Submit Referral
      </Button>

      <p className="text-[11px] text-muted-foreground text-center mt-3">
        This referral will be securely sent to the school counsellor. All data is handled in accordance with safeguarding policies.
      </p>
    </div>
  );
}