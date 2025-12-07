# 🏢 SISTEMA DE ADMINISTRACIÓN DE CONDOMINIOS (SaaS)
> VERSIÓN: 3.0 (Plataforma Inteligente de Comunidades)
> ESTADO: Definición Final de Alcance. Módulo AUTH Iniciado.
> STACK: React (Vite) + Node.js (Express) + PostgreSQL

## 0. VISIÓN ESTRATÉGICA Y FUNCIONAL (PRODUCTO FINAL)

El objetivo es ser una plataforma **Multi-Tenant (SaaS)**, moderna y simple, enfocada en la robustez financiera, la **comunicación simple**, y la **participación comunitaria**.

| Módulo | Dominio de Negocio | Funcionalidad Clave (V3) |
| :--- | :--- | :--- |
| **AUTH** | Autenticación y Seguridad | Login/Registro, Roles, **Implementación de Multi-Tenancy Estricta (Clave de Condominio)**. |
| **CONDO** | Inmobiliario y Estructura | Gestión de Unidades/Dueños, **Control de Acceso (QR/Códigos de Visitantes)**. |
| **FINANCE** | Finanzas y Contabilidad | Generación automática de Cuotas, Gestión de Gastos, Integración de Pagos/Transacciones. |
| **COMMS** | Comunicación y Encuestas | Cartelera Virtual, **Alertas por Enlace Web WhatsApp (wa.me)**, Agendamiento de Reuniones, **Sistema de Encuestas/Votación Comunitarias**. |
| **BOOKING** | Reservas | Sistema de calendario para **Alquiler de Áreas Comunes**. |
| **VENDOR** | Proveedores | Registro, Historial de Servicios y Seguimiento de Contratos. |

## 1. ARQUITECTURA TÉCNICA Y PRINCIPIOS

* **Arquitectura Backend:** Clean Architecture (Routes -> Controllers -> Services -> Models).
* **Principio Clave:** Separación estricta de la Lógica de Negocio (Services) de la Lógica de Datos (Models).
* **Escalabilidad:** Implementación de **CQRS Básico** en Servicios Críticos (Finance).
* **Frontend Futuro:** Diseñado para una arquitectura de **Micro-Frontends** (MFEs).

## 2. SEGURIDAD Y CONTEXTO TÉCNICO

* **JWT Secret (Clave Secreta):** 'TU_CLAVE_SECRETA_SUPER_COMPLEJA_Y_LARGA_AQUI'
* **DB Credenciales:** DB=condominios, PASS=condominio123.
* **Puerto del Backend:** 5000.

## 3. PROGRESO ACTUAL

| Archivo/Módulo | Ubicación | Estado |
| :--- | :--- | :--- |
| **Estructura V3** | `backend/src/` | ✔️ **Completado.** |
| **Conexión DB** | `shared/database/db.js` | ✔️ **Completado y probado.** |
| **Servidor Base** | `server.js` | ✔️ **Completado y corriendo.** |
| **AUTH Modelo** | `modules/auth/models/auth.model.js` | ✔️ **Completado.** |
| **AUTH Servicio** | `modules/auth/services/auth.service.js` | ❌ **Pendiente.** (Debe incluir lógica Multi-Tenancy). |

## 📝 PRÓXIMO PASO ACORDADO
Ahora que la visión está 100% definida, procedemos a la implementación del cerebro de seguridad: **`auth.service.js`**.

# 🏢 SISTEMA DE ADMINISTRACIÓN DE CONDOMINIOS (SaaS)
> VERSIÓN: 3.0 (Plataforma Inteligente de Comunidades)
> ESTADO: Arquitectura de Seguridad y Módulo AUTH COMPLETADOS.
> STACK: React (Vite) + Node.js (Express) + PostgreSQL

## 0. VISIÓN ESTRATÉGICA Y FUNCIONAL (PRODUCTO FINAL)

