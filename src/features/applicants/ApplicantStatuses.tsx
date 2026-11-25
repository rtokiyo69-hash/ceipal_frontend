import React, { useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';

type ApplicantStatusRecord = {
  id: string;
  name: string;
  createdBy: string;
  modifiedBy: string;
  modifiedAt: string;
  restrictSubmissions: boolean;
};

type ApplicantStatusActivity = {
  id: string;
  action: string;
  user: string;
  date: string;
};

type ApplicantStatusData = {
  statuses: ApplicantStatusRecord[];
  activities: ApplicantStatusActivity[];
};

const STORAGE_KEY = 'ats_applicant_statuses_admin';
const PAGE_SIZE_OPTIONS = [10, 25, 50];
const INITIAL_DATE = '14 Sep 2024, 08:35';
const INITIAL_NAMES = [
  'Imported from Orwin - FTE-Started but not completed 90 days',
  'Imported from Orwin - FTE converted',
  'Imported from Orwin',
  'Imported from Orwin - Placed',
  'Imported from Orwin - Blocklist',
  'Imported from Orwin - Available',
  'BlockList',
  'Do Not Disturb',
  'New',
  'Available',
  'Placed',
  'Hired',
  'Rejected',
];

const INITIAL_DATA: ApplicantStatusData = {
  statuses: INITIAL_NAMES.map((name, index) => ({
    id: `applicant-status-${index + 1}`,
    name,
    createdBy: 'Sachin Wadeygar',
    modifiedBy: 'Sachin Wadeygar',
    modifiedAt: index === 0 ? '15 Sep 2024, 04:00' : INITIAL_DATE,
    restrictSubmissions: name === 'BlockList' || name === 'Do Not Disturb',
  })),
  activities: [],
};

const fieldClass =
  'w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-sm text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white';

function loadStatusData(): ApplicantStatusData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_DATA;
    const parsed: Partial<ApplicantStatusData> = JSON.parse(stored);
    return {
      statuses: Array.isArray(parsed.statuses) ? parsed.statuses : INITIAL_DATA.statuses,
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
    };
  } catch (error) {
    console.error('Unable to load applicant statuses:', error);
    return INITIAL_DATA;
  }
}

