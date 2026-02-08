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
  const blocks: StructuredResponseBlock[] = [];

  const markerRegex = /\[\[(ATIVIDADES|ARQUIVO:([^\]]+))\]\]/g;

  let lastIndex = 0;
  let match;

  while ((match = markerRegex.exec(text)) !== null) {
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
          const artTitle = a.metadata?.titulo?.toLowerCase() || '';
          const searchTitle = titulo.toLowerCase();
          return artTitle.includes(searchTitle) || searchTitle.includes(artTitle);
        });

        if (artifact) {
          blocks.push({
            type: 'artifact_card',
            artifact: artifact,
          });
        }
      }
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex).trim();
    if (remaining) {
      blocks.push({ type: 'text', content: remaining });
    }
  }

  if (blocks.length === 0 || !text.includes('[[')) {
    blocks.length = 0;
    blocks.push({ type: 'text', content: text });

    if (items.activities.length > 0) {
      blocks.push({ type: 'activities_card', activities: items.activities });
    }

    for (const artifact of items.artifacts) {
      blocks.push({ type: 'artifact_card', artifact });
    }
  }

  return blocks;
}
