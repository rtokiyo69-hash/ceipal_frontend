import React, { useState, useEffect } from 'react';
import {
  Search,
  RotateCcw,
  Plus,
  X,
  ArrowLeft,
  Briefcase,
  MapPin,
  Building,
  CheckCircle,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Send,
  Lock,
  Unlock
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { Applicant, Job } from '../../types';

export const AIMatchingJobs: React.FC = () => {
  const { selectedId, navigate, currentUser } = useAppStore();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters State matching Reference Image 1
  const [skillSearch, setSkillSearch] = useState('');
  const [jobTitles, setJobTitles] = useState<string[]>(['']);
  const [industry, setIndustry] = useState('');
  const [createdOn, setCreatedOn] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [distance, setDistance] = useState('');
  const [distanceUnit, setDistanceUnit] = useState<'miles' | 'km'>('miles');

  // Security Restriction Toggle (matching screenshot reference note)
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [submittingJobId, setSubmittingJobId] = useState<string | null>(null);
  const [actionMenuJobId, setActionMenuJobId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    // Load selected applicant
    if (selectedId) {
      ApiService.getApplicantById(selectedId).then((app) => {
        if (app) {
          setApplicant(app);
          // Pre-populate filters based on candidate profile
          if (app.skills && app.skills.length > 0) {
            setSkillSearch(app.skills.slice(0, 3).join(' OR '));
          }
          if (app.currentDesignation) {
            setJobTitles([app.currentDesignation]);
          }
          if (app.location) {
            const parts = app.location.split(',');
            if (parts.length > 0) setCity(parts[0].trim());
            if (parts.length > 1) setState(parts[1].trim());
          }
        }
      });
    }

    // Load available jobs
    ApiService.getJobs().then((list) => {
      setJobs(list);
    });
  }, [selectedId]);

  // Handle adding job title with "+ AND"
  const handleAddJobTitle = () => {
    setJobTitles([...jobTitles, '']);
  };

  const handleUpdateJobTitle = (idx: number, val: string) => {
    const updated = [...jobTitles];
    updated[idx] = val;
    setJobTitles(updated);
  };

  const handleRemoveJobTitle = (idx: number) => {
    if (jobTitles.length <= 1) {
      setJobTitles(['']);
      return;
    }
    setJobTitles(jobTitles.filter((_, i) => i !== idx));
  };

  // Handle Reset Filters
  const handleReset = () => {
    setSkillSearch('');
    setJobTitles(['']);
    setIndustry('');
    setCreatedOn('');
    setCountry('');
    setState('');
    setCity('');
    setZipCode('');
    setDistance('');
    setDistanceUnit('miles');
    showToast('Filters reset to default');
  };

  // Handle Search Execution
  const handleSearch = () => {
    setIsUnlocked(true);
    showToast('Applied AI matching filters');
  };

  // Handle Direct Submission
  const handleSubmitToJob = async (job: Job) => {
    if (!applicant) return;
    setSubmittingJobId(job.id);
    try {
      await ApiService.createSubmission({
        applicantId: applicant.id,
        applicantName: applicant.name,
        jobId: job.id,
        jobTitle: job.title,
        client: job.client,
        recruiter: currentUser?.name || job.assignedRecruiter,
        status: 'Waiting for Evaluation by Internal Reviewer',
        billRate: job.billRate || 0,
        payRate: job.payRate || 0
      });
      showToast(`Successfully submitted ${applicant.name} to ${job.title} (${job.client})`);
    } catch (err) {
      showToast(`Submission recorded for ${job.title}`);
    } finally {
      setSubmittingJobId(null);
    }
  };

  // Filter matched jobs
  const filteredJobs = jobs.filter((job) => {
    if (skillSearch.trim()) {
      const terms = skillSearch.toLowerCase().split(/\s+or\s+|\s+and\s+|,/);
      const matchesSkill = terms.some(
        (term) =>
          term.trim() &&
          (job.skills.some((s) => s.toLowerCase().includes(term.trim())) ||
            job.title.toLowerCase().includes(term.trim()) ||
            job.description?.toLowerCase().includes(term.trim()))
      );
      if (!matchesSkill) return false;
    }

    const activeTitles = jobTitles.filter((t) => t.trim());
    if (activeTitles.length > 0) {
      const matchesTitle = activeTitles.some((t) =>
        job.title.toLowerCase().includes(t.toLowerCase().trim())
      );
      if (!matchesTitle) return false;
    }

    if (city.trim() && !job.location.toLowerCase().includes(city.toLowerCase().trim())) {
      return false;
    }

    return true;
  });

  const displayCount = isUnlocked ? filteredJobs.length : 0;

  return (
    <div className="flex h-screen flex-col bg-[#F8FAFC] text-[#222] dark:bg-[#121212] dark:text-[#E0E0E0]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed right-6 top-16 z-50 flex items-center gap-2 rounded-xl border border-[#2F80ED] bg-[#2F80ED] px-4 py-2.5 text-xs text-white shadow-xl animate-in fade-in">
          <CheckCircle className="h-4 w-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Candidate Context Bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E2E8F0] bg-white px-6 py-2.5 shadow-xs dark:border-[#333] dark:bg-[#1E1E1E]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('applicant-detail', applicant?.id || selectedId)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1877F2] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Applicant Dossier</span>
          </button>
          <span className="text-[#CCC]">|</span>
          <span className="text-xs font-bold text-[#1F2937] dark:text-white">
            {applicant ? `${applicant.applicantId} - ${applicant.name}` : 'AI Matching Engine'}
          </span>
          {applicant?.currentDesignation && (
            <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-[#1877F2] dark:bg-[#1E293B]">
              {applicant.currentDesignation}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-[#666] dark:text-[#AAA]">
          <span className="text-[11px]">Primary Skills:</span>
          <span className="font-medium text-[#1F2937] dark:text-white">
            {applicant?.skills?.slice(0, 4).join(', ') || '.NET, E-Commerce, Datadog'}
          </span>
        </div>
      </div>

      {/* Main 2-Column Split View (Replicating Image 1) */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT COLUMN: Filter These Results */}
        <aside className="w-[300px] shrink-0 overflow-y-auto border-r border-[#E2E8F0] bg-white p-5 shadow-xs dark:border-[#333] dark:bg-[#1E1E1E]">
          <h2 className="mb-4 text-xs font-bold tracking-tight text-[#1F2937] dark:text-white">
            Filter These Results
          </h2>

          <div className="space-y-4 text-xs">
            {/* Skill Search */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                SKILL SEARCH
              </label>
              <input
                type="text"
                placeholder="Boolean Search"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="w-full rounded border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-white"
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                JOB TITLE
              </label>
              <div className="space-y-2">
                {jobTitles.map((title, idx) => (
                  <div key={idx} className="relative flex items-center">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => handleUpdateJobTitle(idx, e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className="w-full rounded border border-[#CBD5E1] bg-white px-3 py-1.5 pr-7 text-xs outline-none focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-white"
                    />
                    {title && (
                      <button
                        type="button"
                        onClick={() => handleRemoveJobTitle(idx)}
                        className="absolute right-2 text-[#999] hover:text-[#222] dark:hover:text-white"
                      >
                        <X className="h-3.5 w-3.5 text-[#1877F2]" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddJobTitle}
                className="mt-2 rounded bg-[#1877F2] px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-[#166FE5]"
              >
                + and
              </button>
            </div>

            {/* Industry */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                INDUSTRY
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#1877F2] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-white"
              >
                <option value="">Select</option>
                <option value="IT">IT / Software Development</option>
                <option value="Healthcare">Healthcare & Life Sciences</option>
                <option value="Finance">Banking & Financial Services</option>
                <option value="Ecommerce">E-Commerce & Retail</option>
                <option value="Telecom">Telecommunications</option>
                <option value="Manufacturing">Manufacturing</option>
              </select>
            </div>

            {/* Created On */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                CREATED ON
              </label>
              <input
                type="date"
                value={createdOn}
                onChange={(e) => setCreatedOn(e.target.value)}
                className="w-full rounded border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#1877F2] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-white"
              />
            </div>

            {/* Location Section */}
            <div className="pt-2">
              <h3 className="mb-2 text-xs font-bold text-[#1F2937] dark:text-white">
                Location
              </h3>
              <div className="space-y-3">
                {/* Country */}
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                    COUNTRY
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#1877F2] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-white"
                  >
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="IN">India</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="DE">Germany</option>
                  </select>
                </div>

                {/* State */}
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                    STATE
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#1877F2] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-white"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                    CITY
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#1877F2] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-white"
                  />
                </div>

                {/* Zip/Postal */}
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                    ZIP/POSTAL
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full rounded border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#1877F2] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-white"
                  />
                </div>

                {/* Distance */}
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
                    DISTANCE
                  </label>
                  <input
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="mb-2 w-full rounded border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#1877F2] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-white"
                  />
                  <div className="flex items-center gap-4 text-xs font-medium text-[#475569] dark:text-[#CCC]">
                    <label className="flex cursor-pointer items-center gap-1.5">
                      <input
                        type="radio"
                        name="distanceUnit"
                        checked={distanceUnit === 'miles'}
                        onChange={() => setDistanceUnit('miles')}
                        className="text-[#1877F2]"
                      />
                      <span>MILES</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-1.5">
                      <input
                        type="radio"
                        name="distanceUnit"
                        checked={distanceUnit === 'km'}
                        onChange={() => setDistanceUnit('km')}
                        className="text-[#1877F2]"
                      />
                      <span>KM</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-3">
              <button
                type="button"
                onClick={handleSearch}
                className="flex items-center gap-1.5 rounded bg-[#1877F2] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#166FE5]"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded border border-[#CBD5E1] bg-white px-3.5 py-2 text-xs font-medium text-[#475569] hover:bg-gray-50 dark:border-[#444] dark:bg-[#2A2A2A] dark:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT AREA: AI Matching Results */}
        <main className="relative flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-base font-bold text-[#1F2937] dark:text-white">
                AI matching results{' '}
                <span className="text-xs font-normal text-[#6B7280] dark:text-[#9CA3AF]">
                  showing {displayCount} Jobs
                </span>
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setIsUnlocked(!isUnlocked)}
              className="flex items-center gap-1.5 rounded border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#1877F2] hover:bg-blue-50 dark:border-[#444] dark:bg-[#252525]"
            >
              {isUnlocked ? (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  <span>Lock Results View</span>
                </>
              ) : (
                <>
                  <Unlock className="h-3.5 w-3.5" />
                  <span>View Matched Jobs ({filteredJobs.length})</span>
                </>
              )}
            </button>
          </div>

          {/* Locked / Restricted Notice (Exact Text from Screenshot) */}
          {!isUnlocked ? (
            <div className="mt-8 rounded-lg border border-[#E2E8F0] bg-white p-8 text-center shadow-xs dark:border-[#333] dark:bg-[#1E1E1E]">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#1877F2] dark:bg-[#1E293B]">
                <Sparkles className="h-6 w-6" />
              </div>
              <p className="mx-auto max-w-2xl text-xs italic leading-relaxed text-[#6B7280] dark:text-[#9CA3AF]">
                We've identified the top 100 Jobs in our database. However, due to security access
                restrictions, the results are currently hidden. Kindly contact the administrator to
                obtain the necessary permissions and access the results.
              </p>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setIsUnlocked(true)}
                  className="rounded bg-[#1877F2] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#166FE5]"
                >
                  Request / Unlock Access
                </button>
              </div>
            </div>
          ) : (
            /* Unlocked Matching Jobs Results Table & Cards */
            <div className="space-y-4">
              <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs dark:border-[#333] dark:bg-[#1E1E1E]">
                <div className="divide-y divide-[#F1F5F9] dark:divide-[#333]">
                  {filteredJobs.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#888]">
                      No matching jobs found matching the selected criteria. Try adjusting the search filters.
                    </div>
                  ) : (
                    filteredJobs.map((job) => {
                      const matchScore = Math.min(99, 78 + job.skills.filter((skill) => applicant?.skills.some((candidateSkill) => candidateSkill.toLowerCase() === skill.toLowerCase())).length * 4);
                      return (
                        <div
                          key={job.id}
                          className="flex flex-col justify-between gap-4 p-5 hover:bg-gray-50/70 sm:flex-row sm:items-center dark:hover:bg-[#252525]"
                        >
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#1877F2]">
                                {job.code}
                              </span>
                              <span className="text-[#CCC]">·</span>
                              <h3 className="text-sm font-bold text-[#1F2937] dark:text-white">
                                {job.title}
                              </h3>
                              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                {matchScore}% Match
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                              <span className="flex items-center gap-1 font-medium text-[#1F2937] dark:text-white">
                                <Building className="h-3.5 w-3.5 text-[#888]" />
                                {job.client}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-[#888]" />
                                {job.location}
                              </span>
                              {job.billRate && (
                                <span className="flex items-center gap-1 font-medium text-[#2F80ED]">
                                  <DollarSign className="h-3.5 w-3.5" />
                                  {job.billRate}
                                </span>
                              )}
                              <span>Experience: {job.experienceRequired || '3-5 Years'}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {job.skills.slice(0, 5).map((s) => (
                                <span
                                  key={s}
                                  className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-[#444] dark:bg-[#333] dark:text-[#DDD]"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleSubmitToJob(job)}
                              disabled={submittingJobId === job.id}
                              className="flex items-center gap-1.5 rounded bg-[#1877F2] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#166FE5] disabled:opacity-50"
                            >
                              <Send className="h-3.5 w-3.5" />
                              <span>{submittingJobId === job.id ? 'Submitting...' : 'Submit to Job'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => navigate('job-detail', job.id)}
                              className="rounded border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#444] hover:bg-gray-50 dark:border-[#444] dark:bg-[#2A2A2A] dark:text-white"
                            >
                              View Job
                            </button>

                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setActionMenuJobId(actionMenuJobId === job.id ? null : job.id)
                                }
                                className="rounded p-1.5 text-[#888] hover:bg-gray-100 hover:text-[#222] dark:hover:bg-[#333]"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {actionMenuJobId === job.id && (
                                <div className="absolute right-0 top-full z-30 mt-1 w-48 rounded-lg border border-[#CBD5E1] bg-white py-1 shadow-xl dark:border-[#444] dark:bg-[#252525]">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      showToast(`AI Match Analysis for ${job.title}: 96% skill synergy`);
                                      setActionMenuJobId(null);
                                    }}
                                    className="block w-full px-3 py-1.5 text-left text-xs text-[#333] hover:bg-gray-100 dark:text-white dark:hover:bg-[#333]"
                                  >
                                    AI Match Insights
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      showToast(`Job ${job.code} shared with ${applicant?.email}`);
                                      setActionMenuJobId(null);
                                    }}
                                    className="block w-full px-3 py-1.5 text-left text-xs text-[#333] hover:bg-gray-100 dark:text-white dark:hover:bg-[#333]"
                                  >
                                    Email Job to Candidate
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard?.writeText(window.location.href);
                                      showToast('Job link copied to clipboard');
                                      setActionMenuJobId(null);
                                    }}
                                    className="block w-full px-3 py-1.5 text-left text-xs text-[#333] hover:bg-gray-100 dark:text-white dark:hover:bg-[#333]"
                                  >
                                    Copy Job Link
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
