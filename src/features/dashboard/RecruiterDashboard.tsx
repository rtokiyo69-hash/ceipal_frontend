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
  { name: 'Sourced', stage: 'New', statuses: ['New'], fill: '#2563EB' },
  { name: 'Applied', stage: 'Submitted', statuses: ['Submitted'], fill: '#2563EB' },
  { name: 'Screen', stage: 'Screening', statuses: ['Screening'], fill: '#64748B' },
  { name: 'Technical', stage: 'Interview', statuses: ['Interview', 'Selected'], fill: '#64748B' },
  { name: 'Offer', stage: 'Offered', statuses: ['Offered'], fill: '#64748B' },
  { name: 'Hired', stage: 'Hired', statuses: ['Hired'], fill: '#64748B' },
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
  const { navigate, isDark } = useAppStore();
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
      label: 'Team candidates in pipeline',
      value: activeCandidates.length,
      detail: `${applicants.length} total profiles`,
      icon: Users,
      tone: 'text-[#1E293B]',
      bg: 'bg-[#FFFFFF]'
    },
    {
      label: 'Team open roles',
      value: activeJobs.length,
      detail: `${totalOpenings} positions to fill`,
      icon: BriefcaseBusiness,
      tone: 'text-[#1E293B]',
      bg: 'bg-[#FFFFFF]'
    },
    {
      label: 'Team upcoming interviews',
      value: upcomingInterviews.length,
      detail: 'Scheduled from today',
      icon: CalendarDays,
      tone: 'text-[#218A72]',
      bg: 'bg-[#E8F7F1]'
    },
    {
      label: 'Team offers in progress',
      value: offerCount,
      detail: 'Candidates at offer stage',
      icon: CheckCircle2,
      tone: 'text-[#2E7D5B]',
      bg: 'bg-[#EAF7EF]'
    }
  ];

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#D8E3F1] bg-white p-8 text-center text-sm text-[#64748B] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#BFDBFE]">
        Loading recruiter dashboard…
      </div>
    );
  }

  if (loadError) {
    return (
      <div role="alert" className="rounded-2xl border border-rose-200 bg-white p-6 text-center dark:border-rose-900 dark:bg-[#1E293B]">
        <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{loadError}</p>
        <button
          type="button"
          onClick={() => setReloadKey(key => key + 1)}
          className="mt-4 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div role="status" aria-live="polite" className="fixed right-6 top-20 z-50 rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2.5 text-xs text-white shadow-xl">
          {toastMessage}
        </div>
      )}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1E293B] dark:text-[#64748B]">
            ATS · Dashboard
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1E293B] dark:text-white sm:text-4xl">
            {section === 'overview' ? 'Team overview' : 'Recruiting reports'}
          </h1>
          <p className="mt-2 text-sm text-[#64748B] dark:text-[#BFDBFE]">
            {section === 'overview'
              ? 'A team-wide view of candidates, open roles, upcoming interviews, and recruiting activity.'
              : 'Detailed recruiter performance, hiring velocity, and sourcing analytics.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-[#D8E3F1] bg-white p-1 dark:border-[#334155] dark:bg-[#475569]" role="tablist" aria-label="Dashboard sections">
            <button
              type="button"
              role="tab"
              aria-selected={section === 'overview'}
              onClick={() => selectSection('overview')}
              className={`relative isolate rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${section === 'overview' ? 'text-[#1E293B] dark:text-[#FFFFFF]' : 'text-[#64748B] hover:text-[#1E293B] dark:text-[#BFDBFE] dark:hover:text-white'}`}
            >
              {section === 'overview' && (
                <motion.span
                  layoutId="recruiter-dashboard-tab"
                  className="absolute inset-0 z-0 rounded-lg bg-[#FFFFFF] shadow-sm dark:bg-[#475569]"
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
              className={`relative isolate inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${section === 'reports' ? 'text-[#1E293B] dark:text-[#FFFFFF]' : 'text-[#64748B] hover:text-[#1E293B] dark:text-[#BFDBFE] dark:hover:text-white'}`}
            >
              {section === 'reports' && (
                <motion.span
                  layoutId="recruiter-dashboard-tab"
                  className="absolute inset-0 z-0 rounded-lg bg-[#FFFFFF] shadow-sm dark:bg-[#475569]"
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
            className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D4ED8]"
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
              <article key={label} className="rounded-2xl border border-[#D8E3F1] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#9FC3E2] dark:border-[#334155] dark:bg-[#1E293B]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-[#64748B] dark:text-[#BFDBFE]">{label}</p>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-[#1E293B] dark:text-white">{value}</p>
                    <p className="mt-1 text-xs text-[#64748B] dark:text-[#BFDBFE]">{detail}</p>
                  </div>
                  <span className={`rounded-xl p-2.5 ${bg} ${tone}`}><Icon className="h-5 w-5" /></span>
                </div>
              </article>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <article className="rounded-3xl border border-[#D8E3F1] bg-white p-5 shadow-sm sm:p-6 xl:col-span-7 dark:border-[#334155] dark:bg-[#1E293B]">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-[#1E293B] dark:text-white">Hiring pipeline</h2>
                    <span className="rounded-full bg-[#FFFFFF] px-2.5 py-1 text-[11px] font-medium text-[#1E293B] dark:bg-[#475569] dark:text-[#FFFFFF]">{activeCandidates.length} active</span>
                  </div>
                  <p className="mt-1 text-xs text-[#64748B] dark:text-[#BFDBFE]">Candidates by current stage · select a stage to open the pipeline</p>
                </div>
                <button type="button" onClick={openReports} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-[#1E293B] transition hover:bg-[#FFFFFF] dark:text-[#64748B] dark:hover:bg-[#475569]">
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
                        ? { background: '#2563EB', border: '1px solid #334155', borderRadius: 12, color: '#FFFFFF' }
                        : { background: '#ffffff', border: '1px solid #D8E3F1', borderRadius: 12, color: '#2563EB', boxShadow: '0 8px 24px rgba(15,23,42,0.12)' }}
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
                    className="inline-flex items-center gap-2 rounded-full border border-[#D8E3F1] bg-[#FFFFFF] px-2.5 py-1.5 text-[11px] text-[#64748B] transition hover:border-[#9FC3E2] hover:bg-[#FFFFFF] dark:border-[#334155] dark:bg-white/[0.03] dark:text-[#BFDBFE] dark:hover:bg-[#475569]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: stage.fill }} />
                    {stage.name}
                    <span className="font-semibold text-[#1E293B] dark:text-white">{stage.count}</span>
                  </button>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-[#D8E3F1] bg-white p-5 shadow-sm sm:p-6 xl:col-span-5 dark:border-[#334155] dark:bg-[#1E293B]">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#1E293B]" />
                    <h2 className="text-lg font-semibold text-[#1E293B] dark:text-white">Recent activity</h2>
                  </div>
                  <p className="mt-1 text-xs text-[#64748B] dark:text-[#BFDBFE]">Latest updates from your team</p>
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
                          <span className="text-sm font-medium text-[#1E293B] dark:text-[#FFFFFF]">{candidate?.name || activity.target}</span>
                          <span className="text-[11px] text-[#64748B] dark:text-[#BFDBFE]">{activity.timestamp}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-[#64748B] dark:text-[#BFDBFE]">{activity.action}</span>
                        <span className="mt-1 block text-[11px] text-[#64748B] dark:text-[#BFDBFE]">{activity.user}{candidate ? ` · ${candidate.currentDesignation}` : ''}</span>
                      </span>
                    </>
                  );

                  return candidate ? (
                    <button
                      type="button"
                      key={activity.id}
                      onClick={() => navigate('applicant-detail', candidate.id)}
                      className="group flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-[#F1F5F9] dark:hover:bg-white/[0.04]"
                    >
                      {content}
                    </button>
                  ) : (
                    <div key={activity.id} className="flex items-start gap-3 rounded-xl px-2 py-3">
                      {content}
                    </div>
                  );
                })}
                {activities.length === 0 && <p className="py-10 text-center text-sm text-[#64748B] dark:text-[#BFDBFE]">No recent activity yet.</p>}
              </div>
            </article>
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <article className="rounded-3xl border border-[#D8E3F1] bg-white p-5 shadow-sm sm:p-6 xl:col-span-5 dark:border-[#334155] dark:bg-[#1E293B]">
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-[#1E293B]" />
                  <h2 className="text-lg font-semibold text-[#1E293B] dark:text-white">Upcoming interviews</h2>
                </div>
                <p className="mt-1 text-xs text-[#64748B] dark:text-[#BFDBFE]">The team’s next candidate conversations</p>
              </div>
              <div className="divide-y divide-[#D8E3F1] dark:divide-[#334155]">
                {upcomingInterviews.map(interview => (
                  <button
                    type="button"
                    key={interview.id}
                    onClick={() => navigate('applicant-detail', interview.applicantId)}
                    className="flex w-full items-center gap-3 py-3 text-left transition hover:bg-[#F1F5F9] dark:hover:bg-white/[0.03]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFFFFF] text-[#1E293B] dark:bg-[#475569] dark:text-[#FFFFFF]"><CalendarDays className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[#1E293B] dark:text-[#FFFFFF]">{interview.applicantName}</span>
                      <span className="mt-0.5 block truncate text-xs text-[#64748B] dark:text-[#BFDBFE]">{interview.jobTitle}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-xs font-medium text-[#1E293B] dark:text-[#FFFFFF]">{formatInterviewDate(interview.date)}</span>
                      <span className="mt-0.5 block text-[11px] text-[#64748B] dark:text-[#BFDBFE]">{interview.time}</span>
                    </span>
                  </button>
                ))}
                {upcomingInterviews.length === 0 && <p className="py-8 text-center text-sm text-[#64748B] dark:text-[#BFDBFE]">No upcoming interviews scheduled.</p>}
              </div>
              <button type="button" onClick={() => navigate('applicants')} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#1E293B] hover:text-[#1E293B] dark:text-[#64748B] dark:hover:text-white">
                Browse talent pool <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </article>

            <article className="rounded-3xl border border-[#D8E3F1] bg-white p-5 shadow-sm sm:p-6 xl:col-span-7 dark:border-[#334155] dark:bg-[#1E293B]">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <BriefcaseBusiness className="h-4 w-4 text-[#1E293B]" />
                    <h2 className="text-lg font-semibold text-[#1E293B] dark:text-white">Active roles</h2>
                  </div>
                  <p className="mt-1 text-xs text-[#64748B] dark:text-[#BFDBFE]">Quick snapshot of open requisitions</p>
                </div>
                <button type="button" onClick={() => navigate('jobs')} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-[#1E293B] transition hover:bg-[#FFFFFF] dark:text-[#64748B] dark:hover:bg-[#475569]">
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
                      className="w-full rounded-2xl border border-[#D8E3F1] bg-[#FFFFFF] p-4 text-left transition hover:border-[#9FC3E2] hover:bg-[#F1F5F9] dark:border-[#334155] dark:bg-white/[0.025] dark:hover:border-[#64748B] dark:hover:bg-white/[0.05]"
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-[#1E293B] dark:text-[#FFFFFF]">{job.title}</span>
                          <span className="mt-1 block truncate text-xs text-[#64748B] dark:text-[#BFDBFE]">{job.client} · {job.location}</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-[#FFFFFF] px-2 py-1 text-[10px] font-medium text-[#1E293B] dark:bg-[#475569] dark:text-[#FFFFFF]">{getDaysOpen(job.createdDate)}d open</span>
                      </span>
                      <span className="mt-4 flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#BFDBFE]">
                        <span>{remaining} {remaining === 1 ? 'opening' : 'openings'} left</span>
                        <span>{filled}/{job.openings} filled</span>
                      </span>
                      <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[#D8E3F1] dark:bg-[#334155]">
                        <span className="block h-full rounded-full bg-[#2563EB]" style={{ width: `${progress}%` }} />
                      </span>
                    </button>
                  );
                })}
                {activeJobs.length === 0 && <p className="py-8 text-center text-sm text-[#64748B] dark:text-[#BFDBFE] sm:col-span-2">No active requisitions.</p>}
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
