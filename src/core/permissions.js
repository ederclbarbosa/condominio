export const labels = {
  admin: 'Administrador geral', administradora: 'Administradora', sindico: 'Síndico', conselho: 'Conselho', portaria: 'Portaria', morador: 'Morador', prestador: 'Prestador'
};

export const modules = [
  { key: 'dashboard', label: 'Dashboard', icon: '🏠', roles: ['admin','administradora','sindico','conselho','portaria','morador','prestador'] },
  { key: 'condominiums', label: 'Condomínios', icon: '🏢', roles: ['admin','administradora','sindico'] },
  { key: 'units', label: 'Unidades', icon: '🚪', roles: ['admin','administradora','sindico','portaria'] },
  { key: 'residents', label: 'Moradores', icon: '👥', roles: ['admin','administradora','sindico','portaria'] },
  { key: 'announcements', label: 'Comunicados', icon: '🔔', roles: ['admin','administradora','sindico','conselho','morador'] },
  { key: 'tickets', label: 'Ocorrências', icon: '📋', roles: ['administradora','sindico','conselho','portaria','morador','prestador'] },
  { key: 'maintenance', label: 'Manutenções', icon: '🔧', roles: ['administradora','sindico','conselho','prestador'] },
  { key: 'reservations', label: 'Reservas', icon: '📅', roles: ['administradora','sindico','morador'] },
  { key: 'visitors', label: 'Visitantes', icon: '🚗', roles: ['administradora','sindico','portaria','morador'] },
  { key: 'packages', label: 'Encomendas', icon: '📦', roles: ['administradora','sindico','portaria','morador'] },
  { key: 'finance', label: 'Financeiro', icon: '💳', roles: ['administradora','sindico','conselho','morador'] },
  { key: 'consumption', label: 'Consumo', icon: '📈', roles: ['administradora','sindico','conselho','morador'] },
  { key: 'documents', label: 'Documentos', icon: '📄', roles: ['administradora','sindico','conselho','morador'] },
  { key: 'assemblies', label: 'Assembleias', icon: '🗳️', roles: ['administradora','sindico','conselho','morador'] },
  { key: 'ai', label: 'IA do regimento', icon: '🤖', roles: ['administradora','sindico','morador'] },
  { key: 'reports', label: 'Relatórios', icon: '📑', roles: ['admin','administradora','sindico','conselho'] },
  { key: 'settings', label: 'Configurações', icon: '⚙️', roles: ['admin','administradora','sindico'] }
];

export function canAccess(role, moduleKey) {
  return modules.find((module) => module.key === moduleKey)?.roles.includes(role) || false;
}

export function canWrite(role, moduleKey) {
  if (role === 'admin') return true;
  if (role === 'portaria') return ['visitors','packages','tickets'].includes(moduleKey);
  if (role === 'morador') return ['tickets','reservations','visitors'].includes(moduleKey);
  if (role === 'prestador') return ['tickets','maintenance'].includes(moduleKey);
  if (role === 'conselho') return false;
  return ['administradora','sindico'].includes(role);
}

export function visibleModules(role) {
  return modules.filter((module) => module.roles.includes(role));
}
