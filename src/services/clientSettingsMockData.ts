export interface ClientLookupItem {
  id: string;
  name: string;
  address?: string;
  createdBy: string;
  modifiedBy: string;
  createdOn: string;
  lastModified: string;
}

export interface ClientDocumentTypeItem {
  id: string;
  documentType: string;
  businessUnit: string;
  isMandatory: 'No' | 'Yes' | 'Yes, But Can Be Added Later';
  expiryNotification: boolean;
  restrictedRoles: string[];
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  lastModified: string;
}

export interface ClientGeneralSettings {
  displayClientNamesOnJobPlacements: boolean;
  defaultSubmissionFormat: 'Clients' | 'Client Contacts';
  clientDefaultView: 'Clients' | 'Client Contacts';
  defaultClientVisibility: 'Organization Level' | 'Business Unit Level';
  defaultSendRequirement: boolean;
  defaultSendHotlist: boolean;
  displayParentClientInsteadOfChild: boolean;
  applicationStatusesToDisplay: string[];
  defaultPostJobOnCareerPortal: boolean;
  companyLevelSettings: {
    actionIfClientExists: 'Access Required' | 'Access Not Required' | 'Allow Duplicates';
    notifyUserAboutClientRecordAccess: {
      primaryOwner: boolean;
      administrator: boolean;
    };
    actionIfClientContactExists: 'Access Required' | 'Allow Duplicates';
    notifyPeopleAboutClientContactAccess: {
      primaryOwner: boolean;
      administrator: boolean;
    };
  };
  teamLevelSettings: {
    enableTeamLevelSettings: boolean;
  };
}

