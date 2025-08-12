// Configuración del entorno
const config = {
    // Detectar entorno automáticamente
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
    
    // Verificar si el acceso es válido (requiere patrón codigo/codigo-partida)
    get isValidAccess() {
        const url = window.location.href;
        
        // Patrón para parámetros: ?/codigo/codigo-partida (con o sin texto adicional)
        const paramPattern = /\?\/(4815|1623|00F0)\/([^\/\?]+)/i;
        
        return paramPattern.test(url);
    },
    
    // Detectar código de acceso por URL
    get currentCode() {
        const url = window.location.href;
        
        // Buscar patrón en parámetros: ?/codigo/codigo-partida (con o sin texto adicional)
        const paramPattern = /\?\/(4815|1623|00F0)\/([^\/\?]+)/i;
        const paramMatch = url.match(paramPattern);
        
        if (paramMatch) {
            return paramMatch[1]; // Retorna el código de acceso (4815, 1623 o 00F0)
        }
        
        // Si no hay código, retornar null
        return null;
    },
    
    // Detectar código de partida por URL
    get currentPartidaCode() {
        const url = window.location.href;
        
        // Buscar patrón en parámetros: ?/codigo/codigo-partida (con o sin texto adicional)
        const paramPattern = /\?\/(4815|1623|00F0)\/([^\/\?]+)/i;
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
        if (code === '1623') return 'red';
        if (code === '00F0') return 'blue';
        return 'green'; // 4815 = verde por defecto
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

// Configuración inicial silenciosa para producción

export default config; 