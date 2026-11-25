import React, { useState } from 'react';
import { Building2, List } from 'lucide-react';
import { ClientLookups } from './client-settings/ClientLookups';
import { ClientContactVisibility } from './client-settings/ClientContactVisibility';
import { ClientDocumentTypes } from './client-settings/ClientDocumentTypes';
import { ClientGeneralSettingsView } from './client-settings/ClientGeneralSettings';

export const clientSubmodules = [
  'Client Lookups',
  'Client Contact Visibility',
  'Client Document Types',
  'Client Settings'
] as const;

export type ClientSubmodule = (typeof clientSubmodules)[number];

interface ClientAdminProps {
  onSwitchToDirectory?: () => void;
  showDirectoryTab?: boolean;
}

export const ClientAdmin: React.FC<ClientAdminProps> = ({
  onSwitchToDirectory,
  showDirectoryTab = true
}) => {
  const [activeSubmodule, setActiveSubmodule] =
    useState<ClientSubmodule>('Client Lookups');

  const renderActiveSubmodule = () => {
    switch (activeSubmodule) {
      case 'Client Lookups':
        return <ClientLookups />;
      case 'Client Contact Visibility':
        return <ClientContactVisibility />;
      case 'Client Document Types':
        return <ClientDocumentTypes />;
      case 'Client Settings':
        return <ClientGeneralSettingsView />;
      default:
        return <ClientLookups />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Sticky Submodule Navigation - Following Applicants & Global Settings UI System */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-3 bg-[#FFFFFF] pb-1 dark:bg-[#0F172A]">
        <nav
          aria-label="Client admin submodules"
          className="flex flex-1 overflow-x-auto rounded-xl border border-[#D8E3F1] bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-[#1E293B]"
        >
          {clientSubmodules.map((submodule) => (
            <button
              key={submodule}
              type="button"
              aria-current={activeSubmodule === submodule ? 'page' : undefined}
              onClick={() => setActiveSubmodule(submodule)}
              className={`shrink-0 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors ${
                activeSubmodule === submodule
                  ? 'bg-[#DCE8FF] text-[#125B97] dark:bg-[#475569] dark:text-white'
                  : 'text-[#475569] hover:bg-[#FFFFFF] hover:text-[#1E293B] dark:text-[#BFDBFE] dark:hover:bg-[#475569]'
              }`}
            >
              {submodule}
            </button>
          ))}
        </nav>

        {showDirectoryTab && onSwitchToDirectory && (
          <button
            type="button"
            onClick={onSwitchToDirectory}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#D8E3F1] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#125B97] shadow-sm transition-colors hover:bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#93C5FD]"
            title="Switch to Enterprise Accounts Directory"
          >
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Accounts Directory</span>
          </button>
        )}
      </div>

      {/* Main Submodule Content */}
      <div className="w-full">{renderActiveSubmodule()}</div>
    </div>
  );
};
