// Orden específico de propiedades
// Para configurar el orden, añade los IDs de las propiedades en el orden deseado.
// Las propiedades que no estén en esta lista aparecerán al final, ordenadas alfabéticamente.
// Ejemplo: Si tienes las propiedades "Casa 1" (id: abc123), "Piso 2" (id: def456), etc.
// y quieres que "Piso 2" aparezca primero, seguido de "Casa 1", configúralo así:
export const PROPERTY_ORDER = [
  'LL1bbn5RyJ65VxYmjCWg', // Bajo Izquierda
  'GA1ID00vagPomkLOBCeJ', // Bajo Derecha
  'W36XZxER87OKp2zt8tjX', // Entreplanta
  '7QQX0LL6Zh3Vpk2YPf2T', // Primero Derecha
  'ktbRCAjBjxP1o3nmxC7M', // Primero Centro
  'NDWMWCX0G1JKHNjooO9Q', // Primero Izquierda
  'PjqJMhwrJq5lfTTrBc1Y', // Cristo de la Yedra
  'AJvEealm8ou56YO4Xr0J', // Castro Cortés
];

// Función para ordenar propiedades según el orden específico
export const sortProperties = (properties) => {
  const orderMap = new Map(PROPERTY_ORDER.map((id, index) => [id, index]));

  return properties.sort((a, b) => {
    const orderA = orderMap.has(a.id) ? orderMap.get(a.id) : Number.MAX_SAFE_INTEGER;
    const orderB = orderMap.has(b.id) ? orderMap.get(b.id) : Number.MAX_SAFE_INTEGER;

    if (orderA === orderB) {
      // Si ninguna está en el orden específico o tienen la misma posición,
      // ordenar alfabéticamente por nombre
      return a.nombre.localeCompare(b.nombre);
    }

    return orderA - orderB;
  });
};
