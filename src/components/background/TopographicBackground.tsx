import { useEffect, useRef } from 'react';
import { PerlinNoise } from '../../utils/perlin';
import styles from './TopographicBackground.module.css';

type RGB = { r: number; g: number; b: number };

const elevationColors: { threshold: number; color: RGB }[] = [
  { threshold: 0.0, color: { r: 123, g: 148, b: 163 } },
  { threshold: 0.15, color: { r: 147, g: 168, b: 179 } },
  { threshold: 0.25, color: { r: 172, g: 191, b: 198 } },
  { threshold: 0.3, color: { r: 194, g: 207, b: 207 } },
  { threshold: 0.35, color: { r: 224, g: 215, b: 193 } },
  { threshold: 0.4, color: { r: 196, g: 206, b: 181 } },
  { threshold: 0.5, color: { r: 173, g: 191, b: 169 } },
  { threshold: 0.6, color: { r: 155, g: 176, b: 156 } },
  { threshold: 0.7, color: { r: 195, g: 186, b: 165 } },
  { threshold: 0.8, color: { r: 184, g: 174, b: 157 } },
  { threshold: 0.88, color: { r: 208, g: 203, b: 193 } },
  { threshold: 0.95, color: { r: 245, g: 242, b: 233 } },
];

const contourColors = {
  water: 'rgba(85,112,128,0.16)',
  land: 'rgba(105,112,91,0.18)',
  mountain: 'rgba(115,106,94,0.22)',
};

const cellSize = 6;
const noiseScale = 0.04;
const contourLevels = 20;
const maxPixels = 480_000;
const paletteSteps = 1024;

function getColor(e: number): [number, number, number] {
  for (let i = 0; i < elevationColors.length - 1; i++) {
    const c0 = elevationColors[i],
      c1 = elevationColors[i + 1];
    if (e >= c0.threshold && e < c1.threshold) {
      const t = (e - c0.threshold) / (c1.threshold - c0.threshold);
      const r = Math.floor(c0.color.r + (c1.color.r - c0.color.r) * t);
      const g = Math.floor(c0.color.g + (c1.color.g - c0.color.g) * t);
      const b = Math.floor(c0.color.b + (c1.color.b - c0.color.b) * t);
      return [r, g, b];
    }
  }
  const last = elevationColors[elevationColors.length - 1].color;
  return [last.r, last.g, last.b];
}

// Interpolate once rather than searching the color stops for every viewport pixel.
const palette = new Uint8ClampedArray(paletteSteps * 3);
for (let i = 0; i < paletteSteps; i++) {
  palette.set(getColor(i / (paletteSteps - 1)), i * 3);
}

export default function TopographicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const perlin = new PerlinNoise();
    let frame: number | null = null;

    const render = () => {
      frame = null;
      const viewportWidth = Math.max(1, window.innerWidth);
      const viewportHeight = Math.max(1, window.innerHeight);
      // CSS stretches the small bitmap; both pixel work and the terrain grid stay bounded.
      const scale = Math.min(0.5, Math.sqrt(maxPixels / (viewportWidth * viewportHeight)));
      const width = Math.max(1, Math.floor(viewportWidth * scale));
      const height = Math.max(1, Math.floor(viewportHeight * scale));
      canvas.width = width;
      canvas.height = height;

      const cols = Math.ceil(width / cellSize) + 2;
      const rows = Math.ceil(height / cellSize) + 2;
      const grid = new Float32Array(cols * rows);
      const terrainScale = cellSize / (12 * scale) * noiseScale;

      // generateTerrain
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = y * cols + x;
          // Preserve the terrain's CSS-space scale as the render resolution changes.
          const e = perlin.terrainNoise(x * terrainScale, y * terrainScale, 0.5, 4, 0.55, 2);
          grid[idx] = Math.pow(e, 1.2);
        }
      }

      const sampleGrid = (x: number, y: number): number => {
        const gx = x / cellSize,
          gy = y / cellSize;
        const x0 = Math.floor(gx),
          x1 = Math.min(x0 + 1, cols - 1);
        const y0 = Math.floor(gy),
          y1 = Math.min(y0 + 1, rows - 1);
        const sx = gx - x0,
          sy = gy - y0;
        const v00 = grid[y0 * cols + x0],
          v10 = grid[y0 * cols + x1],
          v01 = grid[y1 * cols + x0],
          v11 = grid[y1 * cols + x1];
        const v0 = v00 * (1 - sx) + v10 * sx;
        const v1 = v01 * (1 - sx) + v11 * sx;
        return v0 * (1 - sy) + v1 * sy;
      };

      // renderBackground
      const img = ctx.createImageData(width, height);
      const d = img.data;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const e = sampleGrid(x, y);
          const color = Math.min(paletteSteps - 1, Math.max(0, Math.round(e * (paletteSteps - 1)))) * 3;
          const i = (y * width + x) * 4;
          d[i] = palette[color];
          d[i + 1] = palette[color + 1];
          d[i + 2] = palette[color + 2];
          d[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);

      // renderContours
      for (let level = 0; level < contourLevels; level++) {
        const threshold = level / contourLevels;
        ctx.beginPath();
        let style = contourColors.land;
        if (threshold < 0.35) style = contourColors.water;
        else if (threshold > 0.8) style = contourColors.mountain;
        ctx.strokeStyle = style;
        ctx.lineWidth = (level % 5 === 0 ? 1.2 : 0.5) * scale;

        for (let y = 0; y < rows - 1; y++) {
          for (let x = 0; x < cols - 1; x++) {
            const i = y * cols + x;
            const tl = grid[i],
              tr = grid[i + 1],
              bl = grid[i + cols],
              br = grid[i + cols + 1];
            const state =
              (((tl > threshold) as unknown as number) << 3) |
              (((tr > threshold) as unknown as number) << 2) |
              (((br > threshold) as unknown as number) << 1) |
              ((bl > threshold) as unknown as number);
            if (state && state !== 15) {
              const px = x * cellSize,
                py = y * cellSize,
                s = cellSize;
              const lerp = (a: number, b: number) => (threshold - a) / (b - a);
              switch (state) {
                case 1:
                case 14:
                  ctx.moveTo(px, py + s * lerp(tl, bl));
                  ctx.lineTo(px + s * lerp(bl, br), py + s);
                  break;
                case 2:
                case 13:
                  ctx.moveTo(px + s * lerp(bl, br), py + s);
                  ctx.lineTo(px + s, py + s * lerp(tr, br));
                  break;
                case 3:
                case 12:
                  ctx.moveTo(px, py + s * lerp(tl, bl));
                  ctx.lineTo(px + s, py + s * lerp(tr, br));
                  break;
                case 4:
                case 11:
                  ctx.moveTo(px + s * lerp(tl, tr), py);
                  ctx.lineTo(px + s, py + s * lerp(tr, br));
                  break;
                case 6:
                case 9:
                  ctx.moveTo(px + s * lerp(tl, tr), py);
                  ctx.lineTo(px + s * lerp(bl, br), py + s);
                  break;
                case 7:
                case 8:
                  ctx.moveTo(px, py + s * lerp(tl, bl));
                  ctx.lineTo(px + s * lerp(tl, tr), py);
                  break;
              }
            }
          }
        }
        ctx.stroke();
      }
    };

    const scheduleRender = () => {
      if (frame === null) frame = requestAnimationFrame(render);
    };
    scheduleRender();
    window.addEventListener('resize', scheduleRender);
    return () => {
      window.removeEventListener('resize', scheduleRender);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
