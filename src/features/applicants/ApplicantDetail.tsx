import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  GraduationCap,
  Bookmark,
  Award,
  Languages,
  Building,
  MapPin,
  Mail,
  Phone,
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
  ThumbsUp,
  Search,
  Check,
  CircleHelp,
  Building2,
  Clock,
  Calendar,
  Send,
  FileText
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { Applicant, PipelineStage } from '../../types';

export const ApplicantDetail: React.FC = () => {
  const { selectedId, navigate, currentUser } = useAppStore();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);
  const [activeSubTab, setActiveSubTab] = useState('Snapshot');
  const [skillsExpandedPersonal, setSkillsExpandedPersonal] = useState(false);

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
  const [activeSubmissionsFilter, setActiveSubmissionsFilter] = useState<'all' | 'client' | 'interview' | 'confirmation' | 'placement' | 'not-joined'>('all');
  const [headerViewMode, setHeaderViewMode] = useState<'applicant' | 'submission'>('applicant');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
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

  // Call logs and meetings
  const [callLogs, setCallLogs] = useState<{ type: string; comments: string; followUp: string; date: string; by: string }[]>([]);
  const [meetings, setMeetings] = useState<{ title: string; description: string; attendees: string; time: string; by: string }[]>([]);

  useEffect(() => {
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

  if (!applicant) {
    return (
      <div className="flex h-96 items-center justify-center p-8 text-xs text-[#806B66]">
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

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const noteObj = {
      id: `nt-${Date.now()}`,
      author: currentUser?.name || 'Ganesh Kshirsagar',
      text: newNoteText.trim(),
      date: new Date().toLocaleString()
    };
    const updatedNotes = [noteObj, ...(applicant.notes || [])];
    const updated = { ...applicant, notes: updatedNotes };
    setApplicant(updated);
    ApiService.updateApplicant(applicant.id, { notes: updatedNotes });
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
  const skillsList = applicant.skills && applicant.skills.length > 0
    ? applicant.skills
    : ['.NET FRAMEWORK', 'E-Commerce', 'Datadog', 'Root Cause Analysis', 'Salesforce Commerce Cloud'];

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
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between border-b border-[#E2E8F0] bg-white px-4 py-2 shadow-xs dark:border-[#333] dark:bg-[#252525]">
        <div className="flex flex-wrap items-center gap-1 overflow-x-auto text-xs">
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
            'Activities',
            '...'
          ].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveSubTab(tab)}
              className={`px-3 py-1.5 font-medium transition-colors ${
                activeSubTab === tab
                  ? 'border-b-2 border-[#1877F2] font-semibold text-[#1877F2]'
                  : 'text-[#555] hover:text-[#1877F2] dark:text-[#BBB] dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
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
          <div className="relative">
            <button
              type="button"
              onClick={() => setSubmitMenuOpen((prev) => !prev)}
              className="flex items-center gap-1 rounded border border-[#CED4DA] bg-white px-2.5 py-1 text-xs font-semibold text-[#333] hover:bg-gray-50 dark:border-[#444] dark:bg-[#333] dark:text-white"
            >
              <span>Submit</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {submitMenuOpen && (
              <div className="absolute right-0 top-full z-40 mt-1 w-44 rounded-md border border-[#CED4DA] bg-white py-1 shadow-xl dark:border-[#444] dark:bg-[#252525]">
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
      <div className={`p-3 transition-all ${sidebarCollapsed ? 'pr-4' : 'lg:pr-[318px]'}`}>
        <div className="space-y-3.5">
          {/* 1. Candidate Header Card */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#252525]">
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
                    <button
                      type="button"
                      onClick={() => setDialog('resume')}
                      className="text-[#666] hover:text-[#1877F2]"
                      title="Preview Dossier"
                    >
                      <Search className="h-3.5 w-3.5" />
                    </button>
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
                      onClick={() => setDialog('edit')}
                      className="rounded border border-[#2F80ED] bg-white px-2.5 py-1 text-xs font-medium text-[#2F80ED] hover:bg-blue-50 dark:bg-transparent dark:hover:bg-[#333]"
                    >
                      Edit Applicant
                    </button>
                    <button
                      type="button"
                      onClick={() => setDialog('resume')}
                      className="rounded border border-[#2F80ED] bg-white px-2.5 py-1 text-xs font-medium text-[#2F80ED] hover:bg-blue-50 dark:bg-transparent dark:hover:bg-[#333]"
                    >
                      View Resume
                    </button>
                    <button
                      type="button"
                      onClick={() => setDialog('matching-jobs')}
                      className="rounded border border-[#7C3AED] bg-[#F5F3FF] px-2.5 py-1 text-xs font-semibold text-[#7C3AED] hover:bg-[#EDE9FE] dark:bg-[#311B47] dark:text-[#C4B5FD]"
                    >
                      Matching Jobs
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast('Resume Builder initiated for candidate.')}
                      className="rounded border border-[#2F80ED] bg-white px-2.5 py-1 text-xs font-medium text-[#2F80ED] hover:bg-blue-50 dark:bg-transparent dark:hover:bg-[#333]"
                    >
                      Create Resume Builder
                    </button>

                    {/* More dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActionMenuOpen((prev) => !prev)}
                        className="flex items-center gap-1 rounded border border-[#CED4DA] bg-white px-2.5 py-1 text-xs font-medium text-[#444] hover:bg-gray-50 dark:border-[#444] dark:bg-[#333] dark:text-white"
                      >
                        <span>More</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      {actionMenuOpen && (
                        <div className="absolute left-0 top-full z-40 mt-1 max-h-64 w-52 overflow-y-auto rounded-md border border-[#CED4DA] bg-white py-1 shadow-xl dark:border-[#444] dark:bg-[#252525]">
                          {[
                            'Bench Marketing Jobs',
                            'Create Task',
                            'Add Note',
                            'Send Email',
                            'Request Resume',
                            'Upload Document',
                            'Block Contact On TextToHire',
                            'Print Dossier'
                          ].map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                setActionMenuOpen(false);
                                if (item === 'Create Task') setDialog('task');
                                else if (item === 'Add Note') setDialog('note');
                                else if (item === 'Matching Jobs') setDialog('matching-jobs');
                                else if (item === 'Send Email') window.location.href = `mailto:${applicant.email}`;
                                else if (item === 'Print Dossier') window.print();
                                else showToast(`${item} recorded.`);
                              }}
                              className="block w-full px-3 py-1.5 text-left text-xs text-[#333] hover:bg-gray-100 dark:text-white dark:hover:bg-[#333]"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add Tag */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
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
                          ×
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
          <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs dark:border-[#333] dark:bg-[#252525]">
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
                  Submissions (0)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNotesFilter('pipeline')}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                    activeNotesFilter === 'pipeline' ? 'bg-[#2F80ED] text-white' : 'border border-[#CBD5E1] text-[#666]'
                  }`}
                >
                  Pipeline (0)
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
                  onClick={() => setDialog('note')}
                  className="rounded bg-[#2F80ED] px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-[#1D6FD8]"
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
                        <td className="px-4 py-2.5 text-[#333] dark:text-[#DDD]">{n.text}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right font-medium text-[#2F80ED]">Normal</td>
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
          <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs dark:border-[#333] dark:bg-[#252525]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-2.5 dark:border-[#333]">
              <span className="text-xs font-bold text-[#1F2937] dark:text-white">Documents</span>
              <div className="flex items-center gap-2.5 text-[#666] dark:text-[#AAA]">
                <button type="button" title="Like" className="hover:text-[#2F80ED]">
                  <ThumbsUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" title="Share" className="hover:text-[#2F80ED]">
                  <Share2 className="h-3.5 w-3.5" />
                </button>
                <button type="button" title="Download" className="hover:text-[#2F80ED]">
                  <Download className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Upload Document"
                  onClick={() => showToast('Upload document modal')}
                  className="hover:text-[#2F80ED]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between rounded-lg border border-[#E2E8F0] p-3 hover:bg-gray-50 dark:border-[#333] dark:hover:bg-[#202020]">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#2B579A] text-sm font-bold text-white shadow-xs">
                    W
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-medium text-[#1F2937] dark:text-white">
                      <span>Resume - {applicant.name.replace(/\s+/g, '_')}_Resume-v5.docx</span>
                      <Check className="h-3.5 w-3.5 rounded-full bg-emerald-500 p-0.5 text-white" />
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                      Created By {applicant.createdBy || 'Ganesh Kshirsagar'} on {applicant.createdDate || '19/11/2026 18:39:40'} | Modified By {applicant.createdBy || 'Ganesh Kshirsagar'}
                    </p>
                    <p className="text-[10px] text-[#9CA3AF]">Comments N/A</p>
                  </div>
                </div>

                <button type="button" title="Options" className="text-[#888] hover:text-[#222]">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 4. Submissions Section */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs dark:border-[#333] dark:bg-[#252525]">
            <div className="flex flex-wrap items-center justify-between border-b border-[#E2E8F0] px-4 py-2.5 dark:border-[#333]">
              <span className="text-xs font-bold text-[#1F2937] dark:text-white">Submissions</span>
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                {[
                  { label: 'Pipeline (0)', key: 'pipeline' },
                  { label: 'All (1)', key: 'all' },
                  { label: 'Client Submissions (1)', key: 'client' },
                  { label: 'Interviews (0)', key: 'interview' },
                  { label: 'Confirmations (0)', key: 'confirmation' },
                  { label: 'Placements (0)', key: 'placement' },
                  { label: 'Not Joined (0)', key: 'not-joined' }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveSubmissionsFilter(item.key as any)}
                    className={`rounded-full px-2.5 py-0.5 font-semibold transition-colors ${
                      activeSubmissionsFilter === item.key
                        ? 'bg-[#2F80ED] text-white'
                        : 'border border-[#CBD5E1] text-[#666] hover:bg-gray-50 dark:hover:bg-[#333]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-semibold uppercase tracking-wider text-[#64748B] dark:border-[#333] dark:bg-[#202020]">
                    <th className="px-4 py-2">Job Details</th>
                    <th className="px-4 py-2">Submission Details</th>
                    <th className="px-4 py-2">Submitted By</th>
                    <th className="px-4 py-2">Client Bill Rate</th>
                    <th className="px-4 py-2">Pay Rate</th>
                    <th className="px-4 py-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#333]">
                  <tr className="hover:bg-gray-50 dark:hover:bg-[#202020]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#18558A] hover:underline dark:text-[#90CDF4]">
                          {applicant.assignedJobTitle || 'AMP12294,E-commerce production..'}
                        </span>
                        <Briefcase className="h-3 w-3 text-[#2F80ED]" />
                      </div>
                      <span className="text-[11px] text-[#666] dark:text-[#AAA]">Dentsu</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block text-[#18558A] hover:underline">Submission record</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Submitted To Client</span>
                    </td>
                    <td className="px-4 py-3 text-[#555] dark:text-[#AAA]">
                      <span className="block font-medium text-[#222] dark:text-white">{applicant.createdBy || 'Ganesh Kshirsagar'}</span>
                      <span className="text-[10px] text-[#888]">19/11/2026</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[#555] dark:text-[#AAA]">N/A</td>
                    <td className="px-4 py-3 font-mono text-[#555] dark:text-[#AAA]">N/A</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="text-[#888] hover:text-[#222]">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Stepper Pipeline Bar */}
            <div className="border-t border-[#E2E8F0] px-4 py-4 dark:border-[#333]">
              <div className="flex items-center justify-between text-[11px]">
                {[
                  { name: 'Pipeline', status: 'completed' },
                  { name: 'Submission', time: '19/11/2026 18:39:40', status: 'completed' },
                  { name: 'Client Submission', time: '19/11/2026 18:41:14', status: 'active' },
                  { name: 'Interview', status: 'upcoming' },
                  { name: 'Confirmation', status: 'upcoming' },
                  { name: 'Placement', status: 'upcoming' },
                  { name: 'Not Joined', status: 'upcoming' }
                ].map((step, idx) => (
                  <div key={step.name} className="flex flex-1 flex-col items-center text-center">
                    <div className="relative flex w-full items-center">
                      {idx > 0 && (
                        <div
                          className={`h-0.5 flex-1 ${
                            step.status === 'upcoming' ? 'bg-gray-300 dark:bg-gray-700' : 'bg-emerald-500'
                          }`}
                        />
                      )}
                      <div
                        className={`mx-auto flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold text-white ${
                          step.status === 'active'
                            ? 'bg-emerald-500 ring-2 ring-emerald-200'
                            : step.status === 'completed'
                            ? 'bg-emerald-500'
                            : 'border border-gray-400 bg-white dark:bg-[#333]'
                        }`}
                      >
                        {step.status === 'active' ? '✓' : ''}
                      </div>
                      {idx < 6 && (
                        <div
                          className={`h-0.5 flex-1 ${
                            idx >= 2 ? 'bg-gray-300 dark:bg-gray-700' : 'bg-emerald-500'
                          }`}
                        />
                      )}
                    </div>
                    <span className="mt-1 font-medium text-[#333] dark:text-[#DDD]">{step.name}</span>
                    {step.time && <span className="text-[9px] text-[#888]">{step.time}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. eInterviews Section */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs dark:border-[#333] dark:bg-[#252525]">
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
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#252525]">
            <span className="text-xs font-bold text-[#1F2937] dark:text-white">eForms</span>
            <p className="mt-2 text-center text-xs text-[#888]">No data available</p>
          </div>

          {/* 7. Submissions eForms Section */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#252525]">
            <span className="text-xs font-bold text-[#1F2937] dark:text-white">Submissions eForms</span>
            <p className="mt-2 text-center text-xs text-[#888]">No data available</p>
          </div>

          {/* 8. Task Manager Section */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs dark:border-[#333] dark:bg-[#252525]">
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
          <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs dark:border-[#333] dark:bg-[#252525]">
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
          <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs dark:border-[#333] dark:bg-[#252525]">
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

          {/* PERSONAL DETAILS TAB (Image 1 Replication) */}
          {activeSubTab === 'Personal Details' && (
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs dark:border-[#333] dark:bg-[#252525]">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 dark:border-[#333]">
                <h2 className="text-sm font-bold text-[#1F2937] dark:text-white">Personal Details</h2>
                <button
                  type="button"
                  onClick={() => setDialog('edit')}
                  className="text-[#1877F2] hover:opacity-80"
                  title="Edit Personal Details"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>

              {/* 3-Column Key-Value Grid matching Image 1 */}
              <div className="grid grid-cols-1 gap-x-8 gap-y-4 pt-4 md:grid-cols-3">
                {/* Row 1 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">First Name as per Aadhaar</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.firstName || applicant.name?.split(' ')[0] || 'SIVAKRISHNAN'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Middle Name as per Aadhaar</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.middleName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Last Name as per Aadhaar</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.lastName || applicant.name?.split(' ').slice(1).join(' ') || 'D'}
                  </p>
                </div>

                {/* Row 2 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Legal name</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.legalName || 'N/A'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                    <span>Maiden name</span>
                    <CircleHelp className="h-3 w-3 text-[#1877F2]" />
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.maidenName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Email Address</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1877F2]">
                    <a href={`mailto:${applicant.email}`} className="hover:underline">
                      {applicant.email || 'sivakrishnanduraisamy@gmail.com'}
                    </a>
                  </p>
                </div>

                {/* Row 3 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Home Phone Number</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.homePhone || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Mobile Number</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1877F2]">
                    <a href={`tel:${applicant.phone}`} className="hover:underline">
                      {applicant.phone || '+91 7667560620'}
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Alternate Email Address</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.alternateEmail || 'N/A'}
                  </p>
                </div>

                {/* Row 4 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Other Phone</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.otherPhone || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Date Of Birth</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.dateOfBirth || applicant.dob || '17/02/1993'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Work Phone Number</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.workPhone || 'N/A'}
                  </p>
                </div>

                {/* Row 5 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Facebook Profile URL</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.facebookUrl || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Twitter Profile URL</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.twitterUrl || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">LinkedIn Profile URL</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.linkedinUrl || 'N/A'}
                  </p>
                </div>

                {/* Row 6 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Work Authorization</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.workAuthorization || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Address</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.address || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Video Reference</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.videoReference || 'N/A'}
                  </p>
                </div>

                {/* Row 7 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">State</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.state || 'Tamil Nadu'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">City</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.city || applicant.location?.split(',')[0]?.trim() || 'Coimbatore'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Country</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.country || 'India'}
                  </p>
                </div>

                {/* Row 8 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Source</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.source || 'Naukri'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Experience</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.experienceYears ? `${applicant.experienceYears} Years 2 Months` : '9 Years 2 Months'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Zip Code</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.zipCode || 'N/A'}
                  </p>
                </div>

                {/* Row 9 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Referred By</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.referredBy || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Applicant Status</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.status || 'New lead (Allowed to submit)'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                    <span>Relevant experience</span>
                    <CircleHelp className="h-3 w-3 text-[#1877F2]" />
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.relevantExperience ? `${applicant.relevantExperience} Years` : 'N/A'}
                  </p>
                </div>

                {/* Row 10 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Ownership</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.assignedRecruiter || applicant.ownership || 'Ganesh Kshirsagar'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Current Title/Designation</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.currentDesignation || 'technical support engineer (L2)'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Applicant Group</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.applicantGroup || 'N/A'}
                  </p>
                </div>

                {/* Row 11 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Current CTC</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.currentCTC || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Expected CTC</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.expectedCTC || applicant.expectedSalary || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Current Company</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.currentCompany || 'Infosys PVT LTD'}
                  </p>
                </div>

                {/* Row 12 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Pan Card Number</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.panCard || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Aadhar number</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.aadharNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Notice Period</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.noticePeriod || 'N/A'}
                  </p>
                </div>

                {/* Row 13 */}
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                    <span>Marital status</span>
                    <CircleHelp className="h-3 w-3 text-[#1877F2]" />
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.maritalStatus || 'N/A'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                    <span>Preferred Shift</span>
                    <CircleHelp className="h-3 w-3 text-[#1877F2]" />
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.preferredShift || 'N/A'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                    <span>Passport number</span>
                    <CircleHelp className="h-3 w-3 text-[#1877F2]" />
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.passportNumber || 'N/A'}
                  </p>
                </div>

                {/* Row 14 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Skills</p>
                  <div className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {skillsExpandedPersonal ? (
                      <div>
                        <span>{skillsList.join(', ')}</span>
                        <button
                          type="button"
                          onClick={() => setSkillsExpandedPersonal(false)}
                          className="ml-1 text-[11px] font-normal text-[#1877F2] hover:underline"
                        >
                          Less ▴
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
                          More ▾
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Primary Skills</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.primarySkills?.join(', ') || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Relocation</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.willingToRelocate !== false ? 'Yes' : 'No'}
                  </p>
                </div>

                {/* Row 15 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Technology</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.technology || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Industry</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.industry || 'N/A'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                    <span>Nationality</span>
                    <CircleHelp className="h-3 w-3 text-[#1877F2]" />
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.nationality || 'N/A'}
                  </p>
                </div>

                {/* Row 16 */}
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Reference ID</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.referenceId || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Applicant Remarks</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.applicantRemarks || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Notice/Eligibility</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {applicant.noticeEligibility || 'N/A'}
                  </p>
                </div>
              </div>

              {/* EEO Details */}
              <div className="mt-8 border-t border-[#F1F5F9] pt-4 dark:border-[#333]">
                <h3 className="text-xs font-bold text-[#1F2937] dark:text-white">EEO Details</h3>
                <div className="grid grid-cols-1 gap-x-8 gap-y-4 pt-3 md:grid-cols-3">
                  <div>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Gender</p>
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">{applicant.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Race/Ethnicity</p>
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">{applicant.raceEthnicity || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Veteran Status</p>
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">{applicant.veteranStatus || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Disability</p>
                    <p className="mt-0.5 text-xs font-semibold text-[#1F2937] dark:text-[#F3F4F6]">{applicant.disability || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* User Defined Fields */}
              <div className="mt-8 border-t border-[#F1F5F9] pt-4 dark:border-[#333]">
                <h3 className="text-xs font-bold text-[#1F2937] dark:text-white">User Defined Fields</h3>
              </div>
            </div>
          )}

          {/* PROFESSION DETAILS TAB (Image 2 Replication) */}
          {activeSubTab === 'Profession Details' && (
            <div className="space-y-4">
              {/* 1. Education Details Card */}
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#252525]">
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
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#252525]">
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
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#252525]">
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
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#252525]">
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
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#252525]">
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
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#252525]">
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
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#333] dark:bg-[#252525]">
              <div className="border-b border-[#F1F5F9] pb-3 dark:border-[#333]">
                <h3 className="text-xs font-bold text-[#1F2937] dark:text-white">Activities</h3>
              </div>
              <div className="space-y-3 py-4">
                <div className="flex items-start gap-3 text-xs">
                  <Clock className="mt-0.5 h-4 w-4 text-[#1877F2]" />
                  <div>
                    <p className="font-semibold text-[#1F2937] dark:text-white">Profile viewed by Ganesh Godse</p>
                    <p className="text-[11px] text-[#888]">19/11/2026 18:39:40</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-xs">
                  <Send className="mt-0.5 h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-semibold text-[#1F2937] dark:text-white">Submission created for AMP12294 (E-commerce Production)</p>
                    <p className="text-[11px] text-[#888]">19/11/2026 18:41:14</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT SIDEBAR (Fixed / Sticky Right Panel matching Ceipal reference) */}
      <aside
        className={`fixed bottom-0 right-0 top-[56px] z-20 flex flex-col border-l border-[#E2E8F0] bg-white transition-all dark:border-[#333] dark:bg-[#252525] ${
          sidebarCollapsed ? 'w-0 overflow-hidden border-none' : 'w-[305px] overflow-y-auto'
        }`}
      >
        <div className="space-y-5 p-4 text-xs">
          {/* Section 1: Applicant Details */}
          <div>
            <h2 className="mb-3 text-xs font-bold text-[#1F2937] dark:text-white">Applicant Details</h2>
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
                  More ▾
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
                <span className="font-medium text-[#222] dark:text-white">{applicant.expectedCTC || applicant.expectedSalary || '—'}</span>
              </div>

              <div>
                <span className="block text-[10px] font-medium text-[#888]">Current CTC</span>
                <span className="font-medium text-[#222] dark:text-white">{applicant.currentCTC || '—'}</span>
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
        <span className="text-[10px] font-bold">{sidebarCollapsed ? '‹' : '›'}</span>
      </button>

      {/* DIALOGS & MODALS */}

      {/* Edit Applicant Modal */}
      {dialog === 'edit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDialog(null)}>
          <div className="w-full max-w-lg rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-2xl dark:border-[#444] dark:bg-[#252525]" onClick={(e) => e.stopPropagation()}>
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
          <div className="w-full max-w-2xl rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-2xl dark:border-[#444] dark:bg-[#252525]" onClick={(e) => e.stopPropagation()}>
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
                <p className="text-[#555] dark:text-[#BBB]">{applicant.skills.join(' · ')}</p>
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

      {/* Add Note Modal */}
      {dialog === 'note' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDialog(null)}>
          <div className="w-full max-w-md rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-2xl dark:border-[#444] dark:bg-[#252525]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 dark:border-[#333]">
              <h2 className="text-sm font-bold text-[#1F2937] dark:text-white">Add Recruiter Note</h2>
              <button onClick={() => setDialog(null)} className="text-[#888] hover:text-[#222]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 py-4 text-xs">
              <label className="block space-y-1">
                <span className="text-[#666] dark:text-[#AAA]">Priority</span>
                <select
                  value={newNotePriority}
                  onChange={(e) => setNewNotePriority(e.target.value)}
                  className="w-full rounded border border-[#CED4DA] p-2 text-xs outline-none dark:border-[#444] dark:bg-[#333] dark:text-white"
                >
                  <option>Normal</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-[#666] dark:text-[#AAA]">Note / Feedback</span>
                <textarea
                  rows={4}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Enter evaluation, screen feedback, or candidate update..."
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
                onClick={handleAddNote}
                className="rounded bg-[#2F80ED] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1D6FD8]"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {dialog === 'task' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDialog(null)}>
          <div className="w-full max-w-md rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-2xl dark:border-[#444] dark:bg-[#252525]" onClick={(e) => e.stopPropagation()}>
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
          <div className="w-full max-w-sm rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-2xl dark:border-[#444] dark:bg-[#252525]" onClick={(e) => e.stopPropagation()}>
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
          <div className="w-full max-w-xl rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-2xl dark:border-[#444] dark:bg-[#252525]" onClick={(e) => e.stopPropagation()}>
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
          <div className="w-full max-w-sm rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-2xl dark:border-[#444] dark:bg-[#252525]" onClick={(e) => e.stopPropagation()}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl dark:bg-[#252525]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 dark:border-[#333]">
              <h3 className="text-sm font-bold text-[#1F2937] dark:text-white">Add Education Details</h3>
              <button onClick={() => setDialog(null)} className="text-[#888] hover:text-[#222]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 py-4 text-xs">
              <label className="block space-y-1">
                <span className="text-[#666] dark:text-[#AAA]">Degree / Program *</span>
                <input
                  placeholder="e.g. Computer Science, B.Tech, M.S."
                  value={newDegree}
                  onChange={(e) => setNewDegree(e.target.value)}
                  className="w-full rounded border border-[#CED4DA] p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[#666] dark:text-[#AAA]">College / Institution *</span>
                <input
                  placeholder="e.g. Nandha College of Technology, Erode"
                  value={newInstitution}
                  onChange={(e) => setNewInstitution(e.target.value)}
                  className="w-full rounded border border-[#CED4DA] p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[#666] dark:text-[#AAA]">Year / Graduation Period</span>
                <input
                  placeholder="e.g. January 2013"
                  value={newEduPeriod}
                  onChange={(e) => setNewEduPeriod(e.target.value)}
                  className="w-full rounded border border-[#CED4DA] p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#E2E8F0] pt-3 dark:border-[#333]">
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="rounded border border-[#CED4DA] px-3 py-1.5 text-xs text-[#444] hover:bg-gray-50 dark:border-[#444] dark:bg-[#333] dark:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddEducation}
                className="rounded bg-[#2F80ED] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1D6FD8]"
              >
                Save Education
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Work Experience */}
      {dialog === 'add-work-exp' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl dark:bg-[#252525]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 dark:border-[#333]">
              <h3 className="text-sm font-bold text-[#1F2937] dark:text-white">Add Work Experience</h3>
              <button onClick={() => setDialog(null)} className="text-[#888] hover:text-[#222]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 py-4 text-xs">
              <label className="block space-y-1">
                <span className="text-[#666] dark:text-[#AAA]">Company Name *</span>
                <input
                  placeholder="e.g. Infosys Pvt LTD"
                  value={newExpCompany}
                  onChange={(e) => setNewExpCompany(e.target.value)}
                  className="w-full rounded border border-[#CED4DA] p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[#666] dark:text-[#AAA]">Role / Designation *</span>
                <input
                  placeholder="e.g. Technical Support Engineer (L2)"
                  value={newExpDesignation}
                  onChange={(e) => setNewExpDesignation(e.target.value)}
                  className="w-full rounded border border-[#CED4DA] p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[#666] dark:text-[#AAA]">Period / Duration</span>
                <input
                  placeholder="e.g. Start On October 1, 2021 | Till Date"
                  value={newExpPeriod}
                  onChange={(e) => setNewExpPeriod(e.target.value)}
                  className="w-full rounded border border-[#CED4DA] p-2 text-xs outline-none focus:border-[#2F80ED] dark:border-[#444] dark:bg-[#333] dark:text-white"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#E2E8F0] pt-3 dark:border-[#333]">
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="rounded border border-[#CED4DA] px-3 py-1.5 text-xs text-[#444] hover:bg-gray-50 dark:border-[#444] dark:bg-[#333] dark:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddWorkExp}
                className="rounded bg-[#2F80ED] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1D6FD8]"
              >
                Save Experience
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Employer (Ceipal 1:1 Replica from user screenshots) */}
      {dialog === 'add-employer' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl dark:bg-[#252525] border border-[#E2E8F0] dark:border-[#333] overflow-visible">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 dark:border-[#333]">
              <h3 className="text-base font-semibold text-[#1F2937] dark:text-white">Add Employer</h3>
              <button
                type="button"
                onClick={() => {
                  setDialog(null);
                  setVendorSearchOpen(false);
                  setEmpModalError(null);
                }}
                className="text-[#888] hover:text-[#222] dark:hover:text-white cursor-pointer"
              >
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

    </div>
  );
};
