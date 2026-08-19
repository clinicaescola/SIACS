import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { UsersTab } from './UsersTab';
import { OverviewTab } from './OverviewTab';
import { AgendamentosTab } from './AgendamentosTab';
import { AddUserModal } from './AddUserModal';
import { AdminEditUserModal } from './AdminEditUserModal';
import { HorasEstagioDashboard } from './HorasEstagioDashboard';
import { AtribuirEstagiarioModal } from './AtribuirEstagiarioModal';
import { BackupRestoreModal } from './BackupRestoreModal';
import { RelatorioAtendimentosModal } from './RelatorioAtendimentosModal';
import { PendingProfissionaisBanner } from './PendingProfissionaisBanner';
import { AdminEmailConfigView } from './AdminEmailConfigView';
import { AnamnesePsicologiaPrintModal } from './AnamnesePsicologiaPrintModal';
import { AcompanhamentoPrintModal } from './AcompanhamentoPrintModal';
import {
  AppUser,
  Agendamento,
  Anamnese,
  Acompanhamento,
  Avaliacao,
  NotificacaoDisparo
} from '../types';
import {
  Shield,
  Users,
  Calendar,
  FileText,
  Activity,
  Plus,
  Send,
  ExternalLink,
  Award,
  MailCheck,
  Printer,
  ClipboardList,
  FileCheck2
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'agendamentos' | 'horas-estagio' | 'anamneses' | 'notificacoes' | 'email-config'>('overview');
  const [isAnamnesePrintModalOpen, setIsAnamnesePrintModalOpen] = useState<boolean>(false);
  const [isAcompPrintModalOpen, setIsAcompPrintModalOpen] = useState<boolean>(false);
  const [selectedPacienteIdForPrint, setSelectedPacienteIdForPrint] = useState<string | undefined>();

  // Data state
  const [users, setUsers] = useState<AppUser[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [anamneses, setAnamneses] = useState<Anamnese[]>([]);
  const [acompanhamentos, setAcompanhamentos] = useState<Acompanhamento[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [notificacoes, setNotificacoes] = useState<NotificacaoDisparo[]>([]);

  // Modals
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [agendamentoParaAtribuir, setAgendamentoParaAtribuir] = useState<Agendamento | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [isRelatorioModalOpen, setIsRelatorioModalOpen] = useState<boolean>(false);

  const refreshAllData = () => {
    setUsers(db.getAllUsers());
    setAgendamentos(db.getAgendamentos());
    setAnamneses(db.getAnamneses());
    setAcompanhamentos(db.getAcompanhamentos());
    setAvaliacoes(db.getAvaliacoes());
    setNotificacoes(db.getNotificacoes());
  };

  useEffect(() => {
    refreshAllData();
    const unsub = db.subscribe(refreshAllData);

    const handleCustomNav = (e: Event) => {
      const customEvent = e as CustomEvent<{ tabId: string }>;
      const tabId = customEvent.detail?.tabId;
      if (!tabId) return;

      if (tabId === 'admin-tab-users') setActiveTab('users');
      else if (tabId === 'admin-tab-supervisao' || tabId === 'admin-tab-agendamentos') setActiveTab('agendamentos');
      else if (tabId === 'admin-tab-horas') setActiveTab('horas-estagio');
      else if (tabId === 'admin-tab-anamneses' || tabId === 'admin-tab-acompanhamentos') setActiveTab('anamneses');
      else if (tabId === 'admin-tab-avaliacoes' || tabId === 'admin-tab-overview') setActiveTab('overview');
      else if (tabId === 'admin-tab-email-config') setActiveTab('email-config');
      else if (tabId === 'admin-tab-notificacoes') setActiveTab('notificacoes');
      else if (tabId === 'admin-tab-horarios') setActiveTab('agendamentos');
    };

    window.addEventListener('siacs-navigate-tab', handleCustomNav);

    return () => {
      unsub();
      window.removeEventListener('siacs-navigate-tab', handleCustomNav);
    };
  }, []);

  const handleDeleteUser = (user: AppUser) => {
    if (user.role === 'admin' || user.id.startsWith('admin-')) {
      alert('O usuário Administrador não pode ser excluído do sistema por motivos de segurança e governança.');
      return;
    }
    if (user.id === currentUser?.id) {
      alert('Você não pode excluir seu próprio usuário administrador!');
      return;
    }
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${user.nome}" (${user.role})? Esta ação removerá seus acessos.`)) {
      try {
        db.deleteUser(user.id);
        refreshAllData();
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir usuário.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#F8F5F0] border border-[#E5E1D8] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EDE8F5] text-[#5E35B1] border border-[#D1C4E9]">
              <Shield className="w-3.5 h-3.5" /> Painel da Administração Geral
            </span>
            <span className="text-xs text-[#8E8D8A]">Clínica Escola Integrada</span>
          </div>
          <h1 className="font-serif font-bold text-2xl text-[#434343]">
            Coordenação e Governança Clínica
          </h1>
          <p className="text-sm text-[#5C5C5C] mt-0.5">
            Gestão completa de usuários, escalas de estágio, supervisão de atendimentos, prontuários e auditoria.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            id="admin-relatorios-btn"
            onClick={() => setIsRelatorioModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#EAE7DC] text-[#434343] border border-[#E5E1D8] text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
            title="Emitir relatórios de atendimentos realizados, perdidos e não confirmados"
          >
            <FileText className="w-4 h-4 text-[#82954B]" />
            <span>Relatórios</span>
          </button>

          <button
            id="admin-add-user-btn"
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#82954B] hover:bg-[#6F803E] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Usuário
          </button>
        </div>
      </div>

      {/* Flashing Pending Professionals Alert Banner */}
      <PendingProfissionaisBanner currentUser={currentUser} onUpdate={refreshAllData} />

      {/* Navigation Tabs with Matching IDs for Navbar Dropdown */}
      <div className="flex border-b border-[#E5E1D8] overflow-x-auto gap-2 text-sm font-medium">
        <button
          id="admin-tab-overview"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'border-[#82954B] text-[#82954B]'
              : 'border-transparent text-[#5C5C5C] hover:text-[#434343]'
          }`}
        >
          <Activity className="w-4 h-4" />
          Visão Geral & Indicadores
        </button>

        <button
          id="admin-tab-users"
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'users'
              ? 'border-[#82954B] text-[#82954B]'
              : 'border-transparent text-[#5C5C5C] hover:text-[#434343]'
          }`}
        >
          <Users className="w-4 h-4" />
          Gestão de Usuários ({users.length})
        </button>

        <button
          id="admin-tab-supervisao"
          onClick={() => setActiveTab('agendamentos')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'agendamentos'
              ? 'border-[#82954B] text-[#82954B]'
              : 'border-transparent text-[#5C5C5C] hover:text-[#434343]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Agendamentos Globais ({agendamentos.length})
        </button>

        <button
          id="admin-tab-horas"
          onClick={() => setActiveTab('horas-estagio')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'horas-estagio'
              ? 'border-[#82954B] text-[#82954B]'
              : 'border-transparent text-[#5C5C5C] hover:text-[#434343]'
          }`}
        >
          <Award className="w-4 h-4" />
          Horas de Estágio (Dashboard)
        </button>

        <button
          id="admin-tab-anamneses"
          onClick={() => setActiveTab('anamneses')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'anamneses'
              ? 'border-[#82954B] text-[#82954B]'
              : 'border-transparent text-[#5C5C5C] hover:text-[#434343]'
          }`}
        >
          <FileText className="w-4 h-4" />
          Prontuários & Anamneses ({anamneses.length})
        </button>

        <button
          id="admin-tab-notificacoes"
          onClick={() => setActiveTab('notificacoes')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'notificacoes'
              ? 'border-[#82954B] text-[#82954B]'
              : 'border-transparent text-[#5C5C5C] hover:text-[#434343]'
          }`}
        >
          <Send className="w-4 h-4" />
          Auditoria de Disparos ({notificacoes.length})
        </button>

        <button
          id="admin-tab-email-config"
          onClick={() => setActiveTab('email-config')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'email-config'
              ? 'border-[#82954B] text-[#82954B]'
              : 'border-transparent text-[#5C5C5C] hover:text-[#434343]'
          }`}
        >
          <MailCheck className="w-4 h-4" />
          Configuração de E-mail (SMTP)
        </button>
      </div>

      {/* Hidden Anchor Elements for Navbar compatibility */}
      <div className="hidden">
        <button id="admin-tab-acompanhamentos" onClick={() => setActiveTab('anamneses')} />
        <button id="admin-tab-avaliacoes" onClick={() => setActiveTab('overview')} />
        <button id="admin-tab-horarios" onClick={() => setActiveTab('agendamentos')} />
      </div>

      {/* TAB 1: VISÃO GERAL (Modularizado em OverviewTab) */}
      {activeTab === 'overview' && (
        <OverviewTab
          users={users}
          agendamentos={agendamentos}
          anamneses={anamneses}
          acompanhamentos={acompanhamentos}
          avaliacoes={avaliacoes}
          onChangeTab={setActiveTab}
        />
      )}

      {/* TAB 2: GESTÃO DE USUÁRIOS (Modularizado em UsersTab) */}
      {activeTab === 'users' && (
        <UsersTab
          users={users}
          currentUser={currentUser}
          onEditUser={(u) => setEditingUser(u)}
          onDeleteUser={handleDeleteUser}
          onOpenAddUser={() => setIsAddUserModalOpen(true)}
          onRefresh={refreshAllData}
        />
      )}

      {/* TAB 3: AGENDAMENTOS GLOBAIS (Modularizado em AgendamentosTab) */}
      {activeTab === 'agendamentos' && (
        <AgendamentosTab
          agendamentos={agendamentos}
          onRefresh={refreshAllData}
          onAtribuirEstagiario={(a) => setAgendamentoParaAtribuir(a)}
        />
      )}

      {/* TAB: HORAS DE ESTÁGIO DASHBOARD */}
      {activeTab === 'horas-estagio' && (
        <HorasEstagioDashboard currentRole="admin" />
      )}

      {/* TAB 4: PRONTUÁRIOS & ANAMNESES */}
      {activeTab === 'anamneses' && (
        <div className="bg-[#FDFBF7] border border-[#E5E1D8] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif font-bold text-xl text-[#434343]">Prontuários e Anamneses da Clínica Escola</h2>
              <p className="text-xs text-[#8E8D8A]">Auditoria clínica, histórico dos pacientes e relatórios de acompanhamento.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => {
                  setSelectedPacienteIdForPrint(undefined);
                  setIsAnamnesePrintModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#033B6C] hover:bg-[#022849] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Anamnese (Psicologia)</span>
              </button>

              <button
                onClick={() => {
                  setSelectedPacienteIdForPrint(undefined);
                  setIsAcompPrintModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#82954B] hover:bg-[#6D7D3F] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Imprimir Ficha de Acompanhamento</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {anamneses.map(an => (
              <div
                key={an.id}
                className="bg-[#F8F5F0] border border-[#E5E1D8] p-5 rounded-xl space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5E1D8] gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-base text-[#434343]">{an.pacienteNome}</h4>
                      <span className="text-xs font-mono font-bold text-[#033B6C] bg-[#EBF3FB] px-2.5 py-0.5 rounded-md border border-[#B3D4F5]">
                        {an.numeroProntuario || db.getNumeroProntuarioPaciente(an.pacienteId)}
                      </span>
                    </div>
                    <p className="text-[#8E8D8A] mt-0.5">
                      Idade: {an.idade} anos • Profissão: {an.profissao || 'Não informada'} • Estado Civil: {an.estadoCivil}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedPacienteIdForPrint(an.pacienteId);
                        setIsAnamnesePrintModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#033B6C] border border-[#CBD5E0] hover:bg-[#EAE7DC] rounded-lg font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                      title="Imprimir prontuário completo de psicologia deste paciente"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Anamnese</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPacienteIdForPrint(an.pacienteId);
                        setIsAcompPrintModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#82954B] border border-[#D0E3B6] hover:bg-[#EAE7DC] rounded-lg font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                      title="Imprimir histórico de acompanhamento e sessões clínicas"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-[#82954B]" />
                      <span>Acompanhamento</span>
                    </button>
                    <div className="text-right text-[11px] text-[#8E8D8A]">
                      <span>Registrado em: {an.dataRegistro}</span>
                      <p className="text-[#82954B] font-semibold">{an.profissionalNome} {an.estagiarioNome ? `• ${an.estagiarioNome}` : ''}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <strong className="text-[#434343]">Principais Queixas:</strong>
                  <p className="text-[#5C5C5C] mt-0.5 leading-relaxed bg-[#FDFBF7] p-3 rounded-lg border border-[#E5E1D8]">
                    {an.principaisQueixas}
                  </p>
                </div>

                <div>
                  <strong className="text-[#434343]">Observações Clínicas & Hipótese Diagnóstica:</strong>
                  <p className="text-[#5C5C5C] mt-0.5 leading-relaxed bg-[#FDFBF7] p-3 rounded-lg border border-[#E5E1D8]">
                    {an.observacoes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AUDITORIA DE NOTIFICAÇÕES */}
      {activeTab === 'notificacoes' && (
        <div className="bg-[#FDFBF7] border border-[#E5E1D8] rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="font-serif font-bold text-xl text-[#434343]">Auditoria de Disparos (E-mail & WhatsApp)</h2>
            <p className="text-xs text-[#8E8D8A]">Histórico detalhado de todas as confirmações e lembretes enviados aos envolvidos.</p>
          </div>

          <div className="space-y-3">
            {notificacoes.map(n => (
              <div
                key={n.id}
                className="bg-[#F8F5F0] border border-[#E5E1D8] p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#434343]">{n.assunto}</span>
                    <span className="text-[10px] bg-[#EAE7DC] text-[#5C5C5C] px-2 py-0.5 rounded uppercase font-semibold">
                      {n.destinatarioTipo}
                    </span>
                  </div>
                  <p className="text-[#5C5C5C] mt-0.5">
                    <strong>Destinatário:</strong> {n.destinatarioNome} ({n.destinatarioEmail || n.destinatarioTelefone})
                  </p>
                  <p className="text-[#8E8D8A] mt-0.5 italic">
                    "{n.conteudoTexto}"
                  </p>
                  <p className="text-[10px] text-[#8E8D8A] mt-1">
                    Enviado em: {new Date(n.dataEnvio).toLocaleString('pt-BR')}
                  </p>
                </div>

                {n.whatsappUrl && (
                  <a
                    href={n.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-semibold hover:bg-[#20bd5a] transition-colors self-start md:self-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir no WhatsApp
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: CONFIGURAÇÃO DE E-MAIL SMTP */}
      {activeTab === 'email-config' && (
        <AdminEmailConfigView />
      )}

      {/* Modal Modularizado: Cadastrar Novo Usuário (Admin) */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserCreated={refreshAllData}
      />

      {/* Admin Edit Any User Modal */}
      <AdminEditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onSuccess={refreshAllData}
      />

      {/* Atribuir Estagiário Modal */}
      <AtribuirEstagiarioModal
        isOpen={!!agendamentoParaAtribuir}
        onClose={() => setAgendamentoParaAtribuir(null)}
        agendamento={agendamentoParaAtribuir}
        onSuccess={refreshAllData}
      />

      {/* Backup & Restauração Modal */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />

      {/* Relatório Imprimível de Atendimentos */}
      <RelatorioAtendimentosModal
        isOpen={isRelatorioModalOpen}
        onClose={() => setIsRelatorioModalOpen(false)}
        orientadorNome={currentUser?.nome || 'Administração Geral'}
      />

      {/* Formulário Imprimível de Anamnese Psicológica */}
      <AnamnesePsicologiaPrintModal
        isOpen={isAnamnesePrintModalOpen}
        onClose={() => {
          setIsAnamnesePrintModalOpen(false);
          setSelectedPacienteIdForPrint(undefined);
        }}
        initialPacienteId={selectedPacienteIdForPrint}
      />

      {/* Formulário Imprimível de Acompanhamento Clínico */}
      <AcompanhamentoPrintModal
        isOpen={isAcompPrintModalOpen}
        onClose={() => {
          setIsAcompPrintModalOpen(false);
          setSelectedPacienteIdForPrint(undefined);
        }}
        initialPacienteId={selectedPacienteIdForPrint}
      />
    </div>
  );
};
