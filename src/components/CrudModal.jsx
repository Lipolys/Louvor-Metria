import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save } from 'lucide-react';
import storageService, { TONS_FUNDAMENTAIS } from '../utils/storageService';

/**
 * Reusable modal for creating / editing any entity.
 *
 * Props:
 *  - entity: 'cantores' | 'epocas' | 'tipos' | 'musicas'
 *  - item: null (create mode) | existing object (edit mode)
 *  - onClose: () => void
 *  - onSaved: () => void  – called after successful save
 */
export default function CrudModal({ entity, item, onClose, onSaved }) {
  const isEdit = !!item;
  const firstInput = useRef(null);

  // ── per-entity field definitions ─────────────
  const cantores = storageService.getAll('cantores');
  const epocas   = storageService.getAll('epocas');
  const tipos    = storageService.getAll('tipos');

  const fieldDefs = {
    cantores: [
      { key: 'nome', label: 'Nome', type: 'text', required: true },
      { key: 'sexo', label: 'Sexo', type: 'select', options: [{ value: 'M', label: 'Masculino' }, { value: 'F', label: 'Feminino' }], required: true },
    ],
    epocas: [
      { key: 'nome', label: 'Nome da Época', type: 'text', required: true, placeholder: 'Ex: Antiga, Recente' },
    ],
    tipos: [
      { key: 'nome', label: 'Nome do Tipo', type: 'text', required: true, placeholder: 'Ex: Louvor, Adoração, Hino' },
    ],
    musicas: [
      { key: 'titulo', label: 'Título da Música', type: 'text', required: true },
      { key: 'cantorId', label: 'Cantor', type: 'select', options: cantores.map(c => ({ value: c.id, label: `${c.nome} (${c.sexo === 'M' ? 'Masc.' : 'Fem.'})` })), required: true, emptyLabel: 'Selecione um cantor…' },
      { key: 'epocaId', label: 'Época', type: 'select', options: epocas.map(e => ({ value: e.id, label: e.nome })), required: true, emptyLabel: 'Selecione uma época…' },
      { key: 'tipoId', label: 'Tipo', type: 'select', options: tipos.map(t => ({ value: t.id, label: t.nome })), required: true, emptyLabel: 'Selecione um tipo…' },
      { key: 'tom', label: 'Tom', type: 'select', options: TONS_FUNDAMENTAIS.map(t => ({ value: t, label: t })), required: true, emptyLabel: 'Selecione um tom…' },
    ],
  };

  const fields = fieldDefs[entity] || [];

  // ── form state ───────────────────────────────
  const buildInitial = () => {
    const init = {};
    fields.forEach(f => {
      init[f.key] = item ? (item[f.key] || '') : '';
    });
    return init;
  };

  const [form, setForm] = useState(buildInitial);
  const [error, setError] = useState('');

  useEffect(() => { firstInput.current?.focus(); }, []);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // basic required validation
    for (const f of fields) {
      if (f.required && !form[f.key]?.toString().trim()) {
        setError(`O campo "${f.label}" é obrigatório.`);
        return;
      }
    }

    try {
      if (isEdit) {
        storageService.update(entity, item.id, form);
      } else {
        storageService.create(entity, form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  // ── titles ───────────────────────────────────
  const entityLabels = {
    cantores: 'Cantor',
    epocas: 'Época',
    tipos: 'Tipo',
    musicas: 'Música',
  };
  const title = `${isEdit ? 'Editar' : 'Novo(a)'} ${entityLabels[entity]}`;

  // ── render ───────────────────────────────────
  return createPortal(
    <div className="crud-overlay" onClick={onClose}>
      <div className="crud-modal glass-panel animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="crud-modal-header">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="btn btn-secondary crud-close-btn" onClick={onClose} title="Fechar">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="crud-modal-body">
          {fields.map((f, idx) => (
            <div className="crud-field" key={f.key}>
              <label className="input-label" htmlFor={`crud-${f.key}`}>{f.label}</label>
              {f.type === 'text' ? (
                <input
                  ref={idx === 0 ? firstInput : undefined}
                  id={`crud-${f.key}`}
                  type="text"
                  className="input-field"
                  placeholder={f.placeholder || ''}
                  value={form[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                />
              ) : (
                <select
                  ref={idx === 0 ? firstInput : undefined}
                  id={`crud-${f.key}`}
                  className="input-field"
                  value={form[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                >
                  <option value="">{f.emptyLabel || '— Selecione —'}</option>
                  {f.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              )}
            </div>
          ))}

          {/* Error */}
          {error && (
            <div className="crud-error animate-fade-in">{error}</div>
          )}

          {/* Actions */}
          <div className="crud-modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> {isEdit ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
