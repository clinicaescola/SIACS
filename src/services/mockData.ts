import {
  ProfissionalUser,
  EstagiarioUser,
  PacienteUser,
  OrientadorUser,
  AdminUser,
  AppUser,
  HorarioDisponivel,
  DisponibilidadeEstagiario,
  Agendamento,
  Anamnese,
  Acompanhamento,
  NotificacaoDisparo,
  Avaliacao,
  RelatorioEstagio
} from '../types';

export const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'admin-main',
    nome: 'Administrador Geral (Admin)',
    cargo: 'Coordenador e Administrador Geral',
    departamento: 'Diretoria Clínica & Coordenação de Estágios',
    cpf: '000.111.222-33',
    telefone: '(11) 98888-7766',
    email: 'admin',
    login: 'admin',
    senha: 'admin',
    role: 'admin',
    foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    criadoEm: '2026-01-01T08:00:00Z'
  },
  {
    id: 'admin-1',
    nome: 'Dr. Roberto Fontes',
    cargo: 'Coordenador Geral da Clínica Escola',
    departamento: 'Diretoria de Saúde & Coordenação Clínica',
    cpf: '000.111.222-44',
    telefone: '(11) 98888-7766',
    email: 'admin@clinicaescola.edu.br',
    login: 'admin@clinicaescola.edu.br',
    senha: 'admin',
    role: 'admin',
    foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    criadoEm: '2026-01-01T08:00:00Z'
  }
];

export const INITIAL_PROFISSIONAIS: ProfissionalUser[] = [
  {
    id: 'prof-1',
    nome: 'Dra. Camila Andrade',
    crp: '06/142980',
    especialidade: 'Psicologia Clínica & TCC (Terapia Cognitivo-Comportamental)',
    telefone: '(11) 98765-4321',
    email: 'camila.andrade@clinicaescola.edu.br',
    login: 'camila.andrade@clinicaescola.edu.br',
    senha: '123',
    role: 'profissional',
    foto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    bio: 'Especialista em transtornos de ansiedade, regulação emocional e supervisão clínica na clínica escola.',
    aprovado: true,
    aprovadoPor: 'Dra. Helena Matos (Orientadora)',
    aprovadoEm: '2026-01-10T08:00:00Z',
    criadoEm: '2026-01-10T08:00:00Z'
  },
  {
    id: 'prof-2',
    nome: 'Dr. Marcelo Peixoto',
    crp: '06/098741',
    especialidade: 'Psicanálise & Saúde Mental do Adulto',
    telefone: '(11) 97654-3210',
    email: 'marcelo.peixoto@clinicaescola.edu.br',
    login: 'marcelo.peixoto@clinicaescola.edu.br',
    senha: '123',
    role: 'profissional',
    foto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    bio: 'Mestre em Psicologia Social, focado no acolhimento de luto, depressão e formação continuada de estagiários.',
    aprovado: true,
    aprovadoPor: 'Dra. Helena Matos (Orientadora)',
    aprovadoEm: '2026-01-15T09:00:00Z',
    criadoEm: '2026-01-15T09:00:00Z'
  },
  {
    id: 'prof-3',
    nome: 'Dr. Fernando Rocha',
    crp: '06/178520',
    especialidade: 'Neuropsicologia & Avaliação Cognitiva',
    telefone: '(11) 99112-3344',
    email: 'fernando.rocha@clinicaescola.edu.br',
    login: 'fernando.rocha@clinicaescola.edu.br',
    senha: '123',
    role: 'profissional',
    foto: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    bio: 'Especialista em neuropsicologia, atendimento clínico a adultos e idosos.',
    aprovado: false, // Aguardando habilitação no sistema pelo Orientador ou Administração
    criadoEm: '2026-02-01T14:30:00Z'
  }
];

