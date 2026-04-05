const STORAGE_KEY = 'mindbridge_student_identifier';

export function normalizeStudentIdentifier(value = '') {
  return String(value).trim().toLowerCase();
}

export function getStoredStudentIdentifier() {
  if (typeof window === 'undefined') return '';
  return normalizeStudentIdentifier(window.localStorage.getItem(STORAGE_KEY) || '');
}

export function setStoredStudentIdentifier(value) {
  if (typeof window === 'undefined') return '';
  const normalized = normalizeStudentIdentifier(value);
  if (!normalized) {
    window.localStorage.removeItem(STORAGE_KEY);
    return '';
  }
  window.localStorage.setItem(STORAGE_KEY, normalized);
  return normalized;
}

export function clearStoredStudentIdentifier() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
