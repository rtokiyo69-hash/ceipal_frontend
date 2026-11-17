import React, { useState, useEffect } from 'react';
import {
  Users,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Star,
  Download,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  ArrowLeft,
  Send,
  MessageSquare,
  Award,
  Sparkles,
  Pencil,
  MoreHorizontal,
  FilePlus2,
  Bell,
  X,
  ChevronDown
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { Applicant, PipelineStage } from '../../types';

export const ApplicantDetail: React.FC = () => {
  const { selectedId, navigate } = useAppStore();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [stage, setStage] = useState<PipelineStage>('New');
  const [activeTab, setActiveTab] = useState<'overview' | 'resume' | 'timeline' | 'notes'>('overview');
  const [newNote, setNewNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<'task' | 'resume-builder' | 'matching-jobs' | 'bench-jobs' | 'edit' | 'notification' | 'upload' | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskType, setTaskType] = useState('Follow-up');
  const [taskAssignedTo, setTaskAssignedTo] = useState('Priya Sharma');
  const [editSummary, setEditSummary] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [uploadedName, setUploadedName] = useState('');
  const [notePriority, setNotePriority] = useState('Medium');
  const [noteReminder, setNoteReminder] = useState(false);

  useEffect(() => {
    if (selectedId) {
      ApiService.getApplicantById(selectedId).then((a) => {
        if (a) {
          setApplicant(a);
          setStage(a.status);
        }
      });
    } else {
      // Default to first applicant
      ApiService.getApplicants().then((apps) => {
        if (apps.length > 0) {
          setApplicant(apps[0]);
          setStage(apps[0].status);
        }
      });
    }
  }, [selectedId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!applicant) {
    return <div className="p-8 text-center text-xs text-[#5E6B7A]">Loading candidate dossier...</div>;
  }

  const handleStageChange = async (newStage: PipelineStage) => {
    setStage(newStage);
    setApplicant({ ...applicant, status: newStage });
    await ApiService.updateApplicantStage(applicant.id, newStage);
    showToast(`Candidate stage updated to "${newStage}"`);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const noteObj = {
      id: `nt-${Date.now()}`,
      author: 'Priya Sharma',
      text: `[${notePriority}${noteReminder ? ' · reminder' : ''}] ${newNote.trim()}`,
      date: 'Just now'
    };
    const updatedNotes = [noteObj, ...(applicant.notes || [])];
    setApplicant({ ...applicant, notes: updatedNotes });
    ApiService.updateApplicant(applicant.id, { notes: updatedNotes });
    setNewNote('');
    showToast('Recruiter evaluation note added');
  };

  const handleCreateTask = () => {
    if (!taskTitle.trim()) return;
    const tasks = JSON.parse(localStorage.getItem('ats_applicant_tasks') || '[]');
    localStorage.setItem('ats_applicant_tasks', JSON.stringify([{ id: `TASK-${Date.now()}`, applicantId: applicant.id, applicantName: applicant.name, title: taskTitle.trim(), type: taskType, assignedTo: taskAssignedTo, dueDate: taskDueDate, status: 'Open' }, ...tasks]));
    setTaskTitle(''); setTaskDueDate(''); setDialog(null); showToast('Task added to this applicant.');
  };

  const handleSaveEdit = async () => {
    const updates = { name: editName, email: editEmail, phone: editPhone, currentDesignation: editTitle, location: editLocation, summary: editSummary };
    const updated = { ...applicant, ...updates };
    setApplicant(updated); await ApiService.updateApplicant(applicant.id, updates);
    setDialog(null); showToast('Applicant profile updated.');
  };

  const moreAction = (action: string) => {
    setActionMenuOpen(false);
    if (action === 'Create Task') { setDialog('task'); return; }
    if (action === 'Add Note') { setActiveTab('notes'); return; }
    if (action === 'Bench Marketing Jobs') { setDialog('bench-jobs'); return; }
    if (action === 'Upload Document') { setDialog('upload'); return; }
    if (action === 'Print') { window.print(); return; }
    if (action === 'Send Email') { window.location.href = `mailto:${encodeURIComponent(applicant.email)}?subject=${encodeURIComponent(`Applicant follow-up: ${applicant.name}`)}`; return; }
    if (action === 'Request Resume') { showToast('Resume request added to recruiter activity.'); return; }
    if (action === 'Notification') { setDialog('notification'); return; }
    if (action === 'Resume Download History') { const history = JSON.parse(localStorage.getItem('ats_resume_download_history') || '[]'); showToast(history.some((item: { applicantId: string }) => item.applicantId === applicant.id) ? 'Resume download history is available in this browser.' : 'No resume downloads recorded yet.'); return; }
    if (action === 'Block Contact On TextOnHire') { const blocked = JSON.parse(localStorage.getItem('ats_blocked_applicants') || '[]') as string[]; const next = blocked.includes(applicant.id) ? blocked.filter((id) => id !== applicant.id) : [...blocked, applicant.id]; localStorage.setItem('ats_blocked_applicants', JSON.stringify(next)); showToast(next.includes(applicant.id) ? 'TextOnHire contact blocked.' : 'TextOnHire contact unblocked.'); return; }
    const history = JSON.parse(localStorage.getItem('ats_applicant_actions') || '[]');
    localStorage.setItem('ats_applicant_actions', JSON.stringify([{ id: `ACT-${Date.now()}`, applicantId: applicant.id, applicantName: applicant.name, action, createdAt: new Date().toISOString() }, ...history]));
    showToast(`${action} recorded for this applicant.`);
  };

  const localTasks = (JSON.parse(localStorage.getItem('ats_applicant_tasks') || '[]') as { id: string; applicantId: string; title: string; dueDate?: string; status?: string }[]).filter((item) => item.applicantId === applicant.id);
  const localActions = (JSON.parse(localStorage.getItem('ats_applicant_actions') || '[]') as { id: string; applicantId: string; action: string; createdAt: string }[]).filter((item) => item.applicantId === applicant.id);
  const editFields: { label: string; value: string; setValue: (value: string) => void }[] = [
    { label: 'Full Name', value: editName, setValue: setEditName },
    { label: 'Email Address', value: editEmail, setValue: setEditEmail },
    { label: 'Phone Number', value: editPhone, setValue: setEditPhone },
    { label: 'Current Designation', value: editTitle, setValue: setEditTitle },
    { label: 'Location', value: editLocation, setValue: setEditLocation }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0B4F89] text-white border border-[#1769AA] px-4 py-2 rounded-xl shadow-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#8AC9A7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Stage Advance Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('applicants')}
          className="flex items-center gap-2 text-xs font-semibold text-[#5E6B7A] hover:text-[#1769AA] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Pool</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#5E6B7A] dark:text-[#B9CAD9]">
            <span>Recruitment Stage:</span>
            <select
              value={stage}
              onChange={(e) => handleStageChange(e.target.value as PipelineStage)}
              className="px-3 py-1.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl text-xs font-bold text-[#1769AA] focus:outline-none"
            >
              <option value="New">Stage: New</option>
              <option value="Screening">Stage: Screening</option>
              <option value="Submitted">Stage: Submitted</option>
              <option value="Interview">Stage: Interview</option>
              <option value="Selected">Stage: Selected</option>
              <option value="Offered">Stage: Offered</option>
              <option value="Hired">Stage: Hired</option>
              <option value="Rejected">Stage: Rejected</option>
            </select>
          </div>

          {/* Primary action */}
          <button
            onClick={() => navigate('pipeline')}
            className="px-4 py-1.5 bg-[#2F80E7] hover:bg-[#216BC4] text-white text-xs font-semibold rounded-xl transition-all shadow-xs shadow-[#2F80E7]/20"
          >
            View in Kanban
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#DCE6EF] bg-white px-3 py-2 dark:border-[#354A5C] dark:bg-[#1B2936]">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => { setEditName(applicant.name); setEditEmail(applicant.email); setEditPhone(applicant.phone); setEditTitle(applicant.currentDesignation); setEditLocation(applicant.location); setEditSummary(applicant.summary || ''); setDialog('edit'); }} className="px-3 py-1.5 rounded-lg bg-[#2F80E7] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#216BC4]"><Pencil className="w-3.5 h-3.5" /> Edit Applicant</button>
          <button onClick={() => setActiveTab('resume')} className="px-3 py-1.5 rounded-lg border border-[#DCE6EF] dark:border-[#354A5C] text-xs font-semibold text-[#344252] dark:text-white hover:bg-[#F5F8FB] dark:hover:bg-[#22384B]"><FileText className="w-3.5 h-3.5 inline mr-1.5" />View Resume</button>
          <button onClick={() => setDialog('matching-jobs')} className="px-3 py-1.5 rounded-lg border border-[#DCE6EF] dark:border-[#354A5C] text-xs font-semibold text-[#344252] dark:text-white hover:bg-[#F5F8FB] dark:hover:bg-[#22384B]">Matching Jobs</button>
          <button onClick={() => setDialog('resume-builder')} className="px-3 py-1.5 rounded-lg border border-[#DCE6EF] dark:border-[#354A5C] text-xs font-semibold text-[#344252] dark:text-white hover:bg-[#F5F8FB] dark:hover:bg-[#22384B]">Create Resume Builder</button>
          <div className="relative">
            <button onClick={() => setActionMenuOpen(!actionMenuOpen)} className="px-3 py-1.5 rounded-lg border border-[#DCE6EF] dark:border-[#354A5C] text-xs font-semibold text-[#344252] dark:text-white hover:bg-[#F5F8FB] dark:hover:bg-[#22384B] flex items-center gap-1"><MoreHorizontal className="w-4 h-4" /> More <ChevronDown className="w-3 h-3" /></button>
            {actionMenuOpen && <div className="absolute right-0 top-full mt-1 z-30 max-h-80 w-64 overflow-y-auto bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] shadow-xl rounded-xl py-1">
              {['Bench Marketing Jobs', 'Timeline Activities', 'Create Task', 'Add Note', 'Send Email', 'Request Resume', 'Upload Document', 'Add References', 'Activate Account', 'Print', 'Request More Details from Applicant', 'Request eForm to Employer', 'Request eForm to Applicant', 'Resume Download History', 'Initiate Feedback Review', 'Block Contact On TextOnHire', 'Notification'].map((item) => <button key={item} onClick={() => item === 'Timeline Activities' ? (setActiveTab('timeline'), setActionMenuOpen(false)) : moreAction(item)} className="w-full px-3 py-2 text-left text-xs text-[#344252] dark:text-white hover:bg-[#F5F8FB] dark:hover:bg-[#22384B]">{item}</button>)}
            </div>}
          </div>
        </div>
        <button onClick={() => setDialog('notification')} className="relative rounded-lg border border-[#DCE6EF] p-2 text-[#687789] hover:bg-[#F5F8FB] dark:border-[#354A5C] dark:text-[#B9CAD9] dark:hover:bg-[#22384B]" title="Notifications"><Bell className="h-4 w-4" /></button>
      </div>

      {/* Candidate Profile Dossier Card: White #FFFFFF, Light Grey #DCE6EF */}
      <div className="p-6 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-2xl shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={applicant.avatar}
              alt={applicant.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#1769AA]/30"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-[#202B37] dark:text-white">
                  {applicant.name}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 bg-[#EAF4FC] dark:bg-[#22384B] border border-[#DCE6EF] dark:border-[#4D6274] rounded text-[#1769AA] dark:text-[#D8E9F7]">
                  {applicant.applicantId}
                </span>
              </div>
              <div className="text-sm font-semibold text-[#1769AA]">
                {applicant.currentDesignation}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#5E6B7A] dark:text-[#B9CAD9] pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#8AC9A7]" />
                  {applicant.location}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#1769AA]" />
                  {applicant.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#2F80E7]" />
                  {applicant.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Match Score Gauge: Mint #8AC9A7 */}
          <div className="p-4 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-2xl text-center min-w-40">
            <div className="text-3xl font-extrabold font-mono text-[#276749] dark:text-[#8AC9A7] tabular-nums">
              {applicant.matchScore}%
            </div>
            <div className="text-[11px] font-mono text-[#1769AA] font-semibold mt-0.5">
              REQUISITION FIT INDEX
            </div>
            <div className="text-[10px] text-[#5E6B7A] dark:text-[#B9CAD9] mt-1">
              Source: {applicant.source}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#DCE6EF] dark:border-[#354A5C] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-2 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-[#1769AA] text-[#1769AA]'
                : 'border-transparent text-[#5E6B7A] hover:text-[#202B37]'
            }`}
          >
            Overview &amp; Skills
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`pb-3 px-2 border-b-2 transition-all ${
              activeTab === 'resume'
                ? 'border-[#1769AA] text-[#1769AA]'
                : 'border-transparent text-[#5E6B7A] hover:text-[#202B37]'
            }`}
          >
            Resume Document View
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 px-2 border-b-2 transition-all ${
              activeTab === 'timeline'
                ? 'border-[#1769AA] text-[#1769AA]'
                : 'border-transparent text-[#5E6B7A] hover:text-[#202B37]'
            }`}
          >
            Recruitment Timeline
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-3 px-2 border-b-2 transition-all ${
              activeTab === 'notes'
                ? 'border-[#1769AA] text-[#1769AA]'
                : 'border-transparent text-[#5E6B7A] hover:text-[#202B37]'
            }`}
          >
            Recruiter Notes ({applicant.notes?.length || 0})
          </button>
        </div>

        {/* Tab Content: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 text-xs animate-in fade-in">
            {/* Summary */}
            <div className="space-y-2">
              <div className="font-bold text-[#1769AA] uppercase tracking-wider text-[11px] font-mono">
                Candidate Profile Summary
              </div>
              <p className="text-[#202B37] dark:text-[#F5F8FB] leading-relaxed p-4 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-2xl">
                {applicant.summary || 'Profile imported into Scout unified applicant pool.'}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[#DCE6EF] p-4 dark:border-[#354A5C]"><div className="mb-3 font-bold text-[#1769AA] uppercase tracking-wider text-[11px] font-mono">Personal Details</div><div className="grid grid-cols-2 gap-x-3 gap-y-2">{[['Email', applicant.email], ['Phone', applicant.phone], ['Date of Birth', applicant.dateOfBirth || applicant.customFields?.dateOfBirth], ['Work Authorization', applicant.workAuthorization || applicant.customFields?.workAuthorization], ['Nationality', applicant.customFields?.nationality], ['Address', applicant.address || applicant.customFields?.address], ['City / Location', applicant.location], ['Relocation', applicant.willingToRelocate === undefined ? '' : applicant.willingToRelocate ? 'Yes' : 'No']].filter(([, value]) => value).map(([label, value]) => <div key={label}><div className="text-[10px] text-[#7B8794]">{label}</div><div className="mt-0.5 font-medium text-[#344252] dark:text-[#F5F8FB]">{value}</div></div>)}</div></div>
              <div className="rounded-xl border border-[#DCE6EF] p-4 dark:border-[#354A5C]"><div className="mb-3 font-bold text-[#1769AA] uppercase tracking-wider text-[11px] font-mono">Professional &amp; Employment Details</div><div className="grid grid-cols-2 gap-x-3 gap-y-2">{[['Current Company', applicant.currentCompany], ['Current CTC', applicant.currentCTC], ['Expected CTC', applicant.expectedCTC], ['Notice Period', applicant.noticePeriod], ['Relevant Experience', applicant.relevantExperience ? `${applicant.relevantExperience} years` : ''], ['Preferred Shift', applicant.preferredShift], ['Applicant Group', applicant.applicantGroup], ['Reference ID', applicant.referenceId]].filter(([, value]) => value).map(([label, value]) => <div key={label}><div className="text-[10px] text-[#7B8794]">{label}</div><div className="mt-0.5 font-medium text-[#344252] dark:text-[#F5F8FB]">{value}</div></div>)}</div></div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <div className="font-bold text-[#1769AA] uppercase tracking-wider text-[11px] font-mono">
                Verified Technical Competencies
              </div>
              <div className="flex flex-wrap gap-2">
                {applicant.skills.map((sk) => (
                  <span
                    key={sk}
                    className="px-3 py-1 bg-[#EAF4FC] dark:bg-[#22384B] border border-[#DCE6EF] dark:border-[#4D6274] rounded-lg font-mono font-medium text-[#1769AA] dark:text-[#D8E9F7]"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Work History */}
            {applicant.workHistory && applicant.workHistory.length > 0 && (
              <div className="space-y-3">
                <div className="font-bold text-[#1769AA] uppercase tracking-wider text-[11px] font-mono">
                  Employment Experience
                </div>
                <div className="space-y-3">
                  {applicant.workHistory.map((wh, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#202B37] dark:text-white">{wh.role}</span>
                        <span className="font-mono text-[#276749] dark:text-[#8AC9A7] font-semibold">{wh.duration}</span>
                      </div>
                      <div className="text-[11px] text-[#1769AA] font-medium">{wh.company}</div>
                      <p className="text-[#5E6B7A] dark:text-[#B9CAD9] pt-1">{wh.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {applicant.educationDetails?.length ? <div className="space-y-2"><div className="font-bold text-[#1769AA] uppercase tracking-wider text-[11px] font-mono">Education Details</div>{applicant.educationDetails.map((item, i) => <div key={i} className="rounded-xl border border-[#DCE6EF] bg-[#F7F9FC] p-3 dark:border-[#354A5C] dark:bg-[#162431]"><b>{item.degree}</b><div className="text-[11px] text-[#6D7988]">{item.school} · {item.year}</div></div>)}</div> : null}
            {applicant.certifications?.length ? <div className="space-y-2"><div className="font-bold text-[#1769AA] uppercase tracking-wider text-[11px] font-mono">Certifications</div><div className="flex flex-wrap gap-2">{applicant.certifications.map((item) => <span key={item} className="rounded-lg border border-[#DCE6EF] bg-[#F7F9FC] px-2.5 py-1.5 dark:border-[#354A5C] dark:bg-[#162431]">{item}</span>)}</div></div> : null}
            {applicant.documents?.length ? <div className="space-y-2"><div className="flex items-center justify-between"><div className="font-bold text-[#1769AA] uppercase tracking-wider text-[11px] font-mono">Documents</div><button onClick={() => setDialog('upload')} className="text-[11px] font-semibold text-[#1769AA]">+ Upload</button></div>{applicant.documents.map((doc, i) => <div key={`${doc.name}-${i}`} className="flex items-center justify-between rounded-xl border border-[#DCE6EF] p-3 dark:border-[#354A5C]"><span className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#2F80E7]" />{doc.name}</span><span className="text-[10px] text-[#7B8794]">{doc.date} · {doc.size}</span></div>)}</div> : null}
          </div>
        )}

        {/* Tab Content: Resume Preview */}
        {activeTab === 'resume' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#5E6B7A] dark:text-[#B9CAD9]">
                Document: {applicant.name.replace(/\s+/g, '_')}_Resume_2026.pdf (1.4 MB)
              </span>
              <button
                onClick={() => showToast('Downloaded candidate resume document.')}
                className="px-3 py-1.5 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] hover:bg-[#EAF4FC] rounded-xl font-semibold flex items-center gap-1.5 transition-colors text-[#202B37] dark:text-white"
              >
                <Download className="w-3.5 h-3.5 text-[#1769AA]" />
                <span>Download PDF</span>
              </button>
            </div>

            {/* Realistic Resume Document Simulation */}
            <div className="p-8 bg-white dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-2xl shadow-inner space-y-4 font-mono text-[11px] leading-relaxed">
              <div className="border-b border-[#DCE6EF] dark:border-[#354A5C] pb-4">
                <div className="text-base font-bold text-[#202B37] dark:text-white">{applicant.name}</div>
                <div className="text-[#1769AA] font-semibold">{applicant.currentDesignation}</div>
                <div className="text-[#5E6B7A] dark:text-[#B9CAD9]">{applicant.email} · {applicant.phone} · {applicant.location}</div>
              </div>

              <div>
                <div className="font-bold text-[#202B37] dark:text-white uppercase">Profile Narrative</div>
                <p className="text-[#5E6B7A] dark:text-[#B9CAD9] mt-1">{applicant.summary}</p>
              </div>

              <div>
                <div className="font-bold text-[#202B37] dark:text-white uppercase">Primary Tech Stack</div>
                <div className="text-[#5E6B7A] dark:text-[#B9CAD9] mt-1">{applicant.skills.join(' · ')}</div>
              </div>

              <div className="pt-2 text-[10px] text-[#276749] dark:text-[#8AC9A7] font-semibold">
                ✓ Parsed by Scout Neural Extraction Engine · 100% Verified
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="relative border-l border-[#DCE6EF] dark:border-[#354A5C] ml-3 space-y-6">
              <div className="relative pl-6">
                <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-[#8AC9A7]" />
                <div className="font-bold text-[#202B37] dark:text-white">Active Stage: {applicant.status}</div>
                <div className="text-[11px] text-[#5E6B7A] dark:text-[#B9CAD9]">Candidate progressing according to SLA</div>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-[#1769AA]" />
                <div className="font-bold text-[#202B37] dark:text-white">Assigned to Lead Recruiter</div>
                <div className="text-[11px] text-[#5E6B7A] dark:text-[#B9CAD9]">{applicant.assignedRecruiter} took ownership</div>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-[#2F80E7]" />
                <div className="font-bold text-[#202B37] dark:text-white">Profile Onboarded &amp; Parsed</div>
                <div className="text-[11px] text-[#5E6B7A] dark:text-[#B9CAD9]">Source: {applicant.source}</div>
              </div>
              {localTasks.map((task) => <div key={task.id} className="relative pl-6"><div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-[#E5A43B]" /><div className="font-bold text-[#202B37] dark:text-white">Task: {task.title}</div><div className="text-[11px] text-[#5E6B7A] dark:text-[#B9CAD9]">{task.status || 'Open'}{task.dueDate ? ` · due ${task.dueDate}` : ''}</div></div>)}
              {localActions.map((activity) => <div key={activity.id} className="relative pl-6"><div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-[#7C6FE8]" /><div className="font-bold text-[#202B37] dark:text-white">{activity.action}</div><div className="text-[11px] text-[#5E6B7A] dark:text-[#B9CAD9]">{new Date(activity.createdAt).toLocaleString()}</div></div>)}
            </div>
          </div>
        )}

        {/* Tab Content: Notes */}
        {activeTab === 'notes' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="space-y-3 rounded-xl border border-[#DCE6EF] bg-[#F7F9FC] p-4 dark:border-[#354A5C] dark:bg-[#162431]">
              <div className="grid gap-3 sm:grid-cols-3"><label className="space-y-1 text-[11px] text-[#687789]">Applicant<input value={applicant.name} readOnly className="w-full rounded-lg border border-[#DCE6EF] bg-white px-3 py-2 text-xs text-[#344252] dark:border-[#354A5C] dark:bg-[#1B2936] dark:text-white" /></label><label className="space-y-1 text-[11px] text-[#687789]">Priority<select value={notePriority} onChange={(e) => setNotePriority(e.target.value)} className="w-full rounded-lg border border-[#DCE6EF] bg-white px-3 py-2 text-xs dark:border-[#354A5C] dark:bg-[#1B2936] dark:text-white"><option>Low</option><option>Medium</option><option>High</option></select></label><label className="space-y-1 text-[11px] text-[#687789]">Link to job<input placeholder="Search for a job (optional)" className="w-full rounded-lg border border-[#DCE6EF] bg-white px-3 py-2 text-xs dark:border-[#354A5C] dark:bg-[#1B2936] dark:text-white" /></label></div>
              <textarea rows={4} value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Enter recruiter note, interview feedback, or next steps..." className="w-full rounded-lg border border-[#DCE6EF] bg-white p-3 text-xs text-[#202B37] outline-none focus:border-[#1769AA] dark:border-[#354A5C] dark:bg-[#1B2936] dark:text-white" />
              <div className="flex flex-wrap items-center justify-between gap-2"><label className="flex items-center gap-2 text-[11px] text-[#687789]"><input type="checkbox" checked={noteReminder} onChange={(e) => setNoteReminder(e.target.checked)} /> Set reminder for this note</label><button onClick={handleAddNote} className="flex items-center gap-1.5 rounded-lg bg-[#2F80E7] px-4 py-2 font-semibold text-white hover:bg-[#216BC4]"><Send className="w-3.5 h-3.5" />Save Note</button></div>
            </div>

            <div className="space-y-2.5">
              {(applicant.notes || []).map((n) => (
                <div
                  key={n.id}
                  className="p-3 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#202B37] dark:text-white">{n.author}</span>
                    <span className="font-mono text-[10px] text-[#7A8794]">{n.date}</span>
                  </div>
                  <p className="text-[#5E6B7A] dark:text-[#B9CAD9]">{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {dialog && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setDialog(null)}>
        <div className="w-full max-w-xl rounded-2xl border border-[#DCE6EF] bg-white shadow-2xl dark:border-[#354A5C] dark:bg-[#1B2936]" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-[#E7EDF3] px-5 py-4 dark:border-[#354A5C]"><div><h2 className="font-bold text-[#202B37] dark:text-white">{dialog === 'task' ? 'Create New Task' : dialog === 'resume-builder' ? 'Create Resume Builder' : dialog === 'matching-jobs' ? 'Matching Jobs' : dialog === 'bench-jobs' ? 'Bench Marketing Jobs' : dialog === 'upload' ? 'Upload Applicant Document' : dialog === 'edit' ? 'Edit Applicant' : 'Notifications Center'}</h2><p className="mt-1 text-[11px] text-[#7B8794]">{applicant.name} · recruiter workspace</p></div><button onClick={() => setDialog(null)} aria-label="Close"><X className="h-5 w-5 text-[#7B8794]" /></button></div>
          <div className="space-y-4 p-5 text-xs">
            {dialog === 'task' && <><label className="block space-y-1 text-[#687789]">Task title<input autoFocus value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="e.g. Follow up after technical interview" className="w-full rounded-lg border border-[#DCE6EF] bg-white px-3 py-2 text-xs outline-none focus:border-[#2F80E7] dark:border-[#354A5C] dark:bg-[#162431] dark:text-white" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="block space-y-1 text-[#687789]">Task type<select value={taskType} onChange={(e) => setTaskType(e.target.value)} className="w-full rounded-lg border border-[#DCE6EF] bg-white px-3 py-2 text-xs dark:border-[#354A5C] dark:bg-[#162431] dark:text-white"><option>Follow-up</option><option>Call</option><option>Email</option><option>Interview</option><option>Document request</option><option>Other</option></select></label><label className="block space-y-1 text-[#687789]">Assigned to<select value={taskAssignedTo} onChange={(e) => setTaskAssignedTo(e.target.value)} className="w-full rounded-lg border border-[#DCE6EF] bg-white px-3 py-2 text-xs dark:border-[#354A5C] dark:bg-[#162431] dark:text-white"><option>Priya Sharma</option><option>Marcus Vance</option></select></label></div><label className="block space-y-1 text-[#687789]">Due date<input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className="w-full rounded-lg border border-[#DCE6EF] bg-white px-3 py-2 text-xs outline-none focus:border-[#2F80E7] dark:border-[#354A5C] dark:bg-[#162431] dark:text-white" /></label><div className="rounded-lg bg-[#F5F8FB] p-3 text-[11px] text-[#6D7988] dark:bg-[#162431]">Task is attached to {applicant.name} and saved in this browser.</div></>}
            {dialog === 'resume-builder' && <><div className="flex items-center gap-3 rounded-xl border border-[#DCE6EF] bg-[#F7F9FC] p-4 dark:border-[#354A5C] dark:bg-[#162431]"><FilePlus2 className="h-8 w-8 text-[#2F80E7]" /><div><div className="font-semibold text-[#344252] dark:text-white">Build a client-ready resume</div><p className="mt-1 text-[11px] text-[#7B8794]">Create a formatted copy from the candidate profile and selected experience.</p></div></div><label className="block space-y-1 text-[#687789]">Resume template<select className="w-full rounded-lg border border-[#DCE6EF] bg-white px-3 py-2 text-xs dark:border-[#354A5C] dark:bg-[#162431] dark:text-white"><option>Professional — Modern</option><option>Technical — Detailed</option><option>Consulting — Compact</option></select></label><label className="flex items-center gap-2 text-[#526173]"><input type="checkbox" defaultChecked /> Include contact details and skills</label></>}
            {(dialog === 'matching-jobs' || dialog === 'bench-jobs') && <div className="space-y-2">{dialog === 'bench-jobs' && <p className="rounded-lg bg-[#F5F8FB] p-3 text-[11px] text-[#6D7988] dark:bg-[#162431]">Review jobs where this applicant can be marketed and track their bench status.</p>}{[{ id: 'job-3', title: 'Principal Cloud AI Architect', client: 'CloudScale Enterprises', score: Math.min(98, applicant.matchScore + 2), tags: applicant.skills.slice(0, 2) }, { id: 'job-1', title: 'Staff Distributed Systems Engineer', client: 'NovaPay Distributed Systems', score: Math.max(72, applicant.matchScore - 4), tags: applicant.skills.slice(1, 3) }, { id: 'job-2', title: 'Senior Platform Engineer', client: 'FinEdge Global Capital', score: Math.max(68, applicant.matchScore - 11), tags: applicant.skills.slice(0, 2) }].map((job) => <div key={job.title} className="flex items-center justify-between gap-4 rounded-xl border border-[#DCE6EF] p-3 dark:border-[#354A5C]"><div><div className="font-semibold text-[#344252] dark:text-white">{job.title}</div><div className="mt-1 text-[11px] text-[#7B8794]">{job.client} · {job.tags.join(', ')}</div></div><div className="text-right"><div className="font-mono font-bold text-[#276749]">{job.score}%</div><button onClick={async () => { const updated = { ...applicant, assignedJobId: job.id, assignedJobTitle: job.title }; setApplicant(updated); await ApiService.updateApplicant(applicant.id, { assignedJobId: job.id, assignedJobTitle: job.title }); setDialog(null); showToast(`Candidate matched to ${job.title}.`); }} className="mt-1 rounded-md bg-[#EAF4FC] px-2 py-1 text-[10px] font-semibold text-[#1769AA] dark:bg-[#22384B]">{dialog === 'bench-jobs' ? 'Market candidate' : 'Match to job'}</button></div></div>)}</div>}
            {dialog === 'upload' && <div className="space-y-3"><p className="text-[11px] text-[#6D7988]">Add a resume, certificate, or other applicant document to the dossier.</p><input type="file" multiple onChange={(e) => setUploadedName(Array.from(e.target.files || []).map((f) => f.name).join(', '))} className="block w-full rounded-lg border border-[#DCE6EF] p-3 text-xs dark:border-[#354A5C]" />{uploadedName && <p className="text-[11px] text-[#1769AA]">Selected: {uploadedName}</p>}</div>}
            {dialog === 'edit' && <><div className="grid gap-3 sm:grid-cols-2">{editFields.map((field) => <label key={field.label} className="block space-y-1 text-[#687789]">{field.label}<input value={field.value} onChange={(e) => field.setValue(e.target.value)} className="w-full rounded-lg border border-[#DCE6EF] bg-white px-3 py-2 text-xs outline-none focus:border-[#2F80E7] dark:border-[#354A5C] dark:bg-[#162431] dark:text-white" /></label>)}</div><label className="block space-y-1 text-[#687789]">Candidate summary<textarea rows={4} value={editSummary} onChange={(e) => setEditSummary(e.target.value)} className="w-full resize-y rounded-lg border border-[#DCE6EF] bg-white px-3 py-2 text-xs outline-none focus:border-[#2F80E7] dark:border-[#354A5C] dark:bg-[#162431] dark:text-white" /></label></>}
            {dialog === 'notification' && <div className="rounded-xl border border-[#DCE6EF] bg-[#F7F9FC] p-5 text-center dark:border-[#354A5C] dark:bg-[#162431]"><Bell className="mx-auto mb-2 h-7 w-7 text-[#2F80E7]" /><div className="font-semibold text-[#344252] dark:text-white">No new notifications</div><p className="mt-1 text-[11px] text-[#7B8794]">Applicant updates and recruiter reminders will appear here.</p></div>}
          </div>
          <div className="flex justify-end gap-2 border-t border-[#E7EDF3] px-5 py-4 dark:border-[#354A5C]"><button onClick={() => setDialog(null)} className="rounded-lg border border-[#DCE6EF] px-3 py-2 text-xs font-semibold text-[#526173] dark:border-[#354A5C] dark:text-white">{['notification', 'matching-jobs', 'bench-jobs'].includes(dialog) ? 'Close' : 'Cancel'}</button>{dialog === 'task' && <button onClick={handleCreateTask} className="rounded-lg bg-[#2F80E7] px-4 py-2 text-xs font-semibold text-white">Create Task</button>}{dialog === 'resume-builder' && <button onClick={() => { const drafts = JSON.parse(localStorage.getItem('ats_resume_builder_drafts') || '[]'); localStorage.setItem('ats_resume_builder_drafts', JSON.stringify([{ applicantId: applicant.id, applicantName: applicant.name, template: 'Professional — Modern', createdAt: new Date().toISOString() }, ...drafts])); setDialog(null); showToast('Resume builder draft created.'); }} className="rounded-lg bg-[#2F80E7] px-4 py-2 text-xs font-semibold text-white">Create Draft</button>}{dialog === 'edit' && <button onClick={handleSaveEdit} className="rounded-lg bg-[#2F80E7] px-4 py-2 text-xs font-semibold text-white">Save Changes</button>}{dialog === 'upload' && <button disabled={!uploadedName} onClick={async () => { const additions = uploadedName.split(', ').map((name) => ({ name, size: 'Local file', date: new Date().toISOString().slice(0, 10), type: 'Applicant Document' })); const documents = [...(applicant.documents || []), ...additions]; setApplicant({ ...applicant, documents }); await ApiService.updateApplicant(applicant.id, { documents }); setUploadedName(''); setDialog(null); showToast('Document added to applicant dossier.'); }} className="rounded-lg bg-[#2F80E7] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Add Document</button>}</div>
        </div>
      </div>}
    </div>
  );
};
