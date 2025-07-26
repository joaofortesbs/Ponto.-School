// Activity registry for School Power activities
import { ActivityType } from './types';

// Import activity components
import * as DefaultActivity from './default/EditActivity';
import * as Funcao1GrauJogo from './funcao-1grau_jogo/EditActivity';
import * as Funcao1GrauLista from './funcao-1grau_lista/EditActivity';
import * as Funcao1GrauProva from './funcao-1grau_prova/EditActivity';

export interface ActivityRegistry {
  [key: string]: {
    EditActivity: React.ComponentType<any>;
    ActivityPreview?: React.ComponentType<any>;
  };
}

export const activityRegistry: ActivityRegistry = {
  'default': {
    EditActivity: DefaultActivity.default || DefaultActivity.EditActivity,
    ActivityPreview: DefaultActivity.ActivityPreview,
  },
  'funcao-1grau_jogo': {
    EditActivity: Funcao1GrauJogo.default || Funcao1GrauJogo.EditActivity,
    ActivityPreview: Funcao1GrauJogo.ActivityPreview,
  },
  'funcao-1grau_lista': {
    EditActivity: Funcao1GrauLista.default || Funcao1GrauLista.EditActivity,
    ActivityPreview: Funcao1GrauLista.ActivityPreview,
  },
  'funcao-1grau_prova': {
    EditActivity: Funcao1GrauProva.default || Funcao1GrauProva.EditActivity,
    ActivityPreview: Funcao1GrauProva.ActivityPreview,
  },
};

export function getActivityEditor(activityType: string): React.ComponentType<any> | null {
  const activity = activityRegistry[activityType];
  return activity ? activity.EditActivity : null;
}