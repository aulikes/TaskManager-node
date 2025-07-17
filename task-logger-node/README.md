# 📝 TaskLogger-node – Event Logging Microservice for RabbitMQ Events

**TaskLogger-node** es un microservicio especializado construido con **NestJS**, diseñado para **escuchar eventos del broker RabbitMQ** relacionados con la creación, actualización y eliminación de tareas, y **persistirlos en MongoDB** para trazabilidad y auditoría. Además, gestiona una **cola Dead Letter Queue (DLQ)** para almacenar eventos fallidos y permite monitorear su procesamiento.

> 🎯 Ideal como componente de observabilidad y trazabilidad en arquitecturas orientadas a eventos.

# 📝 ¿Qué hace este proyecto?

1. Escucha eventos `task.created`, `task.updated` y `task.deleted` desde RabbitMQ.
2. Persiste los eventos correctamente procesados en MongoDB.
3. Gestiona y persiste mensajes enviados a la DLQ (Dead Letter Queue).
4. Usa Mongoose para modelar eventos como documentos de MongoDB.
5. Expone un endpoint `/health` para verificar la disponibilidad de RabbitMQ y MongoDB.
6. Aplica validaciones y logs estructurados usando `class-validator` y `winston`.

---

## ⚙️ Tecnologías y Herramientas

| Tecnología        | Rol                                        |
|-------------------|---------------------------------------------|
| **NestJS**        | Framework de backend estructurado           |
| **TypeScript**    | Tipado fuerte y mantenibilidad              |
| **RabbitMQ**      | Broker de mensajería para eventos           |
| **MongoDB**       | Persistencia de eventos                     |
| **Mongoose**      | ODM para MongoDB                            |
| **Winston**       | Sistema de logging estructurado             |
| **amqplib**       | Cliente nativo de RabbitMQ                  |
| **class-validator** | Validación declarativa de DTOs            |

---

##  📁  Estructura del Proyecto 

```bash
src/
├── app.module.ts                  # Módulo principal que importa todos los módulos necesarios del sistema.
├── main.ts                        # Punto de entrada de la aplicación NestJS.
│
├── config/                        # Configuraciones específicas del sistema
│   ├── database.constants.ts      # Constantes relacionadas con las bases de datos utilizadas.
│   └── declare-bindings.ts       # Declaración de exchanges, colas y bindings en RabbitMQ.
│
├── health/                        # Módulo de verificación de salud (health check)
│   ├── health.controller.ts      # Controlador para exponer endpoint de salud (/health).
│   ├── health.module.ts          # Módulo que agrupa los servicios y controladores de salud.
│   ├── health.service.ts         # Servicio principal que ejecuta los chequeos de salud.
│   ├── mongo.health.ts           # Verificador de estado para la conexión con MongoDB.
│   └── rabbitmq.health.ts        # Verificador de estado para la conexión con RabbitMQ.
│
├── logger/                        # Módulo de logging personalizado
│   ├── app.logger.ts             # Implementación del logger usando Winston.
│   └── logger.module.ts          # Módulo que exporta el logger a nivel global.
│
├── util/                          # Funciones utilitarias
│   ├── get-rabbitmq-uri.ts       # Construye la URI de conexión a RabbitMQ desde variables de entorno.
│   └── retry-flexible-util.ts    # Implementa lógica de retry flexible para mayor resiliencia.
│
├── common/                        # Funcionalidades comunes reutilizables
│   ├── failed-event/             
│   │   ├── failed-event.dto.ts    # DTO para eventos fallidos que llegan a la DLQ.
│   │   ├── failed-event.module.ts# Módulo que agrupa la lógica de eventos fallidos.
│   │   ├── failed-event.schema.ts# Esquema de persistencia en MongoDB para eventos fallidos.
│   │   └── failed-event.service.ts# Servicio para guardar eventos fallidos en la base de datos.
│   │
│   └── messaging/                 
│       ├── rabbit-failed-event.listener.ts     # Listener que consume mensajes desde la cola DLQ.
│       ├── rabbit-task-created-event.listener.ts # Listener para eventos task.created.
│       ├── rabbit-task-deleted-event.listener.ts # Listener para eventos task.deleted.
│       ├── rabbit-task-updated-event.listener.ts # Listener para eventos task.updated.
│       ├── rabbitmq-listener.service.ts        # Servicio genérico para conexión y consumo de colas RabbitMQ.
│       └── rabbitmq.module.ts                  # Módulo de mensajería que agrupa listeners y servicios.
│
└── task/                          # Módulo principal que maneja eventos de tareas
    ├── dto/                       # Data Transfer Objects (estructura esperada por cada tipo de evento)
    │   ├── task-created-event.dto.ts   # DTO para eventos de creación de tareas.
    │   ├── task-deleted-event.dto.ts   # DTO para eventos de eliminación de tareas.
    │   └── task-updated-event.dto.ts   # DTO para eventos de actualización de tareas.
    │
    ├── schema/                    # Esquemas de Mongoose para persistencia en MongoDB
    │   ├── task-created-event.schema.ts # Esquema de persistencia para task.created.
    │   ├── task-deleted-event.schema.ts # Esquema de persistencia para task.deleted.
    │   └── task-updated-event.schema.ts # Esquema de persistencia para task.updated.
    │
    ├── service/                   # Servicios que contienen la lógica de guardado en base de datos
    │   ├── task-created.service.ts # Servicio que persiste el evento task.created.
    │   ├── task-deleted.service.ts # Servicio que persiste el evento task.deleted.
    │   └── task-updated.service.ts # Servicio que persiste el evento task.updated.
    │
    └── task.module.ts             # Módulo general del dominio "task", agrupa servicios, DTOs y schemas.
```

