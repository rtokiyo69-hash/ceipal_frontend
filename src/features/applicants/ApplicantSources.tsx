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
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';

type SourceCategory = {
  id: string;
  name: string;
  createdBy: string;
  modifiedBy: string;
  modifiedAt: string;
  active: boolean;
};

type ApplicantSource = {
  id: string;
  name: string;
  category: string;
  createdBy: string;
  modifiedBy: string;
  modifiedAt: string;
  active: boolean;
};

type SourceActivity = {
  id: string;
  action: string;
  date: string;
  user: string;
};

type ApplicantSourcesData = {
  categories: SourceCategory[];
  sources: ApplicantSource[];
  activities: SourceActivity[];
};

type SourceTab = 'categories' | 'sources';

const STORAGE_KEY = 'ats_applicant_sources_admin';
const PAGE_SIZE_OPTIONS = [10, 25, 50];
const INITIAL_DATE = '03 Jun 2024, 22:51';

const INITIAL_DATA: ApplicantSourcesData = {
  categories: [
    'Candidate Enrichment',
    'Vendor',
    'Resume Inbox',
    'Others',
    'Technical Forum',
    'Referrals',
    'Direct Sourcing',
    'CEIPAL TalentHire Career Portal',
  ].map((name, index) => ({
    id: `category-${index + 1}`,
    name,
    createdBy: index < 2 ? '—' : 'Sachin Wadeyar',
    modifiedBy: index < 2 ? '—' : 'Sachin Wadeyar',
    modifiedAt: index < 2 ? '—' : INITIAL_DATE,
    active: true,
  })),
  sources: [
    { name: 'Vendor', category: 'Vendor' },
    { name: 'Definitive Healthcare', category: 'Candidate Enrichment' },
    { name: 'ContactOut', category: 'Candidate Enrichment' },
    { name: 'ZoomInfo', category: 'Candidate Enrichment' },
    { name: 'Apollo', category: 'Candidate Enrichment' },
    { name: 'Internal Job Posting', category: 'Others' },
    { name: 'LinkedIn', category: 'Direct Sourcing' },
    { name: 'Naukri', category: 'Direct Sourcing' },
    { name: 'Indeed', category: 'Direct Sourcing' },
    { name: 'Direct Career Portal', category: 'CEIPAL TalentHire Career Portal' },
    { name: 'Referral', category: 'Referrals' },
    { name: 'Vendor Partner', category: 'Vendor' },
    { name: 'GitHub', category: 'Technical Forum' },
    { name: 'Resume Inbox', category: 'Resume Inbox' },
  ].map((source, index) => ({
    ...source,
    id: `source-${index + 1}`,
    createdBy: index >= 1 && index <= 5 ? 'N/A' : 'Sachin Wadeyar',
    modifiedBy: index >= 1 && index <= 5 ? '—' : 'Sachin Wadeyar',
    modifiedAt:
      index >= 1 && index <= 4
        ? '26 Sep 2026, 10:46'
        : index === 5
          ? '07 Jul 2026, 17:51'
          : index === 0
            ? '15 Oct 2026, 12:40'
            : INITIAL_DATE,
    active: index !== 5,
  })),
  activities: [],
};

const fieldClass =
  'w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-sm text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white';

