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
import { useAppStore } from '../../store/appStore';

interface ApplicantFunction {
  id: string;
  name: string;
  specialization?: string;
  createdBy: string;
  modifiedBy: string;
  lastModified: string;
}

interface LookupActivity {
  id: string;
  action: string;
  name: string;
  user: string;
  timestamp: string;
}

type LookupModal = 'add' | 'edit' | null;
type SortDirection = 'asc' | 'desc' | null;

interface ApplicantLookupTableProps {
  singularLabel: string;
  pluralLabel: string;
  nameColumnLabel?: string;
  specializationColumn?: boolean;
  lastModifiedColumnLabel?: string;
  recordsStorageKey: string;
  activitiesStorageKey: string;
  initialRecords: ApplicantFunction[];
}

const initialFunctions: ApplicantFunction[] = [
  { id: 'function-1', name: 'Add System Group', createdBy: 'MIS', modifiedBy: 'MIS', lastModified: '02/11/2026 20:47:45' },
  { id: 'function-2', name: 'Product Management', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' },
  { id: 'function-3', name: 'Finance', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' },
  { id: 'function-4', name: 'Human Resources', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' },
  { id: 'function-5', name: 'Marketing', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' },
  { id: 'function-6', name: 'Media and Communication', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' },
  { id: 'function-7', name: 'Sales', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' },
  { id: 'function-8', name: 'Arts and Design', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' },
  { id: 'function-9', name: 'Engineering', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' },
  { id: 'function-10', name: 'Information Technology', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' },
  { id: 'function-11', name: 'Operations', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' },
  { id: 'function-12', name: 'Customer Support', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' },
  { id: 'function-13', name: 'Legal', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' },
  { id: 'function-14', name: 'Research and Development', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' },
  { id: 'function-15', name: 'Quality Assurance', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' },
  { id: 'function-16', name: 'Supply Chain', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' }
];
const initialTechnologies: ApplicantFunction[] = [];
const initialClearanceTypes: ApplicantFunction[] = [];
const initialLanguageProficiencies: ApplicantFunction[] = [
  { id: 'language-proficiency-1', name: 'Speak', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' },
  { id: 'language-proficiency-2', name: 'Write', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' },
  { id: 'language-proficiency-3', name: 'Read', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' }
];
const initialDegrees: ApplicantFunction[] = [
  { id: 'degree-1', name: 'Master of Science in Education (M.Ed.)', specialization: 'N/A', createdBy: 'Gourav Ashok Mishra', modifiedBy: 'Gourav Ashok Mishra', lastModified: '22/04/2025 17:25:51' },
  { id: 'degree-2', name: 'PHD', specialization: 'N/A', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' },
  { id: 'degree-3', name: 'Masters Degree', specialization: 'N/A', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' },
  { id: 'degree-4', name: 'Bachelors Degree', specialization: 'N/A', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' },
  { id: 'degree-5', name: 'Undergraduate', specialization: 'N/A', createdBy: 'Sachin Wadeyar', modifiedBy: 'Sachin Wadeyar', lastModified: '03/06/2024 22:51:26' }
];

const formatTimestamp = () => new Date().toLocaleString();

const ApplicantLookupTable: React.FC<ApplicantLookupTableProps> = ({
  singularLabel,
  pluralLabel,
  nameColumnLabel = 'Name',
  specializationColumn = false,
  lastModifiedColumnLabel = 'Last modified',
  recordsStorageKey,
  activitiesStorageKey,
  initialRecords
}) => {
  const { currentUser } = useAppStore();
  const activitiesTitleId = `${recordsStorageKey}-activities-title`;
  const [records, setRecords] = useState<ApplicantFunction[]>(() => {
    const storedRecords = localStorage.getItem(recordsStorageKey);
    return storedRecords ? JSON.parse(storedRecords) as ApplicantFunction[] : initialRecords;
  });
  const [search, setSearch] = useState('');
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal, setModal] = useState<LookupModal>(null);
  const [recordToDelete, setRecordToDelete] = useState<ApplicantFunction | null>(null);
  const [editingRecord, setEditingRecord] = useState<ApplicantFunction | null>(null);
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [validationError, setValidationError] = useState('');
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [activities, setActivities] = useState<LookupActivity[]>(() => {
    const storedActivities = localStorage.getItem(activitiesStorageKey);
    return storedActivities ? JSON.parse(storedActivities) as LookupActivity[] : [];
  });

  useEffect(() => {
    localStorage.setItem(recordsStorageKey, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(activitiesStorageKey, JSON.stringify(activities));
  }, [activities]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return records
        .filter((record) =>
          record.name.toLocaleLowerCase().includes(query) ||
          (record.specialization || '').toLocaleLowerCase().includes(query)
        )
      .sort((a, b) => {
        if (!sortDirection) return 0;
        const comparison = a.name.localeCompare(b.name);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [records, search, sortDirection]);

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
        timestamp: formatTimestamp()
      },
      ...previous
    ]);
  };

  const openAddModal = () => {
    setEditingRecord(null);
    setName('');
    setSpecialization('');
    setValidationError('');
    setModal('add');
  };

  const openEditModal = (record: ApplicantFunction) => {
    setEditingRecord(record);
    setName(record.name);
    setSpecialization(record.specialization || 'N/A');
    setValidationError('');
    setModal('edit');
  };

  const saveRecord = (event: React.FormEvent) => {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) {
      setValidationError(`Enter a ${singularLabel} name.`);
      return;
    }

    const duplicate = records.some(
      (record) => record.id !== editingRecord?.id && record.name.toLocaleLowerCase() === nextName.toLocaleLowerCase()
    );
    if (duplicate) {
      setValidationError(`This ${singularLabel} already exists.`);
      return;
    }

    const user = currentUser?.name || 'Admin';
    const timestamp = formatTimestamp();
    const degreeFields = specializationColumn
      ? { specialization: specialization.trim() || 'N/A' }
      : {};
    if (editingRecord) {
      setRecords((previous) =>
        previous.map((record) =>
          record.id === editingRecord.id
            ? { ...record, name: nextName, ...degreeFields, modifiedBy: user, lastModified: timestamp }
            : record
        )
      );
      addActivity('Updated', nextName);
    } else {
      setRecords((previous) => [
        {
          id: `${singularLabel}-${Date.now()}`,
          name: nextName,
          ...degreeFields,
          createdBy: user,
          modifiedBy: user,
          lastModified: timestamp
        },
        ...previous
      ]);
      addActivity('Added', nextName);
      setPage(1);
    }
    setModal(null);
  };

  const deleteRecord = () => {
    if (!recordToDelete) return;
    setRecords((previous) => previous.filter((record) => record.id !== recordToDelete.id));
    addActivity('Deleted', recordToDelete.name);
    setRecordToDelete(null);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#1E293B]">
      <div className="flex flex-col gap-3 border-b border-[#D8E3F1] bg-white p-4 dark:border-[#334155] dark:bg-[#1E293B] sm:flex-row sm:items-center sm:justify-between">
        <label className="flex h-10 w-full max-w-[200px] items-center gap-2 rounded-xl border border-[#D8E3F1] bg-[#FFFFFF]/60 px-3 text-[#64748B] transition-colors focus-within:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#BFDBFE]">
          <Search className="h-4 w-4 shrink-0" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={`Search ${pluralLabel.toLocaleLowerCase()}`}
            aria-label={`Search ${pluralLabel.toLocaleLowerCase()}`}
            className="min-w-0 flex-1 bg-transparent text-xs text-[#1E293B] outline-none placeholder:text-[#64748B] dark:text-white dark:placeholder:text-[#64748B]"
          />
        </label>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setActivitiesOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D8E3F1] bg-white px-3 text-xs font-semibold text-[#334155] transition-colors hover:bg-[#FFFFFF] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white dark:hover:bg-[#475569]"
          >
            <Activity className="h-4 w-4 text-[#125B97] dark:text-[#60A5FA]" />
            Activities
            {activities.length > 0 && (
              <span className="rounded-full bg-[#FFFFFF] px-1.5 py-0.5 text-[10px] text-[#125B97] dark:bg-[#475569] dark:text-[#BFDBFE]">
                {activities.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      <div className="h-[calc(100vh-280px)] min-h-[260px] overflow-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-[#FFFFFF] dark:bg-[#334155]">
            <tr className="border-b border-[#D8E3F1] text-[10px] uppercase tracking-[0.12em] text-[#64748B] dark:border-[#334155] dark:text-[#BFDBFE]">
              <th scope="col" className="px-5 py-3.5">
                <button
                  type="button"
                  onClick={() => setSortDirection((direction) => direction === null || direction === 'desc' ? 'asc' : 'desc')}
                  className="inline-flex items-center gap-1.5 font-semibold hover:text-[#125B97] dark:hover:text-white"
                >
                  {nameColumnLabel}
                  <span aria-hidden="true">{sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '↕'}</span>
                </button>
              </th>
              {specializationColumn && <th scope="col" className="px-5 py-3.5 font-semibold">Specialization</th>}
              <th scope="col" className="px-5 py-3.5 font-semibold">Created by</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Modified by</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">{lastModifiedColumnLabel}</th>
              <th scope="col" className="w-28 px-5 py-3.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
            {visibleRecords.map((record) => (
              <tr key={record.id} className="transition-colors hover:bg-[#F8FAFC] dark:hover:bg-[#334155]">
                <td className="px-5 py-3.5 font-semibold text-[#1E293B] dark:text-white">{record.name}</td>
                {specializationColumn && <td className="px-5 py-3.5 text-[#475569] dark:text-[#BFDBFE]">{record.specialization || 'N/A'}</td>}
                <td className="px-5 py-3.5 text-[#475569] dark:text-[#BFDBFE]">{record.createdBy}</td>
                <td className="px-5 py-3.5 text-[#475569] dark:text-[#BFDBFE]">{record.modifiedBy}</td>
                <td className="px-5 py-3.5 tabular-nums text-[#64748B] dark:text-[#64748B]">{record.lastModified}</td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(record)}
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
            {visibleRecords.length === 0 && (
              <tr>
                <td colSpan={specializationColumn ? 6 : 5} className="px-5 py-3 text-left text-xs text-[#64748B] dark:text-[#BFDBFE]">
                  No Records Found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#D8E3F1] px-4 py-3 text-[11px] text-[#64748B] dark:border-[#334155] dark:text-[#BFDBFE] sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing <strong className="font-semibold text-[#1E293B] dark:text-white">{firstRecord}–{lastRecord}</strong> of{' '}
          <strong className="font-semibold text-[#1E293B] dark:text-white">{filteredRecords.length}</strong> entries
        </span>
        <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-auto">
          <label htmlFor={`${recordsStorageKey}-page-size`} className="mr-1">Rows</label>
          <select
            id={`${recordsStorageKey}-page-size`}
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            className="mr-2 rounded-lg border border-[#D8E3F1] bg-white px-2 py-1.5 text-xs text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
          >
            {[10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
          <button type="button" aria-label="First page" disabled={currentPage === 1} onClick={() => setPage(1)} className="rounded-lg border border-[#D8E3F1] p-1.5 transition-colors hover:bg-[#FFFFFF] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#334155] dark:hover:bg-[#475569]">
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-[#D8E3F1] p-1.5 transition-colors hover:bg-[#FFFFFF] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#334155] dark:hover:bg-[#475569]">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-16 px-2 text-center font-medium text-[#1E293B] dark:text-white">{currentPage} / {pageCount}</span>
          <button type="button" aria-label="Next page" disabled={currentPage === pageCount} onClick={() => setPage((previous) => Math.min(pageCount, previous + 1))} className="rounded-lg border border-[#D8E3F1] p-1.5 transition-colors hover:bg-[#FFFFFF] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#334155] dark:hover:bg-[#475569]">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Last page" disabled={currentPage === pageCount} onClick={() => setPage(pageCount)} className="rounded-lg border border-[#D8E3F1] p-1.5 transition-colors hover:bg-[#FFFFFF] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#334155] dark:hover:bg-[#475569]">
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {(modal || recordToDelete || activitiesOpen) && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0F172A]/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModal(null);
              setRecordToDelete(null);
              setActivitiesOpen(false);
            }
          }}
        >
          {modal && (
            <form onSubmit={saveRecord} className="w-full max-w-md space-y-5 rounded-2xl border border-[#D8E3F1] bg-white p-5 shadow-2xl dark:border-[#334155] dark:bg-[#1E293B] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1E40AF] dark:text-[#60A5FA]">{pluralLabel}</p>
                  <h2 className="mt-1 text-lg font-bold text-[#1E293B] dark:text-white">{modal === 'add' ? `Add ${singularLabel}` : `Edit ${singularLabel}`}</h2>
                </div>
                <button type="button" aria-label="Close dialog" onClick={() => setModal(null)} className="rounded-lg p-2 text-[#64748B] hover:bg-[#FFFFFF] dark:text-[#BFDBFE] dark:hover:bg-[#475569]">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <label className="block space-y-1.5 text-xs font-semibold text-[#334155] dark:text-[#BFDBFE]">
                Name
                <input
                  autoFocus
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setValidationError('');
                  }}
                  placeholder={`Enter a ${singularLabel} name`}
                  className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-sm font-normal text-[#1E293B] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
                />
              </label>
              {specializationColumn && (
                <label className="block space-y-1.5 text-xs font-semibold text-[#334155] dark:text-[#BFDBFE]">
                  Specialization
                  <input
                    value={specialization}
                    onChange={(event) => setSpecialization(event.target.value)}
                    placeholder="Enter a specialization or N/A"
                    className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-sm font-normal text-[#1E293B] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
                  />
                </label>
              )}
              {validationError && <p role="alert" className="text-xs text-rose-600 dark:text-rose-300">{validationError}</p>}
              <div className="flex justify-end gap-2 border-t border-[#D8E3F1] pt-4 dark:border-[#334155]">
                <button type="button" onClick={() => setModal(null)} className="rounded-xl border border-[#D8E3F1] px-4 py-2.5 text-xs font-semibold text-[#475569] transition-colors hover:bg-[#FFFFFF] dark:border-[#334155] dark:text-[#BFDBFE] dark:hover:bg-[#475569]">Cancel</button>
                <button type="submit" className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8]">{modal === 'add' ? `Add ${singularLabel}` : 'Save changes'}</button>
              </div>
            </form>
          )}

          {recordToDelete && (
            <div className="w-full max-w-sm space-y-4 rounded-2xl border border-[#D8E3F1] bg-white p-5 shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
              <div>
                <h2 className="text-base font-bold text-[#1E293B] dark:text-white">Delete {singularLabel}?</h2>
                <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#BFDBFE]">
                  <strong className="text-[#1E293B] dark:text-white">{recordToDelete.name}</strong> will be removed from this lookup list.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setRecordToDelete(null)} className="rounded-xl border border-[#D8E3F1] px-4 py-2.5 text-xs font-semibold text-[#475569] hover:bg-[#FFFFFF] dark:border-[#334155] dark:text-[#BFDBFE] dark:hover:bg-[#475569]">Cancel</button>
                <button type="button" onClick={deleteRecord} className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-rose-700">Delete</button>
              </div>
            </div>
          )}

          {activitiesOpen && (
            <section aria-labelledby={activitiesTitleId} className="flex max-h-[min(80vh,680px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#D8E3F1] bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
              <div className="flex items-center justify-between border-b border-[#D8E3F1] p-5 dark:border-[#334155]">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1E40AF] dark:text-[#60A5FA]">Audit trail</p>
                  <h2 id={activitiesTitleId} className="mt-1 text-lg font-bold text-[#1E293B] dark:text-white">Recent activities</h2>
                </div>
                <button type="button" aria-label="Close activities" onClick={() => setActivitiesOpen(false)} className="rounded-lg p-2 text-[#64748B] hover:bg-[#FFFFFF] dark:text-[#BFDBFE] dark:hover:bg-[#475569]">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {activities.length > 0 ? activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 rounded-xl border border-[#D8E3F1] bg-[#F8FAFC] p-3.5 dark:border-[#334155] dark:bg-[#0F172A]">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFFFFF] text-[#125B97] dark:bg-[#475569] dark:text-[#60A5FA]">
                      <Clock3 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[#1E293B] dark:text-white">
                        <span className="font-semibold">{activity.user}</span> {activity.action.toLowerCase()}{' '}
                        <span className="font-semibold">{activity.name}</span>
                      </p>
                      <p className="mt-1 text-[10px] text-[#64748B] dark:text-[#64748B]">{activity.timestamp}</p>
                    </div>
                  </div>
                )) : (
                  <div className="py-10 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFFFFF] text-[#64748B] dark:bg-[#475569] dark:text-[#BFDBFE]">
                      <Activity className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-[#1E293B] dark:text-white">No recent activity</p>
                    <p className="mt-1 text-xs text-[#64748B] dark:text-[#64748B]">Changes to {pluralLabel.toLocaleLowerCase()} will appear here.</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  );
};

export const ApplicantFunctionsLookup: React.FC = () => (
  <ApplicantLookupTable
    singularLabel="function"
    pluralLabel="Applicant Functions"
    recordsStorageKey="ats_applicant_functions"
    activitiesStorageKey="ats_applicant_function_activities"
    initialRecords={initialFunctions}
  />
);

export const ApplicantTechnologiesLookup: React.FC = () => (
  <ApplicantLookupTable
    singularLabel="technology"
    pluralLabel="Applicant Technologies"
    recordsStorageKey="ats_applicant_technologies"
    activitiesStorageKey="ats_applicant_technology_activities"
    initialRecords={initialTechnologies}
  />
);

export const ApplicantDegreesLookup: React.FC = () => (
  <ApplicantLookupTable
    singularLabel="degree"
    pluralLabel="Degrees"
    specializationColumn
    lastModifiedColumnLabel="Modified on"
    recordsStorageKey="ats_applicant_degrees"
    activitiesStorageKey="ats_applicant_degree_activities"
    initialRecords={initialDegrees}
  />
);

export const ApplicantClearanceTypesLookup: React.FC = () => (
  <ApplicantLookupTable
    singularLabel="clearance type"
    pluralLabel="Clearance Types"
    nameColumnLabel="Clearance Type"
    recordsStorageKey="ats_applicant_clearance_types"
    activitiesStorageKey="ats_applicant_clearance_type_activities"
    initialRecords={initialClearanceTypes}
  />
);

export const ApplicantLanguageProficienciesLookup: React.FC = () => (
  <ApplicantLookupTable
    singularLabel="language proficiency"
    pluralLabel="Language Proficiencies"
    nameColumnLabel="Language Proficiency"
    recordsStorageKey="ats_applicant_language_proficiencies"
    activitiesStorageKey="ats_applicant_language_proficiency_activities"
    initialRecords={initialLanguageProficiencies}
  />
);
