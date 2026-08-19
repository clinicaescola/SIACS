import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Acompanhamento, PacienteUser, Agendamento } from '../types';
import { useAuth } from '../context/AuthContext';
import { AcompanhamentoPrintModal } from './AcompanhamentoPrintModal';
import {
  FileCheck2,
  X,
  Plus,
  Calendar,
  Clock,
  User,
  GraduationCap,
  Stethoscope,
  CheckCircle,
  AlertCircle,
  History,
  FileSpreadsheet,
  Printer
} from 'lucide-react';

interface AcompanhamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pacienteId: string;
  agendamentoId?: string;
  readOnly?: boolean;
}

export const AcompanhamentoModal: React.FC<AcompanhamentoModalProps> = ({
  isOpen,
  onClose,
  pacienteId,
  agendamentoId,
  readOnly = false
}) => {
  const { currentUser } = useAuth();
  
  const [paciente, setPaciente] = useState<PacienteUser | undefined>();
  const [agendamento, setAgendamento] = useState<Agendamento | undefined>();
  const [historico, setHistorico] = useState<Acompanhamento[]>([]);
  const [activeTab, setActiveTab] = useState<'novo' | 'historico'>('novo');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Form states (Data & Observações conforme requisitos)
  const [dataAtendimento, setDataAtendimento] = useState<string>(new Date().toISOString().split('T')[0]);
  const [numeroSessao, setNumeroSessao] = useState<number>(1);
  const [observacoes, setObservacoes] = useState<string>('');
  const [tecnicasUtilizadas, setTecnicasUtilizadas] = useState<string>('');
  const [planoProximosPassos, setPlanoProximosPassos] = useState<string>('');
  const [statusPresenca, setStatusPresenca] = useState<'Presente' | 'Faltou' | 'Justificado'>('Presente');

  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !pacienteId) return;

    const pac = db.getPacientes().find(p => p.id === pacienteId);
    setPaciente(pac);

    if (agendamentoId) {
      const ag = db.getAgendamentoById(agendamentoId);
      setAgendamento(ag);
      if (ag) {
        setDataAtendimento(ag.data);
      }
    }

    const acompList = db.getAcompanhamentosByPacienteId(pacienteId);
    setHistorico(acompList);
    setNumeroSessao(acompList.length + 1);

    if (readOnly && acompList.length > 0) {
      setActiveTab('historico');
    } else {
      setActiveTab('novo');
    }

    setObservacoes('');
    setTecnicasUtilizadas('');
    setPlanoProximosPassos('');
    setSavedSuccess(false);
  }, [isOpen, pacienteId, agendamentoId, readOnly]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!observacoes.trim()) {
      alert('Por favor informe as observações e detalhes pertinentes ao atendimento.');
      return;
    }

    setSaving(true);

    const prof = currentUser?.role === 'profissional'
      ? currentUser
      : (agendamento ? { id: agendamento.profissionalId, nome: agendamento.profissionalNome } : db.getProfissionais()[0]);

    const est = currentUser?.role === 'estagiario'
      ? currentUser
      : (agendamento ? { id: agendamento.estagiarioId, nome: agendamento.estagiarioNome } : db.getEstagiarios()[0]);

    const orient = db.getOrientadores()[0];
    const numProntuario = paciente?.numeroProntuario || db.getNumeroProntuarioPaciente(pacienteId);

    db.salvarAcompanhamento({
      pacienteId,
      pacienteNome: paciente?.nome || 'Paciente',
      numeroProntuario: numProntuario,
      agendamentoId,
      numeroSessao,
      data: dataAtendimento,
      observacoes,
      tecnicasUtilizadas,
      planoProximosPassos,
      statusPresenca,
      profissionalId: prof.id,
      profissionalNome: prof.nome,
      estagiarioId: est?.id,
      estagiarioNome: est?.nome,
      orientadorId: orient?.id,
      orientadorNome: orient?.nome
    });

    const updated = db.getAcompanhamentosByPacienteId(pacienteId);
    setHistorico(updated);
    setSaving(false);
    setSavedSuccess(true);

    setTimeout(() => {
      setActiveTab('historico');
      setSavedSuccess(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E5E1D8] overflow-hidden animate-in zoom-in-95 text-[#434343]">
        
        {/* Header */}
        <div className="p-5 bg-[#82954B] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <FileCheck2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-bold">Registro de Acompanhamento Clínico</h2>
                <span className="text-[11px] font-mono font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                  Prontuário: {paciente?.numeroProntuario || db.getNumeroProntuarioPaciente(pacienteId)}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                Evolução de Sessões • Paciente: <strong>{paciente?.nome}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-abrir-print-acomp-modal"
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Visualizar e Imprimir Ficha de Acompanhamento ou Baixar em PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E5E1D8] bg-[#F8F5F0] p-1.5">
          {!readOnly && (
            <button
              id="tab-novo-acomp"
              onClick={() => setActiveTab('novo')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'novo'
                  ? 'bg-white text-[#82954B] shadow-xs border border-[#E5E1D8]'
                  : 'text-[#8E8D8A] hover:text-[#434343]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Lançar Novo Acompanhamento (Sessão {numeroSessao})
            </button>
          )}

          <button
            id="tab-historico-acomp"
            onClick={() => setActiveTab('historico')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'historico'
                ? 'bg-white text-[#82954B] shadow-xs border border-[#E5E1D8]'
                : 'text-[#8E8D8A] hover:text-[#434343]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Histórico de Evoluções ({historico.length} registros)
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {savedSuccess && (
            <div className="mb-4 p-3 bg-[#F1F8E9] border border-[#D0E3B6] rounded-xl flex items-center gap-2 text-[#82954B] text-xs font-semibold animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-[#82954B]" />
              Evolução clínica registrada com sucesso na tabela de Acompanhamento!
            </div>
          )}

          {/* TAB: NOVO REGISTRO */}
          {activeTab === 'novo' && !readOnly && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-[#E5E1D8]">
                <div>
                  <label className="block text-xs font-semibold text-[#434343] mb-1">
                    Data do Atendimento *
                  </label>
                  <input
                    id="acomp-data"
                    type="date"
                    required
                    value={dataAtendimento}
                    onChange={(e) => setDataAtendimento(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FDFBF7] border border-[#E5E1D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#434343] mb-1">
                    Número da Sessão
                  </label>
                  <input
                    id="acomp-numero-sessao"
                    type="number"
                    min={1}
                    value={numeroSessao}
                    onChange={(e) => setNumeroSessao(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#FDFBF7] border border-[#E5E1D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#434343] mb-1">
                    Presença do Paciente *
                  </label>
                  <select
                    id="acomp-presenca"
                    value={statusPresenca}
                    onChange={(e) => setStatusPresenca(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#FDFBF7] border border-[#E5E1D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                  >
                    <option value="Presente">Presente</option>
                    <option value="Faltou">Faltou (Sem Justificativa)</option>
                    <option value="Justificado">Falta Justificada</option>
                  </select>
                </div>
              </div>

              {/* Observações - Requisito explícito */}
              <div>
                <label className="block text-xs font-bold text-[#434343] mb-1">
                  Observações e Detalhes Pertinentes ao Atendimento *
                </label>
                <textarea
                  id="acomp-observacoes"
                  required
                  rows={5}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Relate os temas abordados, dinâmicas trabalhadas, fala do paciente, reações emocionais e percepção clínica da sessão..."
                  className="w-full p-3 text-xs bg-white border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#434343] mb-1">
                    Técnicas / Intervenções Realizadas
                  </label>
                  <textarea
                    rows={3}
                    value={tecnicasUtilizadas}
                    onChange={(e) => setTecnicasUtilizadas(e.target.value)}
                    placeholder="ex: Psicoeducação, Diário de registros, Reestruturação cognitiva, Escuta livre..."
                    className="w-full p-2.5 text-xs bg-white border border-[#E5E1D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#434343] mb-1">
                    Plano para os Próximos Encontros
                  </label>
                  <textarea
                    rows={3}
                    value={planoProximosPassos}
                    onChange={(e) => setPlanoProximosPassos(e.target.value)}
                    placeholder="Metas terapêuticas para a próxima sessão, tarefas entre sessões..."
                    className="w-full p-2.5 text-xs bg-white border border-[#E5E1D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-salvar-acomp"
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 px-4 bg-[#82954B] hover:bg-[#68793B] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  {saving ? 'Gravando no Prontuário...' : 'Registrar Evolução na Tabela Acompanhamento'}
                </button>
              </div>
            </form>
          )}

          {/* TAB: HISTÓRICO DE SESSÕES */}
          {activeTab === 'historico' && (
            <div className="space-y-4">
              {historico.length === 0 ? (
                <div className="text-center py-10 text-[#8E8D8A]">
                  <FileCheck2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-semibold text-[#434343]">Nenhuma evolução lançada para este paciente ainda.</p>
                  <p className="text-xs">Clique na aba "Lançar Novo Acompanhamento" para adicionar.</p>
                </div>
              ) : (
                historico.map((sessao) => (
                  <div
                    key={sessao.id}
                    className="p-4 rounded-xl border border-[#E5E1D8] bg-white hover:border-[#82954B]/50 transition-all shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-[#E5E1D8]/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]">
                          Sessão #{sessao.numeroSessao}
                        </span>
                        <span className="text-xs font-bold text-[#434343] flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#8E8D8A]" />
                          {new Date(sessao.data + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-[11px] font-mono text-[#82954B] bg-[#F1F8E9] px-2 py-0.5 rounded-md border border-[#D0E3B6]">
                          {sessao.numeroProntuario || paciente?.numeroProntuario || 'PSI-2026/0001'}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          sessao.statusPresenca === 'Presente'
                            ? 'bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]'
                            : 'bg-[#FDF0EE] text-[#E98074] border border-[#F7C4BE]'
                        }`}
                      >
                        {sessao.statusPresenca}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[#434343] mb-0.5">Observações Clínicas:</p>
                      <p className="text-xs text-[#5C5C5C] whitespace-pre-line bg-[#F8F5F0] p-2.5 rounded-lg border border-[#E5E1D8]">
                        {sessao.observacoes}
                      </p>
                    </div>

                    {(sessao.tecnicasUtilizadas || sessao.planoProximosPassos) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5C5C5C] pt-1">
                        {sessao.tecnicasUtilizadas && (
                          <div>
                            <span className="font-semibold text-[#434343]">Técnicas: </span>
                            {sessao.tecnicasUtilizadas}
                          </div>
                        )}
                        {sessao.planoProximosPassos && (
                          <div>
                            <span className="font-semibold text-[#434343]">Próximos passos: </span>
                            {sessao.planoProximosPassos}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#E5E1D8]/60 flex items-center justify-between text-[11px] text-[#8E8D8A]">
                      <span>Equipe: {sessao.profissionalNome} & {sessao.estagiarioNome || 'Estagiário'}</span>
                      <span>Orientação: {sessao.orientadorNome || 'Coordenação'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F8F5F0] border-t border-[#E5E1D8] flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#82954B] bg-[#F1F8E9] hover:bg-[#E5EED8] border border-[#D0E3B6] rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Exportar Ficha (A4 / PDF)</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#434343] bg-[#EFEAE2] hover:bg-[#E5E1D8] rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Modal de Impressão e PDF do Acompanhamento */}
      <AcompanhamentoPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        initialPacienteId={pacienteId}
      />
    </div>
  );
};
