import React, { useState } from 'react';
import { SAD_AVATAR_DATA_URI } from '../utils/avatar';

interface UserAvatarProps {
  src?: string;
  alt: string;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt,
  className = 'w-10 h-10 rounded-full object-cover ring-1 ring-[#D8D2C2]'
}) => {
  const [hasError, setHasError] = useState(false);

  const displaySrc = (!src || src.trim() === '' || hasError) ? SAD_AVATAR_DATA_URI : src;

  return (
    <img
      src={displaySrc}
      alt={alt}
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
};
