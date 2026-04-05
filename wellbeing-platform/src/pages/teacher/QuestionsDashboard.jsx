import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, CalendarClock, ListChecks, Sparkles } from 'lucide-react';
import {
  oneTimeQuestions,
  questionBankStats,
  weeklyQuestions,
} from '@/lib/rfModel';

function ResponseMeta({ item }) {
  if (item.responseType === 'number') {
    return (
      <p className="mt-3 text-xs text-muted-foreground">
        Accepted range: {item.min}-{item.max}{item.suffix ? ` ${item.suffix}` : ''}
      </p>
    );
  }

  if (!item.options?.length) return null;

  return (
    <div className="mt-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Answer options</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {item.options.map((option) => (
          <span
            key={`${item.feature}-${option.value}`}
            className="inline-flex items-center rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1 text-[11px] text-foreground"
          >
            {option.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function GroupedMeta({ item }) {
  if (!item.isGroupedComposite || !item.groupedFrom?.length) return null;

  return (
    <div className="mt-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Grouped from these HBSC items
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {item.groupedFrom.map((sourceLabel) => (
          <span
            key={`${item.feature}-${sourceLabel}`}
            className="inline-flex items-center rounded-full border border-primary/20 bg-primary/[0.05] px-2.5 py-1 text-[11px] text-foreground"
          >
            {sourceLabel}
          </span>
        ))}
      </div>
    </div>
  );
}

function QuestionRow({ item }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Badge variant="outline" className="text-[11px]">
          {item.categoryLabel}
        </Badge>
        {item.isGroupedComposite && (
          <Badge className="text-[11px] bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10">
            Grouped composite
          </Badge>
        )}
        <span className="text-[11px] text-muted-foreground">
          Source: {item.sourceCols.join(', ')}
        </span>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.question}</p>
          <GroupedMeta item={item} />
          <ResponseMeta item={item} />
        </div>
        <div className="text-right shrink-0">
          <p className="text-[11px] font-medium text-foreground uppercase tracking-wide">
            {item.cadence === 'one_time' ? 'Asked once' : 'Weekly'}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {item.aggregationMethod}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function QuestionsDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">RF Question Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            This page translates the `benrfv3` random-forest inputs into the survey design for the prototype:
            31 selected features, split into 5 onboarding questions and 26 weekly check-in questions, with grouped composites rephrased as umbrella questions instead of copying the raw HBSC item wording directly.
          </p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] px-4 py-3 max-w-sm">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Integration note</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The live student flow now follows this same question bank: one-time onboarding items are saved to the profile, and weekly items drive teacher scores, trends, and support prompts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Selected RF Features', value: questionBankStats.total, icon: Brain, tone: 'text-primary bg-primary/10' },
          { label: 'Asked Once', value: questionBankStats.oneTime, icon: CalendarClock, tone: 'text-sky-700 bg-sky-50' },
          { label: 'Weekly Questions', value: questionBankStats.weekly, icon: ListChecks, tone: 'text-amber-700 bg-amber-50' },
          { label: 'Grouped Composites', value: questionBankStats.groupedComposite, icon: Sparkles, tone: 'text-emerald-700 bg-emerald-50' },
          { label: 'Question Categories', value: questionBankStats.byCategory.length, icon: Sparkles, tone: 'text-emerald-700 bg-emerald-50' },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${stat.tone}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Category Coverage</h2>
              <p className="text-xs text-muted-foreground mt-1">
                The question bank balances physical signals, school climate, peer relationships, family support, and baseline context.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {questionBankStats.byCategory.map((item) => (
                <span
                  key={item.category}
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs text-foreground"
                >
                  <span className="font-semibold">{item.count}</span>
                  {item.label}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-secondary/30 border border-border/50 p-4">
            <p className="text-sm text-foreground leading-relaxed">
              Questions are grouped by cadence and category here, not by model weight. That keeps the survey design interpretable without exposing which items carry more influence in scoring.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground">Onboarding Questions</h2>
              <p className="text-xs text-muted-foreground mt-1">
                These 5 baseline inputs are collected once because they are slow-changing profile variables.
              </p>
            </div>
            <div className="space-y-3">
              {oneTimeQuestions.map((item) => (
                <QuestionRow key={item.feature} item={item} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground">Weekly Check-in Questions</h2>
              <p className="text-xs text-muted-foreground mt-1">
                These 26 questions are the recurring wellbeing indicators the model uses to track change over time.
              </p>
            </div>
            <div className="space-y-3 max-h-[72vh] overflow-y-auto pr-1">
              {weeklyQuestions.map((item) => (
                <QuestionRow key={item.feature} item={item} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
