/**
 * Vertical-jump power estimation (SPEC §7 extension, 2026-07-23). Pure
 * functions, SI units in, watts out; round at display time.
 *
 * - Sayers squat-jump equation (peak power):
 *   PP(W) = 60.7 × jump(cm) + 45.3 × mass(kg) − 2055
 *   — the equation recommended by the cross-validation study
 *   (Sayers et al. 1999, Med Sci Sports Exerc 31:572–577).
 * - Lewis formula (average power), the historical standard evaluated in
 *   the same study: P(W) = √4.9 × mass(kg) × √jump(m) × 9.81.
 */

export function sayersPeakPowerW(jumpCm: number, massKg: number): number {
  return 60.7 * jumpCm + 45.3 * massKg - 2055;
}

export function lewisAveragePowerW(jumpCm: number, massKg: number): number {
  const jumpM = jumpCm / 100;
  return Math.sqrt(4.9) * massKg * Math.sqrt(jumpM) * 9.81;
}
