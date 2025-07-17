// Este DTO define la estructura para guardar un evento fallido
export class FailedEventDto {
  originalQueue: string;               // Nombre de la cola original
  routingKey: string;                  // Routing key usada para el mensaje
  payload: Record<string, any>;       // Cuerpo original del mensaje
  error: string;                       // Descripción del error o causa de fallo
}
