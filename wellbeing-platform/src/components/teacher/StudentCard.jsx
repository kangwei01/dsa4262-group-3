import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import RiskBadge from '@/components/shared/RiskBadge';
import TrendIndicator from '@/components/shared/TrendIndicator';
import { ChevronRight, Eye, MessageSquare, UserCheck } from 'lucide-react';
import { hasThreeWeekDistressFlag } from '@/lib/rfModel';

const statusLabels = {
  none: null,
  monitoring: { label: 'Monitoring', icon: Eye, color: 'text-sky-600 bg-sky-50' },
  check_in_scheduled: { label: 'Check-in Scheduled', icon: MessageSquare, color: 'text-amber-600 bg-amber-50' },
  check_in_completed: { label: 'Check-in Done', icon: UserCheck, color: 'text-emerald-600 bg-emerald-50' },
  referred: { label: 'Referred', icon: UserCheck, color: 'text-rose-600 bg-rose-50' },
};

export default function StudentCard({ student }) {
  const status = statusLabels[student.action_status];
  const hasFlag = hasThreeWeekDistressFlag(student.weekly_scores);

  return (
    <Link to={`/teacher/student/${student.id}`}>
      <Card className="border border-border/50 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group">
        <CardContent className="p-4 flex items-center gap-4">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
            {student.name.charAt(0)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-foreground">{student.name}</span>
              <span className="text-xs text-muted-foreground">{student.grade}</span>
            </div>
            <div className="flex items-center gap-3">
              <RiskBadge level={student.risk_level} />
              <TrendIndicator trend={student.trend} />
              {hasFlag && (
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  3-week flag
                </span>
              )}
              {student.confidence && (
                <span className="text-[11px] text-muted-foreground">
                  {student.confidence}% conf.
                </span>
              )}
            </div>
          </div>

          {/* Status & arrow */}
          <div className="flex items-center gap-3">
            {status && (
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium ${status.color}`}>
                <status.icon className="w-3 h-3" />
                {status.label}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
