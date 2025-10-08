# ⚡ **COMANDOS RÁPIDOS - CONFIGURACIÓN SUPABASE PROGIM**

## 🚀 **CONFIGURACIÓN COMPLETA EN 5 MINUTOS**

### **PASO 1: Instalar y conectar**
```bash
# Instalar Supabase CLI
npm install -g supabase

# Iniciar sesión
supabase login

# Vincular proyecto PROGIM
supabase link --project-ref ygeeahzplmuvxnfhouat
```

### **PASO 2: Crear estructura**
```bash
# Crear carpetas para la función
mkdir -p supabase/functions/send-email-smtp
```

### **PASO 3: Configurar credenciales APROFAM**
```bash
# Configurar Office365 + APROFAM
supabase secrets set SMTP_HOSTNAME="smtp.office365.com"
supabase secrets set SMTP_PORT="587"
supabase secrets set SMTP_USERNAME="monitoreo.pbi@aprofam.org.gt"
supabase secrets set SMTP_PASSWORD="M0t!24$2025"
supabase secrets set SMTP_FROM="monitoreo.pbi@aprofam.org.gt"
```

### **PASO 4: Desplegar función**
```bash
# Desplegar función de email
supabase functions deploy send-email-smtp

# Verificar despliegue
supabase functions list
```

### **PASO 5: Verificar configuración**
```bash
# Ver secretos configurados
supabase secrets list

# Ver logs de la función
supabase functions logs send-email-smtp
```

---

## 🔧 **COMANDOS DE VERIFICACIÓN**

```bash
# ¿Está instalado Supabase CLI?
supabase --version

# ¿Estoy conectado?
supabase projects list

# ¿Está vinculado el proyecto?
supabase status

# ¿Están los secretos?
supabase secrets list

# ¿Está la función desplegada?
supabase functions list

# ¿Hay errores en los logs?
supabase functions logs send-email-smtp --level error
```

---

## 🐛 **COMANDOS DE SOLUCIÓN RÁPIDA**

```bash
# Problema: CLI no instalado
npm install -g supabase

# Problema: No conectado
supabase login

# Problema: Proyecto no vinculado
supabase link --project-ref ygeeahzplmuvxnfhouat

# Problema: Función no desplegada
supabase functions deploy send-email-smtp

# Problema: Credenciales incorrectas
supabase secrets set SMTP_PASSWORD="M0t!24$2025"

# Problema: Ver qué está pasando
supabase functions logs send-email-smtp --follow
```

---

## 🧹 **COMANDOS DE LIMPIEZA (EMERGENCIA)**

```bash
# Borrar función y empezar de nuevo
supabase functions delete send-email-smtp

# Desconectar y reconectar
supabase logout
supabase login
supabase link --project-ref ygeeahzplmuvxnfhouat

# Re-configurar todo desde cero
supabase secrets set SMTP_HOSTNAME="smtp.office365.com"
supabase secrets set SMTP_USERNAME="monitoreo.pbi@aprofam.org.gt"
supabase secrets set SMTP_PASSWORD="M0t!24$2025"
supabase functions deploy send-email-smtp
```

---

## ✅ **VERIFICACIÓN FINAL**

### **¿Todo configurado correctamente?**
```bash
# Estos comandos deberían mostrar resultados positivos:

supabase --version                    # Versión instalada
supabase projects list               # Lista de proyectos
supabase secrets list               # 5 secretos SMTP
supabase functions list             # send-email-smtp ACTIVE
```

### **¿Funciona el envío de emails?**
1. Ve a `progim.vercel.app`
2. Login: `prueba` / `123`
3. "Alertas por Email" → Indicador verde ✅
4. "Enviar Email de Prueba" → ¡Funciona! 📧

**¡Listo! PROGIM puede enviar emails reales con APROFAM.** 🎉