export interface CustomFieldItem {
  id: string;
  fieldLabel: string;
  businessUnit: string;
  syncWith: string;
  moduleName: string;
  isIndependentField: boolean;
  customFieldType: string;
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  lastModified: string;
  isActive: boolean;
  applicableModules?: string[];
  fieldVisibility?: 'org' | 'business_unit';
  alsoTalentBench?: boolean;
  alsoPlacement?: boolean;
  isRequired?: boolean;
  fieldDescription?: string;
  fieldDataType?: string;
  validationRules?: string;
  minLen?: string;
  maxLen?: string;
}

export const INITIAL_CUSTOM_FIELDS: CustomFieldItem[] = [
  {
    id: 'cf-1',
    fieldLabel: 'Asset Provided by',
    businessUnit: 'Ampcus Tech Pvt Ltd.',
    syncWith: 'N/A',
    moduleName: 'Placements',
    isIndependentField: true,
    customFieldType: 'General Custom Field',
    createdBy: 'Sachin',
    modifiedBy: 'Sachin',
    createdAt: '2024-07-09 19:41:25',
    lastModified: '2024-07-11 17:05:01',
    isActive: true,
    applicableModules: ['Placements'],
    fieldVisibility: 'org',
    fieldDataType: 'Text'
  },
  {
    id: 'cf-2',
    fieldLabel: 'Asset Received',
    businessUnit: 'Ampcus Tech Pvt Ltd.',
    syncWith: 'N/A',
    moduleName: 'Placements',
    isIndependentField: true,
    customFieldType: 'General Custom Field',
    createdBy: 'Sachin',
    modifiedBy: 'Sachin',
    createdAt: '2024-07-11 17:04:34',
    lastModified: '2024-07-11 17:04:34',
    isActive: true,
    applicableModules: ['Placements'],
    fieldVisibility: 'org',
    fieldDataType: 'Text'
  },
  {
    id: 'cf-3',
    fieldLabel: 'Contract Signed',
    businessUnit: 'Ampcus Tech Pvt Ltd.',
    syncWith: 'N/A',
    moduleName: 'Clients',
    isIndependentField: true,
    customFieldType: 'General Custom Field',
    createdBy: 'Gaurav',
    modifiedBy: 'Gaurav',
    createdAt: '2024-11-08 19:35:05',
    lastModified: '2024-11-08 19:35:05',
    isActive: true,
    applicableModules: ['Clients'],
    fieldVisibility: 'org',
    fieldDataType: 'Text'
  },
  {
    id: 'cf-4',
    fieldLabel: 'Current asset id',
    businessUnit: 'Organization',
    syncWith: 'N/A',
    moduleName: 'Placements',
    isIndependentField: true,
    customFieldType: 'General Custom Field',
    createdBy: 'Sachin',
    modifiedBy: 'Sachin',
    createdAt: '2024-07-09 19:13:58',
    lastModified: '2024-07-09 19:13:58',
    isActive: true,
    applicableModules: ['Placements'],
    fieldVisibility: 'org',
    fieldDataType: 'Text'
  },
  {
    id: 'cf-5',
    fieldLabel: 'Date of Birth',
    businessUnit: 'Ampcus Tech Pvt Ltd.',
    syncWith: 'N/A',
    moduleName: 'Employee Job Postings',
    isIndependentField: true,
    customFieldType: 'General Custom Field',
    createdBy: 'Sachin',
    modifiedBy: 'Sachin',
    createdAt: '2024-07-09 17:30:35',
    lastModified: '2024-07-09 17:30:35',
    isActive: true,
    applicableModules: ['Job Posting'],
    fieldVisibility: 'org',
    fieldDataType: 'Date'
  },
  {
    id: 'cf-6',
    fieldLabel: 'Job Category',
    businessUnit: 'Ampcus Tech Pvt Ltd.',
    syncWith: 'N/A',
    moduleName: 'Job Posting',
    isIndependentField: true,
    customFieldType: 'General Custom Field',
    createdBy: 'Sachin',
    modifiedBy: 'Sachin',
    createdAt: '2024-06-19 09:27:52',
    lastModified: '2024-06-19 09:27:52',
    isActive: true,
    applicableModules: ['Job Posting'],
    fieldVisibility: 'org',
    fieldDataType: 'Dropdown'
  },
  {
    id: 'cf-7',
    fieldLabel: 'Job Skill Type',
    businessUnit: 'Ampcus Tech Pvt Ltd.',
    syncWith: 'N/A',
    moduleName: 'Job Posting',
    isIndependentField: true,
    customFieldType: 'General Custom Field',
    createdBy: 'Sachin',
    modifiedBy: 'Sachin',
    createdAt: '2024-06-19 09:28:45',
    lastModified: '2024-06-19 09:28:45',
    isActive: true,
    applicableModules: ['Job Posting'],
    fieldVisibility: 'org',
    fieldDataType: 'Dropdown'
  },
  {
    id: 'cf-8',
    fieldLabel: 'Languages',
    businessUnit: 'Ampcus Tech Pvt Ltd.',
    syncWith: 'N/A',
    moduleName: 'Applicant',
    isIndependentField: true,
    customFieldType: 'General Custom Field',
    createdBy: 'Sachin',
    modifiedBy: 'Sachin',
    createdAt: '2024-06-24 17:18:41',
    lastModified: '2024-06-26 20:18:09',
    isActive: false,
    applicableModules: ['Applicant'],
    fieldVisibility: 'org',
    fieldDataType: 'Multiple Choice'
  }
];

