import React, { useState, useMemo } from 'react';
import { db } from '../services/db';
import {
  AppUser,
  UserRole,
  ProfissionalUser,
  EstagiarioUser,
  PacienteUser,
  OrientadorUser,
  AdminUser
} from '../types';
import { UserAvatar } from './UserAvatar';
import {
  Shield,
  Stethoscope,
  GraduationCap,
  HeartHandshake,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  CheckCircle2
} from 'lucide-react';

export interface UsersTabProps {
  users: AppUser[];
  currentUser: AppUser | null;
  onEditUser: (user: AppUser) => void;
  onDeleteUser: (user: AppUser) => void;
  onOpenAddUser?: () => void;
  onRefresh?: () => void;
}

export const UsersTab: React.FC<UsersTabProps> = ({
  users,
  currentUser,
  onEditUser,
  onDeleteUser,
  onOpenAddUser,
  onRefresh
}) => {
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('todos');

  const totalUsers = users.length;
  const totalProfissionais = users.filter(u => u.role === 'profissional').length;
  const totalEstagiarios = users.filter(u => u.role === 'estagiario').length;
  const totalPacientes = users.filter(u => u.role === 'paciente').length;
  const totalOrientadores = users.filter(u => u.role === 'orientador').length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesRole = userRoleFilter === 'todos' || u.role === userRoleFilter;
      const matchesSearch =
        u.nome.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        ((u as any).numeroProntuario ? (u as any).numeroProntuario.toLowerCase().includes(userSearchTerm.toLowerCase()) : false) ||
        (u.telefone ? u.telefone.includes(userSearchTerm) : false);
      return matchesRole && matchesSearch;
    });
  }, [users, userRoleFilter, userSearchTerm]);

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

  return (
    <div className="bg-[#FDFBF7] border border-[#E5E1D8] rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-[#434343]">Controle de Usuários e Perfis</h2>
          <p className="text-xs text-[#8E8D8A]">Gerencie profissionais, estagiários, pacientes, orientadores e administradores.</p>
        </div>

        {onOpenAddUser && (
          <button
            id="btn-add-user-tab"
            onClick={onOpenAddUser}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#82954B] hover:bg-[#6F803E] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Novo Usuário
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8E8D8A] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#8E8D8A]" />
          <select
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B]"
          >
            <option value="todos">Todos os Perfis ({totalUsers})</option>
            <option value="admin">Administrador ({totalAdmins})</option>
            <option value="profissional">Profissional ({totalProfissionais})</option>
            <option value="estagiario">Estagiário ({totalEstagiarios})</option>
            <option value="paciente">Paciente ({totalPacientes})</option>
            <option value="orientador">Orientador ({totalOrientadores})</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E1D8]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8F5F0] border-b border-[#E5E1D8] text-[#5C5C5C] font-semibold">
            <tr>
              <th className="p-3">Usuário</th>
              <th className="p-3">Perfil / Cargo</th>
              <th className="p-3">Documento / Info</th>
              <th className="p-3">Contato</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E1D8] bg-[#FDFBF7]">
            {filteredUsers.map(u => (
              <tr key={u.id} className="hover:bg-[#F8F5F0]/60 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      src={u.foto}
                      alt={u.nome}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-[#D8D2C2]"
                    />
                    <div>
                      <p className="font-bold text-[#434343]">{u.nome}</p>
                      <p className="text-[#8E8D8A] text-[11px]">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div>
                    {getRoleBadge(u.role)}
                    {u.role === 'admin' && (u as AdminUser).cargo && (
                      <p className="text-[11px] text-[#5C5C5C] mt-1">{(u as AdminUser).cargo}</p>
                    )}
                    {u.role === 'profissional' && (
                      <div className="mt-1 space-y-1">
                        <p className="text-[11px] text-[#5C5C5C]">{(u as ProfissionalUser).especialidade}</p>
                        {(u as ProfissionalUser).aprovado === false ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
                            🔒 Aguardando Habilitação
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ Acesso Liberado
                          </span>
                        )}
                      </div>
                    )}
                    {u.role === 'estagiario' && (
                      <p className="text-[11px] text-[#5C5C5C] mt-1">{(u as EstagiarioUser).turma}</p>
                    )}
                  </div>
                </td>
                <td className="p-3 text-[#5C5C5C]">
                  {u.role === 'profissional' && (
                    <span>CRP: {(u as ProfissionalUser).crp}</span>
                  )}
                  {u.role === 'estagiario' && (
                    <span>CPF: {(u as EstagiarioUser).cpf}</span>
                  )}
                  {u.role === 'paciente' && (
                    <div>
                      <p className="font-mono font-bold text-[#82954B] bg-[#F1F8E9] px-2 py-0.5 rounded-md inline-block border border-[#D0E3B6] mb-1">
                        {(u as PacienteUser).numeroProntuario || 'PSI-2026/0001'}
                      </p>
                      <p>CPF: {(u as PacienteUser).cpf}</p>
                      <p className="text-[11px] text-[#8E8D8A]">{(u as PacienteUser).profissao || 'Paciente'}</p>
                    </div>
                  )}
                  {u.role === 'orientador' && (
                    <span>CPF: {(u as OrientadorUser).cpf}</span>
                  )}
                  {u.role === 'admin' && (
                    <span>{(u as AdminUser).departamento || 'Geral'}</span>
                  )}
                </td>
                <td className="p-3 text-[#5C5C5C]">
                  <p className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#82954B]" /> {u.telefone}
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-[#8E8D8A] mt-0.5">
                    <Mail className="w-3 h-3" /> Login: {u.login}
                  </p>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {u.role === 'profissional' && (u as ProfissionalUser).aprovado === false && (
                      <button
                        onClick={() => {
                          db.aprovarProfissional(u.id, currentUser?.nome || 'Admin');
                          onRefresh?.();
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer mr-1"
                        title="Habilitar acesso do profissional"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Habilitar
                      </button>
                    )}
                    <button
                      onClick={() => onEditUser(u)}
                      className="p-1.5 rounded-lg text-[#82954B] hover:bg-[#F1F8E9] transition-colors cursor-pointer"
                      title="Editar cadastro completo (Admin)"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteUser(u)}
                      disabled={u.role === 'admin' || u.id === currentUser?.id}
                      className={`p-1.5 rounded-lg text-[#E98074] hover:bg-[#FDF0EE] transition-colors cursor-pointer ${
                        (u.role === 'admin' || u.id === currentUser?.id) ? 'opacity-20 cursor-not-allowed' : ''
                      }`}
                      title={u.role === 'admin' ? 'Usuário Administrador não pode ser excluído' : (u.id === currentUser?.id ? 'Seu usuário' : 'Excluir usuário')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
