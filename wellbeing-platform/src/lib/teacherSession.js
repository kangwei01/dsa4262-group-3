import { teacherProfileByIdentifier } from '@/data/seed/teacherProfiles';

const TEACHER_SESSION_STORAGE_KEY = 'mindbridge_teacher_session';

export function normalizeTeacherIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

export function getStorage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function getStoredTeacherSession() {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(TEACHER_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.teacher_identifier) return null;
    return {
      ...parsed,
      teacher_identifier: normalizeTeacherIdentifier(parsed.teacher_identifier),
    };
  } catch (error) {
    console.warn('Unable to read teacher session:', error);
    return null;
  }
}

export function setStoredTeacherSession(session) {
  const storage = getStorage();
  if (!storage) return null;

  const normalized = session
    ? {
      ...session,
      teacher_identifier: normalizeTeacherIdentifier(session.teacher_identifier),
    }
    : null;

  if (!normalized) {
    storage.removeItem(TEACHER_SESSION_STORAGE_KEY);
    return null;
  }

  storage.setItem(TEACHER_SESSION_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function clearStoredTeacherSession() {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(TEACHER_SESSION_STORAGE_KEY);
}

export function authenticateTeacherCredentials(identifier, passcode) {
  const normalizedIdentifier = normalizeTeacherIdentifier(identifier);
  const normalizedPasscode = String(passcode || '').trim();

  if (!normalizedIdentifier || !normalizedPasscode) {
    throw new Error('Enter your school email and passcode to continue.');
  }

  const teacher = teacherProfileByIdentifier[normalizedIdentifier];
  if (!teacher || String(teacher.teacher_passcode || '').trim() !== normalizedPasscode) {
    throw new Error('That teacher login was not recognised.');
  }

  return {
    id: teacher.id,
    name: teacher.name,
    teacher_identifier: teacher.teacher_identifier,
    role: teacher.role,
    school_name: teacher.school_name,
    can_view_all_students: Boolean(teacher.can_view_all_students),
  };
}
