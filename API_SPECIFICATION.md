# Especificación de APIs - Plataforma Multi-Condominio

## 1. Visión General

Esta especificación define las APIs RESTful para la plataforma SaaS multi-condominio. Todas las APIs siguen principios REST, usan JSON para intercambio de datos y requieren autenticación JWT.

## 2. Principios Generales

### 2.1 Convenciones

- **Base URL**: `https://api.condominios.app/v1`
- **Formato**: JSON (Content-Type: application/json)
- **Autenticación**: JWT Bearer Token
- **Versionado**: En la URL (`/v1`, `/v2`)
- **HTTPS**: Obligatorio en producción
- **Rate Limiting**: 1000 requests/hora por tenant

### 2.2 Estructura de Response

#### Success Response

```json
{
  "success": true,
  "data": {
    // Datos de respuesta
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "El campo 'email' es requerido",
    "details": {
      "field": "email",
      "constraint": "required"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

### 2.3 Códigos de Estado HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Operación exitosa |
| 201 | Created | Recurso creado exitosamente |
| 204 | No Content | Operación exitosa sin contenido |
| 400 | Bad Request | Solicitud inválida |
| 401 | Unauthorized | No autenticado |
| 403 | Forbidden | No autorizado |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (ej: duplicado) |
| 422 | Unprocessable Entity | Validación fallida |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor |

### 2.4 Paginación

```
GET /api/v1/unidades?page=1&limit=20&sort=numero&order=asc
```

Response:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

### 2.5 Filtrado y Búsqueda

```
GET /api/v1/cuotas?estado=pendiente&periodo_ano=2024&periodo_mes=1
GET /api/v1/unidades?search=201&filter[piso]=2
```

## 3. Autenticación y Autorización

### 3.1 Login

```
POST /api/v1/auth/login
```

Request:

```json
{
  "email": "usuario@example.com",
  "password": "SecureP@ssw0rd123!",
  "condominio_id": "uuid-condominio"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "uuid-user",
      "email": "usuario@example.com",
      "nombre": "Juan Pérez",
      "rol": "propietario",
      "condominio": {
        "id": "uuid-condominio",
        "nombre": "Edificio Central"
      }
    }
  }
}
```

### 3.2 Refresh Token

```
POST /api/v1/auth/refresh
```

Request:

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 3.3 Logout

```
POST /api/v1/auth/logout
Authorization: Bearer {access_token}
```

### 3.4 Reset Password

```
POST /api/v1/auth/forgot-password
```

Request:

```json
{
  "email": "usuario@example.com",
  "condominio_id": "uuid-condominio"
}
```

## 4. APIs por Módulo

## 4.1 Módulo de Condominios

### Obtener Información del Condominio

```
GET /api/v1/condominios/{condominio_id}
Authorization: Bearer {token}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid-condominio",
    "nombre": "Edificio Central",
    "direccion": "Av. Principal 123",
    "total_unidades": 150,
    "metros_cuadrados_totales": 12000,
    "ano_construccion": 2015,
    "tipo_condominio": "residencial",
    "estado": "activo"
  }
}
```

### Obtener Dashboard del Condominio

```
GET /api/v1/condominios/{condominio_id}/dashboard
Authorization: Bearer {token}
```

Response:

```json
{
  "success": true,
  "data": {
    "resumen_financiero": {
      "morosidad_porcentaje": 5,
      "fondo_reserva": 15000000,
      "ingresos_mes_actual": 45000000,
      "gastos_mes_actual": 43500000
    },
    "resumen_operativo": {
      "mantenimientos_pendientes": 2,
      "incidencias_abiertas": 5,
      "satisfaccion_promedio": 4.5
    },
    "score_general": 88,
    "fortalezas": [
      {
        "categoria": "financiera",
        "nombre": "Morosidad Baja",
        "valor": "5%"
      }
    ],
    "pendientes": [
      {
        "tipo": "mantenimiento",
        "titulo": "Mantención Elevadores",
        "fecha": "2024-01-15",
        "prioridad": "alta"
      }
    ]
  }
}
```

## 4.2 Módulo de Unidades

### Listar Unidades

```
GET /api/v1/condominios/{condominio_id}/unidades
Authorization: Bearer {token}
Query Parameters:
  - page: número de página
  - limit: items por página
  - search: búsqueda por número
  - filter[piso]: filtrar por piso
  - filter[estado]: filtrar por estado
