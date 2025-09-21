
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🚀 Iniciando Plataforma Ponto.School...');
console.log('======================================');

// Função para verificar se uma porta está ocupada
async function checkPort(port) {
  try {
    const { stdout } = await execAsync(`lsof -ti:${port}`);
    return stdout.trim() !== '';
  } catch (error) {
    return false;
  }
}

// Função para aguardar o backend estar rodando
async function waitForBackend() {
  const maxAttempts = 30;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const { stdout } = await execAsync('curl -s http://0.0.0.0:3001/api/status');
      if (stdout.includes('funcionando')) {
        console.log('✅ Backend está respondendo!');
        return true;
      }
    } catch (error) {
      // Backend ainda não está pronto
    }
    
    attempts++;
    console.log(`⏳ Aguardando backend... (${attempts}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('Backend não respondeu a tempo');
}

async function startPlatform() {
  try {
    // Verificar se as portas estão livres
    console.log('🔍 Verificando portas...');
    
    const backendRunning = await checkPort(3001);
    const frontendRunning = await checkPort(5000);
    
    if (backendRunning) {
      console.log('⚠️ Backend já está rodando na porta 3001');
    }
    
    if (frontendRunning) {
      console.log('⚠️ Frontend já está rodando na porta 5000');
    }

    // Iniciar backend se não estiver rodando
    if (!backendRunning) {
      console.log('🔧 Iniciando servidor backend...');
      const backendProcess = spawn('node', ['api/server.js'], {
        stdio: 'pipe',
        detached: false
      });

      backendProcess.stdout.on('data', (data) => {
        console.log(`[Backend] ${data.toString().trim()}`);
      });

      backendProcess.stderr.on('data', (data) => {
        console.error(`[Backend Error] ${data.toString().trim()}`);
      });

      // Aguardar backend estar pronto
      await waitForBackend();
    }

    // Iniciar frontend se não estiver rodando
    if (!frontendRunning) {
      console.log('🎨 Iniciando servidor frontend...');
      const frontendProcess = spawn('npm', ['run', 'dev'], {
        stdio: 'pipe',
        detached: false
      });

      frontendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[Frontend] ${output.trim()}`);
        
        // Detectar quando o frontend está pronto
        if (output.includes('Local:') && output.includes('5000')) {
          console.log('✅ Frontend está rodando!');
          console.log('🎉 Plataforma inicializada com sucesso!');
          console.log('📱 Acesse: http://localhost:5000');
          console.log('🔧 API: http://localhost:3001');
        }
      });

      frontendProcess.stderr.on('data', (data) => {
        console.error(`[Frontend Error] ${data.toString().trim()}`);
      });

      // Manter o processo vivo
      process.on('SIGINT', () => {
        console.log('\n🛑 Encerrando plataforma...');
        frontendProcess.kill();
        process.exit(0);
      });
    } else {
      console.log('✅ Plataforma já está rodando!');
      console.log('📱 Frontend: http://localhost:5000');
      console.log('🔧 API: http://localhost:3001');
    }

  } catch (error) {
    console.error('❌ Erro ao inicializar plataforma:', error.message);
    process.exit(1);
  }
}

startPlatform();
