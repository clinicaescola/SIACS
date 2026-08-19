import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { UserAvatar } from './UserAvatar';
import { EditProfileModal } from './EditProfileModal';
import { BackupRestoreModal } from './BackupRestoreModal';
import { RelatorioAtendimentosModal } from './RelatorioAtendimentosModal';
import { SidebarMenuDrawer } from './SidebarMenuDrawer';
import { SIACSMonogram } from './SIACSLogo';
import {
  GraduationCap,
  Bell,
  LogOut,
  Shield,
  Stethoscope,
  HeartHandshake,
  Edit3,
  Menu,
  PanelRight,
  Layers
} from 'lucide-react';

interface NavbarProps {
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications }) => {
  const { currentUser, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [isRelatorioModalOpen, setIsRelatorioModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateCount = () => {
      const notifs = db.getNotificacoes();
      const count = notifs.filter(n => n.status === 'enviado').length;
      setUnreadCount(count);
    };
    updateCount();
    return db.subscribe(updateCount);
  }, []);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E6F0FA] text-[#0A3B66] border border-[#B3D4F5]">
            <Shield className="w-3 h-3 text-[#0A3B66]" /> Administrador Geral
          </span>
        );
      case 'orientador':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FBF4E6] text-[#B58D3D] border border-[#EED9B0]">
            <Shield className="w-3 h-3 text-[#B58D3D]" /> Orientador Docente
          </span>
        );
      case 'profissional':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]">
            <Stethoscope className="w-3 h-3 text-[#82954B]" /> Profissional de Saúde
          </span>
        );
      case 'estagiario':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F7EEEC] text-[#A37B75] border border-[#E5CDC9]">
            <GraduationCap className="w-3 h-3 text-[#A37B75]" /> Estagiário em Formação
          </span>
        );
      case 'paciente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FDF0EE] text-[#E98074] border border-[#F7C4BE]">
            <HeartHandshake className="w-3 h-3 text-[#E98074]" /> Paciente
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="bg-[#F8F5F0] border-b border-[#E5E1D8] sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <SIACSMonogram size="md" className="shrink-0" />
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-[#033B6C] leading-none">
                  SIACS
                </span>
                <span className="text-xs font-extrabold text-[#033B6C] hidden md:inline">
                  • Sistema Integrado de Agendamento Campos Salles
                </span>
              </div>
              <p className="text-[11px] font-semibold text-[#62A032] leading-tight hidden sm:block mt-0.5">
                Faculdade Campos Salles • Eficiência e Organização
              </p>
            </div>
          </div>

          {/* Right Navigation & Role Menus */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser && (
              <>
                {/* 1. Botão do Menu Lateral Ajustado */}
                <button
                  id="btn-menu-funcoes-sistema"
                  onClick={() => setIsSidebarOpen(true)}
                  className="px-3.5 py-2 bg-white hover:bg-[#EAE7DC] text-[#434343] rounded-xl border border-[#E5E1D8] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs hover:border-[#0A3B66]"
                  title="Abrir menu lateral com todas as funções do seu perfil"
                >
                  <PanelRight className="w-4 h-4 text-[#0A3B66]" />
                  <span className="hidden sm:inline">Menu Lateral</span>
                </button>

                {/* 2. Central de Notificações */}
                <button
                  id="notifications-center-btn"
                  onClick={onOpenNotifications}
                  className="relative p-2 text-[#5C5C5C] hover:text-[#82954B] hover:bg-[#EAE7DC] rounded-xl transition-colors cursor-pointer"
                  title="Central de Notificações (E-mail & WhatsApp)"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-[#E98074] rounded-full ring-2 ring-[#F8F5F0] animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* 3. Perfil do Usuário & Edição de Cadastro */}
                <button
                  id="open-profile-btn"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-2.5 pl-2 py-1 pr-2 rounded-xl hover:bg-[#EAE7DC]/60 border-l border-[#E5E1D8] transition-colors cursor-pointer text-left group"
                  title="Clique para editar seu cadastro (senha, e-mail e foto)"
                >
                  <div className="relative">
                    <UserAvatar
                      src={currentUser.foto}
                      alt={currentUser.nome}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-[#D8D2C2] group-hover:ring-[#82954B] transition-all"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-[#82954B] text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit3 className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-[#434343] leading-tight group-hover:text-[#82954B] transition-colors">
                        {currentUser.nome}
                      </p>
                      <Edit3 className="w-3 h-3 text-[#8E8D8A] opacity-60 group-hover:opacity-100" />
                    </div>
                    <div className="mt-0.5">
                      {getRoleBadge(currentUser.role)}
                    </div>
                  </div>
                </button>

                {/* 4. Logout */}
                <button
                  id="logout-btn"
                  onClick={logout}
                  className="p-2 text-[#8E8D8A] hover:text-[#E98074] hover:bg-[#FDF0EE] rounded-xl transition-colors cursor-pointer"
                  title="Sair do Sistema"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Menu Lateral Ajustado (Sidebar Drawer) */}
      <SidebarMenuDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onOpenRelatorio={() => setIsRelatorioModalOpen(true)}
      />

      {/* Modal de Edição de Cadastro (Senha, E-mail e Foto) */}
      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Modal de Backup & Restauração do Administrador */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />

      {/* Modal de Relatórios de Atendimentos */}
      <RelatorioAtendimentosModal
        isOpen={isRelatorioModalOpen}
        onClose={() => setIsRelatorioModalOpen(false)}
        orientadorNome={currentUser?.nome || 'Orientador Docente'}
      />
    </header>
  );
};
