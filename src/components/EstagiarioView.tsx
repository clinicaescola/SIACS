import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import {
  EstagiarioUser,
  DisponibilidadeEstagiario,
  Agendamento,
  Avaliacao,
  RelatorioEstagio
} from '../types';
import { MultiDateSchedulePicker, TimeSlot } from './MultiDateSchedulePicker';
import {
  GraduationCap,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Users,
  FileText,
  FileCheck2,
  Star,
  CheckCircle,
  Stethoscope,
  Shield,
  ClipboardList,
  Award,
  BookOpen,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { AnamneseModal } from './AnamneseModal';
import { AcompanhamentoModal } from './AcompanhamentoModal';
import { RelatorioEstagioModal } from './RelatorioEstagioModal';
import { UserAvatar } from './UserAvatar';
import { EditProfileModal } from './EditProfileModal';
import { Edit3 } from 'lucide-react';

export const EstagiarioView: React.FC = () => {
  const { currentUser } = useAuth();
  const estUser = currentUser as EstagiarioUser;

  const [minhasDisponibilidades, setMinhasDisponibilidades] = useState<DisponibilidadeEstagiario[]>([]);
  const [atendimentosEscalados, setAtendimentosEscalados] = useState<Agendamento[]>([]);
  const [minhasAvaliacoes, setMinhasAvaliacoes] = useState<Avaliacao[]>([]);
  const [meusRelatorios, setMeusRelatorios] = useState<RelatorioEstagio[]>([]);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);

  // Multi-date and multi-hour picker state for intern
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<TimeSlot[]>([
    { horaInicio: '08:00', horaFim: '12:00' },
    { horaInicio: '14:00', horaFim: '18:00' }
  ]);
  const [observacoes, setObservacoes] = useState<string>('Disponível para atendimentos supervisionados de TCC e plantão.');

  // Modals
  const [selectedPacienteIdForAnamnese, setSelectedPacienteIdForAnamnese] = useState<string | null>(null);
  const [selectedAgendamentoIdForAnamnese, setSelectedAgendamentoIdForAnamnese] = useState<string | null>(null);

  const [selectedPacienteIdForAcomp, setSelectedPacienteIdForAcomp] = useState<string | null>(null);
  const [selectedAgendamentoIdForAcomp, setSelectedAgendamentoIdForAcomp] = useState<string | null>(null);

  // Relatorio modal
  const [isRelatorioModalOpen, setIsRelatorioModalOpen] = useState<boolean>(false);
  const [agendamentoParaRelatorio, setAgendamentoParaRelatorio] = useState<Agendamento | null>(null);

  const [activeTab, setActiveTab] = useState<'escalas' | 'horas' | 'disponibilidade' | 'avaliacoes'>('escalas');

  useEffect(() => {
    const refresh = () => {
      if (!estUser) return;
      const allDisp = db.getDispEstagiarios().filter(d => d.estagiarioId === estUser.id);
      setMinhasDisponibilidades(allDisp);

      // Agendamentos escalados para este estagiário
      const allAg = db.getAgendamentos().filter(
        a => a.estagiarioId === estUser.id || a.estagiarioNome?.includes(estUser.nome)
      );
      setAtendimentosEscalados(allAg);

      const allAv = db.getAvaliacoesByEstagiario(estUser.id);
      setMinhasAvaliacoes(allAv);

      const allRel = db.getRelatoriosByEstagiarioId(estUser.id);
      setMeusRelatorios(allRel);
    };

    refresh();
    const unsub = db.subscribe(refresh);

    const handleCustomNav = (e: Event) => {
      const customEvent = e as CustomEvent<{ tabId: string }>;
      const tabId = customEvent.detail?.tabId;
      if (!tabId) return;

      if (tabId === 'est-tab-escalas') setActiveTab('escalas');
      else if (tabId === 'est-tab-horas') setActiveTab('horas');
      else if (tabId === 'est-tab-disp') setActiveTab('disponibilidade');
      else if (tabId === 'est-tab-avaliacoes') setActiveTab('avaliacoes');
    };

    window.addEventListener('siacs-navigate-tab', handleCustomNav);

    return () => {
      unsub();
      window.removeEventListener('siacs-navigate-tab', handleCustomNav);
    };
  }, [estUser]);

  const handleSalvarMultiplasDisponibilidades = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDates.length === 0 || selectedTimes.length === 0) {
      alert('Selecione pelo menos uma data e um horário para cadastrar disponibilidade.');
      return;
    }

    const dispsToCreate: Array<Omit<DisponibilidadeEstagiario, 'id' | 'status'>> = [];
    for (const d of selectedDates) {
      for (const h of selectedTimes) {
        dispsToCreate.push({
          estagiarioId: estUser.id,
          estagiarioNome: estUser.nome,
          turma: estUser.turma,
          data: d,
          horaInicio: h.horaInicio,
          horaFim: h.horaFim,
          observacoes: observacoes || 'Disponibilidade de estágio'
        });
      }
    }

    db.addMultipleDispEstagiarios(dispsToCreate);
    alert(`${dispsToCreate.length} turnos de disponibilidade cadastrados com sucesso!`);
    setSelectedDates([]);
  };

  const mediaNotaEstagiario = minhasAvaliacoes.length > 0
    ? (minhasAvaliacoes.reduce((acc, a) => acc + (a.notaEstagiario || 5), 0) / minhasAvaliacoes.length).toFixed(1)
    : '5.0';

  const horasStatus = estUser ? db.getHorasEstagioStatus(estUser.id) : null;

  return (
    <div className="space-y-6 text-[#434343]">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E1D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar
            src={estUser.foto}
            alt={estUser.nome}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#82954B]/30"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-bold text-[#434343]">{estUser.nome}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]">
                Estagiário
              </span>
              <button
                id="est-edit-profile-btn"
                onClick={() => setIsEditProfileOpen(true)}
                className="ml-1 p-1 text-[#8E8D8A] hover:text-[#82954B] hover:bg-[#F1F8E9] rounded-lg transition-colors cursor-pointer"
                title="Editar meu cadastro (senha, e-mail e foto)"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs font-semibold text-[#82954B] mt-0.5">
              Turma: {estUser.turma} • CPF: {estUser.cpf}
            </p>
            <p className="text-xs text-[#8E8D8A]">
              {estUser.email} • {estUser.telefone}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {horasStatus && (
            <div className="bg-[#F1F8E9] px-4 py-2.5 rounded-xl border border-[#D0E3B6] text-center">
              <p className="text-xs font-semibold text-[#82954B]">Horas Concluídas</p>
              <p className="text-lg font-serif font-bold text-[#82954B]">
                {horasStatus.horasCumpridas}h <span className="text-xs font-sans text-[#5C5C5C]">/ {horasStatus.horasExigidas}h</span>
              </p>
            </div>
          )}
          <div className="bg-[#F8F5F0] px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-center">
            <p className="text-xs text-[#8E8D8A]">Atendimentos Escalados</p>
            <p className="text-lg font-serif font-bold text-[#434343]">{atendimentosEscalados.length}</p>
          </div>
          <div className="bg-[#F8F5F0] px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-center">
            <p className="text-xs text-[#8E8D8A]">Avaliação do Estagiário</p>
            <div className="flex items-center justify-center gap-1 text-[#B58D3D] font-bold">
              <Star className="w-4 h-4 fill-[#B58D3D]" />
              <span className="text-[#434343] text-base font-serif">{mediaNotaEstagiario}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border border-[#E5E1D8] bg-white rounded-xl p-1 shadow-xs overflow-x-auto">
        <button
          id="est-tab-escalas"
          onClick={() => setActiveTab('escalas')}
          className={`flex-1 min-w-[150px] py-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'escalas'
              ? 'bg-[#82954B] text-white shadow-xs'
              : 'text-[#8E8D8A] hover:text-[#434343] hover:bg-[#F8F5F0]'
          }`}
        >
          <Users className="w-4 h-4" />
          Atendimentos ({atendimentosEscalados.length})
        </button>

        <button
          id="est-tab-horas"
          onClick={() => setActiveTab('horas')}
          className={`flex-1 min-w-[150px] py-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'horas'
              ? 'bg-[#82954B] text-white shadow-xs'
              : 'text-[#8E8D8A] hover:text-[#434343] hover:bg-[#F8F5F0]'
          }`}
        >
          <Award className="w-4 h-4" />
          Horas de Estágio & Relatórios ({meusRelatorios.length})
        </button>

        <button
          id="est-tab-disp"
          onClick={() => setActiveTab('disponibilidade')}
          className={`flex-1 min-w-[150px] py-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'disponibilidade'
              ? 'bg-[#82954B] text-white shadow-xs'
              : 'text-[#8E8D8A] hover:text-[#434343] hover:bg-[#F8F5F0]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Minha Escala / Turnos ({minhasDisponibilidades.length})
        </button>

        <button
          id="est-tab-avaliacoes"
          onClick={() => setActiveTab('avaliacoes')}
          className={`flex-1 min-w-[150px] py-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'avaliacoes'
              ? 'bg-[#82954B] text-white shadow-xs'
              : 'text-[#8E8D8A] hover:text-[#434343] hover:bg-[#F8F5F0]'
          }`}
        >
          <Star className="w-4 h-4" />
          Feedbacks ({minhasAvaliacoes.length})
        </button>
      </div>

      {/* TAB 1: ATENDIMENTOS ESCALADOS */}
      {activeTab === 'escalas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-[#434343] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#82954B]" />
              Sessões sob sua Co-terapia / Observação
            </h3>
            <span className="text-xs text-[#8E8D8A]">
              Acompanhe a anamnese, registre acompanhamentos e submeta seu relatório de horas
            </span>
          </div>

          {atendimentosEscalados.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E5E1D8] text-[#8E8D8A]">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-30 text-[#82954B]" />
              <p className="text-base font-serif font-bold text-[#434343]">Nenhum atendimento escalado no momento.</p>
              <p className="text-xs mt-1 text-[#8E8D8A]">
                Cadastre seus horários de disponibilidade para ser alocado automaticamente quando pacientes agendarem.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {atendimentosEscalados.map((ag) => {
                const pacAnamnese = db.getAnamneseByPacienteId(ag.pacienteId);
                const acomps = db.getAcompanhamentosByPacienteId(ag.pacienteId);
                const relatorioDaSessao = meusRelatorios.find(r => r.agendamentoId === ag.id);

                return (
                  <div
                    key={ag.id}
                    className="bg-white rounded-2xl p-5 border border-[#E5E1D8] hover:border-[#82954B]/60 transition-all shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E1D8]/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#434343]">
                            Paciente: {ag.pacienteNome}
                          </h4>
                          <span className="text-[10px] font-mono font-bold bg-[#EBF3FB] text-[#033B6C] px-2 py-0.5 rounded-md border border-[#B3D4F5]">
                            {db.getNumeroProntuarioPaciente(ag.pacienteId)}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]">
                            {ag.tipoConsulta}
                          </span>
                        </div>
                        <p className="text-xs text-[#8E8D8A] mt-0.5">
                          Profissional Responsável: <strong className="text-[#434343]">{ag.profissionalNome}</strong> ({ag.profissionalEspecialidade})
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {relatorioDaSessao && (
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            relatorioDaSessao.status === 'validado'
                              ? 'bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]'
                              : 'bg-[#FBF4E6] text-[#B58D3D] border border-[#EED9B0]'
                          }`}>
                            {relatorioDaSessao.status === 'validado' ? '✓ Horas Validadas' : '⏳ Relatório Pendente'}
                          </span>
                        )}
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            ag.status === 'concluido'
                              ? 'bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]'
                              : 'bg-[#FDF0EE] text-[#E98074] border border-[#F7C4BE]'
                          }`}
                        >
                          {ag.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F8F5F0] p-3 rounded-xl text-xs text-[#5C5C5C] border border-[#E5E1D8]">
                      <div>
                        <span className="text-[#8E8D8A] block text-[11px]">Data e Horário:</span>
                        <strong className="text-[#434343]">
                          {new Date(ag.data + 'T12:00:00Z').toLocaleDateString('pt-BR')} • {ag.horario}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#8E8D8A] block text-[11px]">Local:</span>
                        <strong className="text-[#434343]">{ag.sala} ({ag.modalidade})</strong>
                      </div>
                      <div>
                        <span className="text-[#8E8D8A] block text-[11px]">Orientação de Estágio:</span>
                        <strong className="text-[#434343]">Profa. Dra. Helena Matos</strong>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setSelectedPacienteIdForAnamnese(ag.pacienteId);
                          setSelectedAgendamentoIdForAnamnese(ag.id);
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                          pacAnamnese
                            ? 'bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6] hover:bg-[#E8EED9]'
                            : 'bg-[#82954B] text-white hover:bg-[#6D7D3F] shadow-xs'
                        }`}
                      >
                        <ClipboardList className="w-3.5 h-3.5" />
                        {pacAnamnese ? 'Ver Anamnese Realizada' : 'Preencher Anamnese (1ª Sessão)'}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedPacienteIdForAcomp(ag.pacienteId);
                          setSelectedAgendamentoIdForAcomp(ag.id);
                        }}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#F8F5F0] hover:bg-[#EFEAE2] text-[#434343] border border-[#E5E1D8] transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-[#82954B]" />
                        Lançar Acompanhamento Clínico ({acomps.length} sessões)
                      </button>

                      <button
                        onClick={() => {
                          setAgendamentoParaRelatorio(ag);
                          setIsRelatorioModalOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#FBF4E6] hover:bg-[#F6E9CF] text-[#B58D3D] border border-[#EED9B0] transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        {relatorioDaSessao ? 'Submeter Outro Relatório' : 'Escrever Avaliação de Estágio (Horas)'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HORAS DE ESTÁGIO & RELATÓRIOS DO ESTAGIÁRIO */}
      {activeTab === 'horas' && (
        <div className="space-y-6">
          {horasStatus && (
            <div className="bg-white rounded-2xl p-6 border border-[#E5E1D8] shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E1D8]/60 pb-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#434343] flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#82954B]" />
                    Progresso de Horas de Estágio Supervisionado
                  </h3>
                  <p className="text-xs text-[#8E8D8A]">
                    Horas registradas através das suas avaliações de caso e validadas pela Orientadora.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setAgendamentoParaRelatorio(null);
                    setIsRelatorioModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#82954B] hover:bg-[#6D7D3F] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  + Lançar Avaliação / Relatório de Atendimento
                </button>
              </div>

              {/* 4 Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-[#F8F5F0] border border-[#E5E1D8] rounded-2xl">
                  <span className="text-[11px] font-semibold text-[#8E8D8A] uppercase tracking-wider block">
                    Meta de Horas Exigidas
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-serif font-bold text-[#434343]">
                      {horasStatus.horasExigidas}h
                    </span>
                    <span className="text-[11px] text-[#8E8D8A]">total</span>
                  </div>
                </div>

                <div className="p-4 bg-[#F1F8E9] border border-[#D0E3B6] rounded-2xl">
                  <span className="text-[11px] font-semibold text-[#82954B] uppercase tracking-wider block">
                    Horas Efetuadas (Validadas)
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-serif font-bold text-[#82954B]">
                      {horasStatus.horasCumpridas}h
                    </span>
                    <span className="text-[11px] text-[#82954B]">({horasStatus.percentualConcluido}%)</span>
                  </div>
                </div>

                <div className="p-4 bg-[#FBF4E6] border border-[#EED9B0] rounded-2xl">
                  <span className="text-[11px] font-semibold text-[#B58D3D] uppercase tracking-wider block">
                    Horas Pendentes de Validação
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-serif font-bold text-[#B58D3D]">
                      {horasStatus.horasPendentes}h
                    </span>
                    <span className="text-[11px] text-[#B58D3D]">em análise</span>
                  </div>
                </div>

                <div className="p-4 bg-[#FDF0EE] border border-[#F7C4BE] rounded-2xl">
                  <span className="text-[11px] font-semibold text-[#E98074] uppercase tracking-wider block">
                    Saldo Restante a Abater
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-serif font-bold text-[#E98074]">
                      {horasStatus.horasRestantes}h
                    </span>
                    <span className="text-[11px] text-[#E98074]">restantes</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 bg-[#F8F5F0] p-4 rounded-2xl border border-[#E5E1D8]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#434343]">
                    Progresso Geral de Cumprimento de Estágio:
                  </span>
                  <span className="font-bold text-[#82954B] text-sm">
                    {horasStatus.horasCumpridas}h de {horasStatus.horasExigidas}h ({horasStatus.percentualConcluido}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-[#E5E1D8] rounded-full overflow-hidden flex">
                  <div
                    className="bg-[#82954B] h-full transition-all duration-500 rounded-l-full"
                    style={{ width: `${horasStatus.percentualConcluido}%` }}
                  />
                  {horasStatus.horasPendentes > 0 && (
                    <div
                      className="bg-[#B58D3D]/70 h-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100 - horasStatus.percentualConcluido, Math.round((horasStatus.horasPendentes / horasStatus.horasExigidas) * 100))}%`
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* List of Submitted Reports */}
          <div className="bg-[#FDFBF7] border border-[#E5E1D8] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-[#434343] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#82954B]" />
                Minhas Avaliações e Relatórios Submetidos ({meusRelatorios.length})
              </h3>
            </div>

            {meusRelatorios.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center border border-[#E5E1D8] text-[#8E8D8A]">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#82954B]" />
                <p className="font-serif font-bold text-sm text-[#434343]">
                  Nenhum relatório de estágio submetido ainda.
                </p>
                <p className="text-xs mt-1 text-[#8E8D8A]">
                  Clique no botão "+ Lançar Avaliação / Relatório de Atendimento" para registrar sua avaliação e abater horas.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {meusRelatorios.map((rel) => (
                  <div
                    key={rel.id}
                    className="bg-white rounded-2xl p-5 border border-[#E5E1D8] space-y-3 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E1D8]/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#434343]">
                            Sessão: {rel.pacienteNome || 'Paciente da Clínica'}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F8F5F0] text-[#5C5C5C] border border-[#E5E1D8]">
                            Data: {new Date(rel.dataAtendimento + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]">
                            +{rel.horasComputadas} Horas
                          </span>
                        </div>
                        <p className="text-xs text-[#8E8D8A] mt-0.5">
                          Profissional Supervisor: <strong className="text-[#434343]">{rel.profissionalNome || 'Docente'}</strong>
                        </p>
                      </div>

                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          rel.status === 'validado'
                            ? 'bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]'
                            : rel.status === 'rejeitado'
                            ? 'bg-[#FDF0EE] text-[#E98074] border border-[#F7C4BE]'
                            : 'bg-[#FBF4E6] text-[#B58D3D] border border-[#EED9B0]'
                        }`}
                      >
                        {rel.status === 'validado'
                          ? '✓ HORAS VALIDADAS'
                          : rel.status === 'rejeitado'
                          ? '✕ RECUSADO'
                          : '⏳ EM ANÁLISE PELA ORIENTADORA'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#F8F5F0] p-3.5 rounded-xl border border-[#E5E1D8]">
                      <div>
                        <span className="text-[#8E8D8A] block font-semibold text-[11px] mb-1">
                          Resumo do Atendimento:
                        </span>
                        <p className="text-[#434343]">{rel.resumoCaso}</p>
                        <p className="text-[11px] text-[#5C5C5C] mt-1 italic">
                          Atividades: {rel.atividadesRealizadas}
                        </p>
                      </div>

                      <div>
                        <span className="text-[#8E8D8A] block font-semibold text-[11px] mb-1">
                          Sua Autoavaliação Crítica:
                        </span>
                        <p className="text-[#434343] bg-white/70 p-2.5 rounded-lg border border-[#E5E1D8]">
                          "{rel.avaliacaoAutoCritica}"
                        </p>
                      </div>
                    </div>

                    {rel.parecerOrientador && (
                      <div className="p-3 bg-[#F1F8E9]/60 border border-[#D0E3B6] rounded-xl text-xs">
                        <span className="font-bold text-[#82954B] block text-[11px] mb-0.5">
                          Parecer da Orientadora de Estágio:
                        </span>
                        <p className="text-[#434343]">{rel.parecerOrientador}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INDICAR DISPONIBILIDADE DO ESTAGIÁRIO */}
      {activeTab === 'disponibilidade' && (
        <div className="space-y-6">
          <form onSubmit={handleSalvarMultiplasDisponibilidades} className="space-y-4">
            <MultiDateSchedulePicker
              role="estagiario"
              selectedDates={selectedDates}
              onChangeDates={setSelectedDates}
              selectedTimes={selectedTimes}
              onChangeTimes={setSelectedTimes}
              observacoes={observacoes}
              onChangeObservacoes={setObservacoes}
            />

            <div className="flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={selectedDates.length === 0 || selectedTimes.length === 0}
                className="py-3 px-6 bg-[#82954B] hover:bg-[#6D7D3F] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Registrar {selectedDates.length * selectedTimes.length} Turnos de Estágio na Escala
              </button>
            </div>
          </form>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E1D8] shadow-xs">
            <h4 className="text-sm font-serif font-bold text-[#434343] mb-3">
              Minhas Escalas Cadastradas ({minhasDisponibilidades.length})
            </h4>

            {minhasDisponibilidades.length === 0 ? (
              <p className="text-xs text-[#8E8D8A] text-center py-6">
                Nenhum turno registrado. Use o formulário acima para informar seus dias livres.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {minhasDisponibilidades.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-xl border border-[#E5E1D8] bg-[#F8F5F0] flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-xs text-[#434343]">
                        {new Date(d.data + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-[#5C5C5C] font-medium mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#82954B]" />
                        {d.horaInicio} às {d.horaFim}
                      </p>
                      {d.observacoes && (
                        <p className="text-[10px] text-[#8E8D8A] mt-1 line-clamp-1">{d.observacoes}</p>
                      )}
                    </div>

                    <button
                      onClick={() => db.deleteDispEstagiario(d.id)}
                      className="p-1.5 text-[#8E8D8A] hover:text-[#E98074] hover:bg-[#FDF0EE] rounded-lg transition-colors cursor-pointer"
                      title="Remover escala"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FEEDBACKS E AVALIAÇÕES */}
      {activeTab === 'avaliacoes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-[#434343] flex items-center gap-2">
              <Star className="w-4 h-4 text-[#B58D3D] fill-[#B58D3D]" />
              Avaliações Pedagógicas dos Pacientes
            </h3>
            <span className="text-xs text-[#8E8D8A]">
              Média do Estagiário: <strong className="text-[#434343]">{mediaNotaEstagiario} / 5.0</strong>
            </span>
          </div>

          {minhasAvaliacoes.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E5E1D8] text-[#8E8D8A]">
              <Star className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#B58D3D]" />
              <p className="text-sm font-serif font-semibold text-[#434343]">Nenhuma avaliação recebida ainda.</p>
              <p className="text-xs mt-1 text-[#8E8D8A]">Após as sessões, os pacientes avaliam a acolhida dos estagiários.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {minhasAvaliacoes.map((av) => (
                <div
                  key={av.id}
                  className="bg-white rounded-2xl p-4 border border-[#E5E1D8] space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-[#E5E1D8]/60 pb-2">
                    <div>
                      <strong className="text-xs text-[#434343]">{av.pacienteNome}</strong>
                      <span className="text-[11px] text-[#8E8D8A] ml-2">
                        • Sessão em {new Date(av.dataAtendimento + 'T12:00:00Z').toLocaleDateString('pt-BR')} com {av.profissionalNome}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[#B58D3D]">
                      {[...Array(av.notaEstagiario || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#B58D3D] text-[#B58D3D]" />
                      ))}
                      <span className="text-xs font-bold text-[#434343] ml-1">
                        {av.notaEstagiario || 5}.0
                      </span>
                    </div>
                  </div>

                  {av.comentarioEstagiario && (
                    <p className="text-xs text-[#5C5C5C] bg-[#F8F5F0] p-2.5 rounded-lg border border-[#E5E1D8]">
                      "{av.comentarioEstagiario}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Anamnese Modal */}
      {selectedPacienteIdForAnamnese && (
        <AnamneseModal
          isOpen={true}
          onClose={() => {
            setSelectedPacienteIdForAnamnese(null);
            setSelectedAgendamentoIdForAnamnese(null);
          }}
          pacienteId={selectedPacienteIdForAnamnese}
          agendamentoId={selectedAgendamentoIdForAnamnese || undefined}
        />
      )}

      {/* Acompanhamento Modal */}
      {selectedPacienteIdForAcomp && (
        <AcompanhamentoModal
          isOpen={true}
          onClose={() => {
            setSelectedPacienteIdForAcomp(null);
            setSelectedAgendamentoIdForAcomp(null);
          }}
          pacienteId={selectedPacienteIdForAcomp}
          agendamentoId={selectedAgendamentoIdForAcomp || undefined}
        />
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      {/* Relatório de Estágio Modal */}
      <RelatorioEstagioModal
        isOpen={isRelatorioModalOpen}
        onClose={() => {
          setIsRelatorioModalOpen(false);
          setAgendamentoParaRelatorio(null);
        }}
        agendamento={agendamentoParaRelatorio}
      />
    </div>
  );
};
