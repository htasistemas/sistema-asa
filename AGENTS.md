# AGENTS.md — Sistema ASA (Padrões para Codex / Agentes)

> Objetivo: orientar **implementação de telas** e mudanças correlatas no **Sistema ASA** com padrão único, previsível e consistente, **sem gambiarras**, **sem divergências visuais** e **sem desvios arquiteturais**.

---

## REGRAS GERAIS (OBRIGATÓRIAS)

### Idioma
- MUST escrever comunicação, código (quando aplicável), comentários, commits e documentação em **português**.
- MAY manter termos técnicos em inglês quando forem padrão de mercado (ex.: DTO, Service, Repository).

### Nomenclatura
- MUST nomear variáveis, classes, métodos, tabelas e colunas em **português**.
- MUST usar **camelCase** para variáveis e métodos (ex.: `unidadeAssistencial`).
- MUST evitar abreviações obscuras; nomes devem ser claros, completos e autoexplicativos.

### Postura / Arquitetura
- MUST respeitar a arquitetura existente do **Sistema ASA**.
- MUST evitar reescritas desnecessárias.
- MUST manter compatibilidade com produção.
- MUST sinalizar riscos técnicos sempre que existirem.
- MUST ser direto e objetivo; NÃO assumir requisitos implícitos.

### Código
- MUST manter código simples, legível e coeso.
- MUST evitar duplicação; reutilizar serviços, componentes e utilitários existentes.
- SHOULD aplicar responsabilidade única por método.
- SHOULD preferir composição em vez de herança.
- MUST NOT criar implementações temporárias sem registro técnico.
- MUST NOT introduzir dependências sem justificativa técnica clara.

---

## PADRÃO OBRIGATÓRIO PARA TELAS (UI/UX)

### Referência oficial
- MUST usar como referência a **tela padrão de cadastro principal do Sistema ASA**.
- MUST replicar padrão visual, estrutural e funcional já consolidado no ASA.

### Base da tela
- MUST usar `app-tela-padrao` como base.
- MUST usar cards padronizados do ASA para organização do conteúdo.
- SHOULD usar abas ou etapas quando houver separação lógica clara.

### Cabeçalho da página (sempre)
- MUST exibir no topo:
  - Linha 1: **MENU PAI** em letras maiúsculas, cor cinza.
  - Linha 2: **Tela atual** (Primeira letra maiúscula), cor preta.
- MUST NOT omitir este cabeçalho.
- MUST NOT criar variações visuais por tela.

### Título e subtítulo (anti-redundância)
- MUST existir **apenas 1 título principal** por área visual.
- MUST validar que não há títulos duplicados (header global + título local).
- MUST NOT renderizar títulos ou subtítulos sobrepostos.

### Barra de ações CRUD (obrigatória)
- MUST ficar logo abaixo do título principal.
- MUST ser horizontal (ícone + texto).
- MUST seguir esta ordem fixa:
  - **Buscar → Novo → Salvar → Cancelar → Excluir → Imprimir → Fechar**
- MUST NOT alterar a ordem.
- MUST dar destaque visual de alerta ao botão **Excluir**.
- MUST manter **Fechar** como último botão.
- MUST alinhar os botoes de navegacao no lado direito da pagina.
- SHOULD garantir espaçamento adequado para evitar cliques acidentais.

### Formulários e clique
- MUST garantir que nenhuma ação exija duplo clique.
- MUST garantir **1 clique por ação**.
- MUST NOT duplicar eventos (`click`, `mouseup`, múltiplos listeners, HostListener duplicado).
- Em botões dentro de `form`:
  - MUST usar `type="button"` por padrão.
  - MAY usar `type="submit"` apenas quando estritamente necessário.
- MUST evitar overlays capturando cliques quando inativos (`pointer-events`, `z-index`).

### Validação e mensagens
- MUST exibir `(*)` em todo campo obrigatório.
- Ao clicar **Salvar** com campos obrigatórios vazios:
  - MUST mostrar mensagem clara e objetiva ao usuário.
- MUST usar popup de erro padronizado do ASA em telas novas e existentes.

### Abas / Etapas (quando aplicável)
- Telas com múltiplas seções:
  - SHOULD usar navegação por etapas numeradas ou abas no padrão ASA.
- Padrão visual obrigatório:
  - Aba ativa: verde escuro + texto branco
  - Abas anteriores: verde claro + texto verde escuro
  - Abas futuras: neutras
- MUST permitir apenas 1 aba ativa por vez.
- MUST manter comportamento idêntico ao padrão já existente no sistema.

### Regras visuais (anti-bug)
- MUST validar visualmente:
  - Nenhum texto sobreposto (títulos, breadcrumbs, subtítulos, mensagens).
