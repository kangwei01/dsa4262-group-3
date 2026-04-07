import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  authenticateTeacherCredentials,
  clearStoredTeacherSession,
  getStoredTeacherSession,
  setStoredTeacherSession,
} from '@/lib/teacherSession';

const TeacherAccessContext = createContext(null);

export function TeacherAccessProvider({ children }) {
  const [teacher, setTeacher] = useState(getStoredTeacherSession());

  useEffect(() => {
    const sync = () => {
      setTeacher(getStoredTeacherSession());
    };

    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const value = useMemo(() => ({
    teacher,
    isTeacherAuthenticated: Boolean(teacher),
    login(identifier, passcode) {
      const session = authenticateTeacherCredentials(identifier, passcode);
      setTeacher(setStoredTeacherSession(session));
      return session;
    },
    logout() {
      clearStoredTeacherSession();
      setTeacher(null);
    },
  }), [teacher]);

  return (
    <TeacherAccessContext.Provider value={value}>
      {children}
    </TeacherAccessContext.Provider>
  );
}

export function useTeacherAccess() {
  const context = useContext(TeacherAccessContext);
  if (!context) {
    throw new Error('useTeacherAccess must be used within a TeacherAccessProvider');
  }
  return context;
}
