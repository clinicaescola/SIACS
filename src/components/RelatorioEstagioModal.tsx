import React, { useState } from 'react';
import { db } from '../services/db';
import { RelatorioEstagio, Agendamento, EstagiarioUser } from '../types';
import {
  X,
  GraduationCap,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface RelatorioEstagioModalProps {
  isOpen: boolean;
  onClose: () => void;
  estagiario: EstagiarioUser;
  agendamento?: Agendamento | null;
  onSuccess?: () => void;
}

export const RelatorioEstagioModal: React.FC<RelatorioEstagioModalProps> = ({
  isOpen,
  onClose,
  estagiario,
  agendamento,
  onSuccess
}) => {
  const [dataAtendimento, setDataAtendimento] = useState<string>(
    agendamento?.data || new Date().toISOString().split('T')[0]
  );
  const [horasComputadas, setHorasComputadas] = useState<number>(2);
  const [pacienteNome, setPacienteNome] = useState<string>(agendamento?.pacienteNome || '');
  const [profissionalNome, setProfissionalNome] = useState<string>(agendamento?.profissionalNome || '');
  const [resumoCaso, setResumoCaso] = useState<string>('');
  const [atividadesRealizadas, setAtividadesRealizadas] = useState<string>(
    'Acompanhamento de sessão clínica, observação da aliança terapêutica, anotações de evolução e discussão de caso.'
  );
  const [avaliacaoAutoCritica, setAvaliacaoAutoCritica] = useState<string>('');
  const [dificuldadesEncontradas, setDificuldadesEncontradas] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!resumoCaso.trim()) {
      setErrorMsg('Por favor, descreva o resumo do caso / atendimento acompanhado.');
      return;
    }

    if (!avaliacaoAutoCritica.trim()) {
      setErrorMsg('Por favor, registre sua autoavaliação e reflexão crítica sobre a sessão.');
      return;
    }

    if (horasComputadas <= 0) {
      setErrorMsg('A quantidade de horas de estágio deve ser maior que 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      db.addRelatorioEstagio({
        estagiarioId: estagiario.id,
        estagiarioNome: estagiario.nome,
        estagiarioTurma: estagiario.turma,
        agendamentoId: agendamento?.id,
        pacienteId: agendamento?.pacienteId,
        pacienteNome: pacienteNome || agendamento?.pacienteNome || 'Paciente da Clínica Escola',
        profissionalId: agendamento?.profissionalId,
        profissionalNome: profissionalNome || agendamento?.profissionalNome || 'Profissional Supervisor',
        orientadorId: agendamento?.orientadorId,
        orientadorNome: agendamento?.orientadorNome,
        dataSessao: dataAtendimento,
        horario: agendamento?.horario || '14:00 - 15:00',
        horasComputadas: Number(horasComputadas),
        avaliacaoReflexiva: avaliacaoAutoCritica.trim(),
        resumoCaso: resumoCaso.trim(),
        atividadesRealizadas: atividadesRealizadas.trim(),
        avaliacaoAutoCritica: avaliacaoAutoCritica.trim(),
        dificuldadesEncontradas: dificuldadesEncontradas.trim() || undefined
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao registrar relatório de estágio.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="relatorio-estagio-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-[#FDFBF7] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E5E1D8] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E1D8] bg-[#F8F5F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#82954B]/15 text-[#82954B]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#434343]">
                Lançar Avaliação e Relatório de Estágio
              </h3>
              <p className="text-xs text-[#8E8D8A]">
                Estagiário: <strong className="text-[#434343]">{estagiario.nome}</strong> • Turma: {estagiario.turma}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E8D8A] hover:text-[#434343] hover:bg-[#EAE7DC] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 bg-[#FDF0EE] border border-[#F5C2BC] rounded-xl flex items-start gap-2.5 text-xs text-[#C84B31]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-3.5 bg-[#F1F8E9] border border-[#D0E3B6] rounded-2xl text-xs text-[#82954B] flex items-center gap-3">
            <Sparkles className="w-5 h-5 shrink-0 text-[#82954B]" />
            <div>
              <p className="font-bold">Contabilização de Horas Supervisionadas</p>
              <p className="text-[#5C5C5C] text-[11px]">
                Ao enviar este relatório, ele será enviado para o painel da Orientação de Estágio e essas horas serão computadas e abatidas da sua meta obrigatória de horas assim que validadas.
              </p>
            </div>
          </div>

          <form id="relatorio-estagio-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Grid 1: Date & Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#5C5C5C] mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#82954B]" />
                  Data da Atividade / Sessão *
                </label>
                <input
                  type="date"
                  required
                  value={dataAtendimento}
                  onChange={(e) => setDataAtendimento(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5C5C] mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#82954B]" />
                  Horas de Estágio a Computar *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  required
                  value={horasComputadas}
                  onChange={(e) => setHorasComputadas(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                />
                <span className="text-[10px] text-[#8E8D8A]">Ex: 2 horas (consulta + estudo e discussão de caso)</span>
              </div>
            </div>

            {/* Grid 2: Paciente & Profissional */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#5C5C5C] mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#82954B]" />
                  Paciente / Iniciais do Atendido *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome ou iniciais do paciente"
                  value={pacienteNome}
                  onChange={(e) => setPacienteNome(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5C5C] mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#82954B]" />
                  Profissional Supervisor / Co-terapeuta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome do profissional responsável"
                  value={profissionalNome}
                  onChange={(e) => setProfissionalNome(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                />
              </div>
            </div>

            {/* Resumo do Caso */}
            <div>
              <label className="block text-xs font-bold text-[#5C5C5C] mb-1">
                Resumo Clínico do Caso / Contexto da Sessão *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Descreva brevemente a queixa, contexto clínico abordado e pontos chave da sessão..."
                value={resumoCaso}
                onChange={(e) => setResumoCaso(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
              />
            </div>

            {/* Atividades Realizadas */}
            <div>
              <label className="block text-xs font-bold text-[#5C5C5C] mb-1">
                Atividades e Técnicas Desenvolvidas pelo Estagiário *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Ex: Aplicação de técnicas de escuta ativa, psicoeducação, registro de pensamentos automáticos..."
                value={atividadesRealizadas}
                onChange={(e) => setAtividadesRealizadas(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
              />
            </div>

            {/* Autoavaliação Crítica do Estagiário */}
            <div>
              <label className="block text-xs font-bold text-[#5C5C5C] mb-1">
                Autoavaliação Crítica e Aprendizados do Estagiário *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Escreva sua reflexão crítica: como você avalia seu desempenho, empatia, postura ética e integração teórico-prática nesta atividade..."
                value={avaliacaoAutoCritica}
                onChange={(e) => setAvaliacaoAutoCritica(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
              />
            </div>

            {/* Dificuldades Encontradas */}
            <div>
              <label className="block text-xs font-bold text-[#5C5C5C] mb-1">
                Dificuldades Encontradas / Dúvidas para Supervisão (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Manejo de resistências, dúvidas conceituais para levar à orientadora..."
                value={dificuldadesEncontradas}
                onChange={(e) => setDificuldadesEncontradas(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-[#E5E1D8] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-[#5C5C5C] hover:bg-[#EAE7DC] rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold bg-[#82954B] hover:bg-[#6D7D3F] text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isSubmitting ? 'Enviando...' : 'Submeter Relatório para Orientação'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
