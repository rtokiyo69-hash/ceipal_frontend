import React, { useEffect, useId, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Anchor,
  Bold,
  CheckSquare,
  Code2,
  Copy,
  FileCode,
  FileText,
  Highlighter,
  Image as ImageIcon,
  Indent,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Outdent,
  Quote,
  Redo2,
  RefreshCw,
  RemoveFormatting,
  Scissors,
  Search,
  Sparkles,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  Type,
  Underline,
  Undo2,
  Unlink
} from 'lucide-react';

export interface RichTextEditorProps {
  value: string;
  resetKey?: number;
  label?: string;
  accentColor?: string;
  onChange: (value: string) => void;
  onError: (message: string) => void;
}

const ALLOWED_TAGS = new Set([
  'A', 'B', 'BLOCKQUOTE', 'BR', 'DIV', 'DEL', 'EM', 'FONT', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'PRE',
  'HR', 'I', 'IMG', 'LI', 'OL', 'P', 'S', 'SPAN', 'STRONG', 'SUB', 'SUP', 'TABLE',
  'TBODY', 'TD', 'TH', 'THEAD', 'TR', 'U', 'UL'
]);
const ALLOWED_STYLES = [
  'background-color',
  'border',
  'border-collapse',
  'color',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'padding',
  'text-align',
  'text-decoration',
  'vertical-align',
  'width'
];

function isSafeUrl(value: string, image = false): boolean {
  const url = value.trim();
  return image
    ? /^https:\/\//i.test(url)
    : /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url);
}

