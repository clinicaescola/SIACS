import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Anamnese, PacienteUser, Agendamento } from '../types';
import { useAuth } from '../context/AuthContext';
import { AnamnesePsicologiaPrintModal } from './AnamnesePsicologiaPrintModal';
import {
  FileText,
  X,
  Save,
  User,
  HeartPulse,
  Sparkles,
  ClipboardList,
  GraduationCap,
  Stethoscope,
  CheckCircle2,
  Printer,
  FileSpreadsheet
} from 'lucide-react';

interface AnamneseModalProps {
  isOpen: boolean;
  onClose: () => void;
  pacienteId: string;
  agendamentoId?: string;
  readOnly?: boolean;
}

export const AnamneseModal: React.FC<AnamneseModalProps> = ({
  isOpen,
  onClose,
  pacienteId,
  agendamentoId,
  readOnly = false
}) => {
  const { currentUser } = useAuth();
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  
  const [paciente, setPaciente] = useState<PacienteUser | undefined>();
  const [agendamento, setAgendamento] = useState<Agendamento | undefined>();

  // Form fields
  const [nome, setNome] = useState<string>('');
  const [idade, setIdade] = useState<string | number>('');
  const [profissao, setProfissao] = useState<string>('');
  const [estadoCivil, setEstadoCivil] = useState<string>('Solteiro(a)');
  const [principaisQueixas, setPrincipaisQueixas] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');
  const [historicoFamiliar, setHistoricoFamiliar] = useState<string>('');
  const [medicamentosEmUso, setMedicamentosEmUso] = useState<string>('');
  const [expectativasTratamento, setExpectativasTratamento] = useState<string>('');

  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !pacienteId) return;

    const pac = db.getPacientes().find(p => p.id === pacienteId);
    setPaciente(pac);

    if (agendamentoId) {
      const ag = db.getAgendamentoById(agendamentoId);
      setAgendamento(ag);
    }

    const existing = db.getAnamneseByPacienteId(pacienteId);
    if (existing) {
      setNome(existing.pacienteNome || pac?.nome || '');
      setIdade(existing.idade || '');
      setProfissao(existing.profissao || pac?.profissao || '');
      setEstadoCivil(existing.estadoCivil || pac?.estadoCivil || 'Solteiro(a)');
      setPrincipaisQueixas(existing.principaisQueixas || '');
      setObservacoes(existing.observacoes || '');
      setHistoricoFamiliar(existing.historicoFamiliar || '');
      setMedicamentosEmUso(existing.medicamentosEmUso || '');
      setExpectativasTratamento(existing.expectativasTratamento || '');
    } else if (pac) {
      setNome(pac.nome);
      setProfissao(pac.profissao || '');
      setEstadoCivil(pac.estadoCivil || 'Solteiro(a)');
      // calculate approximate age if birthdate exists
      if (pac.dataNascimento) {
        const birth = new Date(pac.dataNascimento);
        const ageDifMs = Date.now() - birth.getTime();
        const ageDate = new Date(ageDifMs);
        setIdade(Math.abs(ageDate.getUTCFullYear() - 1970));
      }
      setPrincipaisQueixas('');
      setObservacoes('');
      setHistoricoFamiliar('');
      setMedicamentosEmUso('');
      setExpectativasTratamento('');
    }
    setSavedSuccess(false);
  }, [isOpen, pacienteId, agendamentoId]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !principaisQueixas) {
      alert('Por favor informe o Nome do paciente e as Principais Queixas.');
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

    db.salvarAnamnese({
      pacienteId,
      pacienteNome: nome,
      idade,
      profissao,
      estadoCivil,
      principaisQueixas,
      observacoes,
      historicoFamiliar,
      medicamentosEmUso,
      expectativasTratamento,
      profissionalId: prof.id,
      profissionalNome: prof.nome,
      estagiarioId: est?.id,
      estagiarioNome: est?.nome,
      orientadorId: orient?.id,
      orientadorNome: orient?.nome
    });

    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E5E1D8] overflow-hidden animate-in zoom-in-95 text-[#434343]">
        
        {/* Header */}
        <div className="p-5 bg-[#82954B] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-bold">Ficha de Anamnese Clínica</h2>
                <span className="text-[11px] font-mono font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                  Prontuário: {paciente?.numeroProntuario || db.getNumeroProntuarioPaciente(pacienteId)}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                1ª Consulta • Registro de Histórico e Acolhimento do Paciente
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#82954B] font-bold text-xs shadow-xs hover:bg-[#F8F5F0] transition-colors cursor-pointer"
              title="Abrir Formulário Imprimível Completo de Psicologia (com Logo e Cabeçalho Oficial)"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Ficha Completa</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {savedSuccess && (
            <div className="p-4 bg-[#F1F8E9] border border-[#D0E3B6] rounded-xl flex items-center gap-3 text-[#82954B] font-semibold text-sm animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-[#82954B]" />
              Anamnese salva com sucesso no prontuário do paciente!
            </div>
          )}

          {/* Identification Section (Requisitos: Nome, Idade, Profissão, Estado Civil) */}
          <div className="bg-white p-4 rounded-xl border border-[#E5E1D8] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C5C5C] flex items-center gap-2">
              <User className="w-4 h-4 text-[#82954B]" />
              1. Identificação Geral do Paciente
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#434343] mb-1">
                  Nome do Paciente *
                </label>
                <input
                  id="anamnese-nome"
                  type="text"
                  required
                  disabled={readOnly}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FDFBF7] border border-[#E5E1D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82954B] disabled:bg-[#F8F5F0] text-[#434343]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#434343] mb-1">
                  Idade *
                </label>
                <input
                  id="anamnese-idade"
                  type="text"
                  required
                  disabled={readOnly}
                  value={idade}
                  onChange={(e) => setIdade(e.target.value)}
                  placeholder="ex: 28 anos"
                  className="w-full px-3 py-2 text-xs bg-[#FDFBF7] border border-[#E5E1D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82954B] disabled:bg-[#F8F5F0] text-[#434343]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#434343] mb-1">
                  Estado Civil *
                </label>
                <select
                  id="anamnese-estadocivil"
                  disabled={readOnly}
                  value={estadoCivil}
                  onChange={(e) => setEstadoCivil(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FDFBF7] border border-[#E5E1D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82954B] disabled:bg-[#F8F5F0] text-[#434343]"
                >
                  <option value="Solteiro(a)">Solteiro(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="União Estável">União Estável</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viúvo(a)">Viúvo(a)</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#434343] mb-1">
                  Profissão / Ocupação *
                </label>
                <input
                  id="anamnese-profissao"
                  type="text"
                  required
                  disabled={readOnly}
                  value={profissao}
                  onChange={(e) => setProfissao(e.target.value)}
                  placeholder="ex: Designer, Estudante, etc."
                  className="w-full px-3 py-2 text-xs bg-[#FDFBF7] border border-[#E5E1D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82954B] disabled:bg-[#F8F5F0] text-[#434343]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#434343] mb-1">
                  Telefone / Contato
                </label>
                <input
                  type="text"
                  disabled
                  value={paciente?.telefone || ''}
                  className="w-full px-3 py-2 text-xs bg-[#F8F5F0] border border-[#E5E1D8] rounded-lg text-[#8E8D8A]"
                />
              </div>
            </div>
          </div>

          {/* Clinical Core: Principais Queixas & Observações (Requisitos explícitos) */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#434343]">
                  Principais Queixas (Motivo da Consulta & Sintomas Iniciais) *
                </label>
                <span className="text-[11px] text-[#82954B] font-medium">
                  Relato espontâneo do paciente
                </span>
              </div>
              <textarea
                id="anamnese-queixas"
                required
                rows={4}
                disabled={readOnly}
                value={principaisQueixas}
                onChange={(e) => setPrincipaisQueixas(e.target.value)}
                placeholder="Descreva detalhadamente as queixas principais trazidas pelo paciente na primeira sessão..."
                className="w-full p-3 text-xs bg-white border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] disabled:bg-[#F8F5F0] text-[#434343]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#434343]">
                  Observações Clínicas & Exame Psíquico *
                </label>
                <span className="text-[11px] text-[#82954B] font-medium">
                  Postura, humor, afeto, orientação
                </span>
              </div>
              <textarea
                id="anamnese-observacoes"
                rows={4}
                disabled={readOnly}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Anotações do profissional e estagiário: discurso, expressão afetiva, ideação, hipóteses diagnósticas preliminares..."
                className="w-full p-3 text-xs bg-white border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] disabled:bg-[#F8F5F0] text-[#434343]"
              />
            </div>
          </div>

          {/* Complementary Clinical Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#434343] mb-1">
                Histórico Familiar / Social
              </label>
              <textarea
                rows={3}
                disabled={readOnly}
                value={historicoFamiliar}
                onChange={(e) => setHistoricoFamiliar(e.target.value)}
                placeholder="Dinâmica familiar, rede de apoio, histórico de transtornos na família..."
                className="w-full p-2.5 text-xs bg-white border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] disabled:bg-[#F8F5F0] text-[#434343]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#434343] mb-1">
                Medicamentos em Uso / Tratamentos Anteriores
              </label>
              <textarea
                rows={3}
                disabled={readOnly}
                value={medicamentosEmUso}
                onChange={(e) => setMedicamentosEmUso(e.target.value)}
                placeholder="Uso de psicofármacos, acompanhamento psiquiátrico prévio ou doenças crônicas..."
                className="w-full p-2.5 text-xs bg-white border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] disabled:bg-[#F8F5F0] text-[#434343]"
              />
            </div>
          </div>

          {/* Supervisors & Interns Responsible Banner */}
          <div className="bg-[#F8F5F0] p-3.5 rounded-xl border border-[#E5E1D8] flex flex-wrap items-center justify-between gap-3 text-xs text-[#434343]">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#82954B]" />
              <span><strong>Profissional:</strong> {agendamento?.profissionalNome || currentUser?.nome}</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#82954B]" />
              <span><strong>Estagiário Integrante:</strong> {agendamento?.estagiarioNome || 'Lucas Silveira'}</span>
            </div>
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-[#B58D3D]" />
              <span><strong>Orientação Acadêmica:</strong> Profa. Dra. Helena Matos</span>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F8F5F0] border-t border-[#E5E1D8] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#434343] bg-[#EFEAE2] hover:bg-[#E5E1D8] rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>

          {!readOnly && (
            <button
              id="btn-salvar-anamnese"
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-[#82954B] hover:bg-[#68793B] rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Gravando...' : 'Salvar Anamnese no Prontuário'}
            </button>
          )}
        </div>
      </div>

      {isPrintModalOpen && (
        <AnamnesePsicologiaPrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          initialPacienteId={pacienteId}
        />
      )}
    </div>
  );
};
