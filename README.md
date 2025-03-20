# 🏠 RentHub

## Descripción

RentHub es una aplicación web moderna diseñada para simplificar la gestión de propiedades en alquiler. Proporciona una plataforma integral donde propietarios y administradores pueden gestionar eficientemente sus propiedades, inquilinos, contratos, facturas y gastos.

## ✨ Características

### Para Propietarios y Administradores

- 📊 **Dashboard Intuitivo**: Visualización clara de ingresos, gastos y estado de las propiedades
- 🏘️ **Gestión de Propiedades**: Control completo sobre las propiedades en alquiler
- 👥 **Gestión de Inquilinos**: Administración de información y documentación de inquilinos
- 📄 **Contratos**: Creación y seguimiento de contratos de alquiler
- 💰 **Gestión Financiera**:
  - Control de facturas y pagos
  - Seguimiento de gastos (IBI, Comunidad, Seguros, etc.)
  - Balance económico detallado

### Características Técnicas

- 🔐 **Autenticación**: Login seguro con Google
- 🎨 **Tema Personalizable**: Modo claro/oscuro
- 📱 **Diseño Responsive**: Adaptable a todos los dispositivos
- 🔒 **Control de Acceso**: Sistema de roles (Admin, Propietario, Inquilino)

## 🛠️ Tecnologías

- **Frontend**:

  - Vue 3 (Composition API)
  - Vuetify 3
  - Vue Router
  - Tailwind CSS

- **Backend**:

  - Firebase
    - Authentication
    - Firestore
    - Storage
    - Security Rules

- **Despliegue**:
  - Netlify (Frontend)
  - Firebase (Backend)

## 🚀 Instalación

1. Clonar el repositorio:
   \`\`\`bash
   git clone [url-del-repositorio]
   \`\`\`

2. Instalar dependencias:
   \`\`\`bash
   npm install
   \`\`\`

3. Configurar variables de entorno:

   - Crear archivo `.env` basado en `.env.example`
   - Añadir las credenciales de Firebase

4. Iniciar el servidor de desarrollo:
   \`\`\`bash
   npm run dev
   \`\`\`

## 📝 Configuración

### Firebase

1. Crear un proyecto en Firebase
2. Habilitar Authentication con Google
3. Configurar Firestore
4. Configurar Storage
5. Actualizar reglas de seguridad

### Netlify

1. Conectar con el repositorio
2. Configurar variables de entorno
3. Configurar dominio personalizado (opcional)

## 🤝 Contribuir

1. Fork del repositorio
2. Crear una rama para tu feature:
   \`\`\`bash
   git checkout -b feature/AmazingFeature
   \`\`\`
3. Commit de tus cambios:
   \`\`\`bash
   git commit -m 'Add: AmazingFeature'
   \`\`\`
4. Push a la rama:
   \`\`\`bash
   git push origin feature/AmazingFeature
   \`\`\`
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## 👥 Autores

- **Sergio** - _Desarrollo inicial_ - [TuGitHub](https://github.com/tuusuario)

## 🙏 Agradecimientos

- A todos los que han contribuido con feedback y sugerencias
- A la comunidad de Vue y Firebase por su excelente documentación
