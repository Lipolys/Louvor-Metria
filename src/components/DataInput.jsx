import { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, AlertCircle, CheckCircle2, Info, X, Download } from 'lucide-react';
import { createPortal } from 'react-dom';
import { parseFile, fetchGoogleSheet } from '../utils/dataProcessor';

const BASE_URL = import.meta.env.BASE_URL;

export default function DataInput({ onDataLoaded }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef(null);

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const data = await fetchGoogleSheet(url);
      setSuccess(`Foram carregadas ${data.length} canções via Planilha.`);
      onDataLoaded(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar link.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await parseFile(file);
      setSuccess(`Foram carregadas ${data.length} canções via Arquivo.`);
      onDataLoaded(data);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Erro ao processar arquivo.');
    } finally {
      setLoading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="glass-panel" style={{ marginBottom: '2rem' }}>
      <h3 className="flex-between mb-4">
        <span>Carregar Dados</span>
        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }} onClick={() => setShowHelp(true)}>
          <Info size={16} /> Como formatar meus dados?
        </button>
      </h3>
      
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: 0 }}>
        
        {/* URL Input */}
        <div>
          <label className="input-label">Link Planilha Google</label>
          <form onSubmit={handleUrlSubmit} className="flex-between gap-2">
            <input 
              type="text" 
              className="input-field" 
              placeholder="https://docs.google.com/spreadsheets/d/.../edit"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" disabled={loading || !url}>
              <LinkIcon size={18} /> Importar
            </button>
          </form>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: 0 }}>
            A planilha deve estar pública ("Qualquer pessoa com o link").
          </p>
        </div>

        {/* File Input */}
        <div>
          <label className="input-label">Upload de Arquivo (CSV, Excel, JSON)</label>
          <div className="flex-between gap-2">
            <input 
              type="file" 
              accept=".csv, .xlsx, .xls, .json"
              className="input-field" 
              onChange={handleFileUpload}
              ref={fileInputRef}
              disabled={loading}
            />
            <button 
              className="btn btn-secondary" 
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              <Upload size={18} /> Procurar
            </button>
          </div>
        </div>

      </div>

      {/* Messages */}
      {error && (
        <div className="flex-center gap-2 animate-fade-in" style={{ color: '#ef4444', marginTop: '1.5rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '0.5rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="flex-center gap-2 animate-fade-in" style={{ color: '#10b981', marginTop: '1.5rem', padding: '1rem', background: 'rgba(16,185,129,0.1)', borderRadius: '0.5rem' }}>
          <CheckCircle2 size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 99999, padding: '2rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '720px', background: 'var(--bg-secondary)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowHelp(false)} className="btn btn-secondary" style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.5rem' }}>
              <X size={20} />
            </button>
            <h2 className="mb-4">Como formatar sua planilha?</h2>
            <p>Para que o painel funcione corretamente, sua planilha deve conter colunas com os seguintes nomes na primeira linha (cabeçalho):</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { col: 'Titulo', desc: 'O nome da música', color: '#3b82f6' },
                { col: 'Tom', desc: 'Tonalidade (ex: C, G, Am)', color: '#8b5cf6' },
                { col: 'Cantor', desc: 'Quem canta a música', color: '#10b981' },
                { col: 'Genero', desc: 'Gênero do cantor (M ou F)', color: '#ec4899' },
                { col: 'Tipo', desc: 'Estilo (ex: Adoração)', color: '#f59e0b' },
                { col: 'Epoca', desc: 'Época (Antiga ou Recente)', color: '#06b6d4' },
              ].map(item => (
                <div key={item.col} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: `3px solid ${item.color}` }}>
                  <strong style={{ color: item.color, minWidth: '55px' }}>{item.col}</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.desc}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <strong style={{ color: '#ec4899' }}>Valores aceitos para Genero:</strong>
              <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                <strong>M</strong>, Masculino, Homem · <strong>F</strong>, Feminino, Mulher
              </span>
            </div>

            <p style={{ marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>Exemplo de como sua planilha deve ficar:</p>
            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.15)' }}>
                    {['Titulo', 'Tom', 'Cantor', 'Genero', 'Tipo', 'Epoca', '10/05', '17/05'].map(h => (
                      <th key={h} style={{ padding: '0.4rem 0.6rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Grandioso', 'G', 'João', 'M', 'Adoração', 'Antiga', 'TRUE', ''],
                    ['Santo Espírito', 'C', 'Maria', 'F', 'Espiritual', 'Recente', '', 'X'],
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {row.map((cell, j) => (
                        <td key={j} style={{ padding: '0.4rem 0.6rem', color: cell === 'TRUE' || cell === 'X' ? '#10b981' : 'var(--text-primary)' }}>{cell || <span style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <p>Você pode adicionar <strong>colunas de datas</strong> (ex: 10/05/2026, 17/05/2026, etc.) após a coluna de Epoca para monitorar as execuções. Para que uma canção seja contabilizada naquele dia, preencha a célula com <strong>TRUE</strong> ou <strong>X</strong> (deixe vazio ou use FALSE caso não tenha sido tocada).</p>

            <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center' }}>
              <p className="mb-4" style={{ fontWeight: 600 }}>Quer facilitar? Baixe nosso modelo pronto:</p>
              <a href={`${BASE_URL}modelo.csv`} download className="btn btn-primary" style={{ textDecoration: 'none' }}>
                <Download size={18} /> Baixar modelo.csv
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
