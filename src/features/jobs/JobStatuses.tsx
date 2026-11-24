import React, { useState } from 'react';
import { ListChecks } from 'lucide-react';
import { InterviewLookup, type JobStatusLookupKind } from './InterviewLookup';

const tabs: JobStatusLookupKind[] = ['Job Status Categories', 'Job Statuses'];

export function JobStatuses() {
  const [activeTab, setActiveTab] = useState<JobStatusLookupKind>('Job Status Categories');
  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(tabs[next]);
    event.currentTarget.closest('nav')?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
  };
  return <section className="posting-panel posting-interviews space-y-4">
    <div className="posting-panel-heading"><span className="posting-section-icon"><ListChecks size={21} /></span><div><h2>Job Statuses</h2></div></div>
    <nav aria-label="Job statuses sections" className="flex overflow-x-auto border-b border-[#D8E3F1] bg-white dark:border-[#334155] dark:bg-[#1E293B]">
      {tabs.map((tab, index) => <button key={tab} type="button" aria-current={activeTab === tab ? 'page' : undefined} tabIndex={activeTab === tab ? 0 : -1} onClick={() => setActiveTab(tab)} onKeyDown={event => onKeyDown(event, index)} className={`shrink-0 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors ${activeTab === tab ? 'border-[#2563EB] text-[#125B97] dark:text-[#93C5FD]' : 'border-transparent text-[#475569] hover:text-[#1E293B] dark:text-[#BFDBFE] dark:hover:text-white'}`}>{tab}</button>)}
    </nav>
    <InterviewLookup key={activeTab} kind={activeTab} />
  </section>;
}
