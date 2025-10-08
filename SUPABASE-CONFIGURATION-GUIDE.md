# 🚀 **GUÍA DE CONFIGURACIÓN SUPABASE PARA PROGIM**

## 📋 **RESUMEN EJECUTIVO**
Esta guía te ayudará a configurar correctamente Supabase para que PROGIM funcione completamente. El sistema requiere configuración de base de datos, autenticación y servicios de email.

---

## 🔧 **1. CONFIGURACIÓN INICIAL DE SUPABASE**

### **Paso 1: Crear Proyecto Supabase**
1. Ve a [supabase.com](https://supabase.com)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Guarda las credenciales del proyecto

### **Paso 2: Obtener Credenciales**
En tu dashboard de Supabase, ve a **Settings > API**:
- **Project URL**: `https://tu-proyecto.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 🗄️ **2. ESTRUCTURA DE BASE DE DATOS REQUERIDA**

### **Tabla: `projects`**
```sql
CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    objective TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Tabla: `activities`**
```sql
CREATE TABLE activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    state TEXT NOT NULL,
    assigned_to TEXT,
    start_date DATE,
    end_date DATE,
    percentage INTEGER DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),
    notes TEXT,
    days_elapsed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Tabla: `sub_activities`**
```sql
CREATE TABLE sub_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    state TEXT NOT NULL,
    assigned_to TEXT,
    start_date DATE,
    due_date DATE,
    hours_spent INTEGER DEFAULT 0,
    percentage INTEGER DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Tabla: `catalogs`**
```sql
CREATE TABLE catalogs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Tabla: `auth_users`** (Para autenticación personalizada)
```sql
CREATE TABLE auth_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔐 **3. CONFIGURACIÓN DE AUTENTICACIÓN**

### **Opción A: Autenticación Personalizada (Actual)**
PROGIM usa una tabla `auth_users` personalizada. Inserta los usuarios:

```sql
-- Usuario principal
INSERT INTO auth_users (username, password_hash, full_name) VALUES 
('Monitoreo', 'Me2025', 'Sistema de Monitoreo');

-- Usuario de prueba
INSERT INTO auth_users (username, password_hash, full_name) VALUES 
('prueba', '123', 'Usuario de Prueba');

-- Usuario admin
INSERT INTO auth_users (username, password_hash, full_name) VALUES 
('admin', 'admin123', 'Administrador');
```

### **Opción B: Supabase Auth (Recomendado para producción)**
Para mayor seguridad, puedes migrar a Supabase Auth:
1. Ve a **Authentication > Settings**
2. Configura proveedores de autenticación
3. Actualiza el código para usar `supabase.auth.signInWithPassword()`

---

## 🛡️ **4. POLÍTICAS DE SEGURIDAD (RLS)**

### **Habilitar Row Level Security**
```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;
```

### **Políticas de Acceso**
```sql
-- Permitir acceso completo a usuarios autenticados
CREATE POLICY "Enable all for authenticated users" ON projects
    FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON activities
    FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON sub_activities
    FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON catalogs
    FOR ALL USING (true);

-- Política especial para auth_users (solo lectura)
CREATE POLICY "Enable read for auth_users" ON auth_users
    FOR SELECT USING (true);
```

---

## 📧 **5. CONFIGURACIÓN DE EMAIL (OPCIONAL)**

### **Paso 1: Crear Edge Function para Emails**
1. Ve a **Edge Functions** en tu dashboard
2. Crea una nueva función llamada `send_test_email`
3. Usa este código base:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    // Configurar servicio de email (Resend, SendGrid, etc.)
    const emailService = new EmailService();
    
    const result = await emailService.send({
      to: 'imolina@aprofam.org.gt',
      subject: 'Prueba Sistema PROGIM',
      html: '<h1>Email de prueba funcionando</h1>'
    });
    
    return new Response(JSON.stringify({ success: true, result }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

### **Paso 2: Configurar Variables de Entorno**
En **Settings > Environment Variables**:
```
RESEND_API_KEY=re_xxxxxxxxxx
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=monitoreo.pbi@aprofam.org.gt
SMTP_PASSWORD=tu_password
FROM_EMAIL=monitoreo.pbi@aprofam.org.gt
```

---

## ⚙️ **6. VARIABLES DE ENTORNO EN TU APLICACIÓN**

Actualiza tu archivo `.env.local`:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

---

## 🚀 **7. DATOS DE PRUEBA (OPCIONAL)**

### **Insertar Datos de Ejemplo**
```sql
-- Proyectos de ejemplo
INSERT INTO projects (name, objective, is_active) VALUES 
('Proyecto MEL 2025', 'Sistema de Monitoreo, Evaluación y Aprendizaje', true),
('Dashboard Ejecutivo', 'Tablero de control para seguimiento de KPIs', true);

-- Actividades de ejemplo
INSERT INTO activities (name, project_id, state, assigned_to, start_date, end_date, percentage, notes, days_elapsed) VALUES 
('Desarrollo del Sistema MEL', (SELECT id FROM projects WHERE name = 'Proyecto MEL 2025'), 'En Progreso', 'Equipo Técnico', '2025-01-01', '2025-03-01', 75, 'Avance según cronograma', 30),
('Implementación Dashboard', (SELECT id FROM projects WHERE name = 'Dashboard Ejecutivo'), 'Completado', 'Alex Engineer', '2025-01-01', '2025-01-15', 100, 'Completado exitosamente', 15);

-- Catálogos de ejemplo
INSERT INTO catalogs (type, name) VALUES 
('estado', 'En Progreso'),
('estado', 'Completado'),
('estado', 'Pendiente'),
('asignado', 'Equipo Técnico'),
('asignado', 'Alex Engineer'),
('asignado', 'Equipo Capacitación');
```

---

## ✅ **8. VERIFICACIÓN DE CONFIGURACIÓN**

### **Lista de Verificación**
- [ ] ✅ Proyecto Supabase creado
- [ ] ✅ Credenciales configuradas en `.env.local`
- [ ] ✅ Tablas creadas (`projects`, `activities`, `sub_activities`, `catalogs`, `auth_users`)
- [ ] ✅ Usuarios insertados en `auth_users`
- [ ] ✅ Políticas RLS configuradas
- [ ] ✅ Datos de prueba insertados (opcional)
- [ ] ✅ Edge Functions para email (opcional)

### **Probar Conexión**
1. Abre PROGIM en tu navegador
2. Intenta hacer login con: `Monitoreo` / `Me2025`
3. Verifica que aparezcan proyectos y actividades
4. Prueba el botón "ENVIAR PRUEBA" en la sección de emails

---

## 🚨 **9. PROBLEMAS COMUNES Y SOLUCIONES**

### **Error: "No se puede conectar a Supabase"**
- Verifica las credenciales en `.env.local`
- Asegúrate de que el proyecto Supabase esté activo
- Revisa que las URLs sean correctas

### **Error: "Usuario no encontrado"**
- Verifica que los usuarios estén insertados en `auth_users`
- Confirma que las contraseñas coincidan exactamente
- Revisa las políticas RLS

### **Error: "Tabla no existe"**
- Ejecuta todos los scripts SQL de creación de tablas
- Verifica los nombres de las tablas en el dashboard
- Asegúrate de usar el esquema `public`

### **Emails no se envían**
- Configura las Edge Functions para email
- Verifica las variables de entorno del servicio de email
- Prueba la función desde el dashboard de Supabase

---

## 📞 **10. SOPORTE ADICIONAL**

Si necesitas ayuda adicional:
1. Revisa la documentación oficial de [Supabase](https://supabase.com/docs)
2. Verifica los logs en el dashboard de Supabase
3. Usa las herramientas de desarrollo del navegador para debugging

---

## 🎯 **RESUMEN DE CONFIGURACIÓN MÍNIMA**

**Para que PROGIM funcione básicamente, necesitas:**
1. ✅ Crear proyecto Supabase
2. ✅ Configurar credenciales en `.env.local`
3. ✅ Crear las 5 tablas principales
4. ✅ Insertar usuarios en `auth_users`
5. ✅ Configurar políticas RLS básicas

**¡Con estos pasos, PROGIM debería funcionar completamente!** 🚀

---

*Última actualización: Enero 2025*
*Versión: PROGIM v1.0*