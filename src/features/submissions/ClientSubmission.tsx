import React, { useEffect, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  ClipboardPaste,
  Copy,
  Eraser,
  Italic,
  Link2,
  List,
  ListOrdered,
  MousePointer2,
  Paintbrush,
  Plus,
  Replace,
  Redo2,
  Search,
  Scissors,
  SpellCheck,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
  Undo2,
  Unlink
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { useAppStore } from '../../store/appStore';
import { Applicant, Job, Submission, User } from '../../types';

const fieldClassName = 'h-7 rounded border border-[#D5DCE5] bg-white px-2 text-[11px] text-[#344054] focus:border-blue-500 focus:outline-none';
const toolbarButtonClassName = 'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[#475467] hover:bg-[#E9EDF2]';
type EmailTextFormatting = Pick<CSSStyleDeclaration, 'backgroundColor' | 'color' | 'fontFamily' | 'fontSize' | 'fontStyle' | 'fontWeight' | 'textDecoration'>;
type EmailToolbarPanel = 'find' | 'replace' | 'link' | null;
const COUNTRY_OPTIONS = [
  'Afghanistan', 'Åland Islands', 'Albania', 'Algeria', 'American Samoa', 'Andorra', 'Angola', 'Anguilla',
  'Antarctica', 'Antigua & Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda',
  'Bhutan', 'Bolivia', 'Bosnia & Herzegovina', 'Botswana', 'Bouvet Island',
  'Brazil', 'British Indian Ocean Territory', 'British Virgin Islands', 'Brunei', 'Bulgaria', 'Burkina Faso',
  'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Caribbean Netherlands', 'Cayman Islands',
  'Central African Republic', 'Chad', 'Chile', 'China', 'Christmas Island', 'Cocos (Keeling) Islands',
  'Colombia', 'Comoros', 'Congo - Brazzaville', 'Congo - Kinshasa', 'Cook Islands', 'Costa Rica',
  'Côte d’Ivoire', 'Croatia', 'Cuba', 'Curaçao', 'Cyprus', 'Czechia', 'Denmark', 'Djibouti', 'Dominica',
  'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia',
  'Eswatini', 'Ethiopia', 'Falkland Islands', 'Faroe Islands', 'Fiji', 'Finland', 'France', 'French Guiana',
  'French Polynesia', 'French Southern Territories', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana',
  'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guadeloupe', 'Guam', 'Guatemala', 'Guernsey', 'Guinea',
  'Guinea-Bissau', 'Guyana', 'Haiti', 'Heard & McDonald Islands', 'Honduras', 'Hong Kong SAR China',
  'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jersey', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos',
  'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Macao SAR China', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands',
  'Martinique', 'Mauritania', 'Mauritius', 'Mayotte', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia',
  'Montenegro', 'Montserrat', 'Morocco', 'Mozambique', 'Myanmar (Burma)', 'Namibia', 'Nauru', 'Nepal',
  'Netherlands', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'Norfolk Island',
  'North Korea', 'North Macedonia', 'Northern Mariana Islands', 'Norway', 'Oman', 'Pakistan', 'Palau',
  'Palestinian Territories', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Pitcairn Islands',
  'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Réunion', 'Romania', 'Russia', 'Rwanda', 'Samoa',
  'San Marino', 'São Tomé & Príncipe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone',
  'Singapore', 'Sint Maarten', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa',
  'South Georgia & South Sandwich Islands', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka',
  'St. Barthélemy', 'St. Helena', 'St. Kitts & Nevis', 'St. Lucia', 'St. Martin', 'St. Pierre & Miquelon',
  'St. Vincent & Grenadines', 'Sudan', 'Suriname', 'Svalbard & Jan Mayen', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tokelau', 'Tonga',
  'Trinidad & Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Turks & Caicos Islands', 'Tuvalu',
  'U.S. Outlying Islands', 'U.S. Virgin Islands', 'Uganda', 'Ukraine', 'United Arab Emirates',
  'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela',
  'Vietnam', 'Wallis & Futuna', 'Western Sahara', 'Yemen', 'Zambia', 'Zimbabwe'
].sort((a, b) => a.localeCompare(b));
const INDIA_STATE_OPTIONS = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
  'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal'
];
const SALUTATION_OPTIONS = [
  { value: 'hi-first', label: 'HI [FIRSTNAME]', greeting: 'Hi {ConfigClientContact : contact_first_name},' },
  { value: 'hello-first', label: 'HELLO [FIRSTNAME]', greeting: 'Hello {ConfigClientContact : contact_first_name},' },
  { value: 'hi-full', label: 'HI [FIRSTNAME] [LASTNAME]', greeting: 'Hi {ConfigClientContact : contact_first_name} {ConfigClientContact : contact_last_name},' },
  { value: 'hello-full', label: 'HELLO [FIRSTNAME] [LASTNAME]', greeting: 'Hello {ConfigClientContact : contact_first_name} {ConfigClientContact : contact_last_name},' },
  { value: 'dear-full', label: 'DEAR [FIRSTNAME] [LASTNAME]', greeting: 'Dear {ConfigClientContact : contact_first_name} {ConfigClientContact : contact_last_name},' }
];
const MAILING_THEME_OPTIONS = Array.from({ length: 12 }, (_, index) => `THEME ${index + 1}`);
const DEFAULT_EMAIL_BODY = `
<div style="font-family:'Times New Roman',serif;font-size:14px;color:#000;">
  <p style="margin:0 0 16px;">Hi {ConfigClientContact : contact_first_name},</p>
  <p style="margin:0 0 18px;">Good day!</p>

  <table style="width:430px;border-collapse:collapse;margin:0 0 16px;">
    <tbody>
      <tr><td style="width:44%;border:1px solid #000;padding:3px;"><strong>Resume Screened by</strong></td><td style="border:1px solid #000;padding:3px;">&nbsp;</td></tr>
      <tr><td style="border:1px solid #000;padding:3px;"><strong>Phone screened by</strong></td><td style="border:1px solid #000;padding:3px;">&nbsp;</td></tr>
      <tr><td style="border:1px solid #000;padding:3px;"><strong>Job Created By</strong></td><td style="border:1px solid #000;padding:3px;">{{JOB_CREATOR}}</td></tr>
    </tbody>
  </table>

  <p style="margin:0 0 16px;">
    Please find the attached profile of <strong>{{APPLICANT_NAME}}</strong> for <strong>{{JOB_TITLE}}</strong> role at <strong>{{JOB_LOCATION}}</strong> location.<br>
    Note: _______________________________________
  </p>

  <p style="margin:0 0 6px;"><strong><span style="background-color:#ffff00;">Candidate’s Last five digits of PAN Card:</span></strong></p>

  <table style="width:100%;border-collapse:collapse;margin:0 0 26px;text-align:center;">
    <thead>
      <tr style="background-color:#dceaf5;">
        <th style="border:1px solid #000;padding:4px;">Sr. No.</th>
        <th style="border:1px solid #000;padding:4px;">Name</th>
        <th style="border:1px solid #000;padding:4px;">Experience</th>
        <th style="border:1px solid #000;padding:4px;">Contact No.</th>
        <th style="border:1px solid #000;padding:4px;">Notice Period/LWD</th>
        <th style="border:1px solid #000;padding:4px;">Location</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border:1px solid #000;padding:3px;">1</td>
        <td style="border:1px solid #000;padding:3px;">{{APPLICANT_NAME}}</td>
        <td style="border:1px solid #000;padding:3px;">&nbsp;</td>
        <td style="border:1px solid #000;padding:3px;">{{APPLICANT_PHONE}}</td>
        <td style="border:1px solid #000;padding:3px;">&nbsp;</td>
        <td style="border:1px solid #000;padding:3px;">&nbsp;</td>
      </tr>
    </tbody>
  </table>

  <div style="max-width:100%;overflow-x:auto;margin:0 0 18px;">
    <table style="width:100%;min-width:1250px;border-collapse:collapse;table-layout:fixed;text-align:center;font-size:12px;">
      <thead>
        <tr style="background-color:#dceaf5;">
          <th style="border:1px solid #000;padding:5px;">CV Shared Date</th>
          <th style="border:1px solid #000;padding:5px;">FG ID/P tracker</th>
          <th style="border:1px solid #000;padding:5px;">Recruiter/CLO Spoc</th>
          <th style="border:1px solid #000;padding:5px;">Candidate Full Name</th>
          <th style="border:1px solid #000;padding:5px;">Diversity</th>
          <th style="border:1px solid #000;padding:5px;">Vendor</th>
          <th style="border:1px solid #000;padding:5px;">Sub Vendor</th>
          <th style="border:1px solid #000;padding:5px;">Years Of Experience</th>
          <th style="border:1px solid #000;padding:5px;">Skill Set</th>
          <th style="border:1px solid #000;padding:5px;">Contact Number</th>
          <th style="border:1px solid #000;padding:5px;">Email ID</th>
          <th style="border:1px solid #000;padding:5px;">Current Organization</th>
          <th style="border:1px solid #000;padding:5px;">Position Location</th>
          <th style="border:1px solid #000;padding:5px;">Candidate Current Location</th>
          <th style="border:1px solid #000;padding:5px;">Candidate Prefered Location</th>
          <th style="border:1px solid #000;padding:5px;">Notice Period</th>
          <th style="border:1px solid #000;padding:5px;">Current CTC</th>
          <th style="border:1px solid #000;padding:5px;">Expected CTC</th>
        </tr>
      </thead>
      <tbody>
        <tr>${Array.from({ length: 18 }, () => '<td style="border:1px solid #000;padding:5px;">&nbsp;</td>').join('')}</tr>
      </tbody>
    </table>
  </div>

  <table style="width:100%;border-collapse:collapse;table-layout:fixed;margin:0 0 8px;">
    <tbody>
      <tr style="background-color:#c5dced;">
        <th style="width:58%;border:1px solid #000;padding:4px;text-align:left;">Checkpoint</th>
        <th style="border:1px solid #000;padding:4px;text-align:left;">Response</th>
      </tr>
      <tr><td style="border:1px solid #000;padding:4px;"><strong>Submission Date<span style="color:#d00;">*</span></strong></td><td style="border:1px solid #000;padding:4px;">&nbsp;</td></tr>
      <tr>
        <td style="border:1px solid #000;padding:4px;"><strong>Full Name of the Candidate (As per Adhar card)<span style="color:#d00;">*</span></strong></td>
        <td style="border:1px solid #000;padding:0;">
          <table style="width:100%;border-collapse:collapse;text-align:center;">
            <tbody>
              <tr>
                <th style="width:42%;border:1px solid #000;background-color:#ffff00;padding:4px;">First Name<span style="color:#d00;">*</span></th>
                <th style="width:29%;border:1px solid #000;background-color:#ffff00;padding:4px;">Middle Name</th>
                <th style="width:29%;border:1px solid #000;background-color:#ffff00;padding:4px;">Last Name<span style="color:#d00;">*</span></th>
              </tr>
              <tr><td style="border:1px solid #000;padding:5px;">&nbsp;</td><td style="border:1px solid #000;padding:5px;">&nbsp;</td><td style="border:1px solid #000;padding:5px;">&nbsp;</td></tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr><td style="border:1px solid #000;padding:4px;"><strong>Contact number<span style="color:#d00;">*</span></strong></td><td style="border:1px solid #000;padding:4px;">&nbsp;</td></tr>
      <tr><td style="border:1px solid #000;padding:4px;"><strong>Alternate Contact Number</strong></td><td style="border:1px solid #000;padding:4px;">&nbsp;</td></tr>
      <tr><td style="border:1px solid #000;padding:4px;"><strong>Email ID<span style="color:#d00;">*</span></strong></td><td style="border:1px solid #000;padding:4px;">&nbsp;</td></tr>
      <tr><td style="border:1px solid #000;padding:4px;"><strong>Alternate Email ID</strong></td><td style="border:1px solid #000;padding:4px;">&nbsp;</td></tr>
      <tr><td style="border:1px solid #000;padding:4px;"><strong>Candidate Current Location<span style="color:#d00;">*</span></strong></td><td style="border:1px solid #000;padding:4px;">&nbsp;</td></tr>
      <tr><td style="border:1px solid #000;padding:4px;"><strong>Pan Card (Last 5 Digits)</strong></td><td style="border:1px solid #000;padding:4px;">&nbsp;</td></tr>
      <tr><td style="border:1px solid #000;padding:4px;"><strong>DOB (DD/MM/YY)<span style="color:#d00;">*</span></strong></td><td style="border:1px solid #000;padding:4px;">&nbsp;</td></tr>
      <tr><td style="border:1px solid #000;padding:4px;"><strong>Skill/Technology</strong></td><td style="border:1px solid #000;padding:4px;">&nbsp;</td></tr>
      <tr>
        <td style="border:1px solid #000;padding:4px;"><strong>Highest Educational detail with University Name (NOT ONLY COLLEGE NAME), Degree and year of passing MM/YY<span style="color:#d00;">*</span></strong></td>
        <td style="border:1px solid #000;padding:0;">
          <table style="width:100%;border-collapse:collapse;text-align:center;">
            <tbody>
              <tr>
                <th style="width:54%;border:1px solid #000;background-color:#ffff00;padding:4px;">Highest Educational detail (stream/subject)</th>
                <th style="width:23%;border:1px solid #000;background-color:#ffff00;padding:4px;">University Name</th>
                <th style="width:23%;border:1px solid #000;background-color:#ffff00;padding:4px;">Year of passing MM/YY<span style="color:#d00;">*</span></th>
              </tr>
              <tr><td style="border:1px solid #000;padding:5px;">&nbsp;</td><td style="border:1px solid #000;padding:5px;">&nbsp;</td><td style="border:1px solid #000;padding:5px;">&nbsp;</td></tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr><td style="border:1px solid #000;padding:4px;"><strong>CGPA/Percentage<span style="color:#d00;">*</span></strong></td><td style="border:1px solid #000;padding:4px;">&nbsp;</td></tr>
      <tr><td style="border:1px solid #000;padding:4px;"><strong>Total years of experience<span style="color:#d00;">*</span></strong></td><td style="border:1px solid #000;padding:4px;">&nbsp;</td></tr>
      <tr><td style="border:1px solid #000;padding:4px;"><strong>Relevant experience<span style="color:#d00;">*</span></strong></td><td style="border:1px solid #000;padding:4px;">&nbsp;</td></tr>
      <tr>
        <td style="border:1px solid #000;padding:4px;"><strong>Current Pipeline Offers and Interviews?</strong></td>
        <td style="border:1px solid #000;padding:0;">
          <table style="width:100%;border-collapse:collapse;text-align:left;">
            <tbody>
              <tr>
                <th style="width:54%;border:1px solid #000;background-color:#ffff00;padding:5px;">Pipeline Interviews</th>
                <th style="width:23%;border:1px solid #000;background-color:#ffff00;padding:5px;">Pipeline Offers</th>
                <th style="width:23%;border:1px solid #000;background-color:#ffff00;padding:5px;">Pipeline CTC</th>
              </tr>
              <tr><td style="border:1px solid #000;padding:5px;">&nbsp;</td><td style="border:1px solid #000;padding:5px;">&nbsp;</td><td style="border:1px solid #000;padding:5px;">&nbsp;</td></tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td style="border:1px solid #000;padding:4px;"><strong>Current CTC<span style="color:#d00;">*</span> and Expected CTC<span style="color:#d00;">*</span></strong></td>
        <td style="border:1px solid #000;padding:0;">
          <table style="width:100%;border-collapse:collapse;">
            <tbody>
              <tr><th style="width:55%;border:1px solid #000;background-color:#ffff00;padding:4px;text-align:left;">Current CTC<span style="color:#d00;">*</span></th><td style="border:1px solid #000;padding:4px;">&nbsp;</td></tr>
              <tr><th style="border:1px solid #000;background-color:#ffff00;padding:4px;text-align:left;">Expected/Offered CTC<span style="color:#d00;">*</span></th><td style="border:1px solid #000;padding:4px;">&nbsp;</td></tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td style="border:1px solid #000;padding:4px;"><strong>Current Payroll company name<span style="color:#d00;">*</span></strong></td>
        <td style="border:1px solid #000;padding:0;">
          <table style="width:100%;border-collapse:collapse;">
            <tbody>
              <tr><th style="width:55%;border:1px solid #000;background-color:#ffff00;padding:4px;text-align:left;">Current company name</th><td style="border:1px solid #000;padding:4px;">&nbsp;</td></tr>
              <tr><th style="border:1px solid #000;background-color:#ffff00;padding:4px;text-align:left;">Current Payroll company name</th><td style="border:1px solid #000;padding:4px;">&nbsp;</td></tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr><td style="border:1px solid #000;padding:4px;"><strong>Availability/Notice Period to Join</strong></td><td style="border:1px solid #000;padding:4px;">&nbsp;</td></tr>
    </tbody>
  </table>
</div>`.trim();
const escapeEmailTemplateValue = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const createSubmissionEmailBody = (submission: Submission, job: Job | null, applicant: Applicant | null): string => {
  const values: Record<string, string> = {
    '{{APPLICANT_NAME}}': escapeEmailTemplateValue(applicant?.name || submission.applicantName || 'Not specified'),
    '{{APPLICANT_PHONE}}': escapeEmailTemplateValue(applicant?.phone || 'Not provided'),
    '{{JOB_TITLE}}': escapeEmailTemplateValue(job?.title || submission.jobTitle || 'Not specified'),
    '{{JOB_LOCATION}}': escapeEmailTemplateValue(job?.location || 'Not specified'),
    '{{JOB_CREATOR}}': escapeEmailTemplateValue(job?.createdBy || 'Not recorded')
  };

  return DEFAULT_EMAIL_BODY.replace(/\{\{APPLICANT_NAME\}\}|\{\{APPLICANT_PHONE\}\}|\{\{JOB_TITLE\}\}|\{\{JOB_LOCATION\}\}|\{\{JOB_CREATOR\}\}/g, (placeholder) => values[placeholder]);
};
const BUSINESS_UNIT_OPTIONS = [
  'Ampcus Tech Pvt Ltd.',
  'Cloud & AI Practice',
  'Core Engineering',
  'Fintech & Enterprise',
  'Global Operations'
];

