import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Edit, Trash2, Calendar, User, Activity, Filter, Search, Eye, ChevronDown, ChevronRight, Target, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { getProjects, getActivities, createActivity, updateActivity, deleteActivity, getSubActivities, createSubActivity, updateSubActivity, deleteSubActivity, getCatalogs } from '@/lib/supabase';

interface Project {
  id: string;
  name: string;
  objective: string;
  is_active: boolean;
  created_at: string;
}

interface ActivityData {
  id: string;
  name: string;
  project_id: string;
  state: string;
  assigned_to: string;
  start_date: string;
  end_date: string;
  percentage: number;
  notes: string;
  days_elapsed: number;
  created_at: string;
}

interface SubActivity {
  id: string;
  name: string;
  activity_id: string;
  state: string;
  assigned_to: string;
  start_date: string;
  due_date: string;
  hours_spent: number;
  percentage: number;
  notes: string;
  created_at: string;
}

interface CatalogItem {
  id: string;
  type: string;
  name: string;
  created_at: string;
}

export default function ActivityList() {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [subActivities, setSubActivities] = useState<SubActivity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [catalogs, setCatalogs] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubActivityDialogOpen, setIsSubActivityDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityData | null>(null);
  const [editingSubActivity, setEditingSubActivity] = useState<SubActivity | null>(null);
  const [selectedActivityForSub, setSelectedActivityForSub] = useState<string>('');
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Formulario de actividad (REMOVED days_elapsed from form)
  const [activityForm, setActivityForm] = useState({
    name: '',
    project_id: '',
    state: '',
    assigned_to: '',
    start_date: '',
    end_date: '',
    percentage: 0,
    notes: ''
  });

  // Formulario de sub-actividad
  const [subActivityForm, setSubActivityForm] = useState({
    name: '',
    activity_id: '',
    state: '',
    assigned_to: '',
    start_date: '',
    due_date: '',
    hours_spent: 0,
    percentage: 0,
    notes: ''
  });

  // MOVED: Helper functions defined before they are used
  const getActivitySubActivities = (activityId: string) => {
    return subActivities.filter(sub => sub.activity_id === activityId);
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Proyecto no encontrado';
  };

  const calculateDaysElapsed = (startDate: string, state: string): number => {
    if (!startDate) return 0;
    
    // If activity is completed, don't calculate elapsed days
    if (state?.toLowerCase() === 'finalizado' || 
        state?.toLowerCase() === 'completado' || 
        state?.toLowerCase() === 'completed') {
      return 0;
    }

    const today = new Date();
    const start = new Date(startDate);
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateDaysRemaining = (endDate: string): number => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysAlert = (activity: ActivityData): 'none' | 'warning' | 'danger' => {
    // FIXED: If activity is completed, don't show overdue status
    if (activity.state?.toLowerCase() === 'finalizado' || 
        activity.state?.toLowerCase() === 'completado' || 
        activity.state?.toLowerCase() === 'completed') {
      return 'none';
    }

    const daysRemaining = calculateDaysRemaining(activity.end_date);
    if (daysRemaining < 0) return 'danger';
    if (daysRemaining <= 7) return 'warning';
    return 'none';
  };

  const getStatusColor = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'completado':
      case 'completed':
      case 'finalizado':
        return 'bg-green-100 text-green-800';
      case 'en progreso':
      case 'in progress':
      case 'en proceso':
        return 'bg-blue-100 text-blue-800';
      case 'pendiente':
      case 'pending':
      case 'iniciando':
        return 'bg-yellow-100 text-yellow-800';
      case 'detenido':
      case 'pausado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [activitiesData, projectsData, subActivitiesData, catalogsData] = await Promise.all([
        getActivities(),
        getProjects(),
        getSubActivities(),
        getCatalogs()
      ]);
      
      console.log('Loaded activities:', activitiesData?.length || 0);
      console.log('Loaded projects:', projectsData?.length || 0);
      console.log('Loaded sub-activities:', subActivitiesData?.length || 0);
      console.log('Loaded catalogs:', catalogsData?.length || 0);
      
      setActivities(activitiesData || []);
      setProjects(projectsData || []);
      setSubActivities(subActivitiesData || []);
      setCatalogs(catalogsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveActivity = async () => {
    try {
      if (!activityForm.name || !activityForm.project_id) {
        toast.error('Por favor completa los campos requeridos');
        return;
      }

      // FIXED: Auto-calculate days_elapsed
      const calculatedDaysElapsed = calculateDaysElapsed(activityForm.start_date, activityForm.state);
      
      const activityData = {
        ...activityForm,
        days_elapsed: calculatedDaysElapsed
      };

      if (editingActivity) {
        await updateActivity(editingActivity.id, activityData);
        toast.success('Actividad actualizada exitosamente');
      } else {
        await createActivity(activityData);
        toast.success('Actividad creada exitosamente');
      }

      setIsDialogOpen(false);
      setEditingActivity(null);
      setActivityForm({
        name: '',
        project_id: '',
        state: '',
        assigned_to: '',
        start_date: '',
        end_date: '',
        percentage: 0,
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Error saving activity:', error);
      toast.error('Error al guardar la actividad');
    }
  };

  const handleSaveSubActivity = async () => {
    try {
      if (!subActivityForm.name || !subActivityForm.activity_id) {
        toast.error('Por favor completa los campos requeridos');
        return;
      }

      if (editingSubActivity) {
        await updateSubActivity(editingSubActivity.id, subActivityForm);
        toast.success('Sub-actividad actualizada exitosamente');
      } else {
        await createSubActivity(subActivityForm);
        toast.success('Sub-actividad creada exitosamente');
      }

      setIsSubActivityDialogOpen(false);
      setEditingSubActivity(null);
      setSubActivityForm({
        name: '',
        activity_id: '',
        state: '',
        assigned_to: '',
        start_date: '',
        due_date: '',
        hours_spent: 0,
        percentage: 0,
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Error saving sub-activity:', error);
      toast.error('Error al guardar la sub-actividad');
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
      try {
        await deleteActivity(id);
        toast.success('Actividad eliminada exitosamente');
        loadData();
      } catch (error) {
        console.error('Error deleting activity:', error);
        toast.error('Error al eliminar la actividad');
      }
    }
  };

  const handleDeleteSubActivity = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta sub-actividad?')) {
      try {
        await deleteSubActivity(id);
        toast.success('Sub-actividad eliminada exitosamente');
        loadData();
      } catch (error) {
        console.error('Error deleting sub-activity:', error);
        toast.error('Error al eliminar la sub-actividad');
      }
    }
  };

  const openEditDialog = (activity: ActivityData) => {
    setEditingActivity(activity);
    setActivityForm({
      name: activity.name,
      project_id: activity.project_id,
      state: activity.state,
      assigned_to: activity.assigned_to,
      start_date: activity.start_date,
      end_date: activity.end_date,
      percentage: activity.percentage,
      notes: activity.notes
      // REMOVED days_elapsed from form
    });
    setIsDialogOpen(true);
  };

  const openSubActivityDialog = (activityId: string) => {
    setSelectedActivityForSub(activityId);
    setSubActivityForm({
      ...subActivityForm,
      activity_id: activityId
    });
    setIsSubActivityDialogOpen(true);
  };

  const openEditSubActivityDialog = (subActivity: SubActivity) => {
    setEditingSubActivity(subActivity);
    setSubActivityForm({
      name: subActivity.name,
      activity_id: subActivity.activity_id,
      state: subActivity.state,
      assigned_to: subActivity.assigned_to,
      start_date: subActivity.start_date,
      due_date: subActivity.due_date,
      hours_spent: subActivity.hours_spent,
      percentage: subActivity.percentage,
      notes: subActivity.notes
    });
    setIsSubActivityDialogOpen(true);
  };

  const toggleActivityExpansion = (activityId: string) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedActivities(newExpanded);
  };

  // Filtrar actividades
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.assigned_to?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || activity.state === statusFilter;
    const matchesProject = projectFilter === 'all' || activity.project_id === projectFilter;
    const matchesAssignee = assigneeFilter === 'all' || activity.assigned_to === assigneeFilter;
    
    let matchesDateRange = true;
    if (startDateFilter && activity.start_date) {
      matchesDateRange = matchesDateRange && activity.start_date >= startDateFilter;
    }
    if (endDateFilter && activity.end_date) {
      matchesDateRange = matchesDateRange && activity.end_date <= endDateFilter;
    }
    
    return matchesSearch && matchesStatus && matchesProject && matchesAssignee && matchesDateRange;
  });

  // NEW: Calculate project progress based on filtered activities
  const calculateProjectProgress = () => {
    if (filteredActivities.length === 0) return { percentage: 0, projectName: 'Sin actividades', totalActivities: 0, completedActivities: 0 };
    
    // Calculate average percentage of all filtered activities
    const totalPercentage = filteredActivities.reduce((sum, activity) => {
      // Calculate activity percentage including sub-activities
      const activitySubActivities = getActivitySubActivities(activity.id);
      let activityPercentage = activity.percentage;
      
      // If activity has sub-activities, calculate based on sub-activities average
      if (activitySubActivities.length > 0) {
        const subActivitiesTotal = activitySubActivities.reduce((subSum, sub) => subSum + sub.percentage, 0);
        activityPercentage = Math.round(subActivitiesTotal / activitySubActivities.length);
      }
      
      return sum + activityPercentage;
    }, 0);
    
    const averagePercentage = Math.round(totalPercentage / filteredActivities.length);
    const completedActivities = filteredActivities.filter(a => a.percentage === 100 || a.state?.toLowerCase() === 'completado').length;
    
    // Get project name based on filter
    let projectName = 'Todas las Actividades';
    if (projectFilter !== 'all') {
      const project = projects.find(p => p.id === projectFilter);
      projectName = project ? project.name : 'Proyecto Seleccionado';
    }
    
    return {
      percentage: averagePercentage,
      projectName,
      totalActivities: filteredActivities.length,
      completedActivities
    };
  };

  const projectProgress = calculateProjectProgress();

  // Obtener valores únicos para filtros
  const uniqueStates = [...new Set([
    ...activities.map(a => a.state),
    ...catalogs.filter(c => c.type === 'state').map(c => c.name)
  ])].filter(Boolean);
  
  const uniqueAssignees = [...new Set([
    ...activities.map(a => a.assigned_to),
    ...catalogs.filter(c => c.type === 'assignee').map(c => c.name)
  ])].filter(Boolean);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Actividades</h1>
          <p className="text-muted-foreground">
            Administra las actividades y sub-actividades de tus proyectos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingActivity(null);
              setActivityForm({
                name: '',
                project_id: '',
                state: '',
                assigned_to: '',
                start_date: '',
                end_date: '',
                percentage: 0,
                notes: ''
              });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Actividad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}
              </DialogTitle>
              <DialogDescription>
                {editingActivity ? 'Modifica los datos de la actividad' : 'Completa la información para crear una nueva actividad'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Actividad *</Label>
                  <Input
                    id="name"
                    value={activityForm.name}
                    onChange={(e) => setActivityForm({...activityForm, name: e.target.value})}
                    placeholder="Nombre de la actividad"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project">Proyecto *</Label>
                  <Select value={activityForm.project_id} onValueChange={(value) => setActivityForm({...activityForm, project_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Select value={activityForm.state} onValueChange={(value) => setActivityForm({...activityForm, state: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assigned_to">Asignado a</Label>
                  <Select value={activityForm.assigned_to} onValueChange={(value) => setActivityForm({...activityForm, assigned_to: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar responsable" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueAssignees.map((assignee) => (
                        <SelectItem key={assignee} value={assignee}>
                          {assignee}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Fecha de Inicio</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={activityForm.start_date}
                    onChange={(e) => setActivityForm({...activityForm, start_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Fecha de Fin</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={activityForm.end_date}
                    onChange={(e) => setActivityForm({...activityForm, end_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="percentage">Porcentaje de Avance</Label>
                <Input
                  id="percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={activityForm.percentage}
                  onChange={(e) => setActivityForm({...activityForm, percentage: parseInt(e.target.value) || 0})}
                />
              </div>
              {/* REMOVED: Días Transcurridos field - now calculated automatically */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={activityForm.notes}
                  onChange={(e) => setActivityForm({...activityForm, notes: e.target.value})}
                  placeholder="Notas adicionales sobre la actividad"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveActivity}>
                {editingActivity ? 'Actualizar' : 'Crear'} Actividad
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-800">
            <Filter className="h-5 w-5 text-blue-600" />
            <span>Filtros de Búsqueda</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar actividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-white border-gray-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {uniqueStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-filter">Proyecto</Label>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Todos los proyectos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los proyectos</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee-filter">Asignado</Label>
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Todos los asignados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los asignados</SelectItem>
                  {uniqueAssignees.map((assignee) => (
                    <SelectItem key={assignee} value={assignee}>
                      {assignee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-date-filter">Fecha Desde</Label>
              <Input
                id="start-date-filter"
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="bg-white border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date-filter">Fecha Hasta</Label>
              <Input
                id="end-date-filter"
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="bg-white border-gray-200"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">{filteredActivities.length}</span> de {activities.length} actividades
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setProjectFilter('all');
                setAssigneeFilter('all');
                setStartDateFilter('');
                setEndDateFilter('');
              }}
              size="sm"
              className="bg-white border-gray-300 hover:bg-gray-50"
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* UPDATED: Professional Project Progress Summary */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Target className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Progreso General del Proyecto</h3>
                  <p className="text-sm text-gray-500">{projectProgress.projectName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{projectProgress.totalActivities}</div>
                  <div className="text-sm text-gray-600 font-medium">Total Actividades</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-700">{projectProgress.completedActivities}</div>
                  <div className="text-sm text-green-600 font-medium">Completadas</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-700">{projectProgress.totalActivities - projectProgress.completedActivities}</div>
                  <div className="text-sm text-blue-600 font-medium">Pendientes</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Progreso de Completitud</span>
                  <span className="text-sm font-bold text-gray-900">{projectProgress.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out" 
                    style={{ width: `${projectProgress.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="ml-8 text-center">
              <div className="w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center bg-gray-50 relative">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{projectProgress.percentage}%</div>
                </div>
                <svg className="absolute inset-0 w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - projectProgress.percentage / 100)}`}
                    className="text-blue-600 transition-all duration-300 ease-in-out"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="text-xs text-gray-500 mt-2 font-medium">Completado</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Actividades */}
      <div className="space-y-4">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => {
            const activitySubActivities = getActivitySubActivities(activity.id);
            const daysRemaining = activity.end_date ? calculateDaysRemaining(activity.end_date) : null;
            const alert = getDaysAlert(activity);
            const isExpanded = expandedActivities.has(activity.id);
            // FIXED: Calculate days elapsed dynamically
            const daysElapsed = calculateDaysElapsed(activity.start_date, activity.state);
            
            return (
              <div key={activity.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                {/* Activity Header */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActivityExpansion(activity.id)}
                        className="p-0 h-6 w-6"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{activity.name}</h3>
                          <Badge className={getStatusColor(activity.state)}>
                            {activity.state}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{activity.assigned_to || 'Sin asignar'}</span>
                          </div>
                          
                          {activity.start_date && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <span>Inicio: {formatDate(activity.start_date)}</span>
                            </div>
                          )}
                          
                          {activity.end_date && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4 text-red-600" />
                              <span>Fin: {formatDate(activity.end_date)}</span>
                            </div>
                          )}

                          {/* FIXED: Show calculated days elapsed only for active activities */}
                          {daysElapsed > 0 && activity.state?.toLowerCase() !== 'finalizado' && (
                            <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                              <span>{daysElapsed} días transcurridos</span>
                            </div>
                          )}
                          
                          {daysRemaining !== null && alert !== 'none' && (
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                              alert === 'danger' ? 'bg-red-100 text-red-800' :
                              alert === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              <span>
                                {daysRemaining >= 0 ? `${daysRemaining} días restantes` : `Vencida (${Math.abs(daysRemaining)} días)`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{activity.percentage}%</div>
                        <div className="text-xs text-gray-500">Completado</div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(activity)}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-700">
                          Sub-actividades ({activitySubActivities.length})
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSubActivityDialog(activity.id)}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar Sub-actividad
                        </Button>
                      </div>

                      {activitySubActivities.length > 0 ? (
                        <div className="space-y-2">
                          {activitySubActivities.map((subActivity) => (
                            <div key={subActivity.id} className="flex items-center justify-between p-3 bg-white rounded border">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-gray-800">{subActivity.name}</span>
                                  <Badge className={getStatusColor(subActivity.state)} variant="outline">
                                    {subActivity.state}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600">
                                  Asignado a: {subActivity.assigned_to} • {subActivity.hours_spent}h trabajadas
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium">{subActivity.percentage}%</span>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditSubActivityDialog(subActivity)}
                                    className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSubActivity(subActivity.id)}
                                    className="h-6 w-6 p-0 text-red-600 hover:bg-red-100"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No hay sub-actividades creadas
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {activities.length === 0 
                  ? 'No hay actividades creadas aún'
                  : 'No se encontraron actividades que coincidan con los filtros'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog para Sub-actividades */}
      <Dialog open={isSubActivityDialogOpen} onOpenChange={setIsSubActivityDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSubActivity ? 'Editar Sub-actividad' : 'Nueva Sub-actividad'}
            </DialogTitle>
            <DialogDescription>
              {editingSubActivity ? 'Modifica los datos de la sub-actividad' : 'Completa la información para crear una nueva sub-actividad'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sub-name">Nombre de la Sub-actividad *</Label>
                <Input
                  id="sub-name"
                  value={subActivityForm.name}
                  onChange={(e) => setSubActivityForm({...subActivityForm, name: e.target.value})}
                  placeholder="Nombre de la sub-actividad"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-state">Estado</Label>
                <Select value={subActivityForm.state} onValueChange={(value) => setSubActivityForm({...subActivityForm, state: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sub-assigned">Asignado a</Label>
                <Select value={subActivityForm.assigned_to} onValueChange={(value) => setSubActivityForm({...subActivityForm, assigned_to: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueAssignees.map((assignee) => (
                      <SelectItem key={assignee} value={assignee}>
                        {assignee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-hours">Horas Trabajadas</Label>
                <Input
                  id="sub-hours"
                  type="number"
                  min="0"
                  value={subActivityForm.hours_spent}
                  onChange={(e) => setSubActivityForm({...subActivityForm, hours_spent: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sub-start">Fecha de Inicio</Label>
                <Input
                  id="sub-start"
                  type="date"
                  value={subActivityForm.start_date}
                  onChange={(e) => setSubActivityForm({...subActivityForm, start_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-due">Fecha de Vencimiento</Label>
                <Input
                  id="sub-due"
                  type="date"
                  value={subActivityForm.due_date}
                  onChange={(e) => setSubActivityForm({...subActivityForm, due_date: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-percentage">Porcentaje de Avance</Label>
              <Input
                id="sub-percentage"
                type="number"
                min="0"
                max="100"
                value={subActivityForm.percentage}
                onChange={(e) => setSubActivityForm({...subActivityForm, percentage: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-notes">Notas</Label>
              <Textarea
                id="sub-notes"
                value={subActivityForm.notes}
                onChange={(e) => setSubActivityForm({...subActivityForm, notes: e.target.value})}
                placeholder="Notas adicionales sobre la sub-actividad"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubActivityDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSubActivity}>
              {editingSubActivity ? 'Actualizar' : 'Crear'} Sub-actividad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}