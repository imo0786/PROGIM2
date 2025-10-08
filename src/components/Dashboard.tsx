import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  getProjects, 
  getActivities, 
  getCatalogs,
  getSubActivities 
} from '@/lib/supabase';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target,
  Zap,
  Users,
  Calendar,
  Timer,
  Award,
  Gauge,
  TrendingDown,
  CalendarDays,
  Database,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';

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

interface Catalog {
  id: string;
  type: string;
  name: string;
  created_at: string;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [subActivities, setSubActivities] = useState<SubActivity[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataSource, setDataSource] = useState<'supabase' | 'local'>('local');

  const loadData = async () => {
    try {
      setLoading(true);
      setConnectionStatus('connecting');
      
      console.log('🔄 Cargando datos del Dashboard...');
      
      const [projectsData, activitiesData, subActivitiesData, catalogsData] = await Promise.all([
        getProjects(),
        getActivities(),
        getSubActivities(),
        getCatalogs()
      ]);
      
      console.log('📊 Datos cargados:', {
        proyectos: projectsData?.length || 0,
        actividades: activitiesData?.length || 0,
        subActividades: subActivitiesData?.length || 0,
        catalogos: catalogsData?.length || 0
      });
      
      setProjects(projectsData || []);
      setActivities(activitiesData || []);
      setSubActivities(subActivitiesData || []);
      setCatalogs(catalogsData || []);
      setConnectionStatus('connected');
      setDataSource('supabase');
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('❌ Error cargando datos del Dashboard:', error);
      setConnectionStatus('offline');
      setDataSource('local');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper function to get activity sub-activities
  const getActivitySubActivities = (activityId: string) => {
    return subActivities.filter(sub => sub.activity_id === activityId);
  };

  // Calculate activity percentage including sub-activities
  const calculateActivityPercentage = (activity: ActivityData) => {
    const activitySubActivities = getActivitySubActivities(activity.id);
    
    if (activitySubActivities.length === 0) {
      return activity.percentage;
    }
    
    // If activity has sub-activities, calculate based on sub-activities average
    const subActivitiesTotal = activitySubActivities.reduce((sum, sub) => sum + sub.percentage, 0);
    return Math.round(subActivitiesTotal / activitySubActivities.length);
  };

  // Calculate days elapsed dynamically
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

  if (loading) {
    return (
      <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="animate-pulse space-y-4 md:space-y-8">
          <div className="h-8 md:h-12 bg-slate-300 rounded-xl w-2/3 md:w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-32 md:h-40 bg-slate-300 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Enhanced KPI calculations with real data
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.is_active).length;
  const totalActivities = activities.length;
  
  // Use calculated percentages for more accurate metrics
  const activitiesWithCalculatedPercentages = activities.map(activity => ({
    ...activity,
    calculatedPercentage: calculateActivityPercentage(activity),
    calculatedDaysElapsed: calculateDaysElapsed(activity.start_date, activity.state)
  }));
  
  const completedActivities = activitiesWithCalculatedPercentages.filter(a => 
    a.state?.toLowerCase() === 'completado' || 
    a.state?.toLowerCase() === 'completed' || 
    a.state?.toLowerCase() === 'finalizado' ||
    a.calculatedPercentage === 100
  ).length;
  
  const inProgressActivities = activitiesWithCalculatedPercentages.filter(a => 
    (a.state?.toLowerCase() === 'en progreso' || 
     a.state?.toLowerCase() === 'in progress' ||
     a.state?.toLowerCase() === 'en proceso') &&
    a.calculatedPercentage > 0 && a.calculatedPercentage < 100
  ).length;
  
  const pendingActivities = activitiesWithCalculatedPercentages.filter(a => 
    a.state?.toLowerCase() === 'pendiente' || 
    a.state?.toLowerCase() === 'pending' ||
    a.calculatedPercentage === 0
  ).length;
  
  // Calculate average progress using calculated percentages
  const averageProgress = totalActivities > 0 
    ? Math.round(activitiesWithCalculatedPercentages.reduce((sum, a) => sum + a.calculatedPercentage, 0) / totalActivities)
    : 0;

  const today = new Date();
  const overdueActivities = activitiesWithCalculatedPercentages.filter(a => {
    if (a.state?.toLowerCase() === 'completado' || a.state?.toLowerCase() === 'completed') return false;
    if (!a.end_date) return false;
    const endDate = new Date(a.end_date);
    return endDate < today && a.calculatedPercentage < 100;
  }).length;

  const completionRate = totalActivities > 0 
    ? Math.round((completedActivities / totalActivities) * 100)
    : 0;

  // Enhanced KPIs with real data
  const uniqueTeams = new Set(activities.map(a => a.assigned_to).filter(Boolean)).size;
  
  const activitiesThisMonth = activities.filter(a => {
    const activityDate = new Date(a.created_at);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return activityDate.getMonth() === currentMonth && activityDate.getFullYear() === currentYear;
  }).length;

  const averageDaysElapsed = totalActivities > 0 
    ? Math.round(activitiesWithCalculatedPercentages.reduce((sum, a) => sum + a.calculatedDaysElapsed, 0) / totalActivities)
    : 0;

  const productivityRate = (totalActivities - pendingActivities) > 0 
    ? Math.round((completedActivities / (totalActivities - pendingActivities)) * 100)
    : 0;

  const riskActivities = activitiesWithCalculatedPercentages.filter(a => {
    if (!a.end_date) return false;
    const endDate = new Date(a.end_date);
    const daysUntilDeadline = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDeadline <= 7 && daysUntilDeadline > 0 && a.calculatedPercentage < 80;
  }).length;

  const efficiencyScore = averageProgress > 0 && averageDaysElapsed > 0 
    ? Math.min(Math.round((averageProgress / Math.max(averageDaysElapsed, 1)) * 10), 10)
    : 0;

  // Total sub-activities metrics
  const totalSubActivities = subActivities.length;
  const completedSubActivities = subActivities.filter(sub => 
    sub.state?.toLowerCase() === 'completado' || 
    sub.state?.toLowerCase() === 'completed' ||
    sub.percentage === 100
  ).length;

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 md:mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Dashboard Ejecutivo</h1>
          <p className="text-slate-600 text-sm md:text-base">
            Monitoreo en tiempo real del progreso de proyectos y actividades
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          {/* Connection Status */}
          <Badge 
            variant={connectionStatus === 'connected' ? 'default' : connectionStatus === 'offline' ? 'destructive' : 'secondary'}
            className="px-3 py-1 text-sm font-medium"
          >
            {connectionStatus === 'connected' ? (
              <>
                <Wifi className="h-4 w-4 mr-1" />
                Base de Datos Conectada
              </>
            ) : connectionStatus === 'offline' ? (
              <>
                <WifiOff className="h-4 w-4 mr-1" />
                Modo Offline
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                Conectando...
              </>
            )}
          </Badge>
          
          {/* Data Source */}
          <Badge variant="outline" className="px-3 py-1 text-sm">
            <Database className="h-4 w-4 mr-1" />
            {dataSource === 'supabase' ? 'Supabase' : 'Local'}
          </Badge>
          
          {/* Last Updated */}
          {lastUpdated && (
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              {lastUpdated.toLocaleTimeString('es-GT', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Badge>
          )}
          
          {/* Refresh Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadData}
            disabled={loading}
            className="text-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Enhanced KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Total Proyectos */}
        <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-slate-600 text-sm font-medium">PROYECTOS</p>
                </div>
                <p className="text-3xl font-bold text-slate-900">{totalProjects}</p>
                <p className="text-blue-600 text-sm mt-1 font-medium">{activeProjects} activos</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {totalProjects > 0 ? Math.round((activeProjects / totalProjects) * 100) : 0}%
                </div>
                <div className="text-xs text-slate-500">Actividad</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Actividades */}
        <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-slate-600 text-sm font-medium">ACTIVIDADES</p>
                </div>
                <p className="text-3xl font-bold text-slate-900">{totalActivities}</p>
                <p className="text-green-600 text-sm mt-1 font-medium">{completedActivities} completadas</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
                <div className="text-xs text-slate-500">Éxito</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sub-Actividades */}
        <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-slate-600 text-sm font-medium">SUB-ACTIVIDADES</p>
                </div>
                <p className="text-3xl font-bold text-slate-900">{totalSubActivities}</p>
                <p className="text-purple-600 text-sm mt-1 font-medium">{completedSubActivities} completadas</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {totalSubActivities > 0 ? Math.round((completedSubActivities / totalSubActivities) * 100) : 0}%
                </div>
                <div className="text-xs text-slate-500">Progreso</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progreso General */}
        <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                  </div>
                  <p className="text-slate-600 text-sm font-medium">PROGRESO GENERAL</p>
                </div>
                <p className="text-3xl font-bold text-slate-900">{averageProgress}%</p>
                <div className="mt-2">
                  <Progress value={averageProgress} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* En Progreso */}
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <p className="text-slate-600 text-sm font-medium">EN PROGRESO</p>
                </div>
                <p className="text-2xl font-bold text-slate-900">{inProgressActivities}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚧</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vencidas */}
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <p className="text-slate-600 text-sm font-medium">VENCIDAS</p>
                </div>
                <p className="text-2xl font-bold text-slate-900">{overdueActivities}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipos Activos */}
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <p className="text-slate-600 text-sm font-medium">EQUIPOS</p>
                </div>
                <p className="text-2xl font-bold text-slate-900">{uniqueTeams}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eficiencia */}
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Gauge className="h-5 w-5 text-emerald-500" />
                  <p className="text-slate-600 text-sm font-medium">EFICIENCIA</p>
                </div>
                <p className="text-2xl font-bold text-slate-900">{efficiencyScore}/10</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Performance Overview */}
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-blue-500" />
              <span>Análisis de Rendimiento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Proyectos Activos</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${totalProjects > 0 ? (activeProjects / totalProjects) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-slate-900 min-w-[3rem]">{activeProjects}/{totalProjects}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Tasa de Finalización</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-slate-900 min-w-[3rem]">{completionRate}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Productividad</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${productivityRate}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-slate-900 min-w-[3rem]">{productivityRate}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Progreso Promedio</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${averageProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-slate-900 min-w-[3rem]">{averageProgress}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Distribution */}
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Activity className="h-6 w-6 text-green-500" />
              <span>Distribución de Actividades</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="text-3xl font-bold text-green-600">{completedActivities}</div>
                <div className="text-sm text-green-700 font-medium">Completadas</div>
                <div className="text-xs text-green-600 mt-1">{completionRate}% del total</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-3xl font-bold text-blue-600">{inProgressActivities}</div>
                <div className="text-sm text-blue-700 font-medium">En Progreso</div>
                <div className="text-xs text-blue-600 mt-1">
                  {totalActivities > 0 ? Math.round((inProgressActivities / totalActivities) * 100) : 0}% del total
                </div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="text-3xl font-bold text-yellow-600">{pendingActivities}</div>
                <div className="text-sm text-yellow-700 font-medium">Pendientes</div>
                <div className="text-xs text-yellow-600 mt-1">
                  {totalActivities > 0 ? Math.round((pendingActivities / totalActivities) * 100) : 0}% del total
                </div>
              </div>
              
              <div className="text-center p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="text-3xl font-bold text-red-600">{overdueActivities}</div>
                <div className="text-sm text-red-700 font-medium">Vencidas</div>
                <div className="text-xs text-red-600 mt-1">
                  {totalActivities > 0 ? Math.round((overdueActivities / totalActivities) * 100) : 0}% del total
                </div>
              </div>
            </div>
            
            {/* Additional Metrics */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-slate-900">{averageDaysElapsed}</div>
                  <div className="text-sm text-slate-600">Días promedio</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{riskActivities}</div>
                  <div className="text-sm text-slate-600">En riesgo</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Summary Footer */}
      <div className="mt-8 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <span>
              <strong className="text-slate-900">{totalProjects}</strong> proyectos
            </span>
            <span>
              <strong className="text-slate-900">{totalActivities}</strong> actividades
            </span>
            <span>
              <strong className="text-slate-900">{totalSubActivities}</strong> sub-actividades
            </span>
          </div>
          <div className="text-sm text-slate-500">
            Última actualización: {lastUpdated ? lastUpdated.toLocaleString('es-GT') : 'Cargando...'}
          </div>
        </div>
      </div>
    </div>
  );
}