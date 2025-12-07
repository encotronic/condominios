'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from '@/lib/hooks/useTranslations';
import { authService, LoginRequest } from '@/lib/api/auth.service';
import { Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const { t, locale } = useTranslations();
  const router = useRouter();
  
  // Estados del formulario
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  
  // Estados de UI
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar errores al escribir
    if (error) setError(null);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validaciones básicas
      if (!formData.email || !formData.password) {
        throw new Error('Por favor completa todos los campos');
      }

      // Llamar al servicio de autenticación
      const response = await authService.login(formData);
      
      // Éxito
      setSuccess('¡Inicio de sesión exitoso! Redirigiendo...');
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        router.push(`/${locale}/dashboard`);
      }, 1500);

    } catch (err: any) {
      // Manejo de errores
      const errorMessage = err.response?.data?.message || err.message || 'Error al iniciar sesión';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-condo-blue/10 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-condo-blue" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            {t('auth.email') ? 'Iniciar Sesión' : 'Login'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t('auth.email') ? 'Accede a tu cuenta de Condómino Manager' : 'Access your Condominium Manager account'}
          </p>
        </div>

        {/* Card del formulario */}
        <div className="bg-card border rounded-2xl shadow-xl p-8 space-y-6">
          {/* Mensajes de estado */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive animate-fade-up">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 animate-fade-up">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                {t('auth.email')}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  {t('auth.password')}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-condo-blue hover:text-condo-blue/80 transition-colors"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full pl-12 pr-12 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Recordarme */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-condo-blue focus:ring-condo-blue"
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-muted-foreground">
                {t('auth.rememberMe')}
              </label>
            </div>

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-condo-blue text-white font-semibold hover:bg-condo-blue/90 focus:outline-none focus:ring-2 focus:ring-condo-blue focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('app.loading')}</span>
                </div>
              ) : (
                t('navigation.login')
              )}
            </button>
          </form>

          {/* Separador */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">O continúa con</span>
            </div>
          </div>

          {/* Enlace a registro */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t('auth.noAccount')}{' '}
              <Link
                href="/register"
                className="font-semibold text-condo-blue hover:text-condo-blue/80 transition-colors"
              >
                {t('navigation.register')}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2025 Condóminio Manager. {t('app.description')}</p>
          <p className="mt-1">
            {t('app.name')} v1.0 •{' '}
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacidad
            </Link>{' '}
            •{' '}
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Términos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}