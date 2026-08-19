import { AnamnesePsicologiaCompleta } from '../../types';

// Gerador de SVG oficial idêntico ao da tela de login
export const getSIACSVectorLogoSVG = () => `
  <svg viewBox="0 0 320 320" width="50" height="50" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block; flex-shrink:0;">
    <defs>
      <linearGradient id="siacsBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0B5C98" />
        <stop offset="50%" stop-color="#033B6C" />
        <stop offset="100%" stop-color="#012448" />
      </linearGradient>
      <linearGradient id="siacsGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#81BF48" />
        <stop offset="50%" stop-color="#62A032" />
        <stop offset="100%" stop-color="#4A8022" />
      </linearGradient>
    </defs>
    <!-- Seta Curva Azul Inferior -->
    <path d="M 68 180 C 52 145 56 100 84 66 C 104 42 135 28 165 25" stroke="url(#siacsBlueGrad)" stroke-width="16" stroke-linecap="round" fill="none" />
    <path d="M 52 200 C 44 175 48 140 64 112" stroke="url(#siacsBlueGrad)" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.8" />
    <!-- Seta Dupla Verde Superior -->
    <path d="M 50 170 C 48 115 85 65 140 45" stroke="url(#siacsGreenGrad)" stroke-width="18" stroke-linecap="round" fill="none" />
    <polygon points="148,32 170,54 136,62" fill="url(#siacsGreenGrad)" />
    <!-- Relógio Central -->
    <circle cx="170" cy="140" r="86" stroke="url(#siacsBlueGrad)" stroke-width="16" fill="#FFFFFF" />
    <line x1="170" y1="62" x2="170" y2="76" stroke="#033B6C" stroke-width="6" stroke-linecap="round" />
    <line x1="248" y1="140" x2="234" y2="140" stroke="#033B6C" stroke-width="6" stroke-linecap="round" />
    <line x1="170" y1="218" x2="170" y2="204" stroke="#033B6C" stroke-width="6" stroke-linecap="round" />
    <line x1="92" y1="140" x2="106" y2="140" stroke="#033B6C" stroke-width="6" stroke-linecap="round" />
    <line x1="170" y1="140" x2="135" y2="105" stroke="#033B6C" stroke-width="8" stroke-linecap="round" />
    <line x1="170" y1="140" x2="218" y2="92" stroke="#033B6C" stroke-width="8" stroke-linecap="round" />
    <circle cx="170" cy="140" r="7" fill="#E5A823" stroke="#033B6C" stroke-width="3" />
    <!-- Checkmark -->
    <path d="M 215 95 L 235 115 L 285 62" stroke="#033B6C" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <!-- Livro -->
    <g transform="translate(108, 172)">
      <path d="M 28 28 C 18 24 6 25 0 28 L 0 4 C 8 2 20 2 28 8 C 36 2 48 2 56 4 L 56 28 C 50 25 38 24 28 28 Z" fill="#033B6C" />
      <path d="M 26 24 C 18 21 8 22 3 24 L 3 7 C 9 5 19 5 26 10 Z" fill="#FFFFFF" />
      <path d="M 30 24 C 38 21 48 22 53 24 L 53 7 C 47 5 37 5 30 10 Z" fill="#FFFFFF" />
    </g>
    <!-- 'S' Fita Verde/Azul -->
    <path d="M 248 185 C 275 198 285 225 272 250 C 255 280 205 282 170 280" stroke="url(#siacsGreenGrad)" stroke-width="24" stroke-linecap="round" fill="none" />
    <path d="M 250 215 C 220 220 188 230 178 255 C 168 278 195 295 230 295 C 255 295 268 285 272 268" stroke="url(#siacsBlueGrad)" stroke-width="18" stroke-linecap="round" fill="none" />
    <polygon points="160,280 190,260 185,298" fill="url(#siacsBlueGrad)" />
  </svg>
`;

export const renderBlankLine = (minWidth = '100%') => `
  <div style="border-bottom: 1.5px solid #718096; min-height: 20px; width: ${minWidth}; margin-top: 2px;"></div>
`;

export const renderRuledLines = (count = 2) => {
  let lines = '';
  for (let i = 0; i < count; i++) {
    lines += `<div style="border-bottom: 1px dashed #CBD5E0; height: 22px; width: 100%;"></div>`;
  }
  return `<div style="margin-top: 2px; padding: 1px 0;">${lines}</div>`;
};

