import React, { useState } from 'react';
import { db } from '../services/db';
import { EstagiarioUser } from '../types';
import {
  Award,
  Clock,
  CheckCircle2,
  Users,
  User,
  Calendar,
  FileText,
  X,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';

interface AtribuirHorasModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEstagiarioId?: string;
  supervisorNome?: string;
  supervisorId?: string;
  supervisorRole?: 'orientador' | 'admin';
  onSuccess?: () => void;
}

export const AtribuirHorasModal: React.FC<AtribuirHorasModalProps> = ({
  isOpen,
  onClose,
  defaultEstagiarioId,
  supervisorNome = 'Supervisão de Estágios',
  supervisorId,
  supervisorRole = 'orientador',
  onSuccess
}) => {
  const estagiarios = db.getEstagiarios();

  // Mode: individual or batch ('lote')
  const [modo, setModo] = useState<'individual' | 'lote'>(defaultEstagiarioId ? 'individual' : 'lote');
  const [selectedSingleId, setSelectedSingleId] = useState<string>(
    defaultEstagiarioId || (estagiarios.length > 0 ? estagiarios[0].id : '')
  );

  // Selected interns for batch mode
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>(
    defaultEstagiarioId ? [defaultEstagiarioId] : estagiarios.map(e => e.id)
  );

  // Filter by turma for batch mode
  const [turmaFilter, setTurmaFilter] = useState<string>('todas');

  // Form fields
  const [horas, setHoras] = useState<number>(4);
  const [tipoAtividade, setTipoAtividade] = useState<string>('Supervisão Clínica Docente');
  const [customTipoAtividade, setCustomTipoAtividade] = useState<string>('');
  const [dataAtividade, setDataAtividade] = useState<string>(new Date().toISOString().split('T')[0]);
  const [descricao, setDescricao] = useState<string>('Participação integral e discussão de casos clínicos supervisionados.');
  const [validarImediatamente, setValidarImediatamente] = useState<boolean>(true);
  const [parecer, setParecer] = useState<string>(
    `Horas homologadas e validadas pela ${supervisorRole === 'admin' ? 'Coordenação Geral' : 'Orientação de Estágio'} da Clínica Escola Campos Salles.`
  );

  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  if (!isOpen) return null;

  const turmasUnicas = Array.from(new Set(estagiarios.map(e => e.turma))).filter(Boolean);

  const estagiariosFiltrados = turmaFilter === 'todas'
    ? estagiarios
    : estagiarios.filter(e => e.turma === turmaFilter);

  const handleToggleSelectAll = () => {
    const idsVisiveis = estagiariosFiltrados.map(e => e.id);
    const todosVisiveisEstaoSelecionados = idsVisiveis.every(id => selectedBatchIds.includes(id));

    if (todosVisiveisEstaoSelecionados) {
      setSelectedBatchIds(selectedBatchIds.filter(id => !idsVisiveis.includes(id)));
    } else {
      const novosIds = Array.from(new Set([...selectedBatchIds, ...idsVisiveis]));
      setSelectedBatchIds(novosIds);
    }
  };

  const handleToggleEstagiario = (id: string) => {
    if (selectedBatchIds.includes(id)) {
      setSelectedBatchIds(selectedBatchIds.filter(i => i !== id));
    } else {
      setSelectedBatchIds([...selectedBatchIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg('');

    if (horas <= 0) {
      setFeedbackMsg('A quantidade de horas deve ser superior a zero.');
      return;
    }

    const targetIds = modo === 'individual' ? [selectedSingleId] : selectedBatchIds;

    if (targetIds.length === 0) {
      setFeedbackMsg('Selecione pelo menos um estagiário para atribuir as horas.');
      return;
    }

    const atividadeFinal = tipoAtividade === 'Outro' ? customTipoAtividade.trim() : tipoAtividade;
    if (!atividadeFinal) {
      setFeedbackMsg('Por favor, informe a atividade realizada.');
      return;
    }

    try {
      db.atribuirHorasEmLote(targetIds, {
        horas: Number(horas),
        tipoAtividade: atividadeFinal,
        data: dataAtividade,
        descricao: descricao.trim() || `Atividade de estágio: ${atividadeFinal}`,
        validado: validarImediatamente,
        parecer: parecer.trim(),
        aprovadoPorNome: supervisorNome,
        orientadorId: supervisorId,
        orientadorNome: supervisorNome
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setFeedbackMsg(err.message || 'Erro ao atribuir horas.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-[#E5E1D8] space-y-5 my-6 text-[#434343]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F1F8E9] flex items-center justify-center text-[#82954B] border border-[#D0E3B6]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#434343]">
                Atribuir Horas de Estágio
              </h3>
              <p className="text-xs text-[#8E8D8A]">
                Lançamento individual ou em lote com validação e abatimento imediato na meta do aluno
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8E8D8A] hover:text-[#434343] hover:bg-[#F8F5F0] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedbackMsg && (
          <div className="p-3 bg-[#FDF0EE] border border-[#F7C4BE] rounded-xl flex items-center gap-2 text-xs text-[#E98074]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Mode Selector (Individual vs Em Lote) */}
          <div className="bg-[#F8F5F0] p-1.5 rounded-2xl border border-[#E5E1D8] flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setModo('individual')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                modo === 'individual'
                  ? 'bg-white text-[#82954B] shadow-xs border border-[#E5E1D8]'
                  : 'text-[#8E8D8A] hover:text-[#434343]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Lançamento Individual
            </button>
            <button
              type="button"
              onClick={() => setModo('lote')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                modo === 'lote'
                  ? 'bg-[#82954B] text-white shadow-xs'
                  : 'text-[#8E8D8A] hover:text-[#434343]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Lançamento em Lote (Grupo / Turma)
            </button>
          </div>

          {/* Mode: Individual Selection */}
          {modo === 'individual' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#5C5C5C]">
                Estagiário Selecionado *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#82954B] absolute left-3 top-3" />
                <select
                  value={selectedSingleId}
                  onChange={(e) => setSelectedSingleId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl font-semibold text-[#434343] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#82954B]"
                >
                  {estagiarios.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.nome} — {e.turma} (CPF: {e.cpf})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Mode: Batch Selection (Em Lote) */}
          {modo === 'lote' && (
            <div className="p-3.5 bg-[#FDFBF7] border border-[#E5E1D8] rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#434343] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#82954B]" />
                    Estagiários Alvo ({selectedBatchIds.length} selecionados)
                  </span>
                </div>
                
                {/* Turma filter */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#8E8D8A]">Filtrar Turma:</span>
                  <select
                    value={turmaFilter}
                    onChange={(e) => setTurmaFilter(e.target.value)}
                    className="px-2 py-1 bg-white border border-[#E5E1D8] rounded-lg text-xs font-medium"
                  >
                    <option value="todas">Todas as Turmas ({estagiarios.length})</option>
                    {turmasUnicas.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="px-2.5 py-1 bg-white hover:bg-[#EDEAE3] border border-[#E5E1D8] rounded-lg text-[11px] font-bold text-[#82954B] cursor-pointer"
                  >
                    Marcar/Desmarcar Todos
                  </button>
                </div>
              </div>

              {/* Interns Checkbox List */}
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {estagiariosFiltrados.map(e => {
                  const isChecked = selectedBatchIds.includes(e.id);
                  return (
                    <label
                      key={e.id}
                      onClick={() => handleToggleEstagiario(e.id)}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-[#F1F8E9] border-[#D0E3B6] text-[#434343]'
                          : 'bg-white border-[#E5E1D8] text-[#8E8D8A] hover:bg-[#F8F5F0]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                          isChecked ? 'bg-[#82954B] border-[#82954B] text-white' : 'border-[#D8D2C2] bg-white'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-semibold text-[#434343]">{e.nome}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/80 border border-[#E5E1D8] text-[#82954B]">
                        {e.turma}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Activity Data and Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-[#5C5C5C] mb-1">
                Horas a Computar *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-[#82954B] absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="0.5"
                  max="200"
                  step="0.5"
                  required
                  value={horas}
                  onChange={(e) => setHoras(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl font-bold text-sm text-[#434343] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#82954B]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#5C5C5C] mb-1">
                Data de Realização *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#82954B] absolute left-3 top-2.5" />
                <input
                  type="date"
                  required
                  value={dataAtividade}
                  onChange={(e) => setDataAtividade(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl text-xs font-semibold text-[#434343] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#82954B]"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-[#5C5C5C] mb-1">
                Tipo de Atividade / Categoria *
              </label>
              <select
                value={tipoAtividade}
                onChange={(e) => setTipoAtividade(e.target.value)}
                className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl text-xs font-semibold text-[#434343] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#82954B]"
              >
                <option value="Supervisão Clínica Docente">Supervisão Clínica Docente (Estudo e Discussão)</option>
                <option value="Plantão e Acolhimento Psicológico">Plantão e Acolhimento Psicológico</option>
                <option value="Atendimento Clínico Supervisionado">Atendimento Clínico Supervisionado</option>
                <option value="Workshop / Capacitação Teórico-Prática">Workshop / Capacitação Teórico-Prática</option>
                <option value="Estudo de Caso & Discussão de Prontuários">Estudo de Caso & Discussão de Prontuários</option>
                <option value="Ação Social / Mutirão Comunitário">Ação Social / Mutirão Comunitário</option>
                <option value="Atribuição Direta de Horas Complementares">Atribuição Direta de Horas Complementares</option>
                <option value="Outro">Outra Atividade Personalizada...</option>
              </select>
            </div>

            {tipoAtividade === 'Outro' && (
              <div className="sm:col-span-2">
                <label className="block font-bold text-[#5C5C5C] mb-1">
                  Especifique a Atividade *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome da atividade ou evento"
                  value={customTipoAtividade}
                  onChange={(e) => setCustomTipoAtividade(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5E1D8] rounded-xl text-xs text-[#434343]"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block font-bold text-[#5C5C5C] mb-1">
                Descrição / Justificativa da Atividade
              </label>
              <textarea
                rows={2}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Detalhes dos temas abordados, conteúdos práticos ou objetivos pedagógicos..."
                className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl text-xs text-[#434343] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#82954B]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-[#5C5C5C] mb-1">
                Parecer do Orientador / Homologação
              </label>
              <textarea
                rows={2}
                value={parecer}
                onChange={(e) => setParecer(e.target.value)}
                placeholder="Parecer formal sobre o aproveitamento das horas..."
                className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl text-xs text-[#434343] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#82954B]"
              />
            </div>
          </div>

          {/* Validation switch */}
          <div className="p-3 bg-[#F1F8E9] border border-[#D0E3B6] rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#82954B]" />
              <div>
                <p className="text-xs font-bold text-[#434343]">Validar e Homologar Automaticamente</p>
                <p className="text-[11px] text-[#82954B]">
                  As {horas}h serão imediatamente abatidas na meta de estágio dos {modo === 'individual' ? '1 estagiário' : `${selectedBatchIds.length} estagiários`}.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={validarImediatamente}
              onChange={(e) => setValidarImediatamente(e.target.checked)}
              className="w-4 h-4 accent-[#82954B] cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E1D8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-[#5C5C5C] hover:bg-[#F8F5F0] rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#82954B] hover:bg-[#6D7D3F] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              {modo === 'individual'
                ? `Atribuir +${horas}h para o Estagiário`
                : `Atribuir +${horas}h em Lote (${selectedBatchIds.length} alunos)`}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
