/**
 * DATA VALIDATION SERVICE - CAMADA ANTI-ALUCINAÇÃO
 * 
 * Garante que dados existem ANTES de qualquer capability processar.
 * Princípio: NUNCA gerar resposta antes de validar dados.
 */

export interface ValidationResult<T> {
  exists: boolean;
  count: number;
  data: T | null;
  isEmpty: boolean;
  errors?: string[];
  validatedAt: number;
  source: string;
}

export interface TurmaValidation {
  id: string;
  nome: string;
  alunos?: number;
  nivel?: string;
  disciplina?: string;
}

export interface AtividadeValidation {
  id: string;
  nome: string;
  tipo: string;
  disciplina?: string;
}

export interface UserContextValidation {
  turmas: ValidationResult<TurmaValidation[]>;
  atividades: ValidationResult<AtividadeValidation[]>;
  disciplinas: ValidationResult<string[]>;
  hasAnyData: boolean;
  missingData: string[];
}

class DataValidationService {
  private cache: Map<string, { result: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 30000;

  async validateTurmas(userId: string): Promise<ValidationResult<TurmaValidation[]>> {
    const cacheKey = `turmas_${userId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`/api/turmas?userId=${userId}`);
      
      if (!response.ok) {
        return this.createEmptyResult<TurmaValidation[]>('turmas', ['Erro ao consultar turmas']);
      }

      const turmas = await response.json();
      const result: ValidationResult<TurmaValidation[]> = {
        exists: Array.isArray(turmas) && turmas.length > 0,
        count: Array.isArray(turmas) ? turmas.length : 0,
        data: Array.isArray(turmas) && turmas.length > 0 ? turmas : null,
        isEmpty: !Array.isArray(turmas) || turmas.length === 0,
        validatedAt: Date.now(),
        source: 'turmas',
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.warn('⚠️ [DataValidation] Erro ao validar turmas:', error);
      return this.createEmptyResult<TurmaValidation[]>('turmas', ['Falha na consulta ao banco']);
    }
  }

  async validateAtividades(userId: string): Promise<ValidationResult<AtividadeValidation[]>> {
    const cacheKey = `atividades_${userId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`/api/atividades?userId=${userId}`);
      
      if (!response.ok) {
        return this.createEmptyResult<AtividadeValidation[]>('atividades', ['Erro ao consultar atividades']);
      }

      const atividades = await response.json();
      const result: ValidationResult<AtividadeValidation[]> = {
        exists: Array.isArray(atividades) && atividades.length > 0,
        count: Array.isArray(atividades) ? atividades.length : 0,
        data: Array.isArray(atividades) && atividades.length > 0 ? atividades : null,
        isEmpty: !Array.isArray(atividades) || atividades.length === 0,
        validatedAt: Date.now(),
        source: 'atividades',
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.warn('⚠️ [DataValidation] Erro ao validar atividades:', error);
      return this.createEmptyResult<AtividadeValidation[]>('atividades', ['Falha na consulta ao banco']);
    }
  }

  async validateUserContext(userId: string): Promise<UserContextValidation> {
    console.log('🔍 [DataValidation] Validando contexto completo do usuário:', userId);

    const [turmas, atividades] = await Promise.all([
      this.validateTurmas(userId),
      this.validateAtividades(userId),
    ]);

    const disciplinas = this.extractDisciplinas(turmas, atividades);
    const missingData: string[] = [];

    if (turmas.isEmpty) missingData.push('turmas');
    if (atividades.isEmpty) missingData.push('atividades');
    if (disciplinas.isEmpty) missingData.push('disciplinas');

    const result: UserContextValidation = {
      turmas,
      atividades,
      disciplinas,
      hasAnyData: !turmas.isEmpty || !atividades.isEmpty,
      missingData,
    };

    console.log('📊 [DataValidation] Contexto validado:', {
      turmas: turmas.count,
      atividades: atividades.count,
      hasAnyData: result.hasAnyData,
      missingData: result.missingData,
    });

    return result;
  }

  private extractDisciplinas(
    turmas: ValidationResult<TurmaValidation[]>,
    atividades: ValidationResult<AtividadeValidation[]>
  ): ValidationResult<string[]> {
    const disciplinas = new Set<string>();

    if (turmas.data) {
      turmas.data.forEach(t => {
        if (t.disciplina) disciplinas.add(t.disciplina);
      });
    }

    if (atividades.data) {
      atividades.data.forEach(a => {
        if (a.disciplina) disciplinas.add(a.disciplina);
      });
    }

    const data = Array.from(disciplinas);
    return {
      exists: data.length > 0,
      count: data.length,
      data: data.length > 0 ? data : null,
      isEmpty: data.length === 0,
      validatedAt: Date.now(),
      source: 'disciplinas',
    };
  }

  private createEmptyResult<T>(source: string, errors?: string[]): ValidationResult<T> {
    return {
      exists: false,
      count: 0,
      data: null,
      isEmpty: true,
      errors,
      validatedAt: Date.now(),
      source,
    };
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result as T;
    }
    return null;
  }

