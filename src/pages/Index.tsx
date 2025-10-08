import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  ListTodo, 
  FileText, 
  Database,
  Mail,
  LogOut
} from 'lucide-react';
import Dashboard from '@/components/Dashboard';
import ActivityList from '@/components/ActivityList';
import Reports from '@/components/Reports';
import CatalogManager from '@/components/CatalogManager';
import EmailAlerts from '@/components/EmailAlerts';

interface IndexProps {
  user: any;
  onLogout: () => void;
}

export default function Index({ user, onLogout }: IndexProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    // Simple, clean logout - no confirmations, no popups
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Clean Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PROGIM</h1>
            <p className="text-sm text-gray-600">Plataforma de Monitoreo y Gestión de Impacto</p>
          </div>
          
          {/* SIMPLE CLEAN LOGOUT - NO BUTTONS, JUST TEXT LINK */}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
          >
            <LogOut className="h-3 w-3" />
            Salir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white border-b border-gray-100 px-8">
          <TabsList className="grid w-full max-w-2xl grid-cols-5 bg-gray-50 p-1 rounded-xl">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="activities" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              <ListTodo className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Actividades</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Reportes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="catalog" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Catálogos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="email-alerts" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Alertas</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="mt-0">
          <Dashboard />
        </TabsContent>

        <TabsContent value="activities" className="mt-0 p-8">
          <ActivityList />
        </TabsContent>

        <TabsContent value="reports" className="mt-0 p-8">
          <Reports />
        </TabsContent>

        <TabsContent value="catalog" className="mt-0 p-8">
          <CatalogManager />
        </TabsContent>

        <TabsContent value="email-alerts" className="mt-0 p-8">
          <EmailAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
}