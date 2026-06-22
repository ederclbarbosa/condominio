# CondoFlow

CondoFlow é uma plataforma web/app para acompanhamento e gestão de condomínios. Esta entrega evolui o protótipo inicial para um MVP funcional em navegador, com persistência em `localStorage`, permissões por perfil, troca de usuário/condomínio, CRUDs operacionais, auditoria, exportação CSV, PWA inicial e blueprint PostgreSQL/Supabase para evolução produtiva.

> Observação técnica: o ambiente atual bloqueou instalação de pacotes via registry. Por isso, a implementação foi feita sem dependências externas, em HTML, CSS e JavaScript modular. A arquitetura foi mantida separada por domínio para permitir migração direta para React/Next.js e Supabase sem reescrever as regras de negócio.

## O que está funcional agora

- Sessão demonstrativa com usuários reais de cada perfil: administrador geral, administradora, síndico, conselho, portaria, morador e prestador.
- Seleção de condomínio para usuários com acesso a múltiplos condomínios.
- Controle de menu por perfil, impedindo visualização de módulos não autorizados.
- Dashboard dinâmico com indicadores por papel e filtro por condomínio/unidade.
- Cadastros operacionais com formulário e persistência local para:
  - condomínios;
  - unidades;
  - moradores;
  - comunicados;
  - ocorrências/chamados;
  - manutenções;
  - reservas;
  - visitantes;
  - encomendas;
  - documentos;
  - configurações do condomínio.
- Módulos de consulta para financeiro, consumo, assembleias e relatórios.
- Busca em tabelas e busca global por comunicados, chamados, documentos, visitantes e encomendas.
- Exportação CSV para módulos operacionais e auditoria.
- Auditoria automática para criação, alteração, exportação e consultas da IA do regimento.
- IA local demonstrativa para consulta do regimento, respondendo com base no conteúdo dos documentos cadastrados e exibindo fonte/aviso formal.
- Responsividade mobile-first com sidebar no desktop e navegação inferior no mobile.
- Estados vazios, badges de status, filtros por morador/unidade e proteção básica contra acesso indevido por perfil.

## Perfis e regras implementadas

| Perfil | Regras principais |
| --- | --- |
| Administrador geral | Acessa todos os condomínios e módulos administrativos. |
| Administradora | Gerencia múltiplos condomínios, cadastros, comunicados, chamados, documentos e relatórios. |
| Síndico | Opera o condomínio selecionado, aprova/acompanha rotinas e configura dados internos. |
| Conselho | Consulta documentos, relatórios, financeiro e ocorrências autorizadas. |
| Portaria | Acessa visitantes, encomendas e ocorrências; não acessa financeiro. |
| Morador | Vê dados da própria unidade para chamados, visitantes, reservas, encomendas, boletos, consumo e documentos públicos. |
| Prestador | Vê apenas chamados/manutenções associados ao prestador Alfa no demo. |

## Estrutura do projeto

```text
index.html                    Entrada da aplicação e metadados PWA
public/manifest.webmanifest   Manifest para instalação futura como app
src/app.js                    Orquestra sessão, rotas, formulários, busca, exportação e ações
src/core/store.js             Persistência, sessão, escopo por condomínio e auditoria
src/core/permissions.js       Perfis, menus e permissões de escrita
src/data/seed.js              Dados demonstrativos completos por módulo
src/modules/renderers.js      Renderização dos dashboards, listas, relatórios, IA e configurações
src/styles.css                Design system responsivo e componentes visuais
db/schema.sql                 Blueprint PostgreSQL/Supabase com tabelas e RLS inicial
scripts/validate.py           Validação local de arquivos, schema, manifest e sintaxe JavaScript
```

## Como rodar localmente

```bash
npm run dev
```

Acesse `http://localhost:5173`.

## Validação/build

```bash
npm run build
npm test
```

## Banco de dados e produção

O arquivo `db/schema.sql` contém o desenho inicial das tabelas exigidas, incluindo usuários, condomínios, unidades, moradores, papéis, veículos, pets, comunicados, leituras, chats, chamados, comentários, ativos de manutenção, ordens de serviço, áreas comuns, reservas, visitantes, logs de acesso, encomendas, cobranças, pagamentos, despesas, consumo, documentos, versões, assembleias, pautas, votos, auditoria, notificações e chunks para IA.

Para produção, os próximos passos recomendados são:

1. Migrar a UI para Next.js/React mantendo a divisão atual de domínios.
2. Conectar Supabase Auth com e-mail/senha, magic link ou OTP.
3. Implementar RLS completo usando `user_roles`, `condominium_id` e `unit_id`.
4. Substituir `localStorage` por APIs server-side ou Supabase client com validações de backend.
5. Adicionar Storage para documentos, fotos, anexos, laudos, comprovantes e etiquetas.
6. Implementar fila de notificações por e-mail, push e WhatsApp.
7. Evoluir a IA do regimento para embeddings reais, busca vetorial e bloqueio formal fora de escopo.
8. Adicionar testes end-to-end de permissões, cadastros e fluxos sensíveis.

## Limitações conscientes desta entrega

- A persistência é local no navegador para permitir demonstração funcional sem backend instalado.
- Não há autenticação real com senha/OTP; a troca de usuário simula sessões e permissões.
- Uploads são representados por campos textuais; o storage real deve ser conectado em produção.
- Exportação PDF/Excel avançada deve ser implementada em backend ou biblioteca dedicada após liberação de dependências.
