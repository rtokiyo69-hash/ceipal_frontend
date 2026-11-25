import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, ArrowLeft, ArrowUpDown, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pencil, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

export type InterviewLookupKind = 'Interview Modes' | 'Interview Rounds' | 'Interview Outcome Statuses' | 'Interview Recommendations';
export type JobLookupKind = 'Domains' | 'Industries' | 'Job Types' | 'Project Types' | 'Job Categories';
export type JobStatusLookupKind = 'Job Status Categories' | 'Job Statuses';
type LookupKind = InterviewLookupKind | JobLookupKind | JobStatusLookupKind | 'Priorities';
type Mapping = { round: string; status: string };
type RecordItem = { id: string; name: string; code?: string; color?: string; rating?: string; category: string; submissionStatus: string; enabled: boolean; createdBy: string; createdOn: string; modifiedBy: string; modifiedOn: string; mappings: Mapping[] };
type Audit = { id: string; message: string; date: string };
type Data = { records: RecordItem[]; activities: Audit[] };
const labels: Record<LookupKind, string> = { 'Interview Modes': 'Interview Mode', 'Interview Rounds': 'Interview Round', 'Interview Outcome Statuses': 'Interview Outcome Status', 'Interview Recommendations': 'Interview Recommendation', 'Domains': 'Domain', 'Industries': 'Industry', 'Job Types': 'Job Type', 'Project Types': 'Project Type', 'Job Categories': 'Job Category', 'Job Status Categories': 'Category', 'Job Statuses': 'Job Status', 'Priorities': 'Priority' };
const categories = ['Internal Interview', 'Vendor Interview', 'Client Interview', 'End Client Interview'];
const submissionStatuses = ['Tech Interview scheduled', 'L3 Interview Scheduled', 'L2 Interview Scheduled', 'L1 Interview Scheduled', 'Vendor Interview', 'Interview Scheduled', 'Feedback Pending', 'On Hold', 'Selected', 'Rejected', 'Cancelled by Client', 'Cancelled by the Candidate'];
const roundNames = ['Tech Evaluation', 'L3 Interview', 'L2 Interview', 'L1 Interview', 'Vendor Interview', 'Prime Vendor Interview'];
const names: Record<LookupKind, string[]> = {
  'Priorities': ['Low', 'Medium', 'High', 'Critical'],
  'Job Status Categories': ['Others', 'Inactive', 'Closed', 'Filled', 'On Hold', 'Active'],
  'Job Statuses': [],
  'Domains': [], 'Industries': [], 'Project Types': [], 'Job Types': ['Contract', 'Full Time'], 'Job Categories': ['US Retirement', 'KPO', 'BPO', 'Information technology', 'IT', 'Security', 'Hotel - Resort', 'Food'],
  'Interview Modes': ['WebEx Screening', 'Face to Face Interview', 'Video Interview', 'MS Teams', 'Zoom Interview', 'Microsoft Teams'],
  'Interview Rounds': roundNames,
  'Interview Outcome Statuses': ['Cancelled by Client', 'Cancelled by the Candidate', 'Feedback Pending', 'On Hold', 'Select', 'Reject'],
  'Interview Recommendations': ['Candidate not interested in the position', 'Hold', 'Candidate not ready to sign agreement', 'Insufficient documentation', 'Candidate is not culturally fit', 'Candidate lacks maturity', 'Candidate lacks confidence', 'Candidate has stability issues']
};
const storageKey = (kind: LookupKind) => `ats_${kind.startsWith('Interview') ? 'interview' : 'job'}_lookup_${kind.replaceAll(' ', '_').toLowerCase()}`;
function initialData(kind: LookupKind): Data {
  return { activities: [], records: names[kind].map((name, i) => ({ id: `${kind}-${i}`, name, color: kind === 'Priorities' ? ['#00FF00', '#3333FF', '#FF8000', '#FF0000'][i] : undefined, rating: '', category: categories[[0, 1, 3, 2, 1, 1][i] ?? 0], submissionStatus: submissionStatuses[Math.min(i, 4)], enabled: kind === 'Interview Modes' ? i === 2 : i < 4, createdBy: 'Sachin Wadeyar', createdOn: '2024-06-03T17:21:27Z', modifiedBy: 'Sachin Wadeyar', modifiedOn: '2024-06-03T17:21:27Z', mappings: [] })) };
}
function readData(kind: LookupKind): Data {
  try { const raw = localStorage.getItem(storageKey(kind)); if (raw) { const data = JSON.parse(raw); if (Array.isArray(data.records) && Array.isArray(data.activities)) return data; } } catch { /* Fall back to the reference data if browser storage is unavailable. */ }
  return initialData(kind);
}
const dateLabel = (value: string) => new Date(value).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function Overlay({ title, close, children, drawer = false }: { title: string; close: () => void; children: React.ReactNode; drawer?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const focusable = () => Array.from(ref.current?.querySelectorAll<HTMLElement>('button, input, select, textarea, [tabindex="0"]') ?? []).filter(el => !el.hasAttribute('disabled'));
    (ref.current?.querySelector<HTMLElement>('input') ?? focusable()[0])?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key === 'Tab') { const elements = focusable(); const first = elements[0]; const last = elements.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } }
    };
    const element = ref.current; element?.addEventListener('keydown', key);
    return () => { element?.removeEventListener('keydown', key); previous?.focus(); };
  }, []);
  return <div className={`interview-overlay ${drawer ? 'is-drawer' : ''}`} onMouseDown={e => { if (e.target === e.currentTarget) close(); }}><div ref={ref} role="dialog" aria-modal="true" aria-label={title} className="interview-dialog"><header><h3>{title}</h3><button type="button" aria-label="Close dialog" onClick={close}><X size={20} /></button></header>{children}</div></div>;
}

