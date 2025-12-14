# Guía de Desarrollo - Plataforma Multi-Condominio

## 1. Introducción

Esta guía proporciona las directrices y mejores prácticas para el desarrollo de la plataforma SaaS multi-condominio. Está dirigida a desarrolladores que contribuyen al proyecto.

## 2. Stack Tecnológico Recomendado

### 2.1 Backend

#### Opción 1: Node.js/TypeScript

```json
{
  "runtime": "Node.js 18 LTS",
  "language": "TypeScript 5.x",
  "framework": "Express.js / NestJS",
  "orm": "Prisma / TypeORM",
  "testing": "Jest + Supertest",
  "linting": "ESLint + Prettier"
}
```

**Ventajas:**
- Ecosistema maduro y amplio
- Gran comunidad
- Excelente para APIs RESTful
- TypeScript proporciona type safety
- Alto rendimiento para I/O

#### Opción 2: Python/FastAPI

```json
{
  "runtime": "Python 3.11+",
  "framework": "FastAPI",
  "orm": "SQLAlchemy / Tortoise ORM",
  "testing": "pytest",
  "linting": "Black + Flake8 + mypy"
}
```

**Ventajas:**
- Documentación automática (OpenAPI)
- Type hints nativos
- Excelente rendimiento
- Ideal para ML/AI futuro
- Validación con Pydantic

### 2.2 Frontend

```json
{
  "framework": "React 18 / Vue 3",
  "language": "TypeScript",
  "build": "Vite",
  "ui_library": "Material-UI / Ant Design / Tailwind CSS",
  "state": "Redux Toolkit / Zustand / Pinia",
  "testing": "Vitest + React Testing Library",
  "e2e": "Playwright / Cypress"
}
```

### 2.3 Base de Datos

**Principal:** PostgreSQL 15+

```
Características utilizadas:
- JSONB para configuraciones
- Row-Level Security (RLS)
- Full-text search
- Partitioning para tablas grandes
- Índices GIN para JSONB
```

**Caché:** Redis 7+

```
Uso:
- Sesiones de usuario
- Caché de configuraciones
- Rate limiting
- Queue de jobs
```

### 2.4 Infraestructura

```yaml
Containerización: Docker + Docker Compose
Orquestación: Kubernetes
CI/CD: GitHub Actions / GitLab CI
Monitoreo: Prometheus + Grafana
Logging: ELK Stack / Loki
Tracing: Jaeger
```

## 3. Configuración del Entorno de Desarrollo

### 3.1 Requisitos Previos

```bash
# Node.js
node --version  # v18.x o superior
npm --version   # v9.x o superior

# Python (si se usa)
python --version  # 3.11 o superior

# Docker
docker --version
docker-compose --version

# Git
git --version
```

### 3.2 Clonar el Repositorio

```bash
git clone https://github.com/encotronic/condominios.git
cd condominios
```

### 3.3 Variables de Entorno

Crear archivo `.env`:

```bash
# Base de Datos
DATABASE_URL=postgresql://user:password@localhost:5432/condominios
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRATION=3600
REFRESH_TOKEN_EXPIRATION=604800

# API
API_PORT=3000
API_BASE_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:5173

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password

# Storage
STORAGE_TYPE=local # local, s3, gcs
AWS_S3_BUCKET=condominios-files
AWS_REGION=us-east-1

# Entorno
NODE_ENV=development
LOG_LEVEL=debug
```

### 3.4 Instalación con Docker Compose

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: condominios
      POSTGRES_USER: condominios
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://condominios:password@postgres:5432/condominios
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3000
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
  redis_data:
```

Iniciar servicios:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

## 4. Estructura del Proyecto

```
condominios/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   └── auth.test.ts
│   │   │   ├── condominios/
│   │   │   ├── unidades/
│   │   │   ├── financiero/
│   │   │   ├── operativo/
│   │   │   ├── comunicacion/
│   │   │   └── reservas/
│   │   ├── common/
│   │   │   ├── middleware/
│   │   │   ├── filters/
│   │   │   ├── interceptors/
│   │   │   ├── decorators/
│   │   │   └── utils/
│   │   ├── config/
│   │   │   ├── database.config.ts
│   │   │   ├── redis.config.ts
│   │   │   └── app.config.ts
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   ├── seeds/
│   │   │   └── schema.prisma
│   │   └── main.ts
│   ├── tests/
│   │   ├── integration/
│   │   └── e2e/
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── dashboard/
│   │   │   ├── financiero/
│   │   │   ├── operativo/
│   │   │   └── comunicacion/
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api/
│   │   ├── store/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── docs/
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── API_SPECIFICATION.md
│   └── DEVELOPMENT_GUIDE.md
│
├── infrastructure/
│   ├── kubernetes/
│   ├── terraform/
│   └── scripts/
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── cd.yml
│       └── tests.yml
│
├── docker-compose.yml
├── docker-compose.dev.yml
├── .gitignore
└── README.md
```

## 5. Convenciones de Código

### 5.1 Naming Conventions

#### Backend (TypeScript)

```typescript
// Clases: PascalCase
class CondominioService {}
class UserController {}

