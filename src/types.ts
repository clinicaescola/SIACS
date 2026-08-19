export type UserRole = 'profissional' | 'estagiario' | 'paciente' | 'orientador' | 'admin';

export interface BaseUser {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  login: string; // email
  senha: string;
  role: UserRole;
  foto?: string;
  criadoEm: string;
}

export interface ProfissionalUser extends BaseUser {
  role: 'profissional';
  crm?: string;
  crp?: string;
  especialidade?: string;
  bio?: string;
  aprovado?: boolean; // false se pendente de habilitação pelo Orientador/Admin
  aprovadoPor?: string;
  aprovadoEm?: string;
}

export interface EstagiarioUser extends BaseUser {
  role: 'estagiario';
  cpf: string;
  turma: string;
  orientadorId?: string;
  semestre?: string;
  horasExigidas?: number; // Total de horas de estágio cadastradas pelo orientador (ex: 100)
}

export interface RelatorioEstagio {
  id: string;
  agendamentoId?: string;
  estagiarioId: string;
  estagiarioNome: string;
  estagiarioTurma?: string;
  pacienteId?: string;
  pacienteNome: string;
  profissionalId?: string;
  profissionalNome?: string;
  orientadorId?: string;
  orientadorNome?: string;
  dataSessao: string; // YYYY-MM-DD
  horario: string;
  horasComputadas: number; // Ex: 1, 1.5, 2
  avaliacaoReflexiva: string; // Parecer do estagiário sobre a sessão, técnicas e aprendizado
  resumoCaso?: string;
  atividadesRealizadas?: string;
  avaliacaoAutoCritica?: string;
  dificuldadesEncontradas?: string;
  status: 'pendente' | 'validado' | 'rejeitado';
  parecerOrientador?: string;
  criadoEm: string;
  validadoEm?: string;
  validadoPorNome?: string;
}

export interface PacienteUser extends BaseUser {
  role: 'paciente';
  cpf: string;
  rg?: string;
  endereco: string;
  dataNascimento?: string;
  genero?: string;
  raca?: string;
  profissao?: string;
  atividadeTrabalho?: string;
  escolaridade?: string;
  naturalidade?: string;
  religiao?: string;
  estadoCivil?: string;
  contatoEmergenciaNome?: string;
  contatoEmergenciaTelefone?: string;
  contatoPessoaConfianca?: string;
  responsavelLegal?: string;
  numeroProntuario?: string; // Número único de prontuário por paciente com o Ano (ex: PSI-2026/0001)
}

export interface OrientadorUser extends BaseUser {
  role: 'orientador';
  cpf: string;
  endereco: string;
  departamento?: string;
  crp?: string;
}

export interface AdminUser extends BaseUser {
  role: 'admin';
  cargo?: string;
  departamento?: string;
  cpf?: string;
}

export type AppUser = ProfissionalUser | EstagiarioUser | PacienteUser | OrientadorUser | AdminUser;

export interface HorarioDisponivel {
  id: string;
  profissionalId: string;
  profissionalNome: string;
  especialidade: string;
  data: string; // YYYY-MM-DD
  horaInicio: string; // HH:MM
  horaFim: string; // HH:MM
  status: 'disponivel' | 'agendado' | 'bloqueado';
  agendamentoId?: string;
}

export interface DisponibilidadeEstagiario {
  id: string;
  estagiarioId: string;
  estagiarioNome: string;
  turma: string;
  data: string; // YYYY-MM-DD
  horaInicio: string;
  horaFim: string;
  observacoes?: string;
  status: 'disponivel' | 'alocado';
}

export type StatusAgendamento = 'agendado' | 'confirmado' | 'em_atendimento' | 'concluido' | 'cancelado';

