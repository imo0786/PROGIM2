export interface StorageData {
  activities: any[];
  projects: any[];
  responsibilities: any[];
  catalogs?: any[];
}

const STORAGE_KEY = 'progim_data';

export const loadData = async (): Promise<StorageData> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        ...data,
        catalogs: data.catalogs || []
      };
    }
    
    // Return default data structure with sample data
    const defaultData = {
      activities: [
        {
          id: '1',
          name: 'Diseño de interfaz de usuario',
          description: 'Crear mockups y prototipos de la interfaz',
          projectId: '1',
          assignedTo: 'Carlos López',
          startDate: '2024-01-15',
          endDate: '2024-02-15',
          percentage: 75,
          notes: 'Progreso satisfactorio, faltan algunos detalles finales',
          subActivities: [
            {
              id: '1-1',
              name: 'Wireframes iniciales',
              percentage: 100,
              assignedTo: 'Carlos López',
              dueDate: '2024-01-25',
              hoursSpent: 20
            },
            {
              id: '1-2',
              name: 'Prototipo interactivo',
              percentage: 60,
              assignedTo: 'Carlos López',
              dueDate: '2024-02-10',
              hoursSpent: 15
            }
          ]
        },
        {
          id: '2',
          name: 'Desarrollo del backend',
          description: 'Implementar API REST y base de datos',
          projectId: '1',
          assignedTo: 'María García',
          startDate: '2024-02-01',
          endDate: '2024-04-30',
          percentage: 45,
          notes: 'En desarrollo, siguiendo cronograma establecido',
          subActivities: [
            {
              id: '2-1',
              name: 'Configuración de base de datos',
              percentage: 100,
              assignedTo: 'María García',
              dueDate: '2024-02-15',
              hoursSpent: 25
            },
            {
              id: '2-2',
              name: 'Desarrollo de endpoints',
              percentage: 30,
              assignedTo: 'María García',
              dueDate: '2024-04-15',
              hoursSpent: 35
            }
          ]
        }
      ],
      projects: [
        {
          id: '1',
          name: 'Proyecto de Desarrollo Web',
          description: 'Desarrollo de plataforma web para gestión de proyectos',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          status: 'active'
        },
        {
          id: '2',
          name: 'Sistema de Monitoreo',
          description: 'Implementación de sistema de monitoreo y seguimiento',
          startDate: '2024-02-01',
          endDate: '2024-08-31',
          status: 'active'
        }
      ],
      responsibilities: [
        {
          id: '1',
          name: 'Juan Pérez',
          email: 'juan.perez@example.com',
          role: 'Desarrollador Frontend'
        },
        {
          id: '2',
          name: 'María García',
          email: 'maria.garcia@example.com',
          role: 'Desarrolladora Backend'
        },
        {
          id: '3',
          name: 'Carlos López',
          email: 'carlos.lopez@example.com',
          role: 'Diseñador UX/UI'
        }
      ],
      catalogs: [
        {
          id: '1',
          type: 'state',
          name: 'Pendiente'
        },
        {
          id: '2',
          type: 'state',
          name: 'En Progreso'
        },
        {
          id: '3',
          type: 'state',
          name: 'Completado'
        },
        {
          id: '4',
          type: 'assignee',
          name: 'Juan Pérez'
        },
        {
          id: '5',
          type: 'assignee',
          name: 'María García'
        },
        {
          id: '6',
          type: 'assignee',
          name: 'Carlos López'
        }
      ]
    };
    
    // Save default data to localStorage
    await saveData(defaultData);
    return defaultData;
  } catch (error) {
    console.error('Error loading data:', error);
    return {
      activities: [],
      projects: [],
      responsibilities: [],
      catalogs: []
    };
  }
};

export const saveData = async (data: StorageData): Promise<void> => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
};

// Activity functions
export const deleteActivity = async (activityId: string): Promise<void> => {
  try {
    const data = await loadData();
    data.activities = data.activities.filter((activity: any) => activity.id !== activityId);
    await saveData(data);
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }
};

export const saveActivity = async (activity: any): Promise<void> => {
  try {
    const data = await loadData();
    
    if (activity.id) {
      const index = data.activities.findIndex((a: any) => a.id === activity.id);
      if (index !== -1) {
        data.activities[index] = activity;
      }
    } else {
      activity.id = Date.now().toString();
      data.activities.push(activity);
    }
    
    await saveData(data);
  } catch (error) {
    console.error('Error saving activity:', error);
    throw error;
  }
};

