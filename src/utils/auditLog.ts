import { AuditLog, AuditLogCategory } from '../types';

export function getAuditLogCategory(log: AuditLog): AuditLogCategory {
  const value = (log.category || log.action || log.entity || '').toUpperCase();
  if (value.includes('AUTH') || value.includes('LOGIN') || value.includes('LOGOUT')) {
    return 'AUTH';
  }
  if (value.includes('TANK') || value.includes('THRESHOLD')) {
    return 'TANK';
  }
  if (value.includes('ALERT') || value.includes('RESOLVE')) {
    return 'ALERT';
  }
  if (value.includes('USER') || value.includes('OPERATOR')) {
    return 'USER';
  }
  return 'OTHER';
}

export function getAuditLogDescription(log: AuditLog): string {
  if (log.description?.trim()) return log.description;
  const actor = log.username?.trim() || 'Pengguna';
  return `${actor} melakukan aksi ${log.action}`;
}

export function formatRelativeTime(value: string, now: Date = new Date()): string {
  const timestamp = new Date(value).getTime();
  const currentTime = now.getTime();
  if (!Number.isFinite(timestamp) || !Number.isFinite(currentTime)) {
    return 'Waktu tidak tersedia';
  }

  const differenceInSeconds = Math.max(0, Math.floor((currentTime - timestamp) / 1000));
  if (differenceInSeconds < 60) return 'Baru saja';
  if (differenceInSeconds < 3600) return `${Math.floor(differenceInSeconds / 60)} mnt lalu`;
  if (differenceInSeconds < 86400) return `${Math.floor(differenceInSeconds / 3600)} jam lalu`;
  return `${Math.floor(differenceInSeconds / 86400)} hari lalu`;
}

export function sortAuditLogs(logs: AuditLog[]): AuditLog[] {
  return [...logs].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
  );
}
