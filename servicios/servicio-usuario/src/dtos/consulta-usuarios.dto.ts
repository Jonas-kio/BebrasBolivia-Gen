/**
 * Parámetros de consulta para listar usuarios (REQ-010)
 * Se reciben vía query string en GET /api/v1/usuarios
 */
export interface ConsultaUsuariosQuery {
  page?: number;        // página actual (default: 1)
  limit?: number;       // items por página (default: 10)
  rol?: string;         // filtrar por rol (administrador, coordinador, profesor, estudiante)
  estaActivo?: boolean; // filtrar por estado activo/inactivo
  search?: string;      // búsqueda en nombres, apellidos o correo
  orderBy?: string;     // campo para ordenar (default: creado_en)
  orderDir?: 'asc' | 'desc'; // dirección de ordenamiento (default: desc)
}

/**
 * Estructura de la paginación en la respuesta
 */
export interface PaginacionResponse {
  page: number;         // página actual
  limit: number;        // items por página
  total: number;        // total de items
  totalPages: number;   // total de páginas
}

/**
 * Usuario público (lo que se envía al frontend)
 * No incluye campos sensibles como contrasena_hash
 */
export interface UsuarioPublico {
  id: string;
  correo: string;
  nombres: string;
  apellidos: string;
  rol: string;
  nombreUsuario: string | null;
  telefono: string | null;
  estaActivo: boolean;
  estaVerificado: boolean;
  creadoEn: Date;
}