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
} from '@/lib/rfModel';

const FALLBACK_SOURCE = 'fallback';
const BACKEND_SOURCE = 'backend';
const LOCAL_PROFILE_STORAGE_KEY = 'mindbridge_local_student_profiles';

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
  if (value === 'male') return 1;
  if (value === 'female') return 2;
  return value ?? '';
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
  const scenarioMeta = studentScenarioByName[student.name] || {};
  const weekly_scores = sortWeeklyScores(student.weekly_scores || []);
  const baseline_responses = {
    age: student.baseline_responses?.age ?? student.age ?? '',
    sex: normalizeBaselineSex(student.baseline_responses?.sex ?? ''),
    fasholidays: student.baseline_responses?.fasholidays ?? '',
    bodyweight: student.baseline_responses?.bodyweight ?? '',
    bodyheight: student.baseline_responses?.bodyheight ?? '',
  };

  return {
    ...student,
    source,
    age: Number(student.age || 0),
    risk_score: Number(student.risk_score || 0),
    confidence: Number(student.confidence || 72),
    student_identifier: normalizeStudentIdentifier(student.student_identifier || ''),
    key_factors: (student.key_factors || []).map(enrichKeyFactor),
    weekly_scores,
    baseline_responses,
    onboarding_completed: Boolean(student.onboarding_completed ?? hasCompletedOnboarding(baseline_responses)),
    onboarding_completed_at: student.onboarding_completed_at || null,
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

function buildSeedFallbackStudents() {
  return seedStudentProfiles.map((student, index) => normalizeStudentProfile({
    ...student,
    id: `fallback_${index + 1}`,
  }, FALLBACK_SOURCE));
}

function readLocalDraftProfiles() {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(LOCAL_PROFILE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Unable to read local student profiles:', error);
    return [];
  }
}

function writeLocalDraftProfiles(profiles) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(LOCAL_PROFILE_STORAGE_KEY, JSON.stringify(profiles));
}

function buildLocalDraftStudents() {
  return readLocalDraftProfiles().map((student) => normalizeStudentProfile(student, FALLBACK_SOURCE));
}

function buildFallbackStudents() {
  const merged = [...buildSeedFallbackStudents()];
  const existingIdentifiers = new Set(
    merged.map((student) => normalizeStudentIdentifier(student.student_identifier || '')),
  );

  buildLocalDraftStudents().forEach((student) => {
    const identifier = normalizeStudentIdentifier(student.student_identifier || '');
    if (identifier && existingIdentifiers.has(identifier)) return;
    merged.push(student);
  });

  return merged;
}

