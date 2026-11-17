export type UserRole = 'super_admin' | 'manager' | 'recruiter';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  businessUnit: string;
  title: string;
  phone?: string;
}

export type JobStatus = 'Open' | 'Active' | 'Sourcing' | 'In Review' | 'Closed' | 'On Hold';
export type JobType = 'Full-Time' | 'Contract' | 'C2H' | 'C2C' | 'Remote' | 'Hybrid' | 'On-Site' | 'Part-Time';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface JobDocument {
  id: string;
  name: string;
  type: string;
  size: number;
}

export interface Job {
  id: string;
  code: string;
  title: string;
  client: string;
  clientId: string;
  businessUnit: string;
  location: string;
  type: JobType;
  status: JobStatus;
  priority: Priority;
  assignedRecruiter: string;
  recruiterId: string;
  createdDate: string;
  openings: number;
  applicantsCount: number;
  billRate: number; // USD/INR per hour or annual
  payRate: number;
  skills: string[];
  experienceRequired: string;
  description: string;
  documents?: JobDocument[];

  // Authentic Ceipal ATS Fields
  clientJobId?: string;
  facility?: string;
  currency?: string;
  rateType?: 'Hourly' | 'Yearly' | 'Monthly' | 'Daily';
  startDate?: string;
  endDate?: string;
  category?: string;
  skillType?: string;
  respondBy?: string;
  remoteJob?: 'Yes' | 'No' | 'Hybrid';
  states?: string;
  duration?: string;
  clientManager?: string;
  turnaroundTime?: number;
  turnaroundUnit?: 'In Days' | 'In Hours';
  address?: string;
  noticePeriod?: string;
  industry?: string;
  degree?: string;
  minExperience?: number;
  maxExperience?: number;
  primarySkills?: string[];
  secondarySkills?: string[];
  maxSubmissions?: number;
  salesManager?: string;
  recruitmentManager?: string;
  accountManager?: string;
  assignedTo?: string;
  comments?: string;
  additionalNotifications?: string;
  careerPortalPublishedDate?: string;
  postJobOnCareerPortal?: boolean;
  secondarySalesManager?: string;
  secondaryRecruitmentManager?: string;
  costCenter?: string;
  departmentCode?: string;
  poNumber?: string;
  notes?: JobNote[];
}

export interface JobNote {
  id: string;
  author: string;
  text: string;
  date: string;
  category?: 'Job Posting' | 'Applicant Reference';
}

export type PipelineStage = 
  | 'New'
  | 'Screening'
  | 'Submitted'
  | 'Interview'
  | 'Selected'
  | 'Offered'
  | 'Hired'
  | 'Rejected';

export interface Applicant {
  id: string;
  applicantId: string;
  name: string;
  email: string;
  phone: string;
  currentDesignation: string;
  location: string;
  experienceYears: number;
  skills: string[];
  source: 'LinkedIn' | 'Direct Career Portal' | 'Referral' | 'Vendor Partner' | 'GitHub';
  status: PipelineStage;
  assignedRecruiter: string;
  assignedJobId?: string;
  assignedJobTitle?: string;
  matchScore: number;
  avatar: string;
  isFavorite?: boolean;
  expectedSalary?: string;
  noticePeriod?: string;
  summary?: string;
  education?: { degree: string; school: string; year: string }[];
  workHistory?: { role: string; company: string; duration: string; summary: string }[];
  documents?: { name: string; size: string; date: string; type: string }[];
  notes?: { id: string; author: string; text: string; date: string }[];
  // Optional recruiter profile fields collected by the frontend applicant form.
  middleName?: string;
  legalName?: string;
  alternateEmail?: string;
  homePhone?: string;
  workPhone?: string;
  dateOfBirth?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  workAuthorization?: string;
  address?: string;
  country?: string;
  state?: string;
  zipCode?: string;
  relevantExperience?: number;
  referredBy?: string;
  applicantGroup?: string;
  currentCompany?: string;
  currentCTC?: string;
  expectedCTC?: string;
  currency?: string;
  passportNumber?: string;
  preferredShift?: string;
  willingToRelocate?: boolean;
  primarySkills?: string[];
  technology?: string;
  industry?: string;
  referenceId?: string;
  applicantRemarks?: string;
  educationDetails?: { degree: string; school: string; year: string }[];
  certifications?: string[];
  languages?: string[];
  employerDetails?: { company: string; title: string; location: string; from: string; to: string; summary: string }[];
  customFields?: Record<string, string>;
  gdprApproved?: boolean;
  createdBy?: string;
  createdOn?: string;
  createdDate?: string;
}

export interface Client {
  id: string;
  clientId: string;
  name: string;
  industry: string;
  location: string;
  accountManager: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  activeJobs: number;
  activePlacements: number;
  status: 'Active' | 'Prospect' | 'Inactive';
  tier: 'Enterprise Platinum' | 'Strategic Partner' | 'Standard';
  joinedDate: string;
  notes?: string;
}

export interface Vendor {
  id: string;
  vendorId: string;
  name: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  complianceStatus: 'Verified' | 'Pending Review' | 'Expired';
  rating: number;
  activeCandidates: number;
  status: 'Active' | 'Under Review' | 'Suspended';
}

export interface Interview {
  id: string;
  applicantId: string;
  applicantName: string;
  jobId: string;
  jobTitle: string;
  client: string;
  interviewer: string;
  date: string;
  time: string;
  type: 'Technical Screen' | 'Architecture Deep-Dive' | 'Hiring Manager' | 'Culture & Exec';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Awaiting Feedback';
  meetingLink: string;
  rating?: number;
  feedback?: string;
}

export interface Submission {
  id: string;
  submissionId: string;
  applicantId: string;
  applicantName: string;
  jobId: string;
  jobTitle: string;
  client: string;
  recruiter: string;
  submittedDate: string;
  billRate: number;
  payRate: number;
  status:
    | 'Submitted to Client'
    | 'Client Review'
    | 'Interview Requested'
    | 'Client Rejected'
    | 'Waiting for Evaluation by Internal Reviewer'
    | 'Internal Disqualified'
    | 'Placed'
    | 'Offered'
    | 'Not Joined'
    | 'Interview Scheduled'
    | (string & {});
  approvalStatus: 'Approved' | 'Pending Approval' | 'Revision Requested' | 'Pending Review' | (string & {});
}

export interface Placement {
  id: string;
  placementId: string;
  applicantName: string;
  jobTitle: string;
  client: string;
  recruiter: string;
  startDate: string;
  endDate: string;
  billRate: number;
  payRate: number;
  margin: number;
  status: 'Active' | 'Completed' | 'Upcoming';
}

export interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  priority: Priority;
  assignedTo: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  category: 'Interview Follow-up' | 'Offer Release' | 'Vendor Verification' | 'Client Review';
}

export interface ActivityLog {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'job' | 'applicant' | 'submission' | 'interview' | 'placement';
}
