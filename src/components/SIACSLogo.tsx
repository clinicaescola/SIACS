import React from 'react';

interface SIACSLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  textColor?: string;
  subtitle?: string;
  variant?: 'full' | 'horizontal' | 'compact' | 'monogram';
}

/**
 * SIACS Monogram - Símbolo Vetorial Oficial SIACS
 * Relógio com setas de ciclo verde/azul, livro acadêmico, checkmark e 'S' estilizado
 * Cores Oficiais: Azul Institucional (#033B6C / #0A5B96), Verde Eficiência (#62A032 / #7BB643), Dourado (#D4AF37)
 */
export const SIACSMonogram: React.FC<{
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    xs: 'h-7 w-auto',
    sm: 'h-9 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto',
    xl: 'h-24 w-auto',
    '2xl': 'h-32 w-auto'
  };

  const currentSize = sizeClasses[size] || 'h-12 w-auto';

  return (
    <svg
      viewBox="0 0 320 320"
      className={`${currentSize} inline-block shrink-0 transition-transform ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo SIACS - Sistema Integrado de Agendamento Campos Salles"
    >
      <defs>
        {/* Gradiente Azul SIACS */}
        <linearGradient id="siacsBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B5C98" />
          <stop offset="50%" stopColor="#033B6C" />
          <stop offset="100%" stopColor="#012448" />
        </linearGradient>

        {/* Gradiente Verde SIACS */}
        <linearGradient id="siacsGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#81BF48" />
          <stop offset="50%" stopColor="#62A032" />
          <stop offset="100%" stopColor="#4A8022" />
        </linearGradient>

        {/* Gradiente Misto Azul / Verde para a Faixa 'S' */}
        <linearGradient id="siacsMixGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#033B6C" />
          <stop offset="50%" stopColor="#0A5B96" />
          <stop offset="100%" stopColor="#62A032" />
        </linearGradient>

        <filter id="siacsSoftShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#033B6C" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* 1. Seta Externa Curva Azul (Lado Esquerdo Inferior) */}
      <path
        d="M 68 180 C 52 145 56 100 84 66 C 104 42 135 28 165 25"
        stroke="url(#siacsBlueGrad)"
        strokeWidth="16"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 52 200 C 44 175 48 140 64 112"
        stroke="url(#siacsBlueGrad)"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />

      {/* 2. Seta Dupla Verde Curva em Órbita (Lado Esquerdo Superior) */}
      <path
        d="M 50 170 C 48 115 85 65 140 45"
        stroke="url(#siacsGreenGrad)"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
      />
      {/* Cabeça da Seta Verde Superior */}
      <polygon
        points="148,32 170,54 136,62"
        fill="url(#siacsGreenGrad)"
      />
      {/* Seta Verde Interna Menor */}
      <path
        d="M 72 165 C 72 130 95 98 132 82"
        stroke="url(#siacsGreenGrad)"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />
      <polygon
        points="136,72 152,88 126,95"
        fill="url(#siacsGreenGrad)"
      />

      {/* 3. Círculo do Relógio Principal em Azul */}
      <g filter="url(#siacsSoftShadow)">
        <circle
          cx="170"
          cy="140"
          r="86"
          stroke="url(#siacsBlueGrad)"
          strokeWidth="16"
          fill="#FFFFFF"
        />

        {/* Marcadores de Horas do Relógio */}
        {/* 12h */}
        <line x1="170" y1="62" x2="170" y2="76" stroke="#033B6C" strokeWidth="6" strokeLinecap="round" />
        {/* 3h */}
        <line x1="248" y1="140" x2="234" y2="140" stroke="#033B6C" strokeWidth="6" strokeLinecap="round" />
        {/* 6h */}
        <line x1="170" y1="218" x2="170" y2="204" stroke="#033B6C" strokeWidth="6" strokeLinecap="round" />
        {/* 9h */}
        <line x1="92" y1="140" x2="106" y2="140" stroke="#033B6C" strokeWidth="6" strokeLinecap="round" />
        
        {/* Marcadores Secundários (Pontos) */}
        <circle cx="225" cy="85" r="3.5" fill="#033B6C" />
        <circle cx="225" cy="195" r="3.5" fill="#033B6C" />
        <circle cx="115" cy="85" r="3.5" fill="#033B6C" />

        {/* Ponteiros do Relógio em Azul */}
        {/* Ponteiro das Horas (apontando para 10h) */}
        <line x1="170" y1="140" x2="135" y2="105" stroke="#033B6C" strokeWidth="8" strokeLinecap="round" />
        {/* Ponteiro dos Minutos (apontando para 2h / Checkmark) */}
        <line x1="170" y1="140" x2="218" y2="92" stroke="#033B6C" strokeWidth="8" strokeLinecap="round" />
        {/* Eixo Central Dourado */}
        <circle cx="170" cy="140" r="7" fill="#E5A823" stroke="#033B6C" strokeWidth="3" />
      </g>

      {/* 4. Checkmark Azul Superior Direito */}
      <g filter="url(#siacsSoftShadow)">
        <path
          d="M 215 95 L 235 115 L 285 62"
          stroke="#033B6C"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* 5. Livro Acadêmico Aberto (Dentro do Relógio, Lado Inferior Esquerdo) */}
      <g transform="translate(108, 172)">
        {/* Capa e Contorno do Livro em Azul */}
        <path
          d="M 28 28 C 18 24 6 25 0 28 L 0 4 C 8 2 20 2 28 8 C 36 2 48 2 56 4 L 56 28 C 50 25 38 24 28 28 Z"
          fill="#033B6C"
        />
        {/* Páginas Brancas / Recorte */}
        <path
          d="M 26 24 C 18 21 8 22 3 24 L 3 7 C 9 5 19 5 26 10 Z"
          fill="#FFFFFF"
        />
        <path
          d="M 30 24 C 38 21 48 22 53 24 L 53 7 C 47 5 37 5 30 10 Z"
          fill="#FFFFFF"
        />
        {/* Lombada Central */}
        <line x1="28" y1="8" x2="28" y2="28" stroke="#033B6C" strokeWidth="2.5" />
      </g>

      {/* 6. Linha Arquitetônica / Telhado Estilizado no Relógio */}
      <path
        d="M 185 200 L 235 160 L 285 200"
        stroke="#033B6C"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* 7. Grande 'S' Estilizado em Fita Verde/Azul com Seta na Base */}
      <g filter="url(#siacsSoftShadow)">
        {/* Faixa Superior do S (Verde) */}
        <path
          d="M 248 185 C 275 198 285 225 272 250 C 255 280 205 282 170 280"
          stroke="url(#siacsGreenGrad)"
          strokeWidth="24"
          strokeLinecap="round"
          fill="none"
        />
        {/* Faixa Inferior Curva do S (Azul) */}
        <path
          d="M 250 215 C 220 220 188 230 178 255 C 168 278 195 295 230 295 C 255 295 268 285 272 268"
          stroke="url(#siacsBlueGrad)"
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
        />
        {/* Cabeça da Seta Inferior do S apontando para a Esquerda */}
        <polygon
          points="160,280 190,260 185,298"
          fill="url(#siacsBlueGrad)"
        />
      </g>
    </svg>
  );
};

/**
 * Logo Completo SIACS com Símbolo e Tipografia Oficial Idêntica à Imagem
 */
export const SIACSLogo: React.FC<SIACSLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = '#033B6C',
  subtitle = 'Eficiência e Organização',
  variant = 'horizontal'
}) => {
  const isCompact = variant === 'compact';

  return (
    <div className={`inline-flex items-center gap-3.5 select-none ${className}`}>
      {/* Símbolo Vetorial */}
      <SIACSMonogram size={size} />

      {/* Tipografia Oficial SIACS */}
      {showText && (
        <div className="flex flex-col justify-center text-left">
          {/* Acrônimo Principal */}
          <div className="flex items-baseline gap-2">
            <span
              className="font-sans font-black tracking-tight text-xl sm:text-2xl lg:text-3xl leading-none"
              style={{ color: textColor, fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", letterSpacing: '-0.5px' }}
            >
              SIACS
            </span>
          </div>

          {/* Linha Divisória */}
          <div className="w-full h-[2px] bg-[#033B6C] my-1" />

          {/* Nome do Sistema em 3 Linhas */}
          {!isCompact ? (
            <div className="flex flex-col text-[9px] sm:text-[10.5px] font-black leading-tight tracking-wider uppercase text-[#033B6C]">
              <span>SISTEMA INTEGRADO</span>
              <span>DE AGENDAMENTO</span>
              <span>CAMPOS SALLES</span>
            </div>
          ) : (
            <span className="text-[10px] font-black tracking-wide uppercase text-[#033B6C]">
              Sistema Integrado de Agendamento Campos Salles
            </span>
          )}

          {/* Tagline Verde */}
          <span className="text-[9px] sm:text-[11px] font-bold text-[#62A032] tracking-wide mt-0.5">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
};

// Aliases para compatibilidade total com importações existentes
export const SACSMonogram = SIACSMonogram;
export const SACSLogo = SIACSLogo;
