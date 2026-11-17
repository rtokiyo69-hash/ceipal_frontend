import { Recruiter, RecruitmentActivity } from '../types/jsip';

export const RECRUITERS: Recruiter[] = [
  {
    id: 'rec-01',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@glacier.ats',
    role: 'Lead Technical Recruiter',
    team: 'Core Engineering Pod',
    avatarInitials: 'SJ',
    avatarGradient: 'from-cyan-400 to-teal-500',
    status: 'Active'
  },
  {
    id: 'rec-02',
    name: 'Elena Rostova',
    email: 'elena.rostova@glacier.ats',
    role: 'Senior Technical Recruiter',
    team: 'AI & Research Pod',
    avatarInitials: 'ER',
    avatarGradient: 'from-sky-400 to-blue-500',
    status: 'Active'
  },
  {
    id: 'rec-03',
    name: 'Marcus Vance',
    email: 'marcus.vance@glacier.ats',
    role: 'Senior Technical Recruiter',
    team: 'Platform & Infrastructure Pod',
    avatarInitials: 'MV',
    avatarGradient: 'from-teal-400 to-emerald-500',
    status: 'Active'
  },
  {
    id: 'rec-04',
    name: 'Kailash Mehta',
    email: 'kailash.mehta@glacier.ats',
    role: 'Staff Talent Partner',
    team: 'Product & Design Pod',
    avatarInitials: 'KM',
    avatarGradient: 'from-teal-500 to-cyan-600',
    status: 'Active'
  },
  {
    id: 'rec-05',
    name: 'Priya Sundaram',
    email: 'priya.sundaram@glacier.ats',
    role: 'Senior Technical Sourcer',
    team: 'Distributed Systems Pod',
    avatarInitials: 'PS',
    avatarGradient: 'from-cyan-500 to-sky-600',
    status: 'Active'
  },
  {
    id: 'rec-06',
    name: 'Liam Sterling',
    email: 'liam.sterling@glacier.ats',
    role: 'Executive Talent Partner',
    team: 'Leadership & Executive Search',
    avatarInitials: 'LS',
    avatarGradient: 'from-blue-400 to-indigo-500',
    status: 'Active'
  }
];

