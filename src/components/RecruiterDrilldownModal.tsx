import React, { useState } from 'react';
import { X, User, Briefcase, Calendar, CheckCircle2, Send, ExternalLink, ArrowRight } from 'lucide-react';
import { JsipRecruiterRow, RecruitmentActivity, DateRangeFilter } from '../types/jsip';

interface RecruiterDrilldownModalProps {
  row: JsipRecruiterRow | null;
  dateFilter: DateRangeFilter;
  onClose: () => void;
  onInspectCandidate?: (candidateId: string) => void;
}

export const RecruiterDrilldownModal: React.FC<RecruiterDrilldownModalProps> = ({
  row,
  dateFilter,
  onClose,
  onInspectCandidate
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'submission' | 'client_submission' | 'interview' | 'hire'>('all');

  if (!row) return null;

  const { recruiter, activities, submissions, clientSubmissions, interviews, hires, conversionRate } = row;

  const filteredActivities = activities.filter((act) => {
    if (activeFilter === 'all') return true;
    return act.activityType === activeFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-3 animate-in fade-in duration-200 sm:p-6">
      <div
        className="my-auto flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#D8E3F1] bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-[#D8E3F1] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#334155] dark:bg-[#475569]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${recruiter.avatarGradient} text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0`}>
                {recruiter.avatarInitials}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-['Outfit'] font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
                    {recruiter.name}
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300">
                    {recruiter.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {recruiter.role} · {recruiter.team}
                </p>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {recruiter.email}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Metric KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
            <button
              onClick={() => setActiveFilter('submission')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                activeFilter === 'submission'
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-900 dark:text-cyan-200 shadow-sm'
                  : 'bg-white dark:bg-[#1E293B] border-[#D8E3F1] dark:border-[#475569] text-slate-800 dark:text-slate-200'
              }`}
            >
              <span className="text-[10px] font-semibold uppercase text-slate-400 block">Submissions</span>
              <span className="font-['Outfit'] text-2xl font-bold tabular-nums text-cyan-600 dark:text-cyan-400">
                {submissions}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('client_submission')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                activeFilter === 'client_submission'
                  ? 'bg-teal-500/20 border-teal-400/50 text-teal-900 dark:text-teal-200 shadow-sm'
                  : 'bg-white dark:bg-[#1E293B] border-[#D8E3F1] dark:border-[#475569] text-slate-800 dark:text-slate-200'
              }`}
            >
              <span className="text-[10px] font-semibold uppercase text-slate-400 block">Client Subs</span>
              <span className="font-['Outfit'] text-2xl font-bold tabular-nums text-teal-600 dark:text-teal-400">
                {clientSubmissions}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('interview')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                activeFilter === 'interview'
                  ? 'bg-sky-500/20 border-sky-400/50 text-sky-900 dark:text-sky-200 shadow-sm'
                  : 'bg-white dark:bg-[#1E293B] border-[#D8E3F1] dark:border-[#475569] text-slate-800 dark:text-slate-200'
              }`}
            >
              <span className="text-[10px] font-semibold uppercase text-slate-400 block">Interviews</span>
              <span className="font-['Outfit'] text-2xl font-bold tabular-nums text-sky-600 dark:text-sky-400">
                {interviews}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('hire')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                activeFilter === 'hire'
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-900 dark:text-emerald-200 shadow-sm'
                  : 'bg-white dark:bg-[#1E293B] border-[#D8E3F1] dark:border-[#475569] text-slate-800 dark:text-slate-200'
              }`}
            >
              <span className="text-[10px] font-semibold uppercase text-slate-400 block">Hires</span>
              <span className="font-['Outfit'] text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {hires}
              </span>
            </button>

            <div className="rounded-2xl border border-[#D8E3F1] bg-white p-3 dark:border-[#475569] dark:bg-[#1E293B]">
              <span className="block text-[10px] font-semibold uppercase text-slate-600 dark:text-slate-300">Conversion</span>
              <span className="font-['Outfit'] text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                {conversionRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Activity Feed / Entity Records */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-['Outfit'] font-bold text-base text-slate-900 dark:text-white">
              Underlying Activity & Placement Records ({filteredActivities.length})
            </h3>
            {activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter('all')}
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                Reset to Show All Activities
              </button>
            )}
          </div>

          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No recruitment activity records matching this filter in the selected date range.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((act) => {
                const badgeColor = 
                  act.activityType === 'hire' 
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-400/30'
                    : act.activityType === 'interview'
                    ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-400/30'
                    : act.activityType === 'client_submission'
                    ? 'bg-teal-500/15 text-teal-600 dark:text-teal-300 border-teal-400/30'
                    : 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-400/30';

                const label = 
                  act.activityType === 'hire' ? 'Placement / Hire' :
                  act.activityType === 'interview' ? 'Interview Conducted' :
                  act.activityType === 'client_submission' ? 'Client Submission' : 'Initial Candidate Submission';

                return (
                  <div
                    key={act.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-[#D8E3F1] bg-[#FFFFFF] p-4 text-xs sm:flex-row sm:items-center dark:border-[#334155] dark:bg-[#475569]"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${badgeColor}`}>
                          {label}
                        </span>
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {act.candidateName}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {act.jobTitle}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        {act.clientName && (
                          <span>Target Client: <strong className="text-slate-700 dark:text-slate-300">{act.clientName}</strong></span>
                        )}
                        {act.stageNotes && (
                          <>
                            <span>·</span>
                            <span>{act.stageNotes}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-slate-500 dark:text-slate-400 text-xs">
                        {act.activityDate}
                      </span>
                      {onInspectCandidate && (
                        <button
                          onClick={() => {
                            onInspectCandidate(act.candidateId);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-xl text-xs font-semibold text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/10 transition-colors flex items-center gap-1"
                        >
                          <span>Candidate</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#D8E3F1] bg-[#FFFFFF] px-6 py-4 text-xs text-slate-700 dark:border-[#334155] dark:bg-[#475569] dark:text-slate-300">
          <span>Recruiter Record Verification ID: {recruiter.id}</span>
          <button
            onClick={onClose}
            className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-1.5 font-semibold text-slate-800 transition-colors hover:bg-slate-50 dark:border-[#475569] dark:bg-[#1E293B] dark:text-slate-200 dark:hover:bg-[#253848]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
