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
  Flame,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  FileText,
  Eye,
  Check,
  Calendar,
  DollarSign,
  User,
  Shield,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { useAppStore, getJobDetailUrl } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { Job, JobStatus, Priority, Applicant, Submission } from '../../types';

export type JobColumnKey =
  | 'code'
  | 'title'
  | 'businessUnit'
  | 'client'
  | 'clientJobId'
  | 'location'
  | 'states'
  | 'status'
  | 'rate'
  | 'recruitmentManager'
  | 'primaryRecruiter'
  | 'assignedTo'
  | 'createdBy'
  | 'createdDate'
  | 'modifiedDate'
  | 'minSalary'
  | 'maxSalary'
  | 'avgSalary'
  | 'priority'
  | 'type'
  | 'openings'
  | 'noticePeriod';

interface ColumnDef {
  key: JobColumnKey;
  label: string;
  minWidth: string;
  defaultVisible: boolean;
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
  { key: 'rate', label: 'Client Bill Rate / Salary', minWidth: 'min-w-[180px]', defaultVisible: true },
  { key: 'recruitmentManager', label: 'Recruitment Manager', minWidth: 'min-w-[170px]', defaultVisible: true },
  { key: 'primaryRecruiter', label: 'Primary Recruiter', minWidth: 'min-w-[160px]', defaultVisible: true },
  { key: 'assignedTo', label: 'Assigned To', minWidth: 'min-w-[160px]', defaultVisible: true },
  { key: 'createdBy', label: 'Job Posting Created By', minWidth: 'min-w-[180px]', defaultVisible: true },
  { key: 'createdDate', label: 'Job Created', minWidth: 'min-w-[160px]', defaultVisible: true },
  { key: 'modifiedDate', label: 'Job Modified On', minWidth: 'min-w-[160px]', defaultVisible: true },
  { key: 'minSalary', label: 'Min Salary', minWidth: 'min-w-[130px]', defaultVisible: true },
  { key: 'maxSalary', label: 'Max Salary', minWidth: 'min-w-[130px]', defaultVisible: true },
  { key: 'avgSalary', label: 'Avg Salary', minWidth: 'min-w-[130px]', defaultVisible: true },
  { key: 'priority', label: 'Priority', minWidth: 'min-w-[120px]', defaultVisible: false },
  { key: 'type', label: 'Job Type', minWidth: 'min-w-[130px]', defaultVisible: false },
  { key: 'openings', label: 'Openings', minWidth: 'min-w-[100px]', defaultVisible: false },
  { key: 'noticePeriod', label: 'Notice Period', minWidth: 'min-w-[140px]', defaultVisible: false }
];

const getJobColumnValue = (job: Job, key: JobColumnKey): string => {
  switch (key) {
    case 'code': return job.code || '';
    case 'title': return job.title || '';
    case 'businessUnit': return job.businessUnit || 'Ampcus Tech Pvt Ltd.';
    case 'client': return job.client || '';
    case 'clientJobId': return job.clientJobId || '';
    case 'location': return job.location || '';
    case 'states': return job.states || '';
    case 'status': return job.status || '';
    case 'rate':
      return `${job.currency === 'INR' ? '₹' : '$'}${job.billRate} / ${job.rateType === 'Yearly' ? 'yr' : 'hr'}`;
    case 'recruitmentManager': return job.recruitmentManager || 'Sachin Wadeyar';
    case 'primaryRecruiter': return job.assignedRecruiter || job.assignedTo || 'Priya Sharma';
    case 'assignedTo': return job.assignedTo || job.assignedRecruiter || 'Ganesh Godse';
    case 'createdBy': return job.assignedRecruiter || 'Ganesh Godse';
    case 'createdDate': return job.createdDate || '10/11/2026';
    case 'modifiedDate': return '10/11/2026 20:07:23';
    case 'minSalary':
      return job.payRate ? `${job.currency === 'INR' ? '₹' : '$'}${job.payRate * 160 * 12}/yr` : '—';
    case 'maxSalary':
      return job.billRate ? `${job.currency === 'INR' ? '₹' : '$'}${job.billRate * 160 * 12}/yr` : '—';
    case 'avgSalary':
      return job.billRate && job.payRate
        ? `${job.currency === 'INR' ? '₹' : '$'}${Math.round(((job.billRate + job.payRate) / 2) * 160 * 12)}/yr`
        : '—';
    case 'priority': return job.priority || 'Medium';
    case 'type': return job.type || 'Full-Time';
    case 'openings': return String(job.openings || 1);
    case 'noticePeriod': return job.noticePeriod || '1 Month';
  }
};