El objetivo es ser una plataforma **Multi-Tenant (SaaS)**, moderna y completa, enfocada en la robustez financiera, la comunicación simple y la participación comunitaria.

| Módulo | Dominio de Negocio | Funcionalidad Clave (V3) |
| :--- | :--- | :--- |
| **AUTH** | Autenticación y Seguridad | Login/Registro, **Multi-Tenancy Estricta**, Generación y Verificación JWT, **Autorización por Roles**. |
| **CONDO** | Inmobiliario y Estructura | Gestión de Unidades/Dueños, Control de Acceso (QR/Códigos de Visitantes). |
| **FINANCE** | Finanzas y Contabilidad | Generación automática de Cuotas, Gestión de Gastos, Integración de Pagos/Transacciones. |
| **COMMS** | Comunicación y Encuestas | Cartelera Virtual, Alertas por Enlace Web WhatsApp (wa.me), Sistema de Encuestas/Votación. |
| **BOOKING** | Reservas | Sistema de calendario para Alquiler de Áreas Comunes. |
| **VENDOR** | Proveedores | Registro, Historial de Servicios y Seguimiento de Contratos. |

## 1. ARQUITECTURA TÉCNICA Y PRINCIPIOS

* **Arquitectura Backend:** Clean Architecture (Routes -> Controllers -> Services -> Models).
* **Seguridad Implementada:** Uso de `.env` para secretos, `authMiddleware` para Autenticación, `roleMiddleware` para Autorización.
* **Escalabilidad:** Implementación de CQRS Básico en Servicios Críticos (Finance).

## 2. SEGURIDAD Y CONTEXTO TÉCNICO

* **Variables de Entorno:** Implementación completa con `dotenv` para todos los secretos (JWT, DB).
* **DB Credenciales:** Leídas desde `.env`.
* **Puerto del Backend:** Leído desde `.env` (5000).

## 3. PROGRESO ACTUAL

| Archivo/Módulo | Ubicación | Estado |
| :--- | :--- | :--- |
| **Estructura V3** | `backend/src/` | ✔️ **Completado.** |
| **Seguridad .env** | `backend/.env` | ✔️ **Completado.** |
| **Módulo AUTH** | `modules/auth/` | ✔️ **Completado y probado.** |
| **Middlewares** | `shared/middlewares/` | ✔️ **Completado y probado.** |
| **Módulo CONDO Base** | `modules/condo/` | ✔️ **Iniciado (Rutas de prueba).** |
| **Módulo FINANCE** | `modules/finance/` | ❌ **Pendiente.** |

## 📝 PRÓXIMO PASO ACORDADO
Comenzar la implementación del **Módulo de Finanzas (FINANCE)**. Crearemos la estructura básica del CRUD de **Condominios** y **Unidades** antes de pasar a la lógica contable.

