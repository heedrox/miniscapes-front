// Configuración del entorno
const config = {
    // Detectar entorno automáticamente
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
    
    // Detectar dron por URL
    get currentDrone() {
        return window.location.href.includes('jackson') ? 'jackson' : 'johnson';
    },
    
    // URLs de las APIs
    API_URL_LOCAL: 'http://localhost:5001/mansion-espiritus-lkgoxs/us-central1/multiscapes',
    API_URL_PRODUCTION: 'https://us-central1-mansion-espiritus-lkgoxs.cloudfunctions.net/multiscapes',
    
    // URL activa basada en el entorno
    get DRONE_API_URL() {
        return this.isDevelopment ? this.API_URL_LOCAL : this.API_URL_PRODUCTION;
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
console.log(`API URL: ${config.DRONE_API_URL}`);

export default config; 