export const JobList: React.FC = () => {
  const { navigate, currentRoute } = useAppStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

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
  const [expandedJobIds, setExpandedJobIds] = useState<Set<string>>(new Set(['job-12262']));

  // Column Visibility Customization (Ceipal Screenshot 202359)
  const [visibleColumns, setVisibleColumns] = useState<JobColumnKey[]>(
    ALL_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key)
  );
  const [isColumnDrawerOpen, setIsColumnDrawerOpen] = useState(false);
  const [columnDrawerSearch, setColumnDrawerSearch] = useState('');

  // Row selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Send Requirement modal
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedJobForSend, setSelectedJobForSend] = useState<Job | null>(null);
  const [recipientEmails, setRecipientEmails] = useState('');

  // Close filter popover on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        filterPopoverRef.current &&
        !filterPopoverRef.current.contains(e.target as Node)
      ) {
        setActiveFilterCol(null);
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
  }, [currentRoute]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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
    setExpandedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
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
    setSelectedJobForSend(job || filteredJobs[0] || null);
    setIsSendModalOpen(true);
  };

  const handleSendRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmails.trim()) {
      showToast('Please enter at least one recipient email.');
      return;
    }
    setIsSendModalOpen(false);
    setRecipientEmails('');
    showToast(`Job Requirement dispatched successfully to ${recipientEmails}!`);
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
        <div className="fixed top-20 right-6 z-50 bg-[#0B4F89] text-white border border-[#1769AA] px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#8AC9A7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Ceipal Top Tab Views & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-[#202B37] dark:text-white">
              Job Posting
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF4FC] dark:bg-[#22384B] text-[#1769AA] dark:text-[#D8E9F7] border border-[#1769AA]/20">
              {filteredJobs.length} Requisitions
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-[#5E6B7A] dark:text-[#B9CAD9] bg-white dark:bg-[#1B2936] px-2 py-0.5 rounded-md border border-[#DCE6EF] dark:border-[#354A5C]">
              <span>💡 Click any job to open in a new tab</span>
            </span>
          </div>
          <p className="text-xs text-[#5E6B7A] dark:text-[#B9CAD9] mt-0.5">
            Full enterprise requisition pipeline with multi-column filtering, expandable candidate submissions, and dual scrollbars
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Column Chooser Button */}
          <button
            onClick={() => setIsColumnDrawerOpen(true)}
            className="px-3 py-1.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] hover:bg-[#EAF4FC] hover:text-[#1769AA] rounded-xl text-xs font-semibold text-[#202B37] dark:text-[#F5F8FB] transition-colors flex items-center gap-1.5 shadow-xs"
            title="Edit displayed columns"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#1769AA]" />
            <span>Columns ({visibleColumns.length})</span>
          </button>

          {/* Send Requirement */}
          <button
            onClick={() => openSendModal()}
            className="px-3 py-1.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] hover:bg-[#EAF4FC] hover:text-[#1769AA] rounded-xl text-xs font-semibold text-[#202B37] dark:text-[#F5F8FB] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5 text-[#1769AA]" />
            <span>Send Requirement</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] hover:bg-[#EAF4FC] rounded-xl text-xs font-semibold text-[#202B37] dark:text-[#F5F8FB] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#7A8794]" />
            <span>Export CSV</span>
          </button>

          {/* + New Job Posting */}
          <button
            onClick={() => navigate('job-new')}
            className="px-4 py-1.5 bg-[#2F80E7] hover:bg-[#216BC4] text-white rounded-xl text-xs font-bold shadow-xs shadow-[#2F80E7]/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ New</span>
          </button>
        </div>
      </div>

      {/* Ceipal Quick View Sub-Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs border-b border-[#DCE6EF] dark:border-[#354A5C]">
        <button
          onClick={() => { setStatusFilter('All'); setPriorityFilter('All'); }}
          className={`px-3 py-1.5 font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 ${
            statusFilter === 'All' && priorityFilter === 'All'
              ? 'text-[#1769AA] border-[#1769AA] bg-[#EAF4FC]/60 dark:bg-[#22384B]/50'
              : 'text-[#5E6B7A] dark:text-[#B9CAD9] border-transparent hover:text-[#202B37] dark:hover:text-white'
          }`}
        >
          <span>All Jobs</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white dark:bg-[#1B2936] text-[#1769AA] border border-[#DCE6EF] font-mono">
            {jobs.length}
          </span>
        </button>

        <button
          onClick={() => { setStatusFilter('Active'); setPriorityFilter('All'); }}
          className={`px-3 py-1.5 font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 ${
            statusFilter === 'Active'
              ? 'text-[#1769AA] border-[#1769AA] bg-[#EAF4FC]/60 dark:bg-[#22384B]/50'
              : 'text-[#5E6B7A] dark:text-[#B9CAD9] border-transparent hover:text-[#202B37] dark:hover:text-white'
          }`}
        >
          <span>Active Postings</span>
          <span className="w-2 h-2 rounded-full bg-[#8AC9A7]"></span>
        </button>

        <button
          onClick={() => { setPriorityFilter('Urgent'); }}
          className={`px-3 py-1.5 font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 ${
            priorityFilter === 'Urgent'
              ? 'text-[#2F80E7] border-[#2F80E7] bg-[#2F80E7]/10'
              : 'text-[#5E6B7A] dark:text-[#B9CAD9] border-transparent hover:text-[#202B37] dark:hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-[#2F80E7]" />
          <span>Hot Priority</span>
        </button>

        <button
          onClick={() => { setStatusFilter('Open'); }}
          className={`px-3 py-1.5 font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 ${
            statusFilter === 'Open'
              ? 'text-[#1769AA] border-[#1769AA] bg-[#EAF4FC]/60'
              : 'text-[#5E6B7A] dark:text-[#B9CAD9] border-transparent hover:text-[#202B37] dark:hover:text-white'
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
      <div className="p-3 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-2xl shadow-xs space-y-2">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar with Integrated Scope Dropdown */}
          <div className="flex items-center flex-1 max-w-xl bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl overflow-hidden focus-within:border-[#1769AA] transition-colors">
            <div className="relative border-r border-[#DCE6EF] dark:border-[#354A5C]">
              <select
                value={searchScope}
                onChange={(e) => setSearchScope(e.target.value)}
                aria-label="Search Scope"
                className="appearance-none bg-transparent pl-3 pr-7 py-2 text-xs font-semibold text-[#202B37] dark:text-[#F5F8FB] focus:outline-none cursor-pointer"
              >
                {searchScopes.map((scope) => (
                  <option key={scope} value={scope} className="bg-white dark:bg-[#1B2936]">
                    {scope}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-[#7A8794] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search across ${searchScope.toLowerCase()}...`}
                className="w-full pl-3 pr-8 py-2 bg-transparent text-xs text-[#202B37] dark:text-[#F5F8FB] focus:outline-none placeholder-[#7A8794]"
              />
              {search ? (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 text-[#7A8794] hover:text-[#202B37] dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Search className="w-3.5 h-3.5 text-[#7A8794] absolute right-2.5 pointer-events-none" />
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
              className="bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl px-2.5 py-1.5 text-xs text-[#202B37] dark:text-[#F5F8FB] focus:outline-none focus:border-[#1769AA]"
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
              className="bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl px-2.5 py-1.5 text-xs text-[#202B37] dark:text-[#F5F8FB] focus:outline-none focus:border-[#1769AA]"
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
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#DCE6EF] dark:border-[#354A5C]">
            <span className="text-[11px] font-semibold text-[#5E6B7A] dark:text-[#B9CAD9]">
              Filtered by:
            </span>
            {Object.entries(columnFilters).map(([key, vals]) => {
              const colLabel = ALL_COLUMNS.find((c) => c.key === key)?.label || key;
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] bg-[#EAF4FC] dark:bg-[#22384B] text-[#1769AA] dark:text-[#D8E9F7] border border-[#1769AA]/30"
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
              className="text-[11px] text-[#1769AA] hover:underline"
            >
              Clear column filters
            </button>
          </div>
        )}
      </div>

      {/* Horizontal & Vertical Scroll Hint */}
      <div className="flex items-center justify-between text-[11px] text-[#7A8794] px-1">
        <span className="flex items-center gap-1">
          <ArrowUpDown className="w-3 h-3 text-[#1769AA]" />
          <span>Scroll table vertically and horizontally to inspect all requisition fields</span>
        </span>
        <span className="font-mono">
          Showing {filteredJobs.length} of {jobs.length} postings
        </span>
      </div>

      {/* Ceipal-Style High Density Data Grid with DUAL Scrollbars */}
      <div className="bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-2xl shadow-xs overflow-hidden relative">
        {/* Table Container with ceipal-table-scroll class for prominent vertical & horizontal scrollbars */}
        <div className="ceipal-table-scroll max-h-[68vh] overflow-x-auto overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs" style={{ minWidth: '2200px' }}>
            {/* Sticky Table Header */}
            <thead>
              <tr className="bg-[#F5F8FB] dark:bg-[#162431] border-b border-[#DCE6EF] dark:border-[#354A5C] text-[#5E6B7A] dark:text-[#B9CAD9]">
                {/* 1. Sticky Checkbox Column */}
                <th className="sticky top-0 left-0 z-30 p-2.5 w-10 text-center bg-[#F5F8FB] dark:bg-[#162431] border-r border-[#DCE6EF]/60">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredJobs.length && filteredJobs.length > 0}
                    onChange={handleSelectAll}
                    aria-label="Select all jobs"
                    className="rounded border-[#DCE6EF] text-[#1769AA] focus:ring-[#1769AA]"
                  />
                </th>

                {/* 2. Sticky Expand Submissions Button [+ 1] */}
                <th className="sticky top-0 left-[40px] z-30 w-16 p-2.5 text-center font-semibold bg-[#F5F8FB] dark:bg-[#162431] border-r border-[#DCE6EF]/60">
                  Submissions
                </th>

                {/* Dynamic Visible Columns with Header Filters */}
                {ALL_COLUMNS.filter((c) => visibleColumns.includes(c.key)).map((col) => {
                  const isFiltered = Boolean(columnFilters[col.key]);
                  const isSorted = sortBy?.key === col.key;

                  return (
                    <th
                      key={col.key}
                      className={`sticky top-0 z-20 p-2.5 font-semibold whitespace-nowrap bg-[#F5F8FB] dark:bg-[#162431] border-r border-[#DCE6EF]/40 ${col.minWidth}`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="truncate text-[#202B37] dark:text-white font-bold">{col.label}</span>

                        {/* Column Filter Dropdown Trigger (Ceipal ▼ icon) */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => openColumnFilter(col.key, e)}
                            className={`p-1 rounded hover:bg-[#EAF4FC] dark:hover:bg-[#22384B] transition-colors flex items-center gap-0.5 ${
                              isFiltered ? 'text-[#1769AA] bg-[#EAF4FC] font-bold' : 'text-[#7A8794]'
                            }`}
                            title={`Filter & sort ${col.label}`}
                          >
                            <span className="text-[10px]">▼</span>
                            {isFiltered && <span className="w-1.5 h-1.5 rounded-full bg-[#1769AA]"></span>}
                          </button>

                          {/* Filter Popover Dialog */}
                          {activeFilterCol === col.key && (
                            <div
                              ref={filterPopoverRef}
                              className="absolute left-0 mt-2 w-72 rounded-xl border border-[#CCD8E3] dark:border-[#4D6274] bg-white dark:bg-[#1B2936] p-3 shadow-2xl z-50 text-left font-normal"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-between pb-2 border-b border-[#DCE6EF] dark:border-[#354A5C]">
                                <span className="text-xs font-bold text-[#202B37] dark:text-white">
                                  Filter {col.label}
                                </span>
                                <button
                                  onClick={() => setActiveFilterCol(null)}
                                  className="text-[#7A8794] hover:text-[#202B37]"
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
                                      ? 'border-[#1769AA] text-[#1769AA] font-bold bg-[#EAF4FC]'
                                      : 'border-[#DCE6EF] dark:border-[#354A5C]'
                                  }`}
                                >
                                  Sort A → Z
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSortBy({ key: col.key, direction: 'desc' })}
                                  className={`flex-1 py-1 px-2 text-[10px] rounded border ${
                                    isSorted && sortBy.direction === 'desc'
                                      ? 'border-[#1769AA] text-[#1769AA] font-bold bg-[#EAF4FC]'
                                      : 'border-[#DCE6EF] dark:border-[#354A5C]'
                                  }`}
                                >
                                  Sort Z → A
                                </button>
                              </div>

                              {/* Search values input */}
                              <div className="relative my-2">
                                <Search className="w-3 h-3 text-[#7A8794] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                  type="text"
                                  placeholder="Search values..."
                                  value={filterSearchQuery}
                                  onChange={(e) => setFilterSearchQuery(e.target.value)}
                                  className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-lg text-[#202B37] dark:text-white focus:outline-none focus:border-[#1769AA]"
                                />
                              </div>

                              {/* Multi-select Checklist of Unique Values */}
                              <div className="max-h-40 overflow-y-auto space-y-1 py-1 border-t border-b border-[#DCE6EF] dark:border-[#354A5C] my-2 text-xs">
                                {(() => {
                                  const allVals = getUniqueValuesForCol(col.key);
                                  const displayedVals = allVals.filter((v) =>
                                    v.toLowerCase().includes(filterSearchQuery.toLowerCase())
                                  );

                                  if (displayedVals.length === 0) {
                                    return (
                                      <div className="text-[11px] text-[#7A8794] py-2 text-center">
                                        No values match
                                      </div>
                                    );
                                  }

                                  const isAllSelected = displayedVals.every((v) =>
                                    tempSelectedValues.includes(v)
                                  );

                                  return (
                                    <>
                                      <label className="flex items-center gap-2 p-1 hover:bg-[#F5F8FB] dark:hover:bg-[#162431] rounded cursor-pointer font-bold text-[#1769AA]">
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
                                          className="rounded border-[#DCE6EF] text-[#1769AA]"
                                        />
                                        <span>[Select all]</span>
                                      </label>
                                      {displayedVals.map((val) => (
                                        <label
                                          key={val}
                                          className="flex items-center gap-2 p-1 hover:bg-[#F5F8FB] dark:hover:bg-[#162431] rounded cursor-pointer text-[#202B37] dark:text-[#F5F8FB]"
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
                                            className="rounded border-[#DCE6EF] text-[#1769AA]"
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
                                  className="px-3 py-1 bg-[#2F80E7] hover:bg-[#216BC4] text-white font-bold rounded-lg text-xs"
                                >
                                  Search
                                </button>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => resetColumnFilter(col.key)}
                                    className="px-2.5 py-1 text-xs text-[#5E6B7A] dark:text-[#B9CAD9] hover:text-[#202B37]"
                                  >
                                    Reset
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActiveFilterCol(null)}
                                    className="px-2.5 py-1 text-xs text-[#1769AA] font-semibold"
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
                <th className="sticky top-0 right-0 z-20 bg-[#F5F8FB] dark:bg-[#162431] p-2.5 text-right font-semibold whitespace-nowrap min-w-[120px] shadow-xs">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#DCE6EF] dark:divide-[#354A5C]">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 3} className="p-12 text-center text-xs text-[#7A8794]">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Briefcase className="w-8 h-8 text-[#7A8794] mx-auto opacity-50" />
                      <div className="font-semibold text-[#202B37] dark:text-white">No job postings found</div>
                      <p className="text-[11px] text-[#5E6B7A] dark:text-[#B9CAD9]">
                        Try adjusting your search filters or create a new job posting.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((j) => {
                  const isExpanded = expandedJobIds.has(j.id);
                  const jobSubmissions = submissions.filter((s) => s.jobId === j.id);
                  const countSubmissions = jobSubmissions.length || (j.id === 'job-12262' ? 1 : 0);

                  return (
                    <React.Fragment key={j.id}>
                      <tr
                        className={`hover:bg-[#EAF4FC]/60 dark:hover:bg-[#22384B]/40 transition-colors group ${
                          isExpanded ? 'bg-[#F0F7FD] dark:bg-[#1E3244]' : ''
                        }`}
                      >
                        {/* 1. Checkbox */}
                        <td className="sticky left-0 z-10 p-2.5 text-center bg-white dark:bg-[#1B2936] group-hover:bg-[#EAF4FC] dark:group-hover:bg-[#22384B] border-r border-[#DCE6EF]/50">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(j.id)}
                            onChange={() => handleSelectOne(j.id)}
                            aria-label={`Select job ${j.code}`}
                            className="rounded border-[#DCE6EF] text-[#1769AA] focus:ring-[#1769AA]"
                          />
                        </td>

                        {/* 2. Ceipal Expand Submissions Button [+ 1] */}
                        <td className="sticky left-[40px] z-10 p-2.5 text-center bg-white dark:bg-[#1B2936] group-hover:bg-[#EAF4FC] dark:group-hover:bg-[#22384B] border-r border-[#DCE6EF]/50">
                          <button
                            type="button"
                            onClick={() => toggleRowExpansion(j.id)}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono transition-all flex items-center justify-center gap-0.5 mx-auto ${
                              isExpanded
                                ? 'bg-[#1769AA] text-white shadow-xs'
                                : 'bg-[#EAF4FC] dark:bg-[#22384B] text-[#1769AA] dark:text-[#D8E9F7] border border-[#1769AA]/30 hover:bg-[#1769AA] hover:text-white'
                            }`}
                            title={isExpanded ? 'Collapse submissions' : 'Expand applicant submissions'}
                          >
                            <span>{isExpanded ? '−' : '+'}</span>
                            <span>{countSubmissions}</span>
                          </button>
                        </td>

                        {/* Visible Data Columns */}
                        {ALL_COLUMNS.filter((c) => visibleColumns.includes(c.key)).map((col) => {
                          const val = getJobColumnValue(j, col.key);

                          if (col.key === 'code') {
                            return (
                              <td key={col.key} className="p-2.5 border-r border-[#DCE6EF]/30 font-mono font-bold">
                                <a
                                  href={getJobDetailUrl(j.id)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => handleJobClick(e, j.id)}
                                  className="text-[#1769AA] dark:text-[#5AA4E2] hover:underline flex items-center gap-1.5 group/link"
                                  title="Open in new tab"
                                >
                                  <Briefcase className="w-3.5 h-3.5 text-[#7A8794] flex-shrink-0" />
                                  <span>{j.code}</span>
                                  <ExternalLink className="w-3 h-3 opacity-60 group-hover/link:opacity-100 flex-shrink-0 text-[#1769AA]" />
                                </a>
                              </td>
                            );
                          }

                          if (col.key === 'title') {
                            return (
                              <td key={col.key} className="p-2.5 border-r border-[#DCE6EF]/30">
                                <a
                                  href={getJobDetailUrl(j.id)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => handleJobClick(e, j.id)}
                                  className="font-bold text-[#202B37] dark:text-white hover:text-[#1769AA] cursor-pointer transition-colors line-clamp-1 block"
                                  title={`${j.title} (Open in new tab)`}
                                >
                                  {j.title}
                                </a>
                                <div className="flex items-center gap-2 text-[11px] text-[#7A8794] mt-0.5">
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
                              <td key={col.key} className="p-2.5 border-r border-[#DCE6EF]/30">
                                <div className="font-semibold text-[#202B37] dark:text-white flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-[#7A8794] flex-shrink-0" />
                                  <span className="truncate">{j.client}</span>
                                </div>
                              </td>
                            );
                          }

                          if (col.key === 'location') {
                            return (
                              <td key={col.key} className="p-2.5 border-r border-[#DCE6EF]/30 text-[#5E6B7A] dark:text-[#B9CAD9]">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-[#8AC9A7] flex-shrink-0" />
                                  <span className="truncate font-mono text-[11px]">{j.location}</span>
                                </div>
                              </td>
                            );
                          }

                          if (col.key === 'status') {
                            return (
                              <td key={col.key} className="p-2.5 border-r border-[#DCE6EF]/30">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                    j.status === 'Active' || j.status === 'Open'
                                      ? 'bg-[#8AC9A7]/20 text-[#1E4D36] border-[#8AC9A7]/40 dark:text-[#8AC9A7]'
                                      : j.status === 'Sourcing'
                                      ? 'bg-[#EAF4FC] text-[#1769AA] border-[#1769AA]/30 dark:bg-[#22384B] dark:text-[#D8E9F7]'
                                      : j.status === 'In Review'
                                      ? 'bg-[#2F80E7]/15 text-[#2F80E7] border-[#2F80E7]/30'
                                      : 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      j.status === 'Active' || j.status === 'Open' ? 'bg-[#276749]' : 'bg-[#1769AA]'
                                    }`}
                                  ></span>
                                  {j.status}
                                </span>
                              </td>
                            );
                          }

                          return (
                            <td
                              key={col.key}
                              className="p-2.5 border-r border-[#DCE6EF]/30 text-[#5E6B7A] dark:text-[#B9CAD9] truncate"
                              title={val}
                            >
                              {val}
                            </td>
                          );
                        })}

                        {/* Actions column */}
                        <td className="sticky right-0 z-10 p-2.5 text-right whitespace-nowrap bg-white dark:bg-[#1B2936] group-hover:bg-[#EAF4FC] dark:group-hover:bg-[#22384B] shadow-xs">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openSendModal(j)}
                              title="Send Requirement"
                              className="p-1.5 text-[#5E6B7A] hover:text-[#1769AA] hover:bg-white dark:hover:bg-[#162431] rounded-lg transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={getJobDetailUrl(j.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => handleJobClick(e, j.id)}
                              className="px-2.5 py-1 text-xs text-[#1769AA] hover:text-white hover:bg-[#1769AA] border border-[#1769AA]/30 rounded-lg transition-all font-semibold inline-flex items-center gap-1"
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
                        <tr className="bg-[#F8FAFD] dark:bg-[#142330] border-y-2 border-[#1769AA]/30">
                          <td colSpan={visibleColumns.length + 3} className="p-4">
                            <div className="rounded-xl border border-[#DCE6EF] dark:border-[#354A5C] bg-white dark:bg-[#1B2936] p-4 shadow-sm space-y-3">
                              {/* Submissions Header Strip */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DCE6EF] dark:border-[#354A5C]">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-1 bg-[#1769AA] text-white rounded-lg text-xs font-bold font-mono">
                                    Submissions ({countSubmissions})
                                  </span>
                                  <span className="text-xs font-semibold text-[#202B37] dark:text-white">
                                    Applicants attached to {j.code} ({j.title})
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <a
                                    href={getJobDetailUrl(j.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => handleJobClick(e, j.id)}
                                    className="px-3 py-1 bg-[#EAF4FC] dark:bg-[#22384B] text-[#1769AA] dark:text-[#D8E9F7] hover:bg-[#1769AA] hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                  >
                                    <span>Full Job Snapshot &amp; Matching in New Tab</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              </div>

                              {/* Ceipal Submissions Quick Filter Strip */}
                              <div className="flex items-center gap-2 overflow-x-auto text-xs text-[#5E6B7A] dark:text-[#B9CAD9] pb-1">
                                <div className="relative min-w-[200px]">
                                  <input
                                    type="text"
                                    placeholder="Applicant Name / Submission ID..."
                                    className="w-full pl-7 pr-3 py-1 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-lg text-xs"
                                  />
                                  <Search className="w-3 h-3 text-[#7A8794] absolute left-2 top-1/2 -translate-y-1/2" />
                                </div>
                                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-[11px]">Score 30%+</span>
                                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-[11px]">Status: All</span>
                                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-[11px]">Source: All</span>
                              </div>

                              {/* Ceipal Submissions Table */}
                              <div className="overflow-x-auto border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl">
                                <table className="w-full text-left text-xs min-w-[1300px]">
                                  <thead className="bg-[#F5F8FB] dark:bg-[#162431] border-b border-[#DCE6EF] dark:border-[#354A5C] text-[#5E6B7A] dark:text-[#B9CAD9]">
                                    <tr>
                                      <th className="p-2.5 w-8 text-center">
                                        <input type="checkbox" className="rounded" />
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
                                  <tbody className="divide-y divide-[#DCE6EF] dark:divide-[#354A5C]">
                                    {/* Default authentic Ceipal Demo User submission from screenshot */}
                                    <tr className="hover:bg-[#EAF4FC]/40 transition-colors">
                                      <td className="p-2.5 text-center">
                                        <input type="checkbox" className="rounded" />
                                      </td>
                                      <td className="p-2.5 font-mono font-bold text-[#1769AA]">
                                        48148
                                      </td>
                                      <td className="p-2.5">
                                        <div
                                          onClick={() => navigate('applicant-detail', 'app-demo')}
                                          className="font-bold text-[#202B37] dark:text-white hover:underline cursor-pointer flex items-center gap-1.5"
                                        >
                                          <span>Demo User</span>
                                          <span className="text-[10px] px-1 bg-blue-100 text-blue-700 rounded">Verified</span>
                                        </div>
                                      </td>
                                      <td className="p-2.5 font-mono text-[#1769AA]">
                                        +91 9423022606
                                      </td>
                                      <td className="p-2.5">
                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                          Waiting for Evaluation by Internal Reviewer
                                        </span>
                                      </td>
                                      <td className="p-2.5 font-mono font-bold text-[#1769AA]">
                                        35%
                                      </td>
                                      <td className="p-2.5 text-[#5E6B7A] dark:text-[#B9CAD9]">
                                        Nashik, India
                                      </td>
                                      <td className="p-2.5 text-[#5E6B7A] dark:text-[#B9CAD9]">
                                        5 Years 10 Months
                                      </td>
                                      <td className="p-2.5">
                                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px]">
                                          Naukri
                                        </span>
                                      </td>
                                      <td className="p-2.5 text-center">
                                        <button
                                          onClick={() => showToast('Displaying Resume for Demo User')}
                                          className="p-1 text-[#1769AA] hover:bg-[#EAF4FC] rounded"
                                          title="View Resume"
                                        >
                                          <FileText className="w-4 h-4 mx-auto" />
                                        </button>
                                      </td>
                                      <td className="p-2.5 font-mono text-[#5E6B7A]">
                                        15 Days
                                      </td>
                                      <td className="p-2.5 text-[#5E6B7A] dark:text-[#B9CAD9]">
                                        Ganesh Godse
                                      </td>
                                      <td className="p-2.5 font-mono text-[11px] text-[#7A8794]">
                                        10/11/2026 20:10:42
                                      </td>
                                      <td className="p-2.5 text-right">
                                        <button
                                          onClick={() => navigate('applicant-detail', 'app-demo')}
                                          className="px-2.5 py-1 text-xs text-[#1769AA] hover:bg-[#EAF4FC] rounded-lg font-semibold"
                                        >
                                          Review Profile
                                        </button>
                                      </td>
                                    </tr>

                                    {/* Additional matching applicants for this job */}
                                    {applicants
                                      .filter((a) => a.assignedJobId === j.id && a.id !== 'app-demo')
                                      .map((a, idx) => (
                                        <tr key={a.id} className="hover:bg-[#EAF4FC]/40 transition-colors">
                                          <td className="p-2.5 text-center">
                                            <input type="checkbox" className="rounded" />
                                          </td>
                                          <td className="p-2.5 font-mono font-bold text-[#1769AA]">
                                            4815{idx + 1}
                                          </td>
                                          <td className="p-2.5">
                                            <div
                                              onClick={() => navigate('applicant-detail', a.id)}
                                              className="font-bold text-[#202B37] dark:text-white hover:underline cursor-pointer"
                                            >
                                              {a.name}
                                            </div>
                                          </td>
                                          <td className="p-2.5 font-mono text-[#1769AA]">
                                            {a.phone}
                                          </td>
                                          <td className="p-2.5">
                                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#1769AA] border border-blue-200">
                                              {a.status}
                                            </span>
                                          </td>
                                          <td className="p-2.5 font-mono font-bold text-[#276749]">
                                            {a.matchScore}%
                                          </td>
                                          <td className="p-2.5 text-[#5E6B7A] dark:text-[#B9CAD9]">
                                            {a.location}
                                          </td>
                                          <td className="p-2.5 text-[#5E6B7A] dark:text-[#B9CAD9]">
                                            {a.experienceYears} Years
                                          </td>
                                          <td className="p-2.5">
                                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px]">
                                              {a.source}
                                            </span>
                                          </td>
                                          <td className="p-2.5 text-center">
                                            <button
                                              onClick={() => showToast(`Resume opened for ${a.name}`)}
                                              className="p-1 text-[#1769AA] hover:bg-[#EAF4FC] rounded"
                                            >
                                              <FileText className="w-4 h-4 mx-auto" />
                                            </button>
                                          </td>
                                          <td className="p-2.5 font-mono text-[#5E6B7A]">
                                            {a.noticePeriod || '30 Days'}
                                          </td>
                                          <td className="p-2.5 text-[#5E6B7A] dark:text-[#B9CAD9]">
                                            {a.assignedRecruiter}
                                          </td>
                                          <td className="p-2.5 font-mono text-[11px] text-[#7A8794]">
                                            10/11/2026 18:00
                                          </td>
                                          <td className="p-2.5 text-right">
                                            <button
                                              onClick={() => navigate('applicant-detail', a.id)}
                                              className="px-2.5 py-1 text-xs text-[#1769AA] hover:bg-[#EAF4FC] rounded-lg font-semibold"
                                            >
                                              Review Profile
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
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
        <div className="p-3 bg-[#F5F8FB] dark:bg-[#162431] border-t border-[#DCE6EF] dark:border-[#354A5C] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5E6B7A] dark:text-[#B9CAD9]">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-[#202B37] dark:text-white">1 - {filteredJobs.length}</strong> of{' '}
              <strong className="text-[#202B37] dark:text-white">11,779</strong> results
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              className="px-2.5 py-1 rounded-lg border border-[#DCE6EF] dark:border-[#354A5C] bg-white dark:bg-[#1B2936] text-[#202B37] dark:text-white disabled:opacity-50"
              disabled
            >
              « First
            </button>
            <button
              className="px-2.5 py-1 rounded-lg border border-[#DCE6EF] dark:border-[#354A5C] bg-white dark:bg-[#1B2936] text-[#202B37] dark:text-white disabled:opacity-50"
              disabled
            >
              ‹ Prev
            </button>
            <button className="px-2.5 py-1 rounded-lg bg-[#1769AA] text-white font-bold">1</button>
            <button className="px-2.5 py-1 rounded-lg border border-[#DCE6EF] dark:border-[#354A5C] bg-white dark:bg-[#1B2936] text-[#202B37] dark:text-white">
              2
            </button>
            <button className="px-2.5 py-1 rounded-lg border border-[#DCE6EF] dark:border-[#354A5C] bg-white dark:bg-[#1B2936] text-[#202B37] dark:text-white">
              3
            </button>
            <span className="px-1 text-[#7A8794]">...</span>
            <button className="px-2.5 py-1 rounded-lg border border-[#DCE6EF] dark:border-[#354A5C] bg-white dark:bg-[#1B2936] text-[#202B37] dark:text-white">
              472
            </button>
            <button className="px-2.5 py-1 rounded-lg border border-[#DCE6EF] dark:border-[#354A5C] bg-white dark:bg-[#1B2936] text-[#202B37] dark:text-white">
              Next ›
            </button>
            <button className="px-2.5 py-1 rounded-lg border border-[#DCE6EF] dark:border-[#354A5C] bg-white dark:bg-[#1B2936] text-[#202B37] dark:text-white">
              Last »
            </button>

            <div className="ml-2 flex items-center gap-1">
              <select
                aria-label="Items per page"
                className="bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-lg px-2 py-1 text-xs text-[#202B37] dark:text-white focus:outline-none"
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
          <div className="bg-white dark:bg-[#1B2936] border-l border-[#DCE6EF] dark:border-[#354A5C] w-full max-w-sm h-full shadow-2xl flex flex-col p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE6EF] dark:border-[#354A5C]">
              <div>
                <h3 className="text-base font-bold text-[#202B37] dark:text-white">Edit Columns</h3>
                <p className="text-xs text-[#5E6B7A] dark:text-[#B9CAD9]">
                  {visibleColumns.length} of {ALL_COLUMNS.length} selected
                </p>
              </div>
              <button
                onClick={() => setIsColumnDrawerOpen(false)}
                className="text-[#7A8794] hover:text-[#202B37] dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#7A8794] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search columns..."
                value={columnDrawerSearch}
                onChange={(e) => setColumnDrawerSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl text-xs text-[#202B37] dark:text-white focus:outline-none focus:border-[#1769AA]"
              />
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <button
                type="button"
                onClick={() => setVisibleColumns(ALL_COLUMNS.map((c) => c.key))}
                className="text-[#1769AA] font-semibold hover:underline"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setVisibleColumns(['code', 'title', 'client', 'status'])}
                className="text-[#7A8794] hover:underline"
              >
                Reset to Default
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 divide-y divide-[#DCE6EF]/50 dark:divide-[#354A5C]/50">
              {ALL_COLUMNS.filter((c) =>
                c.label.toLowerCase().includes(columnDrawerSearch.toLowerCase())
              ).map((col) => {
                const isChecked = visibleColumns.includes(col.key);
                return (
                  <label
                    key={col.key}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F8FB] dark:hover:bg-[#162431] cursor-pointer text-xs"
                  >
                    <span className="font-medium text-[#202B37] dark:text-white">{col.label}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setVisibleColumns([...visibleColumns, col.key]);
                        } else {
                          if (visibleColumns.length > 2) {
                            setVisibleColumns(visibleColumns.filter((k) => k !== col.key));
                          } else {
                            showToast('At least 2 columns must remain visible');
                          }
                        }
                      }}
                      className="rounded border-[#DCE6EF] text-[#1769AA] focus:ring-[#1769AA]"
                    />
                  </label>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#DCE6EF] dark:border-[#354A5C] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsColumnDrawerOpen(false)}
                className="px-4 py-2 bg-[#2F80E7] text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Requirement Modal */}
      {isSendModalOpen && selectedJobForSend && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE6EF] dark:border-[#354A5C]">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#1769AA]" />
                <h3 className="text-base font-bold text-[#202B37] dark:text-white">
                  Send Requirement to Vendors &amp; Network
                </h3>
              </div>
              <button
                onClick={() => setIsSendModalOpen(false)}
                className="text-[#7A8794] hover:text-[#202B37] dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#F5F8FB] dark:bg-[#162431] rounded-xl space-y-1 text-xs">
              <div className="font-bold text-[#1769AA] font-mono">{selectedJobForSend.code}</div>
              <div className="font-bold text-[#202B37] dark:text-white">{selectedJobForSend.title}</div>
              <div className="text-[#5E6B7A] dark:text-[#B9CAD9]">
                Client: {selectedJobForSend.client} • Location: {selectedJobForSend.location}
              </div>
            </div>

            <form onSubmit={handleSendRequirement} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#202B37] dark:text-white">
                  Recipient Emails (comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  value={recipientEmails}
                  onChange={(e) => setRecipientEmails(e.target.value)}
                  placeholder="vendor-network@ampcus.com, partners@recruiting.net"
                  className="w-full px-3 py-2 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl text-xs text-[#202B37] dark:text-[#F5F8FB] focus:outline-none focus:border-[#1769AA]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSendModalOpen(false)}
                  className="px-4 py-2 border border-[#DCE6EF] dark:border-[#354A5C] text-[#5E6B7A] rounded-xl hover:bg-gray-50 dark:hover:bg-[#162431]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2F80E7] hover:bg-[#216BC4] text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-xs shadow-[#2F80E7]/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Requirement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
