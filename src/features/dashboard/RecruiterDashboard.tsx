import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileBarChart2,
  UserRoundPlus,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useAppStore } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { ActivityLog, Applicant, Interview, Job, Placement, PipelineStage } from '../../types';
import { RAW_RECRUITMENT_ACTIVITIES } from '../../data/mockJsipData';
import { JsipReportView } from '../../components/JsipReportView';

type DashboardSection = 'overview' | 'reports';
type DashboardPipelineStage = {
  name: string;
  stage: string;
  statuses: PipelineStage[];
  fill: string;
};

const stages: DashboardPipelineStage[] = [
  { name: 'Sourced', stage: 'New', statuses: ['New'], fill: '#1769AA' },
  { name: 'Applied', stage: 'Submitted', statuses: ['Submitted'], fill: '#2F80E7' },
  { name: 'Screen', stage: 'Screening', statuses: ['Screening'], fill: '#20A79A' },
  { name: 'Technical', stage: 'Interview', statuses: ['Interview', 'Selected'], fill: '#5877D6' },
  { name: 'Offer', stage: 'Offered', statuses: ['Offered'], fill: '#2E9B70' },
  { name: 'Hired', stage: 'Hired', statuses: ['Hired'], fill: '#78B75B' },
  { name: 'Archived', stage: 'Rejected', statuses: ['Rejected'], fill: '#8A96A3' }
];

const formatInterviewDate = (date: string) =>
  new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' })
    .format(new Date(`${date}T00:00:00`));

const getDaysOpen = (createdDate: string) => {
  const createdAt = new Date(`${createdDate}T00:00:00`);
  if (Number.isNaN(createdAt.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 86_400_000));
};

const getActivityCandidate = (activity: ActivityLog, applicants: Applicant[]) => {
  const activityText = `${activity.action} ${activity.target}`.toLowerCase();
  return applicants.find(applicant => activityText.includes(applicant.name.toLowerCase()));
};

