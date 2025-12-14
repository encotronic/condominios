# Modelos de Datos - Plataforma Multi-Condominio

## 1. Visión General

Este documento define los modelos de datos principales para la plataforma SaaS multi-condominio, diseñados para soportar completo aislamiento entre tenants y configuraciones personalizadas.

## 2. Entidades Core del Sistema

### 2.1 Condominio (Tenant)

Representa cada condominio en el sistema multi-tenant.

```sql
CREATE TABLE condominios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    razon_social VARCHAR(255),
    rut VARCHAR(20) UNIQUE,
    direccion TEXT,
    ciudad VARCHAR(100),
    region VARCHAR(100),
    pais VARCHAR(100) DEFAULT 'Chile',
    
    -- Contacto
    telefono VARCHAR(20),
    email VARCHAR(255),
    sitio_web VARCHAR(255),
    
    -- Administración
    nombre_administrador VARCHAR(255),
    email_administrador VARCHAR(255),
    telefono_administrador VARCHAR(20),
    
    -- Características del condominio
    total_unidades INTEGER NOT NULL,
    metros_cuadrados_totales DECIMAL(10,2),
    ano_construccion INTEGER,
    tipo_condominio VARCHAR(50), -- residencial, comercial, mixto
    
    -- Configuración
    config JSONB DEFAULT '{}',
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'activo', -- activo, suspendido, prueba
    plan VARCHAR(50) DEFAULT 'basico', -- basico, profesional, enterprise
    fecha_inicio DATE NOT NULL,
    fecha_fin_prueba DATE,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    
    CONSTRAINT chk_estado CHECK (estado IN ('activo', 'suspendido', 'prueba', 'cancelado'))
);

CREATE INDEX idx_condominios_estado ON condominios(estado);
CREATE INDEX idx_condominios_rut ON condominios(rut);
```

### 2.2 Unidades (Departamentos/Locales)

Representa las unidades individuales dentro de cada condominio.

```sql
CREATE TABLE unidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    
    -- Identificación
    numero VARCHAR(50) NOT NULL,
    piso INTEGER,
    bloque VARCHAR(50),
    
    -- Características
    metros_cuadrados DECIMAL(10,2) NOT NULL,
    dormitorios INTEGER,
    banos INTEGER,
    tipo VARCHAR(50), -- departamento, casa, local, oficina
    
    -- Propiedad
    porcentaje_propiedad DECIMAL(5,4), -- Para cálculo de gastos comunes
    coeficiente_copropiedad DECIMAL(10,6),
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'ocupada', -- ocupada, vacía, en_arriendo
    habitada BOOLEAN DEFAULT true,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(condominio_id, numero),
    CONSTRAINT chk_metros_positivos CHECK (metros_cuadrados > 0),
    CONSTRAINT chk_porcentaje CHECK (porcentaje_propiedad > 0 AND porcentaje_propiedad <= 100)
);

CREATE INDEX idx_unidades_condominio ON unidades(condominio_id);
CREATE INDEX idx_unidades_numero ON unidades(condominio_id, numero);
```

### 2.3 Usuarios

Representa todos los usuarios del sistema con diferentes roles.

```sql
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    
    -- Autenticación
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Información Personal
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rut VARCHAR(20),
    telefono VARCHAR(20),
    telefono_movil VARCHAR(20),
    
    -- Rol y Permisos
    rol VARCHAR(50) NOT NULL, -- super_admin, admin, propietario, residente, porteria
    permisos JSONB DEFAULT '{}',
    
    -- Estado
    activo BOOLEAN DEFAULT true,
    email_verificado BOOLEAN DEFAULT false,
    
    -- Seguridad
    ultimo_acceso TIMESTAMP,
    intentos_fallidos INTEGER DEFAULT 0,
    bloqueado_hasta TIMESTAMP,
    token_reset_password VARCHAR(255),
    token_reset_expira TIMESTAMP,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(email, condominio_id),
    CONSTRAINT chk_rol CHECK (rol IN ('super_admin', 'admin', 'propietario', 'residente', 'porteria', 'proveedor'))
);

CREATE INDEX idx_usuarios_condominio ON usuarios(condominio_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(condominio_id, rol);
```

### 2.4 Relación Usuario-Unidad

Vincula usuarios con unidades (propietarios, residentes, arrendatarios).

