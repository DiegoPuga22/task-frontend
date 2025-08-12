export interface Task {
  id?: number;
  name: string;
  description: string;
  created_at: string | Date;
  dead_line: string | Date;
  status: string;
  is_alive: boolean;
  created_by: string;
}

export interface RespuestaTareasLista {
  statusCode: number;
  intData?: {
    message: string;
    data: Task[]; // Arreglo de tareas para listar
  };
}

export interface RespuestaTareasDetalle {
  statusCode: number;
  intData?: {
    message: string;
    data: Task; // Una sola tarea para detalle
  };
}