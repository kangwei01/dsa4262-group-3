import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  Heart,
  HeartPulse,
  Home,
  LockKeyhole,
  Mail,
  MessageSquareHeart,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useCurrentStudent, useResolveStudentIdentifier, useSubmitStudentCheckIn } from '@/hooks/useWellbeingData';
import {
  cadenceLabels,
  hasCompletedOnboarding,
  isQuestionAnswered,
  monthlyQuestions,
  oneTimeQuestions,
  weeklyQuestions,
} from '@/lib/rfModel';

const categoryIcons = {
  baseline: BookOpen,
  physical: HeartPulse,
  habits: Sparkles,
  school: Brain,
  peer: Users,
  digital: Smartphone,
  family: Home,
  self_image: MessageSquareHeart,
};

function getInitialBaselineResponses(student) {
  return Object.fromEntries(
    oneTimeQuestions.map((question) => {
      const fallbackValue = question.feature === 'age' ? student?.age ?? '' : '';
      return [
        question.feature,
        student?.baseline_responses?.[question.feature] ?? fallbackValue,
      ];
    }),
  );
}

function getQuestionValue(question, baselineResponses, weeklyAnswers, monthlyAnswers) {
  if (question.cadence === 'one_time') return baselineResponses[question.feature];
  if (question.cadence === 'monthly') return monthlyAnswers[question.feature];
  return weeklyAnswers[question.feature];
}

function getGridColumns(optionCount) {
  if (optionCount >= 7) return 'grid-cols-1 sm:grid-cols-2';
  if (optionCount >= 5) return 'grid-cols-1 sm:grid-cols-2';
  if (optionCount === 4) return 'grid-cols-1 sm:grid-cols-2';
  if (optionCount === 2) return 'grid-cols-1 sm:grid-cols-2';
  return 'grid-cols-1';
}

function buildSurveyScreens(needsOnboarding, surveyType) {
  return [
    {
      kind: 'welcome',
      title: 'Why this exists',
      description: surveyType === 'monthly'
        ? 'This check-in helps your teachers support you better, while keeping the monthly questions lighter and less repetitive.'
        : 'This check-in helps your teachers support you better. You are not being graded or judged here.',
    },
    ...(needsOnboarding ? [{
      kind: 'section',
      section: 'onboarding',
      title: "Let's get to know more about you!",
      description: 'These questions will only have to be answered once.',
    }] : []),
    ...(needsOnboarding ? oneTimeQuestions.map((question) => ({ kind: 'question', question })) : []),
    {
      kind: 'section',
      section: 'weekly',
      title: 'Your weekly pulse',
      description: 'These are the short weekly questions used during CCE-style check-ins. Keep your answers simple and choose what feels closest to your week.',
    },
    ...weeklyQuestions.map((question) => ({ kind: 'question', question })),
    ...(surveyType === 'monthly' ? [
      {
        kind: 'section',
        section: 'monthly',
        title: 'Monthly context refresh',
        description: 'These slower-changing questions are asked less often so your teacher gets fuller context without making you repeat the same things every week.',
      },
      ...monthlyQuestions.map((question) => ({ kind: 'question', question })),
    ] : []),
    {
      kind: 'reflection',
      title: 'Anything else you want your teacher to know?',
      description: 'This is optional, but it is saved with your check-in so a teacher can read the context behind your answers.',
    },
  ];
}

function clampNumberValue(question, rawValue) {
  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric)) return rawValue;
  return String(Math.min(question.max, Math.max(question.min, numeric)));
}

function getNumberValidationMessage(question, value) {
  if (!question || question.responseType !== 'number' || value === '') return '';
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 'Enter a valid number.';
  if (numeric < question.min || numeric > question.max) {
    return `Enter a value between ${question.min} and ${question.max}${question.suffix ? ` ${question.suffix}` : ''}.`;
  }
  return '';
}

