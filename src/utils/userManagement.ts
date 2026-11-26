import { BadgeVariant } from '../components/Card';
import { UserRole } from '../types';

export interface RoleConfig {
  label: string;
  badgeVariant: BadgeVariant;
  avatarBg: string;
  avatarColor: string;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    label: 'Administrator',
    badgeVariant: 'info',
    avatarBg: '#0a354c',
    avatarColor: '#ffffff',
  },
  operator: {
    label: 'Operator Lapangan',
    badgeVariant: 'warning',
    avatarBg: '#f0fdf4',
    avatarColor: '#166534',
  },
  viewer: {
    label: 'Pengamat / Viewer',
    badgeVariant: 'info',
    avatarBg: '#f8fafc',
    avatarColor: '#475569',
  },
};

/**
 * Menghasilkan kata sandi darurat sementara untuk operator yang terkunci
 * Format: RSA-<4 digit acak>!
 */
export function generateTempPassword(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  let randomPart = '';
  for (let i = 0; i < 4; i += 1) {
    const idx = Math.floor(Math.random() * chars.length);
    randomPart += chars[idx];
  }
  return `RSA-${randomPart}!`;
}

/**
 * Format tanggal pembuatan akun
 */
export function formatUserDate(isoString?: string): string {
  if (!isoString) return 'Baru ditambahkan';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'Waktu tidak valid';
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
