import { canAccess, labels, visibleModules } from './core/permissions.js';
import { currentCondominium, currentUser, loadState, logAction, nowText, resetState, saveState, today, uid } from './core/store.js';
import { aiPanel, dashboard, filteredForUser, genericList, reports, settings } from './modules/renderers.js';

let state = loadState();
let active = 'dashboard';
const root = document.getElementById('root');

function render() {
  const user = currentUser(state);
  if (!canAccess(user.role, active)) active = 'dashboard';
  const condo = currentCondominium(state);
  root.innerHTML = `<div class="app-shell"><aside class="sidebar"><div class="brand"><div class="logo">${condo.logo || 'CF'}</div><div><strong>CondoFlow</strong><span>Plataforma condominial completa</span></div></div>${sessionBox()}<nav>${visibleModules(user.role).map((module) => `<button data-nav="${module.key}" class="${active === module.key ? 'active' : ''}"><b>${module.icon}</b>${module.label}</button>`).join('')}</nav><button class="ghost" data-reset>Restaurar demo</button></aside><main><header class="topbar"><div><p>${condo.name} • ${labels[user.role]}</p><h1>${visibleModules(user.role).find((module) => module.key === active)?.label || 'Dashboard'}</h1></div><div class="actions"><button data-open-search>🔎 Buscar</button><button class="primary" data-open-form="tickets">📋 Novo chamado</button></div></header>${route()}</main><div class="mobile-nav">${visibleModules(user.role).slice(0,5).map((module) => `<button data-nav="${module.key}" class="${active === module.key ? 'active' : ''}"><b>${module.icon}</b><span>${module.label.split(' ')[0]}</span></button>`).join('')}</div><div id="modal"></div></div>`;
  bindEvents();
}

function sessionBox() {
  const user = currentUser(state);
  const allowedCondos = state.condominiums.filter((condo) => user.condominiumIds.includes(condo.id));
  return `<section class="session"><label>Usuário</label><select id="user-select">${state.users.map((item) => `<option value="${item.id}" ${item.id === user.id ? 'selected' : ''}>${item.name} — ${labels[item.role]}</option>`).join('')}</select><label>Condomínio</label><select id="condo-select">${allowedCondos.map((item) => `<option value="${item.id}" ${item.id === state.session.condominiumId ? 'selected' : ''}>${item.name}</option>`).join('')}</select><small>${user.email}</small></section>`;
}

function route() {
  if (active === 'dashboard') return dashboard(state);
  if (active === 'reports') return reports(state);
  if (active === 'settings') return settings(state);
  if (active === 'ai') return aiPanel(state);
  return genericList(state, active);
}

function bindEvents() {
  document.querySelectorAll('[data-nav]').forEach((button) => button.addEventListener('click', () => { active = button.dataset.nav; render(); }));
  document.getElementById('user-select').addEventListener('change', (event) => {
    state.session.userId = event.target.value;
    const user = currentUser(state);
    state.session.condominiumId = user.condominiumIds[0];
    saveState(state); active = 'dashboard'; render();
  });
  document.getElementById('condo-select').addEventListener('change', (event) => { state.session.condominiumId = event.target.value; saveState(state); render(); });
  document.querySelectorAll('[data-open-form]').forEach((button) => button.addEventListener('click', () => openForm(button.dataset.openForm)));
  document.querySelectorAll('[data-export]').forEach((button) => button.addEventListener('click', () => exportCsv(button.dataset.export)));
  document.querySelector('[data-reset]')?.addEventListener('click', () => { state = resetState(); active = 'dashboard'; render(); });
  document.querySelector('[data-open-search]')?.addEventListener('click', openSearch);
  document.querySelector('[data-action="quick-ticket"]')?.addEventListener('click', () => openForm('tickets'));
  document.querySelector('[data-ai-answer]')?.addEventListener('click', answerQuestion);
  document.getElementById('search')?.addEventListener('input', filterVisibleTable);
}

function openForm(moduleKey) {
  const fields = formFields(moduleKey);
  if (!fields.length) return showToast('Este módulo ainda não possui formulário rápido.');
  const modal = document.getElementById('modal');
  modal.innerHTML = `<div class="modal-backdrop"><form class="modal-card" id="record-form"><button type="button" class="close" data-close>×</button><h2>${formTitle(moduleKey)}</h2><p>Preencha os campos principais. O registro será persistido no localStorage e auditado.</p>${fields.map(fieldHtml).join('')}<footer><button type="button" data-close>Cancelar</button><button class="primary">Salvar</button></footer></form></div>`;
  modal.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', closeModal));
  modal.querySelector('form').addEventListener('submit', (event) => { event.preventDefault(); saveRecord(moduleKey, new FormData(event.currentTarget)); closeModal(); render(); });
}

