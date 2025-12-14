# Nuevo enfoque

## 1. Propósito estratégico
- Consolidar una plataforma SaaS multi-condominio que abarque administración financiera, operativa y comunicacional.
- Permitir configuraciones personalizadas por condominio (activos, subunidades, planes de mantenimiento, reglas financieras y de reservas).
- Exponer información clara a propietarios sobre fortalezas, pendientes y costos, favoreciendo transparencia y participación.

## 2. Base actual del proyecto
- **Autenticación**: backend Express con JWT multi-tenant; middleware de roles operativo.
- **Cartelera digital**: flujo end-to-end funcionando (creación, lectura, ack, edición, borrado) en frontend y backend.
- **Frontend**: Next.js 16, servicios axios centralizados, layout multi-idioma.
- **Documentación**: versión 3 del contexto define módulos nucleares (AUTH, CONDO, FINANCE, COMMS, BOOKING, VENDOR).

## 3. Principios rectores
- **Configurabilidad total**: cada condominio define activos, subunidades y comportamientos (mantenimiento, reserva, gasto fijo).
- **Domain-Driven Design ligero**: separar dominios (Infraestructura, Finanzas, Comunicaciones, Operaciones, Participación).
- **Multi-tenant aislado**: `condominium_id` obligatoria en todas las entidades; selector de condominio para usuarios multi-site.
- **Eventos y trazabilidad**: registrar acciones clave (asignaciones, mantenimientos, reservas, compras) para proyecciones y auditoría.

## 4. Modelo conceptual extendido

### 4.1 Entidades nucleares
- **Condominium**: metadatos, planos, reglas generales.
- **Unit**: apartamentos/locales con atributos personalizables, mezcla de metraje y cuota.
- **Asset Template**: catálogo editable; define flags (`reservable`, `requiere_mantenimiento`, `gasto_fijo`, `usa_consumibles`, `proveedor_requerido`).
- **Asset Instance**: activos concretos (ascensor, piscina, salón de fiestas, parque) asociados a condominio o unidad.
- **SubAsset**: recursos asignables (puestos, maleteros, buzones, llaves, controles), con historial de asignaciones.

### 4.2 Operación y mantenimiento
- **MaintenancePlan**: frecuencia, checklist, tiempo estimado, responsable (interno/externo).
- **MaintenanceTask**: instancia programada/ejecutada; registra estado, consumibles usados, costos.
- **Incident / WorkOrder**: reporte correctivo ligado a asset/subasset, con SLA.

### 4.3 Finanzas e inventario
- **CatalogCharge**: cargos recurrentes o extraordinarios; referencia a asset/unidad/área.
- **BillingPeriod & UnitRecord**: generación masiva de cuotas, integración con pagos.
- **ExpenseRecord**: gasto operativo por área/asset, con soporte de factura y proveedor.
- **InventoryItem**: consumible con stock mínimo (bombillos, extintores, repuestos). Movimientos por compra/uso.

### 4.4 Comunicación y reservas
- **Announcement**: cartelera (ya operativa), con targets y ack.
- **BookingResource**: recursos reservables (salón, caney, canchas); referencia a Asset Instance.
- **Reservation**: solicitudes con reglas de cobro, aprobación, cobranza automática.
- **Notification**: canaliza alertas (email, WhatsApp, app) para mantenimientos, reservas, avisos.

### 4.5 Participación y transparencia
- **CommunitySurvey / Vote**: decisiones comunitarias ligadas a temas o proyectos.
- **DashboardOwner**: vista centrada en estado del condominio, inversiones, mantenimientos programados, indicadores de salud por área.

## 5. Flujos principales

1. **Configuración inicial de condominio**
   - Alta de plantilla de activos/subunidades.
   - Registro de infraestructura (pisos, sótanos, amenities, servicios).
   - Inventario inicial de consumibles y definición de proveedores.
   - Cuotas por unidad (base para módulo billing).

2. **Asignación de recursos**
   - Administrador asigna subunidades a unidades (puestos, maleteros, llaves).
   - Genera contrato y auditoría por entrega/devolución.

3. **Mantenimiento preventivo/correctivo**
   - Planes programan tareas automáticas.
   - Registro de ejecución (con fotos, checklist, consumibles). Se reflejan gastos.
   - Incidencias generan Work Orders y comunicación a residentes.

4. **Reservas y cobros**
   - Solo assets `reservable` aparecen en Booking.
   - Solicitud → aprobación → cobro (tarifa base + extras) → bloqueo del recurso.

5. **Cartelera y comunicaciones**
   - Anuncios segmentados por condominio, torre, unidad, rol.
   - Integra avisos de mantenimiento y reservas.

6. **Transparencia para propietarios**
   - Dashboard muestra estado de cada área (OK, alerta, en mantenimiento), gastos recientes, inventario crítico.
   - Historias de mejoras realizadas y prioridades futuras.

## 6. Roadmap propuesto

### Fase 1 – Infraestructura y configuración
- Selector multi-condominio en UI; persistencia de `condoId`.
- CRUD de Asset Template / Asset Instance / SubAssets.
- Formulario de condominio con builder de infraestructura y asignaciones.

### Fase 2 – Operaciones y mantenimiento
- Mantenimiento preventivo (planes + calendarización + checklist).
- Inventario de consumibles con stocks y alertas.
- Incidencias y órdenes de trabajo.

### Fase 3 – Finanzas integradas
- Catálogo de cargos vinculados a assets/áreas.
- Cálculo de gastos operativos por área; reportes comparativos.
- Cruce de inventario con costos (compras vs. uso).

### Fase 4 – Reservas y comunicación avanzada
- Reservas con cobro automático y reglas por asset.
- Notificaciones multicanal (email/WhatsApp/push).
- Dashboard propietario con salud del condominio.

### Fase 5 – Analítica y predicción
- Índices de deterioro por asset (basado en incidencias y gasto).
- Recomendaciones de inversión y priorización de mantenimiento.
- Integración con sensores/IoT opcional (ascensores, bombas).

## 7. Consideraciones técnicas
- **Backend**: extender arquitectura existente (controllers/services/models) por dominio; usar migraciones SQL sincronizadas con código.
- **Frontend**: Next.js con context provider para condominio activo; hooks específicos (`useAssets`, `useMaintenance`).
- **Seguridad**: reforzar auth middleware para validar permisos por tipo de asset/acción; log centralizado de auditoría.
- **Integraciones**: preparar gateway de pagos, mensajería y gestión de proveedores.

## 8. Próximas acciones inmediatas
1. Diseñar modelo relacional actualizado (ERD) cubriendo Asset Template/Instance/SubAsset/Plans.
2. Implementar selector multi-condominio en UI y propagarlo al cliente API.
3. Crear módulo backend `assets` con catálogos y asignaciones iniciales.
4. Documentar flujo de mantenimiento y reservas alineado con el builder.

Este enfoque unifica administración, operaciones y transparencia, permitiendo evolucionar hacia un "gemelo digital" del condominio que anticipe necesidades y optimice recursos.
