import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { Acompanhamento, PacienteUser } from '../types';
import { SIACSMonogram } from './SIACSLogo';
import {
  Printer,
  ExternalLink,
  X,
  User,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CheckSquare,
  Square,
  Plus,
  Edit3,
  Trash2,
  Save,
  Calendar,
  Clock,
  GraduationCap,
  Stethoscope,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface AcompanhamentoPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPacienteId?: string;
}

export const AcompanhamentoPrintModal: React.FC<AcompanhamentoPrintModalProps> = ({
  isOpen,
  onClose,
  initialPacienteId
}) => {
  const { currentUser } = useAuth();
  const [pacientes, setPacientes] = useState<PacienteUser[]>([]);
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>(initialPacienteId || '');
  const [selectedPaciente, setSelectedPaciente] = useState<PacienteUser | undefined>();
  const [acompanhamentos, setAcompanhamentos] = useState<Acompanhamento[]>([]);
  const [isBlankFormMode, setIsBlankFormMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'formulario' | 'preview'>('preview');
  const [actionFeedback, setActionFeedback] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Form states for filling session directly in the system
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    numeroSessao: number;
    data: string;
    statusPresenca: 'Presente' | 'Faltou' | 'Justificado';
    observacoes: string;
    tecnicasUtilizadas: string;
    planoProximosPassos: string;
    profissionalNome: string;
    crpProfissional: string;
    estagiarioNome: string;
    raEstagiario: string;
    orientadorNome: string;
    crpOrientador: string;
  }>({
    numeroSessao: 1,
    data: new Date().toISOString().split('T')[0],
    statusPresenca: 'Presente',
    observacoes: '',
    tecnicasUtilizadas: '',
    planoProximosPassos: '',
    profissionalNome: 'Dra. Camila Andrade',
    crpProfissional: '06/123456',
    estagiarioNome: 'Lucas Silveira',
    raEstagiario: '2024.1.0092',
    orientadorNome: 'Profa. Dra. Helena Matos',
    crpOrientador: '06/98765-SP'
  });

  const printableContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const allPacientes = db.getPacientes();
    setPacientes(allPacientes);

    const targetId = initialPacienteId || selectedPacienteId || (allPacientes[0]?.id ?? '');
    if (targetId) {
      setSelectedPacienteId(targetId);
      carregarPaciente(targetId);
    }
  }, [isOpen, initialPacienteId]);

  const carregarPaciente = (pacienteId: string) => {
    if (!pacienteId) return;
    const pac = db.getPacientes().find(p => p.id === pacienteId);
    setSelectedPaciente(pac);

    const list = db.getAcompanhamentosByPacienteId(pacienteId);
    setAcompanhamentos(list);

    // Preparar formulário para nova sessão
    iniciarNovaSessao(list, pac);
  };

  const iniciarNovaSessao = (list?: Acompanhamento[], pac?: PacienteUser) => {
    const existingList = list || acompanhamentos;
    const nextNum = existingList.length > 0 ? Math.max(...existingList.map(a => a.numeroSessao)) + 1 : 1;

    setEditingSessionId(null);
    setFormData({
      numeroSessao: nextNum,
      data: new Date().toISOString().split('T')[0],
      statusPresenca: 'Presente',
      observacoes: '',
      tecnicasUtilizadas: '',
      planoProximosPassos: '',
      profissionalNome: currentUser?.role === 'profissional' ? currentUser.nome : 'Dra. Camila Andrade',
      crpProfissional: '06/123456',
      estagiarioNome: currentUser?.role === 'estagiario' ? currentUser.nome : 'Lucas Silveira',
      raEstagiario: '2024.1.0092',
      orientadorNome: currentUser?.role === 'orientador' ? currentUser.nome : 'Profa. Dra. Helena Matos',
      crpOrientador: '06/98765-SP'
    });
  };

  const carregarSessaoParaEdicao = (acomp: Acompanhamento) => {
    setEditingSessionId(acomp.id);
    setFormData({
      numeroSessao: acomp.numeroSessao || 1,
      data: acomp.data || new Date().toISOString().split('T')[0],
      statusPresenca: (acomp.statusPresenca as any) || 'Presente',
      observacoes: acomp.observacoes || '',
      tecnicasUtilizadas: acomp.tecnicasUtilizadas || '',
      planoProximosPassos: acomp.planoProximosPassos || '',
      profissionalNome: acomp.profissionalNome || 'Dra. Camila Andrade',
      crpProfissional: acomp.crpProfissional || '06/123456',
      estagiarioNome: acomp.estagiarioNome || 'Lucas Silveira',
      raEstagiario: acomp.raEstagiario || '2024.1.0092',
      orientadorNome: acomp.orientadorNome || 'Profa. Dra. Helena Matos',
      crpOrientador: acomp.crpOrientador || '06/98765-SP'
    });
    setActiveTab('formulario');
  };

  const handlePacienteChange = (pacienteId: string) => {
    setSelectedPacienteId(pacienteId);
    carregarPaciente(pacienteId);
  };

  const showFeedback = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setActionFeedback({ text, type });
    if (type !== 'info') {
      setTimeout(() => setActionFeedback(null), 5000);
    }
  };

  const handleSalvarSessao = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPacienteId) {
      showFeedback('Selecione um paciente para salvar a ficha de acompanhamento.', 'error');
      return;
    }

    if (!formData.observacoes.trim()) {
      showFeedback('Por favor, descreva as observações clínicas e dinâmica da sessão.', 'error');
      return;
    }

    const pac = selectedPaciente || db.getPacientes().find(p => p.id === selectedPacienteId);
    const numProntuario = pac?.numeroProntuario || db.getNumeroProntuarioPaciente(selectedPacienteId);

    const saved = db.salvarAcompanhamento({
      id: editingSessionId || undefined,
      pacienteId: selectedPacienteId,
      pacienteNome: pac?.nome || 'Paciente',
      numeroProntuario: numProntuario,
      numeroSessao: Number(formData.numeroSessao),
      data: formData.data,
      statusPresenca: formData.statusPresenca,
      observacoes: formData.observacoes,
      tecnicasUtilizadas: formData.tecnicasUtilizadas,
      planoProximosPassos: formData.planoProximosPassos,
      profissionalId: currentUser?.role === 'profissional' ? currentUser.id : 'prof-camila',
      profissionalNome: formData.profissionalNome,
      crpProfissional: formData.crpProfissional,
      estagiarioId: currentUser?.role === 'estagiario' ? currentUser.id : 'est-lucas',
      estagiarioNome: formData.estagiarioNome,
      raEstagiario: formData.raEstagiario,
      orientadorId: currentUser?.role === 'orientador' ? currentUser.id : 'orient-helena',
      orientadorNome: formData.orientadorNome,
      crpOrientador: formData.crpOrientador
    });

    const updatedList = db.getAcompanhamentosByPacienteId(selectedPacienteId);
    setAcompanhamentos(updatedList);
    showFeedback(`✅ Ficha da Sessão #${saved.numeroSessao} salva com sucesso no prontuário!`, 'success');
    iniciarNovaSessao(updatedList, pac);
    setActiveTab('preview');
  };

  const handleExcluirSessao = (id: string, num: number) => {
    if (confirm(`Tem certeza que deseja remover o registro da Sessão #${num}?`)) {
      db.excluirAcompanhamento(id);
      const updatedList = db.getAcompanhamentosByPacienteId(selectedPacienteId);
      setAcompanhamentos(updatedList);
      showFeedback(`Registro da Sessão #${num} removido.`, 'info');
      if (editingSessionId === id) {
        iniciarNovaSessao(updatedList);
      }
    }
  };

  // SVG oficial idêntico ao da tela de login
  const getSIACSVectorLogoSVG = () => `
    <svg viewBox="0 0 320 320" width="50" height="50" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block; flex-shrink:0;">
      <defs>
        <linearGradient id="siacsBlueGradAcomp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0B5C98" />
          <stop offset="50%" stop-color="#033B6C" />
          <stop offset="100%" stop-color="#012448" />
        </linearGradient>
        <linearGradient id="siacsGreenGradAcomp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#81BF48" />
          <stop offset="50%" stop-color="#62A032" />
          <stop offset="100%" stop-color="#4A8022" />
        </linearGradient>
      </defs>
      <path d="M 68 180 C 52 145 56 100 84 66 C 104 42 135 28 165 25" stroke="url(#siacsBlueGradAcomp)" stroke-width="16" stroke-linecap="round" fill="none" />
      <path d="M 52 200 C 44 175 48 140 64 112" stroke="url(#siacsBlueGradAcomp)" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.8" />
      <path d="M 50 170 C 48 115 85 65 140 45" stroke="url(#siacsGreenGradAcomp)" stroke-width="18" stroke-linecap="round" fill="none" />
      <polygon points="148,32 170,54 136,62" fill="url(#siacsGreenGradAcomp)" />
      <circle cx="170" cy="140" r="86" stroke="url(#siacsBlueGradAcomp)" stroke-width="16" fill="#FFFFFF" />
      <line x1="170" y1="62" x2="170" y2="76" stroke="#033B6C" stroke-width="6" stroke-linecap="round" />
      <line x1="248" y1="140" x2="234" y2="140" stroke="#033B6C" stroke-width="6" stroke-linecap="round" />
      <line x1="170" y1="218" x2="170" y2="204" stroke="#033B6C" stroke-width="6" stroke-linecap="round" />
      <line x1="92" y1="140" x2="106" y2="140" stroke="#033B6C" stroke-width="6" stroke-linecap="round" />
      <line x1="170" y1="140" x2="135" y2="105" stroke="#033B6C" stroke-width="8" stroke-linecap="round" />
      <line x1="170" y1="140" x2="218" y2="92" stroke="#033B6C" stroke-width="8" stroke-linecap="round" />
      <circle cx="170" cy="140" r="7" fill="#E5A823" stroke="#033B6C" stroke-width="3" />
      <path d="M 215 95 L 235 115 L 285 62" stroke="#033B6C" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <g transform="translate(108, 172)">
        <path d="M 28 28 C 18 24 6 25 0 28 L 0 4 C 8 2 20 2 28 8 C 36 2 48 2 56 4 L 56 28 C 50 25 38 24 28 28 Z" fill="#033B6C" />
        <path d="M 26 24 C 18 21 8 22 3 24 L 3 7 C 9 5 19 5 26 10 Z" fill="#FFFFFF" />
        <path d="M 30 24 C 38 21 48 22 53 24 L 53 7 C 47 5 37 5 30 10 Z" fill="#FFFFFF" />
      </g>
      <path d="M 248 185 C 275 198 285 225 272 250 C 255 280 205 282 170 280" stroke="url(#siacsGreenGradAcomp)" stroke-width="24" stroke-linecap="round" fill="none" />
      <path d="M 250 215 C 220 220 188 230 178 255 C 168 278 195 295 230 295 C 255 295 268 285 272 268" stroke="url(#siacsBlueGradAcomp)" stroke-width="18" stroke-linecap="round" fill="none" />
      <polygon points="160,280 190,260 185,298" fill="url(#siacsBlueGradAcomp)" />
    </svg>
  `;

  const generateStandaloneHTML = (includeTopBar = true) => {
    const dataEmissao = new Date().toLocaleDateString('pt-BR');
    const horaEmissao = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const isBlank = isBlankFormMode;
    const numProntuario = isBlank
      ? '___________________'
      : (selectedPaciente?.numeroProntuario || db.getNumeroProntuarioPaciente(selectedPacienteId));

    const renderBlankLine = (minWidth = '100%') => `
      <div style="border-bottom: 1.5px solid #718096; min-height: 20px; width: ${minWidth}; margin-top: 2px;"></div>
    `;

    const renderRuledLines = (count = 3) => {
      let lines = '';
      for (let i = 0; i < count; i++) {
        lines += `<div style="border-bottom: 1px dashed #A0AEC0; height: 22px; width: 100%;"></div>`;
      }
      return `<div style="margin-top: 2px; padding: 1px 0;">${lines}</div>`;
    };

    // Sessões preenchidas ou em branco
    let sessionsHTML = '';
    if (isBlank || acompanhamentos.length === 0) {
      const blankSessionsCount = 4;
      for (let s = 1; s <= blankSessionsCount; s++) {
        sessionsHTML += `
          <div class="session-card">
            <div class="session-header">
              <span>SESSÃO Nº: ____ &bull; DATA: ____/____/________</span>
              <span>PRESENÇA: [ &nbsp; ] PRESENTE &nbsp;&nbsp; [ &nbsp; ] FALTA JUSTIFICADA &nbsp;&nbsp; [ &nbsp; ] FALTOU</span>
            </div>
            <div class="session-body">
              <div class="field-item">
                <span class="field-label">1. Observações Clínicas, Dinâmica da Sessão e Temas Trabalhados:</span>
                ${renderRuledLines(3)}
              </div>
              <div class="grid-2" style="margin-top: 6px;">
                <div class="field-item">
                  <span class="field-label">2. Técnicas / Intervenções Utilizadas:</span>
                  ${renderRuledLines(2)}
                </div>
                <div class="field-item">
                  <span class="field-label">3. Metas / Planejamento para o Próximo Encontro:</span>
                  ${renderRuledLines(2)}
                </div>
              </div>
              <div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div style="font-size: 8.5px; color: #718096;">Duração da Sessão: 50 min &bull; Modalidade: [ &nbsp; ] Presencial &nbsp; [ &nbsp; ] Online</div>
                <div style="text-align: center; width: 220px;">
                  <div style="border-top: 1.5px solid #2D3748; margin-bottom: 2px;"></div>
                  <div style="font-size: 8.5px; font-weight: bold; color: #2D3748;">Visto do Terapeuta / Estagiário</div>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    } else {
      sessionsHTML = acompanhamentos.map((acomp) => `
        <div class="session-card">
          <div class="session-header">
            <span>SESSÃO Nº ${acomp.numeroSessao || 1} &bull; DATA: ${acomp.data ? new Date(acomp.data + 'T12:00:00Z').toLocaleDateString('pt-BR') : '—'}</span>
            <span>STATUS: <strong>${acomp.statusPresenca || 'Presente'}</strong></span>
          </div>
          <div class="session-body">
            <div class="field-item">
              <span class="field-label">1. Observações Clínicas, Dinâmica da Sessão e Temas Trabalhados:</span>
              <div class="field-value text-block">${acomp.observacoes || '—'}</div>
            </div>
            ${(acomp.tecnicasUtilizadas || acomp.planoProximosPassos) ? `
              <div class="grid-2" style="margin-top: 6px;">
                ${acomp.tecnicasUtilizadas ? `
                  <div class="field-item">
                    <span class="field-label">2. Técnicas / Intervenções Utilizadas:</span>
                    <div class="field-value text-block">${acomp.tecnicasUtilizadas}</div>
                  </div>
                ` : ''}
                ${acomp.planoProximosPassos ? `
                  <div class="field-item">
                    <span class="field-label">3. Metas / Planejamento para o Próximo Encontro:</span>
                    <div class="field-value text-block">${acomp.planoProximosPassos}</div>
                  </div>
                ` : ''}
              </div>
            ` : ''}
            <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px dashed #E2E8F0; padding-top: 6px;">
              <div style="font-size: 8.5px; color: #718096;">
                Profissional: <strong>${acomp.profissionalNome || '—'}</strong> ${acomp.crpProfissional ? `(${acomp.crpProfissional})` : ''} ${acomp.estagiarioNome ? `&bull; Estagiário: <strong>${acomp.estagiarioNome}</strong>` : ''} ${acomp.raEstagiario ? `(RA: ${acomp.raEstagiario})` : ''}
              </div>
              <div style="text-align: center; width: 220px;">
                <div style="border-top: 1.5px solid #2D3748; margin-bottom: 2px;"></div>
                <div style="font-size: 8.5px; font-weight: bold; color: #2D3748;">Assinatura / Visto do Terapeuta</div>
              </div>
            </div>
          </div>
        </div>
      `).join('');
    }

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Ficha de Acompanhamento Clínico - ${isBlank ? 'Em Branco' : (selectedPaciente?.nome || 'Paciente')} - SIACS</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm 10mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11px;
      line-height: 1.35;
      color: #1A202C;
      background: #FFFFFF;
      margin: 0;
      padding: 10px 14px;
      width: 100%;
    }
    .header-bar {
      border-bottom: 2.5px solid #033B6C;
      padding-bottom: 8px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header-title-box h1 {
      font-size: 13.5px;
      font-weight: 900;
      color: #033B6C;
      margin: 0 0 2px 0;
      letter-spacing: -0.3px;
    }
    .header-title-box p {
      font-size: 9.5px;
      color: #4A5568;
      margin: 0;
    }
    .header-meta {
      text-align: right;
      font-size: 10px;
      border: 1px solid #CBD5E0;
      background: #F7FAFC;
      padding: 5px 8px;
      border-radius: 6px;
    }
    .doc-badge {
      background: #F8F5F0;
      border: 1px solid #CBD5E0;
      border-radius: 6px;
      padding: 6px 10px;
      text-align: center;
      margin-bottom: 10px;
    }
    .doc-badge h2 {
      font-size: 12.5px;
      font-weight: 900;
      color: #033B6C;
      margin: 0 0 2px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-badge p {
      font-size: 9.5px;
      color: #4A5568;
      margin: 0;
    }
    .section-box {
      border: 1.5px solid #033B6C;
      border-radius: 6px;
      margin-bottom: 8px;
      overflow: hidden;
      page-break-inside: avoid;
    }
    .section-header {
      background: #033B6C;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 10px;
      padding: 4px 8px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      display: flex;
      justify-content: space-between;
    }
    .section-body {
      padding: 8px;
      background: #FFFFFF;
    }
    .session-card {
      border: 1.5px solid #CBD5E0;
      border-radius: 6px;
      margin-bottom: 10px;
      overflow: hidden;
      page-break-inside: avoid;
      background: #FFFFFF;
    }
    .session-header {
      background: #EBF3FB;
      color: #033B6C;
      font-weight: 800;
      font-size: 9.5px;
      padding: 4px 8px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #CBD5E0;
    }
    .session-body {
      padding: 8px;
      background: #FFFFFF;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 10px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 6px 10px;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 6px 8px;
    }
    .field-item {
      display: flex;
      flex-direction: column;
    }
    .field-label {
      font-size: 9px;
      font-weight: 700;
      color: #4A5568;
      text-transform: uppercase;
      letter-spacing: 0.2px;
      margin-bottom: 2px;
    }
    .field-value {
      font-size: 10.5px;
      color: #1A202C;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 4px;
      padding: 3px 6px;
      min-height: 18px;
    }
    .field-value.text-block {
      white-space: pre-wrap;
      line-height: 1.4;
      font-size: 10px;
    }
    .sign-section {
      margin-top: 14px;
      padding-top: 8px;
      border-top: 1.5px solid #033B6C;
      page-break-inside: avoid;
    }
    .sign-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      text-align: center;
      margin-top: 16px;
    }
    .sign-line {
      border-top: 1.5px solid #2D3748;
      margin-bottom: 4px;
    }
    .sign-title {
      font-size: 10px;
      font-weight: bold;
      color: #1A202C;
    }
    .sign-sub {
      font-size: 9px;
      color: #4A5568;
    }
    .footer-note {
      font-size: 8px;
      color: #718096;
      text-align: center;
      margin-top: 10px;
      border-top: 1px solid #E2E8F0;
      padding-top: 3px;
    }
    .top-action-bar {
      position: sticky;
      top: 0;
      background: #033B6C;
      color: white;
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: -10px -14px 14px -14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 100;
    }
    .btn-action {
      background: #62A032;
      color: white;
      border: none;
      padding: 7px 18px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 13px;
      cursor: pointer;
    }
    .btn-action:hover {
      background: #508627;
    }
    @media print {
      body {
        padding: 0 !important;
      }
      .no-print, .top-action-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  ${includeTopBar ? `
    <!-- Barra de Ação Superior (Oculta ao Imprimir) -->
    <div class="top-action-bar no-print">
      <div style="font-weight: bold; font-size: 13px;">
        SIACS &bull; ${isBlank ? 'FICHA DE ACOMPANHAMENTO EM BRANCO (PAUTADA)' : `ACOMPANHAMENTO CLÍNICO • ${selectedPaciente?.nome || 'PACIENTE'}`}
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn-action" onclick="window.print()">🖨️ IMPRIMIR / SALVAR EM PDF</button>
      </div>
    </div>
  ` : ''}

  <!-- CABEÇALHO INSTITUCIONAL -->
  <div class="header-bar">
    <div class="header-left">
      ${getSIACSVectorLogoSVG()}
      <div class="header-title-box">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 18px; font-weight: 900; color: #033B6C; letter-spacing: -0.5px;">SIACS</span>
          <span style="font-size: 9.5px; font-weight: bold; background: #F1F8E9; color: #62A032; border: 1px solid #D0E3B6; padding: 1px 6px; border-radius: 4px;">Clínica Escola de Psicologia</span>
        </div>
        <h1 style="font-size: 13px; margin: 2px 0 0 0; color: #1A202C;">Faculdade Integradas Campos Salles</h1>
        <p style="font-size: 9.5px; color: #62A032; font-weight: 600;">Sistema Integrado de Agendamento Campos Salles &bull; Eficiência e Organização</p>
      </div>
    </div>
    <div class="header-meta">
      <strong>PRONTUÁRIO:</strong> ${numProntuario}<br/>
      <strong>Data de Emissão:</strong> ${dataEmissao}<br/>
      <span style="color: #718096; font-size: 8px;">Documento Confidencial &bull; Resolução CFP</span>
    </div>
  </div>

  <!-- TÍTULO -->
  <div class="doc-badge">
    <h2>Ficha de Acompanhamento e Evolução Clínica</h2>
    <p>${isBlank ? 'Instrumento para anotações manuscritas de sessões, técnicas e evolução psicológica' : 'Registro Contínuo de Evolução Psicológica, Intervenções e Planejamento Terapêutico'}</p>
  </div>

  <!-- 1. IDENTIFICAÇÃO DO PACIENTE -->
  <div class="section-box">
    <div class="section-header">
      <span>1. Identificação do Paciente &bull; Prontuário Vinculado</span>
      <span>${isBlank ? 'Modalidade: [ &nbsp; ] Presencial &nbsp; [ &nbsp; ] Online' : 'Clínica Escola'}</span>
    </div>
    <div class="section-body">
      <div class="grid-3" style="margin-bottom: 4px;">
        <div class="field-item" style="grid-column: span 2;">
          <span class="field-label">Nome Completo do Paciente</span>
          ${isBlank ? renderBlankLine() : `<div class="field-value font-bold">${selectedPaciente?.nome || '—'}</div>`}
        </div>
        <div class="field-item">
          <span class="field-label">Data de Nascimento / CPF</span>
          ${isBlank ? renderBlankLine() : `<div class="field-value">${selectedPaciente?.dataNascimento ? new Date(selectedPaciente.dataNascimento + 'T12:00:00Z').toLocaleDateString('pt-BR') : ''} ${selectedPaciente?.cpf ? `(CPF: ${selectedPaciente.cpf})` : '—'}</div>`}
        </div>
      </div>

      <div class="grid-3">
        <div class="field-item">
          <span class="field-label">Telefone / WhatsApp</span>
          ${isBlank ? renderBlankLine() : `<div class="field-value">${selectedPaciente?.telefone || '—'}</div>`}
        </div>
        <div class="field-item">
          <span class="field-label">E-mail</span>
          ${isBlank ? renderBlankLine() : `<div class="field-value">${selectedPaciente?.email || '—'}</div>`}
        </div>
        <div class="field-item">
          <span class="field-label">Profissão / Ocupação</span>
          ${isBlank ? renderBlankLine() : `<div class="field-value">${selectedPaciente?.profissao || '—'}</div>`}
        </div>
      </div>
    </div>
  </div>

  <!-- 2. REGISTRO DE EVOLUÇÕES DAS SESSÕES -->
  <div class="section-box" style="margin-top: 10px;">
    <div class="section-header">
      <span>2. Registro Sequencial de Evoluções e Atendimentos</span>
      <span>${isBlank ? 'Folha de Registro Contínuo' : `Total Registrado: ${acompanhamentos.length} sessões`}</span>
    </div>
    <div class="section-body" style="padding-top: 10px;">
      ${sessionsHTML}
    </div>
  </div>

  <!-- 3. TERMO DE RESPONSABILIDADE & ASSINATURAS -->
  <div class="sign-section">
    <p style="font-size: 8px; text-align: justify; color: #718096; margin-bottom: 12px; font-style: italic;">
      <strong>Nota de Sigilo e Ética Profissional:</strong> Documento confidencial de uso clínico restrito, em conformidade com o Código de Ética Profissional do Psicólogo (Resolução CFP nº 010/2005). Todos os registros são de responsabilidade do profissional e estagiário executante sob supervisão docente da Faculdade Campos Salles.
    </p>

    <div class="sign-grid">
      <div>
        <div class="sign-line"></div>
        <div class="sign-title">${isBlank ? 'Assinatura do Paciente / Responsável' : (selectedPaciente?.nome || 'Paciente / Responsável')}</div>
        <div class="sign-sub">Paciente / Responsável Legal</div>
      </div>

      <div>
        <div class="sign-line"></div>
        <div class="sign-title">${isBlank ? 'Assinatura do(a) Estagiário(a)' : (acompanhamentos[0]?.estagiarioNome || currentUser?.nome || 'Acadêmico(a) de Psicologia')}</div>
        <div class="sign-sub">Estagiário(a) Clínico(a) / Terapeuta</div>
      </div>

      <div>
        <div class="sign-line"></div>
        <div class="sign-title">${isBlank ? 'Assinatura do(a) Supervisor(a) Docente' : (acompanhamentos[0]?.orientadorNome || acompanhamentos[0]?.profissionalNome || 'Supervisor(a) Docente')}</div>
        <div class="sign-sub">Supervisor(a) Docente / Responsável Técnico</div>
      </div>
    </div>

    <div class="footer-note">
      SIACS &bull; Faculdade Integradas Campos Salles &mdash; Documento emitido em ${dataEmissao} às ${horaEmissao}
    </div>
  </div>

</body>
</html>
    `;
  };

  // Impressão Direta com Iframe / Janela Dedicada
  const handlePrint = () => {
    showFeedback('Abrindo documento para impressão...', 'info');
    const html = generateStandaloneHTML(true);

    try {
      let iframe = document.getElementById('siacs-print-iframe-acomp') as HTMLIFrameElement;
      if (iframe && document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      iframe = document.createElement('iframe');
      iframe.id = 'siacs-print-iframe-acomp';
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
    const html = generateStandaloneHTML(true);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);
    const win = window.open(blobUrl, '_blank');
    if (win) {
      showFeedback('Documento aberto em uma nova aba!', 'success');
    } else {
      showFeedback('Por favor, permita pop-ups no navegador.', 'error');
    }
  };

  if (!isOpen) return null;

  const numProntuario = isBlankFormMode
    ? 'PSI-2026/____'
    : (selectedPaciente?.numeroProntuario || db.getNumeroProntuarioPaciente(selectedPacienteId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Container Principal */}
      <div className="relative w-full max-w-5xl bg-white sm:rounded-2xl shadow-2xl border border-[#E5E1D8] flex flex-col max-h-[96vh] print:max-h-none print:h-auto print:border-none print:shadow-none">
        
        {/* Barra de Ferramentas Superior */}
        <div className="p-4 bg-[#F8F5F0] border-b border-[#E5E1D8] flex flex-wrap items-center justify-between gap-3 print:hidden shrink-0 sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#82954B] text-white rounded-xl shadow-xs">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-base sm:text-lg text-[#434343] leading-tight">
                  Ficha de Acompanhamento e Evolução Clínica
                </h2>
                <span className="text-[11px] font-mono font-bold bg-[#EBF3FB] text-[#033B6C] px-2 py-0.5 rounded-full border border-[#B3D4F5]">
                  {numProntuario}
                </span>
              </div>
              <p className="text-xs text-[#5C5C5C]">
                Histórico evolutivo de atendimentos na Clínica Escola Campos Salles
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Seletor de Paciente */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-[#E5E1D8]">
              <User className="w-3.5 h-3.5 text-[#8E8D8A]" />
              <select
                value={selectedPacienteId}
                onChange={e => handlePacienteChange(e.target.value)}
                className="text-xs font-semibold text-[#434343] bg-transparent focus:outline-hidden cursor-pointer max-w-[200px] truncate"
              >
                <option value="">-- Selecionar Paciente --</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nome} ({p.numeroProntuario || 'Prontuário'})
                  </option>
                ))}
              </select>
            </div>

            {/* Alternador de Abas */}
            <div className="flex bg-[#EAE7DC] p-1 rounded-xl">
              <button
                type="button"
                id="btn-tab-preencher-sessao"
                onClick={() => {
                  setActiveTab('formulario');
                  setIsBlankFormMode(false);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'formulario'
                    ? 'bg-white text-[#82954B] shadow-xs'
                    : 'text-[#5C5C5C] hover:text-[#434343]'
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>{editingSessionId ? 'Editar Sessão' : 'Preencher Sessão'}</span>
              </button>

              <button
                type="button"
                id="btn-tab-preview-impressao"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'preview'
                    ? 'bg-white text-[#033B6C] shadow-xs'
                    : 'text-[#5C5C5C] hover:text-[#434343]'
                }`}
              >
                <FileCheck2 className="w-3 h-3" />
                <span>Visualizar Ficha ({acompanhamentos.length})</span>
              </button>
            </div>

            {/* Botão de Impressão Direta (com opção de Salvar PDF nativo) */}
            <button
              type="button"
              id="btn-imprimir-acomp"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#033B6C] hover:bg-[#022849] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Abrir diálogo de impressão / salvar PDF nativo"
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

        {/* CONTEÚDO DA MODAL (FORMULÁRIO OU PREVIEW) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FDFBF7]">
          
          {/* TAB 1: FORMULÁRIO DE PREENCHIMENTO DIRETO DA SESSÃO */}
          {activeTab === 'formulario' && (
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Banner Informativo */}
              <div className="bg-white p-4 rounded-2xl border border-[#E5E1D8] shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#F1F8E9] text-[#82954B] rounded-xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#434343]">
                      {editingSessionId ? `Editando Ficha da Sessão #${formData.numeroSessao}` : `Nova Ficha de Sessão #${formData.numeroSessao}`}
                    </h3>
                    <p className="text-xs text-[#8E8D8A]">
                      Paciente: <strong>{selectedPaciente?.nome || 'Nenhum selecionado'}</strong> • Prontuário: <strong>{numProntuario}</strong>
                    </p>
                  </div>
                </div>

                {editingSessionId && (
                  <button
                    type="button"
                    onClick={() => iniciarNovaSessao()}
                    className="px-3 py-1.5 bg-[#F8F5F0] hover:bg-[#EAE7DC] text-[#434343] rounded-xl text-xs font-semibold border border-[#E5E1D8] transition-colors cursor-pointer"
                  >
                    + Criar Nova Sessão em vez de Editar
                  </button>
                )}
              </div>

              {/* Formulário Principal */}
              <form onSubmit={handleSalvarSessao} className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5E1D8] shadow-sm space-y-5">
                
                {/* 1. Metadados da Sessão */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#434343] mb-1">
                      Número da Sessão *
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={formData.numeroSessao}
                      onChange={e => setFormData({ ...formData, numeroSessao: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#82954B] font-bold text-[#033B6C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#434343] mb-1">
                      Data do Atendimento *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.data}
                      onChange={e => setFormData({ ...formData, data: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#434343] mb-1">
                      Status de Presença
                    </label>
                    <select
                      value={formData.statusPresenca}
                      onChange={e => setFormData({ ...formData, statusPresenca: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#82954B] font-semibold text-[#434343]"
                    >
                      <option value="Presente">Presente</option>
                      <option value="Falta Justificada">Falta Justificada</option>
                      <option value="Faltou">Faltou sem justificativa</option>
                    </select>
                  </div>
                </div>

                {/* 2. Equipe Responsável */}
                <div className="p-4 bg-[#F8F5F0] rounded-xl border border-[#E5E1D8] grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#434343] mb-1 flex items-center gap-1">
                      <Stethoscope className="w-3 h-3 text-[#82954B]" />
                      Profissional Responsável
                    </label>
                    <input
                      type="text"
                      value={formData.profissionalNome}
                      onChange={e => setFormData({ ...formData, profissionalNome: e.target.value })}
                      placeholder="Ex: Dra. Camila Andrade"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E1D8] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#82954B]"
                    />
                    <input
                      type="text"
                      value={formData.crpProfissional}
                      onChange={e => setFormData({ ...formData, crpProfissional: e.target.value })}
                      placeholder="CRP (ex: 06/123456)"
                      className="w-full px-2.5 py-1 text-[11px] bg-white border border-[#E5E1D8] rounded-lg mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#434343] mb-1 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-[#033B6C]" />
                      Estagiário(a) Clínico(a)
                    </label>
                    <input
                      type="text"
                      value={formData.estagiarioNome}
                      onChange={e => setFormData({ ...formData, estagiarioNome: e.target.value })}
                      placeholder="Ex: Lucas Silveira"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E1D8] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#82954B]"
                    />
                    <input
                      type="text"
                      value={formData.raEstagiario}
                      onChange={e => setFormData({ ...formData, raEstagiario: e.target.value })}
                      placeholder="RA (ex: 2024.1.0092)"
                      className="w-full px-2.5 py-1 text-[11px] bg-white border border-[#E5E1D8] rounded-lg mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#434343] mb-1 flex items-center gap-1">
                      <User className="w-3 h-3 text-[#B58D3D]" />
                      Supervisor(a) Docente
                    </label>
                    <input
                      type="text"
                      value={formData.orientadorNome}
                      onChange={e => setFormData({ ...formData, orientadorNome: e.target.value })}
                      placeholder="Ex: Profa. Dra. Helena Matos"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E1D8] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#82954B]"
                    />
                    <input
                      type="text"
                      value={formData.crpOrientador}
                      onChange={e => setFormData({ ...formData, crpOrientador: e.target.value })}
                      placeholder="CRP Docente (ex: 06/98765-SP)"
                      className="w-full px-2.5 py-1 text-[11px] bg-white border border-[#E5E1D8] rounded-lg mt-1"
                    />
                  </div>
                </div>

                {/* 3. Observações Clínicas & Dinâmica da Sessão */}
                <div>
                  <label className="block text-xs font-bold text-[#434343] mb-1">
                    1. Observações Clínicas, Dinâmica da Sessão e Temas Trabalhados *
                  </label>
                  <p className="text-[11px] text-[#8E8D8A] mb-1.5">
                    Relate as queixas abordadas, discurso do paciente, manifestações emocionais, defesas e aspectos relevantes da sessão.
                  </p>
                  <textarea
                    rows={4}
                    required
                    value={formData.observacoes}
                    onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Descreva detalhadamente a evolução e os acontecimentos desta sessão..."
                    className="w-full px-3 py-2 text-xs bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#82954B] text-[#434343] leading-relaxed"
                  />
                </div>

                {/* 4. Técnicas e Intervenções */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#434343] mb-1">
                      2. Técnicas / Intervenções Utilizadas
                    </label>
                    <textarea
                      rows={3}
                      value={formData.tecnicasUtilizadas}
                      onChange={e => setFormData({ ...formData, tecnicasUtilizadas: e.target.value })}
                      placeholder="Ex: Psicoeducação, reestruturação cognitiva, respiração diafragmática, acolhimento reflexivo..."
                      className="w-full px-3 py-2 text-xs bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#434343] mb-1">
                      3. Metas / Planejamento para o Próximo Encontro
                    </label>
                    <textarea
                      rows={3}
                      value={formData.planoProximosPassos}
                      onChange={e => setFormData({ ...formData, planoProximosPassos: e.target.value })}
                      placeholder="Ex: Aprofundar histórico familiar, avaliar tarefas entre sessões, monitoramento de ansiedade..."
                      className="w-full px-3 py-2 text-xs bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                    />
                  </div>
                </div>

                {/* Botões de Ação do Formulário */}
                <div className="pt-3 border-t border-[#E5E1D8] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className="px-4 py-2 text-xs font-bold text-[#5C5C5C] hover:bg-[#EAE7DC] rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar / Voltar à Visualização
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      id="btn-salvar-ficha-sessao"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#82954B] hover:bg-[#6F803E] text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingSessionId ? 'Atualizar Ficha da Sessão' : 'Salvar Ficha da Sessão'}</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Lista de Sessões Anteriores do Paciente com Ações Rápidas */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E1D8] shadow-xs">
                <h4 className="font-serif font-bold text-sm text-[#434343] mb-3 flex items-center justify-between">
                  <span>Sessões Já Cadastradas para este Paciente ({acompanhamentos.length})</span>
                  <span className="text-xs font-sans text-[#8E8D8A]">Clique em "Editar" para alterar</span>
                </h4>

                {acompanhamentos.length === 0 ? (
                  <p className="text-xs text-[#8E8D8A] py-3 text-center">Nenhuma sessão registrada para este paciente ainda.</p>
                ) : (
                  <div className="space-y-2">
                    {acompanhamentos.map(acomp => (
                      <div
                        key={acomp.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                          editingSessionId === acomp.id
                            ? 'bg-[#F1F8E9] border-[#82954B]'
                            : 'bg-[#F8F5F0] border-[#E5E1D8] hover:bg-[#F2EDE4]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#033B6C] bg-white px-2 py-1 rounded-lg border border-[#CBD5E0]">
                            Sessão #{acomp.numeroSessao}
                          </span>
                          <div>
                            <p className="font-semibold text-[#434343]">
                              {acomp.data ? new Date(acomp.data + 'T12:00:00Z').toLocaleDateString('pt-BR') : '—'} • {acomp.statusPresenca || 'Presente'}
                            </p>
                            <p className="text-[11px] text-[#8E8D8A] line-clamp-1">
                              {acomp.observacoes || 'Sem observações registradas.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => carregarSessaoParaEdicao(acomp)}
                            className="p-1.5 text-[#033B6C] hover:bg-white rounded-lg border border-transparent hover:border-[#CBD5E0] transition-colors cursor-pointer"
                            title="Editar dados desta sessão"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExcluirSessao(acomp.id, acomp.numeroSessao)}
                            className="p-1.5 text-[#C62828] hover:bg-white rounded-lg border border-transparent hover:border-[#F7C4BE] transition-colors cursor-pointer"
                            title="Excluir sessão"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: PREVIEW DA FICHA DE ACOMPANHAMENTO CLÍNICA (IMPRIMÍVEL) */}
          {activeTab === 'preview' && (
            <div
              ref={printableContentRef}
              id="acomp-printable-sheet"
              className="bg-white max-w-4xl mx-auto p-6 sm:p-10 text-[#2D3748] font-sans text-xs sm:text-sm leading-relaxed rounded-2xl shadow-sm border border-[#E5E1D8] print:border-none print:shadow-none print:p-0"
            >
              {/* Botão Rápido para Adicionar Sessão */}
              <div className="mb-4 p-3 bg-[#F1F8E9] border border-[#D0E3B6] rounded-xl flex items-center justify-between gap-3 print:hidden">
                <div className="flex items-center gap-2 text-[#2E7D32] text-xs font-bold">
                  <FileCheck2 className="w-4 h-4" />
                  <span>Total de {acompanhamentos.length} sessão(ões) registrada(s) no prontuário {numProntuario}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    iniciarNovaSessao();
                    setActiveTab('formulario');
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#82954B] hover:bg-[#6F803E] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Lançar Nova Sessão</span>
                </button>
              </div>

              {/* Cabeçalho Institucional */}
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
                    <h1 className="font-bold text-sm sm:text-base text-[#1A202C]">
                      Faculdade Integradas Campos Salles
                    </h1>
                    <p className="text-[10px] text-[#62A032] font-semibold">
                      Sistema Integrado de Agendamento Campos Salles • Eficiência e Organização
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="border border-[#CBD5E0] bg-[#F7FAFC] rounded-lg p-2 text-[11px]">
                    <p className="font-bold text-[#033B6C]">ACOMPANHAMENTO CLÍNICO</p>
                    <p className="font-mono text-xs font-bold text-[#2D3748]">
                      {numProntuario}
                    </p>
                    <p className="text-[10px] text-[#718096] mt-0.5">
                      Data: {new Date().toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <p className="text-[9px] text-[#A0AEC0] mt-1 font-semibold uppercase tracking-wider">
                    Documento Confidencial • Resolução CFP
                  </p>
                </div>
              </div>

              {/* TÍTULO DO FORMULÁRIO */}
              <div className="text-center bg-[#F8F5F0] border border-[#CBD5E0] py-2 px-4 rounded-xl mb-6">
                <h2 className="font-serif font-black text-base sm:text-lg text-[#033B6C] tracking-wide uppercase">
                  FICHA DE ACOMPANHAMENTO E EVOLUÇÃO CLÍNICA
                </h2>
                <p className="text-[11px] text-[#5C5C5C]">
                  {isBlankFormMode
                    ? 'Instrumento estruturado para preenchimento manuscrito de evolução de sessões clínicas.'
                    : 'Registro contínuo e cronológico de atendimentos, dinâmicas e evolução terapêutica.'}
                </p>
              </div>

              {/* 1. IDENTIFICAÇÃO DO PACIENTE */}
              <div className="mb-6 border-2 border-[#033B6C] rounded-xl overflow-hidden">
                <div className="bg-[#033B6C] text-white px-3.5 py-1.5 font-bold text-xs flex items-center justify-between">
                  <span>1. IDENTIFICAÇÃO DO PACIENTE E DADOS SOCIODEMOGRÁFICOS</span>
                  <span className="text-[10px] opacity-90">
                    Prontuário Único: {numProntuario}
                  </span>
                </div>

                <div className="p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Nome Completo do Paciente</label>
                    <div className="p-2 bg-[#F8F5F0] border border-[#E2E8F0] rounded-md font-semibold text-xs text-[#2D3748]">
                      {selectedPaciente?.nome || '—'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">CPF / Data Nasc.</label>
                    <div className="p-2 bg-[#F8F5F0] border border-[#E2E8F0] rounded-md text-xs text-[#2D3748]">
                      {selectedPaciente?.cpf || '—'} {selectedPaciente?.dataNascimento ? `(${new Date(selectedPaciente.dataNascimento + 'T12:00:00Z').toLocaleDateString('pt-BR')})` : ''}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Telefone / WhatsApp</label>
                    <div className="p-2 bg-[#F8F5F0] border border-[#E2E8F0] rounded-md text-xs text-[#2D3748]">
                      {selectedPaciente?.telefone || '—'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">E-mail</label>
                    <div className="p-2 bg-[#F8F5F0] border border-[#E2E8F0] rounded-md text-xs text-[#2D3748]">
                      {selectedPaciente?.email || '—'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#4A5568] mb-0.5">Profissão / Ocupação</label>
                    <div className="p-2 bg-[#F8F5F0] border border-[#E2E8F0] rounded-md text-xs text-[#2D3748]">
                      {selectedPaciente?.profissao || '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. REGISTRO DE EVOLUÇÕES */}
              <div className="mb-6 border-2 border-[#033B6C] rounded-xl overflow-hidden">
                <div className="bg-[#033B6C] text-white px-3.5 py-1.5 font-bold text-xs flex items-center justify-between">
                  <span>2. EVOLUÇÃO DAS SESSÕES PSICOLÓGICAS</span>
                  <span className="text-[10px] opacity-90">
                    {isBlankFormMode ? 'Modo Manual com Pautas' : `${acompanhamentos.length} Sessões Registradas`}
                  </span>
                </div>

                <div className="p-3.5 space-y-4 bg-[#F8F5F0]/30">
                  {isBlankFormMode || acompanhamentos.length === 0 ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-[#CBD5E0] space-y-3">
                        <div className="flex items-center justify-between border-b border-[#CBD5E0] pb-2 font-bold text-xs text-[#033B6C]">
                          <span>SESSÃO Nº: ____ &bull; DATA: ____/____/________</span>
                          <span>PRESENÇA: [ ] PRESENTE &nbsp;&nbsp; [ ] FALTA JUSTIFICADA &nbsp;&nbsp; [ ] FALTOU</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-[#4A5568] block mb-1">Observações Clínicas e Dinâmica:</span>
                          <div className="space-y-2">
                            <div className="border-b border-dashed border-[#A0AEC0] h-6 w-full"></div>
                            <div className="border-b border-dashed border-[#A0AEC0] h-6 w-full"></div>
                            <div className="border-b border-dashed border-[#A0AEC0] h-6 w-full"></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#4A5568] block mb-1">Técnicas / Intervenções:</span>
                            <div className="border-b border-dashed border-[#A0AEC0] h-6 w-full"></div>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#4A5568] block mb-1">Próximos Passos:</span>
                            <div className="border-b border-dashed border-[#A0AEC0] h-6 w-full"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    acompanhamentos.map((acomp) => (
                      <div key={acomp.id} className="bg-white p-4 rounded-xl border border-[#CBD5E0] space-y-3">
                        <div className="flex items-center justify-between border-b border-[#CBD5E0] pb-2 font-bold text-xs text-[#033B6C]">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-[#EBF3FB] text-[#033B6C] text-[11px] font-bold">
                              Sessão #{acomp.numeroSessao}
                            </span>
                            <span>
                              {acomp.data ? new Date(acomp.data + 'T12:00:00Z').toLocaleDateString('pt-BR') : '—'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]">
                              {acomp.statusPresenca || 'Presente'}
                            </span>
                            <button
                              type="button"
                              onClick={() => carregarSessaoParaEdicao(acomp)}
                              className="print:hidden text-[11px] font-bold text-[#033B6C] hover:underline cursor-pointer"
                            >
                              Editar
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase text-[#4A5568] block mb-0.5">Observações Clínicas da Sessão:</span>
                          <p className="text-xs text-[#2D3748] bg-[#F8F5F0] p-2.5 rounded-lg border border-[#E2E8F0] whitespace-pre-line">
                            {acomp.observacoes || '—'}
                          </p>
                        </div>

                        {(acomp.tecnicasUtilizadas || acomp.planoProximosPassos) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {acomp.tecnicasUtilizadas && (
                              <div>
                                <span className="text-[10px] font-bold uppercase text-[#4A5568] block mb-0.5">Técnicas / Intervenções:</span>
                                <p className="bg-[#F8F5F0] p-2 rounded-md border border-[#E2E8F0] text-[#2D3748]">
                                  {acomp.tecnicasUtilizadas}
                                </p>
                              </div>
                            )}
                            {acomp.planoProximosPassos && (
                              <div>
                                <span className="text-[10px] font-bold uppercase text-[#4A5568] block mb-0.5">Metas / Próximos Passos:</span>
                                <p className="bg-[#F8F5F0] p-2 rounded-md border border-[#E2E8F0] text-[#2D3748]">
                                  {acomp.planoProximosPassos}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-[#718096] pt-1 border-t border-[#F0F4F8]">
                          <span>
                            Profissional: {acomp.profissionalNome} {acomp.crpProfissional ? `(${acomp.crpProfissional})` : ''} {acomp.estagiarioNome ? `• Estagiário: ${acomp.estagiarioNome} (RA: ${acomp.raEstagiario || '—'})` : ''}
                          </span>
                          <span className="font-semibold text-[#033B6C]">Prontuário: {acomp.numeroProntuario || numProntuario}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 3. ASSINATURAS E RESPONSABILIDADE */}
              <div className="mt-8 pt-6 border-t-2 border-[#033B6C]">
                <p className="text-[10px] text-[#718096] italic text-justify mb-6">
                  Documento confidencial em conformidade com o Código de Ética Profissional do Psicólogo (Resolução CFP). O conteúdo destina-se exclusivamente ao prontuário do paciente na Clínica Escola da Faculdade Campos Salles.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="border-t-2 border-[#2D3748] mx-4 mb-1"></div>
                    <p className="text-xs font-bold text-[#2D3748]">{selectedPaciente?.nome || 'Paciente / Responsável'}</p>
                    <p className="text-[10px] text-[#718096]">Paciente / Responsável Legal</p>
                  </div>

                  <div>
                    <div className="border-t-2 border-[#2D3748] mx-4 mb-1"></div>
                    <p className="text-xs font-bold text-[#2D3748]">
                      {acompanhamentos[0]?.estagiarioNome || currentUser?.nome || 'Acadêmico(a) de Psicologia'}
                    </p>
                    <p className="text-[10px] text-[#718096]">Estagiário(a) Clínico(a) / Terapeuta</p>
                  </div>

                  <div>
                    <div className="border-t-2 border-[#2D3748] mx-4 mb-1"></div>
                    <p className="text-xs font-bold text-[#2D3748]">
                      {acompanhamentos[0]?.orientadorNome || acompanhamentos[0]?.profissionalNome || 'Supervisor(a) Docente'}
                    </p>
                    <p className="text-[10px] text-[#718096]">Supervisor(a) Docente / CRP</p>
                  </div>
                </div>

                <div className="text-center text-[9px] text-[#A0AEC0] mt-6 border-t border-[#E2E8F0] pt-2">
                  SIACS • Faculdade Integradas Campos Salles • Emissão em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
