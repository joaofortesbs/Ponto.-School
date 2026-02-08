import type { StructuredResponseBlock, ActivitySummaryUI } from '../types/message-types';
import type { ArtifactData } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/types';

export interface CollectedItems {
  activities: ActivitySummaryUI[];
  artifacts: ArtifactData[];
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

  const blocks: StructuredResponseBlock[] = [];
  const markerRegex = /\[\[(ATIVIDADES|ARQUIVO:([^\]]+))\]\]/g;
  let hasMarkers = false;
  let lastIndex = 0;
  let match;
  const usedArtifactIds = new Set<string>();

  while ((match = markerRegex.exec(text)) !== null) {
    hasMarkers = true;

    if (match.index > lastIndex) {
      const textBefore = text.substring(lastIndex, match.index).trim();
      if (textBefore) {
        blocks.push({ type: 'text', content: textBefore });
      }
    }

    const fullMarker = match[1];

    if (fullMarker === 'ATIVIDADES') {
      if (items.activities.length > 0) {
        blocks.push({
          type: 'activities_card',
          activities: items.activities,
        });
      }
    } else if (fullMarker.startsWith('ARQUIVO:')) {
      const titulo = match[2]?.trim();
      if (titulo && items.artifacts.length > 0) {
        const artifact = items.artifacts.find(a => {
          if (usedArtifactIds.has(a.id)) return false;
          const artTitle = (a.metadata?.titulo || '').toLowerCase();
          const searchTitle = titulo.toLowerCase();
          return artTitle.includes(searchTitle) || searchTitle.includes(artTitle) ||
            artTitle.replace(/[^a-záàâãéèêíïóôõöúç\s]/gi, '').includes(searchTitle.replace(/[^a-záàâãéèêíïóôõöúç\s]/gi, ''));
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

  if (hasMarkers && lastIndex < text.length) {
    const remaining = text.substring(lastIndex).trim();
    if (remaining) {
      blocks.push({ type: 'text', content: remaining });
    }
  }

  if (!hasMarkers) {
    blocks.push({ type: 'text', content: text });
  }

  const hasActivitiesCard = blocks.some(b => b.type === 'activities_card');
  if (!hasActivitiesCard && items.activities.length > 0) {
    blocks.push({ type: 'activities_card', activities: items.activities });
  }

  for (const artifact of items.artifacts) {
    if (!usedArtifactIds.has(artifact.id)) {
      blocks.push({ type: 'artifact_card', artifact });
    }
  }

  return blocks;
}
