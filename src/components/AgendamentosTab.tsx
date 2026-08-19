import React, { useState, useMemo } from 'react';
import { db } from '../services/db';
import { Agendamento } from '../types';
import {
  Search,
  Filter,
  GraduationCap,
  Send
} from 'lucide-react';

export interface AgendamentosTabProps {
  agendamentos: Agendamento[];
  onRefresh: () => void;
  onAtribuirEstagiario: (agendamento: Agendamento) => void;
}

export const AgendamentosTab: React.FC<AgendamentosTabProps> = ({
  agendamentos,
  onRefresh,
  onAtribuirEstagiario
}) => {
  const [agendamentoStatusFilter, setAgendamentoStatusFilter] = useState<string>('todos');
  const [agendamentoSearch, setAgendamentoSearch] = useState<string>('');

  // Filtered Agendamentos with useMemo
  const filteredAgendamentos = useMemo(() => {
    return agendamentos.filter(a => {
      const matchesStatus = agendamentoStatusFilter === 'todos' || a.status === agendamentoStatusFilter;
      const searchLower = agendamentoSearch.toLowerCase();
      const matchesSearch =
        a.pacienteNome.toLowerCase().includes(searchLower) ||
        a.profissionalNome.toLowerCase().includes(searchLower) ||
        (a.estagiarioNome && a.estagiarioNome.toLowerCase().includes(searchLower)) ||
        a.data.includes(agendamentoSearch);
      return matchesStatus && matchesSearch;
    });
  }, [agendamentos, agendamentoStatusFilter, agendamentoSearch]);

  const handleDispararLembrete = (agendamentoId: string) => {
    try {
      const notif = db.dispararLembrete1DiaAntes(agendamentoId);
      if (notif.whatsappUrl) {
        window.open(notif.whatsappUrl, '_blank');
      }
      alert('Lembrete enviado com sucesso! Registro adicionado à auditoria.');
      onRefresh();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleMarcarConcluido = (id: string) => {
    db.atualizarStatusAgendamento(id, 'concluido');
    onRefresh();
  };

  const handleCancelarAgendamento = (id: string) => {
    db.cancelarAgendamento(id);
    onRefresh();
  };

  const getStatusBadge = (status: Agendamento['status']) => {
    switch (status) {
      case 'agendado':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF8E1] text-[#B58D3D] border border-[#FFE082]">Aguardando</span>;
      case 'confirmado':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]">Confirmado</span>;
      case 'concluido':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E3F2FD] text-[#1565C0] border border-[#90CAF9]">Concluído</span>;
      case 'cancelado':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]">Cancelado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#FDFBF7] border border-[#E5E1D8] rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-[#434343]">Central de Agendamentos & Consultórios</h2>
          <p className="text-xs text-[#8E8D8A]">Controle geral das consultas, confirmações de presença e alocações de salas.</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8E8D8A] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por paciente, profissional ou data..."
            value={agendamentoSearch}
            onChange={(e) => setAgendamentoSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#8E8D8A]" />
          <select
            value={agendamentoStatusFilter}
            onChange={(e) => setAgendamentoStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B]"
          >
            <option value="todos">Todos os Status</option>
            <option value="agendado">Aguardando Confirmação</option>
            <option value="confirmado">Confirmados</option>
            <option value="concluido">Concluídos</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Agendamentos List */}
      <div className="space-y-3">
        {filteredAgendamentos.map(a => (
          <div
            key={a.id}
            className="bg-[#F8F5F0] border border-[#E5E1D8] p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#434343]">{a.pacienteNome}</span>
                {getStatusBadge(a.status)}
                <span className="text-[10px] bg-[#EAE7DC] text-[#5C5C5C] px-2 py-0.5 rounded">
                  {a.modalidade}
                </span>
              </div>
              <p className="text-[#5C5C5C]">
                👩‍⚕️ <strong>Profissional:</strong> {a.profissionalNome} ({a.profissionalEspecialidade})
              </p>
              {a.estagiarioNome && (
                <p className="text-[#5C5C5C]">
                  🎓 <strong>Estagiário:</strong> {a.estagiarioNome}
                </p>
              )}
              <p className="text-[#8E8D8A]">
                📅 <strong>Data/Hora:</strong> {a.data} às {a.horario} • 📍 {a.sala}
              </p>
              <p className="text-[#8E8D8A] italic">
                Motivo: "{a.motivoConsulta}"
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onAtribuirEstagiario(a)}
                className="px-3 py-1.5 rounded-lg bg-[#F8F5F0] hover:bg-[#EAE7DC] text-[#434343] font-medium border border-[#E5E1D8] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Atribuir ou alterar estagiário acadêmico nesta sessão"
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#82954B]" />
                {a.estagiarioNome ? 'Trocar Estagiário' : 'Atribuir Estagiário'}
              </button>

              <button
                onClick={() => handleDispararLembrete(a.id)}
                className="px-3 py-1.5 rounded-lg bg-[#82954B] hover:bg-[#6F803E] text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Lembrete WhatsApp
              </button>
              {a.status !== 'concluido' && (
                <button
                  onClick={() => handleMarcarConcluido(a.id)}
                  className="px-3 py-1.5 rounded-lg bg-[#FDFBF7] border border-[#E5E1D8] text-[#2E7D32] hover:bg-[#E8F5E9] font-medium transition-colors cursor-pointer"
                >
                  Marcar Concluído
                </button>
              )}
              {a.status !== 'cancelado' && (
                <button
                  onClick={() => handleCancelarAgendamento(a.id)}
                  className="px-3 py-1.5 rounded-lg bg-[#FDFBF7] border border-[#E5E1D8] text-[#C62828] hover:bg-[#FFEBEE] font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
