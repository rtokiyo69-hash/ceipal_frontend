import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Server,
  Bell,
  RotateCcw,
  CheckCircle,
  Save,
  Globe,
  Sliders
} from 'lucide-react';
import { ApiService } from '../../services/api';

const workspaceSubmodules = [
  'Custom Fields',
  'Email Settings',
  'Consent Settings',
  'Lookups',
  'Mandatory Fields',
  'Encryption Fields'
];

export const PlatformSettings: React.FC = () => {
  const [activeSubmodule, setActiveSubmodule] = useState(workspaceSubmodules[0]);
  const [companyName, setCompanyName] = useState('ATS Technologies Inc.');
  const [timezone, setTimezone] = useState('America/Los_Angeles (PST)');
  const [currency, setCurrency] = useState('USD ($)');
  const [fastApiEndpoint, setFastApiEndpoint] = useState('http://localhost:8000/api/v1');
  const [notifySubmissions, setNotifySubmissions] = useState(true);
  const [notifyInterviews, setNotifyInterviews] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Platform settings saved successfully.');
  };

  const handleResetData = () => {
    ApiService.resetAllData();
    showToast('Local state reset to default enterprise dataset.');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#FF6B5E] text-white border border-[#FF6B5E] px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#8AC9A7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <nav
        aria-label="Global settings submodules"
        className="flex overflow-x-auto rounded-xl border border-[#E8C8BE] bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-[#252525]"
      >
        {workspaceSubmodules.map((submodule) => (
          <button
            key={submodule}
            type="button"
            aria-current={activeSubmodule === submodule ? 'page' : undefined}
            onClick={() => setActiveSubmodule(submodule)}
            className={`shrink-0 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors ${
              activeSubmodule === submodule
                ? 'bg-[#DCE8FF] text-[#125B97] dark:bg-[#48403E] dark:text-white'
                : 'text-[#65534F] hover:bg-[#FFF0E8] hover:text-[#252525] dark:text-[#FFD7C9] dark:hover:bg-[#48403E]'
            }`}
          >
            {submodule}
          </button>
        ))}
      </nav>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Organization Information */}
        <div className="p-6 bg-white dark:bg-[#252525] border border-[#E8C8BE] dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-[#252525] dark:text-white">
            <Building2 className="w-4 h-4 text-[#252525]" />
            <span>Organization Parameters</span>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#252525] dark:text-slate-400 mb-1 font-medium">Tenant Legal Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFF0E8] dark:bg-slate-800/60 border border-[#E8C8BE] dark:border-slate-700 rounded-xl text-[#252525] dark:text-white focus:outline-none focus:border-[#FF6B5E] focus:ring-1 focus:ring-[#FF6B5E] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#252525] dark:text-slate-400 mb-1 font-medium">Default Operating Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFF0E8] dark:bg-slate-800/60 border border-[#E8C8BE] dark:border-slate-700 rounded-xl text-[#252525] dark:text-white focus:outline-none focus:border-[#FF6B5E]"
              >
                <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                <option value="America/New_York (EST)">America/New_York (EST)</option>
                <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                <option value="Europe/London (GMT)">Europe/London (GMT)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#252525] dark:text-slate-400 mb-1 font-medium">Base Financial Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFF0E8] dark:bg-slate-800/60 border border-[#E8C8BE] dark:border-slate-700 rounded-xl text-[#252525] dark:text-white focus:outline-none focus:border-[#FF6B5E]"
              >
                <option value="USD ($)">USD ($)</option>
                <option value="INR (₹)">INR (₹)</option>
                <option value="EUR (€)">EUR (€)</option>
                <option value="GBP (£)">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Future FastAPI Backend Configuration */}
        <div className="p-6 bg-white dark:bg-[#252525] border border-[#E8C8BE] dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-[#252525] dark:text-white">
            <Server className="w-4 h-4 text-[#252525]" />
            <span>FastAPI Backend Gateway Target</span>
          </div>
          <p className="text-[#806B66] leading-relaxed">
            The frontend API layer (<code className="text-[#252525] dark:text-[#806B66] font-mono">src/services/api.ts</code>) is designed with exact REST and JSON contracts matching the upcoming FastAPI backend specification.
          </p>

          <div>
            <label className="block text-[#252525] dark:text-slate-400 mb-1 font-medium">Backend REST Endpoint URL</label>
            <input
              type="text"
              value={fastApiEndpoint}
              onChange={(e) => setFastApiEndpoint(e.target.value)}
              className="w-full px-3 py-2 bg-[#FFF0E8] dark:bg-slate-800/60 border border-[#E8C8BE] dark:border-slate-700 rounded-xl font-mono text-[#252525] dark:text-white focus:outline-none focus:border-[#FF6B5E] focus:ring-1 focus:ring-[#FF6B5E]"
            />
          </div>
        </div>

        {/* Notifications & Automation */}
        <div className="p-6 bg-white dark:bg-[#252525] border border-[#E8C8BE] dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-[#252525] dark:text-white">
            <Bell className="w-4 h-4 text-[#8AC9A7]" />
            <span>Automated Notifications</span>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notifySubmissions}
                onChange={(e) => setNotifySubmissions(e.target.checked)}
                className="rounded border-[#E8C8BE] text-[#252525] focus:ring-[#FF6B5E]"
              />
              <span className="text-[#252525] dark:text-slate-300 font-medium">
                Notify Practice Lead on all candidate submissions
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyInterviews}
                onChange={(e) => setNotifyInterviews(e.target.checked)}
                className="rounded border-[#E8C8BE] text-[#252525] focus:ring-[#FF6B5E]"
              />
              <span className="text-[#252525] dark:text-slate-300 font-medium">
                Dispatch automatic Google Calendar invites for confirmed interviews
              </span>
            </label>
          </div>
        </div>

        {/* Submit & Reset Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="px-4 py-2 border border-rose-300 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#FF6B5E] hover:bg-[#E85249] text-white rounded-xl font-semibold shadow-xs shadow-[#FF6B5E]/30 transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
