# 🚨 **SOLUCIÓN COMPLETA DE EMAIL - MÚLTIPLES ALTERNATIVAS**

## 🎯 **PROBLEMA: EMAILS NO SE ENVÍAN - SOLUCIONES INMEDIATAS**

### 🔥 **OPCIÓN 1: EMAILJS (MÁS RÁPIDA - SIN BACKEND)**

#### **Paso 1: Configurar EmailJS**
1. Ve a [emailjs.com](https://www.emailjs.com)
2. Crea cuenta gratuita
3. Crea un servicio de email (Gmail/Outlook)
4. Crea un template
5. Obtén tu `SERVICE_ID`, `TEMPLATE_ID`, `PUBLIC_KEY`

#### **Paso 2: Código Frontend para EmailJS**
```typescript
// Instalar: npm install @emailjs/browser

import emailjs from '@emailjs/browser';

const sendEmailViaEmailJS = async (to: string, subject: string, message: string) => {
  try {
    const templateParams = {
      to_email: to,
      subject: subject,
      message: message,
      from_name: 'PROGIM - APROFAM',
      reply_to: 'monitoreo.pbi@aprofam.org.gt'
    };

    const result = await emailjs.send(
      'YOUR_SERVICE_ID',    // Reemplazar con tu Service ID
      'YOUR_TEMPLATE_ID',   // Reemplazar con tu Template ID
      templateParams,
      'YOUR_PUBLIC_KEY'     // Reemplazar con tu Public Key
    );

    console.log('✅ Email enviado via EmailJS:', result);
    return { success: true, message: 'Email enviado exitosamente' };
  } catch (error) {
    console.error('❌ Error EmailJS:', error);
    return { success: false, error: error.message };
  }
};
```

---

### 🔧 **OPCIÓN 2: EDGE FUNCTION MEJORADA CON DEBUGGING**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 INICIO - Edge Function send-email-smtp')
  console.log('📋 Method:', req.method)
  console.log('📋 URL:', req.url)
  
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📥 Leyendo request body...')
    const body = await req.text()
    console.log('📋 Raw body:', body)
    
    const { to, subject, html, from } = JSON.parse(body)
    
    console.log('📋 Parsed data:', {
      to: to,
      subject: subject,
      from: from,
      hasHtml: !!html,
      htmlLength: html?.length
    })

    if (!to || !subject || !html) {
      const error = 'Missing required fields: to, subject, html'
      console.error('❌', error)
      throw new Error(error)
    }

    // USAR FETCH PARA ENVIAR VIA WEBHOOK EXTERNO
    console.log('📤 Enviando via webhook externo...')
    
    const webhookResponse = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: to,
        subject: subject,
        message: html,
        _replyto: 'monitoreo.pbi@aprofam.org.gt'
      })
    })

    if (!webhookResponse.ok) {
      throw new Error(`Webhook failed: ${webhookResponse.status}`)
    }

    console.log('✅ Email enviado exitosamente via webhook')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully via webhook',
        provider: 'Formspree',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('❌ ERROR COMPLETO:', error)
    console.error('❌ Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
```

---

### 📧 **OPCIÓN 3: FORMSPREE (SIN CÓDIGO BACKEND)**

#### **Configuración:**
1. Ve a [formspree.io](https://formspree.io)
2. Crea cuenta gratuita
3. Crea nuevo form
4. Obtén tu FORM_ID

#### **Código Frontend:**
```typescript
const sendEmailViaFormspree = async (to: string, subject: string, message: string) => {
  try {
    const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: to,
        subject: subject,
        message: message,
        _replyto: 'monitoreo.pbi@aprofam.org.gt'
      })
    });

    if (response.ok) {
      return { success: true, message: 'Email enviado via Formspree' };
    } else {
      throw new Error('Formspree request failed');
    }
  } catch (error) {
    console.error('❌ Error Formspree:', error);
    return { success: false, error: error.message };
  }
};
```

---

### 🧪 **COMANDOS DE TESTING COMPLETOS**

#### **Test 1: Verificar función existe**
```bash
curl -I https://ygeeahzplmuvxnfhouat.supabase.co/functions/v1/send-email-smtp
```

#### **Test 2: Probar función con datos mínimos**
```bash
curl -X POST 'https://ygeeahzplmuvxnfhouat.supabase.co/functions/v1/send-email-smtp' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnZWVhaHpwbG11dnhuZmhvdWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc0NjQ3NzMsImV4cCI6MjA0MzA0MDc3M30.VgBbLdlXFxNbGKfKJTHLZN2k7qBbBNkMZFnPQdDZnJY' \
  -H 'Content-Type: application/json' \
  -d '{"to":"test@example.com","subject":"Test","html":"<p>Test</p>"}'
```

#### **Test 3: Verificar logs detallados**
```bash
# En Supabase Dashboard:
# 1. Edge Functions → send-email-smtp → Logs
# 2. Buscar mensajes que empiecen con 🚀, 📋, ✅, ❌
```

---

### 🎯 **IMPLEMENTACIÓN INMEDIATA - CÓDIGO LISTO**

#### **Componente React con múltiples fallbacks:**
```typescript
import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

const EmailSender = () => {
  const [status, setStatus] = useState('');

  const sendEmail = async (to: string, subject: string, message: string) => {
    setStatus('Enviando...');

    // MÉTODO 1: EmailJS (más confiable)
    try {
      await emailjs.send(
        'service_id',
        'template_id', 
        { to_email: to, subject, message },
        'public_key'
      );
      setStatus('✅ Email enviado via EmailJS');
      return;
    } catch (error) {
      console.log('EmailJS falló, probando Formspree...');
    }

    // MÉTODO 2: Formspree
    try {
      const response = await fetch('https://formspree.io/f/form_id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: to, subject, message })
      });
      
      if (response.ok) {
        setStatus('✅ Email enviado via Formspree');
        return;
      }
    } catch (error) {
      console.log('Formspree falló, probando Edge Function...');
    }

    // MÉTODO 3: Edge Function
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html: message })
      });
      
      if (response.ok) {
        setStatus('✅ Email enviado via Edge Function');
        return;
      }
    } catch (error) {
      setStatus('❌ Todos los métodos fallaron');
    }
  };

  return (
    <div>
      <button onClick={() => sendEmail('test@example.com', 'Test', 'Mensaje de prueba')}>
        Enviar Email de Prueba
      </button>
      <p>{status}</p>
    </div>
  );
};

export default EmailSender;
```

---

## 🚀 **RECOMENDACIÓN INMEDIATA**

### **Para solución HOY:**
1. **Usar EmailJS** - 5 minutos de configuración
2. **Backup con Formspree** - Otros 5 minutos
3. **Mantener Edge Function** como tercera opción

### **Pasos inmediatos:**
1. Crear cuenta EmailJS
2. Configurar servicio Gmail/Outlook
3. Implementar código frontend
4. ¡Emails funcionando en 10 minutos!

**¿Cuál opción quieres implementar primero? EmailJS es la más rápida y confiable.**