function formFields(moduleKey) {
  const units = state.units.filter((unit) => unit.condominiumId === state.session.condominiumId);
  const areas = state.commonAreas.filter((area) => area.condominiumId === state.session.condominiumId);
  const unitOptions = units.map((unit) => [unit.id, `${unit.block}-${unit.number}`]);
  const current = currentUser(state);
  const defaultUnit = current.unitId || units[0]?.id || '';
  const common = {
    condominiums: [['name','Nome do condomínio','text'],['cnpj','CNPJ','text'],['address','Endereço completo','text'],['blocks','Número de blocos','number'],['units','Número de unidades','number'],['syndic','Síndico responsável','text'],['phones','Telefones úteis','text'],['hours','Horário de portaria','text'],['rules','Regras gerais','textarea']],
    units: [['number','Número','text'],['block','Bloco/Torre','text'],['floor','Andar','text'],['type','Tipo','select',[['Apartamento','Apartamento'],['Casa','Casa'],['Sala','Sala'],['Loja','Loja']]],['owner','Proprietário','text'],['tenant','Inquilino','text'],['vehicles','Veículos','text'],['pets','Pets','text'],['status','Status','select',[['ativa','ativa'],['inativa','inativa'],['em reforma','em reforma'],['inadimplente','inadimplente']]]],
    residents: [['unitId','Unidade','select',unitOptions,defaultUnit],['name','Nome completo','text'],['cpf','CPF','text'],['email','E-mail','email'],['phone','Telefone','text'],['type','Tipo','select',[['proprietário','proprietário'],['inquilino','inquilino'],['dependente','dependente'],['funcionário doméstico','funcionário doméstico']]],['validation','Validação','select',[['pendente','pendente'],['validado','validado'],['reprovado','reprovado']]]],
    announcements: [['title','Título','text'],['category','Categoria','select',[['aviso geral','aviso geral'],['manutenção','manutenção'],['segurança','segurança'],['financeiro','financeiro'],['assembleia','assembleia'],['emergência','emergência']]],['priority','Prioridade','select',[['normal','normal'],['alta','alta'],['emergência','emergência']]],['body','Texto','textarea']],
    tickets: [['unitId','Unidade','select',unitOptions,defaultUnit],['title','Assunto','text'],['category','Categoria','select',[['manutenção','manutenção'],['barulho','barulho'],['segurança','segurança'],['limpeza','limpeza'],['financeiro','financeiro'],['vizinho','vizinho'],['portaria','portaria'],['outros','outros']]],['urgency','Urgência','select',[['baixa','baixa'],['média','média'],['alta','alta']]],['description','Descrição','textarea']],
    reservations: [['unitId','Unidade','select',unitOptions,defaultUnit],['areaId','Área comum','select',areas.map((area) => [area.id, area.name])],['date','Data','date',null,today()],['start','Início','time'],['end','Fim','time'],['guests','Lista/quantidade de convidados','text']],
    visitors: [['unitId','Unidade','select',unitOptions,defaultUnit],['name','Nome do visitante','text'],['document','Documento','text'],['type','Tipo','select',[['visitante','visitante'],['prestador','prestador'],['recorrente','recorrente']]],['validUntil','Validade','datetime-local']],
    packages: [['unitId','Unidade','select',unitOptions,defaultUnit],['recipient','Destinatário','text'],['carrier','Transportadora','text'],['code','Código/rastreio','text']],
    documents: [['title','Título','text'],['category','Categoria','select',[['regimento interno','regimento interno'],['convenção','convenção'],['ata','ata'],['balancete','balancete'],['contrato','contrato'],['manual','manual']]],['visibility','Visibilidade','select',[['todos','todos'],['conselho,sindico,administradora','conselho/síndico/administradora']]],['content','Conteúdo indexável','textarea']],
    maintenance: [['asset','Equipamento','text'],['plan','Plano','text'],['due','Vencimento','date'],['provider','Prestador','text'],['cost','Custo','number'],['status','Status','select',[['agendada','agendada'],['em andamento','em andamento'],['concluída','concluída']]]],
    settings: [['name','Nome do condomínio','text'],['cnpj','CNPJ','text'],['address','Endereço','text'],['phones','Telefones úteis','text'],['hours','Horário de portaria','text'],['rules','Regras gerais','textarea']]
  };
  return common[moduleKey] || [];
}

function fieldHtml([name, label, type, options, value = '']) {
  if (type === 'textarea') return `<label>${label}<textarea name="${name}" required>${value}</textarea></label>`;
  if (type === 'select') return `<label>${label}<select name="${name}" required>${(options || []).map(([v, text]) => `<option value="${v}" ${v === value ? 'selected' : ''}>${text}</option>`).join('')}</select></label>`;
  return `<label>${label}<input name="${name}" type="${type}" value="${value}" required/></label>`;
}