```sql
CREATE TABLE unidad_usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidad_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Tipo de Relación
    tipo_relacion VARCHAR(50) NOT NULL, -- propietario, arrendatario, residente, contacto_emergencia
    porcentaje_propiedad DECIMAL(5,2), -- Para copropietarios
    
    -- Vigencia
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    vigente BOOLEAN DEFAULT true,
    
    -- Contacto
    es_contacto_principal BOOLEAN DEFAULT false,
    recibe_notificaciones BOOLEAN DEFAULT true,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_tipo_relacion CHECK (tipo_relacion IN ('propietario', 'arrendatario', 'residente', 'contacto_emergencia')),
    CONSTRAINT chk_fecha_fin CHECK (fecha_fin IS NULL OR fecha_fin > fecha_inicio)
);

CREATE INDEX idx_unidad_usuarios_unidad ON unidad_usuarios(unidad_id);
CREATE INDEX idx_unidad_usuarios_usuario ON unidad_usuarios(usuario_id);
CREATE INDEX idx_unidad_usuarios_vigente ON unidad_usuarios(vigente) WHERE vigente = true;
```

## 3. Módulo Financiero

### 3.1 Cuotas

```sql
CREATE TABLE cuotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    unidad_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    
    -- Período
    periodo_mes INTEGER NOT NULL,
    periodo_ano INTEGER NOT NULL,
    
    -- Montos
    monto_base DECIMAL(10,2) NOT NULL,
    monto_adicional DECIMAL(10,2) DEFAULT 0,
    monto_extraordinario DECIMAL(10,2) DEFAULT 0,
    descuento DECIMAL(10,2) DEFAULT 0,
    monto_total DECIMAL(10,2) NOT NULL,
    
    -- Detalle
    concepto TEXT,
    detalle JSONB, -- Desglose de conceptos
    
    -- Estado y Fechas
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    fecha_pago DATE,
    estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, pagada, vencida, anulada
    
    -- Intereses
    dias_mora INTEGER DEFAULT 0,
    interes_mora DECIMAL(10,2) DEFAULT 0,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES usuarios(id),
    
    UNIQUE(condominio_id, unidad_id, periodo_mes, periodo_ano),
    CONSTRAINT chk_periodo_mes CHECK (periodo_mes BETWEEN 1 AND 12),
    CONSTRAINT chk_estado_cuota CHECK (estado IN ('pendiente', 'pagada', 'vencida', 'anulada'))
);

CREATE INDEX idx_cuotas_condominio ON cuotas(condominio_id);
CREATE INDEX idx_cuotas_unidad ON cuotas(unidad_id);
CREATE INDEX idx_cuotas_estado ON cuotas(condominio_id, estado);
CREATE INDEX idx_cuotas_periodo ON cuotas(condominio_id, periodo_ano, periodo_mes);
```

### 3.2 Pagos

```sql
CREATE TABLE pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    cuota_id UUID REFERENCES cuotas(id),
    unidad_id UUID NOT NULL REFERENCES unidades(id),
    
    -- Monto
    monto DECIMAL(10,2) NOT NULL,
    
    -- Método de Pago
    metodo_pago VARCHAR(50) NOT NULL, -- transferencia, tarjeta, efectivo, cheque
    referencia VARCHAR(255), -- Número de transacción, cheque, etc.
    
    -- Fechas
    fecha_pago DATE NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'confirmado', -- pendiente, confirmado, rechazado, revertido
    
    -- Información adicional
    banco VARCHAR(100),
    numero_operacion VARCHAR(100),
    comprobante_url VARCHAR(500),
    notas TEXT,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registrado_por UUID REFERENCES usuarios(id),
    
    CONSTRAINT chk_monto_positivo CHECK (monto > 0),
    CONSTRAINT chk_estado_pago CHECK (estado IN ('pendiente', 'confirmado', 'rechazado', 'revertido'))
);

CREATE INDEX idx_pagos_condominio ON pagos(condominio_id);
CREATE INDEX idx_pagos_cuota ON pagos(cuota_id);
CREATE INDEX idx_pagos_unidad ON pagos(unidad_id);
CREATE INDEX idx_pagos_fecha ON pagos(condominio_id, fecha_pago);
```

### 3.3 Ingresos y Egresos

