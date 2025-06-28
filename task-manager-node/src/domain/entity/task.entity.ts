import { TaskStatus } from '../enum/task-status.enum';

/**
 * Entidad de dominio que representa una Tarea.
 * La creación de instancias se controla desde el método estático `create`.
 */
export class Task {
  private constructor(
    public readonly id: number | undefined,
    public title: string,
    public description: string,
    public status: TaskStatus,
    public readonly createdAt: Date,
  ) {}

  /**
   * Fábrica para crear nuevas tareas desde el dominio.
   * El ID se deja como undefined para que lo genere la base de datos.
   */
  static create(title: string, description: string): Task {
    return new Task(undefined, title, description, TaskStatus.PENDING, new Date());
  }

  /**
   * Método para rehidratar una tarea desde infraestructura (ej. repositorio).
   */
  static rehydrate(id: number, title: string, description: string, status: TaskStatus, createdAt: Date): Task {
    return new Task(id, title, description, status, createdAt);
  }

  start(): void {
    if (this.status !== TaskStatus.PENDING) {
      throw new Error('Task can only be started from pending state');
    }
    this.status = TaskStatus.IN_PROGRESS;
  }

  complete(): void {
    if (this.status === TaskStatus.CANCELLED) {
      throw new Error('Cannot complete a cancelled task');
    }
    this.status = TaskStatus.COMPLETED;
  }

  cancel(): void {
    if (this.status === TaskStatus.COMPLETED) {
      throw new Error('Cannot cancel a completed task');
    }
    this.status = TaskStatus.CANCELLED;
  }
}
