import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import Index from './pages/Index';
import { authenticateUser } from './lib/auth';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('progim_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('progim_user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const authenticatedUser = await authenticateUser(username, password);
      if (authenticatedUser) {
        setUser(authenticatedUser);
        localStorage.setItem('progim_user', JSON.stringify(authenticatedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const handleLogout = () => {
    // SILENT LOGOUT - NO ALERTS, NO POPUPS
    setUser(null);
    localStorage.removeItem('progim_user');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando PROGIM...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <Index user={user} onLogout={handleLogout} />;
}

export default App;