---

### 🧱 Arquitectura técnica (Mermaid)

```mermaid
graph TD

  subgraph Messaging_Layer
    MQ1[task.topic.exchange] --> Q1[task.created.queue]
    MQ1 --> Q2[task.updated.queue]
    MQ1 --> Q3[task.deleted.queue]
    DLQ_EXCH[task.dlq.exchange] --> DLQ[task.dlq.queue]
  end

  subgraph Listener_Layer
    Q1 --> L1[rabbit-task-created-event.listener.ts]
    Q2 --> L2[rabbit-task-updated-event.listener.ts]
    Q3 --> L3[rabbit-task-deleted-event.listener.ts]
    DLQ --> DLQ_LIS[rabbit-failed-event.listener.ts]
  end

  subgraph Service_Layer
    L1 --> S1[task-created.service.ts]
    L2 --> S2[task-updated.service.ts]
    L3 --> S3[task-deleted.service.ts]
    DLQ_LIS --> S4[failed-event.service.ts]
  end

  subgraph Persistence_Layer
    S1 --> DB1[task-created-event.schema.ts]
    S2 --> DB2[task-updated-event.schema.ts]
    S3 --> DB3[task-deleted-event.schema.ts]
    S4 --> DB4[failed-event.schema.ts]
  end

  subgraph Health_Check_Layer
    H1[mongo.health.ts]
    H2[rabbitmq.health.ts]
    H3[health.service.ts]
  end
```

---

# Diagrama de Flujo

Este diagrama muestra el flujo completo de eventos dentro del sistema `task-logger-node`, incluyendo el consumo exitoso y el manejo de eventos fallidos con Dead Letter Queue (DLQ).

