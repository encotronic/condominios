# Sistema de Configuración Multi-Condominio

## 1. Visión General

El sistema de configuración permite que cada condominio personalice completamente su operación, desde reglas financieras hasta políticas de reserva, manteniendo la flexibilidad sin comprometer la estructura base de la plataforma.

## 2. Estructura de Configuración

### 2.1 Niveles de Configuración

```
Sistema (Global)
    ↓
Condominio (Tenant)
    ↓
Módulo Específico
    ↓
Configuración Individual
```

## 3. Configuraciones por Módulo

## 3.1 Configuración de Activos

### Esquema de Configuración

```json
{
  "activos": {
    "categorias_personalizadas": [
      {
        "id": "elevadores",
        "nombre": "Elevadores",
        "descripcion": "Equipos de transporte vertical",
        "requiere_certificacion": true,
        "vida_util_anos": 15
      },
      {
        "id": "cisterna",
        "nombre": "Cisterna y Bombas",
        "descripcion": "Sistema de agua",
        "requiere_certificacion": true,
        "vida_util_anos": 20
      }
    ],
    "reglas_depreciacion": {
      "metodo": "lineal",
      "personalizado_por_categoria": true,
      "considera_valor_rescate": true
    },
    "mantenimiento": {
      "requiere_aprobacion": true,
      "limite_sin_aprobacion": 5000,
      "proveedores_autorizados_obligatorio": false
    },
    "campos_personalizados": [
      {
        "nombre": "numero_serie",
        "tipo": "texto",
        "requerido": true,
        "visible_propietarios": false
      },
      {
        "nombre": "ubicacion_exacta",
        "tipo": "texto",
        "requerido": true,
        "visible_propietarios": true
      }
    ]
  }
}
```

### Propiedades Configurables

| Propiedad | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `categorias_personalizadas` | Array | Tipos de activos específicos del condominio | Elevadores, Piscina, Cisterna |
| `vida_util_anos` | Número | Años de vida útil esperada | 15, 20, 25 |
| `reglas_depreciacion` | Objeto | Método y reglas de depreciación | Lineal, acelerada |
| `requiere_certificacion` | Boolean | Si necesita certificación externa | true/false |
| `limite_sin_aprobacion` | Número | Monto máximo sin autorización | 5000 |

## 3.2 Configuración de Subunidades

### Esquema de Configuración

```json
{
  "subunidades": {
    "tipos_habilitados": [
      {
        "id": "estacionamiento",
        "nombre": "Estacionamiento",
        "requiere_asignacion": true,
        "permite_multiple": true,
        "cuota_adicional": true,
        "transferible": true
      },
      {
        "id": "bodega",
        "nombre": "Bodega",
        "requiere_asignacion": true,
        "permite_multiple": false,
        "cuota_adicional": true,
        "transferible": false
      },
      {
        "id": "area_comun",
        "nombre": "Área Común",
        "requiere_asignacion": false,
        "permite_multiple": false,
        "cuota_adicional": false,
        "transferible": false
      }
    ],
    "reglas_asignacion": {
      "limite_por_unidad": {
        "estacionamiento": 2,
        "bodega": 1
      },
      "requiere_aprobacion_comite": true,
      "permite_arrendamiento": true
    },
    "tarifas": {
      "estacionamiento": {
        "cuota_mensual": 500,
        "tipo_cobro": "fijo"
      },
      "bodega": {
        "cuota_mensual": 300,
        "tipo_cobro": "fijo"
      }
    }
  }
}
```

### Propiedades Configurables

| Propiedad | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `tipos_habilitados` | Array | Tipos de subunidades disponibles | Estacionamiento, Bodega |
| `requiere_asignacion` | Boolean | Si debe estar asignada a una unidad | true/false |
| `permite_multiple` | Boolean | Si una unidad puede tener varias | true/false |
| `transferible` | Boolean | Si puede transferirse entre unidades | true/false |
| `cuota_adicional` | Boolean | Si genera cobro adicional | true/false |

## 3.3 Configuración de Planes de Mantenimiento

### Esquema de Configuración

