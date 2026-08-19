import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import {
  AppUser,
  OrientadorUser,
  Agendamento,
  Anamnese,
  Acompanhamento,
  Avaliacao,
  ProfissionalUser,
  EstagiarioUser,
  PacienteUser
} from '../types';
import {
  Shield,
  GraduationCap,
  Stethoscope,
  Users,
  Calendar,
  FileText,
  FileCheck2,
  Star,
  CheckCircle,
  Clock,
  Search,
  BookOpen,
  ClipboardList,
  Award,
  Printer
} from 'lucide-react';
import { AnamneseModal } from './AnamneseModal';
import { AcompanhamentoModal } from './AcompanhamentoModal';
import { HorasEstagioDashboard } from './HorasEstagioDashboard';
import { AtribuirEstagiarioModal } from './AtribuirEstagiarioModal';
import { AdminEditUserModal } from './AdminEditUserModal';
import { RelatorioAtendimentosModal } from './RelatorioAtendimentosModal';
import { PendingProfissionaisBanner } from './PendingProfissionaisBanner';
import { UserAvatar } from './UserAvatar';
import { EditProfileModal } from './EditProfileModal';
import { AnamnesePsicologiaPrintModal } from './AnamnesePsicologiaPrintModal';
import { Edit3, UserCheck, Edit, CheckCircle2 } from 'lucide-react';

