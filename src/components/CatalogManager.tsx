import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getProjects, createProject, updateProject, deleteProject, getCatalogs, createCatalogItem, updateCatalogItem, deleteCatalogItem } from '@/lib/supabase';
import { FolderPlus, Plus, Users, Settings, Target, Calendar, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  objective: string;
  is_active: boolean;
  created_at: string;
}

interface Catalog {
  id: string;
  type: string;
  name: string;
  created_at: string;
}

export default function CatalogManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  // Project form
  const [projectForm, setProjectForm] = useState({
    name: '',
    objective: ''
  });

  // Catalog form
  const [catalogForm, setCatalogForm] = useState({
    type: 'state' as 'state' | 'assignee',
    name: ''
  });

  // Edit form
  const [editForm, setEditForm] = useState({
    name: '',
    objective: ''
  });

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    try {
      setLoading(true);
      const [projectsData, catalogsData] = await Promise.all([
        getProjects(),
        getCatalogs()
      ]);
      setProjects(projectsData || []);
      setCatalogs(catalogsData || []);
    } catch (error) {
      console.error('Error loading catalogs:', error);
      toast.error('Error al cargar los catálogos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectForm.name.trim() || !projectForm.objective.trim()) {
      toast.error('Por favor complete todos los campos del proyecto');
      return;
    }

    setCreating(true);
    try {
      await createProject(projectForm.name.trim(), projectForm.objective.trim());
      setProjectForm({ name: '', objective: '' });
      await loadCatalogs();
      toast.success('Proyecto creado exitosamente');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Error al crear el proyecto');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateCatalogItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!catalogForm.name.trim()) {
      toast.error('Por favor ingrese un nombre');
      return;
    }

    setCreating(true);
    try {
      await createCatalogItem(catalogForm.type, catalogForm.name.trim());
      setCatalogForm({ ...catalogForm, name: '' });
      await loadCatalogs();
      toast.success('Elemento creado exitosamente');
    } catch (error) {
      console.error('Error creating catalog item:', error);
      toast.error('Error al crear el elemento');
    } finally {
      setCreating(false);
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editForm.name.trim() || !editForm.objective.trim()) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    setCreating(true);
    try {
      await updateProject(editingItem.id, editForm.name.trim(), editForm.objective.trim());
      setEditingItem(null);
      await loadCatalogs();
      toast.success('Proyecto actualizado exitosamente');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Error al actualizar el proyecto');
    } finally {
      setCreating(false);
    }
  };

  const handleEditCatalogItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editForm.name.trim()) {
      toast.error('Por favor ingrese un nombre');
      return;
    }

    setCreating(true);
    try {
      await updateCatalogItem(editingItem.id, editForm.name.trim());
      setEditingItem(null);
      await loadCatalogs();
      toast.success('Elemento actualizado exitosamente');
    } catch (error) {
      console.error('Error updating catalog item:', error);
      toast.error('Error al actualizar el elemento');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteConfirm) return;

    setCreating(true);
    try {
      if (deleteConfirm.type === 'project') {
        await deleteProject(deleteConfirm.id);
      } else {
        await deleteCatalogItem(deleteConfirm.id);
      }
      
      setDeleteConfirm(null);
      await loadCatalogs();
      toast.success('Elemento eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Error al eliminar el elemento');
    } finally {
      setCreating(false);
    }
  };

  const openEditProject = (project: Project) => {
    setEditingItem({ ...project, type: 'project' });
    setEditForm({ name: project.name, objective: project.objective });
  };

  const openEditCatalogItem = (item: Catalog) => {
    setEditingItem({ ...item, type: 'catalog' });
    setEditForm({ name: item.name, objective: '' });
  };

  const openDeleteConfirm = (item: any, type: string) => {
    setDeleteConfirm({ ...item, type });
  };

  const getStates = () => catalogs.filter(c => c.type === 'state');
  const getAssignees = () => catalogs.filter(c => c.type === 'assignee');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando catálogos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Catálogos</h1>
          <p className="text-gray-600">Administra proyectos, estados y responsables</p>
        </div>
      </div>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderPlus className="h-4 w-4" />
            Proyectos
          </TabsTrigger>
          <TabsTrigger value="states" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Estados
          </TabsTrigger>
          <TabsTrigger value="assignees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Responsables
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Project Form */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Plus className="h-5 w-5" />
                  Nuevo Proyecto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Nombre del Proyecto *</Label>
                    <Input
                      id="projectName"
                      value={projectForm.name}
                      onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                      placeholder="Ingrese el nombre del proyecto"
                      className="border-blue-200 focus:border-blue-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectObjective">Objetivo *</Label>
                    <Textarea
                      id="projectObjective"
                      value={projectForm.objective}
                      onChange={(e) => setProjectForm({ ...projectForm, objective: e.target.value })}
                      placeholder="Describe el objetivo del proyecto"
                      className="border-blue-200 focus:border-blue-400 min-h-[100px]"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={creating}
                  >
                    {creating ? 'Creando...' : 'Crear Proyecto'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Projects List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderPlus className="h-5 w-5 text-green-600" />
                  Proyectos Existentes ({projects.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {projects.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay proyectos creados</p>
                  ) : (
                    projects.map(project => (
                      <div key={project.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{project.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{project.objective}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={project.is_active ? "default" : "secondary"}>
                                {project.is_active ? 'Activo' : 'Inactivo'}
                              </Badge>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(project.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditProject(project)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDeleteConfirm(project, 'project')}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* States Tab */}
        <TabsContent value="states" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create State Form */}
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-violet-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Plus className="h-5 w-5" />
                  Nuevo Estado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCatalogItem} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stateName">Nombre del Estado *</Label>
                    <Input
                      id="stateName"
                      value={catalogForm.name}
                      onChange={(e) => setCatalogForm({ ...catalogForm, name: e.target.value, type: 'state' })}
                      placeholder="Ej: En proceso, Completado, Pendiente"
                      className="border-purple-200 focus:border-purple-400"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={creating}
                  >
                    {creating ? 'Creando...' : 'Crear Estado'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* States List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Estados Existentes ({getStates().length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {getStates().length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay estados creados</p>
                  ) : (
                    getStates().map(state => (
                      <div key={state.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-purple-200 text-purple-700">
                            {state.name}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(state.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditCatalogItem(state)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDeleteConfirm(state, 'catalog')}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assignees Tab */}
        <TabsContent value="assignees" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Assignee Form */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Plus className="h-5 w-5" />
                  Nuevo Responsable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCatalogItem} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="assigneeName">Nombre del Responsable *</Label>
                    <Input
                      id="assigneeName"
                      value={catalogForm.name}
                      onChange={(e) => setCatalogForm({ ...catalogForm, name: e.target.value, type: 'assignee' })}
                      placeholder="Ej: Juan Pérez, María García"
                      className="border-green-200 focus:border-green-400"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={creating}
                  >
                    {creating ? 'Creando...' : 'Crear Responsable'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Assignees List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Responsables Existentes ({getAssignees().length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {getAssignees().length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay responsables creados</p>
                  ) : (
                    getAssignees().map(assignee => (
                      <div key={assignee.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-green-200 text-green-700">
                            {assignee.name}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(assignee.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditCatalogItem(assignee)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDeleteConfirm(assignee, 'catalog')}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar {editingItem?.type === 'project' ? 'Proyecto' : 'Elemento'}
            </DialogTitle>
            <DialogDescription>
              Modifica los datos del {editingItem?.type === 'project' ? 'proyecto' : 'elemento'}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingItem?.type === 'project' ? handleEditProject : handleEditCatalogItem} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Ingrese el nombre"
                required
              />
            </div>
            {editingItem?.type === 'project' && (
              <div className="space-y-2">
                <Label>Objetivo *</Label>
                <Textarea
                  value={editForm.objective}
                  onChange={(e) => setEditForm({ ...editForm, objective: e.target.value })}
                  placeholder="Describe el objetivo"
                  className="min-h-[80px]"
                  required
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              ¿Estás seguro de que deseas eliminar "{deleteConfirm?.name}"?
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleDeleteItem} 
                disabled={creating}
                className="bg-red-600 hover:bg-red-700"
              >
                {creating ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}