```

### Obtener Unidad

```
GET /api/v1/condominios/{condominio_id}/unidades/{unidad_id}
Authorization: Bearer {token}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid-unidad",
    "numero": "201",
    "piso": 2,
    "metros_cuadrados": 50,
    "tipo": "departamento",
    "estado": "ocupada",
    "propietarios": [
      {
        "id": "uuid-usuario",
        "nombre": "Juan Pérez",
        "email": "juan@example.com",
        "tipo_relacion": "propietario",
        "es_contacto_principal": true
      }
    ],
    "subunidades": [
      {
        "tipo": "estacionamiento",
        "codigo": "E-15",
        "monto_adicional": 20000
      }
    ],
    "estado_financiero": {
      "al_dia": true,
      "deuda_total": 0,
      "ultima_cuota_pagada": "2024-01"
    }
  }
}
```

### Crear Unidad

```
POST /api/v1/condominios/{condominio_id}/unidades
Authorization: Bearer {token}
Roles: admin
```

Request:

```json
{
  "numero": "201",
  "piso": 2,
  "metros_cuadrados": 50,
  "tipo": "departamento",
  "dormitorios": 2,
  "banos": 1,
  "porcentaje_propiedad": 0.667
}
```

## 4.3 Módulo Financiero

### Listar Cuotas

```
GET /api/v1/condominios/{condominio_id}/cuotas
Authorization: Bearer {token}
Query Parameters:
  - unidad_id: filtrar por unidad
  - estado: pendiente|pagada|vencida
  - periodo_ano: año
  - periodo_mes: mes
```

### Obtener Cuota

```
GET /api/v1/condominios/{condominio_id}/cuotas/{cuota_id}
Authorization: Bearer {token}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid-cuota",
    "unidad_id": "uuid-unidad",
    "periodo": "2024-01",
    "monto_base": 120000,
    "monto_adicional": 30000,
    "descuento": 0,
    "monto_total": 150000,
    "fecha_emision": "2023-12-28",
    "fecha_vencimiento": "2024-01-05",
    "estado": "pendiente",
    "detalle": [
      {
        "concepto": "Cuota Base",
        "monto": 120000
      },
      {
        "concepto": "Estacionamiento",
        "monto": 20000
      },
      {
        "concepto": "Bodega",
        "monto": 10000
      }
    ]
  }
}
```

### Generar Cuotas del Período

```
POST /api/v1/condominios/{condominio_id}/cuotas/generar
Authorization: Bearer {token}
Roles: admin
```

Request:

```json
{
  "periodo_ano": 2024,
  "periodo_mes": 2,
  "fecha_vencimiento": "2024-02-05"
}
```

### Registrar Pago

```
POST /api/v1/condominios/{condominio_id}/pagos
Authorization: Bearer {token}
```

Request:

```json
{
  "cuota_id": "uuid-cuota",
  "unidad_id": "uuid-unidad",
  "monto": 150000,
  "metodo_pago": "transferencia",
  "fecha_pago": "2024-01-03",
  "referencia": "TRF-12345678",
  "comprobante_url": "https://storage.../comprobante.pdf"
}
```

### Estado de Cuenta

```
GET /api/v1/condominios/{condominio_id}/unidades/{unidad_id}/estado-cuenta
Authorization: Bearer {token}
Query Parameters:
  - desde: fecha inicial
  - hasta: fecha final
```

Response:

```json
{
  "success": true,
  "data": {
    "unidad": {
      "id": "uuid-unidad",
      "numero": "201"
    },
    "resumen": {
      "saldo_favor": 0,
      "saldo_deuda": 0,
      "estado": "al_dia"
    },
    "cuotas": [
      {
        "periodo": "2024-01",
        "monto": 150000,
        "estado": "pagada",
        "fecha_pago": "2024-01-03"
      }
    ],
    "pagos": [
      {
        "fecha": "2024-01-03",
        "monto": 150000,
        "metodo": "transferencia"
      }
    ]
  }
}
```

### Reportes Financieros

```
GET /api/v1/condominios/{condominio_id}/reportes/financiero
Authorization: Bearer {token}
Roles: admin, propietario
Query Parameters:
  - periodo_ano: año
  - periodo_mes: mes (opcional)
  - tipo: resumen|detallado|comparativo
```

Response:

```json
{
  "success": true,
  "data": {
    "periodo": "2024-01",
    "ingresos": {
      "cuotas": 45000000,
      "otros": 500000,
      "total": 45500000
    },
    "egresos": {
      "personal": 18000000,
      "servicios": 12000000,
      "mantenimiento": 8000000,
      "seguros": 3500000,
      "administracion": 2000000,
      "total": 43500000
    },
    "resultado": {
      "superavit": 2000000,
      "porcentaje": 4.4
    },
    "distribucion_gastos": [
      {
        "categoria": "Personal",
        "monto": 18000000,
        "porcentaje": 41.4
      }
    ]
  }
}
```

## 4.4 Módulo Operativo

### Listar Activos

```
GET /api/v1/condominios/{condominio_id}/activos
Authorization: Bearer {token}
Query Parameters:
  - categoria: filtrar por categoría
  - estado: filtrar por estado
