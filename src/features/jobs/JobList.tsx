import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  Download,
  SlidersHorizontal,
  ChevronDown,
  Trash2,
  CheckCircle,
  Building2,
  MapPin,
  Clock,
  Send,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Globe,
  Share2,
  X,
  UserCheck,
  Zap,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  FileText,
  Eye,
  Check,
  Calendar,
  DollarSign,
  User,
  Pencil,
  Shield,
  HelpCircle,
  RotateCcw,
  Paperclip
} from 'lucide-react';
import { useAppStore, getJobDetailUrl } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { Job, JobStatus, Priority, Applicant, Submission, JobNote, Interview } from '../../types';
import { EmailRichTextEditor } from '../../components/common/EmailRichTextEditor';

type BulkJobAction =
  | 'notes'
  | 'folder'
  | 'status'
  | 'macro'
  | 'bench-consultant'
  | 'priority'
  | 'rollover'
  | 'mail-merge-limit'
  | 'publish-campuses';

type SubmissionAction =
  | 'score'
  | 'note'
  | 'email'
  | 'submit-client'
  | 'group'
  | 'schedule-interview'
  | 'other-job'
  | 'task'
  | 'request-details';

interface SubmissionActionForm {
  score: string;
  note: string;
  recipients: string;
  subject: string;
  emailBody: string;
  group: string;
  date: string;
  time: string;
  interviewer: string;
  interviewType: Interview['type'];
  meetingLink: string;
  otherJobId: string;
  taskTitle: string;
  dueDate: string;
  requestMessage: string;
}

const SUBMISSION_ACTIONS: { id: SubmissionAction; label: string }[] = [
  { id: 'score', label: 'Submission Score' },
  { id: 'note', label: 'Add Note' },
  { id: 'email', label: 'Send Email' },
  { id: 'submit-client', label: 'Submit To Client' },
  { id: 'group', label: 'Add to Group' },
  { id: 'schedule-interview', label: 'Schedule Interview' },
  { id: 'other-job', label: 'Submit To Other Job' },
  { id: 'task', label: 'Add Task' },
  { id: 'request-details', label: 'Request More Details' }
];

const SUBMISSION_GROUPS = ['Shortlist', 'Priority Candidates', 'Client Review', 'Interview Pipeline'];

const JOB_STATUSES: JobStatus[] = ['Open', 'Active', 'Sourcing', 'In Review', 'Closed', 'On Hold'];
const JOB_PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];
const SUBMISSION_STATUSES = [
  'Submitted to Client',
  'Client Review',
  'Interview Requested',
  'Client Rejected',
  'Waiting for Evaluation by Internal Reviewer',
  'Internal Disqualified',
  'Placed',
  'Offered',
  'Not Joined',
  'Interview Scheduled'
];
const BULK_JOB_ACTIONS: { id: BulkJobAction; label: string }[] = [
  { id: 'notes', label: 'Add Notes' },
  { id: 'folder', label: 'Add to Folder' },
  { id: 'status', label: 'Change Status' },
  { id: 'macro', label: 'Macro' },
  { id: 'bench-consultant', label: 'Send Job to Bench Consultant' },
  { id: 'priority', label: 'Change Priority' },
  { id: 'rollover', label: 'Rollover' },
  { id: 'mail-merge-limit', label: 'Set Mail Merge Limit' },
  { id: 'publish-campuses', label: 'Publish to Campuses' }
];
const EMAIL_JOB_FIELDS = [
  'Job Title',
  'Job Code',
  'Client',
  'Location',
  'Job Type',
  'Status',
  'Priority',
  'Experience',
  'Skills',
  'Bill Rate'
];
const EMAIL_THEMES = [
  { id: 'plain', name: 'Plain', accent: '#64748B', background: '#FFFFFF' },
  { id: 'classic-blue', name: 'Classic Blue', accent: '#FF6B5E', background: '#F3F8FF' },
  { id: 'ocean', name: 'Ocean', accent: '#0E7490', background: '#ECFEFF' },
  { id: 'sunset', name: 'Sunset', accent: '#EA580C', background: '#FFF7ED' },
  { id: 'forest', name: 'Forest', accent: '#15803D', background: '#F0FDF4' },
  { id: 'rose', name: 'Rose', accent: '#BE123C', background: '#FFF1F2' },
  { id: 'amber', name: 'Amber', accent: '#B45309', background: '#FFFBEB' },
  { id: 'violet', name: 'Violet', accent: '#7C3AED', background: '#F5F3FF' },
  { id: 'slate', name: 'Slate', accent: '#4D4140', background: '#FFF0E8' },
  { id: 'teal', name: 'Teal', accent: '#0F766E', background: '#F0FDFA' }
];

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export type JobColumnKey =
  | 'code'
  | 'title'
  | 'businessUnit'
  | 'client'
  | 'clientJobId'
  | 'location'
  | 'states'
  | 'status'
  | 'jobStartDate'
  | 'jobEndDate'
  | 'rate'
  | 'recruitmentManager'
  | 'primaryRecruiter'
  | 'assignedTo'
  | 'createdBy'
  | 'createdDate'
  | 'modifiedDate'
  | 'clientPractice'
  | 'postJobCareerPortal'
  | 'experience'
  | 'hitQuota'
  | 'clientSubmissionTime1'
  | 'clientSubmissionTime2'
  | 'clientSubmissionTime3'
  | 'clearance'
  | 'comments'
  | 'degree'
  | 'respondBy'
  | 'address'
  | 'careerPortalPublishedDate'
  | 'industry'
  | 'tvop'
  | 'pwPublishedDate'
  | 'pwPublishedBy'
  | 'vmsName'
  | 'latestClientSubmissionDate'
  | 'latestClientSubmissionBy'
  | 'noticePeriod'
  | 'lastSubmissionOn'
  | 'appliersVisitors'
  | 'firstInterviewOn'
  | 'minSalary'
  | 'maxSalary'
  | 'avgSalary'
  | 'clientManager'
  | 'priority'
  | 'duration'
  | 'openings'
  | 'salesManager'
  | 'remoteJob'
  | 'jobAge'
  | 'maxSubmissions'
  | 'type'
  | 'firstSubmissionOn'
  | 'firstClientSubmissionOn'
  | 'modifiedBy'
  | 'primarySkills'
  | 'publishedOnJobBoard'
  | 'jobPublishedOn'
  | 'teamName'
  | 'accountManager'
  | 'referralBonus'
  | 'placementType'
  | 'geopoliticalZone'
  | 'secondarySalesManager'
  | 'secondaryRecruitmentManager'
  | 'isHotJob'
  | 'category'
  | 'activeJobAge'
  | 'facility'
  | 'customJobCategory'
  | 'customJobSkillType';

interface ColumnDef {
  key: JobColumnKey;
  label: string;
  minWidth: string;
  defaultVisible: boolean;
  group?: 'Custom Fields';
}

const ALL_COLUMNS: ColumnDef[] = [
  { key: 'code', label: 'Job Code', minWidth: 'min-w-[140px]', defaultVisible: true },
  { key: 'title', label: 'Job Title', minWidth: 'min-w-[260px]', defaultVisible: true },
  { key: 'businessUnit', label: 'Business Unit', minWidth: 'min-w-[170px]', defaultVisible: true },
  { key: 'client', label: 'Client', minWidth: 'min-w-[160px]', defaultVisible: true },
  { key: 'clientJobId', label: 'Client Job ID', minWidth: 'min-w-[140px]', defaultVisible: true },
  { key: 'location', label: 'Location', minWidth: 'min-w-[180px]', defaultVisible: true },
  { key: 'states', label: 'States', minWidth: 'min-w-[150px]', defaultVisible: true },
  { key: 'status', label: 'Job Status', minWidth: 'min-w-[130px]', defaultVisible: true },
  { key: 'jobStartDate', label: 'Job Start Date', minWidth: 'min-w-[150px]', defaultVisible: false },
  { key: 'jobEndDate', label: 'Job End Date', minWidth: 'min-w-[150px]', defaultVisible: false },
  { key: 'rate', label: 'Client Bill Rate / Salary', minWidth: 'min-w-[180px]', defaultVisible: true },
  { key: 'recruitmentManager', label: 'Recruitment Manager', minWidth: 'min-w-[170px]', defaultVisible: true },
  { key: 'primaryRecruiter', label: 'Primary Recruiter', minWidth: 'min-w-[160px]', defaultVisible: true },
  { key: 'assignedTo', label: 'Assigned To', minWidth: 'min-w-[160px]', defaultVisible: true },
  { key: 'createdBy', label: 'Job Posting Created By', minWidth: 'min-w-[180px]', defaultVisible: true },
  { key: 'createdDate', label: 'Job Created', minWidth: 'min-w-[160px]', defaultVisible: true },
  { key: 'modifiedDate', label: 'Job Modified On', minWidth: 'min-w-[160px]', defaultVisible: true },
  { key: 'clientPractice', label: 'Client Practice', minWidth: 'min-w-[160px]', defaultVisible: false },
  { key: 'postJobCareerPortal', label: 'Post Job on Career Portal', minWidth: 'min-w-[180px]', defaultVisible: false },
  { key: 'experience', label: 'Experience', minWidth: 'min-w-[140px]', defaultVisible: false },
  { key: 'hitQuota', label: 'Hit Quota', minWidth: 'min-w-[120px]', defaultVisible: false },
  { key: 'clientSubmissionTime1', label: '1st Client Sub. Time', minWidth: 'min-w-[170px]', defaultVisible: false },
  { key: 'clientSubmissionTime2', label: '2nd Client Sub. Time', minWidth: 'min-w-[170px]', defaultVisible: false },
  { key: 'clientSubmissionTime3', label: '3rd Client Sub. Time', minWidth: 'min-w-[170px]', defaultVisible: false },
  { key: 'clearance', label: 'Clearance', minWidth: 'min-w-[130px]', defaultVisible: false },
  { key: 'comments', label: 'Comments', minWidth: 'min-w-[220px]', defaultVisible: false },
  { key: 'degree', label: 'Degree', minWidth: 'min-w-[160px]', defaultVisible: false },
  { key: 'respondBy', label: 'Respond By', minWidth: 'min-w-[150px]', defaultVisible: false },
  { key: 'address', label: 'Address', minWidth: 'min-w-[220px]', defaultVisible: false },
  { key: 'careerPortalPublishedDate', label: 'Career Portal Published Date', minWidth: 'min-w-[190px]', defaultVisible: false },
  { key: 'industry', label: 'Industry', minWidth: 'min-w-[160px]', defaultVisible: false },
  { key: 'tvop', label: 'TVOP', minWidth: 'min-w-[120px]', defaultVisible: false },
  { key: 'pwPublishedDate', label: 'PW Published Date', minWidth: 'min-w-[170px]', defaultVisible: false },
  { key: 'pwPublishedBy', label: 'PW Published By', minWidth: 'min-w-[160px]', defaultVisible: false },
  { key: 'vmsName', label: 'VMS Name', minWidth: 'min-w-[140px]', defaultVisible: false },
  { key: 'latestClientSubmissionDate', label: 'Latest Client Submission on', minWidth: 'min-w-[190px]', defaultVisible: false },
  { key: 'latestClientSubmissionBy', label: 'Latest Client Submission by', minWidth: 'min-w-[190px]', defaultVisible: false },
  { key: 'noticePeriod', label: 'Notice Period', minWidth: 'min-w-[140px]', defaultVisible: false },
  { key: 'lastSubmissionOn', label: 'Last Submission on', minWidth: 'min-w-[170px]', defaultVisible: false },
  { key: 'appliersVisitors', label: 'Appliers/Visitors', minWidth: 'min-w-[160px]', defaultVisible: false },
  { key: 'firstInterviewOn', label: 'First Interview on', minWidth: 'min-w-[160px]', defaultVisible: false },
  { key: 'minSalary', label: 'Min Salary', minWidth: 'min-w-[130px]', defaultVisible: true },
  { key: 'maxSalary', label: 'Max Salary', minWidth: 'min-w-[130px]', defaultVisible: true },
  { key: 'avgSalary', label: 'Average Salary', minWidth: 'min-w-[150px]', defaultVisible: true },
  { key: 'clientManager', label: 'Client Manager', minWidth: 'min-w-[160px]', defaultVisible: false },
  { key: 'priority', label: 'Priority', minWidth: 'min-w-[120px]', defaultVisible: false },
  { key: 'duration', label: 'Duration', minWidth: 'min-w-[140px]', defaultVisible: false },
  { key: 'openings', label: 'Number of Positions', minWidth: 'min-w-[160px]', defaultVisible: false },
  { key: 'salesManager', label: 'Sales Manager', minWidth: 'min-w-[150px]', defaultVisible: false },
  { key: 'remoteJob', label: 'Remote Job', minWidth: 'min-w-[130px]', defaultVisible: false },
  { key: 'jobAge', label: 'Job Age', minWidth: 'min-w-[120px]', defaultVisible: false },
  { key: 'maxSubmissions', label: 'Maximum Allowed Submissions', minWidth: 'min-w-[210px]', defaultVisible: false },
  { key: 'type', label: 'Job Type', minWidth: 'min-w-[130px]', defaultVisible: false },
  { key: 'firstSubmissionOn', label: 'First Submission on', minWidth: 'min-w-[170px]', defaultVisible: false },
  { key: 'firstClientSubmissionOn', label: 'First Client Submission on', minWidth: 'min-w-[190px]', defaultVisible: false },
  { key: 'modifiedBy', label: 'Job Modified By', minWidth: 'min-w-[160px]', defaultVisible: false },
  { key: 'primarySkills', label: 'Primary Skills', minWidth: 'min-w-[220px]', defaultVisible: false },
  { key: 'publishedOnJobBoard', label: 'Published on Job Board', minWidth: 'min-w-[180px]', defaultVisible: false },
  { key: 'jobPublishedOn', label: 'Job Published on', minWidth: 'min-w-[160px]', defaultVisible: false },
  { key: 'teamName', label: 'Team Name', minWidth: 'min-w-[140px]', defaultVisible: false },
  { key: 'accountManager', label: 'Account Manager', minWidth: 'min-w-[160px]', defaultVisible: false },
  { key: 'referralBonus', label: 'Referral Bonus', minWidth: 'min-w-[140px]', defaultVisible: false },
  { key: 'placementType', label: 'Placement Type', minWidth: 'min-w-[150px]', defaultVisible: false },
  { key: 'geopoliticalZone', label: 'Geopolitical Zone', minWidth: 'min-w-[160px]', defaultVisible: false },
  { key: 'secondarySalesManager', label: 'Secondary Sales Manager', minWidth: 'min-w-[190px]', defaultVisible: false },
  { key: 'secondaryRecruitmentManager', label: 'Secondary Recruitment Manager', minWidth: 'min-w-[220px]', defaultVisible: false },
  { key: 'isHotJob', label: 'Is Hot Job', minWidth: 'min-w-[120px]', defaultVisible: false },
  { key: 'category', label: 'Job Category', minWidth: 'min-w-[160px]', defaultVisible: false },
  { key: 'activeJobAge', label: 'Active Job Age (Days)', minWidth: 'min-w-[180px]', defaultVisible: false },
  { key: 'facility', label: 'Facility', minWidth: 'min-w-[150px]', defaultVisible: false },
  { key: 'customJobCategory', label: 'Job Category', minWidth: 'min-w-[160px]', defaultVisible: false, group: 'Custom Fields' },
  { key: 'customJobSkillType', label: 'Job Skill Type', minWidth: 'min-w-[160px]', defaultVisible: false, group: 'Custom Fields' }
];

const DEFAULT_VISIBLE_COLUMNS = ALL_COLUMNS.filter((column) => column.defaultVisible).map((column) => column.key);

const formatColumnValue = (value: string | number | boolean | null | undefined): string => {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};