export const dinamicaVidaConfig = [
  {
    key: 'gestacaoNascimento',
    titulo: '1. Gestação e Nascimento',
    pergunta: 'Condições da gestação, parto, marcos iniciais e acolhimento neonatal.',
  },
  {
    key: 'comunicacaoEmocional',
    titulo: '2. Comunicação Emocional',
    pergunta: 'A criança foi atendida em suas necessidades emocionais? Padrão de vínculo e resposta afetiva dos cuidadores.',
  },
  {
    key: 'atividadeObjetalManipulatoria',
    titulo: '3. Atividade Objetal Manipulatória',
    pergunta: 'Como foi a experiência de explorar o meio e manipular seus objetos? Estímulos materiais e curiosidade.',
  },
  {
    key: 'desenvolvimentoLinguagem',
    titulo: '4. Desenvolvimento da Linguagem',
    pergunta: 'Como foi para começar a nomear o mundo, expressar desejos e articular o pensamento verbal?',
  },
  {
    key: 'jogoPapeisBrincar',
    titulo: '5. Jogo de Papéis / Brincar',
    pergunta: 'Como se caracterizava o brincar? Que papéis assumia nas brincadeiras simbólicas e regras coletivas?',
  },
  {
    key: 'relacoesFamiliaresVida',
    titulo: '6. Relações Familiares',
    pergunta: 'Pessoas próximas, pessoas distantes, figuras de identificação e clima afetivo no lar.',
  },
  {
    key: 'socializacao',
    titulo: '7. Socialização',
    pergunta: 'Houve interesse na busca por interações com pares? Como estas se davam na infância e adolescência?',
  },
  {
    key: 'atividadeEstudo',
    titulo: '8. Atividade de Estudo',
    pergunta: 'Como se deu o processo de escolarização? Que sentido tiveram os estudos e a relação com o saber?',
  },
  {
    key: 'relacoesAfetivasVida',
    titulo: '9. Relações Afetivas',
    pergunta: 'Preferências e identificações nas figuras íntimas; histórico de parcerias e vínculos de confiança.',
  },
  {
    key: 'sexualidade',
    titulo: '10. Sexualidade',
    pergunta: 'Experiências sexuais significativas, descobertas, orientações e significados atribuídos ao corpo e ao desejo.',
  },
  {
    key: 'insercaoTrabalho',
    titulo: '11. Inserção no Contexto de Trabalho',
    pergunta: 'Como se deu a escolha profissional? Sentidos sobre o trabalho, realização e sobrevivência.',
  },
];

