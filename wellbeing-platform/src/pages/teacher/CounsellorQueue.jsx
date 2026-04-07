import { useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardList, FolderOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTeacherAccess } from '@/lib/TeacherAccessContext';
import { useCounsellorCases, useUpdateCounsellorCaseStatus } from '@/hooks/useWellbeingData';

const statusLabels = {
  pending_review: { label: 'Pending review', tone: 'bg-amber-50 text-amber-700' },
  acknowledged: { label: 'Acknowledged', tone: 'bg-sky-50 text-sky-700' },
  closed: { label: 'Closed', tone: 'bg-emerald-50 text-emerald-700' },
};

export default function CounsellorQueue() {
  const { teacher } = useTeacherAccess();
  const { data: cases = [], isLoading } = useCounsellorCases(teacher);
  const updateCaseStatus = useUpdateCounsellorCaseStatus();
  const [expandedCaseId, setExpandedCaseId] = useState(null);

  const pendingCount = cases.filter((item) => item.status === 'pending_review').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Counsellor Handoff Queue</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Escalated students land here as a structured support file so the next step is recorded rather than implied.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{pendingCount}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Pending review</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary/50 text-foreground flex items-center justify-center">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{cases.length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total cases</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Escalated support files</h2>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground py-6">Loading counsellor cases…</p>
          ) : cases.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6">No counsellor cases created yet.</p>
          ) : (
            <div className="space-y-3">
              {cases.map((record) => {
                const isExpanded = expandedCaseId === record.id;
                const status = statusLabels[record.status] || statusLabels.pending_review;
                return (
                  <div key={record.id || `${record.student_id}-${record.created_at}`} className="rounded-2xl border border-border/60 bg-card p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{record.student_name}</p>
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${status.tone}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created {new Date(record.created_at).toLocaleString()} by {record.teacher_email}
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">{record.summary}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setExpandedCaseId(isExpanded ? null : record.id)}
                        >
                          {isExpanded ? 'Hide file' : 'View file'}
                        </Button>
                        {record.status === 'pending_review' && (
                          <Button
                            size="sm"
                            onClick={() => updateCaseStatus.mutate({ caseId: record.id, status: 'acknowledged' })}
                            disabled={updateCaseStatus.isPending}
                          >
                            Acknowledge
                          </Button>
                        )}
                        {record.status !== 'closed' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateCaseStatus.mutate({ caseId: record.id, status: 'closed' })}
                            disabled={updateCaseStatus.isPending}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                            Close
                          </Button>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 rounded-2xl border border-border/60 bg-secondary/20 p-4 space-y-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Signals</p>
                          <p className="text-sm text-foreground mt-1">
                            {(record.payload?.signals || []).map((signal) => signal.factor).join(', ') || 'No signal list captured.'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Teacher notes</p>
                          <p className="text-sm text-foreground mt-1 leading-relaxed">
                            {record.payload?.teacher_notes || 'No additional notes were supplied.'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Included history</p>
                          <p className="text-sm text-foreground mt-1">
                            {(record.payload?.student_check_ins || []).length} check-ins · {(record.payload?.teacher_actions || []).length} teacher actions
                          </p>
                        </div>
                        {record.parent_message && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Parent communication</p>
                            <p className="text-sm text-foreground mt-1 whitespace-pre-wrap leading-relaxed">{record.parent_message}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
