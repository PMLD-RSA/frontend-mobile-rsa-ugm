import { validateThresholds } from '../src/utils/tankThreshold';

describe('Tank threshold validation', () => {
  it('accepts a valid range', () => {
    expect(validateThresholds('30', '90')).toBeNull();
  });

  it('rejects empty or non-numeric values', () => {
    expect(validateThresholds('', '90')).toBe('Nilai minimum dan maksimum harus berupa angka.');
    expect(validateThresholds('abc', '90')).toBe('Nilai minimum dan maksimum harus berupa angka.');
  });

  it('rejects values outside the percentage range', () => {
    expect(validateThresholds('-1', '90')).toBe('Nilai ambang batas harus berada di antara 0 dan 100%.');
    expect(validateThresholds('30', '101')).toBe('Nilai ambang batas harus berada di antara 0 dan 100%.');
  });

  it('requires minimum to be lower than maximum', () => {
    expect(validateThresholds('90', '30')).toBe('Nilai minimum harus lebih kecil dari nilai maksimum.');
    expect(validateThresholds('30', '30')).toBe('Nilai minimum harus lebih kecil dari nilai maksimum.');
  });
});
