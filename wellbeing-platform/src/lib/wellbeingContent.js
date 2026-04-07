import { FLAG_THRESHOLD, MONITOR_THRESHOLD } from '@/lib/rfModel';

export const doTips = [
  'Start with curiosity, not conclusions.',
  'Use open questions and let the student answer at their own pace.',
  'Reflect back what you heard before moving into advice.',
  'Agree one practical next step before the conversation ends.',
  'Write down the pattern and the follow-up plan while it is still fresh.',
];

export const dontTips = [
  "Don't frame the result as a diagnosis.",
  "Don't assume the top signal explains everything.",
  "Don't push for more disclosure than the student is ready for.",
  "Don't minimise bullying, safety, or repeated distress as a one-off.",
  "Don't promise secrecy beyond safeguarding limits.",
];

export const observeNextTips = {
  sleep: [
    'Look for repeated tiredness, lateness, or concentration dips early in the day.',
    'Check whether fatigue settles after workload peaks or stays elevated across weeks.',
  ],
  workload: [
    'Watch for missed deadlines, visible overwhelm, or avoidance near deadlines.',
    'Notice whether stress drops after assessments or keeps climbing.',
  ],
  family: [
    'Notice hesitation around going home, asking for help, or talking about support at home.',
    'Check whether the student seems relieved by school-based adult support.',
  ],
  social: [
    'Watch for withdrawal during breaks, group work, or changes in usual friendship patterns.',
    'If bullying is suspected, move quickly into documentation and safeguarding support.',
  ],
  physical: [
    'Notice repeated headaches, stomachaches, or requests to leave class.',
    'See whether the physical complaints show up around specific stress points.',
  ],
  school: [
    'Watch for disengagement, low belonging, or sharp drops in trust toward adults in school.',
    'Notice whether classroom support changes the pattern over the next 2 weeks.',
  ],
  online: [
    'Ask whether online spaces feel supportive, draining, or conflict-heavy at the moment.',
    'If there are signs of online harm, keep evidence and follow safeguarding steps.',
  ],
  self_image: [
    'Notice changes in confidence, PE participation, or appearance-focused self-talk.',
    'Watch for teasing, avoidance, or comparison patterns that keep repeating.',
  ],
  general: [
    'Compare the current week with the prior two weeks instead of judging one moment.',
    'If the pattern stays elevated after support, step up the support plan.',
  ],
};

export const generalSupportResources = [
  {
    title: 'Sleep reset',
    description: 'Useful when the week has felt draining or sleep has been harder than usual.',
    actions: [
      'Try a calmer 30-minute wind-down before bed.',
      'Keep screens out of that last 30 minutes if you can.',
      'Aim for the sleep hours recommended for your age group.',
    ],
  },
  {
    title: 'Stress reset',
    description: 'Useful when school or deadlines have felt especially heavy this week.',
    actions: [
      'Break one big task into the next tiny step only.',
      'Try one short focus block instead of forcing a long one.',
      'Tell a teacher early if several deadlines are landing at once.',
    ],
  },
  {
    title: 'Reach out early',
    description: 'Useful when the week feels heavier than what you want to handle alone.',
    actions: [
      'Start with one trusted adult or friend.',
      'You do not need the perfect words to ask for support.',
      'A short honest message is enough to start the conversation.',
    ],
  },
];

function getTopFactorLabels(student) {
  return (student?.key_factors || [])
    .map((item) => item.factor)
    .filter(Boolean)
    .slice(0, 2);
}

export function buildTeacherCheckInPrompts(student) {
  const factors = getTopFactorLabels(student);
  const joinedFactors = factors.length > 0 ? factors.join(' and ').toLowerCase() : 'a few areas';
  const trendText = student?.trend === 'worsening'
    ? 'the last few weeks have looked a bit heavier'
    : 'this week may have felt heavier than usual';

  return [
    `I wanted to check in because ${trendText}, especially around ${joinedFactors}. How have things felt from your side?`,
    "You're not in trouble. I just wanted to make space in case there's anything important you'd want me to know.",
    'What has felt hardest to manage lately, and what has still felt a little bit manageable?',
    'Would it help if we worked out one small support step together for the next 2 weeks?',
  ];
}

export function buildFollowUpRecommendation(student) {
  const score = Number(student?.risk_score || 0);
  const baseDays = score >= FLAG_THRESHOLD ? 14 : score >= MONITOR_THRESHOLD ? 14 : 21;
  const reason = score >= FLAG_THRESHOLD
    ? 'Student is currently in the flagged band and should be reviewed again soon.'
    : score >= MONITOR_THRESHOLD
      ? 'Student is in the monitoring band and should be reviewed before the pattern becomes entrenched.'
      : 'Routine follow-up is still useful so support feels consistent rather than reactive.';

  return {
    days: baseDays,
    title: `Review again in ${baseDays} days`,
    reason,
  };
}

export function buildParentMessage(student) {
  const topFactors = getTopFactorLabels(student);
  const factorLine = topFactors.length > 0
    ? `We have noticed some recent wellbeing signals around ${topFactors.join(' and ').toLowerCase()}.`
    : 'We have noticed some recent wellbeing signals that suggest the student may benefit from additional support.';

  return [
    `Hello parent/guardian of ${student?.name || 'the student'},`,
    '',
    'I am reaching out to share a supportive wellbeing update.',
    factorLine,
    'At this stage, this is not an alarm message. It is a check-in so we can support the student early and appropriately.',
    'We would value your partnership in gently checking how things have been feeling recently and whether there is any support that would help at home or in school.',
    '',
    'If helpful, we can arrange a follow-up conversation.',
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
      student_identifier: student?.student_identifier,
    },
    scoring: {
      risk_score: student?.risk_score,
      risk_level: student?.risk_level,
      trend: student?.trend,
      confidence: student?.confidence,
    },
    signals: student?.key_factors || [],
    weekly_scores: student?.weekly_scores || [],
    teacher_notes: teacherNotes,
    generated_at: new Date().toISOString(),
  };
}
