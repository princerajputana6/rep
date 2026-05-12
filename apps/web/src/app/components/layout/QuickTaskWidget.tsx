/**
 * QuickTaskWidget — Floating adhoc task creator.
 * Panel tabs: My Tasks | Assigned to Me | All Tasks
 * Create dialog: title, priority, due date, assignee, project.
 * Tasks saved to localStorage.
 */

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/app/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import {
  Plus, CheckCircle2, Circle, Clock, Flame, ArrowUp, Minus,
  ChevronDown, X, User, Users, ListTodo, Filter, Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
type Priority = 'low' | 'medium' | 'high' | 'urgent';
type PanelTab = 'mine' | 'assigned' | 'all';

interface QuickTask {
  id: string;
  title: string;
  dueDate: string;
  priority: Priority;
  project: string;
  assignedTo: string;   // '' = unassigned (personal task)
  createdBy: string;    // always 'Me' in this mock
  createdAt: string;
  done: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'rep_quick_tasks';
const ME = 'Me';

const TEAM_MEMBERS = [
  'Alex Chen', 'Maria Lopez', 'James Wu', 'Sara Kim', 'Tom Reeves', 'Priya Patel',
];

const PROJECTS = [
  'Brand Overhaul 2026', 'Data Platform Migration',
  'Retail Media Strategy', 'Customer Portal Revamp',
];

// Seed a few demo tasks so the panel isn't empty on first load
const SEED_TASKS: QuickTask[] = [
  { id: 'qt-seed-1', title: 'Review brand guidelines deck', dueDate: '2026-04-14', priority: 'high', project: 'Brand Overhaul 2026', assignedTo: '', createdBy: ME, createdAt: new Date().toISOString(), done: false },
  { id: 'qt-seed-2', title: 'Follow up on AWS cost estimate', dueDate: '2026-04-15', priority: 'medium', project: 'Data Platform Migration', assignedTo: 'James Wu', createdBy: ME, createdAt: new Date().toISOString(), done: false },
  { id: 'qt-seed-3', title: 'Send Q1 report to client', dueDate: '2026-04-13', priority: 'urgent', project: '', assignedTo: '', createdBy: ME, createdAt: new Date().toISOString(), done: false },
  { id: 'qt-seed-4', title: 'Update resource pool allocations', dueDate: '', priority: 'low', project: '', assignedTo: 'Sara Kim', createdBy: ME, createdAt: new Date().toISOString(), done: true },
];

// ─── localStorage helpers ─────────────────────────────────────────────────────
function loadTasks(): QuickTask[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      saveTasks(SEED_TASKS);
      return SEED_TASKS;
    }
    return JSON.parse(stored) as QuickTask[];
  } catch {
    return SEED_TASKS;
  }
}
function saveTasks(tasks: QuickTask[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ─── Priority helpers ─────────────────────────────────────────────────────────
function priorityConfig(p: Priority) {
  const cfg = {
    low:    { cls: 'bg-gray-100 text-gray-600',   Icon: Minus,   label: 'Low',    dot: 'bg-gray-400' },
    medium: { cls: 'bg-blue-100 text-blue-700',   Icon: Minus,   label: 'Medium', dot: 'bg-blue-500' },
    high:   { cls: 'bg-amber-100 text-amber-700', Icon: ArrowUp, label: 'High',   dot: 'bg-amber-500' },
    urgent: { cls: 'bg-red-100 text-red-700',     Icon: Flame,   label: 'Urgent', dot: 'bg-red-500' },
  };
  return cfg[p];
}

function isOverdue(dueDate: string) {
  return dueDate && dueDate < new Date().toISOString().split('T')[0];
}

// ─── Task Row ─────────────────────────────────────────────────────────────────
function TaskRow({ task, onToggle, onDelete }: { task: QuickTask; onToggle: () => void; onDelete: () => void }) {
  const { cls, dot, label } = priorityConfig(task.priority);
  const overdue = !task.done && isOverdue(task.dueDate);

  return (
    <div className={`flex items-start gap-2 px-3 py-2.5 hover:bg-gray-50 group ${task.done ? 'opacity-50' : ''}`}>
      <button onClick={onToggle} className="mt-0.5 flex-shrink-0">
        {task.done
          ? <CheckCircle2 className="w-4 h-4 text-green-500" />
          : <Circle className="w-4 h-4 text-gray-300 hover:text-blue-400" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium text-gray-800 truncate leading-snug ${task.done ? 'line-through text-gray-400' : ''}`}>
          {task.title}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          {/* Priority dot */}
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
          <span className={`text-[10px] font-medium px-1.5 rounded-full ${cls}`}>{label}</span>
          {task.dueDate && (
            <span className={`text-[10px] ${overdue ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
              {overdue ? '⚠ ' : ''}{task.dueDate}
            </span>
          )}
          {task.assignedTo && (
            <span className="text-[10px] text-purple-600 flex items-center gap-0.5">
              <User className="w-2.5 h-2.5" />{task.assignedTo}
            </span>
          )}
          {task.project && (
            <span className="text-[10px] text-gray-400 truncate max-w-[80px]">{task.project}</span>
          )}
        </div>
      </div>
      <button
        onClick={onDelete}
        className="text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 mt-0.5 flex-shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────
export function QuickTaskWidget() {
  const [open, setOpen] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [tab, setTab] = useState<PanelTab>('mine');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [showDone, setShowDone] = useState(false);
  const [tasks, setTasks] = useState<QuickTask[]>(loadTasks);

  const [form, setForm] = useState({
    title: '', dueDate: '', priority: 'medium' as Priority,
    project: '', assignedTo: '',
  });

  useEffect(() => { saveTasks(tasks); }, [tasks]);

  const setF = (k: string, v: string) =>
    setForm(prev => ({ ...prev, [k]: v === '__none__' ? '' : v }));

  // ─── Derived lists ──────────────────────────────────────────────────────────
  const visibleTasks = useMemo(() => {
    let list = tasks;
    if (!showDone) list = list.filter(t => !t.done);
    if (filterPriority !== 'all') list = list.filter(t => t.priority === filterPriority);

    if (tab === 'mine')     list = list.filter(t => !t.assignedTo || t.assignedTo === ME);
    if (tab === 'assigned') list = list.filter(t => !!t.assignedTo && t.assignedTo !== ME);

    return list;
  }, [tasks, tab, filterPriority, showDone]);

  const pendingCount = tasks.filter(t => !t.done && (!t.assignedTo || t.assignedTo === ME)).length;
  const assignedCount = tasks.filter(t => !t.done && t.assignedTo && t.assignedTo !== ME).length;

  // ─── Actions ────────────────────────────────────────────────────────────────
  const toggleDone = (id: string) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    toast.success('Task removed');
  };

  const handleSave = () => {
    if (!form.title.trim()) { toast.error('Task title is required'); return; }
    const task: QuickTask = {
      id: `qt${Date.now()}`,
      title: form.title.trim(),
      dueDate: form.dueDate,
      priority: form.priority,
      project: form.project,
      assignedTo: form.assignedTo,
      createdBy: ME,
      createdAt: new Date().toISOString(),
      done: false,
    };
    setTasks(prev => [task, ...prev]);
    toast.success(form.assignedTo ? `Task assigned to ${form.assignedTo}` : 'Quick task saved');
    setForm({ title: '', dueDate: '', priority: 'medium', project: '', assignedTo: '' });
    setOpen(false);
  };

  // ─── Tab button ─────────────────────────────────────────────────────────────
  const TabBtn = ({ id, label, count, Icon }: { id: PanelTab; label: string; count: number; Icon: React.ElementType }) => (
    <button
      onClick={() => setTab(id)}
      className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors border-b-2 ${
        tab === id ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      <div className="flex items-center gap-1">
        <Icon className="w-3.5 h-3.5" />
        {count > 0 && (
          <span className={`text-[9px] font-bold rounded-full px-1 ${tab === id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            {count}
          </span>
        )}
      </div>
      {label}
    </button>
  );

  return (
    <>
      {/* ── Create Task Dialog ───────────────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />Add Quick Task
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1">
              <Label>Task Title *</Label>
              <Input
                autoFocus
                placeholder="What needs to be done?"
                value={form.title}
                onChange={e => setF('title', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
            </div>

            {/* Priority + Due Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setF('priority', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Due Date</Label>
                <Input type="date" value={form.dueDate} onChange={e => setF('dueDate', e.target.value)} />
              </div>
            </div>

            {/* Assign To */}
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-purple-500" />Assign To (optional)
              </Label>
              <Select value={form.assignedTo || '__none__'} onValueChange={v => setF('assignedTo', v)}>
                <SelectTrigger><SelectValue placeholder="Unassigned (personal)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Unassigned (personal)</SelectItem>
                  {TEAM_MEMBERS.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project */}
            <div className="space-y-1">
              <Label>Link to Project (optional)</Label>
              <Select value={form.project || '__none__'} onValueChange={v => setF('project', v)}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {PROJECTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Assignment preview */}
            {form.assignedTo && (
              <div className="flex items-center gap-2 rounded-lg bg-purple-50 border border-purple-100 px-3 py-2 text-xs text-purple-700">
                <User className="w-3.5 h-3.5 flex-shrink-0" />
                This task will be assigned to <strong>{form.assignedTo}</strong>. They'll see it under "Assigned to Me".
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              {form.assignedTo ? `Assign to ${form.assignedTo.split(' ')[0]}` : 'Save Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Floating panel + button ──────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

        {/* Panel */}
        {showPanel && (
          <div className="bg-white border shadow-2xl rounded-2xl w-80 overflow-hidden flex flex-col" style={{ maxHeight: '480px' }}>

            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <span className="font-semibold text-sm text-gray-900 flex items-center gap-1.5">
                <ListTodo className="w-4 h-4 text-blue-500" />Tasks
              </span>
              <button onClick={() => setShowPanel(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b bg-white">
              <TabBtn id="mine"     label="My Tasks"    count={pendingCount}  Icon={User} />
              <TabBtn id="assigned" label="Assigned"    count={assignedCount} Icon={Users} />
              <TabBtn id="all"      label="All"         count={tasks.filter(t => !t.done).length} Icon={ListTodo} />
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50">
              <Filter className="w-3 h-3 text-gray-400" />
              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value as Priority | 'all')}
                className="text-[10px] border rounded px-1.5 py-0.5 bg-white text-gray-600 focus:outline-none"
              >
                <option value="all">All priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button
                onClick={() => setShowDone(s => !s)}
                className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors ${showDone ? 'bg-gray-800 text-white border-gray-800' : 'text-gray-500 border-gray-200 hover:bg-gray-100'}`}
              >
                {showDone ? 'Hide done' : 'Show done'}
              </button>
            </div>

            {/* Task list */}
            <div className="flex-1 overflow-y-auto divide-y min-h-0">
              {visibleTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                  <p className="text-xs text-gray-400">
                    {tab === 'mine' ? 'No personal tasks — all clear!' : tab === 'assigned' ? 'No tasks assigned to others' : 'No tasks found'}
                  </p>
                </div>
              ) : (
                visibleTasks.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={() => toggleDone(task.id)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-2 bg-white">
              <Button size="sm" className="w-full h-8 text-xs" onClick={() => { setOpen(true); setShowPanel(false); }}>
                <Plus className="w-3.5 h-3.5 mr-1" />Add Task
              </Button>
            </div>
          </div>
        )}

        {/* Floating button */}
        <button
          onClick={() => setShowPanel(s => !s)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center gap-2 px-4 py-3 transition-all hover:scale-105 active:scale-95"
        >
          {showPanel ? <ChevronDown className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span className="text-sm font-semibold">Quick Task</span>
          {!showPanel && pendingCount > 0 && (
            <span className="bg-white text-blue-700 text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
              {pendingCount}
            </span>
          )}
          {!showPanel && assignedCount > 0 && (
            <span className="bg-purple-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none" title="Assigned to others">
              {assignedCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
