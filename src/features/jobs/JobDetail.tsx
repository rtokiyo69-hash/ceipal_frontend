import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  Plus,
  Search,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Download,
  Trash2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Settings,
  Share2,
  Printer,
  Eye,
  Sparkles,
  Clock,
  RotateCcw,
  HelpCircle,
  Send,
  Star,
  X,
  Sliders,
  Filter,
  Tag,
  Briefcase,
  ShieldCheck,
  Layers,
  Globe,
  Award,
  Mail,
  Phone,
  UserCheck,
  FileCode,
  SlidersHorizontal,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { Job, Applicant, JobDocument, JobStatus, Submission, JobNote } from '../../types';

const CEIPAL_STATUS_OPTIONS = [
  'Select Status',
  'Waiting for Evaluation by Internal Reviewer',
  'Internal Disqualified',
  'Client Submission',
  'Interview Scheduled',
  'Offered',
  'Placed',
  'Not Joined',
  'In Review'
];

const renderSafeDescription = (description: string): React.ReactNode => {
  if (!description) return null;
  const parsedDescription = new DOMParser().parseFromString(description, 'text/html');
  const allowedTags = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'P', 'DIV', 'BR', 'H3', 'H4']);

  const renderNode = (node: Node, key: number): React.ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (!(node instanceof Element)) return null;

    const children = Array.from(node.childNodes).map((child, index) => renderNode(child, index));
    if (!allowedTags.has(node.tagName)) return children;

    const tagName = node.tagName.toLowerCase();
    const className = tagName === 'ul'
      ? 'list-disc pl-5 my-1 space-y-0.5'
      : tagName === 'ol'
        ? 'list-decimal pl-5 my-1 space-y-0.5'
        : tagName === 'p'
          ? 'my-1.5'
          : tagName === 'h3' || tagName === 'h4'
            ? 'font-bold text-xs text-[#1E293B] dark:text-white mt-2 mb-1'
            : undefined;
    return React.createElement(tagName, { key, className }, children);
  };

  return Array.from(parsedDescription.body.childNodes).map((node, index) => renderNode(node, index));
};

