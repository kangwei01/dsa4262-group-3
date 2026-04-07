// Demo student profiles for the prototype
export const demoStudents = [
  {
    id: 'student_1',
    name: 'Alex M.',
    age: 14,
    grade: 'Year 9',
    risk_level: 'high',
    risk_score: 72,
    trend: 'worsening',
    confidence: 85,
    action_status: 'none',
    key_factors: [
      { factor: 'Sleep quality', direction: 'declining', severity: 'high', category: 'sleep' },
      { factor: 'School pressure', direction: 'increasing', severity: 'high', category: 'workload' },
      { factor: 'Social connection', direction: 'declining', severity: 'medium', category: 'social' },
    ],
    weekly_scores: [
      { week: 'W1', score: 35, sleep: 3, stress: 2, mood: 4, social: 4 },
      { week: 'W2', score: 40, sleep: 3, stress: 3, mood: 3, social: 3 },
      { week: 'W3', score: 52, sleep: 2, stress: 3, mood: 3, social: 3 },
      { week: 'W4', score: 58, sleep: 2, stress: 4, mood: 2, social: 2 },
      { week: 'W5', score: 65, sleep: 1, stress: 4, mood: 2, social: 2 },
      { week: 'W6', score: 72, sleep: 1, stress: 5, mood: 2, social: 1 },
    ],
    scenario: 'silent_struggler',
    scenario_desc: 'Low outward behavioural change but rising internal distress scores over 6 weeks. The system detects sustained upward trend despite no obvious classroom signals.',
  },
  {
    id: 'student_2',
    name: 'Jamie L.',
    age: 15,
    grade: 'Year 10',
    risk_level: 'medium',
    risk_score: 48,
    trend: 'stable',
    confidence: 72,
    action_status: 'check_in_scheduled',
    key_factors: [
      { factor: 'School pressure', direction: 'increasing', severity: 'medium', category: 'workload' },
      { factor: 'Energy levels', direction: 'declining', severity: 'low', category: 'stress' },
    ],
    weekly_scores: [
      { week: 'W1', score: 30, sleep: 4, stress: 2, mood: 4, social: 4 },
      { week: 'W2', score: 35, sleep: 3, stress: 3, mood: 3, social: 4 },
      { week: 'W3', score: 55, sleep: 2, stress: 5, mood: 2, social: 3 },
      { week: 'W4', score: 52, sleep: 3, stress: 4, mood: 3, social: 3 },
      { week: 'W5', score: 48, sleep: 3, stress: 3, mood: 3, social: 4 },
      { week: 'W6', score: 48, sleep: 3, stress: 3, mood: 3, social: 4 },
    ],
    scenario: 'temporary_stress',
    scenario_desc: 'Spike during exam period (W3) but returned to baseline. System correctly identifies this as temporary stress, avoiding a false alarm escalation.',
  },
  {
    id: 'student_3',
    name: 'Sam K.',
    age: 13,
    grade: 'Year 8',
    risk_level: 'low',
    risk_score: 22,
    trend: 'improving',
    confidence: 90,
    action_status: 'check_in_completed',
    key_factors: [
      { factor: 'Mood', direction: 'improving', severity: 'low', category: 'general' },
    ],
    weekly_scores: [
      { week: 'W1', score: 45, sleep: 3, stress: 3, mood: 2, social: 3 },
      { week: 'W2', score: 40, sleep: 3, stress: 3, mood: 3, social: 3 },
      { week: 'W3', score: 35, sleep: 4, stress: 2, mood: 3, social: 4 },
      { week: 'W4', score: 30, sleep: 4, stress: 2, mood: 4, social: 4 },
      { week: 'W5', score: 25, sleep: 4, stress: 2, mood: 4, social: 5 },
      { week: 'W6', score: 22, sleep: 5, stress: 1, mood: 5, social: 5 },
    ],
    scenario: null,
    scenario_desc: null,
  },
  {
    id: 'student_4',
    name: 'Riley P.',
    age: 14,
    grade: 'Year 9',
    risk_level: 'low',
    risk_score: 28,
    trend: 'stable',
    confidence: 88,
    action_status: 'none',
    key_factors: [],
    weekly_scores: [
      { week: 'W1', score: 25, sleep: 4, stress: 2, mood: 4, social: 4 },
      { week: 'W2', score: 28, sleep: 4, stress: 2, mood: 4, social: 4 },
      { week: 'W3', score: 26, sleep: 4, stress: 2, mood: 4, social: 4 },
      { week: 'W4', score: 27, sleep: 4, stress: 2, mood: 4, social: 4 },
      { week: 'W5', score: 28, sleep: 4, stress: 2, mood: 4, social: 4 },
      { week: 'W6', score: 28, sleep: 4, stress: 2, mood: 4, social: 4 },
    ],
    scenario: null,
    scenario_desc: null,
  },
  {
    id: 'student_5',
    name: 'Morgan T.',
    age: 16,
    grade: 'Year 11',
    risk_level: 'medium',
    risk_score: 55,
    trend: 'worsening',
    confidence: 78,
    action_status: 'monitoring',
    key_factors: [
      { factor: 'Focus', direction: 'declining', severity: 'medium', category: 'focus' },
      { factor: 'Sleep quality', direction: 'declining', severity: 'medium', category: 'sleep' },
    ],
    weekly_scores: [
      { week: 'W1', score: 30, sleep: 4, stress: 2, mood: 4, social: 4 },
      { week: 'W2', score: 35, sleep: 3, stress: 3, mood: 3, social: 3 },
      { week: 'W3', score: 40, sleep: 3, stress: 3, mood: 3, social: 3 },
      { week: 'W4', score: 45, sleep: 2, stress: 4, mood: 3, social: 3 },
      { week: 'W5', score: 50, sleep: 2, stress: 4, mood: 2, social: 3 },
      { week: 'W6', score: 55, sleep: 2, stress: 4, mood: 2, social: 2 },
    ],
    scenario: null,
    scenario_desc: null,
  },
];