// Actual recruitment activity log spanning Month-to-date (Nov 2026), Q4, and prior dates
export const RAW_RECRUITMENT_ACTIVITIES: RecruitmentActivity[] = [
  // Sarah Jenkins Activities (MTD: Nov 1 - Nov 9, 2026)
  {
    id: 'act-101',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    candidateId: 'cand-01',
    candidateName: 'Sophia Chen',
    requisitionId: 'req-01',
    jobTitle: 'Staff Distributed Systems Engineer',
    activityType: 'submission',
    activityDate: '2026-11-01',
    clientName: 'Snowflake Core Lab',
    stageNotes: 'Initial portfolio submission'
  },
  {
    id: 'act-102',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    candidateId: 'cand-01',
    candidateName: 'Sophia Chen',
    requisitionId: 'req-01',
    jobTitle: 'Staff Distributed Systems Engineer',
    activityType: 'client_submission',
    activityDate: '2026-11-02',
    clientName: 'Distributed Systems VP Office'
  },
  {
    id: 'act-103',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    candidateId: 'cand-01',
    candidateName: 'Sophia Chen',
    requisitionId: 'req-01',
    jobTitle: 'Staff Distributed Systems Engineer',
    activityType: 'interview',
    activityDate: '2026-11-04',
    clientName: 'Distributed Systems VP Office',
    stageNotes: 'System Design deep-dive with Dr. Arjun'
  },
  {
    id: 'act-104',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    candidateId: 'cand-01',
    candidateName: 'Sophia Chen',
    requisitionId: 'req-01',
    jobTitle: 'Staff Distributed Systems Engineer',
    activityType: 'interview',
    activityDate: '2026-11-08',
    clientName: 'Distributed Systems VP Office',
    stageNotes: 'Final executive offer alignment interview'
  },
  {
    id: 'act-105',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    candidateId: 'cand-08',
    candidateName: 'Zane Gallagher',
    requisitionId: 'req-01',
    jobTitle: 'Staff Distributed Systems Engineer',
    activityType: 'hire',
    activityDate: '2026-11-02',
    clientName: 'AWS DynamoDB Team',
    stageNotes: 'Contract signed, joining Nov 16'
  },
  {
    id: 'act-106',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    candidateId: 'cand-12',
    candidateName: 'Alexandre Dubois',
    requisitionId: 'req-01',
    jobTitle: 'Staff Distributed Systems Engineer',
    activityType: 'submission',
    activityDate: '2026-11-05',
    clientName: 'Datadog EMEA'
  },
  {
    id: 'act-107',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    candidateId: 'cand-12',
    candidateName: 'Alexandre Dubois',
    requisitionId: 'req-01',
    jobTitle: 'Staff Distributed Systems Engineer',
    activityType: 'client_submission',
    activityDate: '2026-11-06',
    clientName: 'Distributed Systems VP Office'
  },
  {
    id: 'act-108',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    candidateId: 'cand-14',
    candidateName: 'Nadia Petrova',
    requisitionId: 'req-01',
    jobTitle: 'Staff Distributed Systems Engineer',
    activityType: 'submission',
    activityDate: '2026-11-07',
    clientName: 'JetBrains Core'
  },

  // Elena Rostova Activities (AI & Research Pod)
  {
    id: 'act-201',
    recruiterId: 'rec-02',
    recruiterName: 'Elena Rostova',
    candidateId: 'cand-02',
    candidateName: 'Tenzing Norbu',
    requisitionId: 'req-02',
    jobTitle: 'Lead AI Inference Architect',
    activityType: 'submission',
    activityDate: '2026-11-02',
    clientName: 'DeepMind Research'
  },
  {
    id: 'act-202',
    recruiterId: 'rec-02',
    recruiterName: 'Elena Rostova',
    candidateId: 'cand-02',
    candidateName: 'Tenzing Norbu',
    requisitionId: 'req-02',
    jobTitle: 'Lead AI Inference Architect',
    activityType: 'client_submission',
    activityDate: '2026-11-03',
    clientName: 'Frontier AI Research Unit'
  },
  {
    id: 'act-203',
    recruiterId: 'rec-02',
    recruiterName: 'Elena Rostova',
    candidateId: 'cand-02',
    candidateName: 'Tenzing Norbu',
    requisitionId: 'req-02',
    jobTitle: 'Lead AI Inference Architect',
    activityType: 'interview',
    activityDate: '2026-11-06',
    clientName: 'Frontier AI Research Unit',
    stageNotes: 'Triton Kernel live execution interview'
  },
  {
    id: 'act-204',
    recruiterId: 'rec-02',
    recruiterName: 'Elena Rostova',
    candidateId: 'cand-15',
    candidateName: 'Dr. Lucas Zhao',
    requisitionId: 'req-02',
    jobTitle: 'Lead AI Inference Architect',
    activityType: 'submission',
    activityDate: '2026-11-03',
    clientName: 'NVIDIA TensorRT'
  },
  {
    id: 'act-205',
    recruiterId: 'rec-02',
    recruiterName: 'Elena Rostova',
    candidateId: 'cand-15',
    candidateName: 'Dr. Lucas Zhao',
    requisitionId: 'req-02',
    jobTitle: 'Lead AI Inference Architect',
    activityType: 'client_submission',
    activityDate: '2026-11-04',
    clientName: 'Frontier AI Research Unit'
  },
  {
    id: 'act-206',
    recruiterId: 'rec-02',
    recruiterName: 'Elena Rostova',
    candidateId: 'cand-15',
    candidateName: 'Dr. Lucas Zhao',
    requisitionId: 'req-02',
    jobTitle: 'Lead AI Inference Architect',
    activityType: 'interview',
    activityDate: '2026-11-07',
    clientName: 'Frontier AI Research Unit',
    stageNotes: 'Architecture Board Review'
  },
  {
    id: 'act-207',
    recruiterId: 'rec-02',
    recruiterName: 'Elena Rostova',
    candidateId: 'cand-15',
    candidateName: 'Dr. Lucas Zhao',
    requisitionId: 'req-02',
    jobTitle: 'Lead AI Inference Architect',
    activityType: 'hire',
    activityDate: '2026-11-08',
    clientName: 'Frontier AI Research Unit',
    stageNotes: 'Offer accepted'
  },
  {
    id: 'act-208',
    recruiterId: 'rec-02',
    recruiterName: 'Elena Rostova',
    candidateId: 'cand-16',
    candidateName: 'Aria Varma',
    requisitionId: 'req-02',
    jobTitle: 'Lead AI Inference Architect',
    activityType: 'submission',
    activityDate: '2026-11-08',
    clientName: 'Meta FAIR'
  },

  // Marcus Vance Activities (Platform & Infra Pod)
  {
    id: 'act-301',
    recruiterId: 'rec-03',
    recruiterName: 'Marcus Vance',
    candidateId: 'cand-04',
    candidateName: 'Liam O’Connor',
    requisitionId: 'req-04',
    jobTitle: 'Senior Cloud Infrastructure Architect',
    activityType: 'submission',
    activityDate: '2026-11-01',
    clientName: 'Stripe Mesh'
  },
  {
    id: 'act-302',
    recruiterId: 'rec-03',
    recruiterName: 'Marcus Vance',
    candidateId: 'cand-04',
    candidateName: 'Liam O’Connor',
    requisitionId: 'req-04',
    jobTitle: 'Senior Cloud Infrastructure Architect',
    activityType: 'client_submission',
    activityDate: '2026-11-02',
    clientName: 'Infrastructure Leadership Group'
  },
  {
    id: 'act-303',
    recruiterId: 'rec-03',
    recruiterName: 'Marcus Vance',
    candidateId: 'cand-04',
    candidateName: 'Liam O’Connor',
    requisitionId: 'req-04',
    jobTitle: 'Senior Cloud Infrastructure Architect',
    activityType: 'interview',
    activityDate: '2026-11-05',
    clientName: 'Infrastructure Leadership Group',
    stageNotes: 'eBPF routing & Kubernetes live session'
  },
  {
    id: 'act-304',
    recruiterId: 'rec-03',
    recruiterName: 'Marcus Vance',
    candidateId: 'cand-18',
    candidateName: 'Henrik Larsson',
    requisitionId: 'req-04',
    jobTitle: 'Senior Cloud Infrastructure Architect',
    activityType: 'submission',
    activityDate: '2026-11-04',
    clientName: 'Spotify Infrastructure'
  },
  {
    id: 'act-305',
    recruiterId: 'rec-03',
    recruiterName: 'Marcus Vance',
    candidateId: 'cand-18',
    candidateName: 'Henrik Larsson',
    requisitionId: 'req-04',
    jobTitle: 'Senior Cloud Infrastructure Architect',
    activityType: 'client_submission',
    activityDate: '2026-11-06',
    clientName: 'Infrastructure Leadership Group'
  },

  // Kailash Mehta Activities (Product & Design Pod)
  {
    id: 'act-401',
    recruiterId: 'rec-04',
    recruiterName: 'Kailash Mehta',
    candidateId: 'cand-03',
    candidateName: 'Mirei Takahashi',
    requisitionId: 'req-03',
    jobTitle: 'Principal Fluid Interface Designer',
    activityType: 'submission',
    activityDate: '2026-11-01',
    clientName: 'Figma Community Studio'
  },
  {
    id: 'act-402',
    recruiterId: 'rec-04',
    recruiterName: 'Kailash Mehta',
    candidateId: 'cand-03',
    candidateName: 'Mirei Takahashi',
    requisitionId: 'req-03',
    jobTitle: 'Principal Fluid Interface Designer',
    activityType: 'client_submission',
    activityDate: '2026-11-03',
    clientName: 'Design Executive Committee'
  },
  {
    id: 'act-403',
    recruiterId: 'rec-04',
    recruiterName: 'Kailash Mehta',
    candidateId: 'cand-03',
    candidateName: 'Mirei Takahashi',
    requisitionId: 'req-03',
    jobTitle: 'Principal Fluid Interface Designer',
    activityType: 'interview',
    activityDate: '2026-11-08',
    clientName: 'Design Executive Committee',
    stageNotes: 'Kinetic design critique'
  },
  {
    id: 'act-404',
    recruiterId: 'rec-04',
    recruiterName: 'Kailash Mehta',
    candidateId: 'cand-19',
    candidateName: 'Julian Croft',
    requisitionId: 'req-03',
    jobTitle: 'Principal Fluid Interface Designer',
    activityType: 'submission',
    activityDate: '2026-11-04',
    clientName: 'Linear Design'
  },

  // Priya Sundaram Activities (Distributed Systems Pod)
  {
    id: 'act-501',
    recruiterId: 'rec-05',
    recruiterName: 'Priya Sundaram',
    candidateId: 'cand-06',
    candidateName: 'Kavita Sharma',
    requisitionId: 'req-01',
    jobTitle: 'Staff Distributed Systems Engineer',
    activityType: 'submission',
    activityDate: '2026-11-06',
    clientName: 'Cockroach Labs Committer'
  },
  {
    id: 'act-502',
    recruiterId: 'rec-05',
    recruiterName: 'Priya Sundaram',
    candidateId: 'cand-06',
    candidateName: 'Kavita Sharma',
    requisitionId: 'req-01',
    jobTitle: 'Staff Distributed Systems Engineer',
    activityType: 'client_submission',
    activityDate: '2026-11-07',
    clientName: 'Distributed Systems VP Office'
  },
  {
    id: 'act-503',
    recruiterId: 'rec-05',
    recruiterName: 'Priya Sundaram',
    candidateId: 'cand-21',
    candidateName: 'Vikram Joshi',
    requisitionId: 'req-01',
    jobTitle: 'Staff Distributed Systems Engineer',
    activityType: 'submission',
    activityDate: '2026-11-03',
    clientName: 'Cisco Cloud'
  },

  // Liam Sterling Activities (Leadership & Executive Search)
  {
    id: 'act-601',
    recruiterId: 'rec-06',
    recruiterName: 'Liam Sterling',
    candidateId: 'cand-05',
    candidateName: 'Amina Al-Mansoor',
    requisitionId: 'req-05',
    jobTitle: 'Director of Talent & Operations',
    activityType: 'submission',
    activityDate: '2026-11-02',
    clientName: 'Careem / Tech Global'
  },
  {
    id: 'act-602',
    recruiterId: 'rec-06',
    recruiterName: 'Liam Sterling',
    candidateId: 'cand-05',
    candidateName: 'Amina Al-Mansoor',
    requisitionId: 'req-05',
    jobTitle: 'Director of Talent & Operations',
    activityType: 'client_submission',
    activityDate: '2026-11-03',
    clientName: 'Board Executive Committee'
  },
  {
    id: 'act-603',
    recruiterId: 'rec-06',
    recruiterName: 'Liam Sterling',
    candidateId: 'cand-05',
    candidateName: 'Amina Al-Mansoor',
    requisitionId: 'req-05',
    jobTitle: 'Director of Talent & Operations',
    activityType: 'interview',
    activityDate: '2026-11-07',
    clientName: 'Board Executive Committee',
    stageNotes: 'Executive panel review'
  },
  {
    id: 'act-604',
    recruiterId: 'rec-06',
    recruiterName: 'Liam Sterling',
    candidateId: 'cand-22',
    candidateName: 'Jonathan Meyer',
    requisitionId: 'req-05',
    jobTitle: 'Director of Talent & Operations',
    activityType: 'submission',
    activityDate: '2026-11-05',
    clientName: 'Uber EMEA'
  },

  // Older activities for previous periods (e.g. October 2026, Q3) to allow comparison across date filters
  {
    id: 'act-prior-01',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    candidateId: 'cand-prior-1',
    candidateName: 'Felix Braun',
    requisitionId: 'req-01',
    jobTitle: 'Staff Distributed Systems Engineer',
    activityType: 'submission',
    activityDate: '2026-10-14',
    clientName: 'SAP Research'
  },
  {
    id: 'act-prior-02',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    candidateId: 'cand-prior-1',
    candidateName: 'Felix Braun',
    requisitionId: 'req-01',
    jobTitle: 'Staff Distributed Systems Engineer',
    activityType: 'client_submission',
    activityDate: '2026-10-16',
    clientName: 'Distributed Systems VP Office'
  },
  {
    id: 'act-prior-03',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    candidateId: 'cand-prior-1',
    candidateName: 'Felix Braun',
    requisitionId: 'req-01',
    jobTitle: 'Staff Distributed Systems Engineer',
    activityType: 'hire',
    activityDate: '2026-10-28',
    clientName: 'Distributed Systems VP Office'
  },
  {
    id: 'act-prior-04',
    recruiterId: 'rec-02',
    recruiterName: 'Elena Rostova',
    candidateId: 'cand-prior-2',
    candidateName: 'Claire Renaud',
    requisitionId: 'req-02',
    jobTitle: 'Lead AI Inference Architect',
    activityType: 'submission',
    activityDate: '2026-10-12',
    clientName: 'Mistral AI'
  },
  {
    id: 'act-prior-05',
    recruiterId: 'rec-02',
    recruiterName: 'Elena Rostova',
    candidateId: 'cand-prior-2',
    candidateName: 'Claire Renaud',
    requisitionId: 'req-02',
    jobTitle: 'Lead AI Inference Architect',
    activityType: 'interview',
    activityDate: '2026-10-20',
    clientName: 'Frontier AI Research Unit'
  }
];