```mermaid
flowchart TD
    subgraph Broker["RabbitMQ"]
        EXCH["Exchange: task.topic.exchange"]
        QUEUE_CREATED["task.created.queue"]
        QUEUE_UPDATED["task.updated.queue"]
        QUEUE_DELETED["task.deleted.queue"]
        DLQ_EXCH["Exchange: task.dlq.exchange"]
        DLQ["task.dlq.queue"]
    end

    subgraph App["task-logger-node"]
        subgraph Listeners
            L1["rabbit-task-created-event.listener.ts"]
            L2["rabbit-task-updated-event.listener.ts"]
            L3["rabbit-task-deleted-event.listener.ts"]
            DLQ_LISTENER["rabbit-failed-event.listener.ts"]
        end

        subgraph Services
            S1["task-created.service.ts"]
            S2["task-updated.service.ts"]
            S3["task-deleted.service.ts"]
            DLQ_SVC["failed-event.service.ts"]
        end

        subgraph Schemas
            SC1["task-created-event.schema.ts"]
            SC2["task-updated-event.schema.ts"]
            SC3["task-deleted-event.schema.ts"]
            SC_DLQ["failed-event.schema.ts"]
        end

        subgraph Databases
            DB1["MongoDB: task_logger_db"]
            DB2["MongoDB: task_failed_event_db"]
        end
    end

    EXCH -- "task.created" --> QUEUE_CREATED
    EXCH -- "task.updated" --> QUEUE_UPDATED
    EXCH -- "task.deleted" --> QUEUE_DELETED

    QUEUE_CREATED --> L1
    L1 -->|Procesa evento| S1
    S1 -->|Usa esquema| SC1
    SC1 -->|Persistencia| DB1

    QUEUE_UPDATED --> L2
    L2 -->|Procesa evento| S2
    S2 -->|Usa esquema| SC2
    SC2 --> DB1

    QUEUE_DELETED --> L3
    L3 -->|Procesa evento| S3
    S3 -->|Usa esquema| SC3
    SC3 --> DB1

    %% Flujo de errores hacia la DLQ
    L1 -- Error --> DLQ_EXCH
    L2 -- Error --> DLQ_EXCH
    L3 -- Error --> DLQ_EXCH
    DLQ_EXCH --> DLQ

    %% Procesamiento de mensajes fallidos
    DLQ --> DLQ_LISTENER
    DLQ_LISTENER -->|Persiste error| DLQ_SVC
    DLQ_SVC -->|Usa esquema| SC_DLQ
    SC_DLQ --> DB2

    %% Estilo visual de errores (líneas punteadas rojas)
    linkStyle 16,17,18 stroke:red,stroke-width:2px,stroke-dasharray: 5 5
```


---

## 🛠️ Ejecutar en local

### 1. Instalar dependencias

```bash
npm install
```

---

### 2. Configurar variables de entorno

Ejemplo de archivo `.env`:

```env
# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=admin
RABBITMQ_EXCHANGE=task.events
DLQ_EXCHANGE=dlq.events

# Colas
TASK_CREATED_QUEUE=task.created.queue
TASK_UPDATED_QUEUE=task.updated.queue
TASK_DELETED_QUEUE=task.deleted.queue
TASK_DLQ=task.dlq.queue

TASK_CREATED_ROUTING_KEY=task.created
TASK_UPDATED_ROUTING_KEY=task.updated
TASK_DELETED_ROUTING_KEY=task.deleted
TASK_DLQ_ROUTING_KEY=task.dlq

# MongoDB
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=task_logger_db
MONGO_DLQ_DB_NAME=task_failed_event_db

# Otros
PORT=3100
```

---

### 3. Levantar dependencias con Docker

Asegúrate de tener el siguiente entorno mínimo usando Docker:

```yaml
services:
  rabbitmq:
    image: rabbitmq:management
    ports:
      - "5672:5672"
      - "15672:15672"

  mongo:
    image: mongo
    ports:
      - "27017:27017"
```

Ejecutar:

```bash
docker-compose up -d
```

---

### 4. Ejecutar la aplicación

```bash
npm run start:dev
```

---

## 📚 Observaciones

- El proyecto **no expone endpoints REST funcionales**, salvo el de salud: `GET /health`.
- Su propósito es **procesar eventos asincrónicos desde RabbitMQ** y **persistirlos en MongoDB**.
- En caso de error al procesar un mensaje, este se enruta automáticamente a la **DLQ** (Dead Letter Queue), y se guarda en una base de datos separada para análisis.
- El campo `error` en los eventos fallidos contiene el **stack trace completo** del error que provocó el fallo.
