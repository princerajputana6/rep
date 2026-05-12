/**
 * Timesheets — Weekly time tracking with billing codes, approval queue,
 * overtime detection, lock periods, and manager approval workflow.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/app/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/app/components/ui/table';
import {
  Clock, ChevronLeft, ChevronRight, Lock, CheckCircle2, XCircle,
  AlertTriangle, Download, Send, Users, Plus, Activity, DollarSign,
  TrendingUp, Flame, Shield,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────────────────────────────
type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

interface TimesheetEntry {
  id: string;
  projectId: string;
  projectName: string;
  taskName: string;
  billingCode: string;
  hours: Record<string, number>;   // date string → hours
  weekKey: string;                 // 'YYYY-WW'
  status: TimesheetStatus;
  isLocked: boolean;
  rejectedReason?: string;
}

interface TeamMemberRow {
  userId: string;
  name: string;
  role: string;
  totalHours: number;
  billableHours: number;
  utilizationPct: number;
  status: TimesheetStatus;
}

// ─── Date utilities ───────────────────────────────────────────────────────────
function getCurrentWeekKey(): string {
  const now = new Date('2026-04-11'); // seeded to project date
  const day = now.getDay(); // 0=Sun
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(now.setDate(diff));
  const year = mon.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const week = Math.ceil(((mon.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

function getWeekDates(weekKey: string): string[] {
  const [year, wStr] = weekKey.split('-W');
  const week = parseInt(wStr);
  const jan1 = new Date(parseInt(year), 0, 1);
  const daysToFirstMonday = (8 - jan1.getDay()) % 7;
  const firstMonday = new Date(jan1);
  firstMonday.setDate(jan1.getDate() + daysToFirstMonday);
  const weekStart = new Date(firstMonday);
  weekStart.setDate(firstMonday.getDate() + (week - 1) * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

function formatWeekLabel(weekKey: string): string {
  const dates = getWeekDates(weekKey);
  const fmt = (d: string) => { const [, m, day] = d.split('-'); const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return `${months[parseInt(m) - 1]} ${parseInt(day)}`; };
  const year = weekKey.split('-')[0];
  return `${fmt(dates[0])} – ${fmt(dates[6])}, ${year}`;
}

function dayLabel(date: string): string {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const d = new Date(date + 'T00:00:00');
  return `${days[d.getDay()]} ${parseInt(date.split('-')[2])}`;
}

function adjustWeek(weekKey: string, delta: number): string {
  const [year, wStr] = weekKey.split('-W');
  let y = parseInt(year); let w = parseInt(wStr) + delta;
  if (w > 52) { w -= 52; y += 1; }
  if (w < 1) { w += 52; y -= 1; }
  return `${y}-W${String(w).padStart(2, '0')}`;
}

// ─── Billing codes ────────────────────────────────────────────────────────────
const BILLING_CODES = ['BC-DESIGN-01', 'BC-DEV-02', 'BC-STRATEGY-03', 'BC-PM-04', 'BC-CONTENT-05', 'BC-QA-06', 'BC-OPS-07', 'INTERNAL'];

// ─── Mock data ────────────────────────────────────────────────────────────────
const CURR_WEEK = getCurrentWeekKey();
const PREV_WEEK = adjustWeek(CURR_WEEK, -1);
const PREV2_WEEK = adjustWeek(CURR_WEEK, -2);

function makeEntry(id: string, projectId: string, projectName: string, taskName: string, billingCode: string, weekKey: string, hours: number[], status: TimesheetStatus, isLocked: boolean): TimesheetEntry {
  const dates = getWeekDates(weekKey);
  const hoursMap: Record<string, number> = {};
  dates.forEach((d, i) => { if (hours[i]) hoursMap[d] = hours[i]; });
  return { id, projectId, projectName, taskName, billingCode, hours: hoursMap, weekKey, status, isLocked };
}

const INIT_ENTRIES: TimesheetEntry[] = [
  makeEntry('e1', 'p1', 'Brand Overhaul 2026', 'Visual Design', 'BC-DESIGN-01', CURR_WEEK, [8, 7.5, 8, 6, 8, 0, 0], 'draft', false),
  makeEntry('e2', 'p2', 'Data Platform Migration', 'Architecture Review', 'BC-DEV-02', CURR_WEEK, [0, 2, 3, 4, 2, 0, 0], 'draft', false),
  makeEntry('e3', 'p3', 'Retail Media Strategy', 'Strategy Deck', 'BC-STRATEGY-03', CURR_WEEK, [2, 0, 2, 0, 3, 0, 0], 'draft', false),
  makeEntry('e4', 'p1', 'Brand Overhaul 2026', 'Client Presentation', 'BC-PM-04', PREV_WEEK, [8, 8, 8, 7, 8, 0, 0], 'approved', true),
  makeEntry('e5', 'p2', 'Data Platform Migration', 'Sprint Planning', 'BC-DEV-02', PREV_WEEK, [1, 8, 8, 8, 8, 0, 0], 'submitted', true),
  makeEntry('e6', 'p3', 'Retail Media Strategy', 'Analytics Report', 'BC-STRATEGY-03', PREV2_WEEK, [7, 8, 8, 7, 6, 0, 0], 'approved', true),
  makeEntry('e7', 'INTERNAL', 'Internal', 'Admin & Emails', 'INTERNAL', PREV2_WEEK, [1, 0, 1, 1, 2, 0, 0], 'approved', true),
];

const TEAM_DATA: TeamMemberRow[] = [
  { userId: 'u1', name: 'Alex Chen', role: 'Senior Designer', totalHours: 37.5, billableHours: 35, utilizationPct: 93, status: 'submitted' },
  { userId: 'u2', name: 'Maria Lopez', role: 'Copywriter', totalHours: 40, billableHours: 38, utilizationPct: 100, status: 'approved' },
  { userId: 'u3', name: 'James Wu', role: 'Media Buyer', totalHours: 32, billableHours: 30, utilizationPct: 80, status: 'draft' },
  { userId: 'u4', name: 'Sara Kim', role: 'Analyst', totalHours: 28, billableHours: 22, utilizationPct: 70, status: 'submitted' },
  { userId: 'u5', name: 'Tom Reeves', role: 'Dev / Tracking', totalHours: 44, billableHours: 40, utilizationPct: 110, status: 'approved' },
  { userId: 'u6', name: 'Priya Patel', role: 'Project Manager', totalHours: 36, billableHours: 32, utilizationPct: 90, status: 'draft' },
];

const PENDING_APPROVALS = [
  { id: 'pa1', name: 'Alex Chen', role: 'Senior Designer', weekKey: PREV_WEEK, totalHours: 37.5, billableHours: 35, submittedAt: '2026-04-06 09:12' },
  { id: 'pa2', name: 'Sara Kim', role: 'Analyst', weekKey: PREV_WEEK, totalHours: 28, billableHours: 22, submittedAt: '2026-04-06 11:48' },
  { id: 'pa3', name: 'James Wu', role: 'Media Buyer', weekKey: adjustWeek(CURR_WEEK, -2), totalHours: 36, billableHours: 34, submittedAt: '2026-03-30 16:02' },
];

// ─── Status helpers ───────────────────────────────────────────────────────────
function statusBadge(s: TimesheetStatus) {
  const cfg = {
    draft:     { cls: 'bg-gray-100 text-gray-600', label: 'Draft' },
    submitted: { cls: 'bg-blue-100 text-blue-700', label: 'Submitted' },
    approved:  { cls: 'bg-green-100 text-green-700', label: 'Approved' },
    rejected:  { cls: 'bg-red-100 text-red-700', label: 'Rejected' },
  };
  const { cls, label } = cfg[s];
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

// ─── Week Navigator ───────────────────────────────────────────────────────────
function WeekNavigator({ weekKey, onWeekChange, isLocked, weekStatus, onSubmit }: { weekKey: string; onWeekChange: (k: string) => void; isLocked: boolean; weekStatus: TimesheetStatus; onSubmit: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg">
      <Button variant="ghost" size="sm" onClick={() => onWeekChange(adjustWeek(weekKey, -1))}>
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <div className="flex items-center gap-3">
        {isLocked && <Lock className="w-4 h-4 text-blue-500" title="Period locked" />}
        <div className="text-center">
          <p className="font-semibold text-sm text-gray-900">{formatWeekLabel(weekKey)}</p>
          <p className="text-xs text-gray-500">{weekKey}</p>
        </div>
        {statusBadge(weekStatus)}
      </div>
      <div className="flex items-center gap-2">
        {!isLocked && weekStatus === 'draft' && (
          <Button size="sm" onClick={onSubmit}>
            <Send className="w-3.5 h-3.5 mr-1" />Submit
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => onWeekChange(adjustWeek(weekKey, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── My Timesheets Tab ────────────────────────────────────────────────────────
function MyTimesheetsTab({ weekKey, onWeekChange }: { weekKey: string; onWeekChange: (k: string) => void }) {
  const [entries, setEntries] = useState<TimesheetEntry[]>(INIT_ENTRIES);
  const [showAddRow, setShowAddRow] = useState(false);
  const [newRow, setNewRow] = useState({ projectName: '', taskName: '', billingCode: BILLING_CODES[0] });
  const [rejectReason, setRejectReason] = useState('');

  const weekDates = useMemo(() => getWeekDates(weekKey), [weekKey]);
  const weekEntries = useMemo(() => entries.filter(e => e.weekKey === weekKey), [entries, weekKey]);
  const isLocked = weekEntries.some(e => e.isLocked) || weekKey < adjustWeek(getCurrentWeekKey(), -1);
  const weekStatus: TimesheetStatus = weekEntries.length === 0 ? 'draft' : weekEntries.every(e => e.status === 'approved') ? 'approved' : weekEntries.some(e => e.status === 'submitted') ? 'submitted' : 'draft';

  const updateHours = (entryId: string, date: string, val: string) => {
    const num = parseFloat(val) || 0;
    setEntries(prev => prev.map(e => e.id === entryId ? { ...e, hours: { ...e.hours, [date]: num } } : e));
  };

  const updateBillingCode = (entryId: string, code: string) => {
    setEntries(prev => prev.map(e => e.id === entryId ? { ...e, billingCode: code } : e));
  };

  const handleSubmit = () => {
    setEntries(prev => prev.map(e => e.weekKey === weekKey && e.status === 'draft' ? { ...e, status: 'submitted' } : e));
    toast.success('Timesheet submitted for approval');
  };

  const addRow = () => {
    if (!newRow.projectName || !newRow.taskName) { toast.error('Project and task name are required'); return; }
    const entry = makeEntry(`e${Date.now()}`, `p${Date.now()}`, newRow.projectName, newRow.taskName, newRow.billingCode, weekKey, [0,0,0,0,0,0,0], 'draft', false);
    setEntries(prev => [...prev, entry]);
    setShowAddRow(false);
    setNewRow({ projectName: '', taskName: '', billingCode: BILLING_CODES[0] });
    toast.success('Row added');
  };

  // Totals
  const dayTotals = useMemo(() => weekDates.map(d => weekEntries.reduce((s, e) => s + (e.hours[d] || 0), 0)), [weekEntries, weekDates]);
  const rowTotals = useMemo(() => weekEntries.map(e => weekDates.reduce((s, d) => s + (e.hours[d] || 0), 0)), [weekEntries, weekDates]);
  const totalHours = dayTotals.reduce((s, d) => s + d, 0);
  const billableHours = weekEntries.filter(e => e.billingCode !== 'INTERNAL').reduce((s, e, i) => s + rowTotals[i], 0);

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: 'Total Hours', v: totalHours.toFixed(1), Icon: Clock, c: 'text-gray-700' },
          { l: 'Billable', v: billableHours.toFixed(1), Icon: DollarSign, c: 'text-green-600' },
          { l: 'Non-Billable', v: (totalHours - billableHours).toFixed(1), Icon: Activity, c: 'text-gray-500' },
          { l: 'Utilization', v: `${Math.min(100, Math.round((totalHours / 40) * 100))}%`, Icon: TrendingUp, c: totalHours > 40 ? 'text-red-600' : totalHours >= 32 ? 'text-green-600' : 'text-amber-600' },
        ].map(({ l, v, Icon, c }) => (
          <Card key={l}><CardContent className="pt-4 pb-3 text-center">
            <Icon className={`w-5 h-5 mx-auto mb-1 ${c}`} />
            <p className={`text-xl font-bold ${c}`}>{v}</p>
            <p className="text-[10px] text-gray-500">{l}</p>
          </CardContent></Card>
        ))}
      </div>

      <WeekNavigator weekKey={weekKey} onWeekChange={onWeekChange} isLocked={isLocked} weekStatus={weekStatus} onSubmit={handleSubmit} />

      {/* Timesheet grid */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs min-w-[700px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600 w-36">Project</th>
                <th className="text-left p-3 font-medium text-gray-600 w-28">Task</th>
                <th className="text-left p-3 font-medium text-gray-600 w-24">Billing Code</th>
                {weekDates.map(d => (
                  <th key={d} className={`text-center p-2 font-medium text-gray-600 w-14 ${['Sat', 'Sun'].some(x => dayLabel(d).startsWith(x)) ? 'bg-gray-100' : ''}`}>
                    {dayLabel(d)}
                  </th>
                ))}
                <th className="text-center p-3 font-medium text-gray-700 w-14">Total</th>
                <th className="text-center p-3 font-medium text-gray-600 w-20">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {weekEntries.map((entry, ri) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-800 truncate max-w-[140px]">{entry.projectName}</td>
                  <td className="p-3 text-gray-600 truncate max-w-[110px]">{entry.taskName}</td>
                  <td className="p-2">
                    <Select value={entry.billingCode} onValueChange={v => updateBillingCode(entry.id, v)} disabled={isLocked || entry.status !== 'draft'}>
                      <SelectTrigger className="h-7 text-[10px] w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>{BILLING_CODES.map(bc => <SelectItem key={bc} value={bc} className="text-xs">{bc}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  {weekDates.map(d => {
                    const val = entry.hours[d] || 0;
                    const isWeekend = ['Sat', 'Sun'].some(x => dayLabel(d).startsWith(x));
                    const isOT = val > 8;
                    return (
                      <td key={d} className={`p-1 ${isWeekend ? 'bg-gray-50' : ''}`}>
                        <input
                          type="number" min="0" max="24" step="0.5"
                          value={val || ''}
                          disabled={isLocked || entry.status !== 'draft'}
                          onChange={e => updateHours(entry.id, d, e.target.value)}
                          className={`w-12 h-8 text-center text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400 ${isOT ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-200'}`}
                        />
                      </td>
                    );
                  })}
                  <td className="p-3 text-center font-bold text-gray-900">{rowTotals[ri].toFixed(1)}</td>
                  <td className="p-3 text-center">{statusBadge(entry.status)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan={3} className="p-3 font-semibold text-gray-700 text-xs">Daily Total</td>
                {dayTotals.map((total, i) => (
                  <td key={i} className={`p-2 text-center font-bold text-xs ${total > 8 ? 'text-red-600' : total >= 6 ? 'text-gray-900' : 'text-gray-400'}`}>{total > 0 ? total.toFixed(1) : '—'}</td>
                ))}
                <td className="p-3 text-center font-bold text-blue-700">{totalHours.toFixed(1)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => setShowAddRow(true)} disabled={isLocked || weekStatus !== 'draft'}>
          <Plus className="w-4 h-4 mr-1" />Add Row
        </Button>
        {isLocked && (
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <Lock className="w-3.5 h-3.5" />Period locked by admin
          </div>
        )}
        {totalHours > 40 && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <Flame className="w-3.5 h-3.5" />{(totalHours - 40).toFixed(1)}h overtime detected
          </div>
        )}
        <Button variant="outline" size="sm" onClick={() => toast.success('Downloaded')}><Download className="w-4 h-4 mr-1" />Export</Button>
      </div>

      {/* Add row dialog */}
      <Dialog open={showAddRow} onOpenChange={setShowAddRow}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Timesheet Row</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Project Name</Label><Input value={newRow.projectName} onChange={e => setNewRow(p => ({ ...p, projectName: e.target.value }))} placeholder="e.g. Brand Overhaul 2026" /></div>
            <div className="space-y-1"><Label>Task Name</Label><Input value={newRow.taskName} onChange={e => setNewRow(p => ({ ...p, taskName: e.target.value }))} placeholder="e.g. Design Review" /></div>
            <div className="space-y-1"><Label>Billing Code</Label>
              <Select value={newRow.billingCode} onValueChange={v => setNewRow(p => ({ ...p, billingCode: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BILLING_CODES.map(bc => <SelectItem key={bc} value={bc}>{bc}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={addRow}>Add Row</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Team Timesheets Tab ──────────────────────────────────────────────────────
function TeamTimesheetsTab({ weekKey }: { weekKey: string }) {
  const [statusF, setStatusF] = useState('all');
  const filtered = useMemo(() => TEAM_DATA.filter(m => statusF === 'all' || m.status === statusF), [statusF]);

  const avgUtil = Math.round(TEAM_DATA.reduce((s, m) => s + m.utilizationPct, 0) / TEAM_DATA.length);
  const pendingCount = TEAM_DATA.filter(m => m.status === 'submitted').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: 'Team Members', v: TEAM_DATA.length, Icon: Users, c: 'text-gray-700' },
          { l: 'Pending Approval', v: pendingCount, Icon: Clock, c: 'text-amber-600' },
          { l: 'Avg Utilization', v: `${avgUtil}%`, Icon: TrendingUp, c: avgUtil >= 80 ? 'text-green-600' : 'text-amber-600' },
          { l: 'Overtime Members', v: TEAM_DATA.filter(m => m.utilizationPct > 100).length, Icon: Flame, c: 'text-red-600' },
        ].map(({ l, v, Icon, c }) => (
          <Card key={l}><CardContent className="pt-4 pb-3 text-center">
            <Icon className={`w-5 h-5 mx-auto mb-1 ${c}`} />
            <p className={`text-xl font-bold ${c}`}>{v}</p>
            <p className="text-[10px] text-gray-500">{l}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 font-medium">Week: {formatWeekLabel(weekKey)}</p>
        <div className="flex items-center gap-2">
          <Select value={statusF} onValueChange={setStatusF}>
            <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => toast.success('Exported team timesheets')}>
            <Download className="w-4 h-4 mr-1" />Export
          </Button>
        </div>
      </div>

      <Card><CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Role</TableHead>
            <TableHead className="text-right">Total Hrs</TableHead>
            <TableHead className="text-right">Billable</TableHead>
            <TableHead className="text-center">Utilization</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map(m => (
              <TableRow key={m.userId}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell className="text-gray-600 text-xs">{m.role}</TableCell>
                <TableCell className="text-right font-semibold">{m.totalHours}h</TableCell>
                <TableCell className="text-right text-green-700 font-semibold">{m.billableHours}h</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 bg-gray-200 rounded-full flex-1">
                      <div className={`h-full rounded-full ${m.utilizationPct > 100 ? 'bg-red-500' : m.utilizationPct >= 80 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, m.utilizationPct)}%` }} />
                    </div>
                    <span className={`text-xs font-semibold w-12 text-right ${m.utilizationPct > 100 ? 'text-red-600' : m.utilizationPct >= 80 ? 'text-green-600' : 'text-amber-600'}`}>{m.utilizationPct}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{statusBadge(m.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}

// ─── Approval Queue Tab ───────────────────────────────────────────────────────
function ApprovalQueueTab() {
  const [pending, setPending] = useState(PENDING_APPROVALS);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const approve = (id: string) => {
    setPending(prev => prev.filter(p => p.id !== id));
    toast.success('Timesheet approved');
  };
  const reject = (id: string) => {
    if (!rejectReason.trim()) { toast.error('Please provide a rejection reason'); return; }
    setPending(prev => prev.filter(p => p.id !== id));
    setRejectId(null);
    setRejectReason('');
    toast.success('Timesheet rejected with reason sent');
  };

  if (pending.length === 0) {
    return (
      <Card><CardContent className="py-16 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p className="font-semibold text-gray-800 text-lg">All caught up!</p>
        <p className="text-sm text-gray-500 mt-1">No timesheets pending your approval.</p>
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <p className="font-semibold text-gray-900">Pending Approvals</p>
        <Badge className="bg-amber-100 text-amber-700">{pending.length}</Badge>
      </div>
      <div className="space-y-3">
        {pending.map(pa => (
          <Card key={pa.id} className="border-l-4 border-l-amber-400">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{pa.name}</p>
                    <span className="text-xs text-gray-500">{pa.role}</span>
                  </div>
                  <p className="text-xs text-gray-500">Week: {formatWeekLabel(pa.weekKey)} · Submitted: {pa.submittedAt}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span>Total: <strong>{pa.totalHours}h</strong></span>
                    <span className="text-green-700">Billable: <strong>{pa.billableHours}h</strong></span>
                    <span className="text-gray-500">Non-bill: <strong>{(pa.totalHours - pa.billableHours).toFixed(1)}h</strong></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {rejectId === pa.id ? (
                    <div className="flex flex-col gap-2 min-w-[220px]">
                      <textarea
                        className="border rounded text-xs p-2 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-red-400"
                        placeholder="Rejection reason…"
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => reject(pa.id)}>Confirm Reject</Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setRejectId(null); setRejectReason(''); }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setRejectId(pa.id)}>
                        <XCircle className="w-4 h-4 mr-1" />Reject
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => approve(pa.id)}>
                        <CheckCircle2 className="w-4 h-4 mr-1" />Approve
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────
export function Timesheets() {
  const [activeTab, setActiveTab] = useState('my-timesheets');
  const [weekKey, setWeekKey] = useState(getCurrentWeekKey());
  const pendingCount = PENDING_APPROVALS.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />Timesheets
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Track · submit · approve — with billing codes and overtime detection</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success('Report exported')}>
          <Download className="w-4 h-4 mr-1" />Export Report
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-timesheets"><Clock className="w-3.5 h-3.5 mr-1" />My Timesheets</TabsTrigger>
          <TabsTrigger value="team"><Users className="w-3.5 h-3.5 mr-1" />Team</TabsTrigger>
          <TabsTrigger value="approvals">
            Approvals {pendingCount > 0 && <span className="ml-1.5 text-[10px] font-bold bg-amber-500 text-white rounded-full px-1.5 py-0.5">{pendingCount}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-timesheets" className="mt-4">
          <MyTimesheetsTab weekKey={weekKey} onWeekChange={setWeekKey} />
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <TeamTimesheetsTab weekKey={weekKey} />
        </TabsContent>

        <TabsContent value="approvals" className="mt-4">
          <ApprovalQueueTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
