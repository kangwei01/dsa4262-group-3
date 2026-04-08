import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParentCommunications, useUpdateParentCommunicationStatus } from '@/hooks/useWellbeingData';
import { useTeacherAccess } from '@/lib/TeacherAccessContext';

export default function ParentCommunications() {
  const { teacher } = useTeacherAccess();
  const { data: communications = [], isLoading } = useParentCommunications(teacher);
  const updateStatus = useUpdateParentCommunicationStatus();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Parents</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Log of all parent communications, including the message content and date.
        </p>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-5">
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-6">Loading parent communications…</p>
          ) : communications.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6">No parent communications recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {communications.map((record) => (
                <div key={record.id || `${record.student_id}-${record.created_at}`} className="rounded-2xl border border-border/60 bg-card p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-lg font-semibold text-foreground">{record.student_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {record.subject} · {record.sent_at ? `Sent ${new Date(record.sent_at).toLocaleString()}` : `Created ${new Date(record.created_at).toLocaleString()}`}
                      </p>
                    </div>
                    {record.status !== 'sent' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus.mutate({ communicationId: record.id, status: 'sent' })}
                        disabled={updateStatus.isPending}
                      >
                        Mark as sent
                      </Button>
                    )}
                  </div>
                  <div className="mt-4 rounded-2xl border border-border/60 bg-secondary/20 p-4">
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{record.message}</p>
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
