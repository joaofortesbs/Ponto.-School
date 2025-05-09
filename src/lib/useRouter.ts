
import { useCallback } from 'react';

export const useRouter = () => {
  const push = useCallback((path: string) => {
    window.location.href = path;
  }, []);

  const replace = useCallback((path: string) => {
    window.location.replace(path);
  }, []);
  
  const back = useCallback(() => {
    window.history.back();
  }, []);

  return {
    push,
    replace,
    back,
    pathname: window.location.pathname,
    query: Object.fromEntries(new URLSearchParams(window.location.search)),
  };
};

export default useRouter;
