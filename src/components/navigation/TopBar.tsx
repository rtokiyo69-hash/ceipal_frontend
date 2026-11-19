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
  LogOut
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { Logo } from '../common/Logo';

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
  const [profileOpen, setProfileOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const getBreadcrumbs = () => {
    switch (currentRoute) {
      case 'dashboard':
        return ['Talent Operations', 'Executive Dashboard'];
      case 'jobs':
        return ['Job Posting', 'All Job Postings'];
      case 'job-new':
        return ['Job Posting', 'New Job Posting'];
      case 'job-detail':
        return ['Job Posting', 'Job Posting Dossier'];
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
      case 'settings':
        return ['System', 'Platform Configuration'];
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
        return ['jobs', 'job-new', 'job-detail'].includes(currentRoute);
      }
      if (route === 'applicants') {
        return ['applicants', 'applicant-new', 'applicant-detail'].includes(currentRoute);
      }
      return currentRoute === route;
    };

    return (
      <header className="h-[52px] px-3 sm:px-5 bg-[#FF6B5E] text-white flex items-center gap-3 sm:gap-6 z-20 shrink-0 shadow-sm">
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
                  ? 'font-semibold'
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
              <div className="absolute right-0 mt-2 w-48 bg-white text-[#252525] border border-[#D5DCE5] rounded shadow-lg py-1 z-50 text-xs">
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
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#FF6B5E] rounded-full" />
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-[#252525] border border-[#D5DCE5] rounded shadow-lg p-3 z-50">
                <div className="text-xs font-semibold pb-2 border-b border-[#E8C8BE]">Notifications</div>
                <p className="text-xs text-[#806B66] pt-3">You’re all caught up.</p>
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

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 pl-1.5 pr-1 rounded hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              aria-label="Open account menu"
              aria-expanded={profileOpen}
            >
              <img src={currentUser.avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-white/60" />
              <span className="hidden lg:block max-w-24 truncate text-xs">{currentUser.name}</span>
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-[#252525] border border-[#D5DCE5] rounded shadow-lg py-1 z-50 text-xs">
                <div className="px-3 py-2 border-b border-[#E8C8BE]">
                  <div className="font-semibold truncate">{currentUser.name}</div>
                  <div className="text-[#806B66] capitalize">{currentUser.role.replace('_', ' ')}</div>
                </div>
                <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#EEF5FC]">
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 px-6 bg-white dark:bg-[#252525] border-b border-[#E8C8BE] dark:border-[#3D3634] flex items-center justify-between gap-6 z-20 shrink-0">
      {/* Zone 1: Contextual breadcrumb trail */}
      <div className="flex items-center gap-2 text-xs font-medium text-[#806B66] dark:text-[#FFD7C9] truncate">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#806B66] shrink-0" />}
            <span
              className={
                idx === breadcrumbs.length - 1
                  ? 'text-[#252525] dark:text-[#FFF0E8] font-semibold truncate'
                  : 'hover:text-[#252525] cursor-pointer transition-colors'
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
          className="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-[#FFF0E8] dark:bg-[#48403E] border border-[#E8C8BE] dark:border-[#3D3634] rounded-xl text-xs text-[#806B66] dark:text-[#FFD7C9] hover:border-[#FF6B5E] hover:bg-[#FFF0E8]/50 transition-colors w-64"
        >
          <Search className="w-3.5 h-3.5 text-[#806B66]" />
          <span className="flex-1 text-left truncate">Search candidates, jobs, clients...</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-[#2B243B] text-[#806B66] dark:text-[#FFF0E8] border border-[#E8C8BE] dark:border-[#65534F] rounded">
            ⌘K
          </kbd>
        </button>

        {/* Quick create menu */}
        <div className="relative">
          <button
            onClick={() => setQuickCreateOpen(!quickCreateOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FF6B5E] hover:bg-[#E85249] text-white text-xs font-semibold rounded-xl shadow-xs shadow-[#FF6B5E]/25 transition-all whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>

          {quickCreateOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#252525] border border-[#E8C8BE] dark:border-[#3D3634] rounded-2xl shadow-xl py-1.5 z-50 text-xs">
              <button
                onClick={() => {
                  navigate('job-new');
                  setQuickCreateOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[#252525] dark:text-[#FFF0E8] hover:bg-[#FFF0E8] dark:hover:bg-[#48403E] hover:text-[#252525] transition-colors"
              >
                <Briefcase className="w-4 h-4 text-[#252525]" />
                <span>New Job Posting</span>
              </button>

              <button
                onClick={() => {
                  navigate('applicant-new');
                  setQuickCreateOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[#252525] dark:text-[#FFF0E8] hover:bg-[#FFF0E8] dark:hover:bg-[#48403E] hover:text-[#252525] transition-colors"
              >
                <UserPlus className="w-4 h-4 text-[#8AC9A7]" />
                <span>Add &amp; Parse Candidate</span>
              </button>

              <button
                onClick={() => {
                  navigate('interviews');
                  setQuickCreateOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[#252525] dark:text-[#FFF0E8] hover:bg-[#FFF0E8] dark:hover:bg-[#48403E] hover:text-[#252525] transition-colors"
              >
                <Calendar className="w-4 h-4 text-[#252525]" />
                <span>Schedule Interview</span>
              </button>

              <button
                onClick={() => {
                  navigate('clients');
                  setQuickCreateOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[#252525] dark:text-[#FFF0E8] hover:bg-[#FFF0E8] dark:hover:bg-[#48403E] hover:text-[#252525] transition-colors"
              >
                <Building2 className="w-4 h-4 text-[#252525]" />
                <span>Add Enterprise Client</span>
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-[#806B66] dark:text-[#FFD7C9] hover:text-[#252525] dark:hover:text-[#FFF0E8] rounded-xl hover:bg-[#FFF0E8] dark:hover:bg-[#48403E] transition-colors border border-transparent hover:border-[#E8C8BE]"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF6B5E] rounded-full" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#252525] border border-[#E8C8BE] dark:border-[#3D3634] rounded-2xl shadow-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8C8BE] dark:border-[#3D3634]">
                <span className="text-xs font-semibold text-[#252525] dark:text-white">Live Activity Alerts</span>
                <span className="text-[10px] text-[#252525] font-mono font-semibold bg-[#FFF0E8] dark:bg-[#48403E] px-2 py-0.5 rounded-full">
                  3 Unread
                </span>
              </div>
              <div className="divide-y divide-[#E8C8BE] dark:divide-[#3D3634] max-h-72 overflow-y-auto">
                <div className="py-2.5">
                  <div className="text-xs font-medium text-[#252525] dark:text-white">
                    Round 2 Confirmed: Ananya Deshmukh
                  </div>
                  <div className="text-[11px] text-[#806B66] dark:text-[#FFD7C9]">
                    CloudScale VP confirmed 2:00 PM PST session.
                  </div>
                  <div className="text-[10px] font-mono text-[#8AC9A7] mt-1 font-semibold">12m ago</div>
                </div>

                <div className="py-2.5">
                  <div className="text-xs font-medium text-[#252525] dark:text-white">
                    Offer Letter Released: Devon Sterling
                  </div>
                  <div className="text-[11px] text-[#806B66] dark:text-[#FFD7C9]">
                    FinEdge Capital extended formal offer ($165k).
                  </div>
                  <div className="text-[10px] font-mono text-[#252525] mt-1 font-semibold">1h ago</div>
                </div>

                <div className="py-2.5">
                  <div className="text-xs font-medium text-[#252525] dark:text-white">
                    Submission Approval Needed
                  </div>
                  <div className="text-[11px] text-[#806B66] dark:text-[#FFD7C9]">
                    Nora Al-Mansoor submitted to NovaPay Systems.
                  </div>
                  <div className="text-[10px] font-mono text-[#252525] mt-1 font-semibold">3h ago</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle (Light/Dark) */}
        <button
          onClick={toggleTheme}
          className="p-2 text-[#806B66] dark:text-[#FFD7C9] hover:text-[#252525] dark:hover:text-[#FFF0E8] rounded-xl hover:bg-[#FFF0E8] dark:hover:bg-[#48403E] transition-colors border border-transparent hover:border-[#E8C8BE]"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun className="w-4 h-4 text-[#252525]" /> : <Moon className="w-4 h-4 text-[#252525]" />}
        </button>

        {/* Role badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#FFF0E8] dark:bg-[#48403E] rounded-xl border border-[#E8C8BE] dark:border-[#65534F] text-[11px] font-mono font-semibold text-[#252525] dark:text-[#FFF0E8]">
          <Sparkles className="w-3 h-3 text-[#252525]" />
          <span className="uppercase">{currentUser?.role?.replace('_', ' ') || 'RECRUITER'}</span>
        </div>
      </div>
    </header>
  );
};
