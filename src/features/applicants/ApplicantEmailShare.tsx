import React, { useEffect, useMemo, useState } from 'react';
import { Bold, Italic, Underline, List, Link2, Paperclip, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Applicant, Job } from '../../types';
import { ApiService } from '../../services/api';
import { useAppStore } from '../../store/appStore';

const shareFields = ['Job Title', 'Client Bill Rate', 'Pay Rate/Salary', 'Location', 'Client', 'End Client', 'Duration', 'Skills', 'Job Description', 'Job Start Date', 'Job End Date'];
const tableThemes = [
  { name: 'Blue', header: '#4f8fd8', body: '#eff6ff', border: '#3b82f6' },
  { name: 'Orange', header: '#f97316', body: '#fff7ed', border: '#ea580c' },
  { name: 'Green', header: '#84b547', body: '#f3f8eb', border: '#65a30d' },
  { name: 'Rose', header: '#c76666', body: '#fff1f2', border: '#be123c' },
  { name: 'Sage', header: '#9ab777', body: '#f5f8ef', border: '#77994e' },
  { name: 'Peach', header: '#f59a4a', body: '#fff7ed', border: '#ea8a35' },
  { name: 'Purple', header: '#8b6bb1', body: '#f5f0fa', border: '#7e22ce' },
  { name: 'Teal', header: '#42a6c4', body: '#effafe', border: '#0891b2' },
  { name: 'Black', header: '#222222', body: '#ffffff', border: '#222222' },
];
const salutations = [
  { value: '', label: 'Select' },
  { value: 'hi-first', label: 'Hi [FirstName]' },
  { value: 'hello-first', label: 'Hello [FirstName]' },
  { value: 'hi-full', label: 'Hi [FirstName] [LastName]' },
  { value: 'hello-full', label: 'Hello [FirstName] [LastName]' },
  { value: 'dear-full', label: 'Dear [FirstName] [LastName]' },
];

type TableStyle = { fontFamily: string; fontColor: string; fontSize: string; background: string };

