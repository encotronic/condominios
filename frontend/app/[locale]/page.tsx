'use client';

import { useTranslations } from '@/lib/hooks/useTranslations';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import Link from 'next/link';
import { 
  ArrowRight, 
  Building, 
  CreditCard, 
  BarChart3, 
  Shield, 
  Users,
  CheckCircle,
  Zap,
  Globe,
  Sparkles,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Home() {
  const { t, locale } = useTranslations();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Building className="w-8 h-8" />,
      title: 'Gestión Inteligente',
      description: 'Administra unidades, propietarios y servicios de forma centralizada',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: 'Pagos Automatizados',
      description: 'Sistema de cobranza automatizado con recordatorios inteligentes',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Reportes en Tiempo Real',
      description: 'Métricas financieras y reportes detallados al instante',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Seguridad Total',
      description: 'Encriptación de datos y autenticación multi-factor',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Comunicación Directa',
      description: 'Portal para residentes con notificaciones instantáneas',
      color: 'from-rose-500 to-red-500'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Multi-Idioma',
      description: 'Soporte completo en español e inglés',
      color: 'from-indigo-500 to-blue-500'
    },
  ];

  const stats = [
    { value: '99.9%', label: 'Disponibilidad' },
    { value: '24/7', label: 'Soporte' },
    { value: '1000+', label: 'Condominios' },
    { value: '4.9★', label: 'Calificación' },
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Efecto de partículas de fondo */}
      <div 
        className="fixed inset-0 z-0 opacity-30"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(37, 99, 235, 0.15), transparent 80%)`,
        }}
      />

      {/* Navbar premium */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-condo-blue to-condo-teal flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">{t('app.name')}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-300">
                Características
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors duration-300">
                Precios
              </a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors duration-300">
                Contacto
              </a>
            </div>
            <LanguageSwitcher />
            <Link
              href={`/${locale}/auth/login`}
              className="px-6 py-2.5 bg-gradient-to-r from-condo-blue to-condo-teal text-white font-semibold rounded-xl hover:shadow-glow transition-all duration-300 hover:scale-105"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 animate-float">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">La plataforma #1 para administración de condominios</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Transforma</span> la{' '}
              <span className="relative">
                gestión
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-condo-blue to-condo-teal rounded-full" />
              </span>{' '}
              de tu condominio
            </h1>

            <p className="text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Sistema premium con inteligencia artificial para automatizar pagos, reportes financieros 
              y comunicación entre residentes y administración.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href={`/${locale}/auth/register`}
                className="group px-8 py-4 bg-gradient-to-r from-condo-blue to-condo-teal text-white font-semibold rounded-xl text-lg hover:shadow-glow transition-all duration-500 hover:scale-105 flex items-center gap-3"
              >
                Comenzar Gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#demo"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl text-lg hover:bg-white/20 transition-all duration-300"
              >
                Ver Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="glass-card p-6 text-center"
                >
                  <div className="text-3xl font-bold gradient-text-ocean mb-2">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Características</span> que marcan la diferencia
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Todo lo que necesitas para una administración moderna y eficiente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-8 hover-lift hover-glow group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 mb-4">{feature.description}</p>
                <div className="flex items-center gap-2 text-condo-teal-light opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">Descubrir más</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-12 text-center"
          >
            {/* Fondo gradiente animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-condo-blue/20 via-condo-teal/20 to-condo-purple/20 animate-gradient-flow" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">Prueba gratuita de 30 días</span>
              </div>

              <h2 className="text-4xl font-bold mb-6">
                ¿Listo para transformar tu{' '}
                <span className="gradient-text">condominio</span>?
              </h2>

              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Únete a miles de administradores que ya automatizaron sus procesos 
                y mejoraron la experiencia de sus residentes.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={`/${locale}/auth/register`}
                  className="group px-10 py-5 bg-gradient-to-r from-white to-gray-100 text-gray-900 font-bold rounded-2xl text-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 flex items-center gap-3"
                >
                  Crear Cuenta Gratis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link
                  href={`/${locale}/auth/login`}
                  className="px-10 py-5 bg-transparent border-2 border-white/30 text-white font-bold rounded-2xl text-lg hover:bg-white/10 transition-all duration-300"
                >
                  Acceder a Demo
                </Link>
              </div>

              <div className="mt-10 flex items-center justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Sin tarjeta de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Cancelación en cualquier momento</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Soporte premium 24/7</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-condo-blue to-condo-teal flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold gradient-text">{t('app.name')}</div>
                <p className="text-gray-500 text-sm">{t('app.description')}</p>
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-gray-500 mb-2">
                © {new Date().getFullYear()} {t('app.name')}. Todos los derechos reservados.
              </p>
              <div className="flex items-center justify-center md:justify-end gap-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                <a href="#" className="hover:text-white transition-colors">Términos</a>
                <a href="#" className="hover:text-white transition-colors">Cookies</a>
                <a href="#" className="hover:text-white transition-colors">Contacto</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}