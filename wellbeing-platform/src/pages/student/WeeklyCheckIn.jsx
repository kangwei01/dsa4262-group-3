import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  Heart,
  HeartPulse,
  Home,
  Mail,
  MessageSquareHeart,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useCurrentStudent, useResolveStudentIdentifier, useSubmitStudentCheckIn } from '@/hooks/useWellbeingData';
import {
  hasCompletedOnboarding,
  isQuestionAnswered,
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
  return {
    age: student?.baseline_responses?.age ?? student?.age ?? '',
    sex: student?.baseline_responses?.sex ?? '',
    fasholidays: student?.baseline_responses?.fasholidays ?? '',
    bodyweight: student?.baseline_responses?.bodyweight ?? '',
    bodyheight: student?.baseline_responses?.bodyheight ?? '',
  };
}

function getQuestionValue(question, baselineResponses, weeklyAnswers) {
  return question.cadence === 'one_time'
    ? baselineResponses[question.feature]
    : weeklyAnswers[question.feature];
}

function getGridColumns(optionCount) {
  if (optionCount === 2) return 'grid-cols-2';
  if (optionCount >= 8) return 'grid-cols-4';
  if (optionCount >= 7) return 'grid-cols-2 sm:grid-cols-4';
  if (optionCount === 6) return 'grid-cols-2 sm:grid-cols-3';
  if (optionCount === 5) return 'grid-cols-5';
  if (optionCount === 4) return 'grid-cols-2 sm:grid-cols-4';
  return 'grid-cols-3';
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
  const [freeText, setFreeText] = useState('');
  const [identifierInput, setIdentifierInput] = useState(studentIdentifier);

  useEffect(() => {
    if (!student) return;
    setBaselineResponses(getInitialBaselineResponses(student));
    setWeeklyAnswers({});
    setFreeText('');
    setStep(0);
  }, [student?.id]);

  useEffect(() => {
    setIdentifierInput(studentIdentifier);
  }, [studentIdentifier]);

  const handleIdentifierSubmit = async () => {
    const resolvedStudent = await resolveStudentIdentifier.mutateAsync(identifierInput);
    if (resolvedStudent?.student_identifier) {
      setStudentIdentifier(resolvedStudent.student_identifier);
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
                <h1 className="text-xl font-semibold text-foreground">Enter your student ID</h1>
                <p className="text-xs text-muted-foreground">
                  Use your school email or student ID so we can load your previous records.
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
              <p className="text-[11px] text-muted-foreground">
                If we do not find a profile yet, we will create one for this identifier and start tracking from there.
              </p>
            </div>

            <Button
              onClick={handleIdentifierSubmit}
              disabled={!String(identifierInput || '').trim() || resolveStudentIdentifier.isPending}
              className="w-full mt-5 gap-2"
            >
              {resolveStudentIdentifier.isPending ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
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

  const needsOnboarding = !student.onboarding_completed || !hasCompletedOnboarding(getInitialBaselineResponses(student));
  const questionFlow = [
    ...(needsOnboarding ? oneTimeQuestions : []),
    ...weeklyQuestions,
  ];

  const totalSteps = questionFlow.length + 1;
  const isLastStep = step === questionFlow.length;
  const currentQuestion = questionFlow[step];
  const currentValue = currentQuestion
    ? getQuestionValue(currentQuestion, baselineResponses, weeklyAnswers)
    : '';
  const progress = (step / totalSteps) * 100;
  const CategoryIcon = currentQuestion ? (categoryIcons[currentQuestion.category] || Heart) : Sparkles;
  const canMoveNext = isLastStep || isQuestionAnswered(currentQuestion, currentValue);

  const updateAnswer = (question, value) => {
    if (question.cadence === 'one_time') {
      setBaselineResponses((previous) => ({ ...previous, [question.feature]: value }));
    } else {
      setWeeklyAnswers((previous) => ({ ...previous, [question.feature]: value }));
    }
  };

  const handleChoiceSelect = (value) => {
    if (!currentQuestion) return;
    updateAnswer(currentQuestion, value);
    window.setTimeout(() => {
      setStep((currentStep) => Math.min(currentStep + 1, totalSteps - 1));
    }, 180);
  };

  const handleNumberChange = (event) => {
    if (!currentQuestion) return;
    updateAnswer(currentQuestion, event.target.value);
  };

  const handleSubmit = async () => {
    const result = await submitCheckIn.mutateAsync({
      studentId: student.id,
      answers: {
        baselineResponses,
        weeklyAnswers,
      },
      freeText,
    });

    navigate('/feedback', {
      state: {
        answers: weeklyAnswers,
        baselineResponses,
        score: result.computedScore,
      },
    });
  };

  const introText = needsOnboarding
    ? `First-time setup: ${oneTimeQuestions.length} profile questions once, then ${weeklyQuestions.length} weekly wellbeing questions.`
    : `${weeklyQuestions.length} weekly wellbeing questions based on the RF feature set in benrfv3.`;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-8 px-4">
      <div className="w-full max-w-3xl mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Weekly Check-in</h1>
            <p className="text-xs text-muted-foreground">
              {introText} Profile: {student.student_identifier || student.name}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>Signed in as {student.student_identifier || student.name}</span>
          <button
            onClick={clearStudentIdentifier}
            className="text-primary font-medium hover:underline"
          >
            Switch ID
          </button>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>
              {isLastStep
                ? 'Almost done'
                : `Question ${step + 1} of ${questionFlow.length}`}
            </span>
            <span>{Math.round(progress)}% complete</span>
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
          {!isLastStep ? (
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
                      {currentQuestion.cadence === 'one_time' ? 'Asked once' : 'Weekly'}
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold text-foreground mb-2 leading-snug">
                    {currentQuestion.question}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-8">
                    {currentQuestion.cadence === 'one_time'
                      ? 'We only ask this during setup unless you update your profile later.'
                      : 'Answer based on this week so the trend view stays accurate over time.'}
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
                          placeholder={currentQuestion.placeholder}
                          className="h-12 text-base"
                        />
                        {currentQuestion.suffix && (
                          <span className="text-sm text-muted-foreground">{currentQuestion.suffix}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-2">
                        Expected range: {currentQuestion.min} to {currentQuestion.max}{currentQuestion.suffix ? ` ${currentQuestion.suffix}` : ''}
                      </p>
                    </div>
                  ) : (
                    <div className={`grid gap-2 ${getGridColumns(currentQuestion.options.length)}`}>
                      {currentQuestion.options.map((option) => {
                        const isSelected = String(currentValue) === String(option.value);
                        return (
                          <button
                            key={String(option.value)}
                            onClick={() => handleChoiceSelect(option.value)}
                            className={`flex flex-col items-center gap-2 px-2 py-4 rounded-xl border-2 transition-all min-h-[92px] ${
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/40 hover:bg-secondary/60'
                            }`}
                          >
                            <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                              isSelected
                                ? 'bg-primary text-primary-foreground shadow-md'
                                : 'bg-secondary text-secondary-foreground'
                            }`}>
                              {option.value}
                            </span>
                            <span className={`text-[11px] font-medium text-center leading-tight ${
                              isSelected ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                              {option.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
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
                    <h2 className="text-xl font-semibold text-foreground">Anything you'd like to share?</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    This is optional. If there was something important behind your answers this week, you can add it here.
                  </p>
                  <Textarea
                    placeholder="E.g. 'Mocks were heavier than usual this week' or 'Had a difficult situation with a friend'..."
                    value={freeText}
                    onChange={(event) => setFreeText(event.target.value)}
                    className="min-h-[120px] resize-none text-sm"
                  />
                  <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Your responses feed the student support and teacher trend views, but students are not shown the score directly.</span>
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
            {isLastStep ? 'Free-text reflection' : `${currentQuestion.categoryLabel} · ${currentQuestion.label}`}
          </div>

          {isLastStep ? (
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
              onClick={() => setStep((currentStep) => Math.min(currentStep + 1, totalSteps - 1))}
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
