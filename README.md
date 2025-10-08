# 🎯 PROGIM - Plataforma de Monitoreo y Gestión de Impacto

Una aplicación web moderna para la gestión integral de proyectos, actividades y seguimiento de impacto, desarrollada con React, TypeScript y Supabase.

## ✨ Características Principales

- **Dashboard Interactivo** - Métricas y KPIs en tiempo real
- **Gestión de Proyectos** - CRUD completo para proyectos y actividades
- **Sub-actividades** - Gestión detallada de tareas y subtareas
- **Catálogos Dinámicos** - Estados, responsables y configuraciones
- **Persistencia de Datos** - Integración con Supabase
- **UI Moderna** - Diseño responsivo con Shadcn/UI y Tailwind CSS

## 🚀 Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Shadcn/UI, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage)
- **Routing**: React Router DOM
- **State Management**: React Query (TanStack Query)
- **Build Tool**: Vite
- **Deployment**: Vercel

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- pnpm (recomendado) o npm

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/progim.git
cd progim
```

### 2. Instalar dependencias
```bash
pnpm install
# o
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 4. Ejecutar en desarrollo
```bash
pnpm run dev
# o
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🗄️ Configuración de Supabase

### Tablas necesarias:

```sql
-- Tabla de proyectos
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de estados
CREATE TABLE states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de responsables
CREATE TABLE responsibles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de actividades
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  state_id UUID REFERENCES states(id),
  responsible_id UUID REFERENCES responsibles(id),
  start_date DATE,
  end_date DATE,
  manual_percentage INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de sub-actividades
CREATE TABLE sub_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  state_id UUID REFERENCES states(id),
  responsible_id UUID REFERENCES responsibles(id),
  start_date DATE,
  end_date DATE,
  manual_percentage INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
pnpm run dev

# Build para producción
pnpm run build

# Preview del build
pnpm run preview

# Linting
pnpm run lint

# Formateo de código
pnpm run format
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes de Shadcn/UI
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── ActivityList.tsx # Lista de actividades
│   ├── CatalogManager.tsx # Gestión de catálogos
│   └── ...
├── lib/                # Utilidades y configuración
│   ├── supabase.ts     # Cliente de Supabase
│   ├── storage.ts      # Funciones de almacenamiento
│   └── utils.ts        # Utilidades generales
├── types/              # Definiciones de TypeScript
│   └── index.ts        # Interfaces principales
├── pages/              # Páginas de la aplicación
└── hooks/              # Custom hooks
```

## 🚀 Despliegue en Vercel

### 1. Conectar repositorio
- Importar proyecto desde GitHub en Vercel
- Seleccionar el repositorio

### 2. Configurar variables de entorno
En Vercel Dashboard → Settings → Environment Variables:
```
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 3. Deploy
Vercel detectará automáticamente la configuración de Vite y desplegará la aplicación.

## 📊 Funcionalidades

### Dashboard
- Métricas de proyectos activos
- Estadísticas de actividades
- Gráficos de progreso
- KPIs principales

### Gestión de Proyectos
- Crear, editar y eliminar proyectos
- Asignar actividades y responsables
- Seguimiento de estados y progreso

### Actividades y Sub-actividades
- CRUD completo
- Asignación de responsables
- Control de fechas y porcentajes
- Notas y observaciones

### Catálogos
- Gestión de estados personalizables
- Administración de responsables
- Configuraciones dinámicas

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes alguna pregunta o necesitas ayuda:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

---

**Desarrollado con ❤️ usando React, TypeScript y Supabase**