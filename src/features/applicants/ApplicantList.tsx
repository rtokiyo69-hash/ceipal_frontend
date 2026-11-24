import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Star,
  Download,
  Eye,
  CheckCircle,
  X,
  SlidersHorizontal,
  Upload,
  Folder,
  FolderPlus,
  BookmarkPlus,
  Ticket,
  Users,
  LayoutGrid,
  ListFilter,
  ArrowRight,
  FileSpreadsheet,
  FileText,
  Settings,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  Home,
  IdCard,
  MessageCircle,
  Send,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  CircleHelp,
  Pin,
  Pencil,
  Trash2,
  Minus,
  ExternalLink
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { Applicant, PipelineStage, Submission } from '../../types';
import {
  ApplicantClearanceTypesLookup,
  ApplicantDegreesLookup,
  ApplicantFunctionsLookup,
  ApplicantLanguageProficienciesLookup,
  ApplicantTechnologiesLookup
} from './ApplicantFunctionsLookup';

type DialogKind = 'advanced' | 'import' | 'view' | 'folder' | 'ticket' | 'columns' | null;
type FilterRule = { id: string; field: string; operator: string; value: string };
type AdvancedTerm = FilterRule & { join: 'AND' | 'OR' };
type TextToHireMessage = { id: number; contactId: string; text: string };
type AdvancedCriteria = { keywords: string; jobTitle: string; country: string; state: string; city: string; exclude: string; excludeJobTitle: string; includeWithoutCountry: boolean; recentJobTitle: boolean; locationMode: 'selected' | 'radius'; radius: string; applicantStatus: string; source: string; recruiter: string; workAuthorization: string; minExperience: string; maxExperience: string; applicantId: string; email: string; phone: string; terms: AdvancedTerm[] };
const emptyAdvancedCriteria: AdvancedCriteria = { keywords: '', jobTitle: '', country: '', state: '', city: '', exclude: '', excludeJobTitle: '', includeWithoutCountry: false, recentJobTitle: false, locationMode: 'selected', radius: '25', applicantStatus: '', source: '', recruiter: '', workAuthorization: '', minExperience: '', maxExperience: '', applicantId: '', email: '', phone: '', terms: [] };
const filterOperators = ['Equals', 'Not Equals', 'Is Null', 'Is Not Null', 'Contains', 'Not Contains', 'Starts With', 'Ends With'];
const applicantSubmodules = [
  'Applicant Lookups',
  'Applicant Settings',
  'Applicant Sources',
  'Applicant Statuses',
  'Applicant Configuration',
  'Notice Periods',
  'Application Statuses',
  'Career Site',
  'Custom Applications',
  'Document Types',
  'Pipeline Statuses',
  'Profile Download Notification',
  'Resume Builder',
  'Submissions',
  'Cover Letter Configuration'
] as const;
const applicantLookupCategories = [
  'Applicant Functions',
  'Applicant Technologies',
  'Clearance Types',
  'Degrees',
  'Language Proficiencies'
] as const;
const allApplicantColumns = ['Applicant ID', 'Applicant Name', 'Email Address', 'Mobile Number', 'City', 'Source', 'State', 'Applicant Status', 'Current Title/Designation', 'Ownership', 'Work Authorization', 'Created By', 'Created On', 'Created date', 'Key Skills', 'Experience', 'Match Score', 'Current Company', 'Expected CTC', 'Notice Period', 'Applicant Group', 'Alternate Email', 'Alternate Mobile Number', 'Date of Birth', 'Gender', 'Nationality', 'Marital Status', 'Current Address', 'Permanent Address', 'Postal Code', 'Country', 'Total Experience', 'Relevant Experience', 'Highest Qualification', 'Degree', 'Specialization', 'University/Institute', 'Graduation Year', 'Certifications', 'Languages', 'LinkedIn Profile', 'Portfolio / Website', 'GitHub Profile', 'Previous Company', 'Current CTC', 'Availability', 'Preferred Location', 'Preferred Work Mode', 'Employment Type', 'Visa Status', 'Work Permit Expiry', 'Willing to Relocate', 'Current Employer', 'Department', 'Industry', 'Functional Area', 'Secondary Skills', 'Applicant Type', 'Candidate Source Details', 'Campaign', 'Referral Name', 'Vendor', 'Last Contacted On', 'Last Activity', 'Last Modified By', 'Last Modified On', 'Resume Name', 'Resume Updated On', 'GDPR Consent Date', 'GDPR Consent Status', 'Diversity', 'Disability Status', 'Veteran Status', 'Rating', 'Years in Current Role', 'Preferred Salary'];
const searchFieldCol1 = ['Search Any', 'Applicant ID', 'Applicant Name', 'Email Address', 'Mobile Number', 'City', 'Source', 'State', 'Ownership', 'Work Authorization', 'Created By'];
const searchFieldCol2 = ['Created On', 'Technology', 'Updated On', 'Skills', 'Home Phone Number', 'Alternate Email Address', 'Primary Skills', 'Tag', 'Industry', 'Created date', 'Notes'];
const filterFields = ['Applicant ID', 'Applicant Name', 'Last Name as per Aadhaar', 'Email Address', 'Mobile Number', 'LinkedIn Profile URL', 'Work Authorization', 'City', 'State', 'Country', 'Source', 'Skills', 'Experience', 'Applicant Status', 'Gender', 'Race/Ethnicity', 'Veteran Status', 'Disability', 'Created By', 'Created On', ...searchFieldCol1, ...searchFieldCol2, ...allApplicantColumns].filter((field, index, fields) => fields.indexOf(field) === index);
const defaultApplicantColumns = allApplicantColumns.slice(0, 14);
const stages: PipelineStage[] = ['New', 'Screening', 'Submitted', 'Interview', 'Selected', 'Offered', 'Hired', 'Rejected'];
const fieldClass = 'w-full rounded-lg border border-[#D8E3F1] bg-white px-3 py-2 text-xs text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white';
const buttonClass = 'inline-flex items-center gap-1.5 rounded-lg border border-[#D8E3F1] bg-white px-3 py-2 text-xs font-semibold text-[#334155] shadow-sm hover:bg-[#FFFFFF] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white dark:hover:bg-[#334155]';

function parseCSV(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"' && text[i + 1] === '"' && quoted) { cell += '"'; i++; }
    else if (ch === '"') quoted = !quoted;
    else if (ch === ',' && !quoted) { row.push(cell.trim()); cell = ''; }
    else if ((ch === '\n' || ch === '\r') && !quoted) { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); return rows;
}

function readStoredArray<T>(key: string, fallback: T[]): T[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || 'null');
    return Array.isArray(value) ? value as T[] : fallback;
  } catch {
    return fallback;
  }
}

function readStoredObject<T extends Record<string, unknown>>(key: string, fallback: T): T {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || 'null');
    return value && typeof value === 'object' && !Array.isArray(value) ? { ...fallback, ...value } as T : fallback;
  } catch {
    return fallback;
  }
}

function readAdvancedCriteria(): AdvancedCriteria {
  const value = readStoredObject<AdvancedCriteria & Record<string, unknown>>(
    'ats_applicant_advanced_criteria',
    emptyAdvancedCriteria,
  );
  return { ...emptyAdvancedCriteria, ...value, terms: Array.isArray(value.terms) ? value.terms : [] };
}

