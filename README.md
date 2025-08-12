# Terminal Web

Una terminal web moderna con interfaz responsiva y temática dinámica por realidades.

- **Control de dron**: Sistema unificado Johnson con dos realidades visuales

## Ejecutar

- `npm run dev` para entorno de desarrollo
- `npm start` para servir los archivos estáticos

## Acceso por URL

La aplicación valida enlaces con el patrón `?/codigo/codigo-partida`.

- **Realidad Verde (4815)**: `http://localhost:3000/?/4815/codex/`
- **Realidad Roja (1623)**: `http://localhost:3000/?/1623/codex/`
- **Realidad Azul (00F0, jameson)**: `http://localhost:3000/?/00F0/codex/`

Donde:
- `4815`, `1623` o `00F0` es el código de acceso (realidad)
- `codex` es el código de partida (sala)

## 🎨 Temas de Realidades

### Realidad Verde (Código 4815)

Estilo base con acentos verdes.

### Realidad Roja (Código 1623)

Tema alternativo con acentos rojos (clase `drone-jackson`).

### Realidad Azul (Código 00F0, "jameson")

- Tema con acentos azules (clase `drone-jameson`).
- En esta realidad no se muestran medios ni archivos:
  - No aparecen los thumbnails de imágenes/vídeos junto a los mensajes
  - No se muestra la pestaña ni el panel de archivos
  - No se imprime la línea de "Ficheros adjuntos" 