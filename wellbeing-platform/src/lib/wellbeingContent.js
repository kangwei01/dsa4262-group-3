import { teacherProfileByIdentifier } from '@/data/seed/teacherProfiles';

export function buildTeacherCheckInPrompts(student) {
  return [
    `Hi ${student?.name || 'there'}, I just wanted to check in with you — how have you been feeling lately?`,
    'I’ve noticed there may have been some recent challenges, so I thought it would be helpful to have a quick check-in.',
    'There’s no pressure to share everything — we can go at your pace.',
    'What’s been feeling most difficult recently? And is there anything that’s been helping, even a little?',
    'If it helps, we can also think about one small step that might make the next few days feel a bit more manageable.',
  ];
}

export function buildFollowUpRecommendation(student) {
  const riskLevel = student?.risk_level || 'low';
  const days = riskLevel === 'high' ? 14 : riskLevel === 'medium' ? 14 : 21;

  return {
    days,
    title: `Review again in ${days} days`,
    reason: riskLevel === 'high'
      ? 'This student is in the flagged band and should be reviewed again soon.'
      : riskLevel === 'medium'
        ? 'This student is in the monitoring band and should be reviewed in 2 weeks.'
        : 'Routine support is enough right now.',
  };
}

function getStudentPronoun(student) {
  const sex = String(student?.baseline_responses?.sex ?? '').trim();
  if (sex === '1') return 'he';
  if (sex === '2') return 'she';
  return 'they';
}

function toTitleCase(value = '') {
  return String(value)
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function resolveTeacherName(teacherContext, student) {
  if (teacherContext?.name) return teacherContext.name;

  const teacherIdentifier = typeof teacherContext === 'string'
    ? teacherContext
    : student?.assigned_teacher || '';
  const seededTeacher = teacherProfileByIdentifier[teacherIdentifier];
  if (seededTeacher?.name) return seededTeacher.name;

  const localPart = teacherIdentifier.includes('@')
    ? teacherIdentifier.split('@')[0]
    : teacherIdentifier;

  return toTitleCase(localPart) || 'Teacher';
}

export function buildParentMessage(student, teacherContext = null) {
  const studentName = student?.name || 'the student';
  const pronoun = getStudentPronoun(student);
  const teacherName = resolveTeacherName(teacherContext, student);

  return [
    `Dear Parent/Guardian of ${studentName},`,
    '',
    `I hope you are well. I am writing to check in regarding ${studentName} and share a brief update.`,
    '',
    `Recently, we have noticed some signs that ${pronoun} may be experiencing increased stress. As part of our usual support process, we would like to check in early and ensure ${pronoun} is well supported.`,
    '',
    'This is not a cause for concern, but rather a proactive step. If helpful, I would be happy to arrange a short conversation to share more and hear your perspective.',
    '',
    'Thank you for your support.',
    '',
    'Warm regards,',
    teacherName,
  ].join('\n');
}

export function buildEscalationPayload(student, teacherNotes = '') {
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
      model_confidence: student?.confidence ?? null,
      current_score: student?.risk_score || 0,
      trend: student?.trend || 'stable',
      weekly_scores: student?.weekly_scores || [],
    },
    signals: [],
    student_note: null,
    teacher_notes: teacherNotes,
    generated_at: new Date().toISOString(),
  };
}