function formatNow(): string {
  return new Date().toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const ApplicantStatuses: React.FC = () => {
  const { currentUser } = useAppStore();
  const [data, setData] = useState<ApplicantStatusData>(loadStatusData);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<{
    id?: string;
    name: string;
    restrictSubmissions: boolean;
  } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ApplicantStatusRecord | null>(null);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredStatuses = useMemo(
    () => data.statuses.filter((status) => status.name.toLowerCase().includes(search.trim().toLowerCase())),
    [data.statuses, search],
  );
  const pageCount = Math.max(1, Math.ceil(filteredStatuses.length / pageSize));
  const pageStart = filteredStatuses.length ? (page - 1) * pageSize + 1 : 0;
  const pageEnd = Math.min(page * pageSize, filteredStatuses.length);
  const visibleStatuses = filteredStatuses.slice((page - 1) * pageSize, page * pageSize);

  const commit = (next: ApplicantStatusData, message: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setData(next);
      setNotice({ type: 'success', text: message });
    } catch (error) {
      console.error('Unable to save applicant statuses:', error);
      setNotice({ type: 'error', text: 'Could not save your changes. Please try again.' });
    }
    window.setTimeout(() => setNotice(null), 3500);
  };

  const saveStatus = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing?.name.trim()) return;
    const name = editing.name.trim();
    if (data.statuses.some((status) => status.name.toLowerCase() === name.toLowerCase() && status.id !== editing.id)) {
      setNotice({ type: 'error', text: 'An applicant status with this name already exists.' });
      return;
    }

    const actor = currentUser?.name || 'Admin';
    const timestamp = formatNow();
    const action = `${editing.id ? 'Updated' : 'Added'} applicant status “${name}”`;
    const activity: ApplicantStatusActivity = {
      id: `activity-${Date.now()}`,
      action,
      user: actor,
      date: timestamp,
    };
    const statuses = editing.id
      ? data.statuses.map((status) =>
          status.id === editing.id
            ? {
                ...status,
                name,
                restrictSubmissions: editing.restrictSubmissions,
                modifiedBy: actor,
                modifiedAt: timestamp,
              }
            : status,
        )
      : [
          ...data.statuses,
          {
            id: `applicant-status-${Date.now()}`,
            name,
            createdBy: actor,
            modifiedBy: actor,
            modifiedAt: timestamp,
            restrictSubmissions: editing.restrictSubmissions,
          },
        ];

    commit({ ...data, statuses, activities: [activity, ...data.activities] }, 'Applicant status saved.');
    setEditing(null);
  };

  const toggleRestriction = (status: ApplicantStatusRecord) => {
    const actor = currentUser?.name || 'Admin';
    const timestamp = formatNow();
    const restrictSubmissions = !status.restrictSubmissions;
    const statuses = data.statuses.map((item) =>
      item.id === status.id ? { ...item, restrictSubmissions, modifiedBy: actor, modifiedAt: timestamp } : item,
    );
    const activity: ApplicantStatusActivity = {
      id: `activity-${Date.now()}`,
      action: `${restrictSubmissions ? 'Restricted' : 'Allowed'} submissions for “${status.name}”`,
      user: actor,
      date: timestamp,
    };
    commit(
      { ...data, statuses, activities: [activity, ...data.activities] },
      `Submission restriction ${restrictSubmissions ? 'enabled' : 'disabled'} for “${status.name}”.`,
    );
  };

  const deleteStatus = () => {
    if (!pendingDelete) return;
    const actor = currentUser?.name || 'Admin';
    const timestamp = formatNow();
    const activity: ApplicantStatusActivity = {
      id: `activity-${Date.now()}`,
      action: `Deleted applicant status “${pendingDelete.name}”`,
      user: actor,
      date: timestamp,
    };
    commit(
      {
        ...data,
        statuses: data.statuses.filter((status) => status.id !== pendingDelete.id),
        activities: [activity, ...data.activities],
      },
      'Applicant status deleted.',
    );
    setPendingDelete(null);
  };

  return (
    <div className="space-y-4 pb-8">
      {notice && (
        <div
          role={notice.type === 'error' ? 'alert' : 'status'}
          className={`fixed right-6 top-20 z-[90] flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-white shadow-xl ${
            notice.type === 'success' ? 'bg-[#15803D]' : 'bg-[#B91C1C]'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {notice.text}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#1E293B]">
        <div className="flex flex-col gap-4 border-b border-[#E8EEF6] p-5 dark:border-[#334155] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2563EB] dark:text-[#93C5FD]">
              Applicants · Administration
            </p>
            <h1 className="mt-1 text-lg font-bold text-[#1E293B] dark:text-white">Applicant Statuses</h1>
            <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
              Manage status names and control whether applicants in each status can be submitted.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActivitiesOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D8E3F1] bg-white px-3 text-xs font-semibold text-[#334155] transition-colors hover:bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white dark:hover:bg-[#334155]"
            >
              <Activity className="h-4 w-4 text-[#2563EB] dark:text-[#60A5FA]" />
              Activities
              {data.activities.length > 0 && (
                <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] text-[#1D4ED8] dark:bg-[#1E3A5F] dark:text-[#BFDBFE]">
                  {data.activities.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setEditing({ name: '', restrictSubmissions: false })}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
            >
              <Plus className="h-4 w-4" />
              Add status
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <label className="flex h-10 w-full max-w-md items-center gap-2 rounded-xl border border-[#D8E3F1] bg-white px-3 text-[#64748B] transition-colors focus-within:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-slate-400">
            <Search className="h-4 w-4 shrink-0" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search applicant statuses..."
              aria-label="Search applicant statuses"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#1E293B] outline-none placeholder:text-[#94A3B8] dark:text-white"
            />
            {search && (
              <button type="button" aria-label="Clear search" onClick={() => setSearch('')}>
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
          <span className="text-xs text-[#64748B] dark:text-slate-400">
            {filteredStatuses.length} {filteredStatuses.length === 1 ? 'status' : 'statuses'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-y border-[#E8EEF6] bg-[#F8FAFC] text-[10px] font-semibold uppercase tracking-wide text-[#64748B] dark:border-[#334155] dark:bg-[#0F172A] dark:text-slate-300">
                <th scope="col" className="px-5 py-3">Name</th>
                <th scope="col" className="px-4 py-3">Created by</th>
                <th scope="col" className="px-4 py-3">Modified by</th>
                <th scope="col" className="px-4 py-3">Last modified</th>
                <th scope="col" className="px-4 py-3">Restrict submissions</th>
                <th scope="col" className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EEF6] dark:divide-[#334155]">
              {visibleStatuses.map((status) => (
                <tr key={status.id} className="transition-colors hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A]/60">
                  <td className="max-w-[360px] whitespace-normal px-5 py-3.5 font-semibold text-[#1E293B] dark:text-white">
                    {status.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-[#475569] dark:text-slate-300">{status.createdBy}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-[#475569] dark:text-slate-300">{status.modifiedBy}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-[#64748B] dark:text-slate-400">{status.modifiedAt}</td>
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={status.restrictSubmissions}
                      aria-label={`${status.restrictSubmissions ? 'Allow' : 'Restrict'} submissions for ${status.name}`}
                      title={status.restrictSubmissions ? 'Submissions restricted' : 'Submissions allowed'}
                      onClick={() => toggleRestriction(status)}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
                        status.restrictSubmissions ? 'bg-[#2563EB]' : 'bg-[#CBD5E1] dark:bg-slate-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                        status.restrictSubmissions ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                    <span className={`ml-2 text-[11px] ${
                      status.restrictSubmissions
                        ? 'font-medium text-[#1D4ED8] dark:text-[#93C5FD]'
                        : 'text-[#64748B] dark:text-slate-400'
                    }`}>
                      {status.restrictSubmissions ? 'Restricted' : 'Allowed'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        aria-label={`Edit status ${status.name}`}
                        onClick={() => setEditing({
                          id: status.id,
                          name: status.name,
                          restrictSubmissions: status.restrictSubmissions,
                        })}
                        className="rounded-lg p-2 text-[#475569] transition-colors hover:bg-[#EFF6FF] hover:text-[#1D4ED8] dark:text-slate-300 dark:hover:bg-[#1E3A5F] dark:hover:text-[#BFDBFE]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete status ${status.name}`}
                        onClick={() => setPendingDelete(status)}
                        className="rounded-lg p-2 text-[#64748B] transition-colors hover:bg-[#FEF2F2] hover:text-[#B91C1C] dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleStatuses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <Search className="mx-auto h-6 w-6 text-[#94A3B8]" />
                    <p className="mt-2 text-sm font-semibold text-[#334155] dark:text-slate-200">
                      {search ? 'No matching statuses' : 'No applicant statuses yet'}
                    </p>
                    <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                      {search ? 'Try another search term.' : 'Add a status to get started.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8EEF6] px-5 py-3 dark:border-[#334155]">
          <label className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400">
            Show
            <select
              aria-label="Rows per page"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-[#D8E3F1] bg-white px-2 py-1.5 text-xs text-[#334155] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
            >
              {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
            of {filteredStatuses.length}
          </label>
          <div className="flex items-center gap-2">
            <span className="mr-2 text-xs text-[#64748B] dark:text-slate-400">
              {pageStart}–{pageEnd} of {filteredStatuses.length}
            </span>
            <button
              type="button"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-[#D8E3F1] p-1.5 text-[#475569] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#334155] dark:text-slate-300 dark:hover:bg-[#0F172A]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-7 text-center text-xs font-semibold text-[#1E293B] dark:text-white">
              {page} / {pageCount}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={page >= pageCount}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              className="rounded-lg border border-[#D8E3F1] p-1.5 text-[#475569] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#334155] dark:text-slate-300 dark:hover:bg-[#0F172A]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setEditing(null);
        }}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="applicant-status-editor-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#D8E3F1] bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]"
          >
            <div className="flex items-start justify-between border-b border-[#E8EEF6] p-5 dark:border-[#334155]">
              <div>
                <h2 id="applicant-status-editor-title" className="text-base font-bold text-[#1E293B] dark:text-white">
                  {editing.id ? 'Edit applicant status' : 'Add applicant status'}
                </h2>
                <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                  Choose a clear name and whether applicants with this status can be submitted.
                </p>
              </div>
              <button type="button" aria-label="Close dialog" onClick={() => setEditing(null)} className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={saveStatus} className="space-y-4 p-5">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-[#334155] dark:text-slate-200">Status name</span>
                <input
                  autoFocus
                  required
                  maxLength={100}
                  value={editing.name}
                  onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                  placeholder="e.g. Ready for submission"
                  className={fieldClass}
                />
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E2E8F0] p-4 dark:border-[#334155] dark:bg-[#0F172A]">
                <input
                  type="checkbox"
                  checked={editing.restrictSubmissions}
                  onChange={(event) => setEditing({ ...editing, restrictSubmissions: event.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span>
                  <span className="block text-sm font-semibold text-[#1E293B] dark:text-white">Restrict submissions</span>
                  <span className="mt-1 block text-xs text-[#64748B] dark:text-slate-400">
                    Prevent applicants with this status from being submitted to jobs or clients.
                  </span>
                </span>
              </label>
              <div className="flex justify-end gap-2 border-t border-[#E8EEF6] pt-4 dark:border-[#334155]">
                <button type="button" onClick={() => setEditing(null)} className="h-10 rounded-xl border border-[#D8E3F1] px-4 text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] dark:border-[#334155] dark:text-slate-200 dark:hover:bg-[#334155]">
                  Cancel
                </button>
                <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-semibold text-white hover:bg-[#1D4ED8]">
                  <CheckCircle2 className="h-4 w-4" />
                  Save status
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/45 p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-applicant-status-title"
            className="w-full max-w-md rounded-2xl border border-[#D8E3F1] bg-white p-5 shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2] text-[#B91C1C] dark:bg-red-950/40 dark:text-red-300">
                <Trash2 className="h-5 w-5" />
              </span>
              <div>
                <h2 id="delete-applicant-status-title" className="text-sm font-bold text-[#1E293B] dark:text-white">
                  Delete applicant status?
                </h2>
                <p className="mt-1 text-sm text-[#475569] dark:text-slate-300">
                  “{pendingDelete.name}” will be removed from this settings list. Existing applicant records will not be changed.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="h-10 rounded-xl border border-[#D8E3F1] px-4 text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] dark:border-[#334155] dark:text-slate-200 dark:hover:bg-[#334155]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteStatus}
                className="h-10 rounded-xl bg-[#B91C1C] px-4 text-xs font-semibold text-white hover:bg-[#991B1B]"
              >
                Delete status
              </button>
            </div>
          </section>
        </div>
      )}

      {activitiesOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/35" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setActivitiesOpen(false);
        }}>
          <aside aria-label="Applicant status activity history" className="flex h-full w-full max-w-md flex-col border-l border-[#D8E3F1] bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
            <div className="flex items-center justify-between border-b border-[#E8EEF6] p-5 dark:border-[#334155]">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#2563EB] dark:text-[#93C5FD]">
                  <Clock3 className="h-4 w-4" /> Audit trail
                </p>
                <h2 className="mt-1 text-base font-bold text-[#1E293B] dark:text-white">Recent activity</h2>
              </div>
              <button type="button" aria-label="Close activity history" onClick={() => setActivitiesOpen(false)} className="rounded-lg p-2 text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {data.activities.length ? data.activities.map((activity) => (
                <article key={activity.id} className="rounded-xl border border-[#E2E8F0] p-4 dark:border-[#334155] dark:bg-[#0F172A]">
                  <p className="text-sm font-semibold text-[#1E293B] dark:text-white">{activity.action}</p>
                  <p className="mt-2 text-xs text-[#64748B] dark:text-slate-400">{activity.user} · {activity.date}</p>
                </article>
              )) : (
                <div className="py-12 text-center">
                  <Activity className="mx-auto h-7 w-7 text-[#94A3B8]" />
                  <p className="mt-3 text-sm font-semibold text-[#334155] dark:text-slate-200">No activity yet</p>
                  <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">Changes to applicant statuses will appear here.</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