function upsertLocalDraftProfile(profile) {
  const normalizedProfile = {
    ...profile,
    source: FALLBACK_SOURCE,
    student_identifier: normalizeStudentIdentifier(profile.student_identifier || ''),
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
    answers: extractCheckInAnswers(checkIn),
    baseline_responses: checkIn.baseline_responses || null,
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

export async function getOrCreateStudentByIdentifier(identifier) {
  const normalized = normalizeStudentIdentifier(identifier);
  if (!normalized) return null;

  const existing = await getStudentByIdentifier(normalized);
  if (existing) return existing;

  const draftProfile = {
    name: deriveStudentNameFromIdentifier(normalized),
    student_identifier: normalized,
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
    onboarding_completed: false,
    onboarding_completed_at: null,
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
  if (!studentId) return null;

  try {
    const checkIns = await backendClient.entities.StudentCheckIn.list('-created_at', 200);
    const latest = checkIns
      .filter((checkIn) => checkIn.student_id === studentId)
      .sort((a, b) => {
        const aTime = Date.parse(a.created_at || a.week || 0);
        const bTime = Date.parse(b.created_at || b.week || 0);
        return bTime - aTime;
      })[0];

    return latest ? normalizeCheckIn(latest, BACKEND_SOURCE) : null;
  } catch (error) {
    console.warn('Unable to load latest student check-in:', error);
    return null;
  }
}

function deriveNextActionStatus(currentStatus, nextRiskLevel, computedScore) {
  if (currentStatus === 'referred') return 'referred';
  if (currentStatus === 'check_in_scheduled') return 'check_in_scheduled';
  if (currentStatus === 'check_in_completed' && nextRiskLevel === 'low') return 'check_in_completed';
  if (computedScore >= 35) return 'monitoring';
  return 'none';
}

export async function submitStudentCheckIn({ studentId, answers, freeText, week }) {
  const weeklyAnswers = answers?.weeklyAnswers || answers || {};
  const submittedBaseline = answers?.baselineResponses || {};
  const weekValue = week || new Date().toISOString().split('T')[0];
  let current = null;

  try {
    current = await backendClient.entities.StudentProfile.get(studentId);
  } catch (error) {
    console.warn('Unable to load current StudentProfile before submission:', error);
    current = buildFallbackStudents().find((student) => student.id === studentId) || null;
  }

  const mergedBaseline = {
    age: submittedBaseline.age ?? current?.baseline_responses?.age ?? current?.age ?? '',
    sex: normalizeBaselineSex(submittedBaseline.sex ?? current?.baseline_responses?.sex ?? ''),
    fasholidays: submittedBaseline.fasholidays ?? current?.baseline_responses?.fasholidays ?? '',
    bodyweight: submittedBaseline.bodyweight ?? current?.baseline_responses?.bodyweight ?? '',
    bodyheight: submittedBaseline.bodyheight ?? current?.baseline_responses?.bodyheight ?? '',
  };

  const computedScore = computeCheckInScore(weeklyAnswers, mergedBaseline);
  const signals = deriveSignalsFromCheckInAnswers(weeklyAnswers);
  const key_factors = buildKeyFactorsFromCheckInAnswers(weeklyAnswers);
  const legacyFields = buildLegacyCheckInFields(weeklyAnswers);
  let persistedCheckIn = true;

  try {
    await backendClient.entities.StudentCheckIn.create({
      student_id: studentId,
      week: weekValue,
      ...legacyFields,
      responses: weeklyAnswers,
      baseline_responses: mergedBaseline,
      top_factors: key_factors,
      free_text: freeText,
      computed_score: computedScore,
    });
  } catch (error) {
    try {
      await backendClient.entities.StudentCheckIn.create({
        student_id: studentId,
        week: weekValue,
        ...legacyFields,
        free_text: freeText,
        computed_score: computedScore,
      });
    } catch (legacyError) {
      persistedCheckIn = false;
      console.warn('StudentCheckIn create failed; continuing with StudentProfile sync only:', legacyError);
    }
  }

  try {
    const profile = current || await backendClient.entities.StudentProfile.get(studentId);
    const snapshot = buildWeeklyScoreSnapshot(weeklyAnswers, weekValue, mergedBaseline);
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
    const age = Number(mergedBaseline.age || profile.age || 0);
    const fullUpdate = {
      age,
      baseline_responses: mergedBaseline,
      onboarding_completed,
      onboarding_completed_at,
      risk_score: computedScore,
      risk_level,
      trend,
      confidence,
      key_factors,
      weekly_scores,
      action_status,
    };

    if (profile.source === FALLBACK_SOURCE || String(studentId).startsWith('local_')) {
      return {
        computedScore,
        answers: weeklyAnswers,
        baseline_responses: mergedBaseline,
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
      });
    }

    return {
      computedScore,
      answers: weeklyAnswers,
      baseline_responses: mergedBaseline,
      persistedCheckIn,
      student: normalizeStudentProfile({
        ...profile,
        age,
        baseline_responses: mergedBaseline,
        onboarding_completed,
        onboarding_completed_at,
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
      const snapshot = buildWeeklyScoreSnapshot(weeklyAnswers, weekValue, mergedBaseline);
      const existingScores = sortWeeklyScores(current.weekly_scores || []).filter((entry) => entry.week !== weekValue);
      const weekly_scores = sortWeeklyScores([...existingScores, snapshot]);
      const computedFallbackStudent = upsertLocalDraftProfile({
        ...current,
        age: Number(mergedBaseline.age || current.age || 0),
        baseline_responses: mergedBaseline,
        onboarding_completed: hasCompletedOnboarding(mergedBaseline),
        onboarding_completed_at: current.onboarding_completed_at || new Date().toISOString(),
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
        answers: weeklyAnswers,
        baseline_responses: mergedBaseline,
        persistedCheckIn,
        student: computedFallbackStudent,
      };
    }

    return {
      computedScore,
      answers: weeklyAnswers,
      baseline_responses: mergedBaseline,
      persistedCheckIn,
      student: null,
    };
  }
}

export async function logTeacherAction({
  studentId,
  actionType,
  notes,
  outcome = 'pending',
  completed = false,
  referralSummary,
  teacherEmail,
}) {
  let action = null;

  try {
    action = await backendClient.entities.TeacherAction.create({
      student_id: studentId,
      action_type: actionType,
      notes,
      outcome,
      completed,
      referral_summary: referralSummary,
      teacher_email: teacherEmail,
    });
  } catch (error) {
    console.warn('TeacherAction create failed; returning non-persisted result:', error);
    return {
      id: `local_${actionType}_${Date.now()}`,
      student_id: studentId,
      action_type: actionType,
      notes,
      outcome,
      completed,
      referral_summary: referralSummary,
      teacher_email: teacherEmail,
    };
  }

  try {
    const student = await backendClient.entities.StudentProfile.get(studentId);
    const nextStatus =
      actionType === 'refer_counsellor' ? 'referred'
        : actionType === 'check_in' ? (completed ? 'check_in_completed' : 'check_in_scheduled')
          : actionType === 'monitor' ? 'monitoring'
            : student.action_status;

    await backendClient.entities.StudentProfile.update(studentId, {
      action_status: nextStatus,
    });
  } catch (error) {
    console.warn('Teacher action saved but StudentProfile status sync failed:', error);
  }

  return action;
}
