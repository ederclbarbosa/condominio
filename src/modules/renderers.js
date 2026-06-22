import { canWrite } from '../core/permissions.js';
import { currentUser, scoped, today } from '../core/store.js';

const unitLabel = (state, id) => state.units.find((unit) => unit.id === id)?.number || 'Área comum';
const areaLabel = (state, id) => state.commonAreas.find((area) => area.id === id)?.name || '-';
const money = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const badge = (value) => `<span class="badge ${String(value).replaceAll(' ', '-').toLowerCase()}">${value}</span>`;

export function dashboard(state) {
  const user = currentUser(state);
  const tickets = filteredForUser(state, 'tickets');
  const reservations = filteredForUser(state, 'reservations');
  const packages = filteredForUser(state, 'packages');
  const visitors = filteredForUser(state, 'visitors');
  const units = scoped(state, 'units');
  const residents = scoped(state, 'residents');
  const charges = filteredForUser(state, 'finance');
  const cards = user.role === 'morador'
    ? [
      ['Boleto em aberto', charges.find((charge) => charge.status !== 'pago')?.status || 'em dia', 'financeiro'],
      ['Consumo da unidade', `${filteredForUser(state, 'consumption')[0]?.water || 0} m³`, 'água'],
      ['Reservas', reservations.length, 'agenda'],
      ['Encomendas pendentes', packages.filter((item) => item.status === 'recebida').length, 'retirada'],
      ['Visitantes ativos', visitors.filter((item) => item.status === 'autorizado').length, 'acesso'],
      ['Chamados abertos', tickets.filter((item) => !['resolvido','cancelado'].includes(item.status)).length, 'SLA']
    ]
    : [
      ['Unidades', units.length, 'cadastradas'], ['Moradores ativos', residents.filter((r) => r.validation === 'validado').length, 'validados'],
      ['Ocorrências abertas', tickets.filter((ticket) => !['resolvido','cancelado'].includes(ticket.status)).length, 'em tratamento'],
      ['Reservas futuras', reservations.filter((reservation) => reservation.date >= today()).length, 'agenda'],
      ['Encomendas pendentes', packages.filter((item) => item.status === 'recebida').length, 'portaria'],
      ['Visitantes autorizados', visitors.filter((item) => item.status === 'autorizado').length, 'ativos'],
      ['Inadimplência', `${charges.filter((charge) => charge.status === 'vencido').length}`, 'unidades'],
      ['Manutenções', filteredForUser(state, 'maintenance').filter((order) => order.status !== 'concluída').length, 'ativas']
    ];
  return `<section class="page-grid"><div class="hero"><div><span class="eyebrow">Operação em tempo real</span><h2>${user.role === 'morador' ? `Olá, ${user.name}. Sua unidade está conectada.` : 'Painel executivo para decisões rápidas e auditáveis.'}</h2><p>Dados persistidos no navegador, permissões por perfil, filtros por condomínio e ações registradas em auditoria.</p></div><button class="primary" data-action="quick-ticket">Abrir chamado</button></div><div class="cards">${cards.map(([title,value,meta]) => `<article class="card"><span>${title}</span><strong>${value}</strong><small>${meta}</small></article>`).join('')}</div><div class="panel wide"><h3>Evolução de chamados</h3><div class="bars">${[12,18,9,22,15,Number(tickets.length || 1) * 6].map((value, index) => `<i style="height:${Math.max(32,value*7)}px"><b>${['Jan','Fev','Mar','Abr','Mai','Jun'][index]}</b></i>`).join('')}</div></div><div class="panel"><h3>Alertas críticos</h3><ul class="alerts"><li>⚠️ ${tickets.filter((ticket) => ticket.urgency === 'alta').length} ocorrência(s) de alta urgência.</li><li>📦 ${packages.filter((item) => item.status === 'recebida').length} encomenda(s) aguardando retirada.</li><li>🔒 Acesso a módulos segue o perfil ${user.role}.</li></ul></div>${table('Fila operacional', ['ID','Assunto','Módulo','Status','Responsável'], tickets.slice(0,5).map((ticket) => [ticket.id, ticket.title, ticket.category, badge(ticket.status), ticket.assignedTo || '-']))}</section>`;
}

export function genericList(state, moduleKey) {
  const user = currentUser(state);
  const writable = canWrite(user.role, moduleKey);
  const config = configs(state)[moduleKey];
  if (!config) return `<div class="panel"><h2>Módulo em construção</h2><p>Estrutura pronta para evolução.</p></div>`;
  const rows = config.rows(filteredForUser(state, config.collection));
  return `<section class="module-page"><div class="module-hero"><div class="module-icon">${config.icon}</div><div><span class="eyebrow">${writable ? 'operacional' : 'consulta'}</span><h2>${config.title}</h2><p>${config.description}</p></div>${writable ? `<button class="primary" data-open-form="${moduleKey}">Novo registro</button>` : ''}</div><div class="toolbar"><input id="search" placeholder="Buscar em ${config.title.toLowerCase()}..."/><button data-export="${moduleKey}">Exportar CSV</button></div>${table(config.title, config.headers, rows)}${config.extra ? config.extra() : ''}</section>`;
}