const getJobAgeInDays = (dateValue?: string): number | undefined => {
  if (!dateValue) return undefined;
  const timestamp = Date.parse(dateValue);
  if (!Number.isFinite(timestamp)) return undefined;
  return Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
};

const getJobColumnValue = (job: Job, key: JobColumnKey): string => {
  switch (key) {
    case 'code': return job.code || '';
    case 'title': return job.title || '';
    case 'businessUnit': return job.businessUnit || 'Ampcus Tech Pvt Ltd.';
    case 'client': return job.client || '—';
    case 'clientJobId': return job.clientJobId || '—';
    case 'location': return job.location || '—';
    case 'states': return job.states || '—';
    case 'status': return job.status || '—';
    case 'jobStartDate': return job.startDate || '—';
    case 'jobEndDate': return job.endDate || '—';
    case 'rate':
      return `${job.currency === 'INR' ? '₹' : '$'}${job.billRate} / ${job.rateType === 'Yearly' ? 'yr' : 'hr'}`;
    case 'recruitmentManager': return job.recruitmentManager || '—';
    case 'primaryRecruiter': return job.assignedRecruiter || job.assignedTo || '—';
    case 'assignedTo': return job.assignedTo || job.assignedRecruiter || '—';
    case 'createdBy': return job.createdBy || job.assignedRecruiter || '—';
    case 'createdDate': return job.createdDate || '—';
    case 'modifiedDate': return job.modifiedDate || '—';
    case 'clientPractice': return job.clientPractice || '—';
    case 'postJobCareerPortal': return formatColumnValue(job.postJobOnCareerPortal);
    case 'experience':
      return job.experienceRequired ||
        (job.minExperience !== undefined || job.maxExperience !== undefined
          ? `${job.minExperience ?? '—'} - ${job.maxExperience ?? '—'} years`
          : '—');
    case 'hitQuota': return formatColumnValue(job.hitQuota);
    case 'clientSubmissionTime1': return job.firstClientSubmissionTime || '—';
    case 'clientSubmissionTime2': return job.secondClientSubmissionTime || '—';
    case 'clientSubmissionTime3': return job.thirdClientSubmissionTime || '—';
    case 'clearance': return job.clearance || '—';
    case 'comments': return job.comments || '—';
    case 'degree': return job.degree || '—';
    case 'respondBy': return job.respondBy || '—';
    case 'address': return job.address || '—';
    case 'careerPortalPublishedDate': return job.careerPortalPublishedDate || '—';
    case 'industry': return job.industry || '—';
    case 'tvop': return job.tvop || '—';
    case 'pwPublishedDate': return job.pwPublishedDate || '—';
    case 'pwPublishedBy': return job.pwPublishedBy || '—';
    case 'vmsName': return job.vmsName || '—';
    case 'latestClientSubmissionDate': return job.latestClientSubmissionDate || '—';
    case 'latestClientSubmissionBy': return job.latestClientSubmissionBy || '—';
    case 'lastSubmissionOn': return job.lastSubmissionDate || '—';
    case 'appliersVisitors': {
      const appliers = job.appliersCount ?? job.applicantsCount;
      const visitors = job.visitorsCount;
      return appliers === undefined && visitors === undefined ? '—' : `${formatColumnValue(appliers)} / ${formatColumnValue(visitors)}`;
    }
    case 'firstInterviewOn': return job.firstInterviewDate || '—';
    case 'minSalary':
      return job.payRate ? `${job.currency === 'INR' ? '₹' : '$'}${job.payRate * 160 * 12}/yr` : '—';
    case 'maxSalary':
      return job.billRate ? `${job.currency === 'INR' ? '₹' : '$'}${job.billRate * 160 * 12}/yr` : '—';
    case 'avgSalary':
      return job.billRate && job.payRate
        ? `${job.currency === 'INR' ? '₹' : '$'}${Math.round(((job.billRate + job.payRate) / 2) * 160 * 12)}/yr`
        : '—';
    case 'clientManager': return job.clientManager || '—';
    case 'priority': return job.priority || 'Medium';
    case 'duration': return job.duration || '—';
    case 'salesManager': return job.salesManager || '—';
    case 'remoteJob': return job.remoteJob || '—';
    case 'jobAge': {
      const age = getJobAgeInDays(job.createdDate);
      return age === undefined ? '—' : `${age} days`;
    }
    case 'maxSubmissions': return formatColumnValue(job.maxSubmissions);
    case 'type': return job.type || 'Full-Time';
    case 'openings': return String(job.openings || 1);
    case 'firstSubmissionOn': return job.firstSubmissionDate || '—';
    case 'firstClientSubmissionOn': return job.firstClientSubmissionDate || '—';
    case 'modifiedBy': return job.modifiedBy || '—';
    case 'primarySkills': return (job.primarySkills?.length ? job.primarySkills : job.skills || []).join(', ') || '—';
    case 'publishedOnJobBoard': return formatColumnValue(job.publishedOnJobBoard);
    case 'jobPublishedOn': return job.jobPublishedOn || '—';
    case 'teamName': return job.teamName || '—';
    case 'accountManager': return job.accountManager || '—';
    case 'referralBonus': return formatColumnValue(job.referralBonus);
    case 'placementType': return job.placementType || '—';
    case 'geopoliticalZone': return job.geopoliticalZone || '—';
    case 'secondarySalesManager': return job.secondarySalesManager || '—';
    case 'secondaryRecruitmentManager': return job.secondaryRecruitmentManager || '—';
    case 'isHotJob': return formatColumnValue(job.isHotJob);
    case 'category': return job.category || '—';
    case 'activeJobAge': {
      if (job.status !== 'Active' && job.status !== 'Open') return '—';
      const age = getJobAgeInDays(job.createdDate);
      return age === undefined ? '—' : `${age} days`;
    }
    case 'facility': return job.facility || '—';
    case 'customJobCategory': return formatColumnValue(job.customFields?.['Job Category']);
    case 'customJobSkillType':
      return formatColumnValue(job.customFields?.['Job Skill Type'] ?? job.skillType);
    case 'noticePeriod': return job.noticePeriod || '—';
    default: return '—';
  }
};

