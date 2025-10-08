import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await onLogin(username, password);
      if (!success) {
        setError('Credenciales incorrectas');
      }
    } catch (error) {
      setError('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm md:max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 md:w-16 h-12 md:h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 md:h-8 w-6 md:w-8 text-white" />
          </div>
          <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">PROGIM</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Plataforma de Monitoreo y Gestión de Impacto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm md:text-base">Usuario</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full h-11 md:h-12 text-base" // Larger touch targets
                placeholder=""
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm md:text-base">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 md:h-12 text-base" // Larger touch targets
                placeholder=""
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-slate-800 h-11 md:h-12 text-base font-medium" // Larger button
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
          <div className="mt-6 text-center text-xs text-gray-500">
            Monitoreo, Evaluación y Aprendizaje
            <br />
            © 2025
          </div>
        </CardContent>
      </Card>
    </div>
  );
}