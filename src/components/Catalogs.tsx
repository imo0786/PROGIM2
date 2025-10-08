import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search, Filter, Database } from 'lucide-react';
import { toast } from 'sonner';

interface CatalogItem {
  id: string;
  type: string;
  name: string;
  description?: string;
  created_at: string;
}

export default function Catalogs() {
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([
    {
      id: '1',
      type: 'state',
      name: 'Pendiente',
      description: 'Actividad pendiente de iniciar',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      type: 'state',
      name: 'En Progreso',
      description: 'Actividad en desarrollo',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      type: 'state',
      name: 'Finalizado',
      description: 'Actividad completada',
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      type: 'assignee',
      name: 'Iván Alberto Molina Álvarez',
      description: 'Coordinador del proyecto',
      created_at: new Date().toISOString()
    },
    {
      id: '5',
      type: 'assignee',
      name: 'María González',
      description: 'Analista de sistemas',
      created_at: new Date().toISOString()
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [itemForm, setItemForm] = useState({
    type: '',
    name: '',
    description: ''
  });

  const catalogTypes = [
    { value: 'state', label: 'Estados' },
    { value: 'assignee', label: 'Responsables' },
    { value: 'priority', label: 'Prioridades' },
    { value: 'category', label: 'Categorías' }
  ];

  const handleSaveItem = () => {
    if (!itemForm.name || !itemForm.type) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    const newItem: CatalogItem = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      type: itemForm.type,
      name: itemForm.name,
      description: itemForm.description,
      created_at: editingItem ? editingItem.created_at : new Date().toISOString()
    };

    if (editingItem) {
      setCatalogItems(items => items.map(item => 
        item.id === editingItem.id ? newItem : item
      ));
      toast.success('Elemento actualizado exitosamente');
    } else {
      setCatalogItems(items => [...items, newItem]);
      toast.success('Elemento creado exitosamente');
    }

    setIsDialogOpen(false);
    setEditingItem(null);
    setItemForm({ type: '', name: '', description: '' });
  };

  const handleEditItem = (item: CatalogItem) => {
    setEditingItem(item);
    setItemForm({
      type: item.type,
      name: item.name,
      description: item.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      setCatalogItems(items => items.filter(item => item.id !== id));
      toast.success('Elemento eliminado exitosamente');
    }
  };

  const getTypeLabel = (type: string) => {
    const typeObj = catalogTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'state':
        return 'bg-blue-100 text-blue-800';
      case 'assignee':
        return 'bg-green-100 text-green-800';
      case 'priority':
        return 'bg-yellow-100 text-yellow-800';
      case 'category':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredItems = catalogItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Catálogos</h2>
        <p className="text-gray-600">Administra los catálogos de estados, responsables y categorías del sistema</p>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtros y Acciones</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar elementos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {catalogTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Mostrando {filteredItems.length} de {catalogItems.length} elementos
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingItem(null);
                  setItemForm({ type: '', name: '', description: '' });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Elemento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Editar Elemento' : 'Nuevo Elemento'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingItem ? 'Modifica los datos del elemento' : 'Completa la información para crear un nuevo elemento'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <Select value={itemForm.type} onValueChange={(value) => setItemForm({...itemForm, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {catalogTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={itemForm.name}
                      onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                      placeholder="Nombre del elemento"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      value={itemForm.description}
                      onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                      placeholder="Descripción opcional"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveItem}>
                    {editingItem ? 'Actualizar' : 'Crear'} Elemento
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Catalog Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge className={getTypeColor(item.type)}>
                    {getTypeLabel(item.type)}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditItem(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                )}
                <p className="text-xs text-gray-400">
                  Creado: {new Date(item.created_at).toLocaleDateString('es-ES')}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="border-dashed">
              <CardContent className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {catalogItems.length === 0 
                    ? 'No hay elementos en el catálogo aún'
                    : 'No se encontraron elementos que coincidan con los filtros'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}