export const JobList: React.FC = () => {
  const { navigate, currentRoute, currentUser } = useAppStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<Awaited<ReturnType<typeof ApiService.getAllUsers>>>([]);
  const [inlineEdit, setInlineEdit] = useState<{
    entity: 'job' | 'submission';
    id: string;
    field: 'status' | 'assignedRecruiter' | 'assignedTo' | 'score';
    value: string;
  } | null>(null);
  const [isSavingInlineEdit, setIsSavingInlineEdit] = useState(false);

  // Search & Global Filters
  const [search, setSearch] = useState('');
  const [searchScope, setSearchScope] = useState<string>('Search Any');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [businessUnitFilter, setBusinessUnitFilter] = useState<string>('All');

  // Column Filtering State (Each Column Name has its own filter dropdown)
  const [columnFilters, setColumnFilters] = useState<Partial<Record<JobColumnKey, string[]>>>({});
  const [activeFilterCol, setActiveFilterCol] = useState<JobColumnKey | null>(null);
  const [filterSearchQuery, setFilterSearchQuery] = useState('');
  const [tempSelectedValues, setTempSelectedValues] = useState<string[]>([]);
  const filterPopoverRef = useRef<HTMLDivElement>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<{ key: JobColumnKey; direction: 'asc' | 'desc' } | null>(null);

  // Expanded In-Line Submissions Rows (Ceipal Screenshot 202134)
  const [expandedJobIds, setExpandedJobIds] = useState<Set<string>>(new Set());
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);
  const [submissionAction, setSubmissionAction] = useState<SubmissionAction | null>(null);
  const [submissionActionTargetIds, setSubmissionActionTargetIds] = useState<string[]>([]);
  const [isApplyingSubmissionAction, setIsApplyingSubmissionAction] = useState(false);
  const [submissionActionForm, setSubmissionActionForm] = useState<SubmissionActionForm>({
    score: '',
    note: '',
    recipients: '',
    subject: '',
    emailBody: '',
    group: SUBMISSION_GROUPS[0],
    date: new Date().toISOString().slice(0, 10),
    time: '10:00',
    interviewer: '',
    interviewType: 'Technical Screen',
    meetingLink: '',
    otherJobId: '',
    taskTitle: '',
    dueDate: new Date().toISOString().slice(0, 10),
    requestMessage: ''
  });

  // Column Visibility Customization (Ceipal Screenshot 202359)
  const [visibleColumns, setVisibleColumns] = useState<JobColumnKey[]>(
    DEFAULT_VISIBLE_COLUMNS
  );
  const [pendingVisibleColumns, setPendingVisibleColumns] = useState<JobColumnKey[]>(DEFAULT_VISIBLE_COLUMNS);
  const [isColumnDrawerOpen, setIsColumnDrawerOpen] = useState(false);
  const [columnDrawerSearch, setColumnDrawerSearch] = useState('');

  // Row selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkJobAction | null>(null);
  const [bulkActionValue, setBulkActionValue] = useState('');
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Send Requirement modal
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedJobsForSend, setSelectedJobsForSend] = useState<Job[]>([]);
  const [fromEmail, setFromEmail] = useState('');
  const [replyToEmail, setReplyToEmail] = useState('');
  const [recipientEmails, setRecipientEmails] = useState('');
  const [additionalRecipients, setAdditionalRecipients] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailAttachments, setEmailAttachments] = useState<File[]>([]);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [emailSalutation, setEmailSalutation] = useState('');
  const [emailColumns, setEmailColumns] = useState<string[]>(['Job Title', 'Job Code', 'Location']);
  const [isEmailColumnsOpen, setIsEmailColumnsOpen] = useState(false);
  const [emailTheme, setEmailTheme] = useState('classic-blue');
  const [customEmailColor, setCustomEmailColor] = useState('#252525');
  const [isEmailThemeOpen, setIsEmailThemeOpen] = useState(false);
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [emailEditorResetKey, setEmailEditorResetKey] = useState(0);
  const sendIntentRef = useRef<'send' | 'schedule'>('send');

  // Close filter popover on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        filterPopoverRef.current &&
        !filterPopoverRef.current.contains(e.target as Node)
      ) {
        setActiveFilterCol(null);
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setIsBulkActionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchScopes = [
    'Search Any',
    'Job Code',
    'Job Title',
    'Client',
    'Client Job ID',
    'Location',
    'States',
    'Job Status',
    'Assigned To',
    'Sales Manager',
    'Job Type',
    'Account Manager'
  ];

  useEffect(() => {
    ApiService.getJobs().then(setJobs);
    ApiService.getApplicants().then(setApplicants);
    ApiService.getSubmissions().then(setSubmissions);
    ApiService.getAllUsers().then(setUsers);
  }, [currentRoute]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const saveInlineEdit = async () => {
    if (!inlineEdit || isSavingInlineEdit) return;
    setIsSavingInlineEdit(true);
    try {
      if (inlineEdit.entity === 'job') {
        const selectedRecruiter = users.find((user) => user.name === inlineEdit.value);
        const updates: Partial<Job> =
          inlineEdit.field === 'status'
            ? { status: inlineEdit.value as JobStatus }
            : inlineEdit.field === 'assignedRecruiter'
              ? { assignedRecruiter: inlineEdit.value, ...(selectedRecruiter ? { recruiterId: selectedRecruiter.id } : {}) }
              : { assignedTo: inlineEdit.value };
        const updatedJob = await ApiService.updateJob(inlineEdit.id, {
          ...updates,
          modifiedDate: new Date().toISOString().slice(0, 10),
          modifiedBy: currentUser?.name
        });
        setJobs((currentJobs) => currentJobs.map((job) => job.id === updatedJob.id ? updatedJob : job));
      } else if (inlineEdit.field === 'status') {
        const updatedSubmission = await ApiService.updateSubmissionStatus(inlineEdit.id, inlineEdit.value);
        if (!updatedSubmission) throw new Error('Submission not found.');
        setSubmissions((currentSubmissions) =>
          currentSubmissions.map((submission) => submission.id === updatedSubmission.id ? updatedSubmission : submission)
        );
      } else if (inlineEdit.field === 'score') {
        const updatedSubmission = await ApiService.updateSubmissionScore(inlineEdit.id, Number(inlineEdit.value));
        setSubmissions((currentSubmissions) =>
          currentSubmissions.map((submission) => submission.id === updatedSubmission.id ? updatedSubmission : submission)
        );
      }
      showToast('Changes saved.');
      setInlineEdit(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to save changes.');
    } finally {
      setIsSavingInlineEdit(false);
    }
  };

  const openColumnDrawer = () => {
    setPendingVisibleColumns(visibleColumns);
    setColumnDrawerSearch('');
    setIsColumnDrawerOpen(true);
  };

  const applyVisibleColumns = () => {
    setVisibleColumns(pendingVisibleColumns);
    setIsColumnDrawerOpen(false);
  };

  // Distinct values for each column (for filter checkboxes)
  const getUniqueValuesForCol = (key: JobColumnKey): string[] => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      const v = getJobColumnValue(j, key).trim();
      if (v && v !== '—') set.add(v);
    });
    return Array.from(set).sort();
  };

  // Open filter popover for column
  const openColumnFilter = (colKey: JobColumnKey, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeFilterCol === colKey) {
      setActiveFilterCol(null);
    } else {
      setActiveFilterCol(colKey);
      setFilterSearchQuery('');
      setTempSelectedValues(columnFilters[colKey] || getUniqueValuesForCol(colKey));
    }
  };

  // Apply column filter
  const applyColumnFilter = (colKey: JobColumnKey) => {
    setColumnFilters((prev) => ({
      ...prev,
      [colKey]: tempSelectedValues
    }));
    setActiveFilterCol(null);
    showToast(`Filter applied on ${ALL_COLUMNS.find((c) => c.key === colKey)?.label}`);
  };

  // Reset single column filter
  const resetColumnFilter = (colKey: JobColumnKey) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      delete next[colKey];
      return next;
    });
    setActiveFilterCol(null);
  };

  // Reset all filters
  const resetAllFilters = () => {
    setColumnFilters({});
    setSearch('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setBusinessUnitFilter('All');
    setSortBy(null);
    showToast('All filters have been reset');
  };

  // Filtered & Sorted Jobs
  const filteredJobs = useMemo(() => {
    const result = jobs.filter((j) => {
      const q = search.trim().toLowerCase();
      let matchesSearch = true;

      if (q) {
        if (searchScope === 'Job Code') {
          matchesSearch = j.code.toLowerCase().includes(q);
        } else if (searchScope === 'Job Title') {
          matchesSearch = j.title.toLowerCase().includes(q);
        } else if (searchScope === 'Client') {
          matchesSearch = j.client.toLowerCase().includes(q);
        } else if (searchScope === 'Client Job ID') {
          matchesSearch = (j.clientJobId || '').toLowerCase().includes(q);
        } else if (searchScope === 'Location') {
          matchesSearch = j.location.toLowerCase().includes(q);
        } else if (searchScope === 'States') {
          matchesSearch = (j.states || '').toLowerCase().includes(q);
        } else if (searchScope === 'Job Status') {
          matchesSearch = j.status.toLowerCase().includes(q);
        } else if (searchScope === 'Assigned To') {
          matchesSearch = (j.assignedTo || j.assignedRecruiter || '').toLowerCase().includes(q);
        } else {
          matchesSearch =
            j.title.toLowerCase().includes(q) ||
            j.code.toLowerCase().includes(q) ||
            j.client.toLowerCase().includes(q) ||
            (j.clientJobId || '').toLowerCase().includes(q) ||
            (j.businessUnit || '').toLowerCase().includes(q) ||
            (j.states || '').toLowerCase().includes(q) ||
            j.location.toLowerCase().includes(q) ||
            (j.skills || []).some((s) => s.toLowerCase().includes(q));
        }
      }

      const matchesStatus = statusFilter === 'All' || j.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || j.priority === priorityFilter;
      const matchesUnit = businessUnitFilter === 'All' || (j.businessUnit || '').includes(businessUnitFilter);

      // Check per-column filters
      const matchesColumnFilters = Object.entries(columnFilters).every(([col, allowedValues]) => {
        if (!allowedValues || allowedValues.length === 0) return true;
        const val = getJobColumnValue(j, col as JobColumnKey).trim();
        return allowedValues.includes(val);
      });

      return matchesSearch && matchesStatus && matchesPriority && matchesUnit && matchesColumnFilters;
    });

    if (sortBy) {
      result.sort((a, b) => {
        const valA = getJobColumnValue(a, sortBy.key);
        const valB = getJobColumnValue(b, sortBy.key);
        const cmp = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
        return sortBy.direction === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [jobs, search, searchScope, statusFilter, priorityFilter, businessUnitFilter, columnFilters, sortBy]);

  const activeFiltersCount = Object.keys(columnFilters).length +
    (statusFilter !== 'All' ? 1 : 0) +
    (priorityFilter !== 'All' ? 1 : 0) +
    (businessUnitFilter !== 'All' ? 1 : 0) +
    (search ? 1 : 0);

  // Toggle row expansion for inline submissions
  const toggleRowExpansion = (jobId: string) => {
    if (expandedJobIds.has(jobId)) {
      setExpandedJobIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
      const jobSubmissionIds = submissions.filter((submission) => submission.jobId === jobId).map((submission) => submission.id);
      setSelectedSubmissionIds((prev) => prev.filter((id) => !jobSubmissionIds.includes(id)));
      setSubmissionAction(null);
      return;
    }

    setExpandedJobIds((prev) => new Set(prev).add(jobId));
  };

  const toggleSubmissionSelection = (submissionId: string) => {
    setSelectedSubmissionIds((prev) =>
      prev.includes(submissionId) ? prev.filter((id) => id !== submissionId) : [...prev, submissionId]
    );
  };

  const openSubmissionAction = (action: SubmissionAction, selectedRows: Submission[], job: Job) => {
    const firstSubmission = selectedRows[0];
    if (!firstSubmission) return;
    const firstApplicant = applicants.find((applicant) => applicant.id === firstSubmission.applicantId);
    const today = new Date().toISOString().slice(0, 10);
    const otherJob = jobs.find((candidateJob) => candidateJob.id !== job.id);

    setSubmissionActionTargetIds(selectedRows.map((submission) => submission.id));
    setSubmissionActionForm({
      score: String(firstSubmission.score ?? firstApplicant?.matchScore ?? 0),
      note: '',
      recipients: selectedRows
        .map((submission) => applicants.find((applicant) => applicant.id === submission.applicantId)?.email)
        .filter((email): email is string => Boolean(email))
        .join(', '),
      subject: `Candidate submission: ${firstSubmission.applicantName}`,
      emailBody: `Hello,\n\nPlease review the selected candidate submission for ${job.title}.\n\nRegards,\n${currentUser?.name || 'NexusTalent'}`,
      group: firstSubmission.groups?.[0] || SUBMISSION_GROUPS[0],
      date: today,
      time: '10:00',
      interviewer: job.clientManager || 'Hiring Manager',
      interviewType: 'Technical Screen',
      meetingLink: '',
      otherJobId: otherJob?.id || '',
      taskTitle: `Follow up with ${firstSubmission.applicantName} for ${job.title}`,
      dueDate: today,
      requestMessage: ''
    });
    setSubmissionAction(action);
  };

  const applySubmissionAction = async (event: React.FormEvent) => {
    event.preventDefault();
    const targets = submissions.filter((submission) => submissionActionTargetIds.includes(submission.id));
    if (!submissionAction || targets.length === 0) {
      showToast('Select at least one submission before choosing an action.');
      return;
    }

    setIsApplyingSubmissionAction(true);
    try {
      switch (submissionAction) {
        case 'score':
          for (const submission of targets) {
            await ApiService.updateSubmissionScore(submission.id, Number(submissionActionForm.score));
          }
          setSubmissions(await ApiService.getSubmissions());
          showToast(`Submission score saved for ${targets.length} candidate${targets.length === 1 ? '' : 's'}.`);
          break;
        case 'note':
          for (const submission of targets) {
            await ApiService.addSubmissionNote(submission.id, {
              id: `note-${Date.now()}-${submission.id}`,
              author: currentUser?.name || 'Recruiter',
              text: submissionActionForm.note.trim(),
              date: new Date().toLocaleString()
            });
          }
          setSubmissions(await ApiService.getSubmissions());
          showToast(`Note added to ${targets.length} submission${targets.length === 1 ? '' : 's'}.`);
          break;
        case 'email': {
          const mailto = `mailto:${encodeURIComponent(submissionActionForm.recipients)}?subject=${encodeURIComponent(submissionActionForm.subject)}&body=${encodeURIComponent(submissionActionForm.emailBody)}`;
          window.location.href = mailto;
          showToast('Email draft opened. NexusTalent does not send emails directly.');
          break;
        }
        case 'submit-client':
          for (const submission of targets) {
            const updated = await ApiService.updateSubmissionStatus(submission.id, 'Submitted to Client');
            if (!updated) throw new Error(`Submission ${submission.submissionId} could not be found.`);
          }
          setSubmissions(await ApiService.getSubmissions());
          showToast(`${targets.length} submission${targets.length === 1 ? '' : 's'} marked as submitted to client.`);
          break;
        case 'group':
          for (const submission of targets) {
            await ApiService.addSubmissionToGroup(submission.id, submissionActionForm.group);
          }
          setSubmissions(await ApiService.getSubmissions());
          showToast(`${targets.length} submission${targets.length === 1 ? '' : 's'} added to ${submissionActionForm.group}.`);
          break;
        case 'schedule-interview':
          for (const submission of targets) {
            await ApiService.scheduleInterview({
              applicantId: submission.applicantId,
              applicantName: submission.applicantName,
              jobId: submission.jobId,
              jobTitle: submission.jobTitle,
              client: submission.client,
              interviewer: submissionActionForm.interviewer.trim(),
              date: submissionActionForm.date,
              time: submissionActionForm.time,
              type: submissionActionForm.interviewType,
              status: 'Scheduled',
              meetingLink: submissionActionForm.meetingLink.trim()
            });
          }
          showToast(`Interview scheduled for ${targets.length} candidate${targets.length === 1 ? '' : 's'}.`);
          break;
        case 'other-job': {
          const targetJob = jobs.find((job) => job.id === submissionActionForm.otherJobId);
          if (!targetJob) throw new Error('Choose a valid job for the submission.');
          for (const submission of targets) {
            await ApiService.createSubmission({
              applicantId: submission.applicantId,
              applicantName: submission.applicantName,
              jobId: targetJob.id,
              jobTitle: targetJob.title,
              client: targetJob.client,
              recruiter: currentUser?.name || submission.recruiter,
              billRate: targetJob.billRate,
              payRate: targetJob.payRate,
              status: 'Waiting for Evaluation by Internal Reviewer',
              approvalStatus: 'Pending Review'
            });
          }
          setSubmissions(await ApiService.getSubmissions());
          showToast(`${targets.length} candidate${targets.length === 1 ? '' : 's'} submitted to ${targetJob.title}.`);
          break;
        }
        case 'task':
          for (const submission of targets) {
            await ApiService.createTask({
              title: submissionActionForm.taskTitle.trim() || `Follow up with ${submission.applicantName}`,
              dueDate: submissionActionForm.dueDate,
              priority: 'Medium',
              assignedTo: currentUser?.name || submission.recruiter,
              status: 'Pending',
              category: 'Client Review'
            });
          }
          showToast(`Task added for ${targets.length} selected submission${targets.length === 1 ? '' : 's'}.`);
          break;
        case 'request-details':
          for (const submission of targets) {
            const updated = await ApiService.updateSubmissionStatus(
              submission.id,
              'Request More Details',
              submissionActionForm.requestMessage.trim()
            );
            if (!updated) throw new Error(`Submission ${submission.submissionId} could not be found.`);
          }
          setSubmissions(await ApiService.getSubmissions());
          showToast(`More details requested for ${targets.length} submission${targets.length === 1 ? '' : 's'}.`);
          break;
      }

      setSelectedSubmissionIds((prev) => prev.filter((id) => !submissionActionTargetIds.includes(id)));
      setSubmissionAction(null);
      setSubmissionActionTargetIds([]);
    } catch (error) {
      console.error(`Unable to apply submission action "${submissionAction}":`, error);
      showToast(error instanceof Error ? error.message : 'Unable to apply the selected submission action.');
    } finally {
      setIsApplyingSubmissionAction(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredJobs.map((j) => j.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openBulkJobAction = (action: BulkJobAction) => {
    setBulkAction(action);
    setBulkActionValue(
      action === 'status' ? 'Active' :
      action === 'priority' ? 'High' :
      action === 'macro' ? 'Set Active' : ''
    );
    setIsBulkActionsOpen(false);
  };

  const applyBulkJobAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkAction || !bulkActionValue.trim()) return;

    const jobsToUpdate = jobs.filter((job) => selectedIds.includes(job.id));
    const updatedJobs: Job[] = [];

    try {
      for (const job of jobsToUpdate) {
        let updates: Partial<Job>;
        switch (bulkAction) {
          case 'notes': {
            const note: JobNote = {
              id: `note-${Date.now()}-${job.id}`,
              author: currentUser?.name || 'Current User',
              text: bulkActionValue.trim(),
              date: new Date().toISOString().split('T')[0],
              category: 'Job Posting'
            };
            updates = { notes: [...(job.notes || []), note] };
            break;
          }
          case 'folder':
            updates = { folder: bulkActionValue.trim() };
            break;
          case 'status':
            updates = { status: bulkActionValue as JobStatus };
            break;
          case 'macro':
            updates = bulkActionValue === 'Set Active'
              ? { status: 'Active' }
              : bulkActionValue === 'Mark High Priority'
                ? { priority: 'High' }
                : { status: 'Closed' };
            break;
          case 'bench-consultant':
            updates = { benchConsultant: bulkActionValue.trim(), assignedTo: bulkActionValue.trim() };
            break;
          case 'priority':
            updates = { priority: bulkActionValue as Priority };
            break;
          case 'rollover':
            updates = { status: 'Active', endDate: bulkActionValue };
            break;
          case 'mail-merge-limit': {
            const limit = Number(bulkActionValue);
            if (!Number.isInteger(limit) || limit < 0) {
              showToast('Enter a whole number of 0 or greater for the mail merge limit.');
              return;
            }
            updates = { mailMergeLimit: limit };
            break;
          }
          case 'publish-campuses': {
            const campuses = bulkActionValue.split(',').map((campus) => campus.trim()).filter(Boolean);
            if (campuses.length === 0) {
              showToast('Enter at least one campus to publish to.');
              return;
            }
            updates = { publishedCampuses: campuses, postJobOnCareerPortal: true };
            break;
          }
        }
        updatedJobs.push(await ApiService.updateJob(job.id, updates));
      }

      const updatedById = new Map(updatedJobs.map((job) => [job.id, job]));
      setJobs((currentJobs) => currentJobs.map((job) => updatedById.get(job.id) || job));
      setSelectedIds([]);
      setBulkAction(null);
      setBulkActionValue('');
      showToast(`${BULK_JOB_ACTIONS.find((action) => action.id === bulkAction)?.label} applied to ${updatedJobs.length} job${updatedJobs.length === 1 ? '' : 's'}.`);
    } catch (error) {
      console.error('Failed to apply bulk job action:', error);
      const updatedById = new Map(updatedJobs.map((job) => [job.id, job]));
      setJobs((currentJobs) => currentJobs.map((job) => updatedById.get(job.id) || job));
      const message = error instanceof Error ? error.message : 'Unknown error';
      showToast(`Action applied to ${updatedJobs.length} of ${jobsToUpdate.length} jobs. ${message}`);
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Job Code,Job Title,Business Unit,Client,Client Job ID,Location,States,Status,Priority,Bill Rate,Assigned Recruiter']
        .concat(
          filteredJobs.map(
            (j) =>
              `"${j.code}","${j.title}","${j.businessUnit || ''}","${j.client}","${j.clientJobId || ''}","${j.location}","${j.states || ''}","${j.status}","${j.priority}","${j.billRate}","${j.assignedRecruiter || j.assignedTo || ''}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ceipal_JobPostings_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredJobs.length} job postings to CSV.`);
  };

  const openSendModal = (job?: Job) => {
    const jobsToSend = job
      ? [job]
      : selectedIds.length > 0
        ? jobs.filter((item) => selectedIds.includes(item.id))
        : filteredJobs.slice(0, 1);
    if (jobsToSend.length === 0) {
      showToast('Select at least one job to send.');
      return;
    }

    const sender = currentUser?.email || 'recruiting@ampcus.com';
    setSelectedJobsForSend(jobsToSend);
    setFromEmail(sender);
    setReplyToEmail(sender);
    setRecipientEmails('');
    setAdditionalRecipients('');
    setEmailSubject(
      jobsToSend.length === 1
        ? `Job Requirement: ${jobsToSend[0].title}`
        : `Job Requirements: ${jobsToSend.length} positions`
    );
    setEmailBody('<p>Hi [FirstName]</p><p>Please review the job requirement details below.</p>');
    setEmailEditorResetKey((key) => key + 1);
    setEmailAttachments([]);
    setEmailTemplate('');
    setEmailSalutation('Hi [FirstName]');
    setEmailColumns(['Job Title', 'Job Code', 'Location']);
    setEmailTheme('classic-blue');
    setIsEmailColumnsOpen(false);
    setIsEmailThemeOpen(false);
    setIsScheduleMode(false);
    setScheduleDateTime('');
    sendIntentRef.current = 'send';
    setIsSendModalOpen(true);
  };

  const closeSendModal = () => {
    setIsSendModalOpen(false);
    setSelectedJobsForSend([]);
    setRecipientEmails('');
    setAdditionalRecipients('');
    setEmailAttachments([]);
    setIsScheduleMode(false);
  };

  const getEmailFieldValue = (job: Job, field: string): string => {
    switch (field) {
      case 'Job Title': return job.title;
      case 'Job Code': return job.code;
      case 'Client': return job.client;
      case 'Location': return job.location;
      case 'Job Type': return job.type;
      case 'Status': return job.status;
      case 'Priority': return job.priority;
      case 'Experience': return job.experienceRequired;
      case 'Skills': return job.skills.join(', ');
      case 'Bill Rate': return `${job.currency === 'INR' ? '₹' : '$'}${job.billRate} / ${job.rateType === 'Yearly' ? 'yr' : 'hr'}`;
      default: return '';
    }
  };

  const insertJobPositions = () => {
    if (emailColumns.length === 0) {
      showToast('Select at least one job detail column to add positions.');
      return;
    }
    const positionDetails = selectedJobsForSend.map((job) => (
      `<div><h3>${escapeHtml(job.title)}</h3><ul>${emailColumns.map((field) =>
        `<li><strong>${escapeHtml(field)}:</strong> ${escapeHtml(getEmailFieldValue(job, field))}</li>`
      ).join('')}</ul></div>`
    )).join('');
    setEmailBody((current) => `${current}<p><br></p>${positionDetails}`);
    setEmailEditorResetKey((key) => key + 1);
  };

  const handleTemplateChange = (template: string) => {
    setEmailTemplate(template);
    if (template === 'Standard Requirement') {
      setEmailSubject(`Job Requirement: ${selectedJobsForSend.map((job) => job.title).join(', ')}`);
      setEmailBody(`<p>${escapeHtml(emailSalutation)}</p><p>Please review the job requirement details below.</p>`);
    } else if (template === 'Urgent Requirement') {
      setEmailSubject(`Urgent Job Requirement: ${selectedJobsForSend.map((job) => job.title).join(', ')}`);
      setEmailBody(`<p>${escapeHtml(emailSalutation)}</p><p>We have an urgent requirement and would appreciate your prompt review.</p>`);
    } else if (template === 'Contract Position') {
      setEmailSubject(`Contract Opportunity: ${selectedJobsForSend.map((job) => job.title).join(', ')}`);
      setEmailBody(`<p>${escapeHtml(emailSalutation)}</p><p>Please review this contract opportunity and share qualified candidates.</p>`);
    }
    setEmailEditorResetKey((key) => key + 1);
  };

  const finishSendRequirement = (scheduled: boolean) => {
    const recipients = `${recipientEmails},${additionalRecipients}`
      .split(/[;,]/)
      .map((email) => email.trim())
      .filter(Boolean);
    if (recipients.length === 0) {
      showToast('Add at least one recipient email address.');
      return;
    }
    const invalidEmail = recipients.find((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    if (invalidEmail) {
      showToast(`Enter a valid email address: ${invalidEmail}`);
      return;
    }
    if (scheduled) {
      const scheduledTime = new Date(scheduleDateTime).getTime();
      if (!scheduleDateTime || !Number.isFinite(scheduledTime) || scheduledTime <= Date.now()) {
        showToast('Choose a future date and time to schedule this requirement.');
        return;
      }
    }

    const deliveryNotice = 'Email delivery is not connected in this app.';
    showToast(
      scheduled
        ? `Schedule details prepared for ${new Date(scheduleDateTime).toLocaleString()}. ${deliveryNotice}`
        : `Requirement email prepared for ${recipients.length} recipient${recipients.length === 1 ? '' : 's'}. ${deliveryNotice}`
    );
    closeSendModal();
  };

  const handleSendRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    const scheduled = sendIntentRef.current === 'schedule';
    sendIntentRef.current = 'send';
    finishSendRequirement(scheduled);
  };

  const handleScheduleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isScheduleMode) {
      e.preventDefault();
      setIsScheduleMode(true);
      return;
    }
    sendIntentRef.current = 'schedule';
  };

  // Click on job to open in new tab
  const handleJobClick = (e: React.MouseEvent, jobId: string) => {
    if (!e.ctrlKey && !e.metaKey && e.button !== 1) {
      e.preventDefault();
      window.open(getJobDetailUrl(jobId), '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#FF6B5E] text-white border border-[#FF6B5E] px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#8AC9A7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Ceipal Top Tab Views & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-[#252525] dark:text-white">
              Job Posting
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF0E8] dark:bg-[#48403E] text-[#252525] dark:text-[#FFF0E8] border border-[#FF6B5E]/20">
              {filteredJobs.length} Requisitions
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-[#806B66] dark:text-[#FFD7C9] bg-white dark:bg-[#252525] px-2 py-0.5 rounded-md border border-[#E8C8BE] dark:border-[#3D3634]">
              <span>💡 Click any job to open in a new tab</span>
            </span>
          </div>
          <p className="text-xs text-[#806B66] dark:text-[#FFD7C9] mt-0.5">
            Full enterprise requisition pipeline with multi-column filtering, expandable candidate submissions, and dual scrollbars
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Column Chooser Button */}
          <button
            onClick={openColumnDrawer}
            className="px-3 py-1.5 bg-white dark:bg-[#252525] border border-[#E8C8BE] dark:border-[#3D3634] hover:bg-[#FFF0E8] hover:text-[#252525] rounded-xl text-xs font-semibold text-[#252525] dark:text-[#FFF0E8] transition-colors flex items-center gap-1.5 shadow-xs"
            title="Edit displayed columns"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#252525]" />
            <span>Columns ({visibleColumns.length})</span>
          </button>

          {/* Send Requirement */}
          <button
            onClick={() => openSendModal()}
            className="px-3 py-1.5 bg-white dark:bg-[#252525] border border-[#E8C8BE] dark:border-[#3D3634] hover:bg-[#FFF0E8] hover:text-[#252525] rounded-xl text-xs font-semibold text-[#252525] dark:text-[#FFF0E8] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5 text-[#252525]" />
            <span>Send Requirement</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-white dark:bg-[#252525] border border-[#E8C8BE] dark:border-[#3D3634] hover:bg-[#FFF0E8] rounded-xl text-xs font-semibold text-[#252525] dark:text-[#FFF0E8] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#806B66]" />
            <span>Export CSV</span>
          </button>

          {/* + New Job Posting */}
          <button
            onClick={() => navigate('job-new')}
            className="px-4 py-1.5 bg-[#FF6B5E] hover:bg-[#E85249] text-white rounded-xl text-xs font-bold shadow-xs shadow-[#FF6B5E]/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ New</span>
          </button>
        </div>
      </div>

      {/* Ceipal Quick View Sub-Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs border-b border-[#E8C8BE] dark:border-[#3D3634]">
        <button
          onClick={() => { setStatusFilter('All'); setPriorityFilter('All'); }}
          className={`px-3 py-1.5 font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 ${
            statusFilter === 'All' && priorityFilter === 'All'
              ? 'text-[#252525] border-[#FF6B5E] bg-[#FFF0E8]/60 dark:bg-[#48403E]/50'
              : 'text-[#806B66] dark:text-[#FFD7C9] border-transparent hover:text-[#252525] dark:hover:text-white'
          }`}
        >
          <span>All Jobs</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white dark:bg-[#252525] text-[#252525] border border-[#E8C8BE] font-mono">
            {jobs.length}
          </span>
        </button>

        <button
          onClick={() => { setStatusFilter('Active'); setPriorityFilter('All'); }}
          className={`px-3 py-1.5 font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 ${
            statusFilter === 'Active'
              ? 'text-[#252525] border-[#FF6B5E] bg-[#FFF0E8]/60 dark:bg-[#48403E]/50'
              : 'text-[#806B66] dark:text-[#FFD7C9] border-transparent hover:text-[#252525] dark:hover:text-white'
          }`}
        >
          <span>Active Postings</span>
          <span className="w-2 h-2 rounded-full bg-[#8AC9A7]"></span>
        </button>

        <button
          onClick={() => { setStatusFilter('Open'); }}
          className={`px-3 py-1.5 font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 ${
            statusFilter === 'Open'
              ? 'text-[#252525] border-[#FF6B5E] bg-[#FFF0E8]/60'
              : 'text-[#806B66] dark:text-[#FFD7C9] border-transparent hover:text-[#252525] dark:hover:text-white'
          }`}
        >
          <span>Open Sourcing</span>
        </button>

        <div className="ml-auto flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={resetAllFilters}
              className="text-xs text-[#E05252] hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Ceipal Filter and Specialized Search Bar */}
      <div className="p-3 bg-white dark:bg-[#252525] border border-[#E8C8BE] dark:border-[#3D3634] rounded-2xl shadow-xs space-y-2">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar with Integrated Scope Dropdown */}
          <div className="flex items-center flex-1 max-w-xl bg-[#FFF0E8] dark:bg-[#48403E] border border-[#E8C8BE] dark:border-[#3D3634] rounded-xl overflow-hidden focus-within:border-[#FF6B5E] transition-colors">
            <div className="relative border-r border-[#E8C8BE] dark:border-[#3D3634]">
              <select
                value={searchScope}
                onChange={(e) => setSearchScope(e.target.value)}
                aria-label="Search Scope"
                className="appearance-none bg-transparent pl-3 pr-7 py-2 text-xs font-semibold text-[#252525] dark:text-[#FFF0E8] focus:outline-none cursor-pointer"
              >
                {searchScopes.map((scope) => (
                  <option key={scope} value={scope} className="bg-white dark:bg-[#252525]">
                    {scope}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-[#806B66] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search across ${searchScope.toLowerCase()}...`}
                className="w-full pl-3 pr-8 py-2 bg-transparent text-xs text-[#252525] dark:text-[#FFF0E8] focus:outline-none placeholder-[#806B66]"
              />
              {search ? (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 text-[#806B66] hover:text-[#252525] dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Search className="w-3.5 h-3.5 text-[#806B66] absolute right-2.5 pointer-events-none" />
              )}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Status Filter"
              className="bg-[#FFF0E8] dark:bg-[#48403E] border border-[#E8C8BE] dark:border-[#3D3634] rounded-xl px-2.5 py-1.5 text-xs text-[#252525] dark:text-[#FFF0E8] focus:outline-none focus:border-[#FF6B5E]"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Open">Open</option>
              <option value="Sourcing">Sourcing</option>
              <option value="In Review">In Review</option>
              <option value="Closed">Closed</option>
              <option value="On Hold">On Hold</option>
            </select>

            {/* Business Unit */}
            <select
              value={businessUnitFilter}
              onChange={(e) => setBusinessUnitFilter(e.target.value)}
              aria-label="Unit Filter"
              className="bg-[#FFF0E8] dark:bg-[#48403E] border border-[#E8C8BE] dark:border-[#3D3634] rounded-xl px-2.5 py-1.5 text-xs text-[#252525] dark:text-[#FFF0E8] focus:outline-none focus:border-[#FF6B5E]"
            >
              <option value="All">All Units</option>
              <option value="Ampcus Tech Pvt Ltd">Ampcus Tech Pvt Ltd</option>
              <option value="Core Engineering">Core Engineering</option>
              <option value="Cloud & AI Practice">Cloud & AI Practice</option>
            </select>
          </div>
        </div>

        {/* Active Column Filters Tags Bar */}
        {Object.keys(columnFilters).length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#E8C8BE] dark:border-[#3D3634]">
            <span className="text-[11px] font-semibold text-[#806B66] dark:text-[#FFD7C9]">
              Filtered by:
            </span>
            {Object.entries(columnFilters).map(([key, vals]) => {
              const colLabel = ALL_COLUMNS.find((c) => c.key === key)?.label || key;
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] bg-[#FFF0E8] dark:bg-[#48403E] text-[#252525] dark:text-[#FFF0E8] border border-[#FF6B5E]/30"
                >
                  <strong>{colLabel}:</strong> {vals && vals.length === 1 ? vals[0] : `${vals?.length || 0} values`}
                  <button
                    onClick={() => resetColumnFilter(key as JobColumnKey)}
                    className="hover:text-[#E05252]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
            <button
              onClick={() => setColumnFilters({})}
              className="text-[11px] text-[#252525] hover:underline"
            >
              Clear column filters
            </button>
          </div>
        )}
      </div>

      {/* Horizontal & Vertical Scroll Hint */}
      <div className="flex items-center justify-between text-[11px] text-[#806B66] px-1">
        <span className="flex items-center gap-1">
          <ArrowUpDown className="w-3 h-3 text-[#252525]" />
          <span>Scroll table vertically and horizontally to inspect all requisition fields</span>
        </span>
        <span className="font-mono">
          Showing {filteredJobs.length} of {jobs.length} postings
        </span>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="relative" ref={actionMenuRef}>
            <button
              type="button"
              onClick={() => setIsBulkActionsOpen((open) => !open)}
              aria-expanded={isBulkActionsOpen}
              className="inline-flex items-center gap-2 rounded-md bg-[#FF6B5E] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#E85249]"
            >
              ACTIONS
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isBulkActionsOpen ? 'rotate-180' : ''}`} />
            </button>
            {isBulkActionsOpen && (
              <div className="absolute left-0 top-full z-40 mt-1 grid w-[min(32rem,90vw)] grid-cols-1 gap-1 rounded-xl border border-[#E8C8BE] bg-white p-2 shadow-xl dark:border-[#3D3634] dark:bg-[#252525] sm:grid-cols-2">
                {BULK_JOB_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => openBulkJobAction(action.id)}
                    className="rounded-lg px-3 py-2 text-left text-xs font-medium text-[#465466] transition-colors hover:bg-[#FFF0E8] hover:text-[#252525] dark:text-[#FFF0E8] dark:hover:bg-[#48403E]"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="text-xs font-medium text-[#806B66] dark:text-[#FFD7C9]">
            {selectedIds.length} job{selectedIds.length === 1 ? '' : 's'} selected
          </span>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="text-xs font-semibold text-[#252525] hover:underline"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Ceipal-Style High Density Data Grid with DUAL Scrollbars */}
      <div className="bg-white dark:bg-[#252525] border border-[#E8C8BE] dark:border-[#3D3634] rounded-2xl shadow-xs overflow-hidden relative">
        {/* Table Container with ceipal-table-scroll class for prominent vertical & horizontal scrollbars */}
        <div className="ceipal-table-scroll max-h-[68vh] overflow-x-auto overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs" style={{ minWidth: '2200px' }}>
            {/* Sticky Table Header */}
            <thead>
              <tr className="bg-[#FFF0E8] dark:bg-[#48403E] border-b border-[#E8C8BE] dark:border-[#3D3634] text-[#806B66] dark:text-[#FFD7C9]">
                {/* 1. Sticky Checkbox Column */}
                <th className="sticky top-0 left-0 z-30 p-2.5 w-10 text-center bg-[#FFF0E8] dark:bg-[#48403E] border-r border-[#E8C8BE]/60">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredJobs.length && filteredJobs.length > 0}
                    onChange={handleSelectAll}
                    aria-label="Select all jobs"
                    className="rounded border-[#E8C8BE] text-[#252525] focus:ring-[#FF6B5E]"
                  />
                </th>

                {/* 2. Sticky Expand Submissions Button [+ 1] */}
                <th className="sticky top-0 left-[40px] z-30 w-16 p-2.5 text-center font-semibold bg-[#FFF0E8] dark:bg-[#48403E] border-r border-[#E8C8BE]/60">
                  Submissions
                </th>

                {/* Dynamic Visible Columns with Header Filters */}
                {ALL_COLUMNS.filter((c) => visibleColumns.includes(c.key)).map((col) => {
                  const isFiltered = Boolean(columnFilters[col.key]);
                  const isSorted = sortBy?.key === col.key;

                  return (
                    <th
                      key={col.key}
                      className={`sticky top-0 z-20 p-2.5 font-semibold whitespace-nowrap bg-[#FFF0E8] dark:bg-[#48403E] border-r border-[#E8C8BE]/40 ${col.minWidth}`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="truncate text-[#252525] dark:text-white font-bold">{col.label}</span>

                        {/* Column Filter Dropdown Trigger (Ceipal ▼ icon) */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => openColumnFilter(col.key, e)}
                            className={`p-1 rounded hover:bg-[#FFF0E8] dark:hover:bg-[#48403E] transition-colors flex items-center gap-0.5 ${
                              isFiltered ? 'text-[#252525] bg-[#FFF0E8] font-bold' : 'text-[#806B66]'
                            }`}
                            title={`Filter & sort ${col.label}`}
                          >
                            <span className="text-[10px]">▼</span>
                            {isFiltered && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B5E]"></span>}
                          </button>

                          {/* Filter Popover Dialog */}
                          {activeFilterCol === col.key && (
                            <div
                              ref={filterPopoverRef}
                              className="absolute left-0 mt-2 w-72 rounded-xl border border-[#D8A99D] dark:border-[#65534F] bg-white dark:bg-[#252525] p-3 shadow-2xl z-50 text-left font-normal"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-between pb-2 border-b border-[#E8C8BE] dark:border-[#3D3634]">
                                <span className="text-xs font-bold text-[#252525] dark:text-white">
                                  Filter {col.label}
                                </span>
                                <button
                                  onClick={() => setActiveFilterCol(null)}
                                  className="text-[#806B66] hover:text-[#252525]"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Sort buttons */}
                              <div className="my-2 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSortBy({ key: col.key, direction: 'asc' })}
                                  className={`flex-1 py-1 px-2 text-[10px] rounded border ${
                                    isSorted && sortBy.direction === 'asc'
                                      ? 'border-[#FF6B5E] text-[#252525] font-bold bg-[#FFF0E8]'
                                      : 'border-[#E8C8BE] dark:border-[#3D3634]'
                                  }`}
                                >
                                  Sort A → Z
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSortBy({ key: col.key, direction: 'desc' })}
                                  className={`flex-1 py-1 px-2 text-[10px] rounded border ${
                                    isSorted && sortBy.direction === 'desc'
                                      ? 'border-[#FF6B5E] text-[#252525] font-bold bg-[#FFF0E8]'
                                      : 'border-[#E8C8BE] dark:border-[#3D3634]'
                                  }`}
                                >
                                  Sort Z → A
                                </button>
                              </div>

                              {/* Search values input */}
                              <div className="relative my-2">
                                <Search className="w-3 h-3 text-[#806B66] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                  type="text"
                                  placeholder="Search values..."
                                  value={filterSearchQuery}
                                  onChange={(e) => setFilterSearchQuery(e.target.value)}
                                  className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-[#FFF0E8] dark:bg-[#48403E] border border-[#E8C8BE] dark:border-[#3D3634] rounded-lg text-[#252525] dark:text-white focus:outline-none focus:border-[#FF6B5E]"
                                />
                              </div>

                              {/* Multi-select Checklist of Unique Values */}
                              <div className="max-h-40 overflow-y-auto space-y-1 py-1 border-t border-b border-[#E8C8BE] dark:border-[#3D3634] my-2 text-xs">
                                {(() => {
                                  const allVals = getUniqueValuesForCol(col.key);
                                  const displayedVals = allVals.filter((v) =>
                                    v.toLowerCase().includes(filterSearchQuery.toLowerCase())
                                  );

                                  if (displayedVals.length === 0) {
                                    return (
                                      <div className="text-[11px] text-[#806B66] py-2 text-center">
                                        No values match
                                      </div>
                                    );
                                  }

                                  const isAllSelected = displayedVals.every((v) =>
                                    tempSelectedValues.includes(v)
                                  );

                                  return (
                                    <>
                                      <label className="flex items-center gap-2 p-1 hover:bg-[#FFF0E8] dark:hover:bg-[#48403E] rounded cursor-pointer font-bold text-[#252525]">
                                        <input
                                          type="checkbox"
                                          checked={isAllSelected}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setTempSelectedValues(
                                                Array.from(new Set([...tempSelectedValues, ...displayedVals]))
                                              );
                                            } else {
                                              setTempSelectedValues(
                                                tempSelectedValues.filter((v) => !displayedVals.includes(v))
                                              );
                                            }
                                          }}
                                          className="rounded border-[#E8C8BE] text-[#252525]"
                                        />
                                        <span>[Select all]</span>
                                      </label>
                                      {displayedVals.map((val) => (
                                        <label
                                          key={val}
                                          className="flex items-center gap-2 p-1 hover:bg-[#FFF0E8] dark:hover:bg-[#48403E] rounded cursor-pointer text-[#252525] dark:text-[#FFF0E8]"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={tempSelectedValues.includes(val)}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                setTempSelectedValues([...tempSelectedValues, val]);
                                              } else {
                                                setTempSelectedValues(tempSelectedValues.filter((v) => v !== val));
                                              }
                                            }}
                                            className="rounded border-[#E8C8BE] text-[#252525]"
                                          />
                                          <span className="truncate" title={val}>
                                            {val}
                                          </span>
                                        </label>
                                      ))}
                                    </>
                                  );
                                })()}
                              </div>

                              {/* Action Buttons (Ceipal Blue Search & Close) */}
                              <div className="flex items-center justify-between pt-1">
                                <button
                                  type="button"
                                  onClick={() => applyColumnFilter(col.key)}
                                  className="px-3 py-1 bg-[#FF6B5E] hover:bg-[#E85249] text-white font-bold rounded-lg text-xs"
                                >
                                  Search
                                </button>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => resetColumnFilter(col.key)}
                                    className="px-2.5 py-1 text-xs text-[#806B66] dark:text-[#FFD7C9] hover:text-[#252525]"
                                  >
                                    Reset
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActiveFilterCol(null)}
                                    className="px-2.5 py-1 text-xs text-[#252525] font-semibold"
                                  >
                                    Close
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}

                {/* Rightmost Actions Header */}
                <th className="sticky top-0 right-0 z-20 bg-[#FFF0E8] dark:bg-[#48403E] p-2.5 text-right font-semibold whitespace-nowrap min-w-[120px] shadow-xs">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#E8C8BE] dark:divide-[#3D3634]">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 3} className="p-12 text-center text-xs text-[#806B66]">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Briefcase className="w-8 h-8 text-[#806B66] mx-auto opacity-50" />
                      <div className="font-semibold text-[#252525] dark:text-white">No job postings found</div>
                      <p className="text-[11px] text-[#806B66] dark:text-[#FFD7C9]">
                        Try adjusting your search filters or create a new job posting.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((j) => {
                  const isExpanded = expandedJobIds.has(j.id);
                  const jobSubmissions = submissions.filter((s) => s.jobId === j.id);
                  const countSubmissions = jobSubmissions.length;
                  const selectedJobSubmissions = jobSubmissions.filter((submission) =>
                    selectedSubmissionIds.includes(submission.id)
                  );

                  return (
                    <React.Fragment key={j.id}>
                      <tr
                        className={`hover:bg-[#FFF0E8]/60 dark:hover:bg-[#48403E]/40 transition-colors group ${
                          isExpanded ? 'bg-[#F0F7FD] dark:bg-[#1E3244]' : ''
                        }`}
                      >
                        {/* 1. Checkbox */}
                        <td className="sticky left-0 z-10 p-2.5 text-center bg-white dark:bg-[#252525] group-hover:bg-[#FFF0E8] dark:group-hover:bg-[#48403E] border-r border-[#E8C8BE]/50">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(j.id)}
                            onChange={() => handleSelectOne(j.id)}
                            aria-label={`Select job ${j.code}`}
                            className="rounded border-[#E8C8BE] text-[#252525] focus:ring-[#FF6B5E]"
                          />
                        </td>

                        {/* 2. Ceipal Expand Submissions Button [+ 1] */}
                        <td className="sticky left-[40px] z-10 p-2.5 text-center bg-white dark:bg-[#252525] group-hover:bg-[#FFF0E8] dark:group-hover:bg-[#48403E] border-r border-[#E8C8BE]/50">
                          <div className="flex items-center justify-center gap-1.5">
                            <span
                              className={`inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                                j.priority === 'Low'
                                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400'
                                  : j.priority === 'Medium'
                                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400'
                                  : 'bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400'
                              }`}
                              aria-label={`${j.priority || 'Medium'} priority`}
                              title={`${j.priority || 'Medium'} priority`}
                            >
                              <Zap className="h-3 w-3" fill="currentColor" aria-hidden="true" />
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleRowExpansion(j.id)}
                              aria-expanded={isExpanded}
                              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} submissions for ${j.code} (${countSubmissions})`}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono transition-all flex items-center justify-center gap-0.5 ${
                                isExpanded
                                  ? 'bg-[#FF6B5E] text-white shadow-xs'
                                  : 'bg-[#FFF0E8] dark:bg-[#48403E] text-[#252525] dark:text-[#FFF0E8] border border-[#FF6B5E]/30 hover:bg-[#FF6B5E] hover:text-white'
                              }`}
                              title={isExpanded ? 'Collapse submissions' : 'Expand applicant submissions'}
                            >
                              <span>{isExpanded ? '−' : '+'}</span>
                              <span>{countSubmissions}</span>
                            </button>
                          </div>
                        </td>

                        {/* Visible Data Columns */}
                        {ALL_COLUMNS.filter((c) => visibleColumns.includes(c.key)).map((col) => {
                          const val = getJobColumnValue(j, col.key);

                          if (col.key === 'code') {
                            return (
                              <td key={col.key} className="p-2.5 border-r border-[#E8C8BE]/30 font-mono font-bold">
                                <a
                                  href={getJobDetailUrl(j.id)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => handleJobClick(e, j.id)}
                                  className="text-[#252525] dark:text-[#806B66] hover:underline flex items-center gap-1.5 group/link"
                                  title="Open in new tab"
                                >
                                  <Briefcase className="w-3.5 h-3.5 text-[#806B66] flex-shrink-0" />
                                  <span>{j.code}</span>
                                  <ExternalLink className="w-3 h-3 opacity-60 group-hover/link:opacity-100 flex-shrink-0 text-[#252525]" />
                                </a>
                              </td>
                            );
                          }

                          if (col.key === 'title') {
                            return (
                              <td key={col.key} className="p-2.5 border-r border-[#E8C8BE]/30">
                                <a
                                  href={getJobDetailUrl(j.id)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => handleJobClick(e, j.id)}
                                  className="font-bold text-[#252525] dark:text-white hover:text-[#252525] cursor-pointer transition-colors line-clamp-1 block"
                                  title={`${j.title} (Open in new tab)`}
                                >
                                  {j.title}
                                </a>
                                <div className="flex items-center gap-2 text-[11px] text-[#806B66] mt-0.5">
                                  <span>{j.type}</span>
                                  {j.duration && (
                                    <>
                                      <span>•</span>
                                      <span>{j.duration}</span>
                                    </>
                                  )}
                                </div>
                              </td>
                            );
                          }

                          if (col.key === 'client') {
                            return (
                              <td key={col.key} className="p-2.5 border-r border-[#E8C8BE]/30">
                                <div className="font-semibold text-[#252525] dark:text-white flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-[#806B66] flex-shrink-0" />
                                  <span className="truncate">{j.client}</span>
                                </div>
                              </td>
                            );
                          }

                          if (col.key === 'location') {
                            return (
                              <td key={col.key} className="p-2.5 border-r border-[#E8C8BE]/30 text-[#806B66] dark:text-[#FFD7C9]">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-[#8AC9A7] flex-shrink-0" />
                                  <span className="truncate font-mono text-[11px]">{j.location}</span>
                                </div>
                              </td>
                            );
                          }

                          if (col.key === 'status') {
                            const isEditing = inlineEdit?.entity === 'job' && inlineEdit.id === j.id && inlineEdit.field === 'status';
                            return (
                              <td key={col.key} className="p-2.5 border-r border-[#E9D8D1]/30">
                                {isEditing ? (
                                  <div className="flex items-center gap-1">
                                    <select
                                      autoFocus
                                      aria-label={`Edit job status for ${j.code}`}
                                      value={inlineEdit.value}
                                      onChange={(event) => setInlineEdit({ ...inlineEdit, value: event.target.value })}
                                      className="min-w-24 rounded border border-[#E9D8D1] bg-white px-2 py-1 text-[11px] dark:border-[#4D4140] dark:bg-[#162431] dark:text-white"
                                    >
                                      {JOB_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                                    </select>
                                    <button type="button" onClick={saveInlineEdit} disabled={isSavingInlineEdit} aria-label="Save job status" className="rounded p-1 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"><Check className="h-3.5 w-3.5" /></button>
                                    <button type="button" onClick={() => setInlineEdit(null)} aria-label="Cancel job status edit" className="rounded p-1 text-slate-500 hover:bg-slate-100"><X className="h-3.5 w-3.5" /></button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                        j.status === 'Active' || j.status === 'Open'
                                          ? 'bg-[#8AC9A7]/20 text-[#1E4D36] border-[#8AC9A7]/40 dark:text-[#8AC9A7]'
                                          : j.status === 'Sourcing'
                                          ? 'bg-[#FFE6DD] text-[#1769AA] border-[#1769AA]/30 dark:bg-[#22384B] dark:text-[#D8E9F7]'
                                          : j.status === 'In Review'
                                          ? 'bg-[#2F80E7]/15 text-[#2F80E7] border-[#2F80E7]/30'
                                          : 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300'
                                      }`}
                                    >
                                      <span className={`w-1.5 h-1.5 rounded-full ${j.status === 'Active' || j.status === 'Open' ? 'bg-[#276749]' : 'bg-[#1769AA]'}`}></span>
                                      {j.status}
                                    </span>
                                    <button
                                      type="button"
                                      aria-label={`Edit job status for ${j.code}`}
                                      title="Edit job status"
                                      onClick={() => setInlineEdit({ entity: 'job', id: j.id, field: 'status', value: j.status })}
                                      className="rounded p-1 text-[#1769AA] hover:bg-[#FFE6DD]"
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            );
                          }

                          if (col.key === 'primaryRecruiter' || col.key === 'assignedTo') {
                            const field = col.key === 'primaryRecruiter' ? 'assignedRecruiter' : 'assignedTo';
                            const value = col.key === 'primaryRecruiter'
                              ? j.assignedRecruiter || j.assignedTo || '—'
                              : j.assignedTo || j.assignedRecruiter || '—';
                            const isEditing = inlineEdit?.entity === 'job' && inlineEdit.id === j.id && inlineEdit.field === field;
                            const recruiterOptions = Array.from(new Set([
                              value === '—' ? '' : value,
                              ...users.filter((user) => user.role !== 'super_admin').map((user) => user.name)
                            ])).filter(Boolean);
                            return (
                              <td key={col.key} className="p-2.5 border-r border-[#E9D8D1]/30 text-[#5E6B7A] dark:text-[#FFD7C9]">
                                {isEditing ? (
                                  <div className="flex items-center gap-1">
                                    <select
                                      autoFocus
                                      aria-label={`Edit ${col.label} for ${j.code}`}
                                      value={inlineEdit.value}
                                      onChange={(event) => setInlineEdit({ ...inlineEdit, value: event.target.value })}
                                      className="min-w-28 rounded border border-[#E9D8D1] bg-white px-2 py-1 text-[11px] dark:border-[#4D4140] dark:bg-[#162431] dark:text-white"
                                    >
                                      {recruiterOptions.map((name) => <option key={name} value={name}>{name}</option>)}
                                    </select>
                                    <button type="button" onClick={saveInlineEdit} disabled={isSavingInlineEdit} aria-label={`Save ${col.label}`} className="rounded p-1 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"><Check className="h-3.5 w-3.5" /></button>
                                    <button type="button" onClick={() => setInlineEdit(null)} aria-label={`Cancel ${col.label} edit`} className="rounded p-1 text-slate-500 hover:bg-slate-100"><X className="h-3.5 w-3.5" /></button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <span className="truncate" title={value}>{value}</span>
                                    <button
                                      type="button"
                                      aria-label={`Edit ${col.label} for ${j.code}`}
                                      title={`Edit ${col.label}`}
                                      onClick={() => setInlineEdit({ entity: 'job', id: j.id, field, value: value === '—' ? '' : value })}
                                      className="shrink-0 rounded p-1 text-[#1769AA] hover:bg-[#FFE6DD]"
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            );
                          }

                          return (
                            <td
                              key={col.key}
                              className="p-2.5 border-r border-[#E8C8BE]/30 text-[#806B66] dark:text-[#FFD7C9] truncate"
                              title={val}
                            >
                              {val}
                            </td>
                          );
                        })}

                        {/* Actions column */}
                        <td className="sticky right-0 z-10 p-2.5 text-right whitespace-nowrap bg-white dark:bg-[#252525] group-hover:bg-[#FFF0E8] dark:group-hover:bg-[#48403E] shadow-xs">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openSendModal(j)}
                              title="Send Requirement"
                              className="p-1.5 text-[#806B66] hover:text-[#252525] hover:bg-white dark:hover:bg-[#48403E] rounded-lg transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={getJobDetailUrl(j.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => handleJobClick(e, j.id)}
                              className="px-2.5 py-1 text-xs text-[#252525] hover:text-white hover:bg-[#FF6B5E] border border-[#FF6B5E]/30 rounded-lg transition-all font-semibold inline-flex items-center gap-1"
                              title="Open dossier in new tab"
                            >
                              <span>View</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </td>
                      </tr>

                      {/* Ceipal Expandable In-Line Submissions / Applicants Row (Ceipal Screenshot 202134) */}
                      {isExpanded && (
                        <tr className="bg-[#F8FAFD] dark:bg-[#142330] border-y-2 border-[#FF6B5E]/30">
                          <td colSpan={visibleColumns.length + 3} className="p-4">
                            <div className="rounded-xl border border-[#E8C8BE] dark:border-[#3D3634] bg-white dark:bg-[#252525] p-4 shadow-sm space-y-3">
                              {/* Submissions Header Strip */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8C8BE] dark:border-[#3D3634]">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-1 bg-[#FF6B5E] text-white rounded-lg text-xs font-bold font-mono">
                                    Submissions ({countSubmissions})
                                  </span>
                                  <span className="text-xs font-semibold text-[#252525] dark:text-white">
                                    Applicants attached to {j.code} ({j.title})
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <a
                                    href={getJobDetailUrl(j.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => handleJobClick(e, j.id)}
                                    className="px-3 py-1 bg-[#FFF0E8] dark:bg-[#48403E] text-[#252525] dark:text-[#FFF0E8] hover:bg-[#FF6B5E] hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                  >
                                    <span>Full Job Snapshot &amp; Matching in New Tab</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              </div>

                              {selectedJobSubmissions.length > 0 && (
                                <div
                                  role="toolbar"
                                  aria-label="Selected submission actions"
                                  className="flex items-center gap-1 overflow-x-auto border-b border-[#E8C8BE] pb-2 text-[11px] dark:border-[#3D3634]"
                                >
                                  {SUBMISSION_ACTIONS.map((action) => (
                                    <button
                                      key={action.id}
                                      type="button"
                                      onClick={() => openSubmissionAction(action.id, selectedJobSubmissions, j)}
                                      className="shrink-0 border-r border-[#E8C8BE] px-2 text-[#252525] hover:text-[#252525] hover:underline last:border-r-0 dark:border-[#3D3634] dark:text-[#806B66]"
                                    >
                                      {action.label}
                                    </button>
                                  ))}
                                  <span className="ml-auto shrink-0 text-[10px] text-[#806B66]">
                                    {selectedJobSubmissions.length} selected
                                  </span>
                                </div>
                              )}

                              {/* Ceipal Submissions Quick Filter Strip */}
                              <div className="flex items-center gap-2 overflow-x-auto text-xs text-[#806B66] dark:text-[#FFD7C9] pb-1">
                                <div className="relative min-w-[200px]">
                                  <input
                                    type="text"
                                    placeholder="Applicant Name / Submission ID..."
                                    className="w-full pl-7 pr-3 py-1 bg-[#FFF0E8] dark:bg-[#48403E] border border-[#E8C8BE] dark:border-[#3D3634] rounded-lg text-xs"
                                  />
                                  <Search className="w-3 h-3 text-[#806B66] absolute left-2 top-1/2 -translate-y-1/2" />
                                </div>
                                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-[11px]">Score 30%+</span>
                                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-[11px]">Status: All</span>
                                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-[11px]">Source: All</span>
                              </div>

                              {/* Ceipal Submissions Table */}
                              <div className="overflow-x-auto border border-[#E8C8BE] dark:border-[#3D3634] rounded-xl">
                                <table className="w-full text-left text-xs min-w-[1300px]">
                                  <thead className="bg-[#FFF0E8] dark:bg-[#48403E] border-b border-[#E8C8BE] dark:border-[#3D3634] text-[#806B66] dark:text-[#FFD7C9]">
                                    <tr>
                                      <th className="p-2.5 w-8 text-center">
                                        <input
                                          type="checkbox"
                                          checked={jobSubmissions.length > 0 && jobSubmissions.every((submission) => selectedSubmissionIds.includes(submission.id))}
                                          onChange={(event) => {
                                            const jobSubmissionIds = jobSubmissions.map((submission) => submission.id);
                                            setSelectedSubmissionIds((previous) => event.target.checked
                                              ? Array.from(new Set([...previous, ...jobSubmissionIds]))
                                              : previous.filter((id) => !jobSubmissionIds.includes(id)));
                                          }}
                                          aria-label={`Select all submissions for ${j.code}`}
                                          className="rounded"
                                        />
                                      </th>
                                      <th className="p-2.5 font-semibold">Submission ID</th>
                                      <th className="p-2.5 font-semibold">Applicant Name</th>
                                      <th className="p-2.5 font-semibold">Mobile Number</th>
                                      <th className="p-2.5 font-semibold">Application Status</th>
                                      <th className="p-2.5 font-semibold">Match Score</th>
                                      <th className="p-2.5 font-semibold">Location</th>
                                      <th className="p-2.5 font-semibold">Experience</th>
                                      <th className="p-2.5 font-semibold">Source</th>
                                      <th className="p-2.5 font-semibold text-center">Resume</th>
                                      <th className="p-2.5 font-semibold">Notice Period</th>
                                      <th className="p-2.5 font-semibold">Submitted By</th>
                                      <th className="p-2.5 font-semibold">Submitted On</th>
                                      <th className="p-2.5 font-semibold text-right">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#E8C8BE] dark:divide-[#3D3634]">
                                    {jobSubmissions.length === 0 ? (
                                      <tr>
                                        <td colSpan={14} className="p-8 text-center text-xs text-[#806B66]">
                                          No candidate submissions are linked to this job yet.
                                        </td>
                                      </tr>
                                    ) : jobSubmissions.map((submission) => {
                                      const applicant = applicants.find((candidate) => candidate.id === submission.applicantId);
                                      const isSelected = selectedSubmissionIds.includes(submission.id);
                                      return (
                                        <tr
                                          key={submission.id}
                                          className={`transition-colors ${isSelected ? 'bg-[#FFFDD0] dark:bg-amber-950/30' : 'hover:bg-[#FFF0E8]/40 dark:hover:bg-[#48403E]/40'}`}
                                        >
                                          <td className="p-2.5 text-center">
                                            <input
                                              type="checkbox"
                                              checked={isSelected}
                                              onChange={() => toggleSubmissionSelection(submission.id)}
                                              aria-label={`Select submission ${submission.submissionId} for ${submission.applicantName}`}
                                              className="rounded"
                                            />
                                          </td>
                                          <td className="p-2.5 font-mono font-bold text-[#252525]">{submission.submissionId}</td>
                                          <td className="p-2.5">
                                            <button
                                              type="button"
                                              onClick={() => navigate('applicant-detail', submission.applicantId)}
                                              className="font-bold text-left text-[#252525] hover:underline dark:text-white"
                                            >
                                              {submission.applicantName}
                                            </button>
                                          </td>
                                          <td className="p-2.5 font-mono text-[#252525]">{applicant?.phone || '—'}</td>
                                          <td className="p-2.5">
                                            {inlineEdit?.entity === 'submission' && inlineEdit.id === submission.id && inlineEdit.field === 'status' ? (
                                              <div className="flex items-center gap-1">
                                                <select
                                                  autoFocus
                                                  aria-label={`Edit application status for ${submission.applicantName}`}
                                                  value={inlineEdit.value}
                                                  onChange={(event) => setInlineEdit((edit) => edit ? { ...edit, value: event.target.value } : edit)}
                                                  className="max-w-[220px] rounded border border-[#E9D8D1] bg-white px-2 py-1 text-[11px] dark:border-[#4D4140] dark:bg-[#162431] dark:text-white"
                                                >
                                                  {Array.from(new Set([...SUBMISSION_STATUSES, submission.status])).map((status) => <option key={status} value={status}>{status}</option>)}
                                                </select>
                                                <button type="button" onClick={saveInlineEdit} disabled={isSavingInlineEdit} aria-label="Save application status" className="rounded p-1 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"><Check className="h-3.5 w-3.5" /></button>
                                                <button type="button" onClick={() => setInlineEdit(null)} aria-label="Cancel application status edit" className="rounded p-1 text-slate-500 hover:bg-slate-100"><X className="h-3.5 w-3.5" /></button>
                                              </div>
                                            ) : (
                                              <div className="flex items-center gap-1">
                                                <span className="inline-block max-w-[220px] truncate rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-[#1769AA]" title={submission.status}>
                                                  {submission.status}
                                                </span>
                                                <button
                                                  type="button"
                                                  aria-label={`Edit application status for ${submission.applicantName}`}
                                                  title="Edit application status"
                                                  onClick={() => setInlineEdit({ entity: 'submission', id: submission.id, field: 'status', value: submission.status })}
                                                  className="rounded p-1 text-[#1769AA] hover:bg-[#FFE6DD]"
                                                >
                                                  <Pencil className="h-3 w-3" />
                                                </button>
                                              </div>
                                            )}
                                          </td>
                                          <td className="p-2.5 font-mono font-bold text-[#1769AA]">
                                            {inlineEdit?.entity === 'submission' && inlineEdit.id === submission.id && inlineEdit.field === 'score' ? (
                                              <div className="flex items-center gap-1">
                                                <input
                                                  autoFocus
                                                  type="number"
                                                  min="0"
                                                  max="100"
                                                  step="1"
                                                  aria-label={`Edit submission score for ${submission.applicantName}`}
                                                  value={inlineEdit.value}
                                                  onChange={(event) => setInlineEdit((edit) => edit ? { ...edit, value: event.target.value } : edit)}
                                                  className="w-16 rounded border border-[#E9D8D1] bg-white px-2 py-1 text-[11px] dark:border-[#4D4140] dark:bg-[#162431] dark:text-white"
                                                />
                                                <span>%</span>
                                                <button type="button" onClick={saveInlineEdit} disabled={isSavingInlineEdit} aria-label="Save submission score" className="rounded p-1 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"><Check className="h-3.5 w-3.5" /></button>
                                                <button type="button" onClick={() => setInlineEdit(null)} aria-label="Cancel submission score edit" className="rounded p-1 text-slate-500 hover:bg-slate-100"><X className="h-3.5 w-3.5" /></button>
                                              </div>
                                            ) : (
                                              <div className="flex items-center gap-1">
                                                <span>{submission.score ?? applicant?.matchScore ?? '—'}{submission.score !== undefined || applicant ? '%' : ''}</span>
                                                <button
                                                  type="button"
                                                  aria-label={`Edit submission score for ${submission.applicantName}`}
                                                  title="Edit submission score"
                                                  onClick={() => setInlineEdit({
                                                    entity: 'submission',
                                                    id: submission.id,
                                                    field: 'score',
                                                    value: String(submission.score ?? applicant?.matchScore ?? 0)
                                                  })}
                                                  className="rounded p-1 text-[#1769AA] hover:bg-[#FFE6DD]"
                                                >
                                                  <Pencil className="h-3 w-3" />
                                                </button>
                                              </div>
                                            )}
                                            <span className="inline-block max-w-[220px] truncate rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-[#252525]" title={submission.status}>
                                              {submission.status}
                                            </span>
                                          </td>
                                          <td className="p-2.5 font-mono font-bold text-[#252525]">
                                            {submission.score ?? applicant?.matchScore ?? '—'}{submission.score !== undefined || applicant ? '%' : ''}
                                          </td>
                                          <td className="p-2.5 text-[#806B66] dark:text-[#FFD7C9]">{applicant?.location || '—'}</td>
                                          <td className="p-2.5 text-[#806B66] dark:text-[#FFD7C9]">
                                            {applicant ? `${applicant.experienceYears} Years` : '—'}
                                          </td>
                                          <td className="p-2.5">
                                            <span className="rounded border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700">
                                              {applicant?.source || '—'}
                                            </span>
                                          </td>
                                          <td className="p-2.5 text-center">
                                            <button
                                              type="button"
                                              onClick={() => showToast(applicant?.documents?.length ? `Resume opened for ${submission.applicantName}` : `No resume is available for ${submission.applicantName}.`)}
                                              className="rounded p-1 text-[#252525] hover:bg-[#FFF0E8]"
                                              title="View Resume"
                                            >
                                              <FileText className="mx-auto h-4 w-4" />
                                            </button>
                                          </td>
                                          <td className="p-2.5 font-mono text-[#806B66]">{applicant?.noticePeriod || '—'}</td>
                                          <td className="p-2.5 text-[#806B66] dark:text-[#FFD7C9]">{submission.recruiter}</td>
                                          <td className="p-2.5 font-mono text-[11px] text-[#806B66]">{submission.submittedDate}</td>
                                          <td className="p-2.5 text-right">
                                            <button
                                              type="button"
                                              onClick={() => navigate('applicant-detail', submission.applicantId)}
                                              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-[#252525] hover:bg-[#FFF0E8]"
                                            >
                                              Review Profile
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Ceipal Pagination Footer Bar */}
        <div className="p-3 bg-[#FFF0E8] dark:bg-[#48403E] border-t border-[#E8C8BE] dark:border-[#3D3634] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#806B66] dark:text-[#FFD7C9]">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-[#252525] dark:text-white">1 - {filteredJobs.length}</strong> of{' '}
              <strong className="text-[#252525] dark:text-white">11,779</strong> results
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              className="px-2.5 py-1 rounded-lg border border-[#E8C8BE] dark:border-[#3D3634] bg-white dark:bg-[#252525] text-[#252525] dark:text-white disabled:opacity-50"
              disabled
            >
              « First
            </button>
            <button
              className="px-2.5 py-1 rounded-lg border border-[#E8C8BE] dark:border-[#3D3634] bg-white dark:bg-[#252525] text-[#252525] dark:text-white disabled:opacity-50"
              disabled
            >
              ‹ Prev
            </button>
            <button className="px-2.5 py-1 rounded-lg bg-[#FF6B5E] text-white font-bold">1</button>
            <button className="px-2.5 py-1 rounded-lg border border-[#E8C8BE] dark:border-[#3D3634] bg-white dark:bg-[#252525] text-[#252525] dark:text-white">
              2
            </button>
            <button className="px-2.5 py-1 rounded-lg border border-[#E8C8BE] dark:border-[#3D3634] bg-white dark:bg-[#252525] text-[#252525] dark:text-white">
              3
            </button>
            <span className="px-1 text-[#806B66]">...</span>
            <button className="px-2.5 py-1 rounded-lg border border-[#E8C8BE] dark:border-[#3D3634] bg-white dark:bg-[#252525] text-[#252525] dark:text-white">
              472
            </button>
            <button className="px-2.5 py-1 rounded-lg border border-[#E8C8BE] dark:border-[#3D3634] bg-white dark:bg-[#252525] text-[#252525] dark:text-white">
              Next ›
            </button>
            <button className="px-2.5 py-1 rounded-lg border border-[#E8C8BE] dark:border-[#3D3634] bg-white dark:bg-[#252525] text-[#252525] dark:text-white">
              Last »
            </button>

            <div className="ml-2 flex items-center gap-1">
              <select
                aria-label="Items per page"
                className="bg-white dark:bg-[#252525] border border-[#E8C8BE] dark:border-[#3D3634] rounded-lg px-2 py-1 text-xs text-[#252525] dark:text-white focus:outline-none"
              >
                <option value="25">25 Per Page</option>
                <option value="50">50 Per Page</option>
                <option value="100">100 Per Page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Ceipal Column Customizer Drawer (Screenshot 202359) */}
      {isColumnDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="bg-white dark:bg-[#252525] border-l border-[#E8C8BE] dark:border-[#3D3634] w-full max-w-sm h-full shadow-2xl flex flex-col p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8C8BE] dark:border-[#3D3634]">
              <div>
                <h3 className="text-base font-bold text-[#252525] dark:text-white">Edit Columns</h3>
                <p className="text-xs text-[#806B66] dark:text-[#FFD7C9]">
                  {pendingVisibleColumns.length} of {ALL_COLUMNS.length} selected
                </p>
              </div>
              <button
                onClick={() => setIsColumnDrawerOpen(false)}
                className="text-[#806B66] hover:text-[#252525] dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#806B66] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search columns..."
                value={columnDrawerSearch}
                onChange={(e) => setColumnDrawerSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#FFF0E8] dark:bg-[#48403E] border border-[#E8C8BE] dark:border-[#3D3634] rounded-xl text-xs text-[#252525] dark:text-white focus:outline-none focus:border-[#FF6B5E]"
              />
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <button
                type="button"
                onClick={() => setPendingVisibleColumns(ALL_COLUMNS.map((c) => c.key))}
                className="text-[#252525] font-semibold hover:underline"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setPendingVisibleColumns(DEFAULT_VISIBLE_COLUMNS)}
                className="text-[#806B66] hover:underline"
              >
                Reset to Default
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 divide-y divide-[#E8C8BE]/50 dark:divide-[#3D3634]/50">
              {ALL_COLUMNS.filter((column) =>
                column.label.toLowerCase().includes(columnDrawerSearch.toLowerCase()) ||
                column.group?.toLowerCase().includes(columnDrawerSearch.toLowerCase())
              ).map((column, index, filteredColumns) => {
                const isChecked = pendingVisibleColumns.includes(column.key);
                const startsCustomGroup = column.group === 'Custom Fields' &&
                  filteredColumns[index - 1]?.group !== 'Custom Fields';
                return (
                  <React.Fragment key={column.key}>
                    {startsCustomGroup && (
                      <div className="px-2 pt-4 text-[10px] font-bold uppercase tracking-wider text-[#7A8794]">
                        Custom Fields
                      </div>
                    )}
                    <label className="flex cursor-pointer items-center justify-between rounded-lg p-2 text-xs hover:bg-[#F5F8FB] dark:hover:bg-[#162431]">
                      <span className="font-medium text-[#202B37] dark:text-white">{column.label}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setPendingVisibleColumns((current) =>
                              current.includes(column.key) ? current : [...current, column.key]
                            );
                          } else if (pendingVisibleColumns.length > 2) {
                            setPendingVisibleColumns((current) => current.filter((key) => key !== column.key));
                          } else {
                            showToast('At least 2 columns must remain visible');
                          }
                        }}
                        className="rounded border-[#E9D8D1] text-[#1769AA] focus:ring-[#1769AA]"
                      />
                    </label>
                  </React.Fragment>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#E8C8BE] dark:border-[#3D3634] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={applyVisibleColumns}
                className="px-4 py-2 bg-[#FF6B5E] text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {submissionAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="submission-action-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#E8C8BE] bg-white p-6 shadow-2xl dark:border-[#3D3634] dark:bg-[#252525]"
          >
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-[#E8C8BE] pb-3 dark:border-[#3D3634]">
              <div>
                <h3 id="submission-action-title" className="text-base font-bold text-[#252525] dark:text-white">
                  {SUBMISSION_ACTIONS.find((action) => action.id === submissionAction)?.label}
                </h3>
                <p className="mt-1 text-xs text-[#806B66] dark:text-[#FFD7C9]">
                  {submissionActionTargetIds.length} selected submission{submissionActionTargetIds.length === 1 ? '' : 's'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setSubmissionAction(null); setSubmissionActionTargetIds([]); }}
                aria-label="Close submission action"
                className="rounded-lg p-1 text-[#806B66] hover:bg-[#FFF0E8] dark:hover:bg-[#48403E]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={applySubmissionAction} className="space-y-4 text-xs">
              {submissionAction === 'score' && (
                <label className="block space-y-1">
                  <span className="font-semibold text-[#252525] dark:text-white">Submission score (0-100)</span>
                  <input
                    type="number" min="0" max="100" step="1" required
                    value={submissionActionForm.score}
                    onChange={(event) => setSubmissionActionForm((form) => ({ ...form, score: event.target.value }))}
                    className="w-full rounded-xl border border-[#E8C8BE] bg-[#FFF0E8] px-3 py-2 text-xs dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                  />
                </label>
              )}
              {submissionAction === 'note' && (
                <label className="block space-y-1">
                  <span className="font-semibold text-[#252525] dark:text-white">Note</span>
                  <textarea
                    required rows={4} value={submissionActionForm.note}
                    onChange={(event) => setSubmissionActionForm((form) => ({ ...form, note: event.target.value }))}
                    placeholder="Add a note to the selected candidate profiles..."
                    className="w-full resize-y rounded-xl border border-[#E8C8BE] bg-[#FFF0E8] px-3 py-2 text-xs dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                  />
                </label>
              )}
              {submissionAction === 'email' && (
                <>
                  <label className="block space-y-1">
                    <span className="font-semibold text-[#252525] dark:text-white">To</span>
                    <input
                      type="text" required value={submissionActionForm.recipients}
                      onChange={(event) => setSubmissionActionForm((form) => ({ ...form, recipients: event.target.value }))}
                      placeholder="candidate@example.com"
                      className="w-full rounded-xl border border-[#E8C8BE] bg-[#FFF0E8] px-3 py-2 text-xs dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="font-semibold text-[#252525] dark:text-white">Subject</span>
                    <input
                      type="text" required value={submissionActionForm.subject}
                      onChange={(event) => setSubmissionActionForm((form) => ({ ...form, subject: event.target.value }))}
                      className="w-full rounded-xl border border-[#E8C8BE] bg-[#FFF0E8] px-3 py-2 text-xs dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="font-semibold text-[#252525] dark:text-white">Message</span>
                    <textarea
                      required rows={5} value={submissionActionForm.emailBody}
                      onChange={(event) => setSubmissionActionForm((form) => ({ ...form, emailBody: event.target.value }))}
                      className="w-full resize-y rounded-xl border border-[#E8C8BE] bg-[#FFF0E8] px-3 py-2 text-xs dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                    />
                  </label>
                  <p className="text-[11px] text-[#806B66]">This opens a draft in your default email app. NexusTalent does not send emails directly.</p>
                </>
              )}
              {submissionAction === 'submit-client' && (
                <p className="text-[#806B66] dark:text-[#FFD7C9]">
                  Mark the selected submissions as <strong>Submitted to Client</strong>?
                </p>
              )}
              {submissionAction === 'group' && (
                <label className="block space-y-1">
                  <span className="font-semibold text-[#252525] dark:text-white">Candidate group</span>
                  <select
                    value={submissionActionForm.group}
                    onChange={(event) => setSubmissionActionForm((form) => ({ ...form, group: event.target.value }))}
                    className="w-full rounded-xl border border-[#E8C8BE] bg-[#FFF0E8] px-3 py-2 text-xs dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                  >
                    {SUBMISSION_GROUPS.map((group) => <option key={group} value={group}>{group}</option>)}
                  </select>
                </label>
              )}
              {submissionAction === 'schedule-interview' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1">
                    <span className="font-semibold text-[#252525] dark:text-white">Interview date</span>
                    <input
                      type="date" required value={submissionActionForm.date}
                      onChange={(event) => setSubmissionActionForm((form) => ({ ...form, date: event.target.value }))}
                      className="w-full rounded-xl border border-[#E8C8BE] bg-[#FFF0E8] px-3 py-2 text-xs dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-semibold text-[#252525] dark:text-white">Time</span>
                    <input
                      type="time" required value={submissionActionForm.time}
                      onChange={(event) => setSubmissionActionForm((form) => ({ ...form, time: event.target.value }))}
                      className="w-full rounded-xl border border-[#E8C8BE] bg-[#FFF0E8] px-3 py-2 text-xs dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-semibold text-[#252525] dark:text-white">Interviewer</span>
                    <input
                      required value={submissionActionForm.interviewer}
                      onChange={(event) => setSubmissionActionForm((form) => ({ ...form, interviewer: event.target.value }))}
                      className="w-full rounded-xl border border-[#E8C8BE] bg-[#FFF0E8] px-3 py-2 text-xs dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-semibold text-[#252525] dark:text-white">Interview type</span>
                    <select
                      value={submissionActionForm.interviewType}
                      onChange={(event) => setSubmissionActionForm((form) => ({ ...form, interviewType: event.target.value as Interview['type'] }))}
                      className="w-full rounded-xl border border-[#E8C8BE] bg-[#FFF0E8] px-3 py-2 text-xs dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                    >
                      <option>Technical Screen</option>
                      <option>Architecture Deep-Dive</option>
                      <option>Hiring Manager</option>
                      <option>Culture &amp; Exec</option>
                    </select>
                  </label>
                  <label className="space-y-1 sm:col-span-2">
                    <span className="font-semibold text-[#252525] dark:text-white">Meeting link (optional)</span>
                    <input
                      type="url" value={submissionActionForm.meetingLink}
                      onChange={(event) => setSubmissionActionForm((form) => ({ ...form, meetingLink: event.target.value }))}
                      placeholder="https://"
                      className="w-full rounded-xl border border-[#E8C8BE] bg-[#FFF0E8] px-3 py-2 text-xs dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                    />
                  </label>
                </div>
              )}
              {submissionAction === 'other-job' && (
                <label className="block space-y-1">
                  <span className="font-semibold text-[#252525] dark:text-white">Target job</span>
                  <select
                    required value={submissionActionForm.otherJobId}
                    onChange={(event) => setSubmissionActionForm((form) => ({ ...form, otherJobId: event.target.value }))}
                    className="w-full rounded-xl border border-[#E8C8BE] bg-[#FFF0E8] px-3 py-2 text-xs dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                  >
                    {jobs.filter((job) => !submissions
                      .filter((submission) => submissionActionTargetIds.includes(submission.id))
                      .some((submission) => submission.jobId === job.id)
                    ).map((job) => <option key={job.id} value={job.id}>{job.code} — {job.title}</option>)}
                  </select>
                </label>
              )}
              {submissionAction === 'task' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 sm:col-span-2">
                    <span className="font-semibold text-[#252525] dark:text-white">Task</span>
                    <input
                      required value={submissionActionForm.taskTitle}
                      onChange={(event) => setSubmissionActionForm((form) => ({ ...form, taskTitle: event.target.value }))}
                      className="w-full rounded-xl border border-[#E8C8BE] bg-[#FFF0E8] px-3 py-2 text-xs dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-semibold text-[#252525] dark:text-white">Due date</span>
                    <input
                      type="date" required value={submissionActionForm.dueDate}
                      onChange={(event) => setSubmissionActionForm((form) => ({ ...form, dueDate: event.target.value }))}
                      className="w-full rounded-xl border border-[#E8C8BE] bg-[#FFF0E8] px-3 py-2 text-xs dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                    />
                  </label>
                </div>
              )}
              {submissionAction === 'request-details' && (
                <label className="block space-y-1">
                  <span className="font-semibold text-[#252525] dark:text-white">Details requested</span>
                  <textarea
                    required rows={4} value={submissionActionForm.requestMessage}
                    onChange={(event) => setSubmissionActionForm((form) => ({ ...form, requestMessage: event.target.value }))}
                    placeholder="Describe the information needed..."
                    className="w-full resize-y rounded-xl border border-[#E8C8BE] bg-[#FFF0E8] px-3 py-2 text-xs dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                  />
                </label>
              )}

              <div className="flex justify-end gap-2 border-t border-[#E8C8BE] pt-3 dark:border-[#3D3634]">
                <button
                  type="button" disabled={isApplyingSubmissionAction}
                  onClick={() => { setSubmissionAction(null); setSubmissionActionTargetIds([]); }}
                  className="rounded-xl border border-[#E8C8BE] px-4 py-2 text-xs font-semibold text-[#806B66] hover:bg-[#FFF0E8] disabled:opacity-50 dark:border-[#3D3634] dark:text-[#FFD7C9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplyingSubmissionAction || (submissionAction === 'other-job' && !submissionActionForm.otherJobId)}
                  className="rounded-xl bg-[#FF6B5E] px-4 py-2 text-xs font-bold text-white hover:bg-[#FF6B5E] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isApplyingSubmissionAction ? 'Working...' :
                    submissionAction === 'email' ? 'Open Email Draft' :
                    submissionAction === 'score' ? 'Save Score' :
                    submissionAction === 'submit-client' ? 'Submit' :
                    submissionAction === 'schedule-interview' ? 'Schedule Interview' :
                    submissionAction === 'other-job' ? 'Submit to Job' :
                    submissionAction === 'request-details' ? 'Request Details' :
                    submissionAction === 'task' ? 'Add Task' :
                    submissionAction === 'group' ? 'Add to Group' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {bulkAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulk-job-action-title"
            className="w-full max-w-lg space-y-4 rounded-2xl border border-[#E8C8BE] bg-white p-6 shadow-2xl dark:border-[#3D3634] dark:bg-[#252525]"
          >
            <div className="flex items-center justify-between border-b border-[#E8C8BE] pb-3 dark:border-[#3D3634]">
              <div>
                <h3 id="bulk-job-action-title" className="text-base font-bold text-[#252525] dark:text-white">
                  {BULK_JOB_ACTIONS.find((action) => action.id === bulkAction)?.label}
                </h3>
                <p className="mt-1 text-xs text-[#806B66] dark:text-[#FFD7C9]">
                  Apply to {selectedIds.length} selected job{selectedIds.length === 1 ? '' : 's'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBulkAction(null)}
                aria-label="Close action dialog"
                className="rounded-lg p-1 text-[#806B66] hover:bg-[#FFF0E8] hover:text-[#252525] dark:hover:bg-[#48403E] dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={applyBulkJobAction} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label htmlFor="bulk-job-action-value" className="font-semibold text-[#252525] dark:text-white">
                  {bulkAction === 'notes' ? 'Note' :
                    bulkAction === 'folder' ? 'Folder name' :
                    bulkAction === 'status' ? 'New status' :
                    bulkAction === 'macro' ? 'Choose a macro' :
                    bulkAction === 'bench-consultant' ? 'Bench consultant' :
                    bulkAction === 'priority' ? 'New priority' :
                    bulkAction === 'rollover' ? 'New end date' :
                    bulkAction === 'mail-merge-limit' ? 'Mail merge limit' :
                    'Campus names (comma-separated)'}
                </label>

                {bulkAction === 'notes' ? (
                  <textarea
                    id="bulk-job-action-value"
                    required
                    rows={4}
                    value={bulkActionValue}
                    onChange={(e) => setBulkActionValue(e.target.value)}
                    placeholder="Add a note to the selected jobs..."
                    className="w-full resize-y rounded-xl border border-[#E8C8BE] bg-[#FFF0E8] px-3 py-2 text-xs text-[#252525] focus:border-[#FF6B5E] focus:outline-none dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                  />
                ) : bulkAction === 'status' || bulkAction === 'priority' || bulkAction === 'macro' ? (
                  <select
                    id="bulk-job-action-value"
                    required
                    value={bulkActionValue}
                    onChange={(e) => setBulkActionValue(e.target.value)}
                    className="w-full rounded-xl border border-[#E8C8BE] bg-[#FFF0E8] px-3 py-2 text-xs text-[#252525] focus:border-[#FF6B5E] focus:outline-none dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                  >
                    {bulkAction === 'status' ? JOB_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    )) : bulkAction === 'priority' ? JOB_PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>{priority}</option>
                    )) : (
                      <>
                        <option value="Set Active">Set Active</option>
                        <option value="Mark High Priority">Mark High Priority</option>
                        <option value="Close Job">Close Job</option>
                      </>
                    )}
                  </select>
                ) : (
                  <input
                    id="bulk-job-action-value"
                    required
                    type={bulkAction === 'rollover' ? 'date' : bulkAction === 'mail-merge-limit' ? 'number' : 'text'}
                    min={bulkAction === 'mail-merge-limit' ? 0 : undefined}
                    step={bulkAction === 'mail-merge-limit' ? 1 : undefined}
                    value={bulkActionValue}
                    onChange={(e) => setBulkActionValue(e.target.value)}
                    placeholder={
                      bulkAction === 'folder' ? 'e.g. Q4 priority roles' :
                      bulkAction === 'bench-consultant' ? 'Enter consultant name' :
                      bulkAction === 'publish-campuses' ? 'e.g. New York, London' : undefined
                    }
                    className="w-full rounded-xl border border-[#E8C8BE] bg-[#FFF0E8] px-3 py-2 text-xs text-[#252525] focus:border-[#FF6B5E] focus:outline-none dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                  />
                )}
              </div>

              {bulkAction === 'rollover' && (
                <p className="text-[11px] text-[#806B66] dark:text-[#FFD7C9]">
                  The selected jobs will be set to Active and updated with this end date.
                </p>
              )}
              {bulkAction === 'publish-campuses' && (
                <p className="text-[11px] text-[#806B66] dark:text-[#FFD7C9]">
                  This enables career portal publishing and saves the campus list on each job.
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBulkAction(null)}
                  className="rounded-xl border border-[#E8C8BE] px-4 py-2 text-xs font-semibold text-[#806B66] hover:bg-[#FFF0E8] dark:border-[#3D3634] dark:text-[#FFD7C9] dark:hover:bg-[#48403E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#FF6B5E] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#E85249]"
                >
                  Apply to selected jobs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Requirement Modal */}
      {isSendModalOpen && selectedJobsForSend.length > 0 && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#EAEAEA] p-3 dark:bg-[#101923] sm:p-5">
          <div className="mx-auto grid min-h-full max-w-[1600px] grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <form
              onSubmit={handleSendRequirement}
              className="space-y-0 border border-[#D5D5D5] bg-white text-xs text-[#465466] shadow-sm dark:border-[#3D3634] dark:bg-[#252525] dark:text-[#FFF0E8]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E8C8BE] px-4 py-3 dark:border-[#3D3634]">
                <div className="flex min-w-[280px] flex-1 items-center gap-3">
                  <h2 className="text-base font-medium text-[#315D88] dark:text-[#FFF0E8]">Send Requirement</h2>
                  <span className="rounded-full bg-[#FFF0E8] px-2 py-1 text-[10px] font-semibold text-[#252525] dark:bg-[#48403E] dark:text-[#FFF0E8]">
                    {selectedJobsForSend.length} position{selectedJobsForSend.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="submit"
                    onClick={() => { sendIntentRef.current = 'send'; }}
                    className="rounded-sm bg-[#4387F5] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#286FE0]"
                  >
                    Send
                  </button>
                  <button
                    type="submit"
                    onClick={handleScheduleClick}
                    className="rounded-sm bg-[#4387F5] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#286FE0]"
                  >
                    Schedule
                  </button>
                  <button
                    type="button"
                    onClick={closeSendModal}
                    className="rounded-sm border border-[#C9C9C9] bg-[#F8F8F8] px-3 py-1.5 text-[11px] font-medium text-[#555] hover:bg-[#EFEFEF] dark:border-[#3D3634] dark:bg-[#48403E] dark:text-[#FFF0E8]"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid w-full grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-[55px_minmax(180px,280px)] sm:items-center">
                  <label htmlFor="requirement-from" className="text-[10px] text-[#806B66] dark:text-[#FFD7C9]">From</label>
                  <select
                    id="requirement-from"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    className="w-full rounded-sm border border-[#E8C8BE] bg-white px-2 py-1.5 text-[11px] text-[#4D4140] dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                  >
                    <option value={currentUser?.email || 'recruiting@ampcus.com'}>
                      System ({currentUser?.name || 'Recruiter'} &lt;{currentUser?.email || 'recruiting@ampcus.com'}&gt;)
                    </option>
                    <option value="jobs@ampcus.com">Recruiting Team &lt;jobs@ampcus.com&gt;</option>
                  </select>
                  <label htmlFor="requirement-reply-to" className="text-[10px] text-[#806B66] dark:text-[#FFD7C9]">Reply To</label>
                  <select
                    id="requirement-reply-to"
                    value={replyToEmail}
                    onChange={(e) => setReplyToEmail(e.target.value)}
                    className="w-full rounded-sm border border-[#E8C8BE] bg-white px-2 py-1.5 text-[11px] text-[#4D4140] dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                  >
                    <option value={currentUser?.email || 'recruiting@ampcus.com'}>
                      {currentUser?.email || 'recruiting@ampcus.com'}
                    </option>
                    <option value="jobs@ampcus.com">jobs@ampcus.com</option>
                  </select>
                </div>
              </div>

              {isScheduleMode && (
                <div className="flex flex-wrap items-center gap-2 border-b border-[#E8C8BE] bg-[#F7FAFF] px-4 py-2.5 dark:border-[#3D3634] dark:bg-[#48403E]">
                  <Calendar className="h-4 w-4 text-[#4387F5]" />
                  <label htmlFor="requirement-schedule" className="font-semibold">Schedule date &amp; time</label>
                  <input
                    id="requirement-schedule"
                    type="datetime-local"
                    required
                    min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                    value={scheduleDateTime}
                    onChange={(e) => setScheduleDateTime(e.target.value)}
                    className="rounded-sm border border-[#E8C8BE] bg-white px-2 py-1.5 text-[11px] dark:border-[#3D3634] dark:bg-[#252525] dark:text-white"
                  />
                  <span className="text-[10px] text-[#806B66] dark:text-[#FFD7C9]">
                    Choose a future time, then click Schedule again.
                  </span>
                </div>
              )}

              <div className="flex items-start gap-3 border-b border-[#E8C8BE] px-3 py-2 dark:border-[#3D3634]">
                <label htmlFor="requirement-recipients" className="w-32 flex-shrink-0 pt-1 text-[10px] text-[#806B66] dark:text-[#FFD7C9]">
                  Recipients *
                </label>
                <input
                  id="requirement-recipients"
                  type="text"
                  required
                  value={recipientEmails}
                  onChange={(e) => setRecipientEmails(e.target.value)}
                  placeholder="Click here to add recipient(s)"
                  className="min-w-0 flex-1 border-0 bg-transparent py-1 text-[11px] text-[#4D4140] outline-none placeholder:text-[#A6A6A6] dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => { setRecipientEmails(''); setAdditionalRecipients(''); }}
                  className="text-[10px] font-medium text-[#4387F5] hover:underline"
                >
                  Reset
                </button>
              </div>
              <div className="border-b border-[#E8C8BE] px-3 py-2 dark:border-[#3D3634]">
                <label htmlFor="requirement-additional-recipients" className="sr-only">Additional recipients</label>
                <input
                  id="requirement-additional-recipients"
                  type="text"
                  value={additionalRecipients}
                  onChange={(e) => setAdditionalRecipients(e.target.value)}
                  placeholder="Additional recipients, separate emails with commas (sent as CC/BCC)"
                  className="w-full border-0 bg-transparent py-1 text-[10px] text-[#806B66] outline-none placeholder:text-[#A6A6A6] dark:text-[#FFF0E8]"
                />
              </div>

              <div className="flex items-center gap-3 border-b border-[#E8C8BE] px-3 py-2 dark:border-[#3D3634]">
                <label htmlFor="requirement-subject" className="w-32 flex-shrink-0 text-[10px] text-[#806B66] dark:text-[#FFD7C9]">Subject *</label>
                <input
                  id="requirement-subject"
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="min-w-0 flex-1 border-0 bg-transparent py-1 text-[11px] text-[#4D4140] outline-none dark:text-white"
                />
                <button
                  type="button"
                  onClick={insertJobPositions}
                  className="whitespace-nowrap text-[10px] font-medium text-[#4387F5] hover:underline"
                >
                  Add Positions
                </button>
              </div>

              <EmailRichTextEditor
                value={emailBody}
                resetKey={emailEditorResetKey}
                accentColor={customEmailColor}
                onChange={setEmailBody}
                onError={showToast}
              />

              <div className="flex flex-col gap-2 border-t border-[#E8C8BE] px-3 py-3 dark:border-[#3D3634] sm:flex-row sm:items-center">
                <label className="flex items-center gap-2 text-[10px] font-semibold text-[#806B66] dark:text-[#FFD7C9]">
                  <Paperclip className="h-3.5 w-3.5" />
                  Attachment
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setEmailAttachments(Array.from(e.target.files || []))}
                    className="max-w-[250px] text-[10px] font-normal"
                  />
                </label>
                {emailAttachments.length > 0 && (
                  <div className="flex min-w-0 flex-wrap gap-1">
                    {emailAttachments.map((file, index) => (
                      <span key={`${file.name}-${index}`} className="max-w-[180px] truncate rounded bg-[#FFE6DD] px-2 py-1 text-[10px] dark:bg-[#48403E]" title={file.name}>
                        {file.name}
                      </span>
                    ))}
                    <button type="button" onClick={() => setEmailAttachments([])} className="text-[10px] text-[#4387F5] hover:underline">Clear</button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8C8BE] px-3 py-2 dark:border-[#3D3634]">
                <span className="text-[10px] text-[#806B66] dark:text-[#FFD7C9]">
                  Email delivery is not connected in this app; send and schedule actions prepare the message only.
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="submit"
                    onClick={() => { sendIntentRef.current = 'send'; }}
                    className="rounded-sm bg-[#4387F5] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#286FE0]"
                  >
                    Send
                  </button>
                  <button
                    type="submit"
                    onClick={handleScheduleClick}
                    className="rounded-sm bg-[#4387F5] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#286FE0]"
                  >
                    Schedule
                  </button>
                  <button
                    type="button"
                    onClick={closeSendModal}
                    className="rounded-sm border border-[#C9C9C9] bg-[#F8F8F8] px-3 py-1.5 text-[11px] font-medium text-[#555] hover:bg-[#EFEFEF] dark:border-[#3D3634] dark:bg-[#48403E] dark:text-[#FFF0E8]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>

            <aside className="border border-[#D5D5D5] bg-white shadow-sm dark:border-[#3D3634] dark:bg-[#252525]">
              <div className="border-b border-[#E8C8BE] px-4 py-3 dark:border-[#3D3634]">
                <h3 className="text-sm font-medium text-[#315D88] dark:text-[#FFF0E8]">Customize Email Body</h3>
              </div>
              <div className="space-y-4 p-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-[#806B66] dark:text-[#FFD7C9]">Columns</label>
                  <button
                    type="button"
                    onClick={() => setIsEmailColumnsOpen((open) => !open)}
                    aria-expanded={isEmailColumnsOpen}
                    className="flex w-full items-center justify-between rounded-sm border border-[#E8C8BE] bg-white px-2.5 py-1.5 text-left text-[11px] text-[#4D4140] dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                  >
                    <span>{emailColumns.length} selected</span>
                    <ChevronDown className={`h-3 w-3 transition-transform ${isEmailColumnsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isEmailColumnsOpen && (
                    <div className="max-h-44 space-y-1 overflow-y-auto rounded-sm border border-[#E8C8BE] p-2 dark:border-[#3D3634]">
                      {EMAIL_JOB_FIELDS.map((field) => (
                        <label key={field} className="flex items-center gap-2 py-1 text-[10px]">
                          <input
                            type="checkbox"
                            checked={emailColumns.includes(field)}
                            onChange={(e) => setEmailColumns((columns) =>
                              e.target.checked ? [...columns, field] : columns.filter((column) => column !== field)
                            )}
                          />
                          {field}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="requirement-template" className="block text-[10px] text-[#806B66] dark:text-[#FFD7C9]">Select Template</label>
                  <select
                    id="requirement-template"
                    value={emailTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full rounded-sm border border-[#E8C8BE] bg-white px-2 py-1.5 text-[11px] text-[#4D4140] dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                  >
                    <option value="">-- Select Template --</option>
                    <option value="Standard Requirement">Standard Requirement</option>
                    <option value="Urgent Requirement">Urgent Requirement</option>
                    <option value="Contract Position">Contract Position</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="requirement-salutation" className="block text-[10px] text-[#806B66] dark:text-[#FFD7C9]">Salutation</label>
                  <select
                    id="requirement-salutation"
                    value={emailSalutation}
                    onChange={(e) => {
                      const nextSalutation = e.target.value;
                      setEmailSalutation(nextSalutation);
                      setEmailBody((body) => {
                                        const content = body.replace(/^<p>(?:Hello,|Dear Hiring Team,|Hi,|Greetings,|Hi \[FirstName\]|Hello \[FirstName\]|Hi \[FirstName\] \[LastName\]|Hello \[FirstName\] \[LastName\]|Dear \[FirstName\] \[LastName\])<\/p>/i, '');
                        return `<p>${escapeHtml(nextSalutation)}</p>${content}`;
                      });
                      setEmailEditorResetKey((key) => key + 1);
                    }}
                    className="w-full rounded-sm border border-[#E8C8BE] bg-white px-2 py-1.5 text-[11px] text-[#4D4140] dark:border-[#3D3634] dark:bg-[#48403E] dark:text-white"
                  >
                    <option value="">Select</option>
                    <option value="Hi [FirstName]">Hi [FirstName]</option>
                    <option value="Hello [FirstName]">Hello [FirstName]</option>
                    <option value="Hi [FirstName] [LastName]">Hi [FirstName] [LastName]</option>
                    <option value="Hello [FirstName] [LastName]">Hello [FirstName] [LastName]</option>
                    <option value="Dear [FirstName] [LastName]">Dear [FirstName] [LastName]</option>
                    <option value="Hello,">Hello,</option>
                    <option value="Dear Hiring Team,">Dear Hiring Team,</option>
                    <option value="Hi,">Hi,</option>
                    <option value="Greetings,">Greetings,</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-[10px] text-[#806B66] dark:text-[#FFD7C9]">Themes</span>
                  <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1">
                    {EMAIL_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => { setEmailTheme(theme.id); setCustomEmailColor(theme.accent); }}
                        aria-label={`${theme.name} email theme`}
                        aria-pressed={emailTheme === theme.id}
                        className={`rounded border p-1 text-left transition-shadow ${emailTheme === theme.id ? 'border-[#FF6B5E] ring-1 ring-[#FF6B5E]' : 'border-[#E8C8BE] hover:border-[#B68F87] dark:border-[#3D3634]'}`}
                      >
                        <span className="block overflow-hidden rounded-sm border border-[#E8C8BE] dark:border-[#65534F]" style={{ backgroundColor: theme.background }}>
                          <span className="block h-1.5" style={{ backgroundColor: theme.accent }} />
                          <span className="block space-y-1 p-1.5">
                            <span className="block h-1 w-3/4 rounded" style={{ backgroundColor: theme.accent, opacity: 0.75 }} />
                            <span className="block h-1 w-full rounded bg-slate-200" />
                            <span className="block h-1 w-2/3 rounded bg-slate-200" />
                          </span>
                        </span>
                        <span className="mt-1 block truncate text-[9px] text-[#806B66] dark:text-[#FFD7C9]">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#E8C8BE] pt-3 dark:border-[#3D3634]">
                  <button
                    type="button"
                    onClick={() => setIsEmailThemeOpen((open) => !open)}
                    aria-expanded={isEmailThemeOpen}
                    className="flex w-full items-center justify-between text-[10px] font-medium text-[#4387F5]"
                  >
                    Customize Theme
                    <ChevronDown className={`h-3 w-3 transition-transform ${isEmailThemeOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isEmailThemeOpen && (
                    <label className="mt-3 flex items-center justify-between text-[10px] text-[#806B66] dark:text-[#FFD7C9]">
                      Accent color
                      <input
                        type="color"
                        value={customEmailColor}
                        onChange={(e) => { setCustomEmailColor(e.target.value); setEmailTheme('custom'); }}
                        className="h-7 w-10 cursor-pointer border-0 bg-transparent p-0"
                      />
                    </label>
                  )}
                </div>
              </div>
              <div className="border-t border-[#E8C8BE] px-4 py-3 text-[10px] text-[#806B66] dark:border-[#3D3634] dark:text-[#FFD7C9]">
                Message includes {selectedJobsForSend.length} selected job position{selectedJobsForSend.length === 1 ? '' : 's'}.
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
};
