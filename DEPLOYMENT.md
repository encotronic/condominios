# Guía de Despliegue - Plataforma Multi-Condominio

## 1. Visión General

Esta guía cubre los diferentes escenarios de despliegue para la plataforma SaaS multi-condominio, desde desarrollo local hasta producción en la nube.

## 2. Requisitos del Sistema

### 2.1 Requisitos Mínimos (Producción Pequeña)

```yaml
Backend:
  CPU: 2 cores
  RAM: 4 GB
  Storage: 50 GB SSD

Database (PostgreSQL):
  CPU: 2 cores
  RAM: 4 GB
  Storage: 100 GB SSD

Redis:
  CPU: 1 core
  RAM: 2 GB
  Storage: 10 GB SSD

Total: 5 cores, 10 GB RAM, 160 GB Storage
```

### 2.2 Requisitos Recomendados (Producción Media)

```yaml
Backend (2 instancias):
  CPU: 4 cores cada una
  RAM: 8 GB cada una
  Storage: 50 GB SSD cada una

Database (PostgreSQL):
  CPU: 4 cores
  RAM: 16 GB
  Storage: 500 GB SSD

Redis:
  CPU: 2 cores
  RAM: 4 GB
  Storage: 20 GB SSD

Load Balancer:
  CPU: 2 cores
  RAM: 2 GB

Total: 18 cores, 46 GB RAM, 670 GB Storage
```

## 3. Opciones de Despliegue

## 3.1 Opción 1: Docker Compose (Desarrollo/Staging)

### Estructura

```
deployment/
├── docker-compose.yml
├── docker-compose.prod.yml
├── nginx/
│   └── nginx.conf
├── postgres/
│   └── init.sql
└── .env.production
```

### docker-compose.prod.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: condominios-db
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: condominios-redis
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: condominios/backend:latest
    container_name: condominios-backend
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: condominios/frontend:latest
    container_name: condominios-frontend
    restart: always
    environment:
      VITE_API_URL: ${API_URL}
    ports:
      - "80:80"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    container_name: condominios-nginx
    restart: always
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
      - frontend

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    name: condominios-network
```

### nginx.conf

```nginx
upstream backend {
    server backend:3000;
}

