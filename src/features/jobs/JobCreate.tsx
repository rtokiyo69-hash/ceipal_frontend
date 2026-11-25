import React, { useEffect, useRef, useState } from 'react';
import {
  Briefcase,
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
  ListOrdered,
  Underline,
  Upload,
  Eye,
  Mail,
  Check,
  HelpCircle,
  SlidersHorizontal,
  Globe,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Strikethrough,
  Link2,
  Type,
  Undo2,
  Redo2,
  Minus,
  Highlighter,
  RemoveFormatting,
  Table,
  Image,
  ExternalLink,
  Scissors,
  Search,
  Quote,
  Indent,
  Outdent,
  Subscript,
  Superscript,
  Code2,
  CheckSquare,
  RefreshCw,
  Anchor,
  Sparkles,
  Unlink,
  FileCode
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { JobType, Priority, JobStatus } from '../../types';
import { JobDisqualificationReasons } from './JobDisqualificationReasons';
import { JobInterviewSettings } from './JobInterviewSettings';
import { JobLookups } from './JobLookups';
import { JobSettings } from './JobSettings';
import { JobStatuses } from './JobStatuses';
import { JobSummary, KeywordMasking, JobPriorities } from './JobContentSettings';
import './job-posting.css';

interface JobCreateProps {
  initialMode?: 'select' | 'manual' | 'template' | 'parse';
}

const jobPostingSubmodules = [
  'Company Overview',
  'Disqualification Reasons',
  'Interview Settings',
  'Job Lookups',
  'Job Settings',
  'Job Statuses',
  'Job Summary',
  'Keyword Masking',
  'Priorities',
  'ITAR Summary'
] as const;

export const JobCreate: React.FC<JobCreateProps> = ({ initialMode = 'select' }) => {
  const { navigate, currentUser } = useAppStore();
  
  // Creation Flow Mode: 'select' (3-box Ceipal landing) | 'manual' | 'template' | 'parse'
  const [creationMode, setCreationMode] = useState<'select' | 'manual' | 'template' | 'parse'>(initialMode);
  const [activeSubmodule, setActiveSubmodule] = useState<(typeof jobPostingSubmodules)[number]>(jobPostingSubmodules[0]);
  const [companyOverviewTargets, setCompanyOverviewTargets] = useState({
    jobBoards: false,
    candidatePortal: false,
    referralPortal: false
  });
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('');
  const [rawJdText, setRawJdText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFormSection, setActiveFormSection] = useState<'all' | 'details' | 'skills' | 'org' | 'description' | 'custom'>('all');
  const [descriptionRevision, setDescriptionRevision] = useState(0);
  const [documents, setDocuments] = useState<File[]>([]);
  const [documentCategories, setDocumentCategories] = useState<Record<string, string>>({});
  const descriptionEditorRef = useRef<HTMLDivElement>(null);

  // Ceipal Clean CKEditor State (matching user's Ceipal screenshot)
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [selectedFontSize, setSelectedFontSize] = useState('13px');
  const [selectedFormat, setSelectedFormat] = useState('Normal');
  const [selectedStyle, setSelectedStyle] = useState('Styles');
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [editorTextColor, setEditorTextColor] = useState('#1E293B');
  const [editorHighlightColor, setEditorHighlightColor] = useState('#FFFF00');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showTableInput, setShowTableInput] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Ceipal Parse Screen CKEditor State (matching user's screenshot media_1794910793067_a5e40e35.png)
  const parseEditorRef = useRef<HTMLDivElement>(null);
  const [parseFont, setParseFont] = useState('Arial');
  const [parseFontSize, setParseFontSize] = useState('13px');
  const [parseFormat, setParseFormat] = useState('Normal');
  const [parseStyle, setParseStyle] = useState('Styles');
  const [parseSourceMode, setParseSourceMode] = useState(false);
  const [parseTextColor, setParseTextColor] = useState('#1E293B');
  const [parseHighlightColor, setParseHighlightColor] = useState('#FFFF00');
  const [showParseColorPicker, setShowParseColorPicker] = useState(false);
  const [showParseHighlightPicker, setShowParseHighlightPicker] = useState(false);
  const [showParseLinkInput, setShowParseLinkInput] = useState(false);
  const [parseLinkUrl, setParseLinkUrl] = useState('');
  const [showParseTableInput, setShowParseTableInput] = useState(false);
  const [parseTableRows, setParseTableRows] = useState(3);
  const [parseTableCols, setParseTableCols] = useState(3);

  // Ceipal Documents: EXACTLY 3 options (Local Drive, Dropbox, Box - matching user's Ceipal screenshot)
  const [documentSources, setDocumentSources] = useState<Record<string, 'Local Drive' | 'Dropbox' | 'Box'>>({});
  const [activeDocModal, setActiveDocModal] = useState<'dropbox' | 'box' | null>(null);
  const [dropboxSelectedFiles, setDropboxSelectedFiles] = useState<string[]>([]);
  const [boxSelectedFiles, setBoxSelectedFiles] = useState<string[]>([]);

  // Structured Sections State
  const [structOverview, setStructOverview] = useState('');
  const [structResponsibilities, setStructResponsibilities] = useState<string[]>([
    'Architect and implement scalable production services and RESTful APIs',
    'Collaborate closely with cross-functional engineering, UX, and product squads',
    'Ensure code quality through peer code reviews and automated testing'
  ]);
  const [newResponsibility, setNewResponsibility] = useState('');
  const [structQualifications, setStructQualifications] = useState<string[]>([
    'Proven professional engineering experience in modern software stacks',
    'Strong knowledge of relational databases, query optimization, and transactions',
    'Hands-on familiarity with Git, containerization (Docker), and CI/CD pipelines'
  ]);
  const [newQualification, setNewQualification] = useState('');
  const [structBenefits, setStructBenefits] = useState('Comprehensive healthcare, competitive compensation, flexible hybrid schedule, and professional development stipend.');

  // AI Copilot Generator State
  const [aiTone, setAiTone] = useState<'enterprise' | 'modern' | 'executive' | 'specialist'>('enterprise');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Ceipal Feature: Public Job Details (Screenshot 200115 button "Add Public Job Details")
  const [isPublicJdOpen, setIsPublicJdOpen] = useState(false);
  const [publicJobDetails, setPublicJobDetails] = useState('');

  // Ceipal Feature: Candidate Email Pitch Preview Modal (Screenshot 201120 / 201212)
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);

  useEffect(() => {
    if ((creationMode !== 'manual' && creationMode !== 'template') || !descriptionEditorRef.current) return;

    const parsedDescription = new DOMParser().parseFromString(description, 'text/html');
    const allowedTags = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'P', 'DIV', 'BR']);
    const copySafeNodes = (node: Node): Node[] => {
      if (node.nodeType === Node.TEXT_NODE) {
        return [document.createTextNode(node.textContent || '')];
      }
      if (!(node instanceof Element)) return [];

      const children = Array.from(node.childNodes).flatMap(copySafeNodes);
      if (!allowedTags.has(node.tagName)) return children;

      const safeElement = document.createElement(node.tagName.toLowerCase());
      safeElement.append(...children);
      return [safeElement];
    };

    descriptionEditorRef.current.replaceChildren(
      ...Array.from(parsedDescription.body.childNodes).flatMap(copySafeNodes)
    );
  }, [creationMode, descriptionRevision, selectedTemplateKey]);

  const applyDescription = (value: string) => {
    setDescription(value);
    setDescriptionRevision((revision) => revision + 1);
  };

  const formatDescription = (command: string) => {
    const editor = descriptionEditorRef.current;
    if (!editor) return;

    editor.focus();
    document.execCommand(command, false);
    setDescription(editor.innerHTML);
  };

  const handleCompileStructured = () => {
    const parts: string[] = [];
    if (structOverview.trim()) {
      parts.push(`<h3>Role Overview</h3>\n<p>${structOverview.trim()}</p>`);
    }
    if (structResponsibilities.length > 0) {
      parts.push(`<h3>Key Responsibilities:</h3>\n<ul>\n${structResponsibilities.map((r) => `  <li>${r}</li>`).join('\n')}\n</ul>`);
    }
    if (structQualifications.length > 0) {
      parts.push(`<h3>Required Skills &amp; Qualifications:</h3>\n<ul>\n${structQualifications.map((q) => `  <li>${q}</li>`).join('\n')}\n</ul>`);
    }
    if (structBenefits.trim()) {
      parts.push(`<h3>Benefits &amp; Perks:</h3>\n<p>${structBenefits.trim()}</p>`);
    }
    const compiled = parts.join('\n\n');
    applyDescription(compiled);
  };

  const handleAiGenerate = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const jobRole = title.trim() || 'Full Stack Engineer';
      const primaryStr = primarySkills.length > 0 ? primarySkills.join(', ') : 'Python, React, PostgreSQL';
      const expStr = `${minExperience} - ${maxExperience} Years`;
      const generated = `<h3>${jobRole}</h3>
<p><strong>Experience:</strong> ${expStr} | <strong>Location:</strong> ${location} (${remoteJob}) | <strong>Employment Type:</strong> ${type}</p>
<p><strong>About the Role:</strong><br/>${businessUnit} is actively seeking a talented and proactive <strong>${jobRole}</strong> to join our high-growth engineering organization. In this position, you will design, build, and deploy mission-critical solutions using cutting-edge methodologies.</p>

<h3>Key Responsibilities:</h3>
<ul>
  <li>Architect, implement, and maintain scalable applications utilizing <strong>${primaryStr}</strong>.</li>
  <li>Collaborate closely with product managers, UI/UX designers, and backend architects to deliver end-to-end features.</li>
  <li>Write clean, reusable, maintainable code with high test coverage and automated integration checks.</li>
  <li>Analyze performance bottlenecks and optimize database queries for maximum throughput and reliability.</li>
  <li>Participate in agile sprint ceremonies, technical design reviews, and code retrospectives.</li>
</ul>

<h3>Required Skills &amp; Qualifications:</h3>
<ul>
  <li>${expStr} of proven hands-on software development experience.</li>
  <li>Core Technical Stack: <strong>${primaryStr}</strong>.</li>
  <li>Solid grasp of database architecture (PostgreSQL / Relational / NoSQL) and query optimization.</li>
  <li>Experience with version control (Git), Docker containers, and CI/CD automation pipelines.</li>
  <li>Strong problem-solving capability and clear cross-functional communication skills.</li>
</ul>

<h3>Benefits &amp; Compensation:</h3>
<p>${structBenefits}</p>
<p><em>${businessUnit} is an Equal Opportunity Employer. All qualified applicants will receive consideration without regard to race, color, religion, sex, or national origin.</em></p>`;
      applyDescription(generated);
      setIsAiGenerating(false);
    }, 500);
  };

  const handleLocalFilesUpload = (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;
    setDocuments(prev => [...prev, ...fileList.filter(f => !prev.some(p => p.name === f.name))]);
    const updatedSources = { ...documentSources };
    const updatedCats = { ...documentCategories };
    fileList.forEach(f => {
      updatedSources[f.name] = 'Local Drive';
      if (!updatedCats[f.name]) {
        updatedCats[f.name] = 'Client Job Spec (SOW)';
      }
    });
    setDocumentSources(updatedSources);
    setDocumentCategories(updatedCats);
  };

  const handleAttachCloudFiles = (sourceName: 'Dropbox' | 'Box', files: { name: string; size: number; type: string; category: string }[]) => {
    const newFiles = files.map(f => {
      const blob = new Blob([`Simulated document content for ${f.name} from ${sourceName}`], { type: f.type });
      return new File([blob], f.name, { type: f.type, lastModified: Date.now() });
    });
    setDocuments(prev => [...prev, ...newFiles.filter(nf => !prev.some(p => p.name === nf.name))]);
    const updatedSources = { ...documentSources };
    const updatedCats = { ...documentCategories };
    files.forEach(f => {
      updatedSources[f.name] = sourceName;
      updatedCats[f.name] = f.category;
    });
    setDocumentSources(updatedSources);
    setDocumentCategories(updatedCats);
    setActiveDocModal(null);
    setDropboxSelectedFiles([]);
    setBoxSelectedFiles([]);
  };

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
    applyDescription(tpl.description);
  };

  // AI Parse Job Details (Faithful to Ceipal 5.2.3 and media_1794910793067_a5e40e35.png)
  const handleParseJobDetails = () => {
    let sourceContent = rawJdText;
    if (parseEditorRef.current && parseEditorRef.current.innerHTML && parseEditorRef.current.innerHTML.trim() !== '' && parseEditorRef.current.innerHTML !== '<p><br></p>') {
      sourceContent = parseEditorRef.current.innerHTML;
    }
    if (!sourceContent.trim()) {
      alert('Please enter or paste job details to parse.');
      return;
    }

    // Convert HTML to plain text for pattern matching
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sourceContent;
    const plainText = tempDiv.textContent || tempDiv.innerText || sourceContent;
    const lower = plainText.toLowerCase();

    // Intelligent extraction defaults
    let extractedTitle = 'Senior Full Stack Software Engineer';
    let extractedPrimary = ['React', 'TypeScript', 'Node.js', 'PostgreSQL'];
    let extractedCategory = 'IT Software';
    let extractedMin = 4;
    let extractedMax = 8;
    let extractedRate = 135;

    // Title extraction heuristics
    const titleRegex = /(?:title|position|role|job title|opening for|hiring for)[:\s]+([^\n\r,.;]{3,50})/i;
    const titleMatch = plainText.match(titleRegex);
    if (titleMatch && titleMatch[1]?.trim()) {
      extractedTitle = titleMatch[1].trim();
    } else if (lower.includes('cloud') || lower.includes('aws') || lower.includes('devops') || lower.includes('kubernetes')) {
      extractedTitle = 'Senior Cloud Infrastructure Engineer';
      extractedPrimary = ['AWS', 'Kubernetes', 'Terraform', 'Linux', 'Docker'];
      extractedCategory = 'Big Data & Cloud';
      extractedRate = 150;
    } else if (lower.includes('data') || lower.includes('spark') || lower.includes('python') || lower.includes('snowflake')) {
      extractedTitle = 'Lead Data Platform Engineer';
      extractedPrimary = ['PySpark', 'Python', 'Databricks', 'SQL', 'GCP'];
      extractedCategory = 'Big Data & Cloud';
      extractedRate = 145;
    } else if (lower.includes('qa') || lower.includes('test') || lower.includes('automation') || lower.includes('selenium')) {
      extractedTitle = 'Senior QA Automation Specialist';
      extractedPrimary = ['Playwright', 'Selenium', 'Java', 'API Testing'];
      extractedCategory = 'QA Testing';
      extractedRate = 120;
    } else if (lower.includes('frontend') || lower.includes('react') || lower.includes('ui/ux') || lower.includes('angular')) {
      extractedTitle = 'Senior Frontend Engineer';
      extractedPrimary = ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'];
      extractedCategory = 'IT Software';
      extractedRate = 130;
    } else if (lower.includes('java') || lower.includes('spring')) {
      extractedTitle = 'Senior Java Backend Engineer';
      extractedPrimary = ['Java 17', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Docker'];
      extractedCategory = 'IT Software';
      extractedRate = 140;
    }

    // Experience heuristics
    const expRegex = /(\d+)\s*(?:-|to)\s*(\d+)\s*(?:years|yrs|year)/i;
    const expMatch = plainText.match(expRegex);
    if (expMatch) {
      extractedMin = parseInt(expMatch[1], 10);
      extractedMax = parseInt(expMatch[2], 10);
    } else {
      const singleExpMatch = plainText.match(/(\d+)\+?\s*(?:years|yrs|year)/i);
      if (singleExpMatch) {
        extractedMin = parseInt(singleExpMatch[1], 10);
        extractedMax = extractedMin + 3;
      }
    }

    // Rate heuristics
    const rateRegex = /\$?(\d{2,3})\s*(?:-|\/|to)\s*\$?(\d{2,3})\s*(?:\/hr|hr|per hour|usd)/i;
    const rateMatch = plainText.match(rateRegex);
    if (rateMatch && rateMatch[2]) {
      extractedRate = parseInt(rateMatch[2], 10);
    }

    setTitle(extractedTitle);
    setPrimarySkills(extractedPrimary);
    setCategory(extractedCategory);
    setMinExperience(extractedMin);
    setMaxExperience(extractedMax);
    setBillRate(extractedRate);
    setPayRate(Math.round(extractedRate * 0.75));
    applyDescription(sourceContent);
    setCreationMode('manual');
  };

  const saveJob = async (saveAsDraft = false) => {
    if (!saveAsDraft && !title.trim()) {
      alert('Job Title is required.');
      return;
    }

    const descriptionText = descriptionEditorRef.current?.innerText.trim() || description.trim();
    if (!saveAsDraft && !descriptionText) {
      alert('Job Description is required.');
      return;
    }

    setIsSubmitting(true);

    const allSkills = Array.from(new Set([...primarySkills, ...secondarySkills]));

    try {
      await ApiService.createJob({
        title: title.trim() || 'Untitled Job Draft',
        client,
        clientId: 'cli-1',
        businessUnit,
        location,
        type,
        status: saveAsDraft ? 'Draft' : status,
        priority,
        openings: Number(openings),
        billRate: Number(billRate),
        payRate: Number(payRate),
        experienceRequired: `${minExperience}-${maxExperience} Years`,
        assignedRecruiter,
        recruiterId: 'usr-3',
        description: descriptionEditorRef.current?.innerHTML || description,
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
      }, documents);
      navigate('jobs');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to save the job posting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void saveJob();
  };

  const handleSaveDraft = () => {
    void saveJob(true);
  };

  const handleSubmoduleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex: number;
    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % jobPostingSubmodules.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + jobPostingSubmodules.length) % jobPostingSubmodules.length;
    } else {
      return;
    }

    event.preventDefault();
    setActiveSubmodule(jobPostingSubmodules[nextIndex]);
    event.currentTarget
      .closest('nav')
      ?.querySelectorAll<HTMLButtonElement>('button')[nextIndex]
      ?.focus();
  };

  return (
    <div className={`w-full space-y-3 pb-12 animate-in fade-in ${currentUser?.role === 'admin' && initialMode === 'select' ? 'job-posting-settings' : ''}`}>
      {currentUser?.role === 'admin' && (
        <div className="posting-navigation sticky top-0 z-40 space-y-1 bg-[#FFFFFF] pb-1 dark:bg-[#0F172A]">
          <nav
            aria-label="Job Posting submodules"
            className="flex overflow-x-auto rounded-xl border border-[#D8E3F1] bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-[#1E293B]"
          >
            {jobPostingSubmodules.map((submodule, index) => (
              <button
                key={submodule}
                type="button"
                aria-current={activeSubmodule === submodule ? 'page' : undefined}
                tabIndex={activeSubmodule === submodule ? 0 : -1}
                onClick={() => setActiveSubmodule(submodule)}
                onKeyDown={(event) => handleSubmoduleKeyDown(event, index)}
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
        </div>
      )}

      <div className="posting-content max-w-6xl mx-auto space-y-6">
      {currentUser?.role === 'admin' && initialMode === 'select' && activeSubmodule === 'Company Overview' ? (
        <section className="posting-panel" aria-labelledby="company-overview-heading">
          <div className="posting-panel-heading"><div className="posting-section-icon"><Building2 size={21} /></div><div><h2 id="company-overview-heading">Company overview</h2><p>Introduce your company wherever candidates discover your opportunities.</p></div></div>
          <div className="posting-panel-body">
            <h3 className="posting-field-title">Include company overview on</h3>
            <p className="posting-description">Select the channels where your company overview should appear with a job posting.</p>
            <div className="posting-channel-grid">
              {([
                { key: 'jobBoards', label: 'Job Boards', description: 'Share your company story on external job boards.', icon: Globe },
                { key: 'candidatePortal', label: 'Candidate Portal', description: 'Help applicants learn about your organization.', icon: Building2 },
                { key: 'referralPortal', label: 'Referral Portal', description: 'Give referred candidates context about your team.', icon: Link2 }
              ] as const).map(({ key, label, description, icon: Icon }) => (
                <label key={key} className={`posting-channel ${companyOverviewTargets[key] ? 'is-selected' : ''}`}>
                  <div className="posting-channel-top"><span className="posting-section-icon"><Icon size={22} /></span><input type="checkbox" checked={companyOverviewTargets[key]} onChange={(event) => setCompanyOverviewTargets(current => ({ ...current, [key]: event.target.checked }))} /></div>
                  <strong>{label}</strong><span>{description}</span>
                </label>
              ))}
            </div>
            <div className="posting-note"><HelpCircle size={18} /><span>Choose any combination of channels to match your recruitment workflow.</span></div>
          </div>
        </section>
      ) : currentUser?.role === 'admin' && initialMode === 'select' && activeSubmodule === 'Disqualification Reasons' ? (
        <JobDisqualificationReasons />
      ) : currentUser?.role === 'admin' && initialMode === 'select' && activeSubmodule === 'Interview Settings' ? (
        <JobInterviewSettings />
      ) : currentUser?.role === 'admin' && initialMode === 'select' && activeSubmodule === 'Job Lookups' ? (
        <JobLookups />
      ) : currentUser?.role === 'admin' && initialMode === 'select' && activeSubmodule === 'Job Settings' ? (
        <JobSettings />
      ) : currentUser?.role === 'admin' && initialMode === 'select' && activeSubmodule === 'Job Statuses' ? (
        <JobStatuses />
      ) : currentUser?.role === 'admin' && initialMode === 'select' && activeSubmodule === 'Job Summary' ? (
        <JobSummary key="job-summary" />
      ) : currentUser?.role === 'admin' && initialMode === 'select' && activeSubmodule === 'Keyword Masking' ? (
        <KeywordMasking />
      ) : currentUser?.role === 'admin' && initialMode === 'select' && activeSubmodule === 'Priorities' ? (
        <JobPriorities />
      ) : currentUser?.role === 'admin' && initialMode === 'select' && activeSubmodule === 'ITAR Summary' ? (
        <JobSummary key="itar-summary" itar />
      ) : (
        <>
      {/* Top Header & Navigation Strip */}
      {creationMode === 'select' ? (
        <div className="flex items-center justify-between pb-2">
          <button
            onClick={() => navigate('jobs')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-lg text-xs font-semibold text-[#1E293B] dark:text-white hover:bg-slate-50 dark:hover:bg-[#475569] shadow-2xs hover:shadow transition-all hover:scale-[1.02]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Job Postings</span>
          </button>
        </div>
      ) : creationMode === 'parse' ? (
        <div className="flex items-center justify-between pb-1">
          <button
            type="button"
            onClick={() => setCreationMode('select')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-lg text-xs font-semibold text-[#1E293B] dark:text-white hover:bg-slate-50 dark:hover:bg-[#475569] shadow-2xs hover:shadow transition-all hover:scale-[1.02]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Methods</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8E3F1] dark:border-[#334155] pb-4">
          <div className="flex items-center gap-3">
            {creationMode !== 'manual' && (
              <button
                type="button"
                onClick={() => setCreationMode('select')}
                className="p-2 rounded-xl bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] text-[#64748B] dark:text-[#BFDBFE] hover:text-[#1E293B] hover:bg-[#FFFFFF] transition-colors"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFFFFF] dark:bg-[#24456C] text-[#1E293B] dark:text-[#FFFFFF]">
                  Job Posting Management
                </span>
                <span className="text-xs font-mono font-bold text-[#64748B]">
                  {code}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-[#1E293B] dark:text-white mt-0.5">
                {creationMode === 'manual' && 'Manual Job Creation'}
                {creationMode === 'template' && (selectedTemplateKey ? `New Job from Template: ${title}` : 'Job Template Selection')}
              </h1>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            {creationMode !== 'manual' && (
              <>
                <button
                  type="button"
                  onClick={() => setCreationMode('select')}
                  className="px-3 py-2 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-xs font-semibold text-[#64748B] dark:text-[#BFDBFE] hover:bg-[#FFFFFF] transition-colors"
                >
                  Switch Method
                </button>
                <button
                  type="button"
                  onClick={() => navigate('jobs')}
                  className="px-3.5 py-2 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-xs font-semibold text-[#64748B] dark:text-[#BFDBFE] hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
            {creationMode === 'template' && selectedTemplateKey && (
              <button
                onClick={() => { void saveJob(); }}
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold shadow-xs shadow-[#2563EB]/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Publishing...' : 'Save & Publish'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CEIPAL 3-METHOD SELECTION SCREEN (media_1794837670723_c70a8d91.png) */}
      {/* ========================================================================= */}
      {creationMode === 'select' && (
        <div className="py-12 sm:py-20 flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in zoom-in-95 duration-300">
          {/* Main Title matching Screenshot */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] dark:text-white tracking-tight">
            Create a New Job
          </h1>

          {/* 3 Glassmorphism Cards with Hover Zoom Effects */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-14 w-full max-w-4xl px-4">
            {/* 1. Manual Creation */}
            <div
              onClick={() => setCreationMode('manual')}
              className="group relative flex flex-col items-center justify-center p-8 rounded-3xl cursor-pointer transition-all duration-300 ease-out transform hover:scale-110 hover:-translate-y-2 backdrop-blur-xl bg-white/50 dark:bg-[#1E293B]/50 hover:bg-white/80 dark:hover:bg-[#2563EB]/80 border border-white/80 dark:border-white/10 hover:border-blue-400/50 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 w-64 h-64 select-none"
            >
              {/* Ambient Glow */}
              <div className="absolute inset-0 rounded-3xl bg-radial from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Icon 1: Manual Creation (Exact Screenshot Replica) */}
              <div className="relative transform group-hover:scale-105 transition-transform duration-300">
                <svg viewBox="0 0 140 140" className="w-28 h-28 sm:w-32 sm:h-32 drop-shadow-xl" fill="none">
                  <defs>
                    <filter id="card-shadow-1" x="-10%" y="-10%" width="130%" height="130%">
                      <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.12" />
                    </filter>
                    <filter id="pencil-shadow" x="-20%" y="-20%" width="150%" height="150%">
                      <feDropShadow dx="2" dy="5" stdDeviation="4" floodOpacity="0.2" />
                    </filter>
                    <linearGradient id="sheet-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#FFFFFF" />
                    </linearGradient>
                    <linearGradient id="pencil-body" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FB923C" />
                      <stop offset="100%" stopColor="#EA580C" />
                    </linearGradient>
                  </defs>

                  {/* Back sheet layer for depth */}
                  <rect x="22" y="18" width="76" height="96" rx="18" fill="#E0F2FE" />
                  
                  {/* Front sheet with shadow */}
                  <g filter="url(#card-shadow-1)">
                    <rect x="26" y="22" width="74" height="92" rx="16" fill="url(#sheet-grad)" stroke="#E2E8F0" strokeWidth="1.5" />
                    <rect x="38" y="38" width="36" height="8" rx="4" fill="#1E293B" />
                    <rect x="38" y="54" width="30" height="6" rx="3" fill="#64748B" />
                    <rect x="38" y="68" width="22" height="6" rx="3" fill="#64748B" />
                  </g>

                  {/* 3D Pencil across page */}
                  <g transform="translate(74, 48) rotate(45)" filter="url(#pencil-shadow)">
                    {/* Pencil eraser */}
                    <path d="M-6 -26 h12 a6 6 0 0 1 6 6 v6 h-24 v-6 a6 6 0 0 1 6 -6 z" fill="#0D9488" />
                    {/* Ferrule collar */}
                    <rect x="-12" y="-14" width="24" height="6" rx="1" fill="#FFFFFF" stroke="#D8E3F1" strokeWidth="0.5" />
                    {/* Pencil Body (Orange) */}
                    <rect x="-12" y="-8" width="24" height="34" rx="2" fill="url(#pencil-body)" />
                    {/* Highlight reflection stripe on pencil */}
                    <rect x="-6" y="-8" width="4" height="34" fill="#FED7AA" fillOpacity="0.6" />
                    {/* Wooden sharpened cone */}
                    <path d="M-12 26 L0 46 L12 26 Z" fill="#FDE68A" />
                    {/* Graphite lead tip */}
                    <path d="M-4 39 L0 46 L4 39 Z" fill="#1E293B" />
                  </g>
                </svg>
              </div>

              {/* Ground diffuse shadow */}
              <div className="w-24 h-3 bg-slate-400/25 dark:bg-black/40 rounded-full blur-md mx-auto mt-2 group-hover:scale-115 group-hover:bg-blue-500/30 transition-all duration-300" />

              {/* Label */}
              <h3 className="mt-5 text-sm sm:text-base font-bold text-[#1E293B] dark:text-white group-hover:text-[#1E293B] dark:group-hover:text-[#60A5FA] tracking-tight transition-colors text-center">
                Manual Creation
              </h3>
            </div>

            {/* 2. Use Job Template */}
            <div
              onClick={() => setCreationMode('template')}
              className="group relative flex flex-col items-center justify-center p-8 rounded-3xl cursor-pointer transition-all duration-300 ease-out transform hover:scale-110 hover:-translate-y-2 backdrop-blur-xl bg-white/50 dark:bg-[#1E293B]/50 hover:bg-white/80 dark:hover:bg-[#2563EB]/80 border border-white/80 dark:border-white/10 hover:border-teal-400/50 shadow-xl hover:shadow-2xl hover:shadow-teal-500/20 w-64 h-64 select-none"
            >
              {/* Ambient Glow */}
              <div className="absolute inset-0 rounded-3xl bg-radial from-teal-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Icon 2: Use Job Template (Exact Screenshot Replica) */}
              <div className="relative transform group-hover:scale-105 transition-transform duration-300">
                <svg viewBox="0 0 140 140" className="w-28 h-28 sm:w-32 sm:h-32 drop-shadow-xl" fill="none">
                  <defs>
                    <filter id="card-shadow-2" x="-10%" y="-10%" width="130%" height="130%">
                      <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.12" />
                    </filter>
                    <filter id="badge-shadow" x="-20%" y="-20%" width="150%" height="150%">
                      <feDropShadow dx="1" dy="4" stdDeviation="4" floodOpacity="0.25" />
                    </filter>
                    <linearGradient id="badge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#0F766E" />
                    </linearGradient>
                  </defs>

                  {/* Back sheet tilted */}
                  <rect x="18" y="24" width="76" height="94" rx="18" fill="#E0F2FE" transform="rotate(-6 56 71)" />

                  {/* Front sheet with shadow */}
                  <g filter="url(#card-shadow-2)">
                    <rect x="28" y="22" width="76" height="94" rx="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                    
                    {/* Dark top header bar */}
                    <rect x="40" y="38" width="40" height="9" rx="4.5" fill="#1E293B" />
                    
                    {/* Two colorful content blocks */}
                    <rect x="40" y="54" width="22" height="20" rx="5" fill="#FFEDD5" stroke="#FED7AA" strokeWidth="1" />
                    <rect x="66" y="54" width="22" height="20" rx="5" fill="#CCFBF1" stroke="#99F6E4" strokeWidth="1" />
                    
                    {/* Bottom content lines */}
                    <rect x="40" y="82" width="48" height="5" rx="2.5" fill="#E2E8F0" />
                    <rect x="40" y="92" width="30" height="4" rx="2" fill="#F1F5F9" />
                  </g>

                  {/* Top-Right Green Checkmark Badge */}
                  <g filter="url(#badge-shadow)">
                    <circle cx="98" cy="36" r="16" fill="url(#badge-grad)" stroke="#FFFFFF" strokeWidth="2.5" />
                    <path d="M92 36.5 L96.5 41 L105 31.5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </svg>
              </div>

              {/* Ground diffuse shadow */}
              <div className="w-24 h-3 bg-slate-400/25 dark:bg-black/40 rounded-full blur-md mx-auto mt-2 group-hover:scale-115 group-hover:bg-teal-500/30 transition-all duration-300" />

              {/* Label */}
              <h3 className="mt-5 text-sm sm:text-base font-bold text-[#1E293B] dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 tracking-tight transition-colors text-center">
                Use Job Template
              </h3>
            </div>

            {/* 3. Parse Job Details */}
            <div
              onClick={() => setCreationMode('parse')}
              className="group relative flex flex-col items-center justify-center p-8 rounded-3xl cursor-pointer transition-all duration-300 ease-out transform hover:scale-110 hover:-translate-y-2 backdrop-blur-xl bg-white/50 dark:bg-[#1E293B]/50 hover:bg-white/80 dark:hover:bg-[#2563EB]/80 border border-white/80 dark:border-white/10 hover:border-orange-400/50 shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 w-64 h-64 select-none"
            >
              {/* Ambient Glow */}
              <div className="absolute inset-0 rounded-3xl bg-radial from-orange-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Icon 3: Parse Job Details (Exact Screenshot Replica) */}
              <div className="relative transform group-hover:scale-105 transition-transform duration-300">
                <svg viewBox="0 0 140 140" className="w-28 h-28 sm:w-32 sm:h-32 drop-shadow-xl" fill="none">
                  <defs>
                    <filter id="card-shadow-3" x="-10%" y="-10%" width="130%" height="130%">
                      <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.12" />
                    </filter>
                    <filter id="orange-badge-shadow" x="-20%" y="-20%" width="150%" height="150%">
                      <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.25" />
                    </filter>
                    <linearGradient id="orange-badge" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FB923C" />
                      <stop offset="100%" stopColor="#EA580C" />
                    </linearGradient>
                    <linearGradient id="glass-card" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#F1F5F9" />
                    </linearGradient>
                  </defs>

                  {/* Outer glass container / backing */}
                  <rect x="22" y="24" width="96" height="96" rx="22" fill="#E0F2FE" fillOpacity="0.6" stroke="#BAE6FD" strokeWidth="1.5" />

                  {/* Inner translucent sheet with shadow */}
                  <g filter="url(#card-shadow-3)">
                    <rect x="26" y="28" width="88" height="88" rx="18" fill="url(#glass-card)" stroke="#FFFFFF" strokeWidth="1.5" />

                    {/* Top Orange Upload Badge with Arrow */}
                    <g filter="url(#orange-badge-shadow)">
                      <rect x="49" y="18" width="42" height="42" rx="12" fill="url(#orange-badge)" />
                      {/* Upward Arrow */}
                      <path d="M70 44 V28 M64 34 L70 28 L76 34" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </g>

                    {/* Bottom Dark Navy Card */}
                    <rect x="38" y="66" width="64" height="42" rx="12" fill="#1E293B" />
                    {/* Data chips / lines inside dark card */}
                    <rect x="46" y="76" width="34" height="4.5" rx="2.25" fill="#2DD4BF" />
                    <rect x="46" y="85" width="48" height="4.5" rx="2.25" fill="#64748B" />
                    <rect x="46" y="94" width="24" height="4.5" rx="2.25" fill="#2DD4BF" />
                  </g>
                </svg>
              </div>

              {/* Ground diffuse shadow */}
              <div className="w-24 h-3 bg-slate-400/25 dark:bg-black/40 rounded-full blur-md mx-auto mt-2 group-hover:scale-115 group-hover:bg-orange-500/30 transition-all duration-300" />

              {/* Label */}
              <h3 className="mt-5 text-sm sm:text-base font-bold text-[#1E293B] dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 tracking-tight transition-colors text-center">
                Parse Job Details
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. JOB TEMPLATE SELECTOR (Opens full form directly on same page) */}
      {/* ========================================================================= */}
      {creationMode === 'template' && (
        <div className="bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D8E3F1] dark:border-[#334155]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFFFFF] dark:bg-[#24456C] text-[#1E293B] dark:text-[#FFFFFF]">
                  5.2.2 Job Template Selection
                </span>
                {selectedTemplateKey && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    Template Loaded
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-[#1E293B] dark:text-white mt-1">
                Choose Business Unit &amp; Job Template
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#BFDBFE] mt-0.5">
                Selecting a template directly opens and populates all requisition details, skills, billing rates, and job description on this page.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center h-[30px] mb-1.5">
                <label className="block text-xs font-bold text-[#1E293B] dark:text-[#FFFFFF]">
                  Business Unit
                </label>
              </div>
              <select
                value={businessUnit}
                onChange={(e) => setBusinessUnit(e.target.value)}
                className="w-full p-2.5 bg-[#FFFFFF] dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-xs font-semibold text-[#1E293B] dark:text-white"
              >
                <option value="Ampcus Tech Pvt Ltd.">Ampcus Tech Pvt Ltd.</option>
                <option value="Cloud & AI Practice">Cloud &amp; AI Practice</option>
                <option value="Core Engineering">Core Engineering</option>
                <option value="Fintech & Enterprise">Fintech &amp; Enterprise</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between h-[30px] mb-1.5">
                <label className="block text-xs font-bold text-[#1E293B] dark:text-[#FFFFFF]">
                  Job Templates *
                </label>
                {selectedTemplateKey && (
                  <button
                    type="button"
                    onClick={() => handleSelectTemplate('')}
                    className="px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold shadow-xs shadow-[#2563EB]/30 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Clear selected template"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Template Selection</span>
                  </button>
                )}
              </div>
              <select
                value={selectedTemplateKey}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="w-full p-2.5 bg-[#FFFFFF] dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-xs font-semibold text-[#1E293B] dark:text-white focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              >
                <option value="">-- Select Template --</option>
                {templatesList.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {!selectedTemplateKey && (
            <div className="p-8 text-center border-2 border-dashed border-[#D8E3F1] dark:border-[#334155] rounded-xl bg-slate-50/50 dark:bg-slate-900/20 space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#1E293B] flex items-center justify-center mx-auto text-lg">
                📋
              </div>
              <h3 className="text-xs font-bold text-[#1E293B] dark:text-white">
                Select a template from the dropdown above
              </h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#64748B] max-w-md mx-auto">
                Once chosen, the entire job creation form will open immediately below on this page with all fields pre-filled for you to edit.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PARSE JOB DETAILS SCREEN (Ceipal Exact Replica matching media_1794910793067_a5e40e35.png) */}
      {/* ========================================================================= */}
      {creationMode === 'parse' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Ceipal Top Row: Business Unit */}
          <div className="max-w-xs space-y-1">
            <label className="block text-xs font-bold text-[#475569] dark:text-[#64748B]">
              Business Unit
            </label>
            <select
              value={businessUnit}
              onChange={(e) => setBusinessUnit(e.target.value)}
              className="w-full px-3 py-1.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded text-xs font-semibold text-[#1E293B] dark:text-white shadow-2xs focus:outline-none focus:border-[#2563EB]"
            >
              <option value="Ampcus Tech Pvt Ltd.">Ampcus Tech Pvt Ltd.</option>
              <option value="Cloud & AI Practice">Cloud &amp; AI Practice</option>
              <option value="Core Engineering">Core Engineering</option>
              <option value="Fintech & Enterprise">Fintech &amp; Enterprise</option>
            </select>
          </div>

          {/* Ceipal Header: New Job */}
          <div>
            <h2 className="text-xl font-bold text-[#1E293B] dark:text-white">
              New Job
            </h2>
          </div>

          {/* Ceipal Main Card: Paste Job Details */}
          <div className="bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-lg p-5 shadow-2xs space-y-2.5">
            <div className="text-xs font-bold text-[#64748B] dark:text-[#64748B]">
              Paste Job Details
            </div>

            {/* Ceipal CKEditor Container */}
            <div className="border border-[#D8E3F1] dark:border-[#334155] rounded-md overflow-hidden bg-white dark:bg-[#475569] shadow-2xs">
              {/* CKEditor Toolbar Row 1 */}
              <div className="flex items-center justify-between flex-wrap gap-1 px-2.5 py-1.5 bg-[#FFFFFF] dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] text-xs">
                <div className="flex items-center gap-0.5 flex-wrap text-[#475569] dark:text-[#D8E3F1]">
                  {/* Clean / Magic wand */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('removeFormat')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Clean Format">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  </button>
                  {/* Cut */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('cut')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Cut">
                    <Scissors className="w-3.5 h-3.5" />
                  </button>
                  {/* Copy */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('copy')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Copy">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {/* Paste */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      document.execCommand('insertText', false, text);
                    } catch {}
                  }} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Paste">
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                  {/* Paste from Word */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      document.execCommand('insertText', false, text);
                    } catch {}
                  }} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Paste from Word">
                    <FileCode className="w-3.5 h-3.5 text-[#0061D5]" />
                  </button>

                  <span className="w-px h-4 bg-[#D8E3F1] dark:bg-[#475569] mx-1"></span>

                  {/* Undo / Redo */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('undo')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Undo">
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('redo')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Redo">
                    <Redo2 className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-px h-4 bg-[#D8E3F1] dark:bg-[#475569] mx-1"></span>

                  {/* Find */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => {
                    const term = prompt('Find text:');
                    if (term && (window as any).find) (window as any).find(term);
                  }} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Find">
                    <Search className="w-3.5 h-3.5" />
                  </button>
                  {/* Replace */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => {
                    const findStr = prompt('Text to find:');
                    if (findStr) {
                      const replaceStr = prompt('Replace with:') || '';
                      if (parseEditorRef.current) {
                        parseEditorRef.current.innerHTML = parseEditorRef.current.innerHTML.replaceAll(findStr, replaceStr);
                        setRawJdText(parseEditorRef.current.innerHTML);
                      }
                    }
                  }} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Replace">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  {/* Select All */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('selectAll')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Select All">
                    <CheckSquare className="w-3.5 h-3.5" />
                  </button>
                  {/* Remove Format */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('removeFormat')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Remove Format">
                    <RemoveFormatting className="w-3.5 h-3.5 text-red-500" />
                  </button>

                  <span className="w-px h-4 bg-[#D8E3F1] dark:bg-[#475569] mx-1"></span>

                  {/* Bold / Italic / Underline / Strike */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('bold')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155] font-bold" title="Bold">
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('italic')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155] italic" title="Italic">
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('underline')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155] underline" title="Underline">
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('strikeThrough')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155] line-through" title="Strikethrough">
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>
                  {/* Subscript / Superscript */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('subscript')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Subscript">
                    <Subscript className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('superscript')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Superscript">
                    <Superscript className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-px h-4 bg-[#D8E3F1] dark:bg-[#475569] mx-1"></span>

                  {/* Lists */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('insertOrderedList')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Numbered List">
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('insertUnorderedList')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Bulleted List">
                    <List className="w-3.5 h-3.5" />
                  </button>
                  {/* Indent / Outdent */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('outdent')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Decrease Indent">
                    <Outdent className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('indent')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Increase Indent">
                    <Indent className="w-3.5 h-3.5" />
                  </button>
                  {/* Blockquote */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('formatBlock', false, 'blockquote')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Blockquote">
                    <Quote className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-px h-4 bg-[#D8E3F1] dark:bg-[#475569] mx-1"></span>

                  {/* Link */}
                  <button type="button" onClick={() => setShowParseLinkInput(!showParseLinkInput)} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Insert Link">
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                  {/* Unlink */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('unlink')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Unlink">
                    <Unlink className="w-3.5 h-3.5" />
                  </button>
                  {/* Anchor */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => {
                    const name = prompt('Anchor name:');
                    if (name) document.execCommand('insertHTML', false, `<a name="${name}"></a>`);
                  }} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Anchor">
                    <Anchor className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-px h-4 bg-[#D8E3F1] dark:bg-[#475569] mx-1"></span>

                  {/* Image */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => {
                    const url = prompt('Image URL:');
                    if (url) document.execCommand('insertImage', false, url);
                  }} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Image">
                    <Image className="w-3.5 h-3.5" />
                  </button>
                  {/* Table */}
                  <button type="button" onClick={() => setShowParseTableInput(!showParseTableInput)} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Table">
                    <Table className="w-3.5 h-3.5" />
                  </button>
                  {/* Horizontal Rule */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('insertHorizontalRule')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Horizontal Rule">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  {/* Special Character */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('insertText', false, 'Ω')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155] font-serif text-xs font-bold" title="Special Character (Ω)">
                    Ω
                  </button>
                </div>

                {/* Source Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setParseSourceMode(!parseSourceMode)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                    parseSourceMode
                      ? 'bg-[#2563EB] text-white'
                      : 'hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-[#475569] dark:text-[#D8E3F1]'
                  }`}
                  title="Toggle HTML Source Code View"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Source</span>
                </button>
              </div>

              {/* CKEditor Toolbar Row 2: Alignment, Fonts, Colors AND Action Buttons on Right */}
              <div className="flex items-center justify-between flex-wrap gap-2 px-2.5 py-1 bg-[#F1F5F9] dark:bg-[#475569] border-b border-[#E2E8F0] dark:border-[#334155] text-xs">
                {/* Left side: Formatting tools */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Alignment */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('justifyLeft')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Align Left">
                    <AlignLeft className="w-3.5 h-3.5 text-[#475569] dark:text-[#D8E3F1]" />
                  </button>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('justifyCenter')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Align Center">
                    <AlignCenter className="w-3.5 h-3.5 text-[#475569] dark:text-[#D8E3F1]" />
                  </button>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('justifyRight')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Align Right">
                    <AlignRight className="w-3.5 h-3.5 text-[#475569] dark:text-[#D8E3F1]" />
                  </button>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('justifyFull')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Justify">
                    <AlignJustify className="w-3.5 h-3.5 text-[#475569] dark:text-[#D8E3F1]" />
                  </button>

                  <span className="w-px h-4 bg-[#D8E3F1] dark:bg-[#475569] mx-1"></span>

                  {/* Text Color A */}
                  <div className="relative">
                    <button type="button" onClick={() => { setShowParseColorPicker(!showParseColorPicker); setShowParseHighlightPicker(false); }} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155] flex items-center gap-0.5" title="Text Color">
                      <Type className="w-3.5 h-3.5 text-[#475569] dark:text-[#D8E3F1]" />
                      <span className="w-2.5 h-1 rounded-full" style={{ backgroundColor: parseTextColor }}></span>
                    </button>
                    {showParseColorPicker && (
                      <div className="absolute top-7 left-0 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-lg shadow-xl p-2 z-50 grid grid-cols-7 gap-1 w-[160px]">
                        {['#000000','#333333','#666666','#999999','#CCCCCC','#FFFFFF','#E05252','#D97706','#16A34A','#2563EB','#7C3AED','#DB2777','#2563EB','#2563EB'].map((c) => (
                          <button key={c} type="button" onClick={() => { setParseTextColor(c); document.execCommand('foreColor', false, c); setShowParseColorPicker(false); }} className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 hover:scale-125 transition-transform" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Highlight Color */}
                  <div className="relative">
                    <button type="button" onClick={() => { setShowParseHighlightPicker(!showParseHighlightPicker); setShowParseColorPicker(false); }} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155] flex items-center gap-0.5" title="Background Color">
                      <Highlighter className="w-3.5 h-3.5 text-[#475569] dark:text-[#D8E3F1]" />
                      <span className="w-2.5 h-1 rounded-full" style={{ backgroundColor: parseHighlightColor }}></span>
                    </button>
                    {showParseHighlightPicker && (
                      <div className="absolute top-7 left-0 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-lg shadow-xl p-2 z-50 grid grid-cols-6 gap-1 w-[140px]">
                        {['#FFFF00','#00FF00','#00FFFF','#FF69B4','#FFA500','#FF6347','#E6E6FA','#98FB98','#87CEEB','#FFFFFF'].map((c) => (
                          <button key={c} type="button" onClick={() => { setParseHighlightColor(c); document.execCommand('hiliteColor', false, c); setShowParseHighlightPicker(false); }} className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 hover:scale-125 transition-transform" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="w-px h-4 bg-[#D8E3F1] dark:bg-[#475569] mx-1"></span>

                  {/* Styles */}
                  <select
                    value={parseStyle}
                    onChange={(e) => setParseStyle(e.target.value)}
                    className="px-2 py-0.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#475569] rounded text-[11px] text-[#334155] dark:text-white"
                  >
                    <option value="Styles">Styles</option>
                    <option value="lead">Lead Paragraph</option>
                    <option value="badge">Badge Tag</option>
                    <option value="italic-title">Italic Title</option>
                  </select>

                  {/* Format */}
                  <select
                    value={parseFormat}
                    onChange={(e) => {
                      setParseFormat(e.target.value);
                      const tag = e.target.value === 'Normal' ? 'P' : e.target.value === 'Heading 1' ? 'H1' : e.target.value === 'Heading 2' ? 'H2' : e.target.value === 'Heading 3' ? 'H3' : 'P';
                      document.execCommand('formatBlock', false, tag);
                    }}
                    className="px-2 py-0.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#475569] rounded text-[11px] text-[#334155] dark:text-white"
                  >
                    <option value="Normal">Format</option>
                    <option value="Heading 1">Heading 1</option>
                    <option value="Heading 2">Heading 2</option>
                    <option value="Heading 3">Heading 3</option>
                    <option value="Formatted">Formatted</option>
                  </select>

                  {/* Font */}
                  <select
                    value={parseFont}
                    onChange={(e) => {
                      setParseFont(e.target.value);
                      document.execCommand('fontName', false, e.target.value);
                    }}
                    className="px-2 py-0.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#475569] rounded text-[11px] text-[#334155] dark:text-white"
                  >
                    <option value="Arial">Font</option>
                    <option value="Comic Sans MS">Comic Sans MS</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Lucida Sans">Lucida Sans</option>
                    <option value="Tahoma">Tahoma</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Trebuchet MS">Trebuchet MS</option>
                    <option value="Verdana">Verdana</option>
                  </select>

                  {/* Size */}
                  <select
                    value={parseFontSize}
                    onChange={(e) => {
                      setParseFontSize(e.target.value);
                      document.execCommand('fontSize', false, e.target.value);
                    }}
                    className="px-2 py-0.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#475569] rounded text-[11px] text-[#334155] dark:text-white"
                  >
                    <option value="3">Size</option>
                    <option value="1">8</option>
                    <option value="2">10</option>
                    <option value="3">12</option>
                    <option value="4">14</option>
                    <option value="5">18</option>
                    <option value="6">24</option>
                    <option value="7">36</option>
                  </select>
                </div>

                {/* Right side: Action Buttons matching Screenshot EXACTLY */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    type="button"
                    onClick={handleParseJobDetails}
                    disabled={!rawJdText.trim()}
                    className="px-3.5 py-1 bg-[#007BFF] hover:bg-[#0069D9] disabled:opacity-50 text-white font-semibold text-[11px] rounded shadow-xs transition-colors"
                  >
                    Start Parsing
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreationMode('select')}
                    className="px-3.5 py-1 bg-[#007BFF] hover:bg-[#0069D9] text-white font-semibold text-[11px] rounded shadow-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Popovers for Link & Table */}
              {showParseLinkInput && (
                <div className="p-2.5 bg-[#FFFFFF] dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] flex items-center gap-2 text-xs">
                  <span className="text-[11px] font-semibold text-[#475569]">URL:</span>
                  <input
                    type="url"
                    value={parseLinkUrl}
                    onChange={(e) => setParseLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-2 py-1 bg-white dark:bg-[#475569] border border-[#D8E3F1] rounded text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (parseLinkUrl.trim()) {
                        document.execCommand('createLink', false, parseLinkUrl.trim());
                        setParseLinkUrl('');
                        setShowParseLinkInput(false);
                      }
                    }}
                    className="px-3 py-1 bg-[#2563EB] text-white text-[11px] font-bold rounded"
                  >
                    Insert Link
                  </button>
                  <button type="button" onClick={() => setShowParseLinkInput(false)} className="text-[#64748B] text-xs">✕</button>
                </div>
              )}

              {showParseTableInput && (
                <div className="p-2.5 bg-[#FFFFFF] dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] flex items-center gap-3 text-xs">
                  <span className="text-[11px] font-semibold text-[#475569]">Table:</span>
                  <label className="flex items-center gap-1 text-[11px]">
                    <span>Rows:</span>
                    <input type="number" min={1} max={10} value={parseTableRows} onChange={(e) => setParseTableRows(Number(e.target.value))} className="w-12 px-1 py-0.5 border rounded text-xs text-center" />
                  </label>
                  <label className="flex items-center gap-1 text-[11px]">
                    <span>Cols:</span>
                    <input type="number" min={1} max={8} value={parseTableCols} onChange={(e) => setParseTableCols(Number(e.target.value))} className="w-12 px-1 py-0.5 border rounded text-xs text-center" />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      let html = '<table style="border-collapse:collapse;width:100%;border:1px solid #D8E3F1;margin:8px 0"><thead><tr>';
                      for (let c = 0; c < parseTableCols; c++) html += `<th style="border:1px solid #D8E3F1;padding:6px 10px;background:#F1F5F9;font-weight:bold;text-align:left;font-size:12px">Col ${c + 1}</th>`;
                      html += '</tr></thead><tbody>';
                      for (let r = 0; r < parseTableRows; r++) {
                        html += '<tr>';
                        for (let c = 0; c < parseTableCols; c++) html += `<td style="border:1px solid #D8E3F1;padding:6px 10px;font-size:12px">&nbsp;</td>`;
                        html += '</tr>';
                      }
                      html += '</tbody></table>';
                      document.execCommand('insertHTML', false, html);
                      setShowParseTableInput(false);
                    }}
                    className="px-3 py-1 bg-[#2563EB] text-white text-[11px] font-bold rounded"
                  >
                    Insert
                  </button>
                  <button type="button" onClick={() => setShowParseTableInput(false)} className="text-[#64748B] text-xs">✕</button>
                </div>
              )}

              {/* Editor Content Area */}
              {parseSourceMode ? (
                <textarea
                  value={rawJdText}
                  onChange={(e) => setRawJdText(e.target.value)}
                  rows={18}
                  className="w-full p-4 font-mono text-xs text-[#1E293B] dark:text-white bg-white dark:bg-[#475569] focus:outline-none min-h-[460px]"
                  placeholder="<p>Enter HTML source code or paste job details here...</p>"
                />
              ) : (
                <div
                  ref={parseEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  role="textbox"
                  aria-label="Paste Job Details"
                  aria-multiline="true"
                  onInput={(e) => setRawJdText(e.currentTarget.innerHTML)}
                  data-placeholder="Paste job details or client requirement email here..."
                  className="min-h-[460px] w-full p-4 text-xs font-sans text-[#1E293B] dark:text-white bg-white dark:bg-[#475569] focus:outline-none whitespace-pre-wrap leading-relaxed"
                  style={{ fontFamily: parseFont }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. REQUISITION FORM (Manual Creation or Template Loaded on Same Page) */}
      {/* ========================================================================= */}
      {(creationMode === 'manual' || (creationMode === 'template' && selectedTemplateKey)) && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top Business Unit Header Card */}
          <div className="bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {creationMode === 'manual' ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="w-full sm:w-60">
                  <label className="block text-xs font-bold text-[#64748B] dark:text-[#BFDBFE] mb-1">
                    Business Unit
                  </label>
                  <select
                    value={businessUnit}
                    onChange={(e) => setBusinessUnit(e.target.value)}
                    className="w-full p-2 bg-[#FFFFFF] dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-xs font-semibold text-[#1E293B] dark:text-white"
                  >
                    <option value="Ampcus Tech Pvt Ltd.">Ampcus Tech Pvt Ltd.</option>
                    <option value="Cloud & AI Practice">Cloud &amp; AI Practice</option>
                    <option value="Core Engineering">Core Engineering</option>
                    <option value="Fintech & Enterprise">Fintech &amp; Enterprise</option>
                  </select>
                </div>
                <div className="w-full sm:w-64">
                  <label className="block text-xs font-bold text-[#64748B] dark:text-[#BFDBFE] mb-1">
                    Job Template (Optional)
                  </label>
                  <select
                    value={selectedTemplateKey}
                    onChange={(e) => handleSelectTemplate(e.target.value)}
                    className="w-full p-2 bg-[#FFFFFF] dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-xs font-semibold text-[#1E293B] dark:text-white"
                  >
                    <option value="">-- Apply a Template --</option>
                    {templatesList.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 py-1">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-2 border border-emerald-500/20 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Template Active: {title}</span>
                </span>
                <span className="text-xs text-[#64748B] dark:text-[#BFDBFE] font-medium hidden sm:inline">
                  • {businessUnit}
                </span>
              </div>
            )}

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
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-[#FFFFFF] dark:bg-[#475569] text-[#64748B] dark:text-[#BFDBFE] hover:text-[#1E293B]'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 1: JOB DETAILS (Ceipal Section 1) */}
          {(activeFormSection === 'all' || activeFormSection === 'details') && (
            <div className="bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#D8E3F1] dark:border-[#334155]">
                <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 text-[#1E293B] flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E293B] dark:text-white uppercase tracking-wider">
                    Job Details
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-[#BFDBFE]">
                    Requisition identity, billing schedule, location, and client specifications
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Row 1 */}
                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Job Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2.5 bg-[#FFFFFF] dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-mono font-bold text-[#1E293B] dark:text-[#64748B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Facility</label>
                  <select
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium text-[#1E293B] dark:text-white"
                  >
                    <option value="Offshore Development Center">Offshore Development Center</option>
                    <option value="Client Onsite HQ">Client Onsite HQ</option>
                    <option value="Corporate Office">Corporate Office</option>
                    <option value="Remote Facility">Remote Facility</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Software Engineer (React / Node)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-bold text-[#1E293B] dark:text-white focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>

                {/* Row 2: Client Bill Rate / Salary */}
                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">
                    Client Bill Rate / Salary
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-20 p-2.5 bg-[#FFFFFF] dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-bold text-xs"
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
                      className="flex-1 p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-bold text-xs"
                    />
                    <select
                      value={rateType}
                      onChange={(e) => setRateType(e.target.value as any)}
                      className="w-24 p-2.5 bg-[#FFFFFF] dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-semibold text-xs"
                    >
                      <option value="Hourly">Hourly</option>
                      <option value="Yearly">Yearly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Job Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Job End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                  />
                </div>

                {/* Row 3 */}
                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Job Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
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
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Job Skill Type *</label>
                  <select
                    value={skillType}
                    onChange={(e) => setSkillType(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Functional">Functional</option>
                    <option value="Techno-Functional">Techno-Functional</option>
                    <option value="Leadership">Leadership</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Respond By</label>
                  <select
                    value={respondBy}
                    onChange={(e) => setRespondBy(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                  >
                    <option value="Open Until Filled">Open Until Filled</option>
                    <option value="Within 7 Days">Within 7 Days</option>
                    <option value="Immediate SLA (24h)">Immediate SLA (24h)</option>
                  </select>
                </div>

                {/* Row 4: Remote Job Radio & Location */}
                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-2">Remote Job</label>
                  <div className="flex items-center gap-4 pt-1">
                    {(['Yes', 'No', 'Hybrid'] as const).map((r) => (
                      <label key={r} className="flex items-center gap-1.5 cursor-pointer font-medium text-xs">
                        <input
                          type="radio"
                          name="remoteJob"
                          value={r}
                          checked={remoteJob === r}
                          onChange={() => setRemoteJob(r)}
                          className="text-[#1E293B]"
                        />
                        <span>{r}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">States *</label>
                  <input
                    type="text"
                    value={states}
                    onChange={(e) => setStates(e.target.value)}
                    placeholder="e.g. Maharashtra, Karnataka, CA"
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Search Location with City or Zip Code"
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                  />
                </div>

                {/* Row 5 */}
                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Job Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-bold text-[#1E293B]"
                  >
                    <option value="Active">Active</option>
                    <option value="Sourcing">Sourcing</option>
                    <option value="In Review">In Review</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Job Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="C2H">C2H</option>
                    <option value="C2C">C2C</option>
                    <option value="Part-Time">Part-Time</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 6 Months, Permanent"
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                  />
                </div>

                {/* Row 6: Client details */}
                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Client *</label>
                  <input
                    type="text"
                    required
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="Search for a Client"
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-bold text-[#1E293B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Client Manager</label>
                  <input
                    type="text"
                    value={clientManager}
                    onChange={(e) => setClientManager(e.target.value)}
                    placeholder="Client point of contact"
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Client Job ID</label>
                  <input
                    type="text"
                    value={clientJobId}
                    onChange={(e) => setClientJobId(e.target.value)}
                    placeholder="e.g. MOR4JP00025875"
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-mono text-xs"
                  />
                </div>

                {/* Row 7 */}
                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Turnaround Time</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      value={turnaroundTime}
                      onChange={(e) => setTurnaroundTime(Number(e.target.value))}
                      className="w-24 p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-bold"
                    />
                    <select
                      value={turnaroundUnit}
                      onChange={(e) => setTurnaroundUnit(e.target.value as any)}
                      className="flex-1 p-2.5 bg-[#FFFFFF] dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                    >
                      <option value="In Days">In Days</option>
                      <option value="In Hours">In Hours</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Priority *</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-bold text-[#1E293B]"
                  >
                    <option value="Urgent">🔥 Urgent Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Notice Period</label>
                  <select
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
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
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Address</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full workplace address"
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: SKILLS & QUALIFICATIONS (Ceipal Section 2) */}
          {(activeFormSection === 'all' || activeFormSection === 'skills') && (
            <div className="bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#D8E3F1] dark:border-[#334155]">
                <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 text-[#1E293B] flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E293B] dark:text-white uppercase tracking-wider">
                    Skills &amp; Qualifications
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-[#BFDBFE]">
                    Technical domain prerequisites, education degree, experience boundaries, and primary/secondary skill chips
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                  >
                    <option value="Information Technology">Information Technology</option>
                    <option value="Banking & Financial Services">Banking &amp; Financial Services</option>
                    <option value="Healthcare & Life Sciences">Healthcare &amp; Life Sciences</option>
                    <option value="Supply Chain & Logistics">Supply Chain &amp; Logistics</option>
                    <option value="Automotive & Manufacturing">Automotive &amp; Manufacturing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Degree</label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                  >
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Any Degree">Any Degree</option>
                    <option value="High School">High School</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Experience *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minExperience}
                      onChange={(e) => setMinExperience(Number(e.target.value))}
                      className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-bold"
                    />
                    <span className="text-[#64748B] font-bold">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxExperience}
                      onChange={(e) => setMaxExperience(Number(e.target.value))}
                      className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-bold"
                    />
                    <span className="text-[#64748B] font-semibold whitespace-nowrap">Years</span>
                  </div>
                </div>

                {/* Primary Skills Chips */}
                <div className="md:col-span-3 pt-2">
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1.5">
                    Primary Skills * <span className="text-[11px] text-[#64748B] font-normal">(Press Enter to add skill tag)</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add primary skill (e.g. React, Java, AWS, Kubernetes)..."
                      value={newPrimarySkill}
                      onChange={(e) => setNewPrimarySkill(e.target.value)}
                      onKeyDown={handleAddPrimarySkill}
                      className="flex-1 p-2 bg-[#FFFFFF] dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddPrimarySkill()}
                      className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {primarySkills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#2563EB]/10 text-[#1E293B] dark:text-[#64748B] border border-[#2563EB]/20 rounded-xl font-bold text-xs"
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
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1.5">
                    Secondary Skills <span className="text-[11px] text-[#64748B] font-normal">(Press Enter to add skill tag)</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add secondary skill (e.g. Docker, PostgreSQL, CI/CD)..."
                      value={newSecondarySkill}
                      onChange={(e) => setNewSecondarySkill(e.target.value)}
                      onKeyDown={handleAddSecondarySkill}
                      className="flex-1 p-2 bg-[#FFFFFF] dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSecondarySkill()}
                      className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {secondarySkills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#2563EB]/10 text-[#1E293B] dark:text-[#64748B] border border-[#2563EB]/20 rounded-xl font-bold text-xs"
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
            <div className="bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#D8E3F1] dark:border-[#334155]">
                <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 text-[#1E293B] flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E293B] dark:text-white uppercase tracking-wider">
                    Organizational Information
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-[#BFDBFE]">
                    Capacity parameters, management routing, account executive ownership, and notifications
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Number of Positions *</label>
                  <input
                    type="number"
                    min={1}
                    value={openings}
                    onChange={(e) => setOpenings(Number(e.target.value))}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Maximum Allowed Submissions</label>
                  <input
                    type="number"
                    value={maxSubmissions}
                    onChange={(e) => setMaxSubmissions(Number(e.target.value))}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Sales Manager</label>
                  <select
                    value={salesManager}
                    onChange={(e) => setSalesManager(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                  >
                    <option value="Rajesh Ramanathan">Rajesh Ramanathan</option>
                    <option value="Elena Rostova">Elena Rostova</option>
                    <option value="Marcus Vance">Marcus Vance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Recruitment Manager *</label>
                  <select
                    value={recruitmentManager}
                    onChange={(e) => setRecruitmentManager(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                  >
                    <option value="Priya Sharma">Priya Sharma</option>
                    <option value="Rajesh Ramanathan">Rajesh Ramanathan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Account Manager *</label>
                  <select
                    value={accountManager}
                    onChange={(e) => setAccountManager(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                  >
                    <option value="David Chen">David Chen</option>
                    <option value="Siddharth Roy">Siddharth Roy</option>
                    <option value="Priya Nambiar">Priya Nambiar</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Assigned To *</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => {
                      setAssignedTo(e.target.value);
                      setAssignedRecruiter(e.target.value);
                    }}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-bold text-[#1E293B]"
                  >
                    <option value="Priya Sharma">Priya Sharma</option>
                    <option value="Marcus Vance">Marcus Vance</option>
                    <option value="Sagar Nehe">Sagar Nehe</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Primary Recruiter</label>
                  <select
                    value={assignedRecruiter}
                    onChange={(e) => setAssignedRecruiter(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                  >
                    <option value="Priya Sharma">Priya Sharma</option>
                    <option value="Marcus Vance">Marcus Vance</option>
                    <option value="Sagar Nehe">Sagar Nehe</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Additional Notifications</label>
                  <input
                    type="text"
                    value={additionalNotifications}
                    onChange={(e) => setAdditionalNotifications(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Career Portal Published Date</label>
                  <input
                    type="date"
                    value={careerPortalPublishedDate}
                    onChange={(e) => setCareerPortalPublishedDate(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block font-bold text-[#1E293B] dark:text-[#FFFFFF] mb-1">Comments / Sourcing Instructions</label>
                  <textarea
                    rows={2}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Recruitment team guidance and screening remarks..."
                    className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: JOB DESCRIPTION (CEIPAL EXACT REPLICA) */}
          {(activeFormSection === 'all' || activeFormSection === 'description') && (
            <div className="bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-2xl p-6 shadow-xs space-y-3">
              <label className="block text-xs font-bold text-[#1E293B] dark:text-white">
                Job Description <span className="text-red-500">*</span>
              </label>

              {/* Ceipal CKEditor Container */}
              <div className="border border-[#D8E3F1] dark:border-[#334155] rounded-md overflow-hidden bg-white dark:bg-[#475569] shadow-2xs">
                {/* CKEditor Toolbar Row 1 */}
                <div className="flex items-center justify-between flex-wrap gap-1 px-2.5 py-1.5 bg-[#FFFFFF] dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] text-xs">
                  <div className="flex items-center gap-0.5 flex-wrap text-[#475569] dark:text-[#D8E3F1]">
                    {/* Clean / Magic wand */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('removeFormat')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Clean Format">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    </button>
                    {/* Cut */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('cut')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Cut">
                      <Scissors className="w-3.5 h-3.5" />
                    </button>
                    {/* Copy */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('copy')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Copy">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {/* Paste */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        document.execCommand('insertText', false, text);
                      } catch {
                        /* fallback */
                      }
                    }} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Paste">
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    {/* Paste from Word */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        document.execCommand('insertText', false, text);
                      } catch {
                        /* fallback */
                      }
                    }} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Paste from Word">
                      <FileCode className="w-3.5 h-3.5 text-[#0061D5]" />
                    </button>

                    <span className="w-px h-4 bg-[#D8E3F1] dark:bg-[#475569] mx-1"></span>

                    {/* Undo / Redo */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('undo')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Undo">
                      <Undo2 className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('redo')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Redo">
                      <Redo2 className="w-3.5 h-3.5" />
                    </button>

                    <span className="w-px h-4 bg-[#D8E3F1] dark:bg-[#475569] mx-1"></span>

                    {/* Find */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => {
                      const term = prompt('Find text in job description:');
                      if (term && (window as any).find) (window as any).find(term);
                    }} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Find">
                      <Search className="w-3.5 h-3.5" />
                    </button>
                    {/* Replace */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => {
                      const findStr = prompt('Text to find:');
                      if (findStr) {
                        const replaceStr = prompt('Replace with:') || '';
                        applyDescription(description.replaceAll(findStr, replaceStr));
                      }
                    }} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Replace">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    {/* Select All */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('selectAll')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Select All">
                      <CheckSquare className="w-3.5 h-3.5" />
                    </button>
                    {/* Remove Format */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('removeFormat')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Remove Format">
                      <RemoveFormatting className="w-3.5 h-3.5 text-red-500" />
                    </button>

                    <span className="w-px h-4 bg-[#D8E3F1] dark:bg-[#475569] mx-1"></span>

                    {/* Bold / Italic / Underline / Strike */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => formatDescription('bold')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155] font-bold" title="Bold">
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => formatDescription('italic')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155] italic" title="Italic">
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => formatDescription('underline')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155] underline" title="Underline">
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => formatDescription('strikeThrough')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155] line-through" title="Strikethrough">
                      <Strikethrough className="w-3.5 h-3.5" />
                    </button>
                    {/* Subscript / Superscript */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('subscript')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Subscript">
                      <Subscript className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('superscript')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Superscript">
                      <Superscript className="w-3.5 h-3.5" />
                    </button>

                    <span className="w-px h-4 bg-[#D8E3F1] dark:bg-[#475569] mx-1"></span>

                    {/* Lists */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => formatDescription('insertOrderedList')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Numbered List">
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => formatDescription('insertUnorderedList')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Bulleted List">
                      <List className="w-3.5 h-3.5" />
                    </button>
                    {/* Indent / Outdent */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('outdent')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Decrease Indent">
                      <Outdent className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('indent')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Increase Indent">
                      <Indent className="w-3.5 h-3.5" />
                    </button>
                    {/* Blockquote */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('formatBlock', false, 'blockquote')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Blockquote">
                      <Quote className="w-3.5 h-3.5" />
                    </button>

                    <span className="w-px h-4 bg-[#D8E3F1] dark:bg-[#475569] mx-1"></span>

                    {/* Link */}
                    <button type="button" onClick={() => setShowLinkInput(!showLinkInput)} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Insert Link">
                      <Link2 className="w-3.5 h-3.5" />
                    </button>
                    {/* Unlink */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('unlink')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Unlink">
                      <Unlink className="w-3.5 h-3.5" />
                    </button>
                    {/* Anchor */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => {
                      const name = prompt('Anchor name:');
                      if (name) document.execCommand('insertHTML', false, `<a name="${name}"></a>`);
                    }} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Anchor">
                      <Anchor className="w-3.5 h-3.5" />
                    </button>

                    <span className="w-px h-4 bg-[#D8E3F1] dark:bg-[#475569] mx-1"></span>

                    {/* Image */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => {
                      const url = prompt('Image URL:');
                      if (url) document.execCommand('insertImage', false, url);
                    }} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Image">
                      <Image className="w-3.5 h-3.5" />
                    </button>
                    {/* Table */}
                    <button type="button" onClick={() => setShowTableInput(!showTableInput)} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Table">
                      <Table className="w-3.5 h-3.5" />
                    </button>
                    {/* Horizontal Rule */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('insertHorizontalRule')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Horizontal Rule">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    {/* Special Character */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('insertText', false, '©')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155] font-serif text-xs font-bold" title="Special Character (Ω)">
                      Ω
                    </button>
                  </div>

                  {/* Source Mode Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setIsSourceMode(!isSourceMode)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                      isSourceMode
                        ? 'bg-[#2563EB] text-white'
                        : 'hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-[#475569] dark:text-[#D8E3F1]'
                    }`}
                    title="Toggle HTML Source Code View"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Source</span>
                  </button>
                </div>

                {/* CKEditor Toolbar Row 2 */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F1F5F9] dark:bg-[#475569] border-b border-[#E2E8F0] dark:border-[#334155] text-xs flex-wrap">
                  {/* Alignment */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('justifyLeft')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Align Left">
                    <AlignLeft className="w-3.5 h-3.5 text-[#475569] dark:text-[#D8E3F1]" />
                  </button>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('justifyCenter')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Align Center">
                    <AlignCenter className="w-3.5 h-3.5 text-[#475569] dark:text-[#D8E3F1]" />
                  </button>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('justifyRight')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Align Right">
                    <AlignRight className="w-3.5 h-3.5 text-[#475569] dark:text-[#D8E3F1]" />
                  </button>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('justifyFull')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Justify">
                    <AlignJustify className="w-3.5 h-3.5 text-[#475569] dark:text-[#D8E3F1]" />
                  </button>

                  <span className="w-px h-4 bg-[#D8E3F1] dark:bg-[#475569] mx-1"></span>

                  {/* Text Color A */}
                  <div className="relative">
                    <button type="button" onClick={() => { setShowColorPicker(!showColorPicker); setShowHighlightPicker(false); }} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155] flex items-center gap-0.5" title="Text Color">
                      <Type className="w-3.5 h-3.5 text-[#475569] dark:text-[#D8E3F1]" />
                      <span className="w-2.5 h-1 rounded-full" style={{ backgroundColor: editorTextColor }}></span>
                    </button>
                    {showColorPicker && (
                      <div className="absolute top-7 left-0 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-lg shadow-xl p-2 z-50 grid grid-cols-7 gap-1 w-[160px]">
                        {['#000000','#333333','#666666','#999999','#CCCCCC','#FFFFFF','#E05252','#D97706','#16A34A','#2563EB','#7C3AED','#DB2777','#2563EB','#2563EB'].map((c) => (
                          <button key={c} type="button" onClick={() => { setEditorTextColor(c); document.execCommand('foreColor', false, c); setShowColorPicker(false); }} className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 hover:scale-125 transition-transform" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Highlight Color */}
                  <div className="relative">
                    <button type="button" onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowColorPicker(false); }} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155] flex items-center gap-0.5" title="Background Color">
                      <Highlighter className="w-3.5 h-3.5 text-[#475569] dark:text-[#D8E3F1]" />
                      <span className="w-2.5 h-1 rounded-full" style={{ backgroundColor: editorHighlightColor }}></span>
                    </button>
                    {showHighlightPicker && (
                      <div className="absolute top-7 left-0 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-lg shadow-xl p-2 z-50 grid grid-cols-6 gap-1 w-[140px]">
                        {['#FFFF00','#00FF00','#00FFFF','#FF69B4','#FFA500','#FF6347','#E6E6FA','#98FB98','#87CEEB','#FFFFFF'].map((c) => (
                          <button key={c} type="button" onClick={() => { setEditorHighlightColor(c); document.execCommand('hiliteColor', false, c); setShowHighlightPicker(false); }} className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 hover:scale-125 transition-transform" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="w-px h-4 bg-[#D8E3F1] dark:bg-[#475569] mx-1"></span>

                  {/* Styles Dropdown */}
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="px-2 py-0.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#475569] rounded text-[11px] text-[#334155] dark:text-white"
                  >
                    <option value="Styles">Styles</option>
                    <option value="lead">Lead Paragraph</option>
                    <option value="badge">Badge Tag</option>
                    <option value="italic-title">Italic Title</option>
                  </select>

                  {/* Format Dropdown */}
                  <select
                    value={selectedFormat}
                    onChange={(e) => {
                      setSelectedFormat(e.target.value);
                      const tag = e.target.value === 'Normal' ? 'P' : e.target.value === 'Heading 1' ? 'H1' : e.target.value === 'Heading 2' ? 'H2' : e.target.value === 'Heading 3' ? 'H3' : 'P';
                      document.execCommand('formatBlock', false, tag);
                    }}
                    className="px-2 py-0.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#475569] rounded text-[11px] text-[#334155] dark:text-white"
                  >
                    <option value="Normal">Format (Normal)</option>
                    <option value="Heading 1">Heading 1</option>
                    <option value="Heading 2">Heading 2</option>
                    <option value="Heading 3">Heading 3</option>
                    <option value="Formatted">Formatted</option>
                  </select>

                  {/* Font Dropdown */}
                  <select
                    value={selectedFont}
                    onChange={(e) => {
                      setSelectedFont(e.target.value);
                      formatDescription('fontName');
                    }}
                    className="px-2 py-0.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#475569] rounded text-[11px] text-[#334155] dark:text-white"
                  >
                    <option value="Arial">Font (Arial)</option>
                    <option value="Comic Sans MS">Comic Sans MS</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Lucida Sans">Lucida Sans</option>
                    <option value="Tahoma">Tahoma</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Trebuchet MS">Trebuchet MS</option>
                    <option value="Verdana">Verdana</option>
                  </select>

                  {/* Size Dropdown */}
                  <select
                    value={selectedFontSize}
                    onChange={(e) => {
                      setSelectedFontSize(e.target.value);
                      formatDescription('fontSize');
                    }}
                    className="px-2 py-0.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#475569] rounded text-[11px] text-[#334155] dark:text-white"
                  >
                    <option value="1">Size (8)</option>
                    <option value="2">9</option>
                    <option value="2">10</option>
                    <option value="3">11</option>
                    <option value="3">12</option>
                    <option value="4">14</option>
                    <option value="5">16</option>
                    <option value="5">18</option>
                    <option value="6">20</option>
                    <option value="6">24</option>
                    <option value="7">28</option>
                    <option value="7">36</option>
                  </select>
                </div>

                {/* Popovers for Link & Table */}
                {showLinkInput && (
                  <div className="p-2.5 bg-[#FFFFFF] dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] flex items-center gap-2 text-xs">
                    <span className="text-[11px] font-semibold text-[#475569]">URL:</span>
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-2 py-1 bg-white dark:bg-[#475569] border border-[#D8E3F1] rounded text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (linkUrl.trim()) {
                          document.execCommand('createLink', false, linkUrl.trim());
                          setLinkUrl('');
                          setShowLinkInput(false);
                        }
                      }}
                      className="px-3 py-1 bg-[#2563EB] text-white text-[11px] font-bold rounded"
                    >
                      Insert Link
                    </button>
                    <button type="button" onClick={() => setShowLinkInput(false)} className="text-[#64748B] text-xs">✕</button>
                  </div>
                )}

                {showTableInput && (
                  <div className="p-2.5 bg-[#FFFFFF] dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] flex items-center gap-3 text-xs">
                    <span className="text-[11px] font-semibold text-[#475569]">Table:</span>
                    <label className="flex items-center gap-1 text-[11px]">
                      <span>Rows:</span>
                      <input type="number" min={1} max={10} value={tableRows} onChange={(e) => setTableRows(Number(e.target.value))} className="w-12 px-1 py-0.5 border rounded text-xs text-center" />
                    </label>
                    <label className="flex items-center gap-1 text-[11px]">
                      <span>Cols:</span>
                      <input type="number" min={1} max={8} value={tableCols} onChange={(e) => setTableCols(Number(e.target.value))} className="w-12 px-1 py-0.5 border rounded text-xs text-center" />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        let html = '<table style="border-collapse:collapse;width:100%;border:1px solid #D8E3F1;margin:8px 0"><thead><tr>';
                        for (let c = 0; c < tableCols; c++) html += `<th style="border:1px solid #D8E3F1;padding:6px 10px;background:#F1F5F9;font-weight:bold;text-align:left;font-size:12px">Col ${c + 1}</th>`;
                        html += '</tr></thead><tbody>';
                        for (let r = 0; r < tableRows; r++) {
                          html += '<tr>';
                          for (let c = 0; c < tableCols; c++) html += `<td style="border:1px solid #D8E3F1;padding:6px 10px;font-size:12px">&nbsp;</td>`;
                          html += '</tr>';
                        }
                        html += '</tbody></table>';
                        document.execCommand('insertHTML', false, html);
                        setShowTableInput(false);
                      }}
                      className="px-3 py-1 bg-[#2563EB] text-white text-[11px] font-bold rounded"
                    >
                      Insert
                    </button>
                    <button type="button" onClick={() => setShowTableInput(false)} className="text-[#64748B] text-xs">✕</button>
                  </div>
                )}

                {/* Editor Content Area */}
                {isSourceMode ? (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={12}
                    className="w-full p-4 font-mono text-xs text-[#1E293B] dark:text-white bg-white dark:bg-[#475569] focus:outline-none"
                    placeholder="<p>Enter HTML source code here...</p>"
                  />
                ) : (
                  <div
                    ref={descriptionEditorRef}
                    contentEditable
                    suppressContentEditableWarning
                    role="textbox"
                    aria-label="Job Description"
                    aria-multiline="true"
                    onInput={(e) => setDescription(e.currentTarget.innerHTML)}
                    data-placeholder="Enter job description..."
                    className="min-h-[280px] w-full p-4 text-xs font-sans text-[#1E293B] dark:text-white bg-white dark:bg-[#475569] focus:outline-none whitespace-pre-wrap leading-relaxed"
                    style={{ fontFamily: selectedFont }}
                  />
                )}
              </div>

              {/* Bottom Left: Add Public Job Details Pill Button (Ceipal Exact as Screenshot 1) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsPublicJdOpen(true)}
                  className="px-3.5 py-1 rounded-full bg-[#52B72A] hover:bg-[#46A323] text-white text-[11px] font-bold shadow-xs inline-flex items-center gap-1 transition-colors"
                >
                  Add Public Job Details
                </button>
              </div>

              {/* Career Portal Toggle & Secondary Managers */}
              <div className="pt-3 border-t border-[#D8E3F1] dark:border-[#334155] grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-xs">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-[#1E293B] dark:text-white">
                    <input
                      type="checkbox"
                      checked={postJobOnCareerPortal}
                      onChange={(e) => setPostJobOnCareerPortal(e.target.checked)}
                      className="w-4 h-4 rounded border-[#D8E3F1] text-[#1E293B] focus:ring-[#2563EB]"
                    />
                    <span>Post Job on Career Portal</span>
                  </label>
                  <p className="text-[11px] text-[#64748B] dark:text-[#BFDBFE] pl-6 mt-0.5">
                    Broadcast position to your company careers page
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-[#64748B] dark:text-[#BFDBFE] mb-1">
                    Secondary Sales Manager
                  </label>
                  <select
                    value={secondarySalesManager}
                    onChange={(e) => setSecondarySalesManager(e.target.value)}
                    className="w-full p-2 bg-[#FFFFFF] dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                  >
                    <option value="Marcus Vance">Marcus Vance</option>
                    <option value="Elena Rostova">Elena Rostova</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#64748B] dark:text-[#BFDBFE] mb-1">
                    Secondary Recruitment Manager
                  </label>
                  <select
                    value={secondaryRecruitmentManager}
                    onChange={(e) => setSecondaryRecruitmentManager(e.target.value)}
                    className="w-full p-2 bg-[#FFFFFF] dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-medium"
                  >
                    <option value="Elena Rostova">Elena Rostova</option>
                    <option value="Rajesh Ramanathan">Rajesh Ramanathan</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: USER DEFINED FIELDS */}
          <div className="bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-3xl p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-[#1E293B] dark:text-white uppercase tracking-wider">
              5. User Defined Fields
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#64748B] dark:text-[#BFDBFE] mb-1">Cost Center</label>
                <input
                  type="text"
                  value={costCenter}
                  onChange={(e) => setCostCenter(e.target.value)}
                  className="w-full p-2.5 bg-[#FFFFFF] dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#64748B] dark:text-[#BFDBFE] mb-1">Department Code</label>
                <input
                  type="text"
                  value={departmentCode}
                  onChange={(e) => setDepartmentCode(e.target.value)}
                  className="w-full p-2.5 bg-[#FFFFFF] dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#64748B] dark:text-[#BFDBFE] mb-1">PO Number</label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full p-2.5 bg-[#FFFFFF] dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-xl font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* SECTION 6: DOCUMENTS (CEIPAL EXACT REPLICA: LOCAL DRIVE, DROPBOX, BOX) */}
          <div className="bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#1E293B] dark:text-white">
              Documents
            </h3>

            {/* Exactly 3 Square Buttons matching Ceipal photo: Local Drive, Dropbox, Box */}
            <div className="flex items-center gap-2">
              {/* 1. Local Drive */}
              <div className="relative group">
                <label
                  htmlFor="local-drive-upload"
                  className="w-10 h-10 rounded border border-[#D8E3F1] dark:border-[#475569] bg-white dark:bg-[#1E293B] flex items-center justify-center cursor-pointer hover:border-[#64748B] hover:bg-[#FFFFFF] dark:hover:bg-[#334155] transition-all shadow-2xs"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                    <rect x="2.5" y="3.5" width="19" height="13" rx="1.5" stroke="#334155" strokeWidth="1.4" fill="#0084FF" />
                    <path d="M4 4.5h8l-5 11H4z" fill="white" fillOpacity="0.25" />
                    <path d="M12 16.5v3" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M8.5 19.5h7" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input
                    id="local-drive-upload"
                    type="file"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleLocalFilesUpload(e.target.files);
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
                {/* Tooltip: Local Drive */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                  <div className="w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-[#1E293B]"></div>
                  <div className="bg-[#1E293B] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg whitespace-nowrap">
                    Local Drive
                  </div>
                </div>
              </div>

              {/* 2. Dropbox */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setActiveDocModal('dropbox')}
                  className="w-10 h-10 rounded border border-[#D8E3F1] dark:border-[#475569] bg-white dark:bg-[#1E293B] flex items-center justify-center cursor-pointer hover:border-[#64748B] hover:bg-[#FFFFFF] dark:hover:bg-[#334155] transition-all shadow-2xs"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#0061FE]">
                    <path d="M6.033 2.5 0 6.666l6.033 4.167 6.034-4.167L6.033 2.5zm11.934 0-6.034 4.166 6.034 4.167L24 6.666 17.967 2.5zM0 15l6.033 4.167 6.034-4.167-6.034-4.167L0 15zm17.967-4.167-6.034 4.167 6.034 4.167L24 15l-6.033-4.167zM6.033 20.25 12 16.146l5.967 4.104L12 24.354l-5.967-4.104z" />
                  </svg>
                </button>
                {/* Tooltip: Dropbox */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                  <div className="w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-[#1E293B]"></div>
                  <div className="bg-[#1E293B] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg whitespace-nowrap">
                    Dropbox
                  </div>
                </div>
              </div>

              {/* 3. Box */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setActiveDocModal('box')}
                  className="w-10 h-10 rounded border border-[#D8E3F1] dark:border-[#475569] bg-white dark:bg-[#1E293B] flex items-center justify-center cursor-pointer hover:border-[#64748B] hover:bg-[#FFFFFF] dark:hover:bg-[#334155] transition-all shadow-2xs"
                >
                  <span className="text-[#0061D5] font-black text-base tracking-tighter leading-none lowercase select-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    box
                  </span>
                </button>
                {/* Tooltip: Box */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                  <div className="w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-[#1E293B]"></div>
                  <div className="bg-[#1E293B] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg whitespace-nowrap">
                    Box
                  </div>
                </div>
              </div>
            </div>

            {/* Attached Documents List */}
            {documents.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-[#D8E3F1] dark:border-[#334155]">
                <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#BFDBFE]">
                  <span className="font-bold text-[#1E293B] dark:text-white">
                    Attached Files ({documents.length})
                  </span>
                  <span>
                    Total: {(documents.reduce((acc, d) => acc + d.size, 0) / 1024).toFixed(1)} KB
                  </span>
                </div>

                <div className="divide-y divide-[#D8E3F1] dark:border-[#334155] border border-[#D8E3F1] dark:border-[#334155] rounded-xl overflow-hidden bg-white dark:bg-[#475569]">
                  {documents.map((file, index) => {
                    const src = documentSources[file.name] || 'Local Drive';
                    return (
                      <div
                        key={`${file.name}-${index}`}
                        className="p-2.5 flex items-center justify-between gap-3 text-xs hover:bg-[#FFFFFF] dark:hover:bg-[#1E293B] transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-[#1E293B] shrink-0" />
                          <div className="min-w-0">
                            <span className="font-semibold text-[#1E293B] dark:text-white truncate block">
                              {file.name}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-[#64748B]">
                              <span>{(file.size / 1024).toFixed(0)} KB</span>
                              <span>•</span>
                              <span className="px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 font-medium">
                                {src}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={documentCategories[file.name] || 'Client Job Spec (SOW)'}
                            onChange={(e) => {
                              setDocumentCategories({
                                ...documentCategories,
                                [file.name]: e.target.value
                              });
                            }}
                            className="px-2 py-1 bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded text-xs text-[#1E293B] dark:text-white"
                          >
                            <option value="Client Job Spec (SOW)">Client Job Spec (SOW)</option>
                            <option value="Assessment Rubric">Assessment Rubric</option>
                            <option value="Rate Card / Agreement">Rate Card / Agreement</option>
                            <option value="Candidate NDA">Candidate NDA</option>
                            <option value="Technical Matrix">Technical Matrix</option>
                            <option value="Right to Represent (RTR)">Right to Represent (RTR)</option>
                            <option value="Other Attachment">Other Attachment</option>
                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              setDocuments((current) => current.filter((_, fileIndex) => fileIndex !== index))
                            }
                            aria-label={`Remove ${file.name}`}
                            className="p-1 text-[#64748B] hover:text-[#E05252] rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Dropbox File Selection Modal */}
          {activeDocModal === 'dropbox' && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-2xl shadow-2xl max-w-lg w-full p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#D8E3F1] dark:border-[#334155]">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#0061FE]">
                      <path d="M6.033 2.5 0 6.666l6.033 4.167 6.034-4.167L6.033 2.5zm11.934 0-6.034 4.166 6.034 4.167L24 6.666 17.967 2.5zM0 15l6.033 4.167 6.034-4.167-6.034-4.167L0 15zm17.967-4.167-6.034 4.167 6.034 4.167L24 15l-6.033-4.167zM6.033 20.25 12 16.146l5.967 4.104L12 24.354l-5.967-4.104z" />
                    </svg>
                    <h3 className="text-sm font-bold text-[#1E293B] dark:text-white">
                      Dropbox File Chooser
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setActiveDocModal(null); setDropboxSelectedFiles([]); }}
                    className="text-[#64748B] hover:text-[#1E293B] p-1 text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-xs text-[#64748B] dark:text-[#BFDBFE]">
                  Select files from your Dropbox account to attach to this job:
                </div>

                <div className="divide-y divide-[#D8E3F1] dark:divide-[#334155] border border-[#D8E3F1] dark:border-[#334155] rounded-xl max-h-60 overflow-y-auto bg-[#FFFFFF] dark:bg-[#475569]">
                  {[
                    { name: `${client ? client.replace(/\s+/g, '_') : 'Client'}_Master_SOW_Spec.pdf`, size: 184320, type: 'application/pdf', category: 'Client Job Spec (SOW)' },
                    { name: `${title ? title.replace(/\s+/g, '_') : 'Software_Eng'}_Technical_Matrix.xlsx`, size: 84992, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'Technical Matrix' },
                    { name: 'Ampcus_Candidate_NDA_Standard.pdf', size: 98304, type: 'application/pdf', category: 'Candidate NDA' },
                    { name: 'Technical_Assessment_Scoring_Rubric.pdf', size: 114688, type: 'application/pdf', category: 'Assessment Rubric' }
                  ].map((f) => {
                    const isSelected = dropboxSelectedFiles.includes(f.name);
                    return (
                      <div
                        key={f.name}
                        onClick={() => {
                          if (isSelected) {
                            setDropboxSelectedFiles(prev => prev.filter(n => n !== f.name));
                          } else {
                            setDropboxSelectedFiles(prev => [...prev, f.name]);
                          }
                        }}
                        className={`p-3 flex items-center justify-between text-xs cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-950/50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input type="checkbox" checked={isSelected} readOnly className="rounded text-[#0061FE]" />
                          <FileText className="w-4 h-4 text-[#0061FE]" />
                          <div>
                            <div className="font-semibold text-[#1E293B] dark:text-white">{f.name}</div>
                            <div className="text-[10px] text-[#64748B]">{(f.size / 1024).toFixed(0)} KB • {f.category}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-[#64748B]">
                    {dropboxSelectedFiles.length} file(s) selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setActiveDocModal(null); setDropboxSelectedFiles([]); }}
                      className="px-3 py-1.5 rounded-lg border border-[#D8E3F1] dark:border-[#334155] text-xs font-semibold text-[#64748B]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={dropboxSelectedFiles.length === 0}
                      onClick={() => {
                        const allDropboxFiles = [
                          { name: `${client ? client.replace(/\s+/g, '_') : 'Client'}_Master_SOW_Spec.pdf`, size: 184320, type: 'application/pdf', category: 'Client Job Spec (SOW)' },
                          { name: `${title ? title.replace(/\s+/g, '_') : 'Software_Eng'}_Technical_Matrix.xlsx`, size: 84992, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'Technical Matrix' },
                          { name: 'Ampcus_Candidate_NDA_Standard.pdf', size: 98304, type: 'application/pdf', category: 'Candidate NDA' },
                          { name: 'Technical_Assessment_Scoring_Rubric.pdf', size: 114688, type: 'application/pdf', category: 'Assessment Rubric' }
                        ];
                        const filesToAttach = allDropboxFiles.filter(f => dropboxSelectedFiles.includes(f.name));
                        handleAttachCloudFiles('Dropbox', filesToAttach);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-[#0061FE] hover:bg-[#0052D4] disabled:opacity-50 text-white text-xs font-bold transition-colors"
                    >
                      Attach Selected
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Box File Selection Modal */}
          {activeDocModal === 'box' && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-2xl shadow-2xl max-w-lg w-full p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#D8E3F1] dark:border-[#334155]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#0061D5] font-extrabold text-lg tracking-tight lowercase">
                      box
                    </span>
                    <h3 className="text-sm font-bold text-[#1E293B] dark:text-white">
                      Box File Chooser
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setActiveDocModal(null); setBoxSelectedFiles([]); }}
                    className="text-[#64748B] hover:text-[#1E293B] p-1 text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-xs text-[#64748B] dark:text-[#BFDBFE]">
                  Select files from your Box enterprise repository:
                </div>

                <div className="divide-y divide-[#D8E3F1] dark:divide-[#334155] border border-[#D8E3F1] dark:border-[#334155] rounded-xl max-h-60 overflow-y-auto bg-[#FFFFFF] dark:bg-[#475569]">
                  {[
                    { name: `${client ? client.replace(/\s+/g, '_') : 'Enterprise'}_Staffing_Rate_Card.pdf`, size: 245760, type: 'application/pdf', category: 'Rate Card / Agreement' },
                    { name: `${title ? title.replace(/\s+/g, '_') : 'Engineering'}_Requirement_Brief.docx`, size: 69632, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'Client Job Spec (SOW)' },
                    { name: 'Candidate_Right_To_Represent_RTR.pdf', size: 104448, type: 'application/pdf', category: 'Right to Represent (RTR)' },
                    { name: 'Client_Service_Level_Agreement_SLA.pdf', size: 317440, type: 'application/pdf', category: 'Rate Card / Agreement' }
                  ].map((f) => {
                    const isSelected = boxSelectedFiles.includes(f.name);
                    return (
                      <div
                        key={f.name}
                        onClick={() => {
                          if (isSelected) {
                            setBoxSelectedFiles(prev => prev.filter(n => n !== f.name));
                          } else {
                            setBoxSelectedFiles(prev => [...prev, f.name]);
                          }
                        }}
                        className={`p-3 flex items-center justify-between text-xs cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-950/50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input type="checkbox" checked={isSelected} readOnly className="rounded text-[#0061D5]" />
                          <FileText className="w-4 h-4 text-[#0061D5]" />
                          <div>
                            <div className="font-semibold text-[#1E293B] dark:text-white">{f.name}</div>
                            <div className="text-[10px] text-[#64748B]">{(f.size / 1024).toFixed(0)} KB • {f.category}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-[#64748B]">
                    {boxSelectedFiles.length} file(s) selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setActiveDocModal(null); setBoxSelectedFiles([]); }}
                      className="px-3 py-1.5 rounded-lg border border-[#D8E3F1] dark:border-[#334155] text-xs font-semibold text-[#64748B]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={boxSelectedFiles.length === 0}
                      onClick={() => {
                        const allBoxFiles = [
                          { name: `${client ? client.replace(/\s+/g, '_') : 'Enterprise'}_Staffing_Rate_Card.pdf`, size: 245760, type: 'application/pdf', category: 'Rate Card / Agreement' },
                          { name: `${title ? title.replace(/\s+/g, '_') : 'Engineering'}_Requirement_Brief.docx`, size: 69632, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'Client Job Spec (SOW)' },
                          { name: 'Candidate_Right_To_Represent_RTR.pdf', size: 104448, type: 'application/pdf', category: 'Right to Represent (RTR)' },
                          { name: 'Client_Service_Level_Agreement_SLA.pdf', size: 317440, type: 'application/pdf', category: 'Rate Card / Agreement' }
                        ];
                        const filesToAttach = allBoxFiles.filter(f => boxSelectedFiles.includes(f.name));
                        handleAttachCloudFiles('Box', filesToAttach);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-[#0061D5] hover:bg-[#004EB5] disabled:opacity-50 text-white text-xs font-bold transition-colors"
                    >
                      Attach Selected
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ceipal Feature Modal: Public Job Details */}
          {isPublicJdOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#D8E3F1] dark:border-[#334155]">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#1E293B]" />
                    <h3 className="text-base font-bold text-[#1E293B] dark:text-white">
                      Public Job Details (Career Portal Sanitized)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPublicJdOpen(false)}
                    className="text-[#64748B] hover:text-[#1E293B] p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-[#64748B] dark:text-[#BFDBFE]">
                  Define public-facing role details without internal bill rates or confidential client names to show on candidate job portals.
                </p>
                <textarea
                  rows={8}
                  value={publicJobDetails || description.replace(/<[^>]*>/g, '')}
                  onChange={(e) => setPublicJobDetails(e.target.value)}
                  placeholder="Sanitized public job description..."
                  className="w-full p-3 bg-[#FFFFFF] dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-xs"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPublicJdOpen(false)}
                    className="px-4 py-2 bg-[#2563EB] text-white font-bold rounded-xl text-xs"
                  >
                    Save Public Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ceipal Feature Modal: Candidate Email Pitch Preview (Screenshot 201120 / 201212) */}
          {isEmailPreviewOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-[#D8E3F1] dark:border-[#334155]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#1E293B]" />
                    <h3 className="text-base font-bold text-[#1E293B] dark:text-white">
                      Ceipal Email Pitch Preview
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEmailPreviewOpen(false)}
                    className="text-[#64748B] hover:text-[#1E293B] p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-[#FFFFFF] dark:bg-[#475569] rounded-xl space-y-1 text-xs">
                  <div><strong>From:</strong> system ({assignedRecruiter.toLowerCase().replace(' ', '.')}@ampcustech.com)</div>
                  <div><strong>Subject:</strong> Job Opportunity: {title || 'Software Engineer'} at {businessUnit} - {location}</div>
                </div>

                <div className="p-4 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-xs space-y-3 leading-relaxed">
                  <p>Hello,</p>
                  <p><strong>Candidate Summary:</strong> Attached profile under evaluation.</p>
                  <p><strong>Job Description:</strong></p>
                  <div
                    className="p-3 bg-gray-50 dark:bg-[#475569] rounded-lg border border-[#D8E3F1] dark:border-[#334155] text-xs whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: description || '<p>No description entered yet.</p>'
                    }}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEmailPreviewOpen(false)}
                    className="px-4 py-2 bg-[#2563EB] text-white font-bold rounded-xl text-xs"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-2xl shadow-xs">
            {creationMode === 'manual' ? (
              <>
                <button
                  type="button"
                  onClick={() => setCreationMode('select')}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#FFFFFF] dark:bg-[#475569] text-[#64748B] dark:text-[#BFDBFE] rounded-xl text-xs font-semibold hover:text-[#1E293B] disabled:opacity-50"
                >
                  Back
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] text-xs font-semibold text-[#64748B] dark:text-[#BFDBFE] rounded-xl hover:bg-[#FFFFFF] disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save as Draft'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold shadow-md shadow-[#2563EB]/20 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSubmitting ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('jobs')}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setCreationMode('select')}
                  className="px-4 py-2 bg-[#FFFFFF] dark:bg-[#475569] text-[#64748B] dark:text-[#BFDBFE] rounded-xl text-xs font-semibold hover:text-[#1E293B]"
                >
                  ← Back to Methods
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('jobs')}
                    className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#1E293B]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold shadow-md shadow-[#2563EB]/20 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSubmitting ? 'Publishing Requisition...' : 'Save & Publish Job Posting'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      )}
        </>
      )}
      </div>
    </div>
  );
};
