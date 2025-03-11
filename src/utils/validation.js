// Validación de datos generales
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validación de propiedades
export const validatePropiedad = (propiedad) => {
  const errors = {};

  if (!propiedad.direccion?.trim()) {
    errors.direccion = 'La dirección es obligatoria';
  }

  if (!propiedad.precio || propiedad.precio <= 0) {
    errors.precio = 'El precio debe ser mayor que 0';
  }

  if (!propiedad.tipo?.trim()) {
    errors.tipo = 'El tipo de propiedad es obligatorio';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validación de pagos
export const validatePago = (pago) => {
  const errors = {};

  if (!pago.monto || pago.monto <= 0) {
    errors.monto = 'El monto debe ser mayor que 0';
  }

  if (!pago.fecha) {
    errors.fecha = 'La fecha es obligatoria';
  }

  if (!pago.concepto?.trim()) {
    errors.concepto = 'El concepto es obligatorio';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Sanitización de datos
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>]/g, '') // Prevenir XSS básico
    .slice(0, 1000); // Limitar longitud
};

// Validación de roles
export const validateRol = (rol) => {
  const rolesValidos = ['admin', 'propietario', 'inquilino', 'pending'];
  return rolesValidos.includes(rol);
};