export const ClientSubmission: React.FC = () => {
  const { selectedId, navigate } = useAppStore();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [selectedDocumentIndexes, setSelectedDocumentIndexes] = useState<number[]>([]);
  const [defaultResumeIndex, setDefaultResumeIndex] = useState<number | null>(null);
  const [additionalDocuments, setAdditionalDocuments] = useState<File[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [toRecipients, setToRecipients] = useState<string[]>([]);
  const [ccRecipients, setCcRecipients] = useState<string[]>([]);
  const [bccRecipients, setBccRecipients] = useState<string[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState(DEFAULT_EMAIL_BODY);
  const [selectedSalutation, setSelectedSalutation] = useState('hi-first');
  const [selectedMailingTheme, setSelectedMailingTheme] = useState('');
  const [spellcheckEnabled, setSpellcheckEnabled] = useState(true);
  const [copiedFormatting, setCopiedFormatting] = useState<EmailTextFormatting | null>(null);
  const [specialCharacterOpen, setSpecialCharacterOpen] = useState(false);
  const [emailToolbarPanel, setEmailToolbarPanel] = useState<EmailToolbarPanel>(null);
  const [findQuery, setFindQuery] = useState('');
  const [replacementText, setReplacementText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [editorNotice, setEditorNotice] = useState('');
  const [selectedFont, setSelectedFont] = useState('');
  const [selectedFontSize, setSelectedFontSize] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('Normal');
  const [selectedStyle, setSelectedStyle] = useState('Styles');
  const [textColor, setTextColor] = useState('#252525');
  const [highlightColor, setHighlightColor] = useState('#ffff00');
  const emailEditorRef = useRef<HTMLDivElement>(null);
  const savedEmailSelectionRef = useRef<Range | null>(null);
  const additionalDocumentsInputRef = useRef<HTMLInputElement>(null);
  const [recipientOpen, setRecipientOpen] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [createContactOpen, setCreateContactOpen] = useState(false);
  const [customContacts, setCustomContacts] = useState<User[]>([]);
  const [contactFirstName, setContactFirstName] = useState('');
  const [contactLastName, setContactLastName] = useState('');
  const [contactDesignation, setContactDesignation] = useState('');
  const [contactOfficeNumber, setContactOfficeNumber] = useState('');
  const [contactMobileNumber, setContactMobileNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSecondaryEmail, setContactSecondaryEmail] = useState('');
  const [contactAddress1, setContactAddress1] = useState('');
  const [contactAddress2, setContactAddress2] = useState('');
  const [contactCountry, setContactCountry] = useState('India');
  const [contactState, setContactState] = useState('Maharashtra');
  const [contactCity, setContactCity] = useState('');
  const [contactZipCode, setContactZipCode] = useState('');
  const [contactLinkedinUrl, setContactLinkedinUrl] = useState('');
  const [contactFacebookUrl, setContactFacebookUrl] = useState('');
  const [contactTwitterUrl, setContactTwitterUrl] = useState('');
  const [contactGooglePlusUrl, setContactGooglePlusUrl] = useState('');
  const [contactStatus, setContactStatus] = useState('');
  const [contactGroups, setContactGroups] = useState<string[]>([]);
  const [contactGroupSearch, setContactGroupSearch] = useState('');
  const [contactGroupOpen, setContactGroupOpen] = useState(false);
  const [contactAbout, setContactAbout] = useState('');
  const [contactOwners, setContactOwners] = useState<string[]>([]);
  const [ownershipDropdownOpen, setOwnershipDropdownOpen] = useState(false);
  const [contactOrganizationLevel, setContactOrganizationLevel] = useState(true);
  const [contactBusinessUnits, setContactBusinessUnits] = useState<string[]>(BUSINESS_UNIT_OPTIONS);
  const [businessUnitDropdownOpen, setBusinessUnitDropdownOpen] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    if (!selectedId) {
      setLoadError('Submission details are unavailable.');
      return;
    }

    Promise.all([ApiService.getSubmissions(), ApiService.getJobs(), ApiService.getApplicants()])
      .then(([submissions, jobs, applicants]) => {
        if (!isCurrent) return;
        const selectedSubmission = submissions.find((item) => item.id === selectedId);
        if (!selectedSubmission) {
          setLoadError('Submission details are unavailable.');
          return;
        }

        const selectedJob = jobs.find((item) => item.id === selectedSubmission.jobId) || null;
        const selectedApplicant = applicants.find((item) => item.id === selectedSubmission.applicantId) || null;
        setSubmission(selectedSubmission);
        setJob(selectedJob);
        setApplicant(selectedApplicant);
        setToRecipients(selectedApplicant?.email ? [selectedApplicant.email] : []);
        setEmailSubject(`A new profile has been submitted for ${selectedJob?.title || selectedSubmission.jobTitle || 'the selected job'}`);
        setEmailBody(createSubmissionEmailBody(selectedSubmission, selectedJob, selectedApplicant));
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        setLoadError(error instanceof Error ? error.message : 'Unable to load submission details.');
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedId]);

  useEffect(() => {
    ApiService.getAllUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    const applicantDocuments = applicant?.documents || [];
    setAdditionalDocuments([]);
    setSelectedDocumentIndexes(applicantDocuments.map((_, index) => index));
    const resumeIndex = applicantDocuments.findIndex((document) => /resume/i.test(document.type));
    setDefaultResumeIndex(resumeIndex >= 0 ? resumeIndex : null);
  }, [applicant]);

  useEffect(() => {
    if (emailEditorRef.current && emailEditorRef.current.innerHTML !== emailBody) {
      emailEditorRef.current.innerHTML = emailBody;
    }
  }, [emailBody, submission]);

  const rememberEmailSelection = () => {
    const editor = emailEditorRef.current;
    const selection = window.getSelection();
    if (editor && selection?.rangeCount && editor.contains(selection.anchorNode)) {
      savedEmailSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  const applyEmailCommand = (command: string, value?: string) => {
    const editor = emailEditorRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    const savedRange = savedEmailSelectionRef.current;
    if (selection && savedRange && editor.contains(savedRange.commonAncestorContainer)) {
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }
    document.execCommand(command, false, value);
    setEmailBody(editor.innerHTML);
    rememberEmailSelection();
  };

  const applyOrCopyFormatting = () => {
    const editor = emailEditorRef.current;
    if (!editor) return;

    if (!copiedFormatting) {
      const selection = window.getSelection();
      const node = selection?.anchorNode;
      const element = node?.nodeType === Node.ELEMENT_NODE ? node as Element : node?.parentElement;
      const style = window.getComputedStyle(element && editor.contains(element) ? element : editor);
      setCopiedFormatting({
        backgroundColor: style.backgroundColor,
        color: style.color,
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontStyle: style.fontStyle,
        fontWeight: style.fontWeight,
        textDecoration: style.textDecoration
      });
      rememberEmailSelection();
      return;
    }

    const range = savedEmailSelectionRef.current;
    if (!range || range.collapsed || !editor.contains(range.commonAncestorContainer)) return;
    const span = document.createElement('span');
    Object.assign(span.style, copiedFormatting);
    span.append(range.extractContents());
    range.insertNode(span);

    const selection = window.getSelection();
    const appliedRange = document.createRange();
    appliedRange.selectNodeContents(span);
    selection?.removeAllRanges();
    selection?.addRange(appliedRange);
    savedEmailSelectionRef.current = appliedRange.cloneRange();
    setEmailBody(editor.innerHTML);
    setCopiedFormatting(null);
  };

  const findEmailText = () => {
    const editor = emailEditorRef.current;
    const query = findQuery.trim();
    if (!editor || !query) return;

    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const normalizedQuery = query.toLocaleLowerCase();
    let node = walker.nextNode();
    while (node) {
      const text = node.textContent || '';
      const index = text.toLocaleLowerCase().indexOf(normalizedQuery);
      if (index >= 0) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + query.length);
        editor.focus();
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        savedEmailSelectionRef.current = range.cloneRange();
        return;
      }
      node = walker.nextNode();
    }
    setEditorNotice('Text not found.');
  };

  const replaceEmailText = () => {
    const editor = emailEditorRef.current;
    const query = findQuery.trim();
    if (!editor || !query) return;

    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    let node = walker.nextNode();
    while (node) {
      nodes.push(node as Text);
      node = walker.nextNode();
    }

    let replacements = 0;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matchPattern = new RegExp(escapedQuery, 'gi');
    nodes.forEach((textNode) => {
      const text = textNode.textContent || '';
      replacements += text.match(matchPattern)?.length || 0;
      textNode.textContent = text.replace(matchPattern, replacementText);
    });

    if (!replacements) {
      setEditorNotice('Text not found.');
      return;
    }
    setEditorNotice(`${replacements} replacement${replacements === 1 ? '' : 's'} made.`);
    setEmailBody(editor.innerHTML);
    savedEmailSelectionRef.current = null;
  };

  const importAdditionalDocuments = (files: FileList | null) => {
    if (!files?.length) return;
    const existingFiles = new Set(additionalDocuments.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
    const newFiles = Array.from(files).filter((file) =>
      !existingFiles.has(`${file.name}-${file.size}-${file.lastModified}`)
    );
    if (!newFiles.length) return;

    const firstNewDocumentIndex = (applicant?.documents?.length || 0) + additionalDocuments.length;
    setAdditionalDocuments((current) => [...current, ...newFiles]);
    setSelectedDocumentIndexes((current) => [
      ...new Set([...current, ...newFiles.map((_, index) => firstNewDocumentIndex + index)])
    ]);

    if (defaultResumeIndex === null) {
      const resumeIndex = newFiles.findIndex((file) => /resume|cv/i.test(file.name));
      if (resumeIndex >= 0) setDefaultResumeIndex(firstNewDocumentIndex + resumeIndex);
    }
  };

  const updateSalutation = (value: string) => {
    setSelectedSalutation(value);
    const option = SALUTATION_OPTIONS.find((item) => item.value === value);
    if (!option) return;

    const parsedBody = new DOMParser().parseFromString(emailBody, 'text/html');
    let greetingParagraph = parsedBody.body.querySelector('p');
    if (!greetingParagraph) {
      greetingParagraph = parsedBody.createElement('p');
      parsedBody.body.prepend(greetingParagraph);
    }
    greetingParagraph.textContent = option.greeting;
    setEmailBody(parsedBody.body.innerHTML);
  };

  const applicantDocuments = applicant?.documents || [];
  const documentRows = [
    ...applicantDocuments.map((document, index) => ({
      ...document,
      index,
      isResume: /resume/i.test(document.type)
    })),
    ...additionalDocuments.map((file, index) => {
      const sizeInKilobytes = file.size / 1024;
      const extension = file.name.includes('.') ? file.name.split('.').pop()?.toUpperCase() : '';
      return {
        name: file.name,
        size: `${sizeInKilobytes < 10 ? sizeInKilobytes.toFixed(1) : Math.round(sizeInKilobytes)} KB`,
        date: new Date(file.lastModified).toLocaleDateString(),
        type: extension ? `${extension} file` : file.type || 'Document',
        index: applicantDocuments.length + index,
        isResume: /resume|cv/i.test(file.name)
      };
    })
  ];

  if (loadError) {
    return <div className="rounded-lg border border-red-200 bg-white p-5 text-sm text-red-700">{loadError}</div>;
  }

  if (!submission) {
    return <div className="p-5 text-sm text-[#667085]">Loading submission...</div>;
  }

  return (
    <div className="min-h-full bg-[#F1F2F4] p-4 text-[#344054] md:p-6">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('job-detail', submission.jobId)}
          className="rounded-md border border-[#D0D5DD] bg-white p-2 text-[#475467] hover:bg-[#F9FAFB]"
          aria-label="Back to job details"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-semibold text-[#344054]">Client Submission</h1>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,3fr)_320px]">
        <section className="overflow-hidden border border-[#D0D5DD] bg-white">
          <div className="flex flex-nowrap items-center gap-1 overflow-x-auto border-b border-[#EAECF0] bg-[#F9FAFB] px-3 py-2">
            <select
              className={`${fieldClassName} h-[30px] w-[210px] shrink-0 border-[#E65B25] bg-white text-xs focus:border-[#E65B25]`}
              defaultValue=""
              aria-label="Select Table"
            >
              <option value="">Select Table</option>
              <option value="accept-reject">ACCEPT/REJECT</option>
              <option value="applicant">APPLICANT</option>
              <option value="client">CLIENT</option>
              <option value="client-contact">CLIENT CONTACT</option>
              <option value="job-posting">JOB POSTING</option>
              <option value="submissions">SUBMISSIONS</option>
            </select>
            <select
              className={`${fieldClassName} h-[30px] w-[210px] shrink-0 border-[#E65B25] bg-white text-xs focus:border-[#E65B25]`}
              defaultValue="mail-description"
              aria-label="Mail Description"
            >
              <option value="mail-description">Mail Description</option>
            </select>
            <select
              className={`${fieldClassName} h-[30px] w-[145px] shrink-0 border-[#E65B25] bg-white text-xs focus:border-[#E65B25]`}
              defaultValue=""
              aria-label="Description destination"
            >
              <option value="">Select</option>
              <option value="add-to-subject">ADD TO SUBJECT</option>
              <option value="add-to-body">ADD TO BODY</option>
            </select>
            <button type="button" className="h-[28px] w-[40px] shrink-0 rounded bg-[#3478F6] px-0 text-[11px] font-medium text-white hover:bg-[#2868DC]">
              Add
            </button>
          </div>

          <div className="border-b border-[#EAECF0] px-3 py-2">
            <div className="flex min-h-[28px] items-center">
              <span className="mr-3 w-6 shrink-0 text-xs text-[#667085]">To</span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRecipientOpen((open) => !open)}
                  className="flex h-7 min-w-[260px] max-w-[420px] items-center justify-between rounded border border-[#D5DCE5] bg-white px-2 text-xs text-[#344054] outline-none focus:border-blue-500"
                  aria-label="Recipient"
                  aria-expanded={recipientOpen}
                >
                  <span className="truncate">{toRecipients[0] || 'Select recipient'}</span>
                  <span className="ml-2 text-[9px] text-[#667085]">▾</span>
                </button>

                {recipientOpen && (
                  <div className="absolute left-0 top-[31px] z-40 w-[360px] max-w-[calc(100vw-40px)] rounded-md border border-[#D5DCE5] bg-white shadow-xl">
                    <div className="flex items-center gap-2 border-b border-[#EAECF0] px-2 py-2">
                      <input
                        autoFocus
                        value={recipientSearch}
                        onChange={(event) => setRecipientSearch(event.target.value)}
                        placeholder="Search recipients"
                        className="h-7 min-w-0 flex-1 rounded border border-[#D5DCE5] px-2 text-xs outline-none focus:border-blue-500"
                      />
                      <Search className="h-4 w-4 shrink-0 text-[#667085]" />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setRecipientOpen(false);
                        setCreateContactOpen(true);
                        setContactFirstName('');
                        setContactLastName('');
                        setContactDesignation('');
                        setContactOfficeNumber('');
                        setContactMobileNumber('');
                        setContactEmail('');
                        setContactSecondaryEmail('');
                      }}
                      className="block w-full px-3 py-2 text-left text-xs text-[#344054] hover:bg-[#F2F6FC]"
                    >
                      --Create New Contact--
                    </button>

                    <div className="max-h-52 overflow-y-auto py-1">
                      {[...users, ...customContacts]
                        .filter((user) => {
                          const query = recipientSearch.trim().toLowerCase();
                          return !query || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
                        })
                        .map((user) => (
                          <button
                            type="button"
                            key={user.id}
                            onClick={() => {
                              setToRecipients([user.email]);
                              setRecipientOpen(false);
                              setRecipientSearch('');
                            }}
                            className="block w-full px-3 py-2 text-left text-xs text-[#344054] hover:bg-[#F2F6FC]"
                          >
                            {user.name} ({user.email})
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              <button type="button" onClick={() => setShowCc((open) => !open)} className="ml-2 px-1 text-xs text-blue-600">CC</button>
              <button type="button" onClick={() => setShowBcc((open) => !open)} className="px-1 text-xs text-blue-600">BCC</button>
            </div>

            {showCc && (
              <div className="mt-2 flex items-center">
                <span className="mr-3 w-6 shrink-0 text-xs text-[#667085]">CC</span>
                <select
                  className="h-7 min-w-[260px] max-w-[420px] rounded border border-[#D5DCE5] bg-white px-2 text-xs text-[#344054] outline-none focus:border-blue-500"
                  value=""
                  onChange={(event) => {
                    if (event.target.value && !ccRecipients.includes(event.target.value)) {
                      setCcRecipients((current) => [...current, event.target.value]);
                    }
                  }}
                  aria-label="CC recipient"
                >
                  <option value="">Select CC recipient</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.email}>{user.name} ({user.email})</option>
                  ))}
                </select>
                <div className="ml-2 flex flex-wrap gap-1">
                  {ccRecipients.map((email) => (
                    <button key={email} type="button" onClick={() => setCcRecipients((current) => current.filter((item) => item !== email))} className="rounded bg-[#EDF3FF] px-2 py-1 text-[10px] text-[#344054]" title="Remove CC recipient">{email} ×</button>
                  ))}
                </div>
              </div>
            )}

            {showBcc && (
              <div className="mt-2 flex items-center">
                <span className="mr-3 w-6 shrink-0 text-xs text-[#667085]">BCC</span>
                <select
                  className="h-7 min-w-[260px] max-w-[420px] rounded border border-[#D5DCE5] bg-white px-2 text-xs text-[#344054] outline-none focus:border-blue-500"
                  value=""
                  onChange={(event) => {
                    if (event.target.value && !bccRecipients.includes(event.target.value)) {
                      setBccRecipients((current) => [...current, event.target.value]);
                    }
                  }}
                  aria-label="BCC recipient"
                >
                  <option value="">Select BCC recipient</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.email}>{user.name} ({user.email})</option>
                  ))}
                </select>
                <div className="ml-2 flex flex-wrap gap-1">
                  {bccRecipients.map((email) => (
                    <button key={email} type="button" onClick={() => setBccRecipients((current) => current.filter((item) => item !== email))} className="rounded bg-[#EDF3FF] px-2 py-1 text-[10px] text-[#344054]" title="Remove BCC recipient">{email} ×</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-b border-[#EAECF0] p-2">
            <input
              className="w-full bg-[#F9FAFB] px-2 py-1.5 text-xs outline-none"
              value={emailSubject}
              onChange={(event) => setEmailSubject(event.target.value)}
              aria-label="Subject"
            />
          </div>

          <div className="relative flex flex-wrap items-center gap-px border-b border-[#D5DCE5] bg-[#F5F5F5] px-2 py-1">
            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                rememberEmailSelection();
              }}
              onClick={applyOrCopyFormatting}
              className={`${toolbarButtonClassName} ${copiedFormatting ? 'bg-[#DCE7F5]' : ''}`}
              title={copiedFormatting ? 'Apply copied formatting' : 'Copy formatting'}
              aria-label={copiedFormatting ? 'Apply copied formatting' : 'Copy formatting'}
              aria-pressed={copiedFormatting !== null}
            >
              <Paintbrush className="h-3.5 w-3.5" />
            </button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('cut')} className={toolbarButtonClassName} title="Cut"><Scissors className="h-3.5 w-3.5" /></button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('copy')} className={toolbarButtonClassName} title="Copy"><Copy className="h-3.5 w-3.5" /></button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('paste')} className={toolbarButtonClassName} title="Paste"><ClipboardPaste className="h-3.5 w-3.5" /></button>
            <span className="mx-1 h-4 w-px bg-[#D5DCE5]" />
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('undo')} className={toolbarButtonClassName} title="Undo"><Undo2 className="h-3.5 w-3.5" /></button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('redo')} className={toolbarButtonClassName} title="Redo"><Redo2 className="h-3.5 w-3.5" /></button>
            <span className="mx-1 h-4 w-px bg-[#D5DCE5]" />
            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                rememberEmailSelection();
              }}
              onClick={() => {
                setEditorNotice('');
                setEmailToolbarPanel((panel) => panel === 'find' ? null : 'find');
              }}
              className={toolbarButtonClassName}
              title="Find"
              aria-label="Find"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                rememberEmailSelection();
              }}
              onClick={() => {
                setEditorNotice('');
                setEmailToolbarPanel((panel) => panel === 'replace' ? null : 'replace');
              }}
              className={toolbarButtonClassName}
              title="Replace"
              aria-label="Replace"
            >
              <Replace className="h-3.5 w-3.5" />
            </button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('selectAll')} className={toolbarButtonClassName} title="Select all"><MousePointer2 className="h-3.5 w-3.5" /></button>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                const enabled = !spellcheckEnabled;
                setSpellcheckEnabled(enabled);
                if (emailEditorRef.current) emailEditorRef.current.spellcheck = enabled;
              }}
              className={`${toolbarButtonClassName} ${spellcheckEnabled ? 'bg-[#E9EDF2]' : ''}`}
              title="Toggle spell check"
              aria-pressed={spellcheckEnabled}
            >
              <SpellCheck className="h-3.5 w-3.5" />
            </button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('removeFormat')} className={toolbarButtonClassName} title="Remove formatting"><Eraser className="h-3.5 w-3.5" /></button>
            <span className="mx-1 h-4 w-px bg-[#D5DCE5]" />
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('bold')} className={toolbarButtonClassName} title="Bold"><Bold className="h-3.5 w-3.5" /></button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('italic')} className={toolbarButtonClassName} title="Italic"><Italic className="h-3.5 w-3.5" /></button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('underline')} className={toolbarButtonClassName} title="Underline"><Underline className="h-3.5 w-3.5" /></button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('strikeThrough')} className={toolbarButtonClassName} title="Strikethrough"><Strikethrough className="h-3.5 w-3.5" /></button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('subscript')} className={toolbarButtonClassName} title="Subscript"><Subscript className="h-3.5 w-3.5" /></button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('superscript')} className={toolbarButtonClassName} title="Superscript"><Superscript className="h-3.5 w-3.5" /></button>
            <span className="mx-1 h-4 w-px bg-[#D5DCE5]" />
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('insertOrderedList')} className={toolbarButtonClassName} title="Numbered list"><ListOrdered className="h-3.5 w-3.5" /></button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('insertUnorderedList')} className={toolbarButtonClassName} title="Bulleted list"><List className="h-3.5 w-3.5" /></button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('outdent')} className={toolbarButtonClassName} title="Decrease indent">⇤</button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('indent')} className={toolbarButtonClassName} title="Increase indent">⇥</button>
            <div className="relative">
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setSpecialCharacterOpen((open) => !open)}
                className={toolbarButtonClassName}
                title="Insert special character"
                aria-label="Insert special character"
                aria-expanded={specialCharacterOpen}
              >
                Ω
              </button>
              {specialCharacterOpen && (
                <div className="absolute left-0 top-full z-50 grid w-40 grid-cols-6 gap-1 rounded border border-[#D5DCE5] bg-white p-2 shadow-lg">
                  {['©', '®', '™', '€', '£', '¥', '§', '¶', '•', '…', '—', '–', '“', '”', '‘', '’', '°', '±', '×', '÷', 'Ω', '→', '←', '✓'].map((character) => (
                    <button
                      key={character}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        applyEmailCommand('insertText', character);
                        setSpecialCharacterOpen(false);
                      }}
                      className="h-6 w-6 rounded text-xs hover:bg-[#E9EDF2]"
                      aria-label={`Insert ${character}`}
                    >
                      {character}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setEditorNotice('');
                setEmailToolbarPanel((panel) => panel === 'link' ? null : 'link');
              }}
              className={toolbarButtonClassName}
              title="Insert link"
              aria-label="Insert link"
            >
              <Link2 className="h-3.5 w-3.5" />
            </button>
            {emailToolbarPanel && (
              <div className="absolute left-2 top-full z-50 w-64 rounded border border-[#D5DCE5] bg-white p-2 shadow-lg" aria-label={`${emailToolbarPanel} toolbar`}>
                {emailToolbarPanel === 'find' && (
                  <div className="flex items-center gap-1">
                    <input
                      autoFocus
                      value={findQuery}
                      onChange={(event) => {
                        setFindQuery(event.target.value);
                        setEditorNotice('');
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') findEmailText();
                      }}
                      className="h-7 min-w-0 flex-1 rounded border border-[#D5DCE5] px-2 text-xs outline-none focus:border-blue-500"
                      aria-label="Find text"
                    />
                    <button type="button" onClick={findEmailText} className="h-7 rounded bg-blue-500 px-2 text-xs text-white">Find</button>
                  </div>
                )}
                {emailToolbarPanel === 'replace' && (
                  <div className="space-y-1.5">
                    <input
                      autoFocus
                      value={findQuery}
                      onChange={(event) => {
                        setFindQuery(event.target.value);
                        setEditorNotice('');
                      }}
                      className="h-7 w-full rounded border border-[#D5DCE5] px-2 text-xs outline-none focus:border-blue-500"
                      aria-label="Find text to replace"
                    />
                    <input
                      value={replacementText}
                      onChange={(event) => setReplacementText(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') replaceEmailText();
                      }}
                      className="h-7 w-full rounded border border-[#D5DCE5] px-2 text-xs outline-none focus:border-blue-500"
                      aria-label="Replacement text"
                    />
                    <button type="button" onClick={replaceEmailText} className="h-7 rounded bg-blue-500 px-2 text-xs text-white">Replace all</button>
                  </div>
                )}
                {emailToolbarPanel === 'link' && (
                  <div className="flex items-center gap-1">
                    <input
                      autoFocus
                      value={linkUrl}
                      onChange={(event) => setLinkUrl(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && linkUrl.trim()) {
                          applyEmailCommand('createLink', linkUrl.trim());
                          setEmailToolbarPanel(null);
                        }
                      }}
                      placeholder="https://"
                      className="h-7 min-w-0 flex-1 rounded border border-[#D5DCE5] px-2 text-xs outline-none focus:border-blue-500"
                      aria-label="Link URL"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!linkUrl.trim()) return;
                        applyEmailCommand('createLink', linkUrl.trim());
                        setEmailToolbarPanel(null);
                      }}
                      className="h-7 rounded bg-blue-500 px-2 text-xs text-white"
                    >
                      Insert
                    </button>
                  </div>
                )}
                {editorNotice && <p className="mt-1 text-[10px] text-[#667085]" role="status">{editorNotice}</p>}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-px border-b border-[#D5DCE5] bg-[#F5F5F5] px-2 py-1">
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setEditorNotice('');
                setEmailToolbarPanel((panel) => panel === 'link' ? null : 'link');
              }}
              className={toolbarButtonClassName}
              title="Insert link"
            >
              <Link2 className="h-3.5 w-3.5" />
            </button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('unlink')} className={toolbarButtonClassName} title="Remove link"><Unlink className="h-3.5 w-3.5" /></button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('insertHTML', '<table border="1"><tbody><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table><p></p>')} className={toolbarButtonClassName} title="Insert table">▦</button>
            <span className="mx-1 h-4 w-px bg-[#D5DCE5]" />
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('justifyLeft')} className={toolbarButtonClassName} title="Align left"><AlignLeft className="h-3.5 w-3.5" /></button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('justifyCenter')} className={toolbarButtonClassName} title="Align center"><AlignCenter className="h-3.5 w-3.5" /></button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('justifyRight')} className={toolbarButtonClassName} title="Align right"><AlignRight className="h-3.5 w-3.5" /></button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyEmailCommand('justifyFull')} className={toolbarButtonClassName} title="Justify"><AlignJustify className="h-3.5 w-3.5" /></button>
            <span className="mx-1 h-4 w-px bg-[#D5DCE5]" />
            <label className="flex h-6 items-center gap-1 rounded px-1 text-[11px] hover:bg-[#E9EDF2]" title="Text color">
              <span className="border-b-2 border-current font-semibold" style={{ color: textColor }}>A</span>
              <input
                type="color"
                value={textColor}
                onMouseDown={rememberEmailSelection}
                onChange={(event) => {
                  setTextColor(event.target.value);
                  applyEmailCommand('foreColor', event.target.value);
                }}
                aria-label="Text color"
                className="h-4 w-4 cursor-pointer border-0 p-0"
              />
            </label>
            <label className="flex h-6 items-center gap-1 rounded px-1 text-[11px] hover:bg-[#E9EDF2]" title="Highlight color">
              <span className="font-semibold">A</span>
              <input
                type="color"
                value={highlightColor}
                onMouseDown={rememberEmailSelection}
                onChange={(event) => {
                  setHighlightColor(event.target.value);
                  applyEmailCommand('hiliteColor', event.target.value);
                }}
                aria-label="Highlight color"
                className="h-4 w-4 cursor-pointer border-0 p-0"
              />
            </label>
            <span className="mx-1 h-4 w-px bg-[#D5DCE5]" />
            <select
              value={selectedStyle}
              onMouseDown={rememberEmailSelection}
              onChange={(event) => {
                setSelectedStyle(event.target.value);
                if (event.target.value !== 'Styles') applyEmailCommand('formatBlock', event.target.value);
              }}
              className={`${fieldClassName} h-6 w-[90px]`}
              aria-label="Styles"
            >
              <option value="Styles">Styles</option>
              <option value="p">Normal</option>
              <option value="h1">Title</option>
              <option value="h2">Subtitle</option>
              <option value="blockquote">Quote</option>
            </select>
            <select
              value={selectedFormat}
              onMouseDown={rememberEmailSelection}
              onChange={(event) => {
                setSelectedFormat(event.target.value);
                applyEmailCommand('formatBlock', event.target.value);
              }}
              className={`${fieldClassName} h-6 w-[90px]`}
              aria-label="Paragraph format"
            >
              <option value="p">Normal (…)</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="pre">Formatted</option>
            </select>
            <select
              value={selectedFont}
              onMouseDown={rememberEmailSelection}
              onChange={(event) => {
                setSelectedFont(event.target.value);
                if (event.target.value) applyEmailCommand('fontName', event.target.value);
              }}
              className={`${fieldClassName} h-6 w-[80px]`}
              aria-label="Font"
            >
              <option value="">Font</option>
              {['Arial', 'Comic Sans MS', 'Courier New', 'Georgia', 'Tahoma', 'Times New Roman', 'Verdana'].map((font) => <option key={font} value={font}>{font}</option>)}
            </select>
            <select
              value={selectedFontSize}
              onMouseDown={rememberEmailSelection}
              onChange={(event) => {
                setSelectedFontSize(event.target.value);
                if (event.target.value) applyEmailCommand('fontSize', event.target.value);
              }}
              className={`${fieldClassName} h-6 w-[60px]`}
              aria-label="Font size"
            >
              <option value="">Size</option>
              <option value="1">8</option>
              <option value="2">10</option>
              <option value="3">12</option>
              <option value="4">14</option>
              <option value="5">18</option>
              <option value="6">24</option>
              <option value="7">36</option>
            </select>
          </div>

          <div
            ref={emailEditorRef}
            className="h-[280px] overflow-y-auto bg-white p-4 text-sm outline-none"
            contentEditable
            suppressContentEditableWarning
            spellCheck={spellcheckEnabled}
            onInput={(event) => setEmailBody(event.currentTarget.innerHTML)}
            onMouseUp={rememberEmailSelection}
            onKeyUp={rememberEmailSelection}
            aria-label="Email body"
            style={{ fontFamily: selectedFont || 'Arial' }}
          />

          <div className="overflow-x-auto border-t border-[#EAECF0] p-3">
            <table className="w-full min-w-[500px] text-left text-[10px] text-[#667085]">
              <thead>
                <tr className="border-b border-[#EAECF0] uppercase">
                  <th className="py-2 font-medium">Select</th>
                  <th className="py-2 font-medium">Document Title</th>
                  <th className="py-2 font-medium">Document Type</th>
                  <th className="py-2 font-medium">Default Resume</th>
                </tr>
              </thead>
              <tbody>
                {documentRows.length ? documentRows.map((document) => {
                  return (
                    <tr key={`${document.name}-${document.index}`} className="border-b border-[#EAECF0]">
                      <td className="py-2">
                        <input
                          type="checkbox"
                          checked={selectedDocumentIndexes.includes(document.index)}
                          onChange={(event) => {
                            setSelectedDocumentIndexes((current) => event.target.checked
                              ? [...current, document.index]
                              : current.filter((selectedIndex) => selectedIndex !== document.index));
                          }}
                          aria-label={`Select ${document.name}`}
                        />
                      </td>
                      <td className="py-2 pr-3 text-[#344054]">
                        <span className="font-medium">{document.name}</span>
                        <span className="ml-2 text-[#98A2B3]">{document.size} · {document.date}</span>
                      </td>
                      <td className="py-2">{document.type}</td>
                      <td className="py-2">
                        <input
                          type="radio"
                          name={`default-resume-${submission.id}`}
                          checked={defaultResumeIndex === document.index}
                          disabled={!document.isResume}
                          onChange={() => setDefaultResumeIndex(document.index)}
                          aria-label={`Set ${document.name} as default resume`}
                        />
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} className="py-3 text-center text-[#98A2B3]">
                      No documents attached to {applicant?.name || submission.applicantName}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <input
              ref={additionalDocumentsInputRef}
              type="file"
              multiple
              className="sr-only"
              aria-label="Import additional documents from local drive"
              onChange={(event) => {
                importAdditionalDocuments(event.currentTarget.files);
                event.currentTarget.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => additionalDocumentsInputRef.current?.click()}
              className="mt-3 inline-flex items-center gap-2 text-xs text-[#667085] hover:text-[#344054]"
              aria-label="Import additional documents from local drive"
              title="Import additional documents from local drive"
            >
              <span>Additional Documents</span>
              <span className="rounded border border-[#D0D5DD] p-1.5"><Plus className="h-3.5 w-3.5" /></span>
            </button>
          </div>
          <div className="flex justify-end gap-2 border-t border-[#EAECF0] bg-[#F9FAFB] px-3 py-2">
            <button
              type="button"
              onClick={() => {
                if (toRecipients.length === 0) {
                  return;
                }
                const mailParams = new URLSearchParams();
                mailParams.set('subject', emailSubject);
                if (ccRecipients.length) mailParams.set('cc', ccRecipients.join(','));
                if (bccRecipients.length) mailParams.set('bcc', bccRecipients.join(','));
                const bodyText = emailEditorRef.current?.innerText || '';
                if (bodyText.trim()) mailParams.set('body', bodyText.trim());
                window.location.href = `mailto:${toRecipients.join(',')}?${mailParams.toString()}`;
              }}
              className="h-7 rounded bg-blue-500 px-2.5 text-[11px] font-medium text-white hover:bg-blue-600"
            >
              Send
            </button>
            <button
              type="button"
              onClick={() => navigate('job-detail', submission.jobId)}
              className="h-7 rounded bg-blue-500 px-2.5 text-[11px] font-medium text-white hover:bg-blue-600"
            >
              Cancel
            </button>
          </div>
        </section>

        <aside className="border border-[#D0D5DD] bg-white p-4">
          <h2 className="mb-4 text-base font-semibold text-[#344054]">Customize Mail Body</h2>
          <div className="space-y-4">
            <label className="block space-y-1">
              <span className="text-[11px] text-blue-600">Select Client</span>
              <select
                className={`${fieldClassName} cursor-not-allowed bg-[#F2F4F7] text-[#667085]`}
                defaultValue={submission.client}
                disabled
                aria-label="Select Client"
              >
                <option value={submission.client}>{submission.client}</option>
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] text-blue-600">Select Job</span>
              <select
                className={`${fieldClassName} cursor-not-allowed bg-[#F2F4F7] text-[#667085]`}
                defaultValue={submission.jobId}
                disabled
                aria-label="Select Job"
              >
                <option value={submission.jobId}>{job?.title || submission.jobTitle}</option>
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] text-blue-600">Salutation</span>
              <select
                className={fieldClassName}
                value={selectedSalutation}
                onChange={(event) => updateSalutation(event.target.value)}
                aria-label="Salutation"
              >
                <option value="">SELECT</option>
                {SALUTATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] text-blue-600">Select Mailing Theme</span>
              <span className="flex items-center gap-2">
                <select
                  className={fieldClassName}
                  value={selectedMailingTheme}
                  onChange={(event) => setSelectedMailingTheme(event.target.value)}
                  aria-label="Select Mailing Theme"
                >
                  <option value="">SELECT</option>
                  {MAILING_THEME_OPTIONS.map((theme) => <option key={theme} value={theme}>{theme}</option>)}
                </select>
                <button type="button" className="rounded p-1.5 text-blue-600 hover:bg-blue-50" aria-label="Search mailing themes">
                  <Search className="h-4 w-4" />
                </button>
              </span>
            </label>
          </div>
        </aside>
      </div>

      {createContactOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-labelledby="add-contact-title">
          <div className="w-full max-w-[920px] overflow-y-auto border border-[#D5DCE5] bg-white shadow-2xl" style={{ maxHeight: '90vh' }}>
            <div className="flex items-center justify-between border-b border-[#EAECF0] px-5 py-3">
              <h2 id="add-contact-title" className="text-lg font-medium text-[#344054]">Add Contact to Client</h2>
              <button type="button" onClick={() => setCreateContactOpen(false)} className="px-2 text-xl text-[#667085] hover:text-[#344054]" aria-label="Close">×</button>
            </div>

            <div className="px-5 py-4">
              <div className={`grid grid-cols-1 gap-4 ${contactOrganizationLevel ? 'md:grid-cols-[1fr_1fr]' : 'md:grid-cols-[1fr_1fr_auto]'}`}>
                <label className="text-xs text-blue-600">Client *
                  <select className="mt-1 h-8 w-full border border-[#D5DCE5] bg-white px-2 text-xs text-[#344054]" defaultValue={submission.client}>
                    <option value={submission.client}>{submission.client}</option>
                  </select>
                </label>
                {!contactOrganizationLevel && (
                  <div className="relative">
                    <label className="block text-xs text-[#667085]">Business Units</label>
                    <button
                      type="button"
                      onClick={() => setBusinessUnitDropdownOpen((open) => !open)}
                      className="mt-1 flex h-8 w-full items-center justify-between border border-[#D5DCE5] bg-[#F9FAFB] px-2 text-left text-xs text-[#344054]"
                      aria-label="Select business units"
                      aria-expanded={businessUnitDropdownOpen}
                    >
                      <span>{contactBusinessUnits.length === BUSINESS_UNIT_OPTIONS.length ? 'All selected' : contactBusinessUnits.length ? `${contactBusinessUnits.length} selected` : 'Select business units'}</span>
                      <span className="text-[9px] text-[#667085]">▾</span>
                    </button>
                    {businessUnitDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full z-30 max-h-40 overflow-y-auto border border-[#D5DCE5] bg-white py-1 shadow-lg">
                        {BUSINESS_UNIT_OPTIONS.map((businessUnit) => (
                          <label key={businessUnit} className="flex cursor-pointer items-center gap-1.5 px-2 py-1.5 text-xs text-[#344054] hover:bg-[#F2F6FC]">
                            <input
                              type="checkbox"
                              checked={contactBusinessUnits.includes(businessUnit)}
                              onChange={() => setContactBusinessUnits((selected) => selected.includes(businessUnit)
                                ? selected.filter((item) => item !== businessUnit)
                                : [...selected, businessUnit])}
                            />
                            {businessUnit}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <label className={`flex items-center gap-2 text-xs text-[#344054] ${contactOrganizationLevel ? 'pt-5' : ''}`}>
                  <input
                    type="checkbox"
                    checked={contactOrganizationLevel}
                    onChange={(event) => {
                      const organizationLevel = event.currentTarget.checked;
                      setContactOrganizationLevel(organizationLevel);
                      setBusinessUnitDropdownOpen(false);
                    }}
                  />
                  <span>Organization Level</span>
                </label>
              </div>

              <h3 className="mt-5 border-b border-[#9CA3AF] pb-2 text-sm font-medium text-[#344054]">Standard Fields</h3>

              <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 text-xs md:grid-cols-3">
                <label className="text-blue-600">First Name *
                  <input value={contactFirstName} onChange={(event) => setContactFirstName(event.target.value)} className="mt-1 h-8 w-full border border-[#D5DCE5] px-2 text-[#344054] outline-none" />
                </label>
                <label className="text-blue-600">Last Name
                  <input value={contactLastName} onChange={(event) => setContactLastName(event.target.value)} className="mt-1 h-8 w-full border border-[#D5DCE5] px-2 text-[#344054] outline-none" />
                </label>
                <label className="text-blue-600">Designation
                  <input value={contactDesignation} onChange={(event) => setContactDesignation(event.target.value)} className="mt-1 h-8 w-full border border-[#D5DCE5] px-2 text-[#344054] outline-none" />
                </label>
                <label className="text-blue-600">Office Number
                  <span className="mt-1 flex">
                    <input value={contactOfficeNumber} onChange={(event) => setContactOfficeNumber(event.target.value)} className="h-8 min-w-0 flex-1 border border-[#D5DCE5] px-2 text-[#344054] outline-none" />
                    <input aria-label="Extension" placeholder="Extension" className="h-8 w-20 border border-l-0 border-[#D5DCE5] px-2 text-[#344054] outline-none" />
                  </span>
                </label>
                <label className="text-blue-600">Mobile number
                  <input value={contactMobileNumber} onChange={(event) => setContactMobileNumber(event.target.value)} className="mt-1 h-8 w-full border border-[#D5DCE5] px-2 text-[#344054] outline-none" />
                </label>
                <label className="text-blue-600">Email ID *
                  <input type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} className="mt-1 h-8 w-full border border-[#D5DCE5] px-2 text-[#344054] outline-none" />
                </label>
                <label className="text-blue-600">Secondary Email ID
                  <input type="email" value={contactSecondaryEmail} onChange={(event) => setContactSecondaryEmail(event.target.value)} className="mt-1 h-8 w-full border border-[#D5DCE5] px-2 text-[#344054] outline-none" />
                </label>
                <label className="text-blue-600">Primary Owner *
                  <select className="mt-1 h-8 w-full border border-[#D5DCE5] bg-white px-2 text-xs text-[#344054]" defaultValue={users[2]?.email || ''}>
                    {users.map((user) => <option key={user.id} value={user.email}>{user.name} ({user.email})</option>)}
                  </select>
                </label>
                <div>
                  <span className="text-blue-600">Ownership</span>
                  <div className="relative mt-1">
                    <button
                      type="button"
                      onClick={() => setOwnershipDropdownOpen((open) => !open)}
                      className="flex h-8 w-full items-center justify-between border border-[#D5DCE5] bg-white px-2 text-left text-xs text-[#344054]"
                      aria-expanded={ownershipDropdownOpen}
                      aria-label="Select contact owners"
                    >
                      <span className="truncate">
                        {contactOwners.length
                          ? users.filter((user) => contactOwners.includes(user.email)).map((user) => user.name).join(', ')
                          : 'Select owner'}
                      </span>
                      <span className="ml-2 text-[9px] text-[#667085]">▾</span>
                    </button>
                    {ownershipDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full z-20 max-h-40 overflow-y-auto border border-[#D5DCE5] bg-white py-1 shadow-lg">
                        {users.map((user) => (
                          <label key={user.id} className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-xs text-[#344054] hover:bg-[#F2F6FC]">
                            <input
                              type="checkbox"
                              checked={contactOwners.includes(user.email)}
                              onChange={() => setContactOwners((owners) => (
                                owners.includes(user.email)
                                  ? owners.filter((email) => email !== user.email)
                                  : [...owners, user.email]
                              ))}
                            />
                            <span>{user.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <label className="mt-2 flex items-center gap-1.5 text-xs text-[#344054]">
                    <input type="checkbox" />
                    Allow Access to All Users
                  </label>
                </div>
              </div>

              <h3 className="mt-6 border-b border-[#9CA3AF] pb-2 text-sm font-medium text-[#344054]">Additional Contact Details</h3>

              <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 text-xs md:grid-cols-3">
                <label className="text-blue-600">Address 1
                  <input value={contactAddress1} onChange={(event) => setContactAddress1(event.target.value)} className="mt-1 h-8 w-full border border-[#D5DCE5] px-2 text-[#344054] outline-none" />
                </label>
                <label className="text-blue-600">Address 2
                  <input value={contactAddress2} onChange={(event) => setContactAddress2(event.target.value)} className="mt-1 h-8 w-full border border-[#D5DCE5] px-2 text-[#344054] outline-none" />
                </label>
                <label className="text-blue-600">Country
                  <select value={contactCountry} onChange={(event) => setContactCountry(event.target.value)} className="mt-1 h-8 w-full border border-[#D5DCE5] bg-white px-2 text-xs text-[#344054]">
                    {COUNTRY_OPTIONS.map((country) => <option key={country}>{country}</option>)}
                  </select>
                </label>
                <label className="text-blue-600">State
                  <select value={contactState} onChange={(event) => setContactState(event.target.value)} className="mt-1 h-8 w-full border border-[#D5DCE5] bg-white px-2 text-xs text-[#344054]">
                    {INDIA_STATE_OPTIONS.map((state) => <option key={state}>{state}</option>)}
                  </select>
                </label>
                <label className="text-blue-600">City
                  <input value={contactCity} onChange={(event) => setContactCity(event.target.value)} className="mt-1 h-8 w-full border border-[#D5DCE5] px-2 text-[#344054] outline-none" />
                </label>
                <label className="text-blue-600">Zip Code
                  <input value={contactZipCode} onChange={(event) => setContactZipCode(event.target.value)} className="mt-1 h-8 w-full border border-[#D5DCE5] px-2 text-[#344054] outline-none" />
                </label>
                <label className="text-blue-600">Linkedin Profile URL
                  <input type="url" value={contactLinkedinUrl} onChange={(event) => setContactLinkedinUrl(event.target.value)} className="mt-1 h-8 w-full border border-[#D5DCE5] px-2 text-[#344054] outline-none" />
                </label>
                <label className="text-blue-600">Facebook Profile URL
                  <input type="url" value={contactFacebookUrl} onChange={(event) => setContactFacebookUrl(event.target.value)} className="mt-1 h-8 w-full border border-[#D5DCE5] px-2 text-[#344054] outline-none" />
                </label>
                <label className="text-blue-600">Twitter Profile URL
                  <input type="url" value={contactTwitterUrl} onChange={(event) => setContactTwitterUrl(event.target.value)} className="mt-1 h-8 w-full border border-[#D5DCE5] px-2 text-[#344054] outline-none" />
                </label>
                <label className="text-blue-600">Google+ Profile URL
                  <input type="url" value={contactGooglePlusUrl} onChange={(event) => setContactGooglePlusUrl(event.target.value)} className="mt-1 h-8 w-full border border-[#D5DCE5] px-2 text-[#344054] outline-none" />
                </label>
                <label className="text-blue-600">Status
                  <select value={contactStatus} onChange={(event) => setContactStatus(event.target.value)} className="mt-1 h-8 w-full border border-[#D5DCE5] bg-white px-2 text-xs text-[#344054]">
                    <option value="">Select</option>
                    <option>DNC</option>
                    <option>IMPORTED FROM OORWIN</option>
                    <option>NEGOTIATING</option>
                    <option>NEW LEAD</option>
                    <option>WORKING</option>
                  </select>
                </label>
                <div className="relative">
                  <label className="block text-blue-600">Client Group</label>
                  <button
                    type="button"
                    onClick={() => setContactGroupOpen((open) => !open)}
                    className="mt-1 flex h-8 w-full items-center justify-between border border-[#D5DCE5] bg-white px-2 text-left text-xs text-[#344054]"
                    aria-label="Select client groups"
                    aria-expanded={contactGroupOpen}
                  >
                    <span className="truncate">{contactGroups.length ? contactGroups.join(', ') : ''}</span>
                    <span className="ml-2 text-[9px] text-[#667085]">▾</span>
                  </button>
                  {contactGroupOpen && (
                    <div className="absolute left-0 right-0 top-full z-30 border border-[#D5DCE5] bg-white shadow-lg">
                      <div className="flex items-center gap-2 border-b border-[#EAECF0] p-1.5">
                        <input
                          value={contactGroupSearch}
                          onChange={(event) => setContactGroupSearch(event.target.value)}
                          placeholder="Search"
                          aria-label="Search client groups"
                          className="h-6 min-w-0 flex-1 border border-[#D5DCE5] px-1.5 text-xs outline-none focus:border-blue-500"
                        />
                        <Search className="h-3.5 w-3.5 text-[#667085]" />
                      </div>
                      <div className="max-h-36 overflow-y-auto py-1">
                        <label className="flex cursor-pointer items-center gap-1.5 px-2 py-1 text-xs text-blue-600 hover:bg-[#F2F6FC]">
                          <input
                            type="checkbox"
                            checked={false}
                            disabled
                          />
                          [Select all]
                        </label>
                      </div>
                    </div>
                  )}
                </div>
                <label className="text-blue-600 md:col-span-2">About the Contact
                  <textarea value={contactAbout} onChange={(event) => setContactAbout(event.target.value)} rows={3} className="mt-1 w-full resize-y border border-[#D5DCE5] px-2 py-1.5 text-[#344054] outline-none" />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#EAECF0] px-5 py-3">
              <button
                type="button"
                onClick={() => {
                  const name = `${contactFirstName.trim()} ${contactLastName.trim()}`.trim();
                  const email = contactEmail.trim();
                  if (!name || !email) return;
                  const contact: User = {
                    id: `contact-${Date.now()}`,
                    name,
                    email,
                    role: 'recruiter',
                    avatar: '',
                    businessUnit: 'External Contact',
                    title: contactDesignation.trim() || 'Contact'
                  };
                  setCustomContacts((current) => [...current, contact]);
                  setToRecipients([email]);
                  setCreateContactOpen(false);
                }}
                className="h-8 rounded bg-blue-500 px-5 text-xs font-medium text-white hover:bg-blue-600"
              >
                Save
              </button>
              <button type="button" onClick={() => setCreateContactOpen(false)} className="h-8 rounded border border-[#D5DCE5] px-4 text-xs text-[#344054] hover:bg-[#F9FAFB]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