```json
{
  "mantenimiento": {
    "planes_preventivos": [
      {
        "id": "elevadores_preventivo",
        "nombre": "Mantenimiento Preventivo Elevadores",
        "activo_tipo": "elevadores",
        "frecuencia": {
          "tipo": "mensual",
          "cada": 1,
          "dia_preferido": 15
        },
        "proveedor_preferido": "PROV-001",
        "presupuesto_estimado": 3000,
        "requiere_notificacion_propietarios": false,
        "ventana_ejecucion_dias": 7
      },
      {
        "id": "limpieza_cisterna",
        "nombre": "Limpieza de Cisterna",
        "activo_tipo": "cisterna",
        "frecuencia": {
          "tipo": "semestral",
          "cada": 6,
          "mes_preferido": [1, 7]
        },
        "proveedor_preferido": "PROV-002",
        "presupuesto_estimado": 5000,
        "requiere_notificacion_propietarios": true,
        "ventana_ejecucion_dias": 15
      }
    ],
    "mantenimiento_correctivo": {
      "categorizacion": [
        {
          "id": "urgente",
          "nombre": "Urgente",
          "tiempo_respuesta_horas": 2,
          "requiere_aprobacion": false
        },
        {
          "id": "alta",
          "nombre": "Alta Prioridad",
          "tiempo_respuesta_horas": 24,
          "requiere_aprobacion": true,
          "limite_monto": 10000
        },
        {
          "id": "normal",
          "nombre": "Normal",
          "tiempo_respuesta_horas": 72,
          "requiere_aprobacion": true,
          "limite_monto": 5000
        }
      ]
    },
    "proveedores": {
      "requiere_autorizacion": true,
      "cantidad_cotizaciones_minimas": 3,
      "evaluacion_periodica": true
    }
  }
}
```

### Propiedades Configurables

| Propiedad | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `frecuencia` | Objeto | Periodicidad del mantenimiento | Mensual, Trimestral, Semestral |
| `proveedor_preferido` | String | ID del proveedor asignado | PROV-001 |
| `presupuesto_estimado` | Número | Monto estimado del servicio | 3000 |
| `tiempo_respuesta_horas` | Número | SLA de respuesta | 2, 24, 72 |
| `requiere_aprobacion` | Boolean | Si necesita autorización | true/false |

## 3.4 Configuración de Reglas Financieras

### Esquema de Configuración

```json
{
  "finanzas": {
    "estructura_cuotas": {
      "cuota_base": {
        "tipo_calculo": "proporcional_metros",
        "monto_base_m2": 50,
        "redondeo": "centena_superior"
      },
      "cuotas_adicionales": [
        {
          "concepto": "estacionamiento",
          "monto": 500,
          "tipo": "fijo_por_unidad"
        },
        {
          "concepto": "bodega",
          "monto": 300,
          "tipo": "fijo_por_unidad"
        }
      ],
      "cuota_extraordinaria": {
        "requiere_aprobacion_asamblea": true,
        "porcentaje_quorum": 51,
        "prorrateada_segun": "metros_cuadrados"
      }
    },
    "fechas_vencimiento": {
      "dia_mes": 5,
      "permite_cambio_individual": false,
      "notificacion_anticipada_dias": 7,
      "recordatorios": [
        {
          "dias_antes": 5,
          "canal": "email"
        },
        {
          "dias_antes": 1,
          "canal": "email,sms"
        }
      ]
    },
    "intereses_mora": {
      "aplica": true,
      "tipo": "porcentaje_mensual",
      "tasa": 2.5,
      "dias_gracia": 5,
      "calculo": "sobre_saldo",
      "maximo_acumulable": 50
    },
    "descuentos": {
      "pronto_pago": {
        "aplica": true,
        "dias_anticipacion": 5,
        "tipo": "porcentaje",
        "valor": 3
      },
      "anual_anticipado": {
        "aplica": true,
        "tipo": "porcentaje",
        "valor": 10
      }
    },
    "metodos_pago": {
      "habilitados": [
        {
          "metodo": "transferencia",
          "activo": true,
          "datos_cuenta": "1234567890",
          "banco": "Banco XYZ"
        },
        {
          "metodo": "tarjeta_credito",
          "activo": true,
          "recargo": 3,
          "gateway": "stripe"
        },
        {
          "metodo": "efectivo",
          "activo": true,
          "horario_atencion": "L-V 9:00-17:00"
        }
      ]
    },
    "presupuesto": {
      "periodo_fiscal": "enero-diciembre",
      "requiere_aprobacion_asamblea": true,
      "permite_ajustes": true,
      "alertas_desviacion": {
        "umbral_porcentaje": 10,
        "notificar_a": ["administrador", "comite"]
      }
    }
  }
}
```

### Propiedades Configurables

| Propiedad | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `tipo_calculo` | String | Método de cálculo de cuota | proporcional_metros, fijo |
| `dia_mes` | Número | Día de vencimiento mensual | 5, 10, 15 |
| `tasa_interes` | Número | % de interés moratorio | 2.5 |
| `dias_gracia` | Número | Días sin cobro de mora | 5 |
| `descuento_pronto_pago` | Número | % de descuento | 3 |

## 3.5 Configuración de Reglas de Reservas

### Esquema de Configuración

