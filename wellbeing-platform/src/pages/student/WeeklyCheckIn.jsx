import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  useCurrentStudent,
  useRecordStudentConsent,
  useResolveStudentIdentifier,
  useSubmitStudentCheckIn,
} from '@/hooks/useWellbeingData';
import {
  hasCompletedOnboarding,
  monthlyQuestions,
  oneTimeQuestions,
  weeklyQuestions,
} from '@/lib/rfModel';

function getInitialBaselineResponses(student) {
  return Object.fromEntries(
    oneTimeQuestions.map((question) => [
      question.feature,
      student?.baseline_responses?.[question.feature] ?? '',
    ]),
  );
}

function getQuestionValue(question, baselineResponses, weeklyAnswers, monthlyAnswers) {
  if (question.cadence === 'one_time') return baselineResponses[question.feature];
  if (question.cadence === 'monthly') return monthlyAnswers[question.feature];
  return weeklyAnswers[question.feature];
}

function hasCompletedMonthlyResponses(student) {
  if (!student?.monthly_completed_at) return false;

  return monthlyQuestions.every((question) => {
    const value = student?.monthly_responses?.[question.feature];
    return value !== undefined && value !== null && value !== '';
  });
}

function buildSurveyScreens({ needsConsent, needsOnboarding, surveyType }) {
  return [
    ...(needsConsent ? [{ kind: 'welcome' }] : []),
    ...(needsOnboarding ? oneTimeQuestions.map((question) => ({ kind: 'question', question })) : []),
    ...weeklyQuestions.map((question) => ({ kind: 'question', question })),
    ...(surveyType === 'monthly'
      ? monthlyQuestions.map((question) => ({ kind: 'question', question }))
      : []),
    { kind: 'free_text' },
  ];
}

function getQuestionProgress(question, screens, currentStep) {
  if (!question) return null;
  if (question.cadence === 'weekly') {
    const items = screens.filter((item) => item.kind === 'question' && item.question.cadence === 'weekly');
    const current = screens
      .slice(0, currentStep + 1)
      .filter((item) => item.kind === 'question' && item.question.cadence === 'weekly')
      .length;
    return { current, total: items.length };
  }
  if (question.cadence === 'monthly') {
    const items = screens.filter((item) => item.kind === 'question' && item.question.cadence === 'monthly');
    const current = screens
      .slice(0, currentStep + 1)
      .filter((item) => item.kind === 'question' && item.question.cadence === 'monthly')
      .length;
    return { current, total: items.length };
  }
  return null;
}

