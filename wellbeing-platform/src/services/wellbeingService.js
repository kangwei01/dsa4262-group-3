import { backendClient } from '@/api/backendClient';
import { seedStudentProfiles, studentScenarioByName } from '@/data/seed/studentProfiles';
import { normalizeStudentIdentifier } from '@/lib/studentSession';
import {
  buildLegacyCheckInFields,
  buildKeyFactorsFromCheckInAnswers,
  buildWeeklyScoreSnapshot,
  computeCheckInScore,
  deriveConfidenceFromScores,
  deriveRiskLevel,
  deriveSignalsFromCheckInAnswers,
  deriveTrendFromScores,
  getFeatureById,
  getFeatureByLabel,
  hasCompletedOnboarding,
  MONITOR_THRESHOLD,
  monthlyQuestions,
  oneTimeQuestions,
} from '@/lib/rfModel';

const FALLBACK_SOURCE = 'fallback';
const BACKEND_SOURCE = 'backend';
const LOCAL_PROFILE_STORAGE_KEY = 'mindbridge_local_student_profiles';
const LOCAL_CHECKIN_STORAGE_KEY = 'mindbridge_local_student_checkins';
const LOCAL_TEACHER_ACTION_STORAGE_KEY = 'mindbridge_local_teacher_actions';

function readLocalCollection(storageKey) {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn(`Unable to read local collection for ${storageKey}:`, error);
    return [];
  }
}

function writeLocalCollection(storageKey, items) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(storageKey, JSON.stringify(items));
}

function getStorage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

function sortWeeklyScores(weeklyScores = []) {
  const parseWeekValue = (value) => {
    const raw = String(value || '');
    const weekMatch = raw.match(/^W(\d+)$/i);
    if (weekMatch) return Number(weekMatch[1]);
    const timestamp = Date.parse(raw);
    if (!Number.isNaN(timestamp)) return timestamp;
    return raw;
  };

  return [...weeklyScores].sort((a, b) => {
    const aValue = parseWeekValue(a.week);
    const bValue = parseWeekValue(b.week);

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return aValue - bValue;
    }

    return String(a.week || '').localeCompare(String(b.week || ''));
  });
}

function inferObservationCategory(feature) {
  if (!feature) return 'general';
  if (feature.feature === 'sleepdificulty') return 'sleep';
  if (feature.feature === 'schoolpressure') return 'workload';
  if (feature.category === 'family') return 'family';
  if (feature.category === 'peer') return 'social';
  if (feature.category === 'physical' || feature.category === 'habits') return 'physical';
  if (feature.category === 'digital') return 'online';
  if (feature.category === 'school') return 'school';
  if (feature.category === 'self_image') return 'self_image';
  return 'general';
}

function normalizeBaselineSex(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === 'male' || normalized === '1') return 1;
  if (normalized === 'female' || normalized === '2') return 2;
  return value ?? '';
}

function buildBaselineResponses(source = {}) {
  return Object.fromEntries(
    oneTimeQuestions.map((question) => {
      const rawValue = source?.[question.feature] ?? '';
      const normalizedValue = question.feature === 'sex'
        ? normalizeBaselineSex(rawValue)
        : rawValue;
      return [question.feature, normalizedValue];
    }),
  );
}

function buildMonthlyResponses(source = {}) {
  return Object.fromEntries(
    monthlyQuestions.map((question) => [
      question.feature,
      source?.[question.feature] ?? '',
    ]),
  );
}

function enrichKeyFactor(item = {}) {
  const feature = getFeatureById(item.feature) || getFeatureByLabel(item.factor);

  return {
    ...item,
    feature: feature?.feature || item.feature || null,
    factor: item.factor || feature?.label || item.feature || 'Unknown factor',
    category: item.category || inferObservationCategory(feature),
  };
}

