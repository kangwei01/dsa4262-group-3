import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import RiskBadge from '@/components/shared/RiskBadge';
import TrendIndicator from '@/components/shared/TrendIndicator';
import { getRecommendedAction, hasThreeWeekDistressFlag } from '@/lib/rfModel';

export default function ActionNeeded({ students }) {
  const actionStudents = students.filter(
    (student) => (
      student.risk_level === 'high'
      || hasThreeWeekDistressFlag(student.weekly_scores)
      || (student.risk_level === 'medium' && student.trend === 'worsening' && student.action_status === 'none')
    )
  );

  if (actionStudents.length === 0) return null;

  return (
    <Card className="border-destructive/20 bg-destructive/[0.02] mb-6">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <h3 className="font-semibold text-sm text-foreground">Students Needing Review</h3>
          <span className="text-xs text-muted-foreground">({actionStudents.length} student{actionStudents.length > 1 ? 's' : ''})</span>
        </div>
        <div className="space-y-3">
          {actionStudents.map(student => {
            const rec = getRecommendedAction(student);
            return (
              <Link
                key={student.id}
                to={`/teacher/student/${student.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/50 hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">{student.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <RiskBadge level={student.risk_level} />
                      <TrendIndicator trend={student.trend} />
                      {hasThreeWeekDistressFlag(student.weekly_scores) && (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          3-week pattern
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium text-primary bg-primary/5 px-3 py-1.5 rounded-lg">
                  {rec.action} →
                </span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
