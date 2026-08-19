import React, { useState, useMemo } from 'react';
import { db } from '../services/db';
import { Agendamento, EstagiarioUser, ProfissionalUser } from '../types';
import { SIACSMonogram } from './SIACSLogo';
import {
  Printer,
  X,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  FileSpreadsheet,
  Users,
  GraduationCap,
  Stethoscope,
  TrendingUp,
  Download,
  ExternalLink,
  FileText,
  AlertCircle
} from 'lucide-react';

interface RelatorioAtendimentosModalProps {
  isOpen: boolean;
  onClose: () => void;
  orientadorNome?: string;
}

export const RelatorioAtendimentosModal: React.FC<RelatorioAtendimentosModalProps> = ({
  isOpen,
  onClose,
  orientadorNome = 'Orientador Docente'
}) => {
  const [periodo, setPeriodo] = useState<'todos' | '7dias' | 'mes' | 'semestre' | 'custom'>('mes');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [selectedEstagiarioId, setSelectedEstagiarioId] = useState<string>('todos');
  const [selectedProfissionalId, setSelectedProfissionalId] = useState<string>('todos');
  const [selectedModalidade, setSelectedModalidade] = useState<string>('todas');
  const [printFeedback, setPrintFeedback] = useState<string>('');

  const agendamentos = db.getAgendamentos();
  const estagiarios = db.getEstagiarios();
  const profissionais = db.getProfissionais();

  // Filtragem dos dados
  const agendamentosFiltrados = useMemo(() => {
    const hoje = new Date();
    
    return agendamentos.filter(a => {
      // Filtro de data
      if (periodo === '7dias') {
        const d7 = new Date();
        d7.setDate(hoje.getDate() - 7);
        const dataAgend = new Date(a.data);
        if (dataAgend < d7 || dataAgend > hoje) return false;
      } else if (periodo === 'mes') {
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();
        const dataAgend = new Date(a.data);
        if (dataAgend.getMonth() !== mesAtual || dataAgend.getFullYear() !== anoAtual) return false;
      } else if (periodo === 'semestre') {
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();
        const isPrimeiroSemestre = mesAtual < 6;
        const dataAgend = new Date(a.data);
        if (dataAgend.getFullYear() !== anoAtual) return false;
        if (isPrimeiroSemestre && dataAgend.getMonth() >= 6) return false;
        if (!isPrimeiroSemestre && dataAgend.getMonth() < 6) return false;
      } else if (periodo === 'custom') {
        if (dataInicio && a.data < dataInicio) return false;
        if (dataFim && a.data > dataFim) return false;
      }

      // Filtro de estagiário
      if (selectedEstagiarioId !== 'todos') {
        if (selectedEstagiarioId === 'sem_estagiario') {
          if (a.estagiarioId) return false;
        } else {
          if (a.estagiarioId !== selectedEstagiarioId) return false;
        }
      }

      // Filtro de profissional
      if (selectedProfissionalId !== 'todos') {
        if (a.profissionalId !== selectedProfissionalId) return false;
      }

      // Filtro de modalidade
      if (selectedModalidade !== 'todas') {
        if (a.modalidade !== selectedModalidade) return false;
      }

      return true;
    });
  }, [agendamentos, periodo, dataInicio, dataFim, selectedEstagiarioId, selectedProfissionalId, selectedModalidade]);

  // Indicadores Numéricos Principais
  const totalGeral = agendamentosFiltrados.length;
  const realizados = agendamentosFiltrados.filter(a => a.status === 'concluido').length;
  const naoConfirmados = agendamentosFiltrados.filter(a => a.status === 'pendente').length;
  const perdidos = agendamentosFiltrados.filter(a => a.status === 'cancelado').length;

  const taxaConclusao = totalGeral > 0 ? Math.round((realizados / totalGeral) * 100) : 0;
  const taxaPerdidos = totalGeral > 0 ? Math.round((perdidos / totalGeral) * 100) : 0;

  // Estatísticas por Estagiário
  const estagiariosStats = useMemo(() => {
    const statsMap: Record<string, {
      id: string;
      nome: string;
      turma: string;
      total: number;
      concluidos: number;
      pendentes: number;
      cancelados: number;
    }> = {};

    estagiarios.forEach(e => {
      statsMap[e.id] = {
        id: e.id,
        nome: e.nome,
        turma: e.turma || 'Sem turma',
        total: 0,
        concluidos: 0,
        pendentes: 0,
        cancelados: 0
      };
    });

    agendamentosFiltrados.forEach(a => {
      if (a.estagiarioId && statsMap[a.estagiarioId]) {
        statsMap[a.estagiarioId].total++;
        if (a.status === 'concluido') statsMap[a.estagiarioId].concluidos++;
        if (a.status === 'pendente') statsMap[a.estagiarioId].pendentes++;
        if (a.status === 'cancelado') statsMap[a.estagiarioId].cancelados++;
      }
    });

    return Object.values(statsMap).filter(s => s.total > 0 || selectedEstagiarioId === 'todos');
  }, [estagiarios, agendamentosFiltrados, selectedEstagiarioId]);

  // Função geradora do HTML formatado oficial
  const generatePrintableHTML = () => {
    const dataEmissao = new Date().toLocaleDateString('pt-BR');
    const horaEmissao = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    let periodoDesc = 'Todo o Histórico';
    if (periodo === '7dias') periodoDesc = 'Últimos 7 Dias';
    else if (periodo === 'mes') periodoDesc = 'Mês Atual';
    else if (periodo === 'semestre') periodoDesc = 'Semestre Letivo Atual';
    else if (periodo === 'custom') periodoDesc = `De ${dataInicio || 'Início'} até ${dataFim || 'Hoje'}`;

    const estagiariosRows = estagiariosStats.map(st => {
      const taxa = st.total > 0 ? Math.round((st.concluidos / st.total) * 100) : 0;
      return `
        <tr>
          <td style="padding: 7px 10px; border-bottom: 1px solid #E5E1D8; font-weight: bold; color: #222;">${st.nome}</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #E5E1D8; color: #666;">${st.turma}</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #E5E1D8; text-align: center; font-weight: bold;">${st.total}</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #E5E1D8; text-align: center; font-weight: bold; color: #2e7d32; background-color: #f1f8e9;">${st.concluidos}</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #E5E1D8; text-align: center; font-weight: bold; color: #b58d3d; background-color: #fbf4e6;">${st.pendentes}</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #E5E1D8; text-align: center; font-weight: bold; color: #c62828; background-color: #fdf0ee;">${st.cancelados}</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #E5E1D8; text-align: right; font-weight: bold;">${taxa}%</td>
        </tr>
      `;
    }).join('');

    const agendamentosRows = agendamentosFiltrados.map(a => {
      let statusBadge = '';
      if (a.status === 'concluido') {
        statusBadge = '<span style="background-color: #f1f8e9; color: #2e7d32; border: 1px solid #c8e6c9; padding: 2px 7px; border-radius: 10px; font-weight: bold; font-size: 10px;">Realizado</span>';
      } else if (a.status === 'pendente') {
        statusBadge = '<span style="background-color: #fbf4e6; color: #b58d3d; border: 1px solid #ffe0b2; padding: 2px 7px; border-radius: 10px; font-weight: bold; font-size: 10px;">Não Confirmado</span>';
      } else {
        statusBadge = '<span style="background-color: #fdf0ee; color: #c62828; border: 1px solid #ffcdd2; padding: 2px 7px; border-radius: 10px; font-weight: bold; font-size: 10px;">Perdido / Cancelado</span>';
      }

      const dataFormatada = new Date(a.data + 'T12:00:00').toLocaleDateString('pt-BR');
      return `
        <tr>
          <td style="padding: 6px 10px; border-bottom: 1px solid #E5E1D8; white-space: nowrap; color: #333;">${dataFormatada} • ${a.horaInicio}-${a.horaFim}</td>
          <td style="padding: 6px 10px; border-bottom: 1px solid #E5E1D8; font-weight: bold; color: #111;">${a.pacienteNome}</td>
          <td style="padding: 6px 10px; border-bottom: 1px solid #E5E1D8; color: #444;">${a.profissionalNome}</td>
          <td style="padding: 6px 10px; border-bottom: 1px solid #E5E1D8; color: #033B6C; font-weight: 600;">${a.estagiarioNome || '<em style="color:#999;">Não atribuído</em>'}</td>
          <td style="padding: 6px 10px; border-bottom: 1px solid #E5E1D8; color: #666;">${a.modalidade || 'Presencial'}</td>
          <td style="padding: 6px 10px; border-bottom: 1px solid #E5E1D8; text-align: center;">${statusBadge}</td>
        </tr>
      `;
    }).join('');

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>SIACS - Relatório Oficial de Atendimentos • Faculdade Campos Salles</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 12mm 12mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #333333;
      margin: 0;
      padding: 15px;
      background-color: #FFFFFF;
      font-size: 11px;
      line-height: 1.4;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print, header, footer {
        display: none !important;
      }
    }
    .print-bar {
      background-color: #033B6C;
      color: white;
      padding: 12px 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .btn-print {
      background-color: #62A032;
      color: white;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    .kpi-card {
      border: 1px solid #E5E1D8;
      border-radius: 10px;
      padding: 10px 12px;
      background-color: #FAFAFA;
    }
    .kpi-label {
      font-size: 9.5px;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 3px;
      display: block;
    }
    .kpi-val {
      font-size: 22px;
      font-weight: 900;
    }
    .kpi-sub {
      font-size: 9.5px;
      color: #777;
    }
    .section-title {
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #033B6C;
      margin-bottom: 6px;
      border-left: 3px solid #033B6C;
      padding-left: 6px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 10.5px;
    }
    th {
      background-color: #F8F5F0;
      border-bottom: 2px solid #E5E1D8;
      padding: 7px 10px;
      text-align: left;
      font-weight: bold;
      color: #444;
      text-transform: uppercase;
      font-size: 9.5px;
    }
  </style>
</head>
<body>
  <!-- Barra de Ação Superior (Oculta na Impressão) -->
  <div class="print-bar no-print">
    <div>
      <strong style="font-size: 14px;">SIACS • Visualização de Impressão do Relatório</strong>
      <div style="font-size: 11px; opacity: 0.85; margin-top: 2px;">Clique no botão ao lado para imprimir ou salvar como PDF no seu navegador.</div>
    </div>
    <button class="btn-print" onclick="window.print();">
      🖨️ Imprimir Agora / Salvar PDF
    </button>
  </div>

  <!-- Cabeçalho Oficial Institucional -->
  <div style="border-bottom: 2px solid #033B6C; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start;">
    <div>
      <div style="font-size: 18px; font-weight: 900; color: #033B6C; letter-spacing: -0.5px;">SIACS • Faculdade Campos Salles</div>
      <div style="font-size: 13px; font-weight: 700; color: #62A032; margin-top: 2px;">Relatório Oficial de Gestão e Atendimentos Clínicos</div>
      <div style="font-size: 10px; color: #555; margin-top: 3px;">Supervisão Docente, Controle de Assiduidade e Alocação de Estágios Supervisionados</div>
    </div>
    <div style="text-align: right; font-size: 9.5px; color: #444; background: #F8F5F0; border: 1px solid #E5E1D8; padding: 6px 10px; border-radius: 8px;">
      <div><strong>Emissão:</strong> ${dataEmissao} às ${horaEmissao}</div>
      <div><strong>Emitido por:</strong> ${orientadorNome}</div>
      <div><strong>Período:</strong> ${periodoDesc}</div>
      <div><strong>Modalidade:</strong> ${selectedModalidade}</div>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card" style="background-color: #F8F5F0;">
      <span class="kpi-label" style="color: #555;">Total Atendimentos</span>
      <div class="kpi-val" style="color: #033B6C;">${totalGeral}</div>
      <span class="kpi-sub">100% da base filtrada</span>
    </div>
    <div class="kpi-card" style="background-color: #F1F8E9; border-color: #D0E3B6;">
      <span class="kpi-label" style="color: #2e7d32;">Realizados</span>
      <div class="kpi-val" style="color: #2e7d32;">${realizados}</div>
      <span class="kpi-sub" style="color: #2e7d32; font-weight: bold;">${taxaConclusao}% de conclusão</span>
    </div>
    <div class="kpi-card" style="background-color: #FBF4E6; border-color: #EED9B0;">
      <span class="kpi-label" style="color: #b58d3d;">Não Confirmados</span>
      <div class="kpi-val" style="color: #b58d3d;">${naoConfirmados}</div>
      <span class="kpi-sub" style="color: #b58d3d;">${totalGeral > 0 ? Math.round((naoConfirmados / totalGeral) * 100) : 0}% pendentes</span>
    </div>
    <div class="kpi-card" style="background-color: #FDF0EE; border-color: #F7C4BE;">
      <span class="kpi-label" style="color: #c62828;">Perdidos / Cancelados</span>
      <div class="kpi-val" style="color: #c62828;">${perdidos}</div>
      <span class="kpi-sub" style="color: #c62828;">${taxaPerdidos}% perdas</span>
    </div>
  </div>

  <div class="section-title">Desempenho & Assiduidade por Estagiário (${estagiariosStats.length})</div>
  <table>
    <thead>
      <tr>
        <th>Estagiário</th>
        <th>Turma</th>
        <th style="text-align: center;">Total</th>
        <th style="text-align: center; color: #2e7d32;">Realizados</th>
        <th style="text-align: center; color: #b58d3d;">Não Conf.</th>
        <th style="text-align: center; color: #c62828;">Perdidos</th>
        <th style="text-align: right;">Taxa Conclusão</th>
      </tr>
    </thead>
    <tbody>
      ${estagiariosRows || '<tr><td colspan="7" style="padding: 10px; text-align: center; color: #888;">Nenhum estagiário com atendimentos no período.</td></tr>'}
    </tbody>
  </table>

  <div class="section-title">Relação Detalhada de Atendimentos (${agendamentosFiltrados.length})</div>
  <table>
    <thead>
      <tr>
        <th>Data / Horário</th>
        <th>Paciente</th>
        <th>Profissional</th>
        <th>Estagiário</th>
        <th>Modalidade</th>
        <th style="text-align: center;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${agendamentosRows || '<tr><td colspan="6" style="padding: 10px; text-align: center; color: #888;">Nenhum atendimento encontrado no período filtrado.</td></tr>'}
    </tbody>
  </table>
</body>
</html>
    `;
  };

  // Método 1: Impressão direta com acionamento do navegador + fechamento automático do modal
  const handlePrint = () => {
    try {
      const html = generatePrintableHTML();
      const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
      const blobUrl = URL.createObjectURL(blob);

      // Tenta abrir janela limpa para impressão
      const printWindow = window.open(blobUrl, '_blank');
      if (printWindow) {
        setTimeout(() => {
          try {
            printWindow.focus();
            printWindow.print();
          } catch (e) {
            // Caso bloqueio de script em popup
          }
        }, 300);
      } else {
        // Se popup bloqueada, tenta window.print() direto
        window.print();
      }
    } catch (err) {
      window.print();
    }

    // Retorna diretamente para a tela do sistema fechando o modal
    onClose();
  };

  // Método 2: Abrir em Nova Aba dedicado para Visualização e Impressão
  const handleOpenInNewTab = () => {
    const html = generatePrintableHTML();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);
    const win = window.open(blobUrl, '_blank');
    if (win) {
      setPrintFeedback('✨ Documento formatado aberto com sucesso em uma nova aba!');
    } else {
      setPrintFeedback('⚠️ Permita popups neste site para abrir o relatório em nova aba.');
    }
    setTimeout(() => setPrintFeedback(''), 5000);
  };

  // Método 3: Download Direto do Relatório Formatado (HTML/PDF)
  const handleDownloadHTML = () => {
    const html = generatePrintableHTML();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-siacs-campos-salles-${new Date().toISOString().split('T')[0]}.html`;
    link.click();
    URL.revokeObjectURL(url);
    setPrintFeedback('💾 Arquivo do relatório baixado! Você pode abri-lo e imprimir (Ctrl+P) a qualquer momento.');
    setTimeout(() => setPrintFeedback(''), 6000);
  };

  // Método 4: Exportar CSV para Excel
  const handleExportCSV = () => {
    const headers = 'Data,Horário,Paciente,Profissional,Estagiário,Modalidade,Status\n';
    const rows = agendamentosFiltrados.map(a => {
      const estNome = a.estagiarioNome || 'Não atribuído';
      return `"${a.data}","${a.horaInicio}-${a.horaFim}","${a.pacienteNome}","${a.profissionalNome}","${estNome}","${a.modalidade || 'Presencial'}","${a.status}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-atendimentos-siacs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl border border-[#E5E1D8] shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 print:shadow-none print:border-none print:max-w-none print:max-h-none print:rounded-none">
        
        {/* Top Actions Bar (Hidden when printing) */}
        <div className="p-4 sm:p-5 border-b border-[#E5E1D8] bg-[#F8F5F0] flex flex-wrap items-center justify-between gap-3 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <SIACSMonogram size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base text-[#033B6C]">
                  SIACS
                </span>
                <span className="text-xs text-[#033B6C] font-extrabold hidden sm:inline">
                  • Relatório de Atendimentos & Assiduidade
                </span>
              </div>
              <p className="text-[11px] text-[#62A032] font-semibold">
                Faculdade Campos Salles • Gestão e Supervisão Clínica
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* 1. Botão Principal: Imprimir Relatório */}
            <button
              id="btn-imprimir-relatorio"
              onClick={handlePrint}
              className="px-4 py-2 bg-[#033B6C] hover:bg-[#022A4E] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              title="Disparar impressão do relatório oficial"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Relatório</span>
            </button>

            {/* 2. Botão Secundário: Abrir em Nova Aba (Garante impressão sem bloqueio de sandbox) */}
            <button
              id="btn-abrir-nova-aba"
              onClick={handleOpenInNewTab}
              className="px-3 py-2 bg-white hover:bg-[#EAE7DC] text-[#033B6C] rounded-xl border border-[#033B6C]/30 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Abrir versão de impressão em nova aba independente"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#033B6C]" />
              <span className="hidden sm:inline">Abrir em Nova Aba</span>
            </button>

            {/* 3. Baixar HTML / PDF */}
            <button
              id="btn-baixar-html"
              onClick={handleDownloadHTML}
              className="px-3 py-2 bg-white hover:bg-[#EAE7DC] text-[#434343] rounded-xl border border-[#E5E1D8] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Baixar arquivo formatado para salvar ou imprimir depois"
            >
              <FileText className="w-3.5 h-3.5 text-[#62A032]" />
              <span className="hidden md:inline">Baixar HTML</span>
            </button>

            {/* 4. Exportar CSV */}
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-white hover:bg-[#EAE7DC] text-[#434343] rounded-xl border border-[#E5E1D8] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Exportar dados em formato CSV / Excel"
            >
              <Download className="w-3.5 h-3.5 text-[#62A032]" />
              <span className="hidden lg:inline">CSV</span>
            </button>

            {/* Fechar */}
            <button
              onClick={onClose}
              className="p-2 text-[#8E8D8A] hover:text-[#434343] hover:bg-[#EAE7DC] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informative Feedback Banner */}
        {printFeedback && (
          <div className="px-4 py-2.5 bg-[#F1F8E9] border-b border-[#D0E3B6] flex items-center justify-between text-xs text-[#2e7d32] font-semibold animate-in fade-in print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2e7d32] shrink-0" />
              <span>{printFeedback}</span>
            </div>
            <button onClick={() => setPrintFeedback('')} className="text-[#2e7d32] hover:underline text-[11px] cursor-pointer">
              Dispensar
            </button>
          </div>
        )}

        {/* Filter Controls (Hidden when printing) */}
        <div className="p-4 bg-[#FDFBF7] border-b border-[#E5E1D8] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs print:hidden shrink-0">
          <div>
            <label className="block font-bold text-[#5C5C5C] mb-1">Período de Análise</label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as any)}
              className="w-full p-2 bg-white border border-[#E5E1D8] rounded-xl font-medium text-xs focus:ring-2 focus:ring-[#033B6C]"
            >
              <option value="todos">Todo o Histórico</option>
              <option value="7dias">Últimos 7 Dias</option>
              <option value="mes">Mês Atual</option>
              <option value="semestre">Semestre Letivo Atual</option>
              <option value="custom">Personalizado (Intervalo de Datas)</option>
            </select>
          </div>

          {periodo === 'custom' ? (
            <div className="flex items-center gap-2">
              <div>
                <label className="block font-bold text-[#5C5C5C] mb-1">De</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full p-2 bg-white border border-[#E5E1D8] rounded-xl font-medium text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-[#5C5C5C] mb-1">Até</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full p-2 bg-white border border-[#E5E1D8] rounded-xl font-medium text-xs"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block font-bold text-[#5C5C5C] mb-1">Filtrar Estagiário</label>
              <select
                value={selectedEstagiarioId}
                onChange={(e) => setSelectedEstagiarioId(e.target.value)}
                className="w-full p-2 bg-white border border-[#E5E1D8] rounded-xl font-medium text-xs focus:ring-2 focus:ring-[#033B6C]"
              >
                <option value="todos">Todos os Estagiários</option>
                {estagiarios.map(e => (
                  <option key={e.id} value={e.id}>{e.nome} ({e.turma})</option>
                ))}
                <option value="sem_estagiario">Sem Estagiário Atribuído</option>
              </select>
            </div>
          )}

          <div>
            <label className="block font-bold text-[#5C5C5C] mb-1">Filtrar Profissional Supervisor</label>
            <select
              value={selectedProfissionalId}
              onChange={(e) => setSelectedProfissionalId(e.target.value)}
              className="w-full p-2 bg-white border border-[#E5E1D8] rounded-xl font-medium text-xs focus:ring-2 focus:ring-[#033B6C]"
            >
              <option value="todos">Todos os Profissionais</option>
              {profissionais.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#5C5C5C] mb-1">Modalidade</label>
            <select
              value={selectedModalidade}
              onChange={(e) => setSelectedModalidade(e.target.value)}
              className="w-full p-2 bg-white border border-[#E5E1D8] rounded-xl font-medium text-xs focus:ring-2 focus:ring-[#033B6C]"
            >
              <option value="todas">Todas as Modalidades</option>
              <option value="Presencial">Apenas Presencial</option>
              <option value="Online">Apenas Online</option>
            </select>
          </div>
        </div>

        {/* Printable Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 print:p-0 print:overflow-visible text-[#434343]">
          
          {/* Institutional Report Header */}
          <div className="border-b-2 border-[#033B6C] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SIACSMonogram size="md" />
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#033B6C] tracking-tight">
                  SIACS • Faculdade Campos Salles
                </h3>
                <p className="text-xs sm:text-sm font-bold text-[#62A032]">
                  Relatório Oficial de Gestão e Atendimentos Clínicos
                </p>
                <p className="text-[11px] text-[#8E8D8A]">
                  Supervisão Docente, Controle de Assiduidade e Alocação de Estágios
                </p>
              </div>
            </div>

            <div className="bg-[#F8F5F0] border border-[#E5E1D8] p-3 rounded-xl text-right text-xs space-y-0.5 self-start md:self-auto">
              <p><strong className="text-[#434343]">Emitido por:</strong> <span className="text-[#033B6C] font-semibold">{orientadorNome}</span></p>
              <p><strong className="text-[#434343]">Data de Emissão:</strong> {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
              <p><strong className="text-[#434343]">Período:</strong> {periodo === 'todos' ? 'Todo o Histórico' : periodo === '7dias' ? 'Últimos 7 Dias' : periodo === 'mes' ? 'Mês Atual' : periodo === 'semestre' ? 'Semestre Letivo Atual' : `${dataInicio || 'Início'} até ${dataFim || 'Hoje'}`}</p>
              <p><strong className="text-[#434343]">Modalidade:</strong> {selectedModalidade}</p>
            </div>
          </div>

          {/* KPI CARDS (Indicadores Chave) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div className="bg-[#F8F5F0] p-4 rounded-2xl border border-[#E5E1D8] space-y-1">
              <span className="text-[11px] font-bold text-[#5C5C5C] uppercase tracking-wider block">
                Total de Atendimentos
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-[#033B6C]">{totalGeral}</span>
                <span className="text-xs font-semibold text-[#8E8D8A]">100% da base</span>
              </div>
            </div>

            {/* 1. Atendimentos Realizados */}
            <div className="bg-[#F1F8E9] p-4 rounded-2xl border border-[#D0E3B6] space-y-1">
              <span className="text-[11px] font-bold text-[#2e7d32] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2e7d32]" />
                Realizados (Concluídos)
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-[#2e7d32]">{realizados}</span>
                <span className="text-xs font-bold text-[#2e7d32]">{taxaConclusao}% do total</span>
              </div>
            </div>

            {/* 2. Atendimentos Não Confirmados */}
            <div className="bg-[#FBF4E6] p-4 rounded-2xl border border-[#EED9B0] space-y-1">
              <span className="text-[11px] font-bold text-[#b58d3d] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#b58d3d]" />
                Não Confirmados (Pendentes)
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-[#b58d3d]">{naoConfirmados}</span>
                <span className="text-xs font-bold text-[#b58d3d]">
                  {totalGeral > 0 ? Math.round((naoConfirmados / totalGeral) * 100) : 0}% do total
                </span>
              </div>
            </div>

            {/* 3. Atendimentos Perdidos / Cancelados */}
            <div className="bg-[#FDF0EE] p-4 rounded-2xl border border-[#F7C4BE] space-y-1">
              <span className="text-[11px] font-bold text-[#c62828] uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-[#c62828]" />
                Perdidos / Cancelados / Faltas
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-[#c62828]">{perdidos}</span>
                <span className="text-xs font-bold text-[#c62828]">{taxaPerdidos}% do total</span>
              </div>
            </div>
          </div>

          {/* Resumo por Estagiário */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#033B6C] flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#033B6C]" />
                Desempenho & Assiduidade por Estagiário
              </h2>
              <span className="text-xs text-[#8E8D8A]">
                {estagiariosStats.length} estagiário(s) analisado(s)
              </span>
            </div>

            <div className="border border-[#E5E1D8] rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8F5F0] border-b border-[#E5E1D8] text-[#5C5C5C] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Estagiário</th>
                    <th className="p-3">Turma</th>
                    <th className="p-3 text-center">Total</th>
                    <th className="p-3 text-center text-[#2e7d32]">Realizados</th>
                    <th className="p-3 text-center text-[#b58d3d]">Não Confirmados</th>
                    <th className="p-3 text-center text-[#c62828]">Perdidos</th>
                    <th className="p-3 text-right">Taxa de Conclusão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E1D8]">
                  {estagiariosStats.map((st, i) => {
                    const taxaEst = st.total > 0 ? Math.round((st.concluidos / st.total) * 100) : 0;
                    return (
                      <tr key={i} className="hover:bg-[#FDFBF7] transition-colors">
                        <td className="p-3 font-bold text-[#434343]">{st.nome}</td>
                        <td className="p-3 text-[#8E8D8A]">{st.turma}</td>
                        <td className="p-3 text-center font-bold">{st.total}</td>
                        <td className="p-3 text-center font-bold text-[#2e7d32] bg-[#F1F8E9]/50">{st.concluidos}</td>
                        <td className="p-3 text-center font-bold text-[#b58d3d] bg-[#FBF4E6]/50">{st.pendentes}</td>
                        <td className="p-3 text-center font-bold text-[#c62828] bg-[#FDF0EE]/50">{st.cancelados}</td>
                        <td className="p-3 text-right font-bold">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                            taxaEst >= 80 ? 'bg-[#F1F8E9] text-[#2e7d32]' : taxaEst >= 50 ? 'bg-[#FBF4E6] text-[#b58d3d]' : 'bg-[#FDF0EE] text-[#c62828]'
                          }`}>
                            {taxaEst}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {estagiariosStats.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-[#8E8D8A]">
                        Nenhum atendimento registrado no período selecionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabela Detalhada de Atendimentos */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#033B6C] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#033B6C]" />
              Relação Detalhada de Atendimentos ({agendamentosFiltrados.length})
            </h2>

            <div className="border border-[#E5E1D8] rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8F5F0] border-b border-[#E5E1D8] text-[#5C5C5C] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Data / Hora</th>
                    <th className="p-3">Paciente</th>
                    <th className="p-3">Profissional</th>
                    <th className="p-3">Estagiário</th>
                    <th className="p-3">Modalidade</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E1D8]">
                  {agendamentosFiltrados.map((a) => (
                    <tr key={a.id} className="hover:bg-[#FDFBF7] transition-colors">
                      <td className="p-3 font-semibold whitespace-nowrap text-[#434343]">
                        {new Date(a.data + 'T12:00:00').toLocaleDateString('pt-BR')} • {a.horaInicio}-{a.horaFim}
                      </td>
                      <td className="p-3 font-bold text-[#434343]">{a.pacienteNome}</td>
                      <td className="p-3 text-[#5C5C5C]">{a.profissionalNome}</td>
                      <td className="p-3 text-[#5C5C5C]">
                        {a.estagiarioNome ? (
                          <span className="font-semibold text-[#033B6C]">{a.estagiarioNome}</span>
                        ) : (
                          <span className="text-[#8E8D8A] italic">Não atribuído</span>
                        )}
                      </td>
                      <td className="p-3 text-[#8E8D8A]">{a.modalidade || 'Presencial'}</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        {a.status === 'concluido' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F1F8E9] text-[#2e7d32] border border-[#D0E3B6]">
                            Realizado
                          </span>
                        )}
                        {a.status === 'pendente' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FBF4E6] text-[#b58d3d] border border-[#EED9B0]">
                            Não Confirmado
                          </span>
                        )}
                        {a.status === 'cancelado' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FDF0EE] text-[#c62828] border border-[#F7C4BE]">
                            Perdido / Cancelado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {agendamentosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-[#8E8D8A]">
                        Nenhum atendimento corresponde aos filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
