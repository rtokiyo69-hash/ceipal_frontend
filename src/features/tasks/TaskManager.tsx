import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  Filter
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { TaskItem, Priority } from '../../types';

export const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('2026-11-09');
  const [priority, setPriority] = useState<Priority>('High');
  const [category, setCategory] = useState<TaskItem['category']>('Interview Follow-up');
  const [assignedTo, setAssignedTo] = useState('Priya Sharma');

  useEffect(() => {
    ApiService.getTasks().then(setTasks);
  }, []);

  const handleToggle = async (id: string) => {
    await ApiService.toggleTaskStatus(id);
    const updated = await ApiService.getTasks();
    setTasks(updated);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: TaskItem = {
      id: `tsk-${Date.now()}`,
      title,
      dueDate,
      priority,
      assignedTo,
      status: 'Pending',
      category
    };
    setTasks([newTask, ...tasks]);
    setModalOpen(false);
    setTitle('');
  };

  const filteredTasks = tasks.filter(
    (t) => filter === 'All' || t.status === filter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-[#2B2D42] dark:text-white">
            Task Manager &amp; SLA Reminders
          </h1>
          <p className="text-xs text-[#8D99AE]">
            Action items, interview follow-ups, offer letter releases, and compliance milestones
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-[#2B2D42] hover:bg-[#222336] text-white rounded-xl text-xs font-semibold shadow-xs shadow-[#2B2D42]/30 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Action Item</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#2B2D42] border border-[#D7DCE5] dark:border-slate-800 rounded-xl w-fit text-xs font-semibold">
        {(['All', 'Pending', 'In Progress', 'Completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === tab
                ? 'bg-[#EDF2F4] dark:bg-[#2B2D42]/30 text-[#2B2D42] dark:text-[#EDF2F4] shadow-xs'
                : 'text-[#8D99AE] hover:text-[#2B2D42] dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-[#2B2D42] border border-[#D7DCE5] dark:border-slate-800 rounded-2xl shadow-xs divide-y divide-[#D7DCE5] dark:divide-slate-800 overflow-hidden">
        {filteredTasks.map((t) => (
          <div
            key={t.id}
            onClick={() => handleToggle(t.id)}
            className="p-4 flex items-center justify-between gap-4 hover:bg-[#EDF2F4]/40 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <input
                type="checkbox"
                checked={t.status === 'Completed'}
                onChange={() => {}}
                className="rounded border-[#D7DCE5] text-[#2B2D42] focus:ring-[#2B2D42] shrink-0"
              />
              <div className="min-w-0">
                <div
                  className={`text-xs font-semibold truncate ${
                    t.status === 'Completed'
                      ? 'line-through text-[#8D99AE]'
                      : 'text-[#2B2D42] dark:text-white'
                  }`}
                >
                  {t.title}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[#8D99AE] mt-0.5">
                  <span className="font-mono flex items-center gap-1 text-[#2B2D42] dark:text-[#8D99AE] font-medium">
                    <Clock className="w-3 h-3" />
                    Due: {t.dueDate}
                  </span>
                  <span>·</span>
                  <span>{t.category}</span>
                  <span>·</span>
                  <span>Assigned: {t.assignedTo}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  t.priority === 'Urgent'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                    : t.priority === 'High'
                    ? 'bg-[#2B2D42]/10 text-[#2B2D42] border border-[#2B2D42]/30'
                    : 'bg-[#EDF2F4] dark:bg-slate-800 text-[#8D99AE] dark:text-slate-300 border border-[#D7DCE5] dark:border-slate-700'
                }`}
              >
                {t.priority}
              </span>

              <span
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${
                  t.status === 'Completed'
                    ? 'bg-[#8AC9A7]/15 text-[#2E7D5B] border-[#8AC9A7]/30 dark:bg-[#8AC9A7]/20 dark:text-[#8AC9A7]'
                    : 'bg-[#EDF2F4] text-[#2B2D42] border-[#2B2D42]/30 dark:bg-[#2B2D42]/20 dark:text-[#EDF2F4]'
                }`}
              >
                {t.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* New Task Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#2B2D42] border border-[#D7DCE5] dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#2B2D42] dark:text-white">
                Create Action Item
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-[#8D99AE] hover:text-[#2B2D42] dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#2B2D42] dark:text-slate-400 mb-1 font-medium">Task Description</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Follow up on offer package for Devon Sterling"
                  className="w-full px-3 py-2 bg-[#EDF2F4] dark:bg-slate-800 border border-[#D7DCE5] dark:border-slate-700 rounded-xl text-[#2B2D42] dark:text-white focus:outline-none focus:border-[#2B2D42] focus:ring-1 focus:ring-[#2B2D42]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#2B2D42] dark:text-slate-400 mb-1 font-medium">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#EDF2F4] dark:bg-slate-800 border border-[#D7DCE5] dark:border-slate-700 rounded-xl text-[#2B2D42] dark:text-white focus:outline-none focus:border-[#2B2D42]"
                  />
                </div>

                <div>
                  <label className="block text-[#2B2D42] dark:text-slate-400 mb-1 font-medium">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 bg-[#EDF2F4] dark:bg-slate-800 border border-[#D7DCE5] dark:border-slate-700 rounded-xl text-[#2B2D42] dark:text-white focus:outline-none focus:border-[#2B2D42]"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#2B2D42] dark:text-slate-400 mb-1 font-medium">Workflow Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskItem['category'])}
                  className="w-full px-3 py-2 bg-[#EDF2F4] dark:bg-slate-800 border border-[#D7DCE5] dark:border-slate-700 rounded-xl text-[#2B2D42] dark:text-white focus:outline-none focus:border-[#2B2D42]"
                >
                  <option value="Interview Follow-up">Interview Follow-up</option>
                  <option value="Offer Release">Offer Release</option>
                  <option value="Vendor Verification">Vendor Verification</option>
                  <option value="Client Review">Client Review</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 border border-[#D7DCE5] dark:border-slate-700 text-[#8D99AE] hover:text-[#2B2D42] dark:text-slate-300 rounded-xl hover:bg-[#EDF2F4] dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2B2D42] hover:bg-[#222336] text-white font-semibold rounded-xl shadow-xs transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
