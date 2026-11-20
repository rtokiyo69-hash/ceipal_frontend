import React from 'react';
import { useAppStore } from '../../store/appStore';
import { RecruiterDashboard } from './RecruiterDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { PlatformSettings } from '../settings/PlatformSettings';

export const DashboardRouter: React.FC = () => {
  const { currentUser } = useAppStore();

  const role = currentUser?.role || 'recruiter';

  if (role === 'admin') {
    return <PlatformSettings />;
  }

  if (role === 'manager') {
    return <ManagerDashboard />;
  }

  return <RecruiterDashboard />;
};
