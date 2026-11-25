import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Check, ChevronDown, ChevronsUpDown, Columns3, Folder, ListFilter, Plus, Search, Settings2, SlidersHorizontal, X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { Client, Priority, TaskItem } from '../../types';
import { ClientAdmin } from './ClientAdmin';

type ClientColumn = { key: string; label: string; value: (client: Client) => string };
type ColumnFilter = { id: string; field: string; operator: string; value: string };
type ClientView = { id: string; name: string; folder: string; columns: string[]; businessUnits: string[]; filters: ColumnFilter[] };
type Panel = 'filters' | 'columns' | 'search' | 'task' | 'views' | 'folder' | null;
const CLIENT_COLUMNS: ClientColumn[] = [
  { key: 'clientId', label: 'Client ID', value: (c) => c.clientId },
  { key: 'name', label: 'Client Name', value: (c) => c.name },
  { key: 'contactPhone', label: 'Contact Number', value: (c) => c.contactPhone || '' },
  { key: 'website', label: 'Website', value: (c) => c.website || '' },
  { key: 'industry', label: 'Industry', value: (c) => c.industry || '' },
  { key: 'status', label: 'Status', value: (c) => c.status },
  { key: 'primaryOwner', label: 'Primary Owner', value: (c) => c.primaryOwner || c.accountManager || '' },
  { key: 'businessUnit', label: 'Business Unit', value: (c) => c.businessUnit || '' },
  { key: 'displayOnJobPosting', label: 'Display on Job Posting', value: (c) => c.displayOnJobPosting === undefined ? 'No' : c.displayOnJobPosting ? 'Yes' : 'No' },
  { key: 'createdBy', label: 'Created By', value: (c) => c.createdBy || '' },
  { key: 'createdOn', label: 'Created On', value: (c) => c.createdOn || c.joinedDate || '' },
  { key: 'modifiedOn', label: 'Modified On', value: (c) => c.modifiedOn || '' },
  { key: 'modifiedBy', label: 'Modified By', value: (c) => c.modifiedBy || '' },
  { key: 'primaryBusinessUnit', label: 'Primary Business Unit', value: (c) => c.primaryBusinessUnit || c.businessUnit || '' },
  { key: 'contactPerson', label: 'Primary Contact', value: (c) => c.contactPerson || '' },
  { key: 'contactEmail', label: 'Email Address', value: (c) => c.contactEmail || '' },
  { key: 'location', label: 'Location', value: (c) => c.location || '' },
  { key: 'tier', label: 'Category', value: (c) => c.category || c.tier || '' },
];
const DEFAULT_COLUMNS = ['clientId', 'name', 'contactPhone', 'website', 'industry', 'status', 'primaryOwner', 'businessUnit', 'displayOnJobPosting', 'createdBy', 'createdOn', 'modifiedOn', 'modifiedBy', 'primaryBusinessUnit'];
const OPERATORS = ['Equals', 'Not Equals', 'Contains', 'Does Not Contain', 'Starts With', 'Is Empty', 'Is Not Empty', 'Greater Than', 'Less Than'];
const inputClass = 'w-full rounded border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#1E293B] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-medium text-[#1E293B] transition hover:bg-[#F8FAFC]';
const emptyFilter = (): ColumnFilter => ({ id: `filter-${Date.now()}-${Math.random()}`, field: 'name', operator: 'Contains', value: '' });

function readJson<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}

