import React, { useState } from 'react';
import { db } from '../services/db';
import { EstagiarioUser, RelatorioEstagio } from '../types';
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Check,
  X,
  Edit2,
  Filter,
  Sparkles,
  Search,
  BookOpen,
  Award,
  ChevronDown,
  PlusCircle,
  Users
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { AtribuirHorasModal } from './AtribuirHorasModal';

interface HorasEstagioDashboardProps {
  currentRole: 'orientador' | 'admin';
}

export const HorasEstagioDashboard: React.FC<HorasEstagioDashboardProps> = ({ currentRole }) => {
  const estagiarios = db.getEstagiarios();
  const [selectedEstagiarioId, setSelectedEstagiarioId] = useState<string>(
    estagiarios.length > 0 ? estagiarios[0].id : ''
  );
  const [isEditingHoras, setIsEditingHoras] = useState<boolean>(false);
  const [novaMetaHoras, setNovaMetaHoras] = useState<number>(100);
  const [isAtribuirModalOpen, setIsAtribuirModalOpen] = useState<boolean>(false);

  // Parecer state for review modal/inline action
  const [reviewingRelatorioId, setReviewingRelatorioId] = useState<string | null>(null);
  const [parecerTexto, setParecerTexto] = useState<string>('Horas validadas com sucesso. Bom aproveitamento teórico-prático e reflexão crítica adequada.');

  const selectedEstagiario = estagiarios.find(e => e.id === selectedEstagiarioId);
  const horasStatus = selectedEstagiarioId ? db.getHorasEstagioStatus(selectedEstagiarioId) : null;
  const relatorios = selectedEstagiarioId ? db.getRelatoriosByEstagiarioId(selectedEstagiarioId) : [];

  const handleSalvarNovaMeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEstagiarioId || novaMetaHoras <= 0) return;
    db.setHorasExigidas(selectedEstagiarioId, Number(novaMetaHoras));
    setIsEditingHoras(false);
  };

  const handleValidarRelatorio = (id: string, status: 'validado' | 'rejeitado') => {
    db.validarRelatorioEstagio(id, status, parecerTexto);
    setReviewingRelatorioId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Intern Selector */}
      <div className="bg-[#FDFBF7] border border-[#E5E1D8] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]">
              <Award className="w-3.5 h-3.5" /> Controle de Horas e Avaliações de Estágio
            </span>
          </div>
          <h2 className="font-serif font-bold text-xl text-[#434343]">
            Painel de Horas por Estagiário
          </h2>
          <p className="text-xs text-[#8E8D8A]">
            Selecione o estagiário na caixa de seleção abaixo para visualizar a meta de horas, abatimentos efetuados e validar relatórios.
          </p>
        </div>

        {/* Estagiario Dropdown Selector and Batch Assign Button */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <User className="w-4 h-4 text-[#82954B] absolute left-3 top-3" />
            <select
              id="select-estagiario-dashboard"
              value={selectedEstagiarioId}
              onChange={(e) => {
                setSelectedEstagiarioId(e.target.value);
                const est = estagiarios.find(item => item.id === e.target.value);
                if (est) setNovaMetaHoras(est.horasExigidas || 100);
              }}
              className="w-full pl-9 pr-8 py-2.5 bg-white border border-[#E5E1D8] rounded-xl text-xs font-bold text-[#434343] focus:outline-none focus:ring-2 focus:ring-[#82954B] shadow-xs cursor-pointer"
            >
              {estagiarios.map(e => (
                <option key={e.id} value={e.id}>
                  {e.nome} ({e.turma})
                </option>
              ))}
            </select>
          </div>

          <button
            id="btn-atribuir-horas-modal"
            onClick={() => setIsAtribuirModalOpen(true)}
            className="px-4 py-2.5 bg-[#82954B] hover:bg-[#6D7D3F] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Atribuir Horas (Lote / Indiv.)
          </button>
        </div>
      </div>

      {selectedEstagiario && horasStatus && (
        <>
          {/* Intern Profile Card & KPI Progress */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E1D8] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E1D8]/60 pb-5">
              <div className="flex items-center gap-3.5">
                <UserAvatar
                  src={selectedEstagiario.foto}
                  alt={selectedEstagiario.nome}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#82954B]/30"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-lg text-[#434343]">
                      {selectedEstagiario.nome}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F5EBE6] text-[#A37B75] border border-[#E5D2CB]">
                      {selectedEstagiario.turma}
                    </span>
                  </div>
                  <p className="text-xs text-[#8E8D8A] mt-0.5">
                    CPF: {selectedEstagiario.cpf} • {selectedEstagiario.email} • Tel: {selectedEstagiario.telefone}
                  </p>
                </div>
              </div>

              {/* Edit Required Hours Button */}
              <div>
                {!isEditingHoras ? (
                  <button
                    onClick={() => {
                      setNovaMetaHoras(horasStatus.horasExigidas);
                      setIsEditingHoras(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F8F5F0] hover:bg-[#EAE7DC] text-[#434343] border border-[#E5E1D8] transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#82954B]" />
                    Ajustar Meta de Horas ({horasStatus.horasExigidas}h)
                  </button>
                ) : (
                  <form onSubmit={handleSalvarNovaMeta} className="flex items-center gap-2 bg-[#F8F5F0] p-1.5 rounded-xl border border-[#D0E3B6]">
                    <span className="text-xs font-bold text-[#5C5C5C] pl-2">Nova Meta (h):</span>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={novaMetaHoras}
                      onChange={(e) => setNovaMetaHoras(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-xs bg-white border border-[#E5E1D8] rounded-lg font-bold text-[#434343]"
                    />
                    <button
                      type="submit"
                      className="p-1.5 bg-[#82954B] text-white rounded-lg hover:bg-[#6D7D3F] cursor-pointer"
                      title="Salvar"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingHoras(false)}
                      className="p-1.5 text-[#8E8D8A] hover:bg-white rounded-lg cursor-pointer"
                      title="Cancelar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Exigidas */}
              <div className="p-4 bg-[#F8F5F0] border border-[#E5E1D8] rounded-2xl">
                <span className="text-[11px] font-semibold text-[#8E8D8A] uppercase tracking-wider block">
                  Horas Exigidas (Meta)
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-serif font-bold text-[#434343]">
                    {horasStatus.horasExigidas}h
                  </span>
                  <span className="text-[11px] text-[#8E8D8A]">total cadastrado</span>
                </div>
              </div>

              {/* Card 2: Validadas / Cumpridas */}
              <div className="p-4 bg-[#F1F8E9] border border-[#D0E3B6] rounded-2xl">
                <span className="text-[11px] font-semibold text-[#82954B] uppercase tracking-wider block">
                  Horas Efetuadas (Validadas)
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-serif font-bold text-[#82954B]">
                    {horasStatus.horasCumpridas}h
                  </span>
                  <span className="text-[11px] text-[#82954B]/80">
                    ({horasStatus.percentualConcluido}%)
                  </span>
                </div>
              </div>

              {/* Card 3: Pendentes */}
              <div className="p-4 bg-[#FBF4E6] border border-[#EED9B0] rounded-2xl">
                <span className="text-[11px] font-semibold text-[#B58D3D] uppercase tracking-wider block">
                  Horas Pendentes de Análise
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-serif font-bold text-[#B58D3D]">
                    {horasStatus.horasPendentes}h
                  </span>
                  <span className="text-[11px] text-[#B58D3D]/80">a validar</span>
                </div>
              </div>

              {/* Card 4: Restantes (Abatimento) */}
              <div className="p-4 bg-[#FDF0EE] border border-[#F7C4BE] rounded-2xl">
                <span className="text-[11px] font-semibold text-[#E98074] uppercase tracking-wider block">
                  Saldo Restante a Cumprir
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-serif font-bold text-[#E98074]">
                    {horasStatus.horasRestantes}h
                  </span>
                  <span className="text-[11px] text-[#E98074]/80">restantes</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 bg-[#F8F5F0] p-4 rounded-2xl border border-[#E5E1D8]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#434343]">
                  Progresso de Conclusão do Estágio Supervisionado:
                </span>
                <span className="font-bold text-[#82954B] text-sm">
                  {horasStatus.horasCumpridas}h de {horasStatus.horasExigidas}h ({horasStatus.percentualConcluido}%)
                </span>
              </div>
              <div className="w-full h-3.5 bg-[#E5E1D8] rounded-full overflow-hidden flex">
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
                    title="Horas em análise pendente"
                  />
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#8E8D8A] pt-1">
                <span>🟢 {horasStatus.horasCumpridas}h Validadas</span>
                <span>🟡 {horasStatus.horasPendentes}h Em análise</span>
                <span>🔴 {horasStatus.horasRestantes}h Faltando</span>
              </div>
            </div>
          </div>

          {/* List of Reports & Evaluations Submitted by the Intern */}
          <div className="bg-[#FDFBF7] border border-[#E5E1D8] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#434343] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#82954B]" />
                  Avaliações e Relatórios de Atendimento do Estagiário ({relatorios.length})
                </h3>
                <p className="text-xs text-[#8E8D8A]">
                  Revise as autoavaliações, reflexões críticas e valide as horas de atendimento efetuadas.
                </p>
              </div>
            </div>

            {relatorios.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center border border-[#E5E1D8] text-[#8E8D8A]">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#82954B]" />
                <p className="font-serif font-bold text-sm text-[#434343]">
                  Nenhum relatório de estágio registrado para este estagiário até o momento.
                </p>
                <p className="text-xs mt-1 text-[#8E8D8A]">
                  Assim que o estagiário submeter sua avaliação clínica no painel dele, ela aparecerá aqui para validação de horas.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {relatorios.map((rel) => (
                  <div
                    key={rel.id}
                    className="bg-white rounded-2xl p-5 border border-[#E5E1D8] hover:border-[#82954B]/50 transition-all shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E1D8]/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#434343]">
                            Sessão: {rel.pacienteNome || 'Paciente da Clínica'}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F8F5F0] text-[#5C5C5C] border border-[#E5E1D8]">
                            Data: {new Date((rel.dataSessao || (rel as any).dataAtendimento || '2026-04-10') + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]">
                            +{rel.horasComputadas} Horas
                          </span>
                        </div>
                        <p className="text-xs text-[#8E8D8A] mt-0.5">
                          Supervisor(a) / Responsável: <strong className="text-[#434343]">{rel.profissionalNome || 'Corpo Docente'}</strong>
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
                          ? '✕ RELATÓRIO RECUSADO'
                          : '⏳ AGUARDANDO VALIDAÇÃO'}
                      </span>
                    </div>

                    {/* Resumo e Autoavaliação do Estagiário */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#F8F5F0] p-3.5 rounded-xl border border-[#E5E1D8]">
                      <div>
                        <span className="text-[#8E8D8A] block font-semibold text-[11px] mb-1">
                          Resumo do Caso e Atividades:
                        </span>
                        <p className="text-[#434343] font-medium leading-relaxed">
                          {rel.resumoCaso || rel.avaliacaoReflexiva}
                        </p>
                        {rel.atividadesRealizadas && (
                          <p className="text-[11px] text-[#5C5C5C] mt-1 italic">
                            Técnicas: {rel.atividadesRealizadas}
                          </p>
                        )}
                      </div>

                      <div>
                        <span className="text-[#8E8D8A] block font-semibold text-[11px] mb-1">
                          Autoavaliação Crítica do Estagiário:
                        </span>
                        <p className="text-[#434343] font-medium leading-relaxed bg-white/70 p-2.5 rounded-lg border border-[#E5E1D8]">
                          "{rel.avaliacaoAutoCritica || rel.avaliacaoReflexiva}"
                        </p>
                        {rel.dificuldadesEncontradas && (
                          <p className="text-[11px] text-[#E98074] mt-1 font-medium">
                            Dúvida para supervisão: {rel.dificuldadesEncontradas}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Parecer do Orientador */}
                    {rel.parecerOrientador && (
                      <div className="p-3 bg-[#F1F8E9]/60 border border-[#D0E3B6] rounded-xl text-xs">
                        <span className="font-bold text-[#82954B] block text-[11px] mb-0.5">
                          Parecer e Feedback da Orientação:
                        </span>
                        <p className="text-[#434343]">{rel.parecerOrientador}</p>
                      </div>
                    )}

                    {/* Validation Actions */}
                    {reviewingRelatorioId === rel.id ? (
                      <div className="p-4 bg-[#F8F5F0] border border-[#82954B] rounded-2xl space-y-3 animate-in fade-in">
                        <label className="block text-xs font-bold text-[#434343]">
                          Parecer da Orientação / Observações de Supervisão:
                        </label>
                        <textarea
                          rows={2}
                          value={parecerTexto}
                          onChange={(e) => setParecerTexto(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl text-[#434343] focus:outline-none focus:ring-2 focus:ring-[#82954B]"
                          placeholder="Digite seu parecer de supervisão..."
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setReviewingRelatorioId(null)}
                            className="px-3 py-1.5 text-xs text-[#5C5C5C] hover:bg-[#EAE7DC] rounded-lg cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleValidarRelatorio(rel.id, 'rejeitado')}
                            className="px-3 py-1.5 text-xs font-bold text-[#E98074] hover:bg-[#FDF0EE] border border-[#F7C4BE] rounded-lg cursor-pointer"
                          >
                            Recusar Relatório
                          </button>
                          <button
                            onClick={() => handleValidarRelatorio(rel.id, 'validado')}
                            className="px-4 py-1.5 text-xs font-bold bg-[#82954B] text-white hover:bg-[#6D7D3F] rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Aprovar e Abater {rel.horasComputadas} Horas
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => {
                            setReviewingRelatorioId(rel.id);
                            if (rel.parecerOrientador) setParecerTexto(rel.parecerOrientador);
                          }}
                          className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#82954B] hover:bg-[#6D7D3F] text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {rel.status === 'validado' ? 'Editar Parecer / Validação' : 'Avaliar e Validar Horas'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal de Atribuição de Horas de Estágio (Individual ou em Lote) */}
      {isAtribuirModalOpen && (
        <AtribuirHorasModal
          isOpen={true}
          onClose={() => setIsAtribuirModalOpen(false)}
          defaultEstagiarioId={selectedEstagiarioId}
          supervisorRole={currentRole}
          supervisorNome={currentRole === 'admin' ? 'Administração Geral' : 'Orientação Docente'}
        />
      )}
    </div>
  );
};
