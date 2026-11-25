import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

type Option = { value: string; label: string };
export function SearchableSelect({ label, options, values, onChange, multiple = false, placeholder = 'Select' }: { label: string; options: Option[]; values: string[]; onChange: (values: string[]) => void; multiple?: boolean; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  const visible = options.filter(option => option.label.toLowerCase().includes(query.toLowerCase()));
  const selected = options.filter(option => values.includes(option.value));
  return <div ref={root} className="job-select" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }} onKeyDown={e => { if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(false); trigger.current?.focus(); } }}>
    <button ref={trigger} type="button" className="job-select-trigger" aria-label={label} aria-expanded={open} aria-controls={id} onClick={() => { setOpen(!open); setQuery(''); }}><span className="job-select-value">{selected.length ? <><span className="job-select-chip">{selected[0].label}</span>{selected.length > 1 && <span className="job-select-count">+{selected.length - 1}</span>}</> : placeholder}</span><ChevronDown size={16} /></button>
    {open && <div id={id} className="job-select-menu" role="group" aria-label={label}><div className="job-select-search"><Search size={15} /><input autoFocus aria-label={`Search ${label}`} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search" /></div><div className="job-select-list">
      {multiple && <label><input type="checkbox" checked={!!visible.length && visible.every(option => values.includes(option.value))} onChange={e => onChange(e.target.checked ? Array.from(new Set([...values, ...visible.map(option => option.value)])) : values.filter(value => !visible.some(option => option.value === value)))} />Select all</label>}
      {visible.map(option => multiple ? <label key={option.value}><input type="checkbox" checked={values.includes(option.value)} onChange={e => onChange(e.target.checked ? [...values, option.value] : values.filter(value => value !== option.value))} />{option.label}</label> : <button className="searchable-single-option" type="button" key={option.value} onClick={() => { onChange([option.value]); setOpen(false); trigger.current?.focus(); }}>{option.label}</button>)}
      {!visible.length && <p>No matching options</p>}</div></div>}
  </div>;
}
