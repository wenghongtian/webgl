export function resizeCanvasToDisplaySize(
  canvas: HTMLCanvasElement,
  multiplier = 1
) {
  const width = canvas.clientWidth * multiplier;
  const height = canvas.clientHeight * multiplier;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}