// Helper to calculate date range boundary strings
export function getDateRangeBounds(preset: string): { startDate: string; endDate: string; label: string } {
  const now = new Date('2026-11-09T00:00:00Z');
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const format = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  
  const endDate = format(now);

  switch (preset) {
    case 'today':
      return {
        startDate: endDate,
        endDate: endDate,
        label: 'Today (Nov 09, 2026)'
      };
    case 'this_week': {
      // Monday of current week
      const day = now.getUTCDay();
      const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now);
      monday.setUTCDate(diff);
      return {
        startDate: format(monday),
        endDate: endDate,
        label: 'This Week (Nov 02 – Nov 09, 2026)'
      };
    }
    case 'month_to_date': {
      const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      return {
        startDate: format(startOfMonth),
        endDate: endDate,
        label: 'Month to Till Date (Nov 01 – Nov 09, 2026)'
      };
    }
    case 'quarter_to_date': {
      // Q4 starts Oct 1
      const startOfQuarter = new Date(Date.UTC(now.getUTCFullYear(), 9, 1));
      return {
        startDate: format(startOfQuarter),
        endDate: endDate,
        label: 'Quarter to Date (Oct 01 – Nov 09, 2026)'
      };
    }
    case 'year_to_date': {
      const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      return {
        startDate: format(startOfYear),
        endDate: endDate,
        label: 'Year to Date (Jan 01 – Nov 09, 2026)'
      };
    }
    default:
      return {
        startDate: '2026-11-01',
        endDate: endDate,
        label: 'Month to Till Date (Default)'
      };
  }
}

