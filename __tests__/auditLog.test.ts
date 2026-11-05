import {
  formatRelativeTime,
  getAuditLogCategory,
  getAuditLogDescription,
  sortAuditLogs,
} from '../src/utils/auditLog';
import { AuditLog } from '../src/types';

const baseLog: AuditLog = {
  id: 1,
  username: 'Budi Santoso',
  action: 'ALERT_RESOLVED',
  description: 'Budi Santoso menyelesaikan Alert Tangki Atap',
  createdAt: '2026-11-05T05:00:00.000Z',
};

describe('Audit log utilities', () => {
  it('maps actions to PRD categories', () => {
    expect(getAuditLogCategory(baseLog)).toBe('ALERT');
    expect(getAuditLogCategory({ ...baseLog, action: 'USER_DISABLED' })).toBe('USER');
    expect(getAuditLogCategory({ ...baseLog, action: 'TANK_UPDATED' })).toBe('TANK');
    expect(getAuditLogCategory({ ...baseLog, action: 'LOGIN_SUCCESS' })).toBe('AUTH');
  });

  it('formats relative time and handles invalid dates', () => {
    const now = new Date('2026-11-05T06:00:00.000Z');
    expect(formatRelativeTime('2026-11-05T05:59:30.000Z', now)).toBe('Baru saja');
    expect(formatRelativeTime('2026-11-05T05:00:00.000Z', now)).toBe('1 jam lalu');
    expect(formatRelativeTime('not-a-date', now)).toBe('Waktu tidak tersedia');
  });

  it('uses a readable fallback description', () => {
    expect(getAuditLogDescription({ ...baseLog, description: null })).toBe(
      'Budi Santoso melakukan aksi ALERT_RESOLVED'
    );
  });

  it('sorts newest activity first', () => {
    const logs = [
      baseLog,
      { ...baseLog, id: 2, createdAt: '2026-11-05T06:00:00.000Z' },
    ];
    expect(sortAuditLogs(logs).map((log) => log.id)).toEqual([2, 1]);
  });
});
