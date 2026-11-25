import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  CheckCircle,
  Clock3,
  Lock,
  Save,
  Search,
  X,
  ChevronDown
} from 'lucide-react';
import {
  ENCRYPTION_FIELD_CANDIDATES,
  ENCRYPTION_ROLES_LIST
} from '../../../services/globalSettingsMockData';

export const EncryptionFields: React.FC = () => {
  const [selectedFields, setSelectedFields] = useState<string[]>(ENCRYPTION_FIELD_CANDIDATES);
  const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState(false);
  const [fieldSearch, setFieldSearch] = useState('');

  const [selectedRoles, setSelectedRoles] = useState<string[]>(['Administrator', 'Practice Lead']);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [roleSearch, setRoleSearch] = useState('');

  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fieldDropdownRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        fieldDropdownRef.current &&
        !fieldDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFieldDropdownOpen(false);
      }
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredCandidates = ENCRYPTION_FIELD_CANDIDATES.filter((f) =>
    f.toLowerCase().includes(fieldSearch.toLowerCase())
  );

  const filteredRoles = ENCRYPTION_ROLES_LIST.filter((r) =>
    r.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const toggleField = (f: string) => {
    if (selectedFields.includes(f)) {
      setSelectedFields(selectedFields.filter((item) => item !== f));
    } else {
      setSelectedFields([...selectedFields, f]);
    }
  };

  const toggleAllFields = () => {
    if (selectedFields.length === ENCRYPTION_FIELD_CANDIDATES.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields([...ENCRYPTION_FIELD_CANDIDATES]);
    }
  };

  const toggleRole = (r: string) => {
    if (selectedRoles.includes(r)) {
      setSelectedRoles(selectedRoles.filter((item) => item !== r));
    } else {
      setSelectedRoles([...selectedRoles, r]);
    }
  };

  const toggleAllRoles = () => {
    if (selectedRoles.length === ENCRYPTION_ROLES_LIST.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles([...ENCRYPTION_ROLES_LIST]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Encryption field permissions successfully updated.');
  };

  return (
    <section className="rounded-2xl border border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#1E293B] overflow-visible">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed right-6 top-20 z-[90] flex items-center gap-2 rounded-xl border border-[#2563EB] bg-[#2563EB] px-4 py-2.5 text-xs text-white shadow-xl animate-in fade-in">
          <CheckCircle className="h-4 w-4 text-[#8AC9A7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D8E3F1] p-5 dark:border-[#334155]">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1E40AF] dark:text-[#60A5FA]">
            Data Security &amp; Privacy
          </p>
          <h2 className="mt-1 text-lg font-bold text-[#1E293B] dark:text-white">
            Encryption Field Settings
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setActivitiesOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D8E3F1] bg-white px-3 text-xs font-semibold text-[#334155] transition-colors hover:bg-[#FFFFFF] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white dark:hover:bg-[#475569]"
        >
          <Activity className="h-4 w-4 text-[#125B97] dark:text-[#60A5FA]" />
          <span>Activities</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="p-6 space-y-6 text-xs max-w-3xl min-h-[500px] pb-36">
        {/* Encryption Fields Multi-select */}
        <div className="relative z-30" ref={fieldDropdownRef}>
          <label className="block space-y-1.5 font-semibold text-[#334155] dark:text-[#BFDBFE]">
            <span>
              Encryption Fields <span className="text-rose-500">*</span>
            </span>
            <p className="text-[11px] font-normal text-[#64748B]">
              Sensitive candidate identification attributes to encrypt in the database.
            </p>

            <div
              onClick={() => {
                setIsFieldDropdownOpen(!isFieldDropdownOpen);
                setIsRoleDropdownOpen(false);
              }}
              className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 flex items-center justify-between cursor-pointer hover:border-[#2563EB] transition-colors dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
            >
              <div className="flex flex-wrap gap-1.5">
                {selectedFields.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#DCE8FF] text-[#125B97] dark:bg-[#475569] dark:text-white"
                  >
                    <Lock className="w-3 h-3 text-[#125B97] dark:text-[#93C5FD]" />
                    {f}
                  </span>
                ))}
                {selectedFields.length === 0 && (
                  <span className="text-[#64748B]">Select fields to encrypt</span>
                )}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#64748B] shrink-0 ml-2 transition-transform ${
                  isFieldDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </label>

          {isFieldDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl shadow-2xl p-3 space-y-2 z-40">
              <div className="flex items-center gap-2 pb-2 border-b border-[#D8E3F1] dark:border-[#334155]">
                <input
                  type="checkbox"
                  checked={selectedFields.length === ENCRYPTION_FIELD_CANDIDATES.length}
                  onChange={toggleAllFields}
                  className="rounded border-[#D8E3F1] text-[#2563EB] focus:ring-[#2563EB]"
                />
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={fieldSearch}
                    onChange={(e) => setFieldSearch(e.target.value)}
                    placeholder="Search fields..."
                    className="w-full pl-2 pr-6 py-1 text-xs bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2 top-1.5" />
                </div>
              </div>

              {/* Scrollable List */}
              <div className="max-h-48 overflow-y-auto space-y-1 pt-1 pr-1">
                {filteredCandidates.map((f) => (
                  <label
                    key={f}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#F8FAFC] dark:hover:bg-[#334155] rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(f)}
                      onChange={() => toggleField(f)}
                      className="rounded border-[#D8E3F1] text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <span className="text-[#334155] dark:text-[#BFDBFE] font-medium">{f}</span>
                  </label>
                ))}
                {filteredCandidates.length === 0 && (
                  <div className="p-3 text-center text-xs text-[#64748B]">No matching fields</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Roles Access Multi-select */}
        <div className="relative z-20" ref={roleDropdownRef}>
          <label className="block space-y-1.5 font-semibold text-[#334155] dark:text-[#BFDBFE]">
            <span>Authorized Roles for Viewing Encrypted Fields</span>
            <p className="text-[11px] font-normal text-[#64748B]">
              Only users with these roles will see an unlock action to decrypt data on candidate profiles.
            </p>

            <div
              onClick={() => {
                setIsRoleDropdownOpen(!isRoleDropdownOpen);
                setIsFieldDropdownOpen(false);
              }}
              className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 flex items-center justify-between cursor-pointer hover:border-[#2563EB] transition-colors dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
            >
              <div className="flex flex-wrap gap-1.5">
                {selectedRoles.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#DCE8FF] text-[#125B97] dark:bg-[#475569] dark:text-white"
                  >
                    {r}
                  </span>
                ))}
                {selectedRoles.length === 0 && (
                  <span className="text-[#64748B]">Select authorized roles</span>
                )}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#64748B] shrink-0 ml-2 transition-transform ${
                  isRoleDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </label>

          {isRoleDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#1E293B] border border-[#D8E3F1] dark:border-[#334155] rounded-xl shadow-2xl p-3 space-y-2 z-30">
              <div className="flex items-center gap-2 pb-2 border-b border-[#D8E3F1] dark:border-[#334155]">
                <input
                  type="checkbox"
                  checked={selectedRoles.length === ENCRYPTION_ROLES_LIST.length}
                  onChange={toggleAllRoles}
                  className="rounded border-[#D8E3F1] text-[#2563EB] focus:ring-[#2563EB]"
                />
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    placeholder="Search roles..."
                    className="w-full pl-2 pr-6 py-1 text-xs bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#D8E3F1] dark:border-[#334155] rounded-lg focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2 top-1.5" />
                </div>
              </div>

              {/* Scrollable Roles List */}
              <div className="max-h-48 overflow-y-auto space-y-1 pt-1 pr-1">
                {filteredRoles.map((r) => (
                  <label
                    key={r}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#F8FAFC] dark:hover:bg-[#334155] rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(r)}
                      onChange={() => toggleRole(r)}
                      className="rounded border-[#D8E3F1] text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <span className="text-[#334155] dark:text-[#BFDBFE] font-medium">{r}</span>
                  </label>
                ))}
                {filteredRoles.length === 0 && (
                  <div className="p-3 text-center text-xs text-[#64748B]">No matching roles</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="border-t border-[#D8E3F1] pt-4 dark:border-[#334155]">
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
          >
            <Save className="h-4 w-4" />
            <span>Save Encryption Settings</span>
          </button>
        </div>
      </form>

      {/* Activities Dialog */}
      {activitiesOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0F172A]/55 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setActivitiesOpen(false);
          }}
        >
          <section
            aria-labelledby="encryption-activities-title"
            className="flex max-h-[min(80vh,680px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#D8E3F1] bg-white shadow-2xl dark:border-[#334155] dark:bg-[#1E293B]"
          >
            <div className="flex items-center justify-between border-b border-[#D8E3F1] p-5 dark:border-[#334155]">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1E40AF] dark:text-[#60A5FA]">
                  Audit trail
                </p>
                <h2
                  id="encryption-activities-title"
                  className="mt-1 text-lg font-bold text-[#1E293B] dark:text-white"
                >
                  Encryption Field Activities
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close activities"
                onClick={() => setActivitiesOpen(false)}
                className="rounded-lg p-2 text-[#64748B] hover:bg-[#FFFFFF] dark:text-[#BFDBFE] dark:hover:bg-[#475569]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              <div className="flex gap-3 rounded-xl border border-[#D8E3F1] bg-[#F8FAFC] p-3.5 dark:border-[#334155] dark:bg-[#0F172A]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFFFFF] text-[#125B97] dark:bg-[#475569] dark:text-[#60A5FA]">
                  <Clock3 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#1E293B] dark:text-white">
                    <span className="font-semibold">Sachin Wadeyar</span> configured database encryption for{' '}
                    <span className="font-semibold">SSN, Aadhar, Pan Card, Passport, and UAN Number</span>
                  </p>
                  <p className="mt-1 text-[10px] text-[#64748B]">2024-07-09 19:13:58</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
};
