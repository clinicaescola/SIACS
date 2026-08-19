import React, { useState } from 'react';
import { db } from '../services/db';
import { Agendamento, EstagiarioUser } from '../types';
import {
  X,
  GraduationCap,
  Check,
  Calendar,
  Clock,
  User,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface AtribuirEstagiarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  agendamento: Agendamento | null;
  onSuccess?: () => void;
}

export const AtribuirEstagiarioModal: React.FC<AtribuirEstagiarioModalProps> = ({
  isOpen,
  onClose,
  agendamento,
  onSuccess
}) => {
  const estagiarios = db.getEstagiarios();
  const [selectedEstagiarioId, setSelectedEstagiarioId] = useState<string>(
    agendamento?.estagiarioId || (estagiarios.length > 0 ? estagiarios[0].id : '')
  );
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!isOpen || !agendamento) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedEstagiarioId) {
      setErrorMsg('Selecione um estagiário para atribuir.');
      return;
    }

    const est = estagiarios.find(item => item.id === selectedEstagiarioId);
    if (!est) {
      setErrorMsg('Estagiário inválido.');
      return;
    }

    setIsSaving(true);
    try {
      db.atribuirEstagiarioAoAgendamento(agendamento.id, est.id, `${est.nome} (${est.turma})`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao atribuir estagiário.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoverEstagiario = () => {
    setIsSaving(true);
    try {
      db.atribuirEstagiarioAoAgendamento(agendamento.id, '', '');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao remover estagiário.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="atribuir-estagiario-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-[#FDFBF7] w-full max-w-lg rounded-3xl shadow-2xl border border-[#E5E1D8] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E1D8] bg-[#F8F5F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#82954B]/15 text-[#82954B]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#434343]">
                Atribuir Estagiário à Sessão
              </h3>
              <p className="text-xs text-[#8E8D8A]">
                Consulta de {agendamento.pacienteNome} com {agendamento.profissionalNome}
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
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-[#FDF0EE] border border-[#F5C2BC] rounded-xl flex items-start gap-2.5 text-xs text-[#C84B31]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Details */}
          <div className="bg-[#F8F5F0] p-3.5 rounded-xl border border-[#E5E1D8] text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[#8E8D8A]">Data e Horário:</span>
              <strong className="text-[#434343]">
                {new Date(agendamento.data + 'T12:00:00Z').toLocaleDateString('pt-BR')} • {agendamento.horario}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8E8D8A]">Local:</span>
              <strong className="text-[#434343]">{agendamento.sala} ({agendamento.modalidade})</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8E8D8A]">Estagiário Atual:</span>
              <span className="font-bold text-[#A37B75]">
                {agendamento.estagiarioNome || 'Nenhum estagiário atribuído'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#5C5C5C] mb-2">
                Selecione o Estagiário Acadêmico:
              </label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {estagiarios.map((est) => {
                  const isSelected = selectedEstagiarioId === est.id;
                  const horas = db.getHorasEstagioStatus(est.id);
                  return (
                    <div
                      key={est.id}
                      onClick={() => setSelectedEstagiarioId(est.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#F1F8E9] border-[#82954B] shadow-xs'
                          : 'bg-white border-[#E5E1D8] hover:border-[#82954B]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={est.foto}
                          alt={est.nome}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-bold text-xs text-[#434343]">{est.nome}</p>
                          <p className="text-[11px] text-[#8E8D8A]">
                            Turma: {est.turma} • {horas.horasCumpridas}h cumpridas de {horas.horasExigidas}h
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="estagiario"
                          checked={isSelected}
                          onChange={() => setSelectedEstagiarioId(est.id)}
                          className="accent-[#82954B]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-[#E5E1D8] flex items-center justify-between gap-2">
              {agendamento.estagiarioId ? (
                <button
                  type="button"
                  onClick={handleRemoverEstagiario}
                  disabled={isSaving}
                  className="px-3 py-2 text-xs font-semibold text-[#E98074] hover:bg-[#FDF0EE] rounded-xl transition-colors cursor-pointer"
                >
                  Remover Estagiário
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-[#5C5C5C] hover:bg-[#EAE7DC] rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold bg-[#82954B] hover:bg-[#6D7D3F] text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  {isSaving ? 'Salvando...' : 'Confirmar Atribuição'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