function loadData(): ApplicantSourcesData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_DATA;
    const parsed: Partial<ApplicantSourcesData> = JSON.parse(stored);
    return {
      categories: Array.isArray(parsed.categories) ? parsed.categories : INITIAL_DATA.categories,
      sources: Array.isArray(parsed.sources) ? parsed.sources : INITIAL_DATA.sources,
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
    };
  } catch (error) {
    console.error('Unable to load applicant sources:', error);
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

export const ApplicantSources: React.FC = () => {
  const { currentUser } = useAppStore();
  const [data, setData] = useState<ApplicantSourcesData>(loadData);
  const [activeTab, setActiveTab] = useState<SourceTab>('categories');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<{ id?: string; name: string; category: string } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isCategories = activeTab === 'categories';
  const title = isCategories ? 'Applicant source categories' : 'Applicant sources';
  const entries = isCategories ? data.categories : data.sources;
  const filteredEntries = useMemo(
    () => entries.filter((entry) => {
      const source = entry as ApplicantSource;
      const searchable = isCategories
        ? entry.name
        : `${entry.name} ${source.category}`;
      return searchable.toLowerCase().includes(search.trim().toLowerCase());
    }),
    [entries, isCategories, search],
  );
  const pageCount = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
  const pageStart = filteredEntries.length ? (page - 1) * pageSize + 1 : 0;
  const pageEnd = Math.min(page * pageSize, filteredEntries.length);
  const visibleEntries = filteredEntries.slice((page - 1) * pageSize, page * pageSize);

  const commit = (next: ApplicantSourcesData, message: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setData(next);
      setNotice({ type: 'success', text: message });
    } catch (error) {
      console.error('Unable to save applicant source changes:', error);
      setNotice({ type: 'error', text: 'Could not save your changes. Please try again.' });
    }
    window.setTimeout(() => setNotice(null), 3500);
  };

  const saveEntry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing?.name.trim()) return;

    const timestamp = formatNow();
    const actor = currentUser?.name || 'Admin';
    const existing = isCategories
      ? data.categories.find((entry) => entry.id === editing.id)?.name
      : data.sources.find((entry) => entry.id === editing.id)?.name;
    const action = `${editing.id ? 'Updated' : 'Added'} ${isCategories ? 'category' : 'source'} “${editing.name.trim()}”`;
    const activity: SourceActivity = {
      id: `activity-${Date.now()}`,
      action,
      date: timestamp,
      user: actor,
    };

    if (isCategories) {
      const duplicate = data.categories.some(
        (entry) => entry.name.toLowerCase() === editing.name.trim().toLowerCase() && entry.id !== editing.id,
      );
      if (duplicate) {
        setNotice({ type: 'error', text: 'A category with this name already exists.' });
        return;
      }
      const categories = editing.id
        ? data.categories.map((entry) =>
            entry.id === editing.id
              ? { ...entry, name: editing.name.trim(), modifiedBy: actor, modifiedAt: timestamp }
              : entry,
          )
        : [
            ...data.categories,
            {
              id: `category-${Date.now()}`,
              name: editing.name.trim(),
              createdBy: actor,
              modifiedBy: actor,
              modifiedAt: timestamp,
              active: true,
            },
          ];
      const renamedCategory = editing.id && existing ? { from: existing, to: editing.name.trim() } : null;
      const sources = renamedCategory
        ? data.sources.map((entry) =>
            entry.category === renamedCategory.from
              ? { ...entry, category: renamedCategory.to, modifiedBy: actor, modifiedAt: timestamp }
              : entry,
          )
        : data.sources;
      commit({ ...data, categories, sources, activities: [activity, ...data.activities] }, 'Category saved.');
    } else {
      const duplicate = data.sources.some(
        (entry) => entry.name.toLowerCase() === editing.name.trim().toLowerCase() && entry.id !== editing.id,
      );
      if (duplicate) {
        setNotice({ type: 'error', text: 'A source with this name already exists.' });
        return;
      }
      if (!data.categories.some((category) => category.name === editing.category && category.active)) {
        setNotice({ type: 'error', text: 'Choose an active category for this source.' });
        return;
      }
      const sources = editing.id
        ? data.sources.map((entry) =>
            entry.id === editing.id
              ? {
                  ...entry,
                  name: editing.name.trim(),
                  category: editing.category,
                  modifiedBy: actor,
                  modifiedAt: timestamp,
                }
              : entry,
          )
        : [
            ...data.sources,
            {
              id: `source-${Date.now()}`,
              name: editing.name.trim(),
              category: editing.category,
              createdBy: actor,
              modifiedBy: actor,
              modifiedAt: timestamp,
              active: true,
            },
          ];
      commit({ ...data, sources, activities: [activity, ...data.activities] }, 'Source saved.');
    }
    setEditing(null);
  };

  const toggleActive = (id: string) => {
    const actor = currentUser?.name || 'Admin';
    const timestamp = formatNow();
    if (isCategories) {
      const category = data.categories.find((entry) => entry.id === id);
      if (!category) return;
      const active = !category.active;
      const categories = data.categories.map((entry) =>
        entry.id === id ? { ...entry, active, modifiedBy: actor, modifiedAt: timestamp } : entry,
      );
      const activity: SourceActivity = {
        id: `activity-${Date.now()}`,
        action: `${active ? 'Activated' : 'Archived'} category “${category.name}”`,
        date: timestamp,
        user: actor,
      };
      commit({ ...data, categories, activities: [activity, ...data.activities] }, `Category ${active ? 'activated' : 'inactivated'}.`);
    } else {
      const source = data.sources.find((entry) => entry.id === id);
      if (!source) return;
      const active = !source.active;
      const sources = data.sources.map((entry) =>
        entry.id === id ? { ...entry, active, modifiedBy: actor, modifiedAt: timestamp } : entry,
      );
      const activity: SourceActivity = {
        id: `activity-${Date.now()}`,
        action: `${active ? 'Activated' : 'Archived'} source “${source.name}”`,
        date: timestamp,
        user: actor,
      };
      commit({ ...data, sources, activities: [activity, ...data.activities] }, `Source ${active ? 'activated' : 'archived'}.`);
    }
  };

  const deleteEntry = () => {
    if (!pendingDelete) return;
    const actor = currentUser?.name || 'Admin';
    const timestamp = formatNow();
    const activity: SourceActivity = {
      id: `activity-${Date.now()}`,
      action: `Deleted ${isCategories ? 'category' : 'source'} “${pendingDelete.name}”`,
      date: timestamp,
      user: actor,
    };

    if (isCategories) {
      if (data.sources.some((source) => source.category === pendingDelete.name)) {
        setPendingDelete(null);
        setNotice({
          type: 'error',
          text: 'This category is still used by applicant sources. Change or remove those sources before deleting the category.',
        });
        return;
      }
      commit({
        ...data,
        categories: data.categories.filter((entry) => entry.id !== pendingDelete.id),
        activities: [activity, ...data.activities],
      }, 'Category deleted.');
    } else {
      commit({
        ...data,
        sources: data.sources.filter((entry) => entry.id !== pendingDelete.id),
        activities: [activity, ...data.activities],
      }, 'Source deleted. Existing applicant records are unchanged.');
    }
    setPendingDelete(null);
  };

  const changeTab = (tab: SourceTab) => {
    setActiveTab(tab);
    setSearch('');
    setPage(1);
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-[#D8E3F1] bg-white p-1 shadow-sm dark:border-[#334155] dark:bg-[#1E293B]">
          {([
            ['categories', 'Applicant Source Categories'],
            ['sources', 'Applicant Sources'],
          ] as const).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              aria-current={activeTab === tab ? 'page' : undefined}
              onClick={() => changeTab(tab)}
              className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
                activeTab === tab
                  ? 'bg-[#EFF6FF] text-[#1D4ED8] dark:bg-[#1E3A5F] dark:text-[#BFDBFE]'
                  : 'text-[#64748B] hover:bg-[#F8FAFC] dark:text-slate-300 dark:hover:bg-[#334155]'
              }`}
            >
              {label}
            </button>
          ))}
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
            onClick={() => setEditing({ name: '', category: data.categories.find((category) => category.active)?.name || '' })}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
          >
            <Plus className="h-4 w-4" />
            Add {isCategories ? 'category' : 'source'}
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#1E293B]">
        <div className="flex flex-col gap-4 border-b border-[#E8EEF6] p-5 dark:border-[#334155] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E3A5F] dark:text-[#93C5FD]">
              <Tag className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-base font-bold text-[#1E293B] dark:text-white">{title}</h1>
              <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                {isCategories
                  ? 'Organize where applicants come from. Archived categories stay in your history.'
                  : 'Manage individual applicant sources and assign each one to a category.'}
              </p>
            </div>
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
              placeholder={`Search ${isCategories ? 'categories' : 'sources'}...`}
              aria-label={`Search ${isCategories ? 'applicant source categories' : 'applicant sources'}`}
              className="min-w-0 flex-1 bg-transparent text-sm text-[#1E293B] outline-none placeholder:text-[#94A3B8] dark:text-white"
            />
            {search && (
              <button type="button" aria-label="Clear search" onClick={() => setSearch('')}>
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
          <span className="text-xs text-[#64748B] dark:text-slate-400">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'result' : 'results'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-y border-[#E8EEF6] bg-[#F8FAFC] text-[10px] font-semibold uppercase tracking-wide text-[#64748B] dark:border-[#334155] dark:bg-[#0F172A] dark:text-slate-300">
                <th scope="col" className="px-5 py-3">{isCategories ? 'Category' : 'Source'}</th>
                {!isCategories && <th scope="col" className="px-4 py-3">Category</th>}
                <th scope="col" className="px-4 py-3">Created by</th>
                <th scope="col" className="px-4 py-3">Last updated by</th>
                <th scope="col" className="px-4 py-3">Last updated</th>
                <th scope="col" className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EEF6] dark:divide-[#334155]">
              {visibleEntries.map((entry) => {
                const source = entry as ApplicantSource;
                return (
                  <tr key={entry.id} className="transition-colors hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A]/60">
                    <td className="px-5 py-3.5 font-semibold text-[#1E293B] dark:text-white">{entry.name}</td>
                    {!isCategories && (
                      <td className="px-4 py-3.5">
                        <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-medium text-[#1D4ED8] dark:bg-[#1E3A5F] dark:text-[#BFDBFE]">
                          {source.category}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3.5 text-[#475569] dark:text-slate-300">{entry.createdBy}</td>
                    <td className="px-4 py-3.5 text-[#475569] dark:text-slate-300">{entry.modifiedBy}</td>
                    <td className="px-4 py-3.5 text-[#64748B] dark:text-slate-400">{entry.modifiedAt}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          aria-label={`Edit ${isCategories ? 'category' : 'source'} ${entry.name}`}
                          onClick={() => setEditing({
                            id: entry.id,
                            name: entry.name,
                            category: isCategories ? '' : source.category,
                          })}
                          className="rounded-lg p-2 text-[#475569] transition-colors hover:bg-[#EFF6FF] hover:text-[#1D4ED8] dark:text-slate-300 dark:hover:bg-[#1E3A5F] dark:hover:text-[#BFDBFE]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${isCategories ? 'category' : 'source'} ${entry.name}`}
                          title="Delete"
                          onClick={() => setPendingDelete({ id: entry.id, name: entry.name })}
                          className="rounded-lg p-2 text-[#64748B] transition-colors hover:bg-[#FEF2F2] hover:text-[#B91C1C] dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={entry.active}
                          aria-label={`${entry.active ? 'Archive' : 'Activate'} ${isCategories ? 'category' : 'source'} ${entry.name}`}
                          title={entry.active ? 'Active — click to archive' : 'Archived — click to activate'}
                          onClick={() => toggleActive(entry.id)}
                          className={`relative ml-1 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
                            entry.active ? 'bg-[#2563EB]' : 'bg-[#CBD5E1] dark:bg-slate-600'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                            entry.active ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visibleEntries.length === 0 && (
                <tr>
                  <td colSpan={isCategories ? 5 : 6} className="px-5 py-12 text-center">
                    <Search className="mx-auto h-6 w-6 text-[#94A3B8]" />
                    <p className="mt-2 text-sm font-semibold text-[#334155] dark:text-slate-200">
                      {search ? 'No matching results' : `No ${isCategories ? 'categories' : 'sources'} yet`}
                    </p>
                    <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                      {search ? 'Try another search term.' : `Add your first ${isCategories ? 'category' : 'source'} to get started.`}
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
            of {filteredEntries.length}
          </label>
          <div className="flex items-center gap-2">
            <span className="mr-2 text-xs text-[#64748B] dark:text-slate-400">
              {pageStart}–{pageEnd} of {filteredEntries.length}
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
            aria-labelledby="source-editor-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#D8E3F1] bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]"
          >
            <div className="flex items-start justify-between border-b border-[#E8EEF6] p-5 dark:border-[#334155]">
              <div>
                <h2 id="source-editor-title" className="text-base font-bold text-[#1E293B] dark:text-white">
                  {editing.id ? 'Edit' : 'Add'} {isCategories ? 'category' : 'source'}
                </h2>
                <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                  {isCategories ? 'Keep category names clear and easy to recognize.' : 'Choose a category to keep sources organized.'}
                </p>
              </div>
              <button type="button" aria-label="Close dialog" onClick={() => setEditing(null)} className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={saveEntry} className="space-y-4 p-5">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-[#334155] dark:text-slate-200">
                  {isCategories ? 'Category name' : 'Source name'}
                </span>
                <input
                  autoFocus
                  required
                  maxLength={80}
                  value={editing.name}
                  onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                  placeholder={isCategories ? 'e.g. Employee referrals' : 'e.g. LinkedIn'}
                  className={fieldClass}
                />
              </label>
              {!isCategories && (
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-[#334155] dark:text-slate-200">Category</span>
                  <select
                    required
                    value={editing.category}
                    onChange={(event) => setEditing({ ...editing, category: event.target.value })}
                    className={fieldClass}
                  >
                    <option value="">Select a category</option>
                    {data.categories.filter((category) => category.active).map((category) => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </label>
              )}
              <div className="flex justify-end gap-2 border-t border-[#E8EEF6] pt-4 dark:border-[#334155]">
                <button type="button" onClick={() => setEditing(null)} className="h-10 rounded-xl border border-[#D8E3F1] px-4 text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] dark:border-[#334155] dark:text-slate-200 dark:hover:bg-[#334155]">
                  Cancel
                </button>
                <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-semibold text-white hover:bg-[#1D4ED8]">
                  <CheckCircle2 className="h-4 w-4" />
                  Save {isCategories ? 'category' : 'source'}
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
            aria-labelledby="delete-source-title"
            className="w-full max-w-md rounded-2xl border border-[#D8E3F1] bg-white p-5 shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2] text-[#B91C1C] dark:bg-red-950/40 dark:text-red-300">
                <Trash2 className="h-5 w-5" />
              </span>
              <div>
                <h2 id="delete-source-title" className="text-sm font-bold text-[#1E293B] dark:text-white">
                  Delete {isCategories ? 'category' : 'source'}?
                </h2>
                <p className="mt-1 text-sm text-[#475569] dark:text-slate-300">
                  “{pendingDelete.name}” will be removed from this settings list.
                  {!isCategories && ' Existing applicant records will not be changed.'}
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
                onClick={deleteEntry}
                className="h-10 rounded-xl bg-[#B91C1C] px-4 text-xs font-semibold text-white hover:bg-[#991B1B]"
              >
                Delete
              </button>
            </div>
          </section>
        </div>
      )}

      {activitiesOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/35" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setActivitiesOpen(false);
        }}>
          <aside aria-label="Applicant source activity history" className="flex h-full w-full max-w-md flex-col border-l border-[#D8E3F1] bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
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
                  <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">Changes to categories and sources will appear here.</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
