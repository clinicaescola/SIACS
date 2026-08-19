import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { UserAvatar } from './UserAvatar';
import {
  Menu,
  Bell,
  Edit3,
  Shield,
  Stethoscope,
  GraduationCap,
  HeartHandshake
} from 'lucide-react';

interface AppHeaderProps {
  onToggleMobileMenu: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleMobileMenu,
  onOpenNotifications,
  onOpenProfile
}) => {
  const { currentUser } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const updateCount = () => {
      const notifs = db.getNotificacoes();
      const count = notifs.filter(n => n.status === 'enviado').length;
      setUnreadCount(count);
    };
    updateCount();
    return db.subscribe(updateCount);
  }, []);

  if (!currentUser) return null;

  const getRoleTitle = () => {
    switch (currentUser.role) {
      case 'admin': return 'Painel Administrativo & Governança';
      case 'orientador': return 'Supervisão Docente & Coordenação';
      case 'profissional': return 'Consultório & Atendimento Clínico';
      case 'estagiario': return 'Portal de Estágio Supervisionado';
      case 'paciente': return 'Central de Consultas do Paciente';
      default: return 'Portal SIACS';
    }
  };

  return (
    <header className="bg-[#F8F5F0] border-b border-[#E5E1D8] sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3 shadow-2xs">
      <div className="flex items-center justify-between">
        
        {/* Left Side: Mobile Menu Button & Context Title */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-[#5C5C5C] hover:text-[#033B6C] hover:bg-[#EAE7DC] rounded-xl transition-colors cursor-pointer"
            title="Abrir Menu Lateral"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-sm sm:text-base font-serif font-bold text-[#033B6C] tracking-tight">
              {getRoleTitle()}
            </h1>
            <p className="text-[11px] text-[#8E8D8A] hidden sm:block">
              Sistema Integrado de Agendamento Campos Salles
            </p>
          </div>
        </div>

        {/* Right Side: Notification Icon & Profile Quick Trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="header-notifications-btn"
            onClick={onOpenNotifications}
            className="relative p-2 text-[#5C5C5C] hover:text-[#82954B] hover:bg-[#EAE7DC] rounded-xl transition-colors cursor-pointer"
            title="Central de Notificações"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute 1 top-1 right-1 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-[#E98074] rounded-full ring-2 ring-[#F8F5F0] animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            id="header-profile-btn"
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-[#EAE7DC] transition-colors cursor-pointer"
            title="Editar meu cadastro"
          >
            <UserAvatar
              src={currentUser.foto}
              alt={currentUser.nome}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-[#82954B]"
            />
            <span className="text-xs font-semibold text-[#434343] hidden md:inline truncate max-w-[140px]">
              {currentUser.nome}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
