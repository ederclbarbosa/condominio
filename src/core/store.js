import { seed } from '../data/seed.js';

const KEY = 'condoflow.v2';
const clone = (value) => JSON.parse(JSON.stringify(value));

export function loadState() {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const initial = { ...clone(seed), session: { userId: 'u-syndic', condominiumId: 'c1' } };
    localStorage.setItem(KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(raw);
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(KEY);
  return loadState();
}

export function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function nowText() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function currentUser(state) {
  return state.users.find((user) => user.id === state.session.userId);
}

export function currentCondominium(state) {
  return state.condominiums.find((condo) => condo.id === state.session.condominiumId);
}

export function scoped(state, collection) {
  const user = currentUser(state);
  const items = state[collection] || [];
  if (user.role === 'admin') return items;
  return items.filter((item) => item.condominiumId === state.session.condominiumId);
}

export function logAction(state, action, entity, entityId, metadata = {}) {
  const user = currentUser(state);
  state.auditLogs.unshift({
    id: uid('log'),
    condominiumId: state.session.condominiumId,
    actor: user.name,
    role: user.role,
    action,
    entity,
    entityId,
    at: nowText(),
    ip: '127.0.0.1',
    metadata
  });
}
