import React, { useState } from 'react';
import { CheckCircle, Clock3, Pencil, Plus, Search, Trash2, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { AppRoute, useAppStore } from '../../store/appStore';

type Tab = 'requisition-code' | 'requisition-lookups' | 'requisition-settings' | 'requisition-workflows';

interface LookupRow {
  id: number;
  name: string;
  modifiedBy: string;
  modifiedAt: string;
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'requisition-code', label: 'Job Requisition Code' },
  { id: 'requisition-lookups', label: 'Job Requisition Lookups' },
  { id: 'requisition-settings', label: 'Job Requisition Settings' },
  { id: 'requisition-workflows', label: 'Requisition Workflows' }
];

const initialStatuses: LookupRow[] = [
  { id: 1, name: 'Budgeted', modifiedBy: 'Socrin Wadesigner', modifiedAt: '03/06/2024 22:51:26' },
  { id: 2, name: 'Pending Approval', modifiedBy: 'Socrin Wadesigner', modifiedAt: '03/06/2024 22:51:26' },
  { id: 3, name: 'Authorized', modifiedBy: 'Socrin Wadesigner', modifiedAt: '03/06/2024 22:51:26' }
];

const initialReasons: LookupRow[] = [
  { id: 1, name: 'Replacement of existing employee', modifiedBy: 'Socrin Wadesigner', modifiedAt: '03/06/2024 22:51:26' },
  { id: 2, name: 'New Allocation', modifiedBy: 'Socrin Wadesigner', modifiedAt: '03/06/2024 22:51:26' }
];

const initialRejectionReasons: LookupRow[] = [];

