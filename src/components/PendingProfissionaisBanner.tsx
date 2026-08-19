import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { ProfissionalUser, AppUser } from '../types';
import { UserAvatar } from './UserAvatar';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Clock,
  Mail,
  Phone,
  ShieldAlert,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface PendingProfissionaisBannerProps {
  currentUser: AppUser | null;
  onUpdate?: () => void;
}

export const PendingProfissionaisBanner: React.FC<PendingProfissionaisBannerProps> = ({
  currentUser,
  onUpdate
}) => {
  const [pendentes, setPendentes] = useState<ProfissionalUser[]>([]);
  const [expanded, setExpanded] = useState<boolean>(true);
  const [actionSuccess, setActionSuccess] = useState<string>('');

  const refresh = () => {
    const list = db.getProfissionaisPendentes();
    setPendentes(list);
  };

  useEffect(() => {
    refresh();
    return db.subscribe(refresh);
  }, []);

  const handleAprovar = (prof: ProfissionalUser) => {
    const aprovador = currentUser ? `${currentUser.nome} (${currentUser.role === 'admin' ? 'Administrador' : 'Orientador'})` : 'Coordenação';
    const ok = db.aprovarProfissional(prof.id, aprovador);
    if (ok) {
      setActionSuccess(`O acesso do profissional "${prof.nome}" foi HABILITADO com sucesso! Agora ele já pode efetuar login.`);
      setTimeout(() => setActionSuccess(''), 5000);
      refresh();
      if (onUpdate) onUpdate();
    }
  };

  const handleRejeitar = (prof: ProfissionalUser) => {
    if (window.confirm(`Deseja realmente recusar e remover o cadastro pendente do profissional "${prof.nome}"?`)) {
      db.deleteUser(prof.id);
      setActionSuccess(`Cadastro de "${prof.nome}" foi removido do sistema.`);
      setTimeout(() => setActionSuccess(''), 5000);
      refresh();
      if (onUpdate) onUpdate();
    }
  };

  if (pendentes.length === 0 && !actionSuccess) {
    return null;
  }

  if (pendentes.length === 0 && actionSuccess) {
    return (
      <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
        <button onClick={() => setActionSuccess('')} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
      </div>
    );
  }

  return (
    <div
      id="banner-habilitacao-profissionais"
      className="relative overflow-hidden rounded-2xl border-2 border-amber-500/80 bg-linear-to-r from-amber-500/10 via-red-500/10 to-amber-500/10 p-5 shadow-md shadow-amber-500/10 space-y-4"
    >
      {/* Flashing Top Ribbon / Alert Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Flashing Pulse Badge */}
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <div className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-600 text-white shadow-xs">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base text-red-950 flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                SOLICITAÇÃO DE HABILITAÇÃO DE PROFISSIONAL NO SISTEMA
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white animate-bounce">
                {pendentes.length} {pendentes.length === 1 ? 'Pendente' : 'Pendentes'}
              </span>
            </div>
            <p className="text-xs text-amber-950/80 mt-0.5">
              Novo(s) profissional(is) se cadastrou(aram) na plataforma. Por segurança, o acesso ao login permanece <strong>bloqueado</strong> até que você realize a liberação/habilitação abaixo:
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="self-start sm:self-center px-3 py-1.5 bg-white/80 hover:bg-white text-xs font-bold text-[#434343] rounded-xl border border-amber-300 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Ocultar Detalhes
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              Ver Profissionais ({pendentes.length})
            </>
          )}
        </button>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-100/90 border border-emerald-300 text-emerald-900 px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>✓ {actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Expanded list of pending professionals */}
      {expanded && (
        <div className="space-y-3 pt-1">
          {pendentes.map((prof) => (
            <div
              key={prof.id}
              className="bg-white/95 backdrop-blur-xs rounded-xl p-4 border border-amber-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-amber-400"
            >
              <div className="flex items-center gap-3.5">
                <UserAvatar
                  src={prof.foto}
                  alt={prof.nome}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-400/50 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif font-bold text-sm text-[#434343]">{prof.nome}</span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-700 animate-spin" />
                      Aguardando Liberação
                    </span>
                    {prof.crp && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        CRP: {prof.crp}
                      </span>
                    )}
                    {prof.crm && prof.crm !== 'CRM-PENDENTE' && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        CRM: {prof.crm}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#5C5C5C] mt-1">
                    <strong>Especialidade:</strong> {prof.especialidade || 'Psicologia Clínica'}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-[#8E8D8A] mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-amber-600" />
                      {prof.email}
                    </span>
                    {prof.telefone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-amber-600" />
                        {prof.telefone}
                      </span>
                    )}
                    <span>
                      Cadastrado em: {new Date(prof.criadoEm).toLocaleDateString('pt-BR')} às {new Date(prof.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  id={`btn-aprovar-prof-${prof.id}`}
                  onClick={() => handleAprovar(prof)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ring-2 ring-emerald-400/40"
                  title="Liberar e autorizar o login do profissional no sistema"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Habilitar no Sistema
                </button>
                <button
                  id={`btn-rejeitar-prof-${prof.id}`}
                  onClick={() => handleRejeitar(prof)}
                  className="px-3 py-2.5 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 text-xs font-bold rounded-xl border border-red-200 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                  title="Recusar cadastro do profissional"
                >
                  <XCircle className="w-4 h-4" />
                  Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
