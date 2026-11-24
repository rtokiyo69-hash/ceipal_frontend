import { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { ApiService } from '../services/api';
import { INITIAL_USERS } from '../services/mockData';

export type AppRoute =
  | 'landing'
  | 'login'
  | 'dashboard'
  | 'jobs'
  | 'job-new'
  | 'job-edit'
  | 'job-detail'
  | 'applicant-profile-submission'
  | 'client-submission'
  | 'job-templates'
  | 'matching-jobs'
  | 'applicants'
  | 'applicant-new'
  | 'applicant-detail'
  | 'applicant-matching-jobs'
  | 'applicant-email-share'
  | 'pipeline'
  | 'clients'
  | 'vendors'
  | 'interviews'
  | 'submissions'
  | 'placements'
  | 'search'
  | 'tasks'
  | 'reports'
  | 'admin-users'
  | 'requisition-code'
  | 'requisition-lookups'
  | 'requisition-settings'
  | 'requisition-workflows'
  | 'settings';

export type ThemePalette = 'indigo' | 'emerald' | 'teal' | 'violet';

interface AppState {
  currentRoute: AppRoute;
  selectedId?: string;
  currentUser: User | null;
  isAuthenticated: boolean;
  isDark: boolean;
  themePalette: ThemePalette;
  searchOpen: boolean;
  quickCreateOpen: boolean;
  notificationsOpen: boolean;
  selectedRoleForLogin: UserRole;
}

const initialPalette = (localStorage.getItem('talent_theme_palette') as ThemePalette) || 'indigo';

// Parse URL params for direct links / new tab navigation
function parseInitialUrlState(): { route?: AppRoute; id?: string } {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const route = params.get('route') as AppRoute | null;
    const id = params.get('id') || undefined;
    if (route) {
      return { route, id };
    }
  } catch (e) {
    console.error('URL parse error:', e);
  }
  return {};
}

const initialUrlState = parseInitialUrlState();

let initialUser: User | null = null;
let initialAuth = false;
if (typeof localStorage !== 'undefined') {
  try {
    const savedUser = localStorage.getItem('talentember_current_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser) as User;
      if ((parsedUser.role as string) === 'super_admin') {
        initialUser = { ...parsedUser, role: 'admin' };
        localStorage.setItem('talentember_current_user', JSON.stringify(initialUser));
      } else {
        initialUser = parsedUser;
      }
      initialAuth = true;
    }
  } catch (e) {
    console.error('Storage parse error:', e);
  }
}

// If opened directly via a link/new tab (like ?route=job-detail), ensure recruiter access
if (initialUrlState.route && initialUrlState.route !== 'landing' && !initialAuth) {
  initialAuth = true;
  initialUser = INITIAL_USERS[2]; // Priya Sharma (Lead Recruiter)
  ApiService.setCurrentUser(INITIAL_USERS[2]);
}

let globalState: AppState = {
  currentRoute: initialUrlState.route === 'landing' ? 'login' : initialUrlState.route || 'login',
  selectedId: initialUrlState.id,
  currentUser: initialUser,
  isAuthenticated: initialAuth,
  isDark: false,
  themePalette: initialPalette,
  searchOpen: false,
  quickCreateOpen: false,
  notificationsOpen: false,
  selectedRoleForLogin: 'recruiter'
};

export function getJobDetailUrl(jobId: string): string {
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('route', 'job-detail');
    url.searchParams.set('id', jobId);
    return url.toString();
  }
  return `?route=job-detail&id=${jobId}`;
}

// Sync initial data-theme
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', initialPalette);
}

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    const params = new URLSearchParams(window.location.search);
    const requestedRoute = (params.get('route') as AppRoute) || 'login';
    const r = requestedRoute === 'landing' ? 'login' : requestedRoute;
    const id = params.get('id') || undefined;
    globalState.currentRoute = r;
    globalState.selectedId = id;
    if (r !== 'login' && !globalState.isAuthenticated) {
      globalState.isAuthenticated = true;
      globalState.currentUser = INITIAL_USERS[2];
    }
    notify();
  });
}

export function useAppStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const navigate = (route: AppRoute, id?: string) => {
    const nextRoute = route === 'landing' ? 'login' : route;
    globalState.currentRoute = nextRoute;
    globalState.selectedId = id;
    if (typeof window !== 'undefined') {
      try {
        const newUrl = new URL(window.location.href);
        if (nextRoute === 'login') {
          newUrl.searchParams.set('route', 'login');
          newUrl.searchParams.delete('id');
        } else {
          newUrl.searchParams.set('route', nextRoute);
          if (id) {
            newUrl.searchParams.set('id', id);
          } else {
            newUrl.searchParams.delete('id');
          }
        }
        window.history.pushState({}, '', newUrl.toString());
      } catch (e) {
        console.error('URL history push error:', e);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    notify();
  };

  const loginAs = (role: UserRole) => {
    const user = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[2];
    globalState.currentUser = user;
    globalState.isAuthenticated = true;
    try {
      localStorage.setItem('talentember_current_user', JSON.stringify(user));
      localStorage.setItem('talentember_authenticated', 'true');
    } catch (e) {
      console.error(e);
    }
    ApiService.setCurrentUser(user);
    globalState.currentRoute = 'dashboard';
    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('route', 'dashboard');
      newUrl.searchParams.delete('id');
      window.history.pushState({}, '', newUrl.toString());
    }
    notify();
  };

  const logout = () => {
    globalState.currentUser = null;
    globalState.isAuthenticated = false;
    globalState.currentRoute = 'login';
    try {
      localStorage.removeItem('talentember_current_user');
      localStorage.removeItem('talentember_authenticated');
    } catch (e) {
      console.error(e);
    }
    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('route', 'login');
      newUrl.searchParams.delete('id');
      window.history.pushState({}, '', newUrl.toString());
    }
    notify();
  };

  const toggleTheme = () => {
    globalState.isDark = !globalState.isDark;
    if (globalState.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    notify();
  };

  const setThemePalette = (palette: ThemePalette) => {
    globalState.themePalette = palette;
    document.documentElement.setAttribute('data-theme', palette);
    localStorage.setItem('talent_theme_palette', palette);
    notify();
  };

  const setGlobalSearch = (open: boolean) => {
    globalState.searchOpen = open;
    notify();
  };

  const setQuickCreate = (open: boolean) => {
    globalState.quickCreateOpen = open;
    notify();
  };

  const setNotifications = (open: boolean) => {
    globalState.notificationsOpen = open;
    notify();
  };

  const setLoginRole = (role: UserRole) => {
    globalState.selectedRoleForLogin = role;
    notify();
  };

  return {
    ...globalState,
    navigate,
    loginAs,
    logout,
    toggleTheme,
    setThemePalette,
    setGlobalSearch,
    setQuickCreate,
    setNotifications,
    setLoginRole
  };
}
