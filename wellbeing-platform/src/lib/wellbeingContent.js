export function buildTeacherCheckInPrompts(student) {
  return [
    `Hi ${student?.name || 'there'}, I just wanted to check in with you. I've noticed you might be finding things a bit tough lately — how have things been feeling recently?`,
    'This should be treated as a prompt for a supportive check-in, not a diagnosis.',
    "There's no pressure to explain everything at once. I just wanted to make some space in case this week has felt heavier than usual.",
    'What has felt hardest lately, and what has helped even a little?',
    'Let’s work out one small next step that could make the next two weeks feel a bit more manageable.',
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

export function buildParentMessage(student) {
  return [
    `Hello parent/guardian of ${student?.name || 'the student'},`,
    '',
    'I am reaching out with a supportive school update.',
    'We have noticed that things may have felt a bit heavier recently, and we want to make sure support is in place early.',
    'The current support band is only one input into our decision-making.',
    'This is not an alarm message. We simply want to partner with you in checking how things have been going and whether any added support would help at home or in school.',
    '',
    'Please let me know if you would like to speak further.',
    '',
    'Thank you,',
    student?.assigned_teacher || 'School support team',
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