export const ALL_APPLICABLE_MODULES = [
  'Applicant',
  'Talent Bench',
  'Job Posting',
  'Clients',
  'Vendors',
  'Client Contacts',
  'Vendor Contacts',
  'Job Requisition',
  'Placements',
  'Leads',
  'Lead Contacts',
  'Applicant Submissions',
  'Add Interviewer',
  'Bench Requirement Submissions',
  'Vendor Submissions',
  'Job Board Submissions',
  'Referral Employees',
  'Users',
  'Compasses',
  'Deals'
];

export const FIELD_DATA_TYPES = [
  'Text',
  'Multi-line Text',
  'Date',
  'Checkbox',
  'Multiple Choice',
  'Dropdown',
  'Multiple Dropdown',
  'Radio Button',
  'User',
  'Attachment'
];

export interface LookupItem {
  id: string;
  name: string;
  createdBy: string;
  modifiedBy: string;
  lastModified: string;
}

export const INITIAL_LOOKUPS: Record<string, LookupItem[]> = {
  'Background Feedback': [
    {
      id: 'bf-1',
      name: 'In Process',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:51:26'
    },
    {
      id: 'bf-2',
      name: 'Failed',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:51:26'
    },
    {
      id: 'bf-3',
      name: 'Success',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:51:26'
    }
  ],
  Languages: [
    {
      id: 'lg-1',
      name: 'English',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:50:00'
    },
    {
      id: 'lg-2',
      name: 'Spanish',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:50:00'
    },
    {
      id: 'lg-3',
      name: 'French',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:50:00'
    }
  ],
  'Pay Frequency Types': [
    {
      id: 'pf-1',
      name: 'Hourly',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:45:00'
    },
    {
      id: 'pf-2',
      name: 'Daily',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:45:00'
    },
    {
      id: 'pf-3',
      name: 'Weekly',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:45:00'
    },
    {
      id: 'pf-4',
      name: 'Bi-Weekly',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:45:00'
    },
    {
      id: 'pf-5',
      name: 'Monthly',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:45:00'
    },
    {
      id: 'pf-6',
      name: 'Annual',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:45:00'
    }
  ],
  'Payment Terms': [
    {
      id: 'pt-1',
      name: 'Net 15',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:40:00'
    },
    {
      id: 'pt-2',
      name: 'Net 30',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:40:00'
    },
    {
      id: 'pt-3',
      name: 'Net 45',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:40:00'
    },
    {
      id: 'pt-4',
      name: 'Net 60',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:40:00'
    }
  ],
  'Tax Terms': [
    {
      id: 'tt-1',
      name: 'W2',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:35:00'
    },
    {
      id: 'tt-2',
      name: '1099',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:35:00'
    },
    {
      id: 'tt-3',
      name: 'C2C',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:35:00'
    }
  ],
  'Work Authorizations': [
    {
      id: 'wa-1',
      name: 'US Citizen',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:30:00'
    },
    {
      id: 'wa-2',
      name: 'Green Card',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:30:00'
    },
    {
      id: 'wa-3',
      name: 'H-1B',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:30:00'
    },
    {
      id: 'wa-4',
      name: 'EAD',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:30:00'
    },
    {
      id: 'wa-5',
      name: 'TN Visa',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:30:00'
    }
  ],
  'Note Actions': [
    {
      id: 'na-1',
      name: 'General Discussion',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:25:00'
    },
    {
      id: 'na-2',
      name: 'Client Feedback',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:25:00'
    },
    {
      id: 'na-3',
      name: 'Candidate Update',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      lastModified: '03/06/2024 22:25:00'
    }
  ]
};

export interface MassMailItem {
  id: string;
  name: string;
  type: 'Individual' | 'Team';
  allocatedCredits: number;
  renewalCredits: number;
  availableCredits: number;
  usedCredits: number;
  allocatedBy: string;
  allocatedOn: string;
  renewalType: 'Daily' | 'Monthly' | 'Weekly' | 'Quarterly';
  renewalStatus: 'ON' | 'OFF';
}

