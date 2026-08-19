import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { AppUser, ProfissionalUser, EstagiarioUser, PacienteUser, OrientadorUser, AdminUser } from '../types';
import { SAD_AVATAR_DATA_URI } from '../utils/avatar';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  Shield,
  Stethoscope,
  GraduationCap,
  Heart,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Camera,
  Upload,
  Link as LinkIcon,
  Trash2
} from 'lucide-react';

interface AdminEditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AppUser | null;
  onSuccess?: () => void;
}

export const AdminEditUserModal: React.FC<AdminEditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess
}) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [foto, setFoto] = useState('');
  const [showPassword, setShowPassword] = useState(true);

  // Role-specific fields
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [crm, setCrm] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [turma, setTurma] = useState('');
  const [horasExigidas, setHorasExigidas] = useState<number>(100);
  const [departamento, setDepartamento] = useState('');
  const [cargo, setCargo] = useState('');
  const [profissao, setProfissao] = useState('');
  const [endereco, setEndereco] = useState('');

  const [fotoInputMode, setFotoInputMode] = useState<'upload' | 'url'>('upload');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setNome(user.nome || '');
      setEmail(user.email || '');
      setTelefone(user.telefone || '');
      setSenha(user.senha || '');
      setFoto(user.foto || '');
      setShowPassword(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      // Load specific fields
      if (user.role === 'profissional') {
        const p = user as ProfissionalUser;
        setCrm(p.crm || p.crp || '');
        setEspecialidade(p.especialidade || '');
      } else if (user.role === 'estagiario') {
        const e = user as EstagiarioUser;
        setCpf(e.cpf || '');
        setTurma(e.turma || '');
        setHorasExigidas(e.horasExigidas || 100);
      } else if (user.role === 'paciente') {
        const pac = user as PacienteUser;
        setCpf(pac.cpf || '');
        setDataNascimento(pac.dataNascimento || '');
        setProfissao(pac.profissao || '');
        setEndereco(pac.endereco || '');
      } else if (user.role === 'orientador') {
        const o = user as OrientadorUser;
        setCpf(o.cpf || '');
        setDepartamento(o.departamento || '');
        setEndereco(o.endereco || '');
      } else if (user.role === 'admin') {
        const a = user as AdminUser;
        setDepartamento(a.departamento || '');
        setCargo(a.cargo || '');
      }
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('A imagem deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result as string);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!nome.trim()) {
      setErrorMsg('O nome é obrigatório.');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setErrorMsg('O e-mail é obrigatório.');
      return;
    }

    if (!senha.trim()) {
      setErrorMsg('A senha é obrigatória.');
      return;
    }

    setIsSaving(true);
    try {
      const updates: any = {
        nome: nome.trim(),
        email: normalizedEmail,
        telefone: telefone.trim(),
        senha: senha.trim(),
        foto: foto.trim()
      };

      if (user.role === 'profissional') {
        updates.crm = crm.trim();
        updates.crp = crm.trim();
        updates.especialidade = especialidade.trim();
      } else if (user.role === 'estagiario') {
        updates.cpf = cpf.trim();
        updates.turma = turma.trim();
        updates.horasExigidas = Number(horasExigidas) || 100;
      } else if (user.role === 'paciente') {
        updates.cpf = cpf.trim();
        updates.dataNascimento = dataNascimento;
        updates.profissao = profissao.trim();
        updates.endereco = endereco.trim();
      } else if (user.role === 'orientador') {
        updates.cpf = cpf.trim();
        updates.departamento = departamento.trim();
        updates.endereco = endereco.trim();
      } else if (user.role === 'admin') {
        updates.departamento = departamento.trim();
        updates.cargo = cargo.trim();
      }

      db.updateUser(user.id, updates);
      setSuccessMsg('Cadastro atualizado com sucesso pela administração!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar alterações do usuário.');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = () => {
    switch (user.role) {
      case 'admin':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FBF4E6] text-[#B58D3D] border border-[#EED9B0]">Administrador</span>;
      case 'profissional':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]">Profissional</span>;
      case 'estagiario':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F5EBE6] text-[#A37B75] border border-[#E5D2CB]">Estagiário</span>;
      case 'orientador':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FBF4E6] text-[#B58D3D] border border-[#EED9B0]">Orientador</span>;
      case 'paciente':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FDF0EE] text-[#E98074] border border-[#F7C4BE]">Paciente</span>;
      default:
        return null;
    }
  };

  const isUsingSadAvatar = !foto || foto.trim() === '' || foto === SAD_AVATAR_DATA_URI;

  return (
    <div
      id="admin-edit-user-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-[#FDFBF7] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E5E1D8] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E1D8] bg-[#F8F5F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#82954B]/15 text-[#82954B]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-bold text-[#434343]">
                  Editar Cadastro do Usuário
                </h3>
                {getRoleBadge()}
              </div>
              <p className="text-xs text-[#8E8D8A]">
                Gestão Administrativa • ID: <span className="font-mono">{user.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E8D8A] hover:text-[#434343] hover:bg-[#EAE7DC] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 bg-[#FDF0EE] border border-[#F5C2BC] rounded-xl flex items-start gap-2.5 text-xs text-[#C84B31]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#F1F8E9] border border-[#D0E3B6] rounded-xl flex items-center gap-2 text-xs font-bold text-[#82954B]">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          <form id="admin-edit-user-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Foto de Perfil */}
            <div>
              <label className="block text-xs font-bold text-[#5C5C5C] mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#82954B]" />
                  Foto de Perfil do Usuário
                </span>
              </label>

              <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-[#E5E1D8]">
                <div className="relative group shrink-0">
                  <div className="w-14 h-14 rounded-full bg-[#F4EBE6] border-2 border-white shadow-xs overflow-hidden flex items-center justify-center">
                    <img
                      src={isUsingSadAvatar ? SAD_AVATAR_DATA_URI : foto}
                      alt={nome}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).setAttribute('src', SAD_AVATAR_DATA_URI);
                      }}
                    />
                  </div>
                  {!isUsingSadAvatar && (
                    <button
                      type="button"
                      onClick={() => setFoto('')}
                      className="absolute -top-1 -right-1 bg-[#E98074] text-white p-1 rounded-full shadow-xs hover:bg-[#C84B31] transition-colors cursor-pointer"
                      title="Remover foto"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFotoInputMode('upload')}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                        fotoInputMode === 'upload'
                          ? 'bg-[#82954B] text-white'
                          : 'bg-[#EAE7DC] text-[#5C5C5C] hover:bg-[#D8D2C2]'
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setFotoInputMode('url')}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                        fotoInputMode === 'url'
                          ? 'bg-[#82954B] text-white'
                          : 'bg-[#EAE7DC] text-[#5C5C5C] hover:bg-[#D8D2C2]'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      URL Link
                    </button>
                    {!isUsingSadAvatar && (
                      <button
                        type="button"
                        onClick={() => setFoto('')}
                        className="text-xs px-2 py-1 rounded-lg text-[#E98074] hover:bg-[#FDF0EE] transition-colors ml-auto flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remover Foto
                      </button>
                    )}
                  </div>

                  {fotoInputMode === 'upload' ? (
                    <label className="block w-full text-center px-3 py-1.5 bg-[#F8F5F0] border border-dashed border-[#82954B]/40 rounded-lg cursor-pointer hover:bg-[#EAE7DC]/50 transition-colors text-xs text-[#5C5C5C]">
                      <span>Selecionar imagem</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <input
                      type="url"
                      placeholder="https://exemplo.com/foto.jpg"
                      value={foto === SAD_AVATAR_DATA_URI ? '' : foto}
                      onChange={(e) => setFoto(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#F8F5F0] border border-[#E5E1D8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#82954B] text-[#434343]"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Grid 1: Nome, E-mail, Telefone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#5C5C5C] mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#82954B]" />
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5C5C] mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#82954B]" />
                  E-mail (Login) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                />
              </div>
            </div>

            {/* Grid 2: Telefone & Senha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#5C5C5C] mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#82954B]" />
                  Telefone / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5C5C] mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#82954B]" />
                    Senha do Usuário *
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#8E8D8A] hover:text-[#434343] cursor-pointer flex items-center gap-1 text-[10px]"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-[#82954B]" />}
                    {showPassword ? 'Ocultar' : 'Ver senha'}
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E8D8A] hover:text-[#434343]"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#82954B]" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Role specific section */}
            <div className="p-4 bg-[#F8F5F0] rounded-2xl border border-[#E5E1D8] space-y-3">
              <h4 className="text-xs font-bold text-[#434343] uppercase tracking-wider">
                Campos Específicos ({user.role.toUpperCase()})
              </h4>

              {/* PROFISSIONAL */}
              {user.role === 'profissional' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5C5C5C] mb-1">
                      CRM / Registro Profissional *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: CRM/SP 123456 ou CRP"
                      value={crm}
                      onChange={(e) => setCrm(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl text-[#434343]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5C5C5C] mb-1">
                      Especialidade Clínica *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Psicoterapia TCC, Psicanálise..."
                      value={especialidade}
                      onChange={(e) => setEspecialidade(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl text-[#434343]"
                    />
                  </div>
                </div>
              )}

              {/* ESTAGIARIO */}
              {user.role === 'estagiario' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5C5C5C] mb-1">
                      CPF *
                    </label>
                    <input
                      type="text"
                      required
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl text-[#434343]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5C5C5C] mb-1">
                      Turma / Semestre *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: PSI-2024.1"
                      value={turma}
                      onChange={(e) => setTurma(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl text-[#434343]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5C5C5C] mb-1">
                      Meta de Horas Exigidas *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={horasExigidas}
                      onChange={(e) => setHorasExigidas(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl text-[#434343]"
                    />
                  </div>
                </div>
              )}

              {/* PACIENTE */}
              {user.role === 'paciente' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#5C5C5C] mb-1">
                        CPF do Paciente *
                      </label>
                      <input
                        type="text"
                        required
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl text-[#434343]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#5C5C5C] mb-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#82954B]" />
                        Data de Nascimento *
                      </label>
                      <input
                        type="date"
                        required
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl text-[#434343]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#5C5C5C] mb-1">
                        Ocupação / Profissão
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Estudante, Autônomo..."
                        value={profissao}
                        onChange={(e) => setProfissao(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl text-[#434343]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#5C5C5C] mb-1">
                        Endereço Completo
                      </label>
                      <input
                        type="text"
                        placeholder="Rua, número, bairro, cidade"
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl text-[#434343]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ORIENTADOR */}
              {user.role === 'orientador' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5C5C5C] mb-1">
                      CPF *
                    </label>
                    <input
                      type="text"
                      required
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl text-[#434343]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5C5C5C] mb-1">
                      Departamento / Coordenação *
                    </label>
                    <input
                      type="text"
                      required
                      value={departamento}
                      onChange={(e) => setDepartamento(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl text-[#434343]"
                    />
                  </div>
                </div>
              )}

              {/* ADMIN */}
              {user.role === 'admin' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5C5C5C] mb-1">
                      Cargo / Função Administrativa
                    </label>
                    <input
                      type="text"
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl text-[#434343]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5C5C5C] mb-1">
                      Setor / Departamento
                    </label>
                    <input
                      type="text"
                      value={departamento}
                      onChange={(e) => setDepartamento(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl text-[#434343]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="pt-3 border-t border-[#E5E1D8] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-[#5C5C5C] hover:bg-[#EAE7DC] rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 text-xs font-bold bg-[#82954B] hover:bg-[#6D7D3F] text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                {isSaving ? 'Salvando...' : 'Salvar Alterações do Usuário'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
