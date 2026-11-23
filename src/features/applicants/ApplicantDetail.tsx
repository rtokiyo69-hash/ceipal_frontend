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

export const ApplicantDetail: React.FC = () => {
  const { selectedId, navigate, currentUser } = useAppStore();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);
  const [activeSubTab, setActiveSubTab] = useState('Snapshot');
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

  // Dialog states
  const [dialog, setDialog] = useState<
    | 'edit'
    | 'resume'
    | 'matching-jobs'
    | 'task'
    | 'note'
    | 'call-log'
    | 'meeting'
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
  const [newNotePriority, setNewNotePriority] = useState('Medium');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [newTaskType, setNewTaskType] = useState('Follow-up');
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
  const [meetings, setMeetings] = useState<{ title: string; description: string; attendees: string; time: string; by: string }[]>([]);

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
    const noteTextContent = newNoteText.trim() || noteSubject.trim();
    const noteObj = {
      id: `nt-${Date.now()}`,
      author: currentUser?.name || 'Ganesh Kshirsagar',
      text: noteTextContent,
      subject: noteSubject || `New Note Created for ${displayName.toUpperCase()} - ${displayId}.`,
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
      : '—';

    const newEmp = {
      id: `emp-${Date.now()}`,
      employeeName: fullName || empEmployerName || 'Employee',
      employer: empEmployerName || '—',
      officeNumber: officeDisplay,
      mobile: empMobileNumber || '—',
      email: empEmailId || '—',
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

  const notesCount = applicant.notes?.length || 0;
  const applicantSubmissions = submissionRecords.filter((submission) => submission.applicantId === applicant.id || submission.applicantId === applicant.applicantId || submission.applicantName.toLowerCase() === applicant.name.toLowerCase());
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
      description: `Applicant has been submitted to AMP7894 · ${applicant.currentDesignation || 'US IT Recruiter'}`,
      detail: 'by Jatin Jaiswal',
      icon: Send,
      iconClass: 'bg-blue-50 text-[#2F80ED] dark:bg-[#173B67]'
    },
    {
      id: 'activity-resume',
      category: 'documents' as const,
      date: '20 Nov 2026',
      time: '16:49:27',
      description: 'Uploaded a new resume · Mansi Talware.docx',
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
          {[
            'Snapshot',
            'Personal Details',
            'Profession Details',
            'Employer Details',
            'Employment Test Results',
            'Activities'
          ].map((tab) => (
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

          {/* Three-Dot Menu with Hidden Sub-Tabs (Reference Image 1 Replication) */}
          <div className="relative" ref={moreSubTabsRef}>
            <button
              type="button"
              onClick={() => setMoreSubTabsOpen((prev) => !prev)}
              className={`flex items-center gap-1 px-3 py-1.5 font-medium transition-colors ${
                ['Email Merges', 'Email Activity', 'Hires', 'Surveys'].includes(activeSubTab)
                  ? 'border-b-2 border-[#1877F2] font-semibold text-[#1877F2]'
                  : 'text-[#555] hover:text-[#1877F2] dark:text-[#BBB] dark:hover:text-white'
              }`}
            >
              <span>{['Email Merges', 'Email Activity', 'Hires', 'Surveys'].includes(activeSubTab) ? activeSubTab : '...'}</span>
            </button>
            {moreSubTabsOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-md border border-[#CBD5E1] bg-white py-1.5 shadow-2xl dark:border-[#444] dark:bg-[#252525]">
                {/* Triangular Caret Arrow Pointing Up directly under ... */}
                <div className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 border-l border-t border-[#CBD5E1] bg-white dark:border-[#444] dark:bg-[#252525]" />
                <div className="relative z-10">
                  {['Email Merges', 'Email Activity', 'Hires', 'Surveys'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setActiveSubTab(item);
                        setMoreSubTabsOpen(false);
                      }}
                      className={`block w-full px-4 py-2 text-left text-xs transition-colors ${
                        activeSubTab === item
                          ? 'bg-blue-50 font-semibold text-[#1877F2] dark:bg-[#333]'
                          : 'text-[#444] hover:bg-gray-100 hover:text-[#1877F2] dark:text-[#CCC] dark:hover:bg-[#333]'
                      }`}
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
            onClick={() => window.location.href = `mailto:${applicant.email}`}
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
                    setDialog('matching-jobs');
                  }}
                  className="block w-full px-3 py-1.5 text-left text-xs text-[#333] hover:bg-gray-100 dark:text-white dark:hover:bg-[#333]"
                >
                  Submit to Job
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitMenuOpen(false);
                    showToast('Submission to Client initiated.');
                  }}
                  className="block w-full px-3 py-1.5 text-left text-xs text-[#333] hover:bg-gray-100 dark:text-white dark:hover:bg-[#333]"
                >
                  Submit to Client
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
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E2C8E4] text-lg font-bold text-[#6B21A8] dark:bg-[#4A2B4E] dark:text-[#E9D5FF]">
                  {avatarInitial}
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
                                <span className="block truncate text-xs font-medium text-[#334155] dark:text-white">{candidate.applicantId} Â· {candidate.name}</span>
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
                    <a
                      href={`mailto:${applicant.email}`}
                      className="flex items-center gap-1 text-[#2F80ED] hover:underline"
                    >
                      <Mail className="h-3 w-3" />
                      {applicant.email || 'sivakrishnanckmilsamy@gmail.com'}
                    </a>
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
                            'Send Email',
                            'Print Dossier'
                          ].map((item) => (
                            <button
                              key={item}
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setActionMenuOpen(false);
                                if (item === 'Timeline Activities') setActiveSubTab('Activities');
                                else if (item === 'Create Task') setDialog('task');
                                else if (item === 'Add Note') setDialog('note');
                                else if (item === 'Matching Jobs') navigate('matching-jobs', applicant.id);
                                else if (item === 'Send Email') window.location.href = `mailto:${applicant.email}`;
                                else if (item === 'Print Dossier') window.print();
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
                  Applicants ({notesCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNotesFilter('submissions')}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                    activeNotesFilter === 'submissions' ? 'bg-[#2F80ED] text-white' : 'border border-[#CBD5E1] text-[#666]'
                  }`}
                >
                  Submissions ({submissionCounts.all})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNotesFilter('pipeline')}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                    activeNotesFilter === 'pipeline' ? 'bg-[#2F80ED] text-white' : 'border border-[#CBD5E1] text-[#666]'
                  }`}
                >
                  Pipeline ({submissionCounts.pipeline})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="Filter Notes"
                  className="rounded p-1 text-[#666] hover:bg-gray-100 dark:hover:bg-[#333]"
                >
                  <Filter className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNoteSubject(`New Note Created for ${displayName.toUpperCase()} - ${displayId}.`);
                    setDialog('note');
                  }}
                  className="rounded bg-[#2F80ED] px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-[#1D6FD8] transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>

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
                  {applicant.notes && applicant.notes.length > 0 ? (
                    applicant.notes.map((n) => (
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
                        No data available
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
                    <span className="block text-[10px] text-[#64748B] dark:text-[#9CA3AF]">Comments {doc.comments || doc.description || 'N/A'}{doc.size ? ` Â· ${doc.size}` : ''}</span>
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
                  <th className="px-4 py-2">Job Details</th><th className="px-4 py-2">Submission Details</th><th className="px-4 py-2">Submitted By</th><th className="px-4 py-2">Client Bill Rate</th><th className="px-4 py-2">Pay Rate</th><th className="px-4 py-2 text-right">Approval</th>
                </tr></thead>
                <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#333]">
                  {filteredApplicantSubmissions.length === 0 ? <tr><td colSpan={6} className="px-4 py-6 text-center text-xs text-[#888]">No data available</td></tr> : filteredApplicantSubmissions.map((submission) => {
                    const currentStage = getSubmissionStageIndex(submission.status);
                    const steps = ['Pipeline', 'Submission', 'Client Submission', 'Interview', 'Confirmation', 'Placement', 'Not Joined'];
                    const history = submission.statusHistory || [{ status: submission.status, changedAt: submission.submittedDate }];
                    return <React.Fragment key={submission.id}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-[#202020]">
                        <td className="px-4 py-3"><div className="flex items-center gap-1.5"><button type="button" onClick={() => navigate('job-detail', submission.jobId)} className="flex items-center gap-1.5 text-left font-semibold text-[#18558A] hover:underline dark:text-[#90CDF4]">{submission.jobTitle}<Briefcase className="h-3 w-3 shrink-0 text-[#2F80ED]" /></button><button type="button" title="Job Details Quick View" aria-label={`Quick view ${submission.jobTitle}`} onClick={() => void openSubmissionJobQuickView(submission)} className="rounded p-0.5 text-[#2F80ED] hover:bg-blue-50 dark:hover:bg-[#333]"><Eye className="h-3.5 w-3.5" /></button></div><span className="text-[11px] text-[#666] dark:text-[#AAA]">{submission.client || '—'}</span></td>
                        <td className="px-4 py-3"><span className="block font-medium text-[#18558A] dark:text-[#90CDF4]">Submission #{submission.submissionId}</span><span className="mt-1 block max-w-[300px] text-xs font-semibold text-emerald-700 dark:text-emerald-400">{submission.status}</span></td>
                        <td className="px-4 py-3 text-[#555] dark:text-[#AAA]"><span className="block font-medium text-[#222] dark:text-white">{submission.recruiter || '—'}</span><span className="text-[10px] text-[#888]">{submission.submittedDate}</span></td>
                        <td className="px-4 py-3 font-mono text-[#555] dark:text-[#AAA]">{submission.billRate ? submission.billRate.toLocaleString() : 'N/A'}</td><td className="px-4 py-3 font-mono text-[#555] dark:text-[#AAA]">{submission.payRate ? submission.payRate.toLocaleString() : 'N/A'}</td><td className="px-4 py-3 text-right text-xs text-[#718096]">{submission.approvalStatus}</td>
                      </tr>
                      <tr><td colSpan={6} className="border-t border-[#E2E8F0] px-4 py-4 dark:border-[#333]"><div className="flex items-start">{steps.map((step, index) => {
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
                  {quickViewTab === 'notes' && (quickViewJob.notes?.length ? <div className="space-y-3">{quickViewJob.notes.map((note) => <article key={note.id} className="border-b border-[#E2E8F0] pb-3 dark:border-[#444]"><p className="font-semibold text-[#334155] dark:text-white">{note.author} <span className="font-normal text-[#64748B]">· {note.date}</span></p><p className="mt-1 whitespace-pre-wrap text-[#475569] dark:text-[#CCC]">{note.text}</p></article>)}</div> : <p className="py-8 text-center text-[#64748B]">No job notes available.</p>)}
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
                  <tr>
                    <td colSpan={8} className="px-4 py-5 text-center text-xs text-[#888]">
                      No data available
                    </td>
                  </tr>
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
                  <tr>
                    <td colSpan={6} className="px-4 py-5 text-center text-xs text-[#888]">
                      No data available
                    </td>
                  </tr>
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
                  <tr>
                    <td colSpan={7} className="px-4 py-5 text-center text-xs text-[#888]">
                      No data available
                    </td>
                  </tr>
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
                      <a href={`mailto:${applicant.email}`} className="hover:underline">
                        {applicant.email || 'sivakrishnanduraisamy@gmail.com'}
                      </a>
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
                            Less â–´
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
                            More â–¾
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
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-[#AAA]">A complete record of this applicant’s interactions and updates.</p>
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
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 dark:border-[#333]">
                <h3 className="text-xs font-bold text-[#1F2937] dark:text-white">Email Activity Log</h3>
                <button
                  type="button"
                  onClick={() => showToast('Opening Email Composer')}
                  className="flex items-center gap-1 rounded bg-[#2F80ED] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#1D6FD8]"
                >
                  <Send className="h-3 w-3" />
                  <span>Compose Email</span>
                </button>
              </div>
              <div className="divide-y divide-[#F1F5F9] dark:divide-[#333]">
                <div className="flex items-start justify-between py-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-blue-50 p-2 text-[#1877F2] dark:bg-[#1E293B]">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1F2937] dark:text-white">Interview Schedule - E-commerce Production Support</h4>
                      <p className="text-xs text-[#555] dark:text-[#CCC]">From: ganesh.godse@ampcustech.com â†’ To: {applicant.email}</p>
                      <p className="text-[11px] text-[#888]">Sent on 20/11/2026 at 14:25 PM</p>
                    </div>
                  </div>
                  <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-[#1877F2] dark:bg-blue-950/40 dark:text-blue-300">
                    Sent
                  </span>
                </div>
              </div>
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
                      <td className="px-4 py-3 text-[#F2B705] font-bold">5 / 5 â˜…</td>
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
                  {applicant.city || applicant.location || 'Nashik, Maharashtra, India'} Â· {applicant.email || 'applicant@email.com'} Â· {applicant.phone || '+91-9876543210'}
                </p>
                <div className="flex justify-center items-center gap-3 text-xs text-[#1877F2] pt-1">
                  <a href={applicant.portfolioUrl || '#'} className="hover:underline">Portfolio</a>
                  <span>Â·</span>
                  <a href={applicant.githubUrl || '#'} className="hover:underline">GitHub</a>
                  <span>Â·</span>
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
                <h2 className="text-sm font-bold text-[#1F2937] dark:text-white">Resume Document — {applicant.name}</h2>
                <p className="text-[11px] text-[#888]">{applicant.currentDesignation} · {applicant.location}</p>
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
                <p className="text-[#555] dark:text-[#BBB]">{applicant.skills.join(' Â· ')}</p>
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
          <div className="w-full max-w-2xl rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-2xl dark:border-[#444] dark:bg-[#1E293B]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 dark:border-[#333]">
              <h3 className="text-sm font-bold text-[#1F2937] dark:text-white">Add Note</h3>
              <button onClick={() => setDialog(null)} className="text-[#888] hover:text-[#222] dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 py-4 text-xs">
              {/* Row 1: Applicant Name & Search for a Job */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <input
                    type="text"
                    readOnly
                    value={displayName.toUpperCase()}
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
                  value={noteSubject || `New Note Created for ${displayName.toUpperCase()} - ${displayId}.`}
                  onChange={(e) => setNoteSubject(e.target.value)}
                  placeholder={`New Note Created for ${displayName.toUpperCase()} - ${displayId}.`}
                  className="w-full rounded border border-[#CBD5E1] bg-white p-2 text-xs font-medium outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                />
              </div>

              {/* Row 6: Rich Text Editor with Exact Toolbar (Reference Image 1) */}
              <div className="rounded border border-[#CBD5E1] dark:border-[#444]">
                {/* Top Toolbar Row */}
                <div className="flex flex-wrap items-center gap-1 border-b border-[#CBD5E1] bg-[#F8FAFC] p-1.5 text-xs text-[#555] dark:border-[#444] dark:bg-[#202020] dark:text-[#AAA]">
                  <button type="button" title="Cut" className="rounded p-1 hover:bg-gray-200 dark:hover:bg-[#333]">âœ‚</button>
                  <button type="button" title="Copy" className="rounded p-1 hover:bg-gray-200 dark:hover:bg-[#333]">ðŸ“‹</button>
                  <button type="button" title="Paste" className="rounded p-1 hover:bg-gray-200 dark:hover:bg-[#333]">ðŸ“„</button>
                  <button type="button" title="Undo" className="rounded p-1 hover:bg-gray-200 dark:hover:bg-[#333]">â†©</button>
                  <button type="button" title="Redo" className="rounded p-1 hover:bg-gray-200 dark:hover:bg-[#333]">â†ª</button>
                  <span className="text-gray-300">|</span>
                  <button type="button" title="Bold" className="rounded px-1.5 py-0.5 font-bold hover:bg-gray-200 dark:hover:bg-[#333]">B</button>
                  <button type="button" title="Italic" className="rounded px-1.5 py-0.5 italic hover:bg-gray-200 dark:hover:bg-[#333]">I</button>
                  <button type="button" title="Underline" className="rounded px-1.5 py-0.5 underline hover:bg-gray-200 dark:hover:bg-[#333]">U</button>
                  <button type="button" title="Strikethrough" className="rounded px-1.5 py-0.5 line-through hover:bg-gray-200 dark:hover:bg-[#333]">S</button>
                  <button type="button" title="Subscript" className="rounded px-1 text-[10px] hover:bg-gray-200 dark:hover:bg-[#333]">xâ‚‚</button>
                  <button type="button" title="Superscript" className="rounded px-1 text-[10px] hover:bg-gray-200 dark:hover:bg-[#333]">xÂ²</button>
                  <span className="text-gray-300">|</span>
                  <button type="button" title="Bulleted list" className="rounded px-1 text-[11px] hover:bg-gray-200 dark:hover:bg-[#333]">â‰¡</button>
                  <button type="button" title="Numbered list" className="rounded px-1 text-[11px] hover:bg-gray-200 dark:hover:bg-[#333]">1.</button>
                  <span className="text-gray-300">|</span>
                  <button type="button" title="Special character" className="rounded px-1 text-[11px] hover:bg-gray-200 dark:hover:bg-[#333]">Î©</button>
                  <button type="button" title="Link" className="rounded px-1 text-[11px] hover:bg-gray-200 dark:hover:bg-[#333]">ðŸ”—</button>
                  <button type="button" title="Source code" className="rounded px-1 text-[11px] hover:bg-gray-200 dark:hover:bg-[#333]">&lt;/&gt;</button>
                </div>
                {/* Second Toolbar Row */}
                <div className="flex flex-wrap items-center gap-1.5 border-b border-[#CBD5E1] bg-[#F8FAFC] px-1.5 py-1 text-[11px] text-[#555] dark:border-[#444] dark:bg-[#202020] dark:text-[#AAA]">
                  <button type="button" title="Table" className="rounded p-0.5 hover:bg-gray-200 dark:hover:bg-[#333]">â–¦</button>
                  <button type="button" title="Align Left" className="rounded p-0.5 hover:bg-gray-200 dark:hover:bg-[#333]">â‡ </button>
                  <button type="button" title="Align Center" className="rounded p-0.5 hover:bg-gray-200 dark:hover:bg-[#333]">â†”</button>
                  <button type="button" title="Align Right" className="rounded p-0.5 hover:bg-gray-200 dark:hover:bg-[#333]">â‡¢</button>
                  <span className="text-gray-300">|</span>
                  <span className="font-bold underline text-blue-600">A</span>
                  <span className="bg-yellow-200 px-1 font-semibold text-black">A</span>
                  <span className="text-gray-300">|</span>
                  <select className="bg-transparent text-[10px] outline-none text-[#555] dark:text-[#AAA]">
                    <option>Styles</option>
                  </select>
                  <select className="bg-transparent text-[10px] outline-none text-[#555] dark:text-[#AAA]">
                    <option>Format</option>
                  </select>
                  <select className="bg-transparent text-[10px] outline-none text-[#555] dark:text-[#AAA]">
                    <option>Font</option>
                  </select>
                  <select className="bg-transparent text-[10px] outline-none text-[#555] dark:text-[#AAA]">
                    <option>Size</option>
                  </select>
                </div>
                <textarea
                  rows={6}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Enter note contents..."
                  className="w-full p-3 text-xs outline-none dark:bg-[#252525] dark:text-white"
                />
              </div>

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

            <div className="flex justify-end gap-2.5 border-t border-[#E2E8F0] pt-4 dark:border-[#333]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDialog(null)}>
          <div className="w-full max-w-md rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-2xl dark:border-[#444] dark:bg-[#1E293B]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 dark:border-[#333]">
              <h2 className="text-sm font-bold text-[#1F2937] dark:text-white">Create Recruiter Task</h2>
              <button onClick={() => setDialog(null)} className="text-[#888] hover:text-[#222]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 py-4 text-xs">
              <label className="block space-y-1">
                <span className="text-[#666] dark:text-[#AAA]">Task Title</span>
                <input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Schedule technical interview"
                  className="w-full rounded border border-[#CED4DA] p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[#666] dark:text-[#AAA]">Task Type</span>
                <select
                  value={newTaskType}
                  onChange={(e) => setNewTaskType(e.target.value)}
                  className="w-full rounded border border-[#CED4DA] p-2 text-xs outline-none dark:border-[#444] dark:bg-[#333] dark:text-white"
                >
                  <option>Follow-up</option>
                  <option>Screening Call</option>
                  <option>Document Collection</option>
                  <option>Client Submission</option>
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-[#666] dark:text-[#AAA]">Due Date</span>
                <input
                  type="date"
                  value={newTaskDue}
                  onChange={(e) => setNewTaskDue(e.target.value)}
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
                onClick={() => {
                  setDialog(null);
                  showToast('Task added to applicant workspace.');
                }}
                className="rounded bg-[#2F80ED] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1D6FD8]"
              >
                Create Task
              </button>
            </div>
          </div>
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
                  <p className="mt-1 text-xs text-slate-500 dark:text-[#AAA]">Capture a role that shows the applicant’s professional journey.</p>
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
                          placeholder="e.g. October 2021 – Present"
                          value={newExpPeriod}
                          onChange={(e) => setNewExpPeriod(e.target.value)}
                          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2F80ED] focus:ring-4 focus:ring-blue-100 dark:border-[#4A4A4A] dark:bg-[#303030] dark:text-white dark:placeholder:text-[#888] dark:focus:ring-[#1E3A5F]"
                        />
                        <span className="block text-[11px] text-slate-400 dark:text-[#999]">Use “Present” for a current role.</span>
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
