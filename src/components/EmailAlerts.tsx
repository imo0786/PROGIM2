import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  Mail, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Settings,
  Zap,
  Bell
} from 'lucide-react';
import { sendTestAlert, sendOverdueAlert, sendUpcomingAlert, EmailResponse } from '@/lib/emailService';

interface EmailConfig {
  email: string;
  receive_overdue_alerts: boolean;
  receive_upcoming_alerts: boolean;
  alert_days_before: number;
}

interface EmailLog {
  id: string;
  type: 'test' | 'overdue' | 'upcoming';
  email: string;
  subject: string;
  status: 'success' | 'error';
  timestamp: string;
  error?: string;
}

export default function EmailAlerts() {
  const [config, setConfig] = useState<EmailConfig>({
    email: 'monitoreo.pbi@aprofam.org.gt',
    receive_overdue_alerts: true,
    receive_upcoming_alerts: true,
    alert_days_before: 3
  });
  
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [smtpConfigured, setSmtpConfigured] = useState(false);

  useEffect(() => {
    // Load saved configuration
    const savedConfig = localStorage.getItem('progim_email_config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      // Ensure default email is set if not saved
      setConfig({
        ...parsed,
        email: parsed.email || 'monitoreo.pbi@aprofam.org.gt'
      });
    }

    // Load email logs
    const savedLogs = localStorage.getItem('progim_email_logs');
    if (savedLogs) {
      setEmailLogs(JSON.parse(savedLogs));
    }

    // Check if SMTP is configured by testing function availability
    checkSmtpConfiguration();
  }, []);

  const checkSmtpConfiguration = async () => {
    try {
      // Try to invoke the function to see if it exists
      const response = await fetch('/api/check-smtp', { method: 'HEAD' });
      setSmtpConfigured(true);
    } catch (error) {
      setSmtpConfigured(false);
    }
  };

  const saveConfig = (newConfig: EmailConfig) => {
    setConfig(newConfig);
    localStorage.setItem('progim_email_config', JSON.stringify(newConfig));
  };

  const addEmailLog = (log: Omit<EmailLog, 'id' | 'timestamp'>) => {
    const newLog: EmailLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    const updatedLogs = [newLog, ...emailLogs].slice(0, 10); // Keep only last 10 logs
    setEmailLogs(updatedLogs);
    localStorage.setItem('progim_email_logs', JSON.stringify(updatedLogs));
  };

  const handleSendTest = async () => {
    if (!config.email) {
      setMessage({ type: 'error', text: 'Por favor ingresa un email válido' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result: EmailResponse = await sendTestAlert(config.email);
      
      addEmailLog({
        type: 'test',
        email: config.email,
        subject: '🚨 PROGIM - Alerta de Prueba',
        status: result.success ? 'success' : 'error',
        error: result.error
      });

      if (result.success) {
        setMessage({ type: 'success', text: '✅ Email de prueba enviado correctamente' });
      } else {
        setMessage({ type: 'error', text: `❌ Error: ${result.message}` });
      }
    } catch (error: any) {
      addEmailLog({
        type: 'test',
        email: config.email,
        subject: '🚨 PROGIM - Alerta de Prueba',
        status: 'error',
        error: error.message
      });
      
      setMessage({ type: 'error', text: `❌ Error inesperado: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOverdueTest = async () => {
    if (!config.email) {
      setMessage({ type: 'error', text: 'Por favor ingresa un email válido' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result: EmailResponse = await sendOverdueAlert(
        config.email, 
        'Actividad de Prueba - Vencida', 
        5
      );
      
      addEmailLog({
        type: 'overdue',
        email: config.email,
        subject: '🔴 PROGIM - Actividad Vencida: Actividad de Prueba',
        status: result.success ? 'success' : 'error',
        error: result.error
      });

      if (result.success) {
        setMessage({ type: 'success', text: '✅ Alerta de vencimiento enviada correctamente' });
      } else {
        setMessage({ type: 'error', text: `❌ Error: ${result.message}` });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `❌ Error inesperado: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SMTP Configuration Status */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Estado de Configuración SMTP</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!smtpConfigured ? (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>⚠️ SMTP No Configurado</strong>
                <div className="mt-2 space-y-2">
                  <p>Para habilitar el envío de emails, ejecuta estos comandos en tu terminal:</p>
                  <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm overflow-x-auto">
                    <div># 1. Vincular proyecto Supabase</div>
                    <div>supabase link --project-ref ygeeahzplmuvxnfhouat</div>
                    <br />
                    <div># 2. Configurar secretos SMTP para Office365</div>
                    <div>supabase secrets set SMTP_HOSTNAME="smtp.office365.com"</div>
                    <div>supabase secrets set SMTP_PORT="587"</div>
                    <div>supabase secrets set SMTP_USERNAME="monitoreo.pbi@aprofam.org.gt"</div>
                    <div>supabase secrets set SMTP_PASSWORD="M0t!24$2025"</div>
                    <div>supabase secrets set SMTP_FROM="monitoreo.pbi@aprofam.org.gt"</div>
                    <br />
                    <div># 3. Desplegar función de email</div>
                    <div>supabase functions deploy send-email-smtp</div>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Nota:</strong> Credenciales configuradas para el dominio aprofam.org.gt con Office365.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>✅ SMTP Configurado Correctamente</strong>
                <p>El servicio de email está listo para enviar notificaciones desde monitoreo.pbi@aprofam.org.gt</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Configuración de Alertas por Email</span>
          </CardTitle>
          <CardDescription>
            Configura las notificaciones automáticas por correo electrónico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email para Notificaciones</Label>
            <Input
              id="email"
              type="email"
              value={config.email}
              onChange={(e) => saveConfig({ ...config, email: e.target.value })}
              placeholder="monitoreo.pbi@aprofam.org.gt"
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Email configurado para el sistema PROGIM de APROFAM
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Alertas de Actividades Vencidas</Label>
                <p className="text-sm text-muted-foreground">
                  Recibir notificaciones cuando las actividades estén vencidas
                </p>
              </div>
              <Switch
                checked={config.receive_overdue_alerts}
                onCheckedChange={(checked) => saveConfig({ ...config, receive_overdue_alerts: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Alertas de Próximos Vencimientos</Label>
                <p className="text-sm text-muted-foreground">
                  Recibir notificaciones antes de que venzan las actividades
                </p>
              </div>
              <Switch
                checked={config.receive_upcoming_alerts}
                onCheckedChange={(checked) => saveConfig({ ...config, receive_upcoming_alerts: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alert_days">Días de Anticipación para Alertas</Label>
              <Input
                id="alert_days"
                type="number"
                min="1"
                max="30"
                value={config.alert_days_before}
                onChange={(e) => saveConfig({ ...config, alert_days_before: parseInt(e.target.value) || 3 })}
                className="w-24"
              />
              <p className="text-sm text-muted-foreground">
                Enviar alertas {config.alert_days_before} días antes del vencimiento
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Emails */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Probar Envío de Emails</span>
          </CardTitle>
          <CardDescription>
            Envía emails de prueba para verificar la configuración SMTP de Office365
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleSendTest} 
              disabled={isLoading || !config.email || !smtpConfigured}
              className="flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{isLoading ? 'Enviando...' : 'Enviar Email de Prueba'}</span>
            </Button>

            <Button 
              onClick={handleSendOverdueTest}
              disabled={isLoading || !config.email || !smtpConfigured}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Probar Alerta de Vencimiento</span>
            </Button>
          </div>

          {!smtpConfigured && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>📧 Configuración APROFAM:</strong> Los botones están deshabilitados porque SMTP no está configurado. 
                Usa las credenciales de monitoreo.pbi@aprofam.org.gt proporcionadas arriba.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Historial de Emails</span>
          </CardTitle>
          <CardDescription>
            Últimos emails enviados por el sistema PROGIM
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailLogs.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-muted-foreground">No hay emails enviados aún</p>
              <p className="text-sm text-gray-500 mt-2">
                Una vez configurado SMTP, aquí aparecerán los logs de envío
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {emailLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {log.type === 'test' && <Send className="h-4 w-4 text-blue-500" />}
                      {log.type === 'overdue' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      {log.type === 'upcoming' && <Clock className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{log.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        Para: {log.email} • {new Date(log.timestamp).toLocaleString('es-GT')}
                      </p>
                      {log.error && (
                        <p className="text-xs text-red-600 mt-1">Error: {log.error}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                    {log.status === 'success' ? 'Enviado' : 'Error'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}