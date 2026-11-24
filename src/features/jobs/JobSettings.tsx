import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Check, Search, Activity, Bell, Briefcase, CheckCircle, Code, Globe, Save, SlidersHorizontal, Sparkles, UserRound, X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

type Value = string | boolean | string[];
type Field = { key: string; label: string; hint?: string; type: 'switch' | 'select' | 'multi' | 'radio' | 'text' | 'number' | 'checks'; options?: string[]; initial: Value; min?: number; max?: number; depends?: string };
type Group = { title: string; description: string; icon: typeof Bell; fields: Field[] };
const roles = ['Primary Recruiter', 'Assigned To', 'Recruitment Manager', 'Account Manager', 'Recruiter', 'Admin'];
const statuses = ['Active', 'Open', 'On Hold', 'Filled', 'Closed', 'Cancelled'];
const groups: Group[] = [
  { title: 'Job workflow', description: 'Set working hours, availability, and editing rules for your jobs.', icon: Briefcase, fields: [
    { key: 'businessHours', label: "Set Turnaround Time Based on Business Working Hours", type: 'switch', initial: false },
    { key: 'workingDays', label: "Business Working Days", type: 'checks', options: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], initial: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
    { key: 'turnaroundReminder', label: "When Should One Get Notified Before Turnaround Time Ends?", type: 'select', options: ['5 Minutes', '15 Minutes', '30 Minutes', '1 Hour', '2 Hours', '1 Day'], initial: '15 Minutes' },
    { key: 'assignedJobs', label: "What are assigned Jobs?", type: 'radio', options: ['All Jobs', 'Assigned Jobs'], initial: 'Assigned Jobs' },
    { key: 'tagStatuses', label: "Which Statuses Should Display the Tag to Job Option?", type: 'multi', options: statuses, initial: [] },
    { key: 'submitStatuses', label: "Choose the statuses for which the 'Submit to Job' option will be available:", type: 'multi', options: statuses, initial: [] },
    { key: 'restrictedStatuses', label: "Restrict the edit access for the", hint: "(For the selected posting statuses, users cannot edit the Job)", type: 'multi', options: statuses, initial: ['Closed'] },
    { key: 'restrictedRoles', label: "Select roles for whom the Edit access must be restricted when the Job status is a restricted status:", type: 'multi', options: roles, initial: ['Recruiter'] },
    { key: 'autoFilled', label: "Change the Job status to \"Filled\" once all the positions are filled?", hint: "(If enabled, Jobs will close automatically in the module when all positions are filled.)", type: 'switch', initial: false },
    { key: 'autoClosed', label: "Change the Status to \"Closed\" Once All Candidates Have Joined for All Positions", hint: "(If enabled, the status will automatically update to Closed after all selected candidates have joined for every position.)", type: 'switch', initial: false },
    { key: 'respondBy', label: "Default Option for 'Respond By' in Details", type: 'radio', options: ['Open Until Filled', 'Date Option'], initial: 'Open Until Filled' },
    { key: 'expiredStatus', label: "Default Status when 'Respond By' Is Passed", type: 'select', options: statuses, initial: 'Closed' },
    { key: 'preventDuplicate', label: "Restrict Sharing Duplicate Jobs to Applicants?", hint: "(If enabled, users cannot share the same Job to an applicant multiple times.)", type: 'switch', initial: false },
    { key: 'assignOnApproval', label: "Do you want to assign recruiters while approving the Job requisition?", hint: "(If it is enabled, the system will show the option to assign recruiters to the Job at the time of Job requisition final approval.)", type: 'switch', initial: false }
  ] },
  { title: 'Notifications and ownership', description: 'Choose who receives updates and owns incoming applicants.', icon: Bell, fields: [
    { key: 'employmentTest', label: "Employment Test Notification", hint: "(Sends a notification to the selected users when an applicant completes an employment test.)", type: 'multi', options: roles, initial: [] },
    { key: 'applicationNotification', label: "Job Seeker Applied From Career Portal/Job Board Notification", hint: "(Sends notifications to the selected user(s) when an applicant applies to a Job from the Career Portal/Job boards.)", type: 'multi', options: roles, initial: ['Primary Recruiter', 'Assigned To', 'Recruitment Manager'] },
    { key: 'pipelineOwner', label: "Default Ownership for Pipeline Applicant", hint: "Choose the default owner for a pipeline applicant when they've applied from the Career Portal/Job boards.", type: 'select', options: roles, initial: '' }
  ] },
  { title: 'AI matching and submission scores', description: 'Configure matching preferences and score notifications.', icon: Sparkles, fields: [
    { key: 'aiNotification', label: "AI Matching Applicants Notification", hint: "(When configured, the system sends the Top 10 Matching Candidates summary to the selected roles.)", type: 'multi', options: roles, initial: [] },
    { key: 'matchLocation', label: "Populate AI Matching Profiles based on the Job Primary Location", hint: "(If enabled, the system will populate the AI Matching Profiles based on the Job primary location, skills, and Job title.)", type: 'switch', initial: false },
    { key: 'matchSkills', label: "Populate AI Matching Profiles based on the Job Primary Skills", hint: "(If enabled, the system will populate the AI Matching Profiles based on the Job primary skills.)", type: 'switch', initial: false },
    { key: 'scoreMin', label: "AI Matching Score Range", hint: "(Define the AI matching score range to filter these results. Only profiles within the configured score range will be considered. If no range is set, the system will display results as per the default behaviour.)", type: 'number', min: 0, max: 100, initial: '' },
    { key: 'scoreMax', label: 'Maximum AI matching score', hint: 'Only profiles within the configured score range are included.', type: 'number', min: 0, max: 100, initial: '' },
    { key: 'autoSkills', label: "Enable skills auto-mapping", hint: "(If it is enabled, the system will autofill the applicant's skill set while submitting the profile for a Job.)", type: 'switch', initial: false },
    { key: 'qualifyingScore', label: "Qualifying Percentage for Submission Score", hint: "(Notify the users if the candidate submission score is less than.)", type: 'number', min: 0, max: 100, initial: '0' },
    { key: 'scoreRecipients', label: "Choose the users for notifying when the candidate submission score is less than the given percent", type: 'multi', options: roles, initial: [] }
  ] },
  { title: 'Contact details', description: 'Control the contact information displayed with a job.', icon: UserRound, fields: [
    { key: 'showContact', label: "Show Contact Details With The Job", type: 'switch', initial: true },
    { key: 'contactOwner', label: "Show Contact Details Of", type: 'select', options: roles, initial: '', depends: 'showContact' },
    { key: 'contactFields', label: "Contact Details to be Displayed", type: 'multi', options: ['Name', 'Email', 'Phone', 'Designation'], initial: [], depends: 'showContact' }
  ] },
  { title: 'Job code settings', description: 'Configure how job and vendor reference codes are generated.', icon: Code, fields: [
    { key: 'codeGeneration', label: "Code Generation Type", hint: "(Choose the Job Post code generation type. Automatic code generation will instantly generate the code while the post is created.)", type: 'radio', options: ['Automatic Code Generation', 'Manual Code Generation'], initial: 'Automatic Code Generation' },
    { key: 'prefix', label: "Prefix", hint: "(Job codes will be prefixed with this value.)", type: 'text', initial: 'AMP' },
    { key: 'codeNumber', label: "Number", hint: "(This number will be auto-incremented after the prefix if \"Automatic Code Generation\" is selected.)", type: 'number', min: 0, initial: '12268' },
    { key: 'businessUnitCodes', label: "Configure Business Unit Wise Job Code", hint: "(Job code can be customized business unit wise. The same prefix and code cannot be configured across Business units. If Business unitwise code disabled, system will consider the Global Job code configured above.)", type: 'radio', options: ['No', 'Yes'], initial: 'No' },
    { key: 'vendorGeneration', label: "Vendor Code Generation Type", hint: "(Choose the vendor code generation type. Automatic code generation will instantly generate the code when the vendor Job post is created.)", type: 'radio', options: ['Automatic Code Generation', 'Manual Code Generation'], initial: 'Manual Code Generation' }
  ] },
  { title: 'Career portal settings', description: 'Manage application methods, source notifications, and applicant visibility.', icon: Globe, fields: [
    { key: 'applyNow', label: "Apply Now", hint: "(When checked, Job seekers can see the 'Apply Now' link in the Career Portal.)", type: 'switch', initial: false },
    { key: 'easyApply', label: "Easy Apply", hint: "(When checked, Job seekers can see the 'Easy Apply' link in the Career Portal.)", type: 'switch', initial: true },
    { key: 'indeedChannels', label: "Apply with Indeed", hint: "(When enabled, Job seekers will see the 'Apply With Indeed' button in the Career Portal / Job Boards.)", type: 'checks', options: ['Career Portal', 'Job Boards'], initial: ['Career Portal', 'Job Boards'] },
    { key: 'monsterChannels', label: "Apply with Monster", hint: "(When enabled, Job seekers will see the 'Apply With Monster' button in the Career Portal / Job Boards.)", type: 'checks', options: ['Career Portal', 'Job Boards'], initial: ['Career Portal', 'Job Boards'] },
    ...['Indeed', 'Monster', 'Post Job Free', 'Careerjet', 'ZipRecruiter', 'Neuvoo', 'Resume Library'].map(source => ({ key: `notify${source.replaceAll(' ', '')}`, label: `Apply with ${source} Notification`, hint: `(When enabled, the user will get a notification when Job seekers submit a resume via ${source}.)`, type: 'switch' as const, initial: false })),
    { key: 'applicantList', label: "Applicants should be displayed under this list when they apply from the Career Portal/Job Boards/Referral Portal/Campus Portal", type: 'select', options: ['Pipeline', 'Applicants'], initial: 'Pipeline' },
    { key: 'eeo', label: "Display EEO Details in the Career Portal", hint: "(When enabled, the EEO Details section will be displayed on the Career Portal page when Job seekers apply for any Job.)", type: 'switch', initial: true },
    { key: 'newApplicantNotification', label: "New Applicant Creation from TravelNurseSource/ AlliedTravelCareers/LocumJobsOnline/Vivian/ Vetted Health", hint: "(When this setting is enabled, the configured user will receive a notification whenever a profile is unlocked in the Jobboard Portal.)", type: 'multi', options: roles, initial: [] }
  ] }
];
const orderedKeys = ['businessHours', 'workingDays', 'turnaroundReminder', 'assignedJobs', 'tagStatuses', 'submitStatuses', 'restrictedStatuses', 'restrictedRoles', 'autoFilled', 'autoClosed', 'employmentTest', 'respondBy', 'applicationNotification', 'pipelineOwner', 'expiredStatus', 'preventDuplicate', 'assignOnApproval', 'aiNotification', 'matchLocation', 'matchSkills', 'scoreMin', 'autoSkills', 'qualifyingScore', 'scoreRecipients', 'showContact', 'contactOwner', 'contactFields'];
const allFields = groups.flatMap(group => group.fields);
const displayGroups = [
  { title: '', description: '', icon: Briefcase, fields: orderedKeys.map(key => allFields.find(field => field.key === key)!) },
  { ...groups[4], title: 'Job Code Settings', description: '' },
  { ...groups[5], title: 'Career Portal Settings', description: '' }
];
const key = 'ats_job_settings_configuration_v1';
const defaults = Object.fromEntries(groups.flatMap(group => group.fields.map(field => [field.key, field.initial])));
type Log = { message: string; date: string };
function readStored(): { values: Record<string, Value>; history: Log[] } {
  try { const stored = JSON.parse(localStorage.getItem(key) || 'null'); if (stored?.values) return { values: { ...defaults, ...stored.values }, history: Array.isArray(stored.history) ? stored.history : [] }; } catch { /* Use defaults when storage is unavailable. */ }
  return { values: defaults, history: [] };
}
function MultiSelect({ field, value, change, disabled }: { field: Field; value: string[]; change: (value: Value) => void; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  const options = (field.options || []).filter(option => option.toLowerCase().includes(query.toLowerCase()));
  return <div ref={root} className="job-select" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); setOpen(false); trigger.current?.focus(); } }}>
    <button ref={trigger} id={field.key} type="button" className="job-select-trigger" disabled={disabled} aria-label={field.label} aria-expanded={open} aria-controls={id} onClick={() => { setOpen(!open); setQuery(''); }}>
      <span className={value.length ? 'job-select-value' : 'job-select-placeholder'}>{value.length ? <><span className="job-select-chip">{value[0]}</span>{value.length > 1 && <span className="job-select-count">+{value.length - 1}</span>}</> : 'Select'}</span><ChevronDown size={16} className={open ? 'is-open' : ''} />
    </button>
    {open && !disabled && <div id={id} className="job-select-menu" role="group" aria-label={field.label}>
      <div className="job-select-search"><Search size={15} /><input autoFocus aria-label={`Search ${field.label}`} placeholder="Search options..." value={query} onChange={event => setQuery(event.target.value)} /></div>
      <div className="job-select-list">{options.map(option => <label key={option} className={value.includes(option) ? 'is-selected' : ''}><input type="checkbox" checked={value.includes(option)} onChange={event => change(event.target.checked ? [...value, option] : value.filter(item => item !== option))} /><span>{option}</span>{value.includes(option) && <Check size={15} />}</label>)}{!options.length && <p>No matching options</p>}</div>
      <div className="job-select-footer"><span>{value.length} selected</span><button type="button" disabled={!value.length} onClick={() => change([])}>Clear</button><button type="button" onClick={() => { setOpen(false); trigger.current?.focus(); }}>Done</button></div>
    </div>}
  </div>;
}
function Options({ field, value, change, disabled }: { field: Field; value: Value; change: (value: Value) => void; disabled: boolean }) {
  const id = useId();
  if (field.type === 'switch') return <button id={field.key} type="button" role="switch" aria-label={field.label} aria-checked={!!value} disabled={disabled} className={`interview-switch ${value ? 'is-on' : ''}`} onClick={() => change(!value)}><span /></button>;
  if (field.type === 'multi') return <MultiSelect field={field} value={Array.isArray(value) ? value : []} change={change} disabled={disabled} />;
  if (field.type === 'checks' || field.type === 'radio') return <div className="job-config-options" role="group" aria-label={field.label}>{field.options?.map(option => <label key={option}><input type={field.type === 'radio' ? 'radio' : 'checkbox'} name={id} disabled={disabled} value={option} checked={field.type === 'radio' ? value === option : Array.isArray(value) && value.includes(option)} onChange={e => change(field.type === 'radio' ? option : e.target.checked ? [...(value as string[]), option] : (value as string[]).filter(item => item !== option))} />{option}</label>)}</div>;
  if (field.type === 'select') return <select id={field.key} aria-label={field.label} disabled={disabled} value={String(value)} onChange={e => change(e.target.value)}><option value="">Select</option>{field.options?.map(option => <option key={option}>{option}</option>)}</select>;
  return <input id={field.key} aria-label={field.label} disabled={disabled} type={field.type} min={field.min} max={field.max} step={field.type === 'number' ? '1' : undefined} value={String(value)} onChange={e => change(e.target.value)} placeholder={field.type === 'number' ? 'Enter value' : 'Enter prefix'} />;
}
export function JobSettings() {
  const { currentUser } = useAppStore();
  const [initial] = useState(readStored);
  const [values, setValues] = useState(initial.values);
  const [saved, setSaved] = useState(initial.values);
  const [history, setHistory] = useState(initial.history);
  const [activities, setActivities] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  const save = (event: React.FormEvent) => {
    event.preventDefault(); setMessage(''); setError('');
    if (values.businessHours && !(values.workingDays as string[]).length) return setError('Select at least one business working day.');
    if ((values.scoreMin === '') !== (values.scoreMax === '')) return setError('Enter both minimum and maximum AI matching scores, or leave both blank.');
    if (values.scoreMin !== '' && Number(values.scoreMin) > Number(values.scoreMax)) return setError('The minimum AI matching score must not exceed the maximum.');
    if (values.qualifyingScore === '') return setError('Enter a qualifying submission score.');
    if (values.codeGeneration === 'Automatic Code Generation' && (!String(values.prefix).trim() || values.codeNumber === '')) return setError('Enter a job code prefix and starting number for automatic generation.');
    const changed = groups.flatMap(g => g.fields).filter(f => JSON.stringify(values[f.key]) !== JSON.stringify(saved[f.key])).map(f => f.label);
    const nextHistory = [{ message: `${currentUser?.name || 'Admin'} updated: ${changed.join('; ')}`, date: new Date().toISOString() }, ...history];
    try { localStorage.setItem(key, JSON.stringify({ values, history: nextHistory })); setSaved({ ...values }); setHistory(nextHistory); setMessage('Settings saved in this browser.'); } catch { setError('Unable to save settings in browser storage. Your changes are still available here; try saving again.'); }
  };
  return <section className="posting-panel job-configuration">
    <div className="posting-panel-heading"><span className="posting-section-icon"><SlidersHorizontal size={21} /></span><div><h2>Job Settings</h2></div><button type="button" className="interview-secondary job-config-activity" onClick={() => setActivities(true)}><Activity size={16} />Activities</button></div>
    <form onSubmit={save}>
      {displayGroups.map(group => <section className="job-config-group" key={group.title}>{group.title && <header><span className="posting-section-icon"><group.icon size={19} /></span><div><h3>{group.title}</h3></div></header>}<div>{group.fields.map(field => { const disabled = !!field.depends && !values[field.depends] || ['prefix', 'codeNumber'].includes(field.key) && values.codeGeneration === 'Manual Code Generation'; return <div key={field.key} className={`job-config-row ${disabled ? 'is-disabled' : ''}`}><div><label htmlFor={field.key}>{field.label}</label>{field.hint && <p>{field.hint}</p>}</div><div className="job-config-control">{field.key === 'scoreMin' ? <div className="job-config-score-range"><input type="number" aria-label="Minimum AI matching score" placeholder="Min" min={0} max={100} value={String(values.scoreMin)} onChange={e => { setValues(previous => ({ ...previous, scoreMin: e.target.value })); setMessage(''); setError(''); }} /><span>?</span><input type="number" aria-label="Maximum AI matching score" placeholder="Max" min={0} max={100} value={String(values.scoreMax)} onChange={e => { setValues(previous => ({ ...previous, scoreMax: e.target.value })); setMessage(''); setError(''); }} /></div> : <Options field={field} value={values[field.key]} disabled={disabled} change={value => { setValues(previous => ({ ...previous, [field.key]: value })); setMessage(''); setError(''); }} />}{field.key === 'qualifyingScore' && <span className="job-config-percent">%</span>}</div></div>; })}</div></section>)}
      <footer className="job-config-footer"><div>{error ? <p role="alert" className="interview-error">{error}</p> : message ? <p role="status" className="job-config-success"><CheckCircle size={16} />{message}</p> : <p>{dirty ? 'You have unsaved changes.' : 'Settings are saved locally in this browser.'}</p>}</div><button type="button" className="interview-secondary" disabled={!dirty} onClick={() => { setValues({ ...saved }); setError(''); setMessage(''); }}>Discard changes</button><button type="submit" className="interview-primary" disabled={!dirty}><Save size={16} />Save</button></footer>
    </form>
    {activities && <div className="interview-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setActivities(false); }}><section role="dialog" aria-modal="true" aria-label="Job settings activities" className="interview-dialog" onKeyDown={e => { if (e.key === 'Escape') setActivities(false); }}><header><h3>Job settings activities</h3><button autoFocus type="button" aria-label="Close activities" onClick={() => setActivities(false)}><X size={20} /></button></header><div className="interview-form-fields interview-audit">{history.length ? history.map((item, index) => <article key={`${item.date}-${index}`}><Activity size={16} /><div><p>{item.message}</p><time>{new Date(item.date).toLocaleString()}</time></div></article>) : <p>No changes saved yet.</p>}</div></section></div>}
  </section>;
}
