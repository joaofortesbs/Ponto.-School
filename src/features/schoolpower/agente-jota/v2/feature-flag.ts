const STORAGE_KEY = 'agente-jota-v2-enabled';

export function isV2Enabled(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'false') return false;
    return true;
  } catch {
    return true;
  }
}

export function enableV2(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
    console.log('✅ [FeatureFlag] Agente Jota v2 ATIVADO');
  } catch {
    console.warn('⚠️ [FeatureFlag] Falha ao salvar feature flag');
  }
}

export function disableV2(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'false');
    console.log('🔙 [FeatureFlag] Agente Jota v2 DESATIVADO (usando v1)');
  } catch {
    console.warn('⚠️ [FeatureFlag] Falha ao salvar feature flag');
  }
}

export function toggleV2(): boolean {
  const current = isV2Enabled();
  if (current) {
    disableV2();
  } else {
    enableV2();
  }
  return !current;
}

if (typeof window !== 'undefined') {
  (window as any).__jotaV2 = {
    enable: enableV2,
    disable: disableV2,
    toggle: toggleV2,
    isEnabled: isV2Enabled,
  };
}
