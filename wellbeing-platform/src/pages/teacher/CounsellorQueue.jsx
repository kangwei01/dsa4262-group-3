import { Card, CardContent } from '@/components/ui/card';
import { useCounsellorCases } from '@/hooks/useWellbeingData';
import { useTeacherAccess } from '@/lib/TeacherAccessContext';

export default function CounsellorQueue() {
  const { teacher } = useTeacherAccess();
  const { data: cases = [], isLoading } = useCounsellorCases(teacher);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Counsellor</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Students with status &quot;Referred&quot; appear here with the packaged summary the counsellor receives.
        </p>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-5">
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-6">Loading counsellor referrals…</p>
          ) : cases.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6">No referred students yet.</p>
          ) : (
            <div className="space-y-4">
              {cases.map((record) => (
                <div key={record.id || `${record.student_id}-${record.created_at}`} className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{record.student_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Referred {new Date(record.created_at).toLocaleString()} by {record.teacher_email}
                    </p>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{record.summary}</p>
                  <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4 space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Classification summary</p>
                      <p className="text-sm text-foreground mt-2">
                        Support band: {record.payload?.overview?.support_band || 'unknown'}
                        {' · '}
                        Confidence: {record.payload?.overview?.model_confidence ? `${record.payload.overview.model_confidence}%` : 'Unavailable'}
                        {' · '}
                        Trend: {record.payload?.overview?.trend || 'stable'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Student note</p>
                      <p className="text-sm text-foreground mt-2 leading-relaxed">
                        {record.payload?.student_note || 'No student note included.'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Teacher notes</p>
                      <p className="text-sm text-foreground mt-2 leading-relaxed">
                        {record.payload?.teacher_notes || 'No extra teacher notes provided.'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Included history</p>
                      <p className="text-sm text-foreground mt-2">
                        {(record.payload?.student_check_ins || []).length} check-ins · {(record.payload?.teacher_actions || []).length} teacher actions
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
