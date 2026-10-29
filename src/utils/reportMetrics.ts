import { WaterLevelReading } from '../types';

export interface ReadingSummary {
  latest: number;
  minimum: number;
  maximum: number;
  average: number;
}

export function getValidReadings(readings: WaterLevelReading[]): WaterLevelReading[] {
  return readings
    .filter((reading) => Number.isFinite(Number(reading.levelPercent)))
    .sort(
      (first, second) =>
        new Date(first.recordedAt).getTime() - new Date(second.recordedAt).getTime()
    );
}

export function calculateReadingSummary(readings: WaterLevelReading[]): ReadingSummary {
  const values = getValidReadings(readings).map((reading) => Number(reading.levelPercent));
  if (values.length === 0) {
    return { latest: 0, minimum: 0, maximum: 0, average: 0 };
  }

  return {
    latest: values[values.length - 1],
    minimum: Math.min(...values),
    maximum: Math.max(...values),
    average: values.reduce((total, value) => total + value, 0) / values.length,
  };
}

export function normalizeReadingValues(readings: WaterLevelReading[]): number[] {
  return getValidReadings(readings).map((reading) =>
    Math.min(100, Math.max(0, Number(reading.levelPercent)))
  );
}