export interface ClientActivityLogItem {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export const INITIAL_CLIENT_LOOKUPS: Record<string, ClientLookupItem[]> = {
  'Client Categories': [
    {
      id: 'cc-1',
      name: 'Tier 1',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '03/06/2024 22:51:28',
      lastModified: '03/06/2024 22:51:28'
    },
    {
      id: 'cc-2',
      name: 'Direct',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '03/06/2024 22:51:28',
      lastModified: '03/06/2024 22:51:28'
    }
  ],
  'Client Contact Rejection Reasons': [
    {
      id: 'crr-1',
      name: 'Others',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '03/06/2024 22:51:29',
      lastModified: '03/06/2024 22:51:29'
    },
    {
      id: 'crr-2',
      name: 'No longer associated with the client',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '03/06/2024 22:51:29',
      lastModified: '03/06/2024 22:51:29'
    },
    {
      id: 'crr-3',
      name: 'Not Contacted',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '03/06/2024 22:51:29',
      lastModified: '03/06/2024 22:51:29'
    },
    {
      id: 'crr-4',
      name: 'Wrong contact',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '03/06/2024 22:51:29',
      lastModified: '03/06/2024 22:51:29'
    }
  ],
  'Client Contact Statuses': [
    {
      id: 'ccs-1',
      name: 'Imported from Oorwin',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '23/12/2021 05:37:01',
      lastModified: '23/12/2021 05:37:01'
    },
    {
      id: 'ccs-2',
      name: 'DNC',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '03/06/2024 22:51:27',
      lastModified: '03/06/2024 22:51:27'
    },
    {
      id: 'ccs-3',
      name: 'Negotiating',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '03/06/2024 22:51:27',
      lastModified: '03/06/2024 22:51:27'
    },
    {
      id: 'ccs-4',
      name: 'Working',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '03/06/2024 22:51:27',
      lastModified: '03/06/2024 22:51:27'
    },
    {
      id: 'ccs-5',
      name: 'New Lead',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '03/06/2024 22:51:27',
      lastModified: '03/06/2024 22:51:27'
    }
  ],
  'Client Practices': [
    {
      id: 'cp-1',
      name: 'Cloud Infrastructure & DevOps',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '15/05/2024 11:20:15',
      lastModified: '15/05/2024 11:20:15'
    },
    {
      id: 'cp-2',
      name: 'Enterprise Application Services',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '20/05/2024 14:10:00',
      lastModified: '20/05/2024 14:10:00'
    }
  ],
  'Client Statuses': [
    {
      id: 'cs-1',
      name: 'Imported from Oorwin',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '17/07/2024 17:02:29',
      lastModified: '17/07/2024 17:02:29'
    },
    {
      id: 'cs-2',
      name: 'Negotiation',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '03/06/2024 22:51:28',
      lastModified: '03/06/2024 22:51:28'
    },
    {
      id: 'cs-3',
      name: 'Archive',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '03/06/2024 22:51:28',
      lastModified: '03/06/2024 22:51:28'
    },
    {
      id: 'cs-4',
      name: 'DNC',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '03/06/2024 22:51:28',
      lastModified: '03/06/2024 22:51:28'
    },
    {
      id: 'cs-5',
      name: 'New Lead',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '03/06/2024 22:51:28',
      lastModified: '03/06/2024 22:51:28'
    },
    {
      id: 'cs-6',
      name: 'Inactive',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '03/06/2024 22:51:28',
      lastModified: '03/06/2024 22:51:28'
    },
    {
      id: 'cs-7',
      name: 'Active',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '03/06/2024 22:51:28',
      lastModified: '03/06/2024 22:51:28'
    }
  ],
  'Client Facilities': [
    {
      id: 'cfac-1',
      name: 'Corporate HQ - Silicon Valley',
      address: '2880 Zanker Road, Suite 203, San Jose, CA 95134',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '03/06/2024 22:51:28',
      lastModified: '03/06/2024 22:51:28'
    },
    {
      id: 'cfac-2',
      name: 'East Coast Operations Center',
      address: '100 Metroplex Drive, Suite 100, Edison, NJ 08817',
      createdBy: 'Sachin Wadeyar',
      modifiedBy: 'Sachin Wadeyar',
      createdOn: '03/06/2024 22:51:28',
      lastModified: '03/06/2024 22:51:28'
    }
  ]
};

export const INITIAL_CLIENT_DOCUMENT_TYPES: ClientDocumentTypeItem[] = [
  {
    id: 'cdt-1',
    documentType: 'Master Services Agreement (MSA)',
    businessUnit: 'Ampcus Tech Pvt Ltd.',
    isMandatory: 'Yes',
    expiryNotification: true,
    restrictedRoles: ['Administrator', 'Account Manager'],
    createdBy: 'Sachin Wadeyar',
    modifiedBy: 'Sachin Wadeyar',
    createdAt: '03/06/2024 22:51:28',
    lastModified: '03/06/2024 22:51:28'
  },
  {
    id: 'cdt-2',
    documentType: 'Non-Disclosure Agreement (NDA)',
    businessUnit: 'Ampcus Tech Pvt Ltd.',
    isMandatory: 'Yes, But Can Be Added Later',
    expiryNotification: false,
    restrictedRoles: ['Administrator', 'Account Manager', 'CRO'],
    createdBy: 'Sachin Wadeyar',
    modifiedBy: 'Sachin Wadeyar',
    createdAt: '03/06/2024 22:51:28',
    lastModified: '03/06/2024 22:51:28'
  },
  {
    id: 'cdt-3',
    documentType: 'Certificate of Insurance (COI)',
    businessUnit: 'Ampcus Tech Pvt Ltd.',
    isMandatory: 'No',
    expiryNotification: true,
    restrictedRoles: ['Administrator'],
    createdBy: 'Sachin Wadeyar',
    modifiedBy: 'Sachin Wadeyar',
    createdAt: '12/07/2024 15:30:10',
    lastModified: '12/07/2024 15:30:10'
  }
];

export const INITIAL_CLIENT_SETTINGS: ClientGeneralSettings = {
  displayClientNamesOnJobPlacements: true,
  defaultSubmissionFormat: 'Client Contacts',
  clientDefaultView: 'Clients',
  defaultClientVisibility: 'Organization Level',
  defaultSendRequirement: true,
  defaultSendHotlist: true,
  displayParentClientInsteadOfChild: false,
  applicationStatusesToDisplay: ['Negotiation', 'Submitted', 'Submitted To Client'],
  defaultPostJobOnCareerPortal: true,
  companyLevelSettings: {
    actionIfClientExists: 'Access Required',
    notifyUserAboutClientRecordAccess: {
      primaryOwner: true,
      administrator: false
    },
    actionIfClientContactExists: 'Access Required',
    notifyPeopleAboutClientContactAccess: {
      primaryOwner: true,
      administrator: false
    }
  },
  teamLevelSettings: {
    enableTeamLevelSettings: false
  }
};

export const AVAILABLE_RESTRICTED_ROLES = [
  'Account Manager',
  'Administrator',
  'CRO',
  'CRO - Hiring Manager',
  'Hiring Manager',
  'HR Executive',
  'HR Manager'
];

export const AVAILABLE_PORTAL_APPLICATION_STATUSES = [
  'Archived',
  'Keep Hold',
  'Negotiation',
  'Submitted',
  'Project Completed',
  'Submitted To Client',
  'Submitted To Vendor'
];

export const INITIAL_CLIENT_ACTIVITIES: ClientActivityLogItem[] = [
  {
    id: 'act-1',
    action: 'Settings Updated',
    user: 'Sachin Wadeyar',
    timestamp: 'Today at 10:15 AM',
    details: 'Updated client default visibility to Organization Level.'
  },
  {
    id: 'act-2',
    action: 'Lookup Added',
    user: 'Sachin Wadeyar',
    timestamp: 'Yesterday at 04:30 PM',
    details: 'Added new Client Status "Negotiation".'
  },
  {
    id: 'act-3',
    action: 'Document Type Created',
    user: 'Sachin Wadeyar',
    timestamp: '18 Nov 2026, 02:14 PM',
    details: 'Created Master Services Agreement (MSA) document type requirement.'
  }
];