export function reports(state) {
  const tickets = filteredForUser(state, 'tickets');
  const packages = filteredForUser(state, 'packages');
  const reservations = filteredForUser(state, 'reservations');
  return `<section class="module-page"><div class="module-hero"><div class="module-icon">📑</div><div><span class="eyebrow">exportável</span><h2>Relatórios</h2><p>Consolidação operacional para conselho, síndico e administradora.</p></div><button class="primary" data-export="auditLogs">Exportar auditoria</button></div><div class="cards"><article class="card"><span>Tempo médio atendimento</span><strong>18h</strong><small>${tickets.length} chamados</small></article><article class="card"><span>Encomendas pendentes</span><strong>${packages.filter((p) => p.status === 'recebida').length}</strong><small>portaria</small></article><article class="card"><span>Reservas no período</span><strong>${reservations.length}</strong><small>áreas comuns</small></article><article class="card"><span>Leitura comunicados</span><strong>${readRate(state)}%</strong><small>média</small></article></div>${table('Auditoria recente', ['Data','Ator','Perfil','Ação','Entidade','IP'], filteredForUser(state, 'auditLogs').slice(0,12).map((log) => [log.at, log.actor, log.role, log.action, log.entity, log.ip]))}</section>`;
}

export function aiPanel(state) {
  const docs = filteredForUser(state, 'documents').filter((doc) => doc.category.includes('regimento') || doc.category.includes('convenção'));
  return `<section class="module-page"><div class="module-hero"><div class="module-icon">🤖</div><div><span class="eyebrow">resposta com fonte</span><h2>IA do regimento</h2><p>Faça perguntas e receba respostas limitadas aos documentos cadastrados do condomínio.</p></div></div><div class="panel ai-box"><label>Pergunta do morador</label><div class="inline-form"><input id="ai-question" placeholder="Ex.: Posso reformar aos sábados?"/><button class="primary" data-ai-answer>Responder</button></div><div id="ai-answer" class="answer">A resposta aparecerá aqui com citação da fonte.</div></div>${table('Documentos indexados', ['Título','Categoria','Versão','Obrigatório'], docs.map((doc) => [doc.title, doc.category, doc.version, doc.required ? 'sim' : 'não']))}</section>`;
}

export function settings(state) {
  const condo = state.condominiums.find((item) => item.id === state.session.condominiumId);
  return `<section class="module-page"><div class="module-hero"><div class="module-icon">⚙️</div><div><span class="eyebrow">administração</span><h2>Configurações</h2><p>Dados do condomínio, regras, portaria e identidade visual.</p></div><button class="primary" data-open-form="settings">Editar dados</button></div><div class="panel"><h3>${condo.name}</h3><dl class="details"><dt>CNPJ</dt><dd>${condo.cnpj}</dd><dt>Endereço</dt><dd>${condo.address}</dd><dt>Blocos/unidades</dt><dd>${condo.blocks} blocos • ${condo.units} unidades</dd><dt>Telefones úteis</dt><dd>${condo.phones}</dd><dt>Portaria</dt><dd>${condo.hours}</dd><dt>Regras gerais</dt><dd>${condo.rules}</dd></dl></div></section>`;
}