```

### Obtener Activo

```
GET /api/v1/condominios/{condominio_id}/activos/{activo_id}
Authorization: Bearer {token}
```

### Crear Activo

```
POST /api/v1/condominios/{condominio_id}/activos
Authorization: Bearer {token}
Roles: admin
```

Request:

```json
{
  "codigo": "ELEV-001",
  "nombre": "Elevador Principal",
  "categoria": "elevadores",
  "marca": "Schindler",
  "modelo": "5500",
  "numero_serie": "SN123456",
  "ubicacion": "Torre A",
  "valor_compra": 50000000,
  "fecha_compra": "2015-01-15",
  "vida_util_anos": 15,
  "requiere_mantenimiento": true,
  "frecuencia_mantenimiento_dias": 30
}
```

### Órdenes de Mantenimiento

#### Listar Órdenes

```
GET /api/v1/condominios/{condominio_id}/mantenimientos
Authorization: Bearer {token}
Query Parameters:
  - tipo: preventivo|correctivo|emergencia
  - estado: solicitada|aprobada|en_proceso|completada
  - activo_id: filtrar por activo
```

#### Crear Orden

```
POST /api/v1/condominios/{condominio_id}/mantenimientos
Authorization: Bearer {token}
```

Request:

```json
{
  "activo_id": "uuid-activo",
  "tipo": "correctivo",
  "prioridad": "alta",
  "titulo": "Falla en elevador",
  "descripcion": "El elevador se detiene entre pisos",
  "costo_estimado": 500000
}
```

#### Actualizar Estado

```
PATCH /api/v1/condominios/{condominio_id}/mantenimientos/{mantenimiento_id}
Authorization: Bearer {token}
Roles: admin
```

Request:

```json
{
  "estado": "en_proceso",
  "fecha_inicio": "2024-01-15T09:00:00Z",
  "tecnico_asignado": "Carlos Gómez"
}
```

### Subunidades

#### Listar Subunidades

```
GET /api/v1/condominios/{condominio_id}/subunidades
Authorization: Bearer {token}
Query Parameters:
  - tipo: estacionamiento|bodega|local
  - estado: disponible|asignada|mantenimiento
  - unidad_id: filtrar por unidad
```

#### Asignar Subunidad

```
POST /api/v1/condominios/{condominio_id}/subunidades/{subunidad_id}/asignar
Authorization: Bearer {token}
Roles: admin
```

Request:

```json
{
  "unidad_id": "uuid-unidad",
  "fecha_asignacion": "2024-01-15"
}
```

## 4.5 Módulo de Comunicación

### Anuncios

#### Listar Anuncios

```
GET /api/v1/condominios/{condominio_id}/anuncios
Authorization: Bearer {token}
Query Parameters:
  - tipo: general|urgente|evento|mantenimiento
  - desde: fecha inicial
  - hasta: fecha final
```

#### Crear Anuncio

```
POST /api/v1/condominios/{condominio_id}/anuncios
Authorization: Bearer {token}
Roles: admin
```

Request:

```json
{
  "titulo": "Corte de Agua Programado",
  "contenido": "Se informa que el día 20/01 habrá corte de agua...",
  "tipo": "urgente",
  "fecha_publicacion": "2024-01-15T10:00:00Z",
  "fecha_expiracion": "2024-01-21T00:00:00Z",
  "dirigido_a": "todos",
  "fijado": true
}
```

### Incidencias

#### Listar Incidencias

```
GET /api/v1/condominios/{condominio_id}/incidencias
Authorization: Bearer {token}
Query Parameters:
  - estado: reportada|en_revision|asignada|en_proceso|resuelta|cerrada
  - categoria: plomeria|electricidad|seguridad
  - reportado_por: uuid-usuario (admin only)
