# PRD: Sistema de Gestión Estética Integral (Cloud-Native)

**Product Requirements Document** que integra la lógica de negocio multiespecialidad con una arquitectura de despliegue moderna basada en **Podman** y **Kubernetes (Kube YAML)**.

---

## 1. Visión y Alcance

Desarrollar una aplicación robusta para la gestión de servicios de estética (Peluquería, Makeup, Uñas, Masajes) que utilice orquestación de contenedores para garantizar la paridad entre los entornos de desarrollo local y producción.

### Objetivos del Proyecto
- Gestionar clientes, servicios, profesionales y recursos físicos
- Administrar turnos con reserva atómica multi-lock
- Proporcionar interfaz web profesional con modo light/dark
- Garantizar portabilidad entre desarrollo y producción mediante contenedores

---

## 2. Arquitectura de Datos (ERD)

La base de datos debe manejar la intersección de **Tiempo, Profesional y Recurso Físico**.

### Definición de Tablas (PostgreSQL)

| Tabla | Descripción |
| :--- | :--- |
| **clients** | Clientes del salón (nombre, email, teléfono, notas, timestamps) |
| **services** | Catálogo de servicios: categoría, duración, precio, required_resource_type |
| **resources** | Inventario de activos físicos (sillas, camillas, cabinas, estaciones) |
| **professionals** | Empleados del salón (nombre, especialidad, estado activo) |
| **appointments** | Turnos: relación M:N entre cliente, profesional, recurso y servicio |
| **before_after_photos** | Fotos antes/después de tratamientos |
| **inventory_logs** | Descuento automático de insumos (gr/ml) por servicio finalizado |

### Modelo de Datos

```
clients (1) ──────< (N) appointments (N) >──────< (1) services
                 │
                 │                    (N) >──────< (1) resources
                 │
                 └────────────────────< (1) professionals
```

### Enumeraciones
- **ResourceType**: chair, bed, cabin, station
- **ServiceCategory**: haircut, color, makeup, nails, massage, other
- **AppointmentStatus**: pending, confirmed, in_progress, completed, cancelled, no_show

---

## 3. Especificaciones de Despliegue (Podman & Kube)

### 3.1. Entorno de Desarrollo (Local)
Stack completo con `podman-compose`:
- **Frontend**: React (Vite) - Puerto 3000
- **Backend**: FastAPI - Puerto 8000
- **DB**: PostgreSQL 16 - Puerto 5432 (Volumen persistente)
- **Cache**: Redis - Puerto 6379

### 3.2. Entorno de Producción (Podman Kube)
Manifiestos Kubernetes ejecutables con `podman kube play`:
- PersistentVolumeClaim para datos persistentes
- ConfigMap para configuración
- Deployments con health checks
- Services para exposición de servicios

---

## 4. Requerimientos Funcionales

### 4.1. Algoritmo de Disponibilidad "Multi-Lock"
El sistema debe realizar una reserva atómica que bloquee tres ejes:
1. **Staff**: Disponibilidad del profesional
2. **Espacio**: Disponibilidad del recurso físico (no hay masaje si la cabina está ocupada)
3. **Tiempo**: Bloques con gap de limpieza configurable (15 min por defecto)

### 4.2. Módulo de Historial y Multimedia
- Almacenamiento de fotos "Antes/Después"
- Notas de colorimetría (fórmulas químicas)

### 4.3. Gestión de Inventario
- Descuento automático de insumos por servicio completado
- Registro de consumo por turno

---

## 5. Especificaciones Técnicas y Stack

| Componente | Tecnología | Rol |
| :--- | :--- | :--- |
| **Runtime** | Podman | Ejecución de contenedores rootless |
| **Orquestador** | Kube YAML | Definición de Pods y Services |
| **API Framework** | FastAPI | Manejo asíncrono de peticiones |
| **Frontend** | React + Tailwind + Vite | Dashboard administrativo |
| **Base de Datos** | PostgreSQL 16 | Almacenamiento persistente |
| **In-Memory** | Redis | Cache y broker de mensajes |

