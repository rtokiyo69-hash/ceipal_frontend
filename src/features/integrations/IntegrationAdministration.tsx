import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  Pencil,
  Plus,
  Search,
  Settings2,
  Trash2,
  Unplug,
  X
} from 'lucide-react';
import { AppRoute, useAppStore } from '../../store/appStore';

type Category = 'all' | 'resume' | 'job' | 'background' | 'sms' | 'voip' | 'candidate' | 'interview' | 'video' | 'sso' | 'payroll' | 'license';

interface IntegrationItem {
  name: string;
  description: string;
  category: Exclude<Category, 'all'>;
  accent: string;
  setup?: boolean;
  count?: number;
}

const categoryTabs: { id: Category; label: string }[] = [
  { id: 'all', label: 'All Integrations' },
  { id: 'resume', label: 'Resume Search' },
  { id: 'job', label: 'Job Posting' },
  { id: 'background', label: 'Background Check' },
  { id: 'sms', label: 'SMS' },
  { id: 'voip', label: 'VOIP' },
  { id: 'candidate', label: 'Candidate Management' },
  { id: 'interview', label: 'Interview' },
  { id: 'video', label: 'Video' },
  { id: 'sso', label: 'SSO' },
  { id: 'payroll', label: 'Payroll' },
  { id: 'license', label: 'License Verification' }
];

const integrations: IntegrationItem[] = [
  { name: 'LinkedIn', description: 'Please reach out to your Customer Success representative to enable the integration.', category: 'resume', accent: '#0077B5', setup: true },
  { name: 'Monster', description: 'Please request the Monster representative provide the API access with Registered Name to configure.', category: 'resume', accent: '#6B3FA0' },
  { name: 'CareerBuilder', description: 'Please request the CareerBuilder representative provide the vendor ID, Username, and Password.', category: 'resume', accent: '#F06060' },
  { name: 'TechFetch', description: 'Please request the TechFetch representative provide the API access with Registered Name, Client, Username...', category: 'resume', accent: '#1682B9' },
  { name: 'Dice', description: 'Please request the Dice.com representative provide the Dice Group ID and Registered Name, Secret key, Client...', category: 'resume', accent: '#D71825' },
  { name: 'Nexxt', description: 'Please request the Nexxt representative provide Registered Name and Employee Authorization.', category: 'resume', accent: '#0A66C2' },
  { name: 'Foundit', description: 'Please request the Foundit representative provide the API access with Registered Name, Country, Username, Password...', category: 'resume', accent: '#7B2D8E' },
  { name: 'Resume Library', description: 'Please request the Resume Library representative provide the Registered Name, Account ID, and API key.', category: 'resume', accent: '#C85D9F' },
  { name: 'Snaprecruit', description: 'Please request the Snaprecruit representative provide the API access with Registered Name and Employer key.', category: 'resume', accent: '#1F2937' },
  { name: 'GoodHire', description: 'Please contact your GoodHire representative for the required details.', category: 'background', accent: '#30A46C', setup: true },
  { name: 'Info', description: 'Please contact your InfoEdge representative for the registered User ID, Password, and Account Number.', category: 'background', accent: '#5B21B6' },
  { name: 'SterlingONE', description: 'Please contact your SterlingONE representative for Username and Password.', category: 'background', accent: '#243B53' },
  { name: 'Appcast', description: 'Please request the Appcast representative to provide the Apply start and apply Complete URLs.', category: 'job', accent: '#2F74C9' },
  { name: 'Bayard', description: 'Please request the Bayard representative provide the API access for jobs via ATS.', category: 'job', accent: '#F6A800' },
  { name: 'CareerBuilder', description: 'Please request the CareerBuilder representative provide the vendor ID, Username, and Password.', category: 'job', accent: '#F06060' },
  { name: 'Careers24', description: 'Please request the Career 24 representative provide the API Key and Consultant Email ID.', category: 'job', accent: '#65A30D' },
  { name: 'ContractorJabber', description: 'Please request the ContractorJabber representative provide the API access with Firm ID.', category: 'job', accent: '#F97316' },
  { name: 'ClearanceJobs', description: 'Please request the ClearanceJobs representative provide the API key and Batch Posting Responsibly.', category: 'job', accent: '#0F4C81' },
  { name: 'Twilio', description: 'Please contact your Twilio representative for Account SID and Auth Token.', category: 'sms', accent: '#E31B23' },
  { name: 'RingCentral', description: 'Please contact your RingCentral representative for the number.', category: 'voip', accent: '#1C64F2' },
  { name: 'Webex', description: 'Please contact your Webex representative for login details.', category: 'video', accent: '#A8C820' },
  { name: 'Microsoft Teams', description: 'Please contact your Microsoft Teams representative for Client ID, Tenant ID, and Client secret key.', category: 'video', accent: '#5B5FC7' },
  { name: 'ZoomInfo', description: 'Please contact your ZoomInfo representative for Username and Password.', category: 'candidate', accent: '#E11D48' },
  { name: 'Apollo', description: 'Please contact your Apollo representative for API key.', category: 'candidate', accent: '#FF7A00' },
  { name: 'HubSpot', description: 'Please contact your HubSpot representative for the API key.', category: 'candidate', accent: '#FF5C35' },
  { name: 'Joomla', description: 'Please contact your Joomla representative for the API key.', category: 'interview', accent: '#10B4D6' },
  { name: 'Azure', description: 'Please contact your Azure representative for the Client ID, Tenant ID and Client Secret key.', category: 'sso', accent: '#1D4ED8' },
  { name: 'Zoominfor', description: 'Please contact your Zoominfor representative for Username and Password.', category: 'payroll', accent: '#6D28D9' },
  { name: 'Propetus', description: 'Please contact your Propetus representative for required credentials.', category: 'license', accent: '#A7C957' }
];