// Interfaces: PascalCase con prefijo I (opcional)
interface IUser {}
interface CreateUserDto {}

// Funciones y variables: camelCase
const getUserById = (id: string) => {}
let userName = 'Juan';

// Constantes: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';

// Archivos: kebab-case
// user.service.ts, condominio.controller.ts
```

#### Frontend (TypeScript/React)

```typescript
// Componentes: PascalCase
function UserProfile() {}
const DashboardCard = () => {}

// Hooks: camelCase con prefijo 'use'
const useAuth = () => {}
const useFetchData = () => {}

// Archivos de componentes: PascalCase
// UserProfile.tsx, DashboardCard.tsx

// Archivos de utilidades: camelCase
// formatDate.ts, validateEmail.ts
```

### 5.2 Organización de Imports

```typescript
// 1. Imports externos
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Imports internos (absolutos)
import { Button } from '@/components/common';
import { useAuth } from '@/hooks';

// 3. Imports relativos
import { formatDate } from '../utils';
import styles from './Component.module.css';

// 4. Imports de tipos
import type { User, Condominio } from '@/types';
```

### 5.3 Comentarios

```typescript
/**
 * Calcula el monto total de una cuota incluyendo adicionales y descuentos
 * 
 * @param montoBase - Monto base de la cuota
 * @param adicionales - Array de montos adicionales
 * @param descuento - Descuento a aplicar (0-1)
 * @returns Monto total calculado
 * 
 * @example
 * calcularMontoTotal(100000, [20000, 10000], 0.05)
 * // Returns: 123500
 */
function calcularMontoTotal(
  montoBase: number,
  adicionales: number[],
  descuento: number
): number {
  const total = montoBase + adicionales.reduce((sum, val) => sum + val, 0);
  return total * (1 - descuento);
}

// TODO: Implementar validación de montos negativos
// FIXME: Descuento no se aplica correctamente para múltiples adicionales
// NOTE: Esta función será reemplazada por un servicio de cálculo
```

## 6. Desarrollo de Features

### 6.1 Flujo de Trabajo Git

```bash
# 1. Crear rama desde main
git checkout main
git pull origin main
git checkout -b feature/nombre-feature

# 2. Desarrollar y commitear
git add .
git commit -m "feat: descripción del cambio"

# 3. Push y crear PR
git push origin feature/nombre-feature
# Crear Pull Request en GitHub

# 4. Después del merge, limpiar
git checkout main
git pull origin main
git branch -d feature/nombre-feature
```

### 6.2 Conventional Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: cambios de formato (no afectan funcionalidad)
refactor: refactorización de código
test: añadir o modificar tests
chore: cambios en build, dependencias, etc.
perf: mejoras de performance
ci: cambios en CI/CD

Ejemplos:
feat(financiero): agregar endpoint para generar cuotas
fix(auth): corregir validación de JWT expirado
docs(api): actualizar especificación de endpoints de reservas
refactor(database): optimizar queries de cuotas pendientes
```

### 6.3 Tests

#### Tests Unitarios

```typescript
// user.service.test.ts
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as any;
    
    userService = new UserService(userRepository);
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById('1');

      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw error when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById('999'))
        .rejects
        .toThrow('User not found');
    });
  });
});
```

#### Tests de Integración

```typescript
// cuotas.integration.test.ts
import request from 'supertest';
import { app } from '../app';
import { db } from '../database';

describe('Cuotas API', () => {
  let authToken: string;
  let condominioId: string;

  beforeAll(async () => {
    await db.migrate.latest();
    // Setup: crear usuario y obtener token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.data.access_token;
    condominioId = loginResponse.body.data.user.condominio.id;
  });

  afterAll(async () => {
    await db.migrate.rollback();
    await db.destroy();
  });

  describe('POST /api/v1/condominios/:id/cuotas/generar', () => {
    it('should generate cuotas for all units', async () => {
      const response = await request(app)
        .post(`/api/v1/condominios/${condominioId}/cuotas/generar`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          periodo_ano: 2024,
          periodo_mes: 1,
          fecha_vencimiento: '2024-01-05'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cuotas_generadas).toBeGreaterThan(0);
    });
  });
});
```

### 6.4 Code Review Checklist

Antes de aprobar un PR, verificar:

- [ ] El código sigue las convenciones establecidas
- [ ] Hay tests para el nuevo código
- [ ] Los tests pasan exitosamente
- [ ] No hay warnings de linter
- [ ] La documentación está actualizada
- [ ] No hay console.log() o código de debug
- [ ] Las variables de entorno están documentadas
- [ ] Los cambios de DB tienen migraciones
- [ ] No hay secretos o credenciales en el código
- [ ] El código es eficiente y escalable
- [ ] Maneja errores apropiadamente
- [ ] Validación de inputs está implementada

## 7. Base de Datos

### 7.1 Migraciones

#### Crear migración

```bash
# Con Prisma
npx prisma migrate dev --name add_subunidades_table

# Con Knex
npx knex migrate:make add_subunidades_table
```

#### Ejemplo de migración

