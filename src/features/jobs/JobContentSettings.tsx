import React, { useState } from 'react';
import { Activity, Plus, Save, Trash2 } from 'lucide-react';
import { RichTextEditor, sanitizeRichTextHtml } from '../../components/common/RichTextEditor';
import { InterviewLookup, Overlay } from './InterviewLookup';
import { useAppStore } from '../../store/appStore';

type HistoryItem = { date: string; user: string };
function readStored<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? { ...fallback, ...JSON.parse(raw) } : fallback; } catch { return fallback; }
}
function History({ entries, close }: { entries: HistoryItem[]; close: () => void }) {
  return <Overlay title="Activities" close={close} drawer><div className="interview-form-fields interview-audit">{entries.length ? entries.map((entry, index) => <article key={`${entry.date}-${index}`}><Activity size={16} /><div><p>{entry.user} saved changes.</p><time>{new Date(entry.date).toLocaleString()}</time></div></article>) : <p>No recent activities.</p>}</div></Overlay>;
}

export function JobSummary({ itar = false }: { itar?: boolean }) {
  const { currentUser } = useAppStore();
  const storageKey = itar ? 'ats_itar_summary_v1' : 'ats_job_summary_v1';
  const [stored, setStored] = useState(() => readStored(storageKey, { summary: '', display: false, history: [] as HistoryItem[] }));
  const [summary, setSummary] = useState(stored.summary);
  const [display, setDisplay] = useState(stored.display);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [activities, setActivities] = useState(false);
  const [revision, setRevision] = useState(0);
  const dirty = summary !== stored.summary || display !== stored.display;
  const save = () => {
    const clean = sanitizeRichTextHtml(summary);
    const next = { summary: clean, display, history: [{ date: new Date().toISOString(), user: currentUser?.name || 'Admin' }, ...stored.history] };
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setStored(next); setSummary(clean); setRevision(value => value + 1); setError(''); setNotice('Saved in this browser.'); } catch { setError('Unable to save. Browser storage is unavailable.'); }
  };
  return <section className="posting-panel summary-settings"><div className="posting-panel-heading"><h2>{itar ? 'ITAR Summary' : 'About Us'}</h2><button type="button" className="interview-secondary job-config-activity" onClick={() => setActivities(true)}><Activity size={16} />Activities</button></div>
    {!itar && <div className="job-config-row"><div><label htmlFor="display-job-summary">Display Job Summary on Job Records in the Career Page &amp; Candidate Portal.</label><p>(When enabled, the configured Job summary will be displayed on the Job preview in the Career Page and Candidate Portal.)</p></div><button id="display-job-summary" type="button" role="switch" aria-checked={display} aria-label="Display Job Summary on Job Records in the Career Page & Candidate Portal." className={`interview-switch ${display ? 'is-on' : ''}`} onClick={() => { setDisplay(!display); setNotice(''); }}><span /></button></div>}
    <div className="summary-editor-row"><span>Summary</span><div className="shared-summary-editor"><RichTextEditor label="Summary" value={summary} resetKey={revision} onChange={value => { setSummary(value); setNotice(''); }} onError={setError} /></div></div>
    <footer className="job-config-footer"><div>{error ? <p role="alert" className="interview-error">{error}</p> : <p role="status">{notice || (dirty ? 'You have unsaved changes.' : '')}</p>}</div><button type="button" className="interview-secondary" disabled={!dirty} onClick={() => { setSummary(stored.summary); setDisplay(stored.display); setRevision(value => value + 1); setError(''); setNotice(''); }}>Cancel</button><button type="button" className="interview-primary" disabled={!dirty} onClick={save}><Save size={16} />Save</button></footer>
    {activities && <History entries={stored.history} close={() => setActivities(false)} />}
  </section>;
}

