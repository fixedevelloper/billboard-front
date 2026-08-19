import { useEffect, useRef, useState } from "react";

/**
 * Pagination "infinite scroll" côté client : révèle `items` par tranches de `pageSize`,
 * chargeant la tranche suivante quand la sentinelle (à placer en bas de liste, via
 * `sentinelRef`) entre dans le viewport.
 */
export function useInfiniteScroll<T>(items: T[], pageSize: number) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + pageSize, items.length));
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [items.length, pageSize]);

  return {
    visibleItems: items.slice(0, visibleCount),
    hasMore: visibleCount < items.length,
    sentinelRef,
  };
}
