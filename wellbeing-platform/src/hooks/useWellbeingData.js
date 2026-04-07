import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  authenticateStudentProfile,
  createCounsellorCase,
  getDefaultStudent,
  getLatestCheckInByStudentId,
  getStudentById,
  getStudentByIdForTeacher,
  getStudentByIdentifier,
  listCounsellorCases,
  listFollowUpQueue,
  listParentCommunications,
  listStudentCheckInsByStudentId,
  listStudentsForTeacher,
  listTeacherActionsByStudentId,
  listTeacherActionsForTeacher,
  listStudents,
  logTeacherAction,
  openSurveyForStudent,
  openSurveysForStudents,
  submitStudentCheckIn,
  updateCounsellorCaseStatus,
  updateParentCommunicationStatus,
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

export function useTeacherStudents(teacher) {
  return useQuery({
    queryKey: ['teacher-students', teacher?.teacher_identifier, teacher?.role],
    queryFn: () => listStudentsForTeacher({
      teacherEmail: teacher?.teacher_identifier,
      allowAll: Boolean(teacher?.can_view_all_students),
    }),
    enabled: Boolean(teacher?.teacher_identifier),
  });
}

export function useTeacherStudent(studentId, teacher) {
  return useQuery({
    queryKey: ['teacher-students', teacher?.teacher_identifier, teacher?.role, studentId],
    queryFn: () => getStudentByIdForTeacher({
      studentId,
      teacherEmail: teacher?.teacher_identifier,
      allowAll: Boolean(teacher?.can_view_all_students),
    }),
    enabled: Boolean(studentId && teacher?.teacher_identifier),
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

export function useTeacherActivityFeed(teacher) {
  return useQuery({
    queryKey: ['teacher-actions', 'teacher', teacher?.teacher_identifier, teacher?.role],
    queryFn: () => listTeacherActionsForTeacher({
      teacherEmail: teacher?.teacher_identifier,
      allowAll: Boolean(teacher?.can_view_all_students),
    }),
    enabled: Boolean(teacher?.teacher_identifier),
  });
}

export function useFollowUpQueue(teacher) {
  return useQuery({
    queryKey: ['follow-up-queue', teacher?.teacher_identifier, teacher?.role],
    queryFn: () => listFollowUpQueue({
      teacherEmail: teacher?.teacher_identifier,
      allowAll: Boolean(teacher?.can_view_all_students),
    }),
    enabled: Boolean(teacher?.teacher_identifier),
  });
}

export function useCounsellorCases(teacher) {
  return useQuery({
    queryKey: ['counsellor-cases', teacher?.teacher_identifier, teacher?.role],
    queryFn: () => listCounsellorCases({
      teacherEmail: teacher?.teacher_identifier,
      allowAll: Boolean(teacher?.can_view_all_students),
    }),
    enabled: Boolean(teacher?.teacher_identifier),
  });
}

export function useParentCommunications(teacher) {
  return useQuery({
    queryKey: ['parent-communications', teacher?.teacher_identifier, teacher?.role],
    queryFn: () => listParentCommunications({
      teacherEmail: teacher?.teacher_identifier,
      allowAll: Boolean(teacher?.can_view_all_students),
    }),
    enabled: Boolean(teacher?.teacher_identifier),
  });
}

export function useSubmitStudentCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitStudentCheckIn,
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-students'] });
      queryClient.invalidateQueries({ queryKey: ['students', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['students', 'default'] });
      queryClient.invalidateQueries({ queryKey: ['student-checkins', 'latest', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['student-checkins', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['follow-up-queue'] });
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
      queryClient.invalidateQueries({ queryKey: ['teacher-students'] });
      queryClient.invalidateQueries({ queryKey: ['students', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-actions', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-actions', 'teacher'] });
      queryClient.invalidateQueries({ queryKey: ['follow-up-queue'] });
      queryClient.invalidateQueries({ queryKey: ['parent-communications'] });
      queryClient.invalidateQueries({ queryKey: ['counsellor-cases'] });
    },
  });
}

export function useOpenStudentSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: openSurveyForStudent,
    onSuccess: (student, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-students'] });
      queryClient.invalidateQueries({ queryKey: ['students', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-actions', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-actions', 'teacher'] });
      if (student?.student_identifier) {
        queryClient.setQueryData(['students', 'identifier', student.student_identifier], student);
      }
    },
  });
}

export function useOpenStudentSurveys() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: openSurveysForStudents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-students'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-actions'] });
    },
  });
}

export function useCreateCounsellorCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCounsellorCase,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-students'] });
      queryClient.invalidateQueries({ queryKey: ['students', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-actions', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['counsellor-cases'] });
      queryClient.invalidateQueries({ queryKey: ['parent-communications'] });
    },
  });
}

export function useUpdateCounsellorCaseStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCounsellorCaseStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counsellor-cases'] });
    },
  });
}

export function useUpdateParentCommunicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateParentCommunicationStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-communications'] });
    },
  });
}
