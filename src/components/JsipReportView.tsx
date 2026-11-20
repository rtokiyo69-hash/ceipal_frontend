import React, { useState, useMemo } from 'react';
import { 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  Download, 
  ArrowUpDown, 
  Search, 
  Users, 
  CheckCircle2, 
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  Recruiter, 
  RecruitmentActivity, 
  JsipRecruiterRow, 
  JsipSummaryTotals, 
  DateRangeFilter 
} from '../types/jsip';
import { RECRUITERS, RAW_RECRUITMENT_ACTIVITIES } from '../data/mockJsipData';
import { JsipExportConfirmModal } from './JsipExportConfirmModal';
import { RecruiterDrilldownModal } from './RecruiterDrilldownModal';
import { ConfirmationsTable } from './ConfirmationsTable';
import { ActiveJobsTable } from './ActiveJobsTable';

interface JsipReportViewProps {
  onInspectCandidate?: (candidateId: string) => void;
  onShowToast: (message: string) => void;
  dashboardPreview?: boolean;
}

export const JsipReportView: React.FC<JsipReportViewProps> = ({
  onInspectCandidate,
  onShowToast,
  dashboardPreview = false
}) => {
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-11-09');
  const dateFilter: DateRangeFilter = {
    preset: 'custom',
    startDate,
    endDate,
    label: `${startDate} to ${endDate}`
  };

  // Full-screen / Expanded mode
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Loading / refreshing state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState('Just now');

  // Recruiter Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting
  type SortField = 'name' | 'submissions' | 'clientSubmissions' | 'interviews' | 'hires' | 'conversion';
  const [sortField, setSortField] = useState<SortField>('submissions');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modals state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedRecruiterRow, setSelectedRecruiterRow] = useState<JsipRecruiterRow | null>(null);
  const [showAllRecruiters, setShowAllRecruiters] = useState(false);

  // Handle Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const now = new Date();
      setLastRefreshedAt(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`);
      onShowToast('JSIP Report refreshed with latest recruitment data');
    }, 600);
  };

  const filteredActivities = useMemo(
    () => RAW_RECRUITMENT_ACTIVITIES.filter(
      activity => activity.activityDate >= startDate && activity.activityDate <= endDate
    ),
    [startDate, endDate]
  );

  // Aggregate metrics per recruiter dynamically from database records
  const recruiterRows: JsipRecruiterRow[] = useMemo(() => {
    return RECRUITERS.map((recruiter) => {
      // Find all activities for this recruiter within date range
      const recruiterActivities = filteredActivities.filter(a => a.recruiterId === recruiter.id);

      // Prevent duplicate candidate counting per metric
      const uniqueSubmissions = new Set(
        recruiterActivities.filter(a => a.activityType === 'submission').map(a => a.candidateId)
      );

      const uniqueClientSubmissions = new Set(
        recruiterActivities.filter(a => a.activityType === 'client_submission').map(a => a.candidateId)
      );

      const uniqueInterviews = new Set(
        recruiterActivities.filter(a => a.activityType === 'interview').map(a => `${a.candidateId}-${a.activityDate}`)
      );

      const uniqueHires = new Set(
        recruiterActivities.filter(a => a.activityType === 'hire').map(a => a.candidateId)
      );

      const subsCount = uniqueSubmissions.size;
      const clientSubsCount = uniqueClientSubmissions.size;
      const interviewsCount = uniqueInterviews.size;
      const hiresCount = uniqueHires.size;

      const conversionRate = subsCount > 0 ? (hiresCount / subsCount) * 100 : 0;

      return {
        recruiter,
        submissions: subsCount,
        clientSubmissions: clientSubsCount,
        interviews: interviewsCount,
        hires: hiresCount,
        conversionRate,
        activities: recruiterActivities
      };
    });
  }, [filteredActivities]);

  // Apply recruiter search
  const displayedRows = useMemo(() => {
    return recruiterRows.filter((row) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = row.recruiter.name.toLowerCase().includes(q);
        const matchRole = row.recruiter.role.toLowerCase().includes(q);
        const matchTeam = row.recruiter.team.toLowerCase().includes(q);
        if (!matchName && !matchRole && !matchTeam) return false;
      }
      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.recruiter.name.localeCompare(b.recruiter.name);
      } else if (sortField === 'submissions') {
        comparison = a.submissions - b.submissions;
      } else if (sortField === 'clientSubmissions') {
        comparison = a.clientSubmissions - b.clientSubmissions;
      } else if (sortField === 'interviews') {
        comparison = a.interviews - b.interviews;
      } else if (sortField === 'hires') {
        comparison = a.hires - b.hires;
      } else if (sortField === 'conversion') {
        comparison = a.conversionRate - b.conversionRate;
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [recruiterRows, searchQuery, sortField, sortDirection]);

  // Consolidated Dynamic Totals
  const dynamicTotals: JsipSummaryTotals = useMemo(() => {
    return displayedRows.reduce(
      (acc, row) => {
        acc.totalSubmissions += row.submissions;
        acc.totalClientSubmissions += row.clientSubmissions;
        acc.totalInterviews += row.interviews;
        acc.totalHires += row.hires;
        return acc;
      },
      {
        totalSubmissions: 0,
        totalClientSubmissions: 0,
        totalInterviews: 0,
        totalHires: 0,
        activeRecruitersCount: displayedRows.length
      }
    );
  }, [displayedRows]);
  const isCompactPreview = dashboardPreview && !showAllRecruiters;
  const visibleRows = isCompactPreview ? displayedRows.slice(0, 5) : displayedRows;

  // Sort toggle handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Export Confirmation & Generation
  const handleExportConfirm = (format: 'csv' | 'excel') => {
    const headers = ['Recruiter Name', 'Role', 'Team', 'Submissions', 'Client Submissions', 'Interviews', 'Hires', 'Conversion Rate %'];
    const dataLines = displayedRows.map(r => [
      `"${r.recruiter.name}"`,
      `"${r.recruiter.role}"`,
      `"${r.recruiter.team}"`,
      r.submissions,
      r.clientSubmissions,
      r.interviews,
      r.hires,
      `${r.conversionRate.toFixed(1)}%`
    ]);

    const totalsLine = [
      '"TOTAL"',
      '""',
      '""',
      dynamicTotals.totalSubmissions,
      dynamicTotals.totalClientSubmissions,
      dynamicTotals.totalInterviews,
      dynamicTotals.totalHires,
      `${dynamicTotals.totalSubmissions > 0 ? ((dynamicTotals.totalHires / dynamicTotals.totalSubmissions) * 100).toFixed(1) : 0}%`
    ];

    const delimiter = format === 'csv' ? ',' : '\t';
    const csvContent = [
      `# JSIP - Recruiter Performance & Activity Report`,
      `# Date Range: ${dateFilter.label} (${dateFilter.startDate} to ${dateFilter.endDate})`,
      `# Generated: ${new Date().toISOString()}`,
      '',
      headers.join(delimiter),
      ...dataLines.map(line => line.join(delimiter)),
      totalsLine.join(delimiter)
    ].join('\n');

    const blob = new Blob([csvContent], { type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `JSIP_Recruiter_Report_${dateFilter.startDate}_${dateFilter.endDate}.${format === 'csv' ? 'csv' : 'xls'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast(`Downloaded JSIP Report (${format.toUpperCase()}) for ${displayedRows.length} recruiters`);
  };

  return (
    <div className={`space-y-5 transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 overflow-y-auto bg-[#FFFFFF] p-6 dark:bg-[#1E40AF]' : ''}`}>
      {/* Report Controls Card */}
      {/* Report Controls Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#D8E3F1] bg-white p-4 sm:p-5 md:flex-row md:items-center dark:border-[#334155] dark:bg-[#1E293B]">
        {/* Left: Date Range & Recruiter Search */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-xl border border-slate-300/60 bg-white/70 px-3 py-2 text-xs text-slate-600 dark:border-cyan-500/25 dark:bg-slate-900/70 dark:text-slate-300">
            <span>From</span>
            <input
              aria-label="Report start date"
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => {
                const nextStartDate = e.target.value;
                setStartDate(nextStartDate);
                if (nextStartDate > endDate) setEndDate(nextStartDate);
              }}
              className="min-w-0 bg-transparent text-xs text-slate-800 focus:outline-none dark:text-slate-200"
            />
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-slate-300/60 bg-white/70 px-3 py-2 text-xs text-slate-600 dark:border-cyan-500/25 dark:bg-slate-900/70 dark:text-slate-300">
            <span>To</span>
            <input
              aria-label="Report end date"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => {
                const nextEndDate = e.target.value;
                setEndDate(nextEndDate);
                if (nextEndDate < startDate) setStartDate(nextEndDate);
              }}
              className="min-w-0 bg-transparent text-xs text-slate-800 focus:outline-none dark:text-slate-200"
            />
          </label>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports..."
              aria-label="Search all reports"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white/70 dark:bg-slate-900/70 border border-slate-300/60 dark:border-cyan-500/25 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 w-44 sm:w-56"
            />
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400 hidden lg:inline">
            {displayedRows.length} active recruiters
          </span>
        </div>

        {/* Right: Synced status, Refresh, Fullscreen, Export */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-cyan-500/20 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span>Synced: {lastRefreshedAt}</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-cyan-500/25 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Refresh recruitment metrics from database"
          >
            <RotateCw className={`w-3.5 h-3.5 text-cyan-600 dark:text-cyan-300 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsFullScreen(prev => !prev)}
            className="p-2 rounded-xl bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-cyan-500/25 transition-all shadow-sm active:scale-95"
            title={isFullScreen ? 'Exit full-screen view' : 'Expand report to full screen'}
          >
            {isFullScreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-300" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-300" />
            )}
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="ice-sheen px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 hover:from-teal-400 hover:via-cyan-400 hover:to-sky-400 text-white shadow-sm flex items-center gap-1.5 active:scale-[0.98] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 2-Column Side-by-Side: JSIP Recruiter Performance (Half) + Confirmations (Half) */}
      <div className="grid w-full grid-cols-1 items-start gap-5 lg:grid-cols-2">
        {/* Left Column: JSIP Recruiter Performance Report */}
        <div className="flex h-[590px] max-h-[590px] min-h-[590px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#1E293B]">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#D8E3F1] bg-white p-3 sm:p-4 dark:border-[#334155] dark:bg-[#1E293B]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-300">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-['Outfit'] font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Recruiter Performance (JSIP)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 font-semibold">
                    {displayedRows.length} Recruiters
                  </span>
                </h2>
                {!isCompactPreview && <p className="text-[11px] text-slate-500 dark:text-slate-400">Submissions, client activity, interviews & placements.</p>}
              </div>
              {dashboardPreview && displayedRows.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllRecruiters(value => !value)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#1E293B] transition hover:bg-[#FFFFFF] dark:text-[#64748B] dark:hover:bg-[#475569]"
                >
                  {showAllRecruiters ? 'Show less' : 'View all'}
                  {showAllRecruiters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          </div>

          <div className="min-h-0 w-full flex-1 overflow-x-auto overflow-y-auto scroll-smooth">
            <table className={`w-full border-separate border-spacing-0 text-left text-xs ${isCompactPreview ? 'min-w-[420px]' : 'min-w-[620px]'}`}>
              <colgroup>
                <col className="w-[30%] min-w-[180px]" />
                <col className="w-[11%] min-w-[65px]" />
                <col className={isCompactPreview ? 'hidden' : 'w-[12%] min-w-[70px]'} />
                <col className={isCompactPreview ? 'hidden' : 'w-[11%] min-w-[65px]'} />
                <col className="w-[11%] min-w-[65px]" />
                <col className="w-[13%] min-w-[75px]" />
                <col className="w-[12%] min-w-[70px]" />
              </colgroup>

              {/* Table Header */}
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

                  {/* Column 2: # Submissions */}
                  <th
                    onClick={() => handleSort('submissions')}
                    className="sticky top-0 z-20 cursor-pointer whitespace-nowrap border-b border-slate-200 bg-slate-100 px-2 py-2.5 text-right transition-colors hover:text-cyan-600 dark:border-[#334155] dark:bg-[#475569] dark:hover:text-cyan-300 sm:px-3"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span># Subs</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  {/* Column 3: # Client Submissions */}
                  <th
                    onClick={() => handleSort('clientSubmissions')}
                    className={`${isCompactPreview ? 'hidden' : ''} sticky top-0 z-20 cursor-pointer whitespace-nowrap border-b border-slate-200 bg-slate-100 px-2 py-2.5 text-right transition-colors hover:text-cyan-600 dark:border-[#334155] dark:bg-[#475569] dark:hover:text-cyan-300 sm:px-3`}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span># Client</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  {/* Column 4: # Interviews */}
                  <th
                    onClick={() => handleSort('interviews')}
                    className={`${isCompactPreview ? 'hidden' : ''} sticky top-0 z-20 cursor-pointer whitespace-nowrap border-b border-slate-200 bg-slate-100 px-2 py-2.5 text-right transition-colors hover:text-cyan-600 dark:border-[#334155] dark:bg-[#475569] dark:hover:text-cyan-300 sm:px-3`}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span># Int</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  {/* Column 5: # Hires */}
                  <th
                    onClick={() => handleSort('hires')}
                    className="sticky top-0 z-20 cursor-pointer whitespace-nowrap border-b border-slate-200 bg-slate-100 px-2 py-2.5 text-right transition-colors hover:text-cyan-600 dark:border-[#334155] dark:bg-[#475569] dark:hover:text-cyan-300 sm:px-3"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span># Hires</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  {/* Column 6: Conversion Rate % */}
                  <th
                    onClick={() => handleSort('conversion')}
                    className="sticky top-0 z-20 cursor-pointer whitespace-nowrap border-b border-slate-200 bg-slate-100 px-2 py-2.5 text-right transition-colors hover:text-cyan-600 dark:border-[#334155] dark:bg-[#475569] dark:hover:text-cyan-300 sm:px-3"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Rate</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  {/* Column 7: Actions */}
                  <th className="sticky top-0 z-20 whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3 py-2.5 text-right dark:border-[#334155] dark:bg-[#475569]">
                    <span>Log</span>
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {                displayedRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 border-b border-slate-200/40 dark:border-slate-800/60">
                      <div className="space-y-1">
                        <Users className="w-6 h-6 text-cyan-500/40 mx-auto" />
                        <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                          No recruiter records found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row) => (
                    <tr
                      key={row.recruiter.id}
                      onClick={() => setSelectedRecruiterRow(row)}
                      className="h-[52px] max-h-[52px] hover:bg-cyan-500/5 dark:hover:bg-cyan-500/10 transition-colors group cursor-pointer"
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
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                              {row.recruiter.team}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* # Submissions */}
                      <td className="py-2.5 px-2 sm:px-3 text-right font-mono font-bold text-cyan-600 dark:text-cyan-400 tabular-nums text-xs sm:text-sm border-b border-slate-200/40 dark:border-slate-800/60">
                        {row.submissions}
                      </td>

                      {/* # Client Submissions */}
                      <td className={`${isCompactPreview ? 'hidden' : ''} py-2.5 px-2 sm:px-3 text-right font-mono font-bold text-teal-600 dark:text-teal-400 tabular-nums text-xs sm:text-sm border-b border-slate-200/40 dark:border-slate-800/60`}>
                        {row.clientSubmissions}
                      </td>

                      {/* # Interviews */}
                      <td className={`${isCompactPreview ? 'hidden' : ''} py-2.5 px-2 sm:px-3 text-right font-mono font-bold text-sky-600 dark:text-sky-400 tabular-nums text-xs sm:text-sm border-b border-slate-200/40 dark:border-slate-800/60`}>
                        {row.interviews}
                      </td>

                      {/* # Hires */}
                      <td className="py-2.5 px-2 sm:px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums text-xs sm:text-sm border-b border-slate-200/40 dark:border-slate-800/60">
                        {row.hires}
                      </td>

                      {/* Conversion Rate */}
                      <td className="py-2.5 px-2 sm:px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300 text-xs border-b border-slate-200/40 dark:border-slate-800/60">
                        <span className="font-semibold">
                          {row.conversionRate.toFixed(1)}%
                        </span>
                      </td>

                      {/* Audit Drilldown Action */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap border-b border-slate-200/40 dark:border-slate-800/60" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedRecruiterRow(row)}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-semibold text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-400/20 transition-all flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Log</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* Consolidated Summary Section (Totals Row at Bottom) */}
              <tfoot className={`${isCompactPreview ? 'hidden' : ''} text-slate-900 dark:text-white font-bold text-xs`}>
                <tr className="h-[44px]">
                  <td className="sticky bottom-0 z-20 whitespace-nowrap border-t-2 border-cyan-400/50 bg-slate-100 px-3.5 py-2.5 font-['Outfit'] text-xs tracking-wide sm:px-4 dark:bg-[#475569]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                      <span>TOTAL ({displayedRows.length})</span>
                    </div>
                  </td>
                  <td className="sticky bottom-0 z-20 border-t-2 border-cyan-400/50 bg-slate-100 px-2 py-2.5 text-right font-mono text-xs tabular-nums text-cyan-600 sm:px-3 sm:text-sm dark:bg-[#475569] dark:text-cyan-300">
                    {dynamicTotals.totalSubmissions}
                  </td>
                  <td className="sticky bottom-0 z-20 border-t-2 border-cyan-400/50 bg-slate-100 px-2 py-2.5 text-right font-mono text-xs tabular-nums text-teal-600 sm:px-3 sm:text-sm dark:bg-[#475569] dark:text-teal-300">
                    {dynamicTotals.totalClientSubmissions}
                  </td>
                  <td className="sticky bottom-0 z-20 border-t-2 border-cyan-400/50 bg-slate-100 px-2 py-2.5 text-right font-mono text-xs tabular-nums text-sky-600 sm:px-3 sm:text-sm dark:bg-[#475569] dark:text-sky-300">
                    {dynamicTotals.totalInterviews}
                  </td>
                  <td className="sticky bottom-0 z-20 border-t-2 border-cyan-400/50 bg-slate-100 px-2 py-2.5 text-right font-mono text-xs tabular-nums text-emerald-600 sm:px-3 sm:text-sm dark:bg-[#475569] dark:text-emerald-300">
                    {dynamicTotals.totalHires}
                  </td>
                  <td className="sticky bottom-0 z-20 border-t-2 border-cyan-400/50 bg-slate-100 px-2 py-2.5 text-right font-mono text-xs tabular-nums text-emerald-600 sm:px-3 dark:bg-[#475569] dark:text-emerald-300">
                    {dynamicTotals.totalSubmissions > 0
                      ? ((dynamicTotals.totalHires / dynamicTotals.totalSubmissions) * 100).toFixed(1)
                      : '0.0'}%
                  </td>
                  <td className="sticky bottom-0 z-20 border-t-2 border-cyan-400/50 bg-slate-100 px-3 py-2.5 text-right font-mono text-[10px] text-slate-600 dark:bg-[#475569] dark:text-slate-300">
                    <span>Verified</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Bottom Metrics Quick Strip */}
          <div className="p-3 sm:p-4 bg-white/40 dark:bg-slate-900/40 border-t border-slate-200/50 dark:border-cyan-500/15 grid grid-cols-4 gap-2 text-center shrink-0">
            <div className="space-y-0.5">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Subs
              </span>
              <span className="font-['Outfit'] font-bold text-base sm:text-lg tabular-nums text-cyan-600 dark:text-cyan-400">
                {dynamicTotals.totalSubmissions}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Client
              </span>
              <span className="font-['Outfit'] font-bold text-base sm:text-lg tabular-nums text-teal-600 dark:text-teal-400">
                {dynamicTotals.totalClientSubmissions}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Interviews
              </span>
              <span className="font-['Outfit'] font-bold text-base sm:text-lg tabular-nums text-sky-600 dark:text-sky-400">
                {dynamicTotals.totalInterviews}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Hires
              </span>
              <span className="font-['Outfit'] font-bold text-base sm:text-lg tabular-nums text-emerald-600 dark:text-emerald-400">
                {dynamicTotals.totalHires}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Confirmations Table */}
        <ConfirmationsTable
          onInspectCandidate={onInspectCandidate}
          onShowToast={onShowToast}
          startDate={startDate}
          endDate={endDate}
          searchQuery={searchQuery}
          dashboardPreview={dashboardPreview}
        />
      </div>

      {/* Active Jobs table */}
      <div className="grid w-full grid-cols-1">
        <ActiveJobsTable
          onShowToast={onShowToast}
          startDate={startDate}
          endDate={endDate}
          searchQuery={searchQuery}
          dashboardPreview={dashboardPreview}
        />
      </div>

      {/* Export Confirmation Modal */}
      <JsipExportConfirmModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        dateFilter={dateFilter}
        rows={displayedRows}
        totals={dynamicTotals}
        onConfirmExport={handleExportConfirm}
      />

      {/* Recruiter Activity Drilldown Modal */}
      <RecruiterDrilldownModal
        row={selectedRecruiterRow}
        dateFilter={dateFilter}
        onClose={() => setSelectedRecruiterRow(null)}
        onInspectCandidate={onInspectCandidate}
      />
    </div>
  );
};
