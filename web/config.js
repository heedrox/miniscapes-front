// Configuración del entorno
const config = {
    // Detectar entorno automáticamente
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
    
    // Verificar si el acceso es válido (requiere patrón dron/codigo)
    get isValidAccess() {
        const url = window.location.href;
        const path = window.location.pathname;
        
        // Patrón para path: /dron/codigo/
        const pathPattern = /\/(jackson|johnson)\/([^\/]+)\/?$/;
        
        // Patrón para parámetros: ?/dron/codigo/
        const paramPattern = /\?\/(jackson|johnson)\/([^\/\?]+)\/?$/;
        
        return pathPattern.test(path) || paramPattern.test(url);
    },
    
    // Detectar dron y código por URL
    get currentDrone() {
        const url = window.location.href;
        const path = window.location.pathname;
        
        // Buscar en path primero
        const pathMatch = path.match(/\/(jackson|johnson)\/([^\/]+)\/?$/);
        if (pathMatch) {
            return pathMatch[1];
        }
        
        // Buscar en parámetros
        const paramMatch = url.match(/\?\/(jackson|johnson)\/([^\/\?]+)\/?$/);
        if (paramMatch) {
            return paramMatch[1];
        }
        
        // Fallback: detectar por presencia de jackson
        return url.includes('jackson') ? 'jackson' : 'johnson';
    },
    
    // Obtener código de la URL
    get currentCode() {
        const url = window.location.href;
        const path = window.location.pathname;
        
        // Buscar patrón en path: /dron/codigo/
        const pathPattern = /\/(jackson|johnson)\/([^\/]+)\/?$/;
        const pathMatch = path.match(pathPattern);
        
        if (pathMatch) {
            return pathMatch[2]; // Retorna el código
        }
        
        // Buscar patrón en parámetros: ?/dron/codigo/
        const paramPattern = /\?\/(jackson|johnson)\/([^\/\?]+)\/?$/;
        const paramMatch = url.match(paramPattern);
        
        if (paramMatch) {
            return paramMatch[2]; // Retorna el código
        }
        
        // Si no hay código, retornar null
        return null;
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
console.log(`Dron: ${config.currentDrone}`);
console.log(`Código: ${config.currentCode || 'No especificado'}`);
console.log(`API URL: ${config.DRONE_API_URL}`);

export default config; 