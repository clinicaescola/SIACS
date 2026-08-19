// SVG de rostinho triste (sad face) para cadastros sem foto
export const SAD_AVATAR_DATA_URI =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23FDFBF7'><circle cx='50' cy='50' r='46' fill='%23F4EBE6' stroke='%23D8C8C0' stroke-width='4'/><circle cx='35' cy='38' r='5.5' fill='%237D716A'/><circle cx='65' cy='38' r='5.5' fill='%237D716A'/><path d='M30 68 Q 50 50 70 68' stroke='%237D716A' stroke-width='5' stroke-linecap='round' fill='none'/></svg>";

export const isSadAvatar = (foto?: string): boolean => {
  if (!foto || foto.trim() === '') return true;
  return foto.startsWith('data:image/svg+xml') && foto.includes('M30 68');
};

export const getAvatarSrc = (foto?: string): string => {
  if (!foto || foto.trim() === '') {
    return SAD_AVATAR_DATA_URI;
  }
  return foto;
};
