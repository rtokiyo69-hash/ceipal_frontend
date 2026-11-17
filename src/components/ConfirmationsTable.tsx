import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Search, 
  ArrowUpDown, 
  FileCheck2, 
  ExternalLink,
  ShieldCheck,
  Check,
  Filter
} from 'lucide-react';
import { ConfirmationRecord, ConfirmationType, ConfirmationStatus } from '../types/jsip';
import { INITIAL_CONFIRMATIONS } from '../data/mockJsipData';

interface ConfirmationsTableProps {
  onInspectCandidate?: (candidateId: string) => void;
  onShowToast: (message: string) => void;
}

export const ConfirmationsTable: React.FC<ConfirmationsTableProps> = ({
  onInspectCandidate,
  onShowToast
}) => {
  const [confirmations, setConfirmations] = useState<ConfirmationRecord[]>(INITIAL_CONFIRMATIONS);
  const [typeFilter, setTypeFilter] = useState<ConfirmationType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'candidate' | 'client' | 'type' | 'date' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Verify / toggle confirmation status
  const handleVerifyConfirmation = (id: string) => {
    setConfirmations(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextStatus: ConfirmationStatus = item.status === 'Verified' ? 'Confirmed' : 'Verified';
          onShowToast(`Confirmation for ${item.candidateName} updated to ${nextStatus}`);
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  // Filter and Sort
  const filteredConfirmations = useMemo(() => {
    return confirmations.filter(item => {
      if (typeFilter !== 'All' && item.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCand = item.candidateName.toLowerCase().includes(q);
        const matchJob = item.jobTitle.toLowerCase().includes(q);
        const matchClient = item.clientName.toLowerCase().includes(q);
        const matchRecruiter = item.recruiterName.toLowerCase().includes(q);
        if (!matchCand && !matchJob && !matchClient && !matchRecruiter) return false;
      }
      return true;
    }).sort((a, b) => {
      let comp = 0;
      if (sortField === 'candidate') {
        comp = a.candidateName.localeCompare(b.candidateName);
      } else if (sortField === 'client') {
        comp = a.clientName.localeCompare(b.clientName);
      } else if (sortField === 'type') {
        comp = a.type.localeCompare(b.type);
      } else if (sortField === 'date') {
        comp = a.date.localeCompare(b.date);
      } else if (sortField === 'status') {
        comp = a.status.localeCompare(b.status);
      }
      return sortDirection === 'desc' ? -comp : comp;
    });
  }, [confirmations, typeFilter, searchQuery, sortField, sortDirection]);

  // Aggregate confirmation totals
  const totals = useMemo(() => {
    const placements = confirmations.filter(c => c.type === 'Placement').length;
    const interviews = confirmations.filter(c => c.type === 'Interview').length;
    const clientReviews = confirmations.filter(c => c.type === 'Client Review').length;
    const verified = confirmations.filter(c => c.status === 'Verified').length;
    return { placements, interviews, clientReviews, verified };
  }, [confirmations]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="flex h-[590px] max-h-[590px] min-h-[590px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#DCE6EF] bg-white shadow-sm dark:border-[#354A5C] dark:bg-[#1B2936]">
      {/* Table Top Controls Header */}
      <div className="flex shrink-0 flex-col justify-between gap-3 border-b border-[#DCE6EF] bg-[#F5F8FB] p-4 sm:flex-row sm:items-center sm:p-5 dark:border-[#354A5C] dark:bg-[#162431]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-300">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-['Outfit'] font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <span>Confirmations</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-500/15 text-teal-600 dark:text-teal-300 font-semibold">
                {filteredConfirmations.length} Records
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
              <span>Client approvals, interviews & placement signings.</span>
              {filteredConfirmations.length > 7 && (
                <span className="text-teal-600 dark:text-teal-400 font-medium">
                  (7 lines visible · scroll for all {filteredConfirmations.length})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <select
            aria-label="Filter confirmations by type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl text-xs bg-white/70 dark:bg-slate-900/70 border border-slate-300/60 dark:border-cyan-500/25 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          >
            <option value="All">All Types</option>
            <option value="Placement">Placements</option>
            <option value="Interview">Interviews</option>
            <option value="Client Review">Client Reviews</option>
          </select>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate, client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-2.5 py-1.5 rounded-xl text-xs bg-white/70 dark:bg-slate-900/70 border border-slate-300/60 dark:border-cyan-500/25 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 w-32 sm:w-40"
            />
          </div>
        </div>
      </div>

      {/* Table Body Viewport - Intact Height with Smooth Scrolling */}
      <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0 w-full scroll-smooth">
        <table className="w-full text-left text-xs border-separate border-spacing-0 min-w-[580px]">
          <colgroup>
            <col className="w-[34%] min-w-[190px]" />
            <col className="w-[24%] min-w-[140px]" />
            <col className="w-[14%] min-w-[80px]" />
            <col className="w-[14%] min-w-[80px]" />
            <col className="w-[14%] min-w-[80px]" />
          </colgroup>

          {/* Table Header */}
          <thead className="text-slate-600 dark:text-slate-300 text-[10px] font-semibold uppercase tracking-wider">
            <tr className="h-[42px]">
              <th
                onClick={() => handleSort('candidate')}
                className="sticky top-0 z-20 cursor-pointer whitespace-nowrap border-b border-slate-200 bg-slate-100 px-4 py-2.5 transition-colors hover:text-cyan-600 dark:border-[#354A5C] dark:bg-[#162431] dark:hover:text-cyan-300"
              >
                <div className="flex items-center gap-1">
                  <span>Candidate & Role</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('client')}
                className="sticky top-0 z-20 cursor-pointer whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3 py-2.5 transition-colors hover:text-cyan-600 dark:border-[#354A5C] dark:bg-[#162431] dark:hover:text-cyan-300"
              >
                <div className="flex items-center gap-1">
                  <span>Client / Recruiter</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('type')}
                className="sticky top-0 z-20 cursor-pointer whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3 py-2.5 text-center transition-colors hover:text-cyan-600 dark:border-[#354A5C] dark:bg-[#162431] dark:hover:text-cyan-300"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Type</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('status')}
                className="sticky top-0 z-20 cursor-pointer whitespace-nowrap border-b border-slate-200 bg-slate-100 px-3 py-2.5 text-center transition-colors hover:text-cyan-600 dark:border-[#354A5C] dark:bg-[#162431] dark:hover:text-cyan-300"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="sticky top-0 z-20 whitespace-nowrap border-b border-slate-200 bg-slate-100 px-4 py-2.5 text-right dark:border-[#354A5C] dark:bg-[#162431]">
                <span>Action</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredConfirmations.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 border-b border-slate-200/40 dark:border-slate-800/60">
                  No confirmation records matching filter.
                </td>
              </tr>
            ) : (
              filteredConfirmations.map((item) => {
                const typeBadge =
                  item.type === 'Placement'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-400/30'
                    : item.type === 'Interview'
                    ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-400/30'
                    : 'bg-teal-500/15 text-teal-600 dark:text-teal-300 border-teal-400/30';

                const statusBadge =
                  item.status === 'Verified'
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/40'
                    : item.status === 'Confirmed'
                    ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-400/40'
                    : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/40';

                return (
                  <tr
                    key={item.id}
                    className="h-[52px] max-h-[52px] hover:bg-cyan-500/5 dark:hover:bg-cyan-500/10 transition-colors group"
                  >
                    {/* Candidate & Role */}
                    <td className="py-2.5 px-4 whitespace-nowrap border-b border-slate-200/40 dark:border-slate-800/60">
                      <div className="space-y-0.5">
                        <button
                          onClick={() => onInspectCandidate?.(item.candidateId)}
                          className="font-semibold text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors text-left flex items-center gap-1"
                        >
                          <span>{item.candidateName}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                          {item.jobTitle}
                        </div>
                      </div>
                    </td>

                    {/* Client & Recruiter */}
                    <td className="py-2.5 px-3 whitespace-nowrap border-b border-slate-200/40 dark:border-slate-800/60">
                      <div className="space-y-0.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {item.clientName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          By {item.recruiterName}
                        </div>
                      </div>
                    </td>

                    {/* Confirmation Type */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap border-b border-slate-200/40 dark:border-slate-800/60">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${typeBadge}`}>
                        {item.type}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap border-b border-slate-200/40 dark:border-slate-800/60">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${statusBadge}`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Verify Action Button */}
                    <td className="py-2.5 px-4 text-right whitespace-nowrap border-b border-slate-200/40 dark:border-slate-800/60">
                      <button
                        onClick={() => handleVerifyConfirmation(item.id)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all flex items-center gap-1 ml-auto ${
                          item.status === 'Verified'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-400/30 hover:bg-emerald-500/20'
                            : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-400/30 hover:bg-cyan-500/20'
                        }`}
                        title="Toggle verification sign-off"
                      >
                        <Check className="w-3 h-3" />
                        <span>{item.status === 'Verified' ? 'Approved' : 'Verify'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Sticky Totals Footer */}
          <tfoot className="text-slate-800 dark:text-slate-100 font-bold text-xs">
            <tr className="h-[44px]">
              <td className="sticky bottom-0 z-20 whitespace-nowrap border-t-2 border-cyan-400/50 bg-slate-100 px-4 py-2.5 font-['Outfit'] dark:bg-[#162431]">
                <span>TOTAL CONFIRMATIONS</span>
              </td>
              <td className="sticky bottom-0 z-20 border-t-2 border-cyan-400/50 bg-slate-100 px-3 py-2.5 text-xs text-slate-700 dark:bg-[#162431] dark:text-slate-300">
                <span>{confirmations.length} records</span>
              </td>
              <td className="sticky bottom-0 z-20 border-t-2 border-cyan-400/50 bg-slate-100 px-3 py-2.5 text-center font-mono font-bold text-teal-600 dark:bg-[#162431] dark:text-teal-400">
                {totals.placements} Hired
              </td>
              <td className="sticky bottom-0 z-20 border-t-2 border-cyan-400/50 bg-slate-100 px-3 py-2.5 text-center font-mono font-bold text-emerald-600 dark:bg-[#162431] dark:text-emerald-400">
                {totals.verified} Verified
              </td>
              <td className="sticky bottom-0 z-20 border-t-2 border-cyan-400/50 bg-slate-100 px-4 py-2.5 text-right font-mono text-[10px] text-slate-600 dark:bg-[#162431] dark:text-slate-300">
                <span>Live Audit</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mini Metric Strip at Bottom of Confirmations Table */}
      <div className="grid shrink-0 grid-cols-3 gap-2 border-t border-[#DCE6EF] bg-[#F5F8FB] p-3 text-center text-xs dark:border-[#354A5C] dark:bg-[#162431]">
        <div>
          <span className="text-[10px] uppercase text-slate-400 block font-semibold">Placements</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {totals.placements} Placed
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase text-slate-400 block font-semibold">Interviews</span>
          <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
            {totals.interviews} Rounds
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase text-slate-400 block font-semibold">Sign-Offs</span>
          <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
            {totals.verified} Approved
          </span>
        </div>
      </div>
    </div>
  );
};
