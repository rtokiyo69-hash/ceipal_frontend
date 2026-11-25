import React, { useState } from 'react';
import { getAllCountries } from 'countries-and-timezones';
import { CheckCircle2, CircleHelp, Plus, Save, Trash2 } from 'lucide-react';

type AgeValidationRule = {
  country: string;
  ageLimit: string;
};

type ApplicantSettingsData = {
  placedStatus: string;
  placementEndedStatus: string;
  placementReactivationStatus: string;
  blocklistedStatus: string;
  allowedDomains: string;
  parsingSource: string;
  resumeTitleFormat: boolean;
  restrictPlacementEmails: boolean;
  internalSubmissionApproval: boolean;
  internalInterviewSlots: boolean;
  clientSubmissionApproval: boolean;
  ageValidationRules: AgeValidationRule[];
  clientSubmissionAuthentication: boolean;
  clientInterviewSlots: boolean;
};

const STORAGE_KEY = 'ats_applicant_settings';

const DEFAULT_SETTINGS: ApplicantSettingsData = {
  placedStatus: 'Placed (Not allowed to submit)',
  placementEndedStatus: '',
  placementReactivationStatus: '',
  blocklistedStatus: 'Blocklist (Not allowed to submit)',
  allowedDomains: '',
  parsingSource: 'Naukri',
  resumeTitleFormat: false,
  restrictPlacementEmails: false,
  internalSubmissionApproval: false,
  internalInterviewSlots: false,
  clientSubmissionApproval: false,
  ageValidationRules: [{ country: '', ageLimit: '' }],
  clientSubmissionAuthentication: false,
  clientInterviewSlots: false,
};

const COUNTRY_OPTIONS = Object.values(getAllCountries())
  .map((country) => country.name)
  .sort((a, b) => a.localeCompare(b));

const inputClass =
  'w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-sm text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white';
const selectClass = `${inputClass} cursor-pointer`;

function loadSettings(): ApplicantSettingsData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    const parsed: Partial<ApplicantSettingsData> = JSON.parse(stored);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      ageValidationRules: Array.isArray(parsed.ageValidationRules)
        ? parsed.ageValidationRules
        : DEFAULT_SETTINGS.ageValidationRules,
    };
  } catch (error) {
    console.error('Unable to load applicant settings:', error);
    return DEFAULT_SETTINGS;
  }
}

