import { AulaSalva } from './aulasStorageService';

const dbName = 'PontoEscola';
const storeName = 'aulas';

const abrirDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onerror = () => {
      console.error('📚 [INDEXED_DB] Erro ao abrir banco de dados');
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('📚 [INDEXED_DB] Banco de dados aberto com sucesso');
      resolve(request.result);
    };

    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
        console.log('📚 [INDEXED_DB] Object store criado');
      }
    };
  });
};

export const aulasIndexedDBService = {
  async salvarAulaIndexedDB(aula: AulaSalva): Promise<AulaSalva> {
    try {
      const db = await abrirDB();
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      return new Promise((resolve, reject) => {
        const request = store.put(aula);

        request.onsuccess = () => {
          console.log('📚 [INDEXED_DB_SAVE] Aula salva com sucesso:', aula.id);
          resolve(aula);
        };

        request.onerror = () => {
          console.error('📚 [INDEXED_DB_SAVE_ERROR]', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('📚 [INDEXED_DB_ERROR]', error);
      throw error;
    }
  },

  async listarAulasIndexedDB(): Promise<AulaSalva[]> {
    try {
      const db = await abrirDB();
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const aulas = request.result as AulaSalva[];
          console.log('📚 [INDEXED_DB_LIST] Aulas carregadas:', aulas.length);
          resolve(aulas);
        };

        request.onerror = () => {
          console.error('📚 [INDEXED_DB_LIST_ERROR]', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('📚 [INDEXED_DB_ERROR]', error);
      return [];
    }
  },

  async buscarAulaIndexedDB(id: string): Promise<AulaSalva | null> {
    try {
      const db = await abrirDB();
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('📚 [INDEXED_DB_ERROR]', error);
      return null;
    }
  },

  async excluirAulaIndexedDB(id: string): Promise<boolean> {
    try {
      const db = await abrirDB();
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('📚 [INDEXED_DB_DELETE] Aula excluída:', id);
          resolve(true);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('📚 [INDEXED_DB_ERROR]', error);
      return false;
    }
  },

  async limparTodasAulasIndexedDB(): Promise<void> {
    try {
      const db = await abrirDB();
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('📚 [INDEXED_DB_CLEAR] Todas as aulas foram removidas');
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('📚 [INDEXED_DB_ERROR]', error);
    }
  }
};

export default aulasIndexedDBService;
