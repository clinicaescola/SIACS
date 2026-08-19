import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { EmailSmtpConfig, EmailDispatchLog } from '../types';
import { testSmtpConnection, sendAutomatedEmail } from '../services/emailService';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Server,
  Lock,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  RefreshCw,
  Eye,
  Trash2,
  Check,
  X,
  Zap,
  Info,
  ExternalLink,
  KeyRound,
  CalendarCheck2,
  Search,
  Filter,
  Sparkles,
  MessageSquare,
  FileText,
  MailCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const AdminEmailConfigView: React.FC = () => {
  const { currentUser } = useAuth();
  const [config, setConfig] = useState<EmailSmtpConfig>(db.getEmailConfig());
  const [logs, setLogs] = useState<EmailDispatchLog[]>(db.getEmailLogs());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showGmailHelp, setShowGmailHelp] = useState(false);

  // Testing modal & states
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [testRecipientName, setTestRecipientName] = useState('Usuário de Teste');
  const [testMessageType, setTestMessageType] = useState<'geral' | 'agendamento' | 'recuperacao' | 'custom'>('geral');
  const [testCustomSubject, setTestCustomSubject] = useState('[SIACS] Teste de Comunicação e Disparo de Mensagem');
  const [testCustomBody, setTestCustomBody] = useState('Olá!\n\nEste é um teste manual de disparo de e-mail realizado pelo Administrador do SIACS (Faculdades Integradas Campos Salles).\n\nSe você recebeu esta mensagem, o servidor SMTP e as rotas de envio estão operando corretamente.');
  const [testFeedback, setTestFeedback] = useState<{ success: boolean; message: string; isSimulated?: boolean; time?: string } | null>(null);

  // Filters for logs
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [selectedLogForPreview, setSelectedLogForPreview] = useState<EmailDispatchLog | null>(null);

  useEffect(() => {
    const refresh = () => {
      setConfig(db.getEmailConfig());
      setLogs(db.getEmailLogs());
    };
    return db.subscribe(refresh);
  }, []);

  // Preenche destinatário com o e-mail do usuário logado ou da configuração
  useEffect(() => {
    if (!testRecipient) {
      if (currentUser?.email) {
        setTestRecipient(currentUser.email);
      } else if (config.emailRemetente) {
        setTestRecipient(config.emailRemetente);
      }
    }
  }, [currentUser, config]);

  const handleApplyPreset = (provider: 'gmail' | 'outlook' | 'yahoo') => {
    if (provider === 'gmail') {
      setConfig(prev => ({
        ...prev,
        servidorSmtp: 'smtp.gmail.com',
        porta: 465,
        seguranca: 'ssl'
      }));
    } else if (provider === 'outlook') {
      setConfig(prev => ({
        ...prev,
        servidorSmtp: 'smtp.office365.com',
        porta: 587,
        seguranca: 'tls'
      }));
    } else if (provider === 'yahoo') {
      setConfig(prev => ({
        ...prev,
        servidorSmtp: 'smtp.mail.yahoo.com',
        porta: 465,
        seguranca: 'ssl'
      }));
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    db.saveEmailConfig(config);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 400);
  };

  const handleOpenTestModal = (defaultType?: 'geral' | 'agendamento' | 'recuperacao' | 'custom') => {
    if (defaultType) setTestMessageType(defaultType);
    if (!testRecipient) {
      setTestRecipient(currentUser?.email || config.emailRemetente || 'admin@clinicaescola.edu.br');
    }
    setTestFeedback(null);
    setIsTestModalOpen(true);
  };

  const handleExecuteSendTest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const targetEmail = testRecipient.trim() || config.emailRemetente;
    if (!targetEmail) {
      setTestFeedback({
        success: false,
        message: 'Por favor, informe um endereço de e-mail de destino válido para o teste.'
      });
      return;
    }

    setIsSendingTest(true);
    setTestFeedback(null);

    const timeNow = new Date().toLocaleTimeString('pt-BR');
    const dateNow = new Date().toLocaleDateString('pt-BR');

    try {
      if (testMessageType === 'geral') {
        // Teste de conexão SMTP e mensagem de verificação
        const result = await testSmtpConnection(config, targetEmail);
        setTestFeedback({
          success: result.success,
          message: result.message,
          isSimulated: result.isSimulated,
          time: timeNow
        });
      } else if (testMessageType === 'recuperacao') {
        const result = await sendAutomatedEmail({
          to: targetEmail,
          toName: testRecipientName || 'Usuário do Sistema',
          subject: '🔐 [TESTE] Recuperação de Senha - SIACS • Faculdade Campos Salles',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; color: #2D3748; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; background: #FFFFFF;">
              <div style="border-bottom: 2px solid #033B6C; padding-bottom: 12px; margin-bottom: 16px;">
                <h2 style="color: #033B6C; margin: 0 0 4px 0; font-size: 20px;">SIACS • Recuperação de Senha</h2>
                <p style="margin: 0; color: #62A032; font-weight: bold; font-size: 13px;">Faculdades Integradas Campos Salles</p>
              </div>
              <p>Olá <strong>${testRecipientName || 'Usuário'}</strong>,</p>
              <p>Você solicitou uma mensagem de teste para verificar a entrega de e-mails de recuperação de senha no SIACS.</p>
              <div style="background: #F8F5F0; border-left: 4px solid #033B6C; padding: 16px; margin: 20px 0; border-radius: 6px;">
                <p style="margin: 0 0 6px 0; font-size: 12px; color: #718096; text-transform: uppercase; font-weight: bold;">Código de Verificação de Teste:</p>
                <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #033B6C; font-family: monospace;">SEC-8492</div>
              </div>
              <p style="font-size: 13px; color: #4A5568;">Se este fosse um disparo real, este código expiraria em 30 minutos.</p>
              <div style="border-top: 1px solid #E2E8F0; margin-top: 24px; padding-top: 12px; font-size: 11px; color: #A0AEC0; text-align: center;">
                Disparo de teste realizado em ${dateNow} às ${timeNow} &bull; Módulo de E-mail SIACS
              </div>
            </div>
          `,
          text: `Código de verificação gerado para teste: SEC-8492. Emitido em ${dateNow} às ${timeNow}.`,
          type: 'recuperacao_senha'
        });

        setTestFeedback({
          success: result.success,
          message: result.message || `E-mail de teste de recuperação de senha despachado para ${targetEmail}!`,
          isSimulated: result.isSimulated,
          time: timeNow
        });
      } else if (testMessageType === 'agendamento') {
        const result = await sendAutomatedEmail({
          to: targetEmail,
          toName: testRecipientName || 'Paciente Teste',
          subject: '✅ [TESTE] Consulta Confirmada: Próxima Quarta às 14:00 - SIACS Clínica Escola',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; color: #2D3748; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; background: #FFFFFF;">
              <div style="border-bottom: 2px solid #62A032; padding-bottom: 12px; margin-bottom: 16px;">
                <h2 style="color: #62A032; margin: 0 0 4px 0; font-size: 20px;">SIACS • Consulta Agendada com Sucesso</h2>
                <p style="margin: 0; color: #033B6C; font-weight: bold; font-size: 13px;">Clínica Escola de Psicologia • Faculdade Campos Salles</p>
              </div>
              <p>Olá <strong>${testRecipientName || 'Paciente'}</strong>,</p>
              <p>Este é um disparo de teste que simula o e-mail oficial enviado aos pacientes após o agendamento de uma consulta clínica.</p>
              
              <div style="background: #F1F8E9; border-left: 4px solid #62A032; padding: 16px; margin: 20px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #2E7D32;">Detalhes do Atendimento Simulado:</h3>
                <p style="margin: 4px 0; font-size: 13px;">📅 <strong>Data:</strong> Quarta-feira, 26 de Agosto de 2026</p>
                <p style="margin: 4px 0; font-size: 13px;">⏰ <strong>Horário:</strong> 14:00 às 14:50 (Chegar com 10 min de antecedência)</p>
                <p style="margin: 4px 0; font-size: 13px;">👩‍⚕️ <strong>Profissional:</strong> Dra. Camila Andrade (CRP 06/123456)</p>
                <p style="margin: 4px 0; font-size: 13px;">🎓 <strong>Estagiário Clínico:</strong> Lucas Silveira (RA 2024.1.0092)</p>
                <p style="margin: 4px 0; font-size: 13px;">📍 <strong>Local:</strong> Consultório 03 &bull; Clínica Escola &bull; Rua Guairaca, 1004 - SP</p>
              </div>

              <p style="font-size: 12px; color: #718096;">
                Em caso de imprevisto ou necessidade de reagendamento, avise com no mínimo 24 horas de antecedência.
              </p>
              <div style="border-top: 1px solid #E2E8F0; margin-top: 24px; padding-top: 12px; font-size: 11px; color: #A0AEC0; text-align: center;">
                Disparo de teste realizado em ${dateNow} às ${timeNow} &bull; Módulo de E-mail SIACS
              </div>
            </div>
          `,
          text: `Consulta confirmada para Quarta-feira às 14:00 com Dra. Camila Andrade. Disparo de teste em ${dateNow} às ${timeNow}.`,
          type: 'confirmacao_agendamento'
        });

        setTestFeedback({
          success: result.success,
          message: result.message || `E-mail de confirmação de agendamento de teste despachado para ${targetEmail}!`,
          isSimulated: result.isSimulated,
          time: timeNow
        });
      } else {
        const result = await sendAutomatedEmail({
          to: targetEmail,
          toName: testRecipientName || 'Destinatário de Teste',
          subject: testCustomSubject,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; color: #2D3748; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; background: #FFFFFF;">
              <div style="border-bottom: 2px solid #033B6C; padding-bottom: 12px; margin-bottom: 16px;">
                <h2 style="color: #033B6C; margin: 0 0 4px 0; font-size: 20px;">SIACS • Comunicação Direta</h2>
                <p style="margin: 0; color: #62A032; font-weight: bold; font-size: 13px;">Faculdades Integradas Campos Salles &bull; Clínica Escola</p>
              </div>
              <p>Olá <strong>${testRecipientName || 'Usuário'}</strong>,</p>
              <div style="background: #FAFAFA; border: 1px solid #E2E8F0; padding: 16px; margin: 18px 0; border-radius: 8px; font-size: 13px; line-height: 1.6;">
                ${testCustomBody.replace(/\n/g, '<br/>')}
              </div>
              <div style="border-top: 1px solid #E2E8F0; margin-top: 24px; padding-top: 12px; font-size: 11px; color: #A0AEC0; text-align: center;">
                Disparo de teste personalizado enviado em ${dateNow} às ${timeNow} &bull; Módulo de E-mail SIACS
              </div>
            </div>
          `,
          text: testCustomBody,
          type: 'teste_conexao'
        });

        setTestFeedback({
          success: result.success,
          message: result.message || `Mensagem personalizada de teste despachada para ${targetEmail}!`,
          isSimulated: result.isSimulated,
          time: timeNow
        });
      }
    } catch (err: any) {
      setTestFeedback({
        success: false,
        message: `Falha ao processar o teste de envio: ${err.message || 'Erro inesperado'}`,
        time: timeNow
      });
    } finally {
      setIsSendingTest(false);
      setLogs(db.getEmailLogs());
    }
  };

  const filteredLogs = logs.filter(l => {
    const matchesSearch =
      l.destinatario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.destinatarioNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.assunto.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'recuperacao') return l.tipo === 'recuperacao_senha';
    if (filterType === 'agendamento') return l.tipo === 'confirmacao_agendamento';
    if (filterType === 'teste') return l.tipo === 'teste_conexao';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Info Banner com Botão de Testar Envio */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E1D8] shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#033B6C]/10 text-[#033B6C]">
              <Mail className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-[#033B6C] tracking-tight">
              Configurações do Servidor de E-mails (SMTP)
            </h2>
          </div>
          <p className="text-xs text-[#8E8D8A] mt-1">
            Gerencie as credenciais para disparo automático de comunicados, recuperação de senhas e confirmações de consulta.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              config.ativo ? 'bg-[#F1F8E9] text-[#2e7d32] border border-[#D0E3B6]' : 'bg-[#FDF0EE] text-[#c62828] border border-[#F7C4BE]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${config.ativo ? 'bg-[#2e7d32] animate-pulse' : 'bg-[#c62828]'}`} />
            {config.ativo ? 'Disparos Automáticos Ativos' : 'Disparos Desativados'}
          </span>

          {/* Botão de Destaque: Testar Envio de Mensagem */}
          <button
            type="button"
            id="btn-header-testar-envio"
            onClick={() => handleOpenTestModal('geral')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#62A032] hover:bg-[#508627] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Testar Envio de Mensagem</span>
          </button>
        </div>
      </div>

      {/* Guia Rápido de Configuração (Gmail App Password) */}
      <div className="bg-[#F8F5F0] border border-[#E5E1D8] rounded-2xl p-4.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#033B6C]">
            <HelpCircle className="w-4 h-4 text-[#62A032]" />
            <span>Como configurar envio real via Gmail / Google Workspace (Passo a Passo)</span>
          </div>
          <button
            type="button"
            onClick={() => setShowGmailHelp(!showGmailHelp)}
            className="text-xs font-bold text-[#033B6C] hover:underline flex items-center gap-1 cursor-pointer"
          >
            {showGmailHelp ? (
              <>Ocultar Guia <ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <>Ver Instruções <ChevronDown className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>

        {showGmailHelp && (
          <div className="pt-2 border-t border-[#E5E1D8] grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[#434343]">
            <div className="p-3 bg-white rounded-xl border border-[#E5E1D8] space-y-1">
              <strong className="text-[#033B6C] block">1. Ative a Verificação em 2 Etapas</strong>
              <p className="text-[11px] text-[#5C5C5C]">
                Acesse sua Conta Google (<a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-[#033B6C] underline font-bold inline-flex items-center gap-0.5">Segurança <ExternalLink className="w-2.5 h-2.5" /></a>) e certifique-se de que a Verificação em 2 Etapas está ativada.
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#E5E1D8] space-y-1">
              <strong className="text-[#033B6C] block">2. Gere uma Senha de Aplicativo</strong>
              <p className="text-[11px] text-[#5C5C5C]">
                Acesse <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-[#62A032] underline font-bold inline-flex items-center gap-0.5">Senhas de App <ExternalLink className="w-2.5 h-2.5" /></a>, digite o nome &quot;SIACS&quot; e clique em Criar.
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#E5E1D8] space-y-1">
              <strong className="text-[#033B6C] block">3. Cole a Senha de 16 Letras</strong>
              <p className="text-[11px] text-[#5C5C5C]">
                Copie o código de 16 caracteres gerado pelo Google e cole no campo &quot;Senha de Aplicativo&quot; abaixo. Em seguida clique em <strong>Salvar</strong> e depois em <strong>Testar Envio</strong>.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulário de Configuração SMTP */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSaveConfig} className="bg-white rounded-2xl p-6 border border-[#E5E1D8] shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-3">
              <h3 className="text-sm font-bold text-[#033B6C] uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-[#033B6C]" />
                Credenciais do Provedor de E-mail
              </h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#434343]">
                <input
                  type="checkbox"
                  checked={config.ativo}
                  onChange={(e) => setConfig({ ...config, ativo: e.target.checked })}
                  className="w-4 h-4 rounded text-[#033B6C] focus:ring-[#033B6C] accent-[#033B6C]"
                />
                Ativar Módulo de E-mail
              </label>
            </div>

            {/* Seleção do Método de Entrega */}
            <div className="p-3.5 bg-[#F8F5F0] rounded-xl border border-[#E5E1D8] space-y-2">
              <label className="text-xs font-bold text-[#033B6C] block">
                Método de Entrega / Rota de Disparo:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label
                  className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 text-xs font-semibold transition-all ${
                    (!config.metodoEnvio || config.metodoEnvio === 'smtp')
                      ? 'bg-white border-[#033B6C] text-[#033B6C] shadow-2xs font-bold'
                      : 'bg-[#FDFBF7] border-[#E5E1D8] text-[#5C5C5C] hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="metodoEnvio"
                    value="smtp"
                    checked={!config.metodoEnvio || config.metodoEnvio === 'smtp'}
                    onChange={() => setConfig({ ...config, metodoEnvio: 'smtp' })}
                    className="sr-only"
                  />
                  <Server className="w-4 h-4 text-[#033B6C] shrink-0" />
                  <div>
                    <div>SMTP Tradicional</div>
                    <div className="text-[10px] font-normal opacity-80">Gmail / Outlook (465/587)</div>
                  </div>
                </label>

                <label
                  className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 text-xs font-semibold transition-all ${
                    config.metodoEnvio === 'resend_api'
                      ? 'bg-[#F1F8E9] border-[#62A032] text-[#2E7D32] shadow-2xs font-bold'
                      : 'bg-[#FDFBF7] border-[#E5E1D8] text-[#5C5C5C] hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="metodoEnvio"
                    value="resend_api"
                    checked={config.metodoEnvio === 'resend_api'}
                    onChange={() => setConfig({ ...config, metodoEnvio: 'resend_api' })}
                    className="sr-only"
                  />
                  <Sparkles className="w-4 h-4 text-[#62A032] shrink-0" />
                  <div>
                    <div className="flex items-center gap-1">
                      <span>API Resend</span>
                      <span className="text-[9px] bg-[#62A032] text-white px-1 py-0.2 rounded font-bold">Recomendado</span>
                    </div>
                    <div className="text-[10px] font-normal opacity-80">Porta 443 HTTPS (Sem Bloqueio)</div>
                  </div>
                </label>

                <label
                  className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 text-xs font-semibold transition-all ${
                    config.metodoEnvio === 'brevo_api'
                      ? 'bg-[#EBF3FB] border-[#033B6C] text-[#033B6C] shadow-2xs font-bold'
                      : 'bg-[#FDFBF7] border-[#E5E1D8] text-[#5C5C5C] hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="metodoEnvio"
                    value="brevo_api"
                    checked={config.metodoEnvio === 'brevo_api'}
                    onChange={() => setConfig({ ...config, metodoEnvio: 'brevo_api' })}
                    className="sr-only"
                  />
                  <Mail className="w-4 h-4 text-[#033B6C] shrink-0" />
                  <div>
                    <div>API Brevo / Sendinblue</div>
                    <div className="text-[10px] font-normal opacity-80">Porta 443 HTTPS</div>
                  </div>
                </label>
              </div>

              {config.metodoEnvio && config.metodoEnvio !== 'smtp' && (
                <div className="pt-2 border-t border-[#E5E1D8] space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#033B6C] flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5" />
                      Chave de API ({config.metodoEnvio === 'resend_api' ? 'Resend API Key' : 'Brevo API Key'}) *
                    </label>
                    <a
                      href={config.metodoEnvio === 'resend_api' ? 'https://resend.com/api-keys' : 'https://app.brevo.com/settings/keys/api'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-[#62A032] hover:underline inline-flex items-center gap-1"
                    >
                      Obter Chave Grátis (1 min) <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="text"
                    required
                    value={config.apiKey || ''}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value.trim() })}
                    placeholder={config.metodoEnvio === 'resend_api' ? 're_123456789abcdef...' : 'xkeysib-123456789...'}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-mono text-[#434343] focus:outline-none focus:border-[#033B6C]"
                  />
                  <p className="text-[11px] text-[#8E8D8A]">
                    {config.metodoEnvio === 'resend_api'
                      ? 'O Resend permite enviar 3.000 e-mails/mês gratuitamente através da porta 443 (HTTPS), contornando qualquer bloqueio de porta do servidor em nuvem.'
                      : 'O Brevo permite enviar 300 e-mails/dia gratuitamente através da porta 443 (HTTPS).'}
                  </p>
                </div>
              )}
            </div>

            {/* Pré-configurações Rápidas (Presets) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#8E8D8A] block">
                Preenchimento Rápido por Provedor:
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('gmail')}
                  className="px-2.5 py-1 bg-[#F8F5F0] hover:bg-[#EAE5D9] text-[#033B6C] border border-[#E5E1D8] rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-[#EA4335]" />
                  <span>Gmail / Google (Porta 465 SSL)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyPreset('outlook')}
                  className="px-2.5 py-1 bg-[#F8F5F0] hover:bg-[#EAE5D9] text-[#033B6C] border border-[#E5E1D8] rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Server className="w-3.5 h-3.5 text-[#0078D4]" />
                  <span>Outlook / Office 365 (587 TLS)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyPreset('yahoo')}
                  className="px-2.5 py-1 bg-[#F8F5F0] hover:bg-[#EAE5D9] text-[#033B6C] border border-[#E5E1D8] rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Server className="w-3.5 h-3.5 text-[#6001D2]" />
                  <span>Yahoo Mail (465 SSL)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* E-mail Remetente */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-[#434343]">
                  E-mail Remetente (Conta do Sistema) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8E8D8A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={config.emailRemetente}
                    onChange={(e) => setConfig({ ...config, emailRemetente: e.target.value })}
                    placeholder="ex: siacs.atendimento@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl text-sm font-medium text-[#434343] focus:outline-none focus:border-[#033B6C]"
                  />
                </div>
                <p className="text-[11px] text-[#8E8D8A]">
                  E-mail institucional ou conta Gmail/Outlook que enviará os comunicados aos pacientes e usuários.
                </p>
              </div>

              {/* Nome de Exibição */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-[#434343]">
                  Nome de Exibição do Remetente
                </label>
                <input
                  type="text"
                  value={config.nomeRemetente}
                  onChange={(e) => setConfig({ ...config, nomeRemetente: e.target.value })}
                  placeholder="SIACS • Faculdades Integradas Campos Salles"
                  className="w-full px-3 py-2 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl text-sm font-medium text-[#434343] focus:outline-none focus:border-[#033B6C]"
                />
              </div>

              {/* Senha de Aplicativo / Senha SMTP */}
              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#434343] flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-[#033B6C]" />
                    Senha ou Senha de Aplicativo (App Password) *
                  </label>
                  <div className="flex items-center gap-3">
                    {config.senhaApp && (
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        config.senhaApp.replace(/[\s\r\n\t'"\u00A0\u200B]/g, '').length === 16
                          ? 'bg-[#F1F8E9] text-[#2e7d32] border border-[#D0E3B6]'
                          : 'bg-[#FBF4E6] text-[#b58d3d] border border-[#EED9B0]'
                      }`}>
                        {config.senhaApp.replace(/[\s\r\n\t'"\u00A0\u200B]/g, '').length} / 16 letras
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] font-bold text-[#033B6C] hover:underline cursor-pointer"
                    >
                      {showPassword ? 'Ocultar Senha' : 'Exibir Senha'}
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8E8D8A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={config.senhaApp}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfig({ ...config, senhaApp: val });
                    }}
                    placeholder="ex: abcd efgh ijkl mnop (16 letras)"
                    className="w-full pl-9 pr-24 py-2 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl text-sm font-mono text-[#434343] focus:outline-none focus:border-[#033B6C]"
                  />
                  {config.senhaApp && (
                    <button
                      type="button"
                      onClick={() => {
                        const cleaned = config.senhaApp.replace(/[\s\r\n\t'"\u00A0\u200B]/g, '').toLowerCase();
                        setConfig({ ...config, senhaApp: cleaned });
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-white hover:bg-[#EAE5D9] text-[#033B6C] border border-[#E5E1D8] text-[10px] font-bold rounded-lg cursor-pointer"
                      title="Remove espaços e formata as 16 letras"
                    >
                      Limpar Espaços
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-[#8E8D8A] flex items-center justify-between">
                  <span>Para contas Google/Gmail com autenticação em 2 etapas, utilize a <strong>Senha de Aplicativo (16 letras)</strong> gerada no Google.</span>
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#62A032] font-bold hover:underline inline-flex items-center gap-1 shrink-0 ml-2"
                  >
                    Gerar Senha de App <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </p>
              </div>

              {/* Servidor SMTP Host */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#434343]">Servidor SMTP (Host)</label>
                <input
                  type="text"
                  value={config.servidorSmtp}
                  onChange={(e) => setConfig({ ...config, servidorSmtp: e.target.value })}
                  placeholder="smtp.gmail.com"
                  className="w-full px-3 py-2 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl text-sm font-medium text-[#434343] focus:outline-none focus:border-[#033B6C]"
                />
              </div>

              {/* Porta */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#434343]">Porta de Conexão</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={config.porta}
                    onChange={(e) => setConfig({ ...config, porta: Number(e.target.value) })}
                    placeholder="465"
                    className="w-full px-3 py-2 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl text-sm font-medium text-[#434343] focus:outline-none focus:border-[#033B6C]"
                  />
                  <select
                    value={config.seguranca}
                    onChange={(e) => setConfig({ ...config, seguranca: e.target.value as any })}
                    className="px-3 py-2 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl text-xs font-bold text-[#434343] focus:outline-none focus:border-[#033B6C]"
                  >
                    <option value="ssl">SSL (465)</option>
                    <option value="tls">STARTTLS (587)</option>
                    <option value="none">Nenhuma</option>
                  </select>
                </div>
              </div>

              {/* Cópia Oculta para Auditoria (BCC) */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-[#434343]">
                  Cópia Oculta para a Coordenação (BCC - Opcional)
                </label>
                <input
                  type="email"
                  value={config.copiaOcultaAdmin || ''}
                  onChange={(e) => setConfig({ ...config, copiaOcultaAdmin: e.target.value })}
                  placeholder="coordenacao.clinica@faculdadecs.edu.br"
                  className="w-full px-3 py-2 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl text-sm font-medium text-[#434343] focus:outline-none focus:border-[#033B6C]"
                />
              </div>
            </div>

            {/* Gatilhos Automáticos */}
            <div className="border-t border-[#E5E1D8] pt-4 space-y-3">
              <h4 className="text-xs font-bold text-[#033B6C] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#62A032]" />
                Eventos com Disparo Automático Ativo
              </h4>

              <div className="space-y-2.5">
                <label className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-[#F8F5F0] transition-colors cursor-pointer border border-[#E5E1D8]/60">
                  <input
                    type="checkbox"
                    checked={config.disparoAutomaticoRecuperacao}
                    onChange={(e) => setConfig({ ...config, disparoAutomaticoRecuperacao: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded text-[#033B6C] focus:ring-[#033B6C] accent-[#033B6C]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#434343] block">
                      Disparar e-mail imediatamente na Recuperação de Senha
                    </span>
                    <span className="text-[11px] text-[#8E8D8A] block">
                      Envia o código de segurança e instruções quando o usuário solicita redefinição.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-[#F8F5F0] transition-colors cursor-pointer border border-[#E5E1D8]/60">
                  <input
                    type="checkbox"
                    checked={config.disparoAutomaticoAgendamento}
                    onChange={(e) => setConfig({ ...config, disparoAutomaticoAgendamento: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded text-[#033B6C] focus:ring-[#033B6C] accent-[#033B6C]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#434343] block">
                      Disparar e-mail de Confirmação de Consulta ao Paciente
                    </span>
                    <span className="text-[11px] text-[#8E8D8A] block">
                      Envia data, horário, nome do profissional, estagiário escalado e instruções da clínica.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Ações do Formulário com Botão Testar Envio */}
            <div className="pt-3 border-t border-[#E5E1D8] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="submit"
                  id="btn-salvar-smtp"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#033B6C] hover:bg-[#022b50] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-[#62A032]" />
                      Configurações Salvas!
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      {isSaving ? 'Salvando...' : 'Salvar Configurações SMTP'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  id="btn-form-testar-envio"
                  onClick={() => handleOpenTestModal('geral')}
                  className="px-4 py-2.5 bg-[#F8F5F0] hover:bg-[#EAE5D9] text-[#62A032] border border-[#D0E3B6] text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  title="Abrir painel de teste de envio de e-mails"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Testar Envio de Mensagem</span>
                </button>
              </div>

              {config.ultimoTesteData && (
                <span className="text-[11px] text-[#8E8D8A]">
                  Última validação: {new Date(config.ultimoTesteData).toLocaleString('pt-BR')}
                </span>
              )}
            </div>
          </form>

          {/* Painel Embutido de Teste de Disparo Rápido */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E1D8] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#033B6C] uppercase tracking-wider flex items-center gap-2">
                <Send className="w-4 h-4 text-[#62A032]" />
                Testar Envio de Mensagens em Tempo Real
              </h3>
              <span className="text-[11px] bg-[#F1F8E9] text-[#2E7D32] px-2.5 py-0.5 rounded-full font-bold border border-[#D0E3B6]">
                Validador Integrado
              </span>
            </div>
            
            <p className="text-xs text-[#5C5C5C]">
              Envie uma mensagem de teste para qualquer endereço de e-mail e verifique a entrega imediata:
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <input
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="Informe o e-mail de destino (ex: seu.email@gmail.com)"
                className="w-full px-3.5 py-2.5 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl text-xs font-medium text-[#434343] focus:outline-none focus:border-[#033B6C]"
              />
              <button
                type="button"
                id="btn-disparar-teste-rapido"
                onClick={() => handleExecuteSendTest()}
                disabled={isSendingTest}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#62A032] hover:bg-[#508627] text-white text-xs font-bold rounded-xl transition-all shrink-0 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isSendingTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Enviar Teste Agora
                  </>
                )}
              </button>
            </div>

            {/* Resultado do Teste */}
            {testFeedback && (
              <div
                className={`p-4 rounded-xl text-xs flex items-start gap-3 animate-in fade-in ${
                  testFeedback.success
                    ? 'bg-[#F1F8E9] text-[#2e7d32] border border-[#D0E3B6]'
                    : 'bg-[#FDF0EE] text-[#c62828] border border-[#F7C4BE]'
                }`}
              >
                {testFeedback.success ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#2E7D32]" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#C62828]" />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm">
                      {testFeedback.success ? 'Mensagem Enviada com Sucesso!' : 'Falha no Envio do Teste:'}
                    </strong>
                    {testFeedback.time && (
                      <span className="text-[10px] opacity-75">às {testFeedback.time}</span>
                    )}
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{testFeedback.message}</p>
                </div>
              </div>
            )}

            {/* Ações de Teste Específicas por Modelo */}
            <div className="pt-3 border-t border-[#E5E1D8] space-y-2">
              <span className="text-[11px] font-bold text-[#8E8D8A] block">
                Modelos de Notificação Prontos para Testar:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="btn-teste-modelo-recuperacao"
                  onClick={() => {
                    setTestMessageType('recuperacao');
                    handleOpenTestModal('recuperacao');
                  }}
                  className="px-3 py-1.5 bg-[#F8F5F0] hover:bg-[#EAE5D9] text-[#033B6C] border border-[#E5E1D8] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Testar Recuperação de Senha</span>
                </button>
                <button
                  type="button"
                  id="btn-teste-modelo-agendamento"
                  onClick={() => {
                    setTestMessageType('agendamento');
                    handleOpenTestModal('agendamento');
                  }}
                  className="px-3 py-1.5 bg-[#F8F5F0] hover:bg-[#EAE5D9] text-[#62A032] border border-[#E5E1D8] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CalendarCheck2 className="w-3.5 h-3.5" />
                  <span>Testar Confirmação de Consulta</span>
                </button>
                <button
                  type="button"
                  id="btn-teste-modelo-custom"
                  onClick={() => {
                    setTestMessageType('custom');
                    handleOpenTestModal('custom');
                  }}
                  className="px-3 py-1.5 bg-[#F8F5F0] hover:bg-[#EAE5D9] text-[#434343] border border-[#E5E1D8] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#B58D3D]" />
                  <span>Mensagem Personalizada...</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Histórico e Logs de Disparos Automáticos */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E5E1D8] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#033B6C] uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#033B6C]" />
                  Log de E-mails Disparados ({filteredLogs.length})
                </h3>
                <p className="text-[11px] text-[#8E8D8A]">Histórico em tempo real de envios automáticos</p>
              </div>

              {logs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Deseja limpar todo o histórico de logs de e-mail?')) {
                      db.clearEmailLogs();
                      setLogs([]);
                    }
                  }}
                  className="p-1.5 text-[#8E8D8A] hover:text-[#c62828] hover:bg-[#FDF0EE] rounded-lg transition-colors cursor-pointer"
                  title="Limpar logs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Barra de Busca e Filtro de Logs */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#8E8D8A] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar destinatário..."
                  className="w-full pl-8 pr-2 py-1.5 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl text-xs text-[#434343] focus:outline-none"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2 py-1.5 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl text-xs font-bold text-[#5C5C5C] focus:outline-none"
              >
                <option value="todos">Todos</option>
                <option value="recuperacao">Recuperação</option>
                <option value="agendamento">Agendamento</option>
                <option value="teste">Teste</option>
              </select>
            </div>

            {/* Lista de Logs */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedLogForPreview(log)}
                  className="p-3 bg-[#F8F5F0] hover:bg-[#F2ECE1] transition-all rounded-xl border border-[#E5E1D8] cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.status === 'falha'
                          ? 'bg-[#FDF0EE] text-[#c62828] border border-[#F7C4BE]'
                          : log.tipo === 'recuperacao_senha'
                          ? 'bg-[#FBF4E6] text-[#b58d3d] border border-[#EED9B0]'
                          : log.tipo === 'confirmacao_agendamento'
                          ? 'bg-[#F1F8E9] text-[#2e7d32] border border-[#D0E3B6]'
                          : 'bg-[#033B6C]/10 text-[#033B6C]'
                      }`}
                    >
                      {log.status === 'falha'
                        ? '❌ Falha'
                        : log.tipo === 'recuperacao_senha'
                        ? '🔐 Recuperação'
                        : log.tipo === 'confirmacao_agendamento'
                        ? '✅ Agendamento'
                        : '🧪 Teste'}
                    </span>
                    <span className="text-[10px] text-[#8E8D8A]">
                      {new Date(log.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {new Date(log.dataHora).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-[#434343] truncate">
                    {log.destinatarioNome || log.destinatario}
                  </p>
                  <p className="text-[11px] text-[#8E8D8A] truncate">{log.assunto}</p>

                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className={`font-semibold flex items-center gap-1 ${
                      log.status === 'falha' ? 'text-[#c62828]' : 'text-[#2e7d32]'
                    }`}>
                      {log.status === 'falha' ? (
                        <>
                          <AlertCircle className="w-3 h-3 text-[#c62828]" />
                          Erro no Disparo
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-[#2e7d32]" />
                          Entregue
                        </>
                      )}
                    </span>
                    <span className="text-[#033B6C] font-bold hover:underline flex items-center gap-0.5">
                      <Eye className="w-3 h-3" /> Ver Mensagem
                    </span>
                  </div>
                </div>
              ))}

              {filteredLogs.length === 0 && (
                <div className="p-8 text-center text-xs text-[#8E8D8A]">
                  Nenhum e-mail registrado com os filtros atuais.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DEDICADO: TESTAR ENVIO DE MENSAGENS */}
      {isTestModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E5E1D8] flex flex-col max-h-[92vh] animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-[#033B6C] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#62A032] rounded-xl text-white">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Testar Envio de Mensagem</h3>
                  <p className="text-xs text-white/80">Simulador & Validador de Disparo SMTP</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleExecuteSendTest} className="p-6 space-y-4 overflow-y-auto flex-1 text-[#434343]">
              
              {/* Escolha do Modelo */}
              <div>
                <label className="block text-xs font-bold text-[#434343] mb-1.5">
                  Selecione o Tipo de Mensagem para Testar:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTestMessageType('geral')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      testMessageType === 'geral'
                        ? 'bg-[#EBF3FB] border-[#033B6C] text-[#033B6C]'
                        : 'bg-[#F8F5F0] border-[#E5E1D8] text-[#5C5C5C] hover:bg-[#F2ECE1]'
                    }`}
                  >
                    <MailCheck className="w-4 h-4 text-[#033B6C]" />
                    <span>Teste Geral SMTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTestMessageType('agendamento')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      testMessageType === 'agendamento'
                        ? 'bg-[#F1F8E9] border-[#62A032] text-[#2E7D32]'
                        : 'bg-[#F8F5F0] border-[#E5E1D8] text-[#5C5C5C] hover:bg-[#F2ECE1]'
                    }`}
                  >
                    <CalendarCheck2 className="w-4 h-4 text-[#62A032]" />
                    <span>Consulta Agendada</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTestMessageType('recuperacao')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      testMessageType === 'recuperacao'
                        ? 'bg-[#FBF4E6] border-[#B58D3D] text-[#B58D3D]'
                        : 'bg-[#F8F5F0] border-[#E5E1D8] text-[#5C5C5C] hover:bg-[#F2ECE1]'
                    }`}
                  >
                    <Lock className="w-4 h-4 text-[#B58D3D]" />
                    <span>Recuperação Senha</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTestMessageType('custom')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      testMessageType === 'custom'
                        ? 'bg-[#F3E8FF] border-[#9333EA] text-[#9333EA]'
                        : 'bg-[#F8F5F0] border-[#E5E1D8] text-[#5C5C5C] hover:bg-[#F2ECE1]'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-[#9333EA]" />
                    <span>Personalizada</span>
                  </button>
                </div>
              </div>

              {/* Destinatário */}
              <div>
                <label className="block text-xs font-bold text-[#434343] mb-1">
                  E-mail de Destino (Recebedor do Teste) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8E8D8A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    placeholder="ex: seu.email@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl text-xs font-medium text-[#434343] focus:outline-none focus:border-[#033B6C]"
                  />
                </div>
                {currentUser?.email && testRecipient !== currentUser.email && (
                  <button
                    type="button"
                    onClick={() => setTestRecipient(currentUser.email)}
                    className="text-[11px] text-[#033B6C] font-semibold hover:underline mt-1 block cursor-pointer"
                  >
                    Usar meu e-mail atual ({currentUser.email})
                  </button>
                )}
              </div>

              {/* Nome do Destinatário */}
              <div>
                <label className="block text-xs font-bold text-[#434343] mb-1">
                  Nome do Destinatário
                </label>
                <input
                  type="text"
                  value={testRecipientName}
                  onChange={(e) => setTestRecipientName(e.target.value)}
                  placeholder="Nome exibido na saudação"
                  className="w-full px-3 py-2 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl text-xs font-medium text-[#434343] focus:outline-none focus:border-[#033B6C]"
                />
              </div>

              {/* Campos customizados se selecionado 'custom' */}
              {testMessageType === 'custom' && (
                <div className="space-y-3 pt-2 border-t border-[#E5E1D8]">
                  <div>
                    <label className="block text-xs font-bold text-[#434343] mb-1">
                      Assunto da Mensagem *
                    </label>
                    <input
                      type="text"
                      required
                      value={testCustomSubject}
                      onChange={(e) => setTestCustomSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl text-xs font-medium text-[#434343] focus:outline-none focus:border-[#033B6C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#434343] mb-1">
                      Corpo da Mensagem de Teste *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={testCustomBody}
                      onChange={(e) => setTestCustomBody(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl text-xs font-medium text-[#434343] focus:outline-none focus:border-[#033B6C] leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Feedback no Modal */}
              {testFeedback && (
                <div className="space-y-3">
                  <div
                    className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                      testFeedback.success
                        ? 'bg-[#F1F8E9] text-[#2e7d32] border border-[#D0E3B6]'
                        : 'bg-[#FDF0EE] text-[#c62828] border border-[#F7C4BE]'
                    }`}
                  >
                    {testFeedback.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#2E7D32]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C62828]" />
                    )}
                    <div>
                      <strong>{testFeedback.success ? 'Sucesso no Envio!' : 'Status do Disparo:'}</strong>
                      <p className="mt-0.5 leading-relaxed whitespace-pre-wrap">{testFeedback.message}</p>
                    </div>
                  </div>

                  {/* Ações Alternativas de Disparo Imediato */}
                  <div className="p-3 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[#033B6C] font-bold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#62A032]" />
                        Disparo Alternativo 1-Clique (Webmail):
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(testRecipient)}&su=${encodeURIComponent(testCustomSubject)}&body=${encodeURIComponent(testCustomBody)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-white hover:bg-[#EAE5D9] text-[#033B6C] border border-[#CBD5E1] rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#EA4335]" />
                        Abrir Gmail Webmail
                      </a>

                      <a
                        href={`https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(testRecipient)}&subject=${encodeURIComponent(testCustomSubject)}&body=${encodeURIComponent(testCustomBody)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-white hover:bg-[#EAE5D9] text-[#033B6C] border border-[#CBD5E1] rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#0078D4]" />
                        Abrir Outlook Web
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#E5E1D8] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#5C5C5C] hover:bg-[#F8F5F0] rounded-xl transition-colors cursor-pointer"
                >
                  Fechar
                </button>

                <button
                  type="submit"
                  id="btn-modal-confirmar-disparo"
                  disabled={isSendingTest}
                  className="px-6 py-2.5 bg-[#62A032] hover:bg-[#508627] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSendingTest ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Disparando Mensagem...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Disparar Mensagem de Teste
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Pré-visualização do E-mail Enviado */}
      {selectedLogForPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E5E1D8] flex flex-col max-h-[90vh]">
            <div className="bg-[#033B6C] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#62A032]" />
                <h3 className="font-bold text-sm">Visualização do E-mail Enviado</h3>
              </div>
              <button
                onClick={() => setSelectedLogForPreview(null)}
                className="p-1 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#F8F5F0] border-b border-[#E5E1D8] text-xs space-y-1 text-[#434343]">
              <p><strong>Destinatário:</strong> {selectedLogForPreview.destinatarioNome} &lt;{selectedLogForPreview.destinatario}&gt;</p>
              <p><strong>Assunto:</strong> {selectedLogForPreview.assunto}</p>
              <p><strong>Data/Hora:</strong> {new Date(selectedLogForPreview.dataHora).toLocaleString('pt-BR')}</p>
              {selectedLogForPreview.detalhes && (
                <p className={`text-[11px] font-semibold ${selectedLogForPreview.status === 'falha' ? 'text-[#c62828]' : 'text-[#8E8D8A]'}`}>
                  <strong>Status / Detalhes:</strong> {selectedLogForPreview.detalhes}
                </p>
              )}
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-white">
              <div
                className="border border-[#E5E1D8] rounded-xl p-4 text-xs bg-[#FAFAFA]"
                dangerouslySetInnerHTML={{ __html: selectedLogForPreview.corpoHtml }}
              />
            </div>

            <div className="p-4 border-t border-[#E5E1D8] bg-[#F8F5F0] flex justify-end">
              <button
                onClick={() => setSelectedLogForPreview(null)}
                className="px-5 py-2 bg-[#033B6C] text-white font-bold text-xs rounded-xl hover:bg-[#022b50] transition-colors cursor-pointer"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
