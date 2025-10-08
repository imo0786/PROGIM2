export interface Project {
  id: string;
  name: string;
  objective: string;
  createdAt: string;
  isActive: boolean;
}

export interface Activity {
  id: string;
  projectId: string;
  name: string;
  state: string;
  assignedTo: string;
  startDate: string;
  endDate: string;
  daysElapsed: number;
  percentage: number; // Porcentaje manual que el usuario ingresa
  notes?: string; // Campo de notas
  subActivities: SubActivity[];
  isExpanded?: boolean;
}

export interface SubActivity {
  id: string;
  activityId: string;
  name: string;
  state: string;
  assignedTo: string;
  startDate: string;
  dueDate: string;
  hoursSpent: number;
  percentage: number; // Porcentaje manual que el usuario ingresa
  notes?: string; // Campo de notas
}

export interface Catalog {
  id: string;
  type: 'state' | 'assignee' | 'project';
  name: string;
  objective?: string; // Only for projects
  createdAt: string;
}

export interface AppData {
  projects: Project[];
  activities: Activity[];
  catalogs: Catalog[];
  lastUpdated: string;
}

export interface KPIData {
  projectProgressPercentages: { projectName: string; percentage: number }[];
  completedProjectsCount: number;
  subActivitiesPerProject: { projectName: string; count: number }[];
  projectTimelines: { projectName: string; startDate: string; progress: number }[];
}