import {
  FLAG_THRESHOLD,
  formatSignalLabel,
  getSignalArrow,
  MONITOR_THRESHOLD,
} from '@/lib/rfModel';

function getTopSignals(student, limit = 2) {
  return (student?.key_factors || []).slice(0, limit);
}

function buildSignalPhrase(student) {
  const signals = getTopSignals(student);
  if (signals.length === 0) return 'things have felt a bit heavier lately';
  return signals
    .map((signal) => formatSignalLabel(signal.feature || signal.factor).toLowerCase())
    .join(' and ');
}

export function buildTeacherCheckInPrompts(student) {
  const signals = getTopSignals(student);
  const namedSignals = signals.map((signal) => formatSignalLabel(signal.feature || signal.factor).toLowerCase());
  const signalLine = namedSignals.length > 0
    ? namedSignals.join(' and ')
    : 'how things have been feeling lately';

  return [
    `Hi ${student?.name || 'there'}, I just wanted to check in with you. I've noticed you might be finding things a bit tough lately — how have things been with ${signalLine} recently?`,
    "There's no pressure to explain everything at once. I just wanted to make some space in case this week has felt heavier than usual.",
    'What has felt hardest lately, and what has helped even a little?',
    'Let’s work out one small next step that could make the next two weeks feel a bit more manageable.',
  ];
}

export function buildFollowUpRecommendation(student) {
  const score = Number(student?.risk_score || 0);
  const days = score >= FLAG_THRESHOLD ? 14 : score >= MONITOR_THRESHOLD ? 14 : 21;

  return {
    days,
    title: `Review again in ${days} days`,
    reason: score >= FLAG_THRESHOLD
      ? 'This student is in the flagged band and should be reviewed again soon.'
      : score >= MONITOR_THRESHOLD
        ? 'This student is in the monitoring band and should be reviewed in 2 weeks.'
        : 'Routine support is enough right now.',
  };
}

export function buildParentMessage(student) {
  const signalSummary = buildSignalPhrase(student);

  return [
    `Hello parent/guardian of ${student?.name || 'the student'},`,
    '',
    'I am reaching out with a supportive school update.',
    `We have noticed that ${signalSummary} may have felt heavier recently, and we want to make sure support is in place early.`,
    'This is not an alarm message. We simply want to partner with you in checking how things have been going and whether any added support would help at home or in school.',
    '',
    'Please let me know if you would like to speak further.',
    '',
    'Thank you,',
    student?.assigned_teacher || 'School support team',
  ].join('\n');
}

export function buildEscalationPayload(student, teacherNotes = '') {
  const signals = getTopSignals(student, 3).map((signal) => ({
    factor: formatSignalLabel(signal.feature || signal.factor),
    direction: `${getSignalArrow(signal.direction)} ${signal.direction || 'stable'}`,
    severity: signal.severity || 'medium',
  }));

  return {
    student: {
      id: student?.id,
      name: student?.name,
      grade: student?.grade,
      age: student?.age,
      sex: student?.baseline_responses?.sex || null,
      student_identifier: student?.student_identifier || null,
    },
    overview: {
      support_band: student?.risk_level || 'low',
      current_score: student?.risk_score || 0,
      trend: student?.trend || 'stable',
      weekly_scores: student?.weekly_scores || [],
    },
    signals,
    student_note: null,
    teacher_notes: teacherNotes,
    generated_at: new Date().toISOString(),
  };
}
