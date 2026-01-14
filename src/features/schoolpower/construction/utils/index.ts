export { ACTIVITY_FIELD_MAPPINGS, getActivityCustomFields, mapAIDataToFormData } from './activityFieldMapping';
export type { ActivityFieldMapping } from './activityFieldMapping';

// Novo mapeamento bidirecional centralizado
export { 
  ACTIVITY_SYNC_CONFIGS,
  syncSchemaToFormData,
  syncFormDataToSchema,
  getFieldsForActivity,
  getActivitySyncConfig,
  normalizeActivityType,
  validateSyncedFields,
  mergeGeneratedFields,
  generateFieldSyncDebugReport
} from './activity-fields-sync';
export type { FieldSyncMapping, ActivitySyncConfig } from './activity-fields-sync';
