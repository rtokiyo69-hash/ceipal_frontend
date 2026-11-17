import { ActivityDetailRecord, ActiveJobRecord } from '../types/dashboardTables';

// Raw recruiter activity log for Notes, Tasks, and Messages
export const RAW_RECRUITER_ACTIVITIES: ActivityDetailRecord[] = [
  // --- Today (2026-11-09) ---
  {
    id: 'act-nm-01',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    type: 'note',
    title: 'Screening feedback completed for distributed systems candidate',
    candidateOrClientName: 'Sophia Chen',
    date: '2026-11-09',
    channelOrPriority: 'Technical Screen'
  },
  {
    id: 'act-nm-02',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    type: 'task',
    title: 'Schedule debrief with Hiring Manager Dr. Arjun Nair',
    candidateOrClientName: 'Sophia Chen',
    date: '2026-11-09',
    channelOrPriority: 'High'
  },
  {
    id: 'act-nm-03',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    type: 'message',
    title: 'Sent interview preparation dossier via secure portal',
    candidateOrClientName: 'Sophia Chen',
    date: '2026-11-09',
    channelOrPriority: 'Email'
  },
  {
    id: 'act-nm-04',
    recruiterId: 'rec-02',
    recruiterName: 'Elena Rostova',
    type: 'note',
    title: 'Candidate submitted code sample for PyTorch tensor compiler',
    candidateOrClientName: 'Dmitri Volkov',
    date: '2026-11-09',
    channelOrPriority: 'Code Review'
  },
  {
    id: 'act-nm-05',
    recruiterId: 'rec-02',
    recruiterName: 'Elena Rostova',
    type: 'message',
    title: 'Follow-up regarding compensation expectations ($260k+)',
    candidateOrClientName: 'Dmitri Volkov',
    date: '2026-11-09',
    channelOrPriority: 'InMail'
  },
  {
    id: 'act-nm-06',
    recruiterId: 'rec-03',
    recruiterName: 'Marcus Vance',
    type: 'task',
    title: 'Verify GCP certifications and security clearance',
    candidateOrClientName: 'Liam Zhao',
    date: '2026-11-09',
    channelOrPriority: 'Medium'
  },

  // --- This Week (2026-11-03 to 2026-11-08) ---
  {
    id: 'act-nm-07',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    type: 'note',
    title: 'Reference check completed with previous VP of Engineering',
    candidateOrClientName: 'Sophia Chen',
    date: '2026-11-07',
    channelOrPriority: 'Reference'
  },
  {
    id: 'act-nm-08',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    type: 'task',
    title: 'Draft formal offer letter with stock option breakdown',
    candidateOrClientName: 'Sophia Chen',
    date: '2026-11-06',
    channelOrPriority: 'Urgent'
  },
  {
    id: 'act-nm-09',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    type: 'message',
    title: 'Client submission confirmation to Snowflake VP',
    candidateOrClientName: 'Snowflake Core Lab',
    date: '2026-11-05',
    channelOrPriority: 'Email'
  },
  {
    id: 'act-nm-10',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    type: 'note',
    title: 'Evaluated portfolio: stellar distributed consensus implementation',
    candidateOrClientName: 'Marcus Thorne',
    date: '2026-11-04',
    channelOrPriority: 'Screening'
  },
  {
    id: 'act-nm-11',
    recruiterId: 'rec-02',
    recruiterName: 'Elena Rostova',
    type: 'task',
    title: 'Confirm panel availability for Triton optimization round',
    candidateOrClientName: 'Dr. Evelyn Reed',
    date: '2026-11-08',
    channelOrPriority: 'High'
  },
  {
    id: 'act-nm-12',
    recruiterId: 'rec-02',
    recruiterName: 'Elena Rostova',
    type: 'note',
    title: 'Candidate requested remote-first setup with Zurich quarterly visits',
    candidateOrClientName: 'Dr. Evelyn Reed',
    date: '2026-11-06',
    channelOrPriority: 'Negotiation'
  },
  {
    id: 'act-nm-13',
    recruiterId: 'rec-02',
    recruiterName: 'Elena Rostova',
    type: 'message',
    title: 'Cold outreach on breakthrough CUDA kernel paper',
    candidateOrClientName: 'Vikram Joshi',
    date: '2026-11-05',
    channelOrPriority: 'InMail'
  },
  {
    id: 'act-nm-14',
    recruiterId: 'rec-02',
    recruiterName: 'Elena Rostova',
    type: 'message',
    title: 'Invitation to Lead AI Architect technical interview',
    candidateOrClientName: 'Dr. Evelyn Reed',
    date: '2026-11-04',
    channelOrPriority: 'Email'
  },
  {
    id: 'act-nm-15',
    recruiterId: 'rec-03',
    recruiterName: 'Marcus Vance',
    type: 'note',
    title: 'Kubernetes multi-cluster architecture assessment rated 5/5',
    candidateOrClientName: 'Liam Zhao',
    date: '2026-11-08',
    channelOrPriority: 'Scorecard'
  },
  {
    id: 'act-nm-16',
    recruiterId: 'rec-03',
    recruiterName: 'Marcus Vance',
    type: 'task',
    title: 'Coordinate executive interview with CTO',
    candidateOrClientName: 'Liam Zhao',
    date: '2026-11-07',
    channelOrPriority: 'High'
  },
  {
    id: 'act-nm-17',
    recruiterId: 'rec-03',
    recruiterName: 'Marcus Vance',
    type: 'message',
    title: 'Sent feedback summary to Cloudflare client partner',
    candidateOrClientName: 'Cloudflare Zero Trust',
    date: '2026-11-04',
    channelOrPriority: 'Portal'
  },
  {
    id: 'act-nm-18',
    recruiterId: 'rec-04',
    recruiterName: 'Kailash Mehta',
    type: 'note',
    title: 'Interactive design prototype reviewed on Apple Vision Pro',
    candidateOrClientName: 'Nadia Solis',
    date: '2026-11-07',
    channelOrPriority: 'Design Review'
  },
  {
    id: 'act-nm-19',
    recruiterId: 'rec-04',
    recruiterName: 'Kailash Mehta',
    type: 'task',
    title: 'Verify references from former Head of Design',
    candidateOrClientName: 'Nadia Solis',
    date: '2026-11-06',
    channelOrPriority: 'Medium'
  },
  {
    id: 'act-nm-20',
    recruiterId: 'rec-04',
    recruiterName: 'Kailash Mehta',
    type: 'message',
    title: 'Confirmed final executive presentation time',
    candidateOrClientName: 'Nadia Solis',
    date: '2026-11-05',
    channelOrPriority: 'Email'
  },
  {
    id: 'act-nm-21',
    recruiterId: 'rec-05',
    recruiterName: 'Priya Sundaram',
    type: 'note',
    title: 'Reviewed consensus engine benchmark reports from candidate',
    candidateOrClientName: 'Marcus Thorne',
    date: '2026-11-08',
    channelOrPriority: 'Screening'
  },
  {
    id: 'act-nm-22',
    recruiterId: 'rec-05',
    recruiterName: 'Priya Sundaram',
    type: 'task',
    title: 'Pipeline 5 more Rust kernel engineers by end of sprint',
    candidateOrClientName: 'Distributed Systems Pool',
    date: '2026-11-07',
    channelOrPriority: 'High'
  },
  {
    id: 'act-nm-23',
    recruiterId: 'rec-05',
    recruiterName: 'Priya Sundaram',
    type: 'message',
    title: 'Customized sourcing campaign for European distributed labs',
    candidateOrClientName: 'Multiple Leads',
    date: '2026-11-04',
    channelOrPriority: 'InMail'
  },
  {
    id: 'act-nm-24',
    recruiterId: 'rec-06',
    recruiterName: 'Liam Sterling',
    type: 'note',
    title: 'Executive search debrief with Board Nominations Committee',
    candidateOrClientName: 'Sarah Jenkins (Promotion)',
    date: '2026-11-06',
    channelOrPriority: 'Executive'
  },
  {
    id: 'act-nm-25',
    recruiterId: 'rec-06',
    recruiterName: 'Liam Sterling',
    type: 'task',
    title: 'Prepare executive equity allocation comparisons',
    candidateOrClientName: 'Executive Candidates',
    date: '2026-11-05',
    channelOrPriority: 'Urgent'
  },
  {
    id: 'act-nm-26',
    recruiterId: 'rec-06',
    recruiterName: 'Liam Sterling',
    type: 'message',
    title: 'Confidential outreach to VP of Engineering at Datadog',
    candidateOrClientName: 'Confidential Candidate',
    date: '2026-11-04',
    channelOrPriority: 'Phone'
  },

  // --- Last Week (2026-10-27 to 2026-11-02) ---
  {
    id: 'act-nm-27',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    type: 'note',
    title: 'Initial intake with hiring manager for Staff Rust position',
    candidateOrClientName: 'Dr. Arjun Nair',
    date: '2026-10-30',
    channelOrPriority: 'Intake'
  },
  {
    id: 'act-nm-28',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    type: 'task',
    title: 'Review 18 inbound applicants for Staff Engineer role',
    candidateOrClientName: 'Applicant Queue',
    date: '2026-10-29',
    channelOrPriority: 'Medium'
  },
  {
    id: 'act-nm-29',
    recruiterId: 'rec-01',
    recruiterName: 'Sarah Jenkins',
    type: 'message',
    title: 'Bulk screening updates sent to candidates',
    candidateOrClientName: 'Applicant Pool',
    date: '2026-10-28',
    channelOrPriority: 'Email'
  },
  {
    id: 'act-nm-30',
    recruiterId: 'rec-02',
    recruiterName: 'Elena Rostova',
    type: 'note',
    title: 'Client requirements updated: must have PyTorch C++ internals',
    candidateOrClientName: 'Anthropic Frontier Lab',
    date: '2026-10-31',
    channelOrPriority: 'Client Spec'
  },
  {
    id: 'act-nm-31',
    recruiterId: 'rec-02',
    recruiterName: 'Elena Rostova',
    type: 'task',
    title: 'Source 12 senior researchers from NeurIPS authors list',
    candidateOrClientName: 'NeurIPS Sourcing',
    date: '2026-10-29',
    channelOrPriority: 'High'
  },
  {
    id: 'act-nm-32',
    recruiterId: 'rec-02',
    recruiterName: 'Elena Rostova',
    type: 'message',
    title: 'Direct outreach to AI Compiler leads',
    candidateOrClientName: 'Frontier AI Leads',
    date: '2026-10-28',
    channelOrPriority: 'InMail'
  },
  {
    id: 'act-nm-33',
    recruiterId: 'rec-03',
    recruiterName: 'Marcus Vance',
    type: 'note',
    title: 'Client bill rate approved at $135/hr for Cloud Architect',
    candidateOrClientName: 'Google Cloud Platform',
    date: '2026-10-30',
    channelOrPriority: 'Rate Approval'
  },
  {
    id: 'act-nm-34',
    recruiterId: 'rec-03',
    recruiterName: 'Marcus Vance',
    type: 'task',
    title: 'Follow up on legal MSA for contract-to-hire terms',
    candidateOrClientName: 'Legal & Procurement',
    date: '2026-10-28',
    channelOrPriority: 'Medium'
  },
  {
    id: 'act-nm-35',
    recruiterId: 'rec-04',
    recruiterName: 'Kailash Mehta',
    type: 'note',
    title: 'Design systems portfolio review completed for 4 candidates',
    candidateOrClientName: 'Design Pool',
    date: '2026-10-29',
    channelOrPriority: 'Review'
  },
  {
    id: 'act-nm-36',
    recruiterId: 'rec-04',
    recruiterName: 'Kailash Mehta',
    type: 'task',
    title: 'Schedule briefing call with VP of Product',
    candidateOrClientName: 'Product Leadership',
    date: '2026-10-27',
    channelOrPriority: 'Low'
  },
  {
    id: 'act-nm-37',
    recruiterId: 'rec-05',
    recruiterName: 'Priya Sundaram',
    type: 'message',
    title: 'Sent 35 targeted InMails to Rust core contributors',
    candidateOrClientName: 'Open Source Rust Community',
    date: '2026-10-30',
    channelOrPriority: 'InMail'
  },
  {
    id: 'act-nm-38',
    recruiterId: 'rec-06',
    recruiterName: 'Liam Sterling',
    type: 'note',
    title: 'Executive compensation benchmarking report completed',
    candidateOrClientName: 'Board Advisory',
    date: '2026-10-28',
    channelOrPriority: 'Executive'
  }
];

