import React from 'react';
export { SIACSLogo, SIACSMonogram, SACSLogo, SACSMonogram } from './SIACSLogo';
import { SIACSMonogram, SIACSLogo } from './SIACSLogo';

interface CamposSallesLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  subtitle?: string;
}

export const CamposSallesMonogram: React.FC<{ className?: string; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }> = ({
  className = '',
  size = 'md'
}) => {
  return <SIACSMonogram className={className} size={size} />;
};

export const CamposSallesLogo: React.FC<CamposSallesLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = '#033B6C',
  subtitle = 'Eficiência e Organização'
}) => {
  return (
    <SIACSLogo
      className={className}
      size={size}
      showText={showText}
      textColor={textColor}
      subtitle={subtitle}
    />
  );
};
