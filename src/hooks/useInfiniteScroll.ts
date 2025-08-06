import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll(
  callback: () => void,
  hasMore: boolean,
  options: UseInfiniteScrollOptions = {}
) {
  const [isFetching, setIsFetching] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  const { threshold = 1.0, rootMargin = '0px' } = options;

  const ref = useCallback((node: HTMLElement | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isFetching) {
          setIsFetching(true);
          callback();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [element, hasMore, isFetching, callback, threshold, rootMargin]);

  useEffect(() => {
    if (isFetching) {
      const timer = setTimeout(() => setIsFetching(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isFetching]);

  return { ref, isFetching };
}