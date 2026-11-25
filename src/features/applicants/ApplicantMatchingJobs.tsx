import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BriefcaseBusiness, MapPin, Search, Sparkles } from 'lucide-react';
import { Applicant, Job } from '../../types';
import { ApiService } from '../../services/api';
import { useAppStore } from '../../store/appStore';

const text = (value: unknown) => String(value ?? '').trim();
const terms = (value: string) => value.toLowerCase().split(/[^a-z0-9+#.]+/).filter((part) => part.length > 1);

export const ApplicantMatchingJobs: React.FC = () => {
  const { selectedId, navigate } = useAppStore();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [skillSearch, setSkillSearch] = useState('');
  const [jobTitles, setJobTitles] = useState(['']);
  const [industry, setIndustry] = useState('');
  const [createdOn, setCreatedOn] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [distance, setDistance] = useState('');
  const [distanceUnit, setDistanceUnit] = useState<'Miles' | 'KM'>('Miles');
  const [applied, setApplied] = useState({ skill: '', titles: [] as string[], industry: '', createdOn: '', country: '', state: '', city: '', zip: '' });

  useEffect(() => {
    let active = true;
    if (!selectedId) {
      setLoading(false);
      return;
    }
    Promise.all([ApiService.getApplicantById(selectedId), ApiService.getJobs()]).then(([candidate, availableJobs]) => {
      if (!active) return;
      setApplicant(candidate || null);
      setJobs(availableJobs);
      setLoading(false);
    }).catch(() => setLoading(false));
    return () => { active = false; };
  }, [selectedId]);

  const industries = useMemo(() => [...new Set(jobs.map((job) => job.industry).filter((value): value is string => Boolean(value)))].sort(), [jobs]);
  const results = useMemo(() => {
    if (!applicant) return [];
    const applicantSkills = [...(applicant.skills || []), ...(applicant.primarySkills || [])].flatMap(terms);
    const applicantText = terms(`${applicant.currentDesignation} ${applicant.summary || ''} ${applicant.skills?.join(' ') || ''}`);
    return jobs
      .filter((job) => !['Closed', 'On Hold', 'Draft'].includes(job.status))
      .map((job) => {
        const jobSkills = [...(job.skills || []), ...(job.primarySkills || []), ...(job.secondarySkills || [])];
        const normalizedSkills = jobSkills.flatMap(terms);
        const overlap = new Set(applicantSkills.filter((skill) => normalizedSkills.includes(skill))).size;
        const skillScore = normalizedSkills.length ? Math.round(overlap / Math.min(normalizedSkills.length, 8) * 65) : 0;
        const titleTokens = terms(job.title);
        const titleScore = titleTokens.length ? Math.round(titleTokens.filter((token) => applicantText.includes(token)).length / titleTokens.length * 20) : 0;
        const minYears = job.minExperience ?? (Number.parseInt(job.experienceRequired, 10) || 0);
        const experienceScore = !minYears || applicant.experienceYears >= minYears ? 10 : Math.max(0, Math.round(10 * applicant.experienceYears / minYears));
        const candidateLocation = (applicant.location || '').toLowerCase();
        const locationScore = candidateLocation && candidateLocation.split(/[(),/]/).some((part) => part.trim().length > 2 && job.location.toLowerCase().includes(part.trim())) ? 5 : 0;
        return { job, score: Math.min(99, Math.max(1, skillScore + titleScore + experienceScore + locationScore)), jobSkills, overlap };
      })
      .filter(({ job, jobSkills }) => {
        const allJobText = `${job.title} ${jobSkills.join(' ')} ${job.location} ${job.industry || ''}`.toLowerCase();
        const jobLocation = `${job.location} ${job.address || ''} ${job.states || ''}`.toLowerCase();
        return (!applied.skill || applied.skill.toLowerCase().split(/[ ,]+/).every((item) => allJobText.includes(item)))
          && applied.titles.every((title) => job.title.toLowerCase().includes(title.toLowerCase()))
          && (!applied.industry || job.industry === applied.industry)
          && (!applied.createdOn || job.createdDate >= applied.createdOn)
          && (!applied.country || jobLocation.includes(applied.country.toLowerCase()))
          && (!applied.state || jobLocation.includes(applied.state.toLowerCase()))
          && (!applied.city || jobLocation.includes(applied.city.toLowerCase()))
          && (!applied.zip || jobLocation.includes(applied.zip.toLowerCase()));
      })
      .sort((a, b) => b.score - a.score);
  }, [applicant, jobs, applied]);

  const runSearch = () => setApplied({ skill: skillSearch.trim(), titles: jobTitles.map((title) => title.trim()).filter(Boolean), industry, createdOn, country, state, city, zip });
  const resetSearch = () => { setSkillSearch(''); setJobTitles(['']); setIndustry(''); setCreatedOn(''); setCountry(''); setState(''); setCity(''); setZip(''); setDistance(''); setDistanceUnit('Miles'); setApplied({ skill: '', titles: [], industry: '', createdOn: '', country: '', state: '', city: '', zip: '' }); };

  return <div className="min-h-full bg-[#EDF2F6] p-4 md:p-6 dark:bg-[#1E293B]">
    <button type="button" onClick={() => navigate('applicants')} className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#2563EB] hover:underline"><ArrowLeft className="h-4 w-4" /> Back to Applicants</button>
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[#D8E3F1] pb-3 dark:border-[#334155]">
      <div><div className="flex items-center gap-2 text-xl font-semibold text-[#1E293B] dark:text-white"><Sparkles className="h-5 w-5 text-[#2563EB]" />AI matching jobs</div>
        {applicant && <p className="mt-1 text-sm text-[#64748B] dark:text-slate-300">Recommended jobs for <span className="font-semibold text-[#334155] dark:text-white">{applicant.name}</span></p>}
      </div>
      <span className="text-sm text-[#64748B] dark:text-slate-300">Showing {results.length} jobs</span>
    </div>
    <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="h-fit rounded-md border border-[#D8E3F1] bg-white p-4 dark:border-[#334155] dark:bg-[#1E293B]">
        <h2 className="mb-4 text-lg font-semibold text-[#1E293B] dark:text-white">Filter These Results</h2>
        <label className="mb-4 block text-[11px] font-semibold uppercase text-[#334155] dark:text-slate-200">Skill Search<input value={skillSearch} onChange={(event) => setSkillSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && runSearch()} placeholder="Boolean Search" className="mt-2 w-full border border-[#D8E3F1] bg-[#F8FAFC] px-2 py-2 text-xs font-normal normal-case outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800" /></label>
        <div className="mb-4 text-[11px] font-semibold uppercase text-[#334155] dark:text-slate-200">Job Title
          {jobTitles.map((title, index) => <div key={index} className="mt-2 flex items-center gap-1"><input value={title} onChange={(event) => setJobTitles((items) => items.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} onKeyDown={(event) => event.key === 'Enter' && runSearch()} className="w-full border border-[#D8E3F1] bg-[#F8FAFC] px-2 py-2 text-xs font-normal normal-case outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800" aria-label={`Job title filter ${index + 1}`} /><button type="button" title="Remove job title" aria-label="Remove job title" onClick={() => setJobTitles((items) => items.length > 1 ? items.filter((_, itemIndex) => itemIndex !== index) : [''])} className="px-1 text-blue-500">?</button></div>)}
          <button type="button" onClick={() => setJobTitles((items) => [...items, ''])} className="mt-2 rounded bg-[#1683F8] px-2 py-1 text-[11px] font-semibold text-white">+ ADD</button>
        </div>
        <label className="mb-4 block text-[11px] font-semibold uppercase text-[#334155] dark:text-slate-200">Industry<select value={industry} onChange={(event) => setIndustry(event.target.value)} className="mt-2 w-full border border-[#D8E3F1] bg-[#F8FAFC] px-2 py-2 text-xs font-normal normal-case dark:border-slate-600 dark:bg-slate-800"><option value="">Select</option>{industries.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="mb-4 block text-[11px] font-semibold uppercase text-[#334155] dark:text-slate-200">Created On<input type="date" value={createdOn} onChange={(event) => setCreatedOn(event.target.value)} className="mt-2 w-full border border-[#D8E3F1] bg-[#F8FAFC] px-2 py-2 text-xs font-normal normal-case dark:border-slate-600 dark:bg-slate-800" /></label>
        <h3 className="mb-3 text-base font-medium text-[#1E293B] dark:text-white">Location</h3>
        <label className="mb-4 block text-[11px] font-semibold uppercase text-[#334155] dark:text-slate-200">Country<select value={country} onChange={(event) => setCountry(event.target.value)} className="mt-2 w-full border border-[#D8E3F1] bg-[#F8FAFC] px-2 py-2 text-xs font-normal normal-case dark:border-slate-600 dark:bg-slate-800"><option value="">Select Country</option>{[...new Set(jobs.flatMap((job) => job.location.split(',').map((part) => part.trim())).filter(Boolean))].sort().map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="mb-4 block text-[11px] font-semibold uppercase text-[#334155] dark:text-slate-200">State<input value={state} onChange={(event) => setState(event.target.value)} className="mt-2 w-full border border-[#D8E3F1] bg-[#F8FAFC] px-2 py-2 text-xs font-normal normal-case dark:border-slate-600 dark:bg-slate-800" /></label>
        <label className="mb-4 block text-[11px] font-semibold uppercase text-[#334155] dark:text-slate-200">City<input value={city} onChange={(event) => setCity(event.target.value)} className="mt-2 w-full border border-[#D8E3F1] bg-[#F8FAFC] px-2 py-2 text-xs font-normal normal-case dark:border-slate-600 dark:bg-slate-800" /></label>
        <label className="mb-4 block text-[11px] font-semibold uppercase text-[#334155] dark:text-slate-200">ZIP/Postal<input value={zip} onChange={(event) => setZip(event.target.value)} className="mt-2 w-full border border-[#D8E3F1] bg-[#F8FAFC] px-2 py-2 text-xs font-normal normal-case dark:border-slate-600 dark:bg-slate-800" /></label>
        <label className="mb-2 block text-[11px] font-semibold uppercase text-[#334155] dark:text-slate-200">Distance<input type="number" min="0" value={distance} onChange={(event) => setDistance(event.target.value)} className="mt-2 w-full border border-[#D8E3F1] bg-[#F8FAFC] px-2 py-2 text-xs font-normal normal-case dark:border-slate-600 dark:bg-slate-800" /></label>
        <div className="mb-4 flex gap-5 text-[11px] font-semibold uppercase text-[#334155] dark:text-slate-200"><label className="flex items-center gap-1"><input type="radio" checked={distanceUnit === 'Miles'} onChange={() => setDistanceUnit('Miles')} /> Miles</label><label className="flex items-center gap-1"><input type="radio" checked={distanceUnit === 'KM'} onChange={() => setDistanceUnit('KM')} /> KM</label></div>
        <div className="flex gap-2"><button type="button" onClick={runSearch} className="inline-flex items-center gap-1 rounded bg-[#1683F8] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"><Search className="h-3.5 w-3.5" />Search</button><button type="button" onClick={resetSearch} className="rounded border border-[#CBD5E1] px-3 py-2 text-xs text-[#475569] dark:text-slate-200">Reset</button></div>
      </aside>
      <section className="min-w-0">
        {loading ? <div className="rounded-md border border-[#D8E3F1] bg-white p-8 text-center text-sm text-[#64748B] dark:bg-slate-800">Loading matching jobs…</div>
          : !applicant ? <div className="rounded-md border border-[#D8E3F1] bg-white p-8 text-center text-sm text-[#64748B] dark:bg-slate-800">Applicant was not found.</div>
            : results.length === 0 ? <div className="rounded-md border border-[#D8E3F1] bg-white p-8 text-center text-sm text-[#64748B] dark:bg-slate-800">No matching jobs found. Adjust the filters or add applicant skills to improve matching.</div>
              : <div className="space-y-3">{results.map(({ job, score, jobSkills, overlap }) => <article key={job.id} className="rounded-md border border-[#D8E3F1] bg-white p-4 shadow-sm dark:border-[#334155] dark:bg-slate-800">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><button type="button" onClick={() => navigate('job-detail', job.id)} className="text-left text-base font-semibold text-[#2563EB] hover:underline">{job.title}</button><div className="mt-1 text-sm text-[#475569] dark:text-slate-300">{job.client} <span className="px-1 text-slate-400">·</span> {job.code}</div></div><div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{score}% match</div></div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#64748B] dark:text-slate-300"><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span><span className="inline-flex items-center gap-1"><BriefcaseBusiness className="h-3.5 w-3.5" />{job.type} · {job.status}</span><span>{job.experienceRequired}</span><span>{job.industry || job.category || 'Industry not specified'}</span></div>
                <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#64748B] dark:text-slate-300">{job.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5"><span className="mr-1 text-[11px] font-semibold text-[#475569] dark:text-slate-200">Skills:</span>{jobSkills.slice(0, 8).map((skill) => <span key={skill} className={`rounded-full px-2 py-1 text-[10px] ${applicant.skills?.some((item) => item.toLowerCase() === skill.toLowerCase()) ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200'}`}>{skill}</span>)}<span className="ml-auto text-[10px] text-[#64748B]">{overlap} skill matches</span></div>
              </article>)}</div>}
      </section>
    </div>
  </div>;
};
