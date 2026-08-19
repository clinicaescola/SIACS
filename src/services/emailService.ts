import { db } from './db';
import { EmailSmtpConfig, EmailDispatchLog } from '../types';

export interface SendEmailPayload {
  to: string;
  toName: string;
  subject: string;
  html: string;
  text: string;
  type: 'recuperacao_senha' | 'confirmacao_agendamento' | 'lembrete_consulta' | 'teste_conexao';
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  message: string;
  isSimulated?: boolean;
}

/**
 * Serviço de disparo automático de e-mails do SIACS.
 * Envia via endpoint backend Express /api/send-email (Nodemailer com SMTP configurado)
 * e registra no log local com diagnóstico em tempo real.
 */
export async function sendAutomatedEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
  const config = db.getEmailConfig();

  // Verifica se o serviço está ativo
  if (!config.ativo) {
    const msg = 'O serviço de envio automático de e-mails está desativado nas configurações do Administrador.';
    db.addEmailLog({
      tipo: payload.type,
      destinatario: payload.to,
      destinatarioNome: payload.toName,
      assunto: payload.subject,
      corpoHtml: payload.html,
      corpoTexto: payload.text,
      status: 'falha',
      detalhes: msg
    });
    return { success: false, message: msg };
  }

  if (payload.type === 'recuperacao_senha' && !config.disparoAutomaticoRecuperacao) {
    const msg = 'Disparo automático de recuperação de senha desativado pelo administrador.';
    return { success: false, message: msg };
  }

  if (payload.type === 'confirmacao_agendamento' && !config.disparoAutomaticoAgendamento) {
    const msg = 'Disparo automático de confirmação de agendamento desativado pelo administrador.';
    return { success: false, message: msg };
  }

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: payload.to,
        toName: payload.toName,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        config: {
          metodoEnvio: config.metodoEnvio,
          apiKey: config.apiKey,
          servidorSmtp: config.servidorSmtp,
          porta: config.porta,
          seguranca: config.seguranca,
          emailRemetente: config.emailRemetente,
          nomeRemetente: config.nomeRemetente,
          senhaApp: config.senhaApp,
          copiaOcultaAdmin: config.copiaOcultaAdmin
        }
      })
    });

    const data = await response.json().catch(() => ({ success: false, message: 'Erro ao processar resposta do servidor.' }));

    if (response.ok && data.success) {
      db.addEmailLog({
        tipo: payload.type,
        destinatario: payload.to,
        destinatarioNome: payload.toName,
        assunto: payload.subject,
        corpoHtml: payload.html,
        corpoTexto: payload.text,
        status: data.isSimulated ? 'simulado' : 'enviado',
        detalhes: data.message || `Disparado com sucesso via SMTP (${config.servidorSmtp})`
      });

      return {
        success: true,
        messageId: data.messageId || `msg-${Date.now()}`,
        message: data.message || 'E-mail enviado com sucesso!',
        isSimulated: data.isSimulated
      };
    } else {
      const errorMsg = data.message || data.error || 'Falha ao despachar e-mail via servidor SMTP.';
      db.addEmailLog({
        tipo: payload.type,
        destinatario: payload.to,
        destinatarioNome: payload.toName,
        assunto: payload.subject,
        corpoHtml: payload.html,
        corpoTexto: payload.text,
        status: 'falha',
        detalhes: errorMsg
      });

      return {
        success: false,
        message: errorMsg
      };
    }
  } catch (error: any) {
    const errorMsg = `Erro de comunicação com o despachante SMTP: ${error.message || 'Servidor indisponível'}`;
    db.addEmailLog({
      tipo: payload.type,
      destinatario: payload.to,
      destinatarioNome: payload.toName,
      assunto: payload.subject,
      corpoHtml: payload.html,
      corpoTexto: payload.text,
      status: 'falha',
      detalhes: errorMsg
    });

    return {
      success: false,
      message: errorMsg
    };
  }
}

/**
 * Testa as credenciais e conexão SMTP
 */
export async function testSmtpConnection(config: EmailSmtpConfig, testEmail: string): Promise<SendEmailResult> {
  try {
    const response = await fetch('/api/test-smtp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        config,
        testEmail
      })
    });

    const data = await response.json().catch(() => ({ success: false, message: 'Erro na resposta do servidor' }));

    if (response.ok && data.success) {
      db.updateEmailTestStatus('sucesso', data.message || 'Servidor SMTP conectado com sucesso!');
      
      // Adiciona o envio de teste no histórico de logs
      if (testEmail) {
        db.addEmailLog({
          tipo: 'teste_conexao',
          destinatario: testEmail,
          destinatarioNome: 'Administrador (Teste)',
          assunto: '🧪 [SIACS] Teste de Conexão SMTP e Envio de Mensagem',
          corpoHtml: `<p>Teste de conexão e entrega realizado com sucesso no servidor <strong>${config.servidorSmtp}:${config.porta}</strong>.</p>`,
          corpoTexto: `Teste de conexão e entrega realizado com sucesso no servidor ${config.servidorSmtp}:${config.porta}.`,
          status: 'enviado',
          detalhes: data.message
        });
      }

      return {
        success: true,
        message: data.message || 'Conexão SMTP validada com sucesso! E-mail de teste enviado.',
        messageId: data.messageId
      };
    } else {
      const msg = data.message || data.error || 'Não foi possível autenticar no servidor SMTP. Verifique o e-mail e a senha de aplicativo.';
      db.updateEmailTestStatus('erro', msg);
      
      if (testEmail) {
        db.addEmailLog({
          tipo: 'teste_conexao',
          destinatario: testEmail,
          destinatarioNome: 'Administrador (Teste)',
          assunto: '🧪 [SIACS] Teste de Conexão SMTP (Falha)',
          corpoHtml: `<p style="color: red;">Falha no teste de conexão: ${msg}</p>`,
          corpoTexto: `Falha no teste de conexão: ${msg}`,
          status: 'falha',
          detalhes: msg
        });
      }

      return {
        success: false,
        message: msg
      };
    }
  } catch (err: any) {
    const msg = `Erro ao contactar a API de envio: ${err.message || 'Verifique a conexão de rede.'}`;
    db.updateEmailTestStatus('erro', msg);
    return {
      success: false,
      message: msg
    };
  }
}
