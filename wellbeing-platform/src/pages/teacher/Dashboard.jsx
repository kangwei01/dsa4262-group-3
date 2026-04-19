import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarClock, Info, Send, ShieldCheck, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RiskBadge from '@/components/shared/RiskBadge';
import TrendIndicator from '@/components/shared/TrendIndicator';
import TrendSparkline from '@/components/teacher/TrendSparkline';
import { useCloseStudentSurveys, useOpenStudentSurveys, useTeacherActivityFeed, useTeacherStudents } from '@/hooks/useWellbeingData';
import {
  FLAG_THRESHOLD,
  formatSignalLabel,
  getConsecutiveDistressWeeks,
  getRecommendedAction,
  hasThreeWeekDistressFlag,
  hasTwoWeekElevatedPattern,
} from '@/lib/rfModel';
import { useTeacherAccess } from '@/lib/TeacherAccessContext';

function hasCompletedCheckIn(studentId, actions = []) {
  return actions.some((action) => (
    action.student_id === studentId
    && action.action_type === 'check_in'
    && action.completed
  ));
}

function getActionRoute(student, actions) {
  if (student.next_follow_up_at && hasCompletedCheckIn(student.id, actions)) {
    return `/teacher/student/${student.id}`;
  }
  const recommendation = getRecommendedAction(student);
  if (recommendation.key === 'escalate') {
    return `/teacher/student/${student.id}/escalate`;
  }
  if (recommendation.key === 'monitor') {
    return `/teacher/student/${student.id}/checkin?mode=monitor`;
  }
  if (recommendation.key === 'check_in') {
    return `/teacher/student/${student.id}/checkin`;
  }
  return `/teacher/student/${student.id}`;
}

function getReviewUrgency(student) {
  if (student.risk_score >= FLAG_THRESHOLD) return 0;
  if (student.risk_level === 'medium' && student.trend === 'worsening') return 1;
  if (student.risk_level === 'medium') return 2;
  return 3;
}

function hasCompletedActionThisWeek(studentId, actions) {
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  return actions.some((action) => (
    action.student_id === studentId
    && action.completed
    && Date.parse(action.created_at || 0) >= weekAgo
  ));
}

function isDueToday(dateString) {
  if (!dateString) return false;
  const dueDate = new Date(dateString);
  const today = new Date();
  return dueDate.getFullYear() === today.getFullYear()
    && dueDate.getMonth() === today.getMonth()
    && dueDate.getDate() === today.getDate();
}

function buildMainSignal(student) {
  const top = student.key_factors?.[0];
  if (!top) return 'No dominant signal';
  return `${formatSignalLabel(top.feature || top.factor)} ${top.direction === 'worsening' || top.direction === 'increasing' ? '↑' : top.direction === 'declining' || top.direction === 'harder' ? '↓' : '→'}`;
}

function statusLabel(student, actions) {
  if (student.action_status === 'referred') return 'Referred';
  if (student.next_follow_up_at && hasCompletedCheckIn(student.id, actions)) return 'Checked in';
  if (student.action_status === 'check_in_scheduled') return 'Check-in set';
  if (student.action_status === 'check_in_completed' || hasCompletedCheckIn(student.id, actions)) return 'Checked in';
  if (student.action_status === 'monitoring') return 'Monitoring';
  return 'No action yet';
}

function nextStepLabel(student, actions) {
  if (student.next_follow_up_at && hasCompletedCheckIn(student.id, actions)) {
    return 'Next session scheduled';
  }
  if (student.action_status === 'referred'){
    return 'Referred to counsellor'
  }
  return getRecommendedAction(student).action;
}