export function InterviewLookup({ kind }: { kind: LookupKind }) {
  const { currentUser } = useAppStore();
  const [data, setData] = useState<Data>(() => readData(kind));
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState<{ key: keyof RecordItem; ascending: boolean } | null>(['Job Status Categories', 'Priorities'].includes(kind) ? null : { key: 'name', ascending: true });
  const [editing, setEditing] = useState<RecordItem | null | undefined>(undefined);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState('#FF0000');
  const [rating, setRating] = useState('');
  const [category, setCategory] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deleting, setDeleting] = useState<RecordItem | null>(null);
  const [showActivities, setShowActivities] = useState(false);
  const isRound = kind === 'Interview Rounds';
  const isOutcome = kind === 'Interview Outcome Statuses';
  const isRecommendation = kind === 'Interview Recommendations';
  const isPriority = kind === 'Priorities';
  const isStatusCategory = kind === 'Job Status Categories';
  const isJobStatus = kind === 'Job Statuses';
  const statusCategories = readData('Job Status Categories').records;
  const isJob = !kind.startsWith('Interview');
  const hasCode = kind === 'Domains' || kind === 'Industries' || kind === 'Project Types';
  const codeLabel = kind === 'Industries' ? 'Short Name' : `${labels[kind]} Code`;
  const hasStatus = kind === 'Interview Modes' || isRound;
  const isDrawer = !isRound && !isOutcome && kind !== 'Industries' && !isPriority;
  const label = labels[kind];
  const availableRounds = readData('Interview Rounds').records;
  const filtered = useMemo(() => data.records.filter(record => `${record.name} ${record.code ?? ''} ${record.category} ${record.submissionStatus}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort ? String(a[sort.key]).localeCompare(String(b[sort.key])) * (sort.ascending ? 1 : -1) : 0), [data.records, search, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const currentPage = Math.min(page, pages);
  const rows = filtered.slice((currentPage - 1) * size, currentPage * size);
  const commit = (records: RecordItem[], message: string) => {
    const next = { records, activities: [{ id: crypto.randomUUID(), message: `${currentUser?.name || 'Admin'} ${message}`, date: new Date().toISOString() }, ...data.activities] };
    try { localStorage.setItem(storageKey(kind), JSON.stringify(next)); setNotice('Changes saved in this browser.'); } catch { setNotice('Changes apply to this session only. Browser storage is unavailable.'); }
    setData(next);
  };
  const openEditor = (record: RecordItem | null) => { setEditing(record); setName(record?.name ?? ''); setCode(record?.code ?? ''); setColor(record?.color ?? '#FF0000'); setRating(record?.rating ?? ''); setCategory(record?.category ?? ''); setSubmissionStatus(record?.submissionStatus ?? ''); setMappings(record?.mappings?.length ? record.mappings.map(m => ({ ...m })) : [{ round: '', status: '' }]); setError(''); setNotice(''); };
  const save = (event: React.FormEvent) => {
    event.preventDefault(); const trimmed = name.trim();
    if (!trimmed) return setError(`Enter an ${label.toLowerCase()} name.`);
    if (data.records.some(r => r.id !== editing?.id && r.name.toLowerCase() === trimmed.toLowerCase())) return setError('This name already exists. Enter a unique name.');
    if (isPriority && !/^#[0-9a-f]{6}$/i.test(color)) return setError('Enter a valid six-digit hex Color Code, such as #FF0000.');
    if (hasCode && !code.trim()) return setError(`Enter ${codeLabel.toLowerCase()}.`);
    if (hasCode && data.records.some(r => r.id !== editing?.id && r.code?.toLowerCase() === code.trim().toLowerCase())) return setError(`${codeLabel} already exists. Enter a unique value.`);
    if (isJobStatus && !category) return setError('Select a category.');
    if (isRound && (!category || !submissionStatus)) return setError('Select an interview category and submission status.');
    const activeMappings = mappings.filter(m => m.round || m.status);
    if (isOutcome && activeMappings.some(m => !m.round || !m.status)) return setError('Choose both an interview round and a submission status for each mapping.');
    if (isOutcome && new Set(activeMappings.map(m => m.round)).size !== activeMappings.length) return setError('Each interview round can only be mapped once.');
    const now = new Date().toISOString(); const user = currentUser?.name || 'Admin';
    const record: RecordItem = { id: editing?.id ?? crypto.randomUUID(), name: trimmed, color: isPriority ? color : undefined, rating: isPriority ? rating : undefined, code: hasCode ? code.trim() : undefined, category, submissionStatus, mappings: isOutcome ? activeMappings : [], enabled: editing?.enabled ?? true, createdBy: editing?.createdBy ?? user, createdOn: editing?.createdOn ?? now, modifiedBy: user, modifiedOn: now };
    commit(editing ? data.records.map(r => r.id === editing.id ? record : r) : [record, ...data.records], `${editing ? 'updated' : 'added'} “${trimmed}”`); setEditing(undefined); setSearch(''); setPage(1);
  };
  const fields = <>
    <div className="interview-field"><label htmlFor="interview-lookup-name">{isPriority ? 'Name' : isJob && kind !== 'Industries' ? `${label} Name` : label} <span>*</span></label>{isOutcome && <p>This status is selected when interview feedback is submitted.</p>}<input id="interview-lookup-name" required maxLength={160} value={name} onChange={e => setName(e.target.value)} placeholder={isStatusCategory || isJobStatus ? 'Required' : `Enter ${label.toLowerCase()}`} /></div>
    {isPriority && <><div className="interview-field"><label htmlFor="priority-color">Color Code <span>*</span></label><div className="priority-color-control"><input id="priority-color" required value={color} onChange={e => setColor(e.target.value)} placeholder="#FF0000" /><input aria-label="Choose priority color" type="color" value={/^#[0-9a-f]{6}$/i.test(color) ? color : '#FF0000'} onChange={e => setColor(e.target.value)} /></div></div><div className="interview-field"><label htmlFor="priority-rating">Rating</label><select id="priority-rating" value={rating} onChange={e => setRating(e.target.value)}><option value="">Select</option>{[1, 2, 3, 4, 5].map(value => <option key={value}>{value}</option>)}</select></div></>}
    {isJobStatus && <div className="interview-field"><label htmlFor="job-status-category">Category Name <span>*</span></label><select id="job-status-category" required value={category} onChange={e => setCategory(e.target.value)}><option value="">Select</option>{statusCategories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>}
    {hasCode && <div className="interview-field"><label htmlFor="lookup-code">{codeLabel} <span>*</span></label><input id="lookup-code" required maxLength={50} value={code} onChange={e => setCode(e.target.value)} placeholder={`Enter ${codeLabel.toLowerCase()}`} /></div>}
    {isRound && <><div className="interview-field"><label htmlFor="interview-category">Interview category <span>*</span></label><p>Determines whether the interview is reported as internal or external.</p><select id="interview-category" required value={category} onChange={e => setCategory(e.target.value)}><option value="">Select category</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div><div className="interview-field"><label htmlFor="interview-submission">Submission status <span>*</span></label><p>Applied when an interview is scheduled with this round.</p><select id="interview-submission" required value={submissionStatus} onChange={e => setSubmissionStatus(e.target.value)}><option value="">Select submission status</option>{submissionStatuses.map(s => <option key={s}>{s}</option>)}</select></div></>}
    {isOutcome && <fieldset className="interview-mappings"><legend>Round and submission status mappings</legend><p>Optionally set the submission status for each interview round.</p>{mappings.map((mapping, index) => <div key={index} className="interview-mapping-row"><div className="interview-field"><label htmlFor={`mapping-round-${index}`}>Interview round</label><select id={`mapping-round-${index}`} value={mapping.round} onChange={e => setMappings(mappings.map((m, i) => i === index ? { ...m, round: e.target.value } : m))}><option value="">Select round</option>{availableRounds.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div><div className="interview-field"><label htmlFor={`mapping-status-${index}`}>Submission status</label><select id={`mapping-status-${index}`} value={mapping.status} onChange={e => setMappings(mappings.map((m, i) => i === index ? { ...m, status: e.target.value } : m))}><option value="">Select status</option>{submissionStatuses.map(s => <option key={s}>{s}</option>)}</select></div><button type="button" aria-label={`Remove mapping ${index + 1}`} onClick={() => setMappings(mappings.filter((_, i) => i !== index))}><Trash2 size={17} /></button></div>)}<button type="button" className="interview-secondary" onClick={() => setMappings([...mappings, { round: '', status: '' }])}><Plus size={16} />Add mapping</button></fieldset>}
    {error && <p role="alert" className="interview-error">{error}</p>}
  </>;
  const form = <form onSubmit={save}><div className="interview-form-fields">{fields}</div><footer className="interview-form-footer"><button type="button" className="interview-secondary" onClick={() => setEditing(undefined)}>Cancel</button><button type="submit" className="interview-primary"><Save size={16} />Save {isStatusCategory || isJobStatus || isPriority ? '' : isJob ? label.toLowerCase() : isRound ? 'round' : isOutcome ? 'status' : isRecommendation ? 'recommendation' : 'mode'}</button></footer></form>;
  const columns: { key: keyof RecordItem; title: string }[] = [{ key: 'name', title: isRecommendation || isPriority ? 'Name' : isOutcome ? 'Status' : isJob ? `${label} Name` : label }, ...(isPriority ? [{ key: 'color' as const, title: 'Color Code' }, { key: 'rating' as const, title: 'Rating' }] : []), ...(isJobStatus ? [{ key: 'category' as const, title: 'Category Name' }] : []), ...(hasCode ? [{ key: 'code' as const, title: codeLabel }] : []), ...(isRound ? [{ key: 'category' as const, title: 'Interview category' }, { key: 'submissionStatus' as const, title: 'Submission status' }] : []), { key: 'createdBy', title: 'Created by' }, ...(!isRecommendation && !isStatusCategory && !isPriority ? [{ key: 'createdOn' as const, title: 'Created on' }] : []), { key: 'modifiedBy', title: 'Modified by' }, { key: 'modifiedOn', title: 'Modified on' }];
  return <div className="interview-lookup">
    {notice && <p role="status" className="interview-notice"><Check size={16} />{notice}</p>}
    {editing !== undefined && !isDrawer ? <section className="interview-editor"><div className="interview-editor-heading"><div><h3>{isPriority ? 'Priorities' : `${editing ? 'Edit' : 'Add'} ${label}`}</h3>{!isPriority && <p>Configure how this option is used throughout your recruitment workflow.</p>}</div><button type="button" className="interview-secondary" onClick={() => setEditing(undefined)}><ArrowLeft size={16} />Back</button></div>{form}</section> : <>
      <div className="interview-toolbar"><label className="interview-search"><Search size={17} /><input aria-label={`Search ${kind}`} placeholder={`Search ${kind.toLowerCase()}...`} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></label><div><button type="button" className="interview-secondary" onClick={() => setShowActivities(true)}><Activity size={16} />Activities</button><button type="button" className="interview-primary" onClick={() => openEditor(null)}><Plus size={17} />Add</button></div></div>
      <div className="interview-table-scroll"><table><thead><tr>{columns.map(c => <th key={c.key} scope="col" aria-sort={sort?.key === c.key ? sort.ascending ? 'ascending' : 'descending' : 'none'}><button type="button" onClick={() => setSort({ key: c.key, ascending: sort?.key === c.key ? !sort.ascending : true })}>{c.title}<ArrowUpDown size={12} /></button></th>)}{hasStatus && <th scope="col">Status</th>}<th scope="col">Actions</th></tr></thead><tbody>{rows.map(record => <tr key={record.id}>{columns.map(c => <td key={c.key}>{isPriority && c.key === 'color' ? <span className="priority-swatch" style={{ backgroundColor: record.color }} role="img" aria-label={record.color} title={record.color} /> : c.key === 'createdOn' || c.key === 'modifiedOn' ? dateLabel(record[c.key]) : isJobStatus && c.key === 'category' ? statusCategories.find(item => item.id === record.category)?.name || 'Unassigned' : String(record[c.key])}</td>)}{hasStatus && <td><button type="button" role="switch" aria-checked={record.enabled} aria-label={`Enable ${record.name}`} title={record.enabled ? 'Active' : 'Inactive'} className={`interview-switch ${record.enabled ? 'is-on' : ''}`} onClick={() => commit(data.records.map(r => r.id === record.id ? { ...r, enabled: !r.enabled, modifiedBy: currentUser?.name || 'Admin', modifiedOn: new Date().toISOString() } : r), `${record.enabled ? 'disabled' : 'enabled'} “${record.name}”`)}><span /></button></td>}<td><div className="interview-row-actions"><button type="button" aria-label={`Edit ${record.name}`} title="Edit" onClick={() => openEditor(record)}><Pencil size={16} /></button><button type="button" aria-label={`Delete ${record.name}`} title="Delete" onClick={() => { if (isStatusCategory && readData('Job Statuses').records.some(status => status.category === record.id)) { setNotice('This category is used by a job status. Reassign that status before deleting it.'); return; } setDeleting(record); }}><Trash2 size={16} /></button></div></td></tr>)}{!rows.length && <tr><td colSpan={columns.length + (hasStatus ? 2 : 1)} className="interview-empty"><Search size={24} /><strong>No {kind.toLowerCase()} found</strong><p>Try a different search or add a new entry.</p></td></tr>}</tbody></table></div>
      <div className="interview-pagination"><span>Showing {filtered.length ? (currentPage - 1) * size + 1 : 0}–{Math.min(currentPage * size, filtered.length)} of {filtered.length} entries</span><div><button aria-label="First page" disabled={currentPage === 1} onClick={() => setPage(1)}><ChevronsLeft size={16} /></button><button aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16} /></button><span className="interview-page-number">{currentPage} / {pages}</span><button aria-label="Next page" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}><ChevronRight size={16} /></button><button aria-label="Last page" disabled={currentPage === pages} onClick={() => setPage(pages)}><ChevronsRight size={16} /></button><select aria-label="Rows per page" value={size} onChange={e => { setSize(Number(e.target.value)); setPage(1); }}>{[5, 10, 25, 50].map(n => <option key={n} value={n}>{n} / page</option>)}</select></div></div>
    </>}
    {editing !== undefined && isDrawer && <Overlay drawer title={`${editing ? 'Edit' : 'Add'} ${label}`} close={() => setEditing(undefined)}>{form}</Overlay>}
    {deleting && <Overlay title={`Delete ${label.toLowerCase()}?`} close={() => setDeleting(null)}><div className="interview-form-fields"><p>Delete <strong>“{deleting.name}”</strong>? This cannot be undone.</p></div><footer className="interview-form-footer"><button className="interview-secondary" onClick={() => setDeleting(null)}>Cancel</button><button className="interview-danger" onClick={() => { commit(data.records.filter(r => r.id !== deleting.id), `deleted “${deleting.name}”`); setDeleting(null); }}>Delete</button></footer></Overlay>}
    {showActivities && <Overlay drawer title={`${kind} activities`} close={() => setShowActivities(false)}><div className="interview-form-fields interview-audit">{data.activities.length ? data.activities.map(a => <article key={a.id}><Activity size={16} /><div><p>{a.message}</p><time>{dateLabel(a.date)}</time></div></article>) : <p>No activity yet. Changes to these options will appear here.</p>}</div></Overlay>}
  </div>;
}

