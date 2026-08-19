import React, { useState } from 'react';
import { db } from '../services/db';
import { Agendamento, Avaliacao } from '../types';
import {
  Star,
  X,
  HeartHandshake,
  Send,
  CheckCircle,
  Stethoscope,
  GraduationCap,
  Sparkles,
  ThumbsUp
} from 'lucide-react';

interface AvaliacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  agendamento: Agendamento;
}

export const AvaliacaoModal: React.FC<AvaliacaoModalProps> = ({ isOpen, onClose, agendamento }) => {
  const [notaProfissional, setNotaProfissional] = useState<number>(5);
  const [comentarioProfissional, setComentarioProfissional] = useState<string>('');
  
  const [notaEstagiario, setNotaEstagiario] = useState<number>(5);
  const [comentarioEstagiario, setComentarioEstagiario] = useState<string>('');

  const [pontualidade, setPontualidade] = useState<number>(5);
  const [acolhimento, setAcolhimento] = useState<number>(5);
  const [recomendaria, setRecomendaria] = useState<boolean>(true);

  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const notaGeral = Math.round((notaProfissional + (agendamento.estagiarioId ? notaEstagiario : notaProfissional) + pontualidade + acolhimento) / (agendamento.estagiarioId ? 4 : 3));

    db.salvarAvaliacao({
      agendamentoId: agendamento.id,
      pacienteId: agendamento.pacienteId,
      pacienteNome: agendamento.pacienteNome,
      dataAtendimento: agendamento.data,
      profissionalId: agendamento.profissionalId,
      profissionalNome: agendamento.profissionalNome,
      notaProfissional,
      comentarioProfissional,
      estagiarioId: agendamento.estagiarioId,
      estagiarioNome: agendamento.estagiarioNome,
      notaEstagiario: agendamento.estagiarioId ? notaEstagiario : undefined,
      comentarioEstagiario: agendamento.estagiarioId ? comentarioEstagiario : undefined,
      notaGeral,
      pontualidade,
      acolhimento,
      recomendaria
    });

    setSaving(false);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const renderStarPicker = (value: number, onChange: (val: number) => void) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-1 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
        >
          <Star
            className={`w-6 h-6 ${
              star <= value
                ? 'fill-[#B58D3D] text-[#B58D3D] drop-shadow-xs'
                : 'text-[#E5E1D8] hover:text-[#EED9B0]'
            }`}
          />
        </button>
      ))}
      <span className="text-xs font-bold text-[#434343] ml-2">
        {value} de 5 estrelas
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E5E1D8] overflow-hidden animate-in zoom-in-95 text-[#434343]">
        
        {/* Header */}
        <div className="p-5 bg-[#82954B] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <HeartHandshake className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold">Avaliação do Atendimento</h2>
              <p className="text-xs text-white/80">
                Sua opinião aprimora a formação na Clínica Escola
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {success && (
            <div className="p-4 bg-[#F1F8E9] border border-[#D0E3B6] rounded-xl flex items-center gap-2 text-[#82954B] text-xs font-semibold animate-in fade-in">
              <CheckCircle className="w-5 h-5 text-[#82954B]" />
              Obrigado! Sua avaliação foi registrada e enviada à coordenação clínica.
            </div>
          )}

          <div className="p-3.5 bg-white rounded-xl border border-[#E5E1D8] text-xs text-[#5C5C5C]">
            <p><strong>Atendimento realizado em:</strong> {new Date(agendamento.data + 'T12:00:00Z').toLocaleDateString('pt-BR')} às {agendamento.horario}</p>
            <p><strong>Profissional:</strong> {agendamento.profissionalNome} • <strong>Estagiário:</strong> {agendamento.estagiarioNome || 'Não atribuído'}</p>
          </div>

          {/* 1. Avaliação do Profissional */}
          <div className="p-4 rounded-xl border border-[#D0E3B6] bg-white space-y-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#82954B]" />
              <div>
                <h3 className="text-xs font-bold text-[#434343]">
                  Como você avalia o Profissional ({agendamento.profissionalNome})?
                </h3>
                <p className="text-[11px] text-[#8E8D8A]">Postura ética, clareza e condução do atendimento</p>
              </div>
            </div>

            {renderStarPicker(notaProfissional, setNotaProfissional)}

            <div>
              <label className="block text-[11px] font-semibold text-[#434343] mb-1">
                Comentários sobre o Profissional (Opcional):
              </label>
              <textarea
                rows={2}
                value={comentarioProfissional}
                onChange={(e) => setComentarioProfissional(e.target.value)}
                placeholder="Compartilhe sua percepção sobre o profissional..."
                className="w-full p-2.5 text-xs bg-[#FDFBF7] border border-[#E5E1D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
              />
            </div>
          </div>

          {/* 2. Avaliação do Estagiário */}
          {agendamento.estagiarioNome && (
            <div className="p-4 rounded-xl border border-[#E5E1D8] bg-white space-y-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#82954B]" />
                <div>
                  <h3 className="text-xs font-bold text-[#434343]">
                    Como você avalia o Estagiário ({agendamento.estagiarioNome})?
                  </h3>
                  <p className="text-[11px] text-[#8E8D8A]">Acolhimento, empatia, escuta e assistência na sessão</p>
                </div>
              </div>

              {renderStarPicker(notaEstagiario, setNotaEstagiario)}

              <div>
                <label className="block text-[11px] font-semibold text-[#434343] mb-1">
                  Comentários sobre o Estagiário (Opcional):
                </label>
                <textarea
                  rows={2}
                  value={comentarioEstagiario}
                  onChange={(e) => setComentarioEstagiario(e.target.value)}
                  placeholder="Feedback construtivo para a formação do acadêmico..."
                  className="w-full p-2.5 text-xs bg-[#FDFBF7] border border-[#E5E1D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                />
              </div>
            </div>
          )}

          {/* 3. Critérios Gerais */}
          <div className="space-y-4 bg-white p-4 rounded-xl border border-[#E5E1D8]">
            <h3 className="text-xs font-serif font-bold text-[#434343]">Avaliação da Experiência Geral</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#434343] mb-1">
                  Pontualidade do Início:
                </label>
                {renderStarPicker(pontualidade, setPontualidade)}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#434343] mb-1">
                  Acolhimento e Respeito:
                </label>
                {renderStarPicker(acolhimento, setAcolhimento)}
              </div>
            </div>

            <div className="pt-2 border-t border-[#E5E1D8] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#434343]">
                Você recomendaria a Clínica Escola a outras pessoas?
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRecomendaria(true)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    recomendaria
                      ? 'bg-[#82954B] text-white border-[#82954B]'
                      : 'bg-white text-[#8E8D8A] border-[#E5E1D8]'
                  }`}
                >
                  Sim, recomendo
                </button>
                <button
                  type="button"
                  onClick={() => setRecomendaria(false)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    !recomendaria
                      ? 'bg-[#E98074] text-white border-[#E98074]'
                      : 'bg-white text-[#8E8D8A] border-[#E5E1D8]'
                  }`}
                >
                  Não
                </button>
              </div>
            </div>
          </div>

          <button
            id="btn-enviar-avaliacao"
            type="submit"
            disabled={saving}
            className="w-full py-3 px-4 bg-[#82954B] hover:bg-[#68793B] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {saving ? 'Enviando avaliação...' : 'Enviar Avaliação do Atendimento'}
          </button>
        </form>
      </div>
    </div>
  );
};
