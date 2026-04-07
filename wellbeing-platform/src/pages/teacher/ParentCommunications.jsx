import { Mail, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTeacherAccess } from '@/lib/TeacherAccessContext';
import { useParentCommunications, useUpdateParentCommunicationStatus } from '@/hooks/useWellbeingData';

const statusTone = {
  draft: 'bg-secondary text-secondary-foreground',
  ready_to_send: 'bg-amber-50 text-amber-700',
  sent: 'bg-emerald-50 text-emerald-700',
};

export default function ParentCommunications() {
  const { teacher } = useTeacherAccess();
  const { data: communications = [], isLoading } = useParentCommunications(teacher);
  const updateStatus = useUpdateParentCommunicationStatus();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Parent Communication Outbox</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Neutral parent updates drafted by the system appear here so they can be reviewed, tracked, and marked sent.
        </p>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Prepared communications</h2>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground py-6">Loading parent messages…</p>
          ) : communications.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6">No parent communications drafted yet.</p>
          ) : (
            <div className="space-y-3">
              {communications.map((record) => (
                <div key={record.id || `${record.student_id}-${record.created_at}`} className="rounded-2xl border border-border/60 bg-card p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">{record.student_name}</p>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusTone[record.status] || statusTone.draft}`}>
                          {record.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {record.subject} · prepared by {record.teacher_email}
                      </p>
                    </div>

                    {record.status !== 'sent' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus.mutate({ communicationId: record.id, status: 'sent' })}
                        disabled={updateStatus.isPending}
                        className="gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Mark sent
                      </Button>
                    )}
                  </div>

                  <div className="mt-4 rounded-2xl border border-border/60 bg-secondary/20 p-4">
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{record.message}</p>
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                    <span>Created {new Date(record.created_at).toLocaleString()}</span>
                    {record.sent_at && <span>Sent {new Date(record.sent_at).toLocaleString()}</span>}
                    {record.linked_case_id && <span>Linked case: {record.linked_case_id}</span>}
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