```json
{
  "reservas": {
    "espacios_reservables": [
      {
        "id": "salon_eventos",
        "nombre": "Salón de Eventos",
        "capacidad": 100,
        "requiere_pago": true,
        "costo_por_hora": 500,
        "costo_limpieza": 1000,
        "horarios_disponibles": {
          "lunes": [],
          "martes": [],
          "miercoles": [],
          "jueves": [],
          "viernes": ["18:00-23:00"],
          "sabado": ["09:00-23:00"],
          "domingo": ["09:00-20:00"]
        },
        "duracion_minima_horas": 4,
        "duracion_maxima_horas": 8,
        "anticipacion_minima_dias": 7,
        "anticipacion_maxima_dias": 60,
        "restricciones": {
          "solo_propietarios": true,
          "requiere_estar_al_dia": true,
          "limite_reservas_mes": 1
        },
        "politica_cancelacion": {
          "permite": true,
          "plazo_minimo_horas": 48,
          "penalizacion": {
            "aplica": true,
            "porcentaje": 50,
            "dentro_de_horas": 24
          }
        },
        "extras_disponibles": [
          {
            "id": "sillas_adicionales",
            "nombre": "Sillas Adicionales",
            "costo": 10,
            "unidad": "unidad",
            "cantidad_maxima": 50
          },
          {
            "id": "proyector",
            "nombre": "Proyector y Pantalla",
            "costo": 200,
            "unidad": "servicio"
          }
        ]
      },
      {
        "id": "quincho",
        "nombre": "Quincho",
        "capacidad": 30,
        "requiere_pago": false,
        "horarios_disponibles": {
          "lunes": ["11:00-20:00"],
          "martes": ["11:00-20:00"],
          "miercoles": ["11:00-20:00"],
          "jueves": ["11:00-20:00"],
          "viernes": ["11:00-20:00"],
          "sabado": ["11:00-21:00"],
          "domingo": ["11:00-21:00"]
        },
        "duracion_minima_horas": 2,
        "duracion_maxima_horas": 6,
        "anticipacion_minima_dias": 2,
        "anticipacion_maxima_dias": 30,
        "restricciones": {
          "solo_propietarios": false,
          "requiere_estar_al_dia": true,
          "limite_reservas_mes": 4
        }
      }
    ],
    "reglas_generales": {
      "confirmacion_automatica": true,
      "requiere_aprobacion_admin": false,
      "deposito_garantia": {
        "aplica": true,
        "monto": 5000,
        "devolucion_automatica": true,
        "plazo_devolucion_dias": 3
      },
      "notificaciones": {
        "confirmacion": true,
        "recordatorio_24h": true,
        "recordatorio_2h": false
      }
    }
  }
}
```

### Propiedades Configurables

| Propiedad | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `horarios_disponibles` | Objeto | Disponibilidad por día | Lunes-Domingo con rangos |
| `duracion_minima_horas` | Número | Tiempo mínimo de reserva | 2, 4 |
| `anticipacion_minima_dias` | Número | Días antes para reservar | 2, 7 |
| `costo_por_hora` | Número | Tarifa horaria | 500 |
| `limite_reservas_mes` | Número | Máximo de reservas mensuales | 1, 4 |

## 4. Implementación Técnica

### 4.1 Almacenamiento

Las configuraciones se almacenan en formato JSONB en PostgreSQL:

```sql
CREATE TABLE configuracion_condominio (
    id UUID PRIMARY KEY,
    condominio_id UUID REFERENCES condominios(id),
    modulo VARCHAR(50) NOT NULL,
    config JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES usuarios(id),
    UNIQUE(condominio_id, modulo)
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_config_condominio_modulo ON configuracion_condominio(condominio_id, modulo);
CREATE INDEX idx_config_jsonb ON configuracion_condominio USING GIN (config);
```

### 4.2 Validación

Cada módulo tiene su esquema JSON Schema para validar configuraciones:

```javascript
// Ejemplo: Validador de configuración de activos
const Ajv = require('ajv');
const ajv = new Ajv();

const activosConfigSchema = {
  type: 'object',
  properties: {
    activos: {
      type: 'object',
      properties: {
        categorias_personalizadas: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'nombre'],
            properties: {
              id: { type: 'string' },
              nombre: { type: 'string' },
              vida_util_anos: { type: 'number', minimum: 1 }
            }
          }
        }
      }
    }
  }
};

const validate = ajv.compile(activosConfigSchema);
```

### 4.3 API de Configuración

```javascript
// GET /api/v1/condominios/{id}/configuracion/{modulo}
// Obtener configuración de un módulo

// PUT /api/v1/condominios/{id}/configuracion/{modulo}
// Actualizar configuración de un módulo

// POST /api/v1/condominios/{id}/configuracion/{modulo}/validar
// Validar configuración antes de aplicar

// GET /api/v1/condominios/{id}/configuracion
// Obtener todas las configuraciones del condominio
```

