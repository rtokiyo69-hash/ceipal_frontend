import React, { useState } from 'react';
import {
  Activity,
  ArrowLeft,
  CheckCircle,
  Clock3,
  Save,
  X
} from 'lucide-react';
import {
  ConsentSettingsData,
  INITIAL_CONSENT_SETTINGS,
  INITIAL_CONSENT_ACTIVITIES,
  AuditActivity
} from '../../../services/globalSettingsMockData';

export const ConsentSettings: React.FC = () => {
  const [data, setData] = useState<ConsentSettingsData>(INITIAL_CONSENT_SETTINGS);
  const [activities, setActivities] = useState<AuditActivity[]>(INITIAL_CONSENT_ACTIVITIES);
  const [showActivities, setShowActivities] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: AuditActivity = {
      id: `ca-${Date.now()}`,
      dateTime: new Date().toLocaleString(),
      description: `Consent Settings updated by Sachin Wadeyar. Applicable to [ ${
        data.consentApplicableTo === 'all' ? 'All Applicants' : 'Based on Applicant Country'
      } ], Period [ ${data.defaultConsentPeriod} ].`
    };
    setActivities([newLog, ...activities]);
    showToast('Consent settings saved successfully.');
  };

  if (showActivities) {
    return (
      <section className="overflow-hidden rounded-2xl border border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#1E293B]">
        <div className="flex items-center justify-between border-b border-[#D8E3F1] p-5 dark:border-[#334155]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1E40AF] dark:text-[#60A5FA]">
              Audit Trail
            </p>
            <h2 className="mt-1 text-lg font-bold text-[#1E293B] dark:text-white">
              Consent Settings Activity History
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowActivities(false)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D8E3F1] bg-white px-3 text-xs font-semibold text-[#334155] transition-colors hover:bg-[#FFFFFF] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white dark:hover:bg-[#475569]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Settings</span>
          </button>
        </div>

        <div className="p-5 space-y-3">
          {activities.map((act) => (
            <div
              key={act.id}
              className="flex gap-3 rounded-xl border border-[#D8E3F1] bg-[#F8FAFC] p-3.5 dark:border-[#334155] dark:bg-[#0F172A]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFFFFF] text-[#125B97] dark:bg-[#475569] dark:text-[#60A5FA]">
                <Clock3 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#1E293B] dark:text-white leading-relaxed">
                  {act.description}
                </p>
                <p className="mt-1 text-[10px] text-[#64748B]">{act.dateTime}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#1E293B] overflow-visible">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed right-6 top-20 z-[90] flex items-center gap-2 rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2.5 text-xs text-white shadow-xl animate-in fade-in">
          <CheckCircle className="h-4 w-4 text-[#8AC9A7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D8E3F1] p-5 dark:border-[#334155]">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1E40AF] dark:text-[#60A5FA]">
            Compliance &amp; GDPR
          </p>
          <h2 className="mt-1 text-lg font-bold text-[#1E293B] dark:text-white">
            Consent Settings Configuration
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setShowActivities(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D8E3F1] bg-white px-3 text-xs font-semibold text-[#334155] transition-colors hover:bg-[#FFFFFF] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white dark:hover:bg-[#475569]"
        >
          <Activity className="h-4 w-4 text-[#125B97] dark:text-[#60A5FA]" />
          <span>Activities ({activities.length})</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="p-6 space-y-6 text-xs max-w-4xl">
        {/* Consent Type */}
        <label className="block space-y-1.5 font-semibold text-[#334155] dark:text-[#BFDBFE]">
          <span>Consent Type</span>
          <p className="text-[11px] font-normal text-[#64748B]">
            Reflected for all candidate consent communications. Defaults to GDPR.
          </p>
          <input
            type="text"
            value={data.consentType}
            onChange={(e) => setData({ ...data, consentType: e.target.value })}
            className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-xs font-normal text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
          />
        </label>

        {/* Consent Applicable to */}
        <div>
          <label className="block font-semibold text-[#334155] dark:text-[#BFDBFE] mb-1.5">
            Consent Applicable to
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-[#334155] dark:text-[#BFDBFE]">
              <input
                type="radio"
                name="consentApplicableTo"
                checked={data.consentApplicableTo === 'all'}
                onChange={() => setData({ ...data, consentApplicableTo: 'all' })}
                className="text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span>All Applicants</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-[#334155] dark:text-[#BFDBFE]">
              <input
                type="radio"
                name="consentApplicableTo"
                checked={data.consentApplicableTo === 'country'}
                onChange={() => setData({ ...data, consentApplicableTo: 'country' })}
                className="text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span>Based on Applicant Country</span>
            </label>
          </div>
        </div>

        {/* Countries & Period */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5 font-semibold text-[#334155] dark:text-[#BFDBFE]">
            <span>Countries</span>
            <select
              value={data.countries[0] || 'United Kingdom'}
              onChange={(e) => setData({ ...data, countries: [e.target.value] })}
              className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-xs font-normal text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
            >
              <option value="United Kingdom">United Kingdom</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="India">India</option>
            </select>
          </label>

          <label className="block space-y-1.5 font-semibold text-[#334155] dark:text-[#BFDBFE]">
            <span>Default Consent Period</span>
            <select
              value={data.defaultConsentPeriod}
              onChange={(e) => setData({ ...data, defaultConsentPeriod: e.target.value })}
              className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-xs font-normal text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
            >
              <option value="6 Months">6 Months</option>
              <option value="1 Year">1 Year</option>
              <option value="2 Years">2 Years</option>
              <option value="Indefinite">Indefinite</option>
            </select>
          </label>
        </div>

        {/* Contact Email */}
        <label className="block space-y-1.5 font-semibold text-[#334155] dark:text-[#BFDBFE]">
          <span>Consent Contact Email</span>
          <p className="text-[11px] font-normal text-[#64748B]">
            Displayed in candidate consent emails for questions.
          </p>
          <input
            type="email"
            value={data.consentContactEmail}
            onChange={(e) => setData({ ...data, consentContactEmail: e.target.value })}
            placeholder="privacy@company.com"
            className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-xs font-normal text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
          />
        </label>

        {/* Job consent toggles */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#D8E3F1] bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#0F172A]">
            <div>
              <p className="font-semibold text-[#1E293B] dark:text-white">
                Send consent for all Jobs
              </p>
              <p className="text-[11px] text-[#64748B]">
                One consent approval allows the candidate to be submitted to any job.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setData({ ...data, sendConsentForAllJobs: !data.sendConsentForAllJobs })
              }
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                data.sendConsentForAllJobs ? 'bg-[#2563EB]' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                  data.sendConsentForAllJobs ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#D8E3F1] bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#0F172A]">
            <div>
              <p className="font-semibold text-[#1E293B] dark:text-white">
                Send Consent based on the Job
              </p>
              <p className="text-[11px] text-[#64748B]">
                Consent must be approved per individual job requisition before submission.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setData({ ...data, sendConsentBasedOnJob: !data.sendConsentBasedOnJob })
              }
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                data.sendConsentBasedOnJob ? 'bg-[#2563EB]' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                  data.sendConsentBasedOnJob ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notifier & Notifications frequency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5 font-semibold text-[#334155] dark:text-[#BFDBFE]">
            <span>Notification Recipient</span>
            <select
              value={data.defaultNotifier}
              onChange={(e) => setData({ ...data, defaultNotifier: e.target.value })}
              className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-xs font-normal text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
            >
              <option value="">Select Notifier</option>
              <option value="admin">Administrator</option>
              <option value="recruiter">Assigned Recruiter</option>
              <option value="lead">Practice Lead</option>
            </select>
          </label>

          <label className="block space-y-1.5 font-semibold text-[#334155] dark:text-[#BFDBFE]">
            <span>Reminder Frequency (Days)</span>
            <select
              value={data.frequencyDays}
              onChange={(e) => setData({ ...data, frequencyDays: e.target.value })}
              className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-xs font-normal text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
            >
              <option value="1">1 Day</option>
              <option value="3">3 Days</option>
              <option value="7">7 Days</option>
              <option value="14">14 Days</option>
            </select>
          </label>
        </div>

        {/* Candidate Response Actions */}
        <div className="space-y-4 pt-2">
          <div>
            <label className="block font-semibold text-[#334155] dark:text-[#BFDBFE] mb-2">
              Action when candidate does not respond to consent requests
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-[#334155] dark:text-[#BFDBFE]">
                <input
                  type="radio"
                  name="actionNoResponse"
                  checked={data.actionWhenNoResponse === 'retain'}
                  onChange={() => setData({ ...data, actionWhenNoResponse: 'retain' })}
                  className="text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span>Retain candidate profile and restrict further processing</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[#334155] dark:text-[#BFDBFE]">
                <input
                  type="radio"
                  name="actionNoResponse"
                  checked={data.actionWhenNoResponse === 'delete'}
                  onChange={() => setData({ ...data, actionWhenNoResponse: 'delete' })}
                  className="text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span>Automatically delete candidate profile</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#334155] dark:text-[#BFDBFE] mb-2">
              Action when candidate rejects consent
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-[#334155] dark:text-[#BFDBFE]">
                <input
                  type="radio"
                  name="actionReject"
                  checked={data.actionWhenRejects === 'retain'}
                  onChange={() => setData({ ...data, actionWhenRejects: 'retain' })}
                  className="text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span>Retain candidate profile and restrict further processing</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[#334155] dark:text-[#BFDBFE]">
                <input
                  type="radio"
                  name="actionReject"
                  checked={data.actionWhenRejects === 'delete'}
                  onChange={() => setData({ ...data, actionWhenRejects: 'delete' })}
                  className="text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span>Automatically delete candidate profile</span>
              </label>
            </div>
          </div>
        </div>

        {/* Terms and Conditions Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#D8E3F1] bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#0F172A]">
          <div>
            <p className="font-semibold text-[#1E293B] dark:text-white">
              Display Consent Terms &amp; Conditions to Applicant
            </p>
            <p className="text-[11px] text-[#64748B]">
              Require candidate to explicitly review and accept terms before submitting consent.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setData({
                ...data,
                displayTermsAndConditions: !data.displayTermsAndConditions
              })
            }
            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
              data.displayTermsAndConditions ? 'bg-[#2563EB]' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                data.displayTermsAndConditions ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Submit */}
        <div className="border-t border-[#D8E3F1] pt-4 dark:border-[#334155]">
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
          >
            <Save className="h-4 w-4" />
            <span>Save Consent Settings</span>
          </button>
        </div>
      </form>
    </section>
  );
};
