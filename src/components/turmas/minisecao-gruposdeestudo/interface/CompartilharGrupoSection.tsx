// Atualizar o código local quando o prop mudar
  useEffect(() => {
    if (grupoCodigo) {
      setCodigoLocalExibido(grupoCodigo);
      setCopiado(false);
      console.log("Código do grupo atualizado no componente:", grupoCodigo);

      // Salvar o código em armazenamento persistente como backup adicional
      try {
        // Usar o nome do grupo como parte da chave para facilitar debug
        const nomeSeguro = grupoNome.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 15);
        localStorage.setItem(`codigo_grupo_${nomeSeguro}_${Date.now()}`, grupoCodigo);
        sessionStorage.setItem(`codigo_grupo_atual_${nomeSeguro}`, grupoCodigo);
      } catch (storageError) {
        console.error("Erro ao salvar backup do código:", storageError);
      }
    } else if (onGerarCodigo) {
      // Se não houver código e existir a função para gerar, chamá-la automaticamente
      console.log("Não há código definido, gerando automaticamente...");

      // Sistema de retry - tentar várias vezes com delay progressivo
      const tentarGerarCodigo = (tentativa = 1) => {
        if (tentativa > 5) {
          console.error("Falha após 5 tentativas de gerar código");
          return;
        }

        console.log(`Tentativa ${tentativa} de gerar código automático`);

        setTimeout(() => {
          if (!codigoLocalExibido && onGerarCodigo) {
            onGerarCodigo().catch(error => {
              console.error(`Erro na tentativa ${tentativa}:`, error);
              // Tentar novamente com atraso maior
              tentarGerarCodigo(tentativa + 1);
            });
          }
        }, 800 * tentativa); // Aumentar o atraso a cada tentativa
      };

      // Iniciar o processo de retry
      tentarGerarCodigo();
    }
  }, [grupoCodigo, onGerarCodigo, grupoNome]);

  // Efeito adicional para verificar o código após a montagem completa do componente
  useEffect(() => {
    // Verificações múltiplas em tempos diferentes para garantir que o código seja gerado
    const verificacoes = [1500, 3000, 6000, 10000];

    const verificadores: NodeJS.Timeout[] = [];

    verificacoes.forEach(tempo => {
      const timer = setTimeout(() => {
        if (!codigoLocalExibido && !grupoCodigo && onGerarCodigo) {
          console.log(`Verificação em ${tempo}ms: código não encontrado, gerando...`);
          onGerarCodigo().catch(error => {
            console.error(`Erro na verificação ${tempo}ms:`, error);
          });
        }
      }, tempo);

      verificadores.push(timer);
    });

    // Verificar armazenamento local para códigos salvos anteriormente
    const verificarCodigosExistentes = () => {
      if (!codigoLocalExibido && !grupoCodigo) {
        try {
          // Buscar em todas as chaves que possam conter códigos
          const todasChaves = Object.keys(localStorage);
          const chavesCodigo = todasChaves.filter(chave => 
            chave.includes('codigo_grupo') || chave.includes('_codigo_') || chave.includes('grupo_codigo')
          );

          // Se encontramos possíveis chaves com códigos, tentar usá-las
          if (chavesCodigo.length > 0) {
            console.log(`Encontradas ${chavesCodigo.length} possíveis fontes de código`);

            for (const chave of chavesCodigo) {
              try {
                const codigoSalvo = localStorage.getItem(chave);
                if (codigoSalvo && codigoSalvo.length >= 7) {
                  console.log(`Recuperado código ${codigoSalvo} da chave ${chave}`);
                  setCodigoLocalExibido(codigoSalvo);
                  return true;
                }
              } catch {}
            }
          }
        } catch (storageError) {
          console.error("Erro ao verificar códigos existentes:", storageError);
        }
        return false;
      }
      return true;
    };

    // Executar verificação de códigos existentes após um curto delay
    setTimeout(verificarCodigosExistentes, 1000);

    return () => {
      // Limpar todos os timers ao desmontar
      verificadores.forEach(timer => clearTimeout(timer));
    };
  }, [codigoLocalExibido, grupoCodigo, onGerarCodigo]);

  // Verificação final contínua para garantir que sempre temos um código
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Se ainda não temos código depois de todas as tentativas anteriores, 
      // fazer uma última tentativa a cada 5 segundos
      if (!codigoLocalExibido && !grupoCodigo && onGerarCodigo) {
        console.log("Verificação periódica: código ainda não gerado, tentando novamente");
        onGerarCodigo().catch(error => {
          console.error("Erro na verificação periódica:", error);
        });
      } else {
        // Se já temos o código, podemos limpar o intervalo
        clearInterval(intervalId);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [codigoLocalExibido, grupoCodigo, onGerarCodigo]);