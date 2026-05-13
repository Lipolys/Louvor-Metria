import { useState, useCallback } from 'react';
import DataInput from './components/DataInput';
import Dashboard from './components/Dashboard';
import CadastroPage from './components/CadastroPage';
import storageService from './utils/storageService';
import { Music, LayoutDashboard, ChevronLeft, ClipboardList, Database, Trash2 } from 'lucide-react';

const BASE_URL = import.meta.env.BASE_URL;

function App() {
  const [data, setData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' | 'cadastro'
  const [dataSource, setDataSource] = useState(null); // 'import' | 'cadastro' | null

  const handleDataLoaded = (parsedData) => {
    setData(parsedData);
    setDataSource('import');
  };

  const handleClearData = () => {
      setData(null);
  };

  const handleUseCadastroData = useCallback(() => {
    if (storageService.hasData()) {
      const converted = storageService.toDashboardFormat();
      setData(converted);
      setDataSource('cadastro');
    }
  }, []);

  const handleCadastroDataChanged = useCallback(() => {
    // If user is already viewing cadastro data in the dashboard, refresh it
    if (dataSource === 'cadastro') {
      const converted = storageService.toDashboardFormat();
      setData(converted);
    }
  }, [dataSource]);

  const navigateTo = (page) => {
    setCurrentPage(page);
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
            <button
              className={`btn btn-secondary sidebar-nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
              style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center', border: 'none', background: 'rgba(255,255,255,0.05)' }}
              title="Dashboard"
              onClick={() => {
                // If already on dashboard, just scroll to top of page; otherwise navigate to dashboard
                if (currentPage === 'dashboard') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  navigateTo('dashboard');
                }
              }}
            >
              <LayoutDashboard size={18} style={{ flexShrink: 0 }} />
              <span className="sidebar-text">Dashboard</span>
            </button>
            {data && currentPage === 'dashboard' && isSidebarOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginLeft: '1.25rem', marginTop: '0', paddingLeft: '0.75rem', borderLeft: '1px solid var(--border-color)' }}>
                <a href="#visao-geral" className="sidebar-text" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none', padding: '0.25rem 0' }}>1. Composição</a>
                <a href="#perfil-cantores" className="sidebar-text" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none', padding: '0.25rem 0' }}>2. Perfis & Cruzamentos</a>
                <a href="#uso-real" className="sidebar-text" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none', padding: '0.25rem 0' }}>3. Desempenho & Histórico</a>
                <a href="#analise-genero" className="sidebar-text" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none', padding: '0.25rem 0' }}>4. Análise por Gênero</a>
              </div>
            )}
            <button
              className={`btn btn-secondary sidebar-nav-btn ${currentPage === 'cadastro' ? 'active' : ''}`}
              style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center', border: '1px solid transparent' }}
              title="Cadastro"
              onClick={() => navigateTo('cadastro')}
            >
              <ClipboardList size={18} style={{ flexShrink: 0 }} />
              <span className="sidebar-text">Cadastro</span>
            </button>
          </nav>
        </div>

        <div style={{ marginTop: 'auto', display: isSidebarOpen ? 'block' : 'none' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Louvor Metria <br /> versão 2.0.0
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

      {/* ══════════════════════════════════════════ */}
      {/* DASHBOARD PAGE                            */}
      {/* ══════════════════════════════════════════ */}
      {currentPage === 'dashboard' && (
          <>
          <header className="flex-between mb-8">
              <div>
                <h2 style={{ fontSize: '2rem' }}>Dashboard</h2>
                <p>Gerencie as canções e visualize análises estatísticas profundas.</p>
              </div>
              {data && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <a href="#visao-geral" className="btn btn-secondary" style={{ textDecoration: 'none', fontSize: '0.85rem' }}>1. Composição</a>
                  <a href="#perfil-cantores" className="btn btn-secondary" style={{ textDecoration: 'none', fontSize: '0.85rem' }}>2. Perfis</a>
                  <a href="#uso-real" className="btn btn-secondary" style={{ textDecoration: 'none', fontSize: '0.85rem' }}>3. Histórico</a>
                  <a href="#analise-genero" className="btn btn-secondary" style={{ textDecoration: 'none', fontSize: '0.85rem' }}>4. Gênero</a>
                  <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 0.25rem' }} />
                  <button
                    className="btn btn-secondary"
                    onClick={handleClearData}
                    style={{ fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                    title="Limpar dados do dashboard"
                  >
                    <Trash2 size={16} /> Limpar
                  </button>
                </div>
          )}
        </header>

            <DataInput onDataLoaded={handleDataLoaded} />

            {/* Use cadastro data button */}
            {storageService.hasData() && dataSource !== 'cadastro' && (
              <div className="glass-panel flex-center" style={{ marginBottom: '2rem', padding: '1rem 1.5rem', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Database size={20} style={{ color: 'var(--accent-3)', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Você tem <strong style={{ color: 'var(--text-primary)' }}>{storageService.getAll('musicas').length} músicas</strong> cadastradas no aplicativo.
                </span>
                <button className="btn btn-primary" style={{ marginLeft: 'auto', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }} onClick={handleUseCadastroData}>
                  <Database size={16} /> Usar dados do cadastro
                </button>
              </div>
            )}

            {dataSource === 'cadastro' && (
              <div className="flex-center gap-2" style={{ color: 'var(--accent-3)', marginBottom: '1rem', padding: '0.6rem 1rem', background: 'rgba(16,185,129,0.1)', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                <Database size={16} />
                <span>Exibindo dados do cadastro local ({data?.length} músicas)</span>
              </div>
            )}

            {data ? (
              <div style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
                <Dashboard data={data} />
              </div>
            ) : (
              <div className="glass-panel flex-center" style={{ minHeight: '300px', flexDirection: 'column', color: 'var(--text-secondary)' }}>
                <Music size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>Faça o upload de um arquivo, cole um link ou use os dados cadastrados para começar.</p>
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* CADASTRO PAGE                             */}
        {/* ══════════════════════════════════════════ */}
        {currentPage === 'cadastro' && (
          <>
            <header className="flex-between mb-8">
              <div>
                <h2 style={{ fontSize: '2rem' }}>Cadastro</h2>
                <p>Cadastre cantores, épocas, tipos e músicas diretamente no navegador.</p>
              </div>
              {storageService.hasData() && (
                <button
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => {
                    handleUseCadastroData();
                    navigateTo('dashboard');
                  }}
                >
                  <LayoutDashboard size={16} /> Ver no Dashboard
                </button>
              )}
            </header>
            <CadastroPage onDataChanged={handleCadastroDataChanged} />
          </>
        )}

      </main>

    </div>
  );
}

export default App;