export interface Agendamento {
  id: string;
  horarioId: string;
  pacienteId: string;
  pacienteNome: string;
  pacienteTelefone: string;
  pacienteEmail: string;
  profissionalId: string;
  profissionalNome: string;
  profissionalEspecialidade: string;
  profissionalTelefone: string;
  profissionalEmail: string;
  estagiarioId?: string;
  estagiarioNome?: string;
  estagiarioTelefone?: string;
  estagiarioEmail?: string;
  orientadorId?: string;
  orientadorNome?: string;
  orientadorEmail?: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM - HH:MM
  modalidade: 'Presencial' | 'Online';
  sala: string;
  tipoConsulta: 'Primeira Consulta (Anamnese)' | 'Acompanhamento / Sessão';
  status: StatusAgendamento;
  confirmadoPeloPaciente: boolean;
  lembreteEnviado: boolean;
  criadoEm: string;
  motivoConsulta?: string;
  possuiAnamnese?: boolean;
  possuiAvaliacao?: boolean;
}

export interface Anamnese {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  numeroProntuario?: string; // Número único de prontuário com o Ano (ex: PSI-2026/0001)
  idade: number | string;
  profissao: string;
  estadoCivil: string;
  principaisQueixas: string;
  observacoes: string;
  historicoFamiliar?: string;
  medicamentosEmUso?: string;
  expectativasTratamento?: string;
  profissionalId: string;
  profissionalNome: string;
  estagiarioId?: string;
  estagiarioNome?: string;
  orientadorId?: string;
  orientadorNome?: string;
  dataRegistro: string;
}

export interface Acompanhamento {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  numeroProntuario?: string; // Número único de prontuário com o Ano atrelado à ficha de acompanhamento
  agendamentoId?: string;
  numeroSessao: number;
  data: string; // YYYY-MM-DD ou data/hora
  observacoes: string;
  tecnicasUtilizadas?: string;
  planoProximosPassos?: string;
  evolucaoClinica?: string;
  statusPresenca: 'Presente' | 'Faltou' | 'Justificado';
  profissionalId: string;
  profissionalNome: string;
  crpProfissional?: string;
  estagiarioId?: string;
  estagiarioNome?: string;
  raEstagiario?: string;
  orientadorId?: string;
  orientadorNome?: string;
  crpOrientador?: string;
  dataRegistro: string;
}

export interface NotificacaoDisparo {
  id: string;
  agendamentoId?: string;
  destinatarioTipo: UserRole;
  destinatarioNome: string;
  destinatarioEmail: string;
  destinatarioTelefone: string;
  tipo: 'agendamento_criado' | 'lembrete_1_dia' | 'confirmacao_paciente' | 'anamnese_registrada' | 'avaliacao_recebida';
  assunto: string;
  conteudoHtml: string;
  conteudoTexto: string;
  dataEnvio: string;
  canal: 'email' | 'whatsapp' | 'ambos';
  status: 'enviado' | 'lido';
  whatsappUrl: string;
}

export interface Avaliacao {
  id: string;
  agendamentoId: string;
  pacienteId: string;
  pacienteNome: string;
  dataAtendimento: string;
  profissionalId: string;
  profissionalNome: string;
  notaProfissional: number; // 1-5
  comentarioProfissional: string;
  estagiarioId?: string;
  estagiarioNome?: string;
  notaEstagiario?: number; // 1-5
  comentarioEstagiario?: string;
  notaGeral: number; // 1-5
  pontualidade: number; // 1-5
  acolhimento: number; // 1-5
  recomendaria: boolean;
  dataAvaliacao: string;
}

