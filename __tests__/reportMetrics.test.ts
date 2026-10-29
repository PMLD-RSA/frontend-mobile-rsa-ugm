import {
  calculateReadingSummary,
  getValidReadings,
  normalizeReadingValues,
} from '../src/utils/reportMetrics';
import { WaterLevelReading } from '../src/types';

const reading = (
  id: number,
  levelPercent: string | number,
  recordedAt: string
): WaterLevelReading => ({
  id,
  tankId: 'tank-01',
  levelPercent,
  volumeLiters: 0,
  recordedAt,
});

describe('Report metrics', () => {
  it('sorts readings chronologically and calculates summary values', () => {
    const readings = [
      reading(2, '80', '2026-10-29T10:00:00.000Z'),
      reading(1, 20, '2026-10-29T08:00:00.000Z'),
      reading(3, 50, '2026-10-29T09:00:00.000Z'),
    ];

    expect(getValidReadings(readings).map((item) => item.id)).toEqual([1, 3, 2]);
    expect(calculateReadingSummary(readings)).toEqual({
      latest: 80,
      minimum: 20,
      maximum: 80,
      average: 50,
    });
  });

  it('ignores invalid levels and clamps chart values to 0-100', () => {
    const readings = [
      reading(1, 'invalid', '2026-10-29T08:00:00.000Z'),
      reading(2, -10, '2026-10-29T09:00:00.000Z'),
      reading(3, 120, '2026-10-29T10:00:00.000Z'),
    ];

    expect(getValidReadings(readings).map((item) => item.id)).toEqual([2, 3]);
    expect(normalizeReadingValues(readings)).toEqual([0, 100]);
  });

  it('returns zero summary for empty readings', () => {
    expect(calculateReadingSummary([])).toEqual({
      latest: 0,
      minimum: 0,
      maximum: 0,
      average: 0,
    });
  });
});
