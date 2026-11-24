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
  X,
  CheckCircle,
  Building2,
  MapPin
} from 'lucide-react';
import {
  ClientLookupItem,
  INITIAL_CLIENT_LOOKUPS,
  ClientActivityLogItem,
  INITIAL_CLIENT_ACTIVITIES
} from '../../../services/clientSettingsMockData';
import { useAppStore } from '../../../store/appStore';

const LOOKUP_TABS = [
  'Client Categories',
  'Client Contact Rejection Reasons',
  'Client Contact Statuses',
  'Client Practices',
  'Client Statuses',
  'Client Facilities'
] as const;

type LookupTab = (typeof LOOKUP_TABS)[number];

const TAB_DESCRIPTIONS: Record<LookupTab, string> = {
  'Client Categories': 'For selection on the client record, you can configure the client categories here.',
  'Client Contact Rejection Reasons':
    'Here, you can configure the client contact rejection reason that will be used when a client contact is rejected.',
  'Client Contact Statuses':
    'For selection on the client contact record, you can configure the client contact status here.',
  'Client Practices': 'Here you can configure the client Practice for selection on the client Record.',
  'Client Statuses': 'For selection on the client record, you can configure the client status here.',
  'Client Facilities': 'For selection on the client record, you can configure the client facilities here.'
};

const TAB_FIELD_LABELS: Record<LookupTab, string> = {
  'Client Categories': 'Client Category',
  'Client Contact Rejection Reasons': 'Rejection Reason',
  'Client Contact Statuses': 'Client Contact Status',
  'Client Practices': 'Client Practice',
  'Client Statuses': 'Client Status',
  'Client Facilities': 'Client Facility'
};

const TAB_COLUMN_HEADERS: Record<LookupTab, string> = {
  'Client Categories': 'CLIENT CATEGORY',
  'Client Contact Rejection Reasons': 'REJECTION REASON',
  'Client Contact Statuses': 'CLIENT CONTACT STATUS',
  'Client Practices': 'CLIENT PRACTICES',
  'Client Statuses': 'CLIENT STATUSES',
  'Client Facilities': 'CLIENT FACILITY NAME'
};