function getQuestionHint(question) {
  if (!question) return '';
  if (question.cadence === 'one_time') {
    return 'This helps us set up your profile and only needs to be answered once.';
  }
  if (question.cadence === 'monthly') {
    return 'This question is part of the monthly refresh. The options run from less concern at the top to more concern lower down.';
  }
  return 'Think only about the timeframe in the question. The options run from less concern at the top to more concern lower down.';
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
    setStep(0);
    setConsentAccepted(false);
    setAccessError('');
  }, [student?.id]);

  useEffect(() => {
    setIdentifierInput(studentIdentifier);
  }, [studentIdentifier]);

  const needsOnboarding = student
    ? (!student.onboarding_completed || !hasCompletedOnboarding(getInitialBaselineResponses(student)))
    : false;
  const surveyType = student?.survey_type === 'monthly' ? 'monthly' : 'weekly';
  const surveyScreens = useMemo(
    () => buildSurveyScreens(needsOnboarding, surveyType),
    [needsOnboarding, surveyType],
  );

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

  if (isLoading && studentIdentifier) {
    return <div className="py-10 text-sm text-muted-foreground">Loading your check-in…</div>;
  }

  if (!studentIdentifier || (!student && !isLoading)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
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
                placeholder="e.g. alexm@school.edu"
                className="h-12 text-base"
              />
              <Input
                type="password"
                value={passcodeInput}
                onChange={(event) => setPasscodeInput(event.target.value)}
                placeholder="Enter your passcode"
                className="h-12 text-base"
              />
              <p className="text-[11px] text-muted-foreground">
                If this is your first time using the system for that student ID, the passcode you enter now will become your profile passcode.
              </p>
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
              {resolveStudentIdentifier.isPending ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <LockKeyhole className="w-4 h-4" />
              )}
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
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-2xl border border-border shadow-lg shadow-primary/5">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-foreground">Your survey is not open right now</h1>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  This questionnaire is teacher-controlled, so it only opens when your school is ready for your next check-in. That helps avoid repeated submissions and keeps each response window meaningful.
                </p>
                <div className="mt-5 rounded-2xl border border-border/60 bg-secondary/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">What happens next</p>
                  <p className="text-sm text-foreground leading-relaxed">
                    Once your teacher opens the next survey window, you can come back with the same student ID and passcode to complete it.
                  </p>
                </div>
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

  const screen = surveyScreens[step] || surveyScreens[0];
  const questionSteps = surveyScreens.filter((item) => item.kind === 'question');
  const currentQuestionIndex = surveyScreens.slice(0, step + 1).filter((item) => item.kind === 'question').length;
  const currentQuestion = screen.kind === 'question' ? screen.question : null;
  const currentValue = currentQuestion
    ? getQuestionValue(currentQuestion, baselineResponses, weeklyAnswers, monthlyAnswers)
    : '';
  const currentNumberError = currentQuestion ? getNumberValidationMessage(currentQuestion, currentValue) : '';
  const progress = screen.kind === 'reflection'
    ? 100
    : questionSteps.length === 0
      ? 0
      : Math.round(((Math.max(currentQuestionIndex - (currentQuestion ? 1 : 0), 0)) / questionSteps.length) * 100);
  const CategoryIcon = currentQuestion ? (categoryIcons[currentQuestion.category] || Heart) : Sparkles;

  const updateAnswer = (question, value) => {
    if (question.cadence === 'one_time') {
      setBaselineResponses((previous) => ({ ...previous, [question.feature]: value }));
    } else if (question.cadence === 'monthly') {
      setMonthlyAnswers((previous) => ({ ...previous, [question.feature]: value }));
    } else {
      setWeeklyAnswers((previous) => ({ ...previous, [question.feature]: value }));
    }
  };

  const canMoveNext = screen.kind === 'welcome'
    ? consentAccepted
    : screen.kind === 'section'
      ? true
      : screen.kind === 'question'
        ? isQuestionAnswered(currentQuestion, currentValue) && !currentNumberError
        : true;

  const goNext = () => setStep((currentStep) => Math.min(currentStep + 1, surveyScreens.length - 1));

  const handleChoiceSelect = (value) => {
    if (!currentQuestion) return;
    updateAnswer(currentQuestion, value);
    window.setTimeout(goNext, 140);
  };

  const handleNumberChange = (event) => {
    if (!currentQuestion) return;
    updateAnswer(currentQuestion, event.target.value);
  };

  const handleNumberBlur = () => {
    if (!currentQuestion || currentQuestion.responseType !== 'number' || currentValue === '') return;
    updateAnswer(currentQuestion, clampNumberValue(currentQuestion, currentValue));
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
        surveyType,
      });

      navigate('/feedback', {
        state: {
          answers: {
            ...weeklyAnswers,
            ...(surveyType === 'monthly' ? monthlyAnswers : {}),
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

  const screenLabel = screen.kind === 'question'
    ? `Question ${currentQuestionIndex} of ${questionSteps.length}`
    : screen.kind === 'reflection'
      ? 'Final step'
      : step === 0
        ? 'Before you begin'
        : screen.section === 'onboarding'
          ? 'Asked once'
          : screen.section === 'monthly'
            ? 'Monthly refresh'
            : 'Weekly pulse';

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-8 px-4">
      <div className="w-full max-w-3xl mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Student wellbeing check-in</h1>
            <p className="text-xs text-muted-foreground">
              Signed in as {student.student_identifier || student.name}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <button
            onClick={clearStudentIdentifier}
            className="text-primary font-medium hover:underline"
          >
            Switch profile
          </button>
          <span>•</span>
          <span>{surveyType === 'monthly' ? 'Monthly refresh window is open' : 'Weekly pulse window is open'}</span>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>{screenLabel}</span>
            <span>{progress}% complete</span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl">
        <AnimatePresence mode="wait">
          {screen.kind === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22 }}
            >
              <Card className="border border-border shadow-lg shadow-primary/5">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground">{screen.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{screen.description}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border/60 bg-secondary/20 p-5 space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">What this helps with</p>
                      <p className="text-sm text-foreground leading-relaxed">
                        This is a space for you to voice any concerns you want your teacher to know about.
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        You are not being graded or judged. This is here to help your teachers support you earlier and more clearly.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-5 space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-widest text-primary">For transparency</p>
                      <p className="text-sm text-foreground leading-relaxed">
                        What you answer will be seen by your teachers.
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        It will be used to support you, and if needed, a teacher may check in with you.
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        After submitting, you will get a short support summary instead of a score.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/[0.03] p-4">
                    <Checkbox
                      id="student-consent"
                      checked={consentAccepted}
                      onCheckedChange={(value) => setConsentAccepted(Boolean(value))}
                      className="mt-1"
                    />
                    <label htmlFor="student-consent" className="text-sm text-foreground leading-relaxed cursor-pointer">
                      I understand and agree.
                    </label>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {screen.kind === 'section' && (
            <motion.div
              key={screen.section}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22 }}
            >
              <Card className="border border-border shadow-lg shadow-primary/5">
                <CardContent className="p-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.03] px-3 py-1 text-xs font-medium text-primary">
                    {screen.section === 'onboarding' ? <BookOpen className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {screen.section === 'onboarding' ? 'Asked once' : screen.section === 'monthly' ? 'Monthly refresh' : 'Weekly pulse'}
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground mt-4">{screen.title}</h2>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-2xl">{screen.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {screen.kind === 'question' && currentQuestion && (
            <motion.div
              key={currentQuestion.feature}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22 }}
            >
              <Card className="border border-border shadow-lg shadow-primary/5">
                <CardContent className="p-8">
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/8 px-2.5 py-1 rounded-full border border-primary/15">
                      <CategoryIcon className="w-3 h-3" />
                      {currentQuestion.categoryLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/60 px-2.5 py-1 rounded-full border border-border">
                      {cadenceLabels[currentQuestion.cadence] || currentQuestion.cadence}
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold text-foreground mb-2 leading-snug">
                    {currentQuestion.question}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-8">
                    {getQuestionHint(currentQuestion)}
                  </p>

                  {currentQuestion.responseType === 'number' ? (
                    <div className="max-w-sm">
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        {currentQuestion.placeholder}
                      </label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          min={currentQuestion.min}
                          max={currentQuestion.max}
                          step={currentQuestion.step || 1}
                          value={currentValue}
                          onChange={handleNumberChange}
                          onBlur={handleNumberBlur}
                          placeholder={currentQuestion.placeholder}
                          className="h-12 text-base"
                        />
                        {currentQuestion.suffix && (
                          <span className="text-sm text-muted-foreground">{currentQuestion.suffix}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-2">
                        Accepted range: {currentQuestion.min} to {currentQuestion.max}{currentQuestion.suffix ? ` ${currentQuestion.suffix}` : ''}
                      </p>
                      {currentNumberError && (
                        <p className="text-[11px] text-rose-600 mt-1">{currentNumberError}</p>
                      )}
                    </div>
                  ) : (
                    <div className={`grid gap-2 ${getGridColumns(currentQuestion.options.length)}`}>
                      {currentQuestion.options.map((option) => {
                        const isSelected = String(currentValue) === String(option.value);
                        return (
                          <button
                            key={String(option.value)}
                            onClick={() => handleChoiceSelect(option.value)}
                            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/40 hover:bg-secondary/60'
                            }`}
                          >
                            <span className={`text-sm font-medium leading-snug ${
                              isSelected ? 'text-primary' : 'text-foreground'
                            }`}>
                              {option.label}
                            </span>
                            <span className={`w-4 h-4 rounded-full border shrink-0 ${
                              isSelected
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground/30'
                            }`} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {screen.kind === 'reflection' && (
            <motion.div
              key="freetext"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22 }}
            >
              <Card className="border border-border shadow-lg shadow-primary/5">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">{screen.title}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    {screen.description}
                  </p>
                  <Textarea
                    placeholder="For example: a big deadline, something happening at home, or a friendship issue that shaped this week."
                    value={freeText}
                    onChange={(event) => setFreeText(event.target.value)}
                    className="min-h-[120px] resize-none text-sm"
                  />
                  <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>This note is saved with your check-in so your teacher can see the context behind your answers.</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center mt-5">
          <Button
            variant="ghost"
            onClick={() => setStep((currentStep) => Math.max(0, currentStep - 1))}
            disabled={step === 0}
            className="gap-2 text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="text-[11px] text-muted-foreground text-center">
            {screen.kind === 'question'
              ? `${currentQuestion.categoryLabel} · ${currentQuestion.label}`
              : screen.kind === 'reflection'
                ? 'Optional note'
                : screen.section === 'onboarding'
                  ? 'One-time setup'
                  : screen.section === 'weekly'
                    ? 'Weekly pulse'
                    : screen.section === 'monthly'
                      ? 'Monthly refresh'
                      : 'Introduction'}
          </div>

          {screen.kind === 'reflection' ? (
            <Button onClick={handleSubmit} disabled={submitCheckIn.isPending} className="gap-2 px-6">
              {submitCheckIn.isPending ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Submit
            </Button>
          ) : (
            <Button
              onClick={goNext}
              disabled={!canMoveNext}
              className="gap-2 px-5"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
