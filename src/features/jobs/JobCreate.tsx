import React, { useState } from 'react';
import {
  Briefcase,
  Sparkles,
  FileText,
  Copy,
  Plus,
  X,
  CheckCircle,
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  ChevronRight,
  Send,
  Layers,
  Save,
  RotateCcw,
  Bold,
  Italic,
  List,
  ListOrdered
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { JobType, Priority, JobStatus } from '../../types';

interface JobCreateProps {
  initialMode?: 'select' | 'manual' | 'template' | 'parse';
}

export const JobCreate: React.FC<JobCreateProps> = ({ initialMode = 'select' }) => {
  const { navigate } = useAppStore();
  
  // Creation Flow Mode: 'select' (3-box Ceipal landing) | 'manual' | 'template' | 'parse'
  const [creationMode, setCreationMode] = useState<'select' | 'manual' | 'template' | 'parse'>(initialMode);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('');
  const [rawJdText, setRawJdText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFormSection, setActiveFormSection] = useState<'all' | 'details' | 'skills' | 'org' | 'description' | 'custom'>('all');

  // Form State - Authentic Ceipal ATS Fields
  // Top level
  const [businessUnit, setBusinessUnit] = useState('Ampcus Tech Pvt Ltd.');

  // Section 1: Job Details
  const [code, setCode] = useState(`AMP${Math.floor(12240 + Math.random() * 900)}`);
  const [facility, setFacility] = useState('Offshore Development Center');
  const [title, setTitle] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [billRate, setBillRate] = useState<number>(140);
  const [payRate, setPayRate] = useState<number>(105);
  const [rateType, setRateType] = useState<'Hourly' | 'Yearly' | 'Monthly' | 'Daily'>('Hourly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2027-11-15');
  const [category, setCategory] = useState('IT Software');
  const [skillType, setSkillType] = useState('Technical');
  const [respondBy, setRespondBy] = useState('Open Until Filled');
  const [remoteJob, setRemoteJob] = useState<'Yes' | 'No' | 'Hybrid'>('Hybrid');
  const [states, setStates] = useState('Maharashtra');
  const [location, setLocation] = useState('Mumbai, MH, 400032');
  const [status, setStatus] = useState<JobStatus>('Active');
  const [type, setType] = useState<JobType>('Full-Time');
  const [duration, setDuration] = useState('12 Months');
  const [client, setClient] = useState('CloudScale Enterprises');
  const [clientManager, setClientManager] = useState('David Chen');
  const [clientJobId, setClientJobId] = useState(`MOR4JP000${Math.floor(20000 + Math.random() * 80000)}`);
  const [turnaroundTime, setTurnaroundTime] = useState<number>(3);
  const [turnaroundUnit, setTurnaroundUnit] = useState<'In Days' | 'In Hours'>('In Days');
  const [priority, setPriority] = useState<Priority>('High');
  const [address, setAddress] = useState('Mindspace IT Park, Building 4, Airoli, Navi Mumbai');
  const [noticePeriod, setNoticePeriod] = useState('30 Days');

  // Section 2: Skills & Qualifications
  const [industry, setIndustry] = useState('Information Technology');
  const [degree, setDegree] = useState("Bachelor's Degree");
  const [minExperience, setMinExperience] = useState<number>(5);
  const [maxExperience, setMaxExperience] = useState<number>(8);
  const [primarySkills, setPrimarySkills] = useState<string[]>(['React', 'TypeScript', 'Node.js']);
  const [newPrimarySkill, setNewPrimarySkill] = useState('');
  const [secondarySkills, setSecondarySkills] = useState<string[]>(['PostgreSQL', 'AWS', 'Docker']);
  const [newSecondarySkill, setNewSecondarySkill] = useState('');

  // Section 3: Organizational Information
  const [openings, setOpenings] = useState<number>(2);
  const [maxSubmissions, setMaxSubmissions] = useState<number>(15);
  const [salesManager, setSalesManager] = useState('Rajesh Ramanathan');
  const [recruitmentManager, setRecruitmentManager] = useState('Priya Sharma');
  const [accountManager, setAccountManager] = useState('David Chen');
  const [assignedRecruiter, setAssignedRecruiter] = useState('Priya Sharma');
  const [assignedTo, setAssignedTo] = useState('Priya Sharma');
  const [comments, setComments] = useState('Priority role for Q4 hiring quota. Fast-track client interview.');
  const [additionalNotifications, setAdditionalNotifications] = useState('Email & Slack Alert');
  const [careerPortalPublishedDate, setCareerPortalPublishedDate] = useState(new Date().toISOString().split('T')[0]);

  // Section 4: Description & Career Portal
  const [description, setDescription] = useState('');
  const [postJobOnCareerPortal, setPostJobOnCareerPortal] = useState(true);
  const [secondarySalesManager, setSecondarySalesManager] = useState('Marcus Vance');
  const [secondaryRecruitmentManager, setSecondaryRecruitmentManager] = useState('Elena Rostova');

  // Section 5: Custom Fields
  const [costCenter, setCostCenter] = useState('CC-TECH-901');
  const [departmentCode, setDepartmentCode] = useState('DEP-DIGITAL');
  const [poNumber, setPoNumber] = useState('PO-2026-441');

  // Primary Skills Tag Handlers
  const handleAddPrimarySkill = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'key' in e && e.key !== 'Enter') return;
    if (newPrimarySkill.trim() && !primarySkills.includes(newPrimarySkill.trim())) {
      setPrimarySkills([...primarySkills, newPrimarySkill.trim()]);
      setNewPrimarySkill('');
    }
  };

  const handleRemovePrimarySkill = (sk: string) => {
    setPrimarySkills(primarySkills.filter((s) => s !== sk));
  };

  // Secondary Skills Tag Handlers
  const handleAddSecondarySkill = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'key' in e && e.key !== 'Enter') return;
    if (newSecondarySkill.trim() && !secondarySkills.includes(newSecondarySkill.trim())) {
      setSecondarySkills([...secondarySkills, newSecondarySkill.trim()]);
      setNewSecondarySkill('');
    }
  };

  const handleRemoveSecondarySkill = (sk: string) => {
    setSecondarySkills(secondarySkills.filter((s) => s !== sk));
  };

  // Pre-configured Industry Templates (Faithful to Ceipal 5.2.2)
  const templatesList = [
    {
      id: 'software-developer',
      label: 'Software Developer (Full Stack / Java / Python)',
      title: 'Software Developer',
      category: 'IT Software',
      industry: 'Information Technology',
      primarySkills: ['Java', 'Spring Boot', 'SQL', 'Microservices', 'REST APIs'],
      secondarySkills: ['Docker', 'Kubernetes', 'Git', 'Jenkins'],
      minExp: 4,
      maxExp: 7,
      billRate: 125,
      payRate: 95,
      type: 'Full-Time' as JobType,
      description: `Hello,\n\nGreetings from ${businessUnit}.\n\nI came across your profile and wanted to reach out regarding a unique opportunity. I work for ${businessUnit}, and we're looking to hire a Software Developer. I think your experience is a great fit for this role. Please find the Job Description below for your reference:\n\nJob Title: Software Developer\nLocation: Bangalore / Mumbai (Hybrid)\nSkill Set: Core Java, Microservices, Spring Boot, REST APIs, SQL\nExperience: 4 - 7 Years\n\nLooking forward to speaking with you soon.`
    },
    {
      id: 'fullstack-lead',
      label: 'Senior Full Stack Lead (React, Node.js, TypeScript)',
      title: 'Senior Full Stack Lead (React, Node.js, TypeScript)',
      category: 'IT Software',
      industry: 'Banking & Financial Services',
      primarySkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
      secondarySkills: ['GraphQL', 'AWS ECS', 'Jest', 'CI/CD'],
      minExp: 6,
      maxExp: 10,
      billRate: 145,
      payRate: 110,
      type: 'Full-Time' as JobType,
      description: `Lead architecture and engineering for modern responsive cloud applications. Responsible for micro-frontends, high-performance UI components, and resilient backend REST/GraphQL services.`
    },
    {
      id: 'cloud-architect',
      label: 'Principal Cloud AI Architect (AWS / Kubernetes)',
      title: 'Principal Cloud AI Architect (AWS / Kubernetes)',
      category: 'Big Data & Cloud',
      industry: 'Cloud Infrastructure & SaaS',
      primarySkills: ['AWS', 'Kubernetes', 'Terraform', 'MLOps', 'Distributed Storage'],
      secondarySkills: ['vLLM', 'Golang', 'Prometheus', 'Helm'],
      minExp: 8,
      maxExp: 14,
      billRate: 165,
      payRate: 125,
      type: 'Contract' as JobType,
      description: `Architect multi-region cloud topology for GenAI enterprise models, LLM serving clusters, and zero-downtime scaling across AWS and Kubernetes environments.`
    },
    {
      id: 'trading-ops',
      label: 'Trading Systems Ops Specialist _DK',
      title: 'Trading Systems Ops Specialist _DK',
      category: 'FinTech Operations',
      industry: 'Financial Services',
      primarySkills: ['Linux/Unix', 'Bash Scripting', 'SQL', 'FIX Protocol', 'Incident Mgmt'],
      secondarySkills: ['Geneos', 'Python', 'TCP/IP', 'Kafka'],
      minExp: 5,
      maxExp: 9,
      billRate: 135,
      payRate: 100,
      type: 'Full-Time' as JobType,
      description: `Mission-critical electronic trading operations specialist overseeing algorithmic order routing, low-latency execution engines, and market feed telemetry.`
    }
  ];

  // Apply Selected Template
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateKey(templateId);
    const tpl = templatesList.find(t => t.id === templateId);
    if (!tpl) return;

    setTitle(tpl.title);
    setCategory(tpl.category);
    setIndustry(tpl.industry);
    setPrimarySkills([...tpl.primarySkills]);
    setSecondarySkills([...tpl.secondarySkills]);
    setMinExperience(tpl.minExp);
    setMaxExperience(tpl.maxExp);
    setBillRate(tpl.billRate);
    setPayRate(tpl.payRate);
    setType(tpl.type);
    setDescription(tpl.description);
  };

  // AI Parse Job Details (Faithful to Ceipal 5.2.3)
  const handleParseJobDetails = () => {
    if (!rawJdText.trim()) return;

    // Intelligent extraction simulation
    let extractedTitle = 'Extracted Software Engineer';
    let extractedPrimary = ['React', 'TypeScript', 'Node.js', 'PostgreSQL'];
    let extractedCategory = 'IT Software';
    let extractedMin = 4;
    let extractedMax = 8;
    let extractedRate = 135;

    const lower = rawJdText.toLowerCase();
    if (lower.includes('cloud') || lower.includes('aws') || lower.includes('kubernetes')) {
      extractedTitle = 'Senior Cloud Infrastructure Engineer';
      extractedPrimary = ['AWS', 'Kubernetes', 'Terraform', 'Linux', 'Docker'];
      extractedCategory = 'Big Data & Cloud';
      extractedRate = 150;
    } else if (lower.includes('data') || lower.includes('spark') || lower.includes('python')) {
      extractedTitle = 'Lead Data Platform Engineer';
      extractedPrimary = ['PySpark', 'Python', 'Databricks', 'SQL', 'GCP'];
      extractedCategory = 'Big Data & Cloud';
      extractedRate = 145;
    } else if (lower.includes('qa') || lower.includes('test') || lower.includes('automation')) {
      extractedTitle = 'Senior QA Automation Specialist';
      extractedPrimary = ['Playwright', 'Selenium', 'Java', 'API Testing'];
      extractedCategory = 'QA Testing';
      extractedRate = 120;
    }

    setTitle(extractedTitle);
    setPrimarySkills(extractedPrimary);
    setCategory(extractedCategory);
    setMinExperience(extractedMin);
    setMaxExperience(extractedMax);
    setBillRate(extractedRate);
    setPayRate(Math.round(extractedRate * 0.75));
    setDescription(rawJdText);
    setCreationMode('manual');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Job Title is required.');
      return;
    }

    setIsSubmitting(true);

    const allSkills = Array.from(new Set([...primarySkills, ...secondarySkills]));

    await ApiService.createJob({
      title,
      client,
      clientId: 'cli-1',
      businessUnit,
      location,
      type,
      status,
      priority,
      openings: Number(openings),
      billRate: Number(billRate),
      payRate: Number(payRate),
      experienceRequired: `${minExperience}-${maxExperience} Years`,
      assignedRecruiter,
      recruiterId: 'usr-3',
      description,
      skills: allSkills,

      // Ceipal attributes
      clientJobId,
      facility,
      currency,
      rateType,
      startDate,
      endDate,
      category,
      skillType,
      respondBy,
      remoteJob,
      states,
      duration,
      clientManager,
      turnaroundTime,
      turnaroundUnit,
      address,
      noticePeriod,
      industry,
      degree,
      minExperience,
      maxExperience,
      primarySkills,
      secondarySkills,
      maxSubmissions,
      salesManager,
      recruitmentManager,
      accountManager,
      assignedTo,
      comments,
      additionalNotifications,
      careerPortalPublishedDate,
      postJobOnCareerPortal,
      secondarySalesManager,
      secondaryRecruitmentManager,
      costCenter,
      departmentCode,
      poNumber
    });

    setIsSubmitting(false);
    navigate('jobs');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in">
      {/* Top Header & Navigation Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE6EF] dark:border-[#354A5C] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (creationMode !== 'select') {
                setCreationMode('select');
              } else {
                navigate('jobs');
              }
            }}
            className="p-2 rounded-xl bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] text-[#5E6B7A] dark:text-[#B9CAD9] hover:text-[#1769AA] hover:bg-[#EAF4FC] transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EAF4FC] dark:bg-[#083F70] text-[#1769AA] dark:text-[#D8E9F7]">
                Job Posting Management
              </span>
              <span className="text-xs font-mono font-bold text-[#7A8794]">
                {code}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-[#202B37] dark:text-white mt-0.5">
              {creationMode === 'select' && 'New Job Posting'}
              {creationMode === 'manual' && 'Manual Job Creation'}
              {creationMode === 'template' && 'Job Template Blueprint'}
              {creationMode === 'parse' && 'Parse Job Details'}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {creationMode !== 'select' && (
            <button
              type="button"
              onClick={() => setCreationMode('select')}
              className="px-3 py-2 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl text-xs font-semibold text-[#5E6B7A] dark:text-[#B9CAD9] hover:bg-[#EAF4FC] transition-colors"
            >
              Switch Method
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('jobs')}
            className="px-3.5 py-2 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl text-xs font-semibold text-[#5E6B7A] dark:text-[#B9CAD9] hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          {creationMode === 'manual' && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#2F80E7] hover:bg-[#216BC4] text-white rounded-xl text-xs font-bold shadow-xs shadow-[#2F80E7]/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing...' : 'Save & Publish'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CEIPAL 3-METHOD SELECTION SCREEN (media_1794558512745_31ee4c3d.png) */}
      {/* ========================================================================= */}
      {creationMode === 'select' && (
        <div className="p-8 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-3xl shadow-xs text-center space-y-8">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-display font-bold text-[#202B37] dark:text-white">
              Create New Job
            </h2>
            <p className="text-xs text-[#5E6B7A] dark:text-[#B9CAD9] mt-1">
              Select one of the 3 standard Ceipal ingestion pathways to initiate a new job requisition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
            {/* 1. Manual Creation */}
            <div
              onClick={() => setCreationMode('manual')}
              className="p-6 rounded-2xl border-2 border-[#DCE6EF] dark:border-[#354A5C] hover:border-[#1769AA] bg-[#F5F8FB] dark:bg-[#162431] hover:bg-white dark:hover:bg-[#1B2936] hover:shadow-xl hover:shadow-[#1769AA]/10 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#1769AA]/10 text-[#1769AA] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-[#202B37] dark:text-white group-hover:text-[#1769AA] transition-colors">
                  5.2.1 Manual Creation
                </h3>
                <p className="text-xs text-[#5E6B7A] dark:text-[#B9CAD9] mt-2 leading-relaxed">
                  Complete manual specification form with facility codes, client billing, rate cards, skills, and managerial allocations.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-bold text-[#1769AA] group-hover:translate-x-1 transition-transform">
                <span>Start Manual Entry</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* 2. Job Template */}
            <div
              onClick={() => setCreationMode('template')}
              className="p-6 rounded-2xl border-2 border-[#DCE6EF] dark:border-[#354A5C] hover:border-[#1769AA] bg-[#F5F8FB] dark:bg-[#162431] hover:bg-white dark:hover:bg-[#1B2936] hover:shadow-xl hover:shadow-[#1769AA]/10 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#1769AA]/10 text-[#1769AA] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Copy className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-[#202B37] dark:text-white group-hover:text-[#1769AA] transition-colors">
                  5.2.2 Job Template
                </h3>
                <p className="text-xs text-[#5E6B7A] dark:text-[#B9CAD9] mt-2 leading-relaxed">
                  1-Click pre-fill from tested industry requisition blueprints (Software Developer, Cloud Architect, Full Stack, SRE).
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-bold text-[#1769AA] group-hover:translate-x-1 transition-transform">
                <span>Browse Templates</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* 3. Parse Job Details */}
            <div
              onClick={() => setCreationMode('parse')}
              className="p-6 rounded-2xl border-2 border-[#DCE6EF] dark:border-[#354A5C] hover:border-[#2F80E7] bg-[#F5F8FB] dark:bg-[#162431] hover:bg-white dark:hover:bg-[#1B2936] hover:shadow-xl hover:shadow-[#2F80E7]/10 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#2F80E7]/10 text-[#2F80E7] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-[#202B37] dark:text-white group-hover:text-[#2F80E7] transition-colors">
                  5.2.3 Parse Job Details
                </h3>
                <p className="text-xs text-[#5E6B7A] dark:text-[#B9CAD9] mt-2 leading-relaxed">
                  Paste raw client requirement emails or copy-pasted briefs. Automatically extracts title, tech stack, experience, and rates.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-bold text-[#2F80E7] group-hover:translate-x-1 transition-transform">
                <span>Paste &amp; Parse</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. JOB TEMPLATE SELECTOR (media_1794558557697_1622e78b.png) */}
      {/* ========================================================================= */}
      {creationMode === 'template' && (
        <div className="bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#DCE6EF] dark:border-[#354A5C]">
            <div>
              <h2 className="text-lg font-bold text-[#202B37] dark:text-white">
                5.2.2 Job Template Selection
              </h2>
              <p className="text-xs text-[#5E6B7A] dark:text-[#B9CAD9] mt-0.5">
                Choose your Business Unit and standard role template to auto-populate all requisition fields.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1.5">
                Business Unit
              </label>
              <select
                value={businessUnit}
                onChange={(e) => setBusinessUnit(e.target.value)}
                className="w-full p-2.5 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl text-xs font-semibold text-[#202B37] dark:text-white"
              >
                <option value="Ampcus Tech Pvt Ltd.">Ampcus Tech Pvt Ltd.</option>
                <option value="Cloud & AI Practice">Cloud &amp; AI Practice</option>
                <option value="Core Engineering">Core Engineering</option>
                <option value="Fintech & Enterprise">Fintech &amp; Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1.5">
                Job Templates *
              </label>
              <select
                value={selectedTemplateKey}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="w-full p-2.5 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl text-xs font-semibold text-[#202B37] dark:text-white focus:ring-2 focus:ring-[#1769AA]/20 focus:border-[#1769AA]"
              >
                <option value="">-- Select Template --</option>
                {templatesList.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedTemplateKey && (
            <div className="p-5 rounded-2xl bg-[#EAF4FC] dark:bg-[#083F70]/40 border border-[#1769AA]/30 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1769AA] dark:text-[#D8E9F7]">
                    Template Pre-filled Preview
                  </span>
                  <h3 className="text-base font-bold text-[#202B37] dark:text-white mt-0.5">
                    {title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCreationMode('manual')}
                  className="px-4 py-2 bg-[#1769AA] hover:bg-[#12578E] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Edit in Full Form</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1B2936] text-[#202B37] dark:text-white font-semibold border border-[#DCE6EF] dark:border-[#354A5C]">
                  Industry: {industry}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1B2936] text-[#202B37] dark:text-white font-semibold border border-[#DCE6EF] dark:border-[#354A5C]">
                  Experience: {minExperience} - {maxExperience} Years
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1B2936] text-[#202B37] dark:text-white font-semibold border border-[#DCE6EF] dark:border-[#354A5C]">
                  Bill Rate: ${billRate}/hr
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-[#5E6B7A] dark:text-[#B9CAD9]">Primary Skills:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {primarySkills.map((sk, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-[#1769AA]/10 text-[#1769AA] dark:text-[#8CBCE8] font-bold text-xs">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-[#5E6B7A] dark:text-[#B9CAD9]">Description Blueprint:</span>
                <pre className="p-3 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl text-xs text-[#202B37] dark:text-[#F5F8FB] font-sans whitespace-pre-wrap mt-1 max-h-36 overflow-y-auto">
                  {description}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PARSE JOB DETAILS SCREEN (media_1794558595058_2fb8155c.png) */}
      {/* ========================================================================= */}
      {creationMode === 'parse' && (
        <div className="bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#DCE6EF] dark:border-[#354A5C]">
            <div>
              <h2 className="text-lg font-bold text-[#202B37] dark:text-white">
                5.2.3 Parse Job Details
              </h2>
              <p className="text-xs text-[#5E6B7A] dark:text-[#B9CAD9] mt-0.5">
                Paste the raw job requirement text or client email to extract parameters directly.
              </p>
            </div>
          </div>

          <div className="max-w-xs">
            <label className="block text-xs font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1.5">
              Business Unit
            </label>
            <select
              value={businessUnit}
              onChange={(e) => setBusinessUnit(e.target.value)}
              className="w-full p-2.5 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl text-xs font-semibold text-[#202B37] dark:text-white"
            >
              <option value="Ampcus Tech Pvt Ltd.">Ampcus Tech Pvt Ltd.</option>
              <option value="Cloud & AI Practice">Cloud &amp; AI Practice</option>
              <option value="Core Engineering">Core Engineering</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#202B37] dark:text-[#F5F8FB]">
              Paste Job Details *
            </label>
            <textarea
              rows={10}
              value={rawJdText}
              onChange={(e) => setRawJdText(e.target.value)}
              placeholder="Example: We need a Senior Full Stack Developer in Mumbai. Must know React, TypeScript, Node.js, and AWS ECS. Budget $130-$145/hr. 5+ years experience needed. Candidate will lead development of microservices..."
              className="w-full p-4 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-2xl text-xs font-mono text-[#202B37] dark:text-white focus:outline-none focus:border-[#2F80E7] focus:ring-2 focus:ring-[#2F80E7]/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCreationMode('select')}
              className="px-4 py-2 text-xs font-semibold text-[#5E6B7A] dark:text-[#B9CAD9] hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleParseJobDetails}
              disabled={!rawJdText.trim()}
              className="px-6 py-2.5 bg-[#2F80E7] hover:bg-[#216BC4] text-white rounded-xl text-xs font-bold shadow-md shadow-[#2F80E7]/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Parsing</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MANUAL CREATION ALL CEIPAL FIELDS (media_1794558525216_f124bc83.png etc.) */}
      {/* ========================================================================= */}
      {creationMode === 'manual' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top Business Unit Header Card */}
          <div className="bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-80">
              <label className="block text-xs font-bold text-[#5E6B7A] dark:text-[#B9CAD9] mb-1">
                Business Unit
              </label>
              <select
                value={businessUnit}
                onChange={(e) => setBusinessUnit(e.target.value)}
                className="w-full p-2 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl text-xs font-semibold text-[#202B37] dark:text-white"
              >
                <option value="Ampcus Tech Pvt Ltd.">Ampcus Tech Pvt Ltd.</option>
                <option value="Cloud & AI Practice">Cloud &amp; AI Practice</option>
                <option value="Core Engineering">Core Engineering</option>
                <option value="Fintech & Enterprise">Fintech &amp; Enterprise</option>
              </select>
            </div>

            {/* Form Section Quick Jump Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {[
                { id: 'all', label: 'All Fields' },
                { id: 'details', label: '1. Job Details' },
                { id: 'skills', label: '2. Skills' },
                { id: 'org', label: '3. Organizational' },
                { id: 'description', label: '4. Description' }
              ].map(sec => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveFormSection(sec.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    activeFormSection === sec.id
                      ? 'bg-[#1769AA] text-white shadow-xs'
                      : 'bg-[#F5F8FB] dark:bg-[#162431] text-[#5E6B7A] dark:text-[#B9CAD9] hover:text-[#202B37]'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 1: JOB DETAILS (Ceipal Section 1) */}
          {(activeFormSection === 'all' || activeFormSection === 'details') && (
            <div className="bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#DCE6EF] dark:border-[#354A5C]">
                <div className="w-8 h-8 rounded-lg bg-[#1769AA]/10 text-[#1769AA] flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#202B37] dark:text-white uppercase tracking-wider">
                    Job Details
                  </h3>
                  <p className="text-[11px] text-[#5E6B7A] dark:text-[#B9CAD9]">
                    Requisition identity, billing schedule, location, and client specifications
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Row 1 */}
                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Job Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2.5 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-mono font-bold text-[#1769AA] dark:text-[#8CBCE8]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Facility</label>
                  <select
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium text-[#202B37] dark:text-white"
                  >
                    <option value="Offshore Development Center">Offshore Development Center</option>
                    <option value="Client Onsite HQ">Client Onsite HQ</option>
                    <option value="Corporate Office">Corporate Office</option>
                    <option value="Remote Facility">Remote Facility</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Software Engineer (React / Node)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-bold text-[#202B37] dark:text-white focus:ring-2 focus:ring-[#1769AA]/20"
                  />
                </div>

                {/* Row 2: Client Bill Rate / Salary */}
                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">
                    Client Bill Rate / Salary
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-20 p-2.5 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-bold text-xs"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={billRate}
                      onChange={(e) => setBillRate(Number(e.target.value))}
                      className="flex-1 p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-bold text-xs"
                    />
                    <select
                      value={rateType}
                      onChange={(e) => setRateType(e.target.value as any)}
                      className="w-24 p-2.5 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-semibold text-xs"
                    >
                      <option value="Hourly">Hourly</option>
                      <option value="Yearly">Yearly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Job Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Job End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  />
                </div>

                {/* Row 3 */}
                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Job Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  >
                    <option value="IT Software">IT Software</option>
                    <option value="Big Data & Cloud">Big Data &amp; Cloud</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="FinTech Operations">FinTech Operations</option>
                    <option value="QA Testing">QA Testing</option>
                    <option value="Healthcare Tech">Healthcare Tech</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Job Skill Type *</label>
                  <select
                    value={skillType}
                    onChange={(e) => setSkillType(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Functional">Functional</option>
                    <option value="Techno-Functional">Techno-Functional</option>
                    <option value="Leadership">Leadership</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Respond By</label>
                  <select
                    value={respondBy}
                    onChange={(e) => setRespondBy(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  >
                    <option value="Open Until Filled">Open Until Filled</option>
                    <option value="Within 7 Days">Within 7 Days</option>
                    <option value="Immediate SLA (24h)">Immediate SLA (24h)</option>
                  </select>
                </div>

                {/* Row 4: Remote Job Radio & Location */}
                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-2">Remote Job</label>
                  <div className="flex items-center gap-4 pt-1">
                    {(['Yes', 'No', 'Hybrid'] as const).map((r) => (
                      <label key={r} className="flex items-center gap-1.5 cursor-pointer font-medium text-xs">
                        <input
                          type="radio"
                          name="remoteJob"
                          value={r}
                          checked={remoteJob === r}
                          onChange={() => setRemoteJob(r)}
                          className="text-[#1769AA]"
                        />
                        <span>{r}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">States *</label>
                  <input
                    type="text"
                    value={states}
                    onChange={(e) => setStates(e.target.value)}
                    placeholder="e.g. Maharashtra, Karnataka, CA"
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Search Location with City or Zip Code"
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  />
                </div>

                {/* Row 5 */}
                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Job Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-bold text-[#1769AA]"
                  >
                    <option value="Active">Active</option>
                    <option value="Sourcing">Sourcing</option>
                    <option value="In Review">In Review</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Job Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="C2H">C2H</option>
                    <option value="C2C">C2C</option>
                    <option value="Part-Time">Part-Time</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 6 Months, Permanent"
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  />
                </div>

                {/* Row 6: Client details */}
                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Client *</label>
                  <input
                    type="text"
                    required
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="Search for a Client"
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-bold text-[#1769AA]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Client Manager</label>
                  <input
                    type="text"
                    value={clientManager}
                    onChange={(e) => setClientManager(e.target.value)}
                    placeholder="Client point of contact"
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Client Job ID</label>
                  <input
                    type="text"
                    value={clientJobId}
                    onChange={(e) => setClientJobId(e.target.value)}
                    placeholder="e.g. MOR4JP00025875"
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-mono text-xs"
                  />
                </div>

                {/* Row 7 */}
                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Turnaround Time</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      value={turnaroundTime}
                      onChange={(e) => setTurnaroundTime(Number(e.target.value))}
                      className="w-24 p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-bold"
                    />
                    <select
                      value={turnaroundUnit}
                      onChange={(e) => setTurnaroundUnit(e.target.value as any)}
                      className="flex-1 p-2.5 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                    >
                      <option value="In Days">In Days</option>
                      <option value="In Hours">In Hours</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Priority *</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-bold text-[#2F80E7]"
                  >
                    <option value="Urgent">🔥 Urgent Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Notice Period</label>
                  <select
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="60 Days">60 Days</option>
                    <option value="90 Days">90 Days</option>
                  </select>
                </div>

                {/* Address */}
                <div className="md:col-span-3">
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Address</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full workplace address"
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: SKILLS & QUALIFICATIONS (Ceipal Section 2) */}
          {(activeFormSection === 'all' || activeFormSection === 'skills') && (
            <div className="bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#DCE6EF] dark:border-[#354A5C]">
                <div className="w-8 h-8 rounded-lg bg-[#1769AA]/10 text-[#1769AA] flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#202B37] dark:text-white uppercase tracking-wider">
                    Skills &amp; Qualifications
                  </h3>
                  <p className="text-[11px] text-[#5E6B7A] dark:text-[#B9CAD9]">
                    Technical domain prerequisites, education degree, experience boundaries, and primary/secondary skill chips
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  >
                    <option value="Information Technology">Information Technology</option>
                    <option value="Banking & Financial Services">Banking &amp; Financial Services</option>
                    <option value="Healthcare & Life Sciences">Healthcare &amp; Life Sciences</option>
                    <option value="Supply Chain & Logistics">Supply Chain &amp; Logistics</option>
                    <option value="Automotive & Manufacturing">Automotive &amp; Manufacturing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Degree</label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  >
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Any Degree">Any Degree</option>
                    <option value="High School">High School</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Experience *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minExperience}
                      onChange={(e) => setMinExperience(Number(e.target.value))}
                      className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-bold"
                    />
                    <span className="text-[#7A8794] font-bold">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxExperience}
                      onChange={(e) => setMaxExperience(Number(e.target.value))}
                      className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-bold"
                    />
                    <span className="text-[#7A8794] font-semibold whitespace-nowrap">Years</span>
                  </div>
                </div>

                {/* Primary Skills Chips */}
                <div className="md:col-span-3 pt-2">
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1.5">
                    Primary Skills * <span className="text-[11px] text-[#5E6B7A] font-normal">(Press Enter to add skill tag)</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add primary skill (e.g. React, Java, AWS, Kubernetes)..."
                      value={newPrimarySkill}
                      onChange={(e) => setNewPrimarySkill(e.target.value)}
                      onKeyDown={handleAddPrimarySkill}
                      className="flex-1 p-2 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddPrimarySkill()}
                      className="px-4 py-2 bg-[#1769AA] text-white rounded-xl text-xs font-bold hover:bg-[#12578E]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {primarySkills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1769AA]/10 text-[#1769AA] dark:text-[#8CBCE8] border border-[#1769AA]/20 rounded-xl font-bold text-xs"
                      >
                        <span>{sk}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePrimarySkill(sk)}
                          className="hover:text-rose-500 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Secondary Skills Chips */}
                <div className="md:col-span-3 pt-2">
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1.5">
                    Secondary Skills <span className="text-[11px] text-[#5E6B7A] font-normal">(Press Enter to add skill tag)</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add secondary skill (e.g. Docker, PostgreSQL, CI/CD)..."
                      value={newSecondarySkill}
                      onChange={(e) => setNewSecondarySkill(e.target.value)}
                      onKeyDown={handleAddSecondarySkill}
                      className="flex-1 p-2 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSecondarySkill()}
                      className="px-4 py-2 bg-[#1769AA] text-white rounded-xl text-xs font-bold hover:bg-[#12578E]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {secondarySkills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1769AA]/10 text-[#1769AA] dark:text-[#8CBCE8] border border-[#1769AA]/20 rounded-xl font-bold text-xs"
                      >
                        <span>{sk}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSecondarySkill(sk)}
                          className="hover:text-rose-500 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: ORGANIZATIONAL INFORMATION (Ceipal Section 3) */}
          {(activeFormSection === 'all' || activeFormSection === 'org') && (
            <div className="bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#DCE6EF] dark:border-[#354A5C]">
                <div className="w-8 h-8 rounded-lg bg-[#1769AA]/10 text-[#1769AA] flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#202B37] dark:text-white uppercase tracking-wider">
                    Organizational Information
                  </h3>
                  <p className="text-[11px] text-[#5E6B7A] dark:text-[#B9CAD9]">
                    Capacity parameters, management routing, account executive ownership, and notifications
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Number of Positions *</label>
                  <input
                    type="number"
                    min={1}
                    value={openings}
                    onChange={(e) => setOpenings(Number(e.target.value))}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Maximum Allowed Submissions</label>
                  <input
                    type="number"
                    value={maxSubmissions}
                    onChange={(e) => setMaxSubmissions(Number(e.target.value))}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Sales Manager</label>
                  <select
                    value={salesManager}
                    onChange={(e) => setSalesManager(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  >
                    <option value="Rajesh Ramanathan">Rajesh Ramanathan</option>
                    <option value="Elena Rostova">Elena Rostova</option>
                    <option value="Marcus Vance">Marcus Vance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Recruitment Manager *</label>
                  <select
                    value={recruitmentManager}
                    onChange={(e) => setRecruitmentManager(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  >
                    <option value="Priya Sharma">Priya Sharma</option>
                    <option value="Rajesh Ramanathan">Rajesh Ramanathan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Account Manager *</label>
                  <select
                    value={accountManager}
                    onChange={(e) => setAccountManager(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  >
                    <option value="David Chen">David Chen</option>
                    <option value="Siddharth Roy">Siddharth Roy</option>
                    <option value="Priya Nambiar">Priya Nambiar</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Assigned To *</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => {
                      setAssignedTo(e.target.value);
                      setAssignedRecruiter(e.target.value);
                    }}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-bold text-[#1769AA]"
                  >
                    <option value="Priya Sharma">Priya Sharma</option>
                    <option value="Marcus Vance">Marcus Vance</option>
                    <option value="Sagar Nehe">Sagar Nehe</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Primary Recruiter</label>
                  <select
                    value={assignedRecruiter}
                    onChange={(e) => setAssignedRecruiter(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  >
                    <option value="Priya Sharma">Priya Sharma</option>
                    <option value="Marcus Vance">Marcus Vance</option>
                    <option value="Sagar Nehe">Sagar Nehe</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Additional Notifications</label>
                  <input
                    type="text"
                    value={additionalNotifications}
                    onChange={(e) => setAdditionalNotifications(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Career Portal Published Date</label>
                  <input
                    type="date"
                    value={careerPortalPublishedDate}
                    onChange={(e) => setCareerPortalPublishedDate(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block font-bold text-[#202B37] dark:text-[#F5F8FB] mb-1">Comments / Sourcing Instructions</label>
                  <textarea
                    rows={2}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Recruitment team guidance and screening remarks..."
                    className="w-full p-2.5 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: JOB DESCRIPTION & PUBLISHING (Ceipal Section 4) */}
          {(activeFormSection === 'all' || activeFormSection === 'description') && (
            <div className="bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#DCE6EF] dark:border-[#354A5C]">
                <div className="w-8 h-8 rounded-lg bg-[#2F80E7]/10 text-[#2F80E7] flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#202B37] dark:text-white uppercase tracking-wider">
                    Job Description &amp; Career Portal
                  </h3>
                  <p className="text-[11px] text-[#5E6B7A] dark:text-[#B9CAD9]">
                    Complete job specification, candidate-facing outreach email, and public portal publishing
                  </p>
                </div>
              </div>

              {/* Description Toolbar & Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#202B37] dark:text-[#F5F8FB]">
                    Job Description *
                  </label>
                  <div className="flex items-center gap-1 p-1 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-lg">
                    <button type="button" className="p-1 rounded hover:bg-white dark:hover:bg-[#1B2936] text-[#5E6B7A]" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1 rounded hover:bg-white dark:hover:bg-[#1B2936] text-[#5E6B7A]" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1 rounded hover:bg-white dark:hover:bg-[#1B2936] text-[#5E6B7A]" title="Bullet List"><List className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1 rounded hover:bg-white dark:hover:bg-[#1B2936] text-[#5E6B7A]" title="Numbered List"><ListOrdered className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                <textarea
                  rows={8}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed scope of work, technical environment, deliverables, and role responsibilities..."
                  className="w-full p-4 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-2xl text-xs font-sans text-[#202B37] dark:text-white focus:outline-none focus:border-[#1769AA]"
                />
              </div>

              {/* Career Portal Toggle & Secondary Managers */}
              <div className="pt-2 border-t border-[#DCE6EF] dark:border-[#354A5C] grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-xs">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-[#202B37] dark:text-white">
                    <input
                      type="checkbox"
                      checked={postJobOnCareerPortal}
                      onChange={(e) => setPostJobOnCareerPortal(e.target.checked)}
                      className="w-4 h-4 rounded border-[#DCE6EF] text-[#1769AA] focus:ring-[#1769AA]"
                    />
                    <span>Post Job on Career Portal</span>
                  </label>
                  <p className="text-[11px] text-[#5E6B7A] dark:text-[#B9CAD9] pl-6 mt-0.5">
                    Broadcast position to your company careers page
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-[#5E6B7A] dark:text-[#B9CAD9] mb-1">
                    Secondary Sales Manager
                  </label>
                  <select
                    value={secondarySalesManager}
                    onChange={(e) => setSecondarySalesManager(e.target.value)}
                    className="w-full p-2 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  >
                    <option value="Marcus Vance">Marcus Vance</option>
                    <option value="Elena Rostova">Elena Rostova</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#5E6B7A] dark:text-[#B9CAD9] mb-1">
                    Secondary Recruitment Manager
                  </label>
                  <select
                    value={secondaryRecruitmentManager}
                    onChange={(e) => setSecondaryRecruitmentManager(e.target.value)}
                    className="w-full p-2 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-medium"
                  >
                    <option value="Elena Rostova">Elena Rostova</option>
                    <option value="Rajesh Ramanathan">Rajesh Ramanathan</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: USER DEFINED FIELDS */}
          <div className="bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-3xl p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-[#202B37] dark:text-white uppercase tracking-wider">
              5. User Defined Fields
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#5E6B7A] dark:text-[#B9CAD9] mb-1">Cost Center</label>
                <input
                  type="text"
                  value={costCenter}
                  onChange={(e) => setCostCenter(e.target.value)}
                  className="w-full p-2.5 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5E6B7A] dark:text-[#B9CAD9] mb-1">Department Code</label>
                <input
                  type="text"
                  value={departmentCode}
                  onChange={(e) => setDepartmentCode(e.target.value)}
                  className="w-full p-2.5 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5E6B7A] dark:text-[#B9CAD9] mb-1">PO Number</label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full p-2.5 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-2xl shadow-xs">
            <button
              type="button"
              onClick={() => setCreationMode('select')}
              className="px-4 py-2 bg-[#F5F8FB] dark:bg-[#162431] text-[#5E6B7A] dark:text-[#B9CAD9] rounded-xl text-xs font-semibold hover:text-[#202B37]"
            >
              ← Back to Methods
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('jobs')}
                className="px-4 py-2 text-xs font-semibold text-[#5E6B7A] hover:text-[#202B37]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#2F80E7] hover:bg-[#216BC4] text-white rounded-xl text-xs font-bold shadow-md shadow-[#2F80E7]/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Publishing Requisition...' : 'Save & Publish Job Posting'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