function normalizeStudentProfile(student, source = BACKEND_SOURCE) {
  const { student_passcode, ...safeStudent } = student || {};
  const scenarioMeta = studentScenarioByName[student.name] || {};
  const weekly_scores = sortWeeklyScores(student.weekly_scores || []);
  const baseline_responses = buildBaselineResponses({
    age: student.baseline_responses?.age ?? student.age ?? '',
    sex: student.baseline_responses?.sex ?? '',
    fasholidays: student.baseline_responses?.fasholidays ?? '',
    bodyweight: student.baseline_responses?.bodyweight ?? '',
    bodyheight: student.baseline_responses?.bodyheight ?? '',
    ...student.baseline_responses,
  });
  const monthly_responses = buildMonthlyResponses(student.monthly_responses || {});

  return {
    ...safeStudent,
    source,
    age: Number(student.age || 0),
    risk_score: Number(student.risk_score || 0),
    confidence: Number(student.confidence || 72),
    student_identifier: normalizeStudentIdentifier(student.student_identifier || ''),
    key_factors: (student.key_factors || []).map(enrichKeyFactor),
    weekly_scores,
    baseline_responses,
    monthly_responses,
    onboarding_completed: Boolean(student.onboarding_completed ?? hasCompletedOnboarding(baseline_responses)),
    onboarding_completed_at: student.onboarding_completed_at || null,
    monthly_completed_at: student.monthly_completed_at || null,
    survey_status: student.survey_status === 'open' ? 'open' : 'closed',
    survey_type: student.survey_type === 'monthly' ? 'monthly' : 'weekly',
    survey_opened_at: student.survey_opened_at || null,
    survey_opened_by: student.survey_opened_by || null,
    next_follow_up_at: student.next_follow_up_at || null,
    next_follow_up_note: student.next_follow_up_note || '',
    scenario: scenarioMeta.scenario || null,
    scenario_desc: scenarioMeta.scenario_desc || null,
  };
}