### 4.4 Caché de Configuración

```javascript
// Implementación con Redis
const getConfiguracion = async (condominioId, modulo) => {
  const cacheKey = `config:${condominioId}:${modulo}`;
  
  // Intentar obtener de caché
  let config = await redis.get(cacheKey);
  
  if (!config) {
    // Si no está en caché, obtener de BD
    config = await db.query(
      'SELECT config FROM configuracion_condominio WHERE condominio_id = $1 AND modulo = $2',
      [condominioId, modulo]
    );
    
    // Guardar en caché (expiración: 1 hora)
    await redis.setex(cacheKey, 3600, JSON.stringify(config));
  }
  
  return JSON.parse(config);
};
```

## 5. Migración y Versionado

### 5.1 Versionado de Configuración

Cada cambio de configuración genera una nueva versión:

```sql
CREATE TABLE configuracion_historia (
    id UUID PRIMARY KEY,
    configuracion_id UUID REFERENCES configuracion_condominio(id),
    version INTEGER NOT NULL,
    config JSONB NOT NULL,
    cambios TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES usuarios(id)
);
```

### 5.2 Rollback

Posibilidad de volver a una configuración anterior:

```javascript
const rollbackConfiguracion = async (condominioId, modulo, version) => {
  const configAnterior = await db.query(
    'SELECT config FROM configuracion_historia WHERE configuracion_id = (SELECT id FROM configuracion_condominio WHERE condominio_id = $1 AND modulo = $2) AND version = $3',
    [condominioId, modulo, version]
  );
  
  // Aplicar configuración anterior
  await updateConfiguracion(condominioId, modulo, configAnterior.config);
};
```

## 6. Interfaz de Usuario

### 6.1 Wizard de Configuración Inicial

Al crear un nuevo condominio, se guía al administrador:

1. **Información Básica**: Nombre, dirección, datos de contacto
2. **Configuración Financiera**: Estructura de cuotas, fechas, métodos de pago
3. **Activos y Mantenimiento**: Catálogo inicial, planes preventivos
4. **Subunidades**: Tipos, tarifas, reglas
5. **Reservas**: Espacios, horarios, políticas
6. **Revisión y Confirmación**: Resumen antes de activar

### 6.2 Panel de Configuración

Dashboard para administradores con acceso a todas las configuraciones:

- Vista por módulos
- Búsqueda de configuraciones específicas
- Historial de cambios
- Comparación entre versiones
- Exportación/Importación de configuraciones

## 7. Mejores Prácticas

### 7.1 Configuración por Defecto

Proporcionar valores por defecto sensatos:

```javascript
const defaultConfig = {
  finanzas: {
    fechas_vencimiento: { dia_mes: 5 },
    intereses_mora: { tasa: 2.0, dias_gracia: 5 },
    descuentos: { pronto_pago: { aplica: false } }
  }
};
```

### 7.2 Validación de Integridad

Verificar consistencia entre configuraciones:

- Si se habilita cobro de estacionamiento, debe existir tipo "estacionamiento"
- Si hay descuento por pronto pago, debe ser menor al 100%
- Horarios de reserva no pueden solaparse

### 7.3 Documentación

Cada configuración debe tener:
- Descripción clara
- Valores permitidos
- Valor por defecto
- Ejemplos
- Impacto en el sistema

## 8. Testing

### 8.1 Tests de Validación

```javascript
describe('Configuración de Activos', () => {
  test('debe validar estructura correcta', () => {
    const config = {
      activos: {
        categorias_personalizadas: [
          { id: 'elevador', nombre: 'Elevador', vida_util_anos: 15 }
        ]
      }
    };
    expect(validarConfiguracion('activos', config)).toBe(true);
  });
  
  test('debe rechazar vida útil negativa', () => {
    const config = {
      activos: {
        categorias_personalizadas: [
          { id: 'elevador', nombre: 'Elevador', vida_util_anos: -5 }
        ]
      }
    };
    expect(() => validarConfiguracion('activos', config)).toThrow();
  });
});
```

## 9. Roadmap

### Fase 1 (Actual)
- ✅ Esquema de configuración definido
- ✅ Documentación completa
- [ ] Implementación de almacenamiento
- [ ] APIs básicas

### Fase 2
- [ ] Wizard de configuración
- [ ] Panel de administración
- [ ] Historial y versionado

### Fase 3
- [ ] Importación/Exportación
- [ ] Templates de configuración
- [ ] Configuración avanzada por módulo
