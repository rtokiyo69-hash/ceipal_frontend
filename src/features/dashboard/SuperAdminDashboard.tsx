import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Building2,
  Layers,
  Award,
  Shield,
  Activity,
  DollarSign,
  TrendingUp,
  Settings,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { Job, Applicant, Client, Vendor, ActivityLog } from '../../types';

export const SuperAdminDashboard: React.FC = () => {
  const { navigate, currentUser } = useAppStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    Promise.all([
      ApiService.getJobs(),
      ApiService.getApplicants(),
      ApiService.getClients(),
      ApiService.getVendors(),
      ApiService.getActivities()
    ]).then(([j, a, c, v, act]) => {
      setJobs(j);
      setApplicants(a);
      setClients(c);
      setVendors(v);
      setActivities(act);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Executive command banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#2B2D42] via-[#125B97] to-[#2B2D42] text-white p-6 sm:p-7 rounded-2xl border border-[#083F70] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-[#EDF2F4] text-[11px] font-mono font-medium">
            <Sparkles className="w-3 h-3 text-[#2B2D42]" />
            <span>SUPER ADMIN CONSOLE · GLOBAL ENTERPRISE TENANT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white">
            Global Operations Command, {currentUser?.name || 'Elena'}
          </h1>
          <p className="text-xs text-[#EDF2F4] max-w-xl">
            All 4 global business units operational · 99.98% platform uptime · SOC2 Type II compliance verified.
          </p>
        </div>

        <div className="relative z-10 flex gap-2.5 shrink-0">
          <button
            onClick={() => navigate('admin-users')}
            className="px-4 py-2 bg-[#2B2D42] hover:bg-[#222336] text-white text-xs font-semibold rounded-xl shadow-xs shadow-[#2B2D42]/30 transition-all flex items-center gap-1.5"
          >
            <Shield className="w-4 h-4" />
            <span>Manage Access &amp; Roles</span>
          </button>
          <button
            onClick={() => navigate('settings')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-colors backdrop-blur-xs"
          >
            System Settings
          </button>
        </div>
      </div>

      {/* Super Admin 9 KPI Cards: White #FFFFFF, Light Grey #D7DCE5 borders */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        <div className="p-3 bg-white dark:bg-[#2B2D42] border border-[#D7DCE5] dark:border-[#45485E] rounded-2xl shadow-xs">
          <div className="text-[11px] text-[#8D99AE] dark:text-[#B9CAD9] font-medium">Employees</div>
          <div className="text-xl font-bold font-mono text-[#2B2D42] dark:text-white mt-1 tabular-nums">248</div>
          <div className="text-[10px] text-[#276749] dark:text-[#8AC9A7] mt-0.5 font-semibold">Across 4 hubs</div>
        </div>

        <div className="p-3 bg-white dark:bg-[#2B2D42] border border-[#D7DCE5] dark:border-[#45485E] rounded-2xl shadow-xs">
          <div className="text-[11px] text-[#8D99AE] dark:text-[#B9CAD9] font-medium">Platform Users</div>
          <div className="text-xl font-bold font-mono text-[#2B2D42] dark:text-white mt-1 tabular-nums">42</div>
          <div className="text-[10px] text-[#276749] dark:text-[#8AC9A7] mt-0.5 font-semibold">Active licenses</div>
        </div>

        <div className="p-3 bg-white dark:bg-[#2B2D42] border border-[#D7DCE5] dark:border-[#45485E] rounded-2xl shadow-xs">
          <div className="text-[11px] text-[#8D99AE] dark:text-[#B9CAD9] font-medium">Recruiters</div>
          <div className="text-xl font-bold font-mono text-[#2B2D42] dark:text-[#EDF2F4] mt-1 tabular-nums">28</div>
          <div className="text-[10px] text-[#8D99AE] dark:text-[#B9CAD9] mt-0.5">Assigned</div>
        </div>

        <div className="p-3 bg-white dark:bg-[#2B2D42] border border-[#D7DCE5] dark:border-[#45485E] rounded-2xl shadow-xs">
          <div className="text-[11px] text-[#8D99AE] dark:text-[#B9CAD9] font-medium">Managers</div>
          <div className="text-xl font-bold font-mono text-[#2B2D42] dark:text-white mt-1 tabular-nums">6</div>
          <div className="text-[10px] text-[#8D99AE] dark:text-[#B9CAD9] mt-0.5">Practice leads</div>
        </div>

        <div className="p-3 bg-white dark:bg-[#2B2D42] border border-[#D7DCE5] dark:border-[#45485E] rounded-2xl shadow-xs">
          <div className="text-[11px] text-[#8D99AE] dark:text-[#B9CAD9] font-medium">Total Jobs</div>
          <div className="text-xl font-bold font-mono text-[#2B2D42] dark:text-white mt-1 tabular-nums">{jobs.length + 29}</div>
          <div className="text-[10px] text-[#276749] dark:text-[#8AC9A7] mt-0.5 font-semibold">85% Filled</div>
        </div>

        <div className="p-3 bg-white dark:bg-[#2B2D42] border border-[#D7DCE5] dark:border-[#45485E] rounded-2xl shadow-xs">
          <div className="text-[11px] text-[#8D99AE] dark:text-[#B9CAD9] font-medium">Applicants</div>
          <div className="text-xl font-bold font-mono text-[#2B2D42] dark:text-white mt-1 tabular-nums">1,240</div>
          <div className="text-[10px] text-[#276749] dark:text-[#8AC9A7] mt-0.5 font-semibold">+142 this mo</div>
        </div>

        <div className="p-3 bg-white dark:bg-[#2B2D42] border border-[#D7DCE5] dark:border-[#45485E] rounded-2xl shadow-xs">
          <div className="text-[11px] text-[#8D99AE] dark:text-[#B9CAD9] font-medium">Clients</div>
          <div className="text-xl font-bold font-mono text-[#2B2D42] dark:text-white mt-1 tabular-nums">{clients.length + 14}</div>
          <div className="text-[10px] text-[#2B2D42] mt-0.5 font-semibold">3 Renewals</div>
        </div>

        <div className="p-3 bg-white dark:bg-[#2B2D42] border border-[#D7DCE5] dark:border-[#45485E] rounded-2xl shadow-xs">
          <div className="text-[11px] text-[#8D99AE] dark:text-[#B9CAD9] font-medium">Vendors</div>
          <div className="text-xl font-bold font-mono text-[#2B2D42] dark:text-white mt-1 tabular-nums">{vendors.length + 11}</div>
          <div className="text-[10px] text-[#276749] dark:text-[#8AC9A7] mt-0.5 font-semibold">Compliant</div>
        </div>

        <div className="p-3 bg-white dark:bg-[#2B2D42] border border-[#D7DCE5] dark:border-[#45485E] rounded-2xl shadow-xs">
          <div className="text-[11px] text-[#8D99AE] dark:text-[#B9CAD9] font-medium">Placements</div>
          <div className="text-xl font-bold font-mono text-[#276749] dark:text-[#8AC9A7] mt-1 tabular-nums">86</div>
          <div className="text-[10px] text-[#276749] dark:text-[#8AC9A7] mt-0.5 font-semibold">$318k Net Spread</div>
        </div>
      </div>

      {/* Visualizations: Organization & Client Revenue Split */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Enterprise Client Accounts */}
        <div className="lg:col-span-7 bg-white dark:bg-[#2B2D42] border border-[#D7DCE5] dark:border-[#45485E] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#2B2D42] dark:text-white">Enterprise Client Accounts</h2>
              <p className="text-xs text-[#8D99AE] dark:text-[#B9CAD9]">Billing tiers and active contractor count</p>
            </div>
            <button onClick={() => navigate('clients')} className="text-xs font-semibold text-[#2B2D42] hover:text-[#125B97]">
              View All Clients
            </button>
          </div>

          <div className="divide-y divide-[#D7DCE5] dark:divide-[#45485E]">
            {clients.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-[#2B2D42] dark:text-white">{c.name}</div>
                  <div className="text-[11px] text-[#8D99AE] dark:text-[#B9CAD9]">{c.industry} · Account Lead: {c.accountManager}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-[#276749] dark:text-[#8AC9A7]">{c.activePlacements} Placements</div>
                  <div className="text-[10px] font-mono text-[#2B2D42] dark:text-[#EDF2F4]">{c.tier}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Security & Audit Log */}
        <div className="lg:col-span-5 bg-white dark:bg-[#2B2D42] border border-[#D7DCE5] dark:border-[#45485E] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#2B2D42] dark:text-white">Security &amp; Audit Log</h2>
              <p className="text-xs text-[#8D99AE] dark:text-[#B9CAD9]">Immutable system event records</p>
            </div>
            <Activity className="w-4 h-4 text-[#2B2D42]" />
          </div>

          <div className="space-y-3">
            {activities.map((act) => (
              <div key={act.id} className="p-2.5 bg-[#EDF2F4] dark:bg-[#36384F] border border-[#D7DCE5] dark:border-[#45485E] rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#2B2D42] dark:text-white">{act.user}</span>
                  <span className="text-[10px] font-mono text-[#8D99AE]">{act.timestamp}</span>
                </div>
                <div className="text-[#8D99AE] dark:text-[#B9CAD9]">
                  {act.action} <span className="text-[#2B2D42] dark:text-[#EDF2F4] font-medium">{act.target}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => navigate('admin-users')}
              className="text-xs font-semibold text-[#2B2D42] hover:text-[#125B97] hover:underline"
            >
              Export Security Audit Ledger (CSV) →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
