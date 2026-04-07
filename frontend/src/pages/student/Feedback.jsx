import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, BookOpen, Brain, Zap, Users, Lightbulb, ArrowRight, ShieldCheck, CheckCircle2, MessageCircle, Sparkles } from 'lucide-react';

// Derive trend insight and focus areas from answers — no risk labels shown to student
const getTrendInsight = (score, answers) => {
  const sleepBad = (answers?.q_sleep || 3) >= 4;
  const energyBad = (answers?.q_energy || 3) >= 4;
  const workloadBad = (answers?.q_school_pressure || 3) <= 2;
  const focusBad = (answers?.q_focus || 3) >= 4;
  const stressBad = (answers?.q_overwhelmed || 3) >= 4;
  const socialLow = (answers?.q_social || 3) <= 2;

  if (sleepBad && energyBad) return "You've been feeling more tired than usual recently — both your sleep and energy seem to have dipped.";
  if (workloadBad && stressBad) return "Your schoolwork has felt harder to manage over the past few weeks. That's a common feeling, especially during busy periods.";
  if (focusBad) return "Concentrating on things has felt more difficult this week. That can happen when your mind has a lot to carry.";
  if (socialLow) return "You've been feeling a bit less connected to people around you lately. That's worth paying attention to.";
  if (score > 55) return "We've noticed some changes in your recent responses — things seem a bit more demanding right now.";
  if (score < 35) return "Your responses have been quite stable this week — that's a good sign.";
  return "Things look reasonably balanced this week. Keep an eye on how you're feeling day to day.";
};

const getFocusAreas = (answers) => {
  const areas = [];
  if ((answers?.q_sleep || 3) >= 4) areas.push({ label: 'Sleep', icon: Moon });
  if ((answers?.q_school_pressure || 3) <= 2) areas.push({ label: 'School workload', icon: BookOpen });
  if ((answers?.q_focus || 3) >= 4) areas.push({ label: 'Concentration', icon: Brain });
  if ((answers?.q_energy || 3) >= 4) areas.push({ label: 'Energy levels', icon: Zap });
  if ((answers?.q_social || 3) <= 2) areas.push({ label: 'Social support', icon: Users });
  return areas.slice(0, 2);
};

const getMicroActions = (answers, score) => {
  const sleepBad = (answers?.q_sleep || 3) >= 4;
  const energyBad = (answers?.q_energy || 3) >= 4;
  const workloadBad = (answers?.q_school_pressure || 3) <= 2;
  const stressBad = (answers?.q_overwhelmed || 3) >= 4;
  const focusBad = (answers?.q_focus || 3) >= 4;

  const suggestions = [];

  if (sleepBad || energyBad) {
    suggestions.push({ icon: Moon, title: 'Try sleeping 20–30 minutes earlier tonight', desc: 'Even a small shift in bedtime can noticeably improve how rested you feel.' });
    suggestions.push({ icon: Moon, title: 'Avoid screens 30 minutes before bed', desc: 'Blue light from phones can delay sleep even when you\'re tired.' });
  }
  if (workloadBad || stressBad) {
    suggestions.push({ icon: BookOpen, title: 'Break tasks into smaller steps', desc: 'A long to-do list can feel overwhelming. Tackling one small thing at a time helps.' });
    suggestions.push({ icon: Zap, title: 'Take a short break every 30–40 minutes', desc: 'Short rest periods help you absorb more and feel less drained.' });
  }
  if (focusBad) {
    suggestions.push({ icon: Brain, title: 'Try removing distractions for just 20 minutes', desc: 'Phone face-down, one tab open. Even a short focused block builds momentum.' });
  }
  if (suggestions.length === 0) {
    suggestions.push({ icon: Sparkles, title: 'Keep up your current routine', desc: 'Your responses suggest things are going well. Small consistent habits make a big difference.' });
    suggestions.push({ icon: Users, title: 'Stay connected to people you trust', desc: 'Regular time with friends or family supports wellbeing even on quieter weeks.' });
  }
  return suggestions.slice(0, 3);
};

export default function Feedback() {
  const location = useLocation();
  const score = location.state?.score || 40;
  const answers = location.state?.answers || {};
  const insight = getTrendInsight(score, answers);
  const focusAreas = getFocusAreas(answers);
  const microActions = getMicroActions(answers, score);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-start py-8 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl mb-6"
      >
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
            className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"
          >
            <CheckCircle2 className="w-5 h-5 text-accent" />
          </motion.div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Your weekly check-in summary</h1>
            <p className="text-xs text-muted-foreground">Based on your responses just now</p>
          </div>
        </div>
      </motion.div>

      {/* Desktop split panel */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: What we noticed */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-5"
        >
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">What we noticed</h2>

            {/* Trend insight — descriptive, no risk label */}
            <div className="mb-6">
              <p className="text-base font-medium text-foreground leading-relaxed">{insight}</p>
            </div>

            {/* Focus areas */}
            {focusAreas.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-3">Area{focusAreas.length > 1 ? 's' : ''} to pay attention to</p>
                <div className="flex flex-wrap gap-2">
                  {focusAreas.map((area, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 + i * 0.08 }}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium"
                    >
                      <area.icon className="w-3.5 h-3.5" />
                      {area.label}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {focusAreas.length === 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">No major areas of concern this week</span>
              </div>
            )}
          </div>

          {/* Support note — subtle, not alarming */}
          <div className="rounded-2xl border border-border bg-secondary/40 p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">If you need more support</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              If things feel overwhelming, you can talk to a teacher you trust — or visit the school counsellor. You don't need to have everything figured out first.
            </p>
            <div className="flex items-center gap-2 text-primary text-xs font-medium">
              <MessageCircle className="w-3.5 h-3.5" />
              School counsellors are available Monday–Friday
            </div>
          </div>

          {/* Privacy note */}
          <div className="flex items-start gap-2 px-1">
            <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Your responses are used to help support your wellbeing and are only visible to your teachers. No diagnostic labels are ever applied.
            </p>
          </div>
        </motion.div>

        {/* RIGHT: What you can try */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col gap-5"
        >
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex-1">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Small steps you can try this week</h2>
            <div className="space-y-3">
              {microActions.map((action, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/20 hover:bg-secondary/80 transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <action.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{action.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{action.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Optional reflection prompt */}
          <div className="rounded-2xl border border-primary/20 bg-primary/[0.02] p-5">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs font-semibold text-primary">Reflection (optional)</p>
            </div>
            <p className="text-sm text-muted-foreground italic">
              "What's one small thing you'd like to improve next week?"
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              You don't need to answer this — it's just something to think about.
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
        </motion.div>
      </div>
    </div>
  );
}