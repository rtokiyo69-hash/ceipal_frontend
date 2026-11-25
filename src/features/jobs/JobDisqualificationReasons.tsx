import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  Pencil,
  Plus,
  Search,
  Trash2,
  X
} from 'lucide-react';
import { Overlay } from './InterviewLookup';
import { SearchableSelect } from '../../components/common/SearchableSelect';
import { useAppStore } from '../../store/appStore';

type DisqualificationView = 'Categories' | 'Reasons';
type RecordDialog = 'add' | 'edit' | null;

interface DisqualificationRecord {
  id: string;
  name: string;
  createdBy: string;
  updatedBy: string;
  lastModified: string;
  categoryId?: string;
  roles?: string[];
}

interface DisqualificationActivity {
  id: string;
  action: string;
  name: string;
  user: string;
  timestamp: string;
}

const categoryStorageKey = 'ats_job_disqualification_categories';
const reasonStorageKey = 'ats_job_disqualification_reasons';
const activitiesStorageKey = 'ats_job_disqualification_activities';

const initialCategories: DisqualificationRecord[] = [
  { id: 'category-1', name: 'Disqualified By Client', createdBy: 'Harshall Gawande', updatedBy: 'Harshall Gawande', lastModified: '21/02/2025 16:41:15' },
  { id: 'category-2', name: 'Other', createdBy: 'Sachin Wadeyar', updatedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:22' },
  { id: 'category-3', name: 'No Response', createdBy: 'Sachin Wadeyar', updatedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:22' },
  { id: 'category-4', name: 'Job Filled', createdBy: 'Sachin Wadeyar', updatedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:22' },
  { id: 'category-5', name: 'Job Closed', createdBy: 'Sachin Wadeyar', updatedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:22' },
  { id: 'category-6', name: 'Duplicate', createdBy: 'Sachin Wadeyar', updatedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:22' },
  { id: 'category-7', name: 'Resume Rejected', createdBy: 'Sachin Wadeyar', updatedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:22' },
  { id: 'category-8', name: 'Candidature Rejected', createdBy: 'Sachin Wadeyar', updatedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:22' },
  { id: 'category-9', name: 'Candidate Withdrew', createdBy: 'Sachin Wadeyar', updatedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:22' }
];

const roleOptions = ['Account Manager', 'Administrator', 'CRO - Hiring Manager', 'Hiring Manager', 'HR Executive', 'HR Manager', 'MIS', 'Payroll Manager', 'Recruiter'];
const defaultRoles = ['Account Manager', 'Administrator', 'Hiring Manager', 'HR Executive', 'HR Manager', 'Payroll Manager', 'Recruiter'];
const initialReasons: DisqualificationRecord[] = ['Duplicate Candidate Submitted Earlier', 'Disqualified By Client'].map((name, index) => ({ id: `reason-${index + 1}`, name, categoryId: 'category-1', roles: [...defaultRoles], createdBy: 'Harshall Gawande', updatedBy: 'Harshall Gawande', lastModified: '03/06/2024 22:51:22' }));

function readStoredRecords(key: string, initialRecords: DisqualificationRecord[]): DisqualificationRecord[] {
  try { const storedRecords = localStorage.getItem(key); const parsed = storedRecords ? JSON.parse(storedRecords) : null; return Array.isArray(parsed) ? parsed : initialRecords; } catch { return initialRecords; }
}

export const JobDisqualificationReasons: React.FC = () => {
  const { currentUser } = useAppStore();
  const [activeView, setActiveView] = useState<DisqualificationView>('Categories');
  const [categories, setCategories] = useState<DisqualificationRecord[]>(() => readStoredRecords(categoryStorageKey, initialCategories));
  const [reasons, setReasons] = useState<DisqualificationRecord[]>(() => readStoredRecords(reasonStorageKey, initialReasons));
  const [activities, setActivities] = useState<DisqualificationActivity[]>(() => {
    const storedActivities = localStorage.getItem(activitiesStorageKey);
    return storedActivities ? JSON.parse(storedActivities) as DisqualificationActivity[] : [];
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialog, setDialog] = useState<RecordDialog>(null);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<DisqualificationRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<DisqualificationRecord | null>(null);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(categoryStorageKey, JSON.stringify(categories));
    } catch (error) {
      console.error('Unable to save disqualification categories:', error);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(reasonStorageKey, JSON.stringify(reasons));
    } catch (error) {
      console.error('Unable to save disqualification reasons:', error);
    }
  }, [reasons]);

  useEffect(() => {
    try {
      localStorage.setItem(activitiesStorageKey, JSON.stringify(activities));
    } catch (error) {
      console.error('Unable to save disqualification activities:', error);
    }
  }, [activities]);

  const records = activeView === 'Categories' ? categories : reasons;
  const setRecords = activeView === 'Categories' ? setCategories : setReasons;
  const singularLabel = activeView === 'Categories' ? 'category' : 'reason';
  const filteredRecords = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return records.filter((record) => `${record.name} ${categories.find(category => category.id === record.categoryId)?.name || ''} ${(record.roles || []).join(' ')}`.toLocaleLowerCase().includes(query));
  }, [records, search, categories]);
  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstRecord = filteredRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastRecord = Math.min(currentPage * pageSize, filteredRecords.length);

  const addActivity = (action: string, recordName: string) => {
    setActivities((previous) => [
      {
        id: `activity-${Date.now()}`,
        action,
        name: recordName,
        user: currentUser?.name || 'Admin',
        timestamp: new Date().toLocaleString()
      },
      ...previous
    ]);
  };

  const openAddDialog = () => {
    setEditingRecord(null);
    setName('');
    setCategoryId('');
    setSelectedRoles([]);
    setValidationError('');
    setDialog('add');
  };

  const openEditDialog = (record: DisqualificationRecord) => {
    setEditingRecord(record);
    setName(record.name);
    setCategoryId(record.categoryId || '');
    setSelectedRoles(record.roles || []);
    setValidationError('');
    setDialog('edit');
  };

  const saveRecord = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) {
      setValidationError(`Enter a disqualification ${singularLabel} name.`);
      return;
    }
    if (records.some((record) => record.id !== editingRecord?.id && record.name.toLocaleLowerCase() === nextName.toLocaleLowerCase())) {
      setValidationError(`This disqualification ${singularLabel} already exists.`);
      return;
    }

    if (activeView === 'Reasons' && (!selectedRoles.length || !categories.some(category => category.id === categoryId))) { setValidationError('Select Accessible to Roles and Disqualification Category.'); return; }
    const details = activeView === 'Reasons' ? { categoryId, roles: selectedRoles } : {};
    const user = currentUser?.name || 'Admin';
    const timestamp = new Date().toLocaleString('en-GB');
    if (editingRecord) {
      setRecords((previous) => previous.map((record) => record.id === editingRecord.id
        ? { ...record, ...details, name: nextName, updatedBy: user, lastModified: timestamp }
        : record));
      addActivity('Updated', nextName);
    } else {
      setRecords((previous) => [
        { ...details, id: `${singularLabel}-${Date.now()}`, name: nextName, createdBy: user, updatedBy: user, lastModified: timestamp },
        ...previous
      ]);
      addActivity('Added', nextName);
      setPage(1);
    }
    setDialog(null);
  };

  const deleteRecord = () => {
    if (!recordToDelete) return;
    if (activeView === 'Categories' && reasons.some(reason => reason.categoryId === recordToDelete.id)) { setValidationError('This category is used by a reason. Reassign the reason before deleting the category.'); return; }
    setRecords((previous) => previous.filter((record) => record.id !== recordToDelete.id));
    addActivity('Deleted', recordToDelete.name);
    setRecordToDelete(null);
  };

  const closeDialogs = () => {
    setDialog(null);
    setRecordToDelete(null);
    setActivitiesOpen(false);
  };

  return (
    <section className="posting-panel posting-records space-y-3">
      <div className="posting-panel-heading"><span className="posting-section-icon"><Activity size={21} /></span><div><h2>Disqualification reasons</h2><p>Keep candidate decisions consistent with shared categories and reasons.</p></div><span className="posting-count">{records.length} {activeView.toLowerCase()}</span></div>
      <nav aria-label="Disqualification reason views" className="flex h-8 items-stretch gap-1 border-b border-[#D8E3F1] dark:border-[#334155]">
        {(['Categories', 'Reasons'] as const).map((view) => (
          <button
            key={view}
            type="button"
            aria-current={activeView === view ? 'page' : undefined}
            onClick={() => {
              setActiveView(view);
              setSearch('');
              setPage(1);
            }}
            className={`border-b-2 px-3 text-xs font-medium transition-colors ${
              activeView === view
                ? 'border-[#2563EB] text-[#2563EB] dark:text-[#60A5FA]'
                : 'border-transparent text-[#475569] hover:text-[#1E293B] dark:text-[#BFDBFE] dark:hover:text-white'
            }`}
          >
            {view} <span className="posting-tab-count">{view === 'Categories' ? categories.length : reasons.length}</span>
          </button>
        ))}
      </nav>

      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <label className="flex h-8 w-full max-w-[200px] items-center border border-[#CBD5E1] bg-white px-2 text-[#64748B] dark:border-[#334155] dark:bg-[#1E293B]">
          <Search className="mr-1.5 h-3 w-3 shrink-0" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={`Search ${activeView.toLowerCase()}...`}
            aria-label={`Search disqualification ${activeView.toLocaleLowerCase()}`}
            className="min-w-0 flex-1 bg-transparent text-[10px] text-[#1E293B] outline-none placeholder:text-[#64748B] dark:text-white"
          />
        </label>
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setActivitiesOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 border border-[#E2E8F0] bg-[#F1F1F1] px-2.5 text-[10px] text-[#334155] hover:bg-[#E8EDF3] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
          >
            <Activity className="h-3 w-3" />
            Activities
          </button>
          <button
            type="button"
            onClick={openAddDialog}
            className="inline-flex h-8 items-center gap-1 bg-[#2563EB] px-2.5 text-[10px] font-semibold text-white hover:bg-[#1D4ED8]"
          >
            <Plus className="h-3 w-3" />
            {activeView === 'Reasons' ? 'Add' : `Add ${singularLabel}`}
          </button>
        </div>
      </div>

      <div className="posting-table-scroll overflow-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-[10px]">
          <thead className="sticky top-0 z-10 bg-[#F1F1F1] text-[9px] uppercase text-[#334155] dark:bg-[#334155] dark:text-[#BFDBFE]">
            <tr>
              <th scope="col" className="px-2 py-2 font-semibold">{activeView === 'Categories' ? 'Disqualification Category' : 'Description'}</th>
              {activeView === 'Reasons' && <><th scope="col">Disqualification Category</th><th scope="col">Accessable to Roles</th></>}
              <th scope="col" className="px-2 py-2 font-semibold">Created by</th>
              <th scope="col" className="px-2 py-2 font-semibold">Updated by</th>
              {activeView === 'Categories' && <th scope="col" className="px-2 py-2 font-semibold">Last modified</th>}
              <th scope="col" className="w-24 px-2 py-2 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
            {visibleRecords.map((record) => (
              <tr key={record.id} className="h-[30px] hover:bg-[#F8FAFC] dark:hover:bg-[#334155]">
                <td className="px-2 py-1.5 text-[#1E293B] dark:text-white">{record.name}</td>
                {activeView === 'Reasons' && <><td>{categories.find(category => category.id === record.categoryId)?.name || 'Not assigned'}</td><td className="reason-roles-cell">{record.roles?.join(', ') || 'Not assigned'}</td></>}
                <td className="px-2 py-1.5 text-[#334155] dark:text-[#BFDBFE]">{record.createdBy}</td>
                <td className="px-2 py-1.5 text-[#334155] dark:text-[#BFDBFE]">{record.updatedBy}</td>
                {activeView === 'Categories' && <td className="px-2 py-1.5 text-[#334155] dark:text-[#BFDBFE]">{record.lastModified}</td>}
                <td className="px-2 py-1">
                  <div className="flex items-center justify-center gap-1">
                    <button type="button" onClick={() => openEditDialog(record)} aria-label={`Edit ${record.name}`} className="rounded p-1 text-[#64748B] hover:bg-white hover:text-[#2563EB] dark:hover:bg-[#1E293B]">
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button type="button" onClick={() => { setValidationError(''); setRecordToDelete(record); }} aria-label={`Delete ${record.name}`} className="rounded p-1 text-[#64748B] hover:bg-white hover:text-rose-600 dark:hover:bg-[#1E293B]">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visibleRecords.length === 0 && (
              <tr>
                <td colSpan={activeView === 'Reasons' ? 6 : 5} className="px-3 py-10 text-center text-[#64748B]">No matching records. Try a different search or add a new entry.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col justify-between gap-2 text-[10px] text-[#64748B] sm:flex-row sm:items-center">
        <span>Showing {firstRecord} to {lastRecord} of {filteredRecords.length} entries</span>
        <div className="flex items-center justify-end gap-1.5">
          <button type="button" aria-label="First page" disabled={currentPage === 1} onClick={() => setPage(1)} className="rounded p-1 disabled:opacity-40"><ChevronsLeft className="h-3.5 w-3.5" /></button>
          <button type="button" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage((previous) => Math.max(1, previous - 1))} className="rounded p-1 disabled:opacity-40"><ChevronLeft className="h-3.5 w-3.5" /></button>
          <span className="min-w-5 rounded-full bg-[#DCE8FF] px-1.5 py-0.5 text-center text-[#125B97]">{currentPage}</span>
          <button type="button" aria-label="Next page" disabled={currentPage === pageCount} onClick={() => setPage((previous) => Math.min(pageCount, previous + 1))} className="rounded p-1 disabled:opacity-40"><ChevronRight className="h-3.5 w-3.5" /></button>
          <button type="button" aria-label="Last page" disabled={currentPage === pageCount} onClick={() => setPage(pageCount)} className="rounded p-1 disabled:opacity-40"><ChevronsRight className="h-3.5 w-3.5" /></button>
          <select aria-label="Rows per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="ml-1 rounded border border-[#CBD5E1] bg-white px-1.5 py-1 text-[10px] text-[#334155] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white">
            {[10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </div>
      </div>

      {dialog && activeView === 'Reasons' && <Overlay drawer title={dialog === 'add' ? 'Add Reason' : 'Edit Reason'} close={() => setDialog(null)}><form onSubmit={saveRecord} className="reason-drawer-form"><div className="interview-form-fields">
        <div className="interview-field"><label>Accessible to Roles <span>*</span></label><SearchableSelect label="Accessible to Roles" multiple options={roleOptions.map(role => ({ value: role, label: role }))} values={selectedRoles} onChange={setSelectedRoles} /></div>
        <div className="interview-field"><label htmlFor="reason-description">Disqualify Reason Description <span>*</span></label><input id="reason-description" required value={name} placeholder="Required" onChange={event => { setName(event.target.value); setValidationError(''); }} /></div>
        <div className="interview-field"><label>Disqualification Category <span>*</span></label><SearchableSelect label="Disqualification Category" options={[...categories].sort((a,b) => a.name.localeCompare(b.name)).map(category => ({ value: category.id, label: category.name }))} values={categoryId ? [categoryId] : []} onChange={values => setCategoryId(values[0] || '')} /></div>
        {validationError && <p role="alert" className="interview-error">{validationError}</p>}
      </div><footer className="interview-form-footer"><button type="submit" className="interview-primary">Save</button><button type="button" className="interview-secondary" onClick={() => setDialog(null)}>Cancel</button></footer></form></Overlay>}

      {((dialog && activeView === 'Categories') || recordToDelete || activitiesOpen) && (
        <div className="posting-modal-overlay fixed inset-0 z-[80] flex items-center justify-center bg-[#0F172A]/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialogs(); }}>
          {dialog && activeView === 'Categories' && (
            <form onSubmit={saveRecord} role="dialog" aria-modal="true" aria-labelledby="posting-record-dialog-title" className="posting-record-dialog" onKeyDown={(event) => { if (event.key === 'Escape') setDialog(null); }}>
              <div className="posting-dialog-header">
                <span className="posting-section-icon">{dialog === 'add' ? <Plus size={22} /> : <Pencil size={20} />}</span>
                <div><h2 id="posting-record-dialog-title">{dialog === 'add' ? 'Add' : 'Edit'} {singularLabel}</h2><p>Organize your candidate disqualification decisions.</p></div>
                <button type="button" aria-label="Close dialog" onClick={() => setDialog(null)} className="posting-dialog-close"><X size={20} /></button>
              </div>
              <div className="posting-dialog-body">
                <label htmlFor="posting-record-name">{activeView === 'Categories' ? 'Category' : 'Reason'} name <span aria-hidden="true">*</span></label>
                <input id="posting-record-name" autoFocus required value={name} placeholder={activeView === 'Categories' ? 'e.g. Candidate withdrew' : 'e.g. Experience does not match requirements'} aria-invalid={!!validationError} aria-describedby={validationError ? 'posting-record-error' : 'posting-record-hint'} onChange={(event) => { setName(event.target.value); setValidationError(''); }} />
                {validationError ? <p id="posting-record-error" role="alert" className="posting-dialog-error">{validationError}</p> : <p id="posting-record-hint">Use a clear name that your recruiting team can recognize.</p>}
              </div>
              <div className="posting-dialog-footer">
                <button type="button" onClick={() => setDialog(null)} className="posting-dialog-cancel">Cancel</button>
                <button type="submit" className="posting-dialog-submit">{dialog === 'add' ? <Plus size={16} /> : <Pencil size={16} />}{dialog === 'add' ? `Add ${singularLabel}` : 'Save changes'}</button>
              </div>
            </form>
          )}
          {recordToDelete && (
            <div className="w-full max-w-sm space-y-4 rounded-xl border border-[#D8E3F1] bg-white p-5 shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
              <h2 className="text-sm font-bold text-[#1E293B] dark:text-white">Delete “{recordToDelete.name}”?</h2>
              {validationError && <p role="alert" className="interview-error">{validationError}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setRecordToDelete(null)} className="rounded border border-[#CBD5E1] px-3 py-1.5 text-xs text-[#475569] dark:border-[#334155] dark:text-[#BFDBFE]">Cancel</button>
                <button type="button" onClick={deleteRecord} className="rounded bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white">Delete</button>
              </div>
            </div>
          )}
          {activitiesOpen && (
            <section aria-labelledby="job-disqualification-activities-title" className="w-full max-w-lg overflow-hidden rounded-xl border border-[#D8E3F1] bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
              <div className="flex items-center justify-between border-b border-[#D8E3F1] p-4 dark:border-[#334155]">
                <h2 id="job-disqualification-activities-title" className="text-sm font-bold text-[#1E293B] dark:text-white">Activities</h2>
                <button type="button" aria-label="Close activities" onClick={() => setActivitiesOpen(false)} className="rounded p-1 text-[#64748B] hover:bg-[#F1F5F9]"><X className="h-4 w-4" /></button>
              </div>
              <div className="max-h-[60vh] space-y-3 overflow-y-auto p-4">
                {activities.length ? activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-2 text-xs text-[#334155] dark:text-[#BFDBFE]">
                    <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <p><strong>{activity.user}</strong> {activity.action.toLowerCase()} <strong>{activity.name}</strong><span className="block text-[10px] text-[#64748B]">{activity.timestamp}</span></p>
                  </div>
                )) : <p className="py-8 text-center text-xs text-[#64748B]">No recent activity.</p>}
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  );
};
