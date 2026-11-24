import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Pencil,
  Linkedin,
  Facebook,
  Twitter,
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
  FileCode,
  Monitor,
  Box,
  Zap,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { Job, Applicant, JobDocument, JobStatus, Submission, JobNote, TaskItem, Priority, User } from '../../types';
import { downloadApplicantResume } from '../../utils/downloadApplicantResume';
import { EmailRichTextEditor } from '../../components/common/EmailRichTextEditor';
import { getAllCountries, getTimezonesForCountry } from 'countries-and-timezones';

type JobTaskForm = {
  title: string;
  description: string;
  priority: Priority;
  businessUnit: string;
  taskType: string;
  category: TaskItem['category'] | '';
  dueDate: string;
  status: '' | 'Not Started' | TaskItem['status'];
  assignedTo: string;
  escalateTo: string;
  reminder: string;
  ownership: string;
  notifyViaEmail: boolean;
  recurrenceTask: boolean;
  showOnCalendar: boolean;
  timeZone: string;
};

type PrintableJobField = {
  label: string;
  value: string | number | boolean | null | undefined;
};

type PrintableJobRow = [PrintableJobField, PrintableJobField?];

type QuickSubmissionForm = NonNullable<Submission['quickSubmissionDetails']>;
type QuickSubmissionUserField = 'recipients' | 'additionalNotifiers';

const COUNTRY_OPTIONS = Object.values(getAllCountries())
  .map((country) => ({ code: country.id, name: country.name }))
  .sort((a, b) => a.name.localeCompare(b.name));

const BILL_RATE_CURRENCIES = [
  'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN',
  'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL',
  'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP', 'CNY',
  'COP', 'CRC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP',
  'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP', 'GMD',
  'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HTG', 'HUF', 'IDR', 'ILS', 'INR',
  'IQD', 'IRR', 'ISK', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF',
  'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL',
  'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR',
  'MVR', 'MWK', 'MXN', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR',
  'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR',
  'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD',
  'SHP', 'SLE', 'SOS', 'SRD', 'SSP', 'STN', 'SYP', 'SZL', 'THB', 'TJS',
  'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD',
  'UYU', 'UZS', 'VES', 'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XCG', 'XOF',
  'XPF', 'YER', 'ZAR', 'ZMW'
];

const EMPTY_JOB_TASK_FORM: JobTaskForm = {
  title: '',
  description: '',
  priority: 'Medium',
  businessUnit: '',
  taskType: 'Call',
  category: '',
  dueDate: '',
  status: '',
  assignedTo: 'Me',
  escalateTo: '',
  reminder: 'None',
  ownership: '',
  notifyViaEmail: false,
  recurrenceTask: false,
  showOnCalendar: false,
  timeZone: '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi'
};

const EMPTY_QUICK_SUBMISSION_FORM: QuickSubmissionForm = {
  noticePeriod: '',
  relocation: 'Yes',
  currency: 'INR',
  rateType: 'Yearly',
  resumeName: '',
  videoLink: '',
  availableDocument: '',
  additionalAttachmentName: '',
  eForm: '',
  recipients: '',
  additionalNotifiers: '',
  otherEmailIds: '',
  comments: '',
  employerDetails: ''
};

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

const SUBMISSION_STAGES = [
  'Pipeline',
  'Submission',
  'Client Submission',
  'Interview',
  'Confirmation',
  'Placement',
  'Not Joined'
];

const MARKETPLACE_JOB_BOARDS = ['JobTarget'];
const FREE_JOB_BOARDS = ['CareerJet', 'Post Job Free', 'Glassdoor', 'Neuvoo', 'Jobcedo', 'Adzuna'];
const FREE_WITH_OPTIONS_JOB_BOARDS = ['LinkedIn'];

const escapeShareJobHtml = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const renderShareJobDescription = (description: string): string => {
  const source = (description || '').trim();
  if (!source) return 'N/A';

  if (/<[a-z][\s\S]*>/i.test(source)) {
    const parsed = new DOMParser().parseFromString(source, 'text/html');
    parsed.body.querySelectorAll('script,style,iframe,object,embed').forEach((element) => element.remove());
    return parsed.body.innerHTML;
  }

  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (/^(Job Summary|Key Responsibilities|Required Skills & Qualifications|Preferred Qualifications|Educational Qualification|What We Are Looking For)$/i.test(line)) {
        return `<h3 style="margin:14px 0 6px;">${escapeShareJobHtml(line)}</h3>`;
      }
      if (/^(Develop|Build|Design|Work|Integrate|Write|Identify|Participate|Collaborate|Experience|Familiarity|Knowledge|Understanding|Ability|Willingness|Strong|Excellent|Good|Hands-on|2[/–-]5)/i.test(line)) {
        return `<p style="margin:2px 0 2px 18px;">&#8226; ${escapeShareJobHtml(line.replace(/^[-•]\s*/, ''))}</p>`;
      }
      if (line.endsWith(':') || line.startsWith('Experience:') || line.startsWith('Employment Type:') || line.startsWith('Location:') || line.startsWith('Job Type:') || line.startsWith('Department:') || line.startsWith('Salary:')) {
        return `<p style="margin:4px 0;"><strong>${escapeShareJobHtml(line)}</strong></p>`;
      }
      return `<p style="margin:4px 0;">${escapeShareJobHtml(line)}</p>`;
    })
    .join('');
};

const createShareJobEmailBody = (job: Job): string => {
  const candidatePortalUrl = job.id === 'job-12262'
    ? 'https://candidateportal.ceipal.com/job-details/6RcMRvWf9BI9H2d3sa97zt_bKHHqco9rTBZUGoIOoOk'
    : `https://candidateportal.ceipal.com/job-details/${encodeURIComponent(job.id)}`;
  const location = job.states
    ? `${job.location.replace(/^\[|\]$/g, '').split(',')[0].trim()}, ${job.states.split(',')[0].trim()}`
    : job.location.replace(/^\[|\]$/g, '');
  const skills = Array.from(new Set([
    ...(job.primarySkills?.length ? job.primarySkills : job.skills),
    ...(job.secondarySkills || [])
  ])).join(',');

  return `
    <div style="font-family:Arial,sans-serif;font-size:12px;color:#1E293B;">
      <p style="margin:0 0 12px;">Hello,</p>
      <p style="margin:0 0 12px;">
        A job with the title <strong>${escapeShareJobHtml(job.title)}</strong> is shared with you.
        Please find the below job details. To view, click on this URL:
        <a href="${candidatePortalUrl}" target="_blank" rel="noopener noreferrer">Click here</a>.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0 16px;">
        <tbody>
          <tr>
            <td style="width:24%;border:1px solid #000;padding:5px;"><strong>Job Code</strong></td>
            <td style="border:1px solid #000;padding:5px;">${escapeShareJobHtml(job.code)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:5px;"><strong>Job Title</strong></td>
            <td style="border:1px solid #000;padding:5px;">${escapeShareJobHtml(job.title)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:5px;"><strong>Location</strong></td>
            <td style="border:1px solid #000;padding:5px;">${escapeShareJobHtml(location)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:5px;"><strong>Skills Needed</strong></td>
            <td style="border:1px solid #000;padding:5px;">${escapeShareJobHtml(skills || 'N/A')}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:5px;vertical-align:top;"><strong>Job Description</strong></td>
            <td style="border:1px solid #000;padding:5px;">${renderShareJobDescription(job.description || '')}</td>
          </tr>
        </tbody>
      </table>
      <p style="margin:16px 0 4px;">Regards,</p>
      <p style="margin:16px 0 4px;">Human Resources</p>
      <p style="margin:0 0 12px;"><strong>| Ampcus Tech Private Limited |</strong></p>
      <p style="margin:0 0 12px;"><strong>Think before you print</strong></p>
      <p style="margin:0;font-size:10px;color:#667085;">
        This message and any attached documents contain information from the professional services firm of Ampcus Tech Pvt. Ltd.
        that may be confidential and/or privileged. If you are not the intended recipient, you may not read, disclose,
        copy, distribute, or use this information. If you have received this transmission in error, please notify the sender
        immediately by reply email and delete this message. The sender of this email makes no warranties, expressed or implied,
        as to the completeness or accuracy of any information contained herein, or that this electronic communication
        (or its attachments) is free of viruses.
      </p>
    </div>
  `.trim();
};

