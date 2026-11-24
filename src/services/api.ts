import {
  User,
  Job,
  Applicant,
  Client,
  Vendor,
  Interview,
  Submission,
  Placement,
  TaskItem,
  ActivityLog,
  PipelineStage,
  JobDocument,
  JobNote
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_JOBS,
  INITIAL_APPLICANTS,
  INITIAL_VENDORS,
  INITIAL_INTERVIEWS,
  INITIAL_SUBMISSIONS,
  INITIAL_PLACEMENTS,
  INITIAL_TASKS,
  INITIAL_ACTIVITIES
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'talentember_users',
  CLIENTS: 'talentember_clients',
  JOBS: 'talentember_jobs',
  APPLICANTS: 'talentember_applicants',
  VENDORS: 'talentember_vendors',
  INTERVIEWS: 'talentember_interviews',
  SUBMISSIONS: 'talentember_submissions',
  PLACEMENTS: 'talentember_placements',
  TASKS: 'talentember_tasks',
  ACTIVITIES: 'talentember_activities',
  CURRENT_USER: 'talentember_current_user'
};

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (key === STORAGE_KEYS.SUBMISSIONS && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ats:submissions-changed', { detail: value }));
    }
  } catch (e) {
    console.error('Storage error:', e);
  }
}

// Simulates network delay (100-250ms)
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

function openJobDocumentDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('talentember-job-documents', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('documents', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Unable to open job document storage.'));
  });
}

function saveJobDocuments(files: File[]): Promise<JobDocument[]> {
  if (files.length === 0) return Promise.resolve([]);

  return openJobDocumentDatabase().then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction('documents', 'readwrite');
    const documents = files.map((file) => ({
      id: `jobdoc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      file
    }));

    documents.forEach((document) => transaction.objectStore('documents').put(document));
    transaction.oncomplete = () => {
      database.close();
      resolve(documents.map(({ file: _file, ...document }) => document));
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error('Unable to save job documents.'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error || new Error('Job document storage was interrupted.'));
    };
  }));
}

function openApplicantDocumentDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('talentember-applicant-documents', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('documents', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Unable to open applicant document storage.'));
  });
}

function saveApplicantDocuments(
  applicantId: string,
  files: File[]
): Promise<NonNullable<Applicant['documents']>> {
  if (files.length === 0) return Promise.resolve([]);

  return openApplicantDocumentDatabase().then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction('documents', 'readwrite');
    const documents = files.map((file) => {
      const fileId = `appdoc-${applicantId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const sizeInKilobytes = file.size / 1024;
      const extension = file.name.includes('.') ? file.name.split('.').pop() : '';
      return {
        id: fileId,
        applicantId,
        file,
        metadata: {
          fileId,
          name: file.name,
          size: sizeInKilobytes < 1024
            ? `${Math.max(1, Math.round(sizeInKilobytes))} KB`
            : `${(sizeInKilobytes / 1024).toFixed(1)} MB`,
          date: new Date().toLocaleDateString(),
          type: /resume|cv/i.test(file.name)
            ? 'Resume'
            : file.type || (extension ? `${extension.toUpperCase()} file` : 'Applicant Document')
        }
      };
    });

    documents.forEach((document) => transaction.objectStore('documents').put(document));
    transaction.oncomplete = () => {
      database.close();
      resolve(documents.map(({ metadata }) => metadata));
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error('Unable to save applicant documents.'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error || new Error('Applicant document storage was interrupted.'));
    };
  }));
}