export const RecruiterDashboard: React.FC = () => {
  const { navigate, currentUser, isDark } = useAppStore();
  const [section, setSection] = useState<DashboardSection>('overview');
  const [sectionDirection, setSectionDirection] = useState(1);
  const [hasOpenedReports, setHasOpenedReports] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setLoadError(null);

    Promise.all([
      ApiService.getJobs(),
      ApiService.getApplicants(),
      ApiService.getInterviews(),
      ApiService.getActivities(),
      ApiService.getPlacements()
    ]).then(([loadedJobs, loadedApplicants, loadedInterviews, loadedActivities, loadedPlacements]) => {
      if (!isCurrent) return;
      setJobs(loadedJobs);
      setApplicants(loadedApplicants);
      setInterviews(loadedInterviews);
      setActivities(loadedActivities);
      setPlacements(loadedPlacements);
    }).catch((error: unknown) => {
      console.error('Unable to load recruiter dashboard data:', error);
      if (isCurrent) setLoadError('Dashboard data could not be loaded. Please try again.');
    }).finally(() => {
      if (isCurrent) setLoading(false);
    });

    return () => {
      isCurrent = false;
    };
  }, [reloadKey]);

  const activeCandidates = useMemo(
    () => applicants.filter(applicant => applicant.status !== 'Hired' && applicant.status !== 'Rejected'),
    [applicants]
  );
  const activeJobs = useMemo(
    () => jobs.filter(job => job.status === 'Active' || job.status === 'Open'),
    [jobs]
  );
  const upcomingInterviews = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return interviews
      .filter(interview => interview.status === 'Scheduled' && new Date(`${interview.date}T00:00:00`) >= today)
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
      .slice(0, 4);
  }, [interviews]);
  const pipelineData = useMemo(
    () => stages.map(stage => ({
      ...stage,
      count: applicants.filter(applicant => stage.statuses.includes(applicant.status)).length
    })),
    [applicants]
  );
  const offerCount = applicants.filter(applicant => applicant.status === 'Offered').length;
  const totalOpenings = activeJobs.reduce((total, job) => total + job.openings, 0);
  const inspectReportCandidate = (reportCandidateId: string) => {
    const reportCandidate = RAW_RECRUITMENT_ACTIVITIES.find(activity => activity.candidateId === reportCandidateId);
    const applicant = applicants.find(candidate => candidate.name === reportCandidate?.candidateName);
    if (applicant) {
      navigate('applicant-detail', applicant.id);
    } else {
      setToastMessage('This report candidate is not in the current Ceipal applicant list.');
    }
  };
  const selectSection = (nextSection: DashboardSection) => {
    if (nextSection === section) return;
    setSectionDirection(nextSection === 'reports' ? 1 : -1);
    setSection(nextSection);
    if (nextSection === 'reports') setHasOpenedReports(true);
  };
  const openReports = () => {
    setHasOpenedReports(true);
    selectSection('reports');
  };

  const stats = [
    {
      label: 'Candidates in pipeline',
      value: activeCandidates.length,
      detail: `${applicants.length} total profiles`,
      icon: Users,
      tone: 'text-[#1769AA]',
      bg: 'bg-[#EAF4FC]'
    },
    {
      label: 'Open roles',
      value: activeJobs.length,
      detail: `${totalOpenings} positions to fill`,
      icon: BriefcaseBusiness,
      tone: 'text-[#2F80E7]',
      bg: 'bg-[#EAF4FC]'
    },
    {
      label: 'Upcoming interviews',
      value: upcomingInterviews.length,
      detail: 'Scheduled from today',
      icon: CalendarDays,
      tone: 'text-[#218A72]',
      bg: 'bg-[#E8F7F1]'
    },
    {
      label: 'Offers in progress',
      value: offerCount,
      detail: 'Candidates at offer stage',
      icon: CheckCircle2,
      tone: 'text-[#2E7D5B]',
      bg: 'bg-[#EAF7EF]'
    }
  ];

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#DCE6EF] bg-white p-8 text-center text-sm text-[#5E6B7A] dark:border-[#354A5C] dark:bg-[#1B2936] dark:text-[#B9CAD9]">
        Loading recruiter dashboard…
      </div>
    );
  }

  if (loadError) {
    return (
      <div role="alert" className="rounded-2xl border border-rose-200 bg-white p-6 text-center dark:border-rose-900 dark:bg-[#1B2936]">
        <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{loadError}</p>
        <button
          type="button"
          onClick={() => setReloadKey(key => key + 1)}
          className="mt-4 rounded-lg bg-[#1769AA] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12578E]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div role="status" aria-live="polite" className="fixed right-6 top-20 z-50 rounded-xl border border-[#1769AA] bg-[#0B4F89] px-4 py-2.5 text-xs text-white shadow-xl">
          {toastMessage}
        </div>
      )}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1769AA] dark:text-[#8CBCE8]">
            TalentEmber · Dashboard
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#202B37] dark:text-white sm:text-4xl">
            {section === 'overview' ? `Good to see you, ${currentUser?.name || 'Recruiter'}.` : 'Recruiting reports'}
          </h1>
          <p className="mt-2 text-sm text-[#5E6B7A] dark:text-[#B9CAD9]">
            {section === 'overview'
              ? 'Here’s what’s moving across your talent pipeline. Pick up where your team left off.'
              : 'Detailed recruiter performance, hiring velocity, and sourcing analytics.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-[#DCE6EF] bg-white p-1 dark:border-[#354A5C] dark:bg-[#162431]" role="tablist" aria-label="Dashboard sections">
            <button
              type="button"
              role="tab"
              aria-selected={section === 'overview'}
              onClick={() => selectSection('overview')}
              className={`relative isolate rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${section === 'overview' ? 'text-[#0B4F89] dark:text-[#D8E9F7]' : 'text-[#5E6B7A] hover:text-[#202B37] dark:text-[#B9CAD9] dark:hover:text-white'}`}
            >
              {section === 'overview' && (
                <motion.span
                  layoutId="recruiter-dashboard-tab"
                  className="absolute inset-0 z-0 rounded-lg bg-[#EAF4FC] shadow-sm dark:bg-[#22384B]"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">Overview</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={section === 'reports'}
              onClick={openReports}
              className={`relative isolate inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${section === 'reports' ? 'text-[#0B4F89] dark:text-[#D8E9F7]' : 'text-[#5E6B7A] hover:text-[#202B37] dark:text-[#B9CAD9] dark:hover:text-white'}`}
            >
              {section === 'reports' && (
                <motion.span
                  layoutId="recruiter-dashboard-tab"
                  className="absolute inset-0 z-0 rounded-lg bg-[#EAF4FC] shadow-sm dark:bg-[#22384B]"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-2">
              <FileBarChart2 className="h-4 w-4" />
              Tables &amp; reports
              </span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => navigate('applicant-new')}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2F80E7] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#216BC4]"
          >
            <UserRoundPlus className="h-4 w-4" />
            Add candidate
          </button>
        </div>
      </header>

      <div className="relative">
        <motion.div
          role="tabpanel"
          aria-hidden={section !== 'overview'}
          inert={section !== 'overview'}
          className={`space-y-6 ${section === 'overview' ? 'relative' : 'pointer-events-none absolute inset-x-0 top-0'}`}
          animate={{
            opacity: section === 'overview' ? 1 : 0,
            x: section === 'overview' ? 0 : -sectionDirection * 24,
            scale: section === 'overview' ? 1 : 0.99
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        >
          <section aria-label="Recruiting summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, detail, icon: Icon, tone, bg }) => (
              <article key={label} className="rounded-2xl border border-[#DCE6EF] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#9FC3E2] dark:border-[#354A5C] dark:bg-[#1B2936]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-[#5E6B7A] dark:text-[#B9CAD9]">{label}</p>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-[#202B37] dark:text-white">{value}</p>
                    <p className="mt-1 text-xs text-[#6B7785] dark:text-[#B9CAD9]">{detail}</p>
                  </div>
                  <span className={`rounded-xl p-2.5 ${bg} ${tone}`}><Icon className="h-5 w-5" /></span>
                </div>
              </article>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <article className="rounded-3xl border border-[#DCE6EF] bg-white p-5 shadow-sm sm:p-6 xl:col-span-7 dark:border-[#354A5C] dark:bg-[#1B2936]">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-[#202B37] dark:text-white">Hiring pipeline</h2>
                    <span className="rounded-full bg-[#EAF4FC] px-2.5 py-1 text-[11px] font-medium text-[#0B4F89] dark:bg-[#22384B] dark:text-[#D8E9F7]">{activeCandidates.length} active</span>
                  </div>
                  <p className="mt-1 text-xs text-[#6B7785] dark:text-[#B9CAD9]">Candidates by current stage · select a stage to open the pipeline</p>
                </div>
                <button type="button" onClick={openReports} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-[#1769AA] transition hover:bg-[#EAF4FC] dark:text-[#8CBCE8] dark:hover:bg-[#22384B]">
                  Reports <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="h-[245px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 0 }} barCategoryGap={12}>
                    <CartesianGrid horizontal={false} stroke={isDark ? 'rgba(148,163,184,0.12)' : 'rgba(71,85,105,0.16)'} />
                    <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#475569', fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={76} axisLine={false} tickLine={false} tick={{ fill: isDark ? '#cbd5e1' : '#334155', fontSize: 11 }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(148,163,184,0.07)' }}
                      contentStyle={isDark
                        ? { background: '#1B2936', border: '1px solid #354A5C', borderRadius: 12, color: '#F5F8FB' }
                        : { background: '#ffffff', border: '1px solid #DCE6EF', borderRadius: 12, color: '#202B37', boxShadow: '0 8px 24px rgba(15,23,42,0.12)' }}
                    />
                    <Bar dataKey="count" name="Candidates" radius={[0, 7, 7, 0]} maxBarSize={22}>
                      {pipelineData.map(stage => (
                        <Cell key={stage.stage} fill={stage.fill} fillOpacity={0.88} cursor="pointer" onClick={() => navigate('pipeline')} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {pipelineData.map(stage => (
                  <button
                    type="button"
                    key={stage.stage}
                    onClick={() => navigate('pipeline')}
                    className="inline-flex items-center gap-2 rounded-full border border-[#DCE6EF] bg-[#F8FAFC] px-2.5 py-1.5 text-[11px] text-[#5E6B7A] transition hover:border-[#9FC3E2] hover:bg-[#EAF4FC] dark:border-[#354A5C] dark:bg-white/[0.03] dark:text-[#B9CAD9] dark:hover:bg-[#22384B]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: stage.fill }} />
                    {stage.name}
                    <span className="font-semibold text-[#202B37] dark:text-white">{stage.count}</span>
                  </button>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-[#DCE6EF] bg-white p-5 shadow-sm sm:p-6 xl:col-span-5 dark:border-[#354A5C] dark:bg-[#1B2936]">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#1769AA]" />
                    <h2 className="text-lg font-semibold text-[#202B37] dark:text-white">Recent activity</h2>
                  </div>
                  <p className="mt-1 text-xs text-[#6B7785] dark:text-[#B9CAD9]">Latest updates from your team</p>
                </div>
                <span className="rounded-full bg-[#E8F7F1] px-2.5 py-1 text-[11px] font-medium text-[#276749] dark:bg-[#173D35] dark:text-[#A8E3C3]">Live feed</span>
              </div>
              <div className="space-y-1">
                {activities.slice(0, 5).map(activity => {
                  const candidate = getActivityCandidate(activity, applicants);
                  const content = (
                    <>
                      <img src={activity.avatar} alt="" className="mt-1 h-8 w-8 shrink-0 rounded-full object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                          <span className="text-sm font-medium text-[#202B37] dark:text-[#F5F8FB]">{candidate?.name || activity.target}</span>
                          <span className="text-[11px] text-[#6B7785] dark:text-[#B9CAD9]">{activity.timestamp}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-[#5E6B7A] dark:text-[#B9CAD9]">{activity.action}</span>
                        <span className="mt-1 block text-[11px] text-[#6B7785] dark:text-[#B9CAD9]">{activity.user}{candidate ? ` · ${candidate.currentDesignation}` : ''}</span>
                      </span>
                    </>
                  );

                  return candidate ? (
                    <button
                      type="button"
                      key={activity.id}
                      onClick={() => navigate('applicant-detail', candidate.id)}
                      className="group flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-[#F1F6FA] dark:hover:bg-white/[0.04]"
                    >
                      {content}
                    </button>
                  ) : (
                    <div key={activity.id} className="flex items-start gap-3 rounded-xl px-2 py-3">
                      {content}
                    </div>
                  );
                })}
                {activities.length === 0 && <p className="py-10 text-center text-sm text-[#6B7785] dark:text-[#B9CAD9]">No recent activity yet.</p>}
              </div>
            </article>
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <article className="rounded-3xl border border-[#DCE6EF] bg-white p-5 shadow-sm sm:p-6 xl:col-span-5 dark:border-[#354A5C] dark:bg-[#1B2936]">
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-[#1769AA]" />
                  <h2 className="text-lg font-semibold text-[#202B37] dark:text-white">Upcoming interviews</h2>
                </div>
                <p className="mt-1 text-xs text-[#6B7785] dark:text-[#B9CAD9]">Your next candidate conversations</p>
              </div>
              <div className="divide-y divide-[#DCE6EF] dark:divide-[#354A5C]">
                {upcomingInterviews.map(interview => (
                  <button
                    type="button"
                    key={interview.id}
                    onClick={() => navigate('applicant-detail', interview.applicantId)}
                    className="flex w-full items-center gap-3 py-3 text-left transition hover:bg-[#F1F6FA] dark:hover:bg-white/[0.03]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF4FC] text-[#1769AA] dark:bg-[#22384B] dark:text-[#D8E9F7]"><CalendarDays className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[#202B37] dark:text-[#F5F8FB]">{interview.applicantName}</span>
                      <span className="mt-0.5 block truncate text-xs text-[#5E6B7A] dark:text-[#B9CAD9]">{interview.jobTitle}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-xs font-medium text-[#202B37] dark:text-[#F5F8FB]">{formatInterviewDate(interview.date)}</span>
                      <span className="mt-0.5 block text-[11px] text-[#6B7785] dark:text-[#B9CAD9]">{interview.time}</span>
                    </span>
                  </button>
                ))}
                {upcomingInterviews.length === 0 && <p className="py-8 text-center text-sm text-[#6B7785] dark:text-[#B9CAD9]">No upcoming interviews scheduled.</p>}
              </div>
              <button type="button" onClick={() => navigate('applicants')} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#1769AA] hover:text-[#0B4F89] dark:text-[#8CBCE8] dark:hover:text-white">
                Browse talent pool <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </article>

            <article className="rounded-3xl border border-[#DCE6EF] bg-white p-5 shadow-sm sm:p-6 xl:col-span-7 dark:border-[#354A5C] dark:bg-[#1B2936]">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <BriefcaseBusiness className="h-4 w-4 text-[#1769AA]" />
                    <h2 className="text-lg font-semibold text-[#202B37] dark:text-white">Active roles</h2>
                  </div>
                  <p className="mt-1 text-xs text-[#6B7785] dark:text-[#B9CAD9]">Quick snapshot of open requisitions</p>
                </div>
                <button type="button" onClick={() => navigate('jobs')} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-[#1769AA] transition hover:bg-[#EAF4FC] dark:text-[#8CBCE8] dark:hover:bg-[#22384B]">
                  All roles <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {activeJobs.slice(0, 4).map(job => {
                  const filled = placements.filter(placement => placement.jobTitle === job.title && placement.status === 'Active').length;
                  const remaining = Math.max(job.openings - filled, 0);
                  const progress = job.openings ? Math.min((filled / job.openings) * 100, 100) : 0;

                  return (
                    <button
                      type="button"
                      key={job.id}
                      onClick={() => navigate('job-detail', job.id)}
                      className="w-full rounded-2xl border border-[#DCE6EF] bg-[#F8FAFC] p-4 text-left transition hover:border-[#9FC3E2] hover:bg-[#F1F6FA] dark:border-[#354A5C] dark:bg-white/[0.025] dark:hover:border-[#5AA4E2] dark:hover:bg-white/[0.05]"
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-[#202B37] dark:text-[#F5F8FB]">{job.title}</span>
                          <span className="mt-1 block truncate text-xs text-[#5E6B7A] dark:text-[#B9CAD9]">{job.client} · {job.location}</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-[#EAF4FC] px-2 py-1 text-[10px] font-medium text-[#0B4F89] dark:bg-[#22384B] dark:text-[#D8E9F7]">{getDaysOpen(job.createdDate)}d open</span>
                      </span>
                      <span className="mt-4 flex items-center justify-between text-[11px] text-[#5E6B7A] dark:text-[#B9CAD9]">
                        <span>{remaining} {remaining === 1 ? 'opening' : 'openings'} left</span>
                        <span>{filled}/{job.openings} filled</span>
                      </span>
                      <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[#DCE6EF] dark:bg-[#354A5C]">
                        <span className="block h-full rounded-full bg-[#2F80E7]" style={{ width: `${progress}%` }} />
                      </span>
                    </button>
                  );
                })}
                {activeJobs.length === 0 && <p className="py-8 text-center text-sm text-[#6B7785] dark:text-[#B9CAD9] sm:col-span-2">No active requisitions.</p>}
              </div>
            </article>
          </section>
        </motion.div>

        {hasOpenedReports && (
          <motion.div
            role="tabpanel"
            aria-hidden={section !== 'reports'}
            inert={section !== 'reports'}
            className={`space-y-6 ${section === 'reports' ? 'relative' : 'pointer-events-none absolute inset-x-0 top-0'}`}
            animate={{
              opacity: section === 'reports' ? 1 : 0,
              x: section === 'reports' ? 0 : sectionDirection * 24,
              scale: section === 'reports' ? 1 : 0.99
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          >
            <JsipReportView
              onInspectCandidate={inspectReportCandidate}
              onShowToast={setToastMessage}
              dashboardPreview
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};
