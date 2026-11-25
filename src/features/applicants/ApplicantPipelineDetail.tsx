import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, FileText, Mail, MapPin, Phone, Star } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { Applicant, Job } from '../../types';

type PipelineTab = 'Submission' | 'Notes & Docs' | 'Personal Details' | 'Interviews & Tasks' | 'Employment Tests';

const displayValue = (value: unknown): string => {
  if (value === undefined || value === null || String(value).trim() === '') return 'N/A';
  return String(value);
};

export const ApplicantPipelineDetail: React.FC = () => {
  const { selectedId, navigate } = useAppStore();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState<PipelineTab>('Submission');
  const [loading, setLoading] = useState(true);

  const { applicantId, jobId } = useMemo(() => {
    const [candidateId = '', associatedJobId = ''] = (selectedId || '').split('::');
    return { applicantId: candidateId, jobId: associatedJobId };
  }, [selectedId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      applicantId ? ApiService.getApplicantById(applicantId) : Promise.resolve(undefined),
      jobId && jobId !== '—' ? ApiService.getJobById(jobId) : Promise.resolve(undefined),
    ]).then(([candidate, associatedJob]) => {
      if (!active) return;
      setApplicant(candidate || null);
      setJob(associatedJob || null);
    }).catch(() => {
      if (!active) return;
      setApplicant(null);
      setJob(null);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [applicantId, jobId]);

  const detail = (label: string, value: unknown, link = false) => (
    <div className="min-w-0 space-y-1">
      <dt className="text-xs text-[#64748B]">{label}</dt>
      <dd className={`break-words text-[13px] font-medium ${link ? 'text-[#2563EB]' : 'text-[#1E293B]'}`}>{displayValue(value)}</dd>
    </div>
  );

  if (loading) return <div className="p-8 text-sm text-[#64748B]">Loading pipeline record…</div>;
  if (!applicant) return <div className="m-4 rounded-lg border border-[#D8E3F1] bg-white p-8 text-sm text-[#64748B]">Applicant pipeline record could not be found. <button className="ml-2 text-[#2563EB] hover:underline" onClick={() => navigate('applicants')}>Back to Applicants</button></div>;

  const location = [applicant.location, applicant.state, applicant.country, applicant.zipCode].filter(Boolean).join(', ');
  const rightDetails = [
    ['Tagged By & On', `${applicant.source || '—'} on ${applicant.createdOn || applicant.createdDate || '—'}`],
    ['Ownership', applicant.assignedRecruiter],
    ['Assigned To', applicant.assignedRecruiter],
    ['Recruitment Manager', job?.assignedRecruiter],
    ['Client Job ID', job?.clientJobId],
    ['Source', applicant.source],
    ['Work Authorization', applicant.workAuthorization],
    ['Home Phone Number', applicant.homePhone],
    ['Skills', applicant.skills?.join(', ')],
    ['Experience', `${applicant.experienceYears || 0} Years`],
    ['Date Of Birth', applicant.dateOfBirth],
    ['Relocation', applicant.willingToRelocate ? 'Yes' : 'No'],
  ];

  return <div className="min-h-full bg-[#EDF1F4] text-[#1E293B]">
    <div className="sticky top-0 z-10 flex h-12 items-center gap-5 border-b border-[#D8E3F1] bg-white px-4 shadow-sm">
      <button aria-label="Back to applicants" onClick={() => navigate('applicants')} className="rounded p-1 text-[#64748B] hover:bg-[#F1F5F9]"><ArrowLeft className="h-4 w-4" /></button>
      {(['Submission', 'Notes & Docs', 'Personal Details', 'Interviews & Tasks', 'Employment Tests'] as PipelineTab[]).map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`h-full whitespace-nowrap border-b-2 px-1 text-xs ${activeTab === tab ? 'border-[#3B82F6] font-semibold text-[#2563EB]' : 'border-transparent text-[#64748B] hover:text-[#1E293B]'}`}>{tab}</button>)}
      <button className="ml-auto rounded p-1.5 text-[#2563EB]" aria-label="More sections"><span className="font-bold">•••</span></button>
    </div>

    <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_350px]">
      <main className="min-w-0 space-y-4">
        <section className="rounded-md border border-[#D8E3F1] bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8D0E9] text-sm font-semibold text-[#8A4D95]">{applicant.name.slice(0, 1).toUpperCase()}</div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-semibold text-[#2563EB]">{applicant.name}</h1>
              <p className="mt-0.5 text-xs text-[#334155]">{applicant.applicantId} Tagged to {job ? <button onClick={() => navigate('job-detail', job.id)} className="text-[#2563EB] hover:underline">{job.code} - {job.title}</button> : applicant.assignedJobTitle || 'Pipeline'}</p>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#64748B]">
                {location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{location}</span>}
                {applicant.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{applicant.phone}</span>}
                {applicant.email && <span className="inline-flex items-center gap-1 text-[#2563EB]"><Mail className="h-3.5 w-3.5" />{applicant.email}</span>}
              </div>
              <p className="mt-2 text-xs">Pipeline Status: <span className="font-medium">{displayValue(applicant.pipelineStatus || applicant.status)}</span></p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => navigate('applicant-detail', applicant.id)} className="rounded border border-[#3B82F6] px-2.5 py-1 text-xs text-[#2563EB] hover:bg-blue-50">View Resume</button>
                <button onClick={() => navigate('applicant-detail', applicant.id)} className="rounded border border-[#3B82F6] px-2.5 py-1 text-xs text-[#2563EB] hover:bg-blue-50">Edit Applicant</button>
                <button onClick={() => navigate('applicant-detail', applicant.id)} className="rounded bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-2.5 py-1 text-xs font-medium text-white">Review AI Conversation</button>
                <button className="inline-flex items-center gap-1 rounded border border-[#CBD5E1] px-2 py-1 text-xs text-[#475569]">More <ChevronDown className="h-3 w-3" /></button>
              </div>
            </div>
            <div className="hidden min-w-[180px] text-right text-xs text-[#64748B] md:block">
              {['Technical Skills', 'Communication Skills', 'Professionalism', 'Overall Rating'].map((label) => <p key={label} className="mb-1">{label}: <span className="text-[#C7C7C7]">★★★★★</span></p>)}
              <p className="mt-4">Last rating - N/A</p><button className="mt-2 rounded bg-[#3B82F6] px-2 py-1 text-[11px] font-medium text-white">Rating History</button>
            </div>
          </div>
        </section>

        {activeTab === 'Submission' ? <>
          <section className="min-h-[340px] rounded-md border border-[#D8E3F1] bg-white p-5 shadow-sm">
            <h2 className="mb-7 text-base font-semibold">Submission Details</h2>
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {detail('Full Name', applicant.name)}
              {detail('Work Authorization', applicant.workAuthorization)}
              {detail('Email', applicant.email, true)}
              {detail('Contact Number', applicant.phone, true)}
              {detail('Client Bill Rate/Salary', job?.billRate)}
              {detail('Submitted By', applicant.assignedRecruiter)}
              {detail('Resume', applicant.documents?.find((document) => /resume|cv/i.test(document.name))?.name || 'N/A', true)}
              {detail('Additional Attachment', 'N/A')}
              {detail('Internal Proposed Interview Time Slots', applicant.internalInterviewTimeSlots)}
              {detail('Client Proposed Interview Time Slots', applicant.clientInterviewTimeSlots)}
            </dl>
          </section>
          <section className="rounded-md border border-[#D8E3F1] bg-white p-5 shadow-sm"><h2 className="text-base font-semibold">Additional Details</h2><p className="mt-4 text-xs text-[#64748B]">No additional pipeline details are available.</p></section>
        </> : activeTab === 'Notes & Docs' ? <section className="rounded-md border border-[#D8E3F1] bg-white p-5 shadow-sm"><h2 className="mb-4 text-base font-semibold">Notes &amp; Documents</h2><div className="space-y-3">{applicant.notes?.map((note) => <article key={note.id} className="border-b border-[#E2E8F0] pb-3"><p className="text-sm">{note.text}</p><p className="mt-1 text-xs text-[#64748B]">{note.author} · {note.date}</p></article>)}{applicant.documents?.map((document) => <p key={document.id || document.name} className="flex items-center gap-2 text-sm text-[#2563EB]"><FileText className="h-4 w-4" />{document.name}</p>)}{!applicant.notes?.length && !applicant.documents?.length && <p className="text-sm text-[#64748B]">No notes or documents available.</p>}</div></section> : <section className="rounded-md border border-[#D8E3F1] bg-white p-5 shadow-sm"><h2 className="mb-6 text-base font-semibold">{activeTab}</h2><dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{detail('Candidate', applicant.name)}{detail('Current Title/Designation', applicant.currentDesignation)}{detail('Email', applicant.email)}{detail('Phone', applicant.phone)}{detail('Location', location)}{detail('Skills', applicant.skills?.join(', '))}</dl></section>}
      </main>

      <aside className="h-fit rounded-md border border-[#D8E3F1] bg-white p-5 shadow-sm xl:sticky xl:top-16">
        <h2 className="mb-5 text-base font-semibold">Submission Details</h2>
        <dl className="space-y-4">{rightDetails.map(([label, value]) => <div key={label} className="space-y-1"><dt className="text-xs text-[#64748B]">{label}</dt><dd className="break-words text-[13px] font-medium text-[#1E293B]">{displayValue(value)}</dd></div>)}</dl>
        <div className="mt-6 border-t border-[#E2E8F0] pt-5"><h3 className="mb-4 text-sm font-semibold">Personal Details</h3><dl className="space-y-4">{detail('Address', applicant.address)}{detail('Country', applicant.country)}{detail('State', applicant.state)}{detail('City', applicant.location)}{detail('Expected CTC', applicant.expectedCTC)}{detail('Notice Period', applicant.noticePeriod)}</dl></div>
      </aside>
    </div>
  </div>;
};
