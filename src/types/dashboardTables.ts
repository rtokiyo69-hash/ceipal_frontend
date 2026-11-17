export interface RecruiterActivityCount {
  recruiterId: string;
  recruiterName: string;
  role: string;
  team: string;
  avatarInitials: string;
  avatarGradient: string;
  notesCount: number;
  tasksCount: number;
  messagesCount: number;
}

export interface ActivityDetailRecord {
  id: string;
  recruiterId: string;
  recruiterName: string;
  type: 'note' | 'task' | 'message';
  title: string;
  candidateOrClientName: string;
  date: string; // YYYY-MM-DD
  channelOrPriority?: string; // e.g. 'Email', 'InMail', 'High', 'Medium', 'Screening'
}

export type NotesTasksDateFilter = 
  | 'today'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'all_time';

export interface ActiveJobRecord {
  id: string;
  jobCode: string;
  jobTitle: string;
  department: string;
  clientName: string;
  clientBillRate: string; // e.g. '$115 – $145 / hr' or '$220K – $260K / yr'
  salaryBand: string;
  state: string; // e.g. 'CA · Active', 'NY · Interviewing', 'WA · Open'
  stateCode: string; // e.g. 'CA', 'NY', 'WA', 'TX'
  status: 'Active' | 'Interviewing' | 'Open' | 'Offer Stage';
  openings: number;
  createdAt: string; // YYYY-MM-DD
  primaryRecruiter: string;
}

export type ActiveJobsDateFilter = 
  | 'last_month'
  | 'this_month'
  | 'this_quarter'
  | 'all_active';
