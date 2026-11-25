import React, { useState } from 'react';
import { SearchableSelect } from '../../components/common/SearchableSelect';
import { InterviewLookup, type InterviewLookupKind } from './InterviewLookup';
import { Activity, CheckCircle, Save, X } from 'lucide-react';

const interviewTabs = [
  'General Settings',
  'Interview Modes',
  'Interview Rounds',
  'Interview Outcome Statuses',
  'Interview Recommendations',
  'More (...)'
] as const;

type InterviewTab = (typeof interviewTabs)[number];
type ReminderUnit = 'Minutes' | 'Hours' | 'Days';

interface InterviewSettingsValues {
  interviewScheduling: boolean;
  notifyClient: boolean;
  cancelOnReschedule: boolean;
  reminderFrequency: 'Daily' | 'Custom Duration';
  reminderDuration: string;
  reminderUnit: ReminderUnit;
  reminderNotifier: string[];
  feedbackBeforeNextRound: boolean;
  visibility: {
    noRestriction: boolean;
    submissionStatus: boolean;
    pipelineStatus: boolean;
  };
  notificationMethod: string;
  reminderRecipient: string[];
  defaultReminderUnit: string;
  defaultReminderValue: string;
  reminderFrequencyCount: string;
  feedbackRecipients: string[];
  includeEvaluationTemplate: boolean;
  displayCalendarEvents: boolean;
}

const feedbackRecipientOptions = [
  'Job Posting Recruitment Manager',
  'Job Posting Primary Recruiter',
  'Interview Scheduled By',
  'Profile Submitted By',
  'Bench Sales Team Member'
];
const notifierOptions = ['Sales Manager', 'Recruitment Manager', 'Account Manager', 'Primary Recruiter', 'Interview Scheduled By', 'Submitted By', 'Interview Additional Notifiers'];
const reminderRecipientOptions = ['Applicant', 'Interviewer', 'Primary Recruiter', 'Recruitment Manager', 'Bench Account Manager', 'Bench Sales Team Member', 'Abhishek Bhalerao'];
const asOptions = (values: string[]) => values.map(value => ({ value, label: value }));

const initialSettings: InterviewSettingsValues = {
  interviewScheduling: false,
  notifyClient: true,
  cancelOnReschedule: false,
  reminderFrequency: 'Daily',
  reminderDuration: '1',
  reminderUnit: 'Days',
  reminderNotifier: [],
  feedbackBeforeNextRound: true,
  visibility: {
    noRestriction: true,
    submissionStatus: false,
    pipelineStatus: false
  },
  notificationMethod: 'Email',
  reminderRecipient: ['Primary Recruiter'],
  defaultReminderUnit: 'Minutes',
  defaultReminderValue: '180',
  reminderFrequencyCount: '1',
  feedbackRecipients: feedbackRecipientOptions.slice(0, 4),
  includeEvaluationTemplate: false,
  displayCalendarEvents: true
};

interface ToggleProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ checked, label, onChange }) => (
  <label className="inline-flex cursor-pointer items-center">
    <input
      type="checkbox"
      role="switch"
      aria-label={label}
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="peer sr-only"
    />
    <span className="relative h-5 w-9 rounded-full bg-[#CBD5E1] transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-[#2563EB] peer-checked:after:translate-x-4 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#2563EB]" />
  </label>
);

const selectClass = 'h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-2.5 text-xs text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white';
const inputClass = 'h-9 w-full rounded-md border border-[#CBD5E1] bg-white px-2.5 text-xs text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white';

