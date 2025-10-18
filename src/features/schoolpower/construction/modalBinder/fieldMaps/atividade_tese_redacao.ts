import { ActivityFieldMap } from './index';

export const activityTeseRedacaoFieldMap: ActivityFieldMap = {
  'temaRedacao': 'input[name="temaRedacao"], textarea[name="temaRedacao"], [data-field="temaRedacao"]',
  'nivelDificuldade': 'select[name="nivelDificuldade"], input[name="nivelDificuldade"], [data-field="nivelDificuldade"]',
  'objetivo': 'textarea[name="objetivo"], input[name="objetivo"], [data-field="objetivo"]',
  'competenciasENEM': 'select[name="competenciasENEM"], input[name="competenciasENEM"], [data-field="competenciasENEM"]',
  'contextoAdicional': 'textarea[name="contextoAdicional"], [data-field="contextoAdicional"]'
};

export default activityTeseRedacaoFieldMap;
