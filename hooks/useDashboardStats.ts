import { useCallback, useEffect, useState } from "react";

type DashboardStatsLoader<T> = () => Promise<T>;

export function useDashboardStats<T>(loadStats: DashboardStatsLoader<T>) {
  const [stats, setStats] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    loadStats()
      .then((loadedStats) => {
        if (!isCancelled) {
          setStats(loadedStats);
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setLoadError(error instanceof Error ? error.message : "Не удалось загрузить статистику");
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [loadStats, reloadKey]);

  const reload = useCallback(() => {
    setStats(null);
    setIsLoading(true);
    setLoadError("");
    setReloadKey((current) => current + 1);
  }, []);

  return { stats, isLoading, loadError, reload };
}
