import { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

export default function ChartHelp({ text }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="chart-help-wrapper" ref={ref}>
      <button
        className="chart-help-btn"
        onClick={() => setOpen(!open)}
        title="Como interpretar este gráfico"
        aria-label="Ajuda"
      >
        <HelpCircle size={16} />
      </button>
      {open && (
        <div className="chart-help-popup animate-fade-in">
          <div className="chart-help-header">
            <span>💡 Como interpretar</span>
            <button onClick={() => setOpen(false)} className="chart-help-close"><X size={14} /></button>
          </div>
          <p>{text}</p>
        </div>
      )}
    </div>
  );
}
