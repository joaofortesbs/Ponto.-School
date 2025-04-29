
import { toast } from "@/components/ui/use-toast";

const DB_NAME = 'anotacoes_db';
const DB_VERSION = 1;
const ANOTACOES_STORE = 'anotacoes';
const PASTAS_STORE = 'pastas';
const PREFERENCIAS_STORE = 'preferencias';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const indexedDBManager = {
  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('Erro ao abrir IndexedDB:', event);
        reject(new Error('Erro ao abrir o IndexedDB'));
      };
      
      request.onsuccess = () => {
        const db = request.result;
        db.onerror = (event) => {
          console.error('Erro no IndexedDB:', event);
        };
        resolve(db);
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains(ANOTACOES_STORE)) {
          const anotacoesStore = db.createObjectStore(ANOTACOES_STORE, { keyPath: 'id' });
          anotacoesStore.createIndex('user_id', 'user_id', { unique: false });
        }

        if (!db.objectStoreNames.contains(PASTAS_STORE)) {
          const pastasStore = db.createObjectStore(PASTAS_STORE, { keyPath: 'id' });
          pastasStore.createIndex('user_id', 'user_id', { unique: false });
        }

        if (!db.objectStoreNames.contains(PREFERENCIAS_STORE)) {
          db.createObjectStore(PREFERENCIAS_STORE, { keyPath: 'user_id' });
        }
      };
    });
  },

  async getExpirationDays(userId: string) {
    try {
      const db = await this.openDB() as IDBDatabase;
      return new Promise((resolve) => {
        const transaction = db.transaction(PREFERENCIAS_STORE, 'readonly');
        const store = transaction.objectStore(PREFERENCIAS_STORE);
        const request = store.get(userId);

        request.onsuccess = () => {
          const preferencia = request.result;
          db.close();
          resolve(preferencia ? preferencia.expiration_days : 90);
        };
      });
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
      return 90;
    }
  },

  async saveExpirationDays(userId: string, expirationDays: number) {
    try {
      const db = await this.openDB() as IDBDatabase;
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(PREFERENCIAS_STORE, 'readwrite');
        const store = transaction.objectStore(PREFERENCIAS_STORE);
        const preferencia = { user_id: userId, expiration_days: expirationDays };
        const request = store.put(preferencia);

        request.onerror = () => reject(new Error('Erro ao salvar preferências'));
        request.onsuccess = () => {
          db.close();
          resolve(true);
        };
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as preferências",
        variant: "destructive"
      });
      throw error;
    }
  },

  async getAnotacoes(userId: string) {
    try {
      const db = await this.openDB() as IDBDatabase;
      return new Promise((resolve) => {
        const transaction = db.transaction(ANOTACOES_STORE, 'readwrite');
        const store = transaction.objectStore(ANOTACOES_STORE);
        const index = store.index('user_id');
        const request = index.getAll(userId);

        request.onsuccess = () => {
          let anotacoes = request.result || [];
          const now = new Date().toISOString();
          
          anotacoes = anotacoes.filter(anotacao => {
            if (!anotacao.expires_at) return true;
            return anotacao.expires_at > now;
          });

          const deleteExpired = anotacoes.filter(a => a.expires_at && a.expires_at <= now);
          deleteExpired.forEach(anotacao => store.delete(anotacao.id));

          db.close();
          resolve(anotacoes);
        };
      });
    } catch (error) {
      console.error('Erro ao carregar anotações:', error);
      return [];
    }
  },

  async saveAnotacao(userId: string, anotacao: any) {
    try {
      const db = await this.openDB() as IDBDatabase;
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(ANOTACOES_STORE, 'readwrite');
        const store = transaction.objectStore(ANOTACOES_STORE);
        const request = store.put({...anotacao, user_id: userId});

        request.onerror = () => reject(new Error('Erro ao salvar anotação'));
        request.onsuccess = () => {
          db.close();
          resolve(true);
        };
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a anotação",
        variant: "destructive"  
      });
      throw error;
    }
  },

  async getPastas(userId: string) {
    try {
      const db = await this.openDB() as IDBDatabase;
      return new Promise((resolve) => {
        const transaction = db.transaction(PASTAS_STORE, 'readwrite');
        const store = transaction.objectStore(PASTAS_STORE);
        const index = store.index('user_id');
        const request = index.getAll(userId);

        request.onsuccess = () => {
          let pastas = request.result || [];
          const now = new Date().toISOString();
          
          pastas = pastas.filter(pasta => {
            if (!pasta.expires_at) return true;
            return pasta.expires_at > now;
          });

          const deleteExpired = pastas.filter(p => p.expires_at && p.expires_at <= now);
          deleteExpired.forEach(pasta => store.delete(pasta.id));

          db.close();
          resolve(pastas);
        };
      });
    } catch (error) {
      console.error('Erro ao carregar pastas:', error);
      return [];
    }
  },

  async savePasta(userId: string, pasta: any) {
    try {
      const db = await this.openDB() as IDBDatabase;
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(PASTAS_STORE, 'readwrite');
        const store = transaction.objectStore(PASTAS_STORE);
        const request = store.put({...pasta, user_id: userId});

        request.onerror = () => reject(new Error('Erro ao salvar pasta'));
        request.onsuccess = () => {
          db.close();
          resolve(true);
        };
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a pasta",
        variant: "destructive"
      });
      throw error;
    }
  },

  async clearData(userId: string) {
    try {
      const db = await this.openDB() as IDBDatabase;
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([ANOTACOES_STORE, PASTAS_STORE, PREFERENCIAS_STORE], 'readwrite');
        
        const clearStore = (storeName: string) => {
          const store = transaction.objectStore(storeName);
          const index = store.index('user_id');
          const request = index.getAll(userId);
          
          request.onsuccess = () => {
            request.result.forEach((item: any) => store.delete(item.id));
          };
        };

        clearStore(ANOTACOES_STORE);
        clearStore(PASTAS_STORE);
        
        const preferenciasStore = transaction.objectStore(PREFERENCIAS_STORE);
        preferenciasStore.delete(userId);

        transaction.oncomplete = () => {
          db.close();
          resolve(true);
        };
        
        transaction.onerror = () => reject(new Error('Erro ao limpar dados'));
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível limpar os dados temporários",
        variant: "destructive"
      });
      throw error;
    }
  }
};

export default indexedDBManager;
