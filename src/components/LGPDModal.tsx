import React, { useState } from 'react';
import { SIACSMonogram } from './SIACSLogo';
import {
  ShieldCheck,
  FileText,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  X,
  UserCheck
} from 'lucide-react';

interface LGPDModalProps {
  isOpen: boolean;
  userName: string;
  userEmail: string;
  userRole: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LGPDModal: React.FC<LGPDModalProps> = ({
  isOpen,
  userName,
  userEmail,
  userRole,
  onConfirm,
  onCancel
}) => {
  const [accepted, setAccepted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      setErrorMsg('É necessário marcar a caixa de consentimento confirmando que você leu e aceita os termos da LGPD.');
      return;
    }
    setErrorMsg('');
    onConfirm();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'paciente': return 'Paciente / Cliente';
      case 'profissional': return 'Profissional de Saúde / Terapeuta';
      case 'estagiario': return 'Estagiário de Psicologia';
      case 'orientador': return 'Orientador Docente / Supervisor';
      default: return role;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#E5E1D8] shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E1D8] bg-[#F8F5F0] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <SIACSMonogram size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base text-[#033B6C]">
                  SIACS
                </span>
                <span className="text-xs text-[#033B6C] font-extrabold hidden sm:inline">
                  • Termo de Consentimento e Privacidade (LGPD)
                </span>
              </div>
              <p className="text-[11px] text-[#62A032] font-semibold">
                Faculdade Campos Salles • Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 text-[#8E8D8A] hover:text-[#434343] hover:bg-[#EAE7DC] rounded-xl transition-colors cursor-pointer"
            title="Fechar e voltar ao cadastro"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Titular Banner */}
        <div className="bg-[#E6F0FA]/60 px-5 py-3 border-b border-[#CBD5E1] flex flex-wrap items-center justify-between gap-2 text-xs text-[#033B6C] shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#033B6C] shrink-0" />
            <span>
              Titular: <strong>{userName}</strong> ({userEmail})
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-[#033B6C] text-white text-[10px] font-bold uppercase tracking-wider">
            {getRoleLabel(userRole)}
          </span>
        </div>

        {/* Scrollable Terms Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-[#434343] leading-relaxed">
          
          <div className="p-3.5 bg-[#FDFBF7] rounded-2xl border border-[#E5E1D8] space-y-2">
            <h2 className="font-black text-sm text-[#033B6C] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#62A032]" />
              Termo de Consentimento para Tratamento de Dados Pessoais e Sensíveis
            </h2>
            <p className="text-[#5C5C5C]">
              Em cumprimento à <strong>Lei Federal nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais - LGPD)</strong>, este documento estabelece as diretrizes e a transparência com as quais as <strong>Faculdades Integradas Campos Salles</strong> e a sua <strong>Clínica Escola de Psicologia e Saúde</strong> coletam, armazenam e tratam seus dados cadastrais e registros de atendimento.
            </p>
          </div>

          {/* Clauses */}
          <div className="space-y-3.5 divide-y divide-[#E5E1D8]/70">
            
            <div className="pt-2 space-y-1">
              <h3 className="font-bold text-xs text-[#033B6C]">
                1. Finalidade Específica do Tratamento dos Dados
              </h3>
              <p className="text-[#5C5C5C]">
                Os dados fornecidos no formulário (nome, e-mail, telefone, CPF, registro profissional CRM/CRP, data de nascimento e endereço) serão utilizados exclusivamente para:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#5C5C5C] mt-1">
                <li>Criação e autenticação segura do seu perfil no sistema <strong>SIACS</strong>;</li>
                <li>Agendamento, confirmação e acompanhamento de consultas clínicas e sessões terapêuticas;</li>
                <li>Envio de notificações operacionais (confirmações de agendamento, cancelamentos e avisos por e-mail e WhatsApp);</li>
                <li>Registro e guarda de prontuários clínicos e anamneses, quando aplicável;</li>
                <li>Gestão acadêmica e supervisão pedagógica de estágios curriculares supervisionados da Faculdade Campos Salles.</li>
              </ul>
            </div>

            <div className="pt-3 space-y-1">
              <h3 className="font-bold text-xs text-[#033B6C]">
                2. Segurança da Informação e Sigilo Profissional
              </h3>
              <p className="text-[#5C5C5C]">
                A Faculdade Campos Salles adota medidas técnicas, administrativas e organizacionais aptas a proteger seus dados contra acessos não autorizados, perdas, alterações ou comunicações indevidas. O acesso aos dados clínicos é restrito exclusivamente aos profissionais habilitados, estagiários designados e supervisores docentes, em estrita observância ao sigilo ético-profissional.
              </p>
            </div>

            <div className="pt-3 space-y-1">
              <h3 className="font-bold text-xs text-[#033B6C]">
                3. Compartilhamento e Não Comercialização
              </h3>
              <p className="text-[#5C5C5C]">
                A Faculdade Campos Salles <strong>não comercializa, não aluga e não repassa</strong> seus dados pessoais a terceiros para fins publicitários ou comerciais em nenhuma hipótese.
              </p>
            </div>

            <div className="pt-3 space-y-1">
              <h3 className="font-bold text-xs text-[#033B6C]">
                4. Direitos do Titular dos Dados (Art. 18 da LGPD)
              </h3>
              <p className="text-[#5C5C5C]">
                Você possui o direito de, a qualquer momento e mediante requisição:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#5C5C5C] mt-1">
                <li>Confirmar a existência de tratamento dos seus dados;</li>
                <li>Acessar seus dados pessoais cadastrados na plataforma;</li>
                <li>Solicitar a correção de dados incompletos, inexatos ou desatualizados;</li>
                <li>Solicitar a eliminação dos dados tratados com consentimento, ressalvadas as hipóteses de guarda obrigatória por exigência legal ou regulatória de saúde.</li>
              </ul>
            </div>

          </div>

        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="px-5 py-2.5 bg-[#FDF0EE] border-t border-[#F7C4BE] text-xs text-[#c62828] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Footer Form with Checkbox & Actions */}
        <form onSubmit={handleConfirmSubmit} className="p-4 sm:p-5 border-t border-[#E5E1D8] bg-[#F8F5F0] space-y-4 shrink-0">
          
          {/* Checkbox Consent Container */}
          <label
            htmlFor="checkbox-aceite-lgpd"
            className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
              accepted
                ? 'bg-[#F1F8E9] border-[#62A032] shadow-xs'
                : 'bg-white border-[#CBD5E1] hover:border-[#033B6C]'
            }`}
          >
            <input
              id="checkbox-aceite-lgpd"
              type="checkbox"
              checked={accepted}
              onChange={(e) => {
                setAccepted(e.target.checked);
                if (e.target.checked) setErrorMsg('');
              }}
              className="mt-0.5 w-4 h-4 text-[#033B6C] rounded focus:ring-[#033B6C] cursor-pointer"
            />
            <div className="text-xs">
              <span className={`font-bold block ${accepted ? 'text-[#2e7d32]' : 'text-[#033B6C]'}`}>
                Declaro que li, compreendi e aceito os termos da LGPD *
              </span>
              <p className="text-[11px] text-[#5C5C5C] mt-0.5">
                Autorizo expressamente a Faculdade Campos Salles a realizar o tratamento dos meus dados pessoais e de atendimento para as finalidades acadêmicas e clínicas descritas neste termo.
              </p>
            </div>
          </label>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-1">
            <button
              id="btn-lgpd-voltar"
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-[#EAE7DC] text-[#5C5C5C] border border-[#E5E1D8] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar e Revisar Dados
            </button>

            <button
              id="btn-lgpd-confirmar"
              type="submit"
              disabled={!accepted}
              className={`w-full sm:w-auto px-6 py-2.5 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                accepted
                  ? 'bg-[#033B6C] hover:bg-[#022A4E] text-white shadow-md'
                  : 'bg-[#CBD5E1] text-[#64748B] cursor-not-allowed opacity-75'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Aceitar Termos e Concluir Cadastro
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