export const INITIAL_ESTAGIARIOS: EstagiarioUser[] = [
  {
    id: 'est-1',
    nome: 'Lucas Silveira',
    cpf: '123.456.789-00',
    turma: 'PSI-2024.1 (9º Semestre)',
    telefone: '(11) 99123-4567',
    email: 'lucas.silveira@aluno.clinicaescola.edu.br',
    login: 'lucas.silveira@aluno.clinicaescola.edu.br',
    senha: '123',
    role: 'estagiario',
    orientadorId: 'orient-1',
    foto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    semestre: '9º Semestre',
    horasExigidas: 100,
    criadoEm: '2026-02-01T10:00:00Z'
  },
  {
    id: 'est-2',
    nome: 'Beatriz Mendes',
    cpf: '987.654.321-11',
    turma: 'PSI-2024.2 (10º Semestre)',
    telefone: '(11) 99876-5432',
    email: 'beatriz.mendes@aluno.clinicaescola.edu.br',
    login: 'beatriz.mendes@aluno.clinicaescola.edu.br',
    senha: '123',
    role: 'estagiario',
    orientadorId: 'orient-1',
    foto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    semestre: '10º Semestre',
    horasExigidas: 120,
    criadoEm: '2026-02-01T10:30:00Z'
  }
];

export const INITIAL_PACIENTES: PacienteUser[] = [
  {
    id: 'pac-1',
    nome: 'Ana Clara Souza',
    cpf: '111.222.333-44',
    numeroProntuario: 'PSI-2026/0001',
    endereco: 'Rua das Acácias, 240, Apto 42 - São Paulo/SP',
    telefone: '(11) 98111-2233',
    email: 'anaclara.souza@gmail.com',
    login: 'anaclara.souza@gmail.com',
    senha: '123',
    role: 'paciente',
    dataNascimento: '1995-04-12',
    profissao: 'Designer Gráfica',
    estadoCivil: 'Solteira',
    foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    criadoEm: '2026-02-05T14:00:00Z'
  },
  {
    id: 'pac-2',
    nome: 'Carlos Eduardo Lima',
    cpf: '555.666.777-88',
    numeroProntuario: 'PSI-2026/0002',
    endereco: 'Av. Paulista, 1800, Conjunto 12 - São Paulo/SP',
    telefone: '(11) 98555-6677',
    email: 'carlos.lima@outlook.com',
    login: 'carlos.lima@outlook.com',
    senha: '123',
    role: 'paciente',
    dataNascimento: '1988-11-23',
    profissao: 'Analista de Sistemas',
    estadoCivil: 'Casado',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    criadoEm: '2026-02-10T11:00:00Z'
  },
  {
    id: 'pac-3',
    nome: 'Juliana Ferreira',
    cpf: '444.333.222-11',
    numeroProntuario: 'PSI-2026/0003',
    endereco: 'Rua Bela Cintra, 890 - São Paulo/SP',
    telefone: '(11) 97444-3322',
    email: 'juliana.ferreira@gmail.com',
    login: 'juliana.ferreira@gmail.com',
    senha: '123',
    role: 'paciente',
    dataNascimento: '2001-08-19',
    profissao: 'Estudante Universitária',
    estadoCivil: 'Solteira',
    foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    criadoEm: '2026-02-12T09:30:00Z'
  }
];

export const INITIAL_ORIENTADORES: OrientadorUser[] = [
  {
    id: 'orient-1',
    nome: 'Profa. Dra. Helena Matos',
    cpf: '333.444.555-66',
    endereco: 'Alameda Santos, 1200 - São Paulo/SP',
    telefone: '(11) 99333-4455',
    email: 'helena.matos@clinicaescola.edu.br',
    login: 'helena.matos@clinicaescola.edu.br',
    senha: '123',
    role: 'orientador',
    departamento: 'Coordenação de Estágios Supervisionados em Psicologia',
    crp: '06/054321',
    foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    criadoEm: '2026-01-05T08:00:00Z'
  }
];

