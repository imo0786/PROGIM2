import React from 'react';
import { LogOut, User, Menu } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  const handleLogout = () => {
    // Simple, clean logout - no popups, no confirmations
    onLogout();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="w-6 md:w-8 h-6 md:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs md:text-sm">P</span>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">PROGIM</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Plataforma de Monitoreo y Gestión de Impacto</p>
          </div>
        </div>
        
        {/* MOBILE-OPTIMIZED LOGOUT */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="hidden sm:flex items-center space-x-2 text-gray-600">
            <User className="h-3 md:h-4 w-3 md:w-4" />
            <span className="text-xs md:text-sm">Usuario</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 text-xs md:text-sm font-medium transition-colors duration-200 px-2 md:px-3 py-1 rounded-md hover:bg-gray-50 touch-manipulation"
            style={{ minHeight: '44px', minWidth: '44px' }} // Touch target size
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}