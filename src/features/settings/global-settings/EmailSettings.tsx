import React, { useState } from 'react';
import {
  Activity,
  CheckCircle,
  Clock3,
  Mail,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X
} from 'lucide-react';
import {
  MassMailItem,
  INITIAL_MASS_MAIL,
  INITIAL_EMAIL_CLEANUP_CREDITS,
  EmailCleanupItem,
  INITIAL_MISC_EMAIL_SETTINGS,
  MiscEmailSettings
} from '../../../services/globalSettingsMockData';

type EmailTab = 'Email Cleanups' | 'Disclaimer' | 'Mass Mail' | 'Misc Settings';

export const EmailSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EmailTab>('Email Cleanups');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Email Cleanups state
  const [cleanupCredits, setCleanupCredits] = useState(INITIAL_EMAIL_CLEANUP_CREDITS);
  const [cleanupRecords, setCleanupRecords] = useState<EmailCleanupItem[]>([]);
  const [cleanupSearch, setCleanupSearch] = useState('');
  const [isAllocateCleanupOpen, setIsAllocateCleanupOpen] = useState(false);
  const [selectedUserForCleanup, setSelectedUserForCleanup] = useState('');
  const [cleanupCreditsToAllocate, setCleanupCreditsToAllocate] = useState(50);

  // Disclaimer state
  const [disclaimerText, setDisclaimerText] = useState(
    'This message and any attachments are intended solely for the use of the individual or entity to whom they are addressed and may contain confidential information. If you have received this message in error, please immediately notify the sender and delete all copies.'
  );

  // Mass Mail state
  const [massMailRecords, setMassMailRecords] = useState<MassMailItem[]>(INITIAL_MASS_MAIL);
  const [massMailSearch, setMassMailSearch] = useState('');
  const [isAllocateMassMailOpen, setIsAllocateMassMailOpen] = useState(false);
  const [massMailUserName, setMassMailUserName] = useState('');
  const [massMailType, setMassMailType] = useState<'Individual' | 'Team'>('Individual');
  const [massMailCredits, setMassMailCredits] = useState(1000);
  const [massMailRenewal, setMassMailRenewal] = useState<
    'Daily' | 'Monthly' | 'Weekly' | 'Quarterly'
  >('Monthly');

  // Misc Settings state
  const [miscSettings, setMiscSettings] = useState<MiscEmailSettings>(INITIAL_MISC_EMAIL_SETTINGS);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const sampleUsers = [
    'Abhishek Bhalerao',
    'Ajay Sanap',
    'Akansh Malaviya',
    'Akshay Jadhav',
    'Akshay Shinde',
    'Akshay Najan',
    'Akshaydeep Divekar',
    'Aliza Shaikh',
    'Gaurav Mahadik',
    'Sachin Wadeyar'
  ];

  // Allocation handler for Cleanups
  const handleSaveCleanupAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForCleanup) return;

    const newRecord: EmailCleanupItem = {
      id: `ec-${Date.now()}`,
      userName: selectedUserForCleanup,
      email: `${selectedUserForCleanup.toLowerCase().replace(/\s+/g, '.')}@ampcustech.com`,
      phone: '+1 408-555-0199',
      allocatedCredits: cleanupCreditsToAllocate,
      availableCredits: cleanupCreditsToAllocate,
      allocatedBy: 'Sachin Wadeyar',
      allocatedOn: new Date().toLocaleDateString('en-GB')
    };

    setCleanupRecords([newRecord, ...cleanupRecords]);
    setCleanupCredits((prev) => ({
      ...prev,
      available: Math.max(0, prev.available - cleanupCreditsToAllocate)
    }));
    setIsAllocateCleanupOpen(false);
    setSelectedUserForCleanup('');
    showToast(`Allocated ${cleanupCreditsToAllocate} credits to ${selectedUserForCleanup}`);
  };

  // Mass Mail allocate handler
  const handleSaveMassMailAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!massMailUserName) return;

    const newRecord: MassMailItem = {
      id: `mm-${Date.now()}`,
      name: massMailUserName,
      type: massMailType,
      allocatedCredits: massMailCredits,
      renewalCredits: massMailCredits,
      availableCredits: massMailCredits,
      usedCredits: 0,
      allocatedBy: 'Sachin Wadeyar',
      allocatedOn: new Date().toLocaleDateString('en-GB'),
      renewalType: massMailRenewal,
      renewalStatus: 'ON'
    };

    setMassMailRecords([newRecord, ...massMailRecords]);
    setIsAllocateMassMailOpen(false);
    setMassMailUserName('');
    showToast(`Allocated ${massMailCredits} Mass Mail credits`);
  };

  const handleDeleteMassMail = (id: string) => {
    setMassMailRecords(massMailRecords.filter((r) => r.id !== id));
    showToast('Allocation removed');
  };

  const handleDeleteAllMassMail = () => {
    setMassMailRecords([]);
    showToast('All allocations deleted');
  };

  const handleMiscSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Mass email preferences saved successfully.');
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#1E293B]">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed right-6 top-20 z-[90] flex items-center gap-2 rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2.5 text-xs text-white shadow-xl animate-in fade-in">
          <CheckCircle className="h-4 w-4 text-[#8AC9A7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sub-tabs - Matching Applicants Lookup Categories Navigation */}
      <nav
        aria-label="Email settings categories"
        className="flex overflow-x-auto border-b border-[#D8E3F1] bg-white px-2 dark:border-[#334155] dark:bg-[#1E293B]"
      >
        {(['Email Cleanups', 'Disclaimer', 'Mass Mail', 'Misc Settings'] as EmailTab[]).map(
          (tab) => (
            <button
              key={tab}
              type="button"
              aria-current={activeTab === tab ? 'page' : undefined}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === tab
                  ? 'border-[#125B97] text-[#125B97] dark:border-[#60A5FA] dark:text-[#93C5FD]'
                  : 'border-transparent text-[#475569] hover:text-[#1E293B] dark:text-[#BFDBFE] dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          )
        )}
      </nav>

      {/* Tab 1: Email Cleanups */}
      {activeTab === 'Email Cleanups' && (
        <div className="space-y-4 p-4 sm:p-5">
          {/* Action Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex h-10 w-full max-w-sm items-center gap-2 rounded-xl border border-[#D8E3F1] bg-[#FFFFFF]/60 px-3 text-[#64748B] transition-colors focus-within:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#BFDBFE]">
              <Search className="h-4 w-4 shrink-0" />
              <input
                value={cleanupSearch}
                onChange={(e) => setCleanupSearch(e.target.value)}
                placeholder="Search allocations..."
                className="min-w-0 flex-1 bg-transparent text-xs text-[#1E293B] outline-none placeholder:text-[#64748B] dark:text-white"
              />
            </label>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => showToast('Viewing allocation history')}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D8E3F1] bg-white px-3 text-xs font-semibold text-[#334155] transition-colors hover:bg-[#FFFFFF] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white dark:hover:bg-[#475569]"
              >
                <span>Allocation History</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAllocateCleanupOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
              >
                <Plus className="h-4 w-4" />
                <span>Allocate Credits</span>
              </button>
            </div>
          </div>

          {/* Credits Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-[#D8E3F1] bg-[#F8FAFC] p-3.5 dark:border-[#334155] dark:bg-[#0F172A]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#BFDBFE]">
                Purchased Credits
              </p>
              <p className="mt-1 text-xl font-bold text-[#1E40AF] dark:text-[#60A5FA]">
                {cleanupCredits.purchased}
              </p>
            </div>
            <div className="rounded-xl border border-[#D8E3F1] bg-[#F8FAFC] p-3.5 dark:border-[#334155] dark:bg-[#0F172A]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#BFDBFE]">
                Used Credits
              </p>
              <p className="mt-1 text-xl font-bold text-rose-600 dark:text-rose-400">
                {cleanupCredits.used}
              </p>
            </div>
            <div className="rounded-xl border border-[#D8E3F1] bg-[#F8FAFC] p-3.5 dark:border-[#334155] dark:bg-[#0F172A]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#BFDBFE]">
                Available Credits
              </p>
              <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {cleanupCredits.available}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto min-h-[200px] rounded-xl border border-[#D8E3F1] dark:border-[#334155]">
            <table className="w-full min-w-[760px] border-collapse text-left text-xs">
              <thead className="sticky top-0 z-10 bg-[#FFFFFF] dark:bg-[#334155]">
                <tr className="border-b border-[#D8E3F1] text-[10px] uppercase tracking-[0.12em] text-[#64748B] dark:border-[#334155] dark:text-[#BFDBFE]">
                  <th scope="col" className="px-4 py-3.5 font-semibold">User Name</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Email</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Phone</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Allocated</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Available</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Allocated By</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Allocated On</th>
                  <th scope="col" className="w-20 px-4 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                {cleanupRecords.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-[#F8FAFC] dark:hover:bg-[#334155]">
                    <td className="px-4 py-3.5 font-semibold text-[#1E293B] dark:text-white">{r.userName}</td>
                    <td className="px-4 py-3.5 text-[#475569] dark:text-[#BFDBFE]">{r.email}</td>
                    <td className="px-4 py-3.5 text-[#475569] dark:text-[#BFDBFE]">{r.phone}</td>
                    <td className="px-4 py-3.5 font-medium">{r.allocatedCredits}</td>
                    <td className="px-4 py-3.5 font-medium text-emerald-600">{r.availableCredits}</td>
                    <td className="px-4 py-3.5 text-[#475569]">{r.allocatedBy}</td>
                    <td className="px-4 py-3.5 tabular-nums text-[#64748B]">{r.allocatedOn}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setCleanupRecords(cleanupRecords.filter((c) => c.id !== r.id))}
                        className="rounded-lg p-2 text-[#64748B] hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {cleanupRecords.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-xs text-[#64748B]">
                      No allocation records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Disclaimer */}
      {activeTab === 'Disclaimer' && (
        <div className="p-5 max-w-3xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#1E293B] dark:text-white">
              Global Email Disclaimer Notice
            </h3>
            <p className="mt-1 text-xs text-[#64748B]">
              This statement will automatically appear in the footer of candidate and client emails dispatched from the ATS.
            </p>
          </div>

          <textarea
            rows={7}
            value={disclaimerText}
            onChange={(e) => setDisclaimerText(e.target.value)}
            className="w-full rounded-xl border border-[#D8E3F1] bg-white p-3 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
          />

          <button
            type="button"
            onClick={() => showToast('Email disclaimer saved.')}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
          >
            <Save className="h-4 w-4" />
            <span>Save Disclaimer</span>
          </button>
        </div>
      )}

      {/* Tab 3: Mass Mail */}
      {activeTab === 'Mass Mail' && (
        <div className="space-y-4 p-4 sm:p-5">
          {/* Action Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex h-10 w-full max-w-sm items-center gap-2 rounded-xl border border-[#D8E3F1] bg-[#FFFFFF]/60 px-3 text-[#64748B] transition-colors focus-within:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#BFDBFE]">
              <Search className="h-4 w-4 shrink-0" />
              <input
                value={massMailSearch}
                onChange={(e) => setMassMailSearch(e.target.value)}
                placeholder="Search allocations..."
                className="min-w-0 flex-1 bg-transparent text-xs text-[#1E293B] outline-none placeholder:text-[#64748B] dark:text-white"
              />
            </label>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleDeleteAllMassMail}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900/60 dark:bg-[#1E293B] dark:text-rose-400"
              >
                <span>Delete All</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAllocateMassMailOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
              >
                <Plus className="h-4 w-4" />
                <span>Allocate Credits</span>
              </button>
            </div>
          </div>

          {/* Metrics bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-[#D8E3F1] bg-[#F8FAFC] p-3 dark:border-[#334155] dark:bg-[#0F172A]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">Available Credits</p>
              <p className="mt-1 text-lg font-bold text-emerald-600">99,993</p>
            </div>
            <div className="rounded-xl border border-[#D8E3F1] bg-[#F8FAFC] p-3 dark:border-[#334155] dark:bg-[#0F172A]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">Allocated Credits</p>
              <p className="mt-1 text-lg font-bold text-[#1E40AF]">99,010</p>
            </div>
            <div className="rounded-xl border border-[#D8E3F1] bg-[#F8FAFC] p-3 dark:border-[#334155] dark:bg-[#0F172A]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">Credits Used</p>
              <p className="mt-1 text-lg font-bold text-amber-600">7</p>
            </div>
            <div className="rounded-xl border border-[#D8E3F1] bg-[#F8FAFC] p-3 dark:border-[#334155] dark:bg-[#0F172A]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">Balance</p>
              <p className="mt-1 text-lg font-bold text-rose-600">99,003</p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto min-h-[220px] rounded-xl border border-[#D8E3F1] dark:border-[#334155]">
            <table className="w-full min-w-[860px] border-collapse text-left text-xs">
              <thead className="sticky top-0 z-10 bg-[#FFFFFF] dark:bg-[#334155]">
                <tr className="border-b border-[#D8E3F1] text-[10px] uppercase tracking-[0.12em] text-[#64748B] dark:border-[#334155] dark:text-[#BFDBFE]">
                  <th scope="col" className="px-4 py-3.5 font-semibold">Name</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Type</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Allocated</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Renewal</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Available</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Used</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Allocated By</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Cycle</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Status</th>
                  <th scope="col" className="w-24 px-4 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                {massMailRecords.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-[#F8FAFC] dark:hover:bg-[#334155]">
                    <td className="px-4 py-3.5 font-semibold text-[#1E293B] dark:text-white">{item.name}</td>
                    <td className="px-4 py-3.5 text-[#475569]">{item.type}</td>
                    <td className="px-4 py-3.5 font-medium">{item.allocatedCredits.toLocaleString()}</td>
                    <td className="px-4 py-3.5">{item.renewalCredits.toLocaleString()}</td>
                    <td className="px-4 py-3.5 font-medium text-emerald-600">{item.availableCredits.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-[#64748B]">{item.usedCredits}</td>
                    <td className="px-4 py-3.5 text-[#475569]">{item.allocatedBy}</td>
                    <td className="px-4 py-3.5">{item.renewalType}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        {item.renewalStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => showToast(`Added extra credits to ${item.name}`)}
                          className="rounded-lg p-1.5 text-[#475569] hover:bg-[#FFFFFF] hover:text-[#125B97]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMassMail(item.id)}
                          className="rounded-lg p-1.5 text-[#64748B] hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Misc Settings */}
      {activeTab === 'Misc Settings' && (
        <form onSubmit={handleMiscSave} className="p-5 max-w-3xl space-y-5 text-xs">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1E40AF] dark:text-[#60A5FA]">
              Email Automation Rules
            </p>
            <h3 className="mt-1 text-base font-bold text-[#1E293B] dark:text-white">
              Mass Email Column Selections
            </h3>
          </div>

          <div className="space-y-4">
            <label className="block space-y-1.5 font-semibold text-[#334155] dark:text-[#BFDBFE]">
              <span>Job Share Default Fields</span>
              <p className="text-[11px] font-normal text-[#64748B]">
                Default fields included when jobs are shared via mass email.
              </p>
              <select className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-xs font-normal text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white">
                <option value="">Select a Field</option>
                <option value="Job Code">Job Code</option>
                <option value="Job Title">Job Title</option>
                <option value="Location">Location</option>
                <option value="Client">Client</option>
                <option value="Pay Rate">Pay Rate</option>
              </select>
            </label>

            <label className="block space-y-1.5 font-semibold text-[#334155] dark:text-[#BFDBFE]">
              <span>Hotlist Default Fields</span>
              <p className="text-[11px] font-normal text-[#64748B]">
                Default fields included when hotlists are shared.
              </p>
              <select className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-xs font-normal text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white">
                <option value="">Select a Field</option>
                <option value="Candidate Name">Candidate Name</option>
                <option value="Primary Skills">Primary Skills</option>
                <option value="Total Experience">Total Experience</option>
                <option value="Current Location">Current Location</option>
              </select>
            </label>

            <label className="block space-y-1.5 font-semibold text-[#334155] dark:text-[#BFDBFE]">
              <span>Applicable Roles</span>
              <p className="text-[11px] font-normal text-[#64748B]">
                Roles that can override default email merge columns on profile view.
              </p>
              <select className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-xs font-normal text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white">
                <option value="">Select a Role</option>
                <option value="Administrator">Administrator</option>
                <option value="Practice Lead">Practice Lead</option>
                <option value="Technical Recruiter">Technical Recruiter</option>
              </select>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block space-y-1.5 font-semibold text-[#334155] dark:text-[#BFDBFE]">
                <span>Default Email Merge Count (Max 999)</span>
                <input
                  type="number"
                  max={999}
                  min={1}
                  value={miscSettings.defaultEmailMergeCount}
                  onChange={(e) =>
                    setMiscSettings({
                      ...miscSettings,
                      defaultEmailMergeCount: Number(e.target.value)
                    })
                  }
                  className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-xs font-normal text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
                />
              </label>

              <label className="block space-y-1.5 font-semibold text-[#334155] dark:text-[#BFDBFE]">
                <span>Candidate Mail Merge Rate Limit / Day</span>
                <input
                  type="number"
                  min={1}
                  value={miscSettings.limitMailMergeNotificationsToCandidate}
                  onChange={(e) =>
                    setMiscSettings({
                      ...miscSettings,
                      limitMailMergeNotificationsToCandidate: Number(e.target.value)
                    })
                  }
                  className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-xs font-normal text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
                />
              </label>
            </div>
          </div>

          <div className="border-t border-[#D8E3F1] pt-4 dark:border-[#334155]">
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
            >
              <Save className="h-4 w-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      )}

      {/* Allocate Credits Dialog */}
      {(isAllocateCleanupOpen || isAllocateMassMailOpen) && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0F172A]/55 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setIsAllocateCleanupOpen(false);
              setIsAllocateMassMailOpen(false);
            }
          }}
        >
          <div className="w-full max-w-md space-y-5 rounded-2xl border border-[#D8E3F1] bg-white p-5 shadow-2xl dark:border-[#334155] dark:bg-[#1E293B] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1E40AF] dark:text-[#60A5FA]">
                  Credit Allocation
                </p>
                <h2 className="mt-1 text-lg font-bold text-[#1E293B] dark:text-white">
                  {isAllocateCleanupOpen ? 'Allocate Email Cleanup Credits' : 'Allocate Mass Mail Credits'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAllocateCleanupOpen(false);
                  setIsAllocateMassMailOpen(false);
                }}
                className="rounded-lg p-2 text-[#64748B] hover:bg-[#FFFFFF] dark:text-[#BFDBFE] dark:hover:bg-[#475569]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isAllocateCleanupOpen && (
              <form onSubmit={handleSaveCleanupAllocation} className="space-y-4 text-xs">
                <label className="block space-y-1.5 font-semibold text-[#334155] dark:text-[#BFDBFE]">
                  <span>User</span>
                  <select
                    required
                    value={selectedUserForCleanup}
                    onChange={(e) => setSelectedUserForCleanup(e.target.value)}
                    className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-xs font-normal text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
                  >
                    <option value="">Select Recruiter / User</option>
                    {sampleUsers.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1.5 font-semibold text-[#334155] dark:text-[#BFDBFE]">
                  <span>Credits Quantity</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={cleanupCreditsToAllocate}
                    onChange={(e) => setCleanupCreditsToAllocate(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-xs font-normal text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
                  />
                </label>
                <div className="flex justify-end gap-2 border-t border-[#D8E3F1] pt-4 dark:border-[#334155]">
                  <button
                    type="button"
                    onClick={() => setIsAllocateCleanupOpen(false)}
                    className="rounded-xl border border-[#D8E3F1] px-4 py-2.5 text-xs font-semibold text-[#475569] hover:bg-[#FFFFFF] dark:border-[#334155] dark:text-[#BFDBFE] dark:hover:bg-[#475569]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#1D4ED8]"
                  >
                    Allocate
                  </button>
                </div>
              </form>
            )}

            {isAllocateMassMailOpen && (
              <form onSubmit={handleSaveMassMailAllocation} className="space-y-4 text-xs">
                <label className="block space-y-1.5 font-semibold text-[#334155] dark:text-[#BFDBFE]">
                  <span>Team / Recruiter Name</span>
                  <select
                    required
                    value={massMailUserName}
                    onChange={(e) => setMassMailUserName(e.target.value)}
                    className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-xs font-normal text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
                  >
                    <option value="">Select Recruiter or Team</option>
                    {sampleUsers.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                    <option value="Enterprise Practice">Enterprise Practice</option>
                    <option value="Sourcing Squad">Sourcing Squad</option>
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block space-y-1.5 font-semibold text-[#334155] dark:text-[#BFDBFE]">
                    <span>Credits</span>
                    <input
                      type="number"
                      required
                      min={1}
                      value={massMailCredits}
                      onChange={(e) => setMassMailCredits(Number(e.target.value))}
                      className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-xs font-normal text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
                    />
                  </label>
                  <label className="block space-y-1.5 font-semibold text-[#334155] dark:text-[#BFDBFE]">
                    <span>Renewal Period</span>
                    <select
                      value={massMailRenewal}
                      onChange={(e) =>
                        setMassMailRenewal(
                          e.target.value as 'Daily' | 'Monthly' | 'Weekly' | 'Quarterly'
                        )
                      }
                      className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-xs font-normal text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                    </select>
                  </label>
                </div>
                <div className="flex justify-end gap-2 border-t border-[#D8E3F1] pt-4 dark:border-[#334155]">
                  <button
                    type="button"
                    onClick={() => setIsAllocateMassMailOpen(false)}
                    className="rounded-xl border border-[#D8E3F1] px-4 py-2.5 text-xs font-semibold text-[#475569] hover:bg-[#FFFFFF] dark:border-[#334155] dark:text-[#BFDBFE] dark:hover:bg-[#475569]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#1D4ED8]"
                  >
                    Allocate Credits
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
