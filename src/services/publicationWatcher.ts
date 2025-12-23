// Sistema global de observação de publicações
let watchers: Set<() => void> = new Set();

export const onAulaPublished = (callback: () => void) => {
  watchers.add(callback);
  console.log('[WATCHER] Novo observador registrado, total:', watchers.size);

  return () => {
    watchers.delete(callback);
    console.log('[WATCHER] Observador removido, total:', watchers.size);
  };
};

export const notifyAllWatchers = () => {
  console.log('[WATCHER_NOTIFY] 🔔 Notificando', watchers.size, 'observadores');
  watchers.forEach(watcher => {
    try {
      watcher();
    } catch (err) {
      console.error('[WATCHER_ERROR]', err);
    }
  });
};

export const clearAllWatchers = () => {
  watchers.clear();
  console.log('[WATCHER_CLEAR] Todos os observadores removidos');
};
