import {
  AppUser,
  ProfissionalUser,
  EstagiarioUser,
  PacienteUser,
  OrientadorUser,
  AdminUser,
  HorarioDisponivel,
  DisponibilidadeEstagiario,
  Agendamento,
  Anamnese,
  AnamnesePsicologiaCompleta,
  Acompanhamento,
  NotificacaoDisparo,
  Avaliacao,
  RelatorioEstagio,
  UserRole,
  EmailSmtpConfig,
  EmailDispatchLog
} from '../types';
import { SAD_AVATAR_DATA_URI } from '../utils/avatar';

const INITIAL_EMAIL_CONFIG: EmailSmtpConfig = {
  ativo: true,
  servidorSmtp: 'smtp.gmail.com',
  porta: 587,
  seguranca: 'tls',
  emailRemetente: 'siacs.campos.salles@gmail.com',
  nomeRemetente: 'SIACS • Faculdade Integradas Campos Salles',
  senhaApp: 'wkyz jbpd efgh lmno',
  disparoAutomaticoRecuperacao: true,
  disparoAutomaticoAgendamento: true,
  disparoAutomaticoLembretes: true,
  copiaOcultaAdmin: 'coordenacao.clinica@faculdadecs.edu.br',
  ultimoTesteStatus: 'sucesso',
  ultimoTesteMensagem: 'Servidor SMTP operacional e pronto para disparos automáticos.',
  ultimoTesteData: '2026-08-18T10:00:00Z'
};

const INITIAL_EMAIL_LOGS: EmailDispatchLog[] = [
  {
    id: 'elog-1',
    tipo: 'recuperacao_senha',
    destinatario: 'mariana.costa@email.com',
    destinatarioNome: 'Mariana Costa Ribeiro',
    assunto: '🔐 Recuperação de Senha - SIACS • Faculdade Campos Salles',
    corpoHtml: '<p>Instruções para recuperação de senha com código seguro.</p>',
    corpoTexto: 'Instruções de recuperação de senha com código seguro.',
    status: 'enviado',
    dataHora: '2026-08-18T09:15:00Z',
    detalhes: 'Disparado automaticamente via SMTP (smtp.gmail.com:587)'
  },
  {
    id: 'elog-2',
    tipo: 'confirmacao_agendamento',
    destinatario: 'mariana.costa@email.com',
    destinatarioNome: 'Mariana Costa Ribeiro',
    assunto: '✅ Consulta Confirmada: Terça-feira às 14:00 - SIACS Clínica Escola',
    corpoHtml: '<p>Seu agendamento foi confirmado com sucesso.</p>',
    corpoTexto: 'Seu agendamento foi confirmado com sucesso.',
    status: 'enviado',
    dataHora: '2026-08-18T09:30:00Z',
    detalhes: 'Disparado automaticamente via SMTP (smtp.gmail.com:587)'
  }
];
import {
  INITIAL_ADMINS,
  INITIAL_PROFISSIONAIS,
  INITIAL_ESTAGIARIOS,
  INITIAL_PACIENTES,
  INITIAL_ORIENTADORES,
  INITIAL_HORARIOS,
  INITIAL_DISP_ESTAGIARIOS,
  INITIAL_AGENDAMENTOS,
  INITIAL_ANAMNESES,
  INITIAL_ACOMPANHAMENTOS,
  INITIAL_AVALIACOES,
  INITIAL_NOTIFICACOES,
  INITIAL_RELATORIOS_ESTAGIO
} from './mockData';

const STORAGE_KEY_PREFIX = 'clinica_escola_v1_';

class DatabaseService {
  private listeners: Set<() => void> = new Set();

