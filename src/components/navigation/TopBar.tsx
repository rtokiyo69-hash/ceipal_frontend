import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  Briefcase,
  UserPlus,
  Calendar,
  Building2,
  CheckCircle2,
  Sparkles,
  LogOut,
  UserRound,
  KeyRound,
  ShieldCheck,
  BookOpen,
  X
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { Logo } from '../common/Logo';
import type { AppRoute } from '../../store/appStore';
import type { User } from '../../types';

type AccountPanel = 'profile' | 'password' | 'otp' | 'guide' | null;

interface AccountMenuProps {
  user: User;
  variant: 'recruiter' | 'standard';
  onLogout: () => void;
  onOpenPanel: (panel: Exclude<AccountPanel, null>) => void;
}

const AccountMenu: React.FC<AccountMenuProps> = ({ user, variant, onLogout, onOpenPanel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isRecruiter = variant === 'recruiter';
  const buttonClassName = isRecruiter
    ? 'flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white'
    : 'flex items-center gap-2 rounded-xl border border-[#D8E3F1] bg-white px-2.5 py-1.5 text-[#1E293B] transition-colors hover:bg-[#FFFFFF] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white dark:hover:bg-[#475569]';
  const menuItemClassName = 'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-[#1E293B] transition-colors hover:bg-[#FFFFFF] dark:text-white dark:hover:bg-[#475569]';

  const openPanel = (panel: Exclude<AccountPanel, null>) => {
    setIsOpen(false);
    onOpenPanel(panel);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={buttonClassName}
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <img src={user.avatar} alt="" className="h-7 w-7 rounded-full border border-white/60 object-cover" />
        <span className={`max-w-32 truncate text-xs ${isRecruiter ? 'hidden sm:block' : 'hidden md:block'}`}>{user.name}</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Account options"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-[#D8E3F1] bg-white text-[#1E293B] shadow-xl dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
        >
          <div className="flex items-start gap-3 border-b border-[#D8E3F1] px-4 py-3 dark:border-[#334155]">
            <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold">{user.name}</div>
              <div className="text-[11px] capitalize text-[#64748B] dark:text-[#BFDBFE]">{user.role.replace(/_/g, ' ')}</div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close account menu" className="rounded p-1 text-[#64748B] hover:bg-[#FFFFFF] dark:text-[#BFDBFE] dark:hover:bg-[#475569]">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-2">
            <button type="button" role="menuitem" onClick={() => openPanel('profile')} className={menuItemClassName}>
              <UserRound className="h-4 w-4 text-[#64748B]" />
              View Profile
            </button>
            <button type="button" role="menuitem" onClick={() => openPanel('password')} className={menuItemClassName}>
              <KeyRound className="h-4 w-4 text-[#64748B]" />
              Change Password
            </button>
            <button type="button" role="menuitem" onClick={() => openPanel('otp')} className={menuItemClassName}>
              <ShieldCheck className="h-4 w-4 text-[#64748B]" />
              Generate OTP
            </button>
            <button type="button" role="menuitem" onClick={() => openPanel('guide')} className={menuItemClassName}>
              <BookOpen className="h-4 w-4 text-[#64748B]" />
              User Guide
            </button>
          </div>

          <div className="border-t border-[#D8E3F1] p-2 dark:border-[#334155]">
            <button type="button" role="menuitem" onClick={() => { setIsOpen(false); onLogout(); }} className={`${menuItemClassName} font-semibold`}>
              <LogOut className="h-4 w-4 text-[#E05252]" />
              Sign Out
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[#FFFFFF] px-4 py-3 text-xs font-semibold text-[#2B2D42] dark:bg-[#475569] dark:text-[#FFFFFF]">
            <Building2 className="h-4 w-4" />
            Ampcus Tech Pvt Ltd.
          </div>
        </div>
      )}
    </div>
  );
};

interface AccountDialogProps {
  panel: AccountPanel;
  user: User;
  onClose: () => void;
  onNavigate: (route: AppRoute) => void;
}

const AccountDialog: React.FC<AccountDialogProps> = ({ panel, user, onClose, onNavigate }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [otpPreview, setOtpPreview] = useState('');

  if (!panel) return null;

  const titles: Record<Exclude<AccountPanel, null>, string> = {
    profile: 'View Profile',
    password: 'Change Password',
    otp: 'Generate OTP',
    guide: 'User Guide'
  };

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      setPasswordMessage('Use at least 8 characters for the new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage('The new password and confirmation do not match.');
      return;
    }
    setPasswordMessage('The form is valid, but this demo has no password service. No password was changed.');
  };

  const handleGenerateOtp = () => {
    const randomValue = new Uint32Array(1);
    window.crypto.getRandomValues(randomValue);
    setOtpPreview(String(100000 + (randomValue[0] % 900000)));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-dialog-title"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#D8E3F1] bg-white text-[#1E293B] shadow-2xl dark:border-[#334155] dark:bg-[#1E293B] dark:text-white"
      >
        <div className="flex items-center justify-between border-b border-[#D8E3F1] px-5 py-4 dark:border-[#334155]">
          <h2 id="account-dialog-title" className="text-base font-bold">{titles[panel]}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 text-[#64748B] hover:bg-[#FFFFFF] dark:text-[#BFDBFE] dark:hover:bg-[#475569]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5 text-sm">
          {panel === 'profile' && (
            <>
              <div className="flex items-center gap-4">
                <img src={user.avatar} alt="" className="h-16 w-16 rounded-full object-cover ring-2 ring-[#D8E3F1]" />
                <div>
                  <div className="font-semibold">{user.name}</div>
                  <div className="capitalize text-[#64748B] dark:text-[#BFDBFE]">{user.role.replace(/_/g, ' ')}</div>
                </div>
              </div>
              <dl className="grid gap-3 rounded-xl bg-[#FFFFFF] p-4 text-xs dark:bg-[#475569] sm:grid-cols-2">
                <div><dt className="text-[#64748B] dark:text-[#BFDBFE]">Title</dt><dd className="mt-1 font-medium">{user.title || 'Not provided'}</dd></div>
                <div><dt className="text-[#64748B] dark:text-[#BFDBFE]">Email</dt><dd className="mt-1 break-all font-medium">{user.email || 'Not provided'}</dd></div>
                <div><dt className="text-[#64748B] dark:text-[#BFDBFE]">Business unit</dt><dd className="mt-1 font-medium">{user.businessUnit || 'Not provided'}</dd></div>
                <div><dt className="text-[#64748B] dark:text-[#BFDBFE]">Phone</dt><dd className="mt-1 font-medium">{user.phone || 'Not provided'}</dd></div>
              </dl>
            </>
          )}

          {panel === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <label className="block text-xs font-medium">
                Current password
                <input type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#D8E3F1] bg-white px-3 py-2 text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#2B2D42] dark:text-white" />
              </label>
              <label className="block text-xs font-medium">
                New password
                <input type="password" autoComplete="new-password" required minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#D8E3F1] bg-white px-3 py-2 text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#2B2D42] dark:text-white" />
              </label>
              <label className="block text-xs font-medium">
                Confirm new password
                <input type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#D8E3F1] bg-white px-3 py-2 text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#2B2D42] dark:text-white" />
              </label>
              {passwordMessage && <p role="status" className="rounded-lg bg-[#FFFFFF] p-3 text-xs text-[#64748B] dark:bg-[#475569] dark:text-[#BFDBFE]">{passwordMessage}</p>}
              <button type="submit" className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8]">Validate password change</button>
              <p className="text-[11px] text-[#64748B] dark:text-[#BFDBFE]">Front-end demo only. A secure authentication service is required to save a password.</p>
            </form>
          )}

          {panel === 'otp' && (
            <div className="space-y-4">
              <p className="text-xs text-[#64748B] dark:text-[#BFDBFE]">Generate a visual preview code for this demo account.</p>
              <button type="button" onClick={handleGenerateOtp} className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8]">Generate preview code</button>
              {otpPreview && <div className="rounded-xl bg-[#FFFFFF] p-4 text-center dark:bg-[#475569]"><div className="font-mono text-2xl font-bold tracking-[0.3em]">{otpPreview}</div></div>}
              <p role="note" className="text-[11px] text-[#64748B] dark:text-[#BFDBFE]">Demo only: this code is not sent, stored, or accepted for authentication. OTP delivery and verification require a backend.</p>
            </div>
          )}

          {panel === 'guide' && (
            <div className="space-y-4">
              <p className="text-xs text-[#64748B] dark:text-[#BFDBFE]">Choose a workspace area to get started. Your role determines which actions are available.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {([
                  ['Dashboard', 'dashboard'],
                  ['Job Posting', 'jobs'],
                  ['Applicants', 'applicants'],
                  ['Submissions', 'submissions']
                ] as const).map(([label, route]) => (
                  <button
                    key={route}
                    type="button"
                    onClick={() => onNavigate(route)}
                    className="rounded-lg border border-[#D8E3F1] px-3 py-2.5 text-left text-xs font-medium hover:bg-[#FFFFFF] dark:border-[#334155] dark:hover:bg-[#475569]"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export const TopBar: React.FC = () => {
  const {
    currentRoute,
    navigate,
    currentUser,
    logout,
    isDark,
    toggleTheme,
    setGlobalSearch
  } = useAppStore();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [accountPanel, setAccountPanel] = useState<AccountPanel>(null);
  const prefersReducedMotion = useReducedMotion();

  const getBreadcrumbs = () => {
    switch (currentRoute) {
      case 'dashboard':
        return currentUser?.role === 'admin'
          ? ['Administration', 'Global Settings']
          : ['Talent Operations', 'Executive Dashboard'];
      case 'jobs':
        return currentUser?.role === 'admin'
          ? ['Recruitment', 'Requisitions']
          : ['Job Posting', 'All Job Postings'];
      case 'job-new':
        return ['Job Posting', 'New Job Posting'];
      case 'job-edit':
        return ['Job Posting', 'Edit Job Posting'];
      case 'job-detail':
        return ['Job Posting', 'Job Posting Dossier'];
      case 'client-submission':
        return ['Job Posting', 'Client Submission'];
      case 'applicants':
        return ['Talent Pool', 'Candidate Roster'];
      case 'applicant-new':
        return ['Talent Pool', 'Fast Resume Parse'];
      case 'applicant-detail':
        return ['Talent Pool', 'Candidate Dossier'];
      case 'pipeline':
        return ['Recruitment Funnel', 'Interactive Kanban'];
      case 'clients':
        return ['Accounts', 'Enterprise Client Directory'];
      case 'vendors':
        return ['Partners', 'Vendor Staffing Agencies'];
      case 'interviews':
        return ['Schedules', 'Interview Calendar'];
      case 'submissions':
        return ['Submissions', 'Manager Review & Client Dispatch'];
      case 'placements':
        return ['Workforce', 'Active Placements & Billing'];
      case 'search':
        return ['Talent Intelligence', 'Advanced Boolean Search'];
      case 'tasks':
        return ['Workflows', 'Action Items & SLA Reminders'];
      case 'reports':
        return ['Analytics', 'Recruiter Performance & Hiring Velocity'];
      case 'admin-users':
        return ['Governance', 'Users, Roles & Access Control'];
      case 'requisition-code':
        return ['Requisitions', 'Job Requisition Code'];
      case 'requisition-lookups':
        return ['Requisitions', 'Job Requisition Lookups'];
      case 'requisition-settings':
        return ['Requisitions', 'Job Requisition Settings'];
      case 'requisition-workflows':
        return ['Requisitions', 'Requisition Workflows'];
      case 'settings':
        return ['Administration', 'Global Settings'];
      default:
        return ['Talent Operations'];
    }
  };

  const breadcrumbs = getBreadcrumbs();

  if (currentUser?.role === 'recruiter') {
    const recruiterTabs = [
      { label: 'Job Posting', route: 'jobs' as const },
      { label: 'Applicants', route: 'applicants' as const },
      { label: 'Client', route: 'clients' as const },
      { label: 'Job Templates', route: 'job-templates' as const }
    ];
    const isTabActive = (route: (typeof recruiterTabs)[number]['route']) => {
      if (route === 'jobs') {
        return ['jobs', 'job-new', 'job-edit', 'job-detail', 'client-submission'].includes(currentRoute);
      }
      if (route === 'applicants') {
        return ['applicants', 'applicant-new', 'applicant-detail', 'client-submission'].includes(currentRoute);
      }
      return currentRoute === route;
    };

    return (
      <header className="h-[52px] px-3 sm:px-5 bg-[#2563EB] text-white flex items-center gap-3 sm:gap-6 z-20 shrink-0 shadow-sm">
        <button
          onClick={() => navigate('dashboard')}
          className="flex items-center shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white rounded"
          aria-label="ATS dashboard"
        >
          <Logo size="sm" />
        </button>

        <nav aria-label="Recruiter navigation" className="flex items-center gap-1 overflow-x-auto min-w-0">
          {recruiterTabs.map((tab) => (
            <motion.button
              key={tab.route}
              onClick={() => navigate(tab.route)}
              aria-current={isTabActive(tab.route) ? 'page' : undefined}
              whileHover={prefersReducedMotion ? undefined : { y: -1, scale: 1.01 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 460, damping: 32, mass: 0.45 }}
              className={`relative isolate px-2.5 sm:px-3 py-2 rounded-xl border border-transparent text-xs sm:text-[13px] whitespace-nowrap ${
                isTabActive(tab.route)
                  ? 'font-semibold text-[#17345C]'
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
            >
              {isTabActive(tab.route) && (
                <motion.span
                  layoutId="module-selection-glass"
                  className="topbar-module-active"
                  aria-hidden="true"
                  transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </motion.button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={() => setGlobalSearch(true)}
            className="p-2 rounded hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            title="Search"
            aria-label="Search candidates, jobs, and clients"
          >
            <Search className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setQuickCreateOpen(!quickCreateOpen)}
              className="p-2 rounded hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              title="Create"
              aria-label="Create"
              aria-expanded={quickCreateOpen}
            >
              <Plus className="w-5 h-5" />
            </button>
            {quickCreateOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-[#1E293B] border border-[#D5DCE5] rounded shadow-lg py-1 z-50 text-xs">
                <button onClick={() => { navigate('job-new'); setQuickCreateOpen(false); }} className="w-full px-3 py-2 text-left hover:bg-[#EEF5FC]">New Job Posting</button>
                <button onClick={() => { navigate('applicant-new'); setQuickCreateOpen(false); }} className="w-full px-3 py-2 text-left hover:bg-[#EEF5FC]">Add Applicant</button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              title="Notifications"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#2563EB] rounded-full" />
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-[#1E293B] border border-[#D5DCE5] rounded shadow-lg p-3 z-50">
                <div className="text-xs font-semibold pb-2 border-b border-[#D8E3F1]">Notifications</div>
                <p className="text-xs text-[#64748B] pt-3">You’re all caught up.</p>
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <AccountMenu
            user={currentUser}
            variant="recruiter"
            onLogout={logout}
            onOpenPanel={setAccountPanel}
          />
        </div>
        <AccountDialog
          panel={accountPanel}
          user={currentUser}
          onClose={() => setAccountPanel(null)}
          onNavigate={(route) => { setAccountPanel(null); navigate(route); }}
        />
      </header>
    );
  }

  return (
    <header className="h-16 px-6 bg-white dark:bg-[#1E293B] border-b border-[#D8E3F1] dark:border-[#334155] flex items-center justify-between gap-6 z-20 shrink-0">
      {/* Zone 1: Contextual breadcrumb trail */}
      <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] dark:text-[#BFDBFE] truncate">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#64748B] shrink-0" />}
            <span
              className={
                idx === breadcrumbs.length - 1
                  ? 'text-[#1E293B] dark:text-[#FFFFFF] font-semibold truncate'
                  : 'hover:text-[#1E293B] cursor-pointer transition-colors'
              }
            >
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Zone 2: Global Search & Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Global Search Pill (Off-white bg, Light Grey border, Charcoal text) */}
        <button
          onClick={() => setGlobalSearch(true)}
          className="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-[#FFFFFF] dark:bg-[#475569] border border-[#D8E3F1] dark:border-[#334155] rounded-xl text-xs text-[#64748B] dark:text-[#BFDBFE] hover:border-[#2563EB] hover:bg-[#FFFFFF]/50 transition-colors w-64"
        >
          <Search className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="flex-1 text-left truncate">Search candidates, jobs, clients...</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-[#2B243B] text-[#64748B] dark:text-[#FFFFFF] border border-[#D8E3F1] dark:border-[#475569] rounded">
            ⌘K
          </kbd>
        </button>

        {/* Quick create menu */}
        <div className="relative">
          <button
            onClick={() => setQuickCreateOpen(!quickCreateOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl shadow-xs shadow-[#2563EB]/25 transition-all whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>

          {quickCreateOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-2xl shadow-xl py-1.5 z-50 text-xs">
              <button
                onClick={() => {
                  navigate('job-new');
                  setQuickCreateOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[#1E293B] dark:text-[#FFFFFF] hover:bg-[#FFFFFF] dark:hover:bg-[#475569] hover:text-[#1E293B] transition-colors"
              >
                <Briefcase className="w-4 h-4 text-[#1E293B]" />
                <span>New Job Posting</span>
              </button>

              <button
                onClick={() => {
                  navigate('applicant-new');
                  setQuickCreateOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[#1E293B] dark:text-[#FFFFFF] hover:bg-[#FFFFFF] dark:hover:bg-[#475569] hover:text-[#1E293B] transition-colors"
              >
                <UserPlus className="w-4 h-4 text-[#8AC9A7]" />
                <span>Add &amp; Parse Candidate</span>
              </button>

              <button
                onClick={() => {
                  navigate('interviews');
                  setQuickCreateOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[#1E293B] dark:text-[#FFFFFF] hover:bg-[#FFFFFF] dark:hover:bg-[#475569] hover:text-[#1E293B] transition-colors"
              >
                <Calendar className="w-4 h-4 text-[#1E293B]" />
                <span>Schedule Interview</span>
              </button>

              <button
                onClick={() => {
                  navigate('clients');
                  setQuickCreateOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[#1E293B] dark:text-[#FFFFFF] hover:bg-[#FFFFFF] dark:hover:bg-[#475569] hover:text-[#1E293B] transition-colors"
              >
                <Building2 className="w-4 h-4 text-[#1E293B]" />
                <span>Add Enterprise Client</span>
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-[#64748B] dark:text-[#BFDBFE] hover:text-[#1E293B] dark:hover:text-[#FFFFFF] rounded-xl hover:bg-[#FFFFFF] dark:hover:bg-[#475569] transition-colors border border-transparent hover:border-[#D8E3F1]"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2563EB] rounded-full" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-2xl shadow-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#D8E3F1] dark:border-[#334155]">
                <span className="text-xs font-semibold text-[#1E293B] dark:text-white">Live Activity Alerts</span>
                <span className="text-[10px] text-[#1E293B] font-mono font-semibold bg-[#FFFFFF] dark:bg-[#475569] px-2 py-0.5 rounded-full">
                  3 Unread
                </span>
              </div>
              <div className="divide-y divide-[#D8E3F1] dark:divide-[#334155] max-h-72 overflow-y-auto">
                <div className="py-2.5">
                  <div className="text-xs font-medium text-[#1E293B] dark:text-white">
                    Round 2 Confirmed: Ananya Deshmukh
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#BFDBFE]">
                    CloudScale VP confirmed 2:00 PM PST session.
                  </div>
                  <div className="text-[10px] font-mono text-[#8AC9A7] mt-1 font-semibold">12m ago</div>
                </div>

                <div className="py-2.5">
                  <div className="text-xs font-medium text-[#1E293B] dark:text-white">
                    Offer Letter Released: Devon Sterling
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#BFDBFE]">
                    FinEdge Capital extended formal offer ($165k).
                  </div>
                  <div className="text-[10px] font-mono text-[#1E293B] mt-1 font-semibold">1h ago</div>
                </div>

                <div className="py-2.5">
                  <div className="text-xs font-medium text-[#1E293B] dark:text-white">
                    Submission Approval Needed
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#BFDBFE]">
                    Nora Al-Mansoor submitted to NovaPay Systems.
                  </div>
                  <div className="text-[10px] font-mono text-[#1E293B] mt-1 font-semibold">3h ago</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle (Light/Dark) */}
        <button
          onClick={toggleTheme}
          className="p-2 text-[#64748B] dark:text-[#BFDBFE] hover:text-[#1E293B] dark:hover:text-[#FFFFFF] rounded-xl hover:bg-[#FFFFFF] dark:hover:bg-[#475569] transition-colors border border-transparent hover:border-[#D8E3F1]"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun className="w-4 h-4 text-[#1E293B]" /> : <Moon className="w-4 h-4 text-[#1E293B]" />}
        </button>

        {/* Role badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#FFFFFF] dark:bg-[#475569] rounded-xl border border-[#D8E3F1] dark:border-[#475569] text-[11px] font-mono font-semibold text-[#1E293B] dark:text-[#FFFFFF]">
          <Sparkles className="w-3 h-3 text-[#1E293B]" />
          <span className="uppercase">{currentUser?.role?.replace('_', ' ') || 'RECRUITER'}</span>
        </div>
        {currentUser && (
          <AccountMenu
            user={currentUser}
            variant="standard"
            onLogout={logout}
            onOpenPanel={setAccountPanel}
          />
        )}
      </div>
      {currentUser && (
        <AccountDialog
          panel={accountPanel}
          user={currentUser}
          onClose={() => setAccountPanel(null)}
          onNavigate={(route) => { setAccountPanel(null); navigate(route); }}
        />
      )}
    </header>
  );
};
