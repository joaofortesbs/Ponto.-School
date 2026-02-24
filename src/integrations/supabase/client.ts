/**
 * SUPABASE STUB — cliente compatível sem dependência externa
 *
 * O Ponto School usa Neon PostgreSQL via backend Express.
 * Este stub implementa a mesma interface do @supabase/supabase-js
 * lendo auth do localStorage e roteando DB calls para o backend.
 */

// ─── Tipos mínimos compatíveis ────────────────────────────────────────────────

export type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  created_at?: string;
};

export type SupabaseSession = {
  user: SupabaseUser;
  access_token: string;
  refresh_token?: string;
};

// ─── Helpers de localStorage ──────────────────────────────────────────────────

function getStoredUser(): SupabaseUser | null {
  try {
    const raw =
      localStorage.getItem('currentUser') ||
      localStorage.getItem('userProfile') ||
      localStorage.getItem('auth_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.id || parsed?.email) {
      return {
        id: parsed.id || parsed.user_id || String(parsed.email),
        email: parsed.email,
        user_metadata: parsed.user_metadata || parsed,
        app_metadata: {},
        created_at: parsed.created_at,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function getStoredSession(): SupabaseSession | null {
  const user = getStoredUser();
  if (!user) return null;
  return {
    user,
    access_token: localStorage.getItem('auth_token') || 'local-session',
  };
}

// ─── Auth stub ────────────────────────────────────────────────────────────────

const authListeners: Array<(event: string, session: SupabaseSession | null) => void> = [];

function notifyListeners(event: string, session: SupabaseSession | null) {
  authListeners.forEach(cb => {
    try { cb(event, session); } catch { /* ignore */ }
  });
}

const auth = {
  async getUser() {
    const user = getStoredUser();
    return { data: { user }, error: null };
  },

  async getSession() {
    const session = getStoredSession();
    return { data: { session }, error: null };
  },

  onAuthStateChange(callback: (event: string, session: SupabaseSession | null) => void) {
    authListeners.push(callback);
    // Dispara imediatamente com o estado atual
    const session = getStoredSession();
    setTimeout(() => callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session), 0);
    return {
      data: {
        subscription: {
          unsubscribe() {
            const idx = authListeners.indexOf(callback);
            if (idx > -1) authListeners.splice(idx, 1);
          },
        },
      },
    };
  },

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    try {
      const res = await fetch('/api/perfis/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        return { data: { user: null, session: null }, error: { message: json.error || 'Credenciais inválidas' } };
      }

      const user: SupabaseUser = {
        id: json.data.id || email,
        email: json.data.email || email,
        user_metadata: json.data,
        app_metadata: {},
        created_at: json.data.created_at,
      };
      const session: SupabaseSession = { user, access_token: 'local-session' };

      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('userEmail', email);
      notifyListeners('SIGNED_IN', session);

      return { data: { user, session }, error: null };
    } catch (e: any) {
      return { data: { user: null, session: null }, error: { message: e.message } };
    }
  },

  async signUp({
    email,
    password,
    options,
  }: {
    email: string;
    password: string;
    options?: { data?: Record<string, any> };
  }) {
    try {
      const body = {
        email,
        senha: password,
        nome_completo: options?.data?.full_name || options?.data?.nome_completo || '',
        nome_usuario: options?.data?.username || options?.data?.nome_usuario || email.split('@')[0],
        ...(options?.data || {}),
      };

      const res = await fetch('/api/perfis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        return { data: { user: null, session: null }, error: { message: json.error || 'Erro ao criar conta' } };
      }

      const user: SupabaseUser = {
        id: json.data?.id || email,
        email,
        user_metadata: json.data || {},
        app_metadata: {},
      };
      const session: SupabaseSession = { user, access_token: 'local-session' };

      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('userEmail', email);
      notifyListeners('SIGNED_IN', session);

      return { data: { user, session }, error: null };
    } catch (e: any) {
      return { data: { user: null, session: null }, error: { message: e.message } };
    }
  },

  async signOut() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('profile_context_v4');
    notifyListeners('SIGNED_OUT', null);
    return { error: null };
  },

  async resetPasswordForEmail(email: string, _options?: any) {
    console.warn('[Supabase Stub] resetPasswordForEmail não implementado. Email:', email);
    return { data: {}, error: null };
  },

  async updateUser(updates: { password?: string; data?: Record<string, any> }) {
    console.warn('[Supabase Stub] updateUser stub:', updates);
    return { data: { user: getStoredUser() }, error: null };
  },
};

// ─── Query Builder stub ───────────────────────────────────────────────────────

function makeQueryBuilder(): any {
  const noop = () => queryBuilder;
  const queryBuilder: any = {
    select: noop,
    insert: noop,
    update: noop,
    delete: noop,
    upsert: noop,
    eq: noop,
    neq: noop,
    gt: noop,
    gte: noop,
    lt: noop,
    lte: noop,
    like: noop,
    ilike: noop,
    in: noop,
    is: noop,
    filter: noop,
    match: noop,
    order: noop,
    limit: noop,
    range: noop,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: any) => resolve({ data: [], error: null }),
  };
  return queryBuilder;
}

// ─── Storage stub ─────────────────────────────────────────────────────────────

const storage = {
  from(_bucket: string) {
    return {
      upload: async () => ({ data: null, error: null }),
      download: async () => ({ data: null, error: null }),
      getPublicUrl: (_path: string) => ({ data: { publicUrl: '' } }),
      remove: async () => ({ data: null, error: null }),
      list: async () => ({ data: [], error: null }),
    };
  },
};

// ─── Cliente principal ────────────────────────────────────────────────────────

export const supabase = {
  auth,
  storage,
  from(_table: string) {
    return makeQueryBuilder();
  },
  channel(_name: string) {
    return {
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
      subscribe: () => ({ unsubscribe: () => {} }),
    };
  },
  removeChannel: () => {},
};

export type Database = Record<string, any>;

export default supabase;