export const ApplicantEmailShare: React.FC = () => {
  const { selectedId, currentUser, navigate } = useAppStore();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobId, setJobId] = useState('');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>(['Job Title', 'Location']);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [salutation, setSalutation] = useState('');
  const [tableTheme, setTableTheme] = useState('Blue');
  const [themePaletteOpen, setThemePaletteOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(true);
  const [headerStyle, setHeaderStyle] = useState<TableStyle>({ fontFamily: 'Arial', fontColor: '#334155', fontSize: '12px', background: '#f1f5f9' });
  const [bodyStyle, setBodyStyle] = useState<TableStyle>({ fontFamily: 'Arial', fontColor: '#334155', fontSize: '12px', background: '#ffffff' });
  const [files, setFiles] = useState<File[]>([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!selectedId) return;
    Promise.all([ApiService.getApplicantById(selectedId), ApiService.getJobs()]).then(([candidate, availableJobs]) => {
      setApplicant(candidate || null);
      setJobs(availableJobs.filter((job) => !['Closed', 'Draft', 'On Hold'].includes(job.status)));
    });
  }, [selectedId]);

  const selectedJob = useMemo(() => jobs.find((job) => job.id === jobId), [jobs, jobId]);
  const applicantNameParts = (applicant?.name || '').trim().split(/\s+/);
  const firstName = applicantNameParts[0] || '';
  const lastName = applicantNameParts.slice(1).join(' ');
  const getGreeting = (value: string) => {
    if (value === 'hi-first') return `Hi ${firstName}`;
    if (value === 'hello-first') return `Hello ${firstName}`;
    if (value === 'hi-full') return `Hi ${firstName} ${lastName}`.trim();
    if (value === 'hello-full') return `Hello ${firstName} ${lastName}`.trim();
    if (value === 'dear-full') return `Dear ${firstName} ${lastName}`.trim();
    return `Hello ${applicant?.name || 'there'},`;
  };
  const changeSalutation = (value: string) => {
    setSalutation(value);
    setBody((current) => current.replace(/^[^\n]*/, getGreeting(value)));
  };
  useEffect(() => {
    if (!applicant) return;
    setSubject(selectedJob ? `Job ${selectedJob.title} is shared with you` : 'Job opportunity is shared with you');
    setBody(`Hello ${applicant.name},\n\nMy name is ${currentUser?.name || 'Your Recruiter'} and I am a Staffing Specialist. I am reaching out to you on an exciting job opportunity with one of our clients.\n\n${selectedJob ? `Job Title - ${selectedJob.title}\nLocation - ${selectedJob.location}\nJob Description - ${selectedJob.description}` : 'Please review the job details below.'}\n\nShould you be interested, please send me a copy of your resume in Word format along with the following details as soon as possible:\n\nFull Name:\nCurrent Location:\nHourly rate:\nWork Authorization:\nEarliest Available Date to Start:\nDates and times available to interview:\n\nThank you,\n${currentUser?.name || 'Your Recruiter'}`);
  }, [applicant, selectedJob, currentUser?.name]);

  const toggleField = (field: string) => setSelectedFields((fields) => fields.includes(field) ? fields.filter((item) => item !== field) : [...fields, field]);
  const cancel = () => navigate('applicant-detail', applicant?.id || selectedId);
  const send = () => setNotice('Email sending is not connected yet. Your message is ready to review.');

  if (!applicant) return <div className="p-8 text-center text-sm text-[#64748B]">Loading applicant…</div>;

  return <div className="min-h-full bg-[#ECECEC] p-4 text-[#334155] dark:bg-slate-900 dark:text-slate-100">
    <div className="mb-3 grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(300px,0.9fr)]">
      <h1 className="text-xl font-normal text-[#333] dark:text-white">Share Job</h1>
      <h2 className="text-xl font-normal text-[#333] dark:text-white">Customize Email Body</h2>
    </div>
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(300px,0.9fr)]">
      <section className="border border-[#D0D0D0] bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-[#DDD] p-4 dark:border-slate-700">
          <div className="grid gap-3 sm:grid-cols-[72px_minmax(220px,335px)_1fr_auto] sm:items-center">
            <label htmlFor="share-from" className="text-xs text-[#64748B]">From</label>
            <select id="share-from" className="h-8 border border-[#CBD5E1] bg-[#F8FAFC] px-2 text-xs dark:border-slate-600 dark:bg-slate-700"><option>{currentUser?.name || 'System'} ({currentUser?.email || 'system@ats.local'})</option></select>
            <span />
            <div className="flex gap-2"><button type="button" onClick={send} className="rounded bg-[#3B82F6] px-3 py-1.5 text-xs font-semibold text-white">Send</button><button type="button" onClick={cancel} className="rounded bg-[#3B82F6] px-3 py-1.5 text-xs font-semibold text-white">Cancel</button></div>
            <label htmlFor="share-job" className="text-xs text-[#64748B]">Select Job</label>
            <select id="share-job" value={jobId} onChange={(event) => setJobId(event.target.value)} className="h-8 border border-[#CBD5E1] bg-[#F8FAFC] px-2 text-xs dark:border-slate-600 dark:bg-slate-700"><option value="">Search for Job</option>{jobs.map((job) => <option key={job.id} value={job.id}>{job.title} · {job.client}</option>)}</select>
          </div>
        </div>
        <div className="space-y-2 border-b border-[#DDD] p-3 dark:border-slate-700">
          <div className="flex min-h-8 items-center gap-2 border-b border-[#EEE] px-2 text-xs dark:border-slate-700"><span className="w-12 text-[#64748B]">To</span><span className="inline-flex items-center gap-2 rounded-full border border-[#DDD] px-2 py-1 text-[#334155] dark:border-slate-600 dark:text-slate-100">{applicant.name} ({applicant.email})</span></div>
          <div className="flex min-h-8 items-center gap-2 bg-[#F7F7F7] px-2 text-xs dark:bg-slate-700"><label htmlFor="share-cc" className="w-12 text-[#64748B]">CC</label><input id="share-cc" value={cc} onChange={(event) => setCc(event.target.value)} placeholder="Add CC recipients" className="min-w-0 flex-1 bg-transparent outline-none" /></div>
          <input aria-label="Email subject" value={subject} onChange={(event) => setSubject(event.target.value)} className="w-full border-b border-[#EEE] px-2 py-2 text-sm text-[#7F1D1D] outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-rose-300" />
        </div>
        <div className="flex flex-wrap items-center gap-1 border-b border-[#DDD] px-3 py-2 text-[#64748B] dark:border-slate-700">{[Bold, Italic, Underline, List, Link2].map((Icon, index) => <button key={index} type="button" title={['Bold', 'Italic', 'Underline', 'Bulleted list', 'Insert link'][index]} className="rounded p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700"><Icon className="h-4 w-4" /></button>)}<span className="ml-2 text-xs">Styles　Format　Font　Size</span></div>
        <textarea aria-label="Email body" value={body} onChange={(event) => setBody(event.target.value)} className="min-h-[330px] w-full resize-y border-0 bg-white px-5 py-4 text-xs leading-6 text-[#1F2937] outline-none dark:bg-slate-800 dark:text-slate-100" />
        <div className="flex min-h-[54px] flex-wrap items-center gap-2 border-t border-[#DDD] px-4 py-2.5 text-xs dark:border-slate-700">
          <span className="mr-1 text-[#64748B]">Attachment</span>
          <input id="share-attachments" type="file" multiple onChange={(event) => setFiles((current) => [...current, ...Array.from(event.target.files || [])])} className="sr-only" />
          <label htmlFor="share-attachments" className="inline-flex h-8 cursor-pointer items-center gap-2 rounded border border-[#CBD5E1] bg-white px-3 font-medium text-[#334155] shadow-sm transition hover:border-[#3B82F6] hover:bg-[#F8FAFC] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600">
            <Paperclip className="h-3.5 w-3.5 text-[#3B82F6]" />Attach files
          </label>
          {files.length === 0 ? <span className="text-[#94A3B8]">No files attached</span> : <div className="flex flex-wrap gap-1.5" aria-label={`${files.length} attached ${files.length === 1 ? 'file' : 'files'}`}>
            {files.map((file, index) => <span key={`${file.name}-${file.lastModified}-${index}`} title={`${file.name} · ${(file.size / 1024).toFixed(0)} KB`} className="inline-flex max-w-[220px] items-center gap-1.5 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] py-1 pl-2.5 pr-1.5 text-[#334155] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
              <span className="truncate">{file.name}</span><button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} className="rounded-full p-0.5 text-[#64748B] hover:bg-white hover:text-rose-600 dark:hover:bg-slate-600"><X className="h-3 w-3" /></button>
            </span>)}
          </div>}
        </div>
        <div className="flex justify-end gap-2 border-t border-[#DDD] p-3 dark:border-slate-700"><button type="button" onClick={send} className="rounded bg-[#3B82F6] px-3 py-1.5 text-xs font-semibold text-white">Send</button><button type="button" onClick={cancel} className="rounded bg-[#3B82F6] px-3 py-1.5 text-xs font-semibold text-white">Cancel</button></div>
        {notice && <p role="status" className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">{notice}</p>}
      </section>
      <aside className="email-share-customize-panel border border-[#D0D0D0] bg-white text-[#444] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
        <div className="space-y-4 p-4">
          <div>
            <label className="mb-2 block text-xs text-[#64748B]">Columns</label>
            <div className="relative"><button type="button" aria-expanded={columnsOpen} onClick={() => setColumnsOpen((open) => !open)} className="flex h-9 w-full items-center justify-between border border-[#CBD5E1] px-2 text-xs dark:border-slate-600">{selectedFields.length ? selectedFields.join(', ') : 'Select columns'}<ChevronDown className="h-3.5 w-3.5" /></button>
              {columnsOpen && <div className="absolute left-0 top-full z-20 mt-1 max-h-80 w-full overflow-y-auto border border-[#CBD5E1] bg-white p-2 shadow-lg dark:border-slate-600 dark:bg-slate-700">{shareFields.map((field) => <label key={field} className="flex items-center gap-2 px-2 py-1.5 text-xs"><input type="checkbox" checked={selectedFields.includes(field)} onChange={() => toggleField(field)} />{field}</label>)}</div>}
            </div>
          </div>
          <div>
            <label htmlFor="share-salutation" className="mb-2 block text-xs text-[#64748B]">Salutation</label>
            <select id="share-salutation" value={salutation} onChange={(event) => changeSalutation(event.target.value)} className="h-8 w-full border border-[#CBD5E1] bg-[#F8FAFC] px-2 text-xs dark:border-slate-600 dark:bg-slate-700">{salutations.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          </div>
          <div>
            <span className="mb-2 block text-xs text-[#64748B]">Table Theme</span>
            <div className="relative">
              <button type="button" aria-label="Choose table theme" aria-expanded={themePaletteOpen} onClick={() => setThemePaletteOpen((open) => !open)} className="flex h-9 w-full items-center justify-between border border-[#CBD5E1] bg-white px-2 text-xs dark:border-slate-600 dark:bg-slate-700"><span className="flex items-center gap-2"><span className="h-5 w-8 border" style={{ background: tableThemes.find((theme) => theme.name === tableTheme)?.header, borderColor: tableThemes.find((theme) => theme.name === tableTheme)?.border }} />{tableTheme}</span><ChevronDown className="h-3.5 w-3.5" /></button>
              {themePaletteOpen && <div role="listbox" aria-label="Table themes" className="absolute left-0 top-full z-30 mt-1 grid w-full grid-cols-2 gap-2 border border-[#D1D5DB] bg-white p-3 shadow-lg dark:border-slate-600 dark:bg-white">
                {tableThemes.map((theme) => <button key={theme.name} type="button" role="option" aria-selected={tableTheme === theme.name} aria-label={`${theme.name} table theme`} onClick={() => { setTableTheme(theme.name); setThemePaletteOpen(false); }} className={`rounded-sm border p-1.5 transition hover:shadow ${tableTheme === theme.name ? 'border-[#3B82F6] ring-1 ring-[#3B82F6]' : 'border-[#D1D5DB]'}`}>
                  <span className="grid grid-cols-3 overflow-hidden border text-[5px] leading-[8px]" style={{ borderColor: theme.border }}>
                    {Array.from({ length: 12 }, (_, index) => <span key={index} className="h-[9px] border-r border-b px-0.5" style={{ backgroundColor: index < 3 ? theme.header : theme.body, borderColor: theme.border, color: index < 3 ? '#fff' : '#475569' }}>{index % 3 === 0 ? '━━' : '━'}</span>)}
                  </span>
                  <span className="mt-1 block text-[10px] text-[#475569]">{theme.name}</span>
                </button>)}
              </div>}
            </div>
          </div>
        </div>
        <div className="border-t border-[#E5E7EB] dark:border-slate-700">
          <button type="button" aria-expanded={customizeOpen} onClick={() => setCustomizeOpen((open) => !open)} className="flex w-full items-center justify-between px-4 py-4 text-left text-xs font-medium text-[#3B82F6]">Customize Theme{customizeOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
          {customizeOpen && <div className="space-y-5 px-4 pb-4">
            {([['TABLE HEADER', headerStyle, setHeaderStyle], ['TABLE BODY', bodyStyle, setBodyStyle]] as const).map(([section, style, setStyle]) => <div key={section}>
              <h3 className="mb-2 text-xs font-medium text-[#48B54A]">{section}</h3>
              <div className="space-y-3">
                <label className="grid grid-cols-[72px_1fr] items-center gap-2 text-xs"><span>Font-family</span><select value={style.fontFamily} onChange={(event) => setStyle((current) => ({ ...current, fontFamily: event.target.value }))} className="h-7 border border-[#CBD5E1] bg-[#F8FAFC] px-1 text-xs dark:border-slate-600 dark:bg-slate-700"><option>Arial</option><option>Georgia</option><option>Tahoma</option><option>Verdana</option></select></label>
                <label className="grid grid-cols-[72px_1fr] items-center gap-2 text-xs"><span>Font-color</span><span className="flex items-center gap-2"><input aria-label={`${section} font color`} type="color" value={style.fontColor} onChange={(event) => setStyle((current) => ({ ...current, fontColor: event.target.value }))} className="h-7 w-14 cursor-pointer border border-[#CBD5E1] bg-white p-0.5" /><span className="h-5 w-5 border border-[#CBD5E1]" style={{ backgroundImage: 'linear-gradient(45deg,#ddd 25%,transparent 25%),linear-gradient(-45deg,#ddd 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ddd 75%),linear-gradient(-45deg,transparent 75%,#ddd 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0,0 4px,4px -4px,-4px 0' }} /></span></label>
                <label className="grid grid-cols-[72px_1fr] items-center gap-2 text-xs"><span>Font-size</span><select value={style.fontSize} onChange={(event) => setStyle((current) => ({ ...current, fontSize: event.target.value }))} className="h-7 border border-[#CBD5E1] bg-[#F8FAFC] px-1 text-xs dark:border-slate-600 dark:bg-slate-700"><option value="10px">10</option><option value="12px">12</option><option value="14px">14</option><option value="16px">16</option></select></label>
                <label className="grid grid-cols-[72px_1fr] items-center gap-2 text-xs"><span>Background</span><input aria-label={`${section} background color`} type="color" value={style.background} onChange={(event) => setStyle((current) => ({ ...current, background: event.target.value }))} className="h-7 w-14 cursor-pointer border border-[#CBD5E1] bg-white p-0.5" /></label>
              </div>
            </div>)}
            <div className="overflow-hidden border" aria-label={`${tableTheme} table preview`} style={{ borderColor: tableThemes.find((theme) => theme.name === tableTheme)?.border }}>
              <div className="grid" style={{ gridTemplateColumns: `repeat(${Math.max(1, Math.min(selectedFields.length, 3))}, minmax(0, 1fr))`, fontFamily: headerStyle.fontFamily, color: headerStyle.fontColor, fontSize: headerStyle.fontSize, background: headerStyle.background === '#f1f5f9' ? tableThemes.find((theme) => theme.name === tableTheme)?.header : headerStyle.background }}>{(selectedFields.length ? selectedFields : ['Job Title']).slice(0, 3).map((field) => <span key={field} className="truncate border-r border-[#CBD5E1] px-1 py-1">{field}</span>)}</div>
              <div className="grid" style={{ gridTemplateColumns: `repeat(${Math.max(1, Math.min(selectedFields.length, 3))}, minmax(0, 1fr))`, fontFamily: bodyStyle.fontFamily, color: bodyStyle.fontColor, fontSize: bodyStyle.fontSize, background: bodyStyle.background === '#ffffff' ? tableThemes.find((theme) => theme.name === tableTheme)?.body : bodyStyle.background }}>{(selectedFields.length ? selectedFields : ['Job Title']).slice(0, 3).map((field) => <span key={field} className="truncate border-r border-[#CBD5E1] px-1 py-1">{field === 'Job Title' ? (selectedJob?.title || 'Job title') : field === 'Location' ? (selectedJob?.location || 'Location') : field}</span>)}</div>
            </div>
          </div>}
        </div>
      </aside>
    </div>
  </div>;
};
