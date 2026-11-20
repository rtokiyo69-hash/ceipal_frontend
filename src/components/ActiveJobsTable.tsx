import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  DollarSign, 
  MapPin, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  ArrowUpDown, 
  Eye, 
  CheckCircle2, 
  ExternalLink,
  X,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { RAW_ACTIVE_JOBS } from '../data/mockDashboardTablesData';
import { ActiveJobRecord } from '../types/dashboardTables';

interface ActiveJobsTableProps {
  onShowToast: (message: string) => void;
  startDate: string;
  endDate: string;
  searchQuery: string;
  dashboardPreview?: boolean;
}

export const ActiveJobsTable: React.FC<ActiveJobsTableProps> = ({
  onShowToast,
  startDate,
  endDate,
  searchQuery,
  dashboardPreview = false
}) => {
  // Sorting
  const [sortField, setSortField] = useState<'jobCode' | 'jobTitle' | 'billRate' | 'state'>('jobCode');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Interactive state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState('Just now');

  // Selected job for quick preview modal
  const [selectedJob, setSelectedJob] = useState<ActiveJobRecord | null>(null);
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
      onShowToast('Active Jobs records synchronized from ATS database');
    }, 500);
  };

  // Apply the shared report date range
  const dateFilteredJobs = useMemo(() => {
    return RAW_ACTIVE_JOBS.filter(job => job.createdAt >= startDate && job.createdAt <= endDate);
  }, [startDate, endDate]);

  // Filter by search & sort
  const displayedJobs = useMemo(() => {
    return dateFilteredJobs.filter((job) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        job.jobCode.toLowerCase().includes(q) ||
        job.jobTitle.toLowerCase().includes(q) ||
        job.clientName.toLowerCase().includes(q) ||
        job.state.toLowerCase().includes(q) ||
        job.department.toLowerCase().includes(q) ||
        job.primaryRecruiter.toLowerCase().includes(q) ||
        job.status.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      let comp = 0;
      if (sortField === 'jobCode') {
        comp = a.jobCode.localeCompare(b.jobCode);
      } else if (sortField === 'jobTitle') {
        comp = a.jobTitle.localeCompare(b.jobTitle);
      } else if (sortField === 'billRate') {
        comp = a.clientBillRate.localeCompare(b.clientBillRate);
      } else if (sortField === 'state') {
        comp = a.state.localeCompare(b.state);
      }
      return sortDirection === 'desc' ? -comp : comp;
    });
  }, [dateFilteredJobs, searchQuery, sortField, sortDirection]);

  // Summary Totals
  const totals = useMemo(() => {
    const totalJobs = displayedJobs.length;
    const totalOpenings = displayedJobs.reduce((acc, j) => acc + j.openings, 0);
    const uniqueStates = new Set(displayedJobs.map(j => j.stateCode)).size;
    return { totalJobs, totalOpenings, uniqueStates };
  }, [displayedJobs]);
  const isCompactPreview = dashboardPreview && !showAll;
  const visibleJobs = isCompactPreview ? displayedJobs.slice(0, 5) : displayedJobs;

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className={`flex h-[590px] max-h-[590px] min-h-[590px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#D8E3F1] bg-white shadow-sm transition-all duration-300 dark:border-[#334155] dark:bg-[#1E293B] ${
      isFullScreen ? 'fixed inset-4 z-50 h-auto max-h-none overflow-y-auto bg-[#FFFFFF] p-2 dark:bg-[#1E40AF]' : ''
    }`}>
      {/* Table Header Controls */}
      <div className="flex shrink-0 flex-col justify-between gap-3 border-b border-[#D8E3F1] bg-white p-3 sm:flex-row sm:items-center sm:p-4 dark:border-[#334155] dark:bg-[#1E293B]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-300">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-['Outfit'] font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <span>Active Jobs</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-500/15 text-teal-600 dark:text-teal-300 font-semibold">
                {displayedJobs.length} Requisitions
              </span>
            </h2>
            {!isCompactPreview && <p className="text-[11px] text-slate-500 dark:text-slate-400">Active client billings, rates & regional openings.</p>}
          </div>
        </div>

        {/* Table actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {dashboardPreview && displayedJobs.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAll(value => !value)}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#1E293B] transition hover:bg-[#FFFFFF] dark:text-[#64748B] dark:hover:bg-[#475569]"
            >
              {showAll ? 'Show less' : 'View all'}
              {showAll ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-xl bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-cyan-500/25 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Refresh active job listings"
          >
            <RotateCw className={`w-3.5 h-3.5 text-teal-600 dark:text-teal-300 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Expand / Fullscreen Toggle */}
          <button
            onClick={() => setIsFullScreen(prev => !prev)}
            className="p-1.5 rounded-xl bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-cyan-500/25 transition-all shadow-sm active:scale-95"
            title={isFullScreen ? 'Minimize view' : 'Expand full screen'}
          >
            {isFullScreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-300" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-300" />
            )}
          </button>
        </div>
      </div>

      {/* Table Body Viewport - Exactly 7 Lines Visible with Smooth Scrolling */}
      <div className="min-h-0 w-full flex-1 overflow-x-auto overflow-y-auto scroll-smooth">
        <table className={`w-full border-separate border-spacing-0 text-left text-xs ${isCompactPreview ? 'min-w-[420px]' : 'min-w-[580px]'}`}>
          <colgroup>
            <col className={isCompactPreview ? 'hidden' : 'w-[18%] min-w-[95px]'} />
            <col className="w-[36%] min-w-[190px]" />
            <col className={isCompactPreview ? 'hidden' : 'w-[26%] min-w-[140px]'} />
            <col className="w-[20%] min-w-[110px]" />
          </colgroup>

          {/* Sticky Table Header */}
          <thead className="text-slate-600 dark:text-slate-300 text-[10px] font-semibold uppercase tracking-wider">
            <tr className="h-[42px]">
              {/* Column 1: Job Code */}
              <th
                onClick={() => handleSort('jobCode')}
                className={`${isCompactPreview ? 'hidden' : ''} sticky top-0 z-20 cursor-pointer whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3.5 py-2.5 transition-colors hover:text-cyan-600 dark:border-[#334155] dark:bg-[#475569] dark:hover:text-cyan-300 sm:px-4`}
              >
                <div className="flex items-center gap-1">
                  <span>Job Code</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Column 2: Job Title */}
              <th
                onClick={() => handleSort('jobTitle')}
                className="sticky top-0 z-20 cursor-pointer whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3 py-2.5 transition-colors hover:text-cyan-600 dark:border-[#334155] dark:bg-[#475569] dark:hover:text-cyan-300"
              >
                <div className="flex items-center gap-1">
                  <span>Job Title & Client</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Column 3: Client Bill Rate / Salary */}
              <th
                onClick={() => handleSort('billRate')}
                className={`${isCompactPreview ? 'hidden' : ''} sticky top-0 z-20 cursor-pointer whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3 py-2.5 transition-colors hover:text-cyan-600 dark:border-[#334155] dark:bg-[#475569] dark:hover:text-cyan-300`}
              >
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-500/80" />
                  <span>Client Bill Rate / Salary</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Column 4: State */}
              <th
                onClick={() => handleSort('state')}
                className="sticky top-0 z-20 cursor-pointer whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3 py-2.5 transition-colors hover:text-cyan-600 dark:border-[#334155] dark:bg-[#475569] dark:hover:text-cyan-300"
              >
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-teal-500/80" />
                  <span>State</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {displayedJobs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400 border-b border-slate-200/40 dark:border-slate-800/60">
                  No active jobs found for the selected date range.
                </td>
              </tr>
            ) : (
              visibleJobs.map((job) => {
                const statusBadge =
                  job.status === 'Active'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-400/30'
                    : job.status === 'Interviewing'
                    ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-400/30'
                    : job.status === 'Offer Stage'
                    ? 'bg-teal-500/15 text-teal-600 dark:text-teal-300 border-teal-400/30'
                    : 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-400/30';

                return (
                  <tr
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`${isCompactPreview ? 'h-12' : 'h-[52px] max-h-[52px]'} hover:bg-cyan-500/5 dark:hover:bg-cyan-500/10 transition-colors group cursor-pointer`}
                  >
                    {/* Job Code */}
                    <td className={`${isCompactPreview ? 'hidden' : ''} py-2.5 px-3.5 sm:px-4 whitespace-nowrap border-b border-slate-200/40 dark:border-slate-800/60`}>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-400/30">
                          {job.jobCode}
                        </span>
                      </div>
                    </td>

                    {/* Job Title & Client */}
                    <td className="py-2.5 px-3 whitespace-nowrap border-b border-slate-200/40 dark:border-slate-800/60">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors flex items-center gap-1 truncate max-w-[220px]">
                          <span>{job.jobTitle}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {job.clientName} · {job.openings} opening{job.openings > 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>

                    {/* Client Bill Rate / Salary */}
                    <td className={`${isCompactPreview ? 'hidden' : ''} py-2.5 px-3 whitespace-nowrap border-b border-slate-200/40 dark:border-slate-800/60`}>
                      <div className="space-y-0.5">
                        <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                          {job.clientBillRate}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {job.salaryBand}
                        </div>
                      </div>
                    </td>

                    {/* State */}
                    <td className="py-2.5 px-3 whitespace-nowrap border-b border-slate-200/40 dark:border-slate-800/60">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold border font-mono bg-white/60 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                          {job.stateCode}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${statusBadge}`}>
                          {job.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Sticky Totals Footer */}
          <tfoot className={`${isCompactPreview ? 'hidden' : ''} text-slate-900 dark:text-white font-bold text-xs`}>
            <tr className="h-[44px]">
              <td className="sticky bottom-0 z-20 whitespace-nowrap border-t-2 border-cyan-400/50 bg-slate-100 px-3.5 py-2.5 font-['Outfit'] sm:px-4 dark:bg-[#475569]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>TOTAL JOBS</span>
                </div>
              </td>
              <td className="sticky bottom-0 z-20 border-t-2 border-cyan-400/50 bg-slate-100 px-3 py-2.5 font-mono text-xs text-cyan-600 dark:bg-[#475569] dark:text-cyan-300">
                <span>{totals.totalJobs} Active ({totals.totalOpenings} Openings)</span>
              </td>
              <td className="sticky bottom-0 z-20 border-t-2 border-cyan-400/50 bg-slate-100 px-3 py-2.5 font-mono text-xs text-emerald-600 dark:bg-[#475569] dark:text-emerald-300">
                <span>$125 – $195 / hr Range</span>
              </td>
              <td className="sticky bottom-0 z-20 border-t-2 border-cyan-400/50 bg-slate-100 px-3 py-2.5 text-right font-mono text-[10px] text-slate-600 dark:bg-[#475569] dark:text-slate-300">
                <span>{totals.uniqueStates} States Active</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Bottom Summary Strip */}
      <div className={`${isCompactPreview ? 'hidden' : ''} grid shrink-0 grid-cols-3 gap-2 border-t border-[#D8E3F1] bg-[#FFFFFF] p-3 text-center sm:p-4 dark:border-[#334155] dark:bg-[#475569]`}>
        <div className="space-y-0.5">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Total Active Roles
          </span>
          <span className="font-['Outfit'] font-bold text-base sm:text-lg tabular-nums text-teal-600 dark:text-teal-400">
            {totals.totalJobs}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Open Requisitions
          </span>
          <span className="font-['Outfit'] font-bold text-base sm:text-lg tabular-nums text-cyan-600 dark:text-cyan-400">
            {totals.totalOpenings}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Active Regions / States
          </span>
          <span className="font-['Outfit'] font-bold text-base sm:text-lg tabular-nums text-emerald-600 dark:text-emerald-400">
            {totals.uniqueStates} States
          </span>
        </div>
      </div>

      {/* Active Job Quick Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg space-y-5 rounded-2xl border border-[#D8E3F1] bg-white p-6 shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-cyan-500/20">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-400/30">
                  {selectedJob.jobCode}
                </span>
                <div>
                  <h3 className="font-['Outfit'] font-bold text-slate-900 dark:text-white text-base">
                    {selectedJob.jobTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedJob.clientName} · {selectedJob.department}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedJob(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-cyan-500/20 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Client Bill Rate</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {selectedJob.clientBillRate}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-cyan-500/20 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Salary Band</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {selectedJob.salaryBand}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-cyan-500/20 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Location & State</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {selectedJob.state}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-cyan-500/20 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Primary Recruiter</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400 text-sm">
                  {selectedJob.primaryRecruiter}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Active Openings:</span>
                <span className="ml-1 font-bold text-cyan-600 dark:text-cyan-300">{selectedJob.openings} positions</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Created on: {selectedJob.createdAt}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm hover:from-teal-400 hover:to-cyan-400 active:scale-95 transition-all"
              >
                Close Requisition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
