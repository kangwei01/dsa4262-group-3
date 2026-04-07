import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, Moon, BookOpen, Brain, Zap, Users } from 'lucide-react';
import { demoStudents } from '@/lib/demoData';
import RiskBadge from '@/components/shared/RiskBadge';
import TrendIndicator from '@/components/shared/TrendIndicator';
import RiskChart from '@/components/teacher/RiskChart';
import DecisionPanel from '@/components/teacher/DecisionPanel';

const factorIcons = { 'Sleep quality': Moon, 'School pressure': BookOpen, 'Social connection': Users, 'Focus': Brain, 'Energy levels': Zap, 'Mood': Users };
const severityConfig = {
  high: { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', bar: 'bg-rose-400' },
  medium: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-400' },
  low: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-400' },
};
const severityWidth = { high: 'w-full', medium: 'w-2/3', low: 'w-1/3' };

export default function StudentDetail() {
  const { id } = useParams();
  const student = demoStudents.find(s => s.id === id);

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Student not found.</p>
        <Link to="/teacher" className="text-primary text-sm mt-2 inline-block">← Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/teacher">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
          {student.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{student.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-muted-foreground">{student.grade} · Age {student.age}</span>
            <RiskBadge level={student.risk_level} />
            <TrendIndicator trend={student.trend} />
            <span className="text-[11px] text-muted-foreground">{student.confidence}% confidence</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col — 2/3 width */}
        <div className="lg:col-span-2 space-y-6">

          {/* Trajectory chart */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-foreground">Distress Score Trajectory</h3>
                <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-1 rounded">Past 6 weeks</span>
              </div>
              <RiskChart weeklyScores={student.weekly_scores} />
            </CardContent>
          </Card>

          {/* Contributing factors — ranked */}
          {student.key_factors.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-sm text-foreground mb-1">Contributing Factors</h3>
                <p className="text-xs text-muted-foreground mb-4">Ranked by severity of contribution to distress score.</p>
                <div className="space-y-3">
                  {student.key_factors.map((f, i) => {
                    const sc = severityConfig[f.severity] || severityConfig.low;
                    const FactorIcon = factorIcons[f.factor] || Brain;
                    return (
                      <div key={i} className={`p-3 rounded-xl border ${sc.border} ${sc.bg}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[11px] font-bold text-muted-foreground w-5">#{i + 1}</span>
                          <FactorIcon className={`w-4 h-4 ${sc.color}`} />
                          <span className={`text-sm font-semibold ${sc.color}`}>{f.factor}</span>
                          <span className="ml-auto text-[11px] text-muted-foreground capitalize">{f.direction}</span>
                        </div>
                        {/* Severity bar */}
                        <div className="h-1 bg-white/60 rounded-full overflow-hidden ml-8">
                          <div className={`h-full rounded-full ${sc.bar} ${severityWidth[f.severity]}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Factor mini-charts */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-sm text-foreground mb-4">Weekly Factor Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-semibold text-muted-foreground">Week</th>
                      {student.weekly_scores[0] && Object.keys(student.weekly_scores[0]).filter(k => k !== 'week' && k !== 'score').map(k => (
                        <th key={k} className="text-center py-2 font-semibold text-muted-foreground capitalize">{k}</th>
                      ))}
                      <th className="text-center py-2 font-semibold text-muted-foreground">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.weekly_scores.map((row, i) => {
                      const factors = Object.keys(row).filter(k => k !== 'week' && k !== 'score');
                      return (
                        <tr key={i} className={`border-b border-border/30 ${i >= student.weekly_scores.length - 3 ? 'bg-primary/[0.02]' : ''}`}>
                          <td className="py-2 font-medium text-foreground">
                            {row.week}
                            {i >= student.weekly_scores.length - 3 && (
                              <span className="ml-1.5 text-[9px] text-primary font-semibold uppercase">recent</span>
                            )}
                          </td>
                          {factors.map(k => (
                            <td key={k} className="text-center py-2">
                              <span className={`font-semibold ${
                                row[k] <= 2 ? 'text-rose-600' : row[k] <= 3 ? 'text-amber-600' : 'text-emerald-600'
                              }`}>{row[k]}</span>
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

        {/* Right col */}
        <div className="space-y-5">
          <DecisionPanel student={student} />

          {/* Edge case scenario */}
          {student.scenario && (
            <Card className="border-primary/20 bg-primary/[0.02]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-xs text-primary uppercase tracking-wide">
                    {student.scenario === 'silent_struggler' ? '🤫 Silent Struggler' : '📝 Temporary Stress'}
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