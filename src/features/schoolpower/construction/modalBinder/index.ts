
export { modalBinderEngine } from './modalBinderEngine';
export { getFieldMap, getAllSupportedActivityTypes, isActivityTypeSupported } from './fieldMaps';
export { parseIAResponse } from './utils/parseIAResponse';
export { fillModalField } from './utils/fieldSetter';

export type { ModalBinderConfig } from './modalBinderEngine';
export type { ActivityFieldMap } from './fieldMaps';
export type { ParsedIAResponse } from './utils/parseIAResponse';

// Sistema principal exportado como default
export { modalBinderEngine as default } from './modalBinderEngine';
