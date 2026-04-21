import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, Info, MessageSquareText, Trash2, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RiskBadge from '@/components/shared/RiskBadge';
import TrendIndicator from '@/components/shared/TrendIndicator';
import TrendSparkline from '@/components/teacher/TrendSparkline';
import { useDeleteTeacherAction, useStudentCheckIns, useTeacherActions, useTeacherStudent } from '@/hooks/useWellbeingData';
import {
  formatSignalLabel,
  getFeatureById,
  getFeatureRiskContribution,
  getRecommendedAction,
  getResponseLabel,
  getSupportCategoryForFeature,
  monthlyQuestions,
  weeklyQuestions,
} from '@/lib/rfModel';
import { buildFollowUpRecommendation } from '@/lib/wellbeingContent';
import { useTeacherAccess } from '@/lib/TeacherAccessContext';

const actionTypeLabels = {
  open_survey: 'Survey opened',
  monitor: 'Reminder',
  check_in: 'Private check-in',
  refer_counsellor: 'Counsellor referral',
  parent_contact: 'Parent contact',
};

const outcomeLabels = {
  pending: 'Pending',
  student_receptive: 'Student was receptive',
  student_closed: 'Student was closed',
  referred_to_counsellor: 'Referred to counsellor',
  no_follow_up_needed: 'No follow-up needed',
  improved: 'Improved',
  same: 'About the same',
  worse: 'Worse',
};

function buildTrendSummary(student) {
  const recent = (student.weekly_scores || []).slice(-4);
  if (recent.length < 2) return 'Not enough history yet to summarise a trend.';
  const first = recent[0].score || 0;
  const last = recent[recent.length - 1].score || 0;
  if (last > first) return `Score has increased from ${first} to ${last} over the last ${recent.length} weeks.`;
  if (last < first) return `Score has decreased from ${first} to ${last} over the last ${recent.length} weeks.`;
  return `Score has stayed fairly steady around ${last} over the last ${recent.length} weeks.`;
}

function buildScriptTopic(factors = []) {
  const items = factors
    .slice(0, 2)
    .map((signal) => (signal.label || formatSignalLabel(signal.feature || signal.factor)).toLowerCase());
  return items.length > 0 ? items.join(' and ') : 'things this week';
}

function getWeeklyResponseQuestions(checkIn) {
  if (!checkIn) return [];
  if (checkIn.survey_type === 'monthly') {
    return [...weeklyQuestions, ...monthlyQuestions];
  }
  return weeklyQuestions;
}

function getActionButtons(student) {
  const buttons = [
    { label: 'Check in privately', to: `/teacher/student/${student.id}/checkin`, variant: 'default' },
    { label: 'Escalate to counsellor', to: `/teacher/student/${student.id}/escalate`, variant: 'outline' },
  ];

  if (student.risk_level !== 'high') {
    buttons.splice(1, 0, {
      label: 'Set 2-week monitor reminder',
      to: `/teacher/student/${student.id}/checkin?mode=monitor`,
      variant: 'outline',
    });
  }

  if (student.risk_level === 'high') {
    buttons.push({
      label: 'Contact parents',
      to: `/teacher/student/${student.id}/parents`,
      variant: 'outline',
    });
  }

  return buttons;
}

function hasCompletedCheckIn(teacherActions = []) {
  return teacherActions.some((action) => action.action_type === 'check_in' && action.completed);
}

function getDisplayedNextStep(student, recommendedAction, teacherActions) {
  if (student.next_follow_up_at && hasCompletedCheckIn(teacherActions)) {
    return {
      action: 'Next session scheduled',
      description: `A follow-up has been scheduled for ${new Date(student.next_follow_up_at).toLocaleDateString()}.`,
    };
  }
  return recommendedAction;
}

function normalizeFeatureCode(featureCode) {
  if (featureCode === 'talkfather') return 'grp_talk_father';
  if (featureCode === 'talkmother') return 'grp_talk_mother';
  return featureCode;
}

