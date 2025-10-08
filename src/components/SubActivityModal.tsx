import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubActivity } from '@/types';
import { loadData, addSubActivity, updateSubActivity } from '@/lib/storage';
import { getCurrentDate } from '@/lib/dateUtils';

interface SubActivityModalProps {
  subActivity?: SubActivity | null;
  activityId: string;
  onClose: () => void;
  onSave: () => void;
}

export default function SubActivityModal({ subActivity, activityId, onClose, onSave }: SubActivityModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    activityId: activityId,
    state: '',
    assignedTo: '',
    startDate: getCurrentDate(),
    dueDate: '',
    hoursSpent: 0,
    percentage: 0,
    notes: ''
  });
  
  const [states, setStates] = useState<any[]>([]);
  const [assignees, setAssignees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadData();
        
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
    if (subActivity) {
      setFormData({
        name: subActivity.name || '',
        activityId: subActivity.activityId || activityId,
        state: subActivity.state || '',
        assignedTo: subActivity.assignedTo || '',
        startDate: subActivity.startDate || getCurrentDate(),
        dueDate: subActivity.dueDate || '',
        hoursSpent: subActivity.hoursSpent || 0,
        percentage: subActivity.percentage || 0,
        notes: subActivity.notes || ''
      });
    } else {
      setFormData({
        name: '',
        activityId: activityId,
        state: '',
        assignedTo: '',
        startDate: getCurrentDate(),
        dueDate: '',
        hoursSpent: 0,
        percentage: 0,
        notes: ''
      });
    }
  }, [subActivity, activityId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la sub-actividad es requerido';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }

    if (formData.startDate && formData.dueDate && formData.startDate > formData.dueDate) {
      newErrors.dueDate = 'La fecha de vencimiento debe ser posterior a la fecha de inicio';
    }

    if (formData.percentage < 0 || formData.percentage > 100) {
      newErrors.percentage = 'El porcentaje debe estar entre 0 y 100';
    }

    if (formData.hoursSpent < 0) {
      newErrors.hoursSpent = 'Las horas trabajadas no pueden ser negativas';
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
      if (subActivity) {
        await updateSubActivity(subActivity.id, formData);
      } else {
        await addSubActivity(formData);
      }
      
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving sub-activity:', error);
      setErrors({ submit: error.message || 'Error al guardar la sub-actividad' });
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
            {subActivity ? 'Editar Sub-actividad' : 'Nueva Sub-actividad'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre de la sub-actividad */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Sub-actividad *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ingrese el nombre de la sub-actividad"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
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

            {/* Fecha de vencimiento */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className={errors.dueDate ? 'border-red-500' : ''}
              />
              {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Horas trabajadas */}
            <div className="space-y-2">
              <Label htmlFor="hoursSpent">Horas Trabajadas</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="hoursSpent"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.hoursSpent}
                  onChange={(e) => handleInputChange('hoursSpent', parseFloat(e.target.value) || 0)}
                  className={`${errors.hoursSpent ? 'border-red-500' : ''}`}
                />
                <span className="text-sm text-gray-500">horas</span>
              </div>
              {errors.hoursSpent && <p className="text-sm text-red-500">{errors.hoursSpent}</p>}
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
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Ingrese notas adicionales sobre la sub-actividad..."
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
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Guardando...' : (subActivity ? 'Actualizar Sub-actividad' : 'Crear Sub-actividad')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}