```sql
CREATE TABLE transacciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    
    -- Tipo
    tipo VARCHAR(20) NOT NULL, -- ingreso, egreso
    
    -- Categoría
    categoria VARCHAR(100) NOT NULL, -- mantenimiento, servicios, administracion, etc.
    subcategoria VARCHAR(100),
    
    -- Monto
    monto DECIMAL(10,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'CLP',
    
    -- Descripción
    concepto TEXT NOT NULL,
    descripcion TEXT,
    
    -- Proveedor (para egresos)
    proveedor_id UUID,
    
    -- Fechas
    fecha_transaccion DATE NOT NULL,
    fecha_vencimiento DATE,
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'registrado', -- registrado, aprobado, pagado, anulado
    
    -- Documentos
    numero_documento VARCHAR(100),
    tipo_documento VARCHAR(50), -- factura, boleta, recibo
    documento_url VARCHAR(500),
    
    -- Presupuesto
    presupuesto_id UUID,
    afecta_presupuesto BOOLEAN DEFAULT true,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES usuarios(id),
    aprobado_por UUID REFERENCES usuarios(id),
    
    CONSTRAINT chk_tipo_transaccion CHECK (tipo IN ('ingreso', 'egreso')),
    CONSTRAINT chk_monto_positivo CHECK (monto > 0)
);

CREATE INDEX idx_transacciones_condominio ON transacciones(condominio_id);
CREATE INDEX idx_transacciones_tipo ON transacciones(condominio_id, tipo);
CREATE INDEX idx_transacciones_categoria ON transacciones(condominio_id, categoria);
CREATE INDEX idx_transacciones_fecha ON transacciones(condominio_id, fecha_transaccion);
```

## 4. Módulo Operativo

### 4.1 Activos

```sql
CREATE TABLE activos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    
    -- Identificación
    codigo VARCHAR(50),
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    subcategoria VARCHAR(100),
    
    -- Descripción
    descripcion TEXT,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    numero_serie VARCHAR(100),
    
    -- Ubicación
    ubicacion TEXT,
    
    -- Información Financiera
    valor_compra DECIMAL(12,2),
    fecha_compra DATE,
    vida_util_anos INTEGER,
    valor_residual DECIMAL(12,2),
    
    -- Estado
    estado VARCHAR(50) DEFAULT 'activo', -- activo, en_mantenimiento, fuera_servicio, dado_baja
    
    -- Mantenimiento
    requiere_mantenimiento BOOLEAN DEFAULT true,
    frecuencia_mantenimiento_dias INTEGER,
    ultimo_mantenimiento DATE,
    proximo_mantenimiento DATE,
    
    -- Documentación
    documentos JSONB, -- URLs de manuales, certificados, etc.
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES usuarios(id),
    
    UNIQUE(condominio_id, codigo),
    CONSTRAINT chk_estado_activo CHECK (estado IN ('activo', 'en_mantenimiento', 'fuera_servicio', 'dado_baja'))
);

CREATE INDEX idx_activos_condominio ON activos(condominio_id);
CREATE INDEX idx_activos_categoria ON activos(condominio_id, categoria);
CREATE INDEX idx_activos_estado ON activos(condominio_id, estado);
```

### 4.2 Subunidades

```sql
CREATE TABLE subunidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    
    -- Identificación
    codigo VARCHAR(50) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- estacionamiento, bodega, local, otro
    
    -- Descripción
    nombre VARCHAR(255),
    descripcion TEXT,
    
    -- Ubicación
    piso INTEGER,
    sector VARCHAR(100),
    
    -- Características
    metros_cuadrados DECIMAL(10,2),
    caracteristicas JSONB,
    
    -- Asignación
    unidad_id UUID REFERENCES unidades(id),
    fecha_asignacion DATE,
    
    -- Tarifa
    tiene_cuota_adicional BOOLEAN DEFAULT false,
    monto_cuota_adicional DECIMAL(10,2),
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'disponible', -- disponible, asignada, mantenimiento
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(condominio_id, codigo),
    CONSTRAINT chk_tipo_subunidad CHECK (tipo IN ('estacionamiento', 'bodega', 'local', 'otro')),
    CONSTRAINT chk_estado_subunidad CHECK (estado IN ('disponible', 'asignada', 'mantenimiento'))
);

CREATE INDEX idx_subunidades_condominio ON subunidades(condominio_id);
CREATE INDEX idx_subunidades_tipo ON subunidades(condominio_id, tipo);
CREATE INDEX idx_subunidades_unidad ON subunidades(unidad_id);
```

### 4.3 Órdenes de Mantenimiento

