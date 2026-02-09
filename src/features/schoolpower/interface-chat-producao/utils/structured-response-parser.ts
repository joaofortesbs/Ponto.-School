import type { StructuredResponseBlock, ActivitySummaryUI } from '../types/message-types';
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
  const markerRegex = /\[\[(ATIVIDADES|ARQUIVO:([^\]]+))\]\]/g;
  let hasMarkers = false;
  let lastIndex = 0;
  let match;
  let activitiesCardAdded = false;
  const usedArtifactIds = new Set<string>();

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
        blocks.push({
          type: 'activities_card',
          activities: items.activities,
        });
        activitiesCardAdded = true;
      }
    } else if (fullMarker.startsWith('ARQUIVO:')) {
      const titulo = match[2]?.trim();
      if (titulo && items.artifacts.length > 0) {
        const normalizeStr = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/gi, '').trim();
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
    blocks.push({ type: 'activities_card', activities: items.activities });
  }

  for (const artifact of items.artifacts) {
    if (!usedArtifactIds.has(artifact.id)) {
      blocks.push({ type: 'artifact_card', artifact });
    }
  }

  return blocks;
}
