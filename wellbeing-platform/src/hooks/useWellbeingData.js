import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  authenticateStudentProfile,
  getDefaultStudent,
  getLatestCheckInByStudentId,
  getStudentById,
  getStudentByIdentifier,
  listStudentCheckInsByStudentId,
  listTeacherActionsByStudentId,
  listStudents,
  logTeacherAction,
  openSurveyForStudent,
  submitStudentCheckIn,
} from '@/services/wellbeingService';
import {
  clearStoredStudentIdentifier,
  getStoredStudentIdentifier,
  normalizeStudentIdentifier,
  setStoredStudentIdentifier,
} from '@/lib/studentSession';

export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: listStudents,
  });
}

export function useStudent(studentId) {
  return useQuery({
    queryKey: ['students', studentId],
    queryFn: () => getStudentById(studentId),
    enabled: Boolean(studentId),
  });
}

export function useStudentByIdentifier(identifier) {
  return useQuery({
    queryKey: ['students', 'identifier', normalizeStudentIdentifier(identifier)],
    queryFn: () => getStudentByIdentifier(identifier),
    enabled: Boolean(normalizeStudentIdentifier(identifier)),
  });
}

export function useDefaultStudent() {
  const query = useQuery({
    queryKey: ['students', 'default'],
    queryFn: getDefaultStudent,
  });

  return useMemo(() => ({
    ...query,
    student: query.data || null,
  }), [query]);
}

export function useCurrentStudent() {
  const [studentIdentifier, setStudentIdentifierState] = useState(getStoredStudentIdentifier());
  const query = useStudentByIdentifier(studentIdentifier);

  useEffect(() => {
    const sync = () => setStudentIdentifierState(getStoredStudentIdentifier());
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const setStudentIdentifier = (value) => {
    const normalized = setStoredStudentIdentifier(value);
    setStudentIdentifierState(normalized);
    return normalized;
  };

  const clearStudentIdentifier = () => {
    clearStoredStudentIdentifier();
    setStudentIdentifierState('');
  };

  return {
    ...query,
    student: query.data || null,
    studentIdentifier,
    setStudentIdentifier,
    clearStudentIdentifier,
  };
}

export function useResolveStudentIdentifier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authenticateStudentProfile,
    onSuccess: (student) => {
      if (!student?.student_identifier) return;
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.setQueryData(['students', 'identifier', student.student_identifier], student);
      queryClient.setQueryData(['students', student.id], student);
    },
  });
}

export function useLatestStudentCheckIn(studentId) {
  return useQuery({
    queryKey: ['student-checkins', 'latest', studentId],
    queryFn: () => getLatestCheckInByStudentId(studentId),
    enabled: Boolean(studentId),
  });
}

export function useStudentCheckIns(studentId) {
  return useQuery({
    queryKey: ['student-checkins', studentId],
    queryFn: () => listStudentCheckInsByStudentId(studentId),
    enabled: Boolean(studentId),
  });
}

export function useTeacherActions(studentId) {
  return useQuery({
    queryKey: ['teacher-actions', studentId],
    queryFn: () => listTeacherActionsByStudentId(studentId),
    enabled: Boolean(studentId),
  });
}

export function useSubmitStudentCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitStudentCheckIn,
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['students', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['students', 'default'] });
      queryClient.invalidateQueries({ queryKey: ['student-checkins', 'latest', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['student-checkins', variables.studentId] });
      if (result?.student?.student_identifier) {
        queryClient.setQueryData(['students', 'identifier', result.student.student_identifier], result.student);
      }
    },
  });
}

export function useLogTeacherAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logTeacherAction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['students', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-actions', variables.studentId] });
    },
  });
}

export function useOpenStudentSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: openSurveyForStudent,
    onSuccess: (student, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['students', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-actions', variables.studentId] });
      if (student?.student_identifier) {
        queryClient.setQueryData(['students', 'identifier', student.student_identifier], student);
      }
    },
  });
}