export const ClientLookups: React.FC = () => {
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<LookupTab>('Client Categories');
  const [lookupData, setLookupData] = useState<Record<string, ClientLookupItem[]>>(INITIAL_CLIENT_LOOKUPS);
  const [activities, setActivities] = useState<ClientActivityLogItem[]>(INITIAL_CLIENT_ACTIVITIES);
  const [search, setSearch] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals & Drawers
  const [drawerOpen, setDrawerOpen] = useState<'add' | 'edit' | null>(null);
  const [editingItem, setEditingItem] = useState<ClientLookupItem | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<ClientLookupItem | null>(null);
  const [inputName, setInputName] = useState<string>('');
  const [inputAddress, setInputAddress] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [activitiesOpen, setActivitiesOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentList = lookupData[activeTab] || [];

  const filteredList = currentList
    .filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.createdBy.toLowerCase().includes(search.toLowerCase()) ||
        (item.address && item.address.toLowerCase().includes(search.toLowerCase()));
      return matchSearch;
    })
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
    setInputName('');
    setInputAddress('');
    setValidationError('');
    setDrawerOpen('add');
  };

  const handleOpenEdit = (item: ClientLookupItem) => {
    setEditingItem(item);
    setInputName(item.name);
    setInputAddress(item.address || '');
    setValidationError('');
    setDrawerOpen('edit');
  };

  const deleteRecord = () => {
    if (!recordToDelete) return;
    setLookupData({
      ...lookupData,
      [activeTab]: currentList.filter((i) => i.id !== recordToDelete.id)
    });

    const newLog: ClientActivityLogItem = {
      id: `act-${Date.now()}`,
      action: 'Lookup Deleted',
      user: currentUser?.name || 'Administrator',
      timestamp: 'Just now',
      details: `Deleted "${recordToDelete.name}" from ${activeTab}.`
    };
    setActivities([newLog, ...activities]);
    showToast(`"${recordToDelete.name}" deleted successfully.`);
    setRecordToDelete(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const nameVal = inputName.trim();
    if (!nameVal) {
      setValidationError(`${TAB_FIELD_LABELS[activeTab]} is required.`);
      return;
    }

    if (activeTab === 'Client Facilities' && !inputAddress.trim()) {
      setValidationError('Facility address is required.');
      return;
    }

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const author = currentUser?.name || 'Sachin Wadeyar';

    if (drawerOpen === 'edit' && editingItem) {
      const updatedList = currentList.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              name: nameVal,
              address: activeTab === 'Client Facilities' ? inputAddress.trim() : item.address,
              modifiedBy: author,
              lastModified: formattedDate
            }
          : item
      );
      setLookupData({ ...lookupData, [activeTab]: updatedList });

      const newLog: ClientActivityLogItem = {
        id: `act-${Date.now()}`,
        action: 'Lookup Modified',
        user: author,
        timestamp: 'Just now',
        details: `Updated "${nameVal}" in ${activeTab}.`
      };
      setActivities([newLog, ...activities]);
      showToast(`Updated "${nameVal}" successfully.`);
    } else {
      const newItem: ClientLookupItem = {
        id: `lookup-${Date.now()}`,
        name: nameVal,
        address: activeTab === 'Client Facilities' ? inputAddress.trim() : undefined,
        createdBy: author,
        modifiedBy: author,
        createdOn: formattedDate,
        lastModified: formattedDate
      };
      setLookupData({ ...lookupData, [activeTab]: [...currentList, newItem] });

      const newLog: ClientActivityLogItem = {
        id: `act-${Date.now()}`,
        action: 'Lookup Created',
        user: author,
        timestamp: 'Just now',
        details: `Created new ${TAB_FIELD_LABELS[activeTab]} "${nameVal}".`
      };
      setActivities([newLog, ...activities]);
      showToast(`Added "${nameVal}" successfully.`);
    }

    setDrawerOpen(null);
    setInputName('');
    setInputAddress('');
    setValidationError('');
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2.5 text-xs text-white shadow-xl animate-in fade-in">
          <CheckCircle className="h-4 w-4 text-[#8AC9A7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sub-tabs Under Client Lookups */}
      <div className="border-b border-[#D8E3F1] dark:border-[#334155]">
        <div className="flex flex-wrap gap-2">
          {LOOKUP_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setSearch('');
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${
                activeTab === tab
                  ? 'border-[#125B97] text-[#125B97] dark:border-[#93C5FD] dark:text-[#93C5FD]'
                  : 'border-transparent text-[#64748B] hover:border-[#CBD5E1] hover:text-[#1E293B] dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Descriptive Prompt */}
      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
        {TAB_DESCRIPTIONS[activeTab]}
      </p>

      {/* Main Container Card */}
      <div className="rounded-2xl border border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#1E293B]">
        {/* Card Toolbar */}
        <div className="flex flex-col gap-3 border-b border-[#E2E8F0] p-4 sm:flex-row sm:items-center sm:justify-between dark:border-[#334155]">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-[#D8E3F1] bg-white py-2 pl-9 pr-3 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#94A3B8]" />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-[#94A3B8] hover:text-[#1E293B] dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActivitiesOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#D8E3F1] bg-white px-3.5 py-2 text-xs font-semibold text-[#334155] shadow-sm transition-colors hover:bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white dark:hover:bg-[#334155]"
            >
              <Clock3 className="h-3.5 w-3.5 text-[#64748B]" />
              <span>Activities</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[10px] uppercase tracking-[0.12em] text-[#64748B] dark:bg-[#0F172A] dark:text-[#94A3B8]">
              <tr>
                <th
                  className="cursor-pointer px-4 py-3 font-semibold transition-colors hover:text-[#1E293B] dark:hover:text-white"
                  onClick={() =>
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                  }
                >
                  <div className="flex items-center gap-1.5">
                    <span>{TAB_COLUMN_HEADERS[activeTab]}</span>
                    <span className="text-[10px]">
                      {sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '↑↓'}
                    </span>
                  </div>
                </th>
                {activeTab === 'Client Facilities' && (
                  <th className="px-4 py-3 font-semibold">CLIENT FACILITY ADDRESS</th>
                )}
                <th className="px-4 py-3 font-semibold">CREATED BY</th>
                {activeTab === 'Client Facilities' && (
                  <th className="px-4 py-3 font-semibold">CREATED ON</th>
                )}
                <th className="px-4 py-3 font-semibold">MODIFIED BY</th>
                <th className="px-4 py-3 font-semibold">LAST MODIFIED</th>
                <th className="w-24 px-4 py-3 text-right font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
              {displayedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === 'Client Facilities' ? 7 : 5}
                    className="py-12 text-center text-xs text-[#64748B] dark:text-[#94A3B8]"
                  >
                    No Records Found.
                  </td>
                </tr>
              ) : (
                displayedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-[#F8FAFC] dark:hover:bg-[#334155]/50"
                  >
                    <td className="px-4 py-3.5 font-medium text-[#1E293B] dark:text-white">
                      {item.name}
                    </td>
                    {activeTab === 'Client Facilities' && (
                      <td className="px-4 py-3.5 text-[#475569] dark:text-[#CBD5E1]">
                        {item.address || '-'}
                      </td>
                    )}
                    <td className="px-4 py-3.5 text-[#475569] dark:text-[#CBD5E1]">
                      {item.createdBy}
                    </td>
                    {activeTab === 'Client Facilities' && (
                      <td className="px-4 py-3.5 text-[#475569] dark:text-[#CBD5E1]">
                        {item.createdOn || '-'}
                      </td>
                    )}
                    <td className="px-4 py-3.5 text-[#475569] dark:text-[#CBD5E1]">
                      {item.modifiedBy}
                    </td>
                    <td className="px-4 py-3.5 text-[#475569] dark:text-[#CBD5E1]">
                      {item.lastModified}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit"
                          className="rounded-lg p-1 text-[#64748B] transition-colors hover:bg-[#DCE8FF] hover:text-[#125B97] dark:text-[#94A3B8] dark:hover:bg-[#334155] dark:hover:text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecordToDelete(item)}
                          title="Delete"
                          className="rounded-lg p-1 text-[#64748B] transition-colors hover:bg-[#FEE2E2] hover:text-[#EF4444] dark:text-[#94A3B8] dark:hover:bg-[#334155] dark:hover:text-[#EF4444]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col gap-3 border-t border-[#E2E8F0] px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-[#334155]">
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Showing {firstRecord} to {lastRecord} of {totalEntries} entries
          </span>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={activePage <= 1}
                onClick={() => setCurrentPage(1)}
                className="rounded-lg p-1 text-[#64748B] transition-colors hover:bg-[#F1F5F9] disabled:opacity-30 dark:hover:bg-[#334155]"
                title="First Page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={activePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-lg p-1 text-[#64748B] transition-colors hover:bg-[#F1F5F9] disabled:opacity-30 dark:hover:bg-[#334155]"
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="rounded-lg bg-[#DCE8FF] px-2.5 py-1 text-xs font-semibold text-[#125B97] dark:bg-[#334155] dark:text-white">
                {activePage}
              </span>
              <button
                type="button"
                disabled={activePage >= pageCount}
                onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                className="rounded-lg p-1 text-[#64748B] transition-colors hover:bg-[#F1F5F9] disabled:opacity-30 dark:hover:bg-[#334155]"
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={activePage >= pageCount}
                onClick={() => setCurrentPage(pageCount)}
                className="rounded-lg p-1 text-[#64748B] transition-colors hover:bg-[#F1F5F9] disabled:opacity-30 dark:hover:bg-[#334155]"
                title="Last Page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-[#D8E3F1] bg-white px-2 py-1 text-xs text-[#1E293B] outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer for Add/Edit (Matches Ceipal slide-out from right) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-[#1E293B] animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 dark:border-[#334155]">
              <h3 className="text-sm font-bold text-[#1E293B] dark:text-white">
                {drawerOpen === 'edit'
                  ? `Edit ${TAB_FIELD_LABELS[activeTab]}`
                  : `Add ${TAB_FIELD_LABELS[activeTab]}`}
              </h3>
              <button
                type="button"
                onClick={() => setDrawerOpen(null)}
                className="rounded-lg p-1 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B] dark:hover:bg-[#334155] dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Body Form */}
            <form onSubmit={handleSave} className="flex flex-1 flex-col justify-between p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#334155] dark:text-slate-300">
                    {TAB_FIELD_LABELS[activeTab]} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={inputName}
                    placeholder="Required"
                    autoFocus
                    onChange={(e) => {
                      setInputName(e.target.value);
                      if (validationError) setValidationError('');
                    }}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-[#1E293B] outline-none transition-colors dark:bg-[#0F172A] dark:text-white ${
                      validationError
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-[#D8E3F1] focus:border-[#2563EB] dark:border-[#334155]'
                    }`}
                  />
                  {validationError && (
                    <p className="mt-1 text-[11px] text-red-500">{validationError}</p>
                  )}
                </div>

                {activeTab === 'Client Facilities' && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#334155] dark:text-slate-300">
                      Client Facility Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={inputAddress}
                      placeholder="Enter the facility address"
                      onChange={(e) => setInputAddress(e.target.value)}
                      className="w-full rounded-xl border border-[#D8E3F1] px-3.5 py-2.5 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 border-t border-[#E2E8F0] pt-4 dark:border-[#334155]">
                <button
                  type="submit"
                  className="rounded-xl bg-[#2563EB] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1D4ED8]"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(null)}
                  className="rounded-xl border border-[#D8E3F1] bg-white px-5 py-2 text-xs font-semibold text-[#475569] shadow-sm hover:bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activities Slide-out Drawer */}
      {activitiesOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-[#1E293B] animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 dark:border-[#334155]">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-[#125B97] dark:text-[#93C5FD]" />
                <h3 className="text-sm font-bold text-[#1E293B] dark:text-white">
                  Activity History
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivitiesOpen(false)}
                className="rounded-lg p-1 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B] dark:hover:bg-[#334155] dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {activities.length === 0 ? (
                <p className="text-center text-xs text-[#64748B]">No recent activities logged.</p>
              ) : (
                activities.map((act) => (
                  <div
                    key={act.id}
                    className="rounded-xl border border-[#D8E3F1] bg-[#F8FAFC] p-3 text-xs dark:border-[#334155] dark:bg-[#0F172A]"
                  >
                    <div className="flex items-center justify-between font-semibold text-[#1E293B] dark:text-white">
                      <span>{act.action}</span>
                      <span className="text-[10px] text-[#64748B]">{act.timestamp}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#475569] dark:text-[#CBD5E1]">
                      {act.details}
                    </p>
                    <p className="mt-1.5 text-[10px] text-[#94A3B8]">By: {act.user}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-[#D8E3F1] bg-white p-6 shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
            <h4 className="text-sm font-bold text-[#1E293B] dark:text-white">
              Delete {TAB_FIELD_LABELS[activeTab]}?
            </h4>
            <p className="mt-2 text-xs text-[#64748B] dark:text-[#CBD5E1]">
              Are you sure you want to delete &ldquo;{recordToDelete.name}&rdquo;? This action
              cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="rounded-xl border border-[#D8E3F1] px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] dark:border-[#334155] dark:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteRecord}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
