import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, AlertTriangle, TrendingUp, Zap, Eye, MessageSquare, UserCheck, Brain, BarChart3, Shield, RefreshCw, Clock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip } from 'recharts';

const flowSteps = [
  { icon: Brain, title: '1. Student Input', desc: 'One-time onboarding plus 26 weekly RF questions covering physical wellbeing, habits, school, peer support, family connection, online life, and body image.', color: 'bg-primary/10 text-primary border-primary/20' },
  { icon: BarChart3, title: '2. Model Processing', desc: 'Weekly responses plus saved baseline context are scored into a distress score (0–100). Historical data builds a trajectory profile.', color: 'bg-primary/10 text-primary border-primary/20' },
  { icon: AlertTriangle, title: '3. Signal Generation', desc: 'Three signal types: threshold exceeded, sustained upward trend, or sudden spike.', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { icon: Eye, title: '4. Teacher Decision Support', desc: 'Flagged students surface on the dashboard with ranked factors and a recommended action.', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { icon: MessageSquare, title: '5. Teacher Action', desc: 'Teacher performs a guided check-in or escalates. Conversation prompts and do/don\'t guidance provided.', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { icon: Shield, title: '6. Outcome Logging', desc: 'Teacher records the outcome (improved / same / worse) with notes after each interaction.', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { icon: RefreshCw, title: '7. Feedback Loop', desc: 'Logged outcomes feed back into the model. The system learns which signals lead to meaningful change.', color: 'bg-primary/10 text-primary border-primary/20' },
];

const silentStruggler = [
  { week: 'W1', score: 32 }, { week: 'W2', score: 36 }, { week: 'W3', score: 40 },
  { week: 'W4', score: 46 }, { week: 'W5', score: 52 }, { week: 'W6', score: 58 },
];

const temporaryStress = [
  { week: 'W1', score: 28 }, { week: 'W2', score: 30 }, { week: 'W3', score: 62 },
  { week: 'W4', score: 52 }, { week: 'W5', score: 33 }, { week: 'W6', score: 29 },
];

const MiniChart = ({ data, color = 'hsl(215, 72%, 52%)' }) => (
  <ResponsiveContainer width="100%" height={80}>
    <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
      <defs>
        <linearGradient id={`grad_${color.replace(/[^a-z]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.2} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <XAxis dataKey="week" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
      <YAxis domain={[0, 100]} hide />
      <ReferenceLine y={60} stroke="#f87171" strokeDasharray="3 2" strokeWidth={1} />
      <ReferenceLine y={35} stroke="#f59e0b" strokeDasharray="3 2" strokeWidth={1} />
      <Tooltip contentStyle={{ fontSize: 10, borderRadius: 6, padding: '4px 8px' }} />
      <Area type="monotone" dataKey="score" stroke={color} fill={`url(#grad_${color.replace(/[^a-z]/gi, '')})`} strokeWidth={2} dot={{ r: 2.5, fill: color }} />
    </AreaChart>
  </ResponsiveContainer>
);

export default function SystemLogic() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-semibold text-foreground mb-2">How MindBridge Works</h1>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          This system transforms student self-reported behavioural data into interpretable signals that guide teachers in making timely, appropriate interventions.
        </p>
      </div>

      {/* System flow */}
      <div className="mb-12">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">System Flow</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {flowSteps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-0"
            >
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${step.color}`}>
                  <step.icon className="w-4.5 h-4.5" />
                </div>
                {i < flowSteps.length - 1 && (
                  <div className="hidden lg:block w-px h-full bg-border" />
                )}
              </div>
              <div className="ml-3 pb-6 pr-4">
                <h3 className="font-semibold text-xs text-foreground leading-tight">{step.title}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ⬛ TIME DIMENSION — detecting trajectories, not snapshots */}
      <div className="mb-12">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Time Dimension — Trajectories, Not Snapshots</h2>
        <p className="text-sm text-muted-foreground mb-5">The system doesn't act on a single data point. It tracks how a student's score moves over time. This is what prevents false alarms and catches silent struggles.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Past 3 weeks</span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-1">
                The system checks whether scores in the <strong>most recent 3 weeks</strong> are all moving upward. If yes → sustained trend signal triggered.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-semibold text-foreground">Threshold timing</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                A single high score triggers a monitoring flag only. Escalation requires <strong>sustained elevation</strong> — reducing false alarms from exam weeks or one-off events.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-semibold text-foreground">Recovery tracking</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                If scores return to baseline after a spike, the system <strong>de-escalates</strong> automatically — confirming the issue was temporary.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Signal definitions */}
      <div className="mb-12">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">Signal Definitions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Signal 1: Threshold Exceeded', desc: 'Distress score surpasses 60/100 in a single week. Triggers monitoring.', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-200' },
            { title: 'Signal 2: Sustained Trend', desc: 'Score increases for 3+ consecutive weeks — even below 60. Key early-warning signal.', icon: TrendingUp, color: 'text-amber-600 bg-amber-50 border-amber-200' },
            { title: 'Signal 3: Sudden Spike', desc: 'Score jumps by >20 points in one week. Prompts same-week teacher check.', icon: Zap, color: 'text-primary bg-primary/5 border-primary/20' },
          ].map((sig, i) => (
            <Card key={i} className={`border ${sig.color}`}>
              <CardContent className="p-4">
                <sig.icon className="w-5 h-5 mb-2" />
                <h3 className="font-semibold text-sm mb-1">{sig.title}</h3>
                <p className="text-xs opacity-80 leading-relaxed">{sig.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Decision logic — visual */}
      <div className="mb-12">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">Decision Logic</h2>
        <div className="flex flex-col sm:flex-row items-stretch gap-0">
          {[
            { range: '0 – 35', label: 'Low', action: 'Continue Monitoring', icon: Eye, from: 'border-emerald-200 bg-emerald-50/60 text-emerald-700', arrow: 'text-muted-foreground', desc: 'Weekly tracking continues. No teacher action needed.' },
            { range: '35 – 60', label: 'Medium', action: 'Teacher Check-in', icon: MessageSquare, from: 'border-amber-200 bg-amber-50/60 text-amber-700', arrow: 'text-muted-foreground', desc: 'Guided prompts sent to teacher for a supportive conversation.' },
            { range: '60 – 100', label: 'High', action: 'Counsellor Referral', icon: UserCheck, from: 'border-rose-200 bg-rose-50/60 text-rose-700', arrow: 'text-muted-foreground', desc: 'Auto-generated summary created. Immediate referral recommended.' },
          ].map((item, i) => (
            <div key={i} className="flex items-center flex-1">
              <Card className={`border flex-1 ${item.from}`}>
                <CardContent className="p-4">
                  <item.icon className="w-5 h-5 mb-2" />
                  <p className="text-xs font-bold mb-0.5">{item.range}</p>
                  <p className="text-sm font-semibold mb-1">{item.action}</p>
                  <p className="text-[11px] opacity-80 leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
              {i < 2 && <ArrowRight className="w-5 h-5 text-muted-foreground mx-2 shrink-0 hidden sm:block" />}
            </div>
          ))}
        </div>
      </div>

      {/* Edge cases with mini charts */}
      <div className="mb-12">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">Edge Case Handling</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Card className="border-primary/20">
            <CardContent className="p-5">
              <h3 className="font-semibold text-sm text-foreground mb-1">🤫 Silent Struggler</h3>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                No obvious classroom signals. Score rises steadily but never hits 60 in one week. Only Signal 2 (sustained trend) catches this.
              </p>
              <MiniChart data={silentStruggler} color="hsl(215, 72%, 52%)" />
              <div className="mt-2 flex items-center gap-2 text-[11px] text-primary bg-primary/5 rounded-lg px-3 py-2">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                Flagged at W4 by sustained trend — before threshold is ever crossed
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-200">
            <CardContent className="p-5">
              <h3 className="font-semibold text-sm text-foreground mb-1">📝 Temporary Stress (Exam Week)</h3>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Score spikes above 60 during exam week but returns to baseline the following week. System monitors but does not escalate.
              </p>
              <MiniChart data={temporaryStress} color="#f59e0b" />
              <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                <Shield className="w-3 h-3 shrink-0" />
                Score returns to baseline by W5 — signal de-escalated, no referral triggered
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trust & Ethics */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">Trust & Ethics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { title: 'Privacy First', desc: 'Students see only their own reflections. Teachers see trend signals — never raw responses. No student sees another\'s data.', icon: Shield },
            { title: 'Minimal Data Exposure', desc: 'Free-text responses are not surfaced to teachers automatically. Only derived signals are used.', icon: Eye },
            { title: 'No Diagnostic Labels', desc: 'Students never see risk scores or clinical labels. Language is descriptive, not evaluative.', icon: UserCheck },
          ].map((item, i) => (
            <Card key={i} className="border-border/50 bg-secondary/30">
              <CardContent className="p-4">
                <item.icon className="w-5 h-5 text-primary mb-2" />
                <h3 className="font-semibold text-xs text-foreground mb-1">{item.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
