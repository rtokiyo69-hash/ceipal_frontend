import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Search } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { Applicant, Job, Submission } from '../../types';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const MAX_VISIBLE_APPLICANTS = 10_000;
type ApplicantDateRange = '6-months' | '1-year' | 'all';

function getApplicantCreatedTime(applicant: Applicant): number {
  const createdOn = applicant.createdOn || applicant.createdDate;
  if (!createdOn) return 0;
  const timestamp = Date.parse(createdOn);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatApplicantCreatedOn(applicant: Applicant): string {
  const value = applicant.createdOn || applicant.createdDate;
  if (!value) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`).toLocaleDateString();
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export const ApplicantProfileSubmission: React.FC = () => {
  const { selectedId, navigate } = useAppStore();
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [searchPeriod, setSearchPeriod] = useState<ApplicantDateRange>('all');
  const [appliedPeriod, setAppliedPeriod] = useState<ApplicantDateRange>('all');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplicantIds, setSelectedApplicantIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    let isCurrent = true;
    if (!selectedId) {
      setErrorMessage('No job was selected for applicant submission.');
      setIsLoading(false);
      return () => {
        isCurrent = false;
      };
    }

    setIsLoading(true);
    setErrorMessage('');
    Promise.all([
      ApiService.getJobById(selectedId),
      ApiService.getApplicants(),
      ApiService.getSubmissions()
    ]).then(([selectedJob, allApplicants, allSubmissions]) => {
      if (!isCurrent) return;
      if (!selectedJob) {
        setErrorMessage('The selected job could not be found.');
        return;
      }
      setJob(selectedJob);
      setApplicants(allApplicants);
      setSubmissions(allSubmissions);
    }).catch((error: unknown) => {
      if (!isCurrent) return;
      const message = error instanceof Error ? error.message : 'Unknown applicant submission loading error.';
      setErrorMessage(`Unable to load applicant profiles: ${message}`);
    }).finally(() => {
      if (isCurrent) setIsLoading(false);
    });

    return () => {
      isCurrent = false;
    };
  }, [selectedId]);

  const latestApplicants = useMemo(() => applicants
    .map((applicant, index) => ({ applicant, index, createdTime: getApplicantCreatedTime(applicant) }))
    .sort((left, right) => right.createdTime - left.createdTime || left.index - right.index)
    .slice(0, MAX_VISIBLE_APPLICANTS)
    .map(({ applicant }) => applicant), [applicants]);

  const filteredApplicants = useMemo(() => {
    const query = appliedSearch.trim().toLocaleLowerCase();
    const cutoff = new Date();
    if (appliedPeriod === '6-months') cutoff.setMonth(cutoff.getMonth() - 6);
    if (appliedPeriod === '1-year') cutoff.setFullYear(cutoff.getFullYear() - 1);
    const cutoffTime = cutoff.getTime();
    return latestApplicants.filter((applicant) => {
      const createdTime = getApplicantCreatedTime(applicant);
      const matchesPeriod = appliedPeriod === 'all' || (createdTime > 0 && createdTime >= cutoffTime);
      const matchesSearch = !query || [
        applicant.applicantId,
        applicant.name,
        applicant.email,
        applicant.phone,
        applicant.workAuthorization || ''
      ].some((value) => value.toLocaleLowerCase().includes(query))
      return matchesPeriod && matchesSearch;
    });
  }, [latestApplicants, appliedSearch, appliedPeriod]);

  const pageCount = Math.max(1, Math.ceil(filteredApplicants.length / pageSize));
  const pageStart = filteredApplicants.length ? (currentPage - 1) * pageSize : 0;
  const pageEnd = Math.min(pageStart + pageSize, filteredApplicants.length);
  const visibleApplicants = filteredApplicants.slice(pageStart, pageEnd);
  const visiblePageNumbers = Array.from({ length: Math.min(pageCount, 5) }, (_, index) => index + 1);
  const submissionsForJob = submissions.filter((submission) =>
    submission.jobId === job?.id || submission.jobTitle === job?.title
  );

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(''), 3000);
  };

  const toggleApplicant = (applicantId: string) => {
    setSelectedApplicantIds((current) => current.includes(applicantId)
      ? current.filter((id) => id !== applicantId)
      : [...current, applicantId]);
  };

  const toggleVisibleApplicants = (checked: boolean) => {
    const pageIds = visibleApplicants.map((applicant) => applicant.id);
    setSelectedApplicantIds((current) => checked
      ? Array.from(new Set([...current, ...pageIds]))
      : current.filter((id) => !pageIds.includes(id)));
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedSearch(search);
    setAppliedPeriod(searchPeriod);
    setCurrentPage(1);
  };

  const handleSubmitProfiles = async () => {
    if (!job || selectedApplicantIds.length === 0 || isSubmitting) return;

    const alreadySubmittedIds = new Set(submissionsForJob.map((submission) => submission.applicantId));
    const candidatesToSubmit = applicants.filter((applicant) =>
      selectedApplicantIds.includes(applicant.id) && !alreadySubmittedIds.has(applicant.id)
    );
    if (candidatesToSubmit.length === 0) {
      showToast('All selected applicants are already submitted to this job.');
      return;
    }

    setIsSubmitting(true);
    const createdSubmissions: Submission[] = [];
    try {
      for (const applicant of candidatesToSubmit) {
        const submission = await ApiService.createSubmission({
          applicantId: applicant.id,
          applicantName: applicant.name,
          jobId: job.id,
          jobTitle: job.title,
          client: job.client,
          recruiter: job.assignedRecruiter || 'Ganesh Godse',
          billRate: job.billRate,
          payRate: job.payRate,
          status: 'Waiting for Evaluation by Internal Reviewer'
        });
        createdSubmissions.push(submission);
      }
      setSubmissions((current) => [...createdSubmissions, ...current]);
      setSelectedApplicantIds([]);
      showToast(`Submitted ${createdSubmissions.length} applicant profile${createdSubmissions.length === 1 ? '' : 's'}.`);
    } catch (error) {
      if (createdSubmissions.length > 0) {
        setSubmissions((current) => [...createdSubmissions, ...current]);
        setSelectedApplicantIds((current) =>
          current.filter((id) => !createdSubmissions.some((submission) => submission.applicantId === id))
        );
      }
      const message = error instanceof Error ? error.message : 'Unknown submission error.';
      showToast(createdSubmissions.length > 0
        ? `Submitted ${createdSubmissions.length} profile(s), but another submission failed: ${message}`
        : `Unable to submit applicant profiles: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-sm text-[#667085]">Loading applicant profiles...</div>;
  }

  if (!job || errorMessage) {
    return (
      <div className="p-8">
        <p role="alert" className="mb-4 text-sm text-[#B42318]">{errorMessage || 'The selected job could not be found.'}</p>
        <button
          type="button"
          onClick={() => navigate('jobs')}
          className="inline-flex items-center gap-2 rounded bg-[#3478F6] px-3 py-2 text-sm font-medium text-white hover:bg-[#2868DC]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="-m-6 min-h-full bg-[#EAF0F5] p-3 text-[#252525] md:-m-8 md:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Applicant Profile Submission</h1>
        <button
          type="button"
          onClick={() => navigate('applicant-new')}
          className="inline-flex items-center gap-1.5 rounded bg-[#3478F6] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2868DC]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Applicant
        </button>
      </div>

      <div className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,2.1fr)_minmax(235px,0.9fr)]">
        <section className="min-w-0 rounded-md border border-[#D7DEE5] bg-[#FFFFFF] p-3 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full bg-[#4385F5] px-2.5 py-1 text-[11px] font-semibold text-white">Applicant Profile</span>
            <button
              type="button"
              onClick={() => void handleSubmitProfiles()}
              disabled={selectedApplicantIds.length === 0 || isSubmitting}
              className="rounded bg-[#4385F5] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2868DC] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Profile'}
            </button>
          </div>

          <form onSubmit={handleSearch} className="mb-3 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#98A2B3]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Applicant Id or Name or Email"
                aria-label="Search applicant profiles"
                className="h-[30px] w-full border border-[#D0D5DD] bg-[#FFFFFF] pl-7 pr-2 text-[11px] outline-none focus:border-[#4385F5]"
              />
            </div>
            <select
              value={searchPeriod}
              onChange={(event) => {
                const value = event.target.value;
                if (value === '6-months' || value === '1-year' || value === 'all') {
                  setSearchPeriod(value);
                  setCurrentPage(1);
                }
              }}
              aria-label="Applicant date range"
              className="h-[30px] border border-[#D0D5DD] bg-[#F8FAFC] px-2 text-[11px] text-[#344054]"
            >
              <option value="6-months">Past 6 Months</option>
              <option value="1-year">Past 1 Year</option>
              <option value="all">All Candidates</option>
            </select>
            <button type="submit" className="h-[30px] rounded bg-[#4385F5] px-3 text-xs font-medium text-white hover:bg-[#2868DC]">
              Search
            </button>
          </form>

          <div className="mb-1 flex justify-end gap-1 text-[10px] text-[#667085]">
            <span>Show</span>
            <select
              aria-label="Rows per page"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setCurrentPage(1);
              }}
              className="h-6 border border-[#D0D5DD] bg-[#FFFFFF] px-1 text-[10px] text-[#344054]"
            >
              {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
            <span>entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] border-collapse text-left text-[11px]">
              <thead>
                <tr className="border-y border-[#D7DEE5] text-[10px] font-semibold text-[#344054]">
                  <th className="w-8 px-2 py-2">
                    <input
                      type="checkbox"
                      aria-label="Select all applicants on this page"
                      checked={visibleApplicants.length > 0 && visibleApplicants.every((applicant) => selectedApplicantIds.includes(applicant.id))}
                      onChange={(event) => toggleVisibleApplicants(event.target.checked)}
                    />
                  </th>
                  <th className="px-2 py-2">ID</th>
                  <th className="px-2 py-2">NAME</th>
                  <th className="px-2 py-2">MOBILE NUMBER</th>
                  <th className="px-2 py-2">EMAIL ADDRESS</th>
                  <th className="px-2 py-2">WORK AUTH.</th>
                  <th className="px-2 py-2">CREATED BY</th>
                  <th className="px-2 py-2">CREATED ON</th>
                </tr>
              </thead>
              <tbody>
                {visibleApplicants.map((applicant) => {
                  const isAlreadySubmitted = submissionsForJob.some((submission) => submission.applicantId === applicant.id);
                  return (
                    <tr key={applicant.id} className="border-b border-[#E5EAF0] text-[#344054] hover:bg-[#F8FAFC]">
                      <td className="px-2 py-2.5">
                        <input
                          type="checkbox"
                          aria-label={`Select ${applicant.name}`}
                          checked={selectedApplicantIds.includes(applicant.id)}
                          onChange={() => toggleApplicant(applicant.id)}
                        />
                      </td>
                      <td className="px-2 py-2.5 text-[#3478F6]">{applicant.applicantId}</td>
                      <td className="whitespace-nowrap px-2 py-2.5">{applicant.name}</td>
                      <td className="whitespace-nowrap px-2 py-2.5 text-[#3478F6]">{applicant.phone || 'N/A'}</td>
                      <td className="whitespace-nowrap px-2 py-2.5 text-[#3478F6]">{applicant.email || 'N/A'}</td>
                      <td className="whitespace-nowrap px-2 py-2.5">{applicant.workAuthorization || 'N/A'}{isAlreadySubmitted ? ' · Submitted' : ''}</td>
                      <td className="whitespace-nowrap px-2 py-2.5">{applicant.createdBy || applicant.assignedRecruiter || '—'}</td>
                      <td className="whitespace-nowrap px-2 py-2.5">{formatApplicantCreatedOn(applicant)}</td>
                    </tr>
                  );
                })}
                {visibleApplicants.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-10 text-center text-xs text-[#667085]">No applicant profiles match this search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[10px] text-[#667085]">
            <span>
              Showing {filteredApplicants.length ? pageStart + 1 : 0} to {pageEnd} of {filteredApplicants.length} entries
              {applicants.length > MAX_VISIBLE_APPLICANTS
                ? ` · latest ${MAX_VISIBLE_APPLICANTS.toLocaleString()} of ${applicants.length.toLocaleString()} applicants`
                : ` · maximum ${MAX_VISIBLE_APPLICANTS.toLocaleString()} applicants`}
            </span>
            <div className="flex items-center">
              <button
                type="button"
                aria-label="First page"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="border border-[#D0D5DD] px-2 py-1 disabled:opacity-40"
              >
                <ChevronsLeft className="h-3 w-3" />
              </button>
              <button
                type="button"
                aria-label="Previous page"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="border-y border-r border-[#D0D5DD] px-2 py-1 disabled:opacity-40"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              {visiblePageNumbers.map((page) => (
                <button
                  type="button"
                  key={page}
                  aria-current={currentPage === page ? 'page' : undefined}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-8 border-y border-r border-[#D0D5DD] px-2 py-1 ${currentPage === page ? 'bg-[#4385F5] font-semibold text-white' : 'bg-[#FFFFFF] text-[#344054] hover:bg-[#F2F6FC]'}`}
                >
                  {page}
                </button>
              ))}
              {pageCount > 5 && (
                <>
                  <span className="border-y border-r border-[#D0D5DD] bg-[#FFFFFF] px-2 py-1">…</span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(pageCount)}
                    className="min-w-8 border-y border-r border-[#D0D5DD] bg-[#FFFFFF] px-2 py-1 text-[#344054] hover:bg-[#F2F6FC]"
                  >
                    {pageCount}
                  </button>
                </>
              )}
              <button
                type="button"
                aria-label="Next page"
                onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                disabled={currentPage === pageCount}
                className="border-y border-r border-[#D0D5DD] px-2 py-1 disabled:opacity-40"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
              <button
                type="button"
                aria-label="Last page"
                onClick={() => setCurrentPage(pageCount)}
                disabled={currentPage === pageCount}
                className="border-y border-r border-[#D0D5DD] px-2 py-1 disabled:opacity-40"
              >
                <ChevronsRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </section>

        <aside className="rounded-md border border-[#D7DEE5] bg-[#FFFFFF] p-4 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Job Details</h2>
          <dl className="space-y-4 text-xs">
            <div>
              <dt className="mb-1 text-[#667085]">Job Code</dt>
              <dd className="text-[#3478F6]">{job.code}</dd>
            </div>
            <div>
              <dt className="mb-1 text-[#667085]">Job Title</dt>
              <dd>{job.title}</dd>
            </div>
            <div>
              <dt className="mb-1 text-[#667085]">Client</dt>
              <dd>{job.client}</dd>
            </div>
            <div>
              <dt className="mb-1 text-[#667085]">Client Job ID</dt>
              <dd>{job.clientJobId || 'N/A'}</dd>
            </div>
            <div>
              <dt className="mb-1 text-[#667085]">City</dt>
              <dd>{job.location || 'N/A'}</dd>
            </div>
            <div>
              <dt className="mb-1 text-[#667085]">States</dt>
              <dd>{job.states || 'N/A'}</dd>
            </div>
          </dl>
        </aside>
      </div>

      {toastMessage && (
        <div role="status" className="fixed bottom-5 right-5 z-50 rounded-md bg-[#252525] px-4 py-2 text-xs text-white shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