export interface EmailSmtpConfig {
  ativo: boolean;
  metodoEnvio?: 'smtp' | 'resend_api' | 'brevo_api'; // Método de entrega
  apiKey?: string; // Chave de API para Resend ou Brevo (HTTPS porta 443 sem bloqueio de portas)
  servidorSmtp: string; // Ex: smtp.gmail.com, smtp.office365.com
  porta: number; // 465 ou 587
  seguranca: 'tls' | 'ssl' | 'none';
  emailRemetente: string; // E-mail válido do administrador ou da clínica
  nomeRemetente: string; // Nome exibido no remetente
  senhaApp: string; // Senha ou Senha de Aplicativo (16 letras)
  disparoAutomaticoRecuperacao: boolean;
  disparoAutomaticoAgendamento: boolean;
  disparoAutomaticoLembretes: boolean;
  copiaOcultaAdmin?: string;
  ultimoTesteStatus?: 'sucesso' | 'erro' | 'pendente';
  ultimoTesteMensagem?: string;
  ultimoTesteData?: string;
}

export interface EmailDispatchLog {
  id: string;
  tipo: 'recuperacao_senha' | 'confirmacao_agendamento' | 'lembrete_consulta' | 'teste_conexao';
  destinatario: string;
  destinatarioNome: string;
  assunto: string;
  corpoHtml: string;
  corpoTexto: string;
  status: 'enviado' | 'falha' | 'simulado';
  dataHora: string;
  detalhes?: string;
}

export interface AnamnesePsicologiaCompleta {
  id: string;
  pacienteId?: string;
  pacienteNome: string;
  numeroProntuario?: string;
  dataAvaliacao: string;
  dataNascimento?: string;
  idade?: string | number;
  genero?: string;
  estadoCivil?: string;
  raca?: string; // Raça / Cor / Etnia
  profissao?: string;
  atividadeTrabalho?: string; // Atividade de trabalho que desempenha
  escolaridade?: string;
  naturalidade?: string;
  religiao?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  contatoEmergenciaNome?: string;
  contatoEmergenciaTelefone?: string;
  contatoPessoaConfianca?: string; // Contato de uma pessoa de confiança (Nome, vínculo, telefone)
  responsavelLegal?: string;
  
  // Atendimento e Equipe
  modalidadeAtendimento: 'Presencial' | 'Online';
  profissionalResponsavel: string;
  crpProfissional?: string;
  estagiarioNome?: string;
  raEstagiario?: string;
  turmaEstagiario?: string;
  orientadorNome?: string;
  crpOrientador?: string;

  // 1. Queixa Principal & Demanda
  queixaPrincipal: string;
  queixaInicial?: string;
  elementosComplementares?: string;
  tempoEvolucao?: string;
  encaminhamentoOrigem?: string;

  // 2. Histórico da Demanda Atual (HDA)
  historicoQueixaAtual: string;
  fatoresDesencadeantes?: string;
  impactoRotinaRelacoes?: string;
  tratamentosPsicologicosAnteriores?: string;

  // 3. Peculiaridades Hereditárias & Histórico Familiar
  caracteristicasFisicoBiologicas?: string; // Principais características físico-biológicas da família (caráter, estrutura)
  caracteristicasFisicoBiologicasPersonalidade?: string; // O que ajudou na composição da personalidade?
  historicoDoencasFamiliares?: string; // Histórico de doenças (incluindo adoecimento mental) dos familiares
  historicoDoencasFamiliaresPersonalidade?: string; // O que ajudou na composição da personalidade?
  composicaoFamiliar?: string;
  relacionamentoFamiliar?: string;
  historicoFamiliarPsiquiatrico?: string;

