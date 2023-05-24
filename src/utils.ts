export function cross(a: number[], b: number[]) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

export function subtractVectors(a: number[], b: number[]) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function normalize(v: number[]) {
  const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  // 确定不会除以 0
  if (length > 0.00001) {
    return [v[0] / length, v[1] / length, v[2] / length];
  } else {
    return [0, 0, 0];
  }
}