### Estructura del Proyecto
```
salon/
├── backend/           # FastAPI
│   ├── app/
│   │   ├── core/      # Configuración y DB
│   │   ├── models/    # Modelos SQLAlchemy
│   │   ├── schemas/   # Schemas Pydantic
│   │   ├── routers/   # Endpoints API
│   │   ├── services/  # Lógica de negocio
│   │   └── main.py    # Punto de entrada
│   ├── requirements.txt
│   ├── Containerfile
│   └── Containerfile.prod
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/  # Theme context
│   │   ├── hooks/     # API hooks
│   │   └── pages/     # Páginas
│   ├── package.json
│   ├── tailwind.config.js
│   ├── Containerfile
│   └── Containerfile.prod
├── infra/             # Infraestructura
│   ├── podman-compose.yml
│   └── salon-kube.yml
└── docs/              # Documentación
    └── PRD.md
```

---

## 6. API Endpoints

### Clientes
- `POST /api/v1/clients` - Crear cliente
- `GET /api/v1/clients` - Listar clientes
- `GET /api/v1/clients/{id}` - Obtener cliente
- `PUT /api/v1/clients/{id}` - Actualizar cliente
- `DELETE /api/v1/clients/{id}` - Eliminar cliente

### Servicios
- `POST /api/v1/services` - Crear servicio
- `GET /api/v1/services` - Listar servicios
- `GET /api/v1/services/{id}` - Obtener servicio
- `PUT /api/v1/services/{id}` - Actualizar servicio
- `DELETE /api/v1/services/{id}` - Desactivar servicio

### Recursos
- `POST /api/v1/resources` - Crear recurso
- `GET /api/v1/resources` - Listar recursos
- `PUT /api/v1/resources/{id}` - Actualizar recurso

### Profesionales
- `POST /api/v1/professionals` - Crear profesional
- `GET /api/v1/professionals` - Listar profesionales
- `PUT /api/v1/professionals/{id}` - Actualizar profesional

### Turnos
- `POST /api/v1/appointments` - Crear turno (con validación multi-lock)
- `GET /api/v1/appointments` - Listar turnos
- `GET /api/v1/appointments/{id}` - Obtener turno con detalles
- `PUT /api/v1/appointments/{id}` - Actualizar turno
- `DELETE /api/v1/appointments/{id}` - Cancelar turno
- `POST /api/v1/appointments/{id}/complete` - Completar turno

### Disponibilidad
- `GET /api/v1/availability` - Verificar disponibilidad simple
- `GET /api/v1/availability/multi-lock` - Verificar disponibilidad multi-lock

---

## 7. Configuración de Producción

### Variables de Entorno
```env
DATABASE_URL=postgresql://salon:salon123@salon-db:5432/salon_db
REDIS_URL=redis://salon-redis:6379/0
DEBUG=False
SECRET_KEY=your-secret-key
```

### Recursos (Production)
- **Backend**: 256Mi-512Mi memory, 250m-500m CPU
- **Frontend**: 128Mi-256Mi memory, 100m-250m CPU
- **DB**: 5Gi PersistentVolume

---

## 8. Roadmap de Implementación

1. **Sprint 1**: Definición de imágenes base y Containerfiles multi-stage
2. **Sprint 2**: Configuración de podman-compose para desarrollo con hot-reload
3. **Sprint 3**: Generación de Manifiestos Kube para producción
4. **Sprint 4**: Implementación de CI/CD (opcional)

---

## 9. Ejecución del Proyecto

### Desarrollo
```bash
cd salon/infra
podman-compose up
```

### Producción
```bash
# Build de imágenes
podman build -t localhost/salon-backend:latest -f ../backend/Containerfile.prod ../backend
podman build -t localhost/salon-frontend:latest -f ../frontend/Containerfile.prod ../frontend

# Despliegue con Kube
podman kube play salon-kube.yml
```