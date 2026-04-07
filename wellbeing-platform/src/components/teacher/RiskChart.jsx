import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import {
  DISTRESS_THRESHOLD,
  HIGH_DISTRESS_THRESHOLD,
  getConsecutiveDistressWeeks,
  hasSustainedIncrease,
  hasThreeWeekDistressFlag,
} from '@/lib/rfModel';
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        <p className="text-primary">Score: <span className="font-bold">{payload[0]?.value}</span></p>
      </div>
    );
  }
  return null;
};

export default function RiskChart({ weeklyScores }) {
  const sustained = hasSustainedIncrease(weeklyScores);
  const distressStreak = getConsecutiveDistressWeeks(weeklyScores);
  const hasDistressFlag = hasThreeWeekDistressFlag(weeklyScores);

  return (
    <div>
      <div className="space-y-2 mb-3">
        {hasDistressFlag && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            {distressStreak} consecutive weeks in the monitoring band ({DISTRESS_THRESHOLD.toFixed(2)}+).
          </div>
        )}
        {sustained && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
            Sustained increase detected over the past 3 weeks.
          </div>
        )}
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weeklyScores} margin={{ top: 8, right: 40, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(215, 72%, 52%)" stopOpacity={0.18} />
                <stop offset="95%" stopColor="hsl(215, 72%, 52%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="warnGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceArea y1={0} y2={DISTRESS_THRESHOLD} fill="#10b981" fillOpacity={0.04} />
            <ReferenceArea y1={DISTRESS_THRESHOLD} y2={HIGH_DISTRESS_THRESHOLD} fill="#f59e0b" fillOpacity={0.05} />
            <ReferenceArea y1={HIGH_DISTRESS_THRESHOLD} y2={100} fill="#f87171" fillOpacity={0.06} />

            <ReferenceLine y={HIGH_DISTRESS_THRESHOLD} stroke="#f87171" strokeDasharray="5 3" strokeWidth={1.5}
              label={{ value: 'Flag', position: 'right', fontSize: 10, fill: '#f87171' }}
            />
            <ReferenceLine y={DISTRESS_THRESHOLD} stroke="#f59e0b" strokeDasharray="5 3" strokeWidth={1.5}
              label={{ value: 'Monitor', position: 'right', fontSize: 10, fill: '#f59e0b' }}
            />

            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(215, 72%, 52%)"
              fill="url(#riskGrad)"
              strokeWidth={2.5}
              dot={{ fill: 'hsl(215, 72%, 52%)', r: 4, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, stroke: 'hsl(215, 72%, 52%)', strokeWidth: 2, fill: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground border-t border-border/50 pt-3">
        <span className="font-medium text-foreground">Past 3 weeks:</span>
        {weeklyScores.slice(-3).map((w, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="font-medium text-foreground">{w.week}</span>
            <span className={`font-bold ${
              w.score >= HIGH_DISTRESS_THRESHOLD ? 'text-rose-600' : w.score >= DISTRESS_THRESHOLD ? 'text-amber-600' : 'text-emerald-600'
            }`}>{w.score}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
