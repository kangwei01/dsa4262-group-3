import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Eye, MessageSquare, UserCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { getRecommendedAction } from '@/lib/demoData';
import { Link } from 'react-router-dom';

const actionIcons = {
  'Refer to Counsellor': UserCheck,
  'Schedule Check-in': MessageSquare,
  'Monitor': Eye,
  'Continue Monitoring': Eye,
};

const urgencyConfig = {
  urgent: { border: 'border-rose-200', bg: 'bg-rose-50/60', badge: 'bg-rose-100 text-rose-700', label: 'Urgent' },
  soon: { border: 'border-amber-200', bg: 'bg-amber-50/60', badge: 'bg-amber-100 text-amber-700', label: 'Respond Soon' },
  normal: { border: 'border-sky-200', bg: 'bg-sky-50/40', badge: 'bg-sky-100 text-sky-700', label: 'Normal' },
  low: { border: 'border-border', bg: 'bg-secondary/20', badge: 'bg-secondary text-secondary-foreground', label: 'Low' },
};

const confidenceDisplay = (confidence) => {
  if (confidence >= 85) return { label: 'High confidence signal', icon: ShieldAlert, color: 'text-rose-600' };
  if (confidence >= 70) return { label: 'Moderate confidence signal', icon: CheckCircle2, color: 'text-amber-600' };
  return { label: 'Low confidence — continue monitoring', icon: Eye, color: 'text-muted-foreground' };
};

export default function DecisionPanel({ student }) {
  const rec = getRecommendedAction(student);
  const Icon = actionIcons[rec.action] || Eye;
  const uc = urgencyConfig[rec.urgency] || urgencyConfig.low;
  const conf = confidenceDisplay(student.confidence || 70);
  const ConfIcon = conf.icon;

  return (
    <Card className={`border-2 ${uc.border} ${uc.bg}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">Decision Support</h3>
          </div>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${uc.badge}`}>
            {uc.label}
          </span>
        </div>

        {/* Recommended action */}
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-card border border-border/50">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{rec.action}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Recommended next step</p>
          </div>
        </div>

        {/* Signal explanation */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Why this was flagged</p>
          <p className="text-sm text-foreground leading-relaxed">{rec.description}</p>
        </div>

        {/* Confidence indicator */}
        <div className={`flex items-center gap-2 text-xs font-medium mb-4 ${conf.color}`}>
          <ConfIcon className="w-3.5 h-3.5" />
          {conf.label} ({student.confidence}%)
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          {student.risk_level === 'high' && (
            <Link to={`/teacher/student/${student.id}/escalate`}>
              <Button size="sm" variant="destructive" className="gap-1.5 h-8 text-xs">
                <UserCheck className="w-3.5 h-3.5" />
                Refer to Counsellor
              </Button>
            </Link>
          )}
          <Link to={`/teacher/student/${student.id}/checkin`}>
            <Button size="sm" variant={student.risk_level === 'high' ? 'outline' : 'default'} className="gap-1.5 h-8 text-xs">
              <MessageSquare className="w-3.5 h-3.5" />
              Check-in Guide
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}