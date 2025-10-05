
import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import neonDBModule from './neon-db.js';

const { neonDB } = neonDBModule;
const router = express.Router();

// Configurar Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://zwmznopdzujcxzujijge.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bXpub3BkenVqY3h6dWppamdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNjM3NjgsImV4cCI6MjA1NTkzOTc2OH0.CiihfkrmPoyiE0R_nFONFHYgwIbq8BaNcYNEavQKRK8'
);

// Configurar multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Apenas imagens são permitidas'));
      return;
    }
    cb(null, true);
  },
});

// Rota de upload
router.post('/', upload.single('avatar'), async (req, res) => {
  try {
    const { email } = req.body;
    const file = req.file;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email é obrigatório',
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo foi enviado',
      });
    }

    console.log('📤 Upload de avatar recebido para:', email);

    // Gerar nome único para o arquivo
    const fileExt = file.originalname.split('.').pop();
    const fileName = `avatar-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload para Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('❌ Erro no upload para Storage:', uploadError);
      throw new Error(uploadError.message);
    }

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Não foi possível obter URL pública');
    }

    const avatarUrl = publicUrlData.publicUrl;
    console.log('✅ Arquivo salvo no Storage:', avatarUrl);

    // Atualizar banco Neon
    const updateQuery = `
      UPDATE usuarios 
      SET imagem_avatar = $1, updated_at = NOW()
      WHERE email = $2
      RETURNING id, nome_completo, email, imagem_avatar
    `;

    const neonResult = await neonDB.executeQuery(updateQuery, [avatarUrl, email]);

    if (!neonResult.success || neonResult.data.length === 0) {
      throw new Error('Erro ao atualizar perfil no banco Neon');
    }

    console.log('✅ Perfil atualizado no Neon:', neonResult.data[0]);

    res.json({
      success: true,
      avatar_url: avatarUrl,
      profile: neonResult.data[0],
    });

  } catch (error) {
    console.error('❌ Erro no upload de avatar:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao fazer upload',
    });
  }
});

export default router;