function saveRecord(moduleKey, data) {
  const values = Object.fromEntries(data.entries());
  const base = { id: uid(moduleKey.slice(0, 3)), condominiumId: state.session.condominiumId };
  const maps = {
    condominiums: () => ({ ...base, ...values, blocks: Number(values.blocks), units: Number(values.units), manager: 'Flow Administração', logo: 'CF' }),
    units: () => ({ ...base, ...values, residents: [], parking: '', condominiumId: state.session.condominiumId }),
    residents: () => ({ ...base, ...values, access: 'app completo', lgpd: true }),
    announcements: () => ({ ...base, ...values, pinned: values.priority === 'emergência', reads: [], createdAt: today() }),
    tickets: () => ({ ...base, ...values, status: 'aberto', assignedTo: 'Triagem CondoFlow', comments: [], rating: null, createdAt: today() }),
    reservations: () => ({ ...base, ...values, status: 'solicitada' }),
    visitors: () => ({ ...base, ...values, code: `CF-${String(values.unitId).slice(-3).toUpperCase()}-${String(values.name).slice(0,3).toUpperCase()}`, status: 'autorizado', lastAccess: '' }),
    packages: () => ({ ...base, ...values, status: 'recebida', receivedAt: nowText(), withdrawnAt: '' }),
    documents: () => ({ ...base, ...values, version: 1, required: values.category.includes('regimento'), readBy: [] }),
    maintenance: () => ({ ...base, ...values, cost: Number(values.cost || 0) })
  };
  if (moduleKey === 'settings') {
    Object.assign(currentCondominium(state), values);
    logAction(state, 'atualizou configurações', 'condominiums', state.session.condominiumId);
  } else {
    state[moduleKey].unshift(maps[moduleKey]());
    logAction(state, `criou registro em ${moduleKey}`, moduleKey, state[moduleKey][0].id);
  }
  saveState(state);
}

function formTitle(moduleKey) {
  return ({ tickets: 'Novo chamado', reservations: 'Nova reserva', visitors: 'Autorizar visitante', packages: 'Registrar encomenda', announcements: 'Novo comunicado', documents: 'Novo documento', residents: 'Novo morador', units: 'Nova unidade', condominiums: 'Novo condomínio', maintenance: 'Nova manutenção', settings: 'Editar condomínio' })[moduleKey] || 'Novo registro';
}

function closeModal() { document.getElementById('modal').innerHTML = ''; }

function filterVisibleTable(event) {
  const term = event.target.value.toLowerCase();
  document.querySelectorAll('tbody tr').forEach((row) => { row.hidden = !row.innerText.toLowerCase().includes(term); });
}

function exportCsv(collection) {
  const rows = filteredForUser(state, collection).map((item) => Object.fromEntries(Object.entries(item).filter(([, value]) => typeof value !== 'object')));
  if (!rows.length) return showToast('Não há registros para exportar.');
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(';'), ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? '').replaceAll('"','""')}"`).join(';'))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = `condoflow-${collection}.csv`; link.click(); URL.revokeObjectURL(url);
  logAction(state, `exportou ${collection}`, collection, null); saveState(state); showToast('CSV exportado.');
}

function openSearch() {
  document.getElementById('modal').innerHTML = `<div class="modal-backdrop"><div class="modal-card"><button class="close" data-close>×</button><h2>Busca global</h2><input id="global-search" placeholder="Buscar comunicados, chamados, documentos..." autofocus/><div id="global-results" class="results"></div></div></div>`;
  document.querySelector('[data-close]').addEventListener('click', closeModal);
  document.getElementById('global-search').addEventListener('input', (event) => {
    const term = event.target.value.toLowerCase();
    const collections = ['announcements','tickets','documents','visitors','packages'];
    const results = collections.flatMap((name) => filteredForUser(state, name).map((item) => ({ name, text: JSON.stringify(item) }))).filter((item) => item.text.toLowerCase().includes(term)).slice(0, 12);
    document.getElementById('global-results').innerHTML = term ? results.map((item) => `<p><strong>${item.name}</strong> ${item.text.slice(0, 140)}...</p>`).join('') || '<p>Nenhum resultado.</p>' : '';
  });
}

function answerQuestion() {
  const question = document.getElementById('ai-question').value.toLowerCase();
  const docs = filteredForUser(state, 'documents');
  const doc = docs.find((item) => item.content.toLowerCase().split(/[\s,.]+/).some((word) => word.length > 4 && question.includes(word))) || docs.find((item) => item.category.includes('regimento'));
  const answer = document.getElementById('ai-answer');
  if (!question.trim()) return showToast('Digite uma pergunta.');
  if (!doc) { answer.innerHTML = '<strong>Fora do escopo.</strong> Nenhum documento oficial indexado foi encontrado.'; return; }
  answer.innerHTML = `<strong>Resposta informativa:</strong> ${doc.content}<br><br><small>Fonte: ${doc.title}, versão ${doc.version}. Esta resposta é informativa e não substitui a decisão formal do síndico/administradora.</small>`;
  logAction(state, 'consultou IA do regimento', 'documents', doc.id, { question }); saveState(state);
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast'; toast.textContent = message; document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

render();