```

#### Crear Incidencia

```
POST /api/v1/condominios/{condominio_id}/incidencias
Authorization: Bearer {token}
```

Request:

```json
{
  "unidad_id": "uuid-unidad",
  "titulo": "Fuga de agua en baño",
  "descripcion": "Hay una fuga en el lavamanos del baño principal",
  "categoria": "plomeria",
  "prioridad": "alta",
  "ubicacion": "Unidad 201, Baño Principal"
}
```

#### Actualizar Incidencia

```
PATCH /api/v1/condominios/{condominio_id}/incidencias/{incidencia_id}
Authorization: Bearer {token}
```

Request:

```json
{
  "estado": "en_proceso",
  "asignado_a": "uuid-usuario",
  "notas": "Se coordinó visita con plomero para mañana"
}
```

### Votaciones

#### Listar Votaciones

```
GET /api/v1/condominios/{condominio_id}/votaciones
Authorization: Bearer {token}
Query Parameters:
  - estado: abierta|cerrada
```

#### Crear Votación

```
POST /api/v1/condominios/{condominio_id}/votaciones
Authorization: Bearer {token}
Roles: admin
```

Request:

```json
{
  "titulo": "Horarios Piscina Verano 2024",
  "descripcion": "Definir horarios de funcionamiento...",
  "fecha_inicio": "2024-01-15T00:00:00Z",
  "fecha_cierre": "2024-01-31T23:59:59Z",
  "tipo": "opcion_multiple",
  "requiere_quorum": true,
  "quorum_requerido": 51,
  "opciones": [
    {
      "id": "A",
      "texto": "8:00 - 20:00"
    },
    {
      "id": "B",
      "texto": "9:00 - 21:00"
    },
    {
      "id": "C",
      "texto": "10:00 - 22:00"
    }
  ]
}
```

#### Votar

```
POST /api/v1/condominios/{condominio_id}/votaciones/{votacion_id}/votar
Authorization: Bearer {token}
```

Request:

```json
{
  "opcion_id": "A"
}
```

## 4.6 Módulo de Reservas

### Espacios Reservables

#### Listar Espacios

```
GET /api/v1/condominios/{condominio_id}/espacios-reservables
Authorization: Bearer {token}
Query Parameters:
  - tipo: salon|quincho|piscina|cancha
  - activo: true|false
```

#### Obtener Disponibilidad

```
GET /api/v1/condominios/{condominio_id}/espacios-reservables/{espacio_id}/disponibilidad
Authorization: Bearer {token}
Query Parameters:
  - fecha: fecha a consultar (YYYY-MM-DD)
  - mes: mes a consultar (YYYY-MM)
```

Response:

```json
{
  "success": true,
  "data": {
    "espacio_id": "uuid-espacio",
    "fecha": "2024-01-20",
    "bloques": [
      {
        "hora_inicio": "09:00",
        "hora_fin": "13:00",
        "disponible": true
      },
      {
        "hora_inicio": "14:00",
        "hora_fin": "18:00",
        "disponible": false,
        "reservado_por": "Unidad 305"
      },
      {
        "hora_inicio": "18:00",
        "hora_fin": "22:00",
        "disponible": true
      }
    ]
  }
}
```

### Reservas

#### Crear Reserva

```
POST /api/v1/condominios/{condominio_id}/reservas
Authorization: Bearer {token}
```

Request:

```json
{
  "espacio_id": "uuid-espacio",
  "unidad_id": "uuid-unidad",
  "fecha_reserva": "2024-01-20",
  "hora_inicio": "18:00",
  "hora_fin": "22:00",
  "motivo": "Cumpleaños familiar",
  "cantidad_personas": 25
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid-reserva",
    "espacio": "Quincho",
    "fecha": "2024-01-20",
    "hora_inicio": "18:00",
    "hora_fin": "22:00",
    "costo_total": 0,
    "estado": "confirmada",
    "codigo_confirmacion": "RES-2024-001"
  }
}
```

#### Listar Mis Reservas

```
GET /api/v1/condominios/{condominio_id}/mis-reservas
Authorization: Bearer {token}
Query Parameters:
  - estado: pendiente|confirmada|cancelada|completada
  - desde: fecha inicial
  - hasta: fecha final
