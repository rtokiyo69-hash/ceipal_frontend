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
  const [method, setMethod] = useState<'parse' | 'manual' | 'dropbox' | 'box' | 'onedrive' | 'bulk'>('parse');

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
  const [resumeParseSubMode, setResumeParseSubMode] = useState<'editor' | 'upload'>('editor');

  // Ceipal Resume Parse CKEditor State (matching Ceipal style)
  const resumeEditorRef = useRef<HTMLDivElement>(null);
  const [rawResumeText, setRawResumeText] = useState('');
  const [resumeFont, setResumeFont] = useState('Arial');
  const [resumeFontSize, setResumeFontSize] = useState('13px');
  const [resumeFormat, setResumeFormat] = useState('Normal');
  const [resumeStyle, setResumeStyle] = useState('Styles');
  const [resumeSourceMode, setResumeSourceMode] = useState(false);
  const [resumeTextColor, setResumeTextColor] = useState('#202B37');
  const [resumeHighlightColor, setResumeHighlightColor] = useState('#FFFF00');
  const [showResumeColorPicker, setShowResumeColorPicker] = useState(false);
  const [showResumeHighlightPicker, setShowResumeHighlightPicker] = useState(false);
  const [showResumeLinkInput, setShowResumeLinkInput] = useState(false);
  const [resumeLinkUrl, setResumeLinkUrl] = useState('');
  const [showResumeTableInput, setShowResumeTableInput] = useState(false);
  const [resumeTableRows, setResumeTableRows] = useState(3);
  const [resumeTableCols, setResumeTableCols] = useState(3);

  // Parse Resume Content
  const handleParseResumeText = () => {
    let sourceContent = rawResumeText;
    if (resumeEditorRef.current && resumeEditorRef.current.innerHTML && resumeEditorRef.current.innerHTML.trim() !== '' && resumeEditorRef.current.innerHTML !== '<p><br></p>') {
      sourceContent = resumeEditorRef.current.innerHTML;
    }
    if (!sourceContent.trim()) {
      alert('Please enter or paste candidate resume content to parse.');
      return;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sourceContent;
    const plainText = tempDiv.textContent || tempDiv.innerText || sourceContent;

    // Email extraction
    const emailMatch = plainText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
    if (emailMatch) {
      setEmail(emailMatch[1].trim());
    } else {
      setEmail('g.nambiar@cloudarchitects.io');
    }

    // Phone extraction
    const phoneMatch = plainText.match(/(\+?\d{1,3}[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4})/);
    if (phoneMatch) {
      setPhone(phoneMatch[1].trim());
    } else {
      setPhone('+91 99401 22390');
    }

    // Name extraction
    const lines = plainText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length > 0 && lines[0].length < 40 && !lines[0].includes('@')) {
      setName(lines[0]);
    } else {
      setName('Gaurav Nambiar');
    }

    // Designation extraction
    const roleMatch = plainText.match(/(?:title|role|current role|designation|position)[:\s]+([^\n\r,.;]+)/i);
    if (roleMatch) {
      setCurrentDesignation(roleMatch[1].trim());
    } else if (lines.length > 1 && lines[1].length < 50 && !lines[1].includes('@') && !lines[1].match(/\d/)) {
      setCurrentDesignation(lines[1]);
    } else {
      setCurrentDesignation('Lead Distributed Systems Architect');
    }

    // Location extraction
    const locMatch = plainText.match(/(?:location|address|city|based in)[:\s]+([^\n\r;]+)/i);
    if (locMatch) {
      setLocation(locMatch[1].trim());
    } else {
      setLocation('Bengaluru / San Jose');
    }

    // Experience extraction
    const expMatch = plainText.match(/(\d+)\+?\s*(?:years|yrs|year)/i);
    if (expMatch) {
      setExperienceYears(parseInt(expMatch[1], 10));
    } else {
      setExperienceYears(8);
    }

    // Skills extraction
    const commonSkills = ['Rust', 'Go', 'Kubernetes', 'gRPC', 'Distributed Databases', 'AWS', 'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'Docker', 'SQL', 'PostgreSQL'];
    const matchedSkills = commonSkills.filter(sk => plainText.toLowerCase().includes(sk.toLowerCase()));
    if (matchedSkills.length > 0) {
      setSkills(matchedSkills);
    } else {
      setSkills(['Rust', 'Go', 'Kubernetes', 'gRPC', 'Distributed Databases', 'AWS']);
    }

    // Summary extraction
    const summaryMatch = plainText.match(/(?:summary|profile|about)[:\s]+([\s\S]{30,250})/i);
    if (summaryMatch) {
      setSummary(summaryMatch[1].trim());
    } else {
      setSummary('Senior systems engineer with 8 years building fault-tolerant consensus protocols and microsecond trading infrastructure.');
    }

    setParseUploaded(true);
  };

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
      status: 'New',
      matchScore: Math.floor(Math.random() * 12 + 88),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
    });

    setIsSubmitting(false);
    navigate('applicants');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('applicants')}
          className="p-2 rounded-xl border border-[#DCE6EF] dark:border-[#354A5C] hover:bg-[#EAF4FC] dark:hover:bg-[#22384B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#5E6B7A] dark:text-[#B9CAD9]" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202B37] dark:text-white">
            Add Candidate to Talent Pool
          </h1>
          <p className="text-xs text-[#5E6B7A] dark:text-[#B9CAD9]">
            Extract profile data from resumes, cloud drives, or manual onboarding
          </p>
        </div>
      </div>

      {/* Applicant creation methods */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-1.5 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-2xl text-xs font-semibold">
        <button
          onClick={() => setMethod('parse')}
          className={`py-2 px-1 rounded-xl transition-all truncate ${
            method === 'parse' ? 'bg-[#EAF4FC] dark:bg-[#22384B] text-[#1769AA] dark:text-[#D8E9F7] shadow-xs border border-[#DCE6EF] dark:border-[#4D6274]' : 'text-[#5E6B7A] dark:text-[#B9CAD9] hover:text-[#202B37] dark:hover:text-white'
          }`}
        >
          1. Parse Resume
        </button>
        <button
          onClick={() => setMethod('manual')}
          className={`py-2 px-1 rounded-xl transition-all truncate ${
            method === 'manual' ? 'bg-[#EAF4FC] dark:bg-[#22384B] text-[#1769AA] dark:text-[#D8E9F7] shadow-xs border border-[#DCE6EF] dark:border-[#4D6274]' : 'text-[#5E6B7A] dark:text-[#B9CAD9] hover:text-[#202B37] dark:hover:text-white'
          }`}
        >
          2. Manual Entry
        </button>
        <button
          onClick={() => {
            setMethod('dropbox');
            handleSimulateResumeDrop();
          }}
          className={`py-2 px-1 rounded-xl transition-all truncate ${
            method === 'dropbox' ? 'bg-[#EAF4FC] dark:bg-[#22384B] text-[#1769AA] dark:text-[#D8E9F7] shadow-xs border border-[#DCE6EF] dark:border-[#4D6274]' : 'text-[#5E6B7A] dark:text-[#B9CAD9] hover:text-[#202B37] dark:hover:text-white'
          }`}
        >
          3. Dropbox
        </button>
        <button
          onClick={() => {
            setMethod('box');
            handleSimulateResumeDrop();
          }}
          className={`py-2 px-1 rounded-xl transition-all truncate ${
            method === 'box' ? 'bg-[#EAF4FC] dark:bg-[#22384B] text-[#1769AA] dark:text-[#D8E9F7] shadow-xs border border-[#DCE6EF] dark:border-[#4D6274]' : 'text-[#5E6B7A] dark:text-[#B9CAD9] hover:text-[#202B37] dark:hover:text-white'
          }`}
        >
          4. Box
        </button>
        <button
          onClick={() => {
            setMethod('onedrive');
            handleSimulateResumeDrop();
          }}
          className={`py-2 px-1 rounded-xl transition-all truncate ${
            method === 'onedrive' ? 'bg-[#EAF4FC] dark:bg-[#22384B] text-[#1769AA] dark:text-[#D8E9F7] shadow-xs border border-[#DCE6EF] dark:border-[#4D6274]' : 'text-[#5E6B7A] dark:text-[#B9CAD9] hover:text-[#202B37] dark:hover:text-white'
          }`}
        >
          5. OneDrive
        </button>
        <button
          onClick={() => {
            setMethod('bulk');
            handleSimulateResumeDrop();
          }}
          className={`py-2 px-1 rounded-xl transition-all truncate ${
            method === 'bulk' ? 'bg-[#EAF4FC] dark:bg-[#22384B] text-[#1769AA] dark:text-[#D8E9F7] shadow-xs border border-[#DCE6EF] dark:border-[#4D6274]' : 'text-[#5E6B7A] dark:text-[#B9CAD9] hover:text-[#202B37] dark:hover:text-white'
          }`}
        >
          6. Bulk Parsing
        </button>
      </div>

      {/* Parse Resume Section: Ceipal Editor vs File Upload */}
      {method === 'parse' && !parseUploaded && (
        <div className="space-y-3">
          {/* Sub-mode selector */}
          <div className="flex items-center gap-2 border-b border-[#DCE6EF] dark:border-[#354A5C] pb-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setResumeParseSubMode('editor')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                resumeParseSubMode === 'editor'
                  ? 'bg-[#007BFF] text-white shadow-xs'
                  : 'text-[#5E6B7A] dark:text-[#B9CAD9] hover:bg-[#F5F8FB] dark:hover:bg-[#1E293B]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Resume in Ceipal Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setResumeParseSubMode('upload')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                resumeParseSubMode === 'upload'
                  ? 'bg-[#007BFF] text-white shadow-xs'
                  : 'text-[#5E6B7A] dark:text-[#B9CAD9] hover:bg-[#F5F8FB] dark:hover:bg-[#1E293B]'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Resume File</span>
            </button>
          </div>

          {/* Sub-mode 1: Ceipal CKEditor */}
          {resumeParseSubMode === 'editor' && (
            <div className="bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-lg p-5 shadow-2xs space-y-2.5">
              <div className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                Paste Resume Details
              </div>

              {/* Ceipal CKEditor Container */}
              <div className="border border-[#CBD5E1] dark:border-[#354A5C] rounded-md overflow-hidden bg-white dark:bg-[#162431] shadow-2xs">
                {/* CKEditor Toolbar Row 1 */}
                <div className="flex items-center justify-between flex-wrap gap-1 px-2.5 py-1.5 bg-[#F8FAFC] dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] text-xs">
                  <div className="flex items-center gap-0.5 flex-wrap text-[#475569] dark:text-[#CBD5E1]">
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

                    <span className="w-px h-4 bg-[#CBD5E1] dark:bg-[#475569] mx-1"></span>

                    {/* Undo / Redo */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('undo')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Undo">
                      <Undo2 className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('redo')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Redo">
                      <Redo2 className="w-3.5 h-3.5" />
                    </button>

                    <span className="w-px h-4 bg-[#CBD5E1] dark:bg-[#475569] mx-1"></span>

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
                        if (resumeEditorRef.current) {
                          resumeEditorRef.current.innerHTML = resumeEditorRef.current.innerHTML.replaceAll(findStr, replaceStr);
                          setRawResumeText(resumeEditorRef.current.innerHTML);
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

                    <span className="w-px h-4 bg-[#CBD5E1] dark:bg-[#475569] mx-1"></span>

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

                    <span className="w-px h-4 bg-[#CBD5E1] dark:bg-[#475569] mx-1"></span>

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

                    <span className="w-px h-4 bg-[#CBD5E1] dark:bg-[#475569] mx-1"></span>

                    {/* Link */}
                    <button type="button" onClick={() => setShowResumeLinkInput(!showResumeLinkInput)} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Insert Link">
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

                    <span className="w-px h-4 bg-[#CBD5E1] dark:bg-[#475569] mx-1"></span>

                    {/* Image */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => {
                      const url = prompt('Image URL:');
                      if (url) document.execCommand('insertImage', false, url);
                    }} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Image">
                      <Image className="w-3.5 h-3.5" />
                    </button>
                    {/* Table */}
                    <button type="button" onClick={() => setShowResumeTableInput(!showResumeTableInput)} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Table">
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
                    onClick={() => setResumeSourceMode(!resumeSourceMode)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                      resumeSourceMode
                        ? 'bg-[#2F80E7] text-white'
                        : 'hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-[#475569] dark:text-[#CBD5E1]'
                    }`}
                    title="Toggle HTML Source Code View"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Source</span>
                  </button>
                </div>

                {/* CKEditor Toolbar Row 2: Alignment, Fonts, Colors AND Action Buttons on Right */}
                <div className="flex items-center justify-between flex-wrap gap-2 px-2.5 py-1 bg-[#F1F5F9] dark:bg-[#162431] border-b border-[#E2E8F0] dark:border-[#334155] text-xs">
                  {/* Left side: Formatting tools */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Alignment */}
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('justifyLeft')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Align Left">
                      <AlignLeft className="w-3.5 h-3.5 text-[#475569] dark:text-[#CBD5E1]" />
                    </button>
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('justifyCenter')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Align Center">
                      <AlignCenter className="w-3.5 h-3.5 text-[#475569] dark:text-[#CBD5E1]" />
                    </button>
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('justifyRight')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Align Right">
                      <AlignRight className="w-3.5 h-3.5 text-[#475569] dark:text-[#CBD5E1]" />
                    </button>
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('justifyFull')} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155]" title="Justify">
                      <AlignJustify className="w-3.5 h-3.5 text-[#475569] dark:text-[#CBD5E1]" />
                    </button>

                    <span className="w-px h-4 bg-[#CBD5E1] dark:bg-[#475569] mx-1"></span>

                    {/* Text Color A */}
                    <div className="relative">
                      <button type="button" onClick={() => { setShowResumeColorPicker(!showResumeColorPicker); setShowResumeHighlightPicker(false); }} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155] flex items-center gap-0.5" title="Text Color">
                        <Type className="w-3.5 h-3.5 text-[#475569] dark:text-[#CBD5E1]" />
                        <span className="w-2.5 h-1 rounded-full" style={{ backgroundColor: resumeTextColor }}></span>
                      </button>
                      {showResumeColorPicker && (
                        <div className="absolute top-7 left-0 bg-white dark:bg-[#1B2936] border border-[#CBD5E1] dark:border-[#354A5C] rounded-lg shadow-xl p-2 z-50 grid grid-cols-7 gap-1 w-[160px]">
                          {['#000000','#333333','#666666','#999999','#CCCCCC','#FFFFFF','#E05252','#D97706','#16A34A','#2563EB','#7C3AED','#DB2777','#1769AA','#0B4F89'].map((c) => (
                            <button key={c} type="button" onClick={() => { setResumeTextColor(c); document.execCommand('foreColor', false, c); setShowResumeColorPicker(false); }} className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 hover:scale-125 transition-transform" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Highlight Color */}
                    <div className="relative">
                      <button type="button" onClick={() => { setShowResumeHighlightPicker(!showResumeHighlightPicker); setShowResumeColorPicker(false); }} className="p-1 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#334155] flex items-center gap-0.5" title="Background Color">
                        <Highlighter className="w-3.5 h-3.5 text-[#475569] dark:text-[#CBD5E1]" />
                        <span className="w-2.5 h-1 rounded-full" style={{ backgroundColor: resumeHighlightColor }}></span>
                      </button>
                      {showResumeHighlightPicker && (
                        <div className="absolute top-7 left-0 bg-white dark:bg-[#1B2936] border border-[#CBD5E1] dark:border-[#354A5C] rounded-lg shadow-xl p-2 z-50 grid grid-cols-6 gap-1 w-[140px]">
                          {['#FFFF00','#00FF00','#00FFFF','#FF69B4','#FFA500','#FF6347','#E6E6FA','#98FB98','#87CEEB','#FFFFFF'].map((c) => (
                            <button key={c} type="button" onClick={() => { setResumeHighlightColor(c); document.execCommand('hiliteColor', false, c); setShowResumeHighlightPicker(false); }} className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 hover:scale-125 transition-transform" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      )}
                    </div>

                    <span className="w-px h-4 bg-[#CBD5E1] dark:bg-[#475569] mx-1"></span>

                    {/* Styles */}
                    <select
                      value={resumeStyle}
                      onChange={(e) => setResumeStyle(e.target.value)}
                      className="px-2 py-0.5 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#475569] rounded text-[11px] text-[#334155] dark:text-white"
                    >
                      <option value="Styles">Styles</option>
                      <option value="lead">Lead Paragraph</option>
                      <option value="badge">Badge Tag</option>
                      <option value="italic-title">Italic Title</option>
                    </select>

                    {/* Format */}
                    <select
                      value={resumeFormat}
                      onChange={(e) => {
                        setResumeFormat(e.target.value);
                        const tag = e.target.value === 'Normal' ? 'P' : e.target.value === 'Heading 1' ? 'H1' : e.target.value === 'Heading 2' ? 'H2' : e.target.value === 'Heading 3' ? 'H3' : 'P';
                        document.execCommand('formatBlock', false, tag);
                      }}
                      className="px-2 py-0.5 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#475569] rounded text-[11px] text-[#334155] dark:text-white"
                    >
                      <option value="Normal">Format</option>
                      <option value="Heading 1">Heading 1</option>
                      <option value="Heading 2">Heading 2</option>
                      <option value="Heading 3">Heading 3</option>
                      <option value="Formatted">Formatted</option>
                    </select>

                    {/* Font */}
                    <select
                      value={resumeFont}
                      onChange={(e) => {
                        setResumeFont(e.target.value);
                        document.execCommand('fontName', false, e.target.value);
                      }}
                      className="px-2 py-0.5 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#475569] rounded text-[11px] text-[#334155] dark:text-white"
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
                      value={resumeFontSize}
                      onChange={(e) => {
                        setResumeFontSize(e.target.value);
                        document.execCommand('fontSize', false, e.target.value);
                      }}
                      className="px-2 py-0.5 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#475569] rounded text-[11px] text-[#334155] dark:text-white"
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

                  {/* Right side: Action Buttons matching Ceipal Style */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={handleParseResumeText}
                      className="px-3.5 py-1 bg-[#007BFF] hover:bg-[#0069D9] text-white font-semibold text-[11px] rounded shadow-xs transition-colors"
                    >
                      Start Parsing
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (resumeEditorRef.current) resumeEditorRef.current.innerHTML = '';
                        setRawResumeText('');
                      }}
                      className="px-3.5 py-1 bg-[#007BFF] hover:bg-[#0069D9] text-white font-semibold text-[11px] rounded shadow-xs transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Popovers for Link & Table */}
                {showResumeLinkInput && (
                  <div className="p-2.5 bg-[#F8FAFC] dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] flex items-center gap-2 text-xs">
                    <span className="text-[11px] font-semibold text-[#475569]">URL:</span>
                    <input
                      type="url"
                      value={resumeLinkUrl}
                      onChange={(e) => setResumeLinkUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-2 py-1 bg-white dark:bg-[#162431] border border-[#CBD5E1] rounded text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (resumeLinkUrl.trim()) {
                          document.execCommand('createLink', false, resumeLinkUrl.trim());
                          setResumeLinkUrl('');
                          setShowResumeLinkInput(false);
                        }
                      }}
                      className="px-3 py-1 bg-[#2F80E7] text-white text-[11px] font-bold rounded"
                    >
                      Insert Link
                    </button>
                    <button type="button" onClick={() => setShowResumeLinkInput(false)} className="text-[#64748B] text-xs">✕</button>
                  </div>
                )}

                {showResumeTableInput && (
                  <div className="p-2.5 bg-[#F8FAFC] dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] flex items-center gap-3 text-xs">
                    <span className="text-[11px] font-semibold text-[#475569]">Table:</span>
                    <label className="flex items-center gap-1 text-[11px]">
                      <span>Rows:</span>
                      <input type="number" min={1} max={10} value={resumeTableRows} onChange={(e) => setResumeTableRows(Number(e.target.value))} className="w-12 px-1 py-0.5 border rounded text-xs text-center" />
                    </label>
                    <label className="flex items-center gap-1 text-[11px]">
                      <span>Cols:</span>
                      <input type="number" min={1} max={8} value={resumeTableCols} onChange={(e) => setResumeTableCols(Number(e.target.value))} className="w-12 px-1 py-0.5 border rounded text-xs text-center" />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        let html = '<table style="border-collapse:collapse;width:100%;border:1px solid #CBD5E1;margin:8px 0"><thead><tr>';
                        for (let c = 0; c < resumeTableCols; c++) html += `<th style="border:1px solid #CBD5E1;padding:6px 10px;background:#F1F5F9;font-weight:bold;text-align:left;font-size:12px">Col ${c + 1}</th>`;
                        html += '</tr></thead><tbody>';
                        for (let r = 0; r < resumeTableRows; r++) {
                          html += '<tr>';
                          for (let c = 0; c < resumeTableCols; c++) html += `<td style="border:1px solid #CBD5E1;padding:6px 10px;font-size:12px">&nbsp;</td>`;
                          html += '</tr>';
                        }
                        html += '</tbody></table>';
                        document.execCommand('insertHTML', false, html);
                        setShowResumeTableInput(false);
                      }}
                      className="px-3 py-1 bg-[#2F80E7] text-white text-[11px] font-bold rounded"
                    >
                      Insert
                    </button>
                    <button type="button" onClick={() => setShowResumeTableInput(false)} className="text-[#64748B] text-xs">✕</button>
                  </div>
                )}

                {/* Editor Content Area */}
                {resumeSourceMode ? (
                  <textarea
                    value={rawResumeText}
                    onChange={(e) => setRawResumeText(e.target.value)}
                    rows={12}
                    className="w-full p-4 font-mono text-xs text-[#202B37] dark:text-white bg-white dark:bg-[#162431] focus:outline-none min-h-[320px]"
                    placeholder="<p>Paste resume HTML or plain text here...</p>"
                  />
                ) : (
                  <div
                    ref={resumeEditorRef}
                    contentEditable
                    suppressContentEditableWarning
                    role="textbox"
                    aria-label="Paste Resume Details"
                    aria-multiline="true"
                    onInput={(e) => setRawResumeText(e.currentTarget.innerHTML)}
                    data-placeholder="Paste candidate resume, CV text, or LinkedIn summary here..."
                    className="min-h-[320px] w-full p-4 text-xs font-sans text-[#202B37] dark:text-white bg-white dark:bg-[#162431] focus:outline-none whitespace-pre-wrap leading-relaxed"
                    style={{ fontFamily: resumeFont }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Sub-mode 2: File Upload */}
          {resumeParseSubMode === 'upload' && (
            <div
              onClick={handleSimulateResumeDrop}
              className="p-8 border-2 border-dashed border-[#1769AA]/40 hover:border-[#1769AA] bg-[#EAF4FC]/50 dark:bg-[#22384B]/30 rounded-2xl text-center cursor-pointer transition-all space-y-2 group"
            >
              <UploadCloud className="w-10 h-10 text-[#1769AA] mx-auto group-hover:scale-110 transition-transform" />
              <div className="text-sm font-bold text-[#202B37] dark:text-white">
                Click to Simulate Resume Upload &amp; Deep Parsing
              </div>
              <p className="text-xs text-[#5E6B7A] dark:text-[#B9CAD9] max-w-md mx-auto">
                Supports PDF, DOCX, TXT. Our semantic extractor automatically populates candidate experience, contact details, and skill tags.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bulk Dropzone Banner */}
      {method === 'bulk' && !parseUploaded && (
        <div
          onClick={handleSimulateResumeDrop}
          className="p-8 border-2 border-dashed border-[#1769AA]/40 hover:border-[#1769AA] bg-[#EAF4FC]/50 dark:bg-[#22384B]/30 rounded-2xl text-center cursor-pointer transition-all space-y-2 group"
        >
          <UploadCloud className="w-10 h-10 text-[#1769AA] mx-auto group-hover:scale-110 transition-transform" />
          <div className="text-sm font-bold text-[#202B37] dark:text-white">
            Click to Upload Multiple Resumes for Batch Processing
          </div>
          <p className="text-xs text-[#5E6B7A] dark:text-[#B9CAD9] max-w-md mx-auto">
            Upload up to 50 resumes simultaneously for batch parsing and automated candidate profile creation.
          </p>
        </div>
      )}

      {/* Mint #8AC9A7 success banner */}
      {parseUploaded && (
        <div className="p-3 bg-[#8AC9A7]/20 border border-[#8AC9A7]/40 text-[#276749] dark:text-[#8AC9A7] rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4 text-[#8AC9A7]" />
            Resume parsed successfully! Fields populated below.
          </span>
          <button
            onClick={() => setParseUploaded(false)}
            className="text-xs underline hover:text-[#202B37] dark:hover:text-white"
          >
            Reset
          </button>
        </div>
      )}

      {/* Form: White #FFFFFF card, Light Grey #DCE6EF border */}
      <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-[#1B2936] border border-[#DCE6EF] dark:border-[#354A5C] rounded-2xl shadow-xs space-y-6">
        {/* Personal & Contact */}
        <div className="space-y-4">
          <div className="text-xs font-mono font-bold text-[#1769AA] uppercase tracking-wider">
            01. Personal &amp; Contact Details
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[#5E6B7A] dark:text-[#B9CAD9] mb-1 font-medium">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Gaurav Nambiar"
                className="w-full px-3 py-2 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl text-[#202B37] dark:text-white font-semibold focus:outline-none focus:border-[#1769AA]"
              />
            </div>

            <div>
              <label className="block text-[#5E6B7A] dark:text-[#B9CAD9] mb-1 font-medium">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full px-3 py-2 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl text-[#202B37] dark:text-white focus:outline-none focus:border-[#1769AA]"
              />
            </div>

            <div>
              <label className="block text-[#5E6B7A] dark:text-[#B9CAD9] mb-1 font-medium">Mobile Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl text-[#202B37] dark:text-white focus:outline-none focus:border-[#1769AA]"
              />
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="space-y-4 pt-4 border-t border-[#DCE6EF] dark:border-[#354A5C]">
          <div className="text-xs font-mono font-bold text-[#1769AA] uppercase tracking-wider">
            02. Professional Experience &amp; Location
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[#5E6B7A] dark:text-[#B9CAD9] mb-1 font-medium">Current Designation</label>
              <input
                type="text"
                required
                value={currentDesignation}
                onChange={(e) => setCurrentDesignation(e.target.value)}
                placeholder="e.g. Lead Systems Architect"
                className="w-full px-3 py-2 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl text-[#202B37] dark:text-white font-semibold focus:outline-none focus:border-[#1769AA]"
              />
            </div>

            <div>
              <label className="block text-[#5E6B7A] dark:text-[#B9CAD9] mb-1 font-medium">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full px-3 py-2 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl text-[#202B37] dark:text-white focus:outline-none focus:border-[#1769AA]"
              />
            </div>

            <div>
              <label className="block text-[#5E6B7A] dark:text-[#B9CAD9] mb-1 font-medium">Years of Experience</label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl font-mono text-[#202B37] dark:text-white focus:outline-none focus:border-[#1769AA]"
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-4 pt-4 border-t border-[#DCE6EF] dark:border-[#354A5C]">
          <div className="text-xs font-mono font-bold text-[#1769AA] uppercase tracking-wider">
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
                className="flex-1 px-3 py-2 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl text-[#202B37] dark:text-white focus:outline-none focus:border-[#1769AA]"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-[#0B4F89] hover:bg-[#1A659E] text-white rounded-xl transition-colors font-medium"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((sk) => (
                <span
                  key={sk}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EAF4FC] dark:bg-[#22384B] border border-[#DCE6EF] dark:border-[#4D6274] rounded-lg font-mono text-xs text-[#1769AA] dark:text-[#D8E9F7]"
                >
                  <span>{sk}</span>
                  <X
                    onClick={() => handleRemoveSkill(sk)}
                    className="w-3.5 h-3.5 text-[#7A8794] hover:text-rose-500 cursor-pointer transition-colors"
                  />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-4 pt-4 border-t border-[#DCE6EF] dark:border-[#354A5C]">
          <div className="text-xs font-mono font-bold text-[#1769AA] uppercase tracking-wider">
            04. Executive Summary
          </div>
          <textarea
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Candidate profile summary, notable project highlights..."
            className="w-full p-3 bg-[#F5F8FB] dark:bg-[#162431] border border-[#DCE6EF] dark:border-[#354A5C] rounded-xl text-xs text-[#202B37] dark:text-white focus:outline-none focus:border-[#1769AA]"
          />
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-[#DCE6EF] dark:border-[#354A5C] flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('applicants')}
            className="px-4 py-2 border border-[#DCE6EF] dark:border-[#354A5C] text-[#5E6B7A] dark:text-[#B9CAD9] hover:text-[#202B37] rounded-xl text-xs font-medium"
          >
            Cancel
          </button>

          {/* Primary action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#2F80E7] hover:bg-[#216BC4] text-white rounded-xl text-xs font-semibold shadow-xs shadow-[#2F80E7]/30 transition-all"
          >
            {isSubmitting ? 'Importing Candidate...' : 'Save & Onboard Candidate'}
          </button>
        </div>
      </form>
    </div>
  );
};