export function sanitizeRichTextHtml(value: string): string {
  const parsed = new DOMParser().parseFromString(value, 'text/html');

  const sanitizeNode = (node: Node): Node[] => {
    if (node.nodeType === Node.TEXT_NODE) {
      return [document.createTextNode(node.textContent || '')];
    }
    if (!(node instanceof Element)) return [];

    const children = Array.from(node.childNodes).flatMap(sanitizeNode);
    if (!ALLOWED_TAGS.has(node.tagName)) return children;

    const clean = document.createElement(node.tagName.toLowerCase());
    const style = node.getAttribute('style');
    if (style) {
      for (const property of ALLOWED_STYLES) {
        const styleValue = node instanceof HTMLElement ? node.style.getPropertyValue(property).trim() : '';
        if (styleValue && !/(url|expression|javascript|@import)/i.test(styleValue)) {
          clean.style.setProperty(property, styleValue);
        }
      }
    }

    if (node.tagName === 'A') {
      const href = node.getAttribute('href');
      if (href && isSafeUrl(href)) {
        clean.setAttribute('href', href);
        clean.setAttribute('rel', 'noopener noreferrer');
        clean.setAttribute('target', '_blank');
      }
      const name = node.getAttribute('name');
      if (name && /^[A-Za-z][\w-]*$/.test(name)) clean.setAttribute('name', name);
    }
    if (node.tagName === 'IMG') {
      const src = node.getAttribute('src');
      if (src && isSafeUrl(src, true)) clean.setAttribute('src', src);
      const alt = node.getAttribute('alt');
      if (alt) clean.setAttribute('alt', alt);
    }
    if (node.tagName === 'FONT') {
      for (const attribute of ['face', 'size', 'color']) {
        const attributeValue = node.getAttribute(attribute);
        if (attributeValue && /^[#(),.%\w "'-]+$/.test(attributeValue)) {
          clean.setAttribute(attribute, attributeValue);
        }
      }
    }
    if (['TD', 'TH'].includes(node.tagName)) {
      for (const attribute of ['colspan', 'rowspan']) {
        const attributeValue = node.getAttribute(attribute);
        if (attributeValue && /^\d{1,2}$/.test(attributeValue)) {
          clean.setAttribute(attribute, attributeValue);
        }
      }
    }
    clean.append(...children);
    return [clean];
  };

  const container = document.createElement('div');
  container.append(...Array.from(parsed.body.childNodes).flatMap(sanitizeNode));
  return container.innerHTML;
}

const COLORS = [
  '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
  '#E05252', '#D97706', '#16A34A', '#2563EB', '#7C3AED', '#DB2777',
  '#2563EB', '#2563EB'
];
const HIGHLIGHT_COLORS = [
  '#FFFF00', '#00FF00', '#00FFFF', '#FF69B4', '#FFA500',
  '#FF6347', '#E6E6FA', '#98FB98', '#87CEEB', '#FFFFFF'
];
const FONT_FAMILIES = [
  'Arial', 'Comic Sans MS', 'Courier New', 'Georgia', 'Lucida Sans',
  'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'
];
const buttonClass = 'rounded p-1 text-[#475569] transition-colors hover:bg-[#E2E8F0] dark:text-[#D8E3F1] dark:hover:bg-[#334155]';

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  resetKey = 0,
  label = 'Rich text',
  accentColor = '#2563EB',
  onChange,
  onError
}) => {
  const editorId = useId();
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [selectedFontSize, setSelectedFontSize] = useState('3');
  const [selectedFormat, setSelectedFormat] = useState('Normal');
  const [selectedStyle, setSelectedStyle] = useState('Normal');
  const [textColor, setTextColor] = useState('#1E293B');
  const [highlightColor, setHighlightColor] = useState('#FFFF00');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showTableInput, setShowTableInput] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableColumns, setTableColumns] = useState(3);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  useEffect(() => {
    if (isSourceMode || !editorRef.current) return;
    editorRef.current.innerHTML = sanitizeRichTextHtml(value);
  }, [isSourceMode, resetKey]);

  useEffect(() => {
    const updateFormattingControls = () => {
      const editor = editorRef.current;
      const selection = window.getSelection();
      if (!editor || !selection?.rangeCount || !selection.anchorNode || !editor.contains(selection.anchorNode)) return;

      const element = selection.anchorNode instanceof Element
        ? selection.anchorNode
        : selection.anchorNode.parentElement;
      const caretElement = element?.closest('[style],h1,h2,h3,h4,h5,h6,blockquote,p,div,pre,span') as HTMLElement | null;
      if (!caretElement) return;

      const computed = window.getComputedStyle(caretElement);
      const fontFamily = computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
      if (FONT_FAMILIES.includes(fontFamily)) setSelectedFont(fontFamily);

      const fontSizePx = parseFloat(computed.fontSize);
      if (Number.isFinite(fontSizePx)) {
        const fontSizePt = Math.round(fontSizePx * 0.75);
        const closest = [
          ['1', 8], ['2', 10], ['3', 12], ['4', 14],
          ['5', 18], ['6', 24], ['7', 36]
        ].reduce((best, option) =>
          Math.abs(Number(option[1]) - fontSizePt) < Math.abs(Number(best[1]) - fontSizePt) ? option : best
        );
        setSelectedFontSize(String(closest[0]));
      }

      const blockTag = caretElement.closest('h1,h2,h3,h4,h5,h6,p,pre,blockquote')?.tagName;
      if (blockTag === 'H1') setSelectedFormat('Heading 1');
      else if (blockTag === 'H2') setSelectedFormat('Heading 2');
      else if (blockTag === 'H3') setSelectedFormat('Heading 3');
      else if (blockTag === 'H4') setSelectedFormat('Heading 4');
      else if (blockTag === 'H5') setSelectedFormat('Heading 5');
      else if (blockTag === 'H6') setSelectedFormat('Heading 6');
      else if (blockTag === 'PRE') setSelectedFormat('Formatted');
      else if (blockTag === 'BLOCKQUOTE') setSelectedFormat('Normal');
      else setSelectedFormat('Normal');

      if (caretElement.closest('blockquote')) setSelectedStyle('Quote');
      else if (computed.fontStyle === 'italic') setSelectedStyle('Italic Title');
      else if (computed.backgroundColor !== 'rgba(0, 0, 0, 0)' && computed.backgroundColor !== 'transparent') setSelectedStyle('Badge Tag');
      else setSelectedStyle('Normal');
    };

    document.addEventListener('selectionchange', updateFormattingControls);
    return () => document.removeEventListener('selectionchange', updateFormattingControls);
  }, []);

  const saveSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (editor && selection?.rangeCount && editor.contains(selection.anchorNode)) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    const range = savedRangeRef.current;
    if (!editor || !selection || !range || !editor.contains(range.startContainer)) return;
    editor.focus();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const syncEditor = () => {
    if (editorRef.current) {
      const html = sanitizeRichTextHtml(editorRef.current.innerHTML);
      onChange(html);
    }
  };

  const runCommand = (command: string, commandValue?: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    restoreSelection();
    editor.focus();
    document.execCommand(command, false, commandValue);
    syncEditor();
    saveSelection();
  };

  const applyFontSize = (fontSizeKey: string) => {
    const sizes: Record<string, number> = {
      '1': 8,
      '2': 10,
      '3': 12,
      '4': 14,
      '5': 18,
      '6': 24,
      '7': 36
    };
    const pointSize = sizes[fontSizeKey] || 12;
    restoreSelection();
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      const span = document.createElement('span');
      span.style.fontSize = `${pointSize}pt`;
      span.appendChild(document.createTextNode('\u200B'));
      range.insertNode(span);
      range.setStart(span.firstChild || span, 1);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      savedRangeRef.current = range.cloneRange();
    } else {
      const span = document.createElement('span');
      span.style.fontSize = `${pointSize}pt`;
      try {
        range.surroundContents(span);
      } catch {
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
      }
      selection.removeAllRanges();
      selection.addRange(range);
    }
    syncEditor();
    saveSelection();
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const html = event.clipboardData.getData('text/html');
    const text = event.clipboardData.getData('text/plain');
    const safeHtml = html
      ? sanitizeRichTextHtml(html)
      : text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    runCommand('insertHTML', safeHtml);
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      runCommand('insertText', text);
    } catch (error) {
      console.error('Unable to read clipboard:', error);
      onError('Clipboard access is unavailable. You can paste with Ctrl+V inside the editor.');
    }
  };

  const pasteFromWord = async () => {
    try {
      if (!navigator.clipboard?.read) {
        await pasteFromClipboard();
        return;
      }
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        if (item.types.includes('text/html')) {
          const html = await (await item.getType('text/html')).text();
          runCommand('insertHTML', sanitizeRichTextHtml(html));
          return;
        }
        if (item.types.includes('text/plain')) {
          const text = await (await item.getType('text/plain')).text();
          runCommand('insertText', text);
          return;
        }
      }
      onError('The clipboard does not contain text or formatted content to paste.');
    } catch (error) {
      console.error('Unable to paste formatted clipboard content:', error);
      onError('Formatted clipboard access is unavailable. Try pasting with Ctrl+V inside the editor.');
    }
  };

  const findInEditor = (replace = false) => {
    const editor = editorRef.current;
    if (!editor || !findText.trim()) {
      onError('Enter text to find in the message.');
      return;
    }
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const index = (node.textContent || '').toLowerCase().indexOf(findText.toLowerCase());
      if (index >= 0) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + findText.length);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        savedRangeRef.current = range.cloneRange();
        if (replace) runCommand('insertText', replaceText);
        else editor.focus();
        return;
      }
      node = walker.nextNode();
    }
    onError(`"${findText}" was not found in the message.`);
  };

  const insertTable = () => {
    const rows = Math.min(10, Math.max(1, tableRows));
    const columns = Math.min(8, Math.max(1, tableColumns));
    let html = '<table style="border-collapse:collapse;width:100%;margin:8px 0"><thead><tr>';
    for (let column = 0; column < columns; column += 1) {
      html += `<th style="border:1px solid #D8E3F1;padding:6px 10px;background-color:#F1F5F9;text-align:left">Column ${column + 1}</th>`;
    }
    html += '</tr></thead><tbody>';
    for (let row = 0; row < rows; row += 1) {
      html += '<tr>';
      for (let column = 0; column < columns; column += 1) {
        html += '<td style="border:1px solid #D8E3F1;padding:6px 10px">&nbsp;</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table><p><br></p>';
    runCommand('insertHTML', html);
    setShowTableInput(false);
  };

  const insertLink = () => {
    if (!isSafeUrl(linkUrl)) {
      onError('Use a valid HTTPS, HTTP, mailto, or telephone link.');
      return;
    }
    runCommand('createLink', linkUrl.trim());
    setLinkUrl('');
    setShowLinkInput(false);
  };

  const insertImage = () => {
    if (!isSafeUrl(imageUrl, true)) {
      onError('Use a secure HTTPS image URL.');
      return;
    }
    runCommand('insertImage', imageUrl.trim());
    setImageUrl('');
    setShowImageInput(false);
  };

  const toolbarButton = (title: string, icon: React.ReactNode, onClick: () => void) => (
    <button
      key={title}
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(event) => { event.preventDefault(); saveSelection(); }}
      onClick={onClick}
      className={buttonClass}
    >
      {icon}
    </button>
  );

  return (
    <div className="overflow-visible border border-[#D8E3F1] bg-white dark:border-[#334155] dark:bg-[#475569]">
      <div className="flex flex-wrap items-center justify-between gap-1 border-b border-[#E2E8F0] bg-[#FFFFFF] px-2 py-1.5 dark:border-[#334155] dark:bg-[#1E293B]">
        <div className="flex flex-wrap items-center gap-0.5">
          {toolbarButton('Clean Format', <Sparkles className="h-3.5 w-3.5 text-amber-600" />, () => runCommand('removeFormat'))}
          {toolbarButton('Cut', <Scissors className="h-3.5 w-3.5" />, () => runCommand('cut'))}
          {toolbarButton('Copy', <Copy className="h-3.5 w-3.5" />, () => runCommand('copy'))}
          {toolbarButton('Paste', <FileText className="h-3.5 w-3.5" />, pasteFromClipboard)}
          {toolbarButton('Paste from Word', <FileCode className="h-3.5 w-3.5 text-[#0061D5]" />, pasteFromWord)}
          <span className="mx-1 h-4 border-l border-[#D8E3F1] dark:border-[#475569]" />
          {toolbarButton('Undo', <Undo2 className="h-3.5 w-3.5" />, () => runCommand('undo'))}
          {toolbarButton('Redo', <Redo2 className="h-3.5 w-3.5" />, () => runCommand('redo'))}
          {toolbarButton('Find and Replace', <Search className="h-3.5 w-3.5" />, () => setShowFindReplace((open) => !open))}
          {toolbarButton('Select All', <CheckSquare className="h-3.5 w-3.5" />, () => runCommand('selectAll'))}
          {toolbarButton('Remove Formatting', <RemoveFormatting className="h-3.5 w-3.5 text-red-500" />, () => runCommand('removeFormat'))}
          <span className="mx-1 h-4 border-l border-[#D8E3F1] dark:border-[#475569]" />
          {toolbarButton('Bold', <Bold className="h-3.5 w-3.5" />, () => runCommand('bold'))}
          {toolbarButton('Italic', <Italic className="h-3.5 w-3.5" />, () => runCommand('italic'))}
          {toolbarButton('Underline', <Underline className="h-3.5 w-3.5" />, () => runCommand('underline'))}
          {toolbarButton('Strikethrough', <Strikethrough className="h-3.5 w-3.5" />, () => runCommand('strikeThrough'))}
          {toolbarButton('Subscript', <Subscript className="h-3.5 w-3.5" />, () => runCommand('subscript'))}
          {toolbarButton('Superscript', <Superscript className="h-3.5 w-3.5" />, () => runCommand('superscript'))}
          <span className="mx-1 h-4 border-l border-[#D8E3F1] dark:border-[#475569]" />
          {toolbarButton('Numbered List', <ListOrdered className="h-3.5 w-3.5" />, () => runCommand('insertOrderedList'))}
          {toolbarButton('Bulleted List', <List className="h-3.5 w-3.5" />, () => runCommand('insertUnorderedList'))}
          {toolbarButton('Decrease Indent', <Outdent className="h-3.5 w-3.5" />, () => runCommand('outdent'))}
          {toolbarButton('Increase Indent', <Indent className="h-3.5 w-3.5" />, () => runCommand('indent'))}
          {toolbarButton('Blockquote', <Quote className="h-3.5 w-3.5" />, () => runCommand('formatBlock', 'blockquote'))}
          <span className="mx-1 h-4 border-l border-[#D8E3F1] dark:border-[#475569]" />
          {toolbarButton('Insert Link', <Link2 className="h-3.5 w-3.5" />, () => setShowLinkInput((open) => !open))}
          {toolbarButton('Unlink', <Unlink className="h-3.5 w-3.5" />, () => runCommand('unlink'))}
          {toolbarButton('Insert Anchor', <Anchor className="h-3.5 w-3.5" />, () => {
            const name = window.prompt('Anchor name:');
            if (name && /^[A-Za-z][\w-]*$/.test(name)) {
              runCommand('insertHTML', `<a name="${name}"></a>`);
            } else if (name) {
              onError('Anchor names must start with a letter and contain only letters, numbers, underscores, or hyphens.');
            }
          })}
          {toolbarButton('Insert Image', <ImageIcon className="h-3.5 w-3.5" />, () => setShowImageInput((open) => !open))}
          {toolbarButton('Insert Table', <Table className="h-3.5 w-3.5" />, () => setShowTableInput((open) => !open))}
          {toolbarButton('Horizontal Rule', <Minus className="h-3.5 w-3.5" />, () => runCommand('insertHorizontalRule'))}
          {toolbarButton('Copyright Symbol', <span className="font-serif text-xs font-bold">©</span>, () => runCommand('insertText', '©'))}
        </div>
        <button
          type="button"
          onMouseDown={(event) => { event.preventDefault(); saveSelection(); }}
          onClick={() => setIsSourceMode((sourceMode) => !sourceMode)}
          aria-pressed={isSourceMode}
          title="Toggle HTML source view"
          className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold ${isSourceMode ? 'bg-[#2563EB] text-white' : 'text-[#475569] hover:bg-[#E2E8F0] dark:text-[#D8E3F1] dark:hover:bg-[#334155]'}`}
        >
          <Code2 className="h-3.5 w-3.5" />
          Source
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1 border-b border-[#E2E8F0] bg-[#F1F5F9] px-2 py-1 dark:border-[#334155] dark:bg-[#475569]">
        {toolbarButton('Align Left', <AlignLeft className="h-3.5 w-3.5" />, () => runCommand('justifyLeft'))}
        {toolbarButton('Align Center', <AlignCenter className="h-3.5 w-3.5" />, () => runCommand('justifyCenter'))}
        {toolbarButton('Align Right', <AlignRight className="h-3.5 w-3.5" />, () => runCommand('justifyRight'))}
        {toolbarButton('Justify', <AlignJustify className="h-3.5 w-3.5" />, () => runCommand('justifyFull'))}
        <span className="mx-1 h-4 border-l border-[#D8E3F1] dark:border-[#475569]" />

        <div className="relative">
          <button type="button" onMouseDown={(event) => { event.preventDefault(); saveSelection(); }} onClick={() => { setShowColorPicker((open) => !open); setShowHighlightPicker(false); }} title="Text Color" className={buttonClass}>
            <Type className="h-3.5 w-3.5" />
            <span className="mx-auto mt-0.5 block h-1 w-3 rounded" style={{ backgroundColor: textColor }} />
          </button>
          {showColorPicker && (
            <div className="absolute left-0 top-full z-50 grid w-40 grid-cols-7 gap-1 rounded-lg border border-[#D8E3F1] bg-white p-2 shadow-xl dark:border-[#334155] dark:bg-[#1E293B]">
              {COLORS.map((color) => (
                <button key={color} type="button" aria-label={`Text color ${color}`} onMouseDown={(event) => { event.preventDefault(); saveSelection(); }} onClick={() => { setTextColor(color); runCommand('foreColor', color); setShowColorPicker(false); }} className="h-4 w-4 rounded border border-gray-300 hover:scale-125 dark:border-gray-600" style={{ backgroundColor: color }} />
              ))}
              <input aria-label="Custom text color" type="color" value={textColor} onChange={(event) => { setTextColor(event.target.value); runCommand('foreColor', event.target.value); }} className="col-span-2 h-6 w-full cursor-pointer" />
            </div>
          )}
        </div>

        <div className="relative">
          <button type="button" onMouseDown={(event) => { event.preventDefault(); saveSelection(); }} onClick={() => { setShowHighlightPicker((open) => !open); setShowColorPicker(false); }} title="Text Highlight" className={buttonClass}>
            <Highlighter className="h-3.5 w-3.5" />
            <span className="mx-auto mt-0.5 block h-1 w-3 rounded" style={{ backgroundColor: highlightColor }} />
          </button>
          {showHighlightPicker && (
            <div className="absolute left-0 top-full z-50 grid w-36 grid-cols-6 gap-1 rounded-lg border border-[#D8E3F1] bg-white p-2 shadow-xl dark:border-[#334155] dark:bg-[#1E293B]">
              {HIGHLIGHT_COLORS.map((color) => (
                <button key={color} type="button" aria-label={`Highlight color ${color}`} onMouseDown={(event) => { event.preventDefault(); saveSelection(); }} onClick={() => { setHighlightColor(color); runCommand('hiliteColor', color); setShowHighlightPicker(false); }} className="h-4 w-4 rounded border border-gray-300 hover:scale-125 dark:border-gray-600" style={{ backgroundColor: color }} />
              ))}
              <button type="button" onMouseDown={(event) => { event.preventDefault(); saveSelection(); }} onClick={() => { runCommand('removeFormat'); setShowHighlightPicker(false); }} className="col-span-6 text-left text-[10px] text-[#1E293B] hover:underline">Remove highlight</button>
            </div>
          )}
        </div>

        <span className="mx-1 h-4 border-l border-[#D8E3F1] dark:border-[#475569]" />
        <select value={selectedStyle} onMouseDown={saveSelection} onChange={(event) => { setSelectedStyle(event.target.value); if (event.target.value === 'Lead Paragraph' || event.target.value === 'Quote') runCommand('formatBlock', 'blockquote'); else if (event.target.value === 'Italic Title') runCommand('italic'); else if (event.target.value === 'Badge Tag') runCommand('hiliteColor', '#FFF0E8'); else runCommand('removeFormat'); }} aria-label="Text style" className="max-w-32 rounded border border-[#D8E3F1] bg-white px-2 py-1 text-[10px] text-[#334155] dark:border-[#475569] dark:bg-[#1E293B] dark:text-white">
          <option value="Normal">Styles</option>
          <option>Lead Paragraph</option>
          <option>Quote</option>
          <option>Badge Tag</option>
          <option>Italic Title</option>
        </select>
        <select value={selectedFormat} onMouseDown={saveSelection} onChange={(event) => { setSelectedFormat(event.target.value); runCommand('formatBlock', event.target.value === 'Normal' ? 'p' : event.target.value === 'Formatted' ? 'pre' : event.target.value.toLowerCase().replace('heading ', 'h')); }} aria-label="Paragraph format" className="max-w-36 rounded border border-[#D8E3F1] bg-white px-2 py-1 text-[10px] text-[#334155] dark:border-[#475569] dark:bg-[#1E293B] dark:text-white">
          <option value="Normal">Format (Normal)</option>
          <option value="Heading 1">Heading 1</option>
          <option value="Heading 2">Heading 2</option>
          <option value="Heading 3">Heading 3</option>
          <option value="Heading 4">Heading 4</option>
          <option value="Heading 5">Heading 5</option>
          <option value="Heading 6">Heading 6</option>
          <option value="Formatted">Formatted</option>
        </select>
        <select value={selectedFont} onMouseDown={saveSelection} onChange={(event) => { setSelectedFont(event.target.value); runCommand('fontName', event.target.value); }} aria-label="Font family" className="max-w-40 rounded border border-[#D8E3F1] bg-white px-2 py-1 text-[10px] text-[#334155] dark:border-[#475569] dark:bg-[#1E293B] dark:text-white">
          {FONT_FAMILIES.map((font) => <option key={font} value={font}>{font}</option>)}
        </select>
        <select value={selectedFontSize} onMouseDown={saveSelection} onChange={(event) => { setSelectedFontSize(event.target.value); applyFontSize(event.target.value); }} aria-label="Font size" className="w-20 rounded border border-[#D8E3F1] bg-white px-2 py-1 text-[10px] text-[#334155] dark:border-[#475569] dark:bg-[#1E293B] dark:text-white">
          <option value="1">8 pt</option>
          <option value="2">10 pt</option>
          <option value="3">12 pt</option>
          <option value="4">14 pt</option>
          <option value="5">18 pt</option>
          <option value="6">24 pt</option>
          <option value="7">36 pt</option>
        </select>
      </div>

      {showFindReplace && (
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] bg-white p-2 dark:border-[#334155] dark:bg-[#1E293B]">
          <input value={findText} onChange={(event) => setFindText(event.target.value)} placeholder="Find text" className="min-w-32 rounded border border-[#D8E3F1] px-2 py-1 text-[11px] dark:border-[#475569] dark:bg-[#475569] dark:text-white" />
          <input value={replaceText} onChange={(event) => setReplaceText(event.target.value)} placeholder="Replace with" className="min-w-32 rounded border border-[#D8E3F1] px-2 py-1 text-[11px] dark:border-[#475569] dark:bg-[#475569] dark:text-white" />
          <button type="button" onClick={() => findInEditor()} className="rounded bg-[#FFFFFF] px-2 py-1 text-[10px] font-semibold text-[#1E293B]">Find</button>
          <button type="button" onClick={() => findInEditor(true)} className="rounded bg-[#FFFFFF] px-2 py-1 text-[10px] font-semibold text-[#1E293B]">Replace next</button>
        </div>
      )}

      {showLinkInput && (
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] bg-white p-2 dark:border-[#334155] dark:bg-[#1E293B]">
          <label htmlFor={`${editorId}-link`} className="text-[10px] font-semibold">Link URL</label>
          <input id={`${editorId}-link`} type="url" value={linkUrl} onMouseDown={saveSelection} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://..." className="min-w-0 flex-1 rounded border border-[#D8E3F1] px-2 py-1 text-[11px] dark:border-[#475569] dark:bg-[#475569] dark:text-white" />
          <button type="button" onMouseDown={(event) => { event.preventDefault(); saveSelection(); }} onClick={insertLink} className="rounded bg-[#2563EB] px-3 py-1 text-[10px] font-bold text-white">Insert Link</button>
          <button type="button" onClick={() => setShowLinkInput(false)} className="text-[#64748B]" aria-label="Close link editor">×</button>
        </div>
      )}

      {showImageInput && (
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] bg-white p-2 dark:border-[#334155] dark:bg-[#1E293B]">
          <label htmlFor={`${editorId}-image`} className="text-[10px] font-semibold">Image URL</label>
          <input id={`${editorId}-image`} type="url" value={imageUrl} onMouseDown={saveSelection} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." className="min-w-0 flex-1 rounded border border-[#D8E3F1] px-2 py-1 text-[11px] dark:border-[#475569] dark:bg-[#475569] dark:text-white" />
          <button type="button" onMouseDown={(event) => { event.preventDefault(); saveSelection(); }} onClick={insertImage} className="rounded bg-[#2563EB] px-3 py-1 text-[10px] font-bold text-white">Insert Image</button>
          <button type="button" onClick={() => setShowImageInput(false)} className="text-[#64748B]" aria-label="Close image editor">×</button>
        </div>
      )}

      {showTableInput && (
        <div className="flex flex-wrap items-center gap-3 border-b border-[#E2E8F0] bg-white p-2 text-[10px] dark:border-[#334155] dark:bg-[#1E293B]">
          <span className="font-semibold">Insert table</span>
          <label className="flex items-center gap-1">Rows <input type="number" min={1} max={10} value={tableRows} onChange={(event) => setTableRows(Number(event.target.value))} className="w-14 rounded border px-1 py-0.5 dark:border-[#475569] dark:bg-[#475569]" /></label>
          <label className="flex items-center gap-1">Columns <input type="number" min={1} max={8} value={tableColumns} onChange={(event) => setTableColumns(Number(event.target.value))} className="w-14 rounded border px-1 py-0.5 dark:border-[#475569] dark:bg-[#475569]" /></label>
          <button type="button" onMouseDown={(event) => { event.preventDefault(); saveSelection(); }} onClick={insertTable} className="rounded bg-[#2563EB] px-3 py-1 font-bold text-white">Insert</button>
          <button type="button" onClick={() => setShowTableInput(false)} className="text-[#64748B]" aria-label="Close table editor">×</button>
        </div>
      )}

      {isSourceMode ? (
        <textarea
          aria-label={`${label} HTML source`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-[280px] w-full resize-y bg-white p-3 font-mono text-[11px] text-[#1E293B] outline-none dark:bg-[#475569] dark:text-white"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-label={label}
          aria-multiline="true"
          spellCheck
          onFocus={saveSelection}
          onMouseUp={saveSelection}
          onKeyUp={saveSelection}
          onInput={syncEditor}
          onPaste={handlePaste}
          className="min-h-[280px] w-full overflow-auto bg-white p-3 text-xs leading-6 text-[#334155] outline-none dark:bg-[#1E293B] dark:text-white [&_table]:border-collapse [&_td]:border [&_td]:border-slate-300 [&_td]:p-1 [&_th]:border [&_th]:border-slate-300 [&_th]:p-1"
          style={{ borderTop: `2px solid ${accentColor}` }}
        />
      )}
    </div>
  );
};