function configs(state) {
  return {
    condominiums: { collection: 'condominiums', icon: '🏢', title: 'Condomínios', description: 'Cadastro completo com CNPJ, endereço, síndico, portaria, regras e logo.', headers: ['Nome','CNPJ','Endereço','Blocos','Unidades','Síndico'], rows: (items) => items.map((i) => [i.name,i.cnpj,i.address,i.blocks,i.units,i.syndic]) },
    units: { collection: 'units', icon: '🚪', title: 'Unidades', description: 'Bloco, andar, moradores, veículos, pets, vagas e status.', headers: ['Unidade','Bloco','Tipo','Proprietário','Veículos','Status'], rows: (items) => items.map((i) => [i.number,i.block,i.type,i.owner,i.vehicles,badge(i.status)]) },
    residents: { collection: 'residents', icon: '👥', title: 'Moradores', description: 'Cadastro com CPF, contato, unidade, validação e aceite LGPD.', headers: ['Nome','Unidade','Tipo','E-mail','Telefone','Validação','LGPD'], rows: (items) => items.map((i) => [i.name, unitLabel(state, i.unitId), i.type, i.email, i.phone, badge(i.validation), i.lgpd ? 'sim' : 'não']) },
    announcements: { collection: 'announcements', icon: '🔔', title: 'Comunicados', description: 'Comunicados oficiais com prioridade, fixação, leitura e histórico.', headers: ['Título','Categoria','Prioridade','Fixado','Leituras','Data'], rows: (items) => items.map((i) => [i.title,i.category,badge(i.priority),i.pinned ? 'sim' : 'não',`${i.reads.length}`,i.createdAt]) },
    tickets: { collection: 'tickets', icon: '📋', title: 'Ocorrências e chamados', description: 'Abertura, atribuição, SLA, comentários, status e avaliação.', headers: ['ID','Unidade','Título','Categoria','Urgência','Status','Responsável'], rows: (items) => items.map((i) => [i.id, unitLabel(state, i.unitId), i.title, i.category, badge(i.urgency), badge(i.status), i.assignedTo || '-']) },
    maintenance: { collection: 'maintenance', icon: '🔧', title: 'Manutenções', description: 'Ativos, planos preventivos, ordens, prestadores, custos e vencimentos.', headers: ['Ativo','Plano','Vencimento','Prestador','Custo','Status'], rows: (items) => items.map((i) => [i.asset,i.plan,i.due,i.provider,money(i.cost),badge(i.status)]) },
    reservations: { collection: 'reservations', icon: '📅', title: 'Reservas', description: 'Agenda de áreas comuns com convidados, taxas, aprovação e bloqueios.', headers: ['Área','Unidade','Data','Horário','Convidados','Status'], rows: (items) => items.map((i) => [areaLabel(state, i.areaId), unitLabel(state, i.unitId), i.date, `${i.start}-${i.end}`, i.guests, badge(i.status)]) },
    visitors: { collection: 'visitors', icon: '🚗', title: 'Visitantes e acesso', description: 'Autorizações, códigos, validade, recorrência e registros de entrada/saída.', headers: ['Nome','Unidade','Tipo','Documento','Código','Validade','Status','Último acesso'], rows: (items) => items.map((i) => [i.name, unitLabel(state, i.unitId), i.type, i.document, i.code, i.validUntil, badge(i.status), i.lastAccess || '-']) },
    packages: { collection: 'packages', icon: '📦', title: 'Encomendas', description: 'Recebimento, notificação, retirada e histórico por unidade.', headers: ['Código','Unidade','Destinatário','Transportadora','Recebida em','Status','Retirada em'], rows: (items) => items.map((i) => [i.code, unitLabel(state, i.unitId), i.recipient, i.carrier, i.receivedAt, badge(i.status), i.withdrawnAt || '-']) },
    finance: { collection: 'finance', icon: '💳', title: 'Financeiro', description: 'Boletos, pagamentos, inadimplência, despesas e prestação de contas.', headers: ['Unidade','Descrição','Vencimento','Valor','Status'], rows: (items) => items.map((i) => [unitLabel(state, i.unitId), i.description, i.due, money(i.amount), badge(i.status)]) },
    consumption: { collection: 'consumption', icon: '📈', title: 'Consumo individual', description: 'Água, gás, energia, comparativo e alertas de desvio.', headers: ['Unidade','Mês','Água m³','Gás m³','Energia kWh'], rows: (items) => items.map((i) => [unitLabel(state, i.unitId), i.month, i.water, i.gas, i.energy]) },
    documents: { collection: 'documents', icon: '📄', title: 'Documentos', description: 'Biblioteca, versões, visibilidade, leitura obrigatória e conteúdo indexável.', headers: ['Título','Categoria','Visibilidade','Versão','Obrigatório','Leituras'], rows: (items) => items.map((i) => [i.title, i.category, i.visibility, i.version, i.required ? 'sim' : 'não', i.readBy.length]) },
    assemblies: { collection: 'assemblies', icon: '🗳️', title: 'Assembleias', description: 'Pautas, presença, votação, resultado e trilha de auditoria.', headers: ['Título','Pauta','Status','Sim','Não','Abstenção'], rows: (items) => items.map((i) => [i.title, i.agenda, badge(i.status), i.yes, i.no, i.abstain]) }
  };
}

export function filteredForUser(state, collection) {
  const user = currentUser(state);
  let items = state[collection] || [];
  if (user.role !== 'admin') items = items.filter((item) => !item.condominiumId || item.condominiumId === state.session.condominiumId);
  if (user.role === 'morador') {
    if (['tickets','reservations','visitors','packages','finance','consumption'].includes(collection)) items = items.filter((item) => item.unitId === user.unitId);
    if (collection === 'documents') items = items.filter((item) => item.visibility.includes('todos') || item.visibility.includes('morador'));
  }
  if (user.role === 'prestador') items = items.filter((item) => (item.assignedTo || item.provider || '').includes('Alfa'));
  if (user.role === 'portaria' && ['finance','consumption'].includes(collection)) return [];
  return items;
}

function table(title, headers, rows) {
  return `<div class="panel table-panel"><h3>${title}</h3><table><thead><tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}" class="empty-cell">Nenhum registro encontrado.</td></tr>`}</tbody></table></div>`;
}

function readRate(state) {
  const total = filteredForUser(state, 'announcements').length || 1;
  const read = filteredForUser(state, 'announcements').filter((item) => item.reads.length > 0).length;
  return Math.round((read / total) * 100);
}
