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
        theme: customFields['Tema'] || customFields['tema'] || customFields['Tema dos Flash Cards'] || activity.title || 'Flash Cards',
        topicos: customFields['Tópicos'] || customFields['topicos'] || customFields['Tópicos Principais'] || 'Conceitos fundamentais',
        numberOfFlashcards: customFields['Número de Flash Cards'] || customFields['numeroFlashcards'] || customFields['Quantidade de Flash Cards'] || '10',
        context: customFields['Contexto'] || customFields['contexto'] || customFields['Contexto de Uso'] || 'Estudo e revisão',
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
        const hasValidTheme = activityFormData.theme?.trim() && activityFormData.theme !== '';
        const hasValidTopics = activityFormData.topicos?.trim() && activityFormData.topicos !== '';
        const hasValidNumber = activityFormData.numberOfFlashcards?.trim() && 
                              parseInt(activityFormData.numberOfFlashcards) > 0;
        return hasValidTheme && hasValidTopics && hasValidNumber;
      }

      // Validação genérica
      return !!(activityFormData.subject?.trim() && activityFormData.theme?.trim());
    })();

// Sistema robusto de armazenamento para Flash Cards
        const timestamp = Date.now();
        const baseStorageKey = `constructed_${activityType}_${activityKey}`;

        // Salvar em múltiplas chaves para garantir disponibilidade
        const storageKeys = [
          baseStorageKey,
          `constructed_${activityType}_flash-cards`,
          `flash-cards-auto-build-${timestamp}`,
          'flash-cards-data-latest'
        ];

        const storageData = {
          success: true,
          data: result.data,
          timestamp,
          activityType,
          source: 'autoBuild'
        };

        storageKeys.forEach(key => {
          localStorage.setItem(key, JSON.stringify(storageData));
        });

        // Salvar também em constructedActivities
        const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
        constructedActivities[activityKey] = {
          activityType,
          generatedContent: result.data,
          timestamp,
          source: 'autoBuild'
        };
        localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

        console.log(`✅ [AutoBuild] ${activityType} construído e salvo:`, {
          storageKeys,
          data: result.data
        });

        // Notificar o sistema centralizado se for Flash Cards
        if (activityType === 'flash-cards') {
          try {
            // Tentar acessar o FlashCardsDataManager
            setTimeout(async () => {
              try {
                const { FlashCardsDataManager } = await import('../activities/flash-cards/FlashCardsPreview');
                const manager = FlashCardsDataManager.getInstance();
                manager.updateData(result.data);
                console.log('📊 Flash Cards enviados para o manager centralizado');
              } catch (error) {
                console.warn('❌ Erro ao notificar manager centralizado:', error);
              }
            }, 100);
          } catch (error) {
            console.warn('❌ Erro ao importar FlashCardsDataManager:', error);
          }
        }

        // Sistema expandido de eventos
        const eventTypes = [
          `${activityType}-auto-build`,
          'activity-auto-built',
          'construction-completed'
        ];

        // Eventos específicos para Flash Cards
        if (activityType === 'flash-cards') {
          eventTypes.push(
            'flash-cards-generated',
            'flash-cards-content-ready',
            'flash-cards-preview-update'
          );
        }

        const eventDetail = {
          activityKey,
          data: result.data,
          success: true,
          source: 'autoBuild',
          timestamp
        };

        // Disparar todos os eventos
        eventTypes.forEach(eventType => {
          window.dispatchEvent(new CustomEvent(eventType, { detail: eventDetail }));
        });

        // Backup com delay
        setTimeout(() => {
          eventTypes.forEach(eventType => {
            window.dispatchEvent(new CustomEvent(eventType, { detail: eventDetail }));
          });
        }, 200);