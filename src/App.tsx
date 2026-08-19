import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { AppSidebar } from './components/AppSidebar';
import { AppHeader } from './components/AppHeader';
import { AdminView } from './components/AdminView';
import { ProfissionalView } from './components/ProfissionalView';
import { PacienteView } from './components/PacienteView';
import { EstagiarioView } from './components/EstagiarioView';
import { OrientadorView } from './components/OrientadorView';
import { NotificationDrawer } from './components/NotificationDrawer';
import { EditProfileModal } from './components/EditProfileModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { RelatorioAtendimentosModal } from './components/RelatorioAtendimentosModal';
import { AnamnesePsicologiaPrintModal } from './components/AnamnesePsicologiaPrintModal';
import { AcompanhamentoPrintModal } from './components/AcompanhamentoPrintModal';

const MainAppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [isRelatorioModalOpen, setIsRelatorioModalOpen] = useState<boolean>(false);
  const [isAnamnesePrintModalOpen, setIsAnamnesePrintModalOpen] = useState<boolean>(false);
  const [isAcompanhamentoPrintModalOpen, setIsAcompanhamentoPrintModalOpen] = useState<boolean>(false);

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex font-sans text-[#434343]">
      
      {/* 1. Coluna Esquerda: Menu Lateral Fixo (Frame de 2 Colunas) */}
      <AppSidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onOpenRelatorio={() => setIsRelatorioModalOpen(true)}
        onOpenAnamnesePrint={() => setIsAnamnesePrintModalOpen(true)}
        onOpenAcompanhamentoPrint={() => setIsAcompanhamentoPrintModalOpen(true)}
      />

      {/* 2. Coluna Direita: Conteúdo Principal do Sistema */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Header */}
        <AppHeader
          onToggleMobileMenu={() => setIsMobileSidebarOpen(prev => !prev)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Main View Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {currentUser.role === 'admin' && <AdminView />}
          {currentUser.role === 'profissional' && <ProfissionalView />}
          {currentUser.role === 'paciente' && <PacienteView />}
          {currentUser.role === 'estagiario' && <EstagiarioView />}
          {currentUser.role === 'orientador' && <OrientadorView />}
        </main>

        {/* Footer */}
        <footer className="bg-[#F8F5F0] border-t border-[#E5E1D8] py-4 text-center text-xs text-[#8E8D8A] mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="font-medium text-[#5C5C5C]">
              <strong className="font-black text-[#033B6C]">SIACS</strong> • Sistema Integrado de Agendamento Campos Salles
            </p>
            <p className="text-[#62A032] font-semibold">
              Faculdade Campos Salles • Eficiência e Organização
            </p>
          </div>
        </footer>

      </div>

      {/* Modais Globais do Sistema */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />

      <RelatorioAtendimentosModal
        isOpen={isRelatorioModalOpen}
        onClose={() => setIsRelatorioModalOpen(false)}
        orientadorNome={currentUser?.nome || 'Orientador Docente'}
      />

      {/* Formulário Imprimível de Anamnese Psicológica (Apenas Não-Pacientes) */}
      {currentUser.role !== 'paciente' && (
        <>
          <AnamnesePsicologiaPrintModal
            isOpen={isAnamnesePrintModalOpen}
            onClose={() => setIsAnamnesePrintModalOpen(false)}
          />
          <AcompanhamentoPrintModal
            isOpen={isAcompanhamentoPrintModalOpen}
            onClose={() => setIsAcompanhamentoPrintModalOpen(false)}
          />
        </>
      )}

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
