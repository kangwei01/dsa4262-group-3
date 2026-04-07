import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertTriangle, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useTeacherAccess } from '@/lib/TeacherAccessContext';

export default function TeacherLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { teacher, isTeacherAuthenticated, login } = useTeacherAccess();
  const [identifier, setIdentifier] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  if (isTeacherAuthenticated && teacher) {
    const nextPath = location.state?.from?.pathname || '/teacher';
    return <Navigate to={nextPath} replace />;
  }

  const handleLogin = () => {
    try {
      setError('');
      login(identifier, passcode);
      navigate(location.state?.from?.pathname || '/teacher', { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign you into the teacher workspace.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl border border-border shadow-lg shadow-primary/5">
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Teacher sign in</h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Use your school email and teacher passcode to access the support dashboard. Student responses are confidential and for support purposes only.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border/60 bg-secondary/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">School access</p>
            <p className="text-sm text-foreground leading-relaxed">
              This prototype uses a teacher sign-in screen in place of full school SSO. The route guard, privacy notice, teacher scoping, follow-up queues, and counsellor handoff still work inside this flow.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <Input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="Teacher email"
              className="h-12 text-base"
            />
            <Input
              type="password"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
              placeholder="Teacher passcode"
              className="h-12 text-base"
            />
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  Prototype credentials:
                  {' '}
                  <span className="font-semibold">wellbeing@school.edu / teacher1234</span>
                  {' '}
                  or
                  {' '}
                  <span className="font-semibold">counsellor@school.edu / counsellor1234</span>
                </p>
              </div>
            </div>
            {error && (
              <p className="text-sm text-rose-600">{error}</p>
            )}
          </div>

          <Button
            onClick={handleLogin}
            disabled={!String(identifier || '').trim() || !String(passcode || '').trim()}
            className="w-full mt-6 gap-2"
          >
            <LockKeyhole className="w-4 h-4" />
            Continue to teacher dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