export const addActivity = async (activity: any): Promise<void> => {
  try {
    const data = await loadData();
    activity.id = Date.now().toString();
    activity.subActivities = activity.subActivities || [];
    data.activities.push(activity);
    await saveData(data);
  } catch (error) {
    console.error('Error adding activity:', error);
    throw error;
  }
};

export const updateActivity = async (activityId: string, updatedActivity: any): Promise<void> => {
  try {
    const data = await loadData();
    const index = data.activities.findIndex((a: any) => a.id === activityId);
    if (index !== -1) {
      data.activities[index] = { ...data.activities[index], ...updatedActivity };
      await saveData(data);
    }
  } catch (error) {
    console.error('Error updating activity:', error);
    throw error;
  }
};

// Sub-activity functions
export const addSubActivity = async (parentActivityId: string, subActivity: any): Promise<void> => {
  try {
    const data = await loadData();
    const activityIndex = data.activities.findIndex((a: any) => a.id === parentActivityId);
    
    if (activityIndex !== -1) {
      if (!data.activities[activityIndex].subActivities) {
        data.activities[activityIndex].subActivities = [];
      }
      
      subActivity.id = Date.now().toString();
      data.activities[activityIndex].subActivities.push(subActivity);
      await saveData(data);
    }
  } catch (error) {
    console.error('Error adding sub-activity:', error);
    throw error;
  }
};

export const updateSubActivity = async (parentActivityId: string, subActivityId: string, updatedSubActivity: any): Promise<void> => {
  try {
    const data = await loadData();
    const activityIndex = data.activities.findIndex((a: any) => a.id === parentActivityId);
    
    if (activityIndex !== -1 && data.activities[activityIndex].subActivities) {
      const subActivityIndex = data.activities[activityIndex].subActivities.findIndex((sa: any) => sa.id === subActivityId);
      if (subActivityIndex !== -1) {
        data.activities[activityIndex].subActivities[subActivityIndex] = {
          ...data.activities[activityIndex].subActivities[subActivityIndex],
          ...updatedSubActivity
        };
        await saveData(data);
      }
    }
  } catch (error) {
    console.error('Error updating sub-activity:', error);
    throw error;
  }
};

export const deleteSubActivity = async (parentActivityId: string, subActivityId: string): Promise<void> => {
  try {
    const data = await loadData();
    const activityIndex = data.activities.findIndex((a: any) => a.id === parentActivityId);
    
    if (activityIndex !== -1 && data.activities[activityIndex].subActivities) {
      data.activities[activityIndex].subActivities = data.activities[activityIndex].subActivities.filter(
        (sa: any) => sa.id !== subActivityId
      );
      await saveData(data);
    }
  } catch (error) {
    console.error('Error deleting sub-activity:', error);
    throw error;
  }
};

// Project functions
export const saveProject = async (project: any): Promise<void> => {
  try {
    const data = await loadData();
    
    if (project.id) {
      const index = data.projects.findIndex((p: any) => p.id === project.id);
      if (index !== -1) {
        data.projects[index] = project;
      }
    } else {
      project.id = Date.now().toString();
      data.projects.push(project);
    }
    
    await saveData(data);
  } catch (error) {
    console.error('Error saving project:', error);
    throw error;
  }
};

export const addProject = async (project: any): Promise<void> => {
  try {
    const data = await loadData();
    project.id = Date.now().toString();
    data.projects.push(project);
    await saveData(data);
  } catch (error) {
    console.error('Error adding project:', error);
    throw error;
  }
};

export const editProject = async (projectId: string, updatedProject: any): Promise<void> => {
  try {
    const data = await loadData();
    const index = data.projects.findIndex((p: any) => p.id === projectId);
    if (index !== -1) {
      data.projects[index] = { ...data.projects[index], ...updatedProject };
      await saveData(data);
    }
  } catch (error) {
    console.error('Error editing project:', error);
    throw error;
  }
};

