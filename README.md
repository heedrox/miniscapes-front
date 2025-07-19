# Terminal Web

Una terminal web responsiva con interfaz moderna que simula una terminal real en el navegador.

## 🚀 Características

- **Interfaz moderna**: Diseño inspirado en terminales reales con tema oscuro
- **Totalmente responsiva**: Funciona perfectamente en desktop, tablet y móvil
- **Comandos interactivos**: Ejecuta comandos básicos como en una terminal real
- **Historial de comandos**: Navega por comandos anteriores con las flechas ↑↓
- **Auto-scroll**: La terminal se desplaza automáticamente al final
- **Fuente monoespaciada**: Usa JetBrains Mono para una experiencia auténtica

## 📱 Comandos Disponibles

- `help` - Muestra la lista de comandos disponibles
- `clear` - Limpia la terminal
- `date` - Muestra la fecha y hora actual
- `echo [texto]` - Repite el texto proporcionado
- `ls` - Lista archivos (simulado)
- `pwd` - Muestra el directorio actual
- `whoami` - Muestra el usuario actual
- `neofetch` - Muestra información del sistema

## 🛠️ Instalación y Uso

### Opción 1: Abrir directamente
Simplemente abre el archivo `index.html` en tu navegador.

### Opción 2: Servidor local (recomendado)
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# O usar servidor HTTP simple
npm start
```

El proyecto se abrirá automáticamente en `http://localhost:3000`

## 🎨 Personalización

### Colores
Los colores principales están definidos en `styles.css`:
- Fondo: `#0c0c0c`
- Texto: `#cccccc`
- Prompt: `#27ca3f` (verde)
- Errores: `#ff5f56` (rojo)
- Advertencias: `#ffbd2e` (amarillo)

### Comandos
Puedes agregar nuevos comandos editando el método `processCommand()` en `script.js`.

## 📱 Responsive Design

El proyecto incluye breakpoints para:
- **Desktop**: > 768px
- **Tablet**: 768px - 480px
- **Móvil**: < 480px

## 🚀 Despliegue

### Firebase Hosting
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Inicializar proyecto Firebase
firebase init hosting

# Desplegar
firebase deploy
```

### Otros servicios
El proyecto es compatible con cualquier servicio de hosting estático:
- Netlify
- Vercel
- GitHub Pages
- Surge.sh

## 🎯 Características Técnicas

- **Vanilla JavaScript**: Sin frameworks, puro JS
- **CSS Grid/Flexbox**: Layout moderno y flexible
- **Font Awesome**: Iconos para archivos
- **Google Fonts**: JetBrains Mono para tipografía

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