📝 Resumen Completo del Progreso (V3.0)I. Contexto y Estado del BackendComponenteEstadoLogro ClaveAutenticación (AUTH)✅ RESUELTOSe corrigió el problema de hash de bcrypt. El login es funcional y el token JWT es válido, extrayendo correctamente el role y el condoId.Integridad DB✅ RESUELTOSe identificaron y corrigieron todos los errores de NOT NULL y llaves foráneas (23502, 23503) en la jerarquía de facturación.Seguridad✅ VALIDADOLa prueba final de curl demostró que el backend aplica correctamente la lógica de Multi-Tenancy (aislamiento de datos), filtrando los registros por unit_id asociado al usuario logueado.Próximo Paso🛠️ INICIARImplementar los servicios CRUD del Módulo CONDO (Unidades).II. Estructuras de Datos Verificadas (Esquemas y SQL)Hemos confirmado y corregido las columnas obligatorias (NOT NULL) de las siguientes tablas para asegurar la correcta inserción de datos.A. Esquema billing_periods (Nivel Padre)ColumnaTipoRestricción (NOT NULL)Valor de Prueba UsadoiduuidSí12c3f4e5-...condominium_iduuidSí5074d155-...start_datedateSí'2025-12-01'end_datedateSí'2025-12-31'total_costnumericSí750.00descriptionvarcharNo'Cuota ordinaria...'B. Esquema billing_unit_records (Nivel Intermedio)ColumnaTipoRestricción (NOT NULL)Valor de Prueba UsadoiduuidSí8b3cd8ea-... o b45f1c2d-...billing_period_iduuidSíReferencia al padreunit_iduuidSíd880faa4-...amount_duenumericSí400.00 o 350.00is_paidbooleanSíTRUE o FALSEstatusvarcharNo'PENDING' o 'PAID'C. Esquema payments (Nivel Hijo)ColumnaTipoRestricción (NOT NULL)Valor de Prueba UsadoiduuidSíe7d2c1b4-...billing_unit_record_iduuidSíReferencia a la deuda PAGADAuser_iduuidSí8df4bebb-...amountnumericSí350.00payment_methodvarcharSí'TRANSFERENCIA'III. Sentencias SQL Finales (Secuencia de Inserción Exitosa)Esta es la secuencia de INSERT que finalmente funcionó, validando el esquema y la jerarquía de la base de datos:SQL-- 1. Periodo de Facturación
INSERT INTO billing_periods (id, condominium_id, start_date, end_date, total_cost, description)
VALUES ('12c3f4e5-a6b7-4d8e-9c0a-1b2c3d4e5f6a', '5074d155-ba23-4ca2-9659-b585060d4632', '2025-12-01', '2025-12-31', 750.00, 'Cuota ordinaria Diciembre 2025');

-- 2. Deuda PENDIENTE
INSERT INTO billing_unit_records (id, billing_period_id, unit_id, amount_due, is_paid, status) 
VALUES ('8b3cd8ea-9ee1-43cc-9496-8d103bb2670b', '12c3f4e5-a6b7-4d8e-9c0a-1b2c3d4e5f6a', 'd880faa4-b77b-4269-8341-ca2345fb5bbf', 400.00, FALSE, 'PENDING');

-- 3. Deuda PAGADA
INSERT INTO billing_unit_records (id, billing_period_id, unit_id, amount_due, is_paid, status) 
VALUES ('b45f1c2d-9e6a-4b7c-8e8e-5b9d3f2c1a01', '12c3f4e5-a6b7-4d8e-9c0a-1b2c3d4e5f6a', 'd880faa4-b77b-4269-8341-ca2345fb5bbf', 350.00, TRUE, 'PAID');

-- 4. Registro de Pago
INSERT INTO payments (id, billing_unit_record_id, user_id, amount, payment_method)
VALUES ('e7d2c1b4-a5e3-4c6d-9f0a-1b8c7d6e5f4a', 'b45f1c2d-9e6a-4b7c-8e8e-5b9d3f2c1a01', '8df4bebb-0d5d-4e49-8eb2-d9bb41b9270b', 350.00, 'TRANSFERENCIA');
Próximo Paso Acordado: Iniciar el desarrollo de los servicios CRUD para el Módulo CONDO, comenzando con el archivo unit.service.js.

Contexto del Proyecto: Condominio Manager API V3
Este documento rastrea el estado y el contexto general de la API para la plataforma Condominio Manager, construida con Express, PostgreSQL y siguiendo una arquitectura modular.

1. Módulos y Arquitectura
Tecnologías de Backend: Node.js (Express), PostgreSQL, JWT para autenticación.

Patrón: Arquitectura Limpia/Modular (Shared, Auth, Condo, Billing, Payments).

Seguridad: Implementación de Multi-Tenancy (filtrado por condominium_id en todos los servicios de datos) y control de acceso basado en roles (roleMiddleware).

2. Estado del Servidor Principal (server.js)
Rutas Centralizadas: La integración inicial de rutas ha sido corregida.

Estado: FINALIZADO.

