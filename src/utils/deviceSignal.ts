import { BadgeVariant } from '../components/Card';
import { Gateway } from '../types';

export type SignalLevel = 'excellent' | 'fair' | 'poor' | 'offline';

export interface SignalQuality {
  level: SignalLevel;
  label: string;
  color: string;
  badgeVariant: BadgeVariant;
  bars: number; // 0 to 4
}

/**
 * Mengevaluasi kualitas sinyal LoRa RSSI (dalam satuan dBm)
 * Standard LoRa:
 * - Sinyal Kuat: >= -80 dBm
 * - Sinyal Sedang: -80 dBm s.d. -95 dBm
 * - Sinyal Lemah: < -95 dBm
 */
export function getSignalQuality(
  rssi?: number | null,
  isNodeOffline?: boolean
): SignalQuality {
  if (isNodeOffline || rssi === null || rssi === undefined) {
    return {
      level: 'offline',
      label: 'Terputus',
      color: '#94a3b8',
      badgeVariant: 'critical',
      bars: 0,
    };
  }

  if (rssi >= -80) {
    return {
      level: 'excellent',
      label: 'Sangat Kuat',
      color: '#10b981',
      badgeVariant: 'success',
      bars: 4,
    };
  }

  if (rssi >= -95) {
    return {
      level: 'fair',
      label: 'Sedang',
      color: '#f59e0b',
      badgeVariant: 'warning',
      bars: 2,
    };
  }

  return {
    level: 'poor',
    label: 'Lemah',
    color: '#ef4444',
    badgeVariant: 'critical',
    bars: 1,
  };
}

/**
 * Format waktu lampau ramah baca untuk pembacaan heartbeat dan data sensor
 */
export function formatDeviceTime(isoString?: string | null): string {
  if (!isoString) return 'Belum ada data';

  const timestamp = new Date(isoString).getTime();
  if (Number.isNaN(timestamp)) return 'Format waktu tidak valid';

  const diffMs = Date.now() - timestamp;
  if (diffMs < 0) return 'Baru saja';

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 45) return 'Baru saja';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} mnt lalu`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;

  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} hari lalu`;
}

/**
 * Mengecek apakah Gateway Hub dalam status aktif/online
 */
export function isGatewayOnline(gateway?: Gateway | null): boolean {
  if (!gateway) return false;
  return gateway.status === 'online';
}
