import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock3,
  Plus,
  Trash2,
  UserRoundCheck,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';

type ConfigurationActivity = {
  id: string;
  action: string;
  user: string;
  date: string;
};

type ApplicantConfigurationData = {
  profileUniqueCheck: boolean;
  profileUniqueFields: string[];
  talentBenchUniqueCheck: boolean;
  talentBenchUniqueFields: string[];
  locationPopulation: boolean;
  activities: ConfigurationActivity[];
};

const STORAGE_KEY = 'ats_applicant_configuration';
const PROFILE_UNIQUE_FIELD_OPTIONS = ['Email ID', 'Mobile Number', 'Passport Number', 'PAN Card Number'];
const TALENT_BENCH_UNIQUE_FIELD_OPTIONS = ['Email', 'Passport Number', 'Pan Card Number'];

const DEFAULT_CONFIGURATION: ApplicantConfigurationData = {
  profileUniqueCheck: true,
  profileUniqueFields: ['Email ID'],
  talentBenchUniqueCheck: true,
  talentBenchUniqueFields: ['Email'],
  locationPopulation: false,
  activities: [],
};

function loadConfiguration(): ApplicantConfigurationData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_CONFIGURATION;
    const parsed: Partial<ApplicantConfigurationData> = JSON.parse(stored);
    return {
      ...DEFAULT_CONFIGURATION,
      ...parsed,
      profileUniqueFields: Array.isArray(parsed.profileUniqueFields)
        ? parsed.profileUniqueFields
        : DEFAULT_CONFIGURATION.profileUniqueFields,
      talentBenchUniqueFields: Array.isArray(parsed.talentBenchUniqueFields)
        ? parsed.talentBenchUniqueFields
        : DEFAULT_CONFIGURATION.talentBenchUniqueFields,
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
    };
  } catch (error) {
    console.error('Unable to load applicant configuration:', error);
    return DEFAULT_CONFIGURATION;
  }
}

