import type { StructuredResponseBlock, ActivitySummaryUI, PredictiveSuggestion } from '../types/message-types';
import type { ArtifactData } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/types';

export interface CollectedItems {
  activities: ActivitySummaryUI[];
  artifacts: ArtifactData[];
}

function sanitizeResponseText(text: string): string {
  let cleaned = text;
  cleaned = cleaned.replace(/```json[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/\[?\{[\s\S]*?"id"\s*:\s*"[\s\S]*?\}\]?/g, '');
  cleaned = cleaned.replace(/^\s*[\[\{](?!\[)[\s\S]*?[\]\}]\s*$/gm, '');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.trim();
  return cleaned || text;
}

const PHASE_CONFIG: Record<string, { emoji: string; color: string }> = {
  'engajamento': { emoji: '🎯', color: '#f59e0b' },
  'aquecimento': { emoji: '🎯', color: '#f59e0b' },
  'introducao': { emoji: '🎯', color: '#f59e0b' },
  'introdução': { emoji: '🎯', color: '#f59e0b' },
  'diagnostico': { emoji: '🎯', color: '#f59e0b' },
  'conteudo': { emoji: '🧠', color: '#8b5cf6' },
  'conteúdo': { emoji: '🧠', color: '#8b5cf6' },
  'ensino': { emoji: '🧠', color: '#8b5cf6' },
  'desenvolvimento': { emoji: '🧠', color: '#8b5cf6' },
  'pratica': { emoji: '📝', color: '#3b82f6' },
  'prática': { emoji: '📝', color: '#3b82f6' },
  'fixacao': { emoji: '📝', color: '#3b82f6' },
  'fixação': { emoji: '📝', color: '#3b82f6' },
  'exercicios': { emoji: '📝', color: '#3b82f6' },
  'avaliacao': { emoji: '✅', color: '#10b981' },
  'avaliação': { emoji: '✅', color: '#10b981' },
  'fechamento': { emoji: '✅', color: '#10b981' },
  'encerramento': { emoji: '✅', color: '#10b981' },
  'complementos': { emoji: '📂', color: '#6366f1' },
  'documentos': { emoji: '📂', color: '#6366f1' },
  'materiais': { emoji: '📦', color: '#6366f1' },
};

function detectPhaseEmoji(title: string): string {
  const lower = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [key, config] of Object.entries(PHASE_CONFIG)) {
    const keyNorm = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (lower.includes(keyNorm)) return config.emoji;
  }
  return '📋';
}

function mergeConsecutiveActivityCards(blocks: StructuredResponseBlock[]): StructuredResponseBlock[] {
  const merged: StructuredResponseBlock[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (block.type === 'single_activity_card' && block.activity) {
      const group: ActivitySummaryUI[] = [block.activity];

      while (i + 1 < blocks.length && blocks[i + 1].type === 'single_activity_card' && blocks[i + 1].activity) {
        i++;
        group.push(blocks[i].activity!);
      }

      if (group.length >= 2) {
        merged.push({ type: 'activities_card', activities: group });
      } else {
        merged.push(block);
      }
    } else {
      merged.push(block);
    }
  }

  return merged;
}

export function parseStructuredResponse(
  text: string,
  items: CollectedItems
): StructuredResponseBlock[] {
  if (!text || typeof text !== 'string') {
    const fallbackBlocks: StructuredResponseBlock[] = [
      { type: 'text', content: 'Processo concluído com sucesso!' }
    ];
    if (items.activities.length > 0) {
      fallbackBlocks.push({ type: 'activities_card', activities: items.activities });
    }
    for (const artifact of items.artifacts) {
      fallbackBlocks.push({ type: 'artifact_card', artifact });
    }
    return fallbackBlocks;
  }

  const sanitizedText = sanitizeResponseText(text);
  const blocks: StructuredResponseBlock[] = [];
  const markerRegex = /\[\[(ATIVIDADES|ATIVIDADE:([^\]]+)|ARQUIVO:([^\]]+)|FASE:([^\]]+)|SUGESTAO:([^\]]+))\]\]/g;
  let hasMarkers = false;
  let lastIndex = 0;
  let match;
  let activitiesCardAdded = false;
  const usedArtifactIds = new Set<string>();
  const usedActivityIds = new Set<string>();
  const collectedSuggestions: PredictiveSuggestion[] = [];

  const normalizeStr = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/gi, '').trim();

  function findActivityByTitle(titulo: string): ActivitySummaryUI | undefined {
    const searchNorm = normalizeStr(titulo);
    const searchWords = searchNorm.split(/\s+/).filter(w => w.length > 2);

    return items.activities.find(a => {
      if (usedActivityIds.has(a.id)) return false;
      const actTitle = a.titulo || '';
      const actNorm = normalizeStr(actTitle);
      if (actNorm === searchNorm) return true;
      if (actNorm.includes(searchNorm) || searchNorm.includes(actNorm)) return true;
      const matchingWords = searchWords.filter(w => actNorm.includes(w));
      return matchingWords.length >= Math.max(1, searchWords.length * 0.5);
    });
  }

  while ((match = markerRegex.exec(sanitizedText)) !== null) {
    hasMarkers = true;

    if (match.index > lastIndex) {
      const textBefore = sanitizedText.substring(lastIndex, match.index).trim();
      if (textBefore) {
        blocks.push({ type: 'text', content: textBefore });
      }
    }

    const fullMarker = match[1];

    if (fullMarker === 'ATIVIDADES') {
      if (items.activities.length > 0 && !activitiesCardAdded) {
        const remainingActivities = items.activities.filter(a => !usedActivityIds.has(a.id));
        if (remainingActivities.length > 0) {
          blocks.push({
            type: 'activities_card',
            activities: remainingActivities,
          });
          remainingActivities.forEach(a => usedActivityIds.add(a.id));
        }
        activitiesCardAdded = true;
      }
    } else if (fullMarker.startsWith('ATIVIDADE:')) {
      const titulo = match[2]?.trim();
      if (titulo && items.activities.length > 0) {
        const activity = findActivityByTitle(titulo);
        if (activity) {
          usedActivityIds.add(activity.id);
          blocks.push({
            type: 'single_activity_card',
            activity: activity,
          });
        }
      }
    } else if (fullMarker.startsWith('ARQUIVO:')) {
      const titulo = match[3]?.trim();
      if (titulo && items.artifacts.length > 0) {
        const searchNorm = normalizeStr(titulo);
        const searchWords = searchNorm.split(/\s+/).filter(w => w.length > 2);

        const artifact = items.artifacts.find(a => {
          if (usedArtifactIds.has(a.id)) return false;
          const artTitle = a.metadata?.titulo || '';
          const artNorm = normalizeStr(artTitle);
          if (artNorm === searchNorm) return true;
          if (artNorm.includes(searchNorm) || searchNorm.includes(artNorm)) return true;
          const matchingWords = searchWords.filter(w => artNorm.includes(w));
          return matchingWords.length >= Math.max(1, searchWords.length * 0.5);
        });

        if (artifact) {
          usedArtifactIds.add(artifact.id);
          blocks.push({
            type: 'artifact_card',
            artifact: artifact,
          });
        }
      }
    } else if (fullMarker.startsWith('FASE:')) {
      const faseContent = match[4]?.trim() || '';
      const parts = faseContent.split('|').map(s => s.trim());
      const phaseTitle = parts[0] || 'Fase';
      const phaseDescription = parts[1] || '';
      const phaseEmoji = detectPhaseEmoji(phaseTitle);

      blocks.push({
        type: 'phase_separator',
        phaseTitle,
        phaseEmoji,
        phaseDescription,
      });
    } else if (fullMarker.startsWith('SUGESTAO:')) {
      const sugestaoContent = match[5]?.trim() || '';
      const parts = sugestaoContent.split('|').map(s => s.trim());
      if (parts.length >= 2) {
        collectedSuggestions.push({
          emoji: parts[0] || '💡',
          title: parts[1] || '',
          description: parts[2] || '',
        });
      }
    }

    lastIndex = match.index + match[0].length;
  }

  if (hasMarkers && lastIndex < sanitizedText.length) {
    const remaining = sanitizedText.substring(lastIndex).trim();
    if (remaining) {
      blocks.push({ type: 'text', content: remaining });
    }
  }

  if (!hasMarkers) {
    blocks.push({ type: 'text', content: sanitizedText });
  }

  if (!activitiesCardAdded && items.activities.length > 0) {
    const remainingActivities = items.activities.filter(a => !usedActivityIds.has(a.id));
    if (remainingActivities.length > 0) {
      blocks.push({ type: 'activities_card', activities: remainingActivities });
    }
  }

  for (const artifact of items.artifacts) {
    if (!usedArtifactIds.has(artifact.id)) {
      blocks.push({ type: 'artifact_card', artifact });
    }
  }

  const mergedBlocks = mergeConsecutiveActivityCards(blocks);

  if (collectedSuggestions.length > 0) {
    mergedBlocks.push({
      type: 'predictive_suggestions',
      suggestions: collectedSuggestions,
    });
  }

  return mergedBlocks;
}
