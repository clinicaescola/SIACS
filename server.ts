import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';

/**
 * Normaliza e sanitiza credenciais SMTP
 */
function getSanitizedCredentials(smtpConfig: any) {
  const user = (smtpConfig.emailRemetente || process.env.SMTP_USER || '').trim();
  const rawPass = (smtpConfig.senhaApp || process.env.SMTP_PASS || '');
  // Remove espaços, tabulações, quebras de linha e caracteres invisíveis
  const cleanPass = rawPass.replace(/[\s\r\n\t'"\u00A0\u200B]/g, '');
  const host = (smtpConfig.servidorSmtp || process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = Number(smtpConfig.porta) || (smtpConfig.seguranca === 'ssl' ? 465 : 587);
  const isSecure = smtpConfig.seguranca === 'ssl' || port === 465;
  const isGmail = host.toLowerCase().includes('gmail') || user.toLowerCase().includes('gmail.com');
  const isOutlook = host.toLowerCase().includes('outlook') || host.toLowerCase().includes('office365') || user.toLowerCase().includes('outlook.com') || user.toLowerCase().includes('hotmail.com');
  const apiKey = (smtpConfig.apiKey || '').trim();
  const metodoEnvio = smtpConfig.metodoEnvio || 'smtp';

  return { user, cleanPass, host, port, isSecure, isGmail, isOutlook, apiKey, metodoEnvio };
}

/**
 * Envia e-mail via API REST Resend (HTTPS porta 443 - imune a bloqueios de portas SMTP na nuvem)
 */
async function sendViaResend(apiKey: string, fromEmail: string, fromName: string, to: string, subject: string, html: string, text: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail.includes('@') && !fromEmail.includes('gmail') ? fromEmail : 'onboarding@resend.dev'}>`,
      to: [to],
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, '')
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error?.message || `Erro na API Resend (${response.status})`);
  }
  return { messageId: data.id, provider: 'Resend API (HTTPS 443)' };
}

/**
 * Envia e-mail via API REST Brevo / Sendinblue (HTTPS porta 443 - imune a bloqueios de portas SMTP)
 */
async function sendViaBrevo(apiKey: string, fromEmail: string, fromName: string, to: string, toName: string, subject: string, html: string, text: string) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: to, name: toName || to }],
      subject,
      htmlContent: html,
      textContent: text || html.replace(/<[^>]+>/g, '')
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Erro na API Brevo (${response.status})`);
  }
  return { messageId: data.messageId, provider: 'Brevo API (HTTPS 443)' };
}

/**
 * Cria lista ordenada de estratégias de conexão SMTP
 */
function getTransporterStrategies(smtpConfig: any) {
  const { user, cleanPass, host, port, isSecure, isGmail, isOutlook } = getSanitizedCredentials(smtpConfig);

  const strategies: Array<{ name: string; transporter: nodemailer.Transporter }> = [];

  if (isGmail) {
    // Estratégia 1: Gmail Direto SSL Porta 465
    strategies.push({
      name: 'Gmail SSL (smtp.gmail.com:465)',
      transporter: nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user, pass: cleanPass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 8000,
        greetingTimeout: 6000,
        socketTimeout: 10000
      })
    });

    // Estratégia 2: Gmail STARTTLS Porta 587
    strategies.push({
      name: 'Gmail STARTTLS (smtp.gmail.com:587)',
      transporter: nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: { user, pass: cleanPass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 8000,
        greetingTimeout: 6000,
        socketTimeout: 10000
      })
    });

    // Estratégia 3: Gmail Preset Nodemailer
    strategies.push({
      name: 'Gmail Service Preset',
      transporter: nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass: cleanPass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 8000,
        greetingTimeout: 6000,
        socketTimeout: 10000
      })
    });
  } else if (isOutlook) {
    strategies.push({
      name: 'Outlook / Office 365 (smtp.office365.com:587)',
      transporter: nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: { user, pass: cleanPass },
        tls: { ciphers: 'SSLv3', rejectUnauthorized: false },
        connectionTimeout: 8000,
        greetingTimeout: 6000,
        socketTimeout: 10000
      })
    });
  } else {
    // Servidor Customizado
    strategies.push({
      name: `SMTP Customizado (${host}:${port})`,
      transporter: nodemailer.createTransport({
        host,
        port,
        secure: isSecure,
        auth: { user, pass: cleanPass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 8000,
        greetingTimeout: 6000,
        socketTimeout: 10000
      })
    });
  }

  return strategies;
}

/**
 * Traduz erros técnicos em diagnósticos claros em português
 */