upstream frontend {
    server frontend:80;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name condominios.app www.condominios.app;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name condominios.app www.condominios.app;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### Comandos de Despliegue

```bash
# Build de imágenes
docker-compose -f docker-compose.prod.yml build

# Iniciar servicios
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Detener servicios
docker-compose -f docker-compose.prod.yml down

# Actualizar servicios
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

## 3.2 Opción 2: Kubernetes

### Estructura de Archivos

```
k8s/
├── namespace.yaml
├── configmap.yaml
├── secrets.yaml
├── postgres/
│   ├── statefulset.yaml
│   ├── service.yaml
│   └── pvc.yaml
├── redis/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── pvc.yaml
├── backend/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── hpa.yaml
├── frontend/
│   ├── deployment.yaml
│   └── service.yaml
├── ingress.yaml
└── monitoring/
    ├── prometheus.yaml
    └── grafana.yaml
```

### namespace.yaml

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: condominios
```

### secrets.yaml

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: condominios-secrets
  namespace: condominios
type: Opaque
stringData:
  POSTGRES_PASSWORD: "your-secure-password"
  REDIS_PASSWORD: "your-redis-password"
  JWT_SECRET: "your-jwt-secret"
  SMTP_PASSWORD: "your-smtp-password"
```

### backend/deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: condominios-backend
  namespace: condominios
spec:
  replicas: 3
  selector:
    matchLabels:
      app: condominios-backend
  template:
    metadata:
      labels:
        app: condominios-backend
    spec:
      containers:
      - name: backend
        image: condominios/backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: condominios-secrets
              key: DATABASE_URL
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: condominios-secrets
              key: REDIS_URL
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: condominios-secrets
              key: JWT_SECRET
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### backend/hpa.yaml

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: condominios-backend-hpa
  namespace: condominios
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: condominios-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### ingress.yaml

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: condominios-ingress
  namespace: condominios
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - condominios.app
    - www.condominios.app
    secretName: condominios-tls
  rules:
  - host: condominios.app
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: condominios-backend
            port:
              number: 3000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: condominios-frontend
            port:
              number: 80
```

### Comandos de Despliegue

```bash
# Crear namespace y secrets
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml

# Desplegar base de datos
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/redis/

# Desplegar aplicación
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/ingress.yaml

# Verificar estado
kubectl get pods -n condominios
kubectl get services -n condominios
kubectl get ingress -n condominios

# Ver logs
kubectl logs -f deployment/condominios-backend -n condominios

# Escalar manualmente
kubectl scale deployment/condominios-backend --replicas=5 -n condominios

# Rolling update
kubectl set image deployment/condominios-backend backend=condominios/backend:v2 -n condominios
kubectl rollout status deployment/condominios-backend -n condominios

# Rollback
kubectl rollout undo deployment/condominios-backend -n condominios
```

## 3.3 Opción 3: Cloud Providers

### AWS (Elastic Beanstalk + RDS)

#### Estructura

```
.ebextensions/
├── 01_packages.config
├── 02_environment.config
└── 03_https.config

Dockerrun.aws.json
```

#### Dockerrun.aws.json

```json
{
  "AWSEBDockerrunVersion": 2,
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "condominios/backend:latest",
      "essential": true,
      "memory": 512,
      "portMappings": [
        {
          "hostPort": 80,
          "containerPort": 3000
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ]
    }
  ]
}
```

#### Comandos

```bash
# Inicializar EB
eb init -p docker condominios --region us-east-1

# Crear ambiente
eb create production --database.engine postgres --database.size 100

# Configurar variables
eb setenv DATABASE_URL=postgres://... REDIS_URL=redis://...

# Desplegar
eb deploy

# Ver logs
eb logs

# SSH al servidor
eb ssh
```

### Google Cloud Platform (Cloud Run + Cloud SQL)

#### cloudbuild.yaml

```yaml
steps:
  # Build backend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/condominios-backend:$SHORT_SHA', './backend']
  
  # Push image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/condominios-backend:$SHORT_SHA']
  
  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'condominios-backend'
      - '--image'
      - 'gcr.io/$PROJECT_ID/condominios-backend:$SHORT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--set-env-vars'
      - 'NODE_ENV=production'
      - '--add-cloudsql-instances'
      - '$PROJECT_ID:us-central1:condominios-db'

images:
  - 'gcr.io/$PROJECT_ID/condominios-backend:$SHORT_SHA'
```

#### Comandos

```bash
# Crear base de datos
gcloud sql instances create condominios-db \
  --database-version=POSTGRES_15 \
  --tier=db-g1-small \
  --region=us-central1

# Crear base de datos
gcloud sql databases create condominios \
  --instance=condominios-db

# Build y deploy
gcloud builds submit --config cloudbuild.yaml

# Ver logs
gcloud run logs read --service condominios-backend
```

### Azure (App Service + Azure Database)

#### azure-pipelines.yml

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  dockerRegistryServiceConnection: 'condominios-acr'
  imageRepository: 'condominios-backend'
  containerRegistry: 'condominiosregistry.azurecr.io'
  dockerfilePath: '$(Build.SourcesDirectory)/backend/Dockerfile'
  tag: '$(Build.BuildId)'

stages:
- stage: Build
  displayName: Build and push
  jobs:
  - job: Build
    steps:
    - task: Docker@2
      displayName: Build and push image
      inputs:
        command: buildAndPush
        repository: $(imageRepository)
        dockerfile: $(dockerfilePath)
        containerRegistry: $(dockerRegistryServiceConnection)
        tags: |
          $(tag)
          latest

- stage: Deploy
  displayName: Deploy to Azure
  dependsOn: Build
  jobs:
  - deployment: Deploy
    environment: 'production'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureWebAppContainer@1
            inputs:
              azureSubscription: 'Azure-Subscription'
              appName: 'condominios-app'
              containers: '$(containerRegistry)/$(imageRepository):$(tag)'
```

## 4. Migraciones de Base de Datos

### 4.1 Estrategia

```bash
# Pre-deployment
# 1. Backup de base de datos
pg_dump -h localhost -U user -d condominios > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Ejecutar migraciones en transacción
npm run migrate:up

# 3. Verificar migraciones
npm run migrate:status

# Post-deployment
# 4. Verificar integridad de datos
npm run db:verify

# Si hay problemas, rollback
npm run migrate:down
psql -h localhost -U user -d condominios < backup_YYYYMMDD_HHMMSS.sql
```

### 4.2 Script de Migración Seguro

```bash
#!/bin/bash
# migrate.sh

set -e

echo "🔍 Checking database connection..."
npm run db:check

echo "📦 Creating backup..."
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
pg_dump $DATABASE_URL > backups/$BACKUP_FILE
echo "✅ Backup created: $BACKUP_FILE"

echo "🚀 Running migrations..."
npm run migrate:up

echo "✅ Migrations completed"

echo "🔍 Verifying data integrity..."
npm run db:verify

echo "✅ Deployment successful!"
```

## 5. Monitoring y Logging

### 5.1 Prometheus + Grafana

#### prometheus.yml

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'condominios-backend'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### 5.2 Alerting

#### alertmanager.yml

```yaml
route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'team-email'

receivers:
- name: 'team-email'
  email_configs:
  - to: 'alerts@condominios.app'
    from: 'alertmanager@condominios.app'
    smarthost: 'smtp.gmail.com:587'
    auth_username: 'alerts@condominios.app'
    auth_password: 'password'

- name: 'slack'
  slack_configs:
  - api_url: 'https://hooks.slack.com/services/XXX'
    channel: '#alerts'
```

### 5.3 Alerts Comunes

```yaml
groups:
- name: condominios
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"

  - alert: DatabaseDown
    expr: up{job="postgres"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "PostgreSQL is down"

  - alert: HighMemoryUsage
    expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Memory usage is above 90%"

  - alert: DiskSpaceLow
    expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Less than 10% disk space available"
```

## 6. Backup y Disaster Recovery

### 6.1 Backup Automático

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# PostgreSQL backup
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Redis backup
redis-cli --rdb $BACKUP_DIR/redis_$DATE.rdb

# Uploads/files backup
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/uploads

# Upload to S3
aws s3 sync $BACKUP_DIR s3://condominios-backups/$(date +%Y/%m/%d)/

# Clean old backups
find $BACKUP_DIR -type f -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
```

### 6.2 Cron Job

```bash
# Ejecutar backup diario a las 2 AM
0 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
```

### 6.3 Recovery

```bash
#!/bin/bash
# restore.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./restore.sh <backup_file>"
    exit 1
fi

echo "⚠️  This will overwrite the current database!"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted"
    exit 0
fi

echo "🔄 Restoring database..."
gunzip -c $BACKUP_FILE | psql $DATABASE_URL

echo "✅ Database restored"
```

## 7. Seguridad en Producción

### 7.1 Checklist

```
- [ ] Variables de entorno en secrets, no en código
- [ ] HTTPS habilitado con certificado válido
- [ ] Firewall configurado (solo puertos necesarios)
- [ ] Rate limiting habilitado
- [ ] CORS configurado correctamente
- [ ] SQL injection protection (usar ORM)
- [ ] XSS protection habilitado
- [ ] CSRF tokens implementados
- [ ] Passwords hasheados con bcrypt
- [ ] JWT con expiración apropiada
- [ ] Logs sin información sensible
- [ ] Backups encriptados
- [ ] Acceso SSH con llaves, no passwords
- [ ] 2FA para accesos administrativos
- [ ] Actualizaciones de seguridad aplicadas
- [ ] Penetration testing realizado
- [ ] GDPR/Privacy compliance verificado
```

### 7.2 Security Headers

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
```

## 8. Performance Optimization

### 8.1 Database Optimization

```sql
-- Índices para queries frecuentes
CREATE INDEX CONCURRENTLY idx_cuotas_busqueda 
ON cuotas(condominio_id, unidad_id, estado, periodo_ano, periodo_mes);

-- Connection pooling
-- max connections: 100
-- pool size per instance: 20

-- Query optimization
EXPLAIN ANALYZE
SELECT * FROM cuotas 
WHERE condominio_id = 'uuid' 
AND estado = 'pendiente';
```

### 8.2 CDN Configuration

```javascript
// CloudFront or similar
const cdnConfig = {
  origin: 'condominios.app',
  behaviors: {
    '/static/*': {
      ttl: 31536000, // 1 año
      compress: true
    },
    '/api/*': {
      ttl: 0, // No cache
      allowedMethods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE']
    }
  }
};
```

## 9. Troubleshooting

### 9.1 Problemas Comunes

```bash
# Backend no inicia
docker logs condominios-backend
# Verificar DATABASE_URL, REDIS_URL

# Database connection timeout
# Aumentar pool size o max connections

# Alto uso de memoria
# Verificar memory leaks
# Revisar cache size de Redis
# Analizar queries lentos

# API lenta
# Revisar índices de BD
# Analizar logs de performance
# Verificar N+1 queries
```

### 9.2 Health Checks

```typescript
// /health endpoint
app.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    checks: {
      database: 'unknown',
      redis: 'unknown'
    }
  };

  try {
    await db.raw('SELECT 1');
    health.checks.database = 'OK';
  } catch (error) {
    health.checks.database = 'ERROR';
    health.status = 'ERROR';
  }

  try {
    await redis.ping();
    health.checks.redis = 'OK';
  } catch (error) {
    health.checks.redis = 'ERROR';
    health.status = 'ERROR';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

## 10. Rollback Procedure

```bash
#!/bin/bash
# rollback.sh

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Usage: ./rollback.sh <version>"
    exit 1
fi

echo "🔄 Rolling back to version $VERSION..."

# Kubernetes
kubectl rollout undo deployment/condominios-backend -n condominios --to-revision=$VERSION

# Docker Compose
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --force-recreate

echo "✅ Rollback completed"
echo "🔍 Verifying health..."
curl -f https://condominios.app/health || echo "❌ Health check failed"
```

## 11. Mantenimiento

### 11.1 Actualizaciones

```bash
# Actualizaciones de seguridad (semanal)
apt update && apt upgrade -y

# Actualizar dependencias (mensual)
npm outdated
npm update

# Limpieza de logs (semanal)
find /var/log -name "*.log" -mtime +30 -delete

# Vacuum database (mensual)
psql $DATABASE_URL -c "VACUUM ANALYZE;"
```

### 11.2 Monitoring de Costos

```yaml
# CloudWatch Alarms para AWS
Alarms:
  - Metric: EstimatedCharges
    Threshold: 1000
    Period: 1 day
    Action: SNS notification

  - Metric: DBConnections
    Threshold: 80
    Period: 5 minutes
    Action: Scale up RDS

  - Metric: CPUUtilization
    Threshold: 80
    Period: 5 minutes
    Action: Scale up EC2
```

## 12. Documentación de Incidentes

### Plantilla de Post-Mortem

```markdown
# Incident Post-Mortem

## Resumen
- Fecha: YYYY-MM-DD
- Duración: X horas
- Severidad: Crítico/Alto/Medio/Bajo
- Servicios afectados: [Lista]

## Impacto
- Usuarios afectados: X
- Tiempo de inactividad: X minutos
- Pérdida de datos: Sí/No

## Línea de Tiempo
- HH:MM - Incidente detectado
- HH:MM - Equipo notificado
- HH:MM - Causa raíz identificada
- HH:MM - Solución implementada
- HH:MM - Servicio restaurado

## Causa Raíz
[Descripción detallada]

## Resolución
[Pasos tomados para resolver]

## Acciones Preventivas
- [ ] Acción 1
- [ ] Acción 2

## Lessons Learned
[Lo que aprendimos]
```

## 13. Contactos de Emergencia

```yaml
Emergencias:
  - On-call Engineer: +1-XXX-XXX-XXXX
  - DevOps Lead: +1-XXX-XXX-XXXX
  - CTO: +1-XXX-XXX-XXXX

Proveedores:
  - AWS Support: Case portal
  - Database DBA: support@db.com
  - CDN Provider: support@cdn.com
```