export const getRecommendedAction = (student) => {
  if (student.risk_level === 'high') return {
    action: 'Refer to Counsellor',
    urgency: 'urgent',
    description: `Flagged due to sustained increase in distress score over ${student.weekly_scores.length} weeks (${student.weekly_scores[0]?.score} → ${student.risk_score}). Key contributing factors: ${student.key_factors.map(f => `${f.factor} (${f.direction})`).join(', ')}.`,
  };
  if (student.risk_level === 'medium' && student.trend === 'worsening') return {
    action: 'Schedule Check-in',
    urgency: 'soon',
    description: `Gradual worsening trend detected over past weeks. Primary factors: ${student.key_factors.map(f => f.factor).join(', ')}. Score has increased from ${student.weekly_scores[0]?.score} to ${student.risk_score} — not yet at threshold but trend warrants a check-in.`,
  };
  if (student.risk_level === 'medium') return {
    action: 'Monitor',
    urgency: 'normal',
    description: 'Moderate distress level but trend is currently stable. Continue monitoring weekly responses for any change in direction.',
  };
  return {
    action: 'Continue Monitoring',
    urgency: 'low',
    description: 'Student responses are within a healthy range. No action required at this time — the system will continue tracking weekly.',
  };
};

export const checkInPrompts = [
  "I've noticed you seem a bit more tired lately — is everything okay?",
  "How are things going for you at the moment? Just checking in.",
  "I wanted to see how you're doing — sometimes weeks can be tougher than others.",
  "Is there anything going on that's making school feel harder right now?",
  "I'm here if you ever want to talk. No pressure at all.",
];

export const doTips = [
  "Use open-ended questions to encourage sharing",
  "Listen actively without jumping to solutions",
  "Normalise their feelings — 'lots of students feel this way'",
  "Thank them for being open with you",
  "Follow up within a week",
];

export const dontTips = [
  "Don't minimise their feelings ('it's just exams')",
  "Don't promise confidentiality you can't guarantee",
  "Don't diagnose or label their experience",
  "Don't compare them to other students",
  "Don't pressure them to talk if they're not ready",
];

export const observeNextTips = {
  sleep: [
    "Look for continued fatigue — arriving tired, yawning, difficulty concentrating early in the day",
    "Notice if they mention sleep in passing conversation",
  ],
  workload: [
    "Watch for signs of avoidance — not handing in work, appearing distracted near deadlines",
    "Check if workload concerns persist after any exams or deadlines pass",
  ],
  focus: [
    "Notice classroom engagement — are they tracking the lesson or drifting?",
    "Look for changes in participation or quality of written work",
  ],
  social: [
    "Observe lunchtime and break-time behaviour — are they engaging with peers?",
    "Any withdrawal from group activities or usual friendship groups?",
  ],
  stress: [
    "Look for physical signs — nail-biting, restlessness, appearing overwhelmed",
    "Notice if the student seeks help or avoids it",
  ],
  general: [
    "Compare to previous weeks' demeanour — any notable changes in energy or engagement",
    "If no change after 2 weeks, consider a follow-up check-in",
  ],
};