type SettingToggleProps = {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const SettingToggle: React.FC<SettingToggleProps> = ({
  title,
  description,
  checked,
  onChange,
}) => (
  <label className="flex cursor-pointer items-start justify-between gap-5 rounded-xl border border-[#E2E8F0] bg-white p-4 transition-colors hover:border-[#BFDBFE] dark:border-[#334155] dark:bg-[#0F172A] dark:hover:border-[#475569]">
    <span className="min-w-0">
      <span className="block text-sm font-semibold text-[#1E293B] dark:text-white">{title}</span>
      <span className="mt-1 block text-xs leading-relaxed text-[#64748B] dark:text-slate-400">
        {description}
      </span>
    </span>
    <span className="relative mt-0.5 inline-flex shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span className="h-6 w-11 rounded-full bg-[#CBD5E1] transition-colors peer-checked:bg-[#2563EB] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#2563EB] dark:bg-slate-600" />
      <span className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
    </span>
  </label>
);

type SettingsSectionProps = {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

const SettingsSection: React.FC<SettingsSectionProps> = ({
  number,
  title,
  description,
  children,
}) => (
  <section className="overflow-hidden rounded-2xl border border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#1E293B]">
    <div className="flex items-start gap-3 border-b border-[#E8EEF6] px-5 py-4 dark:border-[#334155] sm:px-6">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-xs font-bold text-[#1D4ED8] dark:bg-[#1E3A5F] dark:text-[#93C5FD]">
        {number}
      </span>
      <div>
        <h2 className="text-sm font-bold text-[#1E293B] dark:text-white">{title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-[#64748B] dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
    <div className="space-y-4 p-5 sm:p-6">{children}</div>
  </section>
);

export const ApplicantSettings: React.FC = () => {
  const [settings, setSettings] = useState<ApplicantSettingsData>(loadSettings);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const updateSetting = <K extends keyof ApplicantSettingsData>(
    key: K,
    value: ApplicantSettingsData[K],
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const updateAgeRule = (index: number, patch: Partial<AgeValidationRule>) => {
    updateSetting(
      'ageValidationRules',
      settings.ageValidationRules.map((rule, rowIndex) =>
        rowIndex === index ? { ...rule, ...patch } : rule,
      ),
    );
  };

  const saveSettings = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setToast({ type: 'success', message: 'Applicant settings saved.' });
    } catch (error) {
      console.error('Unable to save applicant settings:', error);
      setToast({ type: 'error', message: 'Could not save settings. Please try again.' });
    }
    window.setTimeout(() => setToast(null), 3500);
  };

  const renderStatusSelect = (
    label: string,
    value: string,
    onChange: (value: string) => void,
  ) => (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-[#334155] dark:text-slate-200">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={selectClass}>
        <option value="">Select a status</option>
        <option>New</option>
        <option>Active</option>
        <option>Placed (Not allowed to submit)</option>
        <option>Placement Ended</option>
        <option>Blocklist (Not allowed to submit)</option>
        <option>Do Not Contact</option>
      </select>
    </label>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-24">
      {toast && (
        <div
          role={toast.type === 'error' ? 'alert' : 'status'}
          className={`fixed right-6 top-20 z-[90] flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-white shadow-xl ${
            toast.type === 'success' ? 'bg-[#15803D]' : 'bg-[#B91C1C]'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {toast.message}
        </div>
      )}

      <div className="rounded-2xl border border-[#D8E3F1] bg-gradient-to-r from-white to-[#F4F8FF] p-5 dark:border-[#334155] dark:from-[#1E293B] dark:to-[#172554] sm:p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2563EB] dark:text-[#93C5FD]">
          Applicants · Administration
        </p>
        <h1 className="mt-1 text-xl font-bold text-[#172033] dark:text-white sm:text-2xl">
          Applicant settings
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#64748B] dark:text-slate-300">
          Set sensible defaults for candidate records, submissions, and interview scheduling. Your
          changes take effect after you save.
        </p>
      </div>

      <form onSubmit={saveSettings} className="space-y-5">
        <SettingsSection
          number="01"
          title="Status defaults"
          description="Choose which applicant status is applied at key placement milestones."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {renderStatusSelect('When an applicant is placed', settings.placedStatus, (value) =>
              updateSetting('placedStatus', value),
            )}
            {renderStatusSelect('When a placement ends', settings.placementEndedStatus, (value) =>
              updateSetting('placementEndedStatus', value),
            )}
            {renderStatusSelect(
              'When a placement is reactivated',
              settings.placementReactivationStatus,
              (value) => updateSetting('placementReactivationStatus', value),
            )}
            {renderStatusSelect('When an applicant is blocklisted', settings.blocklistedStatus, (value) =>
              updateSetting('blocklistedStatus', value),
            )}
          </div>
        </SettingsSection>

        <SettingsSection
          number="02"
          title="Profile creation & resume parsing"
          description="Control which email domains can create applicant profiles and choose your default resume parser."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-[#334155] dark:text-slate-200">
                Allowed email domains
                <span title="Leave blank to allow any domain." className="text-[#94A3B8]">
                  <CircleHelp className="h-3.5 w-3.5" />
                </span>
              </span>
              <input
                value={settings.allowedDomains}
                onChange={(event) => updateSetting('allowedDomains', event.target.value)}
                placeholder="e.g. company.com, partner.org"
                className={inputClass}
              />
              <span className="block text-xs text-[#64748B] dark:text-slate-400">
                Separate domains with commas. Leave blank to allow any domain.
              </span>
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-[#334155] dark:text-slate-200">
                Resume parsing source
              </span>
              <select
                value={settings.parsingSource}
                onChange={(event) => updateSetting('parsingSource', event.target.value)}
                className={selectClass}
              >
                <option value="">Select a parsing source</option>
                <option>Naukri</option>
                <option>CEIPAL</option>
                <option>Textkernel</option>
              </select>
            </label>
          </div>
          <SettingToggle
            title="Use a standard resume title format"
            description="Apply the configured resume title format when a candidate submits a resume."
            checked={settings.resumeTitleFormat}
            onChange={(checked) => updateSetting('resumeTitleFormat', checked)}
          />
        </SettingsSection>

        <SettingsSection
          number="03"
          title="Submission emails & interview scheduling"
          description="Choose what recruiters and clients can do from submission emails and whether interview time slots are shown."
        >
          <div className="grid gap-3 lg:grid-cols-2">
            <SettingToggle
              title="Limit placement emails to confirmed candidates"
              description="Send placement-related email notifications only for confirmed or placed candidates."
              checked={settings.restrictPlacementEmails}
              onChange={(checked) => updateSetting('restrictPlacementEmails', checked)}
            />
            <SettingToggle
              title="Include approve and reject actions in internal emails"
              description="Let internal reviewers approve or reject candidates directly from submission emails."
              checked={settings.internalSubmissionApproval}
              onChange={(checked) => updateSetting('internalSubmissionApproval', checked)}
            />
            <SettingToggle
              title="Show proposed interview slots to internal reviewers"
              description="Display the internal interview time slots proposed for the candidate."
              checked={settings.internalInterviewSlots}
              onChange={(checked) => updateSetting('internalInterviewSlots', checked)}
            />
            <SettingToggle
              title="Include approve and reject actions in client emails"
              description="Let clients approve or reject candidates directly from submission emails."
              checked={settings.clientSubmissionApproval}
              onChange={(checked) => updateSetting('clientSubmissionApproval', checked)}
            />
            <SettingToggle
              title="Require authentication for client feedback"
              description="Ask clients to verify their identity before giving feedback on a submission."
              checked={settings.clientSubmissionAuthentication}
              onChange={(checked) => updateSetting('clientSubmissionAuthentication', checked)}
            />
            <SettingToggle
              title="Show proposed interview slots to clients"
              description="Display the client interview time slots proposed for the candidate."
              checked={settings.clientInterviewSlots}
              onChange={(checked) => updateSetting('clientInterviewSlots', checked)}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          number="04"
          title="Applicant age validation"
          description="Set a minimum age by country. Add one rule per country; applicants without a matching rule are not affected."
        >
          <div className="space-y-3">
            {settings.ageValidationRules.map((rule, index) => (
              <div key={index} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-[#475569] dark:text-slate-300">Country</span>
                  <select
                    value={rule.country}
                    onChange={(event) => updateAgeRule(index, { country: event.target.value })}
                    className={selectClass}
                  >
                    <option value="">Select a country</option>
                    {COUNTRY_OPTIONS.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-[#475569] dark:text-slate-300">Minimum age</span>
                  <span className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={rule.ageLimit}
                      onChange={(event) => updateAgeRule(index, { ageLimit: event.target.value })}
                      placeholder="e.g. 18"
                      aria-label={`Minimum age for country rule ${index + 1}`}
                      className={inputClass}
                    />
                    <span className="text-xs text-[#64748B] dark:text-slate-400">years</span>
                  </span>
                </label>
                <button
                  type="button"
                  aria-label={`Remove age validation rule ${index + 1}`}
                  onClick={() =>
                    updateSetting(
                      'ageValidationRules',
                      settings.ageValidationRules.filter((_, rowIndex) => rowIndex !== index),
                    )
                  }
                  className="mt-auto inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#FECACA] px-3 text-xs font-semibold text-[#B91C1C] transition-colors hover:bg-[#FEF2F2] dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sm:hidden">Remove rule</span>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                updateSetting('ageValidationRules', [
                  ...settings.ageValidationRules,
                  { country: '', ageLimit: '' },
                ])
              }
              className="inline-flex items-center gap-2 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 text-xs font-semibold text-[#1D4ED8] transition-colors hover:bg-[#DBEAFE] dark:border-[#1E3A5F] dark:bg-[#172554] dark:text-[#93C5FD] dark:hover:bg-[#1E3A5F]"
            >
              <Plus className="h-4 w-4" />
              Add country rule
            </button>
          </div>
        </SettingsSection>

        <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D8E3F1] bg-white/95 p-4 shadow-lg backdrop-blur dark:border-[#334155] dark:bg-[#1E293B]/95">
          <p className="text-xs text-[#64748B] dark:text-slate-400">
            Remember to save to apply your changes.
          </p>
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            <Save className="h-4 w-4" />
            Save settings
          </button>
        </div>
      </form>
    </div>
  );
};
