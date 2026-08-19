import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SAD_AVATAR_DATA_URI } from '../utils/avatar';
import {
  X,
  User,
  Mail,
  Lock,
  Camera,
  Upload,
  Link as LinkIcon,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  Trash2
} from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [foto, setFoto] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const [fotoInputMode, setFotoInputMode] = useState<'upload' | 'url'>('upload');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser && isOpen) {
      setEmail(currentUser.email || '');
      setSenha(currentUser.senha || '');
      setConfirmSenha(currentUser.senha || '');
      setFoto(currentUser.foto || '');
      setShowPassword(true);
      setShowConfirmPassword(true);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

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

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setErrorMsg('O e-mail é obrigatório.');
      return;
    }

    if (!senha.trim()) {
      setErrorMsg('A senha é obrigatória.');
      return;
    }

    if (senha.length < 3) {
      setErrorMsg('A senha deve ter no mínimo 3 caracteres.');
      return;
    }

    if (senha !== confirmSenha) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }

    setIsSaving(true);
    try {
      updateProfile({
        email: normalizedEmail,
        senha: senha.trim(),
        foto: foto.trim()
      });

      setSuccessMsg('Cadastro atualizado com sucesso!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao atualizar cadastro.');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'profissional': return 'Profissional / Docente';
      case 'estagiario': return 'Estagiário Acadêmico';
      case 'orientador': return 'Orientador / Supervisor';
      case 'paciente': return 'Paciente / Usuário do Serviço';
      default: return role;
    }
  };

  const isUsingSadAvatar = !foto || foto.trim() === '' || foto === SAD_AVATAR_DATA_URI;

  return (
    <div
      id="edit-profile-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-[#FDFBF7] w-full max-w-lg rounded-2xl shadow-2xl border border-[#E5E1D8] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E1D8] bg-[#F8F5F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#82954B]/10 text-[#82954B]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#434343]">
                Editar Meu Cadastro
              </h3>
              <p className="text-xs text-[#8E8D8A]">
                Alteração permitida de Senha, E-mail e Foto
              </p>
            </div>
          </div>
          <button
            id="close-profile-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E8D8A] hover:text-[#434343] hover:bg-[#EAE7DC] transition-colors"
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

          {/* Institutional Info (Read-only) */}
          <div className="p-3.5 bg-[#F8F5F0] rounded-xl border border-[#E5E1D8] flex items-center justify-between text-xs">
            <div>
              <span className="text-[#8E8D8A] block text-[10px] font-semibold uppercase tracking-wider">
                Titular da Conta (Protegido)
              </span>
              <p className="font-bold text-[#434343] text-sm mt-0.5">{currentUser.nome}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EAE7DC] text-[#5C5C5C]">
                  {getRoleLabel(currentUser.role)}
                </span>
                {(currentUser as any).cpf && (
                  <span className="text-[#8E8D8A] text-[11px]">
                    CPF: {(currentUser as any).cpf}
                  </span>
                )}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#E5E1D8] text-[#8E8D8A]" title="Nome e CPF só podem ser alterados pela administração">
              <Shield className="w-4 h-4" />
            </div>
          </div>

          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Foto de Perfil */}
            <div>
              <label className="block text-xs font-bold text-[#5C5C5C] mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#82954B]" />
                  Foto de Perfil
                </span>
                <span className="text-[11px] text-[#8E8D8A] font-normal">
                  Sem foto? Fica com rostinho triste ☹️
                </span>
              </label>

              <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-[#E5E1D8]">
                {/* Live Avatar Preview */}
                <div className="relative group shrink-0">
                  <div className="w-16 h-16 rounded-full bg-[#F4EBE6] border-2 border-white shadow-xs overflow-hidden flex items-center justify-center">
                    <img
                      src={isUsingSadAvatar ? SAD_AVATAR_DATA_URI : foto}
                      alt={currentUser.nome}
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
                      title="Remover foto (usar rostinho triste)"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {isUsingSadAvatar && (
                    <span
                      className="absolute -bottom-1 -right-1 bg-[#EAE7DC] text-[#7D716A] text-[10px] font-bold px-1 rounded-full border border-[#D8D2C2]"
                      title="Rostinho triste padrão ativo"
                    >
                      ☹️
                    </span>
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
                      Enviar Arquivo
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
                      Inserir Link
                    </button>
                    {!isUsingSadAvatar && (
                      <button
                        type="button"
                        onClick={() => setFoto('')}
                        className="text-xs px-2 py-1 rounded-lg text-[#E98074] hover:bg-[#FDF0EE] transition-colors ml-auto flex items-center gap-1 cursor-pointer"
                        title="Deixar sem foto"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remover
                      </button>
                    )}
                  </div>

                  {fotoInputMode === 'upload' ? (
                    <label className="block w-full text-center px-3 py-1.5 bg-[#F8F5F0] border border-dashed border-[#82954B]/40 rounded-lg cursor-pointer hover:bg-[#EAE7DC]/50 transition-colors text-xs text-[#5C5C5C]">
                      <span>Escolher imagem do dispositivo (JPG, PNG)</span>
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
                      placeholder="https://exemplo.com/sua-foto.jpg"
                      value={foto === SAD_AVATAR_DATA_URI ? '' : foto}
                      onChange={(e) => setFoto(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#F8F5F0] border border-[#E5E1D8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#82954B] text-[#434343]"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 2. E-mail */}
            <div>
              <label className="block text-xs font-bold text-[#5C5C5C] mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#82954B]" />
                E-mail de Acesso e Contato
              </label>
              <input
                id="edit-profile-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@clinicaescola.com.br"
                className="w-full px-3 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
              />
              <p className="text-[10px] text-[#8E8D8A] mt-1">
                O e-mail deve ser único em todo o sistema. É utilizado para login e recebimento de avisos.
              </p>
            </div>

            {/* 3. Senha e Confirmação */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5C5C5C] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#82954B]" />
                  Senha de Acesso
                </span>
                <span className="text-[11px] text-[#82954B] font-medium flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Visível para sua conferência
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5C5C5C] mb-1 flex items-center justify-between">
                    <span>Senha</span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[#8E8D8A] hover:text-[#434343] cursor-pointer flex items-center gap-1 text-[10px]"
                      title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                    >
                      {showPassword ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Ocultar</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Ver</span>
                        </>
                      )}
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      id="edit-profile-senha"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Sua senha"
                      className="w-full pl-3 pr-8 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E8D8A] hover:text-[#434343] cursor-pointer"
                      title={showPassword ? 'Ocultar' : 'Exibir'}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#82954B]" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5C5C5C] mb-1 flex items-center justify-between">
                    <span>Confirmar Senha</span>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-[#8E8D8A] hover:text-[#434343] cursor-pointer flex items-center gap-1 text-[10px]"
                      title={showConfirmPassword ? 'Ocultar confirmação' : 'Ver confirmação'}
                    >
                      {showConfirmPassword ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Ocultar</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Ver</span>
                        </>
                      )}
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      id="edit-profile-confirm-senha"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmSenha}
                      onChange={(e) => setConfirmSenha(e.target.value)}
                      placeholder="Repita sua senha"
                      className="w-full pl-3 pr-8 py-2 text-xs bg-white border border-[#E5E1D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82954B] text-[#434343]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E8D8A] hover:text-[#434343] cursor-pointer"
                      title={showConfirmPassword ? 'Ocultar' : 'Exibir'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#82954B]" />}
                    </button>
                  </div>
                </div>
              </div>
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
                id="save-profile-btn"
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 text-xs font-bold bg-[#82954B] hover:bg-[#6D7D3F] text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
