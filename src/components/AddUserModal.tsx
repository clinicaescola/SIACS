import React, { useState, useRef } from 'react';
import { db } from '../services/db';
import {
  UserRole,
  HorarioDisponivel,
  DisponibilidadeEstagiario
} from '../types';
import { SAD_AVATAR_DATA_URI } from '../utils/avatar';
import { MultiDateSchedulePicker, TimeSlot } from './MultiDateSchedulePicker';
import {
  Plus,
  Camera,
  Upload,
  Link,
  X
} from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated
}) => {
  const [newUserRole, setNewUserRole] = useState<UserRole>('profissional');
  const [adminFotoMode, setAdminFotoMode] = useState<'upload' | 'url'>('upload');
  const adminFileInputRef = useRef<HTMLInputElement>(null);

  // Multi-date & time state for Admin modal
  const [adminProfDatas, setAdminProfDatas] = useState<string[]>([]);
  const [adminProfHorarios, setAdminProfHorarios] = useState<TimeSlot[]>([]);
  const [adminEstDatas, setAdminEstDatas] = useState<string[]>([]);
  const [adminEstHorarios, setAdminEstHorarios] = useState<TimeSlot[]>([]);
  const [adminEstObs, setAdminEstObs] = useState<string>('');

  const [newUserData, setNewUserData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '123',
    foto: '',
    // Profissional
    crp: '',
    especialidade: '',
    // Estagiário
    cpf: '',
    turma: '',
    // Paciente
    endereco: '',
    dataNascimento: '',
    profissao: '',
    estadoCivil: 'Solteiro(a)',
    // Orientador
    departamento: '',
    // Admin
    cargo: ''
  });

  if (!isOpen) return null;

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.nome || !newUserData.email || !newUserData.telefone) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const allUsers = db.getAllUsers();
    const normalizedEmail = newUserData.email.trim().toLowerCase();

    // Validação de E-mail Único (indiferente do tipo de acesso)
    const emailExistente = allUsers.some(u =>
      u.email.trim().toLowerCase() === normalizedEmail ||
      u.login.trim().toLowerCase() === normalizedEmail
    );
    if (emailExistente) {
      alert(`O e-mail "${newUserData.email}" já está cadastrado no sistema (indiferente do tipo de acesso). Não é permitido cadastrar e-mails duplicados.`);
      return;
    }

    // Validação de CPF Único (indiferente do tipo de acesso)
    if (newUserData.cpf) {
      const cleanCpf = String(newUserData.cpf).replace(/\D/g, '');
      if (cleanCpf.length > 0) {
        const cpfExistente = allUsers.some(u => {
          const existingCpf = (u as any).cpf ? String((u as any).cpf).replace(/\D/g, '') : '';
          return existingCpf.length > 0 && existingCpf === cleanCpf;
        });
        if (cpfExistente) {
          alert(`O CPF informado (${newUserData.cpf}) já está cadastrado no sistema (indiferente do tipo de acesso). Não é permitido cadastrar CPFs repetidos.`);
          return;
        }
      }
    }

    try {
      const createdUser = db.registerUser({
        ...newUserData,
        role: newUserRole
      });

      let extraMsg = '';

      if (newUserRole === 'profissional' && adminProfDatas.length > 0 && adminProfHorarios.length > 0) {
        const slotsToCreate: Array<Omit<HorarioDisponivel, 'id' | 'status'>> = [];
        for (const d of adminProfDatas) {
          for (const h of adminProfHorarios) {
            slotsToCreate.push({
              profissionalId: createdUser.id,
              profissionalNome: createdUser.nome,
              especialidade: (createdUser as any).especialidade || newUserData.especialidade,
              data: d,
              horaInicio: h.horaInicio,
              horaFim: h.horaFim
            });
          }
        }
        if (slotsToCreate.length > 0) {
          db.addMultipleHorarios(slotsToCreate);
          extraMsg = ` e ${slotsToCreate.length} horários criados na agenda`;
        }
      }

      if (newUserRole === 'estagiario' && adminEstDatas.length > 0 && adminEstHorarios.length > 0) {
        const dispsToCreate: Array<Omit<DisponibilidadeEstagiario, 'id' | 'status'>> = [];
        for (const d of adminEstDatas) {
          for (const h of adminEstHorarios) {
            dispsToCreate.push({
              estagiarioId: createdUser.id,
              estagiarioNome: createdUser.nome,
              turma: (createdUser as any).turma || newUserData.turma,
              data: d,
              horaInicio: h.horaInicio,
              horaFim: h.horaFim,
              observacoes: adminEstObs || 'Disponibilidade de estágio informada no cadastro'
            });
          }
        }
        if (dispsToCreate.length > 0) {
          db.addMultipleDispEstagiarios(dispsToCreate);
          extraMsg = ` e ${dispsToCreate.length} turnos de disponibilidade cadastrados`;
        }
      }

      alert(`Usuário "${newUserData.nome}" cadastrado com sucesso no perfil ${newUserRole.toUpperCase()}${extraMsg}!`);
      onUserCreated();
      onClose();

      // Reset Form
      setNewUserData({
        nome: '',
        email: '',
        telefone: '',
        senha: '123',
        foto: '',
        crp: '',
        especialidade: '',
        cpf: '',
        turma: '',
        endereco: '',
        dataNascimento: '',
        profissao: '',
        estadoCivil: 'Solteiro(a)',
        departamento: '',
        cargo: ''
      });
      setAdminProfDatas([]);
      setAdminProfHorarios([]);
      setAdminEstDatas([]);
      setAdminEstHorarios([]);
      setAdminEstObs('');
    } catch (err: any) {
      alert('Erro ao cadastrar usuário: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FDFBF7] border border-[#E5E1D8] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D8]">
          <h3 className="font-serif font-bold text-lg text-[#434343] flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#82954B]" />
            Cadastrar Usuário no Sistema
          </h3>
          <button
            onClick={onClose}
            className="text-[#8E8D8A] hover:text-[#434343] text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs">
          {/* Role Selection */}
          <div>
            <label className="block font-semibold text-[#434343] mb-1">Perfil do Novo Usuário:</label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] font-medium"
            >
              <option value="admin">Administrador da Clínica</option>
              <option value="profissional">Profissional (Psicólogo / Terapeuta)</option>
              <option value="estagiario">Estagiário de Psicologia</option>
              <option value="paciente">Paciente (Cliente)</option>
              <option value="orientador">Orientador de Estágio</option>
            </select>
          </div>

          {/* Photo Upload Section */}
          <div className="p-3 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#434343] flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#82954B]" />
                Foto de Perfil
              </label>
              <div className="flex items-center gap-1 bg-[#EDEAE3] p-0.5 rounded-lg text-[10px]">
                <button
                  type="button"
                  onClick={() => setAdminFotoMode('upload')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                    adminFotoMode === 'upload' ? 'bg-white text-[#434343] shadow-xs' : 'text-[#8E8D8A]'
                  }`}
                >
                  Arquivo
                </button>
                <button
                  type="button"
                  onClick={() => setAdminFotoMode('url')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                    adminFotoMode === 'url' ? 'bg-white text-[#434343] shadow-xs' : 'text-[#8E8D8A]'
                  }`}
                >
                  Link / URL
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group shrink-0">
                <div className="w-12 h-12 rounded-full bg-[#F4EBE6] border-2 border-white shadow-xs overflow-hidden flex items-center justify-center">
                  {newUserData.foto ? (
                    <img
                      src={newUserData.foto}
                      alt="Pré-visualização"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={SAD_AVATAR_DATA_URI}
                      alt="Sem foto (rostinho triste)"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                {newUserData.foto ? (
                  <button
                    type="button"
                    onClick={() => setNewUserData({ ...newUserData, foto: '' })}
                    className="absolute -top-1 -right-1 bg-[#E98074] text-white rounded-full p-0.5 shadow-xs hover:bg-[#d46a5e] cursor-pointer"
                    title="Remover foto"
                  >
                    <X className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="absolute -bottom-1 -right-1 bg-[#EAE7DC] text-[#7D716A] text-[9px] font-bold px-1 rounded-full border border-[#D8D2C2]" title="Rostinho triste padrão">
                    ☹️
                  </span>
                )}
              </div>

              <div className="flex-1 text-xs">
                {adminFotoMode === 'upload' ? (
                  <div>
                    <input
                      type="file"
                      ref={adminFileInputRef}
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setNewUserData({ ...newUserData, foto: reader.result });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => adminFileInputRef.current?.click()}
                      className="w-full py-1.5 px-3 bg-white border border-[#E5E1D8] hover:bg-[#EDEAE3] rounded-lg text-xs font-semibold text-[#5C5C5C] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#82954B]" />
                      {newUserData.foto ? 'Trocar Foto...' : 'Carregar Imagem'}
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Link className="w-3.5 h-3.5 text-[#8E8D8A] absolute left-2.5 top-2" />
                    <input
                      type="url"
                      placeholder="https://exemplo.com/foto.jpg"
                      value={newUserData.foto}
                      onChange={(e) => setNewUserData({ ...newUserData, foto: e.target.value })}
                      className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-[#E5E1D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#434343] mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                value={newUserData.nome}
                onChange={(e) => setNewUserData({ ...newUserData, nome: e.target.value })}
                placeholder="Ex: Dra. Juliana Silveira"
                className="w-full px-3 py-2 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#434343] mb-1">E-mail (Login de Acesso) *</label>
              <input
                type="email"
                required
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder="exemplo@clinicaescola.edu.br"
                className="w-full px-3 py-2 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#434343] mb-1">Telefone / WhatsApp *</label>
              <input
                type="text"
                required
                value={newUserData.telefone}
                onChange={(e) => setNewUserData({ ...newUserData, telefone: e.target.value })}
                placeholder="(11) 98765-4321"
                className="w-full px-3 py-2 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#434343] mb-1">Senha Inicial</label>
              <input
                type="text"
                value={newUserData.senha}
                onChange={(e) => setNewUserData({ ...newUserData, senha: e.target.value })}
                className="w-full px-3 py-2 bg-[#F8F5F0] border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B]"
              />
            </div>
          </div>

          {/* Role Specific Fields */}
          {newUserRole === 'admin' && (
            <div className="p-3 bg-[#EDE8F5]/40 border border-[#D1C4E9] rounded-xl space-y-2">
              <p className="font-bold text-[#5E35B1]">Dados do Administrador</p>
              <div>
                <label className="block font-medium text-[#434343] mb-1">Cargo / Função</label>
                <input
                  type="text"
                  value={newUserData.cargo}
                  onChange={(e) => setNewUserData({ ...newUserData, cargo: e.target.value })}
                  placeholder="Ex: Coordenador de Atendimento"
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl"
                />
              </div>
            </div>
          )}

          {newUserRole === 'profissional' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#F1F8E9]/40 border border-[#D0E3B6] rounded-xl space-y-2">
                <p className="font-bold text-[#82954B]">Dados do Profissional</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-[#434343] mb-1">CRP (Registro)</label>
                    <input
                      type="text"
                      value={newUserData.crp}
                      onChange={(e) => setNewUserData({ ...newUserData, crp: e.target.value })}
                      placeholder="06/123456"
                      className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#434343] mb-1">Especialidade</label>
                    <input
                      type="text"
                      value={newUserData.especialidade}
                      onChange={(e) => setNewUserData({ ...newUserData, especialidade: e.target.value })}
                      placeholder="Psicologia Clínica"
                      className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <MultiDateSchedulePicker
                role="profissional"
                selectedDates={adminProfDatas}
                onChangeDates={setAdminProfDatas}
                selectedTimes={adminProfHorarios}
                onChangeTimes={setAdminProfHorarios}
              />
            </div>
          )}

          {newUserRole === 'estagiario' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#F5EBE6]/40 border border-[#E5D2CB] rounded-xl space-y-2">
                <p className="font-bold text-[#A37B75]">Dados do Estagiário</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-[#434343] mb-1">CPF</label>
                    <input
                      type="text"
                      value={newUserData.cpf}
                      onChange={(e) => setNewUserData({ ...newUserData, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                      className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#434343] mb-1">Turma / Semestre</label>
                    <input
                      type="text"
                      value={newUserData.turma}
                      onChange={(e) => setNewUserData({ ...newUserData, turma: e.target.value })}
                      placeholder="PSI-2024.2 (10º Sem)"
                      className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <MultiDateSchedulePicker
                role="estagiario"
                selectedDates={adminEstDatas}
                onChangeDates={setAdminEstDatas}
                selectedTimes={adminEstHorarios}
                onChangeTimes={setAdminEstHorarios}
                observacoes={adminEstObs}
                onChangeObservacoes={setAdminEstObs}
              />
            </div>
          )}

          {newUserRole === 'paciente' && (
            <div className="p-3 bg-[#FDF0EE]/40 border border-[#F7C4BE] rounded-xl space-y-2">
              <p className="font-bold text-[#E98074]">Dados do Paciente</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-[#434343] mb-1">CPF</label>
                  <input
                    type="text"
                    value={newUserData.cpf}
                    onChange={(e) => setNewUserData({ ...newUserData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#434343] mb-1">Profissão</label>
                  <input
                    type="text"
                    value={newUserData.profissao}
                    onChange={(e) => setNewUserData({ ...newUserData, profissao: e.target.value })}
                    placeholder="Ex: Professor"
                    className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E1D8] rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E1D8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E5E1D8] text-[#5C5C5C] hover:bg-[#EAE7DC] font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#82954B] hover:bg-[#6F803E] text-white font-semibold shadow-xs cursor-pointer"
            >
              Salvar Usuário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
