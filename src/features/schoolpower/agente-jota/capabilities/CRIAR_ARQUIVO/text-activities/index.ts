export { TextActivityRegistry } from './text-activity-registry';
export { detectActivityType, getActivitySuggestions } from './text-activity-detector';
export { routeActivityRequest, isTextActivity, getPromptForRoute } from './text-activity-router';
export { AutoEvolutionEngine } from './auto-evolution-engine';

export type {
  TextActivityTemplate,
  TextActivityCategory,
  TextActivityCategoryId,
  AutoEvolvedTemplate,
  TextActivityRouterResult,
} from './text-activity-types';

export { INTERACTIVE_ACTIVITY_TYPES } from './text-activity-types';
