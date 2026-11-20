import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  CheckSquare, 
  MessageSquare, 
  Calendar, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  Search, 
  ArrowUpDown, 
  Eye,
  CheckCircle2,
  X,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { RECRUITERS } from '../data/mockJsipData';
import { RAW_RECRUITER_ACTIVITIES } from '../data/mockDashboardTablesData';
import { NotesTasksDateFilter, ActivityDetailRecord } from '../types/dashboardTables';

interface NotesTasksMessagesTableProps {
  onShowToast: (message: string) => void;
  dashboardPreview?: boolean;
}

export const NotesTasksMessagesTable: React.FC<NotesTasksMessagesTableProps> = ({
  onShowToast,
  dashboardPreview = false
}) => {
  // Independent Date Filter (Default: 'this_week')
  const [dateFilter, setDateFilter] = useState<NotesTasksDateFilter>('this_week');
  
  // Search & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'notes' | 'tasks' | 'messages'>('notes');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Interactive controls state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState('Just now');

  // Selected recruiter for detail breakdown drawer/modal
  const [selectedRecruiterId, setSelectedRecruiterId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Handle Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const now = new Date();
      setLastRefreshedAt(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      );
      onShowToast('Notes, Tasks & Messages counts refreshed');
    }, 500);
  };

  // Filter raw activity records based on selected date filter
  const filteredActivities = useMemo(() => {
    return RAW_RECRUITER_ACTIVITIES.filter((item) => {
      if (dateFilter === 'all_time') return true;
      if (dateFilter === 'today') return item.date === '2026-11-09';
      if (dateFilter === 'this_week') return item.date >= '2026-11-03' && item.date <= '2026-11-09';
      if (dateFilter === 'last_week') return item.date >= '2026-10-27' && item.date <= '2026-11-02';
      if (dateFilter === 'this_month') return item.date >= '2026-11-01' && item.date <= '2026-11-09';
      return true;
    });
  }, [dateFilter]);

  // Aggregate recruiter-wise counts
  const recruiterRows = useMemo(() => {
    return RECRUITERS.map((recruiter) => {
      const recActivities = filteredActivities.filter(a => a.recruiterId === recruiter.id);
      const notesCount = recActivities.filter(a => a.type === 'note').length;
      const tasksCount = recActivities.filter(a => a.type === 'task').length;
      const messagesCount = recActivities.filter(a => a.type === 'message').length;

      return {
        recruiter,
        notesCount,
        tasksCount,
        messagesCount,
        activities: recActivities
      };
    });
  }, [filteredActivities]);

  // Filter & Sort
  const displayedRows = useMemo(() => {
    return recruiterRows.filter((row) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        row.recruiter.name.toLowerCase().includes(q) ||
        row.recruiter.team.toLowerCase().includes(q) ||
        row.recruiter.role.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      let comp = 0;
      if (sortField === 'name') {
        comp = a.recruiter.name.localeCompare(b.recruiter.name);
      } else if (sortField === 'notes') {
        comp = a.notesCount - b.notesCount;
      } else if (sortField === 'tasks') {
        comp = a.tasksCount - b.tasksCount;
      } else if (sortField === 'messages') {
        comp = a.messagesCount - b.messagesCount;
      }
      return sortDirection === 'desc' ? -comp : comp;
    });
  }, [recruiterRows, searchQuery, sortField, sortDirection]);

  // Summary Totals
  const totals = useMemo(() => {
    return displayedRows.reduce(
      (acc, r) => ({
        totalNotes: acc.totalNotes + r.notesCount,
        totalTasks: acc.totalTasks + r.tasksCount,
        totalMessages: acc.totalMessages + r.messagesCount
      }),
      { totalNotes: 0, totalTasks: 0, totalMessages: 0 }
    );
  }, [displayedRows]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const selectedRecruiterData = useMemo(() => {
    if (!selectedRecruiterId) return null;
    return recruiterRows.find(r => r.recruiter.id === selectedRecruiterId) || null;
  }, [selectedRecruiterId, recruiterRows]);
  const isCompactPreview = dashboardPreview && !showAll;
  const visibleRows = isCompactPreview ? displayedRows.slice(0, 5) : displayedRows;

  return (
    <div className={`flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#D8E3F1] bg-white shadow-sm transition-all duration-300 dark:border-[#334155] dark:bg-[#1E293B] ${isCompactPreview ? 'h-auto' : 'h-[590px] max-h-[590px] min-h-[590px]'} ${
      isFullScreen ? 'fixed inset-4 z-50 h-auto max-h-none overflow-y-auto bg-[#FFFFFF] p-2 dark:bg-[#1E40AF]' : ''
    }`}>
      {/* Table Header Controls */}
      <div className="flex shrink-0 flex-col justify-between gap-3 border-b border-[#D8E3F1] bg-white p-3 sm:flex-row sm:items-center sm:p-4 dark:border-[#334155] dark:bg-[#1E293B]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-300">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-['Outfit'] font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <span>Notes – Messages – Tasks</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 font-semibold">
                {displayedRows.length} Recruiters
              </span>
            </h2>
            {!isCompactPreview && <p className="text-[11px] text-slate-500 dark:text-slate-400">Recruiter-wise communication and pipeline tasks.</p>}
          </div>
        </div>

        {/* Right Controls: Date Filter, Search, Refresh, Expand */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {dashboardPreview && displayedRows.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAll(value => !value)}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#1E293B] transition hover:bg-[#FFFFFF] dark:text-[#64748B] dark:hover:bg-[#475569]"
            >
              {showAll ? 'Show less' : 'View all'}
              {showAll ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
          {/* Independent Date Filter Dropdown (Default: This Week) */}
          <div className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-900/70 border border-slate-300/60 dark:border-cyan-500/25 rounded-xl px-2.5 py-1.5 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <select
              aria-label="Filter notes, messages and tasks by date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value as NotesTasksDateFilter);
                onShowToast(`Filter changed: ${e.target.options[e.target.selectedIndex].text}`);
              }}
              className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none font-medium pr-1 cursor-pointer"
            >
              <option value="this_week">This Week (Default)</option>
              <option value="today">Today</option>
              <option value="last_week">Last Week</option>
              <option value="this_month">This Month</option>
              <option value="all_time">All Records</option>
            </select>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search recruiter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-2.5 py-1.5 rounded-xl text-xs bg-white/70 dark:bg-slate-900/70 border border-slate-300/60 dark:border-cyan-500/25 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 w-28 sm:w-36"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-xl bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-cyan-500/25 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Refresh activity logs"
          >
            <RotateCw className={`w-3.5 h-3.5 text-cyan-600 dark:text-cyan-300 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Expand / Fullscreen Toggle */}
          <button
            onClick={() => setIsFullScreen(prev => !prev)}
            className="p-1.5 rounded-xl bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-cyan-500/25 transition-all shadow-sm active:scale-95"
            title={isFullScreen ? 'Minimize view' : 'Expand full screen'}
          >
            {isFullScreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-300" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-300" />
            )}
          </button>
        </div>
      </div>

      {/* Table Body Viewport - Intact Height with Smooth Scrolling */}
      <div className={`w-full overflow-x-auto ${isCompactPreview ? '' : 'min-h-0 flex-1 overflow-y-auto scroll-smooth'}`}>
        <table className={`w-full border-separate border-spacing-0 text-left text-xs ${isCompactPreview ? 'min-w-[420px]' : 'min-w-[580px]'}`}>
          <colgroup>
            <col className="w-[34%] min-w-[190px]" />
            <col className="w-[20%] min-w-[110px]" />
            <col className="w-[20%] min-w-[110px]" />
            <col className="w-[16%] min-w-[90px]" />
            <col className={isCompactPreview ? 'hidden' : 'w-[10%] min-w-[70px]'} />
          </colgroup>

          {/* Sticky Table Header */}
          <thead className="text-slate-600 dark:text-slate-300 text-[10px] font-semibold uppercase tracking-wider">
            <tr className="h-[42px]">
              {/* Column 1: User Name */}
              <th
                onClick={() => handleSort('name')}
                className="sticky top-0 z-20 cursor-pointer whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3.5 py-2.5 transition-colors hover:text-cyan-600 dark:border-[#334155] dark:bg-[#475569] dark:hover:text-cyan-300 sm:px-4"
              >
                <div className="flex items-center gap-1">
                  <span>User Name</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Column 2: Total Notes Count */}
              <th
                onClick={() => handleSort('notes')}
                className="sticky top-0 z-20 cursor-pointer whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3 py-2.5 text-right transition-colors hover:text-cyan-600 dark:border-[#334155] dark:bg-[#475569] dark:hover:text-cyan-300"
              >
                <div className="flex items-center justify-end gap-1">
                  <FileText className="w-3 h-3 text-cyan-500/80" />
                  <span>Total Notes</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Column 3: Total Tasks Count */}
              <th
                onClick={() => handleSort('tasks')}
                className="sticky top-0 z-20 cursor-pointer whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3 py-2.5 text-right transition-colors hover:text-cyan-600 dark:border-[#334155] dark:bg-[#475569] dark:hover:text-cyan-300"
              >
                <div className="flex items-center justify-end gap-1">
                  <CheckSquare className="w-3 h-3 text-teal-500/80" />
                  <span>Total Tasks</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Column 4: Messages Count */}
              <th
                onClick={() => handleSort('messages')}
                className="sticky top-0 z-20 cursor-pointer whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3 py-2.5 text-right transition-colors hover:text-cyan-600 dark:border-[#334155] dark:bg-[#475569] dark:hover:text-cyan-300"
              >
                <div className="flex items-center justify-end gap-1">
                  <MessageSquare className="w-3 h-3 text-sky-500/80" />
                  <span>Messages</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Column 5: Actions */}
              <th className={`${isCompactPreview ? 'hidden' : ''} sticky top-0 z-20 whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3 py-2.5 text-right dark:border-[#334155] dark:bg-[#475569]`}>
                <span>Audit</span>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {displayedRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 border-b border-slate-200/40 dark:border-slate-800/60">
                  No recruiter activity found for this period.
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => (
                <tr
                  key={row.recruiter.id}
                  onClick={() => setSelectedRecruiterId(row.recruiter.id)}
                  className={`${isCompactPreview ? 'h-12' : 'h-[52px] max-h-[52px]'} hover:bg-cyan-500/5 dark:hover:bg-cyan-500/10 transition-colors group cursor-pointer`}
                >
                  {/* User Name */}
                  <td className="py-2.5 px-3.5 sm:px-4 whitespace-nowrap border-b border-slate-200/40 dark:border-slate-800/60">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${row.recruiter.avatarGradient} text-white flex items-center justify-center font-bold text-[10px] shadow-sm shrink-0`}>
                        {row.recruiter.avatarInitials}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                          <span>{row.recruiter.name}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                          {row.recruiter.team}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Total Notes Count */}
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-cyan-600 dark:text-cyan-400 tabular-nums text-xs sm:text-sm border-b border-slate-200/40 dark:border-slate-800/60">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-400/20">
                      {row.notesCount}
                    </span>
                  </td>

                  {/* Total Tasks Count */}
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-600 dark:text-teal-400 tabular-nums text-xs sm:text-sm border-b border-slate-200/40 dark:border-slate-800/60">
                    <span className="px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-400/20">
                      {row.tasksCount}
                    </span>
                  </td>

                  {/* Messages Count */}
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-sky-600 dark:text-sky-400 tabular-nums text-xs sm:text-sm border-b border-slate-200/40 dark:border-slate-800/60">
                    <span className="px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-400/20">
                      {row.messagesCount}
                    </span>
                  </td>

                  {/* Actions / View Audit */}
                  <td className={`${isCompactPreview ? 'hidden' : ''} py-2.5 px-3 text-right whitespace-nowrap border-b border-slate-200/40 dark:border-slate-800/60`} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedRecruiterId(row.recruiter.id)}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-400/20 transition-all flex items-center gap-1 ml-auto"
                      title="Inspect detailed notes & task logs"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Log</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* Sticky Totals Footer */}
          <tfoot className={`${isCompactPreview ? 'hidden' : ''} text-slate-900 dark:text-white font-bold text-xs`}>
            <tr className="h-[44px]">
              <td className="sticky bottom-0 z-20 whitespace-nowrap border-t-2 border-cyan-400/50 bg-slate-100 px-3.5 py-2.5 font-['Outfit'] sm:px-4 dark:bg-[#475569]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>TOTAL ACTIVITIES ({displayedRows.length})</span>
                </div>
              </td>
              <td className="sticky bottom-0 z-20 border-t-2 border-cyan-400/50 bg-slate-100 px-3 py-2.5 text-right font-mono text-xs tabular-nums text-cyan-600 sm:text-sm dark:bg-[#475569] dark:text-cyan-300">
                {totals.totalNotes}
              </td>
              <td className="sticky bottom-0 z-20 border-t-2 border-cyan-400/50 bg-slate-100 px-3 py-2.5 text-right font-mono text-xs tabular-nums text-teal-600 sm:text-sm dark:bg-[#475569] dark:text-teal-300">
                {totals.totalTasks}
              </td>
              <td className="sticky bottom-0 z-20 border-t-2 border-cyan-400/50 bg-slate-100 px-3 py-2.5 text-right font-mono text-xs tabular-nums text-sky-600 sm:text-sm dark:bg-[#475569] dark:text-sky-300">
                {totals.totalMessages}
              </td>
              <td className="sticky bottom-0 z-20 border-t-2 border-cyan-400/50 bg-slate-100 px-3 py-2.5 text-right font-mono text-[10px] text-slate-600 dark:bg-[#475569] dark:text-slate-300">
                <span>Verified</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Bottom Summary Strip */}
      <div className={`${isCompactPreview ? 'hidden' : ''} grid shrink-0 grid-cols-3 gap-2 border-t border-[#D8E3F1] bg-[#FFFFFF] p-3 text-center sm:p-4 dark:border-[#334155] dark:bg-[#475569]`}>
        <div className="space-y-0.5">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Total Notes Logged
          </span>
          <span className="font-['Outfit'] font-bold text-base sm:text-lg tabular-nums text-cyan-600 dark:text-cyan-400">
            {totals.totalNotes}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Pipeline Tasks
          </span>
          <span className="font-['Outfit'] font-bold text-base sm:text-lg tabular-nums text-teal-600 dark:text-teal-400">
            {totals.totalTasks}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Candidate Messages
          </span>
          <span className="font-['Outfit'] font-bold text-base sm:text-lg tabular-nums text-sky-600 dark:text-sky-400">
            {totals.totalMessages}
          </span>
        </div>
      </div>

      {/* Recruiter Activity Audit Modal */}
      {selectedRecruiterData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl space-y-5 rounded-2xl border border-[#D8E3F1] bg-white p-6 shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${selectedRecruiterData.recruiter.avatarGradient} text-white flex items-center justify-center font-bold text-xs`}>
                  {selectedRecruiterData.recruiter.avatarInitials}
                </div>
                <div>
                  <h3 className="font-['Outfit'] font-bold text-slate-900 dark:text-white text-base">
                    {selectedRecruiterData.recruiter.name} · Activity Audit
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedRecruiterData.recruiter.role} · {selectedRecruiterData.recruiter.team}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRecruiterId(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/20">
                <span className="text-[10px] font-semibold uppercase text-slate-400 block">Notes</span>
                <span className="font-bold text-lg text-cyan-600 dark:text-cyan-400">{selectedRecruiterData.notesCount}</span>
              </div>
              <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-400/20">
                <span className="text-[10px] font-semibold uppercase text-slate-400 block">Tasks</span>
                <span className="font-bold text-lg text-teal-600 dark:text-teal-400">{selectedRecruiterData.tasksCount}</span>
              </div>
              <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-400/20">
                <span className="text-[10px] font-semibold uppercase text-slate-400 block">Messages</span>
                <span className="font-bold text-lg text-sky-600 dark:text-sky-400">{selectedRecruiterData.messagesCount}</span>
              </div>
            </div>

            {/* Detailed Records List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {selectedRecruiterData.activities.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">
                  No activity logs recorded for this date range.
                </p>
              ) : (
                selectedRecruiterData.activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/40 dark:border-cyan-500/15 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase font-mono ${
                          act.type === 'note'
                            ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                            : act.type === 'task'
                            ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300'
                            : 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                        }`}>
                          {act.type}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {act.candidateOrClientName}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        {act.title}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {act.date}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecruiterId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm hover:from-teal-400 hover:to-cyan-400 active:scale-95 transition-all"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
