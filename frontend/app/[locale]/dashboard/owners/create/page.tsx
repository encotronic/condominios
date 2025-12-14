'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from '@/lib/hooks/useTranslations';
import { condoService } from '@/lib/api/condo.service';
import { ArrowLeft, UserPlus, Mail, Phone, Home, User, AlertCircle, Check, Loader2 } from 'lucide-react';
import Card, { CardHeader, CardContent } from '@/components/ui/card';

export default function CreateOwnerPage() {
  const { t, locale } = useTranslations();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    fullName: '',        // CAMBIADO: name → fullName
    email: '',
    phone: '',
    address: '',
    identification: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.fullName.trim() || !formData.email.trim()) {  // CAMBIADO: fullName
      setError('Nombre completo y email son campos obligatorios');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      // Enviar datos con el campo correcto
      await condoService.createOwner({
        fullName: formData.fullName,  // CAMBIADO
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        identification: formData.identification,
        notes: formData.notes
      });
      
      setSuccess(true);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push(`/${locale}/dashboard/owners`);
      }, 2000);
      
    } catch (err: any) {
      console.error('Error creando propietario:', err);
      setError(err.message || 'Error al crear el propietario. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">¡Propietario creado!</h1>
          <p className="text-muted-foreground mb-6">
            El propietario ha sido registrado exitosamente.
          </p>
          <div className="animate-pulse text-sm text-muted-foreground">
            Redirigiendo a la lista de propietarios...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/${locale}/dashboard/owners`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a propietarios
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Nuevo Propietario</h1>
          <p className="text-muted-foreground mt-1">
            Registra un nuevo propietario en el sistema
          </p>
        </div>
        
        <div className="w-12 h-12 rounded-full bg-condo-blue/10 flex items-center justify-center">
          <UserPlus className="w-6 h-6 text-condo-blue" />
        </div>
      </div>

      {/* Formulario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-condo-blue" />
                  Información Personal
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium text-foreground"> {/* CAMBIADO: id y name */}
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="fullName"  // CAMBIADO
                    name="fullName" // CAMBIADO
                    value={formData.fullName} // CAMBIADO
                    onChange={handleChange}
                    placeholder="Ej: Juan Pérez"
                    className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="identification" className="text-sm font-medium text-foreground">
                    Identificación
                  </label>
                  <input
                    type="text"
                    id="identification"
                    name="identification"
                    value={formData.identification}
                    onChange={handleChange}
                    placeholder="Cédula, RUC, etc."
                    className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent"
                  />
                </div>
              </div>
            </Card>

            {/* Información de Contacto */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-condo-blue" />
                  Información de Contacto
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@email.com"
                    className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+593 99 999 9999"
                    className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent"
                  />
                </div>
              </div>
            </Card>

            {/* Dirección */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-condo-blue" />
                  Información Adicional
                </h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium text-foreground">
                    Dirección
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Dirección completa"
                    className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium text-foreground">
                    Notas adicionales
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Información adicional sobre el propietario..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </Card>

            {/* Mensajes de error */}
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">{error}</p>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Link
                href={`/${locale}/dashboard/owners`}
                className="px-5 py-2.5 rounded-lg border text-foreground hover:bg-muted transition-colors font-medium"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg bg-condo-blue text-white font-medium hover:bg-condo-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Crear Propietario
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar - Ayuda */}
        <div className="space-y-6">
          <Card className="border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-3">Requisitos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-condo-blue mt-1.5"></div>
                <span>Nombre completo y email son obligatorios</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-condo-blue mt-1.5"></div>
                <span>El email debe ser único en el sistema</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-condo-blue mt-1.5"></div>
                <span>Puedes asignar el propietario a una unidad después</span>
              </li>
            </ul>
          </Card>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
            <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Importante
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Asegúrate de que el propietario no esté ya registrado en el sistema para evitar duplicados.
            </p>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900/30 border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-2">¿Qué sigue?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Después de crear el propietario podrás:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Asignarlo a una unidad</li>
              <li>• Ver su historial de pagos</li>
              <li>• Generar reportes específicos</li>
              <li>• Enviar notificaciones</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}