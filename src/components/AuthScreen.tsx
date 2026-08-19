import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, HorarioDisponivel, DisponibilidadeEstagiario } from '../types';
import { db } from '../services/db';
import { MultiDateSchedulePicker, TimeSlot } from './MultiDateSchedulePicker';
import { SIACSLogo, SIACSMonogram, SACSLogo, SACSMonogram } from './SIACSLogo';
import { CamposSallesLogo, CamposSallesMonogram } from './CamposSallesLogo';
import { LGPDModal } from './LGPDModal';
import {
  GraduationCap,
  Stethoscope,
  HeartHandshake,
  Shield,
  LogIn,
  UserPlus,
  Lock,
  Mail,
  User,
  Phone,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Camera,
  Upload,
  Link,
  X,
  ChevronDown,
  Frown,
  Eye,
  EyeOff,
  Calendar,
  KeyRound,
  ExternalLink,
  Copy,
  Send
} from 'lucide-react';
import { SAD_AVATAR_DATA_URI } from '../utils/avatar';
import { sendAutomatedEmail } from '../services/emailService';

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();

  // Mode: simple login by default, cadastro, esqueci-senha, redefinir-senha
  const [mode, setMode] = useState<'login' | 'cadastro' | 'esqueci-senha' | 'redefinir-senha'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('paciente');

  // Login form state
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [successBanner, setSuccessBanner] = useState<string>('');

  // Esqueci minha senha state
  const [esqueciEmail, setEsqueciEmail] = useState<string>('');
  const [esqueciError, setEsqueciError] = useState<string>('');
  const [esqueciSuccess, setEsqueciSuccess] = useState<string>('');
  const [recoveryToken, setRecoveryToken] = useState<string>('');
  const [novaSenha, setNovaSenha] = useState<string>('');
  const [confirmaNovaSenha, setConfirmaNovaSenha] = useState<string>('');
  const [showNovaSenha, setShowNovaSenha] = useState<boolean>(false);
  const [redefinirError, setRedefinirError] = useState<string>('');

  // Cadastro form state
  const [nome, setNome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [showCadastroSenha, setShowCadastroSenha] = useState<boolean>(false);
  const [telefone, setTelefone] = useState<string>('');
  const [foto, setFoto] = useState<string>('');
  const [fotoMode, setFotoMode] = useState<'upload' | 'url'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Specific role fields
  const [crm, setCrm] = useState<string>('');
  const [crp, setCrp] = useState<string>('');
  const [especialidade, setEspecialidade] = useState<string>('');
  const [cpf, setCpf] = useState<string>('');
  const [dataNascimento, setDataNascimento] = useState<string>('');
  const [turma, setTurma] = useState<string>('');
  const [endereco, setEndereco] = useState<string>('');
  const [departamento, setDepartamento] = useState<string>('');
  const [cargo, setCargo] = useState<string>('');
  const [cadastroError, setCadastroError] = useState<string>('');

  // LGPD Consent Modal state
  const [showLGPDModal, setShowLGPDModal] = useState<boolean>(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);

  // Multi-date and Multi-time schedule state for Profissional
  const [profDatas, setProfDatas] = useState<string[]>([]);
  const [profHorarios, setProfHorarios] = useState<TimeSlot[]>([]);

  // Multi-date and Multi-time schedule state for Estagiario
  const [estDatas, setEstDatas] = useState<string[]>([]);
  const [estHorarios, setEstHorarios] = useState<TimeSlot[]>([]);
  const [estObservacoes, setEstObservacoes] = useState<string>('');

  // Handle Photo File Upload
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setCadastroError('A imagem selecionada é muito grande. Escolha uma foto de até 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail || !loginPassword) {
      setLoginError('Por favor, informe seu e-mail e sua senha.');
      return;
    }

    const userFound = db.findUserByLogin(loginEmail);
    if (userFound && userFound.senha === loginPassword) {
      if (userFound.role === 'profissional' && (userFound as any).aprovado === false) {
        setLoginError('🔒 Acesso pendente de habilitação: Seu cadastro de Profissional foi recebido com sucesso, mas seu login ainda aguarda liberação e habilitação pelo Orientador Docente ou pela Administração da Clínica Escola.');
        return;
      }
    }

    const ok = login(loginEmail, loginPassword);
    if (!ok) {
      setLoginError('E-mail ou senha incorretos. Verifique os dados digitados ou realize seu cadastro abaixo.');
    }
  };

  const handleEsqueciSenhaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEsqueciError('');
    setEsqueciSuccess('');

    const trimmedEmail = esqueciEmail.trim();
    if (!trimmedEmail) {
      setEsqueciError('Por favor, informe seu e-mail cadastrado.');
      return;
    }

    try {
      const result = db.solicitarRecuperacaoSenha(trimmedEmail);
      setRecoveryToken(result.token);
      
      const verificationCode = result.token.toUpperCase().slice(-6);
      setEsqueciSuccess(`Instruções e código de segurança gerados para "${result.user.email}". Código: ${verificationCode}`);

      // Dispara em background via serviço de e-mail (com fallback resiliente)
      sendAutomatedEmail({
        to: result.user.email,
        toName: result.user.nome,
        subject: '🔐 Recuperação de Senha - SIACS • Faculdade Campos Salles',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; color: #2D3748; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; background: #FFFFFF;">
            <div style="border-bottom: 2px solid #033B6C; padding-bottom: 12px; margin-bottom: 16px;">
              <h2 style="color: #033B6C; margin: 0 0 4px 0; font-size: 20px;">SIACS • Recuperação de Senha</h2>
              <p style="margin: 0; color: #62A032; font-weight: bold; font-size: 13px;">Faculdades Integradas Campos Salles</p>
            </div>
            <p>Olá <strong>${result.user.nome}</strong>,</p>
            <p>Recebemos uma solicitação para redefinir a sua senha de acesso ao SIACS.</p>
            <div style="background: #F8F5F0; border-left: 4px solid #033B6C; padding: 16px; margin: 20px 0; border-radius: 6px;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #718096; text-transform: uppercase; font-weight: bold;">Seu Código de Verificação:</p>
              <div style="font-size: 26px; font-weight: bold; letter-spacing: 4px; color: #033B6C; font-family: monospace;">${verificationCode}</div>
            </div>
            <p style="font-size: 13px; color: #4A5568;">Se você não solicitou esta redefinição, por favor desconsidere este e-mail.</p>
            <div style="border-top: 1px solid #E2E8F0; margin-top: 24px; padding-top: 12px; font-size: 11px; color: #A0AEC0; text-align: center;">
              Emitido pelo Módulo de Segurança do SIACS
            </div>
          </div>
        `,
        text: `Código de verificação para redefinição de senha no SIACS: ${verificationCode}. Conta: ${result.user.email}`,
        type: 'recuperacao_senha'
      }).catch(err => console.warn('Disparo de e-mail em background:', err));

    } catch (err: any) {
      setEsqueciError(err.message || 'Erro ao solicitar recuperação de senha.');
    }
  };

  const handleRedefinirSenhaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRedefinirError('');

    if (!novaSenha || novaSenha.trim().length < 3) {
      setRedefinirError('A nova senha deve conter no mínimo 3 caracteres.');
      return;
    }

    if (novaSenha !== confirmaNovaSenha) {
      setRedefinirError('As senhas digitadas não coincidem. Digite novamente.');
      return;
    }

    try {
      db.redefinirSenhaComEmail(esqueciEmail, novaSenha);
      setSuccessBanner('Senha alterada com sucesso! Você já pode entrar com sua nova senha.');
      setLoginEmail(esqueciEmail);
      setLoginPassword(novaSenha);
      setMode('login');
      setEsqueciEmail('');
      setEsqueciSuccess('');
      setNovaSenha('');
      setConfirmaNovaSenha('');
    } catch (err: any) {
      setRedefinirError(err.message || 'Erro ao redefinir senha.');
    }
  };

  const handleCadastroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCadastroError('');

    if (!nome || !email || !senha || !telefone) {
      setCadastroError('Preencha os campos obrigatórios (Nome, E-mail, Senha e Telefone).');
      return;
    }

    const allUsers = db.getAllUsers();
    const normalizedEmail = email.trim().toLowerCase();

    // Validação de e-mail duplicado em qualquer tipo de acesso
    const emailExistente = allUsers.some(u =>
      u.email.trim().toLowerCase() === normalizedEmail ||
      u.login.trim().toLowerCase() === normalizedEmail
    );
    if (emailExistente) {
      setCadastroError(`O e-mail "${email}" já está cadastrado no sistema (indiferente do tipo de acesso). Utilize outro e-mail.`);
      return;
    }

    const payload: any = {
      nome,
      email,
      telefone,
      senha,
      role: selectedRole,
      foto: foto.trim() || undefined
    };

    if (selectedRole === 'admin') {
      setCadastroError('Não é permitido criar contas com perfil de Administrador através da tela de cadastro público. Contas administrativas são restritas à coordenação.');
      return;
    } else if (selectedRole === 'profissional') {
      if (!crm && !crp) {
        setCadastroError('Informe o número do CRM (ou CRP) do Profissional.');
        return;
      }
      if (!especialidade) {
        setCadastroError('Informe a Especialidade do Profissional.');
        return;
      }
      payload.crm = crm || undefined;
      payload.crp = crp || crm;
      payload.especialidade = especialidade;
    } else if (selectedRole === 'estagiario') {
      if (!cpf || !turma) {
        setCadastroError('Informe o CPF e a Turma do Estagiário.');
        return;
      }
      payload.cpf = cpf;
      payload.turma = turma;
    } else if (selectedRole === 'paciente') {
      if (!cpf || !endereco || !dataNascimento) {
        setCadastroError('Informe o CPF, a Data de Nascimento e o Endereço do Paciente.');
        return;
      }
      payload.cpf = cpf;
      payload.endereco = endereco;
      payload.dataNascimento = dataNascimento;
    } else if (selectedRole === 'orientador') {
      if (!cpf || !endereco) {
        setCadastroError('Informe o CPF e o Endereço/Departamento do Orientador.');
        return;
      }
      payload.cpf = cpf;
      payload.endereco = endereco;
      payload.departamento = departamento || 'Supervisão de Estágios';
    }

    // Validação de CPF duplicado em qualquer tipo de acesso
    if (payload.cpf) {
      const cleanCpf = String(payload.cpf).replace(/\D/g, '');
      if (cleanCpf.length > 0) {
        const cpfExistente = allUsers.some(u => {
          const existingCpf = (u as any).cpf ? String((u as any).cpf).replace(/\D/g, '') : '';
          return existingCpf.length > 0 && existingCpf === cleanCpf;
        });
        if (cpfExistente) {
          setCadastroError(`O CPF informado (${payload.cpf}) já está cadastrado no sistema (indiferente do tipo de acesso). Não é permitido cadastrar CPFs repetidos.`);
          return;
        }
      }
    }

    // Abre o Modal de Consentimento da LGPD antes de salvar
    setPendingPayload(payload);
    setShowLGPDModal(true);
  };

  const handleConfirmLGPDAndRegister = () => {
    if (!pendingPayload) return;

    try {
      // 1. Cadastra no banco de dados SEM logar direto no sistema
      const createdUser = register(pendingPayload);

      let extraMsg = '';

      // 2. Se for profissional e configurou datas e horários, cria os slots na agenda
      if (selectedRole === 'profissional' && profDatas.length > 0 && profHorarios.length > 0) {
        const slotsToCreate: Array<Omit<HorarioDisponivel, 'id' | 'status'>> = [];
        for (const d of profDatas) {
          for (const h of profHorarios) {
            slotsToCreate.push({
              profissionalId: createdUser.id,
              profissionalNome: createdUser.nome,
              especialidade: (createdUser as any).especialidade || especialidade,
              data: d,
              horaInicio: h.horaInicio,
              horaFim: h.horaFim
            });
          }
        }
        if (slotsToCreate.length > 0) {
          db.addMultipleHorarios(slotsToCreate);
          extraMsg = ` com ${slotsToCreate.length} horários de atendimento abertos na sua agenda`;
        }
      }

      // 3. Se for estagiário e configurou datas e horários, cria a disponibilidade de estágio
      if (selectedRole === 'estagiario' && estDatas.length > 0 && estHorarios.length > 0) {
        const dispsToCreate: Array<Omit<DisponibilidadeEstagiario, 'id' | 'status'>> = [];
        for (const d of estDatas) {
          for (const h of estHorarios) {
            dispsToCreate.push({
              estagiarioId: createdUser.id,
              estagiarioNome: createdUser.nome,
              turma: (createdUser as any).turma || turma,
              data: d,
              horaInicio: h.horaInicio,
              horaFim: h.horaFim,
              observacoes: estObservacoes || 'Disponibilidade de estágio informada no cadastro'
            });
          }
        }
        if (dispsToCreate.length > 0) {
          db.addMultipleDispEstagiarios(dispsToCreate);
          extraMsg = ` com ${dispsToCreate.length} turnos de disponibilidade de estágio cadastrados`;
        }
      }

      // 4. Preenche o login com o email cadastrado
      setLoginEmail(pendingPayload.email);
      setLoginPassword('');
      setLoginError('');

      // 5. Limpa o formulário de cadastro
      setNome('');
      setEmail('');
      setSenha('');
      setTelefone('');
      setFoto('');
      setCrm('');
      setCrp('');
      setEspecialidade('');
      setCpf('');
      setDataNascimento('');
      setTurma('');
      setEndereco('');
      setDepartamento('');
      setCargo('');
      setProfDatas([]);
      setProfHorarios([]);
      setEstDatas([]);
      setEstHorarios([]);
      setEstObservacoes('');

      // 6. Fecha o modal de LGPD e retorna para login com mensagem de sucesso
      setShowLGPDModal(false);
      setPendingPayload(null);
      setMode('login');

      if (selectedRole === 'profissional') {
        setSuccessBanner(`Cadastro de Profissional realizado com sucesso para "${pendingPayload.nome}"${extraMsg}! ⚠️ AVISO IMPORTANTE: A liberação do seu acesso ao sistema depende da habilitação prévia pelo Orientador Docente ou pela Administração. Você poderá acessar assim que seu perfil for habilitado.`);
      } else {
        setSuccessBanner(`Cadastro realizado com sucesso para "${pendingPayload.nome}"${extraMsg}! Por favor, faça login com seu e-mail e senha para acessar o sistema.`);
      }
    } catch (err: any) {
      setShowLGPDModal(false);
      setCadastroError(err.message || 'Erro ao registrar usuário. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between text-[#434343] font-sans">
      
      {/* Top Brand Bar */}
      <header className="border-b border-[#E5E1D8] bg-[#F8F5F0] py-3 px-6 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SIACSMonogram size="md" className="shrink-0" />
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 leading-tight">
                <span className="font-black text-lg sm:text-xl tracking-tight text-[#033B6C]">
                  SIACS
                </span>
                <span className="text-xs font-bold text-[#033B6C] hidden sm:inline">
                  • Sistema Integrado de Agendamento Campos Salles
                </span>
              </div>
              <p className="text-[11px] text-[#62A032] font-semibold leading-tight hidden sm:block mt-0.5">
                Faculdade Campos Salles • Eficiência e Organização
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#033B6C]/10 text-[#033B6C] border border-[#033B6C]/20">
              Acesso Integrado
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="max-w-md w-full space-y-4">
          
          {/* SUCCESS BANNER AFTER REGISTRATION */}
          {successBanner && mode === 'login' && (
            <div className="p-4 bg-[#F1F8E9] border border-[#D0E3B6] rounded-2xl flex items-start gap-3 text-xs text-[#82954B] animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#82954B] mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm">Conta criada com sucesso!</p>
                <p className="text-[#5C5C5C]">{successBanner}</p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TELA DE LOGIN SIMPLES (PADRÃO INICIAL) */}
          {/* ========================================================================= */}
          {mode === 'login' && (
            <div className="bg-white border border-[#E5E1D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
              
              {/* Header with SIACS Logo & Title */}
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-1">
                  <SIACSMonogram size="lg" />
                </div>
                <h1 className="font-sans font-black text-2xl sm:text-3xl text-[#033B6C] tracking-tight">
                  Acessar SIACS
                </h1>
                <p className="text-xs text-[#5C5C5C]">
                  Sistema Integrado de Agendamento Campos Salles
                </p>
                <p className="text-[11px] font-bold text-[#62A032]">
                  Eficiência e Organização
                </p>
              </div>

              {/* Login Error Notification */}
              {loginError && (
                <div className="p-3.5 bg-[#FDF0EE] border border-[#F7C4BE] rounded-xl flex items-start gap-2 text-xs text-[#E98074]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Simple Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5C5C5C] mb-1.5">
                    Usuário ou E-mail (Login de Acesso)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8E8D8A] absolute left-3.5 top-3.5" />
                    <input
                      id="login-email"
                      type="text"
                      required
                      placeholder="admin ou seu e-mail cadastrado"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#08487A] text-[#434343] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#5C5C5C]">
                      Senha
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="text-[11px] font-medium text-[#08487A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      {showLoginPassword ? (
                        <>
                          <EyeOff className="w-3 h-3" /> Ocultar
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" /> Ver senha
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8E8D8A] absolute left-3.5 top-3.5" />
                    <input
                      id="login-senha"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 text-sm bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#08487A] text-[#434343] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-3.5 text-[#8E8D8A] hover:text-[#434343] cursor-pointer"
                      title={showLoginPassword ? 'Ocultar senha' : 'Ver senha'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    id="btn-esqueci-senha"
                    type="button"
                    onClick={() => {
                      setEsqueciEmail(loginEmail);
                      setEsqueciError('');
                      setEsqueciSuccess('');
                      setRedefinirError('');
                      setMode('esqueci-senha');
                    }}
                    className="text-xs font-semibold text-[#08487A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#08487A]" />
                    Esqueci minha senha
                  </button>
                </div>

                <button
                  id="btn-entrar"
                  type="submit"
                  className="w-full py-3 px-4 bg-[#08487A] hover:bg-[#063860] text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar no Sistema
                </button>
              </form>

              {/* Quick test credentials buttons - Todos os 5 perfis de acesso na primeira tela */}
              <div className="p-3.5 bg-[#FDFBF7] rounded-2xl border border-[#E5E1D8] space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-[#0A3B66] uppercase tracking-wider">
                    Perfis de Acesso Rápido
                  </p>
                  <span className="text-[10px] text-[#8E8D8A] bg-white px-2 py-0.5 rounded-md border border-[#E5E1D8]">
                    1 clique para preencher
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* 1. Admin */}
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('admin');
                      setLoginPassword('admin');
                    }}
                    className="p-2.5 bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl font-bold text-[#0A3B66] text-left transition-all cursor-pointer flex items-center justify-between shadow-2xs hover:border-[#0A3B66]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#E6F0FA] flex items-center justify-center text-[#0A3B66] shrink-0">
                        <KeyRound className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold leading-none">Administrador</div>
                        <div className="text-[10px] font-normal text-[#8E8D8A] mt-0.5">login: admin / senha: admin</div>
                      </div>
                    </div>
                  </button>

                  {/* 2. Orientador */}
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('helena.matos@clinicaescola.edu.br');
                      setLoginPassword('123');
                    }}
                    className="p-2.5 bg-white hover:bg-[#FDFBF7] border border-[#EED9B0] rounded-xl font-bold text-[#434343] text-left transition-all cursor-pointer flex items-center justify-between shadow-2xs hover:border-[#B58D3D]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#FBF4E6] flex items-center justify-center text-[#B58D3D] shrink-0">
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold leading-none">Orientador Docente</div>
                        <div className="text-[10px] font-normal text-[#8E8D8A] mt-0.5">Dra. Helena Matos (123)</div>
                      </div>
                    </div>
                  </button>

                  {/* 3. Profissional */}
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('camila.andrade@clinicaescola.edu.br');
                      setLoginPassword('123');
                    }}
                    className="p-2.5 bg-white hover:bg-[#F9FBF7] border border-[#D0E3B6] rounded-xl font-bold text-[#434343] text-left transition-all cursor-pointer flex items-center justify-between shadow-2xs hover:border-[#82954B]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#F1F8E9] flex items-center justify-center text-[#82954B] shrink-0">
                        <Stethoscope className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold leading-none">Profissional / Psicólogo</div>
                        <div className="text-[10px] font-normal text-[#8E8D8A] mt-0.5">Dra. Camila Andrade (123)</div>
                      </div>
                    </div>
                  </button>

                  {/* 4. Estagiário */}
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('lucas.silveira@aluno.clinicaescola.edu.br');
                      setLoginPassword('123');
                    }}
                    className="p-2.5 bg-white hover:bg-[#FAF6F6] border border-[#E5CDC9] rounded-xl font-bold text-[#434343] text-left transition-all cursor-pointer flex items-center justify-between shadow-2xs hover:border-[#A37B75]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#F7EEEC] flex items-center justify-center text-[#A37B75] shrink-0">
                        <GraduationCap className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold leading-none">Estagiário de Psicologia</div>
                        <div className="text-[10px] font-normal text-[#8E8D8A] mt-0.5">Lucas Silveira (123)</div>
                      </div>
                    </div>
                  </button>

                  {/* 5. Paciente */}
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('anaclara.souza@gmail.com');
                      setLoginPassword('123');
                    }}
                    className="p-2.5 bg-white hover:bg-[#FDF6F5] border border-[#F7C4BE] rounded-xl font-bold text-[#434343] text-left transition-all cursor-pointer flex items-center justify-between shadow-2xs hover:border-[#E98074] sm:col-span-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#FDF0EE] flex items-center justify-center text-[#E98074] shrink-0">
                        <HeartHandshake className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold leading-none">Paciente / Cliente</div>
                        <div className="text-[10px] font-normal text-[#8E8D8A] mt-0.5">Ana Clara Souza (123)</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Call to Register */}
              <div className="pt-3 border-t border-[#E5E1D8] text-center">
                <p className="text-xs text-[#5C5C5C]">
                  Ainda não possui uma conta?{' '}
                  <button
                    id="btn-abrir-cadastro"
                    onClick={() => {
                      setMode('cadastro');
                      setSuccessBanner('');
                      setLoginError('');
                    }}
                    className="font-bold text-[#08487A] hover:underline cursor-pointer"
                  >
                    Cadastre-se na Clínica Escola
                  </button>
                </p>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TELA 1: ESQUECI MINHA SENHA (SOLICITAR ENVIO DE E-MAIL) */}
          {/* ========================================================================= */}
          {mode === 'esqueci-senha' && (
            <div className="bg-white border border-[#E5E1D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in max-w-lg mx-auto">
              
              {/* Back to Login Button */}
              <button
                onClick={() => {
                  setMode('login');
                  setEsqueciError('');
                  setEsqueciSuccess('');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8E8D8A] hover:text-[#0A3B66] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o Login
              </button>

              {/* Screen Header */}
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-1">
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F0FA] flex items-center justify-center text-[#0A3B66]">
                    <KeyRound className="w-6 h-6" />
                  </div>
                </div>
                <h1 className="font-serif font-bold text-2xl text-[#0A3B66]">
                  Recuperação de Senha
                </h1>
                <p className="text-xs text-[#8E8D8A]">
                  Informe seu e-mail cadastrado para receber as instruções e o link seguro de redefinição de senha.
                </p>
              </div>

              {/* Error Message */}
              {esqueciError && (
                <div className="p-3.5 bg-[#FDF0EE] border border-[#F7C4BE] rounded-xl flex items-start gap-2 text-xs text-[#E98074]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{esqueciError}</span>
                </div>
              )}

              {/* Success Message & Next Steps */}
              {esqueciSuccess ? (
                <div className="space-y-4 animate-in fade-in zoom-in-95">
                  <div className="p-4 bg-[#F1F8E9] border border-[#D0E3B6] rounded-2xl flex items-start gap-3 text-xs text-[#2e7d32]">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-[#2e7d32] mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-[#2e7d32]">Código de Segurança Emitido com Sucesso!</p>
                      <p className="text-[#5C5C5C] leading-relaxed">
                        {esqueciSuccess}
                      </p>
                    </div>
                  </div>

                  {/* Caixa de Código e Ação Imediata */}
                  <div className="p-4 bg-white border-2 border-[#033B6C] rounded-2xl space-y-3 text-xs text-[#5C5C5C] shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">Código de Redefinição:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const code = recoveryToken.toUpperCase().slice(-6);
                          navigator.clipboard.writeText(code);
                          alert(`Código ${code} copiado para a área de transferência!`);
                        }}
                        className="px-2 py-1 bg-[#F8F5F0] hover:bg-[#EAE5D9] text-[#033B6C] border border-[#E5E1D8] rounded-lg text-[10px] font-bold cursor-pointer inline-flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copiar Código
                      </button>
                    </div>

                    <div className="p-3 bg-[#F8F5F0] rounded-xl text-center">
                      <div className="text-2xl font-bold font-mono tracking-widest text-[#033B6C]">
                        {recoveryToken.toUpperCase().slice(-6)}
                      </div>
                      <p className="text-[10px] text-[#8E8D8A] mt-1">
                        Utilize este código para redefinir sua senha agora mesmo.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                      <button
                        id="btn-redefinir-senha-direto"
                        type="button"
                        onClick={() => {
                          setMode('redefinir-senha');
                          setRedefinirError('');
                        }}
                        className="w-full sm:flex-1 py-3 px-4 bg-[#62A032] hover:bg-[#508627] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                        Redefinir Minha Senha Agora
                      </button>

                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(esqueciEmail)}&su=${encodeURIComponent('🔐 [SIACS] Código de Recuperação de Senha')}&body=${encodeURIComponent(`Olá! Seu código de verificação para redefinir a senha no SIACS é: ${recoveryToken.toUpperCase().slice(-6)}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto py-3 px-3.5 bg-white hover:bg-[#F8F5F0] text-[#033B6C] font-bold text-xs rounded-xl border border-[#CBD5E1] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Abrir Gmail Web
                      </a>
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setEsqueciError('');
                        setEsqueciSuccess('');
                        setEsqueciEmail('');
                      }}
                      className="text-xs font-semibold text-[#8E8D8A] hover:text-[#033B6C] cursor-pointer inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Login
                    </button>
                  </div>
                </div>
              ) : (
                /* E-mail Input Form */
                <form onSubmit={handleEsqueciSenhaSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#5C5C5C] mb-1.5">
                      E-mail Cadastrado na Plataforma *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#8E8D8A] absolute left-3.5 top-3.5" />
                      <input
                        id="esqueci-email-input"
                        type="email"
                        required
                        placeholder="seu.email@exemplo.com ou admin"
                        value={esqueciEmail}
                        onChange={(e) => setEsqueciEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#08487A] text-[#434343] transition-colors"
                      />
                    </div>
                    <p className="text-[11px] text-[#8E8D8A] mt-1.5">
                      Enviaremos uma mensagem com um token e link exclusivo para o e-mail informado.
                    </p>
                  </div>

                  <button
                    id="btn-enviar-esqueci-senha"
                    type="submit"
                    className="w-full py-3 px-4 bg-[#08487A] hover:bg-[#063860] text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Mail className="w-4 h-4" />
                    Enviar E-mail de Recuperação
                  </button>
                </form>
              )}

              <div className="pt-3 border-t border-[#E5E1D8] text-center">
                <p className="text-xs text-[#5C5C5C]">
                  Lembrou sua senha?{' '}
                  <button
                    onClick={() => {
                      setMode('login');
                      setEsqueciError('');
                      setEsqueciSuccess('');
                    }}
                    className="font-bold text-[#08487A] hover:underline cursor-pointer"
                  >
                    Fazer login
                  </button>
                </p>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TELA 2: REDEFINIR SENHA (DIGITAR NOVA SENHA) */}
          {/* ========================================================================= */}
          {mode === 'redefinir-senha' && (
            <div className="bg-white border border-[#E5E1D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in max-w-lg mx-auto">
              
              {/* Back button */}
              <button
                onClick={() => setMode('esqueci-senha')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8E8D8A] hover:text-[#0A3B66] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>

              <div className="text-center space-y-2">
                <div className="flex justify-center mb-1">
                  <div className="w-12 h-12 rounded-2xl bg-[#F1F8E9] flex items-center justify-center text-[#82954B]">
                    <Lock className="w-6 h-6" />
                  </div>
                </div>
                <h1 className="font-serif font-bold text-2xl text-[#0A3B66]">
                  Criar Nova Senha
                </h1>
                <p className="text-xs text-[#8E8D8A]">
                  Redefinindo acesso para a conta: <strong className="text-[#0A3B66]">{esqueciEmail}</strong>
                </p>
              </div>

              {redefinirError && (
                <div className="p-3.5 bg-[#FDF0EE] border border-[#F7C4BE] rounded-xl flex items-start gap-2 text-xs text-[#E98074]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{redefinirError}</span>
                </div>
              )}

              <form onSubmit={handleRedefinirSenhaSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#5C5C5C]">
                      Nova Senha *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNovaSenha(!showNovaSenha)}
                      className="text-[11px] font-medium text-[#08487A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      {showNovaSenha ? <><EyeOff className="w-3 h-3" /> Ocultar</> : <><Eye className="w-3 h-3" /> Ver senha</>}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8E8D8A] absolute left-3.5 top-3.5" />
                    <input
                      id="input-nova-senha"
                      type={showNovaSenha ? 'text' : 'password'}
                      required
                      placeholder="Mínimo de 3 caracteres"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 text-sm bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#08487A] text-[#434343] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C5C5C] mb-1.5">
                    Confirmar Nova Senha *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8E8D8A] absolute left-3.5 top-3.5" />
                    <input
                      id="input-confirma-nova-senha"
                      type={showNovaSenha ? 'text' : 'password'}
                      required
                      placeholder="Repita a nova senha"
                      value={confirmaNovaSenha}
                      onChange={(e) => setConfirmaNovaSenha(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 text-sm bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#08487A] text-[#434343] transition-colors"
                    />
                  </div>
                </div>

                <button
                  id="btn-salvar-nova-senha"
                  type="submit"
                  className="w-full py-3 px-4 bg-[#82954B] hover:bg-[#6F803E] text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Salvar Nova Senha e Conectar
                </button>
              </form>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TELA DE CADASTRO COMPLETO COM INCLUSÃO DE FOTO */}
          {/* ========================================================================= */}
          {mode === 'cadastro' && (
            <div className="bg-white border border-[#E5E1D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 animate-in fade-in max-w-xl mx-auto">
              
              {/* Back to login button */}
              <button
                onClick={() => {
                  setMode('login');
                  setCadastroError('');
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#8E8D8A] hover:text-[#434343] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para a tela de Login
              </button>

              <div className="space-y-1">
                <h1 className="font-sans font-black text-2xl sm:text-3xl text-[#033B6C] tracking-tight">
                  Criar Conta no SIACS
                </h1>
                <p className="text-xs text-[#5C5C5C]">
                  Selecione seu perfil e preencha seus dados. Após clicar em confirmar, você visualizará o Termo de Consentimento e Privacidade (LGPD) para validação da sua conta.
                </p>
              </div>

              {/* Role Selection Dropdown (Dropbox) - Administrador removido por segurança */}
              <div className="space-y-1.5">
                <label htmlFor="select-tipo-acesso" className="block text-xs font-semibold text-[#5C5C5C]">
                  Tipo de Acesso / Perfil da Conta *
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 pointer-events-none">
                    {selectedRole === 'paciente' && <HeartHandshake className="w-4 h-4 text-[#E98074]" />}
                    {selectedRole === 'profissional' && <Stethoscope className="w-4 h-4 text-[#82954B]" />}
                    {selectedRole === 'estagiario' && <GraduationCap className="w-4 h-4 text-[#A37B75]" />}
                    {selectedRole === 'orientador' && <Shield className="w-4 h-4 text-[#B58D3D]" />}
                  </div>
                  <select
                    id="select-tipo-acesso"
                    value={selectedRole === 'admin' ? 'paciente' : selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm font-semibold bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343] cursor-pointer shadow-2xs transition-colors"
                  >
                    <option value="paciente">Paciente (Cliente da Clínica Escola)</option>
                    <option value="profissional">Profissional (Psicólogo / Terapeuta Responsável)</option>
                    <option value="estagiario">Estagiário (Aluno de Psicologia em Formação)</option>
                    <option value="orientador">Orientador (Supervisor Docente de Estágio)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#8E8D8A] absolute right-3.5 top-3 pointer-events-none" />
                </div>
                
                {/* Description helper for the selected role in the dropbox */}
                <div className="text-[11px] px-3 py-1.5 rounded-lg border bg-[#F8F5F0] border-[#E5E1D8] text-[#5C5C5C] flex items-center justify-between">
                  <span>
                    {selectedRole === 'paciente' && 'Permite agendar consultas, escolher terapeutas e acompanhar atendimentos.'}
                    {selectedRole === 'profissional' && 'Permite disponibilizar agenda de horários, realizar anamneses e registros clínicos.'}
                    {selectedRole === 'estagiario' && 'Permite registrar disponibilidade de estágio e acompanhar supervisões acadêmicas.'}
                    {selectedRole === 'orientador' && 'Permite supervisionar atendimentos e avaliar o desempenho clínico dos estagiários.'}
                  </span>
                  <span className="font-bold uppercase text-[9px] px-1.5 py-0.5 rounded bg-white border border-[#E5E1D8] ml-2 shrink-0">
                    {selectedRole}
                  </span>
                </div>
              </div>

              {/* Cadastro Error */}
              {cadastroError && (
                <div className="p-3.5 bg-[#FDF0EE] border border-[#F7C4BE] rounded-xl flex items-start gap-2 text-xs text-[#E98074]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{cadastroError}</span>
                </div>
              )}

              {/* Cadastro Form */}
              <form onSubmit={handleCadastroSubmit} className="space-y-4">
                
                {/* Photo Upload Section for All Users */}
                <div className="p-3.5 bg-[#F8F5F0] border border-[#E5E1D8] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#5C5C5C] flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#82954B]" />
                      Foto de Perfil
                    </label>
                    <div className="flex items-center gap-1 bg-[#EDEAE3] p-0.5 rounded-lg text-[11px]">
                      <button
                        type="button"
                        onClick={() => setFotoMode('upload')}
                        className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                          fotoMode === 'upload' ? 'bg-white text-[#434343] shadow-xs' : 'text-[#8E8D8A]'
                        }`}
                      >
                        Enviar Arquivo
                      </button>
                      <button
                        type="button"
                        onClick={() => setFotoMode('url')}
                        className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                          fotoMode === 'url' ? 'bg-white text-[#434343] shadow-xs' : 'text-[#8E8D8A]'
                        }`}
                      >
                        Link / URL
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Live Avatar Preview */}
                    <div className="relative group shrink-0">
                      <div className="w-16 h-16 rounded-full bg-[#F4EBE6] border-2 border-white shadow-xs overflow-hidden flex items-center justify-center">
                        {foto ? (
                          <img
                            src={foto}
                            alt="Pré-visualização"
                            className="w-full h-full object-cover"
                            onError={() => {
                              // If broken URL, fallback
                            }}
                          />
                        ) : (
                          <img
                            src={SAD_AVATAR_DATA_URI}
                            alt="Sem foto (rostinho triste)"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      {foto ? (
                        <button
                          type="button"
                          onClick={() => setFoto('')}
                          className="absolute -top-1 -right-1 bg-[#E98074] text-white rounded-full p-1 shadow-xs hover:bg-[#d46a5e] transition-colors"
                          title="Remover foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="absolute -bottom-1 -right-1 bg-[#EAE7DC] text-[#7D716A] text-[10px] font-bold px-1 rounded-full border border-[#D8D2C2]" title="Rostinho triste padrão">
                          ☹️
                        </span>
                      )}
                    </div>

                    {/* Inputs based on Mode */}
                    <div className="flex-1 space-y-1.5">
                      {fotoMode === 'upload' ? (
                        <div>
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handlePhotoFileChange}
                            className="hidden"
                            id="photo-file-upload-input"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-2 px-3 bg-white border border-[#E5E1D8] hover:bg-[#EDEAE3] rounded-xl text-xs font-semibold text-[#5C5C5C] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5 text-[#82954B]" />
                            {foto ? 'Trocar Imagem...' : 'Selecionar Foto do Computador'}
                          </button>
                          <p className="text-[10px] text-[#8E8D8A] mt-1 text-center">
                            Formatos aceitos: JPG, PNG ou WEBP (máx. 3MB)
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="relative">
                            <Link className="w-3.5 h-3.5 text-[#8E8D8A] absolute left-3 top-2.5" />
                            <input
                              type="url"
                              placeholder="https://exemplo.com/minha-foto.jpg"
                              value={foto}
                              onChange={(e) => setFoto(e.target.value)}
                              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                            />
                          </div>
                          <p className="text-[10px] text-[#8E8D8A] mt-1">
                            Cole o link direto da imagem
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* General Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-[#5C5C5C] mb-1">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#8E8D8A] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="Nome completo do usuário"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#5C5C5C] mb-1">
                      Telefone / WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#8E8D8A] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="(11) 98765-4321"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#5C5C5C] mb-1">
                      E-mail (Seu Login) *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#8E8D8A] absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        placeholder="email@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-[#5C5C5C]">
                        Senha de Acesso *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCadastroSenha(!showCadastroSenha)}
                        className="text-[11px] font-medium text-[#1E2875] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        {showCadastroSenha ? (
                          <>
                            <EyeOff className="w-3 h-3" /> Ocultar
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" /> Ver senha
                          </>
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#8E8D8A] absolute left-3 top-2.5" />
                      <input
                        type={showCadastroSenha ? 'text' : 'password'}
                        required
                        placeholder="Crie uma senha de acesso"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="w-full pl-9 pr-10 py-2 bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E2875] text-[#434343]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCadastroSenha(!showCadastroSenha)}
                        className="absolute right-3 top-2.5 text-[#8E8D8A] hover:text-[#434343] cursor-pointer"
                        title={showCadastroSenha ? 'Ocultar senha' : 'Ver senha'}
                      >
                        {showCadastroSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Role Specific Additional Fields */}
                {selectedRole === 'admin' && (
                  <div className="p-3 bg-[#EDE8F5]/50 border border-[#D1C4E9] rounded-xl space-y-2 text-xs">
                    <p className="font-bold text-[#5E35B1] flex items-center gap-1.5 font-serif">
                      <Shield className="w-3.5 h-3.5" /> Dados do Administrador
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block font-medium text-[#5C5C5C] mb-1">Cargo / Função</label>
                        <input
                          type="text"
                          placeholder="Ex: Coordenador de Atendimento"
                          value={cargo}
                          onChange={(e) => setCargo(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#E5E1D8] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-[#5C5C5C] mb-1">Departamento</label>
                        <input
                          type="text"
                          placeholder="Diretoria Clínica"
                          value={departamento}
                          onChange={(e) => setDepartamento(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#E5E1D8] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedRole === 'profissional' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-[#F1F8E9]/60 border border-[#D0E3B6] rounded-xl space-y-2 text-xs">
                      <p className="font-bold text-[#82954B] flex items-center gap-1.5 font-serif">
                        <Stethoscope className="w-3.5 h-3.5" /> Dados do Profissional
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-medium text-[#5C5C5C] mb-1">Registro CRM / CRP *</label>
                          <input
                            type="text"
                            required
                            placeholder="CRM/SP 123456 ou CRP"
                            value={crm || crp}
                            onChange={(e) => {
                              setCrm(e.target.value);
                              setCrp(e.target.value);
                            }}
                            className="w-full px-3 py-2 bg-white border border-[#E5E1D8] rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-[#5C5C5C] mb-1">Especialidade / Área de Atuação *</label>
                          <input
                            type="text"
                            required
                            placeholder="Psicologia Clínica, TCC, Psiquiatria..."
                            value={especialidade}
                            onChange={(e) => setEspecialidade(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#E5E1D8] rounded-lg"
                          />
                        </div>
                      </div>
                      <div className="p-2.5 bg-white/80 rounded-lg border border-[#D0E3B6] text-[11px] text-[#5C5C5C]">
                        💡 <strong>Agenda inicial em branco:</strong> Após concluir o cadastro, sua agenda estará totalmente limpa para que você escolha e configure com precisão seus próprios dias e horários de atendimento dentro do painel do profissional.
                      </div>
                    </div>

                    {/* Opcional: Adicionar horários antecipadamente se desejar */}
                    <MultiDateSchedulePicker
                      role="profissional"
                      selectedDates={profDatas}
                      onChangeDates={setProfDatas}
                      selectedTimes={profHorarios}
                      onChangeTimes={setProfHorarios}
                    />
                  </div>
                )}

                {selectedRole === 'estagiario' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-[#F5EBE6]/60 border border-[#E5D2CB] rounded-xl space-y-2 text-xs">
                      <p className="font-bold text-[#A37B75] flex items-center gap-1.5 font-serif">
                        <GraduationCap className="w-3.5 h-3.5" /> Dados do Estagiário
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-medium text-[#5C5C5C] mb-1">CPF *</label>
                          <input
                            type="text"
                            required
                            placeholder="000.000.000-00"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#E5E1D8] rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-[#5C5C5C] mb-1">Turma / Semestre *</label>
                          <input
                            type="text"
                            required
                            placeholder="PSI-2024.1 (9º Sem)"
                            value={turma}
                            onChange={(e) => setTurma(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#E5E1D8] rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Multiple Dates & Multiple Hours Availability Picker */}
                    <MultiDateSchedulePicker
                      role="estagiario"
                      selectedDates={estDatas}
                      onChangeDates={setEstDatas}
                      selectedTimes={estHorarios}
                      onChangeTimes={setEstHorarios}
                      observacoes={estObservacoes}
                      onChangeObservacoes={setEstObservacoes}
                    />
                  </div>
                )}

                {selectedRole === 'paciente' && (
                  <div className="p-3 bg-[#FDF0EE]/60 border border-[#F7C4BE] rounded-xl space-y-2 text-xs">
                    <p className="font-bold text-[#E98074] flex items-center gap-1.5 font-serif">
                      <HeartHandshake className="w-3.5 h-3.5" /> Dados do Paciente
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block font-medium text-[#5C5C5C] mb-1">CPF *</label>
                        <input
                          type="text"
                          required
                          placeholder="000.000.000-00"
                          value={cpf}
                          onChange={(e) => setCpf(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#E5E1D8] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-[#5C5C5C] mb-1">Data de Nascimento *</label>
                        <input
                          type="date"
                          required
                          value={dataNascimento}
                          onChange={(e) => setDataNascimento(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#E5E1D8] rounded-lg"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-medium text-[#5C5C5C] mb-1">Endereço Residencial Completo *</label>
                        <input
                          type="text"
                          required
                          placeholder="Rua, número, complemento, bairro, cidade"
                          value={endereco}
                          onChange={(e) => setEndereco(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#E5E1D8] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedRole === 'orientador' && (
                  <div className="p-3 bg-[#FBF4E6]/60 border border-[#EED9B0] rounded-xl space-y-2 text-xs">
                    <p className="font-bold text-[#B58D3D] flex items-center gap-1.5 font-serif">
                      <Shield className="w-3.5 h-3.5" /> Dados do Orientador de Estágio
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block font-medium text-[#5C5C5C] mb-1">CPF *</label>
                        <input
                          type="text"
                          required
                          placeholder="000.000.000-00"
                          value={cpf}
                          onChange={(e) => setCpf(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#E5E1D8] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-[#5C5C5C] mb-1">Endereço Institucional / Sala *</label>
                        <input
                          type="text"
                          required
                          placeholder="Bloco C, Sala 204"
                          value={endereco}
                          onChange={(e) => setEndereco(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#E5E1D8] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  id="btn-finalizar-cadastro"
                  type="submit"
                  className="w-full py-3.5 px-4 bg-[#033B6C] hover:bg-[#022A4E] text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <UserPlus className="w-4 h-4 text-[#62A032]" />
                  <span>Confirmar Cadastro e Abrir Termos da LGPD</span>
                </button>
              </form>

              <div className="pt-3 border-t border-[#E5E1D8] text-center">
                <p className="text-xs text-[#5C5C5C]">
                  Já tem uma conta cadastrada?{' '}
                  <button
                    onClick={() => {
                      setMode('login');
                      setCadastroError('');
                    }}
                    className="font-bold text-[#033B6C] hover:underline cursor-pointer"
                  >
                    Fazer Login
                  </button>
                </p>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#F8F5F0] border-t border-[#E5E1D8] py-4 text-center text-xs text-[#8E8D8A]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium text-[#5C5C5C]">
            <strong className="font-black text-[#033B6C]">SIACS</strong> • Sistema Integrado de Agendamento Campos Salles
          </p>
          <p className="text-[#62A032] font-semibold">
            Faculdade Campos Salles • Eficiência e Organização
          </p>
        </div>
      </footer>

      {/* Modal Oficial de Termos de Consentimento e Privacidade (LGPD - Lei 13.709/2018) */}
      <LGPDModal
        isOpen={showLGPDModal}
        userName={pendingPayload?.nome || nome}
        userEmail={pendingPayload?.email || email}
        userRole={selectedRole}
        onConfirm={handleConfirmLGPDAndRegister}
        onCancel={() => setShowLGPDModal(false)}
      />
    </div>
  );
};
