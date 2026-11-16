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

export const PlatformSettings: React.FC = () => {
  const [companyName, setCompanyName] = useState('NexusTalent Technologies Inc.');
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
        <div className="fixed top-20 right-6 z-50 bg-[#0B4F89] text-white border border-[#1769AA] px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#8AC9A7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202B37] dark:text-white">
          System &amp; Enterprise Settings
        </h1>
        <p className="text-xs text-[#6B7785]">
          Configure tenant organization parameters, API integrations, and local mock store
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Organization Information */}
        <div className="p-6 bg-white dark:bg-[#1E1B29] border border-[#DCE6EF] dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-[#202B37] dark:text-white">
            <Building2 className="w-4 h-4 text-[#1769AA]" />
            <span>Organization Parameters</span>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#202B37] dark:text-slate-400 mb-1 font-medium">Tenant Legal Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F8FB] dark:bg-slate-800/60 border border-[#DCE6EF] dark:border-slate-700 rounded-xl text-[#202B37] dark:text-white focus:outline-none focus:border-[#1769AA] focus:ring-1 focus:ring-[#1769AA] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#202B37] dark:text-slate-400 mb-1 font-medium">Default Operating Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F8FB] dark:bg-slate-800/60 border border-[#DCE6EF] dark:border-slate-700 rounded-xl text-[#202B37] dark:text-white focus:outline-none focus:border-[#1769AA]"
              >
                <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                <option value="America/New_York (EST)">America/New_York (EST)</option>
                <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                <option value="Europe/London (GMT)">Europe/London (GMT)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#202B37] dark:text-slate-400 mb-1 font-medium">Base Financial Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F8FB] dark:bg-slate-800/60 border border-[#DCE6EF] dark:border-slate-700 rounded-xl text-[#202B37] dark:text-white focus:outline-none focus:border-[#1769AA]"
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
        <div className="p-6 bg-white dark:bg-[#1E1B29] border border-[#DCE6EF] dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-[#202B37] dark:text-white">
            <Server className="w-4 h-4 text-[#2F80E7]" />
            <span>FastAPI Backend Gateway Target</span>
          </div>
          <p className="text-[#6B7785] leading-relaxed">
            The frontend API layer (<code className="text-[#1769AA] dark:text-[#8CBCE8] font-mono">src/services/api.ts</code>) is designed with exact REST and JSON contracts matching the upcoming FastAPI backend specification.
          </p>

          <div>
            <label className="block text-[#202B37] dark:text-slate-400 mb-1 font-medium">Backend REST Endpoint URL</label>
            <input
              type="text"
              value={fastApiEndpoint}
              onChange={(e) => setFastApiEndpoint(e.target.value)}
              className="w-full px-3 py-2 bg-[#F5F8FB] dark:bg-slate-800/60 border border-[#DCE6EF] dark:border-slate-700 rounded-xl font-mono text-[#202B37] dark:text-white focus:outline-none focus:border-[#1769AA] focus:ring-1 focus:ring-[#1769AA]"
            />
          </div>
        </div>

        {/* Notifications & Automation */}
        <div className="p-6 bg-white dark:bg-[#1E1B29] border border-[#DCE6EF] dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-[#202B37] dark:text-white">
            <Bell className="w-4 h-4 text-[#8AC9A7]" />
            <span>Automated Notifications</span>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notifySubmissions}
                onChange={(e) => setNotifySubmissions(e.target.checked)}
                className="rounded border-[#DCE6EF] text-[#1769AA] focus:ring-[#1769AA]"
              />
              <span className="text-[#202B37] dark:text-slate-300 font-medium">
                Notify Practice Lead on all candidate submissions
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyInterviews}
                onChange={(e) => setNotifyInterviews(e.target.checked)}
                className="rounded border-[#DCE6EF] text-[#1769AA] focus:ring-[#1769AA]"
              />
              <span className="text-[#202B37] dark:text-slate-300 font-medium">
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
            className="px-5 py-2.5 bg-[#2F80E7] hover:bg-[#216BC4] text-white rounded-xl font-semibold shadow-xs shadow-[#2F80E7]/30 transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
