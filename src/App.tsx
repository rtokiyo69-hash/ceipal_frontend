
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
import { AIMatchingJobs } from './features/jobs/AIMatchingJobs';
import { ApplicantProfileSubmission } from './features/jobs/ApplicantProfileSubmission';
import { ClientSubmission } from './features/submissions/ClientSubmission';
import { ApplicantList } from './features/applicants/ApplicantList';
import { ApplicantCreate } from './features/applicants/ApplicantCreate';
import { ApplicantDetail } from './features/applicants/ApplicantDetail';
import { ApplicantMatchingJobs } from './features/applicants/ApplicantMatchingJobs';
import { ApplicantEmailShare } from './features/applicants/ApplicantEmailShare';
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
import { RequisitionAdministration } from './features/admin/RequisitionAdministration';

export default function App() {
  const {
    currentRoute,
    selectedId,
    isAuthenticated,
    isDark,
    currentUser,
  } = useAppStore();

  const isRecruiter = currentUser?.role === 'recruiter';

  const isRecruiterFullBleed =
    isRecruiter &&
    (
      currentRoute === 'applicant-detail' ||
      currentRoute === 'job-detail'
    );

  const isAdminApplicants =
    currentUser?.role === 'admin' &&
    currentRoute === 'applicants';

  const isAdminRequisitions =
    currentUser?.role === 'admin' &&
    (
      currentRoute === 'requisition-code' ||
      currentRoute === 'requisition-lookups' ||
      currentRoute === 'requisition-settings' ||
      currentRoute === 'requisition-workflows'
    );

  const isAdminModuleView =
    currentUser?.role === 'admin' &&
    (
      currentRoute === 'applicants' ||
      currentRoute === 'settings' ||
      currentRoute === 'dashboard' ||
      currentRoute === 'clients'
    );

  const useBlueClayTheme = isAuthenticated;

  // Dark Mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Login and Landing Routes
  if (currentRoute === 'login' || currentRoute === 'landing') {
    return <LoginPage />;
  }

  // Protected Routes
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Route Renderer
  const renderCurrentView = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardRouter />;

      case 'jobs':
        return <JobList />;

      case 'job-new':
        return <JobCreate key="new-job" />;

      case 'job-edit':
        return (
          <JobCreate
            key={`edit-job-${selectedId}`}
            initialMode="manual"
          />
        );

      case 'job-templates':
        return (
          <JobCreate
            key="job-templates"
            initialMode="template"
          />
        );

      case 'job-detail':
        return <JobDetail />;

      case 'matching-jobs':
        return <AIMatchingJobs />;

      case 'applicant-profile-submission':
        return <ApplicantProfileSubmission />;

      case 'client-submission':
        return <ClientSubmission />;

      case 'applicants':
        return <ApplicantList />;

      case 'applicant-new':
        return <ApplicantCreate />;

      case 'applicant-detail':
        return <ApplicantDetail />;

      case 'applicant-matching-jobs':
        return <ApplicantMatchingJobs />;

      case 'applicant-email-share':
        return <ApplicantEmailShare />;

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

      case 'requisition-code':
      case 'requisition-lookups':
      case 'requisition-settings':
      case 'requisition-workflows':
        return <RequisitionAdministration />;

      case 'settings':
        return <PlatformSettings />;

      default:
        return <DashboardRouter />;
    }
  };

  // Layout Conditions
  const isFullBleedView =
    isRecruiterFullBleed ||
    currentRoute === 'applicant-detail' ||
    currentRoute === 'matching-jobs';

  const isCompactAdminView =
    isAdminModuleView ||
    isAdminApplicants ||
    isAdminRequisitions;

  const mainPadding = isFullBleedView
    ? 'p-0'
    : isCompactAdminView
      ? 'px-3 pb-3 pt-0 md:px-4 md:pb-4 md:pt-0'
      : isRecruiter
        ? 'p-4 sm:p-5 md:p-6'
        : 'p-6 md:p-8';

  const isFullWidthView =
    isRecruiter ||
    currentRoute === 'applicant-detail' ||
    currentRoute === 'matching-jobs' ||
    isCompactAdminView;

  // Main Enterprise Application Shell
  return (
    <div
      className={`
        flex h-screen w-screen overflow-hidden
        bg-[#FFFFFF] dark:bg-[#1E40AF]
        text-[#1E293B] dark:text-[#FFFFFF]
        ${isRecruiter ? 'recruiter-shell' : ''}
        ${useBlueClayTheme ? 'blue-clay-theme' : ''}
      `}
    >
      {/* Sidebar */}
      {!isRecruiter && <Sidebar />}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Navigation */}
        <TopBar />

        {/* Viewport Content */}
        <main
          className={`flex-1 overflow-y-auto ${mainPadding}`}
        >
          <div
            className={
              isFullWidthView
                ? 'w-full'
                : 'max-w-7xl mx-auto'
            }
          >
            {renderCurrentView()}
          </div>
        </main>

      </div>

      {/* Global Quick Search Modal */}
      <GlobalSearchModal />
    </div>
  );
}
