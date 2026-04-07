import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, ArrowRight, BarChart3, BookOpen, CalendarClock, HeartHandshake, MessageSquare, Shield, UserCheck } from 'lucide-react';
import { questionBankStats, DISTRESS_THRESHOLD, HIGH_DISTRESS_THRESHOLD } from '@/lib/rfModel';

const systemOverview = [
  'Student fills a short survey',
  'Model detects patterns',
  'System flags concerns',
  'Teacher receives action guidance',
  'Teacher intervenes',
  'Student receives support',
];

const teacherFlow = [
  'Detect',
  'Decide',
  'Act',
  'Record',
  'Follow-up',
];

export default function SystemLogic() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground mb-2">How the Support Flow Works</h1>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          This page explains the current product logic behind the student check-in, teacher support workflow, and the monitor versus flag thresholds.
        </p>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">System overview</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {systemOverview.map((step, index) => (
              <div key={step} className="rounded-2xl border border-border/60 bg-card px-4 py-4">
                <p className="text-[11px] text-muted-foreground mb-1">Step {index + 1}</p>
                <p className="text-sm font-medium text-foreground">{step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/60">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Student Flow</h2>
            </div>
            <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
              <p className="text-sm text-foreground leading-relaxed">
                First-time onboarding explains why the platform exists, makes the support purpose clear, and asks for a simple consent click.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
              <p className="text-sm text-foreground leading-relaxed">
                The live questionnaire currently uses {questionBankStats.oneTime} asked-once item, {questionBankStats.weekly} weekly pulse items, and {questionBankStats.monthly} monthly refresh items.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
              <p className="text-sm text-foreground leading-relaxed">
                After submission, the student sees a short thank-you view with 1–2 support cards and simple next-step resources instead of a score.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Teacher Flow</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {teacherFlow.map((step) => (
                <span
                  key={step}
                  className="inline-flex items-center rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs text-foreground"
                >
                  {step}
                </span>
              ))}
            </div>
            <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
              <p className="text-sm text-foreground leading-relaxed">
                Teachers sign into a protected workspace, land on a low-load dashboard, drill into a student, see the main concern and recent trend, then choose a private check-in, monitoring follow-up, parent engagement, or counsellor escalation.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
              <p className="text-sm text-foreground leading-relaxed">
                Every teacher action is logged, follow-up reminders feed a queue, parent communication drafts go to an outbox, and counsellor escalations create a structured handoff file.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Threshold Framework</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Below monitor band</p>
              <p className="text-sm font-semibold text-foreground">Below {DISTRESS_THRESHOLD.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-2">Continue routine support and regular check-ins.</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Monitor band</p>
              <p className="text-sm font-semibold text-foreground">{DISTRESS_THRESHOLD.toFixed(2)} to {HIGH_DISTRESS_THRESHOLD.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-2">Start monitoring. Review again if the pattern keeps showing up.</p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
              <p className="text-xs font-semibold text-rose-700 uppercase tracking-wide mb-1">Flagged band</p>
              <p className="text-sm font-semibold text-foreground">{HIGH_DISTRESS_THRESHOLD.toFixed(2)} and above</p>
              <p className="text-xs text-muted-foreground mt-2">Prompt stronger attention, private teacher action, and escalation review if the pattern persists.</p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-border/60 bg-card p-4">
            <p className="text-sm text-foreground leading-relaxed">
              The current framework anchors monitoring at the 75th percentile and flagging at the 85th percentile, rather than using arbitrary fixed bands.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <HeartHandshake className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Automation Support</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { icon: MessageSquare, title: 'Support cards', desc: 'Students get concise post-submission insight cards.' },
              { icon: CalendarClock, title: 'Reminders', desc: 'Teacher follow-ups can be scheduled, queued, and reviewed from one place.' },
              { icon: UserCheck, title: 'Escalation package', desc: 'Counsellor escalation includes the student summary, check-ins, and teacher action history.' },
              { icon: Shield, title: 'Parent communication', desc: 'Neutral editable templates go into a tracked parent-communication outbox.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
                <item.icon className="w-4 h-4 text-primary mb-2" />
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Privacy and Transparency</h2>
          </div>
          <div className="space-y-2 text-sm text-foreground">
            <div className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span>Students are told clearly that teachers can see what they submit.</span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span>Teachers are reminded that responses are confidential and should be used for support purposes only.</span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span>The student-facing side avoids showing a score directly and focuses on support instead.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
