import {
  getTankStatusCategory,
  sortTanksBySeverity,
  calculateMetricsOverview,
  formatKiloLiters,
} from '../src/utils/tankMetrics';
import { Tank } from '../src/types';

describe('tankMetrics Utility Tests', () => {
  describe('getTankStatusCategory()', () => {
    it('mengembalikan status CRITICAL (Merah) ketika level air di bawah batas minimum', () => {
      const result = getTankStatusCategory(25, 30);
      expect(result.statusText).toBe('CRITICAL');
      expect(result.variant).toBe('critical');
      expect(result.barColor).toBe('#ef4444');
    });

    it('mengembalikan status WARNING (Kuning/Amber) ketika level air antara batas minimum dan 60%', () => {
      const result = getTankStatusCategory(45, 30);
      expect(result.statusText).toBe('WARNING');
      expect(result.variant).toBe('warning');
      expect(result.barColor).toBe('#f59e0b');
    });

    it('mengembalikan status WARNING saat level tepat 60%', () => {
      const result = getTankStatusCategory(60, 30);
      expect(result.statusText).toBe('WARNING');
      expect(result.variant).toBe('warning');
    });

    it('mengembalikan status NORMAL (Hijau) ketika level air di atas 60%', () => {
      const result = getTankStatusCategory(78, 30);
      expect(result.statusText).toBe('NORMAL');
      expect(result.variant).toBe('success');
      expect(result.barColor).toBe('#10b981');
    });

    it('menangani input NaN secara aman dengan fallback ke 0 (CRITICAL)', () => {
      const result = getTankStatusCategory(NaN, 30);
      expect(result.statusText).toBe('CRITICAL');
      expect(result.variant).toBe('critical');
    });

    it('menangani batas minimum kustom (misal: 40%) dengan akurat', () => {
      const result = getTankStatusCategory(35, 40);
      expect(result.statusText).toBe('CRITICAL');
    });
  });

  describe('sortTanksBySeverity() (PRD-Mobile § 4.1 Auto-Sort)', () => {
    const mockTanks: Tank[] = [
      {
        id: 'tank-1',
        name: 'Tangki Normal Gedung A',
        capacityLiters: 15000,
        minThresholdPercent: 30,
        maxThresholdPercent: 90,
        latestReading: {
          id: 1,
          tankId: 'tank-1',
          levelPercent: 80,
          volumeLiters: 12000,
          recordedAt: new Date().toISOString(),
        },
      },
      {
        id: 'tank-2',
        name: 'Tangki Kritis Gedung Bedah',
        capacityLiters: 10000,
        minThresholdPercent: 30,
        maxThresholdPercent: 90,
        latestReading: {
          id: 2,
          tankId: 'tank-2',
          levelPercent: 20,
          volumeLiters: 2000,
          recordedAt: new Date().toISOString(),
        },
      },
      {
        id: 'tank-3',
        name: 'Tangki Warning Gedung C',
        capacityLiters: 10000,
        minThresholdPercent: 30,
        maxThresholdPercent: 90,
        latestReading: {
          id: 3,
          tankId: 'tank-3',
          levelPercent: 50,
          volumeLiters: 5000,
          recordedAt: new Date().toISOString(),
        },
      },
      {
        id: 'tank-4',
        name: 'Tangki dengan Active Alert',
        capacityLiters: 10000,
        minThresholdPercent: 30,
        maxThresholdPercent: 90,
        activeAlert: {
          id: 99,
          tankId: 'tank-4',
          level: 'CRITICAL',
          message: 'Peringatan sensor abnormal',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        latestReading: {
          id: 4,
          tankId: 'tank-4',
          levelPercent: 70,
          volumeLiters: 7000,
          recordedAt: new Date().toISOString(),
        },
      },
    ];

    it('mengurutkan tangki: tangki kritis & ber-alert aktif selalu di posisi teratas', () => {
      const sorted = sortTanksBySeverity(mockTanks);
      
      // Dua tangki teratas harus bertingkat bahaya rank 3 (tank-2 atau tank-4)
      expect(['tank-2', 'tank-4']).toContain(sorted[0].id);
      expect(['tank-2', 'tank-4']).toContain(sorted[1].id);

      // Tangki warning di posisi berikutnya
      expect(sorted[2].id).toBe('tank-3');

      // Tangki normal di posisi paling akhir
      expect(sorted[3].id).toBe('tank-1');
    });

    it('menangani input array kosong ([]) dengan mengembalikan array kosong', () => {
      const sorted = sortTanksBySeverity([]);
      expect(sorted).toEqual([]);
    });
  });

  describe('calculateMetricsOverview()', () => {
    it('menghitung total kapasitas, volume air, dan peringatan aktif dengan benar', () => {
      const sampleTanks: Tank[] = [
        {
          id: '1',
          name: 'Tank 1',
          capacityLiters: 15000,
          minThresholdPercent: 30,
          maxThresholdPercent: 90,
          latestReading: {
            id: 1,
            tankId: '1',
            levelPercent: 80,
            volumeLiters: 12000,
            recordedAt: new Date().toISOString(),
          },
        },
        {
          id: '2',
          name: 'Tank 2',
          capacityLiters: 10000,
          minThresholdPercent: 30,
          maxThresholdPercent: 90,
          activeAlert: {
            id: 1,
            tankId: '2',
            level: 'CRITICAL',
            message: 'Air menipis',
            status: 'active',
            createdAt: new Date().toISOString(),
          },
          latestReading: {
            id: 2,
            tankId: '2',
            levelPercent: 20,
            volumeLiters: 2000,
            recordedAt: new Date().toISOString(),
          },
        },
      ];

      const metrics = calculateMetricsOverview(sampleTanks);
      expect(metrics.totalCapacity).toBe(25000);
      expect(metrics.totalWater).toBe(14000);
      expect(metrics.activeAlertsCount).toBe(1);
      expect(metrics.percentageFilled).toBe('56'); // (14000 / 25000) * 100 = 56%
    });

    it('mengembalikan nilai 0 jika daftar tangki kosong', () => {
      const metrics = calculateMetricsOverview([]);
      expect(metrics.totalCapacity).toBe(0);
      expect(metrics.totalWater).toBe(0);
      expect(metrics.activeAlertsCount).toBe(0);
      expect(metrics.percentageFilled).toBe('0');
    });
  });

  describe('formatKiloLiters()', () => {
    it('memformat angka liter menjadi format kiloliter ringkas', () => {
      expect(formatKiloLiters(15000)).toBe('15.0k L');
      expect(formatKiloLiters(24800)).toBe('24.8k L');
      expect(formatKiloLiters(0)).toBe('0.0k L');
      expect(formatKiloLiters(NaN)).toBe('0.0k L');
    });
  });
});
