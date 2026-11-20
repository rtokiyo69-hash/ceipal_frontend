import React, { useState, useEffect } from 'react';
import { Search, X, Briefcase, Users, Building2, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ApiService } from '../../services/api';
import { Job, Applicant, Client } from '../../types';

export const GlobalSearchModal: React.FC = () => {
  const { searchOpen, setGlobalSearch, navigate } = useAppStore();
  const [query, setQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    if (searchOpen) {
      ApiService.getJobs().then(setJobs);
      ApiService.getApplicants().then(setApplicants);
      ApiService.getClients().then(setClients);
    }
  }, [searchOpen]);

  // Keyboard shortcut listener (Cmd/Ctrl + K and Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearch(!searchOpen);
      }
      if (e.key === 'Escape' && searchOpen) {
        setGlobalSearch(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setGlobalSearch]);

  if (!searchOpen) return null;

  const filteredJobs = query.trim()
    ? jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(query.toLowerCase()) ||
          j.skills.some((s) => s.toLowerCase().includes(query.toLowerCase())) ||
          j.client.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 4)
    : [];

  const filteredApplicants = query.trim()
    ? applicants.filter(
        (a) =>
          a.name.toLowerCase().includes(query.toLowerCase()) ||
          a.currentDesignation.toLowerCase().includes(query.toLowerCase()) ||
          a.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5)
    : [];

  const filteredClients = query.trim()
    ? clients.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-[#D8E3F1] dark:border-[#334155] overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#D8E3F1] dark:border-[#334155]">
          <Search className="w-5 h-5 text-[#1E293B] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search candidates, skills (Rust, AWS), jobs, clients..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-[#1E293B] dark:text-[#FFFFFF] placeholder-[#64748B] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#64748B] hover:text-[#1E293B] dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd
            onClick={() => setGlobalSearch(false)}
            className="px-2 py-1 text-[11px] font-mono bg-[#FFFFFF] dark:bg-[#475569] text-[#64748B] dark:text-[#FFFFFF] border border-[#D8E3F1] dark:border-[#475569] rounded cursor-pointer"
          >
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="py-8 text-center text-xs text-[#64748B] dark:text-[#BFDBFE]">
              <p>Type keywords to search across candidates, job postings, and accounts.</p>
              <div className="mt-3 flex justify-center gap-2">
                <span
                  onClick={() => setQuery('Rust')}
                  className="px-2.5 py-1 bg-[#FFFFFF] dark:bg-[#475569] text-[#1E293B] dark:text-[#FFFFFF] border border-[#D8E3F1] dark:border-[#475569] rounded-lg text-xs cursor-pointer hover:border-[#2563EB]"
                >
                  Skill: Rust
                </span>
                <span
                  onClick={() => setQuery('Architect')}
                  className="px-2.5 py-1 bg-[#FFFFFF] dark:bg-[#475569] text-[#1E293B] dark:text-[#FFFFFF] border border-[#D8E3F1] dark:border-[#475569] rounded-lg text-xs cursor-pointer hover:border-[#2563EB]"
                >
                  Title: Architect
                </span>
                <span
                  onClick={() => setQuery('CloudScale')}
                  className="px-2.5 py-1 bg-[#FFFFFF] dark:bg-[#475569] text-[#1E293B] dark:text-[#FFFFFF] border border-[#D8E3F1] dark:border-[#475569] rounded-lg text-xs cursor-pointer hover:border-[#2563EB]"
                >
                  Client: CloudScale
                </span>
              </div>
            </div>
          )}

          {/* Candidates */}
          {filteredApplicants.length > 0 && (
            <div>
              <div className="text-[11px] font-mono tracking-wider text-[#64748B] uppercase mb-2">
                Candidates ({filteredApplicants.length})
              </div>
              <div className="space-y-1">
                {filteredApplicants.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => {
                      navigate('applicant-detail', a.id);
                      setGlobalSearch(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFFFFF] dark:hover:bg-[#475569] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img src={a.avatar} alt={a.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-[#2563EB]/30" />
                      <div>
                        <div className="text-xs font-semibold text-[#1E293B] dark:text-white">{a.name}</div>
                        <div className="text-[11px] text-[#64748B] dark:text-[#BFDBFE]">{a.currentDesignation} · {a.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#276749] dark:text-[#8AC9A7] bg-[#8AC9A7]/20 px-2 py-0.5 rounded border border-[#8AC9A7]/40">
                        {a.matchScore}% Match
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#64748B]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Jobs */}
          {filteredJobs.length > 0 && (
            <div>
              <div className="text-[11px] font-mono tracking-wider text-[#64748B] uppercase mb-2">
                Job Postings ({filteredJobs.length})
              </div>
              <div className="space-y-1">
                {filteredJobs.map((j) => (
                  <div
                    key={j.id}
                    onClick={() => {
                      navigate('job-detail', j.id);
                      setGlobalSearch(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFFFFF] dark:hover:bg-[#475569] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="w-4 h-4 text-[#1E293B]" />
                      <div>
                        <div className="text-xs font-semibold text-[#1E293B] dark:text-white">{j.title}</div>
                        <div className="text-[11px] text-[#64748B] dark:text-[#BFDBFE]">{j.client} · {j.location}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#1E293B]">${j.billRate}/hr</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clients */}
          {filteredClients.length > 0 && (
            <div>
              <div className="text-[11px] font-mono tracking-wider text-[#64748B] uppercase mb-2">
                Accounts ({filteredClients.length})
              </div>
              <div className="space-y-1">
                {filteredClients.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      navigate('clients');
                      setGlobalSearch(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFFFFF] dark:hover:bg-[#475569] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-[#1E293B]" />
                      <div className="text-xs font-medium text-[#1E293B] dark:text-white">{c.name}</div>
                    </div>
                    <span className="text-xs text-[#64748B] dark:text-[#BFDBFE]">{c.industry}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query && filteredApplicants.length === 0 && filteredJobs.length === 0 && filteredClients.length === 0 && (
            <div className="py-8 text-center text-xs text-[#64748B]">
              No matching candidates, jobs, or accounts found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
