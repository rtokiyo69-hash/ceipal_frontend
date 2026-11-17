export interface Recruiter {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  avatarInitials: string;
  avatarGradient: string;
  status: 'Active' | 'On Leave';
}

export type ActivityType = 'submission' | 'client_submission' | 'interview' | 'hire';

export interface RecruitmentActivity {
  id: string;
  recruiterId: string;
  recruiterName: string;
  candidateId: string;
  candidateName: string;
  requisitionId: string;
  jobTitle: string;
  activityType: ActivityType;
  activityDate: string; // YYYY-MM-DD
  clientName?: string;
  stageNotes?: string;
}

export interface JsipRecruiterRow {
  recruiter: Recruiter;
  submissions: number;
  clientSubmissions: number;
  interviews: number;
  hires: number;
  conversionRate: number; // Hires / Submissions * 100
  activities: RecruitmentActivity[];
}

export interface JsipSummaryTotals {
  totalSubmissions: number;
  totalClientSubmissions: number;
  totalInterviews: number;
  totalHires: number;
  activeRecruitersCount: number;
}

export type DateRangePreset = 
  | 'today'
  | 'this_week'
  | 'month_to_date'
  | 'quarter_to_date'
  | 'year_to_date'
  | 'custom';

export interface DateRangeFilter {
  preset: DateRangePreset;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  label: string;
}

export type ConfirmationType = 'Placement' | 'Interview' | 'Client Review';
export type ConfirmationStatus = 'Verified' | 'Confirmed' | 'Pending';

export interface ConfirmationRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  recruiterId: string;
  recruiterName: string;
  clientName: string;
  type: ConfirmationType;
  date: string;
  rateOrSalary: string;
  status: ConfirmationStatus;
  notes: string;
}