export const generateStandaloneHTML = (formData: Partial<AnamnesePsicologiaCompleta>, isBlank: boolean, includeTopBar = true): string => {
  const dataEmissao = new Date().toLocaleDateString('pt-BR');
  const horaEmissao = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const renderDinamicaRows = () => {
    return dinamicaVidaConfig.map((item) => {
      const resp = (formData as any)[item.key] || '';
      const med = (formData as any)[`${item.key}Mediadores`] || '';
      const pers = (formData as any)[`${item.key}Personalidade`] || '';

      return `
        <tr>
          <td style="padding: 6px 8px; border: 1px solid #CBD5E0; vertical-align: top; width: 38%;">
            <div style="font-weight: 800; color: #033B6C; font-size: 9.5px; margin-bottom: 2px;">${item.titulo}</div>
            <div style="font-size: 8.5px; color: #4A5568; line-height: 1.25; margin-bottom: 4px;">${item.pergunta}</div>
            ${isBlank ? renderRuledLines(2) : `<div style="font-size: 9.5px; color: #1A202C; background: #F8F5F0; padding: 4px 6px; border-radius: 4px; border: 1px solid #E2E8F0; min-height: 24px;">${resp || '—'}</div>`}
          </td>
          <td style="padding: 6px 8px; border: 1px solid #CBD5E0; vertical-align: top; width: 31%;">
            <div style="font-size: 8px; font-weight: bold; color: #62A032; text-transform: uppercase; margin-bottom: 2px;">Mediadores (Pessoas, instituições, instrumentos, símbolos)</div>
            ${isBlank ? renderRuledLines(2) : `<div style="font-size: 9.5px; color: #1A202C; background: #F8F5F0; padding: 4px 6px; border-radius: 4px; border: 1px solid #E2E8F0; min-height: 24px;">${med || '—'}</div>`}
          </td>
          <td style="padding: 6px 8px; border: 1px solid #CBD5E0; vertical-align: top; width: 31%;">
            <div style="font-size: 8px; font-weight: bold; color: #033B6C; text-transform: uppercase; margin-bottom: 2px;">O que ajudou na composição da personalidade?</div>
            ${isBlank ? renderRuledLines(2) : `<div style="font-size: 9.5px; color: #1A202C; background: #F8F5F0; padding: 4px 6px; border-radius: 4px; border: 1px solid #E2E8F0; min-height: 24px;">${pers || '—'}</div>`}
          </td>
        </tr>
      `;
    }).join('');
  };

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Anamnese Psicológica - ${isBlank ? 'Ficha em Branco' : (formData.pacienteNome || 'Paciente')} - SIACS</title>
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
      font-size: 10px;
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
      font-size: 13px;
      font-weight: 900;
      color: #033B6C;
      margin: 0 0 2px 0;
    }
    .header-title-box p {
      font-size: 9.5px;
      color: #4A5568;
      margin: 0;
    }
    .header-meta {
      text-align: right;
      font-size: 9.5px;
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
      font-size: 12px;
      font-weight: 900;
      color: #033B6C;
      margin: 0 0 2px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-badge p {
      font-size: 9px;
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
      font-size: 9.5px;
      padding: 4px 8px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      display: flex;
      justify-content: space-between;
    }
    .section-body {
      padding: 6px 8px;
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
      gap: 6px 10px;
    }
    .field-item {
      margin-bottom: 4px;
    }
    .field-label {
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
      color: #2D3748;
      margin-bottom: 1px;
      display: block;
    }
    .field-value {
      font-size: 9.5px;
      color: #1A202C;
      background: #F8F5F0;
      border: 1px solid #CBD5E0;
      border-radius: 4px;
      padding: 3px 6px;
      min-height: 16px;
    }
    .text-block {
      min-height: 28px;
      line-height: 1.3;
      white-space: pre-line;
    }
    .check-option {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      margin-right: 10px;
      font-size: 9px;
      color: #2D3748;
    }
    .check-box {
      display: inline-block;
      width: 10px;
      height: 10px;
      border: 1.5px solid #2D3748;
      border-radius: 2px;
      vertical-align: middle;
    }
    .table-dinamica {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
      margin-top: 2px;
    }
    .sign-section {
      margin-top: 10px;
      padding-top: 6px;
      border-top: 2px solid #033B6C;
      page-break-inside: avoid;
    }
    .sign-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      text-align: center;
      margin-top: 14px;
    }
    .sign-line {
      border-top: 1.5px solid #2D3748;
      margin: 0 6px 3px 6px;
    }
    .sign-title {
      font-weight: bold;
      font-size: 9.5px;
      color: #1A202C;
    }
    .sign-sub {
      font-size: 8.5px;
      color: #4A5568;
    }
    .footer-note {
      font-size: 8px;
      color: #718096;
      text-align: center;
      margin-top: 8px;
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
    <div class="top-action-bar no-print">
      <div style="font-weight: bold; font-size: 13px;">
        SIACS • ${isBlank ? 'FICHA EM BRANCO PARA PREENCHIMENTO CLÍNICO' : 'PRONTUÁRIO DE ANAMNESE'}
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
          <span style="font-size: 17px; font-weight: 900; color: #033B6C;">SIACS</span>
          <span style="font-size: 9px; font-weight: bold; background: #F1F8E9; color: #62A032; border: 1px solid #D0E3B6; padding: 1px 5px; border-radius: 4px;">Clínica Escola de Psicologia</span>
        </div>
        <h1 style="font-size: 12px; margin: 2px 0 0 0; color: #1A202C;">Faculdade Integradas Campos Salles</h1>
        <p style="font-size: 9px; color: #62A032; font-weight: 600;">Sistema Integrado de Agendamento Campos Salles • Eficiência e Organização</p>
      </div>
    </div>
    <div class="header-meta">
      <strong>PRONTUÁRIO:</strong> ${isBlank ? '___________________' : (formData.numeroProntuario || 'PSI-2026/0000')}<br/>
      <strong>Data:</strong> ${isBlank ? '____/____/________' : (formData.dataAvaliacao ? new Date(formData.dataAvaliacao + 'T12:00:00Z').toLocaleDateString('pt-BR') : dataEmissao)}<br/>
      <span style="color: #718096; font-size: 7.5px;">Documento Confidencial • Resolução CFP</span>
    </div>
  </div>

  <!-- TÍTULO -->
  <div class="doc-badge">
    <h2>Ficha de Anamnese e Avaliação Psicológica Completa</h2>
    <p>${isBlank ? 'Instrumento para acolhimento inicial, entrevista clínica e exame psíquico manual' : 'Documento Técnico de Acolhimento, História Clínica, Exame Mental e Planejamento Terapêutico'}</p>
  </div>

  <!-- 1. IDENTIFICAÇÃO DO PACIENTE & DADOS SOCIODEMOGRÁFICOS -->
  <div class="section-box">
    <div class="section-header">
      <span>1. Identificação do Paciente & Dados Sociodemográficos</span>
      <span>${isBlank ? 'Modalidade: ( ) Presencial  ( ) Online' : (formData.modalidadeAtendimento || 'Presencial')}</span>
    </div>
    <div class="section-body">
      <div class="grid-3" style="margin-bottom: 4px;">
        <div class="field-item" style="grid-column: span 2;">
          <span class="field-label">Nome Completo do Paciente</span>
          ${isBlank ? renderBlankLine() : `<div class="field-value">${formData.pacienteNome || '—'}</div>`}
        </div>
        <div class="field-item">
          <span class="field-label">Data de Nascimento / Idade</span>
          ${isBlank ? renderBlankLine() : `<div class="field-value">${formData.dataNascimento ? new Date(formData.dataNascimento + 'T12:00:00Z').toLocaleDateString('pt-BR') : ''} ${formData.idade ? `(${formData.idade} anos)` : '—'}</div>`}
        </div>
      </div>

      <div class="grid-4" style="margin-bottom: 4px;">
        <div class="field-item">
          <span class="field-label">Gênero / Identidade</span>
          ${isBlank ? '<div style="margin-top: 3px;"><span class="check-option"><span class="check-box"></span> F</span> <span class="check-option"><span class="check-box"></span> M</span> <span class="check-option"><span class="check-box"></span> Outro</span></div>' : `<div class="field-value">${formData.genero || '—'}</div>`}
        </div>
        <div class="field-item">
          <span class="field-label">Estado Civil</span>
          ${isBlank ? renderBlankLine() : `<div class="field-value">${formData.estadoCivil || '—'}</div>`}
        </div>
        <div class="field-item">
          <span class="field-label">Raça / Cor / Etnia</span>
          ${isBlank ? '<div style="margin-top: 3px;"><span class="check-option"><span class="check-box"></span> Branca</span> <span class="check-option"><span class="check-box"></span> Preta</span> <span class="check-option"><span class="check-box"></span> Parda</span> <span class="check-option"><span class="check-box"></span> Outra</span></div>' : `<div class="field-value">${formData.raca || '—'}</div>`}
        </div>
        <div class="field-item">
          <span class="field-label">Escolaridade</span>
          ${isBlank ? renderBlankLine() : `<div class="field-value">${formData.escolaridade || '—'}</div>`}
        </div>
      </div>

      <div class="grid-2" style="margin-bottom: 4px;">
        <div class="field-item">
          <span class="field-label">Profissão / Atividade de Trabalho que Desempenha</span>
          ${isBlank ? renderBlankLine() : `<div class="field-value">${formData.profissao || ''} ${formData.atividadeTrabalho ? `— ${formData.atividadeTrabalho}` : ''}</div>`}
        </div>
        <div class="field-item">
          <span class="field-label">Contato de uma Pessoa de Confiança / Emergência</span>
          ${isBlank ? renderBlankLine() : `<div class="field-value">${formData.contatoPessoaConfianca || formData.contatoEmergenciaNome || '—'} ${formData.contatoEmergenciaTelefone ? `(${formData.contatoEmergenciaTelefone})` : ''}</div>`}
        </div>
      </div>

      <div class="grid-3" style="margin-bottom: 4px;">
        <div class="field-item">
          <span class="field-label">Telefone / WhatsApp</span>
          ${isBlank ? renderBlankLine() : `<div class="field-value">${formData.telefone || '—'}</div>`}
        </div>
        <div class="field-item">
          <span class="field-label">E-mail</span>
          ${isBlank ? renderBlankLine() : `<div class="field-value">${formData.email || '—'}</div>`}
        </div>
        <div class="field-item">
          <span class="field-label">Naturalidade / Religião</span>
          ${isBlank ? renderBlankLine() : `<div class="field-value">${formData.naturalidade || '—'} ${formData.religiao ? `(${formData.religiao})` : ''}</div>`}
        </div>
      </div>

      <div class="field-item">
        <span class="field-label">Endereço Residencial Completo</span>
        ${isBlank ? renderBlankLine() : `<div class="field-value">${formData.endereco || '—'}</div>`}
      </div>
    </div>
  </div>

  <!-- 2. CORPO CLÍNICO RESPONSÁVEL -->
  <div class="section-box">
    <div class="section-header">
      <span>2. Equipe Clínica Responsável pelo Atendimento</span>
    </div>
    <div class="section-body grid-3">
      <div class="field-item">
        <span class="field-label">Profissional Responsável (Psicólogo)</span>
        ${isBlank ? renderBlankLine() : `<div class="field-value">${formData.profissionalResponsavel || '—'} ${formData.crpProfissional ? `(CRP: ${formData.crpProfissional})` : ''}</div>`}
      </div>
      <div class="field-item">
        <span class="field-label">Estagiário(a) Clínico(a) (Acadêmico)</span>
        ${isBlank ? renderBlankLine() : `<div class="field-value">${formData.estagiarioNome || '—'} ${formData.raEstagiario ? `(RA: ${formData.raEstagiario})` : ''}</div>`}
      </div>
      <div class="field-item">
        <span class="field-label">Orientador(a) / Docente Supervisor</span>
        ${isBlank ? renderBlankLine() : `<div class="field-value">${formData.orientadorNome || '—'} ${formData.crpOrientador ? `(CRP: ${formData.crpOrientador})` : ''}</div>`}
      </div>
    </div>
  </div>

  <!-- 3. DADOS DA QUEIXA, HISTÓRICO ATUAL & IMPACTO -->
  <div class="section-box">
    <div class="section-header">
      <span>3. Demanda, Queixa Principal & Histórico Atual</span>
    </div>
    <div class="section-body">
      <div class="grid-2" style="margin-bottom: 4px;">
        <div class="field-item">
          <span class="field-label">Tempo de Evolução dos Sintomas</span>
          ${isBlank ? renderBlankLine() : `<div class="field-value">${formData.tempoEvolucao || '—'}</div>`}
        </div>
        <div class="field-item">
          <span class="field-label">Origem do Encaminhamento / Busca</span>
          ${isBlank ? renderBlankLine() : `<div class="field-value">${formData.encaminhamentoOrigem || '—'}</div>`}
        </div>
      </div>

      <div class="field-item" style="margin-bottom: 4px;">
        <span class="field-label">Queixa Inicial / Queixa Principal (Palavras do Paciente / Demanda Manifesta)</span>
        ${isBlank ? renderRuledLines(2) : `<div class="field-value text-block">${formData.queixaInicial || formData.queixaPrincipal || '—'}</div>`}
      </div>

      <div class="field-item" style="margin-bottom: 4px;">
        <span class="field-label">Elementos Complementares da Queixa</span>
        ${isBlank ? renderRuledLines(2) : `<div class="field-value text-block">${formData.elementosComplementares || '—'}</div>`}
      </div>

      <div class="field-item" style="margin-bottom: 4px;">
        <span class="field-label">Histórico da Queixa Atual & Fatores Desencadeantes</span>
        ${isBlank ? renderRuledLines(2) : `<div class="field-value text-block">${formData.historicoQueixaAtual || formData.fatoresDesencadeantes || '—'}</div>`}
      </div>

      <div class="field-item">
        <span class="field-label">Impacto na Rotina, Sono, Alimentação e Relações Interpessoais</span>
        ${isBlank ? renderRuledLines(2) : `<div class="field-value text-block">${formData.impactoRotinaRelacoes || '—'}</div>`}
      </div>
    </div>
  </div>

  <!-- 4. PECULIARIDADES HEREDITÁRIAS & HISTÓRICO FAMILIAR -->
  <div class="section-box">
    <div class="section-header">
      <span>4. Peculiaridades Hereditárias & Histórico Familiar</span>
    </div>
    <div class="section-body">
      <div class="grid-2" style="margin-bottom: 4px;">
        <div class="field-item">
          <span class="field-label">Principais características físico-biológicas da família (caráter, estrutura)</span>
          ${isBlank ? renderRuledLines(2) : `<div class="field-value text-block">${formData.caracteristicasFisicoBiologicas || '—'}</div>`}
        </div>
        <div class="field-item">
          <span class="field-label">O que ajudou na composição da personalidade?</span>
          ${isBlank ? renderRuledLines(2) : `<div class="field-value text-block">${formData.caracteristicasFisicoBiologicasPersonalidade || '—'}</div>`}
        </div>
      </div>

      <div class="grid-2" style="margin-bottom: 4px;">
        <div class="field-item">
          <span class="field-label">Histórico de doenças (incluindo adoecimento mental) dos familiares</span>
          ${isBlank ? renderRuledLines(2) : `<div class="field-value text-block">${formData.historicoDoencasFamiliares || formData.historicoFamiliarPsiquiatrico || '—'}</div>`}
        </div>
        <div class="field-item">
          <span class="field-label">O que ajudou na composição da personalidade?</span>
          ${isBlank ? renderRuledLines(2) : `<div class="field-value text-block">${formData.historicoDoencasFamiliaresPersonalidade || '—'}</div>`}
        </div>
      </div>

      <div class="grid-2">
        <div class="field-item">
          <span class="field-label">Composição e Relações Familiares</span>
          ${isBlank ? renderRuledLines(2) : `<div class="field-value text-block">${formData.composicaoFamiliar || formData.relacionamentoFamiliar || '—'}</div>`}
        </div>
        <div class="field-item">
          <span class="field-label">Tratamentos Psicológicos Anteriores & Medicamentos em Uso</span>
          ${isBlank ? renderRuledLines(2) : `<div class="field-value text-block">${formData.tratamentosPsicologicosAnteriores || ''} ${formData.medicamentosUsoContinuo ? `| Medicamentos: ${formData.medicamentosUsoContinuo}` : ''} ${formData.psicofarmacosPosologia ? `(${formData.psicofarmacosPosologia})` : ''}</div>`}
        </div>
      </div>
    </div>
  </div>

  <!-- 5. DINÂMICA DA VIDA (DESENVOLVIMENTO AO LONGO DO CICLO VITAL) -->
  <div class="section-box" style="page-break-before: auto;">
    <div class="section-header">
      <span>5. Dinâmica da Vida (Desenvolvimento ao Longo do Ciclo Vital)</span>
      <span style="font-size: 8.5px; opacity: 0.9;">Perspectiva Histórico-Cultural & Mediadores</span>
    </div>
    <div class="section-body" style="padding: 4px;">
      <table class="table-dinamica">
        <thead>
          <tr style="background: #F8F5F0; border-bottom: 2px solid #033B6C;">
            <th style="padding: 4px 6px; text-align: left; font-weight: 800; color: #033B6C; border: 1px solid #CBD5E0; width: 38%;">ASPECTO / ETAPA DA VIDA</th>
            <th style="padding: 4px 6px; text-align: left; font-weight: 800; color: #62A032; border: 1px solid #CBD5E0; width: 31%;">MEDIADORES</th>
            <th style="padding: 4px 6px; text-align: left; font-weight: 800; color: #033B6C; border: 1px solid #CBD5E0; width: 31%;">COMPOSIÇÃO DA PERSONALIDADE</th>
          </tr>
        </thead>
        <tbody>
          ${renderDinamicaRows()}
        </tbody>
      </table>
    </div>
  </div>

  <!-- 6. CENÁRIO DE VIDA ATUAL -->
  <div class="section-box">
    <div class="section-header">
      <span>6. Cenário de Vida Atual</span>
    </div>
    <div class="section-body">
      <div class="grid-2" style="margin-bottom: 4px;">
        <div class="field-item">
          <span class="field-label">Pessoas Mais Significativas no Momento</span>
          ${isBlank ? renderRuledLines(2) : `<div class="field-value text-block">${formData.cenarioPessoasSignificativas || '—'}</div>`}
        </div>
        <div class="field-item">
          <span class="field-label">O que ajudou na composição da personalidade?</span>
          ${isBlank ? renderRuledLines(2) : `<div class="field-value text-block">${formData.cenarioPessoasSignificativasPersonalidade || '—'}</div>`}
        </div>
      </div>

      <div class="grid-2" style="margin-bottom: 4px;">
        <div class="field-item">
          <span class="field-label">Atividades Mais Presentes no Cotidiano</span>
          ${isBlank ? renderRuledLines(2) : `<div class="field-value text-block">${formData.cenarioAtividadesPresentes || '—'}</div>`}
        </div>
        <div class="field-item">
          <span class="field-label">O que ajudou na composição da personalidade?</span>
          ${isBlank ? renderRuledLines(2) : `<div class="field-value text-block">${formData.cenarioAtividadesPresentesPersonalidade || '—'}</div>`}
        </div>
      </div>

      <div class="grid-2">
        <div class="field-item">
          <span class="field-label">Contextos em que Mais Circula</span>
          ${isBlank ? renderRuledLines(2) : `<div class="field-value text-block">${formData.cenarioContextosCirculacao || '—'}</div>`}
        </div>
        <div class="field-item">
          <span class="field-label">O que ajudou na composição da personalidade?</span>
          ${isBlank ? renderRuledLines(2) : `<div class="field-value text-block">${formData.cenarioContextosCirculacaoPersonalidade || '—'}</div>`}
        </div>
      </div>
    </div>
  </div>

  <!-- 7. SINTOMATOLOGIA DO DESENVOLVIMENTO -->
  <div class="section-box">
    <div class="section-header">
      <span>7. Sintomatologia do Desenvolvimento</span>
    </div>
    <div class="section-body">
      <div class="field-item" style="margin-bottom: 4px;">
        <span class="field-label">Nível do Desenvolvimento que Alcançou a Pessoa no Momento Presente</span>
        ${isBlank ? renderRuledLines(2) : `<div class="field-value text-block">${formData.nivelDesenvolvimentoPresente || '—'}</div>`}
      </div>
      <div class="field-item" style="margin-bottom: 4px;">
        <span class="field-label">Características do Desenvolvimento no Momento Presente</span>
        ${isBlank ? renderRuledLines(2) : `<div class="field-value text-block">${formData.caracteristicasDesenvolvimentoPresente || '—'}</div>`}
      </div>
      <div class="field-item">
        <span class="field-label">Possibilidades de Desenvolvimento (Potencialidades / ZPD)</span>
        ${isBlank ? renderRuledLines(2) : `<div class="field-value text-block">${formData.possibilidadesDesenvolvimento || '—'}</div>`}
      </div>
    </div>
  </div>

  <!-- 8. EXAME DAS FUNÇÕES PSÍQUICAS (SÚMULA PSICOPATOLÓGICA) -->
  <div class="section-box">
    <div class="section-header">
      <span>8. Exame das Funções Psíquicas (Súmula Psicopatológica)</span>
    </div>
    <div class="section-body grid-2">
      <div class="field-item">
        <span class="field-label">Aparência Geral, Postura & Atitude</span>
        ${isBlank ? renderBlankLine() : `<div class="field-value">${formData.aparenciaAtitude || '—'}</div>`}
      </div>
      <div class="field-item">
        <span class="field-label">Consciência, Atenção e Orientação</span>
        ${isBlank ? '<div style="margin-top: 3px;"><span class="check-option"><span class="check-box"></span> Lúcido / Vigil</span> <span class="check-option"><span class="check-box"></span> Orientado Têmporo-Espacialmente</span> <span class="check-option"><span class="check-box"></span> Desorientado</span></div>' : `<div class="field-value">${formData.conscienciaOrientacao || formData.atencaoMemoria || '—'}</div>`}
      </div>
      <div class="field-item">
        <span class="field-label">Humor, Afeto e Expressão Afetiva</span>
        ${isBlank ? '<div style="margin-top: 3px;"><span class="check-option"><span class="check-box"></span> Normotímico</span> <span class="check-option"><span class="check-box"></span> Ansioso</span> <span class="check-option"><span class="check-box"></span> Hipotímico</span> <span class="check-option"><span class="check-box"></span> Congruente</span></div>' : `<div class="field-value">${formData.humorAfeto || '—'}</div>`}
      </div>
      <div class="field-item">
        <span class="field-label">Curso e Conteúdo do Pensamento / Linguagem</span>
        ${isBlank ? '<div style="margin-top: 3px;"><span class="check-option"><span class="check-box"></span> Lógico e Coerente</span> <span class="check-option"><span class="check-box"></span> Acelerado</span> <span class="check-option"><span class="check-box"></span> Sem ideação delirante</span></div>' : `<div class="field-value">${formData.pensamentoLinguagem || '—'}</div>`}
      </div>
      <div class="field-item">
        <span class="field-label">Sensopercepção & Psicomotricidade</span>
        ${isBlank ? '<div style="margin-top: 3px;"><span class="check-option"><span class="check-box"></span> Sensopercepção Preservada</span> <span class="check-option"><span class="check-box"></span> Psicomotricidade Adequada</span></div>' : `<div class="field-value">${formData.sensopercepcao || ''} ${formData.psicomotricidade ? `| ${formData.psicomotricidade}` : ''}</div>`}
      </div>
      <div class="field-item">
        <span class="field-label">Juízo Crítico de Realidade e Insight</span>
        ${isBlank ? '<div style="margin-top: 3px;"><span class="check-option"><span class="check-box"></span> Juízo Preservado</span> <span class="check-option"><span class="check-box"></span> Insight Presente</span> <span class="check-option"><span class="check-box"></span> Parcial</span></div>' : `<div class="field-value">${formData.juizoCriticoInsight || '—'}</div>`}
      </div>
    </div>
  </div>

  <!-- 9. HIPÓTESE DIAGNÓSTICA & PLANO TERAPÊUTICO -->
  <div class="section-box">
    <div class="section-header">
      <span>9. Compreensão Diagnóstica, Enquadre Teórico & Metas</span>
    </div>
    <div class="section-body">
      <div class="grid-3" style="margin-bottom: 4px;">
        <div class="field-item">
          <span class="field-label">Abordagem / Enquadre Teórico</span>
          ${isBlank ? '<div style="margin-top: 3px;"><span class="check-option"><span class="check-box"></span> TCC</span> <span class="check-option"><span class="check-box"></span> Psicanálise</span> <span class="check-option"><span class="check-box"></span> Histórico-Cultural</span></div>' : `<div class="field-value">${formData.enquadreTeorico || '—'}</div>`}
        </div>
        <div class="field-item">
          <span class="field-label">Hipótese Diagnóstica / CID-11</span>
          ${isBlank ? renderBlankLine() : `<div class="field-value font-bold">${formData.hipoteseDiagnosticaCid || 'Sob investigação clínica'}</div>`}
        </div>
        <div class="field-item">
          <span class="field-label">Frequência e Duração das Sessões</span>
          ${isBlank ? renderBlankLine() : `<div class="field-value">${formData.frequenciaSessoes || '1 sessão semanal (50 min)'}</div>`}
        </div>
      </div>

      <div class="field-item" style="margin-bottom: 4px;">
        <span class="field-label">Objetivos Terapêuticos Iniciais & Linha de Cuidado</span>
        ${isBlank ? renderRuledLines(2) : `<div class="field-value text-block">${formData.objetivosTerapeuticos || formData.compreensaoDiagnostica || '—'}</div>`}
      </div>

      <div class="field-item">
        <span class="field-label">Encaminhamentos Interdisciplinares / Observações Finais</span>
        ${isBlank ? renderRuledLines(2) : `<div class="field-value text-block">${formData.encaminhamentos || formData.observacoesGerais || '—'}</div>`}
      </div>
    </div>
  </div>

  <!-- 10. TERMO DE SIGILO ÉTICO E ASSINATURAS -->
  <div class="sign-section">
    <p style="font-size: 8px; text-align: justify; color: #718096; margin-bottom: 12px; font-style: italic;">
      <strong>Nota Ética & Sigilo Profissional:</strong> Documento confidencial amparado pelo Código de Ética Profissional do Psicólogo (Resolução CFP nº 010/2005 e Resolução CFP nº 001/2009). O conteúdo destina-se exclusivamente ao acompanhamento clínico na Clínica Escola de Psicologia da Faculdade Campos Salles.
    </p>

    <div class="sign-grid">
      <div>
        <div class="sign-line"></div>
        <div class="sign-title">${isBlank ? 'Assinatura do Paciente / Responsável' : (formData.pacienteNome || 'Paciente / Responsável')}</div>
        <div class="sign-sub">Paciente / Responsável Legal</div>
      </div>

      <div>
        <div class="sign-line"></div>
        <div class="sign-title">${isBlank ? 'Assinatura do(a) Estagiário(a)' : (formData.estagiarioNome || 'Acadêmico(a) de Psicologia')}</div>
        <div class="sign-sub">${isBlank ? 'Estagiário(a) Clínico(a) / RA' : (formData.raEstagiario ? `RA: ${formData.raEstagiario}` : 'Estagiário(a) Clínico(a)')}</div>
      </div>

      <div>
        <div class="sign-line"></div>
        <div class="sign-title">${isBlank ? 'Assinatura do(a) Supervisor(a) Docente' : (formData.orientadorNome || formData.profissionalResponsavel || 'Profissional / Docente')}</div>
        <div class="sign-sub">${isBlank ? 'Supervisor(a) Docente / CRP' : (formData.crpOrientador || formData.crpProfissional ? `CRP: ${formData.crpOrientador || formData.crpProfissional}` : 'Supervisor(a) Docente / CRP')}</div>
      </div>
    </div>

    <div class="footer-note">
      SIACS • Faculdade Integradas Campos Salles — Emissão em ${dataEmissao} às ${horaEmissao}
    </div>
  </div>

</body>
</html>`;
};
