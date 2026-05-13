// ──────────────────────────────────────────────
// storageService.js — localStorage CRUD + integrity
// ──────────────────────────────────────────────

const KEYS = {
  cantores: 'lm_cantores',
  epocas: 'lm_epocas',
  tipos: 'lm_tipos',
  musicas: 'lm_musicas',
};

// 24 fundamental keys (12 major + 12 minor)
export const TONS_FUNDAMENTAIS = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm',
];

// ── helpers ────────────────────────────────────
const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const write = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const genId = () => crypto.randomUUID();

// ── generic CRUD ───────────────────────────────
const getAll = (entity) => read(KEYS[entity]);

const getById = (entity, id) => getAll(entity).find((item) => item.id === id) || null;

const create = (entity, payload) => {
  const items = getAll(entity);
  const item = { id: genId(), ...payload };
  items.push(item);
  write(KEYS[entity], items);
  return item;
};

const update = (entity, id, payload) => {
  const items = getAll(entity);
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error('Item não encontrado.');
  items[idx] = { ...items[idx], ...payload };
  write(KEYS[entity], items);
  return items[idx];
};

/**
 * Removes an entity item. Throws if the item is referenced by any música.
 */
const remove = (entity, id) => {
  // referential integrity check
  if (entity !== 'musicas') {
    const musicas = getAll('musicas');
    const fieldMap = {
      cantores: 'cantorId',
      epocas: 'epocaId',
      tipos: 'tipoId',
    };
    const field = fieldMap[entity];
    const inUse = musicas.some((m) => m[field] === id);
    if (inUse) {
      const labels = { cantores: 'cantor', epocas: 'época', tipos: 'tipo' };
      throw new Error(
        `Não é possível excluir: este(a) ${labels[entity]} está associado(a) a uma ou mais músicas.`
      );
    }
  }
  const items = getAll(entity).filter((i) => i.id !== id);
  write(KEYS[entity], items);
};

// ── converter to Dashboard format ──────────────
/**
 * Converts the CRUD data stored in localStorage into the normalized
 * array format that the Dashboard component expects (same shape produced
 * by dataProcessor.js).
 */
const toDashboardFormat = () => {
  const cantores = getAll('cantores');
  const epocas = getAll('epocas');
  const tipos = getAll('tipos');
  const musicas = getAll('musicas');

  const cantorMap = Object.fromEntries(cantores.map((c) => [c.id, c]));
  const epocaMap = Object.fromEntries(epocas.map((e) => [e.id, e]));
  const tipoMap = Object.fromEntries(tipos.map((t) => [t.id, t]));

  const normalizeGenero = (genero) => {
    const value = (genero || '').toString().trim().toLowerCase();
    if (value === 'm' || value === 'masculino' || value === 'homem' || value === 'male') return 'Masculino';
    if (value === 'f' || value === 'feminino' || value === 'mulher' || value === 'female') return 'Feminino';
    if (value === 'masculino' || value === 'feminino') return genero;
    return 'Não informado';
  };

  return musicas.map((m) => {
    const cantor = cantorMap[m.cantorId];
    const generoDashboard = normalizeGenero(m.genero || cantor?.genero);

    return {
      titulo: m.titulo || '',
      cantor: cantor?.nome || 'Desconhecido',
      tom: m.tom || '',
      tipo: tipoMap[m.tipoId]?.nome || 'Desconhecido',
      epoca: epocaMap[m.epocaId]?.nome || 'Desconhecida',
      genero: generoDashboard,
    };
  });
};

/**
 * Returns true when there is at least one música stored.
 */
const hasData = () => getAll('musicas').length > 0;

// ── public API ─────────────────────────────────
const storageService = {
  getAll,
  getById,
  create,
  update,
  remove,
  toDashboardFormat,
  hasData,
  TONS_FUNDAMENTAIS,
};

export default storageService;
