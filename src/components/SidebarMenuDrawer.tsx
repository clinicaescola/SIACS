import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AppUser } from '../types';
import { UserAvatar } from './UserAvatar';
import { SIACSMonogram } from './SIACSLogo';
import {
  X,
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
  ChevronRight,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

export interface SidebarMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
  onOpenBackup: () => void;
  onOpenRelatorio: () => void;
}

export const SidebarMenuDrawer: React.FC<SidebarMenuDrawerProps> = ({
  isOpen,
  onClose,
  onOpenProfile,
  onOpenBackup,
  onOpenRelatorio
}) => {
  const { currentUser, logout } = useAuth();

  if (!isOpen || !currentUser) return null;

  const navigateToTab = (elementId: string) => {
    onClose();
    // Dispara evento customizado para navegação reativa
    window.dispatchEvent(new CustomEvent('siacs-navigate-tab', { detail: { tabId: elementId } }));

    // Fallback: clique no elemento do DOM
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.click();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E6F0FA] text-[#0A3B66] border border-[#B3D4F5]">
            <Shield className="w-3 h-3 text-[#0A3B66]" /> Administrador Geral
          </span>
        );
      case 'orientador':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FBF4E6] text-[#B58D3D] border border-[#EED9B0]">
            <Shield className="w-3 h-3 text-[#B58D3D]" /> Orientador Docente
          </span>
        );
      case 'profissional':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]">
            <Stethoscope className="w-3 h-3 text-[#82954B]" /> Profissional de Saúde
          </span>
        );
      case 'estagiario':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F7EEEC] text-[#A37B75] border border-[#E5CDC9]">
            <GraduationCap className="w-3 h-3 text-[#A37B75]" /> Estagiário em Formação
          </span>
        );
      case 'paciente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FDF0EE] text-[#E98074] border border-[#F7C4BE]">
            <HeartHandshake className="w-3 h-3 text-[#E98074]" /> Paciente
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in text-[#434343]">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#FDFBF7] h-full shadow-2xl flex flex-col transform transition-transform duration-300 border-l border-[#E5E1D8] z-10">
        
        {/* Sidebar Header */}
        <div className="p-5 bg-[#033B6C] text-white flex items-center justify-between border-b border-[#0A3B66]">
          <div className="flex items-center gap-3">
            <SIACSMonogram size="sm" className="bg-white/10 p-1 rounded-xl" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-serif font-bold text-white tracking-wide">Menu Lateral</h2>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded font-semibold">SIACS</span>
              </div>
              <p className="text-xs text-white/80">Painel de navegação rápida por perfil</p>
            </div>
          </div>
          <button
            id="close-sidebar-menu-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Fechar menu lateral"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 bg-[#F8F5F0] border-b border-[#E5E1D8] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar
              src={currentUser.foto}
              alt={currentUser.nome}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-[#82954B] shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#434343] truncate">{currentUser.nome}</p>
              <p className="text-xs text-[#8E8D8A] truncate">{currentUser.email || currentUser.usuario}</p>
              <div className="mt-1">{getRoleBadge(currentUser.role)}</div>
            </div>
          </div>

          <button
            id="sidebar-edit-profile-header-btn"
            onClick={() => { onOpenProfile(); onClose(); }}
            className="p-2 text-[#5C5C5C] hover:text-[#82954B] hover:bg-[#EAE7DC] rounded-xl transition-colors shrink-0 cursor-pointer"
            title="Editar cadastro"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* ========================================================================= */}
          {/* 1. Módulos & Funções do Administrador */}
          {/* ========================================================================= */}
          {currentUser.role === 'admin' && (
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-bold text-[#8E8D8A] uppercase tracking-wider px-2 mb-1.5">
                  Gestão & Governança Clínica
                </p>
                <div className="space-y-1">
                  <button
                    id="dropdown-admin-overview"
                    onClick={() => navigateToTab('admin-tab-overview')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] active:bg-[#EAE7DC] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer border border-transparent hover:border-[#E5E1D8]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#E6F0FA] text-[#0A3B66]">
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#0A3B66]">Visão Geral & Indicadores</p>
                        <p className="text-[10px] text-[#8E8D8A]">Métricas, gráficos e balanço geral</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#0A3B66] transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    id="dropdown-admin-users"
                    onClick={() => navigateToTab('admin-tab-users')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] active:bg-[#EAE7DC] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer border border-transparent hover:border-[#E5E1D8]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#EDE8F5] text-[#5E35B1]">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#5E35B1]">Usuários & Permissões</p>
                        <p className="text-[10px] text-[#8E8D8A]">Cadastrar, alterar senhas e habilitar</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#5E35B1] transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    id="dropdown-admin-supervisao"
                    onClick={() => navigateToTab('admin-tab-supervisao')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] active:bg-[#EAE7DC] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer border border-transparent hover:border-[#E5E1D8]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#F1F8E9] text-[#82954B]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#82954B]">Supervisão Geral de Consultas</p>
                        <p className="text-[10px] text-[#8E8D8A]">Agendamentos, salas e presenças</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#82954B] transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    id="dropdown-admin-horas"
                    onClick={() => navigateToTab('admin-tab-horas')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] active:bg-[#EAE7DC] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer border border-transparent hover:border-[#E5E1D8]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#FBF4E6] text-[#B58D3D]">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#B58D3D]">Horas de Estágio Acadêmico</p>
                        <p className="text-[10px] text-[#8E8D8A]">Dashboard de carga horária e aprovações</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#B58D3D] transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    id="dropdown-admin-anamneses"
                    onClick={() => navigateToTab('admin-tab-anamneses')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] active:bg-[#EAE7DC] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer border border-transparent hover:border-[#E5E1D8]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#E6F0FA] text-[#0A3B66]">
                        <ClipboardList className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#0A3B66]">Prontuários & Anamneses</p>
                        <p className="text-[10px] text-[#8E8D8A]">Histórico clínico e evoluções</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#0A3B66] transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    id="dropdown-admin-acompanhamentos"
                    onClick={() => navigateToTab('admin-tab-acompanhamentos')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] active:bg-[#EAE7DC] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer border border-transparent hover:border-[#E5E1D8]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#F1F8E9] text-[#82954B]">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#82954B]">Evoluções & Acompanhamentos</p>
                        <p className="text-[10px] text-[#8E8D8A]">Registros de sessão e notas clínicas</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#82954B] transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    id="dropdown-admin-avaliacoes"
                    onClick={() => navigateToTab('admin-tab-avaliacoes')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] active:bg-[#EAE7DC] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer border border-transparent hover:border-[#E5E1D8]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#FDF0EE] text-[#E98074]">
                        <Star className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#E98074]">Avaliações & Satisfação</p>
                        <p className="text-[10px] text-[#8E8D8A]">Notas e feedbacks dos pacientes</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#E98074] transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    id="dropdown-admin-email-config"
                    onClick={() => navigateToTab('admin-tab-email-config')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] active:bg-[#EAE7DC] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer border border-transparent hover:border-[#E5E1D8]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#EDE8F5] text-[#5E35B1]">
                        <MailCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#5E35B1]">Configuração de E-mail (SMTP)</p>
                        <p className="text-[10px] text-[#8E8D8A]">Servidor de envio e testes de disparo</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#5E35B1] transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>

              {/* Ferramentas do Administrador */}
              <div className="pt-2 border-t border-[#E5E1D8]">
                <p className="text-[11px] font-bold text-[#8E8D8A] uppercase tracking-wider px-2 mb-1.5">
                  Ferramentas do Sistema
                </p>
                <div className="space-y-1">
                  <button
                    id="sidebar-admin-relatorios"
                    onClick={() => { onOpenRelatorio(); onClose(); }}
                    className="w-full text-left p-2.5 rounded-xl bg-[#F8F5F0] hover:bg-[#EAE7DC] text-[#434343] flex items-center gap-3 text-xs font-bold cursor-pointer transition-colors border border-[#E5E1D8]"
                  >
                    <div className="p-2 rounded-lg bg-white text-[#82954B] shadow-2xs">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#434343]">Relatórios de Atendimentos</p>
                      <p className="text-[10px] text-[#5C5C5C] font-normal">Realizados, não confirmados e faltas</p>
                    </div>
                  </button>

                  <button
                    id="sidebar-admin-backup"
                    onClick={() => { onOpenBackup(); onClose(); }}
                    className="w-full text-left p-2.5 rounded-xl bg-[#E6F0FA] hover:bg-[#D4E8F8] text-[#0A3B66] flex items-center gap-3 text-xs font-bold cursor-pointer transition-colors border border-[#B3D4F5]"
                  >
                    <div className="p-2 rounded-lg bg-white text-[#0A3B66] shadow-2xs">
                      <Archive className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#0A3B66]">Backup & Restauração</p>
                      <p className="text-[10px] text-[#0A3B66]/80 font-normal">Download de código e base de dados</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. Módulos & Funções do Orientador */}
          {/* ========================================================================= */}
          {currentUser.role === 'orientador' && (
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-bold text-[#8E8D8A] uppercase tracking-wider px-2 mb-1.5">
                  Supervisão Docente & Clínica
                </p>
                <div className="space-y-1">
                  <button
                    id="dropdown-orient-supervisao"
                    onClick={() => navigateToTab('orient-tab-supervisao')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#E6F0FA] text-[#0A3B66]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#0A3B66]">Supervisão de Atendimentos</p>
                        <p className="text-[10px] text-[#8E8D8A]">Consultas e atribuição de estagiários</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#0A3B66]" />
                  </button>

                  <button
                    id="dropdown-orient-horas"
                    onClick={() => navigateToTab('orient-tab-horas')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#FBF4E6] text-[#B58D3D]">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#B58D3D]">Horas dos Estagiários</p>
                        <p className="text-[10px] text-[#8E8D8A]">Validação e lançamentos de horas</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#B58D3D]" />
                  </button>

                  <button
                    id="dropdown-orient-equipe"
                    onClick={() => navigateToTab('orient-tab-equipe')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#F1F8E9] text-[#82954B]">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#82954B]">Equipe & Habilitação</p>
                        <p className="text-[10px] text-[#8E8D8A]">Aprovação de psicólogos e estagiários</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#82954B]" />
                  </button>

                  <button
                    id="dropdown-orient-anamneses"
                    onClick={() => navigateToTab('orient-tab-anamneses')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#EDE8F5] text-[#5E35B1]">
                        <ClipboardList className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#5E35B1]">Prontuários e Anamneses</p>
                        <p className="text-[10px] text-[#8E8D8A]">Histórico clínico e impressões</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#5E35B1]" />
                  </button>

                  <button
                    id="dropdown-orient-acompanhamentos"
                    onClick={() => navigateToTab('orient-tab-acompanhamentos')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#F1F8E9] text-[#82954B]">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#82954B]">Acompanhamentos das Sessões</p>
                        <p className="text-[10px] text-[#8E8D8A]">Evoluções e notas de supervisão</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#82954B]" />
                  </button>

                  <button
                    id="dropdown-orient-avaliacoes"
                    onClick={() => navigateToTab('orient-tab-avaliacoes')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#FDF0EE] text-[#E98074]">
                        <Star className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#E98074]">Avaliações Recebidas</p>
                        <p className="text-[10px] text-[#8E8D8A]">Feedbacks e métricas de satisfação</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#E98074]" />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E5E1D8]">
                <button
                  id="sidebar-orient-relatorios"
                  onClick={() => { onOpenRelatorio(); onClose(); }}
                  className="w-full text-left p-2.5 rounded-xl bg-[#F8F5F0] hover:bg-[#EAE7DC] text-[#434343] flex items-center gap-3 text-xs font-bold cursor-pointer transition-colors border border-[#E5E1D8]"
                >
                  <div className="p-2 rounded-lg bg-white text-[#82954B] shadow-2xs">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#434343]">Relatórios de Atendimentos</p>
                    <p className="text-[10px] text-[#5C5C5C] font-normal">Realizados, não confirmados e faltas</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. Módulos & Funções do Profissional */}
          {/* ========================================================================= */}
          {currentUser.role === 'profissional' && (
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-bold text-[#8E8D8A] uppercase tracking-wider px-2 mb-1.5">
                  Prática Clínica & Consultório
                </p>
                <div className="space-y-1">
                  <button
                    id="dropdown-prof-agenda"
                    onClick={() => navigateToTab('prof-tab-agenda')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#F1F8E9] text-[#82954B]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#82954B]">Minha Agenda & Atendimentos</p>
                        <p className="text-[10px] text-[#8E8D8A]">Prontuário, anamnese e estagiários</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#82954B]" />
                  </button>

                  <button
                    id="dropdown-prof-disp"
                    onClick={() => navigateToTab('prof-tab-disp')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#FBF4E6] text-[#B58D3D]">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#B58D3D]">Disponibilizar Horários</p>
                        <p className="text-[10px] text-[#8E8D8A]">Abrir novas vagas no calendário</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#B58D3D]" />
                  </button>

                  <button
                    id="dropdown-prof-avaliacoes"
                    onClick={() => navigateToTab('prof-tab-avaliacoes')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#FDF0EE] text-[#E98074]">
                        <Star className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#E98074]">Minhas Avaliações</p>
                        <p className="text-[10px] text-[#8E8D8A]">Média e depoimentos dos pacientes</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#E98074]" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. Módulos & Funções do Estagiário */}
          {/* ========================================================================= */}
          {currentUser.role === 'estagiario' && (
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-bold text-[#8E8D8A] uppercase tracking-wider px-2 mb-1.5">
                  Formação Acadêmica & Estágio
                </p>
                <div className="space-y-1">
                  <button
                    id="dropdown-est-escalas"
                    onClick={() => navigateToTab('est-tab-escalas')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#F7EEEC] text-[#A37B75]">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#A37B75]">Atendimentos & Casos Atribuídos</p>
                        <p className="text-[10px] text-[#8E8D8A]">Co-atendimentos supervisionados</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#A37B75]" />
                  </button>

                  <button
                    id="dropdown-est-horas"
                    onClick={() => navigateToTab('est-tab-horas')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#FBF4E6] text-[#B58D3D]">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#B58D3D]">Horas de Estágio & Relatórios</p>
                        <p className="text-[10px] text-[#8E8D8A]">Envio de relatórios e meta horária</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#B58D3D]" />
                  </button>

                  <button
                    id="dropdown-est-disp"
                    onClick={() => navigateToTab('est-tab-disp')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#F1F8E9] text-[#82954B]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#82954B]">Minha Escala / Turnos</p>
                        <p className="text-[10px] text-[#8E8D8A]">Cadastrar disponibilidade semanal</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#82954B]" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. Módulos & Funções do Paciente */}
          {/* ========================================================================= */}
          {currentUser.role === 'paciente' && (
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-bold text-[#8E8D8A] uppercase tracking-wider px-2 mb-1.5">
                  Área do Paciente
                </p>
                <div className="space-y-1">
                  <button
                    id="dropdown-pac-agendamentos"
                    onClick={() => navigateToTab('paciente-tab-agendamentos')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#FDF0EE] text-[#E98074]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#E98074]">Minhas Consultas</p>
                        <p className="text-[10px] text-[#8E8D8A]">Histórico e confirmações</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#E98074]" />
                  </button>

                  <button
                    id="dropdown-pac-agendar"
                    onClick={() => navigateToTab('paciente-tab-agendar')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F5F0] text-[#434343] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#F1F8E9] text-[#82954B]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#434343] group-hover:text-[#82954B]">Agendar Nova Consulta</p>
                        <p className="text-[10px] text-[#8E8D8A]">Escolher especialista e horário</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E8D8A] group-hover:text-[#82954B]" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Footer */}
        <div className="p-4 bg-[#F8F5F0] border-t border-[#E5E1D8] space-y-2">
          <button
            id="sidebar-footer-edit-profile-btn"
            onClick={() => { onOpenProfile(); onClose(); }}
            className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-[#EAE7DC] text-[#434343] border border-[#E5E1D8] flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-4 h-4 text-[#82954B]" />
            <span>Editar Meu Perfil</span>
          </button>

          <button
            id="sidebar-logout-btn"
            onClick={() => { logout(); onClose(); }}
            className="w-full py-2.5 px-3 rounded-xl bg-[#FDF0EE] hover:bg-[#FBE4E1] text-[#C62828] border border-[#F7C4BE] flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão (Sair)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
