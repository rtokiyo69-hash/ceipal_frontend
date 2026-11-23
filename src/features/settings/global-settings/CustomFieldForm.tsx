import React, { useState } from 'react';
import { ArrowLeft, Check, Save } from 'lucide-react';
import {
  CustomFieldItem,
  ALL_APPLICABLE_MODULES,
  FIELD_DATA_TYPES
} from '../../../services/globalSettingsMockData';

interface CustomFieldFormProps {
  initialData?: CustomFieldItem | null;
  onSave: (field: CustomFieldItem) => void;
  onBack: () => void;
}

export const CustomFieldForm: React.FC<CustomFieldFormProps> = ({
  initialData,
  onSave,
  onBack
}) => {
  const [fieldLabel, setFieldLabel] = useState(initialData?.fieldLabel || '');
  const [applicableModules, setApplicableModules] = useState<string[]>(
    initialData?.applicableModules || ['Applicant']
  );
  const [fieldVisibility, setFieldVisibility] = useState<'org' | 'business_unit'>(
    initialData?.fieldVisibility || 'org'
  );
  const [alsoTalentBench, setAlsoTalentBench] = useState(initialData?.alsoTalentBench || false);
  const [alsoPlacement, setAlsoPlacement] = useState(initialData?.alsoPlacement || false);
  const [isRequired, setIsRequired] = useState(initialData?.isRequired || false);
  const [fieldDescription, setFieldDescription] = useState(initialData?.fieldDescription || '');
  const [fieldDataType, setFieldDataType] = useState(initialData?.fieldDataType || 'Text');
  const [validationRules, setValidationRules] = useState(initialData?.validationRules || 'Free Text');
  const [minLen, setMinLen] = useState(initialData?.minLen || '');
  const [maxLen, setMaxLen] = useState(initialData?.maxLen || '');
  const [isActive, setIsActive] = useState(initialData ? initialData.isActive : true);

  const toggleModule = (mod: string) => {
    if (applicableModules.includes(mod)) {
      setApplicableModules(applicableModules.filter((m) => m !== mod));
    } else {
      setApplicableModules([...applicableModules, mod]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldLabel.trim()) return;

    const saved: CustomFieldItem = {
      id: initialData?.id || `cf-${Date.now()}`,
      fieldLabel: fieldLabel.trim(),
      businessUnit: initialData?.businessUnit || 'Ampcus Tech Pvt Ltd.',
      syncWith: initialData?.syncWith || 'N/A',
      moduleName: applicableModules[0] || 'Applicant',
      isIndependentField: true,
      customFieldType: initialData?.customFieldType || 'General Custom Field',
      createdBy: initialData?.createdBy || 'Sachin',
      modifiedBy: 'Sachin',
      createdAt: initialData?.createdAt || new Date().toISOString().replace('T', ' ').slice(0, 19),
      lastModified: new Date().toISOString().replace('T', ' ').slice(0, 19),
      isActive,
      applicableModules,
      fieldVisibility,
      alsoTalentBench,
      alsoPlacement,
      isRequired,
      fieldDescription,
      fieldDataType,
      validationRules,
      minLen,
      maxLen
    };

    onSave(saved);
  };

  return (
    <section className="rounded-2xl border border-[#D8E3F1] bg-white shadow-sm dark:border-[#334155] dark:bg-[#1E293B] overflow-visible">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#D8E3F1] p-5 dark:border-[#334155]">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1E40AF] dark:text-[#60A5FA]">
            Custom Fields Definition
          </p>
          <h2 className="mt-1 text-lg font-bold text-[#1E293B] dark:text-white">
            {initialData ? `Edit ${initialData.fieldLabel}` : 'Add New Custom Field'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D8E3F1] bg-white px-3 text-xs font-semibold text-[#334155] transition-colors hover:bg-[#FFFFFF] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white dark:hover:bg-[#475569]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs max-w-4xl">
        {/* Field Label */}
        <div>
          <label className="block space-y-1.5 text-xs font-semibold text-[#334155] dark:text-[#BFDBFE]">
            <span>
              Field Label <span className="text-rose-500">*</span>
            </span>
            <input
              type="text"
              required
              value={fieldLabel}
              onChange={(e) => setFieldLabel(e.target.value)}
              placeholder="e.g. Asset ID, Visa Expiry, Certification Number"
              className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-xs font-normal text-[#1E293B] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
            />
          </label>
        </div>

        {/* Applicable Modules */}
        <div>
          <label className="block text-xs font-semibold text-[#334155] dark:text-[#BFDBFE] mb-2">
            Applicable Modules
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_APPLICABLE_MODULES.map((mod) => {
              const selected = applicableModules.includes(mod);
              return (
                <button
                  type="button"
                  key={mod}
                  onClick={() => toggleModule(mod)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                    selected
                      ? 'bg-[#DCE8FF] text-[#125B97] border-[#125B97] dark:bg-[#475569] dark:text-white dark:border-[#60A5FA]'
                      : 'bg-white dark:bg-[#0F172A] text-[#475569] dark:text-[#BFDBFE] border-[#D8E3F1] dark:border-[#334155] hover:bg-[#FFFFFF]'
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  <span>{mod}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Field Visibility */}
        <div>
          <label className="block text-xs font-semibold text-[#334155] dark:text-[#BFDBFE] mb-2">
            Field Visibility
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-[#334155] dark:text-[#BFDBFE]">
              <input
                type="radio"
                name="visibility"
                checked={fieldVisibility === 'org'}
                onChange={() => setFieldVisibility('org')}
                className="text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span>Org level</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-[#334155] dark:text-[#BFDBFE]">
              <input
                type="radio"
                name="visibility"
                checked={fieldVisibility === 'business_unit'}
                onChange={() => setFieldVisibility('business_unit')}
                className="text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span>Business unit</span>
            </label>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-2.5 pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-[#334155] dark:text-[#BFDBFE]">
            <input
              type="checkbox"
              checked={alsoTalentBench}
              onChange={(e) => setAlsoTalentBench(e.target.checked)}
              className="rounded border-[#D8E3F1] text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span>Also Add Field to the Talent Bench</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-[#334155] dark:text-[#BFDBFE]">
            <input
              type="checkbox"
              checked={alsoPlacement}
              onChange={(e) => setAlsoPlacement(e.target.checked)}
              className="rounded border-[#D8E3F1] text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span>Also Add Field to the Placement</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-[#334155] dark:text-[#BFDBFE]">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="rounded border-[#D8E3F1] text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span>Is Required</span>
          </label>
        </div>

        {/* Field Description */}
        <div>
          <label className="block space-y-1.5 text-xs font-semibold text-[#334155] dark:text-[#BFDBFE]">
            <span>Field Description</span>
            <textarea
              rows={3}
              value={fieldDescription}
              onChange={(e) => setFieldDescription(e.target.value)}
              placeholder="Provide instructions or context for recruiters filling this field..."
              className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-xs font-normal text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
            />
          </label>
        </div>

        {/* Field Data Type */}
        <div>
          <label className="block text-xs font-semibold text-[#334155] dark:text-[#BFDBFE] mb-2">
            Field Data Type
          </label>
          <div className="flex flex-wrap gap-2">
            {FIELD_DATA_TYPES.map((dt) => {
              const selected = fieldDataType === dt;
              return (
                <button
                  type="button"
                  key={dt}
                  onClick={() => setFieldDataType(dt)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                    selected
                      ? 'bg-[#DCE8FF] text-[#125B97] border-[#125B97] dark:bg-[#475569] dark:text-white dark:border-[#60A5FA]'
                      : 'bg-white dark:bg-[#0F172A] text-[#475569] dark:text-[#BFDBFE] border-[#D8E3F1] dark:border-[#334155] hover:bg-[#FFFFFF]'
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  <span>{dt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Validation Rules */}
        <div>
          <label className="block space-y-1.5 text-xs font-semibold text-[#334155] dark:text-[#BFDBFE]">
            <span>Validation Rules</span>
            <select
              value={validationRules}
              onChange={(e) => setValidationRules(e.target.value)}
              className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-xs font-normal text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
            >
              <option value="Free Text">Free Text</option>
              <option value="Email">Email</option>
              <option value="Phone Number">Phone Number</option>
              <option value="Number">Number Only</option>
              <option value="Alphanumeric">Alphanumeric</option>
              <option value="URL">Web URL</option>
            </select>
          </label>
        </div>

        {/* Min & Max length */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5 text-xs font-semibold text-[#334155] dark:text-[#BFDBFE]">
            <span>Field Min Length</span>
            <input
              type="text"
              value={minLen}
              onChange={(e) => setMinLen(e.target.value)}
              placeholder="Minimum characters"
              className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-xs font-normal text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
            />
          </label>
          <label className="block space-y-1.5 text-xs font-semibold text-[#334155] dark:text-[#BFDBFE]">
            <span>Field Max Length</span>
            <input
              type="text"
              value={maxLen}
              onChange={(e) => setMaxLen(e.target.value)}
              placeholder="Maximum characters"
              className="w-full rounded-xl border border-[#D8E3F1] bg-white px-3 py-2.5 text-xs font-normal text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
            />
          </label>
        </div>

        {/* Is Active */}
        <div className="flex items-center gap-3 pt-1">
          <span className="text-xs font-semibold text-[#334155] dark:text-[#BFDBFE]">
            Is Active Status:
          </span>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
              isActive ? 'bg-[#2563EB]' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                isActive ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-xs text-[#64748B]">
            {isActive ? 'Active and visible in forms' : 'Disabled'}
          </span>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 border-t border-[#D8E3F1] pt-5 dark:border-[#334155]">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-[#D8E3F1] px-4 py-2.5 text-xs font-semibold text-[#475569] transition-colors hover:bg-[#FFFFFF] dark:border-[#334155] dark:text-[#BFDBFE] dark:hover:bg-[#475569]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
          >
            <Save className="h-4 w-4" />
            <span>Save Custom Field</span>
          </button>
        </div>
      </form>
    </section>
  );
};