  private setCache(key: string, result: any): void {
    this.cache.set(key, { result, timestamp: Date.now() });
  }

  clearCache(): void {
    this.cache.clear();
  }

  formatForLLM(context: UserContextValidation): string {
    const lines: string[] = [
      '=== DADOS DISPONÍVEIS (VALIDADOS) ===',
      '',
    ];

    if (context.turmas.exists && context.turmas.data) {
      lines.push(`TURMAS ENCONTRADAS: ${context.turmas.count}`);
      context.turmas.data.forEach(t => {
        lines.push(`  - ${t.nome}${t.alunos ? ` (${t.alunos} alunos)` : ''}${t.nivel ? ` - ${t.nivel}` : ''}`);
      });
    } else {
      lines.push('TURMAS ENCONTRADAS: 0 (nenhuma turma cadastrada)');
    }

    lines.push('');

    if (context.atividades.exists && context.atividades.data) {
      lines.push(`ATIVIDADES EXISTENTES: ${context.atividades.count}`);
    } else {
      lines.push('ATIVIDADES EXISTENTES: 0 (nenhuma atividade criada)');
    }

    lines.push('');

    if (context.disciplinas.exists && context.disciplinas.data) {
      lines.push(`DISCIPLINAS IDENTIFICADAS: ${context.disciplinas.data.join(', ')}`);
    } else {
      lines.push('DISCIPLINAS IDENTIFICADAS: Nenhuma');
    }

    lines.push('');
    lines.push('=== INSTRUÇÕES OBRIGATÓRIAS ===');
    lines.push('');

    if (!context.hasAnyData) {
      lines.push('⚠️ ATENÇÃO: Não há dados cadastrados para este usuário.');
      lines.push('');
      lines.push('VOCÊ DEVE:');
      lines.push('1. Informar HONESTAMENTE que não encontrou dados');
      lines.push('2. NÃO inventar nomes de turmas, números ou estatísticas');
      lines.push('3. Sugerir ao usuário cadastrar informações ou criar conteúdo genérico');
    } else if (context.missingData.length > 0) {
      lines.push(`⚠️ DADOS PARCIAIS: Faltam ${context.missingData.join(', ')}`);
      lines.push('');
      lines.push('VOCÊ DEVE:');
      lines.push('1. Usar APENAS os dados disponíveis acima');
      lines.push('2. Informar quais dados estão faltando');
      lines.push('3. NÃO inventar dados ausentes');
    }

    lines.push('');
    lines.push('PROIBIDO:');
    lines.push('- Inventar nomes de turmas que não aparecem acima');
    lines.push('- Mencionar números de alunos não listados');
    lines.push('- Criar médias, estatísticas ou desempenhos fictícios');
    lines.push('- Assumir dados que não foram fornecidos');

    return lines.join('\n');
  }

  generateHonestResponse(context: UserContextValidation): string {
    if (!context.hasAnyData) {
      return `Não encontrei dados cadastrados ainda na sua conta.

Para criar atividades personalizadas, seria útil ter algumas informações:
• Turmas (opcional): Qual turma vai usar essas atividades?
• Disciplina: Qual matéria você leciona?
• Nível: Ensino Fundamental I, II ou Médio?

Posso criar atividades genéricas agora, ou você prefere adicionar essas informações primeiro?`;
    }

    if (context.turmas.isEmpty) {
      return `Encontrei ${context.atividades.count} atividades na sua conta, mas nenhuma turma cadastrada.

Posso criar atividades genéricas ou, se preferir, cadastre uma turma para personalizar o conteúdo.`;
    }

    return '';
  }
}

export const dataValidationService = new DataValidationService();
export default DataValidationService;
