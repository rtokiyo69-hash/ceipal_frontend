import React, { useState } from 'react';
import { CustomFields } from './global-settings/CustomFields';
import { EmailSettings } from './global-settings/EmailSettings';
import { ConsentSettings } from './global-settings/ConsentSettings';
import { Lookups } from './global-settings/Lookups';
import { MandatoryFields } from './global-settings/MandatoryFields';
import { EncryptionFields } from './global-settings/EncryptionFields';

export const globalSettingsSubmodules = [
  'Custom Fields',
  'Email Settings',
  'Consent Settings',
  'Lookups',
  'Mandatory Fields',
  'Encryption Fields'
] as const;

export type GlobalSettingsSubmodule = (typeof globalSettingsSubmodules)[number];

export const GlobalSettings: React.FC = () => {
  const [activeSubmodule, setActiveSubmodule] =
    useState<GlobalSettingsSubmodule>('Custom Fields');

  const renderActiveSubmodule = () => {
    switch (activeSubmodule) {
      case 'Custom Fields':
        return <CustomFields />;
      case 'Email Settings':
        return <EmailSettings />;
      case 'Consent Settings':
        return <ConsentSettings />;
      case 'Lookups':
        return <Lookups />;
      case 'Mandatory Fields':
        return <MandatoryFields />;
      case 'Encryption Fields':
        return <EncryptionFields />;
      default:
        return <CustomFields />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Sticky Submodule Navigation - Identical to Applicants Module Admin UI */}
      <div className="sticky top-0 z-40 space-y-1 bg-[#FFFFFF] pb-1 dark:bg-[#0F172A]">
        <nav
          aria-label="Global settings submodules"
          className="flex overflow-x-auto rounded-xl border border-[#D8E3F1] bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-[#1E293B]"
        >
          {globalSettingsSubmodules.map((submodule) => (
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
      </div>

      {/* Main View Area */}
      <div className="w-full">{renderActiveSubmodule()}</div>
    </div>
  );
};
