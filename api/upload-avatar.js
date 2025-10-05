import express from 'express';
import multer from 'multer';
import neonDBModule from './neon-db.js';

const { neonDB } = neonDBModule;
const router = express.Router();

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

// Rota de upload - Salva imagem como Base64 no banco Neon
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
    console.log('📦 Tamanho do arquivo:', file.size, 'bytes');
    console.log('🖼️ Tipo MIME:', file.mimetype);

    // Converter imagem para Base64
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    console.log('✅ Imagem convertida para Base64');

    // Atualizar banco Neon com a imagem Base64
    const updateQuery = `
      UPDATE usuarios 
      SET imagem_avatar = $1, updated_at = NOW()
      WHERE email = $2
      RETURNING id, nome_completo, email, imagem_avatar
    `;

    const neonResult = await neonDB.executeQuery(updateQuery, [base64Image, email]);

    if (!neonResult.success || neonResult.data.length === 0) {
      console.error('❌ Erro ao atualizar perfil no Neon:', neonResult.error);
      throw new Error('Erro ao atualizar perfil no banco Neon');
    }

    console.log('✅ Avatar salvo com sucesso no banco Neon');

    res.json({
      success: true,
      avatar_url: base64Image,
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