/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { LoginPage } from './features/auth/LoginPage';
import { Sidebar } from './components/navigation/Sidebar';
import { TopBar } from './components/navigation/TopBar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Feature Views
import { DashboardRouter } from './features/dashboard/DashboardRouter';
import { JobList } from './features/jobs/JobList';
import { JobCreate } from './features/jobs/JobCreate';
import { JobDetail } from './features/jobs/JobDetail';
import { ApplicantList } from './features/applicants/ApplicantList';
import { ApplicantCreate } from './features/applicants/ApplicantCreate';
import { ApplicantDetail } from './features/applicants/ApplicantDetail';
import { PipelineKanban } from './features/pipeline/PipelineKanban';
import { ClientList } from './features/clients/ClientList';
import { VendorList } from './features/vendors/VendorList';
import { InterviewManagement } from './features/interviews/InterviewManagement';
import { SubmissionList } from './features/submissions/SubmissionList';
import { PlacementList } from './features/placements/PlacementList';
import { AdvancedSearch } from './features/search/AdvancedSearch';
import { TaskManager } from './features/tasks/TaskManager';
import { ReportsAnalytics } from './features/reports/ReportsAnalytics';
import { UserManagement } from './features/admin/UserManagement';
import { PlatformSettings } from './features/settings/PlatformSettings';

export default function App() {
  const { currentRoute, isAuthenticated, isDark, currentUser } = useAppStore();
  const isRecruiter = currentUser?.role === 'recruiter';

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Open the sign-in screen for both the login route and legacy landing links.
  if (currentRoute === 'login' || currentRoute === 'landing') {
    return <LoginPage />;
  }

  // Protected Routes - If unauthenticated, redirect to Login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Main Enterprise Application Shell
  const renderCurrentView = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardRouter />;
      case 'jobs':
        return <JobList />;
      case 'job-new':
        return <JobCreate key="new-job" />;
      case 'job-templates':
        return <JobCreate key="job-templates" initialMode="template" />;
      case 'job-detail':
        return <JobDetail />;
      case 'applicants':
        return <ApplicantList />;
      case 'applicant-new':
        return <ApplicantCreate />;
      case 'applicant-detail':
        return <ApplicantDetail />;
      case 'pipeline':
        return <PipelineKanban />;
      case 'clients':
        return <ClientList />;
      case 'vendors':
        return <VendorList />;
      case 'interviews':
        return <InterviewManagement />;
      case 'submissions':
        return <SubmissionList />;
      case 'placements':
        return <PlacementList />;
      case 'search':
        return <AdvancedSearch />;
      case 'tasks':
        return <TaskManager />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'admin-users':
        return <UserManagement />;
      case 'settings':
        return <PlatformSettings />;
      default:
        return <DashboardRouter />;
    }
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden bg-[#FFF0E8] dark:bg-[#C94039] text-[#252525] dark:text-[#FFF0E8] ${isRecruiter ? 'recruiter-shell' : ''}`}>
      {!isRecruiter && <Sidebar />}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <TopBar />

        {/* Viewport Content */}
        <main className={`flex-1 overflow-y-auto ${isRecruiter || currentRoute === 'applicant-detail' ? 'p-0' : 'p-6 md:p-8'}`}>
          <div className={isRecruiter || currentRoute === 'applicant-detail' ? 'w-full' : 'max-w-7xl mx-auto'}>{renderCurrentView()}</div>
        </main>
      </div>

      {/* Global Quick Search Modal (Cmd+K) */}
      <GlobalSearchModal />
    </div>
  );
}
