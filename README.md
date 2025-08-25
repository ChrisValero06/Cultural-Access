# Cultural Access - Formulario de Registro

Aplicación web para el registro de acceso cultural, construida con React y Tailwind CSS.

## 🏗️ Estructura del Proyecto

El proyecto está organizado en componentes modulares para mantener el código limpio y reutilizable:

```
src/
├── components/           # Componentes reutilizables
│   ├── Header.jsx       # Header con logos y título
│   ├── LogoCentral.jsx  # Logo principal
│   ├── FormularioRegistro.jsx  # Formulario principal
│   ├── CampoInput.jsx   # Input de texto reutilizable
│   ├── CampoSelect.jsx  # Select dropdown reutilizable
│   ├── CampoRadio.jsx   # Radio buttons reutilizables
│   └── SeccionFormulario.jsx  # Contenedor para agrupar campos
├── constants/            # Constantes y datos estáticos
│   └── opcionesFormulario.js  # Opciones para dropdowns y radio buttons
├── App.jsx              # Componente principal
└── main.jsx             # Punto de entrada
```

## 🧩 Componentes

### Header
- Muestra los logos oficiales y el título principal
- Responsive con tamaños adaptativos

### LogoCentral
- Logo principal de Cultural Access
- Centrado en la página

### FormularioRegistro
- Formulario principal con todos los campos
- Maneja el estado del formulario
- Utiliza componentes reutilizables

### CampoInput
- Input de texto reutilizable
- Soporta diferentes tipos (text, email, etc.)
- Estilos consistentes con Tailwind CSS

### CampoSelect
- Select dropdown reutilizable
- Opciones configurables
- Estilos consistentes

### CampoRadio
- Radio buttons reutilizables
- Opciones configurables
- Estilos consistentes

### SeccionFormulario
- Contenedor para agrupar campos relacionados
- Espaciado consistente

## 🎨 Características

- **Diseño Responsive**: Se adapta a diferentes tamaños de pantalla
- **Componentes Reutilizables**: Código limpio y mantenible
- **Validación de Formularios**: Campos requeridos y validación HTML5
- **Estilos Consistentes**: Uso de Tailwind CSS para un diseño uniforme
- **Accesibilidad**: Labels apropiados y estructura semántica

## 🚀 Instalación y Uso

1. Instalar dependencias:
```bash
npm install
```

2. Ejecutar en modo desarrollo:
```bash
npm run dev
```

3. Construir para producción:
```bash
npm run build
```

## 🛠️ Tecnologías Utilizadas

- **React 19**: Framework de interfaz de usuario
- **Tailwind CSS**: Framework de CSS utilitario
- **Vite**: Herramienta de construcción rápida
- **ESLint**: Linter para mantener calidad del código

## 📝 Campos del Formulario

- **Información Personal**: Nombre, apellidos, género
- **Contacto**: Email
- **Dirección**: Calle, colonia, municipio, estado, código postal
- **Demográficos**: Edad, estudios, estado civil

## 🔧 Personalización

Para agregar nuevos campos o modificar opciones existentes:

1. **Nuevos campos**: Agregar en `FormularioRegistro.jsx` usando los componentes existentes
2. **Nuevas opciones**: Agregar en `constants/opcionesFormulario.js`
3. **Estilos**: Modificar clases de Tailwind CSS en los componentes

## 📱 Responsive Design

El formulario se adapta automáticamente a:
- **Móviles**: Layout de una columna
- **Tablets**: Layout de dos columnas para campos relacionados
- **Desktop**: Layout de tres columnas para información personal
