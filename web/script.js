class Terminal {
    constructor() {
        this.output = document.getElementById('terminalOutput');
        this.input = document.getElementById('terminalInput');
        this.commandHistory = [];
        this.historyIndex = -1;
        this.autoScroll = true; // Control para auto-scroll
        
        // Panel de archivos
        this.filesPanel = document.getElementById('filesPanel');
        this.filesTab = document.getElementById('filesTab');
        this.filesContent = document.getElementById('filesContent');
        this.closePanel = document.getElementById('closePanel');
        
        // Elemento para mostrar ubicación actual
        this.currentRoomDisplay = document.getElementById('currentRoomDisplay');
        
        // Verificar acceso válido antes de configurar
        if (!config.isValidAccess) {
            this.showAccessError();
            return;
        }
        
        // Limpiar zona de archivos al inicializar
        this.clearFilesPanel();
        
        // Configurar dron
        this.setupDrone();
        
        // Limpiar output para preparar la carga del historial
        this.output.innerHTML = '';
        
        this.init();
    }
    
    init() {
        // Verificar acceso válido antes de inicializar
        if (!config.isValidAccess) {
            this.showAccessError();
            return;
        }
        
        this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.input.addEventListener('input', () => this.updateCursorPosition());
        this.input.addEventListener('click', () => this.updateCursorPosition());
        this.input.addEventListener('keyup', () => this.updateCursorPosition());
        this.input.addEventListener('focus', () => this.updateCursorPosition());
        this.input.focus();
        
        // Habilitar scroll manual
        this.enableManualScroll();
        
        // Auto-scroll al final
        this.scrollToBottom();
        
        // Crear cursor personalizado
        this.createCustomCursor();
        
        // Inicializar panel de archivos
        this.initFilesPanel();
        
        // Actualizar posición del cursor cuando se redimensiona la ventana
        window.addEventListener('resize', () => this.updateCursorPosition());
        
        // Inicializar botón de reset
        this.initResetButton();
        
        // Cargar historial inicial
        this.loadInitialHistory();
    }
    
    async loadInitialHistory() {
        try {
            // Mostrar mensaje de conexión inicial
            this.addOutputLine(`Conectando a dron@johnson...`, 'text');
            this.addOutputLine('', 'text');
            
            // Mostrar mensaje de bienvenida
            this.updateWelcomeMessage(config.currentTheme);
            
            // Los mensajes se cargarán automáticamente desde Firebase en tiempo real
            // a través de la función updateTerminalWithMessages
            
        } catch (error) {
            // Error silencioso - los mensajes se cargarán desde Firebase
            this.updateWelcomeMessage(config.currentTheme);
        }
    }
    
    showAccessError() {
        // Deshabilitar input
        this.input.disabled = true;
        this.input.placeholder = 'Acceso denegado';
        
        // Ocultar cursor personalizado si existe
        if (this.cursor) {
            this.cursor.style.display = 'none';
        }
        
        // Limpiar output y mostrar mensaje de error
        this.output.innerHTML = '';
        
        const errorMessages = [
            '🚫 ERROR DE ACCESO AL DRON',
            '',
            '❌ Enlace inválido o acceso denegado.',
            '',
            '⚠️  Compruebe que su enlace sea correcto.',
            '💡 Contacte al administrador si necesita acceso.'
        ];
        
        errorMessages.forEach(line => {
            this.addOutputLine(line, 'error');
        });
        
        // Actualizar título
        const terminalTitle = document.getElementById('terminalTitle');
        if (terminalTitle) {
            terminalTitle.textContent = 'dron@access-denied:~';
        }
        
        console.error('🚫 Acceso denegado: URL no válida');
    }
    
    setupDrone() {
        const currentCode = config.currentCode;
        const currentPartidaCode = config.currentPartidaCode;
        const currentTheme = config.currentTheme;
        const terminalTitle = document.getElementById('terminalTitle');
        
        // Actualizar título con códigos
        const titleCode = currentCode ? `/${currentCode}` : '';
        const partidaCode = currentPartidaCode ? `/${currentPartidaCode}` : '';
        // Base title without count; count will be appended in realtime
        const baseTitle = `dron@johnson${titleCode}${partidaCode}:~`;
        terminalTitle.dataset.baseTitle = baseTitle;
        // Render base title with placeholder span for count so we do not overwrite it later
        terminalTitle.innerHTML = `${baseTitle} <span id="messageCount" style="opacity:0.8; font-weight:600;"></span>`;
        
        // Aplicar clase CSS según el tema
        if (currentTheme === 'red') {
            document.body.classList.add('drone-jackson');
            console.log('🚁 Realidad Roja activada - Código 1623');
        } else {
            console.log('🚁 Realidad Verde activada - Código 4815');
        }
        
        // El mensaje de bienvenida se mostrará después de cargar el historial
        
        // Iniciar suscripción a contador de mensajes si hay código de partida
        this.initMessageCountSubscription();
    }
    
    updateWelcomeMessage(theme) {
        const codeInfo = config.currentCode ? ` (Código: ${config.currentCode}` : '';
        const partidaInfo = config.currentPartidaCode ? `/${config.currentPartidaCode}` : '';
        const fullCodeInfo = codeInfo + partidaInfo + ')';
        
        const welcomeMessages = {
            green: `Bienvenido al Sistema de Control del Dron Johnson${fullCodeInfo}`,
            red: `¡Bienvenido al Sistema de Control del Dron Johnson! 🔥${fullCodeInfo}`
        };
        
        // Actualizar el primer mensaje de bienvenida
        const firstOutputLine = this.output.querySelector('.output-line');
        if (firstOutputLine) {
            const commandSpan = firstOutputLine.querySelector('.command');
            if (commandSpan) {
                commandSpan.textContent = welcomeMessages[theme];
            }
        }
    }
    
    updateCurrentRoom(roomName) {
        // Actualizar la ubicación mostrada en la barra de estado
        if (this.currentRoomDisplay && roomName) {
            const previousRoom = this.currentRoomDisplay.textContent;
            this.currentRoomDisplay.textContent = roomName;
            
            // Solo mostrar cambio de ubicación si es diferente a la anterior
            // y no es el estado inicial de "Conectando..."
            if (previousRoom !== roomName && previousRoom !== 'Conectando...') {
                this.addOutputLine(`📍 Dron reubicado en: ${roomName}`, 'drone-location');
            }
        }
    }
    
    handleKeyDown(e) {
        if (e.key === 'Enter') {
            this.executeCommand();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.navigateHistory('up');
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.navigateHistory('down');
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End') {
            // Actualizar posición del cursor después de mover el cursor nativo
            setTimeout(() => this.updateCursorPosition(), 0);
        }
    }
    
    async executeCommand() {
        const command = this.input.value.trim();
        if (command === '') return;

        // Deshabilitar input y mostrar animación
        this.input.disabled = true;
        this.input.classList.add('waiting');
        this.showInputSpinner();

        // Agregar comando al historial
        this.commandHistory.push(command);
        this.historyIndex = this.commandHistory.length;

        // Mostrar comando ejecutado
        this.addOutputLine(`$ ${command}`, 'command-executed');

        // Ejecutar comando
        await this.processCommand(command);

        // Limpiar input
        this.input.value = '';

        // Habilitar input y quitar animación
        this.input.disabled = false;
        this.input.classList.remove('waiting');
        this.hideInputSpinner();
        this.input.focus();

        // Scroll al final
        this.scrollToBottom();
    }
    
    async processCommand(command) {
        const parts = command.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        // Comandos básicos del sistema
        switch (cmd) {
            case 'help':
                this.showHelp();
                break;
            case 'clear':
                this.clear();
                break;
            case 'files':
                this.toggleFilesPanel();
                break;
            case 'exit':
            case 'quit':
                this.exitTerminal();
                break;
            // Comandos de entretenimiento (ocultos pero funcionales)
            case 'joke':
                this.tellJoke();
                break;
            case 'matrix':
                this.matrixEffect();
                break;
            case 'rainbow':
                this.rainbowText(args.join(' '));
                break;
            case 'ascii':
                this.showAsciiArt();
                break;
            case 'scroll':
                this.testScroll();
                break;
            case 'env':
                this.showEnvironment();
                break;
            case 'local':
                this.setLocalEnvironment();
                break;
            case 'production':
                this.setProductionEnvironment();
                break;
            case 'toggle':
                this.toggleEnvironment();
                break;

            default:
                // Cualquier otro comando se trata como instrucción para el LLM
                await this.processLLMCommand(command);
        }
    }
    
    showHelp() {
        const helpText = [
            '🚁 Sistema de Control del Dron - Comandos Básicos:',
            '',
            '🔧 Utilidades:',
            '  help      - Muestra esta ayuda',
            '  clear     - Limpia la terminal',
            '  files     - Abre panel de archivos',
            '',
            '🌍 Configuración de Entorno:',
            '  env         - Muestra configuración actual',
            '  local       - Cambia a entorno local',
            '  production  - Cambia a entorno de producción',
            '  toggle      - Alterna entre entornos',

            '',
            '💬 Control por LLM:',
            '  Escribe instrucciones naturales como:',
            '  - "Toma una foto de la costa"',
            '  - "Graba un video del vuelo"',
            '  - "Escanea el terreno"',
            '  - "Muestra el estado del dron"',
            '',
            '🎯 Comandos especiales:',
            '  exit/quit - Salir del sistema',
            '',
            '💡 Tip: El dron responde a instrucciones en lenguaje natural'
        ];
        
        helpText.forEach(line => {
            this.addOutputLine(line, 'text');
        });
    }
    
    clear() {
        this.output.innerHTML = '';
    }
    
    showDate() {
        const now = new Date();
        const dateString = now.toLocaleString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        this.addOutputLine(dateString, 'text');
    }
    
    echo(text) {
        if (text) {
            this.addOutputLine(text, 'text');
        } else {
            this.addOutputLine('Uso: echo [texto]', 'warning');
        }
    }
    
    listFiles() {
        const files = [
            '📁 documentos/',
            '📁 imagenes/',
            '📁 musica/',
            '📄 README.md',
            '📄 package.json',
            '📄 index.html',
            '📄 styles.css',
            '📄 script.js'
        ];
        
        this.addOutputLine('Archivos en el directorio actual:', 'text');
        files.forEach(file => {
            this.addOutputLine(`  ${file}`, 'text');
        });
    }
    
    showCurrentDirectory() {
        this.addOutputLine('/home/terminal/web', 'text');
    }
    
    showUser() {
        this.addOutputLine('terminal', 'text');
    }
    
    showSystemInfo() {
        const systemInfo = [
            '╭──────────────────────────────────────────────────────────────╮',
            '│                Sistema de Control del Dron v1.0              │',
            '├──────────────────────────────────────────────────────────────┤',
            '│ OS: Drone Control System                                    │',
            '│ Kernel: LLM Processing Engine                               │',
            '│ Shell: Natural Language Interface                           │',
            '│ Terminal: Web-based                                         │',
            '│ CPU: AI Processing Unit                                     │',
            '│ Memory: Dynamic Allocation                                  │',
            '│ Storage: Cloud File System                                  │',
            '╰──────────────────────────────────────────────────────────────╯'
        ];
        
        systemInfo.forEach(line => {
            this.addOutputLine(line, 'text');
        });
    }
    
    addOutputLine(content, className = 'text') {
        const line = document.createElement('div');
        line.className = `output-line ${className}`;
        
        // Convertir saltos de línea \n en <br/> para que se muestren en HTML
        const formattedContent = content.replace(/\n/g, '<br/>');
        line.innerHTML = formattedContent;
        
        this.output.appendChild(line);
        
        // Solo hacer auto-scroll si el usuario está en la parte inferior
        if (this.autoScroll) {
            this.scrollToBottom();
        }
    }
    
    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        if (direction === 'up') {
            if (this.historyIndex > 0) {
                this.historyIndex--;
            }
        } else if (direction === 'down') {
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
            } else {
                this.historyIndex = this.commandHistory.length;
                this.input.value = '';
                return;
            }
        }
        
        if (this.historyIndex >= 0 && this.historyIndex < this.commandHistory.length) {
            this.input.value = this.commandHistory[this.historyIndex];
        }
    }
    
    scrollToBottom() {
        // Forzar el scroll al final con un pequeño delay para asegurar que el contenido se haya renderizado
        setTimeout(() => {
            this.output.scrollTop = this.output.scrollHeight;
        }, 10);
    }
    
    createCustomCursor() {
        // Crear elemento cursor personalizado
        this.cursor = document.createElement('span');
        this.cursor.className = 'custom-cursor';
        this.cursor.innerHTML = '█';
        
        // Color del cursor según el dron
        const cursorColor = config.currentDrone === 'jackson' ? '#e74c3c' : '#27ca3f';
        
        this.cursor.style.cssText = `
            position: absolute;
            color: ${cursorColor};
            animation: blink 1s infinite;
            pointer-events: none;
            z-index: 10;
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            line-height: 1.5;
            vertical-align: baseline;
            display: inline-block;
        `;
        
        // Insertar el cursor en el input
        this.input.parentNode.style.position = 'relative';
        this.input.parentNode.appendChild(this.cursor);
        
        // Posición inicial del cursor con un pequeño delay para asegurar que todo esté renderizado
        setTimeout(() => this.updateCursorPosition(), 10);
    }
    
    updateCursorPosition() {
        if (!this.cursor) return;
        
        // Obtener estilos del input para replicar exactamente su renderizado
        const inputStyle = window.getComputedStyle(this.input);
        
        // Crear un span temporal para medir el texto con los mismos estilos que el input
        const tempSpan = document.createElement('span');
        tempSpan.style.cssText = `
            position: absolute;
            visibility: hidden;
            white-space: pre;
            font-family: ${inputStyle.fontFamily};
            font-size: ${inputStyle.fontSize};
            font-weight: ${inputStyle.fontWeight};
            letter-spacing: ${inputStyle.letterSpacing};
            word-spacing: ${inputStyle.wordSpacing};
            line-height: ${inputStyle.lineHeight};
        `;
        tempSpan.textContent = this.input.value.substring(0, this.input.selectionStart);
        
        // Agregar temporalmente al DOM para medir
        document.body.appendChild(tempSpan);
        const textWidth = tempSpan.getBoundingClientRect().width;
        document.body.removeChild(tempSpan);
        
        // Obtener la posición del input
        const inputRect = this.input.getBoundingClientRect();
        const parentRect = this.input.parentNode.getBoundingClientRect();
        
        // Calcular la posición relativa al padre
        const relativeLeft = inputRect.left - parentRect.left;
        
        // Obtener el padding izquierdo del input
        const inputPaddingLeft = parseFloat(inputStyle.paddingLeft) || 0;
        
        // Posicionar el cursor: posición del input + padding izquierdo + ancho del texto
        this.cursor.style.left = (relativeLeft + inputPaddingLeft + textWidth) + 'px';
        
        // Alinear verticalmente con el texto del input
        const inputLineHeight = parseFloat(inputStyle.lineHeight);
        const inputPaddingTop = parseFloat(inputStyle.paddingTop) || 0;
        
        // Calcular la posición vertical para alinear con la línea base del texto
        const fontSize = parseFloat(inputStyle.fontSize);
        const textBaselineOffset = (inputLineHeight - fontSize) / 2;
        this.cursor.style.top = (inputPaddingTop + textBaselineOffset) + 'px';
        
        // Debug: mostrar información en consola (opcional)
        // console.log('Cursor position:', textWidth, 'px from left, selection at:', this.input.selectionStart);
    }
    
    // Método para permitir scroll manual
    enableManualScroll() {
        this.output.addEventListener('scroll', () => {
            // Si el usuario hace scroll manual, no auto-scrollear
            const isAtBottom = this.output.scrollTop + this.output.clientHeight >= this.output.scrollHeight - 10;
            this.autoScroll = isAtBottom;
        });
    }
    
    // Método para probar el scroll
    testScroll() {
        this.addOutputLine('Generando contenido para probar el scroll...', 'text');
        this.addOutputLine('', 'text');
        
        // Generar mucho contenido para forzar el scroll
        for (let i = 1; i <= 150; i++) {
            this.addOutputLine(`Línea ${i}: Contenido de prueba para verificar el scroll en modo full-screen.`, 'text');
        }
        
        this.addOutputLine('', 'text');
        this.addOutputLine('🔍 VERIFICACIÓN DEL SCROLL:', 'warning');
        this.addOutputLine('1. Mira el lado DERECHO de la terminal', 'text');
        this.addOutputLine('2. Deberías ver una barra GRIS CLARA de 16px', 'text');
        this.addOutputLine('3. Usa la rueda del ratón para hacer scroll', 'text');
        this.addOutputLine('4. Arrastra la barra de scroll para navegar', 'text');
        this.addOutputLine('', 'text');
        this.addOutputLine('✅ Si ves la barra y puedes hacer scroll, ¡todo funciona!', 'success');
    }
    
    // Métodos adicionales para los comandos
    showTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES');
        this.addOutputLine(timeString, 'text');
    }
    
    showWeather() {
        this.addOutputLine('🌤️  Clima: Soleado con nubes dispersas', 'text');
        this.addOutputLine('🌡️  Temperatura: 22°C', 'text');
        this.addOutputLine('💨  Viento: 15 km/h', 'text');
        this.addOutputLine('💧  Humedad: 65%', 'text');
    }
    
    tellJoke() {
        const jokes = [
            '¿Por qué los programadores prefieren el frío? Porque odian los errores.',
            '¿Qué dice un programador cuando está atascado? "Funciona en mi máquina".',
            '¿Por qué los programadores confunden Halloween y Navidad? Porque Oct 31 = Dec 25.',
            '¿Cuántos programadores se necesitan para cambiar una bombilla? Ninguno, es un problema de hardware.',
            '¿Qué hace un programador en el gimnasio? Ejercicios de depuración.',
            '¿Por qué los programadores no salen al sol? Porque prefieren trabajar en la sombra.',
            '¿Qué le dice un programador a otro? "¡Hola, mundo!"',
            '¿Por qué los programadores son malos cocineros? Porque siempre siguen las recetas al pie de la letra.',
            '¿Cuál es el animal favorito de los programadores? El gato (porque tiene 9 vidas como los procesos).',
            '¿Por qué los programadores prefieren el café? Porque Java es su lenguaje favorito.'
        ];
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        this.addOutputLine(randomJoke, 'text');
    }
    
    showFortune() {
        const fortunes = [
            'Un bug en la mano vale más que mil en el código.',
            'El código limpio es como una buena historia.',
            'La paciencia es una virtud, especialmente en programación.',
            'Hoy es un buen día para refactorizar.',
            'El mejor código es el que no necesita comentarios.'
        ];
        const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
        this.addOutputLine(`🎯 ${randomFortune}`, 'text');
    }
    
    calculator(expression) {
        try {
            // Evaluar expresión matemática de forma segura
            const result = eval(expression);
            this.addOutputLine(`${expression} = ${result}`, 'success');
        } catch (error) {
            this.addOutputLine('Error en la expresión matemática', 'error');
        }
    }
    
    ping(host) {
        this.addOutputLine(`PING ${host} (127.0.0.1): 56 data bytes`, 'text');
        this.addOutputLine('64 bytes from 127.0.0.1: icmp_seq=1 time=0.123 ms', 'text');
        this.addOutputLine('64 bytes from 127.0.0.1: icmp_seq=2 time=0.098 ms', 'text');
        this.addOutputLine('64 bytes from 127.0.0.1: icmp_seq=3 time=0.145 ms', 'text');
        this.addOutputLine('', 'text');
        this.addOutputLine('--- 127.0.0.1 ping statistics ---', 'text');
        this.addOutputLine('3 packets transmitted, 3 received, 0% packet loss', 'success');
    }
    
    showUptime() {
        const uptime = Math.floor(Math.random() * 1000) + 100;
        const days = Math.floor(uptime / 24);
        const hours = uptime % 24;
        this.addOutputLine(`up ${days} days, ${hours} hours, 23 minutes`, 'text');
    }
    
    showProcesses() {
        this.addOutputLine('PID  TTY          TIME CMD', 'text');
        this.addOutputLine('1234 pts/0    00:00:01 bash', 'text');
        this.addOutputLine('1235 pts/0    00:00:00 node', 'text');
        this.addOutputLine('1236 pts/0    00:00:00 npm', 'text');
        this.addOutputLine('1237 pts/0    00:00:00 live-server', 'text');
    }
    
    showHistory() {
        if (this.commandHistory.length === 0) {
            this.addOutputLine('No hay comandos en el historial', 'text');
            return;
        }
        
        this.commandHistory.forEach((cmd, index) => {
            this.addOutputLine(`${index + 1}  ${cmd}`, 'text');
        });
    }
    
    catFile(filename) {
        if (!filename) {
            this.addOutputLine('Uso: cat [archivo]', 'warning');
            return;
        }
        
        const files = {
            'README.md': '# Terminal Web\n\nUna terminal web responsiva...',
            'package.json': '{\n  "name": "terminal-web",\n  "version": "1.0.0"\n}',
            'index.html': '<!DOCTYPE html>\n<html>\n<head>\n  <title>Terminal Web</title>\n</head>\n</html>'
        };
        
        if (files[filename]) {
            this.addOutputLine(files[filename], 'text');
        } else {
            this.addOutputLine(`cat: ${filename}: No existe el archivo`, 'error');
        }
    }
    
    touchFile(filename) {
        if (!filename) {
            this.addOutputLine('Uso: touch [archivo]', 'warning');
            return;
        }
        this.addOutputLine(`Archivo ${filename} creado`, 'success');
    }
    
    makeDirectory(dirname) {
        if (!dirname) {
            this.addOutputLine('Uso: mkdir [directorio]', 'warning');
            return;
        }
        this.addOutputLine(`Directorio ${dirname} creado`, 'success');
    }
    
    removeFile(filename) {
        if (!filename) {
            this.addOutputLine('Uso: rm [archivo]', 'warning');
            return;
        }
        this.addOutputLine(`Archivo ${filename} eliminado`, 'success');
    }
    
    moveFile(source, dest) {
        if (!source || !dest) {
            this.addOutputLine('Uso: mv [origen] [destino]', 'warning');
            return;
        }
        this.addOutputLine(`Archivo ${source} movido a ${dest}`, 'success');
    }
    
    copyFile(source, dest) {
        if (!source || !dest) {
            this.addOutputLine('Uso: cp [origen] [destino]', 'warning');
            return;
        }
        this.addOutputLine(`Archivo ${source} copiado a ${dest}`, 'success');
    }
    
    grepSearch(pattern) {
        if (!pattern) {
            this.addOutputLine('Uso: grep [patrón]', 'warning');
            return;
        }
        this.addOutputLine(`Buscando "${pattern}" en archivos...`, 'text');
        this.addOutputLine('index.html:1:<!DOCTYPE html>', 'text');
        this.addOutputLine('script.js:1:class Terminal {', 'text');
    }
    
    findFiles(pattern) {
        if (!pattern) {
            this.addOutputLine('Uso: find [patrón]', 'warning');
            return;
        }
        this.addOutputLine(`Buscando archivos con patrón "${pattern}"...`, 'text');
        this.addOutputLine('./index.html', 'text');
        this.addOutputLine('./script.js', 'text');
        this.addOutputLine('./styles.css', 'text');
    }
    
    showDirectoryTree() {
        this.addOutputLine('.', 'text');
        this.addOutputLine('├── index.html', 'text');
        this.addOutputLine('├── styles.css', 'text');
        this.addOutputLine('├── script.js', 'text');
        this.addOutputLine('├── package.json', 'text');
        this.addOutputLine('└── README.md', 'text');
    }
    
    showDiskUsage() {
        this.addOutputLine('4.0K\t./index.html', 'text');
        this.addOutputLine('8.0K\t./styles.css', 'text');
        this.addOutputLine('12.0K\t./script.js', 'text');
        this.addOutputLine('2.0K\t./package.json', 'text');
        this.addOutputLine('6.0K\t./README.md', 'text');
        this.addOutputLine('32.0K\ttotal', 'text');
    }
    
    showDiskSpace() {
        this.addOutputLine('Filesystem     1K-blocks    Used Available Use% Mounted on', 'text');
        this.addOutputLine('/dev/sda1      104857600  52428800  52428800  50% /', 'text');
    }
    
    showMemoryUsage() {
        this.addOutputLine('              total        used        free      shared  buff/cache   available', 'text');
        this.addOutputLine('Mem:          16384        8192        4096        1024        4096        8192', 'text');
    }
    
    showSystemName() {
        this.addOutputLine('WebTerminal', 'text');
    }
    
    showHostname() {
        this.addOutputLine('terminal-web.local', 'text');
    }
    
    showWhoIsLoggedIn() {
        this.addOutputLine('USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT', 'text');
        this.addOutputLine('terminal pts/0    127.0.0.1        10:00    1:00   0.10s  0.05s -bash', 'text');
    }
    
    showLastLogins() {
        this.addOutputLine('terminal pts/0    127.0.0.1        Mon Oct 30 10:00   still logged in', 'text');
        this.addOutputLine('terminal pts/0    127.0.0.1        Sun Oct 29 15:30 - 18:45  (03:15)', 'text');
    }
    
    cowSay(text) {
        if (!text) text = 'Moo!';
        const cow = [
            ` ${text}`,
            '  < ' + '─'.repeat(text.length) + ' >',
            '     \\   ^__^',
            '      \\  (oo)\\_______',
            '         (__)\\       )\\/\\',
            '             ||----w |',
            '             ||     ||'
        ];
        cow.forEach(line => this.addOutputLine(line, 'text'));
    }
    
    figlet(text) {
        if (!text) text = 'Hello';
        const figletText = [
            ' _    _      _ _         ',
            '| |  | |    | | |        ',
            '| |__| | ___| | | ___    ',
            '|  __  |/ _ \\ | |/ _ \\   ',
            '| |  | |  __/ | | (_) |  ',
            '|_|  |_|\\___|_|_|\\___/   '
        ];
        figletText.forEach(line => this.addOutputLine(line, 'text'));
    }
    
    banner(text) {
        if (!text) text = 'Hello';
        this.addOutputLine('*'.repeat(text.length + 4), 'text');
        this.addOutputLine(`* ${text} *`, 'text');
        this.addOutputLine('*'.repeat(text.length + 4), 'text');
    }
    
    matrixEffect() {
        this.addOutputLine('Iniciando efecto Matrix...', 'text');
        const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        for (let i = 0; i < 10; i++) {
            let line = '';
            for (let j = 0; j < 50; j++) {
                line += matrixChars[Math.floor(Math.random() * matrixChars.length)];
            }
            this.addOutputLine(line, 'success');
        }
    }
    
    rainbowText(text) {
        if (!text) text = 'Rainbow text!';
        const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];
        let rainbowLine = '';
        for (let i = 0; i < text.length; i++) {
            const color = colors[i % colors.length];
            rainbowLine += `<span style="color: ${color}">${text[i]}</span>`;
        }
        this.addOutputLine(rainbowLine, 'text');
    }
    
    showAsciiArt() {
        const art = [
            '    ____  _       __    __     ',
            '   / __ \\(_)___  / /_  / /_  ___',
            '  / /_/ / / __ \\/ __ \\/ __ \\/ _ \\',
            ' / ____/ / /_/ / /_/ / /_/ /  __/',
            '/_/   /_/\\____/_.___/_.___/\\___/ ',
            '',
            'Terminal Web v1.0'
        ];
        art.forEach(line => this.addOutputLine(line, 'success'));
    }
    
    startGame(game) {
        if (!game) {
            this.addOutputLine('Juegos disponibles: snake, tetris, pong', 'text');
            return;
        }
        this.addOutputLine(`Iniciando ${game}... (Simulado)`, 'text');
        this.addOutputLine('Juego iniciado. Usa las flechas para jugar.', 'success');
    }
    
    exitTerminal() {
        this.addOutputLine('Cerrando terminal...', 'text');
        setTimeout(() => {
            this.addOutputLine('¡Gracias por usar Terminal Web!', 'success');
        }, 1000);
    }
    
    // Métodos para el panel de archivos
    initFilesPanel() {
        // Event listeners para el panel
        this.filesTab.addEventListener('click', () => this.toggleFilesPanel());
        this.closePanel.addEventListener('click', () => this.closeFilesPanel());
        
        // Cerrar panel con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.filesPanel.classList.contains('open')) {
                this.closeFilesPanel();
            }
        });
        
        // Agregar archivos de ejemplo
        // this.addExampleFiles(); // Eliminado para que no se muestren archivos ficticios
    }
    
    addExampleFiles() {
        // Limpiar contenido inicial
        this.filesContent.innerHTML = '';
        
        // Agregar archivos de ejemplo
        this.addFileToPanel('foto_aerea_001.jpg', 'image', 'Foto aérea de la costa');
        this.addFileToPanel('grabacion_audio_001.mp3', 'audio', 'Grabación de audio del dron');
        this.addFileToPanel('video_vuelo_001.mp4', 'video', 'Video del vuelo del dron');
        this.addFileToPanel('datos_telemetria.json', 'document', 'Datos de telemetría');
        this.addFileToPanel('mapa_terreno.png', 'image', 'Mapa del terreno escaneado');
    }
    
    toggleFilesPanel() {
        if (this.filesPanel.classList.contains('open')) {
            this.closeFilesPanel();
        } else {
            this.openFilesPanel();
        }
    }
    
    openFilesPanel() {
        this.filesPanel.classList.add('open');
        this.addOutputLine('Panel de archivos abierto', 'success');
    }
    
    closeFilesPanel() {
        this.filesPanel.classList.remove('open');
    }
    
    addFileToPanel(filename, type, description = '') {
        // Crear elemento de archivo
        const fileElement = document.createElement('div');
        fileElement.className = 'file-item';
        fileElement.innerHTML = `
            <div class="file-icon">${this.getIconByType(type)}</div>
            <div class="file-info">
                <div class="file-name">${filename}</div>
                <div class="file-type">${type}</div>
                ${description ? `<div class="file-description">${description}</div>` : ''}
            </div>
            <div class="file-actions">
                <button class="view-file" onclick="terminal.viewFile('${filename}')" title="Ver archivo">🔍</button>
            </div>
        `;
        
        // Agregar al panel
        this.filesContent.appendChild(fileElement);
        
        // Remover mensaje de "no hay archivos" si existe
        const noFiles = this.filesContent.querySelector('.no-files');
        if (noFiles) {
            noFiles.remove();
        }
    }
    
    getIconByType(type) {
        switch (type) {
            case 'image': return '🖼️';
            case 'audio': return '🎵';
            case 'video': return '🎬';
            case 'document': return '📄';
            default: return '📁';
        }
    }
    
    viewFile(filename) {
        this.addOutputLine(`Abriendo archivo: ${filename}`, 'text');
        // Aquí se abriría el archivo en una nueva pestaña
        window.open(`#${filename}`, '_blank');
    }
    
    downloadFile(filename) {
        this.addOutputLine(`Descargando archivo: ${filename}`, 'text');
        // Aquí se descargaría el archivo
    }
    
    droneCommand(args) {
        if (args.length === 0) {
            this.addOutputLine('Uso: drone [comando]', 'warning');
            this.addOutputLine('Comandos disponibles: photo, video, audio, scan, status', 'text');
            return;
        }
        
        const subCommand = args[0].toLowerCase();
        
        switch (subCommand) {
            case 'photo':
                this.capturePhoto();
                break;
            case 'video':
                this.recordVideo();
                break;
            case 'audio':
                this.recordAudio();
                break;
            case 'scan':
                this.scanTerrain();
                break;
            case 'status':
                this.showDroneStatus();
                break;
            default:
                this.addOutputLine(`Comando de dron no reconocido: ${subCommand}`, 'error');
        }
    }
    
    capturePhoto() {
        this.addOutputLine('🚁 Iniciando captura de foto aérea...', 'text');
        setTimeout(() => {
            this.addOutputLine('📸 Foto capturada exitosamente', 'success');
            const filename = `foto_aerea_${Date.now()}.jpg`;
            this.addFileToPanel(filename, 'image', 'Foto aérea capturada por el dron');
            this.addOutputLine(`Archivo guardado: ${filename}`, 'text');
        }, 2000);
    }
    
    recordVideo() {
        this.addOutputLine('🚁 Iniciando grabación de video...', 'text');
        setTimeout(() => {
            this.addOutputLine('🎬 Video grabado exitosamente', 'success');
            const filename = `video_vuelo_${Date.now()}.mp4`;
            this.addFileToPanel(filename, 'video', 'Video del vuelo del dron');
            this.addOutputLine(`Archivo guardado: ${filename}`, 'text');
        }, 3000);
    }
    
    recordAudio() {
        this.addOutputLine('🚁 Iniciando grabación de audio...', 'text');
        setTimeout(() => {
            this.addOutputLine('🎵 Audio grabado exitosamente', 'success');
            const filename = `audio_ambiental_${Date.now()}.mp3`;
            this.addFileToPanel(filename, 'audio', 'Grabación de audio ambiental');
            this.addOutputLine(`Archivo guardado: ${filename}`, 'text');
        }, 2500);
    }
    
    scanTerrain() {
        this.addOutputLine('🚁 Iniciando escaneo del terreno...', 'text');
        setTimeout(() => {
            this.addOutputLine('🗺️ Terreno escaneado exitosamente', 'success');
            const filename = `mapa_terreno_${Date.now()}.png`;
            this.addFileToPanel(filename, 'image', 'Mapa del terreno escaneado');
            this.addOutputLine(`Archivo guardado: ${filename}`, 'text');
        }, 4000);
    }
    
    showDroneStatus() {
        const status = [
            '🚁 Estado del Dron:',
            '  Batería: 87%',
            '  Altitud: 120m',
            '  Velocidad: 15 km/h',
            '  GPS: Conectado',
            '  Cámara: Activa',
            '  Temperatura: 23°C',
            '  Viento: 8 km/h',
            '  Tiempo de vuelo: 45 min'
        ];
        
        status.forEach(line => {
            this.addOutputLine(line, 'text');
        });
    }
    
    showEnvironment() {
        const droneName = config.currentDrone === 'jackson' ? 'Jackson' : 'Johnson';
        const codeInfo = config.currentCode ? `  Código: ${config.currentCode}` : '  Código: No especificado';
        const partidaInfo = config.currentPartidaCode ? `/${config.currentPartidaCode}` : '';
        const fullCodeInfo = codeInfo + partidaInfo;
        
        const envInfo = [
            '🔧 Configuración del Entorno:',
            `  Dron: ${droneName}`,
            fullCodeInfo,
            `  Entorno: ${config.isDevelopment ? 'Desarrollo (Local)' : 'Producción'}`,
            `  API URL: ${config.DRONE_API_URL}`,
            `  Init URL: ${config.INIT_API_URL}`,
            '',
            '📋 Comandos de entorno:',
            '  env         - Muestra esta información',
            '  local       - Cambia a entorno local',
            '  production  - Cambia a entorno de producción',
            '  toggle      - Alterna entre entornos'
        ];
        
        envInfo.forEach(line => {
            this.addOutputLine(line, 'text');
        });
    }
    
    setLocalEnvironment() {
        config.setEnvironment('local');
        this.addOutputLine('✅ Entorno cambiado a: Local', 'success');
        this.addOutputLine(`📡 API URL: ${config.DRONE_API_URL}`, 'text');
    }
    
    setProductionEnvironment() {
        config.setEnvironment('production');
        this.addOutputLine('✅ Entorno cambiado a: Producción', 'success');
        this.addOutputLine(`📡 API URL: ${config.DRONE_API_URL}`, 'text');
    }
    
    toggleEnvironment() {
        config.toggleEnvironment();
        const envName = config.isDevelopment ? 'Local' : 'Producción';
        this.addOutputLine(`🔄 Entorno alternado a: ${envName}`, 'success');
        this.addOutputLine(`📡 API URL: ${config.DRONE_API_URL}`, 'text');
    }
    

    
    // Fetch con timeout
    async fetchWithTimeout(resource, options = {}, timeout = 20000) {
        return Promise.race([
            fetch(resource, options),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), timeout)
            )
        ]);
    }

    async processLLMCommand(command) {
        const maxRetries = 5;
        let retryCount = 0;
        
        const attemptRequest = async () => {
            try {
                // Preparar datos para enviar a la API
                // NOTA: La API solo se usa para enviar comandos, no para recibir respuestas
                // Las respuestas se reciben en tiempo real desde Firebase
                const requestData = {
                    message: command,
                    drone: 'johnson' // Siempre usar Johnson
                };
                // Agregar código de partida si está disponible (mantiene compatibilidad)
                if (config.currentPartidaCode) {
                    requestData.code = config.currentPartidaCode;
                }
                // Agregar versión (código de acceso) si está disponible
                if (config.currentCode) {
                    requestData.version = config.currentCode;
                }

                // Mostrar barra de progreso del timeout
                this.showTimeoutProgressBar();
                
                // Usar fetch con timeout de 70 segundos
                const response = await this.fetchWithTimeout(config.DRONE_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData)
                }, 70000);

                // Ocultar barra de progreso al completar
                this.hideTimeoutProgressBar();

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // La respuesta de la API se ignora ya que los mensajes se actualizan en tiempo real desde Firebase
                // Los mensajes y archivos adjuntos aparecerán automáticamente en tiempo real
                // a través de la suscripción de Firebase

            } catch (error) {
                // Ocultar barra de progreso en caso de error
                this.hideTimeoutProgressBar();
                
                // Determinar si es un error que se puede reintentar
                const isRetryableError = 
                    error.message.includes('500') || 
                    error.message.includes('502') || 
                    error.message.includes('503') || 
                    error.message.includes('504') || 
                    error.message.includes('ECONNRESET') ||
                    error.message.includes('ENOTFOUND') ||
                    error.message.includes('fetch') ||
                    error.message.includes('network') ||
                    error.message.includes('Failed to fetch');
                
                if (error.message === 'timeout') {
                    // Timeout - también reintentar
                    retryCount++;
                    if (retryCount <= maxRetries) {
                        this.addOutputLine(`⏰ Tiempo de espera agotado... Reintentando conectar con Dron Johnson (${retryCount}/${maxRetries})`, 'warning');
                        
                        // Esperar 2 segundos antes de reintentar
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        
                        return await attemptRequest(); // Reintentar
                    } else {
                        this.addOutputLine('❌ Error de conexión persistente con el dron después de 5 intentos', 'error');
                        return false;
                    }
                } else if (isRetryableError) {
                    // Error reintentable
                    retryCount++;
                    if (retryCount <= maxRetries) {
                        this.addOutputLine(`🔌 Conexión perdida... Reintentando conectar con Dron Johnson (${retryCount}/${maxRetries})`, 'warning');
                        
                        // Esperar 2 segundos antes de reintentar
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        
                        return await attemptRequest(); // Reintentar
                    } else {
                        this.addOutputLine('❌ Error de conexión persistente con el dron después de 5 intentos', 'error');
                        return false;
                    }
                } else {
                    // Otros errores HTTP no reintentables
                    console.error('Error al llamar a la API:', error);
                    this.addOutputLine(`❌ Error de conexión con el dron: ${error.message}`, 'error');
                    return false;
                }
            }
        };
        
        // Iniciar el primer intento
        await attemptRequest();
    }
    
    showAttachments(photoUrls) {
        if (!photoUrls || photoUrls.length === 0) return;
        
        // Crear enlaces para cada archivo adjunto
        const attachments = photoUrls.map((url, index) => {
            const fileName = this.getFileNameFromUrl(url);
            const modifiedUrl = this.getModifiedUrl(url);
            return `<a href="${modifiedUrl}" target="_blank" class="attachment-link">${fileName}</a>`;
        }).join(', ');
        
        // Mostrar línea de archivos adjuntos
        this.addOutputLine(`📎 Ficheros adjuntos: ${attachments}`, 'attachments');
        
        // Agregar archivos a la zona de archivos
        this.addFilesToPanel(photoUrls);
    }
    
    getFileNameFromUrl(url) {
        try {
            // Extraer nombre del archivo de la URL
            const urlParts = url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            
            // Si no hay nombre de archivo, usar un nombre genérico
            if (!fileName || fileName.includes('?')) {
                return `archivo_${Date.now()}`;
            }
            
            // Obtener el código de realidad actual (4815 o 1623)
            const realityCode = config.currentCode || '4815';
            
            // Reemplazar extensiones de archivo con sufijo -REALIDAD
            const supportedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'mp3', 'wav', 'ogg', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'rar', '7z'];
            
            let modifiedFileName = fileName;
            
            // Buscar y reemplazar cada extensión soportada
            supportedExtensions.forEach(ext => {
                const regex = new RegExp(`\\.${ext}$`, 'i');
                if (regex.test(modifiedFileName)) {
                    modifiedFileName = modifiedFileName.replace(regex, `-${realityCode}.${ext}`);
                    return; // Salir del forEach una vez que se encuentre una extensión
                }
            });
            
            return modifiedFileName;
        } catch (error) {
            return `archivo_${Date.now()}`;
        }
    }

    getModifiedUrl(url) {
        try {
            // Obtener el código de realidad actual (4815 o 1623)
            const realityCode = config.currentCode || '4815';
            
            // Reemplazar extensiones de archivo con sufijo -REALIDAD en la URL
            const supportedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'mp3', 'wav', 'ogg', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'rar', '7z'];
            
            let modifiedUrl = url;
            
            // Buscar y reemplazar cada extensión soportada
            supportedExtensions.forEach(ext => {
                const regex = new RegExp(`\\.${ext}$`, 'i');
                if (regex.test(modifiedUrl)) {
                    modifiedUrl = modifiedUrl.replace(regex, `-${realityCode}.${ext}`);
                    return; // Salir del forEach una vez que se encuentre una extensión
                }
            });
            
            return modifiedUrl;
        } catch (error) {
            return url; // Si hay error, devolver la URL original
        }
    }
    
    addFilesToPanel(photoUrls) {
        if (!photoUrls || photoUrls.length === 0) return;
        
        const filesContent = document.getElementById('filesContent');
        const noFilesDiv = filesContent.querySelector('.no-files');
        
        // Remover mensaje de "no hay archivos" si existe
        if (noFilesDiv) {
            noFilesDiv.remove();
        }
        
        photoUrls.forEach(url => {
            const fileName = this.getFileNameFromUrl(url);
            const modifiedUrl = this.getModifiedUrl(url);
            
            // Verificar si el archivo ya existe
            const existingFile = filesContent.querySelector(`[data-url="${url}"]`);
            if (existingFile) {
                return; // Archivo ya existe, no agregar
            }
            
            // Crear elemento del archivo
            const fileElement = document.createElement('div');
            fileElement.className = 'file-item';
            fileElement.setAttribute('data-url', url);
            
            // Determinar icono según extensión
            const fileIcon = this.getFileIcon(fileName);
            
            fileElement.innerHTML = `
                <div class="file-icon">${fileIcon}</div>
                <div class="file-info">
                    <div class="file-name">${fileName}</div>
                    <div class="file-url">${modifiedUrl}</div>
                </div>
                <div class="file-actions">
                    <a href="${modifiedUrl}" target="_blank" class="file-download" title="Abrir archivo">
                        <span>📤</span>
                    </a>
                </div>
            `;
            
            // Agregar al final de la lista
            filesContent.appendChild(fileElement);
        });
    }
    
    getFileIcon(fileName) {
        const extension = fileName.split('.').pop()?.toLowerCase();
        
        switch (extension) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                return '🖼️';
            case 'pdf':
                return '📄';
            case 'doc':
            case 'docx':
                return '📝';
            case 'xls':
            case 'xlsx':
                return '📊';
            case 'txt':
                return '📃';
            case 'zip':
            case 'rar':
            case '7z':
                return '📦';
            case 'mp4':
            case 'avi':
            case 'mov':
                return '🎥';
            case 'mp3':
            case 'wav':
            case 'ogg':
                return '🎵';
            default:
                return '📎';
        }
    }
    
    clearFilesPanel() {
        const filesContent = document.getElementById('filesContent');
        
        // Limpiar todo el contenido
        filesContent.innerHTML = `
            <div class="no-files">
                <p>📁 No hay archivos descargados</p>
                <p>Usa comandos del dron para capturar contenido</p>
            </div>
        `;
    }
    
    // Función para actualizar la terminal con mensajes en tiempo real
    updateTerminalWithMessages(messages) {
        if (!messages || !Array.isArray(messages)) return;
        
        // Limpiar el output actual
        this.output.innerHTML = '';
        
        // Mostrar mensaje de bienvenida
        this.updateWelcomeMessage(config.currentTheme);
        
        // Mostrar mensaje de conexión
        this.addOutputLine(`Conectando a dron@johnson...`, 'text');
        this.addOutputLine('', 'text');
        
        // Mostrar mensajes del historial
        messages.forEach(messageObj => {
            try {
                // Extraer el contenido del mensaje según su estructura
                if (messageObj.user === 'player') {
                    // Mensaje del usuario
                    this.addOutputLine(`$ ${messageObj.message}`, 'command-executed');
                } else if (messageObj.user === 'drone') {
                    // Mensaje del dron
                    this.addOutputLine(`🚁 Dron Johnson:`, 'drone-response');
                    this.addOutputLine(messageObj.message, 'drone-message');
                    
                    // Mostrar archivos adjuntos si existen
                    if (messageObj.photoUrls && Array.isArray(messageObj.photoUrls) && messageObj.photoUrls.length > 0) {
                        this.showAttachments(messageObj.photoUrls);
                    }
                } else {
                    // Mensaje genérico (fallback)
                    this.addOutputLine(messageObj.message || messageObj, 'text');
                }
            } catch (error) {
                // Error silencioso al procesar mensaje individual
            }
        });
        
        // Scroll al final
        this.scrollToBottom();
    }

    showInputSpinner() {
        // Evitar duplicados
        if (document.getElementById('terminalInputSpinner')) return;
        const spinner = document.createElement('span');
        spinner.id = 'terminalInputSpinner';
        spinner.className = 'terminal-input-spinner';
        // Insertar después del input
        this.input.parentNode.appendChild(spinner);
    }

    hideInputSpinner() {
        const spinner = document.getElementById('terminalInputSpinner');
        if (spinner) spinner.remove();
    }
    
    showTimeoutProgressBar() {
        // Aplicar la clase de progreso al input
        this.input.classList.add('timeout-progress-active');
        
        // Iniciar la animación de la barra
        this.startTimeoutProgressAnimation();
    }
    
    hideTimeoutProgressBar() {
        // Remover la clase de progreso del input
        this.input.classList.remove('timeout-progress-active');
        
        // Limpiar el intervalo si existe
        if (this._timeoutProgressInterval) {
            clearInterval(this._timeoutProgressInterval);
            this._timeoutProgressInterval = null;
        }
    }
    
    startTimeoutProgressAnimation() {
        const totalTime = 70; // segundos
        const updateInterval = 100; // actualizar cada 100ms para suavidad
        let elapsedTime = 0;
        
        this._timeoutProgressInterval = setInterval(() => {
            elapsedTime += updateInterval / 1000; // convertir a segundos
            const progress = (elapsedTime / totalTime) * 100;
            
            // Actualizar el CSS custom property para el progreso
            this.input.style.setProperty('--timeout-progress', `${progress}%`);
            
            // Detener cuando se complete
            if (elapsedTime >= totalTime) {
                clearInterval(this._timeoutProgressInterval);
                this._timeoutProgressInterval = null;
            }
        }, updateInterval);
    }

    initResetButton() {
        const resetButton = document.getElementById('resetButton');
        if (resetButton) {
            // Solo mostrar el botón si la URL contiene "admin"
            const url = window.location.href;
            if (url.includes('admin')) {
                resetButton.style.display = 'flex';
                resetButton.addEventListener('click', () => this.performReset());
            } else {
                resetButton.style.display = 'none';
            }
        }
    }

    async performReset() {
        try {
            // Mostrar confirmación
            const confirmed = confirm('¿Estás seguro de que quieres resetear el juego? Esto eliminará todas las conversaciones y archivos.');
            
            if (!confirmed) {
                return;
            }

            // Mostrar mensaje de reset
            this.addOutputLine('🔄 Iniciando reset del sistema...', 'text');
            
            // Construir URL del endpoint de reset
            const resetUrl = `${config.DRONE_API_URL.replace('/multiscapes', '/multiscapesReset')}`;
            
            // Llamar al endpoint de reset con el código en el body
            const response = await fetch(resetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: config.currentPartidaCode || 'test-game'
                })
            });

            if (!response.ok) {
                throw new Error(`Error en reset: ${response.status}`);
            }

            const result = await response.json();
            
            // Mostrar resultado
            this.addOutputLine('✅ Reset completado exitosamente', 'success');
            this.addOutputLine('Sistema reiniciado. Todas las conversaciones han sido eliminadas.', 'text');
            
            // Limpiar panel de archivos
            this.clearFilesPanel();
            
            // Limpiar historial de comandos
            this.commandHistory = [];
            this.historyIndex = -1;
            
            // Mostrar mensaje de bienvenida
            this.addOutputLine('', 'text');
            this.updateWelcomeMessage(config.currentTheme);
            
        } catch (error) {
            console.error('Error durante el reset:', error);
            this.addOutputLine('❌ Error durante el reset: ' + error.message, 'error');
        }
    }
}

