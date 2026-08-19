import React, { useState, useRef } from 'react';
import { backupService } from '../services/backupService';
import { db } from '../services/db';
import { CamposSallesMonogram } from './CamposSallesLogo';
import {
  Download,
  Upload,
  Database,
  Archive,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  FileCode,
  Layers,
  ShieldCheck,
  FileText,
  HelpCircle
} from 'lucide-react';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'restaurar'>('backup');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string; stats?: any } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadDb = () => {
    try {
      backupService.downloadDatabaseBackup();
      setNotification({
        type: 'success',
        message: 'Backup do banco de dados gerado e baixado com sucesso (.json)!'
      });
    } catch (e: any) {
      setNotification({
        type: 'error',
        message: `Erro ao exportar banco: ${e.message}`
      });
    }
  };

  const handleDownloadFullSystem = async () => {
    setIsProcessing(true);
    setNotification(null);
    try {
      await backupService.downloadFullSystemBackup();
      setNotification({
        type: 'success',
        message: 'Backup completo do sistema (Código-Fonte + Banco de Dados) gerado e baixado com sucesso (.zip)!'
      });
    } catch (e: any) {
      setNotification({
        type: 'error',
        message: `Erro ao empacotar sistema: ${e.message}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setNotification(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setNotification(null);
    }
  };

  const handleExecuteRestore = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setNotification(null);

    try {
      const fileName = selectedFile.name.toLowerCase();
      if (fileName.endsWith('.zip')) {
        const result = await backupService.restoreBackupFromZip(selectedFile);
        if (result.success) {
          setNotification({
            type: 'success',
            message: result.message,
            stats: result.stats
          });
        } else {
          setNotification({
            type: 'error',
            message: result.message
          });
        }
      } else if (fileName.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const result = backupService.restoreDatabaseFromJSON(content);
          if (result.success) {
            setNotification({
              type: 'success',
              message: result.message,
              stats: result.stats
            });
          } else {
            setNotification({
              type: 'error',
              message: result.message
            });
          }
          setIsProcessing(false);
        };
        reader.readAsText(selectedFile);
        return;
      } else {
        setNotification({
          type: 'error',
          message: 'Formato inválido. Por favor, envie um arquivo .json ou .zip de backup.'
        });
      }
    } catch (e: any) {
      setNotification({
        type: 'error',
        message: `Erro durante a restauração: ${e.message}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetDefault = () => {
    if (window.confirm('Atenção: Deseja restaurar os dados para o padrão de fábrica da Clínica Escola? Todos os registros atuais serão substituídos pelos dados iniciais de demonstração.')) {
      db.resetToDefault();
      setNotification({
        type: 'success',
        message: 'Sistema restaurado para o padrão inicial de fábrica com sucesso!'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E5E1D8] shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E5E1D8] bg-[#F8F5F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CamposSallesMonogram size="sm" />
            <div>
              <h3 className="font-serif font-bold text-lg text-[#0A3B66]">
                Backup & Restauração do Sistema
              </h3>
              <p className="text-xs text-[#8E8D8A]">
                Gestão de segurança e cópias de segurança para o Administrador
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8E8D8A] hover:text-[#434343] hover:bg-[#EAE7DC] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#E5E1D8] bg-[#FDFBF7] p-1.5 gap-1.5">
          <button
            onClick={() => { setActiveTab('backup'); setNotification(null); }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-white text-[#0A3B66] shadow-xs border border-[#E5E1D8]'
                : 'text-[#5C5C5C] hover:text-[#0A3B66]'
            }`}
          >
            <Download className="w-4 h-4 text-[#82954B]" />
            Gerar Backup (Exportar)
          </button>
          <button
            onClick={() => { setActiveTab('restaurar'); setNotification(null); }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'restaurar'
                ? 'bg-white text-[#0A3B66] shadow-xs border border-[#E5E1D8]'
                : 'text-[#5C5C5C] hover:text-[#0A3B66]'
            }`}
          >
            <Upload className="w-4 h-4 text-[#0A3B66]" />
            Restaurar Backup (Importar)
          </button>
        </div>

        {/* Feedback Alert */}
        {notification && (
          <div className={`m-5 p-4 rounded-2xl border flex items-start gap-3 text-xs animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-[#F1F8E9] border-[#D0E3B6] text-[#82954B]'
              : 'bg-[#FDF0EE] border-[#F7C4BE] text-[#E98074]'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#82954B]" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#E98074]" />
            )}
            <div className="space-y-1">
              <p className="font-bold">{notification.message}</p>
              {notification.stats && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-[#D0E3B6] text-[11px] text-[#434343]">
                  <span>👥 Usuários: <strong>{notification.stats.usuarios}</strong></span>
                  <span>📅 Agendamentos: <strong>{notification.stats.agendamentos}</strong></span>
                  <span>📋 Anamneses: <strong>{notification.stats.anamneses}</strong></span>
                  <span>🩺 Acompanhamentos: <strong>{notification.stats.acompanhamentos}</strong></span>
                  <span>⭐ Avaliações: <strong>{notification.stats.avaliacoes}</strong></span>
                  <span>⏱️ Relatórios Horas: <strong>{notification.stats.relatoriosEstagio}</strong></span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {/* TAB 1: GERAR BACKUP */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <p className="text-xs text-[#5C5C5C]">
                Escolha a modalidade de backup desejada. Ambas garantem a integridade completa dos registros da Clínica Escola.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Option A: Somente Banco de Dados */}
                <div className="p-5 bg-[#F8F5F0] rounded-2xl border border-[#E5E1D8] flex flex-col justify-between space-y-4 hover:border-[#82954B] transition-colors">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-[#F1F8E9] border border-[#D0E3B6] flex items-center justify-center text-[#82954B]">
                      <Database className="w-5 h-5" />
                    </div>
                    <h4 className="font-serif font-bold text-sm text-[#434343]">
                      1. Somente Banco de Dados
                    </h4>
                    <p className="text-xs text-[#8E8D8A] leading-relaxed">
                      Gera um arquivo <strong>.JSON</strong> estruturado contendo todos os cadastros, prontuários, agendamentos, avaliações e horas de estágio.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadDb}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-4 bg-white hover:bg-[#82954B] hover:text-white text-[#82954B] border border-[#D0E3B6] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Banco de Dados (.JSON)
                  </button>
                </div>

                {/* Option B: Backup Completo (Código Fonte + Banco) */}
                <div className="p-5 bg-[#F8F5F0] rounded-2xl border border-[#E5E1D8] flex flex-col justify-between space-y-4 hover:border-[#0A3B66] transition-colors">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-[#E6F0FA] border border-[#B3D4F5] flex items-center justify-center text-[#0A3B66]">
                      <Archive className="w-5 h-5" />
                    </div>
                    <h4 className="font-serif font-bold text-sm text-[#434343]">
                      2. Backup Completo do Sistema
                    </h4>
                    <p className="text-xs text-[#8E8D8A] leading-relaxed">
                      Gera um pacote <strong>.ZIP</strong> contendo todo o <strong>código-fonte</strong> da aplicação (TypeScript/React) junto com o snapshot completo do banco de dados e metadados.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadFullSystem}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-4 bg-[#0A3B66] hover:bg-[#063860] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Archive className="w-4 h-4" />
                    {isProcessing ? 'Empacotando .ZIP...' : 'Baixar Sistema Completo (.ZIP)'}
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: RESTAURAR BACKUP */}
          {activeTab === 'restaurar' && (
            <div className="space-y-4">
              <p className="text-xs text-[#5C5C5C]">
                Envie o arquivo de backup <strong>(.JSON ou .ZIP)</strong> gerado anteriormente para restaurar o sistema:
              </p>

              {/* Upload Drop Area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-[#0A3B66] bg-[#E6F0FA]'
                    : selectedFile
                    ? 'border-[#82954B] bg-[#F1F8E9]'
                    : 'border-[#E5E1D8] bg-[#FDFBF7] hover:bg-[#F8F5F0]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.zip"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E1D8] flex items-center justify-center text-[#0A3B66] shadow-2xs">
                    {selectedFile ? (
                      <CheckCircle2 className="w-6 h-6 text-[#82954B]" />
                    ) : (
                      <Upload className="w-6 h-6 text-[#0A3B66]" />
                    )}
                  </div>

                  {selectedFile ? (
                    <div>
                      <p className="text-xs font-bold text-[#434343]">{selectedFile.name}</p>
                      <p className="text-[11px] text-[#8E8D8A]">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Clique para escolher outro arquivo
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-[#434343]">
                        Clique para selecionar ou arraste o arquivo de backup aqui
                      </p>
                      <p className="text-[11px] text-[#8E8D8A]">
                        Suporta arquivos .JSON (Banco de Dados) e .ZIP (Sistema Completo)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedFile && (
                <button
                  onClick={handleExecuteRestore}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-[#82954B] hover:bg-[#6F803E] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isProcessing ? 'Restaurando Registros...' : 'Confirmar e Restaurar Backup'}
                </button>
              )}

              {/* Reset to Default Data Option */}
              <div className="pt-3 border-t border-[#E5E1D8] flex items-center justify-between">
                <span className="text-[11px] text-[#8E8D8A]">
                  Deseja voltar para os dados padrão iniciais?
                </span>
                <button
                  onClick={handleResetDefault}
                  className="text-xs font-bold text-[#E98074] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restaurar Padrão de Fábrica
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8F5F0] border-t border-[#E5E1D8] flex items-center justify-between text-xs text-[#8E8D8A]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#82954B]" />
            Criptografia local e integridade garantida
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#EAE7DC] text-[#434343] rounded-xl border border-[#E5E1D8] font-bold cursor-pointer transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
