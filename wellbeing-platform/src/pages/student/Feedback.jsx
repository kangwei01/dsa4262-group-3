import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Phone, Globe, MessageCircleMore } from 'lucide-react';
import { useCurrentStudent, useLatestStudentCheckIn, useStudentCheckIns } from '@/hooks/useWellbeingData';
import {
  buildSupportCardsFromSignals,
  deriveSignalsFromCheckInAnswers,
  getSupportCategoryForFeature,
  HELPLINE_DIRECTORY,
} from '@/lib/rfModel';

function buildAnswers(locationState, latestCheckIn) {
  if (locationState?.answers) return locationState.answers;
  return {
    ...(latestCheckIn?.monthly_responses || {}),
    ...(latestCheckIn?.answers || {}),
  };
}

export default function Feedback() {
  const location = useLocation();
  const { student, studentIdentifier, clearStudentIdentifier, isLoading: studentLoading } = useCurrentStudent();
  const { data: latestCheckIn, isLoading: latestLoading } = useLatestStudentCheckIn(student?.id);
  const { data: checkIns = [], isLoading: checkInsLoading } = useStudentCheckIns(student?.id);

  if (!location.state?.answers && (studentLoading || latestLoading || checkInsLoading)) {
    return <div className="py-10 text-sm text-muted-foreground">Loading your support cards…</div>;
  }

  const answers = buildAnswers(location.state, latestCheckIn);
  const currentSignals = deriveSignalsFromCheckInAnswers(answers);
  const priorSignalSets = checkIns
    .slice(1)
    .map((checkIn) => {
      const signalAnswers = {
        ...(checkIn.monthly_responses || {}),
        ...(checkIn.answers || {}),
      };
      return deriveSignalsFromCheckInAnswers(signalAnswers)
        .map((signal) => getSupportCategoryForFeature(signal.feature))
        .filter(Boolean);
    });
  const supportCards = buildSupportCardsFromSignals(
    currentSignals.length > 0 ? currentSignals : [{ feature: 'schoolpressure', severity: 'medium' }],
    priorSignalSets,
  );

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-start py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Thanks for checking in</h1>
            <p className="text-sm text-muted-foreground">This helps your teachers support you better.</p>
            <p className="text-xs text-muted-foreground mt-1">If something seems off, your teacher may check in with you.</p>
            {studentIdentifier && (
              <div className="mt-2 flex items-center gap-2">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {supportCards.map((card, index) => (
            <motion.div
              key={`${card.category}-${index}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + index * 0.06 }}
              className="rounded-[28px] border border-border bg-card p-6 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">{card.categoryLabel}</p>
              <h2 className="text-xl font-semibold text-foreground mt-2">{card.title}</h2>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{card.summary}</p>
              <a
                href={card.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-5 hover:underline"
              >
                Read more
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>

        <div className="rounded-[32px] border border-border bg-[#f7f0df] px-6 py-7 shadow-sm">
          <h2 className="text-3xl font-semibold text-foreground">First Stop for Mental Health</h2>
          <p className="text-sm text-foreground/80 mt-3">{HELPLINE_DIRECTORY.intro}</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-foreground/20 bg-white/40 px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-foreground" />
                <span className="text-sm font-medium text-foreground">National mindline (24-hour)</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{HELPLINE_DIRECTORY.mindlineCall}</span>
            </div>
            <div className="rounded-2xl border border-foreground/20 bg-white/40 px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MessageCircleMore className="w-4 h-4 text-foreground" />
                <span className="text-sm font-medium text-foreground">WhatsApp</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{HELPLINE_DIRECTORY.mindlineWhatsapp}</span>
            </div>
            <div className="rounded-2xl border border-foreground/20 bg-white/40 px-5 py-4 flex items-center justify-between gap-3 md:col-span-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-foreground" />
                <span className="text-sm font-medium text-foreground">mindline.sg</span>
              </div>
              <a
                href={HELPLINE_DIRECTORY.mindlineSite}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-foreground hover:underline"
              >
                free online mental health support
              </a>
            </div>
          </div>
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
