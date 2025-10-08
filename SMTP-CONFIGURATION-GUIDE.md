# 📧 GUÍA DE CONFIGURACIÓN SMTP PARA PROGIM

## 🎯 **RESUMEN EJECUTIVO**

Esta guía te ayudará a configurar el envío real de emails en PROGIM usando Supabase Edge Functions con SMTP. Actualmente PROGIM solo simula el envío de emails - esta configuración habilitará emails reales.

---

## 🔧 **CONFIGURACIÓN PASO A PASO**

### **PASO 1: Preparar Supabase CLI**

```bash
# Instalar Supabase CLI (si no lo tienes)
npm install -g supabase

# Verificar instalación
supabase --version
```

### **PASO 2: Conectar tu Proyecto**

```bash
# Reemplaza 'your-project-ref' con tu referencia real de proyecto
supabase link --project-ref ygeeahzplmuvxnfhouat
```

**¿Cómo encontrar tu project-ref?**
- Ve a tu dashboard de Supabase
- URL será: `https://supabase.com/dashboard/project/[TU-PROJECT-REF]`
- O busca en Settings > General > Reference ID

### **PASO 3: Configurar Credenciales SMTP**

#### **Opción A: Gmail (Recomendado para pruebas)**

```bash
supabase secrets set SMTP_HOSTNAME="smtp.gmail.com" \
SMTP_PORT="587" \
SMTP_USERNAME="tu_email@gmail.com" \
SMTP_PASSWORD="tu_app_password" \
SMTP_FROM="no-reply@progim.com"
```

**⚠️ IMPORTANTE para Gmail:**
- Usa "App Password", NO tu contraseña normal
- Habilita 2FA en tu cuenta Gmail
- Genera App Password en: Google Account > Security > App passwords

#### **Opción B: Outlook/Hotmail**

```bash
supabase secrets set SMTP_HOSTNAME="smtp-mail.outlook.com" \
SMTP_PORT="587" \
SMTP_USERNAME="tu_email@outlook.com" \
SMTP_PASSWORD="tu_password" \
SMTP_FROM="no-reply@progim.com"
```

#### **Opción C: Proveedores Profesionales**

**SendGrid:**
```bash
supabase secrets set SMTP_HOSTNAME="smtp.sendgrid.net" \
SMTP_PORT="587" \
SMTP_USERNAME="apikey" \
SMTP_PASSWORD="tu_sendgrid_api_key" \
SMTP_FROM="no-reply@progim.com"
```

**Mailgun:**
```bash
supabase secrets set SMTP_HOSTNAME="smtp.mailgun.org" \
SMTP_PORT="587" \
SMTP_USERNAME="postmaster@tu-dominio.mailgun.org" \
SMTP_PASSWORD="tu_mailgun_password" \
SMTP_FROM="no-reply@progim.com"
```

### **PASO 4: Crear la Función Edge**

Crea el archivo `supabase/functions/send-email-smtp/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, text } = await req.json()

    // Get SMTP configuration from environment
    const smtpHostname = Deno.env.get('SMTP_HOSTNAME')
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587')
    const smtpUsername = Deno.env.get('SMTP_USERNAME')
    const smtpPassword = Deno.env.get('SMTP_PASSWORD')
    const smtpFrom = Deno.env.get('SMTP_FROM')

    if (!smtpHostname || !smtpUsername || !smtpPassword || !smtpFrom) {
      throw new Error('SMTP configuration missing')
    }

    // Create SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: smtpHostname,
        port: smtpPort,
        tls: true,
        auth: {
          username: smtpUsername,
          password: smtpPassword,
        },
      },
    })

    // Send email
    await client.send({
      from: smtpFrom,
      to: to,
      subject: subject,
      content: text || 'Email from PROGIM',
      html: html,
    })

    await client.close()

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
```

### **PASO 5: Desplegar la Función**

```bash
# Desplegar la función Edge
supabase functions deploy send-email-smtp

# Verificar que se desplegó correctamente
supabase functions list
```

---

## 🧪 **PRUEBAS Y VERIFICACIÓN**

