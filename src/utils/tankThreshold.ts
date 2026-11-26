export function validateThresholds(min: string, max: string): string | null {
  const minValue = Number(min);
  const maxValue = Number(max);

  if (
    min.trim() === '' ||
    max.trim() === '' ||
    !Number.isFinite(minValue) ||
    !Number.isFinite(maxValue)
  ) {
    return 'Nilai minimum dan maksimum harus berupa angka.';
  }
  if (minValue < 0 || minValue > 100 || maxValue < 0 || maxValue > 100) {
    return 'Nilai ambang batas harus berada di antara 0 dan 100%.';
  }
  if (minValue >= maxValue) {
    return 'Nilai minimum harus lebih kecil dari nilai maksimum.';
  }
  return null;
}