export const JobDetail: React.FC = () => {
  const { selectedId, navigate } = useAppStore();

  // All jobs for < > cycle navigation
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Top Tabs
  const [activeTab, setActiveTab] = useState<
    'snapshot' | 'job_details' | 'additional_details' | 'task_manager' | 'activities' | 'email_merges'
  >('snapshot');

  // Job Description Expand/Collapse
  const [isDescExpanded, setIsDescExpanded] = useState<boolean>(false);

  // Submissions section
  const [submissionFilterTab, setSubmissionFilterTab] = useState<
    'pipeline' | 'all' | 'client_submissions' | 'interviews' | 'confirmations' | 'placements' | 'not_joined'
  >('all');
  const [submissionSearch, setSubmissionSearch] = useState<string>('');

  // Notes section
  const [notesTab, setNotesTab] = useState<'job_posting' | 'applicant_reference'>('job_posting');
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState<boolean>(false);
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [newNoteCategory, setNewNoteCategory] = useState<'Job Posting' | 'Applicant Reference'>('Job Posting');

  // Documents section
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState<boolean>(false);
  const [newDocName, setNewDocName] = useState<string>('');
  const [newDocCategory, setNewDocCategory] = useState<string>('Client Job Spec (SOW)');

  // Modals & Drawers
  const [skillMatrixApplicant, setSkillMatrixApplicant] = useState<Applicant | null>(null);
  const [statusModalSubmission, setStatusModalSubmission] = useState<Submission | null>(null);
  const [selectedStatusValue, setSelectedStatusValue] = useState<string>('Waiting for Evaluation by Internal Reviewer');
  const [statusComment, setStatusComment] = useState<string>('');
  const [resumeApplicant, setResumeApplicant] = useState<Applicant | null>(null);
  const [isAiMatchingOpen, setIsAiMatchingOpen] = useState<boolean>(false);
  const [aiJobTitleWeight, setAiJobTitleWeight] = useState<number>(30);
  const [aiSkillsWeight, setAiSkillsWeight] = useState<number>(70);
  const [isPublicDetailsModalOpen, setIsPublicDetailsModalOpen] = useState<boolean>(false);
  const [isSubmitCandidateModalOpen, setIsSubmitCandidateModalOpen] = useState<boolean>(false);
  const [submitApplicantId, setSubmitApplicantId] = useState<string>('');
  const [submitBillRate, setSubmitBillRate] = useState<number>(0);
  const [submitPayRate, setSubmitPayRate] = useState<number>(0);

  // Secondary Gear & Action menus
  const [isGearMenuOpen, setIsGearMenuOpen] = useState<boolean>(false);
  const [isJobBoardsMenuOpen, setIsJobBoardsMenuOpen] = useState<boolean>(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState<boolean>(false);

  // Right Sidebar Search Criteria State
  const [booleanQuery, setBooleanQuery] = useState<string>('(PYTHON) AND (REACTJS) AND (POSTGRES)');
  const [searchJobTitle, setSearchJobTitle] = useState<string>('');
  const [recentJobTitleOnly, setRecentJobTitleOnly] = useState<boolean>(false);
  const [searchCountry, setSearchCountry] = useState<string>('India');
  const [searchState, setSearchState] = useState<string>('Maharashtra');
  const [searchCity, setSearchCity] = useState<string>('');
  const [includeNoCountry, setIncludeNoCountry] = useState<boolean>(false);
  const [minExp, setMinExp] = useState<number>(2);
  const [maxExp, setMaxExp] = useState<number>(5);
  const [educationDetails, setEducationDetails] = useState<string>("Bachelor's Degree");
  const [employer, setEmployer] = useState<string>('');
  const [mostRecentEmployerOnly, setMostRecentEmployerOnly] = useState<boolean>(false);
  const [willingToRelocate, setWillingToRelocate] = useState<'Yes' | 'No'>('Yes');
  const [isStringBuilderOpen, setIsStringBuilderOpen] = useState<boolean>(false);

  // Load Data
  useEffect(() => {
    ApiService.getJobs().then((jobs) => {
      setAllJobs(jobs);
      let targetJob = jobs.find((j) => j.id === selectedId);
      if (!targetJob && jobs.length > 0) {
        // Prefer demo job if available
        targetJob = jobs.find((j) => j.id === 'job-12262') || jobs[0];
      }
      if (targetJob) {
        setJob(targetJob);
        setSearchJobTitle(targetJob.title);
        setMinExp(targetJob.minExperience || 2);
        setMaxExp(targetJob.maxExperience || 5);
        if (targetJob.primarySkills && targetJob.primarySkills.length > 0) {
          setBooleanQuery(
            targetJob.primarySkills.map((s) => `(${s.trim().toUpperCase()})`).join(' AND ')
          );
        }
      }
    });

    ApiService.getApplicants().then((apps) => {
      setApplicants(apps);
    });

    ApiService.getSubmissions().then((subs) => {
      setSubmissions(subs);
    });
  }, [selectedId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Job pagination (< >)
  const currentJobIndex = useMemo(() => {
    if (!job || allJobs.length === 0) return 0;
    return allJobs.findIndex((j) => j.id === job.id);
  }, [job, allJobs]);

  const handlePrevJob = () => {
    if (allJobs.length === 0) return;
    const prevIdx = (currentJobIndex - 1 + allJobs.length) % allJobs.length;
    const target = allJobs[prevIdx];
    setJob(target);
    setSearchJobTitle(target.title);
  };

  const handleNextJob = () => {
    if (allJobs.length === 0) return;
    const nextIdx = (currentJobIndex + 1) % allJobs.length;
    const target = allJobs[nextIdx];
    setJob(target);
    setSearchJobTitle(target.title);
  };

  // Submissions for this job
  const jobSubmissions = useMemo(() => {
    if (!job) return [];
    return submissions.filter((s) => s.jobId === job.id || s.jobTitle === job.title);
  }, [submissions, job]);

  // Filtered submissions by tab and search
  const filteredSubmissions = useMemo(() => {
    return jobSubmissions.filter((sub) => {
      // Tab filter
      if (submissionFilterTab === 'pipeline') {
        const isPipeline = ['Waiting for Evaluation by Internal Reviewer', 'Pending Review', 'Submitted'].includes(sub.status);
        if (!isPipeline) return false;
      } else if (submissionFilterTab === 'client_submissions') {
        if (!sub.status.toLowerCase().includes('client')) return false;
      } else if (submissionFilterTab === 'interviews') {
        if (!sub.status.toLowerCase().includes('interview')) return false;
      } else if (submissionFilterTab === 'confirmations') {
        if (!['offered', 'selected', 'confirmed'].some((s) => sub.status.toLowerCase().includes(s))) return false;
      } else if (submissionFilterTab === 'placements') {
        if (!sub.status.toLowerCase().includes('place')) return false;
      } else if (submissionFilterTab === 'not_joined') {
        if (!sub.status.toLowerCase().includes('not joined')) return false;
      }

      // Search filter
      if (submissionSearch.trim()) {
        const q = submissionSearch.toLowerCase();
        const matchName = sub.applicantName.toLowerCase().includes(q);
        const matchId = sub.submissionId.toLowerCase().includes(q);
        const matchRecruiter = sub.recruiter.toLowerCase().includes(q);
        const matchStatus = sub.status.toLowerCase().includes(q);
        return matchName || matchId || matchRecruiter || matchStatus;
      }
      return true;
    });
  }, [jobSubmissions, submissionFilterTab, submissionSearch]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      pipeline: jobSubmissions.filter((s) =>
        ['Waiting for Evaluation by Internal Reviewer', 'Pending Review', 'Submitted'].includes(s.status)
      ).length,
      all: jobSubmissions.length,
      client_submissions: jobSubmissions.filter((s) => s.status.toLowerCase().includes('client')).length,
      interviews: jobSubmissions.filter((s) => s.status.toLowerCase().includes('interview')).length,
      confirmations: jobSubmissions.filter((s) => ['offered', 'selected', 'confirmed'].some((k) => s.status.toLowerCase().includes(k))).length,
      placements: jobSubmissions.filter((s) => s.status.toLowerCase().includes('place')).length,
      not_joined: jobSubmissions.filter((s) => s.status.toLowerCase().includes('not joined')).length
    };
  }, [jobSubmissions]);

  // Document download
  const handleDownloadDocument = async (item: JobDocument) => {
    try {
      const file = await ApiService.getJobDocument(item.id);
      if (!file) throw new Error(`Stored file "${item.name}" could not be retrieved.`);
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // Fallback create fake download for mock files
      const blob = new Blob([`Job requisition specification document: ${item.name}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast(`Downloaded ${item.name}`);
    }
  };

  // Add Note
  const handleAddNote = async () => {
    if (!job || !newNoteText.trim()) return;
    const added = await ApiService.addJobNote(job.id, {
      author: job.assignedRecruiter || 'Ganesh Godse',
      text: newNoteText.trim(),
      date: new Date().toLocaleString(),
      category: newNoteCategory
    });
    setJob((prev) => prev ? { ...prev, notes: [added, ...(prev.notes || [])] } : null);
    setNewNoteText('');
    setIsAddNoteModalOpen(false);
    showToast('Note added successfully');
  };

  // Delete Note
  const handleDeleteNote = async (noteId: string) => {
    if (!job) return;
    await ApiService.deleteJobNote(job.id, noteId);
    setJob((prev) => prev ? { ...prev, notes: (prev.notes || []).filter((n) => n.id !== noteId) } : null);
    showToast('Note deleted');
  };

  // Upload Document
  const handleUploadDocument = async () => {
    if (!job || !newDocName.trim()) return;
    const newDoc: JobDocument = {
      id: `jobdoc-${Date.now()}`,
      name: newDocName.trim(),
      type: 'application/pdf',
      size: Math.floor(Math.random() * 40000 + 10000)
    };
    await ApiService.addJobDocument(job.id, newDoc);
    setJob((prev) => prev ? { ...prev, documents: [...(prev.documents || []), newDoc] } : null);
    setNewDocName('');
    setIsUploadDocModalOpen(false);
    showToast('Document uploaded successfully');
  };

  // Delete Document
  const handleDeleteDocument = async (docId: string) => {
    if (!job) return;
    await ApiService.deleteJobDocument(job.id, docId);
    setJob((prev) => prev ? { ...prev, documents: (prev.documents || []).filter((d) => d.id !== docId) } : null);
    showToast('Document removed');
  };

  // Update Submission Status Modal
  const handleOpenStatusModal = (sub: Submission) => {
    setStatusModalSubmission(sub);
    setSelectedStatusValue(sub.status);
    setStatusComment('');
  };

  const handleUpdateSubmissionStatus = async () => {
    if (!statusModalSubmission) return;
    const updated = await ApiService.updateSubmissionStatus(
      statusModalSubmission.id,
      selectedStatusValue,
      statusComment
    );
    if (updated) {
      setSubmissions((prev) => prev.map((s) => s.id === updated.id ? updated : s));
      showToast(`Submission status updated to "${selectedStatusValue}"`);
    }
    setStatusModalSubmission(null);
  };

  // Submit Candidate to Job
  const handleQuickSubmitCandidate = async () => {
    if (!job || !submitApplicantId) return;
    const cand = applicants.find((a) => a.id === submitApplicantId);
    if (!cand) return;

    const newSub = await ApiService.createSubmission({
      applicantId: cand.id,
      applicantName: cand.name,
      jobId: job.id,
      jobTitle: job.title,
      client: job.client,
      recruiter: job.assignedRecruiter || 'Ganesh Godse',
      billRate: submitBillRate || job.billRate,
      payRate: submitPayRate || job.payRate,
      status: 'Waiting for Evaluation by Internal Reviewer'
    });

    setSubmissions((prev) => [newSub, ...prev]);
    setIsSubmitCandidateModalOpen(false);
    showToast(`Submitted ${cand.name} to ${job.code}`);
  };

  // AI Matching Quick Submit
  const handleAiMatchingSubmit = async (cand: Applicant) => {
    if (!job) return;
    const newSub = await ApiService.createSubmission({
      applicantId: cand.id,
      applicantName: cand.name,
      jobId: job.id,
      jobTitle: job.title,
      client: job.client,
      recruiter: job.assignedRecruiter || 'Ganesh Godse',
      billRate: job.billRate,
      payRate: job.payRate,
      status: 'Waiting for Evaluation by Internal Reviewer'
    });
    setSubmissions((prev) => [newSub, ...prev]);
    showToast(`AI Match: ${cand.name} submitted to requisition!`);
  };

  // Find applicant record helper
  const findApplicantForSubmission = (sub: Submission): Applicant | undefined => {
    return applicants.find((a) => a.id === sub.applicantId || a.name === sub.applicantName);
  };

  if (!job) {
    return (
      <div className="p-16 text-center text-xs text-[#64748B]">
        Loading job posting dossier...
      </div>
    );
  }

  // Pre-calculate sample skill matrix items if applicant has no deep skills
  const getCandidateSkillMatrix = (cand: Applicant) => {
    const defaultMatrix = [
      { skill: 'Python (Programming Language)', exp: '4.2 yrs' },
      { skill: 'PostgreSQL', exp: '5.3 yrs' },
      { skill: 'Amazon Web Services', exp: '3.7 yrs' },
      { skill: 'ReactJS', exp: '3.7 yrs' },
      { skill: 'Fastapi', exp: '3.7 yrs' },
      { skill: 'Amazon Elastic Compute Cloud', exp: '3.7 yrs' },
      { skill: 'Amazon S3', exp: '3.7 yrs' },
      { skill: 'Github', exp: '3.7 yrs' },
      { skill: 'Retail Commerce', exp: '3.7 yrs' },
      { skill: 'TypeScript', exp: '3.7 yrs' },
      { skill: 'Amazon Relational Database Service', exp: '3.7 yrs' },
      { skill: 'Restful APIs', exp: '3.7 yrs' },
      { skill: 'Docker', exp: '3.7 yrs' },
      { skill: 'Microsoft Excel', exp: '3.7 yrs' },
      { skill: 'Audit Trail', exp: '3.7 yrs' },
      { skill: 'Code Review', exp: '3.7 yrs' },
      { skill: 'E-Commerce', exp: '3.7 yrs' },
      { skill: 'Role-Based Access Control', exp: '3.7 yrs' },
      { skill: 'Order Management', exp: '3.7 yrs' },
      { skill: 'Dashboards', exp: '3.7 yrs' },
      { skill: 'MySQL', exp: '1.7 yrs' },
      { skill: 'Vehicle Fleet Management', exp: '1.7 yrs' },
      { skill: 'Application Programming Interfaces (APIs)', exp: '1.7 yrs' },
      { skill: 'Automation', exp: '1.7 yrs' },
      { skill: 'Bank Reconciliation', exp: '1.7 yrs' },
      { skill: 'Code Coverage', exp: '1.7 yrs' }
    ];

    if (cand.skills && cand.skills.length > 5) {
      return cand.skills.map((s, idx) => ({
        skill: s,
        exp: `${(Math.max(1.2, (cand.experienceYears || 4) - (idx * 0.3))).toFixed(1)} yrs`
      }));
    }
    return defaultMatrix;
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#0F172A] text-[#1E293B] dark:text-[#E2E8F0] pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#2563EB] text-white border border-[#2563EB] px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#8AC9A7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Secondary Navigation Tabs (Ceipal Authenticity) */}
      <div className="bg-white dark:bg-[#475569] border-b border-[#D8E3F1] dark:border-[#1F2937] sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 flex items-center justify-between h-11 text-xs">
          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'snapshot', label: 'Snapshot' },
              { id: 'job_details', label: 'Job Details' },
              { id: 'additional_details', label: 'Additional Details' },
              { id: 'task_manager', label: 'Task Manager' },
              { id: 'activities', label: 'Activities' },
              { id: 'email_merges', label: 'Email Merges' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3 py-2 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#2563EB] text-[#1E293B] dark:text-[#60A5FA]'
                    : 'border-transparent text-[#64748B] dark:text-[#64748B] hover:text-[#1E293B] dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Header Action Icons & Menus */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Gear Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsGearMenuOpen(!isGearMenuOpen)}
                className="p-1.5 rounded-lg border border-[#D8E3F1] dark:border-[#334155] text-[#64748B] dark:text-[#64748B] hover:bg-[#FFFFFF] dark:hover:bg-[#475569] flex items-center gap-1"
                title="Job Settings"
              >
                <Settings className="w-3.5 h-3.5" />
                <ChevronDown className="w-3 h-3 text-[#64748B]" />
              </button>

              {isGearMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl shadow-xl py-1 text-xs z-40 animate-in fade-in">
                  <button
                    onClick={() => {
                      setIsAddNoteModalOpen(true);
                      setIsGearMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#FFFFFF] dark:hover:bg-[#475569] flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#1E293B]" />
                    <span>Add Notes</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUploadDocModalOpen(true);
                      setIsGearMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#FFFFFF] dark:hover:bg-[#475569] flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-[#1E293B]" />
                    <span>Upload Document</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      showToast('Job requisition link copied to clipboard');
                      setIsGearMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#FFFFFF] dark:hover:bg-[#475569] flex items-center gap-2"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#1E293B]" />
                    <span>Share Job</span>
                  </button>
                  <button
                    onClick={() => {
                      window.print();
                      setIsGearMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#FFFFFF] dark:hover:bg-[#475569] flex items-center gap-2"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#1E293B]" />
                    <span>Print Requisition</span>
                  </button>
                </div>
              )}
            </div>

            {/* Job Boards Button */}
            <div className="relative">
              <button
                onClick={() => setIsJobBoardsMenuOpen(!isJobBoardsMenuOpen)}
                className="px-2.5 py-1.5 rounded-lg border border-[#D8E3F1] dark:border-[#334155] text-[#64748B] dark:text-[#D8E3F1] hover:bg-[#FFFFFF] dark:hover:bg-[#475569] flex items-center gap-1 font-medium"
              >
                <span>Job Boards</span>
                <ChevronDown className="w-3 h-3 text-[#64748B]" />
              </button>

              {isJobBoardsMenuOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl shadow-xl py-1 text-xs z-40">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#64748B]">Broadcast To</div>
                  {['LinkedIn Recruiter', 'Indeed Direct', 'Monster Worldwide', 'Dice Tech', 'CareerBuilder'].map((board) => (
                    <button
                      key={board}
                      onClick={() => {
                        showToast(`Broadcast queued for ${board}`);
                        setIsJobBoardsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#FFFFFF] dark:hover:bg-[#475569] flex items-center justify-between"
                    >
                      <span>{board}</span>
                      <Check className="w-3 h-3 text-[#8AC9A7]" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Share Button */}
            <div className="relative">
              <button
                onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                className="px-2.5 py-1.5 rounded-lg border border-[#D8E3F1] dark:border-[#334155] text-[#64748B] dark:text-[#D8E3F1] hover:bg-[#FFFFFF] dark:hover:bg-[#475569] flex items-center gap-1 font-medium"
              >
                <span>Share</span>
                <ChevronDown className="w-3 h-3 text-[#64748B]" />
              </button>

              {isShareMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl shadow-xl py-1 text-xs z-40">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      showToast('Direct requisition URL copied');
                      setIsShareMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#FFFFFF] dark:hover:bg-[#475569]"
                  >
                    Copy Direct URL
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `Check out opening: ${job.title} (${job.code}) at ${job.client} - Location: ${job.location}`
                      );
                      showToast('Candidate pitch copied');
                      setIsShareMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#FFFFFF] dark:hover:bg-[#475569]"
                  >
                    Copy Candidate Pitch
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ceipal Status Alert Banner */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 pt-3">
        {job.status === 'Draft' ? (
          <div className="bg-[#FFFBEB] dark:bg-[#382D16] border border-[#FDE68A] dark:border-[#785918] text-[#92400E] dark:text-[#FCD34D] px-4 py-2 rounded-lg text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#D97706]" />
              <span>This Job was saved as Draft</span>
            </div>
            <button
              onClick={async () => {
                await ApiService.updateJob(job.id, { status: 'Active' });
                setJob({ ...job, status: 'Active' });
                showToast('Job marked as Active Requisition');
              }}
              className="text-[11px] font-bold text-[#1E293B] hover:underline cursor-pointer"
            >
              Publish Requisition Now
            </button>
          </div>
        ) : job.status === 'Open' || job.status === 'Active' ? (
          <div className="bg-[#EFF8F3] dark:bg-[#16382B] border border-[#8AC9A7]/60 text-[#276749] dark:text-[#8AC9A7] px-4 py-2 rounded-lg text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8AC9A7] animate-pulse"></span>
              <span>Active Requisition — Ready for applicant submissions and sourcing pipeline.</span>
            </div>
            <span className="font-mono text-[11px] font-semibold">Priority: {job.priority}</span>
          </div>
        ) : (
          <div className="bg-[#FFFFFF] dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] text-[#64748B] dark:text-[#BFDBFE] px-4 py-2 rounded-lg text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>This requisition is {job.status}.</span>
            </div>
            <span className="font-mono text-[11px] font-semibold">Priority: {job.priority}</span>
          </div>
        )}
      </div>

      {/* Main 2-Column Split: Left Dossier & Submissions + Right Ceipal Search Criteria */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 pt-4">
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* ========================================================= */}
          {/* LEFT MAIN PANE (approx 70% width) */}
          {/* ========================================================= */}
          <div className="w-full lg:w-[69%] space-y-4">
            {/* Top Job Hero Card */}
            <div className="bg-white dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#1F2937] rounded-xl p-5 shadow-xs space-y-4">
              {/* Header Row */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => navigate('jobs')}
                    className="p-1.5 rounded-lg border border-[#D8E3F1] dark:border-[#334155] text-[#64748B] dark:text-[#64748B] hover:bg-[#FFFFFF] dark:hover:bg-[#475569]"
                    title="Back to Job Postings"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#2563EB] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                      ★
                    </span>
                    <h1 className="text-base sm:text-lg font-bold text-[#1E293B] dark:text-white flex items-center gap-1.5">
                      <span>{job.code} - {job.title}</span>
                      <Search className="w-3.5 h-3.5 text-[#64748B] cursor-pointer hover:text-[#1E293B]" />
                    </h1>
                  </div>
                </div>

                {/* Previous / Next Job Navigation Arrows (< >) */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevJob}
                    className="p-1 rounded-md border border-[#D8E3F1] dark:border-[#334155] text-[#64748B] hover:bg-[#FFFFFF] dark:hover:bg-[#475569]"
                    title="Previous Job"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextJob}
                    className="p-1 rounded-md border border-[#D8E3F1] dark:border-[#334155] text-[#64748B] hover:bg-[#FFFFFF] dark:hover:bg-[#475569]"
                    title="Next Job"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-header details & action buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap text-[#64748B] dark:text-[#64748B]">
                  <span className="flex items-center gap-1 font-semibold text-[#1E293B] dark:text-[#60A5FA]">
                    <ExternalLink className="w-3.5 h-3.5" />
                    {job.client}
                  </span>
                  <span>|</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#8AC9A7]" />
                    {job.location || 'N/A, Maharashtra, India'}
                  </span>
                  <span>·</span>
                  <span>Assigned To - {job.assignedTo || job.assignedRecruiter || 'Ganesh Godse'}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate('job-new')}
                    className="px-3 py-1.5 rounded-lg border border-[#2563EB] text-[#1E293B] dark:text-[#60A5FA] hover:bg-[#FFFFFF] dark:hover:bg-[#475569] font-semibold text-xs transition-colors"
                  >
                    Edit Job
                  </button>

                  <button
                    onClick={() => setIsAiMatchingOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#4F46E5] hover:to-[#7C3AED] text-white font-semibold text-xs shadow-xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Matching Profiles</span>
                  </button>
                </div>
              </div>

              {/* 4-Column Key Metrics Card (Ceipal exact layout) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#D8E3F1] dark:border-[#1F2937] text-xs">
                <div>
                  <div className="text-[11px] text-[#64748B]">Recruitment Manager</div>
                  <div className="font-semibold text-[#1E293B] dark:text-white mt-0.5 truncate">
                    {job.recruitmentManager || 'Sachin Wadeyar'}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-[#64748B] flex items-center gap-1">
                    <span>Client Bill Rate / Salary</span>
                    <HelpCircle className="w-3 h-3 text-[#1E293B]" />
                  </div>
                  <div className="font-semibold text-[#1E293B] dark:text-white mt-0.5">
                    {job.billRate && job.billRate > 0
                      ? `${job.currency === 'INR' ? '₹' : '$'}${job.billRate} / hr`
                      : 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-[#64748B]">Created By &amp; On</div>
                  <div className="font-semibold text-[#1E293B] dark:text-white mt-0.5">
                    <div>{job.assignedRecruiter || 'Ganesh Godse'}</div>
                    <div className="text-[10px] text-[#64748B]">On {job.createdDate || '10/11/2026'}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-[#64748B]">Business Unit</div>
                  <div className="font-semibold text-[#1E293B] dark:text-white mt-0.5 truncate">
                    {job.businessUnit || 'Ampcus Tech Pvt Ltd.'}
                  </div>
                </div>
              </div>

              {/* Job Description Card with More/Less toggle */}
              <div className="pt-3 border-t border-[#D8E3F1] dark:border-[#1F2937] text-xs space-y-1.5">
                <div className="flex items-center gap-1 font-semibold text-[#1E293B] dark:text-white">
                  <span>Job Description</span>
                  <FileText className="w-3.5 h-3.5 text-[#1E293B]" />
                </div>

                <div
                  className={`text-[#64748B] dark:text-[#64748B] leading-relaxed ${
                    !isDescExpanded ? 'line-clamp-2' : ''
                  }`}
                >
                  {renderSafeDescription(job.description)}
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="text-[#1E293B] hover:underline font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <span>{isDescExpanded ? '^ Less' : 'More ∨'}</span>
                  </button>

                  <button
                    onClick={() => setIsPublicDetailsModalOpen(true)}
                    className="px-2 py-0.5 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-[10px] font-bold"
                  >
                    Add Public Job Details
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-Tab View Switching: Snapshot vs Job Details vs Tasks vs Activities */}
            {activeTab === 'snapshot' && (
              <>
                {/* ========================================================= */}
                {/* SUBMISSIONS TABLE SECTION */}
                {/* ========================================================= */}
                <div className="bg-white dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#1F2937] rounded-xl shadow-xs overflow-hidden">
                  {/* Submissions Header & Filters */}
                  <div className="p-4 border-b border-[#D8E3F1] dark:border-[#1F2937] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-[#1E293B] dark:text-white">Submissions</h2>
                        <button
                          onClick={() => setIsSubmitCandidateModalOpen(true)}
                          className="px-2 py-1 bg-[#FFFFFF] dark:bg-[#475569] border border-[#2563EB]/40 text-[#1E293B] dark:text-[#60A5FA] rounded-md text-[11px] font-bold hover:bg-[#2563EB] hover:text-white transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Submit Candidate</span>
                        </button>
                      </div>

                      {/* Search Bar */}
                      <div className="relative w-full sm:w-64">
                        <input
                          type="text"
                          value={submissionSearch}
                          onChange={(e) => setSubmissionSearch(e.target.value)}
                          placeholder="Search candidate name or ID..."
                          className="w-full pl-8 pr-3 py-1.5 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg text-xs text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB]"
                        />
                        <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-2.5" />
                        {submissionSearch && (
                          <button
                            onClick={() => setSubmissionSearch('')}
                            className="absolute right-2.5 top-2 text-[#64748B] hover:text-black dark:hover:text-white text-xs"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Submissions Filter Tabs (Ceipal exact) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
                      {[
                        { id: 'pipeline', label: 'Pipeline', count: tabCounts.pipeline },
                        { id: 'all', label: 'All', count: tabCounts.all },
                        { id: 'client_submissions', label: 'Client Submissions', count: tabCounts.client_submissions },
                        { id: 'interviews', label: 'Interviews', count: tabCounts.interviews },
                        { id: 'confirmations', label: 'Confirmations', count: tabCounts.confirmations },
                        { id: 'placements', label: 'Placements', count: tabCounts.placements },
                        { id: 'not_joined', label: 'Not Joined', count: tabCounts.not_joined }
                      ].map((tab) => {
                        const isActive = submissionFilterTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setSubmissionFilterTab(tab.id as typeof submissionFilterTab)}
                            className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                              isActive
                                ? 'bg-[#2563EB] text-white shadow-xs'
                                : 'bg-[#FFFFFF] dark:bg-[#1E293B] text-[#64748B] dark:text-[#64748B] hover:bg-[#FFFFFF] dark:hover:bg-[#475569]'
                            }`}
                          >
                            <span>{tab.label}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-[#D8E3F1] dark:bg-[#334155] text-[#1E293B] dark:text-white'
                              }`}
                            >
                              {tab.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submissions Table with horizontal scroll if needed */}
                  <div className="overflow-x-auto ceipal-table-scroll">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#FFFFFF]/60 dark:bg-[#1E293B] border-b border-[#D8E3F1] dark:border-[#1F2937] text-[11px] font-bold text-[#64748B] dark:text-[#64748B] uppercase tracking-wider">
                          <th className="py-2.5 px-4">NAME</th>
                          <th className="py-2.5 px-4">SUBMITTED BY / ON</th>
                          <th className="py-2.5 px-4">CONTACT / LOCATION</th>
                          <th className="py-2.5 px-4">PAY RATE / WORK AUTH</th>
                          <th className="py-2.5 px-4">STATUS</th>
                          <th className="py-2.5 px-4 text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D8E3F1] dark:divide-[#1F2937]">
                        {filteredSubmissions.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-xs text-[#64748B]">
                              <div className="space-y-2">
                                <p>No data available</p>
                                <button
                                  onClick={() => setIsSubmitCandidateModalOpen(true)}
                                  className="text-[#1E293B] dark:text-[#60A5FA] font-semibold hover:underline"
                                >
                                  + Submit a candidate to this requisition
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredSubmissions.map((sub) => {
                            const cand = findApplicantForSubmission(sub);
                            return (
                              <tr
                                key={sub.id}
                                className="hover:bg-[#FFFFFF] dark:hover:bg-[#1E293B]/60 transition-colors"
                              >
                                {/* Name column */}
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={
                                        cand?.avatar ||
                                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'
                                      }
                                      alt={sub.applicantName}
                                      className="w-9 h-9 rounded-full object-cover ring-1 ring-[#D8E3F1] shrink-0"
                                    />
                                    <div>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <button
                                          onClick={() => {
                                            if (cand) setResumeApplicant(cand);
                                          }}
                                          className="font-bold text-[#1E293B] dark:text-[#60A5FA] hover:underline text-xs"
                                        >
                                          {sub.applicantName}
                                        </button>
                                        <span className="font-mono text-[10px] text-[#64748B] px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800">
                                          {cand?.applicantId || sub.submissionId}
                                        </span>
                                      </div>
                                      <div className="text-[11px] text-[#64748B] dark:text-[#64748B]">
                                        {cand?.currentDesignation || 'Software Specialist'}
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        {cand?.matchScore && (
                                          <span className="text-[10px] font-bold font-mono text-[#276749] dark:text-[#8AC9A7] bg-[#8AC9A7]/20 px-1.5 py-0.2 rounded">
                                            {cand.matchScore}% Match
                                          </span>
                                        )}
                                        <button
                                          onClick={() => {
                                            if (cand) setResumeApplicant(cand);
                                          }}
                                          className="text-[10px] text-[#1E293B] hover:underline font-semibold flex items-center gap-0.5"
                                        >
                                          <Eye className="w-3 h-3" />
                                          <span>View Resume</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Submitted by / on */}
                                <td className="py-3 px-4">
                                  <div className="font-semibold text-[#1E293B] dark:text-white">
                                    {sub.recruiter}
                                  </div>
                                  <div className="text-[10px] text-[#64748B] flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    <span>{sub.submittedDate}</span>
                                  </div>
                                </td>

                                {/* Contact / Location */}
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-1 text-[#1E293B] dark:text-white font-medium">
                                    <Phone className="w-3 h-3 text-[#1E293B]" />
                                    <span>{cand?.phone || '+91 9423022606'}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[11px] text-[#64748B] dark:text-[#64748B] mt-0.5 truncate max-w-[200px]">
                                    <Mail className="w-3 h-3 text-[#64748B]" />
                                    <span>{cand?.email || 'candidate@example.com'}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-[#64748B] mt-0.5">
                                    <MapPin className="w-3 h-3 text-[#8AC9A7]" />
                                    <span>{cand?.location || 'Nashik, India'}</span>
                                  </div>
                                </td>

                                {/* Pay Rate / Work Auth */}
                                <td className="py-3 px-4">
                                  <div className="font-mono font-semibold text-[#1E293B] dark:text-white">
                                    {sub.payRate > 0
                                      ? `$${sub.payRate}/hr`
                                      : cand?.expectedSalary || 'INR - 0.00..'}
                                  </div>
                                  <div className="text-[10px] text-[#64748B] mt-0.5">
                                    Notice: {cand?.noticePeriod || '15 Days'}
                                  </div>
                                </td>

                                {/* Status Badge (interactive click to update status) */}
                                <td className="py-3 px-4">
                                  <button
                                    onClick={() => handleOpenStatusModal(sub)}
                                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#FFFFFF] dark:bg-[#475569] border border-[#2563EB]/40 text-[#1E293B] dark:text-[#60A5FA] hover:bg-[#2563EB] hover:text-white transition-colors cursor-pointer text-left block"
                                    title="Click to change application status"
                                  >
                                    <span>{sub.status}</span>
                                    <span className="block text-[9px] text-[#64748B] dark:text-[#64748B] font-normal mt-0.5">
                                      Click to update ▾
                                    </span>
                                  </button>
                                </td>

                                {/* Actions */}
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => {
                                        if (cand) setSkillMatrixApplicant(cand);
                                      }}
                                      className="p-1.5 rounded-lg border border-[#D8E3F1] dark:border-[#334155] text-[#1E293B] hover:bg-[#FFFFFF] dark:hover:bg-[#475569]"
                                      title="Open Skill Matrix"
                                    >
                                      <SlidersHorizontal className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => handleOpenStatusModal(sub)}
                                      className="p-1.5 rounded-lg border border-[#D8E3F1] dark:border-[#334155] text-[#276749] hover:bg-emerald-50 dark:hover:bg-emerald-950"
                                      title="Update Status"
                                    >
                                      <UserCheck className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => {
                                        if (cand) setResumeApplicant(cand);
                                      }}
                                      className="p-1.5 rounded-lg border border-[#D8E3F1] dark:border-[#334155] text-[#64748B] hover:bg-[#FFFFFF] dark:hover:bg-[#475569]"
                                      title="View Resume"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => {
                                        showToast(`Email drafted for ${sub.applicantName}`);
                                      }}
                                      className="p-1.5 rounded-lg border border-[#D8E3F1] dark:border-[#334155] text-[#64748B] hover:bg-[#FFFFFF] dark:hover:bg-[#475569]"
                                      title="Send Email"
                                    >
                                      <Mail className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* NOTES SECTION */}
                {/* ========================================================= */}
                <div className="bg-white dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#1F2937] rounded-xl shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-[#D8E3F1] dark:border-[#1F2937] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-sm font-bold text-[#1E293B] dark:text-white">Notes</h2>
                      <div className="flex items-center gap-1 text-xs">
                        <button
                          onClick={() => setNotesTab('job_posting')}
                          className={`px-2.5 py-1 rounded-md font-semibold text-[11px] ${
                            notesTab === 'job_posting'
                              ? 'bg-[#2563EB] text-white'
                              : 'bg-[#FFFFFF] dark:bg-[#1E293B] text-[#64748B]'
                          }`}
                        >
                          Job Posting ({job.notes?.filter((n) => n.category === 'Job Posting').length || 0})
                        </button>
                        <button
                          onClick={() => setNotesTab('applicant_reference')}
                          className={`px-2.5 py-1 rounded-md font-semibold text-[11px] ${
                            notesTab === 'applicant_reference'
                              ? 'bg-[#2563EB] text-white'
                              : 'bg-[#FFFFFF] dark:bg-[#1E293B] text-[#64748B]'
                          }`}
                        >
                          Applicant Reference ({job.notes?.filter((n) => n.category === 'Applicant Reference').length || 0})
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsAddNoteModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-md text-xs font-semibold flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Notes Table */}
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#FFFFFF]/60 dark:bg-[#1E293B] border-b border-[#D8E3F1] dark:border-[#1F2937] text-[11px] font-bold text-[#64748B] dark:text-[#64748B] uppercase">
                        <th className="py-2.5 px-4 w-48">ADDED BY / ON</th>
                        <th className="py-2.5 px-4">NOTES / DESCRIPTION</th>
                        <th className="py-2.5 px-4 w-24 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8E3F1] dark:divide-[#1F2937]">
                      {(!job.notes || job.notes.filter((n) => (n.category || 'Job Posting') === (notesTab === 'job_posting' ? 'Job Posting' : 'Applicant Reference')).length === 0) ? (
                        <tr>
                          <td colSpan={3} className="py-6 text-center text-xs text-[#64748B]">
                            No data available
                          </td>
                        </tr>
                      ) : (
                        job.notes
                          .filter((n) => (n.category || 'Job Posting') === (notesTab === 'job_posting' ? 'Job Posting' : 'Applicant Reference'))
                          .map((note) => (
                            <tr key={note.id} className="hover:bg-[#FFFFFF] dark:hover:bg-[#1E293B]/60">
                              <td className="py-2.5 px-4">
                                <div className="font-semibold text-[#1E293B] dark:text-white">{note.author}</div>
                                <div className="text-[10px] text-[#64748B]">{note.date}</div>
                              </td>
                              <td className="py-2.5 px-4 text-[#64748B] dark:text-[#D8E3F1] whitespace-pre-wrap">
                                {note.text}
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Delete Note"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ========================================================= */}
                {/* DOCUMENTS SECTION */}
                {/* ========================================================= */}
                <div className="bg-white dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#1F2937] rounded-xl shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-[#D8E3F1] dark:border-[#1F2937] flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#1E293B] dark:text-white">Documents</h2>
                    <button
                      onClick={() => setIsUploadDocModalOpen(true)}
                      className="px-2.5 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-md text-xs font-semibold flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {(!job.documents || job.documents.length === 0) ? (
                    <div className="py-8 text-center text-xs text-[#64748B]">
                      No data available
                    </div>
                  ) : (
                    <div className="divide-y divide-[#D8E3F1] dark:divide-[#1F2937]">
                      {job.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3.5 px-4 flex items-center justify-between hover:bg-[#FFFFFF] dark:hover:bg-[#1E293B]/60 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#FFFFFF] dark:bg-[#475569] text-[#1E293B] dark:text-[#60A5FA]">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#1E293B] dark:text-white">
                                {doc.name}
                              </div>
                              <div className="text-[10px] text-[#64748B]">
                                {(doc.size / 1024).toFixed(1)} KB · {doc.type || 'Document'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => void handleDownloadDocument(doc)}
                              className="px-2.5 py-1 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] text-[#1E293B] dark:text-[#60A5FA] hover:bg-[#FFFFFF] dark:hover:bg-[#475569] rounded-md text-xs font-semibold flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="Delete Document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Sub-Tab 2: "Job Details" Tab (Ceipal Screenshot 2026-11-10 200134.png) */}
            {activeTab === 'job_details' && (
              <div className="space-y-4">
                {/* Job Details Card */}
                <div className="bg-white dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#1F2937] rounded-xl p-5 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#60A5FA]">
                    Requisition Specifications &amp; Parameters
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                    <div>
                      <span className="text-[11px] text-[#64748B] block">Job Start Date</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        {job.startDate || '10/11/2026'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">Job End Date</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        {job.endDate || '31/12/2026'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">Remote Job</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        {job.remoteJob || 'No'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">Turnaround Time</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        {job.turnaroundTime ? `${job.turnaroundTime} ${job.turnaroundUnit || 'Days'}` : 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">Duration</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        {job.duration || '1 month 22 day(s)'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">Application Form</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        General Application
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">Respond By</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        {job.respondBy || 'Open Until Filled'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">Client</span>
                      <span className="font-semibold text-[#1E293B] dark:text-[#60A5FA]">
                        {job.client}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">Client Manager</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        {job.clientManager || 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">Priority</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        {job.priority}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">Client Job ID</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        {job.clientJobId || 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">CEIPAL Ref #</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        2026-12219
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">Job Type</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        {job.type}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">Notice Period</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        {job.noticePeriod || '1 Month'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">Post Job on Career Portal</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <button
                          onClick={async () => {
                            const newStatus = !job.postJobOnCareerPortal;
                            await ApiService.updateJob(job.id, { postJobOnCareerPortal: newStatus });
                            setJob({ ...job, postJobOnCareerPortal: newStatus });
                            showToast(`Career portal publication: ${newStatus ? 'ON' : 'OFF'}`);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            job.postJobOnCareerPortal
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-400 text-white'
                          }`}
                        >
                          {job.postJobOnCareerPortal ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Breakdown */}
                <div className="bg-white dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#1F2937] rounded-xl p-5 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#60A5FA]">
                    Skills &amp; Education Matrix
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                    <div>
                      <span className="text-[11px] text-[#64748B] block">Industry</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        {job.industry || 'Information Technology & Services'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">Experience</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        {job.minExperience ? `${job.minExperience}-${job.maxExperience} Years` : '2-5 Years'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">Degree</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        {job.degree || "Bachelor's Degree in Computer Science or IT"}
                      </span>
                    </div>

                    <div className="sm:col-span-3">
                      <span className="text-[11px] text-[#64748B] block">Primary Skills</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {(job.primarySkills && job.primarySkills.length > 0
                          ? job.primarySkills
                          : job.skills
                        ).map((sk) => (
                          <span
                            key={sk}
                            className="px-2 py-0.5 bg-[#FFFFFF] dark:bg-[#475569] border border-[#2563EB]/40 text-[#1E293B] dark:text-[#60A5FA] rounded-md font-mono text-xs font-semibold"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <span className="text-[11px] text-[#64748B] block">Secondary Skills</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {(job.secondarySkills && job.secondarySkills.length > 0) ? (
                          job.secondarySkills.map((sk) => (
                            <span
                              key={sk}
                              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-[#64748B] dark:text-[#D8E3F1] rounded-md font-mono text-xs"
                            >
                              {sk}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#64748B] italic">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organizational Information */}
                <div className="bg-white dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#1F2937] rounded-xl p-5 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#60A5FA]">
                    Organizational Information &amp; Stakeholders
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                    <div>
                      <span className="text-[11px] text-[#64748B] block">Number of Positions</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        {job.openings || 1}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">Sales Manager</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        {job.salesManager || 'David Miller'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">Comments</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        {job.comments || 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">Assigned To</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        {job.assignedTo || job.assignedRecruiter || 'Ganesh Godse'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">Account Manager</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        {job.accountManager || 'Rajesh Ramanathan'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">Maximum Allowed Submissions</span>
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        {job.maxSubmissions || 5}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 3: Additional Details */}
            {activeTab === 'additional_details' && (
              <div className="bg-white dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#1F2937] rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#60A5FA]">
                  Additional Job Details &amp; Compliance Specifications
                </h3>
                <div className="p-4 bg-[#FFFFFF] dark:bg-[#0F172A] rounded-xl text-xs space-y-3 leading-relaxed">
                  <div>
                    <span className="font-bold text-[#1E293B] dark:text-white">Full Job Description:</span>
                    <div className="mt-1 whitespace-pre-wrap">{job.description}</div>
                  </div>
                  <div className="pt-2 border-t border-[#D8E3F1] dark:border-[#1F2937]">
                    <span className="font-bold text-[#1E293B] dark:text-white">Cost Center: </span>
                    <span>{job.costCenter || 'CC-1049'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#1E293B] dark:text-white">Department Code: </span>
                    <span>{job.departmentCode || 'ENG-SW-02'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#1E293B] dark:text-white">Client PO: </span>
                    <span>{job.poNumber || 'PO-88921-X'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 4: Task Manager */}
            {activeTab === 'task_manager' && (
              <div className="bg-white dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#1F2937] rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#60A5FA]">
                    Requisition Task Manager
                  </h3>
                  <button
                    onClick={() => showToast('New task created')}
                    className="px-2.5 py-1 bg-[#2563EB] text-white text-xs font-bold rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                </div>

                <div className="divide-y divide-[#D8E3F1] dark:divide-[#1F2937] text-xs">
                  {[
                    { id: 't1', title: 'Review 5 Python/PostgreSQL profiles from LinkedIn pipeline', due: 'Tomorrow', assigned: 'Ganesh Godse', status: 'Pending' },
                    { id: 't2', title: 'Schedule Client Hiring Manager Interview for Demo User', due: 'In 2 days', assigned: 'Sachin Wadeyar', status: 'In Progress' },
                    { id: 't3', title: 'Verify client bill rate card and tax markup with finance', due: 'Completed', assigned: 'David Miller', status: 'Completed' }
                  ].map((t) => (
                    <div key={t.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          defaultChecked={t.status === 'Completed'}
                          className="rounded text-[#1E293B]"
                        />
                        <div>
                          <div className={`font-semibold ${t.status === 'Completed' ? 'line-through text-[#64748B]' : 'text-[#1E293B] dark:text-white'}`}>
                            {t.title}
                          </div>
                          <div className="text-[10px] text-[#64748B]">Due: {t.due} · Assigned: {t.assigned}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Tab 5: Activities */}
            {activeTab === 'activities' && (
              <div className="bg-white dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#1F2937] rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#60A5FA]">
                  Requisition Audit Trail &amp; Activity Log
                </h3>

                <div className="space-y-3 text-xs">
                  {[
                    { time: '10/11/2026 20:10:42', user: 'Ganesh Godse', desc: 'Submitted candidate "Demo User" with status Waiting for Evaluation by Internal Reviewer' },
                    { time: '10/11/2026 20:07:23', user: 'Ganesh Godse', desc: 'Updated requisition parameters and boolean search criteria' },
                    { time: '10/11/2026 20:00:51', user: 'Ganesh Godse', desc: 'Created requisition AMP12262 - Demo Job Test for client ampcustech' }
                  ].map((act, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-[#FFFFFF] dark:bg-[#0F172A] rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-[#2563EB] mt-1.5 shrink-0"></div>
                      <div>
                        <div className="font-semibold text-[#1E293B] dark:text-white">{act.desc}</div>
                        <div className="text-[10px] text-[#64748B] mt-0.5">By {act.user} · {act.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Tab 6: Email Merges */}
            {activeTab === 'email_merges' && (
              <div className="bg-white dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#1F2937] rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#60A5FA]">
                  Candidate Email Merge &amp; Campaign Center
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#64748B]">
                  Dispatch tailored candidate outreach email campaigns using smart merge tokens.
                </p>

                <div className="p-4 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#1F2937] rounded-xl space-y-3 text-xs">
                  <div className="font-bold text-[#1E293B] dark:text-white">
                    Available Merge Tags:
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 border">{'{{candidate_name}}'}</span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 border">{'{{job_title}}'}</span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 border">{'{{client_name}}'}</span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 border">{'{{pay_rate}}'}</span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 border">{'{{recruiter_name}}'}</span>
                  </div>

                  <button
                    onClick={() => showToast('Email merge sequence initiated')}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Launch Requisition Email Campaign</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* RIGHT SIDEBAR (approx 30% width) - Ceipal Authentic */}
          {/* ========================================================= */}
          <div className="w-full lg:w-[31%] space-y-4">
            {/* Search Criteria Box */}
            <div className="bg-white dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#1F2937] rounded-xl p-4 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#1E293B] dark:text-white text-xs">Search Criteria</h3>
                <button
                  onClick={() => {
                    if (job.primarySkills && job.primarySkills.length > 0) {
                      setBooleanQuery(
                        job.primarySkills.map((s) => `(${s.trim().toUpperCase()})`).join(' AND ')
                      );
                      showToast('Search criteria reset to primary skills');
                    }
                  }}
                  className="text-[#64748B] hover:text-[#1E293B]"
                  title="Reset Search Criteria"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Boolean Query Box */}
              <div>
                <textarea
                  value={booleanQuery}
                  onChange={(e) => setBooleanQuery(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg font-mono text-[11px] text-[#1E293B] dark:text-[#E2E8F0] leading-relaxed focus:outline-none focus:border-[#2563EB]"
                />

                <div className="flex justify-end mt-1 relative">
                  <button
                    onClick={() => setIsStringBuilderOpen(!isStringBuilderOpen)}
                    className="text-[#1E293B] dark:text-[#60A5FA] font-semibold text-[11px] flex items-center gap-1 hover:underline"
                  >
                    <span>String Builder</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {isStringBuilderOpen && (
                    <div className="absolute right-0 top-6 w-36 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-lg shadow-xl py-1 z-40 text-xs">
                      {['AND', 'OR', 'NOT', 'NEAR/5', '("...")'].map((op) => (
                        <button
                          key={op}
                          onClick={() => {
                            setBooleanQuery((prev) => `${prev} ${op} `);
                            setIsStringBuilderOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#FFFFFF] dark:hover:bg-[#475569] font-mono text-[11px]"
                        >
                          + {op}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Job Title */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#64748B] block">JOB TITLE</label>
                <input
                  type="text"
                  value={searchJobTitle}
                  onChange={(e) => setSearchJobTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg text-xs"
                />
                <label className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-[#64748B] cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={recentJobTitleOnly}
                    onChange={(e) => setRecentJobTitleOnly(e.target.checked)}
                    className="rounded text-[#1E293B]"
                  />
                  <span>Recent Job Title</span>
                </label>
              </div>

              {/* Location Details */}
              <div className="space-y-2 pt-2 border-t border-[#D8E3F1] dark:border-[#1F2937]">
                <label className="text-[10px] uppercase font-bold text-[#64748B] block">LOCATION DETAILS</label>

                <div>
                  <span className="text-[10px] text-[#64748B] block">Country</span>
                  <select
                    value={searchCountry}
                    onChange={(e) => setSearchCountry(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg text-xs"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-[#64748B] block">State</span>
                  <select
                    value={searchState}
                    onChange={(e) => setSearchState(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg text-xs"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Telangana">Telangana</option>
                    <option value="California">California</option>
                    <option value="Texas">Texas</option>
                    <option value="New York">New York</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center gap-1 text-[10px] text-[#64748B]">
                    <span>City</span>
                    <HelpCircle className="w-3 h-3 text-[#1E293B]" />
                  </div>
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder="Search city name"
                    className="w-full px-2.5 py-1.5 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg text-xs"
                  />
                </div>

                <label className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-[#64748B] cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={includeNoCountry}
                    onChange={(e) => setIncludeNoCountry(e.target.checked)}
                    className="rounded text-[#1E293B]"
                  />
                  <span>Include Applicants Without Country</span>
                </label>
              </div>

              {/* Filters */}
              <div className="space-y-2 pt-2 border-t border-[#D8E3F1] dark:border-[#1F2937]">
                <label className="text-[10px] uppercase font-bold text-[#64748B] block">FILTERS</label>

                <div>
                  <span className="text-[10px] text-[#64748B] block">Total Experience (Years)</span>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={minExp}
                      onChange={(e) => setMinExp(Number(e.target.value))}
                      className="w-14 px-2 py-1 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-md text-xs text-center font-mono"
                    />
                    <span className="text-xs text-[#64748B]">to</span>
                    <input
                      type="number"
                      value={maxExp}
                      onChange={(e) => setMaxExp(Number(e.target.value))}
                      className="w-14 px-2 py-1 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-md text-xs text-center font-mono"
                    />
                    <span className="text-xs text-[#64748B]">years</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#64748B] block">Educational Details</span>
                  <select
                    value={educationDetails}
                    onChange={(e) => setEducationDetails(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg text-xs"
                  >
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="B.Tech / MCA">B.Tech / MCA</option>
                    <option value="Any Degree">Any Degree</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-[#64748B] block">Employer</span>
                  <input
                    type="text"
                    value={employer}
                    onChange={(e) => setEmployer(e.target.value)}
                    placeholder="Search employer..."
                    className="w-full px-2.5 py-1.5 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg text-xs"
                  />
                  <label className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-[#64748B] cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={mostRecentEmployerOnly}
                      onChange={(e) => setMostRecentEmployerOnly(e.target.checked)}
                      className="rounded text-[#1E293B]"
                    />
                    <span>Most Recent Employer</span>
                  </label>
                </div>

                <div>
                  <span className="text-[10px] text-[#64748B] block">Willing to Relocate</span>
                  <div className="flex items-center gap-4 mt-1 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="relocate"
                        checked={willingToRelocate === 'Yes'}
                        onChange={() => setWillingToRelocate('Yes')}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="relocate"
                        checked={willingToRelocate === 'No'}
                        onChange={() => setWillingToRelocate('No')}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                {/* Sourcing Action Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => {
                      showToast('Search criteria updated and saved to requisition');
                    }}
                    className="w-full py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsAiMatchingOpen(true);
                    }}
                    className="w-full py-2 bg-white dark:bg-[#1E293B] border border-[#2563EB] text-[#1E293B] dark:text-[#60A5FA] font-bold rounded-lg text-xs hover:bg-[#FFFFFF] dark:hover:bg-[#475569] transition-colors"
                  >
                    Save and Search
                  </button>
                  <button
                    onClick={() => {
                      setIsJobBoardsMenuOpen(true);
                    }}
                    className="w-full py-2 bg-white dark:bg-[#1E293B] border border-[#2563EB] text-[#1E293B] dark:text-[#60A5FA] font-bold rounded-lg text-xs hover:bg-[#FFFFFF] dark:hover:bg-[#475569] transition-colors"
                  >
                    Search Job Boards
                  </button>
                </div>
              </div>
            </div>

            {/* Job Details Card */}
            <div className="bg-white dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#1F2937] rounded-xl p-4 shadow-xs space-y-3 text-xs">
              <h3 className="font-bold text-[#1E293B] dark:text-white">Job Details</h3>
              <div>
                <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                  <span>Job Category</span>
                  <HelpCircle className="w-3 h-3 text-[#1E293B]" />
                </span>
                <span className="font-semibold text-[#1E293B] dark:text-white mt-0.5 block">
                  {job.category || 'Non Niche'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                  <span>Job Skill Type</span>
                  <HelpCircle className="w-3 h-3 text-[#1E293B]" />
                </span>
                <span className="font-semibold text-[#1E293B] dark:text-white mt-0.5 block">
                  {job.skillType || 'IT'}
                </span>
              </div>
            </div>

            {/* User Defined Fields */}
            <div className="bg-white dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#1F2937] rounded-xl p-4 shadow-xs space-y-3 text-xs">
              <h3 className="font-bold text-[#1E293B] dark:text-white">User Defined Fields</h3>
              <div>
                <span className="text-[10px] text-[#64748B] block">Cost Center</span>
                <span className="font-mono font-semibold text-[#1E293B] dark:text-white mt-0.5 block">
                  {job.costCenter || 'CC-1049'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] block">Department Code</span>
                <span className="font-mono font-semibold text-[#1E293B] dark:text-white mt-0.5 block">
                  {job.departmentCode || 'ENG-SW-02'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] block">PO Number</span>
                <span className="font-mono font-semibold text-[#1E293B] dark:text-white mt-0.5 block">
                  {job.poNumber || 'PO-88921-X'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: Ceipal Skill Matrix Modal (Screenshot 2026-11-10 153259.png) */}
      {/* ========================================================= */}
      {skillMatrixApplicant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#D8E3F1] dark:border-[#334155] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display font-bold text-[#1E293B] dark:text-white">
                  Skill Matrix
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#64748B]">
                  Verified skills and years of experience for {skillMatrixApplicant.name} ({skillMatrixApplicant.applicantId})
                </p>
              </div>
              <button
                onClick={() => setSkillMatrixApplicant(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - 2 Columns with Dotted Leaders matching Screenshot 153259 */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2.5 text-xs font-mono">
                {/* Column Headers */}
                <div className="flex justify-between font-sans font-bold text-[#64748B] dark:text-[#64748B] pb-1 border-b border-[#D8E3F1] dark:border-[#334155]">
                  <span>Skill</span>
                  <span>Experience</span>
                </div>
                <div className="hidden md:flex justify-between font-sans font-bold text-[#64748B] dark:text-[#64748B] pb-1 border-b border-[#D8E3F1] dark:border-[#334155]">
                  <span>Skill</span>
                  <span>Experience</span>
                </div>

                {/* Skill Matrix Rows */}
                {getCandidateSkillMatrix(skillMatrixApplicant).map((item, index) => (
                  <div key={index} className="flex items-baseline justify-between gap-2 py-1">
                    <span className="bg-[#FFFFFF] dark:bg-[#1E293B] px-1.5 py-0.5 rounded text-[#1E293B] dark:text-white shrink-0">
                      {item.skill}
                    </span>
                    <span className="flex-1 border-b border-dotted border-gray-400 dark:border-gray-600 mx-1"></span>
                    <span className="text-[#64748B] dark:text-[#D8E3F1] shrink-0 font-semibold">
                      {item.exp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#D8E3F1] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#0F172A] flex justify-end">
              <button
                onClick={() => setSkillMatrixApplicant(null)}
                className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: Ceipal Application Status Modal (Screenshot 2026-11-10 202134.png) */}
      {/* ========================================================= */}
      {statusModalSubmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-[#D8E3F1] dark:border-[#334155] flex items-center justify-between">
              <h2 className="text-base font-bold text-[#1E293B] dark:text-white">
                Application Status
              </h2>
              <button
                onClick={() => setStatusModalSubmission(null)}
                className="text-[#64748B] hover:text-[#1E293B] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#64748B] mb-1">
                  Candidate: <strong className="text-[#1E293B] dark:text-white">{statusModalSubmission.applicantName}</strong> (Sub #{statusModalSubmission.submissionId})
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#64748B] mb-1">
                  Application Status
                </label>
                <select
                  value={selectedStatusValue}
                  onChange={(e) => setSelectedStatusValue(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg text-xs font-semibold text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB]"
                >
                  {CEIPAL_STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#64748B] mb-1">
                  Comments
                </label>
                <textarea
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  rows={4}
                  placeholder="Enter comments or evaluation notes for this application status change..."
                  className="w-full p-3 bg-white dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg text-xs text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            {/* Modal Footer with Ceipal Buttons */}
            <div className="p-4 px-6 border-t border-[#D8E3F1] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#0F172A] flex justify-end gap-2">
              <button
                onClick={handleUpdateSubmissionStatus}
                className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Update
              </button>
              <button
                onClick={() => setStatusModalSubmission(null)}
                className="px-4 py-2 border border-[#D8E3F1] dark:border-[#334155] text-[#64748B] hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DRAWER 3: View Resume Drawer (Screenshot 2026-11-10 150936.png) */}
      {/* ========================================================= */}
      {resumeApplicant && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-[#475569] border-l border-[#D8E3F1] dark:border-[#334155] shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 px-6 border-b border-[#D8E3F1] dark:border-[#334155] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-full bg-[#FFFFFF] dark:bg-[#475569] text-[#1E293B]">
                  👤
                </span>
                <h2 className="text-sm font-bold text-[#1E293B] dark:text-white flex items-center gap-1.5">
                  <span>{resumeApplicant.applicantId} - {resumeApplicant.name}</span>
                  <Search className="w-3.5 h-3.5 text-[#64748B]" />
                </h2>
              </div>
              <button
                onClick={() => setResumeApplicant(null)}
                className="p-1 text-[#64748B] hover:text-[#1E293B] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Fast Action Bar */}
            <div className="p-3 px-6 bg-[#FFFFFF] dark:bg-[#0F172A] border-b border-[#D8E3F1] dark:border-[#334155] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 text-[#64748B] dark:text-[#64748B]">
                <span>{resumeApplicant.location}</span>
                <span>·</span>
                <span>{resumeApplicant.phone}</span>
                <span>·</span>
                <span>{resumeApplicant.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSkillMatrixApplicant(resumeApplicant);
                  }}
                  className="px-2.5 py-1 bg-white dark:bg-[#1E293B] border border-[#2563EB] text-[#1E293B] dark:text-[#60A5FA] rounded-md font-semibold text-[11px]"
                >
                  Skill Matrix
                </button>
                <button
                  onClick={() => {
                    showToast(`Resume file exported for ${resumeApplicant.name}`);
                  }}
                  className="px-2.5 py-1 bg-[#2563EB] text-white rounded-md font-semibold text-[11px] flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Resume Content View */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* Summary */}
              <div>
                <h3 className="font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#60A5FA] mb-1.5">
                  Professional Summary
                </h3>
                <p className="p-3 bg-[#FFFFFF] dark:bg-[#0F172A] rounded-xl text-[#64748B] dark:text-[#D8E3F1] leading-relaxed">
                  {resumeApplicant.summary || 'Full Stack Engineer with 5+ years experience in building high-scale Python, React and PostgreSQL enterprise applications.'}
                </p>
              </div>

              {/* Skills Badges */}
              <div>
                <h3 className="font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#60A5FA] mb-2">
                  Technical Competencies ({resumeApplicant.skills?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {resumeApplicant.skills?.map((sk) => (
                    <span
                      key={sk}
                      className="px-2.5 py-1 rounded-lg bg-[#FFFFFF] dark:bg-[#475569] border border-[#2563EB]/30 font-mono text-[11px] font-semibold text-[#1E293B] dark:text-[#60A5FA]"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Work Experience */}
              <div>
                <h3 className="font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#60A5FA] mb-3">
                  Work History
                </h3>
                <div className="space-y-4">
                  {(resumeApplicant.workHistory && resumeApplicant.workHistory.length > 0
                    ? resumeApplicant.workHistory
                    : [
                        { role: 'Software Engineer', company: 'Nimbus Retail Technologies', duration: 'March 2023 - Present', summary: 'Designed and deployed RESTful microservices with FastAPI, React and PostgreSQL.' },
                        { role: 'Junior Software Developer', company: 'Acme Logistics Pvt Ltd', duration: 'July 2021 - Feb 2023', summary: 'Maintained order management tracking dashboards and logistics data pipelines.' }
                      ]
                  ).map((exp, idx) => (
                    <div key={idx} className="p-3.5 bg-[#FFFFFF] dark:bg-[#0F172A] rounded-xl space-y-1">
                      <div className="flex items-center justify-between font-bold text-[#1E293B] dark:text-white">
                        <span>{exp.role}</span>
                        <span className="text-[11px] text-[#64748B] font-normal">{exp.duration}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-[#1E293B]">{exp.company}</div>
                      <p className="text-[#64748B] dark:text-[#64748B] text-[11px] mt-1">{exp.summary}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h3 className="font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#60A5FA] mb-2">
                  Education &amp; Qualifications
                </h3>
                <div className="p-3 bg-[#FFFFFF] dark:bg-[#0F172A] rounded-xl">
                  <div className="font-bold text-[#1E293B] dark:text-white">
                    {resumeApplicant.education?.[0]?.degree || 'Bachelor of Engineering in Computer Science'}
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#64748B]">
                    {resumeApplicant.education?.[0]?.school || 'Savitribai Phule Pune University, Pune'} · {resumeApplicant.education?.[0]?.year || '2017'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: AI Matching Profiles Modal (Screenshot 2026-11-10 200745.png) */}
      {/* ========================================================= */}
      {isAiMatchingOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 px-6 border-b border-[#D8E3F1] dark:border-[#334155] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
                <h2 className="text-base font-bold text-[#1E293B] dark:text-white">
                  AI Matching Candidates for {job.code} ({job.title})
                </h2>
              </div>
              <button
                onClick={() => setIsAiMatchingOpen(false)}
                className="text-[#64748B] hover:text-[#1E293B] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Split: Sliders on Left + Candidate List on Right */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Left Score Sliders */}
              <div className="w-full md:w-64 p-5 border-r border-[#D8E3F1] dark:border-[#334155] space-y-6 text-xs bg-[#FFFFFF] dark:bg-[#0F172A]">
                <div>
                  <h3 className="font-bold text-[#1E293B] dark:text-white text-xs mb-3">
                    Matching Scores
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Job Title Weight</span>
                        <span className="text-[#1E293B] font-mono">{aiJobTitleWeight}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={aiJobTitleWeight}
                        onChange={(e) => setAiJobTitleWeight(Number(e.target.value))}
                        className="w-full accent-[#2563EB]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Skills Weight</span>
                        <span className="text-red-500 font-mono">{aiSkillsWeight}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={aiSkillsWeight}
                        onChange={(e) => setAiSkillsWeight(Number(e.target.value))}
                        className="w-full accent-red-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#D8E3F1] dark:border-[#334155] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] block">Candidate Pool</span>
                  <div className="font-semibold text-[#1E293B] dark:text-white">
                    {applicants.length} Total Sourced Profiles
                  </div>
                </div>
              </div>

              {/* Right Candidates List */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3">
                <div className="flex items-center justify-between text-xs text-[#64748B] pb-2 border-b border-[#D8E3F1] dark:border-[#334155]">
                  <span>Showing top matching candidates from ATS repository</span>
                  <span className="font-bold text-[#1E293B]">Sorted by AI Compatibility Score</span>
                </div>

                <div className="divide-y divide-[#D8E3F1] dark:divide-[#334155]">
                  {applicants.slice(0, 8).map((cand) => {
                    const score = Math.min(99, Math.max(70, cand.matchScore || 73));
                    return (
                      <div
                        key={cand.id}
                        className="py-3 flex items-center justify-between gap-4 hover:bg-[#FFFFFF] dark:hover:bg-[#1E293B] px-3 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-bold font-mono text-[#276749] dark:text-[#8AC9A7] bg-[#8AC9A7]/20 border border-[#8AC9A7]/40 px-2 py-0.5 rounded">
                              {score}%
                            </span>
                            <span className="text-[9px] text-[#64748B] mt-0.5">Match</span>
                          </div>

                          <img
                            src={cand.avatar}
                            alt={cand.name}
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-[#D8E3F1]"
                          />

                          <div>
                            <div className="font-bold text-xs text-[#1E293B] dark:text-white">
                              {cand.name}
                            </div>
                            <div className="text-[11px] text-[#64748B] dark:text-[#64748B]">
                              {cand.currentDesignation} · {cand.experienceYears} Years Exp · {cand.location}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-[#64748B]">{cand.email}</span>
                              <span>·</span>
                              <span className="text-[10px] text-[#64748B]">{cand.phone}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setResumeApplicant(cand);
                            }}
                            className="px-2.5 py-1.5 border border-[#D8E3F1] dark:border-[#334155] text-[#64748B] hover:bg-[#FFFFFF] rounded-lg text-xs font-semibold"
                          >
                            View
                          </button>

                          <button
                            onClick={() => void handleAiMatchingSubmit(cand)}
                            className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Submit to Job</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 px-6 border-t border-[#D8E3F1] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#0F172A] flex justify-end">
              <button
                onClick={() => setIsAiMatchingOpen(false)}
                className="px-5 py-2 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] text-[#64748B] dark:text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: Add Public Job Details Modal */}
      {/* ========================================================= */}
      {isPublicDetailsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3 border-[#D8E3F1] dark:border-[#334155]">
              <h2 className="text-sm font-bold text-[#1E293B] dark:text-white">
                Add Public Job Details (Career Portal Spec)
              </h2>
              <button onClick={() => setIsPublicDetailsModalOpen(false)}>
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <p className="text-[#64748B] dark:text-[#64748B]">
              Configure sanitized job overview for external candidate career site view.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Public Header Headline
              </label>
              <input
                type="text"
                defaultValue={`${job.title} - Career Opportunity`}
                className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Candidate Summary Pitch
              </label>
              <textarea
                rows={4}
                defaultValue={`We are hiring a passionate ${job.title} to join our engineering organization. Key stack includes ${(job.primarySkills || job.skills).slice(0, 3).join(', ')}.`}
                className="w-full p-3 bg-white dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D8E3F1] dark:border-[#334155]">
              <button
                onClick={() => {
                  showToast('Public job specification updated');
                  setIsPublicDetailsModalOpen(false);
                }}
                className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold rounded-lg text-xs"
              >
                Save Public Details
              </button>
              <button
                onClick={() => setIsPublicDetailsModalOpen(false)}
                className="px-4 py-2 border rounded-lg text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: Add Note Modal */}
      {/* ========================================================= */}
      {isAddNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3 border-[#D8E3F1] dark:border-[#334155]">
              <h2 className="text-sm font-bold text-[#1E293B] dark:text-white">Add Requisition Note</h2>
              <button onClick={() => setIsAddNoteModalOpen(false)}>
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Note Category</label>
              <select
                value={newNoteCategory}
                onChange={(e) => setNewNoteCategory(e.target.value as typeof newNoteCategory)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg text-xs font-semibold"
              >
                <option value="Job Posting">Job Posting</option>
                <option value="Applicant Reference">Applicant Reference</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Note Content</label>
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                rows={4}
                placeholder="Enter requisition notes, client feedback, or sourcing instructions..."
                className="w-full p-3 bg-white dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D8E3F1] dark:border-[#334155]">
              <button
                onClick={handleAddNote}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-lg text-xs"
              >
                Save Note
              </button>
              <button
                onClick={() => setIsAddNoteModalOpen(false)}
                className="px-4 py-2 border rounded-lg text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 7: Upload Document Modal */}
      {/* ========================================================= */}
      {isUploadDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3 border-[#D8E3F1] dark:border-[#334155]">
              <h2 className="text-sm font-bold text-[#1E293B] dark:text-white">Upload Job Document</h2>
              <button onClick={() => setIsUploadDocModalOpen(false)}>
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Document Category</label>
              <select
                value={newDocCategory}
                onChange={(e) => setNewDocCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg text-xs"
              >
                <option value="Client Job Spec (SOW)">Client Job Spec (SOW)</option>
                <option value="Assessment Rubric">Assessment Rubric</option>
                <option value="Rate Card & Billing Terms">Rate Card &amp; Billing Terms</option>
                <option value="Candidate NDA Template">Candidate NDA Template</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Document Name / File</label>
              <input
                type="text"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="e.g. AMP12262_Client_Job_Spec.pdf"
                className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D8E3F1] dark:border-[#334155]">
              <button
                onClick={handleUploadDocument}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-lg text-xs"
              >
                Attach Document
              </button>
              <button
                onClick={() => setIsUploadDocModalOpen(false)}
                className="px-4 py-2 border rounded-lg text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 8: Submit Candidate to Requisition Modal */}
      {/* ========================================================= */}
      {isSubmitCandidateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3 border-[#D8E3F1] dark:border-[#334155]">
              <h2 className="text-sm font-bold text-[#1E293B] dark:text-white">
                Submit Candidate to {job.code}
              </h2>
              <button onClick={() => setIsSubmitCandidateModalOpen(false)}>
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Select Candidate from Repository
              </label>
              <select
                value={submitApplicantId}
                onChange={(e) => setSubmitApplicantId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg text-xs font-semibold"
              >
                <option value="">-- Choose Candidate --</option>
                {applicants.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.applicantId}) — {a.currentDesignation} ({a.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Bill Rate ($/hr)</label>
                <input
                  type="number"
                  value={submitBillRate || job.billRate}
                  onChange={(e) => setSubmitBillRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Pay Rate ($/hr)</label>
                <input
                  type="number"
                  value={submitPayRate || job.payRate}
                  onChange={(e) => setSubmitPayRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D8E3F1] dark:border-[#334155]">
              <button
                onClick={handleQuickSubmitCandidate}
                disabled={!submitApplicantId}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold rounded-lg text-xs shadow-xs"
              >
                Submit Application
              </button>
              <button
                onClick={() => setIsSubmitCandidateModalOpen(false)}
                className="px-4 py-2 border rounded-lg text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
