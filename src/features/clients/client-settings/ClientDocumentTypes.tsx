import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  Clock3,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  ClientDocumentTypeItem,
  INITIAL_CLIENT_DOCUMENT_TYPES,
  AVAILABLE_RESTRICTED_ROLES,
  ClientActivityLogItem,
  INITIAL_CLIENT_ACTIVITIES
} from '../../../services/clientSettingsMockData';
import { useAppStore } from '../../../store/appStore';

export const ClientDocumentTypes: React.FC = () => {
  const { currentUser } = useAppStore();
  const [documents, setDocuments] = useState<ClientDocumentTypeItem[]>(INITIAL_CLIENT_DOCUMENT_TYPES);
  const [activities, setActivities] = useState<ClientActivityLogItem[]>(INITIAL_CLIENT_ACTIVITIES);
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingDoc, setEditingDoc] = useState<ClientDocumentTypeItem | null>(null);
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [activitiesOpen, setActivitiesOpen] = useState<boolean>(false);
  const [docToDelete, setDocToDelete] = useState<ClientDocumentTypeItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [docType, setDocType] = useState<string>('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [rolesDropdownOpen, setRolesDropdownOpen] = useState<boolean>(false);
  const [roleSearch, setRoleSearch] = useState<string>('');
  const [isMandatory, setIsMandatory] = useState<'No' | 'Yes' | 'Yes, But Can Be Added Later'>('No');
  const [sendExpiryNotification, setSendExpiryNotification] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');
  const rolesDropdownRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        rolesDropdownRef.current &&
        !rolesDropdownRef.current.contains(event.target as Node)
      ) {
        setRolesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenAdd = () => {
    setEditingDoc(null);
    setDocType('');
    setSelectedRoles([]);
    setIsMandatory('No');
    setSendExpiryNotification(false);
    setValidationError('');
    setViewMode('form');
  };

  const handleOpenEdit = (item: ClientDocumentTypeItem) => {
    setEditingDoc(item);
    setDocType(item.documentType);
    setSelectedRoles(item.restrictedRoles || []);
    setIsMandatory(item.isMandatory);
    setSendExpiryNotification(item.expiryNotification);
    setValidationError('');
    setViewMode('form');
  };

  const handleDelete = () => {
    if (!docToDelete) return;
    setDocuments(documents.filter((d) => d.id !== docToDelete.id));
    const author = currentUser?.name || 'Sachin Wadeyar';
    const log: ClientActivityLogItem = {
      id: `act-${Date.now()}`,
      action: 'Document Type Deleted',
      user: author,
      timestamp: 'Just now',
      details: `Deleted document type "${docToDelete.documentType}".`
    };
    setActivities([log, ...activities]);
    showToast(`"${docToDelete.documentType}" deleted successfully.`);
    setDocToDelete(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docType.trim()) {
      setValidationError('Document Type is required.');
      return;
    }

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const author = currentUser?.name || 'Sachin Wadeyar';

    if (editingDoc) {
      setDocuments(
        documents.map((d) =>
          d.id === editingDoc.id
            ? {
                ...d,
                documentType: docType.trim(),
                restrictedRoles: selectedRoles,
                isMandatory,
                expiryNotification: sendExpiryNotification,
                modifiedBy: author,
                lastModified: formattedDate
              }
            : d
        )
      );
      const log: ClientActivityLogItem = {
        id: `act-${Date.now()}`,
        action: 'Document Type Updated',
        user: author,
        timestamp: 'Just now',
        details: `Updated document type "${docType.trim()}".`
      };
      setActivities([log, ...activities]);
      showToast(`Document type "${docType.trim()}" updated successfully.`);
    } else {
      const newDoc: ClientDocumentTypeItem = {
        id: `cdt-${Date.now()}`,
        documentType: docType.trim(),
        businessUnit: 'Ampcus Tech Pvt Ltd.',
        isMandatory,
        expiryNotification: sendExpiryNotification,
        restrictedRoles: selectedRoles,
        createdBy: author,
        modifiedBy: author,
        createdAt: formattedDate,
        lastModified: formattedDate
      };
      setDocuments([newDoc, ...documents]);
      const log: ClientActivityLogItem = {
        id: `act-${Date.now()}`,
        action: 'Document Type Created',
        user: author,
        timestamp: 'Just now',
        details: `Created new document type "${docType.trim()}".`
      };
      setActivities([log, ...activities]);
      showToast(`Document type "${docType.trim()}" created successfully.`);
    }

    setViewMode('list');
  };

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const filteredRoles = AVAILABLE_RESTRICTED_ROLES.filter((r) =>
    r.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const filteredDocs = documents.filter((d) =>
    d.documentType.toLowerCase().includes(search.toLowerCase()) ||
    d.businessUnit.toLowerCase().includes(search.toLowerCase()) ||
    d.createdBy.toLowerCase().includes(search.toLowerCase())
  );

  const totalEntries = filteredDocs.length;
  const pageCount = Math.max(1, Math.ceil(totalEntries / pageSize));
  const activePage = Math.min(currentPage, pageCount);
  const startIndex = (activePage - 1) * pageSize;
  const displayedDocs = filteredDocs.slice(startIndex, startIndex + pageSize);
  const firstRecord = totalEntries === 0 ? 0 : startIndex + 1;
  const lastRecord = Math.min(startIndex + pageSize, totalEntries);

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2.5 text-xs text-white shadow-xl animate-in fade-in">
          <CheckCircle className="h-4 w-4 text-[#8AC9A7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {viewMode === 'list' ? (
        /* List View */
        <div className="rounded-2xl border border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#1E293B]">
          {/* Toolbar */}
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
                  <th className="px-4 py-3 font-semibold">DOCUMENT TYPE</th>
                  <th className="px-4 py-3 font-semibold">BUSINESS UNIT</th>
                  <th className="px-4 py-3 font-semibold">IS MANDATORY</th>
                  <th className="px-4 py-3 font-semibold">EXPIRY NOTIFICATION</th>
                  <th className="px-4 py-3 font-semibold">CREATED BY</th>
                  <th className="px-4 py-3 font-semibold">MODIFIED BY</th>
                  <th className="px-4 py-3 font-semibold">LAST MODIFIED</th>
                  <th className="w-24 px-4 py-3 text-right font-semibold">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                {displayedDocs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-xs text-[#64748B] dark:text-[#94A3B8]"
                    >
                      No Records Found.
                    </td>
                  </tr>
                ) : (
                  displayedDocs.map((doc) => (
                    <tr
                      key={doc.id}
                      className="transition-colors hover:bg-[#F8FAFC] dark:hover:bg-[#334155]/50"
                    >
                      <td className="px-4 py-3.5 font-medium text-[#1E293B] dark:text-white">
                        <div>
                          <span>{doc.documentType}</span>
                          {doc.restrictedRoles && doc.restrictedRoles.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {doc.restrictedRoles.map((r) => (
                                <span
                                  key={r}
                                  className="rounded bg-[#EFF6FF] px-1.5 py-0.5 text-[9px] font-medium text-[#2563EB] dark:bg-[#1E293B] dark:text-[#93C5FD]"
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[#475569] dark:text-[#CBD5E1]">
                        {doc.businessUnit}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            doc.isMandatory === 'Yes'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                              : doc.isMandatory === 'Yes, But Can Be Added Later'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {doc.isMandatory}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[#475569] dark:text-[#CBD5E1]">
                        {doc.expiryNotification ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Enabled
                          </span>
                        ) : (
                          <span className="text-slate-400">Disabled</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-[#475569] dark:text-[#CBD5E1]">
                        {doc.createdBy}
                      </td>
                      <td className="px-4 py-3.5 text-[#475569] dark:text-[#CBD5E1]">
                        {doc.modifiedBy}
                      </td>
                      <td className="px-4 py-3.5 text-[#475569] dark:text-[#CBD5E1]">
                        {doc.lastModified}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(doc)}
                            title="Edit"
                            className="rounded-lg p-1 text-[#64748B] transition-colors hover:bg-[#DCE8FF] hover:text-[#125B97] dark:text-[#94A3B8] dark:hover:bg-[#334155] dark:hover:text-white"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDocToDelete(doc)}
                            title="Delete"
                            className="rounded-lg p-1 text-[#64748B] transition-colors hover:bg-[#FEE2E2] hover:text-[#EF4444] dark:text-[#94A3B8] dark:hover:bg-[#334155] dark:hover:text-EF4444]"
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

          {/* Pagination */}
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
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={activePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg p-1 text-[#64748B] transition-colors hover:bg-[#F1F5F9] disabled:opacity-30 dark:hover:bg-[#334155]"
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
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={activePage >= pageCount}
                  onClick={() => setCurrentPage(pageCount)}
                  className="rounded-lg p-1 text-[#64748B] transition-colors hover:bg-[#F1F5F9] disabled:opacity-30 dark:hover:bg-[#334155]"
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
      ) : (
        /* Form View (Matches Screenshot 13 & 14) */
        <div className="rounded-2xl border border-[#D8E3F1] bg-white p-6 shadow-sm dark:border-[#334155] dark:bg-[#1E293B]">
          {/* Header with Back button */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 dark:border-[#334155]">
            <h2 className="text-base font-bold text-[#1E293B] dark:text-white">
              {editingDoc ? 'Edit Client Document Type' : 'Client Document Types'}
            </h2>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#D8E3F1] bg-white px-3.5 py-2 text-xs font-semibold text-[#334155] shadow-sm transition-colors hover:bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-6 max-w-2xl space-y-6">
            {/* Document Type input */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#334155] dark:text-slate-200">
                Document Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={docType}
                placeholder="Enter document type name"
                onChange={(e) => {
                  setDocType(e.target.value);
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

            {/* Select Roles to Restrict Access */}
            <div className="relative" ref={rolesDropdownRef}>
              <label className="mb-1 block text-xs font-semibold text-[#334155] dark:text-slate-200">
                Select Roles to Restrict Access to the Document
              </label>
              <button
                type="button"
                onClick={() => setRolesDropdownOpen(!rolesDropdownOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-[#D8E3F1] bg-white px-3.5 py-2.5 text-left text-xs text-[#1E293B] outline-none transition-colors hover:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
              >
                <div className="flex flex-wrap items-center gap-1.5 overflow-hidden">
                  {selectedRoles.length === 0 ? (
                    <span className="text-[#94A3B8]">Select</span>
                  ) : (
                    selectedRoles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center gap-1 rounded bg-[#DCE8FF] px-2 py-0.5 text-[11px] font-medium text-[#125B97] dark:bg-[#334155] dark:text-white"
                      >
                        <span>{role}</span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRole(role);
                          }}
                          className="cursor-pointer hover:text-red-500"
                        >
                          ×
                        </span>
                      </span>
                    ))
                  )}
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-[#94A3B8]" />
              </button>

              {/* Roles Dropdown with Search */}
              {rolesDropdownOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-xl border border-[#D8E3F1] bg-white p-2 shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
                  <div className="relative mb-2">
                    <input
                      type="text"
                      placeholder="Search roles..."
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                      className="w-full rounded-lg border border-[#D8E3F1] bg-white py-1.5 pl-8 pr-3 text-xs text-[#1E293B] outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
                    />
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#94A3B8]" />
                  </div>

                  <div className="max-h-48 space-y-1 overflow-y-auto">
                    {filteredRoles.map((role) => (
                      <label
                        key={role}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-[#334155] transition-colors hover:bg-[#F8FAFC] dark:text-slate-200 dark:hover:bg-[#334155]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role)}
                          onChange={() => toggleRole(role)}
                          className="h-3.5 w-3.5 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                        />
                        <span>{role}</span>
                      </label>
                    ))}
                    {filteredRoles.length === 0 && (
                      <p className="py-2 text-center text-xs text-[#94A3B8]">No roles match.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Is Mandatory Radio Options */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#334155] dark:text-slate-200">
                Is Mandatory
              </label>
              <div className="flex flex-wrap gap-4">
                {(['No', 'Yes', 'Yes, But Can Be Added Later'] as const).map((opt) => (
                  <label key={opt} className="flex cursor-pointer items-center gap-2 text-xs text-[#334155] dark:text-slate-200">
                    <input
                      type="radio"
                      name="isMandatory"
                      value={opt}
                      checked={isMandatory === opt}
                      onChange={() => setIsMandatory(opt)}
                      className="h-3.5 w-3.5 text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Send Expiry Notification */}
            <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-4 dark:border-[#334155]">
              <span className="text-xs font-semibold text-[#334155] dark:text-slate-200">
                Send Expiry Notification
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={sendExpiryNotification}
                onClick={() => setSendExpiryNotification(!sendExpiryNotification)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  sendExpiryNotification ? 'bg-[#2563EB]' : 'bg-[#CBD5E1] dark:bg-[#475569]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    sendExpiryNotification ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center gap-2 border-t border-[#E2E8F0] pt-4 dark:border-[#334155]">
              <button
                type="submit"
                className="rounded-xl bg-[#2563EB] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1D4ED8]"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="rounded-xl border border-[#D8E3F1] bg-white px-5 py-2 text-xs font-semibold text-[#475569] shadow-sm hover:bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
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
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-[#D8E3F1] bg-white p-6 shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
            <h4 className="text-sm font-bold text-[#1E293B] dark:text-white">
              Delete Document Type?
            </h4>
            <p className="mt-2 text-xs text-[#64748B] dark:text-[#CBD5E1]">
              Are you sure you want to delete &ldquo;{docToDelete.documentType}&rdquo;?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="rounded-xl border border-[#D8E3F1] px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] dark:border-[#334155] dark:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
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
