import { useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Users, Music2, Tag, Clock, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import storageService from '../utils/storageService';
import CrudModal from './CrudModal';

// ── tab config ─────────────────────────────────
const TABS = [
  { key: 'cantores', label: 'Cantores', icon: Users, color: 'var(--accent-1)' },
  { key: 'epocas',   label: 'Épocas',   icon: Clock, color: 'var(--accent-4)' },
  { key: 'tipos',    label: 'Tipos',     icon: Tag,   color: 'var(--accent-3)' },
  { key: 'musicas',  label: 'Músicas',   icon: Music2, color: 'var(--accent-5)' },
];

// ── column config per entity ───────────────────
const COLUMN_DEFS = {
  cantores: [
    { header: 'Nome', accessor: 'nome' },
    { header: 'Genero', accessor: 'genero', render: (v) => v === 'M' ? 'Masculino' : 'Feminino' },
  ],
  epocas: [
    { header: 'Nome', accessor: 'nome' },
  ],
  tipos: [
    { header: 'Nome', accessor: 'nome' },
  ],
  musicas: [
    { header: 'Título', accessor: 'titulo' },
    { header: 'Cantor', accessor: 'cantorId', resolve: 'cantores' },
    { header: 'Época', accessor: 'epocaId', resolve: 'epocas' },
    { header: 'Tipo', accessor: 'tipoId', resolve: 'tipos' },
    { header: 'Tom', accessor: 'tom' },
  ],
};

export default function CadastroPage({ onDataChanged }) {
  const [activeTab, setActiveTab] = useState('cantores');
  const [modalState, setModalState] = useState({ open: false, entity: null, item: null });
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [revision, setRevision] = useState(0); // force re-read

  // ── data helpers ─────────────────────────────
  const refresh = useCallback(() => {
    setRevision((r) => r + 1);
    onDataChanged?.();
  }, [onDataChanged]);

  const items = storageService.getAll(activeTab);
  // lookup maps for resolving foreign keys
  const lookups = {
    cantores: Object.fromEntries(storageService.getAll('cantores').map(c => [c.id, c.nome])),
    epocas: Object.fromEntries(storageService.getAll('epocas').map(e => [e.id, e.nome])),
    tipos: Object.fromEntries(storageService.getAll('tipos').map(t => [t.id, t.nome])),
  };

  // ── search filter ────────────────────────────
  const filteredItems = items.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const cols = COLUMN_DEFS[activeTab];
    return cols.some((col) => {
      let val = item[col.accessor] || '';
      if (col.resolve) val = lookups[col.resolve]?.[val] || val;
      return val.toString().toLowerCase().includes(q);
    });
  });

  // ── toast helper ─────────────────────────────
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // ── CRUD handlers ────────────────────────────
  const openCreate = () => setModalState({ open: true, entity: activeTab, item: null });
  const openEdit = (item) => setModalState({ open: true, entity: activeTab, item });
  const closeModal = () => setModalState({ open: false, entity: null, item: null });

  const handleSaved = () => {
    refresh();
    showToast('success', modalState.item ? 'Registro atualizado com sucesso!' : 'Registro criado com sucesso!');
  };

  const handleDelete = (item) => {
    const labels = { cantores: 'cantor', epocas: 'época', tipos: 'tipo', musicas: 'música' };
    const name = item.nome || item.titulo || item.id;
    if (!window.confirm(`Deseja realmente excluir ${labels[activeTab]} "${name}"?`)) return;
    try {
      storageService.remove(activeTab, item.id);
      refresh();
      showToast('success', 'Registro excluído com sucesso!');
    } catch (err) {
      showToast('error', err.message);
    }
  };

  // ── render ───────────────────────────────────
  const columns = COLUMN_DEFS[activeTab];

  // Count items per tab for badges
  const counts = {
    cantores: storageService.getAll('cantores').length,
    epocas: storageService.getAll('epocas').length,
    tipos: storageService.getAll('tipos').length,
    musicas: storageService.getAll('musicas').length,
  };

  return (
    <div className="cadastro-page animate-fade-in">
      {/* ── Tabs ──────────────────────────────── */}
      <div className="cadastro-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              className={`cadastro-tab ${isActive ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.key); setSearch(''); }}
              style={{ '--tab-color': tab.color }}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
              {counts[tab.key] > 0 && (
                <span className="cadastro-tab-badge">{counts[tab.key]}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Toolbar ───────────────────────────── */}
      <div className="cadastro-toolbar glass-panel">
        <div className="cadastro-search-wrapper">
          <Search size={16} className="cadastro-search-icon" />
          <input
            type="text"
            className="input-field cadastro-search"
            placeholder={`Buscar em ${TABS.find(t => t.key === activeTab)?.label}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Adicionar
        </button>
      </div>

      {/* ── Table ─────────────────────────────── */}
      <div className="glass-panel cadastro-table-wrapper">
        {filteredItems.length === 0 ? (
          <div className="cadastro-empty">
            <Music2 size={48} style={{ opacity: 0.15 }} />
            <p>{search ? 'Nenhum resultado encontrado.' : 'Nenhum registro cadastrado ainda.'}</p>
            {!search && (
              <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: '1rem' }}>
                <Plus size={18} /> Adicionar primeiro registro
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="cadastro-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  {columns.map((col) => (
                    <th key={col.accessor}>{col.header}</th>
                  ))}
                  <th style={{ width: '120px', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="cadastro-row-number">{idx + 1}</td>
                    {columns.map((col) => {
                      let val = item[col.accessor] || '-';
                      if (col.resolve) val = lookups[col.resolve]?.[val] || val;
                      if (col.render) val = col.render(val);
                      return <td key={col.accessor}>{val}</td>;
                    })}
                    <td>
                      <div className="cadastro-actions">
                        <button className="cadastro-action-btn edit" title="Editar" onClick={() => openEdit(item)}>
                          <Pencil size={15} />
                        </button>
                        <button className="cadastro-action-btn delete" title="Excluir" onClick={() => handleDelete(item)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="cadastro-table-footer">
          {filteredItems.length} {filteredItems.length === 1 ? 'registro' : 'registros'}
          {search && items.length !== filteredItems.length && ` (de ${items.length} total)`}
        </div>
      </div>

      {/* ── Toast ─────────────────────────────── */}
      {toast && (
        <div className={`cadastro-toast animate-fade-in ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── Modal ─────────────────────────────── */}
      {modalState.open && (
        <CrudModal
          entity={modalState.entity}
          item={modalState.item}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
