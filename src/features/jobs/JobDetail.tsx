import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  MapPin,
  Building2,
  DollarSign,
  Users,
  Clock,
  ArrowLeft,
  CheckCircle,
  Plus,
  Send,
  Calendar,
  ChevronRight,
  Globe,
  Award,
  Layers,
  FileText,
  Mail,
  UserCheck,
  ShieldCheck,
  Hash,
  Share2
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { Job, Applicant, JobStatus } from '../../types';

export const JobDetail: React.FC = () => {
  const { selectedId, navigate } = useAppStore();
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [status, setStatus] = useState<JobStatus>('Active');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (selectedId) {
      ApiService.getJobById(selectedId).then((j) => {
        if (j) {
          setJob(j);
          setStatus(j.status);
        }
      });
      ApiService.getApplicants().then((apps) => {
        setApplicants(apps.filter((a) => a.assignedJobId === selectedId));
      });
    } else {
      // Default to first job if no ID passed
      ApiService.getJobs().then((jobs) => {
        if (jobs.length > 0) {
          setJob(jobs[0]);
          setStatus(jobs[0].status);
          ApiService.getApplicants().then((apps) => {
            setApplicants(apps.filter((a) => a.assignedJobId === jobs[0].id));
          });
        }
      });
    }
  }, [selectedId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!job) {
    return (
      <div className="p-12 text-center text-xs text-[#5F5972]">
        Loading job posting dossier...
      </div>
    );
  }

  const handleStatusChange = async (newStatus: JobStatus) => {
    setStatus(newStatus);
    await ApiService.updateJob(job.id, { status: newStatus });
    showToast(`Status updated to ${newStatus}`);
  };

  const primarySkillsList = job.primarySkills && job.primarySkills.length > 0 
    ? job.primarySkills 
    : job.skills || [];

  const secondarySkillsList = job.secondarySkills && job.secondarySkills.length > 0 
    ? job.secondarySkills 
    : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#402568] text-white border border-[#6941C6] px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#8AC9A7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('jobs')}
          className="flex items-center gap-2 text-xs font-semibold text-[#5F5972] hover:text-[#6941C6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Job Postings</span>
        </button>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as JobStatus)}
            aria-label="Job Posting Status"
            className="px-3 py-2 bg-white dark:bg-[#221D2E] border border-[#E9E6EF] dark:border-[#383049] rounded-xl text-xs font-semibold text-[#292633] dark:text-white focus:outline-none focus:border-[#6941C6]"
          >
            <option value="Active">Status: Active</option>
            <option value="Open">Status: Open</option>
            <option value="Sourcing">Status: Sourcing</option>
            <option value="In Review">Status: In Review</option>
            <option value="Closed">Status: Closed</option>
            <option value="On Hold">Status: On Hold</option>
          </select>

          {/* Primary Action Button: Bright Orange #FF8243 */}
          <button
            onClick={() => navigate('applicant-new')}
            className="px-4 py-2 bg-[#FF8243] hover:bg-[#E96F30] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shadow-[#FF8243]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Candidate to Job</span>
          </button>
        </div>
      </div>

      {/* Hero Dossier Card: Ceipal Detailed Information */}
      <div className="p-6 bg-white dark:bg-[#221D2E] border border-[#E9E6EF] dark:border-[#383049] rounded-2xl shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E9E6EF] dark:border-[#383049]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-mono font-bold text-[#6941C6] dark:text-[#D1C5E4] px-2.5 py-0.5 rounded-lg bg-[#F1EBFA] dark:bg-[#312845] border border-[#6941C6]/30">
                {job.code}
              </span>
              {job.clientJobId && (
                <span className="font-mono text-[11px] text-[#5F5972] dark:text-[#B9B2CE] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                  Client Ref: {job.clientJobId}
                </span>
              )}
              <span className="text-[#8E88A2]">·</span>
              <span className="font-semibold text-[#292633] dark:text-white">{job.businessUnit || 'Ampcus Tech Pvt Ltd'}</span>
              <span className="text-[#8E88A2]">·</span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                job.priority === 'Urgent' 
                  ? 'bg-[#FF8243]/20 text-[#FF8243]' 
                  : 'bg-[#6941C6]/15 text-[#6941C6]'
              }`}>
                {job.priority} Priority
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#292633] dark:text-white">
              {job.title}
            </h1>

            <div className="flex items-center gap-4 flex-wrap text-xs text-[#5F5972] dark:text-[#B9B2CE]">
              <span className="flex items-center gap-1 font-semibold text-[#292633] dark:text-white">
                <Building2 className="w-3.5 h-3.5 text-[#6941C6]" />
                {job.client}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#8AC9A7]" />
                {job.location}
              </span>
              {job.states && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#F8F7FB] dark:bg-[#1A1624] border border-[#E9E6EF] dark:border-[#383049]">
                  State: {job.states}
                </span>
              )}
              <span className="px-2 py-0.5 rounded bg-[#F1EBFA] dark:bg-[#312845] text-[#6941C6] dark:text-[#D1C5E4] font-medium border border-[#E9E6EF] dark:border-[#4A4061]">
                {job.type}
              </span>
              {job.remoteJob && (
                <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-[#276749] dark:text-[#8AC9A7] font-medium border border-emerald-200">
                  Remote: {job.remoteJob}
                </span>
              )}
            </div>
          </div>

          {/* Rates Box */}
          <div className="p-4 bg-[#F8F7FB] dark:bg-[#1A1624] border border-[#E9E6EF] dark:border-[#383049] rounded-2xl min-w-[220px] text-right">
            <div className="text-xs text-[#5F5972] dark:text-[#B9B2CE]">Client Bill Rate / Salary</div>
            <div className="text-2xl font-bold font-mono text-[#292633] dark:text-white tabular-nums">
              {job.currency === 'INR' ? '₹' : '$'}{job.billRate} 
              <span className="text-xs font-normal text-[#5F5972]"> / {job.rateType === 'Yearly' ? 'yr' : 'hr'}</span>
            </div>
            <div className="text-xs font-mono text-[#276749] dark:text-[#8AC9A7] font-semibold mt-1">
              Target Pay: {job.currency === 'INR' ? '₹' : '$'}{job.payRate}/{job.rateType === 'Yearly' ? 'yr' : 'hr'}
            </div>
            <div className="text-[10px] text-[#8E88A2] mt-0.5">
              Est. Gross Margin: {job.currency === 'INR' ? '₹' : '$'}{Math.max(0, job.billRate - job.payRate)}/{job.rateType === 'Yearly' ? 'yr' : 'hr'}
            </div>
          </div>
        </div>

        {/* Ceipal Quick Attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          <div className="p-3 bg-[#F8F7FB] dark:bg-[#1A1624] rounded-xl border border-[#E9E6EF] dark:border-[#383049]">
            <span className="text-[10px] text-[#8E88A2] block uppercase tracking-wider font-semibold">Category</span>
            <span className="font-semibold text-[#292633] dark:text-white mt-0.5 block truncate">
              {job.category || 'Information Technology'}
            </span>
          </div>

          <div className="p-3 bg-[#F8F7FB] dark:bg-[#1A1624] rounded-xl border border-[#E9E6EF] dark:border-[#383049]">
            <span className="text-[10px] text-[#8E88A2] block uppercase tracking-wider font-semibold">Skill Type</span>
            <span className="font-semibold text-[#292633] dark:text-white mt-0.5 block truncate">
              {job.skillType || 'IT - Technical'}
            </span>
          </div>

          <div className="p-3 bg-[#F8F7FB] dark:bg-[#1A1624] rounded-xl border border-[#E9E6EF] dark:border-[#383049]">
            <span className="text-[10px] text-[#8E88A2] block uppercase tracking-wider font-semibold">Notice Period</span>
            <span className="font-semibold text-[#292633] dark:text-white mt-0.5 block truncate">
              {job.noticePeriod || 'Immediate to 30 Days'}
            </span>
          </div>

          <div className="p-3 bg-[#F8F7FB] dark:bg-[#1A1624] rounded-xl border border-[#E9E6EF] dark:border-[#383049]">
            <span className="text-[10px] text-[#8E88A2] block uppercase tracking-wider font-semibold">Duration</span>
            <span className="font-semibold text-[#292633] dark:text-white mt-0.5 block truncate">
              {job.duration || '12 Months'}
            </span>
          </div>

          <div className="p-3 bg-[#F8F7FB] dark:bg-[#1A1624] rounded-xl border border-[#E9E6EF] dark:border-[#383049]">
            <span className="text-[10px] text-[#8E88A2] block uppercase tracking-wider font-semibold">Experience</span>
            <span className="font-semibold text-[#292633] dark:text-white mt-0.5 block truncate">
              {job.minExperience ? `${job.minExperience} - ${job.maxExperience || '+'} Years` : job.experienceRequired}
            </span>
          </div>

          <div className="p-3 bg-[#F8F7FB] dark:bg-[#1A1624] rounded-xl border border-[#E9E6EF] dark:border-[#383049]">
            <span className="text-[10px] text-[#8E88A2] block uppercase tracking-wider font-semibold">Respond By</span>
            <span className="font-semibold text-[#292633] dark:text-white mt-0.5 block truncate">
              {job.respondBy || 'Open Until Filled'}
            </span>
          </div>
        </div>

        {/* Primary and Secondary Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#E9E6EF] dark:border-[#383049]">
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#292633] dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6941C6]"></span>
              <span>Primary Skills *</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {primarySkillsList.map((sk) => (
                <span
                  key={sk}
                  className="px-2.5 py-1 bg-[#F1EBFA] dark:bg-[#312845] border border-[#6941C6]/30 rounded-lg font-mono text-xs font-semibold text-[#6941C6] dark:text-[#D1C5E4]"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-[#292633] dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8AC9A7]"></span>
              <span>Secondary Skills</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {secondarySkillsList.length > 0 ? (
                secondarySkillsList.map((sk) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 bg-white dark:bg-[#1A1624] border border-[#E9E6EF] dark:border-[#383049] rounded-lg font-mono text-xs text-[#5F5972] dark:text-[#B9B2CE]"
                  >
                    {sk}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#8E88A2] italic">No secondary skills specified</span>
              )}
            </div>
          </div>
        </div>

        {/* Ceipal Organizational Management Stakeholders */}
        <div className="pt-4 border-t border-[#E9E6EF] dark:border-[#383049] space-y-3">
          <div className="text-xs font-bold text-[#292633] dark:text-white">
            Organizational Allocation &amp; Stakeholders
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-[#F8F7FB] dark:bg-[#1A1624] rounded-xl">
              <span className="text-[10px] text-[#8E88A2] block">Assigned Recruiter / Lead</span>
              <span className="font-semibold text-[#292633] dark:text-white mt-0.5 block">
                {job.assignedTo || job.assignedRecruiter || 'Priya Sharma'}
              </span>
            </div>

            <div className="p-3 bg-[#F8F7FB] dark:bg-[#1A1624] rounded-xl">
              <span className="text-[10px] text-[#8E88A2] block">Sales Manager</span>
              <span className="font-semibold text-[#292633] dark:text-white mt-0.5 block">
                {job.salesManager || 'David Miller'}
              </span>
            </div>

            <div className="p-3 bg-[#F8F7FB] dark:bg-[#1A1624] rounded-xl">
              <span className="text-[10px] text-[#8E88A2] block">Recruitment Manager</span>
              <span className="font-semibold text-[#292633] dark:text-white mt-0.5 block">
                {job.recruitmentManager || 'Sarah Jenkins'}
              </span>
            </div>

            <div className="p-3 bg-[#F8F7FB] dark:bg-[#1A1624] rounded-xl">
              <span className="text-[10px] text-[#8E88A2] block">Account Manager</span>
              <span className="font-semibold text-[#292633] dark:text-white mt-0.5 block">
                {job.accountManager || 'Rajesh Ramanathan'}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="pt-4 border-t border-[#E9E6EF] dark:border-[#383049] space-y-2 text-xs">
          <div className="font-bold text-[#292633] dark:text-white">Job Description</div>
          <div className="p-4 bg-[#F8F7FB] dark:bg-[#1A1624] border border-[#E9E6EF] dark:border-[#383049] rounded-xl text-[#5F5972] dark:text-[#B9B2CE] leading-relaxed whitespace-pre-wrap">
            {job.description}
          </div>
        </div>
      </div>

      {/* Associated Candidates Roster */}
      <div className="bg-white dark:bg-[#221D2E] border border-[#E9E6EF] dark:border-[#383049] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#292633] dark:text-white">
              Assigned Candidate Pipeline ({applicants.length})
            </h2>
            <p className="text-xs text-[#5F5972] dark:text-[#B9B2CE]">
              Profiles matched, screened, and submitted for this job posting
            </p>
          </div>
          <button
            onClick={() => navigate('applicant-new')}
            className="px-3 py-1.5 border border-[#6941C6] text-[#6941C6] hover:bg-[#F1EBFA] dark:hover:bg-[#312845] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Candidate</span>
          </button>
        </div>

        {applicants.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#8E88A2]">
            No candidates linked to this job posting yet.
          </div>
        ) : (
          <div className="divide-y divide-[#E9E6EF] dark:divide-[#383049]">
            {applicants.map((a) => (
              <div
                key={a.id}
                onClick={() => navigate('applicant-detail', a.id)}
                className="py-3 flex items-center justify-between hover:bg-[#F1EBFA]/50 dark:hover:bg-[#312845]/40 px-3 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img src={a.avatar} alt={a.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-[#E9E6EF]" />
                  <div>
                    <div className="text-xs font-bold text-[#292633] dark:text-white">{a.name}</div>
                    <div className="text-[11px] text-[#5F5972] dark:text-[#B9B2CE]">{a.currentDesignation} · {a.location}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="font-mono font-bold text-[#276749] dark:text-[#8AC9A7] bg-[#8AC9A7]/20 border border-[#8AC9A7]/40 px-2.5 py-0.5 rounded">
                    {a.matchScore}% Match
                  </span>
                  <span className="px-2 py-0.5 bg-[#F8F7FB] dark:bg-[#312845] border border-[#E9E6EF] dark:border-[#4A4061] rounded font-medium text-[#5F5972] dark:text-[#D1C5E4]">
                    {a.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#8E88A2]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