```typescript
// migrations/20240115_add_subunidades.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('subunidades', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('condominio_id').notNullable()
      .references('id').inTable('condominios')
      .onDelete('CASCADE');
    table.string('codigo', 50).notNullable();
    table.string('tipo', 50).notNullable();
    table.decimal('metros_cuadrados', 10, 2);
    table.uuid('unidad_id').references('id').inTable('unidades');
    table.decimal('monto_cuota_adicional', 10, 2);
    table.string('estado', 20).defaultTo('disponible');
    table.timestamps(true, true);
    
    table.unique(['condominio_id', 'codigo']);
    table.index(['condominio_id', 'tipo']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('subunidades');
}
```

### 7.2 Seeds

```typescript
// seeds/dev_data.ts
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpiar tablas
  await knex('subunidades').del();
  await knex('unidades').del();
  await knex('condominios').del();

  // Insertar datos de prueba
  const [condominio] = await knex('condominios')
    .insert({
      nombre: 'Edificio Central',
      direccion: 'Av. Principal 123',
      total_unidades: 10,
      estado: 'activo'
    })
    .returning('*');

  await knex('unidades').insert([
    {
      condominio_id: condominio.id,
      numero: '101',
      piso: 1,
      metros_cuadrados: 50
    },
    {
      condominio_id: condominio.id,
      numero: '102',
      piso: 1,
      metros_cuadrados: 55
    }
  ]);
}
```

## 8. Debugging

### 8.1 VSCode Launch Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/src/main.ts",
      "preLaunchTask": "npm: build",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "program": "${workspaceFolder}/backend/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### 8.2 Logging

```typescript
// logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'condominios-api' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

Uso:

```typescript
import logger from './logger';

logger.info('Cuota generada', { 
  cuotaId: cuota.id, 
  unidadId: unidad.id 
});

logger.error('Error al procesar pago', { 
  error: error.message, 
  stack: error.stack 
});
```

## 9. Deployment

### 9.1 Build para Producción

```bash
# Backend
cd backend
npm run build
npm run test
npm run lint

# Frontend
cd frontend
npm run build
npm run test
```

### 9.2 Docker

```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### 9.3 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run tests
      run: npm run test:ci
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        REDIS_URL: redis://localhost:6379
    
    - name: Build
      run: npm run build
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

## 10. Mejores Prácticas

### 10.1 Seguridad

```typescript
// Sanitización de inputs
import { body, param, validationResult } from 'express-validator';

app.post('/api/v1/users',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).trim(),
  body('nombre').trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Procesar...
  }
);

// Prevención de SQL Injection (usar ORM)
// ❌ MAL - Vulnerable a SQL Injection: un atacante podría pasar email = "' OR '1'='1"
const users = await db.raw(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ BIEN - El ORM escapa automáticamente los valores, previniendo SQL Injection
const users = await db('users').where({ email });

// Rate Limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de requests
  message: 'Demasiadas solicitudes, intenta más tarde'
});

app.use('/api/', limiter);
```

### 10.2 Performance

```typescript
// Paginación eficiente
async function getPaginatedCuotas(
  condominioId: string,
  page: number = 1,
  limit: number = 20
) {
  const offset = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    db('cuotas')
      .where({ condominio_id: condominioId })
      .limit(limit)
      .offset(offset),
    db('cuotas')
      .where({ condominio_id: condominioId })
      .count('* as count')
      .first()
  ]);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total: total.count,
      pages: Math.ceil(total.count / limit)
    }
  };
}

// Caché con Redis
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

async function getConfiguracion(condominioId: string) {
  const cacheKey = `config:${condominioId}`;
  
  // Intentar desde caché
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Si no está en caché, obtener de DB
  const config = await db('configuracion_condominio')
    .where({ condominio_id: condominioId })
    .first();
  
  // Guardar en caché (expira en 1 hora)
  await redis.setex(cacheKey, 3600, JSON.stringify(config));
  
  return config;
}
```

### 10.3 Error Handling

```typescript
// Middleware de manejo de errores
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.name,
        message: err.message
      }
    });
  }
  
  // Error no esperado
  logger.error('Unexpected error:', err);
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});

// Uso
if (!user) {
  throw new AppError(404, 'User not found');
}
```

## 11. Recursos Adicionales

### 11.1 Documentación

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### 11.2 Tools Recomendadas

- **IDE**: VSCode con extensiones:
  - ESLint
  - Prettier
  - GitLens
  - Thunder Client / REST Client
  - Database Client

- **DB Management**: 
  - pgAdmin
  - DBeaver
  - TablePlus

- **API Testing**:
  - Postman
  - Insomnia
  - Bruno

- **Monitoring**:
  - Sentry (error tracking)
  - Datadog / New Relic (APM)
  - LogRocket (session replay)

## 12. Contacto y Soporte

### 12.1 Canales

- **Slack**: #condominios-dev
- **Email**: dev@condominios.app
- **GitHub**: Issues y Discussions

### 12.2 Horarios

- Reuniones de equipo: Lunes y Jueves 10:00
- Code review: Diario antes de merge
- Sprint planning: Primer lunes de cada sprint

## 13. Licencia y Contribución

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para guías de contribución.
Ver [LICENSE.md](LICENSE.md) para información de licencia.
