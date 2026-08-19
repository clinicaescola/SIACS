import React, { useMemo } from 'react';
import {
  AppUser,
  Agendamento,
  Anamnese,
  Acompanhamento,
  Avaliacao,
  UserRole
} from '../types';
import { UserAvatar } from './UserAvatar';
import {
  Users,
  Calendar,
  FileText,
  Star,
  Clock,
  UserCheck,
  Shield,
  Stethoscope,
  GraduationCap,
  HeartHandshake
} from 'lucide-react';

export interface OverviewTabProps {
  users: AppUser[];
  agendamentos: Agendamento[];
  anamneses: Anamnese[];
  acompanhamentos: Acompanhamento[];
  avaliacoes: Avaliacao[];
  onChangeTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  users,
  agendamentos,
  anamneses,
  acompanhamentos,
  avaliacoes,
  onChangeTab
}) => {
  // Stats Calculations with useMemo for performance
  const {
    totalUsers,
    totalProfissionais,
    totalEstagiarios,
    totalPacientes,
    totalAgendados,
    concluidosCount,
    confirmadosCount,
    canceladosCount,
    avgRating
  } = useMemo(() => {
    const tUsers = users.length;
    const tProf = users.filter(u => u.role === 'profissional').length;
    const tEst = users.filter(u => u.role === 'estagiario').length;
    const tPac = users.filter(u => u.role === 'paciente').length;

    const tAgendados = agendamentos.length;
    const concluidos = agendamentos.filter(a => a.status === 'concluido').length;
    const confirmados = agendamentos.filter(a => a.status === 'confirmado' || a.confirmadoPeloPaciente).length;
    const cancelados = agendamentos.filter(a => a.status === 'cancelado').length;

    const rating = avaliacoes.length > 0
      ? (avaliacoes.reduce((acc, curr) => acc + curr.notaGeral, 0) / avaliacoes.length).toFixed(1)
      : '5.0';

    return {
      totalUsers: tUsers,
      totalProfissionais: tProf,
      totalEstagiarios: tEst,
      totalPacientes: tPac,
      totalAgendados: tAgendados,
      concluidosCount: concluidos,
      confirmadosCount: confirmados,
      canceladosCount: cancelados,
      avgRating: rating
    };
  }, [users, agendamentos, avaliacoes]);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EDE8F5] text-[#5E35B1] border border-[#D1C4E9]">
            <Shield className="w-3 h-3" /> Administrador
          </span>
        );
      case 'profissional':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]">
            <Stethoscope className="w-3 h-3" /> Profissional
          </span>
        );
      case 'estagiario':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5EBE6] text-[#A37B75] border border-[#E5D2CB]">
            <GraduationCap className="w-3 h-3" /> Estagiário
          </span>
        );
      case 'paciente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FDF0EE] text-[#E98074] border border-[#F7C4BE]">
            <HeartHandshake className="w-3 h-3" /> Paciente
          </span>
        );
      case 'orientador':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FBF4E6] text-[#B58D3D] border border-[#EED9B0]">
            <Shield className="w-3 h-3" /> Orientador
          </span>
        );
      default:
        return null;
    }
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
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FDFBF7] border border-[#E5E1D8] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8E8D8A]">Total Usuários</span>
            <Users className="w-5 h-5 text-[#82954B]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#434343]">{totalUsers}</span>
            <span className="text-xs text-[#8E8D8A]">cadastros ativos</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-[#5C5C5C]">
            <span className="bg-[#F1F8E9] text-[#82954B] px-1.5 py-0.5 rounded font-medium">{totalProfissionais} Profissionais</span>
            <span className="bg-[#F5EBE6] text-[#A37B75] px-1.5 py-0.5 rounded font-medium">{totalEstagiarios} Estagiários</span>
            <span className="bg-[#FDF0EE] text-[#E98074] px-1.5 py-0.5 rounded font-medium">{totalPacientes} Pacientes</span>
          </div>
        </div>

        <div className="bg-[#FDFBF7] border border-[#E5E1D8] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8E8D8A]">Atendimentos</span>
            <Calendar className="w-5 h-5 text-[#B58D3D]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#434343]">{totalAgendados}</span>
            <span className="text-xs text-[#2E7D32] font-semibold">{concluidosCount} concluídos</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#8E8D8A]">
            <span>{confirmadosCount} confirmados</span>
            <span>{canceladosCount} cancelados</span>
          </div>
        </div>

        <div className="bg-[#FDFBF7] border border-[#E5E1D8] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8E8D8A]">Prontuários & Sessões</span>
            <FileText className="w-5 h-5 text-[#A37B75]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#434343]">{anamneses.length}</span>
            <span className="text-xs text-[#8E8D8A]">anamneses registradas</span>
          </div>
          <div className="mt-3 text-xs text-[#5C5C5C]">
            <strong>{acompanhamentos.length}</strong> evoluções clínicas anexadas
          </div>
        </div>

        <div className="bg-[#FDFBF7] border border-[#E5E1D8] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8E8D8A]">Satisfação Clínica</span>
            <Star className="w-5 h-5 text-[#E98074] fill-[#E98074]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#434343]">{avgRating}</span>
            <span className="text-xs text-[#8E8D8A]">/ 5.0 estrelas</span>
          </div>
          <div className="mt-3 text-xs text-[#5C5C5C]">
            Baseado em <strong>{avaliacoes.length}</strong> avaliações de pacientes
          </div>
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Agendamentos */}
        <div className="bg-[#FDFBF7] border border-[#E5E1D8] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-lg text-[#434343] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#82954B]" />
              Próximos Atendimentos na Clínica
            </h3>
            <button
              onClick={() => onChangeTab('agendamentos')}
              className="text-xs font-semibold text-[#82954B] hover:underline cursor-pointer"
            >
              Ver todos ({totalAgendados})
            </button>
          </div>

          <div className="space-y-3">
            {agendamentos.slice(0, 4).map(a => (
              <div
                key={a.id}
                className="p-3 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-bold text-[#434343]">{a.pacienteNome}</p>
                  <p className="text-[#5C5C5C]">
                    {a.profissionalNome} {a.estagiarioNome ? `• Estágio: ${a.estagiarioNome}` : ''}
                  </p>
                  <p className="text-[#8E8D8A] mt-0.5">
                    📅 {a.data} às {a.horario} • {a.sala}
                  </p>
                </div>
                <div>
                  {getStatusBadge(a.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Registered Users Summary */}
        <div className="bg-[#FDFBF7] border border-[#E5E1D8] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-lg text-[#434343] flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#B58D3D]" />
              Equipe & Usuários Recentes
            </h3>
            <button
              onClick={() => onChangeTab('users')}
              className="text-xs font-semibold text-[#82954B] hover:underline cursor-pointer"
            >
              Gerenciar Usuários ({totalUsers})
            </button>
          </div>

          <div className="space-y-3">
            {users.slice(0, 4).map(u => (
              <div
                key={u.id}
                className="p-3 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar
                    src={u.foto}
                    alt={u.nome}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-[#D8D2C2]"
                  />
                  <div>
                    <p className="font-bold text-[#434343]">{u.nome}</p>
                    <p className="text-[#5C5C5C]">{u.email}</p>
                  </div>
                </div>
                <div>
                  {getRoleBadge(u.role)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