// Seed dates helper (using current realistic future and past dates)
const today = new Date();
const formatDate = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(today.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_HORARIOS: HorarioDisponivel[] = [
  {
    id: 'hor-1',
    profissionalId: 'prof-1',
    profissionalNome: 'Dra. Camila Andrade',
    especialidade: 'Psicologia Clínica & TCC',
    data: formatDate(1),
    horaInicio: '09:00',
    horaFim: '10:00',
    status: 'agendado',
    agendamentoId: 'agend-1'
  },
  {
    id: 'hor-2',
    profissionalId: 'prof-1',
    profissionalNome: 'Dra. Camila Andrade',
    especialidade: 'Psicologia Clínica & TCC',
    data: formatDate(1),
    horaInicio: '10:30',
    horaFim: '11:30',
    status: 'disponivel'
  },
  {
    id: 'hor-3',
    profissionalId: 'prof-1',
    profissionalNome: 'Dra. Camila Andrade',
    especialidade: 'Psicologia Clínica & TCC',
    data: formatDate(2),
    horaInicio: '14:00',
    horaFim: '15:00',
    status: 'disponivel'
  },
  {
    id: 'hor-4',
    profissionalId: 'prof-1',
    profissionalNome: 'Dra. Camila Andrade',
    especialidade: 'Psicologia Clínica & TCC',
    data: formatDate(3),
    horaInicio: '16:00',
    horaFim: '17:00',
    status: 'disponivel'
  },
  {
    id: 'hor-5',
    profissionalId: 'prof-2',
    profissionalNome: 'Dr. Marcelo Peixoto',
    especialidade: 'Psicanálise & Saúde Mental',
    data: formatDate(1),
    horaInicio: '13:30',
    horaFim: '14:30',
    status: 'disponivel'
  },
  {
    id: 'hor-6',
    profissionalId: 'prof-2',
    profissionalNome: 'Dr. Marcelo Peixoto',
    especialidade: 'Psicanálise & Saúde Mental',
    data: formatDate(2),
    horaInicio: '15:00',
    horaFim: '16:00',
    status: 'disponivel'
  },
  {
    id: 'hor-7',
    profissionalId: 'prof-2',
    profissionalNome: 'Dr. Marcelo Peixoto',
    especialidade: 'Psicanálise & Saúde Mental',
    data: formatDate(-3),
    horaInicio: '09:00',
    horaFim: '10:00',
    status: 'agendado',
    agendamentoId: 'agend-past-1'
  }
];

export const INITIAL_DISP_ESTAGIARIOS: DisponibilidadeEstagiario[] = [
  {
    id: 'disp-est-1',
    estagiarioId: 'est-1',
    estagiarioNome: 'Lucas Silveira',
    turma: 'PSI-2024.1',
    data: formatDate(1),
    horaInicio: '08:00',
    horaFim: '12:00',
    observacoes: 'Disponível no turno matutino para atendimentos de TCC.',
    status: 'disponivel'
  },
  {
    id: 'disp-est-2',
    estagiarioId: 'est-1',
    estagiarioNome: 'Lucas Silveira',
    turma: 'PSI-2024.1',
    data: formatDate(2),
    horaInicio: '13:00',
    horaFim: '18:00',
    observacoes: 'Disponível no turno vespertino.',
    status: 'disponivel'
  },
  {
    id: 'disp-est-3',
    estagiarioId: 'est-2',
    estagiarioNome: 'Beatriz Mendes',
    turma: 'PSI-2024.2',
    data: formatDate(1),
    horaInicio: '13:00',
    horaFim: '18:00',
    observacoes: 'Disponível para plantão de acolhimento e supervisão.',
    status: 'disponivel'
  }
];

export const INITIAL_AGENDAMENTOS: Agendamento[] = [
  {
    id: 'agend-1',
    horarioId: 'hor-1',
    pacienteId: 'pac-1',
    pacienteNome: 'Ana Clara Souza',
    pacienteTelefone: '(11) 98111-2233',
    pacienteEmail: 'anaclara.souza@gmail.com',
    profissionalId: 'prof-1',
    profissionalNome: 'Dra. Camila Andrade',
    profissionalEspecialidade: 'Psicologia Clínica & TCC',
    profissionalTelefone: '(11) 98765-4321',
    profissionalEmail: 'camila.andrade@clinicaescola.edu.br',
    estagiarioId: 'est-1',
    estagiarioNome: 'Lucas Silveira',
    estagiarioTelefone: '(11) 99123-4567',
    estagiarioEmail: 'lucas.silveira@aluno.clinicaescola.edu.br',
    orientadorId: 'orient-1',
    orientadorNome: 'Profa. Dra. Helena Matos',
    orientadorEmail: 'helena.matos@clinicaescola.edu.br',
    data: formatDate(1),
    horario: '09:00 - 10:00',
    modalidade: 'Presencial',
    sala: 'Consultório 03 - Térreo',
    tipoConsulta: 'Primeira Consulta (Anamnese)',
    status: 'confirmado',
    confirmadoPeloPaciente: true,
    lembreteEnviado: true,
    criadoEm: '2026-08-15T10:00:00Z',
    motivoConsulta: 'Sintomas de ansiedade generalizada e estresse ocupacional.',
    possuiAnamnese: false,
    possuiAvaliacao: false
  },
  {
    id: 'agend-past-1',
    horarioId: 'hor-7',
    pacienteId: 'pac-2',
    pacienteNome: 'Carlos Eduardo Lima',
    pacienteTelefone: '(11) 98555-6677',
    pacienteEmail: 'carlos.lima@outlook.com',
    profissionalId: 'prof-2',
    profissionalNome: 'Dr. Marcelo Peixoto',
    profissionalEspecialidade: 'Psicanálise & Saúde Mental',
    profissionalTelefone: '(11) 97654-3210',
    profissionalEmail: 'marcelo.peixoto@clinicaescola.edu.br',
    estagiarioId: 'est-2',
    estagiarioNome: 'Beatriz Mendes',
    estagiarioTelefone: '(11) 99876-5432',
    estagiarioEmail: 'beatriz.mendes@aluno.clinicaescola.edu.br',
    orientadorId: 'orient-1',
    orientadorNome: 'Profa. Dra. Helena Matos',
    orientadorEmail: 'helena.matos@clinicaescola.edu.br',
    data: formatDate(-3),
    horario: '09:00 - 10:00',
    modalidade: 'Presencial',
    sala: 'Consultório 01 - 1º Andar',
    tipoConsulta: 'Primeira Consulta (Anamnese)',
    status: 'concluido',
    confirmadoPeloPaciente: true,
    lembreteEnviado: true,
    criadoEm: '2026-08-10T09:00:00Z',
    motivoConsulta: 'Dificuldade de concentração e insônia frequente.',
    possuiAnamnese: true,
    possuiAvaliacao: true
  }
];

export const INITIAL_ANAMNESES: Anamnese[] = [
  {
    id: 'anam-1',
    pacienteId: 'pac-2',
    pacienteNome: 'Carlos Eduardo Lima',
    numeroProntuario: 'PSI-2026/0002',
    idade: 37,
    profissao: 'Analista de Sistemas',
    estadoCivil: 'Casado',
    principaisQueixas: 'Episódios recorrentes de insônia inicial, sobrecarga cognitiva no trabalho, sensação de esgotamento e palpitações em reuniões de alta pressão.',
    observacoes: 'Paciente apresenta discurso coerente, humor ansioso e orientado no tempo/espaço. Relata início dos sintomas há cerca de 6 meses após mudança de cargo. Boa adesão à proposta de escuta clínica supervisionada.',
    historicoFamiliar: 'Mãe com histórico de tratamento para depressão leve. Pai hipertenso.',
    medicamentosEmUso: 'Nenhum psicofármaco no momento; utiliza melatonina ocasionalmente.',
    expectativasTratamento: 'Aprender técnicas de manejo do estresse e compreender origens da autocobrança excessiva.',
    profissionalId: 'prof-2',
    profissionalNome: 'Dr. Marcelo Peixoto',
    estagiarioId: 'est-2',
    estagiarioNome: 'Beatriz Mendes',
    orientadorId: 'orient-1',
    orientadorNome: 'Profa. Dra. Helena Matos',
    dataRegistro: formatDate(-3)
  }
];

export const INITIAL_ACOMPANHAMENTOS: Acompanhamento[] = [
  {
    id: 'acomp-1',
    pacienteId: 'pac-2',
    pacienteNome: 'Carlos Eduardo Lima',
    numeroProntuario: 'PSI-2026/0002',
    agendamentoId: 'agend-past-1',
    numeroSessao: 1,
    data: formatDate(-3),
    observacoes: 'Realizado o primeiro acolhimento e anamnese detalhada com o paciente. A estagiária Beatriz conduziu a exploração da rotina de sono e gatilhos de estresse diário sob orientação direta do Dr. Marcelo.',
    tecnicasUtilizadas: 'Entrevista clínica semiestruturada, psicoeducação sobre o ciclo do estresse e higiene do sono.',
    planoProximosPassos: 'Aplicar diário de pensamentos automáticos e monitorar qualidade do sono nas próximas duas semanas.',
    statusPresenca: 'Presente',
    profissionalId: 'prof-2',
    profissionalNome: 'Dr. Marcelo Peixoto',
    estagiarioId: 'est-2',
    estagiarioNome: 'Beatriz Mendes',
    orientadorId: 'orient-1',
    orientadorNome: 'Profa. Dra. Helena Matos',
    dataRegistro: formatDate(-3)
  }
];

export const INITIAL_AVALIACOES: Avaliacao[] = [
  {
    id: 'aval-1',
    agendamentoId: 'agend-past-1',
    pacienteId: 'pac-2',
    pacienteNome: 'Carlos Eduardo Lima',
    dataAtendimento: formatDate(-3),
    profissionalId: 'prof-2',
    profissionalNome: 'Dr. Marcelo Peixoto',
    notaProfissional: 5,
    comentarioProfissional: 'Excelente atendimento. O Dr. Marcelo me transmitiu muita segurança e clareza na explicação do tratamento.',
    estagiarioId: 'est-2',
    estagiarioNome: 'Beatriz Mendes',
    notaEstagiario: 5,
    comentarioEstagiario: 'A estagiária Beatriz foi extremamente atenciosa, educada e muito profissional nas anotações.',
    notaGeral: 5,
    pontualidade: 5,
    acolhimento: 5,
    recomendaria: true,
    dataAvaliacao: formatDate(-2)
  }
];

export const INITIAL_NOTIFICACOES: NotificacaoDisparo[] = [
  {
    id: 'notif-1',
    agendamentoId: 'agend-1',
    destinatarioTipo: 'paciente',
    destinatarioNome: 'Ana Clara Souza',
    destinatarioEmail: 'anaclara.souza@gmail.com',
    destinatarioTelefone: '(11) 98111-2233',
    tipo: 'agendamento_criado',
    assunto: '✅ Agendamento Confirmado - Clínica Escola de Psicologia',
    conteudoHtml: `<p>Olá <strong>Ana Clara Souza</strong>,</p><p>Sua consulta na <strong>Clínica Escola</strong> foi agendada com sucesso!</p><p>📅 <strong>Data:</strong> ${formatDate(1)} às 09:00<br>👩‍⚕️ <strong>Profissional:</strong> Dra. Camila Andrade<br>🎓 <strong>Estagiário:</strong> Lucas Silveira<br>📍 <strong>Local:</strong> Consultório 03 - Térreo</p>`,
    conteudoTexto: `Olá Ana Clara Souza, sua consulta na Clínica Escola foi agendada para ${formatDate(1)} às 09:00 com Dra. Camila Andrade e Lucas Silveira. Local: Consultório 03.`,
    dataEnvio: '2026-08-15T10:01:00Z',
    canal: 'ambos',
    status: 'enviado',
    whatsappUrl: `https://api.whatsapp.com/send?phone=5511981112233&text=${encodeURIComponent('Olá Ana Clara Souza! Sua consulta na Clínica Escola foi agendada para ' + formatDate(1) + ' às 09:00 com Dra. Camila Andrade.')}`
  },
  {
    id: 'notif-2',
    agendamentoId: 'agend-1',
    destinatarioTipo: 'profissional',
    destinatarioNome: 'Dra. Camila Andrade',
    destinatarioEmail: 'camila.andrade@clinicaescola.edu.br',
    destinatarioTelefone: '(11) 98765-4321',
    tipo: 'agendamento_criado',
    assunto: '📅 Novo Paciente Agendado: Ana Clara Souza',
    conteudoHtml: `<p>Dra. Camila, você possui um novo agendamento para <strong>${formatDate(1)} às 09:00</strong> com a paciente <strong>Ana Clara Souza</strong>. Estagiário escalado: Lucas Silveira.</p>`,
    conteudoTexto: `Dra. Camila, novo agendamento para ${formatDate(1)} às 09:00 com a paciente Ana Clara Souza.`,
    dataEnvio: '2026-08-15T10:01:05Z',
    canal: 'email',
    status: 'enviado',
    whatsappUrl: ''
  },
  {
    id: 'notif-3',
    agendamentoId: 'agend-1',
    destinatarioTipo: 'paciente',
    destinatarioNome: 'Ana Clara Souza',
    destinatarioEmail: 'anaclara.souza@gmail.com',
    destinatarioTelefone: '(11) 98111-2233',
    tipo: 'lembrete_1_dia',
    assunto: '🔔 Lembrete de Consulta (Amanhã) - Confirme sua presença na Clínica Escola',
    conteudoHtml: `<p>Olá <strong>Ana Clara</strong>! Lembramos que sua consulta está marcada para amanhã, <strong>${formatDate(1)} às 09:00</strong>. Por favor, confirme sua presença clicando no botão do portal ou respondendo ao WhatsApp.</p>`,
    conteudoTexto: `Lembrete Clínica Escola: Sua consulta é amanhã às 09:00 com Dra. Camila Andrade. Por favor confirme sua presença respondendo SIM.`,
    dataEnvio: '2026-08-16T08:00:00Z',
    canal: 'ambos',
    status: 'enviado',
    whatsappUrl: `https://api.whatsapp.com/send?phone=5511981112233&text=${encodeURIComponent('Olá Ana Clara! Lembramos que sua consulta na Clínica Escola está agendada para amanhã às 09:00 com Dra. Camila Andrade. Digite 1 para CONFIRMAR ou 2 para CANCELAR.')}`
  }
];

export const INITIAL_RELATORIOS_ESTAGIO: RelatorioEstagio[] = [
  {
    id: 'rel-est-1',
    agendamentoId: 'agend-past-1',
    estagiarioId: 'est-2',
    estagiarioNome: 'Beatriz Mendes',
    estagiarioTurma: 'PSI-2024.2 (10º Semestre)',
    pacienteNome: 'Carlos Eduardo Lima',
    profissionalId: 'prof-2',
    profissionalNome: 'Dr. Marcelo Peixoto',
    orientadorId: 'orient-1',
    dataSessao: formatDate(-3),
    horario: '10:00 - 11:00',
    horasComputadas: 1.5,
    avaliacaoReflexiva: 'Acompanhamento do acolhimento e elaboração da anamnese com o Dr. Marcelo. Observei o manejo das técnicas de escuta ativa, questionamento socrático e identificação dos primeiros padrões cognitivos disfuncionais quanto à rotina profissional do paciente.',
    status: 'validado',
    parecerOrientador: 'Excelente relatório e síntese reflexiva. Horas validadas para o cômputo curricular de estágio supervisionado.',
    criadoEm: formatDate(-3) + 'T14:30:00Z',
    validadoEm: formatDate(-2) + 'T16:00:00Z'
  },
  {
    id: 'rel-est-2',
    estagiarioId: 'est-1',
    estagiarioNome: 'Lucas Silveira',
    estagiarioTurma: 'PSI-2024.1 (9º Semestre)',
    pacienteNome: 'Atendimento Triagem Clínica',
    profissionalId: 'prof-1',
    profissionalNome: 'Dra. Camila Andrade',
    orientadorId: 'orient-1',
    dataSessao: formatDate(-5),
    horario: '14:00 - 16:00',
    horasComputadas: 2.0,
    avaliacaoReflexiva: 'Participação ativa na sessão de supervisão clínica pré-atendimento e acompanhamento da condução do protocolo de regulação emocional com a Dra. Camila. Elaboração das anotações de evolução do prontuário.',
    status: 'validado',
    parecerOrientador: 'Aprovado. Desempenho e pontualidade adequados.',
    criadoEm: formatDate(-5) + 'T18:00:00Z',
    validadoEm: formatDate(-4) + 'T09:00:00Z'
  }
];