export const updateProject = async (projectId: string, updatedProject: any): Promise<void> => {
  try {
    const data = await loadData();
    const index = data.projects.findIndex((p: any) => p.id === projectId);
    if (index !== -1) {
      data.projects[index] = { ...data.projects[index], ...updatedProject };
      await saveData(data);
    }
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    const data = await loadData();
    data.projects = data.projects.filter((project: any) => project.id !== projectId);
    await saveData(data);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

export const removeProject = async (projectId: string): Promise<void> => {
  try {
    await deleteProject(projectId);
  } catch (error) {
    console.error('Error removing project:', error);
    throw error;
  }
};

// Responsibility functions
export const saveResponsibility = async (responsibility: any): Promise<void> => {
  try {
    const data = await loadData();
    
    if (responsibility.id) {
      const index = data.responsibilities.findIndex((r: any) => r.id === responsibility.id);
      if (index !== -1) {
        data.responsibilities[index] = responsibility;
      }
    } else {
      responsibility.id = Date.now().toString();
      data.responsibilities.push(responsibility);
    }
    
    await saveData(data);
  } catch (error) {
    console.error('Error saving responsibility:', error);
    throw error;
  }
};

export const addResponsibility = async (responsibility: any): Promise<void> => {
  try {
    const data = await loadData();
    responsibility.id = Date.now().toString();
    data.responsibilities.push(responsibility);
    await saveData(data);
  } catch (error) {
    console.error('Error adding responsibility:', error);
    throw error;
  }
};

export const updateResponsibility = async (responsibilityId: string, updatedResponsibility: any): Promise<void> => {
  try {
    const data = await loadData();
    const index = data.responsibilities.findIndex((r: any) => r.id === responsibilityId);
    if (index !== -1) {
      data.responsibilities[index] = { ...data.responsibilities[index], ...updatedResponsibility };
      await saveData(data);
    }
  } catch (error) {
    console.error('Error updating responsibility:', error);
    throw error;
  }
};

export const deleteResponsibility = async (responsibilityId: string): Promise<void> => {
  try {
    const data = await loadData();
    data.responsibilities = data.responsibilities.filter((responsibility: any) => responsibility.id !== responsibilityId);
    await saveData(data);
  } catch (error) {
    console.error('Error deleting responsibility:', error);
    throw error;
  }
};

// Catalog functions
export const addCatalogItem = async (type: string, name: string): Promise<void> => {
  try {
    const data = await loadData();
    if (!data.catalogs) data.catalogs = [];
    
    const catalogItem = {
      id: Date.now().toString(),
      type,
      name,
      createdAt: new Date().toISOString()
    };
    
    data.catalogs.push(catalogItem);
    await saveData(data);
  } catch (error) {
    console.error('Error adding catalog item:', error);
    throw error;
  }
};

export const editCatalogItem = async (catalogId: string, updatedItem: any): Promise<void> => {
  try {
    const data = await loadData();
    if (!data.catalogs) data.catalogs = [];
    
    const index = data.catalogs.findIndex((c: any) => c.id === catalogId);
    if (index !== -1) {
      data.catalogs[index] = { ...data.catalogs[index], ...updatedItem };
      await saveData(data);
    }
  } catch (error) {
    console.error('Error editing catalog item:', error);
    throw error;
  }
};

export const updateCatalogItem = async (catalogId: string, updatedItem: any): Promise<void> => {
  try {
    const data = await loadData();
    if (!data.catalogs) data.catalogs = [];
    
    const index = data.catalogs.findIndex((c: any) => c.id === catalogId);
    if (index !== -1) {
      data.catalogs[index] = { ...data.catalogs[index], ...updatedItem };
      await saveData(data);
    }
  } catch (error) {
    console.error('Error updating catalog item:', error);
    throw error;
  }
};

export const deleteCatalogItem = async (catalogId: string): Promise<void> => {
  try {
    const data = await loadData();
    if (!data.catalogs) data.catalogs = [];
    
    data.catalogs = data.catalogs.filter((catalog: any) => catalog.id !== catalogId);
    await saveData(data);
  } catch (error) {
    console.error('Error deleting catalog item:', error);
    throw error;
  }
};

export const removeCatalogItem = async (catalogId: string): Promise<void> => {
  try {
    const data = await loadData();
    if (!data.catalogs) data.catalogs = [];
    
    data.catalogs = data.catalogs.filter((catalog: any) => catalog.id !== catalogId);
    await saveData(data);
  } catch (error) {
    console.error('Error removing catalog item:', error);
    throw error;
  }
};

// Date utility functions
export const calculateDaysRemaining = (endDate: string): number => {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getDaysAlert = (endDate: string): 'none' | 'warning' | 'danger' => {
  const daysRemaining = calculateDaysRemaining(endDate);
  if (daysRemaining < 0) return 'danger';
  if (daysRemaining <= 7) return 'warning';
  return 'none';
};

export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const isDateBetween = (date: string, startDate: string, endDate: string): boolean => {
  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return checkDate >= start && checkDate <= end;
};