function deriveStudentNameFromIdentifier(identifier) {
  const localPart = String(identifier || '').split('@')[0] || 'Student';
  const cleaned = localPart.replace(/[._-]+/g, ' ').trim();
  if (!cleaned) return 'Student';
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildSeedFallbackStudentRecords() {
  return seedStudentProfiles.map((student, index) => ({
    ...student,
    id: `fallback_${index + 1}`,
  }));
}

function buildSeedFallbackStudents() {
  return buildSeedFallbackStudentRecords().map((student) => normalizeStudentProfile(student, FALLBACK_SOURCE));
}

function readLocalDraftProfiles() {
  return readLocalCollection(LOCAL_PROFILE_STORAGE_KEY);
}

function writeLocalDraftProfiles(profiles) {
  writeLocalCollection(LOCAL_PROFILE_STORAGE_KEY, profiles);
}

function buildLocalDraftStudents() {
  return readLocalDraftProfiles().map((student) => normalizeStudentProfile(student, FALLBACK_SOURCE));
}

function buildFallbackStudents() {
  const seedStudents = buildSeedFallbackStudents();
  const localStudents = buildLocalDraftStudents();
  const localByIdentifier = new Map(
    localStudents
      .map((student) => [normalizeStudentIdentifier(student.student_identifier || ''), student])
      .filter(([identifier]) => Boolean(identifier)),
  );

  const mergedSeeds = seedStudents.map((student) => {
    const identifier = normalizeStudentIdentifier(student.student_identifier || '');
    return localByIdentifier.get(identifier) || student;
  });

  const seedIdentifiers = new Set(
    seedStudents.map((student) => normalizeStudentIdentifier(student.student_identifier || '')),
  );

  const localOnlyStudents = localStudents.filter((student) => {
    const identifier = normalizeStudentIdentifier(student.student_identifier || '');
    return !identifier || !seedIdentifiers.has(identifier);
  });

  return [...mergedSeeds, ...localOnlyStudents];
}

function upsertLocalDraftProfile(profile) {
  const normalizedIdentifier = normalizeStudentIdentifier(profile.student_identifier || '');
  const existingLocalProfile = readLocalDraftProfiles().find((student) => (
    student.id === profile.id
    || normalizeStudentIdentifier(student.student_identifier || '') === normalizedIdentifier
  ));
  const existingSeedProfile = buildSeedFallbackStudentRecords().find((student) => (
    student.id === profile.id
    || normalizeStudentIdentifier(student.student_identifier || '') === normalizedIdentifier
  ));
  const preservedPasscode =
    profile.student_passcode
    || existingLocalProfile?.student_passcode
    || existingSeedProfile?.student_passcode
    || '';
  const normalizedProfile = {
    ...profile,
    source: FALLBACK_SOURCE,
    student_identifier: normalizedIdentifier,
    student_passcode: preservedPasscode,
  };

  const profiles = readLocalDraftProfiles();
  const nextProfiles = profiles.filter((student) => (
    student.id !== normalizedProfile.id
    && normalizeStudentIdentifier(student.student_identifier || '') !== normalizedProfile.student_identifier
  ));
  nextProfiles.push(normalizedProfile);
  writeLocalDraftProfiles(nextProfiles);

  return normalizeStudentProfile(normalizedProfile, FALLBACK_SOURCE);
}

function normalizeTeacherAction(action = {}, source = BACKEND_SOURCE) {
  return {
    ...action,
    source,
    created_at: action.created_at || action.updated_at || new Date().toISOString(),
    follow_up_due_at: action.follow_up_due_at || null,
    generated_parent_message: action.generated_parent_message || '',
    escalation_payload: action.escalation_payload || null,
  };
}

function listLocalTeacherActions(studentId) {
  return readLocalCollection(LOCAL_TEACHER_ACTION_STORAGE_KEY)
    .filter((action) => action.student_id === studentId)
    .map((action) => normalizeTeacherAction(action, FALLBACK_SOURCE));
}

function appendLocalTeacherAction(action) {
  const actions = readLocalCollection(LOCAL_TEACHER_ACTION_STORAGE_KEY);
  actions.push(action);
  writeLocalCollection(LOCAL_TEACHER_ACTION_STORAGE_KEY, actions);
  return normalizeTeacherAction(action, FALLBACK_SOURCE);
}

function listLocalStudentCheckIns(studentId) {
  return readLocalCollection(LOCAL_CHECKIN_STORAGE_KEY)
    .filter((checkIn) => checkIn.student_id === studentId)
    .map((checkIn) => normalizeCheckIn(checkIn, FALLBACK_SOURCE));
}

function appendLocalStudentCheckIn(checkIn) {
  const checkIns = readLocalCollection(LOCAL_CHECKIN_STORAGE_KEY);
  checkIns.push(checkIn);
  writeLocalCollection(LOCAL_CHECKIN_STORAGE_KEY, checkIns);
  return normalizeCheckIn(checkIn, FALLBACK_SOURCE);
}

function mergeUniqueBy(items = [], keyBuilder) {
  const seen = new Set();

  return items.filter((item) => {
    const key = keyBuilder(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractCheckInAnswers(checkIn = {}) {
  if (checkIn.responses && typeof checkIn.responses === 'object') {
    return checkIn.responses;
  }

  return Object.fromEntries(
    Object.entries(checkIn).filter(([key]) => key.startsWith('q_')),
  );
}

function normalizeCheckIn(checkIn, source = BACKEND_SOURCE) {
  return {
    ...checkIn,
    source,
    survey_type: checkIn.survey_type === 'monthly' ? 'monthly' : 'weekly',
    answers: extractCheckInAnswers(checkIn),
    baseline_responses: checkIn.baseline_responses || null,
    monthly_responses: buildMonthlyResponses(checkIn.monthly_responses || {}),
  };
}

let seedAttempted = false;

async function ensureStudentProfilesSeeded() {
  if (seedAttempted) return;
  seedAttempted = true;

  const existing = await backendClient.entities.StudentProfile.list('-created_at', 50);
  if (existing.length > 0) return;

  for (const student of seedStudentProfiles) {
    await backendClient.entities.StudentProfile.create(student);
  }
}

export async function listStudents() {
  try {
    await ensureStudentProfilesSeeded();
    const students = await backendClient.entities.StudentProfile.list('-created_at', 100);
    if (students.length === 0) {
      return buildFallbackStudents();
    }
    const remoteStudents = students.map((student) => normalizeStudentProfile(student, BACKEND_SOURCE));
    const remoteIdentifiers = new Set(
      remoteStudents.map((student) => normalizeStudentIdentifier(student.student_identifier || '')),
    );
    const localOnlyStudents = buildLocalDraftStudents().filter((student) => {
      const identifier = normalizeStudentIdentifier(student.student_identifier || '');
      return !identifier || !remoteIdentifiers.has(identifier);
    });
    return [...remoteStudents, ...localOnlyStudents];
  } catch (error) {
    console.warn('Falling back to local student seed data:', error);
    return buildFallbackStudents();
  }
}

export async function getStudentById(studentId) {
  try {
    const student = await backendClient.entities.StudentProfile.get(studentId);
    return normalizeStudentProfile(student, BACKEND_SOURCE);
  } catch (error) {
    const fallback = buildFallbackStudents().find((student) => student.id === studentId);
    if (fallback) return fallback;

    const students = await listStudents();
    return students.find((student) => student.id === studentId) || null;
  }
}

export async function getDefaultStudent() {
  const students = await listStudents();
  return students[0] || null;
}

export async function getStudentByIdentifier(identifier) {
  const normalized = normalizeStudentIdentifier(identifier);
  if (!normalized) return null;

  const students = await listStudents();
  return students.find((student) => normalizeStudentIdentifier(student.student_identifier) === normalized) || null;
}

async function findStoredStudentRecordByIdentifier(identifier) {
  const normalized = normalizeStudentIdentifier(identifier);
  if (!normalized) return null;

  try {
    await ensureStudentProfilesSeeded();
    const remoteStudents = await backendClient.entities.StudentProfile.list('-created_at', 200);
    const remoteMatch = remoteStudents.find((student) => (
      normalizeStudentIdentifier(student.student_identifier || '') === normalized
    ));
    if (remoteMatch) {
      return { student: remoteMatch, source: BACKEND_SOURCE };
    }
  } catch (error) {
    console.warn('Unable to query backend for student authentication lookup:', error);
  }

  const localMatch = readLocalDraftProfiles().find((student) => (
    normalizeStudentIdentifier(student.student_identifier || '') === normalized
  ));
  if (localMatch) {
    return { student: localMatch, source: FALLBACK_SOURCE };
  }

  const seededMatch = buildSeedFallbackStudentRecords().find((student) => (
    normalizeStudentIdentifier(student.student_identifier || '') === normalized
  ));
  if (seededMatch) {
    return { student: seededMatch, source: FALLBACK_SOURCE };
  }

  return null;
}

export async function authenticateStudentProfile({ identifier, passcode }) {
  const normalized = normalizeStudentIdentifier(identifier);
  const normalizedPasscode = String(passcode || '').trim();
  if (!normalized || !normalizedPasscode) return null;

  const existing = await findStoredStudentRecordByIdentifier(normalized);
  if (existing?.student) {
    const savedPasscode = String(existing.student.student_passcode || '').trim();

    if (savedPasscode && savedPasscode !== normalizedPasscode) {
      throw new Error('That student ID and passcode do not match our records.');
    }

    if (!savedPasscode) {
      if (existing.source === BACKEND_SOURCE && existing.student.id) {
        try {
          const updated = await backendClient.entities.StudentProfile.update(existing.student.id, {
            student_passcode: normalizedPasscode,
          });
          return normalizeStudentProfile(updated, BACKEND_SOURCE);
        } catch (error) {
          console.warn('Unable to save passcode to backend profile; falling back to local draft update:', error);
        }
      }

      return upsertLocalDraftProfile({
        ...existing.student,
        student_passcode: normalizedPasscode,
      });
    }

    return normalizeStudentProfile(existing.student, existing.source);
  }

  const draftProfile = {
    name: deriveStudentNameFromIdentifier(normalized),
    student_identifier: normalized,
    student_passcode: normalizedPasscode,
    grade: 'Unassigned',
    age: 0,
    risk_level: 'low',
    risk_score: 0,
    trend: 'stable',
    confidence: 72,
    action_status: 'none',
    assigned_teacher: 'wellbeing@school.edu',
    key_factors: [],
    weekly_scores: [],
    baseline_responses: {},
    monthly_responses: {},
    onboarding_completed: false,
    onboarding_completed_at: null,
    monthly_completed_at: null,
    survey_status: 'closed',
    survey_type: 'weekly',
    survey_opened_at: null,
    survey_opened_by: null,
    next_follow_up_at: null,
    next_follow_up_note: '',
  };

  try {
    const created = await backendClient.entities.StudentProfile.create(draftProfile);
    return normalizeStudentProfile(created, BACKEND_SOURCE);
  } catch (error) {
    console.warn('Unable to create StudentProfile for identifier; storing local draft profile instead:', error);
    return upsertLocalDraftProfile({
      ...draftProfile,
      id: `local_${normalized}`,
    });
  }
}

export async function getLatestCheckInByStudentId(studentId) {
  const checkIns = await listStudentCheckInsByStudentId(studentId);
  return checkIns[0] || null;
}

export async function listStudentCheckInsByStudentId(studentId) {
  if (!studentId) return [];

  const localCheckIns = listLocalStudentCheckIns(studentId);

  try {
    const checkIns = await backendClient.entities.StudentCheckIn.list('-created_at', 200);
    return mergeUniqueBy([
      ...checkIns
        .filter((checkIn) => checkIn.student_id === studentId)
        .map((checkIn) => normalizeCheckIn(checkIn, BACKEND_SOURCE)),
      ...localCheckIns,
    ], (item) => item.id || `${item.student_id}-${item.survey_type || 'weekly'}-${item.week}-${item.created_at || ''}`)
      .sort((a, b) => Date.parse(b.created_at || b.week || 0) - Date.parse(a.created_at || a.week || 0));
  } catch (error) {
    console.warn('Unable to load student check-ins from backend:', error);
    return localCheckIns;
  }
}

export async function listTeacherActionsByStudentId(studentId) {
  if (!studentId) return [];

  const localActions = listLocalTeacherActions(studentId);

  try {
    const actions = await backendClient.entities.TeacherAction.list('-created_at', 200);
    return mergeUniqueBy([
      ...actions
        .filter((action) => action.student_id === studentId)
        .map((action) => normalizeTeacherAction(action, BACKEND_SOURCE)),
      ...localActions,
    ], (item) => item.id || `${item.student_id}-${item.action_type}-${item.created_at || ''}`)
      .sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0));
  } catch (error) {
    console.warn('Unable to load teacher actions from backend:', error);
    return localActions;
  }
}

function deriveNextActionStatus(currentStatus, nextRiskLevel, computedScore) {
  if (currentStatus === 'referred') return 'referred';
  if (currentStatus === 'check_in_scheduled') return 'check_in_scheduled';
  if (currentStatus === 'check_in_completed' && nextRiskLevel === 'low') return 'check_in_completed';
  if (computedScore >= MONITOR_THRESHOLD) return 'monitoring';
  return 'none';
}

export async function submitStudentCheckIn({ studentId, answers, freeText, week, surveyType }) {
  const weeklyAnswers = answers?.weeklyAnswers || answers || {};
  const submittedMonthly = answers?.monthlyAnswers || {};
  const submittedBaseline = answers?.baselineResponses || {};
  const weekValue = week || new Date().toISOString().split('T')[0];
  let current = null;

  try {
    current = await backendClient.entities.StudentProfile.get(studentId);
  } catch (error) {
    console.warn('Unable to load current StudentProfile before submission:', error);
    current = buildFallbackStudents().find((student) => student.id === studentId) || null;
  }

  if (current?.survey_status && current.survey_status !== 'open') {
    throw new Error('This survey is not open yet. Please wait for your teacher to open it.');
  }

  const mergedBaseline = buildBaselineResponses({
    age: submittedBaseline.age ?? current?.baseline_responses?.age ?? current?.age ?? '',
    sex: submittedBaseline.sex ?? current?.baseline_responses?.sex ?? '',
    fasholidays: submittedBaseline.fasholidays ?? current?.baseline_responses?.fasholidays ?? '',
    bodyweight: submittedBaseline.bodyweight ?? current?.baseline_responses?.bodyweight ?? '',
    bodyheight: submittedBaseline.bodyheight ?? current?.baseline_responses?.bodyheight ?? '',
    ...current?.baseline_responses,
    ...submittedBaseline,
  });
  const nextSurveyType = surveyType || current?.survey_type || 'weekly';
  const mergedMonthly = buildMonthlyResponses({
    ...current?.monthly_responses,
    ...submittedMonthly,
  });
  const scoringContext = {
    ...mergedBaseline,
    ...mergedMonthly,
  };
  const submittedRecurringAnswers = {
    ...weeklyAnswers,
    ...(nextSurveyType === 'monthly' ? submittedMonthly : {}),
  };

  const computedScore = computeCheckInScore(weeklyAnswers, scoringContext);
  const signalContext = {
    ...mergedMonthly,
    ...submittedRecurringAnswers,
  };
  const signals = deriveSignalsFromCheckInAnswers(signalContext);
  const key_factors = buildKeyFactorsFromCheckInAnswers(signalContext);
  const legacyFields = buildLegacyCheckInFields(weeklyAnswers);
  let persistedCheckIn = true;
  const localCheckInRecord = {
    id: `local_checkin_${studentId}_${Date.now()}`,
    student_id: studentId,
    week: weekValue,
    survey_type: nextSurveyType,
    ...legacyFields,
    responses: submittedRecurringAnswers,
    baseline_responses: mergedBaseline,
    monthly_responses: mergedMonthly,
    top_factors: key_factors,
    free_text: freeText,
    computed_score: computedScore,
    created_at: new Date().toISOString(),
  };

  try {
    await backendClient.entities.StudentCheckIn.create({
      student_id: studentId,
      week: weekValue,
      survey_type: nextSurveyType,
      ...legacyFields,
      responses: submittedRecurringAnswers,
      baseline_responses: mergedBaseline,
      monthly_responses: mergedMonthly,
      top_factors: key_factors,
      free_text: freeText,
      computed_score: computedScore,
    });
  } catch (error) {
    try {
      await backendClient.entities.StudentCheckIn.create({
        student_id: studentId,
        week: weekValue,
        survey_type: nextSurveyType,
        ...legacyFields,
        free_text: freeText,
        computed_score: computedScore,
      });
    } catch (legacyError) {
      persistedCheckIn = false;
      console.warn('StudentCheckIn create failed; continuing with StudentProfile sync only:', legacyError);
    }
  }

  if (!persistedCheckIn) {
    appendLocalStudentCheckIn(localCheckInRecord);
  }

  try {
    const profile = current || await backendClient.entities.StudentProfile.get(studentId);
    const snapshot = buildWeeklyScoreSnapshot(weeklyAnswers, weekValue, scoringContext);
    const existingScores = sortWeeklyScores(profile.weekly_scores || []).filter((entry) => entry.week !== weekValue);
    const weekly_scores = sortWeeklyScores([...existingScores, snapshot]);
    const risk_level = deriveRiskLevel(computedScore);
    const trend = deriveTrendFromScores(weekly_scores);
    const confidence = deriveConfidenceFromScores(weekly_scores, signals);
    const action_status = deriveNextActionStatus(profile.action_status, risk_level, computedScore);
    const onboarding_completed = hasCompletedOnboarding(mergedBaseline);
    const onboarding_completed_at = onboarding_completed
      ? (profile.onboarding_completed_at || new Date().toISOString())
      : null;
    const monthly_completed_at = nextSurveyType === 'monthly'
      ? new Date().toISOString()
      : (profile.monthly_completed_at || null);
    const age = Number(mergedBaseline.age || profile.age || 0);
    const fullUpdate = {
      age,
      baseline_responses: mergedBaseline,
      monthly_responses: mergedMonthly,
      onboarding_completed,
      onboarding_completed_at,
      monthly_completed_at,
      survey_status: 'closed',
      survey_type: 'weekly',
      risk_score: computedScore,
      risk_level,
      trend,
      confidence,
      key_factors,
      weekly_scores,
      action_status,
      next_follow_up_at: profile.next_follow_up_at || null,
      next_follow_up_note: profile.next_follow_up_note || '',
    };

    if (profile.source === FALLBACK_SOURCE || String(studentId).startsWith('local_')) {
      return {
        computedScore,
        answers: submittedRecurringAnswers,
        baseline_responses: mergedBaseline,
        monthly_responses: mergedMonthly,
        persistedCheckIn,
        student: upsertLocalDraftProfile({
          ...profile,
          ...fullUpdate,
        }),
      };
    }

    try {
      await backendClient.entities.StudentProfile.update(studentId, fullUpdate);
    } catch (error) {
      await backendClient.entities.StudentProfile.update(studentId, {
        age,
        risk_score: computedScore,
        risk_level,
        trend,
        confidence,
        key_factors,
        weekly_scores,
        action_status,
        survey_status: 'closed',
        survey_type: 'weekly',
      });
    }

    return {
      computedScore,
      answers: submittedRecurringAnswers,
      baseline_responses: mergedBaseline,
      monthly_responses: mergedMonthly,
      persistedCheckIn,
      student: normalizeStudentProfile({
        ...profile,
        age,
        baseline_responses: mergedBaseline,
        monthly_responses: mergedMonthly,
        onboarding_completed,
        onboarding_completed_at,
        monthly_completed_at,
        survey_status: 'closed',
        survey_type: 'weekly',
        risk_score: computedScore,
        risk_level,
        trend,
        confidence,
        key_factors,
        weekly_scores,
        action_status,
      }, BACKEND_SOURCE),
    };
  } catch (error) {
    console.warn('Check-in saved but StudentProfile sync failed:', error);
    if (current && (current.source === FALLBACK_SOURCE || String(studentId).startsWith('local_'))) {
      const snapshot = buildWeeklyScoreSnapshot(weeklyAnswers, weekValue, scoringContext);
      const existingScores = sortWeeklyScores(current.weekly_scores || []).filter((entry) => entry.week !== weekValue);
      const weekly_scores = sortWeeklyScores([...existingScores, snapshot]);
      const computedFallbackStudent = upsertLocalDraftProfile({
        ...current,
        age: Number(mergedBaseline.age || current.age || 0),
        baseline_responses: mergedBaseline,
        monthly_responses: mergedMonthly,
        onboarding_completed: hasCompletedOnboarding(mergedBaseline),
        onboarding_completed_at: current.onboarding_completed_at || new Date().toISOString(),
        survey_status: 'closed',
        survey_type: 'weekly',
        monthly_completed_at: nextSurveyType === 'monthly'
          ? new Date().toISOString()
          : (current.monthly_completed_at || null),
        risk_score: computedScore,
        risk_level: deriveRiskLevel(computedScore),
        trend: deriveTrendFromScores(weekly_scores),
        confidence: deriveConfidenceFromScores(weekly_scores, signals),
        key_factors,
        weekly_scores,
        action_status: deriveNextActionStatus(current.action_status, deriveRiskLevel(computedScore), computedScore),
      });

      return {
        computedScore,
        answers: submittedRecurringAnswers,
        baseline_responses: mergedBaseline,
        monthly_responses: mergedMonthly,
        persistedCheckIn,
        student: computedFallbackStudent,
      };
    }

    return {
      computedScore,
      answers: submittedRecurringAnswers,
      baseline_responses: mergedBaseline,
      monthly_responses: mergedMonthly,
      persistedCheckIn,
      student: null,
    };
  }
}

export async function openSurveyForStudent({
  studentId,
  surveyType = 'weekly',
  teacherEmail = 'wellbeing@school.edu',
  notes,
}) {
  const openedAt = new Date().toISOString();

  try {
    const current = await getStudentById(studentId);
    if (!current) return null;

    const update = {
      survey_status: 'open',
      survey_type: surveyType === 'monthly' ? 'monthly' : 'weekly',
      survey_opened_at: openedAt,
      survey_opened_by: teacherEmail,
    };

    let updatedStudent = null;

    if (current.source === FALLBACK_SOURCE || String(studentId).startsWith('local_')) {
      updatedStudent = upsertLocalDraftProfile({
        ...current,
        ...update,
      });
    } else {
      try {
        const updated = await backendClient.entities.StudentProfile.update(studentId, update);
        updatedStudent = normalizeStudentProfile(updated, BACKEND_SOURCE);
      } catch (error) {
        const updated = await backendClient.entities.StudentProfile.update(studentId, {
          survey_status: 'open',
          survey_opened_at: openedAt,
          survey_opened_by: teacherEmail,
        });
        updatedStudent = normalizeStudentProfile({
          ...updated,
          survey_type: update.survey_type,
        }, BACKEND_SOURCE);
      }
    }

    await logTeacherAction({
      studentId,
      actionType: 'open_survey',
      notes: notes || `${surveyType === 'monthly' ? 'Monthly refresh' : 'Weekly pulse'} opened for the next student submission.`,
      outcome: 'pending',
      completed: true,
      teacherEmail,
    });

    return updatedStudent;
  } catch (error) {
    console.warn('Unable to open survey for student:', error);
    throw error;
  }
}

export async function logTeacherAction({
  studentId,
  actionType,
  notes,
  outcome = 'pending',
  completed = false,
  referralSummary = undefined,
  followUpDueAt = null,
  generatedParentMessage = '',
  escalationPayload = null,
  teacherEmail,
}) {
  const currentStudent = await getStudentById(studentId);
  let action = null;
  const localActionRecord = {
    id: `local_${actionType}_${Date.now()}`,
    student_id: studentId,
    action_type: actionType,
    notes,
    outcome,
    completed,
    referral_summary: referralSummary,
    follow_up_due_at: followUpDueAt,
    generated_parent_message: generatedParentMessage,
    escalation_payload: escalationPayload,
    teacher_email: teacherEmail,
    created_at: new Date().toISOString(),
  };

  try {
    action = await backendClient.entities.TeacherAction.create({
      student_id: studentId,
      action_type: actionType,
      notes,
      outcome,
      completed,
      referral_summary: referralSummary,
      follow_up_due_at: followUpDueAt,
      generated_parent_message: generatedParentMessage,
      escalation_payload: escalationPayload,
      teacher_email: teacherEmail,
    });
  } catch (error) {
    console.warn('TeacherAction create failed; returning non-persisted result:', error);
    const localAction = appendLocalTeacherAction(localActionRecord);
    if (currentStudent) {
      const nextStatus =
        actionType === 'open_survey' ? currentStudent.action_status
          : actionType === 'refer_counsellor' ? 'referred'
            : actionType === 'check_in' ? (completed ? 'check_in_completed' : 'check_in_scheduled')
              : actionType === 'monitor' ? 'monitoring'
                : currentStudent.action_status;
      upsertLocalDraftProfile({
        ...currentStudent,
        action_status: nextStatus,
        next_follow_up_at: followUpDueAt || currentStudent.next_follow_up_at || null,
        next_follow_up_note: notes || currentStudent.next_follow_up_note || '',
      });
    }
    return localAction;
  }

  try {
    const student = currentStudent || await backendClient.entities.StudentProfile.get(studentId);
    const nextStatus =
      actionType === 'open_survey' ? student.action_status
        :
      actionType === 'refer_counsellor' ? 'referred'
        : actionType === 'check_in' ? (completed ? 'check_in_completed' : 'check_in_scheduled')
          : actionType === 'monitor' ? 'monitoring'
            : student.action_status;

    const profileUpdate = {
      action_status: nextStatus,
      next_follow_up_at: followUpDueAt || student.next_follow_up_at || null,
      next_follow_up_note: notes || student.next_follow_up_note || '',
    };

    if (student.source === FALLBACK_SOURCE || String(studentId).startsWith('local_')) {
      upsertLocalDraftProfile({
        ...student,
        ...profileUpdate,
      });
    } else {
      await backendClient.entities.StudentProfile.update(studentId, profileUpdate);
    }
  } catch (error) {
    console.warn('Teacher action saved but StudentProfile status sync failed:', error);
  }

  return action;
}
