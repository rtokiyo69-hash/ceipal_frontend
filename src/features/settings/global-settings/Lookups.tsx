import React, { useState } from 'react';
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
import {
  LookupItem,
  INITIAL_LOOKUPS
} from '../../../services/globalSettingsMockData';
import { useAppStore } from '../../../store/appStore';

const LOOKUP_TABS = [
  'Background Feedback',
  'Languages',
  'Pay Frequency Types',
  'Payment Terms',
  'Tax Terms',
  'Work Authorizations',
  'Note Actions'
];

export const Lookups: React.FC = () => {
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<string>('Background Feedback');
  const [lookupData, setLookupData] = useState<Record<string, LookupItem[]>>(INITIAL_LOOKUPS);
  const [search, setSearch] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editingItem, setEditingItem] = useState<LookupItem | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<LookupItem | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [activitiesOpen, setActivitiesOpen] = useState<boolean>(false);

  const currentList = lookupData[activeTab] || [];

  const filteredList = currentList
    .filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.createdBy.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortDirection) return 0;
      const comp = a.name.localeCompare(b.name);
      return sortDirection === 'asc' ? comp : -comp;
    });

  const totalEntries = filteredList.length;
  const pageCount = Math.max(1, Math.ceil(totalEntries / pageSize));
  const activePage = Math.min(currentPage, pageCount);
  const startIndex = (activePage - 1) * pageSize;
  const displayedItems = filteredList.slice(startIndex, startIndex + pageSize);
  const firstRecord = totalEntries === 0 ? 0 : startIndex + 1;
  const lastRecord = Math.min(startIndex + pageSize, totalEntries);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setInputValue('');
    setValidationError('');
    setModal('add');
  };

  const handleOpenEdit = (item: LookupItem) => {
    setEditingItem(item);
    setInputValue(item.name);
    setValidationError('');
    setModal('edit');
  };

  const deleteRecord = () => {
    if (!recordToDelete) return;
    setLookupData({
      ...lookupData,
      [activeTab]: currentList.filter((i) => i.id !== recordToDelete.id)
    });
    setRecordToDelete(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const nextVal = inputValue.trim();
    if (!nextVal) {
      setValidationError(`Enter a ${activeTab} value.`);
      return;
    }

    const duplicate = currentList.some(
      (item) =>
        item.id !== editingItem?.id && item.name.toLowerCase() === nextVal.toLowerCase()
    );
    if (duplicate) {
      setValidationError(`This value already exists in ${activeTab}.`);
      return;
    }

    const userName = currentUser?.name || 'Admin';
    const timestamp = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString();

    if (editingItem) {
      const updated = currentList.map((i) =>
        i.id === editingItem.id
          ? {
              ...i,
              name: nextVal,
              modifiedBy: userName,
              lastModified: timestamp
            }
          : i
      );
      setLookupData({ ...lookupData, [activeTab]: updated });
    } else {
      const newItem: LookupItem = {
        id: `lk-${Date.now()}`,
        name: nextVal,
        createdBy: userName,
        modifiedBy: userName,
        lastModified: timestamp
      };
      setLookupData({ ...lookupData, [activeTab]: [newItem, ...currentList] });
      setCurrentPage(1);
    }

    setModal(null);
    setEditingItem(null);
    setInputValue('');
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#1E293B]">
      {/* Category Tabs - Matching Applicants Lookup Categories Navigation */}
      <nav
        aria-label="Global Lookups categories"
        className="flex overflow-x-auto border-b border-[#D8E3F1] bg-white px-2 dark:border-[#334155] dark:bg-[#1E293B]"
      >
        {LOOKUP_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            aria-current={activeTab === tab ? 'page' : undefined}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
              setSearch('');
            }}
            className={`shrink-0 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'border-[#125B97] text-[#125B97] dark:border-[#60A5FA] dark:text-[#93C5FD]'
                : 'border-transparent text-[#475569] hover:text-[#1E293B] dark:text-[#BFDBFE] dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Action Bar */}
      <div className="flex flex-col gap-3 border-b border-[#D8E3F1] bg-white p-4 dark:border-[#334155] dark:bg-[#1E293B] sm:flex-row sm:items-center sm:justify-between">
        <label className="flex h-10 w-full max-w-sm items-center gap-2 rounded-xl border border-[#D8E3F1] bg-[#FFFFFF]/60 px-3 text-[#64748B] transition-colors focus-within:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#BFDBFE]">
          <Search className="h-4 w-4 shrink-0" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={`Search ${activeTab.toLowerCase()}...`}
            aria-label={`Search ${activeTab.toLowerCase()}`}
            className="min-w-0 flex-1 bg-transparent text-xs text-[#1E293B] outline-none placeholder:text-[#64748B] dark:text-white"
          />
        </label>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setActivitiesOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D8E3F1] bg-white px-3 text-xs font-semibold text-[#334155] transition-colors hover:bg-[#FFFFFF] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white dark:hover:bg-[#475569]"
          >
            <Activity className="h-4 w-4 text-[#125B97] dark:text-[#60A5FA]" />
            <span>Activities</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
          >
            <Plus className="h-4 w-4" />
            <span>Add {activeTab}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="h-[calc(100vh-320px)] min-h-[260px] overflow-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-[#FFFFFF] dark:bg-[#334155]">
            <tr className="border-b border-[#D8E3F1] text-[10px] uppercase tracking-[0.12em] text-[#64748B] dark:border-[#334155] dark:text-[#BFDBFE]">
              <th scope="col" className="px-5 py-3.5">
                <button
                  type="button"
                  onClick={() =>
                    setSortDirection((direction) =>
                      direction === null || direction === 'desc' ? 'asc' : 'desc'
                    )
                  }
                  className="inline-flex items-center gap-1.5 font-semibold hover:text-[#125B97] dark:hover:text-white"
                >
                  <span>{activeTab}</span>
                  <span>{sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '↕'}</span>
                </button>
              </th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Created by</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Modified by</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Last modified</th>
              <th scope="col" className="w-28 px-5 py-3.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
            {displayedItems.map((record) => (
              <tr
                key={record.id}
                className="transition-colors hover:bg-[#F8FAFC] dark:hover:bg-[#334155]"
              >
                <td className="px-5 py-3.5 font-semibold text-[#1E293B] dark:text-white">
                  {record.name}
                </td>
                <td className="px-5 py-3.5 text-[#475569] dark:text-[#BFDBFE]">
                  {record.createdBy}
                </td>
                <td className="px-5 py-3.5 text-[#475569] dark:text-[#BFDBFE]">
                  {record.modifiedBy}
                </td>
                <td className="px-5 py-3.5 tabular-nums text-[#64748B] dark:text-[#64748B]">
                  {record.lastModified}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(record)}
                      aria-label={`Edit ${record.name}`}
                      title={`Edit ${record.name}`}
                      className="rounded-lg p-2 text-[#475569] transition-colors hover:bg-[#FFFFFF] hover:text-[#125B97] dark:text-[#BFDBFE] dark:hover:bg-[#475569] dark:hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecordToDelete(record)}
                      aria-label={`Delete ${record.name}`}
                      title={`Delete ${record.name}`}
                      className="rounded-lg p-2 text-[#64748B] transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-[#BFDBFE] dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {displayedItems.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFFFFF] text-[#64748B] dark:bg-[#475569] dark:text-[#BFDBFE]">
                    <Search className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#1E293B] dark:text-white">
                    No records found
                  </p>
                  <p className="mt-1 text-xs text-[#64748B]">
                    Try another search term or click Add {activeTab}.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col gap-3 border-t border-[#D8E3F1] px-4 py-3 text-[11px] text-[#64748B] dark:border-[#334155] dark:text-[#BFDBFE] sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing{' '}
          <strong className="font-semibold text-[#1E293B] dark:text-white">
            {firstRecord}–{lastRecord}
          </strong>{' '}
          of{' '}
          <strong className="font-semibold text-[#1E293B] dark:text-white">
            {totalEntries}
          </strong>{' '}
          entries
        </span>
        <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-auto">
          <label htmlFor="lookups-page-size" className="mr-1">
            Rows
          </label>
          <select
            id="lookups-page-size"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="mr-2 rounded-lg border border-[#D8E3F1] bg-white px-2 py-1.5 text-xs text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
          >
            {[10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-label="First page"
            disabled={activePage === 1}
            onClick={() => setCurrentPage(1)}
            className="rounded-lg border border-[#D8E3F1] p-1.5 transition-colors hover:bg-[#FFFFFF] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#334155] dark:hover:bg-[#475569]"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Previous page"
            disabled={activePage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="rounded-lg border border-[#D8E3F1] p-1.5 transition-colors hover:bg-[#FFFFFF] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#334155] dark:hover:bg-[#475569]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-16 px-2 text-center font-medium text-[#1E293B] dark:text-white">
            {activePage} / {pageCount}
          </span>
          <button
            type="button"
            aria-label="Next page"
            disabled={activePage === pageCount}
            onClick={() => setCurrentPage((prev) => Math.min(pageCount, prev + 1))}
            className="rounded-lg border border-[#D8E3F1] p-1.5 transition-colors hover:bg-[#FFFFFF] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#334155] dark:hover:bg-[#475569]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Last page"
            disabled={activePage === pageCount}
            onClick={() => setCurrentPage(pageCount)}
            className="rounded-lg border border-[#D8E3F1] p-1.5 transition-colors hover:bg-[#FFFFFF] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#334155] dark:hover:bg-[#475569]"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      {modal && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0F172A]/55 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <form
            onSubmit={handleSave}
            className="w-full max-w-md space-y-5 rounded-2xl border border-[#D8E3F1] bg-white p-5 shadow-2xl dark:border-[#334155] dark:bg-[#1E293B] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1E40AF] dark:text-[#60A5FA]">
                  {activeTab}
                </p>
                <h2 className="mt-1 text-lg font-bold text-[#1E293B] dark:text-white">
                  {modal === 'add' ? `Add ${activeTab}` : `Edit ${activeTab}`}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close dialog"
                onClick={() => setModal(null)}
                className="rounded-lg p-2 text-[#64748B] hover:bg-[#FFFFFF] dark:text-[#BFDBFE] dark:hover:bg-[#475569]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <label className="block space-y-1.5 text-xs font-semibold text-[#334155] dark:text-[#BFDBFE]">
              <span>Name</span>
              <input
                autoFocus
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setValidationError('');
                }}
                placeholder={`Enter ${activeTab} value`}
                className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-sm font-normal text-[#1E293B] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
              />
            </label>
            {validationError && (
              <p role="alert" className="text-xs text-rose-600 dark:text-rose-300">
                {validationError}
              </p>
            )}
            <div className="flex justify-end gap-2 border-t border-[#D8E3F1] pt-4 dark:border-[#334155]">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-xl border border-[#D8E3F1] px-4 py-2.5 text-xs font-semibold text-[#475569] transition-colors hover:bg-[#FFFFFF] dark:border-[#334155] dark:text-[#BFDBFE] dark:hover:bg-[#475569]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
              >
                {modal === 'add' ? `Add ${activeTab}` : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0F172A]/55 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setRecordToDelete(null);
          }}
        >
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-[#D8E3F1] bg-white p-5 shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
            <div>
              <h2 className="text-base font-bold text-[#1E293B] dark:text-white">
                Delete {activeTab}?
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#BFDBFE]">
                <strong className="text-[#1E293B] dark:text-white">{recordToDelete.name}</strong> will be removed from this lookup list.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="rounded-xl border border-[#D8E3F1] px-4 py-2.5 text-xs font-semibold text-[#475569] hover:bg-[#FFFFFF] dark:border-[#334155] dark:text-[#BFDBFE] dark:hover:bg-[#475569]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteRecord}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activities Modal */}
      {activitiesOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0F172A]/55 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setActivitiesOpen(false);
          }}
        >
          <section
            aria-labelledby="lookups-activities-title"
            className="flex max-h-[min(80vh,680px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#D8E3F1] bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]"
          >
            <div className="flex items-center justify-between border-b border-[#D8E3F1] p-5 dark:border-[#334155]">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1E40AF] dark:text-[#60A5FA]">
                  Audit trail
                </p>
                <h2
                  id="lookups-activities-title"
                  className="mt-1 text-lg font-bold text-[#1E293B] dark:text-white"
                >
                  {activeTab} Activities
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close activities"
                onClick={() => setActivitiesOpen(false)}
                className="rounded-lg p-2 text-[#64748B] hover:bg-[#FFFFFF] dark:text-[#BFDBFE] dark:hover:bg-[#475569]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              <div className="flex gap-3 rounded-xl border border-[#D8E3F1] bg-[#F8FAFC] p-3.5 dark:border-[#334155] dark:bg-[#0F172A]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFFFFF] text-[#125B97] dark:bg-[#475569] dark:text-[#60A5FA]">
                  <Clock3 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#1E293B] dark:text-white">
                    <span className="font-semibold">Sachin Wadeyar</span> initialized entries for{' '}
                    <span className="font-semibold">{activeTab}</span>
                  </p>
                  <p className="mt-1 text-[10px] text-[#64748B]">03/06/2024 22:51:26</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
};
