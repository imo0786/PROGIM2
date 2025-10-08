import { supabase } from './supabase';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Send email using Supabase Edge Function with SMTP
 * Configured for APROFAM Office365 SMTP
 */
export async function sendEmail(emailData: EmailData): Promise<EmailResponse> {
  try {
    console.log('📧 Enviando email via APROFAM SMTP...', {
      to: emailData.to,
      subject: emailData.subject
    });

    const { data, error } = await supabase.functions.invoke('send-email-smtp', {
      body: {
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        from: emailData.from || 'monitoreo.pbi@aprofam.org.gt'
      }
    });

    if (error) {
      console.error('❌ Error enviando email:', error);
      
      // Provide specific error messages
      let errorMessage = 'Error al enviar email';
      if (error.message?.includes('Failed to send a request to the Edge Function')) {
        errorMessage = 'Función Edge no desplegada. Ejecuta: supabase functions deploy send-email-smtp';
      } else if (error.message?.includes('Authentication')) {
        errorMessage = 'Error de autenticación SMTP. Verifica credenciales APROFAM.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Timeout de conexión. Verifica configuración Office365.';
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error.message
      };
    }

    console.log('✅ Email enviado exitosamente via APROFAM:', data);
    return {
      success: true,
      message: 'Email enviado correctamente desde APROFAM'
    };

  } catch (error: any) {
    console.error('❌ Error inesperado enviando email:', error);
    
    let errorMessage = 'Error de conexión al servicio de email';
    if (error.message?.includes('Failed to send a request to the Edge Function')) {
      errorMessage = '🚨 Edge Function no encontrada. Sigue estos pasos:\n1. supabase link --project-ref ygeeahzplmuvxnfhouat\n2. supabase functions deploy send-email-smtp';
    }
    
    return {
      success: false,
      message: errorMessage,
      error: error.message
    };
  }
}

/**
 * Send test alert email from APROFAM system
 */
export async function sendTestAlert(email: string): Promise<EmailResponse> {
  const emailData: EmailData = {
    to: email,
    subject: '🚨 PROGIM APROFAM - Alerta de Prueba',
    from: 'monitoreo.pbi@aprofam.org.gt',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">PROGIM - APROFAM</h1>
          <p style="color: white; margin: 5px 0;">Plataforma de Monitoreo y Gestión de Impacto</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">🚨 Alerta de Prueba del Sistema</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Este es un email de prueba del sistema PROGIM de APROFAM para verificar que las notificaciones 
            por correo electrónico están funcionando correctamente.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="color: #333; margin-top: 0;">📊 Información del Sistema</h3>
            <ul style="color: #666;">
              <li><strong>Organización:</strong> APROFAM Guatemala</li>
              <li><strong>Sistema:</strong> PROGIM Dashboard</li>
              <li><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-GT')}</li>
              <li><strong>Hora:</strong> ${new Date().toLocaleTimeString('es-GT')}</li>
              <li><strong>Estado:</strong> ✅ Funcionando correctamente</li>
              <li><strong>Servidor:</strong> Office365 SMTP</li>
              <li><strong>Edge Function:</strong> ✅ Desplegada correctamente</li>
            </ul>
          </div>
          
          <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #01579b; margin: 0; font-size: 14px;">
              <strong>✅ Configuración exitosa:</strong> Si recibiste este email, significa que:
            </p>
            <ul style="color: #01579b; margin: 10px 0; font-size: 14px;">
              <li>La función Edge está desplegada correctamente</li>
              <li>Las credenciales APROFAM están configuradas</li>
              <li>Office365 SMTP está funcionando</li>
              <li>El sistema puede enviar notificaciones automáticas</li>
            </ul>
          </div>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © 2025 PROGIM - APROFAM | Monitoreo, Evaluación y Aprendizaje
          </p>
          <p style="color: #999; margin: 5px 0 0 0; font-size: 11px;">
            monitoreo.pbi@aprofam.org.gt
          </p>
        </div>
      </div>
    `
  };

  return sendEmail(emailData);
}

/**
 * Send activity overdue alert from APROFAM system
 */
export async function sendOverdueAlert(email: string, activityName: string, daysOverdue: number): Promise<EmailResponse> {
  const emailData: EmailData = {
    to: email,
    subject: `🔴 PROGIM APROFAM - Actividad Vencida: ${activityName}`,
    from: 'monitoreo.pbi@aprofam.org.gt',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🔴 ALERTA PROGIM</h1>
          <p style="color: white; margin: 5px 0;">APROFAM - Actividad Vencida</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #dc3545;">⚠️ Actividad Vencida - Atención Requerida</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            La siguiente actividad del sistema PROGIM está vencida y requiere atención inmediata:
          </p>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h3 style="color: #721c24; margin-top: 0;">📋 ${activityName}</h3>
            <div style="color: #856404; margin: 10px 0;">
              <p><strong>Días vencida:</strong> ${daysOverdue} días</p>
              <p><strong>Fecha de notificación:</strong> ${new Date().toLocaleDateString('es-GT')}</p>
              <p><strong>Sistema:</strong> PROGIM - APROFAM</p>
            </div>
          </div>
          
          <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #f5c6cb;">
            <p style="color: #721c24; margin: 0; font-size: 14px;">
              <strong>Acción requerida:</strong> Por favor, revise el estado de esta actividad en el sistema PROGIM 
              y actualice su progreso o fecha de vencimiento según corresponda.
            </p>
          </div>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © 2025 PROGIM - APROFAM | Sistema de Monitoreo Automático
          </p>
          <p style="color: #999; margin: 5px 0 0 0; font-size: 11px;">
            monitoreo.pbi@aprofam.org.gt
          </p>
        </div>
      </div>
    `
  };

  return sendEmail(emailData);
}

/**
 * Send upcoming deadline alert from APROFAM system
 */
export async function sendUpcomingAlert(email: string, activityName: string, daysUntilDeadline: number): Promise<EmailResponse> {
  const emailData: EmailData = {
    to: email,
    subject: `🟡 PROGIM APROFAM - Próximo Vencimiento: ${activityName}`,
    from: 'monitoreo.pbi@aprofam.org.gt',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🟡 AVISO PROGIM</h1>
          <p style="color: white; margin: 5px 0;">APROFAM - Próximo Vencimiento</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #e0a800;">⏰ Próximo Vencimiento - Recordatorio</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            La siguiente actividad del sistema PROGIM vence pronto y requiere su atención:
          </p>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">📋 ${activityName}</h3>
            <div style="color: #856404; margin: 10px 0;">
              <p><strong>Días restantes:</strong> ${daysUntilDeadline} días</p>
              <p><strong>Fecha de notificación:</strong> ${new Date().toLocaleDateString('es-GT')}</p>
              <p><strong>Sistema:</strong> PROGIM - APROFAM</p>
            </div>
          </div>
          
          <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #bee5eb;">
            <p style="color: #0c5460; margin: 0; font-size: 14px;">
              <strong>Recomendación:</strong> Considere revisar y actualizar el progreso de esta actividad 
              para asegurar su finalización dentro del plazo establecido.
            </p>
          </div>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © 2025 PROGIM - APROFAM | Sistema de Monitoreo Automático
          </p>
          <p style="color: #999; margin: 5px 0 0 0; font-size: 11px;">
            monitoreo.pbi@aprofam.org.gt
          </p>
        </div>
      </div>
    `
  };

  return sendEmail(emailData);
}