- MUST evitar CSS com sobreposição:
  - MUST NOT usar `position: absolute` sem justificativa técnica.
  - MUST NOT usar margem negativa para ajuste de layout.
  - MUST evitar conflitos de `z-index`.

### Comentário didático
- MUST incluir comentário explicativo no topo direito da área de título, conforme padrão do Sistema ASA.

---

## CARREGAMENTO AUTOMÁTICO DE DADOS (OBRIGATÓRIO)
- MUST carregar e exibir dados automaticamente ao abrir a tela.
- MUST NOT depender de clique, foco, hover ou troca de aba.
- MUST carregar no lifecycle adequado (`ngOnInit` ou `ngAfterViewInit` quando necessário).
- Se usar `ChangeDetectionStrategy.OnPush`:
  - MUST garantir atualização correta (`async pipe`, imutabilidade ou `markForCheck`).
- MUST NOT usar gambiarras (`setTimeout`, cliques forçados, eventos artificiais).

---

## ANGULAR (FRONTEND)
- MUST NOT colocar lógica de negócio no template.
- MUST centralizar regras de negócio em services.
- MUST usar tipagem estrita; evitar `any`.
- SHOULD manter componentes pequenos, coesos e focados.
- MAY separar componentes smart/dumb quando aplicável.

### Estrutura específica
- MUST usar `app-barra-acoes-crud`:
  - alinhada ao título
  - fora de cards e formulários
- **Cancelar**:
  - MUST limpar todos os campos, inclusive em modo “novo cadastro”.

### Títulos (CSS)
- MUST seguir padrão visual do ASA:
  - `page-title__eyebrow`: 0.95rem
  - `page-title__label`: 1.5rem, peso 800

### Listagens
- SHOULD seguir padrão de listagem oficial do ASA:
  - filtros
  - cards
  - paginação
  - busca normalizada

---

## CAMPOS PADRONIZADOS
- MUST capitalizar labels (Primeira Letra Maiúscula).
- CPF:
  - MUST usar máscara `000.000.000-00`
  - MUST validar completo
  - MUST indicar inválido com borda vermelha
- CNPJ:
  - MUST usar máscara `00.000.000/0000-00`
  - MUST validar completo
- Endereço:
  - `cidade` com autocomplete
  - MUST preencher `estado` automaticamente

---

## COMPONENTES COMPARTILHADOS (OBRIGATÓRIO REUTILIZAR)
- Autocomplete: MUST usar `app-autocomplete`.
- Busca: MUST normalizar (sem acento e case-insensitive).
- Mensagens:
  - Formulários: MUST usar `PopupErrorBuilder` + `app-popup-messages`
  - Globais: MUST usar `ErrorService` + `ToastComponent`
  - Feedback local: MAY usar temporário (até 10s) com botão “X”
- Confirmações: MUST usar `app-dialog`.
- Email: MUST usar configuração de servidor já existente no ASA.

---

## BACKEND (SE ENVOLVER DADOS)

### Java
- MUST seguir camadas:
  - Controller
  - Service
  - Repository
  - Domain
- MUST usar DTOs.
- MUST NOT expor entidades diretamente.
- MUST validar dados no backend.
- MUST tratar erros de forma explícita.
- SHOULD priorizar imutabilidade.

### CORS
- MUST configurar corretamente para evitar erro de preflight (403).
- Dev: `http://localhost:4200`
- Prod: apenas domínio oficial do ASA.

### Banco de dados
- MUST registrar alteração estrutural em `init.db`.
- MUST criar scripts idempotentes.
- MUST usar nomes em português.
- PK `id` sequencial.
- FKs obrigatórias.
- Ao persistir dados:
  - MUST criar Domain, DTO, Repository, Service e Controller.

---

## RELATÓRIOS (SE APLICAR)
- MUST seguir padrão:
  - A4
  - margens 20mm
  - fonte Arial
  - cabeçalho, corpo e rodapé
  - “Página X de Y”
  - dados reais
  - HTML → PDF
  - 1 clique
  - template único reutilizável

---

## TESTES (SE ALTERAR COMPORTAMENTO)
- MUST criar ou atualizar testes ao alterar comportamento.
- SHOULD priorizar fluxos críticos.
- SHOULD manter testes rápidos, deterministas e claros.

---

## VERSÃO / HISTÓRICO
- MUST atualizar versão em Configurações Gerais.
- MUST registrar versão, data/hora e mudanças de forma objetiva.
- MUST usar formato `1.00.0`.
- MUST incrementar apenas o último grupo.
- MUST NOT repetir número de versão (sequencial e único).
 