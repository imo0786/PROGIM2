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

    if (!SMTP_PASSWORD) {
      throw new Error('SMTP_PASSWORD not configured in secrets')
    }

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