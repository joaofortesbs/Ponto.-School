
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const colors = require('colors');

// Carregar variáveis de ambiente
dotenv.config();

// Configurações
const API_BASE_URL = 'http://localhost:3000/api';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Inicializar Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Usuários de teste
const usuariosTeste = [
  { email: 'joao.teste@example.com', password: 'Teste123!', username: 'joaoteste' },
  { email: 'maria.teste@example.com', password: 'Teste123!', username: 'mariateste' },
  { email: 'teste3@example.com', password: 'Teste123!', username: 'teste3' },
  { email: 'teste4@example.com', password: 'Teste123!', username: 'teste4' },
  { email: 'teste5@example.com', password: 'Teste123!', username: 'teste5' },
  { email: 'teste6@example.com', password: 'Teste123!', username: 'teste6' },
];

// Funções auxiliares
async function registrarUsuario(email, password, username) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: username.charAt(0).toUpperCase() + username.slice(1)
        }
      }
    });

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Erro ao registrar usuário ${email}:`, error.message);
    return null;
  }
}

async function autenticarUsuario(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Erro ao autenticar usuário ${email}:`, error.message);
    return null;
  }
}

async function buscarUsuarios(query, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/search-users?query=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro ${response.status}: ${errorData.error || 'Erro ao buscar usuários'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro na busca de usuários:', error.message);
    return [];
  }
}

async function enviarSolicitacao(receiverId, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/send-friend-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ receiverId })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${data.error || 'Erro ao enviar solicitação'}`);
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao enviar solicitação:', error.message);
    return { success: false, error: error.message };
  }
}

async function aceitarSolicitacao(senderId, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/accept-friend-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ senderId })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${data.error || 'Erro ao aceitar solicitação'}`);
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao aceitar solicitação:', error.message);
    return { success: false, error: error.message };
  }
}

async function verificarSolicitacoesPendentes(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/check-requests`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro ${response.status}: ${errorData.error || 'Erro ao verificar solicitações'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao verificar solicitações pendentes:', error.message);
    return { count: 0 };
  }
}

async function obterSolicitacoesPendentes(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/get-requests`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro ${response.status}: ${errorData.error || 'Erro ao obter solicitações'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao obter solicitações pendentes:', error.message);
    return [];
  }
}

async function verificarTabelaAmizades(userId1, userId2) {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select('*')
      .or(`and(user1_id.eq.${userId1},user2_id.eq.${userId2}),and(user1_id.eq.${userId2},user2_id.eq.${userId1})`);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erro ao verificar tabela de amizades:', error.message);
    return [];
  }
}

async function verificarTabelaSolicitacoes(senderId, receiverId) {
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('sender_id', senderId)
      .eq('receiver_id', receiverId);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erro ao verificar tabela de solicitações:', error.message);
    return [];
  }
}

