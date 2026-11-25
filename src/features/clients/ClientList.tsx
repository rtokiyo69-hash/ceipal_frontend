import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Plus,
  Mail,
  Phone,
  Briefcase,
  Award,
  CheckCircle,
  X,
  ExternalLink,
  MapPin,
  Settings
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { Client } from '../../types';
import { ClientAdmin } from './ClientAdmin';

export const ClientList: React.FC = () => {
  const { navigate, currentUser } = useAppStore();
  const [adminViewMode, setAdminViewMode] = useState<'settings' | 'directory'>('settings');
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('Cloud Infrastructure & SaaS');
  const [location, setLocation] = useState('San Jose, CA');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [tier, setTier] = useState<Client['tier']>('Enterprise Platinum');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    ApiService.getClients().then(setClients);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await ApiService.createClient({
      name,
      industry,
      location,
      contactPerson,
      contactEmail,
      contactPhone,
      accountManager: 'Rajesh Ramanathan',
      activeJobs: 1,
      activePlacements: 0,
      status: 'Active',
      tier
    });
    setClients([created, ...clients]);
    setModalOpen(false);
    showToast(`Enterprise client "${created.name}" created successfully.`);
  };

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase())
  );

  if (currentUser?.role === 'admin' && adminViewMode === 'settings') {
    return <ClientAdmin onSwitchToDirectory={() => setAdminViewMode('directory')} />;
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#2563EB] text-white border border-[#2563EB] px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#8AC9A7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-[#1E293B] dark:text-white">
            Enterprise Client Accounts
          </h1>
          <p className="text-xs text-[#64748B]">
            Manage client billing SLAs, open requisitions, account managers, and placements
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.role === 'admin' && (
            <button
              type="button"
              onClick={() => setAdminViewMode('settings')}
              className="px-3.5 py-2 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] text-[#125B97] dark:text-[#93C5FD] rounded-xl text-xs font-semibold shadow-xs hover:bg-[#F8FAFC] transition-all flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4" />
              <span>Client Admin Settings</span>
            </button>
          )}

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold shadow-xs shadow-[#2563EB]/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Enterprise Client</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search enterprise clients, industries, headquarters..."
            className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] dark:bg-slate-800/80 border border-[#D8E3F1] dark:border-slate-700 rounded-xl text-xs text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
          />
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="p-6 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-slate-800 rounded-2xl shadow-xs space-y-4 hover:border-[#2563EB] dark:hover:border-[#2563EB] transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-[#1E293B] dark:text-[#64748B] font-semibold">{c.clientId}</div>
                <h3 className="text-base font-bold text-[#1E293B] dark:text-white mt-0.5">
                  {c.name}
                </h3>
                <div className="text-xs text-[#64748B]">{c.industry}</div>
              </div>

              <span className="px-2.5 py-1 bg-[#FFFFFF] dark:bg-[#1E293B]/20 border border-[#D8E3F1] dark:border-[#2563EB]/30 text-[#1E293B] dark:text-[#FFFFFF] rounded-lg text-[11px] font-mono font-medium">
                {c.tier}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-[#D8E3F1] dark:border-slate-800">
              <div className="flex items-center gap-2 text-[#64748B]">
                <MapPin className="w-3.5 h-3.5 text-[#1E293B]" />
                <span className="truncate">{c.location}</span>
              </div>
              <div className="flex items-center gap-2 text-[#64748B]">
                <Mail className="w-3.5 h-3.5 text-[#1E293B]" />
                <span className="truncate">{c.contactEmail}</span>
              </div>
            </div>

            {/* Performance Strip */}
            <div className="p-3 bg-[#FFFFFF] dark:bg-slate-800/60 rounded-xl flex items-center justify-between text-xs border border-[#D8E3F1] dark:border-slate-750">
              <div className="flex items-center gap-1.5 text-[#1E293B] dark:text-slate-200">
                <Briefcase className="w-3.5 h-3.5 text-[#1E293B]" />
                <span className="font-bold font-mono text-[#1E293B] dark:text-[#64748B]">{c.activeJobs}</span> Open Requisitions
              </div>
              <div className="flex items-center gap-1.5 text-[#2E7D5B] dark:text-[#8AC9A7]">
                <Award className="w-3.5 h-3.5 text-[#8AC9A7]" />
                <span className="font-bold font-mono text-[#2E7D5B] dark:text-[#8AC9A7]">{c.activePlacements}</span> Active Placements
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="text-[#64748B]">Lead: {c.accountManager}</span>
              <button
                onClick={() => navigate('jobs')}
                className="text-[#1E293B] hover:text-[#1E293B] dark:text-[#64748B] dark:hover:text-white font-semibold transition-colors"
              >
                View Requisitions →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Client Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1E293B] dark:text-white">
                Register Enterprise Client
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-[#64748B] hover:text-[#1E293B] dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#1E293B] dark:text-slate-400 mb-1 font-medium">Client Legal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Global Systems Inc."
                  className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-slate-800 border border-[#D8E3F1] dark:border-slate-700 rounded-xl text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[#1E293B] dark:text-slate-400 mb-1 font-medium">Industry Domain</label>
                <input
                  type="text"
                  required
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-slate-800 border border-[#D8E3F1] dark:border-slate-700 rounded-xl text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1E293B] dark:text-slate-400 mb-1 font-medium">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="David Vance"
                    className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-slate-800 border border-[#D8E3F1] dark:border-slate-700 rounded-xl text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] dark:text-slate-400 mb-1 font-medium">SLA Partnership Tier</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as Client['tier'])}
                    className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-slate-800 border border-[#D8E3F1] dark:border-slate-700 rounded-xl text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="Enterprise Platinum">Enterprise Platinum</option>
                    <option value="Strategic Partner">Strategic Partner</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#1E293B] dark:text-slate-400 mb-1 font-medium">Contact Email</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-slate-800 border border-[#D8E3F1] dark:border-slate-700 rounded-xl text-[#1E293B] dark:text-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 border border-[#D8E3F1] dark:border-slate-700 text-[#64748B] hover:text-[#1E293B] dark:text-slate-300 rounded-xl hover:bg-[#FFFFFF] dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl shadow-xs transition-colors"
                >
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