export default function WeeklyCheckIn() {
  const navigate = useNavigate();
  const {
    student,
    studentIdentifier,
    setStudentIdentifier,
    clearStudentIdentifier,
    isLoading,
  } = useCurrentStudent();
  const resolveStudentIdentifier = useResolveStudentIdentifier();
  const recordConsent = useRecordStudentConsent();
  const submitCheckIn = useSubmitStudentCheckIn();
  const [step, setStep] = useState(0);
  const [baselineResponses, setBaselineResponses] = useState({});
  const [weeklyAnswers, setWeeklyAnswers] = useState({});
  const [monthlyAnswers, setMonthlyAnswers] = useState({});
  const [freeText, setFreeText] = useState('');
  const [identifierInput, setIdentifierInput] = useState(studentIdentifier);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [accessError, setAccessError] = useState('');

  useEffect(() => {
    if (!student) return;
    setBaselineResponses(getInitialBaselineResponses(student));
    setWeeklyAnswers({});
    setMonthlyAnswers({});
    setFreeText('');
    setConsentAccepted(false);
    setStep(0);
    setAccessError('');
  }, [student?.id]);

  useEffect(() => {
    setIdentifierInput(studentIdentifier);
  }, [studentIdentifier]);

  const surveyType = student?.survey_type === 'monthly' ? 'monthly' : 'weekly';
  const effectiveSurveyType = student && !hasCompletedMonthlyResponses(student)
    ? 'monthly'
    : surveyType;
  const needsConsent = Boolean(student && !student.consent_completed);
  const needsOnboarding = student
    ? (!student.onboarding_completed || !hasCompletedOnboarding(getInitialBaselineResponses(student)))
    : false;
  const screens = useMemo(
    () => buildSurveyScreens({ needsConsent, needsOnboarding, surveyType: effectiveSurveyType }),
    [effectiveSurveyType, needsConsent, needsOnboarding],
  );
  const screen = screens[step] || screens[0];
  const currentQuestion = screen?.kind === 'question' ? screen.question : null;
  const currentValue = currentQuestion
    ? getQuestionValue(currentQuestion, baselineResponses, weeklyAnswers, monthlyAnswers)
    : '';
  const progress = getQuestionProgress(currentQuestion, screens, step);

  const handleIdentifierSubmit = async () => {
    try {
      setAccessError('');
      const resolvedStudent = await resolveStudentIdentifier.mutateAsync({
        identifier: identifierInput,
        passcode: passcodeInput,
      });
      if (resolvedStudent?.student_identifier) {
        setStudentIdentifier(resolvedStudent.student_identifier);
        setPasscodeInput('');
      }
    } catch (error) {
      setAccessError(error.message || 'We could not log you into that profile.');
    }
  };

  const goNext = () => {
    setStep((currentStep) => Math.min(currentStep + 1, screens.length - 1));
  };

  const updateAnswer = (question, value) => {
    if (question.cadence === 'one_time') {
      setBaselineResponses((previous) => ({ ...previous, [question.feature]: value }));
      return;
    }
    if (question.cadence === 'monthly') {
      setMonthlyAnswers((previous) => ({ ...previous, [question.feature]: value }));
      return;
    }
    setWeeklyAnswers((previous) => ({ ...previous, [question.feature]: value }));
  };

  const handleChoiceSelect = (value) => {
    if (!currentQuestion) return;
    updateAnswer(currentQuestion, value);
    window.setTimeout(goNext, 120);
  };

  const handleConsentChange = async (checked) => {
    if (!checked || !student) return;
    setConsentAccepted(true);
    try {
      await recordConsent.mutateAsync(student.id);
      setStep(0);
    } catch (error) {
      toast.error(error.message || 'We could not save your consent just now.');
      setConsentAccepted(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const result = await submitCheckIn.mutateAsync({
        studentId: student.id,
        answers: {
          baselineResponses,
          weeklyAnswers,
          monthlyAnswers,
        },
        freeText,
        surveyType: effectiveSurveyType,
      });

      navigate('/feedback', {
        state: {
          answers: {
            ...weeklyAnswers,
            ...(effectiveSurveyType === 'monthly' ? monthlyAnswers : {}),
          },
          baselineResponses,
          monthlyResponses: monthlyAnswers,
          score: result.computedScore,
        },
      });
    } catch (error) {
      toast.error(error.message || 'We could not submit your check-in just now.');
    }
  };

  if (isLoading && studentIdentifier) {
    return <div className="py-10 text-sm text-muted-foreground">Loading your check-in…</div>;
  }

  if (!studentIdentifier || (!student && !isLoading)) {
    return (
      <div className="min-h-[72vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-lg border border-border shadow-lg shadow-primary/5">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Open your student profile</h1>
                <p className="text-xs text-muted-foreground">
                  Sign in with your school email or student ID and your wellbeing passcode.
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <Input
                value={identifierInput}
                onChange={(event) => setIdentifierInput(event.target.value)}
                placeholder="e.g. priyas@school.edu"
                className="h-12 text-base"
              />
              <Input
                type="password"
                value={passcodeInput}
                onChange={(event) => setPasscodeInput(event.target.value)}
                placeholder="Enter your passcode"
                className="h-12 text-base"
              />
              {accessError && (
                <p className="text-xs text-rose-600">{accessError}</p>
              )}
            </div>

            <Button
              onClick={handleIdentifierSubmit}
              disabled={
                !String(identifierInput || '').trim()
                || !String(passcodeInput || '').trim()
                || resolveStudentIdentifier.isPending
              }
              className="w-full mt-5 gap-2"
            >
              <LockKeyhole className="w-4 h-4" />
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return <div className="py-10 text-sm text-muted-foreground">No student profile available yet.</div>;
  }

  if (student.survey_status !== 'open') {
    return (
      <div className="min-h-[72vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-2xl border border-border shadow-lg shadow-primary/5">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-foreground">Your survey is not open right now</h1>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Your teacher will open the next check-in when it is time for your class to respond.
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <Button variant="outline" onClick={clearStudentIdentifier}>
                    Switch profile
                  </Button>
                  <span className="text-[11px] text-muted-foreground">
                    Signed in as {student.student_identifier || student.name}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-8 px-4">
      <div className="w-full max-w-3xl mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Student check-in</h1>
            <p className="text-xs text-muted-foreground">{student.student_identifier || student.name}</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl">
        <AnimatePresence mode="wait">
          {screen?.kind === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border border-border shadow-lg shadow-primary/5">
                <CardContent className="p-8">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-border/60 bg-secondary/20 p-6">
                      <h2 className="text-xl font-semibold text-foreground mb-3">Why we&apos;re doing this</h2>
                      <p className="text-sm text-foreground leading-relaxed">
                        This check-in helps your teachers understand how you&apos;ve been feeling lately. There are no right or wrong answers — just answer honestly.
                      </p>
                    </div>
                    <div className="rounded-3xl border border-border/60 bg-secondary/20 p-6">
                      <h2 className="text-xl font-semibold text-foreground mb-3">How your answers are used</h2>
                      <p className="text-sm text-foreground leading-relaxed">
                        Your teachers will be able to see your responses. They may check in with you if something seems off. You&apos;ll also get a few simple tips after you finish.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-start gap-3">
                    <Checkbox
                      id="student-consent"
                      checked={consentAccepted}
                      onCheckedChange={handleConsentChange}
                      disabled={recordConsent.isPending}
                      className="mt-1"
                    />
                    <label htmlFor="student-consent" className="text-sm text-foreground cursor-pointer">
                      I understand and want to continue
                    </label>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {screen?.kind === 'question' && currentQuestion && (
            <motion.div
              key={currentQuestion.feature}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border border-border shadow-lg shadow-primary/5">
                <CardContent className="p-8">
                  {currentQuestion.cadence === 'one_time' && (
                    <p className="text-sm text-muted-foreground mb-4">Let&apos;s get to know a bit more about you!</p>
                  )}
                  {currentQuestion.cadence === 'weekly' && (
                    <div className="flex items-center justify-between gap-3 mb-4 text-sm text-muted-foreground">
                      <p>These are a few short questions about your week. Just choose the answers that feel closest to how things have been.</p>
                      {progress && <span className="shrink-0">{progress.current} of {progress.total}</span>}
                    </div>
                  )}
                  {currentQuestion.cadence === 'monthly' && (
                    <div className="flex items-center justify-between gap-3 mb-4 text-sm text-muted-foreground">
                      <p>These questions don&apos;t change much week to week, so we&apos;ll only ask them once in a while. If this is your first full check-in, we&apos;ll collect them now so your results use your own answers rather than defaults.</p>
                      {progress && <span className="shrink-0">{progress.current} of {progress.total}</span>}
                    </div>
                  )}

                  <h2 className="text-2xl font-semibold text-foreground leading-tight">
                    {currentQuestion.question}
                  </h2>

                  <div className="mt-6 grid grid-cols-1 gap-3">
                    {currentQuestion.responseType === 'number' ? (
                      <div className="flex flex-col gap-3">
                        <Input
                          type="number"
                          min={currentQuestion.min}
                          max={currentQuestion.max}
                          step={currentQuestion.step ?? 1}
                          placeholder={currentQuestion.placeholder ?? ''}
                          value={currentValue ?? ''}
                          onChange={(e) => updateAnswer(currentQuestion, e.target.value)}
                          className="rounded-2xl border border-border px-4 py-3 text-sm"
                        />
                        <Button
                          type="button"
                          onClick={goNext}
                          disabled={!currentValue && currentValue !== 0}
                          className="w-full rounded-2xl"
                        >
                          Continue
                        </Button>
                      </div>
                    ) : (
                      (currentQuestion.options ?? []).map((option) => (
                        <button
                          key={`${currentQuestion.feature}-${option.value}`}
                          type="button"
                          onClick={() => handleChoiceSelect(option.value)}
                          className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                            String(currentValue) === String(option.value)
                              ? 'border-primary bg-primary/5 text-foreground'
                              : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary/20'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {screen?.kind === 'free_text' && (
            <motion.div
              key="free-text"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border border-border shadow-lg shadow-primary/5">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold text-foreground">Anything else you want your teacher to know?</h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    This is optional. Your teacher may read this to better understand your week.
                  </p>

                  <Textarea
                    value={freeText}
                    onChange={(event) => setFreeText(event.target.value)}
                    placeholder="For example: a big deadline, something happening at home, or a friendship issue this week."
                    className="mt-5 min-h-[180px] rounded-2xl"
                  />

                  <p className="text-xs text-muted-foreground mt-3">This will be shared with your teacher.</p>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <Button variant="outline" onClick={() => setStep((currentStep) => Math.max(currentStep - 1, 0))}>
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={submitCheckIn.isPending}
                    >
                      Submit check-in
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
