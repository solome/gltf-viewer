const PI_2 = Math.PI * 2

export function formatRad(rad: number) {
  return ((rad % PI_2) + PI_2) % PI_2
}
