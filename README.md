# Terminal Web - Sistema de Control de Drones

Una terminal web responsiva para el control de drones mediante lenguaje natural.

## 📁 Estructura del Proyecto

```
twin-islands-front/
├── web/                    # Archivos de producción
│   ├── index.html         # Página principal
│   ├── script.js          # Lógica de la aplicación
│   ├── styles.css         # Estilos y temas
│   ├── config.js          # Configuración
│   └── README.md          # Documentación de producción
├── node_modules/          # Dependencias de desarrollo
├── photos/               # Imágenes del proyecto
├── package.json          # Configuración de Node.js
├── env.config           # Variables de entorno
└── README.md            # Este archivo
```

## 🚀 Características

- **Control de drones**: Soporte para Johnson (verde) y Jackson (rojo)
- **Lenguaje natural**: Control mediante instrucciones en español
- **Validación de acceso**: URLs seguras con códigos únicos
- **Historial de conversación**: Carga automática de conversaciones previas
- **Panel de archivos**: Visualización de archivos capturados
- **Interfaz responsiva**: Funciona en desktop, tablet y móvil
- **Temas dinámicos**: Colores según el dron activo

## 📱 Comandos Disponibles

### Comandos Básicos
- `help` - Muestra la lista de comandos disponibles
- `clear` - Limpia la terminal
- `files` - Abre panel de archivos
- `env` - Muestra configuración del entorno

### Control de Entorno
- `local` - Cambia a entorno local
- `production` - Cambia a entorno de producción
- `toggle` - Alterna entre entornos

### Control por LLM
- Escribe instrucciones naturales como:
  - "Toma una foto de la costa"
  - "Graba un video del vuelo"
  - "Escanea el terreno"
  - "Muestra el estado del dron"

## 🛠️ Instalación y Uso

### Desarrollo Local
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

El proyecto se abrirá automáticamente en `http://localhost:3000`

### URLs de Acceso
- **Johnson**: `http://localhost:3000/johnson/CODIGO/`
- **Jackson**: `http://localhost:3000/jackson/CODIGO/`
- **Con parámetros**: `http://localhost:3000/?/dron/CODIGO/`

## 🎨 Temas de Drones

### Johnson (Verde)
- Prompt y comandos: `#27ca3f`
- Respuestas del dron: Verde
- Panel de archivos: Verde
- Archivos adjuntos: Enlaces verdes

### Jackson (Rojo)
- Prompt y comandos: `#e74c3c`
- Respuestas del dron: Rojo
- Panel de archivos: Rojo
- Archivos adjuntos: Enlaces rojos

### Configuración
Los temas están definidos en `web/styles.css` y se aplican automáticamente según el dron detectado en la URL.

## 📱 Responsive Design

El proyecto incluye breakpoints para:
- **Desktop**: > 768px
- **Tablet**: 768px - 480px
- **Móvil**: < 480px

## 🚀 Despliegue

### Archivos de Producción
Los archivos listos para producción están en el directorio `web/`:
- `index.html`
- `script.js`
- `styles.css`
- `config.js`

### Servicios de Hosting
El proyecto es compatible con cualquier servicio de hosting estático:
- Firebase Hosting
- Netlify
- Vercel
- GitHub Pages
- Surge.sh

### Configuración de Producción
Asegúrate de configurar las URLs de la API en `web/config.js` para el entorno de producción.

## 🎯 Características Técnicas

- **Vanilla JavaScript**: Sin frameworks, puro JS
- **CSS Grid/Flexbox**: Layout moderno y flexible
- **Google Fonts**: JetBrains Mono para tipografía
- **Fetch API**: Comunicación con backend LLM
- **URL Validation**: Detección de dron y código
- **Dynamic Theming**: Temas según dron activo

## 📄 Licencia

MIT License - Libre para uso personal y comercial.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Contacto

Si tienes preguntas o sugerencias, no dudes en abrir un issue en GitHub. 