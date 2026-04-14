import { useEffect, useRef } from 'react';
import { PerlinNoise } from '../../utils/perlin';
import styles from './TopographicBackground.module.css';

type RGB = { r: number; g: number; b: number };

const elevationColors: { threshold: number; color: RGB }[] = [
  { threshold: 0.0, color: { r: 5, g: 45, b: 110 } },
  { threshold: 0.15, color: { r: 15, g: 75, b: 140 } },
  { threshold: 0.25, color: { r: 35, g: 105, b: 170 } },
  { threshold: 0.3, color: { r: 65, g: 145, b: 200 } },
  { threshold: 0.35, color: { r: 235, g: 220, b: 180 } },
  { threshold: 0.4, color: { r: 140, g: 200, b: 120 } },
  { threshold: 0.5, color: { r: 80, g: 160, b: 80 } },
  { threshold: 0.6, color: { r: 50, g: 120, b: 50 } },
  { threshold: 0.7, color: { r: 140, g: 120, b: 80 } },
  { threshold: 0.8, color: { r: 120, g: 100, b: 70 } },
  { threshold: 0.88, color: { r: 140, g: 140, b: 140 } },
  { threshold: 0.95, color: { r: 250, g: 250, b: 250 } },
];

const contourColors = {
  water: 'rgba(0,50,100,0.3)',
  land: 'rgba(80,60,40,0.4)',
  mountain: 'rgba(60,60,60,0.5)',
};

const cellSize = 16;
const noiseScale = 0.03;
const contourLevels = 20;

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

export default function TopographicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const perlin = new PerlinNoise();

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      const cols = Math.ceil(width / cellSize) + 2;
      const rows = Math.ceil(height / cellSize) + 2;
      const grid = new Float32Array(cols * rows);

      // generateTerrain
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = y * cols + x;
          const e = perlin.terrainNoise(x * noiseScale, y * noiseScale, 0.5, 4, 0.55, 2);
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
          const [r, g, b] = getColor(e);
          const i = (y * width + x) * 4;
          d[i] = r;
          d[i + 1] = g;
          d[i + 2] = b;
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
        ctx.lineWidth = level % 5 === 0 ? 1.2 : 0.5;

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

    render();
    const onResize = () => render();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