export const INITIAL_MASS_MAIL: MassMailItem[] = [
  {
    id: 'mm-1',
    name: 'Sachin Wadeyar',
    type: 'Individual',
    allocatedCredits: 10,
    renewalCredits: 10,
    availableCredits: 10,
    usedCredits: 0,
    allocatedBy: 'Sachin Wadeyar',
    allocatedOn: '23/07/2024',
    renewalType: 'Daily',
    renewalStatus: 'ON'
  },
  {
    id: 'mm-2',
    name: 'Gaurav Mahadik',
    type: 'Team',
    allocatedCredits: 33000,
    renewalCredits: 33000,
    availableCredits: 33000,
    usedCredits: 0,
    allocatedBy: 'Sachin Wadeyar',
    allocatedOn: '01/08/2024',
    renewalType: 'Monthly',
    renewalStatus: 'ON'
  },
  {
    id: 'mm-3',
    name: 'Anandi Nashik 1',
    type: 'Team',
    allocatedCredits: 33000,
    renewalCredits: 33000,
    availableCredits: 32993,
    usedCredits: 7,
    allocatedBy: 'Sachin Wadeyar',
    allocatedOn: '01/08/2024',
    renewalType: 'Monthly',
    renewalStatus: 'ON'
  },
  {
    id: 'mm-4',
    name: 'Anandi Thane',
    type: 'Team',
    allocatedCredits: 33000,
    renewalCredits: 33000,
    availableCredits: 33000,
    usedCredits: 0,
    allocatedBy: 'Sachin Wadeyar',
    allocatedOn: '01/08/2024',
    renewalType: 'Monthly',
    renewalStatus: 'ON'
  }
];

export interface EmailCleanupItem {
  id: string;
  userName: string;
  email: string;
  phone: string;
  allocatedCredits: number;
  availableCredits: number;
  allocatedBy: string;
  allocatedOn: string;
}

export const INITIAL_EMAIL_CLEANUP_CREDITS = {
  purchased: 300,
  used: 0,
  available: 300
};

export interface MiscEmailSettings {
  jobShareDefaultFields: string[];
  hotlistDefaultFields: string[];
  applicableRoles: string[];
  defaultEmailMergeCount: number;
  sendMailMergeSummaryNotification: string;
  sendMergeNotification: string;
  limitMailMergeNotificationsToCandidate: number;
}

export const INITIAL_MISC_EMAIL_SETTINGS: MiscEmailSettings = {
  jobShareDefaultFields: [],
  hotlistDefaultFields: [],
  applicableRoles: [],
  defaultEmailMergeCount: 999,
  sendMailMergeSummaryNotification: 'select',
  sendMergeNotification: 'select',
  limitMailMergeNotificationsToCandidate: 5
};

export interface ConsentSettingsData {
  consentType: string;
  consentApplicableTo: 'all' | 'country';
  countries: string[];
  consentContactEmail: string;
  defaultConsentPeriod: string;
  sendConsentForAllJobs: boolean;
  sendConsentBasedOnJob: boolean;
  defaultNotifier: string;
  defaultValuesToDisplay: string[];
  numberOfTimesToSend: string;
  frequencyDays: string;
  sendExpiryReminder: string;
  expiryNotificationFrequency: string;
  displaySendConsentInRejected: boolean;
  actionWhenNoResponse: 'retain' | 'delete';
  actionWhenRejects: 'retain' | 'delete';
  allowDeletedConsentsRoles: string[];
  displayTermsAndConditions: boolean;
}

export const INITIAL_CONSENT_SETTINGS: ConsentSettingsData = {
  consentType: 'GDPR',
  consentApplicableTo: 'country',
  countries: ['United Kingdom'],
  consentContactEmail: 'support@ampcustech.com',
  defaultConsentPeriod: '1 Year',
  sendConsentForAllJobs: false,
  sendConsentBasedOnJob: false,
  defaultNotifier: '',
  defaultValuesToDisplay: ['Full Name', 'Email Address', 'Phone Number', 'Resume / CV', 'Location', 'Experience Details'],
  numberOfTimesToSend: '1',
  frequencyDays: '1',
  sendExpiryReminder: 'Select',
  expiryNotificationFrequency: 'Select',
  displaySendConsentInRejected: false,
  actionWhenNoResponse: 'retain',
  actionWhenRejects: 'retain',
  allowDeletedConsentsRoles: ['Administrator'],
  displayTermsAndConditions: false
};

export interface AuditActivity {
  id: string;
  dateTime: string;
  description: string;
}

export const INITIAL_CONSENT_ACTIVITIES: AuditActivity[] = [
  {
    id: 'ca-1',
    dateTime: '11/06/2024 16:47:13 PM',
    description: 'Consent Settings has been Changed by Sachin Wadeyar .Send consent for all Jobs has been changed from [ YES ] to [ NO ]. Send Consent based on the Job has been changed from [ YES ] to [ NO ].'
  }
];

