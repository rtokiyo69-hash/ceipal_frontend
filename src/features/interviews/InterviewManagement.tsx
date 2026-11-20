import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Plus,
  CheckCircle,
  X,
  Star,
  ExternalLink,
  Users,
  Briefcase
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { Interview, Applicant, Job } from '../../types';

export const InterviewManagement: React.FC = () => {
  const { navigate } = useAppStore();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [modalOpen, setModalOpen] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<Interview | null>(null);

  // Form State
  const [selectedApplicant, setSelectedApplicant] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [interviewer, setInterviewer] = useState('David Chen (VP Engineering)');
  const [date, setDate] = useState('2026-11-08');
  const [time, setTime] = useState('14:00 - 15:00 PST');
  const [type, setType] = useState<Interview['type']>('Technical Screen');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      ApiService.getInterviews(),
      ApiService.getApplicants(),
      ApiService.getJobs()
    ]).then(([ints, apps, jbs]) => {
      setInterviews(ints);
      setApplicants(apps);
      setJobs(jbs);
      if (apps.length > 0) setSelectedApplicant(apps[0].id);
      if (jbs.length > 0) setSelectedJob(jbs[0].id);
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const app = applicants.find((a) => a.id === selectedApplicant) || applicants[0];
    const jb = jobs.find((j) => j.id === selectedJob) || jobs[0];

    const newInterview = await ApiService.scheduleInterview({
      applicantId: app.id,
      applicantName: app.name,
      jobId: jb.id,
      jobTitle: jb.title,
      client: jb.client,
      interviewer,
      date,
      time,
      type,
      status: 'Scheduled',
      meetingLink: 'https://meet.google.com/ais-talentember-screen'
    });

    setInterviews([newInterview, ...interviews]);
    setModalOpen(false);
    showToast(`Interview scheduled for ${app.name} with ${jb.client}`);
  };

  const handleSaveFeedback = async () => {
    if (!feedbackModal) return;
    await ApiService.updateInterviewStatus(
      feedbackModal.id,
      'Completed',
      feedbackText,
      feedbackRating
    );
    const updated = await ApiService.getInterviews();
    setInterviews(updated);
    setFeedbackModal(null);
    showToast('Interview feedback & rating recorded successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#2563EB] text-white border border-[#2563EB] px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#8AC9A7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-[#1E293B] dark:text-white">
            Interview Management
          </h1>
          <p className="text-xs text-[#64748B]">
            Schedule candidate panels, generate video links, and log post-interview evaluation scores
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Segmented View Mode */}
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 font-semibold rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#FFFFFF] dark:bg-[#1E293B]/30 text-[#1E293B] dark:text-[#FFFFFF] shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B] dark:hover:text-white'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 font-semibold rounded-lg transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-[#FFFFFF] dark:bg-[#1E293B]/30 text-[#1E293B] dark:text-[#FFFFFF] shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B] dark:hover:text-white'
              }`}
            >
              Calendar Schedule
            </button>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold shadow-xs shadow-[#2563EB]/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Interview</span>
          </button>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FFFFFF] dark:bg-slate-800/60 border-b border-[#D8E3F1] dark:border-slate-800 text-[#64748B] dark:text-slate-400">
                  <th className="p-3.5 font-semibold">Candidate</th>
                  <th className="p-3.5 font-semibold">Position &amp; Client</th>
                  <th className="p-3.5 font-semibold">Interviewer Panel</th>
                  <th className="p-3.5 font-semibold">Date &amp; Time</th>
                  <th className="p-3.5 font-semibold">Interview Type</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E3F1] dark:divide-slate-800">
                {interviews.map((intv) => (
                  <tr
                    key={intv.id}
                    className="hover:bg-[#FFFFFF]/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3.5">
                      <div className="font-bold text-[#1E293B] dark:text-white">{intv.applicantName}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-medium text-[#1E293B] dark:text-white">{intv.jobTitle}</div>
                      <div className="text-[11px] text-[#64748B]">{intv.client}</div>
                    </td>

                    <td className="p-3.5 text-[#1E293B] dark:text-slate-300">{intv.interviewer}</td>

                    <td className="p-3.5 font-mono text-xs">
                      <div className="text-[#1E293B] dark:text-white font-medium">{intv.date}</div>
                      <div className="text-[11px] text-[#1E293B] dark:text-[#64748B] font-semibold">{intv.time}</div>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-[#FFFFFF] dark:bg-slate-800 border border-[#D8E3F1] dark:border-slate-700 rounded font-mono text-[11px] text-[#1E293B] dark:text-[#FFFFFF]">
                        {intv.type}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${
                          intv.status === 'Completed'
                            ? 'bg-[#8AC9A7]/15 text-[#2E7D5B] border-[#8AC9A7]/30 dark:bg-[#8AC9A7]/20 dark:text-[#8AC9A7]'
                            : intv.status === 'Scheduled'
                            ? 'bg-[#FFFFFF] text-[#1E293B] border-[#2563EB]/30 dark:bg-[#1E293B]/20 dark:text-[#FFFFFF]'
                            : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                        }`}
                      >
                        {intv.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={intv.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-[#FFFFFF] dark:bg-slate-800 border border-[#D8E3F1] dark:border-slate-700 text-[#2E7D5B] dark:text-[#8AC9A7] hover:underline rounded font-semibold flex items-center gap-1"
                        >
                          <Video className="w-3.5 h-3.5 text-[#8AC9A7]" />
                          <span>Meet</span>
                        </a>

                        <button
                          onClick={() => setFeedbackModal(intv)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#1E293B] hover:text-[#1E293B] dark:text-[#64748B] dark:hover:text-white hover:bg-[#FFFFFF] dark:hover:bg-[#2563EB]/20 rounded-lg transition-colors"
                        >
                          Feedback
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calendar Schedule View */}
      {viewMode === 'calendar' && (
        <div className="p-6 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div className="text-xs font-mono text-[#1E293B] dark:text-[#64748B] uppercase font-semibold">
            Weekly Interview Timeline · November 2026
          </div>
          <div className="grid grid-cols-5 gap-3">
            {['Mon, Nov 02', 'Tue, Nov 03', 'Wed, Nov 04', 'Thu, Nov 05', 'Fri, Nov 06'].map(
              (day, dIdx) => (
                <div
                  key={day}
                  className="p-3 bg-[#FFFFFF] dark:bg-slate-800/60 border border-[#D8E3F1] dark:border-slate-700 rounded-xl space-y-2 min-h-64"
                >
                  <div className="text-xs font-bold text-[#1E293B] dark:text-white pb-2 border-b border-[#D8E3F1] dark:border-slate-700">
                    {day}
                  </div>
                  {dIdx === 4 ? (
                    <div className="p-2.5 bg-white dark:bg-slate-850 border border-[#2563EB] rounded-xl shadow-xs space-y-1 text-[11px]">
                      <div className="font-bold text-[#1E293B] dark:text-[#64748B]">Ananya Deshmukh</div>
                      <div className="text-[#64748B]">CloudScale Architecture</div>
                      <div className="font-mono text-[10px] text-[#1E293B] font-semibold">14:00 PST</div>
                    </div>
                  ) : dIdx === 2 ? (
                    <div className="p-2.5 bg-white dark:bg-slate-850 border border-[#8AC9A7] rounded-xl shadow-xs space-y-1 text-[11px]">
                      <div className="font-bold text-[#2E7D5B] dark:text-[#8AC9A7]">Devon Sterling</div>
                      <div className="text-[#64748B]">FinEdge Executive Panel</div>
                      <div className="font-mono text-[10px] text-[#2E7D5B] dark:text-[#8AC9A7] font-semibold">Completed (5/5)</div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-[#64748B] text-center pt-8">No sessions</div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1E293B] dark:text-white">
                Book Client Interview Panel
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-[#64748B] hover:text-[#1E293B] dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSchedule} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#1E293B] dark:text-slate-400 mb-1 font-medium">Candidate</label>
                <select
                  value={selectedApplicant}
                  onChange={(e) => setSelectedApplicant(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-slate-800 border border-[#D8E3F1] dark:border-slate-700 rounded-xl text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB]"
                >
                  {applicants.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currentDesignation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#1E293B] dark:text-slate-400 mb-1 font-medium">Requisition &amp; Client</label>
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-slate-800 border border-[#D8E3F1] dark:border-slate-700 rounded-xl text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB]"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} · {j.client}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#1E293B] dark:text-slate-400 mb-1 font-medium">Interviewer Panel</label>
                <input
                  type="text"
                  required
                  value={interviewer}
                  onChange={(e) => setInterviewer(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-slate-800 border border-[#D8E3F1] dark:border-slate-700 rounded-xl text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1E293B] dark:text-slate-400 mb-1 font-medium">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-slate-800 border border-[#D8E3F1] dark:border-slate-700 rounded-xl text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] dark:text-slate-400 mb-1 font-medium">Time Window</label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-slate-800 border border-[#D8E3F1] dark:border-slate-700 rounded-xl text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#1E293B] dark:text-slate-400 mb-1 font-medium">Interview Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as Interview['type'])}
                  className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-slate-800 border border-[#D8E3F1] dark:border-slate-700 rounded-xl text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="Technical Screen">Technical Screen</option>
                  <option value="Architecture Deep-Dive">Architecture Deep-Dive</option>
                  <option value="Hiring Manager">Hiring Manager</option>
                  <option value="Culture & Exec">Culture &amp; Exec</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 border border-[#D8E3F1] dark:border-slate-700 text-[#64748B] hover:text-[#1E293B] dark:text-slate-300 rounded-xl hover:bg-[#FFFFFF] dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl shadow-xs transition-colors"
                >
                  Confirm &amp; Generate Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1E293B] dark:text-white">
                  Log Interview Evaluation
                </h3>
                <div className="text-xs text-[#64748B]">
                  {feedbackModal.applicantName} · {feedbackModal.jobTitle}
                </div>
              </div>
              <button onClick={() => setFeedbackModal(null)} className="text-[#64748B] hover:text-[#1E293B] dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#1E293B] dark:text-slate-400 mb-1 font-medium">Panel Rating (1 - 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 text-[#1E293B]"
                    >
                      <Star
                        className={`w-5 h-5 ${feedbackRating >= star ? 'fill-current' : 'text-[#D8E3F1] dark:text-slate-600'}`}
                      />
                    </button>
                  ))}
                  <span className="font-mono font-bold ml-2 text-sm text-[#1E293B] dark:text-slate-200">{feedbackRating}/5</span>
                </div>
              </div>

              <div>
                <label className="block text-[#1E293B] dark:text-slate-400 mb-1 font-medium">Interview Feedback Notes</label>
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Technical depth, system design capability, cultural fit..."
                  className="w-full p-2.5 bg-[#FFFFFF] dark:bg-slate-800 border border-[#D8E3F1] dark:border-slate-700 rounded-xl text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setFeedbackModal(null)}
                  className="px-3.5 py-2 border border-[#D8E3F1] dark:border-slate-700 text-[#64748B] hover:text-[#1E293B] dark:text-slate-300 rounded-xl hover:bg-[#FFFFFF] dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFeedback}
                  className="px-4 py-2 bg-[#8AC9A7] hover:bg-[#72B591] text-[#1E293B] font-bold rounded-xl shadow-xs transition-colors"
                >
                  Save Feedback &amp; Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
