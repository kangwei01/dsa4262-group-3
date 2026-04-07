import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, AlertTriangle, TrendingUp, Shield, ArrowUpDown } from 'lucide-react';
import { demoStudents, getRecommendedAction } from '@/lib/demoData';
import ActionNeeded from '@/components/teacher/ActionNeeded';
import RiskBadge from '@/components/shared/RiskBadge';
import TrendIndicator from '@/components/shared/TrendIndicator';
import { Link } from 'react-router-dom';

const keyFactorLabel = (student) => {
  if (student.key_factors.length === 0) return '—';
  const top = student.key_factors[0];
  const arrow = top.direction === 'declining' || top.direction === 'increasing' ? (top.direction === 'declining' ? '↓' : '↑') : '→';
  return `${top.factor} ${arrow}`;
};

const statusLabels = {
  none: null,
  monitoring: { label: 'Monitoring', color: 'text-sky-600 bg-sky-50' },
  check_in_scheduled: { label: 'Scheduled', color: 'text-amber-600 bg-amber-50' },
  check_in_completed: { label: 'Done', color: 'text-emerald-600 bg-emerald-50' },
  referred: { label: 'Referred', color: 'text-rose-600 bg-rose-50' },
};

export default function Dashboard() {
  const [filterRisk, setFilterRisk] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');

  const filtered = demoStudents
    .filter(s => filterRisk === 'all' || s.risk_level === filterRisk)
    .sort((a, b) => {
      if (sortBy === 'urgency') {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.risk_level] - order[b.risk_level];
      }
      if (sortBy === 'trend') {
        const order = { worsening: 0, stable: 1, improving: 2 };
        return order[a.trend] - order[b.trend];
      }
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const stats = {
    total: demoStudents.length,
    high: demoStudents.filter(s => s.risk_level === 'high').length,
    worsening: demoStudents.filter(s => s.trend === 'worsening').length,
    actioned: demoStudents.filter(s => ['check_in_completed', 'referred'].includes(s.action_status)).length,
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Student Wellbeing Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monitor distress signals and take timely action.</p>
        </div>
        <div className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
          Last updated: today
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Students', value: stats.total, icon: Users, color: 'text-primary bg-primary/10' },
          { label: 'High Distress', value: stats.high, icon: AlertTriangle, color: 'text-rose-600 bg-rose-50' },
          { label: 'Trend Worsening', value: stats.worsening, icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
          { label: 'Actions Taken', value: stats.actioned, icon: Shield, color: 'text-emerald-600 bg-emerald-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-border/50">
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

      {/* Action needed panel */}
      <ActionNeeded students={demoStudents} />

      {/* Filters + sort */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Select value={filterRisk} onValueChange={setFilterRisk}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All risk levels</SelectItem>
              <SelectItem value="high">High risk only</SelectItem>
              <SelectItem value="medium">Medium risk only</SelectItem>
              <SelectItem value="low">Low risk only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgency">Sort: Urgency</SelectItem>
              <SelectItem value="trend">Sort: Trend</SelectItem>
              <SelectItem value="name">Sort: Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Student Table */}
      <Card className="border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Student</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" />Risk Level</span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Trend</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Key Factor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, i) => {
                const rec = getRecommendedAction(student);
                const status = statusLabels[student.action_status];
                return (
                  <tr
                    key={student.id}
                    className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${i % 2 === 0 ? '' : 'bg-secondary/10'}`}
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
                        <RiskBadge level={student.risk_level} />
                        {student.confidence && (
                          <span className="text-[10px] text-muted-foreground">{student.confidence}% conf.</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <TrendIndicator trend={student.trend} />
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
    </div>
  );
}