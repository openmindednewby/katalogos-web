const ANGLE_OFFSET = 90;
const HALF_CIRCLE = 180;

export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angle: number,
): { x: number; y: number } {
  const rad = ((angle - ANGLE_OFFSET) * Math.PI) / HALF_CIRCLE;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function createArcPath(
  center: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(center, center, radius, endAngle);
  const end = polarToCartesian(center, center, radius, startAngle);
  const largeArc = endAngle - startAngle > HALF_CIRCLE ? 1 : 0;

  return [
    `M ${center} ${center}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}