export const INITIAL_CONFIRMATIONS: import('../types/jsip').ConfirmationRecord[] = [
  {
    id: 'conf-01',
    candidateId: 'cand-08',
    candidateName: 'Zane Gallagher',
    jobTitle: 'Staff Distributed Systems Engineer',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    clientName: 'AWS DynamoDB Team',
    type: 'Placement',
    date: '2026-11-02',
    rateOrSalary: '$245,000 / yr',
    status: 'Verified',
    notes: 'Contract executed. Onboarding scheduled for Nov 16.'
  },
  {
    id: 'conf-02',
    candidateId: 'cand-15',
    candidateName: 'Dr. Lucas Zhao',
    jobTitle: 'Lead AI Inference Architect',
    recruiterId: 'rec-02',
    recruiterName: 'Elena Rostova',
    clientName: 'Frontier AI Research Unit',
    type: 'Placement',
    date: '2026-11-08',
    rateOrSalary: '$280,000 / yr',
    status: 'Verified',
    notes: 'Offer package accepted with signing grant.'
  },
  {
    id: 'conf-03',
    candidateId: 'cand-01',
    candidateName: 'Sophia Chen',
    jobTitle: 'Staff Distributed Systems Engineer',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    clientName: 'Distributed Systems VP Office',
    type: 'Interview',
    date: '2026-11-09',
    rateOrSalary: '$245,000 / yr',
    status: 'Confirmed',
    notes: 'Executive round confirmed with Dr. Arjun Nair.'
  },
  {
    id: 'conf-04',
    candidateId: 'cand-02',
    candidateName: 'Tenzing Norbu',
    jobTitle: 'Lead AI Inference Architect',
    recruiterId: 'rec-02',
    recruiterName: 'Elena Rostova',
    clientName: 'Frontier AI Research Unit',
    type: 'Interview',
    date: '2026-11-10',
    rateOrSalary: '$275,000 / yr',
    status: 'Confirmed',
    notes: 'Live GPU hardware pairing interview confirmed.'
  },
  {
    id: 'conf-05',
    candidateId: 'cand-04',
    candidateName: 'Liam O’Connor',
    jobTitle: 'Senior Cloud Infrastructure Architect',
    recruiterId: 'rec-03',
    recruiterName: 'Marcus Vance',
    clientName: 'Infrastructure Leadership Group',
    type: 'Client Review',
    date: '2026-11-06',
    rateOrSalary: '$220,000 / yr',
    status: 'Verified',
    notes: 'Hiring committee verified candidate dossier.'
  },
  {
    id: 'conf-06',
    candidateId: 'cand-03',
    candidateName: 'Mirei Takahashi',
    jobTitle: 'Principal Fluid Interface Designer',
    recruiterId: 'rec-04',
    recruiterName: 'Kailash Mehta',
    clientName: 'Design Executive Committee',
    type: 'Interview',
    date: '2026-11-08',
    rateOrSalary: '$235,000 / yr',
    status: 'Confirmed',
    notes: 'Interactive design presentation confirmed.'
  },
  {
    id: 'conf-07',
    candidateId: 'cand-06',
    candidateName: 'Kavita Sharma',
    jobTitle: 'Staff Distributed Systems Engineer',
    recruiterId: 'rec-05',
    recruiterName: 'Priya Sundaram',
    clientName: 'Distributed Systems VP Office',
    type: 'Client Review',
    date: '2026-11-07',
    rateOrSalary: '$225,000 / yr',
    status: 'Confirmed',
    notes: 'Client reviewed and scheduled initial calibration.'
  },
  {
    id: 'conf-08',
    candidateId: 'cand-05',
    candidateName: 'Amina Al-Mansoor',
    jobTitle: 'Director of Talent & Operations',
    recruiterId: 'rec-06',
    recruiterName: 'Liam Sterling',
    clientName: 'Board Executive Committee',
    type: 'Interview',
    date: '2026-11-07',
    rateOrSalary: '$220,000 / yr',
    status: 'Pending',
    notes: 'Panel interview pending client calendar sync.'
  }
];

