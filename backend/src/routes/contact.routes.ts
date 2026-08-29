import { Router, Request, Response } from 'express';
import { sendNotificationEmail } from '../config/email.js';
import { config } from '../config/env.js';

export const contactRoutes = Router();

// Send contact form message (public)
contactRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validar campos obrigatórios
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Nome, email, assunto e mensagem são obrigatórios' });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Validar comprimento mínimo
    if (message.trim().length < 10) {
      return res.status(400).json({ error: 'Mensagem deve ter pelo menos 10 caracteres' });
    }

    // Criar HTML do email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Nova mensagem de contato! 📬</h2>
        <p><strong>De:</strong> ${name} (${email})</p>
        <p><strong>Assunto:</strong> ${subject}</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #8c6add; margin: 20px 0; word-wrap: break-word;">
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #ccc;">
        <p style="font-size: 12px; color: #999;">
          Para responder, use o email do remetente: <a href="mailto:${email}">${email}</a>
        </p>
      </div>
    `;

    // Enviar email para o admin
    const emailSent = await sendNotificationEmail(
      config.adminEmail,
      `Novo contato - ${subject}`,
      htmlContent
    );

    if (!emailSent) {
      console.error('[CONTACT] Falha ao enviar email para admin');
      return res.status(500).json({ error: 'Erro ao enviar mensagem. Por favor, tente novamente.' });
    }

    console.log(`[CONTACT] Mensagem de contato recebida de ${name} (${email})`);
    res.status(201).json({ message: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error('[CONTACT] Erro ao processar mensagem de contato:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});
