import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
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
  ArrowUpDown
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { Job, JobStatus, Priority } from '../../types';

export const JobList: React.FC = () => {
  const { navigate } = useAppStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [searchScope, setSearchScope] = useState<string>('Search Any');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [businessUnitFilter, setBusinessUnitFilter] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedJobForSend, setSelectedJobForSend] = useState<Job | null>(null);
  const [recipientEmails, setRecipientEmails] = useState('');

  // Ceipal search-scope options from screenshot
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
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredJobs = jobs.filter((j) => {
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
      } else if (searchScope === 'Sales Manager') {
        matchesSearch = (j.salesManager || '').toLowerCase().includes(q);
      } else if (searchScope === 'Account Manager') {
        matchesSearch = (j.accountManager || '').toLowerCase().includes(q);
      } else if (searchScope === 'Job Type') {
        matchesSearch = (j.type || '').toLowerCase().includes(q);
      } else {
        // Search Any
        matchesSearch =
          j.title.toLowerCase().includes(q) ||
          j.code.toLowerCase().includes(q) ||
          j.client.toLowerCase().includes(q) ||
          (j.clientJobId || '').toLowerCase().includes(q) ||
          (j.businessUnit || '').toLowerCase().includes(q) ||
          (j.states || '').toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          (j.assignedTo || j.assignedRecruiter || '').toLowerCase().includes(q) ||
          (j.skills || []).some((s) => s.toLowerCase().includes(q));
      }
    }

    const matchesStatus = statusFilter === 'All' || j.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || j.priority === priorityFilter;
    const matchesUnit =
      businessUnitFilter === 'All' || j.businessUnit === businessUnitFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesUnit;
  });

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
    link.setAttribute('download', `JobPostings_Ceipal_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredJobs.length} job postings to CSV.`);
  };

  const handleBulkStatusChange = async (newStatus: JobStatus) => {
    for (const id of selectedIds) {
      await ApiService.updateJob(id, { status: newStatus });
    }
    const updated = await ApiService.getJobs();
    setJobs(updated);
    setSelectedIds([]);
    showToast(`Updated status to "${newStatus}" for ${selectedIds.length} job postings.`);
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

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#402568] text-white border border-[#6941C6] px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#8AC9A7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Ceipal Top Tab Views & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-[#292633] dark:text-white">
              Job Posting
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1EBFA] dark:bg-[#312845] text-[#6941C6] dark:text-[#D1C5E4] border border-[#6941C6]/20">
              {filteredJobs.length} Active
            </span>
          </div>
          <p className="text-xs text-[#5F5972] dark:text-[#B9B2CE] mt-0.5">
            Manage open job postings, client requisitions, recruiter allocations, and submission pipelines
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Send Requirement Button (Ceipal Feature) */}
          <button
            onClick={() => openSendModal()}
            className="px-3.5 py-2 bg-white dark:bg-[#221D2E] border border-[#E9E6EF] dark:border-[#383049] hover:bg-[#F1EBFA] hover:text-[#6941C6] rounded-xl text-xs font-semibold text-[#292633] dark:text-[#F8F7FB] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5 text-[#6941C6]" />
            <span>Send Requirement</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white dark:bg-[#221D2E] border border-[#E9E6EF] dark:border-[#383049] hover:bg-[#F1EBFA] rounded-xl text-xs font-semibold text-[#292633] dark:text-[#F8F7FB] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#8E88A2]" />
            <span>Export CSV</span>
          </button>

          {/* Primary Action: + New Job Posting (Routes to 3-Way Ceipal Flow) */}
          <button
            onClick={() => navigate('job-new')}
            className="px-4 py-2 bg-[#FF8243] hover:bg-[#E96F30] text-white rounded-xl text-xs font-semibold shadow-xs shadow-[#FF8243]/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ New</span>
          </button>
        </div>
      </div>

      {/* Ceipal Quick View Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs border-b border-[#E9E6EF] dark:border-[#383049]">
        <button
          onClick={() => { setStatusFilter('All'); setPriorityFilter('All'); }}
          className={`px-3 py-1.5 font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 ${
            statusFilter === 'All' && priorityFilter === 'All'
              ? 'text-[#6941C6] border-[#6941C6] bg-[#F1EBFA]/60 dark:bg-[#312845]/50'
              : 'text-[#5F5972] dark:text-[#B9B2CE] border-transparent hover:text-[#292633] dark:hover:text-white'
          }`}
        >
          <span>All Jobs</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white dark:bg-[#221D2E] text-[#6941C6] border border-[#E9E6EF] font-mono">
            {jobs.length}
          </span>
        </button>

        <button
          onClick={() => { setStatusFilter('Active'); setPriorityFilter('All'); }}
          className={`px-3 py-1.5 font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 ${
            statusFilter === 'Active'
              ? 'text-[#6941C6] border-[#6941C6] bg-[#F1EBFA]/60 dark:bg-[#312845]/50'
              : 'text-[#5F5972] dark:text-[#B9B2CE] border-transparent hover:text-[#292633] dark:hover:text-white'
          }`}
        >
          <span>Active Postings</span>
          <span className="w-2 h-2 rounded-full bg-[#8AC9A7]"></span>
        </button>

        <button
          onClick={() => { setPriorityFilter('Urgent'); }}
          className={`px-3 py-1.5 font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 ${
            priorityFilter === 'Urgent'
              ? 'text-[#FF8243] border-[#FF8243] bg-[#FF8243]/10'
              : 'text-[#5F5972] dark:text-[#B9B2CE] border-transparent hover:text-[#292633] dark:hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-[#FF8243]" />
          <span>Hot Priority</span>
        </button>

        <button
          onClick={() => { setStatusFilter('Open'); }}
          className={`px-3 py-1.5 font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 ${
            statusFilter === 'Open'
              ? 'text-[#6941C6] border-[#6941C6] bg-[#F1EBFA]/60'
              : 'text-[#5F5972] dark:text-[#B9B2CE] border-transparent hover:text-[#292633] dark:hover:text-white'
          }`}
        >
          <span>Open Sourcing</span>
        </button>

        <div className="ml-auto text-xs text-[#8E88A2] flex items-center gap-1">
          <button className="px-2 py-1 hover:text-[#6941C6] flex items-center gap-1 transition-colors">
            <Plus className="w-3 h-3" />
            <span>Add View</span>
          </button>
        </div>
      </div>

      {/* Ceipal Filter and Specialized Search Bar */}
      <div className="p-4 bg-white dark:bg-[#221D2E] border border-[#E9E6EF] dark:border-[#383049] rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar with Integrated Scope Dropdown (Exact Ceipal pattern) */}
          <div className="flex items-center flex-1 max-w-2xl bg-[#F8F7FB] dark:bg-[#1A1624] border border-[#E9E6EF] dark:border-[#383049] rounded-xl overflow-hidden focus-within:border-[#6941C6] transition-colors">
            <div className="relative border-r border-[#E9E6EF] dark:border-[#383049]">
              <select
                value={searchScope}
                onChange={(e) => setSearchScope(e.target.value)}
                aria-label="Search Scope"
                className="appearance-none bg-transparent pl-3 pr-8 py-2 text-xs font-semibold text-[#292633] dark:text-[#F8F7FB] focus:outline-none cursor-pointer"
              >
                {searchScopes.map((scope) => (
                  <option key={scope} value={scope} className="bg-white dark:bg-[#221D2E]">
                    {scope}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#8E88A2] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search by ${searchScope.toLowerCase()}...`}
                className="w-full pl-3 pr-8 py-2 bg-transparent text-xs text-[#292633] dark:text-[#F8F7FB] focus:outline-none placeholder-[#8E88A2]"
              />
              {search ? (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 text-[#8E88A2] hover:text-[#292633] dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Search className="w-3.5 h-3.5 text-[#8E88A2] absolute right-2.5 pointer-events-none" />
              )}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-[#5F5972] dark:text-[#B9B2CE]">
              <span className="text-[11px] font-medium text-[#8E88A2]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#F8F7FB] dark:bg-[#1A1624] border border-[#E9E6EF] dark:border-[#383049] rounded-xl px-2.5 py-1.5 text-xs text-[#292633] dark:text-[#F8F7FB] focus:outline-none focus:border-[#6941C6]"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Open">Open</option>
                <option value="Sourcing">Sourcing</option>
                <option value="In Review">In Review</option>
                <option value="Closed">Closed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 text-xs text-[#5F5972] dark:text-[#B9B2CE]">
              <span className="text-[11px] font-medium text-[#8E88A2]">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-[#F8F7FB] dark:bg-[#1A1624] border border-[#E9E6EF] dark:border-[#383049] rounded-xl px-2.5 py-1.5 text-xs text-[#292633] dark:text-[#F8F7FB] focus:outline-none focus:border-[#6941C6]"
              >
                <option value="All">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Business Unit Filter */}
            <div className="flex items-center gap-1.5 text-xs text-[#5F5972] dark:text-[#B9B2CE]">
              <span className="text-[11px] font-medium text-[#8E88A2]">Unit:</span>
              <select
                value={businessUnitFilter}
                onChange={(e) => setBusinessUnitFilter(e.target.value)}
                className="bg-[#F8F7FB] dark:bg-[#1A1624] border border-[#E9E6EF] dark:border-[#383049] rounded-xl px-2.5 py-1.5 text-xs text-[#292633] dark:text-[#F8F7FB] focus:outline-none focus:border-[#6941C6]"
              >
                <option value="All">All Units</option>
                <option value="Ampcus Tech Pvt Ltd">Ampcus Tech Pvt Ltd</option>
                <option value="Core Engineering">Core Engineering</option>
                <option value="Cloud & AI Practice">Cloud & AI Practice</option>
                <option value="Fintech & Enterprise">Fintech & Enterprise</option>
                <option value="Healthcare Practice">Healthcare Practice</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar (when rows selected) */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-[#402568] text-white rounded-2xl flex items-center justify-between text-xs animate-in fade-in shadow-md">
          <span className="font-mono text-[#F1EBFA] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8AC9A7] animate-pulse"></span>
            {selectedIds.length} job postings selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusChange('Active')}
              className="px-3 py-1 bg-[#8AC9A7] hover:bg-[#72B491] text-[#1E4D36] font-bold rounded-lg transition-colors"
            >
              Mark Active
            </button>
            <button
              onClick={() => handleBulkStatusChange('Sourcing')}
              className="px-3 py-1 bg-[#6941C6] hover:bg-[#502E80] text-white font-bold rounded-lg transition-colors"
            >
              Mark Sourcing
            </button>
            <button
              onClick={() => handleBulkStatusChange('On Hold')}
              className="px-3 py-1 bg-[#FF8243] hover:bg-[#E96F30] text-white font-bold rounded-lg transition-colors"
            >
              Put On Hold
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2 py-1 text-[#D1C5E4] hover:text-white transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Ceipal-Style High Density Data Grid */}
      <div className="bg-white dark:bg-[#221D2E] border border-[#E9E6EF] dark:border-[#383049] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F7FB] dark:bg-[#1A1624] border-b border-[#E9E6EF] dark:border-[#383049] text-[#5F5972] dark:text-[#B9B2CE]">
                <th className="p-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredJobs.length && filteredJobs.length > 0}
                    onChange={handleSelectAll}
                    aria-label="Select all jobs"
                    className="rounded border-[#E9E6EF] text-[#6941C6] focus:ring-[#6941C6]"
                  />
                </th>
                <th className="p-3 w-14 text-center font-semibold">Flags</th>
                <th className="p-3 font-semibold whitespace-nowrap">Job Code</th>
                <th className="p-3 font-semibold min-w-[200px]">Job Title</th>
                <th className="p-3 font-semibold min-w-[150px]">Business Unit</th>
                <th className="p-3 font-semibold min-w-[140px]">Client</th>
                <th className="p-3 font-semibold whitespace-nowrap">Client Job ID</th>
                <th className="p-3 font-semibold min-w-[150px]">Location</th>
                <th className="p-3 font-semibold min-w-[130px]">States</th>
                <th className="p-3 font-semibold whitespace-nowrap">Job Status</th>
                <th className="p-3 font-semibold whitespace-nowrap">Bill / Pay Rate</th>
                <th className="p-3 font-semibold whitespace-nowrap">Assigned To</th>
                <th className="p-3 font-semibold text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E6EF] dark:divide-[#383049]">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-12 text-center text-xs text-[#8E88A2]">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Briefcase className="w-8 h-8 text-[#8E88A2] mx-auto opacity-50" />
                      <div className="font-semibold text-[#292633] dark:text-white">No job postings found</div>
                      <p className="text-[11px] text-[#5F5972] dark:text-[#B9B2CE]">
                        Try adjusting your search criteria or create a new job posting.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((j) => (
                  <tr
                    key={j.id}
                    className="hover:bg-[#F1EBFA]/50 dark:hover:bg-[#312845]/40 transition-colors group"
                  >
                    {/* Checkbox */}
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(j.id)}
                        onChange={() => handleSelectOne(j.id)}
                        aria-label={`Select job ${j.code}`}
                        className="rounded border-[#E9E6EF] text-[#6941C6] focus:ring-[#6941C6]"
                      />
                    </td>

                    {/* Flags / Hot Indicator / Submissions Count (Ceipal format) */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Hot / Priority indicator */}
                        {j.priority === 'Urgent' ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FF8243] inline-block shadow-xs shadow-[#FF8243]/50" title="Hot / Urgent Requisition"></span>
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#8AC9A7] inline-block" title="Normal Active"></span>
                        )}

                        {/* Submission badge */}
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F1EBFA] dark:bg-[#312845] text-[#6941C6] dark:text-[#D1C5E4] border border-[#6941C6]/30 font-mono"
                          title={`${j.applicantsCount || 0} Submissions`}
                        >
                          +{j.applicantsCount || 0}
                        </span>
                      </div>
                    </td>

                    {/* Job Code */}
                    <td className="p-3">
                      <div className="flex items-center gap-1 font-mono font-bold text-[#6941C6] dark:text-[#D1C5E4] hover:underline cursor-pointer"
                           onClick={() => navigate('job-detail', j.id)}>
                        <Briefcase className="w-3 h-3 text-[#8E88A2]" />
                        <span>{j.code}</span>
                      </div>
                    </td>

                    {/* Job Title */}
                    <td className="p-3">
                      <div
                        onClick={() => navigate('job-detail', j.id)}
                        className="font-bold text-[#292633] dark:text-white hover:text-[#6941C6] cursor-pointer transition-colors line-clamp-1"
                        title={j.title}
                      >
                        {j.title}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#8E88A2] mt-0.5">
                        <span>{j.type}</span>
                        {j.remoteJob && (
                          <>
                            <span>•</span>
                            <span className="text-[#6941C6] font-medium">{j.remoteJob}</span>
                          </>
                        )}
                        {j.duration && (
                          <>
                            <span>•</span>
                            <span>{j.duration}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Business Unit */}
                    <td className="p-3 text-[#5F5972] dark:text-[#B9B2CE]">
                      <div className="font-medium text-[#292633] dark:text-white truncate max-w-[160px]">
                        {j.businessUnit || 'Ampcus Tech Pvt Ltd'}
                      </div>
                    </td>

                    {/* Client */}
                    <td className="p-3">
                      <div className="font-semibold text-[#292633] dark:text-white flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-[#8E88A2] flex-shrink-0" />
                        <span className="truncate max-w-[140px]">{j.client}</span>
                      </div>
                    </td>

                    {/* Client Job ID */}
                    <td className="p-3">
                      {j.clientJobId ? (
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F8F7FB] dark:bg-[#1A1624] text-[#5F5972] dark:text-[#B9B2CE] border border-[#E9E6EF] dark:border-[#383049]">
                          {j.clientJobId}
                        </span>
                      ) : (
                        <span className="text-[#8E88A2] italic text-[11px]">—</span>
                      )}
                    </td>

                    {/* Location */}
                    <td className="p-3 text-[#5F5972] dark:text-[#B9B2CE]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#8AC9A7] flex-shrink-0" />
                        <span className="truncate max-w-[160px] font-mono text-[11px]">{j.location}</span>
                      </div>
                    </td>

                    {/* States */}
                    <td className="p-3 text-[#5F5972] dark:text-[#B9B2CE]">
                      <span className="truncate max-w-[130px] block" title={j.states || 'All States'}>
                        {j.states || 'All States'}
                      </span>
                    </td>

                    {/* Job Status */}
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          j.status === 'Active' || j.status === 'Open'
                            ? 'bg-[#8AC9A7]/20 text-[#1E4D36] border-[#8AC9A7]/40 dark:text-[#8AC9A7]'
                            : j.status === 'Sourcing'
                            ? 'bg-[#F1EBFA] text-[#6941C6] border-[#6941C6]/30 dark:bg-[#312845] dark:text-[#D1C5E4]'
                            : j.status === 'In Review'
                            ? 'bg-[#FF8243]/15 text-[#FF8243] border-[#FF8243]/30'
                            : 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          j.status === 'Active' || j.status === 'Open' ? 'bg-[#276749]' : 'bg-[#6941C6]'
                        }`}></span>
                        {j.status}
                      </span>
                    </td>

                    {/* Bill / Pay Rate */}
                    <td className="p-3 font-mono tabular-nums">
                      <div className="font-bold text-[#292633] dark:text-white">
                        {j.currency === 'INR' ? '₹' : '$'}{j.billRate}/{j.rateType === 'Yearly' ? 'yr' : 'hr'}
                      </div>
                      <div className="text-[10px] text-[#5F5972] dark:text-[#B9B2CE]">
                        Pay: {j.currency === 'INR' ? '₹' : '$'}{j.payRate}/{j.rateType === 'Yearly' ? 'yr' : 'hr'}
                      </div>
                    </td>

                    {/* Assigned To */}
                    <td className="p-3 text-[#5F5972] dark:text-[#B9B2CE]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-[#6941C6]/15 text-[#6941C6] flex items-center justify-center font-bold text-[10px]">
                          {(j.assignedTo || j.assignedRecruiter || 'R')[0]}
                        </div>
                        <span className="truncate max-w-[110px]">{j.assignedTo || j.assignedRecruiter}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openSendModal(j)}
                          title="Send Requirement"
                          className="p-1.5 text-[#5F5972] hover:text-[#6941C6] hover:bg-[#F1EBFA] dark:hover:bg-[#312845] rounded-lg transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => navigate('job-detail', j.id)}
                          className="px-2.5 py-1 text-xs text-[#6941C6] hover:text-[#502E80] hover:bg-[#F1EBFA] dark:hover:bg-[#312845] rounded-lg transition-colors font-semibold"
                        >
                          View Dossier
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Ceipal Pagination Footer Bar */}
        <div className="p-3 bg-[#F8F7FB] dark:bg-[#1A1624] border-t border-[#E9E6EF] dark:border-[#383049] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5F5972] dark:text-[#B9B2CE]">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-[#292633] dark:text-white">1 - {filteredJobs.length}</strong> of{' '}
              <strong className="text-[#292633] dark:text-white">11,779</strong> results
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button className="px-2.5 py-1 rounded-lg border border-[#E9E6EF] dark:border-[#383049] bg-white dark:bg-[#221D2E] hover:bg-[#F1EBFA] text-[#292633] dark:text-white disabled:opacity-50" disabled>
              &laquo; First
            </button>
            <button className="px-2.5 py-1 rounded-lg border border-[#E9E6EF] dark:border-[#383049] bg-white dark:bg-[#221D2E] hover:bg-[#F1EBFA] text-[#292633] dark:text-white disabled:opacity-50" disabled>
              &lsaquo; Prev
            </button>
            <button className="px-2.5 py-1 rounded-lg bg-[#6941C6] text-white font-bold">1</button>
            <button className="px-2.5 py-1 rounded-lg border border-[#E9E6EF] dark:border-[#383049] bg-white dark:bg-[#221D2E] hover:bg-[#F1EBFA] text-[#292633] dark:text-white">2</button>
            <button className="px-2.5 py-1 rounded-lg border border-[#E9E6EF] dark:border-[#383049] bg-white dark:bg-[#221D2E] hover:bg-[#F1EBFA] text-[#292633] dark:text-white">3</button>
            <span className="px-1 text-[#8E88A2]">...</span>
            <button className="px-2.5 py-1 rounded-lg border border-[#E9E6EF] dark:border-[#383049] bg-white dark:bg-[#221D2E] hover:bg-[#F1EBFA] text-[#292633] dark:text-white">472</button>
            <button className="px-2.5 py-1 rounded-lg border border-[#E9E6EF] dark:border-[#383049] bg-white dark:bg-[#221D2E] hover:bg-[#F1EBFA] text-[#292633] dark:text-white">
              Next &rsaquo;
            </button>
            <button className="px-2.5 py-1 rounded-lg border border-[#E9E6EF] dark:border-[#383049] bg-white dark:bg-[#221D2E] hover:bg-[#F1EBFA] text-[#292633] dark:text-white">
              Last &raquo;
            </button>

            <div className="ml-2 flex items-center gap-1">
              <select aria-label="Items per page" className="bg-white dark:bg-[#221D2E] border border-[#E9E6EF] dark:border-[#383049] rounded-lg px-2 py-1 text-xs text-[#292633] dark:text-white focus:outline-none">
                <option value="25">25 Per Page</option>
                <option value="50">50 Per Page</option>
                <option value="100">100 Per Page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Send Requirement Modal (Ceipal Feature) */}
      {isSendModalOpen && selectedJobForSend && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#221D2E] border border-[#E9E6EF] dark:border-[#383049] rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E6EF] dark:border-[#383049]">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#6941C6]" />
                <h3 className="text-base font-bold text-[#292633] dark:text-white">
                  Send Requirement to Vendors &amp; Network
                </h3>
              </div>
              <button
                onClick={() => setIsSendModalOpen(false)}
                className="text-[#8E88A2] hover:text-[#292633] dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#F8F7FB] dark:bg-[#1A1624] rounded-xl space-y-1 text-xs">
              <div className="font-bold text-[#6941C6] font-mono">{selectedJobForSend.code}</div>
              <div className="font-bold text-[#292633] dark:text-white">{selectedJobForSend.title}</div>
              <div className="text-[#5F5972] dark:text-[#B9B2CE]">
                Client: {selectedJobForSend.client} • Location: {selectedJobForSend.location}
              </div>
            </div>

            <form onSubmit={handleSendRequirement} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#292633] dark:text-white">
                  Recipient Emails (comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  value={recipientEmails}
                  onChange={(e) => setRecipientEmails(e.target.value)}
                  placeholder="vendor-network@ampcus.com, partners@recruiting.net"
                  className="w-full px-3 py-2 bg-[#F8F7FB] dark:bg-[#1A1624] border border-[#E9E6EF] dark:border-[#383049] rounded-xl text-xs text-[#292633] dark:text-[#F8F7FB] focus:outline-none focus:border-[#6941C6]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#292633] dark:text-white">
                  Email Subject
                </label>
                <input
                  type="text"
                  readOnly
                  value={`[HOT REQ] ${selectedJobForSend.code}: ${selectedJobForSend.title} - ${selectedJobForSend.location}`}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1624] border border-[#E9E6EF] dark:border-[#383049] rounded-xl text-xs text-[#5F5972] dark:text-[#B9B2CE] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSendModalOpen(false)}
                  className="px-4 py-2 border border-[#E9E6EF] dark:border-[#383049] text-[#5F5972] rounded-xl hover:bg-gray-50 dark:hover:bg-[#1A1624]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF8243] hover:bg-[#E96F30] text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-xs shadow-[#FF8243]/30"
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
