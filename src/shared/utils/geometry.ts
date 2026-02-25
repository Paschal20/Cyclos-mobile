export interface Point {
  x: number;
  y: number;
}

export interface PolarPoint {
  radius: number;
  angle: number;
}

export function polarToCartesian(radius: number, angle: number): Point {
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  };
}

export function polarToCartesianFromCenter(
  centerX: number,
  centerY: number,
  radius: number,
  angle: number
): Point {
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}

export function cartesianToPolar(x: number, y: number): PolarPoint {
  return {
    radius: Math.sqrt(x * x + y * y),
    angle: Math.atan2(y, x),
  };
}

export function getWedgePoints(
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): Point[] {
  const points: Point[] = [];
  const steps = 20;
  
  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / steps);
    points.push(polarToCartesian(innerRadius, angle));
  }
  
  for (let i = steps; i >= 0; i--) {
    const angle = startAngle + (endAngle - startAngle) * (i / steps);
    points.push(polarToCartesian(outerRadius, angle));
  }
  
  return points.map(p => ({ x: p.x + centerX, y: p.y + centerY }));
}

export function getCirclePoints(
  centerX: number,
  centerY: number,
  radius: number,
  count: number
): Point[] {
  const points: Point[] = [];
  const angleStep = (2 * Math.PI) / count;
  
  for (let i = 0; i < count; i++) {
    const angle = i * angleStep - Math.PI / 2;
    points.push(polarToCartesian(radius, angle));
  }
  
  return points.map(p => ({ x: p.x + centerX, y: p.y + centerY }));
}

export function getRingPoints(
  centerX: number,
  centerY: number,
  ringRadius: number,
  count: number
): Point[] {
  return getCirclePoints(centerX, centerY, ringRadius, count);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
