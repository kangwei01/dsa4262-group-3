import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';

// Custom tooltip
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

// Detect if last 3 weeks are all increasing
const getSustainedAnnotation = (weeklyScores) => {
  if (weeklyScores.length < 3) return null;
  const last3 = weeklyScores.slice(-3);
  const allUp = last3[0].score < last3[1].score && last3[1].score < last3[2].score;
  if (allUp) return { weeks: last3.map(w => w.week) };
  return null;
};

export default function RiskChart({ weeklyScores }) {
  const sustained = getSustainedAnnotation(weeklyScores);

  return (
    <div>
      {sustained && (
        <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
          Sustained increase detected over the past 3 weeks — this is a key signal.
        </div>
      )}
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

            {/* Zone bands */}
            <ReferenceArea y1={0} y2={35} fill="#10b981" fillOpacity={0.04} />
            <ReferenceArea y1={35} y2={60} fill="#f59e0b" fillOpacity={0.05} />
            <ReferenceArea y1={60} y2={100} fill="#f87171" fillOpacity={0.06} />

            <ReferenceLine y={60} stroke="#f87171" strokeDasharray="5 3" strokeWidth={1.5}
              label={{ value: 'High', position: 'right', fontSize: 10, fill: '#f87171' }}
            />
            <ReferenceLine y={35} stroke="#f59e0b" strokeDasharray="5 3" strokeWidth={1.5}
              label={{ value: 'Medium', position: 'right', fontSize: 10, fill: '#f59e0b' }}
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

      {/* Past 3 weeks summary */}
      <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground border-t border-border/50 pt-3">
        <span className="font-medium text-foreground">Past 3 weeks:</span>
        {weeklyScores.slice(-3).map((w, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="font-medium text-foreground">{w.week}</span>
            <span className={`font-bold ${
              w.score >= 60 ? 'text-rose-600' : w.score >= 35 ? 'text-amber-600' : 'text-emerald-600'
            }`}>{w.score}</span>
          </span>
        ))}
      </div>
    </div>
  );
}