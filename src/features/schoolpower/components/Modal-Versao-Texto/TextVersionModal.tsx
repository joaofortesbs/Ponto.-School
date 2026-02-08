import React, { useMemo } from 'react';
import { ArtifactViewModal } from '../../interface-chat-producao/components/ArtifactViewModal';
import type { ArtifactData, ArtifactType } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/types';
import { extractTitleFromTextContent } from './text-content-converter';

interface TextVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityType: string;
  activityTitle: string;
  textContent: string;
  activityData?: any;
}

const ACTIVITY_TYPE_MAP: Record<string, { artifactType: ArtifactType; icon: string; color: string; name: string }> = {
  'plano-aula': {
    artifactType: 'roteiro_aula',
    icon: '📄',
    color: '#F97316',
    name: 'Plano de Aula',
  },
  'sequencia-didatica': {
    artifactType: 'guia_aplicacao',
    icon: '📋',
    color: '#3B82F6',
    name: 'Sequência Didática',
  },
  'tese-redacao': {
    artifactType: 'resumo_executivo',
    icon: '✍️',
    color: '#8B5CF6',
    name: 'Tese de Redação',
  },
};

function getTypeConfig(activityType: string) {
  return ACTIVITY_TYPE_MAP[activityType] || {
    artifactType: 'roteiro_aula' as ArtifactType,
    icon: '📄',
    color: '#F97316',
    name: 'Atividade',
  };
}

function isSectionHeading(line: string): string | null {
  const trimmed = line.trim();

  const h1Match = trimmed.match(/^#{1,3}\s+(.+)$/);
  if (h1Match) return h1Match[1].replace(/\*\*/g, '');

  const boldOnlyMatch = trimmed.match(/^\*\*([^*]{3,80})\*\*\s*$/);
  if (boldOnlyMatch) {
    const candidate = boldOnlyMatch[1].trim();
    if (!candidate.includes('.') || candidate.length < 60) {
      return candidate;
    }
  }

  const knownSections = [
    'Objetivo Geral', 'Objetivos Específicos', 'Metodologia', 'Desenvolvimento',
    'Avaliação', 'Recursos', 'Materiais', 'Referências', 'Conclusão',
    'Introdução', 'Justificativa', 'Fundamentação', 'Procedimentos',
    'Resultados Esperados', 'Cronograma', 'Encerramento', 'Acolhida',
    'Atividades', 'Plano de Aula', 'Sequência Didática',
  ];
  for (const section of knownSections) {
    if (trimmed === section || trimmed === section + ':') {
      return section;
    }
  }

  return null;
}

function textContentToSections(textContent: string, activityTitle: string): { titulo: string; conteudo: string; id: string; ordem: number }[] {
  if (!textContent || textContent.trim().length === 0) {
    return [{
      id: 'empty-section',
      titulo: 'Conteúdo',
      conteudo: 'Conteúdo não disponível. Construa a atividade para gerar o conteúdo.',
      ordem: 0,
    }];
  }

  const sections: { titulo: string; conteudo: string; id: string; ordem: number }[] = [];
  const lines = textContent.split('\n');
  let currentTitle = '';
  let currentLines: string[] = [];
  let sectionIndex = 0;

  const flushSection = () => {
    const content = currentLines.join('\n').trim();
    if (content || currentTitle) {
      sections.push({
        id: `section-${sectionIndex}`,
        titulo: currentTitle || (sectionIndex === 0 ? activityTitle : 'Conteúdo'),
        conteudo: content,
        ordem: sectionIndex,
      });
      sectionIndex++;
    }
    currentLines = [];
    currentTitle = '';
  };

  for (const line of lines) {
    const heading = isSectionHeading(line);
    if (heading) {
      flushSection();
      currentTitle = heading;
    } else {
      currentLines.push(line);
    }
  }

  flushSection();

  if (sections.length === 0) {
    sections.push({
      id: 'section-0',
      titulo: activityTitle || 'Conteúdo',
      conteudo: textContent,
      ordem: 0,
    });
  }

  return sections;
}

export const TextVersionModal: React.FC<TextVersionModalProps> = ({
  isOpen,
  onClose,
  activityType,
  activityTitle,
  textContent,
  activityData,
}) => {
  const artifactData = useMemo<ArtifactData>(() => {
    const typeConfig = getTypeConfig(activityType);
    const { title, subtitle } = extractTitleFromTextContent(textContent, activityTitle);
    const sections = textContentToSections(textContent, activityTitle);

    return {
      id: `text-version-${activityData?.id || activityType}-${Date.now()}`,
      metadata: {
        tipo: typeConfig.artifactType,
        titulo: title,
        subtitulo: subtitle || `${typeConfig.name} · Versão em Texto`,
        geradoEm: Date.now(),
        sessaoId: activityData?.id || 'text-version',
        versao: '1.0',
        tags: [activityType, 'versao-texto'],
      },
      secoes: sections,
      resumoPreview: textContent.substring(0, 200),
    };
  }, [textContent, activityType, activityTitle, activityData]);

  return (
    <ArtifactViewModal
      artifact={artifactData}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};

export default TextVersionModal;