const getSubmissionStageIndex = (status: string): number => {
  const normalizedStatus = status.toLowerCase();
  if (normalizedStatus.includes('not joined')) return 6;
  if (normalizedStatus.includes('placed')) return 5;
  if (['offered', 'selected', 'confirmed'].some((stage) => normalizedStatus.includes(stage))) return 4;
  if (normalizedStatus.includes('interview')) return 3;
  if (normalizedStatus.includes('client')) return 2;
  if (['submitted', 'review', 'disqualified'].some((stage) => normalizedStatus.includes(stage))) return 1;
  return 0;
};

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
  const [jobTasks, setJobTasks] = useState<TaskItem[]>([]);
  const [taskUsers, setTaskUsers] = useState<User[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isJobTaskFormOpen, setIsJobTaskFormOpen] = useState(false);
  const [isSavingJobTask, setIsSavingJobTask] = useState(false);
  const [jobTaskForm, setJobTaskForm] = useState<JobTaskForm>(EMPTY_JOB_TASK_FORM);
  const [isTaskAssignMenuOpen, setIsTaskAssignMenuOpen] = useState(false);
  const [isTaskEscalateMenuOpen, setIsTaskEscalateMenuOpen] = useState(false);
  const [isTaskOwnershipMenuOpen, setIsTaskOwnershipMenuOpen] = useState(false);
  const [isTaskPriorityMenuOpen, setIsTaskPriorityMenuOpen] = useState(false);
  const [taskUserSearch, setTaskUserSearch] = useState('');
  const [isTaskTimeZoneModalOpen, setIsTaskTimeZoneModalOpen] = useState(false);
  const [taskTimeZoneCountry, setTaskTimeZoneCountry] = useState('IN');
  const [taskTimeZone, setTaskTimeZone] = useState('(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi');
  const [activityRange, setActivityRange] = useState<'all' | 'last_6_months' | 'older_than_6_months'>('last_6_months');
  const [expandedActivityIds, setExpandedActivityIds] = useState<string[]>([]);
  const [emailActivityView, setEmailActivityView] = useState<'activities' | 'email_activity'>('activities');
  const [emailActivityType, setEmailActivityType] = useState('Job Share');
  const [emailActivitySearch, setEmailActivitySearch] = useState('');
  const [isSendSurveyModalOpen, setIsSendSurveyModalOpen] = useState(false);
  const [surveySendViaEmail, setSurveySendViaEmail] = useState(true);
  const [surveySendViaSms, setSurveySendViaSms] = useState(false);
  const [selectedSurveyForm, setSelectedSurveyForm] = useState('');
  const [selectedSurveyRecipients, setSelectedSurveyRecipients] = useState<string[]>([]);
  const [selectedSurveyRoles, setSelectedSurveyRoles] = useState<string[]>([]);
  const [isSurveyRecipientMenuOpen, setIsSurveyRecipientMenuOpen] = useState(false);
  const [surveyRecipientSearch, setSurveyRecipientSearch] = useState('');
  const surveyRecipientRoleOptions = [
    { label: 'Sales Manager', value: job?.salesManager },
    { label: 'Recruitment Manager', value: job?.recruitmentManager },
    { label: 'Account Manager', value: job?.accountManager }
  ];
  const [surveySubject, setSurveySubject] = useState('Mail Template Subject');
  const [surveyMailBody, setSurveyMailBody] = useState('');

  // Top Tabs
  const [activeTab, setActiveTab] = useState<
    | 'snapshot'
    | 'job_details'
    | 'additional_details'
    | 'task_manager'
    | 'activities'
    | 'email_merges'
    | 'email_activity'
    | 'surveys'
  >('snapshot');

  // Job Description Expand/Collapse
  const [isDescExpanded, setIsDescExpanded] = useState<boolean>(false);
  const [isJobTitleSearchOpen, setIsJobTitleSearchOpen] = useState(false);
  const [isJobTitleOptionsOpen, setIsJobTitleOptionsOpen] = useState(false);
  const [jobTitleSearchQuery, setJobTitleSearchQuery] = useState('');

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
  const [newNoteAction, setNewNoteAction] = useState('');
  const [newNotePriority, setNewNotePriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newNoteApplicantRef, setNewNoteApplicantRef] = useState('');
  const [noteEditorResetKey, setNoteEditorResetKey] = useState(0);
  const [isNoteActionMenuOpen, setIsNoteActionMenuOpen] = useState(false);
  const [isNoteUserMenuOpen, setIsNoteUserMenuOpen] = useState(false);
  const [noteUserSearch, setNoteUserSearch] = useState('');
  const [selectedNoteUsers, setSelectedNoteUsers] = useState<string[]>(['Ganesh Godse']);
  const [isNotesFilterOpen, setIsNotesFilterOpen] = useState(false);
  const [notesFilterField, setNotesFilterField] = useState('Select');
  const [notesFilterSearch, setNotesFilterSearch] = useState('');
  const [notesFilterSelections, setNotesFilterSelections] = useState<string[]>([]);
  const [appliedNotesFilter, setAppliedNotesFilter] = useState<{ field: string; values: string[] } | null>(null);

  // Documents section
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState<boolean>(false);
  const [selectedDocumentFiles, setSelectedDocumentFiles] = useState<File[]>([]);
  const [documentSourceMessage, setDocumentSourceMessage] = useState('');
  const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);
  const jobDocumentInputRef = useRef<HTMLInputElement>(null);

  // Modals & Drawers
  const [skillMatrixApplicant, setSkillMatrixApplicant] = useState<Applicant | null>(null);
  const [isAddSkillMatrixOpen, setIsAddSkillMatrixOpen] = useState(false);
  const [skillMatrixContent, setSkillMatrixContent] = useState('');
  const [skillMatrixEditorResetKey, setSkillMatrixEditorResetKey] = useState(0);
  const [isSavingSkillMatrix, setIsSavingSkillMatrix] = useState(false);
  const [statusModalSubmission, setStatusModalSubmission] = useState<Submission | null>(null);
  const [selectedStatusValue, setSelectedStatusValue] = useState<string>('Waiting for Evaluation by Internal Reviewer');
  const [statusComment, setStatusComment] = useState<string>('');
  const [resumeApplicant, setResumeApplicant] = useState<Applicant | null>(null);
  const [isAiMatchingOpen, setIsAiMatchingOpen] = useState<boolean>(false);
  const [aiJobTitleWeight, setAiJobTitleWeight] = useState<number>(30);
  const [aiSkillsWeight, setAiSkillsWeight] = useState<number>(70);
  const [isPublicDetailsModalOpen, setIsPublicDetailsModalOpen] = useState<boolean>(false);
  const [isSubmitCandidateModalOpen, setIsSubmitCandidateModalOpen] = useState<boolean>(false);
  const [isTagApplicantModalOpen, setIsTagApplicantModalOpen] = useState(false);
  const [isQuickTagModalOpen, setIsQuickTagModalOpen] = useState(false);
  const [quickTagApplicantId, setQuickTagApplicantId] = useState('');
  const [quickTagApplicantSearch, setQuickTagApplicantSearch] = useState('');
  const [isQuickTagApplicantListOpen, setIsQuickTagApplicantListOpen] = useState(false);
  const [isSavingQuickTag, setIsSavingQuickTag] = useState(false);
  const [submitApplicantId, setSubmitApplicantId] = useState<string>('');
  const [submitApplicantSearch, setSubmitApplicantSearch] = useState('');
  const [isSubmitApplicantSearchOpen, setIsSubmitApplicantSearchOpen] = useState(false);
  const [submitBillRate, setSubmitBillRate] = useState<number>(0);
  const [submitPayRate, setSubmitPayRate] = useState<number>(0);
  const [quickSubmissionDetails, setQuickSubmissionDetails] = useState<QuickSubmissionForm>(EMPTY_QUICK_SUBMISSION_FORM);
  const [quickSubmissionAttachment, setQuickSubmissionAttachment] = useState<File | null>(null);
  const [quickSubmissionUserSelections, setQuickSubmissionUserSelections] = useState<Record<QuickSubmissionUserField, string[]>>({
    recipients: [],
    additionalNotifiers: []
  });
  const [quickSubmissionUserMenu, setQuickSubmissionUserMenu] = useState<QuickSubmissionUserField | null>(null);
  const [quickSubmissionUserSearch, setQuickSubmissionUserSearch] = useState('');

  // Secondary Gear & Action menus
  const [isGearMenuOpen, setIsGearMenuOpen] = useState<boolean>(false);
  const [isJobTagsMenuOpen, setIsJobTagsMenuOpen] = useState<boolean>(false);
  const [isSubmitMenuOpen, setIsSubmitMenuOpen] = useState<boolean>(false);
  const [isJobBoardsMenuOpen, setIsJobBoardsMenuOpen] = useState<boolean>(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState<boolean>(false);
  const [isJobPrintPreviewOpen, setIsJobPrintPreviewOpen] = useState(false);
  const [isShareJobPreviewOpen, setIsShareJobPreviewOpen] = useState(false);
  const [shareJobRecipients, setShareJobRecipients] = useState('');
  const [shareJobSubject, setShareJobSubject] = useState('');
  const [shareJobBody, setShareJobBody] = useState('');
  const [shareJobEditorResetKey, setShareJobEditorResetKey] = useState(0);
  const [jobBoardSearch, setJobBoardSearch] = useState('');
  const [selectedJobBoards, setSelectedJobBoards] = useState<string[]>(['JobTarget']);
  const [jobBoardSelectionDraft, setJobBoardSelectionDraft] = useState<string[]>(['JobTarget']);

  const toggleJobBoardSelection = (board: string) => {
    setJobBoardSelectionDraft((current) =>
      current.includes(board) ? current.filter((selected) => selected !== board) : [...current, board]
    );
  };
  const filterJobBoards = (boards: string[]) =>
    boards.filter((board) => board.toLowerCase().includes(jobBoardSearch.trim().toLowerCase()));

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
    ApiService.getTasks().then(setJobTasks);
    ApiService.getAllUsers().then(setTaskUsers);
  }, [selectedId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const setJobTaskField = <K extends keyof JobTaskForm,>(field: K, value: JobTaskForm[K]) => {
    setJobTaskForm((current) => ({ ...current, [field]: value }));
  };

  const openJobTaskForm = () => {
    setJobTaskForm({ ...EMPTY_JOB_TASK_FORM, businessUnit: job?.businessUnit || '' });
    setIsTaskAssignMenuOpen(false);
    setIsTaskEscalateMenuOpen(false);
    setIsTaskOwnershipMenuOpen(false);
    setIsTaskPriorityMenuOpen(false);
    setIsTaskTimeZoneModalOpen(false);
    setTaskUserSearch('');
    setTaskTimeZoneCountry('IN');
    setTaskTimeZone('(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi');
    setIsJobTaskFormOpen(true);
  };

  const handleCreateJobTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!job || !jobTaskForm.title.trim() || !jobTaskForm.category || isSavingJobTask) return;

    setIsSavingJobTask(true);
    try {
      const createdOn = new Date().toLocaleString();
      const createdTask = await ApiService.createTask({
        title: jobTaskForm.title.trim(),
        description: jobTaskForm.description.trim(),
        dueDate: jobTaskForm.dueDate,
        priority: jobTaskForm.priority,
        assignedTo: jobTaskForm.assignedTo,
        assignedBy: job.assignedRecruiter,
        status: !jobTaskForm.status || jobTaskForm.status === 'Not Started' ? 'Pending' : jobTaskForm.status,
        category: jobTaskForm.category,
        jobId: job.id,
        businessUnit: jobTaskForm.businessUnit,
        taskType: jobTaskForm.taskType,
        relatedTo: 'Job Posting',
        timeZone: jobTaskForm.timeZone,
        createdOn,
        modifiedOn: createdOn,
        statusModifiedOn: createdOn,
        escalateTo: jobTaskForm.escalateTo,
        reminder: jobTaskForm.reminder,
        ownership: jobTaskForm.ownership,
        notifyViaEmail: jobTaskForm.notifyViaEmail,
        recurrenceTask: jobTaskForm.recurrenceTask,
        showOnCalendar: jobTaskForm.showOnCalendar
      });
      setJobTasks((current) => [createdTask, ...current]);
      setIsJobTaskFormOpen(false);
      setJobTaskForm(EMPTY_JOB_TASK_FORM);
      showToast('Task created successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown task creation error.';
      showToast(`Unable to create task: ${message}`);
    } finally {
      setIsSavingJobTask(false);
    }
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

  const handleSelectJob = (target: Job) => {
    setJob(target);
    setSearchJobTitle(target.title);
    setIsJobTitleSearchOpen(false);
    setIsJobTitleOptionsOpen(false);
    setJobTitleSearchQuery('');
    navigate('job-detail', target.id);
  };

  const filteredJobTitleOptions = allJobs.filter((candidateJob) => {
    const query = jobTitleSearchQuery.trim().toLowerCase();
    return !query || [
      candidateJob.id,
      candidateJob.code,
      candidateJob.title,
      candidateJob.clientJobId || ''
    ].some((value) => value.toLowerCase().includes(query));
  });

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

  const filteredJobNotes = useMemo(() => {
    const category = notesTab === 'job_posting' ? 'Job Posting' : 'Applicant Reference';
    return (job?.notes || []).filter((note) => (note.category || 'Job Posting') === category).filter((note) => {
      if (!appliedNotesFilter || appliedNotesFilter.field === 'Select' || appliedNotesFilter.values.length === 0) return true;

      const values = appliedNotesFilter.values;
      if (appliedNotesFilter.field === 'action') {
        return values.includes(note.action || '—') || values.includes(note.priority || '—');
      }
      if (appliedNotesFilter.field === 'applicant') return values.includes(note.applicantRef || '—');
      if (appliedNotesFilter.field === 'notified') return (note.notifiedTo || []).some((name) => values.includes(name));
      if (appliedNotesFilter.field === 'added') return values.includes(note.author);
      if (appliedNotesFilter.field === 'note') return values.includes(note.text.replace(/<[^>]*>/g, ' ').trim());
      return true;
    });
  }, [job, notesTab, appliedNotesFilter]);

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
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      showToast(`Downloaded ${item.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown download error.';
      showToast(`Unable to download ${item.name}: ${message}`);
    }
  };

  const handleSaveSkillMatrix = async () => {
    if (!job || isSavingSkillMatrix) return;
    setIsSavingSkillMatrix(true);
    try {
      const updatedJob = await ApiService.updateJob(job.id, { skillMatrix: skillMatrixContent });
      setJob(updatedJob);
      setIsAddSkillMatrixOpen(false);
      showToast('Skill matrix saved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown skill matrix save error.';
      showToast(`Unable to save skill matrix: ${message}`);
    } finally {
      setIsSavingSkillMatrix(false);
    }
  };

  // Add Note
  const handleAddNote = async () => {
    if (!job || !newNoteText.replace(/<[^>]*>/g, '').trim()) return;
    const added = await ApiService.addJobNote(job.id, {
      author: selectedNoteUsers[0] || job.assignedRecruiter || 'Ganesh Godse',
      text: newNoteText,
      date: new Date().toLocaleString(),
      category: newNoteCategory,
      action: newNoteAction,
      priority: newNotePriority,
      applicantRef: newNoteApplicantRef,
      notifiedTo: selectedNoteUsers
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

  // Upload Documents
  const handleUploadDocument = async () => {
    if (!job || selectedDocumentFiles.length === 0 || isUploadingDocuments) return;
    setIsUploadingDocuments(true);
    try {
      const uploadedDocuments = await ApiService.uploadJobDocuments(job.id, selectedDocumentFiles);
      setJob((prev) => prev ? { ...prev, documents: [...(prev.documents || []), ...uploadedDocuments] } : null);
      setSelectedDocumentFiles([]);
      setIsUploadDocModalOpen(false);
      showToast(`${uploadedDocuments.length} document${uploadedDocuments.length === 1 ? '' : 's'} uploaded successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown upload error.';
      showToast(`Unable to upload documents: ${message}`);
    } finally {
      setIsUploadingDocuments(false);
    }
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

  const setQuickSubmissionField = <K extends keyof QuickSubmissionForm>(
    field: K,
    value: QuickSubmissionForm[K]
  ) => {
    setQuickSubmissionDetails((current) => ({ ...current, [field]: value }));
  };

  const selectSubmitApplicant = (applicant: Applicant) => {
    setSubmitApplicantId(applicant.id);
    setSubmitApplicantSearch(`${applicant.name} (${applicant.applicantId})`);
    setIsSubmitApplicantSearchOpen(false);
    setQuickSubmissionDetails((current) => ({ ...current, resumeName: '', availableDocument: '' }));
  };

  const resetQuickSubmissionForm = () => {
    setSubmitApplicantId('');
    setSubmitApplicantSearch('');
    setIsSubmitApplicantSearchOpen(false);
    setSubmitBillRate(0);
    setSubmitPayRate(0);
    setQuickSubmissionDetails(EMPTY_QUICK_SUBMISSION_FORM);
    setQuickSubmissionAttachment(null);
    setQuickSubmissionUserSelections({ recipients: [], additionalNotifiers: [] });
    setQuickSubmissionUserMenu(null);
    setQuickSubmissionUserSearch('');
  };

  const closeApplicantSubmissionModal = () => {
    setIsSubmitCandidateModalOpen(false);
    setIsTagApplicantModalOpen(false);
    setQuickSubmissionUserMenu(null);
  };

  const setQuickSubmissionUsers = (field: QuickSubmissionUserField, userIds: string[]) => {
    setQuickSubmissionUserSelections((current) => ({ ...current, [field]: userIds }));
    const userNames = userIds
      .map((id) => taskUsers.find((user) => user.id === id)?.name)
      .filter((name): name is string => Boolean(name));
    setQuickSubmissionField(field, userNames.join(', '));
  };

  const renderQuickSubmissionUserDropdown = (field: QuickSubmissionUserField, label: string) => {
    const selectedIds = quickSubmissionUserSelections[field];
    const selectedUsers = selectedIds
      .map((id) => taskUsers.find((user) => user.id === id))
      .filter((user): user is User => Boolean(user));
    const isOpen = quickSubmissionUserMenu === field;
    const filteredUsers = taskUsers.filter((user) =>
      `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(quickSubmissionUserSearch.trim().toLowerCase())
    );
    const selectedLabel = selectedUsers.length === 0
      ? 'Select'
      : selectedUsers.length === 1
        ? selectedUsers[0].name
        : `${selectedUsers.length} selected`;

    return (
      <React.Fragment key={field}>
        <label htmlFor={`quick-submit-${field}`} className="text-[#7B8794]">{label}</label>
        <div className="relative min-w-0">
          <button
            id={`quick-submit-${field}`}
            type="button"
            aria-label={label}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            onClick={() => {
              setQuickSubmissionUserMenu((current) => current === field ? null : field);
              setQuickSubmissionUserSearch('');
            }}
            className="flex h-[30px] w-full items-center justify-between border border-[#CBD5E1] bg-[#F8FAFC] px-2 text-left text-xs text-[#344054]"
          >
            <span className="truncate">{selectedLabel}</span>
            <ChevronDown className={`ml-2 h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          {isOpen && (
            <div
              role="listbox"
              aria-label={`${label} users`}
              aria-multiselectable="true"
              className="absolute left-0 top-full z-[90] mt-0.5 w-full border border-[#CBD5E1] bg-white shadow-lg"
            >
              <div className="border-b border-[#E2E8F0] p-2">
                <input
                  type="search"
                  value={quickSubmissionUserSearch}
                  onChange={(event) => setQuickSubmissionUserSearch(event.target.value)}
                  aria-label={`Search ${label.toLowerCase()}`}
                  placeholder="Search users"
                  className="h-7 w-full border border-[#CBD5E1] bg-white px-2 text-xs text-[#344054] outline-none focus:border-[#3478F6]"
                />
              </div>
              <div className="max-h-44 overflow-y-auto py-1">
                <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs text-[#344054] hover:bg-[#F2F6FC]">
                  <input
                    type="checkbox"
                    checked={taskUsers.length > 0 && taskUsers.every((user) => selectedIds.includes(user.id))}
                    disabled={taskUsers.length === 0}
                    onChange={(event) => setQuickSubmissionUsers(
                      field,
                      event.target.checked ? taskUsers.map((user) => user.id) : []
                    )}
                    className="h-3.5 w-3.5 accent-[#3478F6]"
                  />
                  <span>Select all</span>
                </label>
                {filteredUsers.map((user) => (
                  <label
                    key={user.id}
                    className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs text-[#344054] hover:bg-[#F2F6FC]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={() => setQuickSubmissionUsers(
                        field,
                        selectedIds.includes(user.id)
                          ? selectedIds.filter((id) => id !== user.id)
                          : [...selectedIds, user.id]
                      )}
                      className="h-3.5 w-3.5 accent-[#3478F6]"
                    />
                    <span className="min-w-0 flex-1 truncate">{user.name}</span>
                    <span className="shrink-0 text-[10px] capitalize text-[#667085]">{user.role.replace('_', ' ')}</span>
                  </label>
                ))}
                {taskUsers.length === 0 && (
                  <p className="px-3 py-2 text-xs text-[#667085]">No application users available.</p>
                )}
                {taskUsers.length > 0 && filteredUsers.length === 0 && (
                  <p className="px-3 py-2 text-xs text-[#667085]">No users match your search.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </React.Fragment>
    );
  };

  // Submit Candidate to Job
  const handleQuickSubmitCandidate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!job || !submitApplicantId) return;
    const cand = applicants.find((a) => a.id === submitApplicantId);
    if (!cand) {
      showToast('The selected applicant could not be found.');
      return;
    }

    const newSub = await ApiService.createSubmission({
      applicantId: cand.id,
      applicantName: cand.name,
      jobId: job.id,
      jobTitle: job.title,
      client: job.client,
      recruiter: job.assignedRecruiter || 'Ganesh Godse',
      billRate: submitBillRate || job.billRate,
      payRate: submitPayRate || job.payRate,
      status: 'Waiting for Evaluation by Internal Reviewer',
      quickSubmissionDetails
    });

    setSubmissions((prev) => [newSub, ...prev]);
    closeApplicantSubmissionModal();
    resetQuickSubmissionForm();
    showToast(`Submitted ${cand.name} to ${job.code}`);
  };

  const handleTagApplicant = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!job || !submitApplicantId) return;
    const candidate = applicants.find((applicant) => applicant.id === submitApplicantId);
    if (!candidate) {
      showToast('The selected applicant could not be found.');
      return;
    }
    if (jobSubmissions.some((submission) => submission.applicantId === candidate.id)) {
      showToast(`${candidate.name} is already tagged to this job.`);
      return;
    }

    try {
      const newSubmission = await ApiService.createSubmission({
        applicantId: candidate.id,
        applicantName: candidate.name,
        jobId: job.id,
        jobTitle: job.title,
        client: job.client,
        recruiter: job.assignedRecruiter || 'Ganesh Godse',
        billRate: submitBillRate || job.billRate,
        payRate: submitPayRate || job.payRate,
        status: 'Waiting for Evaluation by Internal Reviewer',
        quickSubmissionDetails
      });
      setSubmissions((current) => [newSubmission, ...current]);
      closeApplicantSubmissionModal();
      resetQuickSubmissionForm();
      showToast(`Tagged ${candidate.name} to ${job.title}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown applicant tagging error.';
      showToast(`Unable to tag applicant: ${message}`);
    }
  };

  const resetQuickTagForm = () => {
    setQuickTagApplicantId('');
    setQuickTagApplicantSearch('');
    setIsQuickTagApplicantListOpen(false);
  };

  const closeQuickTagModal = () => {
    setIsQuickTagModalOpen(false);
    resetQuickTagForm();
  };

  const handleQuickTagApplicant = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!job || !quickTagApplicantId || isSavingQuickTag) return;

    const candidate = applicants.find((applicant) => applicant.id === quickTagApplicantId);
    if (!candidate) {
      showToast('The selected applicant could not be found.');
      return;
    }
    if (jobSubmissions.some((submission) => submission.applicantId === candidate.id)) {
      showToast(`${candidate.name} is already tagged to this job.`);
      return;
    }

    setIsSavingQuickTag(true);
    try {
      const newSubmission = await ApiService.createSubmission({
        applicantId: candidate.id,
        applicantName: candidate.name,
        jobId: job.id,
        jobTitle: job.title,
        client: job.client,
        recruiter: job.assignedRecruiter || 'Ganesh Godse',
        billRate: job.billRate,
        payRate: job.payRate,
        status: 'Waiting for Evaluation by Internal Reviewer'
      });
      setSubmissions((current) => [newSubmission, ...current]);
      closeQuickTagModal();
      showToast(`Tagged ${candidate.name} to ${job.title}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown applicant tagging error.';
      showToast(`Unable to tag applicant: ${message}`);
    } finally {
      setIsSavingQuickTag(false);
    }
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

  const selectedSubmitApplicant = applicants.find((applicant) => applicant.id === submitApplicantId);
  const filteredSubmitApplicants = applicants.filter((applicant) =>
    `${applicant.name} ${applicant.applicantId} ${applicant.email}`.toLocaleLowerCase().includes(submitApplicantSearch.trim().toLocaleLowerCase())
  );
  const applicantDocuments = selectedSubmitApplicant?.documents || [];
  const applicantResumes = applicantDocuments.filter((document) => /resume|cv/i.test(document.name));
  const tasksForCurrentJob = jobTasks.filter((task) => task.jobId === job.id);
  const jobActivityRows = [
    {
      id: 'position-title-current',
      timestamp: '2026-11-19T13:20:46',
      displayTime: '19/11/2026 13:20:46 PM',
      actor: 'ganesh.godse@ampcustech.com',
      description: `Position Title has been changed to [${job.title.toLowerCase()}] through Macro by Ganesh Godse.`
    },
    {
      id: 'position-title-previous',
      timestamp: '2026-11-19T13:20:15',
      displayTime: '19/11/2026 13:20:15 PM',
      actor: 'ganesh.godse@ampcustech.com',
      description: 'Position Title has been changed to [AIM demo] through Macro by Ganesh Godse.'
    },
    {
      id: 'primary-skills',
      timestamp: '2026-11-17T15:03:51',
      displayTime: '17/11/2026 15:03:51 PM',
      actor: 'ganesh.godse@ampcustech.com',
      preview: 'Primary Skills has been changed from [Postgres,Py',
      description: 'Primary Skills has been changed from [Postgres,Python] to [PostgreSQL,Python,React] through Macro by Ganesh Godse.'
    },
    {
      id: 'search-criteria-1',
      timestamp: '2026-11-17T12:30:51',
      displayTime: '17/11/2026 12:30:51 PM',
      actor: 'ganesh.godse@ampcustech.com',
      preview: 'Search criteria has been modified',
      description: 'Search criteria has been modified by Ganesh Godse.'
    },
    {
      id: 'job-status',
      timestamp: '2026-11-10T20:07:26',
      displayTime: '10/11/2026 20:07:26 PM',
      actor: 'ganesh.godse@ampcustech.com',
      preview: 'Job Status has been changed from [Draft] to [Active]',
      description: 'Job Status has been changed from [Draft] to [Active] through Macro by Ganesh Godse.'
    },
    {
      id: 'search-criteria-2',
      timestamp: '2026-11-10T20:06:31',
      displayTime: '10/11/2026 20:06:31 PM',
      actor: 'ganesh.godse@ampcustech.com',
      preview: 'Search criteria has been modified',
      description: 'Search criteria has been modified by Ganesh Godse.'
    },
    {
      id: 'job-created',
      timestamp: '2026-11-10T20:00:56',
      displayTime: '10/11/2026 20:00:56 PM',
      description: `${job.code} - ${job.title} job has been created by ganesh.godse@ampcustech.com.`
    }
  ];
  const activityCutoff = new Date();
  activityCutoff.setMonth(activityCutoff.getMonth() - 6);
  const visibleJobActivityRows = jobActivityRows.filter((activity) => {
    if (activityRange === 'all') return true;
    const isRecent = new Date(activity.timestamp) >= activityCutoff;
    return activityRange === 'last_6_months' ? isRecent : !isRecent;
  });

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

  const renderJobBoardSelector = () => (
    <>
      <div className="px-3 pt-3">
        <div className="relative max-w-[245px]">
          <input
            type="search"
            aria-label="Search job boards"
            placeholder="Search"
            value={jobBoardSearch}
            onChange={(event) => setJobBoardSearch(event.target.value)}
            className="h-7 w-full border border-[#D0D5DD] bg-white px-2 pr-7 text-xs text-[#344054] outline-none focus:border-[#3478F6] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
          />
          <Search className="pointer-events-none absolute right-2 top-1.5 h-4 w-4 text-[#667085]" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 px-3 py-3 text-[#344054] dark:text-white">
        <section className="border-r border-[#EAECF0] pr-3 dark:border-[#334155]">
          <h3 className="mb-2 font-semibold">Marketplace</h3>
          {filterJobBoards(MARKETPLACE_JOB_BOARDS).map((board) => {
            const isSelected = jobBoardSelectionDraft.includes(board);
            return (
              <button
                key={board}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                onClick={() => toggleJobBoardSelection(board)}
                className="flex w-full items-center gap-1.5 rounded px-1 py-1 text-left hover:bg-[#F3F4F6] dark:hover:bg-[#0F172A]"
              >
                <span className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${isSelected ? 'border-[#3478F6]' : 'border-[#98A2B3]'}`}>
                  {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-[#3478F6]" />}
                </span>
                <span>{board}</span>
              </button>
            );
          })}
        </section>

        <section>
          <h3 className="mb-2 font-semibold">Free Job Boards</h3>
          {filterJobBoards(FREE_JOB_BOARDS).length > 0 && (
            <label className="mb-1 flex items-center gap-1.5 px-1 py-0.5">
              <input
                type="checkbox"
                aria-label="Select all free job boards"
                checked={FREE_JOB_BOARDS.every((board) => jobBoardSelectionDraft.includes(board))}
                onChange={(event) => {
                  const isChecked = event.target.checked;
                  setJobBoardSelectionDraft((current) =>
                    isChecked
                      ? Array.from(new Set([...current, ...FREE_JOB_BOARDS]))
                      : current.filter((board) => !FREE_JOB_BOARDS.includes(board))
                  );
                }}
                className="h-4 w-4 accent-[#3478F6]"
              />
              <span>Select All</span>
            </label>
          )}
          {filterJobBoards(FREE_JOB_BOARDS).map((board) => (
            <label key={board} className="flex items-center gap-1.5 px-1 py-0.5">
              <input
                type="checkbox"
                checked={jobBoardSelectionDraft.includes(board)}
                onChange={() => toggleJobBoardSelection(board)}
                className="h-4 w-4 accent-[#3478F6]"
              />
              <span>{board}</span>
            </label>
          ))}
        </section>

        <section className="border-l border-[#EAECF0] pl-3 dark:border-[#334155]">
          <h3 className="mb-2 font-semibold">Free with Options</h3>
          {filterJobBoards(FREE_WITH_OPTIONS_JOB_BOARDS).map((board) => (
            <button
              key={board}
              type="button"
              aria-pressed={jobBoardSelectionDraft.includes(board)}
              onClick={() => toggleJobBoardSelection(board)}
              className="flex w-full items-center gap-1.5 rounded px-1 py-1 text-left hover:bg-[#F3F4F6] dark:hover:bg-[#0F172A]"
            >
              <Linkedin className="h-4 w-4 text-[#0A66C2]" />
              <span>{board}</span>
              {jobBoardSelectionDraft.includes(board) && <Check className="ml-auto h-3.5 w-3.5 text-[#3478F6]" />}
            </button>
          ))}
        </section>
      </div>

      <div className="flex justify-center gap-2 border-t border-[#EAECF0] bg-[#F3F4F6] px-3 py-2 dark:border-[#334155] dark:bg-[#1E293B]">
        <button
          type="button"
          aria-label="Confirm job board selection"
          disabled={jobBoardSelectionDraft.length === 0}
          onClick={() => {
            setSelectedJobBoards(jobBoardSelectionDraft);
            showToast('Job board selection updated');
            setIsJobBoardsMenuOpen(false);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#3478F6] text-[#3478F6] hover:bg-[#EAF2FF] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Cancel job board selection"
          onClick={() => {
            setJobBoardSelectionDraft(selectedJobBoards);
            setIsJobBoardsMenuOpen(false);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#2563EB] text-[#2563EB] hover:bg-[#F1F5F9]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </>
  );

  const getCustomJobDetail = (field: string, fallback = 'N/A') => {
    const value = job.customFields?.[field];
    return value === undefined || value === null || value === '' ? fallback : String(value);
  };

  const renderClientDetailsTooltip = () => (
    <span className="group relative ml-1 inline-flex">
      <button
        type="button"
        aria-label="Show client details"
        aria-describedby="client-details-tooltip"
        className="inline-flex text-[#3478F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3478F6]"
      >
        <HelpCircle className="h-3 w-3" />
      </button>
      <div
        id="client-details-tooltip"
        role="tooltip"
        className="absolute left-3 top-1/2 z-50 hidden w-60 -translate-y-1/2 rounded-md border border-[#D0D5DD] bg-white text-[#344054] shadow-lg group-hover:block group-focus-within:block dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
      >
        <span aria-hidden className="absolute -left-1 top-4 h-2 w-2 rotate-45 border-b border-l border-[#D0D5DD] bg-white dark:border-[#334155] dark:bg-[#1E293B]" />
        <div className="border-b border-[#EAECF0] px-3 py-2 font-medium dark:border-[#334155]">Client Details</div>
        <div className="p-3">
          <table className="w-full border-collapse text-[10px]">
            <tbody>
              {[
                ['Category', job.category || 'N/A'],
                ['Industry', job.industry || 'N/A'],
                ['About Company', getCustomJobDetail('aboutCompany')]
              ].map(([label, value]) => (
                <tr key={label}>
                  <td className="border border-[#D0D5DD] bg-[#F3F4F6] px-2 py-1 dark:border-[#334155] dark:bg-[#1E293B]">{label}</td>
                  <td className="border border-[#D0D5DD] px-2 py-1 dark:border-[#334155]">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </span>
  );

  const renderJobDetailSection = (
    title: string,
    fields: { label: string; value: React.ReactNode }[]
  ) => (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[#1E293B] dark:text-white">{title}</h3>
        {title === 'Job Details' && (
          <button
            type="button"
            aria-label="Edit job details"
            title="Edit job details"
            onClick={() => navigate('job-edit', job.id)}
            className="rounded p-1 text-[#3478F6] hover:bg-[#EAF2FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3478F6] dark:hover:bg-[#0F172A]"
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-[10px] sm:grid-cols-3">
        {fields.map((field, index) => (
          <div key={`${field.label}-${index}`} className="min-w-0">
            <span className="mb-0.5 flex items-center text-[#667085] dark:text-[#94A3B8]">
              {field.label}
              {field.label === 'Client' && renderClientDetailsTooltip()}
            </span>
            <div className="break-words font-medium text-[#1E293B] dark:text-white">{field.value}</div>
          </div>
        ))}
      </div>
    </section>
  );

  const careerPortalToggle = (
    <button
      type="button"
      onClick={async () => {
        const newStatus = !job.postJobOnCareerPortal;
        await ApiService.updateJob(job.id, { postJobOnCareerPortal: newStatus });
        setJob({ ...job, postJobOnCareerPortal: newStatus });
        showToast(`Career portal publication: ${newStatus ? 'ON' : 'OFF'}`);
      }}
      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
        job.postJobOnCareerPortal ? 'bg-emerald-600 text-white' : 'bg-gray-400 text-white'
      }`}
    >
      {job.postJobOnCareerPortal ? 'ON' : 'OFF'}
    </button>
  );

  const formatPrintDate = (value?: string) => {
    if (!value) return undefined;
    const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) return `${dateOnlyMatch[3]}/${dateOnlyMatch[2]}/${dateOnlyMatch[1]}`;
    return value;
  };

  const printableJobSections: Array<{ title: string; variant: string; rows: PrintableJobRow[] }> = [
    {
      title: 'Job Details',
      variant: 'job-details',
      rows: [
        [{ label: 'Job Code', value: job.code }, { label: 'Job Title', value: job.title }],
        [{ label: 'Client Bill Rate / Salary', value: job.billRate > 0
          ? `${job.currency === 'INR' ? '₹' : '$'}${job.billRate}${job.rateType ? ` / ${job.rateType}` : ''}`
          : undefined }, { label: 'Job Start Date', value: formatPrintDate(job.startDate) }],
        [{ label: 'Job End Date', value: formatPrintDate(job.endDate) }, { label: 'Location', value: job.location }],
        [{ label: 'States', value: job.states }, { label: 'Job Status', value: job.status }],
        [{ label: 'Client', value: job.client }, { label: 'Client Job ID', value: job.clientJobId }],
        [{ label: 'Career Portal Published Date', value: formatPrintDate(job.careerPortalPublishedDate) }, { label: 'Duration', value: job.duration }],
        [{ label: 'Post Job on Career Portal', value: job.postJobOnCareerPortal }, { label: 'Turnaround Time', value: job.turnaroundTime != null
          ? `${job.turnaroundTime} ${job.turnaroundUnit || ''}`.trim()
          : undefined }],
        [{ label: 'Client Manager', value: job.clientManager }, { label: 'Priority', value: job.priority }],
        [{ label: 'Remote Job', value: job.remoteJob }, { label: 'Address', value: job.address }],
        [{ label: 'Clearance', value: job.clearance }, { label: 'Respond By', value: formatPrintDate(job.respondBy) }],
        [{ label: 'Job Type', value: job.type }]
      ]
    },
    {
      title: 'Skills',
      variant: 'skills',
      rows: [
        [{ label: 'Industry', value: job.industry }, { label: 'Degree', value: job.degree }],
        [{ label: 'Experience', value: job.minExperience != null
          ? `${job.minExperience}-${job.maxExperience ?? job.minExperience} Years`
          : job.experienceRequired }],
        [{ label: 'Primary Skills', value: (job.primarySkills?.length ? job.primarySkills : job.skills).join(', ') }],
        [{ label: 'Secondary Skills', value: job.secondarySkills?.join(', ') }]
      ]
    },
    {
      title: 'Organizational Information',
      variant: 'organization',
      rows: [
        [{ label: 'Number of Positions', value: job.openings }, { label: 'Maximum Allowed Submissions', value: job.maxSubmissions }],
        [{ label: 'Recruitment Manager', value: job.recruitmentManager }, { label: 'Sales Manager', value: job.salesManager }],
        [{ label: 'Assigned To', value: job.assignedTo || job.assignedRecruiter }, { label: 'Primary Recruiter', value: job.customFields?.primaryRecruiter }],
        [{ label: 'Additional Notifications', value: job.additionalNotifications }, { label: 'Account Manager', value: job.accountManager }]
      ]
    },
    {
      title: 'User Defined Fields',
      variant: 'user-fields',
      rows: [
        [{ label: 'Comments', value: job.comments }],
        [{ label: 'General Job Category', value: job.category }, { label: 'Job Skill Type', value: job.skillType }]
      ]
    }
  ];

  const handlePrintJob = () => {
    const previousTitle = document.title;
    document.title = 'Job Posting Information';
    window.addEventListener('afterprint', () => {
      document.title = previousTitle;
    }, { once: true });
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#0F172A] text-[#1E293B] dark:text-[#E2E8F0] pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#2563EB] text-white border border-[#2563EB] px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#8AC9A7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Secondary Navigation Tabs (Ceipal Authenticity) */}
      <div className="bg-white dark:bg-[#1E293B] border-b border-[#CBD5E1] dark:border-[#0F172A] sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 flex items-center justify-between h-11 text-xs">
          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'snapshot', label: 'Snapshot' },
              { id: 'job_details', label: 'Job Details' },
              { id: 'additional_details', label: 'Additional Details' },
              { id: 'task_manager', label: 'Task Manager' },
              { id: 'activities', label: 'Activities' },
              { id: 'email_merges', label: 'Email Merges' },
              { id: 'email_activity', label: 'Email Activity' },
              { id: 'surveys', label: 'Surveys' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3 py-2 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#2563EB] text-[#1E293B] dark:text-[#93C5FD]'
                    : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#1E293B] dark:hover:text-white'
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
                onClick={() => {
                  setIsGearMenuOpen(!isGearMenuOpen);
                  setIsJobTagsMenuOpen(false);
                  setIsSubmitMenuOpen(false);
                  setIsJobBoardsMenuOpen(false);
                  setIsShareMenuOpen(false);
                }}
                className="p-1.5 rounded-lg border border-[#CBD5E1] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] flex items-center gap-1"
                title="Job Settings"
              >
                <Settings className="w-3.5 h-3.5" />
                <ChevronDown className="w-3 h-3 text-[#64748B]" />
              </button>

              {isGearMenuOpen && (
                <div className="absolute right-0 mt-1 w-60 rounded-md border border-[#D0D5DD] bg-white py-1 text-xs shadow-xl dark:border-[#334155] dark:bg-[#1E293B] z-40 animate-in fade-in">
                  {[
                    {
                      label: 'Add Notes',
                      onClick: () => {
                        setNewNoteText('');
                        setNewNoteAction('');
                        setNoteUserSearch('');
                        setSelectedNoteUsers(['Ganesh Godse']);
                        setNewNotePriority('Medium');
                        setNewNoteApplicantRef('');
                        setNewNoteCategory(notesTab === 'applicant_reference' ? 'Applicant Reference' : 'Job Posting');
                        setIsNoteActionMenuOpen(false);
                        setIsNoteUserMenuOpen(false);
                        setNoteEditorResetKey((key) => key + 1);
                        setIsAddNoteModalOpen(true);
                        setIsGearMenuOpen(false);
                      }
                    },
                    {
                      label: 'Upload Document',
                      onClick: () => {
                        setSelectedDocumentFiles([]);
                        setDocumentSourceMessage('');
                        setActiveTab('snapshot');
                        setIsUploadDocModalOpen(true);
                        setIsGearMenuOpen(false);
                      }
                    },
                    {
                      label: 'Share Job',
                      onClick: () => {
                        setShareJobRecipients('');
                        setShareJobSubject(`Ampcus Tech interview for ${job.title.toLowerCase()}`);
                        setShareJobBody(createShareJobEmailBody(job));
                        setShareJobEditorResetKey((key) => key + 1);
                        setIsShareJobPreviewOpen(true);
                        setIsGearMenuOpen(false);
                      }
                    },
                    {
                      label: 'Send Job to Bench Consultant',
                      onClick: () => {
                        showToast('Bench consultant assignment is not configured for this requisition.');
                        setIsGearMenuOpen(false);
                      }
                    },
                    {
                      label: 'Application vs Visitor',
                      onClick: () => {
                        showToast(`Applications: ${job.appliersCount ?? job.applicantsCount ?? 0}, Visitors: ${job.visitorsCount ?? 0}`);
                        setIsGearMenuOpen(false);
                      }
                    },
                    {
                      label: 'Receive Applications To',
                      onClick: () => {
                        const recipient = job.additionalNotifications?.trim()
                          || job.assignedTo
                          || job.assignedRecruiter
                          || 'Not configured';
                        showToast(`Application notifications: ${recipient}`);
                        setIsGearMenuOpen(false);
                      }
                    },
                    {
                      label: 'Initialize Job to Ropes',
                      onClick: () => {
                        showToast('Ropes integration is not configured.');
                        setIsGearMenuOpen(false);
                      }
                    },
                    {
                      label: 'Copy Referral Link',
                      onClick: () => {
                        const referralUrl = new URL(window.location.href);
                        referralUrl.searchParams.set('ref', job.code);
                        navigator.clipboard.writeText(referralUrl.toString());
                        showToast('Referral link copied to clipboard');
                        setIsGearMenuOpen(false);
                      }
                    },
                    {
                      label: 'Print Job',
                      onClick: () => {
                        setIsJobPrintPreviewOpen(true);
                        setIsGearMenuOpen(false);
                      }
                    },
                    {
                      label: 'Skill Matrix',
                      onClick: () => {
                        setSkillMatrixContent(job.skillMatrix || '');
                        setSkillMatrixEditorResetKey((current) => current + 1);
                        setIsAddSkillMatrixOpen(true);
                        setIsGearMenuOpen(false);
                      }
                    }
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      className="w-full px-3 py-1.5 text-left text-[#3478F6] hover:bg-[#F3F4F6] dark:text-[#93B4FF] dark:hover:bg-[#0F172A]"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Job Tags Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsJobTagsMenuOpen(!isJobTagsMenuOpen);
                  setIsGearMenuOpen(false);
                  setIsSubmitMenuOpen(false);
                  setIsJobBoardsMenuOpen(false);
                  setIsShareMenuOpen(false);
                }}
                aria-label="Job tags"
                title="Job tags"
                className="flex items-center gap-1 rounded-lg border border-[#CBD5E1] p-1.5 text-[#64748B] hover:bg-[#F1F5F9] dark:border-[#334155] dark:text-[#94A3B8] dark:hover:bg-[#1E293B]"
              >
                <Tag className="h-3.5 w-3.5" />
                <ChevronDown className="h-3 w-3" />
              </button>
              {isJobTagsMenuOpen && (
                <div className="absolute right-0 z-40 mt-1 w-48 rounded-md border border-[#D0D5DD] bg-white py-1 text-xs shadow-xl dark:border-[#334155] dark:bg-[#1E293B]">
                  <button
                    type="button"
                    onClick={() => {
                      resetQuickSubmissionForm();
                      setIsSubmitCandidateModalOpen(false);
                      setIsTagApplicantModalOpen(true);
                      setIsJobTagsMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[#3478F6] hover:bg-[#F3F4F6] dark:text-[#93B4FF] dark:hover:bg-[#0F172A]"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Tag Applicant</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetQuickTagForm();
                      setIsQuickTagApplicantListOpen(true);
                      setIsQuickTagModalOpen(true);
                      setIsSubmitCandidateModalOpen(false);
                      setIsTagApplicantModalOpen(false);
                      setIsJobTagsMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[#3478F6] hover:bg-[#F3F4F6] dark:text-[#93B4FF] dark:hover:bg-[#0F172A]"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Quick Tag</span>
                  </button>
                </div>
              )}
            </div>

            {/* Send Job */}
            <button
              type="button"
              onClick={() => {
                resetQuickSubmissionForm();
                setIsTagApplicantModalOpen(false);
                setIsSubmitCandidateModalOpen(true);
                setIsGearMenuOpen(false);
                setIsJobTagsMenuOpen(false);
                setIsSubmitMenuOpen(false);
                setIsJobBoardsMenuOpen(false);
                setIsShareMenuOpen(false);
              }}
              aria-label="Quick Submission"
              title="Quick Submission"
              className="rounded-lg border border-[#CBD5E1] p-1.5 text-[#64748B] hover:bg-[#F1F5F9] dark:border-[#334155] dark:text-[#94A3B8] dark:hover:bg-[#1E293B]"
            >
              <Send className="h-3.5 w-3.5" />
            </button>

            {/* Submit Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsSubmitMenuOpen(!isSubmitMenuOpen);
                  setIsGearMenuOpen(false);
                  setIsJobTagsMenuOpen(false);
                  setIsJobBoardsMenuOpen(false);
                  setIsShareMenuOpen(false);
                }}
                className="flex items-center gap-1 rounded-lg border border-[#CBD5E1] px-2.5 py-1.5 text-xs font-medium text-[#64748B] hover:bg-[#F1F5F9] dark:border-[#334155] dark:text-[#CBD5E1] dark:hover:bg-[#1E293B]"
              >
                <span>Submit</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {isSubmitMenuOpen && (
                <div className="absolute right-0 z-40 mt-1 w-52 rounded-md border border-[#D0D5DD] bg-white py-1 text-xs shadow-xl dark:border-[#334155] dark:bg-[#1E293B]">
                  <button
                    type="button"
                    onClick={() => {
                      navigate('applicant-profile-submission', job.id);
                      setIsSubmitMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-1.5 px-4 py-1.5 text-left text-[#344054] hover:bg-[#F3F4F6] dark:text-white dark:hover:bg-[#0F172A]"
                  >
                    <Check className="h-3.5 w-3.5 shrink-0 text-[#3478F6]" />
                    <span>Submit Applicant</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('applicant-new');
                      setIsSubmitMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-1.5 px-4 py-1.5 text-left text-[#344054] hover:bg-[#F3F4F6] dark:text-white dark:hover:bg-[#0F172A]"
                  >
                    <Check className="h-3.5 w-3.5 shrink-0 text-[#3478F6]" />
                    <span>Add &amp; Submit Applicant</span>
                  </button>
                </div>
              )}
            </div>

            {/* Job Boards Button */}
            <div className="relative">
              <button
                onClick={() => {
                  const opening = !isJobBoardsMenuOpen;
                  if (opening) {
                    setJobBoardSelectionDraft(selectedJobBoards);
                    setJobBoardSearch('');
                  }
                  setIsJobBoardsMenuOpen(opening);
                  setIsGearMenuOpen(false);
                  setIsJobTagsMenuOpen(false);
                  setIsSubmitMenuOpen(false);
                  setIsShareMenuOpen(false);
                }}
                aria-expanded={isJobBoardsMenuOpen}
                aria-haspopup="dialog"
                className="px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] dark:border-[#334155] text-[#64748B] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] flex items-center gap-1 font-medium"
              >
                <span>Job Boards</span>
                <ChevronDown className="w-3 h-3 text-[#64748B]" />
              </button>

              {isJobBoardsMenuOpen && (
                <div
                  role="dialog"
                  aria-label="Select job boards"
                  className="absolute right-0 z-40 mt-1 w-[560px] max-w-[calc(100vw-1rem)] rounded-md border border-[#D0D5DD] bg-white text-xs shadow-xl dark:border-[#334155] dark:bg-[#1E293B]"
                >
                  {renderJobBoardSelector()}
                </div>
              )}
            </div>

            {/* Share Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsShareMenuOpen(!isShareMenuOpen);
                  setIsGearMenuOpen(false);
                  setIsJobTagsMenuOpen(false);
                  setIsSubmitMenuOpen(false);
                  setIsJobBoardsMenuOpen(false);
                }}
                aria-expanded={isShareMenuOpen}
                aria-haspopup="menu"
                aria-label="Share job"
                className="px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] dark:border-[#334155] text-[#64748B] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] flex items-center gap-1 font-medium"
              >
                <span>Share</span>
                <ChevronDown className="w-3 h-3 text-[#64748B]" />
              </button>

              {isShareMenuOpen && (
                <div
                  role="menu"
                  aria-label="Share job on social media"
                  className="absolute right-0 mt-1 flex w-9 flex-col items-center gap-1 rounded-md border border-[#CBD5E1] bg-white p-1 shadow-lg dark:border-[#334155] dark:bg-[#1E293B] z-40"
                >
                  <a
                    role="menuitem"
                    aria-label="Share on LinkedIn"
                    title="LinkedIn"
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded bg-[#0A66C2] text-white hover:brightness-90"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a
                    role="menuitem"
                    aria-label="Share on Facebook"
                    title="Facebook"
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded bg-[#1877F2] text-white hover:brightness-90"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                  <a
                    role="menuitem"
                    aria-label="Share on Twitter"
                    title="Twitter"
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Opening: ${job.title} (${job.code})`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded bg-[#1DA1F2] text-white hover:brightness-90"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ceipal Status Alert Banner */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 pt-3">
        {job.status === 'Open' || job.status === 'Active' ? (
          <div className="bg-[#EFF8F3] dark:bg-[#16382B] border border-[#8AC9A7]/60 text-[#276749] dark:text-[#8AC9A7] px-4 py-2 rounded-lg text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8AC9A7] animate-pulse"></span>
              <span>Active Requisition — Ready for applicant submissions and sourcing pipeline.</span>
            </div>
            <span className="font-mono text-[11px] font-semibold">Priority: {job.priority}</span>
          </div>
        ) : (
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
        )}
      </div>

      {/* Main 2-Column Split: Left Dossier & Submissions + Right Ceipal Search Criteria */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 pt-4">
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* ========================================================= */}
          {/* LEFT MAIN PANE (approx 70% width) */}
          {/* ========================================================= */}
          <div className={`w-full space-y-4 ${activeTab === 'task_manager' || activeTab === 'email_merges' || activeTab === 'activities' || activeTab === 'email_activity' || activeTab === 'surveys' ? '' : 'lg:w-[69%]'}`}>
            {/* Top Job Hero Card */}
            <div className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#0F172A] rounded-xl p-5 shadow-xs space-y-4">
              {/* Header Row */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => navigate('jobs')}
                    className="p-1.5 rounded-lg border border-[#CBD5E1] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
                    title="Back to Job Postings"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#2563EB] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                      ★
                    </span>
                    {!isJobTitleSearchOpen ? (
                      <h1 className="text-base sm:text-lg font-bold text-[#1E293B] dark:text-white flex items-center gap-1.5">
                        <span>{job.code} - {job.title}</span>
                        <button
                          type="button"
                          aria-label="Search jobs"
                          onClick={() => {
                            setJobTitleSearchQuery('');
                            setIsJobTitleOptionsOpen(false);
                            setIsJobTitleSearchOpen(true);
                          }}
                          className="text-[#64748B] hover:text-[#1E293B] dark:hover:text-white"
                        >
                          <Search className="h-3.5 w-3.5" />
                        </button>
                      </h1>
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="relative">
                          <button
                            type="button"
                            aria-label="Choose a job"
                            aria-haspopup="listbox"
                            aria-expanded={isJobTitleOptionsOpen}
                            aria-controls="job-title-search-options"
                            onClick={() => setIsJobTitleOptionsOpen((open) => !open)}
                            className="flex h-8 w-[300px] max-w-[calc(100vw-120px)] items-center justify-between gap-2 border border-[#D0D5DD] bg-white px-2 text-left text-xs font-normal text-[#344054] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
                          >
                            <span className="truncate">Enter the Job id or Job title to search for the Job</span>
                            <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${isJobTitleOptionsOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {isJobTitleOptionsOpen && (
                            <div
                              id="job-title-search-options"
                              className="absolute left-0 top-full z-[60] w-[350px] max-w-[calc(100vw-2rem)] border border-[#D0D5DD] bg-white shadow-lg dark:border-[#334155] dark:bg-[#1E293B]"
                            >
                              <div className="relative border-b border-[#EAECF0] p-2 dark:border-[#334155]">
                                <input
                                  autoFocus
                                  type="search"
                                  aria-label="Search jobs by ID or title"
                                  value={jobTitleSearchQuery}
                                  onChange={(event) => setJobTitleSearchQuery(event.target.value)}
                                  placeholder="Search"
                                  className="h-7 w-full border border-[#3478F6] bg-white px-2 pr-7 text-xs text-[#344054] outline-none dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
                                />
                                <Search className="pointer-events-none absolute right-4 top-3.5 h-3.5 w-3.5 text-[#667085]" />
                              </div>
                              <div role="listbox" className="max-h-60 overflow-y-auto py-1 text-[11px]">
                                {filteredJobTitleOptions.length > 0 ? (
                                  filteredJobTitleOptions.map((candidateJob) => (
                                    <button
                                      key={candidateJob.id}
                                      type="button"
                                      role="option"
                                      aria-selected={candidateJob.id === job.id}
                                      onClick={() => handleSelectJob(candidateJob)}
                                      className="w-full px-2 py-1.5 text-left text-[#344054] hover:bg-[#F3F4F6] dark:text-white dark:hover:bg-[#0F172A]"
                                    >
                                      {candidateJob.code} - {candidateJob.title}
                                      {candidateJob.clientJobId ? ` (Client Job ID - ${candidateJob.clientJobId})` : ''}
                                    </button>
                                  ))
                                ) : (
                                  <div className="px-2 py-2 text-[#667085]">No jobs found</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          aria-label="Close job search"
                          onClick={() => {
                            setIsJobTitleSearchOpen(false);
                            setIsJobTitleOptionsOpen(false);
                            setJobTitleSearchQuery('');
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#2563EB] text-[#2563EB] hover:bg-[#F1F5F9]"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Previous / Next Job Navigation Arrows (< >) */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevJob}
                    className="p-1 rounded-md border border-[#CBD5E1] dark:border-[#334155] text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
                    title="Previous Job"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextJob}
                    className="p-1 rounded-md border border-[#CBD5E1] dark:border-[#334155] text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
                    title="Next Job"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-header details & action buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap text-[#64748B] dark:text-[#94A3B8]">
                  <span className="flex items-center gap-1 font-semibold text-[#1E293B] dark:text-[#93C5FD]">
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
                    onClick={() => navigate('job-edit', job.id)}
                    className="px-3 py-1.5 rounded-lg border border-[#2563EB] text-[#1E293B] dark:text-[#93C5FD] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] font-semibold text-xs transition-colors"
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#CBD5E1] dark:border-[#0F172A] text-xs">
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
              <div className="pt-3 border-t border-[#CBD5E1] dark:border-[#0F172A] text-xs space-y-1.5">
                <div className="flex items-center gap-1 font-semibold text-[#1E293B] dark:text-white">
                  <span>Job Description</span>
                  <FileText className="w-3.5 h-3.5 text-[#1E293B]" />
                </div>

                <div
                  className={`text-[#64748B] dark:text-[#94A3B8] leading-relaxed ${
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
                <div className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#0F172A] rounded-xl shadow-xs overflow-hidden">
                  {/* Submissions Header & Filters */}
                  <div className="p-4 border-b border-[#CBD5E1] dark:border-[#0F172A] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-[#1E293B] dark:text-white">Submissions</h2>
                      </div>

                      {/* Search Bar */}
                      <div className="relative w-full sm:w-64">
                        <input
                          type="text"
                          value={submissionSearch}
                          onChange={(e) => setSubmissionSearch(e.target.value)}
                          placeholder="Search candidate name or ID..."
                          className="w-full pl-8 pr-3 py-1.5 bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB]"
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
                                : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
                            }`}
                          >
                            <span>{tab.label}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-[#CBD5E1] dark:bg-[#334155] text-[#1E293B] dark:text-white'
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
                        <tr className="bg-[#F1F5F9]/60 dark:bg-[#1E293B] border-b border-[#CBD5E1] dark:border-[#0F172A] text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                          <th className="py-2.5 px-4">NAME</th>
                          <th className="py-2.5 px-4">SUBMITTED BY / ON</th>
                          <th className="py-2.5 px-4">CONTACT / LOCATION</th>
                          <th className="py-2.5 px-4">PAY RATE / WORK AUTH</th>
                          <th className="py-2.5 px-4">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#CBD5E1] dark:divide-[#0F172A]">
                        {filteredSubmissions.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-xs text-[#64748B]">
                              <div className="space-y-2">
                                <p>No data available</p>
                                <button
                                  onClick={() => setIsSubmitCandidateModalOpen(true)}
                                  className="text-[#1E293B] dark:text-[#93C5FD] font-semibold hover:underline"
                                >
                                  + Submit a candidate to this requisition
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredSubmissions.map((sub) => {
                            const cand = findApplicantForSubmission(sub);
                            const currentStageIndex = getSubmissionStageIndex(sub.status);
                            return (
                              <React.Fragment key={sub.id}>
                                <tr className="hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]/60 transition-colors">
                                  {/* Name column */}
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={
                                          cand?.avatar ||
                                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'
                                        }
                                        alt={sub.applicantName}
                                        className="w-9 h-9 rounded-full object-cover ring-1 ring-[#CBD5E1] shrink-0"
                                      />
                                      <div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <button
                                            onClick={() => {
                                              if (cand) navigate('applicant-detail', cand.id);
                                            }}
                                            className="font-bold text-[#1E293B] dark:text-[#93C5FD] hover:underline text-xs"
                                          >
                                            {sub.applicantName}
                                          </button>
                                          <span className="font-mono text-[10px] text-[#64748B] px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800">
                                            {cand?.applicantId || sub.submissionId}
                                          </span>
                                        </div>
                                        <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
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
                                              if (cand) {
                                                const fileName = downloadApplicantResume(cand);
                                                showToast(`Downloaded ${fileName}`);
                                              }
                                            }}
                                            className="text-[10px] text-[#1E293B] hover:underline font-semibold flex items-center gap-0.5"
                                            aria-label={`Download ${sub.applicantName} resume`}
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
                                    <div className="flex items-center gap-1 text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 truncate max-w-[200px]">
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
                                    <div className="flex flex-col items-start gap-1.5">
                                      <button
                                        onClick={() => handleOpenStatusModal(sub)}
                                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#2563EB]/40 text-[#1E293B] dark:text-[#93C5FD] hover:bg-[#2563EB] hover:text-white transition-colors cursor-pointer text-left block"
                                        title="Click to change application status"
                                      >
                                        <span>{sub.status}</span>
                                        <span className="block text-[9px] text-[#64748B] dark:text-[#94A3B8] font-normal mt-0.5">
                                          Click to update ▾
                                        </span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => navigate('client-submission', sub.id)}
                                        className="px-2.5 py-1 rounded-md border border-emerald-600 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                                      >
                                        Submit to Client
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                                <tr>
                                  <td colSpan={5} className="px-6 pb-3 pt-1">
                                    <div className="relative min-w-[680px]">
                                      <div className="absolute left-[7.14%] right-[7.14%] top-2.5 h-0.5 bg-[#CBD5E1] dark:bg-[#334155]">
                                        <div
                                          className="h-full bg-emerald-500 transition-all"
                                          style={{ width: `${(currentStageIndex / (SUBMISSION_STAGES.length - 1)) * 100}%` }}
                                        />
                                      </div>
                                      <div className="relative grid grid-cols-7">
                                        {SUBMISSION_STAGES.map((stage, index) => (
                                          <div key={stage} className="flex flex-col items-center text-center">
                                            <span
                                              className={`z-10 flex items-center justify-center rounded-full ${
                                                index === currentStageIndex
                                                  ? 'h-5 w-5 bg-emerald-500 text-white'
                                                  : index < currentStageIndex
                                                    ? 'h-2.5 w-2.5 mt-[5px] bg-emerald-500'
                                                    : 'h-2.5 w-2.5 mt-[5px] bg-[#B8B8B8] dark:bg-[#475569]'
                                              }`}
                                              aria-label={`${stage}${index <= currentStageIndex ? ', completed' : ', upcoming'}`}
                                            >
                                              {index === currentStageIndex && <Check className="h-3 w-3" />}
                                            </span>
                                            <span className={`mt-1 text-[10px] ${index <= currentStageIndex ? 'text-[#1E293B] dark:text-white font-medium' : 'text-[#64748B] dark:text-[#94A3B8]'}`}>
                                              {stage}
                                            </span>
                                            {index === currentStageIndex && (
                                              <span className="mt-0.5 text-[9px] text-[#64748B] dark:text-[#94A3B8]">
                                                {sub.submittedDate}
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              </React.Fragment>
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
                <div className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#0F172A] rounded-xl shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-[#CBD5E1] dark:border-[#0F172A] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-sm font-bold text-[#1E293B] dark:text-white">Notes</h2>
                      <div className="flex items-center gap-1 text-xs">
                        <button
                          onClick={() => {
                            setNotesTab('job_posting');
                            setNewNoteCategory('Job Posting');
                            setAppliedNotesFilter(null);
                            setNotesFilterField('Select');
                            setNotesFilterSearch('');
                            setNotesFilterSelections([]);
                          }}
                          className={`px-2.5 py-1 rounded-md font-semibold text-[11px] ${
                            notesTab === 'job_posting'
                              ? 'bg-[#2563EB] text-white'
                              : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B]'
                          }`}
                        >
                          Job Posting ({job.notes?.filter((n) => n.category === 'Job Posting').length || 0})
                        </button>
                        <button
                          onClick={() => {
                            setNotesTab('applicant_reference');
                            setNewNoteCategory('Applicant Reference');
                            setAppliedNotesFilter(null);
                            setNotesFilterField('Select');
                            setNotesFilterSearch('');
                            setNotesFilterSelections([]);
                          }}
                          className={`px-2.5 py-1 rounded-md font-semibold text-[11px] ${
                            notesTab === 'applicant_reference'
                              ? 'bg-[#2563EB] text-white'
                              : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B]'
                          }`}
                        >
                          Applicant Reference ({job.notes?.filter((n) => n.category === 'Applicant Reference').length || 0})
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsNotesFilterOpen((open) => !open)}
                        aria-label="Filter notes"
                        aria-expanded={isNotesFilterOpen}
                        className={`rounded-md p-1.5 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B] dark:text-[#DBEAFE] dark:hover:bg-[#1E293B] ${
                          isNotesFilterOpen ? 'bg-[#F1F5F9] dark:bg-[#1E293B]' : ''
                        }`}
                      >
                        <Filter className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setNewNoteText('');
                          setNewNoteAction('');
                          setNewNotePriority('Medium');
                          setNewNoteApplicantRef('');
                          setNewNoteCategory(notesTab === 'applicant_reference' ? 'Applicant Reference' : 'Job Posting');
                          setNoteUserSearch('');
                          setSelectedNoteUsers(['Ganesh Godse']);
                          setIsNoteActionMenuOpen(false);
                          setIsNoteUserMenuOpen(false);
                          setNoteEditorResetKey((key) => key + 1);
                          setIsAddNoteModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-md text-xs font-semibold flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {isNotesFilterOpen && (
                    <div className="border-b border-[#CBD5E1] bg-[#F1F5F9]/40 px-4 py-3 dark:border-[#0F172A] dark:bg-[#1E293B]">
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={notesFilterField}
                          onChange={(event) => {
                            setNotesFilterField(event.target.value);
                            setNotesFilterSearch('');
                            setNotesFilterSelections([]);
                          }}
                          className="h-8 w-[190px] rounded border border-[#93C5FD] bg-white px-2 text-xs text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#64748B] dark:bg-[#1E293B] dark:text-white"
                        >
                          <option value="Select">Select</option>
                          {notesTab === 'applicant_reference' ? (
                            <>
                              <option value="action">Actions/Priority</option>
                              <option value="applicant">Applicant Ref</option>
                              <option value="notified">Notified To</option>
                              <option value="added">Added By</option>
                            </>
                          ) : (
                            <>
                              <option value="added">Added By</option>
                              <option value="note">Notes / Description</option>
                            </>
                          )}
                        </select>

                        <div className="relative w-[220px]">
                          <input
                            type="text"
                            value={notesFilterSearch}
                            onChange={(event) => setNotesFilterSearch(event.target.value)}
                            placeholder="Search"
                            className="h-8 w-full rounded border border-[#93C5FD] bg-white px-2 pr-8 text-xs text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#64748B] dark:bg-[#1E293B] dark:text-white"
                          />
                          <Search className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B] dark:text-[#DBEAFE]" />
                        </div>

                        <button
                          type="button"
                          onClick={() => setAppliedNotesFilter({
                            field: notesFilterField,
                            values: notesFilterSelections
                          })}
                          className="h-8 rounded bg-[#2563EB] px-4 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
                        >
                          Apply
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNotesFilterField('Select');
                            setNotesFilterSearch('');
                            setNotesFilterSelections([]);
                            setAppliedNotesFilter(null);
                          }}
                          className="h-8 rounded border border-[#CBD5E1] bg-white px-4 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#DBEAFE]"
                        >
                          Reset
                        </button>
                      </div>

                      {notesFilterField !== 'Select' && (
                        <div className="mt-2 max-h-40 w-[425px] max-w-full overflow-y-auto rounded border border-[#CBD5E1] bg-white p-2 text-xs shadow-md dark:border-[#334155] dark:bg-[#1E293B]">
                          {Array.from(new Set((job.notes || [])
                            .filter((note) => (note.category || 'Job Posting') === (notesTab === 'job_posting' ? 'Job Posting' : 'Applicant Reference'))
                            .flatMap((note) => {
                              if (notesFilterField === 'action') return [note.action || '—', note.priority || '—'];
                              if (notesFilterField === 'applicant') return [note.applicantRef || '—'];
                              if (notesFilterField === 'notified') return note.notifiedTo || [];
                              if (notesFilterField === 'added') return [note.author];
                              if (notesFilterField === 'note') return [note.text.replace(/<[^>]*>/g, ' ').trim()];
                              return [];
                            })
                            .filter((value) => value.toLowerCase().includes(notesFilterSearch.toLowerCase()))
                          )).map((value) => (
                            <label key={value} className="flex cursor-pointer items-center gap-2 px-1 py-1.5 text-[#1E293B] hover:bg-[#F1F5F9] dark:text-white dark:hover:bg-[#475569]">
                              <input
                                type="checkbox"
                                checked={notesFilterSelections.includes(value)}
                                onChange={() => setNotesFilterSelections((current) =>
                                  current.includes(value)
                                    ? current.filter((item) => item !== value)
                                    : [...current, value]
                                )}
                                className="h-3.5 w-3.5 accent-[#2563EB]"
                              />
                              <span>{value}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes Table */}
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F1F5F9]/60 dark:bg-[#1E293B] border-b border-[#CBD5E1] dark:border-[#0F172A] text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase">
                        {notesTab === 'applicant_reference' ? (
                          <>
                            <th className="py-2.5 px-4 w-32">ADDED BY / ON</th>
                            <th className="py-2.5 px-4">NOTE</th>
                            <th className="py-2.5 px-4 w-36">ACTION / PRIORITY</th>
                            <th className="py-2.5 px-4 w-36">APPLICANT REF</th>
                            <th className="py-2.5 px-4 w-36">NOTIFIED TO</th>
                          </>
                        ) : (
                          <>
                            <th className="py-2.5 px-4 w-48">ADDED BY / ON</th>
                            <th className="py-2.5 px-4">NOTES / DESCRIPTION</th>
                            <th className="py-2.5 px-4 w-24 text-right">ACTION</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#CBD5E1] dark:divide-[#0F172A]">
                      {filteredJobNotes.length === 0 ? (
                        <tr>
                          <td colSpan={notesTab === 'applicant_reference' ? 5 : 3} className="py-6 text-center text-xs text-[#64748B]">
                            No data available
                          </td>
                        </tr>
                      ) : (
                        filteredJobNotes.map((note) => (
                            <tr key={note.id} className="hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]/60">
                              <td className="py-2.5 px-4">
                                <div className="font-semibold text-[#1E293B] dark:text-white">{note.author}</div>
                                <div className="text-[10px] text-[#64748B]">{note.date}</div>
                              </td>
                              <td className="py-2.5 px-4 text-[#64748B] dark:text-[#CBD5E1] whitespace-pre-wrap">
                                {note.text}
                              </td>
                              {notesTab === 'applicant_reference' ? (
                                <>
                                  <td className="py-2.5 px-4 text-[#64748B] dark:text-[#CBD5E1]">
                                    {note.action || '—'}{note.priority ? ` / ${note.priority}` : ''}
                                  </td>
                                  <td className="py-2.5 px-4 text-[#64748B] dark:text-[#CBD5E1]">
                                    {note.applicantRef || '—'}
                                  </td>
                                  <td className="py-2.5 px-4 text-[#64748B] dark:text-[#CBD5E1]">
                                    <div className="flex items-center justify-between gap-2">
                                      <span>{note.notifiedTo?.join(', ') || '—'}</span>
                                      <button
                                        onClick={() => handleDeleteNote(note.id)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                        title="Delete Note"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <td className="py-2.5 px-4 text-right">
                                  <button
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    title="Delete Note"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ========================================================= */}
                {/* DOCUMENTS SECTION */}
                {/* ========================================================= */}
                <div className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#0F172A] rounded-xl shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-[#CBD5E1] dark:border-[#0F172A] flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#1E293B] dark:text-white">Documents</h2>
                    {isUploadDocModalOpen ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleUploadDocument()}
                          disabled={selectedDocumentFiles.length === 0 || isUploadingDocuments}
                          className="rounded bg-[#3478F6] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2868DC] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUploadingDocuments ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUploadDocModalOpen(false);
                            setSelectedDocumentFiles([]);
                            setDocumentSourceMessage('');
                          }}
                          className="rounded bg-[#3478F6] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2868DC]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDocumentFiles([]);
                          setDocumentSourceMessage('');
                          setIsUploadDocModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-md text-xs font-semibold flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>

                  {isUploadDocModalOpen ? (
                    <div className="space-y-3 p-4">
                      <input
                        ref={jobDocumentInputRef}
                        type="file"
                        multiple
                        className="sr-only"
                        aria-label="Select job documents from local drive"
                        onChange={(event) => {
                          setSelectedDocumentFiles(Array.from(event.currentTarget.files || []));
                          setDocumentSourceMessage('');
                          event.currentTarget.value = '';
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <div className="group relative">
                          <button
                            type="button"
                            onClick={() => jobDocumentInputRef.current?.click()}
                            className="flex h-10 w-10 items-center justify-center rounded border border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB]"
                            aria-label="Local Drive"
                            title="Local Drive"
                          >
                            <Monitor className="h-5 w-5 text-[#3478F6]" />
                          </button>
                          <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 rounded bg-[#1E293B] px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100">Local Drive</span>
                        </div>
                        <div className="group relative">
                          <button
                            type="button"
                            onClick={() => setDocumentSourceMessage('Dropbox is not connected. Choose Local Drive to attach files from this device.')}
                            className="flex h-10 w-10 items-center justify-center rounded border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB]"
                            aria-label="Dropbox"
                            title="Dropbox"
                          >
                            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#0061FE]" aria-hidden="true">
                              <path d="M6.033 2.5 0 6.666l6.033 4.167 6.034-4.167L6.033 2.5zm11.934 0-6.034 4.166 6.034 4.167L24 6.666 17.967 2.5zM0 15l6.033 4.167 6.034-4.167-6.034-4.167L0 15zm17.967-4.167-6.034 4.167 6.034 4.167L24 15l-6.033-4.167zM6.033 20.25 12 16.146l5.967 4.104L12 24.354l-5.967-4.104z" />
                            </svg>
                          </button>
                          <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 rounded bg-[#1E293B] px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100">Dropbox</span>
                        </div>
                        <div className="group relative">
                          <button
                            type="button"
                            onClick={() => setDocumentSourceMessage('Box is not connected. Choose Local Drive to attach files from this device.')}
                            className="flex h-10 w-10 items-center justify-center rounded border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB]"
                            aria-label="Box"
                            title="Box"
                          >
                            <Box className="h-5 w-5 text-[#0061D5]" />
                          </button>
                          <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 rounded bg-[#1E293B] px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100">Box</span>
                        </div>
                      </div>
                      {selectedDocumentFiles.length > 0 && (
                        <ul className="space-y-1 text-[11px] text-[#344054]">
                          {selectedDocumentFiles.map((file) => (
                            <li key={`${file.name}-${file.lastModified}`}>{file.name} · {(file.size / 1024).toFixed(1)} KB</li>
                          ))}
                        </ul>
                      )}
                      {documentSourceMessage && <p className="text-[11px] text-[#667085]" role="status">{documentSourceMessage}</p>}
                    </div>
                  ) : (!job.documents || job.documents.length === 0) ? (
                    <div className="py-8 text-center text-xs text-[#64748B]">
                      No data available
                    </div>
                  ) : (
                    <div className="divide-y divide-[#CBD5E1] dark:divide-[#0F172A]">
                      {job.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3.5 px-4 flex items-center justify-between hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]/60 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#1E293B] dark:text-[#93C5FD]">
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
                              className="px-2.5 py-1 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-[#93C5FD] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] rounded-md text-xs font-semibold flex items-center gap-1"
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
              <div className="space-y-4 rounded-sm border border-[#D5DCE5] bg-white p-3 text-[#344054] shadow-xs dark:border-[#334155] dark:bg-[#1E293B] dark:text-white">
                {renderJobDetailSection('Job Details', [
                  { label: 'Job Start Date', value: job.startDate || '10/11/2026' },
                  { label: 'Job End Date', value: job.endDate || '31/12/2026' },
                  { label: 'Remote Job', value: job.remoteJob || 'No' },
                  {
                    label: 'Turnaround Time',
                    value: job.turnaroundTime ? `${job.turnaroundTime} ${job.turnaroundUnit || 'In Days'}` : 'N/A'
                  },
                  { label: 'Duration', value: job.duration || '1 month 22 day(s)' },
                  { label: 'Application Form', value: getCustomJobDetail('applicationForm', 'General Application') },
                  { label: 'Respond By', value: job.respondBy || 'Open Until Filled' },
                  { label: 'Client', value: job.client },
                  { label: 'Client Manager', value: job.clientManager || 'N/A' },
                  { label: 'CEIPAL Ref #', value: '2026-12219' },
                  { label: 'Address', value: job.address || 'N/A' },
                  { label: 'Post Job on Career Portal', value: job.careerPortalPublishedDate || 'N/A' },
                  { label: 'Job Type', value: job.type },
                  { label: 'Post Job on Career Portal', value: careerPortalToggle },
                  { label: 'Notice Period', value: job.noticePeriod || '1 Month' },
                  { label: 'Facility', value: job.facility || 'N/A' },
                  {
                    label: 'PW Published Status',
                    value: job.publishedOnJobBoard == null || job.publishedOnJobBoard === ''
                      ? 'N/A'
                      : String(job.publishedOnJobBoard)
                  }
                ])}

                <div className="border-t border-[#EAECF0] dark:border-[#334155]" />

                {renderJobDetailSection('Skills', [
                  { label: 'Industry', value: job.industry || 'N/A' },
                  {
                    label: 'Experience',
                    value: job.minExperience != null
                      ? `${job.minExperience}-${job.maxExperience ?? job.minExperience} Years`
                      : job.experienceRequired || 'N/A'
                  },
                  { label: 'Degree', value: job.degree || 'N/A' },
                  {
                    label: 'Primary Skills',
                    value: (job.primarySkills?.length ? job.primarySkills : job.skills).join(', ') || 'N/A'
                  },
                  { label: 'Secondary Skills', value: job.secondarySkills?.join(', ') || 'N/A' }
                ])}

                <div className="border-t border-[#EAECF0] dark:border-[#334155]" />

                {renderJobDetailSection('Organizational Information', [
                  { label: 'Number of Positions', value: job.openings || 1 },
                  { label: 'Sales Manager', value: job.salesManager || 'N/A' },
                  { label: 'Comments', value: job.comments || 'N/A' },
                  { label: 'Additional Locations', value: getCustomJobDetail('additionalLocations') },
                  { label: 'Maximum Allowed Submissions', value: job.maxSubmissions ?? 'N/A' },
                  { label: 'Assigned To', value: job.assignedTo || job.assignedRecruiter || 'N/A' },
                  { label: 'Primary Recruiter', value: getCustomJobDetail('primaryRecruiter') },
                  { label: 'Account Manager', value: job.accountManager || 'N/A' },
                  { label: 'Secondary Sales Manager', value: job.secondarySalesManager || 'N/A' },
                  { label: 'Secondary Recruitment Manager', value: job.secondaryRecruitmentManager || 'N/A' }
                ])}
              </div>
            )}

            {/* Sub-Tab 3: Additional Details */}
            {activeTab === 'additional_details' && (
              <div className="rounded-md border border-[#EAECF0] bg-white px-3 py-2 text-[10px] text-[#667085] shadow-xs dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#94A3B8]">
                No data available
              </div>
            )}

            {activeTab === 'email_activity' && (
              <section className="rounded-md border border-[#EAECF0] bg-white p-4 shadow-xs dark:border-[#334155] dark:bg-[#1E293B]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[#1E293B] dark:text-white">Email Activity</h3>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-pressed={emailActivityView === 'activities'}
                      onClick={() => setEmailActivityView('activities')}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                        emailActivityView === 'activities'
                          ? 'bg-[#3478F6] text-white'
                          : 'bg-[#EAECF0] text-[#667085] dark:bg-[#1E293B] dark:text-[#94A3B8]'
                      }`}
                    >
                      Activities
                    </button>
                    <button
                      type="button"
                      aria-pressed={emailActivityView === 'email_activity'}
                      onClick={() => setEmailActivityView('email_activity')}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                        emailActivityView === 'email_activity'
                          ? 'bg-[#3478F6] text-white'
                          : 'bg-[#EAECF0] text-[#667085] dark:bg-[#1E293B] dark:text-[#94A3B8]'
                      }`}
                    >
                      Email Activity
                    </button>
                  </div>
                </div>
                {emailActivityView === 'email_activity' && (
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px]">
                    <label htmlFor="email-activity-type" className="font-medium text-[#344054] dark:text-white">
                      Email Type:
                    </label>
                    <select
                      id="email-activity-type"
                      aria-label="Email Type"
                      value={emailActivityType}
                      onChange={(event) => setEmailActivityType(event.target.value)}
                      className="h-7 w-[185px] border border-[#D0D5DD] bg-[#F9FAFB] px-2 text-[10px] text-[#344054] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
                    >
                      {['Select', 'Applicant References', 'Job Share', 'Send Job to Bench Consultant', 'Send Mail', 'Submit to Client'].map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <input
                      type="search"
                      aria-label="Search email activity"
                      placeholder="Search"
                      value={emailActivitySearch}
                      onChange={(event) => setEmailActivitySearch(event.target.value)}
                      className="h-7 w-[180px] border border-[#D0D5DD] bg-[#F9FAFB] px-2 text-[10px] text-[#344054] outline-none focus:border-[#3478F6] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
                    />
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="border-y border-[#D0D5DD] text-left text-[10px] uppercase text-[#344054] dark:border-[#0F172A] dark:text-[#E2E8F0]">
                        {(emailActivityView === 'activities'
                          ? ['Date & Time', 'Description']
                          : ['Date & Time', 'Email Type', 'Sent By', 'Sent To', 'Email Details']
                        ).map((column) => (
                          <th key={column} className="whitespace-nowrap px-2 py-2 font-medium">{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          colSpan={emailActivityView === 'activities' ? 2 : 5}
                          className="py-2 text-center italic text-[#667085] dark:text-[#94A3B8]"
                        >
                          No data available
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === 'surveys' && (
              <section className="rounded-md border border-[#D0D5DD] bg-white p-4 shadow-xs dark:border-[#334155] dark:bg-[#1E293B]">
                <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#D0D5DD] pb-3 dark:border-[#0F172A]">
                  <h3 className="text-sm font-semibold text-[#344054] dark:text-white">Surveys</h3>
                  <button
                    type="button"
                    onClick={() => setIsSendSurveyModalOpen(true)}
                    className="inline-flex h-7 items-center gap-1 rounded bg-[#3478F6] px-2 text-[10px] font-semibold text-white hover:bg-[#2865D8]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Send Survey
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-[#D0D5DD] text-left text-[10px] uppercase text-[#344054] dark:border-[#0F172A] dark:text-[#E2E8F0]">
                        {['Survey Title', 'Initiated By', 'Initiated On', 'Initiated To', 'Score', 'Actions'].map((column) => (
                          <th key={column} className="whitespace-nowrap px-1 py-2 font-medium">{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={6} className="py-2 text-center text-xs italic text-[#667085] dark:text-[#94A3B8]">
                          No data available
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Sub-Tab 4: Task Manager */}
            {activeTab === 'task_manager' && (
              <div className="overflow-hidden rounded-xl border border-[#CBD5E1] bg-white shadow-xs dark:border-[#0F172A] dark:bg-[#1E293B]">
                <div className="flex items-center justify-between border-b border-[#CBD5E1] px-5 py-4 dark:border-[#0F172A]">
                  <h3 className="text-sm font-bold text-[#1E293B] dark:text-white">Task Manager</h3>
                  <button
                    type="button"
                    onClick={openJobTaskForm}
                    className="flex items-center gap-1 rounded bg-[#3478F6] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#2868DC]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1050px] border-collapse text-left text-[10px]">
                    <thead>
                      <tr className="border-b border-[#D5DCE5] text-[10px] uppercase text-[#344054] dark:text-white">
                        {['Task Name', 'Due Date', 'Time Zone', 'Assigned To', 'Assigned By', 'Created On', 'Modified', 'Status Modified On', 'Status'].map((column) => (
                          <th key={column} className="whitespace-nowrap px-2.5 py-2 font-semibold">{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tasksForCurrentJob.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-5 text-center italic text-[#98A2B3]">No data available</td>
                        </tr>
                      ) : tasksForCurrentJob.map((task) => (
                        <tr key={task.id} className="border-b border-[#EAECF0] text-[#344054] dark:border-[#0F172A] dark:text-white">
                          <td className="px-2.5 py-2.5 font-medium">{task.title}</td>
                          <td className="whitespace-nowrap px-2.5 py-2.5">
                            {task.dueDate ? new Date(`${task.dueDate}T00:00:00`).toLocaleDateString() : '—'}
                          </td>
                          <td className="whitespace-nowrap px-2.5 py-2.5">{task.timeZone || 'UTC+05:30'}</td>
                          <td className="whitespace-nowrap px-2.5 py-2.5">{task.assignedTo}</td>
                          <td className="whitespace-nowrap px-2.5 py-2.5">{task.assignedBy || '—'}</td>
                          <td className="whitespace-nowrap px-2.5 py-2.5">{task.createdOn || '—'}</td>
                          <td className="whitespace-nowrap px-2.5 py-2.5">{task.modifiedOn || '—'}</td>
                          <td className="whitespace-nowrap px-2.5 py-2.5">{task.statusModifiedOn || '—'}</td>
                          <td className="whitespace-nowrap px-2.5 py-2.5">{task.status === 'Pending' ? 'Not Started' : task.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="border-t border-[#EAECF0] px-4 py-2 dark:border-[#0F172A]">
                  <div className="h-1.5 rounded-full bg-[#98A2B3]" />
                </div>
              </div>
            )}

            {/* Sub-Tab 5: Activities */}
            {activeTab === 'activities' && (
              <section className="rounded-xl border border-[#D0D5DD] bg-white p-4 shadow-xs dark:border-[#0F172A] dark:bg-[#1E293B]">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-[#344054] dark:text-white">Activities</h3>
                  <select
                    value={activityRange}
                    onChange={(event) => setActivityRange(event.target.value as typeof activityRange)}
                    aria-label="Activity time range"
                    className="h-8 min-w-48 border border-[#D0D5DD] bg-white px-2 text-xs text-[#344054] dark:border-[#0F172A] dark:bg-[#1E293B] dark:text-white"
                  >
                    <option value="all">Select</option>
                    <option value="last_6_months">Last 6 Months</option>
                    <option value="older_than_6_months">Older than 6 Months</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="border-y border-[#D0D5DD] text-left text-[10px] uppercase text-[#344054] dark:border-[#0F172A] dark:text-[#E2E8F0]">
                        <th className="w-1/4 whitespace-nowrap px-2 py-2 font-medium">Date &amp; Time</th>
                        <th className="px-2 py-2 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleJobActivityRows.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="py-5 text-center italic text-[#667085] dark:text-[#94A3B8]">No data available</td>
                        </tr>
                      ) : visibleJobActivityRows.map((activity) => {
                        const isExpanded = expandedActivityIds.includes(activity.id);
                        return (
                          <tr key={activity.id} className="border-b border-[#EAECF0] text-[#667085] dark:border-[#0F172A] dark:text-[#94A3B8]">
                            <td className="whitespace-nowrap px-2 py-2.5">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {activity.displayTime}
                              </span>
                            </td>
                            <td className="px-2 py-2">
                              {activity.actor && <div>Modified By {activity.actor}</div>}
                              <div>
                                {isExpanded ? activity.description : ('preview' in activity ? activity.preview : activity.description)}
                                {'preview' in activity && (
                                  <button
                                    type="button"
                                    onClick={() => setExpandedActivityIds((current) => (
                                      isExpanded
                                        ? current.filter((id) => id !== activity.id)
                                        : [...current, activity.id]
                                    ))}
                                    className="ml-1 text-[#3478F6] hover:underline"
                                  >
                                    {isExpanded ? 'Show Less' : 'Show More'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Sub-Tab 6: Email Merges */}
            {activeTab === 'email_merges' && (
              <section className="rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-xs dark:border-[#0F172A] dark:bg-[#1E293B]">
                  <h3 className="text-sm font-bold text-[#1E293B] dark:text-white">Email Merges</h3>
                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full border-collapse text-xs">
                      <thead>
                        <tr className="border-y border-[#D0D5DD] text-left text-[10px] uppercase text-[#344054] dark:border-[#0F172A] dark:text-[#E2E8F0]">
                          <th className="whitespace-nowrap px-2 py-2 font-medium">Sent By/On</th>
                          <th className="whitespace-nowrap px-2 py-2 font-medium">Sent To</th>
                          <th className="whitespace-nowrap px-2 py-2 font-medium">Search String</th>
                          <th className="whitespace-nowrap px-2 py-2 font-medium">ZIP Location</th>
                          <th className="whitespace-nowrap px-2 py-2 font-medium">Subject</th>
                          <th className="whitespace-nowrap px-2 py-2 font-medium">Email Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={6} className="py-4 text-center italic text-[#667085] dark:text-[#94A3B8]">
                            No data available
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
              </section>
            )}
          </div>

          {/* ========================================================= */}
          {/* RIGHT SIDEBAR (approx 30% width) - Ceipal Authentic */}
          {/* ========================================================= */}
          {activeTab !== 'task_manager' && activeTab !== 'email_merges' && activeTab !== 'activities' && activeTab !== 'email_activity' && activeTab !== 'surveys' && (
          <div className="w-full lg:w-[31%] space-y-4">
            {/* Search Criteria Box */}
            <div className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#0F172A] rounded-xl p-4 shadow-xs space-y-3 text-xs">
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
                  className="w-full p-2.5 bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg font-mono text-[11px] text-[#1E293B] dark:text-[#E2E8F0] leading-relaxed focus:outline-none focus:border-[#2563EB]"
                />

                <div className="flex justify-end mt-1 relative">
                  <button
                    onClick={() => setIsStringBuilderOpen(!isStringBuilderOpen)}
                    className="text-[#1E293B] dark:text-[#93C5FD] font-semibold text-[11px] flex items-center gap-1 hover:underline"
                  >
                    <span>String Builder</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {isStringBuilderOpen && (
                    <div className="absolute right-0 top-6 w-36 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-lg shadow-xl py-1 z-40 text-xs">
                      {['AND', 'OR', 'NOT', 'NEAR/5', '("...")'].map((op) => (
                        <button
                          key={op}
                          onClick={() => {
                            setBooleanQuery((prev) => `${prev} ${op} `);
                            setIsStringBuilderOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] font-mono text-[11px]"
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
                  className="w-full px-2.5 py-1.5 bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs"
                />
                <label className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] cursor-pointer mt-1">
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
              <div className="space-y-2 pt-2 border-t border-[#CBD5E1] dark:border-[#0F172A]">
                <label className="text-[10px] uppercase font-bold text-[#64748B] block">LOCATION DETAILS</label>

                <div>
                  <span className="text-[10px] text-[#64748B] block">Country</span>
                  <select
                    value={searchCountry}
                    onChange={(e) => setSearchCountry(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs"
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
                    className="w-full px-2.5 py-1.5 bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs"
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
                    className="w-full px-2.5 py-1.5 bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs"
                  />
                </div>

                <label className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] cursor-pointer mt-1">
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
              <div className="space-y-2 pt-2 border-t border-[#CBD5E1] dark:border-[#0F172A]">
                <label className="text-[10px] uppercase font-bold text-[#64748B] block">FILTERS</label>

                <div>
                  <span className="text-[10px] text-[#64748B] block">Total Experience (Years)</span>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={minExp}
                      onChange={(e) => setMinExp(Number(e.target.value))}
                      className="w-14 px-2 py-1 bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-md text-xs text-center font-mono"
                    />
                    <span className="text-xs text-[#64748B]">to</span>
                    <input
                      type="number"
                      value={maxExp}
                      onChange={(e) => setMaxExp(Number(e.target.value))}
                      className="w-14 px-2 py-1 bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-md text-xs text-center font-mono"
                    />
                    <span className="text-xs text-[#64748B]">years</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#64748B] block">Educational Details</span>
                  <select
                    value={educationDetails}
                    onChange={(e) => setEducationDetails(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs"
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
                    className="w-full px-2.5 py-1.5 bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs"
                  />
                  <label className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] cursor-pointer mt-1">
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
                    className="w-full py-2 bg-white dark:bg-[#1E293B] border border-[#2563EB] text-[#1E293B] dark:text-[#93C5FD] font-bold rounded-lg text-xs hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
                  >
                    Save and Search
                  </button>
                  <button
                    onClick={() => {
                      setIsJobBoardsMenuOpen(true);
                    }}
                    className="w-full py-2 bg-white dark:bg-[#1E293B] border border-[#2563EB] text-[#1E293B] dark:text-[#93C5FD] font-bold rounded-lg text-xs hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
                  >
                    Search Job Boards
                  </button>
                </div>
              </div>
            </div>

            {/* Job Details Card */}
            <div className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#0F172A] rounded-xl p-4 shadow-xs space-y-3 text-xs">
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
            <div className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#0F172A] rounded-xl p-4 shadow-xs space-y-3 text-xs">
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
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: Ceipal Skill Matrix Modal (Screenshot 2026-11-10 153259.png) */}
      {/* ========================================================= */}
      {isAddSkillMatrixOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 p-3"
          onClick={() => setIsAddSkillMatrixOpen(false)}
        >
          <style>{`
            .skill-matrix-editor > div {
              border-color: #d7dce2 !important;
              background: #fff !important;
            }
            .skill-matrix-editor > div > div {
              border-color: #d7dce2 !important;
              background: #f8f9fa !important;
              padding-top: 2px !important;
              padding-bottom: 2px !important;
            }
            .skill-matrix-editor button {
              color: #68717b !important;
              padding: 2px !important;
            }
            .skill-matrix-editor button:hover {
              background: #e9edf2 !important;
            }
            .skill-matrix-editor select {
              height: 24px !important;
              border-color: #d7dce2 !important;
              background: #fff !important;
              color: #555 !important;
              padding-top: 2px !important;
              padding-bottom: 2px !important;
            }
            .skill-matrix-editor [contenteditable="true"] {
              height: 200px;
              min-height: 200px !important;
              border-top: 1px solid #d7dce2 !important;
              background: #fff !important;
              color: #1E293B !important;
            }
          `}</style>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-skill-matrix-title"
            className="flex max-h-[calc(100vh-24px)] w-full max-w-[710px] flex-col border border-[#D1D5DB] bg-white shadow-2xl"
            style={{ backgroundColor: '#fff' }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex h-[60px] shrink-0 items-center justify-between bg-[#F7F7F7] px-4">
              <h2 id="add-skill-matrix-title" className="text-[18px] font-medium text-[#383838]">
                Add Skill Matrix
              </h2>
              <button
                type="button"
                aria-label="Close skill matrix"
                onClick={() => setIsAddSkillMatrixOpen(false)}
                className="rounded p-1 text-[#777] hover:bg-[#E9EDF2] hover:text-[#333]"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto bg-white px-[15px] pb-4 pt-6" style={{ backgroundColor: '#fff' }}>
              <div className="skill-matrix-editor">
                <EmailRichTextEditor
                  value={skillMatrixContent}
                  resetKey={skillMatrixEditorResetKey}
                  accentColor="#D7DCE2"
                  onChange={setSkillMatrixContent}
                  onError={showToast}
                />
              </div>
            </div>
            <footer
              className="flex shrink-0 justify-end gap-2 border-t border-[#E5E7EB] bg-white px-[15px] py-[14px]"
              style={{ backgroundColor: '#fff' }}
            >
              <button
                type="button"
                onClick={handleSaveSkillMatrix}
                disabled={isSavingSkillMatrix}
                className="h-8 min-w-20 rounded bg-[#4C83F5] px-4 text-sm font-medium text-white hover:bg-[#3972E8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingSkillMatrix ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setIsAddSkillMatrixOpen(false)}
                disabled={isSavingSkillMatrix}
                className="h-8 min-w-[84px] rounded border border-[#C9CDD2] bg-white px-4 text-sm text-[#4B4B4B] hover:bg-[#F7F7F7] disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: '#fff' }}
              >
                Cancel
              </button>
            </footer>
          </section>
        </div>
      )}

      {skillMatrixApplicant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#CBD5E1] dark:border-[#334155] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display font-bold text-[#1E293B] dark:text-white">
                  Skill Matrix
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
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
                <div className="flex justify-between font-sans font-bold text-[#64748B] dark:text-[#94A3B8] pb-1 border-b border-[#CBD5E1] dark:border-[#334155]">
                  <span>Skill</span>
                  <span>Experience</span>
                </div>
                <div className="hidden md:flex justify-between font-sans font-bold text-[#64748B] dark:text-[#94A3B8] pb-1 border-b border-[#CBD5E1] dark:border-[#334155]">
                  <span>Skill</span>
                  <span>Experience</span>
                </div>

                {/* Skill Matrix Rows */}
                {getCandidateSkillMatrix(skillMatrixApplicant).map((item, index) => (
                  <div key={index} className="flex items-baseline justify-between gap-2 py-1">
                    <span className="bg-[#F1F5F9] dark:bg-[#1E293B] px-1.5 py-0.5 rounded text-[#1E293B] dark:text-white shrink-0">
                      {item.skill}
                    </span>
                    <span className="flex-1 border-b border-dotted border-gray-400 dark:border-gray-600 mx-1"></span>
                    <span className="text-[#64748B] dark:text-[#CBD5E1] shrink-0 font-semibold">
                      {item.exp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#CBD5E1] dark:border-[#334155] bg-[#F1F5F9] dark:bg-[#0F172A] flex justify-end">
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

      {isTaskTimeZoneModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="select-task-time-zone-title"
            className="w-[min(520px,calc(100vw-32px))] bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#D5DCE5] px-6 py-4">
              <h2 id="select-task-time-zone-title" className="text-xl font-medium text-[#1E293B]">Select Time Zone</h2>
              <button
                type="button"
                onClick={() => {
                  setJobTaskField('timeZone', taskTimeZone);
                  setIsTaskTimeZoneModalOpen(false);
                }}
                aria-label="Close time zone dialog"
                className="text-[#64748B] hover:text-[#1E293B]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-[100px_1fr] items-center gap-x-4 gap-y-5 px-10 py-8">
              <label htmlFor="task-time-zone-country" className="text-sm text-[#64748B]">Country</label>
              <select
                id="task-time-zone-country"
                value={taskTimeZoneCountry}
                onChange={(event) => {
                  const country = event.target.value;
                  const countryZones = getTimezonesForCountry(country) || [];
                  const firstTimeZone = countryZones[0]
                    ? `(UTC${countryZones[0].utcOffsetStr}) ${countryZones[0].name.replaceAll('_', ' ')}`
                    : '';
                  setTaskTimeZoneCountry(country);
                  setTaskTimeZone(firstTimeZone);
                }}
                className="h-9 w-full border border-[#D5DCE5] bg-white px-3 text-sm text-[#1E293B] outline-none focus:border-[#3478F6]"
              >
                {COUNTRY_OPTIONS.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
              </select>

              <label htmlFor="task-time-zone" className="text-sm text-[#64748B]">Time Zone</label>
              <select
                id="task-time-zone"
                value={taskTimeZone}
                onChange={(event) => setTaskTimeZone(event.target.value)}
                className="h-9 w-full border border-[#D5DCE5] bg-white px-3 text-sm text-[#1E293B] outline-none focus:border-[#3478F6]"
              >
                {(getTimezonesForCountry(taskTimeZoneCountry) || []).map((timeZone) => {
                  const label = `(UTC${timeZone.utcOffsetStr}) ${timeZone.name.replaceAll('_', ' ')}`;
                  return <option key={timeZone.name} value={label}>{label}</option>;
                })}
              </select>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#F0F0F0] px-6 py-4">
              <button
                type="button"
                onClick={() => setIsTaskTimeZoneModalOpen(false)}
                className="rounded bg-[#3478F6] px-6 py-2 text-sm font-semibold text-white hover:bg-[#2868DC]"
              >
                Ok
              </button>
              <button
                type="button"
                onClick={() => setIsTaskTimeZoneModalOpen(false)}
                className="rounded border border-[#D0D5DD] px-5 py-2 text-sm text-[#344054] hover:bg-[#F9FAFB]"
              >
                Cancel
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
          <div className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-[#CBD5E1] dark:border-[#334155] flex items-center justify-between">
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
                <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] mb-1">
                  Candidate: <strong className="text-[#1E293B] dark:text-white">{statusModalSubmission.applicantName}</strong> (Sub #{statusModalSubmission.submissionId})
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] mb-1">
                  Application Status
                </label>
                <select
                  value={selectedStatusValue}
                  onChange={(e) => setSelectedStatusValue(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs font-semibold text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB]"
                >
                  {CEIPAL_STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] mb-1">
                  Comments
                </label>
                <textarea
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  rows={4}
                  placeholder="Enter comments or evaluation notes for this application status change..."
                  className="w-full p-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            {/* Modal Footer with Ceipal Buttons */}
            <div className="p-4 px-6 border-t border-[#CBD5E1] dark:border-[#334155] bg-[#F1F5F9] dark:bg-[#0F172A] flex justify-end gap-2">
              <button
                onClick={handleUpdateSubmissionStatus}
                className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Update
              </button>
              <button
                onClick={() => setStatusModalSubmission(null)}
                className="px-4 py-2 border border-[#CBD5E1] dark:border-[#334155] text-[#64748B] hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold rounded-lg"
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
          <div className="w-full max-w-2xl bg-white dark:bg-[#1E293B] border-l border-[#CBD5E1] dark:border-[#334155] shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 px-6 border-b border-[#CBD5E1] dark:border-[#334155] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] text-[#1E293B]">
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
            <div className="p-3 px-6 bg-[#F1F5F9] dark:bg-[#0F172A] border-b border-[#CBD5E1] dark:border-[#334155] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 text-[#64748B] dark:text-[#94A3B8]">
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
                  className="px-2.5 py-1 bg-white dark:bg-[#1E293B] border border-[#2563EB] text-[#1E293B] dark:text-[#93C5FD] rounded-md font-semibold text-[11px]"
                >
                  Skill Matrix
                </button>
                <button
                  onClick={() => {
                    const fileName = downloadApplicantResume(resumeApplicant);
                    showToast(`Downloaded ${fileName}`);
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
                <h3 className="font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#93C5FD] mb-1.5">
                  Professional Summary
                </h3>
                <p className="p-3 bg-[#F1F5F9] dark:bg-[#0F172A] rounded-xl text-[#64748B] dark:text-[#CBD5E1] leading-relaxed">
                  {resumeApplicant.summary || 'Full Stack Engineer with 5+ years experience in building high-scale Python, React and PostgreSQL enterprise applications.'}
                </p>
              </div>

              {/* Skills Badges */}
              <div>
                <h3 className="font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#93C5FD] mb-2">
                  Technical Competencies ({resumeApplicant.skills?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {resumeApplicant.skills?.map((sk) => (
                    <span
                      key={sk}
                      className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#2563EB]/30 font-mono text-[11px] font-semibold text-[#1E293B] dark:text-[#93C5FD]"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Work Experience */}
              <div>
                <h3 className="font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#93C5FD] mb-3">
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
                    <div key={idx} className="p-3.5 bg-[#F1F5F9] dark:bg-[#0F172A] rounded-xl space-y-1">
                      <div className="flex items-center justify-between font-bold text-[#1E293B] dark:text-white">
                        <span>{exp.role}</span>
                        <span className="text-[11px] text-[#64748B] font-normal">{exp.duration}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-[#1E293B]">{exp.company}</div>
                      <p className="text-[#64748B] dark:text-[#94A3B8] text-[11px] mt-1">{exp.summary}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h3 className="font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#93C5FD] mb-2">
                  Education &amp; Qualifications
                </h3>
                <div className="p-3 bg-[#F1F5F9] dark:bg-[#0F172A] rounded-xl">
                  <div className="font-bold text-[#1E293B] dark:text-white">
                    {resumeApplicant.education?.[0]?.degree || 'Bachelor of Engineering in Computer Science'}
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
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
          <div className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 px-6 border-b border-[#CBD5E1] dark:border-[#334155] flex items-center justify-between">
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
              <div className="w-full md:w-64 p-5 border-r border-[#CBD5E1] dark:border-[#334155] space-y-6 text-xs bg-[#F1F5F9] dark:bg-[#0F172A]">
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

                <div className="pt-4 border-t border-[#CBD5E1] dark:border-[#334155] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] block">Candidate Pool</span>
                  <div className="font-semibold text-[#1E293B] dark:text-white">
                    {applicants.length} Total Sourced Profiles
                  </div>
                </div>
              </div>

              {/* Right Candidates List */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3">
                <div className="flex items-center justify-between text-xs text-[#64748B] pb-2 border-b border-[#CBD5E1] dark:border-[#334155]">
                  <span>Showing top matching candidates from ATS repository</span>
                  <span className="font-bold text-[#1E293B]">Sorted by AI Compatibility Score</span>
                </div>

                <div className="divide-y divide-[#CBD5E1] dark:divide-[#334155]">
                  {applicants.slice(0, 8).map((cand) => {
                    const score = Math.min(99, Math.max(70, cand.matchScore || 73));
                    return (
                      <div
                        key={cand.id}
                        className="py-3 flex items-center justify-between gap-4 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] px-3 rounded-xl transition-colors"
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
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-[#CBD5E1]"
                          />

                          <div>
                            <div className="font-bold text-xs text-[#1E293B] dark:text-white">
                              {cand.name}
                            </div>
                            <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
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
                            className="px-2.5 py-1.5 border border-[#CBD5E1] dark:border-[#334155] text-[#64748B] hover:bg-[#F1F5F9] rounded-lg text-xs font-semibold"
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
            <div className="p-4 px-6 border-t border-[#CBD5E1] dark:border-[#334155] bg-[#F1F5F9] dark:bg-[#0F172A] flex justify-end">
              <button
                onClick={() => setIsAiMatchingOpen(false)}
                className="px-5 py-2 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-[#64748B] dark:text-white text-xs font-bold rounded-xl"
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
          <div className="bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3 border-[#CBD5E1] dark:border-[#334155]">
              <h2 className="text-sm font-bold text-[#1E293B] dark:text-white">
                Add Public Job Details (Career Portal Spec)
              </h2>
              <button onClick={() => setIsPublicDetailsModalOpen(false)}>
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <p className="text-[#64748B] dark:text-[#94A3B8]">
              Configure sanitized job overview for external candidate career site view.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Public Header Headline
              </label>
              <input
                type="text"
                defaultValue={`${job.title} - Career Opportunity`}
                className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Candidate Summary Pitch
              </label>
              <textarea
                rows={4}
                defaultValue={`We are hiring a passionate ${job.title} to join our engineering organization. Key stack includes ${(job.primarySkills || job.skills).slice(0, 3).join(', ')}.`}
                className="w-full p-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#CBD5E1] dark:border-[#334155]">
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsAddNoteModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-notes-title"
            className="w-[min(92vw,1180px)] overflow-hidden rounded-none bg-white shadow-2xl dark:bg-[#1E293B]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#DADADA] px-5 py-4 dark:border-[#334155]">
              <h2 id="add-notes-title" className="text-xl font-medium text-[#1E293B] dark:text-white">
                Add Notes
              </h2>
              <button
                type="button"
                onClick={() => setIsAddNoteModalOpen(false)}
                aria-label="Close"
                className="rounded-full p-1 text-[#9B9B9B] hover:bg-[#F1F5F9] hover:text-[#1E293B] dark:hover:bg-[#1E293B] dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNoteActionMenuOpen((open) => !open);
                      setIsNoteUserMenuOpen(false);
                    }}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-[#4387F5] bg-white px-3 text-sm text-[#1E293B] outline-none dark:border-[#4387F5] dark:bg-[#1E293B] dark:text-white"
                  >
                    <span>{newNoteAction || 'Select'}</span>
                    <ChevronDown className="h-4 w-4 text-[#64748B]" />
                  </button>
                  {isNoteActionMenuOpen && (
                    <div className="absolute left-0 top-[calc(100%-1px)] z-30 w-full border border-[#4387F5] bg-white py-1 text-xs shadow-lg dark:bg-[#1E293B]">
                      {[
                        'Select',
                        'Added Through Nautkr',
                        'Note from FG',
                        'Note from Labor',
                        'Note from IQN'
                      ].map((action) => (
                        <button
                          key={action}
                          type="button"
                          onClick={() => {
                            setNewNoteAction(action === 'Select' ? '' : action);
                            setIsNoteActionMenuOpen(false);
                          }}
                          className="block w-full px-3 py-2 text-left text-sm text-[#1E293B] hover:bg-[#E9F1FF] dark:text-white dark:hover:bg-[#475569]"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNoteUserMenuOpen((open) => !open);
                      setIsNoteActionMenuOpen(false);
                    }}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-[#CFCFCF] bg-white px-3 text-sm text-[#1E293B] outline-none dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
                  >
                    <span>
                      {selectedNoteUsers.length > 1
                        ? `${selectedNoteUsers[0]} +${selectedNoteUsers.length - 1}`
                        : `${selectedNoteUsers[0] || 'Ganesh Godse'} (User)`}
                    </span>
                    <ChevronDown className="h-4 w-4 text-[#64748B]" />
                  </button>
                  {isNoteUserMenuOpen && (
                    <div className="absolute right-0 top-[calc(100%-1px)] z-30 w-full border border-[#4387F5] bg-white text-xs shadow-lg dark:bg-[#1E293B]">
                      <div className="relative border-b border-[#E5E5E5] p-2 dark:border-[#334155]">
                        <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4387F5]" />
                        <input
                          type="text"
                          value={noteUserSearch}
                          onChange={(event) => setNoteUserSearch(event.target.value)}
                          placeholder="Search users"
                          className="h-8 w-full rounded border-0 bg-white px-2 pr-8 text-sm outline-none dark:bg-[#1E293B] dark:text-white"
                        />
                      </div>
                      <div className="max-h-52 overflow-y-auto py-1">
                        {[
                          'Ganesh Godse',
                          'Darshan Kulkarni',
                          'Dattatray Pimparkar',
                          'Davinder Saini',
                          'Devki Mudhalwadkar',
                          'Devyani Hire',
                          'Priya Sharma',
                          'Rajesh Ramanathan',
                          'Marcus Vance'
                        ].filter((name) => name.toLowerCase().includes(noteUserSearch.toLowerCase())).map((name) => (
                          <label
                            key={name}
                            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-[#1E293B] hover:bg-[#F2F6FC] dark:text-white dark:hover:bg-[#475569]"
                          >
                            <input
                              type="checkbox"
                              checked={selectedNoteUsers.includes(name)}
                              onChange={() => {
                                setSelectedNoteUsers((current) =>
                                  current.includes(name)
                                    ? current.filter((user) => user !== name)
                                    : [...current, name]
                                );
                              }}
                              className="h-4 w-4 accent-[#4387F5]"
                            />
                            <span>{name} (User)</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {newNoteCategory === 'Applicant Reference' && (
                <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <label className="text-xs font-semibold text-[#64748B] dark:text-[#DBEAFE]">
                    Action / Priority
                    <select
                      value={newNoteAction}
                      onChange={(event) => setNewNoteAction(event.target.value)}
                      className="mt-1 h-9 w-full rounded-md border border-[#CFCFCF] bg-white px-3 text-xs text-[#1E293B] outline-none dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
                    >
                      <option value="">Select Action</option>
                      <option value="Call">Call</option>
                      <option value="Email">Email</option>
                      <option value="Follow Up">Follow Up</option>
                      <option value="Interview">Interview</option>
                      <option value="Submission">Submission</option>
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-[#64748B] dark:text-[#DBEAFE]">
                    Priority
                    <select
                      value={newNotePriority}
                      onChange={(event) => setNewNotePriority(event.target.value as 'Low' | 'Medium' | 'High')}
                      className="mt-1 h-9 w-full rounded-md border border-[#CFCFCF] bg-white px-3 text-xs text-[#1E293B] outline-none dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-[#64748B] dark:text-[#DBEAFE]">
                    Applicant Ref
                    <select
                      value={newNoteApplicantRef}
                      onChange={(event) => setNewNoteApplicantRef(event.target.value)}
                      className="mt-1 h-9 w-full rounded-md border border-[#CFCFCF] bg-white px-3 text-xs text-[#1E293B] outline-none dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
                    >
                      <option value="">Select Applicant</option>
                      {applicants.map((applicant) => (
                        <option key={applicant.id} value={applicant.name}>
                          {applicant.name} - {applicant.applicantId}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              <EmailRichTextEditor
                value={newNoteText}
                resetKey={noteEditorResetKey}
                accentColor="#4387F5"
                onChange={setNewNoteText}
                onError={showToast}
              />

              <div className="mt-4 flex justify-end gap-2 border-t border-[#CBD5E1] pt-4 dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => setIsAddNoteModalOpen(false)}
                  className="rounded-md border border-[#CFCFCF] px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] dark:border-[#334155] dark:text-[#DBEAFE] dark:hover:bg-[#1E293B]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddNote}
                  className="rounded-md bg-[#4387F5] px-5 py-2 text-xs font-bold text-white hover:bg-[#2873E9]"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSendSurveyModalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/50 p-3"
          onClick={() => setIsSendSurveyModalOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="send-survey-title"
            className="flex max-h-[calc(100vh-24px)] w-full max-w-[500px] flex-col bg-white text-[#344054] shadow-2xl dark:bg-[#1E293B] dark:text-white"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-[#EAECF0] px-4 py-3 dark:border-[#0F172A]">
              <h2 id="send-survey-title" className="text-lg font-normal">Send Survey</h2>
              <button
                type="button"
                aria-label="Close Send Survey"
                onClick={() => setIsSendSurveyModalOpen(false)}
                className="text-[#667085] hover:text-[#344054] dark:text-[#94A3B8] dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 text-xs">
              <fieldset className="mb-4">
                <legend className="mb-2 font-medium text-[#344054] dark:text-white">
                  How would you like to send survey
                </legend>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={surveySendViaEmail}
                      onChange={(event) => setSurveySendViaEmail(event.target.checked)}
                    />
                    Send Via Email
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={surveySendViaSms}
                      onChange={(event) => setSurveySendViaSms(event.target.checked)}
                    />
                    Send Via SMS
                  </label>
                </div>
              </fieldset>

              <div className="mb-4">
                <label htmlFor="survey-form" className="mb-1.5 block text-[#667085] dark:text-[#94A3B8]">
                  Select survey form to send
                </label>
                <select
                  id="survey-form"
                  value={selectedSurveyForm}
                  onChange={(event) => setSelectedSurveyForm(event.target.value)}
                  className="h-7 w-full border border-[#D0D5DD] bg-[#F9FAFB] px-2 text-xs dark:border-[#334155] dark:bg-[#1E293B]"
                >
                  <option value="">Select</option>
                </select>
              </div>

              <div className="mb-4">
                <label id="survey-recipient-label" className="mb-1.5 block text-[#667085] dark:text-[#94A3B8]">
                  Select Recipients
                </label>
                <div className="relative">
                  <button
                    id="survey-recipient"
                    type="button"
                    aria-labelledby="survey-recipient-label"
                    aria-expanded={isSurveyRecipientMenuOpen}
                    onClick={() => setIsSurveyRecipientMenuOpen((open) => !open)}
                    className="flex h-7 w-full items-center justify-between border border-[#D0D5DD] bg-[#F9FAFB] px-2 text-left text-xs dark:border-[#334155] dark:bg-[#1E293B]"
                  >
                    <span className="truncate">
                      {selectedSurveyRecipients.length + selectedSurveyRoles.length === 0
                        ? 'Select'
                        : selectedSurveyRecipients.length + selectedSurveyRoles.length === 1
                          ? selectedSurveyRoles[0] || taskUsers.find((user) => user.id === selectedSurveyRecipients[0])?.name || '1 selected'
                          : `${selectedSurveyRecipients.length + selectedSurveyRoles.length} selected`}
                    </span>
                    <ChevronDown className={`ml-2 h-3.5 w-3.5 shrink-0 text-[#667085] transition-transform ${isSurveyRecipientMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isSurveyRecipientMenuOpen && (
                    <div className="absolute left-0 top-full z-50 mt-0.5 w-full border border-[#D0D5DD] bg-white shadow-lg dark:border-[#334155] dark:bg-[#1E293B]">
                      <div className="relative border-b border-[#EAECF0] p-2 dark:border-[#334155]">
                        <input
                          type="search"
                          value={surveyRecipientSearch}
                          onChange={(event) => setSurveyRecipientSearch(event.target.value)}
                          placeholder="Search users"
                          aria-label="Search survey recipients"
                          className="h-7 w-full border border-[#D0D5DD] bg-white px-2 pr-7 text-xs outline-none focus:border-[#3478F6] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
                        />
                        <Search className="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#667085]" />
                      </div>
                      <div className="max-h-48 overflow-y-auto py-1">
                        <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs text-[#3478F6] hover:bg-[#F2F6FC] dark:hover:bg-[#1E293B]">
                          <input
                            type="checkbox"
                            checked={
                              (taskUsers.length === 0 || taskUsers.every((user) => selectedSurveyRecipients.includes(user.id))) &&
                              surveyRecipientRoleOptions.every(({ label }) => selectedSurveyRoles.includes(label))
                            }
                            onChange={(event) => {
                              setSelectedSurveyRecipients(event.target.checked ? taskUsers.map((user) => user.id) : []);
                              setSelectedSurveyRoles(event.target.checked ? surveyRecipientRoleOptions.map(({ label }) => label) : []);
                            }}
                            className="h-3.5 w-3.5 accent-[#3478F6]"
                          />
                          <span>Select all</span>
                        </label>
                        <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#667085] dark:text-[#94A3B8]">
                          Roles
                        </div>
                        {surveyRecipientRoleOptions
                          .filter(({ label, value }) =>
                            `${label} ${value || ''}`.toLowerCase().includes(surveyRecipientSearch.trim().toLowerCase())
                          )
                          .map(({ label, value }) => {
                            const assignedUser = taskUsers.find((user) =>
                              user.name === value || user.email === value || user.id === value
                            );

                            return (
                              <label
                                key={label}
                                title={assignedUser ? `Assigned to ${assignedUser.name}` : undefined}
                                className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs text-[#344054] hover:bg-[#F2F6FC] dark:text-white dark:hover:bg-[#1E293B]"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedSurveyRoles.includes(label)}
                                  onChange={() => setSelectedSurveyRoles((current) =>
                                    current.includes(label)
                                      ? current.filter((role) => role !== label)
                                      : [...current, label]
                                  )}
                                  className="h-3.5 w-3.5 accent-[#3478F6]"
                                />
                                <span className="min-w-0 flex-1 truncate">{label}</span>
                                {assignedUser && (
                                  <span className="shrink-0 text-[10px] text-[#667085] dark:text-[#94A3B8]">{assignedUser.name}</span>
                                )}
                              </label>
                            );
                          })}
                        <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#667085] dark:text-[#94A3B8]">
                          Users
                        </div>
                        {taskUsers
                          .filter((user) => `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(surveyRecipientSearch.trim().toLowerCase()))
                          .map((user) => (
                            <label
                              key={user.id}
                              className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs text-[#344054] hover:bg-[#F2F6FC] dark:text-white dark:hover:bg-[#1E293B]"
                            >
                              <input
                                type="checkbox"
                                checked={selectedSurveyRecipients.includes(user.id)}
                                onChange={() => setSelectedSurveyRecipients((current) =>
                                  current.includes(user.id)
                                    ? current.filter((id) => id !== user.id)
                                    : [...current, user.id]
                                )}
                                className="h-3.5 w-3.5 accent-[#3478F6]"
                              />
                              <span className="min-w-0 flex-1 truncate">{user.name}</span>
                              <span className="shrink-0 text-[10px] capitalize text-[#667085] dark:text-[#94A3B8]">{user.role.replace('_', ' ')}</span>
                            </label>
                          ))}
                        {taskUsers.length === 0 && (
                          <p className="px-3 py-2 text-xs text-[#667085] dark:text-[#94A3B8]">No application users available.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="survey-subject" className="mb-1.5 block text-[#667085] dark:text-[#94A3B8]">
                  Subject
                </label>
                <input
                  id="survey-subject"
                  type="text"
                  value={surveySubject}
                  onChange={(event) => setSurveySubject(event.target.value)}
                  className="h-7 w-full border border-[#D0D5DD] bg-[#F9FAFB] px-2 text-xs dark:border-[#334155] dark:bg-[#1E293B]"
                />
              </div>

              <div>
                <label htmlFor="survey-mail-body" className="mb-1.5 block text-[#667085] dark:text-[#94A3B8]">
                  Mail Body
                </label>
                <div className="border border-[#D0D5DD] dark:border-[#334155]">
                  <div
                    aria-hidden="true"
                    className="flex min-h-[72px] flex-wrap content-start items-center gap-1 border-b border-[#D0D5DD] bg-white p-2 text-[11px] text-[#475467] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#D0D5DD]"
                  >
                    {['✎', '✂', '▣', '↶', '↷', '⌕', 'B', 'I', 'U', 'ab', 'x₂', 'x²', '•', '1.', '≡', 'Ω', 'Link', 'Format', 'Font', 'Size'].map((tool, index) => (
                      <span key={`${tool}-${index}`} className="min-w-5 px-1 text-center">{tool}</span>
                    ))}
                  </div>
                  <textarea
                    id="survey-mail-body"
                    aria-label="Mail Body"
                    value={surveyMailBody}
                    onChange={(event) => setSurveyMailBody(event.target.value)}
                    className="h-44 w-full resize-y bg-white p-2 text-xs outline-none dark:bg-[#1E293B]"
                  />
                </div>
              </div>
            </div>

            <footer className="flex justify-end gap-2 border-t border-[#EAECF0] px-4 py-3 dark:border-[#0F172A]">
              <button
                type="button"
                onClick={() => setIsSendSurveyModalOpen(false)}
                className="rounded bg-[#3478F6] px-5 py-2 text-xs font-medium text-white hover:bg-[#2865D8]"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsSendSurveyModalOpen(false)}
                className="rounded border border-[#D0D5DD] bg-white px-5 py-2 text-xs text-[#475467] hover:bg-[#F9FAFB] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
              >
                Cancel
              </button>
            </footer>
          </section>
        </div>
      )}

      {isJobTaskFormOpen && job && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/50 p-2">
          <div className="max-h-[calc(100vh-16px)] w-full max-w-[520px] overflow-x-visible overflow-y-auto bg-white shadow-2xl dark:bg-[#1E293B]">
            <div className="border-b border-[#EAECF0] px-4 py-3 dark:border-[#0F172A]">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setIsJobTaskFormOpen(false)} aria-label="Back to Task Manager">
                  <ArrowLeft className="h-5 w-5 text-[#3478F6]" />
                </button>
                <h2 className="text-lg font-normal text-[#344054] dark:text-white">Create New Task</h2>
              </div>
            </div>
            <form onSubmit={(event) => void handleCreateJobTask(event)} className="p-4">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    autoFocus
                    required
                    value={jobTaskForm.title}
                    onChange={(event) => setJobTaskField('title', event.target.value)}
                    placeholder="Enter Title"
                    aria-label="Task title"
                    className="h-7 min-w-0 flex-1 border border-[#D5DCE5] bg-[#F9FAFB] px-2 text-[11px] outline-none focus:border-[#3478F6]"
                  />
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsTaskPriorityMenuOpen((open) => !open);
                        setIsTaskAssignMenuOpen(false);
                        setIsTaskEscalateMenuOpen(false);
                        setIsTaskOwnershipMenuOpen(false);
                      }}
                      aria-label={`Task priority: ${jobTaskForm.priority}`}
                      aria-expanded={isTaskPriorityMenuOpen}
                      className="flex h-7 w-[92px] items-center justify-between border border-[#D5DCE5] bg-[#F9FAFB] px-1.5 text-[10px] text-[#344054]"
                    >
                      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                        jobTaskForm.priority === 'Low'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400'
                          : jobTaskForm.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400'
                      }`}>
                        <Zap className="h-3 w-3" fill="currentColor" aria-hidden="true" />
                      </span>
                      <span>{jobTaskForm.priority}</span>
                      <ChevronDown className="h-3 w-3 text-[#64748B]" />
                    </button>
                    {isTaskPriorityMenuOpen && (
                      <div className="absolute right-0 top-full z-40 mt-1 w-32 border border-[#D5DCE5] bg-white py-1 shadow-lg dark:border-[#334155] dark:bg-[#1E293B]">
                        {(['Low', 'Medium', 'High', 'Urgent'] as Priority[]).map((priority) => (
                          <button
                            key={priority}
                            type="button"
                            onClick={() => {
                              setJobTaskField('priority', priority);
                              setIsTaskPriorityMenuOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 px-2 py-1.5 text-left text-[11px] text-[#344054] hover:bg-[#F1F5F9] dark:text-white dark:hover:bg-[#1E293B] ${
                              jobTaskForm.priority === priority ? 'bg-[#F1F5F9]/70 dark:bg-[#1E293B]' : ''
                            }`}
                          >
                            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                              priority === 'Low'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400'
                                : priority === 'Medium'
                                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400'
                                  : 'bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400'
                            }`}>
                              <Zap className="h-3 w-3" fill="currentColor" aria-hidden="true" />
                            </span>
                            {priority}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <textarea
                  value={jobTaskForm.description}
                  onChange={(event) => setJobTaskField('description', event.target.value)}
                  placeholder="Enter a brief description of the task"
                  aria-label="Task description"
                  rows={3}
                  className="w-full resize-y border border-[#D5DCE5] bg-[#F9FAFB] px-2 py-1.5 text-[11px] outline-none focus:border-[#3478F6]"
                />

                <div className="grid grid-cols-2 gap-6">
                  <label className="space-y-1 text-[11px] text-[#667085]">
                    Business Unit
                    <select
                      value={jobTaskForm.businessUnit}
                      onChange={(event) => setJobTaskField('businessUnit', event.target.value)}
                      aria-label="Business Unit"
                      className="h-7 w-full border border-[#D5DCE5] bg-[#F9FAFB] px-2 text-[11px] text-[#344054]"
                    >
                      <option value={job.businessUnit}>{job.businessUnit}</option>
                      <option value="Ampcus Tech Pvt Ltd">Ampcus Tech Pvt Ltd</option>
                    </select>
                  </label>
                  <label className="space-y-1 text-[11px] text-[#667085]">
                    Task Type
                    <select
                      value={jobTaskForm.taskType}
                      onChange={(event) => setJobTaskField('taskType', event.target.value)}
                      aria-label="Task Type"
                      className="h-7 w-full border border-[#D5DCE5] bg-[#F9FAFB] px-2 text-[11px] text-[#344054]"
                    >
                      {['Select', 'Call', 'Meeting', 'To Do'].map((type) => <option key={type}>{type}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1 text-[11px] text-[#667085]">
                    Task Category
                    <select
                      required
                      value={jobTaskForm.category}
                      onChange={(event) => setJobTaskField('category', event.target.value as JobTaskForm['category'])}
                      aria-label="Task Category"
                      className="h-7 w-full border border-[#D5DCE5] bg-[#F9FAFB] px-2 text-[11px] text-[#344054]"
                    >
                      <option value="">Select</option>
                    </select>
                  </label>
                  <label className="space-y-1 text-[11px] text-[#667085]">
                    Related To
                    <input readOnly value="Job Posting" aria-label="Related To" className="h-7 w-full border border-[#D5DCE5] bg-[#F1F2F4] px-2 text-[11px] text-[#667085]" />
                  </label>
                  <label className="space-y-1 text-[11px] text-[#667085]">
                    Job Posting
                    <input readOnly value={job.title.toLowerCase()} aria-label="Job Posting" className="h-7 w-full border border-[#D5DCE5] bg-[#F1F2F4] px-2 text-[11px] text-[#667085]" />
                  </label>
                  <label className="space-y-1 text-[11px] text-[#667085]">
                    Due Date
                    <input
                      type="date"
                      value={jobTaskForm.dueDate}
                      onChange={(event) => setJobTaskField('dueDate', event.target.value)}
                      aria-label="Due Date"
                      className="h-7 w-full border border-[#D5DCE5] bg-[#F9FAFB] px-2 text-[11px] text-[#344054]"
                    />
                    <span className="flex items-start justify-between gap-2 pt-1 text-[10px] text-[#667085]">
                      {jobTaskForm.timeZone}
                      <button type="button" onClick={() => setIsTaskTimeZoneModalOpen(true)} className="shrink-0 text-blue-600">Time Zone</button>
                    </span>
                  </label>
                  <label className="space-y-1 text-[11px] text-[#667085]">
                    Status
                    <select
                      value={jobTaskForm.status}
                      onChange={(event) => setJobTaskField('status', event.target.value as JobTaskForm['status'])}
                      aria-label="Task Status"
                      className="h-7 w-full border border-[#D5DCE5] bg-[#F9FAFB] px-2 text-[11px] text-[#344054]"
                    >
                      {[
                        { value: '', label: 'Select' },
                        { value: 'Completed', label: 'Completed' },
                        { value: 'In Progress', label: 'In Progress' },
                        { value: 'Not Started', label: 'Not Started' }
                      ].map((status) => (
                        <option key={status.label} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 text-[11px] text-[#667085]">
                    Assign To
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setIsTaskAssignMenuOpen((open) => !open);
                          setIsTaskEscalateMenuOpen(false);
                          setIsTaskOwnershipMenuOpen(false);
                        }}
                        className="flex h-7 w-full items-center justify-between border border-[#D5DCE5] bg-[#F9FAFB] px-2 text-[11px] text-[#344054]"
                      >
                        <span>{jobTaskForm.assignedTo}</span>
                        <ChevronDown className="h-3.5 w-3.5 text-[#64748B]" />
                      </button>
                      {isTaskAssignMenuOpen && (
                        <div className="absolute left-0 top-full z-30 w-full border border-[#3478F6] bg-white shadow-lg">
                          <div className="relative border-b border-[#E5E5E5] p-1.5">
                            <input
                              type="text"
                              value={taskUserSearch}
                              onChange={(event) => setTaskUserSearch(event.target.value)}
                              placeholder="Search..."
                              className="h-7 w-full rounded border-0 px-2 pr-7 text-[11px] outline-none"
                            />
                            <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#3478F6]" />
                          </div>
                          <div className="max-h-36 overflow-y-auto py-1">
                            <label className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-[11px] text-[#3478F6] hover:bg-[#EAF2FF]">
                              <input
                                type="checkbox"
                                checked={taskUsers.length > 0 && taskUsers.every((user) => jobTaskForm.assignedTo.split(', ').includes(user.name))}
                                onChange={(event) => setJobTaskField(
                                  'assignedTo',
                                  event.target.checked
                                    ? taskUsers.map((user) => user.name).join(', ')
                                    : ''
                                )}
                                className="h-3.5 w-3.5 accent-[#3478F6]"
                              />
                              <span>[Select all]</span>
                            </label>
                            {taskUsers
                              .filter((user) => user.name.toLowerCase().includes(taskUserSearch.toLowerCase()))
                              .map((user) => {
                                const name = user.name;
                                return (
                                <label key={name} className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-[11px] text-[#344054] hover:bg-[#EAF2FF]">
                                  <input
                                    type="checkbox"
                                    checked={jobTaskForm.assignedTo.split(', ').includes(name)}
                                    onChange={() => setJobTaskField(
                                      'assignedTo',
                                      jobTaskForm.assignedTo.split(', ').includes(name)
                                        ? jobTaskForm.assignedTo.split(', ').filter((item) => item !== name).join(', ')
                                        : [...jobTaskForm.assignedTo.split(', ').filter((item) => item && item !== 'Me'), name].join(', ')
                                    )}
                                    className="h-3.5 w-3.5 accent-[#3478F6]"
                                  />
                                  <span>{name}</span>
                                </label>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                  <label className="space-y-1 text-[11px] text-[#667085]">
                    <span className="flex items-center gap-1">
                      Escalate To
                    <span className="group relative inline-flex" tabIndex={0}>
                        <span
                          aria-label="Escalation notification information"
                          className="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-[#3478F6] text-[9px] font-bold leading-none text-[#3478F6]"
                        >
                          ?
                        </span>
                        <span
                          role="tooltip"
                          className="pointer-events-auto absolute bottom-full left-0 z-[100] hidden w-[220px] whitespace-normal rounded bg-black px-3 py-2 text-left text-[11px] font-normal leading-4 text-white shadow-xl group-hover:block group-focus-within:block"
                        >
                          System will send a notification to the selected users when the task is not completed by the due date.
                          <span className="absolute left-3 top-full border-4 border-transparent border-t-black" />
                        </span>
                      </span>
                    </span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setIsTaskEscalateMenuOpen((open) => !open);
                          setIsTaskAssignMenuOpen(false);
                          setIsTaskOwnershipMenuOpen(false);
                        }}
                        className="flex h-7 w-full items-center justify-between border border-[#D5DCE5] bg-[#F9FAFB] px-2 text-[11px] text-[#344054]"
                      >
                        <span>{jobTaskForm.escalateTo || 'Select'}</span>
                        <ChevronDown className="h-3.5 w-3.5 text-[#64748B]" />
                      </button>
                      {isTaskEscalateMenuOpen && (
                        <div className="absolute left-0 top-full z-30 w-full border border-[#3478F6] bg-white shadow-lg">
                          <div className="relative border-b border-[#E5E5E5] p-1.5">
                            <input
                              type="text"
                              value={taskUserSearch}
                              onChange={(event) => setTaskUserSearch(event.target.value)}
                              placeholder="Search..."
                              className="h-7 w-full rounded border-0 px-2 pr-7 text-[11px] outline-none"
                            />
                            <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#3478F6]" />
                          </div>
                          <div className="max-h-36 overflow-y-auto py-1">
                            <label className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-[11px] text-[#3478F6] hover:bg-[#EAF2FF]">
                              <input
                                type="checkbox"
                                checked={taskUsers.length > 0 && taskUsers.every((user) => jobTaskForm.escalateTo.split(', ').includes(user.name))}
                                onChange={(event) => setJobTaskField(
                                  'escalateTo',
                                  event.target.checked
                                    ? taskUsers.map((user) => user.name).join(', ')
                                    : ''
                                )}
                                className="h-3.5 w-3.5 accent-[#3478F6]"
                              />
                              <span>[Select all]</span>
                            </label>
                            {taskUsers
                              .filter((user) => user.name.toLowerCase().includes(taskUserSearch.toLowerCase()))
                              .map((user) => {
                                const name = user.name;
                                return (
                                <label key={name} className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-[11px] text-[#344054] hover:bg-[#EAF2FF]">
                                  <input
                                    type="checkbox"
                                    checked={jobTaskForm.escalateTo.split(', ').includes(name)}
                                    onChange={() => setJobTaskField(
                                      'escalateTo',
                                      jobTaskForm.escalateTo.split(', ').includes(name)
                                        ? jobTaskForm.escalateTo.split(', ').filter((item) => item !== name).join(', ')
                                        : [...jobTaskForm.escalateTo.split(', ').filter(Boolean), name].join(', ')
                                    )}
                                    className="h-3.5 w-3.5 accent-[#3478F6]"
                                  />
                                  <span>{name}</span>
                                </label>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                  <label className="space-y-1 text-[11px] text-[#667085]">
                    Reminder
                    <select
                      value={jobTaskForm.reminder}
                      onChange={(event) => setJobTaskField('reminder', event.target.value)}
                      aria-label="Reminder"
                      className="h-7 w-full border border-[#D5DCE5] bg-[#F9FAFB] px-2 text-[11px] text-[#344054]"
                    >
                      {['None', '15 mins before', '30 mins before', '45 mins before', '60 mins before'].map((reminder) => <option key={reminder}>{reminder}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1 text-[11px] text-[#667085]">
                    Ownership
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setIsTaskOwnershipMenuOpen((open) => !open);
                          setIsTaskAssignMenuOpen(false);
                          setIsTaskEscalateMenuOpen(false);
                        }}
                        className="flex h-7 w-full items-center justify-between border border-[#3478F6] bg-[#F9FAFB] px-2 text-[11px] text-[#344054]"
                      >
                        <span>{jobTaskForm.ownership || 'Select'}</span>
                        <ChevronDown className="h-3.5 w-3.5 text-[#64748B]" />
                      </button>
                      {isTaskOwnershipMenuOpen && (
                        <div className="absolute left-0 top-full z-30 w-full border border-[#3478F6] bg-white shadow-lg">
                          <div className="relative border-b border-[#E5E5E5] p-1.5">
                            <input
                              type="text"
                              value={taskUserSearch}
                              onChange={(event) => setTaskUserSearch(event.target.value)}
                              placeholder="Search..."
                              className="h-7 w-full rounded border-0 px-2 pr-7 text-[11px] outline-none"
                            />
                            <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#3478F6]" />
                          </div>
                          <div className="max-h-36 overflow-y-auto py-1">
                            <label className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-[11px] text-[#3478F6] hover:bg-[#EAF2FF]">
                              <input
                                type="checkbox"
                                checked={taskUsers.length > 0 && taskUsers.every((user) => jobTaskForm.ownership.split(', ').includes(user.name))}
                                onChange={(event) => setJobTaskField(
                                  'ownership',
                                  event.target.checked
                                    ? taskUsers.map((user) => user.name).join(', ')
                                    : ''
                                )}
                                className="h-3.5 w-3.5 accent-[#3478F6]"
                              />
                              <span>[Select all]</span>
                            </label>
                            {taskUsers
                              .filter((user) => user.name.toLowerCase().includes(taskUserSearch.toLowerCase()))
                              .map((user) => {
                                const name = user.name;
                                return (
                                <label key={name} className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-[11px] text-[#344054] hover:bg-[#EAF2FF]">
                                  <input
                                    type="checkbox"
                                    checked={jobTaskForm.ownership.split(', ').includes(name)}
                                    onChange={() => setJobTaskField(
                                      'ownership',
                                      jobTaskForm.ownership.split(', ').includes(name)
                                        ? jobTaskForm.ownership.split(', ').filter((item) => item !== name).join(', ')
                                        : [...jobTaskForm.ownership.split(', ').filter(Boolean), name].join(', ')
                                    )}
                                    className="h-3.5 w-3.5 accent-[#3478F6]"
                                  />
                                  <span>{name}</span>
                                </label>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                  <label className="flex items-center gap-2 self-end pb-1 text-[11px] text-[#344054]">
                    <input type="checkbox" checked={jobTaskForm.notifyViaEmail} onChange={(event) => setJobTaskField('notifyViaEmail', event.target.checked)} />
                    Notify Via Email
                  </label>
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-2 text-[11px] text-[#344054]">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={jobTaskForm.showOnCalendar} onChange={(event) => setJobTaskField('showOnCalendar', event.target.checked)} />
                    Show task on event calendar
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={jobTaskForm.recurrenceTask} onChange={(event) => setJobTaskField('recurrenceTask', event.target.checked)} />
                    Recurrence Task
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={isSavingJobTask} className="rounded bg-[#3478F6] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2868DC] disabled:opacity-50">
                    {isSavingJobTask ? 'Creating...' : 'Create Task'}
                  </button>
                  <button type="button" onClick={() => setIsJobTaskFormOpen(false)} className="rounded border border-[#D0D5DD] px-3 py-1.5 text-xs text-[#344054] hover:bg-[#F9FAFB]">
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 8: Quick Submission */}
      {/* ========================================================= */}
      {(isSubmitCandidateModalOpen || isTagApplicantModalOpen) && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4"
          onClick={closeApplicantSubmissionModal}
        >
          <aside
            className={`flex max-h-[calc(100vh-2rem)] w-full max-w-[760px] flex-col overflow-hidden rounded-xl border text-[#1E293B] shadow-2xl dark:border-[#0F172A] dark:bg-[#1E293B] dark:text-white ${isTagApplicantModalOpen ? 'border-[#CBD5E1] bg-[#F8FAFC]' : 'border-[#CBD5E1] bg-[#F1F5F9]'}`}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-submission-title"
          >
            <header className={`flex items-center justify-between border-b bg-white px-6 py-3 dark:border-[#0F172A] dark:bg-[#1E293B] ${isTagApplicantModalOpen ? 'border-[#CBD5E1]' : 'border-[#CBD5E1]'}`}>
              <h2 id="quick-submission-title" className="flex items-center gap-2 text-sm font-semibold text-[#1E293B] dark:text-white">
                <CheckCircle className={`h-4 w-4 ${isTagApplicantModalOpen ? 'text-[#3478F6]' : 'text-[#2563EB]'}`} />
                {isTagApplicantModalOpen ? `Tag to Job - ${job.title}` : `Quick Submission - ${job.title}`}
              </h2>
              <button
                type="button"
                onClick={closeApplicantSubmissionModal}
                aria-label={isTagApplicantModalOpen ? 'Close tag applicant' : 'Close quick submission'}
                className={`${isTagApplicantModalOpen ? 'text-[#667085]' : 'text-[#64748B]'} hover:text-[#1E293B] dark:text-[#94A3B8]`}
              >
                <X className="h-6 w-6" />
              </button>
            </header>

            <form
              onSubmit={(event) => void (isTagApplicantModalOpen
                ? handleTagApplicant(event)
                : handleQuickSubmitCandidate(event))}
              className="min-h-0 flex-1 overflow-y-auto px-6 py-4"
            >
              <div className="grid max-w-[510px] grid-cols-[minmax(100px,140px)_minmax(0,346px)] items-center gap-x-3 gap-y-3 text-xs">
                <label htmlFor="quick-submit-applicant" className="text-[#7B8794]">
                  Select Applicant <span className="text-red-500">*</span>
                </label>
                <div className="relative min-w-0">
                  <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#667085]" />
                  <input
                  id="quick-submit-applicant"
                  type="search"
                  required
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={isSubmitApplicantSearchOpen}
                  aria-controls="quick-submit-applicant-options"
                  autoComplete="off"
                  placeholder="Search for an Applicant"
                  value={submitApplicantSearch}
                  onFocus={() => setIsSubmitApplicantSearchOpen(true)}
                  onBlur={() => setIsSubmitApplicantSearchOpen(false)}
                  onChange={(event) => {
                    setSubmitApplicantSearch(event.target.value);
                    setIsSubmitApplicantSearchOpen(true);
                    if (submitApplicantId) {
                      setSubmitApplicantId('');
                      setQuickSubmissionDetails((current) => ({ ...current, resumeName: '', availableDocument: '' }));
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      setIsSubmitApplicantSearchOpen(false);
                    } else if (event.key === 'Enter' && isSubmitApplicantSearchOpen && filteredSubmitApplicants.length > 0) {
                      event.preventDefault();
                      selectSubmitApplicant(filteredSubmitApplicants[0]);
                    }
                  }}
                  className="h-[30px] w-full border border-[#CBD5E1] bg-[#F8FAFC] pl-7 pr-2 text-xs text-[#344054]"
                  />
                  {isSubmitApplicantSearchOpen && (
                    <div
                      id="quick-submit-applicant-options"
                      role="listbox"
                      aria-label="Applicant suggestions"
                      className="absolute left-0 top-full z-[90] mt-0.5 max-h-52 w-full overflow-y-auto border border-[#CBD5E1] bg-white py-1 shadow-lg"
                    >
                      {filteredSubmitApplicants.map((applicant) => (
                        <button
                          key={applicant.id}
                          type="button"
                          role="option"
                          aria-selected={applicant.id === submitApplicantId}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => selectSubmitApplicant(applicant)}
                          className="flex w-full flex-col px-3 py-1.5 text-left text-xs text-[#344054] hover:bg-[#F2F6FC]"
                        >
                          <span className="font-medium">{applicant.name}</span>
                          <span className="text-[10px] text-[#667085]">
                            {applicant.applicantId}{applicant.email ? ` · ${applicant.email}` : ''}
                          </span>
                        </button>
                      ))}
                      {filteredSubmitApplicants.length === 0 && (
                        <p className="px-3 py-2 text-xs text-[#667085]">
                          {applicants.length === 0 ? 'No applicants available.' : 'No applicants match your search.'}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <label htmlFor="quick-submit-job-title" className="text-[#7B8794]">Job Title</label>
                <input
                  id="quick-submit-job-title"
                  readOnly
                  value={job.title}
                  className="h-[30px] w-full border border-[#CBD5E1] bg-[#F1F2F4] px-2 text-xs text-[#344054]"
                />

                <h3 className="col-span-2 mt-2 text-sm font-semibold text-[#344054] dark:text-white">Standard Fields</h3>

                <label htmlFor="quick-submit-notice-period" className="text-[#7B8794]">
                  Notice Period <span className="text-red-500">*</span>
                </label>
                <input
                  id="quick-submit-notice-period"
                  required
                  value={quickSubmissionDetails.noticePeriod}
                  onChange={(event) => setQuickSubmissionField('noticePeriod', event.target.value)}
                  className="h-[30px] w-full border border-[#CBD5E1] bg-[#F8FAFC] px-2 text-xs"
                />

                <label htmlFor="quick-submit-bill-rate" className="text-[#7B8794]">Bill Rate</label>
                <div className="flex min-w-0 gap-1">
                  <select
                    aria-label="Bill Rate Currency"
                    value={quickSubmissionDetails.currency}
                    onChange={(event) => setQuickSubmissionField('currency', event.target.value)}
                    className="h-[30px] w-[62px] border border-[#CBD5E1] bg-[#F8FAFC] px-1 text-xs"
                  >
                    {BILL_RATE_CURRENCIES.map((currency) => (
                      <option key={currency}>{currency}</option>
                    ))}
                  </select>
                  <input
                    id="quick-submit-bill-rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={submitBillRate || ''}
                    onChange={(event) => setSubmitBillRate(Number(event.target.value))}
                    className="h-[30px] min-w-0 flex-1 border border-[#CBD5E1] bg-[#F8FAFC] px-2 text-xs"
                  />
                  <select
                    aria-label="Bill Rate Period"
                    value={quickSubmissionDetails.rateType}
                    onChange={(event) => setQuickSubmissionField('rateType', event.target.value)}
                    className="h-[30px] w-[72px] border border-[#CBD5E1] bg-[#F8FAFC] px-1 text-xs"
                  >
                    <option>Yearly</option>
                    <option>Monthly</option>
                    <option>Hourly</option>
                  </select>
                </div>

                <span className="text-[#7B8794]">Relocation</span>
                <div className="flex items-center gap-6">
                  {(['Yes', 'No'] as const).map((value) => (
                    <label key={value} className="inline-flex items-center gap-1.5 text-xs text-[#667085]">
                      <input
                        type="radio"
                        name="quick-submit-relocation"
                        value={value}
                        checked={quickSubmissionDetails.relocation === value}
                        onChange={() => setQuickSubmissionField('relocation', value)}
                      />
                      {value}
                    </label>
                  ))}
                </div>

                <label htmlFor="quick-submit-resume" className="text-[#7B8794]">
                  Resume <span className="text-red-500">*</span>
                </label>
                <select
                  id="quick-submit-resume"
                  required
                  value={quickSubmissionDetails.resumeName}
                  onChange={(event) => setQuickSubmissionField('resumeName', event.target.value)}
                  className="h-[30px] w-full border border-[#CBD5E1] bg-[#F8FAFC] px-2 text-xs"
                >
                  <option value="">Select</option>
                  {applicantResumes.map((document) => (
                    <option key={document.name} value={document.name}>{document.name}</option>
                  ))}
                  {selectedSubmitApplicant && applicantResumes.length === 0 && (
                    <option value="Generated Profile Resume">Generated Profile Resume</option>
                  )}
                </select>
                <span className="col-start-2 -mt-2 text-[10px] text-[#64748B]">* Represents the default resume</span>

                <label htmlFor="quick-submit-video-link" className="text-[#7B8794]">Video Link</label>
                <input
                  id="quick-submit-video-link"
                  type="url"
                  value={quickSubmissionDetails.videoLink}
                  onChange={(event) => setQuickSubmissionField('videoLink', event.target.value)}
                  className="h-[30px] w-full border border-[#CBD5E1] bg-[#F8FAFC] px-2 text-xs"
                />

                {!isTagApplicantModalOpen && (
                  <>
                    <label htmlFor="quick-submit-documents" className="text-[#7B8794]">Available Documents</label>
                    <select
                      id="quick-submit-documents"
                      value={quickSubmissionDetails.availableDocument}
                      onChange={(event) => setQuickSubmissionField('availableDocument', event.target.value)}
                      className="h-[30px] w-full border border-[#CBD5E1] bg-[#F8FAFC] px-2 text-xs"
                    >
                      <option value="">None Selected</option>
                      {applicantDocuments.map((document) => (
                        <option key={document.name} value={document.name}>{document.name}</option>
                      ))}
                    </select>
                  </>
                )}

                <span className="text-[#7B8794]">Additional Attachment</span>
                <div className="flex items-center gap-2">
                  <label className="flex h-7 w-10 cursor-pointer items-center justify-center border border-[#CBD5E1] bg-white text-[#2563EB]" title="Attach a local file">
                    <Monitor className="h-4 w-4" />
                    <input
                      type="file"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        setQuickSubmissionAttachment(file || null);
                        setQuickSubmissionField('additionalAttachmentName', file?.name || '');
                      }}
                    />
                  </label>
                  {quickSubmissionAttachment && <span className="truncate text-[10px] text-[#667085]">{quickSubmissionAttachment.name}</span>}
                </div>

                <label htmlFor="quick-submit-eforms" className="text-[#7B8794]">eForms</label>
                <select
                  id="quick-submit-eforms"
                  value={quickSubmissionDetails.eForm}
                  onChange={(event) => setQuickSubmissionField('eForm', event.target.value)}
                  className="h-[30px] w-full border border-[#CBD5E1] bg-[#F8FAFC] px-2 text-xs"
                >
                  <option value="">Select</option>
                  {!isTagApplicantModalOpen && (
                    <>
                      <option>Candidate Submission Form</option>
                      <option>Candidate Profile Form</option>
                    </>
                  )}
                </select>

                {renderQuickSubmissionUserDropdown('recipients', 'Recipients')}
                {renderQuickSubmissionUserDropdown('additionalNotifiers', 'Additional Notifiers')}

                <label htmlFor="quick-submit-other-emails" className="text-[#7B8794]">Other Email Ids</label>
                <input
                  id="quick-submit-other-emails"
                  value={quickSubmissionDetails.otherEmailIds}
                  onChange={(event) => setQuickSubmissionField('otherEmailIds', event.target.value)}
                  className="h-[30px] w-full border border-[#CBD5E1] bg-[#F8FAFC] px-2 text-xs"
                />

                <label htmlFor="quick-submit-comments" className="self-start pt-2 text-[#7B8794]">Comments</label>
                <textarea
                  id="quick-submit-comments"
                  rows={2}
                  value={quickSubmissionDetails.comments}
                  onChange={(event) => setQuickSubmissionField('comments', event.target.value)}
                  className="w-full resize-y border border-[#CBD5E1] bg-[#F8FAFC] px-2 py-1.5 text-xs"
                />

                <label htmlFor="quick-submit-employer-details" className="text-[#7B8794]">Employer Details</label>
                <select
                  id="quick-submit-employer-details"
                  value={quickSubmissionDetails.employerDetails}
                  onChange={(event) => setQuickSubmissionField('employerDetails', event.target.value)}
                  className="h-[30px] w-full border border-[#CBD5E1] bg-[#F8FAFC] px-2 text-xs"
                >
                  <option value="">Select</option>
                  {!isTagApplicantModalOpen && selectedSubmitApplicant?.currentCompany && (
                    <option>{selectedSubmitApplicant.currentCompany}</option>
                  )}
                </select>

                <div className="col-span-2 flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={!submitApplicantId}
                    className={`rounded px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 ${isTagApplicantModalOpen ? 'bg-[#3478F6] hover:bg-[#2868DC]' : 'bg-[#2563EB] hover:bg-[#1D4ED8]'}`}
                  >
                    {isTagApplicantModalOpen ? 'Tag' : 'Submit'}
                  </button>
                  <button
                    type="button"
                    onClick={closeApplicantSubmissionModal}
                    className={`rounded border px-3 py-1.5 text-xs hover:bg-white dark:border-[#334155] dark:text-white dark:hover:bg-[#1E293B] ${isTagApplicantModalOpen ? 'border-[#CBD5E1] text-[#667085]' : 'border-[#CBD5E1] text-[#64748B]'}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </aside>
        </div>
      )}

      {isQuickTagModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4"
          onClick={closeQuickTagModal}
        >
          <aside
            className="w-full max-w-[500px] overflow-visible rounded-md border border-[#D0D5DD] bg-white text-[#1E293B] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-tag-title"
          >
            <header className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
              <h2 id="quick-tag-title" className="text-base font-medium text-[#1E293B]">Tag to Applicant</h2>
              <button
                type="button"
                onClick={closeQuickTagModal}
                disabled={isSavingQuickTag}
                aria-label="Close quick tag"
                className="text-[#667085] hover:text-[#1E293B] disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <form onSubmit={(event) => void handleQuickTagApplicant(event)}>
              <div className="grid grid-cols-[82px_minmax(0,1fr)] items-start gap-3 px-5 py-4">
                <label className="pt-1 text-xs leading-5 text-[#667085]" htmlFor="quick-tag-applicant-trigger">
                  Select<br />Applicant
                </label>
                <div className="relative min-w-0">
                  <button
                    id="quick-tag-applicant-trigger"
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isQuickTagApplicantListOpen}
                    onClick={() => setIsQuickTagApplicantListOpen((open) => !open)}
                    className="flex h-[30px] w-full items-center justify-between border border-[#CBD5E1] bg-[#F8FAFC] px-2 text-left text-xs text-[#344054]"
                  >
                    <span className="truncate">
                      {applicants.find((applicant) => applicant.id === quickTagApplicantId)?.name || 'Search for an Applicant'}
                    </span>
                    <ChevronDown className={`ml-2 h-3.5 w-3.5 shrink-0 text-[#667085] transition-transform ${isQuickTagApplicantListOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isQuickTagApplicantListOpen && (
                    <div className="absolute left-0 top-full z-[90] w-full border border-[#CBD5E1] bg-white shadow-lg">
                      <div className="p-2">
                        <div className="relative">
                          <input
                            autoFocus
                            type="search"
                            value={quickTagApplicantSearch}
                            onChange={(event) => {
                              setQuickTagApplicantSearch(event.target.value);
                              setQuickTagApplicantId('');
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Escape') {
                                setIsQuickTagApplicantListOpen(false);
                              } else if (event.key === 'Enter' && quickTagApplicantSearch.trim().length >= 3) {
                                const matchingApplicant = applicants.find((applicant) =>
                                  `${applicant.name} ${applicant.applicantId} ${applicant.email}`
                                    .toLocaleLowerCase()
                                    .includes(quickTagApplicantSearch.trim().toLocaleLowerCase())
                                  && !jobSubmissions.some((submission) => submission.applicantId === applicant.id)
                                );
                                if (matchingApplicant) {
                                  event.preventDefault();
                                  setQuickTagApplicantId(matchingApplicant.id);
                                  setIsQuickTagApplicantListOpen(false);
                                }
                              }
                            }}
                            aria-label="Search applicants for quick tag"
                            placeholder="Search applicants"
                            className="h-7 w-full border border-[#3478F6] bg-white px-2 pr-7 text-xs text-[#344054] outline-none"
                          />
                          <Search className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#667085]" />
                        </div>

                        {quickTagApplicantSearch.trim().length < 3 ? (
                          <p className="pt-2 text-[11px] text-[#667085]">
                            Please enter {3 - quickTagApplicantSearch.trim().length} more character{3 - quickTagApplicantSearch.trim().length === 1 ? '' : 's'}
                          </p>
                        ) : (
                          <div role="listbox" aria-label="Quick tag applicant suggestions" className="mt-1 max-h-40 overflow-y-auto">
                            {applicants
                              .filter((applicant) =>
                                `${applicant.name} ${applicant.applicantId} ${applicant.email}`
                                  .toLocaleLowerCase()
                                  .includes(quickTagApplicantSearch.trim().toLocaleLowerCase())
                              )
                              .map((applicant) => {
                                const isAlreadyTagged = jobSubmissions.some((submission) => submission.applicantId === applicant.id);
                                return (
                                  <button
                                    key={applicant.id}
                                    type="button"
                                    role="option"
                                    aria-selected={applicant.id === quickTagApplicantId}
                                    disabled={isAlreadyTagged}
                                    onClick={() => {
                                      setQuickTagApplicantId(applicant.id);
                                      setIsQuickTagApplicantListOpen(false);
                                    }}
                                    className="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left text-xs text-[#344054] hover:bg-[#F2F6FC] disabled:cursor-not-allowed disabled:text-[#98A2B3]"
                                  >
                                    <span className="min-w-0 truncate">{applicant.name} ({applicant.applicantId})</span>
                                    {isAlreadyTagged && <span className="shrink-0 text-[10px]">Already tagged</span>}
                                  </button>
                                );
                              })}
                            {applicants.filter((applicant) =>
                              `${applicant.name} ${applicant.applicantId} ${applicant.email}`
                                .toLocaleLowerCase()
                                .includes(quickTagApplicantSearch.trim().toLocaleLowerCase())
                            ).length === 0 && (
                              <p className="px-2 py-2 text-xs text-[#667085]">No applicants match your search.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <footer className="flex justify-end gap-2 border-t border-[#E5E7EB] px-5 py-3">
                <button
                  type="submit"
                  disabled={!quickTagApplicantId || isSavingQuickTag}
                  className="rounded bg-[#3478F6] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#2868DC] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingQuickTag ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={closeQuickTagModal}
                  disabled={isSavingQuickTag}
                  className="rounded border border-[#CBD5E1] px-4 py-1.5 text-xs text-[#475467] hover:bg-[#F8FAFC] disabled:opacity-50"
                >
                  Cancel
                </button>
              </footer>
            </form>
          </aside>
        </div>
      )}

      {isJobPrintPreviewOpen && (
        <div
          id="job-print-overlay"
          className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onClick={() => setIsJobPrintPreviewOpen(false)}
        >
          <style>{`
            .job-print-content {
              background: #e5e7eb;
              font-family: Arial, Helvetica, sans-serif;
            }
            .job-print-page {
              box-sizing: border-box;
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              padding: 10mm 15mm;
              background: #fff;
              color: #222;
              font-family: Arial, Helvetica, sans-serif;
              box-shadow: 0 2px 8px rgba(0, 0, 0, .18);
              font-size: 9pt;
            }
            .job-print-logo {
              display: block;
              width: 220px;
              height: 40px;
              object-fit: contain;
              object-position: left center;
              margin-bottom: 12px;
            }
            .job-print-section + .job-print-section {
              margin-top: 12px;
            }
            .job-print-section-title {
              margin: 0;
              border: 1px solid #99c9f1;
              background: #d3e4f3;
              color: #0072c6;
              padding: 6px 8px;
              font-size: 9pt;
              font-weight: 700;
              line-height: 1.25;
              text-transform: uppercase;
            }
            .job-print-table {
              width: 100%;
              table-layout: fixed;
              border-collapse: collapse;
            }
            .job-print-table th,
            .job-print-table td {
              border: 1px solid #99c9f1;
              padding: 5px 8px;
              color: #222;
              font-size: 9pt;
              line-height: 1.25;
              vertical-align: top;
              overflow-wrap: anywhere;
            }
            .job-print-table th {
              font-weight: 700;
              text-align: left;
            }
            .job-print-job-details col:nth-child(1) { width: 20%; }
            .job-print-job-details col:nth-child(2) { width: 35%; }
            .job-print-job-details col:nth-child(3) { width: 20%; }
            .job-print-job-details col:nth-child(4) { width: 25%; }
            .job-print-skills col:nth-child(1) { width: 18%; }
            .job-print-skills col:nth-child(2) { width: 45%; }
            .job-print-skills col:nth-child(3) { width: 18%; }
            .job-print-skills col:nth-child(4) { width: 19%; }
            .job-print-organization col:nth-child(1) { width: 20%; }
            .job-print-organization col:nth-child(2) { width: 31%; }
            .job-print-organization col:nth-child(3) { width: 20%; }
            .job-print-organization col:nth-child(4) { width: 29%; }
            .job-print-user-fields col:nth-child(1) { width: 18%; }
            .job-print-user-fields col:nth-child(2) { width: 38%; }
            .job-print-user-fields col:nth-child(3) { width: 18%; }
            .job-print-user-fields col:nth-child(4) { width: 26%; }
            .job-print-description-table col:first-child { width: 20%; }
            .job-print-description-table col:last-child { width: 80%; }
            .job-print-description-content {
              color: #222;
              font-size: 9pt;
              line-height: 1.35;
            }
            .job-print-description-content * {
              color: #222 !important;
            }
            @media print {
              @page { size: A4; margin: 0; }
              html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
              body * { visibility: hidden !important; }
              #job-print-overlay, #job-print-overlay * { visibility: visible !important; }
              #job-print-overlay {
                position: static !important;
                display: block !important;
                overflow: visible !important;
                padding: 0 !important;
                background: #fff !important;
              }
              #job-print-dialog {
                position: static !important;
                display: block !important;
                width: 100% !important;
                max-width: none !important;
                max-height: none !important;
                overflow: visible !important;
                border: 0 !important;
                box-shadow: none !important;
              }
              #job-print-controls { display: none !important; }
              #job-print-content {
                display: block !important;
                overflow: visible !important;
                padding: 0 !important;
                background: #fff !important;
              }
              .job-print-page {
                width: 210mm !important;
                min-height: 297mm !important;
                margin: 0 !important;
                padding: 10mm 15mm !important;
                box-shadow: none !important;
                break-after: page;
                page-break-after: always;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .job-print-page:last-child {
                break-after: auto;
                page-break-after: auto;
              }
              .job-print-section,
              .job-print-row { break-inside: avoid; page-break-inside: avoid; }
            }
          `}</style>
          <section
            id="job-print-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-print-preview-title"
            className="flex max-h-[calc(100vh-32px)] w-full max-w-[980px] flex-col overflow-hidden border border-[#D0D5DD] bg-white text-[#1E293B] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header id="job-print-controls" className="flex shrink-0 items-center justify-between border-b border-[#D0D5DD] bg-[#F9FAFB] px-5 py-3">
              <h2 id="job-print-preview-title" className="text-base font-semibold">Print Job Preview</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintJob}
                  className="rounded bg-[#3478F6] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#2868DC]"
                >
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => setIsJobPrintPreviewOpen(false)}
                  aria-label="Close print preview"
                  className="rounded border border-[#D0D5DD] px-3 py-1.5 text-xs text-[#344054] hover:bg-[#EAECF0]"
                >
                  Close
                </button>
              </div>
            </header>

            <div id="job-print-content" className="job-print-content min-h-0 space-y-6 overflow-y-auto p-6">
              <article className="job-print-page">
                <img className="job-print-logo" src="/assets/job-posting-logo.png" alt="Ampcus Tech" />
                {printableJobSections.slice(0, 3).map((section) => (
                  <section
                    key={section.title}
                    className="job-print-section"
                  >
                    <h2 className="job-print-section-title">
                      {section.title}
                    </h2>
                    <table className={`job-print-table job-print-${section.variant}`}>
                      <colgroup><col /><col /><col /><col /></colgroup>
                      <tbody>
                        {section.rows.map((row, rowIndex) => (
                          <tr key={`${section.title}-${rowIndex}`} className="job-print-row">
                            {row.map((field) => field && (
                              <React.Fragment key={field.label}>
                                <th>{field.label}</th>
                                <td colSpan={row[1] ? 1 : 3}>
                                  {field.value == null || field.value === ''
                                    ? 'N/A'
                                    : typeof field.value === 'boolean'
                                      ? field.value ? 'Yes' : 'No'
                                      : String(field.value)}
                                </td>
                              </React.Fragment>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                ))}
              </article>

              <article className="job-print-page">
                {printableJobSections.slice(3).map((section) => (
                  <section key={section.title} className="job-print-section">
                    <h2 className="job-print-section-title">{section.title}</h2>
                    <table className={`job-print-table job-print-${section.variant}`}>
                      <colgroup><col /><col /><col /><col /></colgroup>
                      <tbody>
                        {section.rows.map((row, rowIndex) => (
                          <tr key={`${section.title}-${rowIndex}`} className="job-print-row">
                            {row.map((field) => field && (
                              <React.Fragment key={field.label}>
                                <th>{field.label}</th>
                                <td colSpan={row[1] ? 1 : 3}>
                                  {field.value == null || field.value === ''
                                    ? 'N/A'
                                    : typeof field.value === 'boolean'
                                      ? field.value ? 'Yes' : 'No'
                                      : String(field.value)}
                                </td>
                              </React.Fragment>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                ))}
                <section className="job-print-section">
                  <table className="job-print-table job-print-description-table">
                    <colgroup><col /><col /></colgroup>
                    <tbody>
                      <tr className="job-print-row">
                        <th>Job Description</th>
                        <td className="job-print-description-content">
                          {renderSafeDescription(job.description) || 'N/A'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </section>
              </article>
            </div>
          </section>
        </div>
      )}

      {isShareJobPreviewOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsShareJobPreviewOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-job-preview-title"
            className="flex max-h-[calc(100vh-32px)] w-full max-w-[850px] flex-col bg-[#F9FAFB] text-[#344054] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-[#D5D5D5] bg-white px-4 py-3">
              <h2 id="share-job-preview-title" className="text-xl font-normal text-[#333]">Email Preview</h2>
              <button
                type="button"
                onClick={() => setIsShareJobPreviewOpen(false)}
                aria-label="Close email preview"
                className="text-[#667085] hover:text-[#344054]"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="grid min-h-0 grid-cols-[112px_minmax(0,1fr)] gap-x-3 gap-y-3 overflow-y-auto px-4 py-4 text-xs">
              <label htmlFor="share-job-recipients" className="pt-1 text-[#667085]">To</label>
              <div className="min-w-0">
                <input
                  id="share-job-recipients"
                  type="text"
                  value={shareJobRecipients}
                  onChange={(event) => setShareJobRecipients(event.target.value)}
                  placeholder="Enter email addresses"
                  className="h-[30px] w-full border border-[#D5DCE5] bg-white px-2 text-xs text-[#344054] outline-none focus:border-blue-500"
                />
                <p className="mt-1 text-[10px] text-red-600">Add new email IDs with commas (up to 5).</p>
              </div>

              <label htmlFor="share-job-subject" className="pt-1 text-[#667085]">Subject</label>
              <input
                id="share-job-subject"
                type="text"
                value={shareJobSubject}
                onChange={(event) => setShareJobSubject(event.target.value)}
                className="h-[30px] w-full border border-[#D5DCE5] bg-white px-2 text-xs text-[#344054] outline-none focus:border-blue-500"
              />

              <span className="pt-1 text-[#667085]">Body</span>
              <div className="min-w-0 border border-[#D5DCE5] bg-white">
                <EmailRichTextEditor
                  value={shareJobBody}
                  resetKey={shareJobEditorResetKey}
                  accentColor="#4387F5"
                  onChange={setShareJobBody}
                  onError={showToast}
                />
              </div>

              <span className="pt-1 text-[#667085]">Attachments</span>
              <span className="pt-1 text-[#667085]">N/A</span>
            </div>

            <footer className="flex justify-end gap-2 border-t border-[#D5D5D5] bg-white px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  const recipients = shareJobRecipients.split(/[;,]/).map((email) => email.trim()).filter(Boolean);
                  if (recipients.length > 5) {
                    showToast('Only 5 email IDs are allowed here.');
                    return;
                  }
                  if (recipients.length === 0) {
                    showToast('Enter at least one recipient email address.');
                    return;
                  }
                  showToast('Email delivery is not connected in this app.');
                }}
                className="rounded-sm bg-[#4387F5] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#286FE0]"
              >
                Send
              </button>
              <button
                type="button"
                onClick={() => setIsShareJobPreviewOpen(false)}
                className="rounded-sm border border-[#C9C9C9] bg-[#F8F8F8] px-4 py-1.5 text-xs font-medium text-[#555] hover:bg-[#EFEFEF]"
              >
                Cancel
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
};
