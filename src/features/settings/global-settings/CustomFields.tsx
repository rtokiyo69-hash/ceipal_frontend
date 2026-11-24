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
  CustomFieldItem,
  INITIAL_CUSTOM_FIELDS
} from '../../../services/globalSettingsMockData';
import { CustomFieldForm } from './CustomFieldForm';
import { useAppStore } from '../../../store/appStore';

export const CustomFields: React.FC = () => {
  const { currentUser } = useAppStore();
  const [fields, setFields] = useState<CustomFieldItem[]>(INITIAL_CUSTOM_FIELDS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingField, setEditingField] = useState<CustomFieldItem | null>(null);
  const [fieldToDelete, setFieldToDelete] = useState<CustomFieldItem | null>(null);
  const [activitiesOpen, setActivitiesOpen] = useState<boolean>(false);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filter list
  const filteredFields = fields
    .filter((f) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        f.moduleName.toLowerCase() === selectedCategory.toLowerCase();
      const query = search.trim().toLowerCase();
      const matchesSearch =
        f.fieldLabel.toLowerCase().includes(query) ||
        f.businessUnit.toLowerCase().includes(query) ||
        f.moduleName.toLowerCase().includes(query) ||
        f.createdBy.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (!sortDirection) return 0;
      const comp = a.fieldLabel.localeCompare(b.fieldLabel);
      return sortDirection === 'asc' ? comp : -comp;
    });

  // Pagination
  const totalEntries = filteredFields.length;
  const pageCount = Math.max(1, Math.ceil(totalEntries / pageSize));
  const activePage = Math.min(currentPage, pageCount);
  const startIndex = (activePage - 1) * pageSize;
  const displayedFields = filteredFields.slice(startIndex, startIndex + pageSize);
  const firstRecord = totalEntries === 0 ? 0 : startIndex + 1;
  const lastRecord = Math.min(startIndex + pageSize, totalEntries);

  const handleToggleActive = (id: string) => {
    setFields((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  const confirmDelete = () => {
    if (!fieldToDelete) return;
    setFields((prev) => prev.filter((item) => item.id !== fieldToDelete.id));
    setFieldToDelete(null);
  };

  const handleSaveField = (saved: CustomFieldItem) => {
    setFields((prev) => {
      const exists = prev.some((item) => item.id === saved.id);
      if (exists) {
        return prev.map((item) => (item.id === saved.id ? saved : item));
      }
      return [saved, ...prev];
    });
    setIsFormOpen(false);
    setEditingField(null);
  };

  if (isFormOpen) {
    return (
      <CustomFieldForm
        initialData={editingField}
        onSave={handleSaveField}
        onBack={() => {
          setIsFormOpen(false);
          setEditingField(null);
        }}
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#1E293B]">
      {/* Top Action & Search Bar */}
      <div className="flex flex-col gap-3 border-b border-[#D8E3F1] bg-white p-4 dark:border-[#334155] dark:bg-[#1E293B] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-2xl">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#BFDBFE]">
              Categories
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 rounded-xl border border-[#D8E3F1] bg-white px-3 text-xs font-medium text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
            >
              <option value="All">All Categories</option>
              <option value="Placements">Placements</option>
              <option value="Clients">Clients</option>
              <option value="Employee Job Postings">Employee Job Postings</option>
              <option value="Job Posting">Job Posting</option>
              <option value="Applicant">Applicant</option>
            </select>
          </div>

          {/* Search Box */}
          <label className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-[#D8E3F1] bg-[#FFFFFF]/60 px-3 text-[#64748B] transition-colors focus-within:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#BFDBFE]">
            <Search className="h-4 w-4 shrink-0" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search custom fields..."
              aria-label="Search custom fields"
              className="min-w-0 flex-1 bg-transparent text-xs text-[#1E293B] outline-none placeholder:text-[#64748B] dark:text-white dark:placeholder:text-[#64748B]"
            />
          </label>
        </div>

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
            onClick={() => {
              setEditingField(null);
              setIsFormOpen(true);
            }}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Custom Field</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="h-[calc(100vh-320px)] min-h-[300px] overflow-auto">
        <table className="w-full min-w-[960px] border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-[#FFFFFF] dark:bg-[#334155]">
            <tr className="border-b border-[#D8E3F1] text-[10px] uppercase tracking-[0.12em] text-[#64748B] dark:border-[#334155] dark:text-[#BFDBFE]">
              <th scope="col" className="px-4 py-3.5">
                <button
                  type="button"
                  onClick={() =>
                    setSortDirection((prev) =>
                      prev === null || prev === 'desc' ? 'asc' : 'desc'
                    )
                  }
                  className="inline-flex items-center gap-1.5 font-semibold hover:text-[#125B97] dark:hover:text-white"
                >
                  <span>Field Label</span>
                  <span>{sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '↕'}</span>
                </button>
              </th>
              <th scope="col" className="px-4 py-3.5 font-semibold">Business Unit</th>
              <th scope="col" className="px-4 py-3.5 font-semibold">Sync With</th>
              <th scope="col" className="px-4 py-3.5 font-semibold">Module Name</th>
              <th scope="col" className="px-4 py-3.5 font-semibold">Independent</th>
              <th scope="col" className="px-4 py-3.5 font-semibold">Custom Field Type</th>
              <th scope="col" className="px-4 py-3.5 font-semibold">Created By</th>
              <th scope="col" className="px-4 py-3.5 font-semibold">Last Modified</th>
              <th scope="col" className="px-4 py-3.5 text-center font-semibold">Status</th>
              <th scope="col" className="w-28 px-4 py-3.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
            {displayedFields.map((f) => (
              <tr
                key={f.id}
                className="transition-colors hover:bg-[#F8FAFC] dark:hover:bg-[#334155]"
              >
                <td className="px-4 py-3.5 font-semibold text-[#1E293B] dark:text-white">
                  {f.fieldLabel}
                </td>
                <td className="px-4 py-3.5 text-[#475569] dark:text-[#BFDBFE]">{f.businessUnit}</td>
                <td className="px-4 py-3.5 text-[#64748B] dark:text-[#BFDBFE]">{f.syncWith}</td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#DCE8FF] text-[#125B97] dark:bg-[#475569] dark:text-white">
                    {f.moduleName}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-[#475569] dark:text-[#BFDBFE]">
                  {f.isIndependentField ? 'Yes' : 'No'}
                </td>
                <td className="px-4 py-3.5 text-[#475569] dark:text-[#BFDBFE]">{f.customFieldType}</td>
                <td className="px-4 py-3.5 text-[#475569] dark:text-[#BFDBFE]">{f.createdBy}</td>
                <td className="px-4 py-3.5 tabular-nums text-[#64748B] dark:text-[#64748B]">
                  {f.lastModified}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(f.id)}
                    aria-label={`Toggle active state for ${f.fieldLabel}`}
                    className={`inline-flex w-9 h-5 items-center rounded-full p-0.5 transition-colors ${
                      f.isActive ? 'bg-[#2563EB]' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                        f.isActive ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingField(f);
                        setIsFormOpen(true);
                      }}
                      aria-label={`Edit ${f.fieldLabel}`}
                      title={`Edit ${f.fieldLabel}`}
                      className="rounded-lg p-2 text-[#475569] transition-colors hover:bg-[#FFFFFF] hover:text-[#125B97] dark:text-[#BFDBFE] dark:hover:bg-[#475569] dark:hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFieldToDelete(f)}
                      aria-label={`Delete ${f.fieldLabel}`}
                      title={`Delete ${f.fieldLabel}`}
                      className="rounded-lg p-2 text-[#64748B] transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-[#BFDBFE] dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {displayedFields.length === 0 && (
              <tr>
                <td colSpan={10} className="px-5 py-16 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFFFFF] text-[#64748B] dark:bg-[#475569] dark:text-[#BFDBFE]">
                    <Search className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#1E293B] dark:text-white">
                    No custom fields found
                  </p>
                  <p className="mt-1 text-xs text-[#64748B]">
                    Try another search term or create a new custom field.
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
          <label htmlFor="custom-fields-page-size" className="mr-1">
            Rows
          </label>
          <select
            id="custom-fields-page-size"
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

      {/* Delete Confirmation Modal */}
      {fieldToDelete && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0F172A]/55 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setFieldToDelete(null);
          }}
        >
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-[#D8E3F1] bg-white p-5 shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
            <div>
              <h2 className="text-base font-bold text-[#1E293B] dark:text-white">
                Delete custom field?
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#BFDBFE]">
                <strong className="text-[#1E293B] dark:text-white">
                  {fieldToDelete.fieldLabel}
                </strong>{' '}
                will be permanently deleted from the system.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFieldToDelete(null)}
                className="rounded-xl border border-[#D8E3F1] px-4 py-2.5 text-xs font-semibold text-[#475569] hover:bg-[#FFFFFF] dark:border-[#334155] dark:text-[#BFDBFE] dark:hover:bg-[#475569]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
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
            aria-labelledby="custom-fields-activities-title"
            className="flex max-h-[min(80vh,680px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#D8E3F1] bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]"
          >
            <div className="flex items-center justify-between border-b border-[#D8E3F1] p-5 dark:border-[#334155]">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1E40AF] dark:text-[#60A5FA]">
                  Audit trail
                </p>
                <h2
                  id="custom-fields-activities-title"
                  className="mt-1 text-lg font-bold text-[#1E293B] dark:text-white"
                >
                  Recent Activities
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
                    <span className="font-semibold">Sachin Wadeyar</span> updated custom field{' '}
                    <span className="font-semibold">Contract Signed</span>
                  </p>
                  <p className="mt-1 text-[10px] text-[#64748B]">2024-11-08 19:35:05</p>
                </div>
              </div>

              <div className="flex gap-3 rounded-xl border border-[#D8E3F1] bg-[#F8FAFC] p-3.5 dark:border-[#334155] dark:bg-[#0F172A]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFFFFF] text-[#125B97] dark:bg-[#475569] dark:text-[#60A5FA]">
                  <Clock3 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#1E293B] dark:text-white">
                    <span className="font-semibold">Sachin Wadeyar</span> created custom field{' '}
                    <span className="font-semibold">Asset Provided by</span>
                  </p>
                  <p className="mt-1 text-[10px] text-[#64748B]">2024-07-09 19:41:25</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
};
