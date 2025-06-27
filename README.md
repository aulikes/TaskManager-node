# 📝 Gestor de Tareas – Backend API (NestJS + Clean/Hexagonal Architecture)

Este proyecto es una API REST desarrollada con [NestJS](https://nestjs.com/) y TypeScript, siguiendo principios de **arquitectura hexagonal** y **limpia**. Está diseñado como una base educativa y profesional para construir microservicios desacoplados, mantenibles y altamente escalables.

---

## 🚀 Características

- Crear, listar, completar y eliminar tareas
- Separación en capas: dominio, aplicación, infraestructura, interfaces
- Validación automática con decoradores
- Documentación automática con Swagger
- Preparado para pruebas unitarias, inyección de dependencias y separación de responsabilidades

---

## 📌 Alcance funcional (Versión Inicial)

### Rutas

| Método | Endpoint                       | Descripción                        |
|--------|--------------------------------|------------------------------------|
| GET    | `/tareas`                      | Listar todas las tareas            |
| POST   | `/tareas`                      | Crear una nueva tarea              |
| PATCH  | `/tareas/:id/completar`        | Marcar tarea como completada       |
| DELETE | `/tareas/:id`                  | Eliminar una tarea                 |

### Modelo de datos

```ts
{
  id: number;
  titulo: string;
  descripcion?: string;
  completado: boolean;
  fechaCreacion: Date;
}
```

---

## 🛠️ Stack Tecnológico

| Herramienta         | Uso                                            |
|---------------------|------------------------------------------------|
| **NestJS**          | Framework de desarrollo backend                |
| **TypeScript**      | Lenguaje fuertemente tipado                    |
| **class-validator** | Validación declarativa de DTOs                 |
| **Swagger**         | Documentación automática de la API             |
| **SQLite (opcional)** | Persistencia liviana para desarrollo local     |
| **Jest**            | Framework de testing (incluido por defecto)    |

---

## 🧱 Arquitectura (Hexagonal + Limpia)

La aplicación se estructura en cuatro capas principales:

```
src/
├── domain/                      ← Entidades + puertos (interfaces de repositorios)
│   ├── entities/
│   ├── repositories/
│   └── services/                ← Lógica de dominio (opcional)
│
├── application/                ← Casos de uso (use-cases)
│   └── use-cases/
│
├── infrastructure/             ← Adaptadores: persistencia, integraciones, etc
│   └── persistence/
│       ├── models/
│       ├── repositories/       ← Implementaciones de los puertos
│
├── interfaces/                 ← Entradas al sistema (REST, CLI, etc.)
│   └── rest/
│       ├── controllers/
│       └── dtos/
│
├── config/                     ← Configuración global, providers, etc.
├── main.ts
└── app.module.ts
```

### 🎯 Principios

- **Independencia de frameworks**: el dominio no depende de NestJS.
- **Inversión de dependencias**: los casos de uso usan interfaces, no implementaciones.
- **Facilidad de testeo**: cada capa puede testearse de forma aislada.
- **Escalabilidad**: preparado para crecer hacia múltiples módulos y microservicios.

---

## 📦 Instalación y ejecución

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/tareas-api.git
cd tareas-api

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run start:dev
```

Accede a la API en: [http://localhost:3000/tareas](http://localhost:3000/tareas)  
Swagger docs: [http://localhost:3000/api](http://localhost:3000/api)

---

## 🧠 Aprendizajes clave

- Aplicación de Clean Architecture en Node.js con NestJS
- Modularización por dominio y casos de uso
- Inyección de dependencias y principios SOLID
- Desarrollo profesional y mantenible en Node.js/TypeScript