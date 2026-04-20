import { backendClient } from '@/api/backendClient';
import { seedStudentProfiles, studentScenarioByName } from '@/data/seed/studentProfiles';
import { appParams } from '@/lib/app-params';
import { normalizeStudentIdentifier } from '@/lib/studentSession';
import { buildEscalationPayload, buildParentMessage } from '@/lib/wellbeingContent';
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
  getFeatureRiskContribution,
  getSignalDirection,
  hasCompletedOnboarding,
  MONITOR_THRESHOLD,
  monthlyQuestions,
  oneTimeQuestions,
  scoreToSeverityFromRisk,
} from '@/lib/rfModel';

const FALLBACK_SOURCE = 'fallback';
const BACKEND_SOURCE = 'backend';
const LOCAL_PROFILE_STORAGE_KEY = 'mindbridge_local_student_profiles';
const LOCAL_CHECKIN_STORAGE_KEY = 'mindbridge_local_student_checkins';
const LOCAL_TEACHER_ACTION_STORAGE_KEY = 'mindbridge_local_teacher_actions';
const LOCAL_COUNSELLOR_CASE_STORAGE_KEY = 'mindbridge_local_counsellor_cases';
const LOCAL_PARENT_COMM_STORAGE_KEY = 'mindbridge_local_parent_communications';
const INFERENCE_API_URL = 'http://localhost:8000/predict';
const REMOTE_BACKEND_ENABLED = Boolean(appParams.appId && appParams.appId !== 'your_app_id');

