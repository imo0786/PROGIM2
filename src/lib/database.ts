// Sistema de base de datos completamente offline
// Funciona sin dependencias externas

// Datos locales del sistema
const localProjects = [
  {
    id: '1',
    name: 'Proyecto MEL 2025',
    objective: 'Sistema de Monitoreo, Evaluación y Aprendizaje',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Dashboard Ejecutivo',
    objective: 'Tablero de control para seguimiento de KPIs',
    is_active: true,
    created_at: '2025-01-02T00:00:00Z'
  }
];

const localActivities = [
  {
    id: '1',
    name: 'Desarrollo del Sistema MEL',
    project_id: '1',
    state: 'En Progreso',
    assigned_to: 'Equipo Técnico',
    start_date: '2025-01-01',
    end_date: '2025-03-01',
    percentage: 75,
    notes: 'Avance según cronograma',
    days_elapsed: 30,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Implementación Dashboard',
    project_id: '2',
    state: 'Completado',
    assigned_to: 'Alex Engineer',
    start_date: '2025-01-01',
    end_date: '2025-01-15',
    percentage: 100,
    notes: 'Completado exitosamente',
    days_elapsed: 15,
    created_at: '2025-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'Capacitación de Usuarios',
    project_id: '1',
    state: 'Pendiente',
    assigned_to: 'Equipo Capacitación',
    start_date: '2025-02-01',
    end_date: '2025-02-15',
    percentage: 0,
    notes: 'Por iniciar',
    days_elapsed: 0,
    created_at: '2025-01-03T00:00:00Z'
  }
];

const localCatalogs = [
  { id: '1', type: 'estado', name: 'En Progreso', created_at: '2025-01-01T00:00:00Z' },
  { id: '2', type: 'estado', name: 'Completado', created_at: '2025-01-01T00:00:00Z' },
  { id: '3', type: 'estado', name: 'Pendiente', created_at: '2025-01-01T00:00:00Z' },
  { id: '4', type: 'asignado', name: 'Equipo Técnico', created_at: '2025-01-01T00:00:00Z' },
  { id: '5', type: 'asignado', name: 'Alex Engineer', created_at: '2025-01-01T00:00:00Z' },
  { id: '6', type: 'asignado', name: 'Equipo Capacitación', created_at: '2025-01-01T00:00:00Z' }
];

// Simulación de delay para hacer más realista
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// EXPORTACIONES PRINCIPALES
export const getProjects = async () => {
  await delay(100);
  return [...localProjects];
};

export const getActivities = async () => {
  await delay(100);
  return [...localActivities];
};

export const getCatalogs = async () => {
  await delay(100);
  return [...localCatalogs];
};

// AUTENTICACIÓN LOCAL
export const validateUser = async (username: string, password: string) => {
  await delay(200);
  
  if (username === 'Monitoreo' && password === 'Me2025') {
    return {
      id: '1',
      username: 'Monitoreo',
      full_name: 'Sistema de Monitoreo',
      created_at: new Date().toISOString()
    };
  }
  
  if (username === 'admin' && password === 'admin123') {
    return {
      id: '2',
      username: 'admin',
      full_name: 'Administrador',
      created_at: new Date().toISOString()
    };
  }
  
  return null;
};

// CRUD PROYECTOS
export const createProject = async (name: string, objective: string) => {
  await delay(200);
  const newProject = {
    id: Date.now().toString(),
    name,
    objective,
    is_active: true,
    created_at: new Date().toISOString()
  };
  localProjects.unshift(newProject);
  return newProject;
};

export const updateProject = async (id: string, name: string, objective: string) => {
  await delay(200);
  const projectIndex = localProjects.findIndex(p => p.id === id);
  if (projectIndex !== -1) {
    localProjects[projectIndex] = {
      ...localProjects[projectIndex],
      name,
      objective
    };
    return localProjects[projectIndex];
  }
  throw new Error('Proyecto no encontrado');
};

export const deleteProject = async (id: string) => {
  await delay(200);
  const projectIndex = localProjects.findIndex(p => p.id === id);
  if (projectIndex !== -1) {
    localProjects.splice(projectIndex, 1);
    return true;
  }
  return true;
};

// CRUD ACTIVIDADES
export const createActivity = async (activity: any) => {
  await delay(200);
  const newActivity = {
    id: Date.now().toString(),
    name: activity.name,
    project_id: activity.project_id,
    state: activity.state,
    assigned_to: activity.assigned_to,
    start_date: activity.start_date,
    end_date: activity.end_date,
    percentage: activity.percentage,
    notes: activity.notes || '',
    days_elapsed: activity.days_elapsed || 0,
    created_at: new Date().toISOString()
  };
  localActivities.unshift(newActivity);
  return newActivity;
};

export const updateActivity = async (id: string, activity: any) => {
  await delay(200);
  const activityIndex = localActivities.findIndex(a => a.id === id);
  if (activityIndex !== -1) {
    localActivities[activityIndex] = {
      ...localActivities[activityIndex],
      name: activity.name,
      project_id: activity.project_id,
      state: activity.state,
      assigned_to: activity.assigned_to,
      start_date: activity.start_date,
      end_date: activity.end_date,
      percentage: activity.percentage,
      notes: activity.notes || '',
      days_elapsed: activity.days_elapsed || 0
    };
    return localActivities[activityIndex];
  }
  throw new Error('Actividad no encontrada');
};

export const deleteActivity = async (id: string) => {
  await delay(200);
  const activityIndex = localActivities.findIndex(a => a.id === id);
  if (activityIndex !== -1) {
    localActivities.splice(activityIndex, 1);
    return true;
  }
  return true;
};

// CRUD CATÁLOGOS
export const createCatalogItem = async (type: string, name: string) => {
  await delay(200);
  const newItem = {
    id: Date.now().toString(),
    type,
    name,
    created_at: new Date().toISOString()
  };
  localCatalogs.unshift(newItem);
  return newItem;
};

export const updateCatalogItem = async (id: string, name: string) => {
  await delay(200);
  const itemIndex = localCatalogs.findIndex(c => c.id === id);
  if (itemIndex !== -1) {
    localCatalogs[itemIndex] = {
      ...localCatalogs[itemIndex],
      name
    };
    return localCatalogs[itemIndex];
  }
  throw new Error('Elemento de catálogo no encontrado');
};

export const deleteCatalogItem = async (id: string) => {
  await delay(200);
  const itemIndex = localCatalogs.findIndex(c => c.id === id);
  if (itemIndex !== -1) {
    localCatalogs.splice(itemIndex, 1);
    return true;
  }
  return true;
};

// SUB-ACTIVIDADES (funciones básicas)
export const getSubActivities = async () => {
  await delay(100);
  return [];
};

export const createSubActivity = async (subActivity: any) => {
  await delay(200);
  return {
    id: Date.now().toString(),
    ...subActivity,
    created_at: new Date().toISOString()
  };
};

export const updateSubActivity = async (id: string, subActivity: any) => {
  await delay(200);
  return { id, ...subActivity };
};

export const deleteSubActivity = async (id: string) => {
  await delay(200);
  return true;
};