function parseSmtpError(error: any, user: string, host: string, port: number): string {
  const errMsg = (error?.message || error?.toString() || '').toLowerCase();
  const errCode = error?.code || '';
  const responseCode = error?.responseCode || 0;

  if (
    responseCode === 535 ||
    errMsg.includes('535') ||
    errMsg.includes('5.7.8') ||
    errMsg.includes('badcredentials') ||
    errMsg.includes('username and password not accepted') ||
    errMsg.includes('invalid login') ||
    errCode === 'EAUTH'
  ) {
    if (host.includes('gmail') || user.includes('gmail.com')) {
      return `❌ Falha de Autenticação Google (Erro 535):\nO Google recusou o e-mail "${user}" ou a Senha de Aplicativo.\n\n⚠️ INSTRUÇÕES:\n1. Acesse: https://myaccount.google.com/apppasswords\n2. Crie uma nova "Senha de Aplicativo" com o nome "SIACS".\n3. Copie as 16 letras geradas e cole no campo de senha (use o botão "Limpar Espaços").\n4. Certifique-se de que a verificação em 2 etapas está ATIVA na conta.`;
    }
    return `❌ Falha de Autenticação (Erro 535): O usuário "${user}" ou a senha foram recusados pelo servidor ${host}.`;
  }

  if (errMsg.includes('534') || errMsg.includes('5.7.9')) {
    return `❌ Senha de Aplicativo Exigida pelo Google (Erro 534):\nSua conta Google exige uma Senha de Aplicativo de 16 caracteres. Gere em myaccount.google.com/apppasswords.`;
  }

  if (errMsg.includes('timeout') || errCode === 'ETIMEDOUT' || errCode === 'ESOCKETTIMEDOUT') {
    return `⚠️ Bloqueio de Portas SMTP na Nuvem (ETIMEDOUT):\nAs portas 465 e 587 estão sofrendo restrição de firewall na nuvem (Google Cloud Run Sandbox).\n\n💡 SOLUÇÕES DISPONÍVEIS:\n1. Utilize o botão "Disparar via Gmail Webmail (1-Clique)" para despachar o e-mail pré-formatado diretamente pelo seu navegador;\n2. Ou configure uma chave gratuita da API Brevo/Resend (funciona via HTTPS porta 443 sem bloqueio);\n3. Todos os códigos e links de recuperação também ficam disponíveis no histórico e na tela de login.`;
  }

  if (errCode === 'ECONNREFUSED') {
    return `❌ Conexão Recusada (${errCode}) pelo servidor ${host}:${port}.`;
  }

  if (errCode === 'ENOTFOUND') {
    return `❌ Servidor Não Encontrado ("${host}"). Verifique o endereço.`;
  }

  return `❌ Erro no envio SMTP (${host}): ${error.message || 'Falha desconhecida.'}`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // --- API Routes ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Disparo automático de E-mail via API REST (Resend/Brevo) ou SMTP com Fallback
  app.post('/api/send-email', async (req, res) => {
    const { to, toName, subject, html, text, config } = req.body;

    if (!to || !subject) {
      return res.status(400).json({ success: false, error: 'Destinatário e assunto são obrigatórios.' });
    }

    const smtpConfig = config || {};
    const { user, cleanPass, host, port, apiKey, metodoEnvio } = getSanitizedCredentials(smtpConfig);
    const fromName = smtpConfig.nomeRemetente || 'SIACS • Faculdade Campos Salles';
    const fromEmail = user || 'no-reply@campos-salles.edu.br';

    // 1. Envio via API HTTP Resend (se configurado)
    if (metodoEnvio === 'resend_api' && apiKey) {
      try {
        const result = await sendViaResend(apiKey, fromEmail, fromName, to, subject, html, text);
        return res.json({
          success: true,
          messageId: result.messageId,
          strategy: result.provider,
          message: `E-mail despachado com sucesso via ${result.provider}!`
        });
      } catch (apiErr: any) {
        return res.status(500).json({
          success: false,
          error: `Erro ao enviar via Resend API: ${apiErr.message}`,
          message: apiErr.message
        });
      }
    }

    // 2. Envio via API HTTP Brevo / Sendinblue (se configurado)
    if (metodoEnvio === 'brevo_api' && apiKey) {
      try {
        const result = await sendViaBrevo(apiKey, fromEmail, fromName, to, toName, subject, html, text);
        return res.json({
          success: true,
          messageId: result.messageId,
          strategy: result.provider,
          message: `E-mail despachado com sucesso via ${result.provider}!`
        });
      } catch (apiErr: any) {
        return res.status(500).json({
          success: false,
          error: `Erro ao enviar via Brevo API: ${apiErr.message}`,
          message: apiErr.message
        });
      }
    }

    // 3. Envio via SMTP Tradicional
    if (!user || !cleanPass || cleanPass.includes('••••')) {
      return res.status(400).json({
        success: false,
        error: 'Credenciais de e-mail incompletas. Por favor, preencha o E-mail Remetente e a Senha de Aplicativo de 16 letras nas configurações do Administrador.',
        message: 'Credenciais SMTP incompletas.'
      });
    }

    const mailOptions: any = {
      from: `"${fromName}" <${fromEmail}>`,
      to: toName ? `"${toName}" <${to}>` : to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html
    };

    if (smtpConfig.copiaOcultaAdmin && smtpConfig.copiaOcultaAdmin.trim() !== '') {
      mailOptions.bcc = smtpConfig.copiaOcultaAdmin.trim();
    }

    const strategies = getTransporterStrategies(smtpConfig);
    let lastError: any = null;
    let successInfo: any = null;
    let strategyUsed = '';

    for (const strategy of strategies) {
      try {
        console.log(`[SMTP] Tentando envio para ${to} via "${strategy.name}"...`);
        const info = await strategy.transporter.sendMail(mailOptions);
        console.log(`[SMTP] E-mail enviado com sucesso via "${strategy.name}"! MessageId: ${info.messageId}`);
        successInfo = info;
        strategyUsed = strategy.name;
        break;
      } catch (err: any) {
        console.warn(`[SMTP] Falha com estratégia "${strategy.name}":`, err.message || err);
        lastError = err;
        
        const isAuthError =
          err.responseCode === 535 ||
          err.code === 'EAUTH' ||
          (err.message && (err.message.includes('535') || err.message.includes('BadCredentials')));
        if (isAuthError) {
          break;
        }
      }
    }

    if (successInfo) {
      return res.json({
        success: true,
        isSimulated: false,
        messageId: successInfo.messageId,
        strategy: strategyUsed,
        message: `E-mail entregue com sucesso para ${to} via ${strategyUsed}!`
      });
    }

    console.error('[SMTP] Todas as estratégias falharam. Último erro:', lastError);
    const friendlyMessage = parseSmtpError(lastError, user, host, port);

    return res.status(500).json({
      success: false,
      error: friendlyMessage,
      message: friendlyMessage,
      rawError: lastError?.message || 'Falha de comunicação SMTP'
    });
  });

  // Teste de conexão e envio de mensagem de teste
  app.post('/api/test-smtp', async (req, res) => {
    const { config, testEmail } = req.body;
    const smtpConfig = config || {};
    const { user, cleanPass, host, port, apiKey, metodoEnvio } = getSanitizedCredentials(smtpConfig);
    const targetEmail = testEmail ? testEmail.trim() : (user || 'admin@faculdadecs.edu.br');

    // 1. Teste via Resend API
    if (metodoEnvio === 'resend_api') {
      if (!apiKey) {
        return res.status(400).json({ success: false, message: 'Informe a Chave de API do Resend (ex: re_123456789).' });
      }
      try {
        const result = await sendViaResend(
          apiKey,
          user || 'onboarding@resend.dev',
          smtpConfig.nomeRemetente || 'SIACS • Teste',
          targetEmail,
          '🧪 [SIACS] Teste de Envio via API HTTP Resend',
          `<p>Parabéns! Sua integração com a <strong>API Resend</strong> está 100% funcional no SIACS.</p>`,
          `Parabéns! Sua integração com a API Resend está 100% funcional no SIACS.`
        );
        return res.json({
          success: true,
          message: `Teste bem-sucedido via Resend API! E-mail entregue para ${targetEmail}.`,
          messageId: result.messageId,
          strategy: 'Resend API (HTTPS 443)'
        });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: `Falha na API Resend: ${err.message}` });
      }
    }

    // 2. Teste via Brevo API
    if (metodoEnvio === 'brevo_api') {
      if (!apiKey || !user) {
        return res.status(400).json({ success: false, message: 'Informe o E-mail Remetente e a Chave de API Brevo (api-key).' });
      }
      try {
        const result = await sendViaBrevo(
          apiKey,
          user,
          smtpConfig.nomeRemetente || 'SIACS • Teste',
          targetEmail,
          'Administrador',
          '🧪 [SIACS] Teste de Envio via API HTTP Brevo',
          `<p>Parabéns! Sua integração com a <strong>API Brevo</strong> está 100% funcional no SIACS.</p>`,
          `Parabéns! Sua integração com a API Brevo está 100% funcional no SIACS.`
        );
        return res.json({
          success: true,
          message: `Teste bem-sucedido via Brevo API! E-mail entregue para ${targetEmail}.`,
          messageId: result.messageId,
          strategy: 'Brevo API (HTTPS 443)'
        });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: `Falha na API Brevo: ${err.message}` });
      }
    }

    // 3. Teste via SMTP
    if (!user || !cleanPass) {
      return res.status(400).json({
        success: false,
        message: 'E-mail remetente e Senha de Aplicativo de 16 caracteres são obrigatórios para validar o SMTP.'
      });
    }

    if (cleanPass.includes('••••')) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, digite ou cole a sua Senha de Aplicativo real no formulário para autenticar no servidor SMTP.'
      });
    }

    const strategies = getTransporterStrategies(smtpConfig);
    let lastError: any = null;
    let validStrategy: any = null;

    console.log(`[SMTP Test] Testando conexão para ${user} no host ${host}...`);

    for (const strategy of strategies) {
      try {
        console.log(`[SMTP Test] Verificando "${strategy.name}"...`);
        await strategy.transporter.verify();
        console.log(`[SMTP Test] Conectado e autenticado via "${strategy.name}"!`);
        validStrategy = strategy;
        break;
      } catch (err: any) {
        console.warn(`[SMTP Test] Falha com "${strategy.name}":`, err.message || err);
        lastError = err;
        
        const isAuthError =
          err.responseCode === 535 ||
          err.code === 'EAUTH' ||
          (err.message && (err.message.includes('535') || err.message.includes('BadCredentials')));
        if (isAuthError) {
          break;
        }
      }
    }

    if (!validStrategy) {
      console.error('[SMTP Test] Falha na validação SMTP:', lastError);
      const friendlyMessage = parseSmtpError(lastError, user, host, port);
      return res.status(500).json({
        success: false,
        message: friendlyMessage,
        rawError: lastError?.message || 'Falha na conexão SMTP'
      });
    }

    // Se validou conexão, envia mensagem de teste
    try {
      const emailSentInfo = await validStrategy.transporter.sendMail({
        from: `"${smtpConfig.nomeRemetente || 'SIACS • Teste'}" <${user}>`,
        to: targetEmail,
        subject: '🧪 [SIACS] Teste de Conexão SMTP e Envio de Mensagem',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; color: #2D3748; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; background: #FFFFFF;">
            <div style="border-bottom: 2px solid #033B6C; padding-bottom: 12px; margin-bottom: 16px;">
              <h2 style="color: #033B6C; margin: 0 0 4px 0; font-size: 20px;">SIACS &bull; Validação de Conexão SMTP</h2>
              <p style="margin: 0; color: #62A032; font-weight: bold; font-size: 13px;">Faculdades Integradas Campos Salles &bull; Clínica Escola de Psicologia</p>
            </div>
            <p>Olá,</p>
            <p>Este é um e-mail de confirmação em tempo real enviado pelo <strong>SIACS</strong> através do seu servidor SMTP autenticado.</p>
            <div style="background: #F1F8E9; border-left: 4px solid #62A032; padding: 16px; margin: 18px 0; border-radius: 6px;">
              <p style="margin: 3px 0; font-size: 13px;"><strong>Status da Conexão:</strong> Autenticado e Operacional</p>
              <p style="margin: 3px 0; font-size: 13px;"><strong>Estratégia Utilizada:</strong> ${validStrategy.name}</p>
              <p style="margin: 3px 0; font-size: 13px;"><strong>Conta Remetente:</strong> ${user}</p>
              <p style="margin: 3px 0; font-size: 13px;"><strong>Destinatário do Teste:</strong> ${targetEmail}</p>
              <p style="margin: 3px 0; font-size: 13px;"><strong>Data e Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            </div>
            <p style="font-size: 13px; color: #4A5568;">
              Se você recebeu esta mensagem, todas as configurações de envio automático estão funcionando perfeitamente!
            </p>
          </div>
        `,
        text: `Teste de conexão SMTP bem-sucedido! Remetente: ${user}. Estratégia: ${validStrategy.name}.`
      });

      return res.json({
        success: true,
        message: `Conexão SMTP validada e e-mail de teste entregue com sucesso para "${targetEmail}"!`,
        messageId: emailSentInfo?.messageId,
        strategy: validStrategy.name
      });
    } catch (sendErr: any) {
      console.error('[SMTP Test] Erro ao enviar mensagem de teste após autenticação:', sendErr);
      const friendlyMessage = parseSmtpError(sendErr, user, host, port);
      return res.status(500).json({
        success: false,
        message: friendlyMessage,
        rawError: sendErr.message
      });
    }
  });

  // --- Vite Middleware & Static Serving ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SIACS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
