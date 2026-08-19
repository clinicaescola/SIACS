# SIACS • Sistema Integrado de Agendamento Campos Salles
## Documentação Técnica e Manual Operacional do Sistema

---

### 1. Visão Geral do Projeto

O **SIACS (Sistema Integrado de Agendamento Campos Salles)** é uma plataforma web para a gestão de agendamentos, prontuários clínicos, assiduidade e supervisão pedagógica de estágios curriculares da **Faculdade Campos Salles** e sua **Clínica Escola de Psicologia e Saúde**.

O sistema foi concebido com o objetivo de proporcionar **eficiência, rastreabilidade e organização** em todo o ciclo de atendimento à comunidade, unindo a prática acadêmica dos alunos estagiários ao acompanhamento rigoroso dos orientadores docentes e profissionais supervisores.

---

### 2. Identidade Visual e Padrões Institucionais

A interface visual do SIACS segue a identidade institucional da Faculdade Campos Salles:
- **Azul Institucional Primário**: `#033B6C` (Textos principais, cabeçalhos, botões primários e elementos de destaque).
- **Verde Institucional de Apoio**: `#62A032` (Acentos visuais, badges de confirmação, subtítulos e status positivos).
- **Paleta Neutra de Superfície**: Fundo off-white `#FDFBF7`, cartões e painéis em `#FFFFFF` e `#F8F5F0`, com divisores sutis em `#E5E1D8`.
- **Logotipo e Monograma**: Componentes vetoriais SVG de alta resolução (`SIACSLogo` e `SIACSMonogram`), garantindo nitidez em telas de alta densidade (Retina/4K) e nas impressões em papel.
- **Tipografia**: Pareamento elegante de *Newsreader* (títulos institucionais) com *Plus Jakarta Sans* (textos de interface e dados tabulares).

---

### 3. Arquitetura e Tecnologias

- **Frontend / Interface**: React 18+ com TypeScript estruturado em componentes modulares.
- **Estilização**: Tailwind CSS com classes utilitárias e paleta institucional consistente.
- **Gerenciamento de Estado & Autenticação**: React Context API (`AuthContext`) com suporte a login com credenciais, recuperação de senha e alternância rápida entre perfis para demonstração.
- **Camada de Dados & Persistência**: Banco de dados estruturado em TypeScript (`db.ts`) com persistência em armazenamento local (`localStorage`), provendo reatividade em tempo real e isolamento multi-tabela.
- **Ícones**: Biblioteca `lucide-react`.

---

### 4. Perfis de Usuário e Controle de Acesso (RBAC)

O sistema possui 5 papéis de acesso estritamente segregados:

#### 4.1. Administrador Geral (`admin`)
- Gerenciamento integral de usuários (habilitação, bloqueio, redefinição de permissões e edição de dados).
- Cadastro e configuração física de salas clínicas e consultórios (capacidade, equipamentos, fotos e status).
- Visualização de todos os agendamentos realizados na instituição.
- Ferramenta de **Backup & Restauração de Dados** (exportação/importação de arquivos `.json`).

#### 4.2. Orientador Docente & Supervisor Clínico (`orientador`)
- Validação e aprovação dos cadastros de novos profissionais e estagiários.
- Alocação e distribuição de estagiários por turmas e salas de atendimento.
- Supervisão pedagógica: revisão de casos clínicos, evolução de pacientes e emissão de pareceres docentes.
- **Módulo Oficial de Relatórios**:
  - Geração de métricas de atendimentos: **Realizados**, **Não Confirmados (Pendentes)** e **Perdidos / Cancelados**.
  - Tabela analítica de assiduidade por estagiário com cálculo de taxa de conclusão.
  - Relação detalhada de cada atendimento com filtros por período (7 dias, mês atual, semestre letivo ou intervalo customizado).
  - Impressão limpa e direta em folha A4 (sem cabeçalhos e rodapés, com retorno imediato à tela do sistema ao clicar em imprimir).
  - Exportação direta em **HTML/PDF** e planilhas **CSV/Excel**.

#### 4.3. Profissional de Saúde / Terapeuta (`profissional`)
- Configuração de grade de horários e múltiplos dias disponíveis para atendimento (Presencial e Online).
- Gestão de agenda diária e semanal com controle de status da consulta (Concluída, Não Compareceu, Cancelada).
- Prontuário eletrônico do paciente: registro de anamneses, hipóteses diagnósticas e evolução terapêutica.
- Notificações automáticas ao paciente via **WhatsApp** e **E-mail**.

#### 4.4. Estagiário em Formação Acadêmica (`estagiario`)
- Visualização da escala de horários e atendimentos supervisionados atribuídos.
- Redação de anotações clínicas e diários de estágio vinculados a cada paciente.
- Envio das anotações para análise e visto do orientador docente.
- Monitoramento da carga horária prática cumprida na Clínica Escola.