// Active Jobs Records (Real-time active recruitment requisitions)
export const RAW_ACTIVE_JOBS: ActiveJobRecord[] = [
  {
    id: 'job-01',
    jobCode: 'REQ-101',
    jobTitle: 'Staff Distributed Systems Engineer',
    department: 'Engineering',
    clientName: 'Snowflake Core Lab',
    clientBillRate: '$125 – $155 / hr',
    salaryBand: '$210,000 – $260,000 / yr',
    state: 'CA · Active',
    stateCode: 'CA',
    status: 'Active',
    openings: 2,
    createdAt: '2026-10-18', // Last month
    primaryRecruiter: 'Sarah Jenkins'
  },
  {
    id: 'job-02',
    jobCode: 'REQ-102',
    jobTitle: 'Lead AI Inference Architect',
    department: 'AI & Research',
    clientName: 'Anthropic Frontier Lab',
    clientBillRate: '$140 – $180 / hr',
    salaryBand: '$230,000 – $285,000 / yr',
    state: 'NY · Interviewing',
    stateCode: 'NY',
    status: 'Interviewing',
    openings: 1,
    createdAt: '2026-10-22', // Last month
    primaryRecruiter: 'Elena Rostova'
  },
  {
    id: 'job-03',
    jobCode: 'REQ-103',
    jobTitle: 'Principal Fluid Interface Designer',
    department: 'Product & Design',
    clientName: 'Vercel UI Systems',
    clientBillRate: '$110 – $145 / hr',
    salaryBand: '$195,000 – $240,000 / yr',
    state: 'CA · Open',
    stateCode: 'CA',
    status: 'Open',
    openings: 1,
    createdAt: '2026-10-12', // Last month
    primaryRecruiter: 'Kailash Mehta'
  },
  {
    id: 'job-04',
    jobCode: 'REQ-104',
    jobTitle: 'Senior Cloud Infrastructure Architect',
    department: 'Infrastructure',
    clientName: 'Cloudflare Zero Trust',
    clientBillRate: '$115 – $140 / hr',
    salaryBand: '$180,000 – $225,000 / yr',
    state: 'WA · Active',
    stateCode: 'WA',
    status: 'Active',
    openings: 3,
    createdAt: '2026-10-08', // Last month
    primaryRecruiter: 'Marcus Vance'
  },
  {
    id: 'job-05',
    jobCode: 'REQ-105',
    jobTitle: 'Director of Talent & Operations',
    department: 'Operations',
    clientName: 'Himalayan Capital Global',
    clientBillRate: '$130 – $160 / hr',
    salaryBand: '$190,000 – $230,000 / yr',
    state: 'TX · Active',
    stateCode: 'TX',
    status: 'Active',
    openings: 1,
    createdAt: '2026-10-28', // Last month
    primaryRecruiter: 'Liam Sterling'
  },
  {
    id: 'job-06',
    jobCode: 'REQ-106',
    jobTitle: 'High-Performance Rust Kernel Engineer',
    department: 'Engineering',
    clientName: 'Databricks Storage Engine',
    clientBillRate: '$120 – $150 / hr',
    salaryBand: '$195,000 – $240,000 / yr',
    state: 'CA · Active',
    stateCode: 'CA',
    status: 'Active',
    openings: 2,
    createdAt: '2026-10-25', // Last month
    primaryRecruiter: 'Priya Sundaram'
  },
  {
    id: 'job-07',
    jobCode: 'REQ-107',
    jobTitle: 'Frontier LLM Alignment Scientist',
    department: 'AI & Research',
    clientName: 'DeepMind Research Hub',
    clientBillRate: '$150 – $195 / hr',
    salaryBand: '$240,000 – $310,000 / yr',
    state: 'MA · Active',
    stateCode: 'MA',
    status: 'Active',
    openings: 1,
    createdAt: '2026-10-15', // Last month
    primaryRecruiter: 'Elena Rostova'
  },
  {
    id: 'job-08',
    jobCode: 'REQ-108',
    jobTitle: 'Site Reliability Engineering Lead',
    department: 'Infrastructure',
    clientName: 'Stripe Payments Platform',
    clientBillRate: '$115 – $145 / hr',
    salaryBand: '$185,000 – $230,000 / yr',
    state: 'WA · Offer Stage',
    stateCode: 'WA',
    status: 'Offer Stage',
    openings: 2,
    createdAt: '2026-10-05', // Last month
    primaryRecruiter: 'Marcus Vance'
  },
  {
    id: 'job-09',
    jobCode: 'REQ-109',
    jobTitle: 'Senior Cryptographic Security Engineer',
    department: 'Engineering',
    clientName: 'Apple Security Architecture',
    clientBillRate: '$135 – $170 / hr',
    salaryBand: '$205,000 – $250,000 / yr',
    state: 'CO · Active',
    stateCode: 'CO',
    status: 'Active',
    openings: 1,
    createdAt: '2026-11-03', // This month
    primaryRecruiter: 'Sarah Jenkins'
  },
  {
    id: 'job-10',
    jobCode: 'REQ-110',
    jobTitle: 'Staff Full-Stack Protocol Architect',
    department: 'Engineering',
    clientName: 'Figma Canvas Systems',
    clientBillRate: '$120 – $155 / hr',
    salaryBand: '$190,000 – $235,000 / yr',
    state: 'NY · Open',
    stateCode: 'NY',
    status: 'Open',
    openings: 2,
    createdAt: '2026-11-05', // This month
    primaryRecruiter: 'Kailash Mehta'
  }
];