type MaskRule = { id: string; keyword: string; replacement: string };
export function KeywordMasking() {
  const { currentUser } = useAppStore();
  const storageKey = 'ats_keyword_masking_v1';
  const [stored, setStored] = useState(() => readStored(storageKey, { billRate: '', maskEmail: true, rules: [{ id: 'initial', keyword: 'Morgan Stanley', replacement: '#####' }] as MaskRule[], history: [] as HistoryItem[] }));
  const [draft, setDraft] = useState(stored);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const rules = draft.rules.map(rule => ({ ...rule, keyword: rule.keyword.trim() }));
    if (rules.some(rule => !rule.keyword || !rule.replacement.trim())) return setError('Enter both Keywords and Replace With for each row.');
    if (new Set(rules.map(rule => rule.keyword.toLowerCase())).size !== rules.length) return setError('Each keyword must be unique.');
    const next = { ...draft, rules, history: [{ date: new Date().toISOString(), user: currentUser?.name || 'Admin' }, ...stored.history] };
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setStored(next); setDraft(next); setEditing(false); setError(''); setNotice('Saved in this browser.'); } catch { setError('Unable to save. Browser storage is unavailable.'); }
  };
  return <section className="posting-panel masking-settings"><div className="posting-panel-heading"><h2>Keyword Masking</h2></div><form onSubmit={save}><div className="masking-body"><p className="posting-description">Keywords and bill rate will be replaced with the keyword in public Job descriptions.</p><div className="masking-section-title"><h3>Client Bill Rate Masking</h3>{!editing && <button type="button" className="interview-primary" onClick={() => { setEditing(true); setNotice(''); }}>Edit</button>}</div>
    <div className="job-config-row"><label htmlFor="mask-bill-rate">What should be updated in the Job description, if the system finds the bill rate.</label><div className="interview-field"><input id="mask-bill-rate" readOnly={!editing} value={draft.billRate} onChange={event => setDraft({ ...draft, billRate: event.target.value })} /></div></div>
    <div className="job-config-row"><label htmlFor="mask-email">Do you want to mask the email in the public Job description?</label><button id="mask-email" type="button" role="switch" aria-checked={draft.maskEmail} aria-label="Do you want to mask the email in the public Job description?" className={`interview-switch ${draft.maskEmail ? 'is-on' : ''}`} onClick={() => { setDraft(previous => ({ ...previous, maskEmail: !previous.maskEmail })); setEditing(true); setError(''); setNotice('You have unsaved changes.'); }}><span /></button></div>
    <div className="masking-section-title"><h3>Keyword Masking</h3>{editing && <button type="button" className="interview-secondary" onClick={() => setDraft({ ...draft, rules: [...draft.rules, { id: crypto.randomUUID(), keyword: '', replacement: '' }] })}><Plus size={16} />Add</button>}</div>
    <div className="interview-table-scroll"><table><thead><tr><th>Keywords</th><th>Replace With</th>{editing && <th>Actions</th>}</tr></thead><tbody>{draft.rules.map((rule, index) => <tr key={rule.id}><td>{editing ? <div className="interview-field"><input aria-label={`Keywords ${index + 1}`} required value={rule.keyword} onChange={e => setDraft({ ...draft, rules: draft.rules.map(item => item.id === rule.id ? { ...item, keyword: e.target.value } : item) })} /></div> : rule.keyword}</td><td>{editing ? <div className="interview-field"><input aria-label={`Replace With ${index + 1}`} required value={rule.replacement} onChange={e => setDraft({ ...draft, rules: draft.rules.map(item => item.id === rule.id ? { ...item, replacement: e.target.value } : item) })} /></div> : rule.replacement}</td>{editing && <td><button type="button" aria-label={`Remove keyword ${index + 1}`} onClick={() => setDraft({ ...draft, rules: draft.rules.filter(item => item.id !== rule.id) })}><Trash2 size={16} /></button></td>}</tr>)}{!draft.rules.length && <tr><td colSpan={editing ? 3 : 2} className="interview-empty">No Records Found.</td></tr>}</tbody></table></div></div>
    <footer className="job-config-footer"><div>{error ? <p role="alert" className="interview-error">{error}</p> : <p role="status">{notice}</p>}</div>{editing && <><button type="button" className="interview-secondary" onClick={() => { setDraft(stored); setEditing(false); setError(''); }}>Cancel</button><button type="submit" className="interview-primary"><Save size={16} />Save</button></>}</footer></form></section>;
}

export function JobPriorities() {
  return <section className="posting-panel space-y-4"><div className="posting-panel-heading"><h2>Priorities</h2></div><InterviewLookup kind="Priorities" /></section>;
}