function getDisplayedKeyFactors(student, latestCheckIn) {
  const persistedUnfavourableFeatures = Array.isArray(latestCheckIn?.unfavourable_features) && latestCheckIn.unfavourable_features.length > 0
    ? latestCheckIn.unfavourable_features
    : Array.isArray(student?.unfavourable_features) && student.unfavourable_features.length > 0
      ? student.unfavourable_features
      : [];

  if (persistedUnfavourableFeatures.length > 0) {
    return persistedUnfavourableFeatures
      .map((item, index) => {
        const feature = normalizeFeatureCode(item.feature_code || item.feature);
        const featureMeta = getFeatureById(feature);
        const risk = getFeatureRiskContribution(feature, item.feature_value);

        if (!featureMeta || !getSupportCategoryForFeature(feature)) return null;

        return {
          id: `${feature}-${index}`,
          feature,
          label: item.feature_label || featureMeta.label || formatSignalLabel(feature),
          category: featureMeta.category || null,
          risk: risk ?? 0,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (b.risk !== a.risk) return b.risk - a.risk;
        return a.label.localeCompare(b.label);
      })
      .slice(0, 3);
  }

  const persistedFactors = Array.isArray(student?.key_factors) ? student.key_factors : [];
  const latestFactors = Array.isArray(latestCheckIn?.top_factors) ? latestCheckIn.top_factors : [];
  const activeFactors = persistedFactors.length > 0 ? persistedFactors : latestFactors;

  return activeFactors
    .map((item, index) => {
      const featureId = item?.feature || item?.feature_code || item?.factor;
      const label = item?.factor || formatSignalLabel(featureId);
      if (!label) return null;

      return {
        id: `${featureId || 'factor'}-${index}`,
        label,
        category: item?.category || null,
      };
    })
    .filter(Boolean)
    .slice(0, 3);
}

export default function StudentDetail() {
  const { id } = useParams();
  const { teacher } = useTeacherAccess();
  const { data: student, isLoading } = useTeacherStudent(id, teacher);
  const { data: checkIns = [] } = useStudentCheckIns(id);
  const { data: teacherActions = [] } = useTeacherActions(id);
  const deleteTeacherAction = useDeleteTeacherAction();

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

  const latestCheckIn = checkIns[0] || null;
  const recommendedAction = getRecommendedAction(student);
  const displayedNextStep = getDisplayedNextStep(student, recommendedAction, teacherActions);
  const followUp = buildFollowUpRecommendation(student);
  const responseQuestions = getWeeklyResponseQuestions(latestCheckIn);
  const actionButtons = getActionButtons(student);
  const sexLabel = getResponseLabel('sex', student.baseline_responses?.sex);
  const displayedKeyFactors = getDisplayedKeyFactors(student, latestCheckIn);
  const scriptTopic = buildScriptTopic(displayedKeyFactors);

  const handleDeleteAction = async (action) => {
    const confirmed = window.confirm('Delete this log entry?');
    if (!confirmed) return;

    try {
      await deleteTeacherAction.mutateAsync({
        actionId: action.id,
        source: action.source,
      });
      toast.success('Log entry deleted.');
    } catch (error) {
      toast.error(error.message || 'Could not delete that log entry right now.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/teacher">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{student.name}</h1>
          <p className="text-sm text-muted-foreground">{student.grade && student.grade !== 'Unassigned' ? student.grade : 'Year not set'} · {student.student_identifier || 'No student ID'}</p>
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Section 1 — Student overview</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-foreground">{student.grade && student.grade !== 'Unassigned' ? student.grade : 'Year —'}</span>
            <span className="text-sm text-foreground">Age {student.age > 0 ? student.age : '—'}</span>
            <span className="text-sm text-foreground">Sex {sexLabel}</span>
            <RiskBadge level={student.risk_level} />
            <TrendIndicator trend={student.trend} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-6 items-stretch">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4 h-full">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Predicted Risk Score</p>
                  <div className="group relative">
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-popover border border-border shadow-md px-3 py-2 text-xs text-muted-foreground leading-relaxed hidden group-hover:block z-10">
                      This score reflects relative risk based on student responses and model predictions. It is used to track trends over time and support decision-making, not as a diagnosis.
                    </div>
                  </div>
                </div>
                <p className="text-3xl font-semibold text-foreground mt-2">{student.risk_score}</p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">Relative risk · not a clinical measure</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4 h-full">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Model confidence</p>
                <p className="text-sm font-medium text-foreground mt-2">
                  {student.confidence ? `${student.confidence}% confidence in the current support band` : 'Confidence unavailable'}
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4 h-full">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Driving factors</p>
                {displayedKeyFactors.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {displayedKeyFactors.map((factor) => (
                      <div key={factor.id} className="rounded-xl border border-border/50 bg-background/70 px-3 py-2">
                        <p className="text-sm font-medium text-foreground">{factor.label}</p>
                        {factor.category && (
                          <p className="text-[11px] text-muted-foreground mt-1 capitalize">{factor.category}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    No driver details available for this submission yet.
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-4 h-full flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Trend over last 4 weeks</p>
              <div className="flex-1 min-h-[180px]">
                <TrendSparkline weeklyScores={student.weekly_scores.slice(-4)} className="w-full h-full" />
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{buildTrendSummary(student)}</p>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Section 2 — This week&apos;s responses</h2>
          {!latestCheckIn ? (
            <p className="text-sm text-muted-foreground">No current-week submission has been recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {responseQuestions.map((question) => (
                <div key={question.feature} className="rounded-2xl border border-border/60 bg-card p-4">
                  <p className="text-sm font-medium text-foreground">{question.question}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {getResponseLabel(
                      question,
                      latestCheckIn.answers?.[question.feature]
                        ?? latestCheckIn.responses?.[question.feature]
                        ?? latestCheckIn.monthly_responses?.[question.feature],
                    )}
                  </p>
                </div>
              ))}
              <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquareText className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">Student&apos;s note to teacher:</p>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {latestCheckIn.free_text || 'No note added for this submission.'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Section 3 — Action panel — next steps</h2>
          <div className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">Recommended next step</p>
            <p className="text-lg font-semibold text-foreground">{displayedNextStep.action}</p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{displayedNextStep.description}</p>
          </div>

          <div className="space-y-4">
            {student.risk_level === 'low' && (
              <p className="text-sm text-muted-foreground">No action needed this week. Continue routine support.</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {actionButtons.map((button) => (
                <Link key={button.label} to={button.to}>
                  <Button variant={button.variant} className="w-full">
                    {button.label} →
                  </Button>
                </Link>
              ))}
            </div>
              <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserRound className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">Suggested draft for teacher review</p>
                </div>
              <p className="text-sm text-foreground leading-relaxed">
                {`Hi ${student.name}, I just wanted to check in with you. I've noticed you might be finding things a bit tough lately — how have things been with ${scriptTopic} recently?`}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarClock className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Follow-up</p>
              </div>
              <p className="text-sm text-foreground">
                {student.next_follow_up_at
                  ? `Reminder set — review ${student.name} on ${new Date(student.next_follow_up_at).toLocaleDateString()}.`
                  : followUp.title}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Section 4 — Action log</h2>
          {teacherActions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No actions logged yet.</p>
          ) : (
            <div className="space-y-3">
              {teacherActions.map((action) => (
                <div key={action.id || `${action.action_type}-${action.created_at || ''}`} className="rounded-2xl border border-border/60 bg-card p-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{actionTypeLabels[action.action_type] || action.action_type}</p>
                      {action.action_type === 'open_survey' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-rose-600 hover:text-rose-700"
                          disabled={deleteTeacherAction.isPending}
                          onClick={() => handleDeleteAction(action)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {action.created_at ? new Date(action.created_at).toLocaleString() : 'Saved action'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{outcomeLabels[action.outcome] || action.outcome || 'Pending'}</p>
                  <p className="text-sm text-foreground mt-2 leading-relaxed">{action.notes || action.referral_summary || 'No notes recorded.'}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