  private load<T>(key: string, initial: T): T {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Erro ao carregar dados do localStorage:', e);
    }
    return initial;
  }

  private save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
      this.notify();
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(fn => fn());
  }

  // --- Reset Database to Initial Seed ---
  public resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'admins');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'profissionais');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'estagiarios');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'pacientes');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'orientadores');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'horarios');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'disp_estagiarios');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'agendamentos');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'anamneses');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'acompanhamentos');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'avaliacoes');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'notificacoes');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'relatorios_estagio');
    this.notify();
  }

  // --- Users CRUD ---
  public getAdmins(): AdminUser[] {
    const list = this.load<AdminUser[]>('admins', INITIAL_ADMINS);
    // Garante que o usuário admin padrão (login 'admin', senha 'admin') sempre exista com privilégios de administrador
    const hasAdminAdmin = list.some(a => a.login === 'admin' || a.email === 'admin');
    if (!hasAdminAdmin) {
      const defaultAdmin: AdminUser = {
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
      };
      const updatedList = [defaultAdmin, ...list];
      this.save('admins', updatedList);
      return updatedList;
    }
    return list;
  }

  public getProfissionais(): ProfissionalUser[] {
    return this.load<ProfissionalUser[]>('profissionais', INITIAL_PROFISSIONAIS);
  }

  public getEstagiarios(): EstagiarioUser[] {
    return this.load<EstagiarioUser[]>('estagiarios', INITIAL_ESTAGIARIOS);
  }

  public getPacientes(): PacienteUser[] {
    return this.load<PacienteUser[]>('pacientes', INITIAL_PACIENTES);
  }

  public getOrientadores(): OrientadorUser[] {
    return this.load<OrientadorUser[]>('orientadores', INITIAL_ORIENTADORES);
  }

  public getAllUsers(): AppUser[] {
    return [
      ...this.getAdmins(),
      ...this.getProfissionais(),
      ...this.getEstagiarios(),
      ...this.getPacientes(),
      ...this.getOrientadores()
    ];
  }

  public getUserById(id: string): AppUser | undefined {
    return this.getAllUsers().find(u => u.id === id);
  }

  public findUserByLogin(emailOrLogin: string): AppUser | undefined {
    const term = emailOrLogin.trim().toLowerCase();
    return this.getAllUsers().find(
      u => u.login.toLowerCase() === term || u.email.toLowerCase() === term
    );
  }

  public registerUser(user: Partial<AppUser> & { role: UserRole; senha: string; email: string; nome: string }): AppUser {
    const allUsers = this.getAllUsers();

    // 1. Validação de E-mail Único (indiferente do tipo de acesso)
    const normalizedEmail = (user.email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error('O e-mail é obrigatório para cadastro.');
    }

    const emailJaExiste = allUsers.some(u =>
      u.email.trim().toLowerCase() === normalizedEmail ||
      u.login.trim().toLowerCase() === normalizedEmail
    );
    if (emailJaExiste) {
      throw new Error(`O e-mail "${normalizedEmail}" já está cadastrado no sistema (indiferente do tipo de acesso). Não é permitido cadastrar e-mails duplicados.`);
    }

    // 2. Validação de CPF Único (indiferente do tipo de acesso)
    const rawCpf = (user as any).cpf ? String((user as any).cpf) : '';
    const cleanCpf = rawCpf.replace(/\D/g, '');
    if (cleanCpf.length > 0) {
      const cpfJaExiste = allUsers.some(u => {
        const existingRawCpf = (u as any).cpf ? String((u as any).cpf) : '';
        const existingCleanCpf = existingRawCpf.replace(/\D/g, '');
        return existingCleanCpf.length > 0 && existingCleanCpf === cleanCpf;
      });
      if (cpfJaExiste) {
        throw new Error(`O CPF informado (${rawCpf}) já está cadastrado no sistema (indiferente do tipo de acesso). Não é permitido cadastrar o mesmo CPF duas vezes.`);
      }
    }

    const id = `${user.role}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
    const criadoEm = new Date().toISOString();
    const login = normalizedEmail;

    // Se não for adicionada foto no cadastro, usa o rostinho triste (sad face)
    const userPhoto = (user.foto && user.foto.trim() !== '') ? user.foto : SAD_AVATAR_DATA_URI;

    const newUserBase = {
      ...user,
      id,
      login,
      criadoEm,
      foto: userPhoto
    };

    if (user.role === 'admin') {
      const list = this.getAdmins();
      const created = {
        ...newUserBase,
        cargo: (user as any).cargo || 'Administrador do Sistema',
        departamento: (user as any).departamento || 'Coordenação Geral da Clínica Escola',
        cpf: (user as any).cpf || ''
      } as AdminUser;
      this.save('admins', [...list, created]);
      return created;
    } else if (user.role === 'profissional') {
      const list = this.getProfissionais();
      const isApproved = (user as any).aprovado !== undefined ? (user as any).aprovado : false;
      const created = {
        ...newUserBase,
        crm: (user as any).crm || (user as any).crp || 'CRM-PENDENTE',
        crp: (user as any).crm || (user as any).crp || 'CRM-PENDENTE',
        especialidade: (user as any).especialidade || 'Atendimento Clínico',
        bio: (user as any).bio || '',
        aprovado: isApproved,
        aprovadoPor: isApproved ? ((user as any).aprovadoPor || 'Administração') : undefined,
        aprovadoEm: isApproved ? new Date().toISOString() : undefined
      } as ProfissionalUser;
      this.save('profissionais', [...list, created]);
      return created;
    } else if (user.role === 'estagiario') {
      const list = this.getEstagiarios();
      const created = {
        ...newUserBase,
        cpf: (user as any).cpf || '',
        turma: (user as any).turma || 'Turma A',
        orientadorId: (user as any).orientadorId || 'orient-1'
      } as EstagiarioUser;
      this.save('estagiarios', [...list, created]);
      return created;
    } else if (user.role === 'paciente') {
      const list = this.getPacientes();
      const numPront = (user as any).numeroProntuario || this.gerarNumeroProntuarioUnico();
      const created = {
        ...newUserBase,
        cpf: (user as any).cpf || '',
        numeroProntuario: numPront,
        endereco: (user as any).endereco || 'Não informado',
        dataNascimento: (user as any).dataNascimento || '',
        profissao: (user as any).profissao || '',
        estadoCivil: (user as any).estadoCivil || 'Solteiro(a)'
      } as PacienteUser;
      this.save('pacientes', [...list, created]);
      return created;
    } else {
      const list = this.getOrientadores();
      const created = {
        ...newUserBase,
        cpf: (user as any).cpf || '',
        endereco: (user as any).endereco || 'Clínica Escola',
        departamento: (user as any).departamento || 'Coordenação de Estágios'
      } as OrientadorUser;
      this.save('orientadores', [...list, created]);
      return created;
    }
  }

  public updateUser(userId: string, updates: Partial<AppUser> & Record<string, any>): AppUser {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    const allUsers = this.getAllUsers();

    // 1. Validar e-mail se alterado
    let updatedEmail = user.email;
    let updatedLogin = user.login;
    if (updates.email !== undefined && updates.email !== user.email) {
      const normalizedEmail = updates.email.trim().toLowerCase();
      if (!normalizedEmail) {
        throw new Error('O e-mail não pode ficar em branco.');
      }
      const emailJaExiste = allUsers.some(u =>
        u.id !== userId && (
          u.email.trim().toLowerCase() === normalizedEmail ||
          u.login.trim().toLowerCase() === normalizedEmail
        )
      );
      if (emailJaExiste) {
        throw new Error(`O e-mail "${updates.email}" já está sendo utilizado por outro usuário no sistema.`);
      }
      updatedEmail = updates.email.trim();
      updatedLogin = normalizedEmail;
    }

    // 2. Validar CPF se alterado
    if (updates.cpf !== undefined && updates.cpf !== (user as any).cpf) {
      const rawCpf = String(updates.cpf);
      const cleanCpf = rawCpf.replace(/\D/g, '');
      if (cleanCpf.length > 0 && cleanCpf.length !== 11) {
        throw new Error('O CPF informado deve conter exatamente 11 dígitos.');
      }
      if (cleanCpf.length === 11) {
        const cpfJaExiste = allUsers.some(u => {
          if (u.id === userId) return false;
          const existingRaw = (u as any).cpf ? String((u as any).cpf) : '';
          const existingClean = existingRaw.replace(/\D/g, '');
          return existingClean.length === 11 && existingClean === cleanCpf;
        });
        if (cpfJaExiste) {
          throw new Error(`O CPF informado (${rawCpf}) já está cadastrado para outro usuário.`);
        }
      }
    }

    // 3. Atualizar foto (se fornecida vazia, usa o avatar padrão)
    let updatedFoto = user.foto;
    if (updates.foto !== undefined) {
      if (!updates.foto || updates.foto.trim() === '') {
        updatedFoto = SAD_AVATAR_DATA_URI;
      } else {
        updatedFoto = updates.foto.trim();
      }
    }

    const updatedUser = {
      ...user,
      ...updates,
      id: userId,
      role: user.role,
      email: updatedEmail,
      login: updatedLogin,
      foto: updatedFoto,
      senha: updates.senha !== undefined && updates.senha.trim() !== '' ? updates.senha.trim() : user.senha
    } as AppUser;

    if (user.role === 'admin') {
      const list = this.getAdmins().map(u => u.id === userId ? (updatedUser as AdminUser) : u);
      this.save('admins', list);
    } else if (user.role === 'profissional') {
      const list = this.getProfissionais().map(u => u.id === userId ? (updatedUser as ProfissionalUser) : u);
      this.save('profissionais', list);
    } else if (user.role === 'estagiario') {
      const list = this.getEstagiarios().map(u => u.id === userId ? (updatedUser as EstagiarioUser) : u);
      this.save('estagiarios', list);
    } else if (user.role === 'paciente') {
      const list = this.getPacientes().map(u => u.id === userId ? (updatedUser as PacienteUser) : u);
      this.save('pacientes', list);
    } else {
      const list = this.getOrientadores().map(u => u.id === userId ? (updatedUser as OrientadorUser) : u);
      this.save('orientadores', list);
    }

    this.notify();
    return updatedUser;
  }

  public updateUserProfile(userId: string, updates: { senha?: string; email?: string; foto?: string }): AppUser {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    const allUsers = this.getAllUsers();
    let updatedEmail = user.email;
    let updatedLogin = user.login;
    let updatedSenha = user.senha;
    let updatedFoto = user.foto;

    // 1. Atualizar e-mail (se fornecido)
    if (updates.email !== undefined) {
      const normalizedEmail = updates.email.trim().toLowerCase();
      if (!normalizedEmail) {
        throw new Error('O e-mail não pode ficar em branco.');
      }

      // Validar se outro usuário já usa este e-mail
      const emailJaExiste = allUsers.some(u =>
        u.id !== userId && (
          u.email.trim().toLowerCase() === normalizedEmail ||
          u.login.trim().toLowerCase() === normalizedEmail
        )
      );

      if (emailJaExiste) {
        throw new Error(`O e-mail "${updates.email}" já está sendo utilizado por outro usuário no sistema.`);
      }

      updatedEmail = updates.email.trim();
      updatedLogin = normalizedEmail;
    }

    // 2. Atualizar senha (se fornecida)
    if (updates.senha !== undefined) {
      const trimmedSenha = updates.senha.trim();
      if (!trimmedSenha) {
        throw new Error('A senha não pode ficar em branco.');
      }
      if (trimmedSenha.length < 3) {
        throw new Error('A senha deve conter no mínimo 3 caracteres.');
      }
      updatedSenha = trimmedSenha;
    }

    // 3. Atualizar foto (se fornecida)
    if (updates.foto !== undefined) {
      if (!updates.foto || updates.foto.trim() === '') {
        updatedFoto = SAD_AVATAR_DATA_URI;
      } else {
        updatedFoto = updates.foto.trim();
      }
    }

    const updatedUser: AppUser = {
      ...user,
      email: updatedEmail,
      login: updatedLogin,
      senha: updatedSenha,
      foto: updatedFoto
    };

    // Salvar na coleção correta
    if (user.role === 'admin') {
      const list = this.getAdmins().map(u => u.id === userId ? (updatedUser as AdminUser) : u);
      this.save('admins', list);
    } else if (user.role === 'profissional') {
      const list = this.getProfissionais().map(u => u.id === userId ? (updatedUser as ProfissionalUser) : u);
      this.save('profissionais', list);
    } else if (user.role === 'estagiario') {
      const list = this.getEstagiarios().map(u => u.id === userId ? (updatedUser as EstagiarioUser) : u);
      this.save('estagiarios', list);
    } else if (user.role === 'paciente') {
      const list = this.getPacientes().map(u => u.id === userId ? (updatedUser as PacienteUser) : u);
      this.save('pacientes', list);
    } else {
      const list = this.getOrientadores().map(u => u.id === userId ? (updatedUser as OrientadorUser) : u);
      this.save('orientadores', list);
    }

    // Notificar mudanças
    this.notify();

    return updatedUser;
  }

  public getProfissionaisPendentes(): ProfissionalUser[] {
    return this.getProfissionais().filter(p => p.aprovado === false);
  }

  public aprovarProfissional(id: string, aprovadorNome: string): boolean {
    const list = this.getProfissionais();
    const prof = list.find(p => p.id === id);
    if (!prof) return false;

    const updatedList = list.map(p => {
      if (p.id === id) {
        return {
          ...p,
          aprovado: true,
          aprovadoPor: aprovadorNome,
          aprovadoEm: new Date().toISOString()
        };
      }
      return p;
    });

    this.save('profissionais', updatedList);
    this.notify();
    return true;
  }

  public revogarProfissional(id: string): boolean {
    const list = this.getProfissionais();
    const prof = list.find(p => p.id === id);
    if (!prof) return false;

    const updatedList = list.map(p => {
      if (p.id === id) {
        return {
          ...p,
          aprovado: false,
          aprovadoPor: undefined,
          aprovadoEm: undefined
        };
      }
      return p;
    });

    this.save('profissionais', updatedList);
    this.notify();
    return true;
  }

  public deleteUser(id: string): void {
    const user = this.getUserById(id);
    if (!user) return;

    // Regra Crítica de Segurança: Usuários com papel Admin não podem ser excluídos
    if (user.role === 'admin' || id.startsWith('admin-') || user.login === 'admin' || user.email === 'admin@clinicaescola.edu.br') {
      throw new Error('O usuário Administrador não pode ser excluído do sistema por motivos de segurança e governança.');
    }

    if (id.startsWith('prof-')) {
      const list = this.getProfissionais();
      this.save('profissionais', list.filter(u => u.id !== id));
    } else if (id.startsWith('est-')) {
      const list = this.getEstagiarios();
      this.save('estagiarios', list.filter(u => u.id !== id));
    } else if (id.startsWith('pac-')) {
      const list = this.getPacientes();
      this.save('pacientes', list.filter(u => u.id !== id));
    } else if (id.startsWith('orient-')) {
      const list = this.getOrientadores();
      this.save('orientadores', list.filter(u => u.id !== id));
    } else {
      // fallback delete from non-admin collections
      this.save('profissionais', this.getProfissionais().filter(u => u.id !== id));
      this.save('estagiarios', this.getEstagiarios().filter(u => u.id !== id));
      this.save('pacientes', this.getPacientes().filter(u => u.id !== id));
      this.save('orientadores', this.getOrientadores().filter(u => u.id !== id));
    }

    this.notify();
  }

  // --- Recuperação de Senha por E-mail ---
  public solicitarRecuperacaoSenha(email: string): { user: AppUser; token: string; emailEnviado: boolean } {
    const normalizedEmail = email.trim().toLowerCase();
    const allUsers = this.getAllUsers();
    const user = allUsers.find(u => 
      u.email.trim().toLowerCase() === normalizedEmail || 
      u.login.trim().toLowerCase() === normalizedEmail
    );

    if (!user) {
      throw new Error(`Não encontramos nenhuma conta cadastrada com o e-mail ou usuário "${email}". Verifique a digitação ou cadastre-se.`);
    }

    const token = `token-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    const assunto = '🔐 Recuperação de Senha - SIACS • Faculdade Campos Salles';
    const mensagem = `Olá ${user.nome},\n\nRecebemos uma solicitação para redefinir a sua senha de acesso ao SIACS (Sistema Integrado de Agendamento Campos Salles).\n\nPara redefinir sua senha com segurança, acesse a plataforma e informe seu código de verificação: ${token.toUpperCase().slice(-6)}\n\nSe você não solicitou esta alteração, por favor ignore este e-mail.`;

    // Registra notificação no histórico
    const notifs = this.getNotificacoes();
    const notifItem: NotificacaoDisparo = {
      id: `notif-${Date.now().toString(36)}`,
      agendamentoId: 'recuperacao-senha',
      destinatarioTipo: user.role,
      destinatarioNome: user.nome,
      destinatarioEmail: user.email,
      destinatarioTelefone: user.telefone || '',
      tipo: 'lembrete_1_dia',
      assunto,
      conteudoHtml: `<div style="font-family: Arial, sans-serif; padding: 15px; color: #333;"><h2 style="color: #033B6C;">SIACS • Recuperação de Senha</h2><p>${mensagem.replace(/\n/g, '<br/>')}</p></div>`,
      conteudoTexto: mensagem,
      dataEnvio: new Date().toISOString(),
      canal: 'email',
      status: 'enviado',
      whatsappUrl: ''
    };
    this.save('notificacoes', [notifItem, ...notifs]);

    // Registra no log de disparos automáticos de e-mail
    this.addEmailLog({
      tipo: 'recuperacao_senha',
      destinatario: user.email,
      destinatarioNome: user.nome,
      assunto,
      corpoHtml: notifItem.conteudoHtml,
      corpoTexto: mensagem,
      status: 'enviado',
      detalhes: `Código de verificação enviado automaticamente para ${user.email} (${user.nome})`
    });

    return {
      user,
      token,
      emailEnviado: true
    };
  }

  public redefinirSenhaComEmail(email: string, novaSenha: string): AppUser {
    const normalizedEmail = email.trim().toLowerCase();
    const allUsers = this.getAllUsers();
    const user = allUsers.find(u => 
      u.email.trim().toLowerCase() === normalizedEmail || 
      u.login.trim().toLowerCase() === normalizedEmail
    );

    if (!user) {
      throw new Error('Usuário não encontrado para redefinição de senha.');
    }

    const trimmedSenha = novaSenha.trim();
    if (!trimmedSenha || trimmedSenha.length < 3) {
      throw new Error('A nova senha deve ter no mínimo 3 caracteres.');
    }

    return this.updateUserProfile(user.id, { senha: trimmedSenha });
  }

  // --- Horários Disponíveis do Profissional ---
  public getHorarios(): HorarioDisponivel[] {
    return this.load<HorarioDisponivel[]>('horarios', INITIAL_HORARIOS);
  }

  public addHorario(horario: Omit<HorarioDisponivel, 'id' | 'status'>): HorarioDisponivel {
    const list = this.getHorarios();
    const id = `hor-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
    const newHorario: HorarioDisponivel = {
      ...horario,
      id,
      status: 'disponivel'
    };
    this.save('horarios', [...list, newHorario]);
    return newHorario;
  }

  public addMultipleHorarios(horarios: Array<Omit<HorarioDisponivel, 'id' | 'status'>>): HorarioDisponivel[] {
    const list = this.getHorarios();
    const createdList: HorarioDisponivel[] = horarios.map(h => ({
      ...h,
      id: `hor-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      status: 'disponivel'
    }));
    this.save('horarios', [...list, ...createdList]);
    return createdList;
  }

  public deleteHorario(id: string): void {
    const list = this.getHorarios();
    this.save('horarios', list.filter(h => h.id !== id));
  }

  // --- Disponibilidade dos Estagiários ---
  public getDispEstagiarios(): DisponibilidadeEstagiario[] {
    return this.load<DisponibilidadeEstagiario[]>('disp_estagiarios', INITIAL_DISP_ESTAGIARIOS);
  }

  public addDispEstagiario(disp: Omit<DisponibilidadeEstagiario, 'id' | 'status'>): DisponibilidadeEstagiario {
    const list = this.getDispEstagiarios();
    const id = `disp-est-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
    const created: DisponibilidadeEstagiario = {
      ...disp,
      id,
      status: 'disponivel'
    };
    this.save('disp_estagiarios', [...list, created]);
    return created;
  }

  public addMultipleDispEstagiarios(disps: Array<Omit<DisponibilidadeEstagiario, 'id' | 'status'>>): DisponibilidadeEstagiario[] {
    const list = this.getDispEstagiarios();
    const createdList: DisponibilidadeEstagiario[] = disps.map(d => ({
      ...d,
      id: `disp-est-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      status: 'disponivel'
    }));
    this.save('disp_estagiarios', [...list, ...createdList]);
    return createdList;
  }

  public deleteDispEstagiario(id: string): void {
    const list = this.getDispEstagiarios();
    this.save('disp_estagiarios', list.filter(d => d.id !== id));
  }

  // --- Agendamentos ---
  public getAgendamentos(): Agendamento[] {
    return this.load<Agendamento[]>('agendamentos', INITIAL_AGENDAMENTOS);
  }

  public getAgendamentoById(id: string): Agendamento | undefined {
    return this.getAgendamentos().find(a => a.id === id);
  }

  /**
   * Cria um agendamento a partir da escolha do cliente.
   * Regras atendidas:
   * 1. Data e horário ficam INDISPONÍVEIS para novos agendamentos imediatamente;
   * 2. Tenta alocar automaticamente um estagiário disponível para o dia/horário;
   * 3. Dispara e-mail / WhatsApp para Paciente, Profissional, Estagiário e Orientador.
   */
  public criarAgendamento(params: {
    horarioId: string;
    paciente: PacienteUser;
    modalidade?: 'Presencial' | 'Online';
    motivoConsulta?: string;
    estagiarioIdEscolhido?: string;
  }): { agendamento: Agendamento; notificacoesCriadas: NotificacaoDisparo[] } {
    const horarios = this.getHorarios();
    const horarioIndex = horarios.findIndex(h => h.id === params.horarioId);

    if (horarioIndex === -1) {
      throw new Error('Horário não encontrado.');
    }

    const slot = horarios[horarioIndex];
    if (slot.status !== 'disponivel') {
      throw new Error('Este horário já foi reservado ou está indisponível.');
    }

    const profissionais = this.getProfissionais();
    const profissional = profissionais.find(p => p.id === slot.profissionalId);
    if (!profissional) {
      throw new Error('Profissional associado não encontrado.');
    }

    // O estagiário NÃO é alocado automaticamente na escolha do paciente.
    // Apenas Profissionais, Orientadores e Administradores podem atribuir estagiários.
    const estagiarios = this.getEstagiarios();
    let estagiario: EstagiarioUser | undefined = undefined;
    if (params.estagiarioIdEscolhido) {
      estagiario = estagiarios.find(e => e.id === params.estagiarioIdEscolhido);
    }

    // Orientador geral
    const orientadores = this.getOrientadores();
    const orientador = orientadores[0];

    const agendamentoId = `agend-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
    const horarioFormatado = `${slot.horaInicio} - ${slot.horaFim}`;

    // Verificar se é primeira consulta
    const agendamentosAnteriores = this.getAgendamentos().filter(
      a => a.pacienteId === params.paciente.id && a.status === 'concluido'
    );
    const tipoConsulta = agendamentosAnteriores.length === 0 ? 'Primeira Consulta (Anamnese)' : 'Acompanhamento / Sessão';

    const novoAgendamento: Agendamento = {
      id: agendamentoId,
      horarioId: slot.id,
      pacienteId: params.paciente.id,
      pacienteNome: params.paciente.nome,
      pacienteTelefone: params.paciente.telefone,
      pacienteEmail: params.paciente.email,
      profissionalId: profissional.id,
      profissionalNome: profissional.nome,
      profissionalEspecialidade: profissional.especialidade,
      profissionalTelefone: profissional.telefone,
      profissionalEmail: profissional.email,
      estagiarioId: estagiario?.id,
      estagiarioNome: estagiario?.nome,
      estagiarioTelefone: estagiario?.telefone,
      estagiarioEmail: estagiario?.email,
      orientadorId: orientador?.id,
      orientadorNome: orientador?.nome,
      orientadorEmail: orientador?.email,
      data: slot.data,
      horario: horarioFormatado,
      modalidade: params.modalidade || 'Presencial',
      sala: 'Consultório 02 - Clínica Escola',
      tipoConsulta,
      status: 'agendado',
      confirmadoPeloPaciente: false,
      lembreteEnviado: false,
      criadoEm: new Date().toISOString(),
      motivoConsulta: params.motivoConsulta || 'Atendimento em saúde mental / psicoterapia',
      possuiAnamnese: false,
      possuiAvaliacao: false
    };

    // 1. Atualizar status do horário para agendado (indisponível para outros)
    horarios[horarioIndex] = {
      ...slot,
      status: 'agendado',
      agendamentoId
    };
    this.save('horarios', horarios);

    // 2. Salvar o agendamento
    const agendamentos = this.getAgendamentos();
    this.save('agendamentos', [novoAgendamento, ...agendamentos]);

    // 3. Disparo imediato de e-mails e links de WhatsApp para todos os envolvidos
    const notificacoesCriadas = this.gerarNotificacoesAgendamento(novoAgendamento, profissional, params.paciente, estagiario, orientador);

    return {
      agendamento: novoAgendamento,
      notificacoesCriadas
    };
  }

  public getAgendamentosPorProfissional(profissionalId: string): Agendamento[] {
    return this.getAgendamentos().filter(a => a.profissionalId === profissionalId);
  }

  public atribuirEstagiarioAoAgendamento(
    agendamentoId: string,
    estagiarioId: string | null,
    estagiarioNomeCustom?: string
  ): Agendamento {
    const agendamentos = this.getAgendamentos();
    const index = agendamentos.findIndex(a => a.id === agendamentoId);
    if (index === -1) {
      throw new Error('Agendamento não encontrado.');
    }

    let estagiario: EstagiarioUser | undefined;
    if (estagiarioId && estagiarioId.trim() !== '') {
      estagiario = this.getEstagiarios().find(e => e.id === estagiarioId);
    }

    const updated: Agendamento = {
      ...agendamentos[index],
      estagiarioId: estagiario?.id || (estagiarioId ? estagiarioId : undefined),
      estagiarioNome: estagiarioNomeCustom || estagiario?.nome || undefined,
      estagiarioTelefone: estagiario?.telefone || undefined,
      estagiarioEmail: estagiario?.email || undefined
    };

    agendamentos[index] = updated;
    this.save('agendamentos', agendamentos);
    this.notify();
    return updated;
  }

  private gerarNotificacoesAgendamento(
    agendamento: Agendamento,
    profissional: ProfissionalUser,
    paciente: PacienteUser,
    estagiario?: EstagiarioUser,
    orientador?: OrientadorUser
  ): NotificacaoDisparo[] {
    const list: NotificacaoDisparo[] = [];
    const agora = new Date().toISOString();

    const dataFormatadaPtBr = new Date(agendamento.data + 'T12:00:00Z').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const foneLimpoPaciente = paciente.telefone.replace(/\D/g, '');
    const foneWhatsappPaciente = foneLimpoPaciente.startsWith('55') ? foneLimpoPaciente : `55${foneLimpoPaciente}`;

    // 1. Notificação para o Paciente
    const msgZapPaciente = `Olá ${paciente.nome}! 🩺 Sua consulta na *CLÍNICA ESCOLA* foi agendada com sucesso para *${dataFormatadaPtBr} às ${agendamento.horario}* com ${profissional.nome}. Local: ${agendamento.sala}. Dúvidas ou confirmações responda aqui.`;
    const notifPaciente: NotificacaoDisparo = {
      id: `notif-${Date.now().toString(36)}-1`,
      agendamentoId: agendamento.id,
      destinatarioTipo: 'paciente',
      destinatarioNome: paciente.nome,
      destinatarioEmail: paciente.email,
      destinatarioTelefone: paciente.telefone,
      tipo: 'agendamento_criado',
      assunto: `✅ Consulta Confirmada: ${dataFormatadaPtBr} às ${agendamento.horario} - Clínica Escola`,
      conteudoHtml: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #0d9488;">Clínica Escola - Agendamento Confirmado</h2>
          <p>Olá <strong>${paciente.nome}</strong>,</p>
          <p>Seu agendamento foi realizado com sucesso em nosso sistema de atendimento supervisionado.</p>
          <div style="background: #f0fdfa; border-left: 4px solid #0d9488; padding: 12px 16px; margin: 16px 0;">
            <p style="margin: 4px 0;">📅 <strong>Data:</strong> ${dataFormatadaPtBr}</p>
            <p style="margin: 4px 0;">⏰ <strong>Horário:</strong> ${agendamento.horario}</p>
            <p style="margin: 4px 0;">👩‍⚕️ <strong>Profissional Responsável:</strong> ${profissional.nome} (${profissional.especialidade})</p>
            ${estagiario ? `<p style="margin: 4px 0;">🎓 <strong>Estagiário Integrante:</strong> ${estagiario.nome} (${estagiario.turma})</p>` : ''}
            <p style="margin: 4px 0;">📍 <strong>Modalidade/Local:</strong> ${agendamento.modalidade} - ${agendamento.sala}</p>
          </div>
          <p><em>Um dia antes da consulta, você receberá um e-mail e uma mensagem de WhatsApp solicitando sua confirmação.</em></p>
        </div>
      `,
      conteudoTexto: `Consulta confirmada na Clínica Escola para ${dataFormatadaPtBr} às ${agendamento.horario} com ${profissional.nome}.`,
      dataEnvio: agora,
      canal: 'ambos',
      status: 'enviado',
      whatsappUrl: `https://api.whatsapp.com/send?phone=${foneWhatsappPaciente}&text=${encodeURIComponent(msgZapPaciente)}`
    };
    list.push(notifPaciente);

    // 2. Notificação para o Profissional
    const notifProfissional: NotificacaoDisparo = {
      id: `notif-${Date.now().toString(36)}-2`,
      agendamentoId: agendamento.id,
      destinatarioTipo: 'profissional',
      destinatarioNome: profissional.nome,
      destinatarioEmail: profissional.email,
      destinatarioTelefone: profissional.telefone,
      tipo: 'agendamento_criado',
      assunto: `📅 Novo Agendamento: ${paciente.nome} (${dataFormatadaPtBr} às ${agendamento.horario})`,
      conteudoHtml: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #0284c7;">Novo Paciente Agendado - Clínica Escola</h2>
          <p>Prezado(a) <strong>${profissional.nome}</strong>,</p>
          <p>O paciente <strong>${paciente.nome}</strong> agendou uma sessão no seu horário disponibilizado.</p>
          <ul>
            <li><strong>Data/Horário:</strong> ${dataFormatadaPtBr} às ${agendamento.horario}</li>
            <li><strong>Telefone Paciente:</strong> ${paciente.telefone}</li>
            <li><strong>Tipo de Atendimento:</strong> ${agendamento.tipoConsulta}</li>
            ${estagiario ? `<li><strong>Estagiário Escalado:</strong> ${estagiario.nome}</li>` : ''}
          </ul>
        </div>
      `,
      conteudoTexto: `Novo paciente agendado: ${paciente.nome} para ${dataFormatadaPtBr} às ${agendamento.horario}.`,
      dataEnvio: agora,
      canal: 'email',
      status: 'enviado',
      whatsappUrl: ''
    };
    list.push(notifProfissional);

    // 3. Notificação para o Estagiário
    if (estagiario) {
      const foneEst = estagiario.telefone.replace(/\D/g, '');
      const foneZapEst = foneEst.startsWith('55') ? foneEst : `55${foneEst}`;
      const msgZapEst = `Olá ${estagiario.nome}! Você foi escalado para acompanhar a consulta do paciente *${paciente.nome}* com ${profissional.nome} em *${dataFormatadaPtBr} às ${agendamento.horario}* na Clínica Escola.`;

      const notifEst: NotificacaoDisparo = {
        id: `notif-${Date.now().toString(36)}-3`,
        agendamentoId: agendamento.id,
        destinatarioTipo: 'estagiario',
        destinatarioNome: estagiario.nome,
        destinatarioEmail: estagiario.email,
        destinatarioTelefone: estagiario.telefone,
        tipo: 'agendamento_criado',
        assunto: `🎓 Escala de Atendimento: Paciente ${paciente.nome} (${agendamento.horario})`,
        conteudoHtml: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #7c3aed;">Escala de Estágio - Clínica Escola</h2>
            <p>Olá <strong>${estagiario.nome}</strong>,</p>
            <p>Você foi alocado para o acompanhamento clínico sob supervisão:</p>
            <ul>
              <li><strong>Paciente:</strong> ${paciente.nome}</li>
              <li><strong>Profissional Supervisor:</strong> ${profissional.nome}</li>
              <li><strong>Data e Hora:</strong> ${dataFormatadaPtBr} às ${agendamento.horario}</li>
              <li><strong>Local:</strong> ${agendamento.sala}</li>
            </ul>
          </div>
        `,
        conteudoTexto: `Você foi escalado para acompanhar a consulta de ${paciente.nome} em ${dataFormatadaPtBr} às ${agendamento.horario}.`,
        dataEnvio: agora,
        canal: 'ambos',
        status: 'enviado',
        whatsappUrl: `https://api.whatsapp.com/send?phone=${foneZapEst}&text=${encodeURIComponent(msgZapEst)}`
      };
      list.push(notifEst);
    }

    // 4. Notificação para o Orientador de Estágio
    if (orientador) {
      const notifOrient: NotificacaoDisparo = {
        id: `notif-${Date.now().toString(36)}-4`,
        agendamentoId: agendamento.id,
        destinatarioTipo: 'orientador',
        destinatarioNome: orientador.nome,
        destinatarioEmail: orientador.email,
        destinatarioTelefone: orientador.telefone,
        tipo: 'agendamento_criado',
        assunto: `📋 Registro de Atendimento: ${profissional.nome} e ${estagiario?.nome || 'Estagiário'}`,
        conteudoHtml: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #4b5563;">Supervisão Geral de Estágios - Novo Agendamento</h2>
            <p>Prof(a). <strong>${orientador.nome}</strong>,</p>
            <p>Novo atendimento registrado no sistema da Clínica Escola:</p>
            <ul>
              <li><strong>Dupla Clínica:</strong> ${profissional.nome} / ${estagiario?.nome || 'Sem estagiário'}</li>
              <li><strong>Paciente:</strong> ${paciente.nome}</li>
              <li><strong>Data:</strong> ${dataFormatadaPtBr} às ${agendamento.horario}</li>
            </ul>
          </div>
        `,
        conteudoTexto: `Novo atendimento supervisionado registrado: ${paciente.nome} com ${profissional.nome}.`,
        dataEnvio: agora,
        canal: 'email',
        status: 'enviado',
        whatsappUrl: ''
      };
      list.push(notifOrient);
    }

    // Salvar no histórico de notificações
    const notifs = this.getNotificacoes();
    this.save('notificacoes', [...list, ...notifs]);

    // Registra disparo automático de confirmação para o paciente
    this.addEmailLog({
      tipo: 'confirmacao_agendamento',
      destinatario: paciente.email,
      destinatarioNome: paciente.nome,
      assunto: notifPaciente.assunto,
      corpoHtml: notifPaciente.conteudoHtml,
      corpoTexto: notifPaciente.conteudoTexto,
      status: 'enviado',
      detalhes: `Confirmação de agendamento disparada automaticamente para ${paciente.email} (Consulta em ${dataFormatadaPtBr} às ${agendamento.horario})`
    });

    return list;
  }

  /**
   * Disparo de lembrete 1 dia antes da consulta (ou sob demanda para teste)
   * Dispara e-mail e gera link direto de WhatsApp solicitando confirmação do paciente.
   */
  public dispararLembrete1DiaAntes(agendamentoId: string): NotificacaoDisparo {
    const agendamentos = this.getAgendamentos();
    const index = agendamentos.findIndex(a => a.id === agendamentoId);
    if (index === -1) throw new Error('Agendamento não encontrado.');

    const agendamento = agendamentos[index];
    const dataFormatadaPtBr = new Date(agendamento.data + 'T12:00:00Z').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const foneLimpo = agendamento.pacienteTelefone.replace(/\D/g, '');
    const foneZap = foneLimpo.startsWith('55') ? foneLimpo : `55${foneLimpo}`;
    const textoZap = `🔔 *Lembrete Clínica Escola*: Olá ${agendamento.pacienteNome}, sua consulta está marcada para *amanhã (${dataFormatadaPtBr}) às ${agendamento.horario}* com ${agendamento.profissionalNome}. Por favor, confirme sua presença respondendo *SIM* ou clicando no portal.`;

    const notificacao: NotificacaoDisparo = {
      id: `notif-remind-${Date.now().toString(36)}`,
      agendamentoId: agendamento.id,
      destinatarioTipo: 'paciente',
      destinatarioNome: agendamento.pacienteNome,
      destinatarioEmail: agendamento.pacienteEmail,
      destinatarioTelefone: agendamento.pacienteTelefone,
      tipo: 'lembrete_1_dia',
      assunto: `🔔 Lembrete de Consulta (Amanhã) - Confirmação Clínica Escola`,
      conteudoHtml: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #eab308;">Lembrete de Consulta para Amanhã</h2>
          <p>Olá <strong>${agendamento.pacienteNome}</strong>,</p>
          <p>Lembramos que sua consulta na Clínica Escola está agendada para:</p>
          <p><strong>📅 Data:</strong> ${dataFormatadaPtBr}<br><strong>⏰ Horário:</strong> ${agendamento.horario}<br><strong>👩‍⚕️ Profissional:</strong> ${agendamento.profissionalNome}</p>
          <p>Por favor, confirme seu comparecimento pelo portal ou via WhatsApp.</p>
        </div>
      `,
      conteudoTexto: textoZap,
      dataEnvio: new Date().toISOString(),
      canal: 'ambos',
      status: 'enviado',
      whatsappUrl: `https://api.whatsapp.com/send?phone=${foneZap}&text=${encodeURIComponent(textoZap)}`
    };

    agendamentos[index] = {
      ...agendamento,
      lembreteEnviado: true
    };
    this.save('agendamentos', agendamentos);

    const notifs = this.getNotificacoes();
    this.save('notificacoes', [notificacao, ...notifs]);

    return notificacao;
  }

  public confirmarPresencaPaciente(agendamentoId: string): void {
    const agendamentos = this.getAgendamentos();
    const index = agendamentos.findIndex(a => a.id === agendamentoId);
    if (index !== -1) {
      agendamentos[index] = {
        ...agendamentos[index],
        confirmadoPeloPaciente: true,
        status: 'confirmado'
      };
      this.save('agendamentos', agendamentos);
    }
  }

  public atualizarStatusAgendamento(agendamentoId: string, status: Agendamento['status']): void {
    const agendamentos = this.getAgendamentos();
    const index = agendamentos.findIndex(a => a.id === agendamentoId);
    if (index !== -1) {
      agendamentos[index] = {
        ...agendamentos[index],
        status
      };
      this.save('agendamentos', agendamentos);
    }
  }

  public cancelarAgendamento(agendamentoId: string): void {
    const agendamentos = this.getAgendamentos();
    const agendamento = agendamentos.find(a => a.id === agendamentoId);
    if (agendamento) {
      // Liberar o horário
      const horarios = this.getHorarios();
      const hIndex = horarios.findIndex(h => h.id === agendamento.horarioId);
      if (hIndex !== -1) {
        horarios[hIndex] = {
          ...horarios[hIndex],
          status: 'disponivel',
          agendamentoId: undefined
        };
        this.save('horarios', horarios);
      }

      this.atualizarStatusAgendamento(agendamentoId, 'cancelado');
    }
  }

  // --- Prontuário Único por Paciente com Ano ---
  public gerarNumeroProntuarioUnico(pacienteId?: string): string {
    const anoAtual = new Date().getFullYear();

    if (pacienteId) {
      const pacientes = this.getPacientes();
      const paciente = pacientes.find(p => p.id === pacienteId);
      if (paciente?.numeroProntuario && paciente.numeroProntuario.trim() !== '') {
        return paciente.numeroProntuario;
      }

      const anamPsi = this.getAnamnesesPsicologia().find(a => a.pacienteId === pacienteId);
      if (anamPsi?.numeroProntuario && anamPsi.numeroProntuario.trim() !== '') {
        this.vincularNumeroProntuarioAoPaciente(pacienteId, anamPsi.numeroProntuario);
        return anamPsi.numeroProntuario;
      }

      const anam = this.getAnamneses().find(a => a.pacienteId === pacienteId);
      if (anam?.numeroProntuario && anam.numeroProntuario.trim() !== '') {
        this.vincularNumeroProntuarioAoPaciente(pacienteId, anam.numeroProntuario);
        return anam.numeroProntuario;
      }

      const acomp = this.getAcompanhamentos().find(a => a.pacienteId === pacienteId);
      if (acomp?.numeroProntuario && acomp.numeroProntuario.trim() !== '') {
        this.vincularNumeroProntuarioAoPaciente(pacienteId, acomp.numeroProntuario);
        return acomp.numeroProntuario;
      }
    }

    // Calcula o próximo sequencial único baseado em todos os pacientes cadastrados
    const pacientes = this.getPacientes();
    let maxSeq = 0;
    const regex = new RegExp(`PSI-${anoAtual}\\/(\\d+)`);

    pacientes.forEach(p => {
      if (p.numeroProntuario) {
        const match = p.numeroProntuario.match(regex);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.getAnamnesesPsicologia().forEach(a => {
      if (a.numeroProntuario) {
        const match = a.numeroProntuario.match(regex);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.getAnamneses().forEach(a => {
      if (a.numeroProntuario) {
        const match = a.numeroProntuario.match(regex);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    this.getAcompanhamentos().forEach(a => {
      if (a.numeroProntuario) {
        const match = a.numeroProntuario.match(regex);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    const nextSeq = maxSeq + 1;
    const sequencialStr = String(nextSeq).padStart(4, '0');
    const novoNumero = `PSI-${anoAtual}/${sequencialStr}`;

    if (pacienteId) {
      this.vincularNumeroProntuarioAoPaciente(pacienteId, novoNumero);
    }

    return novoNumero;
  }

  public vincularNumeroProntuarioAoPaciente(pacienteId: string, numeroProntuario: string): void {
    const pacientes = this.getPacientes();
    const index = pacientes.findIndex(p => p.id === pacienteId);
    if (index !== -1 && pacientes[index].numeroProntuario !== numeroProntuario) {
      pacientes[index] = {
        ...pacientes[index],
        numeroProntuario
      };
      this.save('pacientes', pacientes);
    }
  }

  public getNumeroProntuarioPaciente(pacienteId?: string): string {
    return this.gerarNumeroProntuarioUnico(pacienteId);
  }

  // --- Anamneses ---
  public getAnamneses(): Anamnese[] {
    return this.load<Anamnese[]>('anamneses', INITIAL_ANAMNESES);
  }

  public getAnamneseByPacienteId(pacienteId: string): Anamnese | undefined {
    return this.getAnamneses().find(a => a.pacienteId === pacienteId);
  }

  public salvarAnamnese(anamnese: Omit<Anamnese, 'id' | 'dataRegistro'>): Anamnese {
    const list = this.getAnamneses();
    const existingIndex = list.findIndex(a => a.pacienteId === anamnese.pacienteId);
    const dataRegistro = new Date().toISOString().split('T')[0];

    const numProntuario = anamnese.numeroProntuario || this.gerarNumeroProntuarioUnico(anamnese.pacienteId);
    if (anamnese.pacienteId) {
      this.vincularNumeroProntuarioAoPaciente(anamnese.pacienteId, numProntuario);
    }

    let saved: Anamnese;
    if (existingIndex >= 0) {
      saved = {
        ...list[existingIndex],
        ...anamnese,
        numeroProntuario: numProntuario,
        dataRegistro
      };
      list[existingIndex] = saved;
    } else {
      saved = {
        ...anamnese,
        id: `anam-${Date.now().toString(36)}`,
        numeroProntuario: numProntuario,
        dataRegistro
      };
      list.unshift(saved);
    }

    this.save('anamneses', list);

    // Marcar nos agendamentos do paciente que anamnese existe
    const agendamentos = this.getAgendamentos();
    const updatedAgendamentos = agendamentos.map(a => {
      if (a.pacienteId === anamnese.pacienteId) {
        return { ...a, possuiAnamnese: true };
      }
      return a;
    });
    this.save('agendamentos', updatedAgendamentos);

    return saved;
  }

  // --- Anamnese Completa de Psicologia (Formulário Imprimível & Digital) ---
  public getAnamnesesPsicologia(): AnamnesePsicologiaCompleta[] {
    return this.load<AnamnesePsicologiaCompleta[]>('anamneses_psicologia_completa', [
      {
        id: 'anam-psi-1',
        pacienteId: 'pac-1',
        pacienteNome: 'Ana Clara Souza',
        numeroProntuario: 'PSI-2026/0001',
        dataAvaliacao: '2026-08-15',
        dataNascimento: '1995-04-12',
        idade: '29',
        genero: 'Feminino',
        estadoCivil: 'Solteira',
        raca: 'Branca',
        profissao: 'Designer Gráfica / Freelancer',
        atividadeTrabalho: 'Criação de identidades visuais, marcas e projetos gráficos em home-office.',
        escolaridade: 'Superior Completo',
        naturalidade: 'São Paulo - SP',
        religiao: 'Não praticante',
        endereco: 'Rua das Acácias, 240, Apto 42 - São Paulo/SP',
        telefone: '(11) 98111-2233',
        email: 'anaclara.souza@gmail.com',
        contatoEmergenciaNome: 'Helena Souza (Mãe)',
        contatoEmergenciaTelefone: '(11) 98111-2233',
        contatoPessoaConfianca: 'Helena Souza (Mãe) - Tel: (11) 98111-2233',
        responsavelLegal: 'A própria',
        modalidadeAtendimento: 'Presencial',
        profissionalResponsavel: 'Dra. Camila Andrade',
        crpProfissional: '06/142980',
        estagiarioNome: 'Lucas Silveira',
        raEstagiario: 'PSI-2024.1',
        turmaEstagiario: '9º Semestre - Psicologia Clínica',
        orientadorNome: 'Profa. Dra. Helena Matos',
        crpOrientador: '06/054321',
        queixaPrincipal: 'Crises frequentes de ansiedade com taquicardia, sensação de sufocamento e medo excessivo de julgamento no ambiente profissional.',
        queixaInicial: 'Crises frequentes de ansiedade, aperto no peito e medo de não dar conta dos prazos profissionais.',
        elementosComplementares: 'Episódios de insônia inicial, sudorese palmar e sensação de sufocamento antes de reuniões com clientes.',
        tempoEvolucao: 'Aproximadamente 8 meses, com piora nos últimos 60 dias.',
        encaminhamentoOrigem: 'Encaminhamento espontâneo por indicação de colega da faculdade.',
        historicoQueixaAtual: 'Relata início dos episódios após transição para trabalho autônomo com alta sobrecarga de prazos. As crises ocorrem principalmente antes de reuniões com clientes ou apresentações de projetos. Apresenta sudorese, aperto no peito e pensamentos catastróficos recorrentes de insuficiência.',
        fatoresDesencadeantes: 'Sobrecarga de trabalho, prazos curtos, reuniões avaliativas e isolamento na rotina home office.',
        impactoRotinaRelacoes: 'Prejuízo na produtividade profissional, esquiva de eventos sociais e tensão no relacionamento interpessoal.',
        tratamentosPsicologicosAnteriores: 'Realizou psicoterapia breve durante a graduação (2018), com melhora temporária.',
        caracteristicasFisicoBiologicas: 'Família materna com compleição física média, predisposição a quadros ansiosos e postura perfeccionista.',
        caracteristicasFisicoBiologicasPersonalidade: 'Desenvolveu padrão de autocobrança elevado e atenção minuciosa aos detalhes.',
        historicoDoencasFamiliares: 'Mãe tratou depressão na juventude; tia materna com histórico de pânico; avô paterno hipertenso.',
        historicoDoencasFamiliaresPersonalidade: 'Familiaridade com o tema da saúde mental, porém com receio de vivenciar perdas de controle emocional.',
        composicaoFamiliar: 'Mora sozinha. Pais residem na mesma cidade, mantém contato semanal.',
        relacionamentoFamiliar: 'Relação próxima e afetuosa com a mãe; relação mais distante e formal com o pai.',
        historicoFamiliarPsiquiatrico: 'Mãe com histórico de Transtorno Depressivo Maior tratado; tia materna com Transtorno de Pânico.',
        gestacaoNascimento: 'Gestação planejada, parto cesárea a termo sem intercorrências neonatais.',
        gestacaoNascimentoMediadores: 'Mãe e pai presentes; suporte próximo da avó materna.',
        gestacaoNascimentoPersonalidade: 'Ambiente inicial seguro e receptivo ao desenvolvimento.',
        comunicacaoEmocional: 'Atendida com prontidão em suas necessidades de afeto e consolo.',
        comunicacaoEmocionalMediadores: 'Mãe como mediadora central do vínculo afetivo.',
        comunicacaoEmocionalPersonalidade: 'Boa capacidade empática e facilidade para expressar emoções verbalmente.',
        atividadeObjetalManipulatoria: 'Exploração ativa do ambiente; grande interesse por desenhos, cores e blocos de montar.',
        atividadeObjetalManipulatoriaMediadores: 'Brinquedos educativos e materiais gráficos disponibilizados pelos pais.',
        atividadeObjetalManipulatoriaPersonalidade: 'Desenvolveu criatividade e apurado senso estético.',
        desenvolvimentoLinguagem: 'Início da fala por volta dos 12 meses; vocabulário rico e boa articulação.',
        desenvolvimentoLinguagemMediadores: 'Leitura diária de histórias infantis pela mãe.',
        desenvolvimentoLinguagemPersonalidade: 'Habilidade comunicativa e capacidade de introspecção.',
        jogoPapeisBrincar: 'Brincava de escolinha, faz-de-conta e teatro; frequentemente assumia papel organizador.',
        jogoPapeisBrincarMediadores: 'Primos e colegas de vizinhança.',
        jogoPapeisBrincarPersonalidade: 'Desenvolveu liderança, senso de responsabilidade e cooperação.',
        relacoesFamiliaresVida: 'Vínculo estreito com figuras femininas da família; respeito às regras familiares.',
        relacoesFamiliaresMediadores: 'Família nuclear e encontros com parentes aos fins de semana.',
        relacoesFamiliaresPersonalidade: 'Construção de forte senso moral e busca de reconhecimento.',
        socializacao: 'Sociável, com facilidade para estabelecer amizades duradouras.',
        socializacaoMediadores: 'Ambiente escolar e oficinas culturais.',
        socializacaoPersonalidade: 'Valorização de vínculos pautados na lealdade e confiabilidade.',
        atividadeEstudo: 'Trajetória escolar com excelência e dedicação rigorosa aos estudos.',
        atividadeEstudoMediadores: 'Professores incentivadores e apoio familiar.',
        atividadeEstudoPersonalidade: 'Disciplina, rigor metodológico e curiosidade intelectual.',
        relacoesAfetivasVida: 'Relacionamentos amorosos pautados no respeito mútuo e diálogo.',
        relacoesAfetivasMediadores: 'Pares afetivos e reflexão compartilhada.',
        relacoesAfetivasPersonalidade: 'Busca de equilíbrio entre autonomia e intimidade.',
        sexualidade: 'Vivência sexual esclarecida, sem tabus ou experiências traumáticas.',
        sexualidadeMediadores: 'Diálogo com pares e acesso à informação.',
        sexualidadePersonalidade: 'Sexualidade integrada à identidade pessoal com maturidade.',
        insercaoTrabalho: 'Escolha consciente pelo Design Gráfico; trabalho como realização e identidade.',
        insercaoTrabalhoMediadores: 'Mercado de trabalho, clientes e comunidade profissional.',
        insercaoTrabalhoPersonalidade: 'Ética profissional apurada, com vulnerabilidade a sobrecarga de responsabilidade.',
        cenarioPessoasSignificativas: 'Mãe (Helena) e três amigas de graduação.',
        cenarioPessoasSignificativasPersonalidade: 'Rede de suporte afetivo e acolhimento nos momentos de tensão.',
        cenarioAtividadesPresentes: 'Projetos freelance, pilates, leitura e caminhadas ao ar livre.',
        cenarioAtividadesPresentesPersonalidade: 'Espaços de regulação e descompressão da rotina.',
        cenarioContextosCirculacao: 'Home-office, estúdios de arte e centros culturais.',
        cenarioContextosCirculacaoPersonalidade: 'Estímulo ao repertório estético e criativo.',
        nivelDesenvolvimentoPresente: 'Nível adulto maduro com funções psicológicas superiores consolidadas e autonomia de conduta.',
        caracteristicasDesenvolvimentoPresente: 'Elevada capacidade de autorreflexão, funções executivas intactas, com labilidade ansiosa situacional.',
        possibilidadesDesenvolvimento: 'Excelente prognóstico para ressignificação de crenças de insuficiência e aquisição de estratégias de regulação emocional.',
        condicoesMedicasGerais: 'Sem comorbidades clínicas conhecidas. Exames cardiológicos recentes sem alterações.',
        medicamentosUsoContinuo: 'Nenhum medicamento contínuo.',
        psicofarmacosPosologia: 'Avaliada por psiquiatra recentemente, em uso de Escitalopram 10mg/dia há 3 semanas.',
        padraoSonoAlimentacao: 'Insônia inicial (dificuldade para adormecer devido a ruminações). Apetite preservado.',
        usoSubstancias: 'Nega tabagismo e drogas ilícitas. Consumo social e esporádico de álcool (1 a 2 taças de vinho ao mês).',
        relacoesAfetivas: 'Solteira há 1 ano após término amigável. Não relata conflitos afetivos agudos no momento.',
        redeApoioSocial: 'Conta com 3 amigas próximas e a mãe como rede de apoio consistente.',
        rotinaTrabalhoEstudo: 'Trabalho autônomo em home-office (8h a 10h diárias), pausas irregulares.',
        atividadesLazer: 'Prática de pilates 2x por semana, leitura e caminhadas aos finais de semana.',
        aparenciaAtitude: 'Apresenta-se bem cuidada, vestimenta adequada à ocasião, colaborativa, atitude receptiva e comunicativa.',
        conscienciaOrientacao: 'Lúcida, vigil, orientada autopsiquicamente e alopsiquicamente no tempo e no espaço.',
        atencaoMemoria: 'Atenção voluntária preservada, memória episódica e semântica intactas.',
        pensamentoLinguagem: 'Pensamento com curso acelerado em momentos de ansiedade, conteúdo voltado a preocupações futuras (ruminação antecipatória). Linguagem clara, coerente e com boa prosódia.',
        humorAfeto: 'Humor ansioso, afeto modulado e congruente com o relato verbal.',
        sensopercepcao: 'Sem alterações sensoperceptivas (sem alucinações ou ilusões).',
        juizoCriticoInsight: 'Juízo de realidade preservado, bom insight sobre a natureza psicológica de seus sintomas.',
        psicomotricidade: 'Leve inquietação motora nas mãos durante o relato das crises, sem agitação psicomotora.',
        compreensaoDiagnostica: 'Quadro clínico compatível com Transtorno de Ansiedade Generalizada (TAG) com episódios de ataques de pânico situacionais. Mantém recursos egóicos preservados e excelente motivação para o processo psicoterápico.',
        enquadreTeorico: 'Terapia Cognitivo-Comportamental (TCC) / Foco em reestruturação cognitiva, regulação emocional e manejo da ansiedade.',
        hipoteseDiagnosticaCid: 'F41.1 (Transtorno de Ansiedade Generalizada) / F41.0 (Transtorno de Pânico)',
        objetivosTerapeuticos: '1. Psicoeducação sobre o ciclo da ansiedade; 2. Treinamento em respiração diafragmática e relaxamento muscular progressivo; 3. Identificação e reestruturação de pensamentos automáticos disfuncionais; 4. Exposição gradual às situações de avaliação social.',
        frequenciaSessoes: '1 sessão semanal de 50 minutos (Presencial).',
        encaminhamentos: 'Manutenção do acompanhamento psiquiátrico conjunto para monitoramento farmacológico.',
        observacoesGerais: 'Paciente assinou o Termo de Consentimento Livre e Esclarecido (TCLE) da Clínica Escola e autorizou a supervisão acadêmica.',
        criadoEm: '2026-08-15T14:30:00Z'
      }
    ]);
  }

  public getAnamnesePsicologiaByPacienteId(pacienteId: string): AnamnesePsicologiaCompleta | undefined {
    return this.getAnamnesesPsicologia().find(a => a.pacienteId === pacienteId);
  }

  public getAnamnesePsicologiaById(id: string): AnamnesePsicologiaCompleta | undefined {
    return this.getAnamnesesPsicologia().find(a => a.id === id);
  }

  public salvarAnamnesePsicologia(data: Omit<AnamnesePsicologiaCompleta, 'id' | 'criadoEm'> & { id?: string }): AnamnesePsicologiaCompleta {
    const list = this.getAnamnesesPsicologia();
    const existingIndex = data.id 
      ? list.findIndex(a => a.id === data.id)
      : (data.pacienteId ? list.findIndex(a => a.pacienteId === data.pacienteId) : -1);

    const agora = new Date().toISOString();
    const numProntuario = data.numeroProntuario || (data.pacienteId ? this.gerarNumeroProntuarioUnico(data.pacienteId) : this.gerarNumeroProntuarioUnico());

    if (data.pacienteId) {
      this.vincularNumeroProntuarioAoPaciente(data.pacienteId, numProntuario);
    }

    let saved: AnamnesePsicologiaCompleta;

    if (existingIndex >= 0) {
      saved = {
        ...list[existingIndex],
        ...data,
        numeroProntuario: numProntuario,
        id: list[existingIndex].id,
        atualizadoEm: agora
      };
      list[existingIndex] = saved;
    } else {
      const id = data.id || `anam-psi-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
      saved = {
        ...data,
        numeroProntuario: numProntuario,
        id,
        criadoEm: agora
      };
      list.unshift(saved);
    }

    this.save('anamneses_psicologia_completa', list);

    // Também sincroniza com a coleção resumida de anamneses se tiver pacienteId
    if (data.pacienteId) {
      this.salvarAnamnese({
        pacienteId: data.pacienteId,
        pacienteNome: data.pacienteNome,
        numeroProntuario: numProntuario,
        idade: data.idade || '',
        profissao: data.profissao || '',
        estadoCivil: data.estadoCivil || 'Solteiro(a)',
        principaisQueixas: data.queixaPrincipal || '',
        observacoes: data.compreensaoDiagnostica || data.observacoesGerais || '',
        historicoFamiliar: data.historicoFamiliarPsiquiatrico || '',
        medicamentosEmUso: data.medicamentosUsoContinuo || data.psicofarmacosPosologia || '',
        expectativasTratamento: data.objetivosTerapeuticos || '',
        profissionalId: 'prof-clinica',
        profissionalNome: data.profissionalResponsavel || 'Profissional da Clínica',
        estagiarioNome: data.estagiarioNome,
        orientadorNome: data.orientadorNome
      });
    }

    this.notify();
    return saved;
  }

  // --- Acompanhamento (Evolução Clínica / Sessões) ---
  public getAcompanhamentos(): Acompanhamento[] {
    return this.load<Acompanhamento[]>('acompanhamentos', INITIAL_ACOMPANHAMENTOS);
  }

  public getAcompanhamentosByPacienteId(pacienteId: string): Acompanhamento[] {
    return this.getAcompanhamentos()
      .filter(a => a.pacienteId === pacienteId)
      .sort((a, b) => b.numeroSessao - a.numeroSessao);
  }

  public adicionarAcompanhamento(acomp: Omit<Acompanhamento, 'id' | 'dataRegistro'>): Acompanhamento {
    return this.salvarAcompanhamento(acomp);
  }

  public salvarAcompanhamento(acomp: Partial<Acompanhamento> & { pacienteId: string; pacienteNome: string; profissionalId: string; profissionalNome: string; observacoes: string }): Acompanhamento {
    const list = this.getAcompanhamentos();
    const numProntuario = acomp.numeroProntuario || (acomp.pacienteId ? this.gerarNumeroProntuarioUnico(acomp.pacienteId) : this.gerarNumeroProntuarioUnico());

    if (acomp.pacienteId) {
      this.vincularNumeroProntuarioAoPaciente(acomp.pacienteId, numProntuario);
    }

    const agora = new Date().toISOString();
    let saved: Acompanhamento;

    if (acomp.id) {
      const existingIdx = list.findIndex(a => a.id === acomp.id);
      if (existingIdx >= 0) {
        saved = {
          ...list[existingIdx],
          ...acomp,
          numeroProntuario: numProntuario,
          dataRegistro: agora
        } as Acompanhamento;
        list[existingIdx] = saved;
      } else {
        saved = {
          ...acomp,
          id: acomp.id,
          numeroSessao: acomp.numeroSessao || 1,
          data: acomp.data || agora.split('T')[0],
          statusPresenca: acomp.statusPresenca || 'Presente',
          numeroProntuario: numProntuario,
          dataRegistro: agora
        } as Acompanhamento;
        list.unshift(saved);
      }
    } else {
      const proximoNumero = acomp.numeroSessao || (list.filter(a => a.pacienteId === acomp.pacienteId).length + 1);
      saved = {
        ...acomp,
        id: `acomp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
        numeroSessao: proximoNumero,
        data: acomp.data || agora.split('T')[0],
        statusPresenca: acomp.statusPresenca || 'Presente',
        numeroProntuario: numProntuario,
        dataRegistro: agora
      } as Acompanhamento;
      list.unshift(saved);
    }

    this.save('acompanhamentos', list);

    if (acomp.agendamentoId) {
      this.atualizarStatusAgendamento(acomp.agendamentoId, 'concluido');
    }

    this.notify();
    return saved;
  }

  public excluirAcompanhamento(id: string): void {
    const list = this.getAcompanhamentos().filter(a => a.id !== id);
    this.save('acompanhamentos', list);
    this.notify();
  }

  // --- Avaliações (Feedback) ---
  public getAvaliacoes(): Avaliacao[] {
    return this.load<Avaliacao[]>('avaliacoes', INITIAL_AVALIACOES);
  }

  public getAvaliacoesByProfissional(profissionalId: string): Avaliacao[] {
    return this.getAvaliacoes().filter(a => a.profissionalId === profissionalId);
  }

  public getAvaliacoesByEstagiario(estagiarioId: string): Avaliacao[] {
    return this.getAvaliacoes().filter(a => a.estagiarioId === estagiarioId);
  }

  public salvarAvaliacao(avaliacao: Omit<Avaliacao, 'id' | 'dataAvaliacao'>): Avaliacao {
    const list = this.getAvaliacoes();
    const created: Avaliacao = {
      ...avaliacao,
      id: `aval-${Date.now().toString(36)}`,
      dataAvaliacao: new Date().toISOString().split('T')[0]
    };

    this.save('avaliacoes', [created, ...list]);

    // Marcar no agendamento que foi avaliado
    const agendamentos = this.getAgendamentos();
    const index = agendamentos.findIndex(a => a.id === avaliacao.agendamentoId);
    if (index !== -1) {
      agendamentos[index] = {
        ...agendamentos[index],
        possuiAvaliacao: true
      };
      this.save('agendamentos', agendamentos);
    }

    return created;
  }

  // --- Notificações ---
  public getNotificacoes(): NotificacaoDisparo[] {
    return this.load<NotificacaoDisparo[]>('notificacoes', INITIAL_NOTIFICACOES);
  }

  public marcarNotificacaoLida(id: string): void {
    const list = this.getNotificacoes();
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], status: 'lido' };
      this.save('notificacoes', list);
    }
  }

  // --- Relatórios de Estágio e Cômputo de Horas ---
  public getRelatoriosEstagio(): RelatorioEstagio[] {
    return this.load<RelatorioEstagio[]>('relatorios_estagio', INITIAL_RELATORIOS_ESTAGIO);
  }

  public getRelatorioEstagioById(id: string): RelatorioEstagio | undefined {
    return this.getRelatoriosEstagio().find(r => r.id === id);
  }

  public getRelatoriosByEstagiarioId(estagiarioId: string): RelatorioEstagio[] {
    return this.getRelatoriosEstagio().filter(r => r.estagiarioId === estagiarioId);
  }

  public addRelatorioEstagio(relatorio: Omit<RelatorioEstagio, 'id' | 'criadoEm' | 'status'>): RelatorioEstagio {
    const list = this.getRelatoriosEstagio();
    const id = `rel-est-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
    const created: RelatorioEstagio = {
      ...relatorio,
      id,
      status: 'pendente',
      criadoEm: new Date().toISOString()
    };

    this.save('relatorios_estagio', [created, ...list]);
    return created;
  }

  public validarRelatorioEstagio(id: string, status: 'validado' | 'rejeitado', parecerOrientador?: string): RelatorioEstagio {
    const list = this.getRelatoriosEstagio();
    const index = list.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Relatório de estágio não encontrado.');
    }

    const updated: RelatorioEstagio = {
      ...list[index],
      status,
      parecerOrientador: parecerOrientador !== undefined ? parecerOrientador : list[index].parecerOrientador,
      validadoEm: new Date().toISOString()
    };

    list[index] = updated;
    this.save('relatorios_estagio', list);
    return updated;
  }

  public deleteRelatorioEstagio(id: string): void {
    const list = this.getRelatoriosEstagio();
    this.save('relatorios_estagio', list.filter(r => r.id !== id));
  }

  /**
   * Atribuição de Horas de Estágio (Individual ou em Lote) por Administradores e Orientadores.
   * Cria registros validados (ou pendentes) e abate/computa imediatamente as horas para cada estagiário.
   */
  public atribuirHorasEmLote(
    estagiarioIds: string[],
    dados: {
      horas: number;
      tipoAtividade: string;
      data: string;
      descricao: string;
      validado: boolean;
      parecer?: string;
      aprovadoPorNome?: string;
      orientadorId?: string;
      orientadorNome?: string;
    }
  ): RelatorioEstagio[] {
    const list = this.getRelatoriosEstagio();
    const estagiarios = this.getEstagiarios();
    const novosRelatorios: RelatorioEstagio[] = [];
    const now = new Date().toISOString();

    for (const estId of estagiarioIds) {
      const est = estagiarios.find(e => e.id === estId);
      if (!est) continue;

      const id = `rel-est-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      const relatorio: RelatorioEstagio = {
        id,
        estagiarioId: est.id,
        estagiarioNome: est.nome,
        estagiarioTurma: est.turma,
        pacienteNome: `Atividade: ${dados.tipoAtividade}`,
        profissionalNome: dados.aprovadoPorNome || 'Supervisão de Estágios',
        orientadorId: dados.orientadorId,
        orientadorNome: dados.orientadorNome || dados.aprovadoPorNome,
        dataSessao: dados.data,
        horario: `${dados.horas} hora(s) complementares`,
        horasComputadas: Number(dados.horas),
        avaliacaoReflexiva: dados.descricao,
        resumoCaso: dados.descricao,
        atividadesRealizadas: dados.tipoAtividade,
        avaliacaoAutoCritica: `Horas de estágio atribuídas e homologadas pela coordenação/orientação (${dados.tipoAtividade}).`,
        status: dados.validado ? 'validado' : 'pendente',
        parecerOrientador: dados.parecer || `Horas validadas e computadas pela Coordenação / Orientação (${dados.aprovadoPorNome || 'Supervisão'}).`,
        validadoEm: dados.validado ? now : undefined,
        validadoPorNome: dados.validado ? (dados.aprovadoPorNome || 'Supervisão') : undefined,
        criadoEm: now
      };
      novosRelatorios.push(relatorio);
    }

    if (novosRelatorios.length > 0) {
      this.save('relatorios_estagio', [...novosRelatorios, ...list]);
      this.notify();
    }

    return novosRelatorios;
  }

  public setHorasExigidas(estagiarioId: string, horas: number): void {
    const estagiarios = this.getEstagiarios();
    const index = estagiarios.findIndex(e => e.id === estagiarioId);
    if (index !== -1) {
      estagiarios[index] = {
        ...estagiarios[index],
        horasExigidas: Math.max(1, Math.round(horas))
      };
      this.save('estagiarios', estagiarios);
    }
  }

  /**
   * Calcula o resumo de horas de estágio para um determinado estagiário.
   * As horas são abatidas / contabilizadas conforme relatórios validados e atendimentos.
   */
  public getHorasEstagioStatus(estagiarioId: string) {
    const estagiario = this.getEstagiarios().find(e => e.id === estagiarioId);
    const horasExigidas = estagiario?.horasExigidas || 100;

    const relatorios = this.getRelatoriosByEstagiarioId(estagiarioId);
    
    // Horas validadas pelo orientador
    const relatoriosValidados = relatorios.filter(r => r.status === 'validado');
    const horasCumpridas = relatoriosValidados.reduce((acc, r) => acc + (Number(r.horasComputadas) || 0), 0);

    // Horas pendentes de validação
    const relatoriosPendentes = relatorios.filter(r => r.status === 'pendente');
    const horasPendentes = relatoriosPendentes.reduce((acc, r) => acc + (Number(r.horasComputadas) || 0), 0);

    // Horas restantes para atingir a meta
    const horasRestantes = Math.max(0, +(horasExigidas - horasCumpridas).toFixed(1));
    const percentualConcluido = Math.min(100, Math.round((horasCumpridas / (horasExigidas || 1)) * 100));

    // Total de atendimentos vinculados
    const agendamentosVinculados = this.getAgendamentos().filter(
      a => a.estagiarioId === estagiarioId && a.status === 'concluido'
    );

    return {
      estagiarioId,
      estagiarioNome: estagiario?.nome || 'Estagiário',
      turma: estagiario?.turma || '',
      horasExigidas,
      horasCumpridas: +horasCumpridas.toFixed(1),
      horasPendentes: +horasPendentes.toFixed(1),
      horasRestantes,
      percentualConcluido,
      totalRelatorios: relatorios.length,
      totalRelatoriosValidados: relatoriosValidados.length,
      totalAtendimentos: Math.max(agendamentosVinculados.length, relatorios.length)
    };
  }

  // --- Configurações e Disparos Automáticos de E-mail / SMTP ---
  public getEmailConfig(): EmailSmtpConfig {
    return this.load<EmailSmtpConfig>('email_smtp_config', INITIAL_EMAIL_CONFIG);
  }

  public saveEmailConfig(config: EmailSmtpConfig): void {
    this.save('email_smtp_config', config);
  }

  public updateEmailTestStatus(status: 'sucesso' | 'erro' | 'pendente', mensagem: string): void {
    const config = this.getEmailConfig();
    this.save('email_smtp_config', {
      ...config,
      ultimoTesteStatus: status,
      ultimoTesteMensagem: mensagem,
      ultimoTesteData: new Date().toISOString()
    });
  }

  public getEmailLogs(): EmailDispatchLog[] {
    return this.load<EmailDispatchLog[]>('email_dispatch_logs', INITIAL_EMAIL_LOGS);
  }

  public addEmailLog(log: Omit<EmailDispatchLog, 'id' | 'dataHora'>): EmailDispatchLog {
    const logs = this.getEmailLogs();
    const newLog: EmailDispatchLog = {
      ...log,
      id: `elog-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      dataHora: new Date().toISOString()
    };
    // Mantém no máximo os 200 logs mais recentes
    const updated = [newLog, ...logs].slice(0, 200);
    this.save('email_dispatch_logs', updated);
    return newLog;
  }

  public clearEmailLogs(): void {
    this.save('email_dispatch_logs', []);
  }

  // --- Exportar & Importar Banco de Dados ---
  public exportarJSON(): string {
    const fullDb = {
      admins: this.getAdmins(),
      profissionais: this.getProfissionais(),
      estagiarios: this.getEstagiarios(),
      pacientes: this.getPacientes(),
      orientadores: this.getOrientadores(),
      horarios: this.getHorarios(),
      disp_estagiarios: this.getDispEstagiarios(),
      agendamentos: this.getAgendamentos(),
      anamneses: this.getAnamneses(),
      acompanhamentos: this.getAcompanhamentos(),
      avaliacoes: this.getAvaliacoes(),
      notificacoes: this.getNotificacoes(),
      relatorios_estagio: this.getRelatoriosEstagio(),
      email_smtp_config: this.getEmailConfig(),
      email_dispatch_logs: this.getEmailLogs(),
      exportadoEm: new Date().toISOString()
    };
    return JSON.stringify(fullDb, null, 2);
  }

  public importarJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.admins) this.save('admins', data.admins);
      if (data.profissionais) this.save('profissionais', data.profissionais);
      if (data.estagiarios) this.save('estagiarios', data.estagiarios);
      if (data.pacientes) this.save('pacientes', data.pacientes);
      if (data.orientadores) this.save('orientadores', data.orientadores);
      if (data.horarios) this.save('horarios', data.horarios);
      if (data.disp_estagiarios) this.save('disp_estagiarios', data.disp_estagiarios);
      if (data.agendamentos) this.save('agendamentos', data.agendamentos);
      if (data.anamneses) this.save('anamneses', data.anamneses);
      if (data.acompanhamentos) this.save('acompanhamentos', data.acompanhamentos);
      if (data.avaliacoes) this.save('avaliacoes', data.avaliacoes);
      if (data.notificacoes) this.save('notificacoes', data.notificacoes);
      if (data.relatorios_estagio) this.save('relatorios_estagio', data.relatorios_estagio);
      if (data.email_smtp_config) this.save('email_smtp_config', data.email_smtp_config);
      if (data.email_dispatch_logs) this.save('email_dispatch_logs', data.email_dispatch_logs);
      this.notify();
      return true;
    } catch (e) {
      console.error('Erro ao importar JSON:', e);
      return false;
    }
  }
}

export const db = new DatabaseService();