### **1. Probar desde PROGIM**

1. Ve a PROGIM → Alertas por Email
2. Ingresa tu email en "Email de Prueba"
3. Haz clic en "Enviar Prueba"
4. Revisa tu bandeja de entrada

### **2. Probar desde Terminal**

```bash
# Probar la función directamente
curl -X POST 'https://ygeeahzplmuvxnfhouat.supabase.co/functions/v1/send-email-smtp' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "tu_email@ejemplo.com",
    "subject": "Prueba SMTP",
    "html": "<h1>¡Funciona!</h1><p>Tu SMTP está configurado correctamente.</p>"
  }'
```

---

## 🔍 **SOLUCIÓN DE PROBLEMAS**

### **Error: "SMTP configuration missing"**
- Verifica que todas las variables estén configuradas:
```bash
supabase secrets list
```

### **Error: "Authentication failed"**
- **Gmail**: Usa App Password, no contraseña normal
- **Outlook**: Habilita "Less secure app access"
- Verifica usuario/contraseña

### **Error: "Connection timeout"**
- Verifica hostname y puerto
- Algunos ISPs bloquean puerto 587, prueba 465

### **Emails van a SPAM**
- Configura SPF/DKIM en tu dominio
- Usa un dominio verificado como remitente
- Evita palabras spam en subject/contenido

---

## 📊 **MONITOREO Y LOGS**

### **Ver Logs de la Función**

```bash
# Ver logs en tiempo real
supabase functions logs send-email-smtp

# Ver logs específicos
supabase functions logs send-email-smtp --level error
```

### **Dashboard de Emails en PROGIM**

- **Estado SMTP**: Verde = configurado, Amarillo = pendiente
- **Historial**: Todos los emails enviados con status
- **Errores**: Mensajes detallados de fallos

---

## 🚀 **CONFIGURACIÓN AVANZADA**

### **Plantillas de Email Personalizadas**

Modifica `send-email-smtp/index.ts` para usar plantillas:

```typescript
// Plantilla para alertas vencidas
const overdueTemplate = (activities) => `
  <div style="font-family: Arial, sans-serif;">
    <h2 style="color: #dc2626;">⚠️ Actividades Vencidas</h2>
    <ul>
      ${activities.map(a => `<li>${a.name} - Vencida desde ${a.days_overdue} días</li>`).join('')}
    </ul>
  </div>
`
```

### **Programar Emails Automáticos**

Usa Supabase Cron Jobs:

```sql
-- Crear función para enviar alertas diarias
CREATE OR REPLACE FUNCTION send_daily_alerts()
RETURNS void AS $$
BEGIN
  -- Lógica para detectar actividades vencidas
  -- Llamar a la función Edge para enviar emails
END;
$$ LANGUAGE plpgsql;

-- Programar para ejecutar diariamente a las 9 AM
SELECT cron.schedule('daily-alerts', '0 9 * * *', 'SELECT send_daily_alerts();');
```

---

## ✅ **CHECKLIST DE CONFIGURACIÓN**

- [ ] Supabase CLI instalado
- [ ] Proyecto vinculado con `supabase link`
- [ ] Variables SMTP configuradas con `supabase secrets set`
- [ ] Función `send-email-smtp` creada
- [ ] Función desplegada con `supabase functions deploy`
- [ ] Email de prueba enviado exitosamente
- [ ] PROGIM muestra "SMTP Configurado Correctamente"

---

## 🎯 **PRÓXIMOS PASOS**

1. **Configura alertas automáticas** para actividades vencidas
2. **Personaliza plantillas** de email con tu branding
3. **Configura SPF/DKIM** para mejor deliverability
4. **Monitorea métricas** de emails enviados/fallidos

---

## 🆘 **SOPORTE**

Si tienes problemas:

1. **Revisa logs**: `supabase functions logs send-email-smtp`
2. **Verifica secrets**: `supabase secrets list`
3. **Prueba SMTP manualmente** con herramientas como Telnet
4. **Contacta soporte** de tu proveedor SMTP

**¡Tu sistema de emails estará funcionando en minutos!** 🚀