function formatNow(): string {
  return new Date().toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type SettingSwitchProps = {
  label: string;
  checked: boolean;
  onChange: () => void;
};

const SettingSwitch: React.FC<SettingSwitchProps> = ({ label, checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={`${label} ${checked ? 'enabled' : 'disabled'}`}
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
      checked ? 'bg-[#2563EB]' : 'bg-[#CBD5E1] dark:bg-slate-600'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

type ConfigCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
};

const ConfigCard: React.FC<ConfigCardProps> = ({
  icon,
  title,
  description,
  enabled,
  onToggle,
  children,
}) => (
  <section className="overflow-hidden rounded-2xl border border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#1E293B]">
    <div className="flex items-start gap-4 p-5 sm:items-center sm:px-6 sm:py-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E3A5F] dark:text-[#93C5FD]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-bold text-[#1E293B] dark:text-white">{title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-[#64748B] dark:text-slate-400">{description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={`hidden text-[11px] font-medium sm:inline ${
          enabled ? 'text-[#15803D] dark:text-green-300' : 'text-[#64748B] dark:text-slate-400'
        }`}>
          {enabled ? 'On' : 'Off'}
        </span>
        <SettingSwitch label={title} checked={enabled} onChange={onToggle} />
      </div>
    </div>
    {children && <div className="border-t border-[#E8EEF6] bg-[#F8FAFC] px-5 py-4 dark:border-[#334155] dark:bg-[#0F172A]/50 sm:px-6">{children}</div>}
  </section>
);

export const ApplicantConfiguration: React.FC = () => {
  const { currentUser } = useAppStore();
  const [configuration, setConfiguration] = useState<ApplicantConfigurationData>(loadConfiguration);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const saveConfiguration = (
    next: ApplicantConfigurationData,
    action: string,
    successMessage: string,
  ) => {
    const activity: ConfigurationActivity = {
      id: `activity-${Date.now()}`,
      action,
      user: currentUser?.name || 'Admin',
      date: formatNow(),
    };
    const withActivity = { ...next, activities: [activity, ...configuration.activities] };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(withActivity));
      setConfiguration(withActivity);
      setNotice({ type: 'success', text: successMessage });
    } catch (error) {
      console.error('Unable to save applicant configuration:', error);
      setNotice({ type: 'error', text: 'Could not save this configuration. Please try again.' });
    }
    window.setTimeout(() => setNotice(null), 3000);
  };

  const toggleSetting = (
    key: 'profileUniqueCheck' | 'talentBenchUniqueCheck' | 'locationPopulation',
    label: string,
  ) => {
    const enabled = !configuration[key];
    saveConfiguration(
      { ...configuration, [key]: enabled },
      `${enabled ? 'Enabled' : 'Disabled'} ${label}`,
      `${label} ${enabled ? 'enabled' : 'disabled'}.`,
    );
  };

  const updateProfileField = (index: number, field: string) => {
    const profileUniqueFields = [...configuration.profileUniqueFields];
    profileUniqueFields[index] = field;
    saveConfiguration(
      { ...configuration, profileUniqueFields },
      `Changed applicant profile uniqueness field to ${field}`,
      'Applicant profile uniqueness field updated.',
    );
  };

  const addProfileField = () => {
    const availableField = PROFILE_UNIQUE_FIELD_OPTIONS.find(
      (field) => !configuration.profileUniqueFields.includes(field),
    );
    if (!availableField) {
      setNotice({ type: 'error', text: 'All available uniqueness fields have been added.' });
      window.setTimeout(() => setNotice(null), 3000);
      return;
    }
    saveConfiguration(
      { ...configuration, profileUniqueFields: [...configuration.profileUniqueFields, availableField] },
      `Added ${availableField} to applicant profile uniqueness checks`,
      'Uniqueness field added.',
    );
  };

  const removeProfileField = (index: number) => {
    const profileUniqueFields = configuration.profileUniqueFields.filter((_, fieldIndex) => fieldIndex !== index);
    saveConfiguration(
      { ...configuration, profileUniqueFields },
      'Removed an applicant profile uniqueness field',
      'Uniqueness field removed.',
    );
  };

  const toggleTalentBenchField = (field: string) => {
    const selected = configuration.talentBenchUniqueFields.includes(field);
    const talentBenchUniqueFields = selected
      ? configuration.talentBenchUniqueFields.filter((item) => item !== field)
      : [...configuration.talentBenchUniqueFields, field];
    saveConfiguration(
      { ...configuration, talentBenchUniqueFields },
      `${selected ? 'Removed' : 'Added'} ${field} from Talent Bench uniqueness checks`,
      `${field} ${selected ? 'removed from' : 'added to'} Talent Bench uniqueness checks.`,
    );
  };

  return (
    <div className="space-y-4 pb-8">
      {notice && (
        <div
          role={notice.type === 'error' ? 'alert' : 'status'}
          className={`fixed right-6 top-20 z-[90] flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-white shadow-xl ${
            notice.type === 'success' ? 'bg-[#15803D]' : 'bg-[#B91C1C]'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {notice.text}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2563EB] dark:text-[#93C5FD]">
            Applicants · Administration
          </p>
          <h1 className="mt-1 text-lg font-bold text-[#1E293B] dark:text-white">Applicant Configuration</h1>
          <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
            Configure profile matching, Talent Bench checks, and applicant location handling.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActivitiesOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D8E3F1] bg-white px-3 text-xs font-semibold text-[#334155] transition-colors hover:bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white dark:hover:bg-[#334155]"
        >
          <Activity className="h-4 w-4 text-[#2563EB] dark:text-[#60A5FA]" />
          Activities
          {configuration.activities.length > 0 && (
            <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] text-[#1D4ED8] dark:bg-[#1E3A5F] dark:text-[#BFDBFE]">
              {configuration.activities.length}
            </span>
          )}
        </button>
      </div>

      <div className="space-y-4">
        <ConfigCard
          icon={<UserRoundCheck className="h-5 w-5" />}
          title="Applicant Profile Unique Check"
          description="Prevent duplicate applicant profiles using the selected profile fields."
          enabled={configuration.profileUniqueCheck}
          onToggle={() => toggleSetting('profileUniqueCheck', 'Applicant Profile Unique Check')}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-[#334155] dark:text-slate-200">Match profile by</p>
              <button
                type="button"
                onClick={addProfileField}
                disabled={configuration.profileUniqueFields.length >= PROFILE_UNIQUE_FIELD_OPTIONS.length}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#BFDBFE] bg-white px-3 py-2 text-xs font-semibold text-[#1D4ED8] transition-colors hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#93C5FD] dark:hover:bg-[#334155]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add field
              </button>
            </div>
            {configuration.profileUniqueFields.map((field, index) => (
              <div key={`${index}-${field}`} className="flex max-w-xl items-center gap-2">
                <select
                  aria-label={`Applicant profile uniqueness field ${index + 1}`}
                  value={field}
                  onChange={(event) => updateProfileField(index, event.target.value)}
                  className={`${fieldClass} max-w-md`}
                >
                  {PROFILE_UNIQUE_FIELD_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={configuration.profileUniqueFields.includes(option) && option !== field}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {configuration.profileUniqueFields.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove uniqueness field ${field}`}
                    onClick={() => removeProfileField(index)}
                    className="rounded-lg p-2 text-[#64748B] transition-colors hover:bg-[#FEF2F2] hover:text-[#B91C1C] dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </ConfigCard>

        <ConfigCard
          icon={<UserRoundCheck className="h-5 w-5" />}
          title="Talent Bench Unique Check"
          description="Choose the information checked for duplicate profiles added to Talent Bench."
          enabled={configuration.talentBenchUniqueCheck}
          onToggle={() => toggleSetting('talentBenchUniqueCheck', 'Talent Bench Unique Check')}
        >
          <fieldset>
            <legend className="mb-3 text-xs font-semibold text-[#334155] dark:text-slate-200">
              Check for duplicates using
            </legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {TALENT_BENCH_UNIQUE_FIELD_OPTIONS.map((field) => (
                <label
                  key={field}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-3 text-sm text-[#334155] transition-colors hover:border-[#BFDBFE] dark:border-[#334155] dark:bg-[#1E293B] dark:text-slate-200 dark:hover:border-slate-500"
                >
                  <input
                    type="checkbox"
                    checked={configuration.talentBenchUniqueFields.includes(field)}
                    onChange={() => toggleTalentBenchField(field)}
                    className="h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  {field}
                </label>
              ))}
            </div>
          </fieldset>
        </ConfigCard>

        <ConfigCard
          icon={<UserRoundCheck className="h-5 w-5" />}
          title="Location Population"
          description="Populate the applicant’s most recent project location (city and state) when their resume does not include an address."
          enabled={configuration.locationPopulation}
          onToggle={() => toggleSetting('locationPopulation', 'Location Population')}
        />
      </div>

      {activitiesOpen && (
        <div
          className="fixed inset-0 z-[100] flex justify-end bg-slate-950/35"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActivitiesOpen(false);
          }}
        >
          <aside
            aria-label="Applicant configuration activity history"
            className="flex h-full w-full max-w-md flex-col border-l border-[#D8E3F1] bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]"
          >
            <div className="flex items-center justify-between border-b border-[#E8EEF6] p-5 dark:border-[#334155]">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#2563EB] dark:text-[#93C5FD]">
                  <Clock3 className="h-4 w-4" /> Audit trail
                </p>
                <h2 className="mt-1 text-base font-bold text-[#1E293B] dark:text-white">Recent activity</h2>
              </div>
              <button
                type="button"
                aria-label="Close activity history"
                onClick={() => setActivitiesOpen(false)}
                className="rounded-lg p-2 text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {configuration.activities.length ? (
                configuration.activities.map((activity) => (
                  <article
                    key={activity.id}
                    className="rounded-xl border border-[#E2E8F0] p-4 dark:border-[#334155] dark:bg-[#0F172A]"
                  >
                    <p className="text-sm font-semibold text-[#1E293B] dark:text-white">{activity.action}</p>
                    <p className="mt-2 text-xs text-[#64748B] dark:text-slate-400">
                      {activity.user} · {activity.date}
                    </p>
                  </article>
                ))
              ) : (
                <div className="py-12 text-center">
                  <Activity className="mx-auto h-7 w-7 text-[#94A3B8]" />
                  <p className="mt-3 text-sm font-semibold text-[#334155] dark:text-slate-200">No activity yet</p>
                  <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                    Configuration changes will appear here.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