Todas las rutas de entidades maestras (Unidades y Propietarios) han sido consolidadas bajo el prefijo principal /api/condo.

3. Estado de Módulos (Datos Maestros)
Módulo AUTH (Autenticación)
Funcionalidades: Registro de usuarios, Login (JWT), verificación de token, asignación de roles.

Estado: FINALIZADO.

Módulo CONDO (Datos Maestros: Unidades y Propietarios)
Propósito: Gestión completa de las Unidades habitacionales y los Propietarios.

Rutas Prefijo: /api/condo

Estado: FINALIZADO (CRUD Completo).

Unidades (/units): CRUD completo implementado (GET, POST, GET/:id, PUT/:id, DELETE/:id).

Propietarios (/owners): CRUD completo implementado (GET, POST, GET/:id, PUT/:id, DELETE/:id).

4. Próxima Prioridad
Módulo: BILLING (Facturación y Cargos Recurrentes)

Objetivo: Implementar la lógica para crear, gestionar y aplicar cargos recurrentes (alícuotas) a todas las unidades del condominio.

Entidades a Implementar:
Cargos (Charges): CRUD para definir cargos recurrentes (e.g., "Cuota mensual ordinaria", "Fondo de Reserva").

Generación de Facturación: Lógica para generar el registro de cobro (Billing) mensual para todas las Unidades.

Estado Actual: El contexto del proyecto ha sido actualizado con éxito. El Módulo CONDO está terminado.

Ahora, para avanzar con la implementación, necesitamos comenzar el Módulo de Facturación (BILLING). La primera entidad a definir es la de Cargos (Charges)
Estatus Detallado del Proyecto Condominio Manager API V31. Resumen EjecutivoEl proyecto se encuentra en una fase de transición: la capa de Datos Maestros (Auth, Condo) está 100% FINALIZADA y se ha iniciado la fase de implementación de la lógica financiera, comenzando con el módulo BILLING (Facturación).Arquitectura: Modular y Limpia.Base de Datos: PostgreSQL con soporte para Multi-Tenancy (condominium_id).Framework: Express.js (Node.js).2. Módulos Implementados y FinalizadosMóduloPrefijo RutaEntidades y FuncionalidadesEstadoAUTH/api/authRegistro (Signup), Inicio de Sesión (Login), Generación y Validación de Token (JWT), Middlewares de Autenticación y Roles.FINALIZADOCONDO/api/condoUnidades: CRUD completo (GET, POST, PUT, DELETE). Propietarios: CRUD completo (GET, POST, PUT, DELETE). Control de acceso por condominium_id en todos los servicios.FINALIZADO3. Módulo en Progreso (Próxima Prioridad)MóduloPrefijo RutaObjetivo ActualEntidades a CrearBILLING/api/billingDefinir los conceptos de cobro recurrentes y la lógica para la generación masiva de facturas mensuales basadas en la alícuota de cada unidad.Cargos (Charges): CRUD completo. Generación de Cobros (Billing): Lógica de procesamiento masivo.Paso Inmediato: Crear el servicio y el controlador para la entidad Cargos (Charges).4. Módulos Faltantes y Roadmap FuturoLos siguientes módulos aún no se han abordado y representan el trabajo restante para completar la API:MóduloPrefijo Ruta SugeridoPropósito PrincipalPAYMENTS/api/paymentsRegistrar y gestionar los pagos realizados por los propietarios, asociándolos a los cobros generados por el módulo BILLING.REPORTS/api/reportsFuncionalidad para generar informes financieros (estado de cuenta, morosidad) y administrativos.USERS/api/users(Módulo administrativo, si fuera necesario) Gestión de usuarios y roles fuera de los flujos de AUTH (ej: cambiar contraseña de un tercero, actualizar roles).COMMUNICATION/api/comm(Opcional, pero clave) Lógica para enviar notificaciones (emails, push) sobre cobros y pagos a los propietarios.