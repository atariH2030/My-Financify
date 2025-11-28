import React, { useEffect, useRef, DependencyList } from 'react';

/**
 * useDebounce - Hook para debounce de valores
 * Otimiza performance em buscas e inputs
 * 
 * @param value - Valor a ser debounced
 * @param delay - Delay em ms (padrão: 500ms)
 * @returns Valor debounced
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useThrottle - Hook para throttle de funções
 * Limita frequência de execução (útil em scroll, resize)
 * 
 * @param callback - Função a ser throttled
 * @param delay - Delay em ms (padrão: 500ms)
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const lastRun = useRef(Date.now());

  return React.useCallback(
    ((...args) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        lastRun.current = now;
        return callback(...args);
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * useLocalStorage - Hook para localStorage com type safety
 * Sincroniza estado com localStorage automaticamente
 * 
 * @param key - Chave do localStorage
 * @param initialValue - Valor inicial
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = React.useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error saving localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * useIntersectionObserver - Hook para lazy loading
 * Detecta quando elemento entra no viewport
 * 
 * @param options - IntersectionObserver options
 */
export function useIntersectionObserver(
  options?: IntersectionObserverInit
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return [ref, isIntersecting];
}

/**
 * useAsync - Hook para operações assíncronas
 * Gerencia loading, error e data states
 */
interface UseAsyncState<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: DependencyList = []
): UseAsyncState<T> {
  const [state, setState] = React.useState<UseAsyncState<T>>({
    loading: true,
    error: null,
    data: null
  });

  React.useEffect(() => {
    let mounted = true;

    setState({ loading: true, error: null, data: null });

    asyncFunction()
      .then(data => {
        if (mounted) {
          setState({ loading: false, error: null, data });
        }
      })
      .catch(error => {
        if (mounted) {
          setState({ loading: false, error, data: null });
        }
      });

    return () => {
      mounted = false;
    };
  }, dependencies);

  return state;
}

/**
 * useMediaQuery - Hook para media queries responsivas
 * Detecta tamanho da tela e adaptações
 * 
 * @param query - Media query CSS
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(
    () => window.matchMedia(query).matches
  );

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * useOnClickOutside - Hook para detectar clique fora do elemento
 * Útil para fechar modais, dropdowns, etc.
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void
): React.RefObject<T | null> {
  const ref = React.useRef<T | null>(null);

  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const element = ref.current;
      if (!element || element.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler]);

  return ref;
}
