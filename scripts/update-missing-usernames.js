
const { createClient } = require('@supabase/supabase-js');

// Inicializar cliente Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateMissingUsernames() {
  try {
    // Buscar perfis sem username
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .is('username', null);
      
    if (error) {
      throw error;
    }
    
    console.log(`Encontrados ${data.length} perfis sem username`);
    
    // Atualizar cada perfil
    for (const profile of data) {
      let username = null;
      
      // Tentar extrair do full_name
      if (profile.full_name) {
        const nameParts = profile.full_name.split(' ');
        if (nameParts.length > 0) {
          // Gerar username a partir do primeiro nome + número aleatório
          username = nameParts[0].toLowerCase() + Math.floor(Math.random() * 1000);
          console.log(`Gerado username ${username} para ${profile.full_name}`);
        }
      } 
      // Se não tiver full_name, usar display_name ou email
      else if (profile.display_name) {
        username = profile.display_name.toLowerCase().replace(/s+/g, '_') + Math.floor(Math.random() * 100);
      } else if (profile.email) {
        // Extrair parte antes do @ do email
        const emailPart = profile.email.split('@')[0];
        username = emailPart + Math.floor(Math.random() * 100);
      }
      
      // Se gerou um username, atualizar o perfil
      if (username) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            username,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);
          
        if (updateError) {
          console.error(`Erro ao atualizar perfil ${profile.id}: ${updateError.message}`);
        } else {
          console.log(`Perfil ${profile.id} atualizado com username: ${username}`);
        }
      }
    }
    
    console.log('Processo de atualização de usernames concluído!');
  } catch (error) {
    console.error('Erro ao atualizar usernames:', error);
  }
}

// Executar a função
updateMissingUsernames().then(() => {
  console.log('Script finalizado');
}).catch(err => {
  console.error('Erro fatal no script:', err);
});