import config from './config.js';
import { subscribeToMessageCount, subscribeToGameDocument } from './firebase.js';

// Helper attached to Terminal prototype to manage subscription
Terminal.prototype.initMessageCountSubscription = async function() {
    const gameCode = config.currentPartidaCode;
    const titleElement = document.getElementById('terminalTitle');
    const countSpan = document.getElementById('messageCount');
    
    if (!titleElement) {
        console.warn('⚠️ Elemento terminalTitle no encontrado');
        return;
    }
    
    // Limpiar suscripciones anteriores si existen
    if (this._unsubscribeMessageCount) {
        try { 
            this._unsubscribeMessageCount(); 
        } catch(e) {
            // Error silencioso al cancelar suscripción
        }
        this._unsubscribeMessageCount = null;
    }
    
    if (this._unsubscribeGameDocument) {
        try { 
            this._unsubscribeGameDocument(); 
        } catch(e) {
            // Error silencioso al cancelar suscripción
        }
        this._unsubscribeGameDocument = null;
    }
    
    if (!gameCode) {
        // Clear count if no game code
        if (countSpan) countSpan.textContent = '';
        titleElement.textContent = titleElement.dataset.baseTitle || titleElement.textContent;
        return;
    }
    
    try {
        // Crear suscripción con callback para mensajes
        this._unsubscribeMessageCount = subscribeToMessageCount(
            gameCode, 
            // Callback para el contador
            (count) => {
                try {
                    const base = titleElement.dataset.baseTitle || titleElement.textContent;
                    
                    // Ensure base title with span is rendered
                    if (!document.getElementById('messageCount')) {
                        titleElement.innerHTML = `${base} <span id="messageCount" style="opacity:0.8; font-weight:600;"></span>`;
                    }
                    
                    const liveCountSpan = document.getElementById('messageCount');
                    if (liveCountSpan) {
                        liveCountSpan.textContent = typeof count === 'number' ? ` [${count}]` : '';
                    } else {
                        titleElement.textContent = base + (typeof count === 'number' ? ` [${count}]` : '');
                    }
                } catch (error) {
                    // Error silencioso al actualizar contador
                }
            },
            // Callback para los mensajes
            (messages) => {
                this.updateTerminalWithMessages(messages);
            }
        );
        
        // Crear suscripción para actualizaciones de ubicación
        this._unsubscribeGameDocument = subscribeToGameDocument(
            gameCode,
            (roomTitle) => {
                this.updateCurrentRoom(roomTitle);
            }
        );
        
    } catch (error) {
        // Error silencioso al inicializar suscripción
    }
};

// Inicializar terminal cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.terminal = new Terminal();
    window.config = config; // Hacer config disponible globalmente
});

// Mantener el foco en el input cuando se hace clic en cualquier parte
document.addEventListener('click', () => {
    document.getElementById('terminalInput').focus();
}); 