```sql
CREATE TABLE ordenes_mantenimiento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    
    -- Relaciones
    activo_id UUID REFERENCES activos(id),
    
    -- Tipo
    tipo VARCHAR(50) NOT NULL, -- preventivo, correctivo, emergencia
    prioridad VARCHAR(20) DEFAULT 'normal', -- baja, normal, alta, urgente
    
    -- Descripción
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    
    -- Asignación
    proveedor_id UUID,
    tecnico_asignado VARCHAR(255),
    
    -- Fechas
    fecha_solicitud DATE NOT NULL,
    fecha_programada DATE,
    fecha_inicio TIMESTAMP,
    fecha_finalizacion TIMESTAMP,
    
    -- Presupuesto
    costo_estimado DECIMAL(10,2),
    costo_real DECIMAL(10,2),
    
    -- Estado
    estado VARCHAR(50) DEFAULT 'solicitada', 
    -- solicitada, aprobada, en_proceso, completada, cancelada
    
    -- Resultado
    trabajo_realizado TEXT,
    repuestos_usados JSONB,
    observaciones TEXT,
    
    -- Satisfacción
    calificacion INTEGER, -- 1-5
    comentarios_calificacion TEXT,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES usuarios(id),
    
    CONSTRAINT chk_tipo_mantenimiento CHECK (tipo IN ('preventivo', 'correctivo', 'emergencia')),
    CONSTRAINT chk_prioridad CHECK (prioridad IN ('baja', 'normal', 'alta', 'urgente')),
    CONSTRAINT chk_calificacion CHECK (calificacion IS NULL OR (calificacion >= 1 AND calificacion <= 5))
);

CREATE INDEX idx_mantenimiento_condominio ON ordenes_mantenimiento(condominio_id);
CREATE INDEX idx_mantenimiento_activo ON ordenes_mantenimiento(activo_id);
CREATE INDEX idx_mantenimiento_estado ON ordenes_mantenimiento(condominio_id, estado);
```

## 5. Módulo de Comunicación

### 5.1 Anuncios

```sql
CREATE TABLE anuncios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    
    -- Contenido
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'general', -- general, urgente, evento, mantenimiento
    
    -- Publicación
    fecha_publicacion TIMESTAMP NOT NULL,
    fecha_expiracion TIMESTAMP,
    visible BOOLEAN DEFAULT true,
    
    -- Audiencia
    dirigido_a VARCHAR(50) DEFAULT 'todos', -- todos, propietarios, residentes
    
    -- Adjuntos
    archivos JSONB, -- URLs de archivos adjuntos
    
    -- Interacción
    permite_comentarios BOOLEAN DEFAULT true,
    fijado BOOLEAN DEFAULT false,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES usuarios(id),
    
    CONSTRAINT chk_tipo_anuncio CHECK (tipo IN ('general', 'urgente', 'evento', 'mantenimiento'))
);

CREATE INDEX idx_anuncios_condominio ON anuncios(condominio_id);
CREATE INDEX idx_anuncios_visible ON anuncios(condominio_id, visible) WHERE visible = true;
CREATE INDEX idx_anuncios_fecha ON anuncios(condominio_id, fecha_publicacion);
```

### 5.2 Incidencias

```sql
CREATE TABLE incidencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    
    -- Relaciones
    unidad_id UUID REFERENCES unidades(id),
    reportado_por UUID NOT NULL REFERENCES usuarios(id),
    
    -- Contenido
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL, -- plomeria, electricidad, seguridad, etc.
    
    -- Ubicación
    ubicacion TEXT,
    
    -- Prioridad
    prioridad VARCHAR(20) DEFAULT 'normal', -- baja, normal, alta, urgente
    
    -- Estado
    estado VARCHAR(50) DEFAULT 'reportada',
    -- reportada, en_revision, asignada, en_proceso, resuelta, cerrada
    
    -- Asignación
    asignado_a UUID REFERENCES usuarios(id),
    fecha_asignacion TIMESTAMP,
    
    -- Resolución
    fecha_resolucion TIMESTAMP,
    solucion TEXT,
    
    -- Seguimiento
    fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP,
    
    -- Satisfacción
    calificacion INTEGER,
    comentario_calificacion TEXT,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incidencias_condominio ON incidencias(condominio_id);
CREATE INDEX idx_incidencias_estado ON incidencias(condominio_id, estado);
CREATE INDEX idx_incidencias_reportado ON incidencias(reportado_por);
```

## 6. Módulo de Reservas

### 6.1 Espacios Reservables

