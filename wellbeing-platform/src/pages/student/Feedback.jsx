import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useCurrentStudent, useLatestStudentCheckIn } from '@/hooks/useWellbeingData';
import { buildSupportCardsFromSignals, deriveSignalsFromCheckInAnswers, deriveStrengthHighlights } from '@/lib/rfModel';

function deriveStrengthsFromAnswers(answers) {
  const featureHighlights = deriveStrengthHighlights(answers);

  if (featureHighlights.length > 0) {
    return featureHighlights.map((feature) => {
      if (['peer', 'family', 'school', 'digital'].includes(feature.category)) {
        return `${feature.label} still looks like a potential source of support this week.`;
      }

      if (feature.category === 'habits') {
        return `${feature.label} looks more steady right now, which can help protect your energy and mood.`;
      }

      return `${feature.label} appears relatively steadier this week than the areas that need more support.`;
    });
  }

  const fallbackStrengths = [];
  if ((answers?.q_social || 3) >= 4) fallbackStrengths.push('You still seem to have some social support around you.');
  if ((answers?.q_school_pressure || 3) >= 4) fallbackStrengths.push('Schoolwork feels relatively manageable right now.');
  if ((answers?.q_sleep || 3) <= 2) fallbackStrengths.push('Your sleep looks steadier than some students who need extra support.');
  if ((answers?.q_energy || 3) <= 2) fallbackStrengths.push('Your energy levels seem more stable this week.');

  if (fallbackStrengths.length === 0) {
    fallbackStrengths.push('Completing the check-in honestly is already a useful step toward support.');
  }

  return fallbackStrengths.slice(0, 2);
}

export default function Feedback() {
  const location = useLocation();
  const {
    student,
    studentIdentifier,
    clearStudentIdentifier,
    isLoading: isLoadingStudent,
  } = useCurrentStudent();
  const { data: latestCheckIn, isLoading: isLoadingLatestCheckIn } = useLatestStudentCheckIn(student?.id);
  const answers = location.state?.answers || latestCheckIn?.answers || {};
  const concernSignals = deriveSignalsFromCheckInAnswers(answers);
  const supportCards = concernSignals.length > 0
    ? buildSupportCardsFromSignals(concernSignals)
    : buildSupportCardsFromSignals([{ feature: 'grp_bfast' }, { feature: 'grp_friend' }]);
  const strengths = deriveStrengthsFromAnswers(answers);
  const showReachOutPrompt = concernSignals.some((signal) => signal.severity === 'high');
  const reportContext = latestCheckIn?.week
    ? `Based on your latest saved check-in from ${latestCheckIn.week}`
    : 'Personalised guidance based on this week’s check-in';

  const intro = concernSignals.length > 0
    ? `A few parts of this week may have felt heavier than usual, especially around ${supportCards.map((card) => card.featureLabel.toLowerCase()).slice(0, 2).join(' and ')}. Instead of showing a score, we’re surfacing the areas where support could help most.`
    : 'Nothing in this week’s check-in points to a strong distress pattern right now. We’ll still highlight a couple of helpful routines you can keep using.';

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
            <h1 className="text-xl font-semibold text-foreground">Your support report</h1>
            <p className="text-xs text-muted-foreground">{reportContext}</p>
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

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-5"
        >
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">What stood out</h2>
            <p className="text-base font-medium text-foreground leading-relaxed">{intro}</p>

            <div className="mt-5">
              <p className="text-xs font-semibold text-muted-foreground mb-3">What still looks supportive</p>
              <div className="space-y-2">
                {strengths.map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-emerald-800">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/40 p-5">
            <div className="flex items-center gap-2 mb-2">
              <HeartHandshake className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold text-primary uppercase tracking-widest">If you need more support</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You do not need to “prove” that things are bad enough before asking for help. A teacher, counsellor, parent, or trusted adult can help you sort out what kind of support would feel useful.
            </p>
            <div className="mt-3 flex items-center gap-2 text-primary text-xs font-medium">
              <MessageCircle className="w-3.5 h-3.5" />
              Start with one person you feel safest talking to
            </div>
          </div>

          <div className="flex items-start gap-2 px-1">
            <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              This page avoids showing your score directly. The goal is to offer support without making the check-in feel judgmental or overwhelming.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col gap-5"
        >
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Targeted help for this week</h2>
            <div className="space-y-4">
              {supportCards.map((card, index) => (
                <motion.div
                  key={card.featureId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.08 }}
                  className="rounded-2xl border border-border/60 bg-secondary/20 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{card.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{card.featureLabel}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wide font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {card.severity}
                    </span>
                  </div>

                  <p className="text-sm text-foreground mt-3 leading-relaxed">{card.summary}</p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{card.methodology}</p>

                  <div className="mt-3 space-y-2">
                    {card.actions.map((action) => (
                      <div key={action} className="flex items-start gap-2 text-sm text-foreground">
                        <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-xl border border-primary/15 bg-primary/[0.03] px-3 py-2">
                    <p className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-1">When to reach out</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{card.reachOut}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {showReachOutPrompt && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-2">Extra support may help</p>
              <p className="text-sm text-amber-900 leading-relaxed">
                Some of your answers suggest this week may have been genuinely heavy. If that feels true, tell one trusted adult sooner rather than later. You do not have to carry it alone for another week first.
              </p>
            </div>
          )}

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
        </motion.div>
      </div>
    </div>
  );
}
