import { useState } from 'react';
import DataInput from './components/DataInput';
import Dashboard from './components/Dashboard';
import { Music, LayoutDashboard, ChevronLeft } from 'lucide-react';

const BASE_URL = import.meta.env.BASE_URL;

function App() {
  const [data, setData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleDataLoaded = (parsedData) => {
    setData(parsedData);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
        <div>
          <div className="flex-center gap-2 mb-8" style={{ color: 'var(--accent-1)', position: 'relative' }}>
            <img src={`${BASE_URL}logo.png`} alt="Louvor Metria Logo" style={{ width: '64px', height: '64px', flexShrink: 0, objectFit: 'contain' }} />
            <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Louvor Metria</h1>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn btn-secondary" style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center', border: 'none', background: 'rgba(255,255,255,0.05)' }} title="Dashboard">
              <LayoutDashboard size={18} style={{ flexShrink: 0 }} />
              <span className="sidebar-text">Dashboard</span>
            </button>
            {data && isSidebarOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginLeft: '1.25rem', marginTop: '0', paddingLeft: '0.75rem', borderLeft: '1px solid var(--border-color)' }}>
                <a href="#visao-geral" className="sidebar-text" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none', padding: '0.25rem 0' }}>1. Visão Geral</a>
                <a href="#uso-real" className="sidebar-text" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none', padding: '0.25rem 0' }}>2. Análise de Uso Real</a>
              </div>
            )}
          </nav>
        </div>

        <div style={{ marginTop: 'auto', display: isSidebarOpen ? 'block' : 'none' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Louvor Metria <br /> versão 1.0.0
          </p>
        </div>

        {/* Toggle Button Outside */}
        <button
          className="sidebar-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Recolher menu" : "Expandir menu"}
        >
          <ChevronLeft size={20} />
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="flex-between mb-8">
          <div>
            <h2 style={{ fontSize: '2rem' }}>Dashboard</h2>
            <p>Gerencie as canções e visualize análises estatísticas profundas.</p>
          </div>
          {data && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="#visao-geral" className="btn btn-secondary" style={{ textDecoration: 'none', fontSize: '0.85rem' }}>1. Visão Geral</a>
              <a href="#uso-real" className="btn btn-secondary" style={{ textDecoration: 'none', fontSize: '0.85rem' }}>2. Análise de Uso Real</a>
            </div>
          )}
        </header>

        <DataInput onDataLoaded={handleDataLoaded} />

        {data ? (
          <div style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
            <Dashboard data={data} />
          </div>
        ) : (
          <div className="glass-panel flex-center" style={{ minHeight: '300px', flexDirection: 'column', color: 'var(--text-secondary)' }}>
            <Music size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>Faça o upload de um arquivo ou cole um link para começar.</p>
          </div>
        )}
      </main>

    </div>
  );
}

export default App;
