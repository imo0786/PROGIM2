// Datos mock para que el sistema funcione sin base de datos
export const mockProjects = [
  {
    id: '1',
    name: 'Proyecto MEL 2025',
    objective: 'Sistema de Monitoreo, Evaluación y Aprendizaje para mejorar la gestión de proyectos',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Dashboard Ejecutivo',
    objective: 'Tablero de control para seguimiento de KPIs y métricas de rendimiento',
    is_active: true,
    created_at: '2025-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'Capacitación Digital',
    objective: 'Programa de capacitación en herramientas digitales para el equipo',
    is_active: false,
    created_at: '2024-12-15T00:00:00Z'
  }
];

export const mockActivities = [
  {
    id: '1',
    name: 'Desarrollo del Sistema MEL',
    project_id: '1',
    state: 'En Progreso',
    assigned_to: 'Equipo Técnico',
    start_date: '2025-01-01',
    end_date: '2025-03-01',
    percentage: 75,
    notes: 'Avance según cronograma establecido. Próxima revisión el 15 de febrero.',
    days_elapsed: 30,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Capacitación de Usuarios',
    project_id: '1',
    state: 'Planificado',
    assigned_to: 'Equipo de Capacitación',
    start_date: '2025-02-15',
    end_date: '2025-02-28',
    percentage: 0,
    notes: 'Pendiente de inicio. Materiales en preparación.',
    days_elapsed: 0,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Implementación Dashboard',
    project_id: '2',
    state: 'Completado',
    assigned_to: 'Alex Engineer',
    start_date: '2025-01-01',
    end_date: '2025-01-15',
    percentage: 100,
    notes: 'Completado exitosamente. Sistema operativo y funcional.',
    days_elapsed: 15,
    created_at: '2025-01-02T00:00:00Z'
  },
  {
    id: '4',
    name: 'Testing y QA',
    project_id: '2',
    state: 'En Progreso',
    assigned_to: 'Equipo QA',
    start_date: '2025-01-10',
    end_date: '2025-01-25',
    percentage: 60,
    notes: 'Pruebas en curso. Se han identificado mejoras menores.',
    days_elapsed: 20,
    created_at: '2025-01-02T00:00:00Z'
  },
  {
    id: '5',
    name: 'Documentación Técnica',
    project_id: '1',
    state: 'Atrasado',
    assigned_to: 'Equipo Técnico',
    start_date: '2024-12-01',
    end_date: '2024-12-31',
    percentage: 40,
    notes: 'Requiere atención urgente. Documentación incompleta.',
    days_elapsed: 60,
    created_at: '2024-12-01T00:00:00Z'
  }
];

export const mockCatalogs = [
  { id: '1', type: 'estado', name: 'En Progreso', created_at: '2025-01-01T00:00:00Z' },
  { id: '2', type: 'estado', name: 'Completado', created_at: '2025-01-01T00:00:00Z' },
  { id: '3', type: 'estado', name: 'Planificado', created_at: '2025-01-01T00:00:00Z' },
  { id: '4', type: 'estado', name: 'Atrasado', created_at: '2025-01-01T00:00:00Z' },
  { id: '5', type: 'estado', name: 'Cancelado', created_at: '2025-01-01T00:00:00Z' },
  { id: '6', type: 'asignado', name: 'Equipo Técnico', created_at: '2025-01-01T00:00:00Z' },
  { id: '7', type: 'asignado', name: 'Alex Engineer', created_at: '2025-01-01T00:00:00Z' },
  { id: '8', type: 'asignado', name: 'Equipo de Capacitación', created_at: '2025-01-01T00:00:00Z' },
  { id: '9', type: 'asignado', name: 'Equipo QA', created_at: '2025-01-01T00:00:00Z' },
  { id: '10', type: 'asignado', name: 'Gerencia', created_at: '2025-01-01T00:00:00Z' }
];

export const mockUsers = [
  {
    id: '1',
    username: 'Monitoreo',
    password_hash: 'Me2025',
    full_name: 'Sistema de Monitoreo',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    username: 'admin',
    password_hash: 'admin123',
    full_name: 'Administrador',
    created_at: '2025-01-01T00:00:00Z'
  }
];