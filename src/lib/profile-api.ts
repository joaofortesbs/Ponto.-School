let inFlightByEmail: Map<string, Promise<any>> = new Map();
let inFlightById: Map<string, Promise<any>> = new Map();
let cachedProfile: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000;

export async function fetchProfileByEmail(email: string): Promise<any> {
  if (inFlightByEmail.has(email)) {
    return inFlightByEmail.get(email);
  }
  
  if (cachedProfile && cachedProfile.data?.email === email) {
    if (Date.now() - cachedProfile.timestamp < CACHE_DURATION) {
      return { success: true, data: cachedProfile.data };
    }
  }
  
  const promise = (async () => {
    try {
      const response = await fetch(`/api/perfis?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      
      if (result.success && result.data) {
        cachedProfile = { data: result.data, timestamp: Date.now() };
      }
      
      return result;
    } finally {
      inFlightByEmail.delete(email);
    }
  })();
  
  inFlightByEmail.set(email, promise);
  return promise;
}

export async function fetchProfileById(id: string): Promise<any> {
  if (inFlightById.has(id)) {
    return inFlightById.get(id);
  }
  
  if (cachedProfile && cachedProfile.data?.id === id) {
    if (Date.now() - cachedProfile.timestamp < CACHE_DURATION) {
      return { success: true, data: cachedProfile.data };
    }
  }
  
  const promise = (async () => {
    try {
      const response = await fetch(`/api/perfis?id=${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      
      if (result.success && result.data) {
        cachedProfile = { data: result.data, timestamp: Date.now() };
      }
      
      return result;
    } finally {
      inFlightById.delete(id);
    }
  })();
  
  inFlightById.set(id, promise);
  return promise;
}

export function getCachedProfile(): any | null {
  if (cachedProfile && Date.now() - cachedProfile.timestamp < CACHE_DURATION) {
    return cachedProfile.data;
  }
  return null;
}

export function invalidateProfileCache(): void {
  cachedProfile = null;
}