```

#### Cancelar Reserva

```
DELETE /api/v1/condominios/{condominio_id}/reservas/{reserva_id}
Authorization: Bearer {token}
```

Request:

```json
{
  "motivo_cancelacion": "Cambio de planes"
}
```

## 5. Webhooks

### 5.1 Configuración

```
POST /api/v1/condominios/{condominio_id}/webhooks
Authorization: Bearer {token}
Roles: admin
```

Request:

```json
{
  "url": "https://mi-sistema.com/webhook",
  "eventos": [
    "cuota.generada",
    "pago.recibido",
    "incidencia.creada",
    "reserva.confirmada"
  ],
  "activo": true,
  "secreto": "webhook_secret_key"
}
```

### 5.2 Eventos Disponibles

| Evento | Descripción |
|--------|-------------|
| `cuota.generada` | Nueva cuota generada |
| `pago.recibido` | Pago registrado |
| `pago.confirmado` | Pago confirmado |
| `incidencia.creada` | Nueva incidencia reportada |
| `incidencia.resuelta` | Incidencia resuelta |
| `mantenimiento.programado` | Nuevo mantenimiento programado |
| `mantenimiento.completado` | Mantenimiento completado |
| `anuncio.publicado` | Nuevo anuncio publicado |
| `votacion.iniciada` | Nueva votación iniciada |
| `votacion.cerrada` | Votación cerrada |
| `reserva.confirmada` | Reserva confirmada |
| `reserva.cancelada` | Reserva cancelada |

### 5.3 Formato del Payload

```json
{
  "evento": "pago.recibido",
  "timestamp": "2024-01-15T10:30:00Z",
  "condominio_id": "uuid-condominio",
  "data": {
    "pago_id": "uuid-pago",
    "unidad_id": "uuid-unidad",
    "monto": 150000,
    "metodo": "transferencia"
  },
  "signature": "sha256_hash_del_payload"
}
```

## 6. Ejemplos de Integración

### 6.1 JavaScript/Node.js

```javascript
const axios = require('axios');

const API_BASE = 'https://api.condominios.app/v1';
const ACCESS_TOKEN = 'your_access_token';

// Cliente API
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Obtener cuotas pendientes
async function getCuotasPendientes(condominioId, unidadId) {
  try {
    const response = await apiClient.get(
      `/condominios/${condominioId}/cuotas`,
      {
        params: {
          unidad_id: unidadId,
          estado: 'pendiente'
        }
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response.data);
    throw error;
  }
}

// Registrar pago
async function registrarPago(condominioId, pagoData) {
  try {
    const response = await apiClient.post(
      `/condominios/${condominioId}/pagos`,
      pagoData
    );
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response.data);
    throw error;
  }
}
```

### 6.2 Python

```python
import requests

API_BASE = 'https://api.condominios.app/v1'
ACCESS_TOKEN = 'your_access_token'

class CondominiosAPI:
    def __init__(self, access_token):
        self.base_url = API_BASE
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
    
    def get_cuotas_pendientes(self, condominio_id, unidad_id):
        url = f'{self.base_url}/condominios/{condominio_id}/cuotas'
        params = {
            'unidad_id': unidad_id,
            'estado': 'pendiente'
        }
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()['data']
    
    def registrar_pago(self, condominio_id, pago_data):
        url = f'{self.base_url}/condominios/{condominio_id}/pagos'
        response = requests.post(url, headers=self.headers, json=pago_data)
        response.raise_for_status()
        return response.json()['data']

# Uso
api = CondominiosAPI(ACCESS_TOKEN)
cuotas = api.get_cuotas_pendientes('uuid-condominio', 'uuid-unidad')
```

## 7. Rate Limiting

### 7.1 Límites

| Plan | Requests/Hora | Burst |
|------|---------------|-------|
| Básico | 1,000 | 100 |
| Profesional | 5,000 | 500 |
| Enterprise | 20,000 | 2,000 |

### 7.2 Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642251600
```

### 7.3 Error Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Límite de requests excedido",
    "details": {
      "retry_after": 3600
    }
  }
}
```

## 8. Seguridad

### 8.1 Autenticación

- JWT tokens con expiración
- Refresh tokens para renovación
- Logout para invalidar tokens

### 8.2 Autorización

- Validación de permisos por rol
- Validación de acceso a tenant
- Validación de propiedad de recursos

### 8.3 HTTPS

- Obligatorio en producción
- TLS 1.2 o superior
- Certificados válidos

### 8.4 Validación de Input

- Sanitización de inputs
- Validación de tipos
- Protección contra SQL injection
- Protección contra XSS

## 9. Documentación Interactiva

### 9.1 Swagger/OpenAPI

Disponible en: `https://api.condominios.app/docs`

### 9.2 Postman Collection

Colección pública: [Link a Postman]

### 9.3 Sandbox

Ambiente de pruebas: `https://sandbox-api.condominios.app/v1`

## 10. Soporte

### 10.1 Contacto

- Email: api-support@condominios.app
- Discord: [Link]
- GitHub: [Link a Issues]

### 10.2 SLA

- Uptime: 99.9%
- Response Time: < 200ms (p95)
- Support Response: < 24h

### 10.3 Changelog

Versión actual: v1.0.0
- [Link a CHANGELOG.md]