export default function Dashboard() {
  const [showAllReview, setShowAllReview] = useState(false);
  const { teacher } = useTeacherAccess();
  const { data: students = [], isLoading } = useTeacherStudents(teacher);
  const { data: actions = [] } = useTeacherActivityFeed(teacher);
  const openStudentSurveys = useOpenStudentSurveys();
  const closeStudentSurveys = useCloseStudentSurveys();

  const stats = useMemo(() => ({
    total: students.length,
    flagged: students.filter((student) => student.risk_score >= FLAG_THRESHOLD).length,
    sustained: students.filter((student) => hasTwoWeekElevatedPattern(student.weekly_scores)).length,
    followUpsDue: students.filter((student) => isDueToday(student.next_follow_up_at)).length,
  }), [students]);

  const reviewStudents = useMemo(() => (
    students
      .filter((student) => (
        (student.risk_level === 'high' || student.risk_level === 'medium')
        && !hasCompletedActionThisWeek(student.id, actions)
      ))
      .sort((a, b) => (
        getReviewUrgency(a) - getReviewUrgency(b)
        || b.risk_score - a.risk_score
        || a.name.localeCompare(b.name)
      ))
  ), [actions, students]);

  const visibleReviewStudents = showAllReview ? reviewStudents : reviewStudents.slice(0, 6);

  const sortedStudents = useMemo(() => (
    [...students].sort((a, b) => (
      getReviewUrgency(a) - getReviewUrgency(b)
      || b.risk_score - a.risk_score
      || a.name.localeCompare(b.name)
    ))
  ), [students]);

  const weeklyPulseOn = useMemo(
    () => students.some((student) => student.survey_status === 'open' && student.survey_type === 'weekly'),
    [students],
  );
  const monthlyCheckInOn = useMemo(
    () => students.some((student) => student.survey_status === 'open' && student.survey_type === 'monthly'),
    [students],
  );

  const handleBatchToggle = async (surveyType) => {
    const isOn = surveyType === 'monthly' ? monthlyCheckInOn : weeklyPulseOn;

    try {
      if (isOn) {
        await closeStudentSurveys.mutateAsync({
          studentIds: students
            .filter((student) => student.survey_status === 'open' && student.survey_type === surveyType)
            .map((student) => student.id),
        });
        toast.success(
          surveyType === 'monthly'
            ? 'Monthly check-in turned off.'
            : 'Weekly pulse turned off.',
          {
            description: `Students can no longer submit the ${surveyType === 'monthly' ? 'monthly check-in' : 'weekly pulse'}.`,
          },
        );
      } else {
        await openStudentSurveys.mutateAsync({
          studentIds: students.map((student) => student.id),
          surveyType,
          teacherEmail: teacher?.teacher_identifier || 'wellbeing@school.edu',
          notes: `${surveyType === 'monthly' ? 'Monthly check-in' : 'Weekly pulse'} opened from the dashboard.`,
        });
        toast.success(
          surveyType === 'monthly'
            ? 'Monthly check-in turned on.'
            : 'Weekly pulse turned on.',
          {
            description: `Students can now submit the ${surveyType === 'monthly' ? 'monthly check-in' : 'weekly pulse'}.`,
          },
        );
      }
    } catch (error) {
      toast.error(error.message || 'Could not open the survey window right now.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Detect → Decide → Act → Record → Follow-up
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            className="gap-2"
            disabled={openStudentSurveys.isPending || closeStudentSurveys.isPending || students.length === 0}
            onClick={() => handleBatchToggle('weekly')}
          >
            <Send className="w-4 h-4" />
            {weeklyPulseOn ? 'Turn off weekly pulse' : 'Turn on weekly pulse'}
          </Button>
          <Button
            className="gap-2"
            disabled={openStudentSurveys.isPending || closeStudentSurveys.isPending || students.length === 0}
            onClick={() => handleBatchToggle('monthly')}
          >
            <CalendarClock className="w-4 h-4" />
            {monthlyCheckInOn ? 'Turn off monthly check-in' : 'Turn on monthly check-in'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats.total, icon: Users, tone: 'bg-primary/10 text-primary' },
          { label: 'Flagged This Week', value: stats.flagged, icon: AlertTriangle, tone: 'bg-rose-50 text-rose-700' },
          { label: 'Sustained Monitor Pattern', value: stats.sustained, icon: ShieldCheck, tone: 'bg-amber-50 text-amber-700' },
          { label: 'Follow-ups Due', value: stats.followUpsDue, icon: CalendarClock, tone: 'bg-sky-50 text-sky-700' },
        ].map((card) => (
          <Card key={card.label} className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.tone}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{card.value}</p>
                <p className="text-[11px] text-muted-foreground max-w-[180px]">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Students Needing Review</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Flagged students appear first, followed by monitor students with worsening patterns, then stable monitor students.
              </p>
            </div>
            {reviewStudents.length > 6 && (
              <Button variant="ghost" size="sm" onClick={() => setShowAllReview((value) => !value)}>
                {showAllReview ? 'Show less' : 'Show all'}
              </Button>
            )}
          </div>

          {visibleReviewStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6">No students currently need manual review.</p>
          ) : (
            <div className="space-y-3">
              {visibleReviewStudents.map((student) => (
                <div key={student.id} className="rounded-2xl border border-border/60 bg-card p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link to={`/teacher/student/${student.id}`} className="text-sm font-semibold text-foreground hover:text-primary">
                          {student.name}
                        </Link>
                        <span className="text-xs text-muted-foreground">{student.grade} · Age {student.age}</span>
                        <RiskBadge level={student.risk_level} />
                        <TrendIndicator trend={student.trend} />
                      </div>
                      <p className="text-sm text-foreground">{buildMainSignal(student)}</p>
                    </div>
                    <Link to={`/teacher/student/${student.id}`}>
                      <Button size="sm" variant="outline">View student →</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-10 text-sm text-muted-foreground text-center">Loading students…</div>
          ) : (
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Student name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Predicted Risk Score</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Support band</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Weekly trend sparkline</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">3-week monitor badge</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Main signal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Next step</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((student, index) => {
                  const streak = getConsecutiveDistressWeeks(student.weekly_scores);
                  return (
                    <tr key={student.id} className={`border-b border-border/50 ${index % 2 === 0 ? '' : 'bg-secondary/10'}`}>
                      <td className="px-4 py-3">
                        <Link to={`/teacher/student/${student.id}`} className="text-sm font-medium text-foreground hover:text-primary">
                          {student.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className={`text-base font-semibold ${
                            student.risk_level === 'high'
                              ? 'text-rose-700'
                              : student.risk_level === 'medium'
                                ? 'text-amber-700'
                                : 'text-emerald-700'
                          }`}>
                            {student.risk_score}
                          </span>
                          <div className="group relative">
                            <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-popover border border-border shadow-md px-3 py-2 text-xs text-muted-foreground leading-relaxed hidden group-hover:block z-10">
                              Relative risk score. Not a clinical measure.
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <RiskBadge level={student.risk_level} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <TrendSparkline weeklyScores={student.weekly_scores.slice(-3)} />
                          <TrendIndicator trend={student.trend} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {hasThreeWeekDistressFlag(student.weekly_scores) ? (
                          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700">
                            {streak} weeks elevated
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground">{buildMainSignal(student)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{statusLabel(student, actions)}</td>
                      <td className="px-4 py-3">
                        <Link to={getActionRoute(student, actions)}>
                          <Button size="sm" variant="outline">{nextStepLabel(student, actions)} →</Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