export const ApiService = {
  // Authentication & Users
  async getCurrentUser(): Promise<User> {
    await delay(50);
    return getStorage<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[2]); // Default to Priya Sharma (Recruiter)
  },

  async setCurrentUser(user: User): Promise<void> {
    await delay(80);
    setStorage(STORAGE_KEYS.CURRENT_USER, user);
  },

  async getAllUsers(): Promise<User[]> {
    await delay(120);
    return getStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  // Jobs
  async getJobs(): Promise<Job[]> {
    await delay(150);
    const jobs = getStorage<Job[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    const demoDocumentIds = new Set(['jobdoc-1', 'jobdoc-2']);
    let removedMissingDemoDocuments = false;
    const migratedJobs = jobs.map((job) => {
      if (job.id !== 'job-12262' || !job.documents?.some((document) => demoDocumentIds.has(document.id))) {
        return job;
      }
      removedMissingDemoDocuments = true;
      return {
        ...job,
        documents: job.documents.filter((document) => !demoDocumentIds.has(document.id))
      };
    });
    if (removedMissingDemoDocuments) setStorage(STORAGE_KEYS.JOBS, migratedJobs);
    return migratedJobs;
  },

  async getJobById(id: string): Promise<Job | undefined> {
    await delay(100);
    const jobs = await this.getJobs();
    return jobs.find((j) => j.id === id);
  },

  async createJob(
    jobData: Omit<Job, 'id' | 'code' | 'createdDate' | 'applicantsCount' | 'documents'>,
    documentFiles: File[] = []
  ): Promise<Job> {
    await delay(200);
    const jobs = await this.getJobs();
    const documents = await saveJobDocuments(documentFiles);
    const newJob: Job = {
      ...jobData,
      id: `job-${Date.now()}`,
      code: `JOB-2026-0${jobs.length + 86}`,
      createdDate: new Date().toISOString().split('T')[0],
      applicantsCount: 0,
      documents
    };
    const updated = [newJob, ...jobs];
    setStorage(STORAGE_KEYS.JOBS, updated);

    await this.logActivity({
      user: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
      action: 'created new requisition:',
      target: newJob.title,
      type: 'job'
    });

    return newJob;
  },

  async getJobDocument(id: string): Promise<Blob | undefined> {
    const database = await openJobDocumentDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('documents', 'readonly');
      const request = transaction.objectStore('documents').get(id);
      request.onsuccess = () => {
        database.close();
        resolve(request.result?.file as Blob | undefined);
      };
      request.onerror = () => {
        database.close();
        reject(request.error || new Error('Unable to retrieve job document.'));
      };
    });
  },

  async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    await delay(180);
    const jobs = await this.getJobs();
    const index = jobs.findIndex((j) => j.id === id);
    if (index === -1) throw new Error('Job not found');
    const updated = { ...jobs[index], ...updates };
    jobs[index] = updated;
    setStorage(STORAGE_KEYS.JOBS, jobs);
    return updated;
  },

  async deleteJob(id: string): Promise<void> {
    await delay(150);
    const jobs = await this.getJobs();
    setStorage(STORAGE_KEYS.JOBS, jobs.filter((j) => j.id !== id));
  },

  // Applicants
  async getApplicants(): Promise<Applicant[]> {
    await delay(150);
    const rawStored = getStorage<unknown>(STORAGE_KEYS.APPLICANTS, INITIAL_APPLICANTS);
    // Profiles can be incomplete (for example, created before all form fields were
    // added). Normalize them before the roster filters read strings and arrays.
    const stored: Applicant[] = (Array.isArray(rawStored) ? rawStored : INITIAL_APPLICANTS)
      .filter((candidate): candidate is Record<string, unknown> => Boolean(candidate) && typeof candidate === 'object' && !Array.isArray(candidate))
      .map((candidate, index) => {
        const skills = Array.isArray(candidate.skills)
          ? candidate.skills.map(String).filter(Boolean)
          : typeof candidate.skills === 'string'
            ? candidate.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
            : [];
        const customFields = candidate.customFields && typeof candidate.customFields === 'object' && !Array.isArray(candidate.customFields)
          ? candidate.customFields as Record<string, string>
          : {};

        return {
          ...candidate,
          id: String(candidate.id || candidate.applicantId || `applicant-${index + 1}`),
          applicantId: String(candidate.applicantId || candidate.id || ''),
          name: String(candidate.name || 'Unnamed Candidate'),
          email: String(candidate.email || ''),
          phone: String(candidate.phone || ''),
          currentDesignation: String(candidate.currentDesignation || ''),
          location: String(candidate.location || ''),
          experienceYears: Number.isFinite(Number(candidate.experienceYears)) ? Number(candidate.experienceYears) : 0,
          skills,
          source: (candidate.source || 'Direct Career Portal') as Applicant['source'],
          status: (candidate.status || 'New') as Applicant['status'],
          assignedRecruiter: String(candidate.assignedRecruiter || ''),
          matchScore: Number.isFinite(Number(candidate.matchScore)) ? Number(candidate.matchScore) : 0,
          avatar: String(candidate.avatar || ''),
          state: String(candidate.state || ''),
          workAuthorization: String(candidate.workAuthorization || ''),
          customFields,
          notes: Array.isArray(candidate.notes) ? candidate.notes : [],
          workHistory: Array.isArray(candidate.workHistory) ? candidate.workHistory : [],
          education: Array.isArray(candidate.education) ? candidate.education : [],
        } as Applicant;
      });
    // Ensure initial applicants like Test Dummy, DURAI KANDASAMY are present if storage predated them
    const existingIds = new Set(stored.map((a) => a.applicantId || a.id));
    let modified = !Array.isArray(rawStored) || rawStored.length !== stored.length;
    for (const initApp of INITIAL_APPLICANTS) {
      if (!existingIds.has(initApp.applicantId) && !existingIds.has(initApp.id)) {
        stored.push(initApp);
        existingIds.add(initApp.applicantId);
        existingIds.add(initApp.id);
        modified = true;
      }
    }
    if (modified) {
      setStorage(STORAGE_KEYS.APPLICANTS, stored);
    }
    return stored;
  },

  async getApplicantById(id: string): Promise<Applicant | undefined> {
    await delay(100);
    const applicants = await this.getApplicants();
    return applicants.find((a) => a.id === id || a.applicantId === id);
  },

  async createApplicant(applicantData: Partial<Applicant>): Promise<Applicant> {
    await delay(220);
    const applicants = await this.getApplicants();
    const newApplicant: Applicant = {
      ...applicantData,
      id: `app-${Date.now()}`,
      applicantId: `APP-90${applicants.length + 28}`,
      name: applicantData.name || 'New Candidate',
      email: applicantData.email || '',
      phone: applicantData.phone || '+1 (555) 000-0000',
      currentDesignation: applicantData.currentDesignation || 'Software Specialist',
      location: applicantData.location || 'Remote',
      experienceYears: applicantData.experienceYears || 5,
      skills: applicantData.skills || ['TypeScript', 'Cloud'],
      source: applicantData.source || 'Direct Career Portal',
      status: (applicantData.status as PipelineStage) || 'New',
      assignedRecruiter: applicantData.assignedRecruiter || 'Priya Sharma',
      createdBy: applicantData.createdBy || applicantData.assignedRecruiter || 'Priya Sharma',
      createdOn: applicantData.createdOn || new Date().toLocaleString(),
      createdDate: applicantData.createdDate || new Date().toISOString().slice(0, 10),
      assignedJobId: applicantData.assignedJobId,
      assignedJobTitle: applicantData.assignedJobTitle,
      matchScore: applicantData.matchScore || Math.floor(Math.random() * 20 + 80),
      avatar: applicantData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      isFavorite: false,
      summary: applicantData.summary || 'Profile parsed and imported into the ATS repository.',
      documents: applicantData.documents || [
        { name: `${(applicantData.name || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`, size: '1.2 MB', date: new Date().toISOString().split('T')[0], type: 'Resume' }
      ],
      notes: [
        { id: `nt-${Date.now()}`, author: 'ATS AI Parser', text: 'Resume extracted with high confidence. Key skills matched to active open requisitions.', date: 'Just now' }
      ]
    };

    const updated = [newApplicant, ...applicants];
    setStorage(STORAGE_KEYS.APPLICANTS, updated);

    await this.logActivity({
      user: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
      action: 'onboarded candidate:',
      target: newApplicant.name,
      type: 'applicant'
    });

    return newApplicant;
  },

  async updateApplicant(id: string, updates: Partial<Applicant>): Promise<Applicant> {
    await delay(150);
    const applicants = await this.getApplicants();
    const index = applicants.findIndex((a) => a.id === id || a.applicantId === id);
    if (index === -1) {
      const fallback: Applicant = {
        id,
        applicantId: id,
        name: updates.name || 'Candidate',
        email: updates.email || '',
        phone: updates.phone || '',
        currentDesignation: updates.currentDesignation || '',
        location: updates.location || '',
        experienceYears: updates.experienceYears || 0,
        skills: updates.skills || [],
        source: 'Direct Career Portal',
        status: 'New',
        assignedRecruiter: updates.assignedRecruiter || 'Recruiter',
        matchScore: 80,
        avatar: '',
        ...updates
      };
      applicants.unshift(fallback);
      setStorage(STORAGE_KEYS.APPLICANTS, applicants);
      return fallback;
    }
    const updated = { ...applicants[index], ...updates };
    applicants[index] = updated;
    setStorage(STORAGE_KEYS.APPLICANTS, applicants);
    return updated;
  },

  async addApplicantDocuments(id: string, files: File[]): Promise<Applicant> {
    await delay(100);
    const applicants = await this.getApplicants();
    const index = applicants.findIndex((applicant) => applicant.id === id);
    if (index === -1) throw new Error('Applicant not found');

    const additions = await saveApplicantDocuments(id, files);
    const updated = {
      ...applicants[index],
      documents: [...(applicants[index].documents || []), ...additions]
    };
    applicants[index] = updated;
    setStorage(STORAGE_KEYS.APPLICANTS, applicants);
    return updated;
  },

  async getApplicantDocument(fileId: string): Promise<Blob | undefined> {
    const database = await openApplicantDocumentDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('documents', 'readonly');
      const request = transaction.objectStore('documents').get(fileId);
      request.onsuccess = () => {
        database.close();
        resolve(request.result?.file as Blob | undefined);
      };
      request.onerror = () => {
        database.close();
        reject(request.error || new Error('Unable to retrieve applicant document.'));
      };
    });
  },

  async toggleFavorite(id: string): Promise<boolean> {
    const applicants = await this.getApplicants();
    const applicant = applicants.find((a) => a.id === id);
    if (applicant) {
      applicant.isFavorite = !applicant.isFavorite;
      setStorage(STORAGE_KEYS.APPLICANTS, applicants);
      return applicant.isFavorite;
    }
    return false;
  },

  async updateApplicantStage(id: string, newStage: PipelineStage): Promise<void> {
    await delay(120);
    const applicants = await this.getApplicants();
    const candidate = applicants.find((a) => a.id === id);
    if (candidate) {
      const oldStage = candidate.status;
      candidate.status = newStage;
      setStorage(STORAGE_KEYS.APPLICANTS, applicants);

      await this.logActivity({
        user: 'Priya Sharma',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
        action: `advanced ${candidate.name} from ${oldStage} to`,
        target: newStage,
        type: 'applicant'
      });
    }
  },

  // Clients
  async getClients(): Promise<Client[]> {
    await delay(130);
    return getStorage<Client[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
  },

  async createClient(clientData: Omit<Client, 'id' | 'clientId' | 'joinedDate'>): Promise<Client> {
    await delay(180);
    const clients = await this.getClients();
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`,
      clientId: `CLI-${clients.length + 1005}`,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    const updated = [newClient, ...clients];
    setStorage(STORAGE_KEYS.CLIENTS, updated);
    return newClient;
  },

  // Vendors
  async getVendors(): Promise<Vendor[]> {
    await delay(130);
    return getStorage<Vendor[]>(STORAGE_KEYS.VENDORS, INITIAL_VENDORS);
  },

  async createVendor(vendorData: Omit<Vendor, 'id' | 'vendorId'>): Promise<Vendor> {
    await delay(180);
    const vendors = await this.getVendors();
    const newVendor: Vendor = {
      ...vendorData,
      id: `ven-${Date.now()}`,
      vendorId: `VEN-${vendors.length + 504}`
    };
    const updated = [newVendor, ...vendors];
    setStorage(STORAGE_KEYS.VENDORS, updated);
    return newVendor;
  },

  // Interviews
  async getInterviews(): Promise<Interview[]> {
    await delay(130);
    return getStorage<Interview[]>(STORAGE_KEYS.INTERVIEWS, INITIAL_INTERVIEWS);
  },

  async scheduleInterview(interviewData: Omit<Interview, 'id'>): Promise<Interview> {
    await delay(180);
    const interviews = await this.getInterviews();
    const newInterview: Interview = {
      ...interviewData,
      id: `int-${Date.now()}`
    };
    const updated = [newInterview, ...interviews];
    setStorage(STORAGE_KEYS.INTERVIEWS, updated);

    await this.logActivity({
      user: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
      action: 'booked interview for',
      target: `${newInterview.applicantName} with ${newInterview.client}`,
      type: 'interview'
    });

    return newInterview;
  },

  async updateInterviewStatus(id: string, status: Interview['status'], feedback?: string, rating?: number): Promise<void> {
    await delay(140);
    const interviews = await this.getInterviews();
    const item = interviews.find((i) => i.id === id);
    if (item) {
      item.status = status;
      if (feedback !== undefined) item.feedback = feedback;
      if (rating !== undefined) item.rating = rating;
      setStorage(STORAGE_KEYS.INTERVIEWS, interviews);
    }
  },

  // Submissions
  async getSubmissions(): Promise<Submission[]> {
    await delay(130);
    const records = getStorage<Submission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    let migrated = false;
    const normalized = records.map((submission) => {
      const status = submission.status === 'Client Submission' ? 'Submitted to Client' : submission.status === 'In Review' ? 'Client Review' : submission.status === 'Submitted' ? 'Waiting for Evaluation by Internal Reviewer' : submission.status;
      if (status !== submission.status || !submission.statusHistory) migrated = true;
      return {
        ...submission,
        status,
        statusHistory: submission.statusHistory || [{ status, changedAt: submission.submittedDate }]
      };
    });
    if (migrated) setStorage(STORAGE_KEYS.SUBMISSIONS, normalized);
    return normalized;
  },

  async updateSubmissionApproval(id: string, approvalStatus: Submission['approvalStatus']): Promise<void> {
    await delay(140);
    const submissions = await this.getSubmissions();
    const item = submissions.find((s) => s.id === id);
    if (item) {
      item.approvalStatus = approvalStatus;
      setStorage(STORAGE_KEYS.SUBMISSIONS, submissions);
    }
  },

  async updateSubmissionScore(id: string, score: number): Promise<Submission> {
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      throw new Error('Submission score must be between 0 and 100.');
    }
    await delay(120);
    const submissions = await this.getSubmissions();
    const index = submissions.findIndex((submission) => submission.id === id);
    if (index === -1) throw new Error('Submission not found.');
    const updated = { ...submissions[index], score };
    submissions[index] = updated;
    setStorage(STORAGE_KEYS.SUBMISSIONS, submissions);
    return updated;
  },

  async addSubmissionNote(id: string, note: NonNullable<Submission['notes']>[number]): Promise<Submission> {
    await delay(120);
    const submissions = await this.getSubmissions();
    const index = submissions.findIndex((submission) => submission.id === id);
    if (index === -1) throw new Error('Submission not found.');
    const updated = { ...submissions[index], notes: [note, ...(submissions[index].notes || [])] };
    submissions[index] = updated;
    setStorage(STORAGE_KEYS.SUBMISSIONS, submissions);
    return updated;
  },

  async addSubmissionToGroup(id: string, group: string): Promise<Submission> {
    await delay(120);
    const submissions = await this.getSubmissions();
    const index = submissions.findIndex((submission) => submission.id === id);
    if (index === -1) throw new Error('Submission not found.');
    const groups = new Set(submissions[index].groups || []);
    groups.add(group);
    const updated = { ...submissions[index], groups: Array.from(groups) };
    submissions[index] = updated;
    setStorage(STORAGE_KEYS.SUBMISSIONS, submissions);
    return updated;
  },

  async updateSubmissionStatus(id: string, status: string, comments?: string): Promise<Submission | null> {
    await delay(140);
    const submissions = await this.getSubmissions();
    const index = submissions.findIndex((s) => s.id === id);
    if (index === -1) return null;
    const normalizedStatus = status === 'Client Submission' ? 'Submitted to Client' : status === 'In Review' ? 'Client Review' : status === 'Submitted' ? 'Waiting for Evaluation by Internal Reviewer' : status;
    const changedAt = new Date().toLocaleString();
    const previous = submissions[index];
    const history = previous.statusHistory || [{ status: previous.status, changedAt: previous.submittedDate }];
    const item = {
      ...previous,
      status: normalizedStatus,
      statusHistory: previous.status === normalizedStatus
        ? history
        : [...history, { status: normalizedStatus, changedAt, comments }]
    };
    submissions[index] = item;
    setStorage(STORAGE_KEYS.SUBMISSIONS, submissions);

    if (comments) {
      await this.logActivity({
        user: item.recruiter || 'Ganesh Godse',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        action: `updated submission status to "${normalizedStatus}" for`,
        target: `${item.applicantName} (${comments})`,
        type: 'submission'
      });
    }

    return item;
  },

  async createSubmission(submissionData: Partial<Submission>): Promise<Submission> {
    await delay(150);
    const submissions = await this.getSubmissions();
    const submittedDate = new Date().toLocaleString();
    const status = submissionData.status === 'Client Submission' ? 'Submitted to Client' : submissionData.status === 'In Review' ? 'Client Review' : submissionData.status === 'Submitted' ? 'Waiting for Evaluation by Internal Reviewer' : submissionData.status || 'Waiting for Evaluation by Internal Reviewer';

    const applicant = submissionData.applicantId
      ? await this.getApplicantById(submissionData.applicantId)
      : undefined;
    const newSubmission: Submission = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      submissionId: `${Math.floor(40000 + Math.random() * 20000)}`,
      applicantId: submissionData.applicantId || '',
      applicantName: submissionData.applicantName || applicant?.name || 'Candidate',
      nameAsPerAadhaar: submissionData.nameAsPerAadhaar
        || applicant?.nameAsPerAadhaar
        || applicant?.customFields?.nameAsPerAadhaar
        || applicant?.customFields?.['Name (As per Aadhaar)']
        || applicant?.customFields?.legalName
        || applicant?.legalName,
      jobId: submissionData.jobId || '',
      jobTitle: submissionData.jobTitle || 'Requisition',
      client: submissionData.client || '',
      recruiter: submissionData.recruiter || 'Ganesh Godse',
      submittedDate,
      billRate: submissionData.billRate || 0,
      payRate: submissionData.payRate || 0,
      status,
      approvalStatus: submissionData.approvalStatus || 'Pending Review',
      submissionDetails: submissionData.submissionDetails,
      quickSubmissionDetails: submissionData.quickSubmissionDetails,
      statusHistory: [{ status, changedAt: submittedDate }]
    };
    const updated = [newSubmission, ...submissions];
    setStorage(STORAGE_KEYS.SUBMISSIONS, updated);
    return newSubmission;
  },

  async addJobNote(jobId: string, noteData: Omit<JobNote, 'id'>): Promise<JobNote> {
    await delay(100);
    const jobs = await this.getJobs();
    const job = jobs.find((j) => j.id === jobId);
    const newNote: JobNote = {
      id: `jnote-${Date.now()}`,
      author: noteData.author,
      text: noteData.text,
      date: noteData.date || new Date().toLocaleString(),
      category: noteData.category || 'Job Posting',
      action: noteData.action,
      priority: noteData.priority,
      applicantRef: noteData.applicantRef,
      notifiedTo: noteData.notifiedTo
    };
    if (job) {
      job.notes = [newNote, ...(job.notes || [])];
      setStorage(STORAGE_KEYS.JOBS, jobs);
    }
    return newNote;
  },

  async deleteJobNote(jobId: string, noteId: string): Promise<void> {
    await delay(100);
    const jobs = await this.getJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (job && job.notes) {
      job.notes = job.notes.filter((n) => n.id !== noteId);
      setStorage(STORAGE_KEYS.JOBS, jobs);
    }
  },

  async addJobDocument(jobId: string, doc: JobDocument): Promise<void> {
    await delay(100);
    const jobs = await this.getJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      job.documents = [...(job.documents || []), doc];
      setStorage(STORAGE_KEYS.JOBS, jobs);
    }
  },

  async uploadJobDocuments(jobId: string, files: File[]): Promise<JobDocument[]> {
    await delay(100);
    const jobs = await this.getJobs();
    const jobIndex = jobs.findIndex((job) => job.id === jobId);
    if (jobIndex === -1) throw new Error('Job not found');
    const documents = await saveJobDocuments(files);
    jobs[jobIndex] = {
      ...jobs[jobIndex],
      documents: [...(jobs[jobIndex].documents || []), ...documents]
    };
    setStorage(STORAGE_KEYS.JOBS, jobs);
    return documents;
  },

  async deleteJobDocument(jobId: string, docId: string): Promise<void> {
    await delay(100);
    const jobs = await this.getJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (job && job.documents) {
      job.documents = job.documents.filter((d) => d.id !== docId);
      setStorage(STORAGE_KEYS.JOBS, jobs);
    }
  },

  // Placements
  async getPlacements(): Promise<Placement[]> {
    await delay(130);
    return getStorage<Placement[]>(STORAGE_KEYS.PLACEMENTS, INITIAL_PLACEMENTS);
  },

  // Tasks
  async getTasks(): Promise<TaskItem[]> {
    await delay(120);
    return getStorage<TaskItem[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  },

  async createTask(taskData: Omit<TaskItem, 'id'>): Promise<TaskItem> {
    await delay(120);
    const tasks = await this.getTasks();
    const newTask: TaskItem = {
      ...taskData,
      id: `tsk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    };
    setStorage(STORAGE_KEYS.TASKS, [newTask, ...tasks]);
    return newTask;
  },

  async toggleTaskStatus(id: string): Promise<void> {
    const tasks = await this.getTasks();
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.status = task.status === 'Completed' ? 'In Progress' : 'Completed';
      setStorage(STORAGE_KEYS.TASKS, tasks);
    }
  },

  // Activities
  async getActivities(): Promise<ActivityLog[]> {
    await delay(100);
    return getStorage<ActivityLog[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  },

  async logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
    const activities = await this.getActivities();
    const newActivity: ActivityLog = {
      ...activity,
      id: `act-${Date.now()}`,
      timestamp: 'Just now'
    };
    setStorage(STORAGE_KEYS.ACTIVITIES, [newActivity, ...activities.slice(0, 19)]);
  },

  // Reset to initial mock data
  resetAllData(): void {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  }
};