async function callInferenceAPI(features) {
  try {
    const response = await fetch(INFERENCE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features),
    });
    if (!response.ok) throw new Error(`Inference API returned ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('Inference API unavailable, falling back to local scoring:', err.message);
    return null;
  }
}

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

function normalizeInferenceFeatureName(featureName) {
  if (featureName === 'talkfather') return 'grp_talk_father';
  if (featureName === 'talkmother') return 'grp_talk_mother';
  return featureName;
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

function normalizeStoredAnswerKeys(answers = {}) {
  const normalized = { ...answers };

  if (normalized.talkfather !== undefined && normalized.grp_talk_father === undefined) {
    normalized.grp_talk_father = normalized.talkfather;
  }

  if (normalized.talkmother !== undefined && normalized.grp_talk_mother === undefined) {
    normalized.grp_talk_mother = normalized.talkmother;
  }

  return normalized;
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
  const age = Number(student.age || baseline_responses.age || 0);

  return {
    ...safeStudent,
    source,
    age,
    risk_score: Number(student.risk_score || 0),
    confidence: Number(student.confidence || 72),
    student_identifier: normalizeStudentIdentifier(student.student_identifier || ''),
    key_factors: (student.key_factors || []).map(enrichKeyFactor),
    weekly_scores,
    baseline_responses,
    consent_completed: Boolean(student.consent_completed ?? student.onboarding_completed ?? hasCompletedOnboarding(baseline_responses)),
    consent_completed_at: student.consent_completed_at || student.onboarding_completed_at || null,
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

function mergeStudentsByIdentifier(primaryStudents = [], overrideStudents = []) {
  const overrideByIdentifier = new Map(
    overrideStudents
      .map((student) => [normalizeStudentIdentifier(student.student_identifier || ''), student])
      .filter(([identifier]) => Boolean(identifier)),
  );

  const mergedPrimary = primaryStudents.map((student) => {
    const identifier = normalizeStudentIdentifier(student.student_identifier || '');
    return overrideByIdentifier.get(identifier) || student;
  });

  const primaryIdentifiers = new Set(
    primaryStudents.map((student) => normalizeStudentIdentifier(student.student_identifier || '')),
  );

  const overrideOnly = overrideStudents.filter((student) => {
    const identifier = normalizeStudentIdentifier(student.student_identifier || '');
    return !identifier || !primaryIdentifiers.has(identifier);
  });

  return [...mergedPrimary, ...overrideOnly];
}

function buildFallbackStudents() {
  return mergeStudentsByIdentifier(
    buildSeedFallbackStudents(),
    buildLocalDraftStudents(),
  );
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

function normalizeCounsellorCase(record = {}, source = BACKEND_SOURCE) {
  return {
    ...record,
    source,
    status: record.status || 'pending_review',
    payload: record.payload || null,
    parent_message: record.parent_message || '',
    created_at: record.created_at || record.updated_at || new Date().toISOString(),
  };
}

function normalizeParentCommunication(record = {}, source = BACKEND_SOURCE) {
  return {
    ...record,
    source,
    status: record.status || 'draft',
    subject: record.subject || 'Wellbeing support update',
    message: record.message || '',
    linked_case_id: record.linked_case_id || null,
    scheduled_for: record.scheduled_for || null,
    sent_at: record.sent_at || null,
    created_at: record.created_at || record.updated_at || new Date().toISOString(),
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

function deleteLocalTeacherAction(actionId) {
  const actions = readLocalCollection(LOCAL_TEACHER_ACTION_STORAGE_KEY);
  const nextActions = actions.filter((action) => action.id !== actionId);
  writeLocalCollection(LOCAL_TEACHER_ACTION_STORAGE_KEY, nextActions);
  return true;
}

function listLocalCounsellorCases() {
  return readLocalCollection(LOCAL_COUNSELLOR_CASE_STORAGE_KEY)
    .map((record) => normalizeCounsellorCase(record, FALLBACK_SOURCE));
}

function appendLocalCounsellorCase(record) {
  const cases = readLocalCollection(LOCAL_COUNSELLOR_CASE_STORAGE_KEY);
  cases.push(record);
  writeLocalCollection(LOCAL_COUNSELLOR_CASE_STORAGE_KEY, cases);
  return normalizeCounsellorCase(record, FALLBACK_SOURCE);
}

function upsertLocalCounsellorCase(record) {
  const cases = readLocalCollection(LOCAL_COUNSELLOR_CASE_STORAGE_KEY);
  const nextCases = cases.filter((item) => item.id !== record.id);
  nextCases.push(record);
  writeLocalCollection(LOCAL_COUNSELLOR_CASE_STORAGE_KEY, nextCases);
  return normalizeCounsellorCase(record, FALLBACK_SOURCE);
}

function listLocalParentCommunications() {
  return readLocalCollection(LOCAL_PARENT_COMM_STORAGE_KEY)
    .map((record) => normalizeParentCommunication(record, FALLBACK_SOURCE));
}

function appendLocalParentCommunication(record) {
  const messages = readLocalCollection(LOCAL_PARENT_COMM_STORAGE_KEY);
  messages.push(record);
  writeLocalCollection(LOCAL_PARENT_COMM_STORAGE_KEY, messages);
  return normalizeParentCommunication(record, FALLBACK_SOURCE);
}

function upsertLocalParentCommunication(record) {
  const messages = readLocalCollection(LOCAL_PARENT_COMM_STORAGE_KEY);
  const nextMessages = messages.filter((item) => item.id !== record.id);
  nextMessages.push(record);
  writeLocalCollection(LOCAL_PARENT_COMM_STORAGE_KEY, nextMessages);
  return normalizeParentCommunication(record, FALLBACK_SOURCE);
}

function listLocalStudentCheckIns(studentId) {
  return readLocalCollection(LOCAL_CHECKIN_STORAGE_KEY)
    .filter((checkIn) => checkIn.student_id === studentId)
    .map((checkIn) => normalizeCheckIn(checkIn, FALLBACK_SOURCE))
    .sort((a, b) => Date.parse(b.created_at || b.week || 0) - Date.parse(a.created_at || a.week || 0));
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
  let answers = {};

  if (checkIn.responses && typeof checkIn.responses === 'object') {
    answers = checkIn.responses;
  } else {
    answers = Object.fromEntries(
      Object.entries(checkIn).filter(([key]) => key.startsWith('q_')),
    );
  }

  return normalizeStoredAnswerKeys(answers);
}

function normalizeCheckIn(checkIn, source = BACKEND_SOURCE) {
  const monthly_responses = buildMonthlyResponses(checkIn.monthly_responses || {});

  return {
    ...checkIn,
    source,
    survey_type: checkIn.survey_type === 'monthly' ? 'monthly' : 'weekly',
    answers: {
      ...monthly_responses,
      ...extractCheckInAnswers(checkIn),
    },
    baseline_responses: checkIn.baseline_responses || null,
    monthly_responses,
  };
}

let seedAttempted = false;

async function ensureStudentProfilesSeeded() {
  if (!REMOTE_BACKEND_ENABLED) return;
  if (seedAttempted) return;
  seedAttempted = true;

  const existing = await backendClient.entities.StudentProfile.list('-created_at', 50);
  if (existing.length > 0) return;

  for (const student of seedStudentProfiles) {
    await backendClient.entities.StudentProfile.create(student);
  }
}

export async function listStudents() {
  if (!REMOTE_BACKEND_ENABLED) {
    return mergeStudentsByIdentifier(
      buildFallbackStudents(),
      buildLocalDraftStudents(),
    );
  }

  try {
    await ensureStudentProfilesSeeded();
    const students = await backendClient.entities.StudentProfile.list('-created_at', 100);
    if (students.length === 0) {
      return buildFallbackStudents();
    }
    return mergeStudentsByIdentifier(
      students.map((student) => normalizeStudentProfile(student, BACKEND_SOURCE)),
      buildLocalDraftStudents(),
    );
  } catch (error) {
    console.warn('Falling back to local student seed data:', error);
    return buildFallbackStudents();
  }
}

export async function getStudentById(studentId) {
  if (!REMOTE_BACKEND_ENABLED) {
    const fallback = buildLocalDraftStudents().find((student) => student.id === studentId)
      || buildFallbackStudents().find((student) => student.id === studentId);
    if (fallback) return fallback;

    const students = await listStudents();
    return students.find((student) => student.id === studentId) || null;
  }

  try {
    const student = normalizeStudentProfile(await backendClient.entities.StudentProfile.get(studentId), BACKEND_SOURCE);
    const localOverride = buildLocalDraftStudents().find((item) => (
      item.id === student.id
      || normalizeStudentIdentifier(item.student_identifier || '') === normalizeStudentIdentifier(student.student_identifier || '')
    ));
    return localOverride || student;
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

function normalizeTeacherEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function filterStudentsForTeacher(students = [], teacherEmail, allowAll = false) {
  if (allowAll) return students;
  const normalizedTeacherEmail = normalizeTeacherEmail(teacherEmail);
  if (!normalizedTeacherEmail) return [];
  return students.filter((student) => normalizeTeacherEmail(student.assigned_teacher) === normalizedTeacherEmail);
}

export async function listStudentsForTeacher({ teacherEmail, allowAll = false } = {}) {
  const students = await listStudents();
  return filterStudentsForTeacher(students, teacherEmail, allowAll);
}

export async function getStudentByIdForTeacher({ studentId, teacherEmail, allowAll = false } = {}) {
  const student = await getStudentById(studentId);
  if (!student) return null;
  if (allowAll) return student;
  if (normalizeTeacherEmail(student.assigned_teacher) !== normalizeTeacherEmail(teacherEmail)) {
    throw new Error('You do not have access to this student profile.');
  }
  return student;
}

async function findStoredStudentRecordByIdentifier(identifier) {
  const normalized = normalizeStudentIdentifier(identifier);
  if (!normalized) return null;

  if (REMOTE_BACKEND_ENABLED) {
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
    consent_completed: false,
    consent_completed_at: null,
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

  if (!REMOTE_BACKEND_ENABLED) {
    return upsertLocalDraftProfile({
      ...draftProfile,
      id: `local_${normalized}`,
    });
  }

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

export async function recordStudentConsent(studentId) {
  const student = await getStudentById(studentId);
  if (!student) return null;

  const update = {
    consent_completed: true,
    consent_completed_at: new Date().toISOString(),
  };

  if (student.source === FALLBACK_SOURCE || String(studentId).startsWith('local_')) {
    return upsertLocalDraftProfile({
      ...student,
      ...update,
    });
  }

  if (!REMOTE_BACKEND_ENABLED) {
    return upsertLocalDraftProfile({
      ...student,
      ...update,
    });
  }

  try {
    const updated = await backendClient.entities.StudentProfile.update(studentId, update);
    return normalizeStudentProfile(updated, BACKEND_SOURCE);
  } catch (error) {
    console.warn('Unable to persist student consent in backend:', error);
    return upsertLocalDraftProfile({
      ...student,
      ...update,
    });
  }
}

export async function listStudentCheckInsByStudentId(studentId) {
  if (!studentId) return [];

  const localCheckIns = listLocalStudentCheckIns(studentId);
  if (!REMOTE_BACKEND_ENABLED) return localCheckIns;

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
  if (!REMOTE_BACKEND_ENABLED) return localActions;

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

export async function listTeacherActionsForTeacher({ teacherEmail, allowAll = false } = {}) {
  const students = await listStudentsForTeacher({ teacherEmail, allowAll });
  const actionLists = await Promise.all(
    students.map((student) => listTeacherActionsByStudentId(student.id)),
  );

  return mergeUniqueBy(
    actionLists.flat(),
    (item) => item.id || `${item.student_id}-${item.action_type}-${item.created_at || ''}`,
  ).sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0));
}

export async function listFollowUpQueue({ teacherEmail, allowAll = false } = {}) {
  const students = await listStudentsForTeacher({ teacherEmail, allowAll });

  return students
    .filter((student) => Boolean(student.next_follow_up_at))
    .map((student) => ({
      id: student.id,
      student_id: student.id,
      student_name: student.name,
      teacher_email: student.assigned_teacher,
      reminder_type: student.risk_level === 'high' ? 'Flagged review' : 'Monitor review',
      due_at: student.next_follow_up_at,
      note: student.next_follow_up_note || 'Review wellbeing pattern',
      risk_level: student.risk_level,
      risk_score: student.risk_score,
      trend: student.trend,
      main_signal: student.key_factors[0]?.factor || 'No dominant signal',
      overdue: Date.parse(student.next_follow_up_at) <= Date.now(),
    }))
    .sort((a, b) => Date.parse(a.due_at || 0) - Date.parse(b.due_at || 0));
}

export async function listCounsellorCases({ teacherEmail, allowAll = false } = {}) {
  const localCases = listLocalCounsellorCases();
  const scopedCases = (cases = []) => (
    allowAll
      ? cases
      : cases.filter((record) => normalizeTeacherEmail(record.teacher_email) === normalizeTeacherEmail(teacherEmail))
  );

  if (!REMOTE_BACKEND_ENABLED) {
    return scopedCases(localCases)
      .sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0));
  }

  try {
    const records = await backendClient.entities.CounsellorCase.list('-created_at', 200);
    return mergeUniqueBy([
      ...scopedCases(records).map((record) => normalizeCounsellorCase(record, BACKEND_SOURCE)),
      ...scopedCases(localCases),
    ], (item) => item.id || `${item.student_id}-${item.teacher_email}-${item.created_at || ''}`)
      .sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0));
  } catch (error) {
    console.warn('Unable to load counsellor cases from backend:', error);
    return scopedCases(localCases)
      .sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0));
  }
}

export async function listParentCommunications({ teacherEmail, allowAll = false } = {}) {
  const localMessages = listLocalParentCommunications();
  const scopedMessages = (records = []) => (
    allowAll
      ? records
      : records.filter((record) => normalizeTeacherEmail(record.teacher_email) === normalizeTeacherEmail(teacherEmail))
  );

  if (!REMOTE_BACKEND_ENABLED) {
    return scopedMessages(localMessages)
      .sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0));
  }

  try {
    const records = await backendClient.entities.ParentCommunication.list('-created_at', 200);
    return mergeUniqueBy([
      ...scopedMessages(records).map((record) => normalizeParentCommunication(record, BACKEND_SOURCE)),
      ...scopedMessages(localMessages),
    ], (item) => item.id || `${item.student_id}-${item.teacher_email}-${item.created_at || ''}`)
      .sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0));
  } catch (error) {
    console.warn('Unable to load parent communications from backend:', error);
    return scopedMessages(localMessages)
      .sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0));
  }
}

function deriveNextActionStatus(currentStatus, nextRiskLevel, computedScore) {
  if (currentStatus === 'referred') return 'referred';
  if (currentStatus === 'check_in_scheduled') return 'check_in_scheduled';
  if (currentStatus === 'check_in_completed' && nextRiskLevel === 'low') return 'check_in_completed';
  if (computedScore >= MONITOR_THRESHOLD) return 'monitoring';
  return 'none';
}

function deriveTeacherActionStatus(currentStatus, actionType, completed) {
  if (actionType === 'open_survey') return currentStatus;
  if (actionType === 'refer_counsellor') return 'referred';
  if (actionType === 'check_in') {
    return completed ? 'check_in_completed' : 'check_in_scheduled';
  }
  if (actionType === 'monitor') {
    if (currentStatus === 'check_in_completed' || currentStatus === 'check_in_scheduled') {
      return currentStatus;
    }
    return 'monitoring';
  }
  return currentStatus;
}

export async function submitStudentCheckIn({ studentId, answers, freeText, week, surveyType }) {
  const weeklyAnswers = answers?.weeklyAnswers || answers || {};
  const submittedMonthly = answers?.monthlyAnswers || {};
  const submittedBaseline = answers?.baselineResponses || {};
  const weekValue = week || new Date().toISOString().split('T')[0];
  let current = null;

  if (REMOTE_BACKEND_ENABLED) {
    try {
      current = await backendClient.entities.StudentProfile.get(studentId);
    } catch (error) {
      console.warn('Unable to load current StudentProfile before submission:', error);
      current = buildFallbackStudents().find((student) => student.id === studentId) || null;
    }
  } else {
    current = await getStudentById(studentId);
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
    year_group: submittedBaseline.year_group ?? current?.baseline_responses?.year_group ?? '',
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

  const featureInputs = {
    ...scoringContext,
    ...submittedRecurringAnswers,
    talkfather: scoringContext.grp_talk_father ?? scoringContext.talkfather ?? submittedRecurringAnswers.grp_talk_father ?? null,
    talkmother: scoringContext.grp_talk_mother ?? scoringContext.talkmother ?? submittedRecurringAnswers.grp_talk_mother ?? null,
  };
  const inferenceResult = await callInferenceAPI(featureInputs);
  const computedScore = inferenceResult
    ? inferenceResult.risk_score
    : computeCheckInScore(weeklyAnswers, scoringContext);
  const modelRiskLevel = inferenceResult ? inferenceResult.pred_class : null;
  const modelSHAPDrivers = inferenceResult ? (inferenceResult.shap_drivers || []) : [];
  const signalContext = {
    ...mergedMonthly,
    ...submittedRecurringAnswers,
  };
  const signals = deriveSignalsFromCheckInAnswers(signalContext);
  let key_factors = buildKeyFactorsFromCheckInAnswers(signalContext);

  if (modelSHAPDrivers.length > 0) {
    const shapFactors = modelSHAPDrivers
      .map((featureName) => {
        const normalizedFeatureName = normalizeInferenceFeatureName(featureName);
        const feature = getFeatureById(normalizedFeatureName);
        if (!feature) return null;
        const risk = getFeatureRiskContribution(
          feature,
          signalContext[normalizedFeatureName] ?? signalContext[featureName],
        );
        return {
          feature: normalizedFeatureName,
          factor: feature.label,
          category: feature.category,
          direction: getSignalDirection(feature),
          severity: risk !== null ? scoreToSeverityFromRisk(risk) : 'medium',
          source: 'shap',
        };
      })
      .filter(Boolean);

    const HIGH_STAKES_FEATURES = [
      'grp_been_bullied',
      'sleepdificulty',
      'schoolpressure',
      'grp_fam_sup',
      'grp_aches',
    ];
    const shapFeatureSet = new Set(shapFactors.map((f) => f.feature));
    const urgentFactors = HIGH_STAKES_FEATURES
      .filter((featureId) => !shapFeatureSet.has(featureId))
      .map((featureId) => {
        const feature = getFeatureById(featureId);
        if (!feature) return null;
        const risk = getFeatureRiskContribution(feature, signalContext[featureId]);
        if (risk === null || risk < 0.75) return null;
        return {
          feature: featureId,
          factor: feature.label,
          category: feature.category,
          direction: getSignalDirection(feature),
          severity: scoreToSeverityFromRisk(risk),
          source: 'safety_flag',
        };
      })
      .filter(Boolean);

    const merged = [...urgentFactors, ...shapFactors].slice(0, 3);
    if (merged.length > 0) key_factors = merged;
  }
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

  if (REMOTE_BACKEND_ENABLED) {
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
  } else {
    persistedCheckIn = false;
  }

  if (!persistedCheckIn) {
    appendLocalStudentCheckIn(localCheckInRecord);
  }

  try {
    const profile = current || await backendClient.entities.StudentProfile.get(studentId);
    const snapshot = {
      ...buildWeeklyScoreSnapshot(weeklyAnswers, weekValue, scoringContext),
      score: computedScore,
    };
    const existingScores = sortWeeklyScores(profile.weekly_scores || []).filter((entry) => entry.week !== weekValue);
    const weekly_scores = sortWeeklyScores([...existingScores, snapshot]);
    const risk_level = modelRiskLevel || deriveRiskLevel(computedScore);
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
    const gradeOptions = {
      sec1: 'Secondary 1', sec2: 'Secondary 2', sec3: 'Secondary 3',
      sec4: 'Secondary 4', sec5: 'Secondary 5',
    };
    const grade = gradeOptions[mergedBaseline.year_group] || profile.grade || 'Unassigned';
    const age = Number(mergedBaseline.age || profile.age || 0);
    const fullUpdate = {
      grade,
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
      const snapshot = {
        ...buildWeeklyScoreSnapshot(weeklyAnswers, weekValue, scoringContext),
        score: computedScore,
      };
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
        risk_level: modelRiskLevel || deriveRiskLevel(computedScore),
        trend: deriveTrendFromScores(weekly_scores),
        confidence: deriveConfidenceFromScores(weekly_scores, signals),
        key_factors,
        weekly_scores,
        action_status: deriveNextActionStatus(current.action_status, modelRiskLevel || deriveRiskLevel(computedScore), computedScore),
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

export async function openSurveysForStudents({
  studentIds = [],
  surveyType = 'weekly',
  teacherEmail = 'wellbeing@school.edu',
  notes,
}) {
  const uniqueIds = [...new Set((studentIds || []).filter(Boolean))];
  const updatedStudents = [];

  for (const studentId of uniqueIds) {
    const updatedStudent = await openSurveyForStudent({
      studentId,
      surveyType,
      teacherEmail,
      notes,
    });
    if (updatedStudent) {
      updatedStudents.push(updatedStudent);
    }
  }

  return updatedStudents;
}

export async function closeSurveyForStudent({
  studentId,
}) {
  try {
    const current = await getStudentById(studentId);
    if (!current) return null;

    const update = {
      survey_status: 'closed',
      survey_opened_at: null,
      survey_opened_by: null,
    };

    if (current.source === FALLBACK_SOURCE || String(studentId).startsWith('local_')) {
      return upsertLocalDraftProfile({
        ...current,
        ...update,
      });
    }

    const updated = await backendClient.entities.StudentProfile.update(studentId, update);
    return normalizeStudentProfile(updated, BACKEND_SOURCE);
  } catch (error) {
    console.warn('Unable to close survey for student:', error);
    throw error;
  }
}

export async function closeSurveysForStudents({
  studentIds = [],
}) {
  const uniqueIds = [...new Set((studentIds || []).filter(Boolean))];
  const updatedStudents = [];

  for (const studentId of uniqueIds) {
    const updatedStudent = await closeSurveyForStudent({ studentId });
    if (updatedStudent) {
      updatedStudents.push(updatedStudent);
    }
  }

  return updatedStudents;
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
  replaceFollowUp = false,
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

  if (!REMOTE_BACKEND_ENABLED) {
    const localAction = appendLocalTeacherAction(localActionRecord);
    if (currentStudent) {
      const nextStatus = deriveTeacherActionStatus(currentStudent.action_status, actionType, completed);
      upsertLocalDraftProfile({
        ...currentStudent,
        action_status: nextStatus,
        next_follow_up_at: replaceFollowUp ? (followUpDueAt || null) : (followUpDueAt || currentStudent.next_follow_up_at || null),
        next_follow_up_note: replaceFollowUp ? (notes || '') : (notes || currentStudent.next_follow_up_note || ''),
      });
    }
    return localAction;
  }

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
      const nextStatus = deriveTeacherActionStatus(currentStudent.action_status, actionType, completed);
      upsertLocalDraftProfile({
        ...currentStudent,
        action_status: nextStatus,
        next_follow_up_at: replaceFollowUp ? (followUpDueAt || null) : (followUpDueAt || currentStudent.next_follow_up_at || null),
        next_follow_up_note: replaceFollowUp ? (notes || '') : (notes || currentStudent.next_follow_up_note || ''),
      });
    }
    return localAction;
  }

  try {
    const student = currentStudent || await backendClient.entities.StudentProfile.get(studentId);
    const nextStatus = deriveTeacherActionStatus(student.action_status, actionType, completed);

    const profileUpdate = {
      action_status: nextStatus,
      next_follow_up_at: replaceFollowUp ? (followUpDueAt || null) : (followUpDueAt || student.next_follow_up_at || null),
      next_follow_up_note: replaceFollowUp ? (notes || '') : (notes || student.next_follow_up_note || ''),
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
    if (currentStudent) {
      const nextStatus = deriveTeacherActionStatus(currentStudent.action_status, actionType, completed);
      upsertLocalDraftProfile({
        ...currentStudent,
        action_status: nextStatus,
        next_follow_up_at: replaceFollowUp ? (followUpDueAt || null) : (followUpDueAt || currentStudent.next_follow_up_at || null),
        next_follow_up_note: replaceFollowUp ? (notes || '') : (notes || currentStudent.next_follow_up_note || ''),
      });
    }
  }

  return action;
}

export async function deleteTeacherAction({
  actionId,
  source = BACKEND_SOURCE,
}) {
  if (!actionId) {
    throw new Error('Teacher action ID is required.');
  }

  if (source === FALLBACK_SOURCE || String(actionId).startsWith('local_')) {
    return deleteLocalTeacherAction(actionId);
  }

  if (!REMOTE_BACKEND_ENABLED) {
    return deleteLocalTeacherAction(actionId);
  }

  try {
    await backendClient.entities.TeacherAction.delete(actionId);
    return true;
  } catch (error) {
    console.warn('Unable to delete teacher action from backend:', error);
    return deleteLocalTeacherAction(actionId);
  }
}

export async function completeFollowUpReminder({
  studentId,
  teacherEmail,
}) {
  const student = await getStudentById(studentId);
  if (!student) {
    throw new Error('Student profile not found for reminder update.');
  }

  const update = {
    next_follow_up_at: null,
    next_follow_up_note: '',
  };

  if (student.source === FALLBACK_SOURCE || String(studentId).startsWith('local_')) {
    upsertLocalDraftProfile({
      ...student,
      ...update,
    });
  } else {
    await backendClient.entities.StudentProfile.update(studentId, update);
  }

  await logTeacherAction({
    studentId,
    actionType: 'monitor',
    notes: 'Follow-up reminder marked complete.',
    outcome: 'pending',
    completed: true,
    teacherEmail,
    replaceFollowUp: true,
  });

  return true;
}

export async function createParentCommunication({
  studentId,
  teacherEmail,
  message,
  subject = 'Wellbeing support update',
  status = 'ready_to_send',
  linkedCaseId = null,
  scheduledFor = null,
}) {
  const student = await getStudentById(studentId);
  const record = {
    id: `parent_${studentId}_${Date.now()}`,
    student_id: studentId,
    student_name: student?.name || 'Student',
    teacher_email: teacherEmail,
    status,
    subject,
    message,
    linked_case_id: linkedCaseId,
    scheduled_for: scheduledFor,
    sent_at: status === 'sent' ? new Date().toISOString() : null,
  };

  if (!REMOTE_BACKEND_ENABLED) {
    return appendLocalParentCommunication(record);
  }

  try {
    const created = await backendClient.entities.ParentCommunication.create({
      student_id: record.student_id,
      student_name: record.student_name,
      teacher_email: record.teacher_email,
      status: record.status,
      subject: record.subject,
      message: record.message,
      linked_case_id: record.linked_case_id,
      scheduled_for: record.scheduled_for,
      sent_at: record.sent_at,
    });
    return normalizeParentCommunication(created, BACKEND_SOURCE);
  } catch (error) {
    console.warn('Unable to create parent communication in backend:', error);
    return appendLocalParentCommunication(record);
  }
}

export async function updateParentCommunicationStatus({
  communicationId,
  status,
}) {
  const nextStatus = status === 'sent' ? 'sent' : status === 'ready_to_send' ? 'ready_to_send' : 'draft';
  const sentAt = nextStatus === 'sent' ? new Date().toISOString() : null;

  if (!REMOTE_BACKEND_ENABLED) {
    const existing = listLocalParentCommunications().find((record) => record.id === communicationId);
    if (!existing) {
      throw new Error(`Parent communication not found: ${communicationId}`);
    }
    return upsertLocalParentCommunication({
      ...existing,
      status: nextStatus,
      sent_at: sentAt,
    });
  }

  try {
    const updated = await backendClient.entities.ParentCommunication.update(communicationId, {
      status: nextStatus,
      sent_at: sentAt,
    });
    return normalizeParentCommunication(updated, BACKEND_SOURCE);
  } catch (error) {
    const existing = listLocalParentCommunications().find((record) => record.id === communicationId);
    if (!existing) throw error;
    return upsertLocalParentCommunication({
      ...existing,
      status: nextStatus,
      sent_at: sentAt,
    });
  }
}

export async function updateCounsellorCaseStatus({
  caseId,
  status,
}) {
  const nextStatus = ['pending_review', 'acknowledged', 'closed'].includes(status)
    ? status
    : 'pending_review';

  if (!REMOTE_BACKEND_ENABLED) {
    const existing = listLocalCounsellorCases().find((record) => record.id === caseId);
    if (!existing) {
      throw new Error(`Counsellor case not found: ${caseId}`);
    }
    return upsertLocalCounsellorCase({
      ...existing,
      status: nextStatus,
    });
  }

  try {
    const updated = await backendClient.entities.CounsellorCase.update(caseId, {
      status: nextStatus,
    });
    return normalizeCounsellorCase(updated, BACKEND_SOURCE);
  } catch (error) {
    const existing = listLocalCounsellorCases().find((record) => record.id === caseId);
    if (!existing) throw error;
    return upsertLocalCounsellorCase({
      ...existing,
      status: nextStatus,
    });
  }
}

export async function createCounsellorCase({
  studentId,
  teacherEmail,
  additionalNotes = '',
  parentContact = false,
  parentMessage = '',
  createdByRole = 'teacher',
}) {
  const student = await getStudentById(studentId);
  if (!student) {
    throw new Error('Student profile not found for escalation.');
  }

  const [checkIns, actions] = await Promise.all([
    listStudentCheckInsByStudentId(studentId),
    listTeacherActionsByStudentId(studentId),
  ]);
  const latestCheckIn = checkIns[0] || null;

  const payload = {
    ...buildEscalationPayload(student, additionalNotes),
    student_check_ins: checkIns,
    teacher_actions: actions,
  };
  payload.student_note = latestCheckIn?.free_text || '';
  const summary = `${student.name} is being referred for counsellor review. Current score ${student.risk_score}/100, support band ${student.risk_level}, main signals ${student.key_factors.slice(0, 2).map((item) => item.factor).join(' + ') || 'not yet clear'}.`;
  const caseRecord = {
    id: `case_${studentId}_${Date.now()}`,
    student_id: studentId,
    student_name: student.name,
    teacher_email: teacherEmail,
    status: 'pending_review',
    summary,
    payload,
    parent_message: parentContact ? (parentMessage || buildParentMessage(student)) : '',
    created_by_role: createdByRole,
  };

  let counsellorCase = null;

  if (!REMOTE_BACKEND_ENABLED) {
    counsellorCase = appendLocalCounsellorCase(caseRecord);
  } else try {
    const created = await backendClient.entities.CounsellorCase.create({
      student_id: caseRecord.student_id,
      student_name: caseRecord.student_name,
      teacher_email: caseRecord.teacher_email,
      status: caseRecord.status,
      summary: caseRecord.summary,
      payload: caseRecord.payload,
      parent_message: caseRecord.parent_message,
      created_by_role: caseRecord.created_by_role,
    });
    counsellorCase = normalizeCounsellorCase(created, BACKEND_SOURCE);
  } catch (error) {
    console.warn('Unable to create counsellor case in backend:', error);
    counsellorCase = appendLocalCounsellorCase(caseRecord);
  }

  await logTeacherAction({
    studentId,
    actionType: 'refer_counsellor',
    notes: additionalNotes,
    referralSummary: summary,
    escalationPayload: payload,
    completed: true,
    teacherEmail,
  });

  let parentCommunication = null;
  if (parentContact) {
    const message = parentMessage || buildParentMessage(student);
    parentCommunication = await createParentCommunication({
      studentId,
      teacherEmail,
      message,
      linkedCaseId: counsellorCase?.id || null,
      status: 'ready_to_send',
    });
    await logTeacherAction({
      studentId,
      actionType: 'parent_contact',
      notes: 'Parent communication drafted alongside counsellor escalation.',
      generatedParentMessage: message,
      completed: true,
      teacherEmail,
    });
  }

  return {
    counsellorCase,
    parentCommunication,
  };
}
