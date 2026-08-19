import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { HorarioDisponivel, Agendamento, Avaliacao, ProfissionalUser } from '../types';
import { TimeSlot } from './MultiDateSchedulePicker';
import { UnifiedProfessionalCalendarPicker } from './UnifiedProfessionalCalendarPicker';
import { AtribuirEstagiarioModal } from './AtribuirEstagiarioModal';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  User,
  FileText,
  FileCheck2,
  Star,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Send,
  Stethoscope,
  Users,
  ChevronRight,
  ClipboardList,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { AnamneseModal } from './AnamneseModal';
import { AcompanhamentoModal } from './AcompanhamentoModal';
import { UserAvatar } from './UserAvatar';
import { EditProfileModal } from './EditProfileModal';
import { Edit3 } from 'lucide-react';

export const ProfissionalView: React.FC = () => {
  const { currentUser } = useAuth();
  const profUser = currentUser as ProfissionalUser;

  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [agendamentoParaAtribuir, setAgendamentoParaAtribuir] = useState<Agendamento | null>(null);

  // Multi-date and multi-time picker state
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<TimeSlot[]>([
    { horaInicio: '08:00', horaFim: '09:00' },
    { horaInicio: '09:30', horaFim: '10:30' },
    { horaInicio: '14:00', horaFim: '15:00' },
    { horaInicio: '15:30', horaFim: '16:30' }
  ]);

  // Active modals
  const [selectedPacienteIdForAnamnese, setSelectedPacienteIdForAnamnese] = useState<string | null>(null);
  const [selectedAgendamentoIdForAnamnese, setSelectedAgendamentoIdForAnamnese] = useState<string | null>(null);

  const [selectedPacienteIdForAcomp, setSelectedPacienteIdForAcomp] = useState<string | null>(null);
  const [selectedAgendamentoIdForAcomp, setSelectedAgendamentoIdForAcomp] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'agenda' | 'disponibilidade' | 'avaliacoes'>('agenda');

  useEffect(() => {
    const refresh = () => {
      if (!profUser) return;
      const allHorarios = db.getHorarios().filter(h => h.profissionalId === profUser.id);
      setHorarios(allHorarios);

      const allAgendamentos = db.getAgendamentos().filter(a => a.profissionalId === profUser.id);
      setAgendamentos(allAgendamentos);

      const allAvals = db.getAvaliacoesByProfissional(profUser.id);
      setAvaliacoes(allAvals);
    };

    refresh();
    const unsub = db.subscribe(refresh);

    const handleCustomNav = (e: Event) => {
      const customEvent = e as CustomEvent<{ tabId: string }>;
      const tabId = customEvent.detail?.tabId;
      if (!tabId) return;

      if (tabId === 'prof-tab-agenda') setActiveTab('agenda');
      else if (tabId === 'prof-tab-disp') setActiveTab('disponibilidade');
      else if (tabId === 'prof-tab-avaliacoes') setActiveTab('avaliacoes');
    };

    window.addEventListener('siacs-navigate-tab', handleCustomNav);

    return () => {
      unsub();
      window.removeEventListener('siacs-navigate-tab', handleCustomNav);
    };
  }, [profUser]);

  const handleSalvarMultiplosHorarios = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDates.length === 0 || selectedTimes.length === 0) {
      alert('Selecione pelo menos uma data e um horário para gerar a grade.');
      return;
    }

    const slotsToCreate: Array<Omit<HorarioDisponivel, 'id' | 'status'>> = [];
    for (const d of selectedDates) {
      for (const h of selectedTimes) {
        slotsToCreate.push({
          profissionalId: profUser.id,
          profissionalNome: profUser.nome,
          especialidade: profUser.especialidade,
          data: d,
          horaInicio: h.horaInicio,
          horaFim: h.horaFim
        });
      }
    }

    db.addMultipleHorarios(slotsToCreate);
    alert(`${slotsToCreate.length} horários disponibilizados com sucesso na sua agenda!`);
    setSelectedDates([]);
  };

  const handleDispararLembrete = (agendamentoId: string) => {
    db.dispararLembrete1DiaAntes(agendamentoId);
    alert('Lembrete de consulta de 1 dia disparado com sucesso via E-mail e WhatsApp!');
  };

  const mediaNota = avaliacoes.length > 0
    ? (avaliacoes.reduce((acc, a) => acc + a.notaProfissional, 0) / avaliacoes.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6 text-[#434343]">
      {/* Top Professional Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E1D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar
            src={profUser.foto}
            alt={profUser.nome}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#82954B]/30"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-bold text-[#434343]">{profUser.nome}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]">
                CRP {profUser.crp}
              </span>
              <button
                id="prof-edit-profile-btn"
                onClick={() => setIsEditProfileOpen(true)}
                className="ml-1 p-1 text-[#8E8D8A] hover:text-[#82954B] hover:bg-[#F1F8E9] rounded-lg transition-colors cursor-pointer"
                title="Editar meu cadastro (senha, e-mail e foto)"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs font-semibold text-[#82954B] mt-0.5">
              {profUser.especialidade}
            </p>
            <p className="text-xs text-[#8E8D8A] mt-1">
              {profUser.email} • {profUser.telefone}
            </p>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3">
          <div className="bg-[#F8F5F0] px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-center">
            <p className="text-xs text-[#8E8D8A]">Agendamentos</p>
            <p className="text-lg font-bold text-[#434343] font-serif">{agendamentos.length}</p>
          </div>
          <div className="bg-[#F8F5F0] px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-center">
            <p className="text-xs text-[#8E8D8A]">Vagas Abertas</p>
            <p className="text-lg font-bold text-[#82954B] font-serif">
              {horarios.filter(h => h.status === 'disponivel').length}
            </p>
          </div>
          <div className="bg-[#F8F5F0] px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-center">
            <p className="text-xs text-[#8E8D8A]">Avaliação Média</p>
            <div className="flex items-center justify-center gap-1 text-[#B58D3D] font-bold">
              <Star className="w-4 h-4 fill-[#B58D3D]" />
              <span className="text-[#434343] text-base font-serif">{mediaNota}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border border-[#E5E1D8] bg-white rounded-xl p-1 shadow-xs">
        <button
          id="prof-tab-agenda"
          onClick={() => setActiveTab('agenda')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'agenda'
              ? 'bg-[#82954B] text-white shadow-xs'
              : 'text-[#8E8D8A] hover:text-[#434343] hover:bg-[#F8F5F0]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Minha Agenda & Atendimentos ({agendamentos.length})
        </button>

        <button
          id="prof-tab-disp"
          onClick={() => setActiveTab('disponibilidade')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'disponibilidade'
              ? 'bg-[#82954B] text-white shadow-xs'
              : 'text-[#8E8D8A] hover:text-[#434343] hover:bg-[#F8F5F0]'
          }`}
        >
          <Clock className="w-4 h-4" />
          Disponibilizar Horários no Calendário ({horarios.length})
        </button>

        <button
          id="prof-tab-avaliacoes"
          onClick={() => setActiveTab('avaliacoes')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'avaliacoes'
              ? 'bg-[#82954B] text-white shadow-xs'
              : 'text-[#8E8D8A] hover:text-[#434343] hover:bg-[#F8F5F0]'
          }`}
        >
          <Star className="w-4 h-4" />
          Avaliações dos Pacientes ({avaliacoes.length})
        </button>
      </div>

      {/* TAB 1: AGENDA DE CONSULTAS E PRONTUÁRIOS */}
      {activeTab === 'agenda' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-[#434343] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#82954B]" />
              Pacientes e Consultas Marcadas
            </h3>
            <span className="text-xs text-[#8E8D8A]">
              Gerencie Anamneses (1ª consulta) e Acompanhamentos a cada encontro
            </span>
          </div>

          {agendamentos.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E5E1D8] text-[#8E8D8A]">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30 text-[#82954B]" />
              <p className="text-base font-serif font-bold text-[#434343]">Nenhum paciente agendado no momento.</p>
              <p className="text-xs mt-1 text-[#8E8D8A]">
                Disponibilize novos horários na aba "Disponibilizar Horários" para que os clientes possam escolher.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {agendamentos.map((ag) => {
                const pacAnamnese = db.getAnamneseByPacienteId(ag.pacienteId);
                const acomps = db.getAcompanhamentosByPacienteId(ag.pacienteId);

                return (
                  <div
                    key={ag.id}
                    className="bg-white rounded-2xl p-5 border border-[#E5E1D8] hover:border-[#82954B]/60 transition-all shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E1D8]/60 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FDF0EE] text-[#E98074] flex items-center justify-center font-bold text-sm border border-[#F7C4BE]">
                          {ag.pacienteNome.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#434343]">{ag.pacienteNome}</h4>
                            <span className="text-[10px] font-mono font-bold bg-[#EBF3FB] text-[#033B6C] px-2 py-0.5 rounded-md border border-[#B3D4F5]">
                              {db.getNumeroProntuarioPaciente(ag.pacienteId)}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]">
                              {ag.tipoConsulta}
                            </span>
                          </div>
                          <p className="text-xs text-[#8E8D8A]">
                            Tel: {ag.pacienteTelefone} • E-mail: {ag.pacienteEmail}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            ag.status === 'concluido'
                              ? 'bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]'
                              : ag.status === 'confirmado'
                              ? 'bg-[#FDF0EE] text-[#E98074] border border-[#F7C4BE]'
                              : 'bg-[#FBF4E6] text-[#B58D3D] border border-[#EED9B0]'
                          }`}
                        >
                          Status: {ag.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Schedule & Team info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F8F5F0] p-3 rounded-xl text-xs text-[#5C5C5C] border border-[#E5E1D8]">
                      <div>
                        <span className="text-[#8E8D8A] block text-[11px]">Data e Horário:</span>
                        <strong className="text-[#434343]">
                          {new Date(ag.data + 'T12:00:00Z').toLocaleDateString('pt-BR')} • {ag.horario}
                        </strong>
                      </div>

                      <div>
                        <span className="text-[#8E8D8A] block text-[11px]">Estagiário Escalado:</span>
                        <strong className="text-[#A37B75]">
                          {ag.estagiarioNome || 'Lucas Silveira (PSI-2024.1)'}
                        </strong>
                      </div>

                      <div>
                        <span className="text-[#8E8D8A] block text-[11px]">Local:</span>
                        <strong className="text-[#434343]">{ag.sala} ({ag.modalidade})</strong>
                      </div>
                    </div>

                    {/* Action buttons (Anamnese, Acompanhamento, Disparar Lembrete) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* 1. Anamnese Button */}
                        <button
                          id={`btn-anamnese-${ag.id}`}
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
                          {pacAnamnese ? 'Visualizar Anamnese Completa' : 'Preencher Anamnese (1ª Consulta)'}
                        </button>

                        {/* 2. Acompanhamento Button */}
                        <button
                          id={`btn-acomp-${ag.id}`}
                          onClick={() => {
                            setSelectedPacienteIdForAcomp(ag.pacienteId);
                            setSelectedAgendamentoIdForAcomp(ag.id);
                          }}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#F8F5F0] hover:bg-[#EAE7DC] text-[#434343] border border-[#E5E1D8] transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-[#82954B]" />
                          Lançar / Ver Acompanhamento ({acomps.length} sessões)
                        </button>

                        {/* 3. Atribuir Estagiário */}
                        <button
                          onClick={() => setAgendamentoParaAtribuir(ag)}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#F8F5F0] hover:bg-[#EAE7DC] text-[#434343] border border-[#E5E1D8] transition-all flex items-center gap-1.5 cursor-pointer"
                          title="Atribuir ou trocar estagiário acadêmico nesta sessão"
                        >
                          <GraduationCap className="w-3.5 h-3.5 text-[#82954B]" />
                          {ag.estagiarioNome ? 'Trocar Estagiário' : 'Atribuir Estagiário'}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDispararLembrete(ag.id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#FBF4E6] hover:bg-[#F6E9CF] text-[#B58D3D] border border-[#EED9B0] transition-all flex items-center gap-1.5 cursor-pointer"
                          title="Dispara e-mail e gera link WhatsApp de confirmação de 1 dia antes"
                        >
                          <Send className="w-3.5 h-3.5 text-[#B58D3D]" />
                          Disparar Lembrete (1 Dia)
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DISPONIBILIZAR DIAS E HORÁRIOS */}
      {activeTab === 'disponibilidade' && (
        <div className="space-y-6">
          <UnifiedProfessionalCalendarPicker
            selectedDates={selectedDates}
            onChangeDates={setSelectedDates}
            selectedTimes={selectedTimes}
            onChangeTimes={setSelectedTimes}
            onSalvar={handleSalvarMultiplosHorarios}
          />

          {/* Horários cadastrados list */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E1D8] shadow-xs">
            <h4 className="text-sm font-serif font-bold text-[#434343] mb-3">
              Grade de Horários Cadastrados ({horarios.length})
            </h4>

            {horarios.length === 0 ? (
              <p className="text-xs text-[#8E8D8A] text-center py-6">
                Nenhum horário cadastrado ainda. Use o formulário acima para indicar seus dias e horários livres.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {horarios.map((h) => (
                  <div
                    key={h.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      h.status === 'agendado'
                        ? 'bg-[#FDF0EE]/60 border-[#F7C4BE] text-[#E98074]'
                        : 'bg-[#F1F8E9]/60 border-[#D0E3B6] text-[#82954B]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#434343]">
                          {new Date(h.data + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            h.status === 'agendado'
                              ? 'bg-[#FDF0EE] text-[#E98074] border border-[#F7C4BE]'
                              : 'bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]'
                          }`}
                        >
                          {h.status === 'agendado' ? 'Agendado (Indisponível)' : 'Disponível'}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#5C5C5C] mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#8E8D8A]" />
                        {h.horaInicio} às {h.horaFim}
                      </p>
                    </div>

                    {h.status === 'disponivel' && (
                      <button
                        onClick={() => db.deleteHorario(h.id)}
                        className="p-1.5 text-[#8E8D8A] hover:text-[#E98074] hover:bg-[#FDF0EE] rounded-lg transition-colors cursor-pointer"
                        title="Remover horário"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AVALIAÇÕES RECEBIDAS */}
      {activeTab === 'avaliacoes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-[#434343] flex items-center gap-2">
              <Star className="w-4 h-4 text-[#B58D3D] fill-[#B58D3D]" />
              Feedbacks & Avaliações dos Pacientes
            </h3>
            <span className="text-xs text-[#8E8D8A]">
              Média Geral: <strong className="text-[#434343]">{mediaNota} / 5.0</strong>
            </span>
          </div>

          {avaliacoes.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E5E1D8] text-[#8E8D8A]">
              <Star className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#B58D3D]" />
              <p className="text-sm font-serif font-bold text-[#434343]">Nenhuma avaliação recebida até o momento.</p>
              <p className="text-xs mt-1 text-[#8E8D8A]">Após as consultas, os pacientes avaliam o atendimento no portal.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {avaliacoes.map((av) => (
                <div
                  key={av.id}
                  className="bg-white rounded-2xl p-4 border border-[#E5E1D8] space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-[#E5E1D8]/60 pb-2">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs text-[#434343]">{av.pacienteNome}</strong>
                      <span className="text-[11px] text-[#8E8D8A]">
                        • Atendimento em {new Date(av.dataAtendimento + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[#B58D3D]">
                      {[...Array(av.notaProfissional)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#B58D3D] text-[#B58D3D]" />
                      ))}
                      <span className="text-xs font-bold text-[#434343] ml-1">
                        {av.notaProfissional}.0
                      </span>
                    </div>
                  </div>

                  {av.comentarioProfissional && (
                    <p className="text-xs text-[#5C5C5C] bg-[#F8F5F0] p-2.5 rounded-lg border border-[#E5E1D8]">
                      "{av.comentarioProfissional}"
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#8E8D8A] pt-1">
                    <span>Pontualidade: <strong className="text-[#434343]">{av.pontualidade}/5</strong></span>
                    <span>Acolhimento: <strong className="text-[#434343]">{av.acolhimento}/5</strong></span>
                    <span>Recomendaria: <strong className="text-[#82954B]">{av.recomendaria ? 'Sim' : 'Não'}</strong></span>
                    {av.estagiarioNome && (
                      <span>Estagiário: <strong className="text-[#A37B75]">{av.estagiarioNome} ({av.notaEstagiario}/5)</strong></span>
                    )}
                  </div>
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

      {/* Atribuir Estagiário Modal */}
      <AtribuirEstagiarioModal
        isOpen={!!agendamentoParaAtribuir}
        onClose={() => setAgendamentoParaAtribuir(null)}
        agendamento={agendamentoParaAtribuir}
        onSuccess={() => setAgendamentos(db.getAgendamentosPorProfissional(profUser.id))}
      />
    </div>
  );
};