  // 4. Dinâmica da Vida (Desenvolvimento Histórico-Cultural / Ciclo Vital)
  // Gestação e Nascimento
  gestacaoNascimento?: string;
  gestacaoNascimentoMediadores?: string;
  gestacaoNascimentoPersonalidade?: string;
  // Comunicação emocional
  comunicacaoEmocional?: string; // A criança foi atendida em suas necessidades emocionais?
  comunicacaoEmocionalMediadores?: string;
  comunicacaoEmocionalPersonalidade?: string;
  // Atividade objetal manipulatória
  atividadeObjetalManipulatoria?: string; // Experiência de explorar o meio e manipular objetos
  atividadeObjetalManipulatoriaMediadores?: string;
  atividadeObjetalManipulatoriaPersonalidade?: string;
  // Desenvolvimento da linguagem
  desenvolvimentoLinguagem?: string; // Como foi para começar a nomear
  desenvolvimentoLinguagemMediadores?: string;
  desenvolvimentoLinguagemPersonalidade?: string;
  // Jogo de papéis / Brincar
  jogoPapeisBrincar?: string; // Como se caracterizava o brincar? Que papéis assumia?
  jogoPapeisBrincarMediadores?: string;
  jogoPapeisBrincarPersonalidade?: string;
  // Relações familiares
  relacoesFamiliaresVida?: string; // Pessoas próximas, pessoas distantes
  relacoesFamiliaresMediadores?: string;
  relacoesFamiliaresPersonalidade?: string;
  // Socialização
  socializacao?: string; // Busca por interações e como se davam
  socializacaoMediadores?: string;
  socializacaoPersonalidade?: string;
  // Atividade de estudo
  atividadeEstudo?: string; // Processo de escolarização e sentidos dos estudos
  atividadeEstudoMediadores?: string;
  atividadeEstudoPersonalidade?: string;
  // Relações afetivas
  relacoesAfetivasVida?: string; // Preferências e identificações nas figuras íntimas
  relacoesAfetivasMediadores?: string;
  relacoesAfetivasPersonalidade?: string;
  // Sexualidade
  sexualidade?: string; // Experiências sexuais significativas
  sexualidadeMediadores?: string;
  sexualidadePersonalidade?: string;
  // Inserção no contexto de trabalho
  insercaoTrabalho?: string; // Escolha profissional e sentidos sobre o trabalho
  insercaoTrabalhoMediadores?: string;
  insercaoTrabalhoPersonalidade?: string;

  // 5. Cenário de Vida Atual
  cenarioPessoasSignificativas?: string;
  cenarioPessoasSignificativasPersonalidade?: string;
  cenarioAtividadesPresentes?: string;
  cenarioAtividadesPresentesPersonalidade?: string;
  cenarioContextosCirculacao?: string;
  cenarioContextosCirculacaoPersonalidade?: string;

  // 6. Sintomatologia do Desenvolvimento
  nivelDesenvolvimentoPresente?: string; // Nível do desenvolvimento que alcançou a pessoa no momento presente
  caracteristicasDesenvolvimentoPresente?: string; // Características do desenvolvimento que alcançou
  possibilidadesDesenvolvimento?: string; // Possibilidades de desenvolvimento (Potencialidades / ZPD)

  // 7. Histórico Clínico e Hábitos
  condicoesMedicasGerais?: string;
  medicamentosUsoContinuo?: string;
  psicofarmacosPosologia?: string;
  padraoSonoAlimentacao?: string;
  usoSubstancias?: string;
  relacoesAfetivas?: string;
  redeApoioSocial?: string;
  rotinaTrabalhoEstudo?: string;
  atividadesLazer?: string;
  desenvolvimentoInfanciaAdolescencia?: string;
  vidaAdultaMarcos?: string;
  perdasTraumasLutos?: string;

  // 8. Exame das Funções Psíquicas (Súmula Psicopatológica)
  aparenciaAtitude?: string;
  conscienciaOrientacao?: string;
  atencaoMemoria?: string;
  pensamentoLinguagem?: string;
  humorAfeto?: string;
  sensopercepcao?: string;
  juizoCriticoInsight?: string;
  psicomotricidade?: string;

  // 9. Compreensão Diagnóstica, Enquadre e Metas
  compreensaoDiagnostica?: string;
  enquadreTeorico?: string;
  hipoteseDiagnosticaCid?: string;
  objetivosTerapeuticos?: string;
  frequenciaSessoes?: string;
  encaminhamentos?: string;
  observacoesGerais?: string;

  criadoEm: string;
  atualizadoEm?: string;
}



