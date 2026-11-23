import React, { useState } from 'react';
import { CheckCircle, Save, Search } from 'lucide-react';
import {
  MandatoryFieldItem,
  EducationDetailFieldItem,
  INITIAL_MANDATORY_APPLICANT_FIELDS,
  INITIAL_EDUCATION_FIELDS
} from '../../../services/globalSettingsMockData';

export const MandatoryFields: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<string>('Applicant Profile');
  const [fields, setFields] = useState<MandatoryFieldItem[]>(INITIAL_MANDATORY_APPLICANT_FIELDS);
  const [educationFields, setEducationFields] = useState<EducationDetailFieldItem[]>(
    INITIAL_EDUCATION_FIELDS
  );
  const [search, setSearch] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredFields = fields.filter((f) =>
    f.fieldName.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (
    id: string,
    key: 'showHide' | 'mandatory' | 'mandateWhileSubmitting'
  ) => {
    setFields((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const currentVal = item[key];
        if (typeof currentVal === 'string') return item;
        return {
          ...item,
          [key]: !currentVal
        };
      })
    );
  };

  const handleEducationToggle = (id: string) => {
    setEducationFields((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (typeof item.showHide === 'string') return item;
        return {
          ...item,
          showHide: !item.showHide
        };
      })
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Mandatory field rules saved for ${selectedModule}.`);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#1E293B]">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed right-6 top-20 z-[90] flex items-center gap-2 rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2.5 text-xs text-white shadow-xl animate-in fade-in">
          <CheckCircle className="h-4 w-4 text-[#8AC9A7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls Bar */}
      <div className="flex flex-col gap-3 border-b border-[#D8E3F1] bg-white p-4 dark:border-[#334155] dark:bg-[#1E293B] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#BFDBFE]">
              Module
            </span>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="h-10 rounded-xl border border-[#D8E3F1] bg-white px-3 text-xs font-semibold text-[#1E293B] outline-none focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
            >
              <option value="Applicant Profile">Applicant Profile</option>
              <option value="Job Posting">Job Posting</option>
              <option value="Clients">Clients</option>
              <option value="Vendors">Vendors</option>
            </select>
          </div>

          <label className="flex h-10 w-64 items-center gap-2 rounded-xl border border-[#D8E3F1] bg-[#FFFFFF]/60 px-3 text-[#64748B] transition-colors focus-within:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#BFDBFE]">
            <Search className="h-4 w-4 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter fields..."
              className="min-w-0 flex-1 bg-transparent text-xs text-[#1E293B] outline-none placeholder:text-[#64748B] dark:text-white"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8] self-end sm:self-auto"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="p-4 sm:p-5 space-y-6">
        {/* Main Table */}
        <div className="overflow-auto max-h-[520px] rounded-xl border border-[#D8E3F1] dark:border-[#334155]">
          <table className="w-full min-w-[760px] border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10 bg-[#FFFFFF] dark:bg-[#334155]">
              <tr className="border-b border-[#D8E3F1] text-[10px] uppercase tracking-[0.12em] text-[#64748B] dark:border-[#334155] dark:text-[#BFDBFE]">
                <th scope="col" className="px-5 py-3.5 font-semibold">Field Name</th>
                <th scope="col" className="px-5 py-3.5 text-center font-semibold">Show / Hide</th>
                <th scope="col" className="px-5 py-3.5 text-center font-semibold">Mandatory</th>
                <th scope="col" className="px-5 py-3.5 text-center font-semibold">Mandate While Submitting</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
              {filteredFields.map((f) => (
                <tr
                  key={f.id}
                  className="transition-colors hover:bg-[#F8FAFC] dark:hover:bg-[#334155]"
                >
                  <td className="px-5 py-3.5 font-semibold text-[#1E293B] dark:text-white">
                    {f.fieldName}
                  </td>

                  {/* Show / Hide */}
                  <td className="px-5 py-3.5 text-center">
                    {f.showHide === 'visible' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-[#475569] dark:bg-slate-700 dark:text-slate-200">
                        Visible
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggle(f.id, 'showHide')}
                        className={`inline-flex w-9 h-5 items-center rounded-full p-0.5 transition-colors ${
                          f.showHide ? 'bg-[#2563EB]' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                            f.showHide ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    )}
                  </td>

                  {/* Mandatory */}
                  <td className="px-5 py-3.5 text-center">
                    {f.mandatory === 'required' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                        Required
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggle(f.id, 'mandatory')}
                        className={`inline-flex w-9 h-5 items-center rounded-full p-0.5 transition-colors ${
                          f.mandatory ? 'bg-[#2563EB]' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                            f.mandatory ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    )}
                  </td>

                  {/* Mandate While Submitting */}
                  <td className="px-5 py-3.5 text-center">
                    {f.mandateWhileSubmitting === 'required' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                        Required
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggle(f.id, 'mandateWhileSubmitting')}
                        className={`inline-flex w-9 h-5 items-center rounded-full p-0.5 transition-colors ${
                          f.mandateWhileSubmitting ? 'bg-[#2563EB]' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                            f.mandateWhileSubmitting ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Education Details Sub-Section */}
        {selectedModule === 'Applicant Profile' && (
          <div className="space-y-3 pt-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1E40AF] dark:text-[#60A5FA]">
                Applicant Sub-record
              </p>
              <h3 className="mt-0.5 text-sm font-bold text-[#1E293B] dark:text-white">
                Education Details
              </h3>
            </div>
            <div className="overflow-auto rounded-xl border border-[#D8E3F1] dark:border-[#334155]">
              <table className="w-full min-w-[500px] border-collapse text-left text-xs">
                <thead className="sticky top-0 z-10 bg-[#FFFFFF] dark:bg-[#334155]">
                  <tr className="border-b border-[#D8E3F1] text-[10px] uppercase tracking-[0.12em] text-[#64748B] dark:border-[#334155] dark:text-[#BFDBFE]">
                    <th scope="col" className="px-5 py-3 font-semibold">Field Name</th>
                    <th scope="col" className="px-5 py-3 text-center font-semibold">Show / Hide</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                  {educationFields.map((ef) => (
                    <tr
                      key={ef.id}
                      className="transition-colors hover:bg-[#F8FAFC] dark:hover:bg-[#334155]"
                    >
                      <td className="px-5 py-3 font-semibold text-[#1E293B] dark:text-white">
                        {ef.fieldName}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {ef.showHide === 'visible' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-[#475569] dark:bg-slate-700 dark:text-slate-200">
                            Visible
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleEducationToggle(ef.id)}
                            className={`inline-flex w-9 h-5 items-center rounded-full p-0.5 transition-colors ${
                              ef.showHide ? 'bg-[#2563EB]' : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                                ef.showHide ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
