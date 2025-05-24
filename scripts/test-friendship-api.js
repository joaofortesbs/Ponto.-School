
const fetch = require('node-fetch');
require('dotenv').config();

// Esse script simula chamadas à API para teste
const testFriendshipAPI = async () => {
  const baseUrl = 'http://localhost:3000';
  let token = 'seu_token_jwt'; // Substitua por um token JWT válido do Supabase
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  try {
    console.log('Testando API de amizades...');
    
    // Teste 1: Buscar usuários
    console.log('\n1. Testando busca de usuários:');
    const searchResponse = await fetch(`${baseUrl}/api/search-users?query=maria`, { headers });
    const searchData = await searchResponse.json();
    console.log('Resposta da busca:', searchData);
    
    // Teste 2: Verificar solicitações pendentes
    console.log('\n2. Testando contagem de solicitações pendentes:');
    const checkResponse = await fetch(`${baseUrl}/api/check-requests`, { headers });
    const checkData = await checkResponse.json();
    console.log('Contagem de solicitações:', checkData);
    
    // Teste 3: Listar solicitações pendentes
    console.log('\n3. Testando listagem de solicitações pendentes:');
    const requestsResponse = await fetch(`${baseUrl}/api/get-requests`, { headers });
    const requestsData = await requestsResponse.json();
    console.log('Solicitações pendentes:', requestsData);
    
    // Teste 4: Listar amigos
    console.log('\n4. Testando listagem de amigos:');
    const friendsResponse = await fetch(`${baseUrl}/api/friends`, { headers });
    const friendsData = await friendsResponse.json();
    console.log('Amigos:', friendsData);
    
    console.log('\nTodos os testes concluídos!');
    
  } catch (error) {
    console.error('Erro durante os testes:', error);
  }
};

console.log('Este script é apenas para referência. Você precisará modificá-lo para usar um JWT válido.');
console.log('Execute manualmente após iniciar o servidor com o comando: node scripts/test-friendship-api.js');
// Descomente a linha abaixo para executar os testes
// testFriendshipAPI();
