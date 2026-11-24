import { Applicant } from '../types';

type ResumeLine = {
  text: string;
  size: number;
  bold?: boolean;
  spaceBefore?: number;
};

const toPdfText = (value: string): string => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^\x20-\x7e]/g, '')
  .replace(/([\\()])/g, '\\$1');

const wrapText = (value: string, maxLength: number): string[] => {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  words.forEach((word) => {
    if (line && `${line} ${word}`.length > maxLength) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  });

  if (line) lines.push(line);
  return lines;
};

const createResumePdf = (applicant: Applicant): Blob => {
  const lines: ResumeLine[] = [
    { text: applicant.name, size: 20, bold: true, spaceBefore: 4 },
    { text: applicant.currentDesignation, size: 12, bold: true },
    { text: [applicant.email, applicant.phone, applicant.location].filter(Boolean).join(' | '), size: 9 },
    { text: 'PROFESSIONAL SUMMARY', size: 12, bold: true, spaceBefore: 16 },
    { text: applicant.summary || 'Professional summary not provided.', size: 10 }
  ];

  if (applicant.skills?.length) {
    lines.push({ text: 'SKILLS', size: 12, bold: true, spaceBefore: 12 });
    lines.push({ text: applicant.skills.join(', '), size: 10 });
  }

  if (applicant.workHistory?.length) {
    lines.push({ text: 'WORK EXPERIENCE', size: 12, bold: true, spaceBefore: 12 });
    applicant.workHistory.forEach((work) => {
      lines.push({ text: `${work.role} | ${work.company} | ${work.duration}`, size: 10, bold: true, spaceBefore: 4 });
      if (work.summary) lines.push({ text: work.summary, size: 10 });
    });
  }

  const education = applicant.educationDetails?.length ? applicant.educationDetails : applicant.education;
  if (education?.length) {
    lines.push({ text: 'EDUCATION', size: 12, bold: true, spaceBefore: 12 });
    education.forEach((item) => {
      lines.push({ text: `${item.degree} | ${item.school} | ${item.year}`, size: 10 });
    });
  }

  const pageOperations: string[][] = [[]];
  let y = 744;

  lines.forEach((line) => {
    y -= line.spaceBefore || 0;
    const maxLength = Math.floor(520 / (line.size * 0.52));
    wrapText(line.text, maxLength).forEach((text) => {
      if (y < 54) {
        pageOperations.push([]);
        y = 744;
      }
      const font = line.bold ? 'F2' : 'F1';
      pageOperations[pageOperations.length - 1].push(
        `BT /${font} ${line.size} Tf 1 0 0 1 54 ${y} Tm (${toPdfText(text)}) Tj ET`
      );
      y -= line.size + 5;
    });
  });

  const pageIds = pageOperations.map((_, index) => 5 + index * 2);
  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'
  ];

  pageOperations.forEach((operations, index) => {
    const pageId = pageIds[index];
    const contentId = pageId + 1;
    const stream = operations.join('\n');
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`,
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
    );
  });

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
};

export const downloadApplicantResume = (applicant: Applicant): string => {
  const baseName = applicant.name.trim().replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'Applicant';
  const fileName = `${baseName}_Resume.pdf`;
  const url = URL.createObjectURL(createResumePdf(applicant));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return fileName;
};
