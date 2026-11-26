import {
  generateTempPassword,
  formatUserDate,
  ROLE_CONFIGS,
} from '../src/utils/userManagement';

describe('userManagement Utility Suite', () => {
  describe('generateTempPassword', () => {
    it('generates a password starting with RSA- and ending with !', () => {
      const pwd = generateTempPassword();
      expect(pwd.startsWith('RSA-')).toBe(true);
      expect(pwd.endsWith('!')).toBe(true);
      expect(pwd.length).toBe(9); // RSA- (4) + 4 chars + ! (1) = 9
    });

    it('generates unique passwords across multiple calls', () => {
      const set = new Set<string>();
      for (let i = 0; i < 20; i += 1) {
        set.add(generateTempPassword());
      }
      expect(set.size).toBeGreaterThan(15);
    });
  });

  describe('formatUserDate', () => {
    it('returns default fallback when string is empty or undefined', () => {
      expect(formatUserDate(undefined)).toBe('Baru ditambahkan');
      expect(formatUserDate('')).toBe('Baru ditambahkan');
    });

    it('formats valid ISO date strings in Indonesian locale', () => {
      const formatted = formatUserDate('2026-09-14T06:00:00.000Z');
      expect(formatted).toContain('14');
      expect(formatted).toContain('2026');
    });

    it('handles invalid date string gracefully', () => {
      expect(formatUserDate('invalid-date')).toBe('Waktu tidak valid');
    });
  });

  describe('ROLE_CONFIGS', () => {
    it('has valid definitions for all supported roles', () => {
      expect(ROLE_CONFIGS.admin.label).toBe('Administrator');
      expect(ROLE_CONFIGS.operator.label).toBe('Operator Lapangan');
      expect(ROLE_CONFIGS.viewer.label).toBe('Pengamat / Viewer');
    });
  });
});
