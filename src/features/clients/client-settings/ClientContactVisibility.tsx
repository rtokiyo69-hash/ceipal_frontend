import React, { useState } from 'react';
import { Clock3, CheckCircle, X } from 'lucide-react';
import { useAppStore } from '../../../store/appStore';
import { ClientActivityLogItem, INITIAL_CLIENT_ACTIVITIES } from '../../../services/clientSettingsMockData';

export const ClientContactVisibility: React.FC = () => {
  const { currentUser } = useAppStore();
  const [assignTarget, setAssignTarget] = useState<boolean>(false);
  const [activities, setActivities] = useState<ClientActivityLogItem[]>(INITIAL_CLIENT_ACTIVITIES);
  const [activitiesOpen, setActivitiesOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggle = () => {
    const nextVal = !assignTarget;
    setAssignTarget(nextVal);
    const author = currentUser?.name || 'Sachin Wadeyar';
    const log: ClientActivityLogItem = {
      id: `act-${Date.now()}`,
      action: 'Visibility Setting Toggled',
      user: author,
      timestamp: 'Just now',
      details: `Assign target to Sales Manager/User set to ${nextVal ? 'Enabled' : 'Disabled'}.`
    };
    setActivities([log, ...activities]);
    showToast(`Setting updated: ${nextVal ? 'Enabled' : 'Disabled'}.`);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2.5 text-xs text-white shadow-xl animate-in fade-in">
          <CheckCircle className="h-4 w-4 text-[#8AC9A7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="rounded-2xl border border-[#D8E3F1] bg-white p-6 shadow-sm dark:border-[#334155] dark:bg-[#1E293B]">
        {/* Card Header with Activities Button */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 dark:border-[#334155]">
          <div>
            <h2 className="text-base font-bold text-[#1E293B] dark:text-white">
              Client Contact Visibility
            </h2>
            <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
              Configure sales manager assignment rules when client contacts are created.
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

        {/* Toggle Option */}
        <div className="flex items-center justify-between py-6">
          <div className="space-y-0.5 pr-4">
            <span className="text-xs font-medium text-[#1E293B] dark:text-slate-200">
              Assign Target to Sales Manager/User When Client Contacts are Created
            </span>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Automatically link new contacts to the corresponding Sales Manager account.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={assignTarget}
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              assignTarget ? 'bg-[#2563EB]' : 'bg-[#CBD5E1] dark:bg-[#475569]'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                assignTarget ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
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