export interface MandatoryFieldItem {
  id: string;
  fieldName: string;
  showHide: boolean | 'visible'; // true, false, or fixed 'visible'
  mandatory: boolean | 'required'; // true, false, or fixed 'required'
  mandateWhileSubmitting: boolean | 'required'; // true, false, or fixed 'required'
}

export const INITIAL_MANDATORY_APPLICANT_FIELDS: MandatoryFieldItem[] = [
  { id: 'mf-1', fieldName: 'First Name', showHide: 'visible', mandatory: 'required', mandateWhileSubmitting: 'required' },
  { id: 'mf-2', fieldName: 'Last Name', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-3', fieldName: 'Email', showHide: 'visible', mandatory: 'required', mandateWhileSubmitting: false },
  { id: 'mf-4', fieldName: 'Mobile Number', showHide: 'visible', mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-5', fieldName: 'Nickname', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-6', fieldName: 'Middle Name', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-7', fieldName: 'Alternate Email Address', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-8', fieldName: 'Home Phone Number', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-9', fieldName: 'Work Phone Number', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-10', fieldName: 'Ownership', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-11', fieldName: 'Other Phone', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-12', fieldName: 'Date of Birth', showHide: true, mandatory: true, mandateWhileSubmitting: false },
  { id: 'mf-13', fieldName: 'Skype Id', showHide: false, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-14', fieldName: 'Linked In Profile', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-15', fieldName: 'Facebook Profile', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-16', fieldName: 'Twitter Profile', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-17', fieldName: 'Video Reference', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-18', fieldName: 'Technology', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-19', fieldName: 'Address', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-20', fieldName: 'City', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-21', fieldName: 'Notice Period', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-22', fieldName: 'Applicant Rating', showHide: false, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-23', fieldName: 'Industry', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-24', fieldName: 'Current CTC', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-25', fieldName: 'Current Company', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-26', fieldName: 'Aadhar Number', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-27', fieldName: 'UAN Number', showHide: false, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-28', fieldName: 'Function', showHide: false, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-29', fieldName: 'Pan Card Number', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-30', fieldName: 'Relocation', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-31', fieldName: 'GPA', showHide: false, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-32', fieldName: 'State', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-33', fieldName: 'Country', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-34', fieldName: 'Zip Code', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-35', fieldName: 'Skills', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-36', fieldName: 'Primary Skills', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-37', fieldName: 'Additional Comments', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-38', fieldName: 'Experience', showHide: 'visible', mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-39', fieldName: 'Job Title', showHide: 'visible', mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-40', fieldName: 'Applicant Status', showHide: 'visible', mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-41', fieldName: 'Source', showHide: 'visible', mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-42', fieldName: 'Gender', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-43', fieldName: 'Race/Ethnicity', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-44', fieldName: 'Veteran Status', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-45', fieldName: 'Veteran Type', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-46', fieldName: 'Referred By', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-47', fieldName: 'Disability', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-48', fieldName: 'Expected Pay', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-49', fieldName: 'Applicant Group', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-50', fieldName: 'Tax Terms', showHide: false, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-51', fieldName: 'Nationality', showHide: true, mandatory: false, mandateWhileSubmitting: false },
  { id: 'mf-52', fieldName: 'Reference ID', showHide: true, mandatory: false, mandateWhileSubmitting: false }
];

export interface EducationDetailFieldItem {
  id: string;
  fieldName: string;
  showHide: boolean | 'visible';
}

export const INITIAL_EDUCATION_FIELDS: EducationDetailFieldItem[] = [
  { id: 'ed-1', fieldName: 'School Name', showHide: 'visible' },
  { id: 'ed-2', fieldName: 'Degree', showHide: 'visible' },
  { id: 'ed-3', fieldName: 'Year Completed', showHide: true },
  { id: 'ed-4', fieldName: 'Major Study', showHide: true },
  { id: 'ed-5', fieldName: 'Minor Study', showHide: true },
  { id: 'ed-6', fieldName: 'GPA', showHide: true },
  { id: 'ed-7', fieldName: 'School Country', showHide: true },
  { id: 'ed-8', fieldName: 'School State', showHide: true },
  { id: 'ed-9', fieldName: 'School City', showHide: true }
];

export const ENCRYPTION_FIELD_CANDIDATES = [
  'SSN',
  'Aadhar Number',
  'Pan Card Number',
  'Passport',
  'UAN Number'
];

export const ENCRYPTION_ROLES_LIST = [
  'Account Manager',
  'CRO',
  'CRO - Hiring Manager',
  'Hiring Manager',
  'HR Executive',
  'HR Manager',
  'MIS',
  'Administrator',
  'Lead Recruiter',
  'Practice Lead'
];