function formatDate(value: string): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export const ClientList: React.FC = () => {
  const { currentUser } = useAppStore();
  const [adminViewMode, setAdminViewMode] = useState<'settings' | 'directory'>('settings');
  const [clients, setClients] = useState<Client[]>([]);
  const [panel, setPanel] = useState<Panel>(null);
  const [search, setSearch] = useState('');
  const [searchBy, setSearchBy] = useState('Search Any');
  const [selected, setSelected] = useState<string[]>([]);
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'clientId', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(() => readJson(`ats_client_columns_${currentUser?.id || 'user'}`, DEFAULT_COLUMNS));
  const [columnSearch, setColumnSearch] = useState('');
  const [filterDraft, setFilterDraft] = useState<ColumnFilter[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<ColumnFilter[]>([]);
  const [businessUnits, setBusinessUnits] = useState<string[]>([]);
  const [businessUnitDraft, setBusinessUnitDraft] = useState<string[]>([]);
  const [views, setViews] = useState<ClientView[]>(() => readJson(`ats_client_views_${currentUser?.id || 'user'}`, []));
  const [folders, setFolders] = useState<string[]>(() => readJson(`ats_client_folders_${currentUser?.id || 'user'}`, []));
  const [activeView, setActiveView] = useState('All Clients');
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [viewFolder, setViewFolder] = useState('');
  const [editingViewId, setEditingViewId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Search Client criteria
  const [searchCountry, setSearchCountry] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchRadius, setSearchRadius] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchIndustry, setSearchIndustry] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [locationSearch, setLocationSearch] = useState<{ country: string; city: string; radius: string; category: string; industry: string; status: string } | null>(null);

  // Create task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>('Medium');
  const [taskBusinessUnit, setTaskBusinessUnit] = useState(currentUser?.businessUnit || '');
  const [taskType, setTaskType] = useState('Call');
  const [taskCategory, setTaskCategory] = useState('Client Follow-up');
  const [relatedTo, setRelatedTo] = useState<'Client' | 'Client Contact'>('Client');
  const [taskClientId, setTaskClientId] = useState('');
  const [taskContactName, setTaskContactName] = useState('');
  const [taskStatus, setTaskStatus] = useState<TaskItem['status']>('Pending');
  const [assignedTo, setAssignedTo] = useState(currentUser?.name || '');
  const [escalateTo, setEscalateTo] = useState('');
  const [reminder, setReminder] = useState('');
  const [ownership, setOwnership] = useState(currentUser?.name || '');
  const [dueDate, setDueDate] = useState('');
  const [notifyViaEmail, setNotifyViaEmail] = useState(true);
  const [recurringTask, setRecurringTask] = useState(false);
  const [showOnCalendar, setShowOnCalendar] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  const storageKey = (suffix: string) => `ats_client_${suffix}_${currentUser?.id || 'user'}`;
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(''), 2800);
  }, []);

  const loadClients = useCallback(async () => {
    setSaving(true);
    try { setClients(await ApiService.getClients()); }
    catch (error) { showToast(error instanceof Error ? error.message : 'Could not load clients.'); }
    finally { setSaving(false); }
  }, [showToast]);

  useEffect(() => { void loadClients(); ApiService.getTasks().then(setTasks); }, [loadClients]);

  useEffect(() => { localStorage.setItem(storageKey('views'), JSON.stringify(views)); }, [views, currentUser?.id]);
  useEffect(() => { localStorage.setItem(storageKey('folders'), JSON.stringify(folders)); }, [folders, currentUser?.id]);
  useEffect(() => { localStorage.setItem(`ats_client_columns_${currentUser?.id || 'user'}`, JSON.stringify(selectedColumns)); }, [selectedColumns, currentUser?.id]);

  const allBusinessUnits = useMemo(() => [...new Set(clients.map((client) => client.businessUnit).filter((value): value is string => Boolean(value)))], [clients]);
  const clientContacts = useMemo(() => {
    const client = clients.find((item) => item.id === taskClientId);
    return client ? [client.contactPerson, ...(client.contacts || []).map((contact) => contact.name)].filter((value): value is string => Boolean(value)) : [];
  }, [clients, taskClientId]);

  const matchesRule = (client: Client, rule: ColumnFilter) => {
    const column = CLIENT_COLUMNS.find((item) => item.key === rule.field);
    const actual = column?.value(client) || '';
    const value = rule.value.trim().toLocaleLowerCase();
    const normalizedActual = actual.toLocaleLowerCase();
    switch (rule.operator) {
      case 'Equals': return normalizedActual === value;
      case 'Not Equals': return normalizedActual !== value;
      case 'Does Not Contain': return !normalizedActual.includes(value);
      case 'Starts With': return normalizedActual.startsWith(value);
      case 'Is Empty': return !actual.trim();
      case 'Is Not Empty': return Boolean(actual.trim());
      case 'Greater Than': return Number(actual) > Number(rule.value);
      case 'Less Than': return Number(actual) < Number(rule.value);
      default: return normalizedActual.includes(value);
    }
  };

  const filteredClients = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const searchable = (client: Client) => {
      if (!query) return true;
      const column = CLIENT_COLUMNS.find((item) => item.label === searchBy);
      return column ? column.value(client).toLocaleLowerCase().includes(query) : CLIENT_COLUMNS.some((item) => item.value(client).toLocaleLowerCase().includes(query));
    };
    return clients.filter((client) => {
      const matchesSearch = searchable(client);
      const matchesBusinessUnit = !businessUnits.length || businessUnits.includes(client.businessUnit || '');
      const matchesFilters = appliedFilters.every((filter) => !filter.value.trim() && !['Is Empty', 'Is Not Empty'].includes(filter.operator) || matchesRule(client, filter));
      const location = `${client.location} ${client.country || ''}`.toLocaleLowerCase();
      const matchesLocation = !locationSearch ||
        (!locationSearch.country || location.includes(locationSearch.country.toLocaleLowerCase())) &&
        (!locationSearch.city || location.includes(locationSearch.city.toLocaleLowerCase())) &&
        (!locationSearch.category || (client.category || client.tier).toLocaleLowerCase().includes(locationSearch.category.toLocaleLowerCase())) &&
        (!locationSearch.industry || client.industry.toLocaleLowerCase().includes(locationSearch.industry.toLocaleLowerCase())) &&
        (!locationSearch.status || client.status === locationSearch.status) &&
        (!locationSearch.radius || !client.distanceMiles || client.distanceMiles <= Number(locationSearch.radius));
      return matchesSearch && matchesBusinessUnit && matchesFilters && matchesLocation;
    }).sort((left, right) => {
      const column = CLIENT_COLUMNS.find((item) => item.key === sort.key) || CLIENT_COLUMNS[0];
      const comparison = column.value(left).localeCompare(column.value(right), undefined, { numeric: true, sensitivity: 'base' });
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }, [clients, search, searchBy, businessUnits, appliedFilters, locationSearch, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredClients.length / pageSize));
  const visibleClients = filteredClients.slice((page - 1) * pageSize, page * pageSize);
  const visibleColumns = selectedColumns.map((key) => CLIENT_COLUMNS.find((column) => column.key === key)).filter((column): column is ClientColumn => Boolean(column));

  const toggleSelected = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const selectAllVisible = (checked: boolean) => setSelected((current) => checked ? [...new Set([...current, ...visibleClients.map((client) => client.id)])] : current.filter((id) => !visibleClients.some((client) => client.id === id)));
  const openPanel = (next: Panel) => { setPanel(next); setToolsMenuOpen(false); setViewMenuOpen(false); };
  const openTask = (type: 'Task' | 'Client Contact') => {
    setRelatedTo(type === 'Client Contact' ? 'Client Contact' : 'Client');
    setTaskTitle(''); setTaskDescription(''); setTaskClientId(selected.length === 1 ? selected[0] : ''); setTaskContactName(''); setDueDate('');
    setPanel('task');
  };

  const saveTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!taskTitle.trim() || !taskDescription.trim() || !dueDate || !taskClientId || !assignedTo.trim()) return;
    const client = clients.find((item) => item.id === taskClientId);
    try {
      const created = await ApiService.createTask({
        title: taskTitle.trim(), description: taskDescription.trim(), dueDate, priority: taskPriority,
        assignedTo: assignedTo.trim(), status: taskStatus,
        category: taskCategory === 'Client Review' ? 'Client Review' : 'Task',
        businessUnit: taskBusinessUnit, taskType, taskCategory, relatedTo,
        clientId: client?.id, clientName: client?.name, contactName: relatedTo === 'Client Contact' ? taskContactName : undefined,
        escalateTo, reminder, ownership, notifyViaEmail, recurrenceTask: recurringTask, showOnCalendar,
        assignedBy: currentUser?.name || '', createdOn: new Date().toISOString(),
      });
      setTasks((current) => [created, ...current]); setPanel(null); showToast('Task created and assigned.');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Task could not be created.'); }
  };

  const applyFilters = () => { setBusinessUnits(businessUnitDraft); setAppliedFilters(filterDraft); setPage(1); setPanel(null); };
  const applyClientSearch = () => { setLocationSearch({ country: searchCountry, city: searchCity, radius: searchRadius, category: searchCategory, industry: searchIndustry, status: searchStatus }); setPage(1); setPanel(null); };
  const resetClientSearch = () => { setSearchCountry(''); setSearchCity(''); setSearchRadius(''); setSearchCategory(''); setSearchIndustry(''); setSearchStatus(''); setLocationSearch(null); setPage(1); };
  const createView = (event: React.FormEvent) => {
    event.preventDefault(); if (!newViewName.trim()) return;
    const view: ClientView = { id: editingViewId || `view-${Date.now()}`, name: newViewName.trim(), folder: viewFolder, columns: selectedColumns, businessUnits, filters: appliedFilters };
    setViews((current) => editingViewId ? current.map((item) => item.id === editingViewId ? view : item) : [view, ...current]); setActiveView(view.name); setNewViewName(''); setViewFolder(''); setEditingViewId(null); setPanel(null); showToast(editingViewId ? 'Client view updated.' : 'Client view saved.');
  };
  const openSavedView = (view: ClientView) => { setActiveView(view.name); setSelectedColumns(view.columns); setBusinessUnits(view.businessUnits); setBusinessUnitDraft(view.businessUnits); setAppliedFilters(view.filters); setFilterDraft(view.filters); setPage(1); setViewMenuOpen(false); };
  const createFolder = (event: React.FormEvent) => { event.preventDefault(); if (!newFolderName.trim()) return; setFolders((current) => [...new Set([...current, newFolderName.trim()])]); setNewFolderName(''); setPanel(null); showToast('Folder created.'); };

  if (currentUser?.role === 'admin' && adminViewMode === 'settings') return <ClientAdmin onSwitchToDirectory={() => setAdminViewMode('directory')} />;

  return <div className="min-h-full bg-[#F4F6F9] text-[#1E293B]">
    {toastMessage && <div role="status" className="fixed right-5 top-20 z-[80] rounded bg-[#1D4ED8] px-4 py-2.5 text-xs font-medium text-white shadow-lg">{toastMessage}</div>}

    <div className="sticky top-0 z-20 border-b border-[#D8E3F1] bg-white px-4 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button type="button" onClick={() => { setViewMenuOpen((open) => !open); setToolsMenuOpen(false); }} className="inline-flex items-center gap-2 border-b-2 border-[#2563EB] px-2 py-2 text-sm font-semibold text-[#2563EB]">{activeView}<ChevronDown className="h-4 w-4" /></button>
            {viewMenuOpen && <div className="absolute left-0 top-full z-30 mt-1 w-72 rounded border border-[#D8E3F1] bg-white p-1 shadow-xl">
              <button onClick={() => { setActiveView('All Clients'); setBusinessUnits([]); setAppliedFilters([]); setLocationSearch(null); setViewMenuOpen(false); }} className="w-full rounded px-3 py-2 text-left text-xs hover:bg-[#F1F5F9]">All Clients</button>
              {folders.map((folder) => <div key={folder} className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-[#64748B]">{folder || 'Saved Views'}</div>)}
              {views.map((view) => <div key={view.id} className="group flex items-center rounded hover:bg-[#F1F5F9]"><button onClick={() => openSavedView(view)} className="flex-1 px-3 py-2 text-left text-xs">{view.name}</button><button title={`Edit ${view.name}`} onClick={() => { setEditingViewId(view.id); setNewViewName(view.name); setViewFolder(view.folder); setPanel('views'); setViewMenuOpen(false); }} className="mr-1 hidden rounded p-1 text-[#64748B] hover:text-[#2563EB] group-hover:block"><Settings2 className="h-3.5 w-3.5" /></button><button title={`Delete ${view.name}`} onClick={() => { setViews((current) => current.filter((item) => item.id !== view.id)); if (activeView === view.name) setActiveView('All Clients'); }} className="mr-2 hidden rounded p-1 text-[#64748B] hover:text-red-600 group-hover:block"><X className="h-3.5 w-3.5" /></button></div>)}
              <div className="my-1 border-t border-[#E2E8F0]" /><button onClick={() => openPanel('views')} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs hover:bg-[#F1F5F9]"><Plus className="h-4 w-4" />Create View</button><button onClick={() => openPanel('folder')} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs hover:bg-[#F1F5F9]"><Folder className="h-4 w-4" />Create Folder</button>
            </div>}
          </div>
          <span className="hidden h-7 border-l border-[#D8E3F1] sm:block" />
          <button title="Create a saved view or folder" onClick={() => setViewMenuOpen((open) => !open)} className="rounded p-2 text-[#475569] hover:bg-[#F1F5F9]"><Columns3 className="h-4 w-4" /></button>
          <button onClick={() => openPanel('views')} className="inline-flex items-center gap-1 px-2 py-2 text-xs font-medium text-[#1E293B] hover:text-[#2563EB]"><Plus className="h-4 w-4" />Add View</button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {currentUser?.role === 'admin' && <button onClick={() => setAdminViewMode('settings')} className={buttonClass}><Settings2 className="h-4 w-4" />Client Settings</button>}
          <button onClick={() => openTask('Client Contact')} className={buttonClass}>Add Contact Task</button>
          <button onClick={() => openTask('Task')} className={buttonClass}>Add Task</button>
          <button onClick={() => openPanel('search')} className="inline-flex items-center gap-2 rounded bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8]"><Search className="h-4 w-4" />Search Client</button>
          <div className="relative">
            <button aria-label="Client tools" aria-expanded={toolsMenuOpen} onClick={() => { setToolsMenuOpen((open) => !open); setViewMenuOpen(false); }} className={buttonClass}><Settings2 className="h-4 w-4" /><ChevronDown className="h-3 w-3" /></button>
            {toolsMenuOpen && <div className="absolute right-0 top-full z-30 mt-1 w-48 rounded border border-[#D8E3F1] bg-white p-1 shadow-xl"><button onClick={() => { setToolsMenuOpen(false); showToast('Approvals are up to date.'); }} className="w-full rounded px-3 py-2 text-left text-xs hover:bg-[#F1F5F9]">Approvals</button><button onClick={() => { setToolsMenuOpen(false); showToast('Client licenses are up to date.'); }} className="w-full rounded px-3 py-2 text-left text-xs hover:bg-[#F1F5F9]">Licenses</button></div>}
          </div>
        </div>
      </div>
    </div>

    <section className="px-4 pb-4 pt-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center">
          <select aria-label="Search clients by" value={searchBy} onChange={(event) => setSearchBy(event.target.value)} className="h-9 rounded-l border border-[#CBD5E1] bg-white px-3 text-xs outline-none focus:border-[#2563EB]"><option>Search Any</option>{CLIENT_COLUMNS.map((column) => <option key={column.key}>{column.label}</option>)}</select>
          <label className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search clients" className="h-9 w-[min(290px,65vw)] rounded-r border border-l-0 border-[#CBD5E1] bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-[#2563EB]" /></label>
          {locationSearch && <button onClick={resetClientSearch} className="ml-2 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-medium text-[#2563EB]">Location search active ×</button>}
        </div>
        <div className="flex items-center gap-2">
          <button title="Edit Filters" onClick={() => { setBusinessUnitDraft(businessUnits); setFilterDraft(appliedFilters); openPanel('filters'); }} className="rounded border border-[#CBD5E1] bg-white p-2 hover:bg-[#F8FAFC]"><SlidersHorizontal className="h-4 w-4" /></button>
          <button title="Edit Columns" onClick={() => { setColumnSearch(''); openPanel('columns'); }} className="rounded border border-[#CBD5E1] bg-white p-2 hover:bg-[#F8FAFC]"><Columns3 className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="overflow-hidden rounded border border-[#D8E3F1] bg-white shadow-sm">
        <div className="max-h-[calc(100vh-255px)] min-h-[360px] overflow-auto">
          <table className="w-full min-w-[1250px] border-collapse text-left text-[11px]">
            <thead className="sticky top-0 z-10 bg-[#F7F9FB] text-[#334155]"><tr className="border-y border-[#D8E3F1]">
              <th className="w-9 px-3 py-3"><input aria-label="Select all visible clients" type="checkbox" checked={visibleClients.length > 0 && visibleClients.every((client) => selected.includes(client.id))} onChange={(event) => selectAllVisible(event.target.checked)} /></th>
              <th className="w-24 px-3 py-3 font-semibold uppercase tracking-wide">Actions</th>
              {visibleColumns.map((column) => <th key={column.key} className="whitespace-nowrap px-3 py-3 font-semibold uppercase tracking-wide"><button onClick={() => setSort((current) => ({ key: column.key, direction: current.key === column.key && current.direction === 'asc' ? 'desc' : 'asc' }))} className="inline-flex items-center gap-1 hover:text-[#2563EB]">{column.label}{sort.key === column.key ? sort.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" /> : <ChevronsUpDown className="h-3 w-3 text-[#94A3B8]" />}</button></th>)}
            </tr></thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {saving && !clients.length && <tr><td colSpan={visibleColumns.length + 2} className="p-10 text-center text-xs text-[#64748B]">Loading clients…</td></tr>}
              {!saving && visibleClients.length === 0 && <tr><td colSpan={visibleColumns.length + 2} className="p-12 text-center text-xs text-[#64748B]">No clients match your search or filters.</td></tr>}
              {visibleClients.map((client) => <tr key={client.id} className={`hover:bg-[#F8FAFC] ${selected.includes(client.id) ? 'bg-blue-50/60' : ''}`}>
                <td className="px-3 py-3"><input aria-label={`Select ${client.name}`} type="checkbox" checked={selected.includes(client.id)} onChange={() => toggleSelected(client.id)} /></td>
                <td className="px-3 py-3"><button title="Open client tasks" onClick={() => { setTaskClientId(client.id); setRelatedTo('Client'); setPanel('task'); }} className="inline-flex min-w-6 items-center justify-center rounded bg-[#3B82F6] px-1.5 py-0.5 text-[10px] font-bold text-white">{tasks.filter((task) => task.clientId === client.id).length || ''}</button></td>
                {visibleColumns.map((column) => {
                  const value = column.value(client);
                  return <td key={column.key} className="max-w-[280px] whitespace-nowrap px-3 py-3 text-[#24354B]" title={value || '—'}>{column.key === 'clientId' ? <button className="font-medium text-[#2563EB] hover:underline" onClick={() => showToast(`Client ${client.clientId}`)}>{value}</button> : column.key === 'name' ? <button className="max-w-[250px] overflow-hidden text-ellipsis font-medium text-[#2563EB] hover:underline" onClick={() => showToast(`${client.name} · ${client.industry}`)}>{value}</button> : column.key === 'website' && value ? <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer" className="text-[#2563EB] hover:underline">{value}</a> : column.key === 'status' ? <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${client.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : client.status === 'Inactive' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700'}`}>{value}</span> : ['createdOn', 'modifiedOn'].includes(column.key) ? formatDate(value) : value || '—'}</td>;
                })}
              </tr>)}
            </tbody>
          </table>
        </div>
        <footer className="flex flex-wrap items-center justify-center gap-3 border-t border-[#D8E3F1] bg-white px-3 py-2.5 text-[11px] text-[#475569]">
          <span>Showing {filteredClients.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredClients.length)} of {filteredClients.length} records</span>
          <button aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded px-2 py-1 hover:bg-[#F1F5F9] disabled:opacity-40">‹</button>
          {Array.from({ length: Math.min(pageCount, 5) }, (_, index) => <button key={index} onClick={() => setPage(index + 1)} className={`rounded px-2.5 py-1 ${page === index + 1 ? 'border border-[#2563EB] text-[#2563EB]' : 'hover:bg-[#F1F5F9]'}`}>{index + 1}</button>)}
          <button aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="rounded px-2 py-1 hover:bg-[#F1F5F9] disabled:opacity-40">›</button>
          <label className="flex items-center gap-2">Per Page<select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded border border-[#CBD5E1] bg-white px-2 py-1"><option>10</option><option>25</option><option>50</option><option>100</option></select></label>
        </footer>
      </div>
    </section>

    {panel && <div className="fixed inset-0 z-[70] flex justify-end bg-[#0F172A]/30" onMouseDown={(event) => { if (event.target === event.currentTarget) setPanel(null); }}>
      {panel === 'filters' && <aside aria-label="Edit client filters" className="flex h-full w-full max-w-[590px] flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4"><h2 className="text-base font-semibold">Edit Filters</h2><button aria-label="Close" onClick={() => setPanel(null)}><X className="h-5 w-5" /></button></header>
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div><label className="mb-2 block text-xs font-medium">Business Unit</label><div className="flex flex-wrap gap-2 rounded border border-[#CBD5E1] p-2">{allBusinessUnits.map((unit) => <label key={unit} className="flex items-center gap-2 rounded-full bg-[#E8EDF4] px-2.5 py-1 text-[11px]"><input type="checkbox" checked={businessUnitDraft.includes(unit)} onChange={(event) => setBusinessUnitDraft((current) => event.target.checked ? [...current, unit] : current.filter((item) => item !== unit))} />{unit}</label>)}{!allBusinessUnits.length && <span className="text-xs text-[#64748B]">No business units on client records.</span>}</div></div>
          <div><div className="mb-3 flex items-center justify-between"><h3 className="text-xs font-semibold">Column Level Filters</h3><button onClick={() => setFilterDraft((current) => [...current, emptyFilter()])} className="inline-flex items-center gap-1 text-xs text-[#2563EB]"><Plus className="h-3.5 w-3.5" />Add Filter</button></div>
            <div className="space-y-2">{filterDraft.map((filter) => <div key={filter.id} className="grid grid-cols-[1fr_1fr_1fr_32px] gap-2"><select value={filter.field} onChange={(event) => setFilterDraft((current) => current.map((item) => item.id === filter.id ? { ...item, field: event.target.value } : item))} className={inputClass}>{CLIENT_COLUMNS.map((column) => <option key={column.key} value={column.key}>{column.label}</option>)}</select><select value={filter.operator} onChange={(event) => setFilterDraft((current) => current.map((item) => item.id === filter.id ? { ...item, operator: event.target.value } : item))} className={inputClass}>{OPERATORS.map((operator) => <option key={operator}>{operator}</option>)}</select><input value={filter.value} disabled={['Is Empty', 'Is Not Empty'].includes(filter.operator)} onChange={(event) => setFilterDraft((current) => current.map((item) => item.id === filter.id ? { ...item, value: event.target.value } : item))} placeholder="Value" className={inputClass} /><button aria-label="Remove filter" onClick={() => setFilterDraft((current) => current.filter((item) => item.id !== filter.id))} className="rounded border border-[#CBD5E1] text-[#64748B] hover:text-red-600"><X className="mx-auto h-4 w-4" /></button></div>)}</div>
          </div>
        </div>
        <footer className="flex justify-end gap-2 border-t border-[#E2E8F0] p-4"><button onClick={() => { setBusinessUnitDraft([]); setFilterDraft([]); }} className={buttonClass}>Reset</button><button onClick={() => { setBusinessUnits(businessUnitDraft); setAppliedFilters(filterDraft); setPage(1); setPanel(null); }} className="rounded bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white">Apply</button></footer>
      </aside>}

      {panel === 'columns' && <aside aria-label="Edit client columns" className="flex h-full w-full max-w-[650px] flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4"><div><h2 className="text-base font-semibold">Edit Columns</h2><p className="mt-1 text-xs text-[#64748B]">Drag selected columns to change their order.</p></div><button aria-label="Close" onClick={() => setPanel(null)}><X className="h-5 w-5" /></button></header>
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-4 p-5">
          <div className="flex min-h-0 flex-col"><h3 className="mb-2 text-xs font-semibold">Available Columns <span className="ml-1 rounded bg-blue-100 px-1.5 py-0.5 text-[#2563EB]">{CLIENT_COLUMNS.length - selectedColumns.length}</span></h3><input value={columnSearch} onChange={(event) => setColumnSearch(event.target.value)} placeholder="Search available columns" className={`${inputClass} mb-2`} /><div className="min-h-0 flex-1 overflow-y-auto rounded border border-[#CBD5E1] p-1">{CLIENT_COLUMNS.filter((column) => !selectedColumns.includes(column.key) && column.label.toLocaleLowerCase().includes(columnSearch.toLocaleLowerCase())).map((column) => <button key={column.key} onClick={() => setSelectedColumns((current) => [...current, column.key])} className="flex w-full items-center justify-between rounded px-2.5 py-2 text-left text-xs hover:bg-blue-50">{column.label}<Plus className="h-3.5 w-3.5 text-[#2563EB]" /></button>)}</div></div>
          <div className="flex min-h-0 flex-col"><h3 className="mb-2 text-xs font-semibold">Selected Columns <span className="ml-1 rounded bg-blue-100 px-1.5 py-0.5 text-[#2563EB]">{selectedColumns.length} of {CLIENT_COLUMNS.length}</span></h3><input value={columnSearch} onChange={(event) => setColumnSearch(event.target.value)} placeholder="Search selected columns" className={`${inputClass} mb-2`} /><div className="min-h-0 flex-1 space-y-1 overflow-y-auto rounded border border-[#CBD5E1] p-1">{selectedColumns.filter((key) => CLIENT_COLUMNS.find((column) => column.key === key)?.label.toLocaleLowerCase().includes(columnSearch.toLocaleLowerCase())).map((key) => { const column = CLIENT_COLUMNS.find((item) => item.key === key); if (!column) return null; return <div key={key} draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', key)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const source = event.dataTransfer.getData('text/plain'); if (!source || source === key) return; setSelectedColumns((current) => { const reordered = [...current]; const from = reordered.indexOf(source); const to = reordered.indexOf(key); if (from < 0 || to < 0) return current; reordered.splice(from, 1); reordered.splice(to, 0, source); return reordered; }); }} className="flex cursor-grab items-center gap-2 rounded border border-[#D8E3F1] bg-[#F8FAFC] px-2.5 py-2 text-xs"><span className="text-[#64748B]">⠿</span><span className="flex-1">{column.label}</span><button aria-label={`Remove ${column.label}`} onClick={() => setSelectedColumns((current) => current.filter((item) => item !== key))} className="text-[#64748B] hover:text-red-600"><X className="h-3.5 w-3.5" /></button></div>; })}</div></div>
        </div>
        <footer className="flex justify-end gap-2 border-t border-[#E2E8F0] p-4"><button onClick={() => { setSelectedColumns(DEFAULT_COLUMNS); setColumnSearch(''); }} className={buttonClass}>Reset</button><button onClick={() => setPanel(null)} className="rounded bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white">Apply</button></footer>
      </aside>}

      {panel === 'search' && <div role="dialog" aria-modal="true" aria-label="Search Client" className="m-auto w-[min(560px,calc(100vw-32px))] rounded-md border border-[#CBD5E1] bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4"><h2 className="text-base font-semibold">Search Client</h2><button aria-label="Close" onClick={() => setPanel(null)}><X className="h-5 w-5" /></button></header>
        <p className="px-5 pt-4 text-xs text-[#64748B]">Filter clients by selecting location, radius, industry, and status.</p>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <label className="space-y-1 text-[11px] font-medium">Country<input value={searchCountry} onChange={(event) => setSearchCountry(event.target.value)} placeholder="Country" className={inputClass} /></label>
          <label className="space-y-1 text-[11px] font-medium">City, Zip Code<input value={searchCity} onChange={(event) => setSearchCity(event.target.value)} placeholder="Search city or postal code" className={inputClass} /></label>
          <label className="space-y-1 text-[11px] font-medium">Radius (miles)<input type="number" min="1" value={searchRadius} onChange={(event) => setSearchRadius(event.target.value)} placeholder="Enter radius in miles" className={inputClass} /></label>
          <label className="space-y-1 text-[11px] font-medium">Category<select value={searchCategory} onChange={(event) => setSearchCategory(event.target.value)} className={inputClass}><option value="">Select</option>{[...new Set(clients.map((client) => client.category || client.tier))].map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="space-y-1 text-[11px] font-medium sm:col-span-2">Industry<select value={searchIndustry} onChange={(event) => setSearchIndustry(event.target.value)} className={inputClass}><option value="">Select</option>{[...new Set(clients.map((client) => client.industry).filter(Boolean))].map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="space-y-1 text-[11px] font-medium sm:col-span-2">Status<select value={searchStatus} onChange={(event) => setSearchStatus(event.target.value)} className={inputClass}><option value="">Select</option><option>Active</option><option>Prospect</option><option>Inactive</option></select></label>
        </div>
        <footer className="flex justify-end gap-2 border-t border-[#E2E8F0] p-4"><button onClick={resetClientSearch} className={buttonClass}>Reset</button><button onClick={applyClientSearch} className="rounded bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white">Search</button></footer>
      </div>}

      {panel === 'views' && <div role="dialog" aria-modal="true" aria-label="Create client view" className="m-auto w-[min(440px,calc(100vw-32px))] rounded-md bg-white shadow-2xl"><header className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4"><h2 className="text-base font-semibold">{editingViewId ? 'Edit View' : 'Create View'}</h2><button onClick={() => { setPanel(null); setEditingViewId(null); }} aria-label="Close"><X className="h-5 w-5" /></button></header><form onSubmit={createView} className="space-y-4 p-5"><label className="block space-y-1 text-xs font-medium">View Name<input required autoFocus value={newViewName} onChange={(event) => setNewViewName(event.target.value)} className={inputClass} placeholder="e.g. Active Strategic Clients" /></label><label className="block space-y-1 text-xs font-medium">Folder<select value={viewFolder} onChange={(event) => setViewFolder(event.target.value)} className={inputClass}><option value="">No folder</option>{folders.map((folder) => <option key={folder}>{folder}</option>)}</select></label><p className="text-[11px] text-[#64748B]">Saves the current columns, business unit selection, and filters.</p><footer className="flex justify-end gap-2"><button type="button" onClick={() => { setPanel(null); setEditingViewId(null); }} className={buttonClass}>Cancel</button><button className="rounded bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white">{editingViewId ? 'Save Changes' : 'Save View'}</button></footer></form></div>}

      {panel === 'folder' && <div role="dialog" aria-modal="true" aria-label="Create folder" className="m-auto w-[min(400px,calc(100vw-32px))] rounded-md bg-white shadow-2xl"><header className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4"><h2 className="text-base font-semibold">Create Folder</h2><button onClick={() => setPanel(null)} aria-label="Close"><X className="h-5 w-5" /></button></header><form onSubmit={createFolder} className="space-y-4 p-5"><label className="block space-y-1 text-xs font-medium">Folder Name<input required autoFocus value={newFolderName} onChange={(event) => setNewFolderName(event.target.value)} className={inputClass} placeholder="Folder name" /></label><footer className="flex justify-end gap-2"><button type="button" onClick={() => setPanel(null)} className={buttonClass}>Cancel</button><button className="rounded bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white">Create Folder</button></footer></form></div>}

      {panel === 'task' && <aside aria-label="Create New Task" className="flex h-full w-full max-w-[820px] flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4"><h2 className="text-base font-semibold">Create New Task</h2><button aria-label="Close" onClick={() => setPanel(null)}><X className="h-5 w-5" /></button></header>
        <div className="grid min-h-0 flex-1 md:grid-cols-[2fr_0.9fr]">
          <form id="client-task-form" onSubmit={saveTask} className="min-h-0 space-y-3 overflow-y-auto p-5">
            <div className="grid grid-cols-[1fr_120px] gap-2"><label className="space-y-1 text-[11px] font-medium">Title <b className="text-red-500">*</b><input required value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Enter Title" className={inputClass} /></label><label className="space-y-1 text-[11px] font-medium">Priority<select value={taskPriority} onChange={(event) => setTaskPriority(event.target.value as Priority)} className={inputClass}>{(['Urgent', 'High', 'Medium', 'Low'] as Priority[]).map((value) => <option key={value}>{value}</option>)}</select></label></div>
            <label className="block space-y-1 text-[11px] font-medium">Description <b className="text-red-500">*</b><textarea required rows={3} value={taskDescription} onChange={(event) => setTaskDescription(event.target.value)} placeholder="Enter a brief description of the task" className={inputClass} /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-[11px] font-medium">Business Unit<select value={taskBusinessUnit} onChange={(event) => setTaskBusinessUnit(event.target.value)} className={inputClass}><option value="">Select</option>{[...new Set([currentUser?.businessUnit || '', ...allBusinessUnits].filter(Boolean))].map((value) => <option key={value}>{value}</option>)}</select></label>
              <label className="space-y-1 text-[11px] font-medium">Task Type <b className="text-red-500">*</b><select value={taskType} onChange={(event) => setTaskType(event.target.value)} className={inputClass}>{['Call', 'Email', 'Meeting', 'Follow-up', 'Other'].map((value) => <option key={value}>{value}</option>)}</select></label>
              <label className="space-y-1 text-[11px] font-medium">Task Category<select value={taskCategory} onChange={(event) => setTaskCategory(event.target.value)} className={inputClass}>{['Client Follow-up', 'Business Review', 'Client Review', 'Contract Renewal', 'Other'].map((value) => <option key={value}>{value}</option>)}</select></label>
              <label className="space-y-1 text-[11px] font-medium">Related To<select value={relatedTo} onChange={(event) => setRelatedTo(event.target.value as 'Client' | 'Client Contact')} className={inputClass}><option>Client</option><option>Client Contact</option></select></label>
              <label className="space-y-1 text-[11px] font-medium">Client <b className="text-red-500">*</b><select required value={taskClientId} onChange={(event) => { setTaskClientId(event.target.value); setTaskContactName(''); }} className={inputClass}><option value="">Search and select Client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
              {relatedTo === 'Client Contact' && <label className="space-y-1 text-[11px] font-medium">Contacts <b className="text-red-500">*</b><select required value={taskContactName} onChange={(event) => setTaskContactName(event.target.value)} disabled={!clientContacts.length} className={inputClass}><option value="">{clientContacts.length ? 'Select Contact' : 'Choose the client to view'}</option>{clientContacts.map((contact) => <option key={contact}>{contact}</option>)}</select></label>}
              <label className="space-y-1 text-[11px] font-medium">Status<select value={taskStatus} onChange={(event) => setTaskStatus(event.target.value as TaskItem['status'])} className={inputClass}><option>Pending</option><option>In Progress</option><option>Completed</option></select></label>
              <label className="space-y-1 text-[11px] font-medium">Assign To <b className="text-red-500">*</b><input required value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} className={inputClass} /></label>
              <label className="space-y-1 text-[11px] font-medium">Escalate To<input value={escalateTo} onChange={(event) => setEscalateTo(event.target.value)} className={inputClass} placeholder="Select" /></label>
              <label className="space-y-1 text-[11px] font-medium">Reminder<select value={reminder} onChange={(event) => setReminder(event.target.value)} className={inputClass}><option value="">Select</option><option>At due time</option><option>15 minutes before</option><option>1 hour before</option><option>1 day before</option></select></label>
              <label className="space-y-1 text-[11px] font-medium">Ownership<input value={ownership} onChange={(event) => setOwnership(event.target.value)} className={inputClass} placeholder="Select" /></label>
              <label className="space-y-1 text-[11px] font-medium">Due Date <b className="text-red-500">*</b><input required type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className={inputClass} /></label>
            </div>
            <div className="space-y-2 pt-1">{[[notifyViaEmail, setNotifyViaEmail, 'Notify via Email', 'Send email notifications to assignees'], [recurringTask, setRecurringTask, 'Recurring Task', 'Set task to repeat automatically'], [showOnCalendar, setShowOnCalendar, 'Show on Event Calendar', 'Display task in calendar view']].map(([checked, setChecked, label, description]) => <label key={String(label)} className="flex cursor-pointer items-center justify-between rounded border border-[#CBD5E1] px-3 py-2.5"><span><span className="block text-xs font-medium">{String(label)}</span><span className="mt-0.5 block text-[10px] text-[#64748B]">{String(description)}</span></span><input type="checkbox" checked={Boolean(checked)} onChange={(event) => (setChecked as React.Dispatch<React.SetStateAction<boolean>>)(event.target.checked)} /></label>)}</div>
          </form>
          <section className="hidden min-h-0 overflow-y-auto bg-[#F1F3F6] p-4 md:block"><h3 className="text-xs font-semibold">Assigned Tasks</h3><div className="mt-3 space-y-2">{tasks.filter((task) => task.clientId === taskClientId && taskClientId).length ? tasks.filter((task) => task.clientId === taskClientId).map((task) => <article key={task.id} className="rounded border border-[#E2E8F0] bg-white p-3"><p className="text-xs font-medium">{task.title}</p><p className="mt-1 text-[10px] text-[#64748B]">{task.status} · {task.dueDate}</p></article>) : <p className="text-[11px] text-[#475569]">No assigned tasks available for this record.</p>}</div></section>
        </div>
        <footer className="flex justify-end gap-2 border-t border-[#E2E8F0] p-4"><button onClick={() => setPanel(null)} className={buttonClass}>Cancel</button><button form="client-task-form" className="rounded bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white">Create Task</button></footer>
      </aside>}
    </div>}
  </div>;
};