#### 4.5. Paciente / Cliente (`paciente`)
- Portal de autoagendamento de consultas com filtragem por profissional, especialidade, modalidade (Presencial/Online), data e horário.
- Acompanhamento das próximas consultas e histórico de atendimentos anteriores.
- Gerenciamento de dados cadastrais e histórico de saúde pessoal.

---

### 5. Conformidade com a LGPD (Lei Federal nº 13.709/2018)

O SIACS integra um fluxo de consentimento informado em conformidade com a legislação brasileira de proteção de dados:

1. **Validação Prévia dos Dados**: O usuário preenche os campos cadastrais obrigatórios.
2. **Tela do Termo da LGPD**: Ao clicar em confirmar, é aberto o modal oficial de consentimento contendo:
   - Identificação do titular dos dados e perfil cadastrado.
   - **Finalidade Específica**: Autenticação, agendamento, prontuário clínico e supervisão acadêmica.
   - **Garantias de Sigilo**: Acesso restrito a profissionais e supervisores sob sigilo ético.
   - **Não Compartilhamento Comercial**: Proibição estrita de repasse a terceiros para fins publicitários.
   - **Direitos do Titular (Art. 18 da LGPD)**: Confirmação, acesso, correção e eliminação de dados mediante requisição.
3. **Aceite Obrigatório**: O cadastro só é efetivado após o titular marcar expressamente a caixa de consentimento e clicar em *"Aceitar Termos e Concluir Cadastro"*.

---

### 6. Módulo de Recuperação de Senha

- O fluxo *"Esqueci minha senha"* permite ao usuário informar o e-mail ou login cadastrado na plataforma.
- Ao solicitar a recuperação, o sistema valida os dados do titular e dispara o e-mail com as instruções de segurança e o código de verificação.
- Uma tela de confirmação de envio é apresentada com o e-mail destinatário, instruções para checagem da caixa de entrada/spam e botão para retorno imediato à tela de login ou acionamento do aplicativo de e-mail.

---

### 7. Estrutura dos Arquivos do Projeto

```
src/
├── components/
│   ├── AdminView.tsx                 # Painel do Administrador Geral
│   ├── AuthScreen.tsx                # Telas de Login, Cadastro e Recuperação de Senha
│   ├── BackupRestoreModal.tsx        # Modal de Backup e Restauração de Base de Dados
│   ├── EditProfileModal.tsx          # Modal de Edição de Perfil e Troca de Senha
│   ├── EstagiarioView.tsx            # Painel do Aluno Estagiário
│   ├── LGPDModal.tsx                 # Termo Oficial de Consentimento da LGPD
│   ├── MultiDateSchedulePicker.tsx   # Seletor de Múltiplos Dias e Horários
│   ├── Navbar.tsx                    # Barra Superior de Navegação e Menus
│   ├── NotificationDrawer.tsx        # Central de Notificações (WhatsApp e E-mail)
│   ├── OrientadorView.tsx            # Painel do Orientador Docente & Supervisor
│   ├── PacienteView.tsx              # Portal do Paciente para Agendamentos
│   ├── ProfissionalView.tsx          # Painel do Profissional e Prontuários
│   ├── RelatorioAtendimentosModal.tsx # Emissão e Impressão de Relatórios Oficiais
│   └── SIACSLogo.tsx                 # Componentes Oficiais do Logotipo e Monograma
├── context/
│   └── AuthContext.tsx               # Contexto Global de Autenticação e Sessão
├── services/
│   └── db.ts                         # Banco de Dados Estruturado e Persistência
├── types/
│   └── index.ts                      # Interfaces e Tipos TypeScript Globais
├── utils/
│   └── avatar.ts                     # Utilitários de Avatares e Tratamento de Imagem
├── App.tsx                           # Componente Raiz da Aplicação
├── index.css                         # Estilização Global com Tailwind CSS
└── main.tsx                          # Ponto de Entrada da Aplicação
```

---

### 8. Procedimentos de Backup, Auditoria e Segurança

- **Backup Integral**: Disponível no menu do Administrador através da opção *"Exportar Base de Dados"*, que gera um arquivo `.json` com todos os usuários, agendamentos, salas e prontuários.
- **Restauração de Dados**: Permite carregar um arquivo JSON de backup previamente gerado, reescrevendo a base local de forma segura e consistente.
- **Habilitação de Contas**: Contas de profissionais e estagiários criadas via cadastro público iniciam no estado pendente de aprovação, devendo ser habilitadas pelo orientador ou administrador antes da realização de atendimentos.
