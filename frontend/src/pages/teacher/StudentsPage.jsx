import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { demoStudents } from '@/lib/demoData';
import StudentCard from '@/components/teacher/StudentCard';

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterTrend, setFilterTrend] = useState('all');

  const filtered = demoStudents.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchRisk = filterRisk === 'all' || s.risk_level === filterRisk;
    const matchTrend = filterTrend === 'all' || s.trend === filterTrend;
    return matchSearch && matchRisk && matchTrend;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">All Students</h1>
        <p className="text-sm text-muted-foreground mt-1">Complete student wellbeing list.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterRisk} onValueChange={setFilterRisk}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Risk level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterTrend} onValueChange={setFilterTrend}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Trend" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trends</SelectItem>
            <SelectItem value="worsening">Worsening</SelectItem>
            <SelectItem value="stable">Stable</SelectItem>
            <SelectItem value="improving">Improving</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.map(student => (
          <StudentCard key={student.id} student={student} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No students match your filters.</p>
        )}
      </div>
    </div>
  );
}