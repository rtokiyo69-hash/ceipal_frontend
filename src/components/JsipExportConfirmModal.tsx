import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, CheckCircle2, ShieldCheck } from 'lucide-react';
import { DateRangeFilter, JsipRecruiterRow, JsipSummaryTotals } from '../types/jsip';

interface JsipExportConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateFilter: DateRangeFilter;
  rows: JsipRecruiterRow[];
  totals: JsipSummaryTotals;
  onConfirmExport: (format: 'csv' | 'excel') => void;
}

export const JsipExportConfirmModal: React.FC<JsipExportConfirmModalProps> = ({
  isOpen,
  onClose,
  dateFilter,
  rows,
  totals,
  onConfirmExport
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'excel'>('csv');

  if (!isOpen) return null;

  const handleDownload = () => {
    onConfirmExport(selectedFormat);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg space-y-6 rounded-2xl border border-[#D8E3F1] bg-white p-6 shadow-2xl sm:p-8 dark:border-[#334155] dark:bg-[#1E293B]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D8E3F1] pb-3 dark:border-[#334155]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Outfit'] font-bold text-xl text-slate-900 dark:text-white">
                Confirm Report Export
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                JSIP Recruiter Performance & Activity Report
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmation Scope Summary */}
        <div className="space-y-3 rounded-xl border border-[#D8E3F1] bg-[#FFFFFF] p-4 text-xs dark:border-[#334155] dark:bg-[#475569]">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">Report Scope:</span>
            <span className="font-semibold text-cyan-700 dark:text-cyan-300">
              All Active Recruitment Records
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">Recruiters Included:</span>
            <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
              {rows.length} Active Recruiters
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 border-t border-[#D8E3F1] pt-2 text-center dark:border-[#334155]">
            <div>
              <span className="block text-[10px] font-medium uppercase text-slate-600 dark:text-slate-300">Submissions</span>
              <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">
                {totals.totalSubmissions}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-medium uppercase text-slate-600 dark:text-slate-300">Client Subs</span>
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400 tabular-nums">
                {totals.totalClientSubmissions}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-medium uppercase text-slate-600 dark:text-slate-300">Interviews</span>
              <span className="font-mono font-bold text-sky-600 dark:text-sky-400 tabular-nums">
                {totals.totalInterviews}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-medium uppercase text-slate-600 dark:text-slate-300">Hires</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {totals.totalHires}
              </span>
            </div>
          </div>
        </div>

        {/* Format Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
            Select Export Format:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedFormat('csv')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedFormat === 'csv'
                  ? 'border-cyan-600 bg-cyan-50 text-cyan-900 shadow-sm dark:border-cyan-400 dark:bg-cyan-950/60 dark:text-cyan-100'
                  : 'border-[#E2E8F0] bg-white text-slate-800 dark:border-[#475569] dark:bg-[#475569] dark:text-slate-200'
              }`}
            >
              <div className="font-semibold text-xs flex items-center justify-between">
                <span>CSV Spreadsheet</span>
                {selectedFormat === 'csv' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />}
              </div>
              <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                Standard Comma-Separated Values for Excel and Sheets
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFormat('excel')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedFormat === 'excel'
                  ? 'border-cyan-600 bg-cyan-50 text-cyan-900 shadow-sm dark:border-cyan-400 dark:bg-cyan-950/60 dark:text-cyan-100'
                  : 'border-[#E2E8F0] bg-white text-slate-800 dark:border-[#475569] dark:bg-[#475569] dark:text-slate-200'
              }`}
            >
              <div className="font-semibold text-xs flex items-center justify-between">
                <span>Excel Formatted</span>
                {selectedFormat === 'excel' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />}
              </div>
              <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                Tab-delimited workbook format with summary row
              </p>
            </button>
          </div>
        </div>

        {/* Compliance & Verification badge */}
        <div className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-teal-500" />
          <span>Role-based access verified. Audit timestamps included.</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[#D8E3F1] pt-3 dark:border-[#334155]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="ice-sheen px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 hover:from-teal-400 hover:via-cyan-400 hover:to-sky-400 text-white shadow-md flex items-center gap-2 active:scale-[0.98] transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Confirm & Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};
