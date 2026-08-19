import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { UserAvatar } from './UserAvatar';
import { SIACSMonogram } from './SIACSLogo';
import {
  Shield,
  Stethoscope,
  GraduationCap,
  HeartHandshake,
  Users,
  Calendar,
  Award,
  ClipboardList,
  FileCheck2,
  Star,
  Clock,
  Printer,
  Archive,
  Edit3,
  LogOut,
  MailCheck,
  LayoutDashboard,
  Bell,
  X
} from 'lucide-react';

export interface AppSidebarProps {
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenBackup: () => void;
  onOpenRelatorio: () => void;
  onOpenAnamnesePrint?: () => void;
  onOpenAcompanhamentoPrint?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  onOpenNotifications,
  onOpenProfile,
  onOpenBackup,
  onOpenRelatorio,
  onOpenAnamnesePrint,
  onOpenAcompanhamentoPrint,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { currentUser, logout } = useAuth();
  const [activeTabId, setActiveTabId] = useState<string>('admin-tab-overview');
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    // Definir tab inicial baseado no papel do usuário
    if (currentUser?.role === 'admin') setActiveTabId('admin-tab-overview');
    else if (currentUser?.role === 'orientador') setActiveTabId('orient-tab-supervisao');
    else if (currentUser?.role === 'profissional') setActiveTabId('prof-tab-agenda');
    else if (currentUser?.role === 'estagiario') setActiveTabId('est-tab-escalas');
    else if (currentUser?.role === 'paciente') setActiveTabId('paciente-tab-agendamentos');

    const updateCount = () => {
      const notifs = db.getNotificacoes();
      const count = notifs.filter(n => n.status === 'enviado').length;
      setUnreadCount(count);
    };
    updateCount();
    const unsub = db.subscribe(updateCount);

    const handleCustomNav = (e: Event) => {
      const customEvent = e as CustomEvent<{ tabId: string }>;
      if (customEvent.detail?.tabId) {
        setActiveTabId(customEvent.detail.tabId);
      }
    };

    window.addEventListener('siacs-navigate-tab', handleCustomNav);

