export const seed = {
  users: [
    { id: 'u-admin', name: 'Helena Costa', email: 'admin@condoflow.app', role: 'admin', unitId: null, condominiumIds: ['c1','c2'] },
    { id: 'u-manager', name: 'Bruno Lima', email: 'adm@condoflow.app', role: 'administradora', unitId: null, condominiumIds: ['c1','c2'] },
    { id: 'u-syndic', name: 'Carla Nunes', email: 'sindico@horizonte.com', role: 'sindico', unitId: null, condominiumIds: ['c1'] },
    { id: 'u-council', name: 'Renato Alves', email: 'conselho@horizonte.com', role: 'conselho', unitId: 'un-101', condominiumIds: ['c1'] },
    { id: 'u-gate', name: 'Portaria Central', email: 'portaria@horizonte.com', role: 'portaria', unitId: null, condominiumIds: ['c1'] },
    { id: 'u-resident', name: 'Marina Rocha', email: 'marina@exemplo.com', role: 'morador', unitId: 'un-804', condominiumIds: ['c1'] },
    { id: 'u-provider', name: 'Equipe Alfa Elevadores', email: 'alfa@servicos.com', role: 'prestador', unitId: null, condominiumIds: ['c1'] }
  ],
  condominiums: [
    { id: 'c1', name: 'Condomínio Horizonte', cnpj: '12.345.678/0001-90', address: 'Rua das Palmeiras, 1200 - São Paulo/SP', blocks: 2, units: 248, manager: 'Flow Administração', syndic: 'Carla Nunes', phones: 'Portaria: (11) 3000-1000 | Emergência: 190', hours: '24 horas', rules: 'Silêncio após 22h. Mudanças com agendamento. Obras de segunda a sexta, 8h às 17h.', logo: 'CF' },
    { id: 'c2', name: 'Residencial Aurora', cnpj: '98.765.432/0001-10', address: 'Av. Central, 455 - Campinas/SP', blocks: 1, units: 96, manager: 'Flow Administração', syndic: 'A definir', phones: 'Portaria: (19) 3000-2000', hours: '06h às 22h', rules: 'Uso de áreas comuns mediante reserva.', logo: 'RA' }
  ],
  units: [
    { id: 'un-101', condominiumId: 'c1', block: 'A', floor: '1', number: '101', type: 'Apartamento', owner: 'Renato Alves', tenant: '', residents: ['Renato Alves'], parking: 'Vaga 12', vehicles: 'Honda Civic ABC1D23', pets: 'Sem pets', status: 'ativa' },
    { id: 'un-804', condominiumId: 'c1', block: 'B', floor: '8', number: '804', type: 'Apartamento', owner: 'Marina Rocha', tenant: '', residents: ['Marina Rocha', 'Lucas Rocha'], parking: 'Vaga 88', vehicles: 'Jeep Renegade XYZ8A10', pets: 'Luna, cachorro', status: 'ativa' },
    { id: 'un-1202', condominiumId: 'c1', block: 'B', floor: '12', number: '1202', type: 'Apartamento', owner: 'Paulo Mendes', tenant: 'Joana Brito', residents: ['Joana Brito'], parking: 'Vaga 103', vehicles: 'Sem veículo', pets: 'Gato Theo', status: 'inadimplente' }
  ],
  residents: [
    { id: 'r1', condominiumId: 'c1', unitId: 'un-804', name: 'Marina Rocha', cpf: '123.456.789-00', email: 'marina@exemplo.com', phone: '(11) 99999-1000', type: 'proprietário', access: 'app completo', validation: 'validado', lgpd: true },
    { id: 'r2', condominiumId: 'c1', unitId: 'un-804', name: 'Lucas Rocha', cpf: '111.222.333-44', email: 'lucas@exemplo.com', phone: '(11) 98888-2000', type: 'dependente', access: 'app morador', validation: 'validado', lgpd: true },
    { id: 'r3', condominiumId: 'c1', unitId: 'un-1202', name: 'Joana Brito', cpf: '555.666.777-88', email: 'joana@exemplo.com', phone: '(11) 97777-3000', type: 'inquilino', access: 'app completo', validation: 'pendente', lgpd: false }
  ],
  announcements: [
    { id: 'a1', condominiumId: 'c1', title: 'Lavagem das caixas d’água', category: 'manutenção', priority: 'alta', body: 'Interrupção programada de água no sábado, das 8h às 14h.', pinned: true, reads: ['u-resident'], createdAt: '2026-06-20' },
    { id: 'a2', condominiumId: 'c1', title: 'Assembleia ordinária', category: 'assembleia', priority: 'normal', body: 'Pauta: prestação de contas e orçamento do próximo trimestre.', pinned: false, reads: [], createdAt: '2026-06-18' }
  ],
  tickets: [
    { id: 't1', condominiumId: 'c1', unitId: 'un-804', title: 'Barulho após 23h', category: 'barulho', urgency: 'média', status: 'em análise', assignedTo: 'Carla Nunes', description: 'Ruído recorrente no apartamento superior.', comments: ['Síndico notificou unidade envolvida.'], rating: null, createdAt: '2026-06-21' },
    { id: 't2', condominiumId: 'c1', unitId: null, title: 'Portão social falhando', category: 'manutenção', urgency: 'alta', status: 'em execução', assignedTo: 'Equipe Alfa Elevadores', description: 'Intermitência no controle de acesso.', comments: [], rating: null, createdAt: '2026-06-19' }
  ],
  commonAreas: [
    { id: 'ca1', condominiumId: 'c1', name: 'Salão de festas', rules: 'Até 50 convidados. Encerramento às 22h.', fee: 250, autoApproval: false },
    { id: 'ca2', condominiumId: 'c1', name: 'Churrasqueira gourmet', rules: 'Uso das 10h às 20h. Limpeza obrigatória.', fee: 80, autoApproval: true },
    { id: 'ca3', condominiumId: 'c1', name: 'Coworking', rules: 'Reserva máxima de 4 horas.', fee: 0, autoApproval: true }
  ],
  reservations: [
    { id: 'res1', condominiumId: 'c1', unitId: 'un-804', areaId: 'ca2', date: '2026-06-28', start: '12:00', end: '16:00', status: 'aprovada', guests: '8 convidados' },
    { id: 'res2', condominiumId: 'c1', unitId: 'un-101', areaId: 'ca1', date: '2026-07-02', start: '18:00', end: '22:00', status: 'solicitada', guests: '35 convidados' }
  ],
  visitors: [
    { id: 'v1', condominiumId: 'c1', unitId: 'un-804', name: 'Ana Paula', document: 'RG 22.333.444-5', type: 'visitante', validUntil: '2026-06-30 22:00', code: 'CF-804-ANA', status: 'autorizado', lastAccess: '' },
    { id: 'v2', condominiumId: 'c1', unitId: 'un-804', name: 'Carlos Pintor', document: 'CPF 000.111.222-33', type: 'prestador', validUntil: '2026-06-23 17:00', code: 'CF-804-CAR', status: 'autorizado', lastAccess: 'entrada 2026-06-22 09:13' }
  ],
  packages: [
    { id: 'p1', condominiumId: 'c1', unitId: 'un-804', recipient: 'Marina Rocha', carrier: 'Correios', code: 'BR123456789', status: 'recebida', receivedAt: '2026-06-22 10:05', withdrawnAt: '' },
    { id: 'p2', condominiumId: 'c1', unitId: 'un-1202', recipient: 'Joana Brito', carrier: 'Amazon', code: 'AMZ-456', status: 'recebida', receivedAt: '2026-06-21 16:42', withdrawnAt: '' }
  ],
  documents: [
    { id: 'd1', condominiumId: 'c1', title: 'Regimento interno', category: 'regimento interno', visibility: 'todos', version: 3, required: true, content: 'Obras são permitidas de segunda a sexta das 8h às 17h. Mudanças devem ser agendadas com 48 horas de antecedência. Animais domésticos são permitidos desde que não ofereçam risco ou perturbação.', readBy: ['u-resident'] },
    { id: 'd2', condominiumId: 'c1', title: 'Balancete maio/2026', category: 'balancete', visibility: 'conselho,sindico,administradora', version: 1, required: false, content: 'Receitas, despesas e saldo do mês de maio de 2026.', readBy: [] }
  ],
  finance: [
    { id: 'f1', condominiumId: 'c1', unitId: 'un-804', description: 'Taxa condominial junho/2026', amount: 842.90, due: '2026-06-10', status: 'pago' },
    { id: 'f2', condominiumId: 'c1', unitId: 'un-1202', description: 'Taxa condominial junho/2026', amount: 913.40, due: '2026-06-10', status: 'vencido' }
  ],
  consumption: [
    { id: 'co1', condominiumId: 'c1', unitId: 'un-804', month: '2026-06', water: 12.4, gas: 18.2, energy: 143 },
    { id: 'co2', condominiumId: 'c1', unitId: 'un-1202', month: '2026-06', water: 22.8, gas: 21.1, energy: 210 }
  ],
  maintenance: [
    { id: 'm1', condominiumId: 'c1', asset: 'Elevador Torre B', plan: 'preventiva mensal', due: '2026-06-25', provider: 'Equipe Alfa Elevadores', cost: 1800, status: 'em andamento' },
    { id: 'm2', condominiumId: 'c1', asset: 'Bomba de recalque', plan: 'preventiva trimestral', due: '2026-07-05', provider: 'HidroService', cost: 650, status: 'agendada' }
  ],
  assemblies: [
    { id: 'as1', condominiumId: 'c1', title: 'Assembleia ordinária 2026', agenda: 'Prestação de contas; previsão orçamentária; pintura da fachada', status: 'agendada', yes: 42, no: 8, abstain: 5 }
  ],
  auditLogs: [
    { id: 'log1', condominiumId: 'c1', actor: 'Carla Nunes', role: 'sindico', action: 'criou comunicado', entity: 'announcements', at: '2026-06-20 08:31', ip: '192.168.0.10' }
  ]
};