export const JobInterviewSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InterviewTab>('General Settings');
  const [settings, setSettings] = useState<InterviewSettingsValues>(initialSettings);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const updateSetting = <K extends keyof InterviewSettingsValues>(key: K, value: InterviewSettingsValues[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setFeedbackMessage(null);
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (currentIndex + direction + interviewTabs.length) % interviewTabs.length;
    setActiveTab(interviewTabs[nextIndex]);
    event.currentTarget.closest('nav')?.querySelectorAll<HTMLButtonElement>('button')[nextIndex]?.focus();
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!settings.reminderNotifier.length) {
      setFeedbackMessage({ type: 'error', text: 'Select a notifier for interview feedback reminders.' });
      return;
    }
    if (settings.reminderFrequency === 'Custom Duration' && (!Number(settings.reminderDuration) || Number(settings.reminderDuration) < 1)) {
      setFeedbackMessage({ type: 'error', text: 'Enter a custom reminder duration greater than zero.' });
      return;
    }
    if (!Number(settings.defaultReminderValue) || Number(settings.defaultReminderValue) < 1) {
      setFeedbackMessage({ type: 'error', text: 'Enter a default reminder value greater than zero.' });
      return;
    }
    setFeedbackMessage({ type: 'success', text: 'Interview settings saved for this session.' });
  };

  return (
    <section className="posting-panel posting-interviews space-y-4">
      <nav aria-label="Interview settings sections" className="flex overflow-x-auto border-b border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#1E293B]">
        {interviewTabs.map((tab, index) => (
          <button
            key={tab}
            aria-label={tab === 'More (...)' ? 'More interview settings' : undefined}
            type="button"
            aria-current={activeTab === tab ? 'page' : undefined}
            tabIndex={activeTab === tab ? 0 : -1}
            onClick={() => setActiveTab(tab)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            className={`shrink-0 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors sm:px-4 ${
              activeTab === tab
                ? 'border-[#2563EB] bg-[#DCE8FF]/60 text-[#125B97] dark:border-[#60A5FA] dark:bg-[#475569] dark:text-white'
                : 'border-transparent text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1E293B] dark:text-[#BFDBFE] dark:hover:bg-[#475569]'
            }`}
          >
            {tab === 'More (...)' ? '...' : tab}
          </button>
        ))}
      </nav>

      {activeTab === 'General Settings' ? (
        <form onSubmit={handleSave} className="posting-interview-form flex flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-[#D8E3F1] pb-4 dark:border-[#334155]">
            <h1 className="text-lg font-semibold tracking-tight text-[#1E293B] dark:text-white">Interview General Settings</h1>
            <button
              type="button"
              onClick={() => setActivitiesOpen(true)}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-[#D8E3F1] bg-white px-3 text-xs font-medium text-[#334155] hover:bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white dark:hover:bg-[#475569]"
            >
              <Activity className="h-3.5 w-3.5 text-[#2563EB]" />
              Activities
            </button>
          </div>

          <div className="posting-setting-rows flex-1 divide-y divide-[#E2E8F0] dark:divide-[#334155]">
            <div className="grid grid-cols-1 gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(300px,1.15fr)] sm:items-center sm:gap-8">
              <div>
                <h2 className="text-sm font-semibold text-[#1E293B] dark:text-white">Interview Scheduling</h2>
                <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#94A3B8]">(Hide the interview scheduling button for the "Rejected" Category submissions.)</p>
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-[#334155] dark:text-[#BFDBFE]">
                <input type="checkbox" checked={settings.interviewScheduling} onChange={(event) => updateSetting('interviewScheduling', event.target.checked)} className="h-4 w-4 accent-[#2563EB]" />
                <span className="sr-only">Interview Scheduling</span>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(300px,1.15fr)] sm:items-center sm:gap-8">
              <div>
                <h2 className="text-sm font-semibold text-[#1E293B] dark:text-white">Send Interview Schedule Notifications to the Client Contact?</h2>
                <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#94A3B8]">(When enabled, the system sends interview email notifications/reminders to the Client contact while scheduling an interview.)</p>
              </div>
              <Toggle label="Send interview schedule notifications to the client contact" checked={settings.notifyClient} onChange={(value) => updateSetting('notifyClient', value)} />
            </div>

            <div className="grid grid-cols-1 gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(300px,1.15fr)] sm:items-center sm:gap-8">
              <div>
                <h2 className="text-sm font-semibold text-[#1E293B] dark:text-white">Cancel the interview if the interviewer reschedules the interview</h2>
                <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#94A3B8]">(Interview will be cancelled if the interviewer requests to "Reschedule." It's applicable only if there is a single interviewer from the interview.)</p>
              </div>
              <Toggle label="Cancel the interview if the interviewer reschedules it" checked={settings.cancelOnReschedule} onChange={(value) => updateSetting('cancelOnReschedule', value)} />
            </div>

            <div className="grid grid-cols-1 gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(300px,1.15fr)] sm:items-start sm:gap-8">
              <div>
                <h2 className="text-sm font-semibold text-[#1E293B] dark:text-white">Send interview feedback reminder</h2>
                <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#94A3B8]">(The system will send a reminder to configured recipients to give interview feedback on the interview completion)</p>
              </div>
              <div className="space-y-3">
                <fieldset className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <legend className="sr-only">Feedback reminder schedule</legend>
                  {(['Daily', 'Custom Duration'] as const).map((frequency) => (
                    <label key={frequency} className="inline-flex items-center gap-2 text-xs text-[#334155] dark:text-[#BFDBFE]">
                      <input type="radio" name="feedback-reminder-frequency" value={frequency} checked={settings.reminderFrequency === frequency} onChange={() => updateSetting('reminderFrequency', frequency)} className="h-4 w-4 accent-[#2563EB]" />
                      {frequency}
                    </label>
                  ))}
                </fieldset>
                {settings.reminderFrequency === 'Custom Duration' && (
                  <div className="grid grid-cols-[minmax(0,1fr)_minmax(110px,0.7fr)] gap-2">
                    <label className="sr-only" htmlFor="custom-reminder-duration">Custom reminder duration</label>
                    <input id="custom-reminder-duration" type="number" min="1" value={settings.reminderDuration} onChange={(event) => updateSetting('reminderDuration', event.target.value)} className={inputClass} />
                    <label className="sr-only" htmlFor="custom-reminder-unit">Custom reminder unit</label>
                    <select id="custom-reminder-unit" value={settings.reminderUnit} onChange={(event) => updateSetting('reminderUnit', event.target.value as ReminderUnit)} className={selectClass}>
                      {(['Minutes', 'Hours', 'Days'] as const).map((unit) => <option key={unit}>{unit}</option>)}
                    </select>
                  </div>
                )}
                <SearchableSelect label="Select Notifier" placeholder="Select Notifier" multiple options={asOptions(notifierOptions)} values={settings.reminderNotifier} onChange={values => updateSetting('reminderNotifier', values)} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(300px,1.15fr)] sm:items-center sm:gap-8">
              <div>
                <h2 className="text-sm font-semibold text-[#1E293B] dark:text-white">Feedback on the Schedule Interview</h2>
                <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#94A3B8]">(If enabled, a user needs to submit the feedback before scheduling another round of interviews)</p>
              </div>
              <Toggle label="Require feedback before scheduling another interview round" checked={settings.feedbackBeforeNextRound} onChange={(value) => updateSetting('feedbackBeforeNextRound', value)} />
            </div>

            <div className="grid grid-cols-1 gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(300px,1.15fr)] sm:items-start sm:gap-8">
              <div>
                <h2 className="text-sm font-semibold text-[#1E293B] dark:text-white">Schedule Interview Option Visibility</h2>
                <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#94A3B8]">(Configure when the "Schedule Interview" option should be displayed in all the modules.Select a desired status and when the status matches the status selected here, the "Schedule Interview" option will be displayed. If "No Restriction" option is selected, the "Schedule Interview" option will always be displayed.)</p>
              </div>
              <div className="interview-visibility-options">
                <label className="inline-flex items-center gap-2 text-xs text-[#334155] dark:text-[#BFDBFE]">
                  <input
                    type="checkbox"
                    checked={settings.visibility.noRestriction}
                    onChange={(event) => updateSetting('visibility', {
                      noRestriction: event.target.checked,
                      submissionStatus: event.target.checked ? false : settings.visibility.submissionStatus,
                      pipelineStatus: event.target.checked ? false : settings.visibility.pipelineStatus
                    })}
                    className="h-4 w-4 accent-[#2563EB]"
                  />
                  No Restriction
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-[#334155] dark:text-[#BFDBFE]">
                  <input
                    type="checkbox"
                    checked={settings.visibility.submissionStatus}
                    onChange={(event) => updateSetting('visibility', {
                      noRestriction: false,
                      submissionStatus: event.target.checked,
                      pipelineStatus: settings.visibility.pipelineStatus
                    })}
                    className="h-4 w-4 accent-[#2563EB]"
                  />
                  Submission Status with Interview Option
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-[#334155] dark:text-[#BFDBFE]">
                  <input
                    type="checkbox"
                    checked={settings.visibility.pipelineStatus}
                    onChange={(event) => updateSetting('visibility', {
                      noRestriction: false,
                      submissionStatus: settings.visibility.submissionStatus,
                      pipelineStatus: event.target.checked
                    })}
                    className="h-4 w-4 accent-[#2563EB]"
                  />
                  Pipeline Status with Interview option
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(300px,1.15fr)] sm:items-start sm:gap-8">
              <div>
                <h2 className="text-sm font-semibold text-[#1E293B] dark:text-white">Default Reminder Options</h2>
                <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#94A3B8]">(Choose the default options for scheduled interview reminders.)</p>
              </div>
              <div className="interview-default-reminders">
                <div className="interview-reminder-line"><select aria-label="Notification method" value={settings.notificationMethod} onChange={e => updateSetting('notificationMethod', e.target.value)} className={selectClass}><option>Email</option></select><SearchableSelect label="Reminder recipients" multiple options={asOptions(reminderRecipientOptions)} values={settings.reminderRecipient} onChange={values => updateSetting('reminderRecipient', values)} /></div>
                <div className="interview-reminder-time"><select aria-label="Time unit" value={settings.defaultReminderUnit} onChange={e => updateSetting('defaultReminderUnit', e.target.value)} className={selectClass}>{['Minutes', 'Hours', 'Days'].map(unit => <option key={unit}>{unit}</option>)}</select><input aria-label="Reminder value" type="number" min="1" value={settings.defaultReminderValue} onChange={e => updateSetting('defaultReminderValue', e.target.value)} className={inputClass} /><span>{settings.defaultReminderUnit} before</span></div>
                <div className="interview-reminder-frequency"><span>Frequency</span><select aria-label="Frequency" value={settings.reminderFrequencyCount} onChange={e => updateSetting('reminderFrequencyCount', e.target.value)} className={selectClass}>{['1', '2', '3'].map(value => <option key={value}>{value}</option>)}</select><span>Time</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(300px,1.15fr)] sm:items-start sm:gap-8">
              <div>
                <h2 className="text-sm font-semibold text-[#1E293B] dark:text-white">Interview Feedback Notification</h2>
                <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#94A3B8]">(Choose the roles on the recipients for the feedback given by the Interviewer.)</p>
              </div>
              <SearchableSelect label="Interview Feedback Notification" multiple options={asOptions(feedbackRecipientOptions)} values={settings.feedbackRecipients} onChange={values => updateSetting('feedbackRecipients', values)} />
            </div>

            <div className="grid grid-cols-1 gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(300px,1.15fr)] sm:items-center sm:gap-8">
              <div>
                <h2 className="text-sm font-semibold text-[#1E293B] dark:text-white">Include the evaluation template for the internal feedback</h2>
                <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#94A3B8]">(If enabled, selected evaluation template will be populated at the time of given internal feedback for the given interview record.)</p>
              </div>
              <Toggle label="Include the evaluation template in interview feedback notifications" checked={settings.includeEvaluationTemplate} onChange={(value) => updateSetting('includeEvaluationTemplate', value)} />
            </div>

            <div className="grid grid-cols-1 gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(300px,1.15fr)] sm:items-center sm:gap-8">
              <div>
                <h2 className="text-sm font-semibold text-[#1E293B] dark:text-white">Display Calendar Events in 'Check Availability</h2>
                <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#94A3B8]">(If enabled, Calendar events will be displayed in the Check Availability section while scheduling interviews.)</p>
              </div>
              <Toggle label="Display calendar events in Check Availability" checked={settings.displayCalendarEvents} onChange={(value) => updateSetting('displayCalendarEvents', value)} />
            </div>
          </div>

          <div className="sticky bottom-0 z-20 mt-auto flex flex-col gap-2 border-t border-[#D8E3F1] bg-white/95 py-3 shadow-[0_-4px_12px_rgba(15,23,42,0.06)] backdrop-blur dark:border-[#334155] dark:bg-[#0F172A]/95 sm:flex-row sm:items-center sm:justify-end">
            {feedbackMessage && (
              <p role={feedbackMessage.type === 'error' ? 'alert' : 'status'} className={`mr-auto inline-flex items-center gap-1.5 text-xs ${feedbackMessage.type === 'error' ? 'text-rose-600 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                {feedbackMessage.type === 'success' && <CheckCircle className="h-4 w-4" />}
                {feedbackMessage.text}
              </p>
            )}
            <button type="submit" className="inline-flex items-center justify-center gap-2 h-9 rounded-md bg-[#2563EB] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]">
              <Save className="h-4 w-4" /> Save
            </button>
          </div>
        </form>
      ) : (
        activeTab !== 'More (...)' ? <InterviewLookup key={activeTab} kind={activeTab as InterviewLookupKind} /> : <div className="p-6 text-sm text-slate-500">Select an interview settings tab to manage its options.</div>
      )}

      {activitiesOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0F172A]/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setActivitiesOpen(false); }}>
          <section aria-labelledby="interview-settings-activities-title" className="w-full max-w-md rounded-xl border border-[#D8E3F1] bg-white p-5 shadow-xl dark:border-[#334155] dark:bg-[#1E293B]">
            <div className="flex items-center justify-between">
              <h2 id="interview-settings-activities-title" className="text-sm font-semibold text-[#1E293B] dark:text-white">Activities</h2>
              <button type="button" aria-label="Close activities" onClick={() => setActivitiesOpen(false)} className="rounded p-1 text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-[#475569]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 text-xs text-[#64748B] dark:text-[#94A3B8]">No recent activities for these session-only settings.</p>
          </section>
        </div>
      )}
    </section>
  );
};