    return () => {
      unsub();
      window.removeEventListener('siacs-navigate-tab', handleCustomNav);
    };
  }, [currentUser?.role]);

  if (!currentUser) return null;

  const navigateTo = (tabId: string) => {
    setActiveTabId(tabId);
    if (onCloseMobile) onCloseMobile();

    // Dispara evento customizado para troca de tela
    window.dispatchEvent(new CustomEvent('siacs-navigate-tab', { detail: { tabId } }));

    // Fallback: clique no elemento do DOM
    setTimeout(() => {
      const element = document.getElementById(tabId);
      if (element) {
        element.click();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F0FA] text-[#0A3B66] border border-[#B3D4F5]">
            <Shield className="w-2.5 h-2.5 text-[#0A3B66]" /> Administrador Geral
          </span>
        );
      case 'orientador':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBF4E6] text-[#B58D3D] border border-[#EED9B0]">
            <Shield className="w-2.5 h-2.5 text-[#B58D3D]" /> Orientador Docente
          </span>
        );
      case 'profissional':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]">
            <Stethoscope className="w-2.5 h-2.5 text-[#82954B]" /> Profissional
          </span>
        );
      case 'estagiario':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F7EEEC] text-[#A37B75] border border-[#E5CDC9]">
            <GraduationCap className="w-2.5 h-2.5 text-[#A37B75]" /> Estagiário
          </span>
        );
      case 'paciente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FDF0EE] text-[#E98074] border border-[#F7C4BE]">
            <HeartHandshake className="w-2.5 h-2.5 text-[#E98074]" /> Paciente
          </span>
        );
      default:
        return null;
    }
  };

  const navItemClass = (tabId: string) => {
    const isActive = activeTabId === tabId;
    return `w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all cursor-pointer ${
      isActive
        ? 'bg-[#033B6C] text-white shadow-xs font-bold'
        : 'text-[#434343] hover:bg-[#EAE7DC] hover:text-[#033B6C]'
    }`;
  };

  const iconWrapperClass = (tabId: string, defaultColorClass: string) => {
    const isActive = activeTabId === tabId;
    return `p-1.5 rounded-lg shrink-0 transition-colors ${
      isActive ? 'bg-white/20 text-white' : defaultColorClass
    }`;
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#F8F5F0] border-r border-[#E5E1D8] text-[#434343] select-none">
      
      {/* 1. Header do Sistema (Logo & Faculdade) */}
      <div>
        <div className="p-4 sm:p-5 border-b border-[#E5E1D8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SIACSMonogram size="md" className="shrink-0 shadow-2xs" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-[#033B6C] leading-none">
                  SIACS
                </span>
                <span className="text-[10px] font-bold bg-[#033B6C]/10 text-[#033B6C] px-1.5 py-0.2 rounded">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] font-semibold text-[#62A032] leading-tight mt-0.5">
                Faculdade Campos Salles
              </p>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-[#5C5C5C] hover:text-[#434343] hover:bg-[#EAE7DC] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 2. Cartão do Usuário Conectado */}
        <div className="p-3.5 mx-3 mt-3 bg-white border border-[#E5E1D8] rounded-2xl shadow-2xs">
          <div className="flex items-center gap-3">
            <UserAvatar
              src={currentUser.foto}
              alt={currentUser.nome}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#82954B] shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#434343] truncate">{currentUser.nome}</p>
              <div className="mt-0.5">{getRoleBadge(currentUser.role)}</div>
            </div>
            <button
              onClick={onOpenProfile}
              className="p-1.5 text-[#8E8D8A] hover:text-[#82954B] hover:bg-[#F8F5F0] rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Editar meu cadastro"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. Menus de Navegação por Perfil */}
        <div className="px-3 py-4 space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto">
          
          {/* ========================================== */}
          {/* MENU: ADMINISTRADOR GERAL                  */}
          {/* ========================================== */}
          {currentUser.role === 'admin' && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-[#8E8D8A] uppercase tracking-wider px-3 mb-1">
                Governança & Gestão
              </p>

              <button
                id="sidebar-admin-overview"
                onClick={() => navigateTo('admin-tab-overview')}
                className={navItemClass('admin-tab-overview')}
              >
                <div className={iconWrapperClass('admin-tab-overview', 'bg-[#E6F0FA] text-[#0A3B66]')}>
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <span>Visão Geral & Métricas</span>
              </button>

              <button
                id="sidebar-admin-users"
                onClick={() => navigateTo('admin-tab-users')}
                className={navItemClass('admin-tab-users')}
              >
                <div className={iconWrapperClass('admin-tab-users', 'bg-[#EDE8F5] text-[#5E35B1]')}>
                  <Users className="w-4 h-4" />
                </div>
                <span>Gestão de Usuários</span>
              </button>

              <button
                id="sidebar-admin-supervisao"
                onClick={() => navigateTo('admin-tab-supervisao')}
                className={navItemClass('admin-tab-supervisao')}
              >
                <div className={iconWrapperClass('admin-tab-supervisao', 'bg-[#F1F8E9] text-[#82954B]')}>
                  <Calendar className="w-4 h-4" />
                </div>
                <span>Agendamentos Globais</span>
              </button>

              <button
                id="sidebar-admin-horas"
                onClick={() => navigateTo('admin-tab-horas')}
                className={navItemClass('admin-tab-horas')}
              >
                <div className={iconWrapperClass('admin-tab-horas', 'bg-[#FBF4E6] text-[#B58D3D]')}>
                  <Award className="w-4 h-4" />
                </div>
                <span>Horas de Estágio</span>
              </button>

              <button
                id="sidebar-admin-anamneses"
                onClick={() => navigateTo('admin-tab-anamneses')}
                className={navItemClass('admin-tab-anamneses')}
              >
                <div className={iconWrapperClass('admin-tab-anamneses', 'bg-[#E6F0FA] text-[#0A3B66]')}>
                  <ClipboardList className="w-4 h-4" />
                </div>
                <span>Prontuários & Anamneses</span>
              </button>

              <button
                id="sidebar-admin-notificacoes"
                onClick={() => navigateTo('admin-tab-notificacoes')}
                className={navItemClass('admin-tab-notificacoes')}
              >
                <div className={iconWrapperClass('admin-tab-notificacoes', 'bg-[#F1F8E9] text-[#82954B]')}>
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <span>Auditoria de Disparos</span>
              </button>

              <button
                id="sidebar-admin-email-config"
                onClick={() => navigateTo('admin-tab-email-config')}
                className={navItemClass('admin-tab-email-config')}
              >
                <div className={iconWrapperClass('admin-tab-email-config', 'bg-[#EDE8F5] text-[#5E35B1]')}>
                  <MailCheck className="w-4 h-4" />
                </div>
                <span>Configuração de E-mail</span>
              </button>
            </div>
          )}

          {/* ========================================== */}
          {/* MENU: ORIENTADOR DOCENTE                   */}
          {/* ========================================== */}
          {currentUser.role === 'orientador' && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-[#8E8D8A] uppercase tracking-wider px-3 mb-1">
                Supervisão Docente
              </p>

              <button
                id="sidebar-orient-supervisao"
                onClick={() => navigateTo('orient-tab-supervisao')}
                className={navItemClass('orient-tab-supervisao')}
              >
                <div className={iconWrapperClass('orient-tab-supervisao', 'bg-[#E6F0FA] text-[#0A3B66]')}>
                  <Calendar className="w-4 h-4" />
                </div>
                <span>Supervisão de Consultas</span>
              </button>

              <button
                id="sidebar-orient-horas"
                onClick={() => navigateTo('orient-tab-horas')}
                className={navItemClass('orient-tab-horas')}
              >
                <div className={iconWrapperClass('orient-tab-horas', 'bg-[#FBF4E6] text-[#B58D3D]')}>
                  <Award className="w-4 h-4" />
                </div>
                <span>Horas dos Estagiários</span>
              </button>

              <button
                id="sidebar-orient-equipe"
                onClick={() => navigateTo('orient-tab-equipe')}
                className={navItemClass('orient-tab-equipe')}
              >
                <div className={iconWrapperClass('orient-tab-equipe', 'bg-[#F1F8E9] text-[#82954B]')}>
                  <Users className="w-4 h-4" />
                </div>
                <span>Equipe & Habilitações</span>
              </button>

              <button
                id="sidebar-orient-anamneses"
                onClick={() => navigateTo('orient-tab-anamneses')}
                className={navItemClass('orient-tab-anamneses')}
              >
                <div className={iconWrapperClass('orient-tab-anamneses', 'bg-[#EDE8F5] text-[#5E35B1]')}>
                  <ClipboardList className="w-4 h-4" />
                </div>
                <span>Prontuários Clínicos</span>
              </button>

              <button
                id="sidebar-orient-acompanhamentos"
                onClick={() => navigateTo('orient-tab-acompanhamentos')}
                className={navItemClass('orient-tab-acompanhamentos')}
              >
                <div className={iconWrapperClass('orient-tab-acompanhamentos', 'bg-[#F1F8E9] text-[#82954B]')}>
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <span>Evoluções das Sessões</span>
              </button>

              <button
                id="sidebar-orient-avaliacoes"
                onClick={() => navigateTo('orient-tab-avaliacoes')}
                className={navItemClass('orient-tab-avaliacoes')}
              >
                <div className={iconWrapperClass('orient-tab-avaliacoes', 'bg-[#FDF0EE] text-[#E98074]')}>
                  <Star className="w-4 h-4" />
                </div>
                <span>Avaliações dos Pacientes</span>
              </button>
            </div>
          )}

          {/* ========================================== */}
          {/* MENU: PROFISSIONAL DE SAÚDE                */}
          {/* ========================================== */}
          {currentUser.role === 'profissional' && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-[#8E8D8A] uppercase tracking-wider px-3 mb-1">
                Consultório & Agenda
              </p>

              <button
                id="sidebar-prof-agenda"
                onClick={() => navigateTo('prof-tab-agenda')}
                className={navItemClass('prof-tab-agenda')}
              >
                <div className={iconWrapperClass('prof-tab-agenda', 'bg-[#F1F8E9] text-[#82954B]')}>
                  <Calendar className="w-4 h-4" />
                </div>
                <span>Minha Agenda Clínica</span>
              </button>

              <button
                id="sidebar-prof-disp"
                onClick={() => navigateTo('prof-tab-disp')}
                className={navItemClass('prof-tab-disp')}
              >
                <div className={iconWrapperClass('prof-tab-disp', 'bg-[#FBF4E6] text-[#B58D3D]')}>
                  <Clock className="w-4 h-4" />
                </div>
                <span>Disponibilizar Horários</span>
              </button>

              <button
                id="sidebar-prof-avaliacoes"
                onClick={() => navigateTo('prof-tab-avaliacoes')}
                className={navItemClass('prof-tab-avaliacoes')}
              >
                <div className={iconWrapperClass('prof-tab-avaliacoes', 'bg-[#FDF0EE] text-[#E98074]')}>
                  <Star className="w-4 h-4" />
                </div>
                <span>Minhas Avaliações</span>
              </button>
            </div>
          )}

          {/* ========================================== */}
          {/* MENU: ESTAGIÁRIO EM FORMAÇÃO               */}
          {/* ========================================== */}
          {currentUser.role === 'estagiario' && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-[#8E8D8A] uppercase tracking-wider px-3 mb-1">
                Estágio Supervisionado
              </p>

              <button
                id="sidebar-est-escalas"
                onClick={() => navigateTo('est-tab-escalas')}
                className={navItemClass('est-tab-escalas')}
              >
                <div className={iconWrapperClass('est-tab-escalas', 'bg-[#F7EEEC] text-[#A37B75]')}>
                  <Users className="w-4 h-4" />
                </div>
                <span>Casos & Atendimentos</span>
              </button>

              <button
                id="sidebar-est-horas"
                onClick={() => navigateTo('est-tab-horas')}
                className={navItemClass('est-tab-horas')}
              >
                <div className={iconWrapperClass('est-tab-horas', 'bg-[#FBF4E6] text-[#B58D3D]')}>
                  <Award className="w-4 h-4" />
                </div>
                <span>Horas de Estágio</span>
              </button>

              <button
                id="sidebar-est-disp"
                onClick={() => navigateTo('est-tab-disp')}
                className={navItemClass('est-tab-disp')}
              >
                <div className={iconWrapperClass('est-tab-disp', 'bg-[#F1F8E9] text-[#82954B]')}>
                  <Calendar className="w-4 h-4" />
                </div>
                <span>Minha Escala Semanal</span>
              </button>
            </div>
          )}

          {/* ========================================== */}
          {/* MENU: PACIENTE                             */}
          {/* ========================================== */}
          {currentUser.role === 'paciente' && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-[#8E8D8A] uppercase tracking-wider px-3 mb-1">
                Portal do Paciente
              </p>

              <button
                id="sidebar-pac-agendamentos"
                onClick={() => navigateTo('paciente-tab-agendamentos')}
                className={navItemClass('paciente-tab-agendamentos')}
              >
                <div className={iconWrapperClass('paciente-tab-agendamentos', 'bg-[#FDF0EE] text-[#E98074]')}>
                  <Calendar className="w-4 h-4" />
                </div>
                <span>Minhas Consultas</span>
              </button>

              <button
                id="sidebar-pac-agendar"
                onClick={() => navigateTo('paciente-tab-agendar')}
                className={navItemClass('paciente-tab-agendar')}
              >
                <div className={iconWrapperClass('paciente-tab-agendar', 'bg-[#F1F8E9] text-[#82954B]')}>
                  <Calendar className="w-4 h-4" />
                </div>
                <span>Agendar Consulta</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* 4. Ferramentas Globais & Rodapé do Menu Lateral */}
      <div className="p-3 border-t border-[#E5E1D8] bg-[#F2EDE4]/60 space-y-1.5">
        
        {/* Botão de Notificações com Badge */}
        <button
          id="sidebar-notifications-btn"
          onClick={onOpenNotifications}
          className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#EAE7DC] text-[#434343] flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-[#82954B]" />
            <span>Notificações & Avisos</span>
          </div>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-[#E98074] rounded-full">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Ferramenta: Ficha de Anamnese Imprimível (Disponível para Admin, Orientador, Profissional, Estagiário) */}
        {currentUser.role !== 'paciente' && onOpenAnamnesePrint && (
          <button
            id="sidebar-anamnese-print-btn"
            onClick={onOpenAnamnesePrint}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#E6F0FA] text-[#033B6C] flex items-center gap-2.5 text-xs font-bold transition-colors cursor-pointer border border-[#B3D4F5]/60 bg-white/70"
            title="Formulário de Anamnese Psicológica Completa (Imprimível e Digital)"
          >
            <ClipboardList className="w-4 h-4 text-[#033B6C]" />
            <span>Ficha de Anamnese (Imprimir)</span>
          </button>
        )}

        {/* Ferramenta: Ficha de Acompanhamento e Evolução de Sessões */}
        {currentUser.role !== 'paciente' && onOpenAcompanhamentoPrint && (
          <button
            id="sidebar-acompanhamento-print-btn"
            onClick={onOpenAcompanhamentoPrint}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F1F8E9] text-[#82954B] flex items-center gap-2.5 text-xs font-bold transition-colors cursor-pointer border border-[#D0E3B6]/60 bg-white/70"
            title="Ficha de Acompanhamento Clínico, Preenchimento por Sessão e Impressão"
          >
            <FileCheck2 className="w-4 h-4 text-[#82954B]" />
            <span>Ficha de Acompanhamento</span>
          </button>
        )}

        {/* Ferramenta: Relatórios (Admin e Orientador) */}
        {(currentUser.role === 'admin' || currentUser.role === 'orientador') && (
          <button
            id="sidebar-relatorios-btn"
            onClick={onOpenRelatorio}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#EAE7DC] text-[#434343] flex items-center gap-2.5 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#82954B]" />
            <span>Relatórios de Atendimentos</span>
          </button>
        )}

        {/* Ferramenta: Backup & Restauração (Admin) */}
        {currentUser.role === 'admin' && (
          <button
            id="sidebar-backup-btn"
            onClick={onOpenBackup}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#EAE7DC] text-[#0A3B66] flex items-center gap-2.5 text-xs font-bold transition-colors cursor-pointer"
          >
            <Archive className="w-4 h-4 text-[#0A3B66]" />
            <span>Backup & Restauração</span>
          </button>
        )}

        {/* Logout */}
        <button
          id="sidebar-logout-btn"
          onClick={logout}
          className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FFEBEE] text-[#C62828] flex items-center gap-2.5 text-xs font-bold transition-colors cursor-pointer mt-1"
        >
          <LogOut className="w-4 h-4" />
          <span>Encerrar Sessão</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Column (2-Column Frame Structure) */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Responsive Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#F8F5F0] z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