export const RequisitionAdministration: React.FC = () => {
  const { currentRoute, navigate } = useAppStore();
  const activeTab = currentRoute as Tab;
  const [codeMode, setCodeMode] = useState<'automatic' | 'manual'>('automatic');
  const [toast, setToast] = useState('');
  const [lookupsTab, setLookupsTab] = useState<'statuses' | 'reasons' | 'rejection'>('statuses');
  const [statuses, setStatuses] = useState(initialStatuses);
  const [reasons, setReasons] = useState(initialReasons);
  const [rejectionReasons, setRejectionReasons] = useState(initialRejectionReasons);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [entryName, setEntryName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [workflowEnabled, setWorkflowEnabled] = useState(false);
  const [workflowType, setWorkflowType] = useState<'sequential' | 'parallel'>('sequential');
  const [workflowName, setWorkflowName] = useState('');
  const [approvalName, setApprovalName] = useState('');
  const [lookupSearch, setLookupSearch] = useState('');
  const [workflowSearch, setWorkflowSearch] = useState('');

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  };

  const openLookupModal = (title: string, row?: LookupRow) => {
    setModalTitle(title);
    setEntryName(row?.name || '');
    setEditingId(row?.id ?? null);
    setModalOpen(true);
  };

  const saveLookup = () => {
    if (!entryName.trim()) return;
    const saveRow = (rows: LookupRow[]) =>
      editingId
        ? rows.map((row) => row.id === editingId ? { ...row, name: entryName.trim(), modifiedAt: '23/11/2026 21:23:51' } : row)
        : [...rows, { id: Date.now(), name: entryName.trim(), modifiedBy: 'Socrin Wadesigner', modifiedAt: '23/11/2026 21:23:51' }];

    if (lookupsTab === 'statuses') setStatuses(saveRow(statuses));
    if (lookupsTab === 'reasons') setReasons(saveRow(reasons));
    if (lookupsTab === 'rejection') setRejectionReasons(saveRow(rejectionReasons));
    setModalOpen(false);
    showToast(editingId ? 'Entry updated successfully.' : 'Entry added successfully.');
  };

  const deleteLookup = (id: number) => {
    if (lookupsTab === 'statuses') setStatuses((rows) => rows.filter((row) => row.id !== id));
    if (lookupsTab === 'reasons') setReasons((rows) => rows.filter((row) => row.id !== id));
    if (lookupsTab === 'rejection') setRejectionReasons((rows) => rows.filter((row) => row.id !== id));
    showToast('Entry removed successfully.');
  };

  const lookupRows =
    lookupsTab === 'statuses' ? statuses :
    lookupsTab === 'reasons' ? reasons :
    rejectionReasons;
  const filteredLookupRows = lookupRows.filter((row) =>
    row.name.toLowerCase().includes(lookupSearch.trim().toLowerCase())
  );

  const lookupColumn =
    lookupsTab === 'statuses' ? 'Job Requisition Status' :
    lookupsTab === 'reasons' ? 'Requisition Reason' :
    'Requisition Rejection Reason';

  const addTitle =
    lookupsTab === 'statuses' ? 'Add Job Requisition Status' :
    lookupsTab === 'reasons' ? 'Add Job Requisition Reason' :
    'Add Job Requisition Rejection Reason';

  const switchTab = (tab: Tab) => navigate(tab as AppRoute);

  return (
    <div className="space-y-3 min-h-full bg-[#F8FAFC] dark:bg-transparent">
      {toast && (
        <div className="fixed right-6 top-20 z-[70] flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-3 text-xs text-white shadow-xl">
          <CheckCircle className="h-4 w-4" />
          {toast}
        </div>
      )}

      <div className="sticky top-0 z-40 space-y-1 bg-[#FFFFFF] pb-1 dark:bg-[#0F172A]">
        <nav
          aria-label="Requisition administration"
          className="flex overflow-x-auto rounded-xl border border-[#D8E3F1] bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-[#1E293B]"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => switchTab(tab.id)}
              className={`shrink-0 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#DCE8FF] text-[#125B97] dark:bg-[#475569] dark:text-white'
                  : 'text-[#475569] hover:bg-[#FFFFFF] hover:text-[#1E293B] dark:text-[#BFDBFE] dark:hover:bg-[#475569]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'requisition-code' && (
          <section className="rounded-xl border border-[#D8E3F1] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1E293B]">
            <div className="flex items-center gap-8 border-b border-[#EEF2F7] pb-5 text-xs dark:border-slate-700">
              <label className="flex cursor-pointer items-center gap-2">
                <input type="radio" checked={codeMode === 'automatic'} onChange={() => setCodeMode('automatic')} />
                Automatic Code Generation
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="radio" checked={codeMode === 'manual'} onChange={() => setCodeMode('manual')} />
                Manual Code Generation
              </label>
            </div>
            <button type="button" onClick={() => showToast('Requisition code settings saved.')} className="mt-4 rounded-md bg-[#2563EB] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8]">
              Save
            </button>
          </section>
        )}

        {activeTab === 'requisition-lookups' && (
          <section>
            <div className="flex flex-nowrap items-center gap-3 border-b border-[#D8E3F1] pb-2 dark:border-[#334155]">
              <nav className="flex min-w-0 items-center overflow-visible" aria-label="Lookup types">
                {[
                  { id: 'statuses', label: 'Job Requisition Statuses' },
                  { id: 'reasons', label: 'Requisition Reasons' },
                  { id: 'rejection', label: 'Requisition Rejection Reasons' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLookupsTab(item.id as typeof lookupsTab)}
                    className={`shrink-0 rounded-l border border-r-0 border-[#D8E3F1] px-3 py-2 text-xs font-medium first:rounded-l last:rounded-r last:border-r dark:border-[#334155] ${
                      lookupsTab === item.id
                        ? 'bg-white text-[#1E293B] dark:bg-[#1E293B] dark:text-white'
                        : 'bg-[#FFFFFF] text-[#475569] hover:bg-white dark:bg-[#1E293B] dark:text-[#BFDBFE]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <button type="button" onClick={() => showToast('All activities are up to date.')} className="inline-flex items-center gap-1.5 rounded-md border border-[#D8E3F1] bg-white px-2.5 py-2 text-xs text-[#334155] shadow-sm hover:bg-[#FFFFFF] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white">
                  <Clock3 className="h-3.5 w-3.5" /> Activities
                </button>
                <button type="button" onClick={() => openLookupModal(addTitle)} className="inline-flex items-center gap-1.5 rounded-md bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1D4ED8]">
                  <Plus className="h-4 w-4" /> New
                </button>
              </div>
            </div>

            <div className="mt-3 flex h-8 w-[340px] max-w-full items-center rounded-md border border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#475569]">
              <input
                value={lookupSearch}
                onChange={(e) => setLookupSearch(e.target.value)}
                placeholder=""
                aria-label={`Search ${lookupColumn}`}
                className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-xs text-[#334155] outline-none dark:text-white"
              />
              <button type="button" aria-label={`Search ${lookupColumn}`} className="flex h-full items-center justify-center px-2.5 text-[#64748B] hover:text-[#1E293B] dark:text-white">
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>

            {lookupsTab === 'reasons' && (
              <p className="mb-3 text-xs text-[#475569] dark:text-slate-300">
                Reasons for creating a requisition. Users can configure the reasons here.
              </p>
            )}

            <LookupTable
              column={lookupColumn}
              rows={filteredLookupRows}
              onEdit={(row) => openLookupModal(addTitle.replace('Add', 'Edit'), row)}
              onDelete={deleteLookup}
            />
          </section>
        )}

        {activeTab === 'requisition-settings' && (
          <section className="max-w-5xl rounded-xl border border-[#D8E3F1] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1E293B]">
            {[
              'Make Comments Mandatory While Approving an Job Requisition',
              'Make Comments Mandatory While Rejecting the Job Requisition',
              'Make “Rejection Reason” Mandatory While Rejecting the Job Requisition',
              'Escalation Notification when Job Requisition Approval is pending'
            ].map((label) => (
              <label key={label} className="flex cursor-pointer items-center justify-between border-b border-[#EEF2F7] py-3 text-xs last:border-b-0 dark:border-slate-700">
                <span>{label}</span>
                <input type="checkbox" className="h-4 w-4 accent-[#2563EB]" />
              </label>
            ))}
            <button type="button" onClick={() => showToast('Requisition settings saved.')} className="mt-5 rounded-md bg-[#2563EB] px-5 py-2 text-xs font-semibold text-white">
              Save
            </button>
          </section>
        )}

        {activeTab === 'requisition-workflows' && (
          <section>
            <div className="flex flex-nowrap items-center gap-3 border-b border-[#D8E3F1] pb-2 dark:border-[#334155]">
              <div className="ml-auto flex shrink-0 items-center gap-2">
              <button type="button" onClick={() => showToast('All workflow activities are up to date.')} className="inline-flex items-center gap-1.5 rounded-md border border-[#D8E3F1] bg-white px-2.5 py-2 text-xs text-[#334155] shadow-sm hover:bg-[#FFFFFF] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white">
                <Clock3 className="h-3.5 w-3.5" /> Activities
              </button>
              <button type="button" onClick={() => setWorkflowEnabled(true)} className="inline-flex items-center gap-1.5 rounded-md bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1D4ED8]">
                <Plus className="h-4 w-4" /> New
              </button>
              </div>
            </div>

            <div className="mt-3 flex h-8 w-[340px] max-w-full items-center rounded-md border border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#475569]">
              <input
                value={workflowSearch}
                onChange={(e) => setWorkflowSearch(e.target.value)}
                aria-label="Search requisition workflows"
                className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-xs text-[#334155] outline-none dark:text-white"
              />
              <button type="button" aria-label="Search requisition workflows" className="flex h-full items-center justify-center px-2.5 text-[#64708B] dark:text-white">
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>

            {!workflowEnabled ? (
              <LookupTable
                column="Approval Flow Name"
                rows={[]}
                onEdit={() => {}}
                onDelete={() => {}}
                emptyText="No Records Found."
                additionalColumns={['Approver Name', 'Business Unit', 'Department', 'Workflow Type']}
              />
            ) : (
              <section className="max-w-5xl rounded-xl border border-[#D8E3F1] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1E293B]">
                <label className="mb-5 flex cursor-pointer items-center justify-between text-xs">
                  <span>Job Requisition creators can make changes to the approvers in the approval workflow</span>
                  <input type="checkbox" className="h-4 w-4 accent-[#2563EB]" />
                </label>
                <div className="grid max-w-xl gap-4 text-xs">
                  <label>
                    <span className="mb-1 block font-medium">Approval Flow Name <b className="text-rose-500">*</b></span>
                    <input value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} className="w-full rounded-md border border-[#C5D2E3] px-3 py-2" />
                  </label>
                  <label>
                    <span className="mb-1 block font-medium">Business Unit List <b className="text-rose-500">*</b></span>
                    <select className="w-full rounded-md border border-[#C5D2E3] px-3 py-2">
                      <option>Ampcus Tech Pvt Ltd.</option>
                    </select>
                  </label>
                  <label>
                    <span className="mb-1 block font-medium">Department</span>
                    <select className="w-full rounded-md border border-[#C5D2E3] px-3 py-2"><option>Select</option></select>
                  </label>
                  <fieldset>
                    <legend className="mb-2 font-medium">Workflow Type</legend>
                    <label className="mr-5"><input type="radio" checked={workflowType === 'sequential'} onChange={() => setWorkflowType('sequential')} className="mr-1" /> Sequential <span className="text-[#2563EB]">ⓘ</span></label>
                    <label><input type="radio" checked={workflowType === 'parallel'} onChange={() => setWorkflowType('parallel')} className="mr-1" /> Parallel <span className="text-[#2563EB]">ⓘ</span></label>
                  </fieldset>
                  <label>
                    <span className="mb-1 block font-medium">Approver Name <b className="text-rose-500">*</b></span>
                    <div className="flex gap-2">
                      <select value={approvalName} onChange={(e) => setApprovalName(e.target.value)} className="flex-1 rounded-md border border-[#C5D2E3] px-3 py-2">
                        <option value="">Select</option>
                        <option>Socrin Wadesigner</option>
                      </select>
                      <button type="button" onClick={() => approvalName && showToast('Approver added.')} className="rounded-md bg-[#2563EB] px-3 text-white">+</button>
                    </div>
                    {!approvalName && <span className="mt-1 block text-[11px] text-rose-500">This field is required</span>}
                  </label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => showToast('Workflow saved successfully.')} className="rounded-md bg-[#2563EB] px-5 py-2 font-semibold text-white">Save</button>
                    <button type="button" onClick={() => setWorkflowEnabled(false)} className="rounded-md border border-[#C5D2E3] bg-white px-5 py-2">Cancel</button>
                  </div>
                </div>
              </section>
            )}
          </section>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[60] bg-[#1E293B]/25">
          <aside className="absolute right-0 top-0 h-full w-[340px] bg-white p-5 shadow-2xl dark:bg-[#1E293B]">
            <div className="mb-6 flex items-center justify-between border-b border-[#EEF2F7] pb-4">
              <h2 className="text-sm font-bold">{modalTitle}</h2>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
            <label className="block text-xs">
              <span className="mb-1 block">{lookupColumn} <b className="text-rose-500">*</b></span>
              <input value={entryName} onChange={(e) => setEntryName(e.target.value)} className="w-full rounded-md border border-[#2563EB] px-3 py-2 outline-none" />
            </label>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={saveLookup} className="rounded-md bg-[#2563EB] px-4 py-2 text-xs text-white">Save</button>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-[#C5D2E3] px-4 py-2 text-xs">Cancel</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

const LookupTable: React.FC<{
  column: string;
  rows: LookupRow[];
  onEdit: (row: LookupRow) => void;
  onDelete: (id: number) => void;
  emptyText?: string;
  additionalColumns?: string[];
}> = ({ column, rows, onEdit, onDelete, emptyText, additionalColumns }) => (
  <div className="mt-3 flex flex-col overflow-hidden rounded-xl border border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#1E293B]">
  <div className="ceipal-table-scroll max-h-[calc(100vh-270px)] min-h-[360px] overflow-x-auto overflow-y-auto">
    <table className="w-full min-w-[900px] border-collapse text-left text-xs">
      <thead className="sticky top-0 z-20 bg-[#FFFFFF] dark:bg-[#475569]">
        <tr className="h-11 border-b border-[#D8E3F1] bg-[#FFFFFF] text-[10px] font-bold uppercase text-[#64748B] dark:border-[#334155] dark:bg-[#475569]">
          <th className="px-3">{column} <span>↕</span></th>
          {additionalColumns ? additionalColumns.map((name) => <th key={name} className="px-3">{name} <span>↕</span></th>) : (
            <>
              <th className="px-3">Created By <span>↕</span></th>
              <th className="px-3">Modified By <span>↕</span></th>
              <th className="px-3">Last Modified <span>↕</span></th>
              <th className="w-24 px-3">Actions</th>
            </>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={additionalColumns ? additionalColumns.length + 1 : 5} className="px-3 py-5 text-[#2563EB]">{emptyText || 'No records found.'}</td></tr>
        ) : rows.map((row) => (
          <tr key={row.id} className="h-12 border-b border-[#F1F5F9] last:border-0 dark:border-slate-800">
            <td className="px-3 font-medium">{row.name}</td>
            <td className="px-3">Socrin Wadesigner</td>
            <td className="px-3">{row.modifiedBy}</td>
            <td className="px-3">{row.modifiedAt}</td>
            <td className="px-3">
              <div className="flex gap-3 text-[#64748B]">
                <button type="button" onClick={() => onEdit(row)} aria-label={`Edit ${row.name}`}><Pencil className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => onDelete(row.id)} aria-label={`Delete ${row.name}`}><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-center gap-2 border-t border-[#D8E3F1] bg-white px-4 py-2.5 text-[11px] text-[#334155] shadow-[0_-2px_6px_rgba(0,0,0,0.04)] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white">
    <span className="mr-2 font-semibold">{rows.length ? `1 - ${rows.length}` : '0 - 0'} of {rows.length}</span>
    <button aria-label="First page" disabled className="rounded p-1 text-[#64748B] disabled:opacity-40"><ChevronsLeft className="h-4 w-4" /></button>
    <button aria-label="Previous page" disabled className="rounded p-1 text-[#64748B] disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
    <span className="rounded bg-[#2563EB] px-2.5 py-1 font-semibold text-white">1</span>
    <button aria-label="Next page" disabled className="rounded p-1 text-[#64748B] disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
    <button aria-label="Last page" disabled className="rounded p-1 text-[#64748B] disabled:opacity-40"><ChevronsRight className="h-4 w-4" /></button>
    <label className="ml-3 flex items-center gap-2 text-[10px] text-[#64748B]">
      Per Page
      <select aria-label="Rows per page" defaultValue={10} className="rounded border border-[#D8E3F1] bg-white px-1.5 py-1 text-[#334155] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white">
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
      </select>
    </label>
  </div>
  </div>
);
