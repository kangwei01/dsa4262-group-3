import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, HeartHandshake, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { useCurrentStudent, useLatestStudentCheckIn } from '@/hooks/useWellbeingData';
import { buildSupportCardsFromSignals, deriveSignalsFromCheckInAnswers } from '@/lib/rfModel';
import { generalSupportResources } from '@/lib/wellbeingContent';

export default function Feedback() {
  const location = useLocation();
  const {
    studentIdentifier,
    clearStudentIdentifier,
    isLoading: isLoadingStudent,
    student,
  } = useCurrentStudent();
  const { data: latestCheckIn, isLoading: isLoadingLatestCheckIn } = useLatestStudentCheckIn(student?.id);

  const answers = location.state?.answers || {
    ...(latestCheckIn?.monthly_responses || {}),
    ...(latestCheckIn?.answers || {}),
  };
  const concernSignals = deriveSignalsFromCheckInAnswers(answers);
  const supportCards = concernSignals.length > 0
    ? buildSupportCardsFromSignals(concernSignals).slice(0, 2)
    : buildSupportCardsFromSignals([{ feature: 'sleepdificulty' }]).slice(0, 1);
  const savedStudentNote = latestCheckIn?.free_text || '';

  if (!location.state?.answers && (isLoadingStudent || isLoadingLatestCheckIn)) {
    return <div className="py-10 text-sm text-muted-foreground">Loading your support report…</div>;
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-start py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Thanks for checking in</h1>
            <p className="text-xs text-muted-foreground">
              Your answers help your teachers support you earlier and more clearly.
            </p>
            {studentIdentifier && (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">{studentIdentifier}</span>
                <button onClick={clearStudentIdentifier} className="text-[11px] text-primary font-medium hover:underline">
                  Switch ID
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="w-full max-w-5xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <HeartHandshake className="w-4 h-4 text-primary" />
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">What happens next</p>
          </div>
          <p className="text-base font-medium text-foreground leading-relaxed">
            This check-in is here to help you. If something seems heavier than usual, your teacher may follow up so support can happen earlier.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {supportCards.map((card, index) => (
            <motion.div
              key={card.featureId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + index * 0.06 }}
              className="rounded-3xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-widest">Top insight</p>
                  <h2 className="text-lg font-semibold text-foreground mt-1">{card.title}</h2>
                </div>
                <span className="text-[10px] uppercase tracking-wide font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {card.severity}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{card.summary}</p>

              <div className="mt-4 space-y-2">
                {card.actions.slice(0, 2).map((action) => (
                  <div key={action} className="flex items-start gap-2 rounded-2xl bg-secondary/30 px-3 py-3">
                    <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">{action}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/[0.03] px-4 py-3">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Why this matters for you</p>
                <p className="text-sm text-foreground leading-relaxed">{card.reachOut}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Simple resources you can use this week</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {generalSupportResources.map((resource) => (
              <div key={resource.title} className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
                <p className="text-sm font-semibold text-foreground">{resource.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{resource.description}</p>
                <div className="mt-3 space-y-2">
                  {resource.actions.map((action) => (
                    <div key={action} className="text-sm text-foreground flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {savedStudentNote && (
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Your saved note</p>
            <p className="text-sm text-foreground leading-relaxed">{savedStudentNote}</p>
          </div>
        )}

        <div className="flex items-start gap-2 px-1">
          <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            This page avoids showing a score directly. The goal is to keep the check-in helpful, simple, and not overwhelming.
          </p>
        </div>

        <div className="flex justify-end">
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors"
            >
              Done
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
}
