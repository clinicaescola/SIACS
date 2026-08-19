import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { AnamnesePsicologiaCompleta, PacienteUser } from '../types';
import { SIACSMonogram } from './SIACSLogo';
import {
  Printer,
  ExternalLink,
  X,
  Save,
  User,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CheckSquare,
  Square,
  ChevronDown
} from 'lucide-react';
import {
  generateStandaloneHTML,
  dinamicaVidaConfig
} from './anamnese/anamneseTemplate';

interface AnamnesePsicologiaPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPacienteId?: string;
  initialAnamneseId?: string;
}

export const AnamnesePsicologiaPrintModal: React.FC<AnamnesePsicologiaPrintModalProps> = ({
  isOpen,
  onClose,
  initialPacienteId,
  initialAnamneseId
}) => {
  const { currentUser } = useAuth();
  const [pacientes, setPacientes] = useState<PacienteUser[]>([]);
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>(initialPacienteId || '');
  const [isBlankFormMode, setIsBlankFormMode] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const printableContentRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<AnamnesePsicologiaCompleta>>({
    dataAvaliacao: new Date().toISOString().split('T')[0],
    modalidadeAtendimento: 'Presencial',
    numeroProntuario: `PSI-${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
    pacienteNome: '',
    dataNascimento: '',
    idade: '',
    genero: '',
    estadoCivil: 'Solteiro(a)',
    raca: 'Branca',
    profissao: '',
    atividadeTrabalho: '',
    escolaridade: 'Superior Completo',
    naturalidade: '',
    religiao: '',
    endereco: '',
    telefone: '',
    email: '',
    contatoEmergenciaNome: '',
    contatoEmergenciaTelefone: '',
    contatoPessoaConfianca: '',
    responsavelLegal: '',
    profissionalResponsavel: '',
    crpProfissional: '',
    estagiarioNome: '',
    raEstagiario: '',
    turmaEstagiario: '',
    orientadorNome: '',
    crpOrientador: '',
    queixaPrincipal: '',
    queixaInicial: '',
    elementosComplementares: '',
    tempoEvolucao: '',
    encaminhamentoOrigem: '',
    historicoQueixaAtual: '',
    fatoresDesencadeantes: '',
    impactoRotinaRelacoes: '',
    tratamentosPsicologicosAnteriores: '',
    caracteristicasFisicoBiologicas: '',
    caracteristicasFisicoBiologicasPersonalidade: '',
    historicoDoencasFamiliares: '',
    historicoDoencasFamiliaresPersonalidade: '',
    composicaoFamiliar: '',
    relacionamentoFamiliar: '',
    historicoFamiliarPsiquiatrico: '',
    // Dinâmica da Vida
    gestacaoNascimento: '',
    gestacaoNascimentoMediadores: '',
    gestacaoNascimentoPersonalidade: '',
    comunicacaoEmocional: '',
    comunicacaoEmocionalMediadores: '',
    comunicacaoEmocionalPersonalidade: '',
    atividadeObjetalManipulatoria: '',
    atividadeObjetalManipulatoriaMediadores: '',
    atividadeObjetalManipulatoriaPersonalidade: '',
    desenvolvimentoLinguagem: '',
    desenvolvimentoLinguagemMediadores: '',
    desenvolvimentoLinguagemPersonalidade: '',
    jogoPapeisBrincar: '',
    jogoPapeisBrincarMediadores: '',
    jogoPapeisBrincarPersonalidade: '',
    relacoesFamiliaresVida: '',
    relacoesFamiliaresMediadores: '',
    relacoesFamiliaresPersonalidade: '',
    socializacao: '',
    socializacaoMediadores: '',
    socializacaoPersonalidade: '',
    atividadeEstudo: '',
    atividadeEstudoMediadores: '',
    atividadeEstudoPersonalidade: '',
    relacoesAfetivasVida: '',
    relacoesAfetivasMediadores: '',
    relacoesAfetivasPersonalidade: '',
    sexualidade: '',
    sexualidadeMediadores: '',
    sexualidadePersonalidade: '',
    insercaoTrabalho: '',
    insercaoTrabalhoMediadores: '',
    insercaoTrabalhoPersonalidade: '',
    // Cenário de Vida
    cenarioPessoasSignificativas: '',
    cenarioPessoasSignificativasPersonalidade: '',
    cenarioAtividadesPresentes: '',
    cenarioAtividadesPresentesPersonalidade: '',
    cenarioContextosCirculacao: '',
    cenarioContextosCirculacaoPersonalidade: '',
    // Sintomatologia
    nivelDesenvolvimentoPresente: '',
    caracteristicasDesenvolvimentoPresente: '',
    possibilidadesDesenvolvimento: '',
    // Clínico
    condicoesMedicasGerais: '',
    medicamentosUsoContinuo: '',
    psicofarmacosPosologia: '',
    padraoSonoAlimentacao: '',
    usoSubstancias: '',
    relacoesAfetivas: '',
    redeApoioSocial: '',
    rotinaTrabalhoEstudo: '',
    atividadesLazer: '',
    // Exame Mental
    aparenciaAtitude: 'Cuidados pessoais preservados, atitude colaborativa e receptiva ao acolhimento.',
    conscienciaOrientacao: 'Lúcido(a), vigil e orientado(a) têmporo-espacialmente.',
    atencaoMemoria: 'Atenção e memória preservadas sem déficits aparentes.',
    pensamentoLinguagem: 'Pensamento com curso e forma coerentes. Linguagem clara.',
    humorAfeto: 'Humor normotímico / ansioso, afeto congruente com o discurso.',
    sensopercepcao: 'Sem alterações sensoperceptivas observadas ou relatadas.',
    juizoCriticoInsight: 'Juízo de realidade preservado, insight presente sobre a demanda.',
    psicomotricidade: 'Psicomotricidade preservada e adequada.',
    // Diagnóstico e Metas
    compreensaoDiagnostica: '',
    enquadreTeorico: 'Terapia Cognitivo-Comportamental (TCC)',
    hipoteseDiagnosticaCid: '',
    objetivosTerapeuticos: '',
    frequenciaSessoes: '1 sessão semanal (50 min)',
    encaminhamentos: '',
    observacoesGerais: ''
  });

  useEffect(() => {
    if (!isOpen) return;

    const allPacientes = db.getPacientes();
    setPacientes(allPacientes);

    let defProf = '';
    let defCrp = '';
    let defEst = '';
    let defRa = '';
    let defOrient = '';
    let defCrpOrient = '';

    if (currentUser) {
      if (currentUser.role === 'profissional') {
        defProf = currentUser.nome;
        defCrp = currentUser.crp || '';
      } else if (currentUser.role === 'estagiario') {
        defEst = currentUser.nome;
        defRa = currentUser.ra || '';
      } else if (currentUser.role === 'orientador') {
        defOrient = currentUser.nome;
        defCrpOrient = currentUser.crp || '';
      }
    }

    if (initialAnamneseId) {
      const existing = db.getAnamnesesPsicologia().find(a => a.id === initialAnamneseId);
      if (existing) {
        setFormData(existing);
        if (existing.pacienteId) {
          setSelectedPacienteId(existing.pacienteId);
        }
        return;
      }
    }

    const pacIdToLoad = initialPacienteId || (allPacientes.length > 0 ? allPacientes[0].id : '');
    if (pacIdToLoad) {
      setSelectedPacienteId(pacIdToLoad);
      carregarDadosPaciente(pacIdToLoad, defProf, defCrp, defEst, defRa, defOrient, defCrpOrient);
    }
  }, [isOpen, initialPacienteId, initialAnamneseId]);

  const carregarDadosPaciente = (
    pacienteId: string,
    defProf = '',
    defCrp = '',
    defEst = '',
    defRa = '',
    defOrient = '',
    defCrpOrient = ''
  ) => {
    if (!pacienteId) return;

    const pac = db.getPacientes().find(p => p.id === pacienteId);
    const existingAnam = db.getAnamnesePsicologiaByPacienteId(pacienteId);
    const numProntuarioUnico = existingAnam?.numeroProntuario || pac?.numeroProntuario || db.getNumeroProntuarioPaciente(pacienteId);

    let calculatedAge: string | number = '';
    if (pac?.dataNascimento) {
      const birth = new Date(pac.dataNascimento);
      const ageDifMs = Date.now() - birth.getTime();
      const ageDate = new Date(ageDifMs);
      calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    if (existingAnam) {
      setFormData({
        ...existingAnam,
        numeroProntuario: numProntuarioUnico,
        pacienteId: pac?.id || existingAnam.pacienteId,
        pacienteNome: existingAnam.pacienteNome || pac?.nome || '',
        dataNascimento: existingAnam.dataNascimento || pac?.dataNascimento || '',
        idade: existingAnam.idade || calculatedAge || '',
        genero: existingAnam.genero || (pac as any)?.genero || '',
        raca: existingAnam.raca || (pac as any)?.raca || 'Branca',
        profissao: existingAnam.profissao || pac?.profissao || '',
        atividadeTrabalho: existingAnam.atividadeTrabalho || (pac as any)?.atividadeTrabalho || '',
        escolaridade: existingAnam.escolaridade || (pac as any)?.escolaridade || 'Superior Completo',
        naturalidade: existingAnam.naturalidade || (pac as any)?.naturalidade || '',
        religiao: existingAnam.religiao || (pac as any)?.religiao || '',
        estadoCivil: existingAnam.estadoCivil || pac?.estadoCivil || 'Solteiro(a)',
        endereco: existingAnam.endereco || pac?.endereco || '',
        telefone: existingAnam.telefone || pac?.telefone || '',
        email: existingAnam.email || pac?.email || '',
        contatoEmergenciaNome: existingAnam.contatoEmergenciaNome || (pac as any)?.contatoEmergenciaNome || '',
        contatoEmergenciaTelefone: existingAnam.contatoEmergenciaTelefone || (pac as any)?.contatoEmergenciaTelefone || '',
        contatoPessoaConfianca: existingAnam.contatoPessoaConfianca || (pac as any)?.contatoPessoaConfianca || '',
        responsavelLegal: existingAnam.responsavelLegal || (pac as any)?.responsavelLegal || ''
      });
      return;
    }

    const existingSummary = db.getAnamneseByPacienteId(pacienteId);

    setFormData(prev => ({
      ...prev,
      pacienteId: pac?.id,
      pacienteNome: pac?.nome || '',
      numeroProntuario: numProntuarioUnico,
      dataNascimento: pac?.dataNascimento || '',
      idade: calculatedAge || existingSummary?.idade || '',
      genero: (pac as any)?.genero || '',
      raca: (pac as any)?.raca || 'Branca',
      profissao: pac?.profissao || existingSummary?.profissao || '',
      atividadeTrabalho: (pac as any)?.atividadeTrabalho || '',
      escolaridade: (pac as any)?.escolaridade || 'Superior Completo',
      naturalidade: (pac as any)?.naturalidade || '',
      religiao: (pac as any)?.religiao || '',
      estadoCivil: pac?.estadoCivil || existingSummary?.estadoCivil || 'Solteiro(a)',
      endereco: pac?.endereco || '',
      telefone: pac?.telefone || '',
      email: pac?.email || '',
      contatoEmergenciaNome: (pac as any)?.contatoEmergenciaNome || '',
      contatoEmergenciaTelefone: (pac as any)?.contatoEmergenciaTelefone || '',
      contatoPessoaConfianca: (pac as any)?.contatoPessoaConfianca || ((pac as any)?.contatoEmergenciaNome ? `${(pac as any).contatoEmergenciaNome} (${(pac as any).contatoEmergenciaTelefone || ''})` : ''),
      responsavelLegal: (pac as any)?.responsavelLegal || (calculatedAge && Number(calculatedAge) < 18 ? 'Responsável Legal' : 'O(A) Próprio(a)'),
      queixaPrincipal: existingSummary?.principaisQueixas || '',
      historicoFamiliarPsiquiatrico: existingSummary?.historicoFamiliar || '',
      medicamentosUsoContinuo: existingSummary?.medicamentosEmUso || '',
      objetivosTerapeuticos: existingSummary?.expectativasTratamento || '',
      observacoesGerais: existingSummary?.observacoes || '',
      profissionalResponsavel: prev.profissionalResponsavel || existingSummary?.profissionalNome || defProf,
      crpProfissional: prev.crpProfissional || defCrp,
      estagiarioNome: prev.estagiarioNome || existingSummary?.estagiarioNome || defEst,
      raEstagiario: prev.raEstagiario || defRa,
      orientadorNome: prev.orientadorNome || existingSummary?.orientadorNome || defOrient,
      crpOrientador: prev.crpOrientador || defCrpOrient
    }));
  };

  const handlePacienteChange = (pacId: string) => {
    setSelectedPacienteId(pacId);
    if (pacId) {
      carregarDadosPaciente(pacId);
    }
  };

  const handleFieldChange = (field: keyof AnamnesePsicologiaCompleta, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const showFeedback = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setActionFeedback({ text, type });
    setTimeout(() => setActionFeedback(null), 5000);
  };

  // Impressão Oficial Direta com Iframe / Janela Dedicada Garantida
  const handlePrint = () => {
    showFeedback('Abrindo documento para impressão...', 'info');
    const html = generateStandaloneHTML(formData, isBlankFormMode, true);

    try {
      let iframe = document.getElementById('siacs-print-iframe') as HTMLIFrameElement;
      if (iframe && document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      iframe = document.createElement('iframe');
      iframe.id = 'siacs-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            showFeedback('Diálogo de impressão acionado com sucesso!', 'success');
          } catch (e) {
            fallbackPopupPrint(html);
          }
        }, 400);
        return;
      }
    } catch (e) {
      fallbackPopupPrint(html);
    }
  };

  const fallbackPopupPrint = (html: string) => {
    const printWindow = window.open('', '_blank', 'width=950,height=850,resizable=yes,scrollbars=yes');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        try {
          printWindow.print();
        } catch (e) {
          console.warn('Erro ao acionar print na janela:', e);
        }
      }, 500);
      showFeedback('Janela de impressão aberta com sucesso!', 'success');
    } else {
      try {
        window.print();
      } catch (e) {
        showFeedback('Por favor, permita pop-ups no navegador para imprimir o formulário.', 'error');
      }
    }
  };

  // Abrir em Nova Aba
  const handleOpenInNewTab = () => {
    const html = generateStandaloneHTML(formData, isBlankFormMode, true);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);
    const win = window.open(blobUrl, '_blank');
    if (win) {
      showFeedback('Documento aberto em uma nova aba!', 'success');
    } else {
      showFeedback('Por favor, permita pop-ups no navegador.', 'error');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pacienteNome || formData.pacienteNome.trim() === '') {
      alert('Por favor informe o Nome do Paciente antes de salvar o prontuário.');
      return;
    }

    try {
      const saved = db.salvarAnamnesePsicologia(formData as any);
      setFormData(saved);
      setSaveSuccess(true);
      showFeedback('Ficha de Anamnese salva com sucesso no prontuário do paciente!', 'success');
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert('Erro ao salvar formulário de anamnese: ' + (err.message || err));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Container Principal */}
      <div className="relative w-full max-w-5xl bg-white sm:rounded-2xl shadow-2xl border border-[#E5E1D8] flex flex-col max-h-[96vh] print:max-h-none print:h-auto print:border-none print:shadow-none">
        
        {/* BARRA DE FERRAMENTAS SUPERIOR */}
        <div className="p-4 bg-[#F8F5F0] border-b border-[#E5E1D8] flex flex-wrap items-center justify-between gap-3 print:hidden shrink-0 sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#033B6C] text-white rounded-xl shadow-xs">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-[#033B6C] leading-tight">
                Anamnese Completa de Psicologia • Ficha Imprimível & Digital
              </h2>
              <p className="text-xs text-[#5C5C5C]">
                Prontuário oficial com perspectiva Histórico-Cultural, exame mental e conformidade ética CFP
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Seletor de Paciente */}
            {!isBlankFormMode && (
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-[#E5E1D8]">
                <User className="w-3.5 h-3.5 text-[#8E8D8A]" />
                <select
                  value={selectedPacienteId}
                  onChange={e => handlePacienteChange(e.target.value)}
                  className="text-xs font-semibold text-[#434343] bg-transparent focus:outline-hidden cursor-pointer"
                >
                  <option value="">-- Selecionar Paciente --</option>
                  {pacientes.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} (CPF: {p.cpf || 'N/I'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Alternar Modo em Branco / Preenchido */}
            <button
              type="button"
              id="btn-toggle-modo-em-branco"
              onClick={() => setIsBlankFormMode(!isBlankFormMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                isBlankFormMode
                  ? 'bg-[#033B6C] text-white border-[#033B6C]'
                  : 'bg-white text-[#5C5C5C] border-[#E5E1D8] hover:bg-[#EAE7DC]'
              }`}
              title="Alternar entre formulário para preenchimento manual ou digital"
            >
              {isBlankFormMode ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Modo: Ficha em Branco</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5" />
                  <span>Mudar para Ficha em Branco</span>
                </>
              )}
            </button>

            {/* Salvar Digital */}
            {!isBlankFormMode && (
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#82954B] hover:bg-[#6F803E] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                title="Salvar registro no banco de dados do SIACS"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Prontuário</span>
              </button>
            )}

            {/* Impressão Direta (com opção Salvar como PDF) */}
            <button
              type="button"
              id="btn-imprimir-anamnese"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#033B6C] hover:bg-[#022849] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Abrir diálogo de impressão / salvar PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            {/* Abrir em Nova Aba */}
            <button
              type="button"
              onClick={handleOpenInNewTab}
              className="p-1.5 text-[#033B6C] bg-white border border-[#CBD5E0] hover:bg-[#EAE7DC] rounded-xl transition-colors cursor-pointer"
              title="Visualizar documento em tela cheia numa nova aba"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* Fechar */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#8E8D8A] hover:text-[#434343] hover:bg-[#EAE7DC] rounded-xl transition-colors cursor-pointer ml-1"
              title="Fechar janela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback visual de ações */}
        {actionFeedback && (
          <div className={`px-4 py-2 text-xs font-bold flex items-center gap-2 print:hidden ${
            actionFeedback.type === 'success'
              ? 'bg-[#F1F8E9] border-b border-[#D0E3B6] text-[#2E7D32]'
              : actionFeedback.type === 'error'
              ? 'bg-[#FDF0EE] border-b border-[#F7C4BE] text-[#C62828]'
              : 'bg-[#EBF3FB] border-b border-[#B3D4F5] text-[#033B6C]'
          }`}>
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : actionFeedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            <span>{actionFeedback.text}</span>
          </div>
        )}

        {/* CORPO DO DOCUMENTO (FORMATO A4 INTERATIVO) */}
        <div
          ref={printableContentRef}
          id="anamnese-printable-sheet"
          className="flex-1 overflow-y-auto p-6 sm:p-10 print:p-0 print:overflow-visible text-[#2D3748] bg-white font-sans text-xs sm:text-sm leading-relaxed"
        >
          {/* CABEÇALHO INSTITUCIONAL */}
          <div className="border-b-2 border-[#033B6C] pb-4 mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="shrink-0">
                <SIACSMonogram size="lg" className="shadow-xs" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl sm:text-2xl tracking-tight text-[#033B6C]">
                    SIACS
                  </span>
                  <span className="text-[11px] font-bold text-[#62A032] bg-[#F1F8E9] px-2 py-0.5 rounded-sm border border-[#D0E3B6]">
                    Clínica Escola de Psicologia
                  </span>
                </div>
                <h1 className="font-serif font-bold text-sm sm:text-base text-[#1A202C] leading-tight mt-0.5">
                  Faculdade Integradas Campos Salles
                </h1>
                <p className="text-[11px] text-[#62A032] font-semibold">
                  Sistema Integrado de Agendamento Campos Salles • Eficiência e Organização
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="border border-[#CBD5E0] bg-[#F7FAFC] rounded-lg p-2 text-[11px]">
                <p className="font-bold text-[#033B6C]">PRONTUÁRIO PSICOLÓGICO</p>
                <p className="font-mono text-xs font-bold text-[#2D3748]">
                  {isBlankFormMode ? '___________________' : (formData.numeroProntuario || 'PSI-2026/0000')}
                </p>
                <p className="text-[10px] text-[#718096] mt-0.5">
                  Data: {isBlankFormMode ? '____/____/________' : (formData.dataAvaliacao ? new Date(formData.dataAvaliacao + 'T12:00:00Z').toLocaleDateString('pt-BR') : '__/__/____')}
                </p>
              </div>
              <p className="text-[9px] text-[#A0AEC0] mt-1 font-semibold uppercase tracking-wider">
                Documento Confidencial • Resolução CFP
              </p>
            </div>
          </div>

          {/* TÍTULO DO FORMULÁRIO */}
          <div className="text-center bg-[#F8F5F0] border border-[#CBD5E0] py-2 px-4 rounded-xl mb-6 print:border-black/20">
            <h2 className="font-serif font-black text-base sm:text-lg text-[#033B6C] tracking-wide uppercase">
              FICHA DE ANAMNESE E AVALIAÇÃO PSICOLÓGICA COMPLETA
            </h2>
            <p className="text-[11px] text-[#5C5C5C]">
              {isBlankFormMode
                ? 'Instrumento estruturado para acolhimento clínico inicial e entrevista psicodiagnóstica.'
                : 'Instrumento técnico de coleta de dados clínicos, história pessoal, dinâmica da vida (Histórico-Cultural), exame mental e enquadre.'}
            </p>
          </div>

          {/* 1. IDENTIFICAÇÃO DO PACIENTE */}
          <div className="mb-6 border-2 border-[#033B6C] rounded-xl overflow-hidden print:border-black/30">
            <div className="bg-[#033B6C] text-white px-3.5 py-1.5 font-bold text-xs flex items-center justify-between">
              <span>1. IDENTIFICAÇÃO DO PACIENTE E DADOS SOCIODEMOGRÁFICOS</span>
              <span className="text-[10px] opacity-90">
                {isBlankFormMode ? 'Modalidade: [  ] Presencial  [  ] Online' : (formData.modalidadeAtendimento || 'Presencial')}
              </span>
            </div>

            <div className="p-3.5 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-white">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Nome Completo do Paciente</label>
                {isBlankFormMode ? (
                  <div className="border-b-2 border-[#718096] h-7 w-full"></div>
                ) : (
                  <input
                    type="text"
                    value={formData.pacienteNome || ''}
                    onChange={e => handleFieldChange('pacienteNome', e.target.value)}
                    placeholder="Nome completo do paciente"
                    className="w-full text-xs font-semibold px-2 py-1 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md focus:border-[#033B6C] focus:bg-white"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Data de Nasc. / Idade</label>
                {isBlankFormMode ? (
                  <div className="border-b-2 border-[#718096] h-7 w-full"></div>
                ) : (
                  <div className="flex gap-1.5">
                    <input
                      type="date"
                      value={formData.dataNascimento || ''}
                      onChange={e => handleFieldChange('dataNascimento', e.target.value)}
                      className="w-2/3 text-xs px-2 py-1 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                    />
                    <input
                      type="text"
                      value={formData.idade || ''}
                      onChange={e => handleFieldChange('idade', e.target.value)}
                      placeholder="Anos"
                      className="w-1/3 text-xs px-2 py-1 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md text-center"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Gênero / Identidade</label>
                {isBlankFormMode ? (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-[#2D3748] font-bold">[ ] F</span>
                    <span className="text-[10px] text-[#2D3748] font-bold">[ ] M</span>
                    <span className="text-[10px] text-[#2D3748] font-bold">[ ] Outro</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData.genero || ''}
                    onChange={e => handleFieldChange('genero', e.target.value)}
                    placeholder="Ex: Feminino, Masculino, Não-binário"
                    className="w-full text-xs px-2 py-1 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Estado Civil</label>
                {isBlankFormMode ? (
                  <div className="border-b-2 border-[#718096] h-7 w-full"></div>
                ) : (
                  <input
                    type="text"
                    value={formData.estadoCivil || ''}
                    onChange={e => handleFieldChange('estadoCivil', e.target.value)}
                    placeholder="Ex: Solteiro(a), Casado(a)"
                    className="w-full text-xs px-2 py-1 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Raça / Cor / Etnia</label>
                {isBlankFormMode ? (
                  <div className="flex items-center gap-1.5 pt-1 text-[9.5px]">
                    <span>[ ] Branca</span>
                    <span>[ ] Preta</span>
                    <span>[ ] Parda</span>
                  </div>
                ) : (
                  <select
                    value={formData.raca || 'Branca'}
                    onChange={e => handleFieldChange('raca', e.target.value)}
                    className="w-full text-xs px-2 py-1 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  >
                    <option value="Branca">Branca</option>
                    <option value="Preta">Preta</option>
                    <option value="Parda">Parda</option>
                    <option value="Amarela">Amarela</option>
                    <option value="Indígena">Indígena</option>
                    <option value="Outra">Outra</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Escolaridade</label>
                {isBlankFormMode ? (
                  <div className="border-b-2 border-[#718096] h-7 w-full"></div>
                ) : (
                  <input
                    type="text"
                    value={formData.escolaridade || ''}
                    onChange={e => handleFieldChange('escolaridade', e.target.value)}
                    placeholder="Ex: Superior Completo"
                    className="w-full text-xs px-2 py-1 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Profissão / Ocupação</label>
                {isBlankFormMode ? (
                  <div className="border-b-2 border-[#718096] h-7 w-full"></div>
                ) : (
                  <input
                    type="text"
                    value={formData.profissao || ''}
                    onChange={e => handleFieldChange('profissao', e.target.value)}
                    placeholder="Ex: Designer, Estudante"
                    className="w-full text-xs px-2 py-1 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Atividade de Trabalho que Desempenha</label>
                {isBlankFormMode ? (
                  <div className="border-b-2 border-[#718096] h-7 w-full"></div>
                ) : (
                  <input
                    type="text"
                    value={formData.atividadeTrabalho || ''}
                    onChange={e => handleFieldChange('atividadeTrabalho', e.target.value)}
                    placeholder="Funções, rotina, modalidade (home-office/presencial)..."
                    className="w-full text-xs px-2 py-1 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Contato de Pessoa de Confiança / Emergência</label>
                {isBlankFormMode ? (
                  <div className="border-b-2 border-[#718096] h-7 w-full"></div>
                ) : (
                  <input
                    type="text"
                    value={formData.contatoPessoaConfianca || formData.contatoEmergenciaNome || ''}
                    onChange={e => handleFieldChange('contatoPessoaConfianca', e.target.value)}
                    placeholder="Nome, Vínculo e Telefone (Ex: Helena Souza - Mãe - (11) 98111-2233)"
                    className="w-full text-xs px-2 py-1 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Telefone / WhatsApp</label>
                {isBlankFormMode ? (
                  <div className="border-b-2 border-[#718096] h-7 w-full"></div>
                ) : (
                  <input
                    type="text"
                    value={formData.telefone || ''}
                    onChange={e => handleFieldChange('telefone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full text-xs px-2 py-1 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">E-mail</label>
                {isBlankFormMode ? (
                  <div className="border-b-2 border-[#718096] h-7 w-full"></div>
                ) : (
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={e => handleFieldChange('email', e.target.value)}
                    placeholder="paciente@email.com"
                    className="w-full text-xs px-2 py-1 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Naturalidade / Religião</label>
                {isBlankFormMode ? (
                  <div className="border-b-2 border-[#718096] h-7 w-full"></div>
                ) : (
                  <input
                    type="text"
                    value={formData.naturalidade || ''}
                    onChange={e => handleFieldChange('naturalidade', e.target.value)}
                    placeholder="Ex: São Paulo - SP / Sem religião"
                    className="w-full text-xs px-2 py-1 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Endereço Residencial Completo</label>
                {isBlankFormMode ? (
                  <div className="border-b-2 border-[#718096] h-7 w-full"></div>
                ) : (
                  <input
                    type="text"
                    value={formData.endereco || ''}
                    onChange={e => handleFieldChange('endereco', e.target.value)}
                    placeholder="Rua, Número, Complemento, Bairro, Cidade - UF, CEP"
                    className="w-full text-xs px-2 py-1 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 2. CORPO CLÍNICO RESPONSÁVEL */}
          <div className="mb-6 border-2 border-[#033B6C] rounded-xl overflow-hidden print:border-black/30">
            <div className="bg-[#033B6C] text-white px-3.5 py-1.5 font-bold text-xs">
              2. CORPO CLÍNICO E SUPERVISÃO RESPONSÁVEL
            </div>
            <div className="p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Profissional Responsável (Psicólogo) + CRP</label>
                {isBlankFormMode ? (
                  <div className="border-b-2 border-[#718096] h-7 w-full"></div>
                ) : (
                  <input
                    type="text"
                    value={formData.profissionalResponsavel ? `${formData.profissionalResponsavel} ${formData.crpProfissional ? `(CRP: ${formData.crpProfissional})` : ''}` : ''}
                    onChange={e => handleFieldChange('profissionalResponsavel', e.target.value)}
                    placeholder="Nome do Psicólogo e CRP"
                    className="w-full text-xs px-2 py-1 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Estagiário(a) Clínico(a) + RA</label>
                {isBlankFormMode ? (
                  <div className="border-b-2 border-[#718096] h-7 w-full"></div>
                ) : (
                  <input
                    type="text"
                    value={formData.estagiarioNome ? `${formData.estagiarioNome} ${formData.raEstagiario ? `(RA: ${formData.raEstagiario})` : ''}` : ''}
                    onChange={e => handleFieldChange('estagiarioNome', e.target.value)}
                    placeholder="Nome do Acadêmico e RA"
                    className="w-full text-xs px-2 py-1 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Orientador(a) / Supervisor Docente + CRP</label>
                {isBlankFormMode ? (
                  <div className="border-b-2 border-[#718096] h-7 w-full"></div>
                ) : (
                  <input
                    type="text"
                    value={formData.orientadorNome ? `${formData.orientadorNome} ${formData.crpOrientador ? `(CRP: ${formData.crpOrientador})` : ''}` : ''}
                    onChange={e => handleFieldChange('orientadorNome', e.target.value)}
                    placeholder="Nome do Docente e CRP"
                    className="w-full text-xs px-2 py-1 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 3. DADOS DA QUEIXA, HISTÓRICO ATUAL & IMPACTO */}
          <div className="mb-6 border-2 border-[#033B6C] rounded-xl overflow-hidden print:border-black/30">
            <div className="bg-[#033B6C] text-white px-3.5 py-1.5 font-bold text-xs">
              3. DEMANDA, QUEIXA PRINCIPAL E HISTÓRICO ATUAL
            </div>
            <div className="p-3.5 space-y-3 bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Tempo de Evolução dos Sintomas</label>
                  {isBlankFormMode ? (
                    <div className="border-b-2 border-[#718096] h-7 w-full"></div>
                  ) : (
                    <input
                      type="text"
                      value={formData.tempoEvolucao || ''}
                      onChange={e => handleFieldChange('tempoEvolucao', e.target.value)}
                      placeholder="Ex: Há 8 meses, com piora recente..."
                      className="w-full text-xs px-2 py-1 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Origem do Encaminhamento</label>
                  {isBlankFormMode ? (
                    <div className="border-b-2 border-[#718096] h-7 w-full"></div>
                  ) : (
                    <input
                      type="text"
                      value={formData.encaminhamentoOrigem || ''}
                      onChange={e => handleFieldChange('encaminhamentoOrigem', e.target.value)}
                      placeholder="Ex: Demanda espontânea, UBS, Indicação..."
                      className="w-full text-xs px-2 py-1 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">
                  Queixa Inicial / Queixa Principal (Palavras do Paciente / Demanda Manifesta) *
                </label>
                {isBlankFormMode ? (
                  <div className="space-y-3 py-1">
                    <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                  </div>
                ) : (
                  <textarea
                    rows={2}
                    value={formData.queixaInicial || formData.queixaPrincipal || ''}
                    onChange={e => {
                      handleFieldChange('queixaInicial', e.target.value);
                      handleFieldChange('queixaPrincipal', e.target.value);
                    }}
                    placeholder="Descrição da queixa exatamente como relatada pelo paciente no momento inicial..."
                    className="w-full text-xs p-2 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md focus:bg-white"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">
                  Elementos Complementares da Queixa
                </label>
                {isBlankFormMode ? (
                  <div className="space-y-3 py-1">
                    <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                  </div>
                ) : (
                  <textarea
                    rows={2}
                    value={formData.elementosComplementares || ''}
                    onChange={e => handleFieldChange('elementosComplementares', e.target.value)}
                    placeholder="Sintomas somáticos associados, gatilhos específicos, flutuação dos episódios..."
                    className="w-full text-xs p-2 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md focus:bg-white"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">
                  Histórico da Queixa Atual & Fatores Desencadeantes
                </label>
                {isBlankFormMode ? (
                  <div className="space-y-3 py-1">
                    <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                  </div>
                ) : (
                  <textarea
                    rows={2}
                    value={formData.historicoQueixaAtual || ''}
                    onChange={e => handleFieldChange('historicoQueixaAtual', e.target.value)}
                    placeholder="Como começou, fatores precipitantes, intensidade, frequência, tentativas de resolução prévias..."
                    className="w-full text-xs p-2 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md focus:bg-white"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">
                  Impacto na Rotina, Sono, Alimentação e Relações
                </label>
                {isBlankFormMode ? (
                  <div className="space-y-3 py-1">
                    <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                  </div>
                ) : (
                  <textarea
                    rows={2}
                    value={formData.impactoRotinaRelacoes || ''}
                    onChange={e => handleFieldChange('impactoRotinaRelacoes', e.target.value)}
                    placeholder="Prejuízos no trabalho, estudos, padrão de sono, apetite, isolamento..."
                    className="w-full text-xs p-2 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md focus:bg-white"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 4. PECULIARIDADES HEREDITÁRIAS & HISTÓRICO FAMILIAR */}
          <div className="mb-6 border-2 border-[#033B6C] rounded-xl overflow-hidden print:border-black/30">
            <div className="bg-[#033B6C] text-white px-3.5 py-1.5 font-bold text-xs">
              4. PECULIARIDADES HEREDITÁRIAS & HISTÓRICO FAMILIAR
            </div>
            <div className="p-3.5 space-y-3 bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">
                    Principais características físico-biológicas da família (caráter, estrutura corporal)
                  </label>
                  {isBlankFormMode ? (
                    <div className="space-y-3 py-1">
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    </div>
                  ) : (
                    <textarea
                      rows={2}
                      value={formData.caracteristicasFisicoBiologicas || ''}
                      onChange={e => handleFieldChange('caracteristicasFisicoBiologicas', e.target.value)}
                      placeholder="Características físicas marcantes, temperamento e traços hereditários..."
                      className="w-full text-xs p-2 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">
                    O que ajudou na composição da personalidade?
                  </label>
                  {isBlankFormMode ? (
                    <div className="space-y-3 py-1">
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    </div>
                  ) : (
                    <textarea
                      rows={2}
                      value={formData.caracteristicasFisicoBiologicasPersonalidade || ''}
                      onChange={e => handleFieldChange('caracteristicasFisicoBiologicasPersonalidade', e.target.value)}
                      placeholder="Impacto na autoestima, introjeção de padrões corporais e traços de caráter..."
                      className="w-full text-xs p-2 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">
                    Histórico de doenças (incluindo adoecimento mental) dos familiares
                  </label>
                  {isBlankFormMode ? (
                    <div className="space-y-3 py-1">
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    </div>
                  ) : (
                    <textarea
                      rows={2}
                      value={formData.historicoDoencasFamiliares || formData.historicoFamiliarPsiquiatrico || ''}
                      onChange={e => {
                        handleFieldChange('historicoDoencasFamiliares', e.target.value);
                        handleFieldChange('historicoFamiliarPsiquiatrico', e.target.value);
                      }}
                      placeholder="Depressão, ansiedade, alcoolismo, dependência química ou outras patologias..."
                      className="w-full text-xs p-2 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">
                    O que ajudou na composição da personalidade?
                  </label>
                  {isBlankFormMode ? (
                    <div className="space-y-3 py-1">
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    </div>
                  ) : (
                    <textarea
                      rows={2}
                      value={formData.historicoDoencasFamiliaresPersonalidade || ''}
                      onChange={e => handleFieldChange('historicoDoencasFamiliaresPersonalidade', e.target.value)}
                      placeholder="Vivências de cuidado, medos associados ao adoecer psíquico, recursos egóicos..."
                      className="w-full text-xs p-2 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">
                    Composição e Relações Familiares
                  </label>
                  {isBlankFormMode ? (
                    <div className="space-y-3 py-1">
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    </div>
                  ) : (
                    <textarea
                      rows={2}
                      value={formData.composicaoFamiliar || ''}
                      onChange={e => handleFieldChange('composicaoFamiliar', e.target.value)}
                      placeholder="Com quem mora, dinâmica relacional, suporte e conflitos..."
                      className="w-full text-xs p-2 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">
                    Tratamentos Psicológicos Anteriores & Medicamentos em Uso
                  </label>
                  {isBlankFormMode ? (
                    <div className="space-y-3 py-1">
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    </div>
                  ) : (
                    <textarea
                      rows={2}
                      value={formData.medicamentosUsoContinuo || ''}
                      onChange={e => handleFieldChange('medicamentosUsoContinuo', e.target.value)}
                      placeholder="Psicofármacos, posologia, histórico psiquiátrico anterior..."
                      className="w-full text-xs p-2 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 5. DINÂMICA DA VIDA (DESENVOLVIMENTO AO LONGO DO CICLO VITAL) */}
          <div className="mb-6 border-2 border-[#033B6C] rounded-xl overflow-hidden print:border-black/30">
            <div className="bg-[#033B6C] text-white px-3.5 py-1.5 font-bold text-xs flex items-center justify-between">
              <span>5. DINÂMICA DA VIDA (DESENVOLVIMENTO AO LONGO DO CICLO VITAL)</span>
              <span className="text-[10px] opacity-90">Perspectiva Histórico-Cultural & Mediadores</span>
            </div>
            
            <div className="p-3 bg-white overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8F5F0] border-b-2 border-[#033B6C]">
                    <th className="p-2 text-left font-bold text-[#033B6C] border border-[#CBD5E0] w-[38%]">
                      ASPECTO / ETAPA DA VIDA
                    </th>
                    <th className="p-2 text-left font-bold text-[#62A032] border border-[#CBD5E0] w-[31%]">
                      MEDIADORES (Pessoas, instituições, instrumentos)
                    </th>
                    <th className="p-2 text-left font-bold text-[#033B6C] border border-[#CBD5E0] w-[31%]">
                      COMPOSIÇÃO DA PERSONALIDADE
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dinamicaVidaConfig.map((item) => (
                    <tr key={item.key} className="hover:bg-[#FDFBF7]">
                      <td className="p-2 border border-[#CBD5E0] align-top">
                        <div className="font-bold text-[#033B6C] text-xs mb-0.5">{item.titulo}</div>
                        <div className="text-[10px] text-[#4A5568] leading-tight mb-1.5">{item.pergunta}</div>
                        {isBlankFormMode ? (
                          <div className="space-y-2 py-1">
                            <div className="border-b border-dashed border-[#CBD5E0] h-5 w-full"></div>
                            <div className="border-b border-dashed border-[#CBD5E0] h-5 w-full"></div>
                          </div>
                        ) : (
                          <textarea
                            rows={2}
                            value={(formData as any)[item.key] || ''}
                            onChange={e => handleFieldChange(item.key as any, e.target.value)}
                            placeholder="Relato sobre esta etapa..."
                            className="w-full text-xs p-1.5 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md focus:bg-white"
                          />
                        )}
                      </td>

                      <td className="p-2 border border-[#CBD5E0] align-top">
                        {isBlankFormMode ? (
                          <div className="space-y-2 py-1">
                            <div className="border-b border-dashed border-[#CBD5E0] h-5 w-full"></div>
                            <div className="border-b border-dashed border-[#CBD5E0] h-5 w-full"></div>
                          </div>
                        ) : (
                          <textarea
                            rows={3}
                            value={(formData as any)[`${item.key}Mediadores`] || ''}
                            onChange={e => handleFieldChange(`${item.key}Mediadores` as any, e.target.value)}
                            placeholder="Quem ou o que mediou essa experiência..."
                            className="w-full text-xs p-1.5 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md focus:bg-white"
                          />
                        )}
                      </td>

                      <td className="p-2 border border-[#CBD5E0] align-top">
                        {isBlankFormMode ? (
                          <div className="space-y-2 py-1">
                            <div className="border-b border-dashed border-[#CBD5E0] h-5 w-full"></div>
                            <div className="border-b border-dashed border-[#CBD5E0] h-5 w-full"></div>
                          </div>
                        ) : (
                          <textarea
                            rows={3}
                            value={(formData as any)[`${item.key}Personalidade`] || ''}
                            onChange={e => handleFieldChange(`${item.key}Personalidade` as any, e.target.value)}
                            placeholder="O que ajudou a compor na personalidade..."
                            className="w-full text-xs p-1.5 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md focus:bg-white"
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. CENÁRIO DE VIDA ATUAL */}
          <div className="mb-6 border-2 border-[#033B6C] rounded-xl overflow-hidden print:border-black/30">
            <div className="bg-[#033B6C] text-white px-3.5 py-1.5 font-bold text-xs">
              6. CENÁRIO DE VIDA ATUAL
            </div>
            <div className="p-3.5 space-y-3 bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">
                    Pessoas Mais Significativas no Momento
                  </label>
                  {isBlankFormMode ? (
                    <div className="space-y-2 py-1">
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    </div>
                  ) : (
                    <textarea
                      rows={2}
                      value={formData.cenarioPessoasSignificativas || ''}
                      onChange={e => handleFieldChange('cenarioPessoasSignificativas', e.target.value)}
                      placeholder="Figuras de vínculo e apoio atuais..."
                      className="w-full text-xs p-2 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">
                    O que ajudou na composição da personalidade?
                  </label>
                  {isBlankFormMode ? (
                    <div className="space-y-2 py-1">
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    </div>
                  ) : (
                    <textarea
                      rows={2}
                      value={formData.cenarioPessoasSignificativasPersonalidade || ''}
                      onChange={e => handleFieldChange('cenarioPessoasSignificativasPersonalidade', e.target.value)}
                      placeholder="Influência na sustentação emocional e identidade..."
                      className="w-full text-xs p-2 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">
                    Atividades Mais Presentes no Cotidiano
                  </label>
                  {isBlankFormMode ? (
                    <div className="space-y-2 py-1">
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    </div>
                  ) : (
                    <textarea
                      rows={2}
                      value={formData.cenarioAtividadesPresentes || ''}
                      onChange={e => handleFieldChange('cenarioAtividadesPresentes', e.target.value)}
                      placeholder="Trabalho, estudos, hobbies, atividades de cuidado..."
                      className="w-full text-xs p-2 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">
                    O que ajudou na composição da personalidade?
                  </label>
                  {isBlankFormMode ? (
                    <div className="space-y-2 py-1">
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    </div>
                  ) : (
                    <textarea
                      rows={2}
                      value={formData.cenarioAtividadesPresentesPersonalidade || ''}
                      onChange={e => handleFieldChange('cenarioAtividadesPresentesPersonalidade', e.target.value)}
                      placeholder="Espaços de regulação, prazer e estresse..."
                      className="w-full text-xs p-2 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">
                    Contextos em que Mais Circula
                  </label>
                  {isBlankFormMode ? (
                    <div className="space-y-2 py-1">
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    </div>
                  ) : (
                    <textarea
                      rows={2}
                      value={formData.cenarioContextosCirculacao || ''}
                      onChange={e => handleFieldChange('cenarioContextosCirculacao', e.target.value)}
                      placeholder="Ambientes sociais, comunitários, institucionais e virtuais..."
                      className="w-full text-xs p-2 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">
                    O que ajudou na composição da personalidade?
                  </label>
                  {isBlankFormMode ? (
                    <div className="space-y-2 py-1">
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                      <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    </div>
                  ) : (
                    <textarea
                      rows={2}
                      value={formData.cenarioContextosCirculacaoPersonalidade || ''}
                      onChange={e => handleFieldChange('cenarioContextosCirculacaoPersonalidade', e.target.value)}
                      placeholder="Abertura a novas experiências, pertencimento social..."
                      className="w-full text-xs p-2 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 7. SINTOMATOLOGIA DO DESENVOLVIMENTO */}
          <div className="mb-6 border-2 border-[#033B6C] rounded-xl overflow-hidden print:border-black/30">
            <div className="bg-[#033B6C] text-white px-3.5 py-1.5 font-bold text-xs">
              7. SINTOMATOLOGIA DO DESENVOLVIMENTO
            </div>
            <div className="p-3.5 space-y-3 bg-white">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">
                  Nível do Desenvolvimento que Alcançou a Pessoa no Momento Presente
                </label>
                {isBlankFormMode ? (
                  <div className="space-y-2 py-1">
                    <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                  </div>
                ) : (
                  <textarea
                    rows={2}
                    value={formData.nivelDesenvolvimentoPresente || ''}
                    onChange={e => handleFieldChange('nivelDesenvolvimentoPresente', e.target.value)}
                    placeholder="Funções psicológicas consolidadas, autonomia, pensamento conceitual..."
                    className="w-full text-xs p-2 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">
                  Características do Desenvolvimento no Momento Presente
                </label>
                {isBlankFormMode ? (
                  <div className="space-y-2 py-1">
                    <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                  </div>
                ) : (
                  <textarea
                    rows={2}
                    value={formData.caracteristicasDesenvolvimentoPresente || ''}
                    onChange={e => handleFieldChange('caracteristicasDesenvolvimentoPresente', e.target.value)}
                    placeholder="Modulação emocional, capacidade reflexiva, recursos intelectuais e de enfrentamento..."
                    className="w-full text-xs p-2 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">
                  Possibilidades de Desenvolvimento (Zona de Desenvolvimento Proximal / Potencialidades)
                </label>
                {isBlankFormMode ? (
                  <div className="space-y-2 py-1">
                    <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                  </div>
                ) : (
                  <textarea
                    rows={2}
                    value={formData.possibilidadesDesenvolvimento || ''}
                    onChange={e => handleFieldChange('possibilidadesDesenvolvimento', e.target.value)}
                    placeholder="Aquisições possíveis com mediação psicoterápica, novas estratégias de regulação..."
                    className="w-full text-xs p-2 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 8. EXAME DAS FUNÇÕES PSÍQUICAS */}
          <div className="mb-6 border-2 border-[#033B6C] rounded-xl overflow-hidden print:border-black/30">
            <div className="bg-[#033B6C] text-white px-3.5 py-1.5 font-bold text-xs flex items-center justify-between">
              <span>8. EXAME DAS FUNÇÕES PSÍQUICAS (SÚMULA PSICOPATOLÓGICA)</span>
              <span className="text-[10px] opacity-90">Avaliação Técnica Estruturada</span>
            </div>

            <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Aparência Geral, Postura & Atitude</label>
                {isBlankFormMode ? (
                  <div className="border-b-2 border-[#718096] h-7 w-full"></div>
                ) : (
                  <input
                    type="text"
                    value={formData.aparenciaAtitude || ''}
                    onChange={e => handleFieldChange('aparenciaAtitude', e.target.value)}
                    placeholder="Ex: Cuidados pessoais preservados, atitude colaborativa e receptiva"
                    className="w-full text-xs p-1.5 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Consciência, Atenção & Orientação</label>
                {isBlankFormMode ? (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[10px] font-bold text-[#2D3748]">[ ] Lúcido / Vigil</span>
                    <span className="text-[10px] font-bold text-[#2D3748]">[ ] Orientado</span>
                    <span className="text-[10px] font-bold text-[#2D3748]">[ ] Desorientado</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData.conscienciaOrientacao || ''}
                    onChange={e => handleFieldChange('conscienciaOrientacao', e.target.value)}
                    placeholder="Ex: Lúcido, vigil e orientado têmporo-espacialmente"
                    className="w-full text-xs p-1.5 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Humor, Afeto & Expressão Afetiva</label>
                {isBlankFormMode ? (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-bold text-[#2D3748]">[ ] Normotímico</span>
                    <span className="text-[10px] font-bold text-[#2D3748]">[ ] Ansioso</span>
                    <span className="text-[10px] font-bold text-[#2D3748]">[ ] Hipotímico</span>
                    <span className="text-[10px] font-bold text-[#2D3748]">[ ] Congruente</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData.humorAfeto || ''}
                    onChange={e => handleFieldChange('humorAfeto', e.target.value)}
                    placeholder="Ex: Humor hipotímico / ansioso, afeto congruente com o relato"
                    className="w-full text-xs p-1.5 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Pensamento, Linguagem & Discurso</label>
                {isBlankFormMode ? (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-bold text-[#2D3748]">[ ] Lógico/Coerente</span>
                    <span className="text-[10px] font-bold text-[#2D3748]">[ ] Acelerado</span>
                    <span className="text-[10px] font-bold text-[#2D3748]">[ ] Sem delírios</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData.pensamentoLinguagem || ''}
                    onChange={e => handleFieldChange('pensamentoLinguagem', e.target.value)}
                    placeholder="Ex: Curso lógico e coerente, sem delírios ou desagregação"
                    className="w-full text-xs p-1.5 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Sensopercepção & Psicomotricidade</label>
                {isBlankFormMode ? (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[10px] font-bold text-[#2D3748]">[ ] Sensopercepção Preservada</span>
                    <span className="text-[10px] font-bold text-[#2D3748]">[ ] Psicomotricidade Adequada</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData.sensopercepcao || ''}
                    onChange={e => handleFieldChange('sensopercepcao', e.target.value)}
                    placeholder="Ex: Ausência de alucinações; psicomotricidade preservada"
                    className="w-full text-xs p-1.5 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Juízo Crítico de Realidade & Insight</label>
                {isBlankFormMode ? (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[10px] font-bold text-[#2D3748]">[ ] Juízo Preservado</span>
                    <span className="text-[10px] font-bold text-[#2D3748]">[ ] Insight Presente</span>
                    <span className="text-[10px] font-bold text-[#2D3748]">[ ] Parcial</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData.juizoCriticoInsight || ''}
                    onChange={e => handleFieldChange('juizoCriticoInsight', e.target.value)}
                    placeholder="Ex: Juízo de realidade preservado, consciência sobre os sintomas"
                    className="w-full text-xs p-1.5 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 9. HIPÓTESE DIAGNÓSTICA & PLANO TERAPÊUTICO */}
          <div className="mb-6 border-2 border-[#033B6C] rounded-xl overflow-hidden print:border-black/30">
            <div className="bg-[#033B6C] text-white px-3.5 py-1.5 font-bold text-xs">
              9. COMPREENSÃO DIAGNÓSTICA, ENQUADRE TEÓRICO & METAS
            </div>

            <div className="p-3.5 space-y-3 bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Abordagem / Enquadre Teórico</label>
                  {isBlankFormMode ? (
                    <div className="flex items-center gap-2 pt-1 text-[9.5px]">
                      <span>[ ] TCC</span>
                      <span>[ ] Psicanálise</span>
                      <span>[ ] Histórico-Cultural</span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={formData.enquadreTeorico || ''}
                      onChange={e => handleFieldChange('enquadreTeorico', e.target.value)}
                      placeholder="Ex: TCC, Psicanálise, Histórico-Cultural..."
                      className="w-full text-xs p-1.5 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Hipótese Diagnóstica / CID-11</label>
                  {isBlankFormMode ? (
                    <div className="border-b-2 border-[#718096] h-7 w-full"></div>
                  ) : (
                    <input
                      type="text"
                      value={formData.hipoteseDiagnosticaCid || ''}
                      onChange={e => handleFieldChange('hipoteseDiagnosticaCid', e.target.value)}
                      placeholder="Ex: Transtorno de Ansiedade Generalizada (CID-11: 6B00)"
                      className="w-full text-xs p-1.5 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md font-semibold"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Frequência das Sessões & Duração</label>
                  {isBlankFormMode ? (
                    <div className="border-b-2 border-[#718096] h-7 w-full"></div>
                  ) : (
                    <input
                      type="text"
                      value={formData.frequenciaSessoes || ''}
                      onChange={e => handleFieldChange('frequenciaSessoes', e.target.value)}
                      placeholder="Ex: 1 sessão semanal de 50 minutos (Presencial)"
                      className="w-full text-xs p-1.5 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">
                  Objetivos Terapêuticos Iniciais & Linha de Cuidado
                </label>
                {isBlankFormMode ? (
                  <div className="space-y-3 py-1">
                    <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                  </div>
                ) : (
                  <textarea
                    rows={2}
                    value={formData.objetivosTerapeuticos || ''}
                    onChange={e => handleFieldChange('objetivosTerapeuticos', e.target.value)}
                    placeholder="Psicoeducação, fortalecimento de recursos de enfrentamento, reestruturação cognitiva..."
                    className="w-full text-xs p-2 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">
                  Encaminhamentos Interdisciplinares / Observações Finais
                </label>
                {isBlankFormMode ? (
                  <div className="space-y-3 py-1">
                    <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                    <div className="border-b border-dashed border-[#718096] h-6 w-full"></div>
                  </div>
                ) : (
                  <textarea
                    rows={2}
                    value={formData.encaminhamentos || ''}
                    onChange={e => handleFieldChange('encaminhamentos', e.target.value)}
                    placeholder="Encaminhamento para avaliação psiquiátrica, exames complementares, termo de consentimento..."
                    className="w-full text-xs p-2 bg-[#F8F5F0]/50 border border-[#E2E8F0] rounded-md"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 10. TERMO DE SIGILO ÉTICO E ASSINATURAS */}
          <div className="border-t-2 border-[#033B6C] pt-4 break-inside-avoid print:border-black">
            <p className="text-[10px] text-justify text-[#4A5568] mb-6 italic leading-tight">
              <strong>Nota Ética & Sigilo Profissional:</strong> As informações contidas neste prontuário são estritamente confidenciais e protegidas pelo Código de Ética Profissional do Psicólogo (Resolução CFP nº 010/2005 e Resolução CFP nº 001/2009). O acesso é restrito ao paciente, ao profissional responsável, aos estagiários envolvidos e ao corpo docente de supervisão da Clínica Escola de Psicologia da Faculdade Campos Salles.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
              <div>
                <div className="border-b-2 border-[#2D3748] mb-1 mx-2 h-10"></div>
                <p className="font-bold text-[#1A202C]">
                  {isBlankFormMode ? 'Assinatura do Paciente / Responsável' : (formData.pacienteNome || 'Paciente / Responsável Legal')}
                </p>
                <p className="text-[10px] text-[#718096]">Paciente / Responsável Legal</p>
              </div>

              <div>
                <div className="border-b-2 border-[#2D3748] mb-1 mx-2 h-10"></div>
                <p className="font-bold text-[#1A202C]">
                  {isBlankFormMode ? 'Assinatura do(a) Estagiário(a) Clínico(a)' : (formData.estagiarioNome || 'Acadêmico(a) de Psicologia')}
                </p>
                <p className="text-[10px] text-[#718096]">
                  {isBlankFormMode ? 'Estagiário(a) Clínico(a) / RA' : (formData.raEstagiario ? `RA: ${formData.raEstagiario}` : 'Estagiário(a) Clínico(a)')}
                </p>
              </div>

              <div>
                <div className="border-b-2 border-[#2D3748] mb-1 mx-2 h-10"></div>
                <p className="font-bold text-[#1A202C]">
                  {isBlankFormMode ? 'Assinatura do(a) Supervisor(a) Docente' : (formData.orientadorNome || formData.profissionalResponsavel || 'Profissional / Orientador')}
                </p>
                <p className="text-[10px] text-[#718096]">
                  {isBlankFormMode ? 'Supervisor(a) Docente / CRP' : (formData.crpOrientador || formData.crpProfissional ? `CRP: ${formData.crpOrientador || formData.crpProfissional}` : 'Psicólogo(a) / Supervisor(a) Docente')}
                </p>
              </div>
            </div>

            <div className="mt-8 text-center text-[9px] text-[#718096] border-t border-[#E2E8F0] pt-2 flex items-center justify-between">
              <span>SIACS • Faculdade Campos Salles — Clínica Escola de Psicologia</span>
              <span>Emissão do Prontuário em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
