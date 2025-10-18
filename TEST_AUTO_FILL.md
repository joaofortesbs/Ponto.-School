# Teste de Auto-Fill - Tese de Redação

## Passo a Passo para Testar

### 1. Preparar os Dados (Simular clique no ActionPlanCard)
Abra o console do navegador e execute:

```javascript
// Simular dados salvos pelo ActionPlanCard
const testData = {
  formData: {
    title: "Atividade de Teste",
    description: "Descrição de teste",
    temaRedacao: "Desafios da Educação Digital no Século XXI",
    objetivo: "Elaborar teses claras sobre educação digital",
    nivelDificuldade: "Médio",
    competenciasENEM: "Competência II e III",
    contextoAdicional: "Considere aspectos como acesso à tecnologia e inclusão digital"
  },
  timestamp: Date.now()
};

// Salvar em múltiplas chaves
localStorage.setItem('auto_activity_data_tese-redacao', JSON.stringify(testData));
localStorage.setItem('auto_activity_data_tese-redacao', JSON.stringify(testData));
localStorage.setItem('tese_redacao_form_data', JSON.stringify(testData));

console.log('✅ Dados de teste salvos no localStorage!');
```

### 2. Abrir o Modal de Editar Materiais
1. Vá para School Power > Construção
2. Clique na atividade "tese-redacao"
3. Clique em "Editar Materiais"

### 3. Verificar Logs no Console
Procure pelos seguintes logs:
- `🔄 [AUTO-LOAD] Iniciando carregamento`
- `✅ [AUTO-LOAD] Dados encontrados`
- `🎉 [AUTO-LOAD] SUCESSO! FormData carregado`
- `🔥 [MODAL] Aplicando dados do hook useActivityAutoLoad`
- `✅ [MODAL] formData atualizado com dados auto-carregados!`

### 4. Verificar Campos Preenchidos
Os seguintes campos devem estar preenchidos automaticamente:
- **Tema da Redação**: "Desafios da Educação Digital no Século XXI"
- **Objetivo**: "Elaborar teses claras sobre educação digital"
- **Nível de Dificuldade**: "Médio"
- **Competências ENEM**: "Competência II e III"
- **Contexto Adicional**: "Considere aspectos como acesso à tecnologia e inclusão digital"

## Debug

Se os campos não estiverem preenchidos, verifique:

1. **Hook está sendo chamado?**
```javascript
// Adicione no useActivityAutoLoad (linha 49)
console.log('%c🔄 [AUTO-LOAD] Hook chamado!', 'background: yellow; color: black; padding: 5px;', { activityId, isOpen });
```

2. **Dados estão sendo carregados?**
```javascript
// Verifique no console se vê:
// "✅ [AUTO-LOAD] Dados encontrados na chave: auto_activity_data_tese-redacao"
```

3. **Dados estão sendo aplicados ao formData?**
```javascript
// Adicione no useEffect do EditActivityModal (linha 623)
console.log('%c📥 [MODAL] AutoLoadedData recebido:', 'background: purple; color: white; padding: 5px;', autoLoadedData);
```

## Limpar Dados de Teste

```javascript
localStorage.removeItem('auto_activity_data_tese-redacao');
localStorage.removeItem('tese_redacao_form_data');
console.log('🗑️ Dados de teste removidos!');
```
