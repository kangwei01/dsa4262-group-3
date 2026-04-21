import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateParentCommunication, useLogTeacherAction, useTeacherStudent } from '@/hooks/useWellbeingData';
import { buildParentMessage } from '@/lib/wellbeingContent';
import { useTeacherAccess } from '@/lib/TeacherAccessContext';

export default function ParentContact() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { teacher } = useTeacherAccess();
  const { data: student, isLoading } = useTeacherStudent(id, teacher);
  const createParentCommunication = useCreateParentCommunication();
  const logTeacherAction = useLogTeacherAction();
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (student) {
      setMessage(buildParentMessage(student, teacher));
    }
  }, [student, teacher]);

  if (isLoading) {
    return <div className="py-10 text-sm text-muted-foreground">Loading parent communication…</div>;
  }

  if (!student) return null;

  const handleSave = async (status) => {
    const communication = await createParentCommunication.mutateAsync({
      studentId: student.id,
      teacherEmail: teacher?.teacher_identifier || student.assigned_teacher || 'wellbeing@school.edu',
      message,
      status,
    });

    await logTeacherAction.mutateAsync({
      studentId: student.id,
      actionType: 'parent_contact',
      notes: status === 'sent' ? 'Parent communication marked as sent.' : 'Parent communication prepared.',
      generatedParentMessage: message,
      completed: true,
      teacherEmail: teacher?.teacher_identifier || student.assigned_teacher || 'wellbeing@school.edu',
    });

    toast.success(status === 'sent' ? 'Parent communication logged as sent.' : 'Parent communication saved.');
    navigate(`/teacher/student/${student.id}`);
    return communication;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    toast.success('Parent message copied.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/teacher/student/${student.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Contact parents</h1>
          <p className="text-sm text-muted-foreground">Suggested draft for teacher review</p>
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Editable parent message</h2>
          </div>
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-h-[260px]"
          />
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" onClick={handleCopy} className="gap-2">
              <Copy className="w-4 h-4" />
              Copy
            </Button>
            <Button variant="outline" onClick={() => handleSave('ready_to_send')}>
              Save draft
            </Button>
            <Button onClick={() => handleSave('sent')}>
              Mark as sent
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
