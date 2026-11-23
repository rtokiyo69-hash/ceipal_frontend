import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  User,
  Maximize2,
  ExternalLink,
  GraduationCap,
  Bookmark,
  Award,
  Languages,
  Building,
  MapPin,
  Mail,
  Phone,
  Eye,
  Briefcase,
  Star,
  Download,
  Share2,
  Settings,
  Pencil,
  Plus,
  Filter,
  CheckCircle,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Copy,
  Search,
  Check,
  CircleHelp,
  Building2,
  Clock,
  Calendar,
  Send,
  FileText,
  UserPlus
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { Applicant, Job, PipelineStage, Submission, getSubmissionStageIndex } from '../../types';
import { EmailRichTextEditor } from '../../components/common/EmailRichTextEditor';

export const ApplicantDetail: React.FC = () => {
  const { selectedId, navigate, currentUser } = useAppStore();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);
  const [activeSubTab, setActiveSubTab] = useState('Snapshot');
  const [dynamicTab, setDynamicTab] = useState('Activities');
  const baseSubTabs = [
    'Snapshot',
    'Personal Details',
    'Profession Details',
    'Employer Details',
    'Employment Test Results'
  ];
  const dynamicSubTabsPool = ['Email Merges', 'Activities', 'Email Activity', 'Hires', 'Surveys'];
  const currentDynamicTab = dynamicSubTabsPool.includes(activeSubTab) ? activeSubTab : dynamicTab;
  const [isTimelineDrawerOpen, setIsTimelineDrawerOpen] = useState(false);
  const [timelineDrawerTab, setTimelineDrawerTab] = useState<'all' | 'tasks' | 'notes' | 'email'>('all');
  const [activityFilter, setActivityFilter] = useState<'all' | 'messages' | 'documents' | 'downloads'>('all');
  const [activityPeriod, setActivityPeriod] = useState<'last-6-months' | 'older'>('last-6-months');
  const [skillsExpandedPersonal, setSkillsExpandedPersonal] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState<Record<string, any>>({});
  const [isResumePanelOpen, setIsResumePanelOpen] = useState(false);
  const [resumeFullscreen, setResumeFullscreen] = useState(false);
  const [moreSubTabsOpen, setMoreSubTabsOpen] = useState(false);
  const moreSubTabsRef = useRef<HTMLDivElement>(null);
  const candidateSearchRef = useRef<HTMLDivElement>(null);
  const candidateSearchInputRef = useRef<HTMLInputElement>(null);
  const [candidateSearchOpen, setCandidateSearchOpen] = useState(false);
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');
  const submitMenuRef = useRef<HTMLDivElement>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreSubTabsRef.current && !moreSubTabsRef.current.contains(event.target as Node)) {
        setMoreSubTabsOpen(false);
      }
      if (submitMenuRef.current && !submitMenuRef.current.contains(event.target as Node)) {
        setSubmitMenuOpen(false);
      }
      if (candidateSearchRef.current && !candidateSearchRef.current.contains(event.target as Node)) {
        setCandidateSearchOpen(false);
      }
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setAvatarMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [resumeTemplate, setResumeTemplate] = useState('Standard Corporate Template');
  const [noteJob, setNoteJob] = useState('');
  const [noteClient, setNoteClient] = useState('');
  const [noteContact, setNoteContact] = useState('');
  const [noteAction, setNoteAction] = useState('');
  const [noteRemindMe, setNoteRemindMe] = useState(false);
  const [noteSubject, setNoteSubject] = useState('');
  const [noteAddToTask, setNoteAddToTask] = useState(false);

  // Education state
  const [educationList, setEducationList] = useState([
    {
      id: 'edu-1',
      degree: 'Computer Science',
      institution: 'Nandha College of Technology, Erode',
      period: 'January 2013',
      isPrimary: true
    }
  ]);
  const [newDegree, setNewDegree] = useState('');
  const [newInstitution, setNewInstitution] = useState('');
  const [newEduPeriod, setNewEduPeriod] = useState('');

  // Certification state
  const [certificationsList, setCertificationsList] = useState<{ id: string; name: string; yearCompleted: string; comments: string }[]>([]);
  const [certForm, setCertForm] = useState({
    certification: '',
    yearCompleted: '',
    comments: ''
  });

  // Work experience state
  const [workExperiences, setWorkExperiences] = useState([
    {
      id: 'exp-1',
      company: 'Infosys Pvt LTD',
      designation: 'Technical Support Engineer (L2)',
      period: 'Start On October 1, 2021 | Till Date'
    },
    {
      id: 'exp-2',
      company: 'Infosys Pvt Ltd',
      designation: 'Developer - Windows Application (Omniverse)',
      period: 'Start On March 1, 2020 to September 30, 2021'
    },
    {
      id: 'exp-3',
      company: 'Val Genesis Pvt Ltd',
      designation: 'Developer - Validation Lifecycle Management System (VLMS)',
      period: 'Start On October 1, 2017 to February 29, 2020'
    }
  ]);
  const [newExpCompany, setNewExpCompany] = useState('');
  const [newExpDesignation, setNewExpDesignation] = useState('');
  const [newExpPeriod, setNewExpPeriod] = useState('');

  // Language state
  const [languagesList, setLanguagesList] = useState<{ id: string; language: string; read: boolean; speak: boolean; write: boolean }[]>([]);
  const [langForm, setLangForm] = useState({
    language: '',
    read: false,
    speak: false,
    write: false
  });

  // Employer Details state (Ceipal Replica)
  const [employerList, setEmployerList] = useState<{
    id: string;
    employeeName: string;
    employer: string;
    officeNumber: string;
    mobile: string;
    email: string;
    status: string;
  }[]>([]);
  const [empSourceType, setEmpSourceType] = useState<'new' | 'vendor'>('new');
  const [empFirstName, setEmpFirstName] = useState('');
  const [empLastName, setEmpLastName] = useState('');
  const [empEmployerName, setEmpEmployerName] = useState('');
  const [empOfficeNumber, setEmpOfficeNumber] = useState('');
  const [empExtension, setEmpExtension] = useState('');
  const [empEmailId, setEmpEmailId] = useState('');
  const [empMobileNumber, setEmpMobileNumber] = useState('');
  const [empTypeSelect, setEmpTypeSelect] = useState('Select Status');
  const [selectedVendorContact, setSelectedVendorContact] = useState('');
  const [vendorSearchOpen, setVendorSearchOpen] = useState(false);
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [empModalError, setEmpModalError] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const [vendorContactList, setVendorContactList] = useState([
    {
      id: 'v-gayatri',
      displayName: 'Gayatri-Vivek Barai (kalaivanangovindh12@gmail.com)',
      name: 'Gayatri-Vivek Barai',
      firstName: 'Gayatri',
      lastName: 'Vivek Barai',
      company: 'Gayatri',
      office: '+1 408-555-0188',
      ext: '102',
      email: 'kalaivanangovindh12@gmail.com',
      mobile: '+91 9423022606'
    },
    {
      id: 'v1',
      displayName: 'Infosys BPM - Sivakrishnan D (hr@infosys.com)',
      name: 'Infosys BPM',
      firstName: 'Sivakrishnan',
      lastName: 'D',
      company: 'Infosys Pvt LTD',
      office: '+1 408-555-0199',
      ext: '104',
      email: 'hr@infosys.com',
      mobile: '+1 408-777-8899'
    },
    {
      id: 'v2',
      displayName: 'Apex Systems Corp - David Miller (dmiller@apexsystems.com)',
      name: 'Apex Systems Corp',
      firstName: 'David',
      lastName: 'Miller',
      company: 'Apex Systems',
      office: '+1 804-555-2244',
      ext: '210',
      email: 'dmiller@apexsystems.com',
      mobile: '+1 804-998-1122'
    },
    {
      id: 'v3',
      displayName: 'TEKsystems Inc - Sarah Connor (sconnor@teksystems.com)',
      name: 'TEKsystems Inc',
      firstName: 'Sarah',
      lastName: 'Connor',
      company: 'TEKsystems Inc',
      office: '+1 410-555-8833',
      ext: '405',
      email: 'sconnor@teksystems.com',
      mobile: '+1 410-664-9900'
    }
  ]);
  const [activeNotesFilter, setActiveNotesFilter] = useState<'applicants' | 'submissions' | 'pipeline'>('applicants');
  const [notesFilterOpen, setNotesFilterOpen] = useState(false);
  const [notesSearch, setNotesSearch] = useState('');
  const [notesAuthorFilter, setNotesAuthorFilter] = useState('');
  const [notesPriorityFilter, setNotesPriorityFilter] = useState('');
  const [notesDateFrom, setNotesDateFrom] = useState('');
  const [notesDateTo, setNotesDateTo] = useState('');
  const [activeSubmissionsFilter, setActiveSubmissionsFilter] = useState<'pipeline' | 'all' | 'client' | 'interview' | 'confirmation' | 'placement' | 'not-joined'>('all');
  const [submissionRecords, setSubmissionRecords] = useState<Submission[]>([]);
  const [quickViewJob, setQuickViewJob] = useState<Job | null>(null);
  const [quickViewTab, setQuickViewTab] = useState<'details' | 'skills' | 'notes' | 'email'>('details');
  const [headerViewMode, setHeaderViewMode] = useState<'applicant' | 'submission'>('applicant');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState({ top: 0, left: 0, maxHeight: 256 });
  const actionMenuButtonRef = useRef<HTMLButtonElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [submitMenuOpen, setSubmitMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [avatarEditOpen, setAvatarEditOpen] = useState(false);
  const [avatarZoomOpen, setAvatarZoomOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Dialog states
  const [dialog, setDialog] = useState<
    | 'edit'
    | 'resume'
    | 'matching-jobs'
    | 'submit-to-job'
    | 'applicant-submission'
    | 'tag-to-job'
    | 'quick-tag-to-job'
    | 'quick-submit'
    | 'task'
    | 'note'
    | 'call-log'
    | 'meeting'
    | 'email'
    | 'rating'
    | 'status'
    | 'tag'
    | 'add-education'
    | 'add-work-exp'
    | 'add-employer'
    | 'confirm-vendor-create'
    | 'create-resume'
    | null
  >(null);

  // Form states
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editExperience, setEditExperience] = useState(0);
  const [editSkills, setEditSkills] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [noteEditorResetKey, setNoteEditorResetKey] = useState(0);
  const [newNotePriority, setNewNotePriority] = useState('Medium');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [newTaskType, setNewTaskType] = useState('Follow-up');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('Not Started');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Me');
  const [newTaskReminder, setNewTaskReminder] = useState('None');
  const [applicantTasks, setApplicantTasks] = useState<{ title: string; description: string; due: string; status: string; assignee: string }[]>([]);
  const [newCallType, setNewCallType] = useState('Call');
  const [newCallDate, setNewCallDate] = useState('');
  const [newCallComments, setNewCallComments] = useState('');
  const [newCallFollowUp, setNewCallFollowUp] = useState('');
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingDescription, setNewMeetingDescription] = useState('');
  const [newMeetingMode, setNewMeetingMode] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [newMeetingTime, setNewMeetingTime] = useState('');
  const [newMeetingDuration, setNewMeetingDuration] = useState('30 mins');
  const [newMeetingGuests, setNewMeetingGuests] = useState('');
  const [emailFrom, setEmailFrom] = useState('System (noreply@ats.local)');
  const [emailTo, setEmailTo] = useState('');
  const [emailCc, setEmailCc] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailAttachments, setEmailAttachments] = useState<File[]>([]);
  const [emailTheme, setEmailTheme] = useState('');
  const [emailSalutation, setEmailSalutation] = useState('Hi [FirstName]');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [emailEditorResetKey, setEmailEditorResetKey] = useState(0);
  const [emailActivityTypeFilter, setEmailActivityTypeFilter] = useState('All Types');
  const [emailActivityPeriod, setEmailActivityPeriod] = useState('Last 6 Months');
  const [emailActivitySearch, setEmailActivitySearch] = useState('');
  const [emailActivityPageSize, setEmailActivityPageSize] = useState(10);
  const [emailActivityPage, setEmailActivityPage] = useState(0);
  const [emailActivityExpandedId, setEmailActivityExpandedId] = useState<string | null>(null);
  const [submissionJobs, setSubmissionJobs] = useState<Job[]>([]);
  const [submissionJobSearch, setSubmissionJobSearch] = useState('');
  const [submissionBusinessUnit, setSubmissionBusinessUnit] = useState('Ampcus Tech Pvt Ltd.');
  const [submissionAssignedJobsOnly, setSubmissionAssignedJobsOnly] = useState(false);
  const [selectedSubmissionJobIds, setSelectedSubmissionJobIds] = useState<string[]>([]);
  const [submissionNoticePeriod, setSubmissionNoticePeriod] = useState('');
  const [submissionRelocation, setSubmissionRelocation] = useState<'Yes' | 'No'>('Yes');
  const [submissionVideoLink, setSubmissionVideoLink] = useState('');
  const [submissionCurrency, setSubmissionCurrency] = useState('INR');
  const [submissionBillRate, setSubmissionBillRate] = useState('');
  const [submissionRateType, setSubmissionRateType] = useState('Yearly');
  const [submissionResumeName, setSubmissionResumeName] = useState('');
  const [submissionResumeFile, setSubmissionResumeFile] = useState<File | null>(null);
  const [submissionAdditionalAttachments, setSubmissionAdditionalAttachments] = useState<File[]>([]);
  const [submissionEForm, setSubmissionEForm] = useState('');
  const [submissionRecipients, setSubmissionRecipients] = useState('');
  const [submissionNotifiers, setSubmissionNotifiers] = useState('');
  const [submissionOtherEmails, setSubmissionOtherEmails] = useState('');
  const [submissionComments, setSubmissionComments] = useState('');
  const [submissionSkillsExpanded, setSubmissionSkillsExpanded] = useState(false);
  const [submissionReferenceExpanded, setSubmissionReferenceExpanded] = useState(false);
  const [submissionEmployerExpanded, setSubmissionEmployerExpanded] = useState(false);
  const [submissionDocumentsExpanded, setSubmissionDocumentsExpanded] = useState(false);
  const [submissionEmailPreviewOpen, setSubmissionEmailPreviewOpen] = useState(false);
  const [submissionSkillDraft, setSubmissionSkillDraft] = useState('');
  const [submissionSkills, setSubmissionSkills] = useState<{ skill: string; years: string }[]>([]);
  const [submissionReference, setSubmissionReference] = useState({ name: '', company: '', contact: '', email: '', type: '', years: '', summary: '' });
  const [submissionEmployer, setSubmissionEmployer] = useState({ mode: 'Active Employer', name: applicant?.currentCompany || '', firstName: '', lastName: '', office: '', mobile: '', email: '' });
  const [jobActionSearch, setJobActionSearch] = useState('');
  const [jobActionDropdownOpen, setJobActionDropdownOpen] = useState(false);
  const [jobActionSelectedJobId, setJobActionSelectedJobId] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Immediate Joiner', 'Verified']);
  const [editStatusValue, setEditStatusValue] = useState('');
  const [editGroupValue, setEditGroupValue] = useState('');

  // Ratings state
  const [ratings, setRatings] = useState({
    technical: 4,
    communication: 4,
    professionalism: 5,
    overall: 4
  });
  const [documentFormOpen, setDocumentFormOpen] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [documentMenuId, setDocumentMenuId] = useState<string | null>(null);
  const [documentShareOpen, setDocumentShareOpen] = useState(false);
  const [documentShareRecipient, setDocumentShareRecipient] = useState('');

  // Call logs and meetings
  const [callLogs, setCallLogs] = useState<{ type: string; comments: string; followUp: string; date: string; by: string }[]>([]);
  const [meetings, setMeetings] = useState<{ title: string; description: string; attendees: string; guests: string; time: string; by: string }[]>([]);

  useEffect(() => {
    setSelectedDocumentIds([]);
    setDocumentMenuId(null);
    setDocumentShareOpen(false);
    ApiService.getApplicants().then((list) => {
      setAllApplicants(list);
      if (selectedId) {
        const found = list.find((a) => a.id === selectedId || a.applicantId === selectedId);
        if (found) {
          setApplicant(found);
          initApplicantFields(found);
          return;
        }
      }
      if (list.length > 0) {
        setApplicant(list[0]);
        initApplicantFields(list[0]);
      }
    });
  }, [selectedId]);

  useEffect(() => {
    ApiService.getJobs().then((jobs) => {
      setSubmissionJobs(jobs);
      if (!jobs.some((job) => job.businessUnit === 'Ampcus Tech Pvt Ltd.')) setSubmissionBusinessUnit('All Business Units');
    });
    ApiService.getSubmissions().then(setSubmissionRecords);
    const syncSubmissions = (event: Event) => {
      const records = (event as CustomEvent<Submission[]>).detail;
      if (Array.isArray(records)) setSubmissionRecords(records);
      else ApiService.getSubmissions().then(setSubmissionRecords);
    };
    const syncFromOtherTab = (event: StorageEvent) => {
      if (event.key === 'talentember_submissions') ApiService.getSubmissions().then(setSubmissionRecords);
    };
    window.addEventListener('ats:submissions-changed', syncSubmissions);
    window.addEventListener('storage', syncFromOtherTab);
    return () => {
      window.removeEventListener('ats:submissions-changed', syncSubmissions);
      window.removeEventListener('storage', syncFromOtherTab);
    };
  }, []);

  const initApplicantFields = (app: Applicant) => {
    setEditName(app.name);
    setEditEmail(app.email);
    setEditPhone(app.phone);
    setEditDesignation(app.currentDesignation);
    setEditLocation(app.location);
    setEditExperience(app.experienceYears || 0);
    setEditSkills(app.skills.join(', '));
    setEditStatusValue(app.status || 'New');
    setEditGroupValue(app.applicantGroup || 'N/A');
  };

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useLayoutEffect(() => {
    if (!actionMenuOpen || !actionMenuButtonRef.current || !actionMenuRef.current) return;

    const buttonRect = actionMenuButtonRef.current.getBoundingClientRect();
    const menuRect = actionMenuRef.current.getBoundingClientRect();
    const viewportPadding = 8;
    const preferredHeight = Math.min(256, window.innerHeight - viewportPadding * 2);
    const availableBelow = window.innerHeight - buttonRect.bottom - viewportPadding;
    const availableAbove = buttonRect.top - viewportPadding;
    const openAbove = menuRect.height > availableBelow && availableAbove > availableBelow;
    const maxHeight = Math.max(0, Math.min(preferredHeight, openAbove ? availableAbove - 4 : availableBelow - 4));
    const left = Math.max(
      viewportPadding,
      Math.min(buttonRect.left, window.innerWidth - menuRect.width - viewportPadding)
    );

    setActionMenuPosition({
      top: openAbove ? buttonRect.top - maxHeight - 4 : buttonRect.bottom + 4,
      left,
      maxHeight
    });
  }, [actionMenuOpen]);

  useEffect(() => {
    if (!actionMenuOpen) return;

    const closeMenu = () => setActionMenuOpen(false);
    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        !actionMenuButtonRef.current?.contains(target) &&
        !actionMenuRef.current?.contains(target)
      ) {
        closeMenu();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    const handleScroll = (event: Event) => {
      if (!(event.target instanceof Node) || !actionMenuRef.current?.contains(event.target)) {
        closeMenu();
      }
    };

    document.addEventListener('pointerdown', handleOutsidePointer);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', closeMenu);

    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', closeMenu);
    };
  }, [actionMenuOpen]);

  const openSubmissionJobQuickView = async (submission: Submission) => {
    const job = await ApiService.getJobById(submission.jobId);
    if (!job) { showToast('The associated job posting could not be found.'); return; }
    setQuickViewJob(job);
    setQuickViewTab('details');
  };

  if (!applicant) {
    return (
      <div className="flex h-96 items-center justify-center p-8 text-xs text-[#64748B]">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#2F80ED] border-t-transparent" />
          <span>Loading applicant profile dossier...</span>
        </div>
      </div>
    );
  }

  // Prev / Next Candidate Navigation
  const currentIndex = allApplicants.findIndex((a) => a.id === applicant.id);
  const handlePrevCandidate = () => {
    if (currentIndex > 0) {
      const prev = allApplicants[currentIndex - 1];
      navigate('applicant-detail', prev.id);
    }
  };
  const handleNextCandidate = () => {
    if (currentIndex < allApplicants.length - 1) {
      const next = allApplicants[currentIndex + 1];
      navigate('applicant-detail', next.id);
    }
  };

  const matchingApplicants = candidateSearchQuery.trim().length >= 3
    ? allApplicants.filter((candidate) => `${candidate.name} ${candidate.applicantId} ${candidate.email}`.toLowerCase().includes(candidateSearchQuery.trim().toLowerCase())).slice(0, 8)
    : [];
  const selectSearchedApplicant = (candidate: Applicant) => {
    setApplicant(candidate);
    initApplicantFields(candidate);
    setCandidateSearchQuery('');
    setCandidateSearchOpen(false);
    navigate('applicant-detail', candidate.id);
  };

  const handleToggleFavorite = async () => {
    const isFav = await ApiService.toggleFavorite(applicant.id);
    setApplicant((prev) => (prev ? { ...prev, isFavorite: isFav } : prev));
    showToast(isFav ? 'Added to Favorites' : 'Removed from Favorites');
  };

  const handleSaveProfile = async () => {
    const updatedSkills = editSkills.split(',').map((s) => s.trim()).filter(Boolean);
    const updates = {
      name: editName,
      email: editEmail,
      phone: editPhone,
      currentDesignation: editDesignation,
      location: editLocation,
      experienceYears: Number(editExperience) || 0,
      skills: updatedSkills
    };
    const updated = { ...applicant, ...updates };
    setApplicant(updated);
    await ApiService.updateApplicant(applicant.id, updates);
    setDialog(null);
    showToast('Applicant profile updated successfully.');
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim() && !noteSubject.trim()) {
      showToast('Please enter note contents.');
      return;
    }
    const noteTextContent = newNoteText
      .replace(/<br\s*\/?\s*>/gi, '\n')
      .replace(/<\/(p|div|li)>/gi, '\n')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .trim() || noteSubject.trim();
    const noteObj = {
      id: `nt-${Date.now()}`,
      author: currentUser?.name || 'Ganesh Kshirsagar',
      text: noteTextContent,
      subject: noteSubject || `New Note Created for ${displayName} - ${displayId}.`,
      priority: newNotePriority || 'Medium',
      job: noteJob || undefined,
      client: noteClient || undefined,
      action: noteAction || undefined,
      date: new Date().toLocaleString()
    };
    const updatedNotes = [noteObj, ...(applicant.notes || [])];
    const updated = { ...applicant, notes: updatedNotes };
    setApplicant(updated);
    setAllApplicants((prev) => prev.map((a) => (a.id === applicant.id || a.applicantId === applicant.applicantId ? updated : a)));
    try {
      await ApiService.updateApplicant(applicant.id, { notes: updatedNotes });
    } catch (e) {
      console.warn('Note persist warning:', e);
    }
    setNewNoteText('');
    setNoteEditorResetKey((key) => key + 1);
    setDialog(null);
    showToast('Note added successfully.');
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    if (!tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
    }
    setNewTagInput('');
    setDialog(null);
    showToast('Tag added.');
  };

  const handleUpdateStatus = async (newStatus: PipelineStage) => {
    setApplicant((prev) => (prev ? { ...prev, status: newStatus } : prev));
    await ApiService.updateApplicantStage(applicant.id, newStatus);
    setDialog(null);
    showToast(`Applicant status changed to "${newStatus}"`);
  };

  const avatarInitial = applicant.name.charAt(0).toUpperCase() || 'A';
  const openAvatarEditor = () => {
    setAvatarMenuOpen(false);
    setAvatarPreview(applicant.avatar || '');
    if (avatarFileInputRef.current) avatarFileInputRef.current.value = '';
    setAvatarEditOpen(true);
  };
  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Choose an image file.', 'error'); return; }
    if (file.size > 2 * 1024 * 1024) { showToast('Choose an image smaller than 2 MB.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(String(reader.result || ''));
    reader.onerror = () => showToast('The selected image could not be read.', 'error');
    reader.readAsDataURL(file);
  };
  const saveApplicantAvatar = async () => {
    if (!avatarPreview) { showToast('Choose an image before saving.', 'error'); return; }
    try {
      const updated = await ApiService.updateApplicant(applicant.id, { avatar: avatarPreview });
      setApplicant(updated);
      setAllApplicants((items) => items.map((item) => item.id === updated.id ? updated : item));
      setAvatarEditOpen(false);
      showToast('Profile picture updated.');
    } catch {
      showToast('The profile picture could not be saved.', 'error');
    }
  };
  const startEditPersonal = () => {
    if (!applicant) return;
    const [fName = '', ...lNames] = (applicant.name || '').split(' ');
    setPersonalForm({
      firstName: applicant.firstName || fName || 'SIVAKRISHNAN',
      middleName: applicant.middleName || '',
      lastName: applicant.lastName || lNames.join(' ') || 'D',
      legalName: applicant.legalName || '',
      maidenName: applicant.maidenName || '',
      email: applicant.email || '',
      homePhone: applicant.homePhone || '',
      phone: applicant.phone || '',
      alternateEmail: applicant.alternateEmail || '',
      otherPhone: applicant.otherPhone || '',
      dateOfBirth: applicant.dateOfBirth || applicant.dob || '17/02/1993',
      workPhone: applicant.workPhone || '',
      facebookUrl: applicant.facebookUrl || '',
      twitterUrl: applicant.twitterUrl || '',
      linkedinUrl: applicant.linkedinUrl || '',
      workAuthorization: applicant.workAuthorization || '',
      address: applicant.address || '',
      videoReference: applicant.videoReference || '',
      state: applicant.state || 'Tamil Nadu',
      city: applicant.city || applicant.location?.split(',')[0]?.trim() || 'Coimbatore',
      country: applicant.country || 'India',
      source: applicant.source || 'Naukri',
      experienceYears: applicant.experienceYears || 9,
      zipCode: applicant.zipCode || '',
      referredBy: applicant.referredBy || '',
      status: applicant.status || 'New',
      relevantExperience: applicant.relevantExperience || '',
      assignedRecruiter: applicant.assignedRecruiter || applicant.ownership || 'Ganesh Kshirsagar',
      currentDesignation: applicant.currentDesignation || 'Technical Support Engineer (L2)',
      applicantGroup: applicant.applicantGroup || '',
      currentCTC: applicant.currentCTC || 'N/A',
      expectedCTC: applicant.expectedCTC || applicant.expectedSalary || 'N/A',
      currentCompany: applicant.currentCompany || 'Infosys PVT LTD',
      panCard: applicant.panCard || '',
      aadharNumber: applicant.aadharNumber || '',
      noticePeriod: applicant.noticePeriod || '',
      maritalStatus: applicant.maritalStatus || 'Single',
      preferredShift: applicant.preferredShift || 'Day',
      passportNumber: applicant.passportNumber || '',
      skills: (applicant.skills || []).join(', '),
      primarySkills: (applicant.primarySkills || []).join(', '),
      willingToRelocate: applicant.willingToRelocate !== false,
      technology: applicant.technology || '',
      industry: applicant.industry || '',
      nationality: applicant.nationality || 'Indian',
      referenceId: applicant.referenceId || '',
      applicantRemarks: applicant.applicantRemarks || '',
      noticeEligibility: applicant.noticeEligibility || '',
      gender: applicant.gender || '',
      raceEthnicity: applicant.raceEthnicity || '',
      veteranStatus: applicant.veteranStatus || '',
      disability: applicant.disability || '',
    });
    setActiveSubTab('Personal Details');
    setIsEditingPersonal(true);
  };

  const handleSavePersonal = async () => {
    if (!applicant) return;
    const fullName = `${personalForm.firstName || ''} ${personalForm.middleName || ''} ${personalForm.lastName || ''}`.replace(/\s+/g, ' ').trim() || applicant.name;
    const parsedSkills = typeof personalForm.skills === 'string'
      ? personalForm.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : applicant.skills;
    const parsedPrimary = typeof personalForm.primarySkills === 'string'
      ? personalForm.primarySkills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : applicant.primarySkills;

    const updatedApplicant: Applicant = {
      ...applicant,
      ...personalForm,
      name: fullName,
      skills: parsedSkills.length > 0 ? parsedSkills : applicant.skills,
      primarySkills: parsedPrimary,
      experienceYears: Number(personalForm.experienceYears) || applicant.experienceYears,
    };

    setApplicant(updatedApplicant);
    setAllApplicants((prev) => prev.map((a) => (a.id === applicant.id ? updatedApplicant : a)));
    try {
      await ApiService.updateApplicant(applicant.id, updatedApplicant);
    } catch (err) {
      console.warn('API update failed, preserved locally', err);
    }
    setIsEditingPersonal(false);
    showToast('Applicant details updated successfully');
  };

  const handleDownloadResume = () => {
    if (!applicant) return;
    const name = applicant.name || 'Candidate';
    const resumeText = `================================================
${name.toUpperCase()}
================================================
Location: ${applicant.location || 'Nashik, Maharashtra, India'}
Email:    ${applicant.email || 'applicant@email.com'}
Phone:    ${applicant.phone || '+91-XXXXXXXXXX'}

SUMMARY
${applicant.summary || 'Software Engineer with hands-on experience in full-stack web development and scalable system design. Skilled in modern engineering workflows, high-performance architectures, and user-centric applications.'}

EDUCATION
${educationList.map((e) => `- ${e.degree} | ${e.institution} (${e.period})`).join('\n')}
- HSC | LVH College, Nashik (2022) - 55%
- SSC | Ravindranath Vidyalaya, Nashik (2020) - 74%

TECHNICAL SKILLS
Languages:       JavaScript, Python, Java, C++, TypeScript
Frontend:        React.js, HTML, CSS, Tailwind CSS, Redux
Backend:         Node.js, Express.js, FastAPI, REST APIs
Core Skills:     ${(applicant.skills || []).join(', ')}

EXPERIENCE & PROJECTS
${workExperiences.map((w) => `- ${w.company}: ${w.designation} (${w.period})`).join('\n')}
- Fake News Detection System: NLP classification model with 92% accuracy using Python and Scikit-learn.
- Real-Time Collaboration Chat: WebSocket-based room chat with authentication.
`;
    const blob = new Blob([resumeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Resume_${name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Resume downloaded successfully');
  };

  const handleSaveCertification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.certification.trim() || !certForm.yearCompleted.trim()) {
      showToast('Please enter both Certification and Year Completed');
      return;
    }
    const newC = {
      id: `cert-${Date.now()}`,
      name: certForm.certification,
      yearCompleted: certForm.yearCompleted,
      comments: certForm.comments
    };
    setCertificationsList((prev) => [...prev, newC]);
    setCertForm({ certification: '', yearCompleted: '', comments: '' });
    showToast('Certification added successfully');
  };

  const handleResetCertification = () => {
    setCertForm({ certification: '', yearCompleted: '', comments: '' });
  };

  const handleSaveLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!langForm.language) {
      showToast('Please select a language');
      return;
    }
    if (!langForm.read && !langForm.speak && !langForm.write) {
      showToast('Please select at least one proficiency (Read, Speak, Write)');
      return;
    }
    const newL = {
      id: `lang-${Date.now()}`,
      language: langForm.language,
      read: langForm.read,
      speak: langForm.speak,
      write: langForm.write
    };
    setLanguagesList((prev) => [...prev, newL]);
    setLangForm({ language: '', read: false, speak: false, write: false });
    showToast('Language added successfully');
  };

  const handleResetLanguage = () => {
    setLangForm({ language: '', read: false, speak: false, write: false });
  };

  const handleAddEducation = () => {
    if (!newDegree.trim() || !newInstitution.trim()) {
      showToast('Please enter Degree and Institution');
      return;
    }
    setEducationList((prev) => [
      ...prev,
      {
        id: `edu-${Date.now()}`,
        degree: newDegree,
        institution: newInstitution,
        period: newEduPeriod || 'January 2013',
        isPrimary: false
      }
    ]);
    setNewDegree('');
    setNewInstitution('');
    setNewEduPeriod('');
    setDialog(null);
    showToast('Education added successfully');
  };

  const handleAddWorkExp = () => {
    if (!newExpCompany.trim() || !newExpDesignation.trim()) {
      showToast('Please enter Company and Designation');
      return;
    }
    setWorkExperiences((prev) => [
      {
        id: `exp-${Date.now()}`,
        company: newExpCompany,
        designation: newExpDesignation,
        period: newExpPeriod || 'Till Date'
      },
      ...prev
    ]);
    setNewExpCompany('');
    setNewExpDesignation('');
    setNewExpPeriod('');
    setDialog(null);
    showToast('Work experience added successfully');
  };

  const filteredVendors = vendorContactList.filter((v) => {
    const q = vendorSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      v.displayName.toLowerCase().includes(q) ||
      v.firstName.toLowerCase().includes(q) ||
      v.lastName.toLowerCase().includes(q) ||
      v.company.toLowerCase().includes(q) ||
      v.email.toLowerCase().includes(q)
    );
  });

  const handleSelectVendor = (v: (typeof vendorContactList)[0]) => {
    setSelectedVendorContact(v.id);
    setEmpFirstName(v.firstName);
    setEmpLastName(v.lastName);
    setEmpEmployerName(v.company);
    setEmpOfficeNumber(v.office);
    setEmpExtension(v.ext);
    setEmpEmailId(v.email);
    setEmpMobileNumber(v.mobile);
    setVendorSearchOpen(false);
    setEmpModalError(null);
  };

  const handleAddEmployer = () => {
    if (empSourceType === 'vendor') {
      if (!selectedVendorContact && !empEmployerName.trim()) {
        const errMsg = 'Please select a vendor contact or enter employer details';
        setEmpModalError(errMsg);
        showToast(errMsg, 'error');
        return;
      }
    } else {
      if (!empFirstName.trim() && !empEmployerName.trim()) {
        const errMsg = 'Please enter at least First Name or Employer Name';
        setEmpModalError(errMsg);
        showToast(errMsg, 'error');
        return;
      }
    }
    setEmpModalError(null);
    // Open Ceipal confirmation notification prompt
    setDialog('confirm-vendor-create');
  };

  const finalizeEmployerSave = (createVendorContact: boolean) => {
    const fullName = `${empFirstName} ${empLastName}`.trim();
    const officeDisplay = empOfficeNumber
      ? `${empOfficeNumber}${empExtension ? ` Ext: ${empExtension}` : ''}`
      : 'â€”';

    const newEmp = {
      id: `emp-${Date.now()}`,
      employeeName: fullName || empEmployerName || 'Employee',
      employer: empEmployerName || 'â€”',
      officeNumber: officeDisplay,
      mobile: empMobileNumber || 'â€”',
      email: empEmailId || 'â€”',
      status: (empTypeSelect === 'Select' || empTypeSelect === 'Select Status') ? 'Active' : empTypeSelect
    };

    setEmployerList((prev) => [...prev, newEmp]);

    if (createVendorContact) {
      if (empEmployerName) {
        setVendorContactList((prev) => [
          {
            id: `v-${Date.now()}`,
            displayName: `${empEmployerName} - ${fullName || empEmployerName} (${empEmailId || 'no email'})`,
            name: empEmployerName,
            firstName: empFirstName,
            lastName: empLastName,
            company: empEmployerName,
            office: empOfficeNumber,
            ext: empExtension,
            email: empEmailId,
            mobile: empMobileNumber
          },
          ...prev
        ]);
      }
      showToast('Employer details and Vendor contact created successfully', 'success');
    } else {
      showToast('Employer details saved successfully', 'success');
    }

    setEmpFirstName('');
    setEmpLastName('');
    setEmpEmployerName('');
    setEmpOfficeNumber('');
    setEmpExtension('');
    setEmpEmailId('');
    setEmpMobileNumber('');
    setEmpTypeSelect('Select Status');
    setSelectedVendorContact('');
    setEmpSourceType('new');
    setVendorSearchOpen(false);
    setVendorSearchQuery('');
    setEmpModalError(null);
    setDialog(null);
  };

  const applicantSubmissions = submissionRecords.filter((submission) => submission.applicantId === applicant.id || submission.applicantId === applicant.applicantId || submission.applicantName.toLowerCase() === applicant.name.toLowerCase());
  const noteEntries = [
    ...(applicant.notes || []).map((note) => ({ ...note, source: 'applicants' as const })),
    ...applicantSubmissions.flatMap((submission) => (submission.notes || []).map((note) => ({
      ...note,
      source: 'submissions' as const,
      job: submission.jobTitle,
      client: submission.client,
      priority: '',
      action: 'Submission'
    }))),
    ...applicantSubmissions.flatMap((submission) => (submission.statusHistory || [])
      .filter((entry) => Boolean(entry.comments?.trim()))
      .map((entry, index) => ({
        id: `${submission.id}-pipeline-${index}`,
        author: entry.changedBy || submission.recruiter || 'System',
        text: entry.comments || '',
        subject: `Pipeline update: ${entry.status}`,
        date: entry.changedAt,
        priority: '',
        job: submission.jobTitle,
        client: submission.client,
        action: entry.status,
        source: 'pipeline' as const
      })))
  ];
  const notesAuthorOptions = Array.from(new Set(noteEntries.map((note) => note.author).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const filteredNotes = noteEntries.filter((note) => {
    if (note.source !== activeNotesFilter) return false;
    if (notesAuthorFilter && note.author !== notesAuthorFilter) return false;
    if (notesPriorityFilter && (note.priority || 'Medium') !== notesPriorityFilter) return false;
    const searchText = `${note.subject || ''} ${note.text} ${note.author} ${note.job || ''} ${note.client || ''} ${note.action || ''}`.toLowerCase();
    if (notesSearch.trim() && !searchText.includes(notesSearch.trim().toLowerCase())) return false;
    const noteTimestamp = Date.parse(note.date);
    if (notesDateFrom && (!Number.isFinite(noteTimestamp) || noteTimestamp < new Date(`${notesDateFrom}T00:00:00`).getTime())) return false;
    if (notesDateTo && (!Number.isFinite(noteTimestamp) || noteTimestamp > new Date(`${notesDateTo}T23:59:59.999`).getTime())) return false;
    return true;
  });
  const notesSourceCounts = {
    applicants: noteEntries.filter((note) => note.source === 'applicants').length,
    submissions: noteEntries.filter((note) => note.source === 'submissions').length,
    pipeline: noteEntries.filter((note) => note.source === 'pipeline').length
  };
  const submissionCounts = {
    pipeline: applicantSubmissions.filter((submission) => getSubmissionStageIndex(submission.status) <= 1 && !/disqualified|rejected/i.test(submission.status)).length,
    all: applicantSubmissions.length,
    client: applicantSubmissions.filter((submission) => getSubmissionStageIndex(submission.status) === 2).length,
    interview: applicantSubmissions.filter((submission) => getSubmissionStageIndex(submission.status) === 3).length,
    confirmation: applicantSubmissions.filter((submission) => getSubmissionStageIndex(submission.status) === 4).length,
    placement: applicantSubmissions.filter((submission) => getSubmissionStageIndex(submission.status) === 5).length,
    'not-joined': applicantSubmissions.filter((submission) => getSubmissionStageIndex(submission.status) === 6).length
  };
  const filteredApplicantSubmissions = applicantSubmissions.filter((submission) => {
    if (activeSubmissionsFilter === 'all') return true;
    if (activeSubmissionsFilter === 'pipeline') return getSubmissionStageIndex(submission.status) <= 1 && !/disqualified|rejected/i.test(submission.status);
    const category = activeSubmissionsFilter === 'client' ? 2 : activeSubmissionsFilter === 'interview' ? 3 : activeSubmissionsFilter === 'confirmation' ? 4 : activeSubmissionsFilter === 'placement' ? 5 : 6;
    return getSubmissionStageIndex(submission.status) === category;
  });
  const displayId = applicant.applicantId || applicant.id?.slice(0, 6) || '165033';
  const displayName = applicant.name || 'Sahil Shirsath';
  const skillsList = applicant.skills && applicant.skills.length > 0
    ? applicant.skills
    : ['.NET FRAMEWORK', 'E-Commerce', 'Datadog', 'Root Cause Analysis', 'Salesforce Commerce Cloud'];
  const applicantDocuments = (applicant.documents || []).map((doc, index) => ({ ...doc, id: doc.id || `${applicant.id}-document-${index}` }));
  const persistApplicantDocuments = async (documents: NonNullable<Applicant['documents']>) => {
    const updated = { ...applicant, documents };
    setApplicant(updated);
    setAllApplicants((rows) => rows.map((row) => row.id === applicant.id ? updated : row));
    try { await ApiService.updateApplicant(applicant.id, { documents }); }
    catch { showToast('Document changes could not be saved.'); }
  };
  const downloadApplicantDocument = (doc: NonNullable<Applicant['documents']>[number]) => {
    const link = document.createElement('a');
    if (doc.dataUrl) link.href = doc.dataUrl;
    else link.href = URL.createObjectURL(new Blob([`Document: ${doc.name}\nApplicant: ${applicant.name}\n${doc.description || doc.comments || ''}`], { type: 'text/plain' }));
    link.download = doc.name;
    link.click();
    if (!doc.dataUrl) window.setTimeout(() => URL.revokeObjectURL(link.href), 60000);
  };
  const viewApplicantDocument = (doc: NonNullable<Applicant['documents']>[number]) => {
    if (doc.dataUrl) { window.open(doc.dataUrl, '_blank', 'noopener,noreferrer'); return; }
    const url = URL.createObjectURL(new Blob([`Document: ${doc.name}\nApplicant: ${applicant.name}\n${doc.description || doc.comments || 'No preview is available for this existing document.'}`], { type: 'text/plain' }));
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  };
  const handleDocumentUpload = async () => {
    if (!documentType) { showToast('Select a document type.'); return; }
    if (!documentFile) { showToast('Choose a document to upload.'); return; }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader(); reader.onload = () => resolve(String(reader.result || '')); reader.onerror = () => reject(reader.error); reader.readAsDataURL(documentFile);
    }).catch(() => '');
    if (!dataUrl) { showToast('The selected document could not be read.'); return; }
    const now = new Date().toLocaleString();
    const next = [...applicantDocuments, { id: `doc-${Date.now()}`, name: documentTitle.trim() || documentFile.name, title: documentTitle.trim() || documentFile.name, size: `${Math.max(1, Math.round(documentFile.size / 1024))} KB`, date: now, type: documentType, mimeType: documentFile.type, dataUrl, description: documentDescription.trim(), comments: documentDescription.trim() || 'N/A', createdBy: currentUser?.name || 'Current User', modifiedBy: currentUser?.name || 'Current User' }];
    await persistApplicantDocuments(next);
    setDocumentFormOpen(false); setDocumentTitle(''); setDocumentDescription(''); setDocumentFile(null); setDocumentType('');
    showToast('Document uploaded successfully.');
  };
  const runDocumentToolbarAction = async (action: 'download' | 'copy' | 'share') => {
    const selectedDocs = applicantDocuments.filter((doc) => selectedDocumentIds.includes(doc.id));
    if (!selectedDocs.length) { showToast('Select one or more documents first.'); return; }
    if (action === 'download') selectedDocs.forEach(downloadApplicantDocument);
    else if (action === 'copy') {
      const copies = selectedDocs.map((doc) => ({ ...doc, id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: `Copy of ${doc.name}`, title: `Copy of ${doc.title || doc.name}`, date: new Date().toLocaleString(), createdBy: currentUser?.name || 'Current User', modifiedBy: currentUser?.name || 'Current User' }));
      await persistApplicantDocuments([...applicantDocuments, ...copies]); showToast('Selected documents copied.');
    } else setDocumentShareOpen(true);
  };
  const shareApplicantDocuments = () => {
    if (!documentShareRecipient) { showToast('Choose a user to share with.'); return; }
    const records = JSON.parse(localStorage.getItem('ats_document_shares') || '[]') as { applicantId: string; documentIds: string[]; recipient: string; sharedAt: string }[];
    records.unshift({ applicantId: applicant.id, documentIds: selectedDocumentIds, recipient: documentShareRecipient, sharedAt: new Date().toISOString() });
    localStorage.setItem('ats_document_shares', JSON.stringify(records)); setDocumentShareOpen(false); setDocumentShareRecipient(''); showToast(`Documents shared with ${documentShareRecipient}.`);
  };

  const activityEvents = [
    {
      id: 'activity-submitted',
      category: 'all' as const,
      date: '20 Nov 2026',
      time: '16:49:41',
      description: `Applicant has been submitted to AMP7894 Â· ${applicant.currentDesignation || 'US IT Recruiter'}`,
      detail: 'by Jatin Jaiswal',
      icon: Send,
      iconClass: 'bg-blue-50 text-[#2F80ED] dark:bg-[#173B67]'
    },
    {
      id: 'activity-resume',
      category: 'documents' as const,
      date: '20 Nov 2026',
      time: '16:49:27',
      description: 'Uploaded a new resume Â· Mansi Talware.docx',
      detail: 'by US IT Recruiter (Night Shift)',
      icon: FileText,
      iconClass: 'bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300'
    },
    {
      id: 'activity-created',
      category: 'all' as const,
      date: '20 Nov 2026',
      time: '16:49:02',
      description: 'Applicant profile was created and the document was added from Resume Parse.',
      detail: 'System activity',
      icon: CheckCircle,
      iconClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300'
    },
    {
      id: 'activity-message',
      category: 'messages' as const,
      date: '19 Nov 2026',
      time: '11:24:16',
      description: 'Sent an interview availability message to the applicant.',
      detail: 'by US IT Recruiter',
      icon: Mail,
      iconClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300'
    },
    {
      id: 'activity-download',
      category: 'downloads' as const,
      date: '18 Nov 2026',
      time: '14:08:55',
      description: 'Downloaded the applicant resume for review.',
      detail: 'by Ganesh Godse',
      icon: Download,
      iconClass: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-300'
    },
    {
      id: 'activity-older',
      category: 'all' as const,
      date: '03 Apr 2026',
      time: '09:10:12',
      description: 'Applicant was added to the recruiting pipeline.',
      detail: 'System activity',
      icon: UserPlus,
      iconClass: 'bg-slate-100 text-slate-600 dark:bg-[#3A3A3A] dark:text-slate-300',
      older: true
    }
  ];

  const visibleActivityEvents = activityEvents.filter((event) => {
    const matchesCategory = activityFilter === 'all' || event.category === activityFilter;
    const matchesPeriod = activityPeriod === 'older' ? event.older : !event.older;
    return matchesCategory && matchesPeriod;
  });

  const openEmailComposer = () => {
    const firstName = displayName.split(/\s+/)[0] || displayName;
    setEmailTo(applicant.email || '');
    setEmailFrom('System (noreply@ats.local)');
    setEmailCc('');
    setEmailSubject('');
    setEmailBody(`Hi ${firstName},<br/><br/>`);
    setEmailAttachments([]);
    setEmailTheme('Blue');
    setEmailSalutation(`Hi ${firstName}`);
    setEmailTemplate('');
    setEmailEditorResetKey((key) => key + 1);
    setDialog('email');
  };

  const sendApplicantEmail = async () => {
    const recipients = emailTo.split(/[;,]/).map((address) => address.trim()).filter(Boolean);
    const ccRecipients = emailCc.split(/[;,]/).map((address) => address.trim()).filter(Boolean);
    if (!recipients.length || recipients.some((address) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))) {
      showToast('Enter a valid recipient email address.');
      return;
    }
    if (ccRecipients.some((address) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))) {
      showToast('Enter valid CC email addresses.');
      return;
    }
    if (!emailSubject.trim() || !emailBody.replace(/<[^>]*>/g, '').trim()) {
      showToast('Enter an email subject and message.');
      return;
    }
    const outgoing = JSON.parse(localStorage.getItem('ats_applicant_sent_emails') || '[]') as Array<Record<string, unknown>>;
    outgoing.unshift({ id: `email-${Date.now()}`, applicantId: applicant.id, type: 'Email', from: emailFrom, to: recipients, cc: ccRecipients, subject: emailSubject.trim(), body: emailBody, attachments: emailAttachments.map((file) => file.name), sentAt: new Date().toISOString() });
    localStorage.setItem('ats_applicant_sent_emails', JSON.stringify(outgoing));
    await ApiService.logActivity({ user: currentUser?.name || 'Recruiter', avatar: '', action: `sent an email: ${emailSubject.trim()}`, target: applicant.name, type: 'applicant' });
    setDialog(null);
    showToast('Email saved to sent items.');
  };

  const timelineDrawerEvents = activityEvents.filter((event) => {
    if (timelineDrawerTab === 'all') return true;
    if (timelineDrawerTab === 'email') return event.category === 'messages';
    return false;
  });

  let storedApplicantEmails: { id?: string; applicantId?: string; type?: string; from?: string; to?: string[]; cc?: string[]; subject?: string; body?: string; attachments?: string[]; sentAt?: string }[] = [];
  try {
    storedApplicantEmails = JSON.parse(localStorage.getItem('ats_applicant_sent_emails') || '[]');
  } catch {
    storedApplicantEmails = [];
  }
  const applicantEmailHistory = storedApplicantEmails.filter((email) => email.applicantId === applicant.id || email.applicantId === applicant.applicantId);
  const emailActivityTypes = Array.from(new Set(applicantEmailHistory.map((email) => email.type || 'Email')));
  const emailActivityFiltered = applicantEmailHistory.filter((email) => {
    const emailType = email.type || 'Email';
    if (emailActivityTypeFilter !== 'All Types' && emailType !== emailActivityTypeFilter) return false;
    const sentTime = email.sentAt ? new Date(email.sentAt).getTime() : NaN;
    const periodCutoff = emailActivityPeriod === 'All Time' ? 0 : (() => {
      const cutoff = new Date();
      if (emailActivityPeriod === 'Last 30 Days') cutoff.setDate(cutoff.getDate() - 30);
      else if (emailActivityPeriod === 'Last Year') cutoff.setFullYear(cutoff.getFullYear() - 1);
      else cutoff.setMonth(cutoff.getMonth() - 6);
      return cutoff.getTime();
    })();
    if (emailActivityPeriod !== 'All Time' && (!Number.isFinite(sentTime) || sentTime < periodCutoff)) return false;
    const searchText = `${email.subject || ''} ${email.from || ''} ${(email.to || []).join(' ')} ${(email.cc || []).join(' ')} ${email.body || ''} ${(email.attachments || []).join(' ')}`.replace(/<[^>]*>/g, ' ').toLowerCase();
    return !emailActivitySearch.trim() || searchText.includes(emailActivitySearch.trim().toLowerCase());
  });
  const emailActivityPageCount = Math.ceil(emailActivityFiltered.length / emailActivityPageSize);
  const visibleEmailActivity = emailActivityFiltered.slice(emailActivityPage * emailActivityPageSize, (emailActivityPage + 1) * emailActivityPageSize);
  const filteredSubmitJobs = submissionJobs.filter((job) => {
    const query = submissionJobSearch.trim().toLowerCase();
    const matchesSearch = !query || `${job.code} ${job.title} ${job.clientJobId || ''} ${job.client} ${job.location}`.toLowerCase().includes(query);
    const matchesBusinessUnit = submissionBusinessUnit === 'All Business Units' || job.businessUnit === submissionBusinessUnit;
    const matchesAssigned = !submissionAssignedJobsOnly || job.assignedRecruiter === currentUser?.name || job.recruiterId === currentUser?.id;
    return matchesSearch && matchesBusinessUnit && matchesAssigned && ['Open', 'Active', 'Sourcing', 'In Review'].includes(job.status);
  });

  const openSubmissionDetails = () => {
    if (!selectedSubmissionJobIds.length) { showToast('Select at least one job to continue.', 'error'); return; }
    const existingJobs = selectedSubmissionJobIds.filter((jobId) => applicantSubmissions.some((submission) => submission.jobId === jobId));
    const jobsToSubmit = selectedSubmissionJobIds.filter((jobId) => !existingJobs.includes(jobId));
    if (existingJobs.length) {
      setSelectedSubmissionJobIds(jobsToSubmit);
      if (!jobsToSubmit.length) { showToast('This applicant is already submitted to the selected job.', 'error'); return; }
      showToast('Already-submitted jobs were removed from the selection.', 'info');
    }
    const defaultResume = applicant.documents?.find((document) => /resume/i.test(`${document.type} ${document.name}`));
    setSubmissionResumeName(defaultResume?.name || '');
    setSubmissionEmailPreviewOpen(false);
    setSubmissionResumeFile(null);
    setSubmissionNoticePeriod(applicant.noticePeriod || '');
    setSubmissionRelocation(applicant.willingToRelocate === false ? 'No' : 'Yes');
    setSubmissionVideoLink('');
    setSubmissionCurrency('INR');
    setSubmissionBillRate('');
    setSubmissionRateType('Yearly');
    setSubmissionEForm('');
    setSubmissionRecipients('');
    setSubmissionNotifiers('');
    setSubmissionOtherEmails('');
    setSubmissionComments('');
    setSubmissionSkills((applicant.skills || []).map((skill) => ({ skill, years: '' })));
    setSubmissionReference({ name: '', company: '', contact: '', email: '', type: '', years: '', summary: '' });
    setSubmissionEmployer((previous) => ({ ...previous, name: applicant.currentCompany || '' }));
    setDialog('applicant-submission');
  };

  const submitApplicantToJobs = async () => {
    const jobIds = selectedSubmissionJobIds.filter((jobId) => !applicantSubmissions.some((submission) => submission.jobId === jobId));
    if (!jobIds.length) { showToast('Select a job that does not already have this applicant submitted.', 'error'); return; }
    if (!submissionNoticePeriod.trim()) { showToast('Enter the candidate notice period.', 'error'); return; }
    if (!submissionResumeName && !submissionResumeFile) { showToast('Select or upload a resume to submit.', 'error'); return; }
    try {
      const chosenJobs = jobIds.map((jobId) => submissionJobs.find((job) => job.id === jobId)).filter((job): job is Job => Boolean(job));
      for (const job of chosenJobs) {
        await ApiService.createSubmission({
          applicantId: applicant.id,
          applicantName: applicant.name,
          jobId: job.id,
          jobTitle: job.title,
          client: job.client,
          recruiter: currentUser?.name || job.assignedRecruiter,
          status: 'Waiting for Evaluation by Internal Reviewer',
          billRate: Number(submissionBillRate) || job.billRate || 0,
          payRate: job.payRate || 0,
          submissionDetails: {
            businessUnit: job.businessUnit,
            noticePeriod: submissionNoticePeriod,
            relocation: submissionRelocation,
            videoLink: submissionVideoLink,
            currency: submissionCurrency,
            rateType: submissionRateType,
            resume: submissionResumeFile?.name || submissionResumeName,
            additionalAttachments: submissionAdditionalAttachments.map((file) => file.name),
            eForm: submissionEForm,
            recipients: submissionRecipients,
            additionalNotifiers: submissionNotifiers,
            otherEmailIds: submissionOtherEmails,
            comments: submissionComments,
            skills: submissionSkills,
            ratings,
            reference: submissionReference,
            employer: submissionEmployer
          }
        });
      }
      setSubmissionRecords(await ApiService.getSubmissions());
      setDialog(null);
      setSelectedSubmissionJobIds([]);
      showToast(`Applicant submitted to ${chosenJobs.length} job${chosenJobs.length === 1 ? '' : 's'}.`);
    } catch {
      showToast('The applicant submission could not be saved. Please try again.', 'error');
    }
  };

  const openJobActionDialog = (action: 'tag-to-job' | 'quick-submit') => {
    setJobActionSearch('');
    setJobActionSelectedJobId('');
    setJobActionDropdownOpen(false);
    setDialog(action);
  };

  const completeJobAction = async () => {
    const job = submissionJobs.find((item) => item.id === jobActionSelectedJobId);
    if (!job) { showToast('Select a job first.', 'error'); return; }
    if (applicantSubmissions.some((submission) => submission.jobId === job.id)) {
      showToast('This applicant is already associated with the selected job.', 'error');
      return;
    }
    const isTag = dialog === 'tag-to-job' || dialog === 'quick-tag-to-job';
    try {
      await ApiService.createSubmission({
        applicantId: applicant.id,
        applicantName: applicant.name,
        jobId: job.id,
        jobTitle: job.title,
        client: job.client,
        recruiter: currentUser?.name || job.assignedRecruiter,
        billRate: job.billRate || 0,
        payRate: job.payRate || 0,
        status: isTag ? 'Pipeline' : 'Waiting for Evaluation by Internal Reviewer',
        submissionDetails: isTag ? { action: 'Tag to Job' } : { action: 'Quick Submit' }
      });
      setSubmissionRecords(await ApiService.getSubmissions());
      setDialog(null);
      showToast(isTag ? `${applicant.name} added to ${job.code} pipeline.` : `${applicant.name} submitted to ${job.code}.`);
    } catch {
      showToast(isTag ? 'The applicant could not be tagged to this job.' : 'The quick submission could not be saved.', 'error');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F4F6F9] text-[#222] dark:bg-[#1A1A1A] dark:text-[#E0E0E0]">
      {/* Toast Notification - z-[9999] so it's always visible above all modals/dialogs */}
      {toastMessage && (
        <div
          className={`fixed right-6 top-6 z-[9999] flex items-center gap-2.5 rounded-lg border px-4 py-3 text-xs font-medium text-white shadow-2xl transition-all duration-200 animate-in fade-in slide-in-from-top-4 ${
            toastType === 'error'
              ? 'border-red-600 bg-red-600 shadow-red-500/20'
              : toastType === 'info'
              ? 'border-blue-600 bg-blue-600 shadow-blue-500/20'
              : 'border-[#2F80ED] bg-[#2F80ED] shadow-blue-500/20'
          }`}
        >
          {toastType === 'error' ? (
            <AlertCircle className="h-4 w-4 shrink-0 text-white" />
          ) : (
            <CheckCircle className="h-4 w-4 shrink-0 text-white" />
          )}
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-white/80 hover:text-white cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {isTimelineDrawerOpen && createPortal(
        <div className="fixed inset-0 z-[110] flex justify-end" role="presentation">
          <button type="button" aria-label="Close timeline activities" onClick={() => setIsTimelineDrawerOpen(false)} className="absolute inset-0 bg-black/45" />
          <aside aria-label={`Timeline activities for ${applicant.name}`} className="relative z-10 flex h-full w-full max-w-[700px] flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
            <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-[#334155]">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-slate-900 dark:text-white">{applicant.applicantId ? `${applicant.applicantId} - ` : ''}{applicant.name}</h2>
                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{applicant.phone ? `${applicant.phone}  |  ` : ''}{applicant.email}</p>
              </div>
              <button type="button" aria-label="Close timeline activities" onClick={() => setIsTimelineDrawerOpen(false)} className="ml-4 rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#334155]"><X className="h-5 w-5" /></button>
            </header>
            <nav className="flex shrink-0 gap-6 border-b border-slate-200 px-5 dark:border-[#334155]" aria-label="Timeline filters">
              {([
                ['all', 'All Activity'], ['tasks', 'Tasks'], ['notes', 'Notes'], ['email', 'Email']
              ] as const).map(([id, label]) => (
                <button key={id} type="button" onClick={() => setTimelineDrawerTab(id)} className={`border-b-2 py-3 text-xs font-medium ${timelineDrawerTab === id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}>
                  {label}{id !== 'all' && <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] dark:bg-[#334155]">{id === 'email' ? activityEvents.filter((event) => event.category === 'messages').length : 0}</span>}
                </button>
              ))}
            </nav>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {timelineDrawerEvents.length ? (
                <>
                  <div className="mb-4 inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-semibold uppercase text-blue-600 dark:bg-[#334155] dark:text-blue-300">{timelineDrawerEvents[0].date}</div>
                  <div className="relative ml-3 border-l border-slate-200 dark:border-[#475569]">
                    {timelineDrawerEvents.map((event) => {
                      const Icon = event.icon;
                      return <article key={event.id} className="relative ml-5 border-b border-slate-200 py-4 last:border-0 dark:border-[#334155]">
                        <div className="absolute -left-[41px] top-4 flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400 text-white"><Icon className="h-3.5 w-3.5" /></div>
                        <div className="flex items-start justify-between gap-4"><div><p className="text-xs leading-5 text-slate-600 dark:text-slate-300">{event.description}</p><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{event.detail}</p></div><time className="shrink-0 text-[10px] text-slate-400">{event.date} {event.time}</time></div>
                      </article>;
                    })}
                  </div>
                </>
              ) : <div className="flex h-full flex-col items-center justify-center text-center"><Clock className="h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">No {timelineDrawerTab} activities</p></div>}
            </div>
          </aside>
        </div>,
        document.body
      )}

      {avatarEditOpen && <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4" onClick={() => setAvatarEditOpen(false)}>
        <section role="dialog" aria-modal="true" aria-label="Change user profile image" onClick={(event) => event.stopPropagation()} className="w-full max-w-[876px] border border-slate-200 bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
          <header className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-[#334155]"><h2 className="text-lg font-medium text-slate-700 dark:text-white">Change User Profile Image</h2><button type="button" aria-label="Close image editor" onClick={() => setAvatarEditOpen(false)} className="text-xl text-slate-500 hover:text-slate-900 dark:hover:text-white">×</button></header>
          <div className="p-5"><label className="mb-1 block text-xs text-slate-500 dark:text-slate-300" htmlFor="applicant-profile-image">Upload Image</label><input ref={avatarFileInputRef} id="applicant-profile-image" type="file" accept="image/*" onChange={handleAvatarFileChange} className="block max-w-full text-xs" /><div className="mt-4 flex h-[260px] items-center justify-center border border-slate-200 bg-white dark:border-[#334155] dark:bg-[#172033]">{avatarPreview && <img src={avatarPreview} alt="Profile image preview" className="max-h-full max-w-full object-contain" />}</div></div>
          <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-[#334155]"><button type="button" onClick={() => void saveApplicantAvatar()} className="rounded bg-[#4387F5] px-5 py-2 text-xs font-semibold text-white hover:bg-blue-600">Save</button><button type="button" onClick={() => setAvatarEditOpen(false)} className="rounded border border-slate-300 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 dark:border-[#475569] dark:text-white dark:hover:bg-[#263449]">Cancel</button></footer>
        </section>
      </div>}

      {avatarZoomOpen && <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 p-6" role="presentation" onClick={() => setAvatarZoomOpen(false)}><button type="button" aria-label="Close enlarged profile picture" onClick={() => setAvatarZoomOpen(false)} className="absolute right-5 top-5 rounded-full bg-black/40 p-2 text-white hover:bg-black/70"><X className="h-5 w-5" /></button>{applicant.avatar ? <img src={applicant.avatar} alt={`${applicant.name} enlarged profile`} onClick={(event) => event.stopPropagation()} className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain shadow-2xl" /> : <div onClick={(event) => event.stopPropagation()} className="flex h-64 w-64 items-center justify-center rounded-full bg-[#E2C8E4] text-8xl font-bold text-[#6B21A8]">{avatarInitial}</div>}</div>}

      {dialog === 'submit-to-job' && (
        <div className="fixed inset-x-0 bottom-0 top-[50px] z-[100] overflow-y-auto bg-[#EDF1F4] text-slate-700">
          <div className="mx-auto min-h-full max-w-[1900px] px-4 py-4 sm:px-6">
            <div className="mb-3 flex items-center justify-between"><h1 className="text-lg font-semibold text-slate-800">{displayName}'s Profile</h1><button type="button" aria-label="Close job selection" onClick={() => setDialog(null)} className="rounded bg-[#4387F5] px-3 py-1.5 text-sm font-semibold text-white">←</button></div>
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2.3fr)_minmax(280px,0.95fr)]">
              <section className="rounded border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex flex-wrap items-center gap-4"><label className="flex items-center gap-3 text-xs text-slate-500">Business Units<select value={submissionBusinessUnit} onChange={(event) => setSubmissionBusinessUnit(event.target.value)} className="min-w-64 border border-slate-300 bg-slate-50 px-2 py-2 text-slate-700"><option>All Business Units</option>{Array.from(new Set(submissionJobs.map((job) => job.businessUnit).filter(Boolean))).map((unit) => <option key={unit}>{unit}</option>)}</select></label>{selectedSubmissionJobIds.length > 0 && <button type="button" onClick={openSubmissionDetails} className="ml-auto rounded bg-[#4387F5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600">Submit to Jobs</button>}</div>
                <div className="flex items-center justify-between gap-3"><div className="flex min-w-0 flex-1"><input value={submissionJobSearch} onChange={(event) => setSubmissionJobSearch(event.target.value)} placeholder="Job Code, Job Title, Client Job ID, Client" className="w-full max-w-[420px] border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500" /><button type="button" onClick={() => setSubmissionAssignedJobsOnly((value) => !value)} className={`rounded-r px-3 py-1.5 text-xs font-semibold text-white ${submissionAssignedJobsOnly ? 'bg-slate-600' : 'bg-[#4387F5]'}`}>Assigned Jobs ⌄</button></div><label className="flex items-center gap-1 text-[10px] text-slate-500">Show<select className="border border-slate-300 px-2 py-1"><option>10</option><option>25</option><option>50</option></select>entries</label></div>
                <div className="mt-8 overflow-x-auto"><table className="w-full min-w-[750px] text-left text-xs"><thead><tr className="border-y border-slate-300 text-[10px] font-bold uppercase text-slate-600"><th className="w-10 px-1 py-2"><input aria-label="Select all available jobs" type="checkbox" checked={filteredSubmitJobs.length > 0 && filteredSubmitJobs.every((job) => selectedSubmissionJobIds.includes(job.id))} onChange={(event) => setSelectedSubmissionJobIds(event.target.checked ? [...new Set([...selectedSubmissionJobIds, ...filteredSubmitJobs.map((job) => job.id)])] : selectedSubmissionJobIds.filter((id) => !filteredSubmitJobs.some((job) => job.id === id)))} /></th><th className="px-2 py-2">Job Code ↕</th><th className="px-2 py-2">Job Title ↕</th><th className="px-2 py-2">Client Job ID ↕</th><th className="px-2 py-2">Client ↕</th><th className="px-2 py-2">City ↕</th><th className="px-2 py-2">Respond By ↕</th></tr></thead><tbody className="divide-y divide-slate-200">
                  {filteredSubmitJobs.length ? filteredSubmitJobs.map((job) => {
                    const alreadySubmitted = applicantSubmissions.some((submission) => submission.jobId === job.id);
                    const checked = selectedSubmissionJobIds.includes(job.id);
                    return <tr key={job.id} className={`${checked ? 'bg-slate-50' : ''} ${alreadySubmitted ? 'opacity-50' : 'hover:bg-slate-50'}`}><td className="px-1 py-2"><input type="checkbox" aria-label={`Select ${job.title}`} disabled={alreadySubmitted} checked={checked} onChange={() => setSelectedSubmissionJobIds((ids) => checked ? ids.filter((id) => id !== job.id) : [...ids, job.id])} /></td><td className="px-2 py-2 text-blue-600">{job.code}</td><td className="px-2 py-2">{job.title}</td><td className="px-2 py-2">{job.clientJobId || 'N/A'}</td><td className="px-2 py-2">{job.client || 'N/A'}</td><td className="px-2 py-2">{job.location || 'N/A'}</td><td className="px-2 py-2">{job.respondBy || 'Open Until Filled'}{alreadySubmitted && <span className="ml-2 text-[10px] text-slate-400">Already submitted</span>}</td></tr>;
                  }) : <tr><td colSpan={7} className="px-3 py-8 text-center text-xs text-slate-500">No available jobs match these filters.</td></tr>}
                </tbody></table></div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500"><span>Showing {filteredSubmitJobs.length ? 1 : 0} to {filteredSubmitJobs.length} of {filteredSubmitJobs.length} entries</span><span>Selected: {selectedSubmissionJobIds.length}</span></div>
              </section>
              <aside className="rounded border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 text-base font-semibold text-slate-800">Profile Details</h2>{[['Name', applicant.name], ['Email Address', applicant.email], ['Mobile Number', applicant.phone], ['City', applicant.location], ['Address', applicant.address || '']].map(([label, value]) => <div key={label} className="mb-4"><p className="text-[11px] text-slate-500">{label}</p><p className="mt-0.5 break-words text-xs text-slate-800">{value || 'N/A'}</p></div>)}</aside>
            </div>
          </div>
        </div>
      )}

      {dialog === 'applicant-submission' && (
        <div className="fixed inset-x-0 bottom-0 top-[50px] z-[100] overflow-y-auto bg-[#EDF1F4] text-slate-700">
          <div className="mx-auto min-h-full max-w-[1900px] px-4 py-4 sm:px-6">
            <div className="mb-3 flex items-center justify-between"><h1 className="text-lg font-semibold text-slate-800">Applicant Profile Submission</h1><div className="flex gap-2"><button type="button" onClick={() => setSubmissionEmailPreviewOpen(true)} className="rounded bg-[#4387F5] px-3 py-1.5 text-xs font-semibold text-white">Email Preview</button><button type="button" onClick={() => void submitApplicantToJobs()} className="rounded bg-[#4387F5] px-3 py-1.5 text-xs font-semibold text-white">Submit</button><button type="button" onClick={() => setDialog('submit-to-job')} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-600">Cancel</button></div></div>
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2.3fr)_minmax(280px,0.95fr)]">
              <section className="space-y-2 rounded border border-slate-200 bg-white p-3 shadow-sm">
                {selectedSubmissionJobIds.map((id) => { const job = submissionJobs.find((item) => item.id === id); return job ? <div key={id} className="flex items-center justify-between px-2 py-2 text-sm font-medium text-slate-800"><span>Job Title: <span className="ml-2 text-blue-700">{job.code} - {job.title} - {job.client || 'N/A'}</span></span><button type="button" onClick={() => setSelectedSubmissionJobIds((ids) => ids.filter((jobId) => jobId !== id))} className="text-blue-500">−</button></div> : null; })}
                <div className="rounded bg-slate-100 px-2.5 py-2 text-xs font-medium text-blue-600">Skills <button type="button" onClick={() => setSubmissionSkillsExpanded((open) => !open)} className="float-right rounded bg-blue-500 px-2 py-0.5 font-semibold text-white">{submissionSkillsExpanded ? '−' : '+ Add'}</button></div>
                {submissionSkillsExpanded && <div className="p-3"><div className="mb-2 grid grid-cols-[1fr_100px] gap-2 text-[11px] text-slate-500"><span>Skills</span><span># of years</span></div>{submissionSkills.map((item, index) => <div key={`${item.skill}-${index}`} className="mb-2 grid grid-cols-[1fr_100px] gap-2"><input value={item.skill} onChange={(event) => setSubmissionSkills((skills) => skills.map((skill, i) => i === index ? { ...skill, skill: event.target.value } : skill))} className="border border-slate-300 px-2 py-1.5 text-xs" /><input type="number" min="0" value={item.years} onChange={(event) => setSubmissionSkills((skills) => skills.map((skill, i) => i === index ? { ...skill, years: event.target.value } : skill))} placeholder="Years" className="border border-slate-300 px-2 py-1.5 text-xs" /></div>)}<div className="flex gap-2"><input value={submissionSkillDraft} onChange={(event) => setSubmissionSkillDraft(event.target.value)} placeholder="Add a skill" className="border border-slate-300 px-2 py-1.5 text-xs" /><button type="button" onClick={() => { if (submissionSkillDraft.trim()) setSubmissionSkills((skills) => [...skills, { skill: submissionSkillDraft.trim(), years: '' }]); setSubmissionSkillDraft(''); }} className="text-xs text-blue-600">Add</button></div></div>}
                <div className="rounded bg-slate-100 px-2.5 py-2 text-xs font-medium text-blue-600">Applicant Rating</div><div className="space-y-1 px-4 py-2">{(['technical', 'communication', 'professionalism', 'overall'] as const).map((key) => <div key={key} className="flex items-center justify-between text-[11px] text-slate-500"><span className="capitalize">{key === 'technical' ? 'Technical Skills' : key === 'communication' ? 'Communication Skills' : key === 'overall' ? 'Overall Rating' : 'Professionalism'}</span><span className="flex text-lg leading-none">{[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" aria-label={`${key} rating ${rating}`} onClick={() => setRatings((current) => ({ ...current, [key]: rating }))} className={rating <= ratings[key] ? 'text-amber-400' : 'text-slate-300'}>★</button>)}</span></div>)}</div>
                <div className="rounded bg-slate-100 px-2.5 py-2 text-xs font-medium text-blue-600">Reference Details <button type="button" onClick={() => setSubmissionReferenceExpanded((open) => !open)} className="float-right rounded bg-blue-500 px-2 py-0.5 font-semibold text-white">{submissionReferenceExpanded ? '−' : '+ Add'}</button></div>
                {submissionReferenceExpanded && <div className="grid gap-3 p-3 md:grid-cols-3">{([['name', 'Reference Name', true], ['company', 'Company Name', true], ['contact', 'Contact Number', false], ['email', 'Email Address', true], ['type', 'Reference Type', true], ['years', 'Years Acquainted', true], ['summary', 'Reference Summary', true]] as const).map(([key, label, required]) => <label key={key} className={`space-y-1 text-[11px] text-slate-500 ${key === 'summary' ? 'md:col-span-2' : ''}`}>{label}{required && <span className="text-red-500"> *</span>}{key === 'type' ? <select value={submissionReference.type} onChange={(event) => setSubmissionReference((value) => ({ ...value, type: event.target.value }))} className="block w-full border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs"><option value="">Select</option><option>Professional</option><option>Personal</option><option>Manager</option></select> : key === 'summary' ? <textarea value={submissionReference.summary} onChange={(event) => setSubmissionReference((value) => ({ ...value, summary: event.target.value }))} className="block w-full border border-slate-300 bg-slate-50 p-2 text-xs" /> : <input type={key === 'email' ? 'email' : key === 'years' ? 'number' : 'text'} value={submissionReference[key]} onChange={(event) => setSubmissionReference((value) => ({ ...value, [key]: event.target.value }))} className="block w-full border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs" />}</label>)}</div>}
                <div className="rounded bg-slate-100 px-2.5 py-2 text-xs font-medium text-blue-600">Employer Details <button type="button" onClick={() => setSubmissionEmployerExpanded((open) => !open)} className="float-right rounded bg-blue-500 px-2 py-0.5 font-semibold text-white">{submissionEmployerExpanded ? '−' : '+ Add'}</button></div>
                {submissionEmployerExpanded && <div className="space-y-3 p-3"><div className="flex flex-wrap gap-5 text-xs">{['Active Employer', 'Add New', 'Add from existing vendor contact records'].map((mode) => <label key={mode}><input type="radio" checked={submissionEmployer.mode === mode} onChange={() => setSubmissionEmployer((value) => ({ ...value, mode }))} className="mr-1.5" />{mode}</label>)}</div><div className="grid gap-3 md:grid-cols-3">{([['name', 'Employer Name'], ['firstName', 'First Name'], ['lastName', 'Last Name'], ['office', 'Office Number'], ['mobile', 'Mobile Number'], ['email', 'Email ID']] as const).map(([key, label]) => <label key={key} className="space-y-1 text-[11px] text-slate-500">{label}<input value={submissionEmployer[key]} onChange={(event) => setSubmissionEmployer((value) => ({ ...value, [key]: event.target.value }))} className="block w-full border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs" /></label>)}</div></div>}
                <div className="rounded bg-slate-100 px-2.5 py-2 text-xs font-medium text-blue-600">Available Documents <button type="button" onClick={() => setSubmissionDocumentsExpanded((open) => !open)} className="float-right rounded bg-blue-500 px-2 py-0.5 font-semibold text-white">{submissionDocumentsExpanded ? '−' : '+ Add'}</button></div>
                {submissionDocumentsExpanded && <div className="space-y-2 p-3">{(applicant.documents || []).length ? (applicant.documents || []).map((document, index) => <label key={document.id || `${document.name}-${index}`} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={submissionAdditionalAttachments.some((file) => file.name === document.name)} onChange={(event) => setSubmissionAdditionalAttachments((files) => event.target.checked ? [...files, new File([], document.name)] : files.filter((file) => file.name !== document.name))} />{document.name}</label>) : <p className="text-xs italic text-slate-500">No data available</p>}</div>}
                <div className="rounded bg-slate-100 px-2.5 py-2 text-xs font-medium text-blue-600">Submission Details</div><div className="p-3"><h3 className="mb-3 text-sm font-semibold text-slate-800">Standard Fields</h3><div className="grid gap-x-8 gap-y-3 md:grid-cols-2"><label className="space-y-1 text-[11px] text-slate-500">Notice Period <span className="text-red-500">*</span><input required value={submissionNoticePeriod} onChange={(event) => setSubmissionNoticePeriod(event.target.value)} placeholder="e.g. 30 days / Immediate" className="block w-full border border-slate-300 bg-slate-50 px-2 py-2 text-xs" /></label><label className="space-y-1 text-[11px] text-slate-500">Bill Rate<div className="flex gap-2"><select value={submissionCurrency} onChange={(event) => setSubmissionCurrency(event.target.value)} className="border border-slate-300 bg-slate-50 px-2 text-xs"><option>INR</option><option>USD</option><option>EUR</option></select><input type="number" min="0" value={submissionBillRate} onChange={(event) => setSubmissionBillRate(event.target.value)} className="min-w-0 flex-1 border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs" /><select value={submissionRateType} onChange={(event) => setSubmissionRateType(event.target.value)} className="border border-slate-300 bg-slate-50 px-2 text-xs"><option>Yearly</option><option>Hourly</option><option>Monthly</option><option>Daily</option></select></div></label><fieldset className="space-y-1 text-[11px] text-slate-500"><legend>Relocation</legend><label className="mr-4"><input type="radio" checked={submissionRelocation === 'Yes'} onChange={() => setSubmissionRelocation('Yes')} className="mr-1" />Yes</label><label><input type="radio" checked={submissionRelocation === 'No'} onChange={() => setSubmissionRelocation('No')} className="mr-1" />No</label></fieldset><label className="space-y-1 text-[11px] text-slate-500">Resume <span className="text-red-500">*</span><select value={submissionResumeName} onChange={(event) => setSubmissionResumeName(event.target.value)} className="block w-full border border-slate-300 bg-slate-50 px-2 py-2 text-xs"><option value="">Select a resume</option>{(applicant.documents || []).filter((document) => /resume/i.test(`${document.type} ${document.name}`)).map((document, index) => <option key={document.id || `${document.name}-${index}`} value={document.name}>{document.name}</option>)}</select><input type="file" accept=".pdf,.doc,.docx,.txt,.rtf" onChange={(event) => setSubmissionResumeFile(event.target.files?.[0] || null)} className="mt-1 block max-w-full text-[10px]" /></label><label className="space-y-1 text-[11px] text-slate-500">Video Link<input value={submissionVideoLink} onChange={(event) => setSubmissionVideoLink(event.target.value)} className="block w-full border border-slate-300 bg-slate-50 px-2 py-2 text-xs" /></label><label className="space-y-1 text-[11px] text-slate-500">eForms<select value={submissionEForm} onChange={(event) => setSubmissionEForm(event.target.value)} className="block w-full border border-slate-300 bg-slate-50 px-2 py-2 text-xs"><option value="">Select</option><option>Candidate Consent</option><option>Right to Represent</option><option>Employment Application</option></select></label><label className="space-y-1 text-[11px] text-slate-500">Recipients<input value={submissionRecipients} onChange={(event) => setSubmissionRecipients(event.target.value)} className="block w-full border border-slate-300 bg-slate-50 px-2 py-2 text-xs" /></label><label className="space-y-1 text-[11px] text-slate-500">Additional Notifiers<input value={submissionNotifiers} onChange={(event) => setSubmissionNotifiers(event.target.value)} className="block w-full border border-slate-300 bg-slate-50 px-2 py-2 text-xs" /></label><label className="space-y-1 text-[11px] text-slate-500">Other Email IDs<input value={submissionOtherEmails} onChange={(event) => setSubmissionOtherEmails(event.target.value)} placeholder="Separate addresses with commas" className="block w-full border border-slate-300 bg-slate-50 px-2 py-2 text-xs" /></label><label className="space-y-1 text-[11px] text-slate-500 md:col-span-2">Additional Attachment<input type="file" multiple onChange={(event) => setSubmissionAdditionalAttachments(Array.from(event.target.files || []))} className="mt-1 block text-[10px]" /></label><label className="space-y-1 text-[11px] text-slate-500 md:col-span-2">Comments<textarea value={submissionComments} onChange={(event) => setSubmissionComments(event.target.value)} rows={3} className="block w-full border border-slate-300 bg-slate-50 p-2 text-xs" /></label></div><button type="button" onClick={() => showToast('Submission details saved.')} className="mt-4 rounded bg-[#4387F5] px-4 py-2 text-xs font-semibold text-white">Save</button></div>
              </section>
              <aside className="rounded border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 text-base font-semibold text-slate-800">Profile Details</h2>{[['Name', applicant.name], ['Email Address', applicant.email], ['Mobile Number', applicant.phone], ['City', applicant.location], ['Address', applicant.address || ''], ['Submission Guidelines', 'N/A'], ['Submissions Documents', submissionResumeName || submissionResumeFile?.name || '']].map(([label, value]) => <div key={label} className="mb-4"><p className="text-[11px] text-slate-500">{label}</p><p className="mt-0.5 break-words text-xs text-slate-800">{value || 'N/A'}</p></div>)}</aside>
            </div>
          </div>
          {submissionEmailPreviewOpen && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4" onClick={() => setSubmissionEmailPreviewOpen(false)}><section role="dialog" aria-modal="true" aria-label="Submission email preview" onClick={(event) => event.stopPropagation()} className="w-full max-w-xl rounded border border-slate-200 bg-white p-5 shadow-2xl"><div className="flex items-center justify-between border-b pb-3"><h2 className="font-semibold text-slate-800">Submission Email Preview</h2><button type="button" aria-label="Close preview" onClick={() => setSubmissionEmailPreviewOpen(false)} className="text-slate-500">×</button></div><p className="mt-3 text-xs text-slate-600">To: {submissionRecipients || 'Job submission recipients'}</p><p className="mt-2 text-xs text-slate-600">Candidate: {applicant.name} ({applicant.email})</p><p className="mt-2 text-xs text-slate-600">Jobs: {selectedSubmissionJobIds.map((id) => submissionJobs.find((job) => job.id === id)?.title).filter(Boolean).join(', ')}</p><p className="mt-2 text-xs text-slate-600">Resume: {submissionResumeFile?.name || submissionResumeName || 'Not selected'}</p><p className="mt-3 rounded bg-slate-50 p-3 text-xs text-slate-500">The candidate profile and submission details will be included with the selected resume.</p><div className="mt-4 flex justify-end"><button type="button" onClick={() => setSubmissionEmailPreviewOpen(false)} className="rounded bg-[#4387F5] px-4 py-2 text-xs font-semibold text-white">Close</button></div></section></div>}
        </div>
      )}

      {dialog === 'quick-tag-to-job' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4" onClick={() => setDialog(null)}>
          <section role="dialog" aria-modal="true" aria-label="Tag to Job" className="w-full max-w-[560px] border border-slate-200 bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]" onClick={(event) => event.stopPropagation()}>
            <header className="flex items-center justify-between border-b border-slate-200 bg-[#F8F8F8] px-5 py-3 dark:border-[#334155] dark:bg-[#252525]"><h2 className="text-lg font-medium text-slate-800 dark:text-white">Tag to Job</h2><button type="button" aria-label="Close Tag to Job" onClick={() => setDialog(null)} className="text-xl leading-none text-slate-500 hover:text-slate-900 dark:hover:text-white">×</button></header>
            <div className="px-7 py-7 text-xs leading-5 text-slate-600 dark:text-slate-300"><p>Please select the relevant Job to tag the applicant <strong className="text-slate-800 dark:text-white">{applicant.name}</strong>. This action will add the applicant to the job pipeline</p><label htmlFor="quick-tag-job-search" className="mt-7 mb-2 block text-slate-500">Select Job</label><div className="relative"><div className="flex items-center border border-slate-300 bg-[#F8F8F8] dark:border-[#475569] dark:bg-[#263449]"><input id="quick-tag-job-search" value={jobActionSelectedJobId ? (submissionJobs.find((job) => job.id === jobActionSelectedJobId)?.title || jobActionSearch) : jobActionSearch} onChange={(event) => { setJobActionSelectedJobId(''); setJobActionSearch(event.target.value); setJobActionDropdownOpen(true); }} onFocus={() => setJobActionDropdownOpen(true)} placeholder="Search for a Job" className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-xs italic outline-none dark:text-white" /><button type="button" aria-label="Show jobs" onClick={() => setJobActionDropdownOpen((open) => !open)} className="px-2 text-slate-500">▾</button></div>
              {jobActionDropdownOpen && <div className="absolute left-0 right-0 top-full z-20 max-h-56 overflow-y-auto border border-slate-300 bg-white shadow-lg dark:border-[#475569] dark:bg-[#263449]">{jobActionSearch.trim().length < 3 ? <p className="px-2 py-2 text-[11px] text-slate-500">Please enter 3 more characters</p> : submissionJobs.filter((job) => ['Open', 'Active', 'Sourcing', 'In Review'].includes(job.status) && `${job.code} ${job.title} ${job.clientJobId || ''} ${job.client}`.toLowerCase().includes(jobActionSearch.trim().toLowerCase())).map((job) => <button key={job.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setJobActionSelectedJobId(job.id); setJobActionSearch(''); setJobActionDropdownOpen(false); }} className="block w-full border-b border-slate-100 px-2.5 py-2 text-left text-xs hover:bg-blue-50 dark:border-[#334155] dark:text-white dark:hover:bg-[#334155]">{job.code} - {job.title} ({job.client})</button>)}{jobActionSearch.trim().length >= 3 && !submissionJobs.some((job) => ['Open', 'Active', 'Sourcing', 'In Review'].includes(job.status) && `${job.code} ${job.title} ${job.clientJobId || ''} ${job.client}`.toLowerCase().includes(jobActionSearch.trim().toLowerCase())) && <p className="px-2 py-2 text-[11px] text-slate-500">No matching jobs found.</p>}</div>}
            </div></div>
            <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-[#334155]"><button type="button" onClick={() => void completeJobAction()} className="rounded bg-[#4387F5] px-5 py-2 text-xs font-semibold text-white hover:bg-blue-600">Save</button><button type="button" onClick={() => setDialog(null)} className="rounded border border-slate-300 bg-white px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 dark:border-[#475569] dark:bg-[#263449] dark:text-white">Cancel</button></footer>
          </section>
        </div>
      )}

      {(dialog === 'tag-to-job' || dialog === 'quick-submit') && (
        <div className="fixed inset-0 z-[110] flex justify-end bg-black/35">
          <button type="button" aria-label="Close job action" onClick={() => setDialog(null)} className="absolute inset-0" />
          <aside role="dialog" aria-modal="true" aria-label={dialog === 'tag-to-job' ? 'Tag applicant to job' : 'Quick submit applicant'} className="relative z-10 h-full w-full max-w-[860px] overflow-y-auto border-l border-slate-200 bg-[#F8F8F8] shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
            <header className="flex h-10 items-center justify-between border-b border-slate-300 bg-white px-4 dark:border-[#334155] dark:bg-[#252525]"><h2 className="text-xs font-semibold text-[#1877F2]">◉ {dialog === 'tag-to-job' ? 'Tag to Job' : 'Quick Submission'} - {applicant.name}</h2><button type="button" aria-label="Close" onClick={() => setDialog(null)} className="text-2xl leading-none text-slate-500 hover:text-slate-900 dark:hover:text-white">×</button></header>
            <div className="grid max-w-[580px] grid-cols-[145px_minmax(0,1fr)] items-center gap-x-5 gap-y-3 px-6 py-6 text-xs">
              <label htmlFor="job-action-search" className="text-slate-500">Select Job <span className="text-red-500">*</span></label>
              <div className="relative"><div className="flex items-center border border-slate-300 bg-white dark:border-[#475569] dark:bg-[#263449]"><input id="job-action-search" value={jobActionSelectedJobId ? (submissionJobs.find((job) => job.id === jobActionSelectedJobId)?.title || jobActionSearch) : jobActionSearch} onChange={(event) => { setJobActionSelectedJobId(''); setJobActionSearch(event.target.value); setJobActionDropdownOpen(true); }} onFocus={() => setJobActionDropdownOpen(true)} placeholder="Search for a Job" className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-xs outline-none dark:text-white" /><button type="button" aria-label="Show jobs" onClick={() => setJobActionDropdownOpen((open) => !open)} className="px-2 text-slate-500">▾</button></div>
                {jobActionDropdownOpen && <div className="absolute left-0 right-0 top-full z-20 max-h-64 overflow-y-auto border border-slate-300 bg-white shadow-lg dark:border-[#475569] dark:bg-[#263449]">{jobActionSearch.trim().length < 3 ? <p className="px-2 py-2 text-[11px] text-slate-500">Please enter 3 more characters</p> : submissionJobs.filter((job) => ['Open', 'Active', 'Sourcing', 'In Review'].includes(job.status) && `${job.code} ${job.title} ${job.clientJobId || ''} ${job.client}`.toLowerCase().includes(jobActionSearch.trim().toLowerCase())).map((job) => <button key={job.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setJobActionSelectedJobId(job.id); setJobActionSearch(''); setJobActionDropdownOpen(false); }} className="block w-full border-b border-slate-100 px-2.5 py-2 text-left text-xs hover:bg-blue-50 dark:border-[#334155] dark:text-white dark:hover:bg-[#334155]">{job.code} - {job.title} ({job.client})</button>)}{jobActionSearch.trim().length >= 3 && !submissionJobs.some((job) => ['Open', 'Active', 'Sourcing', 'In Review'].includes(job.status) && `${job.code} ${job.title} ${job.clientJobId || ''} ${job.client}`.toLowerCase().includes(jobActionSearch.trim().toLowerCase())) && <p className="px-2 py-2 text-[11px] text-slate-500">No matching jobs found.</p>}</div>}
              </div>
              <label className="text-slate-500">Candidate Id</label><input readOnly value={applicant.applicantId || applicant.id} className="border border-slate-300 bg-white px-2 py-2 text-xs text-slate-700 dark:border-[#475569] dark:bg-[#263449] dark:text-white" />
              <label className="text-slate-500">Candidate Name</label><input readOnly value={applicant.name} className="border border-slate-300 bg-white px-2 py-2 text-xs text-slate-700 dark:border-[#475569] dark:bg-[#263449] dark:text-white" />
              <label className="text-slate-500">Email Address</label><input readOnly value={applicant.email} className="border border-slate-300 bg-white px-2 py-2 text-xs text-slate-700 dark:border-[#475569] dark:bg-[#263449] dark:text-white" />
              <span /><div className="flex gap-2 pt-1"><button type="button" onClick={() => void completeJobAction()} className="rounded bg-[#4387F5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600">{dialog === 'tag-to-job' ? 'Tag' : 'Submit'}</button><button type="button" onClick={() => setDialog(null)} className="rounded bg-[#4387F5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600">Cancel</button></div>
            </div>
          </aside>
        </div>
      )}

      {dialog === 'email' && (
        <div className="fixed inset-x-0 bottom-0 top-[50px] z-[100] overflow-y-auto bg-[#ECECEC] text-slate-700">
          <div className="mx-auto min-h-full max-w-[1800px] px-4 py-4 sm:px-8">
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,22%)]">
              <section>
                <h1 className="mb-4 text-xl font-medium text-slate-800">Send Email</h1>
                <div className="border border-slate-300 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-[#F8F8F8] px-3 py-3">
                    <label className="flex items-center gap-4 text-xs text-slate-500">From<select value={emailFrom} onChange={(event) => setEmailFrom(event.target.value)} className="min-w-64 border border-slate-300 bg-white px-2 py-2 text-xs text-slate-700"><option>System (noreply@ats.local)</option><option>{currentUser?.name || 'Recruiter'} ({currentUser?.email || 'recruiter@ats.local'})</option></select></label>
                    <div className="flex gap-1.5"><button type="button" onClick={() => void sendApplicantEmail()} className="rounded-sm bg-[#4387F5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#286FE0]">Send</button><button type="button" onClick={() => setDialog(null)} className="rounded-sm bg-[#4387F5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#286FE0]">Cancel</button></div>
                  </div>
                  <div className="flex items-center gap-4 border-b border-slate-200 px-3 py-2 text-xs"><span className="w-10 text-slate-500">To</span><input aria-label="To" value={emailTo} onChange={(event) => setEmailTo(event.target.value)} className="min-w-0 flex-1 rounded-full border border-slate-200 px-3 py-1.5 text-slate-700 outline-none focus:border-blue-400" placeholder="Enter email addresses separated by commas" /></div>
                  <div className="flex items-center gap-4 border-b border-slate-200 px-3 py-1"><label className="w-10 text-xs text-slate-500" htmlFor="applicant-email-cc">CC</label><input id="applicant-email-cc" value={emailCc} onChange={(event) => setEmailCc(event.target.value)} className="min-w-0 flex-1 border-0 bg-transparent px-1 py-2 text-xs outline-none" placeholder="Add CC recipients" /></div>
                  <div className="flex items-center gap-4 border-b border-slate-200 px-3 py-2"><label className="w-10 text-xs text-slate-500" htmlFor="applicant-email-subject">Subject</label><input id="applicant-email-subject" value={emailSubject} onChange={(event) => setEmailSubject(event.target.value)} className="min-w-0 flex-1 border-0 bg-transparent px-1 py-1 text-xs outline-none" placeholder="Enter subject" /></div>
                  <EmailRichTextEditor value={emailBody} resetKey={emailEditorResetKey} accentColor={emailTheme === 'Green' ? '#16A34A' : emailTheme === 'Purple' ? '#7C3AED' : '#4387F5'} onChange={setEmailBody} onError={showToast} />
                  <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 px-3 py-3 text-xs"><span className="text-slate-500">Attachments</span><input aria-label="Email attachments" type="file" multiple onChange={(event) => setEmailAttachments(Array.from(event.target.files || []))} className="max-w-full text-[11px]" />{emailAttachments.length > 0 && <span className="text-[10px] text-slate-500">{emailAttachments.map((file) => file.name).join(', ')}</span>}</div>
                  <div className="flex justify-end gap-1.5 border-t border-slate-200 bg-[#F8F8F8] px-3 py-2"><button type="button" onClick={() => void sendApplicantEmail()} className="rounded-sm bg-[#4387F5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#286FE0]">Send</button><button type="button" onClick={() => setDialog(null)} className="rounded-sm bg-[#4387F5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#286FE0]">Cancel</button></div>
                </div>
              </section>
              <aside className="pt-0 xl:pt-0"><h2 className="mb-4 text-xl font-medium text-slate-800">Customize Mail Body</h2><div className="space-y-4 border border-slate-300 bg-white p-4 text-xs">
                <label className="block space-y-1 text-slate-500">Select Mailing Theme<select value={emailTheme} onChange={(event) => setEmailTheme(event.target.value)} className="block w-full border border-slate-300 bg-[#F8F8F8] px-2 py-2 text-slate-700"><option value="">Select</option><option>Blue</option><option>Green</option><option>Purple</option></select></label>
                <label className="block space-y-1 text-slate-500">Salutation<select value={emailSalutation} onChange={(event) => { setEmailSalutation(event.target.value); setEmailBody(`${event.target.value.replace('[FirstName]', displayName.split(/\s+/)[0] || displayName)},<br/><br/>`); }} className="block w-full border border-slate-300 bg-[#F8F8F8] px-2 py-2 text-slate-700"><option value={`Hi ${displayName.split(/\s+/)[0] || displayName}`}>Hi [FirstName]</option><option value="Hello">Hello</option><option value="Dear [FirstName]">Dear [FirstName]</option></select></label>
                <label className="block space-y-1 text-slate-500">Select Template<select value={emailTemplate} onChange={(event) => { const value = event.target.value; setEmailTemplate(value); if (value === 'Interview Invitation') { setEmailSubject('Interview invitation'); setEmailBody(`Hi ${displayName.split(/\s+/)[0]},<br/><br/>We would like to invite you to an interview. Please let us know your availability.<br/><br/>`); } else if (value === 'Follow-up') { setEmailSubject('Following up'); setEmailBody(`Hi ${displayName.split(/\s+/)[0]},<br/><br/>I am following up regarding your application. Please let me know if you have any questions.<br/><br/>`); } else if (value === 'Blank') { setEmailSubject(''); setEmailBody(''); } }} className="block w-full border border-slate-300 bg-[#F8F8F8] px-2 py-2 text-slate-700"><option value="">-- Select Template --</option><option>Interview Invitation</option><option>Follow-up</option><option>Blank</option></select></label>
              </div></aside>
            </div>
          </div>
        </div>
      )}

      {/* Top Sub-Navigation Tabs Bar */}
      <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between border-b border-[#E2E8F0] bg-white px-4 py-1.5 shadow-xs dark:border-[#333] dark:bg-[#1E293B] overflow-visible">
        <div className="flex items-center gap-1 text-xs overflow-visible">
          <button
            type="button"
            onClick={() => navigate('applicants')}
            className="mr-2 flex items-center gap-1 text-[#666] hover:text-[#1877F2] dark:text-[#AAA] dark:hover:text-white"
            title="Back to Applicants list"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          {baseSubTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveSubTab(tab);
                setMoreSubTabsOpen(false);
              }}
              className={`whitespace-nowrap px-3 py-1.5 font-medium transition-colors ${
                activeSubTab === tab
                  ? 'border-b-2 border-[#1877F2] font-semibold text-[#1877F2]'
                  : 'text-[#555] hover:text-[#1877F2] dark:text-[#BBB] dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}

          {/* 6th Slot: Dynamic Sub-Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveSubTab(currentDynamicTab);
              setDynamicTab(currentDynamicTab);
              setMoreSubTabsOpen(false);
            }}
            className={`whitespace-nowrap px-3 py-1.5 font-medium transition-colors ${
              activeSubTab === currentDynamicTab
                ? 'border-b-2 border-[#1877F2] font-semibold text-[#1877F2]'
                : 'text-[#555] hover:text-[#1877F2] dark:text-[#BBB] dark:hover:text-white'
            }`}
          >
            {currentDynamicTab}
          </button>

          {/* Three-Dot Menu with Hidden Sub-Tabs (Reference Image 1, 2, 3 Replication) */}
          <div className="relative inline-flex items-center" ref={moreSubTabsRef}>
            <button
              type="button"
              onClick={() => setMoreSubTabsOpen((prev) => !prev)}
              aria-label="More applicant sections"
              aria-haspopup="menu"
              aria-expanded={moreSubTabsOpen}
              title="More applicant sections"
              className="flex items-center justify-center px-1.5 py-1 text-sm font-bold text-[#1877F2] hover:opacity-80 transition-opacity"
            >
              ...
            </button>
            {moreSubTabsOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-1.5 w-44 rounded-sm border border-[#CBD5E1] bg-white py-1 shadow-md dark:border-[#444] dark:bg-[#252525]"
              >
                {/* Triangular Caret Arrow Pointing Up directly under ... */}
                <div className="absolute -top-1.5 right-3 h-3 w-3 rotate-45 border-l border-t border-[#CBD5E1] bg-white dark:border-[#444] dark:bg-[#252525]" />
                <div className="relative z-10">
                  {dynamicSubTabsPool
                    .filter((item) => item !== currentDynamicTab)
                    .map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setActiveSubTab(item);
                          setDynamicTab(item);
                          setMoreSubTabsOpen(false);
                        }}
                        role="menuitem"
                        className="block w-full px-4 py-2 text-left text-xs text-[#555] transition-colors hover:bg-[#F3F4F6] hover:text-[#1877F2] dark:text-[#CCC] dark:hover:bg-[#333]"
                      >
                        {item}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action icons right */}
        <div className="flex items-center gap-2 text-[#666] dark:text-[#AAA]">
          <button
            type="button"
            title="Settings"
            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-[#333]"
            onClick={() => showToast('Settings opened')}
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Share Profile"
            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-[#333]"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                showToast('Applicant profile link copied to clipboard.');
              }
            }}
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Email Applicant"
            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-[#333]"
            onClick={() => openEmailComposer()}
          >
            <Mail className="h-4 w-4" />
          </button>

          {/* Submit dropdown */}
          <div className="relative" ref={submitMenuRef}>
            <button
              type="button"
              onClick={() => setSubmitMenuOpen((prev) => !prev)}
              className="flex items-center gap-1 rounded border border-[#CED4DA] bg-white px-2.5 py-1 text-xs font-semibold text-[#333] hover:bg-gray-50 dark:border-[#444] dark:bg-[#333] dark:text-white"
            >
              <span>Submit</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {submitMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-md border border-[#CED4DA] bg-white py-1 shadow-2xl dark:border-[#444] dark:bg-[#1E293B]">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitMenuOpen(false);
                    setSelectedSubmissionJobIds([]);
                    setSubmissionJobSearch('');
                    setSubmissionBusinessUnit('Ampcus Tech Pvt Ltd.');
                    setSubmissionAssignedJobsOnly(false);
                    setDialog('submit-to-job');
                  }}
                  className="block w-full px-3 py-1.5 text-left text-xs text-[#333] hover:bg-gray-100 dark:text-white dark:hover:bg-[#333]"
                >
                  Submit to Job
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitMenuOpen(false);
                    openJobActionDialog('tag-to-job');
                  }}
                  className="block w-full px-3 py-1.5 text-left text-xs text-[#333] hover:bg-gray-100 dark:text-white dark:hover:bg-[#333]"
                >
                  Tag to Job
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitMenuOpen(false);
                    setJobActionSearch('');
                    setJobActionSelectedJobId('');
                    setJobActionDropdownOpen(false);
                    setDialog('quick-tag-to-job');
                  }}
                  className="block w-full px-3 py-1.5 text-left text-xs text-[#333] hover:bg-gray-100 dark:text-white dark:hover:bg-[#333]"
                >
                  Quick Tag
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitMenuOpen(false);
                    openJobActionDialog('quick-submit');
                  }}
                  className="block w-full px-3 py-1.5 text-left text-xs text-[#333] hover:bg-gray-100 dark:text-white dark:hover:bg-[#333]"
                >
                  Quick Submit
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            title={applicant.isFavorite ? 'Remove Favorite' : 'Add Favorite'}
            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-[#333]"
            onClick={handleToggleFavorite}
          >
            <Star className={`h-4 w-4 ${applicant.isFavorite ? 'fill-[#F2B705] text-[#F2B705]' : ''}`} />
          </button>

          <button
            type="button"
            title="Download Profile / Resume"
            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-[#333]"
            onClick={() => {
              const content = `${applicant.applicantId} - ${applicant.name}\n${applicant.currentDesignation}\nEmail: ${applicant.email}\nPhone: ${applicant.phone}\nLocation: ${applicant.location}\nSkills: ${applicant.skills.join(', ')}\nExperience: ${applicant.experienceYears} Years`;
              const blob = new Blob([content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${applicant.applicantId}_${applicant.name.replace(/\s+/g, '_')}.txt`;
              a.click();
              URL.revokeObjectURL(url);
              showToast('Dossier downloaded.');
            }}
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main 2-Column Body Content */}
      <div className={`p-3 transition-all ${
        isResumePanelOpen
          ? resumeFullscreen
            ? 'hidden'
            : 'lg:pr-[49%] xl:pr-[46%]'
          : sidebarCollapsed
          ? 'pr-4'
          : 'lg:pr-[318px]'
      }`}>
        <div className="space-y-3.5">
          {/* 1. Candidate Header Card */}
          <div className="relative z-20 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#1E293B]">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              {/* Left Candidate Info */}
              <div className="flex items-start gap-3.5">
                <div ref={avatarMenuRef} className="relative z-30 shrink-0">
                  <button type="button" aria-label="Profile picture options" aria-haspopup="menu" aria-expanded={avatarMenuOpen} onClick={() => setAvatarMenuOpen((open) => !open)} className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#E2C8E4] text-lg font-bold text-[#6B21A8] ring-offset-2 hover:ring-2 hover:ring-[#2F80ED] dark:bg-[#4A2B4E] dark:text-[#E9D5FF]">
                    {applicant.avatar ? <img src={applicant.avatar} alt={`${applicant.name} profile`} className="h-full w-full object-cover" /> : avatarInitial}
                  </button>
                  {avatarMenuOpen && <div role="menu" aria-label="Profile picture options" className="absolute left-0 top-[calc(100%+5px)] z-50 flex flex-col gap-1 rounded bg-[#666] p-1.5 shadow-lg">
                    <button type="button" role="menuitem" title="Edit" aria-label="Edit profile picture" onClick={openAvatarEditor} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#2F80ED] hover:bg-blue-50"><Pencil className="h-4 w-4" /></button>
                    <button type="button" role="menuitem" title="Zoom" aria-label="Zoom profile picture" onClick={() => { setAvatarMenuOpen(false); setAvatarZoomOpen(true); }} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#2F80ED] hover:bg-blue-50"><Search className="h-4 w-4" /></button>
                  </div>}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-sm font-bold text-[#1F2937] dark:text-white">
                      {applicant.applicantId} - {applicant.name.toUpperCase()}
                    </h1>
                    <button
                      type="button"
                      onClick={handleToggleFavorite}
                      className="text-[#999] hover:text-[#F2B705]"
                      title="Favorite"
                    >
                      <Star className={`h-3.5 w-3.5 ${applicant.isFavorite ? 'fill-[#F2B705] text-[#F2B705]' : ''}`} />
                    </button>
                    <div className="relative" ref={candidateSearchRef}>
                      <button
                        type="button"
                        aria-label="Search and switch applicant"
                        aria-expanded={candidateSearchOpen}
                        onClick={() => {
                          setCandidateSearchOpen((open) => !open);
                          setCandidateSearchQuery('');
                          window.setTimeout(() => candidateSearchInputRef.current?.focus(), 0);
                        }}
                        className="rounded p-0.5 text-[#666] hover:bg-blue-50 hover:text-[#1877F2] dark:hover:bg-[#333]"
                        title="Search applicants"
                      >
                        <Search className="h-3.5 w-3.5" />
                      </button>
                      {candidateSearchOpen && (
                        <div className="absolute left-0 top-full z-50 mt-1 w-[min(320px,calc(100vw-40px))] rounded-md border border-[#CBD5E1] bg-white p-2 shadow-xl dark:border-[#444] dark:bg-[#252525]" onClick={(event) => event.stopPropagation()}>
                          <label className="flex items-center gap-2 rounded border border-[#2F80ED] px-2 py-1.5 text-[#6B7280] dark:text-[#AAA]">
                            <input
                              ref={candidateSearchInputRef}
                              autoFocus
                              value={candidateSearchQuery}
                              onChange={(event) => setCandidateSearchQuery(event.target.value)}
                              onKeyDown={(event) => { if (event.key === 'Escape') setCandidateSearchOpen(false); if (event.key === 'Enter' && matchingApplicants[0]) selectSearchedApplicant(matchingApplicants[0]); }}
                              placeholder="Enter the ID or name to search an applicant"
                              aria-label="Search applicant by ID or name"
                              className="min-w-0 flex-1 bg-transparent text-xs text-[#333] outline-none dark:text-white"
                            />
                            <Search className="h-3.5 w-3.5 shrink-0" />
                          </label>
                          <div className="max-h-64 overflow-y-auto pt-1">
                            {candidateSearchQuery.trim().length < 3 ? (
                              <p className="px-1 py-1.5 text-[11px] text-[#64748B] dark:text-[#AAB2BF]">Please enter {3 - candidateSearchQuery.trim().length} more character{3 - candidateSearchQuery.trim().length === 1 ? '' : 's'}</p>
                            ) : matchingApplicants.length ? matchingApplicants.map((candidate) => (
                              <button key={candidate.id} type="button" onClick={() => selectSearchedApplicant(candidate)} className="block w-full rounded px-2 py-2 text-left hover:bg-[#EFF6FF] dark:hover:bg-[#333]">
                                <span className="block truncate text-xs font-medium text-[#334155] dark:text-white">{candidate.applicantId} Ã‚Â· {candidate.name}</span>
                                <span className="block truncate text-[10px] text-[#64748B] dark:text-[#AAB2BF]">{candidate.email}</span>
                              </button>
                            )) : <p className="px-2 py-2 text-xs text-[#64748B] dark:text-[#AAB2BF]">No applicants found.</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-[#4B5563] dark:text-[#D1D5DB]">
                    {applicant.currentDesignation || 'Technical Support Engineer (L2)'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-[#2F80ED]" />
                      {applicant.location || 'Coimbatore, Tamil Nadu, India'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-[#2F80ED]" />
                      {applicant.phone || '+91 7667560620'}
                    </span>
                    <button type="button" onClick={openEmailComposer} className="flex items-center gap-1 text-[#2F80ED] hover:underline">
                      <Mail className="h-3 w-3" />
                      {applicant.email || 'sivakrishnanckmilsamy@gmail.com'}
                    </button>
                  </div>

                  <p className="text-[10px] text-[#888] dark:text-[#888]">
                    Last viewed by - <span className="font-medium text-[#444] dark:text-[#BBB]">{currentUser?.name || 'Ganesh Godse'}</span>
                  </p>
                  <p className="text-[10px] text-[#888] dark:text-[#888]">
                    Created By &amp; On - <span className="font-medium text-[#444] dark:text-[#BBB]">{applicant.createdBy || applicant.assignedRecruiter || 'Ganesh Kshirsagar'}</span> &amp; <span>{applicant.createdDate || applicant.createdOn || '19/11/2026 18:39:40'}</span>
                  </p>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={startEditPersonal}
                      className="rounded border border-[#2F80ED] bg-white px-2.5 py-1 text-xs font-medium text-[#2F80ED] hover:bg-blue-50 dark:bg-transparent dark:hover:bg-[#333]"
                    >
                      Edit Applicant
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsResumePanelOpen(true)}
                      className="rounded border border-[#2F80ED] bg-white px-2.5 py-1 text-xs font-medium text-[#2F80ED] hover:bg-blue-50 dark:bg-transparent dark:hover:bg-[#333]"
                    >
                      View Resume
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('matching-jobs', applicant.id)}
                      className="rounded border border-[#7C3AED] bg-[#F5F3FF] px-2.5 py-1 text-xs font-semibold text-[#7C3AED] hover:bg-[#EDE9FE] dark:bg-[#311B47] dark:text-[#C4B5FD]"
                    >
                      Matching Jobs
                    </button>
                    <button
                      type="button"
                      onClick={() => setDialog('create-resume')}
                      className="rounded border border-[#2F80ED] bg-white px-2.5 py-1 text-xs font-medium text-[#2F80ED] hover:bg-blue-50 dark:bg-transparent dark:hover:bg-[#333]"
                    >
                      Create Resume Builder
                    </button>

                    {/* More dropdown */}
                    <div className="relative" ref={actionMenuRef}>
                      <button
                        ref={actionMenuButtonRef}
                        type="button"
                        onClick={() => setActionMenuOpen((prev) => !prev)}
                        aria-haspopup="menu"
                        aria-expanded={actionMenuOpen}
                        className="flex items-center gap-1 rounded border border-[#CED4DA] bg-white px-2.5 py-1 text-xs font-medium text-[#444] hover:bg-gray-50 dark:border-[#444] dark:bg-[#333] dark:text-white"
                      >
                        <span>More</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      {actionMenuOpen && createPortal(
                        <div
                          ref={actionMenuRef}
                          role="menu"
                          aria-label="Applicant actions"
                          className="fixed z-[100] w-52 overflow-y-auto rounded-md border border-[#CED4DA] bg-white py-1 shadow-xl dark:border-[#444] dark:bg-[#1E293B]"
                          style={{
                            top: actionMenuPosition.top,
                            left: actionMenuPosition.left,
                            maxHeight: actionMenuPosition.maxHeight
                          }}
                        >
                          {[
                            'Bench Marketing Jobs',
                            'Timeline Activities',
                            'Create Task',
                            'Add Note',
                            'Matching Jobs',
                            'Send Email'
                          ].map((item) => (
                            <button
                              key={item}
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setActionMenuOpen(false);
                                if (item === 'Timeline Activities') setIsTimelineDrawerOpen(true);
                                else if (item === 'Create Task') setDialog('task');
                                else if (item === 'Add Note') setDialog('note');
                                else if (item === 'Matching Jobs') navigate('matching-jobs', applicant.id);
                                else if (item === 'Send Email') openEmailComposer();
                                else showToast(`${item} recorded.`);
                              }}
                              className="block w-full px-3 py-1.5 text-left text-xs text-[#333] hover:bg-gray-100 hover:text-[#1877F2] dark:text-white dark:hover:bg-[#333]"
                            >
                              {item}
                            </button>
                          ))}
                        </div>,
                        document.body
                      )}
                    </div>
                  </div>

                  {/* Add Tag */}
                  <div className="flex min-h-6 flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-xs">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded bg-[#EBF3FB] px-2 py-0.5 text-[10px] font-medium text-[#18558A] dark:bg-[#1E3A5A] dark:text-[#90CDF4]"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => setTags(tags.filter((x) => x !== t))}
                          className="hover:text-red-500"
                        >
                          <X className="h-2.5 w-2.5" aria-hidden="true" />
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => setDialog('tag')}
                      className="text-xs font-medium text-[#2F80ED] hover:underline"
                    >
                      + Add Tag
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Rating Block & Next/Prev Navigation */}
              <div className="flex flex-col items-end space-y-2 border-t pt-3 lg:border-t-0 lg:pt-0 dark:border-[#333]">
                <div className="flex items-center gap-3">
                  <div className="flex rounded border border-[#CED4DA] p-0.5 text-xs font-semibold dark:border-[#444]">
                    <button
                      type="button"
                      onClick={() => setHeaderViewMode('applicant')}
                      className={`px-2 py-0.5 rounded-sm transition-colors ${
                        headerViewMode === 'applicant' ? 'bg-[#2F80ED] text-white' : 'text-[#666] hover:bg-gray-100 dark:hover:bg-[#333]'
                      }`}
                    >
                      Applicant
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeaderViewMode('submission')}
                      className={`px-2 py-0.5 rounded-sm transition-colors ${
                        headerViewMode === 'submission' ? 'bg-[#2F80ED] text-white' : 'text-[#666] hover:bg-gray-100 dark:hover:bg-[#333]'
                      }`}
                    >
                      Submission
                    </button>
                  </div>

                  <div className="flex items-center gap-1 text-[#666]">
                    <button
                      type="button"
                      disabled={currentIndex <= 0}
                      onClick={handlePrevCandidate}
                      className="rounded border border-[#CED4DA] p-1 hover:bg-gray-100 disabled:opacity-40 dark:border-[#444] dark:hover:bg-[#333]"
                      title="Previous Applicant"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      disabled={currentIndex >= allApplicants.length - 1}
                      onClick={handleNextCandidate}
                      className="rounded border border-[#CED4DA] p-1 hover:bg-gray-100 disabled:opacity-40 dark:border-[#444] dark:hover:bg-[#333]"
                      title="Next Applicant"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Rating Stars Grid */}
                <div className="w-52 space-y-1 text-right text-[11px] text-[#666] dark:text-[#AAA]">
                  {[
                    { label: 'Technical Skills', key: 'technical' as const },
                    { label: 'Communication Skills', key: 'communication' as const },
                    { label: 'Professionalism', key: 'professionalism' as const },
                    { label: 'Overall Rating', key: 'overall' as const }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <span className="text-[10px]">{item.label} :</span>
                      <div className="flex text-[#F2B705]">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3 w-3 cursor-pointer ${s <= ratings[item.key] ? 'fill-[#F2B705]' : 'text-gray-300'}`}
                            onClick={() => setRatings({ ...ratings, [item.key]: s })}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  <p className="pt-0.5 text-[10px] text-[#888]">Last rating - N/A</p>
                  <button
                    type="button"
                    onClick={() => setDialog('rating')}
                    className="mt-1 rounded bg-[#2F80ED] px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-[#1D6FD8]"
                  >
                    Rating History
                  </button>
                </div>
              </div>
            </div>
          </div>

          {activeSubTab === 'Snapshot' && (
            <>
              {/* 2. Notes Section */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs dark:border-[#333] dark:bg-[#1E293B]">
            <div className="flex flex-wrap items-center justify-between border-b border-[#E2E8F0] px-4 py-2.5 dark:border-[#333]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1F2937] dark:text-white">Notes</span>
                <button
                  type="button"
                  onClick={() => setActiveNotesFilter('applicants')}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                    activeNotesFilter === 'applicants' ? 'bg-[#2F80ED] text-white' : 'border border-[#CBD5E1] text-[#666]'
                  }`}
                >
                  Applicants ({notesSourceCounts.applicants})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNotesFilter('submissions')}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                    activeNotesFilter === 'submissions' ? 'bg-[#2F80ED] text-white' : 'border border-[#CBD5E1] text-[#666]'
                  }`}
                >
                  Submissions ({notesSourceCounts.submissions})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNotesFilter('pipeline')}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                    activeNotesFilter === 'pipeline' ? 'bg-[#2F80ED] text-white' : 'border border-[#CBD5E1] text-[#666]'
                  }`}
                >
                  Pipeline ({notesSourceCounts.pipeline})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="Filter Notes"
                  aria-label="Filter notes"
                  aria-expanded={notesFilterOpen}
                  onClick={() => setNotesFilterOpen((open) => !open)}
                  className="rounded p-1 text-[#666] hover:bg-gray-100 dark:hover:bg-[#333]"
                >
                  <Filter className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNoteSubject(`New Note Created for ${displayName} - ${displayId}.`);
                    setDialog('note');
                  }}
                  className="rounded bg-[#2F80ED] px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-[#1D6FD8] transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>

            {notesFilterOpen && <div className="grid grid-cols-1 gap-3 border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 dark:border-[#333] dark:bg-[#202020] sm:grid-cols-2 xl:grid-cols-5">
              <label className="space-y-1 text-[10px] font-semibold text-[#64748B]">Search notes<input type="search" value={notesSearch} onChange={(event) => setNotesSearch(event.target.value)} placeholder="Subject, text, job, clientâ€¦" className="block w-full rounded border border-[#CBD5E1] bg-white px-2 py-1.5 text-xs font-normal text-[#334155] dark:border-[#444] dark:bg-[#333] dark:text-white" /></label>
              <label className="space-y-1 text-[10px] font-semibold text-[#64748B]">Added by<select value={notesAuthorFilter} onChange={(event) => setNotesAuthorFilter(event.target.value)} className="block w-full rounded border border-[#CBD5E1] bg-white px-2 py-1.5 text-xs font-normal text-[#334155] dark:border-[#444] dark:bg-[#333] dark:text-white"><option value="">Any author</option>{notesAuthorOptions.map((author) => <option key={author} value={author}>{author}</option>)}</select></label>
              <label className="space-y-1 text-[10px] font-semibold text-[#64748B]">Priority<select value={notesPriorityFilter} onChange={(event) => setNotesPriorityFilter(event.target.value)} className="block w-full rounded border border-[#CBD5E1] bg-white px-2 py-1.5 text-xs font-normal text-[#334155] dark:border-[#444] dark:bg-[#333] dark:text-white"><option value="">Any priority</option><option>Urgent</option><option>High</option><option>Medium</option><option>Low</option></select></label>
              <label className="space-y-1 text-[10px] font-semibold text-[#64748B]">From date<input type="date" value={notesDateFrom} onChange={(event) => setNotesDateFrom(event.target.value)} className="block w-full rounded border border-[#CBD5E1] bg-white px-2 py-1.5 text-xs font-normal text-[#334155] dark:border-[#444] dark:bg-[#333] dark:text-white" /></label>
              <label className="space-y-1 text-[10px] font-semibold text-[#64748B]">To date<input type="date" value={notesDateTo} onChange={(event) => setNotesDateTo(event.target.value)} className="block w-full rounded border border-[#CBD5E1] bg-white px-2 py-1.5 text-xs font-normal text-[#334155] dark:border-[#444] dark:bg-[#333] dark:text-white" /></label>
              <div className="flex items-end justify-between gap-2 sm:col-span-2 xl:col-span-5"><span className="text-[11px] text-[#64748B]">Showing {filteredNotes.length} of {notesSourceCounts[activeNotesFilter]} notes</span><button type="button" onClick={() => { setNotesSearch(''); setNotesAuthorFilter(''); setNotesPriorityFilter(''); setNotesDateFrom(''); setNotesDateTo(''); }} className="text-[11px] font-semibold text-[#2F80ED] hover:underline">Clear filters</button></div>
            </div>}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-semibold uppercase tracking-wider text-[#64748B] dark:border-[#333] dark:bg-[#202020]">
                    <th className="px-4 py-2">Added By / On</th>
                    <th className="px-4 py-2">Notes / Description</th>
                    <th className="px-4 py-2 text-right">Action / Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#333]">
                  {filteredNotes.length > 0 ? (
                    filteredNotes.map((n) => (
                      <tr key={n.id} className="hover:bg-gray-50 dark:hover:bg-[#202020]">
                        <td className="whitespace-nowrap px-4 py-2.5 text-[#555] dark:text-[#AAA]">
                          <span className="font-medium text-[#222] dark:text-white">{n.author}</span>
                          <span className="block text-[10px] text-[#888]">{n.date}</span>
                        </td>
                        <td className="px-4 py-2.5 text-[#333] dark:text-[#DDD]">
                          {n.subject && (
                            <div className="font-semibold text-xs text-[#1F2937] dark:text-white mb-0.5">
                              {n.subject}
                            </div>
                          )}
                          <div className="whitespace-pre-wrap">{n.text}</div>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-[#666] dark:text-[#AAA]">
                            {n.job && <span className="text-[#2F80ED]">Job: {n.job}</span>}
                            {n.client && <span>Client: {n.client}</span>}
                            {n.action && <span className="rounded bg-gray-100 px-1.5 py-0.2 dark:bg-[#333]">Action: {n.action}</span>}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right font-medium">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            n.priority === 'Urgent' || n.priority === 'High'
                              ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                              : 'bg-blue-50 text-[#2F80ED] dark:bg-blue-950/40 dark:text-blue-300'
                          }`}>
                            {n.priority || 'Medium'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-xs text-[#888]">
                        {noteEntries.some((note) => note.source === activeNotesFilter) ? 'No notes match the selected filters.' : 'No data available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Documents Section */}
          <div className="relative z-40 rounded-xl border border-[#E2E8F0] bg-white shadow-xs dark:border-[#333] dark:bg-[#1E293B]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-2.5 dark:border-[#333]">
              <span className="text-sm font-semibold text-[#1F2937] dark:text-white">Documents</span>
              <div className="flex items-center divide-x divide-[#CBD5E1] rounded border border-[#CBD5E1] text-[#687789] dark:divide-[#444] dark:border-[#444] dark:text-[#AAA]">
                <button type="button" title="Share selected documents" onClick={() => void runDocumentToolbarAction('share')} className="p-1.5 hover:bg-[#EFF6FF] hover:text-[#2F80ED]"><Share2 className="h-3.5 w-3.5" /></button>
                <button type="button" title="Copy selected documents" onClick={() => void runDocumentToolbarAction('copy')} className="p-1.5 hover:bg-[#EFF6FF] hover:text-[#2F80ED]"><Copy className="h-3.5 w-3.5" /></button>
                <button type="button" title="Download selected documents" onClick={() => void runDocumentToolbarAction('download')} className="p-1.5 hover:bg-[#EFF6FF] hover:text-[#2F80ED]"><Download className="h-3.5 w-3.5" /></button>
                <button type="button" title="Add Document" onClick={() => setDocumentFormOpen((open) => !open)} className="p-1.5 hover:bg-[#EFF6FF] hover:text-[#2F80ED]"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            {documentFormOpen && <div className="border-b border-[#E2E8F0] px-4 py-4 dark:border-[#333]">
              <div className="grid gap-4 md:grid-cols-3">
                <label className="block space-y-1 text-[11px] text-[#64748B]">Document Type<select value={documentType} onChange={(event) => setDocumentType(event.target.value)} className="w-full border border-[#CBD5E1] bg-[#F8F8F8] px-2 py-2 text-xs text-[#334155] dark:border-[#444] dark:bg-[#333] dark:text-white"><option value="">Select</option>{['Driving License', 'EMI File', 'Employment Application Form', 'Interview Feedback', 'Passport', 'Resume', 'SSN', 'Transcripts'].map((type) => <option key={type}>{type}</option>)}</select></label>
                <label className="block space-y-1 text-[11px] text-[#64748B]">Document Title<input value={documentTitle} onChange={(event) => setDocumentTitle(event.target.value)} placeholder="Enter document title" className="w-full border border-[#CBD5E1] bg-[#F8F8F8] px-2 py-2 text-xs text-[#334155] dark:border-[#444] dark:bg-[#333] dark:text-white" /></label>
                <label className="block space-y-1 text-[11px] text-[#64748B]">Upload Document<input type="file" onChange={(event) => setDocumentFile(event.target.files?.[0] || null)} className="block w-full text-[11px] text-[#334155] file:mr-2 file:border file:border-[#CBD5E1] file:bg-white file:px-2 file:py-1.5 dark:text-white" /></label>
              </div>
              <label className="mt-3 block space-y-1 text-[11px] text-[#64748B]">Description<textarea rows={2} value={documentDescription} onChange={(event) => setDocumentDescription(event.target.value)} className="w-full resize-y border border-[#CBD5E1] bg-[#F8F8F8] p-2 text-xs text-[#334155] dark:border-[#444] dark:bg-[#333] dark:text-white" /></label>
              <div className="mt-3 flex gap-2"><button type="button" onClick={() => void handleDocumentUpload()} className="rounded bg-[#2F80ED] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1D6FD8]">Save</button><button type="button" onClick={() => { setDocumentFormOpen(false); setDocumentFile(null); setDocumentTitle(''); setDocumentDescription(''); }} className="rounded border border-[#CBD5E1] bg-white px-4 py-2 text-xs text-[#64748B] hover:bg-gray-50 dark:border-[#444] dark:bg-[#333] dark:text-white">Cancel</button></div>
            </div>}

            <div className="space-y-2 p-3">
              {applicantDocuments.map((doc) => <div key={doc.id} className={`group flex items-start justify-between gap-3 rounded-sm px-2 py-3 transition-colors ${selectedDocumentIds.includes(doc.id) ? 'bg-[#DDF1FB]' : 'hover:bg-[#DDF1FB] dark:hover:bg-[#303840]'}`}>
                <div className="flex min-w-0 items-start gap-3">
                  <input type="checkbox" aria-label={`Select ${doc.name}`} checked={selectedDocumentIds.includes(doc.id)} onChange={(event) => setSelectedDocumentIds((ids) => event.target.checked ? [...new Set([...ids, doc.id])] : ids.filter((id) => id !== doc.id))} className={`mt-1 h-4 w-4 shrink-0 accent-[#2F80ED] ${selectedDocumentIds.includes(doc.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}`} />
                  <button type="button" title={`View ${doc.name}`} onClick={() => viewApplicantDocument(doc)} className="mt-0.5 shrink-0 text-[#F04452] hover:text-[#C92A3A]"><FileText className="h-5 w-5" /></button>
                  <button type="button" onClick={() => viewApplicantDocument(doc)} className="min-w-0 text-left">
                    <span className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-[#1F2937] hover:text-[#2F80ED] dark:text-white"><span className="break-all">{doc.title || doc.name}</span><Check className="h-3.5 w-3.5 rounded-full bg-[#68C17B] p-0.5 text-white" /></span>
                    <span className="mt-1 block text-[11px] text-[#526174] dark:text-[#AAB2BF]">Created By {doc.createdBy || applicant.createdBy || currentUser?.name || 'User'} on {doc.date || applicant.createdDate || 'N/A'} <span className="text-[#2F80ED]">|</span> Modified By {doc.modifiedBy || doc.createdBy || applicant.createdBy || currentUser?.name || 'User'}</span>
                    <span className="block text-[10px] text-[#64748B] dark:text-[#9CA3AF]">Comments {doc.comments || doc.description || 'N/A'}{doc.size ? ` Ã‚Â· ${doc.size}` : ''}</span>
                  </button>
                </div>
                <div className="relative shrink-0">
                  <button type="button" aria-label={`Options for ${doc.name}`} aria-expanded={documentMenuId === doc.id} onClick={() => setDocumentMenuId((id) => id === doc.id ? null : doc.id)} className="rounded p-1 text-[#718096] hover:bg-white hover:text-[#222]"><MoreVertical className="h-4 w-4" /></button>
                  {documentMenuId === doc.id && <div className="absolute right-0 top-full z-[60] mt-1 w-36 rounded border border-[#CBD5E1] bg-white py-1 shadow-lg dark:border-[#444] dark:bg-[#252525]">
                    <button type="button" onClick={() => { viewApplicantDocument(doc); setDocumentMenuId(null); }} className="block w-full px-3 py-2 text-left text-xs hover:bg-[#EFF6FF] dark:hover:bg-[#333]">View</button>
                    <button type="button" onClick={() => { downloadApplicantDocument(doc); setDocumentMenuId(null); }} className="block w-full px-3 py-2 text-left text-xs hover:bg-[#EFF6FF] dark:hover:bg-[#333]">Download</button>
                    <button type="button" onClick={async () => { const name = window.prompt('Document title', doc.title || doc.name); if (name?.trim()) { await persistApplicantDocuments(applicantDocuments.map((item) => item.id === doc.id ? { ...item, name: name.trim(), title: name.trim(), modifiedBy: currentUser?.name || 'Current User', date: new Date().toLocaleString() } : item)); showToast('Document title updated.'); } setDocumentMenuId(null); }} className="block w-full px-3 py-2 text-left text-xs hover:bg-[#EFF6FF] dark:hover:bg-[#333]">Rename</button>
                    <button type="button" onClick={async () => { if (window.confirm(`Delete ${doc.name}?`)) { await persistApplicantDocuments(applicantDocuments.filter((item) => item.id !== doc.id)); setSelectedDocumentIds((ids) => ids.filter((id) => id !== doc.id)); showToast('Document deleted.'); } setDocumentMenuId(null); }} className="block w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 dark:hover:bg-[#333]">Delete</button>
                  </div>}
                </div>
              </div>)}
              {applicantDocuments.length === 0 && !documentFormOpen && <p className="px-2 py-6 text-center text-xs text-[#64748B]">No documents uploaded yet.</p>}
            </div>
          </div>

          {documentShareOpen && <div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/50 p-4 pt-[15vh]" onClick={() => setDocumentShareOpen(false)}>
            <div role="dialog" aria-modal="true" aria-labelledby="document-share-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-md border border-[#CBD5E1] bg-white shadow-2xl dark:border-[#444] dark:bg-[#252525]">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3 dark:border-[#333]"><h2 id="document-share-title" className="text-lg font-medium text-[#334155] dark:text-white">Documents Sharing</h2><button type="button" aria-label="Close sharing dialog" onClick={() => setDocumentShareOpen(false)}><X className="h-5 w-5 text-[#777]" /></button></div>
              <div className="px-5 py-8"><label className="mb-3 block text-xs text-[#64748B]">Choose the users below to share the selected documents</label><select value={documentShareRecipient} onChange={(event) => setDocumentShareRecipient(event.target.value)} className="w-full border border-[#CBD5E1] bg-[#F8F8F8] px-2.5 py-2 text-xs dark:border-[#444] dark:bg-[#333] dark:text-white"><option value="">Select a user</option>{Array.from(new Set([currentUser?.name || '', ...allApplicants.map((item) => item.assignedRecruiter).filter(Boolean), 'Recruiting Team'].filter(Boolean))).map((name) => <option key={name} value={name}>{name}</option>)}</select></div>
              <div className="flex justify-end gap-2 border-t border-[#E2E8F0] px-5 py-3 dark:border-[#333]"><button type="button" onClick={shareApplicantDocuments} className="rounded bg-[#2F80ED] px-5 py-2 text-xs font-semibold text-white">Share</button><button type="button" onClick={() => setDocumentShareOpen(false)} className="rounded border border-[#CBD5E1] px-4 py-2 text-xs text-[#555] dark:border-[#444] dark:text-white">Cancel</button></div>
            </div>
          </div>}

          {/* 4. Submissions Section */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs dark:border-[#333] dark:bg-[#1E293B]">
            <div className="flex flex-wrap items-center justify-between border-b border-[#E2E8F0] px-4 py-2.5 dark:border-[#333]">
              <span className="text-xs font-bold text-[#1F2937] dark:text-white">Submissions</span>
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                {[
                  { label: 'Pipeline', key: 'pipeline', count: submissionCounts.pipeline },
                  { label: 'All', key: 'all', count: submissionCounts.all },
                  { label: 'Client Submissions', key: 'client', count: submissionCounts.client },
                  { label: 'Interviews', key: 'interview', count: submissionCounts.interview },
                  { label: 'Confirmations', key: 'confirmation', count: submissionCounts.confirmation },
                  { label: 'Placements', key: 'placement', count: submissionCounts.placement },
                  { label: 'Not Joined', key: 'not-joined', count: submissionCounts['not-joined'] }
                ].map((item) => (
                  <button key={item.key} type="button" onClick={() => setActiveSubmissionsFilter(item.key as typeof activeSubmissionsFilter)} className={`rounded-full px-2.5 py-0.5 font-semibold transition-colors ${activeSubmissionsFilter === item.key ? 'bg-[#2F80ED] text-white' : 'border border-[#CBD5E1] text-[#666] hover:bg-gray-50 dark:hover:bg-[#333]'}`}>
                    {item.label} ({item.count})
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead><tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-semibold uppercase tracking-wider text-[#64748B] dark:border-[#333] dark:bg-[#202020]">
                  <th className="px-4 py-2">Job Details</th><th className="px-4 py-2">Submission Details</th><th className="px-4 py-2">Submitted By</th><th className="px-4 py-2">Client Bill Rate</th><th className="px-4 py-2">Pay Rate</th>
                </tr></thead>
                <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#333]">
                  {filteredApplicantSubmissions.length === 0 ? <tr><td colSpan={5} className="px-4 py-6 text-center text-xs text-[#888]">No data available</td></tr> : filteredApplicantSubmissions.map((submission) => {
                    const currentStage = getSubmissionStageIndex(submission.status);
                    const steps = ['Pipeline', 'Submission', 'Client Submission', 'Interview', 'Confirmation', 'Placement', 'Not Joined'];
                    const history = submission.statusHistory || [{ status: submission.status, changedAt: submission.submittedDate }];
                    return <React.Fragment key={submission.id}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-[#202020]">
                        <td className="px-4 py-3"><div className="flex items-center gap-1.5"><button type="button" onClick={() => navigate('job-detail', submission.jobId)} className="flex items-center gap-1.5 text-left font-semibold text-[#18558A] hover:underline dark:text-[#90CDF4]">{submission.jobTitle}<Briefcase className="h-3 w-3 shrink-0 text-[#2F80ED]" /></button><button type="button" title="Job Details Quick View" aria-label={`Quick view ${submission.jobTitle}`} onClick={() => void openSubmissionJobQuickView(submission)} className="rounded p-0.5 text-[#2F80ED] hover:bg-blue-50 dark:hover:bg-[#333]"><Eye className="h-3.5 w-3.5" /></button></div><span className="text-[11px] text-[#666] dark:text-[#AAA]">{submission.client || 'â€”'}</span></td>
                        <td className="px-4 py-3"><span className="block font-medium text-[#18558A] dark:text-[#90CDF4]">Submission #{submission.submissionId}</span><span className="mt-1 block max-w-[300px] text-xs font-semibold text-emerald-700 dark:text-emerald-400">{submission.status}</span></td>
                        <td className="px-4 py-3 text-[#555] dark:text-[#AAA]"><span className="block font-medium text-[#222] dark:text-white">{submission.recruiter || 'â€”'}</span><span className="text-[10px] text-[#888]">{submission.submittedDate}</span></td>
                        <td className="px-4 py-3 font-mono text-[#555] dark:text-[#AAA]">{submission.billRate ? submission.billRate.toLocaleString() : 'N/A'}</td><td className="px-4 py-3 font-mono text-[#555] dark:text-[#AAA]">{submission.payRate ? submission.payRate.toLocaleString() : 'N/A'}</td>
                      </tr>
                      <tr><td colSpan={5} className="border-t border-[#E2E8F0] px-4 py-4 dark:border-[#333]"><div className="flex items-start">{steps.map((step, index) => {
                        const state = index === 0 || index < currentStage ? 'completed' : index === currentStage ? 'active' : 'upcoming';
                        const entry = history.filter((item) => getSubmissionStageIndex(item.status) === index).slice(-1)[0];
                        const timestamp = index === 1 ? submission.submittedDate : entry?.changedAt;
                        return <div key={step} className="flex min-w-0 flex-1 flex-col items-center text-center"><div className="relative flex w-full items-center">{index > 0 && <div className={`h-0.5 flex-1 ${index <= currentStage ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`} />}<div className={`mx-auto flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white ${state === 'completed' || state === 'active' ? 'bg-emerald-500' : 'border border-gray-400 bg-white dark:bg-[#333]'}`}>{state === 'active' ? <Check className="h-2.5 w-2.5" /> : ''}</div>{index < steps.length - 1 && <div className={`h-0.5 flex-1 ${index < currentStage ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`} />}</div><span className="mt-1 text-[10px] font-medium text-[#333] dark:text-[#DDD]">{step}</span>{timestamp && <span className="mt-0.5 text-[9px] text-[#888]">{timestamp}</span>}</div>;
                      })}</div></td></tr>
                    </React.Fragment>;
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {quickViewJob && (() => {
            const jobSubmissions = submissionRecords.filter((record) => record.jobId === quickViewJob.id);
            const pipelineCount = jobSubmissions.filter((record) => getSubmissionStageIndex(record.status) <= 1 && !/disqualified|rejected/i.test(record.status)).length;
            const clientCount = jobSubmissions.filter((record) => getSubmissionStageIndex(record.status) === 2).length;
            const interviewCount = jobSubmissions.filter((record) => getSubmissionStageIndex(record.status) === 3).length;
            const hireCount = jobSubmissions.filter((record) => getSubmissionStageIndex(record.status) >= 4).length;
            const detailValue = (key: string): string => String(quickViewJob.customFields?.[key] || 'N/A');
            return <div className="fixed inset-0 z-[80] flex justify-end bg-black/50" onClick={() => setQuickViewJob(null)}>
              <aside role="dialog" aria-modal="true" aria-label={`Job details quick view: ${quickViewJob.title}`} onClick={(event) => event.stopPropagation()} className="flex h-full w-full flex-col border-l border-[#D5D9DE] bg-white shadow-2xl sm:w-[min(56vw,900px)] dark:border-[#444] dark:bg-[#252525]">
                <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#D7DCE2] px-4 py-3 dark:border-[#444]">
                  <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-[#1877F2]"><Briefcase className="h-4 w-4 shrink-0" /><span className="truncate">{quickViewJob.code} {quickViewJob.title}</span></div>
                  <div className="flex shrink-0 items-center gap-2"><button type="button" onClick={() => navigate('job-detail', quickViewJob.id)} className="rounded border border-[#CBD5E1] px-2.5 py-1.5 text-[11px] text-[#475569] hover:bg-[#F1F5F9] dark:border-[#444] dark:text-white dark:hover:bg-[#333]">Open Job Details</button><button type="button" aria-label="Close job details quick view" onClick={() => setQuickViewJob(null)} className="rounded p-1 text-[#6B7280] hover:bg-[#F1F3F5] dark:hover:bg-[#333]"><X className="h-5 w-5" /></button></div>
                </header>
                <div className="shrink-0 bg-[#EEF0F2] px-4 py-4 dark:bg-[#303030]">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[10px] sm:grid-cols-2"><div><span className="block uppercase tracking-wide text-[#64748B]">Pay Rate / Salary</span><span className="mt-0.5 block font-semibold text-[#252525] dark:text-white">{quickViewJob.currency || 'INR'} {quickViewJob.payRate ? quickViewJob.payRate.toLocaleString() : 'N/A'} / {quickViewJob.rateType || 'Yearly'}</span></div><div><span className="block uppercase tracking-wide text-[#64748B]">Client</span><span className="mt-0.5 block font-semibold text-[#252525] dark:text-white">{quickViewJob.client}</span></div><div><span className="block uppercase tracking-wide text-[#64748B]">Country</span><span className="mt-0.5 block font-semibold text-[#252525] dark:text-white">{detailValue('country')}</span></div><div><span className="block uppercase tracking-wide text-[#64748B]">Job Status</span><span className="mt-0.5 block font-semibold text-[#252525] dark:text-white">{quickViewJob.status}</span></div><div className="col-span-2"><span className="block uppercase tracking-wide text-[#64748B]">Location</span><span className="mt-1 inline-block rounded bg-white px-2 py-1 text-[10px] font-medium text-[#334155] dark:bg-[#252525] dark:text-white">{quickViewJob.location || 'N/A'}</span></div></div>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">{[{ label: '# OF SUBMISSIONS', value: jobSubmissions.length, color: 'text-[#1F2937]' }, { label: '# OF PIPELINE', value: pipelineCount, color: 'text-[#1F2937]' }, { label: '# OF CLIENT SUBMISSIONS', value: clientCount, color: 'text-red-500' }, { label: '# OF INTERVIEWS', value: interviewCount, color: 'text-amber-500' }, { label: '# OF HIRES', value: hireCount, color: 'text-blue-500' }].map((item) => <div key={item.label} className="rounded-sm bg-white px-2 py-2 text-center shadow-sm dark:bg-[#252525]"><span className={`block text-lg font-semibold ${item.color}`}>{item.value}</span><span className="block text-[8px] font-semibold text-[#334155] dark:text-[#AAA]">{item.label}</span></div>)}</div>
                </div>
                <nav className="flex shrink-0 items-center gap-1 border-b border-[#E2E8F0] px-4 pt-3 dark:border-[#444]">{[{ id: 'details', label: 'Job Details' }, { id: 'skills', label: 'Skills & Job Description' }, { id: 'notes', label: `Notes (${quickViewJob.notes?.length || 0})` }, { id: 'email', label: 'Email Merges' }].map((tab) => <button key={tab.id} type="button" onClick={() => setQuickViewTab(tab.id as typeof quickViewTab)} className={`border-b-2 px-2.5 py-2 text-[11px] ${quickViewTab === tab.id ? 'border-[#2F80ED] bg-[#2F80ED] font-semibold text-white' : 'border-transparent text-[#555] hover:bg-[#F1F5F9] dark:text-[#CCC] dark:hover:bg-[#333]'}`}>{tab.label}</button>)}</nav>
                <div className="min-h-0 flex-1 overflow-y-auto p-4 text-xs">
                  {quickViewTab === 'details' && <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">{[['Client Bill Rate / Salary', quickViewJob.billRate ? `${quickViewJob.currency || 'INR'} ${quickViewJob.billRate.toLocaleString()}` : 'N/A'], ['Required Documents for Submission', detailValue('requiredDocuments')], ['End Client', detailValue('endClient')], ['Duration', quickViewJob.duration || 'N/A'], ['Tax Terms', detailValue('taxTerms')], ['Work Authorization', detailValue('workAuthorization')], ['Interview Mode', detailValue('interviewMode')], ['Experience', quickViewJob.experienceRequired || 'N/A'], ['Assigned To', quickViewJob.assignedTo || quickViewJob.assignedRecruiter || 'N/A'], ['Job Type', quickViewJob.type]].map(([label, value]) => <div key={label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3"><span className="text-[#7B8490]">{label}</span><span className="font-medium text-[#252525] dark:text-white">{value}</span></div>)}</div>}
                  {quickViewTab === 'skills' && <div className="space-y-4"><div><h3 className="mb-2 font-semibold text-[#334155] dark:text-white">Skills</h3><div className="flex flex-wrap gap-1.5">{(quickViewJob.primarySkills?.length ? quickViewJob.primarySkills : quickViewJob.skills).map((skill) => <span key={skill} className="rounded border border-[#D7E5F2] bg-[#EFF6FC] px-2 py-1 text-[#334155] dark:border-[#444] dark:bg-[#333] dark:text-white">{skill}</span>)}</div></div><div><h3 className="mb-2 font-semibold text-[#334155] dark:text-white">Job Description</h3><p className="whitespace-pre-wrap leading-relaxed text-[#475569] dark:text-[#CCC]">{quickViewJob.description || 'No job description available.'}</p></div></div>}
                  {quickViewTab === 'notes' && (quickViewJob.notes?.length ? <div className="space-y-3">{quickViewJob.notes.map((note) => <article key={note.id} className="border-b border-[#E2E8F0] pb-3 dark:border-[#444]"><p className="font-semibold text-[#334155] dark:text-white">{note.author} <span className="font-normal text-[#64748B]">Â· {note.date}</span></p><p className="mt-1 whitespace-pre-wrap text-[#475569] dark:text-[#CCC]">{note.text}</p></article>)}</div> : <p className="py-8 text-center text-[#64748B]">No job notes available.</p>)}
                  {quickViewTab === 'email' && <p className="py-8 text-center text-[#64748B]">No email merges available.</p>}
                </div>
              </aside>
            </div>;
          })()}
          {/* 5. eInterviews Section */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs dark:border-[#333] dark:bg-[#1E293B]">
            <div className="border-b border-[#E2E8F0] px-4 py-2.5 dark:border-[#333]">
              <span className="text-xs font-bold text-[#1F2937] dark:text-white">eInterviews</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-semibold uppercase tracking-wider text-[#64748B] dark:border-[#333] dark:bg-[#202020]">
                    <th className="px-4 py-2">Initiated By / Initiated On</th>
                    <th className="px-4 py-2">Job Title</th>
                    <th className="px-4 py-2">Template Name</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Video Link</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5} className="px-4 py-5 text-center text-xs text-[#888]">
                      No data available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. eForms Section */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#1E293B]">
            <span className="text-xs font-bold text-[#1F2937] dark:text-white">eForms</span>
            <p className="mt-2 text-center text-xs text-[#888]">No data available</p>
          </div>

          {/* 7. Submissions eForms Section */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#1E293B]">
            <span className="text-xs font-bold text-[#1F2937] dark:text-white">Submissions eForms</span>
            <p className="mt-2 text-center text-xs text-[#888]">No data available</p>
          </div>

          {/* 8. Task Manager Section */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs dark:border-[#333] dark:bg-[#1E293B]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-2.5 dark:border-[#333]">
              <span className="text-xs font-bold text-[#1F2937] dark:text-white">Task Manager</span>
              <button
                type="button"
                onClick={() => setDialog('task')}
                className="rounded bg-[#2F80ED] px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-[#1D6FD8]"
              >
                + Add
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-semibold uppercase tracking-wider text-[#64748B] dark:border-[#333] dark:bg-[#202020]">
                    <th className="px-4 py-2">Assigned By / Created On</th>
                    <th className="px-4 py-2">Due Date / Time</th>
                    <th className="px-4 py-2">Time Zone</th>
                    <th className="px-4 py-2">Task Description</th>
                    <th className="px-4 py-2">Assigned To</th>
                    <th className="px-4 py-2">Modified On</th>
                    <th className="px-4 py-2">Status Modified On</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applicantTasks.length ? applicantTasks.map((task, index) => <tr key={`${task.title}-${index}`} className="border-b border-[#E2E8F0] dark:border-[#333]"><td className="px-4 py-2">{currentUser?.name || 'Me'}</td><td className="px-4 py-2">{task.due || 'â€”'}</td><td className="px-4 py-2">Local</td><td className="px-4 py-2">{task.description || task.title}</td><td className="px-4 py-2">{task.assignee}</td><td className="px-4 py-2">â€”</td><td className="px-4 py-2">â€”</td><td className="px-4 py-2">{task.status}</td></tr>) : <tr><td colSpan={8} className="px-4 py-5 text-center text-xs text-[#888]">No data available</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* 9. Call Logs Section */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs dark:border-[#333] dark:bg-[#1E293B]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-2.5 dark:border-[#333]">
              <span className="text-xs font-bold text-[#1F2937] dark:text-white">Call Logs</span>
              <button
                type="button"
                onClick={() => setDialog('call-log')}
                className="rounded bg-[#2F80ED] px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-[#1D6FD8]"
              >
                + Add
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-semibold uppercase tracking-wider text-[#64748B] dark:border-[#333] dark:bg-[#202020]">
                    <th className="px-4 py-2">Call Types</th>
                    <th className="px-4 py-2">Comments</th>
                    <th className="px-4 py-2">Call Taken</th>
                    <th className="px-4 py-2">Follow Up</th>
                    <th className="px-4 py-2">Log Date</th>
                    <th className="px-4 py-2">Created By</th>
                  </tr>
                </thead>
                <tbody>
                  {callLogs.length ? callLogs.map((call, index) => <tr key={`${call.date}-${index}`} className="border-b border-[#E2E8F0] dark:border-[#333]"><td className="px-4 py-2">{call.type}</td><td className="px-4 py-2">{call.comments}</td><td className="px-4 py-2">{call.date || 'â€”'}</td><td className="px-4 py-2">{call.followUp || 'â€”'}</td><td className="px-4 py-2">{call.date || 'â€”'}</td><td className="px-4 py-2">{call.by}</td></tr>) : <tr><td colSpan={6} className="px-4 py-5 text-center text-xs text-[#888]">No data available</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="border-t border-[#E2E8F0] px-4 py-2 text-[10px] text-[#888] dark:border-[#333]">
              Showing 0 to 0 of 0 entries
            </div>
          </div>

          {/* 10. Meeting Schedules Section */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs dark:border-[#333] dark:bg-[#1E293B]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-2.5 dark:border-[#333]">
              <span className="text-xs font-bold text-[#1F2937] dark:text-white">Meeting Schedules</span>
              <button
                type="button"
                onClick={() => setDialog('meeting')}
                className="rounded bg-[#2F80ED] px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-[#1D6FD8]"
              >
                + Add
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-semibold uppercase tracking-wider text-[#64748B] dark:border-[#333] dark:bg-[#202020]">
                    <th className="px-4 py-2">Meeting For</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Attendees</th>
                    <th className="px-4 py-2">Guest Attendees</th>
                    <th className="px-4 py-2">Start Time / Duration</th>
                    <th className="px-4 py-2">Created By</th>
                    <th className="px-4 py-2">Attachments</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.length ? meetings.map((meeting, index) => <tr key={`${meeting.title}-${index}`} className="border-b border-[#E2E8F0] dark:border-[#333]"><td className="px-4 py-2">{meeting.title}</td><td className="px-4 py-2">{meeting.description || 'â€”'}</td><td className="px-4 py-2">{meeting.attendees || 'â€”'}</td><td className="px-4 py-2">{meeting.guests || 'â€”'}</td><td className="px-4 py-2">{meeting.time}</td><td className="px-4 py-2">{meeting.by}</td><td className="px-4 py-2">â€”</td></tr>) : <tr><td colSpan={7} className="px-4 py-5 text-center text-xs text-[#888]">No data available</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="border-t border-[#E2E8F0] px-4 py-2 text-[10px] text-[#888] dark:border-[#333]">
              Showing 0 to 0 of 0 entries
            </div>
          </div>
            </>
          )}

          {/* PERSONAL DETAILS TAB (Image 1 Replication & Editable Mode) */}
          {activeSubTab === 'Personal Details' && (
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs dark:border-[#333] dark:bg-[#1E293B]">
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between border-b border-[#F1F5F9] pb-3 gap-2 dark:border-[#333]">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#1F2937] dark:text-white">
                    Personal Details {isEditingPersonal && <span className="text-[#2F80ED] font-normal text-xs">(Editing Mode)</span>}
                  </h2>
                </div>
                {isEditingPersonal ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSavePersonal}
                      className="flex items-center gap-1.5 rounded bg-[#2F80ED] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1D6FD8]"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Save Changes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingPersonal(false)}
                      className="rounded border border-[#CED4DA] bg-white px-3.5 py-1.5 text-xs font-medium text-[#444] hover:bg-gray-50 dark:border-[#444] dark:bg-[#333] dark:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startEditPersonal}
                    className="flex items-center gap-1 text-[#1877F2] hover:opacity-80 text-xs font-medium"
                    title="Edit Personal Details"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {/* 3-Column Key-Value Grid */}
              <div className="grid grid-cols-1 gap-x-8 gap-y-4 pt-4 md:grid-cols-3">
                {/* Row 1 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">First Name as per Aadhaar</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.firstName ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, firstName: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.firstName || applicant.name?.split(' ')[0] || 'SIVAKRISHNAN'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Middle Name as per Aadhaar</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.middleName ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, middleName: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.middleName || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Last Name as per Aadhaar</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.lastName ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, lastName: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.lastName || applicant.name?.split(' ').slice(1).join(' ') || 'D'}
                    </p>
                  )}
                </div>

                {/* Row 2 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Legal name</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.legalName ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, legalName: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.legalName || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                    <span>Maiden name</span>
                    <CircleHelp className="h-3 w-3 text-[#1877F2]" />
                  </div>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.maidenName ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, maidenName: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.maidenName || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Email Address</p>
                  {isEditingPersonal ? (
                    <input
                      type="email"
                      value={personalForm.email ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1877F2]">
                      <button type="button" onClick={openEmailComposer} className="hover:underline">
                        {applicant.email || 'sivakrishnanduraisamy@gmail.com'}
                      </button>
                    </p>
                  )}
                </div>

                {/* Row 3 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Home Phone Number</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.homePhone ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, homePhone: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.homePhone || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Mobile Number</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.phone ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1877F2]">
                      <a href={`tel:${applicant.phone}`} className="hover:underline">
                        {applicant.phone || '+91 7667560620'}
                      </a>
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Alternate Email Address</p>
                  {isEditingPersonal ? (
                    <input
                      type="email"
                      value={personalForm.alternateEmail ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, alternateEmail: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.alternateEmail || 'N/A'}
                    </p>
                  )}
                </div>

                {/* Row 4 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Other Phone</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.otherPhone ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, otherPhone: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.otherPhone || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Date Of Birth</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      placeholder="DD/MM/YYYY"
                      value={personalForm.dateOfBirth ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, dateOfBirth: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.dateOfBirth || applicant.dob || '17/02/1993'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Work Phone Number</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.workPhone ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, workPhone: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.workPhone || 'N/A'}
                    </p>
                  )}
                </div>

                {/* Row 5 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Facebook Profile URL</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.facebookUrl ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, facebookUrl: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.facebookUrl || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Twitter Profile URL</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.twitterUrl ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, twitterUrl: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.twitterUrl || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">LinkedIn Profile URL</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.linkedinUrl ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, linkedinUrl: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.linkedinUrl || 'N/A'}
                    </p>
                  )}
                </div>

                {/* Row 6 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Work Authorization</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.workAuthorization ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, workAuthorization: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.workAuthorization || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Address</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.address ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, address: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.address || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Video Reference</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.videoReference ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, videoReference: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.videoReference || 'N/A'}
                    </p>
                  )}
                </div>

                {/* Row 7 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">State</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.state ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, state: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.state || 'Tamil Nadu'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">City</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.city ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, city: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.city || applicant.location?.split(',')[0]?.trim() || 'Coimbatore'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Country</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.country ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, country: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.country || 'India'}
                    </p>
                  )}
                </div>

                {/* Row 8 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Source</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.source ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, source: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.source || 'Naukri'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Experience</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      placeholder="e.g. 9 Years 2 Months"
                      value={personalForm.experienceYears ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, experienceYears: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.experienceYears ? `${applicant.experienceYears} Years 2 Months` : '9 Years 2 Months'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Zip Code</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.zipCode ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, zipCode: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.zipCode || 'N/A'}
                    </p>
                  )}
                </div>

                {/* Row 9 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Referred By</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.referredBy ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, referredBy: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.referredBy || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Applicant Status</p>
                  {isEditingPersonal ? (
                    <select
                      value={personalForm.status ?? 'New'}
                      onChange={(e) => setPersonalForm({ ...personalForm, status: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    >
                      <option value="New">New lead (Allowed to submit)</option>
                      <option value="Screening">Screening</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Interview">Interview</option>
                      <option value="Offered">Offered</option>
                      <option value="Hired">Hired</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.status || 'New lead (Allowed to submit)'}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                    <span>Relevant experience</span>
                    <CircleHelp className="h-3 w-3 text-[#1877F2]" />
                  </div>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.relevantExperience ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, relevantExperience: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.relevantExperience ? `${applicant.relevantExperience} Years` : 'N/A'}
                    </p>
                  )}
                </div>

                {/* Row 10 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Ownership</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.assignedRecruiter ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, assignedRecruiter: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.assignedRecruiter || applicant.ownership || 'Ganesh Kshirsagar'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Current Title/Designation</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.currentDesignation ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, currentDesignation: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.currentDesignation || 'technical support engineer (L2)'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Applicant Group</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.applicantGroup ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, applicantGroup: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.applicantGroup || 'N/A'}
                    </p>
                  )}
                </div>

                {/* Row 11 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Current CTC</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.currentCTC ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, currentCTC: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.currentCTC || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Expected CTC</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.expectedCTC ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, expectedCTC: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.expectedCTC || applicant.expectedSalary || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Current Company</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.currentCompany ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, currentCompany: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.currentCompany || 'Infosys PVT LTD'}
                    </p>
                  )}
                </div>

                {/* Row 12 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Pan Card Number</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.panCard ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, panCard: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.panCard || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Aadhar number</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.aadharNumber ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, aadharNumber: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.aadharNumber || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Notice Period</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.noticePeriod ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, noticePeriod: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.noticePeriod || 'N/A'}
                    </p>
                  )}
                </div>

                {/* Row 13 */}
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                    <span>Marital status</span>
                    <CircleHelp className="h-3 w-3 text-[#1877F2]" />
                  </div>
                  {isEditingPersonal ? (
                    <select
                      value={personalForm.maritalStatus ?? 'Single'}
                      onChange={(e) => setPersonalForm({ ...personalForm, maritalStatus: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="N/A">N/A</option>
                    </select>
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.maritalStatus || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                    <span>Preferred Shift</span>
                    <CircleHelp className="h-3 w-3 text-[#1877F2]" />
                  </div>
                  {isEditingPersonal ? (
                    <select
                      value={personalForm.preferredShift ?? 'Day'}
                      onChange={(e) => setPersonalForm({ ...personalForm, preferredShift: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    >
                      <option value="Day">Day Shift</option>
                      <option value="Night">Night Shift</option>
                      <option value="Flexible">Flexible / Rotational</option>
                      <option value="N/A">N/A</option>
                    </select>
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.preferredShift || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                    <span>Passport number</span>
                    <CircleHelp className="h-3 w-3 text-[#1877F2]" />
                  </div>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.passportNumber ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, passportNumber: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.passportNumber || 'N/A'}
                    </p>
                  )}
                </div>

                {/* Row 14 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Skills</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      placeholder="e.g. React, Node.js, Python"
                      value={personalForm.skills ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, skills: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <div className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {skillsExpandedPersonal ? (
                        <div>
                          <span>{skillsList.join(', ')}</span>
                          <button
                            type="button"
                            onClick={() => setSkillsExpandedPersonal(false)}
                            className="ml-1 text-[11px] font-normal text-[#1877F2] hover:underline"
                          >
                            Less Ã¢â€“Â´
                          </button>
                        </div>
                      ) : (
                        <div>
                          <span>{skillsList.slice(0, 5).join(', ')}</span>
                          {skillsList.length > 5 && <span>...</span>}
                          <button
                            type="button"
                            onClick={() => setSkillsExpandedPersonal(true)}
                            className="ml-1 text-[11px] font-normal text-[#1877F2] hover:underline"
                          >
                            More Ã¢â€“Â¾
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Primary Skills</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.primarySkills ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, primarySkills: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.primarySkills?.join(', ') || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Relocation</p>
                  {isEditingPersonal ? (
                    <select
                      value={personalForm.willingToRelocate ? 'Yes' : 'No'}
                      onChange={(e) => setPersonalForm({ ...personalForm, willingToRelocate: e.target.value === 'Yes' })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.willingToRelocate !== false ? 'Yes' : 'No'}
                    </p>
                  )}
                </div>

                {/* Row 15 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Technology</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.technology ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, technology: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.technology || '-'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Industry</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.industry ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, industry: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.industry || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                    <span>Nationality</span>
                    <CircleHelp className="h-3 w-3 text-[#1877F2]" />
                  </div>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.nationality ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, nationality: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.nationality || 'N/A'}
                    </p>
                  )}
                </div>

                {/* Row 16 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Reference ID</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.referenceId ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, referenceId: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.referenceId || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Applicant Remarks</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.applicantRemarks ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, applicantRemarks: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.applicantRemarks || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Notice/Eligibility</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={personalForm.noticeEligibility ?? ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, noticeEligibility: e.target.value })}
                      className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                      {applicant.noticeEligibility || 'N/A'}
                    </p>
                  )}
                </div>
              </div>

              {/* EEO Details */}
              <div className="mt-8 border-t border-[#F1F5F9] pt-4 dark:border-[#333]">
                <h3 className="text-xs font-bold text-[#1F2937] dark:text-white">EEO Details</h3>
                <div className="grid grid-cols-1 gap-x-8 gap-y-4 pt-3 md:grid-cols-3">
                  <div>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Gender</p>
                    {isEditingPersonal ? (
                      <input
                        type="text"
                        value={personalForm.gender ?? ''}
                        onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value })}
                        className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                      />
                    ) : (
                      <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">{applicant.gender || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Race/Ethnicity</p>
                    {isEditingPersonal ? (
                      <input
                        type="text"
                        value={personalForm.raceEthnicity ?? ''}
                        onChange={(e) => setPersonalForm({ ...personalForm, raceEthnicity: e.target.value })}
                        className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                      />
                    ) : (
                      <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">{applicant.raceEthnicity || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Veteran Status</p>
                    {isEditingPersonal ? (
                      <input
                        type="text"
                        value={personalForm.veteranStatus ?? ''}
                        onChange={(e) => setPersonalForm({ ...personalForm, veteranStatus: e.target.value })}
                        className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                      />
                    ) : (
                      <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">{applicant.veteranStatus || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Disability</p>
                    {isEditingPersonal ? (
                      <input
                        type="text"
                        value={personalForm.disability ?? ''}
                        onChange={(e) => setPersonalForm({ ...personalForm, disability: e.target.value })}
                        className="mt-1 w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                      />
                    ) : (
                      <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">{applicant.disability || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* User Defined Fields */}
              <div className="mt-8 border-t border-[#F1F5F9] pt-4 dark:border-[#333]">
                <h3 className="text-xs font-bold text-[#1F2937] dark:text-white">User Defined Fields</h3>
              </div>

              {/* Bottom Save / Cancel bar when editing */}
              {isEditingPersonal && (
                <div className="mt-6 flex items-center justify-end gap-2 border-t border-[#F1F5F9] pt-4 dark:border-[#333]">
                  <button
                    type="button"
                    onClick={() => setIsEditingPersonal(false)}
                    className="rounded border border-[#CED4DA] bg-white px-4 py-2 text-xs font-medium text-[#444] hover:bg-gray-50 dark:border-[#444] dark:bg-[#333] dark:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePersonal}
                    className="flex items-center gap-1.5 rounded bg-[#2F80ED] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#1D6FD8]"
                  >
                    <Check className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PROFESSION DETAILS TAB (Image 2 Replication) */}
          {activeSubTab === 'Profession Details' && (
            <div className="space-y-4">
              {/* 1. Education Details Card */}
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#1E293B]">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 dark:border-[#333]">
                  <h3 className="text-xs font-bold text-[#1F2937] dark:text-white">Education Details</h3>
                  <button
                    type="button"
                    onClick={() => setDialog('add-education')}
                    className="flex items-center gap-1 rounded bg-[#2F80ED] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#1D6FD8]"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add</span>
                  </button>
                </div>
                <div className="divide-y divide-[#F1F5F9] dark:divide-[#333]">
                  {educationList.map((edu) => (
                    <div key={edu.id} className="flex items-center justify-between py-3">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-blue-50 p-2 text-[#1877F2] dark:bg-[#1E293B]">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-[#1F2937] dark:text-white">{edu.degree}</h4>
                            {edu.isPrimary && (
                              <span title="Primary Qualification">
                                <Bookmark className="h-3.5 w-3.5 fill-[#1877F2] text-[#1877F2]" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#555] dark:text-[#BBB]">{edu.institution}</p>
                          <p className="text-[11px] text-[#888]">{edu.period}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="rounded p-1 text-[#888] hover:bg-gray-100 hover:text-[#222] dark:hover:bg-[#333]"
                        title="Options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Add Certification Card */}
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#1E293B]">
                <div className="border-b border-[#F1F5F9] pb-3 dark:border-[#333]">
                  <h3 className="text-xs font-bold text-[#1F2937] dark:text-white">Add Certification</h3>
                </div>
                <form onSubmit={handleSaveCertification} className="space-y-3 pt-3">
                  <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-[#444] dark:text-[#AAA]">
                        Certification <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Required"
                        value={certForm.certification}
                        onChange={(e) => setCertForm({ ...certForm, certification: e.target.value })}
                        className="w-full rounded border border-[#CED4DA] p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-[#444] dark:text-[#AAA]">
                        Year Completed <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Required"
                        value={certForm.yearCompleted}
                        onChange={(e) => setCertForm({ ...certForm, yearCompleted: e.target.value })}
                        className="w-full rounded border border-[#CED4DA] p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-[#444] dark:text-[#AAA]">
                        Comments
                      </label>
                      <input
                        type="text"
                        placeholder=""
                        value={certForm.comments}
                        onChange={(e) => setCertForm({ ...certForm, comments: e.target.value })}
                        className="w-full rounded border border-[#CED4DA] p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="rounded bg-[#2F80ED] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1D6FD8]"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleResetCertification}
                      className="rounded border border-[#CED4DA] bg-white px-4 py-1.5 text-xs font-semibold text-[#444] hover:bg-gray-50 dark:border-[#444] dark:bg-[#333] dark:text-white"
                    >
                      Reset
                    </button>
                  </div>
                </form>

                {certificationsList.length > 0 && (
                  <div className="mt-4 border-t border-[#F1F5F9] pt-3 dark:border-[#333]">
                    <div className="flex flex-wrap gap-2">
                      {certificationsList.map((c) => (
                        <div key={c.id} className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-gray-50 px-3 py-1.5 text-xs dark:border-[#444] dark:bg-[#333]">
                          <Award className="h-3.5 w-3.5 text-[#1877F2]" />
                          <span className="font-semibold text-[#1F2937] dark:text-white">{c.name}</span>
                          <span className="text-[11px] text-[#888]">({c.yearCompleted})</span>
                          <button
                            type="button"
                            onClick={() => setCertificationsList((prev) => prev.filter((item) => item.id !== c.id))}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Work Experience Card */}
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#1E293B]">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 dark:border-[#333]">
                  <h3 className="text-xs font-bold text-[#1F2937] dark:text-white">Work Experience</h3>
                  <button
                    type="button"
                    onClick={() => setDialog('add-work-exp')}
                    className="flex items-center gap-1 rounded bg-[#2F80ED] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#1D6FD8]"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add</span>
                  </button>
                </div>
                <div className="divide-y divide-[#F1F5F9] dark:divide-[#333]">
                  {workExperiences.map((exp) => (
                    <div key={exp.id} className="py-3">
                      <h4 className="text-xs font-bold text-[#1F2937] dark:text-white">{exp.company}</h4>
                      <p className="mt-0.5 text-xs text-[#555] dark:text-[#BBB]">{exp.designation} | {exp.period}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Add Language Details Card */}
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#1E293B]">
                <div className="border-b border-[#F1F5F9] pb-3 dark:border-[#333]">
                  <h3 className="text-xs font-bold text-[#1F2937] dark:text-white">Add Language Details</h3>
                </div>
                <form onSubmit={handleSaveLanguage} className="space-y-3 pt-3">
                  <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-[#444] dark:text-[#AAA]">Language</label>
                      <select
                        value={langForm.language}
                        onChange={(e) => setLangForm({ ...langForm, language: e.target.value })}
                        className="w-full rounded border border-[#CED4DA] p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                      >
                        <option value="">Select</option>
                        <option value="English">English</option>
                        <option value="Tamil">Tamil</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Telugu">Telugu</option>
                        <option value="Kannada">Kannada</option>
                        <option value="Malayalam">Malayalam</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] font-medium text-[#444] dark:text-[#AAA]">Proficiency</label>
                      <div className="flex items-center gap-4 pt-1">
                        <label className="flex cursor-pointer items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={langForm.read}
                            onChange={(e) => setLangForm({ ...langForm, read: e.target.checked })}
                            className="rounded border-[#CED4DA] text-[#2F80ED] focus:ring-0"
                          />
                          <span className="text-xs text-[#444] dark:text-[#CCC]">Read</span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={langForm.speak}
                            onChange={(e) => setLangForm({ ...langForm, speak: e.target.checked })}
                            className="rounded border-[#CED4DA] text-[#2F80ED] focus:ring-0"
                          />
                          <span className="text-xs text-[#444] dark:text-[#CCC]">Speak</span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={langForm.write}
                            onChange={(e) => setLangForm({ ...langForm, write: e.target.checked })}
                            className="rounded border-[#CED4DA] text-[#2F80ED] focus:ring-0"
                          />
                          <span className="text-xs text-[#444] dark:text-[#CCC]">Write</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="rounded bg-[#2F80ED] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1D6FD8]"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleResetLanguage}
                      className="rounded border border-[#CED4DA] bg-white px-4 py-1.5 text-xs font-semibold text-[#444] hover:bg-gray-50 dark:border-[#444] dark:bg-[#333] dark:text-white"
                    >
                      Reset
                    </button>
                  </div>
                </form>

                {languagesList.length > 0 && (
                  <div className="mt-4 border-t border-[#F1F5F9] pt-3 dark:border-[#333]">
                    <div className="flex flex-wrap gap-2">
                      {languagesList.map((lang) => (
                        <div key={lang.id} className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-gray-50 px-3 py-1.5 text-xs dark:border-[#444] dark:bg-[#333]">
                          <Languages className="h-3.5 w-3.5 text-[#1877F2]" />
                          <span className="font-semibold text-[#1F2937] dark:text-white">{lang.language}</span>
                          <span className="text-[11px] text-[#888]">
                            ({[lang.read && 'Read', lang.speak && 'Speak', lang.write && 'Write'].filter(Boolean).join(', ')})
                          </span>
                          <button
                            type="button"
                            onClick={() => setLanguagesList((prev) => prev.filter((item) => item.id !== lang.id))}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EMPLOYER DETAILS TAB (Ceipal Replication) */}
          {activeSubTab === 'Employer Details' && (
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#1E293B]">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 dark:border-[#333]">
                <h3 className="text-xs font-bold text-[#1F2937] dark:text-white">Employer Details</h3>
                <button
                  type="button"
                  onClick={() => {
                    setEmpFirstName('');
                    setEmpLastName('');
                    setEmpEmployerName('');
                    setEmpOfficeNumber('');
                    setEmpExtension('');
                    setEmpEmailId('');
                    setEmpMobileNumber('');
                    setEmpTypeSelect('Select Status');
                    setEmpSourceType('new');
                    setSelectedVendorContact('');
                    setVendorSearchOpen(false);
                    setVendorSearchQuery('');
                    setEmpModalError(null);
                    setDialog('add-employer');
                  }}
                  className="flex items-center gap-1 rounded bg-[#2F80ED] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#1D6FD8] cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </button>
              </div>
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-[#475569] dark:border-[#333] dark:bg-[#1E293B] dark:text-[#94A3B8]">
                    <tr>
                      <th className="px-4 py-2.5">EMPLOYEE NAME</th>
                      <th className="px-4 py-2.5">EMPLOYER</th>
                      <th className="px-4 py-2.5">OFFICE NUMBER</th>
                      <th className="px-4 py-2.5">MOBILE NUMBER</th>
                      <th className="px-4 py-2.5">EMAIL</th>
                      <th className="px-4 py-2.5">STATUS</th>
                      <th className="px-4 py-2.5 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#333]">
                    {employerList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-xs text-[#888] italic">
                          No data available
                        </td>
                      </tr>
                    ) : (
                      employerList.map((emp) => (
                        <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-[#2A2A2A]">
                          <td className="px-4 py-3 font-semibold text-[#1F2937] dark:text-white">{emp.employeeName}</td>
                          <td className="px-4 py-3 text-[#555] dark:text-[#CCC]">{emp.employer}</td>
                          <td className="px-4 py-3 text-[#555] dark:text-[#CCC]">{emp.officeNumber}</td>
                          <td className="px-4 py-3 text-[#555] dark:text-[#CCC]">{emp.mobile}</td>
                          <td className="px-4 py-3 text-[#1877F2]">{emp.email}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              emp.status === 'Active'
                                ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {emp.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setEmployerList((prev) => prev.filter((item) => item.id !== emp.id));
                                showToast('Employer removed');
                              }}
                              className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EMPLOYMENT TEST RESULTS TAB */}
          {activeSubTab === 'Employment Test Results' && (
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#1E293B]">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 dark:border-[#333]">
                <h3 className="text-xs font-bold text-[#1F2937] dark:text-white">Employment Test Results</h3>
                <button
                  type="button"
                  onClick={() => showToast('Schedule test feature')}
                  className="flex items-center gap-1 rounded bg-[#2F80ED] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#1D6FD8]"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Test</span>
                </button>
              </div>
              <div className="py-10 text-center text-xs text-[#888]">
                No employment test results recorded for this applicant.
              </div>
            </div>
          )}

          {/* ACTIVITIES TAB */}
          {activeSubTab === 'Activities' && (
            <section className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-xs dark:border-[#333] dark:bg-[#252525]" aria-labelledby="activities-title">
              <div className="border-b border-[#E8EDF3] px-4 py-4 dark:border-[#383838] sm:px-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#2F80ED] dark:bg-[#1E3A5F]">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 id="activities-title" className="text-sm font-bold text-[#1F2937] dark:text-white">Activities</h3>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-[#AAA]">A complete record of this applicantâ€™s interactions and updates.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="inline-flex w-full rounded-lg bg-slate-100 p-1 dark:bg-[#333] sm:w-auto" role="group" aria-label="Activity type filter">
                      {[
                        { id: 'all' as const, label: 'Activities' },
                        { id: 'messages' as const, label: 'Msg Activities' },
                        { id: 'documents' as const, label: 'Document Activities' },
                        { id: 'downloads' as const, label: 'Download Activities' }
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          type="button"
                          onClick={() => setActivityFilter(filter.id)}
                          className={`flex-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition sm:flex-none ${
                            activityFilter === filter.id
                              ? 'bg-white text-[#2F80ED] shadow-sm dark:bg-[#4A4A4A] dark:text-white'
                              : 'text-slate-500 hover:text-slate-800 dark:text-[#AAA] dark:hover:text-white'
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                    <label className="relative block">
                      <span className="sr-only">Activity time period</span>
                      <select
                        value={activityPeriod}
                        onChange={(event) => setActivityPeriod(event.target.value as 'last-6-months' | 'older')}
                        className="h-9 w-full appearance-none rounded-lg border border-slate-300 bg-white py-1 pl-3 pr-9 text-[11px] font-medium text-slate-700 outline-none transition focus:border-[#2F80ED] focus:ring-4 focus:ring-blue-100 dark:border-[#4A4A4A] dark:bg-[#303030] dark:text-white dark:focus:ring-[#1E3A5F] sm:w-40"
                      >
                        <option value="last-6-months">Last 6 months</option>
                        <option value="older">Older than 6 months</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 sm:px-5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium text-slate-500 dark:text-[#AAA]">
                    {visibleActivityEvents.length} {visibleActivityEvents.length === 1 ? 'activity' : 'activities'} found
                  </p>
                  <p className="hidden text-[11px] text-slate-400 sm:block">Newest activity first</p>
                </div>
              </div>

              {visibleActivityEvents.length > 0 ? (
                <div className="overflow-x-auto border-t border-[#E8EDF3] dark:border-[#383838]">
                  <table className="min-w-[680px] w-full text-left">
                    <thead className="bg-slate-50 dark:bg-[#2D2D2D]">
                      <tr className="border-b border-[#E8EDF3] dark:border-[#383838]">
                        <th scope="col" className="w-52 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-[#AAA]">Date &amp; time</th>
                        <th scope="col" className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-[#AAA]">Activity details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF2F6] dark:divide-[#383838]">
                      {visibleActivityEvents.map((event) => {
                        const Icon = event.icon;
                        return (
                          <tr key={event.id} className="group transition-colors hover:bg-blue-50/40 dark:hover:bg-[#2D3541]">
                            <td className="px-5 py-4 align-top">
                              <div className="flex items-start gap-2.5">
                                <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${event.iconClass}`}>
                                  <Icon className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-slate-700 dark:text-[#E5E5E5]">{event.date}</p>
                                  <p className="mt-0.5 text-[11px] text-slate-400">{event.time}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 align-top">
                              <p className="text-xs font-medium leading-5 text-slate-700 dark:text-[#E5E5E5]">{event.description}</p>
                              <p className="mt-1 text-[11px] text-slate-400 dark:text-[#999]">{event.detail}</p>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex min-h-60 flex-col items-center justify-center border-t border-dashed border-[#E8EDF3] px-5 text-center dark:border-[#444]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-[#333]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <h4 className="mt-3 text-sm font-semibold text-slate-700 dark:text-white">No activities found</h4>
                  <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-[#AAA]">There are no matching activities for the selected category and time period.</p>
                </div>
              )}
            </section>
          )}

          {/* EMAIL MERGES TAB (Three-Dot Option 1) */}
          {activeSubTab === 'Email Merges' && (
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#252525]">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 dark:border-[#333]">
                <h3 className="text-xs font-bold text-[#1F2937] dark:text-white">Email Merges</h3>
                <button
                  type="button"
                  onClick={() => showToast('Email Merge campaign initiated')}
                  className="flex items-center gap-1 rounded bg-[#2F80ED] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#1D6FD8]"
                >
                  <Plus className="h-3 w-3" />
                  <span>New Merge</span>
                </button>
              </div>
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-[#475569] dark:border-[#333] dark:bg-[#1E293B] dark:text-[#94A3B8]">
                    <tr>
                      <th className="px-4 py-2.5">CAMPAIGN / TEMPLATE</th>
                      <th className="px-4 py-2.5">RECIPIENT EMAIL</th>
                      <th className="px-4 py-2.5">SENT BY</th>
                      <th className="px-4 py-2.5">SENT DATE</th>
                      <th className="px-4 py-2.5">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#333]">
                    <tr className="hover:bg-gray-50 dark:hover:bg-[#2A2A2A]">
                      <td className="px-4 py-3 font-semibold text-[#1877F2]">Candidate Introduction Campaign</td>
                      <td className="px-4 py-3 text-[#555] dark:text-[#CCC]">{applicant.email || 'applicant@email.com'}</td>
                      <td className="px-4 py-3 text-[#555] dark:text-[#CCC]">{applicant.assignedRecruiter || 'Ganesh Kshirsagar'}</td>
                      <td className="px-4 py-3 text-[#666]">20/11/2026 14:10</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          Delivered & Opened
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EMAIL ACTIVITY TAB (Three-Dot Option 2) */}
          {activeSubTab === 'Email Activity' && (
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#252525]">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
                <h3 className="text-sm font-semibold text-[#1F2937] dark:text-white">Email Activity</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs"><label className="text-[#64748B]">Email Type</label><select value={emailActivityTypeFilter} onChange={(event) => { setEmailActivityTypeFilter(event.target.value); setEmailActivityPage(0); }} className="border border-[#CBD5E1] bg-[#F8F8F8] px-2 py-1.5 text-[#334155] dark:border-[#444] dark:bg-[#333] dark:text-white"><option>All Types</option>{Array.from(new Set(['Email', 'Job Share', ...emailActivityTypes])).map((type) => <option key={type}>{type}</option>)}</select><select aria-label="Email activity period" value={emailActivityPeriod} onChange={(event) => { setEmailActivityPeriod(event.target.value); setEmailActivityPage(0); }} className="border border-[#CBD5E1] bg-[#F8F8F8] px-2 py-1.5 text-[#334155] dark:border-[#444] dark:bg-[#333] dark:text-white"><option>Last 6 Months</option><option>Last 30 Days</option><option>Last Year</option><option>All Time</option></select><button type="button" onClick={openEmailComposer} className="rounded bg-[#2F80ED] px-2.5 py-1.5 font-semibold text-white hover:bg-[#1D6FD8]"><Send className="mr-1 inline h-3 w-3" />Compose Email</button></div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3 text-[11px] dark:border-[#333]"><label className="flex items-center gap-1.5 text-[#64748B]">Search:<input type="search" value={emailActivitySearch} onChange={(event) => { setEmailActivitySearch(event.target.value); setEmailActivityPage(0); }} className="border border-[#CBD5E1] bg-[#F8F8F8] px-2 py-1.5 text-xs text-[#334155] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white" /></label><label className="flex items-center gap-1.5 text-[#64748B]">Show<select value={emailActivityPageSize} onChange={(event) => { setEmailActivityPageSize(Number(event.target.value)); setEmailActivityPage(0); }} className="border border-[#CBD5E1] bg-[#F8F8F8] px-2 py-1 text-xs dark:border-[#444] dark:bg-[#333] dark:text-white"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select>entries</label></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead><tr className="border-b border-[#D8D8D8] text-[10px] font-bold uppercase text-[#444]"><th className="px-2 py-2">Date &amp; Time</th><th className="px-2 py-2">Email Type</th><th className="px-2 py-2">Sent By</th><th className="px-2 py-2">Sent To</th><th className="px-2 py-2">Email Details</th></tr></thead><tbody className="divide-y divide-[#E5E7EB] dark:divide-[#333]">
                {visibleEmailActivity.length ? visibleEmailActivity.map((email, index) => {
                  const emailId = email.id || `${email.sentAt}-${index}`;
                  const isExpanded = emailActivityExpandedId === emailId;
                  return <React.Fragment key={emailId}><tr className="hover:bg-slate-50 dark:hover:bg-[#202020]"><td className="whitespace-nowrap px-2 py-2.5 text-[#555] dark:text-[#CCC]">{email.sentAt ? new Date(email.sentAt).toLocaleString() : '—'}</td><td className="px-2 py-2.5 text-[#555] dark:text-[#CCC]">{email.type || 'Email'}</td><td className="px-2 py-2.5 text-[#555] dark:text-[#CCC]">{email.from || '—'}</td><td className="px-2 py-2.5 text-[#555] dark:text-[#CCC]">{(email.to || []).join(', ') || '—'}{email.cc?.length ? <span className="block text-[10px] text-slate-400">CC: {email.cc.join(', ')}</span> : null}</td><td className="px-2 py-2.5"><button type="button" onClick={() => setEmailActivityExpandedId(isExpanded ? null : emailId)} className="font-medium text-[#1877F2] hover:underline">{email.subject || 'View email'} {isExpanded ? '-' : '+'}</button></td></tr>{isExpanded && <tr><td colSpan={5} className="bg-slate-50 px-4 py-3 dark:bg-[#202020]"><p className="font-semibold text-slate-700 dark:text-slate-200">{email.subject || '(No subject)'}</p><p className="mt-2 whitespace-pre-wrap text-slate-600 dark:text-slate-300">{(email.body || '').replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, ' ').trim() || '(No message body)'}</p>{email.attachments?.length ? <p className="mt-2 text-[10px] text-slate-500">Attachments: {email.attachments.join(', ')}</p> : null}<p className="mt-2 text-[10px] text-slate-400">Activity: Email composed and saved from this applicant profile.</p></td></tr>}</React.Fragment>;
                }) : <tr><td colSpan={5} className="px-2 py-3 text-center text-xs text-[#666]">No data available in table</td></tr>}
              </tbody></table></div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 text-[10px] text-[#64748B]"><span>Showing {emailActivityFiltered.length ? emailActivityPage * emailActivityPageSize + 1 : 0} to {Math.min((emailActivityPage + 1) * emailActivityPageSize, emailActivityFiltered.length)} of {emailActivityFiltered.length} entries</span><div className="flex gap-1"><button type="button" aria-label="Previous email activity page" disabled={emailActivityPage === 0} onClick={() => setEmailActivityPage((page) => Math.max(0, page - 1))} className="rounded border border-[#CBD5E1] px-2 py-1 disabled:opacity-40 dark:border-[#444]">‹</button><button type="button" aria-label="Next email activity page" disabled={emailActivityPage + 1 >= emailActivityPageCount} onClick={() => setEmailActivityPage((page) => Math.min(emailActivityPageCount - 1, page + 1))} className="rounded border border-[#CBD5E1] px-2 py-1 disabled:opacity-40 dark:border-[#444]">›</button></div></div>
            </div>
          )}
          {/* HIRES TAB (Three-Dot Option 3) */}
          {activeSubTab === 'Hires' && (
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#252525]">
              <div className="border-b border-[#F1F5F9] pb-3 dark:border-[#333]">
                <h3 className="text-xs font-bold text-[#1F2937] dark:text-white">Hires & Onboarding Records</h3>
              </div>
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-[#475569] dark:border-[#333] dark:bg-[#1E293B] dark:text-[#94A3B8]">
                    <tr>
                      <th className="px-4 py-2.5">JOB CODE & TITLE</th>
                      <th className="px-4 py-2.5">CLIENT</th>
                      <th className="px-4 py-2.5">HIRE / JOINING DATE</th>
                      <th className="px-4 py-2.5">OFFERED RATE / CTC</th>
                      <th className="px-4 py-2.5">RECRUITER</th>
                      <th className="px-4 py-2.5">ONBOARDING STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#333]">
                    <tr className="hover:bg-gray-50 dark:hover:bg-[#2A2A2A]">
                      <td className="px-4 py-3 font-semibold text-[#18558A] dark:text-[#90CDF4]">AMP12294 - E-commerce Production Support</td>
                      <td className="px-4 py-3 text-[#555] dark:text-[#CCC]">Dentsu</td>
                      <td className="px-4 py-3 text-[#666]">01/12/2026</td>
                      <td className="px-4 py-3 font-medium text-emerald-600">$85/hr</td>
                      <td className="px-4 py-3 text-[#555] dark:text-[#CCC]">Ganesh Godse</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          Onboarding In Progress
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SURVEYS TAB (Three-Dot Option 4) */}
          {activeSubTab === 'Surveys' && (
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#252525]">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 dark:border-[#333]">
                <h3 className="text-xs font-bold text-[#1F2937] dark:text-white">Candidate Experience Surveys</h3>
                <button
                  type="button"
                  onClick={() => showToast('Survey dispatched to candidate email')}
                  className="flex items-center gap-1 rounded bg-[#2F80ED] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#1D6FD8]"
                >
                  <Send className="h-3 w-3" />
                  <span>Send Survey</span>
                </button>
              </div>
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-[#475569] dark:border-[#333] dark:bg-[#1E293B] dark:text-[#94A3B8]">
                    <tr>
                      <th className="px-4 py-2.5">SURVEY NAME</th>
                      <th className="px-4 py-2.5">DISPATCHED DATE</th>
                      <th className="px-4 py-2.5">STATUS</th>
                      <th className="px-4 py-2.5">RATING</th>
                      <th className="px-4 py-2.5">FEEDBACK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#333]">
                    <tr className="hover:bg-gray-50 dark:hover:bg-[#2A2A2A]">
                      <td className="px-4 py-3 font-semibold text-[#1F2937] dark:text-white">Initial Screening Experience</td>
                      <td className="px-4 py-3 text-[#666]">18/11/2026</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          Completed
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#F2B705] font-bold">5 / 5 Ã¢Ëœâ€¦</td>
                      <td className="px-4 py-3 text-[#555] dark:text-[#CCC]">"Recruitment team was very responsive and professional."</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

            {/* RIGHT-SIDE SLIDE-OUT RESUME PANEL (Matching Reference UI) */}
      {isResumePanelOpen && (
        <div
          className={`fixed bottom-0 right-0 top-[56px] z-40 flex flex-col border-l border-[#E2E8F0] bg-white shadow-2xl transition-all duration-300 dark:border-[#333] dark:bg-[#1E1E1E] ${
            resumeFullscreen
              ? 'left-0 w-full'
              : 'w-full sm:w-[500px] md:w-[550px] lg:w-[48%] xl:w-[45%]'
          }`}
        >
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-white px-4 py-2.5 dark:border-[#333] dark:bg-[#252525]">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#1877F2]" />
              <span className="text-xs font-bold text-[#1F2937] dark:text-white">
                {displayId} - {displayName}
              </span>
              <Search className="h-3.5 w-3.5 cursor-pointer text-[#888] hover:text-[#1877F2]" />
            </div>
            <div className="flex items-center gap-2.5 text-[#666] dark:text-[#AAA]">
              <button
                type="button"
                onClick={handleDownloadResume}
                title="Download Resume"
                className="rounded p-1.5 hover:bg-gray-100 hover:text-[#1877F2] dark:hover:bg-[#333]"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setResumeFullscreen(!resumeFullscreen)}
                title={resumeFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                className="rounded p-1.5 hover:bg-gray-100 hover:text-[#1877F2] dark:hover:bg-[#333]"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsResumePanelOpen(false)}
                title="Close Resume"
                className="rounded p-1.5 text-[#666] hover:bg-gray-100 hover:text-red-500 dark:hover:bg-[#333]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Sub Bar with Resume Tab */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-1.5 dark:border-[#333] dark:bg-[#202020]">
            <div className="flex items-center gap-2">
              <div className="rounded-t-md bg-[#2F80ED] px-3.5 py-1 text-[11px] font-semibold text-white shadow-xs">
                Resume
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#666] dark:text-[#AAA]">
              <span>Verified Document</span>
              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
            </div>
          </div>

          {/* Resume Document Canvas / Paper */}
          <div className="flex-1 overflow-y-auto bg-[#F1F5F9] p-4 md:p-6 dark:bg-[#121212]">
            <div className="mx-auto max-w-[620px] rounded border border-[#E2E8F0] bg-white p-6 md:p-8 shadow-sm space-y-5 text-xs text-[#1F2937] dark:border-[#333] dark:bg-[#1E1E1E] dark:text-[#E0E0E0]">
              {/* Header */}
              <div className="text-center space-y-1">
                <h1 className="text-xl font-bold tracking-tight text-[#111827] dark:text-white">
                  {displayName}
                </h1>
                <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                  {applicant.city || applicant.location || 'Nashik, Maharashtra, India'} Ã‚Â· {applicant.email || 'applicant@email.com'} Ã‚Â· {applicant.phone || '+91-9876543210'}
                </p>
                <div className="flex justify-center items-center gap-3 text-xs text-[#1877F2] pt-1">
                  <a href={applicant.portfolioUrl || '#'} className="hover:underline">Portfolio</a>
                  <span>Ã‚Â·</span>
                  <a href={applicant.githubUrl || '#'} className="hover:underline">GitHub</a>
                  <span>Ã‚Â·</span>
                  <a href={applicant.linkedinUrl || '#'} className="hover:underline">LinkedIn</a>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <h2 className="border-b border-[#E2E8F0] pb-1 text-xs font-bold uppercase tracking-wider text-[#1F2937] dark:border-[#333] dark:text-white">
                  Summary
                </h2>
                <p className="text-xs text-[#4B5563] dark:text-[#CCC] leading-relaxed">
                  {applicant.summary ||
                    `B.Tech Computer Science student with hands-on experience in full-stack web development. Built projects including a Fake News Detection system using NLP and a real-time chat platform with live room features. Skilled in React, Node.js, and modern web technologies, with a focus on developing scalable and user-centric applications.`}
                </p>
              </div>

              {/* Education */}
              <div className="space-y-2">
                <h2 className="border-b border-[#E2E8F0] pb-1 text-xs font-bold uppercase tracking-wider text-[#1F2937] dark:border-[#333] dark:text-white">
                  Education
                </h2>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                      <th className="py-1">Degree</th>
                      <th className="py-1">Institution</th>
                      <th className="py-1">Years</th>
                      <th className="py-1 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#333]">
                    {educationList.map((edu, idx) => (
                      <tr key={idx} className="text-xs">
                        <td className="py-1.5 font-medium">{edu.degree}</td>
                        <td className="py-1.5 text-[#555] dark:text-[#BBB]">{edu.institution}</td>
                        <td className="py-1.5 text-[#666]">{edu.period}</td>
                        <td className="py-1.5 text-right font-medium">8.33 CGPA</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-1.5 font-medium">HSC</td>
                      <td className="py-1.5 text-[#555] dark:text-[#BBB]">LVH College, Nashik</td>
                      <td className="py-1.5 text-[#666]">2022</td>
                      <td className="py-1.5 text-right font-medium">55%</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-medium">SSC</td>
                      <td className="py-1.5 text-[#555] dark:text-[#BBB]">Ravindranath Vidyalaya, Nashik</td>
                      <td className="py-1.5 text-[#666]">2020</td>
                      <td className="py-1.5 text-right font-medium">74%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Technical Skills */}
              <div className="space-y-2">
                <h2 className="border-b border-[#E2E8F0] pb-1 text-xs font-bold uppercase tracking-wider text-[#1F2937] dark:border-[#333] dark:text-white">
                  Technical Skills
                </h2>
                <div className="space-y-1 text-xs">
                  <p><span className="font-semibold text-[#111827] dark:text-white">Languages:</span> JavaScript, Python, Java, C++, TypeScript</p>
                  <p><span className="font-semibold text-[#111827] dark:text-white">Frontend:</span> React.js, HTML, CSS, Tailwind, Redux</p>
                  <p><span className="font-semibold text-[#111827] dark:text-white">Backend:</span> Node.js, Express.js, FastAPI, REST APIs</p>
                  <p><span className="font-semibold text-[#111827] dark:text-white">Core Skills:</span> {skillsList.join(', ')}</p>
                </div>
              </div>

              {/* Work Experience */}
              <div className="space-y-2">
                <h2 className="border-b border-[#E2E8F0] pb-1 text-xs font-bold uppercase tracking-wider text-[#1F2937] dark:border-[#333] dark:text-white">
                  Work Experience & Projects
                </h2>
                <div className="space-y-3">
                  {workExperiences.map((exp, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-xs text-[#1F2937] dark:text-white">{exp.company}</h3>
                        <span className="text-[11px] text-[#888]">{exp.period}</span>
                      </div>
                      <p className="text-xs font-medium text-[#2F80ED]">{exp.designation}</p>
                      <p className="text-xs text-[#4B5563] dark:text-[#CCC]">
                        Worked on building reliable, high-performance features, improving code quality, and collaborating with cross-functional teams.
                      </p>
                    </div>
                  ))}
                  <div className="space-y-0.5 pt-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs text-[#1F2937] dark:text-white">Fake News Detection System</h3>
                      <span className="text-[11px] text-[#888]">2023 - 2024</span>
                    </div>
                    <p className="text-xs font-medium text-[#2F80ED]">NLP Classification & Web Application</p>
                    <p className="text-xs text-[#4B5563] dark:text-[#CCC]">
                      Built an end-to-end natural language processing model using TF-IDF and classification algorithms achieving 92% accuracy on benchmark news datasets.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* RIGHT SIDEBAR (Fixed / Sticky Right Panel matching Ceipal reference) */}
      <aside
        className={`fixed bottom-0 right-0 top-[56px] z-20 flex flex-col border-l border-[#E2E8F0] bg-white transition-all dark:border-[#333] dark:bg-[#1E293B] ${
          isResumePanelOpen || sidebarCollapsed
            ? 'w-0 overflow-hidden border-none pointer-events-none'
            : 'w-[305px] overflow-hidden'
        }`}
      >
        <div className="shrink-0 border-b border-[#E2E8F0] bg-white px-4 pb-3 pt-4 dark:border-[#333] dark:bg-[#252525]">
          <h2 className="m-0 block text-sm font-semibold leading-5 text-[#1F2937] dark:text-white">Applicant Details</h2>
        </div>
        <div className="space-y-5 overflow-y-auto p-4 text-xs">
          {/* Section 1: Applicant Details */}
          <div>
            <div className="space-y-2.5">
              <div>
                <span className="block text-[10px] font-medium text-[#888]">Ownership</span>
                <span className="font-semibold text-[#222] dark:text-white">{applicant.assignedRecruiter || 'Ganesh Kshirsagar'}</span>
              </div>

              <div>
                <span className="block text-[10px] font-medium text-[#888]">Applicant Status</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-[#222] dark:text-white">{applicant.status || 'New lead (Allowed to submit)'}</span>
                  <button
                    type="button"
                    onClick={() => setDialog('status')}
                    className="text-[#2F80ED] hover:text-[#18558A]"
                    title="Edit Status"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-medium text-[#888]">Applicant Group</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-[#222] dark:text-white">{applicant.applicantGroup || 'N/A'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const group = prompt('Enter Applicant Group', applicant.applicantGroup || '');
                      if (group !== null) {
                        setApplicant({ ...applicant, applicantGroup: group });
                        ApiService.updateApplicant(applicant.id, { applicantGroup: group });
                        showToast('Applicant group updated.');
                      }
                    }}
                    className="text-[#2F80ED] hover:text-[#18558A]"
                    title="Edit Group"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-medium text-[#888]">Source</span>
                <span className="font-medium text-[#222] dark:text-white">{applicant.source || 'Naukri'}</span>
              </div>

              <div>
                <span className="block text-[10px] font-medium text-[#888]">Work Authorization</span>
                <span className="font-medium text-[#222] dark:text-white">{applicant.workAuthorization || 'N/A'}</span>
              </div>

              <div>
                <span className="block text-[10px] font-medium text-[#888]">Home Phone Number</span>
                <span className="font-medium text-[#222] dark:text-white">{applicant.homePhone || 'N/A'}</span>
              </div>

              <div>
                <span className="block text-[10px] font-medium text-[#888]">Skills</span>
                <p className="leading-snug text-[#444] dark:text-[#CCC]">
                  {applicant.skills?.length ? applicant.skills.join(', ') : '.NET FRAMEWORK, E-Commerce, Datadog, Root Cause Analysis, Salesforce Comme'}
                </p>
                <button type="button" onClick={() => setDialog('edit')} className="mt-0.5 text-[10px] font-semibold text-[#2F80ED] hover:underline">
                  <span>More</span><ChevronDown className="ml-0.5 inline h-3 w-3" />
                </button>
              </div>

              <div>
                <span className="block text-[10px] font-medium text-[#888]">Experience</span>
                <span className="font-medium text-[#222] dark:text-white">
                  {applicant.experienceYears ? `${applicant.experienceYears} Years 2 Months` : '9 Years 2 Months'}
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-medium text-[#888]">Expected CTC</span>
                <span className="font-medium text-[#222] dark:text-white">{applicant.expectedCTC || applicant.expectedSalary || 'N/A'}</span>
              </div>

              <div>
                <span className="block text-[10px] font-medium text-[#888]">Current CTC</span>
                <span className="font-medium text-[#222] dark:text-white">{applicant.currentCTC || 'N/A'}</span>
              </div>

              <div>
                <span className="block text-[10px] font-medium text-[#888]">Notice Period</span>
                <span className="font-medium text-[#222] dark:text-white">{applicant.noticePeriod || 'N/A'}</span>
              </div>

              <div>
                <span className="block text-[10px] font-medium text-[#888]">Date Of Birth</span>
                <span className="font-medium text-[#222] dark:text-white">{applicant.dateOfBirth || '17/02/1993 (33) Years'}</span>
              </div>

              <div>
                <span className="block text-[10px] font-medium text-[#888]">Relocation</span>
                <span className="font-medium text-[#222] dark:text-white">{applicant.willingToRelocate !== false ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          <hr className="border-[#E2E8F0] dark:border-[#333]" />

          {/* Section 2: Personal Details */}
          <div>
            <h2 className="mb-3 text-xs font-bold text-[#1F2937] dark:text-white">Personal Details</h2>
            <div className="space-y-2.5">
              <div>
                <span className="flex items-center gap-1 text-[10px] font-medium text-[#888]">
                  Maiden Name
                  <CircleHelp className="h-3 w-3 text-[#2F80ED]" />
                </span>
                <span className="font-medium text-[#222] dark:text-white">N/A</span>
              </div>

              <div>
                <span className="flex items-center gap-1 text-[10px] font-medium text-[#888]">
                  Relevant experience
                  <CircleHelp className="h-3 w-3 text-[#2F80ED]" />
                </span>
                <span className="font-medium text-[#222] dark:text-white">{applicant.relevantExperience ? `${applicant.relevantExperience} Years` : 'N/A'}</span>
              </div>

              <div>
                <span className="flex items-center gap-1 text-[10px] font-medium text-[#888]">
                  Passport number
                  <CircleHelp className="h-3 w-3 text-[#2F80ED]" />
                </span>
                <span className="font-medium text-[#222] dark:text-white">{applicant.passportNumber || 'N/A'}</span>
              </div>

              <div>
                <span className="flex items-center gap-1 text-[10px] font-medium text-[#888]">
                  Marital status
                  <CircleHelp className="h-3 w-3 text-[#2F80ED]" />
                </span>
                <span className="font-medium text-[#222] dark:text-white">N/A</span>
              </div>

              <div>
                <span className="flex items-center gap-1 text-[10px] font-medium text-[#888]">
                  Preferred Shift
                  <CircleHelp className="h-3 w-3 text-[#2F80ED]" />
                </span>
                <span className="font-medium text-[#222] dark:text-white">{applicant.preferredShift || 'N/A'}</span>
              </div>

              <div>
                <span className="flex items-center gap-1 text-[10px] font-medium text-[#888]">
                  Nationality
                  <CircleHelp className="h-3 w-3 text-[#2F80ED]" />
                </span>
                <span className="font-medium text-[#222] dark:text-white">{applicant.customFields?.nationality || 'N/A'}</span>
              </div>
            </div>
          </div>

          <hr className="border-[#E2E8F0] dark:border-[#333]" />

          {/* Section 3: User Defined Fields */}
          <div>
            <h2 className="mb-2 text-xs font-bold text-[#1F2937] dark:text-white">User Defined Fields</h2>
            <p className="text-[11px] text-[#888]">No user defined fields available</p>
          </div>
        </div>
      </aside>

      {/* Blue Sidebar Toggle Tab on Right Screen Edge */}
      <button
        type="button"
        onClick={() => setSidebarCollapsed((prev) => !prev)}
        style={{ top: '48%' }}
        className={`fixed z-30 flex h-8 w-4 items-center justify-center rounded-l bg-[#2F80ED] text-white shadow-lg transition-all ${
          sidebarCollapsed ? 'right-0' : 'right-[305px]'
        }`}
        title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {sidebarCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {/* DIALOGS & MODALS */}

      {/* Edit Applicant Modal */}
      {dialog === 'edit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDialog(null)}>
          <div className="w-full max-w-lg rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-2xl dark:border-[#444] dark:bg-[#1E293B]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 dark:border-[#333]">
              <h2 className="text-sm font-bold text-[#1F2937] dark:text-white">Edit Applicant Profile</h2>
              <button onClick={() => setDialog(null)} className="text-[#888] hover:text-[#222]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 py-4 text-xs">
              <label className="block space-y-1">
                <span className="text-[#666] dark:text-[#AAA]">Full Name</span>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded border border-[#CED4DA] p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="text-[#666] dark:text-[#AAA]">Email</span>
                  <input
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded border border-[#CED4DA] p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[#666] dark:text-[#AAA]">Phone</span>
                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full rounded border border-[#CED4DA] p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="text-[#666] dark:text-[#AAA]">Designation</span>
                  <input
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="w-full rounded border border-[#CED4DA] p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[#666] dark:text-[#AAA]">Location</span>
                  <input
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full rounded border border-[#CED4DA] p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                  />
                </label>
              </div>
              <label className="block space-y-1">
                <span className="text-[#666] dark:text-[#AAA]">Experience (Years)</span>
                <input
                  type="number"
                  value={editExperience}
                  onChange={(e) => setEditExperience(Number(e.target.value))}
                  className="w-full rounded border border-[#CED4DA] p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[#666] dark:text-[#AAA]">Skills (comma separated)</span>
                <textarea
                  rows={2}
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                  className="w-full rounded border border-[#CED4DA] p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#E2E8F0] pt-3 dark:border-[#333]">
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="rounded border border-[#CED4DA] px-3 py-1.5 text-xs text-[#555] hover:bg-gray-50 dark:border-[#444] dark:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="rounded bg-[#2F80ED] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1D6FD8]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Resume Modal */}
      {dialog === 'resume' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDialog(null)}>
          <div className="w-full max-w-2xl rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-2xl dark:border-[#444] dark:bg-[#1E293B]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 dark:border-[#333]">
              <div>
                <h2 className="text-sm font-bold text-[#1F2937] dark:text-white">Resume Document â€” {applicant.name}</h2>
                <p className="text-[11px] text-[#888]">{applicant.currentDesignation} Â· {applicant.location}</p>
              </div>
              <button onClick={() => setDialog(null)} className="text-[#888] hover:text-[#222]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="my-4 max-h-[60vh] space-y-3 overflow-y-auto rounded-lg border border-[#E2E8F0] bg-[#FAFAFA] p-5 text-xs font-mono leading-relaxed dark:border-[#333] dark:bg-[#202020]">
              <div className="border-b border-[#E2E8F0] pb-3 dark:border-[#333]">
                <h3 className="text-base font-bold text-[#222] dark:text-white">{applicant.name}</h3>
                <p className="text-xs text-[#2F80ED]">{applicant.currentDesignation}</p>
                <p className="text-[11px] text-[#666] dark:text-[#AAA]">{applicant.email} | {applicant.phone} | {applicant.location}</p>
              </div>
              <div>
                <h4 className="font-bold text-[#444] uppercase dark:text-[#DDD]">Summary</h4>
                <p className="text-[#555] dark:text-[#BBB]">{applicant.summary || 'Seasoned technical specialist with proven experience building, supporting, and optimizing mission-critical solutions in enterprise environments.'}</p>
              </div>
              <div>
                <h4 className="font-bold text-[#444] uppercase dark:text-[#DDD]">Core Technical Skills</h4>
                <p className="text-[#555] dark:text-[#BBB]">{applicant.skills.join(' Ã‚Â· ')}</p>
              </div>
              <div>
                <h4 className="font-bold text-[#444] uppercase dark:text-[#DDD]">Experience</h4>
                <p className="text-[#555] dark:text-[#BBB]">{applicant.experienceYears ? `${applicant.experienceYears} Years 2 Months of industry experience.` : '9 Years 2 Months of industry experience.'}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#E2E8F0] pt-3 dark:border-[#333]">
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="rounded border border-[#CED4DA] px-3 py-1.5 text-xs text-[#555] hover:bg-gray-50 dark:border-[#444] dark:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal (Exact Replication of Reference Image 1) */}
      {dialog === 'note' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDialog(null)}>
          <div className="w-full max-w-[700px] border border-[#CBD5E1] bg-white shadow-2xl dark:border-[#444] dark:bg-[#1E293B]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3 dark:border-[#333]">
              <h3 className="text-sm font-bold text-[#1F2937] dark:text-white">Add Note</h3>
              <button onClick={() => setDialog(null)} className="text-[#888] hover:text-[#222] dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 px-5 py-5 text-xs">
              {/* Row 1: Applicant Name & Search for a Job */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <input
                    type="text"
                    readOnly
                    value={displayName}
                    className="w-full rounded border border-[#CBD5E1] bg-gray-50 p-2 text-xs font-semibold text-[#1F2937] outline-none dark:border-[#444] dark:bg-[#333] dark:text-white"
                  />
                </div>
                <div>
                  <select
                    value={noteJob}
                    onChange={(e) => setNoteJob(e.target.value)}
                    className="w-full rounded border border-[#CBD5E1] bg-white p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                  >
                    <option value="">Search for a Job</option>
                    <option value="AMP12294">AMP12294 - E-commerce Production Support</option>
                    <option value="AMP12295">AMP12295 - Principal Cloud AI Architect</option>
                    <option value="AMP12296">AMP12296 - Senior Platform Support Engineer</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Priority & Search for Client */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <select
                    value={newNotePriority}
                    onChange={(e) => setNewNotePriority(e.target.value)}
                    className="w-full rounded border border-[#CBD5E1] bg-white p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <select
                    value={noteClient}
                    onChange={(e) => setNoteClient(e.target.value)}
                    className="w-full rounded border border-[#CBD5E1] bg-white p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                  >
                    <option value="">Search for a Client</option>
                    <option value="Dentsu">Dentsu</option>
                    <option value="CloudScale Enterprises">CloudScale Enterprises</option>
                    <option value="FinEdge Capital">FinEdge Capital</option>
                    <option value="Ampcus Tech Pvt Ltd.">Ampcus Tech Pvt Ltd.</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Select Contact / Requisition & Select Actions */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <select
                    value={noteContact}
                    onChange={(e) => setNoteContact(e.target.value)}
                    className="w-full rounded border border-[#CBD5E1] bg-white p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                  >
                    <option value="">Select</option>
                    <option value="Primary Contact">Primary Contact</option>
                    <option value="Hiring Manager">Hiring Manager</option>
                    <option value="HR Lead">HR Lead</option>
                  </select>
                </div>
                <div>
                  <select
                    value={noteAction}
                    onChange={(e) => setNoteAction(e.target.value)}
                    className="w-full rounded border border-[#CBD5E1] bg-white p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                  >
                    <option value="">Select Actions</option>
                    <option value="Call">Call Candidate</option>
                    <option value="Email">Email Candidate</option>
                    <option value="Interview">Schedule Interview</option>
                    <option value="Internal Review">Internal Team Review</option>
                    <option value="Submission Follow-up">Submission Follow-up</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Remind Me Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={noteRemindMe}
                  onChange={(e) => setNoteRemindMe(e.target.checked)}
                  className="rounded border-[#CBD5E1] text-[#2F80ED] focus:ring-0"
                />
                <span className="text-xs text-[#444] dark:text-[#CCC]">Remind Me</span>
              </label>

              {/* Row 5: Subject line */}
              <div>
                <input
                  type="text"
                  value={noteSubject || `New Note Created for ${displayName} - ${displayId}.`}
                  onChange={(e) => setNoteSubject(e.target.value)}
                  placeholder={`New Note Created for ${displayName} - ${displayId}.`}
                  className="w-full rounded border border-[#CBD5E1] bg-white p-2 text-xs font-medium outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                />
              </div>

              <EmailRichTextEditor
                value={newNoteText}
                resetKey={noteEditorResetKey}
                accentColor="#2F80ED"
                onChange={setNewNoteText}
                onError={showToast}
              />

              {/* Row 7: Add To Task Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={noteAddToTask}
                  onChange={(e) => setNoteAddToTask(e.target.checked)}
                  className="rounded border-[#CBD5E1] text-[#2F80ED] focus:ring-0"
                />
                <span className="text-xs text-[#444] dark:text-[#CCC]">Add To Task</span>
              </label>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-[#E2E8F0] px-5 py-3 dark:border-[#333]">
              <button
                type="button"
                onClick={handleAddNote}
                className="rounded bg-[#2F80ED] px-6 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1D6FD8] transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="rounded border border-[#CED4DA] bg-white px-5 py-1.5 text-xs font-semibold text-[#444] hover:bg-gray-50 dark:border-[#444] dark:bg-[#333] dark:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {dialog === 'task' && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/50" onClick={() => setDialog(null)}>
          <section aria-label="Create new task" className="flex h-full w-full max-w-[900px] flex-col overflow-y-auto bg-white shadow-2xl dark:bg-[#1E293B]" onClick={(e) => e.stopPropagation()}>
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-[#334155] dark:bg-[#172033]"><h2 className="text-base font-semibold text-slate-800 dark:text-white"><span className="mr-2 text-blue-500">â†</span>Create New Task</h2><button aria-label="Close task form" onClick={() => setDialog(null)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white"><X className="h-5 w-5" /></button></header>
            <div className="grid flex-1 grid-cols-1 gap-6 p-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-3 text-xs">
                <div className="flex gap-2"><input value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Enter Title" className="min-w-0 flex-1 border border-slate-300 bg-slate-50 px-2 py-1.5 outline-none focus:border-blue-500 dark:border-[#475569] dark:bg-[#263449] dark:text-white" /><select aria-label="Priority" className="border border-slate-300 bg-slate-50 px-2 dark:border-[#475569] dark:bg-[#263449] dark:text-white"><option>ðŸŒŸ</option><option>High</option><option>Normal</option></select></div>
                <textarea value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.target.value)} placeholder="Enter a brief description of the task" rows={3} className="w-full border border-slate-300 bg-slate-50 p-2 outline-none focus:border-blue-500 dark:border-[#475569] dark:bg-[#263449] dark:text-white" />
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 text-slate-500">Task Type<select value={newTaskType} onChange={(e) => setNewTaskType(e.target.value)} className="block w-full border border-slate-300 bg-slate-50 px-2 py-1.5 text-slate-800 dark:border-[#475569] dark:bg-[#263449] dark:text-white"><option>Call</option><option>Follow-up</option><option>Meeting</option><option>Screening</option><option>Other</option></select></label>
                  <label className="space-y-1 text-slate-500">Task Category<select value={newTaskCategory} onChange={(e) => setNewTaskCategory(e.target.value)} className="block w-full border border-slate-300 bg-slate-50 px-2 py-1.5 text-slate-800 dark:border-[#475569] dark:bg-[#263449] dark:text-white"><option value="">Select</option><option>Recruiting</option><option>Follow-up</option><option>Interview</option><option>Administrative</option></select></label>
                  <label className="space-y-1 text-slate-500">Related To<input readOnly value="Applicant" className="block w-full border border-slate-300 bg-slate-50 px-2 py-1.5 text-slate-700 dark:border-[#475569] dark:bg-[#263449] dark:text-white" /></label>
                  <label className="space-y-1 text-slate-500">Applicant<input readOnly value={`${applicant.applicantId ? `${applicant.applicantId} - ` : ''}${applicant.name}`} className="block w-full border border-slate-300 bg-slate-50 px-2 py-1.5 text-slate-700 dark:border-[#475569] dark:bg-[#263449] dark:text-white" /></label>
                  <label className="space-y-1 text-slate-500">Due Date<input type="datetime-local" value={newTaskDue} onChange={(e) => setNewTaskDue(e.target.value)} className="block w-full border border-slate-300 bg-slate-50 px-2 py-1.5 text-slate-800 dark:border-[#475569] dark:bg-[#263449] dark:text-white" /></label>
                  <label className="space-y-1 text-slate-500">Status<select value={newTaskStatus} onChange={(e) => setNewTaskStatus(e.target.value)} className="block w-full border border-slate-300 bg-slate-50 px-2 py-1.5 text-slate-800 dark:border-[#475569] dark:bg-[#263449] dark:text-white"><option>Not Started</option><option>In Progress</option><option>Completed</option><option>Deferred</option></select></label>
                  <label className="space-y-1 text-slate-500">Assign To<input value={newTaskAssignee} onChange={(e) => setNewTaskAssignee(e.target.value)} className="block w-full border border-slate-300 bg-slate-50 px-2 py-1.5 text-slate-800 dark:border-[#475569] dark:bg-[#263449] dark:text-white" /></label>
                  <label className="space-y-1 text-slate-500">Escalate To<input className="block w-full border border-slate-300 bg-slate-50 px-2 py-1.5 dark:border-[#475569] dark:bg-[#263449]" /></label>
                  <label className="space-y-1 text-slate-500">Reminder<select value={newTaskReminder} onChange={(e) => setNewTaskReminder(e.target.value)} className="block w-full border border-slate-300 bg-slate-50 px-2 py-1.5 text-slate-800 dark:border-[#475569] dark:bg-[#263449] dark:text-white"><option>None</option><option>At due time</option><option>15 minutes before</option><option>1 hour before</option><option>1 day before</option></select></label>
                  <label className="space-y-1 text-slate-500">Ownership<input className="block w-full border border-slate-300 bg-slate-50 px-2 py-1.5 dark:border-[#475569] dark:bg-[#263449]" /></label>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300"><label><input type="checkbox" className="mr-2" />Notify Via Email</label><label><input type="checkbox" className="mr-2" />Show task on event calendar</label><label><input type="checkbox" className="mr-2" />Recurrence Task</label></div>
                <div className="flex gap-2 pt-3"><button type="button" onClick={() => { if (!newTaskTitle.trim()) { showToast('Enter a task title.'); return; } setApplicantTasks((items) => [...items, { title: newTaskTitle.trim(), description: newTaskDescription, due: newTaskDue, status: newTaskStatus, assignee: newTaskAssignee }]); setNewTaskTitle(''); setNewTaskDescription(''); setNewTaskDue(''); setDialog(null); showToast('Task added to applicant workspace.'); }} className="rounded bg-[#2F80ED] px-4 py-2 font-semibold text-white hover:bg-[#1D6FD8]">Create Task</button><button type="button" onClick={() => setDialog(null)} className="rounded border border-slate-300 px-4 py-2 text-slate-600 dark:border-[#475569] dark:text-slate-200">Cancel</button></div>
              </div>
              <aside className="min-h-72 bg-slate-50 p-4 dark:bg-[#172033]"><h3 className="font-semibold text-slate-800 dark:text-white">Assigned Tasks</h3>{applicantTasks.length ? <ul className="mt-3 space-y-2">{applicantTasks.map((task, i) => <li key={`${task.title}-${i}`} className="border-b border-slate-200 py-2 dark:border-[#334155]"><p className="font-medium text-slate-700 dark:text-slate-200">{task.title}</p><p className="text-[11px] text-slate-500">{task.status}{task.due ? ` Â· ${task.due}` : ''}</p></li>)}</ul> : <p className="mt-3 text-center italic text-slate-400">No data available</p>}</aside>
            </div>
          </section>
        </div>
      )}

      {dialog === 'call-log' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setDialog(null)}>
          <section aria-label="Call Logs" className="w-full max-w-xl border border-slate-200 bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]" onClick={(e) => e.stopPropagation()}>
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-[#334155]"><h2 className="text-base font-medium text-slate-800 dark:text-white">Call Logs</h2><button aria-label="Close call log form" onClick={() => setDialog(null)}><X className="h-4 w-4 text-slate-500" /></button></header>
            <div className="space-y-4 p-5 text-xs">
              <div className="grid grid-cols-2 gap-4"><label className="space-y-1 text-slate-500">Call Type<select value={newCallType} onChange={(e) => setNewCallType(e.target.value)} className="block w-full border border-slate-300 bg-slate-50 px-2 py-2 text-slate-800 dark:border-[#475569] dark:bg-[#263449] dark:text-white"><option>Call</option><option>Incoming Call</option><option>Outgoing Call</option><option>Video Call</option></select></label><label className="space-y-1 text-slate-500">Call Taken On<input type="datetime-local" value={newCallDate} onChange={(e) => setNewCallDate(e.target.value)} className="block w-full border border-slate-300 bg-slate-50 px-2 py-2 text-slate-800 dark:border-[#475569] dark:bg-[#263449] dark:text-white" /></label></div>
              <label className="block space-y-1 text-slate-500">Comments<textarea value={newCallComments} onChange={(e) => setNewCallComments(e.target.value)} rows={2} className="block w-full border border-slate-300 bg-slate-50 p-2 text-slate-800 dark:border-[#475569] dark:bg-[#263449] dark:text-white" /></label>
              <h3 className="pt-1 text-sm font-semibold text-slate-800 dark:text-white">Follow Up Notes</h3>
              <label className="block max-w-xs space-y-1 text-slate-500">Date &amp; Time<input type="datetime-local" value={newCallFollowUp} onChange={(e) => setNewCallFollowUp(e.target.value)} className="block w-full border border-slate-300 bg-slate-50 px-2 py-2 text-slate-800 dark:border-[#475569] dark:bg-[#263449] dark:text-white" /></label>
              <p className="text-[11px] text-slate-500">Time Zone: (UTC+05:30) IST</p>
              <label className="block max-w-xs space-y-1 text-slate-500">Reminder<select className="block w-full border border-slate-300 bg-slate-50 px-2 py-2 text-slate-800 dark:border-[#475569] dark:bg-[#263449] dark:text-white"><option>Select Reminder</option><option>At follow-up time</option><option>15 minutes before</option><option>1 hour before</option></select></label>
              <label className="block space-y-1 text-slate-500">Notes<textarea rows={2} className="block w-full border border-slate-300 bg-slate-50 p-2 dark:border-[#475569] dark:bg-[#263449] dark:text-white" /></label>
            </div>
            <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-[#334155]"><button onClick={() => setDialog(null)} className="rounded border border-slate-300 px-4 py-2 text-slate-600 dark:border-[#475569] dark:text-slate-200">Cancel</button><button onClick={() => { setCallLogs((items) => [...items, { type: newCallType, comments: newCallComments, followUp: newCallFollowUp, date: newCallDate || new Date().toLocaleString(), by: currentUser?.name || 'Current User' }]); setNewCallComments(''); setNewCallFollowUp(''); setNewCallDate(''); setDialog(null); showToast('Call log saved.'); }} className="rounded bg-[#2F80ED] px-5 py-2 font-semibold text-white">Save</button></footer>
          </section>
        </div>
      )}

      {dialog === 'meeting' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setDialog(null)}>
          <section aria-label="Schedule Meeting" className="w-full max-w-xl border border-slate-200 bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]" onClick={(e) => e.stopPropagation()}>
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-[#334155]"><h2 className="text-base font-medium text-slate-800 dark:text-white">Schedule Meeting</h2><button aria-label="Close meeting form" onClick={() => setDialog(null)}><X className="h-4 w-4 text-slate-500" /></button></header>
            <div className="grid grid-cols-2 gap-4 p-5 text-xs">
              <label className="col-span-2 space-y-1 text-slate-500">Meeting Title<input value={newMeetingTitle} onChange={(e) => setNewMeetingTitle(e.target.value)} className="block w-full border border-slate-300 bg-slate-50 px-2 py-2 dark:border-[#475569] dark:bg-[#263449] dark:text-white" /></label>
              <label className="col-span-2 space-y-1 text-slate-500">Meeting Description<textarea value={newMeetingDescription} onChange={(e) => setNewMeetingDescription(e.target.value)} rows={2} className="block w-full border border-slate-300 bg-slate-50 p-2 dark:border-[#475569] dark:bg-[#263449] dark:text-white" /></label>
              <label className="space-y-1 text-slate-500">Meeting Mode<select value={newMeetingMode} onChange={(e) => setNewMeetingMode(e.target.value)} className="block w-full border border-slate-300 bg-slate-50 px-2 py-2 dark:border-[#475569] dark:bg-[#263449] dark:text-white"><option value="">Select</option><option>Online</option><option>In Person</option><option>Phone</option></select></label>
              <label className="space-y-1 text-slate-500">Meeting Date<input type="date" value={newMeetingDate} onChange={(e) => setNewMeetingDate(e.target.value)} className="block w-full border border-slate-300 bg-slate-50 px-2 py-2 dark:border-[#475569] dark:bg-[#263449] dark:text-white" /></label>
              <label className="space-y-1 text-slate-500">Meeting Time<input type="time" value={newMeetingTime} onChange={(e) => setNewMeetingTime(e.target.value)} className="block w-full border border-slate-300 bg-slate-50 px-2 py-2 dark:border-[#475569] dark:bg-[#263449] dark:text-white" /></label>
              <label className="space-y-1 text-slate-500">Duration<select value={newMeetingDuration} onChange={(e) => setNewMeetingDuration(e.target.value)} className="block w-full border border-slate-300 bg-slate-50 px-2 py-2 dark:border-[#475569] dark:bg-[#263449] dark:text-white"><option>30 mins</option><option>15 mins</option><option>45 mins</option><option>1 hour</option><option>90 mins</option></select></label>
              <label className="space-y-1 text-slate-500">Add an Attendee<input readOnly value={currentUser?.name || 'Me'} className="block w-full border border-slate-300 bg-slate-50 px-2 py-2 dark:border-[#475569] dark:bg-[#263449] dark:text-white" /></label>
              <label className="space-y-1 text-slate-500">Guest Attendees<textarea value={newMeetingGuests} onChange={(e) => setNewMeetingGuests(e.target.value)} placeholder="Enter Email-IDs with comma separator" rows={2} className="block w-full border border-slate-300 bg-slate-50 p-2 dark:border-[#475569] dark:bg-[#263449] dark:text-white" /></label>
              <label className="col-span-2 text-slate-600 dark:text-slate-300"><input type="checkbox" className="mr-2" />Notify Via Email</label>
            </div>
            <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-[#334155]"><button onClick={() => setDialog(null)} className="rounded border border-slate-300 px-4 py-2 text-slate-600 dark:border-[#475569] dark:text-slate-200">Cancel</button><button onClick={() => { if (!newMeetingTitle.trim()) { showToast('Enter a meeting title.'); return; } const meetingTime = [newMeetingDate, newMeetingTime].filter(Boolean).join(' '); setMeetings((items) => [...items, { title: newMeetingTitle.trim(), description: `${newMeetingMode ? `${newMeetingMode} Â· ` : ''}${newMeetingDescription}`, attendees: currentUser?.name || 'Me', guests: newMeetingGuests, time: `${meetingTime}${meetingTime ? ` Â· ${newMeetingDuration}` : newMeetingDuration}`, by: currentUser?.name || 'Current User' }]); setNewMeetingTitle(''); setNewMeetingDescription(''); setNewMeetingDate(''); setNewMeetingTime(''); setNewMeetingGuests(''); setDialog(null); showToast('Meeting scheduled.'); }} className="rounded bg-[#2F80ED] px-5 py-2 font-semibold text-white">Schedule</button></footer>
          </section>
        </div>
      )}

      {/* Add Tag Modal */}
      {dialog === 'tag' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDialog(null)}>
          <div className="w-full max-w-sm rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-2xl dark:border-[#444] dark:bg-[#1E293B]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 dark:border-[#333]">
              <h2 className="text-sm font-bold text-[#1F2937] dark:text-white">Add Tag</h2>
              <button onClick={() => setDialog(null)} className="text-[#888] hover:text-[#222]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="py-4 text-xs">
              <label className="block space-y-1">
                <span className="text-[#666] dark:text-[#AAA]">Tag Name</span>
                <input
                  autoFocus
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="e.g. Relocation Ready, Silver Medalist"
                  className="w-full rounded border border-[#CED4DA] p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#E2E8F0] pt-3 dark:border-[#333]">
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="rounded border border-[#CED4DA] px-3 py-1.5 text-xs text-[#555] hover:bg-gray-50 dark:border-[#444] dark:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded bg-[#2F80ED] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1D6FD8]"
              >
                Add Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Matching Jobs Modal */}
      {dialog === 'matching-jobs' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDialog(null)}>
          <div className="w-full max-w-xl rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-2xl dark:border-[#444] dark:bg-[#1E293B]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 dark:border-[#333]">
              <div>
                <h2 className="text-sm font-bold text-[#1F2937] dark:text-white">Matching Requisitions</h2>
                <p className="text-[11px] text-[#888]">Matched based on candidate skills and role experience</p>
              </div>
              <button onClick={() => setDialog(null)} className="text-[#888] hover:text-[#222]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="my-4 space-y-2 text-xs">
              {[
                { title: 'AMP12294, E-commerce production support', client: 'Dentsu', score: 95 },
                { title: 'Principal Cloud AI Architect', client: 'CloudScale Enterprises', score: 88 },
                { title: 'Senior Platform Support Engineer', client: 'FinEdge Capital', score: 82 }
              ].map((job) => (
                <div key={job.title} className="flex items-center justify-between rounded-lg border border-[#E2E8F0] p-3 hover:bg-gray-50 dark:border-[#333] dark:hover:bg-[#202020]">
                  <div>
                    <h3 className="font-semibold text-[#18558A] dark:text-[#90CDF4]">{job.title}</h3>
                    <p className="text-[11px] text-[#666] dark:text-[#AAA]">Client: {job.client}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-emerald-600">{job.score}% Match</span>
                    <button
                      type="button"
                      onClick={() => {
                        setApplicant({ ...applicant, assignedJobTitle: job.title });
                        setDialog(null);
                        showToast(`Applicant matched to ${job.title}.`);
                      }}
                      className="ml-3 rounded bg-[#2F80ED] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#1D6FD8]"
                    >
                      Match
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end border-t border-[#E2E8F0] pt-3 dark:border-[#333]">
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="rounded border border-[#CED4DA] px-3 py-1.5 text-xs text-[#555] hover:bg-gray-50 dark:border-[#444] dark:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {dialog === 'status' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDialog(null)}>
          <div className="w-full max-w-sm rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-2xl dark:border-[#444] dark:bg-[#1E293B]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 dark:border-[#333]">
              <h2 className="text-sm font-bold text-[#1F2937] dark:text-white">Change Applicant Status</h2>
              <button onClick={() => setDialog(null)} className="text-[#888] hover:text-[#222]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2 py-4 text-xs">
              {[
                'New',
                'Screening',
                'Submitted',
                'Interview',
                'Selected',
                'Offered',
                'Hired',
                'Rejected'
              ].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleUpdateStatus(st as PipelineStage)}
                  className={`block w-full rounded px-3 py-2 text-left transition-colors ${
                    applicant.status === st
                      ? 'bg-[#2F80ED] font-semibold text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-[#333]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Modal: Add Education */}
      {dialog === 'add-education' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-[2px] sm:p-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="education-dialog-title"
            className="flex h-[min(46rem,calc(100dvh-1.5rem))] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#454545] dark:bg-[#252525] sm:h-[min(46rem,calc(100dvh-3rem))]"
          >
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-[#3A3A3A] sm:px-7 sm:py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2F80ED] dark:bg-[#1E3A5F]">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2F80ED]">Professional details</p>
                  <h3 id="education-dialog-title" className="text-base font-bold text-[#172033] dark:text-white">Add education</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-[#AAA]">Record a qualification to complete the applicant profile.</p>
                </div>
              </div>
              <button type="button" aria-label="Close education form" onClick={() => setDialog(null)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-[#333] dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={(event) => {
                event.preventDefault();
                handleAddEducation();
              }}
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
                <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
                  <section aria-labelledby="education-fields-title">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h4 id="education-fields-title" className="text-sm font-bold text-slate-800 dark:text-white">Qualification information</h4>
                        <p className="mt-1 text-xs text-slate-500 dark:text-[#AAA]">Fields marked <span className="font-semibold text-red-500">*</span> are required.</p>
                      </div>
                      <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500 sm:inline-block dark:bg-[#333] dark:text-[#BBB]">Step 1 of 1</span>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                      <label className="block space-y-2 md:col-span-2">
                        <span className="text-xs font-semibold text-slate-700 dark:text-[#DDD]">Degree / program <span className="text-red-500">*</span></span>
                        <input
                          autoFocus
                          required
                          placeholder="e.g. Bachelor of Technology in Computer Science"
                          value={newDegree}
                          onChange={(e) => setNewDegree(e.target.value)}
                          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2F80ED] focus:ring-4 focus:ring-blue-100 dark:border-[#4A4A4A] dark:bg-[#303030] dark:text-white dark:placeholder:text-[#888] dark:focus:ring-[#1E3A5F]"
                        />
                      </label>
                      <label className="block space-y-2 md:col-span-2">
                        <span className="text-xs font-semibold text-slate-700 dark:text-[#DDD]">College / institution <span className="text-red-500">*</span></span>
                        <input
                          required
                          placeholder="e.g. Nandha College of Technology, Erode"
                          value={newInstitution}
                          onChange={(e) => setNewInstitution(e.target.value)}
                          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2F80ED] focus:ring-4 focus:ring-blue-100 dark:border-[#4A4A4A] dark:bg-[#303030] dark:text-white dark:placeholder:text-[#888] dark:focus:ring-[#1E3A5F]"
                        />
                      </label>
                      <label className="block space-y-2">
                        <span className="text-xs font-semibold text-slate-700 dark:text-[#DDD]">Graduation period</span>
                        <input
                          placeholder="e.g. January 2013"
                          value={newEduPeriod}
                          onChange={(e) => setNewEduPeriod(e.target.value)}
                          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2F80ED] focus:ring-4 focus:ring-blue-100 dark:border-[#4A4A4A] dark:bg-[#303030] dark:text-white dark:placeholder:text-[#888] dark:focus:ring-[#1E3A5F]"
                        />
                      </label>
                    </div>
                  </section>

                  <aside className="h-fit rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-[#444] dark:bg-[#2D2D2D]">
                    <div className="mb-4 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-white"><FileText className="h-4 w-4 text-[#2F80ED]" /> Profile preview</div>
                    <div className="border-l-2 border-[#2F80ED] pl-3">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{newDegree || 'Your degree or program'}</p>
                      <p className="mt-1 text-xs text-slate-600 dark:text-[#BBB]">{newInstitution || 'Your college or institution'}</p>
                      <p className="mt-2 text-[11px] font-medium text-slate-400">{newEduPeriod || 'Graduation period'}</p>
                    </div>
                    <p className="mt-5 border-t border-slate-200 pt-4 text-[11px] leading-5 text-slate-500 dark:border-[#444] dark:text-[#AAA]"></p>
                  </aside>
                </div>
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 dark:border-[#3A3A3A] dark:bg-[#252525]">
                <p className="text-[11px] text-slate-500 dark:text-[#AAA]">You can add another qualification after saving.</p>
                <div className="flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setDialog(null)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-[#555] dark:text-white dark:hover:bg-[#333]">Cancel</button>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#2F80ED] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1D6FD8] focus:outline-none focus:ring-4 focus:ring-blue-200"><Check className="h-3.5 w-3.5" /> Save education</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Work Experience */}
      {dialog === 'add-work-exp' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-[2px] sm:p-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="experience-dialog-title"
            className="flex h-[min(46rem,calc(100dvh-1.5rem))] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#454545] dark:bg-[#252525] sm:h-[min(46rem,calc(100dvh-3rem))]"
          >
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-[#3A3A3A] sm:px-7 sm:py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2F80ED] dark:bg-[#1E3A5F]">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2F80ED]">Professional details</p>
                  <h3 id="experience-dialog-title" className="text-base font-bold text-[#172033] dark:text-white">Add work experience</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-[#AAA]">Capture a role that shows the applicantâ€™s professional journey.</p>
                </div>
              </div>
              <button type="button" aria-label="Close work experience form" onClick={() => setDialog(null)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-[#333] dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={(event) => {
                event.preventDefault();
                handleAddWorkExp();
              }}
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
                <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
                  <section aria-labelledby="experience-fields-title">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h4 id="experience-fields-title" className="text-sm font-bold text-slate-800 dark:text-white">Role information</h4>
                        <p className="mt-1 text-xs text-slate-500 dark:text-[#AAA]">Fields marked <span className="font-semibold text-red-500">*</span> are required.</p>
                      </div>
                      <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500 sm:inline-block dark:bg-[#333] dark:text-[#BBB]">Step 1 of 1</span>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                      <label className="block space-y-2">
                        <span className="text-xs font-semibold text-slate-700 dark:text-[#DDD]">Company name <span className="text-red-500">*</span></span>
                        <input
                          autoFocus
                          required
                          placeholder="e.g. Infosys Pvt Ltd"
                          value={newExpCompany}
                          onChange={(e) => setNewExpCompany(e.target.value)}
                          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2F80ED] focus:ring-4 focus:ring-blue-100 dark:border-[#4A4A4A] dark:bg-[#303030] dark:text-white dark:placeholder:text-[#888] dark:focus:ring-[#1E3A5F]"
                        />
                      </label>
                      <label className="block space-y-2">
                        <span className="text-xs font-semibold text-slate-700 dark:text-[#DDD]">Role / designation <span className="text-red-500">*</span></span>
                        <input
                          required
                          placeholder="e.g. Technical Support Engineer (L2)"
                          value={newExpDesignation}
                          onChange={(e) => setNewExpDesignation(e.target.value)}
                          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2F80ED] focus:ring-4 focus:ring-blue-100 dark:border-[#4A4A4A] dark:bg-[#303030] dark:text-white dark:placeholder:text-[#888] dark:focus:ring-[#1E3A5F]"
                        />
                      </label>
                      <label className="block space-y-2 md:col-span-2">
                        <span className="text-xs font-semibold text-slate-700 dark:text-[#DDD]">Employment period</span>
                        <input
                          placeholder="e.g. October 2021 â€“ Present"
                          value={newExpPeriod}
                          onChange={(e) => setNewExpPeriod(e.target.value)}
                          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2F80ED] focus:ring-4 focus:ring-blue-100 dark:border-[#4A4A4A] dark:bg-[#303030] dark:text-white dark:placeholder:text-[#888] dark:focus:ring-[#1E3A5F]"
                        />
                        <span className="block text-[11px] text-slate-400 dark:text-[#999]">Use â€œPresentâ€ for a current role.</span>
                      </label>
                    </div>
                  </section>

                  <aside className="h-fit rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-[#444] dark:bg-[#2D2D2D]">
                    <div className="mb-4 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-white"><Briefcase className="h-4 w-4 text-[#2F80ED]" /> Profile preview</div>
                    <div className="border-l-2 border-[#2F80ED] pl-3">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{newExpCompany || 'Company name'}</p>
                      <p className="mt-1 text-xs text-slate-600 dark:text-[#BBB]">{newExpDesignation || 'Role or designation'}</p>
                      <p className="mt-2 text-[11px] font-medium text-slate-400">{newExpPeriod || 'Employment period'}</p>
                    </div>
                    <p className="mt-5 border-t border-slate-200 pt-4 text-[11px] leading-5 text-slate-500 dark:border-[#444] dark:text-[#AAA]"></p>
                  </aside>
                </div>
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 dark:border-[#3A3A3A] dark:bg-[#252525]">
                <p className="text-[11px] text-slate-500 dark:text-[#AAA]">Keep periods consistent for a clean candidate timeline.</p>
                <div className="flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setDialog(null)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-[#555] dark:text-white dark:hover:bg-[#333]">Cancel</button>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#2F80ED] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1D6FD8] focus:outline-none focus:ring-4 focus:ring-blue-200"><Check className="h-3.5 w-3.5" /> Save experience</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Employer (Ceipal 1:1 Replica from user screenshots) */}
      {dialog === 'add-employer' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl dark:bg-[#1E293B]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 dark:border-[#333]">
              <h3 className="text-sm font-bold text-[#1F2937] dark:text-white">Add Employer Details</h3>
              <button onClick={() => setDialog(null)} className="text-[#888] hover:text-[#222]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Error Alert Banner (clearly visible right inside the modal) */}
            {empModalError && (
              <div className="mx-6 mt-3 flex items-center justify-between rounded border border-red-300 bg-red-50 px-3.5 py-2.5 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{empModalError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEmpModalError(null)}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-200 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Top Radio Options */}
            <div className="flex items-center gap-6 px-6 pt-5 pb-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-[#374151] dark:text-gray-300">
                <input
                  type="radio"
                  name="empSource"
                  checked={empSourceType === 'new'}
                  onChange={() => {
                    setEmpSourceType('new');
                    setSelectedVendorContact('');
                    setVendorSearchOpen(false);
                    setEmpModalError(null);
                  }}
                  className="h-4 w-4 text-[#2F80ED] focus:ring-[#2F80ED]"
                />
                <span>New</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-[#374151] dark:text-gray-300">
                <input
                  type="radio"
                  name="empSource"
                  checked={empSourceType === 'vendor'}
                  onChange={() => {
                    setEmpSourceType('vendor');
                    setEmpModalError(null);
                  }}
                  className="h-4 w-4 text-[#2F80ED] focus:ring-[#2F80ED]"
                />
                <span>Add from existing Vendor contact records</span>
              </label>
            </div>

            {/* Form Fields: 2-column Ceipal layout */}
            <div className="px-6 py-2 space-y-3">
              {/* Row 1: (Required Dropdown or First Name) | Last Name */}
              <div className="grid grid-cols-2 gap-4">
                {empSourceType === 'vendor' ? (
                  /* Ceipal Searchable Vendor Trigger & Dropdown */
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setVendorSearchOpen(!vendorSearchOpen)}
                      className={`w-full flex items-center justify-between rounded border ${
                        empModalError && !selectedVendorContact
                          ? 'border-red-400 bg-red-50/20'
                          : 'border-[#CED4DA] bg-white dark:border-[#444] dark:bg-[#333]'
                      } px-3 py-2 text-xs text-left outline-none transition-colors hover:border-[#2F80ED] cursor-pointer`}
                    >
                      {selectedVendorContact ? (
                        <span className="truncate text-[#333] dark:text-white font-normal">
                          {vendorContactList.find((v) => v.id === selectedVendorContact)?.displayName || 'Selected'}
                        </span>
                      ) : (
                        <span className="italic text-[#6B7280]">Required</span>
                      )}
                      {vendorSearchOpen ? (
                        <ChevronUp className="h-4 w-4 text-[#2F80ED] shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
                      )}
                    </button>

                    {/* Dropdown with search input & contact list (matches media_1795175851155_5c9bcccc.png) */}
                    {vendorSearchOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setVendorSearchOpen(false)}
                        />
                        <div className="absolute left-0 right-0 top-full mt-1 z-40 rounded border border-[#CED4DA] bg-white p-2 shadow-2xl dark:border-[#444] dark:bg-[#252525] animate-in fade-in zoom-in-95 duration-100">
                          {/* Search Input Box */}
                          <div className="relative mb-2">
                            <input
                              type="text"
                              placeholder=""
                              value={vendorSearchQuery}
                              onChange={(e) => setVendorSearchQuery(e.target.value)}
                              className="w-full rounded border border-[#2F80ED] bg-white px-2.5 py-1.5 pr-8 text-xs text-[#333] outline-none focus:ring-1 focus:ring-[#2F80ED] dark:border-[#2F80ED] dark:bg-[#333] dark:text-white"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Search className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                          </div>

                          {/* Filtered Records List */}
                          <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-[#333]">
                            {filteredVendors.length > 0 ? (
                              filteredVendors.map((v) => (
                                <div
                                  key={v.id}
                                  onClick={() => handleSelectVendor(v)}
                                  className={`cursor-pointer rounded px-2.5 py-2 text-xs transition-colors ${
                                    selectedVendorContact === v.id
                                      ? 'bg-blue-50 text-[#2F80ED] font-medium dark:bg-[#1E3A8A]/30'
                                      : 'text-[#333] hover:bg-[#F3F4F6] dark:text-gray-200 dark:hover:bg-[#333]'
                                  }`}
                                >
                                  {v.displayName}
                                </div>
                              ))
                            ) : (
                              <div className="px-2.5 py-3 text-center text-xs italic text-gray-400">
                                No matching vendor contacts
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={empFirstName}
                      onChange={(e) => {
                        setEmpFirstName(e.target.value);
                        if (empModalError) setEmpModalError(null);
                      }}
                      className="w-full rounded border border-[#CED4DA] bg-white px-3 py-2 text-xs text-[#333] placeholder-[#888] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                    />
                  </div>
                )}
                <div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={empLastName}
                    onChange={(e) => setEmpLastName(e.target.value)}
                    className="w-full rounded border border-[#CED4DA] bg-white px-3 py-2 text-xs text-[#333] placeholder-[#888] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                  />
                </div>
              </div>

              {/* Row 2: Employer Name | Office Number & Extension */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Employer Name"
                    value={empEmployerName}
                    onChange={(e) => {
                      setEmpEmployerName(e.target.value);
                      if (empModalError) setEmpModalError(null);
                    }}
                    className={`w-full rounded border ${
                      empModalError && !empEmployerName.trim()
                        ? 'border-red-400 bg-red-50/20'
                        : 'border-[#CED4DA] bg-white dark:border-[#444] dark:bg-[#333]'
                    } px-3 py-2 text-xs text-[#333] placeholder-[#888] outline-none focus:border-[#2F80ED] dark:text-white`}
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Office Number"
                    value={empOfficeNumber}
                    onChange={(e) => setEmpOfficeNumber(e.target.value)}
                    className="flex-1 rounded border border-[#CED4DA] bg-white px-3 py-2 text-xs text-[#333] placeholder-[#888] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Extension"
                    value={empExtension}
                    onChange={(e) => setEmpExtension(e.target.value)}
                    className="w-24 rounded border border-[#CED4DA] bg-white px-3 py-2 text-xs text-[#333] placeholder-[#888] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                  />
                </div>
              </div>

              {/* Row 3: Email ID | Mobile Number */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="email"
                    placeholder="Email ID"
                    value={empEmailId}
                    onChange={(e) => setEmpEmailId(e.target.value)}
                    className="w-full rounded border border-[#CED4DA] bg-white px-3 py-2 text-xs text-[#333] placeholder-[#888] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Mobile Number"
                    value={empMobileNumber}
                    onChange={(e) => setEmpMobileNumber(e.target.value)}
                    className="w-full rounded border border-[#CED4DA] bg-white px-3 py-2 text-xs text-[#333] placeholder-[#888] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                  />
                </div>
              </div>

              {/* Row 4: Select Status Dropdown (Active / Inactive) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <select
                    value={empTypeSelect}
                    onChange={(e) => setEmpTypeSelect(e.target.value)}
                    className="w-full rounded border border-[#CED4DA] bg-white px-3 py-2 text-xs text-[#333] outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white cursor-pointer"
                  >
                    <option value="Select Status">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div></div>
              </div>
            </div>

            {/* Modal Footer Buttons */}
            <div className="flex justify-end gap-2 border-t border-[#E2E8F0] px-6 py-4 mt-4 dark:border-[#333]">
              <button
                type="button"
                onClick={handleAddEmployer}
                className="rounded bg-[#2F80ED] px-6 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1D6FD8] cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setDialog(null);
                  setVendorSearchOpen(false);
                  setEmpModalError(null);
                }}
                className="rounded border border-[#CED4DA] bg-white px-5 py-1.5 text-xs font-medium text-[#444] hover:bg-gray-50 dark:border-[#444] dark:bg-[#333] dark:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ceipal Vendor Contact Notification Prompt (1:1 Replica from user screenshot) */}
      {dialog === 'confirm-vendor-create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[540px] rounded-xs bg-white px-8 py-10 shadow-2xl dark:bg-[#252525] border border-gray-200 dark:border-[#333] text-center animate-in fade-in zoom-in-95 duration-150">
            <p className="text-lg sm:text-xl font-light text-[#4A5568] dark:text-[#E2E8F0] leading-relaxed">
              Do you want to create a vendor contact from the employer details?
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => finalizeEmployerSave(true)}
                className="min-w-[100px] rounded bg-[#E5484D] px-6 py-2 text-sm font-medium text-white shadow-xs hover:bg-[#D93838] cursor-pointer transition-colors"
              >
                Proceed
              </button>
              <button
                type="button"
                onClick={() => finalizeEmployerSave(false)}
                className="min-w-[100px] rounded border border-[#CED4DA] bg-white px-6 py-2 text-sm font-medium text-[#4A5568] shadow-2xs hover:bg-gray-50 dark:border-[#444] dark:bg-[#333] dark:text-white cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Resume Builder (Replicating Reference Image 2) */}
      {dialog === 'create-resume' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDialog(null)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-[#252525]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 dark:border-[#333]">
              <h3 className="text-sm font-bold text-[#1F2937] dark:text-white">Create Resume Builder</h3>
              <button onClick={() => setDialog(null)} className="text-[#888] hover:text-[#222] dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 py-5 text-xs">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#475569] dark:text-[#AAA]">
                  Choose Resume Template
                </label>
                <select
                  value={resumeTemplate}
                  onChange={(e) => setResumeTemplate(e.target.value)}
                  className="w-full rounded border border-[#CBD5E1] bg-white p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                >
                  <option value="">Select</option>
                  <option value="Standard Corporate Template">Standard Corporate Template</option>
                  <option value="Modern Executive Template">Modern Executive Template</option>
                  <option value="Technical ATS Template">Technical ATS Template</option>
                  <option value="Minimalist One-Page Template">Minimalist One-Page Template</option>
                  <option value="Creative Portfolio Template">Creative Portfolio Template</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 border-t border-[#E2E8F0] pt-4 dark:border-[#333]">
              <button
                type="button"
                onClick={() => {
                  if (!resumeTemplate) {
                    showToast('Please choose a resume template');
                    return;
                  }
                  setDialog(null);
                  setIsResumePanelOpen(true);
                  showToast(`Resume Builder: "${resumeTemplate}" created successfully for ${displayName}`);
                }}
                className="rounded bg-[#2F80ED] px-5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1D6FD8]"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="rounded border border-[#CED4DA] bg-white px-4 py-1.5 text-xs font-semibold text-[#444] hover:bg-gray-50 dark:border-[#444] dark:bg-[#333] dark:text-white"
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
