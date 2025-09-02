// Mapear os campos dos custom fields para os campos do modal
    let activityFormData: any = {
      title: activity.personalizedTitle || activity.title || '',
      description: activity.personalizedDescription || activity.description || ''
    };

    // Mapear campos específicos baseado no tipo de atividade
    if (activity.id === 'plano-aula') {
      activityFormData = {
        ...activityFormData,
        subject: customFields['Componente Curricular'] || customFields['Disciplina'] || 'Matemática',
        theme: customFields['Tema ou Tópico Central'] || customFields['Tema'] || '',
        schoolYear: customFields['Ano/Série Escolar'] || customFields['Ano de Escolaridade'] || '',
        objectives: customFields['Objetivo Geral'] || customFields['Objetivos'] || '',
        materials: customFields['Materiais/Recursos'] || customFields['Materiais'] || '',
        context: customFields['Perfil da Turma'] || customFields['Contexto'] || '',
        competencies: customFields['Habilidades BNCC'] || customFields['Competências'] || '',
        timeLimit: customFields['Carga Horária'] || customFields['Tempo Estimado'] || '',
        difficultyLevel: customFields['Tipo de Aula'] || customFields['Metodologia'] || 'Expositiva',
        evaluation: customFields['Observações do Professor'] || customFields['Avaliação'] || ''
      };
    } else if (activity.id === 'sequencia-didatica') {
      activityFormData = {
        ...activityFormData,
        tituloTemaAssunto: customFields['Título do Tema / Assunto'] || '',
        anoSerie: customFields['Ano / Série'] || '',
        disciplina: customFields['Disciplina'] || '',
        bnccCompetencias: customFields['BNCC / Competências'] || '',
        publicoAlvo: customFields['Público-alvo'] || '',
        objetivosAprendizagem: customFields['Objetivos de Aprendizagem'] || '',
        quantidadeAulas: customFields['Quantidade de Aulas'] || '',
        quantidadeDiagnosticos: customFields['Quantidade de Diagnósticos'] || '',
        quantidadeAvaliacoes: customFields['Quantidade de Avaliações'] || '',
        cronograma: customFields['Cronograma'] || ''
      };
    } else if (activity.id === 'quadro-interativo') {
      activityFormData = {
        ...activityFormData,
        subject: customFields['Disciplina / Área de conhecimento'] || customFields['Disciplina'] || 'Matemática',
        schoolYear: customFields['Ano / Série'] || customFields['Ano de Escolaridade'] || '6º Ano',
        theme: customFields['Tema ou Assunto da aula'] || customFields['Tema'] || '',
        objectives: customFields['Objetivo de aprendizagem da aula'] || customFields['Objetivos'] || '',
        difficultyLevel: customFields['Nível de Dificuldade'] || 'Intermediário',
        quadroInterativoCampoEspecifico: customFields['Atividade mostrada'] || customFields['quadroInterativoCampoEspecifico'] || ''
      };
    } else if (activity.id === 'quiz-interativo') {
      activityFormData = {
        ...activityFormData,
        numberOfQuestions: customFields['Número de Questões'] || customFields['Quantidade de Questões'] || '10',
        theme: customFields['Tema'] || '',
        subject: customFields['Disciplina'] || 'Matemática',
        schoolYear: customFields['Ano de Escolaridade'] || '6º Ano - Ensino Fundamental',
        difficultyLevel: customFields['Nível de Dificuldade'] || 'Médio',
        questionModel: customFields['Formato'] || customFields['Modelo de Questões'] || 'Múltipla Escolha',
        objectives: customFields['Objetivos'] || '',
        materials: customFields['Materiais'] || '',
        instructions: customFields['Instruções'] || '',
        evaluation: customFields['Critérios de Avaliação'] || '',
        timeLimit: customFields['Tempo Limite'] || '',
        context: customFields['Contexto de Aplicação'] || '',
        format: customFields['Formato do Quiz'] || '',
        timePerQuestion: customFields['Tempo por Questão'] || ''
      };
    } else if (activity.id === 'flash-cards') {
      activityFormData = {
        ...activityFormData,
        theme: customFields['Tema'] || customFields['tema'] || customFields['Tema dos Flash Cards'] || '',
        topicos: customFields['Tópicos'] || customFields['topicos'] || customFields['Tópicos Principais'] || '',
        numberOfFlashcards: customFields['Número de Flash Cards'] || customFields['numeroFlashcards'] || customFields['Quantidade de Flash Cards'] || '10',
        context: customFields['Contexto'] || customFields['contexto'] || customFields['Contexto de Uso'] || '',
        subject: customFields['Disciplina'] || 'Geral',
        schoolYear: customFields['Ano de Escolaridade'] || '',
        difficultyLevel: customFields['Nível de Dificuldade'] || 'Médio'
      };
    } else {
      // Campos genéricos para outras atividades
      activityFormData = {
        ...activityFormData,
        subject: customFields['Disciplina'] || customFields['disciplina'] || 'Português',
        theme: customFields['Tema'] || customFields['tema'] || '',
        schoolYear: customFields['Ano de Escolaridade'] || customFields['anoEscolaridade'] || '',
        numberOfQuestions: customFields['Quantidade de Questões'] || customFields['quantidadeQuestoes'] || '10',
        difficultyLevel: customFields['Nível de Dificuldade'] || customFields['nivelDificuldade'] || 'Médio',
        questionModel: customFields['Modelo de Questões'] || customFields['modeloQuestoes'] || '',
        objectives: customFields['Objetivos'] || customFields['objetivos'] || '',
        materials: customFields['Materiais'] || customFields['materiais'] || '',
        context: customFields['Contexto de Aplicação'] || customFields['contexto'] || ''
      };
    }

    // Validar se os campos necessários estão preenchidos
    const isValidForBuild = (() => {
      if (!activityFormData.title?.trim()) return false;
      if (!activityFormData.description?.trim()) return false;

      // Validações específicas por tipo
      if (activity.id === 'plano-aula') {
        return !!(activityFormData.subject?.trim() && 
                 activityFormData.theme?.trim() && 
                 activityFormData.schoolYear?.trim() && 
                 activityFormData.objectives?.trim());
      } else if (activity.id === 'sequencia-didatica') {
        return !!(activityFormData.tituloTemaAssunto?.trim() && 
                 activityFormData.anoSerie?.trim() && 
                 activityFormData.disciplina?.trim() && 
                 activityFormData.publicoAlvo?.trim());
      } else if (activity.id === 'quadro-interativo') {
        return !!(activityFormData.subject?.trim() && 
                 activityFormData.theme?.trim() && 
                 activityFormData.schoolYear?.trim() && 
                 activityFormData.objectives?.trim());
      } else if (activity.id === 'quiz-interativo') {
        return !!(activityFormData.numberOfQuestions?.trim() && 
                 activityFormData.theme?.trim() && 
                 activityFormData.subject?.trim() && 
                 activityFormData.schoolYear?.trim());
      } else if (activity.id === 'flash-cards') {
        return !!(activityFormData.theme?.trim() && 
                 activityFormData.topicos?.trim() && 
                 activityFormData.numberOfFlashcards?.trim() && 
                 parseInt(activityFormData.numberOfFlashcards) > 0);
      }

      // Validação genérica
      return !!(activityFormData.subject?.trim() && activityFormData.theme?.trim());
    })();