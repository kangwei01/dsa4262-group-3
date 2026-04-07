import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarClock, Eye, Lightbulb, MessageSquare, ShieldAlert, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getConsecutiveDistressWeeks, getRecommendedAction } from '@/lib/rfModel';
import { buildFollowUpRecommendation } from '@/lib/wellbeingContent';

const urgencyConfig = {
  urgent: { border: 'border-rose-200', bg: 'bg-rose-50/60', badge: 'bg-rose-100 text-rose-700', label: 'Urgent review' },
  soon: { border: 'border-amber-200', bg: 'bg-amber-50/60', badge: 'bg-amber-100 text-amber-700', label: 'Act soon' },
  normal: { border: 'border-sky-200', bg: 'bg-sky-50/50', badge: 'bg-sky-100 text-sky-700', label: 'Planned follow-up' },
  low: { border: 'border-border', bg: 'bg-secondary/20', badge: 'bg-secondary text-secondary-foreground', label: 'Routine support' },
};

export default function DecisionPanel({ student }) {
  const recommendation = getRecommendedAction(student);
  const urgency = urgencyConfig[recommendation.urgency] || urgencyConfig.low;
  const distressStreak = getConsecutiveDistressWeeks(student.weekly_scores);
  const followUp = buildFollowUpRecommendation(student);

  return (
    <Card className={`border-2 ${urgency.border} ${urgency.bg}`}>
      <CardContent className="p-5 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">Detect → Decide → Act</h3>
          </div>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${urgency.badge}`}>
            {urgency.label}
          </span>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Recommended next step</p>
          <p className="text-sm font-semibold text-foreground">{recommendation.action}</p>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{recommendation.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border/60 bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Record</p>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              Current status: {student.action_status === 'none' ? 'No action recorded yet' : student.action_status.replace(/_/g, ' ')}.
            </p>
            {distressStreak >= 3 && (
              <p className="text-xs text-amber-700 mt-2">
                Sustained concern: {distressStreak} consecutive monitored weeks.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarClock className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Follow-up</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{followUp.title}</p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{followUp.reason}</p>
            {student.next_follow_up_at && (
              <p className="text-xs text-foreground mt-2">
                Current reminder: {new Date(student.next_follow_up_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-4">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Suggested support path</p>
          <div className="space-y-2 text-sm text-foreground">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span>Check in privately with a personalised conversation prompt.</span>
            </div>
            <div className="flex items-start gap-2">
              <CalendarClock className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span>Review again in {followUp.days} days and log the outcome.</span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span>If the pattern persists or worsens, consider counsellor escalation and parent engagement.</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link to={`/teacher/student/${student.id}/checkin`}>
            <Button size="sm" className="gap-1.5 h-8 text-xs">
              <MessageSquare className="w-3.5 h-3.5" />
              Check in privately
            </Button>
          </Link>
          <Link to={`/teacher/student/${student.id}/escalate`}>
            <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
              <UserCheck className="w-3.5 h-3.5" />
              Escalate to counsellor
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
