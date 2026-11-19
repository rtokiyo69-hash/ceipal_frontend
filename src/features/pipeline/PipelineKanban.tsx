import React, { useState, useEffect } from 'react';
import {
  Kanban,
  Users,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  ChevronRight,
  CheckCircle,
  MoreVertical
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { Applicant, PipelineStage, Job } from '../../types';

const STAGES: PipelineStage[] = [
  'New',
  'Screening',
  'Submitted',
  'Interview',
  'Selected',
  'Offered',
  'Hired',
  'Rejected'
];

export const PipelineKanban: React.FC = () => {
  const { navigate } = useAppStore();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([ApiService.getApplicants(), ApiService.getJobs()]).then(([apps, jbs]) => {
      setApplicants(apps);
      setJobs(jbs);
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMoveStage = async (applicantId: string, currentStage: PipelineStage, direction: 'next' | 'prev') => {
    const currentIndex = STAGES.indexOf(currentStage);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= 0 && newIndex < STAGES.length) {
      const nextStage = STAGES[newIndex];
      await ApiService.updateApplicantStage(applicantId, nextStage);
      setApplicants((prev) =>
        prev.map((a) => (a.id === applicantId ? { ...a, status: nextStage } : a))
      );
      showToast(`Moved candidate to "${nextStage}"`);
    }
  };

  const filteredApplicants = applicants.filter((a) => {
    const matchesJob = selectedJobFilter === 'all' || a.assignedJobId === selectedJobFilter;
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.currentDesignation.toLowerCase().includes(search.toLowerCase()) ||
      a.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    return matchesJob && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#FF6B5E] text-white border border-[#FF6B5E] px-4 py-2 rounded-xl shadow-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#8AC9A7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Job Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-[#252525] dark:text-white">
            Candidate Pipeline Kanban
          </h1>
          <p className="text-xs text-[#806B66] dark:text-[#FFD7C9]">
            Visual recruitment funnel across all 8 hiring stages
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#806B66] dark:text-[#FFD7C9]">
            <Briefcase className="w-3.5 h-3.5 text-[#252525]" />
            <span>Filter by Requisition:</span>
            <select
              value={selectedJobFilter}
              onChange={(e) => setSelectedJobFilter(e.target.value)}
              className="bg-white dark:bg-[#252525] border border-[#E8C8BE] dark:border-[#3D3634] rounded-xl px-3 py-1.5 text-xs text-[#252525] dark:text-white focus:outline-none focus:border-[#FF6B5E]"
            >
              <option value="all">All Requisitions ({applicants.length} Candidates)</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.code})
                </option>
              ))}
            </select>
          </div>

          {/* Primary action */}
          <button
            onClick={() => navigate('applicant-new')}
            className="px-4 py-2 bg-[#FF6B5E] hover:bg-[#E85249] text-white text-xs font-semibold rounded-xl shadow-xs shadow-[#FF6B5E]/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1500px]">
          {STAGES.map((stageName, colIdx) => {
            const columnCandidates = filteredApplicants.filter((a) => a.status === stageName);

            return (
              <div
                key={stageName}
                className="w-72 shrink-0 bg-[#FFF0E8] dark:bg-[#48403E] border border-[#E8C8BE] dark:border-[#3D3634] rounded-2xl p-3 flex flex-col max-h-[75vh]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E8C8BE] dark:border-[#3D3634]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        stageName === 'Hired'
                          ? 'bg-[#8AC9A7]'
                          : stageName === 'Rejected'
                          ? 'bg-rose-500'
                          : stageName === 'Offered' || stageName === 'Selected'
                          ? 'bg-[#FF6B5E]'
                          : 'bg-[#FF6B5E]'
                      }`}
                    />
                    <span className="text-xs font-bold text-[#252525] dark:text-white">
                      {stageName}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#252525] bg-[#FFF0E8] dark:bg-[#48403E] border border-[#E8C8BE] dark:border-[#65534F] px-2 py-0.5 rounded-full tabular-nums">
                    {columnCandidates.length}
                  </span>
                </div>

                {/* Candidate Cards in Column: White #FFFFFF, Light Grey #E8C8BE */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {columnCandidates.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-[#806B66]">
                      No candidates in {stageName}
                    </div>
                  ) : (
                    columnCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="p-3 bg-white dark:bg-[#252525] border border-[#E8C8BE] dark:border-[#3D3634] hover:border-[#FF6B5E] rounded-xl shadow-xs transition-all space-y-2.5 group"
                      >
                        {/* Candidate Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={candidate.avatar}
                              alt={candidate.name}
                              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-[#E8C8BE]"
                            />
                            <div className="min-w-0">
                              <div
                                onClick={() => navigate('applicant-detail', candidate.id)}
                                className="text-xs font-bold text-[#252525] dark:text-white hover:text-[#252525] cursor-pointer truncate"
                              >
                                {candidate.name}
                              </div>
                              <div className="text-[10px] text-[#806B66] dark:text-[#FFD7C9] truncate">
                                {candidate.currentDesignation}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            {/* Mint #8AC9A7 Match Score */}
                            <span className="text-xs font-mono font-bold text-[#276749] dark:text-[#8AC9A7] bg-[#8AC9A7]/20 border border-[#8AC9A7]/40 px-1.5 py-0.5 rounded">
                              {candidate.matchScore}%
                            </span>
                          </div>
                        </div>

                        {/* Linked requisition */}
                        <div className="text-[10px] font-mono text-[#252525] dark:text-[#FFF0E8] bg-[#FFF0E8] dark:bg-[#48403E] p-1.5 rounded-lg truncate border border-[#E8C8BE] dark:border-[#65534F]">
                          {candidate.assignedJobTitle || 'General Pool'}
                        </div>

                        {/* Skills preview */}
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 2).map((sk) => (
                            <span
                              key={sk}
                              className="px-1.5 py-0.5 bg-[#FFF0E8] dark:bg-[#48403E] border border-[#E8C8BE] dark:border-[#3D3634] rounded text-[9px] font-mono text-[#806B66] dark:text-[#FFD7C9]"
                            >
                              {sk}
                            </span>
                          ))}
                          {candidate.skills.length > 2 && (
                            <span className="text-[9px] text-[#806B66] self-center">
                              +{candidate.skills.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Stage Transition Controls */}
                        <div className="pt-2 border-t border-[#E8C8BE] dark:border-[#3D3634] flex items-center justify-between">
                          <button
                            disabled={colIdx === 0}
                            onClick={() => handleMoveStage(candidate.id, stageName, 'prev')}
                            className="p-1 rounded text-[#806B66] hover:text-[#252525] disabled:opacity-20 disabled:hover:text-[#806B66]"
                            title="Move to previous stage"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => navigate('applicant-detail', candidate.id)}
                            className="text-[10px] text-[#806B66] hover:text-[#252525] font-semibold"
                          >
                            Dossier
                          </button>

                          <button
                            disabled={colIdx === STAGES.length - 1}
                            onClick={() => handleMoveStage(candidate.id, stageName, 'next')}
                            className="p-1 rounded text-[#806B66] hover:text-[#252525] disabled:opacity-20 disabled:hover:text-[#806B66]"
                            title="Advance to next stage"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