export const OrientadorView: React.FC = () => {
  const { currentUser } = useAuth();
  const orientUser = currentUser as OrientadorUser;

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [anamneses, setAnamneses] = useState<Anamnese[]>([]);
  const [acompanhamentos, setAcompanhamentos] = useState<Acompanhamento[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [profissionais, setProfissionais] = useState<ProfissionalUser[]>([]);
  const [estagiarios, setEstagiarios] = useState<EstagiarioUser[]>([]);
  const [pacientes, setPacientes] = useState<PacienteUser[]>([]);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [isRelatorioModalOpen, setIsRelatorioModalOpen] = useState<boolean>(false);
  const [isAnamnesePrintModalOpen, setIsAnamnesePrintModalOpen] = useState<boolean>(false);
  const [selectedPacienteIdForPrint, setSelectedPacienteIdForPrint] = useState<string | undefined>();

  // Search/Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'supervisao' | 'horas' | 'anamneses' | 'acompanhamentos' | 'avaliacoes' | 'equipe'>('supervisao');

  // Modals
  const [selectedPacienteIdForAnamnese, setSelectedPacienteIdForAnamnese] = useState<string | null>(null);
  const [selectedPacienteIdForAcomp, setSelectedPacienteIdForAcomp] = useState<string | null>(null);
  const [agendamentoParaAtribuir, setAgendamentoParaAtribuir] = useState<Agendamento | null>(null);
  const [userParaEditar, setUserParaEditar] = useState<AppUser | null>(null);

  const refreshData = () => {
    setAgendamentos(db.getAgendamentos());
    setAnamneses(db.getAnamneses());
    setAcompanhamentos(db.getAcompanhamentos());
    setAvaliacoes(db.getAvaliacoes());
    setProfissionais(db.getProfissionais());
    setEstagiarios(db.getEstagiarios());
    setPacientes(db.getPacientes());
  };

  useEffect(() => {
    refreshData();
    const unsub = db.subscribe(refreshData);

    const handleCustomNav = (e: Event) => {
      const customEvent = e as CustomEvent<{ tabId: string }>;
      const tabId = customEvent.detail?.tabId;
      if (!tabId) return;

      if (tabId === 'orient-tab-supervisao') setActiveTab('supervisao');
      else if (tabId === 'orient-tab-horas') setActiveTab('horas');
      else if (tabId === 'orient-tab-anamneses') setActiveTab('anamneses');
      else if (tabId === 'orient-tab-acompanhamentos' || tabId === 'orient-tab-acomp') setActiveTab('acompanhamentos');
      else if (tabId === 'orient-tab-avaliacoes') setActiveTab('avaliacoes');
      else if (tabId === 'orient-tab-equipe') setActiveTab('equipe');
    };

    window.addEventListener('siacs-navigate-tab', handleCustomNav);

    return () => {
      unsub();
      window.removeEventListener('siacs-navigate-tab', handleCustomNav);
    };
  }, []);

  const filteredAgendamentos = agendamentos.filter(a => {
    const term = searchTerm.toLowerCase();
    return (
      a.pacienteNome.toLowerCase().includes(term) ||
      a.profissionalNome.toLowerCase().includes(term) ||
      (a.estagiarioNome && a.estagiarioNome.toLowerCase().includes(term))
    );
  });

  const mediaGeralClinica = avaliacoes.length > 0
    ? (avaliacoes.reduce((acc, a) => acc + a.notaGeral, 0) / avaliacoes.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6 text-[#434343]">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E1D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar
            src={orientUser.foto}
            alt={orientUser.nome}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#B58D3D]/30"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-bold text-[#434343]">{orientUser.nome}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FBF4E6] text-[#B58D3D] border border-[#EED9B0]">
                Orientadora de Estágio
              </span>
              <button
                id="orient-edit-profile-btn"
                onClick={() => setIsEditProfileOpen(true)}
                className="ml-1 p-1 text-[#8E8D8A] hover:text-[#B58D3D] hover:bg-[#FBF4E6] rounded-lg transition-colors cursor-pointer"
                title="Editar meu cadastro (senha, e-mail e foto)"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs font-semibold text-[#82954B] mt-0.5">
              {orientUser.departamento || 'Coordenação de Estágios Supervisionados em Psicologia'}
            </p>
            <p className="text-xs text-[#8E8D8A]">
              CPF: {orientUser.cpf} • {orientUser.email} • {orientUser.telefone}
            </p>
          </div>
        </div>

        {/* Global KPIs & Botão de Relatórios */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            id="btn-abrir-relatorios-orientador"
            onClick={() => setIsRelatorioModalOpen(true)}
            className="px-4 py-3 bg-[#0A3B66] hover:bg-[#063860] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            title="Emitir relatórios de atendimentos realizados, não confirmados e perdidos"
          >
            <Printer className="w-4 h-4" />
            <span>Relatórios</span>
          </button>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#F8F5F0] p-2.5 rounded-xl border border-[#E5E1D8]">
              <p className="text-[11px] text-[#8E8D8A]">Total Consultas</p>
              <p className="text-base font-serif font-bold text-[#434343]">{agendamentos.length}</p>
            </div>
            <div className="bg-[#F8F5F0] p-2.5 rounded-xl border border-[#E5E1D8]">
              <p className="text-[11px] text-[#8E8D8A]">Estagiários</p>
              <p className="text-base font-serif font-bold text-[#82954B]">{estagiarios.length}</p>
            </div>
            <div className="bg-[#F8F5F0] p-2.5 rounded-xl border border-[#E5E1D8]">
              <p className="text-[11px] text-[#8E8D8A]">Satisfação</p>
              <div className="flex items-center justify-center gap-0.5 text-[#B58D3D] font-bold">
                <Star className="w-3.5 h-3.5 fill-[#B58D3D]" />
                <span className="text-[#434343] text-sm font-serif">{mediaGeralClinica}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flashing Pending Professionals Alert Banner */}
      <PendingProfissionaisBanner currentUser={currentUser} onUpdate={refreshData} />

      {/* Tabs */}
      <div className="flex border border-[#E5E1D8] bg-white rounded-xl p-1 shadow-xs overflow-x-auto">
        <button
          id="orient-tab-supervisao"
          onClick={() => setActiveTab('supervisao')}
          className={`flex-1 min-w-[140px] py-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'supervisao'
              ? 'bg-[#82954B] text-white shadow-xs'
              : 'text-[#8E8D8A] hover:text-[#434343] hover:bg-[#F8F5F0]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Supervisão Geral ({agendamentos.length})
        </button>

        <button
          id="orient-tab-horas"
          onClick={() => setActiveTab('horas')}
          className={`flex-1 min-w-[140px] py-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'horas'
              ? 'bg-[#82954B] text-white shadow-xs'
              : 'text-[#8E8D8A] hover:text-[#434343] hover:bg-[#F8F5F0]'
          }`}
        >
          <Award className="w-4 h-4" />
          Horas de Estágio & Validação
        </button>

        <button
          id="orient-tab-anamneses"
          onClick={() => setActiveTab('anamneses')}
          className={`flex-1 min-w-[140px] py-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'anamneses'
              ? 'bg-[#82954B] text-white shadow-xs'
              : 'text-[#8E8D8A] hover:text-[#434343] hover:bg-[#F8F5F0]'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Anamneses ({anamneses.length})
        </button>

        <button
          id="orient-tab-acompanhamentos"
          onClick={() => setActiveTab('acompanhamentos')}
          className={`flex-1 min-w-[140px] py-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'acompanhamentos'
              ? 'bg-[#82954B] text-white shadow-xs'
              : 'text-[#8E8D8A] hover:text-[#434343] hover:bg-[#F8F5F0]'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          Acompanhamentos ({acompanhamentos.length})
        </button>

        <button
          id="orient-tab-avaliacoes"
          onClick={() => setActiveTab('avaliacoes')}
          className={`flex-1 min-w-[140px] py-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'avaliacoes'
              ? 'bg-[#82954B] text-white shadow-xs'
              : 'text-[#8E8D8A] hover:text-[#434343] hover:bg-[#F8F5F0]'
          }`}
        >
          <Star className="w-4 h-4" />
          Avaliações ({avaliacoes.length})
        </button>

        <button
          id="orient-tab-equipe"
          onClick={() => setActiveTab('equipe')}
          className={`flex-1 min-w-[140px] py-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'equipe'
              ? 'bg-[#82954B] text-white shadow-xs'
              : 'text-[#8E8D8A] hover:text-[#434343] hover:bg-[#F8F5F0]'
          }`}
        >
          <Users className="w-4 h-4" />
          Corpo Clínico & Estágios
        </button>
      </div>

      {/* TAB 1: SUPERVISÃO GERAL */}
      {activeTab === 'supervisao' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E5E1D8]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8E8D8A] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por paciente, psicólogo ou estagiário..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FDFBF7] border border-[#E5E1D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
              />
            </div>
            <span className="text-xs text-[#8E8D8A]">
              Exibindo {filteredAgendamentos.length} de {agendamentos.length} atendimentos
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredAgendamentos.map((ag) => (
              <div
                key={ag.id}
                className="bg-white rounded-2xl p-4 border border-[#E5E1D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#434343]">{ag.pacienteNome}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]">
                      {ag.tipoConsulta}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ag.status === 'concluido' ? 'bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]' : 'bg-[#FDF0EE] text-[#E98074] border border-[#F7C4BE]'
                      }`}
                    >
                      {ag.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#5C5C5C]">
                    <strong>Equipe:</strong> {ag.profissionalNome} (Profissional) &{' '}
                    <strong className="text-[#A37B75]">
                      {ag.estagiarioNome || 'Nenhum estagiário atribuído'}
                    </strong>
                  </p>
                  <p className="text-[11px] text-[#8E8D8A] flex items-center gap-2">
                    <span>📅 {new Date(ag.data + 'T12:00:00Z').toLocaleDateString('pt-BR')} às {ag.horario}</span>
                    <span>• 📍 {ag.sala}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setAgendamentoParaAtribuir(ag)}
                    className="px-3 py-1.5 text-xs font-bold bg-[#F8F5F0] hover:bg-[#EAE7DC] text-[#434343] rounded-xl border border-[#E5E1D8] transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Atribuir ou trocar estagiário acadêmico nesta sessão"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-[#82954B]" />
                    {ag.estagiarioNome ? 'Trocar Estagiário' : 'Atribuir Estagiário'}
                  </button>

                  <button
                    onClick={() => setSelectedPacienteIdForAnamnese(ag.pacienteId)}
                    className="px-3 py-1.5 text-xs font-bold bg-[#F1F8E9] hover:bg-[#E8EED9] text-[#82954B] rounded-xl border border-[#D0E3B6] transition-colors cursor-pointer"
                  >
                    Ver Anamnese
                  </button>
                  <button
                    onClick={() => setSelectedPacienteIdForAcomp(ag.pacienteId)}
                    className="px-3 py-1.5 text-xs font-bold bg-[#F8F5F0] hover:bg-[#EFEAE2] text-[#434343] rounded-xl border border-[#E5E1D8] transition-colors cursor-pointer"
                  >
                    Ver Acompanhamentos
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HORAS DE ESTÁGIO DASHBOARD */}
      {activeTab === 'horas' && (
        <HorasEstagioDashboard currentRole="orientador" />
      )}

      {/* TAB 2: ANAMNESES */}
      {activeTab === 'anamneses' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-serif font-bold text-[#434343]">
              Fichas de Anamnese Registradas na Clínica Escola ({anamneses.length})
            </h3>

            <button
              onClick={() => {
                setSelectedPacienteIdForPrint(undefined);
                setIsAnamnesePrintModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#033B6C] hover:bg-[#022849] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Ficha de Anamnese (Psicologia)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {anamneses.map((an) => (
              <div
                key={an.id}
                className="bg-white rounded-2xl p-5 border border-[#E5E1D8] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[#E5E1D8]/60 pb-2">
                  <div>
                    <h4 className="text-sm font-bold text-[#434343]">{an.pacienteNome}</h4>
                    <p className="text-xs text-[#8E8D8A]">
                      {an.idade} anos • {an.profissao} • {an.estadoCivil}
                    </p>
                  </div>
                  <span className="text-xs text-[#8E8D8A]">
                    Registro: {new Date(an.dataRegistro + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold text-[#434343] mb-0.5">Principais Queixas:</p>
                  <p className="text-xs text-[#5C5C5C] bg-[#F8F5F0] p-2.5 rounded-lg border border-[#E5E1D8]">
                    {an.principaisQueixas}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-[#434343] mb-0.5">Observações Clínicas:</p>
                  <p className="text-xs text-[#5C5C5C] bg-[#F8F5F0] p-2.5 rounded-lg border border-[#E5E1D8]">
                    {an.observacoes}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E5E1D8]/60 flex flex-wrap items-center justify-between gap-2 text-xs text-[#8E8D8A]">
                  <span>Equipe: {an.profissionalNome} & {an.estagiarioNome || 'Estagiário'}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedPacienteIdForPrint(an.pacienteId);
                        setIsAnamnesePrintModalOpen(true);
                      }}
                      className="font-bold text-[#033B6C] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir Anamnese</span>
                    </button>
                    <button
                      onClick={() => setSelectedPacienteIdForAnamnese(an.pacienteId)}
                      className="font-bold text-[#82954B] hover:text-[#68793B] cursor-pointer"
                    >
                      Abrir Ficha Completa →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ACOMPANHAMENTOS */}
      {activeTab === 'acompanhamentos' && (
        <div className="space-y-4">
          <h3 className="text-sm font-serif font-bold text-[#434343]">
            Histórico Cronológico de Acompanhamentos Clínicos ({acompanhamentos.length})
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {acompanhamentos.map((ac) => (
              <div
                key={ac.id}
                className="bg-white rounded-2xl p-4 border border-[#E5E1D8] shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between border-b border-[#E5E1D8]/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]">
                      Sessão #{ac.numeroSessao}
                    </span>
                    <strong className="text-xs text-[#434343]">{ac.pacienteNome}</strong>
                  </div>
                  <span className="text-xs text-[#8E8D8A]">
                    {new Date(ac.data + 'T12:00:00Z').toLocaleDateString('pt-BR')} • {ac.statusPresenca}
                  </span>
                </div>

                <p className="text-xs text-[#5C5C5C] bg-[#F8F5F0] p-2.5 rounded-lg border border-[#E5E1D8]">
                  {ac.observacoes}
                </p>

                <div className="flex items-center justify-between text-[11px] text-[#8E8D8A] pt-1">
                  <span>Conduzido por: {ac.profissionalNome} / {ac.estagiarioNome || 'Estagiário'}</span>
                  <button
                    onClick={() => setSelectedPacienteIdForAcomp(ac.pacienteId)}
                    className="font-bold text-[#82954B] hover:text-[#68793B] cursor-pointer"
                  >
                    Ver Linha do Tempo do Paciente →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AVALIAÇÕES */}
      {activeTab === 'avaliacoes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-[#434343]">
              Painel de Avaliações e Satisfação da Clínica Escola
            </h3>
            <span className="text-xs font-bold text-[#B58D3D] bg-[#FBF4E6] px-3 py-1 rounded-full border border-[#EED9B0]">
              Média Geral: {mediaGeralClinica} / 5.0
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {avaliacoes.map((av) => (
              <div
                key={av.id}
                className="bg-white rounded-2xl p-4 border border-[#E5E1D8] shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between border-b border-[#E5E1D8]/60 pb-2">
                  <div>
                    <strong className="text-xs text-[#434343]">Paciente: {av.pacienteNome}</strong>
                    <span className="text-[11px] text-[#8E8D8A] ml-2">
                      • Atendimento com {av.profissionalNome} e {av.estagiarioNome || 'Estagiário'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[#B58D3D]">
                    {[...Array(av.notaGeral)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#B58D3D] text-[#B58D3D]" />
                    ))}
                    <span className="text-xs font-bold text-[#434343] ml-1">{av.notaGeral}.0</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {av.comentarioProfissional && (
                    <div className="bg-[#F1F8E9] p-2 rounded-lg border border-[#D0E3B6]">
                      <strong className="text-[#82954B] block text-[11px]">Sobre o Profissional:</strong>
                      <p className="text-[#5C5C5C]">"{av.comentarioProfissional}"</p>
                    </div>
                  )}
                  {av.comentarioEstagiario && (
                    <div className="bg-[#F8F5F0] p-2 rounded-lg border border-[#E5E1D8]">
                      <strong className="text-[#434343] block text-[11px]">Sobre o Estagiário:</strong>
                      <p className="text-[#5C5C5C]">"{av.comentarioEstagiario}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EQUIPE / CORPO CLÍNICO */}
      {activeTab === 'equipe' && (
        <div className="space-y-6">
          {/* Profissionais */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C5C5C] mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#82954B]" />
              Profissionais Cadastrados ({profissionais.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profissionais.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-xl border border-[#E5E1D8] flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <img src={p.foto} alt={p.nome} className="w-12 h-12 rounded-xl object-cover ring-1 ring-[#82954B]/20" />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-xs text-[#434343]">{p.nome}</p>
                        {p.aprovado === false ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
                            🔒 Aguardando Habilitação
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ Habilitado
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#82954B] font-semibold">CRP {p.crp}</p>
                      <p className="text-[11px] text-[#8E8D8A]">{p.especialidade}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.aprovado === false && (
                      <button
                        onClick={() => {
                          db.aprovarProfissional(p.id, `${currentUser?.nome || 'Orientador'} (Orientador)`);
                          refreshData();
                        }}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="Habilitar login do profissional"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Habilitar
                      </button>
                    )}
                    <button
                      onClick={() => setUserParaEditar(p)}
                      className="p-2 text-[#82954B] hover:bg-[#F1F8E9] rounded-xl border border-[#D0E3B6] text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Editar Cadastro do Profissional"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estagiários */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C5C5C] mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#82954B]" />
              Estagiários sob Supervisão ({estagiarios.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {estagiarios.map(e => (
                <div key={e.id} className="bg-white p-4 rounded-xl border border-[#E5E1D8] flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <img src={e.foto} alt={e.nome} className="w-12 h-12 rounded-xl object-cover ring-1 ring-[#82954B]/20" />
                    <div>
                      <p className="font-bold text-xs text-[#434343]">{e.nome}</p>
                      <p className="text-[11px] text-[#82954B] font-semibold">{e.turma}</p>
                      <p className="text-[11px] text-[#8E8D8A]">CPF: {e.cpf} • {e.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUserParaEditar(e)}
                    className="p-2 text-[#82954B] hover:bg-[#F1F8E9] rounded-xl border border-[#D0E3B6] text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    title="Editar Cadastro do Estagiário"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Editar</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedPacienteIdForAnamnese && (
        <AnamneseModal
          isOpen={true}
          onClose={() => setSelectedPacienteIdForAnamnese(null)}
          pacienteId={selectedPacienteIdForAnamnese}
          readOnly={true}
        />
      )}

      {selectedPacienteIdForAcomp && (
        <AcompanhamentoModal
          isOpen={true}
          onClose={() => setSelectedPacienteIdForAcomp(null)}
          pacienteId={selectedPacienteIdForAcomp}
          readOnly={true}
        />
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      {/* Admin / Orientador Edit User Modal */}
      {userParaEditar && (
        <AdminEditUserModal
          isOpen={true}
          user={userParaEditar}
          onClose={() => setUserParaEditar(null)}
          onSuccess={() => {
            setProfissionais(db.getProfissionais());
            setEstagiarios(db.getEstagiarios());
            setUserParaEditar(null);
          }}
        />
      )}

      {/* Atribuir Estagiário Modal */}
      <AtribuirEstagiarioModal
        isOpen={!!agendamentoParaAtribuir}
        onClose={() => setAgendamentoParaAtribuir(null)}
        agendamento={agendamentoParaAtribuir}
        onSuccess={() => setAgendamentos(db.getAgendamentos())}
      />

      {/* Relatório Imprimível de Atendimentos */}
      <RelatorioAtendimentosModal
        isOpen={isRelatorioModalOpen}
        onClose={() => setIsRelatorioModalOpen(false)}
        orientadorNome={orientUser.nome}
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
    </div>
  );
};
