'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2, CheckCircle2 } from 'lucide-react';

async function exportToPDF(elementId) {
  // Dynamic imports to keep bundle lean
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  const element = document.getElementById(`msg-${elementId}`);
  if (!element) throw new Error('Content element not found');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentW = pageW - margin * 2;

  // Header
  pdf.setFillColor(16, 185, 129); // emerald-500
  pdf.rect(0, 0, pageW, 18, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('NextStepDoctor AI — Research Report', margin, 12);

  pdf.setTextColor(180, 220, 200);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${new Date().toLocaleString()}`, pageW - margin, 12, { align: 'right' });

  // Content image (paginated)
  const imgH = (canvas.height * contentW) / canvas.width;
  let yOffset = 22; // below header
  let remaining = imgH;
  let srcY = 0;

  while (remaining > 0) {
    const available = pageH - yOffset - 14; // bottom margin for disclaimer
    const sliceH = Math.min(remaining, available);
    const sliceRatio = sliceH / imgH;
    const srcSliceH = canvas.height * sliceRatio;

    // Create a slice of the canvas
    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = srcSliceH;
    const ctx = slice.getContext('2d');
    ctx.drawImage(canvas, 0, srcY, canvas.width, srcSliceH, 0, 0, canvas.width, srcSliceH);

    pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, yOffset, contentW, sliceH);

    remaining -= sliceH;
    srcY += srcSliceH;

    if (remaining > 0) {
      pdf.addPage();
      yOffset = 10;
    }
  }

  // Disclaimer on last page
  const lastY = pageH - 10;
  pdf.setTextColor(160, 160, 160);
  pdf.setFontSize(7);
  pdf.text(
    'Disclaimer: This is AI-generated medical research analysis. Not medical advice. Always consult a qualified healthcare professional.',
    pageW / 2,
    lastY,
    { align: 'center' },
  );

  pdf.save(`nextstep-report-${Date.now()}.pdf`);
}

export default function ExportButton({ msgId }) {
  const [status, setStatus] = useState('idle'); // idle | loading | done | error

  const handleExport = async () => {
    setStatus('loading');
    try {
      await exportToPDF(msgId);
      setStatus('done');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const label = {
    idle: 'Export PDF',
    loading: 'Generating…',
    done: 'Downloaded!',
    error: 'Failed',
  }[status];

  const icon = {
    idle: <Download size={13} />,
    loading: <Loader2 size={13} className="animate-spin" />,
    done: <CheckCircle2 size={13} />,
    error: <Download size={13} />,
  }[status];

  const color = {
    idle: 'border-zinc-200 text-zinc-500 hover:bg-zinc-50',
    loading: 'border-zinc-200 text-zinc-400 cursor-not-allowed',
    done: 'border-emerald-200 text-emerald-600 bg-emerald-50',
    error: 'border-red-200 text-red-500',
  }[status];

  return (
    <motion.button
      onClick={handleExport}
      disabled={status === 'loading'}
      whileHover={status === 'idle' ? { scale: 1.03 } : undefined}
      whileTap={status === 'idle' ? { scale: 0.97 } : undefined}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${color}`}
    >
      {icon}
      {label}
    </motion.button>
  );
}
