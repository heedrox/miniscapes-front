# Terminal Web - Archivos de Producción

Este directorio contiene los archivos necesarios para la aplicación web de control de drones.

## Archivos

- **`index.html`** - Página principal de la terminal
- **`script.js`** - Lógica principal de la aplicación
- **`styles.css`** - Estilos y temas de la terminal
- **`config.js`** - Configuración de entorno y detección de drones

## Características

- Terminal web responsiva con interfaz moderna
- Soporte para dos drones: Johnson (verde) y Jackson (rojo)
- Control por lenguaje natural mediante LLM
- Panel de archivos lateral
- Validación de acceso por URL
- Carga de historial de conversación

## URLs Soportadas

- Path: `/dron/codigo/` (ej: `/johnson/ABC123/`)
- Parámetros: `?/dron/codigo/` (ej: `?/jackson/XYZ789/`)

## Despliegue

Estos archivos están listos para ser desplegados en cualquier servidor web estático.

## Desarrollo

Para desarrollo local, ejecutar desde el directorio raíz:
```bash
npm start
``` 