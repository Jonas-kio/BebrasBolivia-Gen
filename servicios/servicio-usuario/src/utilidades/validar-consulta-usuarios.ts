import type { ConsultaUsuariosQuery } from '../dtos/consulta-usuarios.dto';

import { ErrorNegocio } from './errores';

/**
 * Valida y normaliza los parámetros de consulta para listar usuarios.
 * Asegura que la paginación sea consistente y dentro de rangos razonables (REQ-010).
 */
export function validarConsultaUsuarios(query: Record<string, unknown>): ConsultaUsuariosQuery {
  // 1. Validar y normalizar 'page'
  let page = 1;
  if (query.page !== undefined && query.page !== '') {
    page = parseInt(query.page as string, 10);
    if (isNaN(page) || page < 1) {
      throw new ErrorNegocio('El parámetro page debe ser un número entero mayor o igual a 1');
    }
  }

  // 2. Validar y normalizar 'limit'
  let limit = 10;
  if (query.limit !== undefined && query.limit !== '') {
    limit = parseInt(query.limit as string, 10);
    if (isNaN(limit) || limit < 1) {
      throw new ErrorNegocio('El parámetro limit debe ser un número entero positivo');
    }
    
    // Tope máximo para evitar peticiones pesadas (REQ-010)
    if (limit > 50) {
      limit = 50;
    }
  }

  // 3. Validar 'orderDir' si está presente
  const orderDir = query.orderDir as string | undefined;
  if (orderDir && !['asc', 'desc'].includes(orderDir)) {
    throw new ErrorNegocio('El parámetro orderDir debe ser "asc" o "desc"');
  }

  return {
    page,
    limit,
    rol: query.rol as string,
    estaActivo: query.estaActivo === 'true' ? true : query.estaActivo === 'false' ? false : undefined,
    search: query.search as string,
    orderBy: query.orderBy as string,
    orderDir: orderDir as 'asc' | 'desc',
  };
}
