import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity } from '@/types';
import { loadData, addActivity, updateActivity } from '@/lib/storage';
import { getCurrentDate } from '@/lib/dateUtils';

interface ActivityModalProps {
  activity?: Activity | null;
  onClose: () => void;
  onSave: () => void;
}

export default function ActivityModal({ activity, onClose, onSave }: ActivityModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    projectId: '',
    state: '',
    assignedTo: '',
    startDate: getCurrentDate(),
    endDate: '',
    percentage: 0,
    notes: ''
  });
  
  const [projects, setProjects] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [assignees, setAssignees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadData();
        setProjects(data.projects || []);
        
        const stateCatalogs = data.catalogs?.filter(c => c.type === 'state') || [];
        const assigneeCatalogs = data.catalogs?.filter(c => c.type === 'assignee') || [];
        
        setStates(stateCatalogs);
        setAssignees(assigneeCatalogs);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (activity) {
      setFormData({
        name: activity.name || '',
        projectId: activity.projectId || '',
        state: activity.state || '',
        assignedTo: activity.assignedTo || '',
        startDate: activity.startDate || getCurrentDate(),
        endDate: activity.endDate || '',
        percentage: activity.percentage || 0,
        notes: activity.notes || ''
      });
    } else {
      setFormData({
        name: '',
        projectId: '',
        state: '',
        assignedTo: '',
        startDate: getCurrentDate(),
        endDate: '',
        percentage: 0,
        notes: ''
      });
    }
  }, [activity]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la actividad es requerido';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Debe seleccionar un proyecto';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de fin es requerida';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    if (formData.percentage < 0 || formData.percentage > 100) {
      newErrors.percentage = 'El porcentaje debe estar entre 0 y 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      if (activity) {
        await updateActivity(activity.id, formData);
      } else {
        await addActivity(formData);
      }
      
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving activity:', error);
      setErrors({ submit: error.message || 'Error al guardar la actividad' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {activity ? 'Editar Actividad' : 'Nueva Actividad'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre de la actividad */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Actividad *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ingrese el nombre de la actividad"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Proyecto */}
          <div className="space-y-2">
            <Label htmlFor="project">Proyecto *</Label>
            <Select 
              value={formData.projectId} 
              onValueChange={(value) => handleInputChange('projectId', value)}
            >
              <SelectTrigger className={errors.projectId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleccione un proyecto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.projectId && <p className="text-sm text-red-500">{errors.projectId}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Select 
                value={formData.state} 
                onValueChange={(value) => handleInputChange('state', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.name}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Responsable */}
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Responsable</Label>
              <Select 
                value={formData.assignedTo} 
                onValueChange={(value) => handleInputChange('assignedTo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un responsable" />
                </SelectTrigger>
                <SelectContent>
                  {assignees.map((assignee) => (
                    <SelectItem key={assignee.id} value={assignee.name}>
                      {assignee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha de inicio */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de Inicio *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
            </div>

            {/* Fecha de fin */}
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de Fin *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
            </div>
          </div>

          {/* Porcentaje */}
          <div className="space-y-2">
            <Label htmlFor="percentage">Porcentaje de Completado</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="percentage"
                type="number"
                min="0"
                max="100"
                value={formData.percentage}
                onChange={(e) => handleInputChange('percentage', parseInt(e.target.value) || 0)}
                className={`w-24 ${errors.percentage ? 'border-red-500' : ''}`}
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
            {errors.percentage && <p className="text-sm text-red-500">{errors.percentage}</p>}
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Ingrese notas adicionales sobre la actividad..."
              rows={3}
            />
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Guardando...' : (activity ? 'Actualizar Actividad' : 'Crear Actividad')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}