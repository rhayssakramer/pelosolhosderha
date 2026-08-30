import nodemailer from 'nodemailer';
import { config } from './env.js';

// Criar transporter usando variáveis de ambiente
// Para desenvolvimento, você pode usar serviços como Mailtrap, SendGrid, etc.
export const createEmailTransporter = () => {
  // Se não houver configuração de email, retorna null
  if (!config.emailService || !config.emailUser || !config.emailPassword) {
    console.log('⚠️  Email service not configured. Notifications disabled.');
    console.log(`   - emailService: ${config.emailService || 'NOT SET'}`);
    console.log(`   - emailUser: ${config.emailUser || 'NOT SET'}`);
    console.log(`   - emailPassword: ${config.emailPassword ? 'SET' : 'NOT SET'}`);
    return null;
  }

  return nodemailer.createTransport({
    service: config.emailService,
    auth: {
      user: config.emailUser,
      pass: config.emailPassword,
    },
  });
};

export const sendNotificationEmail = async (
  to: string,
  subject: string,
  htmlContent: string
): Promise<boolean> => {
  try {
    const transporter = createEmailTransporter();
    
    if (!transporter) {
      console.warn(`⚠️  [EMAIL] Email transporter not configured - cannot send to ${to}`);
      console.warn(`⚠️  [EMAIL] Make sure these env vars are set: EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD`);
      return false;
    }

    const mailOptions = {
      from: config.emailUser,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL] Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(`❌ [EMAIL] Error sending email to ${to}:`, error);
    return false;
  }
};

// Batch send emails to newsletter subscribers
export const sendBatchNotificationEmails = async (
  emails: string[],
  subject: string,
  htmlContent: string
): Promise<{ sent: number; failed: number }> => {
  console.log(`[EMAIL] Starting batch send to ${emails.length} subscribers...`);
  
  let sent = 0;
  let failed = 0;

  // Send emails in parallel with a concurrency limit
  const batchSize = 5; // Send 5 emails at a time to avoid overwhelming the server
  
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    
    const results = await Promise.allSettled(
      batch.map(email => sendNotificationEmail(email, subject, htmlContent))
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        sent++;
      } else {
        failed++;
        console.error(`[EMAIL] Failed to send to ${batch[index]}`);
      }
    });
  }

  console.log(`[EMAIL] Batch send complete: ${sent} sent, ${failed} failed`);
  return { sent, failed };
};

export const getCommentNotificationEmail = (
  postTitle: string,
  commentAuthor: string,
  commentText: string,
  commentUrl: string,
  isReply: boolean = false
): string => {
  const type = isReply ? 'resposta a comentário' : 'comentário';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Nova ${type}!</h2>
      <p>Olá,</p>
      <p>Você recebeu uma nova ${type} no post "<strong>${postTitle}</strong>":</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #8c6add; margin: 20px 0;">
        <p><strong>${commentAuthor}:</strong></p>
        <p>${commentText}</p>
      </div>
      
      <p>
        <a href="${commentUrl}" style="background-color: #8c6add; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Ver ${type}
        </a>
      </p>
      
      <hr style="margin-top: 30px; border: none; border-top: 1px solid #ccc;">
      <p style="font-size: 12px; color: #999;">
        Este é um email automático do Pelos Olhos de Rha. Não responda este email.
      </p>
    </div>
  `;
};

export const getReplyNotificationEmail = (
  postTitle: string,
  replyAuthor: string,
  replyText: string,
  commentUrl: string
): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Nova resposta ao seu comentário!</h2>
      <p>Olá,</p>
      <p><strong>${replyAuthor}</strong> respondeu seu comentário no post "<strong>${postTitle}</strong>":</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #8c6add; margin: 20px 0;">
        <p><strong>${replyAuthor}:</strong></p>
        <p>${replyText}</p>
      </div>
      
      <p>
        <a href="${commentUrl}" style="background-color: #8c6add; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Ver resposta
        </a>
      </p>
      
      <hr style="margin-top: 30px; border: none; border-top: 1px solid #ccc;">
      <p style="font-size: 12px; color: #999;">
        Este é um email automático do Pelos Olhos de Rha. Não responda este email.
      </p>
    </div>
  `;
};

export const getNewPostNotificationEmail = (
  postTitle: string,
  postExcerpt: string,
  postUrl: string,
  authorName: string,
  coverImage?: string
): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>✨ Novo post publicado!</h2>
      <p>Olá,</p>
      <p><strong>${authorName}</strong> publicou um novo post no Pelos Olhos de Rha:</p>
      
      ${coverImage ? `<div style="margin: 20px 0;">
        <img src="${coverImage}" alt="${postTitle}" style="width: 100%; height: auto; border-radius: 8px; display: block;">
      </div>` : ''}
      
      <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #8c6add; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">${postTitle}</h3>
        <p>${postExcerpt}</p>
      </div>
      
      <p>
        <a href="${postUrl}" style="background-color: #8c6add; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Ler post completo
        </a>
      </p>
      
      <hr style="margin-top: 30px; border: none; border-top: 1px solid #ccc;">
      <p style="font-size: 12px; color: #999;">
        Você está recebendo este email porque está inscrito no newsletter de Pelos Olhos de Rha.
        <br/>
        <a href="${config.appUrl}/unsubscribe" style="color: #8c6add; text-decoration: none;">Desinscrever-se</a>
      </p>
    </div>
  `;
};
