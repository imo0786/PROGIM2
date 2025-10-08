# 🚀 **DESPLEGAR EDGE FUNCTION - GITHUB + VERCEL + SUPABASE**

## 🎯 **TU CONFIGURACIÓN ACTUAL**
- ✅ **Código:** GitHub repository
- ✅ **Frontend:** Vercel (progim.vercel.app)
- ✅ **Base de datos:** Supabase
- ✅ **SMTP:** Ya configurado en Supabase UI
- ❌ **Edge Function:** Falta desplegar

---

## 🌐 **OPCIÓN 1: SUPABASE DASHBOARD (MÁS FÁCIL)**

### **PASO 1: Ir a Supabase Dashboard**
1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión
3. Selecciona tu proyecto PROGIM

### **PASO 2: Crear Edge Function**
1. En el menú izquierdo, haz clic en **"Edge Functions"**
2. Haz clic en **"Create a new function"**
3. Nombre: `send-email-smtp`
4. Pega este código:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📧 Iniciando función de email APROFAM...')
    
    const { to, subject, html, from } = await req.json()

    if (!to || !subject || !html) {
      throw new Error('Missing required fields: to, subject, html')
    }

    // APROFAM Office365 SMTP Configuration
    const SMTP_HOSTNAME = Deno.env.get('SMTP_HOSTNAME') || 'smtp.office365.com'
    const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '587')
    const SMTP_USERNAME = Deno.env.get('SMTP_USERNAME') || 'monitoreo.pbi@aprofam.org.gt'
    const SMTP_PASSWORD = Deno.env.get('SMTP_PASSWORD') || 'M0t!24$2025'
    const SMTP_FROM = from || Deno.env.get('SMTP_FROM') || 'monitoreo.pbi@aprofam.org.gt'

    console.log('🔧 Configuración SMTP APROFAM:', {
      hostname: SMTP_HOSTNAME,
      port: SMTP_PORT,
      username: SMTP_USERNAME,
      from: SMTP_FROM,
      to: to,
      hasPassword: !!SMTP_PASSWORD
    })

    // Create SMTP client for Office365
    const client = new SMTPClient({
      connection: {
        hostname: SMTP_HOSTNAME,
        port: SMTP_PORT,
        tls: true,
        auth: {
          username: SMTP_USERNAME,
          password: SMTP_PASSWORD,
        },
      },
    })

    console.log('📤 Enviando email via Office365...')

    // Send email
    await client.send({
      from: SMTP_FROM,
      to: to,
      subject: subject,
      content: 'Email from PROGIM - APROFAM',
      html: html,
    })

    await client.close()

    console.log('✅ Email enviado exitosamente via APROFAM Office365')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully via APROFAM SMTP',
        provider: 'Office365',
        from: SMTP_FROM,
        to: to,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('❌ Error enviando email APROFAM:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        provider: 'Office365 APROFAM',
        timestamp: new Date().toISOString(),
        details: 'Check SMTP configuration and credentials'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
```

### **PASO 3: Configurar Variables de Entorno**
En el dashboard de Supabase:
1. Ve a **"Settings"** → **"Edge Functions"**
2. Agrega estas variables:
   - `SMTP_HOSTNAME`: `smtp.office365.com`
   - `SMTP_PORT`: `587`
   - `SMTP_USERNAME`: `monitoreo.pbi@aprofam.org.gt`
   - `SMTP_PASSWORD`: `M0t!24$2025`
   - `SMTP_FROM`: `monitoreo.pbi@aprofam.org.gt`

### **PASO 4: Desplegar**
1. Haz clic en **"Deploy function"**
2. Espera a que aparezca como **"Active"**

---

## 🌟 **OPCIÓN 2: GITHUB CODESPACES (RECOMENDADO)**

### **PASO 1: Abrir Codespaces**
1. Ve a tu repositorio en GitHub
2. Haz clic en **"Code"** → **"Codespaces"** → **"Create codespace"**

### **PASO 2: Instalar Supabase CLI en Codespaces**
```bash
npm install -g supabase
```

### **PASO 3: Hacer Login y Vincular**
```bash
supabase login
supabase link --project-ref ygeeahzplmuvxnfhouat
```

### **PASO 4: Desplegar la Función**
```bash
supabase functions deploy send-email-smtp
```

---

## 🔧 **OPCIÓN 3: GITHUB ACTIONS (AUTOMÁTICO)**

### **Crear archivo: `.github/workflows/deploy-supabase.yml`**
```yaml
name: Deploy Supabase Functions

on:
  push:
    branches: [ main ]
    paths: [ 'supabase/functions/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install Supabase CLI
        run: npm install -g supabase
        
      - name: Deploy functions
        run: |
          supabase login --token ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          supabase link --project-ref ygeeahzplmuvxnfhouat
          supabase functions deploy send-email-smtp
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

**Necesitarás agregar `SUPABASE_ACCESS_TOKEN` en GitHub Secrets**

---

## ✅ **VERIFICAR QUE FUNCIONA**

### **Después del despliegue:**
1. Ve a Supabase Dashboard → Edge Functions
2. Deberías ver `send-email-smtp` como **"Active"**
3. Ve a `progim.vercel.app`
4. Prueba el botón **"Enviar Email de Prueba"**

---

## 🎯 **RECOMENDACIÓN**

**Para tu flujo de trabajo GitHub → Vercel → Supabase:**

1. **Usa OPCIÓN 2 (GitHub Codespaces)** - Es lo más parecido a tu flujo actual
2. **O OPCIÓN 1 (Dashboard)** - Si prefieres interfaz web

**¿Cuál prefieres probar primero?**

---

## 📞 **AYUDA RÁPIDA**

**Si eliges Codespaces:**
- Abre Codespace en tu repo
- Ejecuta los comandos que te doy
- La función se desplegará automáticamente

**Si eliges Dashboard:**
- Copia y pega el código en Supabase
- Configura las variables
- Haz clic en Deploy

**¡Cualquiera de las dos opciones solucionará el error "Failed to send a request to the Edge Function"!**