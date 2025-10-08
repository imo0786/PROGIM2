import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar,
  User,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { getProjects, getActivities, getSubActivities, getCatalogs } from '@/lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

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

export default function Reports() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [subActivities, setSubActivities] = useState<SubActivity[]>([]);
  const [catalogs, setCatalogs] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filtros
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reportType, setReportType] = useState<string>('general');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, activitiesData, subActivitiesData, catalogsData] = await Promise.all([
        getProjects(),
        getActivities(),
        getSubActivities(),
        getCatalogs()
      ]);
      
      setProjects(projectsData || []);
      setActivities(activitiesData || []);
      setSubActivities(subActivitiesData || []);
      setCatalogs(catalogsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar datos según criterios seleccionados
  const getFilteredData = () => {
    let filteredActivities = [...activities];
    let filteredProjects = [...projects];

    // Filtro por proyecto
    if (selectedProject !== 'all') {
      filteredActivities = filteredActivities.filter(a => a.project_id === selectedProject);
      filteredProjects = filteredProjects.filter(p => p.id === selectedProject);
    }

    // Filtro por estado
    if (selectedStatus !== 'all') {
      filteredActivities = filteredActivities.filter(a => a.state === selectedStatus);
    }

    // Filtro por responsable
    if (selectedAssignee !== 'all') {
      filteredActivities = filteredActivities.filter(a => a.assigned_to === selectedAssignee);
    }

    // Filtro por fechas
    if (startDate) {
      filteredActivities = filteredActivities.filter(a => 
        a.start_date && a.start_date >= startDate
      );
    }

    if (endDate) {
      filteredActivities = filteredActivities.filter(a => 
        a.end_date && a.end_date <= endDate
      );
    }

    return { filteredActivities, filteredProjects };
  };

  const { filteredActivities, filteredProjects } = getFilteredData();

  // Calcular estadísticas para el reporte
  const getReportStats = () => {
    const totalActivities = filteredActivities.length;
    const completedActivities = filteredActivities.filter(a => a.percentage === 100).length;
    const inProgressActivities = filteredActivities.filter(a => a.percentage > 0 && a.percentage < 100).length;
    const pendingActivities = filteredActivities.filter(a => a.percentage === 0).length;
    
    const averageProgress = totalActivities > 0 
      ? Math.round(filteredActivities.reduce((sum, a) => sum + a.percentage, 0) / totalActivities)
      : 0;

    // Actividades vencidas
    const today = new Date();
    const overdueActivities = filteredActivities.filter(a => {
      if (!a.end_date || a.percentage === 100) return false;
      return new Date(a.end_date) < today;
    }).length;

    // Actividades próximas a vencer (próximos 7 días)
    const upcomingActivities = filteredActivities.filter(a => {
      if (!a.end_date || a.percentage === 100) return false;
      const endDate = new Date(a.end_date);
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).length;

    return {
      totalProjects: filteredProjects.length,
      totalActivities,
      completedActivities,
      inProgressActivities,
      pendingActivities,
      averageProgress,
      overdueActivities,
      upcomingActivities
    };
  };

  const stats = getReportStats();

  // Obtener valores únicos para filtros
  const uniqueStates = [...new Set(activities.map(a => a.state))].filter(Boolean);
  const uniqueAssignees = [...new Set(activities.map(a => a.assigned_to))].filter(Boolean);

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Proyecto no encontrado';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No definida';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const getStatusColor = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'completado':
      case 'finalizado':
        return 'bg-green-100 text-green-800';
      case 'en progreso':
      case 'en proceso':
        return 'bg-blue-100 text-blue-800';
      case 'pendiente':
      case 'iniciando':
        return 'bg-yellow-100 text-yellow-800';
      case 'detenido':
      case 'pausado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToPDF = async () => {
    try {
      setExporting(true);
      
      // Usar formato A4 horizontal para más espacio
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      
      // Configurar fuente
      doc.setFont('helvetica');
      
      // Título del reporte
      doc.setFontSize(18);
      doc.setTextColor(31, 81, 255); // Azul
      doc.text('REPORTE DE PROGIM', pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Sistema de Monitoreo, Evaluación y Aprendizaje', pageWidth / 2, 25, { align: 'center' });
      
      // Fecha del reporte
      doc.setFontSize(9);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 32, { align: 'center' });
      
      let yPosition = 45;
      
      // Resumen ejecutivo más compacto
      doc.setFontSize(14);
      doc.setTextColor(31, 81, 255);
      doc.text('RESUMEN EJECUTIVO', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      
      const summaryLines = [
        `Proyectos: ${stats.totalProjects} | Actividades: ${stats.totalActivities} | Completadas: ${stats.completedActivities} | En Progreso: ${stats.inProgressActivities}`,
        `Pendientes: ${stats.pendingActivities} | Vencidas: ${stats.overdueActivities} | Progreso Promedio: ${stats.averageProgress}%`
      ];
      
      summaryLines.forEach(line => {
        doc.text(line, 20, yPosition);
        yPosition += 6;
      });
      
      yPosition += 8;
      
      // Detalle de actividades si hay datos
      if (filteredActivities.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(31, 81, 255);
        doc.text('DETALLE DE ACTIVIDADES', 20, yPosition);
        yPosition += 8;
        
        // Preparar datos para la tabla con texto más corto
        const tableData = filteredActivities.slice(0, 20).map(activity => [
          // Truncar nombres largos
          activity.name && activity.name.length > 35 ? activity.name.substring(0, 32) + '...' : activity.name || 'Sin nombre',
          // Truncar nombres de proyecto
          (() => {
            const projectName = getProjectName(activity.project_id);
            return projectName.length > 25 ? projectName.substring(0, 22) + '...' : projectName;
          })(),
          activity.state || 'Sin estado',
          // Truncar nombres de responsables
          (() => {
            const assignee = activity.assigned_to || 'Sin asignar';
            return assignee.length > 20 ? assignee.substring(0, 17) + '...' : assignee;
          })(),
          formatDate(activity.start_date),
          formatDate(activity.end_date),
          `${activity.percentage || 0}%`
        ]);
        
        // Crear tabla usando autoTable con mejor distribución de columnas
        autoTable(doc, {
          startY: yPosition,
          head: [['Actividad', 'Proyecto', 'Estado', 'Responsable', 'Inicio', 'Fin', 'Progreso']],
          body: tableData,
          theme: 'grid',
          headStyles: { 
            fillColor: [31, 81, 255], 
            textColor: 255,
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'center'
          },
          bodyStyles: {
            fontSize: 7,
            textColor: 50,
            cellPadding: 2
          },
          alternateRowStyles: { 
            fillColor: [248, 250, 252] 
          },
          margin: { left: 10, right: 10 },
          tableWidth: 'auto',
          columnStyles: {
            0: { cellWidth: 70, halign: 'left' },   // Actividad - más ancho
            1: { cellWidth: 50, halign: 'left' },   // Proyecto
            2: { cellWidth: 25, halign: 'center' }, // Estado
            3: { cellWidth: 40, halign: 'left' },   // Responsable
            4: { cellWidth: 25, halign: 'center' }, // Inicio
            5: { cellWidth: 25, halign: 'center' }, // Fin
            6: { cellWidth: 20, halign: 'center' }  // Progreso
          },
          styles: {
            overflow: 'linebreak',
            cellWidth: 'wrap'
          }
        });
        
        if (filteredActivities.length > 20) {
          const finalY = (doc as any).lastAutoTable.finalY + 5;
          doc.setFontSize(8);
          doc.setTextColor(128, 128, 128);
          doc.text(`... y ${filteredActivities.length - 20} actividades más`, 20, finalY);
        }
      }
      
      // Pie de página
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(128, 128, 128);
        doc.text('© 2025 PROGIM - APROFAM', 10, doc.internal.pageSize.height - 10);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - 10, doc.internal.pageSize.height - 10, { align: 'right' });
      }
      
      // Guardar PDF
      const fileName = `reporte_progim_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast.success('Reporte PDF generado exitosamente');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(`Error al generar el PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = async () => {
    try {
      setExporting(true);
      
      // Crear un nuevo workbook
      const wb = XLSX.utils.book_new();
      
      // Hoja 1: Resumen
      const summaryData = [
        ['REPORTE PROGIM - RESUMEN EJECUTIVO'],
        [`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`],
        [''],
        ['Métrica', 'Valor'],
        ['Total de Proyectos', stats.totalProjects],
        ['Total de Actividades', stats.totalActivities],
        ['Actividades Completadas', stats.completedActivities],
        ['Actividades en Progreso', stats.inProgressActivities],
        ['Actividades Pendientes', stats.pendingActivities],
        ['Progreso Promedio', `${stats.averageProgress}%`],
        ['Actividades Vencidas', stats.overdueActivities],
        ['Próximas a Vencer', stats.upcomingActivities]
      ];
      
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen');
      
      // Hoja 2: Actividades
      if (filteredActivities.length > 0) {
        const activitiesData = [
          ['Actividad', 'Proyecto', 'Estado', 'Responsable', 'Fecha Inicio', 'Fecha Fin', 'Progreso (%)', 'Días Transcurridos', 'Notas'],
          ...filteredActivities.map(activity => [
            activity.name,
            getProjectName(activity.project_id),
            activity.state || 'Sin estado',
            activity.assigned_to || 'Sin asignar',
            formatDate(activity.start_date),
            formatDate(activity.end_date),
            activity.percentage,
            activity.days_elapsed || 0,
            activity.notes || 'Sin notas'
          ])
        ];
        
        const activitiesWs = XLSX.utils.aoa_to_sheet(activitiesData);
        XLSX.utils.book_append_sheet(wb, activitiesWs, 'Actividades');
      }
      
      // Hoja 3: Proyectos
      if (filteredProjects.length > 0) {
        const projectsData = [
          ['Proyecto', 'Objetivo', 'Estado', 'Fecha Creación', 'Actividades Asociadas'],
          ...filteredProjects.map(project => {
            const projectActivities = filteredActivities.filter(a => a.project_id === project.id);
            return [
              project.name,
              project.objective,
              project.is_active ? 'Activo' : 'Inactivo',
              formatDate(project.created_at),
              projectActivities.length
            ];
          })
        ];
        
        const projectsWs = XLSX.utils.aoa_to_sheet(projectsData);
        XLSX.utils.book_append_sheet(wb, projectsWs, 'Proyectos');
      }
      
      // Hoja 4: Sub-actividades (si existen)
      const relevantSubActivities = subActivities.filter(sub => 
        filteredActivities.some(activity => activity.id === sub.activity_id)
      );
      
      if (relevantSubActivities.length > 0) {
        const subActivitiesData = [
          ['Sub-actividad', 'Actividad Principal', 'Estado', 'Responsable', 'Fecha Inicio', 'Fecha Vencimiento', 'Horas Trabajadas', 'Progreso (%)', 'Notas'],
          ...relevantSubActivities.map(sub => {
            const parentActivity = filteredActivities.find(a => a.id === sub.activity_id);
            return [
              sub.name,
              parentActivity ? parentActivity.name : 'Actividad no encontrada',
              sub.state || 'Sin estado',
              sub.assigned_to || 'Sin asignar',
              formatDate(sub.start_date),
              formatDate(sub.due_date),
              sub.hours_spent || 0,
              sub.percentage,
              sub.notes || 'Sin notas'
            ];
          })
        ];
        
        const subActivitiesWs = XLSX.utils.aoa_to_sheet(subActivitiesData);
        XLSX.utils.book_append_sheet(wb, subActivitiesWs, 'Sub-actividades');
      }
      
      // Descargar el archivo Excel
      const fileName = `reporte_progim_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success('Reporte Excel generado exitosamente');
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast.error('Error al generar el reporte Excel');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
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
          <h1 className="text-3xl font-bold tracking-tight">Reportes y Análisis</h1>
          <p className="text-muted-foreground">
            Genera reportes detallados de proyectos y actividades
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-800">
            <Filter className="h-5 w-5 text-blue-600" />
            <span>Filtros de Reporte</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Tipo de Reporte</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Reporte General</SelectItem>
                  <SelectItem value="projects">Por Proyectos</SelectItem>
                  <SelectItem value="activities">Por Actividades</SelectItem>
                  <SelectItem value="performance">Rendimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-filter">Proyecto</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
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
              <Label htmlFor="status-filter">Estado</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
              <Label htmlFor="assignee-filter">Responsable</Label>
              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Todos los responsables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los responsables</SelectItem>
                  {uniqueAssignees.map((assignee) => (
                    <SelectItem key={assignee} value={assignee}>
                      {assignee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Fecha Desde</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">Fecha Hasta</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white border-gray-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">{filteredActivities.length}</span> actividades seleccionadas
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={exportToPDF}
                disabled={exporting || filteredActivities.length === 0}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {exporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Exportar PDF
              </Button>
              <Button
                onClick={exportToExcel}
                disabled={exporting || filteredActivities.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {exporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exportar Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas del Reporte */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Proyectos</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalProjects}</div>
            <p className="text-xs text-blue-600">proyectos incluidos</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Completadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.completedActivities}</div>
            <p className="text-xs text-green-600">de {stats.totalActivities} actividades</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">En Progreso</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.inProgressActivities}</div>
            <p className="text-xs text-orange-600">actividades activas</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{stats.overdueActivities}</div>
            <p className="text-xs text-red-600">vencidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Progreso General */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-800">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span>Progreso General</span>
          </CardTitle>
          <CardDescription>
            Avance promedio de las actividades seleccionadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Progreso Promedio</span>
              <span className="text-lg font-bold text-purple-600">{stats.averageProgress}%</span>
            </div>
            <Progress value={stats.averageProgress} className="h-3" />
            <div className="grid grid-cols-4 gap-4 text-center text-sm">
              <div>
                <div className="font-semibold text-green-600">{stats.completedActivities}</div>
                <div className="text-gray-500">Completadas</div>
              </div>
              <div>
                <div className="font-semibold text-orange-600">{stats.inProgressActivities}</div>
                <div className="text-gray-500">En Progreso</div>
              </div>
              <div>
                <div className="font-semibold text-yellow-600">{stats.pendingActivities}</div>
                <div className="text-gray-500">Pendientes</div>
              </div>
              <div>
                <div className="font-semibold text-red-600">{stats.overdueActivities}</div>
                <div className="text-gray-500">Vencidas</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista previa de datos */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Vista Previa del Reporte</span>
          </CardTitle>
          <CardDescription>
            Datos que se incluirán en el reporte exportado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredActivities.length > 0 ? (
            <div className="space-y-4">
              {filteredActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{activity.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>{getProjectName(activity.project_id)}</span>
                      <Badge className={getStatusColor(activity.state)} variant="outline">
                        {activity.state}
                      </Badge>
                      <span>{activity.assigned_to || 'Sin asignar'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{activity.percentage}%</div>
                    <div className="text-xs text-gray-500">Completado</div>
                  </div>
                </div>
              ))}
              {filteredActivities.length > 5 && (
                <div className="text-center text-gray-500 text-sm">
                  ... y {filteredActivities.length - 5} actividades más
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay datos que coincidan con los filtros seleccionados
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}