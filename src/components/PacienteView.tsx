import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import {
  HorarioDisponivel,
  Agendamento,
  PacienteUser,
  ProfissionalUser,
  NotificacaoDisparo
} from '../types';
import {
  Calendar,
  Clock,
  CheckCircle,
  HeartHandshake,
  Stethoscope,
  Star,
  MessageCircle,
  Mail,
  AlertCircle,
  CheckCheck,
  CalendarCheck,
  FileText,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Edit3
} from 'lucide-react';
import { AvaliacaoModal } from './AvaliacaoModal';
import { UserAvatar } from './UserAvatar';
import { EditProfileModal } from './EditProfileModal';
import { UnifiedPatientCalendarBooking } from './UnifiedPatientCalendarBooking';

export const PacienteView: React.FC = () => {
  const { currentUser } = useAuth();
  const pacienteUser = currentUser as PacienteUser;

  const [horariosDisponiveis, setHorariosDisponiveis] = useState<HorarioDisponivel[]>([]);
  const [meusAgendamentos, setMeusAgendamentos] = useState<Agendamento[]>([]);
  const [profissionais, setProfissionais] = useState<ProfissionalUser[]>([]);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);

  const [slotToBook, setSlotToBook] = useState<HorarioDisponivel | null>(null);
  const [modalidade, setModalidade] = useState<'Presencial' | 'Online'>('Presencial');
  const [motivo, setMotivo] = useState<string>('');

  // Booking confirmation state & modal
  const [agendamentoRecente, setAgendamentoRecente] = useState<{
    agendamento: Agendamento;
    notificacoes: NotificacaoDisparo[];
  } | null>(null);

  // Evaluation modal
  const [agendamentoParaAvaliar, setAgendamentoParaAvaliar] = useState<Agendamento | null>(null);

  const [activeTab, setActiveTab] = useState<'agendar' | 'meus-agendamentos'>('agendar');

  useEffect(() => {
    const refresh = () => {
      if (!pacienteUser) return;
      const allHorarios = db.getHorarios().filter(h => h.status === 'disponivel');
      setHorariosDisponiveis(allHorarios);

      const allAgendamentos = db.getAgendamentos().filter(a => a.pacienteId === pacienteUser.id);
      setMeusAgendamentos(allAgendamentos);

      setProfissionais(db.getProfissionais());
    };

    refresh();
    const unsub = db.subscribe(refresh);

    const handleCustomNav = (e: Event) => {
      const customEvent = e as CustomEvent<{ tabId: string }>;
      const tabId = customEvent.detail?.tabId;
      if (!tabId) return;

      if (tabId === 'paciente-tab-agendamentos') setActiveTab('meus-agendamentos');
      else if (tabId === 'paciente-tab-agendar') setActiveTab('agendar');
    };

    window.addEventListener('siacs-navigate-tab', handleCustomNav);

    return () => {
      unsub();
      window.removeEventListener('siacs-navigate-tab', handleCustomNav);
    };
  }, [pacienteUser]);

  const handleAgendarHorario = (horarioId: string) => {
    if (!pacienteUser) return;

    try {
      const result = db.criarAgendamento({
        horarioId,
        paciente: pacienteUser,
        modalidade: modalidade || 'Presencial',
        motivoConsulta: motivo || 'Acolhimento e acompanhamento na Clínica Escola'
      });

      setAgendamentoRecente({
        agendamento: result.agendamento,
        notificacoes: result.notificacoesCriadas
      });
      setSlotToBook(null);
      setMotivo('');
    } catch (e: any) {
      alert(e.message || 'Erro ao realizar agendamento.');
    }
  };

  const handleConfirmarPresenca = (agendamentoId: string) => {
    db.confirmarPresencaPaciente(agendamentoId);
    alert('Sua presença foi confirmada com sucesso! A equipe da clínica escola aguarda seu atendimento.');
  };

  const getDayOfWeekName = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return dias[dateObj.getDay()];
  };

  // Sort available slots chronologically
  const sortedHorariosDisponiveis = [...horariosDisponiveis].sort((a, b) => {
    if (a.data !== b.data) return a.data.localeCompare(b.data);
    return a.horaInicio.localeCompare(b.horaInicio);
  });

  return (
    <div className="space-y-6 text-[#434343]">
      {/* Patient Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E1D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar
            src={pacienteUser.foto}
            alt={pacienteUser.nome}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#E98074]/30"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-bold text-[#434343]">{pacienteUser.nome}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FDF0EE] text-[#E98074] border border-[#F7C4BE]">
                Paciente
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#EBF3FB] text-[#033B6C] border border-[#B3D4F5]">
                Prontuário: {pacienteUser.numeroProntuario || db.getNumeroProntuarioPaciente(pacienteUser.id)}
              </span>
              <button
                id="pac-edit-profile-btn"
                onClick={() => setIsEditProfileOpen(true)}
                className="ml-1 p-1 text-[#8E8D8A] hover:text-[#E98074] hover:bg-[#FDF0EE] rounded-lg transition-colors cursor-pointer"
                title="Editar meu cadastro (senha, e-mail e foto)"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-[#8E8D8A] mt-1">
              CPF: {pacienteUser.cpf} • Tel: {pacienteUser.telefone} • {pacienteUser.email}
            </p>
            <p className="text-xs text-[#8E8D8A]">
              Endereço: {pacienteUser.endereco}
            </p>
          </div>
        </div>

        {/* Quick patient status summary */}
        <div className="flex items-center gap-3">
          <div className="bg-[#F8F5F0] px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-center">
            <p className="text-xs text-[#8E8D8A]">Minhas Consultas</p>
            <p className="text-lg font-serif font-bold text-[#434343]">{meusAgendamentos.length}</p>
          </div>
          <div className="bg-[#F8F5F0] px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-center">
            <p className="text-xs text-[#8E8D8A]">Horários Abertos</p>
            <p className="text-lg font-serif font-bold text-[#82954B]">{horariosDisponiveis.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border border-[#E5E1D8] bg-white rounded-xl p-1 shadow-xs">
        <button
          id="pac-tab-agendar"
          onClick={() => setActiveTab('agendar')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'agendar'
              ? 'bg-[#82954B] text-white shadow-xs'
              : 'text-[#8E8D8A] hover:text-[#434343] hover:bg-[#F8F5F0]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Agendar Nova Consulta ({horariosDisponiveis.length} vagas)
        </button>

        <button
          id="pac-tab-meus"
          onClick={() => setActiveTab('meus-agendamentos')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'meus-agendamentos'
              ? 'bg-[#82954B] text-white shadow-xs'
              : 'text-[#8E8D8A] hover:text-[#434343] hover:bg-[#F8F5F0]'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          Meus Agendamentos ({meusAgendamentos.length})
        </button>
      </div>

      {/* TAB 1: AGENDAR CONSULTA - CALENDÁRIO ÚNICO */}
      {activeTab === 'agendar' && (
        <UnifiedPatientCalendarBooking
          horariosDisponiveis={horariosDisponiveis}
          onSelectSlot={(slot) => setSlotToBook(slot)}
        />
      )}

      {/* Modal de Confirmação de Agendamento da Vaga */}
      {slotToBook && (
        <div className="fixed inset-0 z-50 bg-[#434343]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E5E1D8] space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-3">
              <h3 className="text-base font-serif font-bold text-[#434343] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#82954B]" />
                Confirmar Agendamento
              </h3>
              <button
                onClick={() => setSlotToBook(null)}
                className="text-[#8E8D8A] hover:text-[#434343] p-1 rounded-lg hover:bg-[#F8F5F0] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#F1F8E9]/60 p-4 rounded-xl border border-[#D0E3B6] text-xs text-[#434343] space-y-1.5">
              <p>📅 <strong>Dia:</strong> {getDayOfWeekName(slotToBook.data)} ({new Date(slotToBook.data + 'T12:00:00Z').toLocaleDateString('pt-BR')})</p>
              <p>⏰ <strong>Horário:</strong> {slotToBook.horaInicio} às {slotToBook.horaFim}</p>
              <p>🩺 <strong>Especialidade:</strong> {slotToBook.especialidade || 'Psicologia Clínica'}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#5C5C5C] mb-1">
                  Modalidade do Atendimento:
                </label>
                <select
                  value={modalidade}
                  onChange={(e) => setModalidade(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-medium bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                >
                  <option value="Presencial">Presencial (Clínica Escola)</option>
                  <option value="Online">Online (Teleconsulta)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C5C5C] mb-1">
                  Motivo Breve / Queixa Principal (Opcional):
                </label>
                <input
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="ex: Acolhimento psicológico, ansiedade, orientação..."
                  className="w-full px-3 py-2 text-xs bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSlotToBook(null)}
                className="flex-1 py-2.5 border border-[#E5E1D8] text-[#5C5C5C] hover:bg-[#F8F5F0] font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-confirmar-agendamento-final"
                onClick={() => handleAgendarHorario(slotToBook.id)}
                className="flex-1 py-2.5 bg-[#82954B] hover:bg-[#6D7D3F] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEUS AGENDAMENTOS */}
      {activeTab === 'meus-agendamentos' && (
        <div className="space-y-4">
          <h3 className="text-sm font-serif font-bold text-[#434343] flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-[#82954B]" />
            Minhas Consultas Agendadas
          </h3>

          {meusAgendamentos.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E5E1D8] text-[#8E8D8A]">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30 text-[#82954B]" />
              <p className="text-sm font-serif font-bold text-[#434343]">Você ainda não possui consultas agendadas.</p>
              <p className="text-xs mt-1 text-[#8E8D8A]">Vá para a aba "Agendar Nova Consulta" para visualizar e selecionar as vagas e horários disponíveis.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {meusAgendamentos.map((ag) => {
                const foneProf = ag.profissionalTelefone.replace(/\D/g, '');
                const zapUrl = `https://api.whatsapp.com/send?phone=55${foneProf}&text=${encodeURIComponent('Olá, tenho consulta marcada na Clínica Escola no dia ' + ag.data + ' às ' + ag.horario)}`;
                const dayName = getDayOfWeekName(ag.data);

                return (
                  <div
                    key={ag.id}
                    className="bg-white rounded-2xl p-5 border border-[#E5E1D8] shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E1D8]/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#434343]">
                            Atendimento Clínico Supervisionado
                          </h4>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]">
                            {ag.tipoConsulta || 'Clínica Escola'}
                          </span>
                        </div>
                        <p className="text-xs text-[#8E8D8A] mt-0.5">
                          {ag.profissionalEspecialidade || 'Psicologia Clínica'} • Local: {ag.sala} ({ag.modalidade})
                        </p>
                      </div>

                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          ag.status === 'concluido'
                            ? 'bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]'
                            : ag.status === 'confirmado'
                            ? 'bg-[#FDF0EE] text-[#E98074] border border-[#F7C4BE]'
                            : 'bg-[#FBF4E6] text-[#B58D3D] border border-[#EED9B0]'
                        }`}
                      >
                        {ag.status === 'concluido' ? 'Concluída' : ag.status === 'confirmado' ? 'Confirmada' : 'Aguardando Atendimento'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F8F5F0] p-3 rounded-xl text-xs text-[#5C5C5C] border border-[#E5E1D8]">
                      <div>
                        <span className="text-[#8E8D8A] block text-[11px]">Dia da Semana e Horário:</span>
                        <strong className="text-[#434343]">
                          {dayName}, {new Date(ag.data + 'T12:00:00Z').toLocaleDateString('pt-BR')} às {ag.horario}
                        </strong>
                      </div>

                      <div>
                        <span className="text-[#8E8D8A] block text-[11px]">Estagiário Integrante:</span>
                        <strong className="text-[#A37B75]">{ag.estagiarioNome || 'Lucas Silveira'}</strong>
                      </div>

                      <div>
                        <span className="text-[#8E8D8A] block text-[11px]">Confirmação de Presença:</span>
                        <strong className={ag.confirmadoPeloPaciente ? 'text-[#82954B]' : 'text-[#B58D3D]'}>
                          {ag.confirmadoPeloPaciente ? '✅ Confirmada por você' : '⏳ Pendente'}
                        </strong>
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        {!ag.confirmadoPeloPaciente && ag.status !== 'concluido' && (
                          <button
                            id={`btn-confirmar-presenca-${ag.id}`}
                            onClick={() => handleConfirmarPresenca(ag.id)}
                            className="px-3 py-1.5 text-xs font-bold bg-[#82954B] hover:bg-[#6D7D3F] text-white rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Confirmar Presença (Lembrete 1 Dia)
                          </button>
                        )}

                        {ag.status === 'concluido' && !ag.possuiAvaliacao && (
                          <button
                            id={`btn-avaliar-${ag.id}`}
                            onClick={() => setAgendamentoParaAvaliar(ag)}
                            className="px-3 py-1.5 text-xs font-bold bg-[#B58D3D] hover:bg-[#9A742A] text-white rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 fill-white" />
                            Avaliar Atendimento
                          </button>
                        )}

                        {ag.possuiAvaliacao && (
                          <span className="text-xs font-semibold text-[#82954B] bg-[#F1F8E9] px-2.5 py-1 rounded-lg border border-[#D0E3B6] flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-[#82954B] text-[#82954B]" />
                            Atendimento já avaliado por você
                          </span>
                        )}
                      </div>

                      <a
                        href={zapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[#82954B] hover:text-[#68793B] flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Falar no WhatsApp da Clínica
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal when a new booking is created */}
      {agendamentoRecente && (
        <div className="fixed inset-0 z-50 bg-[#434343]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E5E1D8] space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6] flex items-center justify-center">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#434343]">
                  Consulta Agendada com Sucesso!
                </h3>
                <p className="text-xs text-[#8E8D8A]">
                  Notificações automáticas foram disparadas aos envolvidos.
                </p>
              </div>
            </div>

            <div className="bg-[#F1F8E9]/60 p-4 rounded-xl border border-[#D0E3B6] text-xs text-[#434343] space-y-1.5">
              <p>📅 <strong>Dia e Data:</strong> {getDayOfWeekName(agendamentoRecente.agendamento.data)}, {new Date(agendamentoRecente.agendamento.data + 'T12:00:00Z').toLocaleDateString('pt-BR')}</p>
              <p>⏰ <strong>Horário:</strong> {agendamentoRecente.agendamento.horario}</p>
              <p>🏥 <strong>Atendimento:</strong> {agendamentoRecente.agendamento.tipoConsulta || 'Atendimento Clínico Supervisionado'} - Clínica Escola</p>
              <p>📍 <strong>Local:</strong> {agendamentoRecente.agendamento.sala} ({agendamentoRecente.agendamento.modalidade})</p>
            </div>

            <div className="bg-[#F8F5F0] p-3 rounded-xl border border-[#E5E1D8] text-xs text-[#5C5C5C] space-y-1">
              <p className="font-bold text-[#434343]">✉️ Disparos realizados:</p>
              <p>• E-mail e WhatsApp enviados para você ({pacienteUser.email});</p>
              <p>• Notificação enviada para o profissional e estagiário;</p>
              <p>• Lembrete automático configurado para 1 dia antes da sessão.</p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setAgendamentoRecente(null);
                  setActiveTab('meus-agendamentos');
                }}
                className="w-full py-2.5 bg-[#82954B] hover:bg-[#6D7D3F] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Entendido, Ver Meus Agendamentos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avaliação Modal */}
      {agendamentoParaAvaliar && (
        <AvaliacaoModal
          isOpen={true}
          onClose={() => setAgendamentoParaAvaliar(null)}
          agendamento={agendamentoParaAvaliar}
        />
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </div>
  );
};