const setupRows = [
  { name: 'Beeline', client: 'JP Morgan Chase', user: 'ampcus_bl_jpmc@ceipalconnect.com', status: 'ON', modified: '09/11/2026 15:23:19' },
  { name: 'Field Glass', client: 'Infosis Limited', user: 'shree@ampcusitech.com', status: 'ON', modified: '11/05/2026 11:03:17' }
];

export const IntegrationAdministration: React.FC = () => {
  const { currentRoute, navigate } = useAppStore();
  const [category, setCategory] = useState<Category>('all');
  const [search, setSearch] = useState('');
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [allLocations, setAllLocations] = useState(true);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [modalItem, setModalItem] = useState<IntegrationItem | null>(null);

  React.useEffect(() => {
    const routeCategory: Partial<Record<AppRoute, Category>> = {
      'resume-search': 'resume',
      'job-posting': 'job',
      'background-check': 'background',
      sms: 'sms',
      voip: 'voip',
      'candidate-management': 'candidate',
      interview: 'interview',
      video: 'video',
      sso: 'sso',
      payroll: 'payroll',
      'license-verification': 'license'
    };
    setCategory(routeCategory[currentRoute] || 'all');
  }, [currentRoute]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const filtered = useMemo(() => integrations.filter((item) => {
    const matchesCategory = category === 'all' || item.category === category;
    const matchesSearch = item.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      item.description.toLowerCase().includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  }), [category, search]);

  const switchCategory = (next: Category) => {
    setCategory(next);
    const routeMap: Record<Category, AppRoute> = {
      all: 'integrations',
      resume: 'resume-search',
      job: 'job-posting',
      background: 'background-check',
      sms: 'sms',
      voip: 'voip',
      candidate: 'candidate-management',
      interview: 'interview',
      video: 'video',
      sso: 'sso',
      payroll: 'payroll',
      license: 'license-verification'
    };
    navigate(routeMap[next]);
  };

  const isVms = currentRoute === 'vms-integrations';
  const isEmail = currentRoute === 'email-integrations';
  const isSettings = currentRoute === 'integration-settings';
  const isMarketplace = currentRoute === 'marketplace';
  const isAutoPublish = currentRoute === 'vms-jobs-auto-publish';
  const isQuestions = currentRoute === 'job-board-questions';
  const isPassive = currentRoute === 'passive-applicants';

  return (
    <div className="min-h-full space-y-3">
      {toast && (
        <div role="status" className="fixed right-6 top-20 z-[80] flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-3 text-xs text-white shadow-xl">
          <CheckCircle2 className="h-4 w-4" />{toast}
        </div>
      )}

      {!isEmail && !isSettings && !isMarketplace && !isVms && !isAutoPublish && !isQuestions && !isPassive && (
        <>
          <nav aria-label="Integration categories" className="flex overflow-x-auto border-b border-[#D8E3F1] bg-white px-2 dark:border-slate-700 dark:bg-[#1E293B]">
            {categoryTabs.map((tab) => (
              <button key={tab.id} type="button" onClick={() => switchCategory(tab.id)}
                className={`shrink-0 border-b-2 px-3 py-3 text-xs font-semibold ${
                  category === tab.id ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-[#1E293B] hover:text-[#2563EB] dark:text-white'
                }`}>
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center justify-between gap-3">
            <div className="relative">
              <button type="button" onClick={() => setLocationsOpen(!locationsOpen)} className="flex items-center gap-2 rounded-lg border border-[#D8E3F1] bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-[#1E293B]">
                All Locations <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {locationsOpen && (
                <div className="absolute left-0 z-30 mt-1 w-48 rounded-lg border border-[#D8E3F1] bg-white p-2 text-xs shadow-lg dark:border-slate-700 dark:bg-[#1E293B]">
                  <label className="flex items-center gap-2 px-2 py-2"><input type="checkbox" checked={allLocations} onChange={(event) => setAllLocations(event.target.checked)} /> All Locations</label>
                  <button type="button" onClick={() => setLocationsOpen(false)} className="mt-1 w-full rounded bg-[#2563EB] px-3 py-1.5 text-white">Apply</button>
                </div>
              )}
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" className="h-9 w-64 rounded-lg border border-[#D8E3F1] bg-white pl-9 pr-3 text-xs outline-none focus:border-[#2563EB] dark:border-slate-700 dark:bg-[#1E293B]" />
            </div>
          </div>

          {category !== 'all' && (
            <h2 className="pt-2 text-lg font-bold text-[#1E293B] dark:text-white">
              {categoryTabs.find((tab) => tab.id === category)?.label}
            </h2>
          )}

          {filtered.length ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => (
                <article key={`${item.name}-${item.category}`} className={`flex min-h-[145px] flex-col rounded-lg border bg-white p-4 shadow-sm dark:bg-[#1E293B] ${
                  item.setup ? 'border-[#2563EB]' : 'border-[#D8E3F1] dark:border-slate-700'
                }`}>
                  <div className="flex items-start justify-between">
                    <h3 className="text-base font-bold" style={{ color: item.accent }}>{item.name}</h3>
                    <button type="button" aria-label={`View ${item.name} activity`} onClick={() => setActivitiesOpen(!activitiesOpen)} className="text-[#94A3B8] hover:text-[#2563EB]">
                      <Clock3 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-3 text-[11px] leading-5 text-[#475569] dark:text-[#BFDBFE]">{item.description}</p>
                  <div className="mt-auto pt-3">
                    {item.setup ? (
                      <button type="button" onClick={() => setModalItem(item)} className="rounded border border-[#2563EB] px-3 py-1.5 text-[11px] text-[#2563EB] hover:bg-[#EFF6FF]">{enabled[item.name] ? 'Configure' : 'Setup'}</button>
                    ) : (
                      <label className="inline-flex cursor-pointer items-center">
                        <input type="checkbox" checked={!!enabled[item.name]} onChange={() => setEnabled((value) => ({ ...value, [item.name]: !value[item.name] }))} className="peer sr-only" />
                        <span className="relative h-5 w-9 rounded-full bg-[#CBD5E1] after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[#2563EB] peer-checked:after:translate-x-4" />
                      </label>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm italic text-[#64748B]">No Integrations Found</div>
          )}
        </>
      )}

      {isEmail && <EmailIntegrations />}
      {isSettings && <IntegrationSettings />}
      {isMarketplace && <Marketplace />}
      {isVms && <VmsIntegrations />}
      {isAutoPublish && <SimpleTable title="VMS Jobs Auto Publish" type="auto" />}
      {isQuestions && <SimpleTable title="Job Board / Career Portal Questions" type="questions" />}
      {isPassive && <SimpleTable title="Passive Applicants Integration" type="passive" />}

      {modalItem && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4" onClick={() => setModalItem(null)}>
          <section role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl border border-[#D8E3F1] bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-[#1E293B]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">{modalItem.name} Setup</h2>
              <button type="button" onClick={() => setModalItem(null)} aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
            <form className="mt-5 space-y-4" onSubmit={(event) => { event.preventDefault(); setEnabled((value) => ({ ...value, [modalItem.name]: true })); setModalItem(null); showToast(`${modalItem.name} configured successfully.`); }}>
              <label className="block text-xs font-semibold">Account name<input required className="mt-1.5 w-full rounded-lg border border-[#D8E3F1] px-3 py-2 font-normal outline-none focus:border-[#2563EB]" /></label>
              <label className="block text-xs font-semibold">API / Client ID<input required className="mt-1.5 w-full rounded-lg border border-[#D8E3F1] px-3 py-2 font-normal outline-none focus:border-[#2563EB]" /></label>
              <div className="flex justify-end gap-2"><button type="button" onClick={() => setModalItem(null)} className="rounded-lg border border-[#D8E3F1] px-4 py-2 text-xs">Cancel</button><button type="submit" className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white">Save</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

const EmailIntegrations: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Email Integrations</h2><button type="button" className="rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white">Email Configurations</button></div>
    <div className="flex gap-2">
      {['Connect to Gmail', 'Connect to O365', 'SMTP'].map((label) => (
        <button key={label} type="button" className="rounded border border-[#2563EB] px-3 py-2 text-xs text-[#2563EB]">{label}</button>
      ))}
    </div>
    <input placeholder="Search" className="h-9 w-56 rounded border border-[#D8E3F1] px-3 text-xs" />
    <div className="overflow-x-auto rounded-lg border border-[#D8E3F1] bg-white">
      <table className="w-full text-left text-xs"><thead className="border-b border-[#D8E3F1]"><tr>{['EMAIL', 'USED FOR', 'DISPLAY NAME', 'EMAIL PROVIDER', 'STATUS', 'ACTIONS'].map((h) => <th key={h} className="px-3 py-3">{h}</th>)}</tr></thead><tbody><tr><td colSpan={6} className="py-12 text-center italic text-[#64748B]">Showing 0 to 0 of 0 entries</td></tr></tbody></table>
    </div>
  </div>
);

const IntegrationSettings: React.FC = () => (
  <div className="space-y-5">
    <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Integration Settings</h2><Clock3 className="h-4 w-4 text-[#2563EB]" /></div>
    {[
      ['Inventory Visibility on Monster, Dice, CareerBuilder', 'If enabled, jobs can be searched on Monster, Dice, or CareerBuilder.'],
      ['Firegiglass Job Notifications', 'If enabled, users get notified when new jobs are posted through Firegiglass.'],
      ['IONavigator Job Notifications', 'If enabled, users get notified when new jobs are posted through IONavigator.']
    ].map(([title, hint]) => (
      <div key={title} className="grid gap-4 border-b border-[#EEF2F7] pb-4 text-xs sm:grid-cols-2"><div><b>{title}</b><div className="mt-1 text-[10px] text-[#64748B]">{hint}</div></div><label className="flex items-center sm:justify-end"><input type="checkbox" className="peer sr-only" /><span className="h-5 w-9 rounded-full bg-[#CBD5E1] peer-checked:bg-[#2563EB]" /></label></div>
    ))}
    <button type="button" className="rounded-lg bg-[#2563EB] px-5 py-2 text-xs font-semibold text-white">Save</button>
  </div>
);

const Marketplace: React.FC = () => (
  <div className="space-y-3">
    <h2 className="text-lg font-bold">Marketplace</h2>
    {[
      ['MONSTER', '0', '0', '0', '0'],
      ['JOBTARGET', 'Setup', '', '', '']
    ].map((row) => (
      <article key={row[0]} className="rounded-lg border border-[#D8E3F1] bg-white p-4">
        <div className="flex items-start justify-between"><h3 className="font-bold text-[#2563EB]">{row[0]}</h3>{row[1] === 'Setup' && <button className="rounded border border-[#2563EB] px-3 py-1.5 text-xs text-[#2563EB]">Setup</button>}</div>
        {row[1] !== 'Setup' && <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4"><b>Jobs Purchased: {row[1]}</b><b>Jobs Allocated: {row[2]}</b><b>Jobs posted: {row[3]}</b><b>Jobs Available: {row[4]}</b></div>}
        <p className="mt-3 text-xs text-[#475569]">Configure this integration to manage job credits and publishing options for the selected account.</p>
      </article>
    ))}
  </div>
);

const VmsIntegrations: React.FC = () => (
  <div className="space-y-3">
    <h2 className="text-lg font-bold">VMS Accounts</h2>
    <input placeholder="Search" className="h-9 w-56 rounded border border-[#D8E3F1] px-3 text-xs" />
    <div className="overflow-x-auto rounded-lg border border-[#D8E3F1] bg-white">
      <table className="w-full text-left text-xs"><thead className="border-b border-[#D8E3F1]"><tr>{['VMS NAME', 'CLIENT', 'USER NAME', 'CREATED BY', 'MODIFIED BY', 'STATUS', 'LAST MODIFIED', 'ACTIONS'].map((h) => <th key={h} className="px-3 py-3">{h}</th>)}</tr></thead><tbody>{setupRows.map((row) => <tr key={row.name} className="border-b border-[#EEF2F7]"><td className="px-3 py-3">{row.name}</td><td className="px-3 py-3">{row.client}</td><td className="px-3 py-3">{row.user}</td><td className="px-3 py-3">N/A</td><td className="px-3 py-3">shradha kokare</td><td className="px-3 py-3"><span className="rounded bg-[#059669] px-2 py-1 text-[10px] font-bold text-white">{row.status}</span></td><td className="px-3 py-3">{row.modified}</td><td className="px-3 py-3"><Pencil className="h-3.5 w-3.5" /></td></tr>)}</tbody></table>
    </div>
  </div>
);

const SimpleTable: React.FC<{ title: string; type: 'auto' | 'questions' | 'passive' }> = ({ title, type }) => {
  const questions = [
    'Are you on immediate joiner?', 'Are you currently based in Nashik?', 'Are you currently employed?',
    'Are you open to night shift?', 'What is your notice period?', 'What is your work location preference?'
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{title}</h2>{type !== 'passive' && <button type="button" className="rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white"><Plus className="mr-1 inline h-3.5 w-3.5" />Add</button>}</div>
      {type === 'questions' ? (
        <>
          <div className="flex gap-2"><select className="h-9 rounded border border-[#D8E3F1] px-3 text-xs"><option>All Categories</option></select><input placeholder="Search" className="h-9 rounded border border-[#D8E3F1] px-3 text-xs" /></div>
          <div className="overflow-x-auto rounded-lg border border-[#D8E3F1] bg-white"><table className="w-full text-left text-xs"><thead className="border-b border-[#D8E3F1]"><tr>{['QUESTION', 'JOBBOARD NAME', 'CATEGORIES', 'CREATED BY', 'MODIFIED BY', 'LAST MODIFIED', 'ACTION'].map((h) => <th key={h} className="px-3 py-3">{h}</th>)}</tr></thead><tbody>{questions.map((question) => <tr key={question} className="border-b border-[#EEF2F7]"><td className="px-3 py-3">{question}</td><td className="px-3 py-3">Career Portal</td><td className="px-3 py-3">Career Portal</td><td className="px-3 py-3">Gaurav Ashok Mishra</td><td className="px-3 py-3">Gaurav Ashok Mishra</td><td className="px-3 py-3">13/04/2026</td><td className="px-3 py-3"><span className="flex gap-2"><Pencil className="h-3.5 w-3.5" /><Trash2 className="h-3.5 w-3.5" /></span></td></tr>)}</tbody></table></div>
        </>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#D8E3F1] bg-white"><table className="w-full text-left text-xs"><thead className="border-b border-[#D8E3F1]"><tr>{(type === 'auto' ? ['CLIENT', 'JOB BOARD ACCOUNT', 'SLOTS ALLOCATED', 'SLOTS USED', 'ACTIVER', 'NOTIFIES', 'ACTIONS'] : ['ACCOUNT NAME', 'TOTAL CREDITS', 'SUBSCRIPTION START DATE', 'CREATED BY', 'CREATED ON', 'ASSIGNED TO', 'ACCESS', 'ACTIONS']).map((h) => <th key={h} className="px-3 py-3">{h}</th>)}</tr></thead><tbody><tr><td colSpan={8} className="py-10 text-center italic text-[#64748B]">No Records Found.</td></tr></tbody></table></div>
      )}
    </div>
  );
};

