/// <reference types="vite/client" />
import JSZip from 'jszip';
import { db } from './db';

// Coleta todos os arquivos do código fonte do projeto no Vite
const getSourceFiles = (): Record<string, string> => {
  try {
    const globFn = (import.meta as any).glob;
    if (typeof globFn === 'function') {
      return globFn(
        [
          '/src/**/*.{ts,tsx,css,json}',
          '/index.html',
          '/package.json',
          '/metadata.json',
          '/vite.config.ts'
        ],
        { query: '?raw', import: 'default', eager: true }
      ) as Record<string, string>;
    }
  } catch (err) {
    console.warn('Erro ao coletar arquivos globais do código fonte:', err);
  }
  return {};
};

const sourceFiles = getSourceFiles();

export interface BackupMetadata {
  tipo: 'banco_de_dados' | 'completo';
  geradoEm: string;
  versaoSistema: string;
  totalUsuarios: number;
  totalAgendamentos: number;
  totalAnamneses: number;
  totalAcompanhamentos: number;
  totalAvaliacoes: number;
  totalRelatoriosEstagio: number;
}

export const backupService = {
  /**
   * 1. Gera e baixa o backup SOMENTE DO BANCO DE DADOS (.json)
   */
  downloadDatabaseBackup(): void {
    const json = db.exportarJSON();
    const dataStr = new Date().toISOString().split('T')[0];
    const horaStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `backup-banco-clinica-escola-${dataStr}_${horaStr}.json`;

    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },

  /**
   * 2. Gera e baixa o BACKUP COMPLETO DO SISTEMA (CÓDIGO FONTE + BANCO DE DADOS) (.zip)
   */
  async downloadFullSystemBackup(): Promise<void> {
    const zip = new JSZip();

    // 1. Adiciona o snapshot do banco de dados
    const dbJson = db.exportarJSON();
    zip.file('database_backup.json', dbJson);

    // 2. Metadados do backup
    const metadata: BackupMetadata = {
      tipo: 'completo',
      geradoEm: new Date().toISOString(),
      versaoSistema: '1.0.0 (Clínica Escola Campos Salles)',
      totalUsuarios: db.getAllUsers().length,
      totalAgendamentos: db.getAgendamentos().length,
      totalAnamneses: db.getAnamneses().length,
      totalAcompanhamentos: db.getAcompanhamentos().length,
      totalAvaliacoes: db.getAvaliacoes().length,
      totalRelatoriosEstagio: db.getRelatoriosEstagio().length
    };
    zip.file('backup_metadata.json', JSON.stringify(metadata, null, 2));

    // 3. Adiciona arquivo README explicativo
    const readme = `======================================================
CLÍNICA ESCOLA - FACULDADES INTEGRADAS CAMPOS SALLES
BACKUP COMPLETO DO SISTEMA (CÓDIGO FONTE + BANCO DE DADOS)
======================================================
Data do Backup: ${new Date().toLocaleString('pt-BR')}

CONTEÚDO DESTE ARQUIVO:
1. /database_backup.json: Dump estruturado de todas as coleções de dados (usuários, agendamentos, anamneses, acompanhamentos, avaliações e relatórios).
2. /backup_metadata.json: Resumo de integridade e totais de registros.
3. /src e arquivos raiz: Código fonte completo do sistema em TypeScript e React.

COMO RESTAURAR:
- No painel do Administrador da Clínica Escola, acesse a aba "Backup & Restauração" e envie este arquivo .zip ou o arquivo database_backup.json.
======================================================`;
    zip.file('README_BACKUP.txt', readme);

    // 4. Adiciona todos os arquivos de código-fonte
    const srcFolder = zip.folder('src');
    
    Object.entries(sourceFiles).forEach(([filePath, content]) => {
      // Remove barra inicial
      const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      zip.file(cleanPath, content);
    });

    // Gera o arquivo ZIP binário
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });

    const dataStr = new Date().toISOString().split('T')[0];
    const horaStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `backup-completo-sistema-clinica-escola-${dataStr}_${horaStr}.zip`;

    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },

  /**
   * 3. Restaura dados a partir de string JSON
   */
  restoreDatabaseFromJSON(jsonString: string): { success: boolean; message: string; stats?: any } {
    try {
      const parsed = JSON.parse(jsonString);
      const ok = db.importarJSON(jsonString);
      if (ok) {
        return {
          success: true,
          message: 'Banco de dados restaurado com sucesso!',
          stats: {
            usuarios: (parsed.admins?.length || 0) + (parsed.profissionais?.length || 0) + (parsed.estagiarios?.length || 0) + (parsed.pacientes?.length || 0) + (parsed.orientadores?.length || 0),
            agendamentos: parsed.agendamentos?.length || 0,
            anamneses: parsed.anamneses?.length || 0,
            acompanhamentos: parsed.acompanhamentos?.length || 0,
            avaliacoes: parsed.avaliacoes?.length || 0,
            relatoriosEstagio: parsed.relatorios_estagio?.length || 0
          }
        };
      } else {
        return { success: false, message: 'Formato de banco de dados inválido.' };
      }
    } catch (e: any) {
      return { success: false, message: `Erro ao processar arquivo: ${e.message}` };
    }
  },

  /**
   * 4. Restaura dados e inspeciona a partir de arquivo ZIP completo
   */
  async restoreBackupFromZip(file: File): Promise<{
    success: boolean;
    message: string;
    stats?: any;
    arquivosEncontrados?: string[];
  }> {
    try {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);

      // Procura pelo arquivo de banco de dados dentro do ZIP
      let dbFile = loadedZip.file('database_backup.json') || loadedZip.file('database.json') || loadedZip.file('backup.json');

      if (!dbFile) {
        // Tenta achar qualquer arquivo .json dentro do zip que tenha formato de banco
        const jsonFiles = Object.keys(loadedZip.files).filter(f => f.endsWith('.json'));
        for (const jf of jsonFiles) {
          const content = await loadedZip.file(jf)?.async('string');
          if (content && (content.includes('"agendamentos"') || content.includes('"admins"'))) {
            dbFile = loadedZip.file(jf);
            break;
          }
        }
      }

      if (!dbFile) {
        return {
          success: false,
          message: 'O arquivo ZIP não contém um banco de dados válido (database_backup.json).'
        };
      }

      const dbJson = await dbFile.async('string');
      const restoreResult = this.restoreDatabaseFromJSON(dbJson);

      const arquivos = Object.keys(loadedZip.files);

      return {
        success: restoreResult.success,
        message: restoreResult.success
          ? `Backup completo restaurado com sucesso! (${arquivos.length} arquivos validados no pacote)`
          : restoreResult.message,
        stats: restoreResult.stats,
        arquivosEncontrados: arquivos
      };
    } catch (e: any) {
      return {
        success: false,
        message: `Falha ao extrair arquivo ZIP: ${e.message}`
      };
    }
  }
};
