import React, { useRef, useState } from 'react';
import {
  UserPlus,
  UploadCloud,
  FileText,
  CheckCircle,
  X,
  ArrowLeft,
  Sparkles,
  Layers,
  FolderOpen,
  Scissors,
  Copy,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  ListOrdered,
  List,
  Outdent,
  Indent,
  Quote,
  Link2,
  Unlink,
  Anchor,
  Image,
  Table,
  Minus,
  Code2,
  CheckSquare,
  RefreshCw,
  Search,
  RemoveFormatting,
  FileCode,
  Type,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo2,
  Redo2
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { PipelineStage } from '../../types';

export const ApplicantCreate: React.FC = () => {
  const { navigate } = useAppStore();
  const [method, setMethod] = useState<'parse' | 'manual' | 'dropbox' | 'box' | 'onedrive' | 'bulk' | null>(null);
  const [cloudSource, setCloudSource] = useState('');
  const [selectedResumeFile, setSelectedResumeFile] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentDesignation, setCurrentDesignation] = useState('');
  const [location, setLocation] = useState('');
  const [experienceYears, setExperienceYears] = useState(6);
  const [source, setSource] = useState<'LinkedIn' | 'Direct Career Portal' | 'Referral' | 'Vendor Partner' | 'GitHub'>('LinkedIn');
  const [skills, setSkills] = useState<string[]>(['TypeScript', 'AWS']);
  const [newSkill, setNewSkill] = useState('');
  const [summary, setSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parseUploaded, setParseUploaded] = useState(false);
  const [profileFields, setProfileFields] = useState<Record<string, string>>({ country: 'India' });
  const [certifications, setCertifications] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [educationRows, setEducationRows] = useState([{ degree: '', school: '', year: '' }]);
  const [employerRows, setEmployerRows] = useState([{ company: '', title: '', location: '', from: '', to: '', summary: '' }]);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [certInput, setCertInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const updateProfileField = (key: string, value: string) => setProfileFields((prev) => ({ ...prev, [key]: value }));

  // Resume Parsing Simulation
  const handleSimulateResumeDrop = () => {
    setParseUploaded(true);
    setName('Gaurav Nambiar');
    setEmail('g.nambiar@cloudarchitects.io');
    setPhone('+91 99401 22390');
    setCurrentDesignation('Lead Distributed Systems Architect');
    setLocation('Bengaluru / San Jose');
    setExperienceYears(8);
    setSkills(['Rust', 'Go', 'Kubernetes', 'gRPC', 'Distributed Databases', 'AWS']);
    setSummary('Senior systems engineer with 8 years building fault-tolerant consensus protocols and microsecond trading infrastructure.');
  };

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (sk: string) => {
    setSkills(skills.filter((s) => s !== sk));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await ApiService.createApplicant({
      name,
      email,
      phone,
      currentDesignation,
      location,
      experienceYears: Number(experienceYears),
      source,
      skills,
      summary,
      middleName: profileFields.middleName,
      legalName: profileFields.legalName,
      nameAsPerAadhaar: profileFields.nameAsPerAadhaar,
      alternateEmail: profileFields.alternateEmail,
      homePhone: profileFields.homePhone,
      workPhone: profileFields.workPhone,
      dateOfBirth: profileFields.dateOfBirth,
      linkedinUrl: profileFields.linkedinUrl,
      portfolioUrl: profileFields.portfolioUrl,
      workAuthorization: profileFields.workAuthorization,
      address: profileFields.address,
      country: profileFields.country,
      state: profileFields.state,
      zipCode: profileFields.zipCode,
      relevantExperience: Number(profileFields.relevantExperience) || undefined,
      referredBy: profileFields.referredBy,
      applicantGroup: profileFields.applicantGroup,
      currentCompany: profileFields.currentCompany,
      currentCTC: profileFields.currentCTC,
      expectedCTC: profileFields.expectedCTC,
      currency: profileFields.currency || 'INR',
      noticePeriod: profileFields.noticePeriod,
      passportNumber: profileFields.passportNumber,
      preferredShift: profileFields.preferredShift,
      willingToRelocate: profileFields.willingToRelocate === 'Yes',
      primarySkills: profileFields.primarySkills?.split(',').map((s) => s.trim()).filter(Boolean) || [],
      technology: profileFields.technology,
      industry: profileFields.industry,
      referenceId: profileFields.referenceId,
      applicantRemarks: profileFields.applicantRemarks,
      customFields: profileFields,
      gdprApproved: profileFields.gdprApproved === 'Yes',
      educationDetails: educationRows.filter((r) => r.degree || r.school || r.year),
      certifications,
      languages,
      employerDetails: employerRows.filter((r) => r.company || r.title),
      documents: uploadedDocuments.map((doc) => ({ name: doc, size: 'Local file', date: new Date().toISOString().slice(0, 10), type: 'Applicant Document' })),
      status: 'New',
      matchScore: Math.floor(Math.random() * 12 + 88),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
    });

    setIsSubmitting(false);
    navigate('applicants');
  };

  if (!method) {
    const choices = [
      { label: 'Parse Resume', method: 'parse' as const, color: 'bg-[#22A6DC]', icon: <UploadCloud className="h-6 w-6" /> },
      { label: 'Manual Creation', method: 'manual' as const, color: 'bg-[#70BF28]', icon: <UserPlus className="h-6 w-6" /> },
      { label: 'Drop Box', method: 'dropbox' as const, color: 'bg-[#647D8B]', icon: <FolderOpen className="h-6 w-6" /> },
      { label: 'Box', method: 'box' as const, color: 'bg-[#A17AC5]', icon: <FolderOpen className="h-6 w-6" /> },
      { label: 'OneDrive', method: 'onedrive' as const, color: 'bg-[#1251B5]', icon: <FolderOpen className="h-6 w-6" /> },
      { label: 'Bulk Parsing', method: 'bulk' as const, color: 'bg-[#E77BB1]', icon: <UploadCloud className="h-6 w-6" /> }
    ];
    return <div className="relative flex min-h-[calc(100vh-128px)] flex-col items-center bg-[#EDF2F6] px-4 py-12 dark:bg-[#0F172A]">
      <button onClick={() => navigate('applicants')} className="absolute right-4 top-4 rounded-lg border border-[#D8E3F1] bg-white px-3 py-1.5 text-xs font-medium text-[#64748B] hover:bg-[#FFFFFF] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#BFDBFE]">Cancel</button>
      <h1 className="mt-2 text-xl font-medium text-[#384553] dark:text-white">Add Applicant</h1>
      <div className="mt-9 grid w-full max-w-[505px] grid-cols-2 justify-items-center gap-x-2 gap-y-2 sm:grid-cols-4">
        {choices.map((choice, index) => <button key={choice.method} onClick={() => { setMethod(choice.method); setCloudSource(['dropbox', 'box', 'onedrive'].includes(choice.method) ? choice.label : ''); }} className={`flex h-[68px] w-[120px] flex-col items-center justify-center gap-1 rounded-sm text-white shadow-sm transition hover:-translate-y-0.5 hover:brightness-105 ${choice.color} ${index === 4 ? 'sm:col-start-2' : index === 5 ? 'sm:col-start-3' : ''}`}>
          {choice.icon}<span className="text-[10px] font-medium">{choice.label}</span>
        </button>)}
      </div>
      <p className="mt-4 flex items-center gap-1 text-[10px] text-[#8A98A8]"><span className="flex h-3 w-3 items-center justify-center rounded-full bg-[#4899E0] text-[8px] font-bold text-white">i</span> Save time by importing your information automatically</p>
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('applicants')}
          className="p-2 rounded-xl border border-[#D8E3F1] dark:border-[#334155] hover:bg-[#FFFFFF] dark:hover:bg-[#475569] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#64748B] dark:text-[#BFDBFE]" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E293B] dark:text-white">
            Add Candidate to Talent Pool
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#BFDBFE]">
            Extract profile data from resumes, cloud drives, or manual onboarding
          </p>
        </div>
        <button type="button" onClick={() => { setMethod(null); setCloudSource(''); }} className="ml-auto rounded-lg border border-[#D8E3F1] bg-white px-3 py-2 text-xs font-semibold text-[#475569] hover:bg-[#FFFFFF] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white">Change method</button>
      </div>

      {/* Applicant creation methods */}
      <div className="hidden">
        <button
          onClick={() => { setMethod('parse'); setCloudSource(''); }}
          className={`py-2 px-1 rounded-xl transition-all truncate ${
            method === 'parse' ? 'bg-[#FFFFFF] dark:bg-[#475569] text-[#1E293B] dark:text-[#FFFFFF] shadow-xs border border-[#D8E3F1] dark:border-[#475569]' : 'text-[#64748B] dark:text-[#BFDBFE] hover:text-[#1E293B] dark:hover:text-white'
          }`}
        >
          1. Parse Resume
        </button>
        <button
          onClick={() => { setMethod('manual'); setCloudSource(''); }}
          className={`py-2 px-1 rounded-xl transition-all truncate ${
            method === 'manual' ? 'bg-[#FFFFFF] dark:bg-[#475569] text-[#1E293B] dark:text-[#FFFFFF] shadow-xs border border-[#D8E3F1] dark:border-[#475569]' : 'text-[#64748B] dark:text-[#BFDBFE] hover:text-[#1E293B] dark:hover:text-white'
          }`}
        >
          2. Manual Entry
        </button>
        <button
          onClick={() => { setMethod('dropbox'); setCloudSource('Dropbox'); }}
          className={`py-2 px-1 rounded-xl transition-all truncate ${
            method === 'dropbox' ? 'bg-[#FFFFFF] dark:bg-[#475569] text-[#1E293B] dark:text-[#FFFFFF] shadow-xs border border-[#D8E3F1] dark:border-[#475569]' : 'text-[#64748B] dark:text-[#BFDBFE] hover:text-[#1E293B] dark:hover:text-white'
          }`}
        >
          3. Dropbox
        </button>
        <button
          onClick={() => { setMethod('box'); setCloudSource('Box'); }}
          className={`py-2 px-1 rounded-xl transition-all truncate ${
            method === 'box' ? 'bg-[#FFFFFF] dark:bg-[#475569] text-[#1E293B] dark:text-[#FFFFFF] shadow-xs border border-[#D8E3F1] dark:border-[#475569]' : 'text-[#64748B] dark:text-[#BFDBFE] hover:text-[#1E293B] dark:hover:text-white'
          }`}
        >
          4. Box
        </button>
        <button
          onClick={() => { setMethod('onedrive'); setCloudSource('OneDrive'); }}
          className={`py-2 px-1 rounded-xl transition-all truncate ${
            method === 'onedrive' ? 'bg-[#FFFFFF] dark:bg-[#475569] text-[#1E293B] dark:text-[#FFFFFF] shadow-xs border border-[#D8E3F1] dark:border-[#475569]' : 'text-[#64748B] dark:text-[#BFDBFE] hover:text-[#1E293B] dark:hover:text-white'
          }`}
        >
          5. OneDrive
        </button>
        <button
          onClick={() => {
            setMethod('bulk');
            setCloudSource('');
          }}
          className={`py-2 px-1 rounded-xl transition-all truncate ${
            method === 'bulk' ? 'bg-[#FFFFFF] dark:bg-[#475569] text-[#1E293B] dark:text-[#FFFFFF] shadow-xs border border-[#D8E3F1] dark:border-[#475569]' : 'text-[#64748B] dark:text-[#BFDBFE] hover:text-[#1E293B] dark:hover:text-white'
          }`}
        >
          6. Bulk Parsing
        </button>
        <button
          onClick={() => { setMethod('dropbox'); setCloudSource('Dropbox'); }}
          className={`py-2 px-1 rounded-xl transition-all truncate ${method === 'dropbox' ? 'bg-[#FFFFFF] dark:bg-[#475569] text-[#1E293B] dark:text-[#FFFFFF] shadow-xs border border-[#D8E3F1] dark:border-[#475569]' : 'text-[#64748B] dark:text-[#BFDBFE] hover:text-[#1E293B] dark:hover:text-white'}`}
        >7. Google Drive</button>
      </div>

      {/* Parse Dropzone Banner */}
      {(method === 'parse' || method === 'bulk') && !parseUploaded && (
        <div className="p-6 border-2 border-dashed border-[#2563EB]/40 bg-[#FFFFFF]/50 dark:bg-[#475569]/30 rounded-2xl text-center space-y-3">
          <UploadCloud className="w-9 h-9 text-[#1E293B] mx-auto" />
          <div className="text-sm font-bold text-[#1E293B] dark:text-white">{method === 'bulk' ? 'Bulk Resume Import' : 'Upload a Resume'}</div>
          <p className="text-xs text-[#64748B] dark:text-[#BFDBFE] max-w-md mx-auto">Select PDF, DOCX, or TXT resume files. This frontend preview records the selected filenames; resume extraction requires a parser service.</p>
          <input type="file" multiple={method === 'bulk'} accept=".pdf,.doc,.docx,.txt,.rtf" onChange={(e) => { const files = Array.from(e.target.files || []); setSelectedResumeFile(files.map((f) => f.name).join(', ')); setUploadedDocuments((prev) => [...new Set([...prev, ...files.map((f) => f.name)])]); }} className="mx-auto block max-w-sm text-xs" />
          {selectedResumeFile && <div className="text-[11px] text-[#1E293B]">Selected: {selectedResumeFile}</div>}
          <button type="button" onClick={handleSimulateResumeDrop} className="rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white">Load sample parsed profile</button>
        </div>
      )}
      {cloudSource && <div className="rounded-2xl border border-[#D8E3F1] bg-white p-5 dark:border-[#334155] dark:bg-[#1E293B]"><div className="flex items-start gap-3"><FolderOpen className="h-7 w-7 text-[#1E293B]" /><div><div className="font-bold text-[#1E293B] dark:text-white">Import from {cloudSource}</div><p className="mt-1 text-xs text-[#6D7988]">Cloud account authorization is not configured in this frontend. You can select the resume file from your device to continue the applicant workflow.</p></div></div><input type="file" accept=".pdf,.doc,.docx,.txt,.rtf" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setSelectedResumeFile(file.name); setUploadedDocuments((prev) => [...new Set([...prev, file.name])]); } }} className="mt-4 block text-xs" />{selectedResumeFile && <div className="mt-2 text-[11px] text-[#1E293B]">Selected: {selectedResumeFile}</div>}<button type="button" onClick={handleSimulateResumeDrop} className="mt-3 rounded-lg border border-[#D8E3F1] px-3 py-2 text-xs font-semibold text-[#1E293B] dark:border-[#334155]">Load sample parsed profile</button></div>}

      {/* Mint #8AC9A7 success banner */}
      {parseUploaded && (
        <div className="p-3 bg-[#8AC9A7]/20 border border-[#8AC9A7]/40 text-[#276749] dark:text-[#8AC9A7] rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4 text-[#8AC9A7]" />
            Resume parsed successfully! Fields populated below.
          </span>
          <button
            onClick={() => setParseUploaded(false)}
            className="text-xs underline hover:text-[#1E293B] dark:hover:text-white"
          >
            Reset
          </button>
        </div>
      )}

      {/* Form: White #FFFFFF card, Light Grey #D8E3F1 border */}
      <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-2xl shadow-xs space-y-6">
        {/* Personal & Contact */}
        <div className="space-y-4">
          <div className="text-xs font-mono font-bold text-[#1E293B] dark:text-[#93C5FD] uppercase tracking-wider">
            01. Personal &amp; Contact Details
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[#64748B] dark:text-[#BFDBFE] mb-1 font-medium">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Gaurav Nambiar"
                className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-[#1E293B] dark:text-white font-semibold focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-[#64748B] dark:text-[#BFDBFE] mb-1 font-medium">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-[#64748B] dark:text-[#BFDBFE] mb-1 font-medium">Mobile Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="space-y-4 pt-4 border-t border-[#D8E3F1] dark:border-[#334155]">
          <div className="text-xs font-mono font-bold text-[#1E293B] dark:text-[#93C5FD] uppercase tracking-wider">
            02. Professional Experience &amp; Location
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[#64748B] dark:text-[#BFDBFE] mb-1 font-medium">Current Designation</label>
              <input
                type="text"
                required
                value={currentDesignation}
                onChange={(e) => setCurrentDesignation(e.target.value)}
                placeholder="e.g. Lead Systems Architect"
                className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-[#1E293B] dark:text-white font-semibold focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-[#64748B] dark:text-[#BFDBFE] mb-1 font-medium">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-[#64748B] dark:text-[#BFDBFE] mb-1 font-medium">Years of Experience</label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-mono text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-4 pt-4 border-t border-[#D8E3F1] dark:border-[#334155]">
          <div className="text-xs font-mono font-bold text-[#1E293B] dark:text-[#93C5FD] uppercase tracking-wider">
            03. Core Competencies &amp; Skills
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="Add skill and press Enter"
                className="flex-1 px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB]"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1A659E] text-white rounded-xl transition-colors font-medium"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((sk) => (
                <span
                  key={sk}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg font-mono text-xs text-[#1E293B] dark:text-[#FFFFFF]"
                >
                  <span>{sk}</span>
                  <X
                    onClick={() => handleRemoveSkill(sk)}
                    className="w-3.5 h-3.5 text-[#64748B] hover:text-rose-500 cursor-pointer transition-colors"
                  />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-4 pt-4 border-t border-[#D8E3F1] dark:border-[#334155]">
          <div className="text-xs font-mono font-bold text-[#1E293B] dark:text-[#93C5FD] uppercase tracking-wider">
            04. Executive Summary
          </div>
          <textarea
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Candidate profile summary, notable project highlights..."
            className="w-full p-3 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-xs text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        {/* Additional fields from the reference applicant profile workflow */}
        <div className="space-y-4 pt-4 border-t border-[#D8E3F1] dark:border-[#334155]">
          <div className="text-xs font-mono font-bold text-[#1E293B] dark:text-[#93C5FD] uppercase tracking-wider">05. Personal Details &amp; Work Authorization</div>
          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            {[
              ['Middle Name', 'middleName'], ['Legal Name', 'legalName'], ['Name (As per Aadhaar)', 'nameAsPerAadhaar'], ['Alternate Email', 'alternateEmail'],
              ['Home Phone Number', 'homePhone'], ['Work Phone Number', 'workPhone'], ['Date of Birth', 'dateOfBirth', 'date'],
              ['LinkedIn Profile URL', 'linkedinUrl'], ['Portfolio / Social URL', 'portfolioUrl'], ['Work Authorization', 'workAuthorization'],
              ['Street Address', 'address'], ['Country', 'country'], ['State / Province', 'state'], ['ZIP / Postal Code', 'zipCode'],
              ['Relevant Experience (years)', 'relevantExperience', 'number'], ['Referred By', 'referredBy'], ['Applicant Group', 'applicantGroup'],
              ['Current Company', 'currentCompany'], ['Current CTC', 'currentCTC'], ['Expected CTC', 'expectedCTC'],
              ['Notice Period', 'noticePeriod'], ['PAN / Tax ID', 'panNumber'], ['Aadhaar Number', 'aadhaarNumber'], ['Passport Number', 'passportNumber'],
              ['Marital Status', 'maritalStatus'], ['Nationality', 'nationality'], ['Preferred Shift', 'preferredShift'],
              ['Gender', 'gender'], ['Race / Ethnicity', 'raceEthnicity'], ['Veteran Status', 'veteranStatus'], ['Disability', 'disability'],
              ['Technology', 'technology'], ['Industry', 'industry'], ['Reference ID', 'referenceId']
            ].map(([label, key, type]) => <div key={key}>
              <label className="block text-[#64748B] dark:text-[#BFDBFE] mb-1 font-medium">{label}</label>
              <input type={type || 'text'} value={profileFields[key] || ''} onChange={(e) => updateProfileField(key, e.target.value)} className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB]" />
            </div>)}
            <div><label className="block text-[#64748B] dark:text-[#BFDBFE] mb-1 font-medium">Willing to Relocate</label><select value={profileFields.willingToRelocate || 'Yes'} onChange={(e) => updateProfileField('willingToRelocate', e.target.value)} className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-[#1E293B] dark:text-white"><option>Yes</option><option>No</option></select></div>
            <div><label className="block text-[#64748B] dark:text-[#BFDBFE] mb-1 font-medium">Currency</label><select value={profileFields.currency || 'INR'} onChange={(e) => updateProfileField('currency', e.target.value)} className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-[#1E293B] dark:text-white"><option>INR</option><option>USD</option><option>EUR</option><option>GBP</option></select></div>
          </div>
          <label className="block text-xs text-[#64748B] dark:text-[#BFDBFE]">Primary Skills (comma separated)<input value={profileFields.primarySkills || ''} onChange={(e) => updateProfileField('primarySkills', e.target.value)} placeholder="Java, React, AWS" className="mt-1 w-full px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-[#1E293B] dark:text-white" /></label>
          <label className="block text-xs text-[#64748B] dark:text-[#BFDBFE]">Applicant Remarks<textarea rows={2} value={profileFields.applicantRemarks || ''} onChange={(e) => updateProfileField('applicantRemarks', e.target.value)} className="mt-1 w-full p-3 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-[#1E293B] dark:text-white" /></label>
          <label className="flex items-start gap-2 text-xs text-[#64748B] dark:text-[#BFDBFE]"><input type="checkbox" checked={profileFields.gdprApproved === 'Yes'} onChange={(e) => updateProfileField('gdprApproved', e.target.checked ? 'Yes' : 'No')} /> GDPR approved consent recorded</label>
        </div>

        <div className="space-y-4 pt-4 border-t border-[#D8E3F1] dark:border-[#334155]">
          <div className="text-xs font-mono font-bold text-[#1E293B] dark:text-[#93C5FD] uppercase tracking-wider">06. Documents</div>
          <div className="rounded-xl border border-dashed border-[#AFCBE4] bg-[#F7FBFF] p-4 text-xs dark:bg-[#0F172A] dark:border-[#334155]"><label className="font-semibold text-[#334155] dark:text-white">Upload resume and supporting documents</label><input type="file" multiple accept=".pdf,.doc,.docx,.txt,.rtf" onChange={(e) => setUploadedDocuments(Array.from(e.target.files || []).map((f) => f.name))} className="mt-2 block w-full text-xs dark:text-slate-300" />{uploadedDocuments.length > 0 && <div className="mt-2 text-[#1E293B] dark:text-blue-300">{uploadedDocuments.join(' · ')}</div>}<p className="mt-1 text-[10px] text-[#64748B] dark:text-slate-400">Files are listed in this browser demo; no server upload is configured.</p></div>
        </div>

        <div className="space-y-4 pt-4 border-t border-[#D8E3F1] dark:border-[#334155]">
          <div className="flex items-center justify-between"><div className="text-xs font-mono font-bold text-[#1E293B] dark:text-[#93C5FD] uppercase tracking-wider">07. Education Details</div><button type="button" onClick={() => setEducationRows([...educationRows, { degree: '', school: '', year: '' }])} className="text-xs font-semibold text-[#1E293B] dark:text-blue-400 hover:underline">+ Add Education</button></div>
          {educationRows.map((row, i) => <div key={i} className="grid sm:grid-cols-3 gap-3"><input aria-label="Degree" placeholder="Degree / qualification" value={row.degree} onChange={(e) => setEducationRows(educationRows.map((r, j) => j === i ? { ...r, degree: e.target.value } : r))} className="px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] dark:text-white rounded-xl text-xs" /><input aria-label="School" placeholder="School / institution" value={row.school} onChange={(e) => setEducationRows(educationRows.map((r, j) => j === i ? { ...r, school: e.target.value } : r))} className="px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] dark:text-white rounded-xl text-xs" /><input aria-label="Graduation year" placeholder="Graduation year" value={row.year} onChange={(e) => setEducationRows(educationRows.map((r, j) => j === i ? { ...r, year: e.target.value } : r))} className="px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] dark:text-white rounded-xl text-xs" /></div>)}
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-[#D8E3F1] dark:border-[#334155]">
          <div className="space-y-3"><div className="text-xs font-mono font-bold text-[#1E293B] dark:text-[#93C5FD] uppercase tracking-wider">08. Certifications</div><div className="flex gap-2"><input value={certInput} onChange={(e) => setCertInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (certInput.trim()) setCertifications([...certifications, certInput.trim()]); setCertInput(''); } }} placeholder="Add certification" className="min-w-0 flex-1 px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] dark:text-white rounded-xl text-xs" /><button type="button" onClick={() => { if (certInput.trim()) setCertifications([...certifications, certInput.trim()]); setCertInput(''); }} className="rounded-xl bg-[#2563EB] px-3 text-xs text-white">Add</button></div><div className="flex flex-wrap gap-1">{certifications.map((item) => <button key={item} type="button" onClick={() => setCertifications(certifications.filter((x) => x !== item))} className="rounded bg-[#FFFFFF] px-2 py-1 text-[10px] text-[#1E293B] dark:bg-[#0F172A] dark:text-white dark:border dark:border-[#334155]">{item} ×</button>)}</div></div>
          <div className="space-y-3"><div className="text-xs font-mono font-bold text-[#1E293B] dark:text-[#93C5FD] uppercase tracking-wider">09. Languages</div><div className="flex gap-2"><input value={languageInput} onChange={(e) => setLanguageInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (languageInput.trim()) setLanguages([...languages, languageInput.trim()]); setLanguageInput(''); } }} placeholder="Add language" className="min-w-0 flex-1 px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] dark:text-white rounded-xl text-xs" /><button type="button" onClick={() => { if (languageInput.trim()) setLanguages([...languages, languageInput.trim()]); setLanguageInput(''); }} className="rounded-xl bg-[#2563EB] px-3 text-xs text-white">Add</button></div><div className="flex flex-wrap gap-1">{languages.map((item) => <button key={item} type="button" onClick={() => setLanguages(languages.filter((x) => x !== item))} className="rounded bg-[#FFFFFF] px-2 py-1 text-[10px] text-[#1E293B] dark:bg-[#0F172A] dark:text-white dark:border dark:border-[#334155]">{item} ×</button>)}</div></div>
        </div>

        <div className="space-y-4 pt-4 border-t border-[#D8E3F1] dark:border-[#334155]">
          <div className="flex items-center justify-between"><div className="text-xs font-mono font-bold text-[#1E293B] dark:text-[#93C5FD] uppercase tracking-wider">10. Work Experience &amp; Employer Details</div><button type="button" onClick={() => setEmployerRows([...employerRows, { company: '', title: '', location: '', from: '', to: '', summary: '' }])} className="text-xs font-semibold text-[#1E293B] dark:text-blue-400 hover:underline">+ Add Employer</button></div>
          {employerRows.map((row, i) => <div key={i} className="grid sm:grid-cols-3 gap-3 rounded-xl border border-[#D8E3F1] dark:border-[#334155] p-3"><input aria-label="Employer" placeholder="Company" value={row.company} onChange={(e) => setEmployerRows(employerRows.map((r, j) => j === i ? { ...r, company: e.target.value } : r))} className="px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] dark:text-white rounded-xl text-xs" /><input aria-label="Role" placeholder="Role / title" value={row.title} onChange={(e) => setEmployerRows(employerRows.map((r, j) => j === i ? { ...r, title: e.target.value } : r))} className="px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] dark:text-white rounded-xl text-xs" /><input aria-label="Employer location" placeholder="Location" value={row.location} onChange={(e) => setEmployerRows(employerRows.map((r, j) => j === i ? { ...r, location: e.target.value } : r))} className="px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] dark:text-white rounded-xl text-xs" /><input aria-label="Start date" type="month" value={row.from} onChange={(e) => setEmployerRows(employerRows.map((r, j) => j === i ? { ...r, from: e.target.value } : r))} className="px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] dark:text-white rounded-xl text-xs" /><input aria-label="End date" type="month" value={row.to} onChange={(e) => setEmployerRows(employerRows.map((r, j) => j === i ? { ...r, to: e.target.value } : r))} className="px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] dark:text-white rounded-xl text-xs" /><textarea aria-label="Role summary" placeholder="Responsibilities / achievements" value={row.summary} onChange={(e) => setEmployerRows(employerRows.map((r, j) => j === i ? { ...r, summary: e.target.value } : r))} className="px-3 py-2 bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] dark:text-white rounded-xl text-xs" /></div>)}
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-[#D8E3F1] dark:border-[#334155] flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('applicants')}
            className="px-4 py-2 border border-[#D8E3F1] dark:border-[#334155] text-[#64748B] dark:text-[#BFDBFE] hover:text-[#1E293B] dark:hover:text-white dark:hover:bg-[#334155] rounded-xl text-xs font-medium"
          >
            Cancel
          </button>

          {/* Primary action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold shadow-xs shadow-[#2563EB]/30 transition-all"
          >
            {isSubmitting ? 'Importing Candidate...' : 'Save & Onboard Candidate'}
          </button>
        </div>
      </form>
    </div>
  );
};