export const ApplicantList: React.FC = () => {
  const { navigate, currentUser } = useAppStore();
  const [activeSubmodule, setActiveSubmodule] = useState<(typeof applicantSubmodules)[number]>(applicantSubmodules[0]);
  const [activeLookupCategory, setActiveLookupCategory] = useState<(typeof applicantLookupCategories)[number]>(applicantLookupCategories[0]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [applicantSubmissions, setApplicantSubmissions] = useState<Submission[]>([]);
  const [openMissingInfoId, setOpenMissingInfoId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('Search Any');
  const [searchMenuOpen, setSearchMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [stageFilter, setStageFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [recruiterFilter, setRecruiterFilter] = useState('All');
  const [quickResumePreview, setQuickResumePreview] = useState<Applicant | null>(null);
  const [notesDrawerApplicant, setNotesDrawerApplicant] = useState<Applicant | null>(null);
  const [notesHistoryOpen, setNotesHistoryOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [drawerNoteText, setDrawerNoteText] = useState('');
  const [drawerNotePriority, setDrawerNotePriority] = useState('Medium');
  const [drawerNoteJob, setDrawerNoteJob] = useState('');
  const [drawerNoteClient, setDrawerNoteClient] = useState('');
  const [drawerNoteAction, setDrawerNoteAction] = useState('N/A');
  const [drawerNoteSubject, setDrawerNoteSubject] = useState('');
  const [drawerNoteRemindMe, setDrawerNoteRemindMe] = useState(false);
  const [drawerNoteAddToTask, setDrawerNoteAddToTask] = useState(false);
  const [quickViewTab, setQuickViewTab] = useState<'Resume' | 'Submissions' | 'Experience' | 'Email Merges'>('Resume');
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [sidePanel, setSidePanel] = useState<'edit-filters' | 'quick-filters' | 'edit-columns' | null>(null);
  const [filterRules, setFilterRules] = useState<FilterRule[]>(() => readStoredArray<FilterRule>('ats_applicant_filter_rules', []));
  const [draftRules, setDraftRules] = useState<FilterRule[]>([]);
  const [columnFilterOpen, setColumnFilterOpen] = useState<string | null>(null);
  const [columnFilterAlign, setColumnFilterAlign] = useState<'left' | 'right'>('left');
  const [columnFilterDraft, setColumnFilterDraft] = useState('');
  const [columnNullDraft, setColumnNullDraft] = useState<'null' | 'not-null' | null>(null);
  const [columnSortDraft, setColumnSortDraft] = useState<'asc' | 'desc' | null>(null);
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [draftQuickFilters, setDraftQuickFilters] = useState<string[]>([]);
  const [businessUnitFilter, setBusinessUnitFilter] = useState(() => localStorage.getItem('ats_applicant_business_unit_filter') || 'All Business Units');
  const [draftBusinessUnit, setDraftBusinessUnit] = useState('All Business Units');
  const [draftGdprApproved, setDraftGdprApproved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [expandedApplicantId, setExpandedApplicantId] = useState<string | null>(null);
  const [ticketPanelOpen, setTicketPanelOpen] = useState(false);
  const [ticketView, setTicketView] = useState<'new' | 'reported' | 'dashboard'>('new');
  const [ticketDashboardTab, setTicketDashboardTab] = useState('Dashboard');
  const [ticketDashboardSearch, setTicketDashboardSearch] = useState('');
  const [ticketOtpAllowed, setTicketOtpAllowed] = useState(false);
  const [ticketAttachments, setTicketAttachments] = useState<string[]>([]);
  const [reportedTickets, setReportedTickets] = useState<{ id: string; type: string; title?: string; priority: string; description: string; status?: string; attachments?: string[]; createdAt: string }[]>(() => readStoredArray('ats_applicant_tickets', []));
  const [quickToolsOpen, setQuickToolsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatContacts, setChatContacts] = useState<string[]>(() => readStoredArray('ats_text_to_hire_contacts', []));
  const [chatContactId, setChatContactId] = useState('');
  const [chatTab, setChatTab] = useState<'all' | 'favourites'>('all');
  const [fetchContactsOpen, setFetchContactsOpen] = useState(false);
  const [bestPracticesOpen, setBestPracticesOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<TextToHireMessage[]>(() => readStoredArray('ats_text_to_hire_messages', []));
  const [savedViews, setSavedViews] = useState<string[]>(() => readStoredArray('ats_applicant_views', ['All Applicants', 'My Applicants', 'Favorites']));
  const [viewConfigs, setViewConfigs] = useState<Record<string, { stage?: string; location?: string; experience?: string; skill?: string; source?: string; recruiter?: string; columns?: string[]; filters?: FilterRule[]; businessUnit?: string; gdprApproved?: boolean }>>(() => readStoredObject('ats_applicant_view_configs', {}));
  const [folders, setFolders] = useState<string[]>(() => {
    const stored = readStoredArray<string>('ats_applicant_folders', []);
    if (stored && Array.isArray(stored) && stored.length > 0) return stored;
    return ['All Profiles', 'Python devloper'];
  });
  const [folderConfigs, setFolderConfigs] = useState<Record<string, { columns: string[]; businessUnit: string }>>(() => readStoredObject('ats_applicant_folder_configs', {}));
  const [activeView, setActiveView] = useState(() => localStorage.getItem('ats_default_applicant_view') || 'All Applicants');
  const [folderFilter, setFolderFilter] = useState('All Profiles');
  const [addViewMenuOpen, setAddViewMenuOpen] = useState(false);
  const [savedViewsMenuOpen, setSavedViewsMenuOpen] = useState(false);
  const [openFolderMenu, setOpenFolderMenu] = useState<string | null>(null);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [advancedMenuOpen, setAdvancedMenuOpen] = useState(false);
  const [advancedProvider, setAdvancedProvider] = useState('Internal DB');
  const [advancedTab, setAdvancedTab] = useState<'options' | 'exclude'>('options');
  const [advancedDraft, setAdvancedDraft] = useState<AdvancedCriteria>(readAdvancedCriteria);
  const [advancedCriteria, setAdvancedCriteria] = useState<AdvancedCriteria>(readAdvancedCriteria);
  const [advancedHistory, setAdvancedHistory] = useState<AdvancedCriteria[]>(() => readStoredArray('ats_applicant_advanced_history', []));
  const [savedAdvancedSearches, setSavedAdvancedSearches] = useState<{ name: string; criteria: AdvancedCriteria }[]>(() => readStoredArray('ats_applicant_saved_searches', []));
  const [savedSearchName, setSavedSearchName] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [makeViewDefault, setMakeViewDefault] = useState(false);
  const [viewColumnsDraft, setViewColumnsDraft] = useState<string[]>(() => readStoredArray('ats_applicant_columns', defaultApplicantColumns));
  const [viewRulesDraft, setViewRulesDraft] = useState<FilterRule[]>([]);
  const [viewBusinessUnit, setViewBusinessUnit] = useState('All Business Units');
  const [viewGdprApproved, setViewGdprApproved] = useState(false);
  const [gdprApprovedFilter, setGdprApprovedFilter] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketType, setTicketType] = useState('');
  const [ticketPriority, setTicketPriority] = useState('Low');
  const [ticketDescription, setTicketDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [importStep, setImportStep] = useState<'upload' | 'preview'>('upload');
  const [importBusinessUnit, setImportBusinessUnit] = useState('Ampcus Tech Pvt Ltd.');
  const [importError, setImportError] = useState('');
  const [importRows, setImportRows] = useState<Partial<Applicant>[]>([]);
  const [duplicatePolicy, setDuplicatePolicy] = useState<'Skip' | 'Overwrite'>('Skip');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const stored = readStoredArray<string>('ats_applicant_columns', []);
    if (!stored) return defaultApplicantColumns;
    const legacy: Record<string, string[]> = { 'Role & Location': ['Current Title/Designation', 'City'], Stage: ['Applicant Status'], Recruiter: ['Ownership'] };
    const migrated = stored.flatMap((column) => legacy[column] || [column]).filter((column) => allApplicantColumns.includes(column));
    return migrated.length ? migrated : defaultApplicantColumns;
  });
  const [columnDraft, setColumnDraft] = useState<string[]>([]);
  const [columnsExpanded, setColumnsExpanded] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);

  useEffect(() => {
    ApiService.getApplicants().then(setApplicants);
    ApiService.getSubmissions().then(setApplicantSubmissions);
  }, []);
  useEffect(() => {
    if (!isAddNoteModalOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsAddNoteModalOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isAddNoteModalOpen]);
  useEffect(() => {
    if (folderFilter !== 'All Profiles') return;
    const config = viewConfigs[activeView];
    if (!config) return;
    setStageFilter(config.stage || 'All'); setLocationFilter(config.location || ''); setExperienceFilter(config.experience || '');
    setSkillFilter(config.skill || ''); setSourceFilter(config.source || 'All'); setRecruiterFilter(config.recruiter || 'All');
    setVisibleColumns(config.columns || defaultApplicantColumns); setFilterRules(config.filters || []);
    setBusinessUnitFilter(config.businessUnit || 'All Business Units'); setGdprApprovedFilter(!!config.gdprApproved);
  }, [activeView, viewConfigs, folderFilter]);
  const showToast = (msg: string) => { setToastMessage(msg); window.setTimeout(() => setToastMessage(null), 3000); };
  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); const isFav = await ApiService.toggleFavorite(id);
    setApplicants((prev) => prev.map((a) => a.id === id ? { ...a, isFavorite: isFav } : a));
    showToast(isFav ? 'Added candidate to Favorites' : 'Removed from Favorites');
  };

  const handleSaveDrawerNote = async () => {
    if (!notesDrawerApplicant) return;
    if (!drawerNoteText.trim() && !drawerNoteSubject.trim()) {
      showToast('Please enter note contents.');
      return;
    }

    const noteContent = drawerNoteText.trim() || drawerNoteSubject.trim();
    let updatedNotes = [...(notesDrawerApplicant.notes || [])];

    if (editingNoteId) {
      updatedNotes = updatedNotes.map((n) =>
        n.id === editingNoteId
          ? {
              ...n,
              text: noteContent,
              subject: drawerNoteSubject,
              priority: drawerNotePriority,
              job: drawerNoteJob || undefined,
              client: drawerNoteClient || undefined,
              action: drawerNoteAction,
              date: new Date().toLocaleString()
            }
          : n
      );
    } else {
      const newNote = {
        id: `nt-${Date.now()}`,
        author: currentUser?.name || 'Gaurav Ashok Mishra',
        text: noteContent,
        subject: drawerNoteSubject,
        priority: drawerNotePriority,
        job: drawerNoteJob || undefined,
        client: drawerNoteClient || undefined,
        action: drawerNoteAction,
        date: new Date().toLocaleString()
      };
      updatedNotes.unshift(newNote);
    }

    const updatedApplicant: Applicant = {
      ...notesDrawerApplicant,
      notes: updatedNotes
    };

    setNotesDrawerApplicant(updatedApplicant);
    setApplicants((prev) =>
      prev.map((a) => (a.id === updatedApplicant.id || a.applicantId === updatedApplicant.applicantId ? updatedApplicant : a))
    );

    try {
      await ApiService.updateApplicant(updatedApplicant.id, { notes: updatedNotes });
    } catch (e) {
      console.warn('Persist note error:', e);
    }

    setIsAddNoteModalOpen(false);
    setEditingNoteId(null);
    setDrawerNoteText('');
    showToast(editingNoteId ? 'Note updated successfully.' : 'Note added successfully.');
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!notesDrawerApplicant) return;
    const updatedNotes = (notesDrawerApplicant.notes || []).filter((n) => n.id !== noteId);
    const updatedApplicant: Applicant = {
      ...notesDrawerApplicant,
      notes: updatedNotes
    };
    setNotesDrawerApplicant(updatedApplicant);
    setApplicants((prev) =>
      prev.map((a) => (a.id === updatedApplicant.id || a.applicantId === updatedApplicant.applicantId ? updatedApplicant : a))
    );
    try {
      await ApiService.updateApplicant(updatedApplicant.id, { notes: updatedNotes });
    } catch (e) {
      console.warn('Delete note error:', e);
    }
    showToast('Note deleted.');
  };

  const handleTogglePinNote = async (noteId: string) => {
    if (!notesDrawerApplicant) return;
    const updatedNotes = (notesDrawerApplicant.notes || []).map((n) =>
      n.id === noteId ? { ...n, pinned: !(n as any).pinned } : n
    );
    const updatedApplicant: Applicant = {
      ...notesDrawerApplicant,
      notes: updatedNotes
    };
    setNotesDrawerApplicant(updatedApplicant);
    setApplicants((prev) =>
      prev.map((a) => (a.id === updatedApplicant.id || a.applicantId === updatedApplicant.applicantId ? updatedApplicant : a))
    );
    try {
      await ApiService.updateApplicant(updatedApplicant.id, { notes: updatedNotes });
    } catch (e) {
      console.warn('Pin note error:', e);
    }
    showToast('Note updated.');
  };

  const handleStartEditNote = (note: any) => {
    setEditingNoteId(note.id);
    setDrawerNoteText(note.text || '');
    setDrawerNoteSubject(note.subject || `New Note Created for ${notesDrawerApplicant?.name.toUpperCase()} - ${notesDrawerApplicant?.applicantId}.`);
    setDrawerNotePriority(note.priority || 'Medium');
    setDrawerNoteJob(note.job || '');
    setDrawerNoteClient(note.client || '');
    setDrawerNoteAction(note.action || 'N/A');
    setIsAddNoteModalOpen(true);
  };
  const getApplicantSearchValues = (a: Applicant, field: string): (string | undefined | null)[] => {
    switch (field) {
      case 'Search Any':
        return [
          a.name,
          a.applicantId,
          a.email,
          a.phone,
          a.currentDesignation,
          a.location,
          a.state || a.customFields?.state,
          a.assignedRecruiter,
          a.source,
          a.status,
          a.workAuthorization || a.customFields?.workAuthorization,
          a.technology || a.customFields?.technology,
          a.industry || a.customFields?.industry,
          ...(a.skills || []),
          ...(a.primarySkills || []),
          a.homePhone || a.customFields?.homePhone,
          a.alternateEmail || a.customFields?.alternateEmail,
          a.createdBy || a.customFields?.createdBy,
          a.createdOn || a.customFields?.createdOn,
          a.createdDate || a.customFields?.createdDate,
          ...(a.notes ? a.notes.map((n) => n.text) : []),
          ...(Object.values(a.customFields || {})),
        ];
      case 'Applicant ID':
        return [a.applicantId];
      case 'Applicant Name':
        return [a.name];
      case 'Email Address':
        return [a.email];
      case 'Mobile Number':
        return [a.phone];
      case 'City':
        return [a.location ? a.location.split(',')[0].trim() : '', a.location];
      case 'Source':
        return [a.source];
      case 'State':
        return [a.state || a.customFields?.state];
      case 'Ownership':
        return [a.assignedRecruiter, a.customFields?.ownership];
      case 'Work Authorization':
        return [a.workAuthorization || a.customFields?.workAuthorization];
      case 'Created By':
        return [a.createdBy || a.customFields?.createdBy || a.assignedRecruiter];
      case 'Created On':
        return [a.createdOn || a.customFields?.createdOn || a.createdDate];
      case 'Technology':
        return [a.technology || a.customFields?.technology];
      case 'Updated On':
        return [a.customFields?.updatedOn || a.customFields?.['Updated On']];
      case 'Skills':
        return [...(a.skills || []), a.customFields?.skills];
      case 'Home Phone Number':
        return [a.homePhone || a.customFields?.homePhone || a.customFields?.['Home Phone Number']];
      case 'Alternate Email Address':
        return [a.alternateEmail || a.customFields?.alternateEmail || a.customFields?.['Alternate Email Address']];
      case 'Primary Skills':
        return [...(a.primarySkills || a.skills || []), a.customFields?.primarySkills];
      case 'Tag':
        return [a.customFields?.tag || a.customFields?.tags];
      case 'Industry':
        return [a.industry || a.customFields?.industry];
      case 'Created date':
        return [a.createdDate || a.customFields?.createdDate || a.createdOn];
      case 'Notes':
        return [...(a.notes ? a.notes.map((n) => n.text) : []), a.applicantRemarks, a.customFields?.notes];
      default:
        return [a.customFields?.[field]];
    }
  };

  const filteredApplicants = useMemo(() => applicants.filter((a) => {
    const q = search.trim().toLowerCase();
    const searchValues = getApplicantSearchValues(a, searchField);
    const matchesSearch = !q || searchValues.some((v) => v && String(v).toLowerCase().includes(q));
    const matchesStage = stageFilter === 'All' || a.status === stageFilter;
    const matchesExperience = !experienceFilter || (experienceFilter === '10+' ? a.experienceYears >= 10 : a.experienceYears >= Number(experienceFilter));
    const matchesLocation = !locationFilter || a.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesSkill = !skillFilter || a.skills.some((skill) => skill.toLowerCase().includes(skillFilter.toLowerCase()));
    const matchesSource = sourceFilter === 'All' || a.source === sourceFilter;
    const matchesRecruiter = recruiterFilter === 'All' || a.assignedRecruiter === recruiterFilter;
    const matchesView = activeView === 'Favorites' ? !!a.isFavorite : activeView === 'My Applicants' ? a.assignedRecruiter === (currentUser?.name || 'Priya Sharma') : true;
    const membership = readStoredObject<Record<string, string[]>>('ats_applicant_folder_memberships', {});
    const matchesFolder = folderFilter === 'All Profiles' || (membership[folderFilter] || []).includes(a.id);
    const matchesQuick = (!quickFilters.includes('Favorites') || !!a.isFavorite) && (!quickFilters.includes('High Match') || a.matchScore >= 90) && (!quickFilters.includes('Has Resume') || !!a.documents?.some((doc) => /resume|cv/i.test(doc.name))) && (!quickFilters.includes('New Applicants') || a.status === 'New');
    const hasGdprConsent = a.gdprApproved === true || ['yes', 'true', 'approved'].includes((a.customFields?.gdprApproved || '').toLowerCase());
    const valueFor = (field: string): string => ({
      'Applicant ID': a.applicantId, 'Applicant Name': a.name, 'Email Address': a.email, 'Mobile Number': a.phone,
      City: a.location.split(',')[0], Source: a.source, State: a.state || a.customFields?.state || '',
      'Applicant Status': a.status, 'Current Title/Designation': a.currentDesignation, Ownership: a.assignedRecruiter,
      'Work Authorization': a.workAuthorization || a.customFields?.workAuthorization || '', Skills: a.skills.join(', '),
      'Years of Experience': String(a.experienceYears), Experience: String(a.experienceYears), 'Business Unit': currentUser?.businessUnit || '',
      'Created By': a.createdBy || a.assignedRecruiter || '', 'Created On': a.createdOn || '', 'Created date': a.createdDate || a.createdOn || '',
      'Technology': a.technology || a.customFields?.technology || '',
      'Updated On': a.customFields?.updatedOn || a.customFields?.['Updated On'] || '',
      'Home Phone Number': a.homePhone || a.customFields?.homePhone || '',
      'Alternate Email Address': a.alternateEmail || a.customFields?.alternateEmail || '',
      'Primary Skills': (a.primarySkills || a.skills).join(', '),
      'Tag': a.customFields?.tag || a.customFields?.tags || '',
      'Industry': a.industry || a.customFields?.industry || '',
      'Notes': (a.notes || []).map((n) => n.text).join(' ') || a.applicantRemarks || a.customFields?.notes || '',
    }[field] || a.customFields?.[field] || '');
    const matchesRules = filterRules.every((rule) => {
      if (!rule.field || !rule.operator) return true;
      const actual = valueFor(rule.field).toLowerCase();
      if (rule.operator === 'Is Null') return !actual;
      if (rule.operator === 'Is Not Null') return !!actual;
      if (!rule.value.trim()) return true;
      const expected = rule.value.trim().toLowerCase();
      if (rule.operator === 'Equals' || rule.operator === 'Is') return actual === expected;
      if (rule.operator === 'Not Equals' || rule.operator === 'Is not') return actual !== expected;
      if (rule.operator === 'Starts With' || rule.operator === 'Starts with') return actual.startsWith(expected);
      if (rule.operator === 'Ends With') return actual.endsWith(expected);
      if (rule.operator === 'Not Contains' || rule.operator === 'Does not contain') return !actual.includes(expected);
      if (rule.operator === 'Greater than') return Number(actual) > Number(expected);
      if (rule.operator === 'Less than') return Number(actual) < Number(expected);
      return actual.includes(expected);
    });
    const advancedText = [a.name, a.applicantId, a.email, a.phone, a.currentDesignation, a.location, a.assignedRecruiter, a.source, a.status, ...a.skills].join(' ').toLowerCase();
    const advancedKeywords = advancedCriteria.keywords.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const excludedKeywords = advancedCriteria.exclude.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const advancedLocation = a.location.toLowerCase();
    const applicantCountry = (a.customFields?.country || (a.location.includes(',') ? a.location.split(',').slice(-1)[0] : '')).toLowerCase().trim();
    const applicantState = (a.state || a.customFields?.state || '').toLowerCase();
    const hasCountry = !!applicantCountry;
    const matchesAdvancedLocation = (!advancedCriteria.country || applicantCountry.includes(advancedCriteria.country.toLowerCase()) || (advancedCriteria.includeWithoutCountry && !hasCountry)) && (!advancedCriteria.state || applicantState.includes(advancedCriteria.state.toLowerCase()) || advancedLocation.includes(advancedCriteria.state.toLowerCase())) && (!advancedCriteria.city || advancedLocation.split(',')[0].includes(advancedCriteria.city.toLowerCase()));
    const termMatches = (term: AdvancedTerm) => {
      if (!term.field || !term.operator) return true;
      const actual = valueFor(term.field).toLowerCase(); const expected = term.value.trim().toLowerCase();
      if (term.operator === 'Is Null') return !actual;
      if (term.operator === 'Is Not Null') return !!actual;
      if (!expected) return true;
      if (term.operator === 'Equals') return actual === expected;
      if (term.operator === 'Not Equals') return actual !== expected;
      if (term.operator === 'Not Contains') return !actual.includes(expected);
      if (term.operator === 'Starts With') return actual.startsWith(expected);
      if (term.operator === 'Ends With') return actual.endsWith(expected);
      return actual.includes(expected);
    };
    const matchesAdvancedTerms = advancedCriteria.terms.reduce((result, term, index) => index === 0 ? termMatches(term) : term.join === 'OR' ? result || termMatches(term) : result && termMatches(term), true);
    const matchedTitle = (advancedCriteria.recentJobTitle ? a.workHistory?.[0]?.role || a.currentDesignation : a.currentDesignation).toLowerCase();
    const matchesAdvanced = advancedKeywords.every((word) => advancedText.includes(word)) && (!advancedCriteria.jobTitle || matchedTitle.includes(advancedCriteria.jobTitle.toLowerCase())) && (!advancedCriteria.excludeJobTitle || !matchedTitle.includes(advancedCriteria.excludeJobTitle.toLowerCase())) && matchesAdvancedLocation && !excludedKeywords.some((word) => advancedText.includes(word)) && (!advancedCriteria.applicantStatus || a.status === advancedCriteria.applicantStatus) && (!advancedCriteria.source || a.source === advancedCriteria.source) && (!advancedCriteria.recruiter || a.assignedRecruiter === advancedCriteria.recruiter) && (!advancedCriteria.workAuthorization || (a.workAuthorization || a.customFields?.workAuthorization || '').toLowerCase().includes(advancedCriteria.workAuthorization.toLowerCase())) && (!advancedCriteria.minExperience || a.experienceYears >= Number(advancedCriteria.minExperience)) && (!advancedCriteria.maxExperience || a.experienceYears <= Number(advancedCriteria.maxExperience)) && (!advancedCriteria.applicantId || a.applicantId.toLowerCase().includes(advancedCriteria.applicantId.toLowerCase())) && (!advancedCriteria.email || a.email.toLowerCase().includes(advancedCriteria.email.toLowerCase())) && (!advancedCriteria.phone || a.phone.toLowerCase().includes(advancedCriteria.phone.toLowerCase())) && matchesAdvancedTerms;
    const matchesUnit = businessUnitFilter === 'All Business Units' || businessUnitFilter === (currentUser?.businessUnit || '') || businessUnitFilter === 'Ampcus Tech Pvt Ltd.';
    return matchesSearch && matchesStage && matchesExperience && matchesLocation && matchesSkill && matchesSource && matchesRecruiter && matchesView && matchesFolder && matchesQuick && matchesRules && matchesAdvanced && matchesUnit && (!gdprApprovedFilter || hasGdprConsent);
  }), [applicants, search, searchField, stageFilter, experienceFilter, locationFilter, skillFilter, sourceFilter, recruiterFilter, activeView, folderFilter, currentUser?.name, currentUser?.businessUnit, quickFilters, filterRules, businessUnitFilter, gdprApprovedFilter, advancedCriteria]);
  const sortedApplicants = useMemo(() => {
    if (!sortConfig) return filteredApplicants;
    const valueForSort = (applicant: Applicant) => {
      const values: Record<string, string> = {
        'Applicant ID': applicant.applicantId, 'Applicant Name': applicant.name, 'Email Address': applicant.email, 'Mobile Number': applicant.phone,
        City: applicant.location.split(',')[0], Source: applicant.source, State: applicant.state || applicant.customFields?.state || '',
        'Applicant Status': applicant.status, 'Current Title/Designation': applicant.currentDesignation, Ownership: applicant.assignedRecruiter,
        'Work Authorization': applicant.workAuthorization || applicant.customFields?.workAuthorization || '', Skills: applicant.skills.join(', '),
        'Years of Experience': String(applicant.experienceYears), Experience: String(applicant.experienceYears),
        'Created By': applicant.createdBy || applicant.assignedRecruiter || '',
        'Created On': applicant.createdOn || '',
        'Created date': applicant.createdDate || applicant.createdOn || '',
        'Technology': applicant.technology || applicant.customFields?.technology || '',
        'Updated On': applicant.customFields?.updatedOn || applicant.customFields?.['Updated On'] || '',
        'Home Phone Number': applicant.homePhone || applicant.customFields?.homePhone || '',
        'Alternate Email Address': applicant.alternateEmail || applicant.customFields?.alternateEmail || '',
        'Primary Skills': (applicant.primarySkills || applicant.skills).join(', '),
        'Tag': applicant.customFields?.tag || applicant.customFields?.tags || '',
        'Industry': applicant.industry || applicant.customFields?.industry || '',
        'Notes': (applicant.notes || []).map((n) => n.text).join(' ') || applicant.applicantRemarks || applicant.customFields?.notes || '',
      };
      return (values[sortConfig.field] || String(applicant.customFields?.[sortConfig.field] || '')).toLocaleLowerCase();
    };
    return [...filteredApplicants].sort((a, b) => valueForSort(a).localeCompare(valueForSort(b), undefined, { numeric: true }) * (sortConfig.direction === 'asc' ? 1 : -1));
  }, [filteredApplicants, sortConfig]);
  useEffect(() => { setCurrentPage(1); }, [search, searchField, stageFilter, experienceFilter, locationFilter, skillFilter, sourceFilter, recruiterFilter, activeView, folderFilter, quickFilters, filterRules, businessUnitFilter, gdprApprovedFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredApplicants.length / pageSize));
  const pageStart = filteredApplicants.length ? (currentPage - 1) * pageSize + 1 : 0;
  const pageEnd = Math.min(currentPage * pageSize, filteredApplicants.length);
  const visibleApplicants = sortedApplicants.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const advancedCriteriaCount = [advancedCriteria.keywords, advancedCriteria.jobTitle, advancedCriteria.country, advancedCriteria.state, advancedCriteria.city, advancedCriteria.exclude, advancedCriteria.excludeJobTitle, advancedCriteria.applicantStatus, advancedCriteria.source, advancedCriteria.recruiter, advancedCriteria.workAuthorization, advancedCriteria.minExperience, advancedCriteria.maxExperience, advancedCriteria.applicantId, advancedCriteria.email, advancedCriteria.phone].filter(Boolean).length + advancedCriteria.terms.filter((term) => term.field && term.operator && (['Is Null', 'Is Not Null'].includes(term.operator) || term.value.trim())).length + (advancedCriteria.includeWithoutCountry ? 1 : 0);
  const hasAdvancedCriteria = advancedCriteriaCount > 0;
  const toggleSelected = (id: string) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const applicantActions = [
    ['Add Notes', 'Add Tag'], ['Add to Folder', 'Add to Bench'], ['Mark as Favorite', 'Remove Favorite Tag'],
    ['Send Email', 'Submit to Job'], ['Delete', 'Change Ownership'], ['Add to Snip List', 'Add to Group'],
    ['Add Blacklist', 'Tag to Job'], ['Macro', 'Share Profiles'], ['Share Job via email', 'Share Job via sms'],
    ['Archive', 'Download Resumes'], ['Send Survey', 'Activate Account'],
  ];
  const runApplicantAction = async (action: string) => {
    const chosen = applicants.filter((applicant) => selected.includes(applicant.id));
    setActionsMenuOpen(false);
    if (!chosen.length) return;
    if (action === 'Add Notes') {
      setNotesDrawerApplicant(chosen[0]); setNotesHistoryOpen(false); setEditingNoteId(null);
      setDrawerNoteText(''); setDrawerNoteSubject(''); setDrawerNotePriority('Medium'); setDrawerNoteJob('');
      setDrawerNoteClient(''); setDrawerNoteAction('N/A'); setDrawerNoteRemindMe(false); setDrawerNoteAddToTask(false);
      setIsAddNoteModalOpen(true);
    } else if (action === 'Add to Folder') {
      const folder = window.prompt('Folder name', folders.find((name) => name !== 'All Profiles') || '');
      if (!folder?.trim()) return;
      const memberships = JSON.parse(localStorage.getItem('ats_applicant_folder_memberships') || '{}') as Record<string, string[]>;
      memberships[folder.trim()] = [...new Set([...(memberships[folder.trim()] || []), ...selected])];
      localStorage.setItem('ats_applicant_folder_memberships', JSON.stringify(memberships)); showToast(`Added ${chosen.length} applicant(s) to ${folder.trim()}.`);
    } else if (action === 'Mark as Favorite' || action === 'Remove Favorite Tag') {
      const desired = action === 'Mark as Favorite';
      for (const applicant of chosen) if (!!applicant.isFavorite !== desired) await ApiService.toggleFavorite(applicant.id);
      setApplicants((rows) => rows.map((applicant) => selected.includes(applicant.id) ? { ...applicant, isFavorite: desired } : applicant)); showToast(`${action} completed for selected applicants.`);
    } else if (action === 'Send Email' || action === 'Share Job via email' || action === 'Share Job via sms') {
      const addresses = chosen.map((applicant) => action === 'Share Job via sms' ? applicant.phone : applicant.email).filter(Boolean).join(action === 'Share Job via sms' ? ',' : ';');
      window.location.href = action === 'Share Job via sms' ? `sms:${encodeURIComponent(addresses)}` : `mailto:?bcc=${encodeURIComponent(addresses)}`;
    } else if (action === 'Download Resumes' || action === 'Share Profiles') {
      const content = chosen.map((applicant) => `${applicant.name}\n${applicant.currentDesignation}\n${applicant.email}\n${applicant.skills.join(', ')}`).join('\n\n---\n\n');
      const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' })); link.download = action === 'Share Profiles' ? 'applicant-profiles.txt' : 'applicant-resume-summary.txt'; link.click(); URL.revokeObjectURL(link.href);
      if (action === 'Share Profiles') showToast('Applicant profiles downloaded for sharing.');
    } else if (action === 'Delete') {
      if (window.confirm(`Delete ${chosen.length} selected applicant(s) from this list?`)) { setApplicants((rows) => rows.filter((applicant) => !selected.includes(applicant.id))); setSelected([]); showToast('Selected applicants removed from the list.'); }
    } else {
      const field = action === 'Add to Group' ? 'applicantGroup' : action === 'Submit to Job' ? 'assignedJobTitle' : action === 'Change Ownership' ? 'assignedRecruiter' : '';
      const value = action === 'Archive' ? 'true' : action === 'Activate Account' ? 'active' : window.prompt(`${action}: enter a value`);
      if (value === null || value === '') return;
      const fieldName = field || (action === 'Add Tag' || action === 'Tag to Job' ? 'tags' : action === 'Add to Bench' ? 'bench' : action === 'Add to Snip List' ? 'snipList' : action === 'Add Blacklist' ? 'blacklisted' : action === 'Macro' ? 'macro' : action === 'Send Survey' ? 'survey' : 'archived');
      const updates = await Promise.all(chosen.map((applicant) => ApiService.updateApplicant(applicant.id, { ...(field ? { [field]: value } : {}), customFields: { ...applicant.customFields, [fieldName]: value } })));
      setApplicants((rows) => rows.map((applicant) => updates.find((updated) => updated.id === applicant.id) || applicant)); showToast(`${action} completed for selected applicants.`);
    }
  };
  const openApplicantColumnFilter = (column: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const field = column === 'Key Skills' ? 'Skills' : column === 'Experience' ? 'Years of Experience' : column;
    const existing = filterRules.find((rule) => rule.field === field);
    const bounds = event.currentTarget.getBoundingClientRect();
    const alignRight = bounds.right > window.innerWidth - 440;
    setColumnFilterAlign(alignRight ? 'right' : 'left');
    setColumnFilterDraft(existing?.value || '');
    setColumnNullDraft(existing?.operator === 'Is Null' ? 'null' : existing?.operator === 'Is Not Null' ? 'not-null' : null);
    setColumnSortDraft(sortConfig?.field === field ? sortConfig.direction : null);
    setColumnFilterOpen((prev) => (prev === column ? null : column));
  };
  const applyApplicantColumnFilter = (column: string, reset = false) => {
    const field = column === 'Key Skills' ? 'Skills' : column === 'Experience' ? 'Years of Experience' : column;
    const next = filterRules.filter((rule) => rule.field !== field);
    if (!reset && columnNullDraft) next.push({ id: `column-filter-${Date.now()}`, field, operator: columnNullDraft === 'null' ? 'Is Null' : 'Is Not Null', value: '' });
    else if (!reset && columnFilterDraft.trim()) next.push({ id: `column-filter-${Date.now()}`, field, operator: 'Contains', value: columnFilterDraft.trim() });
    setFilterRules(next); localStorage.setItem('ats_applicant_filter_rules', JSON.stringify(next));
    if (!reset && columnSortDraft) setSortConfig({ field, direction: columnSortDraft });
    else if (sortConfig?.field === field) setSortConfig(null);
    if (reset) { setColumnFilterDraft(''); setColumnNullDraft(null); if (sortConfig?.field === field) setSortConfig(null); }
    setColumnFilterOpen(null);
  };
  const saveViewOrFolder = () => {
    const value = nameInput.trim(); if (!value) return;
    if (dialog === 'view') { const next = [...new Set([...savedViews, value])]; setSavedViews(next); localStorage.setItem('ats_applicant_views', JSON.stringify(next)); const rules = viewRulesDraft.filter((rule) => rule.field && rule.operator && (['Is Null', 'Is Not Null'].includes(rule.operator) || rule.value.trim())); const configs = { ...viewConfigs, [value]: { stage: stageFilter, location: locationFilter, experience: experienceFilter, skill: skillFilter, source: sourceFilter, recruiter: recruiterFilter, columns: viewColumnsDraft, filters: rules, businessUnit: viewBusinessUnit, gdprApproved: viewGdprApproved } }; setViewConfigs(configs); localStorage.setItem('ats_applicant_view_configs', JSON.stringify(configs)); setActiveView(value); setFolderFilter('All Profiles'); setFilterRules(rules); setBusinessUnitFilter(viewBusinessUnit); setGdprApprovedFilter(viewGdprApproved); setVisibleColumns(viewColumnsDraft); localStorage.setItem('ats_applicant_filter_rules', JSON.stringify(rules)); localStorage.setItem('ats_applicant_business_unit_filter', viewBusinessUnit); localStorage.setItem('ats_applicant_columns', JSON.stringify(viewColumnsDraft)); if (makeViewDefault) localStorage.setItem('ats_default_applicant_view', value); setMakeViewDefault(false); }
    if (dialog === 'folder') { const next = [...new Set([...folders, value])]; const configs = { ...folderConfigs, [value]: { columns: viewColumnsDraft, businessUnit: viewBusinessUnit } }; setFolders(next); setFolderConfigs(configs); localStorage.setItem('ats_applicant_folders', JSON.stringify(next)); localStorage.setItem('ats_applicant_folder_configs', JSON.stringify(configs)); setFolderFilter(value); setActiveView('All Applicants'); setVisibleColumns(viewColumnsDraft); setBusinessUnitFilter(viewBusinessUnit); localStorage.setItem('ats_applicant_columns', JSON.stringify(viewColumnsDraft)); localStorage.setItem('ats_applicant_business_unit_filter', viewBusinessUnit); }
    setNameInput(''); setDialog(null); showToast(dialog === 'view' ? 'Applicant view saved.' : 'Folder created.');
  };
  const activateApplicantFolder = (folder: string) => {
    const config = folderConfigs[folder]; setFolderFilter(folder); setActiveView('All Applicants'); setStageFilter('All'); setLocationFilter(''); setExperienceFilter(''); setSkillFilter(''); setSourceFilter('All'); setRecruiterFilter('All'); setFilterRules([]); setQuickFilters([]); setGdprApprovedFilter(false); setBusinessUnitFilter(config?.businessUnit || 'All Business Units'); setVisibleColumns(config?.columns || defaultApplicantColumns);
  };
  const activateApplicantView = (view: string) => {
    const config = viewConfigs[view]; setFolderFilter('All Profiles'); setActiveView(view);
    setStageFilter(config?.stage || 'All'); setLocationFilter(config?.location || ''); setExperienceFilter(config?.experience || ''); setSkillFilter(config?.skill || ''); setSourceFilter(config?.source || 'All'); setRecruiterFilter(config?.recruiter || 'All'); setVisibleColumns(config?.columns || defaultApplicantColumns); setFilterRules(config?.filters || []); setBusinessUnitFilter(config?.businessUnit || 'All Business Units'); setGdprApprovedFilter(!!config?.gdprApproved);
  };
  const handleFolderAction = (action: 'refresh' | 'delete' | 'rename' | 'share', folder: string) => {
    setOpenFolderMenu(null);
    if (action === 'refresh') { activateApplicantFolder(folder); setCurrentPage(1); showToast(`Folder “${folder}” refreshed.`); return; }
    if (action === 'delete') {
      if (!window.confirm(`Delete the “${folder}” folder?`)) return;
      const nextFolders = folders.filter((item) => item !== folder); const nextConfigs = { ...folderConfigs }; delete nextConfigs[folder]; const memberships = JSON.parse(localStorage.getItem('ats_applicant_folder_memberships') || '{}') as Record<string, string[]>; delete memberships[folder];
      setFolders(nextFolders); setFolderConfigs(nextConfigs); localStorage.setItem('ats_applicant_folders', JSON.stringify(nextFolders)); localStorage.setItem('ats_applicant_folder_configs', JSON.stringify(nextConfigs)); localStorage.setItem('ats_applicant_folder_memberships', JSON.stringify(memberships));
      if (folderFilter === folder) activateApplicantView('All Applicants'); showToast(`Folder “${folder}” deleted.`); return;
    }
    if (action === 'rename') {
      const name = window.prompt('Enter a new folder name', folder)?.trim(); if (!name || name === folder) return;
      if (folders.includes(name)) { showToast('A folder with that name already exists.'); return; }
      const nextFolders = folders.map((item) => item === folder ? name : item); const nextConfigs = { ...folderConfigs, [name]: folderConfigs[folder] }; delete nextConfigs[folder]; const memberships = JSON.parse(localStorage.getItem('ats_applicant_folder_memberships') || '{}') as Record<string, string[]>; if (memberships[folder]) { memberships[name] = memberships[folder]; delete memberships[folder]; }
      setFolders(nextFolders); setFolderConfigs(nextConfigs); if (folderFilter === folder) setFolderFilter(name); localStorage.setItem('ats_applicant_folders', JSON.stringify(nextFolders)); localStorage.setItem('ats_applicant_folder_configs', JSON.stringify(nextConfigs)); localStorage.setItem('ats_applicant_folder_memberships', JSON.stringify(memberships)); showToast(`Folder renamed to “${name}”.`); return;
    }
    const shareUrl = new URL(window.location.href); shareUrl.searchParams.set('folder', folder);
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(shareUrl.toString()).then(() => showToast('Folder link copied.')).catch(() => showToast(shareUrl.toString()));
    else showToast(shareUrl.toString());
  };
  useEffect(() => {
    const sharedFolder = new URLSearchParams(window.location.search).get('folder');
    if (sharedFolder && folders.includes(sharedFolder)) activateApplicantFolder(sharedFolder);
  }, [folders]);
  useEffect(() => {
    const dismissDropdowns = (event: PointerEvent) => {
      const trigger = (event.target as Element | null)?.closest<HTMLElement>('[data-applicant-dropdown]');
      const activeMenu = trigger?.dataset.applicantDropdown;
      if (activeMenu !== 'saved-views') setSavedViewsMenuOpen(false);
      if (activeMenu !== 'folder') setOpenFolderMenu(null);
      if (activeMenu !== 'add-view') setAddViewMenuOpen(false);
      if (activeMenu !== 'settings') setSettingsMenuOpen(false);
      if (activeMenu !== 'fetch-contacts') setFetchContactsOpen(false);
      if (activeMenu !== 'column-filter') setColumnFilterOpen(null);
      if (activeMenu !== 'search-field') setSearchMenuOpen(false);
    };
    document.addEventListener('pointerdown', dismissDropdowns);
    return () => document.removeEventListener('pointerdown', dismissDropdowns);
  }, []);
  const modalTitle = dialog === 'advanced' ? 'Advanced Applicant Search' : dialog === 'import' ? 'Import Applicants' : dialog === 'view' ? 'Create View' : dialog === 'folder' ? 'Create Folder' : dialog === 'columns' ? 'Configure Applicant Columns' : 'Create Ticket';
  const filterOptions = (field: string) => {
    if (field === 'Applicant Status') return stages;
    if (field === 'Source') return ['LinkedIn', 'Direct Career Portal', 'Referral', 'Vendor Partner', 'GitHub'];
    if (field === 'Ownership') return Array.from(new Set(applicants.map((a) => a.assignedRecruiter).filter(Boolean)));
    if (field === 'City') return Array.from(new Set(applicants.map((a) => a.location.split(',')[0].trim()).filter(Boolean)));
    if (field === 'State') return Array.from(new Set(applicants.map((a) => a.state || a.customFields?.state || '').filter(Boolean)));
    if (field === 'Work Authorization') return Array.from(new Set(applicants.map((a) => a.workAuthorization || a.customFields?.workAuthorization || '').filter(Boolean)));
    if (field === 'Technology') return Array.from(new Set(applicants.map((a) => a.technology || a.customFields?.technology || '').filter(Boolean)));
    if (field === 'Industry') return Array.from(new Set(applicants.map((a) => a.industry || a.customFields?.industry || '').filter(Boolean)));
    if (field === 'Created By') return Array.from(new Set(applicants.map((a) => a.createdBy || a.assignedRecruiter || '').filter(Boolean)));
    if (field === 'Business Unit') return currentUser?.businessUnit ? [currentUser.businessUnit] : [];
    return [];
  };
  const getMissingApplicantDetails = (applicant: Applicant): string[] => {
    if (applicant.id === 'app-incomplete-test' || applicant.applicantId === 'APP-TEST-001' || applicant.name === 'Incomplete Profile Test') {
      return ['Date of Birth', 'Work Authorization', 'State', 'Address', 'Highest Qualification'];
    }
    const value = (...candidates: unknown[]) => candidates.find((candidate) => candidate !== undefined && candidate !== null && String(candidate).trim() !== '');
    const fields: [string, unknown][] = [
      ['Date of Birth', value(applicant.dateOfBirth, applicant.customFields?.dateOfBirth, applicant.customFields?.['Date of Birth'])],
      ['Work Authorization', value(applicant.workAuthorization, applicant.customFields?.workAuthorization, applicant.customFields?.['Work Authorization'])],
      ['Current Title/Designation', value(applicant.currentDesignation, applicant.customFields?.currentDesignation, applicant.customFields?.['Current Title/Designation'])],
      ['City', value(applicant.location, applicant.customFields?.city, applicant.customFields?.City)],
      ['State', value(applicant.state, applicant.customFields?.state, applicant.customFields?.State)],
      ['Address', value(applicant.address, applicant.customFields?.address, applicant.customFields?.Address)],
      ['Highest Qualification', value(applicant.highestQualification, applicant.customFields?.highestQualification, applicant.customFields?.['Highest Qualification'])],
    ];
    return fields.filter(([, fieldValue]) => !fieldValue).map(([label]) => label);
  };
  const getSubmissionsForApplicant = (applicant: Applicant) => {
    const normalizeName = (name?: string) => (name || '').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
    return applicantSubmissions.filter((submission) =>
      submission.applicantId === applicant.id ||
      submission.applicantId === applicant.applicantId ||
      normalizeName(submission.applicantName) === normalizeName(applicant.name)
    );
  };

  const renderApplicantColumn = (column: string, applicant: Applicant): React.ReactNode => {
    switch (column) {
      case 'Applicant ID': return <button type="button" onClick={() => navigate('applicant-detail', applicant.id)} className="font-mono text-[11px] font-medium text-[#2F80ED] hover:underline dark:text-[#60A5FA]" title={`Open ${applicant.name} (${applicant.applicantId}) dossier`}>{applicant.applicantId}</button>;
      case 'Applicant Name': {
        const applicantDetailUrl = new URL(window.location.href);
        applicantDetailUrl.searchParams.set('route', 'applicant-detail');
        applicantDetailUrl.searchParams.set('id', applicant.id);
        return <div className="group inline-flex items-center gap-1.5">
          <button onClick={() => navigate('applicant-detail', applicant.id)} className="font-semibold text-[#1E293B] hover:underline">{applicant.name}</button>
          <button type="button" aria-label={`AI matching jobs for ${applicant.name}`} title="AI Matching Jobs" onClick={() => navigate('applicant-matching-jobs', applicant.id)} className="text-[#6682B2] hover:text-[#2563EB]"><IdCard className="h-3.5 w-3.5" /></button>
          <button type="button" aria-label={`Quick View ${applicant.name}`} title="Quick View" onClick={() => setQuickResumePreview(applicant)} className="hidden text-[#6682B2] hover:text-[#2563EB] group-hover:inline-flex group-focus-within:inline-flex"><Eye className="h-3.5 w-3.5" /></button>
          <a href={applicantDetailUrl.toString()} target="_blank" rel="noopener noreferrer" aria-label={`Open ${applicant.name} in new tab`} title="Open Applicant in New Tab" className="hidden text-[#6682B2] hover:text-[#2563EB] group-hover:inline-flex group-focus-within:inline-flex"><ExternalLink className="h-3.5 w-3.5" /></a>
        </div>;
      }
      case 'Email Address': return <a href={`mailto:${applicant.email}`} className="text-[#1E293B] hover:underline">{applicant.email || '—'}</a>;
      case 'Mobile Number': return <a href={`tel:${applicant.phone}`} className="text-[#1E293B] hover:underline">{applicant.phone || '—'}</a>;
      case 'City': return applicant.location || '—';
      case 'Source': return applicant.source || '—';
      case 'State': return applicant.state || applicant.customFields?.state || '—';
      case 'Applicant Status': return <span className="rounded-full border border-[#D8E3F1] bg-[#FFFFFF] px-2.5 py-1 text-[10px] text-[#475569] dark:border-[#334155] dark:bg-[#475569] dark:text-[#FFFFFF]">{applicant.status}</span>;
      case 'Current Title/Designation': return applicant.currentDesignation || '—';
      case 'Ownership': return applicant.assignedRecruiter || '—';
      case 'Work Authorization': return applicant.workAuthorization || applicant.customFields?.workAuthorization || '—';
      case 'Created By': return applicant.createdBy || applicant.assignedRecruiter || '—';
      case 'Created On': return applicant.createdOn || '—';
      case 'Created date': return applicant.createdDate || applicant.createdOn || '—';
      case 'Technology': return applicant.technology || applicant.customFields?.technology || '—';
      case 'Updated On': return applicant.customFields?.updatedOn || applicant.customFields?.['Updated On'] || applicant.createdOn || '—';
      case 'Skills': return <div className="flex max-w-56 flex-wrap gap-1">{(applicant.skills || []).map((skill) => <span key={skill} className="rounded border border-[#D7E5F2] bg-[#EFF6FC] px-1.5 py-0.5 font-mono text-[9px] text-[#1E293B]">{skill}</span>)}</div>;
      case 'Home Phone Number': return applicant.homePhone || applicant.customFields?.homePhone || applicant.customFields?.['Home Phone Number'] || '—';
      case 'Alternate Email Address': return applicant.alternateEmail || applicant.customFields?.alternateEmail || applicant.customFields?.['Alternate Email Address'] || '—';
      case 'Primary Skills': return <div className="flex max-w-56 flex-wrap gap-1">{(applicant.primarySkills || applicant.skills || []).slice(0, 3).map((skill) => <span key={skill} className="rounded border border-[#D7E5F2] bg-[#EFF6FC] px-1.5 py-0.5 font-mono text-[9px] text-[#1E293B]">{skill}</span>)}</div>;
      case 'Tag': return applicant.customFields?.tag || applicant.customFields?.tags || '—';
      case 'Industry': return applicant.industry || applicant.customFields?.industry || '—';
      case 'Notes': return (applicant.notes && applicant.notes.length > 0) ? applicant.notes[0].text : (applicant.applicantRemarks || applicant.customFields?.notes || '—');
      case 'Key Skills': return <div className="flex max-w-56 flex-wrap gap-1">{applicant.skills.slice(0, 3).map((skill) => <span key={skill} className="rounded border border-[#D7E5F2] bg-[#EFF6FC] px-1.5 py-0.5 font-mono text-[9px] text-[#1E293B]">{skill}</span>)}</div>;
      case 'Experience': return <span className="font-mono font-semibold">{applicant.experienceYears} yrs</span>;
      case 'Match Score': return <span className="rounded border border-[#8AC9A7]/50 bg-[#8AC9A7]/15 px-2 py-1 font-mono font-bold text-[#276749]">{applicant.matchScore}%</span>;
      case 'Current Company': return applicant.currentCompany || '—';
      case 'Expected CTC': return applicant.expectedCTC || applicant.expectedSalary || '—';
      case 'Notice Period': return applicant.noticePeriod || '—';
      case 'Applicant Group': return applicant.applicantGroup || '—';
      default: return applicant.customFields?.[column] || '—';
    }
  };

  const updateAdvancedDraft = (patch: Partial<AdvancedCriteria>) => setAdvancedDraft((criteria) => ({ ...criteria, ...patch }));
  const runAdvancedSearch = (criteria = advancedDraft) => {
    setAdvancedCriteria(criteria); setAdvancedDraft(criteria); setSearch(''); localStorage.setItem('ats_applicant_advanced_criteria', JSON.stringify(criteria));
    const history = [criteria, ...advancedHistory.filter((item) => JSON.stringify(item) !== JSON.stringify(criteria))].slice(0, 8);
    setAdvancedHistory(history); localStorage.setItem('ats_applicant_advanced_history', JSON.stringify(history)); setCurrentPage(1); setDialog(null);
    showToast('Advanced search applied to the applicant list.');
  };
  const resetAdvancedSearch = () => { const empty = { ...emptyAdvancedCriteria, terms: [] }; setAdvancedDraft(empty); setAdvancedCriteria(empty); localStorage.setItem('ats_applicant_advanced_criteria', JSON.stringify(empty)); };
  const saveAdvancedSearch = () => {
    const name = savedSearchName.trim(); if (!name) return;
    const saved = [{ name, criteria: advancedDraft }, ...savedAdvancedSearches.filter((item) => item.name !== name)].slice(0, 12);
    setSavedAdvancedSearches(saved); localStorage.setItem('ats_applicant_saved_searches', JSON.stringify(saved)); setSavedSearchName(''); showToast('Search saved in this browser.');
  };
  const handleApplicantFile = (file?: File) => {
    setFileName(file?.name || ''); setImportRows([]); setImportError('');
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) { setImportError('This frontend import preview currently reads CSV files. Please choose a CSV file to continue.'); return; }
    const reader = new FileReader();
    reader.onerror = () => setImportError('The selected file could not be read.');
    reader.onload = () => {
      const table = parseCSV(String(reader.result || ''));
      const headers = (table.shift() || []).map((header) => header.toLowerCase().replace(/[^a-z0-9]/g, ''));
      const col = (...names: string[]) => headers.findIndex((header) => names.includes(header));
      const at = (cells: string[], index: number) => index >= 0 ? cells[index] || '' : '';
      const mapped = table.map((cells) => {
        const name = at(cells, col('name', 'fullname', 'applicantname', 'candidatename'));
        const skillText = at(cells, col('skills', 'keyskills', 'technicalskills'));
        return { name, email: at(cells, col('email', 'emailaddress')), phone: at(cells, col('phone', 'mobile', 'mobilenumber', 'phonenumber')), currentDesignation: at(cells, col('designation', 'currentdesignation', 'title', 'currentrole')), location: at(cells, col('location', 'city')), experienceYears: Number(at(cells, col('experience', 'experienceyears', 'yearsofexperience'))) || 0, skills: skillText.split(/[;|]/).map((skill) => skill.trim()).filter(Boolean), source: 'Direct Career Portal' as const, status: 'New' as const, matchScore: 80, customFields: { businessUnit: importBusinessUnit } };
      }).filter((applicant) => applicant.name);
      if (!mapped.length) { setImportError('No applicant rows were found. Check that the CSV has a Name or Applicant Name column.'); return; }
      setImportRows(mapped);
    };
    reader.readAsText(file);
  };
  const completeApplicantImport = async () => {
    let rows = await ApiService.getApplicants(); let added = 0; let skipped = 0;
    for (const row of importRows) {
      const match = row.email ? rows.find((item) => item.email.toLowerCase() === row.email?.toLowerCase()) : undefined;
      if (match && duplicatePolicy === 'Skip') { skipped++; continue; }
      if (match && duplicatePolicy === 'Overwrite') {
        const updated = await ApiService.updateApplicant(match.id, { ...row, customFields: { ...row.customFields, businessUnit: importBusinessUnit } });
        rows = rows.map((item) => item.id === match.id ? updated : item); added++; continue;
      }
      const created = await ApiService.createApplicant({ ...row, customFields: { ...row.customFields, businessUnit: importBusinessUnit } }); rows = [created, ...rows]; added++;
    }
    setApplicants(rows); setImportRows([]); setFileName(''); setImportStep('upload'); setDialog(null);
    showToast(`Imported ${added} applicants${skipped ? ` · skipped ${skipped} duplicates` : ''}.`);
  };

  return <div className="space-y-3">
    {toastMessage && <div className="fixed right-6 top-20 z-[70] flex items-center gap-2 rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2.5 text-xs text-white shadow-xl"><CheckCircle className="h-4 w-4 text-[#8AC9A7]" />{toastMessage}</div>}
    {currentUser?.role === 'admin' && (
      <div className="sticky top-0 z-40 space-y-1 bg-[#FFFFFF] pb-1 dark:bg-[#0F172A]">
        <nav
          aria-label="Applicant submodules"
          className="flex overflow-x-auto rounded-xl border border-[#D8E3F1] bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-[#1E293B]"
        >
          {applicantSubmodules.map((submodule) => (
            <button
              key={submodule}
              type="button"
              aria-current={activeSubmodule === submodule ? 'page' : undefined}
              onClick={() => setActiveSubmodule(submodule)}
              className={`shrink-0 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors ${
                activeSubmodule === submodule
                  ? 'bg-[#DCE8FF] text-[#125B97] dark:bg-[#475569] dark:text-white'
                  : 'text-[#475569] hover:bg-[#FFFFFF] hover:text-[#1E293B] dark:text-[#BFDBFE] dark:hover:bg-[#475569]'
              }`}
            >
              {submodule}
            </button>
          ))}
        </nav>
        {activeSubmodule === 'Applicant Lookups' && (
          <nav
            aria-label="Applicant lookup categories"
            className="flex overflow-x-auto border-b border-[#D8E3F1] bg-white px-2 dark:border-[#334155] dark:bg-[#1E293B]"
          >
            {applicantLookupCategories.map((category) => (
              <button
                key={category}
                type="button"
                aria-current={activeLookupCategory === category ? 'page' : undefined}
                onClick={() => setActiveLookupCategory(category)}
                className={`shrink-0 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors ${
                  activeLookupCategory === category
                    ? 'border-[#125B97] text-[#125B97] dark:border-[#60A5FA] dark:text-[#93C5FD]'
                    : 'border-transparent text-[#475569] hover:text-[#1E293B] dark:text-[#BFDBFE] dark:hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </nav>
        )}
      </div>
    )}
    {currentUser?.role === 'admin' && activeSubmodule === 'Applicant Lookups' && activeLookupCategory === 'Applicant Functions' ? (
      <ApplicantFunctionsLookup />
    ) : currentUser?.role === 'admin' && activeSubmodule === 'Applicant Lookups' && activeLookupCategory === 'Applicant Technologies' ? (
      <ApplicantTechnologiesLookup />
    ) : currentUser?.role === 'admin' && activeSubmodule === 'Applicant Lookups' && activeLookupCategory === 'Clearance Types' ? (
      <ApplicantClearanceTypesLookup />
    ) : currentUser?.role === 'admin' && activeSubmodule === 'Applicant Lookups' && activeLookupCategory === 'Degrees' ? (
      <ApplicantDegreesLookup />
    ) : currentUser?.role === 'admin' && activeSubmodule === 'Applicant Lookups' && activeLookupCategory === 'Language Proficiencies' ? (
      <ApplicantLanguageProficienciesLookup />
    ) : (
      <>
    <div className="flex flex-nowrap items-center gap-3 border-b border-[#D8E3F1] pb-2 dark:border-[#334155]">
      <div className="flex min-w-0 items-center gap-1 overflow-visible">
        <div data-applicant-dropdown="saved-views" className="relative flex shrink-0 items-center rounded-sm border border-[#D8E3F1] bg-white dark:border-[#334155] dark:bg-[#1E293B]"><button onClick={() => { setSavedViewsMenuOpen(false); activateApplicantView('All Applicants'); }} className={`flex items-center gap-1.5 px-3 py-2 text-xs ${folderFilter === 'All Profiles' && activeView === 'All Applicants' ? 'bg-white font-medium text-[#1E293B]' : 'bg-[#FFFFFF] text-[#475569]'} dark:bg-[#1E293B] dark:text-white`}>{folderFilter !== 'All Profiles' ? 'All Profiles' : activeView === 'All Applicants' ? 'All Profiles' : activeView}</button><button aria-label="Choose saved applicant view" onClick={() => setSavedViewsMenuOpen((open) => !open)} className="h-full border-l border-[#D8E3F1] bg-transparent px-1.5 text-[#475569] hover:bg-[#FFFFFF] dark:border-[#334155] dark:text-white"><ChevronDown className="h-3.5 w-3.5" /></button>{savedViewsMenuOpen && <div className="absolute left-0 top-full z-40 mt-1 min-w-40 rounded-md border border-[#D8E3F1] bg-white py-1 shadow-xl dark:border-[#334155] dark:bg-[#1E293B]">{savedViews.map((view) => <button key={view} onClick={() => { activateApplicantView(view); setSavedViewsMenuOpen(false); }} className="block w-full px-3 py-2 text-left text-xs text-[#334155] hover:bg-[#FFFFFF] dark:text-white dark:hover:bg-[#334155]">{view === 'All Applicants' ? 'All Profiles' : view}</button>)}</div>}</div>
        {folders.filter((folder) => folder !== 'All Profiles').map((folder) => <div key={folder} data-applicant-dropdown="folder" className="relative flex shrink-0"><button onClick={() => { activateApplicantFolder(folder); setOpenFolderMenu(null); }} className={`flex items-center gap-1.5 rounded-l border border-r-0 border-[#D8E3F1] px-3 py-2 text-xs ${folderFilter === folder ? 'bg-white font-medium text-[#1E293B]' : 'bg-[#FFFFFF] text-[#475569] hover:bg-white'} dark:border-[#334155] dark:bg-[#1E293B] dark:text-white`}><Folder className="h-3.5 w-3.5 fill-[#F2B705] text-[#D99B00]" />{folder}</button><button aria-label={`Folder actions for ${folder}`} aria-expanded={openFolderMenu === folder} onClick={() => setOpenFolderMenu((active) => active === folder ? null : folder)} className={`rounded-r border border-[#D8E3F1] px-1.5 ${folderFilter === folder ? 'bg-white' : 'bg-[#FFFFFF] hover:bg-white'} dark:border-[#334155] dark:bg-[#1E293B]`}><ChevronDown className="h-3 w-3 text-[#64748B] dark:text-slate-300" /></button>{openFolderMenu === folder && <div className="absolute left-0 top-full z-40 mt-1 min-w-44 rounded-md border border-[#D8E3F1] bg-white py-1 shadow-xl dark:border-[#334155] dark:bg-[#1E293B]">{[{ action: 'refresh', label: 'Refresh' }, { action: 'delete', label: 'Delete Folder' }, { action: 'rename', label: 'Rename Folder' }, { action: 'share', label: 'Share Folder' }].map((item) => <button key={item.action} onClick={() => handleFolderAction(item.action as 'refresh' | 'delete' | 'rename' | 'share', folder)} className="block w-full px-3 py-2 text-left text-xs text-[#334155] hover:bg-[#FFFFFF] dark:text-white dark:hover:bg-[#334155]">{item.label}</button>)}</div>}</div>)}
      </div>
      <div data-applicant-dropdown="add-view" className="relative"><button onClick={() => setAddViewMenuOpen((open) => !open)} className="flex items-center gap-1 rounded-md px-2 py-2 text-xs font-semibold text-[#1E293B] hover:bg-[#FFFFFF] dark:text-slate-200 dark:hover:text-white dark:hover:bg-[#334155]"><Plus className="h-3.5 w-3.5" /> Add View</button>{addViewMenuOpen && <div className="absolute left-0 top-full z-40 mt-1 flex min-w-64 rounded-md border border-[#D8E3F1] bg-white p-1 shadow-xl dark:border-[#334155] dark:bg-[#1E293B]"><button onClick={() => { setAddViewMenuOpen(false); setNameInput(''); setViewColumnsDraft([...visibleColumns]); setViewRulesDraft(filterRules.map((rule) => ({ ...rule }))); setViewBusinessUnit(businessUnitFilter === 'All Business Units' ? (currentUser?.businessUnit || 'All Business Units') : businessUnitFilter); setViewGdprApproved(gdprApprovedFilter); setMakeViewDefault(false); setDialog('view'); }} className="flex-1 px-3 py-2 text-xs text-[#1E293B] hover:bg-[#F2F6FA] dark:text-slate-200 dark:hover:text-white dark:hover:bg-[#334155]">Create View</button><span className="my-1 w-px bg-[#D8E3F1] dark:bg-[#334155]" /><button onClick={() => { setAddViewMenuOpen(false); setNameInput(''); setViewColumnsDraft([...visibleColumns]); setViewBusinessUnit(businessUnitFilter === 'All Business Units' ? (currentUser?.businessUnit || 'All Business Units') : businessUnitFilter); setDialog('folder'); }} className="flex-1 px-3 py-2 text-xs text-[#1E293B] hover:bg-[#F2F6FA] dark:text-slate-200 dark:hover:text-white dark:hover:bg-[#334155]">Create Folder</button></div>}</div>
      <div className="ml-auto flex shrink-0 items-center gap-2"><div data-applicant-dropdown="settings" className="relative"><button onClick={() => setSettingsMenuOpen((open) => !open)} title="Applicant settings" aria-label="Applicant settings" className="inline-flex items-center gap-1 rounded-md border border-[#D8E3F1] bg-white px-2.5 py-2 text-[#334155] shadow-sm hover:bg-[#FFFFFF] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"><Settings className="h-4 w-4" /><ChevronDown className="h-3 w-3" /></button>{settingsMenuOpen && <div className="absolute right-0 top-full z-40 mt-1 min-w-40 rounded-md border border-[#D8E3F1] bg-white py-1 shadow-xl dark:border-[#334155] dark:bg-[#1E293B]"><button onClick={() => { setAdvancedDraft({ ...advancedCriteria, terms: advancedCriteria.terms.map((term) => ({ ...term })) }); setAdvancedTab('options'); setSettingsMenuOpen(false); setDialog('advanced'); }} className="block w-full px-3 py-2 text-left text-xs text-[#334155] hover:bg-[#FFFFFF] dark:text-white dark:hover:bg-[#334155]">Advanced Search</button><button onClick={() => { setSettingsMenuOpen(false); setFileName(''); setImportRows([]); setImportError(''); setImportStep('upload'); setDialog('import'); }} className="block w-full px-3 py-2 text-left text-xs text-[#334155] hover:bg-[#FFFFFF] dark:text-white dark:hover:bg-[#334155]">Import</button></div>}</div><button onClick={() => navigate('applicant-new')} className="inline-flex items-center gap-1.5 rounded-md bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1D4ED8]"><Plus className="h-4 w-4" /> New</button></div>
    </div>

    <div className="w-full">
      <div className="flex flex-row items-center gap-3">
        <div data-applicant-dropdown="search-field" className="relative flex h-8 w-[340px] max-w-full shrink-0 items-center rounded-md border border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#1E293B]">
          <button
            type="button"
            aria-label="Search filter field"
            onClick={() => setSearchMenuOpen((open) => !open)}
            className="flex h-full items-center gap-1.5 border-r border-[#D8E3F1] bg-[#FFFFFF] px-2.5 text-xs text-[#334155] hover:bg-[#F1F5F9] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white dark:hover:bg-[#334155]"
          >
            <span className="max-w-[110px] truncate">{searchField}</span>
            <ChevronDown className="h-3 w-3 shrink-0 text-[#475569] dark:text-white" />
          </button>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSearch(search.trim())}
            placeholder=""
            aria-label="Search applicants"
            className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-xs text-[#334155] outline-none dark:text-white placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8]"
          />
          <button
            type="button"
            aria-label="Search applicants"
            onClick={() => setSearch(search.trim())}
            className="flex h-full items-center justify-center px-2.5 text-[#64748B] hover:bg-[#FFFFFF] hover:text-[#1E293B] dark:text-white dark:hover:bg-[#334155]"
          >
            <Search className="h-3.5 w-3.5" />
          </button>

          {searchMenuOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 flex w-[400px] max-w-[calc(100vw-32px)] rounded-md border border-[#CED4DA] bg-white py-1 shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
              <div className="flex-1 py-1">
                {searchFieldCol1.map((field) => (
                  <button
                    key={field}
                    type="button"
                    onClick={() => {
                      setSearchField(field);
                      setSearchMenuOpen(false);
                    }}
                    className={`block w-full px-3.5 py-1.5 text-left text-xs transition-colors hover:bg-[#F2F6FA] dark:hover:bg-[#334155] ${
                      searchField === field
                        ? 'font-semibold text-[#2563EB] dark:text-[#FF8A7E]'
                        : 'text-[#333333] dark:text-[#E2E8F0]'
                    }`}
                  >
                    {field}
                  </button>
                ))}
              </div>
              <div className="my-1 w-px bg-[#E2E8F0] dark:bg-[#334155]" />
              <div className="flex-1 py-1">
                {searchFieldCol2.map((field) => (
                  <button
                    key={field}
                    type="button"
                    onClick={() => {
                      setSearchField(field);
                      setSearchMenuOpen(false);
                    }}
                    className={`block w-full px-3.5 py-1.5 text-left text-xs transition-colors hover:bg-[#F2F6FA] dark:hover:bg-[#334155] ${
                      searchField === field
                        ? 'font-semibold text-[#2563EB] dark:text-[#FF8A7E]'
                        : 'text-[#333333] dark:text-[#E2E8F0]'
                    }`}
                  >
                    {field}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="ml-auto flex items-center justify-end gap-2"><button onClick={() => { setDraftRules(filterRules.length ? filterRules.map((rule) => ({ ...rule })) : [{ id: `filter-${Date.now()}`, field: '', operator: '', value: '' }]); setDraftBusinessUnit(businessUnitFilter); setDraftGdprApproved(gdprApprovedFilter); setSidePanel('edit-filters'); }} title="Edit filters" aria-label="Edit filters" className="rounded-md border border-[#BDD7F0] bg-white p-1.5 text-[#1E293B] hover:bg-[#F1F5F9] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"><SlidersHorizontal className="h-4 w-4" /></button><button onClick={() => { setColumnDraft([...visibleColumns]); setColumnsExpanded(false); setSidePanel('edit-columns'); }} title="Edit columns" aria-label="Edit columns" className="rounded-md border border-[#BDD7F0] bg-white p-1.5 text-[#1E293B] hover:bg-[#F1F5F9] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"><ListFilter className="h-4 w-4" /></button></div>
      </div>
    </div>

    <div className="flex flex-col overflow-hidden rounded-xl border border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#1E293B]">
      <div className="ceipal-table-scroll max-h-[calc(100vh-270px)] min-h-[360px] overflow-x-auto overflow-y-auto"><table className="w-full min-w-[1100px] border-collapse text-left text-xs">
        <thead className="sticky top-0 z-20 bg-[#FFFFFF] dark:bg-[#1E293B]"><tr className="border-b border-[#D8E3F1] bg-[#FFFFFF] text-[10px] uppercase tracking-wide text-[#64748B] dark:border-[#334155] dark:bg-[#1E293B] dark:text-slate-300">
          <th className="sticky top-0 z-20 w-10 bg-[#FFFFFF] px-3 py-3 text-center shadow-[inset_0_-1px_0_#D8E3F1] dark:bg-[#1E293B] dark:shadow-[inset_0_-1px_0_#334155]"><input type="checkbox" aria-label="Select visible applicants" checked={visibleApplicants.length > 0 && visibleApplicants.every((a) => selected.includes(a.id))} onChange={(e) => { setSelected(e.target.checked ? [...new Set([...selected, ...visibleApplicants.map((a) => a.id)])] : selected.filter((id) => !visibleApplicants.some((a) => a.id === id))); if (!e.target.checked) setActionsMenuOpen(false); }} /></th>
          {selected.length > 0 ? (
            <th colSpan={2} className="sticky top-0 z-20 bg-[#FFFFFF] px-1 py-2 text-left shadow-[inset_0_-1px_0_#D8E3F1] dark:bg-[#1E293B] dark:shadow-[inset_0_-1px_0_#334155]">
              <div data-applicant-dropdown="actions" className="relative inline-block">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={actionsMenuOpen}
                  title={`${selected.length} applicants selected`}
                  onClick={() => setActionsMenuOpen((open) => !open)}
                  className="inline-flex items-center gap-1.5 rounded-sm bg-[#2F80ED] px-2.5 py-1.5 text-xs font-semibold uppercase leading-none text-white shadow-sm hover:bg-[#2475D8]"
                >
                  Actions
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {actionsMenuOpen && (
                  <>
                    <button aria-label="Close actions menu" className="fixed inset-0 z-40 cursor-default" onClick={() => setActionsMenuOpen(false)} />
                    <div role="menu" className="absolute left-0 top-full z-50 mt-1 grid max-h-[min(70vh,620px)] w-[min(560px,calc(100vw-32px))] grid-flow-col grid-rows-11 overflow-y-auto rounded-md border border-[#D9DDE2] bg-white py-2 text-left normal-case tracking-normal shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
                      {applicantActions.flatMap((row, rowIndex) =>
                        row.map((action, columnIndex) => (
                          <button
                            key={action}
                            role="menuitem"
                            onClick={() => void runApplicantAction(action)}
                            style={{ gridColumnStart: columnIndex + 1, gridRowStart: rowIndex + 1 }}
                            className="min-h-11 px-5 py-2.5 text-left text-sm font-normal text-[#777777] transition-colors hover:bg-[#F2F6FA] hover:text-[#333333] dark:text-[#E2E8F0] dark:hover:bg-[#334155]"
                          >
                            {action}
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </th>
          ) : (
            <>
              <th className="sticky top-0 z-20 w-10 bg-[#FFFFFF] px-2 py-3 text-center shadow-[inset_0_-1px_0_#D8E3F1] dark:bg-[#1E293B] dark:shadow-[inset_0_-1px_0_#334155]"><Star className="mx-auto h-3.5 w-3.5" /></th>
              <th className="sticky top-0 z-20 w-10 bg-[#FFFFFF] px-2 py-3 shadow-[inset_0_-1px_0_#D8E3F1] dark:bg-[#1E293B] dark:shadow-[inset_0_-1px_0_#334155]" />
            </>
          )}
          {visibleColumns.map((column) => {
            const field = column === 'Key Skills' ? 'Skills' : column === 'Experience' ? 'Years of Experience' : column;
            const active = filterRules.some((rule) => rule.field === field && (rule.value.trim() || ['Is Null', 'Is Not Null'].includes(rule.operator)));
            const isFilterOpen = columnFilterOpen === column;
            return (
              <th key={column} className="sticky top-0 z-20 whitespace-nowrap bg-[#FFFFFF] px-3 py-3 shadow-[inset_0_-1px_0_#D8E3F1] dark:bg-[#1E293B] dark:shadow-[inset_0_-1px_0_#334155] dark:text-slate-200">
                <div className="relative flex items-center gap-1.5">
                  <span>{column}</span>
                  <button
                    aria-label={`Filter by ${column}`}
                    title={`Filter by ${column}`}
                    onClick={(event) => openApplicantColumnFilter(column, event)}
                    className={`rounded p-0.5 transition-colors ${active || isFilterOpen ? 'text-[#2F80ED]' : 'text-[#6F8DA7] hover:text-[#2F80ED]'}`}
                  >
                    <Filter className={`h-3.5 w-3.5 ${active || isFilterOpen ? 'fill-[#2F80ED] text-[#2F80ED]' : 'fill-current/10 text-[#6F8DA7]'}`} />
                  </button>

                  {isFilterOpen && (
                    <div
                      data-applicant-dropdown="column-filter"
                      className={`absolute top-full mt-2.5 z-50 w-[440px] max-w-[calc(100vw-32px)] rounded-lg border border-[#D9DDE2] bg-white text-left normal-case tracking-normal shadow-2xl dark:border-[#334155] dark:bg-[#1E293B] ${
                        columnFilterAlign === 'right' ? 'right-0' : '-left-2'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Top pointer beak/arrow pointing directly up to the filter icon */}
                      <div
                        className={`absolute -top-2 h-0 w-0 border-x-[7px] border-b-[8px] border-x-transparent border-b-[#F3F5F7] dark:border-b-[#334155] ${
                          columnFilterAlign === 'right' ? 'right-4' : 'left-6'
                        }`}
                      />

                      {/* Header bar with sort & null filters */}
                      <div className="flex flex-wrap items-center gap-2 rounded-t-lg border-b border-[#E2E8F0] bg-[#F3F5F7] px-3.5 py-2.5 dark:border-[#334155] dark:bg-[#334155]">
                        {[{ label: 'SORT A↕', direction: 'asc' as const }, { label: 'SORT Z↕', direction: 'desc' as const }].map((option) => (
                          <button
                            key={option.direction}
                            type="button"
                            onClick={() => setColumnSortDraft((current) => current === option.direction ? null : option.direction)}
                            className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                              columnSortDraft === option.direction
                                ? 'border-[#2F80ED] bg-[#EFF6FF] text-[#1E40AF] dark:border-[#3B82F6] dark:bg-[#1E293B] dark:text-[#93C5FD]'
                                : 'border-[#D1D5DB] bg-white text-[#374151] hover:bg-gray-50 dark:border-[#4B5563] dark:bg-[#1E293B] dark:text-[#E5E7EB]'
                            }`}
                          >
                            <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-xs border text-[10px] ${
                              columnSortDraft === option.direction
                                ? 'border-[#2F80ED] bg-[#2F80ED] text-white font-bold'
                                : 'border-[#9CA3AF] bg-white dark:bg-[#334155]'
                            }`}>
                              {columnSortDraft === option.direction ? '✓' : ''}
                            </span>
                            {option.label}
                          </button>
                        ))}
                        <div className="mx-1 h-5 w-px bg-[#D1D5DB] dark:bg-[#4B5563]" />
                        {[{ label: 'IS NOT NULL', value: 'not-null' as const }, { label: 'IS NULL', value: 'null' as const }].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setColumnNullDraft((current) => current === option.value ? null : option.value)}
                            className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                              columnNullDraft === option.value
                                ? 'border-[#2F80ED] bg-[#EFF6FF] text-[#1E40AF] dark:border-[#3B82F6] dark:bg-[#1E293B] dark:text-[#93C5FD]'
                                : 'border-[#D1D5DB] bg-white text-[#374151] hover:bg-gray-50 dark:border-[#4B5563] dark:bg-[#1E293B] dark:text-[#E5E7EB]'
                            }`}
                          >
                            <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-xs border text-[10px] ${
                              columnNullDraft === option.value
                                ? 'border-[#2F80ED] bg-[#2F80ED] text-white font-bold'
                                : 'border-[#9CA3AF] bg-white dark:bg-[#334155]'
                            }`}>
                              {columnNullDraft === option.value ? '✓' : ''}
                            </span>
                            {option.label}
                          </button>
                        ))}
                      </div>

                      {/* Middle search input section */}
                      <div className="p-4">
                        <label className="block text-xs font-normal text-[#6B7280] dark:text-[#9CA3AF]">
                          Search {column}
                          <input
                            autoFocus
                            value={columnFilterDraft}
                            onChange={(event) => {
                              setColumnFilterDraft(event.target.value);
                              if (event.target.value) setColumnNullDraft(null);
                            }}
                            onKeyDown={(event) => event.key === 'Enter' && applyApplicantColumnFilter(column)}
                            placeholder={column}
                            className="mt-1.5 block w-full rounded border border-[#2F80ED] bg-white px-3 py-1.5 text-xs text-[#1F2937] outline-none shadow-xs dark:bg-[#334155] dark:text-white"
                          />
                        </label>
                      </div>

                      {/* Bottom action buttons */}
                      <div className="flex items-center gap-2 border-t border-[#E5E7EB] bg-white px-4 py-2.5 rounded-b-lg dark:border-[#334155] dark:bg-[#1E293B]">
                        <button
                          type="button"
                          onClick={() => applyApplicantColumnFilter(column)}
                          className="rounded bg-[#2F80ED] px-5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1D6FD8] transition-colors"
                        >
                          Search
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const next = filterRules.filter((rule) => rule.field !== field);
                            setFilterRules(next);
                            localStorage.setItem('ats_applicant_filter_rules', JSON.stringify(next));
                            setColumnFilterDraft('');
                            setColumnNullDraft(null);
                            setColumnSortDraft(null);
                            if (sortConfig?.field === field) setSortConfig(null);
                          }}
                          className="rounded border border-[#D1D5DB] bg-white px-4 py-1.5 text-xs font-medium text-[#6B7280] hover:bg-gray-50 transition-colors dark:border-[#4B5563] dark:bg-[#334155] dark:text-[#E5E7EB]"
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          onClick={() => setColumnFilterOpen(null)}
                          className="px-2 py-1.5 text-xs font-medium text-[#2F80ED] hover:underline transition-colors dark:text-[#60A5FA]"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </th>
            );
          })}
          <th className="sticky top-0 z-20 bg-[#FFFFFF] px-3 py-3 text-right shadow-[inset_0_-1px_0_#D8E3F1] dark:bg-[#1E293B] dark:shadow-[inset_0_-1px_0_#334155] dark:text-slate-200">Actions</th>
        </tr></thead>
        <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#334155]">
          {filteredApplicants.length === 0 ? <tr><td colSpan={4 + visibleColumns.length} className="p-10 text-center text-xs text-[#64748B]">No applicants match these filters. Try a different search or clear filters.</td></tr> : visibleApplicants.map((a) => {
            const missingDetails = getMissingApplicantDetails(a);
            const rowSubmissions = getSubmissionsForApplicant(a);
            const associatedJobTitle = a.assignedJobTitle || rowSubmissions[0]?.jobTitle || '';
            const storedSubmissionCount = Number(a.submissionCount ?? a.submissionsCount ?? 0) || 0;
            const submissionCount = Math.max(rowSubmissions.length, storedSubmissionCount);
            const pipelineCount = Number(a.pipelineCount ?? a.pipelineEntriesCount ?? ((a.assignedJobId || a.assignedJobTitle) ? 1 : 0));
            const hasSubmission = submissionCount > 0;
            const indicatorCount = hasSubmission ? submissionCount : pipelineCount;
            const indicatorType = hasSubmission ? 'submission' : 'pipeline';
            const indicatorLabel = indicatorType === 'submission' ? 'submission' : 'pipeline job';
            const isExpanded = expandedApplicantId === a.id;
            return (<React.Fragment key={a.id}><tr title={missingDetails.length ? `Missing Information\n${missingDetails.join('\n')}` : undefined} aria-label={missingDetails.length ? `${a.name}: missing ${missingDetails.join(', ')}` : a.name} className="transition-colors odd:bg-white even:bg-[#F5F7F8] hover:bg-[#EDF5FA] dark:odd:bg-[#2563EB] dark:even:bg-[#1D2D3B] dark:hover:bg-[#475569]">
            <td
              className="relative px-3 py-3 text-center"
              style={missingDetails.length ? { borderLeft: '3px solid #ef4444', boxShadow: 'inset 3px 0 0 #ef4444' } : undefined}
            >
              {missingDetails.length > 0 && <button
                type="button"
                title="Show missing information"
                aria-label={`Show missing information for ${a.name}: ${missingDetails.join(', ')}`}
                aria-expanded={openMissingInfoId === a.id}
                onClick={() => setOpenMissingInfoId((openId) => openId === a.id ? null : a.id)}
                style={{ backgroundColor: '#ef4444' }}
                className="group absolute inset-y-0 left-0 z-20 w-[3px] cursor-help p-0"
              >
                <span role="tooltip" className={`pointer-events-none absolute left-full top-1/2 z-50 ml-2 w-56 -translate-y-1/2 rounded-md border border-[#D5D5D5] bg-white p-2.5 text-left text-[11px] leading-5 text-[#444] shadow-lg ${openMissingInfoId === a.id ? 'block' : 'hidden group-hover:block group-focus:block'}`}>
                  <strong className="mb-1 block font-medium text-[#555]">Missing Information</strong>
                  {missingDetails.map((detail) => <span key={detail} className="block">{detail}</span>)}
                </span>
              </button>}
              <input type="checkbox" aria-label={`Select ${a.name}`} checked={selected.includes(a.id)} onChange={() => toggleSelected(a.id)} />
            </td>
            <td className="px-2 py-3 text-center"><button aria-label={`${a.isFavorite ? 'Remove' : 'Add'} ${a.name} ${a.isFavorite ? 'from' : 'to'} favorites`} onClick={(e) => handleToggleFavorite(a.id, e)} className={a.isFavorite ? 'text-[#1E293B]' : 'text-[#94A0AE] hover:text-[#1E293B]'}><Star className={`h-4 w-4 ${a.isFavorite ? 'fill-current' : ''}`} /></button></td>
            <td className="px-2 py-3 text-center"><div className="inline-flex items-center gap-1">
              {indicatorCount > 0 && <button type="button" aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${a.name} ${indicatorLabel} details${associatedJobTitle ? ` for ${associatedJobTitle}` : ''}`} aria-expanded={isExpanded} title={associatedJobTitle ? `Associated job: ${associatedJobTitle}` : `Show ${indicatorLabel} details`} onClick={() => setExpandedApplicantId(isExpanded ? null : a.id)} className="inline-flex h-4 w-4 items-center justify-center rounded-sm text-[#2563EB] hover:bg-[#DBEAFE]">{isExpanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}</button>}
              {indicatorCount > 0 && <span aria-label={`${indicatorCount} ${indicatorLabel}${indicatorCount === 1 ? '' : 's'} for ${a.name}`} title={`${indicatorCount} ${indicatorLabel}${indicatorCount === 1 ? '' : 's'}`} className={`rounded px-1 py-0.5 text-[9px] font-bold text-white ${indicatorType === 'submission' ? 'bg-[#2563EB]' : 'bg-[#A855C7]'}`}>+{indicatorCount}</span>}
              {Boolean((a.notes && a.notes.length > 0) || a.applicantRemarks || a.customFields?.notes) && <button type="button" title={`View applicant notes (${(a.notes?.length || 0) + (a.applicantRemarks ? 1 : 0)})`} aria-label={`View ${a.name} notes`} onClick={() => { setNotesDrawerApplicant(a); setNotesHistoryOpen(true); }} className="inline-flex items-center text-[#E69A19] hover:text-[#C57C0A]"><FileText className="h-4 w-4" /></button>}
            </div></td>
            {visibleColumns.map((column) => <td key={column} className="whitespace-nowrap px-3 py-3 text-[#334155] dark:text-[#FFFFFF]">{renderApplicantColumn(column, a)}</td>)}
            <td className="px-3 py-3"><div className="flex items-center justify-end gap-1"><button onClick={() => setQuickResumePreview(a)} title="Quick resume preview" className="rounded-md p-1.5 text-[#64748B] hover:bg-[#FFFFFF] hover:text-[#1E293B]"><Eye className="h-4 w-4" /></button><button onClick={() => navigate('applicant-detail', a.id)} className="rounded-md px-2 py-1.5 font-semibold text-[#1E293B] hover:bg-[#FFFFFF] dark:hover:bg-[#475569]">Open dossier</button></div></td>
          </tr>
          {isExpanded && <tr className="bg-white dark:bg-[#1E293B]"><td colSpan={4 + visibleColumns.length} className="px-5 py-3">
            <div className="overflow-hidden rounded-md border border-[#D8E3F1] dark:border-[#334155]">
              <div className="flex flex-wrap items-center gap-3 border-b border-[#E2E8F0] px-4 py-2.5 dark:border-[#334155]">
                <span className="rounded-full bg-[#3B82F6] px-3 py-1 text-xs font-semibold text-white">{hasSubmission ? 'Submissions' : 'Pipeline'} <span className="ml-1 rounded-full bg-white/20 px-1.5">{indicatorCount}</span></span>
                {associatedJobTitle && <span className="text-xs text-[#475569] dark:text-slate-200">{associatedJobTitle}</span>}
                <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#2563EB]">{['Submission Score', 'Source', 'Application Status', 'Submitted By', 'Submitted On', 'Client'].map((filterName) => <button key={filterName} type="button" className="hover:underline">{filterName}⌄</button>)}</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1120px] border-collapse text-left text-[11px]">
                  <thead className="bg-[#E6F1F5] text-[#1E293B] dark:bg-slate-700 dark:text-white"><tr className="border-b border-[#D8E3F1] dark:border-slate-600">{['Job Code', 'Job Title', 'Submission Record', 'Submission Score', 'Recruitment Manager', 'Profile Status', 'Client', 'Source', 'Client Bill Rate / Salary', 'Pay Rate', 'Submitted By', 'Submitted On'].map((heading) => <th key={heading} className="whitespace-nowrap px-3 py-2 font-semibold">{heading}</th>)}</tr></thead>
                  <tbody>{rowSubmissions.length ? rowSubmissions.map((submission) => <tr key={submission.id} className="border-b border-[#E5E7EB] last:border-0 dark:border-slate-700"><td className="px-3 py-2.5 text-[#2563EB]">{submission.submissionId}</td><td className="px-3 py-2.5 text-[#2563EB]">{submission.jobTitle}</td><td className="px-3 py-2.5 text-[#2563EB]">View submission</td><td className="px-3 py-2.5">{submission.score ?? '—'}</td><td className="px-3 py-2.5">{submission.recruiter || '—'}</td><td className="px-3 py-2.5">{submission.status}</td><td className="px-3 py-2.5">{submission.client || '—'}</td><td className="px-3 py-2.5">{a.source || '—'}</td><td className="px-3 py-2.5">{submission.billRate || '—'}</td><td className="px-3 py-2.5">{submission.payRate || '—'}</td><td className="px-3 py-2.5">{submission.recruiter || '—'}</td><td className="whitespace-nowrap px-3 py-2.5">{submission.submittedDate || '—'}</td></tr>) : <tr><td colSpan={12} className="px-3 py-4 text-[#64748B] dark:text-slate-300">{hasSubmission ? 'Submission details are not available.' : 'This candidate is in the pipeline but has no submission record yet.'}</td></tr>}</tbody>
                </table>
              </div>
            </div>
          </td></tr>}
          </React.Fragment>);
          })}
        </tbody>
      </table></div>
      <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-center gap-2 rounded-b-xl border-t border-[#D8E3F1] bg-white px-4 py-2.5 text-[11px] text-[#334155] shadow-[0_-2px_6px_rgba(0,0,0,0.04)] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#FFFFFF]"><span className="mr-2 font-semibold">{pageStart} - {pageEnd} of {filteredApplicants.length}</span><button aria-label="First page" title="First page" disabled={currentPage <= 1} onClick={() => setCurrentPage(1)} className="rounded p-1 text-[#64748B] hover:bg-[#FFFFFF] disabled:opacity-40"><ChevronsLeft className="h-4 w-4" /></button><button aria-label="Previous page" title="Previous page" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="rounded p-1 text-[#64748B] hover:bg-[#FFFFFF] disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span className="rounded bg-[#2563EB] px-2.5 py-1 font-semibold text-white">{currentPage}</span><button aria-label="Next page" title="Next page" disabled={currentPage >= pageCount} onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))} className="rounded p-1 text-[#64748B] hover:bg-[#FFFFFF] disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button><button aria-label="Last page" title="Last page" disabled={currentPage >= pageCount} onClick={() => setCurrentPage(pageCount)} className="rounded p-1 text-[#64748B] hover:bg-[#FFFFFF] disabled:opacity-40"><ChevronsRight className="h-4 w-4" /></button><label className="ml-3 flex items-center gap-2 text-[10px] text-[#64748B]">Per Page<select aria-label="Rows per page" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="rounded border border-[#D8E3F1] bg-white px-1.5 py-1 text-[#334155] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select></label></div>
    </div>

    {ticketPanelOpen && ticketView === 'dashboard' && <div className="fixed inset-0 z-[58] flex flex-col bg-[#F5F5F5] text-[#222] dark:bg-[#0F172A] dark:text-[#E2E8F0]">
      <header className="flex h-[58px] shrink-0 items-center justify-between bg-[#2563EB] px-5 text-white"><div className="text-xl font-semibold tracking-tight">NexusTalent</div><div className="flex items-center gap-5"><label className="flex w-64 items-center gap-2 rounded-full bg-white px-3 py-2 text-[#64748B] dark:bg-[#1E293B] dark:text-slate-300"><Search className="h-4 w-4" /><input value={ticketDashboardSearch} onChange={(e) => setTicketDashboardSearch(e.target.value)} placeholder="Search" className="min-w-0 flex-1 bg-transparent text-xs outline-none dark:text-white" /></label><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-medium text-[#1E293B] dark:bg-[#1E293B] dark:text-white">{(currentUser?.name || 'G').slice(0, 1).toUpperCase()}</span><button aria-label="Close tickets dashboard" onClick={() => { setTicketPanelOpen(false); setTicketView('new'); }} className="rounded p-1 hover:bg-white/15"><X className="h-5 w-5" /></button></div></header>
      <div className="flex min-h-0 flex-1"><nav className="flex w-[112px] shrink-0 flex-col gap-2 border-r border-[#D9DDE2] bg-white px-2 py-3 dark:border-[#334155] dark:bg-[#1E293B]">{[{ label: 'Dashboard', icon: <LayoutGrid className="h-5 w-5" /> }, { label: 'Tickets', icon: <Ticket className="h-5 w-5" /> }, { label: 'Projects', icon: <FolderPlus className="h-5 w-5" /> }, { label: 'Tasks', icon: <ListFilter className="h-5 w-5" /> }].map((item) => <button key={item.label} onClick={() => setTicketDashboardTab(item.label)} className={`flex flex-col items-center gap-1 rounded px-2 py-3 text-xs ${ticketDashboardTab === item.label ? 'text-[#1E293B] dark:text-white font-semibold' : 'text-[#333] hover:bg-[#F4F7FA] dark:text-slate-400 dark:hover:bg-[#334155] dark:hover:text-white'}`}>{item.icon}{item.label}</button>)}</nav>
        <main className="min-w-0 flex-1 overflow-y-auto p-5 md:p-7"><h1 className="mb-3 text-sm font-semibold text-[#1E293B] dark:text-white">My {ticketDashboardTab}</h1>{ticketDashboardTab === 'Dashboard' ? <><div className="grid gap-4 xl:grid-cols-2"><section className="rounded-lg bg-white p-5 shadow-sm dark:border-[#334155] dark:bg-[#1E293B]"><h2 className="mb-5 text-sm font-medium dark:text-white">Tickets</h2><div className="grid gap-4 sm:grid-cols-2">{[{ label: 'Unresolved', count: reportedTickets.filter((ticket) => ticket.status?.toLowerCase() !== 'resolved').length, tone: 'bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400' }, { label: 'Reported', count: reportedTickets.length, tone: 'bg-sky-50 text-sky-500 dark:bg-sky-950/40 dark:text-sky-400' }, { label: 'Resolved', count: reportedTickets.filter((ticket) => ticket.status?.toLowerCase() === 'resolved').length, tone: 'bg-violet-50 text-violet-500 dark:bg-violet-950/40 dark:text-violet-400' }, { label: 'Response SLA', count: reportedTickets.length ? '—' : 0, tone: 'bg-orange-50 text-orange-500 dark:bg-orange-950/40 dark:text-orange-400' }].map((item) => <button key={item.label} onClick={() => setTicketDashboardTab('Tickets')} className="rounded-lg border border-[#DADDE1] p-4 text-left hover:border-[#64748B] dark:border-[#334155] dark:bg-[#0F172A] dark:hover:border-slate-500"><div className="flex items-center justify-between text-xs text-[#5E6570] dark:text-slate-400">{item.label}<span className={`rounded-md p-2 ${item.tone}`}><Ticket className="h-4 w-4" /></span></div><div className="mt-1 text-xl font-semibold text-black dark:text-white">{item.count}</div><div className="mt-2 text-xs text-[#ADB4BC] dark:text-slate-400">Analytics for last month</div></button>)}</div></section><section className="rounded-lg bg-white p-5 shadow-sm dark:border-[#334155] dark:bg-[#1E293B]"><h2 className="mb-5 text-sm font-medium dark:text-white">Tasks &amp; Projects</h2><div className="grid gap-4 sm:grid-cols-2">{[{ label: 'All Tasks', count: 0 }, { label: 'Pending Tasks', count: 0 }, { label: 'Completed Tasks', count: 0 }, { label: 'All Projects', count: 0 }].map((item, index) => <button key={item.label} onClick={() => setTicketDashboardTab(index === 3 ? 'Projects' : 'Tasks')} className="rounded-lg border border-[#DADDE1] p-4 text-left hover:border-[#64748B] dark:border-[#334155] dark:bg-[#0F172A] dark:hover:border-slate-500"><div className="flex items-center justify-between text-xs text-[#5E6570] dark:text-slate-400">{item.label}<span className={`rounded-md p-2 ${['bg-sky-50 text-sky-500 dark:bg-sky-950/40 dark:text-sky-400', 'bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400', 'bg-green-50 text-green-500 dark:bg-green-950/40 dark:text-green-400', 'bg-violet-50 text-violet-500 dark:bg-violet-950/40 dark:text-violet-400'][index]}`}><ListFilter className="h-4 w-4" /></span></div><div className="mt-1 text-xl font-semibold text-black dark:text-white">{item.count}</div><div className="mt-2 text-xs text-[#ADB4BC] dark:text-slate-400">Analytics for last month</div></button>)}</div></section></div><section className="mt-5 rounded-lg bg-white p-5 shadow-sm dark:border-[#334155] dark:bg-[#1E293B]"><div className="flex items-start justify-between"><div><h2 className="text-lg font-medium dark:text-white">Today’s Trends</h2><p className="text-xs text-[#64748B] dark:text-slate-400">{new Date().toLocaleDateString()}</p></div><div className="space-y-4 text-xs dark:text-slate-300">{[['Overdue', '0'], ['Average response', '—'], ['Resolution within SLA', '—'], ['Received', String(reportedTickets.length)]].map(([label, value]) => <p key={label}><span className="block text-[10px] text-slate-400">{label}</span>{value}</p>)}</div></div><div className="mt-4 grid h-[190px] grid-cols-5 items-end gap-4 border-b border-l border-[#DCE4EF] px-5 dark:border-[#334155]"><div className="flex h-full items-end justify-center gap-1 border-r border-[#E8EDF3] pb-0 dark:border-[#334155]"><div className="w-10 bg-[#9843B3]" style={{ height: `${Math.max(10, Math.min(100, reportedTickets.length * 20))}%` }} /><div className="w-10 bg-[#76D3C2]" style={{ height: `${Math.max(10, Math.min(100, reportedTickets.filter((ticket) => ticket.status?.toLowerCase() !== 'resolved').length * 20))}%` }} /></div>{['Last Week', '01 Nov - 07 Nov', '25 Oct - 31 Oct', '18 Oct - 24 Oct'].map((label) => <div key={label} className="flex h-full items-end justify-center border-r border-[#E8EDF3] pb-2 text-[10px] text-[#64748B] dark:border-[#334155] dark:text-slate-400">{label}</div>)}</div><div className="mt-2 flex justify-center gap-4 text-[10px] text-[#64748B] dark:text-slate-400"><span className="text-[#9843B3]">■ All Tickets</span><span className="text-[#76D3C2]">■ Pending</span><span className="text-[#50B87D]">■ Resolved</span></div></section></> : ticketDashboardTab === 'Tickets' ? <section className="rounded-lg bg-white p-5 shadow-sm dark:border-[#334155] dark:bg-[#1E293B]"><div className="mb-4 flex items-center justify-between"><h2 className="font-medium dark:text-white">Reported Tickets</h2><button onClick={() => setTicketView('new')} className="rounded bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white">Raise a New Ticket</button></div><div className="space-y-3">{reportedTickets.filter((ticket) => `${ticket.id} ${ticket.title || ''} ${ticket.type} ${ticket.description}`.toLowerCase().includes(ticketDashboardSearch.toLowerCase())).map((ticket) => <article key={ticket.id} className="rounded border border-[#DADDE1] p-4 dark:border-[#334155] dark:bg-[#0F172A]"><div className="flex justify-between"><div><h3 className="text-sm font-medium dark:text-white">{ticket.title || ticket.type}</h3><p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">{ticket.id} · {new Date(ticket.createdAt).toLocaleString()}</p></div><span className="text-xs dark:text-slate-300">{ticket.status || 'Unresolved'}</span></div><p className="mt-3 whitespace-pre-wrap text-xs text-[#475569] dark:text-slate-300">{ticket.description || 'No description provided.'}</p></article>)}</div>{reportedTickets.length === 0 && <p className="py-10 text-center text-sm text-[#64748B] dark:text-slate-400">No tickets have been reported.</p>}</section> : <section className="rounded-lg bg-white p-8 text-center shadow-sm dark:border-[#334155] dark:bg-[#1E293B]"><h2 className="font-medium dark:text-white">No {ticketDashboardTab.toLowerCase()} yet</h2><p className="mt-2 text-sm text-[#64748B] dark:text-slate-400">{ticketDashboardTab} created for applicant support will appear here.</p></section>}</main>
      </div>
    </div>}
    {ticketPanelOpen && ticketView !== 'dashboard' && <aside aria-label="Create support ticket" className="drawer-panel fixed bottom-0 right-0 top-[56px] z-[54] flex w-[min(760px,100vw)] flex-col border-l border-[#D8E3F1] bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
      <div className="relative flex min-h-[82px] flex-col justify-center border-b border-[#F1F5F9] px-5 py-3 dark:border-[#334155]"><button onClick={() => setTicketView('dashboard')} className="mb-1 w-fit text-xs text-[#1E293B] hover:underline dark:text-blue-400">Reported Tickets ({reportedTickets.length})</button><div className="flex items-center gap-2 text-lg text-[#343434] dark:text-white"><Ticket className="h-5 w-5" /><h2 className="font-medium">{ticketView === 'new' ? 'Raise a New Ticket' : 'Reported Tickets'}</h2></div><button aria-label="Close ticket panel" onClick={() => setTicketPanelOpen(false)} className="absolute right-3 top-3 rounded p-1.5 text-[#888] hover:bg-[#F1F3F5] dark:hover:bg-[#334155] dark:hover:text-white"><X className="h-5 w-5" /></button></div>
      {ticketView === 'new' ? <form onSubmit={(event) => { event.preventDefault(); if (!ticketType) return; const record = { id: `T-${Date.now()}`, type: ticketType, title: ticketTitle.trim(), priority: ticketPriority, status: 'Unresolved', description: ticketDescription.trim(), attachments: ticketAttachments, otpAllowed: ticketOtpAllowed, createdAt: new Date().toISOString() }; const next = [record, ...reportedTickets]; setReportedTickets(next); localStorage.setItem('ats_applicant_tickets', JSON.stringify(next)); setTicketType(''); setTicketTitle(''); setTicketPriority('Low'); setTicketDescription(''); setTicketAttachments([]); setTicketOtpAllowed(false); setTicketView('reported'); showToast('Ticket submitted.'); }} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4"><label className="block space-y-1.5 text-xs text-[#777] dark:text-slate-300">Request Type <span className="text-red-500">*</span><select required value={ticketType} onChange={(e) => setTicketType(e.target.value)} className="w-full border border-[#D8E3F1] bg-white px-2 py-2 text-xs text-[#333] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"><option value="">Select Request Type</option><option>Account Access — Password Reset</option><option>Training &amp; Guidance — Request</option><option>General Enquiry</option></select></label>
          <label className="block space-y-1.5 text-xs text-[#777] dark:text-slate-300">Ticket Title<input value={ticketTitle} onChange={(e) => setTicketTitle(e.target.value)} placeholder="Enter ticket title" className="w-full border border-[#D8E3F1] bg-white px-2 py-2 text-xs text-[#333] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white" /></label>
          <label className="block space-y-1.5 text-xs text-[#777] dark:text-slate-300">Priority<select value={ticketPriority} onChange={(e) => setTicketPriority(e.target.value)} className="w-full border border-[#D8E3F1] bg-white px-2 py-2 text-xs text-[#333] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select></label>
          <div><label className="mb-1.5 block text-xs text-[#777] dark:text-slate-300">Ticket Description</label><div className="border border-[#D8E3F1] dark:border-[#334155]"><div className="flex h-9 items-center gap-1 border-b border-[#D8E3F1] px-2 dark:border-[#334155] dark:bg-[#0F172A]">{[{ label: 'Bold', icon: <Bold className="h-3.5 w-3.5" />, command: 'bold' }, { label: 'Italic', icon: <Italic className="h-3.5 w-3.5" />, command: 'italic' }, { label: 'Underline', icon: <Underline className="h-3.5 w-3.5" />, command: 'underline' }, { label: 'Bulleted list', icon: <List className="h-3.5 w-3.5" />, command: 'insertUnorderedList' }, { label: 'Numbered list', icon: <ListOrdered className="h-3.5 w-3.5" />, command: 'insertOrderedList' }].map((tool) => <button key={tool.label} type="button" title={tool.label} aria-label={tool.label} onMouseDown={(event) => event.preventDefault()} onClick={() => document.execCommand(tool.command)} className="rounded p-1.5 text-[#5E6570] hover:bg-[#FFFFFF] dark:text-slate-300 dark:hover:bg-[#334155]">{tool.icon}</button>)}</div><div contentEditable suppressContentEditableWarning onInput={(event) => setTicketDescription(event.currentTarget.innerText)} className="min-h-[200px] p-3 text-sm text-[#333] outline-none dark:bg-[#0F172A] dark:text-white" /></div></div>
          <label className="flex items-center gap-2 text-xs text-[#555] dark:text-slate-300"><input type="checkbox" checked={ticketOtpAllowed} onChange={(e) => setTicketOtpAllowed(e.target.checked)} /> Allow support to access your account via OTP <button type="button" title="This allows support staff to verify access using a one-time password." className="text-[#1E293B] dark:text-blue-400"><CircleHelp className="h-4 w-4" /></button></label>
          <label className="block space-y-1.5 text-xs text-[#777] dark:text-slate-300">Attachment<input type="file" multiple onChange={(event) => setTicketAttachments(Array.from(event.target.files || []).map((file) => file.name))} className="block w-full text-xs text-[#444] file:mr-2 file:border file:border-[#D8E3F1] file:bg-[#F7F7F7] file:px-2 file:py-1.5 dark:text-slate-300 dark:file:border-[#334155] dark:file:bg-[#0F172A] dark:file:text-white" />{ticketAttachments.length > 0 && <span className="block text-[10px] text-[#64748B] dark:text-slate-400">{ticketAttachments.join(', ')}</span>}</label>
        </div><div className="flex items-center gap-2 border-t border-[#F1F5F9] px-5 py-3 dark:border-[#334155]"><button type="submit" disabled={!ticketType} className="rounded bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Proceed</button><button type="button" onClick={() => setTicketPanelOpen(false)} className="px-2 py-2 text-xs text-[#64748B] hover:text-[#202B37] dark:text-slate-400 dark:hover:text-white">Cancel</button></div>
      </form> : <div className="flex-1 overflow-y-auto p-5">{reportedTickets.length === 0 ? <p className="py-12 text-center text-sm text-[#64748B] dark:text-slate-400">No reported tickets yet.</p> : <div className="space-y-3">{reportedTickets.map((ticket) => <article key={ticket.id} className="rounded-md border border-[#E0E5EA] p-4 dark:border-[#334155] dark:bg-[#0F172A]"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-[#343434] dark:text-white">{ticket.title || ticket.type}</p><p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">{ticket.id} · {new Date(ticket.createdAt).toLocaleString()}</p></div><span className="rounded bg-[#F1F4F7] px-2 py-1 text-[10px] text-[#536577] dark:bg-[#334155] dark:text-slate-200">{ticket.priority}</span></div><p className="mt-3 whitespace-pre-wrap text-xs text-[#475569] dark:text-[#D8E9F7]">{ticket.description || 'No description provided.'}</p>{(ticket.attachments || []).length > 0 && <p className="mt-2 text-[10px] text-[#64748B] dark:text-slate-400">Attachments: {(ticket.attachments || []).join(', ')}</p>}</article>)}</div>}<button onClick={() => setTicketView('new')} className="mt-4 rounded bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white">Raise a New Ticket</button></div>}
    </aside>}
    {chatOpen && <aside aria-label="TextToHire messages" className="drawer-panel fixed bottom-0 right-0 top-[56px] z-[54] flex w-[min(760px,100vw)] flex-col border-l border-[#D8E3F1] bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
      <div className="flex min-h-[58px] items-center justify-between border-b border-[#F1F5F9] px-4 py-2 dark:border-[#334155]"><div className="flex items-center gap-2 text-[#202B37] dark:text-white"><span className="relative text-[#1E293B] dark:text-blue-400"><MessageCircle className="h-6 w-6 fill-current" /><span className="absolute -right-0.5 -top-1 h-2 w-2 rounded-full bg-[#2563EB]" /></span><span className="text-lg font-bold tracking-tight">Text<span className="text-[#1E293B] dark:text-blue-400">ToHire</span></span></div><div data-applicant-dropdown="fetch-contacts" className="relative mr-10"><button onClick={() => setFetchContactsOpen((open) => !open)} className="rounded border border-[#2563EB] px-3 py-1.5 text-xs text-[#1E293B] hover:bg-[#EFF6FF] dark:text-blue-400 dark:hover:bg-[#334155]">Fetch Contacts <ChevronDown className="ml-1 inline h-3.5 w-3.5" /></button>{fetchContactsOpen && <div className="absolute right-0 top-full z-10 mt-1 w-72 rounded-md border border-[#D8E3F1] bg-white p-2 shadow-lg dark:border-[#334155] dark:bg-[#1E293B]">{applicants.filter((a) => a.phone?.trim() && !chatContacts.includes(a.id)).slice(0, 10).length === 0 ? <p className="px-2 py-3 text-xs text-[#334155] dark:text-white">No contacts to fetch</p> : <div className="max-h-64 overflow-y-auto">{applicants.filter((a) => a.phone?.trim() && !chatContacts.includes(a.id)).slice(0, 10).map((applicant) => <button key={applicant.id} onClick={() => { const ids = [...chatContacts, applicant.id]; setChatContacts(ids); localStorage.setItem('ats_text_to_hire_contacts', JSON.stringify(ids)); if (!chatContactId) setChatContactId(applicant.id); }} className="flex w-full items-center justify-between gap-2 rounded px-2 py-2 text-left text-xs hover:bg-[#F1F6FB] dark:hover:bg-[#334155]"><span className="min-w-0"><span className="block truncate font-medium text-slate-800 dark:text-white">{applicant.name}</span><span className="text-[10px] text-[#64748B] dark:text-slate-400">{applicant.phone}</span></span><Plus className="h-4 w-4 shrink-0 text-[#1E293B] dark:text-white" /></button>)}</div>}</div>}</div><button aria-label="Close TextToHire" onClick={() => setChatOpen(false)} className="absolute right-2 top-2 rounded p-1.5 text-[#64748B] hover:bg-[#FFFFFF] dark:text-slate-400 dark:hover:bg-[#334155] dark:hover:text-white"><X className="h-5 w-5" /></button></div>
      <div className="flex min-h-0 flex-1">
        <section className="flex w-[280px] shrink-0 flex-col border-r border-[#F1F5F9] dark:border-[#334155]"><div className="flex border-b border-[#F1F5F9] text-xs dark:border-[#334155]"><button onClick={() => setChatTab('all')} className={`px-3 py-3 ${chatTab === 'all' ? 'border-b-2 border-[#2563EB] text-[#1E293B] dark:text-white font-semibold' : 'text-[#64748B] dark:text-slate-400'}`}>All Messages</button><button onClick={() => setChatTab('favourites')} className={`px-3 py-3 ${chatTab === 'favourites' ? 'border-b-2 border-[#2563EB] text-[#1E293B] dark:text-white font-semibold' : 'text-[#64748B] dark:text-slate-400'}`}>Favourite</button></div><div className="flex-1 overflow-y-auto">{applicants.filter((a) => chatContacts.includes(a.id) && (chatTab === 'all' || a.isFavorite)).map((applicant) => <button key={applicant.id} onClick={() => setChatContactId(applicant.id)} className={`flex w-full items-center gap-2 border-b border-[#F0F2F4] px-3 py-3 text-left hover:bg-[#FFFFFF] dark:border-[#334155] dark:hover:bg-[#334155] ${chatContactId === applicant.id ? 'bg-[#F0F6FF] dark:bg-[#334155]' : ''}`}><img src={applicant.avatar} alt="" className="h-8 w-8 rounded-full object-cover" /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium text-[#334155] dark:text-white">{applicant.name}</span><span className="block truncate text-[10px] text-[#64748B] dark:text-slate-400">{applicant.phone}</span></span></button>)}{chatContacts.filter((id) => applicants.some((a) => a.id === id && (chatTab === 'all' || a.isFavorite))).length === 0 && <p className="p-4 text-center text-xs text-[#64748B] dark:text-slate-400">No contacts. Select Fetch Contacts to add applicants.</p>}</div><div className="relative border-t border-[#F1F5F9] bg-[#F2F2F2] p-3 dark:border-[#334155] dark:bg-[#1E293B]"><button onClick={() => setBestPracticesOpen((open) => !open)} className="flex items-center gap-2 text-xs text-[#1E293B] dark:text-slate-200"><span aria-hidden="true">♙</span> Best Practices</button>{bestPracticesOpen && <div className="absolute bottom-full left-2 z-10 mb-2 w-64 rounded-md border border-[#D8E3F1] bg-white p-3 text-[11px] leading-relaxed text-[#475569] shadow-lg dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#D8E9F7]">Keep applicant messages concise, professional, and focused on the role or next step.</div>}</div></section>
        <section className="flex min-w-0 flex-1 flex-col"><div className="flex-1 overflow-y-auto p-5">{!chatContactId || !chatContacts.includes(chatContactId) ? <p className="mt-[30vh] text-center text-xs italic text-[#8994A3] dark:text-slate-400">Please select any contact from left panel to see the messages here</p> : <div className="space-y-3">{chatMessages.filter((message) => message.contactId === chatContactId).length === 0 ? <p className="mt-[25vh] text-center text-xs italic text-[#8994A3] dark:text-slate-400">No messages yet. Start a conversation.</p> : chatMessages.filter((message) => message.contactId === chatContactId).map((message) => <div key={message.id} className="ml-auto max-w-[80%] rounded-xl rounded-br-sm bg-[#2563EB] px-3 py-2 text-xs text-white">{message.text}</div>)}</div>}</div>{chatContactId && chatContacts.includes(chatContactId) && <form onSubmit={(event) => { event.preventDefault(); const text = chatInput.trim(); if (!text) return; const messages = [...chatMessages, { id: Date.now(), contactId: chatContactId, text }]; setChatMessages(messages); localStorage.setItem('ats_text_to_hire_messages', JSON.stringify(messages)); setChatInput(''); }} className="flex items-center gap-2 border-t border-[#F1F5F9] p-3 dark:border-[#334155]"><input aria-label="Type a message" value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Type a message..." className="min-w-0 flex-1 rounded-md border border-[#D8E3F1] px-3 py-2 text-xs outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white" /><button aria-label="Send message" type="submit" disabled={!chatInput.trim()} className="rounded-md bg-[#2563EB] p-2 text-white disabled:opacity-40"><Send className="h-4 w-4" /></button></form>}</section>
      </div>
    </aside>}
    {quickToolsOpen && <div className="fixed right-9 top-1/2 z-[56] flex -translate-y-1/2 flex-col gap-2 rounded-md border border-[#E1E7ED] bg-white p-1.5 shadow-xl dark:border-[#334155] dark:bg-[#1E293B]"><button aria-label="Open TextToHire" title="TextToHire" onClick={() => { setQuickToolsOpen(false); setTicketPanelOpen(false); setChatOpen(true); }} className="flex h-9 w-9 items-center justify-center rounded-md text-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#475569]"><MessageCircle className="h-5 w-5 fill-[#2563EB] text-[#1E293B]" /></button><button aria-label="Create support ticket" title="Create support ticket" onClick={() => { setQuickToolsOpen(false); setChatOpen(false); setTicketView('new'); setTicketPanelOpen(true); }} className="flex h-9 w-9 items-center justify-center rounded-md bg-[#2563EB] text-white hover:bg-[#1D4ED8]"><Ticket className="h-5 w-5" /></button></div>}
    <button aria-label={quickToolsOpen ? 'Close applicant shortcuts' : 'Open applicant shortcuts'} title="Applicant shortcuts" onClick={() => setQuickToolsOpen((open) => !open)} className="fixed right-0 top-1/2 z-[57] flex h-8 w-7 -translate-y-1/2 items-center justify-center rounded-l-md bg-[#2563EB] text-white shadow-lg hover:bg-[#1D4ED8]">{quickToolsOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}</button>

    {sidePanel && <div className="fixed inset-0 z-[65] bg-black/40" onClick={() => setSidePanel(null)}><aside onClick={(e) => e.stopPropagation()} className="drawer-panel absolute right-0 top-0 flex h-full w-full max-w-[410px] flex-col border-l border-[#D8E3F1] bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
      <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-4 dark:border-[#334155]"><div><h2 className="font-semibold text-[#1E293B] dark:text-white">{sidePanel === 'edit-filters' ? 'Edit Filters' : sidePanel === 'edit-columns' ? 'Edit Column' : 'Quick Filters'}</h2>{sidePanel !== 'edit-columns' && <p className="mt-1 text-[11px] text-[#64748B]">Filter fields update the applicant list and result count.</p>}</div><button onClick={() => setSidePanel(null)} aria-label="Close panel" className="rounded-md p-1.5 text-[#64748B] hover:bg-[#FFFFFF]"><X className="h-5 w-5" /></button></div>
      {sidePanel === 'edit-columns' ? <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <details open={columnsExpanded} onToggle={(event) => setColumnsExpanded(event.currentTarget.open)} className="group rounded-md border border-[#D8E3F1] dark:border-[#334155]"><summary className="cursor-pointer list-none px-3 py-2 text-xs text-[#334155] dark:text-[#FFFFFF]">{columnDraft.length} of {allApplicantColumns.length} selected<ChevronDown className="float-right h-4 w-4 text-[#64748B] transition-transform group-open:rotate-180" /></summary><div className="max-h-56 overflow-y-auto border-t border-[#F1F5F9] p-2 dark:border-[#334155]">{allApplicantColumns.map((column) => <label key={column} className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-[#334155] hover:bg-[#FFFFFF] dark:text-[#FFFFFF] dark:hover:bg-[#475569]"><input type="checkbox" checked={columnDraft.includes(column)} onChange={(e) => setColumnDraft((cols) => e.target.checked ? [...cols, column] : cols.filter((item) => item !== column))} />{column}</label>)}</div></details>
        <div><div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#475569]">Selected Columns</div><div className="space-y-1.5">{columnDraft.map((column, index) => <div key={column} draggable onDragStart={() => setDraggedColumn(column)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (!draggedColumn || draggedColumn === column) return; setColumnDraft((cols) => { const next = [...cols]; const from = next.indexOf(draggedColumn); const to = next.indexOf(column); if (from < 0 || to < 0) return cols; next.splice(to, 0, ...next.splice(from, 1)); return next; }); setDraggedColumn(null); }} onDragEnd={() => setDraggedColumn(null)} className={`flex cursor-grab items-center gap-2 rounded border border-[#EDF0F4] bg-[#F0F1F3] px-2 py-2 text-xs text-[#334155] active:cursor-grabbing dark:border-[#334155] dark:bg-[#475569] dark:text-white ${draggedColumn === column ? 'opacity-50' : ''}`}><GripVertical className="h-4 w-4 shrink-0 text-[#6682B2]" /><span className="flex-1">{column}</span><button aria-label={`Remove ${column}`} onClick={() => setColumnDraft((cols) => cols.filter((item) => item !== column))} className="px-1 text-[#8B929B] hover:text-[#D14D56]"><X className="h-4 w-4" /></button></div>)}{columnDraft.length === 0 && <p className="rounded bg-[#FFFFFF] p-3 text-[11px] text-[#64748B]">Choose at least one column to show.</p>}</div></div>
      </div> : sidePanel === 'edit-filters' ? <div className="flex-1 space-y-4 overflow-y-auto p-5">
        <label className="block space-y-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#1E293B] dark:text-[#FFFFFF]">Business Unit<select value={draftBusinessUnit} onChange={(e) => setDraftBusinessUnit(e.target.value)} className={`${fieldClass} rounded-none border-[#E2E8F0]`}><option value="All Business Units">All selected</option>{Array.from(new Set([currentUser?.businessUnit, 'Ampcus Tech Pvt Ltd.'].filter(Boolean))).map((unit) => <option key={unit}>{unit}</option>)}</select></label>
        <div><div className="mb-2 text-[10px] font-medium text-[#1E293B] dark:text-[#FFFFFF]">Pre-Defined Filters</div><label className="inline-flex items-center gap-2 rounded-md bg-[#E8EDFF] px-2 py-1.5 text-xs text-[#334155] dark:bg-[#475569] dark:text-white"><input type="checkbox" checked={draftGdprApproved} onChange={(e) => setDraftGdprApproved(e.target.checked)} /> GDPR Approved Consent</label></div>
        <div className="pt-6"><div className="mb-3 text-[10px] font-medium text-[#1E293B] dark:text-[#FFFFFF]">Field Level Filters</div><div className="space-y-2">{draftRules.map((rule) => <div key={rule.id} className="grid grid-cols-[1.15fr_1fr_22px] items-start gap-2"><select aria-label="Filter field" value={rule.field} onChange={(e) => setDraftRules((rows) => rows.map((r) => r.id === rule.id ? { ...r, field: e.target.value, operator: '', value: '' } : r))} className={`${fieldClass} rounded-sm border-[#E2E8F0] px-2`}><option value="">Select</option>{filterFields.map((field) => <option key={field}>{field}</option>)}</select><div className="space-y-2"><select aria-label="Filter operator" value={rule.operator} onChange={(e) => setDraftRules((rows) => rows.map((r) => r.id === rule.id ? { ...r, operator: e.target.value, value: '' } : r))} className={`${fieldClass} rounded-sm border-[#E2E8F0] px-2`}><option value="">Select</option>{filterOperators.map((operator) => <option key={operator}>{operator}</option>)}</select>{rule.operator && !['Is Null', 'Is Not Null'].includes(rule.operator) && (filterOptions(rule.field).length > 0 ? <select aria-label="Filter value" value={rule.value} onChange={(e) => setDraftRules((rows) => rows.map((r) => r.id === rule.id ? { ...r, value: e.target.value } : r))} className={`${fieldClass} rounded-sm border-[#E2E8F0] px-2`}><option value="">Select value</option>{filterOptions(rule.field).map((value) => <option key={value}>{value}</option>)}</select> : <input aria-label="Filter value" type={rule.field === 'Experience' || rule.field === 'Years of Experience' ? 'number' : 'text'} value={rule.value} onChange={(e) => setDraftRules((rows) => rows.map((r) => r.id === rule.id ? { ...r, value: e.target.value } : r))} placeholder="Value" className={`${fieldClass} rounded-sm border-[#E2E8F0] px-2`} />)}</div><button aria-label="Remove filter" onClick={() => setDraftRules((rows) => rows.filter((r) => r.id !== rule.id))} className="mt-2 text-[#F04444]"><X className="h-3.5 w-3.5" /></button></div>)}</div><button onClick={() => setDraftRules((rows) => [...rows, { id: `filter-${Date.now()}-${rows.length}`, field: '', operator: '', value: '' }])} className="mt-5 block w-full text-right text-xs font-medium text-[#1E293B]">Add Filter</button></div>
      </div> : <div className="flex-1 space-y-2 overflow-y-auto p-5"><p className="mb-3 text-xs text-[#64748B]">Turn on one or more common filters.</p>{[{ label: 'Favorites', description: 'Only starred applicants' }, { label: 'High Match', description: 'Match score 90% or higher' }, { label: 'Has Resume', description: 'Resume document is attached' }, { label: 'New Applicants', description: 'Applicants in New stage' }].map((item) => <label key={item.label} className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E1E7ED] p-3 hover:bg-[#FFFFFF] dark:border-[#334155] dark:hover:bg-[#475569]"><input type="checkbox" checked={draftQuickFilters.includes(item.label)} onChange={(e) => setDraftQuickFilters((rows) => e.target.checked ? [...rows, item.label] : rows.filter((x) => x !== item.label))} /><span><span className="block text-xs font-semibold text-[#334155] dark:text-white">{item.label}</span><span className="mt-1 block text-[10px] text-[#64748B]">{item.description}</span></span></label>)}</div>}
      {sidePanel === 'edit-columns' ? <div className="flex justify-end gap-2 border-t border-[#F1F5F9] px-5 py-3 dark:border-[#334155]"><button onClick={() => setSidePanel(null)} className={buttonClass}>Cancel</button><button disabled={!columnDraft.length} onClick={() => { setVisibleColumns(columnDraft); localStorage.setItem('ats_applicant_columns', JSON.stringify(columnDraft)); setSidePanel(null); }} className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Apply</button></div> : <div className="flex items-center justify-between border-t border-[#F1F5F9] px-5 py-4 dark:border-[#334155]"><button onClick={() => { if (sidePanel === 'edit-filters') { setDraftRules([]); setDraftBusinessUnit('All Business Units'); setDraftGdprApproved(false); setFilterRules([]); setBusinessUnitFilter('All Business Units'); setGdprApprovedFilter(false); localStorage.removeItem('ats_applicant_filter_rules'); localStorage.removeItem('ats_applicant_business_unit_filter'); } else { setDraftQuickFilters([]); setQuickFilters([]); } }} className="text-xs font-semibold text-[#6D7988] hover:text-[#1E293B]">Reset</button><div className="flex gap-2"><button onClick={() => setSidePanel(null)} className={buttonClass}>Cancel</button><button onClick={() => { if (sidePanel === 'edit-filters') { const activeRules = draftRules.filter((r) => r.field && (['Is Null', 'Is Not Null'].includes(r.operator) || r.value.trim())); setFilterRules(activeRules); setBusinessUnitFilter(draftBusinessUnit); setGdprApprovedFilter(draftGdprApproved); localStorage.setItem('ats_applicant_filter_rules', JSON.stringify(activeRules)); localStorage.setItem('ats_applicant_business_unit_filter', draftBusinessUnit); } else setQuickFilters(draftQuickFilters); setSidePanel(null); }} className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white">Apply</button></div></div>}
    </aside></div>}

    {quickResumePreview && <>
      <button type="button" aria-label="Close applicant quick view" onClick={() => setQuickResumePreview(null)} className="fixed inset-0 z-[59] cursor-default bg-black/10" />
      <aside role="dialog" aria-modal="true" aria-label={`Quick View: ${quickResumePreview.name}`} className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-[860px] flex-col border-l border-[#D8E3F1] bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
        <header className="flex min-h-12 items-center justify-between gap-3 border-b border-[#E2E8F0] px-4 py-2 dark:border-[#334155]">
          <div className="flex min-w-0 items-center gap-2"><IdCard className="h-4 w-4 shrink-0 text-[#334155]" /><button type="button" onClick={() => navigate('applicant-detail', quickResumePreview.id)} className="truncate text-sm font-semibold text-[#2563EB] hover:underline">{quickResumePreview.name}</button><IdCard className="h-3.5 w-3.5 shrink-0 text-[#6682B2]" /></div>
          <div className="flex shrink-0 items-center gap-3"><button type="button" title="Open applicant dossier" onClick={() => { navigate('applicant-detail', quickResumePreview.id); setQuickResumePreview(null); }} className="rounded bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white">Open Dossier</button><button type="button" onClick={() => setQuickResumePreview(null)} aria-label="Close quick view" className="text-2xl leading-none text-[#475569] hover:text-[#1E293B]">?</button></div>
        </header>
        <section className="grid grid-cols-2 gap-x-6 gap-y-2 bg-[#F1F1F1] px-4 py-4 text-[11px] sm:grid-cols-3 dark:bg-slate-800">
          <div><div className="uppercase text-[#7B8794]">Mobile Number</div><a className="font-medium text-[#2563EB]" href={`tel:${quickResumePreview.phone}`}>{quickResumePreview.phone || 'Not provided'}</a></div>
          <div><div className="uppercase text-[#7B8794]">Email Address</div><a className="font-medium text-[#2563EB]" href={`mailto:${quickResumePreview.email}`}>{quickResumePreview.email || 'Not provided'}</a></div>
          <div><div className="uppercase text-[#7B8794]">Location</div><div className="font-medium text-[#334155] dark:text-slate-100">{quickResumePreview.location || 'Not provided'}</div></div>
          <div><div className="uppercase text-[#7B8794]">Preferred Location</div><div className="font-medium text-[#334155] dark:text-slate-100">{quickResumePreview.customFields?.preferredLocation || 'N/A'}</div></div>
          <div><div className="uppercase text-[#7B8794]">Applicant Group</div><div className="font-medium text-[#334155] dark:text-slate-100">{quickResumePreview.applicantGroup || 'N/A'}</div></div>
        </section>
        <nav aria-label="Applicant quick view sections" className="flex gap-1 border-b border-[#E2E8F0] px-4 py-3 dark:border-[#334155]">{(['Resume', 'Submissions', 'Experience', 'Email Merges'] as const).map((tab) => <button key={tab} type="button" onClick={() => setQuickViewTab(tab)} className={`rounded border px-3 py-1.5 text-xs ${quickViewTab === tab ? 'border-[#3B82F6] bg-[#3B82F6] text-white' : 'border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F8FAFC] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'}`}>{tab}</button>)}</nav>
        <div className="min-h-0 flex-1 overflow-y-auto bg-[#FAFAFA] p-4 dark:bg-slate-900">
          {quickViewTab === 'Resume' && <article className="mx-auto min-h-full max-w-[760px] bg-white px-8 py-10 text-[#292929] shadow-sm dark:bg-[#1E293B] dark:text-slate-100">
            <h2 className="text-center font-serif text-2xl font-bold">{quickResumePreview.name}</h2><p className="mt-2 text-center font-serif text-sm font-semibold">{quickResumePreview.currentDesignation || 'Professional Candidate'}</p>
            <p className="mt-2 text-center text-xs text-[#2563EB]">{[quickResumePreview.phone, quickResumePreview.email, quickResumePreview.location].filter(Boolean).join('  |  ')}</p>
            <section className="mt-8"><h3 className="border-b border-[#CBD5E1] pb-1 font-serif text-sm font-bold uppercase">Summary</h3><p className="mt-2 text-sm leading-6">{quickResumePreview.summary || 'No professional summary has been added.'}</p></section>
            <section className="mt-7"><h3 className="border-b border-[#CBD5E1] pb-1 font-serif text-sm font-bold uppercase">Key Skills</h3><ul className="mt-2 grid list-disc grid-cols-2 gap-x-8 gap-y-1 pl-5 text-sm">{(quickResumePreview.skills || []).map((skill) => <li key={skill}>{skill}</li>)}</ul></section>
            <section className="mt-7"><h3 className="border-b border-[#CBD5E1] pb-1 font-serif text-sm font-bold uppercase">Professional Experience</h3>{((quickResumePreview.workHistory || quickResumePreview.employerDetails || []) as Array<{ role?: string; title?: string; company: string; duration?: string; from?: string; to?: string; summary?: string }>).length ? ((quickResumePreview.workHistory || quickResumePreview.employerDetails || []) as Array<{ role?: string; title?: string; company: string; duration?: string; from?: string; to?: string; summary?: string }>).map((item, index) => <div key={`${item.company}-${index}`} className="mt-3"><div className="font-semibold">{item.role || item.title} | {item.company}</div><div className="mt-1 text-sm leading-5">{item.summary || item.duration || ''}</div></div>) : <p className="mt-2 text-sm text-[#64748B]">No experience details have been added.</p>}</section>
            <section className="mt-7"><h3 className="border-b border-[#CBD5E1] pb-1 font-serif text-sm font-bold uppercase">Education</h3>{(quickResumePreview.education || quickResumePreview.educationDetails || []).length ? (quickResumePreview.education || quickResumePreview.educationDetails || []).map((item, index) => <div key={`${item.school}-${index}`} className="mt-2 text-sm"><span className="font-semibold">{item.degree}</span>{item.school ? ` | ${item.school}` : ''}{item.year ? ` | ${item.year}` : ''}</div>) : <p className="mt-2 text-sm text-[#64748B]">No education details have been added.</p>}</section>
          </article>}
          {quickViewTab === 'Submissions' && <div className="rounded border border-[#E2E8F0] bg-white p-5 text-sm text-[#64748B] dark:border-slate-700 dark:bg-slate-800">Submission records for {quickResumePreview.name} can be reviewed in the Submissions module.</div>}
          {quickViewTab === 'Experience' && <div className="space-y-3">{((quickResumePreview.workHistory || quickResumePreview.employerDetails || []) as Array<{ role?: string; title?: string; company: string; duration?: string; from?: string; to?: string; summary?: string }>).length ? ((quickResumePreview.workHistory || quickResumePreview.employerDetails || []) as Array<{ role?: string; title?: string; company: string; duration?: string; from?: string; to?: string; summary?: string }>).map((item, index) => <article key={`${item.company}-${index}`} className="rounded border border-[#E2E8F0] bg-white p-4 dark:border-slate-700 dark:bg-slate-800"><div className="font-semibold">{item.role || item.title} ? {item.company}</div><div className="mt-1 text-xs text-[#64748B]">{item.duration || [item.from, item.to].filter(Boolean).join(' ? ')}</div><p className="mt-2 text-sm">{item.summary || 'No role details available.'}</p></article>) : <p className="rounded border bg-white p-5 text-sm text-[#64748B]">No experience details have been added.</p>}</div>}
          {quickViewTab === 'Email Merges' && <div className="rounded border border-[#E2E8F0] bg-white p-5 text-sm text-[#64748B] dark:border-slate-700 dark:bg-slate-800">No email merge history is available for this applicant.</div>}
        </div>
      </aside>
    </>}


    {/* Slide-out Applicant Notes Drawer (Reference Image) */}
    {notesDrawerApplicant && notesHistoryOpen && (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-[64] bg-black/25 backdrop-blur-[0.5px] transition-opacity"
          onClick={() => { setNotesHistoryOpen(false); setNotesDrawerApplicant(null); }}
        />
        {/* Drawer */}
        <aside
          aria-label="Applicant Notes"
          className="drawer-panel fixed bottom-0 right-0 top-0 z-[65] flex w-full max-w-[640px] flex-col bg-white shadow-2xl dark:border-l dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header: ID - Name, + Add Note button, close X */}
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4 dark:border-[#334155]">
            <h2 className="text-base font-bold text-[#1F2937] dark:text-white">
              {notesDrawerApplicant.applicantId || notesDrawerApplicant.id} - {notesDrawerApplicant.name}
            </h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingNoteId(null);
                  setDrawerNoteText('');
                  setDrawerNoteSubject(`New Note Created for ${notesDrawerApplicant.name.toUpperCase()} - ${notesDrawerApplicant.applicantId || notesDrawerApplicant.id}.`);
                  setDrawerNotePriority('Medium');
                  setDrawerNoteJob('');
                  setDrawerNoteClient('');
                  setDrawerNoteAction('N/A');
                  setDrawerNoteRemindMe(false);
                  setDrawerNoteAddToTask(false);
                  setIsAddNoteModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded bg-[#2F80ED] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1D6FD8] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Note
              </button>
              <button
                type="button"
                onClick={() => { setNotesHistoryOpen(false); setNotesDrawerApplicant(null); }}
                aria-label="Close notes panel"
                className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Sub-tabs: Applicant with count pill and blue bottom indicator line */}
          <div className="border-b border-[#E5E7EB] px-6 dark:border-[#334155]">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 border-b-2 border-[#2F80ED] pb-2.5 pt-3 text-xs font-semibold text-[#2F80ED]">
                <span>Applicant</span>
                <span className="rounded-full bg-[#EBF3FE] px-2 py-0.5 text-[11px] font-bold text-[#2F80ED] dark:bg-blue-950/60 dark:text-blue-300">
                  {notesDrawerApplicant.notes?.length || (notesDrawerApplicant.applicantRemarks ? 1 : 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Drawer Body: Notes List */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {(!notesDrawerApplicant.notes || notesDrawerApplicant.notes.length === 0) && !notesDrawerApplicant.applicantRemarks ? (
              <div className="py-16 text-center text-xs text-gray-400 dark:text-slate-400">
                No notes available for this applicant. Click "+ Add Note" to create one.
              </div>
            ) : (
              <div className="space-y-4">
                {(notesDrawerApplicant.notes || []).map((note) => (
                  <div key={note.id} className="border-b border-[#E5E7EB] pb-4 last:border-b-0 dark:border-[#334155]">
                    {/* Top Row: Purple Document Icon, Author - Date, Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#6366F1] text-white shadow-xs">
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                          </svg>
                        </div>
                        <div className="text-xs">
                          <span className="font-semibold text-[#1F2937] dark:text-white">
                            {note.author || 'User'}
                          </span>
                          <span className="ml-1 text-[#6B7280] dark:text-[#9CA3AF]">
                            - {note.date || ''}
                          </span>
                        </div>
                      </div>

                      {/* Pin, Edit, Delete Actions */}
                      <div className="flex items-center gap-2 text-[#2F80ED]">
                        <button
                          type="button"
                          title={note.pinned ? 'Unpin Note' : 'Pin Note'}
                          onClick={() => handleTogglePinNote(note.id)}
                          className={`hover:opacity-80 transition-opacity ${note.pinned ? 'text-[#F59E0B]' : 'text-[#2F80ED]'}`}
                        >
                          <Pin className={`h-3.5 w-3.5 ${note.pinned ? 'rotate-45 fill-current' : ''}`} />
                        </button>
                        <button
                          type="button"
                          title="Edit Note"
                          onClick={() => handleStartEditNote(note)}
                          className="hover:opacity-80 transition-opacity"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Delete Note"
                          onClick={() => handleDeleteNote(note.id)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Note Text */}
                    <div className="pl-[34px] pt-1.5">
                      <p className="text-xs text-[#374151] whitespace-pre-wrap dark:text-[#D1D5DB]">
                        {note.text}
                      </p>
                      <p className="mt-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                        Action: {note.action || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}

                {(!notesDrawerApplicant.notes || notesDrawerApplicant.notes.length === 0) && notesDrawerApplicant.applicantRemarks && (
                  <div className="border-b border-[#E5E7EB] pb-4 dark:border-[#334155]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#6366F1] text-white shadow-xs">
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                          </svg>
                        </div>
                        <div className="text-xs">
                          <span className="font-semibold text-[#1F2937] dark:text-white">
                            {notesDrawerApplicant.assignedRecruiter || 'User'}
                          </span>
                          <span className="ml-1 text-[#6B7280] dark:text-[#9CA3AF]">
                            - {notesDrawerApplicant.createdOn || ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="pl-[34px] pt-1.5">
                      <p className="text-xs text-[#374151] whitespace-pre-wrap dark:text-[#D1D5DB]">
                        {notesDrawerApplicant.applicantRemarks}
                      </p>
                      <p className="mt-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                        Action: N/A
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </>
    )}

    {/* Add / Edit Note side panel */}
    {isAddNoteModalOpen && notesDrawerApplicant && (
      <div
        className="fixed inset-0 z-[70] flex justify-end bg-black/50"
        onClick={() => setIsAddNoteModalOpen(false)}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="applicant-note-panel-title"
          className="drawer-panel flex h-full w-full flex-col border-l border-[#CBD5E1] bg-white shadow-2xl sm:w-[min(46vw,900px)] dark:border-[#334155] dark:bg-[#1E293B]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-[#E2E8F0] px-6 py-4 dark:border-[#334155]">
            <h2 id="applicant-note-panel-title" className="text-lg font-bold text-[#1F2937] dark:text-white">
              {editingNoteId ? 'Edit Note' : 'Add Notes'}
            </h2>
            <button
              type="button"
              aria-label="Close note panel"
              onClick={() => { setIsAddNoteModalOpen(false); setEditingNoteId(null); }}
              className="rounded p-1 text-[#888] hover:bg-[#F1F3F5] hover:text-[#222] dark:text-slate-400 dark:hover:bg-[#334155] dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="shrink-0 border-b border-[#E2E8F0] px-6 py-3 dark:border-[#334155]">
            <p className="text-sm font-semibold text-[#334155] dark:text-white">{notesDrawerApplicant.name}</p>
            <p className="mt-1 text-xs text-[#64748B] dark:text-[#AAB2BF]">{notesDrawerApplicant.applicantId || notesDrawerApplicant.id} <span className="px-1">·</span> {notesDrawerApplicant.email}{notesDrawerApplicant.phone ? ` · ${notesDrawerApplicant.phone}` : ''}</p>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-6 py-4 text-xs">
            <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2">
              <select aria-label="Select Action" value={drawerNoteAction} onChange={(e) => setDrawerNoteAction(e.target.value)} className="w-full border border-[#CBD5E1] bg-[#F8F8F8] px-3 py-2.5 text-xs text-[#333] outline-none focus:border-[#2F80ED] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white">
                <option value="N/A">Select Action</option>
                <option value="Added through Submission">Added through Submission</option>
                <option value="Added Through Tagging">Added Through Tagging</option>
                <option value="Call">Call</option>
                <option value="Imported from ResumeInbox">Imported from ResumeInbox</option>
                <option value="Inbound SMS">Inbound SMS</option>
                <option value="Incoming Email">Incoming Email</option>
                <option value="Meeting">Meeting</option>
                <option value="Outbound Email">Outbound Email</option>
                <option value="Outbound SMS">Outbound SMS</option>
                <option value="Prescreen">Prescreen</option>
                <option value="Submitted">Submitted</option>
              </select>
              <select aria-label="Note priority" value={drawerNotePriority} onChange={(e) => setDrawerNotePriority(e.target.value)} className="w-full border border-[#CBD5E1] bg-[#F8F8F8] px-3 py-2.5 text-xs text-[#333] outline-none focus:border-[#2F80ED] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white">
                <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
              </select>
            </div>

            {/* Rich text note editor */}
            <div className="flex min-h-[380px] flex-1 flex-col rounded border border-[#CBD5E1] dark:border-[#334155]">
              {/* Top Toolbar Row */}
              <div className="flex flex-wrap items-center gap-1 border-b border-[#CBD5E1] bg-[#F8FAFC] p-1.5 text-xs text-[#555] dark:border-[#334155] dark:bg-[#0F172A] dark:text-slate-300">
                <button type="button" title="Cut" className="rounded p-1 hover:bg-gray-200 dark:hover:bg-[#334155]">✂</button>
                <button type="button" title="Copy" className="rounded p-1 hover:bg-gray-200 dark:hover:bg-[#334155]">📋</button>
                <button type="button" title="Paste" className="rounded p-1 hover:bg-gray-200 dark:hover:bg-[#334155]">📄</button>
                <button type="button" title="Undo" className="rounded p-1 hover:bg-gray-200 dark:hover:bg-[#334155]">↩</button>
                <button type="button" title="Redo" className="rounded p-1 hover:bg-gray-200 dark:hover:bg-[#334155]">↪</button>
                <span className="text-gray-300 dark:text-slate-600">|</span>
                <button type="button" title="Bold" className="rounded px-1.5 py-0.5 font-bold hover:bg-gray-200 dark:hover:bg-[#334155]">B</button>
                <button type="button" title="Italic" className="rounded px-1.5 py-0.5 italic hover:bg-gray-200 dark:hover:bg-[#334155]">I</button>
                <button type="button" title="Underline" className="rounded px-1.5 py-0.5 underline hover:bg-gray-200 dark:hover:bg-[#334155]">U</button>
                <button type="button" title="Strikethrough" className="rounded px-1.5 py-0.5 line-through hover:bg-gray-200 dark:hover:bg-[#334155]">S</button>
                <button type="button" title="Subscript" className="rounded px-1 text-[10px] hover:bg-gray-200 dark:hover:bg-[#334155]">x₂</button>
                <button type="button" title="Superscript" className="rounded px-1 text-[10px] hover:bg-gray-200 dark:hover:bg-[#334155]">x²</button>
                <span className="text-gray-300 dark:text-slate-600">|</span>
                <button type="button" title="Bulleted list" className="rounded px-1 text-[11px] hover:bg-gray-200 dark:hover:bg-[#334155]">≡</button>
                <button type="button" title="Numbered list" className="rounded px-1 text-[11px] hover:bg-gray-200 dark:hover:bg-[#334155]">1.</button>
                <span className="text-gray-300 dark:text-slate-600">|</span>
                <button type="button" title="Special character" className="rounded px-1 text-[11px] hover:bg-gray-200 dark:hover:bg-[#334155]">Ω</button>
                <button type="button" title="Link" className="rounded px-1 text-[11px] hover:bg-gray-200 dark:hover:bg-[#334155]">🔗</button>
                <button type="button" title="Source code" className="rounded px-1 text-[11px] hover:bg-gray-200 dark:hover:bg-[#334155]">&lt;/&gt;</button>
              </div>
              {/* Second Toolbar Row */}
              <div className="flex flex-wrap items-center gap-1.5 border-b border-[#CBD5E1] bg-[#F8FAFC] px-1.5 py-1 text-[11px] text-[#555] dark:border-[#334155] dark:bg-[#0F172A] dark:text-slate-300">
                <button type="button" title="Table" className="rounded p-0.5 hover:bg-gray-200 dark:hover:bg-[#334155]">▦</button>
                <button type="button" title="Align Left" className="rounded p-0.5 hover:bg-gray-200 dark:hover:bg-[#334155]">⇠</button>
                <button type="button" title="Align Center" className="rounded p-0.5 hover:bg-gray-200 dark:hover:bg-[#334155]">↔</button>
                <button type="button" title="Align Right" className="rounded p-0.5 hover:bg-gray-200 dark:hover:bg-[#334155]">⇢</button>
                <span className="text-gray-300 dark:text-slate-600">|</span>
                <span className="font-bold underline text-blue-600">A</span>
                <span className="bg-yellow-200 px-1 font-semibold text-black">A</span>
                <span className="text-gray-300 dark:text-slate-600">|</span>
                <select className="bg-transparent text-[10px] outline-none text-[#555] dark:text-slate-300">
                  <option className="dark:bg-[#1E293B]">Styles</option>
                </select>
                <select className="bg-transparent text-[10px] outline-none text-[#555] dark:text-slate-300">
                  <option className="dark:bg-[#1E293B]">Format</option>
                </select>
                <select className="bg-transparent text-[10px] outline-none text-[#555] dark:text-slate-300">
                  <option className="dark:bg-[#1E293B]">Font</option>
                </select>
                <select className="bg-transparent text-[10px] outline-none text-[#555] dark:text-slate-300">
                  <option className="dark:bg-[#1E293B]">Size</option>
                </select>
              </div>
              <textarea
                rows={12}
                value={drawerNoteText}
                onChange={(e) => setDrawerNoteText(e.target.value)}
                placeholder="Enter note contents..."
                className="min-h-[320px] flex-1 w-full p-3 text-xs outline-none dark:bg-[#0F172A] dark:text-white"
              />
            </div>

            {/* Row 7: Add To Task Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer pt-0.5">
              <input
                type="checkbox"
                checked={drawerNoteAddToTask}
                onChange={(e) => setDrawerNoteAddToTask(e.target.checked)}
                className="rounded border-[#CBD5E1] text-[#2F80ED] focus:ring-0"
              />
              <span className="text-xs text-[#444] dark:text-slate-300">Add To Task</span>
            </label>
          </div>

          <div className="flex shrink-0 justify-end gap-2.5 border-t border-[#E2E8F0] bg-white px-6 py-4 dark:border-[#334155] dark:bg-[#1E293B]">
            <button
              type="button"
              onClick={handleSaveDrawerNote}
              className="rounded bg-[#2F80ED] px-6 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1D6FD8] transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => { setIsAddNoteModalOpen(false); setEditingNoteId(null); }}
              className="rounded border border-[#CED4DA] bg-white px-5 py-1.5 text-xs font-semibold text-[#444] hover:bg-gray-50 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:hover:bg-[#334155] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    {dialog === 'import' && <div className="fixed inset-x-0 bottom-0 top-[56px] z-[60] overflow-y-auto bg-[#EEF1F4] text-[#334155] dark:bg-[#0F172A] dark:text-[#E2E8F0]">
      <div className="flex items-center justify-between px-4 py-4"><h1 className="text-lg font-medium text-[#475569] dark:text-white">Import Applicant from spreadsheet</h1><div className="flex gap-1"><button onClick={() => setDialog(null)} title="Back to applicants" aria-label="Back to applicants" className="rounded border border-[#E2E8F0] bg-white p-2 text-[#536577] hover:bg-[#F7F9FB] dark:border-[#334155] dark:bg-[#1E293B] dark:text-slate-300 dark:hover:bg-[#334155]"><ArrowRight className="h-4 w-4 rotate-180" /></button><button onClick={() => { const template = 'Name,Email,Phone,Designation,Location,Experience,Skills\n'; const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([template], { type: 'text/csv;charset=utf-8' })); link.download = 'Applicant_Import_Template.csv'; link.click(); URL.revokeObjectURL(link.href); }} title="Download import template" aria-label="Download import template" className="rounded border border-[#E2E8F0] bg-white p-2 text-[#536577] hover:bg-[#F7F9FB] dark:border-[#334155] dark:bg-[#1E293B] dark:text-slate-300 dark:hover:bg-[#334155]"><Download className="h-4 w-4" /></button></div></div>
      <section className="mx-4 mb-6 min-h-[540px] border border-[#E0E5EA] bg-white p-5 shadow-sm md:px-9 md:py-6 dark:border-[#334155] dark:bg-[#1E293B]">
        {importStep === 'upload' ? <>
          <div className="grid max-w-4xl grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-[125px_minmax(260px,330px)] sm:items-center">
            <label htmlFor="applicant-import-file" className="text-xs text-[#64748B] dark:text-slate-300">Attachment</label><div><input id="applicant-import-file" type="file" accept=".csv,.xlsx,.xls" onChange={(e) => handleApplicantFile(e.target.files?.[0])} className="block w-full max-w-[330px] border border-[#E2E8F0] bg-[#FAFAFA] text-xs file:mr-2 file:border-0 file:bg-[#F4F4F4] file:px-3 file:py-2 file:text-xs file:text-[#425466] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:file:bg-[#334155] dark:file:text-white" />{fileName && <p className="mt-1 text-[11px] text-[#1E293B] dark:text-blue-300">{fileName}{importRows.length ? ` · ${importRows.length} applicants ready` : ''}</p>}{importError && <p role="alert" className="mt-1 text-[11px] text-red-600 dark:text-red-400">{importError}</p>}</div>
            <label htmlFor="applicant-import-business-unit" className="text-xs text-[#64748B] dark:text-slate-300">Business Units</label><select id="applicant-import-business-unit" value={importBusinessUnit} onChange={(e) => setImportBusinessUnit(e.target.value)} className="w-full max-w-[330px] border border-[#CAD3DD] bg-white px-2 py-2 text-xs text-[#334155] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"><option>Ampcus Tech Pvt Ltd.</option>{currentUser?.businessUnit && currentUser.businessUnit !== 'Ampcus Tech Pvt Ltd.' && <option>{currentUser.businessUnit}</option>}<option>All Business Units</option></select>
            <span className="text-xs text-[#64748B] dark:text-slate-300">Duplicate Records</span><div className="flex flex-wrap gap-5 text-xs text-[#64748B] dark:text-slate-300">{(['Skip', 'Overwrite'] as const).map((policy) => <label key={policy} className="flex items-center gap-1.5"><input type="radio" checked={duplicatePolicy === policy} onChange={() => setDuplicatePolicy(policy)} />{policy}</label>)}</div>
            <span /> <div className="flex gap-1"><button onClick={() => { if (!fileName) { setImportError('Choose an applicant file to continue.'); return; } if (!importRows.length) { setImportError('No parsed applicant rows are ready. Choose a CSV file with a Name column.'); return; } setImportStep('preview'); setImportError(''); }} className="rounded bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2877E8]">Next</button><button onClick={() => setDialog(null)} className="rounded bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2877E8]">Cancel</button></div>
          </div>
          <div className="mt-7 rounded-md border border-[#E6E6E6] bg-[#F7F7F7] px-4 py-5 text-[11px] leading-6 text-[#8793A0] dark:border-[#334155] dark:bg-[#0F172A] dark:text-slate-300"><div className="mb-1 font-semibold text-[#2488CF]">Supported Formats and Size</div><ul className="list-disc pl-5"><li>CSV and XLSX files can be selected. CSV files are parsed in the browser in this frontend demo.</li><li>For the CSV preview, include a header row with Name, Email, Phone, Designation, Location, Experience, and Skills.</li><li>File size cannot exceed 5MB.</li></ul><div className="mb-1 mt-2 font-semibold text-[#2488CF]">Please Note</div><ul className="list-disc pl-5"><li>Duplicate applicants are matched by email address.</li><li>The first row in the file must contain field names.</li><li>Skip ignores duplicate email addresses; Overwrite updates matching applicants.</li><li>Import preview and applicant data remain in this browser for this frontend demo.</li></ul></div>
        </> : <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><div className="text-sm font-semibold text-[#334155] dark:text-white">Review Applicant Import</div><div className="mt-1 text-xs text-[#64748B] dark:text-slate-400">{fileName} · {importRows.length} applicants · {duplicatePolicy} duplicate records</div></div><button onClick={() => setImportStep('upload')} className="rounded border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs text-[#536577] dark:border-[#334155] dark:bg-[#0F172A] dark:text-slate-300">Back</button></div>
          <div className="overflow-x-auto rounded border border-[#E4E8EC] dark:border-[#334155]"><table className="w-full min-w-[700px] border-collapse text-left text-xs"><thead className="bg-[#F6F8FA] text-[#64748B] dark:bg-[#0F172A] dark:text-slate-300"><tr>{['Name', 'Email Address', 'Mobile Number', 'Designation', 'Location', 'Experience', 'Skills'].map((label) => <th key={label} className="border-b px-3 py-2.5 font-semibold dark:border-[#334155]">{label}</th>)}</tr></thead><tbody className="dark:text-white">{importRows.slice(0, 12).map((applicant, index) => <tr key={`${applicant.email}-${index}`} className="border-b last:border-0 dark:border-[#334155]"><td className="px-3 py-2">{applicant.name}</td><td className="px-3 py-2">{applicant.email}</td><td className="px-3 py-2">{applicant.phone}</td><td className="px-3 py-2">{applicant.currentDesignation}</td><td className="px-3 py-2">{applicant.location}</td><td className="px-3 py-2">{applicant.experienceYears}</td><td className="px-3 py-2">{applicant.skills?.join(', ')}</td></tr>)}</tbody></table></div>{importRows.length > 12 && <p className="mt-2 text-[11px] text-[#64748B] dark:text-slate-400">Showing the first 12 of {importRows.length} applicants.</p>}
          <div className="mt-5 flex justify-end gap-2"><button onClick={() => setDialog(null)} className="rounded border border-[#E2E8F0] bg-white px-3 py-2 text-xs text-[#536577] dark:border-[#334155] dark:bg-[#0F172A] dark:text-slate-300">Cancel</button><button onClick={completeApplicantImport} className="rounded bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white">Import {importRows.length} Applicants</button></div>
        </>}
      </section>
    </div>}
    {dialog === 'advanced' && <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#E9EEF3] text-[#17233D]">
      <header className="sticky top-0 z-20 flex h-[50px] items-center bg-[#0966BF] px-3 text-white shadow-sm md:px-5">
        <div className="relative mr-3"><button onClick={() => setAdvancedMenuOpen((open) => !open)} aria-label="Open navigation menu" aria-expanded={advancedMenuOpen} className="rounded p-1 hover:bg-white/10"><Menu className="h-5 w-5" /></button>{advancedMenuOpen && <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-b-md border border-[#D8E3F1] bg-white py-1 text-[#1F2937] shadow-xl">{[['JOB POSTING', 'jobs'], ['APPLICANTS', 'applicants'], ['CLIENT', 'clients'], ['JOB TEMPLATES', 'job-templates']].map(([label, route]) => <button key={route} onClick={() => { setAdvancedMenuOpen(false); setDialog(null); navigate(route as 'jobs' | 'applicants' | 'clients' | 'job-templates'); }} className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-[11px] font-medium hover:bg-[#F1F5F9]"><span className="w-3 text-center text-[#1E293B]">{route === 'jobs' ? '◈' : route === 'applicants' ? '♟' : route === 'clients' ? '♟' : '▤'}</span>{label}</button>)}</div>}</div>
        <button onClick={() => setDialog(null)} aria-label="Return to applicants" className="mr-4 rounded p-1 hover:bg-white/10"><Home className="h-5 w-5" /></button>
        <nav aria-label="Applicant search sources" className="flex h-full items-stretch gap-0.5">{['Internal DB', 'Monster', 'Integrated Search', 'Naukri'].map((provider) => <button key={provider} onClick={() => setAdvancedProvider(provider)} className={`border-b-[3px] px-3 text-xs font-medium transition-colors md:px-4 ${advancedProvider === provider ? 'border-white bg-white/10 text-white' : 'border-transparent text-white/85 hover:bg-white/10'}`}>{provider}</button>)}</nav>
      </header>
      <section className="bg-[#17275A] px-5 py-5 text-white md:px-10">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-5 flex items-center justify-between"><div className="text-xs font-semibold uppercase tracking-wide text-[#8ABEFF]">Applicant Search <span className="ml-2 font-normal normal-case text-white/65">· {advancedProvider}</span></div><button onClick={() => setDialog(null)} aria-label="Close advanced search" className="rounded-md p-1 text-white/80 hover:bg-white/10"><X className="h-5 w-5" /></button></div>
          <div className="mb-5 flex gap-6 border-b border-white/20 text-xs"><button onClick={() => setAdvancedTab('options')} className={`border-b-2 px-1 pb-2 ${advancedTab === 'options' ? 'border-[#52A0FF] text-white' : 'border-transparent text-white/65'}`}>Search Options</button><button onClick={() => setAdvancedTab('exclude')} className={`border-b-2 px-1 pb-2 ${advancedTab === 'exclude' ? 'border-[#52A0FF] text-white' : 'border-transparent text-white/65'}`}>Exclude</button></div>
          {advancedTab === 'options' ? <div className="space-y-4">
            <div className="grid gap-px overflow-hidden rounded-md md:grid-cols-2"><label className="bg-white p-2 text-[10px] font-semibold uppercase tracking-wide text-[#1E293B]">Keywords<input value={advancedDraft.keywords} onChange={(e) => updateAdvancedDraft({ keywords: e.target.value })} placeholder="JavaScript, React, MongoDB" className="mt-1 w-full border-0 p-0 text-xs font-normal normal-case text-[#1F2937] outline-none placeholder:text-[#8895A5]" /></label><label className="bg-white p-2 text-[10px] font-semibold uppercase tracking-wide text-[#1E293B]">Job Title<input value={advancedDraft.jobTitle} onChange={(e) => updateAdvancedDraft({ jobTitle: e.target.value })} placeholder="Java Developer" className="mt-1 w-full border-0 p-0 text-xs font-normal normal-case text-[#1F2937] outline-none placeholder:text-[#8895A5]" /></label></div>
            <button onClick={() => updateAdvancedDraft({ terms: [...advancedDraft.terms, { id: `advanced-term-${Date.now()}`, field: '', operator: '', value: '', join: advancedDraft.terms.length ? 'AND' : 'AND' }] })} className="text-xs font-semibold text-[#78B7FF] hover:text-white">+ STRING BUILDER</button>
            {advancedDraft.terms.length > 0 && <div className="space-y-2">{advancedDraft.terms.map((term, index) => <div key={term.id} className="grid gap-2 sm:grid-cols-[90px_1.2fr_1fr_1fr_36px]"><select aria-label="String builder join" value={term.join} disabled={index === 0} onChange={(e) => updateAdvancedDraft({ terms: advancedDraft.terms.map((item) => item.id === term.id ? { ...item, join: e.target.value as 'AND' | 'OR' } : item) })} className="rounded-md border border-white/20 bg-[#24386F] px-2 py-2 text-xs text-white disabled:opacity-40"><option>AND</option><option>OR</option></select><select aria-label="String builder field" value={term.field} onChange={(e) => updateAdvancedDraft({ terms: advancedDraft.terms.map((item) => item.id === term.id ? { ...item, field: e.target.value, operator: '', value: '' } : item) })} className="rounded-md border border-white/20 bg-[#24386F] px-2 py-2 text-xs text-white"><option value="">Select Field</option>{filterFields.map((field) => <option key={field}>{field}</option>)}</select><select aria-label="String builder operator" value={term.operator} disabled={!term.field} onChange={(e) => updateAdvancedDraft({ terms: advancedDraft.terms.map((item) => item.id === term.id ? { ...item, operator: e.target.value } : item) })} className="rounded-md border border-white/20 bg-[#24386F] px-2 py-2 text-xs text-white disabled:opacity-50"><option value="">Select Operator</option>{filterOperators.map((operator) => <option key={operator}>{operator}</option>)}</select>{term.operator && !['Is Null', 'Is Not Null'].includes(term.operator) ? <input aria-label="String builder value" value={term.value} onChange={(e) => updateAdvancedDraft({ terms: advancedDraft.terms.map((item) => item.id === term.id ? { ...item, value: e.target.value } : item) })} placeholder="Value" className="rounded-md border border-white/20 bg-white px-3 py-2 text-xs text-[#1F2937]" /> : <div />}<button aria-label="Remove string builder rule" onClick={() => updateAdvancedDraft({ terms: advancedDraft.terms.filter((item) => item.id !== term.id) })} className="flex items-center justify-center rounded-md text-white/80 hover:bg-white/10"><X className="h-4 w-4" /></button></div>)}</div>}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-1 text-xs"><label className="flex items-center gap-2"><input type="radio" checked={advancedDraft.locationMode === 'selected'} onChange={() => updateAdvancedDraft({ locationMode: 'selected' })} /> Search Within Selected Locations</label><label className="flex items-center gap-2"><input type="radio" checked={advancedDraft.locationMode === 'radius'} onChange={() => updateAdvancedDraft({ locationMode: 'radius' })} /> Search Within Radius</label>{advancedDraft.locationMode === 'radius' && <label className="flex items-center gap-2">Miles<input type="number" min="1" value={advancedDraft.radius} onChange={(e) => updateAdvancedDraft({ radius: e.target.value })} className="w-20 rounded border border-white/30 bg-[#24386F] px-2 py-1.5 text-white" /></label>}<label className="ml-auto flex items-center gap-2"><input type="checkbox" checked={advancedDraft.recentJobTitle} onChange={(e) => updateAdvancedDraft({ recentJobTitle: e.target.checked })} /> Recent Job Title</label></div>
            <div className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_150px]"><label className="rounded-md bg-white p-2 text-[10px] font-semibold uppercase tracking-wide text-[#1E293B]">Country<select value={advancedDraft.country} onChange={(e) => updateAdvancedDraft({ country: e.target.value })} className="mt-1 w-full border-0 bg-white p-0 text-xs font-normal normal-case text-[#1F2937] outline-none"><option value="">Any Country</option>{['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'United Arab Emirates'].map((country) => <option key={country}>{country}</option>)}</select></label><label className="rounded-md bg-white p-2 text-[10px] font-semibold uppercase tracking-wide text-[#1E293B]">State<select value={advancedDraft.state} onChange={(e) => updateAdvancedDraft({ state: e.target.value })} className="mt-1 w-full border-0 bg-white p-0 text-xs font-normal normal-case text-[#1F2937] outline-none"><option value="">Any State</option>{Array.from(new Set([...applicants.map((a) => a.state || a.customFields?.state || '').filter(Boolean), 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'California', 'New York'])).map((state) => <option key={state}>{state}</option>)}</select></label><label className="rounded-md bg-white p-2 text-[10px] font-semibold uppercase tracking-wide text-[#1E293B]">City<input list="advanced-applicant-cities" value={advancedDraft.city} onChange={(e) => updateAdvancedDraft({ city: e.target.value })} placeholder="Any City" className="mt-1 w-full border-0 p-0 text-xs font-normal normal-case text-[#1F2937] outline-none" /><datalist id="advanced-applicant-cities">{Array.from(new Set(applicants.map((a) => a.location.split(',')[0].trim()).filter(Boolean))).map((city) => <option key={city} value={city} />)}</datalist></label><div className="flex flex-col gap-2"><button onClick={() => { if (advancedProvider === 'Internal DB') runAdvancedSearch(); else showToast(`${advancedProvider} search is available as a frontend tab; external search is not connected.`); }} className="flex-1 rounded-md bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2475E7]">SEARCH</button><button onClick={resetAdvancedSearch} className="rounded-md border border-white/35 px-5 py-1.5 text-xs text-white hover:bg-white/10">RESET</button></div></div>
            <div className="mt-1 flex flex-wrap items-center gap-x-8 gap-y-3"><button onClick={() => setShowAdvancedOptions((open) => !open)} className="text-left text-xs font-semibold text-[#78B7FF]">{showAdvancedOptions ? "- ADVANCED OPTIONS" : "+ ADVANCED OPTIONS"}</button><label className="flex items-center gap-2 text-[11px] text-white/90"><input type="checkbox" checked={advancedDraft.includeWithoutCountry} onChange={(e) => updateAdvancedDraft({ includeWithoutCountry: e.target.checked })} /> Include Applicants Without Country</label></div>
            {showAdvancedOptions && <div className="mt-3 grid gap-2 rounded-md border border-white/15 bg-[#1D3068] p-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-[10px] font-semibold uppercase tracking-wide text-white/80">Applicant ID<input value={advancedDraft.applicantId} onChange={(e) => updateAdvancedDraft({ applicantId: e.target.value })} placeholder="Applicant ID" className="mt-1 w-full rounded border border-white/20 bg-white px-2.5 py-2 text-xs font-normal normal-case text-[#1F2937]" /></label>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-white/80">Email Address<input value={advancedDraft.email} onChange={(e) => updateAdvancedDraft({ email: e.target.value })} placeholder="Email address" className="mt-1 w-full rounded border border-white/20 bg-white px-2.5 py-2 text-xs font-normal normal-case text-[#1F2937]" /></label>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-white/80">Mobile Number<input value={advancedDraft.phone} onChange={(e) => updateAdvancedDraft({ phone: e.target.value })} placeholder="Mobile number" className="mt-1 w-full rounded border border-white/20 bg-white px-2.5 py-2 text-xs font-normal normal-case text-[#1F2937]" /></label>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-white/80">Applicant Status<select value={advancedDraft.applicantStatus} onChange={(e) => updateAdvancedDraft({ applicantStatus: e.target.value })} className="mt-1 w-full rounded border border-white/20 bg-white px-2.5 py-2 text-xs font-normal normal-case text-[#1F2937]"><option value="">Any Status</option>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></label>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-white/80">Source<select value={advancedDraft.source} onChange={(e) => updateAdvancedDraft({ source: e.target.value })} className="mt-1 w-full rounded border border-white/20 bg-white px-2.5 py-2 text-xs font-normal normal-case text-[#1F2937]"><option value="">Any Source</option>{["LinkedIn", "Direct Career Portal", "Referral", "Vendor Partner", "GitHub"].map((source) => <option key={source}>{source}</option>)}</select></label>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-white/80">Ownership<select value={advancedDraft.recruiter} onChange={(e) => updateAdvancedDraft({ recruiter: e.target.value })} className="mt-1 w-full rounded border border-white/20 bg-white px-2.5 py-2 text-xs font-normal normal-case text-[#1F2937]"><option value="">Any Recruiter</option>{Array.from(new Set(applicants.map((a) => a.assignedRecruiter).filter(Boolean))).map((name) => <option key={name}>{name}</option>)}</select></label>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-white/80">Work Authorization<input value={advancedDraft.workAuthorization} onChange={(e) => updateAdvancedDraft({ workAuthorization: e.target.value })} placeholder="e.g. Citizen" className="mt-1 w-full rounded border border-white/20 bg-white px-2.5 py-2 text-xs font-normal normal-case text-[#1F2937]" /></label>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-white/80">Minimum Experience<input type="number" min="0" value={advancedDraft.minExperience} onChange={(e) => updateAdvancedDraft({ minExperience: e.target.value })} placeholder="Any" className="mt-1 w-full rounded border border-white/20 bg-white px-2.5 py-2 text-xs font-normal normal-case text-[#1F2937]" /></label>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-white/80">Maximum Experience<input type="number" min="0" value={advancedDraft.maxExperience} onChange={(e) => updateAdvancedDraft({ maxExperience: e.target.value })} placeholder="Any" className="mt-1 w-full rounded border border-white/20 bg-white px-2.5 py-2 text-xs font-normal normal-case text-[#1F2937]" /></label>
            </div>}
          </div> : <div className="grid gap-3 md:grid-cols-[1fr_1fr_150px]"><label className="rounded-md bg-white p-2 text-[10px] font-semibold uppercase tracking-wide text-[#1E293B]">Exclude Keywords<input value={advancedDraft.exclude} onChange={(e) => updateAdvancedDraft({ exclude: e.target.value })} placeholder="Terms to exclude from results" className="mt-1 w-full border-0 p-0 text-xs font-normal normal-case text-[#1F2937] outline-none" /></label><label className="rounded-md bg-white p-2 text-[10px] font-semibold uppercase tracking-wide text-[#1E293B]">Exclude Job Title<input value={advancedDraft.excludeJobTitle} onChange={(e) => updateAdvancedDraft({ excludeJobTitle: e.target.value })} placeholder="Job titles to exclude" className="mt-1 w-full border-0 p-0 text-xs font-normal normal-case text-[#1F2937] outline-none" /></label><button onClick={() => { if (advancedProvider === 'Internal DB') runAdvancedSearch(); else showToast(`${advancedProvider} search is available as a frontend tab; external search is not connected.`); }} className="rounded-md bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2475E7]">SEARCH</button></div>}
        </div>
      </section>
      <section className="mx-auto grid max-w-[1500px] gap-8 px-5 py-6 md:grid-cols-2 md:px-10"><div><div className="mb-3 border-b-2 border-[#64748B] pb-2 text-[11px] font-semibold uppercase tracking-wide">Recent History</div>{advancedHistory.length ? <ul className="space-y-2">{advancedHistory.map((criteria, index) => <li key={index}><button onClick={() => runAdvancedSearch(criteria)} className="text-left text-[11px] text-[#1E293B] hover:underline">{[criteria.keywords && `(${criteria.keywords})`, criteria.jobTitle && `Job Title contains (${criteria.jobTitle})`, criteria.city, criteria.state, criteria.country].filter(Boolean).join(' · ') || 'Applicant search'}<span className="ml-2 text-[#8A96A5]">Run search</span></button></li>)}</ul> : <p className="text-xs text-[#64748B]">No recent searches.</p>}</div><div><div className="mb-3 flex items-center justify-between border-b-2 border-[#64748B] pb-2"><div className="text-[11px] font-semibold uppercase tracking-wide">Saved History</div><div className="flex gap-1"><input value={savedSearchName} onChange={(e) => setSavedSearchName(e.target.value)} placeholder="Search name" className="w-28 rounded border border-[#D8E3F1] bg-white px-2 py-1 text-[10px]" /><button onClick={saveAdvancedSearch} disabled={!savedSearchName.trim()} className="rounded bg-[#2563EB] px-2 py-1 text-[10px] font-semibold text-white disabled:opacity-40">Save Search</button></div></div>{savedAdvancedSearches.length ? <ul className="space-y-2">{savedAdvancedSearches.map((item) => <li key={item.name} className="flex items-center justify-between gap-2"><button onClick={() => runAdvancedSearch(item.criteria)} className="text-left text-[11px] text-[#1E293B] hover:underline">{item.name}</button><button onClick={() => { const saved = savedAdvancedSearches.filter((entry) => entry.name !== item.name); setSavedAdvancedSearches(saved); localStorage.setItem('ats_applicant_saved_searches', JSON.stringify(saved)); }} className="text-[10px] text-[#8793A0] hover:text-red-600">Remove</button></li>)}</ul> : <p className="text-xs text-[#64748B]">No saved searches.</p>}</div></section>
    </div>}
    {dialog && dialog !== 'advanced' && dialog !== 'import' && <div className={`fixed inset-0 z-[60] flex ${dialog === 'folder' ? 'justify-end' : 'items-center justify-center'} bg-black/45 ${dialog === 'folder' ? 'p-0' : 'p-4'}`} onClick={() => setDialog(null)}><div className={`drawer-panel flex w-full flex-col ${dialog === 'folder' ? 'h-full max-h-screen max-w-[380px] rounded-none' : `max-h-[92vh] ${dialog === 'view' ? 'max-w-5xl' : 'max-w-lg'} rounded-2xl`} overflow-hidden border border-[#D8E3F1] bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]`} onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-4 dark:border-[#334155]"><div><h2 className="font-bold text-[#1E293B] dark:text-white">{modalTitle}</h2>{dialog !== 'folder' && <p className="mt-1 text-[11px] text-[#64748B]">Applicant view configuration</p>}</div><button onClick={() => setDialog(null)} aria-label="Close"><X className="h-5 w-5 text-[#64748B]" /></button></div><div className={`${dialog === 'folder' ? 'min-h-0 flex-1 overflow-y-auto' : 'max-h-[calc(92vh-140px)] overflow-y-auto'} p-5 text-xs`}>
      {dialog === 'view' && <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5 border-r border-[#F1F5F9] pr-0 lg:pr-6 dark:border-[#334155]">
          <label className="block space-y-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#475569] dark:text-slate-300">Business Units<select value={viewBusinessUnit} onChange={(e) => setViewBusinessUnit(e.target.value)} className={fieldClass}><option>All Business Units</option>{currentUser?.businessUnit && <option>{currentUser.businessUnit}</option>}<option>Ampcus Tech Pvt Ltd.</option></select></label>
          <div><div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#475569] dark:text-slate-300">Pre-Defined Filters</div><label className="inline-flex items-center gap-2 rounded-md bg-[#EAF1FF] px-2 py-1.5 text-xs text-[#334155] dark:bg-[#0F172A] dark:text-white"><input type="checkbox" checked={viewGdprApproved} onChange={(e) => setViewGdprApproved(e.target.checked)} /> GDPR Approved Consent</label></div>
          <div><div className="mb-2 flex items-center justify-between"><div className="text-[10px] font-semibold uppercase tracking-wide text-[#475569] dark:text-slate-300">Field Level Filters</div><button onClick={() => setViewRulesDraft((rows) => [...rows, { id: `view-filter-${Date.now()}`, field: '', operator: '', value: '' }])} className="text-xs font-medium text-[#1E293B] dark:text-blue-400">Add Filter</button></div>
            <div className="space-y-2">{viewRulesDraft.map((rule) => <div key={rule.id} className="grid grid-cols-[1.1fr_.8fr_1fr_auto] gap-1.5"><select aria-label="View filter field" value={rule.field} onChange={(e) => setViewRulesDraft((rows) => rows.map((r) => r.id === rule.id ? { ...r, field: e.target.value, operator: '', value: '' } : r))} className={`${fieldClass} px-2`}><option value="">Select</option>{filterFields.map((field) => <option key={field}>{field}</option>)}</select><select aria-label="View filter operator" disabled={!rule.field} value={rule.operator} onChange={(e) => setViewRulesDraft((rows) => rows.map((r) => r.id === rule.id ? { ...r, operator: e.target.value } : r))} className={`${fieldClass} px-2`}><option value="">Select</option>{filterOperators.map((op) => <option key={op}>{op}</option>)}</select>{rule.operator && !['Is Null', 'Is Not Null'].includes(rule.operator) && <input aria-label="View filter value" value={rule.value} onChange={(e) => setViewRulesDraft((rows) => rows.map((r) => r.id === rule.id ? { ...r, value: e.target.value } : r))} placeholder="Value" className={`${fieldClass} px-2`} />}<button aria-label="Remove field filter" onClick={() => setViewRulesDraft((rows) => rows.filter((r) => r.id !== rule.id))} className="px-1 text-[#D14D56]"><X className="h-4 w-4" /></button></div>)}</div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3"><label className="flex-1 space-y-1.5 text-xs font-medium text-[#475569] dark:text-slate-300">Custom View Name<input autoFocus value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Custom View Name" className={fieldClass} /></label><label className="mt-5 flex items-center gap-2 whitespace-nowrap text-xs text-[#6D7988] dark:text-slate-400">Make Default<input type="checkbox" checked={makeViewDefault} onChange={(e) => setMakeViewDefault(e.target.checked)} /></label></div>
          <details className="group rounded-md border border-[#D8E3F1] dark:border-[#334155]"><summary className="cursor-pointer list-none px-3 py-2.5 text-xs text-[#475569] dark:text-[#FFFFFF]">{viewColumnsDraft.length} of {allApplicantColumns.length} selected <ChevronRight className="float-right h-4 w-4 transition-transform group-open:rotate-90" /></summary><div className="max-h-48 overflow-y-auto border-t border-[#F1F5F9] p-2 dark:border-[#334155]"><div className="grid grid-cols-2 gap-1">{allApplicantColumns.map((column) => <label key={column} className="flex items-center gap-2 rounded px-2 py-1.5 text-[11px] text-[#475569] hover:bg-[#FFFFFF] dark:text-[#FFFFFF] dark:hover:bg-[#334155]"><input type="checkbox" checked={viewColumnsDraft.includes(column)} onChange={(e) => setViewColumnsDraft((cols) => e.target.checked ? [...cols, column] : cols.filter((x) => x !== column))} />{column}</label>)}</div></div></details>
          <div><div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#475569] dark:text-slate-300">Selected Columns</div><div className="max-h-[46vh] space-y-1.5 overflow-y-auto">{viewColumnsDraft.map((column, index) => <div key={column} className="flex items-center gap-2 rounded border border-[#EDF0F4] bg-[#F2F3F5] px-2 py-1.5 text-xs text-[#334155] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"><GripVertical className="h-4 w-4 shrink-0 text-[#64748B] dark:text-slate-400" /><span className="flex-1">{column}</span><button aria-label={`Move ${column} up`} disabled={index === 0} onClick={() => setViewColumnsDraft((cols) => { const next = [...cols]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; })} className="px-1 text-[#64748B] disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button><button aria-label={`Move ${column} down`} disabled={index === viewColumnsDraft.length - 1} onClick={() => setViewColumnsDraft((cols) => { const next = [...cols]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; return next; })} className="px-1 text-[#64748B] disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button><button aria-label={`Remove ${column}`} onClick={() => setViewColumnsDraft((cols) => cols.filter((x) => x !== column))} className="px-1 text-[#64748B] hover:text-[#D14D56]"><X className="h-4 w-4" /></button></div>)}{viewColumnsDraft.length === 0 && <p className="rounded bg-[#FFFFFF] p-3 text-[11px] text-[#64748B] dark:bg-[#0F172A] dark:text-slate-400">Choose at least one column to show in the applicant list.</p>}</div></div>
        </div>
      </div>}
      {dialog === 'folder' && <div className="space-y-4">
        <label className="block space-y-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#475569] dark:text-slate-300">Business Units<select value={viewBusinessUnit} onChange={(e) => setViewBusinessUnit(e.target.value)} className={fieldClass}><option>All Business Units</option>{currentUser?.businessUnit && <option>{currentUser.businessUnit}</option>}<option>Ampcus Tech Pvt Ltd.</option></select></label>
        <label className="block space-y-1.5 text-xs font-medium text-[#475569] dark:text-slate-300">Folder Name<input autoFocus value={nameInput} onChange={(e) => setNameInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveViewOrFolder()} placeholder="Folder Name" className={fieldClass} /></label>
        <details className="group rounded-md border border-[#D8E3F1] dark:border-[#334155]"><summary className="cursor-pointer list-none px-3 py-2.5 text-xs text-[#475569] dark:text-[#FFFFFF]">{viewColumnsDraft.length} of {allApplicantColumns.length} selected <ChevronRight className="float-right h-4 w-4 transition-transform group-open:rotate-90" /></summary><div className="max-h-56 overflow-y-auto border-t border-[#F1F5F9] p-2 dark:border-[#334155]"><div className="grid grid-cols-2 gap-1">{allApplicantColumns.map((column) => <label key={column} className="flex items-center gap-2 rounded px-2 py-1.5 text-[11px] text-[#475569] hover:bg-[#FFFFFF] dark:text-[#FFFFFF] dark:hover:bg-[#334155]"><input type="checkbox" checked={viewColumnsDraft.includes(column)} onChange={(e) => setViewColumnsDraft((cols) => e.target.checked ? [...cols, column] : cols.filter((x) => x !== column))} />{column}</label>)}</div></div></details>
        <div><div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#475569] dark:text-slate-300">Selected Columns</div><div className="space-y-1.5">{viewColumnsDraft.map((column) => <div key={column} className="flex items-center gap-2 rounded border border-[#EDF0F4] bg-[#F2F3F5] px-2 py-2 text-xs text-[#334155] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"><GripVertical className="h-4 w-4 shrink-0 text-[#64748B] dark:text-slate-400" /><span className="flex-1">{column}</span><button aria-label={`Remove ${column}`} onClick={() => setViewColumnsDraft((cols) => cols.filter((x) => x !== column))} className="px-1 text-[#64748B] hover:text-[#D14D56]"><X className="h-4 w-4" /></button></div>)}{viewColumnsDraft.length === 0 && <p className="rounded bg-[#FFFFFF] p-3 text-[11px] text-[#64748B] dark:bg-[#0F172A] dark:text-slate-400">Choose at least one column to show in this folder.</p>}</div></div>
      </div>}
      {dialog === 'columns' && <><p className="text-[11px] text-[#64748B] dark:text-slate-300">Choose which applicant fields appear in the roster table.</p><div className="grid grid-cols-2 gap-2">{allApplicantColumns.map((column) => <label key={column} className="flex items-center gap-2 rounded-lg border border-[#F1F5F9] px-3 py-2 text-xs text-[#475569] dark:border-[#334155] dark:text-[#FFFFFF]"><input type="checkbox" checked={visibleColumns.includes(column)} onChange={(e) => setVisibleColumns((cols) => e.target.checked ? [...cols, column] : cols.filter((x) => x !== column))} />{column}</label>)}</div></>}
      {dialog === 'ticket' && <><label className="block space-y-1 text-[#64748B] dark:text-slate-300">Request type<select value={ticketType} onChange={(e) => setTicketType(e.target.value)} className={fieldClass}><option>Candidate follow-up</option><option>Resume review</option><option>Interview coordination</option><option>Data correction</option><option>System support</option></select></label><label className="block space-y-1 text-[#64748B] dark:text-slate-300">Ticket title<input value={ticketTitle} onChange={(e) => setTicketTitle(e.target.value)} placeholder="Enter a short ticket title" className={fieldClass} /></label><label className="block space-y-1 text-[#64748B] dark:text-slate-300">Priority<select value={ticketPriority} onChange={(e) => setTicketPriority(e.target.value)} className={fieldClass}><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select></label><label className="block space-y-1 text-[#64748B] dark:text-slate-300">Ticket description<textarea rows={4} value={ticketDescription} onChange={(e) => setTicketDescription(e.target.value)} placeholder="Describe the request and any relevant context" className={fieldClass} /></label><label className="block space-y-1 text-[#64748B] dark:text-slate-300">Applicant (optional)<select className={fieldClass}><option>Select applicant</option>{applicants.map((a) => <option key={a.id}>{a.name}</option>)}</select></label><label className="block space-y-1 text-[#64748B] dark:text-slate-300">Attachments<input type="file" multiple className="block w-full text-[11px] text-slate-500 dark:text-slate-300" /></label></>}
      <div className={`${dialog === 'folder' ? 'sticky bottom-0 bg-white px-5 py-3 dark:bg-[#1E293B]' : ''} flex justify-end gap-2 border-t border-[#F1F5F9] pt-4 dark:border-[#334155]`}><button onClick={() => setDialog(null)} className={buttonClass}>Cancel</button>{dialog === 'view' || dialog === 'folder' ? <button disabled={(dialog === 'view' && (!nameInput.trim() || viewColumnsDraft.length === 0)) || (dialog === 'folder' && (!nameInput.trim() || viewColumnsDraft.length === 0))} onClick={saveViewOrFolder} className="rounded-lg bg-[#2563EB] px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{dialog === 'view' ? 'Save view' : 'Create folder'}</button> : dialog === 'columns' ? <button onClick={() => { localStorage.setItem('ats_applicant_columns', JSON.stringify(visibleColumns)); setDialog(null); showToast('Applicant columns updated.'); }} className="rounded-lg bg-[#2563EB] px-4 py-2 font-semibold text-white">Save columns</button> : <button onClick={() => { if (!ticketTitle.trim()) return; const tickets = JSON.parse(localStorage.getItem('ats_applicant_tickets') || '[]'); localStorage.setItem('ats_applicant_tickets', JSON.stringify([{ id: `T-${Date.now()}`, title: ticketTitle.trim(), type: ticketType, priority: ticketPriority, description: ticketDescription, createdAt: new Date().toISOString() }, ...tickets])); setDialog(null); setTicketTitle(''); setTicketDescription(''); showToast('Ticket created in this browser.'); }} className="rounded-lg bg-[#2563EB] px-4 py-2 font-semibold text-white">Create ticket</button>}</div>
    </div></div></div>}
      </>
    )}
  </div>;
};
