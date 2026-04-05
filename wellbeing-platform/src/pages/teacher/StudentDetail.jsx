import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  BookOpen,
  Brain,
  HeartPulse,
  Home,
  Info,
  Moon,
  Smartphone,
  Users,
} from 'lucide-react';
import RiskBadge from '@/components/shared/RiskBadge';
import TrendIndicator from '@/components/shared/TrendIndicator';
import RiskChart from '@/components/teacher/RiskChart';
import DecisionPanel from '@/components/teacher/DecisionPanel';
import { useStudent } from '@/hooks/useWellbeingData';
import {
  buildSupportCardsFromSignals,
  DISTRESS_THRESHOLD,
  getConsecutiveDistressWeeks,
  hasThreeWeekDistressFlag,
} from '@/lib/rfModel';

const categoryIcons = {
  sleep: Moon,
  workload: BookOpen,
  family: Home,
  social: Users,
  physical: HeartPulse,
  school: Brain,
  online: Smartphone,
  self_image: Brain,
};

const severityConfig = {
  high: { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', bar: 'bg-rose-400' },
  medium: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-400' },
  low: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-400' },
};

const severityWidth = { high: 'w-full', medium: 'w-2/3', low: 'w-1/3' };

export default function StudentDetail() {
  const { id } = useParams();
  const { data: student, isLoading } = useStudent(id);

  if (isLoading) {
    return <div className="py-10 text-sm text-muted-foreground">Loading student profile…</div>;
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Student not found.</p>
        <Link to="/teacher" className="text-primary text-sm mt-2 inline-block">← Back to dashboard</Link>
      </div>
    );
  }

  const distressStreak = getConsecutiveDistressWeeks(student.weekly_scores);
  const hasDistressFlag = hasThreeWeekDistressFlag(student.weekly_scores);
  const supportDirections = buildSupportCardsFromSignals(student.key_factors);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link to="/teacher">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
          {student.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-foreground">{student.name}</h1>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-sm text-muted-foreground">{student.grade} · Age {student.age}</span>
            <RiskBadge level={student.risk_level} />
            <TrendIndicator trend={student.trend} />
            <span className="text-[11px] text-muted-foreground">{student.confidence}% confidence</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">
          Latest score: {student.risk_score}/100
        </span>
        {hasDistressFlag ? (
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            {distressStreak} consecutive weeks in distress range ({DISTRESS_THRESHOLD}+)
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
            No active 3-week distress streak
          </span>
        )}
      </div>

      {hasDistressFlag && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-800">
            This student has stayed above the distress threshold for the last {distressStreak} weeks.
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Use the contributing factors below to guide the check-in, and consider escalation if the pattern continues or the latest score rises further.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-foreground">Distress Score Trajectory</h3>
                <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-1 rounded">Past 6 weeks</span>
              </div>
              <RiskChart weeklyScores={student.weekly_scores} />
            </CardContent>
          </Card>

          {student.key_factors.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-sm text-foreground mb-1">Contributing Factors</h3>
                <p className="text-xs text-muted-foreground mb-4">Top feature clusters currently pulling the score upward.</p>
                <div className="space-y-3">
                  {student.key_factors.map((item, index) => {
                    const styles = severityConfig[item.severity] || severityConfig.low;
                    const Icon = categoryIcons[item.category] || Brain;
                    return (
                      <div key={`${item.factor}-${index}`} className={`p-3 rounded-xl border ${styles.border} ${styles.bg}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[11px] font-bold text-muted-foreground w-5">#{index + 1}</span>
                          <Icon className={`w-4 h-4 ${styles.color}`} />
                          <span className={`text-sm font-semibold ${styles.color}`}>{item.factor}</span>
                          <span className="ml-auto text-[11px] text-muted-foreground capitalize">{item.direction}</span>
                        </div>
                        <div className="h-1 bg-white/60 rounded-full overflow-hidden ml-8">
                          <div className={`h-full rounded-full ${styles.bar} ${severityWidth[item.severity]}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-sm text-foreground mb-4">Weekly Factor Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-semibold text-muted-foreground">Week</th>
                      {student.weekly_scores[0] && Object.keys(student.weekly_scores[0]).filter((key) => key !== 'week' && key !== 'score').map((key) => (
                        <th key={key} className="text-center py-2 font-semibold text-muted-foreground capitalize">{key}</th>
                      ))}
                      <th className="text-center py-2 font-semibold text-muted-foreground">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.weekly_scores.map((row, index) => {
                      const factors = Object.keys(row).filter((key) => key !== 'week' && key !== 'score');
                      const isRecent = index >= student.weekly_scores.length - 3;
                      return (
                        <tr key={row.week} className={`border-b border-border/30 ${isRecent ? 'bg-primary/[0.02]' : ''}`}>
                          <td className="py-2 font-medium text-foreground">
                            {row.week}
                            {isRecent && (
                              <span className="ml-1.5 text-[9px] text-primary font-semibold uppercase">recent</span>
                            )}
                          </td>
                          {factors.map((key) => (
                            <td key={key} className="text-center py-2">
                              <span className={`font-semibold ${
                                row[key] <= 2 ? 'text-rose-600' : row[key] <= 3 ? 'text-amber-600' : 'text-emerald-600'
                              }`}>{row[key]}</span>
                            </td>
                          ))}
                          <td className="text-center py-2">
                            <span className={`font-bold ${
                              row.score >= 60 ? 'text-rose-600' : row.score >= 35 ? 'text-amber-600' : 'text-emerald-600'
                            }`}>{row.score}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <DecisionPanel student={student} />

          {supportDirections.length > 0 && (
            <Card className="border-border/60">
              <CardContent className="p-5">
                <h3 className="font-semibold text-sm text-foreground mb-3">Suggested Support Directions</h3>
                <div className="space-y-3">
                  {supportDirections.map((card) => (
                    <div key={card.featureId} className="rounded-xl border border-border/60 bg-secondary/20 p-3">
                      <p className="text-sm font-semibold text-foreground">{card.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{card.featureLabel}</p>
                      <p className="text-xs text-foreground mt-2 leading-relaxed">{card.teacherNote}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {student.scenario && (
            <Card className="border-primary/20 bg-primary/[0.02]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-xs text-primary uppercase tracking-wide">
                    {student.scenario === 'silent_struggler' ? 'Silent struggler pattern' : 'Temporary stress pattern'}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{student.scenario_desc}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