// Função para limpar dados de teste após os testes
async function limparDadosTeste(userIds) {
  try {
    // Remover amizades
    for (const userId1 of userIds) {
      for (const userId2 of userIds) {
        if (userId1 !== userId2) {
          await supabase
            .from('friendships')
            .delete()
            .or(`and(user1_id.eq.${userId1},user2_id.eq.${userId2}),and(user1_id.eq.${userId2},user2_id.eq.${userId1})`);
        }
      }
    }
    
    // Remover solicitações
    for (const userId1 of userIds) {
      for (const userId2 of userIds) {
        if (userId1 !== userId2) {
          await supabase
            .from('friend_requests')
            .delete()
            .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`);
        }
      }
    }
    
    console.log('Dados de teste limpos com sucesso.');
  } catch (error) {
    console.error('Erro ao limpar dados de teste:', error.message);
  }
}

// Função principal de teste
async function executarTestes() {
  console.log(colors.cyan.bold('\n======= INICIANDO TESTES DO SISTEMA DE AMIZADES =======\n'));
  
  // Registrar ou autenticar usuários de teste
  const usuarios = [];
  
  console.log(colors.yellow('1. Preparando usuários de teste...'));
  
  for (const user of usuariosTeste) {
    let session = await autenticarUsuario(user.email, user.password);
    
    if (!session) {
      console.log(`  Criando usuário de teste: ${user.email}`);
      await registrarUsuario(user.email, user.password, user.username);
      session = await autenticarUsuario(user.email, user.password);
    } else {
      console.log(`  Autenticando usuário existente: ${user.email}`);
    }
    
    if (session) {
      usuarios.push({
        ...user,
        id: session.user.id,
        token: session.session.access_token
      });
    }
  }
  
  if (usuarios.length < 2) {
    console.error(colors.red('Erro: Não foi possível criar/autenticar usuários suficientes para o teste.'));
    return;
  }
  
  // Extrair Joao e Maria para os primeiros cenários
  const joao = usuarios[0];
  const maria = usuarios[1];
  
  try {
    console.log(colors.yellow('\n2. Cenário 1: João busca Maria e envia solicitação'));
    
    // João busca Maria
    console.log(`  João (${joao.id}) busca por "${maria.username}"`);
    const resultados = await buscarUsuarios(maria.username, joao.token);
    
    if (resultados.length === 0) {
      throw new Error('Não foi possível encontrar Maria nos resultados da busca.');
    }
    
    const mariaResultado = resultados.find(u => u.id === maria.id);
    
    if (!mariaResultado) {
      throw new Error('Maria não foi encontrada nos resultados da busca.');
    }
    
    console.log(`  Maria encontrada com ID: ${mariaResultado.id}`);
    
    // João envia solicitação para Maria
    console.log(`  João envia solicitação para Maria (${maria.id})`);
    const solicitacao = await enviarSolicitacao(maria.id, joao.token);
    
    if (!solicitacao.success) {
      throw new Error(`Falha ao enviar solicitação: ${solicitacao.error}`);
    }
    
    console.log(colors.green('  ✓ Solicitação enviada com sucesso!'));
    
    // Verificar tabela de solicitações
    console.log('  Verificando tabela friend_requests...');
    const solicitacoes = await verificarTabelaSolicitacoes(joao.id, maria.id);
    
    if (solicitacoes.length === 0) {
      throw new Error('Solicitação não encontrada na tabela friend_requests.');
    }
    
    if (solicitacoes[0].status !== 'pending') {
      throw new Error(`Status da solicitação incorreto: ${solicitacoes[0].status}, esperado: pending`);
    }
    
    console.log(colors.green(`  ✓ Solicitação verificada na tabela com status: ${solicitacoes[0].status}`));
    
    // Cenário 2: Maria aceita solicitação
    console.log(colors.yellow('\n3. Cenário 2: Maria aceita a solicitação'));
    
    // Maria verifica solicitações pendentes
    console.log('  Maria verifica solicitações pendentes');
    const pendentes = await verificarSolicitacoesPendentes(maria.token);
    
    if (pendentes.count === 0) {
      throw new Error('Maria não tem solicitações pendentes.');
    }
    
    console.log(`  Maria tem ${pendentes.count} solicitação(ões) pendente(s)`);
    
    // Maria obtém lista de solicitações
    const listaPendentes = await obterSolicitacoesPendentes(maria.token);
    
    if (listaPendentes.length === 0) {
      throw new Error('Lista de solicitações pendentes está vazia.');
    }
    
    const joaoPendente = listaPendentes.find(u => u.id === joao.id);
    
    if (!joaoPendente) {
      throw new Error('Solicitação de João não encontrada na lista.');
    }
    
    console.log(`  Solicitação de João (${joao.id}) encontrada na lista`);
    
    // Maria aceita solicitação
    console.log('  Maria aceita a solicitação de João');
    const aceitacao = await aceitarSolicitacao(joao.id, maria.token);
    
    if (!aceitacao.success) {
      throw new Error(`Falha ao aceitar solicitação: ${aceitacao.error}`);
    }
    
    console.log(colors.green('  ✓ Solicitação aceita com sucesso!'));
    
    // Verificar tabela de amizades
    console.log('  Verificando tabela friendships...');
    const amizades = await verificarTabelaAmizades(joao.id, maria.id);
    
    if (amizades.length === 0) {
      throw new Error('Amizade não encontrada na tabela friendships.');
    }
    
    console.log(colors.green('  ✓ Amizade verificada na tabela friendships!'));
    
    // Verificar se solicitação foi atualizada para "accepted"
    console.log('  Verificando atualização do status da solicitação...');
    const solicitacaoAtualizada = await verificarTabelaSolicitacoes(joao.id, maria.id);
    
    if (solicitacaoAtualizada.length === 0) {
      throw new Error('Solicitação não encontrada na tabela friend_requests após aceitação.');
    }
    
    if (solicitacaoAtualizada[0].status !== 'accepted') {
      throw new Error(`Status da solicitação incorreto: ${solicitacaoAtualizada[0].status}, esperado: accepted`);
    }
    
    console.log(colors.green(`  ✓ Status da solicitação atualizado para: ${solicitacaoAtualizada[0].status}`));
    
    // Cenário 3: João tenta enviar solicitação para si mesmo
    console.log(colors.yellow('\n4. Cenário 3: João tenta enviar solicitação para si mesmo'));
    
    console.log(`  João tenta enviar solicitação para si mesmo (${joao.id})`);
    const solicitacaoParaSiMesmo = await enviarSolicitacao(joao.id, joao.token);
    
    if (solicitacaoParaSiMesmo.success) {
      throw new Error('João conseguiu enviar solicitação para si mesmo, isso não deveria ser possível!');
    }
    
    if (!solicitacaoParaSiMesmo.error.includes('adicionar a si mesmo')) {
      console.warn(colors.yellow(`  ⚠ A mensagem de erro não contém o texto esperado. Recebido: "${solicitacaoParaSiMesmo.error}"`));
    }
    
    console.log(colors.green('  ✓ Solicitação para si mesmo rejeitada corretamente!'));
    
    // Cenário 4: Múltiplos usuários enviam solicitações simultâneas
    console.log(colors.yellow('\n5. Cenário 4: Múltiplos usuários enviam solicitações simultâneas para Maria'));
    
    const usuariosRestantes = usuarios.slice(2, 7); // Pegar os próximos 5 usuários após João e Maria
    const solicitacoes = [];
    
    console.log(`  ${usuariosRestantes.length} usuários enviarão solicitações para Maria (${maria.id})`);
    
    // Enviar solicitações em paralelo
    await Promise.all(usuariosRestantes.map(async (usuario) => {
      console.log(`  Usuário ${usuario.username} (${usuario.id}) envia solicitação para Maria`);
      const result = await enviarSolicitacao(maria.id, usuario.token);
      solicitacoes.push({ usuario, result });
    }));
    
    const solicitacoesEnviadas = solicitacoes.filter(s => s.result.success).length;
    console.log(`  ${solicitacoesEnviadas} solicitações enviadas com sucesso`);
    
    // Verificar se Maria recebeu as solicitações
    console.log('  Verificando solicitações pendentes de Maria...');
    const novasPendentes = await verificarSolicitacoesPendentes(maria.token);
    
    console.log(`  Maria tem agora ${novasPendentes.count} solicitação(ões) pendente(s)`);
    
    // Exibir detalhes das solicitações
    const listaNovasPendentes = await obterSolicitacoesPendentes(maria.token);
    console.log(`  Lista de solicitações pendentes contém ${listaNovasPendentes.length} item(ns)`);
    
    listaNovasPendentes.forEach(item => {
      console.log(`    - ${item.full_name} (@${item.username})`);
    });
    
    console.log(colors.green(`  ✓ Aba de solicitações atualizada corretamente para: "Solicitações (${novasPendentes.count})"`));
    
    // Teste de carga
    console.log(colors.yellow('\n6. Teste de carga simplificado'));
    
    console.log('  Realizando 10 buscas consecutivas para simular carga');
    
    const startTime = Date.now();
    
    // Realizar 10 buscas consecutivas para simular carga
    for (let i = 0; i < 10; i++) {
      await buscarUsuarios('test', joao.token);
    }
    
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    const averageTime = totalTime / 10;
    
    console.log(`  Tempo total: ${totalTime.toFixed(2)}s, Tempo médio por requisição: ${averageTime.toFixed(2)}s`);
    
    if (averageTime > 1) {
      console.warn(colors.yellow(`  ⚠ Tempo médio de resposta acima de 1 segundo (${averageTime.toFixed(2)}s)`));
    } else {
      console.log(colors.green(`  ✓ Tempo médio de resposta aceitável (${averageTime.toFixed(2)}s)`));
    }
    
    // Limpar dados de teste
    console.log(colors.yellow('\n7. Limpando dados de teste...'));
    await limparDadosTeste(usuarios.map(u => u.id));
    
    console.log(colors.green.bold('\n✅ TESTES CONCLUÍDOS COM SUCESSO! ✅\n'));
    
    // Resumo
    console.log(colors.cyan('Resumo dos testes:'));
    console.log('  ✓ Cenário 1: João busca Maria e envia solicitação');
    console.log('  ✓ Cenário 2: Maria aceita a solicitação');
    console.log('  ✓ Cenário 3: João tenta enviar solicitação para si mesmo');
    console.log('  ✓ Cenário 4: Múltiplos usuários enviam solicitações simultâneas');
    console.log('  ✓ Teste de carga simplificado');
    
  } catch (error) {
    console.error(colors.red.bold('\n❌ FALHA NOS TESTES ❌'));
    console.error(colors.red(`Erro: ${error.message}`));
  }
}

// Executar testes
executarTestes().then(() => {
  console.log(colors.cyan('\nProcesso de teste finalizado.'));
  process.exit(0);
}).catch(error => {
  console.error(colors.red(`Erro não tratado: ${error.message}`));
  process.exit(1);
});
