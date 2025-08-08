// Configuración del entorno
const config = {
    // Detectar entorno automáticamente
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
    
    // Verificar si el acceso es válido (requiere patrón codigo/codigo-partida)
    get isValidAccess() {
        const url = window.location.href;
        
        // Patrón para parámetros: ?/codigo/codigo-partida (con o sin texto adicional)
        const paramPattern = /\?\/(4815|1623)\/([^\/\?]+)/;
        
        return paramPattern.test(url);
    },
    
    // Detectar código de acceso por URL
    get currentCode() {
        const url = window.location.href;
        
        // Buscar patrón en parámetros: ?/codigo/codigo-partida (con o sin texto adicional)
        const paramPattern = /\?\/(4815|1623)\/([^\/\?]+)/;
        const paramMatch = url.match(paramPattern);
        
        if (paramMatch) {
            return paramMatch[1]; // Retorna el código de acceso (4815 o 1623)
        }
        
        // Si no hay código, retornar null
        return null;
    },
    
    // Detectar código de partida por URL
    get currentPartidaCode() {
        const url = window.location.href;
        
        // Buscar patrón en parámetros: ?/codigo/codigo-partida (con o sin texto adicional)
        const paramPattern = /\?\/(4815|1623)\/([^\/\?]+)/;
        const paramMatch = url.match(paramPattern);
        
        if (paramMatch) {
            return paramMatch[2]; // Retorna el código de partida
        }
        
        // Si no hay código de partida, retornar null
        return null;
    },
    
    // Determinar tema visual basado en el código de acceso
    get currentTheme() {
        const code = this.currentCode;
        return code === '1623' ? 'red' : 'green'; // 1623 = rojo, 4815 = verde
    },
    
    // URLs de las APIs
    API_URL_LOCAL: 'http://localhost:5001/mansion-espiritus-lkgoxs/us-central1/multiscapes',
    API_URL_PRODUCTION: 'https://us-central1-mansion-espiritus-lkgoxs.cloudfunctions.net/multiscapes',
    
    // URL activa basada en el entorno
    get DRONE_API_URL() {
        return this.isDevelopment ? this.API_URL_LOCAL : this.API_URL_PRODUCTION;
    },
    
    // URL para inicialización
    get INIT_API_URL() {
        const baseUrl = this.isDevelopment ? this.API_URL_LOCAL : this.API_URL_PRODUCTION;
        return baseUrl.replace('/multiscapes', '/multiscapesInit');
    },
    
    // Función para cambiar entorno manualmente
    setEnvironment(env) {
        if (env === 'local') {
            this.isDevelopment = true;
            this.isProduction = false;
        } else if (env === 'production') {
            this.isDevelopment = false;
            this.isProduction = true;
        }
        console.log(`Entorno cambiado a: ${env}`);
        console.log(`API URL: ${this.DRONE_API_URL}`);
    },
    
    // Función para alternar entorno
    toggleEnvironment() {
        if (this.isDevelopment) {
            this.setEnvironment('production');
        } else {
            this.setEnvironment('local');
        }
    }
};

// Mostrar configuración inicial
console.log('🚁 Configuración del Sistema de Control del Dron:');
console.log(`Entorno: ${config.isDevelopment ? 'Desarrollo (Local)' : 'Producción'}`);
console.log(`Código de acceso: ${config.currentCode || 'No especificado'}`);
console.log(`Código de partida: ${config.currentPartidaCode || 'No especificado'}`);
console.log(`Tema: ${config.currentTheme}`);
console.log(`API URL: ${config.DRONE_API_URL}`);

export default config; 