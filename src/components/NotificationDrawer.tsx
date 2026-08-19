import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { NotificacaoDisparo } from '../types';
import {
  Bell,
  X,
  Mail,
  MessageCircle,
  ExternalLink,
  CheckCheck,
  Send,
  Calendar,
  User,
  Clock,
  Sparkles
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const [notificacoes, setNotificacoes] = useState<NotificacaoDisparo[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<NotificacaoDisparo | null>(null);
  const [filterRole, setFilterRole] = useState<string>('todos');

  useEffect(() => {
    const update = () => {
      setNotificacoes(db.getNotificacoes());
    };
    update();
    return db.subscribe(update);
  }, []);

  if (!isOpen) return null;

  const filtered = notificacoes.filter(n => {
    if (filterRole === 'todos') return true;
    return n.destinatarioTipo === filterRole;
  });

  const handleSimularLembrete = () => {
    const agendamentos = db.getAgendamentos().filter(a => a.status !== 'cancelado');
    if (agendamentos.length === 0) {
      alert('Nenhum agendamento ativo encontrado.');
      return;
    }
    const target = agendamentos[0];
    const created = db.dispararLembrete1DiaAntes(target.id);
    setSelectedNotif(created);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in text-[#434343]">
      <div className="w-full max-w-xl bg-[#FDFBF7] h-full shadow-2xl flex flex-col transform transition-transform duration-300 border-l border-[#E5E1D8]">
        
        {/* Drawer Header */}
        <div className="p-5 bg-[#82954B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold">Central de Notificações & Mensagens</h2>
              <p className="text-xs text-white/80">E-mails automáticos e disparos no WhatsApp</p>
            </div>
          </div>
          <button
            id="close-notifications-drawer"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar & Filter */}
        <div className="p-4 border-b border-[#E5E1D8] bg-[#F8F5F0] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-[#434343]">Filtrar por Destinatário:</p>
            <button
              id="simulate-1day-reminder-btn"
              onClick={handleSimularLembrete}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#B58D3D] bg-[#FBF4E6] hover:bg-[#F5E6CC] rounded-lg transition-colors border border-[#EED9B0] shadow-xs cursor-pointer"
              title="Dispara notificação de lembrete 1 dia antes para o primeiro agendamento"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Simular Lembrete de 1 Dia</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'paciente', label: 'Pacientes' },
              { id: 'profissional', label: 'Profissionais' },
              { id: 'estagiario', label: 'Estagiários' },
              { id: 'orientador', label: 'Orientadores' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterRole(tab.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  filterRole === tab.id
                    ? 'bg-[#82954B] text-white shadow-xs'
                    : 'bg-white text-[#8E8D8A] border border-[#E5E1D8] hover:text-[#434343] hover:bg-[#F8F5F0]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-[#8E8D8A]">
              <Mail className="w-12 h-12 mx-auto mb-2 opacity-40 text-[#8E8D8A]" />
              <p className="text-sm font-medium text-[#434343]">Nenhuma notificação registrada para este filtro.</p>
              <p className="text-xs">Ao realizar agendamentos, os e-mails e mensagens aparecerão aqui.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  item.tipo === 'lembrete_1_dia'
                    ? 'bg-[#FBF4E6]/50 border-[#EED9B0]'
                    : 'bg-white border-[#E5E1D8] hover:border-[#82954B]/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        item.destinatarioTipo === 'paciente'
                          ? 'bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]'
                          : item.destinatarioTipo === 'profissional'
                          ? 'bg-[#F1F8E9] text-[#82954B] border border-[#D0E3B6]'
                          : item.destinatarioTipo === 'estagiario'
                          ? 'bg-[#F8F5F0] text-[#434343] border border-[#E5E1D8]'
                          : 'bg-[#FBF4E6] text-[#B58D3D] border border-[#EED9B0]'
                      }`}
                    >
                      {item.destinatarioTipo}
                    </span>
                    <span className="text-[11px] text-[#8E8D8A]">
                      {new Date(item.dataEnvio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {new Date(item.dataEnvio).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#82954B] bg-[#F1F8E9] px-2 py-0.5 rounded border border-[#D0E3B6]">
                    {item.tipo === 'lembrete_1_dia' ? '🔔 Lembrete 1 Dia' : '📅 Confirmação Agendamento'}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-[#434343] mt-2">
                  {item.assunto}
                </h3>
                <p className="text-xs text-[#5C5C5C] mt-1 line-clamp-2">
                  Para: <strong>{item.destinatarioNome}</strong> ({item.destinatarioEmail})
                </p>
                <p className="text-[11px] text-[#5C5C5C] mt-1 bg-[#F8F5F0] p-2 rounded-lg border border-[#E5E1D8]">
                  {item.conteudoTexto}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-[#E5E1D8]/60">
                  <button
                    onClick={() => {
                      db.marcarNotificacaoLida(item.id);
                      setSelectedNotif(item);
                    }}
                    className="text-xs font-bold text-[#82954B] hover:text-[#68793B] flex items-center gap-1 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Visualizar E-mail Completo
                  </button>

                  {item.whatsappUrl && (
                    <a
                      href={item.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-xs font-bold bg-[#82954B] hover:bg-[#68793B] text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Enviar WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F8F5F0] border-t border-[#E5E1D8] text-center text-xs text-[#8E8D8A]">
          Disparos integrados em tempo real (E-mail SMTP & WhatsApp API)
        </div>
      </div>

      {/* Modal Preview of Stylized Email */}
      {selectedNotif && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#E5E1D8] overflow-hidden animate-in zoom-in-95 text-[#434343]">
            {/* Modal Header */}
            <div className="p-4 bg-[#82954B] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-white" />
                <h3 className="text-sm font-serif font-bold">Pré-visualização do E-mail Enviado</h3>
              </div>
              <button
                onClick={() => setSelectedNotif(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Email Metadata */}
            <div className="p-4 bg-[#F8F5F0] border-b border-[#E5E1D8] text-xs space-y-1 text-[#434343]">
              <p><strong>De:</strong> Clínica Escola &lt;agendamentos@clinicaescola.edu.br&gt;</p>
              <p><strong>Para:</strong> {selectedNotif.destinatarioNome} &lt;{selectedNotif.destinatarioEmail}&gt;</p>
              <p><strong>Assunto:</strong> {selectedNotif.assunto}</p>
              <p><strong>Data de Envio:</strong> {new Date(selectedNotif.dataEnvio).toLocaleString('pt-BR')}</p>
            </div>

            {/* Email Body rendered */}
            <div className="p-6 overflow-y-auto flex-1 bg-white text-sm">
              <div
                className="prose prose-sm max-w-none text-[#434343]"
                dangerouslySetInnerHTML={{ __html: selectedNotif.conteudoHtml }}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#F8F5F0] border-t border-[#E5E1D8] flex items-center justify-between">
              {selectedNotif.whatsappUrl ? (
                <a
                  href={selectedNotif.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-[#82954B] hover:bg-[#68793B] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Abrir no WhatsApp
                </a>
              ) : <div />}

              <button
                onClick={() => setSelectedNotif(null)}
                className="px-4 py-2 bg-[#EFEAE2] hover:bg-[#E5E1D8] text-[#434343] font-bold text-xs rounded-xl cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