```sql
CREATE TABLE espacios_reservables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    
    -- Identificación
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50), -- salon, quincho, piscina, cancha, sala_reuniones
    
    -- Características
    capacidad INTEGER,
    caracteristicas JSONB,
    
    -- Tarifa
    requiere_pago BOOLEAN DEFAULT false,
    costo_base DECIMAL(10,2),
    costo_por_hora DECIMAL(10,2),
    deposito_garantia DECIMAL(10,2),
    
    -- Configuración
    reglas JSONB, -- Horarios, restricciones, etc.
    
    -- Estado
    activo BOOLEAN DEFAULT true,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_espacios_condominio ON espacios_reservables(condominio_id);
CREATE INDEX idx_espacios_activo ON espacios_reservables(condominio_id, activo) WHERE activo = true;
```

### 6.2 Reservas

```sql
CREATE TABLE reservas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    
    -- Relaciones
    espacio_id UUID NOT NULL REFERENCES espacios_reservables(id),
    unidad_id UUID NOT NULL REFERENCES unidades(id),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    
    -- Fechas
    fecha_reserva DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    
    -- Detalles
    motivo TEXT,
    cantidad_personas INTEGER,
    
    -- Costos
    costo_total DECIMAL(10,2),
    deposito_pagado DECIMAL(10,2),
    deposito_devuelto BOOLEAN DEFAULT false,
    
    -- Estado
    estado VARCHAR(50) DEFAULT 'pendiente',
    -- pendiente, confirmada, cancelada, completada
    
    -- Fechas de gestión
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_confirmacion TIMESTAMP,
    fecha_cancelacion TIMESTAMP,
    motivo_cancelacion TEXT,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_estado_reserva CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada')),
    CONSTRAINT chk_hora_valida CHECK (hora_fin > hora_inicio)
);

CREATE INDEX idx_reservas_condominio ON reservas(condominio_id);
CREATE INDEX idx_reservas_espacio ON reservas(espacio_id);
CREATE INDEX idx_reservas_unidad ON reservas(unidad_id);
CREATE INDEX idx_reservas_fecha ON reservas(condominio_id, fecha_reserva);
CREATE INDEX idx_reservas_estado ON reservas(condominio_id, estado);
```

## 7. Auditoría y Logging

```sql
CREATE TABLE auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominio_id UUID REFERENCES condominios(id),
    
    -- Acción
    tabla VARCHAR(100) NOT NULL,
    registro_id UUID NOT NULL,
    accion VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    
    -- Datos
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    
    -- Usuario
    usuario_id UUID REFERENCES usuarios(id),
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_accion CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE'))
);

CREATE INDEX idx_auditoria_condominio ON auditoria(condominio_id);
CREATE INDEX idx_auditoria_tabla ON auditoria(tabla, registro_id);
CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_fecha ON auditoria(created_at);
```

## 8. Triggers para Multi-Tenancy

```sql
-- Ejemplo: Función para validar acceso multi-tenant
CREATE OR REPLACE FUNCTION validar_tenant()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar que el condominio_id no cambie en updates
    IF TG_OP = 'UPDATE' AND OLD.condominio_id != NEW.condominio_id THEN
        RAISE EXCEPTION 'No se puede cambiar el condominio_id';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a tablas relevantes
CREATE TRIGGER trg_validar_tenant_unidades
    BEFORE UPDATE ON unidades
    FOR EACH ROW
    EXECUTE FUNCTION validar_tenant();
```

## 9. Vistas Útiles

```sql
-- Vista: Estado financiero por unidad
CREATE VIEW v_estado_financiero_unidad AS
SELECT 
    u.id AS unidad_id,
    u.condominio_id,
    u.numero AS unidad_numero,
    COUNT(c.id) AS total_cuotas,
    SUM(CASE WHEN c.estado = 'pagada' THEN c.monto_total ELSE 0 END) AS total_pagado,
    SUM(CASE WHEN c.estado = 'pendiente' THEN c.monto_total ELSE 0 END) AS total_pendiente,
    SUM(CASE WHEN c.estado = 'vencida' THEN c.monto_total ELSE 0 END) AS total_vencido
FROM unidades u
LEFT JOIN cuotas c ON u.id = c.unidad_id
GROUP BY u.id, u.condominio_id, u.numero;
```

## 10. Índices y Optimizaciones

```sql
-- Row Level Security para PostgreSQL
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY unidades_isolation_policy ON unidades
    USING (condominio_id = current_setting('app.current_condominio_id')::UUID);

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_cuotas_busqueda ON cuotas(condominio_id, unidad_id, estado, periodo_ano, periodo_mes);
CREATE INDEX idx_pagos_busqueda ON pagos(condominio_id, unidad_id, fecha_pago);
```
