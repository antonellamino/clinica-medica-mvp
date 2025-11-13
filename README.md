# ChatMedic - Frontend

Frontend del proyecto ChatMedic desarrollado con React 18, Vite, React Router, Axios y Bootstrap 5.

## 🚀 Características

- **React 18** con Vite para desarrollo rápido
- **React Router** para navegación entre páginas
- **Axios** para peticiones HTTP
- **Bootstrap 5** para diseño responsive
- **Context API** para manejo de autenticación
- Diseño minimalista con paleta de colores personalizada

## 📋 Requisitos Previos

- Node.js (versión 18 o superior)
- npm o yarn

## 🛠️ Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Configura las variables de entorno:
   - Copia el archivo `.env.example` a `.env`
   - Configura la URL de tu API backend en `VITE_API_URL`

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
proyectoFinalFrontend/
├── Assets/
│   ├── asistenteMedica.png
│   ├── error404.png
│   └── logoChatMedica.png
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Contacto.jsx
│   │   ├── Login.jsx
│   │   ├── Registro.jsx
│   │   └── Error404.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 Paleta de Colores

- **Color Primario**: #1E6FFB
- **Color de Fondo**: #F5F6FA
- **Color de Texto Principal**: #1E1E1E
- **Color de Confirmación**: #2ECC71

## 📄 Páginas

- **Home** (`/`): Página principal con card de login y sección de chat
- **Contacto** (`/contacto`): Formulario de contacto
- **Login** (`/acceder`): Página de inicio de sesión
- **Registro** (`/registro`): Página de registro de nuevos usuarios
- **Error 404** (`/404`): Página de error 404

## 🔧 Configuración del Backend

Para conectar con el backend, edita el archivo `.env` y configura:

```
VITE_API_URL=http://localhost:3000/api
```

Luego, descomenta las llamadas a la API en los siguientes archivos:
- `src/pages/Home.jsx`
- `src/pages/Login.jsx`
- `src/pages/Registro.jsx`
- `src/pages/Contacto.jsx`

## 📦 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run preview`: Previsualiza la build de producción
- `npm run lint`: Ejecuta el linter

## 🚀 Build para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`.

## 📝 Notas

- El proyecto está configurado para trabajar con un backend que aún no está configurado
- Las funcionalidades de login, registro y chat mostrarán mensajes informativos hasta que el backend esté disponible
- Los estilos personalizados están definidos en `src/index.css`

