import { Tank, TankStatusCategory } from '../types';

export interface TankStatusResult {
  variant: 'success' | 'warning' | 'critical';
  statusText: TankStatusCategory;
  barColor: string;
}

export interface MetricsOverviewResult {
  totalCapacity: number;
  totalWater: number;
  activeAlertsCount: number;
  percentageFilled: string;
}

/**
 * Menentukan klasifikasi status tangki berdasarkan ambang batas PRD-Mobile:
 * - < minThreshold (default 30%) = CRITICAL (Merah)
 * - minThreshold s.d. 60% = WARNING (Kuning/Amber)
 * - > 60% = NORMAL (Hijau)
 */
export function getTankStatusCategory(
  levelPercent: number,
  minThreshold: number = 30
): TankStatusResult {
  const safeLevel = isNaN(levelPercent) ? 0 : Number(levelPercent);
  const safeMinThreshold = isNaN(minThreshold) ? 30 : Number(minThreshold);

  if (safeLevel < safeMinThreshold) {
    return {
      variant: 'critical',
      statusText: 'CRITICAL',
      barColor: '#ef4444',
    };
  }

  if (safeLevel <= 60) {
    return {
      variant: 'warning',
      statusText: 'WARNING',
      barColor: '#f59e0b',
    };
  }

  return {
    variant: 'success',
    statusText: 'NORMAL',
    barColor: '#10b981',
  };
}

/**
 * Memberikan skor tingkat bahaya tangki untuk pengurutan:
 * Rank 3: CRITICAL (Level < minThreshold atau ada activeAlert)
 * Rank 2: WARNING (Level 30% - 60%)
 * Rank 1: NORMAL (Level > 60%)
 */
export function getTankSeverityRank(tank: Tank): number {
  const level = Number(tank.latestReading?.levelPercent || 0);
  const minThreshold = Number(tank.minThresholdPercent || 30);

  if (tank.activeAlert || level < minThreshold) {
    return 3;
  }
  if (level <= 60) {
    return 2;
  }
  return 1;
}

/**
 * Mengurutkan tangki otomatis berdasarkan tingkat keparahan (PRD-Mobile.md § 4.1):
 * Tangki yang kritis atau memiliki peringatan aktif ditempatkan paling atas.
 */
export function sortTanksBySeverity(tanks: Tank[]): Tank[] {
  if (!Array.isArray(tanks)) {
    return [];
  }
  return [...tanks].sort((a, b) => getTankSeverityRank(b) - getTankSeverityRank(a));
}

/**
 * Menghitung ringkasan metrik dashboard seluruh tangki
 */
export function calculateMetricsOverview(tanks: Tank[]): MetricsOverviewResult {
  if (!Array.isArray(tanks) || tanks.length === 0) {
    return {
      totalCapacity: 0,
      totalWater: 0,
      activeAlertsCount: 0,
      percentageFilled: '0',
    };
  }

  const totalCapacity = tanks.reduce(
    (acc, t) => acc + (Number(t.capacityLiters) || 0),
    0
  );
  const totalWater = tanks.reduce(
    (acc, t) => acc + (Number(t.latestReading?.volumeLiters) || 0),
    0
  );
  const activeAlertsCount = tanks.filter((t) => t.activeAlert != null).length;
  const percentageFilled =
    totalCapacity > 0 ? ((totalWater / totalCapacity) * 100).toFixed(0) : '0';

  return {
    totalCapacity,
    totalWater,
    activeAlertsCount,
    percentageFilled,
  };
}

/**
 * Memformat volume air ke bentuk ringkas kiloliter (contoh: 15.0k L)
 */
export function formatKiloLiters(liters: number): string {
  const safeLiters = isNaN(liters) ? 0 : Number(liters);
  return `${(safeLiters / 1000).toFixed(1)}k L`;
}
