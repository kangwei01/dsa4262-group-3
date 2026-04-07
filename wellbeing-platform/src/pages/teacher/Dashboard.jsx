import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, AlertTriangle, Shield, ArrowUpDown, Activity } from 'lucide-react';
import ActionNeeded from '@/components/teacher/ActionNeeded';
import RiskBadge from '@/components/shared/RiskBadge';
import TrendIndicator from '@/components/shared/TrendIndicator';
import TrendSparkline from '@/components/teacher/TrendSparkline';
import { useStudents } from '@/hooks/useWellbeingData';
import {
  DISTRESS_THRESHOLD,
  HIGH_DISTRESS_THRESHOLD,
  getConsecutiveDistressWeeks,
  getRecommendedAction,
  hasThreeWeekDistressFlag,
} from '@/lib/rfModel';

const keyFactorLabel = (student) => {
  if (student.key_factors.length === 0) return '—';
  const top = student.key_factors[0];
  const arrow = top.direction === 'declining' || top.direction === 'worsening'
    ? '↓'
    : top.direction === 'increasing'
      ? '↑'
      : '→';
  return `${top.factor} ${arrow}`;
};

const statusLabels = {
  none: null,
  monitoring: { label: 'Monitoring', color: 'text-sky-600 bg-sky-50' },
  check_in_scheduled: { label: 'Scheduled', color: 'text-amber-600 bg-amber-50' },
  check_in_completed: { label: 'Done', color: 'text-emerald-600 bg-emerald-50' },
  referred: { label: 'Referred', color: 'text-rose-600 bg-rose-50' },
};

const urgencyRank = (student) => {
  if (student.risk_score >= HIGH_DISTRESS_THRESHOLD) return 0;
  if (hasThreeWeekDistressFlag(student.weekly_scores)) return 1;
  if (student.trend === 'worsening') return 2;
  if (student.risk_level === 'medium') return 3;
  return 4;
};

export default function Dashboard() {
  const [filterRisk, setFilterRisk] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');
  const { data: students = [], isLoading, error } = useStudents();

  const filtered = students
    .filter((student) => filterRisk === 'all' || student.risk_level === filterRisk)
    .sort((a, b) => {
      if (sortBy === 'urgency') {
        return urgencyRank(a) - urgencyRank(b) || b.risk_score - a.risk_score;
      }
      if (sortBy === 'score') return b.risk_score - a.risk_score;
      if (sortBy === 'trend') {
        const order = { worsening: 0, stable: 1, improving: 2 };
        return order[a.trend] - order[b.trend];
      }
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const stats = {
    total: students.length,
    flagged: students.filter((student) => student.risk_score >= HIGH_DISTRESS_THRESHOLD).length,
    sustained: students.filter((student) => hasThreeWeekDistressFlag(student.weekly_scores)).length,
    followUpDue: students.filter((student) => (
      student.next_follow_up_at && Date.parse(student.next_follow_up_at) <= Date.now()
    )).length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Student Wellbeing Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Detect concerns, decide the next step, act supportively, record it, and follow up.
          </p>
        </div>
        <div className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
          {error ? 'Backend fallback active' : 'Synced with backend'}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Students', value: stats.total, icon: Users, color: 'text-primary bg-primary/10' },
          { label: 'Flagged This Week', value: stats.flagged, icon: AlertTriangle, color: 'text-rose-600 bg-rose-50' },
          { label: 'Sustained Monitor Pattern', value: stats.sustained, icon: Activity, color: 'text-amber-700 bg-amber-50' },
          { label: 'Follow-ups Due', value: stats.followUpDue, icon: Shield, color: 'text-sky-700 bg-sky-50' },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-border/60 bg-card px-4 py-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Privacy notice</p>
        <p className="text-sm text-foreground leading-relaxed">
          Student responses are confidential and should be used for support purposes only.
        </p>
      </div>

      <ActionNeeded students={students} />

      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterRisk} onValueChange={setFilterRisk}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All support bands</SelectItem>
              <SelectItem value="high">Flagged only</SelectItem>
              <SelectItem value="medium">Monitor only</SelectItem>
              <SelectItem value="low">Routine only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgency">Sort: Urgency</SelectItem>
              <SelectItem value="score">Sort: Latest Score</SelectItem>
              <SelectItem value="trend">Sort: Trend</SelectItem>
              <SelectItem value="name">Sort: Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <span className="text-xs text-muted-foreground">
          {filtered.length} student{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {isLoading ? (
        <div className="py-10 text-sm text-muted-foreground">Loading student dashboard…</div>
      ) : (
        <Card className="border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" />Latest Score</span>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Support Band</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Weekly Trend</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">3-Week Monitor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Main Signal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Next Step</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student, index) => {
                  const rec = getRecommendedAction(student);
                  const status = statusLabels[student.action_status];
                  const streak = getConsecutiveDistressWeeks(student.weekly_scores);
                  const hasFlag = hasThreeWeekDistressFlag(student.weekly_scores);

                  return (
                    <tr
                      key={student.id}
                      className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${index % 2 === 0 ? '' : 'bg-secondary/10'}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{student.name}</p>
                            <p className="text-[11px] text-muted-foreground">{student.grade} · Age {student.age}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`text-base font-bold ${
                            student.risk_score >= HIGH_DISTRESS_THRESHOLD
                              ? 'text-rose-600'
                              : student.risk_score >= DISTRESS_THRESHOLD
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                          }`}>
                            {student.risk_score}
                          </span>
                          <span className="text-[10px] text-muted-foreground">out of 100</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <RiskBadge level={student.risk_level} />
                          <span className="text-[10px] text-muted-foreground">{student.confidence}% conf.</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <TrendSparkline weeklyScores={student.weekly_scores} />
                          <TrendIndicator trend={student.trend} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {hasFlag ? (
                          <div className="inline-flex flex-col gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                            <span className="text-[11px] font-semibold text-amber-700">Flag active</span>
                            <span className="text-[10px] text-amber-700/80">{streak} consecutive weeks at {DISTRESS_THRESHOLD.toFixed(2)}+</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">No active streak</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground">{keyFactorLabel(student)}</span>
                      </td>
                      <td className="px-4 py-3">
                        {status ? (
                          <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded ${status.color}`}>
                            {status.label}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/teacher/student/${student.id}`}>
                          <Button size="sm" variant="outline" className="h-7 text-xs px-3">
                            {rec.action} →
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No students match the current filter.</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
