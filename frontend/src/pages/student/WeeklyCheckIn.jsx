import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, BookOpen, Users, Zap, Brain, ChevronRight, ChevronLeft, Send, Sparkles, Heart, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Behavioural + indirect questions — no mental health labels
const questions = [
  {
    id: 'q_sleep',
    text: 'How often did you have difficulty falling asleep this week?',
    subtext: 'Think about how long it took you to drift off most nights.',
    icon: Moon,
    category: 'sleep',
    inverted: true, // high frequency = worse
  },
  {
    id: 'q_energy',
    text: 'How often did you feel tired during the day this week?',
    subtext: 'Even after a full night\'s sleep, did you still feel drained?',
    icon: Zap,
    category: 'energy',
    inverted: true,
  },
  {
    id: 'q_school_pressure',
    text: 'How manageable did your schoolwork feel this week?',
    subtext: 'Did deadlines and tasks feel on top of you, or under control?',
    icon: BookOpen,
    category: 'workload',
    inverted: false, // "always manageable" = better, but question is positive so non-inverted: high = good
    positiveScale: true, // Never manageable → Always manageable
  },
  {
    id: 'q_focus',
    text: 'How often did you find it hard to concentrate in class or while studying?',
    subtext: 'Did your mind wander, or were you able to stay on task?',
    icon: Brain,
    category: 'focus',
    inverted: true,
  },
  {
    id: 'q_social',
    text: 'How supported did you feel by your friends this week?',
    subtext: 'Did you feel connected and understood by people around you?',
    icon: Users,
    category: 'social',
    positiveScale: true,
  },
  {
    id: 'q_overwhelmed',
    text: 'How often did you feel stressed this week?',
    subtext: 'This could be about school, home, or anything else on your mind.',
    icon: Brain,
    category: 'stress',
    inverted: true,
  },
];

// Horizontal option labels — framed as frequency, not intensity
const getOptions = (q) => {
  if (q.positiveScale) {
    return ['Not at all', 'Rarely', 'Sometimes', 'Often', 'Always'];
  }
  return ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];
};

export default function WeeklyCheckIn() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [freeText, setFreeText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const totalSteps = questions.length + 1;
  const isLastQuestion = step === questions.length;
  const currentQ = questions[step];
  const progress = ((step) / totalSteps) * 100;
  const options = !isLastQuestion ? getOptions(currentQ) : [];

  const handleSelect = (value) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
    setTimeout(() => {
      if (step < totalSteps - 1) setStep(s => s + 1);
    }, 280);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const weekStr = new Date().toISOString().split('T')[0];
    let total = 0;
    questions.forEach(q => {
      const val = answers[q.id] || 3;
      if (q.positiveScale) {
        total += (6 - val); // high support = low distress
      } else if (q.inverted) {
        total += val; // high frequency of bad thing = worse
      } else {
        total += val;
      }
    });
    const computedScore = Math.round((total / (questions.length * 5)) * 100);

    await base44.entities.StudentCheckIn.create({
      student_id: 'demo_student',
      week: weekStr,
      ...answers,
      free_text: freeText,
      computed_score: computedScore,
    });

    navigate('/feedback', { state: { score: computedScore, answers } });
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-8 px-4">
      {/* Intro header */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Weekly Check-in</h1>
            <p className="text-xs text-muted-foreground">Takes about 2 minutes · No right or wrong answers</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>{isLastQuestion ? 'Almost done' : `Question ${step + 1} of ${questions.length}`}</span>
            <span>{Math.round((step / totalSteps) * 100)}% complete</span>
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

      {/* Question card */}
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {!isLastQuestion ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22 }}
            >
              <Card className="border border-border shadow-lg shadow-primary/5">
                <CardContent className="p-8">
                  {/* Category chip */}
                  <div className="mb-5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/8 px-2.5 py-1 rounded-full border border-primary/15">
                      {React.createElement(currentQ.icon, { className: 'w-3 h-3' })}
                      {currentQ.category.charAt(0).toUpperCase() + currentQ.category.slice(1)}
                    </span>
                  </div>

                  {/* Question text */}
                  <h2 className="text-xl font-semibold text-foreground mb-2 leading-snug">
                    {currentQ.text}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-8">{currentQ.subtext}</p>

                  {/* Horizontal Likert options */}
                  <div className="grid grid-cols-5 gap-2">
                    {options.map((label, i) => {
                      const value = i + 1;
                      const isSelected = answers[currentQ.id] === value;
                      return (
                        <button
                          key={i}
                          onClick={() => handleSelect(value)}
                          className={`flex flex-col items-center gap-2 px-2 py-4 rounded-xl border-2 transition-all ${
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
                            {value}
                          </span>
                          <span className={`text-[11px] font-medium text-center leading-tight ${
                            isSelected ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
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
                    This is completely optional. You might want to mention something specific about your week — or leave it blank. Either is fine.
                  </p>
                  <Textarea
                    placeholder="E.g. 'I've been feeling stressed about mocks' or 'Had a tough week with a friend'..."
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    className="min-h-[120px] resize-none text-sm"
                  />
                  <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Your response is only visible to your wellbeing teacher, not stored publicly.</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-5">
          <Button
            variant="ghost"
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="gap-2 text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i < step ? 'bg-primary' : i === step ? 'bg-primary/50 w-4' : 'bg-border'
                }`}
              />
            ))}
          </div>

          {isLastQuestion ? (
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2 px-6">
              {submitting ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Submit
            </Button>
          ) : (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!answers[currentQ?.id]}
              className="gap-2"
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