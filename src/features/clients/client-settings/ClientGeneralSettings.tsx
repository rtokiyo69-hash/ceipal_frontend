import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle,
  Clock3,
  Search,
  X,
  ChevronDown
} from 'lucide-react';
import {
  ClientGeneralSettings,
  INITIAL_CLIENT_SETTINGS,
  AVAILABLE_PORTAL_APPLICATION_STATUSES,
  ClientActivityLogItem,
  INITIAL_CLIENT_ACTIVITIES
} from '../../../services/clientSettingsMockData';
import { useAppStore } from '../../../store/appStore';

export const ClientGeneralSettingsView: React.FC = () => {
  const { currentUser } = useAppStore();
  const [settings, setSettings] = useState<ClientGeneralSettings>(INITIAL_CLIENT_SETTINGS);
  const [activities, setActivities] = useState<ClientActivityLogItem[]>(INITIAL_CLIENT_ACTIVITIES);
  const [activitiesOpen, setActivitiesOpen] = useState<boolean>(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<boolean>(false);
  const [statusSearch, setStatusSearch] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleApplicationStatus = (status: string) => {
    const current = settings.applicationStatusesToDisplay;
    if (current.includes(status)) {
      setSettings({
        ...settings,
        applicationStatusesToDisplay: current.filter((s) => s !== status)
      });
    } else {
      setSettings({
        ...settings,
        applicationStatusesToDisplay: [...current, status]
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const author = currentUser?.name || 'Sachin Wadeyar';
    const log: ClientActivityLogItem = {
      id: `act-${Date.now()}`,
      action: 'Client Settings Saved',
      user: author,
      timestamp: 'Just now',
      details: 'Updated Client General & Company-level settings.'
    };
    setActivities([log, ...activities]);
    showToast('Client Settings saved successfully.');
  };

  const filteredStatuses = AVAILABLE_PORTAL_APPLICATION_STATUSES.filter((s) =>
    s.toLowerCase().includes(statusSearch.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2.5 text-xs text-white shadow-xl animate-in fade-in">
          <CheckCircle className="h-4 w-4 text-[#8AC9A7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="overflow-visible rounded-2xl border border-[#D8E3F1] bg-white p-6 shadow-sm dark:border-[#334155] dark:bg-[#1E293B]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 dark:border-[#334155]">
          <div>
            <h2 className="text-base font-bold text-[#1E293B] dark:text-white">
              Client Settings
            </h2>
            <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
              Manage global defaults, portal visibility, duplicate handling, and client permissions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActivitiesOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D8E3F1] bg-white px-3.5 py-2 text-xs font-semibold text-[#334155] shadow-sm transition-colors hover:bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white dark:hover:bg-[#334155]"
          >
            <Clock3 className="h-3.5 w-3.5 text-[#64748B]" />
            <span>Activities</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          {/* 1. Display Client Names on Job/Placements */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs font-medium text-[#1E293B] dark:text-slate-200">
                Display Client Names on Job/Placements Irrespective of Visibility in the Clients Module
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.displayClientNamesOnJobPlacements}
              onClick={() =>
                setSettings({
                  ...settings,
                  displayClientNamesOnJobPlacements: !settings.displayClientNamesOnJobPlacements
                })
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.displayClientNamesOnJobPlacements
                  ? 'bg-[#2563EB]'
                  : 'bg-[#CBD5E1] dark:bg-[#475569]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  settings.displayClientNamesOnJobPlacements ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. Default Submission Format */}
          <div className="border-t border-[#E2E8F0] pt-4 dark:border-[#334155]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-xs font-medium text-[#1E293B] dark:text-slate-200">
                  Default Submission Format
                </span>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Select where to configure the default submission format for clients, at the client or client contact level.
                </p>
              </div>
              <div className="flex items-center gap-4">
                {(['Clients', 'Client Contacts'] as const).map((opt) => (
                  <label key={opt} className="flex cursor-pointer items-center gap-2 text-xs text-[#334155] dark:text-slate-200">
                    <input
                      type="radio"
                      name="defaultSubmissionFormat"
                      value={opt}
                      checked={settings.defaultSubmissionFormat === opt}
                      onChange={() =>
                        setSettings({ ...settings, defaultSubmissionFormat: opt })
                      }
                      className="h-3.5 w-3.5 text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Client Default View */}
          <div className="border-t border-[#E2E8F0] pt-4 dark:border-[#334155]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-xs font-medium text-[#1E293B] dark:text-slate-200">
                  Client Default View
                </span>
              </div>
              <div className="flex items-center gap-4">
                {(['Clients', 'Client Contacts'] as const).map((opt) => (
                  <label key={opt} className="flex cursor-pointer items-center gap-2 text-xs text-[#334155] dark:text-slate-200">
                    <input
                      type="radio"
                      name="clientDefaultView"
                      value={opt}
                      checked={settings.clientDefaultView === opt}
                      onChange={() =>
                        setSettings({ ...settings, clientDefaultView: opt })
                      }
                      className="h-3.5 w-3.5 text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Default Client Visibility */}
          <div className="border-t border-[#E2E8F0] pt-4 dark:border-[#334155]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-xs font-medium text-[#1E293B] dark:text-slate-200">
                  Default Client Visibility
                </span>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Sets the default visibility scope for new client records.
                </p>
              </div>
              <div className="flex items-center gap-4">
                {(['Organization Level', 'Business Unit Level'] as const).map((opt) => (
                  <label key={opt} className="flex cursor-pointer items-center gap-2 text-xs text-[#334155] dark:text-slate-200">
                    <input
                      type="radio"
                      name="defaultClientVisibility"
                      value={opt}
                      checked={settings.defaultClientVisibility === opt}
                      onChange={() =>
                        setSettings({ ...settings, defaultClientVisibility: opt })
                      }
                      className="h-3.5 w-3.5 text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Default Send Requirement, Send Hotlist */}
          <div className="border-t border-[#E2E8F0] pt-4 dark:border-[#334155]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-xs font-medium text-[#1E293B] dark:text-slate-200">
                  Default Send Requirement, Send Hotlist
                </span>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  If checked, the options will be enabled by default while creating a new client
                </p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-[#334155] dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={settings.defaultSendRequirement}
                    onChange={(e) =>
                      setSettings({ ...settings, defaultSendRequirement: e.target.checked })
                    }
                    className="h-3.5 w-3.5 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <span>Send Requirement</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs text-[#334155] dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={settings.defaultSendHotlist}
                    onChange={(e) =>
                      setSettings({ ...settings, defaultSendHotlist: e.target.checked })
                    }
                    className="h-3.5 w-3.5 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <span>Send Hotlist</span>
                </label>
              </div>
            </div>
          </div>

          {/* 6. Display Parent Client Instead of Child Client */}
          <div className="border-t border-[#E2E8F0] pt-4 dark:border-[#334155]">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-medium text-[#1E293B] dark:text-slate-200">
                  Do you want to display the parent client instead of child client
                </span>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  If enabled, Parent clients will be displayed while doing the confirmation
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.displayParentClientInsteadOfChild}
                onClick={() =>
                  setSettings({
                    ...settings,
                    displayParentClientInsteadOfChild: !settings.displayParentClientInsteadOfChild
                  })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.displayParentClientInsteadOfChild
                    ? 'bg-[#2563EB]'
                    : 'bg-[#CBD5E1] dark:bg-[#475569]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.displayParentClientInsteadOfChild ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 7. Select Application Statuses to Display from Client Portal */}
          <div className="relative border-t border-[#E2E8F0] pt-4 dark:border-[#334155]" ref={statusDropdownRef}>
            <div className="space-y-1">
              <span className="text-xs font-medium text-[#1E293B] dark:text-slate-200">
                Select application statuses to display when changing the application status from the client portal
              </span>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                (The selected statuses will be available for changing the application status on the client portal.)
              </p>
            </div>

            <div className="mt-2">
              <button
                type="button"
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-[#D8E3F1] bg-white px-3.5 py-2.5 text-left text-xs text-[#1E293B] outline-none transition-colors hover:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
              >
                <div className="flex flex-wrap items-center gap-1.5 overflow-hidden">
                  {settings.applicationStatusesToDisplay.length === 0 ? (
                    <span className="text-[#94A3B8]">Select</span>
                  ) : (
                    settings.applicationStatusesToDisplay.map((st) => (
                      <span
                        key={st}
                        className="inline-flex items-center gap-1 rounded bg-[#DCE8FF] px-2 py-0.5 text-[11px] font-medium text-[#125B97] dark:bg-[#334155] dark:text-white"
                      >
                        <span>{st}</span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleApplicationStatus(st);
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

              {/* Status Dropdown with Search */}
              {statusDropdownOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-xl border border-[#D8E3F1] bg-white p-2 shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]">
                  <div className="relative mb-2">
                    <input
                      type="text"
                      placeholder="Search statuses..."
                      value={statusSearch}
                      onChange={(e) => setStatusSearch(e.target.value)}
                      className="w-full rounded-lg border border-[#D8E3F1] bg-white py-1.5 pl-8 pr-3 text-xs text-[#1E293B] outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
                    />
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#94A3B8]" />
                  </div>

                  <div className="max-h-48 space-y-1 overflow-y-auto">
                    {filteredStatuses.map((st) => (
                      <label
                        key={st}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-[#334155] transition-colors hover:bg-[#F8FAFC] dark:text-slate-200 dark:hover:bg-[#334155]"
                      >
                        <input
                          type="checkbox"
                          checked={settings.applicationStatusesToDisplay.includes(st)}
                          onChange={() => toggleApplicationStatus(st)}
                          className="h-3.5 w-3.5 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                        />
                        <span>{st}</span>
                      </label>
                    ))}
                    {filteredStatuses.length === 0 && (
                      <p className="py-2 text-center text-xs text-[#94A3B8]">No statuses match.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 8. Default Post Job on Career Portal */}
          <div className="border-t border-[#E2E8F0] pt-4 dark:border-[#334155]">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-medium text-[#1E293B] dark:text-slate-200">
                  Default Post Job on Career Portal
                </span>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  (If enabled, the &apos;Post Job on Career Portal&apos; option will be ON by default when a new client is created.)
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.defaultPostJobOnCareerPortal}
                onClick={() =>
                  setSettings({
                    ...settings,
                    defaultPostJobOnCareerPortal: !settings.defaultPostJobOnCareerPortal
                  })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.defaultPostJobOnCareerPortal
                    ? 'bg-[#2563EB]'
                    : 'bg-[#CBD5E1] dark:bg-[#475569]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.defaultPostJobOnCareerPortal ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 9. Company Level Settings Section Card */}
          <div className="rounded-xl border border-[#D8E3F1] bg-[#F8FAFC] p-5 dark:border-[#334155] dark:bg-[#0F172A]/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-white">
              Company Level Settings
            </h3>

            {/* Action if Client Exists */}
            <div className="mt-4 space-y-2">
              <span className="text-xs font-semibold text-[#334155] dark:text-slate-200">
                Action if the Client Exists in the Database
              </span>
              <ul className="list-disc space-y-1 pl-4 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                <li>
                  If Access Required is selected, the system sends an email requesting access to the client record from the primary client owner and/or the administrator (based on the notification configuration).
                </li>
                <li>
                  If Access Not Required is selected, the system automatically gives access to the client record by adding the user as an owner.
                </li>
                <li>
                  If Allow Duplicate is selected, the user will be allowed to create a duplicate client record.
                </li>
              </ul>
              <div className="flex flex-wrap gap-4 pt-2">
                {(['Access Required', 'Access Not Required', 'Allow Duplicates'] as const).map((opt) => (
                  <label key={opt} className="flex cursor-pointer items-center gap-2 text-xs text-[#334155] dark:text-slate-200">
                    <input
                      type="radio"
                      name="actionIfClientExists"
                      value={opt}
                      checked={settings.companyLevelSettings.actionIfClientExists === opt}
                      onChange={() =>
                        setSettings({
                          ...settings,
                          companyLevelSettings: {
                            ...settings.companyLevelSettings,
                            actionIfClientExists: opt
                          }
                        })
                      }
                      className="h-3.5 w-3.5 text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notify This User About Client Record Access */}
            <div className="mt-4 border-t border-[#E2E8F0] pt-4 dark:border-[#334155]">
              <span className="text-xs font-semibold text-[#334155] dark:text-slate-200">
                Notify This User About Client Record Access
              </span>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-[#334155] dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={settings.companyLevelSettings.notifyUserAboutClientRecordAccess.primaryOwner}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        companyLevelSettings: {
                          ...settings.companyLevelSettings,
                          notifyUserAboutClientRecordAccess: {
                            ...settings.companyLevelSettings.notifyUserAboutClientRecordAccess,
                            primaryOwner: e.target.checked
                          }
                        }
                      })
                    }
                    className="h-3.5 w-3.5 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <span>Primary Owner</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs text-[#334155] dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={settings.companyLevelSettings.notifyUserAboutClientRecordAccess.administrator}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        companyLevelSettings: {
                          ...settings.companyLevelSettings,
                          notifyUserAboutClientRecordAccess: {
                            ...settings.companyLevelSettings.notifyUserAboutClientRecordAccess,
                            administrator: e.target.checked
                          }
                        }
                      })
                    }
                    className="h-3.5 w-3.5 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <span>Administrator</span>
                </label>
              </div>
            </div>

            {/* Action if Client Contact Exists */}
            <div className="mt-5 border-t border-[#E2E8F0] pt-4 dark:border-[#334155]">
              <span className="text-xs font-semibold text-[#334155] dark:text-slate-200">
                Action if the Client Contact Exists in the Database
              </span>
              <ul className="list-disc space-y-1 pl-4 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                <li>
                  If Access Required is selected, the system sends an email requesting access to the client contact record from the primary client owner and/or the administrator (based on the notification configuration).
                </li>
                <li>
                  If Allow Duplicate is selected, the user will be allowed to create a duplicate client contact record.
                </li>
              </ul>
              <div className="flex flex-wrap gap-4 pt-2">
                {(['Access Required', 'Allow Duplicates'] as const).map((opt) => (
                  <label key={opt} className="flex cursor-pointer items-center gap-2 text-xs text-[#334155] dark:text-slate-200">
                    <input
                      type="radio"
                      name="actionIfClientContactExists"
                      value={opt}
                      checked={settings.companyLevelSettings.actionIfClientContactExists === opt}
                      onChange={() =>
                        setSettings({
                          ...settings,
                          companyLevelSettings: {
                            ...settings.companyLevelSettings,
                            actionIfClientContactExists: opt
                          }
                        })
                      }
                      className="h-3.5 w-3.5 text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notify these people to get access to client contact record */}
            <div className="mt-4 border-t border-[#E2E8F0] pt-4 dark:border-[#334155]">
              <span className="text-xs font-semibold text-[#334155] dark:text-slate-200">
                Notify these people to get the access to the client contact record
              </span>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-[#334155] dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={settings.companyLevelSettings.notifyPeopleAboutClientContactAccess.primaryOwner}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        companyLevelSettings: {
                          ...settings.companyLevelSettings,
                          notifyPeopleAboutClientContactAccess: {
                            ...settings.companyLevelSettings.notifyPeopleAboutClientContactAccess,
                            primaryOwner: e.target.checked
                          }
                        }
                      })
                    }
                    className="h-3.5 w-3.5 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <span>Primary Owner</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs text-[#334155] dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={settings.companyLevelSettings.notifyPeopleAboutClientContactAccess.administrator}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        companyLevelSettings: {
                          ...settings.companyLevelSettings,
                          notifyPeopleAboutClientContactAccess: {
                            ...settings.companyLevelSettings.notifyPeopleAboutClientContactAccess,
                            administrator: e.target.checked
                          }
                        }
                      })
                    }
                    className="h-3.5 w-3.5 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <span>Administrator</span>
                </label>
              </div>
            </div>
          </div>

          {/* 10. Team Level Settings */}
          <div className="rounded-xl border border-[#D8E3F1] bg-[#F8FAFC] p-5 dark:border-[#334155] dark:bg-[#0F172A]/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-white">
              Team Level Settings
            </h3>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#334155] dark:text-slate-200">
                Enable Team Level Settings?
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={settings.teamLevelSettings.enableTeamLevelSettings}
                onClick={() =>
                  setSettings({
                    ...settings,
                    teamLevelSettings: {
                      enableTeamLevelSettings: !settings.teamLevelSettings.enableTeamLevelSettings
                    }
                  })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.teamLevelSettings.enableTeamLevelSettings
                    ? 'bg-[#2563EB]'
                    : 'bg-[#CBD5E1] dark:bg-[#475569]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.teamLevelSettings.enableTeamLevelSettings ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Sticky/Bottom Save Bar */}
          <div className="border-t border-[#E2E8F0] pt-4 dark:border-[#334155]">
            <button
              type="submit"
              className="rounded-xl bg-[#2563EB] px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
            >
              Save
            </button>
          </div>
        </form>
      </div>

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
    </div>
  );
};
