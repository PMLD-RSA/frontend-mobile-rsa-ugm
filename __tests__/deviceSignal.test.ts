import {
  getSignalQuality,
  formatDeviceTime,
  isGatewayOnline,
} from '../src/utils/deviceSignal';
import { Gateway } from '../src/types';

describe('deviceSignal Utility Suite', () => {
  describe('getSignalQuality', () => {
    it('returns excellent for strong RSSI >= -80 dBm', () => {
      const result = getSignalQuality(-72, false);
      expect(result.level).toBe('excellent');
      expect(result.label).toBe('Sangat Kuat');
      expect(result.badgeVariant).toBe('success');
      expect(result.bars).toBe(4);
    });

    it('returns fair for moderate RSSI between -80 dBm and -95 dBm', () => {
      const result = getSignalQuality(-88, false);
      expect(result.level).toBe('fair');
      expect(result.label).toBe('Sedang');
      expect(result.badgeVariant).toBe('warning');
      expect(result.bars).toBe(2);
    });

    it('returns poor for weak RSSI < -95 dBm', () => {
      const result = getSignalQuality(-105, false);
      expect(result.level).toBe('poor');
      expect(result.label).toBe('Lemah');
      expect(result.badgeVariant).toBe('critical');
      expect(result.bars).toBe(1);
    });

    it('returns offline when node is marked offline or RSSI is missing', () => {
      const offlineResult = getSignalQuality(-70, true);
      expect(offlineResult.level).toBe('offline');
      expect(offlineResult.label).toBe('Terputus');
      expect(offlineResult.badgeVariant).toBe('critical');
      expect(offlineResult.bars).toBe(0);

      const nullRssi = getSignalQuality(null, false);
      expect(nullRssi.level).toBe('offline');
    });
  });

  describe('formatDeviceTime', () => {
    it('returns Belum ada data when input is empty or null', () => {
      expect(formatDeviceTime(null)).toBe('Belum ada data');
      expect(formatDeviceTime(undefined)).toBe('Belum ada data');
    });

    it('returns Baru saja for recent timestamps', () => {
      const recent = new Date(Date.now() - 10 * 1000).toISOString();
      expect(formatDeviceTime(recent)).toBe('Baru saja');
    });

    it('formats minutes ago properly', () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      expect(formatDeviceTime(fiveMinAgo)).toBe('5 mnt lalu');
    });

    it('formats hours ago properly', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      expect(formatDeviceTime(twoHoursAgo)).toBe('2 jam lalu');
    });

    it('handles invalid date strings gracefully', () => {
      expect(formatDeviceTime('invalid-date')).toBe('Format waktu tidak valid');
    });
  });

  describe('isGatewayOnline', () => {
    it('returns true when gateway status is online', () => {
      const gw: Gateway = {
        id: 'gw-1',
        deviceCode: 'GW-HUB-01',
        status: 'online',
        lastHeartbeat: new Date().toISOString(),
      };
      expect(isGatewayOnline(gw)).toBe(true);
    });

    it('returns false when gateway is offline or null', () => {
      const gw: Gateway = {
        id: 'gw-2',
        deviceCode: 'GW-HUB-02',
        status: 'offline',
      };
      expect(isGatewayOnline(gw)).toBe(false);
      expect(isGatewayOnline(null)).toBe(false);
      expect(isGatewayOnline(undefined)).toBe(false);
    });
  });
});
